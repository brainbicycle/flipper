"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3138],{3905:(e,t,r)=>{r.r(t),r.d(t,{MDXContext:()=>c,MDXProvider:()=>d,mdx:()=>v,useMDXComponents:()=>u,withMDXComponents:()=>s});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(){return i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var a in r)Object.prototype.hasOwnProperty.call(r,a)&&(e[a]=r[a])}return e},i.apply(this,arguments)}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var c=a.createContext({}),s=function(e){return function(t){var r=u(t.components);return a.createElement(e,i({},t,{components:r}))}},u=function(e){var t=a.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},d=function(e){var t=u(e.components);return a.createElement(c.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),s=u(r),d=n,f=s["".concat(o,".").concat(d)]||s[d]||m[d]||i;return r?a.createElement(f,l(l({ref:t},c),{},{components:r})):a.createElement(f,l({ref:t},c))}));function v(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,o=new Array(i);o[0]=f;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:n,o[1]=l;for(var c=2;c<i;c++)o[c]=r[c];return a.createElement.apply(null,o)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},13919:(e,t,r)=>{function a(e){return!0===/^(\w*:|\/\/)/.test(e)}function n(e){return void 0!==e&&!a(e)}r.d(t,{b:()=>a,Z:()=>n})},44996:(e,t,r)=>{r.r(t),r.d(t,{useBaseUrlUtils:()=>i,default:()=>o});var a=r(52263),n=r(13919);function i(){var e=(0,a.default)().siteConfig,t=(e=void 0===e?{}:e).baseUrl,r=void 0===t?"/":t,i=e.url;return{withBaseUrl:function(e,t){return function(e,t,r,a){var i=void 0===a?{}:a,o=i.forcePrependBaseUrl,l=void 0!==o&&o,p=i.absolute,c=void 0!==p&&p;if(!r)return r;if(r.startsWith("#"))return r;if((0,n.b)(r))return r;if(l)return t+r;var s=r.startsWith(t)?r:t+r.replace(/^\//,"");return c?e+s:s}(i,r,e,t)}}}function o(e,t){return void 0===t&&(t={}),(0,i().withBaseUrl)(e,t)}},17282:(e,t,r)=>{r.r(t),r.d(t,{frontMatter:()=>p,contentTitle:()=>c,metadata:()=>s,toc:()=>u,default:()=>m});var a=r(83117),n=r(80102),i=(r(67294),r(3905)),o=r(44996),l=["components"],p={id:"react-native",title:"React Native Support"},c=void 0,s={unversionedId:"features/react-native",id:"features/react-native",isDocsHomePage:!1,title:"React Native Support",description:"The React Native and Developer tooling teams at Facebook work in close collaboration to make sure Flipper offers top-notch value out of the box for React Native development.",source:"@site/../docs/features/react-native.mdx",sourceDirName:"features",slug:"/features/react-native",permalink:"/docs/features/react-native",editUrl:"https://github.com/facebook/flipper/blob/main/website/../docs/features/react-native.mdx",tags:[],version:"current",frontMatter:{id:"react-native",title:"React Native Support"},sidebar:"features",previous:{title:"Share Flipper Data",permalink:"/docs/features/share-flipper-data"},next:{title:"Crash Reporter",permalink:"/docs/features/plugins/crash-reporter"}},u=[{value:"Device type: React Native",id:"device-type-react-native",children:[],level:2},{value:"Native plugins for React Native",id:"native-plugins-for-react-native",children:[],level:2},{value:"Writing JavaScript plugins for React Native + Flipper",id:"writing-javascript-plugins-for-react-native--flipper",children:[{value:"Community React Native plugins for Flipper",id:"community-react-native-plugins-for-flipper",children:[],level:3}],level:2}],d={toc:u};function m(e){var t=e.components,r=(0,n.Z)(e,l);return(0,i.mdx)("wrapper",(0,a.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,i.mdx)("img",{alt:"React Native + React DevTools",src:(0,o.default)("img/react-native-react.png")}),(0,i.mdx)("p",null,"The React Native and Developer tooling teams at Facebook work in close collaboration to make sure Flipper offers top-notch value out of the box for React Native development.\nIntegration between React Native and Flipper is enabled out of the box in React Native version 0.62 and higher."),(0,i.mdx)("p",null,"\u2192 ",(0,i.mdx)("a",{parentName:"p",href:"/docs/getting-started/index#setup-your-react-native-app"},"See setup instructions for React Native")),(0,i.mdx)("center",null,(0,i.mdx)("iframe",{width:"560",height:"315",src:"https://www.youtube.com/embed/WltZTn3ODW4",frameborder:"0",allow:"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:!0}),(0,i.mdx)("br",null),(0,i.mdx)("em",null,"Flipper: The Extensible DevTool Platform for React Native")),(0,i.mdx)("h2",{id:"device-type-react-native"},"Device type: React Native"),(0,i.mdx)("p",null,"In Flipper there is a dedicated device type, \u201cReact Native\u201d, that connects to a locally running Metro instance to interact with your React Native app. This device will be detected as soon as you fire up a Metro instance by running ",(0,i.mdx)("inlineCode",{parentName:"p"},"yarn run ios")," or ",(0,i.mdx)("inlineCode",{parentName:"p"},"yarn run android")," in your project."),(0,i.mdx)("p",null,"If Metro is connected, two new buttons will appear in Flipper\u2019s main toolbar: \u201cReload\u201d and \u201cOpen Dev Menu\u201d. Both do exactly what their name suggests, without needing the agility of a pianist to get to the right keyboard combo inside your emulator. The \u201cReact Native\u201d device will feature two plugins out of the box: \u201cLogs\u201d and \u201cReact DevTools\u201d."),(0,i.mdx)("img",{alt:"React Native Action Buttons and Logs",src:(0,o.default)("img/react-native-logs.png")}),(0,i.mdx)("p",null,"The React DevTools allows you to inspect the component tree and tune the props and state of your React components."),(0,i.mdx)("p",null,"The Logs plugins will allow you to search, filter and even put watch expressions on your logging output. This offers a much richer way to interact with your logs compared to the terminal output of Metro."),(0,i.mdx)("h2",{id:"native-plugins-for-react-native"},"Native plugins for React Native"),(0,i.mdx)("p",null,"Beyond the React Native specific Flipper plugins described above, with Flipper you will also inherit the plugin eco-system that exists for native Android and iOS apps. This means that you will be able to use plugins that are aimed at native apps for your React Native app as well. Example plugins include:"),(0,i.mdx)("ul",null,(0,i.mdx)("li",{parentName:"ul"},"Device logs"),(0,i.mdx)("li",{parentName:"ul"},"Device crash reporter"),(0,i.mdx)("li",{parentName:"ul"},"Inspecting network requests"),(0,i.mdx)("li",{parentName:"ul"},"Inspecting app local databases"),(0,i.mdx)("li",{parentName:"ul"},"Inspecting device preferences"),(0,i.mdx)("li",{parentName:"ul"},"Inspecting cached images"),(0,i.mdx)("li",{parentName:"ul"},"Inspecting native layout elements")),(0,i.mdx)("h2",{id:"writing-javascript-plugins-for-react-native--flipper"},"Writing JavaScript plugins for React Native + Flipper"),(0,i.mdx)("p",null,"One of the greatest values of Flipper is its extensibility. Many teams across Facebook already have written their own one-off plugins that help with analysing very specific use cases.\nWriting plugins for Flipper doesn't require any native code, as the Flipper SDK is exposed directly to JavaScript through the ",(0,i.mdx)("a",{parentName:"p",href:"https://www.npmjs.com/package/react-native-flipper"},"react-native-flipper")," package."),(0,i.mdx)("img",{alt:"Tic Tac Toe example plugin",src:(0,o.default)("img/react-native-tictactoe.png")}),(0,i.mdx)("p",null,(0,i.mdx)("em",{parentName:"p"},"Example Flipper plugin: playing a game of Tic Tac Toe using Flipper and some emulators")),(0,i.mdx)("p",null,"If you would love to build a specific (or generic) extension for Flipper check out the following pointers! Plugins for Flipper can be distributed through NPM so sharing them is trivial."),(0,i.mdx)("ul",null,(0,i.mdx)("li",{parentName:"ul"},(0,i.mdx)("a",{parentName:"li",href:"/docs/tutorial/react-native"},"Creating a React Native Flipper Plugin")),(0,i.mdx)("li",{parentName:"ul"},(0,i.mdx)("a",{parentName:"li",href:"/docs/tutorial/js-setup"},"Create a Flipper Desktop Plugin"))),(0,i.mdx)("h3",{id:"community-react-native-plugins-for-flipper"},"Community React Native plugins for Flipper"),(0,i.mdx)("p",null,"The React Native community has also started to build plugins for Flipper."),(0,i.mdx)("ul",null,(0,i.mdx)("li",{parentName:"ul"},(0,i.mdx)("a",{parentName:"li",href:"https://infinite.red/reactotron"},"Reactotron's")," ",(0,i.mdx)("a",{parentName:"li",href:"https://github.com/infinitered/flipper-plugin-reactotron"},"Flipper plugin")," is an example of a standalone React Native desktop app, ",(0,i.mdx)("a",{parentName:"li",href:"https://shift.infinite.red/better-react-native-debugging-with-reactotron-in-flipper-6b823af29220"},"ported to work as a Flipper plugin"),".")),(0,i.mdx)("p",null,(0,i.mdx)("em",{parentName:"p"},"Got your own Flipper plugin for React Native you want to plug here? Please sent us a ",(0,i.mdx)("a",{parentName:"em",href:"https://github.com/facebook/flipper/blob/main/docs/features/react-native.mdx"},"Pull Request"),"!")))}m.isMDXComponent=!0}}]);