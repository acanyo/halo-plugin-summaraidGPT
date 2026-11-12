(function(pe){typeof define=="function"&&define.amd?define(pe):pe()})((function(){"use strict";const pe=globalThis,$t=pe.ShadowRoot&&(pe.ShadyCSS===void 0||pe.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Pt=Symbol(),Sr=new WeakMap;let Dr=class{constructor(t,r,u){if(this._$cssResult$=!0,u!==Pt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=r}get styleSheet(){let t=this.o;const r=this.t;if($t&&t===void 0){const u=r!==void 0&&r.length===1;u&&(t=Sr.get(r)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),u&&Sr.set(r,t))}return t}toString(){return this.cssText}};const ni=e=>new Dr(typeof e=="string"?e:e+"",void 0,Pt),_e=(e,...t)=>{const r=e.length===1?e[0]:t.reduce((u,n,i)=>u+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1],e[0]);return new Dr(r,e,Pt)},ii=(e,t)=>{if($t)e.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(const r of t){const u=document.createElement("style"),n=pe.litNonce;n!==void 0&&u.setAttribute("nonce",n),u.textContent=r.cssText,e.appendChild(u)}},Tr=$t?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let r="";for(const u of t.cssRules)r+=u.cssText;return ni(r)})(e):e;const{is:ai,defineProperty:si,getOwnPropertyDescriptor:oi,getOwnPropertyNames:ci,getOwnPropertySymbols:li,getPrototypeOf:di}=Object,it=globalThis,$r=it.trustedTypes,pi=$r?$r.emptyScript:"",fi=it.reactiveElementPolyfillSupport,Oe=(e,t)=>e,at={toAttribute(e,t){switch(t){case Boolean:e=e?pi:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch{r=null}}return r}},Ft=(e,t)=>!ai(e,t),Pr={attribute:!0,type:String,converter:at,reflect:!1,useDefault:!1,hasChanged:Ft};Symbol.metadata??=Symbol("metadata"),it.litPropertyMetadata??=new WeakMap;let ve=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,r=Pr){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(t,r),!r.noAccessor){const u=Symbol(),n=this.getPropertyDescriptor(t,u,r);n!==void 0&&si(this.prototype,t,n)}}static getPropertyDescriptor(t,r,u){const{get:n,set:i}=oi(this.prototype,t)??{get(){return this[r]},set(a){this[r]=a}};return{get:n,set(a){const s=n?.call(this);i?.call(this,a),this.requestUpdate(t,s,u)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Pr}static _$Ei(){if(this.hasOwnProperty(Oe("elementProperties")))return;const t=di(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Oe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Oe("properties"))){const r=this.properties,u=[...ci(r),...li(r)];for(const n of u)this.createProperty(n,r[n])}const t=this[Symbol.metadata];if(t!==null){const r=litPropertyMetadata.get(t);if(r!==void 0)for(const[u,n]of r)this.elementProperties.set(u,n)}this._$Eh=new Map;for(const[r,u]of this.elementProperties){const n=this._$Eu(r,u);n!==void 0&&this._$Eh.set(n,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const r=[];if(Array.isArray(t)){const u=new Set(t.flat(1/0).reverse());for(const n of u)r.unshift(Tr(n))}else t!==void 0&&r.push(Tr(t));return r}static _$Eu(t,r){const u=r.attribute;return u===!1?void 0:typeof u=="string"?u:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,r=this.constructor.elementProperties;for(const u of r.keys())this.hasOwnProperty(u)&&(t.set(u,this[u]),delete this[u]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ii(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,r,u){this._$AK(t,u)}_$ET(t,r){const u=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,u);if(n!==void 0&&u.reflect===!0){const i=(u.converter?.toAttribute!==void 0?u.converter:at).toAttribute(r,u.type);this._$Em=t,i==null?this.removeAttribute(n):this.setAttribute(n,i),this._$Em=null}}_$AK(t,r){const u=this.constructor,n=u._$Eh.get(t);if(n!==void 0&&this._$Em!==n){const i=u.getPropertyOptions(n),a=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:at;this._$Em=n;const s=a.fromAttribute(r,i.type);this[n]=s??this._$Ej?.get(n)??s,this._$Em=null}}requestUpdate(t,r,u,n=!1,i){if(t!==void 0){const a=this.constructor;if(n===!1&&(i=this[t]),u??=a.getPropertyOptions(t),!((u.hasChanged??Ft)(i,r)||u.useDefault&&u.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,u))))return;this.C(t,r,u)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,r,{useDefault:u,reflect:n,wrapped:i},a){u&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??r??this[t]),i!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||u||(r=void 0),this._$AL.set(t,r)),n===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[n,i]of this._$Ep)this[n]=i;this._$Ep=void 0}const u=this.constructor.elementProperties;if(u.size>0)for(const[n,i]of u){const{wrapped:a}=i,s=this[n];a!==!0||this._$AL.has(n)||s===void 0||this.C(n,void 0,i,s)}}let t=!1;const r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),this._$EO?.forEach(u=>u.hostUpdate?.()),this.update(r)):this._$EM()}catch(u){throw t=!1,this._$EM(),u}t&&this._$AE(r)}willUpdate(t){}_$AE(t){this._$EO?.forEach(r=>r.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(r=>this._$ET(r,this[r])),this._$EM()}updated(t){}firstUpdated(t){}};ve.elementStyles=[],ve.shadowRootOptions={mode:"open"},ve[Oe("elementProperties")]=new Map,ve[Oe("finalized")]=new Map,fi?.({ReactiveElement:ve}),(it.reactiveElementVersions??=[]).push("2.1.2");const Mt=globalThis,Fr=e=>e,st=Mt.trustedTypes,Mr=st?st.createPolicy("lit-html",{createHTML:e=>e}):void 0,Ir="$lit$",ue=`lit$${Math.random().toFixed(9).slice(2)}$`,Rr="?"+ue,hi=`<${Rr}>`,fe=document,Le=()=>fe.createComment(""),Be=e=>e===null||typeof e!="object"&&typeof e!="function",It=Array.isArray,gi=e=>It(e)||typeof e?.[Symbol.iterator]=="function",Rt=`[ 	
\f\r]`,Ue=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Nr=/-->/g,zr=/>/g,he=RegExp(`>|${Rt}(?:([^\\s"'>=/]+)(${Rt}*=${Rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Or=/'/g,Lr=/"/g,Br=/^(?:script|style|textarea|title)$/i,mi=e=>(t,...r)=>({_$litType$:e,strings:t,values:r}),m=mi(1),ne=Symbol.for("lit-noChange"),x=Symbol.for("lit-nothing"),Ur=new WeakMap,ge=fe.createTreeWalker(fe,129);function qr(e,t){if(!It(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Mr!==void 0?Mr.createHTML(t):t}const bi=(e,t)=>{const r=e.length-1,u=[];let n,i=t===2?"<svg>":t===3?"<math>":"",a=Ue;for(let s=0;s<r;s++){const o=e[s];let c,l,d=-1,h=0;for(;h<o.length&&(a.lastIndex=h,l=a.exec(o),l!==null);)h=a.lastIndex,a===Ue?l[1]==="!--"?a=Nr:l[1]!==void 0?a=zr:l[2]!==void 0?(Br.test(l[2])&&(n=RegExp("</"+l[2],"g")),a=he):l[3]!==void 0&&(a=he):a===he?l[0]===">"?(a=n??Ue,d=-1):l[1]===void 0?d=-2:(d=a.lastIndex-l[2].length,c=l[1],a=l[3]===void 0?he:l[3]==='"'?Lr:Or):a===Lr||a===Or?a=he:a===Nr||a===zr?a=Ue:(a=he,n=void 0);const f=a===he&&e[s+1].startsWith("/>")?" ":"";i+=a===Ue?o+hi:d>=0?(u.push(c),o.slice(0,d)+Ir+o.slice(d)+ue+f):o+ue+(d===-2?s:f)}return[qr(e,i+(e[r]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),u]};class qe{constructor({strings:t,_$litType$:r},u){let n;this.parts=[];let i=0,a=0;const s=t.length-1,o=this.parts,[c,l]=bi(t,r);if(this.el=qe.createElement(c,u),ge.currentNode=this.el.content,r===2||r===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(n=ge.nextNode())!==null&&o.length<s;){if(n.nodeType===1){if(n.hasAttributes())for(const d of n.getAttributeNames())if(d.endsWith(Ir)){const h=l[a++],f=n.getAttribute(d).split(ue),p=/([.?@])?(.*)/.exec(h);o.push({type:1,index:i,name:p[2],strings:f,ctor:p[1]==="."?yi:p[1]==="?"?_i:p[1]==="@"?vi:ot}),n.removeAttribute(d)}else d.startsWith(ue)&&(o.push({type:6,index:i}),n.removeAttribute(d));if(Br.test(n.tagName)){const d=n.textContent.split(ue),h=d.length-1;if(h>0){n.textContent=st?st.emptyScript:"";for(let f=0;f<h;f++)n.append(d[f],Le()),ge.nextNode(),o.push({type:2,index:++i});n.append(d[h],Le())}}}else if(n.nodeType===8)if(n.data===Rr)o.push({type:2,index:i});else{let d=-1;for(;(d=n.data.indexOf(ue,d+1))!==-1;)o.push({type:7,index:i}),d+=ue.length-1}i++}}static createElement(t,r){const u=fe.createElement("template");return u.innerHTML=t,u}}function we(e,t,r=e,u){if(t===ne)return t;let n=u!==void 0?r._$Co?.[u]:r._$Cl;const i=Be(t)?void 0:t._$litDirective$;return n?.constructor!==i&&(n?._$AO?.(!1),i===void 0?n=void 0:(n=new i(e),n._$AT(e,r,u)),u!==void 0?(r._$Co??=[])[u]=n:r._$Cl=n),n!==void 0&&(t=we(e,n._$AS(e,t.values),n,u)),t}class xi{constructor(t,r){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:r},parts:u}=this._$AD,n=(t?.creationScope??fe).importNode(r,!0);ge.currentNode=n;let i=ge.nextNode(),a=0,s=0,o=u[0];for(;o!==void 0;){if(a===o.index){let c;o.type===2?c=new He(i,i.nextSibling,this,t):o.type===1?c=new o.ctor(i,o.name,o.strings,this,t):o.type===6&&(c=new wi(i,this,t)),this._$AV.push(c),o=u[++s]}a!==o?.index&&(i=ge.nextNode(),a++)}return ge.currentNode=fe,n}p(t){let r=0;for(const u of this._$AV)u!==void 0&&(u.strings!==void 0?(u._$AI(t,u,r),r+=u.strings.length-2):u._$AI(t[r])),r++}}class He{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,r,u,n){this.type=2,this._$AH=x,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=u,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const r=this._$AM;return r!==void 0&&t?.nodeType===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=we(this,t,r),Be(t)?t===x||t==null||t===""?(this._$AH!==x&&this._$AR(),this._$AH=x):t!==this._$AH&&t!==ne&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):gi(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==x&&Be(this._$AH)?this._$AA.nextSibling.data=t:this.T(fe.createTextNode(t)),this._$AH=t}$(t){const{values:r,_$litType$:u}=t,n=typeof u=="number"?this._$AC(t):(u.el===void 0&&(u.el=qe.createElement(qr(u.h,u.h[0]),this.options)),u);if(this._$AH?._$AD===n)this._$AH.p(r);else{const i=new xi(n,this),a=i.u(this.options);i.p(r),this.T(a),this._$AH=i}}_$AC(t){let r=Ur.get(t.strings);return r===void 0&&Ur.set(t.strings,r=new qe(t)),r}k(t){It(this._$AH)||(this._$AH=[],this._$AR());const r=this._$AH;let u,n=0;for(const i of t)n===r.length?r.push(u=new He(this.O(Le()),this.O(Le()),this,this.options)):u=r[n],u._$AI(i),n++;n<r.length&&(this._$AR(u&&u._$AB.nextSibling,n),r.length=n)}_$AR(t=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);t!==this._$AB;){const u=Fr(t).nextSibling;Fr(t).remove(),t=u}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class ot{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,r,u,n,i){this.type=1,this._$AH=x,this._$AN=void 0,this.element=t,this.name=r,this._$AM=n,this.options=i,u.length>2||u[0]!==""||u[1]!==""?(this._$AH=Array(u.length-1).fill(new String),this.strings=u):this._$AH=x}_$AI(t,r=this,u,n){const i=this.strings;let a=!1;if(i===void 0)t=we(this,t,r,0),a=!Be(t)||t!==this._$AH&&t!==ne,a&&(this._$AH=t);else{const s=t;let o,c;for(t=i[0],o=0;o<i.length-1;o++)c=we(this,s[u+o],r,o),c===ne&&(c=this._$AH[o]),a||=!Be(c)||c!==this._$AH[o],c===x?t=x:t!==x&&(t+=(c??"")+i[o+1]),this._$AH[o]=c}a&&!n&&this.j(t)}j(t){t===x?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class yi extends ot{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===x?void 0:t}}class _i extends ot{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==x)}}class vi extends ot{constructor(t,r,u,n,i){super(t,r,u,n,i),this.type=5}_$AI(t,r=this){if((t=we(this,t,r,0)??x)===ne)return;const u=this._$AH,n=t===x&&u!==x||t.capture!==u.capture||t.once!==u.once||t.passive!==u.passive,i=t!==x&&(u===x||n);n&&this.element.removeEventListener(this.name,this,u),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}let wi=class{constructor(t,r,u){this.element=t,this.type=6,this._$AN=void 0,this._$AM=r,this.options=u}get _$AU(){return this._$AM._$AU}_$AI(t){we(this,t)}};const Ci=Mt.litHtmlPolyfillSupport;Ci?.(qe,He),(Mt.litHtmlVersions??=[]).push("3.3.2");const Ai=(e,t,r)=>{const u=r?.renderBefore??t;let n=u._$litPart$;if(n===void 0){const i=r?.renderBefore??null;u._$litPart$=n=new He(t.insertBefore(Le(),i),i,void 0,r??{})}return n._$AI(e),n};const Nt=globalThis;let je=class extends ve{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ai(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ne}};je._$litElement$=!0,je.finalized=!0,Nt.litElementHydrateSupport?.({LitElement:je});const ki=Nt.litElementPolyfillSupport;ki?.({LitElement:je}),(Nt.litElementVersions??=[]).push("4.2.2");const Ei=e=>(t,r)=>{r!==void 0?r.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const Si={attribute:!0,type:String,converter:at,reflect:!1,hasChanged:Ft},Di=(e=Si,t,r)=>{const{kind:u,metadata:n}=r;let i=globalThis.litPropertyMetadata.get(n);if(i===void 0&&globalThis.litPropertyMetadata.set(n,i=new Map),u==="setter"&&((e=Object.create(e)).wrapped=!0),i.set(r.name,e),u==="accessor"){const{name:a}=r;return{set(s){const o=t.get.call(this);t.set.call(this,s),this.requestUpdate(a,o,e,!0,s)},init(s){return s!==void 0&&this.C(a,void 0,e,s),s}}}if(u==="setter"){const{name:a}=r;return function(s){const o=this[a];t.call(this,s),this.requestUpdate(a,o,e,!0,s)}}throw Error("Unsupported decorator location: "+u)};function Hr(e){return(t,r)=>typeof r=="object"?Di(e,t,r):((u,n,i)=>{const a=n.hasOwnProperty(i);return n.constructor.createProperty(i,u),a?Object.getOwnPropertyDescriptor(n,i):void 0})(e,t,r)}function P(e){return Hr({...e,state:!0,attribute:!1})}const Ti=(e,t,r)=>(r.configurable=!0,r.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(e,t,r),r);function ct(e,t){return(r,u,n)=>{const i=a=>a.renderRoot?.querySelector(e)??null;return Ti(r,u,{get(){return i(this)}})}}const zt=["有什么站内资料想查？","选中文字后也可以直接问我。","我会优先基于知识库回答。","需要我帮你追溯文章来源吗？"],jr="正在检索知识库，稍等一下。",Ot=76,$i=48,Pi=160,Fi=8,Mi=9,Ii=208/192,Ce=(e,t)=>Array.from({length:t},(r,u)=>({row:e,col:u})),Ri=Ce(0,6),Ni=Ce(3,4),zi=Ce(8,6),Oi=Ce(5,8),Li=Ce(1,8),Bi=Ce(2,8);function Ui(e){const t=e,r=Math.round(e*Ii);return{width:t,height:r,sheetWidth:t*Fi,sheetHeight:r*Mi}}function Wr(e){return e.errorActive?Oi:e.direction==="right"?Li:e.direction==="left"?Bi:e.thinking?zi:e.hovering?Ni:Ri}function qi(e,t){const r=Wr(e);return r[t%r.length]}const Hi=new Set(["navigate","scroll-to","highlight","dispatch-event","registered"]),ji=/^[a-z][a-z0-9_]{2,63}$/;function Lt(e){const t=Y(e)?e:{},r=Y(t.builtIn)?t.builtIn:{},u=Y(t.toolSecurity)?t.toolSecurity:{},n=Y(t.haloSearch)?t.haloSearch:{},i=Y(t.haloResourceDetail)?t.haloResourceDetail:{},a=Y(t.ragSearch)?t.ragSearch:{},s=Vr(n.allowedTypes);return{enabled:me(t.enabled,!0)??!0,builtIn:{pageContext:me(r.pageContext,!0)??!0,haloNavigation:me(r.haloNavigation,!0)??!0,haloContentSearch:me(r.haloContentSearch,!0)??!0,ragContentSearch:me(r.ragContentSearch,!0)??!0,networkAccess:me(r.networkAccess,!1)??!1,commentCapability:Yi(r.commentCapability)},aiTools:Gr(t.aiTools),toolSecurity:{allowedExternalOrigins:[...Vr(u.allowedExternalOrigins),...Ji(u.allowedExternalOrigins,"origin")],allowNewTab:me(u.allowNewTab,!1)??!1},haloSearch:{allowedTypes:s.length?s:["post.content.halo.run","singlepage.content.halo.run"],defaultLimit:Ge(n.defaultLimit)??5},haloResourceDetail:{maxContentChars:Ge(i.maxContentChars)??3e3},ragSearch:{defaultLimit:Ge(a.defaultLimit)??5,maxContentChars:Ge(a.maxContentChars)??3e3}}}function Gr(e){if(typeof e=="string"&&e.trim())try{return Gr(JSON.parse(e))}catch{return[]}return Array.isArray(e)?e.flatMap(t=>{const r=Wi(t);return r?[r]:[]}):[]}function Wi(e){if(!Y(e))return;const t=ee(e.name),r=ee(e.description),u=Gi(e.action);if(!(!t||!ji.test(t)||!r||!u))return{name:t,description:r,inputSchema:Y(e.inputSchema)?e.inputSchema:{type:"object",properties:{}},approval:Vi(e.approval),requiredAuth:Zi(e.requiredAuth),actionType:u.type,action:u,testInput:e.testInput}}function Gi(e){if(!Y(e))return;const t=ee(e.type);if(!(!t||!Hi.has(t))){if(t==="navigate"){const r=ee(e.url);return r?{...We(e),type:t,url:r,target:e.target==="_blank"?"_blank":"_self"}:void 0}if(t==="scroll-to"||t==="highlight"){const r=ee(e.selector);return r?t==="scroll-to"?{...We(e),type:t,selector:r,behavior:e.behavior==="auto"?"auto":"smooth"}:{...We(e),type:t,selector:r,duration:Ge(e.duration)}:void 0}if(t==="dispatch-event"){const r=ee(e.event);return r?{...We(e),type:t,event:r}:void 0}return{...We(e),type:"registered"}}}function We(e){return{pendingMessage:ee(e.pendingMessage),successMessage:ee(e.successMessage),errorMessage:ee(e.errorMessage)}}function Vi(e){return e==="never"||e==="always"?e:"default"}function Zi(e){return e==="authenticated"?"authenticated":"none"}function Yi(e){return e==="off"||e==="submit"?e:"assist"}function Vr(e){return Array.isArray(e)?e.filter(t=>typeof t=="string"&&t.trim().length>0):[]}function Ji(e,t){return Array.isArray(e)?e.flatMap(r=>Y(r)&&typeof r[t]=="string"&&r[t].trim()?[r[t]]:[]):[]}function me(e,t){return typeof e=="boolean"?e:t}function Ge(e){const t=Number(e);return Number.isFinite(t)?t:void 0}function ee(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function Y(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const G={stylePreset:"default",primaryColor:"#a16207",secondaryColor:"#f4f4f5",surfaceColor:"#fafafa",textColor:"#18181b",borderRadius:"soft",colorMode:"light"},Ae={surfaceColor:"#171717",textColor:"#f7f2e8",secondaryColor:"#292524"},Zr={default:{primaryColor:"#a16207",secondaryColor:"#f4f4f5",surfaceColor:"#fafafa",textColor:"#18181b"},graphite:{primaryColor:"#d6b46c",secondaryColor:"#2a2a28",surfaceColor:"#171717",textColor:"#f7f2e8"},ocean:{primaryColor:"#1f7a8c",secondaryColor:"#d9f0f3",surfaceColor:"#fbfeff",textColor:"#142326"},azure:{primaryColor:"#3b82f6",secondaryColor:"#dbeafe",surfaceColor:"#f8fafc",textColor:"#0f172a"},forest:{primaryColor:"#2f7d50",secondaryColor:"#dceedd",surfaceColor:"#fbfdf8",textColor:"#18251b"},rose:{primaryColor:"#b85c7a",secondaryColor:"#f8dfe8",surfaceColor:"#fffafc",textColor:"#2b1720"}},Qi={standard:{panel:"10px",card:"8px",control:"10px"},soft:{panel:"18px",card:"13px",control:"999px"},round:{panel:"26px",card:"18px",control:"999px"}};function Yr(e){const t=ra(e?.stylePreset),r=t==="custom"?Zr.default:Zr[t],u=t==="custom";return{stylePreset:t,primaryColor:lt(u?e?.primaryColor:r.primaryColor,G.primaryColor),secondaryColor:lt(u?e?.secondaryColor:r.secondaryColor,G.secondaryColor),surfaceColor:lt(u?e?.surfaceColor:r.surfaceColor,G.surfaceColor),textColor:lt(u?e?.textColor:r.textColor,G.textColor),borderRadius:ua(e?.borderRadius),colorMode:na(e?.colorMode)}}function Xi(e,t){const r=Ki(Yr(t)),u=Ve(r.primaryColor),n=Ve(r.surfaceColor),i=Ve(r.textColor),a=Ve(r.secondaryColor),s=Qi[r.borderRadius],o=ta(r),c={r:0,g:0,b:0},l={r:255,g:255,b:255};A(e,"--rag-text",r.textColor),A(e,"--rag-muted",H(N(i,n,.42))),A(e,"--rag-line",F(i,.095)),A(e,"--rag-soft-line",F(i,.06)),A(e,"--rag-paper",F(n,.97)),A(e,"--rag-panel",r.surfaceColor),A(e,"--rag-ink",r.textColor),A(e,"--rag-secondary",r.secondaryColor),A(e,"--rag-gold",r.primaryColor),A(e,"--rag-gold-strong",H(N(u,{r:0,g:0,b:0},.18))),A(e,"--rag-gold-soft",F(u,.16)),A(e,"--rag-gold-faint",F(u,.05)),A(e,"--rag-primary-contrast",aa(u)),A(e,"--rag-secondary-soft",F(a,.48)),A(e,"--rag-radius-panel",s.panel),A(e,"--rag-radius-card",s.card),A(e,"--rag-radius-control",s.control),A(e,"--rag-shadow",sa(i,o)),A(e,"--rag-window-surface",H(N(n,o?l:u,o?.055:.018))),A(e,"--rag-window-surface-2",H(N(n,o?c:l,o?.1:.42))),A(e,"--rag-header-surface",F(N(n,o?l:u,o?.075:.035),o?.96:.985)),A(e,"--rag-messages-surface",H(N(n,o?c:l,o?.045:.36))),A(e,"--rag-footer-surface",F(N(n,o?c:l,o?.035:.28),.98)),A(e,"--rag-control-surface",F(N(n,l,o?.07:.68),o?.78:.9)),A(e,"--rag-input-surface-resolved",H(N(n,l,o?.065:.62))),A(e,"--rag-assistant-message-bg",H(N(n,l,o?.075:.82))),A(e,"--rag-assistant-message-border",F(N(o?i:u,n,o?.78:.72),o?.2:.18)),A(e,"--rag-window-border",F(N(i,n,o?.74:.86),o?.18:.13)),A(e,"--rag-divider",F(i,o?.075:.08)),A(e,"--rag-card-shadow",o?"0 8px 18px rgba(0, 0, 0, 0.18)":`0 10px 24px ${F(i,.055)}`),A(e,"--rag-control-shadow",o?"0 8px 18px rgba(0, 0, 0, 0.16)":`0 8px 18px ${F(i,.05)}`),A(e,"--rag-user-message-start",H(N(u,l,o?.08:.16))),A(e,"--rag-user-message-end",H(N(u,c,.18))),A(e,"--rag-ring",F(u,.42)),A(e,"--rag-frost",F(n,.96)),A(e,"--rag-primary-glow",F(u,.16)),A(e,"--rag-code-surface",F(i,.07)),A(e,"--rag-link",H(o?N(u,l,.52):N(u,c,.18))),A(e,"--rag-highlight-surface",H(N(n,u,o?.12:.055))),A(e,"--rag-hover-border",F(u,o?.48:.28)),A(e,"--rag-error-text",o?"#fca5a5":"#9f1d1d"),A(e,"--rag-error-surface",o?"#3b2024":"#fff7f7"),A(e,"--rag-error-border",o?"rgba(248, 113, 113, 0.4)":"rgba(220, 38, 38, 0.24)")}function Ki(e){return ea(e.colorMode)?{...e,surfaceColor:e.stylePreset==="custom"?Bt(e.surfaceColor,G.surfaceColor,Ae.surfaceColor):Ae.surfaceColor,textColor:e.stylePreset==="custom"?Bt(e.textColor,G.textColor,Ae.textColor):Ae.textColor,secondaryColor:e.stylePreset==="custom"?Bt(e.secondaryColor,G.secondaryColor,Ae.secondaryColor):Ae.secondaryColor}:e}function ea(e){return e==="dark"?!0:e==="light"?!1:window.matchMedia?.("(prefers-color-scheme: dark)").matches??!1}function ta(e){return Qr(Ve(e.surfaceColor))<.28}function lt(e,t){const r=e?.trim();return r&&ia(r)?Jr(r).toLowerCase():t}function ra(e){return e==="graphite"||e==="ocean"||e==="azure"||e==="forest"||e==="rose"||e==="custom"?e:G.stylePreset}function ua(e){return e==="standard"||e==="round"?e:G.borderRadius}function na(e){return e==="auto"||e==="light"||e==="dark"?e:G.colorMode}function Bt(e,t,r){return e.toLowerCase()===t.toLowerCase()?r:e}function ia(e){return/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(e)}function Jr(e){return e.length===4?`#${e[1]}${e[1]}${e[2]}${e[2]}${e[3]}${e[3]}`:e}function Ve(e){const t=Jr(e).slice(1);return{r:Number.parseInt(t.slice(0,2),16),g:Number.parseInt(t.slice(2,4),16),b:Number.parseInt(t.slice(4,6),16)}}function N(e,t,r){const u=1-r;return{r:Math.round(e.r*u+t.r*r),g:Math.round(e.g*u+t.g*r),b:Math.round(e.b*u+t.b*r)}}function F(e,t){return`rgba(${e.r}, ${e.g}, ${e.b}, ${t})`}function H(e){return`#${Ut(e.r)}${Ut(e.g)}${Ut(e.b)}`}function Ut(e){return Math.min(Math.max(e,0),255).toString(16).padStart(2,"0")}function aa(e){return Qr(e)>.55?"#171717":"#ffffff"}function Qr(e){const t=[e.r,e.g,e.b].map(r=>{const u=r/255;return u<=.03928?u/12.92:((u+.055)/1.055)**2.4});return .2126*t[0]+.7152*t[1]+.0722*t[2]}function sa(e,t){return t?`0 20px 56px ${F(e,.1)}, 0 6px 18px rgba(0, 0, 0, 0.34)`:`0 20px 56px ${F(e,.12)}, 0 6px 18px ${F(e,.07)}`}function A(e,t,r){e.style.setProperty(t,r)}const Ze="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",qt=24,oa=800,ca=260,la=80,Ht="智阅助手",Xr="/plugins/summaraidGPT/assets/static/icon.svg",Kr=`你好，我是 {assistantName}。
我可以帮你检索站内知识库、总结当前页，也可以带你打开相关页面。`,eu=["关于博主是谁？","最近更新了什么？","帮我总结当前页","有哪些值得先读的内容？"],tu={enabled:!0,displayName:"鸡哥ikun",petJsonUrl:"/plugins/summaraidGPT/assets/static/pets/default-ikun/pet.json",spritesheetUrl:"/plugins/summaraidGPT/assets/static/pets/default-ikun/spritesheet.webp"},ke={assistantAvatar:Xr,assistantName:Ht,displayMode:"ragAgent",ragEnabled:!0,welcomeMessage:Kr.replace("{assistantName}",Ht),quickQuestions:eu,styleConfig:G,buttonPosition:"right",horizontalOffset:qt,verticalOffset:qt,petSize:Ot,petSpeechMessages:zt,pet:tu,access:{mode:"anonymous_chat_agent",allowAnonymous:!0,agentAllowed:!0,authenticated:!1},agent:Lt(void 0)};async function da(){try{const e=await fetch(`${Ze}/dialogConfig`,{headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();return ha(t)}catch{return{...ke}}}async function pa(e,t,r){const u=await fetch(`${Ze}/ragAskStream`,{method:"POST",credentials:"same-origin",signal:r,headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(e)});if(!u.ok||!u.body)throw new Error(`HTTP ${u.status}`);const n=u.body.getReader(),i=new TextDecoder;let a="";const s=o=>{const c=Ca(o);if(!c)return;const l=JSON.parse(c);l.type==="conversation"?l.conversationId&&t.onConversationId?.(l.conversationId):l.type==="sources"?t.onSources?.(l.sources||[]):l.type==="delta"?t.onDelta?.(l.delta||""):l.type==="done"?t.onDone?.():l.type==="error"&&t.onError?.(l.error||"RAG 问答失败")};for(;;){const{done:o,value:c}=await n.read();if(o){a+=i.decode();break}a+=i.decode(c,{stream:!0});const l=a.split(/\r?\n\r?\n/);a=l.pop()||"",l.forEach(s)}a.trim()&&s(a)}async function fa(e,t){if(!e.trim()||!t.trim())return;const r=new URLSearchParams({visitorId:t}),u=await fetch(`${Ze}/ragConversations/${encodeURIComponent(e)}?${r}`,{credentials:"same-origin",headers:{Accept:"application/json"}});if(!(u.status===404||u.status===403)){if(!u.ok)throw new Error(`HTTP ${u.status}`);return await u.json()}}function ha(e){const t=String(e.buttonPosition).trim()==="left"?"left":"right";return{...ke,...e,buttonPosition:t,assistantAvatar:_a(e.assistantAvatar),assistantName:nu(e.assistantName),displayMode:wa(e.displayMode),ragEnabled:e.ragEnabled!==!1,welcomeMessage:xa(e.welcomeMessage,e.assistantName),quickQuestions:ru(e.quickQuestions,8,la)||eu,styleConfig:Yr(e.styleConfig),horizontalOffset:uu(e.horizontalOffset),verticalOffset:uu(e.verticalOffset),petSize:va(e.petSize),petSpeechMessages:ru(e.petSpeechMessages,12)||zt,pet:ba(e.pet)||tu,access:ga(e.access),agent:Lt(e.agent)}}function ga(e){const t=ma(e?.mode);return{mode:t,allowAnonymous:t==="anonymous_chat"||t==="anonymous_chat_agent",agentAllowed:t==="anonymous_chat_agent"||t==="authenticated_chat_agent",authenticated:e?.authenticated===!0}}function ma(e){return e==="anonymous_chat"||e==="anonymous_chat_agent"||e==="authenticated_chat"||e==="authenticated_chat_agent"?e:"anonymous_chat_agent"}function ba(e){if(!e||e.enabled===!1)return;const t=e.spritesheetUrl?.trim();if(t)return{enabled:!0,displayName:e.displayName?.trim()||void 0,petJsonUrl:e.petJsonUrl?.trim()||void 0,spritesheetUrl:t}}function ru(e,t=12,r=120){if(!Array.isArray(e))return;const u=e.map(n=>`${n||""}`.trim()).filter(Boolean).map(n=>n.slice(0,r)).slice(0,t);return u.length?u:void 0}function xa(e,t){return(ya(e,ca)||Kr).replace("{assistantName}",nu(t))}function ya(e,t){const r=e?.trim();if(r)return r.length>t?r.slice(0,t):r}function _a(e){const t=e?.trim();return!t||t.toLowerCase().startsWith("javascript:")?Xr:t}function uu(e){const t=Number(e);return Number.isFinite(t)?Math.round(Math.min(Math.max(t,0),oa)):qt}function va(e){const t=Number(e);return Number.isFinite(t)?Math.round(Math.min(Math.max(t,$i),Pi)):Ot}function nu(e){return e?.trim()||Ht}function wa(e){return e==="assistant"||e==="ragAgent"?"ragAgent":e==="rag"||e==="agent"||e==="petOnly"?e:"ragAgent"}function Ca(e){const t=e.split(/\r?\n/).filter(r=>r.startsWith("data:")).map(r=>r.replace(/^data:\s?/,""));return t.length?t.join(`
`):void 0}const iu="请输入您想从知识库了解的问题...",Aa=8,au={};function ka(e){let t=au[e];if(t)return t;t=au[e]=[];for(let r=0;r<128;r++){const u=String.fromCharCode(r);t.push(u)}for(let r=0;r<e.length;r++){const u=e.charCodeAt(r);t[u]="%"+("0"+u.toString(16).toUpperCase()).slice(-2)}return t}function Ee(e,t){typeof t!="string"&&(t=Ee.defaultChars);const r=ka(t);return e.replace(/(%[a-f0-9]{2})+/gi,function(u){let n="";for(let i=0,a=u.length;i<a;i+=3){const s=parseInt(u.slice(i+1,i+3),16);if(s<128){n+=r[s];continue}if((s&224)===192&&i+3<a){const o=parseInt(u.slice(i+4,i+6),16);if((o&192)===128){const c=s<<6&1984|o&63;c<128?n+="��":n+=String.fromCharCode(c),i+=3;continue}}if((s&240)===224&&i+6<a){const o=parseInt(u.slice(i+4,i+6),16),c=parseInt(u.slice(i+7,i+9),16);if((o&192)===128&&(c&192)===128){const l=s<<12&61440|o<<6&4032|c&63;l<2048||l>=55296&&l<=57343?n+="���":n+=String.fromCharCode(l),i+=6;continue}}if((s&248)===240&&i+9<a){const o=parseInt(u.slice(i+4,i+6),16),c=parseInt(u.slice(i+7,i+9),16),l=parseInt(u.slice(i+10,i+12),16);if((o&192)===128&&(c&192)===128&&(l&192)===128){let d=s<<18&1835008|o<<12&258048|c<<6&4032|l&63;d<65536||d>1114111?n+="����":(d-=65536,n+=String.fromCharCode(55296+(d>>10),56320+(d&1023))),i+=9;continue}}n+="�"}return n})}Ee.defaultChars=";/?:@&=+$,#",Ee.componentChars="";const su={};function Ea(e){let t=su[e];if(t)return t;t=su[e]=[];for(let r=0;r<128;r++){const u=String.fromCharCode(r);/^[0-9a-z]$/i.test(u)?t.push(u):t.push("%"+("0"+r.toString(16).toUpperCase()).slice(-2))}for(let r=0;r<e.length;r++)t[e.charCodeAt(r)]=e[r];return t}function Ye(e,t,r){typeof t!="string"&&(r=t,t=Ye.defaultChars),typeof r>"u"&&(r=!0);const u=Ea(t);let n="";for(let i=0,a=e.length;i<a;i++){const s=e.charCodeAt(i);if(r&&s===37&&i+2<a&&/^[0-9a-f]{2}$/i.test(e.slice(i+1,i+3))){n+=e.slice(i,i+3),i+=2;continue}if(s<128){n+=u[s];continue}if(s>=55296&&s<=57343){if(s>=55296&&s<=56319&&i+1<a){const o=e.charCodeAt(i+1);if(o>=56320&&o<=57343){n+=encodeURIComponent(e[i]+e[i+1]),i++;continue}}n+="%EF%BF%BD";continue}n+=encodeURIComponent(e[i])}return n}Ye.defaultChars=";/?:@&=+$,-_.!~*'()#",Ye.componentChars="-_.!~*'()";function jt(e){let t="";return t+=e.protocol||"",t+=e.slashes?"//":"",t+=e.auth?e.auth+"@":"",e.hostname&&e.hostname.indexOf(":")!==-1?t+="["+e.hostname+"]":t+=e.hostname||"",t+=e.port?":"+e.port:"",t+=e.pathname||"",t+=e.search||"",t+=e.hash||"",t}function dt(){this.protocol=null,this.slashes=null,this.auth=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.pathname=null}const Sa=/^([a-z0-9.+-]+:)/i,Da=/:[0-9]*$/,Ta=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,$a=["<",">",'"',"`"," ","\r",`
`,"	"],Pa=["{","}","|","\\","^","`"].concat($a),Fa=["'"].concat(Pa),ou=["%","/","?",";","#"].concat(Fa),cu=["/","?","#"],Ma=255,lu=/^[+a-z0-9A-Z_-]{0,63}$/,Ia=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,du={javascript:!0,"javascript:":!0},pu={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0};function Wt(e,t){if(e&&e instanceof dt)return e;const r=new dt;return r.parse(e,t),r}dt.prototype.parse=function(e,t){let r,u,n,i=e;if(i=i.trim(),!t&&e.split("#").length===1){const c=Ta.exec(i);if(c)return this.pathname=c[1],c[2]&&(this.search=c[2]),this}let a=Sa.exec(i);if(a&&(a=a[0],r=a.toLowerCase(),this.protocol=a,i=i.substr(a.length)),(t||a||i.match(/^\/\/[^@\/]+@[^@\/]+/))&&(n=i.substr(0,2)==="//",n&&!(a&&du[a])&&(i=i.substr(2),this.slashes=!0)),!du[a]&&(n||a&&!pu[a])){let c=-1;for(let p=0;p<cu.length;p++)u=i.indexOf(cu[p]),u!==-1&&(c===-1||u<c)&&(c=u);let l,d;c===-1?d=i.lastIndexOf("@"):d=i.lastIndexOf("@",c),d!==-1&&(l=i.slice(0,d),i=i.slice(d+1),this.auth=l),c=-1;for(let p=0;p<ou.length;p++)u=i.indexOf(ou[p]),u!==-1&&(c===-1||u<c)&&(c=u);c===-1&&(c=i.length),i[c-1]===":"&&c--;const h=i.slice(0,c);i=i.slice(c),this.parseHost(h),this.hostname=this.hostname||"";const f=this.hostname[0]==="["&&this.hostname[this.hostname.length-1]==="]";if(!f){const p=this.hostname.split(/\./);for(let k=0,y=p.length;k<y;k++){const D=p[k];if(D&&!D.match(lu)){let b="";for(let _=0,v=D.length;_<v;_++)D.charCodeAt(_)>127?b+="x":b+=D[_];if(!b.match(lu)){const _=p.slice(0,k),v=p.slice(k+1),w=D.match(Ia);w&&(_.push(w[1]),v.unshift(w[2])),v.length&&(i=v.join(".")+i),this.hostname=_.join(".");break}}}}this.hostname.length>Ma&&(this.hostname=""),f&&(this.hostname=this.hostname.substr(1,this.hostname.length-2))}const s=i.indexOf("#");s!==-1&&(this.hash=i.substr(s),i=i.slice(0,s));const o=i.indexOf("?");return o!==-1&&(this.search=i.substr(o),i=i.slice(0,o)),i&&(this.pathname=i),pu[r]&&this.hostname&&!this.pathname&&(this.pathname=""),this},dt.prototype.parseHost=function(e){let t=Da.exec(e);t&&(t=t[0],t!==":"&&(this.port=t.substr(1)),e=e.substr(0,e.length-t.length)),e&&(this.hostname=e)};const Ra=Object.freeze(Object.defineProperty({__proto__:null,decode:Ee,encode:Ye,format:jt,parse:Wt},Symbol.toStringTag,{value:"Module"})),fu=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,hu=/[\0-\x1F\x7F-\x9F]/,Na=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/,Gt=/[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/,gu=/[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/,mu=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/,za=Object.freeze(Object.defineProperty({__proto__:null,Any:fu,Cc:hu,Cf:Na,P:Gt,S:gu,Z:mu},Symbol.toStringTag,{value:"Module"})),Oa=new Uint16Array('ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map(e=>e.charCodeAt(0))),La=new Uint16Array("Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map(e=>e.charCodeAt(0)));var Vt;const Ba=new Map([[0,65533],[128,8364],[130,8218],[131,402],[132,8222],[133,8230],[134,8224],[135,8225],[136,710],[137,8240],[138,352],[139,8249],[140,338],[142,381],[145,8216],[146,8217],[147,8220],[148,8221],[149,8226],[150,8211],[151,8212],[152,732],[153,8482],[154,353],[155,8250],[156,339],[158,382],[159,376]]),Ua=(Vt=String.fromCodePoint)!==null&&Vt!==void 0?Vt:function(e){let t="";return e>65535&&(e-=65536,t+=String.fromCharCode(e>>>10&1023|55296),e=56320|e&1023),t+=String.fromCharCode(e),t};function qa(e){var t;return e>=55296&&e<=57343||e>1114111?65533:(t=Ba.get(e))!==null&&t!==void 0?t:e}var I;(function(e){e[e.NUM=35]="NUM",e[e.SEMI=59]="SEMI",e[e.EQUALS=61]="EQUALS",e[e.ZERO=48]="ZERO",e[e.NINE=57]="NINE",e[e.LOWER_A=97]="LOWER_A",e[e.LOWER_F=102]="LOWER_F",e[e.LOWER_X=120]="LOWER_X",e[e.LOWER_Z=122]="LOWER_Z",e[e.UPPER_A=65]="UPPER_A",e[e.UPPER_F=70]="UPPER_F",e[e.UPPER_Z=90]="UPPER_Z"})(I||(I={}));const Ha=32;var ie;(function(e){e[e.VALUE_LENGTH=49152]="VALUE_LENGTH",e[e.BRANCH_LENGTH=16256]="BRANCH_LENGTH",e[e.JUMP_TABLE=127]="JUMP_TABLE"})(ie||(ie={}));function Zt(e){return e>=I.ZERO&&e<=I.NINE}function ja(e){return e>=I.UPPER_A&&e<=I.UPPER_F||e>=I.LOWER_A&&e<=I.LOWER_F}function Wa(e){return e>=I.UPPER_A&&e<=I.UPPER_Z||e>=I.LOWER_A&&e<=I.LOWER_Z||Zt(e)}function Ga(e){return e===I.EQUALS||Wa(e)}var R;(function(e){e[e.EntityStart=0]="EntityStart",e[e.NumericStart=1]="NumericStart",e[e.NumericDecimal=2]="NumericDecimal",e[e.NumericHex=3]="NumericHex",e[e.NamedEntity=4]="NamedEntity"})(R||(R={}));var te;(function(e){e[e.Legacy=0]="Legacy",e[e.Strict=1]="Strict",e[e.Attribute=2]="Attribute"})(te||(te={}));class Va{constructor(t,r,u){this.decodeTree=t,this.emitCodePoint=r,this.errors=u,this.state=R.EntityStart,this.consumed=1,this.result=0,this.treeIndex=0,this.excess=1,this.decodeMode=te.Strict}startEntity(t){this.decodeMode=t,this.state=R.EntityStart,this.result=0,this.treeIndex=0,this.excess=1,this.consumed=1}write(t,r){switch(this.state){case R.EntityStart:return t.charCodeAt(r)===I.NUM?(this.state=R.NumericStart,this.consumed+=1,this.stateNumericStart(t,r+1)):(this.state=R.NamedEntity,this.stateNamedEntity(t,r));case R.NumericStart:return this.stateNumericStart(t,r);case R.NumericDecimal:return this.stateNumericDecimal(t,r);case R.NumericHex:return this.stateNumericHex(t,r);case R.NamedEntity:return this.stateNamedEntity(t,r)}}stateNumericStart(t,r){return r>=t.length?-1:(t.charCodeAt(r)|Ha)===I.LOWER_X?(this.state=R.NumericHex,this.consumed+=1,this.stateNumericHex(t,r+1)):(this.state=R.NumericDecimal,this.stateNumericDecimal(t,r))}addToNumericResult(t,r,u,n){if(r!==u){const i=u-r;this.result=this.result*Math.pow(n,i)+parseInt(t.substr(r,i),n),this.consumed+=i}}stateNumericHex(t,r){const u=r;for(;r<t.length;){const n=t.charCodeAt(r);if(Zt(n)||ja(n))r+=1;else return this.addToNumericResult(t,u,r,16),this.emitNumericEntity(n,3)}return this.addToNumericResult(t,u,r,16),-1}stateNumericDecimal(t,r){const u=r;for(;r<t.length;){const n=t.charCodeAt(r);if(Zt(n))r+=1;else return this.addToNumericResult(t,u,r,10),this.emitNumericEntity(n,2)}return this.addToNumericResult(t,u,r,10),-1}emitNumericEntity(t,r){var u;if(this.consumed<=r)return(u=this.errors)===null||u===void 0||u.absenceOfDigitsInNumericCharacterReference(this.consumed),0;if(t===I.SEMI)this.consumed+=1;else if(this.decodeMode===te.Strict)return 0;return this.emitCodePoint(qa(this.result),this.consumed),this.errors&&(t!==I.SEMI&&this.errors.missingSemicolonAfterCharacterReference(),this.errors.validateNumericCharacterReference(this.result)),this.consumed}stateNamedEntity(t,r){const{decodeTree:u}=this;let n=u[this.treeIndex],i=(n&ie.VALUE_LENGTH)>>14;for(;r<t.length;r++,this.excess++){const a=t.charCodeAt(r);if(this.treeIndex=Za(u,n,this.treeIndex+Math.max(1,i),a),this.treeIndex<0)return this.result===0||this.decodeMode===te.Attribute&&(i===0||Ga(a))?0:this.emitNotTerminatedNamedEntity();if(n=u[this.treeIndex],i=(n&ie.VALUE_LENGTH)>>14,i!==0){if(a===I.SEMI)return this.emitNamedEntityData(this.treeIndex,i,this.consumed+this.excess);this.decodeMode!==te.Strict&&(this.result=this.treeIndex,this.consumed+=this.excess,this.excess=0)}}return-1}emitNotTerminatedNamedEntity(){var t;const{result:r,decodeTree:u}=this,n=(u[r]&ie.VALUE_LENGTH)>>14;return this.emitNamedEntityData(r,n,this.consumed),(t=this.errors)===null||t===void 0||t.missingSemicolonAfterCharacterReference(),this.consumed}emitNamedEntityData(t,r,u){const{decodeTree:n}=this;return this.emitCodePoint(r===1?n[t]&~ie.VALUE_LENGTH:n[t+1],u),r===3&&this.emitCodePoint(n[t+2],u),u}end(){var t;switch(this.state){case R.NamedEntity:return this.result!==0&&(this.decodeMode!==te.Attribute||this.result===this.treeIndex)?this.emitNotTerminatedNamedEntity():0;case R.NumericDecimal:return this.emitNumericEntity(0,2);case R.NumericHex:return this.emitNumericEntity(0,3);case R.NumericStart:return(t=this.errors)===null||t===void 0||t.absenceOfDigitsInNumericCharacterReference(this.consumed),0;case R.EntityStart:return 0}}}function bu(e){let t="";const r=new Va(e,u=>t+=Ua(u));return function(n,i){let a=0,s=0;for(;(s=n.indexOf("&",s))>=0;){t+=n.slice(a,s),r.startEntity(i);const c=r.write(n,s+1);if(c<0){a=s+r.end();break}a=s+c,s=c===0?a+1:a}const o=t+n.slice(a);return t="",o}}function Za(e,t,r,u){const n=(t&ie.BRANCH_LENGTH)>>7,i=t&ie.JUMP_TABLE;if(n===0)return i!==0&&u===i?r:-1;if(i){const o=u-i;return o<0||o>=n?-1:e[r+o]-1}let a=r,s=a+n-1;for(;a<=s;){const o=a+s>>>1,c=e[o];if(c<u)a=o+1;else if(c>u)s=o-1;else return e[o+n]}return-1}const xu=bu(Oa);bu(La);function Ya(e,t=te.Legacy){return xu(e,t)}function Ja(e){return xu(e,te.Strict)}function Qa(e){return Object.prototype.toString.call(e)}function Yt(e){return Qa(e)==="[object String]"}const Xa=Object.prototype.hasOwnProperty;function Ka(e,t){return Xa.call(e,t)}function pt(e){return Array.prototype.slice.call(arguments,1).forEach(function(r){if(r){if(typeof r!="object")throw new TypeError(r+"must be object");Object.keys(r).forEach(function(u){e[u]=r[u]})}}),e}function yu(e,t,r){return[].concat(e.slice(0,t),r,e.slice(t+1))}function Jt(e){return!(e>=55296&&e<=57343||e>=64976&&e<=65007||(e&65535)===65535||(e&65535)===65534||e>=0&&e<=8||e===11||e>=14&&e<=31||e>=127&&e<=159||e>1114111)}function Je(e){if(e>65535){e-=65536;const t=55296+(e>>10),r=56320+(e&1023);return String.fromCharCode(t,r)}return String.fromCharCode(e)}const _u=/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,es=/&([a-z#][a-z0-9]{1,31});/gi,ts=new RegExp(_u.source+"|"+es.source,"gi"),rs=/^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;function us(e,t){if(t.charCodeAt(0)===35&&rs.test(t)){const u=t[1].toLowerCase()==="x"?parseInt(t.slice(2),16):parseInt(t.slice(1),10);return Jt(u)?Je(u):e}const r=Ya(e);return r!==e?r:e}function ns(e){return e.indexOf("\\")<0?e:e.replace(_u,"$1")}function Se(e){return e.indexOf("\\")<0&&e.indexOf("&")<0?e:e.replace(ts,function(t,r,u){return r||us(t,u)})}const is=/[&<>"]/,as=/[&<>"]/g,ss={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"};function os(e){return ss[e]}function ae(e){return is.test(e)?e.replace(as,os):e}const cs=/[.?*+^$[\]\\(){}|-]/g;function ls(e){return e.replace(cs,"\\$&")}function T(e){switch(e){case 9:case 32:return!0}return!1}function Qe(e){if(e>=8192&&e<=8202)return!0;switch(e){case 9:case 10:case 11:case 12:case 13:case 32:case 160:case 5760:case 8239:case 8287:case 12288:return!0}return!1}function vu(e){return Gt.test(e)||gu.test(e)}function Xe(e){return vu(Je(e))}function Ke(e){switch(e){case 33:case 34:case 35:case 36:case 37:case 38:case 39:case 40:case 41:case 42:case 43:case 44:case 45:case 46:case 47:case 58:case 59:case 60:case 61:case 62:case 63:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 124:case 125:case 126:return!0;default:return!1}}function ft(e){return e=e.trim().replace(/\s+/g," "),"ẞ".toLowerCase()==="Ṿ"&&(e=e.replace(/ẞ/g,"ß")),e.toLowerCase().toUpperCase()}function wu(e){return e===32||e===9||e===10||e===13}function ht(e){let t=0;for(;t<e.length&&wu(e.charCodeAt(t));t++);let r=e.length-1;for(;r>=t&&wu(e.charCodeAt(r));r--);return e.slice(t,r+1)}const ds=Object.freeze(Object.defineProperty({__proto__:null,arrayReplaceAt:yu,asciiTrim:ht,assign:pt,escapeHtml:ae,escapeRE:ls,fromCodePoint:Je,has:Ka,isMdAsciiPunct:Ke,isPunctChar:vu,isPunctCharCode:Xe,isSpace:T,isString:Yt,isValidEntityCode:Jt,isWhiteSpace:Qe,lib:{mdurl:Ra,ucmicro:za},normalizeReference:ft,unescapeAll:Se,unescapeMd:ns},Symbol.toStringTag,{value:"Module"}));function ps(e,t,r){let u,n,i,a;const s=e.posMax,o=e.pos;for(e.pos=t+1,u=1;e.pos<s;){if(i=e.src.charCodeAt(e.pos),i===93&&(u--,u===0)){n=!0;break}if(a=e.pos,e.md.inline.skipToken(e),i===91){if(a===e.pos-1)u++;else if(r)return e.pos=o,-1}}let c=-1;return n&&(c=e.pos),e.pos=o,c}function fs(e,t,r){let u,n=t;const i={ok:!1,pos:0,str:""};if(e.charCodeAt(n)===60){for(n++;n<r;){if(u=e.charCodeAt(n),u===10||u===60)return i;if(u===62)return i.pos=n+1,i.str=Se(e.slice(t+1,n)),i.ok=!0,i;if(u===92&&n+1<r){n+=2;continue}n++}return i}let a=0;for(;n<r&&(u=e.charCodeAt(n),!(u===32||u<32||u===127));){if(u===92&&n+1<r){if(e.charCodeAt(n+1)===32)break;n+=2;continue}if(u===40&&(a++,a>32))return i;if(u===41){if(a===0)break;a--}n++}return t===n||a!==0||(i.str=Se(e.slice(t,n)),i.pos=n,i.ok=!0),i}function hs(e,t,r,u){let n,i=t;const a={ok:!1,can_continue:!1,pos:0,str:"",marker:0};if(u)a.str=u.str,a.marker=u.marker;else{if(i>=r)return a;let s=e.charCodeAt(i);if(s!==34&&s!==39&&s!==40)return a;t++,i++,s===40&&(s=41),a.marker=s}for(;i<r;){if(n=e.charCodeAt(i),n===a.marker)return a.pos=i+1,a.str+=Se(e.slice(t,i)),a.ok=!0,a;if(n===40&&a.marker===41)return a;n===92&&i+1<r&&i++,i++}return a.can_continue=!0,a.str+=Se(e.slice(t,i)),a}const gs=Object.freeze(Object.defineProperty({__proto__:null,parseLinkDestination:fs,parseLinkLabel:ps,parseLinkTitle:hs},Symbol.toStringTag,{value:"Module"})),J={};J.code_inline=function(e,t,r,u,n){const i=e[t];return"<code"+n.renderAttrs(i)+">"+ae(i.content)+"</code>"},J.code_block=function(e,t,r,u,n){const i=e[t];return"<pre"+n.renderAttrs(i)+"><code>"+ae(e[t].content)+`</code></pre>
`},J.fence=function(e,t,r,u,n){const i=e[t],a=i.info?Se(i.info).trim():"";let s="",o="";if(a){const l=a.split(/(\s+)/g);s=l[0],o=l.slice(2).join("")}let c;if(r.highlight?c=r.highlight(i.content,s,o)||ae(i.content):c=ae(i.content),c.indexOf("<pre")===0)return c+`
`;if(a){const l=i.attrIndex("class"),d=i.attrs?i.attrs.slice():[];l<0?d.push(["class",r.langPrefix+s]):(d[l]=d[l].slice(),d[l][1]+=" "+r.langPrefix+s);const h={attrs:d};return`<pre><code${n.renderAttrs(h)}>${c}</code></pre>
`}return`<pre><code${n.renderAttrs(i)}>${c}</code></pre>
`},J.image=function(e,t,r,u,n){const i=e[t];return i.attrs[i.attrIndex("alt")][1]=n.renderInlineAsText(i.children,r,u),n.renderToken(e,t,r)},J.hardbreak=function(e,t,r){return r.xhtmlOut?`<br />
`:`<br>
`},J.softbreak=function(e,t,r){return r.breaks?r.xhtmlOut?`<br />
`:`<br>
`:`
`},J.text=function(e,t){return ae(e[t].content)},J.html_block=function(e,t){return e[t].content},J.html_inline=function(e,t){return e[t].content};function De(){this.rules=pt({},J)}De.prototype.renderAttrs=function(t){let r,u,n;if(!t.attrs)return"";for(n="",r=0,u=t.attrs.length;r<u;r++)n+=" "+ae(t.attrs[r][0])+'="'+ae(t.attrs[r][1])+'"';return n},De.prototype.renderToken=function(t,r,u){const n=t[r];let i="";if(n.hidden)return"";n.block&&n.nesting!==-1&&r&&t[r-1].hidden&&(i+=`
`),i+=(n.nesting===-1?"</":"<")+n.tag,i+=this.renderAttrs(n),n.nesting===0&&u.xhtmlOut&&(i+=" /");let a=!1;if(n.block&&(a=!0,n.nesting===1&&r+1<t.length)){const s=t[r+1];(s.type==="inline"||s.hidden||s.nesting===-1&&s.tag===n.tag)&&(a=!1)}return i+=a?`>
`:">",i},De.prototype.renderInline=function(e,t,r){let u="";const n=this.rules;for(let i=0,a=e.length;i<a;i++){const s=e[i].type;typeof n[s]<"u"?u+=n[s](e,i,t,r,this):u+=this.renderToken(e,i,t)}return u},De.prototype.renderInlineAsText=function(e,t,r){let u="";for(let n=0,i=e.length;n<i;n++)switch(e[n].type){case"text":u+=e[n].content;break;case"image":u+=this.renderInlineAsText(e[n].children,t,r);break;case"html_inline":case"html_block":u+=e[n].content;break;case"softbreak":case"hardbreak":u+=`
`;break}return u},De.prototype.render=function(e,t,r){let u="";const n=this.rules;for(let i=0,a=e.length;i<a;i++){const s=e[i].type;s==="inline"?u+=this.renderInline(e[i].children,t,r):typeof n[s]<"u"?u+=n[s](e,i,t,r,this):u+=this.renderToken(e,i,t,r)}return u};function L(){this.__rules__=[],this.__cache__=null}L.prototype.__find__=function(e){for(let t=0;t<this.__rules__.length;t++)if(this.__rules__[t].name===e)return t;return-1},L.prototype.__compile__=function(){const e=this,t=[""];e.__rules__.forEach(function(r){r.enabled&&r.alt.forEach(function(u){t.indexOf(u)<0&&t.push(u)})}),e.__cache__={},t.forEach(function(r){e.__cache__[r]=[],e.__rules__.forEach(function(u){u.enabled&&(r&&u.alt.indexOf(r)<0||e.__cache__[r].push(u.fn))})})},L.prototype.at=function(e,t,r){const u=this.__find__(e),n=r||{};if(u===-1)throw new Error("Parser rule not found: "+e);this.__rules__[u].fn=t,this.__rules__[u].alt=n.alt||[],this.__cache__=null},L.prototype.before=function(e,t,r,u){const n=this.__find__(e),i=u||{};if(n===-1)throw new Error("Parser rule not found: "+e);this.__rules__.splice(n,0,{name:t,enabled:!0,fn:r,alt:i.alt||[]}),this.__cache__=null},L.prototype.after=function(e,t,r,u){const n=this.__find__(e),i=u||{};if(n===-1)throw new Error("Parser rule not found: "+e);this.__rules__.splice(n+1,0,{name:t,enabled:!0,fn:r,alt:i.alt||[]}),this.__cache__=null},L.prototype.push=function(e,t,r){const u=r||{};this.__rules__.push({name:e,enabled:!0,fn:t,alt:u.alt||[]}),this.__cache__=null},L.prototype.enable=function(e,t){Array.isArray(e)||(e=[e]);const r=[];return e.forEach(function(u){const n=this.__find__(u);if(n<0){if(t)return;throw new Error("Rules manager: invalid rule name "+u)}this.__rules__[n].enabled=!0,r.push(u)},this),this.__cache__=null,r},L.prototype.enableOnly=function(e,t){Array.isArray(e)||(e=[e]),this.__rules__.forEach(function(r){r.enabled=!1}),this.enable(e,t)},L.prototype.disable=function(e,t){Array.isArray(e)||(e=[e]);const r=[];return e.forEach(function(u){const n=this.__find__(u);if(n<0){if(t)return;throw new Error("Rules manager: invalid rule name "+u)}this.__rules__[n].enabled=!1,r.push(u)},this),this.__cache__=null,r},L.prototype.getRules=function(e){return this.__cache__===null&&this.__compile__(),this.__cache__[e]||[]};function V(e,t,r){this.type=e,this.tag=t,this.attrs=null,this.map=null,this.nesting=r,this.level=0,this.children=null,this.content="",this.markup="",this.info="",this.meta=null,this.block=!1,this.hidden=!1}V.prototype.attrIndex=function(t){if(!this.attrs)return-1;const r=this.attrs;for(let u=0,n=r.length;u<n;u++)if(r[u][0]===t)return u;return-1},V.prototype.attrPush=function(t){this.attrs?this.attrs.push(t):this.attrs=[t]},V.prototype.attrSet=function(t,r){const u=this.attrIndex(t),n=[t,r];u<0?this.attrPush(n):this.attrs[u]=n},V.prototype.attrGet=function(t){const r=this.attrIndex(t);let u=null;return r>=0&&(u=this.attrs[r][1]),u},V.prototype.attrJoin=function(t,r){const u=this.attrIndex(t);u<0?this.attrPush([t,r]):this.attrs[u][1]=this.attrs[u][1]+" "+r};function Cu(e,t,r){this.src=e,this.env=r,this.tokens=[],this.inlineMode=!1,this.md=t}Cu.prototype.Token=V;const ms=/\r\n?|\n/g,bs=/\0/g;function xs(e){let t;t=e.src.replace(ms,`
`),t=t.replace(bs,"�"),e.src=t}function ys(e){let t;e.inlineMode?(t=new e.Token("inline","",0),t.content=e.src,t.map=[0,1],t.children=[],e.tokens.push(t)):e.md.block.parse(e.src,e.md,e.env,e.tokens)}function _s(e){const t=e.tokens;for(let r=0,u=t.length;r<u;r++){const n=t[r];n.type==="inline"&&e.md.inline.parse(n.content,e.md,e.env,n.children)}}function vs(e){return/^<a[>\s]/i.test(e)}function ws(e){return/^<\/a\s*>/i.test(e)}function Cs(e){const t=e.tokens;if(e.md.options.linkify)for(let r=0,u=t.length;r<u;r++){if(t[r].type!=="inline"||!e.md.linkify.pretest(t[r].content))continue;let n=t[r].children,i=0;for(let a=n.length-1;a>=0;a--){const s=n[a];if(s.type==="link_close"){for(a--;n[a].level!==s.level&&n[a].type!=="link_open";)a--;continue}if(s.type==="html_inline"&&(vs(s.content)&&i>0&&i--,ws(s.content)&&i++),!(i>0)&&s.type==="text"&&e.md.linkify.test(s.content)){const o=s.content;let c=e.md.linkify.match(o);const l=[];let d=s.level,h=0;c.length>0&&c[0].index===0&&a>0&&n[a-1].type==="text_special"&&(c=c.slice(1));for(let f=0;f<c.length;f++){const p=c[f].url,k=e.md.normalizeLink(p);if(!e.md.validateLink(k))continue;let y=c[f].text;c[f].schema?c[f].schema==="mailto:"&&!/^mailto:/i.test(y)?y=e.md.normalizeLinkText("mailto:"+y).replace(/^mailto:/,""):y=e.md.normalizeLinkText(y):y=e.md.normalizeLinkText("http://"+y).replace(/^http:\/\//,"");const D=c[f].index;if(D>h){const w=new e.Token("text","",0);w.content=o.slice(h,D),w.level=d,l.push(w)}const b=new e.Token("link_open","a",1);b.attrs=[["href",k]],b.level=d++,b.markup="linkify",b.info="auto",l.push(b);const _=new e.Token("text","",0);_.content=y,_.level=d,l.push(_);const v=new e.Token("link_close","a",-1);v.level=--d,v.markup="linkify",v.info="auto",l.push(v),h=c[f].lastIndex}if(h<o.length){const f=new e.Token("text","",0);f.content=o.slice(h),f.level=d,l.push(f)}t[r].children=n=yu(n,a,l)}}}}const Au=/\+-|\.\.|\?\?\?\?|!!!!|,,|--/,As=/\((c|tm|r)\)/i,ks=/\((c|tm|r)\)/ig,Es={c:"©",r:"®",tm:"™"};function Ss(e,t){return Es[t.toLowerCase()]}function Ds(e){let t=0;for(let r=e.length-1;r>=0;r--){const u=e[r];u.type==="text"&&!t&&(u.content=u.content.replace(ks,Ss)),u.type==="link_open"&&u.info==="auto"&&t--,u.type==="link_close"&&u.info==="auto"&&t++}}function Ts(e){let t=0;for(let r=e.length-1;r>=0;r--){const u=e[r];u.type==="text"&&!t&&Au.test(u.content)&&(u.content=u.content.replace(/\+-/g,"±").replace(/\.{2,}/g,"…").replace(/([?!])…/g,"$1..").replace(/([?!]){4,}/g,"$1$1$1").replace(/,{2,}/g,",").replace(/(^|[^-])---(?=[^-]|$)/mg,"$1—").replace(/(^|\s)--(?=\s|$)/mg,"$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg,"$1–")),u.type==="link_open"&&u.info==="auto"&&t--,u.type==="link_close"&&u.info==="auto"&&t++}}function $s(e){let t;if(e.md.options.typographer)for(t=e.tokens.length-1;t>=0;t--)e.tokens[t].type==="inline"&&(As.test(e.tokens[t].content)&&Ds(e.tokens[t].children),Au.test(e.tokens[t].content)&&Ts(e.tokens[t].children))}const Ps=/['"]/,ku=/['"]/g,Eu="’";function gt(e,t,r,u){e[t]||(e[t]=[]),e[t].push({pos:r,ch:u})}function Fs(e,t){let r="",u=0;t.sort((n,i)=>n.pos-i.pos);for(let n=0;n<t.length;n++){const i=t[n];r+=e.slice(u,i.pos)+i.ch,u=i.pos+1}return r+e.slice(u)}function Ms(e,t){let r;const u=[],n={};for(let i=0;i<e.length;i++){const a=e[i],s=e[i].level;for(r=u.length-1;r>=0&&!(u[r].level<=s);r--);if(u.length=r+1,a.type!=="text")continue;const o=a.content;let c=0;const l=o.length;e:for(;c<l;){ku.lastIndex=c;const d=ku.exec(o);if(!d)break;let h=!0,f=!0;c=d.index+1;const p=d[0]==="'";let k=32;if(d.index-1>=0)k=o.charCodeAt(d.index-1);else for(r=i-1;r>=0&&!(e[r].type==="softbreak"||e[r].type==="hardbreak");r--)if(e[r].content){k=e[r].content.charCodeAt(e[r].content.length-1);break}let y=32;if(c<l)y=o.charCodeAt(c);else for(r=i+1;r<e.length&&!(e[r].type==="softbreak"||e[r].type==="hardbreak");r++)if(e[r].content){y=e[r].content.charCodeAt(0);break}const D=Ke(k)||Xe(k),b=Ke(y)||Xe(y),_=Qe(k),v=Qe(y);if(v?h=!1:b&&(_||D||(h=!1)),_?f=!1:D&&(v||b||(f=!1)),y===34&&d[0]==='"'&&k>=48&&k<=57&&(f=h=!1),h&&f&&(h=D,f=b),!h&&!f){p&&gt(n,i,d.index,Eu);continue}if(f)for(r=u.length-1;r>=0;r--){let w=u[r];if(u[r].level<s)break;if(w.single===p&&u[r].level===s){w=u[r];let g,C;p?(g=t.md.options.quotes[2],C=t.md.options.quotes[3]):(g=t.md.options.quotes[0],C=t.md.options.quotes[1]),gt(n,i,d.index,C),gt(n,w.token,w.pos,g),u.length=r;continue e}}h?u.push({token:i,pos:d.index,single:p,level:s}):f&&p&&gt(n,i,d.index,Eu)}}Object.keys(n).forEach(function(i){e[i].content=Fs(e[i].content,n[i])})}function Is(e){if(e.md.options.typographer)for(let t=e.tokens.length-1;t>=0;t--)e.tokens[t].type!=="inline"||!Ps.test(e.tokens[t].content)||Ms(e.tokens[t].children,e)}function Rs(e){let t,r;const u=e.tokens,n=u.length;for(let i=0;i<n;i++){if(u[i].type!=="inline")continue;const a=u[i].children,s=a.length;for(t=0;t<s;t++)a[t].type==="text_special"&&(a[t].type="text");for(t=r=0;t<s;t++)a[t].type==="text"&&t+1<s&&a[t+1].type==="text"?a[t+1].content=a[t].content+a[t+1].content:(t!==r&&(a[r]=a[t]),r++);t!==r&&(a.length=r)}}const Qt=[["normalize",xs],["block",ys],["inline",_s],["linkify",Cs],["replacements",$s],["smartquotes",Is],["text_join",Rs]];function Xt(){this.ruler=new L;for(let e=0;e<Qt.length;e++)this.ruler.push(Qt[e][0],Qt[e][1])}Xt.prototype.process=function(e){const t=this.ruler.getRules("");for(let r=0,u=t.length;r<u;r++)t[r](e)},Xt.prototype.State=Cu;function Q(e,t,r,u){this.src=e,this.md=t,this.env=r,this.tokens=u,this.bMarks=[],this.eMarks=[],this.tShift=[],this.sCount=[],this.bsCount=[],this.blkIndent=0,this.line=0,this.lineMax=0,this.tight=!1,this.ddIndent=-1,this.listIndent=-1,this.parentType="root",this.level=0;const n=this.src;for(let i=0,a=0,s=0,o=0,c=n.length,l=!1;a<c;a++){const d=n.charCodeAt(a);if(!l)if(T(d)){s++,d===9?o+=4-o%4:o++;continue}else l=!0;(d===10||a===c-1)&&(d!==10&&a++,this.bMarks.push(i),this.eMarks.push(a),this.tShift.push(s),this.sCount.push(o),this.bsCount.push(0),l=!1,s=0,o=0,i=a+1)}this.bMarks.push(n.length),this.eMarks.push(n.length),this.tShift.push(0),this.sCount.push(0),this.bsCount.push(0),this.lineMax=this.bMarks.length-1}Q.prototype.push=function(e,t,r){const u=new V(e,t,r);return u.block=!0,r<0&&this.level--,u.level=this.level,r>0&&this.level++,this.tokens.push(u),u},Q.prototype.isEmpty=function(t){return this.bMarks[t]+this.tShift[t]>=this.eMarks[t]},Q.prototype.skipEmptyLines=function(t){for(let r=this.lineMax;t<r&&!(this.bMarks[t]+this.tShift[t]<this.eMarks[t]);t++);return t},Q.prototype.skipSpaces=function(t){for(let r=this.src.length;t<r;t++){const u=this.src.charCodeAt(t);if(!T(u))break}return t},Q.prototype.skipSpacesBack=function(t,r){if(t<=r)return t;for(;t>r;)if(!T(this.src.charCodeAt(--t)))return t+1;return t},Q.prototype.skipChars=function(t,r){for(let u=this.src.length;t<u&&this.src.charCodeAt(t)===r;t++);return t},Q.prototype.skipCharsBack=function(t,r,u){if(t<=u)return t;for(;t>u;)if(r!==this.src.charCodeAt(--t))return t+1;return t},Q.prototype.getLines=function(t,r,u,n){if(t>=r)return"";const i=new Array(r-t);for(let a=0,s=t;s<r;s++,a++){let o=0;const c=this.bMarks[s];let l=c,d;for(s+1<r||n?d=this.eMarks[s]+1:d=this.eMarks[s];l<d&&o<u;){const h=this.src.charCodeAt(l);if(T(h))h===9?o+=4-(o+this.bsCount[s])%4:o++;else if(l-c<this.tShift[s])o++;else break;l++}o>u?i[a]=new Array(o-u+1).join(" ")+this.src.slice(l,d):i[a]=this.src.slice(l,d)}return i.join("")},Q.prototype.Token=V;const Ns=65536;function Kt(e,t){const r=e.bMarks[t]+e.tShift[t],u=e.eMarks[t];return e.src.slice(r,u)}function Su(e){const t=[],r=e.length;let u=0,n=e.charCodeAt(u),i=!1,a=0,s="";for(;u<r;)n===124&&(i?(s+=e.substring(a,u-1),a=u):(t.push(s+e.substring(a,u)),s="",a=u+1)),i=n===92,u++,n=e.charCodeAt(u);return t.push(s+e.substring(a)),t}function zs(e,t,r,u){if(t+2>r)return!1;let n=t+1;if(e.sCount[n]<e.blkIndent||e.sCount[n]-e.blkIndent>=4)return!1;let i=e.bMarks[n]+e.tShift[n];if(i>=e.eMarks[n])return!1;const a=e.src.charCodeAt(i++);if(a!==124&&a!==45&&a!==58||i>=e.eMarks[n])return!1;const s=e.src.charCodeAt(i++);if(s!==124&&s!==45&&s!==58&&!T(s)||a===45&&T(s))return!1;for(;i<e.eMarks[n];){const v=e.src.charCodeAt(i);if(v!==124&&v!==45&&v!==58&&!T(v))return!1;i++}let o=Kt(e,t+1),c=o.split("|");const l=[];for(let v=0;v<c.length;v++){const w=c[v].trim();if(!w){if(v===0||v===c.length-1)continue;return!1}if(!/^:?-+:?$/.test(w))return!1;w.charCodeAt(w.length-1)===58?l.push(w.charCodeAt(0)===58?"center":"right"):w.charCodeAt(0)===58?l.push("left"):l.push("")}if(o=Kt(e,t).trim(),o.indexOf("|")===-1||e.sCount[t]-e.blkIndent>=4)return!1;c=Su(o),c.length&&c[0]===""&&c.shift(),c.length&&c[c.length-1]===""&&c.pop();const d=c.length;if(d===0||d!==l.length)return!1;if(u)return!0;const h=e.parentType;e.parentType="table";const f=e.md.block.ruler.getRules("blockquote"),p=e.push("table_open","table",1),k=[t,0];p.map=k;const y=e.push("thead_open","thead",1);y.map=[t,t+1];const D=e.push("tr_open","tr",1);D.map=[t,t+1];for(let v=0;v<c.length;v++){const w=e.push("th_open","th",1);l[v]&&(w.attrs=[["style","text-align:"+l[v]]]);const g=e.push("inline","",0);g.content=c[v].trim(),g.children=[],e.push("th_close","th",-1)}e.push("tr_close","tr",-1),e.push("thead_close","thead",-1);let b,_=0;for(n=t+2;n<r&&!(e.sCount[n]<e.blkIndent);n++){let v=!1;for(let g=0,C=f.length;g<C;g++)if(f[g](e,n,r,!0)){v=!0;break}if(v||(o=Kt(e,n).trim(),!o)||e.sCount[n]-e.blkIndent>=4||(c=Su(o),c.length&&c[0]===""&&c.shift(),c.length&&c[c.length-1]===""&&c.pop(),_+=d-c.length,_>Ns))break;if(n===t+2){const g=e.push("tbody_open","tbody",1);g.map=b=[t+2,0]}const w=e.push("tr_open","tr",1);w.map=[n,n+1];for(let g=0;g<d;g++){const C=e.push("td_open","td",1);l[g]&&(C.attrs=[["style","text-align:"+l[g]]]);const M=e.push("inline","",0);M.content=c[g]?c[g].trim():"",M.children=[],e.push("td_close","td",-1)}e.push("tr_close","tr",-1)}return b&&(e.push("tbody_close","tbody",-1),b[1]=n),e.push("table_close","table",-1),k[1]=n,e.parentType=h,e.line=n,!0}function Os(e,t,r){if(e.sCount[t]-e.blkIndent<4)return!1;let u=t+1,n=u;for(;u<r;){if(e.isEmpty(u)){u++;continue}if(e.sCount[u]-e.blkIndent>=4){u++,n=u;continue}break}e.line=n;const i=e.push("code_block","code",0);return i.content=e.getLines(t,n,4+e.blkIndent,!1)+`
`,i.map=[t,e.line],!0}function Ls(e,t,r,u){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t];if(e.sCount[t]-e.blkIndent>=4||n+3>i)return!1;const a=e.src.charCodeAt(n);if(a!==126&&a!==96)return!1;let s=n;n=e.skipChars(n,a);let o=n-s;if(o<3)return!1;const c=e.src.slice(s,n),l=e.src.slice(n,i);if(a===96&&l.indexOf(String.fromCharCode(a))>=0)return!1;if(u)return!0;let d=t,h=!1;for(;d++,!(d>=r||(n=s=e.bMarks[d]+e.tShift[d],i=e.eMarks[d],n<i&&e.sCount[d]<e.blkIndent));)if(e.src.charCodeAt(n)===a&&!(e.sCount[d]-e.blkIndent>=4)&&(n=e.skipChars(n,a),!(n-s<o)&&(n=e.skipSpaces(n),!(n<i)))){h=!0;break}o=e.sCount[t],e.line=d+(h?1:0);const f=e.push("fence","code",0);return f.info=l,f.content=e.getLines(t+1,d,o,!0),f.markup=c,f.map=[t,e.line],!0}function Bs(e,t,r,u){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t];const a=e.lineMax;if(e.sCount[t]-e.blkIndent>=4||e.src.charCodeAt(n)!==62)return!1;if(u)return!0;const s=[],o=[],c=[],l=[],d=e.md.block.ruler.getRules("blockquote"),h=e.parentType;e.parentType="blockquote";let f=!1,p;for(p=t;p<r;p++){const _=e.sCount[p]<e.blkIndent;if(n=e.bMarks[p]+e.tShift[p],i=e.eMarks[p],n>=i)break;if(e.src.charCodeAt(n++)===62&&!_){let w=e.sCount[p]+1,g,C;e.src.charCodeAt(n)===32?(n++,w++,C=!1,g=!0):e.src.charCodeAt(n)===9?(g=!0,(e.bsCount[p]+w)%4===3?(n++,w++,C=!1):C=!0):g=!1;let M=w;for(s.push(e.bMarks[p]),e.bMarks[p]=n;n<i;){const B=e.src.charCodeAt(n);if(T(B))B===9?M+=4-(M+e.bsCount[p]+(C?1:0))%4:M++;else break;n++}f=n>=i,o.push(e.bsCount[p]),e.bsCount[p]=e.sCount[p]+1+(g?1:0),c.push(e.sCount[p]),e.sCount[p]=M-w,l.push(e.tShift[p]),e.tShift[p]=n-e.bMarks[p];continue}if(f)break;let v=!1;for(let w=0,g=d.length;w<g;w++)if(d[w](e,p,r,!0)){v=!0;break}if(v){e.lineMax=p,e.blkIndent!==0&&(s.push(e.bMarks[p]),o.push(e.bsCount[p]),l.push(e.tShift[p]),c.push(e.sCount[p]),e.sCount[p]-=e.blkIndent);break}s.push(e.bMarks[p]),o.push(e.bsCount[p]),l.push(e.tShift[p]),c.push(e.sCount[p]),e.sCount[p]=-1}const k=e.blkIndent;e.blkIndent=0;const y=e.push("blockquote_open","blockquote",1);y.markup=">";const D=[t,0];y.map=D,e.md.block.tokenize(e,t,p);const b=e.push("blockquote_close","blockquote",-1);b.markup=">",e.lineMax=a,e.parentType=h,D[1]=e.line;for(let _=0;_<l.length;_++)e.bMarks[_+t]=s[_],e.tShift[_+t]=l[_],e.sCount[_+t]=c[_],e.bsCount[_+t]=o[_];return e.blkIndent=k,!0}function Us(e,t,r,u){const n=e.eMarks[t];if(e.sCount[t]-e.blkIndent>=4)return!1;let i=e.bMarks[t]+e.tShift[t];const a=e.src.charCodeAt(i++);if(a!==42&&a!==45&&a!==95)return!1;let s=1;for(;i<n;){const c=e.src.charCodeAt(i++);if(c!==a&&!T(c))return!1;c===a&&s++}if(s<3)return!1;if(u)return!0;e.line=t+1;const o=e.push("hr","hr",0);return o.map=[t,e.line],o.markup=Array(s+1).join(String.fromCharCode(a)),!0}function Du(e,t){const r=e.eMarks[t];let u=e.bMarks[t]+e.tShift[t];const n=e.src.charCodeAt(u++);if(n!==42&&n!==45&&n!==43)return-1;if(u<r){const i=e.src.charCodeAt(u);if(!T(i))return-1}return u}function Tu(e,t){const r=e.bMarks[t]+e.tShift[t],u=e.eMarks[t];let n=r;if(n+1>=u)return-1;let i=e.src.charCodeAt(n++);if(i<48||i>57)return-1;for(;;){if(n>=u)return-1;if(i=e.src.charCodeAt(n++),i>=48&&i<=57){if(n-r>=10)return-1;continue}if(i===41||i===46)break;return-1}return n<u&&(i=e.src.charCodeAt(n),!T(i))?-1:n}function qs(e,t){const r=e.level+2;for(let u=t+2,n=e.tokens.length-2;u<n;u++)e.tokens[u].level===r&&e.tokens[u].type==="paragraph_open"&&(e.tokens[u+2].hidden=!0,e.tokens[u].hidden=!0,u+=2)}function Hs(e,t,r,u){let n,i,a,s,o=t,c=!0;if(e.sCount[o]-e.blkIndent>=4||e.listIndent>=0&&e.sCount[o]-e.listIndent>=4&&e.sCount[o]<e.blkIndent)return!1;let l=!1;u&&e.parentType==="paragraph"&&e.sCount[o]>=e.blkIndent&&(l=!0);let d,h,f;if((f=Tu(e,o))>=0){if(d=!0,a=e.bMarks[o]+e.tShift[o],h=Number(e.src.slice(a,f-1)),l&&h!==1)return!1}else if((f=Du(e,o))>=0)d=!1;else return!1;if(l&&e.skipSpaces(f)>=e.eMarks[o])return!1;if(u)return!0;const p=e.src.charCodeAt(f-1),k=e.tokens.length;d?(s=e.push("ordered_list_open","ol",1),h!==1&&(s.attrs=[["start",h]])):s=e.push("bullet_list_open","ul",1);const y=[o,0];s.map=y,s.markup=String.fromCharCode(p);let D=!1;const b=e.md.block.ruler.getRules("list"),_=e.parentType;for(e.parentType="list";o<r;){i=f,n=e.eMarks[o];const v=e.sCount[o]+f-(e.bMarks[o]+e.tShift[o]);let w=v;for(;i<n;){const ze=e.src.charCodeAt(i);if(ze===9)w+=4-(w+e.bsCount[o])%4;else if(ze===32)w++;else break;i++}const g=i;let C;g>=n?C=1:C=w-v,C>4&&(C=1);const M=v+C;s=e.push("list_item_open","li",1),s.markup=String.fromCharCode(p);const B=[o,0];s.map=B,d&&(s.info=e.src.slice(a,f-1));const $=e.tight,Ne=e.tShift[o],zl=e.sCount[o],Ol=e.listIndent;if(e.listIndent=e.blkIndent,e.blkIndent=M,e.tight=!0,e.tShift[o]=g-e.bMarks[o],e.sCount[o]=w,g>=n&&e.isEmpty(o+1)?e.line=Math.min(e.line+2,r):e.md.block.tokenize(e,o,r,!0),(!e.tight||D)&&(c=!1),D=e.line-o>1&&e.isEmpty(e.line-1),e.blkIndent=e.listIndent,e.listIndent=Ol,e.tShift[o]=Ne,e.sCount[o]=zl,e.tight=$,s=e.push("list_item_close","li",-1),s.markup=String.fromCharCode(p),o=e.line,B[1]=o,o>=r||e.sCount[o]<e.blkIndent||e.sCount[o]-e.blkIndent>=4)break;let ui=!1;for(let ze=0,Ll=b.length;ze<Ll;ze++)if(b[ze](e,o,r,!0)){ui=!0;break}if(ui)break;if(d){if(f=Tu(e,o),f<0)break;a=e.bMarks[o]+e.tShift[o]}else if(f=Du(e,o),f<0)break;if(p!==e.src.charCodeAt(f-1))break}return d?s=e.push("ordered_list_close","ol",-1):s=e.push("bullet_list_close","ul",-1),s.markup=String.fromCharCode(p),y[1]=o,e.line=o,e.parentType=_,c&&qs(e,k),!0}function js(e,t,r,u){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t],a=t+1;if(e.sCount[t]-e.blkIndent>=4||e.src.charCodeAt(n)!==91)return!1;function s(b){const _=e.lineMax;if(b>=_||e.isEmpty(b))return null;let v=!1;if(e.sCount[b]-e.blkIndent>3&&(v=!0),e.sCount[b]<0&&(v=!0),!v){const C=e.md.block.ruler.getRules("reference"),M=e.parentType;e.parentType="reference";let B=!1;for(let $=0,Ne=C.length;$<Ne;$++)if(C[$](e,b,_,!0)){B=!0;break}if(e.parentType=M,B)return null}const w=e.bMarks[b]+e.tShift[b],g=e.eMarks[b];return e.src.slice(w,g+1)}let o=e.src.slice(n,i+1);i=o.length;let c=-1;for(n=1;n<i;n++){const b=o.charCodeAt(n);if(b===91)return!1;if(b===93){c=n;break}else if(b===10){const _=s(a);_!==null&&(o+=_,i=o.length,a++)}else if(b===92&&(n++,n<i&&o.charCodeAt(n)===10)){const _=s(a);_!==null&&(o+=_,i=o.length,a++)}}if(c<0||o.charCodeAt(c+1)!==58)return!1;for(n=c+2;n<i;n++){const b=o.charCodeAt(n);if(b===10){const _=s(a);_!==null&&(o+=_,i=o.length,a++)}else if(!T(b))break}const l=e.md.helpers.parseLinkDestination(o,n,i);if(!l.ok)return!1;const d=e.md.normalizeLink(l.str);if(!e.md.validateLink(d))return!1;n=l.pos;const h=n,f=a,p=n;for(;n<i;n++){const b=o.charCodeAt(n);if(b===10){const _=s(a);_!==null&&(o+=_,i=o.length,a++)}else if(!T(b))break}let k=e.md.helpers.parseLinkTitle(o,n,i);for(;k.can_continue;){const b=s(a);if(b===null)break;o+=b,n=i,i=o.length,a++,k=e.md.helpers.parseLinkTitle(o,n,i,k)}let y;for(n<i&&p!==n&&k.ok?(y=k.str,n=k.pos):(y="",n=h,a=f);n<i;){const b=o.charCodeAt(n);if(!T(b))break;n++}if(n<i&&o.charCodeAt(n)!==10&&y)for(y="",n=h,a=f;n<i;){const b=o.charCodeAt(n);if(!T(b))break;n++}if(n<i&&o.charCodeAt(n)!==10)return!1;const D=ft(o.slice(1,c));return D?(u||(typeof e.env.references>"u"&&(e.env.references={}),typeof e.env.references[D]>"u"&&(e.env.references[D]={title:y,href:d}),e.line=a),!0):!1}const Ws=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"],Gs="[a-zA-Z_:][a-zA-Z0-9:._-]*",Vs="(?:"+"[^\"'=<>`\\x00-\\x20]+"+"|"+"'[^']*'"+"|"+'"[^"]*"'+")",$u="<[A-Za-z][A-Za-z0-9\\-]*"+("(?:\\s+"+Gs+"(?:\\s*=\\s*"+Vs+")?)")+"*\\s*\\/?>",Pu="<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>",Zs="<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->",Ys="<[?][\\s\\S]*?[?]>",Js="<![A-Za-z][^>]*>",Qs="<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",Xs=new RegExp("^(?:"+$u+"|"+Pu+"|"+Zs+"|"+Ys+"|"+Js+"|"+Qs+")"),Ks=new RegExp("^(?:"+$u+"|"+Pu+")"),be=[[/^<(script|pre|style|textarea)(?=(\s|>|$))/i,/<\/(script|pre|style|textarea)>/i,!0],[/^<!--/,/-->/,!0],[/^<\?/,/\?>/,!0],[/^<![A-Z]/,/>/,!0],[/^<!\[CDATA\[/,/\]\]>/,!0],[new RegExp("^</?("+Ws.join("|")+")(?=(\\s|/?>|$))","i"),/^$/,!0],[new RegExp(Ks.source+"\\s*$"),/^$/,!1]];function eo(e,t,r,u){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t];if(e.sCount[t]-e.blkIndent>=4||!e.md.options.html||e.src.charCodeAt(n)!==60)return!1;let a=e.src.slice(n,i),s=0;for(;s<be.length&&!be[s][0].test(a);s++);if(s===be.length)return!1;if(u)return be[s][2];let o=t+1;const c=be[s][1].test("");if(!be[s][1].test(a)){for(;o<r&&!(e.sCount[o]<e.blkIndent&&(c||!e.isEmpty(o)));o++)if(n=e.bMarks[o]+e.tShift[o],i=e.eMarks[o],a=e.src.slice(n,i),be[s][1].test(a)){a.length!==0&&o++;break}}e.line=o;const l=e.push("html_block","",0);return l.map=[t,o],l.content=e.getLines(t,o,e.blkIndent,!0),!0}function to(e,t,r,u){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t];if(e.sCount[t]-e.blkIndent>=4)return!1;let a=e.src.charCodeAt(n);if(a!==35||n>=i)return!1;let s=1;for(a=e.src.charCodeAt(++n);a===35&&n<i&&s<=6;)s++,a=e.src.charCodeAt(++n);if(s>6||n<i&&!T(a))return!1;if(u)return!0;i=e.skipSpacesBack(i,n);const o=e.skipCharsBack(i,35,n);o>n&&T(e.src.charCodeAt(o-1))&&(i=o),e.line=t+1;const c=e.push("heading_open","h"+String(s),1);c.markup="########".slice(0,s),c.map=[t,e.line];const l=e.push("inline","",0);l.content=ht(e.src.slice(n,i)),l.map=[t,e.line],l.children=[];const d=e.push("heading_close","h"+String(s),-1);return d.markup="########".slice(0,s),!0}function ro(e,t,r){const u=e.md.block.ruler.getRules("paragraph");if(e.sCount[t]-e.blkIndent>=4)return!1;const n=e.parentType;e.parentType="paragraph";let i=0,a,s=t+1;for(;s<r&&!e.isEmpty(s);s++){if(e.sCount[s]-e.blkIndent>3)continue;if(e.sCount[s]>=e.blkIndent){let f=e.bMarks[s]+e.tShift[s];const p=e.eMarks[s];if(f<p&&(a=e.src.charCodeAt(f),(a===45||a===61)&&(f=e.skipChars(f,a),f=e.skipSpaces(f),f>=p))){i=a===61?1:2;break}}if(e.sCount[s]<0)continue;let h=!1;for(let f=0,p=u.length;f<p;f++)if(u[f](e,s,r,!0)){h=!0;break}if(h)break}if(!i)return e.parentType=n,!1;const o=ht(e.getLines(t,s,e.blkIndent,!1));e.line=s+1;const c=e.push("heading_open","h"+String(i),1);c.markup=String.fromCharCode(a),c.map=[t,e.line];const l=e.push("inline","",0);l.content=o,l.map=[t,e.line-1],l.children=[];const d=e.push("heading_close","h"+String(i),-1);return d.markup=String.fromCharCode(a),e.parentType=n,!0}function uo(e,t,r){const u=e.md.block.ruler.getRules("paragraph"),n=e.parentType;let i=t+1;for(e.parentType="paragraph";i<r&&!e.isEmpty(i);i++){if(e.sCount[i]-e.blkIndent>3||e.sCount[i]<0)continue;let c=!1;for(let l=0,d=u.length;l<d;l++)if(u[l](e,i,r,!0)){c=!0;break}if(c)break}const a=ht(e.getLines(t,i,e.blkIndent,!1));e.line=i;const s=e.push("paragraph_open","p",1);s.map=[t,e.line];const o=e.push("inline","",0);return o.content=a,o.map=[t,e.line],o.children=[],e.push("paragraph_close","p",-1),e.parentType=n,!0}const mt=[["table",zs,["paragraph","reference"]],["code",Os],["fence",Ls,["paragraph","reference","blockquote","list"]],["blockquote",Bs,["paragraph","reference","blockquote","list"]],["hr",Us,["paragraph","reference","blockquote","list"]],["list",Hs,["paragraph","reference","blockquote"]],["reference",js],["html_block",eo,["paragraph","reference","blockquote"]],["heading",to,["paragraph","reference","blockquote"]],["lheading",ro],["paragraph",uo]];function bt(){this.ruler=new L;for(let e=0;e<mt.length;e++)this.ruler.push(mt[e][0],mt[e][1],{alt:(mt[e][2]||[]).slice()})}bt.prototype.tokenize=function(e,t,r){const u=this.ruler.getRules(""),n=u.length,i=e.md.options.maxNesting;let a=t,s=!1;for(;a<r&&(e.line=a=e.skipEmptyLines(a),!(a>=r||e.sCount[a]<e.blkIndent));){if(e.level>=i){e.line=r;break}const o=e.line;let c=!1;for(let l=0;l<n;l++)if(c=u[l](e,a,r,!1),c){if(o>=e.line)throw new Error("block rule didn't increment state.line");break}if(!c)throw new Error("none of the block rules matched");e.tight=!s,e.isEmpty(e.line-1)&&(s=!0),a=e.line,a<r&&e.isEmpty(a)&&(s=!0,a++,e.line=a)}},bt.prototype.parse=function(e,t,r,u){if(!e)return;const n=new this.State(e,t,r,u);this.tokenize(n,n.line,n.lineMax)},bt.prototype.State=Q;function et(e,t,r,u){this.src=e,this.env=r,this.md=t,this.tokens=u,this.tokens_meta=Array(u.length),this.pos=0,this.posMax=this.src.length,this.level=0,this.pending="",this.pendingLevel=0,this.cache={},this.delimiters=[],this._prev_delimiters=[],this.backticks={},this.backticksScanned=!1,this.linkLevel=0}et.prototype.pushPending=function(){const e=new V("text","",0);return e.content=this.pending,e.level=this.pendingLevel,this.tokens.push(e),this.pending="",e},et.prototype.push=function(e,t,r){this.pending&&this.pushPending();const u=new V(e,t,r);let n=null;return r<0&&(this.level--,this.delimiters=this._prev_delimiters.pop()),u.level=this.level,r>0&&(this.level++,this._prev_delimiters.push(this.delimiters),this.delimiters=[],n={delimiters:this.delimiters}),this.pendingLevel=this.level,this.tokens.push(u),this.tokens_meta.push(n),u},et.prototype.scanDelims=function(e,t){const r=this.posMax,u=this.src.charCodeAt(e);let n;if(e===0)n=32;else if(e===1)n=this.src.charCodeAt(0),(n&63488)===55296&&(n=65533);else if(n=this.src.charCodeAt(e-1),(n&64512)===56320){const y=this.src.charCodeAt(e-2);n=(y&64512)===55296?65536+(y-55296<<10)+(n-56320):65533}else(n&64512)===55296&&(n=65533);let i=e;for(;i<r&&this.src.charCodeAt(i)===u;)i++;const a=i-e;let s=i<r?this.src.charCodeAt(i):32;if((s&64512)===55296){const y=this.src.charCodeAt(i+1);s=(y&64512)===56320?65536+(s-55296<<10)+(y-56320):65533}else(s&64512)===56320&&(s=65533);const o=Ke(n)||Xe(n),c=Ke(s)||Xe(s),l=Qe(n),d=Qe(s),h=!d&&(!c||l||o),f=!l&&(!o||d||c);return{can_open:h&&(t||!f||o),can_close:f&&(t||!h||c),length:a}},et.prototype.Token=V;function no(e){switch(e){case 10:case 33:case 35:case 36:case 37:case 38:case 42:case 43:case 45:case 58:case 60:case 61:case 62:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 125:case 126:return!0;default:return!1}}function io(e,t){let r=e.pos;for(;r<e.posMax&&!no(e.src.charCodeAt(r));)r++;return r===e.pos?!1:(t||(e.pending+=e.src.slice(e.pos,r)),e.pos=r,!0)}const ao=/(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;function so(e,t){if(!e.md.options.linkify||e.linkLevel>0)return!1;const r=e.pos,u=e.posMax;if(r+3>u||e.src.charCodeAt(r)!==58||e.src.charCodeAt(r+1)!==47||e.src.charCodeAt(r+2)!==47)return!1;const n=e.pending.match(ao);if(!n)return!1;const i=n[1],a=e.md.linkify.matchAtStart(e.src.slice(r-i.length));if(!a)return!1;let s=a.url;if(s.length<=i.length)return!1;let o=s.length;for(;o>0&&s.charCodeAt(o-1)===42;)o--;o!==s.length&&(s=s.slice(0,o));const c=e.md.normalizeLink(s);if(!e.md.validateLink(c))return!1;if(!t){e.pending=e.pending.slice(0,-i.length);const l=e.push("link_open","a",1);l.attrs=[["href",c]],l.markup="linkify",l.info="auto";const d=e.push("text","",0);d.content=e.md.normalizeLinkText(s);const h=e.push("link_close","a",-1);h.markup="linkify",h.info="auto"}return e.pos+=s.length-i.length,!0}function oo(e,t){let r=e.pos;if(e.src.charCodeAt(r)!==10)return!1;const u=e.pending.length-1,n=e.posMax;if(!t)if(u>=0&&e.pending.charCodeAt(u)===32)if(u>=1&&e.pending.charCodeAt(u-1)===32){let i=u-1;for(;i>=1&&e.pending.charCodeAt(i-1)===32;)i--;e.pending=e.pending.slice(0,i),e.push("hardbreak","br",0)}else e.pending=e.pending.slice(0,-1),e.push("softbreak","br",0);else e.push("softbreak","br",0);for(r++;r<n&&T(e.src.charCodeAt(r));)r++;return e.pos=r,!0}const er=[];for(let e=0;e<256;e++)er.push(0);"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(e){er[e.charCodeAt(0)]=1});function co(e,t){let r=e.pos;const u=e.posMax;if(e.src.charCodeAt(r)!==92||(r++,r>=u))return!1;let n=e.src.charCodeAt(r);if(n===10){for(t||e.push("hardbreak","br",0),r++;r<u&&(n=e.src.charCodeAt(r),!!T(n));)r++;return e.pos=r,!0}let i=e.src[r];if(n>=55296&&n<=56319&&r+1<u){const s=e.src.charCodeAt(r+1);s>=56320&&s<=57343&&(i+=e.src[r+1],r++)}const a="\\"+i;if(!t){const s=e.push("text_special","",0);n<256&&er[n]!==0?s.content=i:s.content=a,s.markup=a,s.info="escape"}return e.pos=r+1,!0}function lo(e,t){let r=e.pos;if(e.src.charCodeAt(r)!==96)return!1;const n=r;r++;const i=e.posMax;for(;r<i&&e.src.charCodeAt(r)===96;)r++;const a=e.src.slice(n,r),s=a.length;if(e.backticksScanned&&(e.backticks[s]||0)<=n)return t||(e.pending+=a),e.pos+=s,!0;let o=r,c;for(;(c=e.src.indexOf("`",o))!==-1;){for(o=c+1;o<i&&e.src.charCodeAt(o)===96;)o++;const l=o-c;if(l===s){if(!t){const d=e.push("code_inline","code",0);d.markup=a,d.content=e.src.slice(r,c).replace(/\n/g," ").replace(/^ (.+) $/,"$1")}return e.pos=o,!0}e.backticks[l]=c}return e.backticksScanned=!0,t||(e.pending+=a),e.pos+=s,!0}function po(e,t){const r=e.pos,u=e.src.charCodeAt(r);if(t||u!==126)return!1;const n=e.scanDelims(e.pos,!0);let i=n.length;const a=String.fromCharCode(u);if(i<2)return!1;let s;i%2&&(s=e.push("text","",0),s.content=a,i--);for(let o=0;o<i;o+=2)s=e.push("text","",0),s.content=a+a,e.delimiters.push({marker:u,length:0,token:e.tokens.length-1,end:-1,open:n.can_open,close:n.can_close});return e.pos+=n.length,!0}function Fu(e,t){let r;const u=[],n=t.length;for(let i=0;i<n;i++){const a=t[i];if(a.marker!==126||a.end===-1)continue;const s=t[a.end];r=e.tokens[a.token],r.type="s_open",r.tag="s",r.nesting=1,r.markup="~~",r.content="",r=e.tokens[s.token],r.type="s_close",r.tag="s",r.nesting=-1,r.markup="~~",r.content="",e.tokens[s.token-1].type==="text"&&e.tokens[s.token-1].content==="~"&&u.push(s.token-1)}for(;u.length;){const i=u.pop();let a=i+1;for(;a<e.tokens.length&&e.tokens[a].type==="s_close";)a++;a--,i!==a&&(r=e.tokens[a],e.tokens[a]=e.tokens[i],e.tokens[i]=r)}}function fo(e){const t=e.tokens_meta,r=e.tokens_meta.length;Fu(e,e.delimiters);for(let u=0;u<r;u++)t[u]&&t[u].delimiters&&Fu(e,t[u].delimiters)}const Mu={tokenize:po,postProcess:fo};function ho(e,t){const r=e.pos,u=e.src.charCodeAt(r);if(t||u!==95&&u!==42)return!1;const n=e.scanDelims(e.pos,u===42);for(let i=0;i<n.length;i++){const a=e.push("text","",0);a.content=String.fromCharCode(u),e.delimiters.push({marker:u,length:n.length,token:e.tokens.length-1,end:-1,open:n.can_open,close:n.can_close})}return e.pos+=n.length,!0}function Iu(e,t){const r=t.length;for(let u=r-1;u>=0;u--){const n=t[u];if(n.marker!==95&&n.marker!==42||n.end===-1)continue;const i=t[n.end],a=u>0&&t[u-1].end===n.end+1&&t[u-1].marker===n.marker&&t[u-1].token===n.token-1&&t[n.end+1].token===i.token+1,s=String.fromCharCode(n.marker),o=e.tokens[n.token];o.type=a?"strong_open":"em_open",o.tag=a?"strong":"em",o.nesting=1,o.markup=a?s+s:s,o.content="";const c=e.tokens[i.token];c.type=a?"strong_close":"em_close",c.tag=a?"strong":"em",c.nesting=-1,c.markup=a?s+s:s,c.content="",a&&(e.tokens[t[u-1].token].content="",e.tokens[t[n.end+1].token].content="",u--)}}function go(e){const t=e.tokens_meta,r=e.tokens_meta.length;Iu(e,e.delimiters);for(let u=0;u<r;u++)t[u]&&t[u].delimiters&&Iu(e,t[u].delimiters)}const Ru={tokenize:ho,postProcess:go};function mo(e,t){let r,u,n,i,a="",s="",o=e.pos,c=!0;if(e.src.charCodeAt(e.pos)!==91)return!1;const l=e.pos,d=e.posMax,h=e.pos+1,f=e.md.helpers.parseLinkLabel(e,e.pos,!0);if(f<0)return!1;let p=f+1;if(p<d&&e.src.charCodeAt(p)===40){for(c=!1,p++;p<d&&(r=e.src.charCodeAt(p),!(!T(r)&&r!==10));p++);if(p>=d)return!1;if(o=p,n=e.md.helpers.parseLinkDestination(e.src,p,e.posMax),n.ok){for(a=e.md.normalizeLink(n.str),e.md.validateLink(a)?p=n.pos:a="",o=p;p<d&&(r=e.src.charCodeAt(p),!(!T(r)&&r!==10));p++);if(n=e.md.helpers.parseLinkTitle(e.src,p,e.posMax),p<d&&o!==p&&n.ok)for(s=n.str,p=n.pos;p<d&&(r=e.src.charCodeAt(p),!(!T(r)&&r!==10));p++);}(p>=d||e.src.charCodeAt(p)!==41)&&(c=!0),p++}if(c){if(typeof e.env.references>"u")return!1;if(p<d&&e.src.charCodeAt(p)===91?(o=p+1,p=e.md.helpers.parseLinkLabel(e,p),p>=0?u=e.src.slice(o,p++):p=f+1):p=f+1,u||(u=e.src.slice(h,f)),i=e.env.references[ft(u)],!i)return e.pos=l,!1;a=i.href,s=i.title}if(!t){e.pos=h,e.posMax=f;const k=e.push("link_open","a",1),y=[["href",a]];k.attrs=y,s&&y.push(["title",s]),e.linkLevel++,e.md.inline.tokenize(e),e.linkLevel--,e.push("link_close","a",-1)}return e.pos=p,e.posMax=d,!0}function bo(e,t){let r,u,n,i,a,s,o,c,l="";const d=e.pos,h=e.posMax;if(e.src.charCodeAt(e.pos)!==33||e.src.charCodeAt(e.pos+1)!==91)return!1;const f=e.pos+2,p=e.md.helpers.parseLinkLabel(e,e.pos+1,!1);if(p<0)return!1;if(i=p+1,i<h&&e.src.charCodeAt(i)===40){for(i++;i<h&&(r=e.src.charCodeAt(i),!(!T(r)&&r!==10));i++);if(i>=h)return!1;for(c=i,s=e.md.helpers.parseLinkDestination(e.src,i,e.posMax),s.ok&&(l=e.md.normalizeLink(s.str),e.md.validateLink(l)?i=s.pos:l=""),c=i;i<h&&(r=e.src.charCodeAt(i),!(!T(r)&&r!==10));i++);if(s=e.md.helpers.parseLinkTitle(e.src,i,e.posMax),i<h&&c!==i&&s.ok)for(o=s.str,i=s.pos;i<h&&(r=e.src.charCodeAt(i),!(!T(r)&&r!==10));i++);else o="";if(i>=h||e.src.charCodeAt(i)!==41)return e.pos=d,!1;i++}else{if(typeof e.env.references>"u")return!1;if(i<h&&e.src.charCodeAt(i)===91?(c=i+1,i=e.md.helpers.parseLinkLabel(e,i),i>=0?n=e.src.slice(c,i++):i=p+1):i=p+1,n||(n=e.src.slice(f,p)),a=e.env.references[ft(n)],!a)return e.pos=d,!1;l=a.href,o=a.title}if(!t){u=e.src.slice(f,p);const k=[];e.md.inline.parse(u,e.md,e.env,k);const y=e.push("image","img",0),D=[["src",l],["alt",""]];y.attrs=D,y.children=k,y.content=u,o&&D.push(["title",o])}return e.pos=i,e.posMax=h,!0}const xo=/^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/,yo=/^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;function _o(e,t){let r=e.pos;if(e.src.charCodeAt(r)!==60)return!1;const u=e.pos,n=e.posMax;for(;;){if(++r>=n)return!1;const a=e.src.charCodeAt(r);if(a===60)return!1;if(a===62)break}const i=e.src.slice(u+1,r);if(yo.test(i)){const a=e.md.normalizeLink(i);if(!e.md.validateLink(a))return!1;if(!t){const s=e.push("link_open","a",1);s.attrs=[["href",a]],s.markup="autolink",s.info="auto";const o=e.push("text","",0);o.content=e.md.normalizeLinkText(i);const c=e.push("link_close","a",-1);c.markup="autolink",c.info="auto"}return e.pos+=i.length+2,!0}if(xo.test(i)){const a=e.md.normalizeLink("mailto:"+i);if(!e.md.validateLink(a))return!1;if(!t){const s=e.push("link_open","a",1);s.attrs=[["href",a]],s.markup="autolink",s.info="auto";const o=e.push("text","",0);o.content=e.md.normalizeLinkText(i);const c=e.push("link_close","a",-1);c.markup="autolink",c.info="auto"}return e.pos+=i.length+2,!0}return!1}function vo(e){return/^<a[>\s]/i.test(e)}function wo(e){return/^<\/a\s*>/i.test(e)}function Co(e){const t=e|32;return t>=97&&t<=122}function Ao(e,t){if(!e.md.options.html)return!1;const r=e.posMax,u=e.pos;if(e.src.charCodeAt(u)!==60||u+2>=r)return!1;const n=e.src.charCodeAt(u+1);if(n!==33&&n!==63&&n!==47&&!Co(n))return!1;const i=e.src.slice(u).match(Xs);if(!i)return!1;if(!t){const a=e.push("html_inline","",0);a.content=i[0],vo(a.content)&&e.linkLevel++,wo(a.content)&&e.linkLevel--}return e.pos+=i[0].length,!0}const ko=/^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i,Eo=/^&([a-z][a-z0-9]{1,31});/i;function So(e,t){const r=e.pos,u=e.posMax;if(e.src.charCodeAt(r)!==38||r+1>=u)return!1;if(e.src.charCodeAt(r+1)===35){const i=e.src.slice(r).match(ko);if(i){if(!t){const a=i[1][0].toLowerCase()==="x"?parseInt(i[1].slice(1),16):parseInt(i[1],10),s=e.push("text_special","",0);s.content=Jt(a)?Je(a):Je(65533),s.markup=i[0],s.info="entity"}return e.pos+=i[0].length,!0}}else{const i=e.src.slice(r).match(Eo);if(i){const a=Ja(i[0]);if(a!==i[0]){if(!t){const s=e.push("text_special","",0);s.content=a,s.markup=i[0],s.info="entity"}return e.pos+=i[0].length,!0}}}return!1}function Nu(e){const t={},r=e.length;if(!r)return;let u=0,n=-2;const i=[];for(let a=0;a<r;a++){const s=e[a];if(i.push(0),(e[u].marker!==s.marker||n!==s.token-1)&&(u=a),n=s.token,s.length=s.length||0,!s.close)continue;t.hasOwnProperty(s.marker)||(t[s.marker]=[-1,-1,-1,-1,-1,-1]);const o=t[s.marker][(s.open?3:0)+s.length%3];let c=u-i[u]-1,l=c;for(;c>o;c-=i[c]+1){const d=e[c];if(d.marker===s.marker&&d.open&&d.end<0){let h=!1;if((d.close||s.open)&&(d.length+s.length)%3===0&&(d.length%3!==0||s.length%3!==0)&&(h=!0),!h){const f=c>0&&!e[c-1].open?i[c-1]+1:0;i[a]=a-c+f,i[c]=f,s.open=!1,d.end=a,d.close=!1,l=-1,n=-2;break}}}l!==-1&&(t[s.marker][(s.open?3:0)+(s.length||0)%3]=l)}}function Do(e){const t=e.tokens_meta,r=e.tokens_meta.length;Nu(e.delimiters);for(let u=0;u<r;u++)t[u]&&t[u].delimiters&&Nu(t[u].delimiters)}function To(e){let t,r,u=0;const n=e.tokens,i=e.tokens.length;for(t=r=0;t<i;t++)n[t].nesting<0&&u--,n[t].level=u,n[t].nesting>0&&u++,n[t].type==="text"&&t+1<i&&n[t+1].type==="text"?n[t+1].content=n[t].content+n[t+1].content:(t!==r&&(n[r]=n[t]),r++);t!==r&&(n.length=r)}const tr=[["text",io],["linkify",so],["newline",oo],["escape",co],["backticks",lo],["strikethrough",Mu.tokenize],["emphasis",Ru.tokenize],["link",mo],["image",bo],["autolink",_o],["html_inline",Ao],["entity",So]],rr=[["balance_pairs",Do],["strikethrough",Mu.postProcess],["emphasis",Ru.postProcess],["fragments_join",To]];function tt(){this.ruler=new L;for(let e=0;e<tr.length;e++)this.ruler.push(tr[e][0],tr[e][1]);this.ruler2=new L;for(let e=0;e<rr.length;e++)this.ruler2.push(rr[e][0],rr[e][1])}tt.prototype.skipToken=function(e){const t=e.pos,r=this.ruler.getRules(""),u=r.length,n=e.md.options.maxNesting,i=e.cache;if(typeof i[t]<"u"){e.pos=i[t];return}let a=!1;if(e.level<n){for(let s=0;s<u;s++)if(e.level++,a=r[s](e,!0),e.level--,a){if(t>=e.pos)throw new Error("inline rule didn't increment state.pos");break}}else e.pos=e.posMax;a||e.pos++,i[t]=e.pos},tt.prototype.tokenize=function(e){const t=this.ruler.getRules(""),r=t.length,u=e.posMax,n=e.md.options.maxNesting;for(;e.pos<u;){const i=e.pos;let a=!1;if(e.level<n){for(let s=0;s<r;s++)if(a=t[s](e,!1),a){if(i>=e.pos)throw new Error("inline rule didn't increment state.pos");break}}if(a){if(e.pos>=u)break;continue}e.pending+=e.src[e.pos++]}e.pending&&e.pushPending()},tt.prototype.parse=function(e,t,r,u){const n=new this.State(e,t,r,u);this.tokenize(n);const i=this.ruler2.getRules(""),a=i.length;for(let s=0;s<a;s++)i[s](n)},tt.prototype.State=et;function $o(e){const t={};e=e||{},t.src_Any=fu.source,t.src_Cc=hu.source,t.src_Z=mu.source,t.src_P=Gt.source,t.src_ZPCc=[t.src_Z,t.src_P,t.src_Cc].join("|"),t.src_ZCc=[t.src_Z,t.src_Cc].join("|");const r="[><｜]";return t.src_pseudo_letter="(?:(?!"+r+"|"+t.src_ZPCc+")"+t.src_Any+")",t.src_ip4="(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",t.src_auth="(?:(?:(?!"+t.src_ZCc+"|[@/\\[\\]()]).)+@)?",t.src_port="(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?",t.src_host_terminator="(?=$|"+r+"|"+t.src_ZPCc+")(?!"+(e["---"]?"-(?!--)|":"-|")+"_|:\\d|\\.-|\\.(?!$|"+t.src_ZPCc+"))",t.src_path="(?:[/?#](?:(?!"+t.src_ZCc+"|"+r+`|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!`+t.src_ZCc+"|\\]).)*\\]|\\((?:(?!"+t.src_ZCc+"|[)]).)*\\)|\\{(?:(?!"+t.src_ZCc+'|[}]).)*\\}|\\"(?:(?!'+t.src_ZCc+`|["]).)+\\"|\\'(?:(?!`+t.src_ZCc+"|[']).)+\\'|\\'(?="+t.src_pseudo_letter+"|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!"+t.src_ZCc+"|[.]|$)|"+(e["---"]?"\\-(?!--(?:[^-]|$))(?:-*)|":"\\-+|")+",(?!"+t.src_ZCc+"|$)|;(?!"+t.src_ZCc+"|$)|\\!+(?!"+t.src_ZCc+"|[!]|$)|\\?(?!"+t.src_ZCc+"|[?]|$))+|\\/)?",t.src_email_name='[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*',t.src_xn="xn--[a-z0-9\\-]{1,59}",t.src_domain_root="(?:"+t.src_xn+"|"+t.src_pseudo_letter+"{1,63})",t.src_domain="(?:"+t.src_xn+"|(?:"+t.src_pseudo_letter+")|(?:"+t.src_pseudo_letter+"(?:-|"+t.src_pseudo_letter+"){0,61}"+t.src_pseudo_letter+"))",t.src_host="(?:(?:(?:(?:"+t.src_domain+")\\.)*"+t.src_domain+"))",t.tpl_host_fuzzy="(?:"+t.src_ip4+"|(?:(?:(?:"+t.src_domain+")\\.)+(?:%TLDS%)))",t.tpl_host_no_ip_fuzzy="(?:(?:(?:"+t.src_domain+")\\.)+(?:%TLDS%))",t.src_host_strict=t.src_host+t.src_host_terminator,t.tpl_host_fuzzy_strict=t.tpl_host_fuzzy+t.src_host_terminator,t.src_host_port_strict=t.src_host+t.src_port+t.src_host_terminator,t.tpl_host_port_fuzzy_strict=t.tpl_host_fuzzy+t.src_port+t.src_host_terminator,t.tpl_host_port_no_ip_fuzzy_strict=t.tpl_host_no_ip_fuzzy+t.src_port+t.src_host_terminator,t.tpl_host_fuzzy_test="localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:"+t.src_ZPCc+"|>|$))",t.tpl_email_fuzzy="(^|"+r+'|"|\\(|'+t.src_ZCc+")("+t.src_email_name+"@"+t.tpl_host_fuzzy_strict+")",t.tpl_link_fuzzy="(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|"+t.src_ZPCc+"))((?![$+<=>^`|｜])"+t.tpl_host_port_fuzzy_strict+t.src_path+")",t.tpl_link_no_ip_fuzzy="(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|"+t.src_ZPCc+"))((?![$+<=>^`|｜])"+t.tpl_host_port_no_ip_fuzzy_strict+t.src_path+")",t}function ur(e){return Array.prototype.slice.call(arguments,1).forEach(function(r){r&&Object.keys(r).forEach(function(u){e[u]=r[u]})}),e}function xt(e){return Object.prototype.toString.call(e)}function Po(e){return xt(e)==="[object String]"}function Fo(e){return xt(e)==="[object Object]"}function Mo(e){return xt(e)==="[object RegExp]"}function zu(e){return xt(e)==="[object Function]"}function Io(e){return e.replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")}const Ou={fuzzyLink:!0,fuzzyEmail:!0,fuzzyIP:!1};function Ro(e){return Object.keys(e||{}).reduce(function(t,r){return t||Ou.hasOwnProperty(r)},!1)}const No={"http:":{validate:function(e,t,r){const u=e.slice(t);return r.re.http||(r.re.http=new RegExp("^\\/\\/"+r.re.src_auth+r.re.src_host_port_strict+r.re.src_path,"i")),r.re.http.test(u)?u.match(r.re.http)[0].length:0}},"https:":"http:","ftp:":"http:","//":{validate:function(e,t,r){const u=e.slice(t);return r.re.no_http||(r.re.no_http=new RegExp("^"+r.re.src_auth+"(?:localhost|(?:(?:"+r.re.src_domain+")\\.)+"+r.re.src_domain_root+")"+r.re.src_port+r.re.src_host_terminator+r.re.src_path,"i")),r.re.no_http.test(u)?t>=3&&e[t-3]===":"||t>=3&&e[t-3]==="/"?0:u.match(r.re.no_http)[0].length:0}},"mailto:":{validate:function(e,t,r){const u=e.slice(t);return r.re.mailto||(r.re.mailto=new RegExp("^"+r.re.src_email_name+"@"+r.re.src_host_strict,"i")),r.re.mailto.test(u)?u.match(r.re.mailto)[0].length:0}}},zo="a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]",Oo="biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");function Lo(e){return function(t,r){const u=t.slice(r);return e.test(u)?u.match(e)[0].length:0}}function Lu(){return function(e,t){t.normalize(e)}}function yt(e){const t=e.re=$o(e.__opts__),r=e.__tlds__.slice();e.onCompile(),e.__tlds_replaced__||r.push(zo),r.push(t.src_xn),t.src_tlds=r.join("|");function u(s){return s.replace("%TLDS%",t.src_tlds)}t.email_fuzzy=RegExp(u(t.tpl_email_fuzzy),"i"),t.email_fuzzy_global=RegExp(u(t.tpl_email_fuzzy),"ig"),t.link_fuzzy=RegExp(u(t.tpl_link_fuzzy),"i"),t.link_fuzzy_global=RegExp(u(t.tpl_link_fuzzy),"ig"),t.link_no_ip_fuzzy=RegExp(u(t.tpl_link_no_ip_fuzzy),"i"),t.link_no_ip_fuzzy_global=RegExp(u(t.tpl_link_no_ip_fuzzy),"ig"),t.host_fuzzy_test=RegExp(u(t.tpl_host_fuzzy_test),"i");const n=[];e.__compiled__={};function i(s,o){throw new Error('(LinkifyIt) Invalid schema "'+s+'": '+o)}Object.keys(e.__schemas__).forEach(function(s){const o=e.__schemas__[s];if(o===null)return;const c={validate:null,link:null};if(e.__compiled__[s]=c,Fo(o)){Mo(o.validate)?c.validate=Lo(o.validate):zu(o.validate)?c.validate=o.validate:i(s,o),zu(o.normalize)?c.normalize=o.normalize:o.normalize?i(s,o):c.normalize=Lu();return}if(Po(o)){n.push(s);return}i(s,o)}),n.forEach(function(s){e.__compiled__[e.__schemas__[s]]&&(e.__compiled__[s].validate=e.__compiled__[e.__schemas__[s]].validate,e.__compiled__[s].normalize=e.__compiled__[e.__schemas__[s]].normalize)}),e.__compiled__[""]={validate:null,normalize:Lu()};const a=Object.keys(e.__compiled__).filter(function(s){return s.length>0&&e.__compiled__[s]}).map(Io).join("|");e.re.schema_test=RegExp("(^|(?!_)(?:[><｜]|"+t.src_ZPCc+"))("+a+")","i"),e.re.schema_search=RegExp("(^|(?!_)(?:[><｜]|"+t.src_ZPCc+"))("+a+")","ig"),e.re.schema_at_start=RegExp("^"+e.re.schema_search.source,"i"),e.re.pretest=RegExp("("+e.re.schema_test.source+")|("+e.re.host_fuzzy_test.source+")|@","i")}function Bu(e,t,r,u){const n=e.slice(r,u);this.schema=t.toLowerCase(),this.index=r,this.lastIndex=u,this.raw=n,this.text=n,this.url=n}function U(e,t){if(!(this instanceof U))return new U(e,t);t||Ro(e)&&(t=e,e={}),this.__opts__=ur({},Ou,t),this.__schemas__=ur({},No,e),this.__compiled__={},this.__tlds__=Oo,this.__tlds_replaced__=!1,this.re={},yt(this)}U.prototype.add=function(t,r){return this.__schemas__[t]=r,yt(this),this},U.prototype.set=function(t){return this.__opts__=ur(this.__opts__,t),this},U.prototype.test=function(t){if(!t.length)return!1;let r,u;if(this.re.schema_test.test(t)){for(u=this.re.schema_search,u.lastIndex=0;(r=u.exec(t))!==null;)if(this.testSchemaAt(t,r[2],u.lastIndex))return!0}return!!(this.__opts__.fuzzyLink&&this.__compiled__["http:"]&&t.search(this.re.host_fuzzy_test)>=0&&t.match(this.__opts__.fuzzyIP?this.re.link_fuzzy:this.re.link_no_ip_fuzzy)!==null||this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"]&&t.indexOf("@")>=0&&t.match(this.re.email_fuzzy)!==null)},U.prototype.pretest=function(t){return this.re.pretest.test(t)},U.prototype.testSchemaAt=function(t,r,u){return this.__compiled__[r.toLowerCase()]?this.__compiled__[r.toLowerCase()].validate(t,u,this):0},U.prototype.match=function(t){const r=[],u=[],n=[],i=[];let a,s,o;function c(h,f){return h?f?h.index!==f.index?h.index<f.index?h:f:h.lastIndex>=f.lastIndex?h:f:h:f}if(!t.length)return null;if(this.re.schema_test.test(t))for(o=this.re.schema_search,o.lastIndex=0;(a=o.exec(t))!==null;)s=this.testSchemaAt(t,a[2],o.lastIndex),s&&u.push({schema:a[2],index:a.index+a[1].length,lastIndex:a.index+a[0].length+s});if(this.__opts__.fuzzyLink&&this.__compiled__["http:"])for(o=this.__opts__.fuzzyIP?this.re.link_fuzzy_global:this.re.link_no_ip_fuzzy_global,o.lastIndex=0;(a=o.exec(t))!==null;)n.push({schema:"",index:a.index+a[1].length,lastIndex:a.index+a[0].length});if(this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"])for(o=this.re.email_fuzzy_global,o.lastIndex=0;(a=o.exec(t))!==null;)i.push({schema:"mailto:",index:a.index+a[1].length,lastIndex:a.index+a[0].length});const l=[0,0,0];let d=0;for(;;){const h=[u[l[0]],i[l[1]],n[l[2]]],f=c(c(h[0],h[1]),h[2]);if(!f)break;if(f===h[0]?l[0]++:f===h[1]?l[1]++:l[2]++,f.index<d)continue;const p=new Bu(t,f.schema,f.index,f.lastIndex);this.__compiled__[p.schema].normalize(p,this),r.push(p),d=f.lastIndex}return r.length?r:null},U.prototype.matchAtStart=function(t){if(!t.length)return null;const r=this.re.schema_at_start.exec(t);if(!r)return null;const u=this.testSchemaAt(t,r[2],r[0].length);if(!u)return null;const n=new Bu(t,r[2],r.index+r[1].length,r.index+r[0].length+u);return this.__compiled__[n.schema].normalize(n,this),n},U.prototype.tlds=function(t,r){return t=Array.isArray(t)?t:[t],r?(this.__tlds__=this.__tlds__.concat(t).sort().filter(function(u,n,i){return u!==i[n-1]}).reverse(),yt(this),this):(this.__tlds__=t.slice(),this.__tlds_replaced__=!0,yt(this),this)},U.prototype.normalize=function(t){t.schema||(t.url="http://"+t.url),t.schema==="mailto:"&&!/^mailto:/i.test(t.url)&&(t.url="mailto:"+t.url)},U.prototype.onCompile=function(){};const Te=2147483647,X=36,nr=1,rt=26,Bo=38,Uo=700,Uu=72,qu=128,Hu="-",qo=/^xn--/,Ho=/[^\0-\x7F]/,jo=/[\x2E\u3002\uFF0E\uFF61]/g,Wo={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},ir=X-nr,K=Math.floor,ar=String.fromCharCode;function se(e){throw new RangeError(Wo[e])}function Go(e,t){const r=[];let u=e.length;for(;u--;)r[u]=t(e[u]);return r}function ju(e,t){const r=e.split("@");let u="";r.length>1&&(u=r[0]+"@",e=r[1]),e=e.replace(jo,".");const n=e.split("."),i=Go(n,t).join(".");return u+i}function Wu(e){const t=[];let r=0;const u=e.length;for(;r<u;){const n=e.charCodeAt(r++);if(n>=55296&&n<=56319&&r<u){const i=e.charCodeAt(r++);(i&64512)==56320?t.push(((n&1023)<<10)+(i&1023)+65536):(t.push(n),r--)}else t.push(n)}return t}const Vo=e=>String.fromCodePoint(...e),Zo=function(e){return e>=48&&e<58?26+(e-48):e>=65&&e<91?e-65:e>=97&&e<123?e-97:X},Gu=function(e,t){return e+22+75*(e<26)-((t!=0)<<5)},Vu=function(e,t,r){let u=0;for(e=r?K(e/Uo):e>>1,e+=K(e/t);e>ir*rt>>1;u+=X)e=K(e/ir);return K(u+(ir+1)*e/(e+Bo))},Zu=function(e){const t=[],r=e.length;let u=0,n=qu,i=Uu,a=e.lastIndexOf(Hu);a<0&&(a=0);for(let s=0;s<a;++s)e.charCodeAt(s)>=128&&se("not-basic"),t.push(e.charCodeAt(s));for(let s=a>0?a+1:0;s<r;){const o=u;for(let l=1,d=X;;d+=X){s>=r&&se("invalid-input");const h=Zo(e.charCodeAt(s++));h>=X&&se("invalid-input"),h>K((Te-u)/l)&&se("overflow"),u+=h*l;const f=d<=i?nr:d>=i+rt?rt:d-i;if(h<f)break;const p=X-f;l>K(Te/p)&&se("overflow"),l*=p}const c=t.length+1;i=Vu(u-o,c,o==0),K(u/c)>Te-n&&se("overflow"),n+=K(u/c),u%=c,t.splice(u++,0,n)}return String.fromCodePoint(...t)},Yu=function(e){const t=[];e=Wu(e);const r=e.length;let u=qu,n=0,i=Uu;for(const o of e)o<128&&t.push(ar(o));const a=t.length;let s=a;for(a&&t.push(Hu);s<r;){let o=Te;for(const l of e)l>=u&&l<o&&(o=l);const c=s+1;o-u>K((Te-n)/c)&&se("overflow"),n+=(o-u)*c,u=o;for(const l of e)if(l<u&&++n>Te&&se("overflow"),l===u){let d=n;for(let h=X;;h+=X){const f=h<=i?nr:h>=i+rt?rt:h-i;if(d<f)break;const p=d-f,k=X-f;t.push(ar(Gu(f+p%k,0))),d=K(p/k)}t.push(ar(Gu(d,0))),i=Vu(n,c,s===a),n=0,++s}++n,++u}return t.join("")},Ju={version:"2.3.1",ucs2:{decode:Wu,encode:Vo},decode:Zu,encode:Yu,toASCII:function(e){return ju(e,function(t){return Ho.test(t)?"xn--"+Yu(t):t})},toUnicode:function(e){return ju(e,function(t){return qo.test(t)?Zu(t.slice(4).toLowerCase()):t})}},Yo={default:{options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:100},components:{core:{},block:{},inline:{}}},zero:{options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["paragraph"]},inline:{rules:["text"],rules2:["balance_pairs","fragments_join"]}}},commonmark:{options:{html:!0,xhtmlOut:!0,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["blockquote","code","fence","heading","hr","html_block","lheading","list","reference","paragraph"]},inline:{rules:["autolink","backticks","emphasis","entity","escape","html_inline","image","link","newline","text"],rules2:["balance_pairs","emphasis","fragments_join"]}}}},Jo=/^(vbscript|javascript|file|data):/,Qo=/^data:image\/(gif|png|jpeg|webp);/;function Xo(e){const t=e.trim().toLowerCase();return Jo.test(t)?Qo.test(t):!0}const Qu=["http:","https:","mailto:"];function Ko(e){const t=Wt(e,!0);if(t.hostname&&(!t.protocol||Qu.indexOf(t.protocol)>=0))try{t.hostname=Ju.toASCII(t.hostname)}catch{}return Ye(jt(t))}function e0(e){const t=Wt(e,!0);if(t.hostname&&(!t.protocol||Qu.indexOf(t.protocol)>=0))try{t.hostname=Ju.toUnicode(t.hostname)}catch{}return Ee(jt(t),Ee.defaultChars+"%")}function j(e,t){if(!(this instanceof j))return new j(e,t);t||Yt(e)||(t=e||{},e="default"),this.inline=new tt,this.block=new bt,this.core=new Xt,this.renderer=new De,this.linkify=new U,this.validateLink=Xo,this.normalizeLink=Ko,this.normalizeLinkText=e0,this.utils=ds,this.helpers=pt({},gs),this.options={},this.configure(e),t&&this.set(t)}j.prototype.set=function(e){return pt(this.options,e),this},j.prototype.configure=function(e){const t=this;if(Yt(e)){const r=e;if(e=Yo[r],!e)throw new Error('Wrong `markdown-it` preset "'+r+'", check name')}if(!e)throw new Error("Wrong `markdown-it` preset, can't be empty");return e.options&&t.set(e.options),e.components&&Object.keys(e.components).forEach(function(r){e.components[r].rules&&t[r].ruler.enableOnly(e.components[r].rules),e.components[r].rules2&&t[r].ruler2.enableOnly(e.components[r].rules2)}),this},j.prototype.enable=function(e,t){let r=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(n){r=r.concat(this[n].ruler.enable(e,!0))},this),r=r.concat(this.inline.ruler2.enable(e,!0));const u=e.filter(function(n){return r.indexOf(n)<0});if(u.length&&!t)throw new Error("MarkdownIt. Failed to enable unknown rule(s): "+u);return this},j.prototype.disable=function(e,t){let r=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(n){r=r.concat(this[n].ruler.disable(e,!0))},this),r=r.concat(this.inline.ruler2.disable(e,!0));const u=e.filter(function(n){return r.indexOf(n)<0});if(u.length&&!t)throw new Error("MarkdownIt. Failed to disable unknown rule(s): "+u);return this},j.prototype.use=function(e){const t=[this].concat(Array.prototype.slice.call(arguments,1));return e.apply(e,t),this},j.prototype.parse=function(e,t){if(typeof e!="string")throw new Error("Input data should be a String");const r=new this.core.State(e,this,t);return this.core.process(r),r.tokens},j.prototype.render=function(e,t){return t=t||{},this.renderer.render(this.parse(e,t),this.options,t)},j.prototype.parseInline=function(e,t){const r=new this.core.State(e,this,t);return r.inlineMode=!0,this.core.process(r),r.tokens},j.prototype.renderInline=function(e,t){return t=t||{},this.renderer.render(this.parseInline(e,t),this.options,t)};const _t=new j({breaks:!0,html:!1,linkify:!1,typographer:!1}),t0=_t.renderer.rules.link_open??((e,t,r,u,n)=>n.renderToken(e,t,r));_t.renderer.rules.link_open=(e,t,r,u,n)=>{const i=e[t],a=i.attrGet("href");return a&&!_t.validateLink(a)&&i.attrSet("href",""),i.attrSet("target","_blank"),i.attrSet("rel","noopener noreferrer"),t0(e,t,r,u,n)};function $e(e=new Date){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function Xu(e){return _t.render(r0(e))}function r0(e){return e.replace(/\r\n?/g,`
`).replace(/([^\n])---(?=#{1,6})/g,`$1

---

`).replace(/(^|\n)---(?=#{1,6})/g,`$1---

`).replace(/([^\n#])(#{1,6})(?=[^\s#])/g,`$1

$2`).replace(/(^|\n)(#{1,6})(?=[^\s#])/g,"$1$2 ").replace(/([:：])-(?=(?:\*\*|【|[\p{L}\p{N}]))/gu,`$1
- `).replace(/([^\n])-(?=\*\*)/g,`$1
- `).replace(/(^|\n)-(?=\S)/g,"$1- ")}const u0=_e`
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
    --rag-input-surface-resolved: #fdfdfd;
    --rag-user-message-start: var(--rag-gold);
    --rag-user-message-end: var(--rag-gold-strong);
    --rag-ring: rgba(161, 98, 7, 0.42);
    --rag-frost: rgba(255, 255, 255, 0.96);
    --rag-primary-glow: rgba(161, 98, 7, 0.16);
    --rag-code-surface: rgba(24, 24, 27, 0.07);
    --rag-link: #85510a;
    --rag-highlight-surface: #f5f2ed;
    --rag-hover-border: rgba(161, 98, 7, 0.28);
    --rag-error-text: #9f1d1d;
    --rag-error-surface: #fff7f7;
    --rag-error-border: rgba(220, 38, 38, 0.24);
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
      0 0 0 3px var(--rag-primary-glow),
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
`,n0=_e`
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
    border: 1px solid var(--rag-line);
    border-radius: 16px;
    background: var(--rag-input-surface-resolved);
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
      0 0 0 3px var(--rag-primary-glow),
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
    color: var(--rag-muted);
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
      linear-gradient(180deg, var(--rag-user-message-start), var(--rag-gold-strong));
    box-shadow:
      0 8px 18px var(--rag-primary-glow),
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
`,i0=_e`
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
  .markdown-body h4,
  .markdown-body h5,
  .markdown-body h6 {
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
    color: var(--rag-text);
  }

  .markdown-body hr {
    height: 1px;
    margin: 12px 0;
    border: 0;
    background: var(--rag-line);
  }

  .markdown-body code {
    padding: 1px 5px 2px;
    border-radius: 6px;
    background: var(--rag-code-surface);
    color: var(--rag-text);
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
    background: var(--rag-secondary-soft);
    color: var(--rag-text);
  }

  .markdown-body table {
    display: block;
    width: 100%;
    margin: 8px 0 10px;
    overflow-x: auto;
    border-collapse: collapse;
  }

  .markdown-body th,
  .markdown-body td {
    padding: 6px 8px;
    border: 1px solid var(--rag-line);
    text-align: left;
    vertical-align: top;
  }

  .markdown-body th {
    background: var(--rag-secondary-soft);
    font-weight: 820;
  }

  .markdown-body a {
    color: var(--rag-link);
    font-weight: 750;
    text-decoration: none;
    border-bottom: 1px solid var(--rag-ring);
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
    border: 1px solid var(--rag-line);
    border-radius: 13px;
    background: var(--rag-control-surface);
  }

  .pet-source-row {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr) 16px;
    align-items: start;
    gap: 7px;
    min-height: 32px;
    padding: 5px 7px;
    border-radius: 10px;
    color: var(--rag-text);
    text-decoration: none;
    transition:
      background 0.14s ease,
      color 0.14s ease;
  }

  .pet-source-row:hover {
    color: var(--rag-text);
    background: var(--rag-highlight-surface);
  }

  .pet-source-icon,
  .pet-source-open {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--rag-link);
  }

  .pet-source-icon {
    width: 22px;
    height: 22px;
    margin-top: 1px;
    border-radius: 8px;
    background: var(--rag-gold-faint);
  }

  .pet-source-main {
    display: grid;
    min-width: 0;
    gap: 2px;
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

  .pet-source-meta {
    overflow: hidden;
    color: var(--rag-muted);
    font-size: 10.5px;
    font-weight: 650;
    line-height: 1.25;
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
`,a0=_e`
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
      drop-shadow(0 0 14px var(--rag-ring));
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
    border: 1px solid var(--rag-line);
    border-radius: 16px;
    background:
      linear-gradient(180deg, var(--rag-header-surface), var(--rag-window-surface-2));
    color: var(--rag-text);
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
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(410px, calc(100vw - 32px));
    height: min(var(--rag-pet-panel-height, 318px), calc(var(--rag-viewport-height, 100vh) - 132px));
    padding: 13px;
    border: 1px solid var(--rag-line);
    border-radius: var(--rag-radius-panel, 20px);
    background:
      radial-gradient(circle at 14% 0%, var(--rag-primary-glow), transparent 34%),
      linear-gradient(180deg, var(--rag-window-surface), var(--rag-window-surface-2));
    box-shadow:
      0 22px 58px rgba(15, 23, 42, 0.18),
      0 8px 20px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
    text-align: left;
    overflow: hidden;
    transform-origin: bottom right;
    animation: pet-panel-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(18px) saturate(1.05);
    -webkit-backdrop-filter: blur(18px) saturate(1.05);
  }

  .pet-panel.resizing {
    animation: none;
    user-select: none;
  }

  .pet-panel-resize {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 2;
    width: 72px;
    height: 18px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    cursor: ns-resize;
    transform: translateX(-50%);
    touch-action: none;
  }

  .pet-panel-resize::before {
    content: "";
    position: absolute;
    top: 5px;
    left: 16px;
    right: 16px;
    height: 3px;
    border-radius: 999px;
    background: var(--rag-muted);
    opacity: 0.52;
    transition:
      opacity 0.14s ease,
      background 0.14s ease,
      transform 0.14s ease;
  }

  .pet-panel-resize:hover::before,
  .pet-panel-resize:focus-visible::before,
  .pet-panel.resizing .pet-panel-resize::before {
    opacity: 0.9;
    background: var(--rag-hover-border);
    transform: scaleX(1.18);
  }

  .pet-panel-content {
    display: flex;
    flex-direction: column;
    min-height: 0;
    /* 网格项默认 min-width: auto，代码块的 min-content 宽度会把内容撑出面板并被裁掉 */
    min-width: 0;
  }

  .pet-panel-thread {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    margin-bottom: 10px;
    overflow: auto;
    padding: 2px 2px 4px;
    scroll-behavior: smooth;
    scrollbar-width: thin;
  }

  .pet-panel-message {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-width: 92%;
    min-width: 0;
  }

  .pet-panel-message.user {
    align-self: flex-end;
    align-items: flex-end;
  }

  .pet-panel-message.assistant {
    align-self: flex-start;
    align-items: flex-start;
  }

  .pet-panel-message-meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--rag-muted);
    font-size: 10.5px;
    font-weight: 680;
    line-height: 1;
  }

  .pet-message-actions {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    opacity: 0;
    transform: translateY(1px);
    transition:
      opacity 0.14s ease,
      transform 0.14s ease;
  }

  .pet-panel-message:hover .pet-message-actions,
  .pet-panel-message:focus-within .pet-message-actions {
    opacity: 1;
    transform: translateY(0);
  }

  .pet-message-actions button {
    display: inline-grid;
    place-items: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid var(--rag-line);
    border-radius: 999px;
    color: var(--rag-muted);
    background: var(--rag-control-surface);
    cursor: pointer;
  }

  .pet-message-actions button:hover:not(:disabled) {
    color: var(--rag-link);
    border-color: var(--rag-hover-border);
  }

  .pet-message-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }

  .pet-message-actions svg,
  .pet-message-actions .iconify-icon {
    width: 12px;
    height: 12px;
  }

  .pet-panel-message-meta time {
    font-weight: 560;
  }

  .pet-panel-bubble {
    max-width: 100%;
    padding: 9px 10px;
    border: 1px solid var(--rag-line);
    border-radius: 14px;
    color: var(--rag-text);
    background: var(--rag-assistant-message-bg);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.54);
    font-size: 12.8px;
    line-height: 1.62;
    overflow-wrap: anywhere;
  }

  .pet-panel-message.user .pet-panel-bubble {
    color: var(--rag-primary-contrast);
    border-color: var(--rag-ring);
    background:
      linear-gradient(145deg, var(--rag-user-message-start), var(--rag-user-message-end));
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.18) inset,
      0 8px 18px var(--rag-primary-glow);
  }

  .pet-panel-bubble.error {
    color: var(--rag-error-text);
    border-color: var(--rag-error-border);
    background: var(--rag-error-surface);
  }

  .pet-panel-bubble.streaming {
    border-color: var(--rag-hover-border);
  }

  .pet-panel-sources {
    max-width: 100%;
  }

  .pet-panel-sources summary {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 24px;
    padding: 0 9px;
    border: 1px solid var(--rag-line);
    border-radius: 999px;
    color: var(--rag-link);
    background: var(--rag-highlight-surface);
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 760;
    list-style: none;
  }

  .pet-panel-sources summary::-webkit-details-marker {
    display: none;
  }

  .pet-panel-sources .pet-source-list {
    margin-top: 6px;
  }

  .pet-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .pet-panel-title-wrap {
    display: inline-grid;
    grid-template-columns: 32px minmax(0, 1fr);
    align-items: center;
    gap: 9px;
    min-width: 0;
  }

  .pet-panel-avatar {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    overflow: hidden;
    border-radius: 12px;
    color: var(--rag-primary-contrast);
    background:
      radial-gradient(circle at 34% 20%, rgba(255, 255, 255, 0.24), transparent 28%),
      linear-gradient(145deg, var(--rag-gold), var(--rag-gold-strong));
    box-shadow:
      0 0 0 1px var(--rag-ring),
      0 8px 18px var(--rag-primary-glow);
    font-size: 12px;
    font-weight: 840;
  }

  .pet-panel-avatar.has-image {
    background: var(--rag-control-surface);
  }

  .pet-panel-avatar-fallback {
    position: relative;
    z-index: 1;
  }

  .pet-panel-avatar.has-image .pet-panel-avatar-fallback {
    opacity: 0;
  }

  .pet-panel-avatar-image {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pet-panel-title {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .pet-panel-kicker {
    overflow: hidden;
    color: var(--rag-muted);
    font-size: 11px;
    font-weight: 740;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-panel-title strong {
    max-width: 220px;
    overflow: hidden;
    color: var(--rag-text);
    font-size: 15px;
    font-weight: 850;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    border: 1px solid var(--rag-line);
    border-radius: 999px;
    color: var(--rag-text);
    background: var(--rag-control-surface);
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

  .pet-panel-action {
    position: relative;
    width: 32px;
    min-width: 32px;
    padding: 0;
  }

  .pet-panel-action[data-tooltip]::before,
  .pet-panel-action[data-tooltip]::after {
    position: absolute;
    right: 0;
    z-index: 8;
    pointer-events: none;
    opacity: 0;
    transform: translateY(3px);
    transition:
      opacity 0.14s ease,
      transform 0.14s ease;
  }

  .pet-panel-action[data-tooltip]::before {
    content: "";
    top: calc(100% + 3px);
    width: 8px;
    height: 8px;
    margin-right: 12px;
    border-left: 1px solid var(--rag-line);
    border-top: 1px solid var(--rag-line);
    background: var(--rag-control-surface);
    transform: translateY(3px) rotate(45deg);
  }

  .pet-panel-action[data-tooltip]::after {
    content: attr(data-tooltip);
    top: calc(100% + 7px);
    min-width: max-content;
    max-width: 160px;
    padding: 6px 8px;
    border: 1px solid var(--rag-line);
    border-radius: 9px;
    color: var(--rag-text);
    background: var(--rag-control-surface);
    box-shadow:
      0 10px 24px rgba(15, 23, 42, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.58);
    font-size: 11px;
    font-weight: 760;
    line-height: 1;
    white-space: nowrap;
  }

  .pet-panel-action[data-tooltip]:hover::before,
  .pet-panel-action[data-tooltip]:hover::after,
  .pet-panel-action[data-tooltip]:focus-visible::before,
  .pet-panel-action[data-tooltip]:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
  }

  .pet-panel-action[data-tooltip]:hover::before,
  .pet-panel-action[data-tooltip]:focus-visible::before {
    transform: translateY(0) rotate(45deg);
  }

  .pet-panel-action.is-primary {
    color: var(--rag-primary-contrast);
    border-color: var(--rag-ring);
    background: linear-gradient(180deg, var(--rag-user-message-start), var(--rag-gold-strong));
  }

  .pet-panel-action.is-danger {
    color: var(--rag-error-text);
    border-color: var(--rag-error-border);
    background: var(--rag-error-surface);
  }

  .pet-panel-action:hover,
  .pet-source-link:hover {
    transform: translateY(-1px);
    color: var(--rag-text);
    border-color: var(--rag-hover-border);
    background: var(--rag-paper);
  }

  .pet-panel-action.is-primary:hover {
    color: var(--rag-primary-contrast);
    background: linear-gradient(180deg, var(--rag-user-message-start), var(--rag-gold-strong));
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
    min-height: 0;
    margin-bottom: 10px;
    border-radius: 14px;
  }

  .pet-context {
    position: relative;
    display: grid;
    gap: 4px;
    padding: 8px 34px 8px 10px;
    border: 1px solid var(--rag-hover-border);
    background: var(--rag-highlight-surface);
  }

  .pet-context span {
    color: var(--rag-link);
    font-size: 11px;
    font-weight: 820;
    line-height: 1;
  }

  .pet-context p {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    color: var(--rag-text);
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
    color: var(--rag-muted);
    background: transparent;
    cursor: pointer;
  }

  .pet-answer {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: 10px;
    border: 1px solid var(--rag-line);
    background: var(--rag-control-surface);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.54);
  }

  .pet-answer.error {
    border-color: var(--rag-error-border);
    background: var(--rag-error-surface);
  }

  .pet-answer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 7px;
    color: var(--rag-muted);
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
    flex: 1 1 auto;
    max-height: none;
    min-height: 0;
    overflow: auto;
    color: var(--rag-text);
    font-size: 12.8px;
    line-height: 1.62;
    scrollbar-width: thin;
  }

  .pet-source-link {
    margin-top: 8px;
    min-height: 26px;
    color: var(--rag-link);
    background: var(--rag-highlight-surface);
  }

  .pet-panel-empty {
    flex: 1 1 auto;
    display: grid;
    align-content: start;
    gap: 10px;
    padding: 11px;
    overflow: auto;
    border: 1px dashed var(--rag-line);
    color: var(--rag-muted);
    background: var(--rag-window-surface);
  }

  .pet-panel-welcome {
    margin: 0;
    color: var(--rag-text);
    font-size: 12.8px;
    font-weight: 680;
    line-height: 1.58;
    white-space: pre-line;
  }

  .pet-panel-quick {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }

  .pet-panel-quick button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    min-height: 28px;
    padding: 0 9px;
    border: 1px solid var(--rag-line);
    border-radius: 999px;
    color: var(--rag-text);
    background: var(--rag-control-surface);
    box-shadow: 0 5px 12px rgba(15, 23, 42, 0.04);
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 760;
    line-height: 1;
    transition:
      transform 0.14s ease,
      color 0.14s ease,
      background 0.14s ease,
      border-color 0.14s ease;
  }

  .pet-panel-quick button:hover {
    transform: translateY(-1px);
    color: var(--rag-text);
    border-color: var(--rag-hover-border);
    background: var(--rag-paper);
  }

  .pet-panel-quick svg,
  .pet-panel-quick .iconify-icon {
    flex: 0 0 auto;
    width: 13px;
    height: 13px;
  }

  .pet-panel-quick span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (hover: none) {
    .pet-message-actions {
      opacity: 1;
      transform: none;
    }
  }
