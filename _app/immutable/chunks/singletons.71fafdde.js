var m,v;import{w as i}from"./index.612e0734.js";const d=((m=globalThis.__sveltekit_4xq0qe)==null?void 0:m.base)??"",k=((v=globalThis.__sveltekit_4xq0qe)==null?void 0:v.assets)??d,w="1702629362296",x="sveltekit:snapshot",y="sveltekit:scroll",A="sveltekit:index",f={tap:1,hover:2,viewport:3,eager:4,off:-1};function T(t){let e=t.baseURI;if(!e){const n=t.getElementsByTagName("base");e=n.length?n[0].href:t.URL}return e}function U(){return{x:pageXOffset,y:pageYOffset}}function u(t,e){return t.getAttribute(`data-sveltekit-${e}`)}const p={...f,"":f.hover};function h(t){let e=t.assignedSlot??t.parentNode;return(e==null?void 0:e.nodeType)===11&&(e=e.host),e}function E(t,e){for(;t&&t!==e;){if(t.nodeName.toUpperCase()==="A"&&t.hasAttribute("href"))return t;t=h(t)}}function R(t,e){let n;try{n=new URL(t instanceof SVGAElement?t.href.baseVal:t.href,document.baseURI)}catch{}const o=t instanceof SVGAElement?t.target.baseVal:t.target,r=!n||!!o||b(n,e)||(t.getAttribute("rel")||"").split(/\s+/).includes("external"),s=(n==null?void 0:n.origin)===location.origin&&t.hasAttribute("download");return{url:n,external:r,target:o,download:s}}function S(t){let e=null,n=null,o=null,r=null,s=null,l=null,a=t;for(;a&&a!==document.documentElement;)o===null&&(o=u(a,"preload-code")),r===null&&(r=u(a,"preload-data")),e===null&&(e=u(a,"keepfocus")),n===null&&(n=u(a,"noscroll")),s===null&&(s=u(a,"reload")),l===null&&(l=u(a,"replacestate")),a=h(a);function c(_){switch(_){case"":case"true":return!0;case"off":case"false":return!1;default:return null}}return{preload_code:p[o??"off"],preload_data:p[r??"off"],keep_focus:c(e),noscroll:c(n),reload:c(s),replace_state:c(l)}}function g(t){const e=i(t);let n=!0;function o(){n=!0,e.update(l=>l)}function r(l){n=!1,e.set(l)}function s(l){let a;return e.subscribe(c=>{(a===void 0||n&&c!==a)&&l(a=c)})}return{notify:o,set:r,subscribe:s}}function q(){const{set:t,subscribe:e}=i(!1);let n;async function o(){clearTimeout(n);try{const r=await fetch(`${k}/_app/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(!r.ok)return!1;const s=(await r.json()).version!==w;return s&&(t(!0),clearTimeout(n)),s}catch{return!1}}return{subscribe:e,check:o}}function b(t,e){return t.origin!==location.origin||!t.pathname.startsWith(e)}function I(t){t.client}const V={url:g({}),page:g({}),navigating:i(null),updated:q()};export{A as I,f as P,y as S,x as a,R as b,S as c,V as d,d as e,E as f,T as g,I as h,b as i,U as s};
