/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {
  sortedIndexBy,
  sortedLastIndexBy,
  property,
  sortBy as lodashSort,
} from 'lodash';

// If the dataSource becomes to large, after how many records will we start to drop items?
const dropFactor = 0.1;
const defaultLimit = 200 * 1000;

// TODO: support better minification
// TODO: separate views from datasource to be able to support multiple transformation simultanously
// TODO: expose interface with public members only
// TODO: replace forEach with faster for loops
// TODO: delete & unset operation
// TODO: support listener for input events?

type ExtractKeyType<T, KEY extends keyof T> = T[KEY] extends string
  ? string
  : T[KEY] extends number
  ? number
  : never;

type AppendEvent<T> = {
  type: 'append';
  entry: Entry<T>;
};
type UpdateEvent<T> = {
  type: 'update';
  entry: Entry<T>;
  oldValue: T;
  oldVisible: boolean;
  index: number;
};
type RemoveEvent<T> = {
  type: 'remove';
  entry: Entry<T>;
  index: number;
};
type ShiftEvent<T> = {
  type: 'shift';
  entries: Entry<T>[];
  amount: number;
};

type DataEvent<T> =
  | AppendEvent<T>
  | UpdateEvent<T>
  | RemoveEvent<T>
  | ShiftEvent<T>;

type Entry<T> = {
  value: T;
  id: number; // insertion based
  visible: boolean; // matches current filter?
  approxIndex: number; // we could possible live at this index in the output. No guarantees.
};

type Primitive = number | string | boolean | null | undefined;

type OutputChange =
  | {
      type: 'shift';
      index: number;
      location: 'before' | 'in' | 'after'; // relative to current window
      delta: number;
      newCount: number;
    }
  | {
      // an item, inside the current window, was changed
      type: 'update';
      index: number;
    }
  | {
      // something big and awesome happened. Drop earlier updates to the floor and start again
      // like: clear, filter or sorting change, etc
      type: 'reset';
      newCount: number;
    };

// TODO: remove class, export interface instead
export class DataSource<
  T,
  KEY extends keyof T = any,
  KEY_TYPE extends string | number | never = ExtractKeyType<T, KEY>
