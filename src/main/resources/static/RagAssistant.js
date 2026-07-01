(function(F){typeof define=="function"&&define.amd?define(F):F()})((function(){"use strict";const F=globalThis,Mt=F.ShadowRoot&&(F.ShadyCSS===void 0||F.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Nt=Symbol(),le=new WeakMap;let ce=class{constructor(t,r,s){if(this._$cssResult$=!0,s!==Nt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=r}get styleSheet(){let t=this.o;const r=this.t;if(Mt&&t===void 0){const s=r!==void 0&&r.length===1;s&&(t=le.get(r)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&le.set(r,t))}return t}toString(){return this.cssText}};const Er=e=>new ce(typeof e=="string"?e:e+"",void 0,Nt),Q=(e,...t)=>{const r=e.length===1?e[0]:t.reduce((s,i,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1],e[0]);return new ce(r,e,Nt)},Ir=(e,t)=>{if(Mt)e.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(const r of t){const s=document.createElement("style"),i=F.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=r.cssText,e.appendChild(s)}},pe=Mt?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let r="";for(const s of t.cssRules)r+=s.cssText;return Er(r)})(e):e;const{is:_r,defineProperty:Pr,getOwnPropertyDescriptor:Mr,getOwnPropertyNames:Nr,getOwnPropertySymbols:kr,getPrototypeOf:Or}=Object,gt=globalThis,de=gt.trustedTypes,Rr=de?de.emptyScript:"",Lr=gt.reactiveElementPolyfillSupport,Z=(e,t)=>e,mt={toAttribute(e,t){switch(t){case Boolean:e=e?Rr:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch{r=null}}return r}},kt=(e,t)=>!_r(e,t),ue={attribute:!0,type:String,converter:mt,reflect:!1,useDefault:!1,hasChanged:kt};Symbol.metadata??=Symbol("metadata"),gt.litPropertyMetadata??=new WeakMap;let G=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,r=ue){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(t,r),!r.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,r);i!==void 0&&Pr(this.prototype,t,i)}}static getPropertyDescriptor(t,r,s){const{get:i,set:n}=Mr(this.prototype,t)??{get(){return this[r]},set(o){this[r]=o}};return{get:i,set(o){const l=i?.call(this);n?.call(this,o),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ue}static _$Ei(){if(this.hasOwnProperty(Z("elementProperties")))return;const t=Or(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Z("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Z("properties"))){const r=this.properties,s=[...Nr(r),...kr(r)];for(const i of s)this.createProperty(i,r[i])}const t=this[Symbol.metadata];if(t!==null){const r=litPropertyMetadata.get(t);if(r!==void 0)for(const[s,i]of r)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[r,s]of this.elementProperties){const i=this._$Eu(r,s);i!==void 0&&this._$Eh.set(i,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const r=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)r.unshift(pe(i))}else t!==void 0&&r.push(pe(t));return r}static _$Eu(t,r){const s=r.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,r=this.constructor.elementProperties;for(const s of r.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ir(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,r,s){this._$AK(t,s)}_$ET(t,r){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const n=(s.converter?.toAttribute!==void 0?s.converter:mt).toAttribute(r,s.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,r){const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const n=s.getPropertyOptions(i),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:mt;this._$Em=i;const l=o.fromAttribute(r,n.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,r,s,i=!1,n){if(t!==void 0){const o=this.constructor;if(i===!1&&(n=this[t]),s??=o.getPropertyOptions(t),!((s.hasChanged??kt)(n,r)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,r,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,r,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??r??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(r=void 0),this._$AL.set(t,r)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,n]of s){const{wrapped:o}=n,l=this[i];o!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,n,l)}}let t=!1;const r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(r)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(r)}willUpdate(t){}_$AE(t){this._$EO?.forEach(r=>r.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(r=>this._$ET(r,this[r])),this._$EM()}updated(t){}firstUpdated(t){}};G.elementStyles=[],G.shadowRootOptions={mode:"open"},G[Z("elementProperties")]=new Map,G[Z("finalized")]=new Map,Lr?.({ReactiveElement:G}),(gt.reactiveElementVersions??=[]).push("2.1.2");const Ot=globalThis,he=e=>e,ft=Ot.trustedTypes,ge=ft?ft.createPolicy("lit-html",{createHTML:e=>e}):void 0,me="$lit$",L=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+L,Dr=`<${fe}>`,H=document,tt=()=>H.createComment(""),et=e=>e===null||typeof e!="object"&&typeof e!="function",Rt=Array.isArray,Ur=e=>Rt(e)||typeof e?.[Symbol.iterator]=="function",Lt=`[ 	
\f\r]`,rt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,be=/-->/g,xe=/>/g,j=RegExp(`>|${Lt}(?:([^\\s"'>=/]+)(${Lt}*=${Lt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ye=/'/g,ve=/"/g,we=/^(?:script|style|textarea|title)$/i,zr=e=>(t,...r)=>({_$litType$:e,strings:t,values:r}),m=zr(1),D=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Se=new WeakMap,B=H.createTreeWalker(H,129);function Ce(e,t){if(!Rt(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return ge!==void 0?ge.createHTML(t):t}const Fr=(e,t)=>{const r=e.length-1,s=[];let i,n=t===2?"<svg>":t===3?"<math>":"",o=rt;for(let l=0;l<r;l++){const a=e[l];let p,c,g=-1,v=0;for(;v<a.length&&(o.lastIndex=v,c=o.exec(a),c!==null);)v=o.lastIndex,o===rt?c[1]==="!--"?o=be:c[1]!==void 0?o=xe:c[2]!==void 0?(we.test(c[2])&&(i=RegExp("</"+c[2],"g")),o=j):c[3]!==void 0&&(o=j):o===j?c[0]===">"?(o=i??rt,g=-1):c[1]===void 0?g=-2:(g=o.lastIndex-c[2].length,p=c[1],o=c[3]===void 0?j:c[3]==='"'?ve:ye):o===ve||o===ye?o=j:o===be||o===xe?o=rt:(o=j,i=void 0);const w=o===j&&e[l+1].startsWith("/>")?" ":"";n+=o===rt?a+Dr:g>=0?(s.push(p),a.slice(0,g)+me+a.slice(g)+L+w):a+L+(g===-2?l:w)}return[Ce(e,n+(e[r]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class st{constructor({strings:t,_$litType$:r},s){let i;this.parts=[];let n=0,o=0;const l=t.length-1,a=this.parts,[p,c]=Fr(t,r);if(this.el=st.createElement(p,s),B.currentNode=this.el.content,r===2||r===3){const g=this.el.content.firstChild;g.replaceWith(...g.childNodes)}for(;(i=B.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const g of i.getAttributeNames())if(g.endsWith(me)){const v=c[o++],w=i.getAttribute(g).split(L),E=/([.?@])?(.*)/.exec(v);a.push({type:1,index:n,name:E[2],strings:w,ctor:E[1]==="."?jr:E[1]==="?"?Br:E[1]==="@"?qr:bt}),i.removeAttribute(g)}else g.startsWith(L)&&(a.push({type:6,index:n}),i.removeAttribute(g));if(we.test(i.tagName)){const g=i.textContent.split(L),v=g.length-1;if(v>0){i.textContent=ft?ft.emptyScript:"";for(let w=0;w<v;w++)i.append(g[w],tt()),B.nextNode(),a.push({type:2,index:++n});i.append(g[v],tt())}}}else if(i.nodeType===8)if(i.data===fe)a.push({type:2,index:n});else{let g=-1;for(;(g=i.data.indexOf(L,g+1))!==-1;)a.push({type:7,index:n}),g+=L.length-1}n++}}static createElement(t,r){const s=H.createElement("template");return s.innerHTML=t,s}}function V(e,t,r=e,s){if(t===D)return t;let i=s!==void 0?r._$Co?.[s]:r._$Cl;const n=et(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(e),i._$AT(e,r,s)),s!==void 0?(r._$Co??=[])[s]=i:r._$Cl=i),i!==void 0&&(t=V(e,i._$AS(e,t.values),i,s)),t}class Hr{constructor(t,r){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:r},parts:s}=this._$AD,i=(t?.creationScope??H).importNode(r,!0);B.currentNode=i;let n=B.nextNode(),o=0,l=0,a=s[0];for(;a!==void 0;){if(o===a.index){let p;a.type===2?p=new it(n,n.nextSibling,this,t):a.type===1?p=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(p=new Wr(n,this,t)),this._$AV.push(p),a=s[++l]}o!==a?.index&&(n=B.nextNode(),o++)}return B.currentNode=H,i}p(t){let r=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,r),r+=s.strings.length-2):s._$AI(t[r])),r++}}class it{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,r,s,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const r=this._$AM;return r!==void 0&&t?.nodeType===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=V(this,t,r),et(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==D&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ur(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&et(this._$AH)?this._$AA.nextSibling.data=t:this.T(H.createTextNode(t)),this._$AH=t}$(t){const{values:r,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=st.createElement(Ce(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(r);else{const n=new Hr(i,this),o=n.u(this.options);n.p(r),this.T(o),this._$AH=n}}_$AC(t){let r=Se.get(t.strings);return r===void 0&&Se.set(t.strings,r=new st(t)),r}k(t){Rt(this._$AH)||(this._$AH=[],this._$AR());const r=this._$AH;let s,i=0;for(const n of t)i===r.length?r.push(s=new it(this.O(tt()),this.O(tt()),this,this.options)):s=r[i],s._$AI(n),i++;i<r.length&&(this._$AR(s&&s._$AB.nextSibling,i),r.length=i)}_$AR(t=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);t!==this._$AB;){const s=he(t).nextSibling;he(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class bt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,r,s,i,n){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=r,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(t,r=this,s,i){const n=this.strings;let o=!1;if(n===void 0)t=V(this,t,r,0),o=!et(t)||t!==this._$AH&&t!==D,o&&(this._$AH=t);else{const l=t;let a,p;for(t=n[0],a=0;a<n.length-1;a++)p=V(this,l[s+a],r,a),p===D&&(p=this._$AH[a]),o||=!et(p)||p!==this._$AH[a],p===u?t=u:t!==u&&(t+=(p??"")+n[a+1]),this._$AH[a]=p}o&&!i&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class jr extends bt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}}class Br extends bt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}}class qr extends bt{constructor(t,r,s,i,n){super(t,r,s,i,n),this.type=5}_$AI(t,r=this){if((t=V(this,t,r,0)??u)===D)return;const s=this._$AH,i=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==u&&(s===u||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Wr{constructor(t,r,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=r,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){V(this,t)}}const Gr=Ot.litHtmlPolyfillSupport;Gr?.(st,it),(Ot.litHtmlVersions??=[]).push("3.3.2");const Vr=(e,t,r)=>{const s=r?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const n=r?.renderBefore??null;s._$litPart$=i=new it(t.insertBefore(tt(),n),n,void 0,r??{})}return i._$AI(e),i};const Dt=globalThis;let nt=class extends G{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Vr(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return D}};nt._$litElement$=!0,nt.finalized=!0,Dt.litElementHydrateSupport?.({LitElement:nt});const Yr=Dt.litElementPolyfillSupport;Yr?.({LitElement:nt}),(Dt.litElementVersions??=[]).push("4.2.2");const Kr=e=>(t,r)=>{r!==void 0?r.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const Xr={attribute:!0,type:String,converter:mt,reflect:!1,hasChanged:kt},Jr=(e=Xr,t,r)=>{const{kind:s,metadata:i}=r;let n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),s==="setter"&&((e=Object.create(e)).wrapped=!0),n.set(r.name,e),s==="accessor"){const{name:o}=r;return{set(l){const a=t.get.call(this);t.set.call(this,l),this.requestUpdate(o,a,e,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,e,l),l}}}if(s==="setter"){const{name:o}=r;return function(l){const a=this[o];t.call(this,l),this.requestUpdate(o,a,e,!0,l)}}throw Error("Unsupported decorator location: "+s)};function Ae(e){return(t,r)=>typeof r=="object"?Jr(e,t,r):((s,i,n)=>{const o=i.hasOwnProperty(n);return i.constructor.createProperty(n,s),o?Object.getOwnPropertyDescriptor(i,n):void 0})(e,t,r)}function y(e){return Ae({...e,state:!0,attribute:!1})}const Qr=(e,t,r)=>(r.configurable=!0,r.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(e,t,r),r);function Ut(e,t){return(r,s,i)=>{const n=o=>o.renderRoot?.querySelector(e)??null;return Qr(r,s,{get(){return n(this)}})}}const zt=["有什么站内资料想查？","选中文字后也可以直接问我。","我会优先基于知识库回答。","需要我帮你追溯文章来源吗？"],$e="正在检索知识库，稍等一下。",Ft=76,Zr=48,ts=160,es=8,rs=9,ss=208/192,Y=(e,t)=>Array.from({length:t},(r,s)=>({row:e,col:s})),is=Y(0,6),ns=Y(3,4),os=Y(8,6),as=Y(5,8),ls=Y(1,8),cs=Y(2,8);function ps(e){const t=e,r=Math.round(e*ss);return{width:t,height:r,sheetWidth:t*es,sheetHeight:r*rs}}function Te(e){return e.errorActive?as:e.direction==="right"?ls:e.direction==="left"?cs:e.thinking?os:e.hovering?ns:is}function ds(e,t){const r=Te(e);return r[t%r.length]}const us=new Set(["navigate","scroll-to","highlight","dispatch-event","registered"]),hs=/^[a-z][a-z0-9_]{2,63}$/;function Ht(e){const t=P(e)?e:{},r=P(t.builtIn)?t.builtIn:{},s=P(t.toolSecurity)?t.toolSecurity:{},i=P(t.haloSearch)?t.haloSearch:{},n=P(t.haloResourceDetail)?t.haloResourceDetail:{},o=P(t.ragSearch)?t.ragSearch:{},l=Ie(i.allowedTypes);return{enabled:q(t.enabled,!0)??!0,builtIn:{pageContext:q(r.pageContext,!0)??!0,haloNavigation:q(r.haloNavigation,!0)??!0,haloContentSearch:q(r.haloContentSearch,!0)??!0,ragContentSearch:q(r.ragContentSearch,!0)??!0,networkAccess:q(r.networkAccess,!1)??!1,commentCapability:xs(r.commentCapability)},aiTools:Ee(t.aiTools),toolSecurity:{allowedExternalOrigins:[...Ie(s.allowedExternalOrigins),...ys(s.allowedExternalOrigins,"origin")],allowNewTab:q(s.allowNewTab,!1)??!1},haloSearch:{allowedTypes:l.length?l:["post.content.halo.run","singlepage.content.halo.run"],defaultLimit:at(i.defaultLimit)??5},haloResourceDetail:{maxContentChars:at(n.maxContentChars)??3e3},ragSearch:{defaultLimit:at(o.defaultLimit)??5,maxContentChars:at(o.maxContentChars)??3e3}}}function Ee(e){if(typeof e=="string"&&e.trim())try{return Ee(JSON.parse(e))}catch{return[]}return Array.isArray(e)?e.flatMap(t=>{const r=gs(t);return r?[r]:[]}):[]}function gs(e){if(!P(e))return;const t=k(e.name),r=k(e.description),s=ms(e.action);if(!(!t||!hs.test(t)||!r||!s))return{name:t,description:r,inputSchema:P(e.inputSchema)?e.inputSchema:{type:"object",properties:{}},approval:fs(e.approval),requiredAuth:bs(e.requiredAuth),actionType:s.type,action:s,testInput:e.testInput}}function ms(e){if(!P(e))return;const t=k(e.type);if(!(!t||!us.has(t))){if(t==="navigate"){const r=k(e.url);return r?{...ot(e),type:t,url:r,target:e.target==="_blank"?"_blank":"_self"}:void 0}if(t==="scroll-to"||t==="highlight"){const r=k(e.selector);return r?t==="scroll-to"?{...ot(e),type:t,selector:r,behavior:e.behavior==="auto"?"auto":"smooth"}:{...ot(e),type:t,selector:r,duration:at(e.duration)}:void 0}if(t==="dispatch-event"){const r=k(e.event);return r?{...ot(e),type:t,event:r}:void 0}return{...ot(e),type:"registered"}}}function ot(e){return{pendingMessage:k(e.pendingMessage),successMessage:k(e.successMessage),errorMessage:k(e.errorMessage)}}function fs(e){return e==="never"||e==="always"?e:"default"}function bs(e){return e==="authenticated"?"authenticated":"none"}function xs(e){return e==="off"||e==="submit"?e:"assist"}function Ie(e){return Array.isArray(e)?e.filter(t=>typeof t=="string"&&t.trim().length>0):[]}function ys(e,t){return Array.isArray(e)?e.flatMap(r=>P(r)&&typeof r[t]=="string"&&r[t].trim()?[r[t]]:[]):[]}function q(e,t){return typeof e=="boolean"?e:t}function at(e){const t=Number(e);return Number.isFinite(t)?t:void 0}function k(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function P(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const _={stylePreset:"default",primaryColor:"#a16207",secondaryColor:"#f4f4f5",surfaceColor:"#fafafa",textColor:"#18181b",borderRadius:"soft",colorMode:"light"},jt={surfaceColor:"#171717",textColor:"#f7f2e8",secondaryColor:"#292524"},_e={default:{primaryColor:"#a16207",secondaryColor:"#f4f4f5",surfaceColor:"#fafafa",textColor:"#18181b"},graphite:{primaryColor:"#d6b46c",secondaryColor:"#2a2a28",surfaceColor:"#171717",textColor:"#f7f2e8"},ocean:{primaryColor:"#1f7a8c",secondaryColor:"#d9f0f3",surfaceColor:"#fbfeff",textColor:"#142326"},forest:{primaryColor:"#2f7d50",secondaryColor:"#dceedd",surfaceColor:"#fbfdf8",textColor:"#18251b"},rose:{primaryColor:"#b85c7a",secondaryColor:"#f8dfe8",surfaceColor:"#fffafc",textColor:"#2b1720"}},vs={standard:{panel:"10px",card:"8px",control:"10px"},soft:{panel:"18px",card:"13px",control:"999px"},round:{panel:"26px",card:"18px",control:"999px"}};function Pe(e){const t=$s(e?.stylePreset),r=t==="custom"?_e.default:_e[t],s=t==="custom";return{stylePreset:t,primaryColor:xt(s?e?.primaryColor:r.primaryColor,_.primaryColor),secondaryColor:xt(s?e?.secondaryColor:r.secondaryColor,_.secondaryColor),surfaceColor:xt(s?e?.surfaceColor:r.surfaceColor,_.surfaceColor),textColor:xt(s?e?.textColor:r.textColor,_.textColor),borderRadius:Ts(e?.borderRadius),colorMode:Es(e?.colorMode)}}function ws(e,t){const r=Ss(Pe(t)),s=lt(r.primaryColor),i=lt(r.surfaceColor),n=lt(r.textColor),o=lt(r.secondaryColor),l=vs[r.borderRadius],a=As(r),p={r:0,g:0,b:0},c={r:255,g:255,b:255};h(e,"--rag-text",r.textColor),h(e,"--rag-muted",O(T(n,i,.42))),h(e,"--rag-line",S(n,.095)),h(e,"--rag-soft-line",S(n,.06)),h(e,"--rag-paper",S(i,.97)),h(e,"--rag-panel",r.surfaceColor),h(e,"--rag-ink",r.textColor),h(e,"--rag-secondary",r.secondaryColor),h(e,"--rag-gold",r.primaryColor),h(e,"--rag-gold-strong",O(T(s,{r:0,g:0,b:0},.18))),h(e,"--rag-gold-soft",S(s,.16)),h(e,"--rag-gold-faint",S(s,.05)),h(e,"--rag-primary-contrast",_s(s)),h(e,"--rag-secondary-soft",S(o,.48)),h(e,"--rag-radius-panel",l.panel),h(e,"--rag-radius-card",l.card),h(e,"--rag-radius-control",l.control),h(e,"--rag-shadow",Ps(n,a)),h(e,"--rag-window-surface",O(T(i,a?c:s,a?.055:.018))),h(e,"--rag-window-surface-2",O(T(i,a?p:c,a?.1:.42))),h(e,"--rag-header-surface",S(T(i,a?c:s,a?.075:.035),a?.96:.985)),h(e,"--rag-messages-surface",O(T(i,a?p:c,a?.045:.36))),h(e,"--rag-footer-surface",S(T(i,a?p:c,a?.035:.28),.98)),h(e,"--rag-control-surface",S(T(i,c,a?.07:.68),a?.78:.9)),h(e,"--rag-input-surface-resolved",O(T(i,c,a?.065:.62))),h(e,"--rag-assistant-message-bg",O(T(i,c,a?.075:.82))),h(e,"--rag-assistant-message-border",S(T(a?n:s,i,a?.78:.72),a?.2:.18)),h(e,"--rag-window-border",S(T(n,i,a?.74:.86),a?.18:.13)),h(e,"--rag-divider",S(n,a?.075:.08)),h(e,"--rag-card-shadow",a?"0 8px 18px rgba(0, 0, 0, 0.18)":`0 10px 24px ${S(n,.055)}`),h(e,"--rag-control-shadow",a?"0 8px 18px rgba(0, 0, 0, 0.16)":`0 8px 18px ${S(n,.05)}`),h(e,"--rag-user-message-start",O(T(s,c,a?.08:.16))),h(e,"--rag-user-message-end",O(T(s,p,.18)))}function Ss(e){return Cs(e.colorMode)?{...e,surfaceColor:Bt(e.surfaceColor,_.surfaceColor,jt.surfaceColor),textColor:Bt(e.textColor,_.textColor,jt.textColor),secondaryColor:Bt(e.secondaryColor,_.secondaryColor,jt.secondaryColor)}:e}function Cs(e){return e==="dark"?!0:e==="light"?!1:window.matchMedia?.("(prefers-color-scheme: dark)").matches??!1}function As(e){return Ne(lt(e.surfaceColor))<.28}function xt(e,t){const r=e?.trim();return r&&Is(r)?Me(r).toLowerCase():t}function $s(e){return e==="graphite"||e==="ocean"||e==="forest"||e==="rose"||e==="custom"?e:_.stylePreset}function Ts(e){return e==="standard"||e==="round"?e:_.borderRadius}function Es(e){return e==="auto"||e==="light"||e==="dark"?e:_.colorMode}function Bt(e,t,r){return e.toLowerCase()===t.toLowerCase()?r:e}function Is(e){return/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(e)}function Me(e){return e.length===4?`#${e[1]}${e[1]}${e[2]}${e[2]}${e[3]}${e[3]}`:e}function lt(e){const t=Me(e).slice(1);return{r:Number.parseInt(t.slice(0,2),16),g:Number.parseInt(t.slice(2,4),16),b:Number.parseInt(t.slice(4,6),16)}}function T(e,t,r){const s=1-r;return{r:Math.round(e.r*s+t.r*r),g:Math.round(e.g*s+t.g*r),b:Math.round(e.b*s+t.b*r)}}function S(e,t){return`rgba(${e.r}, ${e.g}, ${e.b}, ${t})`}function O(e){return`#${qt(e.r)}${qt(e.g)}${qt(e.b)}`}function qt(e){return Math.min(Math.max(e,0),255).toString(16).padStart(2,"0")}function _s(e){return Ne(e)>.55?"#171717":"#ffffff"}function Ne(e){const t=[e.r,e.g,e.b].map(r=>{const s=r/255;return s<=.03928?s/12.92:((s+.055)/1.055)**2.4});return .2126*t[0]+.7152*t[1]+.0722*t[2]}function Ps(e,t){return t?`0 20px 56px ${S(e,.1)}, 0 6px 18px rgba(0, 0, 0, 0.34)`:`0 20px 56px ${S(e,.12)}, 0 6px 18px ${S(e,.07)}`}function h(e,t,r){e.style.setProperty(t,r)}const yt="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",Wt=24,Ms=800,ke="智阅助手",Oe="/plugins/summaraidGPT/assets/static/icon.svg",Re={enabled:!0,displayName:"鸡哥ikun",petJsonUrl:"/plugins/summaraidGPT/assets/static/pets/default-ikun/pet.json",spritesheetUrl:"/plugins/summaraidGPT/assets/static/pets/default-ikun/spritesheet.webp"},ct={assistantAvatar:Oe,assistantName:ke,styleConfig:_,buttonPosition:"right",horizontalOffset:Wt,verticalOffset:Wt,petSize:Ft,petSpeechMessages:zt,pet:Re,agent:Ht(void 0)};async function Ns(){try{const e=await fetch(`${yt}/dialogConfig`,{headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();return Rs(t)}catch{return{...ct}}}async function ks(e,t,r){const s=await fetch(`${yt}/ragAskStream`,{method:"POST",credentials:"same-origin",signal:r,headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(e)});if(!s.ok||!s.body)throw new Error(`HTTP ${s.status}`);const i=s.body.getReader(),n=new TextDecoder;let o="";const l=a=>{const p=Hs(a);if(!p)return;const c=JSON.parse(p);c.type==="conversation"?c.conversationId&&t.onConversationId?.(c.conversationId):c.type==="sources"?t.onSources?.(c.sources||[]):c.type==="delta"?t.onDelta?.(c.delta||""):c.type==="done"?t.onDone?.():c.type==="error"&&t.onError?.(c.error||"RAG 问答失败")};for(;;){const{done:a,value:p}=await i.read();if(a){o+=n.decode();break}o+=n.decode(p,{stream:!0});const c=o.split(/\r?\n\r?\n/);o=c.pop()||"",c.forEach(l)}o.trim()&&l(o)}async function Os(e,t){if(!e.trim()||!t.trim())return;const r=new URLSearchParams({visitorId:t}),s=await fetch(`${yt}/ragConversations/${encodeURIComponent(e)}?${r}`,{credentials:"same-origin",headers:{Accept:"application/json"}});if(!(s.status===404||s.status===403)){if(!s.ok)throw new Error(`HTTP ${s.status}`);return await s.json()}}function Rs(e){const t=String(e.buttonPosition).trim()==="left"?"left":"right";return{...ct,...e,buttonPosition:t,assistantAvatar:Us(e.assistantAvatar),assistantName:Fs(e.assistantName),styleConfig:Pe(e.styleConfig),horizontalOffset:Le(e.horizontalOffset),verticalOffset:Le(e.verticalOffset),petSize:zs(e.petSize),petSpeechMessages:Ds(e.petSpeechMessages)||zt,pet:Ls(e.pet)||Re,agent:Ht(e.agent)}}function Ls(e){if(!e||e.enabled===!1)return;const t=e.spritesheetUrl?.trim();if(t)return{enabled:!0,displayName:e.displayName?.trim()||void 0,petJsonUrl:e.petJsonUrl?.trim()||void 0,spritesheetUrl:t}}function Ds(e){if(!Array.isArray(e))return;const t=e.map(r=>`${r||""}`.trim()).filter(Boolean).slice(0,12);return t.length?t:void 0}function Us(e){const t=e?.trim();return!t||t.toLowerCase().startsWith("javascript:")?Oe:t}function Le(e){const t=Number(e);return Number.isFinite(t)?Math.round(Math.min(Math.max(t,0),Ms)):Wt}function zs(e){const t=Number(e);return Number.isFinite(t)?Math.round(Math.min(Math.max(t,Zr),ts)):Ft}function Fs(e){return e?.trim()||ke}function Hs(e){const t=e.split(/\r?\n/).filter(r=>r.startsWith("data:")).map(r=>r.replace(/^data:\s?/,""));return t.length?t.join(`
`):void 0}const De="请输入您想从知识库了解的问题...",js=8;function pt(e=new Date){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function Ue(e){const t=e.replace(/\r\n?/g,`
`).split(`
`),r=[];let s=[],i=[],n=[],o=[],l=!1,a="";const p=()=>{s.length&&(r.push(`<p>${dt(s.join(`
`)).replace(/\n/g,"<br>")}</p>`),s=[])},c=()=>{i.length&&(r.push(`<ul>${i.map(w=>`<li>${dt(w)}</li>`).join("")}</ul>`),i=[])},g=()=>{n.length&&(r.push(`<ol>${n.map(w=>`<li>${dt(w)}</li>`).join("")}</ol>`),n=[])},v=()=>{c(),g()};for(const w of t){const E=w.trimEnd(),Pt=E.match(/^```([A-Za-z0-9_-]*)\s*$/);if(Pt){l?(r.push(`<pre><code${a?` class="language-${ze(a)}"`:""}>${vt(o.join(`
`))}</code></pre>`),o=[],a="",l=!1):(p(),v(),l=!0,a=Pt[1]||"");continue}if(l){o.push(w);continue}if(!E.trim()){p(),v();continue}const J=E.match(/^(#{1,4})\s+(.+)$/);if(J){p(),v();const $=J[1].length;r.push(`<h${$}>${dt(J[2].trim())}</h${$}>`);continue}const d=E.match(/^\s*[-*]\s+(.+)$/);if(d){p(),g(),i.push(d[1]);continue}const x=E.match(/^\s*\d+\.\s+(.+)$/);if(x){p(),c(),n.push(x[1]);continue}const R=E.match(/^>\s?(.+)$/);if(R){p(),v(),r.push(`<blockquote>${dt(R[1])}</blockquote>`);continue}v(),s.push(E)}return l&&r.push(`<pre><code>${vt(o.join(`
`))}</code></pre>`),p(),v(),r.join("")}function dt(e){const t=[];let r=vt(e).replace(/`([^`]+)`/g,(s,i)=>{const n=`@@CODE${t.length}@@`;return t.push(`<code>${i}</code>`),n});return r=r.replace(/\[([^\]]+)]\(([^)\s]+)\)/g,(s,i,n)=>{const o=Bs(n);return o?`<a href="${ze(o)}" target="_blank" rel="noopener noreferrer">${i}</a>`:i}).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/__([^_]+)__/g,"<strong>$1</strong>").replace(/(^|[\s>])\*{1,2}([\u4e00-\u9fa5A-Za-z0-9][^*\n：:]{0,18}[：:])/g,"$1<strong>$2</strong>").replace(/(^|[\s>])\*([^*\n]+)\*/g,"$1<em>$2</em>").replace(/(^|[\s>])_([^_\n]+)_/g,"$1<em>$2</em>"),t.forEach((s,i)=>{r=r.replace(`@@CODE${i}@@`,s)}),r}function Bs(e){const t=e.trim();return/^(https?:|mailto:|\/|#)/i.test(t)?t:""}function vt(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ze(e){return vt(e).replace(/`/g,"&#96;")}const qs=Q`
  :host {
    --rag-text: #18181b;
    --rag-muted: #71717a;
    --rag-line: rgba(24, 24, 27, 0.1);
    --rag-soft-line: rgba(24, 24, 27, 0.06);
    --rag-paper: rgba(255, 255, 255, 0.97);
    --rag-panel: #fafafa;
    --rag-secondary: #f4f4f5;
    --rag-secondary-soft: rgba(244, 244, 245, 0.62);
    --rag-gold: #a16207;
    --rag-gold-strong: #85510a;
    --rag-gold-soft: rgba(161, 98, 7, 0.16);
    --rag-gold-faint: rgba(161, 98, 7, 0.05);
    --rag-input-surface-resolved: color-mix(in srgb, var(--rag-panel) 90%, white);
    --rag-user-message-start: var(--rag-gold);
    --rag-user-message-end: var(--rag-gold-strong);
    --rag-ring: color-mix(in srgb, var(--rag-gold) 42%, transparent);
    --rag-frost: color-mix(in srgb, var(--rag-paper) 74%, transparent);
    --rag-primary-contrast: #fff;
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 99999;
    display: block;
    color: var(--rag-text);
    font-size: 14px;
    line-height: 1.5;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      'PingFang SC',
      'Hiragino Sans GB',
      'Microsoft YaHei',
      ui-sans-serif,
      sans-serif;
    letter-spacing: 0;
    text-rendering: geometricPrecision;
  }

  :host([position='left']) {
    right: auto;
    left: 24px;
  }

  * {
    box-sizing: border-box;
  }

  button,
  textarea {
    font: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  button:focus-visible,
  textarea:focus-visible,
  summary:focus-visible,
  a:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--rag-gold) 14%, transparent),
      0 6px 16px rgba(15, 23, 42, 0.06);
  }

  .iconify-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    flex: 0 0 auto;
    background: currentColor;
    mask: var(--rag-icon-source) center / contain no-repeat;
    -webkit-mask: var(--rag-icon-source) center / contain no-repeat;
  }

  @keyframes pet-panel-in {
    from {
      opacity: 0;
      transform: translateY(9px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes stage-backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes stage-in {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes message-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes source-list-in {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes typing {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.38;
    }
    40% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }
`,Ws=Q`
  .composer-wrap {
    width: min(640px, 100%);
    margin: 0 auto;
  }

  .composer,
  .pet-composer {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 7px 7px 7px 11px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 82%, var(--rag-gold) 8%);
    border-radius: 16px;
    background: color-mix(in srgb, var(--rag-input-surface-resolved) 90%, white);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.055);
    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;
  }

  .composer:focus-within,
  .pet-composer:focus-within {
    border-color: var(--rag-ring);
    background: var(--rag-paper);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--rag-gold) 13%, transparent),
      0 8px 18px rgba(15, 23, 42, 0.055);
  }

  .input,
  .pet-composer-input {
    flex: 1;
    min-width: 0;
    max-height: 118px;
    min-height: 30px;
    padding: 8px 0;
    resize: none;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--rag-text);
    font-size: 13px;
    line-height: 1.5;
  }

  .pet-composer-input {
    max-height: 92px;
    min-height: 28px;
    padding: 7px 0;
  }

  .input:focus-visible,
  .pet-composer-input:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .input::placeholder,
  .pet-composer-input::placeholder {
    color: color-mix(in srgb, var(--rag-muted) 78%, transparent);
  }

  .send,
  .pet-send {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    padding: 0;
    border: 0;
    border-radius: 12px;
    color: var(--rag-primary-contrast);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 92%, white), var(--rag-gold-strong));
    box-shadow:
      0 8px 18px color-mix(in srgb, var(--rag-gold) 17%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
    cursor: pointer;
    transition:
      transform 0.14s ease,
      filter 0.14s ease,
      opacity 0.14s ease;
  }

  .pet-send {
    width: 34px;
    height: 34px;
  }

  .send:hover:not(:disabled),
  .pet-send:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }

  .send:active:not(:disabled),
  .pet-send:active:not(:disabled) {
    transform: translateY(0) scale(0.96);
  }

  .send:disabled,
  .pet-send:disabled {
    cursor: not-allowed;
    opacity: 0.44;
    box-shadow: none;
  }

  .send svg,
  .send .iconify-icon,
  .pet-send svg,
  .pet-send .iconify-icon {
    width: 18px;
    height: 18px;
  }
`,Gs=Q`
  .message-text {
    display: block;
    white-space: pre-wrap;
  }

  .markdown-body {
    white-space: normal;
  }

  .markdown-body :first-child {
    margin-top: 0;
  }

  .markdown-body :last-child {
    margin-bottom: 0;
  }

  .markdown-body p {
    margin: 0 0 10px;
  }

  .markdown-body h1,
  .markdown-body h2,
  .markdown-body h3,
  .markdown-body h4 {
    margin: 10px 0 6px;
    color: var(--rag-text);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 850;
  }

  .markdown-body ul,
  .markdown-body ol {
    margin: 6px 0 10px;
    padding-left: 20px;
  }

  .markdown-body li {
    margin: 3px 0;
  }

  .markdown-body strong {
    font-weight: 850;
  }

  .markdown-body em {
    color: color-mix(in srgb, var(--rag-text) 88%, var(--rag-gold-strong));
  }

  .markdown-body code {
    padding: 1px 5px 2px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--rag-text) 7%, transparent);
    color: color-mix(in srgb, var(--rag-text) 76%, var(--rag-gold-strong));
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.92em;
  }

  .markdown-body pre {
    max-width: 100%;
    margin: 8px 0 10px;
    padding: 11px 12px;
    overflow-x: auto;
    border-radius: 10px;
    background: #0f172a;
    color: #f8fafc;
  }

  .markdown-body pre code {
    padding: 0;
    color: inherit;
    background: transparent;
  }

  .markdown-body blockquote {
    margin: 8px 0 10px;
    padding: 8px 10px;
    border-left: 3px solid var(--rag-gold);
    border-radius: 0 12px 12px 0;
    background: color-mix(in srgb, var(--rag-secondary-soft) 64%, transparent);
    color: color-mix(in srgb, var(--rag-text) 72%, var(--rag-muted));
  }

  .markdown-body a {
    color: var(--rag-gold-strong);
    font-weight: 750;
    text-decoration: none;
    border-bottom: 1px solid color-mix(in srgb, var(--rag-gold) 32%, transparent);
  }

  .typing {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-left: 8px;
    min-width: 46px;
    height: 18px;
    vertical-align: middle;
  }

  .typing span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--rag-gold);
    animation: typing 1.05s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }

  .typing span:nth-child(2) {
    animation-delay: 0.12s;
  }

  .typing span:nth-child(3) {
    animation-delay: 0.24s;
  }

  .pet-compact-sources {
    margin-top: 8px;
    animation: source-list-in 0.16s ease-out;
  }

  .pet-source-list {
    display: grid;
    gap: 5px;
    padding: 5px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 64%, transparent);
    border-radius: 13px;
    background: color-mix(in srgb, var(--rag-paper) 78%, transparent);
  }

  .pet-source-row {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr) 16px;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    padding: 5px 7px;
    border-radius: 10px;
    color: #334155;
    text-decoration: none;
    transition:
      background 0.14s ease,
      color 0.14s ease;
  }

  .pet-source-row:hover {
    color: var(--rag-text);
    background: color-mix(in srgb, var(--rag-gold-faint) 74%, white);
  }

  .pet-source-icon,
  .pet-source-open {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--rag-gold-strong);
  }

  .pet-source-icon {
    width: 22px;
    height: 22px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--rag-gold-soft) 34%, transparent);
  }

  .pet-source-title {
    overflow: hidden;
    color: inherit;
    font-size: 12px;
    font-weight: 720;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-source-icon svg,
  .pet-source-icon .iconify-icon,
  .pet-source-open svg,
  .pet-source-open .iconify-icon {
    width: 14px;
    height: 14px;
  }

  .selection-popover {
    position: fixed;
    z-index: 100000;
    transform: translate(-50%, -100%);
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px;
    border-radius: 999px;
    background: var(--rag-frost);
    border: 1px solid var(--rag-line);
    box-shadow:
      0 18px 44px rgba(18, 18, 18, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.34);
    backdrop-filter: blur(18px) saturate(1.08);
    animation: source-list-in 0.14s ease-out;
  }

  .selection-popover button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    border: 0;
    border-radius: 999px;
    padding: 0 13px;
    color: var(--rag-text);
    font-size: 13px;
    font-weight: 720;
    background: transparent;
    cursor: pointer;
  }

  .selection-popover button:hover {
    background: var(--rag-secondary-soft);
  }

  .selection-popover svg,
  .selection-popover .iconify-icon {
    width: 16px;
    height: 16px;
  }
`,Vs=Q`
  .bubble-wrapper {
    position: relative;
    z-index: 100001;
    display: inline-flex;
    width: var(--rag-pet-width, 76px);
    height: var(--rag-pet-height, 82px);
  }

  .bubble {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--rag-pet-width, 76px);
    min-width: var(--rag-pet-width, 76px);
    height: var(--rag-pet-height, 82px);
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    overflow: visible;
    appearance: none;
    -webkit-appearance: none;
    transition:
      transform 0.22s cubic-bezier(0.2, 0.82, 0.2, 1),
      filter 0.18s ease;
  }

  .bubble:hover,
  .bubble:focus-visible {
    transform: translateY(-2px);
    filter: saturate(1.04);
  }

  .bubble:active {
    transform: translateY(0) scale(0.98);
  }

  .bubble.dragging,
  .bubble.dragging:hover,
  .bubble.dragging:focus-visible {
    cursor: grabbing;
    transform: scale(0.985);
    transition: none;
  }

  .pet-sprite {
    position: relative;
    z-index: 2;
    display: block;
    width: var(--rag-pet-width, 76px);
    height: var(--rag-pet-height, 82px);
    background-repeat: no-repeat;
    background-position:
      var(--rag-pet-frame-x, 0)
      var(--rag-pet-frame-y, 0);
    background-size:
      var(--rag-pet-sheet-width, 608px)
      var(--rag-pet-sheet-height, 738px);
    filter: drop-shadow(0 14px 20px rgba(15, 23, 42, 0.23));
    image-rendering: pixelated;
    transition:
      filter 0.18s ease,
      transform 0.18s ease;
  }

  .bubble:hover .pet-sprite,
  .bubble:focus-visible .pet-sprite {
    filter:
      drop-shadow(0 16px 24px rgba(15, 23, 42, 0.24))
      drop-shadow(0 0 14px color-mix(in srgb, var(--rag-gold) 28%, transparent));
  }

  .bubble.dragging .pet-sprite {
    filter: drop-shadow(0 18px 24px rgba(15, 23, 42, 0.28));
  }

  .pet-speech {
    position: absolute;
    z-index: 1;
    bottom: calc(100% + 8px);
    width: max-content;
    max-width: min(196px, calc(100vw - 32px));
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 58%, white);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.82));
    color: #334155;
    box-shadow:
      0 10px 24px rgba(15, 23, 42, 0.11),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
    font-size: 12px;
    font-weight: 620;
    line-height: 1.38;
    text-align: left;
    white-space: normal;
    pointer-events: none;
    opacity: 0;
    transform: translateY(7px) scale(0.94);
    transform-origin: bottom center;
    transition:
      opacity 0.24s ease,
      transform 0.34s cubic-bezier(0.18, 0.89, 0.32, 1.16);
    backdrop-filter: blur(14px) saturate(1.08);
    -webkit-backdrop-filter: blur(14px) saturate(1.08);
  }

  .pet-speech.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  :host([position='right']) .pet-speech,
  :host([position='right']) .pet-panel {
    right: 0;
  }

  :host([position='left']) .pet-speech,
  :host([position='left']) .pet-panel {
    left: 0;
  }

  .pet-panel {
    position: absolute;
    z-index: 4;
    bottom: calc(100% + 12px);
    width: min(388px, calc(100vw - 32px));
    padding: 12px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 62%, white);
    border-radius: 20px;
    background:
      radial-gradient(circle at 14% 0%, color-mix(in srgb, var(--rag-gold) 11%, transparent), transparent 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), color-mix(in srgb, var(--rag-panel) 92%, white));
    box-shadow:
      0 22px 58px rgba(15, 23, 42, 0.18),
      0 8px 20px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
    text-align: left;
    transform-origin: bottom right;
    animation: pet-panel-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(18px) saturate(1.05);
    -webkit-backdrop-filter: blur(18px) saturate(1.05);
  }

  .pet-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .pet-panel-title {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .pet-panel-kicker {
    overflow: hidden;
    color: color-mix(in srgb, var(--rag-muted) 82%, var(--rag-text));
    font-size: 11px;
    font-weight: 740;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-panel-title strong {
    color: #263244;
    font-size: 15px;
    font-weight: 850;
    line-height: 1.25;
  }

  .pet-panel-actions {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .pet-panel-action,
  .pet-source-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 28px;
    padding: 0 9px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 72%, transparent);
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-text) 76%, var(--rag-muted));
    background: color-mix(in srgb, var(--rag-paper) 82%, transparent);
    box-shadow: 0 5px 12px rgba(15, 23, 42, 0.04);
    cursor: pointer;
    font-size: 12px;
    font-weight: 760;
    line-height: 1;
    white-space: nowrap;
    transition:
      transform 0.14s ease,
      background 0.14s ease,
      color 0.14s ease,
      border-color 0.14s ease;
  }

  .pet-panel-action.is-primary {
    color: var(--rag-primary-contrast);
    border-color: color-mix(in srgb, var(--rag-gold) 42%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 92%, white), var(--rag-gold-strong));
  }

  .pet-panel-action:hover,
  .pet-source-link:hover {
    transform: translateY(-1px);
    color: var(--rag-text);
    border-color: color-mix(in srgb, var(--rag-gold) 22%, var(--rag-line));
    background: var(--rag-paper);
  }

  .pet-panel-action.is-primary:hover {
    color: var(--rag-primary-contrast);
    background: linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 94%, white), var(--rag-gold-strong));
  }

  .pet-panel-action svg,
  .pet-panel-action .iconify-icon,
  .pet-source-link svg,
  .pet-source-link .iconify-icon {
    width: 14px;
    height: 14px;
  }

  .pet-context,
  .pet-answer,
  .pet-panel-empty {
    margin-bottom: 10px;
    border-radius: 14px;
  }

  .pet-context {
    position: relative;
    display: grid;
    gap: 4px;
    padding: 8px 34px 8px 10px;
    border: 1px solid color-mix(in srgb, var(--rag-gold) 18%, var(--rag-line));
    background: color-mix(in srgb, var(--rag-gold-faint) 82%, white);
  }

  .pet-context span {
    color: var(--rag-gold-strong);
    font-size: 11px;
    font-weight: 820;
    line-height: 1;
  }

  .pet-context p {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    color: #475569;
    font-size: 12px;
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .pet-context button {
    position: absolute;
    top: 7px;
    right: 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-muted) 86%, var(--rag-text));
    background: transparent;
    cursor: pointer;
  }

  .pet-answer {
    padding: 10px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 68%, transparent);
    background: color-mix(in srgb, var(--rag-paper) 84%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.54);
  }

  .pet-answer.error {
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 247, 247, 0.94);
  }

  .pet-answer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 7px;
    color: color-mix(in srgb, var(--rag-muted) 86%, transparent);
    font-size: 11px;
    line-height: 1;
  }

  .pet-answer-meta span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-answer-meta time {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .pet-answer-body {
    max-height: 150px;
    overflow: auto;
    color: #263244;
    font-size: 12.8px;
    line-height: 1.62;
    scrollbar-width: thin;
  }

  .pet-source-link {
    margin-top: 8px;
    min-height: 26px;
    color: var(--rag-gold-strong);
    background: color-mix(in srgb, var(--rag-gold-faint) 68%, white);
  }

  .pet-panel-empty {
    padding: 10px 11px;
    border: 1px dashed color-mix(in srgb, var(--rag-line) 74%, transparent);
    color: color-mix(in srgb, var(--rag-muted) 90%, var(--rag-text));
    background: color-mix(in srgb, var(--rag-panel) 76%, white);
    font-size: 12.5px;
    font-weight: 650;
  }
`,Ys=Q`
  .pet-stage-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99997;
    background:
      radial-gradient(circle at 50% 28%, rgba(32, 68, 148, 0.2), transparent 34%),
      radial-gradient(circle at 34% 72%, color-mix(in srgb, var(--rag-gold) 18%, transparent), transparent 28%),
      linear-gradient(180deg, rgba(8, 10, 16, 0.43), rgba(5, 7, 12, 0.74));
    backdrop-filter: blur(5px) saturate(0.9);
    -webkit-backdrop-filter: blur(5px) saturate(0.9);
    animation: stage-backdrop-in 0.2s ease-out;
  }

  .pet-stage {
    position: fixed;
    z-index: 99999;
    inset: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: clamp(12px, 2vh, 22px);
    min-width: 0;
    overflow: visible;
    padding:
      clamp(20px, 4vh, 46px)
      max(28px, calc((100vw - 1680px) / 2 + 42px))
      clamp(18px, 3.6vh, 42px);
    background: transparent;
    pointer-events: none;
    animation: stage-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pet-stage-head {
    width: min(1360px, 100%);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0;
    pointer-events: auto;
  }

  .pet-stage-title {
    display: grid;
    align-items: start;
    min-width: 0;
    gap: 5px;
  }

  .pet-stage-title span {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.76);
    font-size: 14px;
    font-weight: 840;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.28);
  }

  .pet-stage-title strong {
    color: rgba(255, 255, 255, 0.92);
    font-size: 20px;
    font-weight: 860;
    line-height: 1.18;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.34);
  }

  .pet-stage-actions {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .pet-stage-action,
  .pet-stage-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: rgba(255, 255, 255, 0.86);
    background: rgba(255, 255, 255, 0.16);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
    cursor: pointer;
    transition:
      transform 0.14s ease,
      background 0.14s ease,
      color 0.14s ease,
      border-color 0.14s ease;
    backdrop-filter: blur(16px) saturate(1.1);
    -webkit-backdrop-filter: blur(16px) saturate(1.1);
  }

  .pet-stage-action {
    gap: 6px;
    min-height: 40px;
    padding: 0 15px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 780;
    white-space: nowrap;
  }

  .pet-stage-close {
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 999px;
  }

  .pet-stage-action:hover,
  .pet-stage-close:hover {
    transform: translateY(-1px);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.26);
    background: rgba(255, 255, 255, 0.24);
  }

  .pet-stage-action:disabled,
  .pet-stage-shortcuts button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
    transform: none;
  }

  .pet-stage-action svg,
  .pet-stage-action .iconify-icon,
  .pet-stage-close svg,
  .pet-stage-close .iconify-icon {
    width: 15px;
    height: 15px;
  }

  .pet-stage-output {
    align-self: stretch;
    width: min(1320px, 100%);
    margin: 0 auto;
    min-height: 0;
    max-height: none;
    overflow: auto;
    padding: clamp(28px, 5vh, 70px) 4px 6px;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    scroll-behavior: smooth;
    pointer-events: auto;
    mask-image: linear-gradient(180deg, transparent 0, #000 28px, #000 calc(100% - 10px), transparent 100%);
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 28px, #000 calc(100% - 10px), transparent 100%);
  }

  .pet-stage-output-inner {
    width: min(1180px, 100%);
    margin: 0 auto;
  }

  .pet-stage-output::-webkit-scrollbar {
    width: 10px;
  }

  .pet-stage-output::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background:
      linear-gradient(rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.24))
      content-box;
  }

  .pet-stage-message {
    display: flex;
    gap: 14px;
    margin-bottom: 24px;
    min-width: 0;
    animation: message-in 0.18s ease-out both;
  }

  .pet-stage-message.user {
    justify-content: flex-end;
  }

  .pet-stage-avatar {
    position: relative;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    margin-top: 1px;
    border-radius: 999px;
    color: var(--rag-primary-contrast);
    background:
      radial-gradient(circle at 32% 20%, rgba(255, 255, 255, 0.24), transparent 26%),
      linear-gradient(145deg, var(--rag-gold), var(--rag-gold-strong));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 22%, transparent),
      0 5px 14px color-mix(in srgb, var(--rag-gold) 12%, transparent);
    font-size: 12px;
    font-weight: 820;
    overflow: hidden;
  }

  .pet-stage-avatar.has-image {
    background: color-mix(in srgb, var(--rag-paper) 86%, white);
  }

  .pet-stage-avatar-fallback {
    position: relative;
    z-index: 1;
  }

  .pet-stage-avatar.has-image .pet-stage-avatar-fallback {
    opacity: 0;
  }

  .pet-stage-avatar-image {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pet-stage-message-stack {
    flex: 0 1 auto;
    min-width: 0;
    width: fit-content;
    max-width: min(92%, 960px);
  }

  .pet-stage-message.assistant .pet-stage-message-stack {
    width: min(100%, 1120px);
    max-width: min(100%, 1120px);
  }

  .pet-stage-message.user .pet-stage-message-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    max-width: min(72%, 620px);
  }

  .pet-stage-bubble {
    position: relative;
    display: inline-block;
    width: fit-content;
    max-width: 100%;
    padding: 12px 15px 13px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(18, 22, 32, 0.42);
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    font-size: 14px;
    line-height: 1.72;
    word-break: break-word;
    overflow-wrap: anywhere;
    backdrop-filter: blur(18px) saturate(1.08);
    -webkit-backdrop-filter: blur(18px) saturate(1.08);
  }

  .pet-stage-message.assistant .pet-stage-bubble {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    border-radius: 0;
    color: rgba(255, 255, 255, 0.9);
    background: transparent;
    box-shadow: none;
    font-size: clamp(17px, 1.28vw, 22px);
    line-height: 1.9;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.34);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .pet-stage-bubble.streaming {
    border-color: color-mix(in srgb, var(--rag-gold) 30%, var(--rag-line));
  }

  .pet-stage-bubble.error {
    color: #9f1d1d;
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 247, 247, 0.96);
  }

  .pet-stage-message.user .pet-stage-bubble {
    padding: 12px 15px 13px;
    border-radius: 20px;
    color: var(--rag-primary-contrast);
    background:
      linear-gradient(145deg, var(--rag-user-message-start), var(--rag-user-message-end));
    border-color: color-mix(in srgb, var(--rag-gold) 46%, transparent);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.16) inset,
      0 8px 18px color-mix(in srgb, var(--rag-gold) 16%, transparent);
  }

  .pet-stage .markdown-body h1,
  .pet-stage .markdown-body h2,
  .pet-stage .markdown-body h3,
  .pet-stage .markdown-body h4 {
    color: rgba(255, 255, 255, 0.94);
  }

  .pet-stage .markdown-body code {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.92);
  }

  .pet-stage .markdown-body blockquote {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.78);
  }

  .pet-stage .markdown-body a {
    color: rgba(255, 236, 192, 0.96);
    border-bottom-color: rgba(255, 236, 192, 0.28);
  }

  .pet-stage-time {
    margin-top: 7px;
    color: rgba(255, 255, 255, 0.54);
    font-size: 11.5px;
    line-height: 1;
  }

  .pet-stage-message.user .pet-stage-time {
    color: var(--rag-muted);
  }

  .pet-stage-sources {
    margin-top: 8px;
  }

  .pet-stage-sources summary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.14);
    cursor: pointer;
    font-size: 12px;
    font-weight: 780;
    list-style: none;
  }

  .pet-stage-sources summary::-webkit-details-marker {
    display: none;
  }

  .pet-stage-sources summary svg,
  .pet-stage-sources summary .iconify-icon {
    width: 14px;
    height: 14px;
  }

  .pet-stage-sources .pet-source-list {
    margin-top: 6px;
    width: min(100%, 560px);
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(18px) saturate(1.08);
    -webkit-backdrop-filter: blur(18px) saturate(1.08);
  }

  .pet-stage-sources .pet-source-row {
    color: rgba(255, 255, 255, 0.82);
  }

  .pet-stage-sources .pet-source-row:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.13);
  }

  .pet-stage-sources .pet-source-icon,
  .pet-stage-sources .pet-source-open {
    color: rgba(255, 236, 192, 0.92);
  }

  .pet-stage-sources .pet-source-icon {
    background: rgba(255, 255, 255, 0.12);
  }

  .pet-stage-footer {
    width: min(980px, 100%);
    margin: 0 auto;
    padding: 0;
    background: transparent;
    pointer-events: auto;
  }

  .pet-stage-shortcuts {
    display: flex;
    justify-content: center;
    gap: 2px;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto 10px;
    overflow-x: auto;
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    background: rgba(14, 18, 28, 0.22);
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    scrollbar-width: none;
    backdrop-filter: blur(18px) saturate(1.08);
    -webkit-backdrop-filter: blur(18px) saturate(1.08);
  }

  .pet-stage-shortcuts::-webkit-scrollbar {
    display: none;
  }

  .pet-stage-shortcuts button {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 11px;
    border: 0;
    border-radius: 13px;
    color: rgba(255, 255, 255, 0.76);
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 720;
    white-space: nowrap;
    transition:
      transform 0.14s ease,
      color 0.14s ease,
      background 0.14s ease,
      border-color 0.14s ease;
  }

  .pet-stage-shortcuts button:hover:not(:disabled) {
    transform: translateY(-1px);
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
  }

  .pet-stage-shortcuts svg,
  .pet-stage-shortcuts .iconify-icon {
    width: 16px;
    height: 16px;
  }

  .pet-stage-note {
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 680;
    text-align: center;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.34);
  }

  .pet-stage .composer-wrap {
    width: min(980px, 100%);
  }

  .pet-stage .composer {
    min-height: 96px;
    padding: 16px 16px 14px 20px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 24px;
    background:
      radial-gradient(circle at 14% 12%, rgba(255, 255, 255, 0.08), transparent 26%),
      linear-gradient(112deg, rgba(73, 61, 76, 0.42), rgba(37, 73, 67, 0.38) 52%, rgba(42, 58, 100, 0.44));
    box-shadow:
      0 22px 60px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      inset 0 -1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(24px) saturate(1.08);
    -webkit-backdrop-filter: blur(24px) saturate(1.08);
  }

  .pet-stage .composer:focus-within {
    border-color: rgba(255, 255, 255, 0.2);
    background:
      radial-gradient(circle at 14% 12%, rgba(255, 255, 255, 0.1), transparent 26%),
      linear-gradient(112deg, rgba(78, 64, 80, 0.5), rgba(38, 83, 73, 0.46) 52%, rgba(43, 60, 112, 0.52));
    box-shadow:
      0 24px 66px rgba(0, 0, 0, 0.26),
      0 0 0 1px rgba(255, 255, 255, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.16);
  }

  .pet-stage .input {
    min-height: 58px;
    max-height: 150px;
    padding: 5px 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 16.5px;
    font-weight: 590;
    line-height: 1.55;
  }

  .pet-stage .input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .pet-stage .send {
    width: 42px;
    height: 42px;
    align-self: flex-end;
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.88);
    background: rgba(255, 255, 255, 0.15);
    box-shadow:
      0 12px 28px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }

  .pet-stage .send:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.23);
  }

  @media (max-width: 960px) {
    :host,
    :host([position='left']) {
      right: 16px;
      left: auto;
      bottom: 16px;
    }

    .bubble,
    .bubble-wrapper {
      width: var(--rag-pet-width, 76px);
      min-width: var(--rag-pet-width, 76px);
      height: var(--rag-pet-height, 82px);
    }

    .pet-speech {
      max-width: min(176px, calc(100vw - 32px));
      font-size: 11.5px;
    }

    .pet-panel {
      width: min(344px, calc(100vw - 32px));
      max-height: min(560px, calc(100dvh - 132px));
      overflow-y: auto;
    }

    .pet-panel-head {
      flex-direction: column;
      gap: 8px;
    }

    .pet-panel-actions {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .pet-stage {
      gap: 10px;
      padding: 14px 12px 16px;
    }

    .pet-stage-head {
      gap: 10px;
    }

    .pet-stage-title {
      display: grid;
      gap: 4px;
    }

    .pet-stage-title span {
      max-width: calc(100vw - 140px);
      font-size: 12px;
    }

    .pet-stage-title strong {
      font-size: 14px;
    }

    .pet-stage-output {
      padding: 16px 2px 4px;
    }

    .pet-stage-message-stack,
    .pet-stage-message.user .pet-stage-message-stack {
      max-width: 88%;
    }

    .pet-stage-message.assistant .pet-stage-message-stack {
      max-width: 100%;
      width: 100%;
    }

    .pet-stage-message.assistant .pet-stage-bubble {
      font-size: 16px;
      line-height: 1.82;
    }

    .pet-stage-footer {
      width: 100%;
    }

    .pet-stage-shortcuts {
      justify-content: flex-start;
      margin-bottom: 10px;
    }

    .pet-stage-shortcuts button {
      min-height: 36px;
      padding: 0 13px;
      font-size: 12px;
    }

    .pet-stage .composer {
      min-height: 96px;
      padding: 15px 15px 13px 18px;
      border-radius: 22px;
    }

    .pet-stage .input {
      min-height: 58px;
      font-size: 16px;
    }

    .pet-stage .send {
      width: 42px;
      height: 42px;
    }

    .pet-stage-note {
      margin-top: 10px;
      font-size: 11px;
    }
  }
`,Ks=[qs,Vs,Gs,Ws,Ys];function wt(e,t,r={}){return{id:r.id||St(),role:e,content:t,time:r.time||pt(),sources:r.sources,streaming:r.streaming,error:r.error}}function Xs(e,t,r){return e.map(s=>s.id===t?r(s):s)}function St(){return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}const ut={visible:!1,text:"",x:0,y:0};function Js(e){const t=window.getSelection();if(!t||t.isCollapsed||t.rangeCount===0)return ut;const r=t.toString().replace(/\s+/g," ").trim();if(r.length<2||Qs(t))return ut;const i=t.getRangeAt(0).getBoundingClientRect();if(!i||i.width===0&&i.height===0)return ut;const n=Math.max(72,Math.min(i.left+i.width/2,window.innerWidth-72)),o=Math.max(42,i.top-12);return{visible:!0,text:r.slice(0,e),x:Math.round(n),y:Math.round(o)}}function Qs(e){return Fe(e.anchorNode)||Fe(e.focusNode)}function Fe(e){return!!(e instanceof Element?e:e?.parentElement)?.closest('input, textarea, select, [contenteditable="true"], summaraid-rag-assistant')}class I extends Error{status;response;constructor(t,r={}){super(t),this.name="AIUIError",this.status=r.status,this.response=r.response,r.cause!==void 0&&Object.defineProperty(this,"cause",{configurable:!0,enumerable:!1,value:r.cause})}}class A extends I{constructor(t,r={}){super(t,r),this.name="AIUIProtocolError"}}class Zs extends A{target;partType;partName;partId;constructor(t,r){super(t,{cause:r.cause}),this.name="AIUISchemaValidationError",this.target=r.target,this.partType=r.partType,this.partName=r.partName,this.partId=r.partId}}function Ct(e){return e instanceof Error?e:new Error(String(e))}function ti(e){return e instanceof A}function ei(e){return(e instanceof DOMException||e instanceof Error)&&e.name==="AbortError"}let He=0;function At(e="msg"){return He+=1,`${e}_${Date.now().toString(36)}_${He.toString(36)}`}function ri(e){if(ni(e))return e;const t=e;if(typeof t.toJSONSchema=="function")return t.toJSONSchema();const r=e;if(typeof r.toJsonSchema=="function")return r.toJsonSchema();throw new I("A JSON Schema object is required unless the schema can export JSON Schema.")}function je(e,t,r){return si(e,t,{makeError:(s,i)=>new Zs(`UI message ${r.target} validation failed: ${s}`,{...r,cause:i})})}function si(e,t,r){if(oi(t))try{const n=t["~standard"].validate(e);if(ai(n))throw r.makeError("Async schemas are not supported for UI message streams.");if("issues"in n&&n.issues&&n.issues.length>0)throw r.makeError(li(n.issues),n.issues);return n.value}catch(n){throw Vt(n)?n:r.makeError(ht(n),n)}const s=t;if(typeof s.safeParse=="function")try{const n=s.safeParse(e);if(!n.success)throw r.makeError(ht(n.error),n.error);return n.data}catch(n){throw Vt(n)?n:r.makeError(ht(n),n)}const i=t;if(typeof i.parse=="function")try{return i.parse(e)}catch(n){throw r.makeError(ht(n),n)}try{return Gt(e,ri(t),"$"),e}catch(n){throw Vt(n)?n:r.makeError(ht(n),n)}}function Gt(e,t,r){if(t.enum&&!t.enum.some(s=>Object.is(s,e)))throw new I(`${r} must be one of ${t.enum.join(", ")}`);if(t.type==="object"||t.properties){if(!ci(e))throw new I(`${r} must be an object`);for(const s of t.required??[])if(!(s in e))throw new I(`${r}.${s} is required`);for(const[s,i]of Object.entries(t.properties??{}))e[s]!==void 0&&Gt(e[s],i,`${r}.${s}`);return}if(t.type==="array"||t.items){if(!Array.isArray(e))throw new I(`${r} must be an array`);t.items&&e.forEach((s,i)=>Gt(s,t.items,`${r}[${i}]`));return}if(t.type&&!ii(e,t.type))throw new I(`${r} must be ${t.type}`)}function ii(e,t){switch(t){case"string":return typeof e=="string";case"number":return typeof e=="number";case"integer":return Number.isInteger(e);case"boolean":return typeof e=="boolean";case"null":return e===null;default:return!0}}function ni(e){return typeof e=="object"&&e!==null&&("type"in e||"properties"in e)}function oi(e){return typeof e=="object"&&e!==null&&"~standard"in e&&typeof e["~standard"]?.validate=="function"}function ai(e){return typeof e=="object"&&e!==null&&typeof e.then=="function"}function Vt(e){return e instanceof I}function li(e){return e.map(t=>`${t.path?.length?`${t.path.map(String).join(".")}: `:""}${t.message??"Invalid value"}`).join("; ")}function ht(e){return e instanceof Error?e.message:typeof e=="object"&&e!==null&&"message"in e?String(e.message):String(e)}function ci(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function pi(e={}){return{message:e.message??{id:e.messageId??At("msg"),role:"assistant",parts:[],metadata:e.metadata},terminal:{},visible:!!e.message?.parts.length,messageMetadataSchema:e.messageMetadataSchema,dataPartSchemas:e.dataPartSchemas}}function di(e,t){if(ui(t),We(t)){if(!t.transient){const r=Si(e,t);U(e,{type:t.type,id:t.id,name:t.name,data:r,transientData:!1})}return e}if(Kt(t))return qe(e,Ci(t)),e;if(Ge(t))return qe(e,t),e;switch(t.type){case"start":e.message={...e.message,id:t.messageId??e.message.id,metadata:Yt(e,t.messageMetadata)};break;case"text-start":U(e,{type:"text",id:t.id,text:""});break;case"text-delta":fi(e,t.id,t.delta);break;case"text-end":break;case"reasoning-start":U(e,{type:"reasoning",id:t.id,text:""});break;case"reasoning-delta":bi(e,t.id,t.delta,t.providerMetadata);break;case"reasoning-end":break;case"message-metadata":e.message={...e.message,metadata:Yt(e,t.messageMetadata)};break;case"source-url":U(e,{type:"source-url",sourceId:t.sourceId??t.id??t.url,url:t.url,title:t.title,providerMetadata:t.providerMetadata});break;case"file":U(e,{type:"file",id:t.id,url:t.url,title:t.title,mediaType:t.mediaType,data:t.data,providerMetadata:t.providerMetadata});break;case"start-step":break;case"finish-step":e.terminal={...e.terminal,finishReason:t.finishReason??e.terminal.finishReason,rawFinishReason:t.rawFinishReason??e.terminal.rawFinishReason,usage:t.usage??e.terminal.usage};break;case"finish":e.message={...e.message,metadata:Yt(e,t.messageMetadata)},e.terminal=vi(e.terminal,t);break;case"error":e.terminal={...e.terminal,errorText:t.errorText};break;case"abort":e.terminal={...e.terminal,aborted:!0};break}return e}function ui(e){if(!e||typeof e.type!="string"||e.type.length===0)throw new A("UI message chunk type is required.");if(We(e)){if(Qt(e.name,/^[A-Za-z][A-Za-z0-9_-]*$/,"data name"),e.type!==`data-${e.name}`)throw new A(`Data chunk type must be data-${e.name}.`);if(!e.id)throw new A("Data chunk id is required.");return}if(Kt(e)){if(Ai(e.type,e.toolCallId,e.toolName),e.type==="tool-input-delta"&&!e.inputTextDelta)throw new A("Tool input-delta chunk inputTextDelta is required.");if(e.type==="tool-output-error"&&!e.errorText)throw new A("Tool output-error chunk errorText is required.");if((e.type==="tool-approval-request"||e.type==="tool-approval-response")&&!e.approvalId)throw new A("Tool approval chunk approvalId is required.");if(e.type==="tool-approval-response"&&typeof e.approved!="boolean")throw new A("Tool approval-response chunk approved is required.");return}if(Ge(e)){if(Qt(e.toolName,/^[A-Za-z][A-Za-z0-9_-]*$/,"tool name"),e.type!==`tool-${e.toolName}`)throw new A(`Tool chunk type must be tool-${e.toolName}.`);if(!e.toolCallId)throw new A("Tool chunk toolCallId is required.");if(!e.state)throw new A("Tool chunk state is required.");if(e.state==="output-error"&&!e.errorText)throw new A("Tool output-error chunk errorText is required.")}}function hi(e,t){const r=Tt(e,t.toolCallId);return $t(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"output-available",input:r?.input,output:t.output??t.result,approval:r?.approval,providerMetadata:t.providerMetadata??r?.providerMetadata})}function gi(e,t){const r=Tt(e,t.toolCallId);return $t(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"output-error",input:r?.input,errorText:t.errorText,approval:r?.approval,providerMetadata:t.providerMetadata??r?.providerMetadata})}function mi(e,t){const r=Tt(e,t.toolCallId);return $t(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"approval-responded",input:r?.input,errorText:r?.errorText,approval:{id:t.approvalId,approved:t.approved,reason:t.reason},providerMetadata:t.providerMetadata??r?.providerMetadata})}function fi(e,t,r){const s=e.message.parts.find(i=>i.type==="text"&&i.id===t);U(e,{type:"text",id:t,text:`${s?.text??""}${r??""}`})}function bi(e,t,r,s){const i=e.message.parts.find(n=>n.type==="reasoning"&&n.id===t);U(e,{type:"reasoning",id:t,text:`${i?.text??""}${r??""}`,providerMetadata:s??i?.providerMetadata})}function U(e,t){e.message=$t(e.message,t),e.visible=e.visible||yi(t)}function $t(e,t){const r=e.parts.findIndex(i=>xi(i,t)),s=[...e.parts];return r===-1?s.push(t):s[r]=t,{...e,parts:s}}function xi(e,t){if(e.type!==t.type)return!1;if(Xt(t))return Xt(e)&&e.id===t.id;switch(t.type){case"text":case"reasoning":case"file":return"id"in e&&e.id===t.id;case"source-url":return"sourceId"in e&&e.sourceId===t.sourceId;default:return Jt(t)?Jt(e)&&e.toolCallId===t.toolCallId:!1}}function yi(e){return!Xt(e)||!e.transientData}function vi(e,t){return{...e,finishReason:t.finishReason,rawFinishReason:t.rawFinishReason,usage:t.usage}}function wi(e,t){return t==null?e:Be(e)&&Be(t)?{...e,...t}:t}function Yt(e,t){const r=wi(e.message.metadata,t);return t==null||!e.messageMetadataSchema?r:je(r,e.messageMetadataSchema,{target:"message-metadata"})}function Si(e,t){const r=e.dataPartSchemas?.[t.name];return r?je(t.data,r,{target:"data-part",partType:t.type,partName:t.name,partId:t.id}):t.data}function Be(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function qe(e,t){const r=Tt(e.message,t.toolCallId),s=t.state==="input-streaming"?`${r?.inputText??""}${t.inputTextDelta??""}`:void 0;U(e,{type:t.type,toolCallId:t.toolCallId,toolName:t.toolName,state:t.state,input:t.input??r?.input,inputText:s,output:t.output??r?.output,errorText:t.errorText??r?.errorText,approval:t.approval??r?.approval,providerMetadata:t.providerMetadata??r?.providerMetadata})}function Ci(e){const t={type:`tool-${e.toolName}`,toolCallId:e.toolCallId,toolName:e.toolName,providerMetadata:"providerMetadata"in e?e.providerMetadata:void 0};switch(e.type){case"tool-input-start":return{...t,state:"input-streaming",inputTextDelta:""};case"tool-input-delta":return{...t,state:"input-streaming",inputTextDelta:e.inputTextDelta};case"tool-input-available":return{...t,state:"input-available",input:e.input};case"tool-output-available":return{...t,state:"output-available",output:e.output};case"tool-output-error":return{...t,state:"output-error",errorText:e.errorText};case"tool-approval-request":return{...t,state:"approval-requested",input:e.input,approval:{id:e.approvalId}};case"tool-approval-response":return{...t,state:"approval-responded",approval:{id:e.approvalId,approved:e.approved,reason:e.reason}}}}function Tt(e,t){return e.parts.find(r=>Jt(r)&&r.toolCallId===t)}function We(e){return e.type.startsWith("data-")}function Kt(e){return e.type==="tool-input-start"||e.type==="tool-input-delta"||e.type==="tool-input-available"||e.type==="tool-output-available"||e.type==="tool-output-error"||e.type==="tool-approval-request"||e.type==="tool-approval-response"}function Ge(e){return e.type.startsWith("tool-")&&!Kt(e)}function Xt(e){return e.type.startsWith("data-")}function Jt(e){return e.type.startsWith("tool-")}function Qt(e,t,r){if(!e||!t.test(e))throw new A(`${r} must be a simple identifier.`)}function Ai(e,t,r){if(Qt(r,/^[A-Za-z][A-Za-z0-9_-]*$/,"tool name"),!t)throw new A(`${e} chunk toolCallId is required.`)}const $i="X-Halo-AI-UI-Message-Stream",Ti="v1",Et="[DONE]";function Ei(e){const t=e.headers.get($i);if(t&&t!==Ti)throw new I(`Unsupported Halo UI message stream version: ${t}`,{response:e,status:e.status})}async function*Ii(e){const t=e.getReader(),r=new TextDecoder;try{for(;;){const{value:i,done:n}=await t.read();if(n)break;if(i){const o=r.decode(i,{stream:!0});o&&(yield o)}}const s=r.decode();s&&(yield s)}finally{t.releaseLock()}}async function*_i(e){let t="";for await(const s of Ii(e)){t+=s;const n=t.replace(/\r\n/g,`
`).split(`

`);t=n.pop()??"";for(const o of n){const l=Ve(o);l===Et||l==null||(yield l)}}const r=t.trim();if(r){const s=Ve(r);s!==Et&&s!=null&&(yield s)}}function Ve(e){const t=e.split(`
`).filter(s=>s.startsWith("data:")).map(s=>s.slice(5).trimStart());if(!t.length)return;const r=t.join(`
`).trim();if(!r||r===Et)return Et;try{return JSON.parse(r)}catch(s){throw new I("Failed to parse Halo UI message stream chunk.",{cause:s})}}class Pi{api;credentials;headers;body;fetch;prepareSendMessagesRequest;constructor(t={}){this.api=t.api??"/api/chat",this.credentials=t.credentials,this.headers=t.headers,this.body=t.body,this.fetch=t.fetch,this.prepareSendMessagesRequest=t.prepareSendMessagesRequest}async sendMessages(t){const r=await Zt(this.body),s=Mi(await Zt(this.headers),t.headers),i=t.credentials??await Zt(this.credentials),n={...r,...t.body,id:t.chatId,messages:t.messages,trigger:t.trigger,messageId:t.messageId??null},o=await this.prepareSendMessagesRequest?.({...t,api:this.api,body:n,headers:s,credentials:i}),l=await this.fetchResponse({api:o?.api??this.api,body:o?.body??n,headers:o?.headers??s,credentials:o?.credentials??i,abortSignal:t.abortSignal});return this.processResponse(l)}async fetchResponse(t){const r=this.fetch??globalThis.fetch;if(!r)throw new I("No fetch implementation is available.");const s=await r(t.api,{method:"POST",headers:{"Content-Type":"application/json",...Ke(t.headers)},body:JSON.stringify(t.body),credentials:t.credentials,signal:t.abortSignal});if(!s.ok)throw new I(await s.text()||"Failed to fetch chat response.",{status:s.status,response:s});if(!s.body)throw new I("The response body is empty.",{status:s.status,response:s});return s}}class Ye extends Pi{processResponse(t){return Ei(t),_i(t.body)}}async function Zt(e){return typeof e=="function"?await e():e}function Mi(...e){return Object.assign({},...e.map(Ke))}function Ke(e){return e?e instanceof Headers?Object.fromEntries(e.entries()):Array.isArray(e)?Object.fromEntries(e):e:{}}class Ni{id;generateId;state;transport;onError;onData;onToolCall;onAutomaticStepLimitExceeded;onFinish;sendAutomaticallyWhen;maxAutomaticSteps;messageMetadataSchema;dataPartSchemas;notifiedToolCalls=new Set;consumedAutomaticContinuationKeys=new Set;listeners=new Set;activeAbortController;automaticStepCount=0;hasPendingAutomaticContinuation=!1;pendingAutomaticContinuationOptions;toolCallbackFailure;constructor(t={}){this.generateId=t.generateId??(()=>At("msg")),this.id=t.id??this.generateId(),this.state=t.state??ki({messages:t.messages??[]}),this.transport=t.transport??new Ye,this.onError=t.onError,this.onData=t.onData,this.onToolCall=t.onToolCall,this.onAutomaticStepLimitExceeded=t.onAutomaticStepLimitExceeded,this.onFinish=t.onFinish,this.sendAutomaticallyWhen=t.sendAutomaticallyWhen,this.maxAutomaticSteps=Bi(t.maxAutomaticSteps),this.messageMetadataSchema=t.messageMetadataSchema,this.dataPartSchemas=t.dataPartSchemas}get messages(){return this.state.getMessages()}set messages(t){this.setMessages(t)}get status(){return this.state.getStatus()}get error(){return this.state.getError()}setMessages(t){this.setChatMessages([...t])}clearError(){this.setChatError(void 0),(this.status==="error"||this.status==="disconnected")&&this.setChatStatus("ready")}subscribe(t){return this.listeners.add(t),()=>{this.listeners.delete(t)}}async sendMessage(t,r){this.resetAutomaticContinuation(),t&&this.applyUserMessage(t),await this.makeRequest({trigger:"submit-message",messageId:t?.messageId,options:r})}async regenerate({messageId:t,...r}={}){this.resetAutomaticContinuation();const s=this.messages,i=t==null?Xe(s,o=>o.role==="assistant"):s.findIndex(o=>o.id===t);if(i===-1)throw new Error(`message ${t??"<last assistant>"} not found`);const n=s[i].role==="assistant"?i:i+1;this.setMessages(s.slice(0,n)),await this.makeRequest({trigger:"regenerate-message",messageId:t,options:r,requestMessages:s})}stop(){this.activeAbortController?.abort()}async appendToolOutputSuccess(t,r){const s=this.resolveToolCall(t.toolCallId,t.toolName);this.updateLastAssistant(i=>hi(i,{...t,toolName:s.toolName})),await this.maybeSendAutomaticallyAfterToolUpdate(r)}async appendToolOutputError(t,r){const s=this.resolveToolCall(t.toolCallId,t.toolName);this.updateLastAssistant(i=>gi(i,{...t,toolName:s.toolName})),await this.maybeSendAutomaticallyAfterToolUpdate(r)}async addToolOutput(t,r){const s=t.toolName??t.tool;if("state"in t&&t.state==="output-error"){await this.appendToolOutputError({toolCallId:t.toolCallId,toolName:s,errorText:t.errorText,providerMetadata:t.providerMetadata},r);return}const i=t;await this.appendToolOutputSuccess({toolCallId:i.toolCallId,toolName:s,result:i.output??i.result,providerMetadata:i.providerMetadata},r)}async rejectToolCall(t,r){await this.addToolApprovalResponse({...t,approved:!1},r)}async addToolApprovalResponse(t,r){const s=t.id||t.approvalId?this.resolveApprovalRequest(t.id??t.approvalId):void 0,i=t.toolCallId??s?.toolCallId;if(!i)throw new Error("Tool call id is required.");const n=this.resolveToolCall(i,t.toolName??t.tool);this.updateLastAssistant(o=>mi(o,{approvalId:s?.approval?.id??t.id??t.approvalId??i,toolCallId:i,toolName:t.toolName??t.tool??n.toolName,approved:t.approved,reason:t.reason,providerMetadata:t.providerMetadata})),await this.maybeSendAutomaticallyAfterToolUpdate(r)}applyUserMessage(t){const r=this.messages,s={id:t.id??this.generateId(),role:t.role??"user",parts:this.userMessageParts(t),metadata:t.metadata};if(t.messageId){const i=r.findIndex(n=>n.id===t.messageId);if(i===-1)throw new Error(`message with id ${t.messageId} not found`);if(r[i].role!=="user")throw new Error(`message with id ${t.messageId} is not a user message`);this.setMessages([...r.slice(0,i),{...s,id:t.messageId}]);return}this.setMessages([...r,s])}userMessageParts(t){if(t.parts)return t.parts;const r=[];t.text!=null&&r.push({type:"text",id:At("text"),text:t.text});for(const s of t.files??[])r.push({type:"file",id:s.id??At("file"),url:s.url,title:s.title,mediaType:s.mediaType,data:s.data,providerMetadata:s.providerMetadata});return r}async makeRequest({trigger:t,messageId:r,options:s,requestMessages:i,reducerMessage:n}){const o=await this.consumeAssistantStream({reducerMessage:n??{id:this.generateId(),role:"assistant",parts:[]},createStream:l=>this.transport.sendMessages({chatId:this.id,messages:Fi(i??this.messages),trigger:t,messageId:r,headers:s?.headers,body:s?.body,credentials:s?.credentials,metadata:s?.metadata,abortSignal:l})});this.status==="ready"&&!o.isAbort&&!o.isError?await this.maybeSendAutomatically(this.consumePendingAutomaticContinuationOptions(s)):this.clearPendingAutomaticContinuation()}async consumeAssistantStream({reducerMessage:t,createStream:r}){this.setChatStatus("submitted"),this.setChatError(void 0),this.toolCallbackFailure=void 0;let s=!1,i=!1,n=!1;const o=new AbortController;this.activeAbortController=o;const l=pi({message:t,messageMetadataSchema:this.messageMetadataSchema,dataPartSchemas:this.dataPartSchemas});try{const a=await r(o.signal);for await(const p of a)this.applyAssistantChunk(l,p),n=!0,this.setChatStatus("streaming");if(this.toolCallbackFailure)i=!0,this.failChat(this.toolCallbackFailure);else if(l.terminal.errorText){i=!0;const p=new Error(l.terminal.errorText);this.setChatError(p),this.setChatStatus("error"),this.onError?.(p)}else this.setChatStatus("ready")}catch(a){if(ei(a)||o.signal.aborted)return s=!0,this.setChatStatus("ready"),{isAbort:s,isError:i};o.abort(),i=!0;const p=Ct(a);this.setChatError(p),n&&!ti(p)?(i=!1,this.setChatStatus("disconnected")):this.setChatStatus("error"),this.onError?.(p)}finally{this.activeAbortController===o&&(this.activeAbortController=void 0),await this.onFinish?.({message:l.message,messages:this.messages,terminal:l.terminal,isAbort:s,isError:i})}return{isAbort:s,isError:i}}applyAssistantChunk(t,r){di(t,r);let s;Gi(r)&&this.onData?.(Vi(t.message,r));const i=t.message.parts[t.message.parts.length-1];if(i&&M(i)&&i.state==="input-available"){const l=i;this.notifiedToolCalls.has(l.toolCallId)||(this.notifiedToolCalls.add(l.toolCallId),s=l)}if(!t.visible&&r.type!=="error"&&r.type!=="abort")return;const n=this.messages,o=n[n.length-1];o?.role==="assistant"&&o.id===t.message.id?(t.message=zi(t.message,o),this.setMessages([...n.slice(0,-1),t.message])):this.setMessages([...n,t.message]),s&&this.notifyToolCall(s)}updateLastAssistant(t){const r=this.messages,s=Xe(r,i=>i.role==="assistant");if(s===-1)throw new Error("No assistant message is available for tool continuation.");this.setMessages([...r.slice(0,s),t(r[s]),...r.slice(s+1)])}resolveToolCall(t,r){const s=Oi(this.messages,t),i=r??s?.toolName;if(!i)throw new Error(`Tool call ${t} was not found.`);return{toolName:i}}resolveApprovalRequest(t){if(!t)throw new Error("Tool approval id is required.");const r=Ri(this.messages,t);if(!r)throw new Error(`Tool approval request ${t} was not found.`);return r}async maybeSendAutomatically(t){if(this.status==="submitted"||this.status==="streaming")return;if(!await this.shouldSendAutomatically()){this.resetAutomaticContinuationIfIdle();return}const r=Hi(this.messages);if(r.filter(i=>!this.consumedAutomaticContinuationKeys.has(i)).length!==0){if(this.automaticStepCount>=this.maxAutomaticSteps){this.onAutomaticStepLimitExceeded?.({messages:this.messages,maxAutomaticSteps:this.maxAutomaticSteps});return}for(const i of r)this.consumedAutomaticContinuationKeys.add(i);this.automaticStepCount+=1,await this.makeRequest({trigger:"submit-message",messageId:this.messages[this.messages.length-1]?.id,options:t,reducerMessage:this.lastAssistantMessage()})}}async maybeSendAutomaticallyAfterToolUpdate(t){if(this.status==="submitted"||this.status==="streaming"){this.rememberPendingAutomaticContinuation(t);return}await this.maybeSendAutomatically(t)}lastAssistantMessage(){return[...this.messages].reverse().find(t=>t.role==="assistant")}async shouldSendAutomatically(){if(!this.sendAutomaticallyWhen)return!1;try{return!!await this.sendAutomaticallyWhen({messages:this.messages})}catch(t){throw this.failChat(t)}}notifyToolCall(t){try{const r=this.onToolCall?.(t);qi(r)&&r.catch(s=>{const i=Ct(s);this.toolCallbackFailure=i,this.status!=="submitted"&&this.status!=="streaming"&&this.failChat(i)})}catch(r){throw Ct(r)}}failChat(t){const r=Ct(t);return this.setChatError(r),this.setChatStatus("error"),this.onError?.(r),r}resetAutomaticContinuation(){this.automaticStepCount=0,this.consumedAutomaticContinuationKeys.clear(),this.clearPendingAutomaticContinuation()}rememberPendingAutomaticContinuation(t){this.hasPendingAutomaticContinuation=!0,t&&(this.pendingAutomaticContinuationOptions=t)}consumePendingAutomaticContinuationOptions(t){const r=this.hasPendingAutomaticContinuation?this.pendingAutomaticContinuationOptions??t:t;return this.hasPendingAutomaticContinuation=!1,this.pendingAutomaticContinuationOptions=void 0,r}clearPendingAutomaticContinuation(){this.hasPendingAutomaticContinuation=!1,this.pendingAutomaticContinuationOptions=void 0}resetAutomaticContinuationIfIdle(){const t=this.lastAssistantMessage();(!t||!t.parts.some(Li))&&(this.automaticStepCount=0,this.clearPendingAutomaticContinuation())}setChatMessages(t){this.state.setMessages(t),this.emitChange()}setChatStatus(t){this.state.setStatus(t),this.emitChange()}setChatError(t){this.state.setError(t),this.emitChange()}emitChange(){for(const t of this.listeners)t()}}function ki({messages:e=[],status:t="ready",error:r}={}){let s=e,i=t,n=r;return{getMessages:()=>s,setMessages:o=>{s=o},getStatus:()=>i,setStatus:o=>{i=o},getError:()=>n,setError:o=>{n=o}}}function Xe(e,t){for(let r=e.length-1;r>=0;r-=1)if(t(e[r]))return r;return-1}function Oi(e,t){for(let r=e.length-1;r>=0;r-=1){const s=e[r];if(s.role==="assistant")for(let i=s.parts.length-1;i>=0;i-=1){const n=s.parts[i];if(M(n)&&n.toolCallId===t)return{toolName:n.toolName}}}}function Ri(e,t){for(let r=e.length-1;r>=0;r-=1){const s=e[r];if(s.role==="assistant")for(let i=s.parts.length-1;i>=0;i-=1){const n=s.parts[i];if(M(n)&&n.state==="approval-requested"&&n.approval?.id===t)return n}}}function M(e){return e.type.startsWith("tool-")}function Li(e){return M(e)&&(e.state==="input-streaming"||e.state==="input-available"||e.state==="approval-requested")}function Di(e){return M(e)&&(e.state==="output-available"||e.state==="output-error"||e.state==="output-denied")}function Ui(e){return M(e)&&e.state==="approval-responded"}function Je(e){return Di(e)||Ui(e)}function Qe(e){return Ze(e)||e.state==="approval-responded"}function Ze(e){return e.state==="output-available"||e.state==="output-error"||e.state==="output-denied"}function zi(e,t){const r=new Map(t.parts.filter(n=>M(n)&&Qe(n)).map(n=>[n.toolCallId,n]));if(r.size===0)return e;let s=!1;const i=e.parts.map(n=>{if(!M(n)||Qe(n))return n;const o=r.get(n.toolCallId);return o?(s=!0,{...n,...o,input:o.input??n.input,inputText:o.inputText??n.inputText,providerMetadata:o.providerMetadata??n.providerMetadata}):n});return s?{...e,parts:i}:e}function Fi(e){const t=new Set;let r=!1;const s=[...e].reverse().map(i=>{if(i.role!=="assistant")return i;const n=[...i.parts].reverse().filter(o=>!M(o)||!Ze(o)?!0:t.has(o.toolCallId)?(r=!0,!1):(t.add(o.toolCallId),!0)).reverse();return n.length===i.parts.length?i:{...i,parts:n}}).reverse();return r?s:e}function Hi(e){const t=[...e].reverse().find(s=>s.role==="assistant");if(!t)return[];const r=t.parts.filter(Je);return r.length===0?[]:Array.from(new Set(r.map(ji)))}function ji(e){return Wi({toolCallId:e.toolCallId,toolName:e.toolName,state:e.state,approvalId:e.approval?.id,approved:e.approval?.approved})}function Bi(e){return!Number.isFinite(e)||e==null||e<1?5:Math.floor(e)}function qi(e){return typeof e=="object"&&e!==null&&"then"in e&&typeof e.then=="function"}function Wi(e){const t=new WeakSet,r=s=>{if(s===void 0)return'"[Undefined]"';if(typeof s=="bigint")return JSON.stringify(s.toString());if(s===null||typeof s=="string"||typeof s=="number"||typeof s=="boolean")return JSON.stringify(s);if(typeof s!="object")return JSON.stringify(String(s));if(t.has(s))return'"[Circular]"';if(t.add(s),Array.isArray(s))return`[${s.map(r).join(",")}]`;const i=s;return`{${Object.keys(i).sort().map(o=>`${JSON.stringify(o)}:${r(i[o])}`).join(",")}}`};return r(e)}function Gi(e){return e.type.startsWith("data-")}function Vi(e,t){return t.transient?{type:t.type,id:t.id,name:t.name,data:t.data,transientData:!0}:e.parts.find(s=>s.type===t.type&&s.type.startsWith("data-")&&s.id===t.id)??{type:t.type,id:t.id,name:t.name,data:t.data,transientData:!1}}function Yi({messages:e}){const t=[...e].reverse().find(s=>s.role==="assistant");if(!t)return!1;const r=t.parts.filter(M);return r.length>0&&r.every(Je)}function Ki(e,t={}){const r=t.maxMessages,s=typeof r=="number"&&r>=0?e.slice(Math.max(0,e.length-r)):[...e],i=t.removePendingToolParts!==!1,n=[];for(const o of s){const l=i?o.parts.filter(a=>!Xi(a)):[...o.parts];l.length!==0&&n.push({...o,parts:l.map(a=>({...a}))})}return n}function Xi(e){return Ji(e)&&(e.state==="input-streaming"||e.state==="input-available"||e.state==="approval-requested")}function Ji(e){return e.type.startsWith("tool-")}const te="summaraidgpt:agent-after-navigation",Qi=15e3,Zi="我已经打开了新的页面，请基于当前页面继续完成上一条用户请求。必要时先查看当前页面上下文。";function It(e={},t=window.sessionStorage){const r={openChat:!0,focusChatInput:!0,displayMode:e.displayMode??"panel",expiresAt:Date.now()+Qi};e.resume?.historyMessages?.length&&(r.resume={message:e.resume.message?.trim()||Zi,historyMessages:e.resume.historyMessages}),t.setItem(te,JSON.stringify(r))}function tn(e=window.sessionStorage){const t=e.getItem(te);if(e.removeItem(te),!!t)try{const r=JSON.parse(t);return typeof r.expiresAt!="number"||r.expiresAt<Date.now()?void 0:{openChat:r.openChat===!0,focusChatInput:r.focusChatInput!==!1,displayMode:r.displayMode==="stage"?"stage":"panel",resume:en(r.resume),expiresAt:r.expiresAt}}catch{return}}function en(e){if(typeof e!="object"||e===null)return;const t=e;if(!(typeof t.message!="string"||!t.message.trim()||!Array.isArray(t.historyMessages)))return{message:t.message.trim(),historyMessages:t.historyMessages}}const tr=new Map,er="#a16207",rn="#ffffff",sn="#f4f4f5",nn="#52525b";function on(){window.SummaraidGPTAI||(window.SummaraidGPTAI={registerTool(e,t){/^[a-z][a-z0-9_]{2,63}$/.test(e)&&tr.set(e,t)}})}on();class an{constructor(t){this.trustedResources=new Map,this.trustedPageLinks=new Map,this.navigationStarted=!1,this.config=Ht(t)}canExecute(t){return this.builtInToolNames().has(t)||this.config.aiTools.some(r=>r.name===t)}ingestMessages(t){for(const r of t)for(const s of r.parts)!ln(s)||s.state!=="output-available"||this.ingestToolOutput(s.output)}async execute(t){const r=t.input??{};try{if(t.toolName==="get_current_page_context")return this.getCurrentPageContext();if(t.toolName==="open_halo_resource")return this.openHaloResource(r);if(t.toolName==="open_current_page_link")return this.openCurrentPageLink(r);if(t.toolName==="open_comment_area")return this.scrollToCommentArea();if(t.toolName==="draft_comment")return this.config.builtIn.commentCapability==="off"?C("TOOL_NOT_ALLOWED","评论辅助能力未启用"):this.fillCommentDraft(r);if(t.toolName==="submit_comment")return this.config.builtIn.commentCapability!=="submit"?C("TOOL_NOT_ALLOWED","评论提交能力未启用"):this.submitComment(r);const s=this.config.aiTools.find(o=>o.name===t.toolName);if(!s)return C("TOOL_NOT_FOUND","这个功能还没有配置好");const i=s.action;if(this.requiresApproval(s.approval,i)&&!await this.requestApproval(`要我帮你执行「${s.description}」吗？`))return C("TOOL_APPROVAL_DENIED","访客取消了这次操作");this.showStatus(i.pendingMessage??"我来帮你处理一下");const n=await this.executeCustomAction(i,r,t.toolName);return this.showStatus(n.ok?i.successMessage:i.errorMessage),n}catch(s){return C("TOOL_EXECUTION_FAILED",s instanceof Error?s.message:"工具执行失败")}}tryOpenStrongResourceMatch(t){if(this.navigationStarted||!this.config.builtIn.haloNavigation)return;const r=cn(t);if(!r||!pn(r))return;const n=[...this.trustedResources.values()].map(o=>({resource:o,score:dn(o,r)})).filter(o=>o.score>0).sort((o,l)=>l.score-o.score)[0]?.resource;if(n)return this.showStatus(`正在打开${n.title||"页面"}`),this.navigate(n.permalink)}requestApproval(t){return new Promise(r=>{document.getElementById("summaraid-agent-approval")?.remove();const s=document.createElement("div");s.id="summaraid-agent-approval",s.style.cssText=["position:fixed","left:50%","bottom:5.5rem","z-index:100001","transform:translateX(-50%)","display:flex","align-items:center","gap:.5rem","max-width:min(28rem,calc(100vw - 1rem))","padding:.5rem .625rem","border:1px solid rgba(24,24,27,.12)","border-radius:.75rem","background:rgba(255,255,255,.98)","box-shadow:0 18px 44px rgba(15,23,42,.16)","font-size:13px","color:#334155"].join(";");const i=document.createElement("span");i.textContent=t,i.style.cssText="line-height:1.4;min-width:0;flex:1;";const n=document.createElement("button");n.type="button",n.textContent="允许",n.style.cssText=rr(er,rn);const o=document.createElement("button");o.type="button",o.textContent="取消",o.style.cssText=rr(sn,nn);const l=a=>{s.remove(),r(a)};n.addEventListener("click",()=>l(!0),{once:!0}),o.addEventListener("click",()=>l(!1),{once:!0}),s.append(i,n,o),document.body.append(s)})}builtInToolNames(){const t=new Set;if(!this.config.enabled)return t;const r=this.config.builtIn;return r.pageContext&&t.add("get_current_page_context"),r.haloNavigation&&(t.add("open_halo_resource"),t.add("open_current_page_link")),r.commentCapability!=="off"&&(t.add("open_comment_area"),t.add("draft_comment")),r.commentCapability==="submit"&&t.add("submit_comment"),t}getCurrentPageContext(){const t=window.getSelection()?.toString().trim()??"",r=this.findCommentInput(),s=this.findCommentArea(),i=r?.container?this.findCommentSubmitButton(r.container):void 0,n=this.collectLinkSummaries();this.trustedPageLinks.clear();for(const o of n)this.trustedPageLinks.set(o.linkId,o);return{ok:!0,title:document.title,url:window.location.href,path:window.location.pathname,description:document.querySelector("meta[name='description']")?.content.trim()??"",headings:this.collectHeadings(),selectedText:t.slice(0,1600),capabilities:{comment:{hasArea:!!s,hasInput:!!r,hasSubmitButton:!!i,reason:s?r?i?"当前页面支持填写评论":"当前页面有可写评论输入框，但没有检测到提交按钮":"当前页面有评论区，但没有检测到可写评论输入框":"当前页面没有检测到评论区"},forms:this.collectFormSummaries(),links:n}}}openHaloResource(t){const r=ee(t.resourceId);if(!r)return C("INVALID_INPUT","resourceId is required");const s=this.trustedResources.get(r);return s?this.navigate(s.permalink):C("RESOURCE_NOT_TRUSTED","没有找到可信资源")}openCurrentPageLink(t){const r=ee(t.linkId);if(!r)return C("INVALID_INPUT","linkId is required");const s=this.trustedPageLinks.get(r);return s?this.navigate(s.href):C("LINK_NOT_TRUSTED","没有找到可信链接")}scrollToCommentArea(){const t=this.findCommentArea();return t?(t.scrollIntoView?.({behavior:"smooth",block:"center"}),this.showStatus("已经帮你定位到评论区"),{ok:!0}):C("COMMENT_AREA_NOT_FOUND","当前页面没有检测到评论区")}fillCommentDraft(t){const r=ee(t.content);if(!r)return C("INVALID_INPUT","content is required");const s=this.findCommentInput();return s?(s.container?.scrollIntoView?.({behavior:"smooth",block:"center"}),this.writeCommentInput(s.input,r),s.input.focus(),this.showStatus("评论草稿已经帮你填好了"),{ok:!0,drafted:!0}):(this.scrollToCommentArea(),C("COMMENT_INPUT_NOT_FOUND",this.findCommentArea()?"当前页面有评论区，但没有找到可写评论输入框":"当前页面没有检测到评论区，无法填写评论"))}submitComment(t){const r=this.fillCommentDraft(t);if(!r.ok)return r;const s=this.findCommentInput(),i=s?.container?this.findCommentSubmitButton(s.container):void 0;return i?(i.click(),this.showStatus("已经尝试提交评论"),{ok:!0,submitted:!0}):C("COMMENT_SUBMIT_NOT_FOUND","没有找到评论提交按钮")}async executeCustomAction(t,r,s){if(t.type==="navigate")return this.navigate(t.url,t.target);if(t.type==="scroll-to")return this.scrollToSelector(t.selector,t.behavior);if(t.type==="highlight")return this.highlight(t.selector,t.duration);if(t.type==="dispatch-event")return window.dispatchEvent(new CustomEvent(t.event,{detail:r})),{ok:!0};const i=tr.get(s);return i?{ok:!0,output:await i({input:r,toolName:s})}:C("TOOL_EXECUTOR_NOT_FOUND","这个站点还没有启用对应能力")}navigate(t,r="_self"){const s=new URL(t,window.location.origin);if(!this.isAllowedUrl(s))return C("URL_NOT_ALLOWED","这个链接不在允许范围内");const i=r==="_blank"&&this.config.toolSecurity.allowNewTab;return this.navigationStarted=!0,i||It(),window.setTimeout(()=>{i?window.open(s.href,"_blank","noopener,noreferrer"):window.location.assign(s.href)},50),{ok:!0,navigating:!0,pageReload:!i,url:s.href}}scrollToSelector(t,r="smooth"){const s=document.querySelector(t);return s?(s.scrollIntoView?.({behavior:r,block:"center"}),{ok:!0}):C("ELEMENT_NOT_FOUND","没有找到对应的位置")}highlight(t,r=1600){const s=document.querySelector(t);if(!s)return C("ELEMENT_NOT_FOUND","没有找到对应的位置");const i=s.style.outline,n=s.style.outlineOffset;return s.style.outline=`2px solid ${er}`,s.style.outlineOffset="3px",window.setTimeout(()=>{s.style.outline=i,s.style.outlineOffset=n},r),{ok:!0}}isAllowedUrl(t){return t.protocol!=="http:"&&t.protocol!=="https:"?!1:t.origin===window.location.origin?!0:this.config.toolSecurity.allowedExternalOrigins.includes(t.origin)}requiresApproval(t,r){return t==="always"?!0:t==="never"?!1:r.type==="registered"||r.type==="dispatch-event"?!0:r.type==="navigate"&&r.url?new URL(r.url,window.location.origin).origin!==window.location.origin:!1}ingestToolOutput(t){if(!t||typeof t!="object")return;const r=t;if(Array.isArray(r.resources))for(const s of r.resources)this.ingestResource(s);this.ingestResource(r.resource),this.ingestToolOutput(r.output)}ingestResource(t){if(!t||typeof t!="object")return;const r=t;r.resourceId&&r.permalink&&this.trustedResources.set(r.resourceId,{resourceId:r.resourceId,permalink:r.permalink,title:r.title,resourceType:typeof r.resourceType=="string"?r.resourceType:void 0,metadataName:typeof r.metadataName=="string"?r.metadataName:void 0})}showStatus(t){t&&window.dispatchEvent(new CustomEvent("summaraid:agent-status",{detail:{message:t}}))}findCommentInput(){const t=this.commentContainers();for(const s of t){const i=this.findWritableCommentInput(s);if(i)return{container:s,input:i}}const r=this.findWritableCommentInput(document.body);return r?{container:void 0,input:r}:void 0}commentContainers(){return[...document.querySelectorAll(["#comment","#comments","halo-comment","[data-comment]",".comment",".comments",".comment-form"].join(","))]}findCommentArea(){return this.commentContainers()[0]}collectHeadings(){return[...document.querySelectorAll("h1,h2,h3")].map(t=>({level:Number(t.tagName.slice(1)),text:(t.textContent??"").trim()})).filter(t=>t.text).slice(0,8)}collectFormSummaries(){return[...document.querySelectorAll("form")].map(t=>({id:t.id||void 0,name:t.getAttribute("name")||void 0,fields:[...t.querySelectorAll("input,textarea,select")].map(r=>r.getAttribute("name")||r.getAttribute("aria-label")||r.id).filter(r=>!!r).slice(0,12),submitLabels:[...t.querySelectorAll("button,input[type='submit']")].map(r=>(r.textContent||r.getAttribute("value")||r.getAttribute("aria-label")||"").trim()).filter(r=>r).slice(0,6)})).slice(0,6)}collectLinkSummaries(){return[...document.querySelectorAll("a[href]")].map((t,r)=>({linkId:`link-${r}`,text:(t.textContent??"").trim().replace(/\s+/g," "),href:t.href})).filter(t=>t.text&&this.isAllowedUrl(new URL(t.href))).slice(0,30)}findWritableCommentInput(t){const r=["textarea:not([disabled]):not([readonly])","[contenteditable='true']","[contenteditable='']","input[name='content']:not([disabled]):not([readonly])","input[name='comment']:not([disabled]):not([readonly])"];for(const s of r){const i=this.deepQuerySelector(t,s);if(i&&this.isWritableCommentInput(i))return i}}findCommentSubmitButton(t){const r=["button[type='submit']:not([disabled])","input[type='submit']:not([disabled])","button:not([disabled])","[role='button']:not([aria-disabled='true'])"];for(const s of r){const n=this.deepQuerySelectorAll(t,s).find(o=>{const l=`${o.textContent??""} ${o.getAttribute("aria-label")??""} ${o.getAttribute("value")??""}`.trim();return/提交|评论|发送|发布|回复|submit|send|post|reply/i.test(l)});if(n)return n}}deepQuerySelector(t,r){return this.deepQuerySelectorAll(t,r)[0]}deepQuerySelectorAll(t,r){const s=[],i=n=>{if("querySelectorAll"in n){s.push(...n.querySelectorAll(r));for(const o of[...n.querySelectorAll("*")])o.shadowRoot&&i(o.shadowRoot)}};return i(t),s}isWritableCommentInput(t){return t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement||t instanceof HTMLElement&&t.isContentEditable}writeCommentInput(t,r){t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement?Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t),"value")?.set?.call(t,r):t.textContent=r;const s=typeof InputEvent=="function"?new InputEvent("input",{bubbles:!0,inputType:"insertText",data:r}):new Event("input",{bubbles:!0});t.dispatchEvent(s),t.dispatchEvent(new Event("change",{bubbles:!0}))}}function ln(e){return e.type.startsWith("tool-")}function ee(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function C(e,t){return{ok:!1,errorCode:e,message:t}}function rr(e,t){return["border:none","border-radius:.55rem","padding:.35rem .65rem","font:inherit","font-weight:700",`background:${e}`,`color:${t}`,"cursor:pointer"].join(";")}function cn(e){return e.trim().replace(/^(打开|跳转到?|带我去|看看|查看|进入|去一下|访问)\s*/u,"").replace(/[。！？?!,.，、\s]/gu,"").toLowerCase()}function sr(e){return(e??"").trim().replace(/[。！？?!,.，、\s_-]/gu,"").toLowerCase()}function pn(e){return!(e.length<2||e.length>18||/^(为什么|怎么|如何|什么|是否|能不能|可不可以|介绍|解释|总结|告诉我)/u.test(e))}function dn(e,t){const r=sr(e.title),s=sr(e.metadataName),o=(e.resourceType??"").includes("singlepage")?20:0;return r&&r===t?100+o:s&&s===t?92+o:r&&(t.includes(r)||r.includes(t))&&Math.min(r.length,t.length)>=2?80+o:s&&(t.includes(s)||s.includes(t))&&Math.min(s.length,t.length)>=2?70+o:0}class ir{async sendMessage(t,r,s={}){const i=new an(r.agent),n=new Set,o=new Map,l=new Set,a=new Set,p=new Set,c=d=>{const x=d.finally(()=>n.delete(x));return n.add(x),x},g=()=>this.chat?.status==="submitted"||this.chat?.status==="streaming",v=d=>{if(!l.has(d.toolCallId)){if(g()){o.set(d.toolCallId,d);return}return l.add(d.toolCallId),i.canExecute(d.toolName)?c(i.execute(d).then(x=>(_t(x)&&It({displayMode:r.afterNavigationDisplayMode,resume:{historyMessages:mn(this.chat.messages,d,x)}}),this.chat.addToolOutput({toolCallId:d.toolCallId,toolName:d.toolName,output:x}).then(()=>x))).then(x=>{_t(x)&&It({displayMode:r.afterNavigationDisplayMode,resume:{historyMessages:re(this.chat.messages)}})}).then(()=>{})):c(this.chat.addToolOutput({toolCallId:d.toolCallId,toolName:d.toolName,state:"output-error",errorText:"当前页面没有启用这个浏览器能力"}).then(()=>{}))}},w=()=>{if(g()||o.size===0)return;const d=[...o.values()];o.clear(),d.forEach(v)},E=async()=>{for(;(n.size>0||o.size>0)&&(w(),n.size!==0);)await Promise.allSettled([...n])};this.chat=new Ni({id:"summaraid-rag-agent",messages:r.historyMessages??[],transport:new Ye({api:`${yt}/ragAgentChat`,credentials:"same-origin",body:{conversationId:r.conversationId,visitorId:r.visitorId,recordUserMessage:r.recordUserMessage!==!1},prepareSendMessagesRequest:d=>{for(const x of ar(d.messages))p.add(x);return{}}}),onError:d=>s.onError?.(d.message),onToolCall:d=>{if(d.state==="input-available")return v(d)},sendAutomaticallyWhen:({messages:d})=>{const x=ar(d);return Yi({messages:d})&&x.some(R=>!p.has(R))},maxAutomaticSteps:5,onFinish:({messages:d,isAbort:x,isError:R})=>{!x&&!R&&s.onFinish?.(d)}});const Pt=this.chat.subscribe(()=>{const d=this.chat;if(!d)return;const x=d.messages[d.messages.length-1];if(i.ingestMessages(d.messages),s.onSources?.(nr(d.messages)),!x||x.role!=="assistant"){w();return}for(const $ of x.parts)K($)&&$.state==="input-available"&&v($),K($)&&$.state==="approval-requested"&&$.approval?.id&&!a.has($.approval.id)&&(a.add($.approval.id),c(i.requestApproval(`要我帮你执行「${$.toolName}」吗？`).then(Tr=>d.addToolApprovalResponse({id:$.approval?.id,toolCallId:$.toolCallId,toolName:$.toolName,approved:Tr,reason:Tr?"Approved by visitor":"Denied by visitor"})).then(()=>{})));const R=i.tryOpenStrongResourceMatch(t);R?.ok&&_t(R)&&It({displayMode:r.afterNavigationDisplayMode,resume:{historyMessages:re(d.messages)}}),s.onText?.(un(x)),w()}),J=()=>this.stop();r.signal?.addEventListener("abort",J,{once:!0});try{if(await this.chat.sendMessage({text:t}),w(),await E(),s.onSources?.(nr(this.chat.messages)),s.onFinish?.(this.chat.messages),this.chat.error)throw this.chat.error;return this.chat.messages}finally{r.signal?.removeEventListener("abort",J),Pt()}}stop(){this.chat?.stop(),this.chat=void 0}}function nr(e){const t=new Map,r=s=>{if(!s||typeof s!="object")return;const i=s;if(Array.isArray(i.resources))for(const n of i.resources)or(n,t);or(i.resource,t),r(i.output)};for(const s of e)for(const i of s.parts)K(i)&&i.state==="output-available"&&r(i.output);return[...t.values()]}function or(e,t){if(!e||typeof e!="object")return;const r=e,s=z(r.resourceId)||z(r.id);!s||t.has(s)||t.set(s,{id:s,title:z(r.title),url:z(r.permalink)||z(r.url),sourceType:z(r.resourceType),content:z(r.excerpt),metadata:{metadataName:z(r.metadataName)||""}})}function un(e){return e.parts.filter(t=>t.type==="text").map(t=>t.text).join("")}function ar(e){const t=[...e].reverse().find(s=>s.role==="assistant");if(!t)return[];const r=t.parts.filter(s=>K(s)).filter(hn).map(gn);return[...new Set(r)]}function hn(e){return lr(e)||e.state==="approval-responded"}function gn(e){return JSON.stringify({toolCallId:e.toolCallId,toolName:e.toolName,state:e.state,approvalId:e.approval?.id,approved:e.approval?.approved})}function lr(e){return e.state==="output-available"||e.state==="output-error"||e.state==="output-denied"}function _t(e){if(typeof e!="object"||e===null)return!1;const t=e;return t.navigating===!0?t.pageReload!==!1:_t(t.output)}function mn(e,t,r){return re(e.map(s=>{if(s.role!=="assistant")return s;const i=s.parts.map(n=>!K(n)||n.toolCallId!==t.toolCallId?n:{...n,type:`tool-${t.toolName}`,toolName:t.toolName,toolCallId:t.toolCallId,state:"output-available",output:r});return{...s,parts:i}}))}function re(e,t){return fn(Ki(e,{maxMessages:t}))}function fn(e){const t=new Set;return[...e].reverse().map(r=>{if(r.role!=="assistant")return r;const s=[...r.parts].reverse().filter(i=>!K(i)||!lr(i)?!0:t.has(i.toolCallId)?!1:(t.add(i.toolCallId),!0)).reverse();return s.length===r.parts.length?r:{...r,parts:s}}).reverse().filter(r=>r.parts.length>0)}function K(e){return e.type.startsWith("tool-")}function z(e){return typeof e=="string"&&e.trim()?e.trim():void 0}const cr={ATTRIBUTE:1,CHILD:2},pr=e=>(...t)=>({_$litDirective$:e,values:t});let dr=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,r,s){this._$Ct=t,this._$AM=r,this._$Ci=s}_$AS(t,r){return this.update(t,r)}update(t,r){return this.render(...r)}};class se extends dr{constructor(t){if(super(t),this.it=u,t.type!==cr.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===u||t==null)return this._t=void 0,this.it=t;if(t===D)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const r=[t];return r.raw=r,this._t={_$litType$:this.constructor.resultType,strings:r,values:[]}}}se.directiveName="unsafeHTML",se.resultType=1;const ur=pr(se);const hr="important",bn=" !"+hr,xn=pr(class extends dr{constructor(e){if(super(e),e.type!==cr.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,r)=>{const s=e[r];return s==null?t:t+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[t]){const{style:r}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(const s of this.ft)t[s]==null&&(this.ft.delete(s),s.includes("-")?r.removeProperty(s):r[s]=null);for(const s in t){const i=t[s];if(i!=null){this.ft.add(s);const n=typeof i=="string"&&i.endsWith(bn);s.includes("-")||n?r.setProperty(s,n?i.slice(0,-11):i,n?hr:""):r[s]=i}}return D}}),gr="ri:book-open-line",mr="https://api.iconify.design",fr=/^([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)$/i;function N(e,t="iconify-icon"){const r=yn(e)||ie(gr);return m`
    <span
      class=${t}
      style=${xn({"--rag-icon-source":`url("${r}")`})}
      aria-hidden="true"
    ></span>
  `}function yn(e){const t=e?.trim();if(t){if(vn(t))return ie(t);if(wn(t))return An(t);if(Sn(t)||Cn(t))return t}}function vn(e){return fr.test(e)}function ie(e){const t=e.match(fr);if(!t)return ie(gr);const[,r,s]=t;return`${mr}/${encodeURIComponent(r)}/${encodeURIComponent(s)}.svg`}function wn(e){return e.startsWith("<svg")&&e.endsWith("</svg>")}function Sn(e){return e.startsWith("data:image/svg+xml")}function Cn(e){try{const t=new URL(e);return t.origin===mr&&t.pathname.endsWith(".svg")}catch{return!1}}function An(e){return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`}function br(){return N("ri:close-line")}function xr(){return N("ri:send-plane-2-line")}function ne(){return N("ri:chat-new-line")}function $n(){return N("ri:article-line")}function Tn(){return N("ri:file-text-line")}function En(){return N("ri:external-link-line")}function In(){return N("ri:focus-3-line")}function _n(){return N("ri:history-line")}function Pn(){return N("ri:search-line")}function W(){return N("ri:question-answer-line")}function yr(e){return m`<div class="pet-source-list">${e.map(t=>Mn(t))}</div>`}function Mn(e){const t=m`
    <span class="pet-source-icon">${Tn()}</span>
    <span class="pet-source-title">${Nn(e)}</span>
    ${e.url?m`<span class="pet-source-open">${En()}</span>`:u}
  `;return e.url?m`
        <a class="pet-source-row" href=${e.url} target="_blank" rel="noopener noreferrer">
          ${t}
        </a>
      `:m`<div class="pet-source-row">${t}</div>`}function Nn(e){const t=e.title?.trim();return t?`《${t}》`:"未命名来源"}function vr(){return m`<span class="typing" aria-label="正在输出"><span></span><span></span><span></span></span>`}function kn(e){const t=e.latestAssistant,r=e.latestUser;return m`
    <section class="pet-panel" aria-label="宠物问答">
      <div class="pet-panel-head">
        <div class="pet-panel-title">
          <span class="pet-panel-kicker">${e.assistantName}</span>
          <strong>${e.streaming?"正在找答案":"想问我什么？"}</strong>
        </div>
        <div class="pet-panel-actions">
          <button class="pet-panel-action is-primary" type="button" @click=${e.onOpenStage}>
            ${W()} 全屏
          </button>
          ${e.hasConversation?m`
                <button class="pet-panel-action" type="button" @click=${e.onOpenStage}>
                  ${W()} 会话
                </button>
              `:u}
          <button class="pet-panel-action" type="button" @click=${e.onNewConversation}>
            ${ne()} 新聊
          </button>
        </div>
      </div>

      ${e.selectedContext?m`
            <div class="pet-context">
              <span>选中内容</span>
              <p>${e.selectedContextPreview}</p>
              <button type="button" title="移除选中内容" @click=${e.onClearSelectedContext}>
                ${br()}
              </button>
            </div>
          `:u}

      ${t?On(e,t,r):m`<div class="pet-panel-empty">我在这里，直接问就行。</div>`}

      <form class="pet-composer" @submit=${e.onSubmit}>
        <textarea
          class="pet-composer-input"
          rows="1"
          .value=${e.input}
          placeholder=${e.petInputPlaceholder}
          ?disabled=${e.streaming}
          @input=${e.onInput}
          @keydown=${e.onKeydown}
          @compositionstart=${e.onCompositionStart}
          @compositionend=${e.onCompositionEnd}
        ></textarea>
        <button class="pet-send" type="submit" ?disabled=${e.streaming||!e.input.trim()} aria-label="发送">
          ${xr()}
        </button>
      </form>
    </section>
  `}function On(e,t,r){const s=t.sources||[];return m`
    <div class=${t.error?"pet-answer error":"pet-answer"}>
      <div class="pet-answer-meta">
        <span>${r?e.truncateText(r.content,32):"最新回复"}</span>
        <time>${t.time}</time>
      </div>
      <div class="pet-answer-body markdown-body">
        ${ur(Ue(t.content||"正在思考中..."))}
        ${t.streaming?vr():u}
      </div>
      ${s.length?m`
            <button class="pet-source-link" type="button" @click=${e.onTogglePetSources}>
              ${W()} ${s.length} 个参考来源
            </button>
            ${e.petSourcesOpen?m`<div class="pet-compact-sources">${yr(s)}</div>`:u}
          `:u}
    </div>
  `}function Rn(e){return m`
    <div class="pet-stage-backdrop" @click=${e.onClose}></div>
    <section class="pet-stage" role="dialog" aria-label=${`${e.assistantName} 会话`}>
      <header class="pet-stage-head">
        <div class="pet-stage-title">
          <span>${e.assistantName}</span>
          <strong>${e.streaming?"正在找答案":"想问我什么？"}</strong>
        </div>
        <div class="pet-stage-actions">
          <button
            class="pet-stage-action"
            type="button"
            ?disabled=${!e.hasSources}
            @click=${e.onExpandLatestSources}
          >
            ${W()} 来源
          </button>
          <button class="pet-stage-action" type="button" @click=${e.onNewConversation}>
            ${ne()} 新聊
          </button>
          <button class="pet-stage-close" type="button" title="关闭" aria-label="关闭" @click=${e.onClose}>
            ${br()}
          </button>
        </div>
      </header>
      <main class="pet-stage-output">
        <div class="pet-stage-output-inner">
          ${e.messages.length?e.messages.map(t=>Dn(t,e)):Un(e)}
        </div>
      </main>
      <footer class="pet-stage-footer">
        ${Ln(e)}
        ${jn(e)}
        <div class="pet-stage-note">内容由 AI 生成，仅供参考</div>
      </footer>
    </section>
  `}function Ln(e){const t=[{label:"总结当前页",icon:$n(),prompt:"请结合当前页面内容和知识库，帮我总结重点。"},{label:"搜索知识库",icon:Pn(),prompt:"请帮我检索知识库："},{label:"继续追问",icon:_n(),prompt:""}];return m`
    <div class="pet-stage-shortcuts" aria-label="快捷操作">
      ${t.map(r=>m`
        <button type="button" @click=${()=>e.onUsePrompt(r.prompt)}>
          ${r.icon}<span>${r.label}</span>
        </button>
      `)}
      <button type="button" ?disabled=${!e.hasSources} @click=${e.onExpandLatestSources}>
        ${W()}<span>参考来源</span>
      </button>
      <button type="button" @click=${e.onNewConversation}>
        ${ne()}<span>新会话</span>
      </button>
      <button type="button" @click=${e.onClose}>
        ${In()}<span>收起</span>
      </button>
    </div>
  `}function Dn(e,t){const r=e.sources||[];return m`
    <article class=${`pet-stage-message ${e.role}`}>
      ${e.role==="assistant"?wr(t):u}
      <div class="pet-stage-message-stack">
        <div class=${`pet-stage-bubble${e.error?" error":""}${e.streaming?" streaming":""}`}>
          ${Hn(e)}
          ${e.streaming?vr():u}
        </div>
        ${e.role==="assistant"?Fn(r,e.id,t):u}
        <div class="pet-stage-time">${e.time}</div>
      </div>
    </article>
  `}function Un(e){return m`
    <div class="pet-stage-message assistant">
      ${wr(e)}
      <div class="pet-stage-message-stack">
        <div class="pet-stage-bubble">
          <span class="message-text">${e.welcomeMessage}</span>
        </div>
        <div class="pet-stage-time">${e.welcomeTime}</div>
      </div>
    </div>
  `}function wr(e){const t=e.assistantAvatar?.trim();return m`
    <span class=${t?"pet-stage-avatar has-image":"pet-stage-avatar"} aria-hidden="true">
      <span class="pet-stage-avatar-fallback">${e.avatarFallbackText}</span>
      ${t?m`
            <img
              class="pet-stage-avatar-image"
              src=${t}
              alt=""
              @error=${zn}
            />
          `:u}
    </span>
  `}function zn(e){const t=e.currentTarget;t instanceof HTMLImageElement&&(t.parentElement?.classList.remove("has-image"),t.remove())}function Fn(e,t,r){return e.length?m`
    <details
      class="pet-stage-sources"
      ?open=${r.isSourceReferencesOpen(t)}
      @toggle=${s=>r.onToggleSourceReferences(t,s)}
    >
      <summary>
        ${W()} <span>${e.length} 个参考来源</span>
      </summary>
      ${yr(e)}
    </details>
  `:u}function Hn(e){const t=e.content||(e.streaming?"正在思考中...":"");return e.role==="assistant"&&!e.error&&t?m`<div class="message-text markdown-body">${ur(Ue(t))}</div>`:m`<span class="message-text">${t}</span>`}function jn(e){return m`
    <div class="composer-wrap">
      <form class="composer" @submit=${e.onSubmit}>
        <textarea
          class="conversation-input input"
          rows="1"
          .value=${e.input}
          placeholder=${De}
          ?disabled=${e.streaming}
          @input=${e.onInput}
          @keydown=${e.onKeydown}
          @compositionstart=${e.onCompositionStart}
          @compositionend=${e.onCompositionEnd}
        ></textarea>
        <button class="send" type="submit" ?disabled=${e.streaming||!e.input.trim()} aria-label="发送">
          ${xr()}
        </button>
      </form>
    </div>
  `}function Bn(e,t){return e.visible?m`
    <div
      class="selection-popover"
      style=${`left:${e.x}px;top:${e.y}px`}
    >
      <button type="button" @click=${t}>
        ${W()} 问知识库
      </button>
    </div>
  `:u}var qn=Object.defineProperty,Wn=Object.getOwnPropertyDescriptor,b=(e,t,r,s)=>{for(var i=s>1?void 0:s?Wn(t,r):t,n=e.length-1,o;n>=0;n--)(o=e[n])&&(i=(s?o(t,r,i):o(i))||i);return s&&i&&qn(t,r,i),i};const Gn=1600,Sr="likcc_summaraidgpt_rag_assistant_position",oe="likcc_summaraidgpt_rag_conversation_id",Cr="likcc_summaraidgpt_rag_visitor_id",X=16,Vn=4;let f=class extends nt{constructor(){super(...arguments),this.position="right",this.config=ct,this.configLoaded=!1,this.open=!1,this.petPanelOpen=!1,this.input="",this.selectedContext="",this.petSourcesOpen=!1,this.messages=[],this.streaming=!1,this.composingInput=!1,this.expandedSourceMessageIds=[],this.selectionPopup=ut,this.floatingPositionReady=!1,this.petSpriteReady=!1,this.draggingBubble=!1,this.petFrameIndex=0,this.petHovering=!1,this.petDragDirection="",this.petErrorUntil=0,this.petSpeechVisible=!1,this.petSpeechIndex=0,this.petSpeechText="",this.agentHistoryMessages=[],this.visitorId=this.loadOrCreateVisitorId(),this.suppressNextBubbleClick=!1,this.floatingPositionLocked=!1,this.petAnimationTimer=0,this.petSpeechTimer=0,this.petSpeechHideTimer=0,this.welcomeTime=pt(),this.handleDocumentMouseUp=()=>{window.setTimeout(()=>this.updateSelectionPopup(),0)},this.handleDocumentKeyUp=()=>{window.setTimeout(()=>this.updateSelectionPopup(),0)},this.handleDocumentMouseDown=e=>{e.composedPath().includes(this)||(this.clearSelectionPopup(),!this.streaming&&!this.open&&(this.petPanelOpen=!1))},this.handleWindowScroll=()=>{this.clearSelectionPopup()},this.handleWindowResize=()=>{this.clampCurrentFloatingPosition()},this.handleAgentStatus=e=>{const t=e.detail?.message?.trim();t&&(this.petSpeechText=t,this.petSpeechVisible=!0)},this.handleBubblePointerMove=e=>{const t=this.bubbleDragState;if(!t||e.pointerId!==t.pointerId)return;const r=e.clientX-t.startX,s=e.clientY-t.startY,i=Math.hypot(r,s);!t.moved&&i<Vn||(t.moved=!0,this.draggingBubble=!0,this.petDragDirection=e.clientX>=t.lastX?"right":"left",t.lastX=e.clientX,e.preventDefault(),this.setFloatingPosition(this.clampFloatingPosition({x:t.originX+r,y:t.originY+s},this.bubbleWidth,this.bubbleHeight),!1))},this.handleBubblePointerEnd=e=>{const t=this.bubbleDragState;!t||e.pointerId!==t.pointerId||(t.target.hasPointerCapture(e.pointerId)&&t.target.releasePointerCapture(e.pointerId),this.unbindBubbleDragListeners(),this.bubbleDragState=void 0,this.draggingBubble=!1,this.petDragDirection="",t.moved&&this.floatingPosition&&(e.preventDefault(),this.suppressNextBubbleClick=!0,this.floatingPositionLocked=!0,this.saveFloatingPosition(this.floatingPosition),window.setTimeout(()=>{this.suppressNextBubbleClick=!1},0)))}}connectedCallback(){super.connectedCallback(),this.applyTheme(),this.floatingPositionLocked=this.applySavedFloatingPosition(),this.bindSelectionListeners(),window.addEventListener("resize",this.handleWindowResize,{passive:!0}),window.addEventListener("summaraid:agent-status",this.handleAgentStatus),this.initializeAssistant()}disconnectedCallback(){super.disconnectedCallback(),this.unbindSelectionListeners(),window.removeEventListener("resize",this.handleWindowResize),window.removeEventListener("summaraid:agent-status",this.handleAgentStatus),this.unbindBubbleDragListeners(),this.stopPetAnimation(),this.stopPetSpeechCycle(),this.abortCurrentRequest()}updated(e){(e.has("open")||e.has("petPanelOpen")||e.has("streaming"))&&this.syncPetThinkingSpeech()}openAssistant(e,t=!1){if(this.petPanelOpen=!0,this.petSpeechVisible=!1,this.clearSelectionPopup(),e?.trim()){t?this.submitQuestion(e):(this.input=e,this.updateComplete.then(()=>this.focusPetInput()));return}this.updateComplete.then(()=>this.focusPetInput())}render(){return m`
      ${this.renderSelectionPopup()}
      ${this.renderBubble()}
      ${this.open?this.renderStage():u}
    `}async loadConfig(){const e=await Ns();this.config=e,this.configLoaded=!0,this.applyTheme(e),this.floatingPositionLocked?this.clampCurrentFloatingPosition():(this.position=e.buttonPosition,this.applyDefaultFloatingPosition(e)),this.floatingPositionReady=!0,await this.preparePetSprite(e)}async initializeAssistant(){await Promise.allSettled([this.loadConfig(),this.loadStoredConversation()]),await this.resumeAgentAfterNavigationIfNeeded()}async resumeAgentAfterNavigationIfNeeded(){const e=tn();e?.openChat&&(this.open=e.displayMode==="stage",this.petPanelOpen=e.displayMode!=="stage",this.petSpeechVisible=!1,this.clearSelectionPopup(),await this.updateComplete,e.focusChatInput&&this.focusCurrentInput(),e.resume&&await this.resumeAgentAfterNavigation(e.resume))}bindSelectionListeners(){document.addEventListener("mouseup",this.handleDocumentMouseUp,{passive:!0}),document.addEventListener("keyup",this.handleDocumentKeyUp,{passive:!0}),document.addEventListener("mousedown",this.handleDocumentMouseDown),window.addEventListener("scroll",this.handleWindowScroll,{passive:!0})}unbindSelectionListeners(){document.removeEventListener("mouseup",this.handleDocumentMouseUp),document.removeEventListener("keyup",this.handleDocumentKeyUp),document.removeEventListener("mousedown",this.handleDocumentMouseDown),window.removeEventListener("scroll",this.handleWindowScroll)}renderBubble(){if(!this.canRenderFloatingPet)return u;const e=this.petPanelOpen?"":this.getCurrentPetSpeech();return m`
      <span class=${this.petPanelOpen?"bubble-wrapper panel-open":"bubble-wrapper"}>
        ${this.petPanelOpen&&!this.open?this.renderPetPanel():u}
        <button
          class=${this.draggingBubble?"bubble pet-button dragging":"bubble pet-button"}
          style=${this.petButtonStyle}
          type="button"
          @pointerdown=${this.handleBubblePointerDown}
          @click=${this.handleBubbleClick}
          @mouseenter=${this.handlePetMouseEnter}
          @mouseleave=${this.handlePetMouseLeave}
          aria-label="打开 RAG 智能助手"
        >
          ${e?m`<span class=${this.petSpeechVisible?"pet-speech visible":"pet-speech"}>${e}</span>`:u}
          <span class="pet-sprite" style=${this.petSpriteStyle} aria-hidden="true"></span>
        </button>
      </span>
    `}renderPetPanel(){return kn({assistantName:this.assistantName,streaming:this.streaming,selectedContext:this.selectedContext,selectedContextPreview:this.selectedContextPreview,latestAssistant:this.latestAssistantMessage,latestUser:this.latestUserMessage,petSourcesOpen:this.petSourcesOpen,input:this.input,petInputPlaceholder:this.petInputPlaceholder,hasConversation:this.hasConversation,truncateText:(e,t)=>this.truncateText(e,t),onOpenStage:()=>this.openPetStage(),onNewConversation:()=>this.newConversation(),onClearSelectedContext:()=>this.clearSelectedContext(),onTogglePetSources:()=>this.togglePetSources(),onSubmit:e=>this.handleSubmit(e),onInput:e=>this.handleInput(e),onKeydown:e=>this.handleInputKeydown(e),onCompositionStart:()=>this.handleCompositionStart(),onCompositionEnd:()=>this.handleCompositionEnd()})}renderStage(){return Rn({assistantName:this.assistantName,assistantAvatar:this.config.assistantAvatar,avatarFallbackText:this.avatarFallbackText,messages:this.messages,welcomeMessage:this.welcomeMessage,welcomeTime:this.welcomeTime,input:this.input,streaming:this.streaming,hasSources:this.hasLatestSources,isSourceReferencesOpen:e=>this.isSourceReferencesOpen(e),onToggleSourceReferences:(e,t)=>this.toggleSourceReferences(e,t),onClose:()=>this.close(),onNewConversation:()=>this.newConversation(),onExpandLatestSources:()=>this.expandLatestSources(),onUsePrompt:e=>this.useStagePrompt(e),onSubmit:e=>this.handleSubmit(e),onInput:e=>this.handleInput(e),onKeydown:e=>this.handleInputKeydown(e),onCompositionStart:()=>this.handleCompositionStart(),onCompositionEnd:()=>this.handleCompositionEnd()})}renderSelectionPopup(){return Bn(this.selectionPopup,()=>this.askWithSelection())}handleSubmit(e){e.preventDefault(),this.submitQuestion(this.input)}handleInput(e){const t=e.currentTarget;t instanceof HTMLTextAreaElement&&(this.input=t.value,this.resizeInput(t))}handleCompositionStart(){this.composingInput=!0}handleCompositionEnd(){this.composingInput=!1}handleInputKeydown(e){e.key!=="Enter"||e.shiftKey||this.streaming||e.isComposing||this.composingInput||e.keyCode===229||(e.preventDefault(),this.submitQuestion(this.input))}handleBubblePointerDown(e){if(!e.isPrimary||e.button!==0)return;const t=e.currentTarget;if(!(t instanceof HTMLElement))return;const r=t.getBoundingClientRect(),s=this.currentFloatingPosition(r);this.bubbleDragState={pointerId:e.pointerId,target:t,startX:e.clientX,startY:e.clientY,originX:s.x,originY:s.y,lastX:e.clientX,moved:!1},this.petSpeechVisible=!1,e.preventDefault(),t.setPointerCapture(e.pointerId),t.addEventListener("pointermove",this.handleBubblePointerMove),t.addEventListener("pointerup",this.handleBubblePointerEnd),t.addEventListener("pointercancel",this.handleBubblePointerEnd)}handleBubbleClick(e){if(this.suppressNextBubbleClick){e.preventDefault(),e.stopPropagation();return}this.petPanelOpen=!this.petPanelOpen,this.petSpeechVisible=!1,this.petPanelOpen&&this.updateComplete.then(()=>this.focusPetInput())}unbindBubbleDragListeners(){const e=this.bubbleDragState?.target;e&&(e.removeEventListener("pointermove",this.handleBubblePointerMove),e.removeEventListener("pointerup",this.handleBubblePointerEnd),e.removeEventListener("pointercancel",this.handleBubblePointerEnd))}applySavedFloatingPosition(){const e=this.loadSavedFloatingPosition();return e?(this.setFloatingPosition(this.clampFloatingPosition(e),!1),!0):!1}applyDefaultFloatingPosition(e){this.setFloatingPosition(this.clampFloatingPosition(this.defaultFloatingPosition(e)),!1)}currentFloatingPosition(e){return this.floatingPosition?this.floatingPosition:e&&Number.isFinite(e.left)&&Number.isFinite(e.top)?{x:e.left,y:e.top}:this.defaultFloatingPosition(this.config)}defaultFloatingPosition(e){const t=this.normalizeFloatingOffset(e.horizontalOffset),r=this.normalizeFloatingOffset(e.verticalOffset);return{x:e.buttonPosition==="left"?t:window.innerWidth-this.bubbleWidth-t,y:window.innerHeight-this.bubbleHeight-r}}clampCurrentFloatingPosition(){if(!this.floatingPosition)return;const e=this.clampFloatingPosition(this.floatingPosition,this.bubbleWidth,this.bubbleHeight);(e.x!==this.floatingPosition.x||e.y!==this.floatingPosition.y)&&this.setFloatingPosition(e,!0)}clampFloatingPosition(e,t=this.bubbleWidth,r=this.bubbleHeight){const s=Math.max(X,window.innerWidth-t-X),i=Math.max(X,window.innerHeight-r-X);return{x:this.clamp(e.x,X,s),y:this.clamp(e.y,X,i)}}setFloatingPosition(e,t){this.floatingPosition=e,this.position=e.x+this.bubbleWidth/2<window.innerWidth/2?"left":"right",this.style.left=`${Math.round(e.x)}px`,this.style.top=`${Math.round(e.y)}px`,this.style.right="auto",this.style.bottom="auto",t&&this.saveFloatingPosition(e)}applyTheme(e=this.config){ws(this,e.styleConfig)}async preparePetSprite(e){this.stopPetAnimation(),this.stopPetSpeechCycle(),this.petSpriteReady=!1,this.petSpeechVisible=!1,this.petSpeechText="";const t=e.pet?.spritesheetUrl?.trim();if(t)try{if(await this.preloadImage(t),this.petSpriteUrl!==t)return;this.petSpriteReady=!0,this.startPetAnimation(),this.startPetSpeechCycle()}catch{this.petSpriteUrl===t&&(this.petSpriteReady=!1)}}preloadImage(e){return new Promise((t,r)=>{const s=new Image;let i=!1;const n=o=>{i||(i=!0,o())};s.onload=()=>n(()=>t()),s.onerror=()=>n(()=>r(new Error("Pet spritesheet failed to load"))),s.src=e})}startPetAnimation(){this.petAnimationTimer||!this.canRenderFloatingPet||(this.petAnimationTimer=window.setInterval(()=>{this.petFrameIndex=(this.petFrameIndex+1)%Te(this.petAnimationState).length},150))}stopPetAnimation(){this.petAnimationTimer&&(window.clearInterval(this.petAnimationTimer),this.petAnimationTimer=0)}startPetSpeechCycle(){this.petSpeechTimer||!this.canRenderFloatingPet||(window.setTimeout(()=>this.showNextPetSpeech(),1600),this.petSpeechTimer=window.setInterval(()=>this.showNextPetSpeech(),15e3))}stopPetSpeechCycle(){this.petSpeechTimer&&(window.clearInterval(this.petSpeechTimer),this.petSpeechTimer=0),this.petSpeechHideTimer&&(window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=0)}showNextPetSpeech(){if(!this.canShowPetSpeech()){this.petSpeechVisible=!1;return}if(this.isPetThinkingOutsideWindow()){this.showPetThinkingSpeech();return}const e=this.petSpeechMessages;this.petSpeechText=e[this.petSpeechIndex%e.length]||"",this.petSpeechVisible=!0,this.petSpeechHideTimer&&window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=window.setTimeout(()=>{this.petSpeechVisible=!1,this.petSpeechHideTimer=0},7200),this.petSpeechIndex=(this.petSpeechIndex+1)%e.length}syncPetThinkingSpeech(){if(!this.canRenderFloatingPet){this.petSpeechVisible=!1,this.petSpeechText="";return}if(this.isPetThinkingOutsideWindow()){this.showPetThinkingSpeech();return}this.petSpeechText===$e&&(this.petSpeechVisible=!1,this.petSpeechText="")}showPetThinkingSpeech(){this.draggingBubble||(this.petSpeechText=$e,this.petSpeechVisible=!0,this.petSpeechHideTimer&&(window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=0))}canShowPetSpeech(){return this.canRenderFloatingPet&&!this.open&&!this.petPanelOpen&&!this.draggingBubble&&(this.isPetThinkingOutsideWindow()||this.petSpeechMessages.length>0)}isPetThinkingOutsideWindow(){return!this.open&&!this.petPanelOpen&&this.streaming}handlePetMouseEnter(){this.petHovering=!0}handlePetMouseLeave(){this.petHovering=!1}triggerPetError(){this.canRenderFloatingPet&&(this.petErrorUntil=Date.now()+3600,this.petFrameIndex=0)}loadSavedFloatingPosition(){try{const e=window.localStorage.getItem(Sr);if(!e)return;const t=JSON.parse(e);if(typeof t.x=="number"&&Number.isFinite(t.x)&&typeof t.y=="number"&&Number.isFinite(t.y))return{x:Number(t.x),y:Number(t.y)}}catch{return}}saveFloatingPosition(e){try{window.localStorage.setItem(Sr,JSON.stringify(e))}catch{}}async submitQuestion(e){const t=e.trim();if(!t||this.streaming)return;const r=this.selectedContext.trim(),s=r?`请结合我选中的内容回答：

${r}

我的问题：${t}`:t,i=r?`${t}

选中内容：${this.truncateText(r,180)}`:t,n=St();this.input="",this.selectedContext="",this.petSourcesOpen=!1,this.petPanelOpen=!0,this.streaming=!0,this.abortController=new AbortController,this.messages=[...this.messages,wt("user",i),wt("assistant","",{id:n,streaming:!0})],await this.updateComplete,this.resizeInput(this.inputElement),this.resizeInput(this.petInputElement),this.scrollToBottom();try{this.useAgentChat?await this.askAgentStream(s,n):await this.askRagStream(s,n)}catch(o){if(this.abortController.signal.aborted)return;const l=o instanceof Error?o.message:"RAG 问答失败";this.failAssistantMessage(n,`抱歉，暂时无法回答，请稍后重试。${l?`（${l}）`:""}`)}finally{this.finishAssistantMessage(n),this.streaming=!1,this.abortController=void 0,this.agentChatClient=void 0,await this.updateComplete,this.scrollToBottom()}}async askAgentStream(e,t){const r=new ir;this.agentChatClient=r;const s=this.ensureConversationId(),i=await r.sendMessage(e,{agent:this.config.agent,historyMessages:this.agentHistoryMessages,conversationId:s,visitorId:this.visitorId,afterNavigationDisplayMode:this.open?"stage":"panel",signal:this.abortController?.signal},{onText:n=>this.setAssistantContent(t,n),onSources:n=>this.receiveSources(t,n),onError:n=>this.failAssistantMessage(t,n),onFinish:n=>{this.agentHistoryMessages=n}});this.agentHistoryMessages=i}async resumeAgentAfterNavigation(e){if(this.streaming||!this.useAgentChat)return;const t=St();this.petPanelOpen=!0,this.petSourcesOpen=!1,this.streaming=!0,this.abortController=new AbortController,this.messages=[...this.messages,wt("assistant","",{id:t,streaming:!0})],await this.updateComplete,this.scrollToBottom();const r=new ir;this.agentChatClient=r;try{const s=await r.sendMessage(e.message,{agent:this.config.agent,historyMessages:e.historyMessages,conversationId:this.ensureConversationId(),visitorId:this.visitorId,recordUserMessage:!1,afterNavigationDisplayMode:this.open?"stage":"panel",signal:this.abortController.signal},{onText:i=>this.setAssistantContent(t,i),onSources:i=>this.receiveSources(t,i),onError:i=>this.failAssistantMessage(t,i),onFinish:i=>{this.agentHistoryMessages=i}});this.agentHistoryMessages=s}catch(s){if(!this.abortController.signal.aborted){const i=s instanceof Error?s.message:"Agent 恢复回答失败";this.failAssistantMessage(t,i)}}finally{this.finishAssistantMessage(t),this.streaming=!1,this.abortController=void 0,this.agentChatClient=void 0,await this.updateComplete,this.scrollToBottom()}}async askRagStream(e,t){await ks({question:e,limit:js,conversationId:this.conversationId,visitorId:this.visitorId},{onConversationId:r=>this.persistConversationId(r),onSources:r=>this.receiveSources(t,r),onDelta:r=>this.appendAssistantDelta(t,r),onError:r=>this.failAssistantMessage(t,r),onDone:()=>this.finishAssistantMessage(t)},this.abortController?.signal)}receiveSources(e,t){this.updateMessage(e,r=>({...r,sources:t}))}async loadStoredConversation(){const e=this.loadConversationId();if(e)try{const t=await Os(e,this.visitorId);if(!t){this.clearConversationId();return}this.conversationId=t.metadata.name,this.messages=this.toAssistantMessages(t),this.agentHistoryMessages=this.toAgentHistoryMessages(t),await this.updateComplete,this.scrollToBottom()}catch{this.clearConversationId()}}toAssistantMessages(e){return(e.spec?.messages||[]).filter(t=>t.role==="user"||t.role==="assistant").filter(t=>!!t.content?.trim()).map(t=>wt(t.role,t.content||"",{id:t.id,time:this.messageTime(t),sources:t.sources,error:t.error}))}toAgentHistoryMessages(e){return(e.spec?.messages||[]).filter(t=>t.role==="user"||t.role==="assistant").filter(t=>!!t.content?.trim()).map(t=>{const r=t.id||St();return{id:r,role:t.role==="assistant"?"assistant":"user",parts:[{type:"text",id:`${r}-text`,text:t.content||""}]}})}messageTime(e){if(!e.createdAt)return pt();const t=new Date(e.createdAt);return Number.isNaN(t.getTime())?pt():pt(t)}persistConversationId(e){if(e.trim()){this.conversationId=e;try{window.localStorage.setItem(oe,e)}catch{}}}ensureConversationId(){if(this.conversationId)return this.conversationId;const e=this.loadConversationId();if(e)return this.conversationId=e,e;const t=`rag-conv-${this.randomId().toLowerCase()}`;return this.persistConversationId(t),t}loadConversationId(){try{return window.localStorage.getItem(oe)||void 0}catch{return}}loadOrCreateVisitorId(){try{const e=window.localStorage.getItem(Cr);if(e)return e;const t=`rag-visitor-${this.randomId()}`;return window.localStorage.setItem(Cr,t),t}catch{return`rag-visitor-${this.randomId()}`}}randomId(){return window.crypto?.randomUUID?window.crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}clearConversationId(){this.conversationId=void 0;try{window.localStorage.removeItem(oe)}catch{}}setAssistantContent(e,t){this.updateMessage(e,r=>({...r,content:t})),this.updateComplete.then(()=>this.scrollToBottom())}appendAssistantDelta(e,t){t&&(this.updateMessage(e,r=>({...r,content:`${r.content}${t}`})),this.updateComplete.then(()=>this.scrollToBottom()))}failAssistantMessage(e,t){this.triggerPetError(),this.updateMessage(e,r=>({...r,content:t,error:!0,streaming:!1})),this.streaming=!1}finishAssistantMessage(e){this.updateMessage(e,t=>({...t,content:t.content||(t.error?t.content:"未找到相关资料，可尝试换个问题。"),streaming:!1}))}updateMessage(e,t){this.messages=Xs(this.messages,e,t)}toggleSourceReferences(e,t){const r=t.currentTarget;if(!(r instanceof HTMLDetailsElement))return;const s=new Set(this.expandedSourceMessageIds);r.open?s.add(e):s.delete(e),this.expandedSourceMessageIds=Array.from(s)}close(){this.open=!1,this.clearSelectionPopup()}newConversation(){this.abortCurrentRequest(),this.clearConversationId(),this.agentHistoryMessages=[],this.messages=[],this.input="",this.selectedContext="",this.petSourcesOpen=!1,this.streaming=!1,this.petPanelOpen=!0,this.updateComplete.then(()=>this.focusCurrentInput())}askWithSelection(){const e=this.selectionPopup.text.trim();e&&(this.selectedContext=e,this.petPanelOpen=!0,this.petSpeechVisible=!1,this.clearSelectionPopup(),this.updateComplete.then(()=>this.focusPetInput()))}updateSelectionPopup(){this.selectionPopup=Js(Gn)}clearSelectionPopup(){this.selectionPopup.visible&&(this.selectionPopup=ut)}resizeInput(e){e&&(e.style.height="auto",e.style.height=`${Math.min(Math.max(e.scrollHeight,38),118)}px`)}focusInput(){this.inputElement?.focus()}focusPetInput(){this.petInputElement?.focus()}focusCurrentInput(){if(this.open){this.focusInput();return}this.focusPetInput()}openPetStage(){this.open=!0,this.petPanelOpen=!1,this.petSourcesOpen=!1,this.updateComplete.then(()=>{this.scrollToBottom(),this.focusInput()})}clearSelectedContext(){this.selectedContext="",this.updateComplete.then(()=>this.focusPetInput())}togglePetSources(){this.petSourcesOpen=!this.petSourcesOpen}expandLatestSources(){const e=this.latestAssistantMessageWithSources?.id;if(!e)return;const t=new Set(this.expandedSourceMessageIds);t.add(e),this.expandedSourceMessageIds=Array.from(t),this.open=!0,this.updateComplete.then(()=>this.scrollToBottom())}useStagePrompt(e){e&&(this.input=e),this.updateComplete.then(()=>this.focusInput())}scrollToBottom(){this.messagesElement&&(this.messagesElement.scrollTop=this.messagesElement.scrollHeight)}abortCurrentRequest(){this.agentChatClient?.stop(),this.agentChatClient=void 0,!(!this.abortController||this.abortController.signal.aborted)&&this.abortController.abort()}clamp(e,t,r){return Math.min(Math.max(e,t),r)}normalizeFloatingOffset(e){return Number.isFinite(e)?Math.max(0,e):ct.horizontalOffset}isSourceReferencesOpen(e){return this.expandedSourceMessageIds.includes(e)}get assistantName(){return this.config.assistantName||ct.assistantName}get petInputPlaceholder(){return this.selectedContext?"想问这段内容什么？":De}get selectedContextPreview(){return this.truncateText(this.selectedContext,120)}get hasConversation(){return this.messages.length>0}get latestAssistantMessage(){return[...this.messages].reverse().find(e=>e.role==="assistant")}get latestAssistantMessageWithSources(){return[...this.messages].reverse().find(e=>e.role==="assistant"&&!!e.sources?.length)}get hasLatestSources(){return!!this.latestAssistantMessageWithSources}get useAgentChat(){return this.config.agent?.enabled!==!1}get latestUserMessage(){return[...this.messages].reverse().find(e=>e.role==="user")}get avatarFallbackText(){return Array.from(this.assistantName.trim())[0]||"智"}get petSize(){return this.config.petSize||Ft}get petMetrics(){return ps(this.petSize)}get bubbleWidth(){return this.petMetrics.width}get bubbleHeight(){return this.petMetrics.height}get petButtonStyle(){const e=this.petMetrics;return[`--rag-pet-width:${e.width}px`,`--rag-pet-height:${e.height}px`,`--rag-pet-sheet-width:${e.sheetWidth}px`,`--rag-pet-sheet-height:${e.sheetHeight}px`].join(";")}get petSpriteStyle(){const e=this.petMetrics,t=ds(this.petAnimationState,this.petFrameIndex);return[`background-image:url("${this.escapeCssUrl(this.petSpriteUrl)}")`,`--rag-pet-frame-x:${-t.col*e.width}px`,`--rag-pet-frame-y:${-t.row*e.height}px`].join(";")}get petAnimationState(){return{errorActive:this.petErrorUntil>Date.now(),direction:this.petDragDirection,thinking:this.isPetThinkingOutsideWindow(),hovering:this.petHovering}}get petSpeechMessages(){const e=this.config.petSpeechMessages||[];return e.length?e:zt}getCurrentPetSpeech(){return this.petSpeechText}get hasActivePet(){return!!this.config.pet?.spritesheetUrl}get canRenderFloatingPet(){return this.configLoaded&&this.floatingPositionReady&&this.hasActivePet&&this.petSpriteReady}get petSpriteUrl(){return this.config.pet?.spritesheetUrl||""}escapeCssUrl(e){return e.replace(/["\\\n\r\f]/g,"")}truncateText(e,t){const r=e.replace(/\s+/g," ").trim();return r.length<=t?r:`${r.slice(0,Math.max(0,t-1))}…`}get welcomeMessage(){return`您好！我是 ${this.assistantName}
我会基于站点知识库检索并回答，尽量给出可追溯来源
请问有什么想查的？`}};f.styles=Ks,b([Ae({type:String,reflect:!0})],f.prototype,"position",2),b([y()],f.prototype,"config",2),b([y()],f.prototype,"configLoaded",2),b([y()],f.prototype,"open",2),b([y()],f.prototype,"petPanelOpen",2),b([y()],f.prototype,"input",2),b([y()],f.prototype,"selectedContext",2),b([y()],f.prototype,"petSourcesOpen",2),b([y()],f.prototype,"messages",2),b([y()],f.prototype,"streaming",2),b([y()],f.prototype,"expandedSourceMessageIds",2),b([y()],f.prototype,"selectionPopup",2),b([y()],f.prototype,"floatingPosition",2),b([y()],f.prototype,"floatingPositionReady",2),b([y()],f.prototype,"petSpriteReady",2),b([y()],f.prototype,"draggingBubble",2),b([y()],f.prototype,"petFrameIndex",2),b([y()],f.prototype,"petHovering",2),b([y()],f.prototype,"petDragDirection",2),b([y()],f.prototype,"petErrorUntil",2),b([y()],f.prototype,"petSpeechVisible",2),b([y()],f.prototype,"petSpeechIndex",2),b([y()],f.prototype,"petSpeechText",2),b([Ut(".pet-stage-output")],f.prototype,"messagesElement",2),b([Ut(".conversation-input")],f.prototype,"inputElement",2),b([Ut(".pet-composer-input")],f.prototype,"petInputElement",2),f=b([Kr("summaraid-rag-assistant")],f);const Ar="summaraid-rag-assistant";function Yn(){window.likcc_summaraidGPT_ragAssistantLoaded||(console.log("%c智阅GPT-RAG 智能助手","color: #1f1f1f; font-size: 16px; font-weight: bold;"),console.log("%c基于知识库检索增强生成的 Halo 智能助手","color: #8a6f38; font-size: 12px;"),window.likcc_summaraidGPT_ragAssistantLoaded=!0)}async function ae(){if(!document.body)return;const e=document.querySelector(Ar);if(e)return e;const t=document.createElement(Ar);return document.body.appendChild(t),t}async function Kn(e){(await ae())?.openAssistant(e)}function $r(){window.setTimeout(()=>{ae()},0)}Yn(),window.likcc_summaraidGPT_initRagAssistant=ae,window.likcc_summaraidGPT_openRagAssistant=Kn,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",$r,{once:!0}):$r()}));
