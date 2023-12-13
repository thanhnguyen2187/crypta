import{s as ve,e as K,i as C,r as F,d as m,S as He,T as tn,E as it,F as dt,f as E,l as re,a as H,g as $,h as N,m as le,c as D,j as y,z as M,I as _,W as ye,n as se,M as we,J as De,X as nn,Y as an,U as Q,O as ke,R as ut,a0 as Re}from"../chunks/scheduler.dc60739d.js";import{S as xe,i as Ee,g as Ue,t as Y,c as _e,a as J,b as $e,d as Te,m as Ce,e as Me}from"../chunks/index.5c7cb921.js";import{e as ce,d as Ne,g as on,o as ft,c as rn,l as he,n as ln,j as sn,q as cn,m as ht,u as dn,t as un,v as fn,__tla as hn}from"../chunks/store.f8edab45.js";import{w as pn}from"../chunks/index.9821de9c.js";let pt,mt,mn=Promise.all([(()=>{try{return hn}catch{}})()]).then(async()=>{const gt=pn(void 0);function ze(t,e){if(!window.isSecureContext){console.error("Clipboard action failed: app not running in secure context, see: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard");return}const n=()=>{t.dispatchEvent(new CustomEvent("copyComplete"))},a=()=>{if(typeof e=="object"){if("element"in e){const o=document.querySelector(`[data-clipboard="${e.element}"]`);if(!o)throw new Error(`Missing HTMLElement with an attribute of [data-clipboard="${e.element}"]`);Le(o.innerHTML,"text/html").then(n);return}if("input"in e){const o=document.querySelector(`[data-clipboard="${e.input}"]`);if(!o)throw new Error(`Missing HTMLInputElement with an attribute of [data-clipboard="${e.input}"]`);Le(o.value).then(n);return}}Le(e).then(n)};return t.addEventListener("click",a),{update(o){e=o},destroy(){t.removeEventListener("click",a)}}}async function Le(t,e="text/plain"){navigator.clipboard.write?await navigator.clipboard.write([new ClipboardItem({[e]:new Blob([t],{type:e}),"text/plain":new Blob([t],{type:"text/plain"})})]):await new Promise(n=>{n(navigator.clipboard.writeText(String(t)))})}function qe(t){let e,n,a,o=Ve(t[0])+"",r,l,s,c=(t[7]?t[4]:t[3])+"",g,u,f,i,h,d,v,w,T,L;function R(p,k){return p[6]?vt:bt}let U=R(t),B=U(t);return{c(){e=E("div"),n=E("header"),a=E("span"),r=re(o),l=H(),s=E("button"),g=re(c),i=H(),h=E("pre"),d=E("code"),B.c(),this.h()},l(p){e=$(p,"DIV",{class:!0,"data-testid":!0});var k=N(e);n=$(k,"HEADER",{class:!0});var X=N(n);a=$(X,"SPAN",{class:!0});var x=N(a);r=le(x,o),x.forEach(m),l=D(X),s=$(X,"BUTTON",{class:!0});var A=N(s);g=le(A,c),A.forEach(m),X.forEach(m),i=D(k),h=$(k,"PRE",{class:!0});var S=N(h);d=$(S,"CODE",{class:!0});var O=N(d);B.l(O),O.forEach(m),S.forEach(m),k.forEach(m),this.h()},h(){y(a,"class","codeblock-language"),y(s,"class",u="codeblock-btn "+t[2]),y(n,"class","codeblock-header "+kt),y(d,"class",v="codeblock-code language-"+t[0]+" lineNumbers"),y(h,"class","codeblock-pre "+xt),y(e,"class",w="codeblock "+t[8]),y(e,"data-testid","codeblock")},m(p,k){C(p,e,k),M(e,n),M(n,a),M(a,r),M(n,l),M(n,s),M(s,g),M(e,i),M(e,h),M(h,d),B.m(d,null),T||(L=[_(s,"click",t[9]),ye(f=ze.call(null,s,t[1]))],T=!0)},p(p,k){k&1&&o!==(o=Ve(p[0])+"")&&se(r,o),k&152&&c!==(c=(p[7]?p[4]:p[3])+"")&&se(g,c),k&4&&u!==(u="codeblock-btn "+p[2])&&y(s,"class",u),f&&we(f.update)&&k&2&&f.update.call(null,p[1]),U===(U=R(p))&&B?B.p(p,k):(B.d(1),B=U(p),B&&(B.c(),B.m(d,null))),k&1&&v!==(v="codeblock-code language-"+p[0]+" lineNumbers")&&y(d,"class",v),k&256&&w!==(w="codeblock "+p[8])&&y(e,"class",w)},d(p){p&&m(e),B.d(),T=!1,De(L)}}}function bt(t){let e=t[1].trim()+"",n;return{c(){n=re(e)},l(a){n=le(a,e)},m(a,o){C(a,n,o)},p(a,o){o&2&&e!==(e=a[1].trim()+"")&&se(n,e)},d(a){a&&m(n)}}}function vt(t){let e,n;return{c(){e=new nn(!1),n=K(),this.h()},l(a){e=an(a,!1),n=K(),this.h()},h(){e.a=n},m(a,o){e.m(t[5],a,o),C(a,n,o)},p(a,o){o&32&&e.p(a[5])},d(a){a&&(m(n),e.d())}}}function yt(t){let e,n=t[0]&&t[1]&&qe(t);return{c(){n&&n.c(),e=K()},l(a){n&&n.l(a),e=K()},m(a,o){n&&n.m(a,o),C(a,e,o)},p(a,[o]){a[0]&&a[1]?n?n.p(a,o):(n=qe(a),n.c(),n.m(e.parentNode,e)):n&&(n.d(1),n=null)},i:F,o:F,d(a){a&&m(e),n&&n.d(a)}}}const wt="overflow-hidden shadow",kt="text-xs text-white/50 uppercase flex justify-between items-center p-2 pl-4",xt="whitespace-pre-wrap break-all p-4 pt-1";function Ve(t){return t==="js"?"javascript":t==="ts"?"typescript":t==="shell"?"terminal":t}function Et(t,e,n){let a,o;He(t,gt,p=>n(17,o=p));const r=tn();let{language:l="plaintext"}=e,{code:s=""}=e,{lineNumbers:c=!1}=e,{background:g="bg-neutral-900/90"}=e,{blur:u=""}=e,{text:f="text-sm"}=e,{color:i="text-white"}=e,{rounded:h="rounded-container-token"}=e,{shadow:d="shadow"}=e,{button:v="btn btn-sm variant-soft !text-white"}=e,{buttonLabel:w="Copy"}=e,{buttonCopied:T="\u{1F44D}"}=e,L=!1,R=s,U=!1;function B(){n(7,U=!0),setTimeout(()=>{n(7,U=!1)},2e3),r("copy")}return t.$$set=p=>{n(19,e=it(it({},e),dt(p))),"language"in p&&n(0,l=p.language),"code"in p&&n(1,s=p.code),"lineNumbers"in p&&n(10,c=p.lineNumbers),"background"in p&&n(11,g=p.background),"blur"in p&&n(12,u=p.blur),"text"in p&&n(13,f=p.text),"color"in p&&n(14,i=p.color),"rounded"in p&&n(15,h=p.rounded),"shadow"in p&&n(16,d=p.shadow),"button"in p&&n(2,v=p.button),"buttonLabel"in p&&n(3,w=p.buttonLabel),"buttonCopied"in p&&n(4,T=p.buttonCopied)},t.$$.update=()=>{t.$$.dirty&131075&&o!==void 0&&(n(5,R=o.highlight(s,{language:l}).value.trim()),n(6,L=!0)),t.$$.dirty&1056&&c&&(n(5,R=R.replace(/^/gm,()=>'<span class="line"></span>	')),n(6,L=!0)),n(8,a=`${wt} ${g} ${u} ${f} ${i} ${h} ${d} ${e.class??""}`)},e=dt(e),[l,s,v,w,T,R,L,U,a,B,c,g,u,f,i,h,d,o]}class $t extends xe{constructor(e){super(),Ee(this,e,Et,yt,ve,{language:0,code:1,lineNumbers:10,background:11,blur:12,text:13,color:14,rounded:15,shadow:16,button:2,buttonLabel:3,buttonCopied:4})}}let Xe,Fe;Xe=!0,Fe=!1,mt=Object.freeze(Object.defineProperty({__proto__:null,prerender:Xe,ssr:Fe},Symbol.toStringTag,{value:"Module"}));function Tt(t){let e,n='<i class="fa-solid fa-unlock fa-8x opacity-75"></i>';return{c(){e=E("div"),e.innerHTML=n,this.h()},l(a){e=$(a,"DIV",{class:!0,"data-svelte-h":!0}),Q(e)!=="svelte-shn7xz"&&(e.innerHTML=n),this.h()},h(){y(e,"class","w-full p-4 flex justify-center")},m(a,o){C(a,e,o)},p:F,d(a){a&&m(e)}}}function Ct(t){let e,n,a,o;return{c(){e=E("button"),n=E("i"),this.h()},l(r){e=$(r,"BUTTON",{class:!0,"aria-roledescription":!0});var l=N(e);n=$(l,"I",{class:!0}),N(n).forEach(m),l.forEach(m),this.h()},h(){y(n,"class","fa-solid fa-8x opacity-75"),ke(n,"fa-lock",t[2]==="default"),ke(n,"fa-unlock",t[2]==="hovered"||t[2]==="active"),y(e,"class","w-full p-4 flex justify-center cursor-pointer"),y(e,"aria-roledescription","generic")},m(r,l){C(r,e,l),M(e,n),a||(o=[_(e,"mouseenter",t[3]),_(e,"mousedown",t[4]),_(e,"click",function(){we(t[1])&&t[1].apply(this,arguments)}),_(e,"mouseup",t[5]),_(e,"mouseleave",t[6])],a=!0)},p(r,l){t=r,l&4&&ke(n,"fa-lock",t[2]==="default"),l&4&&ke(n,"fa-unlock",t[2]==="hovered"||t[2]==="active")},d(r){r&&m(e),a=!1,De(o)}}}function Mt(t){let e;function n(r,l){return r[0]?Ct:Tt}let a=n(t),o=a(t);return{c(){o.c(),e=K()},l(r){o.l(r),e=K()},m(r,l){o.m(r,l),C(r,e,l)},p(r,[l]){a===(a=n(r))&&o?o.p(r,l):(o.d(1),o=a(r),o&&(o.c(),o.m(e.parentNode,e)))},i:F,o:F,d(r){r&&m(e),o.d(r)}}}function Nt(t,e,n){let a="default",{encrypted:o=!1}=e,{decryptCallback:r=()=>{}}=e;const l=()=>n(2,a="hovered"),s=()=>n(2,a="active"),c=()=>n(2,a="hovered"),g=()=>n(2,a="default");return t.$$set=u=>{"encrypted"in u&&n(0,o=u.encrypted),"decryptCallback"in u&&n(1,r=u.decryptCallback)},[o,r,a,l,s,c,g]}class Lt extends xe{constructor(e){super(),Ee(this,e,Nt,Mt,ve,{encrypted:0,decryptCallback:1})}}async function Ot(){try{return await navigator.clipboard.readText()}catch(t){return console.error({method:"getFromClipboard",error:t}),null}}function Ye(t,e,n){const a=t.slice();return a[22]=e[n],a}function Je(t,e,n){const a=t.slice();return a[25]=e[n],a}function Ge(t){let e,n,a,o,r,l,s,c=t[25].text+"",g,u,f,i;function h(){return t[7](t[25])}return{c(){e=E("li"),n=E("button"),a=E("span"),o=E("i"),l=H(),s=E("span"),g=re(c),u=H(),this.h()},l(d){e=$(d,"LI",{});var v=N(e);n=$(v,"BUTTON",{class:!0});var w=N(n);a=$(w,"SPAN",{});var T=N(a);o=$(T,"I",{class:!0}),N(o).forEach(m),T.forEach(m),l=D(w),s=$(w,"SPAN",{});var L=N(s);g=le(L,c),L.forEach(m),w.forEach(m),u=D(v),v.forEach(m),this.h()},h(){y(o,"class",r="fa-solid "+t[25].faIconClass),y(n,"class","w-full")},m(d,v){C(d,e,v),M(e,n),M(n,a),M(a,o),M(n,l),M(n,s),M(s,g),M(e,u),f||(i=_(n,"click",h),f=!0)},p(d,v){t=d,v&16&&r!==(r="fa-solid "+t[25].faIconClass)&&y(o,"class",r),v&16&&c!==(c=t[25].text+"")&&se(g,c)},d(d){d&&m(e),f=!1,i()}}}function It(t){let e,n='<h3 class="h3 truncate">Placeholder</h3>',a,o,r,l='<i class="fa-solid fa-add fa-9x"></i>',s,c,g='<span class="chip variant-ghost">no tag yet</span>',u,f;return{c(){e=E("header"),e.innerHTML=n,a=H(),o=E("section"),r=E("button"),r.innerHTML=l,s=H(),c=E("footer"),c.innerHTML=g,this.h()},l(i){e=$(i,"HEADER",{class:!0,"data-svelte-h":!0}),Q(e)!=="svelte-kne87x"&&(e.innerHTML=n),a=D(i),o=$(i,"SECTION",{class:!0});var h=N(o);r=$(h,"BUTTON",{class:!0,"data-svelte-h":!0}),Q(r)!=="svelte-1w1pyak"&&(r.innerHTML=l),h.forEach(m),s=D(i),c=$(i,"FOOTER",{class:!0,"data-svelte-h":!0}),Q(c)!=="svelte-8avvcy"&&(c.innerHTML=g),this.h()},h(){y(e,"class","card-header flex gap-4 justify-between invisible"),y(r,"class","btn variant-filled"),y(o,"class","m-4 h-40 flex flex-col justify-center items-center"),y(c,"class","card-footer invisible")},m(i,h){C(i,e,h),C(i,a,h),C(i,o,h),M(o,r),C(i,s,h),C(i,c,h),u||(f=_(r,"click",t[6]),u=!0)},p:F,i:F,o:F,d(i){i&&(m(e),m(a),m(o),m(s),m(c)),u=!1,f()}}}function St(t){let e,n,a=t[0].name+"",o,r,l,s,c,g='<i class="fa-xl fa-solid fa-ellipsis-v"></i>',u,f,i,h,d,v,w,T,L,R,U;function B(b,I){if(b[1]==="unlocked"&&b[2]==="hidden")return jt;if(b[1]==="unlocked"&&b[2]==="visible")return Bt}let p=B(t),k=p&&p(t);const X=[Pt,At],x=[];function A(b,I){return(b[1]!=="default"||b[0].encrypted)&&b[2]==="hidden"?0:b[1]==="default"||b[2]==="visible"?1:-1}~(h=A(t))&&(d=x[h]=X[h](t));let S=ce(t[0].tags),O=[];for(let b=0;b<S.length;b+=1)O[b]=Ke(Ye(t,S,b));let P=t[0].tags.length===0&&Qe();return{c(){e=E("header"),n=E("h3"),o=re(a),r=H(),l=E("div"),k&&k.c(),s=H(),c=E("button"),c.innerHTML=g,f=H(),i=E("section"),d&&d.c(),v=H(),w=E("footer");for(let b=0;b<O.length;b+=1)O[b].c();T=H(),P&&P.c(),this.h()},l(b){e=$(b,"HEADER",{class:!0});var I=N(e);n=$(I,"H3",{class:!0});var z=N(n);o=le(z,a),z.forEach(m),r=D(I),l=$(I,"DIV",{class:!0});var j=N(l);k&&k.l(j),s=D(j),c=$(j,"BUTTON",{class:!0,"data-svelte-h":!0}),Q(c)!=="svelte-dombq9"&&(c.innerHTML=g),j.forEach(m),I.forEach(m),f=D(b),i=$(b,"SECTION",{class:!0});var fe=N(i);d&&d.l(fe),fe.forEach(m),v=D(b),w=$(b,"FOOTER",{class:!0});var be=N(w);for(let We=0;We<O.length;We+=1)O[We].l(be);T=D(be),P&&P.l(be),be.forEach(m),this.h()},h(){y(n,"class","h3 truncate"),y(c,"class","btn btn-sm variant-filled"),y(l,"class","flex gap-1"),y(e,"class","card-header flex gap-4 justify-between"),y(i,"class","m-4 h-40 overflow-y-scroll hide-scrollbar"),y(w,"class","card-footer flex gap-1")},m(b,I){C(b,e,I),M(e,n),M(n,o),M(e,r),M(e,l),k&&k.m(l,null),M(l,s),M(l,c),C(b,f,I),C(b,i,I),~h&&x[h].m(i,null),C(b,v,I),C(b,w,I);for(let z=0;z<O.length;z+=1)O[z]&&O[z].m(w,null);M(w,T),P&&P.m(w,null),L=!0,R||(U=ye(u=sn.call(null,c,{event:"click",target:"card-actions-"+t[0].id,placement:"right"})),R=!0)},p(b,I){(!L||I&1)&&a!==(a=b[0].name+"")&&se(o,a),p===(p=B(b))&&k?k.p(b,I):(k&&k.d(1),k=p&&p(b),k&&(k.c(),k.m(l,s))),u&&we(u.update)&&I&1&&u.update.call(null,{event:"click",target:"card-actions-"+b[0].id,placement:"right"});let z=h;if(h=A(b),h===z?~h&&x[h].p(b,I):(d&&(Ue(),Y(x[z],1,1,()=>{x[z]=null}),_e()),~h?(d=x[h],d?d.p(b,I):(d=x[h]=X[h](b),d.c()),J(d,1),d.m(i,null)):d=null),I&1){S=ce(b[0].tags);let j;for(j=0;j<S.length;j+=1){const fe=Ye(b,S,j);O[j]?O[j].p(fe,I):(O[j]=Ke(fe),O[j].c(),O[j].m(w,T))}for(;j<O.length;j+=1)O[j].d(1);O.length=S.length}b[0].tags.length===0?P||(P=Qe(),P.c(),P.m(w,null)):P&&(P.d(1),P=null)},i(b){L||(J(d),L=!0)},o(b){Y(d),L=!1},d(b){b&&(m(e),m(f),m(i),m(v),m(w)),k&&k.d(),~h&&x[h].d(),ut(O,b),P&&P.d(),R=!1,U()}}}function Bt(t){let e,n='<i class="fa-solid fa-eye-slash"></i>',a,o;return{c(){e=E("button"),e.innerHTML=n,this.h()},l(r){e=$(r,"BUTTON",{class:!0,"data-svelte-h":!0}),Q(e)!=="svelte-joj8i"&&(e.innerHTML=n),this.h()},h(){y(e,"class","btn btn-sm variant-filled")},m(r,l){C(r,e,l),a||(o=_(e,"click",t[10]),a=!0)},p:F,d(r){r&&m(e),a=!1,o()}}}function jt(t){let e,n,a,o,r,l,s='<i class="fa-solid fa-eye"></i>',c,g;return{c(){e=E("button"),n=E("i"),r=H(),l=E("button"),l.innerHTML=s,this.h()},l(u){e=$(u,"BUTTON",{class:!0});var f=N(e);n=$(f,"I",{class:!0}),N(n).forEach(m),f.forEach(m),r=D(u),l=$(u,"BUTTON",{class:!0,"data-svelte-h":!0}),Q(l)!=="svelte-1bfmp1k"&&(l.innerHTML=s),this.h()},h(){y(n,"class",a="fa-solid "+t[3]),y(e,"class","btn btn-sm variant-filled"),y(l,"class","btn btn-sm variant-filled")},m(u,f){C(u,e,f),M(e,n),C(u,r,f),C(u,l,f),c||(g=[ye(o=ze.call(null,e,t[0].text)),_(e,"click",t[8]),_(l,"click",t[9])],c=!0)},p(u,f){f&8&&a!==(a="fa-solid "+u[3])&&y(n,"class",a),o&&we(o.update)&&f&1&&o.update.call(null,u[0].text)},d(u){u&&(m(e),m(r),m(l)),c=!1,De(g)}}}function At(t){let e,n;return e=new $t({props:{buttonLabel:"Copy",buttonCopied:"\u2714\uFE0F",language:t[0].language,code:t[0].text}}),{c(){$e(e.$$.fragment)},l(a){Te(e.$$.fragment,a)},m(a,o){Ce(e,a,o),n=!0},p(a,o){const r={};o&1&&(r.language=a[0].language),o&1&&(r.code=a[0].text),e.$set(r)},i(a){n||(J(e.$$.fragment,a),n=!0)},o(a){Y(e.$$.fragment,a),n=!1},d(a){Me(e,a)}}}function Pt(t){let e,n;return e=new Lt({props:{encrypted:t[0].encrypted,decryptCallback:t[5].callback}}),{c(){$e(e.$$.fragment)},l(a){Te(e.$$.fragment,a)},m(a,o){Ce(e,a,o),n=!0},p(a,o){const r={};o&1&&(r.encrypted=a[0].encrypted),e.$set(r)},i(a){n||(J(e.$$.fragment,a),n=!0)},o(a){Y(e.$$.fragment,a),n=!1},d(a){Me(e,a)}}}function Ke(t){let e,n=t[22]+"",a,o,r;function l(){return t[11](t[22])}return{c(){e=E("button"),a=re(n),this.h()},l(s){e=$(s,"BUTTON",{class:!0});var c=N(e);a=le(c,n),c.forEach(m),this.h()},h(){y(e,"class","chip variant-filled")},m(s,c){C(s,e,c),M(e,a),o||(r=_(e,"click",l),o=!0)},p(s,c){t=s,c&1&&n!==(n=t[22]+"")&&se(a,n)},d(s){s&&m(e),o=!1,r()}}}function Qe(t){let e,n="no tag yet";return{c(){e=E("span"),e.textContent=n,this.h()},l(a){e=$(a,"SPAN",{class:!0,"data-svelte-h":!0}),Q(e)!=="svelte-1wr700p"&&(e.textContent=n),this.h()},h(){y(e,"class","chip variant-ghost")},m(a,o){C(a,e,o)},d(a){a&&m(e)}}}function Wt(t){let e,n,a,o,r,l,s,c,g=ce(t[4]),u=[];for(let d=0;d<g.length;d+=1)u[d]=Ge(Je(t,g,d));const f=[St,It],i=[];function h(d,v){return d[0].id!=="new-card"?0:1}return l=h(t),s=i[l]=f[l](t),{c(){e=E("div"),n=E("ul");for(let d=0;d<u.length;d+=1)u[d].c();o=H(),r=E("div"),s.c(),this.h()},l(d){e=$(d,"DIV",{"data-popup":!0,class:!0});var v=N(e);n=$(v,"UL",{class:!0});var w=N(n);for(let L=0;L<u.length;L+=1)u[L].l(w);w.forEach(m),v.forEach(m),o=D(d),r=$(d,"DIV",{class:!0});var T=N(r);s.l(T),T.forEach(m),this.h()},h(){y(n,"class","list-nav variant-filled gap-2 rounded-container-token"),y(e,"data-popup",a="card-actions-"+t[0].id),y(e,"class","z-10"),y(r,"class","card p-4")},m(d,v){C(d,e,v),M(e,n);for(let w=0;w<u.length;w+=1)u[w]&&u[w].m(n,null);C(d,o,v),C(d,r,v),i[l].m(r,null),c=!0},p(d,[v]){if(v&16){g=ce(d[4]);let T;for(T=0;T<g.length;T+=1){const L=Je(d,g,T);u[T]?u[T].p(L,v):(u[T]=Ge(L),u[T].c(),u[T].m(n,null))}for(;T<u.length;T+=1)u[T].d(1);u.length=g.length}(!c||v&1&&a!==(a="card-actions-"+d[0].id))&&y(e,"data-popup",a);let w=l;l=h(d),l===w?i[l].p(d,v):(Ue(),Y(i[w],1,1,()=>{i[w]=null}),_e(),s=i[l],s?s.p(d,v):(s=i[l]=f[l](d),s.c()),J(s,1),s.m(r,null))},i(d){c||(J(s),c=!0)},o(d){Y(s),c=!1},d(d){d&&(m(e),m(o),m(r)),ut(u,d),i[l].d()}}}function Ht(t,e,n){let a;He(t,Ne,x=>n(12,a=x));const o=on();let r="default",l="hidden",s="fa-copy",{snippet:c={id:"",name:"",language:"",text:"",tags:[],encrypted:!1,position:0,createdAt:0,updatedAt:0}}=e;const g={text:"Encrypt",faIconClass:"fa-lock",callback:()=>{Re(Ne,a=!0,a),o.trigger({type:"component",component:"locker",response:x=>{if(!x)return;const{password:A}=x;cn(c,A).then(S=>he.upsert(S))}})}},u={text:"Decrypt",faIconClass:"fa-unlock",callback:()=>{Re(Ne,a=!1,a),o.trigger({type:"component",component:"locker",response:x=>{if(!x)return;const{password:A}=x;ft(c,A).then(S=>{n(1,r="unlocked"),n(0,c={...S})}).catch(S=>{console.error(S),setTimeout(()=>o.trigger({type:"alert",title:"Unable to decrypt the card",body:"Please recheck your password!"}),500)})}})}},f={text:"Unlock",faIconClass:"fa-key",callback:()=>{Re(Ne,a=!1,a),o.trigger({type:"component",component:"locker",response:x=>{if(!x)return;const{password:A}=x;ft(c,A).then(S=>{n(1,r="default"),he.upsert(S)}).catch(S=>{console.error(S),setTimeout(()=>o.trigger({type:"alert",title:"Unable to unlock the card",body:"Please recheck your password!"}),500)})}})}},i={text:"Duplicate",faIconClass:"fa-clone",callback:()=>he.clone(c)},h={text:"Edit",faIconClass:"fa-edit",callback:()=>{ht.set(c),o.trigger({type:"component",component:"snippet"})}},d={text:"Move",faIconClass:"fa-arrow-up-from-bracket",callback:()=>{ht.set(c),o.trigger({type:"component",component:"moveSnippet"})}},v={text:"Delete",faIconClass:"fa-trash",callback:()=>{o.trigger({type:"confirm",title:"Are you sure about this action?",body:"The record would be deleted completely!",response:x=>{x&&he.remove(c.id)}})}},w=[g,h,i,d,v],T=[u,f,h,d,v];let L=[];async function R(){const x=rn();let A=await Ot();A||(A="To be filled"),x.text=A,await he.upsert(x)}const U=x=>x.callback(),B=()=>{n(3,s="fa-check"),setTimeout(()=>n(3,s="fa-copy"),1e3)},p=()=>n(2,l="visible"),k=()=>n(2,l="hidden"),X=x=>ln.add(x);return t.$$set=x=>{"snippet"in x&&n(0,c=x.snippet)},t.$$.update=()=>{t.$$.dirty&1&&n(4,L=c.encrypted?T:w)},[c,r,l,s,L,u,R,U,B,p,k,X]}class Ze extends xe{constructor(e){super(),Ee(this,e,Ht,Wt,ve,{snippet:0})}}const et=new Set,W=new WeakMap,te=new WeakMap,Z=new WeakMap,Oe=new WeakMap,Dt=new WeakMap,ne=new WeakMap,pe=new WeakMap,ie=new WeakSet;let G,Ie=0,Se=0;const V="__aa_tgt",de="__aa_del",me="__aa_new",Rt=t=>{const e=Vt(t);e&&e.forEach(n=>Xt(n))},Ut=t=>{t.forEach(e=>{e.target===G&&zt(),W.has(e.target)&&ee(e.target)})};function _t(t){const e=Oe.get(t);e==null||e.disconnect();let n=W.get(t),a=0;const o=5;n||(n=oe(t),W.set(t,n));const{offsetWidth:r,offsetHeight:l}=G,s=[n.top-o,r-(n.left+o+n.width),l-(n.top+o+n.height),n.left-o].map(g=>`${-1*Math.floor(g)}px`).join(" "),c=new IntersectionObserver(()=>{++a>1&&ee(t)},{root:G,threshold:1,rootMargin:s});c.observe(t),Oe.set(t,c)}function ee(t){clearTimeout(pe.get(t));const e=ge(t),n=ue(e)?500:e.duration;pe.set(t,setTimeout(async()=>{const a=Z.get(t);try{await(a==null?void 0:a.finished),W.set(t,oe(t)),_t(t)}catch{}},n))}function zt(){clearTimeout(pe.get(G)),pe.set(G,setTimeout(()=>{et.forEach(t=>ot(t,e=>tt(()=>ee(e))))},100))}function qt(t){setTimeout(()=>{Dt.set(t,setInterval(()=>tt(ee.bind(null,t)),2e3))},Math.round(2e3*Math.random()))}function tt(t){typeof requestIdleCallback=="function"?requestIdleCallback(()=>t()):requestAnimationFrame(()=>t())}let Be,ae;typeof window<"u"&&(G=document.documentElement,Be=new MutationObserver(Rt),ae=new ResizeObserver(Ut),window.addEventListener("scroll",()=>{Se=window.scrollY,Ie=window.scrollX}),ae.observe(G));function Vt(t){return t.reduce((e,n)=>[...e,...Array.from(n.addedNodes),...Array.from(n.removedNodes)],[]).every(e=>e.nodeName==="#comment")?!1:t.reduce((e,n)=>{if(e===!1)return!1;if(n.target instanceof Element){if(je(n.target),!e.has(n.target)){e.add(n.target);for(let a=0;a<n.target.children.length;a++){const o=n.target.children.item(a);if(o){if(de in o)return!1;je(n.target,o),e.add(o)}}}if(n.removedNodes.length)for(let a=0;a<n.removedNodes.length;a++){const o=n.removedNodes[a];if(de in o)return!1;o instanceof Element&&(e.add(o),je(n.target,o),te.set(o,[n.previousSibling,n.nextSibling]))}}return e},new Set)}function je(t,e){!e&&!(V in t)?Object.defineProperty(t,V,{value:t}):e&&!(V in e)&&Object.defineProperty(e,V,{value:t})}function Xt(t){var e;const n=t.isConnected,a=W.has(t);n&&te.has(t)&&te.delete(t),Z.has(t)&&((e=Z.get(t))===null||e===void 0||e.cancel()),me in t?rt(t):a&&n?Yt(t):a&&!n?Jt(t):rt(t)}function q(t){return Number(t.replace(/[^0-9.\-]/g,""))}function Ft(t){let e=t.parentElement;for(;e;){if(e.scrollLeft||e.scrollTop)return{x:e.scrollLeft,y:e.scrollTop};e=e.parentElement}return{x:0,y:0}}function oe(t){const e=t.getBoundingClientRect(),{x:n,y:a}=Ft(t);return{top:e.top+a,left:e.left+n,width:e.width,height:e.height}}function nt(t,e,n){let a=e.width,o=e.height,r=n.width,l=n.height;const s=getComputedStyle(t);if(s.getPropertyValue("box-sizing")==="content-box"){const c=q(s.paddingTop)+q(s.paddingBottom)+q(s.borderTopWidth)+q(s.borderBottomWidth),g=q(s.paddingLeft)+q(s.paddingRight)+q(s.borderRightWidth)+q(s.borderLeftWidth);a-=g,r-=g,o-=c,l-=c}return[a,r,o,l].map(Math.round)}function ge(t){return V in t&&ne.has(t[V])?ne.get(t[V]):{duration:250,easing:"ease-in-out"}}function at(t){if(V in t)return t[V]}function Ae(t){const e=at(t);return e?ie.has(e):!1}function ot(t,...e){e.forEach(n=>n(t,ne.has(t)));for(let n=0;n<t.children.length;n++){const a=t.children.item(n);a&&e.forEach(o=>o(a,ne.has(a)))}}function Pe(t){return Array.isArray(t)?t:[t]}function ue(t){return typeof t=="function"}function Yt(t){const e=W.get(t),n=oe(t);if(!Ae(t))return W.set(t,n);let a;if(!e)return;const o=ge(t);if(typeof o!="function"){const r=e.left-n.left,l=e.top-n.top,[s,c,g,u]=nt(t,e,n),f={transform:`translate(${r}px, ${l}px)`},i={transform:"translate(0, 0)"};s!==c&&(f.width=`${s}px`,i.width=`${c}px`),g!==u&&(f.height=`${g}px`,i.height=`${u}px`),a=t.animate([f,i],{duration:o.duration,easing:o.easing})}else{const[r]=Pe(o(t,"remain",e,n));a=new Animation(r),a.play()}Z.set(t,a),W.set(t,n),a.addEventListener("finish",ee.bind(null,t))}function rt(t){me in t&&delete t[me];const e=oe(t);W.set(t,e);const n=ge(t);if(!Ae(t))return;let a;if(typeof n!="function")a=t.animate([{transform:"scale(.98)",opacity:0},{transform:"scale(0.98)",opacity:0,offset:.5},{transform:"scale(1)",opacity:1}],{duration:n.duration*1.5,easing:"ease-in"});else{const[o]=Pe(n(t,"add",e));a=new Animation(o),a.play()}Z.set(t,a),a.addEventListener("finish",ee.bind(null,t))}function lt(t,e){var n;t.remove(),W.delete(t),te.delete(t),Z.delete(t),(n=Oe.get(t))===null||n===void 0||n.disconnect(),setTimeout(()=>{if(de in t&&delete t[de],Object.defineProperty(t,me,{value:!0,configurable:!0}),e&&t instanceof HTMLElement)for(const a in e)t.style[a]=""},0)}function Jt(t){var e;if(!te.has(t)||!W.has(t))return;const[n,a]=te.get(t);Object.defineProperty(t,de,{value:!0,configurable:!0});const o=window.scrollX,r=window.scrollY;if(a&&a.parentNode&&a.parentNode instanceof Element?a.parentNode.insertBefore(t,a):n&&n.parentNode?n.parentNode.appendChild(t):(e=at(t))===null||e===void 0||e.appendChild(t),!Ae(t))return lt(t);const[l,s,c,g]=Kt(t),u=ge(t),f=W.get(t);(o!==Ie||r!==Se)&&Gt(t,o,r,u);let i,h={position:"absolute",top:`${l}px`,left:`${s}px`,width:`${c}px`,height:`${g}px`,margin:"0",pointerEvents:"none",transformOrigin:"center",zIndex:"100"};if(!ue(u))Object.assign(t.style,h),i=t.animate([{transform:"scale(1)",opacity:1},{transform:"scale(.98)",opacity:0}],{duration:u.duration,easing:"ease-out"});else{const[d,v]=Pe(u(t,"remove",f));(v==null?void 0:v.styleReset)!==!1&&(h=(v==null?void 0:v.styleReset)||h,Object.assign(t.style,h)),i=new Animation(d),i.play()}Z.set(t,i),i.addEventListener("finish",lt.bind(null,t,h))}function Gt(t,e,n,a){const o=Ie-e,r=Se-n,l=document.documentElement.style.scrollBehavior;if(getComputedStyle(G).scrollBehavior==="smooth"&&(document.documentElement.style.scrollBehavior="auto"),window.scrollTo(window.scrollX+o,window.scrollY+r),!t.parentElement)return;const s=t.parentElement;let c=s.clientHeight,g=s.clientWidth;const u=performance.now();function f(){requestAnimationFrame(()=>{if(!ue(a)){const i=c-s.clientHeight,h=g-s.clientWidth;u+a.duration>performance.now()?(window.scrollTo({left:window.scrollX-h,top:window.scrollY-i}),c=s.clientHeight,g=s.clientWidth,f()):document.documentElement.style.scrollBehavior=l}})}f()}function Kt(t){const e=W.get(t),[n,,a]=nt(t,e,oe(t));let o=t.parentElement;for(;o&&(getComputedStyle(o).position==="static"||o instanceof HTMLBodyElement);)o=o.parentElement;o||(o=document.body);const r=getComputedStyle(o),l=W.get(o)||oe(o),s=Math.round(e.top-l.top)-q(r.borderTopWidth),c=Math.round(e.left-l.left)-q(r.borderLeftWidth);return[s,c,n,a]}function Qt(t,e={}){return Be&&ae&&(window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!ue(e)&&!e.disrespectUserMotionPreference||(ie.add(t),getComputedStyle(t).position==="static"&&Object.assign(t.style,{position:"relative"}),ot(t,ee,qt,n=>ae==null?void 0:ae.observe(n)),ue(e)?ne.set(t,e):ne.set(t,{duration:250,easing:"ease-in-out",...e}),Be.observe(t,{childList:!0}),et.add(t))),Object.freeze({parent:t,enable:()=>{ie.add(t)},disable:()=>{ie.delete(t)},isEnabled:()=>ie.has(t)})}function st(t,e,n){const a=t.slice();return a[1]=e[n],a}function ct(t,e){let n,a,o;return a=new Ze({props:{snippet:e[1]}}),{key:t,first:null,c(){n=K(),$e(a.$$.fragment),this.h()},l(r){n=K(),Te(a.$$.fragment,r),this.h()},h(){this.first=n},m(r,l){C(r,n,l),Ce(a,r,l),o=!0},p(r,l){e=r;const s={};l&1&&(s.snippet=e[1]),a.$set(s)},i(r){o||(J(a.$$.fragment,r),o=!0)},o(r){Y(a.$$.fragment,r),o=!1},d(r){r&&m(n),Me(a,r)}}}function Zt(t){let e,n=[],a=new Map,o,r,l,s,c,g=ce(t[0]);const u=f=>f[1].id;for(let f=0;f<g.length;f+=1){let i=st(t,g,f),h=u(i);a.set(h,n[f]=ct(h,i))}return r=new Ze({props:{snippet:{id:"new-card"}}}),{c(){e=E("div");for(let f=0;f<n.length;f+=1)n[f].c();o=H(),$e(r.$$.fragment),this.h()},l(f){e=$(f,"DIV",{class:!0});var i=N(e);for(let h=0;h<n.length;h+=1)n[h].l(i);o=D(i),Te(r.$$.fragment,i),i.forEach(m),this.h()},h(){y(e,"class","p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 hide-scrollbar")},m(f,i){C(f,e,i);for(let h=0;h<n.length;h+=1)n[h]&&n[h].m(e,null);M(e,o),Ce(r,e,null),l=!0,s||(c=ye(Qt.call(null,e)),s=!0)},p(f,[i]){i&1&&(g=ce(f[0]),Ue(),n=dn(n,i,u,1,f,g,a,e,un,ct,o,st),_e())},i(f){if(!l){for(let i=0;i<g.length;i+=1)J(n[i]);J(r.$$.fragment,f),l=!0}},o(f){for(let i=0;i<n.length;i+=1)Y(n[i]);Y(r.$$.fragment,f),l=!1},d(f){f&&m(e);for(let i=0;i<n.length;i+=1)n[i].d();Me(r),s=!1,c()}}}function en(t,e,n){let a;return He(t,fn,o=>n(0,a=o)),[a]}pt=class extends xe{constructor(t){super(),Ee(this,t,en,Zt,ve,{})}}});export{mn as __tla,pt as component,mt as universal};