> {
  private nextId = 0;
  private _records: Entry<T>[] = [];

  private _recordsById: Map<KEY_TYPE, T> = new Map();
  private keyAttribute: undefined | keyof T;
  private idToIndex: Map<KEY_TYPE, number> = new Map();
  // if we shift the window, we increase shiftOffset, rather than remapping all values
  private shiftOffset = 0;
  limit = defaultLimit;

  private sortBy: undefined | ((a: T) => Primitive);

  private reverse: boolean = false;

  private filter?: (value: T) => boolean;

  private dataUpdateQueue: DataEvent<T>[] = [];

  windowStart = 0;
  windowEnd = 0;

  private outputChangeListener?: (change: OutputChange) => void;

  // TODO:
  // private viewRecords: T[] = [];
  // private nextViewRecords: T[] = []; // for double buffering

  /**
   * Exposed for testing.
   * This is the base view data, that is filtered and sorted, but not reversed or windowed
   */
  // TODO: optimize: output can link to _records if no sort & filter
  output: Entry<T>[] = [];

  /**
   * Returns a defensive copy of the stored records.
   * This is a O(n) operation! Prefer using .size and .get instead!
   */
  get records(): readonly T[] {
    return this._records.map(unwrap);
  }

  /**
   * returns a direct reference to the stored records as lookup map,
   * based on the key attribute set.
   * The colletion should be treated as readonly and mutable (it might change over time).
   * Create a defensive copy if needed.
   */
  get recordsById(): ReadonlyMap<KEY_TYPE, T> {
    this.assertKeySet();
    return this._recordsById;
  }

  constructor(keyAttribute: KEY | undefined) {
    this.keyAttribute = keyAttribute;
    this.setSortBy(undefined);
  }

  public get size() {
    return this._records.length;
  }

  public getRecord(index: number): T {
    return this._records[index]?.value;
  }

  public get outputSize() {
    return this.output.length;
  }

  /**
   * Returns a defensive copy of the current output.
   * Sort, filter, reverse and are applied.
   * Start and end behave like slice, and default to the currently active window.
   */
  public getOutput(
    start = this.windowStart,
    end = this.windowEnd,
  ): readonly T[] {
    if (this.reverse) {
      return this.output
        .slice(this.output.length - end, this.output.length - start)
        .reverse()
        .map((e) => e.value);
    } else {
      return this.output.slice(start, end).map((e) => e.value);
    }
  }

  private assertKeySet() {
    if (!this.keyAttribute) {
      throw new Error(
        'No key has been set. Records cannot be looked up by key',
      );
    }
  }

  private getKey(value: T): KEY_TYPE;
  private getKey(value: any): any {
    this.assertKeySet();
    const key = value[this.keyAttribute!];
    if ((typeof key === 'string' || typeof key === 'number') && key !== '') {
      return key;
    }
    throw new Error(`Invalid key value: '${key}'`);
  }

  /**
   * Returns the index of a specific key in the *source* set
   */
  indexOfKey(key: KEY_TYPE): number {
    this.assertKeySet();
    const stored = this.idToIndex.get(key);
    return stored === undefined ? -1 : stored + this.shiftOffset;
  }

  private storeIndexOfKey(key: KEY_TYPE, index: number) {
    // de-normalize the index, so that on  later look ups its corrected again
    this.idToIndex.set(key, index - this.shiftOffset);
  }

  append(value: T) {
    if (this._records.length >= this.limit) {
      // we're full! let's free up some space
      this.shift(Math.ceil(this.limit * dropFactor));
    }
    if (this.keyAttribute) {
      const key = this.getKey(value);
      if (this._recordsById.has(key)) {
        throw new Error(`Duplicate key: '${key}'`);
      }
      this._recordsById.set(key, value);
      this.storeIndexOfKey(key, this._records.length);
    }
    const entry = {
      value,
      id: ++this.nextId,
      visible: this.filter ? this.filter(value) : true,
      approxIndex: -1,
    };
    this._records.push(entry);
    this.emitDataEvent({
      type: 'append',
      entry,
    });
  }

  /**
   * Updates or adds a record. Returns `true` if the record already existed.
   * Can only be used if a key is used.
   */
  upsert(value: T): boolean {
    this.assertKeySet();
    const key = this.getKey(value);
    if (this.idToIndex.has(key)) {
      this.update(this.indexOfKey(key), value);
      return true;
    } else {
      this.append(value);
      return false;
    }
  }

  /**
   * Replaces an item in the base data collection.
   * Note that the index is based on the insertion order, and not based on the current view
   */
  update(index: number, value: T) {
    const entry = this._records[index];
    const oldValue = entry.value;
    if (value === oldValue) {
      return;
    }
    const oldVisible = entry.visible;
    entry.value = value;
    entry.visible = this.filter ? this.filter(value) : true;
    if (this.keyAttribute) {
      const key = this.getKey(value);
      const currentKey = this.getKey(oldValue);
      if (currentKey !== key) {
        this._recordsById.delete(currentKey);
        this.idToIndex.delete(currentKey);
      }
      this._recordsById.set(key, value);
      this.storeIndexOfKey(key, index);
    }
    this.emitDataEvent({
      type: 'update',
      entry,
      oldValue,
      oldVisible,
      index,
    });
  }

  /**
   * @param index
   *
   * Warning: this operation can be O(n) if a key is set
   */
  remove(index: number) {
    if (index < 0 || index >= this._records.length) {
      throw new Error('Out of bounds: ' + index);
    }
    const entry = this._records.splice(index, 1)[0];
    if (this.keyAttribute) {
      const key = this.getKey(entry.value);
      this._recordsById.delete(key);
      this.idToIndex.delete(key);
      if (index === 0) {
        // lucky happy case, this is more efficient
        this.shiftOffset -= 1;
      } else {
        // Optimization: this is O(n)! Should be done as an async job
        this.idToIndex.forEach((keyIndex, key) => {
          if (keyIndex + this.shiftOffset > index)
            this.storeIndexOfKey(key, keyIndex - 1);
        });
      }
    }
    this.emitDataEvent({
      type: 'remove',
      index,
      entry,
    });
  }

  /**
   * Removes the item with the given key from this dataSource.
   * Returns false if no record with the given key was found
   *
   * Warning: this operation can be O(n) if a key is set
   */
  removeByKey(keyValue: KEY_TYPE): boolean {
    this.assertKeySet();
    const index = this.indexOfKey(keyValue);
    if (index === -1) {
      return false;
    }
    this.remove(index);
    return true;
  }

  /**
   * Removes the first N entries.
   * @param amount
   */
  shift(amount: number) {
    amount = Math.min(amount, this._records.length);
    if (amount === this._records.length) {
      this.clear();
      return;
    }
    // increase an offset variable with amount, and correct idToIndex reads / writes with that
    this.shiftOffset -= amount;
    // removes the affected records for _records, _recordsById and idToIndex
    const removed = this._records.splice(0, amount);
    if (this.keyAttribute) {
      removed.forEach((entry) => {
        const key = this.getKey(entry.value);
        this._recordsById.delete(key);
        this.idToIndex.delete(key);
      });
    }

    this.emitDataEvent({
      type: 'shift',
      entries: removed,
      amount,
    });
  }

  setWindow(start: number, end: number) {
    this.windowStart = start;
    this.windowEnd = end;
  }

  setOutputChangeListener(
    listener: typeof DataSource['prototype']['outputChangeListener'],
  ) {
    if (this.outputChangeListener && listener) {
      console.warn('outputChangeListener already set');
    }
    this.outputChangeListener = listener;
  }

  setSortBy(sortBy: undefined | keyof T | ((a: T) => Primitive)) {
    if (this.sortBy === sortBy) {
      return;
    }
    if (typeof sortBy === 'string') {
      sortBy = property(sortBy); // TODO: it'd be great to recycle those if sortBy didn't change!
    }
    this.sortBy = sortBy as any;
    this.rebuildOutput();
  }

  setFilter(filter: undefined | ((value: T) => boolean)) {
    if (this.filter !== filter) {
      this.filter = filter;
      // TODO: this needs debouncing!
      this.rebuildOutput();
    }
  }

  toggleReversed() {
    this.setReversed(!this.reverse);
  }

  setReversed(reverse: boolean) {
    if (this.reverse !== reverse) {
      this.reverse = reverse;
      this.notifyReset(this.output.length);
    }
  }

  /**
   * The clear operation removes any records stored, but will keep the current view preferences such as sorting and filtering
   */
  clear() {
    this.windowStart = 0;
    this.windowEnd = 0;
    this._records = [];
    this._recordsById = new Map();
    this.shiftOffset = 0;
    this.idToIndex = new Map();
    this.dataUpdateQueue = [];
    this.output = [];
    this.notifyReset(0);
  }

  /**
   * The reset operation resets any view preferences such as sorting and filtering, but keeps the current set of records.
   */
  reset() {
    this.sortBy = undefined;
    // this.reverse = false;
    this.filter = undefined;
    this.rebuildOutput();
  }

  /**
   * Returns a fork of this dataSource, that shares the source data with this dataSource,
   * but has it's own FSRW pipeline, to allow multiple views on the same data
   */
  fork(): DataSource<T> {
    throw new Error(
      'Not implemented. Please contact oncall if this feature is needed',
    );
  }

  private emitDataEvent(event: DataEvent<T>) {
    this.dataUpdateQueue.push(event);
    // TODO: schedule
    this.processEvents();
  }

  private normalizeIndex(viewIndex: number): number {
    return this.reverse ? this.output.length - 1 - viewIndex : viewIndex;
  }

  getItem(viewIndex: number): T {
    return this.getEntry(viewIndex)?.value;
  }

  getEntry(viewIndex: number): Entry<T> {
    return this.output[this.normalizeIndex(viewIndex)];
  }

  private notifyItemUpdated(viewIndex: number) {
    viewIndex = this.normalizeIndex(viewIndex);
    if (
      !this.outputChangeListener ||
      viewIndex < this.windowStart ||
      viewIndex >= this.windowEnd
    ) {
      return;
    }
    this.outputChangeListener({
      type: 'update',
      index: viewIndex,
    });
  }

  private notifyItemShift(index: number, delta: number) {
    if (!this.outputChangeListener) {
      return;
    }
    let viewIndex = this.normalizeIndex(index);
    if (this.reverse && delta < 0) {
      viewIndex -= delta; // we need to correct for normalize already using the new length after applying this change
    }
    // TODO: for 'before' shifts, should the window be adjusted automatically?
    this.outputChangeListener({
      type: 'shift',
      delta,
      index: viewIndex,
      newCount: this.output.length,
      location:
        viewIndex < this.windowStart
          ? 'before'
          : viewIndex >= this.windowEnd
          ? 'after'
          : 'in',
    });
  }

  private notifyReset(count: number) {
    this.outputChangeListener?.({
      type: 'reset',
      newCount: count,
    });
  }

  private processEvents() {
    const events = this.dataUpdateQueue.splice(0);
    events.forEach(this.processEvent);
  }

  private processEvent = (event: DataEvent<T>) => {
    const {output, sortBy, filter} = this;
    switch (event.type) {
      case 'append': {
        const {entry} = event;
        if (!entry.visible) {
          // not in filter? skip this entry
          return;
        }
        if (!sortBy) {
          // no sorting? insert at the end, or beginning
          entry.approxIndex = output.length;
          output.push(entry);
          this.notifyItemShift(entry.approxIndex, 1);
        } else {
          this.insertSorted(entry);
        }
        break;
      }
      case 'update': {
        const {entry} = event;
        // short circuit; no view active so update straight away
        if (!filter && !sortBy) {
          output[event.index].approxIndex = event.index;
          this.notifyItemUpdated(event.index);
        } else if (!event.oldVisible) {
          if (!entry.visible) {
            // Done!
          } else {
            // insertion, not visible before
            this.insertSorted(entry);
          }
        } else {
          // Entry was visible previously
          const existingIndex = this.getSortedIndex(entry, event.oldValue);
          if (!entry.visible) {
            // Remove from output
            output.splice(existingIndex, 1);
            this.notifyItemShift(existingIndex, -1);
          } else {
            // Entry was and still is visible
            if (
              !this.sortBy ||
              this.sortBy(event.oldValue) === this.sortBy(entry.value)
            ) {
              // Still at same position, so done!
              this.notifyItemUpdated(existingIndex);
            } else {
              // item needs to be moved cause of sorting
              // TODO: possible optimization: if we discover that old and new index would be the same,
              // despite different sort values, we could still only emit an update
              output.splice(existingIndex, 1);
              this.notifyItemShift(existingIndex, -1);
              // find new sort index
              this.insertSorted(entry);
            }
          }
        }
        break;
      }
      case 'remove': {
        this.processRemoveEvent(event.index, event.entry);
        break;
      }
      case 'shift': {
        // no sorting? then all items are removed from the start so optimize for that
        if (!sortBy) {
          let amount = 0;
          if (!filter) {
            amount = event.amount;
          } else {
            // if there is a filter, count the visibles and shift those
            for (let i = 0; i < event.entries.length; i++)
              if (event.entries[i].visible) amount++;
          }
          output.splice(0, amount);
          this.notifyItemShift(0, -amount);
        } else {
          // we have sorting, so we need to remove item by item
          // we do this backward, so that approxIndex is more likely to be correct
          for (let i = event.entries.length - 1; i >= 0; i--) {
            this.processRemoveEvent(i, event.entries[i]);
          }
        }
        break;
      }
      default:
        throw new Error('unknown event type');
    }
  };

  private processRemoveEvent(index: number, entry: Entry<T>) {
    const {output, sortBy, filter} = this;

    // filter active, and not visible? short circuilt
    if (!entry.visible) {
      return;
    }
    // no sorting, no filter?
    if (!sortBy && !filter) {
      output.splice(index, 1);
      this.notifyItemShift(index, -1);
    } else {
      // sorting or filter is active, find the actual location
      const existingIndex = this.getSortedIndex(entry, entry.value);
      output.splice(existingIndex, 1);
      this.notifyItemShift(existingIndex, -1);
    }
  }

  private rebuildOutput() {
    const {sortBy, filter, sortHelper} = this;
    // copy base array or run filter (with side effecty update of visible)
    // TODO: pending on the size, should we batch this in smaller steps? (and maybe merely reuse append)
    let output = filter
      ? this._records.filter((entry) => {
          entry.visible = filter(entry.value);
          return entry.visible;
        })
      : this._records.slice();
    // run array.sort
    // TODO: pending on the size, should we batch this in smaller steps?
    if (sortBy) {
      output = lodashSort(output, sortHelper);
    }

    // loop output and update all aproxindeces + visibilities
    output.forEach((entry, index) => {
      entry.approxIndex = index;
      entry.visible = true;
    });
    this.output = output;
    this.notifyReset(output.length);
  }

  private sortHelper = (a: Entry<T>) =>
    this.sortBy ? this.sortBy(a.value) : a.id;

  private getSortedIndex(entry: Entry<T>, oldValue: T) {
    const {output} = this;
    if (output[entry.approxIndex] === entry) {
      // yay!
      return entry.approxIndex;
    }
    let index = sortedIndexBy(
      output,
      {
        // TODO: find a way to avoid this object construction, create a better sortHelper?
        value: oldValue,
        id: -1,
        visible: true,
        approxIndex: -1,
      },
      this.sortHelper,
    );
    index--; // TODO: this looks like a plain bug!
    // the item we are looking for is not necessarily the first one at the insertion index
    while (output[index] !== entry) {
      index++;
      if (index >= output.length) {
        throw new Error('illegal state: sortedIndex not found'); // sanity check to avoid browser freeze if people mess up with internals
      }
    }

    return index;
  }

  private insertSorted(entry: Entry<T>) {
    // apply sorting
    const insertionIndex = sortedLastIndexBy(
      this.output,
      entry,
      this.sortHelper,
    );
    entry.approxIndex = insertionIndex;
    this.output.splice(insertionIndex, 0, entry);
    this.notifyItemShift(insertionIndex, 1);
  }
}

type CreateDataSourceOptions<T, K extends keyof T> = {
  key?: K;
  limit?: number;
};

export function createDataSource<T, KEY extends keyof T = any>(
  initialSet: T[],
  options: CreateDataSourceOptions<T, KEY>,
): DataSource<T, KEY, ExtractKeyType<T, KEY>>;
export function createDataSource<T>(
  initialSet?: T[],
): DataSource<T, never, never>;
export function createDataSource<T, KEY extends keyof T>(
  initialSet: T[] = [],
  options?: CreateDataSourceOptions<T, KEY>,
): DataSource<T, any, any> {
  const ds = new DataSource<T, KEY>(options?.key);
  if (options?.limit !== undefined) {
    ds.limit = options.limit;
  }
  initialSet.forEach((value) => ds.append(value));
  return ds;
}

function unwrap<T>(entry: Entry<T>): T {
  return entry.value;
}