`,s0=_e`
  .pet-stage-backdrop,
  .pet-stage {
    position: fixed;
    top: var(--rag-viewport-top, 0px);
    left: var(--rag-viewport-left, 0px);
    width: var(--rag-viewport-width, 100vw);
    height: var(--rag-viewport-height, 100vh);
  }

  .pet-stage-backdrop {
    z-index: 99997;
    background:
      radial-gradient(circle at 50% 28%, rgba(32, 68, 148, 0.2), transparent 34%),
      radial-gradient(circle at 34% 72%, var(--rag-primary-glow), transparent 28%),
      linear-gradient(180deg, rgba(8, 10, 16, 0.86), rgba(5, 7, 12, 0.94));
    backdrop-filter: blur(5px) saturate(0.9);
    -webkit-backdrop-filter: blur(5px) saturate(0.9);
    animation: stage-backdrop-in 0.2s ease-out;
  }

  .pet-stage {
    z-index: 99999;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: clamp(12px, 2vh, 22px);
    min-width: 0;
    min-height: 0;
    overflow: hidden;
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
    flex: 1;
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
    flex: 0 0 44px;
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

  .pet-stage-action.is-danger {
    color: rgba(255, 226, 226, 0.96);
    border-color: rgba(248, 113, 113, 0.24);
    background: rgba(127, 29, 29, 0.28);
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
      0 0 0 1px var(--rag-ring),
      0 5px 14px var(--rag-primary-glow);
    font-size: 12px;
    font-weight: 820;
    overflow: hidden;
  }

  .pet-stage-avatar.has-image {
    background: var(--rag-control-surface);
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
    border-color: var(--rag-hover-border);
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
    border-color: var(--rag-ring);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.16) inset,
      0 8px 18px var(--rag-primary-glow);
  }

  .pet-stage-message-actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    opacity: 0;
    transform: translateY(2px);
    transition:
      opacity 0.14s ease,
      transform 0.14s ease;
  }

  .pet-stage-message:hover .pet-stage-message-actions,
  .pet-stage-message:focus-within .pet-stage-message-actions {
    opacity: 1;
    transform: translateY(0);
  }

  .pet-stage-message-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 26px;
    padding: 0 9px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.11);
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 740;
    backdrop-filter: blur(14px) saturate(1.06);
    -webkit-backdrop-filter: blur(14px) saturate(1.06);
  }

  .pet-stage-message-actions button:hover:not(:disabled) {
    color: #fff;
    background: rgba(255, 255, 255, 0.17);
  }

  .pet-stage-message-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }

  .pet-stage-message-actions svg,
  .pet-stage-message-actions .iconify-icon {
    width: 13px;
    height: 13px;
  }

  .pet-stage-message.user .pet-stage-message-actions button {
    color: var(--rag-muted);
    border-color: var(--rag-line);
    background: var(--rag-control-surface);
  }

  .pet-stage .markdown-body h1,
  .pet-stage .markdown-body h2,
  .pet-stage .markdown-body h3,
  .pet-stage .markdown-body h4,
  .pet-stage .markdown-body h5,
  .pet-stage .markdown-body h6 {
    color: rgba(255, 255, 255, 0.94);
  }

  .pet-stage .markdown-body hr {
    background: rgba(255, 255, 255, 0.18);
  }

  .pet-stage .markdown-body code {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.92);
  }

  .pet-stage .markdown-body blockquote {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.78);
  }

  .pet-stage .markdown-body th,
  .pet-stage .markdown-body td {
    border-color: rgba(255, 255, 255, 0.16);
  }

  .pet-stage .markdown-body th {
    background: rgba(255, 255, 255, 0.11);
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
    min-width: 0;
    min-height: 0;
    max-height: calc(var(--rag-viewport-height, 100vh) * 0.48);
    overflow-y: auto;
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
      height: min(var(--rag-pet-panel-height, 318px), calc(var(--rag-viewport-height, 100vh) - 132px));
      overflow: hidden;
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
      padding-top: max(14px, env(safe-area-inset-top, 0px));
      padding-right: max(12px, env(safe-area-inset-right, 0px));
      padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
      padding-left: max(12px, env(safe-area-inset-left, 0px));
    }

    .pet-stage-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 44px;
      gap: 10px;
    }

    .pet-stage-title {
      grid-column: 1;
      grid-row: 1;
    }

    .pet-stage-close {
      grid-column: 2;
      grid-row: 1;
    }

    .pet-stage-actions {
      grid-column: 1 / -1;
      grid-row: 2;
      min-width: 0;
      flex-wrap: wrap;
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
`;function oe(e){return/^mcp_[a-f0-9]{12}_[a-z0-9_]{1,47}$/.test(e)}function Ku(e){return e.replace(/^mcp_[a-f0-9]{12}_/,"").replace(/_/g," ")}function o0(e){return e.map(t=>({...t,parts:t.parts.map(r=>{if(!r.type.startsWith("tool-"))return r;const u=r,n=Pe(u.output);return!oe(u.toolName)||n?.kind!=="mcp"||!Array.isArray(n.content)?r:{...u,output:{...n,content:n.content.map(i=>Pe(i)?.type!=="image"?i:{type:"text",text:"外部工具返回了一张图片，已在前台展示。"})}}})}))}function Pe(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:void 0}function sr(e){if(typeof e=="string")try{const t=new URL(e);return["http:","https:"].includes(t.protocol)&&!t.username&&!t.password?t.href:void 0}catch{return}}function c0(e){const t=new Set;for(const r of e)if(r.type==="text")for(const u of(r.text||"").matchAll(/https?:\/\/[^\s<>"'\]})]+/g)){const n=sr(u[0].replace(/[.,;:!?，。；：！？]+$/,""));if(n&&n.length<=2e3&&t.add(n),t.size>=12)return[...t]}return[...t]}function en(e){const t=new Map;for(const r of e)for(const u of r.parts){if(!u.type.startsWith("tool-"))continue;const n=u;if(!oe(n.toolName))continue;const i=Pe(n.output),a=[];for(const c of Array.isArray(i?.content)?i.content.slice(0,12):[]){const l=Pe(c);if(l)if(l.type==="text"&&typeof l.text=="string")a.push({type:"text",text:l.text.slice(0,16e3)});else if(l.type==="link"){const d=sr(l.url);d&&a.push({type:"link",url:d,title:String(l.title||"查看资源").slice(0,200)})}else l.type==="image"&&typeof l.data=="string"&&l.data.length<=14e5&&/^[A-Za-z0-9+/=\r\n]+$/.test(l.data)&&["image/png","image/jpeg","image/webp","image/gif"].includes(String(l.mimeType))&&a.push({type:"image",data:l.data,mimeType:String(l.mimeType)})}typeof i?.structuredPreview=="string"&&a.push({type:"text",text:i.structuredPreview.slice(0,12e3)}),n.state==="output-error"&&n.errorText&&a.push({type:"text",text:n.errorText});const s=i?.kind==="mcp"?`${String(i.server||"MCP").slice(0,100)} · ${String(i.tool||"外部工具").slice(0,150)}`:`MCP · ${Ku(n.toolName)}`;let o="pending";(n.state==="approval-requested"||n.state==="approval-responded")&&(o="approval"),n.state==="output-available"&&(o=i?.ok===!1?"error":"success"),n.state==="output-error"&&(o="error"),n.state==="output-denied"&&(o="cancelled"),t.set(n.toolCallId,{id:n.toolCallId,title:s,status:o,content:a,structuredContent:i?.structuredContent,truncated:i?.truncated===!0})}return[...t.values()].slice(-16)}function l0(e){if(e.structuredContent!=null)return e.structuredContent;const t=e.content.find(r=>r.type==="text")?.text;if(!(!t||t.length>12e3||!/^[\s]*[\[{]/.test(t)))try{return JSON.parse(t)}catch{return}}function d0(e){const t=Pe(e),r=Array.isArray(e)?e:t?.results??t?.items??t?.documents??t?.rows;if(!(!Array.isArray(r)||r.length===0||!r.every(u=>Pe(u))))return r.slice(0,30)}const p0={pending:"调用中",approval:"等待确认",success:"已完成",error:"调用失败",cancelled:"已取消"};function tn(e=[]){return e.length?m`<div class="mcp-results" aria-label="外部工具结果">${e.map(t=>m`
    <details class="mcp-result" data-status=${t.status}>
      <summary><span class="mcp-result-label">MCP</span><strong>${t.title}</strong>
        <span class="mcp-result-status" role="status">${p0[t.status]}</span></summary>
      <div class="mcp-result-body">${f0(t)}
        ${t.truncated?m`<p class="mcp-result-hint">结果较长，已显示部分内容。</p>`:x}
      </div>
    </details>`)}
  </div>`:x}function f0(e){const t=l0(e),r=d0(t),u=r?.map(s=>({row:s,url:sr(s.url??s.link??s.uri)})),n=u?.every(s=>s.url),i=r?[...new Set(r.flatMap(s=>Object.keys(s)))].slice(0,8):[],a=c0(e.content);return m`
    ${e.content.map(s=>{if(s.type==="image")return m`<img class="mcp-result-image" src=${`data:${s.mimeType};base64,${s.data}`} alt="外部工具返回的图片" loading="lazy" />`;if(s.type==="link")return m`<a class="mcp-result-link" href=${s.url} target="_blank" rel="noopener noreferrer">${s.title}</a>`;if(t!==void 0)try{if(JSON.stringify(JSON.parse(s.text||""))===JSON.stringify(t))return x}catch{}return r&&/^\s*(?:[\[{]|<\w)/.test(s.text||"")?m`<details class="mcp-result-raw"><summary>查看原始返回</summary><pre class="mcp-result-text">${s.text}</pre></details>`:m`<pre class="mcp-result-text">${s.text}</pre>`})}
    ${r&&n?m`<div class="mcp-resource-list">${u.map(({row:s,url:o})=>m`
      <a class="mcp-resource" href=${o} target="_blank" rel="noopener noreferrer">
        <strong>${or(s.title??s.name??o)}</strong>
        <span>${or(s.description??s.snippet??s.content??"")}</span>
        <small>${new URL(o).hostname}</small>
      </a>`)}</div>`:r?m`<div class="mcp-table-scroll"><table><thead><tr>${i.map(s=>m`<th scope="col">${s}</th>`)}</tr></thead>
      <tbody>${r.map(s=>m`<tr>${i.map(o=>m`<td>${or(s[o])}</td>`)}</tr>`)}</tbody></table></div>`:t!==void 0?m`<pre class="mcp-result-text">${JSON.stringify(t,null,2)}</pre>`:x}
    ${a.length&&!n?m`<div class="mcp-resource-list" aria-label="来源链接">${a.map(s=>m`<a class="mcp-result-link" href=${s} target="_blank" rel="noopener noreferrer">${new URL(s).hostname}${new URL(s).pathname}</a>`)}</div>`:x}
    ${!e.content.length&&t===void 0?m`<p class="mcp-result-hint">${e.status==="approval"?"确认后才会执行此工具。":e.status==="pending"?"正在等待外部服务返回结果…":e.status==="cancelled"?"本次操作已取消。":"工具没有返回可展示的内容。"}</p>`:x}
  `}function or(e){return(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).slice(0,1e3)}const h0=_e`
  .mcp-capabilities { margin: 0 0 14px; color: var(--rag-text); font-size: 12px; }
  .mcp-capabilities summary { cursor: pointer; font-weight: 500; list-style: none; display: flex; align-items: center; gap: 7px; }
  .mcp-capabilities summary::before { content: '+'; font-weight: 400; opacity: .65; }
  .mcp-capabilities[open] summary::before { content: '−'; }
  .mcp-capabilities summary>span { opacity: .5; font-size: 10px; }
  .mcp-capability-list { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 6px; margin-top: 10px; max-height: 160px; overflow: auto; }
  .mcp-capability-list button { display: grid; gap: 4px; padding: 9px 10px; text-align: left; border: 1px solid var(--rag-line); border-radius: 8px; background: var(--rag-paper); color: var(--rag-text); cursor: pointer; min-width: 0; }
  .mcp-capability-list strong { font-size: 12px; font-weight: 500; overflow-wrap: anywhere; }
  .mcp-capability-list small { opacity: .6; font-size: 10px; }
  .mcp-capabilities p { font-size: 10px; opacity: .6; margin: 7px 0 0; }
  .mcp-capability-list button:disabled { opacity: .5; cursor: default; }
  .pet-stage .mcp-capabilities { color: #e2e8f0; pointer-events: auto; }
  .pet-stage .mcp-capability-list { grid-template-columns: repeat(auto-fit,minmax(170px,1fr)); max-height: 135px; }
  .pet-stage .mcp-capability-list button { background: #172033; border-color: #ffffff30; color: #f1f5f9; }
  .mcp-results { display: grid; gap: 8px; margin: 10px 0; max-width: 100%; min-width: 0; }
  .mcp-result { border: 1px solid var(--rag-line); border-radius: 10px; overflow: hidden; font-size: 12px; color: var(--rag-text); background: var(--rag-paper); }
  .mcp-result summary { display: flex; align-items: center; gap: 7px; padding: 10px; cursor: pointer; }
  .mcp-result summary strong { flex: 1; font-size: 12px; overflow-wrap: anywhere; font-weight: 500; }
  .mcp-result-label { color: #6366f1; font-size: 10px; letter-spacing: .04em; }
  .mcp-result-status { white-space: nowrap; opacity: .7; font-size: 11px; }
  .mcp-result[data-status=error] .mcp-result-status { color: #dc2626; }
  .mcp-result[data-status=success] .mcp-result-status { color: #059669; }
  .mcp-result[data-status=pending] .mcp-result-label { animation: mcp-pulse 1.2s ease-in-out infinite alternate; }
  .mcp-result-body { padding: 0 10px 10px; display: grid; gap: 8px; min-width: 0; }
  .mcp-result-raw summary { padding: 6px 0; font-size: 11px; opacity: .65; }
  .mcp-result-text { margin: 0; font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 280px; overflow: auto; line-height: 1.7; }
  .mcp-result-image { max-width: 100%; max-height: 320px; object-fit: contain; border-radius: 6px; }
  .mcp-result-link, .mcp-resource { color: inherit; }
  .mcp-resource-list { display: grid; gap: 7px; }
  .mcp-resource { display: grid; gap: 4px; padding: 9px; border: 1px solid var(--rag-line); border-radius: 7px; text-decoration: none; overflow-wrap: anywhere; }
  .mcp-resource:hover { border-color: #818cf8; }
  .mcp-resource span { opacity: .8; line-height: 1.6; }
  .mcp-resource small, .mcp-result-hint { opacity: .65; font-size: 11px; margin: 0; }
  .mcp-table-scroll { overflow: auto; max-height: 300px; }
  .mcp-table-scroll table { border-collapse: collapse; width: 100%; font-size: 11px; }
  .mcp-table-scroll td, .mcp-table-scroll th { padding: 7px 9px; border-bottom: 1px solid var(--rag-line); text-align: left; min-width: 70px; max-width: 220px; overflow-wrap: anywhere; }
  .pet-stage .mcp-result { --rag-line: rgba(255,255,255,.2); color: #f1f5f9; background: rgba(15,23,42,.92); font-size: 13px; }
  .pet-stage .mcp-result-label { color: #c7d2fe; }
  .pet-stage .mcp-result[data-status=success] .mcp-result-status { color: #6ee7b7; }
  .pet-stage .mcp-result[data-status=error] .mcp-result-status { color: #fca5a5; }
  @keyframes mcp-pulse { to { opacity: .4; } }
  @media (prefers-reduced-motion: reduce) { .mcp-result[data-status=pending] .mcp-result-label { animation: none; } }
`,g0=[u0,a0,i0,n0,s0,h0];function Fe(e,t,r={}){return{id:r.id||vt(),role:e,content:t,time:r.time||$e(),sources:r.sources,streaming:r.streaming,error:r.error,toolResults:r.toolResults}}function cr(e,t,r){return e.map(u=>u.id===t?r(u):u)}function vt(){return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}const Me={visible:!1,text:"",x:0,y:0};function m0(e){const t=window.getSelection();if(!t||t.isCollapsed||t.rangeCount===0)return Me;const r=t.toString().replace(/\s+/g," ").trim();if(r.length<2||b0(t))return Me;const n=t.getRangeAt(0).getBoundingClientRect();if(!n||n.width===0&&n.height===0)return Me;const i=Math.max(72,Math.min(n.left+n.width/2,window.innerWidth-72)),a=Math.max(42,n.top-12);return{visible:!0,text:r.slice(0,e),x:Math.round(i),y:Math.round(a)}}function b0(e){return rn(e.anchorNode)||rn(e.focusNode)}function rn(e){return!!(e instanceof Element?e:e?.parentElement)?.closest('input, textarea, select, [contenteditable="true"], summaraid-rag-assistant')}class q extends Error{status;response;constructor(t,r={}){super(t),this.name="AIUIError",this.status=r.status,this.response=r.response,r.cause!==void 0&&Object.defineProperty(this,"cause",{configurable:!0,enumerable:!1,value:r.cause})}}class O extends q{constructor(t,r={}){super(t,r),this.name="AIUIProtocolError"}}class x0 extends O{target;partType;partName;partId;constructor(t,r){super(t,{cause:r.cause}),this.name="AIUISchemaValidationError",this.target=r.target,this.partType=r.partType,this.partName=r.partName,this.partId=r.partId}}function wt(e){return e instanceof Error?e:new Error(String(e))}function y0(e){return e instanceof O}function _0(e){return(e instanceof DOMException||e instanceof Error)&&e.name==="AbortError"}let un=0;function Ct(e="msg"){return un+=1,`${e}_${Date.now().toString(36)}_${un.toString(36)}`}function v0(e){if(A0(e))return e;const t=e;if(typeof t.toJSONSchema=="function")return t.toJSONSchema();const r=e;if(typeof r.toJsonSchema=="function")return r.toJsonSchema();throw new q("A JSON Schema object is required unless the schema can export JSON Schema.")}function nn(e,t,r){return w0(e,t,{makeError:(u,n)=>new x0(`UI message ${r.target} validation failed: ${u}`,{...r,cause:n})})}function w0(e,t,r){if(k0(t))try{const i=t["~standard"].validate(e);if(E0(i))throw r.makeError("Async schemas are not supported for UI message streams.");if("issues"in i&&i.issues&&i.issues.length>0)throw r.makeError(S0(i.issues),i.issues);return i.value}catch(i){throw dr(i)?i:r.makeError(ut(i),i)}const u=t;if(typeof u.safeParse=="function")try{const i=u.safeParse(e);if(!i.success)throw r.makeError(ut(i.error),i.error);return i.data}catch(i){throw dr(i)?i:r.makeError(ut(i),i)}const n=t;if(typeof n.parse=="function")try{return n.parse(e)}catch(i){throw r.makeError(ut(i),i)}try{return lr(e,v0(t),"$"),e}catch(i){throw dr(i)?i:r.makeError(ut(i),i)}}function lr(e,t,r){if(t.enum&&!t.enum.some(u=>Object.is(u,e)))throw new q(`${r} must be one of ${t.enum.join(", ")}`);if(t.type==="object"||t.properties){if(!D0(e))throw new q(`${r} must be an object`);for(const u of t.required??[])if(!(u in e))throw new q(`${r}.${u} is required`);for(const[u,n]of Object.entries(t.properties??{}))e[u]!==void 0&&lr(e[u],n,`${r}.${u}`);return}if(t.type==="array"||t.items){if(!Array.isArray(e))throw new q(`${r} must be an array`);t.items&&e.forEach((u,n)=>lr(u,t.items,`${r}[${n}]`));return}if(t.type&&!C0(e,t.type))throw new q(`${r} must be ${t.type}`)}function C0(e,t){switch(t){case"string":return typeof e=="string";case"number":return typeof e=="number";case"integer":return Number.isInteger(e);case"boolean":return typeof e=="boolean";case"null":return e===null;default:return!0}}function A0(e){return typeof e=="object"&&e!==null&&("type"in e||"properties"in e)}function k0(e){return typeof e=="object"&&e!==null&&"~standard"in e&&typeof e["~standard"]?.validate=="function"}function E0(e){return typeof e=="object"&&e!==null&&typeof e.then=="function"}function dr(e){return e instanceof q}function S0(e){return e.map(t=>`${t.path?.length?`${t.path.map(String).join(".")}: `:""}${t.message??"Invalid value"}`).join("; ")}function ut(e){return e instanceof Error?e.message:typeof e=="object"&&e!==null&&"message"in e?String(e.message):String(e)}function D0(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function T0(e={}){return{message:e.message??{id:e.messageId??Ct("msg"),role:"assistant",parts:[],metadata:e.metadata},terminal:{},visible:!!e.message?.parts.length,messageMetadataSchema:e.messageMetadataSchema,dataPartSchemas:e.dataPartSchemas}}function $0(e,t){if(P0(t),on(t)){if(!t.transient){const r=U0(e,t);ce(e,{type:t.type,id:t.id,name:t.name,data:r,transientData:!1})}return e}if(fr(t))return sn(e,q0(t)),e;if(cn(t))return sn(e,t),e;switch(t.type){case"start":e.message={...e.message,id:t.messageId??e.message.id,metadata:pr(e,t.messageMetadata)};break;case"text-start":ce(e,{type:"text",id:t.id,text:""});break;case"text-delta":R0(e,t.id,t.delta);break;case"text-end":break;case"reasoning-start":ce(e,{type:"reasoning",id:t.id,text:""});break;case"reasoning-delta":N0(e,t.id,t.delta,t.providerMetadata);break;case"reasoning-end":break;case"message-metadata":e.message={...e.message,metadata:pr(e,t.messageMetadata)};break;case"source-url":ce(e,{type:"source-url",sourceId:t.sourceId??t.id??t.url,url:t.url,title:t.title,providerMetadata:t.providerMetadata});break;case"file":ce(e,{type:"file",id:t.id,url:t.url,title:t.title,mediaType:t.mediaType,data:t.data,providerMetadata:t.providerMetadata});break;case"start-step":break;case"finish-step":e.terminal={...e.terminal,finishReason:t.finishReason??e.terminal.finishReason,rawFinishReason:t.rawFinishReason??e.terminal.rawFinishReason,usage:t.usage??e.terminal.usage};break;case"finish":e.message={...e.message,metadata:pr(e,t.messageMetadata)},e.terminal=L0(e.terminal,t);break;case"error":e.terminal={...e.terminal,errorText:t.errorText};break;case"abort":e.terminal={...e.terminal,aborted:!0};break}return e}function P0(e){if(!e||typeof e.type!="string"||e.type.length===0)throw new O("UI message chunk type is required.");if(on(e)){if(mr(e.name,/^[A-Za-z][A-Za-z0-9_-]*$/,"data name"),e.type!==`data-${e.name}`)throw new O(`Data chunk type must be data-${e.name}.`);if(!e.id)throw new O("Data chunk id is required.");return}if(fr(e)){if(H0(e.type,e.toolCallId,e.toolName),e.type==="tool-input-delta"&&!e.inputTextDelta)throw new O("Tool input-delta chunk inputTextDelta is required.");if(e.type==="tool-output-error"&&!e.errorText)throw new O("Tool output-error chunk errorText is required.");if((e.type==="tool-approval-request"||e.type==="tool-approval-response")&&!e.approvalId)throw new O("Tool approval chunk approvalId is required.");if(e.type==="tool-approval-response"&&typeof e.approved!="boolean")throw new O("Tool approval-response chunk approved is required.");return}if(cn(e)){if(mr(e.toolName,/^[A-Za-z][A-Za-z0-9_-]*$/,"tool name"),e.type!==`tool-${e.toolName}`)throw new O(`Tool chunk type must be tool-${e.toolName}.`);if(!e.toolCallId)throw new O("Tool chunk toolCallId is required.");if(!e.state)throw new O("Tool chunk state is required.");if(e.state==="output-error"&&!e.errorText)throw new O("Tool output-error chunk errorText is required.")}}function F0(e,t){const r=kt(e,t.toolCallId);return At(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"output-available",input:r?.input,output:t.output??t.result,approval:r?.approval,providerMetadata:t.providerMetadata??r?.providerMetadata})}function M0(e,t){const r=kt(e,t.toolCallId);return At(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"output-error",input:r?.input,errorText:t.errorText,approval:r?.approval,providerMetadata:t.providerMetadata??r?.providerMetadata})}function I0(e,t){const r=kt(e,t.toolCallId);return At(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"approval-responded",input:r?.input,errorText:r?.errorText,approval:{id:t.approvalId,approved:t.approved,reason:t.reason},providerMetadata:t.providerMetadata??r?.providerMetadata})}function R0(e,t,r){const u=e.message.parts.find(n=>n.type==="text"&&n.id===t);ce(e,{type:"text",id:t,text:`${u?.text??""}${r??""}`})}function N0(e,t,r,u){const n=e.message.parts.find(i=>i.type==="reasoning"&&i.id===t);ce(e,{type:"reasoning",id:t,text:`${n?.text??""}${r??""}`,providerMetadata:u??n?.providerMetadata})}function ce(e,t){e.message=At(e.message,t),e.visible=e.visible||O0(t)}function At(e,t){const r=e.parts.findIndex(n=>z0(n,t)),u=[...e.parts];return r===-1?u.push(t):u[r]=t,{...e,parts:u}}function z0(e,t){if(e.type!==t.type)return!1;if(hr(t))return hr(e)&&e.id===t.id;switch(t.type){case"text":case"reasoning":case"file":return"id"in e&&e.id===t.id;case"source-url":return"sourceId"in e&&e.sourceId===t.sourceId;default:return gr(t)?gr(e)&&e.toolCallId===t.toolCallId:!1}}function O0(e){return!hr(e)||!e.transientData}function L0(e,t){return{...e,finishReason:t.finishReason,rawFinishReason:t.rawFinishReason,usage:t.usage}}function B0(e,t){return t==null?e:an(e)&&an(t)?{...e,...t}:t}function pr(e,t){const r=B0(e.message.metadata,t);return t==null||!e.messageMetadataSchema?r:nn(r,e.messageMetadataSchema,{target:"message-metadata"})}function U0(e,t){const r=e.dataPartSchemas?.[t.name];return r?nn(t.data,r,{target:"data-part",partType:t.type,partName:t.name,partId:t.id}):t.data}function an(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function sn(e,t){const r=kt(e.message,t.toolCallId),u=t.state==="input-streaming"?`${r?.inputText??""}${t.inputTextDelta??""}`:void 0;ce(e,{type:t.type,toolCallId:t.toolCallId,toolName:t.toolName,state:t.state,input:t.input??r?.input,inputText:u,output:t.output??r?.output,errorText:t.errorText??r?.errorText,approval:t.approval??r?.approval,providerMetadata:t.providerMetadata??r?.providerMetadata})}function q0(e){const t={type:`tool-${e.toolName}`,toolCallId:e.toolCallId,toolName:e.toolName,providerMetadata:"providerMetadata"in e?e.providerMetadata:void 0};switch(e.type){case"tool-input-start":return{...t,state:"input-streaming",inputTextDelta:""};case"tool-input-delta":return{...t,state:"input-streaming",inputTextDelta:e.inputTextDelta};case"tool-input-available":return{...t,state:"input-available",input:e.input};case"tool-output-available":return{...t,state:"output-available",output:e.output};case"tool-output-error":return{...t,state:"output-error",errorText:e.errorText};case"tool-approval-request":return{...t,state:"approval-requested",input:e.input,approval:{id:e.approvalId}};case"tool-approval-response":return{...t,state:"approval-responded",approval:{id:e.approvalId,approved:e.approved,reason:e.reason}}}}function kt(e,t){return e.parts.find(r=>gr(r)&&r.toolCallId===t)}function on(e){return e.type.startsWith("data-")}function fr(e){return e.type==="tool-input-start"||e.type==="tool-input-delta"||e.type==="tool-input-available"||e.type==="tool-output-available"||e.type==="tool-output-error"||e.type==="tool-approval-request"||e.type==="tool-approval-response"}function cn(e){return e.type.startsWith("tool-")&&!fr(e)}function hr(e){return e.type.startsWith("data-")}function gr(e){return e.type.startsWith("tool-")}function mr(e,t,r){if(!e||!t.test(e))throw new O(`${r} must be a simple identifier.`)}function H0(e,t,r){if(mr(r,/^[A-Za-z][A-Za-z0-9_-]*$/,"tool name"),!t)throw new O(`${e} chunk toolCallId is required.`)}const j0="X-Halo-AI-UI-Message-Stream",W0="v1",Et="[DONE]";function G0(e){const t=e.headers.get(j0);if(t&&t!==W0)throw new q(`Unsupported Halo UI message stream version: ${t}`,{response:e,status:e.status})}async function*V0(e){const t=e.getReader(),r=new TextDecoder;try{for(;;){const{value:n,done:i}=await t.read();if(i)break;if(n){const a=r.decode(n,{stream:!0});a&&(yield a)}}const u=r.decode();u&&(yield u)}finally{t.releaseLock()}}async function*Z0(e){let t="";for await(const u of V0(e)){t+=u;const i=t.replace(/\r\n/g,`
`).split(`

`);t=i.pop()??"";for(const a of i){const s=ln(a);s===Et||s==null||(yield s)}}const r=t.trim();if(r){const u=ln(r);u!==Et&&u!=null&&(yield u)}}function ln(e){const t=e.split(`
`).filter(u=>u.startsWith("data:")).map(u=>u.slice(5).trimStart());if(!t.length)return;const r=t.join(`
`).trim();if(!r||r===Et)return Et;try{return JSON.parse(r)}catch(u){throw new q("Failed to parse Halo UI message stream chunk.",{cause:u})}}class Y0{api;credentials;headers;body;fetch;prepareSendMessagesRequest;constructor(t={}){this.api=t.api??"/api/chat",this.credentials=t.credentials,this.headers=t.headers,this.body=t.body,this.fetch=t.fetch,this.prepareSendMessagesRequest=t.prepareSendMessagesRequest}async sendMessages(t){const r=await br(this.body),u=J0(await br(this.headers),t.headers),n=t.credentials??await br(this.credentials),i={...r,...t.body,id:t.chatId,messages:t.messages,trigger:t.trigger,messageId:t.messageId??null},a=await this.prepareSendMessagesRequest?.({...t,api:this.api,body:i,headers:u,credentials:n}),s=await this.fetchResponse({api:a?.api??this.api,body:a?.body??i,headers:a?.headers??u,credentials:a?.credentials??n,abortSignal:t.abortSignal});return this.processResponse(s)}async fetchResponse(t){const r=this.fetch??globalThis.fetch;if(!r)throw new q("No fetch implementation is available.");const u=await r(t.api,{method:"POST",headers:{"Content-Type":"application/json",...pn(t.headers)},body:JSON.stringify(t.body),credentials:t.credentials,signal:t.abortSignal});if(!u.ok)throw new q(await u.text()||"Failed to fetch chat response.",{status:u.status,response:u});if(!u.body)throw new q("The response body is empty.",{status:u.status,response:u});return u}}class dn extends Y0{processResponse(t){return G0(t),Z0(t.body)}}async function br(e){return typeof e=="function"?await e():e}function J0(...e){return Object.assign({},...e.map(pn))}function pn(e){return e?e instanceof Headers?Object.fromEntries(e.entries()):Array.isArray(e)?Object.fromEntries(e):e:{}}class Q0{id;generateId;state;transport;onError;onData;onToolCall;onAutomaticStepLimitExceeded;onFinish;sendAutomaticallyWhen;maxAutomaticSteps;messageMetadataSchema;dataPartSchemas;notifiedToolCalls=new Set;consumedAutomaticContinuationKeys=new Set;listeners=new Set;activeAbortController;automaticStepCount=0;hasPendingAutomaticContinuation=!1;pendingAutomaticContinuationOptions;toolCallbackFailure;constructor(t={}){this.generateId=t.generateId??(()=>Ct("msg")),this.id=t.id??this.generateId(),this.state=t.state??X0({messages:t.messages??[]}),this.transport=t.transport??new dn,this.onError=t.onError,this.onData=t.onData,this.onToolCall=t.onToolCall,this.onAutomaticStepLimitExceeded=t.onAutomaticStepLimitExceeded,this.onFinish=t.onFinish,this.sendAutomaticallyWhen=t.sendAutomaticallyWhen,this.maxAutomaticSteps=cc(t.maxAutomaticSteps),this.messageMetadataSchema=t.messageMetadataSchema,this.dataPartSchemas=t.dataPartSchemas}get messages(){return this.state.getMessages()}set messages(t){this.setMessages(t)}get status(){return this.state.getStatus()}get error(){return this.state.getError()}setMessages(t){this.setChatMessages([...t])}clearError(){this.setChatError(void 0),(this.status==="error"||this.status==="disconnected")&&this.setChatStatus("ready")}subscribe(t){return this.listeners.add(t),()=>{this.listeners.delete(t)}}async sendMessage(t,r){this.resetAutomaticContinuation(),t&&this.applyUserMessage(t),await this.makeRequest({trigger:"submit-message",messageId:t?.messageId,options:r})}async regenerate({messageId:t,...r}={}){this.resetAutomaticContinuation();const u=this.messages,n=t==null?fn(u,a=>a.role==="assistant"):u.findIndex(a=>a.id===t);if(n===-1)throw new Error(`message ${t??"<last assistant>"} not found`);const i=u[n].role==="assistant"?n:n+1;this.setMessages(u.slice(0,i)),await this.makeRequest({trigger:"regenerate-message",messageId:t,options:r,requestMessages:u})}stop(){this.activeAbortController?.abort()}async appendToolOutputSuccess(t,r){const u=this.resolveToolCall(t.toolCallId,t.toolName);this.updateLastAssistant(n=>F0(n,{...t,toolName:u.toolName})),await this.maybeSendAutomaticallyAfterToolUpdate(r)}async appendToolOutputError(t,r){const u=this.resolveToolCall(t.toolCallId,t.toolName);this.updateLastAssistant(n=>M0(n,{...t,toolName:u.toolName})),await this.maybeSendAutomaticallyAfterToolUpdate(r)}async addToolOutput(t,r){const u=t.toolName??t.tool;if("state"in t&&t.state==="output-error"){await this.appendToolOutputError({toolCallId:t.toolCallId,toolName:u,errorText:t.errorText,providerMetadata:t.providerMetadata},r);return}const n=t;await this.appendToolOutputSuccess({toolCallId:n.toolCallId,toolName:u,result:n.output??n.result,providerMetadata:n.providerMetadata},r)}async rejectToolCall(t,r){await this.addToolApprovalResponse({...t,approved:!1},r)}async addToolApprovalResponse(t,r){const u=t.id||t.approvalId?this.resolveApprovalRequest(t.id??t.approvalId):void 0,n=t.toolCallId??u?.toolCallId;if(!n)throw new Error("Tool call id is required.");const i=this.resolveToolCall(n,t.toolName??t.tool);this.updateLastAssistant(a=>I0(a,{approvalId:u?.approval?.id??t.id??t.approvalId??n,toolCallId:n,toolName:t.toolName??t.tool??i.toolName,approved:t.approved,reason:t.reason,providerMetadata:t.providerMetadata})),await this.maybeSendAutomaticallyAfterToolUpdate(r)}applyUserMessage(t){const r=this.messages,u={id:t.id??this.generateId(),role:t.role??"user",parts:this.userMessageParts(t),metadata:t.metadata};if(t.messageId){const n=r.findIndex(i=>i.id===t.messageId);if(n===-1)throw new Error(`message with id ${t.messageId} not found`);if(r[n].role!=="user")throw new Error(`message with id ${t.messageId} is not a user message`);this.setMessages([...r.slice(0,n),{...u,id:t.messageId}]);return}this.setMessages([...r,u])}userMessageParts(t){if(t.parts)return t.parts;const r=[];t.text!=null&&r.push({type:"text",id:Ct("text"),text:t.text});for(const u of t.files??[])r.push({type:"file",id:u.id??Ct("file"),url:u.url,title:u.title,mediaType:u.mediaType,data:u.data,providerMetadata:u.providerMetadata});return r}async makeRequest({trigger:t,messageId:r,options:u,requestMessages:n,reducerMessage:i}){const a=await this.consumeAssistantStream({reducerMessage:i??{id:this.generateId(),role:"assistant",parts:[]},createStream:s=>this.transport.sendMessages({chatId:this.id,messages:ac(n??this.messages),trigger:t,messageId:r,headers:u?.headers,body:u?.body,credentials:u?.credentials,metadata:u?.metadata,abortSignal:s})});this.status==="ready"&&!a.isAbort&&!a.isError?await this.maybeSendAutomatically(this.consumePendingAutomaticContinuationOptions(u)):this.clearPendingAutomaticContinuation()}async consumeAssistantStream({reducerMessage:t,createStream:r}){this.setChatStatus("submitted"),this.setChatError(void 0),this.toolCallbackFailure=void 0;let u=!1,n=!1,i=!1;const a=new AbortController;this.activeAbortController=a;const s=T0({message:t,messageMetadataSchema:this.messageMetadataSchema,dataPartSchemas:this.dataPartSchemas});try{const o=await r(a.signal);for await(const c of o)this.applyAssistantChunk(s,c),i=!0,this.setChatStatus("streaming");if(this.toolCallbackFailure)n=!0,this.failChat(this.toolCallbackFailure);else if(s.terminal.errorText){n=!0;const c=new Error(s.terminal.errorText);this.setChatError(c),this.setChatStatus("error"),this.onError?.(c)}else this.setChatStatus("ready")}catch(o){if(_0(o)||a.signal.aborted)return u=!0,this.setChatStatus("ready"),{isAbort:u,isError:n};a.abort(),n=!0;const c=wt(o);this.setChatError(c),i&&!y0(c)?(n=!1,this.setChatStatus("disconnected")):this.setChatStatus("error"),this.onError?.(c)}finally{this.activeAbortController===a&&(this.activeAbortController=void 0),await this.onFinish?.({message:s.message,messages:this.messages,terminal:s.terminal,isAbort:u,isError:n})}return{isAbort:u,isError:n}}applyAssistantChunk(t,r){$0(t,r);let u;pc(r)&&this.onData?.(fc(t.message,r));const n=t.message.parts[t.message.parts.length-1];if(n&&re(n)&&n.state==="input-available"){const s=n;this.notifiedToolCalls.has(s.toolCallId)||(this.notifiedToolCalls.add(s.toolCallId),u=s)}if(!t.visible&&r.type!=="error"&&r.type!=="abort")return;const i=this.messages,a=i[i.length-1];a?.role==="assistant"&&a.id===t.message.id?(t.message=ic(t.message,a),this.setMessages([...i.slice(0,-1),t.message])):this.setMessages([...i,t.message]),u&&this.notifyToolCall(u)}updateLastAssistant(t){const r=this.messages,u=fn(r,n=>n.role==="assistant");if(u===-1)throw new Error("No assistant message is available for tool continuation.");this.setMessages([...r.slice(0,u),t(r[u]),...r.slice(u+1)])}resolveToolCall(t,r){const u=K0(this.messages,t),n=r??u?.toolName;if(!n)throw new Error(`Tool call ${t} was not found.`);return{toolName:n}}resolveApprovalRequest(t){if(!t)throw new Error("Tool approval id is required.");const r=ec(this.messages,t);if(!r)throw new Error(`Tool approval request ${t} was not found.`);return r}async maybeSendAutomatically(t){if(this.status==="submitted"||this.status==="streaming")return;if(!await this.shouldSendAutomatically()){this.resetAutomaticContinuationIfIdle();return}const r=sc(this.messages);if(r.filter(n=>!this.consumedAutomaticContinuationKeys.has(n)).length!==0){if(this.automaticStepCount>=this.maxAutomaticSteps){this.onAutomaticStepLimitExceeded?.({messages:this.messages,maxAutomaticSteps:this.maxAutomaticSteps});return}for(const n of r)this.consumedAutomaticContinuationKeys.add(n);this.automaticStepCount+=1,await this.makeRequest({trigger:"submit-message",messageId:this.messages[this.messages.length-1]?.id,options:t,reducerMessage:this.lastAssistantMessage()})}}async maybeSendAutomaticallyAfterToolUpdate(t){if(this.status==="submitted"||this.status==="streaming"){this.rememberPendingAutomaticContinuation(t);return}await this.maybeSendAutomatically(t)}lastAssistantMessage(){return[...this.messages].reverse().find(t=>t.role==="assistant")}async shouldSendAutomatically(){if(!this.sendAutomaticallyWhen)return!1;try{return!!await this.sendAutomaticallyWhen({messages:this.messages})}catch(t){throw this.failChat(t)}}notifyToolCall(t){try{const r=this.onToolCall?.(t);lc(r)&&r.catch(u=>{const n=wt(u);this.toolCallbackFailure=n,this.status!=="submitted"&&this.status!=="streaming"&&this.failChat(n)})}catch(r){throw wt(r)}}failChat(t){const r=wt(t);return this.setChatError(r),this.setChatStatus("error"),this.onError?.(r),r}resetAutomaticContinuation(){this.automaticStepCount=0,this.consumedAutomaticContinuationKeys.clear(),this.clearPendingAutomaticContinuation()}rememberPendingAutomaticContinuation(t){this.hasPendingAutomaticContinuation=!0,t&&(this.pendingAutomaticContinuationOptions=t)}consumePendingAutomaticContinuationOptions(t){const r=this.hasPendingAutomaticContinuation?this.pendingAutomaticContinuationOptions??t:t;return this.hasPendingAutomaticContinuation=!1,this.pendingAutomaticContinuationOptions=void 0,r}clearPendingAutomaticContinuation(){this.hasPendingAutomaticContinuation=!1,this.pendingAutomaticContinuationOptions=void 0}resetAutomaticContinuationIfIdle(){const t=this.lastAssistantMessage();(!t||!t.parts.some(tc))&&(this.automaticStepCount=0,this.clearPendingAutomaticContinuation())}setChatMessages(t){this.state.setMessages(t),this.emitChange()}setChatStatus(t){this.state.setStatus(t),this.emitChange()}setChatError(t){this.state.setError(t),this.emitChange()}emitChange(){for(const t of this.listeners)t()}}function X0({messages:e=[],status:t="ready",error:r}={}){let u=e,n=t,i=r;return{getMessages:()=>u,setMessages:a=>{u=a},getStatus:()=>n,setStatus:a=>{n=a},getError:()=>i,setError:a=>{i=a}}}function fn(e,t){for(let r=e.length-1;r>=0;r-=1)if(t(e[r]))return r;return-1}function K0(e,t){for(let r=e.length-1;r>=0;r-=1){const u=e[r];if(u.role==="assistant")for(let n=u.parts.length-1;n>=0;n-=1){const i=u.parts[n];if(re(i)&&i.toolCallId===t)return{toolName:i.toolName}}}}function ec(e,t){for(let r=e.length-1;r>=0;r-=1){const u=e[r];if(u.role==="assistant")for(let n=u.parts.length-1;n>=0;n-=1){const i=u.parts[n];if(re(i)&&i.state==="approval-requested"&&i.approval?.id===t)return i}}}function re(e){return e.type.startsWith("tool-")}function tc(e){return re(e)&&(e.state==="input-streaming"||e.state==="input-available"||e.state==="approval-requested")}function rc(e){return re(e)&&(e.state==="output-available"||e.state==="output-error"||e.state==="output-denied")}function uc(e){return re(e)&&e.state==="approval-responded"}function nc(e){return rc(e)||uc(e)}function hn(e){return gn(e)||e.state==="approval-responded"}function gn(e){return e.state==="output-available"||e.state==="output-error"||e.state==="output-denied"}function ic(e,t){const r=new Map(t.parts.filter(i=>re(i)&&hn(i)).map(i=>[i.toolCallId,i]));if(r.size===0)return e;let u=!1;const n=e.parts.map(i=>{if(!re(i)||hn(i))return i;const a=r.get(i.toolCallId);return a?(u=!0,{...i,...a,input:a.input??i.input,inputText:a.inputText??i.inputText,providerMetadata:a.providerMetadata??i.providerMetadata}):i});return u?{...e,parts:n}:e}function ac(e){const t=new Set;let r=!1;const u=[...e].reverse().map(n=>{if(n.role!=="assistant")return n;const i=[...n.parts].reverse().filter(a=>!re(a)||!gn(a)?!0:t.has(a.toolCallId)?(r=!0,!1):(t.add(a.toolCallId),!0)).reverse();return i.length===n.parts.length?n:{...n,parts:i}}).reverse();return r?u:e}function sc(e){const t=[...e].reverse().find(u=>u.role==="assistant");if(!t)return[];const r=t.parts.filter(nc);return r.length===0?[]:Array.from(new Set(r.map(oc)))}function oc(e){return dc({toolCallId:e.toolCallId,toolName:e.toolName,state:e.state,approvalId:e.approval?.id,approved:e.approval?.approved})}function cc(e){return!Number.isFinite(e)||e==null||e<1?5:Math.floor(e)}function lc(e){return typeof e=="object"&&e!==null&&"then"in e&&typeof e.then=="function"}function dc(e){const t=new WeakSet,r=u=>{if(u===void 0)return'"[Undefined]"';if(typeof u=="bigint")return JSON.stringify(u.toString());if(u===null||typeof u=="string"||typeof u=="number"||typeof u=="boolean")return JSON.stringify(u);if(typeof u!="object")return JSON.stringify(String(u));if(t.has(u))return'"[Circular]"';if(t.add(u),Array.isArray(u))return`[${u.map(r).join(",")}]`;const n=u;return`{${Object.keys(n).sort().map(a=>`${JSON.stringify(a)}:${r(n[a])}`).join(",")}}`};return r(e)}function pc(e){return e.type.startsWith("data-")}function fc(e,t){return t.transient?{type:t.type,id:t.id,name:t.name,data:t.data,transientData:!0}:e.parts.find(u=>u.type===t.type&&u.type.startsWith("data-")&&u.id===t.id)??{type:t.type,id:t.id,name:t.name,data:t.data,transientData:!1}}function hc(e,t={}){const r=t.maxMessages,u=typeof r=="number"&&r>=0?e.slice(Math.max(0,e.length-r)):[...e],n=t.removePendingToolParts!==!1,i=[];for(const a of u){const s=n?a.parts.filter(o=>!gc(o)):[...a.parts];s.length!==0&&i.push({...a,parts:s.map(o=>({...o}))})}return i}function gc(e){return mc(e)&&(e.state==="input-streaming"||e.state==="input-available"||e.state==="approval-requested")}function mc(e){return e.type.startsWith("tool-")}const xr="summaraidgpt:agent-after-navigation",bc=15e3,xc="我已经打开了新的页面，请基于当前页面继续完成上一条用户请求。必要时先查看当前页面上下文。";function St(e={},t=window.sessionStorage){const r={openChat:!0,focusChatInput:!0,displayMode:e.displayMode??"panel",expiresAt:Date.now()+bc};e.resume?.historyMessages?.length&&(r.resume={message:e.resume.message?.trim()||xc,historyMessages:e.resume.historyMessages}),t.setItem(xr,JSON.stringify(r))}function yc(e=window.sessionStorage){const t=e.getItem(xr);if(e.removeItem(xr),!!t)try{const r=JSON.parse(t);return typeof r.expiresAt!="number"||r.expiresAt<Date.now()?void 0:{openChat:r.openChat===!0,focusChatInput:r.focusChatInput!==!1,displayMode:r.displayMode==="stage"?"stage":"panel",resume:_c(r.resume),expiresAt:r.expiresAt}}catch{return}}function _c(e){if(typeof e!="object"||e===null)return;const t=e;if(!(typeof t.message!="string"||!t.message.trim()||!Array.isArray(t.historyMessages)))return{message:t.message.trim(),historyMessages:t.historyMessages}}const mn=new Map,bn="#a16207",vc="#ffffff",wc="#f4f4f5",Cc="#52525b";function xn(e,t){/^[a-z][a-z0-9_]{2,63}$/.test(e)&&mn.set(e,t)}function Ac(){window.SummaraidGPTAI||(window.SummaraidGPTAI={registerTool:xn}),window.Live2DAI||(window.Live2DAI={registerTool:xn})}Ac();class kc{constructor(t){this.trustedResources=new Map,this.trustedPageLinks=new Map,this.navigationStarted=!1,this.approvalQueue=Promise.resolve(),this.approvalsCancelled=!1,this.config=Lt(t)}canExecute(t){return this.builtInToolNames().has(t)||this.config.aiTools.some(r=>r.name===t)}ingestMessages(t){for(const r of t)for(const u of r.parts)!Ec(u)||u.state!=="output-available"||this.ingestToolOutput(u.output)}async execute(t){const r=t.input??{};try{if(t.toolName==="get_current_page_context")return this.getCurrentPageContext();if(t.toolName==="open_halo_resource")return this.openHaloResource(r);if(t.toolName==="open_current_page_link")return this.openCurrentPageLink(r);if(t.toolName==="open_comment_area")return this.scrollToCommentArea();if(t.toolName==="draft_comment")return this.config.builtIn.commentCapability==="off"?z("TOOL_NOT_ALLOWED","评论辅助能力未启用"):this.fillCommentDraft(r);if(t.toolName==="submit_comment")return this.config.builtIn.commentCapability!=="submit"?z("TOOL_NOT_ALLOWED","评论提交能力未启用"):this.submitComment(r);const u=this.config.aiTools.find(a=>a.name===t.toolName);if(!u)return z("TOOL_NOT_FOUND","这个功能还没有配置好");const n=u.action;if(this.requiresApproval(u.approval,n)&&!await this.requestApproval(`要我帮你执行「${u.description}」吗？`))return z("TOOL_APPROVAL_DENIED","访客取消了这次操作");this.showStatus(n.pendingMessage??"我来帮你处理一下");const i=await this.executeCustomAction(n,r,t.toolName);return this.showStatus(i.ok?n.successMessage:n.errorMessage),i}catch(u){return z("TOOL_EXECUTION_FAILED",u instanceof Error?u.message:"工具执行失败")}}tryOpenStrongResourceMatch(t){if(this.navigationStarted||!this.config.builtIn.haloNavigation)return;const r=Sc(t);if(!r||!Dc(r))return;const i=[...this.trustedResources.values()].map(a=>({resource:a,score:Tc(a,r)})).filter(a=>a.score>0).sort((a,s)=>s.score-a.score)[0]?.resource;if(i)return this.showStatus(`正在打开${i.title||"页面"}`),this.navigate(i.permalink)}requestApproval(t){const r=this.approvalQueue.then(()=>this.approvalsCancelled?!1:this.showApproval(t));return this.approvalQueue=r.then(()=>{},()=>{}),r}cancelPendingApprovals(){this.approvalsCancelled=!0,this.cancelActiveApproval?.()}showApproval(t){return new Promise(r=>{document.getElementById("summaraid-agent-approval")?.remove();const u=document.createElement("div");u.id="summaraid-agent-approval",u.style.cssText=["position:fixed","left:50%","bottom:5.5rem","z-index:100001","transform:translateX(-50%)","display:flex","align-items:center","gap:.5rem","max-width:min(28rem,calc(100vw - 1rem))","padding:.5rem .625rem","border:1px solid rgba(24,24,27,.12)","border-radius:.75rem","background:rgba(255,255,255,.98)","box-shadow:0 18px 44px rgba(15,23,42,.16)","font-size:13px","color:#334155"].join(";");const n=document.createElement("span");n.textContent=t,n.style.cssText="line-height:1.4;min-width:0;flex:1;";const i=document.createElement("button");i.type="button",i.textContent="允许",i.style.cssText=yn(bn,vc);const a=document.createElement("button");a.type="button",a.textContent="取消",a.style.cssText=yn(wc,Cc);const s=o=>{u.remove(),this.cancelActiveApproval=void 0,r(o)};this.cancelActiveApproval=()=>s(!1),i.addEventListener("click",()=>s(!0),{once:!0}),a.addEventListener("click",()=>s(!1),{once:!0}),u.append(n,i,a),document.body.append(u)})}builtInToolNames(){const t=new Set;if(!this.config.enabled)return t;const r=this.config.builtIn;return r.pageContext&&t.add("get_current_page_context"),r.haloNavigation&&(t.add("open_halo_resource"),t.add("open_current_page_link")),r.commentCapability!=="off"&&(t.add("open_comment_area"),t.add("draft_comment")),r.commentCapability==="submit"&&t.add("submit_comment"),t}getCurrentPageContext(){const t=window.getSelection()?.toString().trim()??"",r=this.findCommentInput(),u=this.findCommentArea(),n=r?.container?this.findCommentSubmitButton(r.container):void 0,i=this.collectLinkSummaries();this.trustedPageLinks.clear();for(const a of i)this.trustedPageLinks.set(a.linkId,a);return{ok:!0,title:document.title,url:window.location.href,path:window.location.pathname,description:document.querySelector("meta[name='description']")?.content.trim()??"",headings:this.collectHeadings(),selectedText:t.slice(0,1600),capabilities:{comment:{hasArea:!!u,hasInput:!!r,hasSubmitButton:!!n,reason:u?r?n?"当前页面支持填写评论":"当前页面有可写评论输入框，但没有检测到提交按钮":"当前页面有评论区，但没有检测到可写评论输入框":"当前页面没有检测到评论区"},forms:this.collectFormSummaries(),links:i}}}openHaloResource(t){const r=yr(t.resourceId);if(!r)return z("INVALID_INPUT","resourceId is required");const u=this.trustedResources.get(r);return u?this.navigate(u.permalink):z("RESOURCE_NOT_TRUSTED","没有找到可信资源")}openCurrentPageLink(t){const r=yr(t.linkId);if(!r)return z("INVALID_INPUT","linkId is required");const u=this.trustedPageLinks.get(r);return u?this.navigate(u.href):z("LINK_NOT_TRUSTED","没有找到可信链接")}scrollToCommentArea(){const t=this.findCommentArea();return t?(t.scrollIntoView?.({behavior:"smooth",block:"center"}),this.showStatus("已经帮你定位到评论区"),{ok:!0}):z("COMMENT_AREA_NOT_FOUND","当前页面没有检测到评论区")}fillCommentDraft(t){const r=yr(t.content);if(!r)return z("INVALID_INPUT","content is required");const u=this.findCommentInput();return u?(u.container?.scrollIntoView?.({behavior:"smooth",block:"center"}),this.writeCommentInput(u.input,r),u.input.focus(),this.showStatus("评论草稿已经帮你填好了"),{ok:!0,drafted:!0}):(this.scrollToCommentArea(),z("COMMENT_INPUT_NOT_FOUND",this.findCommentArea()?"当前页面有评论区，但没有找到可写评论输入框":"当前页面没有检测到评论区，无法填写评论"))}submitComment(t){const r=this.fillCommentDraft(t);if(!r.ok)return r;const u=this.findCommentInput(),n=u?.container?this.findCommentSubmitButton(u.container):void 0;return n?(n.click(),this.showStatus("已经尝试提交评论"),{ok:!0,submitted:!0}):z("COMMENT_SUBMIT_NOT_FOUND","没有找到评论提交按钮")}async executeCustomAction(t,r,u){if(t.type==="navigate")return this.navigate(t.url,t.target);if(t.type==="scroll-to")return this.scrollToSelector(t.selector,t.behavior);if(t.type==="highlight")return this.highlight(t.selector,t.duration);if(t.type==="dispatch-event")return window.dispatchEvent(new CustomEvent(t.event,{detail:r})),{ok:!0};const n=mn.get(u);return n?{ok:!0,output:await n({input:r,toolName:u})}:z("TOOL_EXECUTOR_NOT_FOUND","这个站点还没有启用对应能力")}navigate(t,r="_self"){const u=new URL(t,window.location.origin);if(!this.isAllowedUrl(u))return z("URL_NOT_ALLOWED","这个链接不在允许范围内");const n=r==="_blank"&&this.config.toolSecurity.allowNewTab;return this.navigationStarted=!0,n||St(),window.setTimeout(()=>{n?window.open(u.href,"_blank","noopener,noreferrer"):window.location.assign(u.href)},50),{ok:!0,navigating:!0,pageReload:!n,url:u.href}}scrollToSelector(t,r="smooth"){const u=document.querySelector(t);return u?(u.scrollIntoView?.({behavior:r,block:"center"}),{ok:!0}):z("ELEMENT_NOT_FOUND","没有找到对应的位置")}highlight(t,r=1600){const u=document.querySelector(t);if(!u)return z("ELEMENT_NOT_FOUND","没有找到对应的位置");const n=u.style.outline,i=u.style.outlineOffset;return u.style.outline=`2px solid ${bn}`,u.style.outlineOffset="3px",window.setTimeout(()=>{u.style.outline=n,u.style.outlineOffset=i},r),{ok:!0}}isAllowedUrl(t){return t.protocol!=="http:"&&t.protocol!=="https:"?!1:t.origin===window.location.origin?!0:this.config.toolSecurity.allowedExternalOrigins.includes(t.origin)}requiresApproval(t,r){return t==="always"?!0:t==="never"?!1:r.type==="registered"||r.type==="dispatch-event"?!0:r.type==="navigate"&&r.url?new URL(r.url,window.location.origin).origin!==window.location.origin:!1}ingestToolOutput(t){if(!t||typeof t!="object")return;const r=t;if(Array.isArray(r.resources))for(const u of r.resources)this.ingestResource(u);this.ingestResource(r.resource),this.ingestToolOutput(r.output)}ingestResource(t){if(!t||typeof t!="object")return;const r=t;r.resourceId&&r.permalink&&this.trustedResources.set(r.resourceId,{resourceId:r.resourceId,permalink:r.permalink,title:r.title,resourceType:typeof r.resourceType=="string"?r.resourceType:void 0,metadataName:typeof r.metadataName=="string"?r.metadataName:void 0})}showStatus(t){t&&window.dispatchEvent(new CustomEvent("summaraid:agent-status",{detail:{message:t}}))}findCommentInput(){const t=this.commentContainers();for(const u of t){const n=this.findWritableCommentInput(u);if(n)return{container:u,input:n}}const r=this.findWritableCommentInput(document.body);return r?{container:void 0,input:r}:void 0}commentContainers(){return[...document.querySelectorAll(["#comment","#comments","halo-comment","[data-comment]",".comment",".comments",".comment-form"].join(","))]}findCommentArea(){return this.commentContainers()[0]}collectHeadings(){return[...document.querySelectorAll("h1,h2,h3")].map(t=>({level:Number(t.tagName.slice(1)),text:(t.textContent??"").trim()})).filter(t=>t.text).slice(0,8)}collectFormSummaries(){return[...document.querySelectorAll("form")].map(t=>({id:t.id||void 0,name:t.getAttribute("name")||void 0,fields:[...t.querySelectorAll("input,textarea,select")].map(r=>r.getAttribute("name")||r.getAttribute("aria-label")||r.id).filter(r=>!!r).slice(0,12),submitLabels:[...t.querySelectorAll("button,input[type='submit']")].map(r=>(r.textContent||r.getAttribute("value")||r.getAttribute("aria-label")||"").trim()).filter(r=>r).slice(0,6)})).slice(0,6)}collectLinkSummaries(){return[...document.querySelectorAll("a[href]")].map((t,r)=>({linkId:`link-${r}`,text:(t.textContent??"").trim().replace(/\s+/g," "),href:t.href})).filter(t=>t.text&&this.isAllowedUrl(new URL(t.href))).slice(0,30)}findWritableCommentInput(t){const r=["textarea:not([disabled]):not([readonly])","[contenteditable='true']","[contenteditable='']","input[name='content']:not([disabled]):not([readonly])","input[name='comment']:not([disabled]):not([readonly])"];for(const u of r){const n=this.deepQuerySelector(t,u);if(n&&this.isWritableCommentInput(n))return n}}findCommentSubmitButton(t){const r=["button[type='submit']:not([disabled])","input[type='submit']:not([disabled])","button:not([disabled])","[role='button']:not([aria-disabled='true'])"];for(const u of r){const i=this.deepQuerySelectorAll(t,u).find(a=>{const s=`${a.textContent??""} ${a.getAttribute("aria-label")??""} ${a.getAttribute("value")??""}`.trim();return/提交|评论|发送|发布|回复|submit|send|post|reply/i.test(s)});if(i)return i}}deepQuerySelector(t,r){return this.deepQuerySelectorAll(t,r)[0]}deepQuerySelectorAll(t,r){const u=[],n=i=>{if("querySelectorAll"in i){u.push(...i.querySelectorAll(r));for(const a of[...i.querySelectorAll("*")])a.shadowRoot&&n(a.shadowRoot)}};return n(t),u}isWritableCommentInput(t){return t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement||t instanceof HTMLElement&&t.isContentEditable}writeCommentInput(t,r){t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement?Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t),"value")?.set?.call(t,r):t.textContent=r;const u=typeof InputEvent=="function"?new InputEvent("input",{bubbles:!0,inputType:"insertText",data:r}):new Event("input",{bubbles:!0});t.dispatchEvent(u),t.dispatchEvent(new Event("change",{bubbles:!0}))}}function Ec(e){return e.type.startsWith("tool-")}function yr(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function z(e,t){return{ok:!1,errorCode:e,message:t}}function yn(e,t){return["border:none","border-radius:.55rem","padding:.35rem .65rem","font:inherit","font-weight:700",`background:${e}`,`color:${t}`,"cursor:pointer"].join(";")}function Sc(e){return e.trim().replace(/^(打开|跳转到?|带我去|看看|查看|进入|去一下|访问)\s*/u,"").replace(/[。！？?!,.，、\s]/gu,"").toLowerCase()}function _n(e){return(e??"").trim().replace(/[。！？?!,.，、\s_-]/gu,"").toLowerCase()}function Dc(e){return!(e.length<2||e.length>18||/^(为什么|怎么|如何|什么|是否|能不能|可不可以|介绍|解释|总结|告诉我)/u.test(e))}function Tc(e,t){const r=_n(e.title),u=_n(e.metadataName),a=(e.resourceType??"").includes("singlepage")?20:0;return r&&r===t?100+a:u&&u===t?92+a:r&&(t.includes(r)||r.includes(t))&&Math.min(r.length,t.length)>=2?80+a:u&&(t.includes(u)||u.includes(t))&&Math.min(u.length,t.length)>=2?70+a:0}const $c=/^[A-Za-z][A-Za-z0-9_-]*$/;class Pc extends dn{async*processResponse(t){const r=new Map,u=t.headers.get("X-SummaraidGPT-Trace-Id");let n=0;for await(const i of super.processResponse(t)){if(n+=1,!i?.type?.startsWith("tool-")){yield i;continue}const a=i,s=typeof a.toolCallId=="string"?a.toolCallId:"",o=r.get(s),l=a.toolName==null||typeof a.toolName=="string"&&!a.toolName.trim()?o:a.toolName,d={eventType:i.type,eventIndex:n,toolName:a.toolName,toolCallId:a.toolCallId,previousName:o,traceId:u};if(l==null)throw new _r("missing-name",d);if(typeof l!="string"||!$c.test(l))throw new _r("invalid-name",d);if(o&&o!==l)throw new _r("conflicting-name",d);s.trim()&&r.set(s,l),yield{...i,toolName:l}}}}class _r extends Error{constructor(t,r){const u={"missing-name":"工具调用事件缺少 toolName，且没有同一调用的已知工具名可供补全。","invalid-name":"工具名格式无效：必须以英文字母开头，后续只能包含字母、数字、下划线或连字符。","conflicting-name":"同一个 toolCallId 返回了不同的工具名，已停止本次调用。"};super([`Agent 工具调用协议异常：${u[t]}`,`事件：${nt(r.eventType)}（第 ${r.eventIndex} 个）`,`工具名：${nt(r.toolName)}`,`调用 ID：${nt(r.toolCallId)}`,...r.previousName?[`此前工具名：${nt(r.previousName)}`]:[],...r.traceId?[`追踪 ID：${nt(r.traceId)}`]:[],"请站长检查模型的工具调用输出及 AI Foundation 版本，结合服务端日志排查。"].join(`
`)),this.name="AgentToolStreamError",this.reason=t,this.details=r}}function nt(e){return e==null?"（缺失）":typeof e!="string"?`（类型错误：${typeof e}）`:JSON.stringify(e.length>160?`${e.slice(0,160)}...`:e)}const Fc=new Set(["search_halo_resources","get_halo_resource_detail","get_latest_halo_resources","get_categories","get_tags","get_posts_by_category","get_posts_by_tag","get_pages","search_rag_resources","get_rag_resource_detail","fetch_allowed_url"]),Mc=6;class vn{async sendMessage(t,r,u={}){const n=new kc(r.agent);this.runtime=n;const i=new Set,a=new Map,s=new Set,o=new Set,c=new Set,l=new Set,d=g=>n.canExecute(g.toolName)||oe(g.toolName)&&(g.state==="approval-requested"||g.state==="approval-responded");let h="";jc(r.historyMessages??[],c);const f=g=>{const C=g.finally(()=>i.delete(C));return i.add(C),C},p=()=>this.chat?.status==="submitted"||this.chat?.status==="streaming",k=g=>{if(!s.has(g.toolCallId)){if(p()){a.set(g.toolCallId,g);return}return s.add(g.toolCallId),n.canExecute(g.toolName)?f(n.execute(g).then(C=>(Dt(C)&&St({displayMode:r.afterNavigationDisplayMode,resume:{historyMessages:qc(this.chat.messages,g,C)}}),this.chat.addToolOutput({toolCallId:g.toolCallId,toolName:g.toolName,output:C}).then(()=>C))).then(C=>{Dt(C)&&St({displayMode:r.afterNavigationDisplayMode,resume:{historyMessages:vr(this.chat.messages)}})}).then(()=>{})):Fc.has(g.toolName)||oe(g.toolName)?void 0:f(this.chat.addToolOutput({toolCallId:g.toolCallId,toolName:g.toolName,state:"output-error",errorText:"当前页面没有启用这个浏览器能力"}).then(()=>{}))}},y=()=>{if(!this.chat){a.clear();return}if(p()||a.size===0)return;const g=[...a.values()];a.clear(),g.forEach(k)},D=async()=>{for(;(i.size>0||a.size>0)&&(y(),i.size!==0);)await Promise.allSettled([...i])},b=()=>{const g=this.chat;if(!g)return;const C=Tt(g.messages);if(C.some(Sn))return;const M=Ic(C);if(!M.length)return;const B=JSON.stringify(M.map($=>[$.id,$.title,$.url,$.sourceType]));B!==h&&(h=B,u.onSources?.(M))};this.chat=new Q0({id:"summaraid-rag-agent",messages:r.historyMessages??[],transport:new Pc({api:`${Ze}/ragAgentChat`,credentials:"same-origin",body:{conversationId:r.conversationId,visitorId:r.visitorId,recordUserMessage:r.recordUserMessage!==!1,ragEnabledForAgent:r.ragEnabledForAgent===!0},prepareSendMessagesRequest:g=>{for(const C of Dn(g.messages,d))l.add(C);return{body:{...g.body,messages:o0(g.messages)}}}}),onError:g=>{console.error("[summaraidGPT] Agent chat stream failed",g),u.onError?.(g.message)},onToolCall:g=>{if(g.state==="input-available")return k(g)},sendAutomaticallyWhen:({messages:g})=>{const C=Dn(g,d);return Bc(g,d)&&C.some(M=>!l.has(M))},maxAutomaticSteps:5,onFinish:({messages:g,isAbort:C,isError:M})=>{!C&&!M&&u.onFinish?.(g)}});const _=this.chat.subscribe(()=>{const g=this.chat;if(!g)return;const C=g.messages[g.messages.length-1];if(n.ingestMessages(g.messages),Wc(g.messages,c),u.onToolResults?.(en(Tt(g.messages))),b(),!C||C.role!=="assistant"){y();return}for(const $ of C.parts)Pn($,c),W($)&&$.state==="input-available"&&k($),W($)&&$.state==="approval-requested"&&$.approval?.id&&!o.has($.approval.id)&&(o.add($.approval.id),f(n.requestApproval(`要我帮你执行「${xe($.toolName)}」吗？${oe($.toolName)?`
参数：${JSON.stringify($.input??{}).slice(0,800)}`:""}`).then(Ne=>r.signal?.aborted||this.chat!==g?void 0:g.addToolApprovalResponse({id:$.approval?.id,toolCallId:$.toolCallId,toolName:$.toolName,approved:Ne,reason:Ne?"Approved by visitor":"Denied by visitor"})).then(()=>{})));const M=n.tryOpenStrongResourceMatch(t);M?.ok&&Dt(M)&&St({displayMode:r.afterNavigationDisplayMode,resume:{historyMessages:vr(g.messages)}});const B=Oc(g.messages);B!==void 0&&u.onText?.(B),y()}),v=()=>this.stop();r.signal?.addEventListener("abort",v,{once:!0});const w=this.chat;try{if(await w.sendMessage({text:t}),y(),await D(),b(),r.signal?.aborted||u.onFinish?.(w.messages),w.error)throw w.error;return w.messages}catch(g){throw console.error("[summaraidGPT] Agent chat request failed",g),g}finally{r.signal?.removeEventListener("abort",v),n.cancelPendingApprovals(),this.runtime===n&&(this.runtime=void 0),_()}}stop(){this.runtime?.cancelPendingApprovals(),this.runtime=void 0,this.chat?.stop(),this.chat=void 0}}function Ic(e){const t=[];let r=0;const u=a=>{if(!a||typeof a!="object")return;const s=a;if(Array.isArray(s.resources))for(const o of s.resources)wn(o,t,1,r++);wn(s.resource,t,2,r++),u(s.output)};for(const a of e)for(const s of a.parts)W(s)&&s.state==="output-available"&&u(s.output);const n=Rc(t),i=n.some(a=>a.priority>=2);return n.filter(a=>!i||a.priority>=2).sort(Nc).slice(0,Mc).map(a=>a.source)}function wn(e,t,r,u){if(!e||typeof e!="object")return;const n=e,i=le(n.resourceId)||le(n.id);i&&t.push({priority:r,order:u,source:{id:i,title:le(n.title),url:le(n.permalink)||le(n.url),sourceType:le(n.resourceType),content:le(n.excerpt),metadata:{metadataName:le(n.metadataName)||""}}})}function Rc(e){const t=[];for(const r of e){const u=Cn(r.source),n=t.find(a=>Cn(a.source).some(s=>u.includes(s)));if(!n){t.push({...r});continue}const i=n.priority;n.priority=Math.max(n.priority,r.priority),n.order=Math.min(n.order,r.order),(Ie(r.source)>Ie(n.source)||Ie(r.source)===Ie(n.source)&&r.priority>i)&&(n.source=r.source)}return t}function Nc(e,t){return t.priority-e.priority||Ie(t.source)-Ie(e.source)||e.order-t.order}function Cn(e){return[e.id?`id:${e.id}`:void 0,An(e.url)?`url:${An(e.url)}`:void 0,kn(e.title)?`title:${kn(e.title)}`:void 0].filter(t=>!!t)}function Ie(e){const t=e.sourceType?.toLowerCase()||"";return t.includes("post.content.halo.run")||t.includes("singlepage.content.halo.run")?3:t.includes("ragdocument")?2:e.url?1:0}function An(e){if(!e)return"";try{const t=new URL(e,window.location.origin);return t.hash="",t.href.replace(/\/$/,"").toLowerCase()}catch{return e.trim().replace(/\/$/,"").toLowerCase()}}function kn(e){return e?.trim().replace(/\s+/g," ").toLowerCase()||""}function En(e){return zc(e.parts.filter(t=>t.type==="text").map(t=>t.text).join(""))}function zc(e){return e.replace(/<\|tool_calls_section_begin\|>[\s\S]*?(?:<\|tool_calls_section_end\|>|$)/g,"").replace(/<\|tool_call_begin\|>[\s\S]*?(?:<\|tool_call_end\|>|$)/g,"").replace(/<\|tool_call_argument_begin\|>[\s\S]*?(?:<\|tool_call_end\|>|$)/g,"").replace(/<\|tool_[^>\s]*(?:\|>)?/g,"").trimEnd()}function Oc(e){const t=Tt(e),r=[...t].reverse().find(i=>i.role==="assistant");if(!r)return;if(!t.some(i=>i.parts.some(a=>W(a))))return En(r);if(t.some(Sn))return"";const n=Lc(r);return n<0?En(r):r.parts.slice(n+1).filter(i=>i.type==="text").map(i=>i.text).join("")}function Lc(e){for(let t=e.parts.length-1;t>=0;t-=1)if(W(e.parts[t]))return t;return-1}function Sn(e){return e.parts.some(t=>W(t)&&t.state!=="output-available"&&t.state!=="output-error"&&t.state!=="output-denied"&&t.state!=="approval-responded")}function Dn(e,t=()=>!0){const r=[...e].reverse().find(n=>n.role==="assistant");if(!r)return[];const u=r.parts.filter(n=>W(n)).filter(t).filter(Tn).map(Uc);return[...new Set(u)]}function Bc(e,t){const r=[...e].reverse().find(n=>n.role==="assistant");if(!r)return!1;const u=r.parts.filter(n=>W(n)).filter(t);return u.length>0&&u.every(Tn)}function Tn(e){return $n(e)||e.state==="approval-responded"}function Uc(e){return JSON.stringify({toolCallId:e.toolCallId,toolName:e.toolName,state:e.state,approvalId:e.approval?.id,approved:e.approval?.approved})}function $n(e){return e.state==="output-available"||e.state==="output-error"||e.state==="output-denied"}function Dt(e){if(typeof e!="object"||e===null)return!1;const t=e;return t.navigating===!0?t.pageReload!==!1:Dt(t.output)}function qc(e,t,r){return vr(e.map(u=>{if(u.role!=="assistant")return u;const n=u.parts.map(i=>!W(i)||i.toolCallId!==t.toolCallId?i:{...i,type:`tool-${t.toolName}`,toolName:t.toolName,toolCallId:t.toolCallId,state:"output-available",output:r});return{...u,parts:n}}))}function vr(e,t){return Hc(hc(e,{maxMessages:t}))}function Hc(e){const t=new Set;return[...e].reverse().map(r=>{if(r.role!=="assistant")return r;const u=[...r.parts].reverse().filter(n=>!W(n)||!$n(n)?!0:t.has(n.toolCallId)?!1:(t.add(n.toolCallId),!0)).reverse();return u.length===r.parts.length?r:{...r,parts:u}}).reverse().filter(r=>r.parts.length>0)}function W(e){return e.type.startsWith("tool-")}function le(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function Tt(e){for(let t=e.length-1;t>=0;t-=1)if(e[t].role==="user")return e.slice(t+1);return e}function jc(e,t){for(const r of e)for(const u of r.parts)W(u)&&t.add(`${u.toolCallId}:${u.state}`)}function Wc(e,t){for(const r of Tt(e))for(const u of r.parts)Pn(u,t)}function Pn(e,t){if(!W(e))return;const r=`${e.toolCallId}:${e.state}`;if(t.has(r))return;const u=Gc(e);u&&(t.add(r),window.dispatchEvent(new CustomEvent("summaraid:agent-status",{detail:u})))}function Gc(e){if(e.state==="input-available")return{message:Vc(e.toolName),kind:"pending"};if(e.state==="approval-requested")return{message:`等待确认「${xe(e.toolName)}」`,kind:"warning"};if(e.state==="output-available")return oe(e.toolName)&&e.output&&typeof e.output=="object"&&e.output.ok===!1?{message:`${xe(e.toolName)}调用失败`,kind:"error"}:{message:Zc(e.toolName,e.output),kind:"success"};if(e.state==="output-error")return{message:`${xe(e.toolName)}失败`,kind:"error"};if(e.state==="output-denied")return{message:`已取消「${xe(e.toolName)}」`,kind:"warning"}}function Vc(e){return oe(e)?"正在调用 MCP 外部工具":{get_current_page_context:"正在读取当前页面",search_halo_resources:"正在搜索站内内容",get_halo_resource_detail:"正在读取站内资源",get_latest_halo_resources:"正在查看最新内容",get_categories:"正在查看分类",get_tags:"正在查看标签",get_posts_by_category:"正在查看分类文章",get_posts_by_tag:"正在查看标签文章",get_pages:"正在查找页面",search_rag_resources:"正在检索知识库",get_rag_resource_detail:"正在读取知识库详情",open_halo_resource:"正在打开页面",open_current_page_link:"正在打开当前页链接",open_comment_area:"正在定位评论区",draft_comment:"正在填写评论草稿",submit_comment:"正在提交评论",fetch_allowed_url:"正在读取外部资料"}[e]||`正在执行「${xe(e)}」`}function Zc(e,t){const r=Fn(t);return e==="search_rag_resources"?r>0?`知识库命中 ${r} 条资料`:"知识库没有命中资料":e==="search_halo_resources"||e==="get_pages"?r>0?`找到 ${r} 个站内资源`:"没有找到匹配资源":e==="get_current_page_context"?"已读取当前页面":e.startsWith("open_")?"页面打开请求已发送":e.includes("comment")?"评论操作已处理":`${xe(e)}完成`}function xe(e){return oe(e)?`MCP · ${Ku(e)}`:{get_current_page_context:"读取页面",search_halo_resources:"站内搜索",search_rag_resources:"知识库检索",get_rag_resource_detail:"知识库详情",open_halo_resource:"打开页面",open_current_page_link:"打开链接",draft_comment:"评论草稿",submit_comment:"提交评论"}[e]||e.replace(/^tool-/,"").replace(/_/g," ")}function Fn(e){if(!e||typeof e!="object")return 0;const t=e;return Array.isArray(t.resources)?t.resources.length:t.resource?1:Fn(t.output)}async function Yc(){try{const e=await fetch(`${Ze}/mcpCapabilities`,{credentials:"same-origin",cache:"no-store"});if(!e.ok)return[];const t=await e.json();return Array.isArray(t)?t.slice(0,12).filter(r=>typeof r?.id=="string"&&typeof r?.title=="string"&&typeof r?.prompt=="string"&&typeof r?.service=="string"):[]}catch{return[]}}function Mn(e,t,r){return e.length?m`<details class="mcp-capabilities"><summary>可用工具 <span>${e.length}</span></summary>
    <div class="mcp-capability-list">${e.map(u=>m`
      <button type="button" ?disabled=${t} @click=${()=>r(u.prompt)}
        title=${u.prompt}><strong>${u.title}</strong><small>${u.service}${u.approval?" · 执行前确认":""}</small></button>
    `)}</div><p>选择工具会填入示例问题，编辑后发送。</p></details>`:x}function In(e){return Array.isArray(e)?e.slice(0,16).flatMap((t,r)=>{if(!t||typeof t.id!="string"||typeof t.title!="string")return[];let u=t.structuredContent;if(typeof t.structuredJson=="string"&&t.structuredJson.length<=12e3)try{u=JSON.parse(t.structuredJson)}catch{}const n=en([{id:"restore",role:"assistant",parts:[{type:"tool-mcp_000000000000_history",toolName:"mcp_000000000000_history",toolCallId:t.id,state:"output-available",output:{kind:"mcp",server:t.title,tool:"",content:t.content,structuredContent:u,truncated:t.truncated}}]}])[0];if(!n)return[];const i=t.status==="pending"||t.status==="approval";return[{...n,id:t.id||`history-${r}`,title:t.title.slice(0,260),status:i?"cancelled":["success","error","cancelled"].includes(t.status)?t.status:"cancelled",content:i?[{type:"text",text:"上次调用尚未完成。重新提问可再次发起，工具不会自动执行。"}]:n.content}]}):[]}function Jc(e){return e.filter(t=>t.role==="assistant"||t.role==="user").filter(t=>t.content?.trim()||t.toolResults?.length).map((t,r)=>{const u=t.id||`restored-${r}`,i=In(t.toolResults).filter(s=>s.status==="success"||s.status==="error").map(s=>({tool:s.title,status:s.status,content:s.content.filter(o=>o.type!=="image"),structuredContent:s.structuredContent})),a=[t.content||"",i.length?`
[上次外部工具返回的资料，仅供参考]
${JSON.stringify(i).slice(0,24e3)}`:""].join("");return{id:u,role:t.role==="assistant"?"assistant":"user",parts:[{type:"text",id:`${u}-text`,text:a}]}})}const Rn={ATTRIBUTE:1,CHILD:2},Nn=e=>(...t)=>({_$litDirective$:e,values:t});let zn=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,r,u){this._$Ct=t,this._$AM=r,this._$Ci=u}_$AS(t,r){return this.update(t,r)}update(t,r){return this.render(...r)}};class wr extends zn{constructor(t){if(super(t),this.it=x,t.type!==Rn.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===x||t==null)return this._t=void 0,this.it=t;if(t===ne)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const r=[t];return r.raw=r,this._t={_$litType$:this.constructor.resultType,strings:r,values:[]}}}wr.directiveName="unsafeHTML",wr.resultType=1;const On=Nn(wr);const Ln="important",Qc=" !"+Ln,Xc=Nn(class extends zn{constructor(e){if(super(e),e.type!==Rn.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,r)=>{const u=e[r];return u==null?t:t+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${u};`},"")}update(e,[t]){const{style:r}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(const u of this.ft)t[u]==null&&(this.ft.delete(u),u.includes("-")?r.removeProperty(u):r[u]=null);for(const u in t){const n=t[u];if(n!=null){this.ft.add(u);const i=typeof n=="string"&&n.endsWith(Qc);u.includes("-")||i?r.setProperty(u,i?n.slice(0,-11):n,i?Ln:""):r[u]=n}}return ne}}),Bn="ri:book-open-line",Un="https://api.iconify.design",qn=/^([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)$/i;function Z(e,t="iconify-icon"){const r=Kc(e)||Cr(Bn);return m`
    <span
      class=${t}
      style=${Xc({"--rag-icon-source":`url("${r}")`})}
      aria-hidden="true"
    ></span>
  `}function Kc(e){const t=e?.trim();if(t){if(el(t))return Cr(t);if(tl(t))return nl(t);if(rl(t)||ul(t))return t}}function el(e){return qn.test(e)}function Cr(e){const t=e.match(qn);if(!t)return Cr(Bn);const[,r,u]=t;return`${Un}/${encodeURIComponent(r)}/${encodeURIComponent(u)}.svg`}function tl(e){return e.startsWith("<svg")&&e.endsWith("</svg>")}function rl(e){return e.startsWith("data:image/svg+xml")}function ul(e){try{const t=new URL(e);return t.origin===Un&&t.pathname.endsWith(".svg")}catch{return!1}}function nl(e){return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`}function Hn(){return Z("ri:close-line")}function jn(){return Z("ri:send-plane-2-line")}function Ar(){return Z("ri:chat-new-line")}function il(){return Z("ri:file-text-line")}function al(){return Z("ri:external-link-line")}function sl(){return Z("ri:fullscreen-line")}function ol(){return Z("ri:focus-3-line")}function ye(){return Z("ri:question-answer-line")}function Wn(){return Z("ri:file-copy-line")}function Gn(){return Z("ri:refresh-line")}function Vn(){return Z("ri:stop-circle-line")}function Zn(e){return m`<div class="pet-source-list">${e.map(t=>cl(t))}</div>`}function cl(e){const t=dl(e),r=m`
    <span class="pet-source-icon">${il()}</span>
    <span class="pet-source-main">
      <span class="pet-source-title">${ll(e)}</span>
      ${t?m`<span class="pet-source-meta">${t}</span>`:x}
    </span>
    ${e.url?m`<span class="pet-source-open">${al()}</span>`:x}
  `;return e.url?m`
        <a class="pet-source-row" href=${e.url} target="_blank" rel="noopener noreferrer">
          ${r}
        </a>
      `:m`<div class="pet-source-row">${r}</div>`}function ll(e){const t=e.title?.trim();return t?`《${t}》`:"未命名来源"}function dl(e){return[pl(e.sourceType),typeof e.score=="number"?`score ${fl(e.score)}`:void 0,e.chunkCount?`${e.chunkCount} 分块`:void 0,e.chunkIndexes?.length?`#${e.chunkIndexes.join(", #")}`:void 0].filter(Boolean).join(" · ")}function pl(e){if(!e)return;const t=e.trim().toLowerCase();return{"ragdocument.summaraidgpt.lik.cc":"RAG 知识库","post.content.halo.run":"站内文章","singlepage.content.halo.run":"独立页面","category.content.halo.run":"分类","tag.content.halo.run":"标签",post:"站内文章",page:"独立页面",docsme:"Docsme 文档",manual:"手动导入",attachment:"附件"}[t]||void 0}function fl(e){return Number.isFinite(e)?Math.abs(e)>=10?e.toFixed(2):e.toFixed(4):"-"}function Yn(){return m`<span class="typing" aria-label="正在输出"><span></span><span></span><span></span></span>`}function hl(e){return m`
    <section
      class=${e.resizing?"pet-panel resizing":"pet-panel"}
      style=${e.panelStyle}
      aria-label="宠物问答"
    >
      <button
        class="pet-panel-resize"
        type="button"
        title="拖拽调整高度"
        aria-label="拖拽调整对话框高度"
        @pointerdown=${e.onResizePointerDown}
      ></button>
      <div class="pet-panel-head">
        <div class="pet-panel-title-wrap">
          ${gl(e)}
          <div class="pet-panel-title">
            <span class="pet-panel-kicker">${e.assistantName}</span>
            <strong>${e.statusText}</strong>
          </div>
        </div>
        <div class="pet-panel-actions">
          <button
            class="pet-panel-action is-primary"
            type="button"
            title="全屏会话"
            aria-label="全屏会话"
            data-tooltip="全屏会话"
            @click=${e.onOpenStage}
          >
            ${sl()}
          </button>
          <button
            class="pet-panel-action"
            type="button"
            title="新会话"
            aria-label="新会话"
            data-tooltip="新会话"
            @click=${e.onNewConversation}
          >
            ${Ar()}
          </button>
          ${e.streaming?m`
                <button
                  class="pet-panel-action is-danger"
                  type="button"
                  title="停止生成"
                  aria-label="停止生成"
                  data-tooltip="停止生成"
                  @click=${e.onStop}
                >
                  ${Vn()}
                </button>
              `:x}
        </div>
      </div>

      <div class="pet-panel-content">
        ${Mn(e.mcpCapabilities||[],e.streaming,e.onUsePrompt)}
        ${e.selectedContext?m`
              <div class="pet-context">
                <span>选中内容</span>
                <p>${e.selectedContextPreview}</p>
                <button type="button" title="移除选中内容" @click=${e.onClearSelectedContext}>
                  ${Hn()}
                </button>
              </div>
            `:x}

        ${e.messages.length?xl(e):bl(e)}
      </div>

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
          ${jn()}
        </button>
      </form>
    </section>
  `}function gl(e){const t=e.assistantAvatar?.trim();return m`
    <span class=${t?"pet-panel-avatar has-image":"pet-panel-avatar"} aria-hidden="true">
      <span class="pet-panel-avatar-fallback">${e.avatarFallbackText}</span>
      ${t?m`
            <img
              class="pet-panel-avatar-image"
              src=${t}
              alt=""
              @error=${ml}
            />
          `:x}
    </span>
  `}function ml(e){const t=e.currentTarget;t instanceof HTMLImageElement&&(t.parentElement?.classList.remove("has-image"),t.remove())}function bl(e){return m`
    <div class="pet-panel-empty">
      <p class="pet-panel-welcome">${e.welcomeMessage}</p>
      ${e.quickQuestions.length?m`
            <div class="pet-panel-quick">
              ${e.quickQuestions.map(t=>m`
                <button type="button" @click=${()=>e.onUsePrompt(t)}>
                  ${ye()}<span>${t}</span>
                </button>
              `)}
            </div>
          `:x}
    </div>
  `}function xl(e){return m`
    <div class="pet-panel-thread" aria-live="polite">
      ${e.messages.map(t=>yl(t,e))}
    </div>
  `}function yl(e,t){const r=e.sources||[],u=e.content||(e.streaming?"正在思考中...":"");return m`
    <article class=${`pet-panel-message ${e.role}`}>
      <div class="pet-panel-message-meta">
        <span>${e.role==="user"?"我":"助手"}</span>
        <time>${e.time}</time>
        <span class="pet-message-actions">
          <button type="button" title="复制" @click=${()=>t.onCopyMessage(e)}>
            ${Wn()}
          </button>
          <button
            type="button"
            title=${e.role==="assistant"?"重新生成":"再次发送"}
            ?disabled=${t.streaming}
            @click=${()=>t.onRetryMessage(e)}
          >
            ${Gn()}
          </button>
        </span>
      </div>
      <div class=${`pet-panel-bubble${e.error?" error":""}${e.streaming?" streaming":""}`}>
        ${e.role==="assistant"&&!e.error?m`<div class="markdown-body">${On(Xu(u))}</div>`:m`<span class="message-text">${u}</span>`}
        ${e.streaming?Yn():x}
      </div>
      ${e.role==="assistant"?tn(e.toolResults):x}
      ${r.length?m`
            <details class="pet-panel-sources">
              <summary>${ye()} ${r.length} 个关联资源</summary>
              ${Zn(r)}
            </details>
          `:x}
    </article>
  `}function _l(e){return m`
    <div class="pet-stage-backdrop" @click=${e.onClose}></div>
    <section class="pet-stage" role="dialog" aria-label=${`${e.assistantName} 会话`}>
      <header class="pet-stage-head">
        <div class="pet-stage-title">
          <span>${e.assistantName}</span>
          <strong>${e.statusText}</strong>
        </div>
        <div class="pet-stage-actions">
          <button
            class="pet-stage-action"
            type="button"
            ?disabled=${!e.hasSources}
            @click=${e.onExpandLatestSources}
          >
            ${ye()} 关联资源
          </button>
          <button class="pet-stage-action" type="button" @click=${e.onNewConversation}>
            ${Ar()} 新聊
          </button>
          ${e.streaming?m`
                <button class="pet-stage-action is-danger" type="button" @click=${e.onStop}>
                  ${Vn()} 停止
                </button>
              `:x}
        </div>
        <button class="pet-stage-close" type="button" title="关闭" aria-label="关闭" @click=${e.onClose}>
          ${Hn()}
        </button>
      </header>
      <main class="pet-stage-output">
        <div class="pet-stage-output-inner">
          ${e.messages.length?e.messages.map(t=>wl(t,e)):Cl(e)}
        </div>
      </main>
      <footer class="pet-stage-footer">
        ${Mn(e.mcpCapabilities||[],e.streaming,e.onUsePrompt)}
        ${vl(e)}
        ${Sl(e)}
        <div class="pet-stage-note">内容由 AI 生成，仅供参考</div>
      </footer>
    </section>
  `}function vl(e){return m`
    <div class="pet-stage-shortcuts" aria-label="快捷操作">
      ${e.quickQuestions.map(t=>m`
        <button type="button" @click=${()=>e.onUsePrompt(t)}>
          ${ye()}<span>${t}</span>
        </button>
      `)}
      <button type="button" ?disabled=${!e.hasSources} @click=${e.onExpandLatestSources}>
        ${ye()}<span>关联资源</span>
      </button>
      <button type="button" @click=${e.onNewConversation}>
        ${Ar()}<span>新会话</span>
      </button>
      <button type="button" @click=${e.onClose}>
        ${ol()}<span>收起</span>
      </button>
    </div>
  `}function wl(e,t){const r=e.sources||[];return m`
    <article class=${`pet-stage-message ${e.role}`}>
      ${e.role==="assistant"?Jn(t):x}
      <div class="pet-stage-message-stack">
        <div class=${`pet-stage-bubble${e.error?" error":""}${e.streaming?" streaming":""}`}>
          ${El(e)}
          ${e.streaming?Yn():x}
        </div>
        <div class="pet-stage-message-actions">
          <button type="button" title="复制" @click=${()=>t.onCopyMessage(e)}>
            ${Wn()}<span>复制</span>
          </button>
          <button
            type="button"
            title=${e.role==="assistant"?"重新生成":"再次发送"}
            ?disabled=${t.streaming}
            @click=${()=>t.onRetryMessage(e)}
          >
            ${Gn()}<span>${e.role==="assistant"?"重试":"再问"}</span>
          </button>
        </div>
        ${e.role==="assistant"?tn(e.toolResults):x}
        ${e.role==="assistant"?kl(r,e.id,t):x}
        <div class="pet-stage-time">${e.time}</div>
      </div>
    </article>
  `}function Cl(e){return m`
    <div class="pet-stage-message assistant">
      ${Jn(e)}
      <div class="pet-stage-message-stack">
        <div class="pet-stage-bubble">
          <span class="message-text">${e.welcomeMessage}</span>
        </div>
        <div class="pet-stage-time">${e.welcomeTime}</div>
      </div>
    </div>
  `}function Jn(e){const t=e.assistantAvatar?.trim();return m`
    <span class=${t?"pet-stage-avatar has-image":"pet-stage-avatar"} aria-hidden="true">
      <span class="pet-stage-avatar-fallback">${e.avatarFallbackText}</span>
      ${t?m`
            <img
              class="pet-stage-avatar-image"
              src=${t}
              alt=""
              @error=${Al}
            />
          `:x}
    </span>
  `}function Al(e){const t=e.currentTarget;t instanceof HTMLImageElement&&(t.parentElement?.classList.remove("has-image"),t.remove())}function kl(e,t,r){return e.length?m`
    <details
      class="pet-stage-sources"
      ?open=${r.isSourceReferencesOpen(t)}
      @toggle=${u=>r.onToggleSourceReferences(t,u)}
    >
      <summary>
        ${ye()} <span>${e.length} 个关联资源</span>
      </summary>
      ${Zn(e)}
    </details>
  `:x}function El(e){const t=e.content||(e.streaming?"正在思考中...":"");return e.role==="assistant"&&!e.error&&t?m`<div class="message-text markdown-body">${On(Xu(t))}</div>`:m`<span class="message-text">${t}</span>`}function Sl(e){return m`
    <div class="composer-wrap">
      <form class="composer" @submit=${e.onSubmit}>
        <textarea
          class="conversation-input input"
          rows="1"
          .value=${e.input}
          placeholder=${e.inputPlaceholder||iu}
          ?disabled=${e.streaming}
          @input=${e.onInput}
          @keydown=${e.onKeydown}
          @compositionstart=${e.onCompositionStart}
          @compositionend=${e.onCompositionEnd}
        ></textarea>
        <button class="send" type="submit" ?disabled=${e.streaming||!e.input.trim()} aria-label="发送">
          ${jn()}
        </button>
      </form>
    </div>
  `}function Dl(e,t,r="问助手"){return e.visible?m`
    <div
      class="selection-popover"
      style=${`left:${e.x}px;top:${e.y}px`}
    >
      <button type="button" @click=${t}>
        ${ye()} ${r}
      </button>
    </div>
  `:x}function Tl(e){const t=window.visualViewport,r=()=>{e.style.setProperty("--rag-viewport-width",`${t?.width||window.innerWidth}px`),e.style.setProperty("--rag-viewport-height",`${t?.height||window.innerHeight}px`),e.style.setProperty("--rag-viewport-left",`${t?.offsetLeft||0}px`),e.style.setProperty("--rag-viewport-top",`${t?.offsetTop||0}px`)};return r(),window.addEventListener("resize",r,{passive:!0}),t?.addEventListener("resize",r,{passive:!0}),t?.addEventListener("scroll",r,{passive:!0}),()=>{window.removeEventListener("resize",r),t?.removeEventListener("resize",r),t?.removeEventListener("scroll",r)}}var $l=Object.defineProperty,Pl=Object.getOwnPropertyDescriptor,S=(e,t,r,u)=>{for(var n=u>1?void 0:u?Pl(t,r):t,i=e.length-1,a;i>=0;i--)(a=e[i])&&(n=(u?a(t,r,n):a(n))||n);return u&&n&&$l(t,r,n),n};const Fl=1600,Qn="likcc_summaraidgpt_rag_assistant_position",kr="likcc_summaraidgpt_rag_conversation_id",Xn="likcc_summaraidgpt_rag_visitor_id",Kn="likcc_summaraidgpt_rag_panel_height",de=16,Ml=4,Re=318,ei=Re,Il=12;let E=class extends je{constructor(){super(...arguments),this.position="right",this.config=ke,this.configLoaded=!1,this.mcpCapabilities=[],this.open=!1,this.petPanelOpen=!1,this.input="",this.selectedContext="",this.messages=[],this.agentActivities=[],this.streaming=!1,this.composingInput=!1,this.expandedSourceMessageIds=[],this.selectionPopup=Me,this.floatingPositionReady=!1,this.petSpriteReady=!1,this.draggingBubble=!1,this.petFrameIndex=0,this.petHovering=!1,this.petDragDirection="",this.petErrorUntil=0,this.petSpeechVisible=!1,this.petSpeechIndex=0,this.petSpeechText="",this.petPanelHeight=Re,this.resizingPetPanel=!1,this.agentHistoryMessages=[],this.visitorId=this.loadOrCreateVisitorId(),this.suppressNextBubbleClick=!1,this.floatingPositionLocked=!1,this.petAnimationTimer=0,this.petSpeechTimer=0,this.petSpeechHideTimer=0,this.handleColorSchemeChange=()=>{this.config.styleConfig.colorMode==="auto"&&this.applyTheme()},this.handleEscape=e=>{e.key==="Escape"&&this.open&&(e.preventDefault(),this.close())},this.welcomeTime=$e(),this.handleDocumentMouseUp=()=>{window.setTimeout(()=>this.updateSelectionPopup(),0)},this.handleDocumentKeyUp=()=>{window.setTimeout(()=>this.updateSelectionPopup(),0)},this.handleDocumentMouseDown=e=>{e.composedPath().includes(this)||(this.clearSelectionPopup(),!this.streaming&&!this.open&&(this.petPanelOpen=!1))},this.handleWindowScroll=()=>{this.clearSelectionPopup()},this.handleWindowResize=()=>{this.clampCurrentFloatingPosition(),this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight)},this.handleAgentStatus=e=>{const t=e.detail,r=t?.message?.trim();r&&(this.petSpeechText=r,this.petSpeechVisible=!0,this.appendAgentActivity(r,t?.kind||"pending"))},this.handleBubblePointerMove=e=>{const t=this.bubbleDragState;if(!t||e.pointerId!==t.pointerId)return;const r=e.clientX-t.startX,u=e.clientY-t.startY,n=Math.hypot(r,u);!t.moved&&n<Ml||(t.moved=!0,this.draggingBubble=!0,this.petDragDirection=e.clientX>=t.lastX?"right":"left",t.lastX=e.clientX,e.preventDefault(),this.setFloatingPosition(this.clampFloatingPosition({x:t.originX+r,y:t.originY+u},this.bubbleWidth,this.bubbleHeight),!1))},this.handleBubblePointerEnd=e=>{const t=this.bubbleDragState;!t||e.pointerId!==t.pointerId||(t.target.hasPointerCapture(e.pointerId)&&t.target.releasePointerCapture(e.pointerId),this.unbindBubbleDragListeners(),this.bubbleDragState=void 0,this.draggingBubble=!1,this.petDragDirection="",t.moved&&this.floatingPosition&&(e.preventDefault(),this.suppressNextBubbleClick=!0,this.floatingPositionLocked=!0,this.saveFloatingPosition(this.floatingPosition),window.setTimeout(()=>{this.suppressNextBubbleClick=!1},0)))},this.handlePanelResizePointerMove=e=>{const t=this.panelResizeState;if(!t||e.pointerId!==t.pointerId)return;e.preventDefault();const r=e.clientY-t.startY;this.petPanelHeight=this.clampPetPanelHeight(t.startHeight-r)},this.handlePanelResizePointerEnd=e=>{const t=this.panelResizeState;!t||e.pointerId!==t.pointerId||(t.target.hasPointerCapture(e.pointerId)&&t.target.releasePointerCapture(e.pointerId),this.unbindPanelResizeListeners(),this.panelResizeState=void 0,this.resizingPetPanel=!1,this.savePetPanelHeight(this.petPanelHeight))}}connectedCallback(){super.connectedCallback(),this.stopObservingViewport=Tl(this),this.colorScheme=window.matchMedia?.("(prefers-color-scheme: dark)"),this.colorScheme?.addEventListener?this.colorScheme.addEventListener("change",this.handleColorSchemeChange):this.colorScheme?.addListener(this.handleColorSchemeChange),this.applyTheme(),this.petPanelHeight=this.clampPetPanelHeight(this.loadSavedPetPanelHeight()),this.floatingPositionLocked=this.applySavedFloatingPosition(),this.bindSelectionListeners(),window.addEventListener("resize",this.handleWindowResize,{passive:!0}),window.addEventListener("summaraid:agent-status",this.handleAgentStatus),window.addEventListener("keydown",this.handleEscape),this.initializeAssistant()}disconnectedCallback(){super.disconnectedCallback(),this.unbindSelectionListeners(),window.removeEventListener("resize",this.handleWindowResize),window.removeEventListener("summaraid:agent-status",this.handleAgentStatus),window.removeEventListener("keydown",this.handleEscape),this.stopObservingViewport?.(),this.colorScheme?.removeEventListener?this.colorScheme.removeEventListener("change",this.handleColorSchemeChange):this.colorScheme?.removeListener(this.handleColorSchemeChange),this.unbindBubbleDragListeners(),this.unbindPanelResizeListeners(),this.stopPetAnimation(),this.stopPetSpeechCycle(),this.abortCurrentRequest()}updated(e){(e.has("open")||e.has("petPanelOpen")||e.has("streaming"))&&this.syncPetThinkingSpeech(),(e.has("messages")||e.has("petPanelOpen"))&&this.scrollPetPanelToBottom()}openAssistant(e,t=!1){if(this.isPetOnlyMode){this.petPanelOpen=!1,this.open=!1,this.clearSelectionPopup(),this.showNextPetSpeech();return}if(this.petPanelOpen=!0,this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight),this.petSpeechVisible=!1,this.clearSelectionPopup(),e?.trim()){t?this.submitQuestion(e):(this.input=e,this.updateComplete.then(()=>this.focusPetInput()));return}this.updateComplete.then(()=>this.focusPetInput())}render(){return m`
      ${this.renderSelectionPopup()}
      ${this.open?x:this.renderBubble()}
      ${this.open&&!this.isPetOnlyMode?this.renderStage():x}
    `}async loadConfig(){const e=await da();this.config=e,this.configLoaded=!0,this.applyTheme(e),this.floatingPositionLocked?this.clampCurrentFloatingPosition():(this.position=e.buttonPosition,this.applyDefaultFloatingPosition(e)),this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight),this.floatingPositionReady=!0,await this.preparePetSprite(e)}async initializeAssistant(){if(await this.loadConfig(),this.isPetOnlyMode){this.open=!1,this.petPanelOpen=!1,this.clearSelectionPopup();return}await this.loadStoredConversation(),this.useAgentChat&&(this.mcpCapabilities=await Yc()),await this.resumeAgentAfterNavigationIfNeeded()}async resumeAgentAfterNavigationIfNeeded(){if(this.isPetOnlyMode)return;const e=yc();e?.openChat&&(this.open=e.displayMode==="stage",this.petPanelOpen=e.displayMode!=="stage",this.petSpeechVisible=!1,this.clearSelectionPopup(),await this.updateComplete,e.focusChatInput&&this.focusCurrentInput(),e.resume&&await this.resumeAgentAfterNavigation(e.resume))}bindSelectionListeners(){document.addEventListener("mouseup",this.handleDocumentMouseUp,{passive:!0}),document.addEventListener("keyup",this.handleDocumentKeyUp,{passive:!0}),document.addEventListener("mousedown",this.handleDocumentMouseDown),window.addEventListener("scroll",this.handleWindowScroll,{passive:!0})}unbindSelectionListeners(){document.removeEventListener("mouseup",this.handleDocumentMouseUp),document.removeEventListener("keyup",this.handleDocumentKeyUp),document.removeEventListener("mousedown",this.handleDocumentMouseDown),window.removeEventListener("scroll",this.handleWindowScroll)}renderBubble(){if(!this.canRenderFloatingPet)return x;const e=this.petPanelOpen?"":this.getCurrentPetSpeech();return m`
      <span class=${this.petPanelOpen?"bubble-wrapper panel-open":"bubble-wrapper"}>
        ${this.petPanelOpen&&!this.open?this.renderPetPanel():x}
        <button
          class=${this.draggingBubble?"bubble pet-button dragging":"bubble pet-button"}
          style=${this.petButtonStyle}
          type="button"
          @pointerdown=${this.handleBubblePointerDown}
          @click=${this.handleBubbleClick}
          @mouseenter=${this.handlePetMouseEnter}
          @mouseleave=${this.handlePetMouseLeave}
          aria-label=${this.isPetOnlyMode?"互动宠物":"打开智能助手"}
        >
          ${e?m`<span class=${this.petSpeechVisible?"pet-speech visible":"pet-speech"}>${e}</span>`:x}
          <span class="pet-sprite" style=${this.petSpriteStyle} aria-hidden="true"></span>
        </button>
      </span>
    `}renderPetPanel(){return hl({assistantName:this.assistantName,assistantAvatar:this.config.assistantAvatar,avatarFallbackText:this.avatarFallbackText,streaming:this.streaming,statusText:this.panelStatusText,selectedContext:this.selectedContext,selectedContextPreview:this.selectedContextPreview,messages:this.messages,welcomeMessage:this.welcomeMessage,quickQuestions:this.quickQuestions,mcpCapabilities:this.mcpCapabilities,input:this.input,petInputPlaceholder:this.petInputPlaceholder,panelStyle:this.petPanelStyle,resizing:this.resizingPetPanel,onOpenStage:()=>this.openPetStage(),onResizePointerDown:e=>this.handlePetPanelResizePointerDown(e),onNewConversation:()=>this.newConversation(),onUsePrompt:e=>this.usePrompt(e),onStop:()=>this.stopCurrentResponse(),onCopyMessage:e=>this.copyMessage(e),onRetryMessage:e=>this.retryMessage(e),onClearSelectedContext:()=>this.clearSelectedContext(),onSubmit:e=>this.handleSubmit(e),onInput:e=>this.handleInput(e),onKeydown:e=>this.handleInputKeydown(e),onCompositionStart:()=>this.handleCompositionStart(),onCompositionEnd:()=>this.handleCompositionEnd()})}renderStage(){return _l({assistantName:this.assistantName,assistantAvatar:this.config.assistantAvatar,avatarFallbackText:this.avatarFallbackText,messages:this.messages,statusText:this.panelStatusText,welcomeMessage:this.welcomeMessage,welcomeTime:this.welcomeTime,quickQuestions:this.quickQuestions,mcpCapabilities:this.mcpCapabilities,input:this.input,inputPlaceholder:this.petInputPlaceholder,streaming:this.streaming,hasSources:this.hasLatestSources,isSourceReferencesOpen:e=>this.isSourceReferencesOpen(e),onToggleSourceReferences:(e,t)=>this.toggleSourceReferences(e,t),onClose:()=>this.close(),onNewConversation:()=>this.newConversation(),onExpandLatestSources:()=>this.expandLatestSources(),onUsePrompt:e=>this.usePrompt(e),onStop:()=>this.stopCurrentResponse(),onCopyMessage:e=>this.copyMessage(e),onRetryMessage:e=>this.retryMessage(e),onSubmit:e=>this.handleSubmit(e),onInput:e=>this.handleInput(e),onKeydown:e=>this.handleInputKeydown(e),onCompositionStart:()=>this.handleCompositionStart(),onCompositionEnd:()=>this.handleCompositionEnd()})}renderSelectionPopup(){return this.isPetOnlyMode?x:Dl(this.selectionPopup,()=>this.askWithSelection(),this.selectionActionLabel)}handleSubmit(e){e.preventDefault(),this.submitQuestion(this.input)}handleInput(e){const t=e.currentTarget;t instanceof HTMLTextAreaElement&&(this.input=t.value,this.resizeInput(t))}handleCompositionStart(){this.composingInput=!0}handleCompositionEnd(){this.composingInput=!1}handleInputKeydown(e){e.key!=="Enter"||e.shiftKey||this.streaming||e.isComposing||this.composingInput||e.keyCode===229||(e.preventDefault(),this.submitQuestion(this.input))}handleBubblePointerDown(e){if(!e.isPrimary||e.button!==0)return;const t=e.currentTarget;if(!(t instanceof HTMLElement))return;const r=t.getBoundingClientRect(),u=this.currentFloatingPosition(r);this.bubbleDragState={pointerId:e.pointerId,target:t,startX:e.clientX,startY:e.clientY,originX:u.x,originY:u.y,lastX:e.clientX,moved:!1},this.petSpeechVisible=!1,e.preventDefault(),t.setPointerCapture(e.pointerId),t.addEventListener("pointermove",this.handleBubblePointerMove),t.addEventListener("pointerup",this.handleBubblePointerEnd),t.addEventListener("pointercancel",this.handleBubblePointerEnd)}handleBubbleClick(e){if(this.suppressNextBubbleClick){e.preventDefault(),e.stopPropagation();return}if(this.isPetOnlyMode){this.petPanelOpen=!1,this.open=!1,this.petSpeechVisible?this.petSpeechVisible=!1:this.showNextPetSpeech();return}this.petPanelOpen=!this.petPanelOpen,this.petSpeechVisible=!1,this.petPanelOpen&&(this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight),this.updateComplete.then(()=>this.focusPetInput()))}unbindBubbleDragListeners(){const e=this.bubbleDragState?.target;e&&(e.removeEventListener("pointermove",this.handleBubblePointerMove),e.removeEventListener("pointerup",this.handleBubblePointerEnd),e.removeEventListener("pointercancel",this.handleBubblePointerEnd))}handlePetPanelResizePointerDown(e){if(!e.isPrimary||e.button!==0)return;const t=e.currentTarget;if(!(t instanceof HTMLElement))return;const r=t.closest(".pet-panel");if(!(r instanceof HTMLElement))return;const u=r.getBoundingClientRect();this.panelResizeState={pointerId:e.pointerId,target:t,startY:e.clientY,startHeight:u.height||this.petPanelHeight},this.resizingPetPanel=!0,e.preventDefault(),e.stopPropagation(),t.setPointerCapture(e.pointerId),t.addEventListener("pointermove",this.handlePanelResizePointerMove),t.addEventListener("pointerup",this.handlePanelResizePointerEnd),t.addEventListener("pointercancel",this.handlePanelResizePointerEnd)}unbindPanelResizeListeners(){const e=this.panelResizeState?.target;e&&(e.removeEventListener("pointermove",this.handlePanelResizePointerMove),e.removeEventListener("pointerup",this.handlePanelResizePointerEnd),e.removeEventListener("pointercancel",this.handlePanelResizePointerEnd))}applySavedFloatingPosition(){const e=this.loadSavedFloatingPosition();return e?(this.setFloatingPosition(this.clampFloatingPosition(e),!1),!0):!1}applyDefaultFloatingPosition(e){this.setFloatingPosition(this.clampFloatingPosition(this.defaultFloatingPosition(e)),!1)}currentFloatingPosition(e){return this.floatingPosition?this.floatingPosition:e&&Number.isFinite(e.left)&&Number.isFinite(e.top)?{x:e.left,y:e.top}:this.defaultFloatingPosition(this.config)}defaultFloatingPosition(e){const t=this.normalizeFloatingOffset(e.horizontalOffset),r=this.normalizeFloatingOffset(e.verticalOffset);return{x:e.buttonPosition==="left"?t:window.innerWidth-this.bubbleWidth-t,y:window.innerHeight-this.bubbleHeight-r}}clampCurrentFloatingPosition(){if(!this.floatingPosition)return;const e=this.clampFloatingPosition(this.floatingPosition,this.bubbleWidth,this.bubbleHeight);(e.x!==this.floatingPosition.x||e.y!==this.floatingPosition.y)&&this.setFloatingPosition(e,!0)}clampFloatingPosition(e,t=this.bubbleWidth,r=this.bubbleHeight){const u=Math.max(de,window.innerWidth-t-de),n=Math.max(de,window.innerHeight-r-de);return{x:this.clamp(e.x,de,u),y:this.clamp(e.y,de,n)}}clampPetPanelHeight(e){const t=Number.isFinite(e)?e:Re;return this.clamp(t,ei,this.maxPetPanelHeight())}maxPetPanelHeight(){const t=(this.floatingPosition?.y??this.defaultFloatingPosition(this.config).y)-Il,r=window.innerHeight-de*2;return Math.max(ei,Math.min(r,t-de))}setFloatingPosition(e,t){this.floatingPosition=e,this.position=e.x+this.bubbleWidth/2<window.innerWidth/2?"left":"right",this.style.left=`${Math.round(e.x)}px`,this.style.top=`${Math.round(e.y)}px`,this.style.right="auto",this.style.bottom="auto",this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight),t&&this.saveFloatingPosition(e)}applyTheme(e=this.config){Xi(this,e.styleConfig)}async preparePetSprite(e){this.stopPetAnimation(),this.stopPetSpeechCycle(),this.petSpriteReady=!1,this.petSpeechVisible=!1,this.petSpeechText="";const t=e.pet?.spritesheetUrl?.trim();if(t)try{if(await this.preloadImage(t),this.petSpriteUrl!==t)return;this.petSpriteReady=!0,this.startPetAnimation(),this.startPetSpeechCycle()}catch{this.petSpriteUrl===t&&(this.petSpriteReady=!1)}}preloadImage(e){return new Promise((t,r)=>{const u=new Image;let n=!1;const i=a=>{n||(n=!0,a())};u.onload=()=>i(()=>t()),u.onerror=()=>i(()=>r(new Error("Pet spritesheet failed to load"))),u.src=e})}startPetAnimation(){this.petAnimationTimer||!this.canRenderFloatingPet||(this.petAnimationTimer=window.setInterval(()=>{this.petFrameIndex=(this.petFrameIndex+1)%Wr(this.petAnimationState).length},150))}stopPetAnimation(){this.petAnimationTimer&&(window.clearInterval(this.petAnimationTimer),this.petAnimationTimer=0)}startPetSpeechCycle(){this.petSpeechTimer||!this.canRenderFloatingPet||(window.setTimeout(()=>this.showNextPetSpeech(),1600),this.petSpeechTimer=window.setInterval(()=>this.showNextPetSpeech(),15e3))}stopPetSpeechCycle(){this.petSpeechTimer&&(window.clearInterval(this.petSpeechTimer),this.petSpeechTimer=0),this.petSpeechHideTimer&&(window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=0)}showNextPetSpeech(){if(!this.canShowPetSpeech()){this.petSpeechVisible=!1;return}if(this.isPetThinkingOutsideWindow()){this.showPetThinkingSpeech();return}const e=this.petSpeechMessages;this.petSpeechText=e[this.petSpeechIndex%e.length]||"",this.petSpeechVisible=!0,this.petSpeechHideTimer&&window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=window.setTimeout(()=>{this.petSpeechVisible=!1,this.petSpeechHideTimer=0},7200),this.petSpeechIndex=(this.petSpeechIndex+1)%e.length}syncPetThinkingSpeech(){if(!this.canRenderFloatingPet){this.petSpeechVisible=!1,this.petSpeechText="";return}if(this.isPetThinkingOutsideWindow()){this.showPetThinkingSpeech();return}this.petSpeechText===jr&&(this.petSpeechVisible=!1,this.petSpeechText="")}showPetThinkingSpeech(){this.draggingBubble||(this.petSpeechText=jr,this.petSpeechVisible=!0,this.petSpeechHideTimer&&(window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=0))}canShowPetSpeech(){return this.canRenderFloatingPet&&!this.open&&!this.petPanelOpen&&!this.draggingBubble&&(this.isPetThinkingOutsideWindow()||this.petSpeechMessages.length>0)}isPetThinkingOutsideWindow(){return!this.open&&!this.petPanelOpen&&this.streaming}handlePetMouseEnter(){this.petHovering=!0}handlePetMouseLeave(){this.petHovering=!1}triggerPetError(){this.canRenderFloatingPet&&(this.petErrorUntil=Date.now()+3600,this.petFrameIndex=0)}loadSavedFloatingPosition(){try{const e=window.localStorage.getItem(Qn);if(!e)return;const t=JSON.parse(e);if(typeof t.x=="number"&&Number.isFinite(t.x)&&typeof t.y=="number"&&Number.isFinite(t.y))return{x:Number(t.x),y:Number(t.y)}}catch{return}}saveFloatingPosition(e){try{window.localStorage.setItem(Qn,JSON.stringify(e))}catch{}}loadSavedPetPanelHeight(){try{const e=window.localStorage.getItem(Kn),t=e?Number(e):Re;return Number.isFinite(t)?t:Re}catch{return Re}}savePetPanelHeight(e){try{window.localStorage.setItem(Kn,String(Math.round(this.clampPetPanelHeight(e))))}catch{}}async submitQuestion(e){if(this.isPetOnlyMode)return;const t=e.trim();if(!t||this.streaming)return;if(!this.canUseAssistantChat){this.showLoginRequiredMessage();return}if(!this.canUseSelectedChatMode){this.showChatModeUnavailableMessage();return}const r=this.selectedContext.trim(),u=r?`请结合我选中的内容回答：

${r}

我的问题：${t}`:t,n=r?`${t}

选中内容：${this.truncateText(r,180)}`:t,i=vt();this.input="",this.selectedContext="",this.petPanelOpen=!0,this.streaming=!0,this.agentActivities=[],this.appendAgentActivity(this.useAgentChat?"正在准备 Agent":"正在检索知识库","pending"),this.abortController=new AbortController,this.messages=[...this.messages,Fe("user",n),Fe("assistant","",{id:i,streaming:!0})],await this.updateComplete,this.resizeInput(this.inputElement),this.resizeInput(this.petInputElement),this.scrollToBottom();try{this.useAgentChat?await this.askAgentStream(u,i):await this.askRagStream(u,i)}catch(a){if(this.abortController.signal.aborted)return;const s=a instanceof Error?a.message:"智能助手回答失败";this.failAssistantMessage(i,`抱歉，暂时无法回答，请稍后重试。${s?`（${s}）`:""}`)}finally{this.finishAssistantMessage(i),this.streaming=!1,this.abortController=void 0,this.agentChatClient=void 0,await this.updateComplete,this.scrollToBottom()}}async askAgentStream(e,t){this.appendAgentActivity("正在调用 Agent","pending");const r=new vn;this.agentChatClient=r;const u=this.ensureConversationId();try{const n=await r.sendMessage(e,{agent:this.config.agent,historyMessages:this.agentHistoryMessages,conversationId:u,visitorId:this.visitorId,ragEnabledForAgent:this.shouldAttachRagToAgent,afterNavigationDisplayMode:this.open?"stage":"panel",signal:this.abortController?.signal},{onText:i=>this.setAssistantContent(t,i),onSources:i=>this.receiveSources(t,i),onToolResults:i=>{this.messages=cr(this.messages,t,a=>({...a,toolResults:i}))},onError:i=>{if(this.isAgentToolCallStreamProtocolError(i)){this.appendAgentActivity("当前模型的工具调用流格式不兼容","warning");return}this.failAssistantMessage(t,i)},onFinish:i=>{this.agentHistoryMessages=i}});this.agentHistoryMessages=n}catch(n){if(!this.isAgentToolCallStreamProtocolError(n))throw n;if(r.stop(),this.agentChatClient=void 0,!this.canFallbackToRagChat)throw new Error("当前模型的工具调用流格式不兼容，无法继续使用 Agent 模式");this.resetAssistantMessageForFallback(t),this.appendAgentActivity("已切换为知识库问答模式","warning"),await this.askRagStream(e,t)}}async resumeAgentAfterNavigation(e){if(this.isPetOnlyMode||this.streaming||!this.useAgentChat)return;const t=vt();this.petPanelOpen=!0,this.streaming=!0,this.abortController=new AbortController,this.agentActivities=[],this.appendAgentActivity("页面已打开，正在继续回答","pending"),this.messages=[...this.messages,Fe("assistant","",{id:t,streaming:!0})],await this.updateComplete,this.scrollToBottom();const r=new vn;this.agentChatClient=r;try{const u=await r.sendMessage(e.message,{agent:this.config.agent,historyMessages:e.historyMessages,conversationId:this.ensureConversationId(),visitorId:this.visitorId,recordUserMessage:!1,ragEnabledForAgent:this.shouldAttachRagToAgent,afterNavigationDisplayMode:this.open?"stage":"panel",signal:this.abortController.signal},{onText:n=>this.setAssistantContent(t,n),onSources:n=>this.receiveSources(t,n),onToolResults:n=>{this.messages=cr(this.messages,t,i=>({...i,toolResults:n}))},onError:n=>{if(this.isAgentToolCallStreamProtocolError(n)){this.appendAgentActivity("当前模型的工具调用流格式不兼容","warning");return}this.failAssistantMessage(t,n)},onFinish:n=>{this.agentHistoryMessages=n}});this.agentHistoryMessages=u}catch(u){if(!this.abortController.signal.aborted){if(this.isAgentToolCallStreamProtocolError(u)){if(r.stop(),this.agentChatClient=void 0,!this.canFallbackToRagChat){this.failAssistantMessage(t,"当前模型的工具调用流格式不兼容，无法继续使用 Agent 模式");return}this.resetAssistantMessageForFallback(t),this.appendAgentActivity("已切换为知识库问答模式","warning"),await this.askRagStream(e.message,t);return}const n=u instanceof Error?u.message:"Agent 恢复回答失败";this.failAssistantMessage(t,n)}}finally{this.finishAssistantMessage(t),this.streaming=!1,this.abortController=void 0,this.agentChatClient=void 0,await this.updateComplete,this.scrollToBottom()}}async askRagStream(e,t){if(!this.useRagChat)throw new Error("当前模式没有启用 RAG 知识库问答");await pa({question:e,limit:Aa,conversationId:this.conversationId,visitorId:this.visitorId},{onConversationId:r=>this.persistConversationId(r),onSources:r=>{this.appendAgentActivity(r.length?`知识库命中 ${r.length} 个来源`:"知识库没有命中来源",r.length?"success":"warning"),this.receiveSources(t,r)},onDelta:r=>this.appendAssistantDelta(t,r),onError:r=>this.failAssistantMessage(t,r),onDone:()=>this.finishAssistantMessage(t)},this.abortController?.signal)}receiveSources(e,t){t.length&&(this.updateMessage(e,r=>({...r,sources:t})),this.appendAgentActivity(`已关联 ${t.length} 个资源`,"success"))}appendAgentActivity(e,t="pending"){const r=e.trim();if(!r)return;const u=this.agentActivities[this.agentActivities.length-1];u?.message===r&&u.kind===t||(this.agentActivities=[...this.agentActivities,{id:vt(),message:r,kind:t,time:$e()}].slice(-8),this.updateComplete.then(()=>this.scrollPetPanelToBottom()))}async loadStoredConversation(){const e=this.loadConversationId();if(e)try{const t=await fa(e,this.visitorId);if(!t){this.clearConversationId();return}this.conversationId=t.metadata.name,this.messages=this.toAssistantMessages(t),this.agentHistoryMessages=this.toAgentHistoryMessages(t),await this.updateComplete,this.scrollToBottom()}catch{this.clearConversationId()}}toAssistantMessages(e){return(e.spec?.messages||[]).filter(t=>t.role==="user"||t.role==="assistant").filter(t=>!!t.content?.trim()||!!t.toolResults?.length).map(t=>Fe(t.role,t.content||"",{id:t.id,time:this.messageTime(t),sources:t.sources,error:t.error,toolResults:In(t.toolResults)}))}toAgentHistoryMessages(e){return Jc(e.spec?.messages||[])}messageTime(e){if(!e.createdAt)return $e();const t=new Date(e.createdAt);return Number.isNaN(t.getTime())?$e():$e(t)}persistConversationId(e){if(e.trim()){this.conversationId=e;try{window.localStorage.setItem(kr,e)}catch{}}}ensureConversationId(){if(this.conversationId)return this.conversationId;const e=this.loadConversationId();if(e)return this.conversationId=e,e;const t=`rag-conv-${this.randomId().toLowerCase()}`;return this.persistConversationId(t),t}loadConversationId(){try{return window.localStorage.getItem(kr)||void 0}catch{return}}loadOrCreateVisitorId(){try{const e=window.localStorage.getItem(Xn);if(e)return e;const t=`rag-visitor-${this.randomId()}`;return window.localStorage.setItem(Xn,t),t}catch{return`rag-visitor-${this.randomId()}`}}randomId(){return window.crypto?.randomUUID?window.crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}clearConversationId(){this.conversationId=void 0;try{window.localStorage.removeItem(kr)}catch{}}setAssistantContent(e,t){this.updateMessage(e,r=>({...r,content:t})),this.updateComplete.then(()=>this.scrollToBottom())}appendAssistantDelta(e,t){t&&(this.updateMessage(e,r=>({...r,content:`${r.content}${t}`})),this.updateComplete.then(()=>this.scrollToBottom()))}failAssistantMessage(e,t){this.triggerPetError(),this.updateMessage(e,r=>({...r,content:t,error:!0,streaming:!1})),this.streaming=!1}resetAssistantMessageForFallback(e){this.updateMessage(e,t=>({...t,content:"",error:!1,streaming:!0,sources:void 0}))}isAgentToolCallStreamProtocolError(e){const t=typeof e=="string"?e:e instanceof Error?e.message:String(e??"");return/tool-call stream part toolCallId must not be blank|toolCallId must not be blank/i.test(t)}showLoginRequiredMessage(){const e="请登录后再使用智能助手。",t=this.messages[this.messages.length-1];this.petPanelOpen=!0,this.petSpeechVisible=!1,this.appendAgentActivity("请登录后再使用智能助手","warning"),!(t?.role==="assistant"&&t.content===e)&&(this.messages=[...this.messages,Fe("assistant",e,{error:!0})],this.updateComplete.then(()=>this.scrollPetPanelToBottom()))}showChatModeUnavailableMessage(){const e=this.chatModeUnavailableMessage,t=this.messages[this.messages.length-1];this.petPanelOpen=!0,this.petSpeechVisible=!1,this.appendAgentActivity(e,"warning"),!(t?.role==="assistant"&&t.content===e)&&(this.messages=[...this.messages,Fe("assistant",e,{error:!0})],this.updateComplete.then(()=>this.scrollPetPanelToBottom()))}finishAssistantMessage(e){this.updateMessage(e,t=>({...t,content:t.content||(t.error?t.content:"未找到相关资料，可尝试换个问题。"),streaming:!1}))}updateMessage(e,t){this.messages=cr(this.messages,e,t)}toggleSourceReferences(e,t){const r=t.currentTarget;if(!(r instanceof HTMLDetailsElement))return;const u=new Set(this.expandedSourceMessageIds);r.open?u.add(e):u.delete(e),this.expandedSourceMessageIds=Array.from(u)}close(){this.open=!1,this.clearSelectionPopup()}newConversation(){this.isPetOnlyMode||(this.abortCurrentRequest(),this.clearConversationId(),this.agentHistoryMessages=[],this.messages=[],this.agentActivities=[],this.input="",this.selectedContext="",this.streaming=!1,this.petPanelOpen=!0,this.updateComplete.then(()=>this.focusCurrentInput()))}askWithSelection(){if(this.isPetOnlyMode){this.clearSelectionPopup();return}const e=this.selectionPopup.text.trim();e&&(this.selectedContext=e,this.petPanelOpen=!0,this.petSpeechVisible=!1,this.clearSelectionPopup(),this.updateComplete.then(()=>this.focusPetInput()))}updateSelectionPopup(){if(this.isPetOnlyMode){this.selectionPopup=Me;return}this.selectionPopup=m0(Fl)}clearSelectionPopup(){this.selectionPopup.visible&&(this.selectionPopup=Me)}resizeInput(e){e&&(e.style.height="auto",e.style.height=`${Math.min(Math.max(e.scrollHeight,38),118)}px`)}focusInput(){this.inputElement?.focus({preventScroll:!0})}focusPetInput(){this.petInputElement?.focus()}focusCurrentInput(){if(this.open){this.focusInput();return}this.focusPetInput()}openPetStage(){this.isPetOnlyMode||(this.open=!0,this.petPanelOpen=!1,this.updateComplete.then(()=>{this.scrollToBottom(),this.focusInput()}))}clearSelectedContext(){this.selectedContext="",this.updateComplete.then(()=>this.focusPetInput())}expandLatestSources(){const e=this.latestAssistantMessageWithSources?.id;if(!e)return;const t=new Set(this.expandedSourceMessageIds);t.add(e),this.expandedSourceMessageIds=Array.from(t),this.open=!0,this.updateComplete.then(()=>this.scrollToBottom())}usePrompt(e){e&&(this.input=e),this.updateComplete.then(()=>this.focusCurrentInput())}scrollToBottom(){this.messagesElement&&(this.messagesElement.scrollTop=this.messagesElement.scrollHeight)}scrollPetPanelToBottom(){this.updateComplete.then(()=>{this.petPanelThreadElement&&(this.petPanelThreadElement.scrollTop=this.petPanelThreadElement.scrollHeight)})}abortCurrentRequest(){this.agentChatClient?.stop(),this.agentChatClient=void 0,!(!this.abortController||this.abortController.signal.aborted)&&this.abortController.abort()}stopCurrentResponse(){if(!this.streaming)return;const e=[...this.messages].reverse().find(t=>t.role==="assistant"&&t.streaming);e&&this.updateMessage(e.id,t=>({...t,content:t.content||"已停止生成。",streaming:!1})),this.appendAgentActivity("已停止生成","warning"),this.streaming=!1,this.abortCurrentRequest()}async copyMessage(e){const t=e.content.trim();if(t)try{if(!navigator.clipboard?.writeText)throw new Error("Clipboard API is unavailable");await navigator.clipboard.writeText(t),this.appendAgentActivity("已复制到剪贴板","success")}catch{this.appendAgentActivity("复制失败，请手动选择文本","error")}}retryMessage(e){if(this.streaming)return;const t=e.role==="user"?e.content:this.previousUserQuestion(e.id);t.trim()&&this.submitQuestion(t)}previousUserQuestion(e){const t=this.messages.findIndex(r=>r.id===e);if(t<=0)return"";for(let r=t-1;r>=0;r-=1){const u=this.messages[r];if(u.role==="user"&&u.content.trim())return u.content}return""}clamp(e,t,r){return Math.min(Math.max(e,t),r)}normalizeFloatingOffset(e){return Number.isFinite(e)?Math.max(0,e):ke.horizontalOffset}isSourceReferencesOpen(e){return this.expandedSourceMessageIds.includes(e)}get assistantName(){return this.config.assistantName||ke.assistantName}get isPetOnlyMode(){return this.config.displayMode==="petOnly"}get isRagAgentMode(){return this.config.displayMode==="ragAgent"}get isRagOnlyMode(){return this.config.displayMode==="rag"}get isAgentOnlyMode(){return this.config.displayMode==="agent"}get canUseAssistantChat(){return this.config.access.allowAnonymous||this.config.access.authenticated}get canUseSelectedChatMode(){return this.useAgentChat||this.useRagChat}get canFallbackToRagChat(){return this.isRagAgentMode&&this.useRagChat}get petInputPlaceholder(){return this.canUseAssistantChat?this.canUseSelectedChatMode?this.selectedContext?"想问这段内容什么？":this.isAgentOnlyMode?"请输入要让助手处理的问题...":this.isRagAgentMode?"请输入问题，助手会按需使用站点工具或知识库...":iu:this.chatModeUnavailableMessage:"请登录后使用智能助手"}get selectedContextPreview(){return this.truncateText(this.selectedContext,120)}get petPanelStyle(){return`--rag-pet-panel-height:${Math.round(this.clampPetPanelHeight(this.petPanelHeight))}px`}get latestAssistantMessageWithSources(){return[...this.messages].reverse().find(e=>e.role==="assistant"&&!!e.sources?.length)}get hasLatestSources(){return!!this.latestAssistantMessageWithSources}get panelStatusText(){const e=this.agentActivities[this.agentActivities.length-1]?.message;return this.streaming&&e?e:this.streaming?"正在找答案":"想问我什么？"}get useAgentChat(){return(this.isRagAgentMode||this.isAgentOnlyMode)&&this.config.agent?.enabled!==!1&&this.config.access.agentAllowed!==!1}get useRagChat(){return(this.isRagAgentMode||this.isRagOnlyMode)&&this.config.ragEnabled!==!1}get shouldAttachRagToAgent(){return this.isRagAgentMode&&this.config.ragEnabled!==!1}get chatModeUnavailableMessage(){if(this.isPetOnlyMode)return"当前为纯宠物模式，不提供问答面板。";if(this.isRagOnlyMode&&this.config.ragEnabled===!1)return"当前为 RAG 模式，但 RAG 知识库未启用。";if(this.isAgentOnlyMode){if(this.config.agent?.enabled===!1)return"当前为 Agent 模式，但 Agent 能力未启用。";if(this.config.access.agentAllowed===!1)return"当前访问模式未开放 Agent。"}if(this.isRagAgentMode){if(this.config.agent?.enabled===!1&&this.config.ragEnabled===!1)return"当前为知识库问答 + Agent 模式，但知识库问答和 Agent 都未启用。";if(this.config.agent?.enabled!==!1&&this.config.access.agentAllowed===!1&&this.config.ragEnabled===!1)return"当前访问模式未开放 Agent，且知识库问答未启用。"}return"当前前台显示模式暂不可用，请联系站长检查配置。"}get selectionActionLabel(){return this.isRagOnlyMode?"问知识库":"问助手"}get avatarFallbackText(){return Array.from(this.assistantName.trim())[0]||"智"}get petSize(){return this.config.petSize||Ot}get petMetrics(){return Ui(this.petSize)}get bubbleWidth(){return this.petMetrics.width}get bubbleHeight(){return this.petMetrics.height}get petButtonStyle(){const e=this.petMetrics;return[`--rag-pet-width:${e.width}px`,`--rag-pet-height:${e.height}px`,`--rag-pet-sheet-width:${e.sheetWidth}px`,`--rag-pet-sheet-height:${e.sheetHeight}px`].join(";")}get petSpriteStyle(){const e=this.petMetrics,t=qi(this.petAnimationState,this.petFrameIndex);return[`background-image:url("${this.escapeCssUrl(this.petSpriteUrl)}")`,`--rag-pet-frame-x:${-t.col*e.width}px`,`--rag-pet-frame-y:${-t.row*e.height}px`].join(";")}get petAnimationState(){return{errorActive:this.petErrorUntil>Date.now(),direction:this.petDragDirection,thinking:this.isPetThinkingOutsideWindow(),hovering:this.petHovering}}get petSpeechMessages(){const e=this.config.petSpeechMessages||[];return e.length?e:zt}get quickQuestions(){return(this.config.quickQuestions||[]).filter(t=>t.trim()).slice(0,8)}getCurrentPetSpeech(){return this.petSpeechText}get hasActivePet(){return!!this.config.pet?.spritesheetUrl}get canRenderFloatingPet(){return this.configLoaded&&this.floatingPositionReady&&this.hasActivePet&&this.petSpriteReady}get petSpriteUrl(){return this.config.pet?.spritesheetUrl||""}escapeCssUrl(e){return e.replace(/["\\\n\r\f]/g,"")}truncateText(e,t){const r=e.replace(/\s+/g," ").trim();return r.length<=t?r:`${r.slice(0,Math.max(0,t-1))}…`}get welcomeMessage(){return(this.config.welcomeMessage||ke.welcomeMessage).replace("{assistantName}",this.assistantName)}};E.styles=g0,S([Hr({type:String,reflect:!0})],E.prototype,"position",2),S([P()],E.prototype,"config",2),S([P()],E.prototype,"configLoaded",2),S([P()],E.prototype,"mcpCapabilities",2),S([P()],E.prototype,"open",2),S([P()],E.prototype,"petPanelOpen",2),S([P()],E.prototype,"input",2),S([P()],E.prototype,"selectedContext",2),S([P()],E.prototype,"messages",2),S([P()],E.prototype,"agentActivities",2),S([P()],E.prototype,"streaming",2),S([P()],E.prototype,"expandedSourceMessageIds",2),S([P()],E.prototype,"selectionPopup",2),S([P()],E.prototype,"floatingPosition",2),S([P()],E.prototype,"floatingPositionReady",2),S([P()],E.prototype,"petSpriteReady",2),S([P()],E.prototype,"draggingBubble",2),S([P()],E.prototype,"petFrameIndex",2),S([P()],E.prototype,"petHovering",2),S([P()],E.prototype,"petDragDirection",2),S([P()],E.prototype,"petErrorUntil",2),S([P()],E.prototype,"petSpeechVisible",2),S([P()],E.prototype,"petSpeechIndex",2),S([P()],E.prototype,"petSpeechText",2),S([P()],E.prototype,"petPanelHeight",2),S([P()],E.prototype,"resizingPetPanel",2),S([ct(".pet-stage-output")],E.prototype,"messagesElement",2),S([ct(".conversation-input")],E.prototype,"inputElement",2),S([ct(".pet-composer-input")],E.prototype,"petInputElement",2),S([ct(".pet-panel-thread")],E.prototype,"petPanelThreadElement",2),E=S([Ei("summaraid-rag-assistant")],E);const ti="summaraid-rag-assistant";function Rl(){window.likcc_summaraidGPT_ragAssistantLoaded||(console.log("%c智阅GPT-前台智能助手","color: #1f1f1f; font-size: 16px; font-weight: bold;"),console.log("%c支持宠物陪伴、知识库问答和 Agent 工具调用","color: #8a6f38; font-size: 12px;"),window.likcc_summaraidGPT_ragAssistantLoaded=!0)}async function Er(){if(!document.body)return;const e=document.querySelector(ti);if(e)return e;const t=document.createElement(ti);return document.body.appendChild(t),t}async function Nl(e){(await Er())?.openAssistant(e)}function ri(){window.setTimeout(()=>{Er()},0)}Rl(),window.likcc_summaraidGPT_initRagAssistant=Er,window.likcc_summaraidGPT_openRagAssistant=Nl,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ri,{once:!0}):ri()}));
