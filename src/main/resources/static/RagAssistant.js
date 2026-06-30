(function(k){typeof define=="function"&&define.amd?define(k):k()})((function(){"use strict";const k=globalThis,re=k.ShadowRoot&&(k.ShadyCSS===void 0||k.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ie=Symbol(),ye=new WeakMap;let $e=class{constructor(e,r,i){if(this._$cssResult$=!0,i!==ie)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=r}get styleSheet(){let e=this.o;const r=this.t;if(re&&e===void 0){const i=r!==void 0&&r.length===1;i&&(e=ye.get(r)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ye.set(r,e))}return e}toString(){return this.cssText}};const bt=t=>new $e(typeof t=="string"?t:t+"",void 0,ie),xt=(t,...e)=>{const r=t.length===1?t[0]:e.reduce((i,s,n)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1],t[0]);return new $e(r,t,ie)},vt=(t,e)=>{if(re)t.adoptedStyleSheets=e.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(const r of e){const i=document.createElement("style"),s=k.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=r.cssText,t.appendChild(i)}},Se=re?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let r="";for(const i of e.cssRules)r+=i.cssText;return bt(r)})(t):t;const{is:wt,defineProperty:yt,getOwnPropertyDescriptor:$t,getOwnPropertyNames:St,getOwnPropertySymbols:_t,getPrototypeOf:At}=Object,K=globalThis,_e=K.trustedTypes,Et=_e?_e.emptyScript:"",Pt=K.reactiveElementPolyfillSupport,O=(t,e)=>t,J={toAttribute(t,e){switch(e){case Boolean:t=t?Et:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let r=t;switch(e){case Boolean:r=t!==null;break;case Number:r=t===null?null:Number(t);break;case Object:case Array:try{r=JSON.parse(t)}catch{r=null}}return r}},se=(t,e)=>!wt(t,e),Ae={attribute:!0,type:String,converter:J,reflect:!1,useDefault:!1,hasChanged:se};Symbol.metadata??=Symbol("metadata"),K.litPropertyMetadata??=new WeakMap;let U=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,r=Ae){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(e,r),!r.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,r);s!==void 0&&yt(this.prototype,e,s)}}static getPropertyDescriptor(e,r,i){const{get:s,set:n}=$t(this.prototype,e)??{get(){return this[r]},set(o){this[r]=o}};return{get:s,set(o){const c=s?.call(this);n?.call(this,o),this.requestUpdate(e,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ae}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;const e=At(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){const r=this.properties,i=[...St(r),..._t(r)];for(const s of i)this.createProperty(s,r[s])}const e=this[Symbol.metadata];if(e!==null){const r=litPropertyMetadata.get(e);if(r!==void 0)for(const[i,s]of r)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[r,i]of this.elementProperties){const s=this._$Eu(r,i);s!==void 0&&this._$Eh.set(s,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const r=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)r.unshift(Se(s))}else e!==void 0&&r.push(Se(e));return r}static _$Eu(e,r){const i=r.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,r=this.constructor.elementProperties;for(const i of r.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return vt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,r,i){this._$AK(e,i)}_$ET(e,r){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:J).toAttribute(r,i.type);this._$Em=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,r){const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const n=i.getPropertyOptions(s),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:J;this._$Em=s;const c=o.fromAttribute(r,n.type);this[s]=c??this._$Ej?.get(s)??c,this._$Em=null}}requestUpdate(e,r,i,s=!1,n){if(e!==void 0){const o=this.constructor;if(s===!1&&(n=this[e]),i??=o.getPropertyOptions(e),!((i.hasChanged??se)(n,r)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,i))))return;this.C(e,r,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,r,{useDefault:i,reflect:s,wrapped:n},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??r??this[e]),n!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(r=void 0),this._$AL.set(e,r)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,n]of this._$Ep)this[s]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,n]of i){const{wrapped:o}=n,c=this[s];o!==!0||this._$AL.has(s)||c===void 0||this.C(s,void 0,n,c)}}let e=!1;const r=this._$AL;try{e=this.shouldUpdate(r),e?(this.willUpdate(r),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(r)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(r)}willUpdate(e){}_$AE(e){this._$EO?.forEach(r=>r.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(r=>this._$ET(r,this[r])),this._$EM()}updated(e){}firstUpdated(e){}};U.elementStyles=[],U.shadowRootOptions={mode:"open"},U[O("elementProperties")]=new Map,U[O("finalized")]=new Map,Pt?.({ReactiveElement:U}),(K.reactiveElementVersions??=[]).push("2.1.2");const ne=globalThis,Ee=t=>t,Z=ne.trustedTypes,Pe=Z?Z.createPolicy("lit-html",{createHTML:t=>t}):void 0,Ce="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,Te="?"+P,Ct=`<${Te}>`,I=document,H=()=>I.createComment(""),F=t=>t===null||typeof t!="object"&&typeof t!="function",oe=Array.isArray,Tt=t=>oe(t)||typeof t?.[Symbol.iterator]=="function",ae=`[ 	
\f\r]`,z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ke=/-->/g,Ie=/>/g,M=RegExp(`>|${ae}(?:([^\\s"'>=/]+)(${ae}*=${ae}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Me=/'/g,Re=/"/g,Ue=/^(?:script|style|textarea|title)$/i,kt=t=>(e,...r)=>({_$litType$:t,strings:e,values:r}),m=kt(1),C=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),De=new WeakMap,R=I.createTreeWalker(I,129);function Le(t,e){if(!oe(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Pe!==void 0?Pe.createHTML(e):e}const It=(t,e)=>{const r=t.length-1,i=[];let s,n=e===2?"<svg>":e===3?"<math>":"",o=z;for(let c=0;c<r;c++){const a=t[c];let p,l,g=-1,v=0;for(;v<a.length&&(o.lastIndex=v,l=o.exec(a),l!==null);)v=o.lastIndex,o===z?l[1]==="!--"?o=ke:l[1]!==void 0?o=Ie:l[2]!==void 0?(Ue.test(l[2])&&(s=RegExp("</"+l[2],"g")),o=M):l[3]!==void 0&&(o=M):o===M?l[0]===">"?(o=s??z,g=-1):l[1]===void 0?g=-2:(g=o.lastIndex-l[2].length,p=l[1],o=l[3]===void 0?M:l[3]==='"'?Re:Me):o===Re||o===Me?o=M:o===ke||o===Ie?o=z:(o=M,s=void 0);const w=o===M&&t[c+1].startsWith("/>")?" ":"";n+=o===z?a+Ct:g>=0?(i.push(p),a.slice(0,g)+Ce+a.slice(g)+P+w):a+P+(g===-2?c:w)}return[Le(t,n+(t[r]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class B{constructor({strings:e,_$litType$:r},i){let s;this.parts=[];let n=0,o=0;const c=e.length-1,a=this.parts,[p,l]=It(e,r);if(this.el=B.createElement(p,i),R.currentNode=this.el.content,r===2||r===3){const g=this.el.content.firstChild;g.replaceWith(...g.childNodes)}for(;(s=R.nextNode())!==null&&a.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(const g of s.getAttributeNames())if(g.endsWith(Ce)){const v=l[o++],w=s.getAttribute(g).split(P),S=/([.?@])?(.*)/.exec(v);a.push({type:1,index:n,name:S[2],strings:w,ctor:S[1]==="."?Rt:S[1]==="?"?Ut:S[1]==="@"?Dt:Q}),s.removeAttribute(g)}else g.startsWith(P)&&(a.push({type:6,index:n}),s.removeAttribute(g));if(Ue.test(s.tagName)){const g=s.textContent.split(P),v=g.length-1;if(v>0){s.textContent=Z?Z.emptyScript:"";for(let w=0;w<v;w++)s.append(g[w],H()),R.nextNode(),a.push({type:2,index:++n});s.append(g[v],H())}}}else if(s.nodeType===8)if(s.data===Te)a.push({type:2,index:n});else{let g=-1;for(;(g=s.data.indexOf(P,g+1))!==-1;)a.push({type:7,index:n}),g+=P.length-1}n++}}static createElement(e,r){const i=I.createElement("template");return i.innerHTML=e,i}}function D(t,e,r=t,i){if(e===C)return e;let s=i!==void 0?r._$Co?.[i]:r._$Cl;const n=F(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(t),s._$AT(t,r,i)),i!==void 0?(r._$Co??=[])[i]=s:r._$Cl=s),s!==void 0&&(e=D(t,s._$AS(t,e.values),s,i)),e}class Mt{constructor(e,r){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:r},parts:i}=this._$AD,s=(e?.creationScope??I).importNode(r,!0);R.currentNode=s;let n=R.nextNode(),o=0,c=0,a=i[0];for(;a!==void 0;){if(o===a.index){let p;a.type===2?p=new j(n,n.nextSibling,this,e):a.type===1?p=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(p=new Lt(n,this,e)),this._$AV.push(p),a=i[++c]}o!==a?.index&&(n=R.nextNode(),o++)}return R.currentNode=I,s}p(e){let r=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,r),r+=i.strings.length-2):i._$AI(e[r])),r++}}class j{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,r,i,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=r,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const r=this._$AM;return r!==void 0&&e?.nodeType===11&&(e=r.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,r=this){e=D(this,e,r),F(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==C&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Tt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&F(this._$AH)?this._$AA.nextSibling.data=e:this.T(I.createTextNode(e)),this._$AH=e}$(e){const{values:r,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=B.createElement(Le(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(r);else{const n=new Mt(s,this),o=n.u(this.options);n.p(r),this.T(o),this._$AH=n}}_$AC(e){let r=De.get(e.strings);return r===void 0&&De.set(e.strings,r=new B(e)),r}k(e){oe(this._$AH)||(this._$AH=[],this._$AR());const r=this._$AH;let i,s=0;for(const n of e)s===r.length?r.push(i=new j(this.O(H()),this.O(H()),this,this.options)):i=r[s],i._$AI(n),s++;s<r.length&&(this._$AR(i&&i._$AB.nextSibling,s),r.length=s)}_$AR(e=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);e!==this._$AB;){const i=Ee(e).nextSibling;Ee(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,r,i,s,n){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=r,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=h}_$AI(e,r=this,i,s){const n=this.strings;let o=!1;if(n===void 0)e=D(this,e,r,0),o=!F(e)||e!==this._$AH&&e!==C,o&&(this._$AH=e);else{const c=e;let a,p;for(e=n[0],a=0;a<n.length-1;a++)p=D(this,c[i+a],r,a),p===C&&(p=this._$AH[a]),o||=!F(p)||p!==this._$AH[a],p===h?e=h:e!==h&&(e+=(p??"")+n[a+1]),this._$AH[a]=p}o&&!s&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Rt extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}}class Ut extends Q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}}class Dt extends Q{constructor(e,r,i,s,n){super(e,r,i,s,n),this.type=5}_$AI(e,r=this){if((e=D(this,e,r,0)??h)===C)return;const i=this._$AH,s=e===h&&i!==h||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==h&&(i===h||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Lt{constructor(e,r,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=r,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){D(this,e)}}const Nt=ne.litHtmlPolyfillSupport;Nt?.(B,j),(ne.litHtmlVersions??=[]).push("3.3.2");const Ot=(t,e,r)=>{const i=r?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const n=r?.renderBefore??null;i._$litPart$=s=new j(e.insertBefore(H(),n),n,void 0,r??{})}return s._$AI(t),s};const le=globalThis;let W=class extends U{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ot(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};W._$litElement$=!0,W.finalized=!0,le.litElementHydrateSupport?.({LitElement:W});const Ht=le.litElementPolyfillSupport;Ht?.({LitElement:W}),(le.litElementVersions??=[]).push("4.2.2");const Ft=t=>(e,r)=>{r!==void 0?r.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};const zt={attribute:!0,type:String,converter:J,reflect:!1,hasChanged:se},Bt=(t=zt,e,r)=>{const{kind:i,metadata:s}=r;let n=globalThis.litPropertyMetadata.get(s);if(n===void 0&&globalThis.litPropertyMetadata.set(s,n=new Map),i==="setter"&&((t=Object.create(t)).wrapped=!0),n.set(r.name,t),i==="accessor"){const{name:o}=r;return{set(c){const a=e.get.call(this);e.set.call(this,c),this.requestUpdate(o,a,t,!0,c)},init(c){return c!==void 0&&this.C(o,void 0,t,c),c}}}if(i==="setter"){const{name:o}=r;return function(c){const a=this[o];e.call(this,c),this.requestUpdate(o,a,t,!0,c)}}throw Error("Unsupported decorator location: "+i)};function Ne(t){return(e,r)=>typeof r=="object"?Bt(t,e,r):((i,s,n)=>{const o=s.hasOwnProperty(n);return s.constructor.createProperty(n,i),o?Object.getOwnPropertyDescriptor(s,n):void 0})(t,e,r)}function b(t){return Ne({...t,state:!0,attribute:!1})}const jt=(t,e,r)=>(r.configurable=!0,r.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(t,e,r),r);function Oe(t,e){return(r,i,s)=>{const n=o=>o.renderRoot?.querySelector(t)??null;return jt(r,i,{get(){return n(this)}})}}const He={ATTRIBUTE:1,CHILD:2},Fe=t=>(...e)=>({_$litDirective$:t,values:e});let ze=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,r,i){this._$Ct=e,this._$AM=r,this._$Ci=i}_$AS(e,r){return this.update(e,r)}update(e,r){return this.render(...r)}};class ce extends ze{constructor(e){if(super(e),this.it=h,e.type!==He.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===h||e==null)return this._t=void 0,this.it=e;if(e===C)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const r=[e];return r.raw=r,this._t={_$litType$:this.constructor.resultType,strings:r,values:[]}}}ce.directiveName="unsafeHTML",ce.resultType=1;const Wt=Fe(ce),pe=["有什么站内资料想查？","选中文字后也可以直接问我。","我会优先基于知识库回答。","需要我帮你追溯文章来源吗？"],Be="正在检索知识库，稍等一下。",Gt=8,Yt=9,Vt=208/192,L=(t,e)=>Array.from({length:e},(r,i)=>({row:t,col:i})),Xt=L(0,6),qt=L(3,4),Kt=L(8,6),Jt=L(5,8),Zt=L(1,8),Qt=L(2,8);function je(t){const e=t,r=Math.round(t*Vt);return{width:e,height:r,sheetWidth:e*Gt,sheetHeight:r*Yt}}function We(t){return t.errorActive?Jt:t.direction==="right"?Zt:t.direction==="left"?Qt:t.thinking?Kt:t.hovering?qt:Xt}function er(t,e){const r=We(t);return r[e%r.length]}const _={stylePreset:"default",primaryColor:"#2563eb",secondaryColor:"#eaf3ff",surfaceColor:"#fbfdff",textColor:"#172033",borderRadius:"soft",colorMode:"light"},de={surfaceColor:"#171717",textColor:"#f7f2e8",secondaryColor:"#292524"},Ge={default:{primaryColor:"#2563eb",secondaryColor:"#eaf3ff",surfaceColor:"#fbfdff",textColor:"#172033"},graphite:{primaryColor:"#d6b46c",secondaryColor:"#2a2a28",surfaceColor:"#171717",textColor:"#f7f2e8"},ocean:{primaryColor:"#1f7a8c",secondaryColor:"#d9f0f3",surfaceColor:"#fbfeff",textColor:"#142326"},forest:{primaryColor:"#2f7d50",secondaryColor:"#dceedd",surfaceColor:"#fbfdf8",textColor:"#18251b"},rose:{primaryColor:"#b85c7a",secondaryColor:"#f8dfe8",surfaceColor:"#fffafc",textColor:"#2b1720"}},tr={standard:{panel:"10px",card:"8px",control:"10px"},soft:{panel:"18px",card:"13px",control:"999px"},round:{panel:"26px",card:"18px",control:"999px"}};function Ye(t){const e=or(t?.stylePreset),r=e==="custom"?Ge.default:Ge[e],i=e==="custom";return{stylePreset:e,primaryColor:ee(i?t?.primaryColor:r.primaryColor,_.primaryColor),secondaryColor:ee(i?t?.secondaryColor:r.secondaryColor,_.secondaryColor),surfaceColor:ee(i?t?.surfaceColor:r.surfaceColor,_.surfaceColor),textColor:ee(i?t?.textColor:r.textColor,_.textColor),borderRadius:ar(t?.borderRadius),colorMode:lr(t?.colorMode)}}function rr(t,e){const r=ir(Ye(e)),i=G(r.primaryColor),s=G(r.surfaceColor),n=G(r.textColor),o=G(r.secondaryColor),c=tr[r.borderRadius],a=nr(r),p={r:0,g:0,b:0},l={r:255,g:255,b:255};d(t,"--rag-text",r.textColor),d(t,"--rag-muted",E(y(n,s,.42))),d(t,"--rag-line",x(n,.095)),d(t,"--rag-soft-line",x(n,.06)),d(t,"--rag-paper",x(s,.97)),d(t,"--rag-panel",r.surfaceColor),d(t,"--rag-ink",r.textColor),d(t,"--rag-secondary",r.secondaryColor),d(t,"--rag-gold",r.primaryColor),d(t,"--rag-gold-strong",E(y(i,{r:0,g:0,b:0},.18))),d(t,"--rag-gold-soft",x(i,.16)),d(t,"--rag-gold-faint",x(i,.05)),d(t,"--rag-primary-contrast",pr(i)),d(t,"--rag-secondary-soft",x(o,.48)),d(t,"--rag-radius-panel",c.panel),d(t,"--rag-radius-card",c.card),d(t,"--rag-radius-control",c.control),d(t,"--rag-shadow",dr(n,a)),d(t,"--rag-window-surface",E(y(s,a?l:i,a?.055:.018))),d(t,"--rag-window-surface-2",E(y(s,a?p:l,a?.1:.42))),d(t,"--rag-header-surface",x(y(s,a?l:i,a?.075:.035),a?.96:.985)),d(t,"--rag-messages-surface",E(y(s,a?p:l,a?.045:.36))),d(t,"--rag-footer-surface",x(y(s,a?p:l,a?.035:.28),.98)),d(t,"--rag-control-surface",x(y(s,l,a?.07:.68),a?.78:.9)),d(t,"--rag-input-surface-resolved",E(y(s,l,a?.065:.62))),d(t,"--rag-assistant-message-bg",E(y(s,l,a?.075:.82))),d(t,"--rag-assistant-message-border",x(y(a?n:i,s,a?.78:.72),a?.2:.18)),d(t,"--rag-window-border",x(y(n,s,a?.74:.86),a?.18:.13)),d(t,"--rag-divider",x(n,a?.075:.08)),d(t,"--rag-card-shadow",a?"0 8px 18px rgba(0, 0, 0, 0.18)":`0 10px 24px ${x(n,.055)}`),d(t,"--rag-control-shadow",a?"0 8px 18px rgba(0, 0, 0, 0.16)":`0 8px 18px ${x(n,.05)}`),d(t,"--rag-user-message-start",E(y(i,l,a?.08:.16))),d(t,"--rag-user-message-end",E(y(i,p,.18)))}function ir(t){return sr(t.colorMode)?{...t,surfaceColor:he(t.surfaceColor,_.surfaceColor,de.surfaceColor),textColor:he(t.textColor,_.textColor,de.textColor),secondaryColor:he(t.secondaryColor,_.secondaryColor,de.secondaryColor)}:t}function sr(t){return t==="dark"?!0:t==="light"?!1:window.matchMedia?.("(prefers-color-scheme: dark)").matches??!1}function nr(t){return Xe(G(t.surfaceColor))<.28}function ee(t,e){const r=t?.trim();return r&&cr(r)?Ve(r).toLowerCase():e}function or(t){return t==="graphite"||t==="ocean"||t==="forest"||t==="rose"||t==="custom"?t:_.stylePreset}function ar(t){return t==="standard"||t==="round"?t:_.borderRadius}function lr(t){return t==="auto"||t==="light"||t==="dark"?t:_.colorMode}function he(t,e,r){return t.toLowerCase()===e.toLowerCase()?r:t}function cr(t){return/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)}function Ve(t){return t.length===4?`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`:t}function G(t){const e=Ve(t).slice(1);return{r:Number.parseInt(e.slice(0,2),16),g:Number.parseInt(e.slice(2,4),16),b:Number.parseInt(e.slice(4,6),16)}}function y(t,e,r){const i=1-r;return{r:Math.round(t.r*i+e.r*r),g:Math.round(t.g*i+e.g*r),b:Math.round(t.b*i+e.b*r)}}function x(t,e){return`rgba(${t.r}, ${t.g}, ${t.b}, ${e})`}function E(t){return`#${ue(t.r)}${ue(t.g)}${ue(t.b)}`}function ue(t){return Math.min(Math.max(t,0),255).toString(16).padStart(2,"0")}function pr(t){return Xe(t)>.55?"#171717":"#ffffff"}function Xe(t){const e=[t.r,t.g,t.b].map(r=>{const i=r/255;return i<=.03928?i/12.92:((i+.055)/1.055)**2.4});return .2126*e[0]+.7152*e[1]+.0722*e[2]}function dr(t,e){return e?`0 20px 56px ${x(t,.1)}, 0 6px 18px rgba(0, 0, 0, 0.34)`:`0 20px 56px ${x(t,.12)}, 0 6px 18px ${x(t,.07)}`}function d(t,e,r){t.style.setProperty(e,r)}const ge="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",fe=24,hr=800,qe="智阅助手",Ke="/plugins/summaraidGPT/assets/static/icon.svg",Je={enabled:!0,displayName:"鸡哥ikun",petJsonUrl:"/plugins/summaraidGPT/assets/static/pets/default-ikun/pet.json",spritesheetUrl:"/plugins/summaraidGPT/assets/static/pets/default-ikun/spritesheet.webp"},Y={assistantAvatar:Ke,assistantName:qe,styleConfig:_,buttonPosition:"right",horizontalOffset:fe,verticalOffset:fe,petSpeechMessages:pe,pet:Je};async function ur(){try{const t=await fetch(`${ge}/dialogConfig`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`HTTP ${t.status}`);const e=await t.json();return mr(e)}catch{return{...Y}}}async function gr(t,e,r){const i=await fetch(`${ge}/ragAskStream`,{method:"POST",credentials:"same-origin",signal:r,headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(t)});if(!i.ok||!i.body)throw new Error(`HTTP ${i.status}`);const s=i.body.getReader(),n=new TextDecoder;let o="";const c=a=>{const p=yr(a);if(!p)return;const l=JSON.parse(p);l.type==="conversation"?l.conversationId&&e.onConversationId?.(l.conversationId):l.type==="sources"?e.onSources?.(l.sources||[]):l.type==="delta"?e.onDelta?.(l.delta||""):l.type==="done"?e.onDone?.():l.type==="error"&&e.onError?.(l.error||"RAG 问答失败")};for(;;){const{done:a,value:p}=await s.read();if(a){o+=n.decode();break}o+=n.decode(p,{stream:!0});const l=o.split(/\r?\n\r?\n/);o=l.pop()||"",l.forEach(c)}o.trim()&&c(o)}async function fr(t,e){if(!t.trim()||!e.trim())return;const r=new URLSearchParams({visitorId:e}),i=await fetch(`${ge}/ragConversations/${encodeURIComponent(t)}?${r}`,{credentials:"same-origin",headers:{Accept:"application/json"}});if(!(i.status===404||i.status===403)){if(!i.ok)throw new Error(`HTTP ${i.status}`);return await i.json()}}function mr(t){const e=String(t.buttonPosition).trim()==="left"?"left":"right";return{...Y,...t,buttonPosition:e,assistantAvatar:vr(t.assistantAvatar),assistantName:wr(t.assistantName),styleConfig:Ye(t.styleConfig),horizontalOffset:Ze(t.horizontalOffset),verticalOffset:Ze(t.verticalOffset),petSpeechMessages:xr(t.petSpeechMessages)||pe,pet:br(t.pet)||Je}}function br(t){if(!t||t.enabled===!1)return;const e=t.spritesheetUrl?.trim();if(e)return{enabled:!0,displayName:t.displayName?.trim()||void 0,petJsonUrl:t.petJsonUrl?.trim()||void 0,spritesheetUrl:e}}function xr(t){if(!Array.isArray(t))return;const e=t.map(r=>`${r||""}`.trim()).filter(Boolean).slice(0,12);return e.length?e:void 0}function vr(t){const e=t?.trim();return!e||e.toLowerCase().startsWith("javascript:")?Ke:e}function Ze(t){const e=Number(t);return Number.isFinite(e)?Math.round(Math.min(Math.max(e,0),hr)):fe}function wr(t){return t?.trim()||qe}function yr(t){const e=t.split(/\r?\n/).filter(r=>r.startsWith("data:")).map(r=>r.replace(/^data:\s?/,""));return e.length?e.join(`
`):void 0}const Qe="important",$r=" !"+Qe,Sr=Fe(class extends ze{constructor(t){if(super(t),t.type!==He.ATTRIBUTE||t.name!=="style"||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,r)=>{const i=t[r];return i==null?e:e+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(t,[e]){const{style:r}=t.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(const i of this.ft)e[i]==null&&(this.ft.delete(i),i.includes("-")?r.removeProperty(i):r[i]=null);for(const i in e){const s=e[i];if(s!=null){this.ft.add(i);const n=typeof s=="string"&&s.endsWith($r);i.includes("-")||n?r.setProperty(i,n?s.slice(0,-11):s,n?Qe:""):r[i]=s}}return C}}),et="ri:book-open-line",tt="https://api.iconify.design",rt=/^([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)$/i;function A(t,e="iconify-icon"){const r=_r(t)||me(et);return m`
    <span
      class=${e}
      style=${Sr({"--rag-icon-source":`url("${r}")`})}
      aria-hidden="true"
    ></span>
  `}function _r(t){const e=t?.trim();if(e){if(Ar(e))return me(e);if(Er(e))return Tr(e);if(Pr(e)||Cr(e))return e}}function Ar(t){return rt.test(t)}function me(t){const e=t.match(rt);if(!e)return me(et);const[,r,i]=e;return`${tt}/${encodeURIComponent(r)}/${encodeURIComponent(i)}.svg`}function Er(t){return t.startsWith("<svg")&&t.endsWith("</svg>")}function Pr(t){return t.startsWith("data:image/svg+xml")}function Cr(t){try{const e=new URL(t);return e.origin===tt&&e.pathname.endsWith(".svg")}catch{return!1}}function Tr(t){return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(t)}`}function kr(){return A("ri:fullscreen-line")}function Ir(){return A("ri:fullscreen-exit-line")}function Mr(){return A("ri:close-line")}function Rr(){return A("ri:send-plane-2-line")}function Ur(){return A("ri:chat-new-line")}function Dr(){return A("ri:file-text-line")}function Lr(){return A("ri:arrow-down-s-line")}function Nr(){return A("ri:external-link-line")}function Or(){return A("ri:shield-check-line")}function Hr(){return A("ri:question-answer-line")}function V(t=new Date){return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function Fr(t){const e=t.replace(/\r\n?/g,`
`).split(`
`),r=[];let i=[],s=[],n=[],o=[],c=!1,a="";const p=()=>{i.length&&(r.push(`<p>${X(i.join(`
`)).replace(/\n/g,"<br>")}</p>`),i=[])},l=()=>{s.length&&(r.push(`<ul>${s.map(w=>`<li>${X(w)}</li>`).join("")}</ul>`),s=[])},g=()=>{n.length&&(r.push(`<ol>${n.map(w=>`<li>${X(w)}</li>`).join("")}</ol>`),n=[])},v=()=>{l(),g()};for(const w of e){const S=w.trimEnd(),ht=S.match(/^```([A-Za-z0-9_-]*)\s*$/);if(ht){c?(r.push(`<pre><code${a?` class="language-${it(a)}"`:""}>${te(o.join(`
`))}</code></pre>`),o=[],a="",c=!1):(p(),v(),c=!0,a=ht[1]||"");continue}if(c){o.push(w);continue}if(!S.trim()){p(),v();continue}const we=S.match(/^(#{1,4})\s+(.+)$/);if(we){p(),v();const mt=we[1].length;r.push(`<h${mt}>${X(we[2].trim())}</h${mt}>`);continue}const ut=S.match(/^\s*[-*]\s+(.+)$/);if(ut){p(),g(),s.push(ut[1]);continue}const gt=S.match(/^\s*\d+\.\s+(.+)$/);if(gt){p(),l(),n.push(gt[1]);continue}const ft=S.match(/^>\s?(.+)$/);if(ft){p(),v(),r.push(`<blockquote>${X(ft[1])}</blockquote>`);continue}v(),i.push(S)}return c&&r.push(`<pre><code>${te(o.join(`
`))}</code></pre>`),p(),v(),r.join("")}function X(t){const e=[];let r=te(t).replace(/`([^`]+)`/g,(i,s)=>{const n=`@@CODE${e.length}@@`;return e.push(`<code>${s}</code>`),n});return r=r.replace(/\[([^\]]+)]\(([^)\s]+)\)/g,(i,s,n)=>{const o=zr(n);return o?`<a href="${it(o)}" target="_blank" rel="noopener noreferrer">${s}</a>`:s}).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/__([^_]+)__/g,"<strong>$1</strong>").replace(/(^|[\s>])\*{1,2}([\u4e00-\u9fa5A-Za-z0-9][^*\n：:]{0,18}[：:])/g,"$1<strong>$2</strong>").replace(/(^|[\s>])\*([^*\n]+)\*/g,"$1<em>$2</em>").replace(/(^|[\s>])_([^_\n]+)_/g,"$1<em>$2</em>"),e.forEach((i,s)=>{r=r.replace(`@@CODE${s}@@`,i)}),r}function zr(t){const e=t.trim();return/^(https?:|mailto:|\/|#)/i.test(e)?e:""}function te(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function it(t){return te(t).replace(/`/g,"&#96;")}function Br(t,e){return t.length?m`
    <details class="source-references" ?open=${e.open} @toggle=${e.onToggle}>
      <summary class="source-summary">
        <span class="source-summary-label">参考来源</span>
        <span class="source-count">${t.length}</span>
        <span class="source-summary-icon">${Lr()}</span>
      </summary>
      <div class="source-reference-list">
        ${t.map(r=>jr(r))}
      </div>
    </details>
  `:h}function jr(t){const e=m`
    <span class="source-icon">${Dr()}</span>
    <span class="source-main">
      <span class="source-title">${Wr(t)}</span>
    </span>
    <span class="source-side">
      ${t.url?m`<span class="source-link-icon" aria-hidden="true">${Nr()}</span>`:h}
    </span>
  `;return t.url?m`
        <a class="source-reference-row" href=${t.url} target="_blank" rel="noopener noreferrer">
          ${e}
        </a>
      `:m`<div class="source-reference-row">${e}</div>`}function Wr(t){const e=t.title?.trim();return e?`《${e}》`:"未命名来源"}const Gr=xt`
  :host {
    --rag-text: #18181b;
    --rag-muted: #71717a;
    --rag-line: rgba(24, 24, 27, 0.095);
    --rag-soft-line: rgba(24, 24, 27, 0.06);
    --rag-paper: rgba(255, 255, 255, 0.97);
    --rag-panel: #fafafa;
    --rag-ink: #18181b;
    --rag-secondary: #f4f4f5;
    --rag-secondary-soft: rgba(244, 244, 245, 0.62);
    --rag-gold: #a16207;
    --rag-gold-strong: #85510a;
    --rag-gold-soft: rgba(161, 98, 7, 0.16);
    --rag-gold-faint: rgba(161, 98, 7, 0.05);
    --rag-surface-lift: color-mix(in srgb, var(--rag-paper) 90%, white);
    --rag-surface-muted: color-mix(in srgb, var(--rag-panel) 88%, var(--rag-secondary));
    --rag-control: color-mix(in srgb, var(--rag-paper) 96%, transparent);
    --rag-window-surface: color-mix(in srgb, var(--rag-panel) 96%, var(--rag-text) 4%);
    --rag-window-surface-2: var(--rag-panel);
    --rag-header-surface: color-mix(in srgb, var(--rag-panel) 94%, transparent);
    --rag-messages-surface: var(--rag-panel);
    --rag-footer-surface: color-mix(in srgb, var(--rag-panel) 96%, transparent);
    --rag-control-surface: color-mix(in srgb, var(--rag-paper) 86%, transparent);
    --rag-input-surface-resolved: color-mix(in srgb, var(--rag-panel) 90%, white);
    --rag-assistant-message-bg: color-mix(in srgb, var(--rag-panel) 92%, white);
    --rag-assistant-message-border: color-mix(in srgb, var(--rag-line) 76%, transparent);
    --rag-window-border: var(--rag-line);
    --rag-divider: var(--rag-soft-line);
    --rag-card-shadow: 0 10px 24px rgba(18, 18, 18, 0.055);
    --rag-control-shadow: 0 8px 18px rgba(18, 18, 18, 0.05);
    --rag-user-message-start: var(--rag-gold);
    --rag-user-message-end: var(--rag-gold-strong);
    --rag-ring: color-mix(in srgb, var(--rag-gold) 42%, transparent);
    --rag-frost: color-mix(in srgb, var(--rag-paper) 74%, transparent);
    --rag-primary-contrast: #fff;
    --rag-radius-panel: 18px;
    --rag-radius-card: 13px;
    --rag-radius-control: 999px;
    --rag-shadow: 0 20px 56px rgba(18, 18, 18, 0.12), 0 6px 18px rgba(18, 18, 18, 0.07);
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
  textarea:focus-visible {
    outline: 2px solid var(--rag-ring);
    outline-offset: 3px;
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
    border-radius: 0;
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

  .bubble-wrapper {
    position: relative;
    display: inline-flex;
    width: var(--rag-pet-width, 76px);
    height: var(--rag-pet-height, 82px);
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

  .avatar,
  .message-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
    background: var(--rag-gold);
    color: var(--rag-primary-contrast);
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

  .bubble:focus-visible {
    outline: none;
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

  :host([position='right']) .pet-speech {
    right: 0;
  }

  :host([position='left']) .pet-speech {
    left: 0;
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

  .avatar-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--rag-primary-contrast);
    font-weight: 820;
    line-height: 1;
  }

  .unread {
    position: absolute;
    top: -7px;
    right: -4px;
    min-width: 19px;
    height: 19px;
    padding: 0 6px;
    border-radius: 999px;
    background: #ef3e2d;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(239, 62, 45, 0.35);
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
    animation: popover-in 0.14s ease-out;
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
    transition:
      background 0.14s ease,
      color 0.14s ease;
  }

  .selection-popover button:hover {
    background: var(--rag-secondary-soft);
  }

  .selection-popover svg,
  .selection-popover .iconify-icon {
    width: 16px;
    height: 16px;
  }

  .window-shell {
    position: fixed;
    right: clamp(16px, 3vw, 32px);
    bottom: clamp(16px, 3vw, 32px);
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 16px;
    width: min(536px, calc(100vw - 32px));
    max-width: calc(100vw - 32px);
    transform-origin: bottom right;
    animation: shell-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .window-shell.fullscreen {
    top: 24px;
    right: 24px;
    bottom: 24px;
    left: 24px;
    width: auto;
    max-width: none;
    grid-template-columns: minmax(0, 1fr);
    transform-origin: center;
  }

  :host([position='left']) .window-shell {
    right: auto;
    left: clamp(16px, 3vw, 32px);
    transform-origin: bottom left;
  }

  :host([position='left']) .window-shell.fullscreen {
    right: 24px;
    left: 24px;
  }

  .chat-window {
    position: relative;
    overflow: hidden;
    border-radius: var(--rag-radius-panel);
    background: linear-gradient(180deg, var(--rag-window-surface), var(--rag-window-surface-2));
    border: 1px solid var(--rag-window-border);
    box-shadow:
      var(--rag-shadow),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px) saturate(1.02);
  }

  .chat-window {
    width: 100%;
    height: min(608px, calc(100vh - 48px));
    min-height: 456px;
    display: flex;
    flex-direction: column;
  }

  .window-shell.fullscreen .chat-window {
    height: 100%;
    min-height: 0;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 13px 14px 12px 16px;
    border-bottom: 1px solid var(--rag-divider);
    background: var(--rag-header-surface);
    backdrop-filter: blur(16px) saturate(1.02);
    -webkit-backdrop-filter: blur(16px) saturate(1.02);
  }

  .brand {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 12px;
  }

  .avatar {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    color: var(--rag-primary-contrast);
    background:
      radial-gradient(circle at 32% 22%, rgba(255, 255, 255, 0.28), transparent 27%),
      linear-gradient(145deg, var(--rag-gold), var(--rag-gold-strong));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 24%, transparent),
      0 7px 16px color-mix(in srgb, var(--rag-gold) 12%, transparent);
  }

  .avatar .avatar-fallback {
    font-size: 14px;
  }

  .brand-text {
    flex: 1 1 auto;
    min-width: 0;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .title {
    overflow: hidden;
    color: var(--rag-text);
    font-size: 14.5px;
    font-weight: 760;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-dot {
    flex: 0 0 auto;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #35c878;
    box-shadow: 0 0 0 3px rgba(53, 200, 120, 0.12);
  }

  .subtitle {
    margin-top: 4px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: color-mix(in srgb, var(--rag-muted) 88%, var(--rag-text));
    font-size: 12px;
    line-height: 1.3;
  }

  .header-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .icon-button {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--rag-text) 82%, var(--rag-muted));
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    cursor: pointer;
    transition:
      transform 0.14s ease,
      background 0.14s ease,
      border-color 0.14s ease,
      color 0.14s ease;
  }

  .icon-button:hover {
    transform: translateY(-1px);
    color: var(--rag-text);
    background: var(--rag-control-surface);
    border-color: color-mix(in srgb, var(--rag-window-border) 76%, var(--rag-gold) 12%);
  }

  .icon-button:active {
    transform: translateY(0) scale(0.96);
  }

  .icon-button svg,
  .icon-button .iconify-icon {
    width: 17px;
    height: 17px;
    opacity: 0.9;
  }

  .icon-button:hover svg,
  .icon-button:hover .iconify-icon {
    opacity: 1;
  }

  .messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 18px 20px 14px;
    background: var(--rag-messages-surface);
    scroll-behavior: smooth;
  }

  .messages::-webkit-scrollbar {
    width: 8px;
  }

  .messages::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background:
      linear-gradient(color-mix(in srgb, var(--rag-muted) 32%, transparent), color-mix(in srgb, var(--rag-muted) 32%, transparent))
      content-box;
  }

  .messages::-webkit-scrollbar-track {
    border-radius: 999px;
  }

  .message-row {
    display: flex;
    gap: 9px;
    margin-bottom: 16px;
    min-width: 0;
    animation: message-in 0.18s ease-out both;
  }

  .message-row.user {
    justify-content: flex-end;
  }

  .message-avatar {
    flex: 0 0 auto;
    width: 27px;
    height: 27px;
    margin-top: 1px;
    color: var(--rag-primary-contrast);
    background:
      radial-gradient(circle at 32% 20%, rgba(255, 255, 255, 0.24), transparent 26%),
      linear-gradient(145deg, var(--rag-gold), var(--rag-gold-strong));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 22%, transparent),
      0 5px 14px color-mix(in srgb, var(--rag-gold) 12%, transparent);
  }

  .message-avatar .avatar-fallback {
    font-size: 11px;
  }

  .message-stack {
    flex: 0 1 auto;
    min-width: 0;
    width: fit-content;
    max-width: min(78%, 468px);
  }

  .message-row.user .message-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    max-width: min(66%, 382px);
  }

  .bubble-card {
    position: relative;
    display: inline-block;
    width: fit-content;
    max-width: 100%;
    padding: 10px 13px 11px;
    border-radius: calc(var(--rag-radius-card) + 1px);
    color: var(--rag-text);
    background: var(--rag-assistant-message-bg);
    border: 1px solid var(--rag-assistant-message-border);
    box-shadow: var(--rag-card-shadow);
    line-height: 1.68;
    font-size: 13.5px;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .bubble-card.streaming {
    border-color: color-mix(in srgb, var(--rag-gold) 30%, var(--rag-line));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 8%, transparent),
      var(--rag-card-shadow);
  }

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
    background: color-mix(in srgb, #0f172a 90%, var(--rag-text));
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
    border-radius: 0 var(--rag-radius-card) var(--rag-radius-card) 0;
    background: color-mix(in srgb, var(--rag-secondary-soft) 64%, transparent);
    color: color-mix(in srgb, var(--rag-text) 72%, var(--rag-muted));
  }

  .markdown-body a {
    color: var(--rag-gold-strong);
    font-weight: 750;
    text-decoration: none;
    border-bottom: 1px solid color-mix(in srgb, var(--rag-gold) 32%, transparent);
  }

  .bubble-card.error {
    color: #9f1d1d;
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 247, 247, 0.96);
  }

  .message-row.assistant .bubble-card::before {
    display: none;
  }

  .message-row.user .bubble-card {
    color: var(--rag-primary-contrast);
    background:
      linear-gradient(145deg, var(--rag-user-message-start), var(--rag-user-message-end));
    border-color: color-mix(in srgb, var(--rag-gold) 46%, transparent);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.16) inset,
      0 8px 18px color-mix(in srgb, var(--rag-gold) 16%, transparent);
    text-align: left;
  }

  .message-time {
    margin-top: 7px;
    color: color-mix(in srgb, var(--rag-muted) 82%, transparent);
    font-size: 11.5px;
    line-height: 1;
  }

  .message-row.user .message-time {
    color: var(--rag-muted);
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

  .source-references {
    width: min(100%, 420px);
    margin-top: 8px;
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: 12px;
    background: transparent;
  }

  .source-references[open] .source-summary-icon {
    transform: rotate(180deg);
  }

  .source-summary {
    display: flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    min-height: 27px;
    padding: 0 9px;
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-muted) 78%, var(--rag-text));
    cursor: pointer;
    outline: none;
    list-style: none;
    user-select: none;
    transition:
      background 0.14s ease,
      color 0.14s ease;
  }

  .source-summary:hover {
    color: var(--rag-text);
    background: color-mix(in srgb, var(--rag-secondary) 64%, transparent);
  }

  .source-summary:focus-visible {
    border-radius: 999px;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--rag-gold) 16%, transparent);
  }

  .source-summary::-webkit-details-marker {
    display: none;
  }

  .source-summary-label {
    font-size: 12.5px;
    font-weight: 760;
  }

  .source-count {
    min-width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    border-radius: 999px;
    color: var(--rag-gold-strong);
    background: color-mix(in srgb, var(--rag-gold-soft) 68%, transparent);
    font-size: 10.5px;
    font-weight: 820;
    line-height: 1;
  }

  .source-summary-icon {
    margin-left: 0;
    display: inline-flex;
    color: var(--rag-muted);
    transition:
      transform 0.16s ease,
      color 0.14s ease;
  }

  .source-summary-icon svg,
  .source-summary-icon .iconify-icon {
    width: 17px;
    height: 17px;
  }

  .source-reference-list {
    display: grid;
    gap: 0;
    margin-top: 5px;
    padding: 5px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 62%, transparent);
    border-radius: 12px;
    background: var(--rag-control-surface);
    animation: source-list-in 0.16s ease-out;
  }

  .source-reference-row {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr) auto;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    padding: 5px 7px;
    border: 0;
    border-radius: 9px;
    color: var(--rag-text);
    background: transparent;
    text-decoration: none;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .source-reference-row:hover {
    background: color-mix(in srgb, var(--rag-secondary) 70%, transparent);
  }

  .source-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--rag-gold-strong);
    border-radius: 6px;
    background: color-mix(in srgb, var(--rag-gold-soft) 42%, transparent);
  }

  .source-icon svg,
  .source-icon .iconify-icon {
    width: 13px;
    height: 13px;
  }

  .source-main {
    display: block;
    min-width: 0;
  }

  .source-title {
    overflow: hidden;
    color: var(--rag-text);
    font-size: 12.5px;
    font-weight: 700;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .source-side {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    color: var(--rag-muted);
    white-space: nowrap;
  }

  .source-link-icon {
    display: inline-flex;
    color: var(--rag-gold-strong);
  }

  .source-link-icon svg,
  .source-link-icon .iconify-icon {
    width: 14px;
    height: 14px;
  }

  .composer-wrap {
    padding: 11px 18px 9px;
    border-top: 1px solid var(--rag-divider);
    background: var(--rag-footer-surface);
  }

  .composer {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 7px 7px 7px 12px;
    border-radius: calc(var(--rag-radius-card) + 2px);
    border: 1px solid color-mix(in srgb, var(--rag-line) 82%, var(--rag-gold) 7%);
    background: var(--rag-input-surface-resolved);
    box-shadow: var(--rag-control-shadow);
    min-width: 0;
    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;
  }

  .composer:focus-within {
    border-color: var(--rag-ring);
    background: color-mix(in srgb, var(--rag-input-surface-resolved) 92%, var(--rag-text) 3%);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--rag-gold) 13%, transparent),
      var(--rag-control-shadow);
  }

  .input {
    flex: 1;
    min-width: 0;
    max-height: 120px;
    min-height: 30px;
    padding: 8px 0;
    resize: none;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--rag-text);
    font-size: 13.5px;
    line-height: 1.5;
  }

  .input:focus-visible {
    outline: none;
  }

  .input::placeholder {
    color: color-mix(in srgb, var(--rag-muted) 78%, transparent);
  }

  .send {
    flex: 0 0 auto;
    width: 37px;
    height: 37px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: calc(var(--rag-radius-card) + 1px);
    color: var(--rag-primary-contrast);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 92%, white), var(--rag-gold-strong));
    box-shadow:
      0 10px 22px color-mix(in srgb, var(--rag-gold) 18%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.24);
    cursor: pointer;
    transition:
      transform 0.14s ease,
      filter 0.14s ease,
      opacity 0.14s ease,
      box-shadow 0.14s ease;
  }

  .send:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }

  .send:active:not(:disabled) {
    transform: translateY(0) scale(0.96);
  }

  .send:disabled {
    cursor: not-allowed;
    opacity: 0.44;
    box-shadow: none;
  }

  .send svg,
  .send .iconify-icon {
    width: 19px;
    height: 19px;
  }

  .disclaimer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--rag-muted);
    font-size: 11.5px;
    padding: 0 20px 12px;
    background: var(--rag-footer-surface);
  }

  .disclaimer svg,
  .disclaimer .iconify-icon {
    width: 14px;
    height: 14px;
  }

  @keyframes shell-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.976);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes popover-in {
    from {
      opacity: 0;
      transform: translate(-50%, calc(-100% + 6px)) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%) scale(1);
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

  @media (max-width: 980px) {
    .window-shell {
      right: 16px;
      bottom: 16px;
      width: min(536px, calc(100vw - 32px));
      grid-template-columns: minmax(0, 1fr);
    }

    .window-shell.fullscreen {
      inset: 16px;
      width: auto;
      max-width: none;
      grid-template-columns: minmax(0, 1fr);
    }

    :host([position='left']) .window-shell {
      left: 16px;
      right: auto;
    }

    :host([position='left']) .window-shell.fullscreen {
      left: 16px;
      right: 16px;
    }
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

    .window-shell {
      position: fixed;
      inset: 0;
      display: block;
      transform-origin: center;
    }

    .window-shell.fullscreen {
      inset: 0;
    }

    .chat-window {
      width: 100vw;
      height: 100dvh;
      min-height: 0;
      border-radius: 0;
      border: 0;
    }

    .chat-header {
      padding: 12px 12px 11px;
    }

    .avatar {
      width: 34px;
      height: 34px;
    }

    .title {
      font-size: 14px;
    }

    .subtitle {
      display: none;
    }

    .icon-button {
      width: 30px;
      height: 30px;
      box-shadow: none;
    }

    .messages {
      padding: 18px 13px 10px;
    }

    .message-stack {
      max-width: 84%;
    }

    .message-row {
      margin-bottom: 18px;
    }

    .composer-wrap {
      padding: 0 12px 11px;
    }

    .disclaimer {
      padding: 0 12px 10px;
    }

    .source-reference-row {
      grid-template-columns: 20px minmax(0, 1fr);
    }

    .source-side {
      grid-column: 2;
      justify-content: flex-start;
    }
  }
`;function be(t,e,r={}){return{id:r.id||st(),role:t,content:e,time:r.time||V(),sources:r.sources,streaming:r.streaming,error:r.error}}function Yr(t,e,r){return t.map(i=>i.id===e?r(i):i)}function st(){return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}const q={visible:!1,text:"",x:0,y:0};function Vr(t){const e=window.getSelection();if(!e||e.isCollapsed||e.rangeCount===0)return q;const r=e.toString().replace(/\s+/g," ").trim();if(r.length<2||Xr(e))return q;const s=e.getRangeAt(0).getBoundingClientRect();if(!s||s.width===0&&s.height===0)return q;const n=Math.max(72,Math.min(s.left+s.width/2,window.innerWidth-72)),o=Math.max(42,s.top-12);return{visible:!0,text:r.slice(0,t),x:Math.round(n),y:Math.round(o)}}function Xr(t){return nt(t.anchorNode)||nt(t.focusNode)}function nt(t){return!!(t instanceof Element?t:t?.parentElement)?.closest('input, textarea, select, [contenteditable="true"], summaraid-rag-assistant')}var qr=Object.defineProperty,Kr=Object.getOwnPropertyDescriptor,f=(t,e,r,i)=>{for(var s=i>1?void 0:i?Kr(e,r):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(s=(i?o(e,r,s):o(s))||s);return i&&s&&qr(e,r,s),s};const Jr=1600,Zr=8,Qr="请输入您想从知识库了解的问题...",ot="likcc_summaraidgpt_rag_assistant_position",xe="likcc_summaraidgpt_rag_conversation_id",at="likcc_summaraidgpt_rag_visitor_id",$=16,lt=76,ct=je(lt),T=ct.width,N=ct.height,ei=4;let u=class extends W{constructor(){super(...arguments),this.position="right",this.config=Y,this.configLoaded=!1,this.open=!1,this.fullscreen=!1,this.input="",this.messages=[],this.streaming=!1,this.composingInput=!1,this.expandedSourceMessageIds=[],this.selectionPopup=q,this.floatingPositionReady=!1,this.petSpriteReady=!1,this.draggingBubble=!1,this.petFrameIndex=0,this.petHovering=!1,this.petDragDirection="",this.petErrorUntil=0,this.petSpeechVisible=!1,this.petSpeechIndex=0,this.petSpeechText="",this.avatarLoadFailed=!1,this.visitorId=this.loadOrCreateVisitorId(),this.suppressNextBubbleClick=!1,this.floatingPositionLocked=!1,this.petAnimationTimer=0,this.petSpeechTimer=0,this.petSpeechHideTimer=0,this.welcomeTime=V(),this.handleDocumentMouseUp=()=>{window.setTimeout(()=>this.updateSelectionPopup(),0)},this.handleDocumentKeyUp=()=>{window.setTimeout(()=>this.updateSelectionPopup(),0)},this.handleDocumentMouseDown=t=>{t.composedPath().includes(this)||this.clearSelectionPopup()},this.handleWindowScroll=()=>{this.clearSelectionPopup()},this.handleWindowResize=()=>{this.clampCurrentFloatingPosition()},this.handleBubblePointerMove=t=>{const e=this.bubbleDragState;if(!e||t.pointerId!==e.pointerId)return;const r=t.clientX-e.startX,i=t.clientY-e.startY,s=Math.hypot(r,i);!e.moved&&s<ei||(e.moved=!0,this.draggingBubble=!0,this.petDragDirection=t.clientX>=e.lastX?"right":"left",e.lastX=t.clientX,t.preventDefault(),this.setFloatingPosition(this.clampFloatingPosition({x:e.originX+r,y:e.originY+i},T,N),!1))},this.handleBubblePointerEnd=t=>{const e=this.bubbleDragState;!e||t.pointerId!==e.pointerId||(e.target.hasPointerCapture(t.pointerId)&&e.target.releasePointerCapture(t.pointerId),this.unbindBubbleDragListeners(),this.bubbleDragState=void 0,this.draggingBubble=!1,this.petDragDirection="",e.moved&&this.floatingPosition&&(t.preventDefault(),this.suppressNextBubbleClick=!0,this.floatingPositionLocked=!0,this.saveFloatingPosition(this.floatingPosition),window.setTimeout(()=>{this.suppressNextBubbleClick=!1},0)))}}connectedCallback(){super.connectedCallback(),this.applyTheme(),this.floatingPositionLocked=this.applySavedFloatingPosition(),this.bindSelectionListeners(),window.addEventListener("resize",this.handleWindowResize,{passive:!0}),this.loadConfig(),this.loadStoredConversation()}disconnectedCallback(){super.disconnectedCallback(),this.unbindSelectionListeners(),window.removeEventListener("resize",this.handleWindowResize),this.unbindBubbleDragListeners(),this.stopPetAnimation(),this.stopPetSpeechCycle(),this.abortCurrentRequest()}updated(t){(t.has("open")||t.has("streaming"))&&this.syncPetThinkingSpeech()}openAssistant(t,e=!1){if(this.open=!0,this.petSpeechVisible=!1,this.clearSelectionPopup(),t?.trim()){e?this.submitQuestion(t):(this.input=t,this.updateComplete.then(()=>this.focusInput()));return}this.updateComplete.then(()=>this.focusInput())}render(){return m`
      ${this.renderSelectionPopup()}
      ${this.open?this.renderWindow():this.renderBubble()}
    `}async loadConfig(){const t=await ur();this.config=t,this.configLoaded=!0,this.avatarLoadFailed=!1,this.applyTheme(t),this.floatingPositionLocked||(this.position=t.buttonPosition,this.applyDefaultFloatingPosition(t)),this.floatingPositionReady=!0,await this.preparePetSprite(t)}bindSelectionListeners(){document.addEventListener("mouseup",this.handleDocumentMouseUp,{passive:!0}),document.addEventListener("keyup",this.handleDocumentKeyUp,{passive:!0}),document.addEventListener("mousedown",this.handleDocumentMouseDown),window.addEventListener("scroll",this.handleWindowScroll,{passive:!0})}unbindSelectionListeners(){document.removeEventListener("mouseup",this.handleDocumentMouseUp),document.removeEventListener("keyup",this.handleDocumentKeyUp),document.removeEventListener("mousedown",this.handleDocumentMouseDown),window.removeEventListener("scroll",this.handleWindowScroll)}renderBubble(){if(!this.canRenderFloatingPet)return h;const t=this.getCurrentPetSpeech();return m`
      <span class="bubble-wrapper">
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
          ${t?m`<span class=${this.petSpeechVisible?"pet-speech visible":"pet-speech"}>${t}</span>`:h}
          <span class="pet-sprite" style=${this.petSpriteStyle} aria-hidden="true"></span>
        </button>
      </span>
    `}renderWindow(){return m`
      <div class=${this.windowShellClass} style=${this.windowShellStyle}>
        <section class="chat-window" role="dialog" aria-label=${this.assistantName}>
          ${this.renderHeader()}
          <div class="messages">
            ${this.messages.length?h:this.renderWelcomeMessage()}
            ${this.messages.map(t=>this.renderMessage(t))}
          </div>
          ${this.renderComposer()}
          <div class="disclaimer">${Or()} <span>内容由 AI 生成，仅供参考</span></div>
        </section>
      </div>
    `}renderHeader(){return m`
      <header class="chat-header">
        <div class="brand">
          ${this.renderAssistantAvatar("avatar")}
          <div class="brand-text">
            <div class="title-row">
              <span class="title">${this.assistantName}</span>
            </div>
            <div class="subtitle"><span class="status-dot"></span>基于站点知识库回答</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-button" type="button" title="新会话" aria-label="新会话" @click=${this.newConversation}>
            ${Ur()}
          </button>
          <button
            class="icon-button"
            type="button"
            title=${this.fullscreen?"退出全屏":"全屏"}
            aria-label=${this.fullscreen?"退出全屏":"全屏"}
            @click=${this.toggleFullscreen}
          >
            ${this.fullscreen?Ir():kr()}
          </button>
          <button class="icon-button" type="button" title="关闭" aria-label="关闭" @click=${this.close}>
            ${Mr()}
          </button>
        </div>
      </header>
    `}renderWelcomeMessage(){return m`
      <div class="message-row assistant">
        ${this.renderAssistantAvatar("message-avatar")}
        <div class="message-stack">
          <div class="bubble-card">
            <span class="message-text">${this.welcomeMessage}</span>
          </div>
          <div class="message-time">${this.welcomeTime}</div>
        </div>
      </div>
    `}renderMessage(t){const e=t.sources||[];return m`
      <div class=${`message-row ${t.role}`}>
        ${t.role==="assistant"?this.renderAssistantAvatar("message-avatar"):h}
        <div class="message-stack">
          <div class=${`bubble-card${t.error?" error":""}${t.streaming?" streaming":""}`}>
            ${this.renderMessageContent(t)}
            ${t.streaming?this.renderTyping():h}
          </div>
          ${t.role==="assistant"?Br(e,{open:this.isSourceReferencesOpen(t.id),onToggle:r=>this.toggleSourceReferences(t.id,r)}):h}
          <div class="message-time">${t.time}</div>
        </div>
      </div>
    `}renderTyping(){return m`<span class="typing" aria-label="正在输出"><span></span><span></span><span></span></span>`}renderMessageContent(t){const e=t.content||(t.streaming?"正在思考中...":"");return t.role==="assistant"&&!t.error&&e?m`<div class="message-text markdown-body">${Wt(Fr(e))}</div>`:m`<span class="message-text">${e}</span>`}renderComposer(){return m`
      <div class="composer-wrap">
        <form class="composer" @submit=${this.handleSubmit}>
          <textarea
            class="input"
            rows="1"
            .value=${this.input}
            placeholder=${Qr}
            ?disabled=${this.streaming}
            @input=${this.handleInput}
            @keydown=${this.handleInputKeydown}
            @compositionstart=${this.handleCompositionStart}
            @compositionend=${this.handleCompositionEnd}
          ></textarea>
          <button class="send" type="submit" ?disabled=${this.streaming||!this.input.trim()} aria-label="发送">
            ${Rr()}
          </button>
        </form>
      </div>
    `}renderSelectionPopup(){return this.selectionPopup.visible?m`
      <div
        class="selection-popover"
        style=${`left:${this.selectionPopup.x}px;top:${this.selectionPopup.y}px`}
      >
        <button type="button" @click=${this.askWithSelection}>
          ${Hr()} 问知识库
        </button>
      </div>
    `:h}renderAssistantAvatar(t){const e=this.assistantAvatarUrl;return m`
      <span class=${t}>
        ${e?m`
              <img
                class="avatar-image"
                src=${e}
                alt=""
                decoding="async"
                loading="lazy"
                @error=${this.handleAvatarError}
              />
            `:m`<span class="avatar-fallback">${this.avatarFallbackText}</span>`}
      </span>
    `}handleAvatarError(){this.avatarLoadFailed=!0}handleSubmit(t){t.preventDefault(),this.submitQuestion(this.input)}handleInput(t){const e=t.currentTarget;e instanceof HTMLTextAreaElement&&(this.input=e.value,this.resizeInput(e))}handleCompositionStart(){this.composingInput=!0}handleCompositionEnd(){this.composingInput=!1}handleInputKeydown(t){t.key!=="Enter"||t.shiftKey||this.streaming||t.isComposing||this.composingInput||t.keyCode===229||(t.preventDefault(),this.submitQuestion(this.input))}handleBubblePointerDown(t){if(!t.isPrimary||t.button!==0)return;const e=t.currentTarget;if(!(e instanceof HTMLElement))return;const r=e.getBoundingClientRect(),i=this.currentFloatingPosition(r);this.bubbleDragState={pointerId:t.pointerId,target:e,startX:t.clientX,startY:t.clientY,originX:i.x,originY:i.y,lastX:t.clientX,moved:!1},this.petSpeechVisible=!1,t.preventDefault(),e.setPointerCapture(t.pointerId),e.addEventListener("pointermove",this.handleBubblePointerMove),e.addEventListener("pointerup",this.handleBubblePointerEnd),e.addEventListener("pointercancel",this.handleBubblePointerEnd)}handleBubbleClick(t){if(this.suppressNextBubbleClick){t.preventDefault(),t.stopPropagation();return}this.openAssistant()}unbindBubbleDragListeners(){const t=this.bubbleDragState?.target;t&&(t.removeEventListener("pointermove",this.handleBubblePointerMove),t.removeEventListener("pointerup",this.handleBubblePointerEnd),t.removeEventListener("pointercancel",this.handleBubblePointerEnd))}applySavedFloatingPosition(){const t=this.loadSavedFloatingPosition();return t?(this.setFloatingPosition(this.clampFloatingPosition(t),!1),!0):!1}applyDefaultFloatingPosition(t){this.setFloatingPosition(this.clampFloatingPosition(this.defaultFloatingPosition(t)),!1)}currentFloatingPosition(t){return this.floatingPosition?this.floatingPosition:t&&Number.isFinite(t.left)&&Number.isFinite(t.top)?{x:t.left,y:t.top}:this.defaultFloatingPosition(this.config)}defaultFloatingPosition(t){const e=this.normalizeFloatingOffset(t.horizontalOffset),r=this.normalizeFloatingOffset(t.verticalOffset);return{x:t.buttonPosition==="left"?e:window.innerWidth-T-e,y:window.innerHeight-N-r}}clampCurrentFloatingPosition(){if(!this.floatingPosition)return;const t=this.clampFloatingPosition(this.floatingPosition,T,N);(t.x!==this.floatingPosition.x||t.y!==this.floatingPosition.y)&&this.setFloatingPosition(t,!0)}clampFloatingPosition(t,e=T,r=N){const i=Math.max($,window.innerWidth-e-$),s=Math.max($,window.innerHeight-r-$);return{x:this.clamp(t.x,$,i),y:this.clamp(t.y,$,s)}}setFloatingPosition(t,e){this.floatingPosition=t,this.position=t.x+T/2<window.innerWidth/2?"left":"right",this.style.left=`${Math.round(t.x)}px`,this.style.top=`${Math.round(t.y)}px`,this.style.right="auto",this.style.bottom="auto",e&&this.saveFloatingPosition(t)}applyTheme(t=this.config){rr(this,t.styleConfig)}async preparePetSprite(t){this.stopPetAnimation(),this.stopPetSpeechCycle(),this.petSpriteReady=!1,this.petSpeechVisible=!1,this.petSpeechText="";const e=t.pet?.spritesheetUrl?.trim();if(e)try{if(await this.preloadImage(e),this.petSpriteUrl!==e)return;this.petSpriteReady=!0,this.startPetAnimation(),this.startPetSpeechCycle()}catch{this.petSpriteUrl===e&&(this.petSpriteReady=!1)}}preloadImage(t){return new Promise((e,r)=>{const i=new Image;let s=!1;const n=o=>{s||(s=!0,o())};i.onload=()=>n(()=>e()),i.onerror=()=>n(()=>r(new Error("Pet spritesheet failed to load"))),i.src=t})}startPetAnimation(){this.petAnimationTimer||!this.canRenderFloatingPet||(this.petAnimationTimer=window.setInterval(()=>{this.petFrameIndex=(this.petFrameIndex+1)%We(this.petAnimationState).length},150))}stopPetAnimation(){this.petAnimationTimer&&(window.clearInterval(this.petAnimationTimer),this.petAnimationTimer=0)}startPetSpeechCycle(){this.petSpeechTimer||!this.canRenderFloatingPet||(window.setTimeout(()=>this.showNextPetSpeech(),1600),this.petSpeechTimer=window.setInterval(()=>this.showNextPetSpeech(),15e3))}stopPetSpeechCycle(){this.petSpeechTimer&&(window.clearInterval(this.petSpeechTimer),this.petSpeechTimer=0),this.petSpeechHideTimer&&(window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=0)}showNextPetSpeech(){if(!this.canShowPetSpeech()){this.petSpeechVisible=!1;return}if(this.isPetThinkingOutsideWindow()){this.showPetThinkingSpeech();return}const t=this.petSpeechMessages;this.petSpeechText=t[this.petSpeechIndex%t.length]||"",this.petSpeechVisible=!0,this.petSpeechHideTimer&&window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=window.setTimeout(()=>{this.petSpeechVisible=!1,this.petSpeechHideTimer=0},7200),this.petSpeechIndex=(this.petSpeechIndex+1)%t.length}syncPetThinkingSpeech(){if(!this.canRenderFloatingPet){this.petSpeechVisible=!1,this.petSpeechText="";return}if(this.isPetThinkingOutsideWindow()){this.showPetThinkingSpeech();return}this.petSpeechText===Be&&(this.petSpeechVisible=!1,this.petSpeechText="")}showPetThinkingSpeech(){this.draggingBubble||(this.petSpeechText=Be,this.petSpeechVisible=!0,this.petSpeechHideTimer&&(window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=0))}canShowPetSpeech(){return this.canRenderFloatingPet&&!this.open&&!this.draggingBubble&&(this.isPetThinkingOutsideWindow()||this.petSpeechMessages.length>0)}isPetThinkingOutsideWindow(){return!this.open&&this.streaming}handlePetMouseEnter(){this.petHovering=!0}handlePetMouseLeave(){this.petHovering=!1}triggerPetError(){this.canRenderFloatingPet&&(this.petErrorUntil=Date.now()+3600,this.petFrameIndex=0)}loadSavedFloatingPosition(){try{const t=window.localStorage.getItem(ot);if(!t)return;const e=JSON.parse(t);if(typeof e.x=="number"&&Number.isFinite(e.x)&&typeof e.y=="number"&&Number.isFinite(e.y))return{x:Number(e.x),y:Number(e.y)}}catch{return}}saveFloatingPosition(t){try{window.localStorage.setItem(ot,JSON.stringify(t))}catch{}}async submitQuestion(t){const e=t.trim();if(!e||this.streaming)return;const r=st();this.input="",this.streaming=!0,this.abortController=new AbortController,this.messages=[...this.messages,be("user",e),be("assistant","",{id:r,streaming:!0})],await this.updateComplete,this.resizeInput(this.inputElement),this.scrollToBottom();try{await gr({question:e,limit:Zr,conversationId:this.conversationId,visitorId:this.visitorId},{onConversationId:i=>this.persistConversationId(i),onSources:i=>this.receiveSources(r,i),onDelta:i=>this.appendAssistantDelta(r,i),onError:i=>this.failAssistantMessage(r,i),onDone:()=>this.finishAssistantMessage(r)},this.abortController.signal)}catch(i){if(this.abortController.signal.aborted)return;const s=i instanceof Error?i.message:"RAG 问答失败";this.failAssistantMessage(r,`抱歉，暂时无法回答，请稍后重试。${s?`（${s}）`:""}`)}finally{this.finishAssistantMessage(r),this.streaming=!1,this.abortController=void 0,await this.updateComplete,this.scrollToBottom()}}receiveSources(t,e){this.updateMessage(t,r=>({...r,sources:e}))}async loadStoredConversation(){const t=this.loadConversationId();if(t)try{const e=await fr(t,this.visitorId);if(!e){this.clearConversationId();return}this.conversationId=e.metadata.name,this.messages=this.toAssistantMessages(e),await this.updateComplete,this.scrollToBottom()}catch{this.clearConversationId()}}toAssistantMessages(t){return(t.spec?.messages||[]).filter(e=>e.role==="user"||e.role==="assistant").filter(e=>!!e.content?.trim()).map(e=>be(e.role,e.content||"",{id:e.id,time:this.messageTime(e),sources:e.sources,error:e.error}))}messageTime(t){if(!t.createdAt)return V();const e=new Date(t.createdAt);return Number.isNaN(e.getTime())?V():V(e)}persistConversationId(t){if(t.trim()){this.conversationId=t;try{window.localStorage.setItem(xe,t)}catch{}}}loadConversationId(){try{return window.localStorage.getItem(xe)||void 0}catch{return}}loadOrCreateVisitorId(){try{const t=window.localStorage.getItem(at);if(t)return t;const e=`rag-visitor-${this.randomId()}`;return window.localStorage.setItem(at,e),e}catch{return`rag-visitor-${this.randomId()}`}}randomId(){return window.crypto?.randomUUID?window.crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}clearConversationId(){this.conversationId=void 0;try{window.localStorage.removeItem(xe)}catch{}}appendAssistantDelta(t,e){e&&(this.updateMessage(t,r=>({...r,content:`${r.content}${e}`})),this.updateComplete.then(()=>this.scrollToBottom()))}failAssistantMessage(t,e){this.triggerPetError(),this.updateMessage(t,r=>({...r,content:e,error:!0,streaming:!1})),this.streaming=!1}finishAssistantMessage(t){this.updateMessage(t,e=>({...e,content:e.content||(e.error?e.content:"未找到相关资料，可尝试换个问题。"),streaming:!1}))}updateMessage(t,e){this.messages=Yr(this.messages,t,e)}toggleFullscreen(){this.fullscreen=!this.fullscreen}toggleSourceReferences(t,e){const r=e.currentTarget;if(!(r instanceof HTMLDetailsElement))return;const i=new Set(this.expandedSourceMessageIds);r.open?i.add(t):i.delete(t),this.expandedSourceMessageIds=Array.from(i)}close(){this.open=!1,this.fullscreen=!1,this.clearSelectionPopup()}newConversation(){this.abortCurrentRequest(),this.clearConversationId(),this.messages=[],this.input="",this.streaming=!1,this.updateComplete.then(()=>this.focusInput())}askWithSelection(){const t=this.selectionPopup.text.trim();if(!t)return;const e=`请基于知识库回答，并结合我选中的内容：

${t}`;this.openAssistant(e,!0)}updateSelectionPopup(){this.selectionPopup=Vr(Jr)}clearSelectionPopup(){this.selectionPopup.visible&&(this.selectionPopup=q)}resizeInput(t){t&&(t.style.height="auto",t.style.height=`${Math.min(Math.max(t.scrollHeight,38),118)}px`)}focusInput(){this.inputElement?.focus()}scrollToBottom(){this.messagesElement&&(this.messagesElement.scrollTop=this.messagesElement.scrollHeight)}abortCurrentRequest(){!this.abortController||this.abortController.signal.aborted||this.abortController.abort()}isMobileViewport(){return window.matchMedia?.("(max-width: 960px)").matches??!1}clamp(t,e,r){return Math.min(Math.max(t,e),r)}normalizeFloatingOffset(t){return Number.isFinite(t)?Math.max(0,t):Y.horizontalOffset}isSourceReferencesOpen(t){return this.expandedSourceMessageIds.includes(t)}get windowShellClass(){return["window-shell",this.fullscreen?"fullscreen":""].filter(Boolean).join(" ")}get windowShellStyle(){if(this.fullscreen||this.isMobileViewport()||!this.floatingPosition)return"";const t=window.innerWidth,e=window.innerHeight,r=Math.min(560,t-$*2),i=Math.min(636,e-$*2),s=this.floatingPosition.x+T/2,n=this.floatingPosition.y+N/2,o=s<t/2,c=o?s-T/2:s-r+T/2,a=n-i+N/2;return[`left:${Math.round(this.clamp(c,$,t-r-$))}px`,`top:${Math.round(this.clamp(a,$,e-i-$))}px`,"right:auto","bottom:auto",`transform-origin:${o?"bottom left":"bottom right"}`].join(";")}get assistantName(){return this.config.assistantName||Y.assistantName}get assistantAvatarUrl(){if(!this.avatarLoadFailed)return this.config.assistantAvatar?.trim()||void 0}get avatarFallbackText(){return Array.from(this.assistantName.trim())[0]||"智"}get petMetrics(){return je(lt)}get petButtonStyle(){const t=this.petMetrics;return[`--rag-pet-width:${t.width}px`,`--rag-pet-height:${t.height}px`,`--rag-pet-sheet-width:${t.sheetWidth}px`,`--rag-pet-sheet-height:${t.sheetHeight}px`].join(";")}get petSpriteStyle(){const t=this.petMetrics,e=er(this.petAnimationState,this.petFrameIndex);return[`background-image:url("${this.escapeCssUrl(this.petSpriteUrl)}")`,`--rag-pet-frame-x:${-e.col*t.width}px`,`--rag-pet-frame-y:${-e.row*t.height}px`].join(";")}get petAnimationState(){return{errorActive:this.petErrorUntil>Date.now(),direction:this.petDragDirection,thinking:this.isPetThinkingOutsideWindow(),hovering:this.petHovering}}get petSpeechMessages(){const t=this.config.petSpeechMessages||[];return t.length?t:pe}getCurrentPetSpeech(){return this.petSpeechText}get hasActivePet(){return!!this.config.pet?.spritesheetUrl}get canRenderFloatingPet(){return this.configLoaded&&this.floatingPositionReady&&this.hasActivePet&&this.petSpriteReady}get petSpriteUrl(){return this.config.pet?.spritesheetUrl||""}escapeCssUrl(t){return t.replace(/["\\\n\r\f]/g,"")}get welcomeMessage(){return`您好！我是 ${this.assistantName}
我会基于站点知识库检索并回答，尽量给出可追溯来源
请问有什么想查的？`}};u.styles=Gr,f([Ne({type:String,reflect:!0})],u.prototype,"position",2),f([b()],u.prototype,"config",2),f([b()],u.prototype,"configLoaded",2),f([b()],u.prototype,"open",2),f([b()],u.prototype,"fullscreen",2),f([b()],u.prototype,"input",2),f([b()],u.prototype,"messages",2),f([b()],u.prototype,"streaming",2),f([b()],u.prototype,"expandedSourceMessageIds",2),f([b()],u.prototype,"selectionPopup",2),f([b()],u.prototype,"floatingPosition",2),f([b()],u.prototype,"floatingPositionReady",2),f([b()],u.prototype,"petSpriteReady",2),f([b()],u.prototype,"draggingBubble",2),f([b()],u.prototype,"petFrameIndex",2),f([b()],u.prototype,"petHovering",2),f([b()],u.prototype,"petDragDirection",2),f([b()],u.prototype,"petErrorUntil",2),f([b()],u.prototype,"petSpeechVisible",2),f([b()],u.prototype,"petSpeechIndex",2),f([b()],u.prototype,"petSpeechText",2),f([b()],u.prototype,"avatarLoadFailed",2),f([Oe(".messages")],u.prototype,"messagesElement",2),f([Oe(".input")],u.prototype,"inputElement",2),u=f([Ft("summaraid-rag-assistant")],u);const pt="summaraid-rag-assistant";function ti(){window.likcc_summaraidGPT_ragAssistantLoaded||(console.log("%c智阅GPT-RAG 智能助手","color: #1f1f1f; font-size: 16px; font-weight: bold;"),console.log("%c基于知识库检索增强生成的 Halo 智能助手","color: #8a6f38; font-size: 12px;"),window.likcc_summaraidGPT_ragAssistantLoaded=!0)}async function ve(){if(!document.body)return;const t=document.querySelector(pt);if(t)return t;const e=document.createElement(pt);return document.body.appendChild(e),e}async function ri(t){(await ve())?.openAssistant(t)}function dt(){window.setTimeout(()=>{ve()},0)}ti(),window.likcc_summaraidGPT_initRagAssistant=ve,window.likcc_summaraidGPT_openRagAssistant=ri,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",dt,{once:!0}):dt()}));
