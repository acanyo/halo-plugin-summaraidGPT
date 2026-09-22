(function(le){typeof define=="function"&&define.amd?define(le):le()})((function(){"use strict";const le=globalThis,kt=le.ShadowRoot&&(le.ShadyCSS===void 0||le.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Et=Symbol(),Cu=new WeakMap;let vu=class{constructor(t,u,r){if(this._$cssResult$=!0,r!==Et)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=u}get styleSheet(){let t=this.o;const u=this.t;if(kt&&t===void 0){const r=u!==void 0&&u.length===1;r&&(t=Cu.get(u)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&Cu.set(u,t))}return t}toString(){return this.cssText}};const Zn=e=>new vu(typeof e=="string"?e:e+"",void 0,Et),Fe=(e,...t)=>{const u=e.length===1?e[0]:t.reduce((r,n,i)=>r+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1],e[0]);return new vu(u,e,Et)},Yn=(e,t)=>{if(kt)e.adoptedStyleSheets=t.map(u=>u instanceof CSSStyleSheet?u:u.styleSheet);else for(const u of t){const r=document.createElement("style"),n=le.litNonce;n!==void 0&&r.setAttribute("nonce",n),r.textContent=u.cssText,e.appendChild(r)}},Au=kt?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let u="";for(const r of t.cssRules)u+=r.cssText;return Zn(u)})(e):e;const{is:Qn,defineProperty:Jn,getOwnPropertyDescriptor:Xn,getOwnPropertyNames:Kn,getOwnPropertySymbols:ei,getPrototypeOf:ti}=Object,tt=globalThis,ku=tt.trustedTypes,ui=ku?ku.emptyScript:"",ri=tt.reactiveElementPolyfillSupport,$e=(e,t)=>e,ut={toAttribute(e,t){switch(t){case Boolean:e=e?ui:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let u=e;switch(t){case Boolean:u=e!==null;break;case Number:u=e===null?null:Number(e);break;case Object:case Array:try{u=JSON.parse(e)}catch{u=null}}return u}},St=(e,t)=>!Qn(e,t),Eu={attribute:!0,type:String,converter:ut,reflect:!1,useDefault:!1,hasChanged:St};Symbol.metadata??=Symbol("metadata"),tt.litPropertyMetadata??=new WeakMap;let me=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,u=Eu){if(u.state&&(u.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((u=Object.create(u)).wrapped=!0),this.elementProperties.set(t,u),!u.noAccessor){const r=Symbol(),n=this.getPropertyDescriptor(t,r,u);n!==void 0&&Jn(this.prototype,t,n)}}static getPropertyDescriptor(t,u,r){const{get:n,set:i}=Xn(this.prototype,t)??{get(){return this[u]},set(o){this[u]=o}};return{get:n,set(o){const a=n?.call(this);i?.call(this,o),this.requestUpdate(t,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Eu}static _$Ei(){if(this.hasOwnProperty($e("elementProperties")))return;const t=ti(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty($e("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty($e("properties"))){const u=this.properties,r=[...Kn(u),...ei(u)];for(const n of r)this.createProperty(n,u[n])}const t=this[Symbol.metadata];if(t!==null){const u=litPropertyMetadata.get(t);if(u!==void 0)for(const[r,n]of u)this.elementProperties.set(r,n)}this._$Eh=new Map;for(const[u,r]of this.elementProperties){const n=this._$Eu(u,r);n!==void 0&&this._$Eh.set(n,u)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const u=[];if(Array.isArray(t)){const r=new Set(t.flat(1/0).reverse());for(const n of r)u.unshift(Au(n))}else t!==void 0&&u.push(Au(t));return u}static _$Eu(t,u){const r=u.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,u=this.constructor.elementProperties;for(const r of u.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Yn(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,u,r){this._$AK(t,r)}_$ET(t,u){const r=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,r);if(n!==void 0&&r.reflect===!0){const i=(r.converter?.toAttribute!==void 0?r.converter:ut).toAttribute(u,r.type);this._$Em=t,i==null?this.removeAttribute(n):this.setAttribute(n,i),this._$Em=null}}_$AK(t,u){const r=this.constructor,n=r._$Eh.get(t);if(n!==void 0&&this._$Em!==n){const i=r.getPropertyOptions(n),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:ut;this._$Em=n;const a=o.fromAttribute(u,i.type);this[n]=a??this._$Ej?.get(n)??a,this._$Em=null}}requestUpdate(t,u,r,n=!1,i){if(t!==void 0){const o=this.constructor;if(n===!1&&(i=this[t]),r??=o.getPropertyOptions(t),!((r.hasChanged??St)(i,u)||r.useDefault&&r.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,r))))return;this.C(t,u,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,u,{useDefault:r,reflect:n,wrapped:i},o){r&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??u??this[t]),i!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||r||(u=void 0),this._$AL.set(t,u)),n===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(u){Promise.reject(u)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[n,i]of this._$Ep)this[n]=i;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[n,i]of r){const{wrapped:o}=i,a=this[n];o!==!0||this._$AL.has(n)||a===void 0||this.C(n,void 0,i,a)}}let t=!1;const u=this._$AL;try{t=this.shouldUpdate(u),t?(this.willUpdate(u),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(u)):this._$EM()}catch(r){throw t=!1,this._$EM(),r}t&&this._$AE(u)}willUpdate(t){}_$AE(t){this._$EO?.forEach(u=>u.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(u=>this._$ET(u,this[u])),this._$EM()}updated(t){}firstUpdated(t){}};me.elementStyles=[],me.shadowRootOptions={mode:"open"},me[$e("elementProperties")]=new Map,me[$e("finalized")]=new Map,ri?.({ReactiveElement:me}),(tt.reactiveElementVersions??=[]).push("2.1.2");const Dt=globalThis,Su=e=>e,rt=Dt.trustedTypes,Du=rt?rt.createPolicy("lit-html",{createHTML:e=>e}):void 0,Tu="$lit$",ue=`lit$${Math.random().toFixed(9).slice(2)}$`,Pu="?"+ue,ni=`<${Pu}>`,de=document,Ie=()=>de.createComment(""),Me=e=>e===null||typeof e!="object"&&typeof e!="function",Tt=Array.isArray,ii=e=>Tt(e)||typeof e?.[Symbol.iterator]=="function",Pt=`[ 	
\f\r]`,Re=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Fu=/-->/g,$u=/>/g,pe=RegExp(`>|${Pt}(?:([^\\s"'>=/]+)(${Pt}*=${Pt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Iu=/'/g,Mu=/"/g,Ru=/^(?:script|style|textarea|title)$/i,oi=e=>(t,...u)=>({_$litType$:e,strings:t,values:u}),v=oi(1),re=Symbol.for("lit-noChange"),C=Symbol.for("lit-nothing"),Nu=new WeakMap,fe=de.createTreeWalker(de,129);function zu(e,t){if(!Tt(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Du!==void 0?Du.createHTML(t):t}const ai=(e,t)=>{const u=e.length-1,r=[];let n,i=t===2?"<svg>":t===3?"<math>":"",o=Re;for(let a=0;a<u;a++){const s=e[a];let c,l,d=-1,h=0;for(;h<s.length&&(o.lastIndex=h,l=o.exec(s),l!==null);)h=o.lastIndex,o===Re?l[1]==="!--"?o=Fu:l[1]!==void 0?o=$u:l[2]!==void 0?(Ru.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=pe):l[3]!==void 0&&(o=pe):o===pe?l[0]===">"?(o=n??Re,d=-1):l[1]===void 0?d=-2:(d=o.lastIndex-l[2].length,c=l[1],o=l[3]===void 0?pe:l[3]==='"'?Mu:Iu):o===Mu||o===Iu?o=pe:o===Fu||o===$u?o=Re:(o=pe,n=void 0);const f=o===pe&&e[a+1].startsWith("/>")?" ":"";i+=o===Re?s+ni:d>=0?(r.push(c),s.slice(0,d)+Tu+s.slice(d)+ue+f):s+ue+(d===-2?a:f)}return[zu(e,i+(e[u]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),r]};class Ne{constructor({strings:t,_$litType$:u},r){let n;this.parts=[];let i=0,o=0;const a=t.length-1,s=this.parts,[c,l]=ai(t,u);if(this.el=Ne.createElement(c,r),fe.currentNode=this.el.content,u===2||u===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(n=fe.nextNode())!==null&&s.length<a;){if(n.nodeType===1){if(n.hasAttributes())for(const d of n.getAttributeNames())if(d.endsWith(Tu)){const h=l[o++],f=n.getAttribute(d).split(ue),p=/([.?@])?(.*)/.exec(h);s.push({type:1,index:i,name:p[2],strings:f,ctor:p[1]==="."?ci:p[1]==="?"?li:p[1]==="@"?di:nt}),n.removeAttribute(d)}else d.startsWith(ue)&&(s.push({type:6,index:i}),n.removeAttribute(d));if(Ru.test(n.tagName)){const d=n.textContent.split(ue),h=d.length-1;if(h>0){n.textContent=rt?rt.emptyScript:"";for(let f=0;f<h;f++)n.append(d[f],Ie()),fe.nextNode(),s.push({type:2,index:++i});n.append(d[h],Ie())}}}else if(n.nodeType===8)if(n.data===Pu)s.push({type:2,index:i});else{let d=-1;for(;(d=n.data.indexOf(ue,d+1))!==-1;)s.push({type:7,index:i}),d+=ue.length-1}i++}}static createElement(t,u){const r=de.createElement("template");return r.innerHTML=t,r}}function xe(e,t,u=e,r){if(t===re)return t;let n=r!==void 0?u._$Co?.[r]:u._$Cl;const i=Me(t)?void 0:t._$litDirective$;return n?.constructor!==i&&(n?._$AO?.(!1),i===void 0?n=void 0:(n=new i(e),n._$AT(e,u,r)),r!==void 0?(u._$Co??=[])[r]=n:u._$Cl=n),n!==void 0&&(t=xe(e,n._$AS(e,t.values),n,r)),t}class si{constructor(t,u){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=u}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:u},parts:r}=this._$AD,n=(t?.creationScope??de).importNode(u,!0);fe.currentNode=n;let i=fe.nextNode(),o=0,a=0,s=r[0];for(;s!==void 0;){if(o===s.index){let c;s.type===2?c=new ze(i,i.nextSibling,this,t):s.type===1?c=new s.ctor(i,s.name,s.strings,this,t):s.type===6&&(c=new pi(i,this,t)),this._$AV.push(c),s=r[++a]}o!==s?.index&&(i=fe.nextNode(),o++)}return fe.currentNode=de,n}p(t){let u=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,u),u+=r.strings.length-2):r._$AI(t[u])),u++}}class ze{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,u,r,n){this.type=2,this._$AH=C,this._$AN=void 0,this._$AA=t,this._$AB=u,this._$AM=r,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const u=this._$AM;return u!==void 0&&t?.nodeType===11&&(t=u.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,u=this){t=xe(this,t,u),Me(t)?t===C||t==null||t===""?(this._$AH!==C&&this._$AR(),this._$AH=C):t!==this._$AH&&t!==re&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ii(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==C&&Me(this._$AH)?this._$AA.nextSibling.data=t:this.T(de.createTextNode(t)),this._$AH=t}$(t){const{values:u,_$litType$:r}=t,n=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=Ne.createElement(zu(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===n)this._$AH.p(u);else{const i=new si(n,this),o=i.u(this.options);i.p(u),this.T(o),this._$AH=i}}_$AC(t){let u=Nu.get(t.strings);return u===void 0&&Nu.set(t.strings,u=new Ne(t)),u}k(t){Tt(this._$AH)||(this._$AH=[],this._$AR());const u=this._$AH;let r,n=0;for(const i of t)n===u.length?u.push(r=new ze(this.O(Ie()),this.O(Ie()),this,this.options)):r=u[n],r._$AI(i),n++;n<u.length&&(this._$AR(r&&r._$AB.nextSibling,n),u.length=n)}_$AR(t=this._$AA.nextSibling,u){for(this._$AP?.(!1,!0,u);t!==this._$AB;){const r=Su(t).nextSibling;Su(t).remove(),t=r}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class nt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,u,r,n,i){this.type=1,this._$AH=C,this._$AN=void 0,this.element=t,this.name=u,this._$AM=n,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=C}_$AI(t,u=this,r,n){const i=this.strings;let o=!1;if(i===void 0)t=xe(this,t,u,0),o=!Me(t)||t!==this._$AH&&t!==re,o&&(this._$AH=t);else{const a=t;let s,c;for(t=i[0],s=0;s<i.length-1;s++)c=xe(this,a[r+s],u,s),c===re&&(c=this._$AH[s]),o||=!Me(c)||c!==this._$AH[s],c===C?t=C:t!==C&&(t+=(c??"")+i[s+1]),this._$AH[s]=c}o&&!n&&this.j(t)}j(t){t===C?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class ci extends nt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===C?void 0:t}}class li extends nt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==C)}}class di extends nt{constructor(t,u,r,n,i){super(t,u,r,n,i),this.type=5}_$AI(t,u=this){if((t=xe(this,t,u,0)??C)===re)return;const r=this._$AH,n=t===C&&r!==C||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,i=t!==C&&(r===C||n);n&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}let pi=class{constructor(t,u,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=u,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){xe(this,t)}};const fi=Dt.litHtmlPolyfillSupport;fi?.(Ne,ze),(Dt.litHtmlVersions??=[]).push("3.3.2");const hi=(e,t,u)=>{const r=u?.renderBefore??t;let n=r._$litPart$;if(n===void 0){const i=u?.renderBefore??null;r._$litPart$=n=new ze(t.insertBefore(Ie(),i),i,void 0,u??{})}return n._$AI(e),n};const Ft=globalThis;let Oe=class extends me{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const u=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=hi(u,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return re}};Oe._$litElement$=!0,Oe.finalized=!0,Ft.litElementHydrateSupport?.({LitElement:Oe});const gi=Ft.litElementPolyfillSupport;gi?.({LitElement:Oe}),(Ft.litElementVersions??=[]).push("4.2.2");const bi=e=>(t,u)=>{u!==void 0?u.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const mi={attribute:!0,type:String,converter:ut,reflect:!1,hasChanged:St},xi=(e=mi,t,u)=>{const{kind:r,metadata:n}=u;let i=globalThis.litPropertyMetadata.get(n);if(i===void 0&&globalThis.litPropertyMetadata.set(n,i=new Map),r==="setter"&&((e=Object.create(e)).wrapped=!0),i.set(u.name,e),r==="accessor"){const{name:o}=u;return{set(a){const s=t.get.call(this);t.set.call(this,a),this.requestUpdate(o,s,e,!0,a)},init(a){return a!==void 0&&this.C(o,void 0,e,a),a}}}if(r==="setter"){const{name:o}=u;return function(a){const s=this[o];t.call(this,a),this.requestUpdate(o,s,e,!0,a)}}throw Error("Unsupported decorator location: "+r)};function Ou(e){return(t,u)=>typeof u=="object"?xi(e,t,u):((r,n,i)=>{const o=n.hasOwnProperty(i);return n.constructor.createProperty(i,r),o?Object.getOwnPropertyDescriptor(n,i):void 0})(e,t,u)}function F(e){return Ou({...e,state:!0,attribute:!1})}const yi=(e,t,u)=>(u.configurable=!0,u.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(e,t,u),u);function it(e,t){return(u,r,n)=>{const i=o=>o.renderRoot?.querySelector(e)??null;return yi(u,r,{get(){return i(this)}})}}const $t=["有什么站内资料想查？","选中文字后也可以直接问我。","我会优先基于知识库回答。","需要我帮你追溯文章来源吗？"],Lu="正在检索知识库，稍等一下。",It=76,_i=48,wi=160,Ci=8,vi=9,Ai=208/192,ye=(e,t)=>Array.from({length:t},(u,r)=>({row:e,col:r})),ki=ye(0,6),Ei=ye(3,4),Si=ye(8,6),Di=ye(5,8),Ti=ye(1,8),Pi=ye(2,8);function Fi(e){const t=e,u=Math.round(e*Ai);return{width:t,height:u,sheetWidth:t*Ci,sheetHeight:u*vi}}function Bu(e){return e.errorActive?Di:e.direction==="right"?Ti:e.direction==="left"?Pi:e.thinking?Si:e.hovering?Ei:ki}function $i(e,t){const u=Bu(e);return u[t%u.length]}const Ii=new Set(["navigate","scroll-to","highlight","dispatch-event","registered"]),Mi=/^[a-z][a-z0-9_]{2,63}$/;function Mt(e){const t=V(e)?e:{},u=V(t.builtIn)?t.builtIn:{},r=V(t.toolSecurity)?t.toolSecurity:{},n=V(t.haloSearch)?t.haloSearch:{},i=V(t.haloResourceDetail)?t.haloResourceDetail:{},o=V(t.ragSearch)?t.ragSearch:{},a=qu(n.allowedTypes);return{enabled:he(t.enabled,!0)??!0,builtIn:{pageContext:he(u.pageContext,!0)??!0,haloNavigation:he(u.haloNavigation,!0)??!0,haloContentSearch:he(u.haloContentSearch,!0)??!0,ragContentSearch:he(u.ragContentSearch,!0)??!0,networkAccess:he(u.networkAccess,!1)??!1,commentCapability:Li(u.commentCapability)},aiTools:Uu(t.aiTools),toolSecurity:{allowedExternalOrigins:[...qu(r.allowedExternalOrigins),...Bi(r.allowedExternalOrigins,"origin")],allowNewTab:he(r.allowNewTab,!1)??!1},haloSearch:{allowedTypes:a.length?a:["post.content.halo.run","singlepage.content.halo.run"],defaultLimit:Be(n.defaultLimit)??5},haloResourceDetail:{maxContentChars:Be(i.maxContentChars)??3e3},ragSearch:{defaultLimit:Be(o.defaultLimit)??5,maxContentChars:Be(o.maxContentChars)??3e3}}}function Uu(e){if(typeof e=="string"&&e.trim())try{return Uu(JSON.parse(e))}catch{return[]}return Array.isArray(e)?e.flatMap(t=>{const u=Ri(t);return u?[u]:[]}):[]}function Ri(e){if(!V(e))return;const t=X(e.name),u=X(e.description),r=Ni(e.action);if(!(!t||!Mi.test(t)||!u||!r))return{name:t,description:u,inputSchema:V(e.inputSchema)?e.inputSchema:{type:"object",properties:{}},approval:zi(e.approval),requiredAuth:Oi(e.requiredAuth),actionType:r.type,action:r,testInput:e.testInput}}function Ni(e){if(!V(e))return;const t=X(e.type);if(!(!t||!Ii.has(t))){if(t==="navigate"){const u=X(e.url);return u?{...Le(e),type:t,url:u,target:e.target==="_blank"?"_blank":"_self"}:void 0}if(t==="scroll-to"||t==="highlight"){const u=X(e.selector);return u?t==="scroll-to"?{...Le(e),type:t,selector:u,behavior:e.behavior==="auto"?"auto":"smooth"}:{...Le(e),type:t,selector:u,duration:Be(e.duration)}:void 0}if(t==="dispatch-event"){const u=X(e.event);return u?{...Le(e),type:t,event:u}:void 0}return{...Le(e),type:"registered"}}}function Le(e){return{pendingMessage:X(e.pendingMessage),successMessage:X(e.successMessage),errorMessage:X(e.errorMessage)}}function zi(e){return e==="never"||e==="always"?e:"default"}function Oi(e){return e==="authenticated"?"authenticated":"none"}function Li(e){return e==="off"||e==="submit"?e:"assist"}function qu(e){return Array.isArray(e)?e.filter(t=>typeof t=="string"&&t.trim().length>0):[]}function Bi(e,t){return Array.isArray(e)?e.flatMap(u=>V(u)&&typeof u[t]=="string"&&u[t].trim()?[u[t]]:[]):[]}function he(e,t){return typeof e=="boolean"?e:t}function Be(e){const t=Number(e);return Number.isFinite(t)?t:void 0}function X(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function V(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const H={stylePreset:"default",primaryColor:"#a16207",secondaryColor:"#f4f4f5",surfaceColor:"#fafafa",textColor:"#18181b",borderRadius:"soft",colorMode:"light"},Rt={surfaceColor:"#171717",textColor:"#f7f2e8",secondaryColor:"#292524"},Hu={default:{primaryColor:"#a16207",secondaryColor:"#f4f4f5",surfaceColor:"#fafafa",textColor:"#18181b"},graphite:{primaryColor:"#d6b46c",secondaryColor:"#2a2a28",surfaceColor:"#171717",textColor:"#f7f2e8"},ocean:{primaryColor:"#1f7a8c",secondaryColor:"#d9f0f3",surfaceColor:"#fbfeff",textColor:"#142326"},azure:{primaryColor:"#3b82f6",secondaryColor:"#dbeafe",surfaceColor:"#f8fafc",textColor:"#0f172a"},forest:{primaryColor:"#2f7d50",secondaryColor:"#dceedd",surfaceColor:"#fbfdf8",textColor:"#18251b"},rose:{primaryColor:"#b85c7a",secondaryColor:"#f8dfe8",surfaceColor:"#fffafc",textColor:"#2b1720"}},Ui={standard:{panel:"10px",card:"8px",control:"10px"},soft:{panel:"18px",card:"13px",control:"999px"},round:{panel:"26px",card:"18px",control:"999px"}};function ju(e){const t=Gi(e?.stylePreset),u=t==="custom"?Hu.default:Hu[t],r=t==="custom";return{stylePreset:t,primaryColor:ot(r?e?.primaryColor:u.primaryColor,H.primaryColor),secondaryColor:ot(r?e?.secondaryColor:u.secondaryColor,H.secondaryColor),surfaceColor:ot(r?e?.surfaceColor:u.surfaceColor,H.surfaceColor),textColor:ot(r?e?.textColor:u.textColor,H.textColor),borderRadius:Vi(e?.borderRadius),colorMode:Zi(e?.colorMode)}}function qi(e,t){const u=Hi(ju(t)),r=Ue(u.primaryColor),n=Ue(u.surfaceColor),i=Ue(u.textColor),o=Ue(u.secondaryColor),a=Ui[u.borderRadius],s=Wi(u),c={r:0,g:0,b:0},l={r:255,g:255,b:255};A(e,"--rag-text",u.textColor),A(e,"--rag-muted",K(z(i,n,.42))),A(e,"--rag-line",M(i,.095)),A(e,"--rag-soft-line",M(i,.06)),A(e,"--rag-paper",M(n,.97)),A(e,"--rag-panel",u.surfaceColor),A(e,"--rag-ink",u.textColor),A(e,"--rag-secondary",u.secondaryColor),A(e,"--rag-gold",u.primaryColor),A(e,"--rag-gold-strong",K(z(r,{r:0,g:0,b:0},.18))),A(e,"--rag-gold-soft",M(r,.16)),A(e,"--rag-gold-faint",M(r,.05)),A(e,"--rag-primary-contrast",Qi(r)),A(e,"--rag-secondary-soft",M(o,.48)),A(e,"--rag-radius-panel",a.panel),A(e,"--rag-radius-card",a.card),A(e,"--rag-radius-control",a.control),A(e,"--rag-shadow",Ji(i,s)),A(e,"--rag-window-surface",K(z(n,s?l:r,s?.055:.018))),A(e,"--rag-window-surface-2",K(z(n,s?c:l,s?.1:.42))),A(e,"--rag-header-surface",M(z(n,s?l:r,s?.075:.035),s?.96:.985)),A(e,"--rag-messages-surface",K(z(n,s?c:l,s?.045:.36))),A(e,"--rag-footer-surface",M(z(n,s?c:l,s?.035:.28),.98)),A(e,"--rag-control-surface",M(z(n,l,s?.07:.68),s?.78:.9)),A(e,"--rag-input-surface-resolved",K(z(n,l,s?.065:.62))),A(e,"--rag-assistant-message-bg",K(z(n,l,s?.075:.82))),A(e,"--rag-assistant-message-border",M(z(s?i:r,n,s?.78:.72),s?.2:.18)),A(e,"--rag-window-border",M(z(i,n,s?.74:.86),s?.18:.13)),A(e,"--rag-divider",M(i,s?.075:.08)),A(e,"--rag-card-shadow",s?"0 8px 18px rgba(0, 0, 0, 0.18)":`0 10px 24px ${M(i,.055)}`),A(e,"--rag-control-shadow",s?"0 8px 18px rgba(0, 0, 0, 0.16)":`0 8px 18px ${M(i,.05)}`),A(e,"--rag-user-message-start",K(z(r,l,s?.08:.16))),A(e,"--rag-user-message-end",K(z(r,c,.18)))}function Hi(e){return ji(e.colorMode)?{...e,surfaceColor:Nt(e.surfaceColor,H.surfaceColor,Rt.surfaceColor),textColor:Nt(e.textColor,H.textColor,Rt.textColor),secondaryColor:Nt(e.secondaryColor,H.secondaryColor,Rt.secondaryColor)}:e}function ji(e){return e==="dark"?!0:e==="light"?!1:window.matchMedia?.("(prefers-color-scheme: dark)").matches??!1}function Wi(e){return Gu(Ue(e.surfaceColor))<.28}function ot(e,t){const u=e?.trim();return u&&Yi(u)?Wu(u).toLowerCase():t}function Gi(e){return e==="graphite"||e==="ocean"||e==="azure"||e==="forest"||e==="rose"||e==="custom"?e:H.stylePreset}function Vi(e){return e==="standard"||e==="round"?e:H.borderRadius}function Zi(e){return e==="auto"||e==="light"||e==="dark"?e:H.colorMode}function Nt(e,t,u){return e.toLowerCase()===t.toLowerCase()?u:e}function Yi(e){return/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(e)}function Wu(e){return e.length===4?`#${e[1]}${e[1]}${e[2]}${e[2]}${e[3]}${e[3]}`:e}function Ue(e){const t=Wu(e).slice(1);return{r:Number.parseInt(t.slice(0,2),16),g:Number.parseInt(t.slice(2,4),16),b:Number.parseInt(t.slice(4,6),16)}}function z(e,t,u){const r=1-u;return{r:Math.round(e.r*r+t.r*u),g:Math.round(e.g*r+t.g*u),b:Math.round(e.b*r+t.b*u)}}function M(e,t){return`rgba(${e.r}, ${e.g}, ${e.b}, ${t})`}function K(e){return`#${zt(e.r)}${zt(e.g)}${zt(e.b)}`}function zt(e){return Math.min(Math.max(e,0),255).toString(16).padStart(2,"0")}function Qi(e){return Gu(e)>.55?"#171717":"#ffffff"}function Gu(e){const t=[e.r,e.g,e.b].map(u=>{const r=u/255;return r<=.03928?r/12.92:((r+.055)/1.055)**2.4});return .2126*t[0]+.7152*t[1]+.0722*t[2]}function Ji(e,t){return t?`0 20px 56px ${M(e,.1)}, 0 6px 18px rgba(0, 0, 0, 0.34)`:`0 20px 56px ${M(e,.12)}, 0 6px 18px ${M(e,.07)}`}function A(e,t,u){e.style.setProperty(t,u)}const at="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",Ot=24,Xi=800,Ki=260,eo=80,Lt="智阅助手",Vu="/plugins/summaraidGPT/assets/static/icon.svg",Zu=`你好，我是 {assistantName}。
我可以帮你检索站内知识库、总结当前页，也可以带你打开相关页面。`,Yu=["关于博主是谁？","最近更新了什么？","帮我总结当前页","有哪些值得先读的内容？"],Qu={enabled:!0,displayName:"鸡哥ikun",petJsonUrl:"/plugins/summaraidGPT/assets/static/pets/default-ikun/pet.json",spritesheetUrl:"/plugins/summaraidGPT/assets/static/pets/default-ikun/spritesheet.webp"},_e={assistantAvatar:Vu,assistantName:Lt,displayMode:"ragAgent",ragEnabled:!0,welcomeMessage:Zu.replace("{assistantName}",Lt),quickQuestions:Yu,styleConfig:H,buttonPosition:"right",horizontalOffset:Ot,verticalOffset:Ot,petSize:It,petSpeechMessages:$t,pet:Qu,access:{mode:"anonymous_chat_agent",allowAnonymous:!0,agentAllowed:!0,authenticated:!1},agent:Mt(void 0)};async function to(){try{const e=await fetch(`${at}/dialogConfig`,{headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();return no(t)}catch{return{..._e}}}async function uo(e,t,u){const r=await fetch(`${at}/ragAskStream`,{method:"POST",credentials:"same-origin",signal:u,headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(e)});if(!r.ok||!r.body)throw new Error(`HTTP ${r.status}`);const n=r.body.getReader(),i=new TextDecoder;let o="";const a=s=>{const c=ho(s);if(!c)return;const l=JSON.parse(c);l.type==="conversation"?l.conversationId&&t.onConversationId?.(l.conversationId):l.type==="sources"?t.onSources?.(l.sources||[]):l.type==="delta"?t.onDelta?.(l.delta||""):l.type==="done"?t.onDone?.():l.type==="error"&&t.onError?.(l.error||"RAG 问答失败")};for(;;){const{done:s,value:c}=await n.read();if(s){o+=i.decode();break}o+=i.decode(c,{stream:!0});const l=o.split(/\r?\n\r?\n/);o=l.pop()||"",l.forEach(a)}o.trim()&&a(o)}async function ro(e,t){if(!e.trim()||!t.trim())return;const u=new URLSearchParams({visitorId:t}),r=await fetch(`${at}/ragConversations/${encodeURIComponent(e)}?${u}`,{credentials:"same-origin",headers:{Accept:"application/json"}});if(!(r.status===404||r.status===403)){if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}}function no(e){const t=String(e.buttonPosition).trim()==="left"?"left":"right";return{..._e,...e,buttonPosition:t,assistantAvatar:lo(e.assistantAvatar),assistantName:Ku(e.assistantName),displayMode:fo(e.displayMode),ragEnabled:e.ragEnabled!==!1,welcomeMessage:so(e.welcomeMessage,e.assistantName),quickQuestions:Ju(e.quickQuestions,8,eo)||Yu,styleConfig:ju(e.styleConfig),horizontalOffset:Xu(e.horizontalOffset),verticalOffset:Xu(e.verticalOffset),petSize:po(e.petSize),petSpeechMessages:Ju(e.petSpeechMessages,12)||$t,pet:ao(e.pet)||Qu,access:io(e.access),agent:Mt(e.agent)}}function io(e){const t=oo(e?.mode);return{mode:t,allowAnonymous:t==="anonymous_chat"||t==="anonymous_chat_agent",agentAllowed:t==="anonymous_chat_agent"||t==="authenticated_chat_agent",authenticated:e?.authenticated===!0}}function oo(e){return e==="anonymous_chat"||e==="anonymous_chat_agent"||e==="authenticated_chat"||e==="authenticated_chat_agent"?e:"anonymous_chat_agent"}function ao(e){if(!e||e.enabled===!1)return;const t=e.spritesheetUrl?.trim();if(t)return{enabled:!0,displayName:e.displayName?.trim()||void 0,petJsonUrl:e.petJsonUrl?.trim()||void 0,spritesheetUrl:t}}function Ju(e,t=12,u=120){if(!Array.isArray(e))return;const r=e.map(n=>`${n||""}`.trim()).filter(Boolean).map(n=>n.slice(0,u)).slice(0,t);return r.length?r:void 0}function so(e,t){return(co(e,Ki)||Zu).replace("{assistantName}",Ku(t))}function co(e,t){const u=e?.trim();if(u)return u.length>t?u.slice(0,t):u}function lo(e){const t=e?.trim();return!t||t.toLowerCase().startsWith("javascript:")?Vu:t}function Xu(e){const t=Number(e);return Number.isFinite(t)?Math.round(Math.min(Math.max(t,0),Xi)):Ot}function po(e){const t=Number(e);return Number.isFinite(t)?Math.round(Math.min(Math.max(t,_i),wi)):It}function Ku(e){return e?.trim()||Lt}function fo(e){return e==="assistant"||e==="ragAgent"?"ragAgent":e==="rag"||e==="agent"||e==="petOnly"?e:"ragAgent"}function ho(e){const t=e.split(/\r?\n/).filter(u=>u.startsWith("data:")).map(u=>u.replace(/^data:\s?/,""));return t.length?t.join(`
`):void 0}const er="请输入您想从知识库了解的问题...",go=8,tr={};function bo(e){let t=tr[e];if(t)return t;t=tr[e]=[];for(let u=0;u<128;u++){const r=String.fromCharCode(u);t.push(r)}for(let u=0;u<e.length;u++){const r=e.charCodeAt(u);t[r]="%"+("0"+r.toString(16).toUpperCase()).slice(-2)}return t}function we(e,t){typeof t!="string"&&(t=we.defaultChars);const u=bo(t);return e.replace(/(%[a-f0-9]{2})+/gi,function(r){let n="";for(let i=0,o=r.length;i<o;i+=3){const a=parseInt(r.slice(i+1,i+3),16);if(a<128){n+=u[a];continue}if((a&224)===192&&i+3<o){const s=parseInt(r.slice(i+4,i+6),16);if((s&192)===128){const c=a<<6&1984|s&63;c<128?n+="��":n+=String.fromCharCode(c),i+=3;continue}}if((a&240)===224&&i+6<o){const s=parseInt(r.slice(i+4,i+6),16),c=parseInt(r.slice(i+7,i+9),16);if((s&192)===128&&(c&192)===128){const l=a<<12&61440|s<<6&4032|c&63;l<2048||l>=55296&&l<=57343?n+="���":n+=String.fromCharCode(l),i+=6;continue}}if((a&248)===240&&i+9<o){const s=parseInt(r.slice(i+4,i+6),16),c=parseInt(r.slice(i+7,i+9),16),l=parseInt(r.slice(i+10,i+12),16);if((s&192)===128&&(c&192)===128&&(l&192)===128){let d=a<<18&1835008|s<<12&258048|c<<6&4032|l&63;d<65536||d>1114111?n+="����":(d-=65536,n+=String.fromCharCode(55296+(d>>10),56320+(d&1023))),i+=9;continue}}n+="�"}return n})}we.defaultChars=";/?:@&=+$,#",we.componentChars="";const ur={};function mo(e){let t=ur[e];if(t)return t;t=ur[e]=[];for(let u=0;u<128;u++){const r=String.fromCharCode(u);/^[0-9a-z]$/i.test(r)?t.push(r):t.push("%"+("0"+u.toString(16).toUpperCase()).slice(-2))}for(let u=0;u<e.length;u++)t[e.charCodeAt(u)]=e[u];return t}function qe(e,t,u){typeof t!="string"&&(u=t,t=qe.defaultChars),typeof u>"u"&&(u=!0);const r=mo(t);let n="";for(let i=0,o=e.length;i<o;i++){const a=e.charCodeAt(i);if(u&&a===37&&i+2<o&&/^[0-9a-f]{2}$/i.test(e.slice(i+1,i+3))){n+=e.slice(i,i+3),i+=2;continue}if(a<128){n+=r[a];continue}if(a>=55296&&a<=57343){if(a>=55296&&a<=56319&&i+1<o){const s=e.charCodeAt(i+1);if(s>=56320&&s<=57343){n+=encodeURIComponent(e[i]+e[i+1]),i++;continue}}n+="%EF%BF%BD";continue}n+=encodeURIComponent(e[i])}return n}qe.defaultChars=";/?:@&=+$,-_.!~*'()#",qe.componentChars="-_.!~*'()";function Bt(e){let t="";return t+=e.protocol||"",t+=e.slashes?"//":"",t+=e.auth?e.auth+"@":"",e.hostname&&e.hostname.indexOf(":")!==-1?t+="["+e.hostname+"]":t+=e.hostname||"",t+=e.port?":"+e.port:"",t+=e.pathname||"",t+=e.search||"",t+=e.hash||"",t}function st(){this.protocol=null,this.slashes=null,this.auth=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.pathname=null}const xo=/^([a-z0-9.+-]+:)/i,yo=/:[0-9]*$/,_o=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,wo=["<",">",'"',"`"," ","\r",`
`,"	"],Co=["{","}","|","\\","^","`"].concat(wo),vo=["'"].concat(Co),rr=["%","/","?",";","#"].concat(vo),nr=["/","?","#"],Ao=255,ir=/^[+a-z0-9A-Z_-]{0,63}$/,ko=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,or={javascript:!0,"javascript:":!0},ar={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0};function Ut(e,t){if(e&&e instanceof st)return e;const u=new st;return u.parse(e,t),u}st.prototype.parse=function(e,t){let u,r,n,i=e;if(i=i.trim(),!t&&e.split("#").length===1){const c=_o.exec(i);if(c)return this.pathname=c[1],c[2]&&(this.search=c[2]),this}let o=xo.exec(i);if(o&&(o=o[0],u=o.toLowerCase(),this.protocol=o,i=i.substr(o.length)),(t||o||i.match(/^\/\/[^@\/]+@[^@\/]+/))&&(n=i.substr(0,2)==="//",n&&!(o&&or[o])&&(i=i.substr(2),this.slashes=!0)),!or[o]&&(n||o&&!ar[o])){let c=-1;for(let p=0;p<nr.length;p++)r=i.indexOf(nr[p]),r!==-1&&(c===-1||r<c)&&(c=r);let l,d;c===-1?d=i.lastIndexOf("@"):d=i.lastIndexOf("@",c),d!==-1&&(l=i.slice(0,d),i=i.slice(d+1),this.auth=l),c=-1;for(let p=0;p<rr.length;p++)r=i.indexOf(rr[p]),r!==-1&&(c===-1||r<c)&&(c=r);c===-1&&(c=i.length),i[c-1]===":"&&c--;const h=i.slice(0,c);i=i.slice(c),this.parseHost(h),this.hostname=this.hostname||"";const f=this.hostname[0]==="["&&this.hostname[this.hostname.length-1]==="]";if(!f){const p=this.hostname.split(/\./);for(let w=0,_=p.length;w<_;w++){const E=p[w];if(E&&!E.match(ir)){let m="";for(let x=0,g=E.length;x<g;x++)E.charCodeAt(x)>127?m+="x":m+=E[x];if(!m.match(ir)){const x=p.slice(0,w),g=p.slice(w+1),b=E.match(ko);b&&(x.push(b[1]),g.unshift(b[2])),g.length&&(i=g.join(".")+i),this.hostname=x.join(".");break}}}}this.hostname.length>Ao&&(this.hostname=""),f&&(this.hostname=this.hostname.substr(1,this.hostname.length-2))}const a=i.indexOf("#");a!==-1&&(this.hash=i.substr(a),i=i.slice(0,a));const s=i.indexOf("?");return s!==-1&&(this.search=i.substr(s),i=i.slice(0,s)),i&&(this.pathname=i),ar[u]&&this.hostname&&!this.pathname&&(this.pathname=""),this},st.prototype.parseHost=function(e){let t=yo.exec(e);t&&(t=t[0],t!==":"&&(this.port=t.substr(1)),e=e.substr(0,e.length-t.length)),e&&(this.hostname=e)};const Eo=Object.freeze(Object.defineProperty({__proto__:null,decode:we,encode:qe,format:Bt,parse:Ut},Symbol.toStringTag,{value:"Module"})),sr=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,cr=/[\0-\x1F\x7F-\x9F]/,So=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/,qt=/[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/,lr=/[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/,dr=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/,Do=Object.freeze(Object.defineProperty({__proto__:null,Any:sr,Cc:cr,Cf:So,P:qt,S:lr,Z:dr},Symbol.toStringTag,{value:"Module"})),To=new Uint16Array('ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map(e=>e.charCodeAt(0))),Po=new Uint16Array("Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map(e=>e.charCodeAt(0)));var Ht;const Fo=new Map([[0,65533],[128,8364],[130,8218],[131,402],[132,8222],[133,8230],[134,8224],[135,8225],[136,710],[137,8240],[138,352],[139,8249],[140,338],[142,381],[145,8216],[146,8217],[147,8220],[148,8221],[149,8226],[150,8211],[151,8212],[152,732],[153,8482],[154,353],[155,8250],[156,339],[158,382],[159,376]]),$o=(Ht=String.fromCodePoint)!==null&&Ht!==void 0?Ht:function(e){let t="";return e>65535&&(e-=65536,t+=String.fromCharCode(e>>>10&1023|55296),e=56320|e&1023),t+=String.fromCharCode(e),t};function Io(e){var t;return e>=55296&&e<=57343||e>1114111?65533:(t=Fo.get(e))!==null&&t!==void 0?t:e}var $;(function(e){e[e.NUM=35]="NUM",e[e.SEMI=59]="SEMI",e[e.EQUALS=61]="EQUALS",e[e.ZERO=48]="ZERO",e[e.NINE=57]="NINE",e[e.LOWER_A=97]="LOWER_A",e[e.LOWER_F=102]="LOWER_F",e[e.LOWER_X=120]="LOWER_X",e[e.LOWER_Z=122]="LOWER_Z",e[e.UPPER_A=65]="UPPER_A",e[e.UPPER_F=70]="UPPER_F",e[e.UPPER_Z=90]="UPPER_Z"})($||($={}));const Mo=32;var ne;(function(e){e[e.VALUE_LENGTH=49152]="VALUE_LENGTH",e[e.BRANCH_LENGTH=16256]="BRANCH_LENGTH",e[e.JUMP_TABLE=127]="JUMP_TABLE"})(ne||(ne={}));function jt(e){return e>=$.ZERO&&e<=$.NINE}function Ro(e){return e>=$.UPPER_A&&e<=$.UPPER_F||e>=$.LOWER_A&&e<=$.LOWER_F}function No(e){return e>=$.UPPER_A&&e<=$.UPPER_Z||e>=$.LOWER_A&&e<=$.LOWER_Z||jt(e)}function zo(e){return e===$.EQUALS||No(e)}var I;(function(e){e[e.EntityStart=0]="EntityStart",e[e.NumericStart=1]="NumericStart",e[e.NumericDecimal=2]="NumericDecimal",e[e.NumericHex=3]="NumericHex",e[e.NamedEntity=4]="NamedEntity"})(I||(I={}));var ee;(function(e){e[e.Legacy=0]="Legacy",e[e.Strict=1]="Strict",e[e.Attribute=2]="Attribute"})(ee||(ee={}));class Oo{constructor(t,u,r){this.decodeTree=t,this.emitCodePoint=u,this.errors=r,this.state=I.EntityStart,this.consumed=1,this.result=0,this.treeIndex=0,this.excess=1,this.decodeMode=ee.Strict}startEntity(t){this.decodeMode=t,this.state=I.EntityStart,this.result=0,this.treeIndex=0,this.excess=1,this.consumed=1}write(t,u){switch(this.state){case I.EntityStart:return t.charCodeAt(u)===$.NUM?(this.state=I.NumericStart,this.consumed+=1,this.stateNumericStart(t,u+1)):(this.state=I.NamedEntity,this.stateNamedEntity(t,u));case I.NumericStart:return this.stateNumericStart(t,u);case I.NumericDecimal:return this.stateNumericDecimal(t,u);case I.NumericHex:return this.stateNumericHex(t,u);case I.NamedEntity:return this.stateNamedEntity(t,u)}}stateNumericStart(t,u){return u>=t.length?-1:(t.charCodeAt(u)|Mo)===$.LOWER_X?(this.state=I.NumericHex,this.consumed+=1,this.stateNumericHex(t,u+1)):(this.state=I.NumericDecimal,this.stateNumericDecimal(t,u))}addToNumericResult(t,u,r,n){if(u!==r){const i=r-u;this.result=this.result*Math.pow(n,i)+parseInt(t.substr(u,i),n),this.consumed+=i}}stateNumericHex(t,u){const r=u;for(;u<t.length;){const n=t.charCodeAt(u);if(jt(n)||Ro(n))u+=1;else return this.addToNumericResult(t,r,u,16),this.emitNumericEntity(n,3)}return this.addToNumericResult(t,r,u,16),-1}stateNumericDecimal(t,u){const r=u;for(;u<t.length;){const n=t.charCodeAt(u);if(jt(n))u+=1;else return this.addToNumericResult(t,r,u,10),this.emitNumericEntity(n,2)}return this.addToNumericResult(t,r,u,10),-1}emitNumericEntity(t,u){var r;if(this.consumed<=u)return(r=this.errors)===null||r===void 0||r.absenceOfDigitsInNumericCharacterReference(this.consumed),0;if(t===$.SEMI)this.consumed+=1;else if(this.decodeMode===ee.Strict)return 0;return this.emitCodePoint(Io(this.result),this.consumed),this.errors&&(t!==$.SEMI&&this.errors.missingSemicolonAfterCharacterReference(),this.errors.validateNumericCharacterReference(this.result)),this.consumed}stateNamedEntity(t,u){const{decodeTree:r}=this;let n=r[this.treeIndex],i=(n&ne.VALUE_LENGTH)>>14;for(;u<t.length;u++,this.excess++){const o=t.charCodeAt(u);if(this.treeIndex=Lo(r,n,this.treeIndex+Math.max(1,i),o),this.treeIndex<0)return this.result===0||this.decodeMode===ee.Attribute&&(i===0||zo(o))?0:this.emitNotTerminatedNamedEntity();if(n=r[this.treeIndex],i=(n&ne.VALUE_LENGTH)>>14,i!==0){if(o===$.SEMI)return this.emitNamedEntityData(this.treeIndex,i,this.consumed+this.excess);this.decodeMode!==ee.Strict&&(this.result=this.treeIndex,this.consumed+=this.excess,this.excess=0)}}return-1}emitNotTerminatedNamedEntity(){var t;const{result:u,decodeTree:r}=this,n=(r[u]&ne.VALUE_LENGTH)>>14;return this.emitNamedEntityData(u,n,this.consumed),(t=this.errors)===null||t===void 0||t.missingSemicolonAfterCharacterReference(),this.consumed}emitNamedEntityData(t,u,r){const{decodeTree:n}=this;return this.emitCodePoint(u===1?n[t]&~ne.VALUE_LENGTH:n[t+1],r),u===3&&this.emitCodePoint(n[t+2],r),r}end(){var t;switch(this.state){case I.NamedEntity:return this.result!==0&&(this.decodeMode!==ee.Attribute||this.result===this.treeIndex)?this.emitNotTerminatedNamedEntity():0;case I.NumericDecimal:return this.emitNumericEntity(0,2);case I.NumericHex:return this.emitNumericEntity(0,3);case I.NumericStart:return(t=this.errors)===null||t===void 0||t.absenceOfDigitsInNumericCharacterReference(this.consumed),0;case I.EntityStart:return 0}}}function pr(e){let t="";const u=new Oo(e,r=>t+=$o(r));return function(n,i){let o=0,a=0;for(;(a=n.indexOf("&",a))>=0;){t+=n.slice(o,a),u.startEntity(i);const c=u.write(n,a+1);if(c<0){o=a+u.end();break}o=a+c,a=c===0?o+1:o}const s=t+n.slice(o);return t="",s}}function Lo(e,t,u,r){const n=(t&ne.BRANCH_LENGTH)>>7,i=t&ne.JUMP_TABLE;if(n===0)return i!==0&&r===i?u:-1;if(i){const s=r-i;return s<0||s>=n?-1:e[u+s]-1}let o=u,a=o+n-1;for(;o<=a;){const s=o+a>>>1,c=e[s];if(c<r)o=s+1;else if(c>r)a=s-1;else return e[s+n]}return-1}const fr=pr(To);pr(Po);function Bo(e,t=ee.Legacy){return fr(e,t)}function Uo(e){return fr(e,ee.Strict)}function qo(e){return Object.prototype.toString.call(e)}function Wt(e){return qo(e)==="[object String]"}const Ho=Object.prototype.hasOwnProperty;function jo(e,t){return Ho.call(e,t)}function ct(e){return Array.prototype.slice.call(arguments,1).forEach(function(u){if(u){if(typeof u!="object")throw new TypeError(u+"must be object");Object.keys(u).forEach(function(r){e[r]=u[r]})}}),e}function hr(e,t,u){return[].concat(e.slice(0,t),u,e.slice(t+1))}function Gt(e){return!(e>=55296&&e<=57343||e>=64976&&e<=65007||(e&65535)===65535||(e&65535)===65534||e>=0&&e<=8||e===11||e>=14&&e<=31||e>=127&&e<=159||e>1114111)}function He(e){if(e>65535){e-=65536;const t=55296+(e>>10),u=56320+(e&1023);return String.fromCharCode(t,u)}return String.fromCharCode(e)}const gr=/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,Wo=/&([a-z#][a-z0-9]{1,31});/gi,Go=new RegExp(gr.source+"|"+Wo.source,"gi"),Vo=/^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;function Zo(e,t){if(t.charCodeAt(0)===35&&Vo.test(t)){const r=t[1].toLowerCase()==="x"?parseInt(t.slice(2),16):parseInt(t.slice(1),10);return Gt(r)?He(r):e}const u=Bo(e);return u!==e?u:e}function Yo(e){return e.indexOf("\\")<0?e:e.replace(gr,"$1")}function Ce(e){return e.indexOf("\\")<0&&e.indexOf("&")<0?e:e.replace(Go,function(t,u,r){return u||Zo(t,r)})}const Qo=/[&<>"]/,Jo=/[&<>"]/g,Xo={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"};function Ko(e){return Xo[e]}function ie(e){return Qo.test(e)?e.replace(Jo,Ko):e}const ea=/[.?*+^$[\]\\(){}|-]/g;function ta(e){return e.replace(ea,"\\$&")}function P(e){switch(e){case 9:case 32:return!0}return!1}function je(e){if(e>=8192&&e<=8202)return!0;switch(e){case 9:case 10:case 11:case 12:case 13:case 32:case 160:case 5760:case 8239:case 8287:case 12288:return!0}return!1}function br(e){return qt.test(e)||lr.test(e)}function We(e){return br(He(e))}function Ge(e){switch(e){case 33:case 34:case 35:case 36:case 37:case 38:case 39:case 40:case 41:case 42:case 43:case 44:case 45:case 46:case 47:case 58:case 59:case 60:case 61:case 62:case 63:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 124:case 125:case 126:return!0;default:return!1}}function lt(e){return e=e.trim().replace(/\s+/g," "),"ẞ".toLowerCase()==="Ṿ"&&(e=e.replace(/ẞ/g,"ß")),e.toLowerCase().toUpperCase()}function mr(e){return e===32||e===9||e===10||e===13}function dt(e){let t=0;for(;t<e.length&&mr(e.charCodeAt(t));t++);let u=e.length-1;for(;u>=t&&mr(e.charCodeAt(u));u--);return e.slice(t,u+1)}const ua=Object.freeze(Object.defineProperty({__proto__:null,arrayReplaceAt:hr,asciiTrim:dt,assign:ct,escapeHtml:ie,escapeRE:ta,fromCodePoint:He,has:jo,isMdAsciiPunct:Ge,isPunctChar:br,isPunctCharCode:We,isSpace:P,isString:Wt,isValidEntityCode:Gt,isWhiteSpace:je,lib:{mdurl:Eo,ucmicro:Do},normalizeReference:lt,unescapeAll:Ce,unescapeMd:Yo},Symbol.toStringTag,{value:"Module"}));function ra(e,t,u){let r,n,i,o;const a=e.posMax,s=e.pos;for(e.pos=t+1,r=1;e.pos<a;){if(i=e.src.charCodeAt(e.pos),i===93&&(r--,r===0)){n=!0;break}if(o=e.pos,e.md.inline.skipToken(e),i===91){if(o===e.pos-1)r++;else if(u)return e.pos=s,-1}}let c=-1;return n&&(c=e.pos),e.pos=s,c}function na(e,t,u){let r,n=t;const i={ok:!1,pos:0,str:""};if(e.charCodeAt(n)===60){for(n++;n<u;){if(r=e.charCodeAt(n),r===10||r===60)return i;if(r===62)return i.pos=n+1,i.str=Ce(e.slice(t+1,n)),i.ok=!0,i;if(r===92&&n+1<u){n+=2;continue}n++}return i}let o=0;for(;n<u&&(r=e.charCodeAt(n),!(r===32||r<32||r===127));){if(r===92&&n+1<u){if(e.charCodeAt(n+1)===32)break;n+=2;continue}if(r===40&&(o++,o>32))return i;if(r===41){if(o===0)break;o--}n++}return t===n||o!==0||(i.str=Ce(e.slice(t,n)),i.pos=n,i.ok=!0),i}function ia(e,t,u,r){let n,i=t;const o={ok:!1,can_continue:!1,pos:0,str:"",marker:0};if(r)o.str=r.str,o.marker=r.marker;else{if(i>=u)return o;let a=e.charCodeAt(i);if(a!==34&&a!==39&&a!==40)return o;t++,i++,a===40&&(a=41),o.marker=a}for(;i<u;){if(n=e.charCodeAt(i),n===o.marker)return o.pos=i+1,o.str+=Ce(e.slice(t,i)),o.ok=!0,o;if(n===40&&o.marker===41)return o;n===92&&i+1<u&&i++,i++}return o.can_continue=!0,o.str+=Ce(e.slice(t,i)),o}const oa=Object.freeze(Object.defineProperty({__proto__:null,parseLinkDestination:na,parseLinkLabel:ra,parseLinkTitle:ia},Symbol.toStringTag,{value:"Module"})),Z={};Z.code_inline=function(e,t,u,r,n){const i=e[t];return"<code"+n.renderAttrs(i)+">"+ie(i.content)+"</code>"},Z.code_block=function(e,t,u,r,n){const i=e[t];return"<pre"+n.renderAttrs(i)+"><code>"+ie(e[t].content)+`</code></pre>
`},Z.fence=function(e,t,u,r,n){const i=e[t],o=i.info?Ce(i.info).trim():"";let a="",s="";if(o){const l=o.split(/(\s+)/g);a=l[0],s=l.slice(2).join("")}let c;if(u.highlight?c=u.highlight(i.content,a,s)||ie(i.content):c=ie(i.content),c.indexOf("<pre")===0)return c+`
`;if(o){const l=i.attrIndex("class"),d=i.attrs?i.attrs.slice():[];l<0?d.push(["class",u.langPrefix+a]):(d[l]=d[l].slice(),d[l][1]+=" "+u.langPrefix+a);const h={attrs:d};return`<pre><code${n.renderAttrs(h)}>${c}</code></pre>
`}return`<pre><code${n.renderAttrs(i)}>${c}</code></pre>
`},Z.image=function(e,t,u,r,n){const i=e[t];return i.attrs[i.attrIndex("alt")][1]=n.renderInlineAsText(i.children,u,r),n.renderToken(e,t,u)},Z.hardbreak=function(e,t,u){return u.xhtmlOut?`<br />
`:`<br>
`},Z.softbreak=function(e,t,u){return u.breaks?u.xhtmlOut?`<br />
`:`<br>
`:`
`},Z.text=function(e,t){return ie(e[t].content)},Z.html_block=function(e,t){return e[t].content},Z.html_inline=function(e,t){return e[t].content};function ve(){this.rules=ct({},Z)}ve.prototype.renderAttrs=function(t){let u,r,n;if(!t.attrs)return"";for(n="",u=0,r=t.attrs.length;u<r;u++)n+=" "+ie(t.attrs[u][0])+'="'+ie(t.attrs[u][1])+'"';return n},ve.prototype.renderToken=function(t,u,r){const n=t[u];let i="";if(n.hidden)return"";n.block&&n.nesting!==-1&&u&&t[u-1].hidden&&(i+=`
`),i+=(n.nesting===-1?"</":"<")+n.tag,i+=this.renderAttrs(n),n.nesting===0&&r.xhtmlOut&&(i+=" /");let o=!1;if(n.block&&(o=!0,n.nesting===1&&u+1<t.length)){const a=t[u+1];(a.type==="inline"||a.hidden||a.nesting===-1&&a.tag===n.tag)&&(o=!1)}return i+=o?`>
`:">",i},ve.prototype.renderInline=function(e,t,u){let r="";const n=this.rules;for(let i=0,o=e.length;i<o;i++){const a=e[i].type;typeof n[a]<"u"?r+=n[a](e,i,t,u,this):r+=this.renderToken(e,i,t)}return r},ve.prototype.renderInlineAsText=function(e,t,u){let r="";for(let n=0,i=e.length;n<i;n++)switch(e[n].type){case"text":r+=e[n].content;break;case"image":r+=this.renderInlineAsText(e[n].children,t,u);break;case"html_inline":case"html_block":r+=e[n].content;break;case"softbreak":case"hardbreak":r+=`
`;break}return r},ve.prototype.render=function(e,t,u){let r="";const n=this.rules;for(let i=0,o=e.length;i<o;i++){const a=e[i].type;a==="inline"?r+=this.renderInline(e[i].children,t,u):typeof n[a]<"u"?r+=n[a](e,i,t,u,this):r+=this.renderToken(e,i,t,u)}return r};function O(){this.__rules__=[],this.__cache__=null}O.prototype.__find__=function(e){for(let t=0;t<this.__rules__.length;t++)if(this.__rules__[t].name===e)return t;return-1},O.prototype.__compile__=function(){const e=this,t=[""];e.__rules__.forEach(function(u){u.enabled&&u.alt.forEach(function(r){t.indexOf(r)<0&&t.push(r)})}),e.__cache__={},t.forEach(function(u){e.__cache__[u]=[],e.__rules__.forEach(function(r){r.enabled&&(u&&r.alt.indexOf(u)<0||e.__cache__[u].push(r.fn))})})},O.prototype.at=function(e,t,u){const r=this.__find__(e),n=u||{};if(r===-1)throw new Error("Parser rule not found: "+e);this.__rules__[r].fn=t,this.__rules__[r].alt=n.alt||[],this.__cache__=null},O.prototype.before=function(e,t,u,r){const n=this.__find__(e),i=r||{};if(n===-1)throw new Error("Parser rule not found: "+e);this.__rules__.splice(n,0,{name:t,enabled:!0,fn:u,alt:i.alt||[]}),this.__cache__=null},O.prototype.after=function(e,t,u,r){const n=this.__find__(e),i=r||{};if(n===-1)throw new Error("Parser rule not found: "+e);this.__rules__.splice(n+1,0,{name:t,enabled:!0,fn:u,alt:i.alt||[]}),this.__cache__=null},O.prototype.push=function(e,t,u){const r=u||{};this.__rules__.push({name:e,enabled:!0,fn:t,alt:r.alt||[]}),this.__cache__=null},O.prototype.enable=function(e,t){Array.isArray(e)||(e=[e]);const u=[];return e.forEach(function(r){const n=this.__find__(r);if(n<0){if(t)return;throw new Error("Rules manager: invalid rule name "+r)}this.__rules__[n].enabled=!0,u.push(r)},this),this.__cache__=null,u},O.prototype.enableOnly=function(e,t){Array.isArray(e)||(e=[e]),this.__rules__.forEach(function(u){u.enabled=!1}),this.enable(e,t)},O.prototype.disable=function(e,t){Array.isArray(e)||(e=[e]);const u=[];return e.forEach(function(r){const n=this.__find__(r);if(n<0){if(t)return;throw new Error("Rules manager: invalid rule name "+r)}this.__rules__[n].enabled=!1,u.push(r)},this),this.__cache__=null,u},O.prototype.getRules=function(e){return this.__cache__===null&&this.__compile__(),this.__cache__[e]||[]};function j(e,t,u){this.type=e,this.tag=t,this.attrs=null,this.map=null,this.nesting=u,this.level=0,this.children=null,this.content="",this.markup="",this.info="",this.meta=null,this.block=!1,this.hidden=!1}j.prototype.attrIndex=function(t){if(!this.attrs)return-1;const u=this.attrs;for(let r=0,n=u.length;r<n;r++)if(u[r][0]===t)return r;return-1},j.prototype.attrPush=function(t){this.attrs?this.attrs.push(t):this.attrs=[t]},j.prototype.attrSet=function(t,u){const r=this.attrIndex(t),n=[t,u];r<0?this.attrPush(n):this.attrs[r]=n},j.prototype.attrGet=function(t){const u=this.attrIndex(t);let r=null;return u>=0&&(r=this.attrs[u][1]),r},j.prototype.attrJoin=function(t,u){const r=this.attrIndex(t);r<0?this.attrPush([t,u]):this.attrs[r][1]=this.attrs[r][1]+" "+u};function xr(e,t,u){this.src=e,this.env=u,this.tokens=[],this.inlineMode=!1,this.md=t}xr.prototype.Token=j;const aa=/\r\n?|\n/g,sa=/\0/g;function ca(e){let t;t=e.src.replace(aa,`
`),t=t.replace(sa,"�"),e.src=t}function la(e){let t;e.inlineMode?(t=new e.Token("inline","",0),t.content=e.src,t.map=[0,1],t.children=[],e.tokens.push(t)):e.md.block.parse(e.src,e.md,e.env,e.tokens)}function da(e){const t=e.tokens;for(let u=0,r=t.length;u<r;u++){const n=t[u];n.type==="inline"&&e.md.inline.parse(n.content,e.md,e.env,n.children)}}function pa(e){return/^<a[>\s]/i.test(e)}function fa(e){return/^<\/a\s*>/i.test(e)}function ha(e){const t=e.tokens;if(e.md.options.linkify)for(let u=0,r=t.length;u<r;u++){if(t[u].type!=="inline"||!e.md.linkify.pretest(t[u].content))continue;let n=t[u].children,i=0;for(let o=n.length-1;o>=0;o--){const a=n[o];if(a.type==="link_close"){for(o--;n[o].level!==a.level&&n[o].type!=="link_open";)o--;continue}if(a.type==="html_inline"&&(pa(a.content)&&i>0&&i--,fa(a.content)&&i++),!(i>0)&&a.type==="text"&&e.md.linkify.test(a.content)){const s=a.content;let c=e.md.linkify.match(s);const l=[];let d=a.level,h=0;c.length>0&&c[0].index===0&&o>0&&n[o-1].type==="text_special"&&(c=c.slice(1));for(let f=0;f<c.length;f++){const p=c[f].url,w=e.md.normalizeLink(p);if(!e.md.validateLink(w))continue;let _=c[f].text;c[f].schema?c[f].schema==="mailto:"&&!/^mailto:/i.test(_)?_=e.md.normalizeLinkText("mailto:"+_).replace(/^mailto:/,""):_=e.md.normalizeLinkText(_):_=e.md.normalizeLinkText("http://"+_).replace(/^http:\/\//,"");const E=c[f].index;if(E>h){const b=new e.Token("text","",0);b.content=s.slice(h,E),b.level=d,l.push(b)}const m=new e.Token("link_open","a",1);m.attrs=[["href",w]],m.level=d++,m.markup="linkify",m.info="auto",l.push(m);const x=new e.Token("text","",0);x.content=_,x.level=d,l.push(x);const g=new e.Token("link_close","a",-1);g.level=--d,g.markup="linkify",g.info="auto",l.push(g),h=c[f].lastIndex}if(h<s.length){const f=new e.Token("text","",0);f.content=s.slice(h),f.level=d,l.push(f)}t[u].children=n=hr(n,o,l)}}}}const yr=/\+-|\.\.|\?\?\?\?|!!!!|,,|--/,ga=/\((c|tm|r)\)/i,ba=/\((c|tm|r)\)/ig,ma={c:"©",r:"®",tm:"™"};function xa(e,t){return ma[t.toLowerCase()]}function ya(e){let t=0;for(let u=e.length-1;u>=0;u--){const r=e[u];r.type==="text"&&!t&&(r.content=r.content.replace(ba,xa)),r.type==="link_open"&&r.info==="auto"&&t--,r.type==="link_close"&&r.info==="auto"&&t++}}function _a(e){let t=0;for(let u=e.length-1;u>=0;u--){const r=e[u];r.type==="text"&&!t&&yr.test(r.content)&&(r.content=r.content.replace(/\+-/g,"±").replace(/\.{2,}/g,"…").replace(/([?!])…/g,"$1..").replace(/([?!]){4,}/g,"$1$1$1").replace(/,{2,}/g,",").replace(/(^|[^-])---(?=[^-]|$)/mg,"$1—").replace(/(^|\s)--(?=\s|$)/mg,"$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg,"$1–")),r.type==="link_open"&&r.info==="auto"&&t--,r.type==="link_close"&&r.info==="auto"&&t++}}function wa(e){let t;if(e.md.options.typographer)for(t=e.tokens.length-1;t>=0;t--)e.tokens[t].type==="inline"&&(ga.test(e.tokens[t].content)&&ya(e.tokens[t].children),yr.test(e.tokens[t].content)&&_a(e.tokens[t].children))}const Ca=/['"]/,_r=/['"]/g,wr="’";function pt(e,t,u,r){e[t]||(e[t]=[]),e[t].push({pos:u,ch:r})}function va(e,t){let u="",r=0;t.sort((n,i)=>n.pos-i.pos);for(let n=0;n<t.length;n++){const i=t[n];u+=e.slice(r,i.pos)+i.ch,r=i.pos+1}return u+e.slice(r)}function Aa(e,t){let u;const r=[],n={};for(let i=0;i<e.length;i++){const o=e[i],a=e[i].level;for(u=r.length-1;u>=0&&!(r[u].level<=a);u--);if(r.length=u+1,o.type!=="text")continue;const s=o.content;let c=0;const l=s.length;e:for(;c<l;){_r.lastIndex=c;const d=_r.exec(s);if(!d)break;let h=!0,f=!0;c=d.index+1;const p=d[0]==="'";let w=32;if(d.index-1>=0)w=s.charCodeAt(d.index-1);else for(u=i-1;u>=0&&!(e[u].type==="softbreak"||e[u].type==="hardbreak");u--)if(e[u].content){w=e[u].content.charCodeAt(e[u].content.length-1);break}let _=32;if(c<l)_=s.charCodeAt(c);else for(u=i+1;u<e.length&&!(e[u].type==="softbreak"||e[u].type==="hardbreak");u++)if(e[u].content){_=e[u].content.charCodeAt(0);break}const E=Ge(w)||We(w),m=Ge(_)||We(_),x=je(w),g=je(_);if(g?h=!1:m&&(x||E||(h=!1)),x?f=!1:E&&(g||m||(f=!1)),_===34&&d[0]==='"'&&w>=48&&w<=57&&(f=h=!1),h&&f&&(h=E,f=m),!h&&!f){p&&pt(n,i,d.index,wr);continue}if(f)for(u=r.length-1;u>=0;u--){let b=r[u];if(r[u].level<a)break;if(b.single===p&&r[u].level===a){b=r[u];let y,T;p?(y=t.md.options.quotes[2],T=t.md.options.quotes[3]):(y=t.md.options.quotes[0],T=t.md.options.quotes[1]),pt(n,i,d.index,T),pt(n,b.token,b.pos,y),r.length=u;continue e}}h?r.push({token:i,pos:d.index,single:p,level:a}):f&&p&&pt(n,i,d.index,wr)}}Object.keys(n).forEach(function(i){e[i].content=va(e[i].content,n[i])})}function ka(e){if(e.md.options.typographer)for(let t=e.tokens.length-1;t>=0;t--)e.tokens[t].type!=="inline"||!Ca.test(e.tokens[t].content)||Aa(e.tokens[t].children,e)}function Ea(e){let t,u;const r=e.tokens,n=r.length;for(let i=0;i<n;i++){if(r[i].type!=="inline")continue;const o=r[i].children,a=o.length;for(t=0;t<a;t++)o[t].type==="text_special"&&(o[t].type="text");for(t=u=0;t<a;t++)o[t].type==="text"&&t+1<a&&o[t+1].type==="text"?o[t+1].content=o[t].content+o[t+1].content:(t!==u&&(o[u]=o[t]),u++);t!==u&&(o.length=u)}}const Vt=[["normalize",ca],["block",la],["inline",da],["linkify",ha],["replacements",wa],["smartquotes",ka],["text_join",Ea]];function Zt(){this.ruler=new O;for(let e=0;e<Vt.length;e++)this.ruler.push(Vt[e][0],Vt[e][1])}Zt.prototype.process=function(e){const t=this.ruler.getRules("");for(let u=0,r=t.length;u<r;u++)t[u](e)},Zt.prototype.State=xr;function Y(e,t,u,r){this.src=e,this.md=t,this.env=u,this.tokens=r,this.bMarks=[],this.eMarks=[],this.tShift=[],this.sCount=[],this.bsCount=[],this.blkIndent=0,this.line=0,this.lineMax=0,this.tight=!1,this.ddIndent=-1,this.listIndent=-1,this.parentType="root",this.level=0;const n=this.src;for(let i=0,o=0,a=0,s=0,c=n.length,l=!1;o<c;o++){const d=n.charCodeAt(o);if(!l)if(P(d)){a++,d===9?s+=4-s%4:s++;continue}else l=!0;(d===10||o===c-1)&&(d!==10&&o++,this.bMarks.push(i),this.eMarks.push(o),this.tShift.push(a),this.sCount.push(s),this.bsCount.push(0),l=!1,a=0,s=0,i=o+1)}this.bMarks.push(n.length),this.eMarks.push(n.length),this.tShift.push(0),this.sCount.push(0),this.bsCount.push(0),this.lineMax=this.bMarks.length-1}Y.prototype.push=function(e,t,u){const r=new j(e,t,u);return r.block=!0,u<0&&this.level--,r.level=this.level,u>0&&this.level++,this.tokens.push(r),r},Y.prototype.isEmpty=function(t){return this.bMarks[t]+this.tShift[t]>=this.eMarks[t]},Y.prototype.skipEmptyLines=function(t){for(let u=this.lineMax;t<u&&!(this.bMarks[t]+this.tShift[t]<this.eMarks[t]);t++);return t},Y.prototype.skipSpaces=function(t){for(let u=this.src.length;t<u;t++){const r=this.src.charCodeAt(t);if(!P(r))break}return t},Y.prototype.skipSpacesBack=function(t,u){if(t<=u)return t;for(;t>u;)if(!P(this.src.charCodeAt(--t)))return t+1;return t},Y.prototype.skipChars=function(t,u){for(let r=this.src.length;t<r&&this.src.charCodeAt(t)===u;t++);return t},Y.prototype.skipCharsBack=function(t,u,r){if(t<=r)return t;for(;t>r;)if(u!==this.src.charCodeAt(--t))return t+1;return t},Y.prototype.getLines=function(t,u,r,n){if(t>=u)return"";const i=new Array(u-t);for(let o=0,a=t;a<u;a++,o++){let s=0;const c=this.bMarks[a];let l=c,d;for(a+1<u||n?d=this.eMarks[a]+1:d=this.eMarks[a];l<d&&s<r;){const h=this.src.charCodeAt(l);if(P(h))h===9?s+=4-(s+this.bsCount[a])%4:s++;else if(l-c<this.tShift[a])s++;else break;l++}s>r?i[o]=new Array(s-r+1).join(" ")+this.src.slice(l,d):i[o]=this.src.slice(l,d)}return i.join("")},Y.prototype.Token=j;const Sa=65536;function Yt(e,t){const u=e.bMarks[t]+e.tShift[t],r=e.eMarks[t];return e.src.slice(u,r)}function Cr(e){const t=[],u=e.length;let r=0,n=e.charCodeAt(r),i=!1,o=0,a="";for(;r<u;)n===124&&(i?(a+=e.substring(o,r-1),o=r):(t.push(a+e.substring(o,r)),a="",o=r+1)),i=n===92,r++,n=e.charCodeAt(r);return t.push(a+e.substring(o)),t}function Da(e,t,u,r){if(t+2>u)return!1;let n=t+1;if(e.sCount[n]<e.blkIndent||e.sCount[n]-e.blkIndent>=4)return!1;let i=e.bMarks[n]+e.tShift[n];if(i>=e.eMarks[n])return!1;const o=e.src.charCodeAt(i++);if(o!==124&&o!==45&&o!==58||i>=e.eMarks[n])return!1;const a=e.src.charCodeAt(i++);if(a!==124&&a!==45&&a!==58&&!P(a)||o===45&&P(a))return!1;for(;i<e.eMarks[n];){const g=e.src.charCodeAt(i);if(g!==124&&g!==45&&g!==58&&!P(g))return!1;i++}let s=Yt(e,t+1),c=s.split("|");const l=[];for(let g=0;g<c.length;g++){const b=c[g].trim();if(!b){if(g===0||g===c.length-1)continue;return!1}if(!/^:?-+:?$/.test(b))return!1;b.charCodeAt(b.length-1)===58?l.push(b.charCodeAt(0)===58?"center":"right"):b.charCodeAt(0)===58?l.push("left"):l.push("")}if(s=Yt(e,t).trim(),s.indexOf("|")===-1||e.sCount[t]-e.blkIndent>=4)return!1;c=Cr(s),c.length&&c[0]===""&&c.shift(),c.length&&c[c.length-1]===""&&c.pop();const d=c.length;if(d===0||d!==l.length)return!1;if(r)return!0;const h=e.parentType;e.parentType="table";const f=e.md.block.ruler.getRules("blockquote"),p=e.push("table_open","table",1),w=[t,0];p.map=w;const _=e.push("thead_open","thead",1);_.map=[t,t+1];const E=e.push("tr_open","tr",1);E.map=[t,t+1];for(let g=0;g<c.length;g++){const b=e.push("th_open","th",1);l[g]&&(b.attrs=[["style","text-align:"+l[g]]]);const y=e.push("inline","",0);y.content=c[g].trim(),y.children=[],e.push("th_close","th",-1)}e.push("tr_close","tr",-1),e.push("thead_close","thead",-1);let m,x=0;for(n=t+2;n<u&&!(e.sCount[n]<e.blkIndent);n++){let g=!1;for(let y=0,T=f.length;y<T;y++)if(f[y](e,n,u,!0)){g=!0;break}if(g||(s=Yt(e,n).trim(),!s)||e.sCount[n]-e.blkIndent>=4||(c=Cr(s),c.length&&c[0]===""&&c.shift(),c.length&&c[c.length-1]===""&&c.pop(),x+=d-c.length,x>Sa))break;if(n===t+2){const y=e.push("tbody_open","tbody",1);y.map=m=[t+2,0]}const b=e.push("tr_open","tr",1);b.map=[n,n+1];for(let y=0;y<d;y++){const T=e.push("td_open","td",1);l[y]&&(T.attrs=[["style","text-align:"+l[y]]]);const D=e.push("inline","",0);D.content=c[y]?c[y].trim():"",D.children=[],e.push("td_close","td",-1)}e.push("tr_close","tr",-1)}return m&&(e.push("tbody_close","tbody",-1),m[1]=n),e.push("table_close","table",-1),w[1]=n,e.parentType=h,e.line=n,!0}function Ta(e,t,u){if(e.sCount[t]-e.blkIndent<4)return!1;let r=t+1,n=r;for(;r<u;){if(e.isEmpty(r)){r++;continue}if(e.sCount[r]-e.blkIndent>=4){r++,n=r;continue}break}e.line=n;const i=e.push("code_block","code",0);return i.content=e.getLines(t,n,4+e.blkIndent,!1)+`
`,i.map=[t,e.line],!0}function Pa(e,t,u,r){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t];if(e.sCount[t]-e.blkIndent>=4||n+3>i)return!1;const o=e.src.charCodeAt(n);if(o!==126&&o!==96)return!1;let a=n;n=e.skipChars(n,o);let s=n-a;if(s<3)return!1;const c=e.src.slice(a,n),l=e.src.slice(n,i);if(o===96&&l.indexOf(String.fromCharCode(o))>=0)return!1;if(r)return!0;let d=t,h=!1;for(;d++,!(d>=u||(n=a=e.bMarks[d]+e.tShift[d],i=e.eMarks[d],n<i&&e.sCount[d]<e.blkIndent));)if(e.src.charCodeAt(n)===o&&!(e.sCount[d]-e.blkIndent>=4)&&(n=e.skipChars(n,o),!(n-a<s)&&(n=e.skipSpaces(n),!(n<i)))){h=!0;break}s=e.sCount[t],e.line=d+(h?1:0);const f=e.push("fence","code",0);return f.info=l,f.content=e.getLines(t+1,d,s,!0),f.markup=c,f.map=[t,e.line],!0}function Fa(e,t,u,r){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t];const o=e.lineMax;if(e.sCount[t]-e.blkIndent>=4||e.src.charCodeAt(n)!==62)return!1;if(r)return!0;const a=[],s=[],c=[],l=[],d=e.md.block.ruler.getRules("blockquote"),h=e.parentType;e.parentType="blockquote";let f=!1,p;for(p=t;p<u;p++){const x=e.sCount[p]<e.blkIndent;if(n=e.bMarks[p]+e.tShift[p],i=e.eMarks[p],n>=i)break;if(e.src.charCodeAt(n++)===62&&!x){let b=e.sCount[p]+1,y,T;e.src.charCodeAt(n)===32?(n++,b++,T=!1,y=!0):e.src.charCodeAt(n)===9?(y=!0,(e.bsCount[p]+b)%4===3?(n++,b++,T=!1):T=!0):y=!1;let D=b;for(a.push(e.bMarks[p]),e.bMarks[p]=n;n<i;){const G=e.src.charCodeAt(n);if(P(G))G===9?D+=4-(D+e.bsCount[p]+(T?1:0))%4:D++;else break;n++}f=n>=i,s.push(e.bsCount[p]),e.bsCount[p]=e.sCount[p]+1+(y?1:0),c.push(e.sCount[p]),e.sCount[p]=D-b,l.push(e.tShift[p]),e.tShift[p]=n-e.bMarks[p];continue}if(f)break;let g=!1;for(let b=0,y=d.length;b<y;b++)if(d[b](e,p,u,!0)){g=!0;break}if(g){e.lineMax=p,e.blkIndent!==0&&(a.push(e.bMarks[p]),s.push(e.bsCount[p]),l.push(e.tShift[p]),c.push(e.sCount[p]),e.sCount[p]-=e.blkIndent);break}a.push(e.bMarks[p]),s.push(e.bsCount[p]),l.push(e.tShift[p]),c.push(e.sCount[p]),e.sCount[p]=-1}const w=e.blkIndent;e.blkIndent=0;const _=e.push("blockquote_open","blockquote",1);_.markup=">";const E=[t,0];_.map=E,e.md.block.tokenize(e,t,p);const m=e.push("blockquote_close","blockquote",-1);m.markup=">",e.lineMax=o,e.parentType=h,E[1]=e.line;for(let x=0;x<l.length;x++)e.bMarks[x+t]=a[x],e.tShift[x+t]=l[x],e.sCount[x+t]=c[x],e.bsCount[x+t]=s[x];return e.blkIndent=w,!0}function $a(e,t,u,r){const n=e.eMarks[t];if(e.sCount[t]-e.blkIndent>=4)return!1;let i=e.bMarks[t]+e.tShift[t];const o=e.src.charCodeAt(i++);if(o!==42&&o!==45&&o!==95)return!1;let a=1;for(;i<n;){const c=e.src.charCodeAt(i++);if(c!==o&&!P(c))return!1;c===o&&a++}if(a<3)return!1;if(r)return!0;e.line=t+1;const s=e.push("hr","hr",0);return s.map=[t,e.line],s.markup=Array(a+1).join(String.fromCharCode(o)),!0}function vr(e,t){const u=e.eMarks[t];let r=e.bMarks[t]+e.tShift[t];const n=e.src.charCodeAt(r++);if(n!==42&&n!==45&&n!==43)return-1;if(r<u){const i=e.src.charCodeAt(r);if(!P(i))return-1}return r}function Ar(e,t){const u=e.bMarks[t]+e.tShift[t],r=e.eMarks[t];let n=u;if(n+1>=r)return-1;let i=e.src.charCodeAt(n++);if(i<48||i>57)return-1;for(;;){if(n>=r)return-1;if(i=e.src.charCodeAt(n++),i>=48&&i<=57){if(n-u>=10)return-1;continue}if(i===41||i===46)break;return-1}return n<r&&(i=e.src.charCodeAt(n),!P(i))?-1:n}function Ia(e,t){const u=e.level+2;for(let r=t+2,n=e.tokens.length-2;r<n;r++)e.tokens[r].level===u&&e.tokens[r].type==="paragraph_open"&&(e.tokens[r+2].hidden=!0,e.tokens[r].hidden=!0,r+=2)}function Ma(e,t,u,r){let n,i,o,a,s=t,c=!0;if(e.sCount[s]-e.blkIndent>=4||e.listIndent>=0&&e.sCount[s]-e.listIndent>=4&&e.sCount[s]<e.blkIndent)return!1;let l=!1;r&&e.parentType==="paragraph"&&e.sCount[s]>=e.blkIndent&&(l=!0);let d,h,f;if((f=Ar(e,s))>=0){if(d=!0,o=e.bMarks[s]+e.tShift[s],h=Number(e.src.slice(o,f-1)),l&&h!==1)return!1}else if((f=vr(e,s))>=0)d=!1;else return!1;if(l&&e.skipSpaces(f)>=e.eMarks[s])return!1;if(r)return!0;const p=e.src.charCodeAt(f-1),w=e.tokens.length;d?(a=e.push("ordered_list_open","ol",1),h!==1&&(a.attrs=[["start",h]])):a=e.push("bullet_list_open","ul",1);const _=[s,0];a.map=_,a.markup=String.fromCharCode(p);let E=!1;const m=e.md.block.ruler.getRules("list"),x=e.parentType;for(e.parentType="list";s<u;){i=f,n=e.eMarks[s];const g=e.sCount[s]+f-(e.bMarks[s]+e.tShift[s]);let b=g;for(;i<n;){const Pe=e.src.charCodeAt(i);if(Pe===9)b+=4-(b+e.bsCount[s])%4;else if(Pe===32)b++;else break;i++}const y=i;let T;y>=n?T=1:T=b-g,T>4&&(T=1);const D=g+T;a=e.push("list_item_open","li",1),a.markup=String.fromCharCode(p);const G=[s,0];a.map=G,d&&(a.info=e.src.slice(o,f-1));const et=e.tight,wu=e.tShift[s],xl=e.sCount[s],yl=e.listIndent;if(e.listIndent=e.blkIndent,e.blkIndent=D,e.tight=!0,e.tShift[s]=y-e.bMarks[s],e.sCount[s]=b,y>=n&&e.isEmpty(s+1)?e.line=Math.min(e.line+2,u):e.md.block.tokenize(e,s,u,!0),(!e.tight||E)&&(c=!1),E=e.line-s>1&&e.isEmpty(e.line-1),e.blkIndent=e.listIndent,e.listIndent=yl,e.tShift[s]=wu,e.sCount[s]=xl,e.tight=et,a=e.push("list_item_close","li",-1),a.markup=String.fromCharCode(p),s=e.line,G[1]=s,s>=u||e.sCount[s]<e.blkIndent||e.sCount[s]-e.blkIndent>=4)break;let Vn=!1;for(let Pe=0,_l=m.length;Pe<_l;Pe++)if(m[Pe](e,s,u,!0)){Vn=!0;break}if(Vn)break;if(d){if(f=Ar(e,s),f<0)break;o=e.bMarks[s]+e.tShift[s]}else if(f=vr(e,s),f<0)break;if(p!==e.src.charCodeAt(f-1))break}return d?a=e.push("ordered_list_close","ol",-1):a=e.push("bullet_list_close","ul",-1),a.markup=String.fromCharCode(p),_[1]=s,e.line=s,e.parentType=x,c&&Ia(e,w),!0}function Ra(e,t,u,r){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t],o=t+1;if(e.sCount[t]-e.blkIndent>=4||e.src.charCodeAt(n)!==91)return!1;function a(m){const x=e.lineMax;if(m>=x||e.isEmpty(m))return null;let g=!1;if(e.sCount[m]-e.blkIndent>3&&(g=!0),e.sCount[m]<0&&(g=!0),!g){const T=e.md.block.ruler.getRules("reference"),D=e.parentType;e.parentType="reference";let G=!1;for(let et=0,wu=T.length;et<wu;et++)if(T[et](e,m,x,!0)){G=!0;break}if(e.parentType=D,G)return null}const b=e.bMarks[m]+e.tShift[m],y=e.eMarks[m];return e.src.slice(b,y+1)}let s=e.src.slice(n,i+1);i=s.length;let c=-1;for(n=1;n<i;n++){const m=s.charCodeAt(n);if(m===91)return!1;if(m===93){c=n;break}else if(m===10){const x=a(o);x!==null&&(s+=x,i=s.length,o++)}else if(m===92&&(n++,n<i&&s.charCodeAt(n)===10)){const x=a(o);x!==null&&(s+=x,i=s.length,o++)}}if(c<0||s.charCodeAt(c+1)!==58)return!1;for(n=c+2;n<i;n++){const m=s.charCodeAt(n);if(m===10){const x=a(o);x!==null&&(s+=x,i=s.length,o++)}else if(!P(m))break}const l=e.md.helpers.parseLinkDestination(s,n,i);if(!l.ok)return!1;const d=e.md.normalizeLink(l.str);if(!e.md.validateLink(d))return!1;n=l.pos;const h=n,f=o,p=n;for(;n<i;n++){const m=s.charCodeAt(n);if(m===10){const x=a(o);x!==null&&(s+=x,i=s.length,o++)}else if(!P(m))break}let w=e.md.helpers.parseLinkTitle(s,n,i);for(;w.can_continue;){const m=a(o);if(m===null)break;s+=m,n=i,i=s.length,o++,w=e.md.helpers.parseLinkTitle(s,n,i,w)}let _;for(n<i&&p!==n&&w.ok?(_=w.str,n=w.pos):(_="",n=h,o=f);n<i;){const m=s.charCodeAt(n);if(!P(m))break;n++}if(n<i&&s.charCodeAt(n)!==10&&_)for(_="",n=h,o=f;n<i;){const m=s.charCodeAt(n);if(!P(m))break;n++}if(n<i&&s.charCodeAt(n)!==10)return!1;const E=lt(s.slice(1,c));return E?(r||(typeof e.env.references>"u"&&(e.env.references={}),typeof e.env.references[E]>"u"&&(e.env.references[E]={title:_,href:d}),e.line=o),!0):!1}const Na=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"],za="[a-zA-Z_:][a-zA-Z0-9:._-]*",Oa="(?:"+"[^\"'=<>`\\x00-\\x20]+"+"|"+"'[^']*'"+"|"+'"[^"]*"'+")",kr="<[A-Za-z][A-Za-z0-9\\-]*"+("(?:\\s+"+za+"(?:\\s*=\\s*"+Oa+")?)")+"*\\s*\\/?>",Er="<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>",La="<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->",Ba="<[?][\\s\\S]*?[?]>",Ua="<![A-Za-z][^>]*>",qa="<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",Ha=new RegExp("^(?:"+kr+"|"+Er+"|"+La+"|"+Ba+"|"+Ua+"|"+qa+")"),ja=new RegExp("^(?:"+kr+"|"+Er+")"),ge=[[/^<(script|pre|style|textarea)(?=(\s|>|$))/i,/<\/(script|pre|style|textarea)>/i,!0],[/^<!--/,/-->/,!0],[/^<\?/,/\?>/,!0],[/^<![A-Z]/,/>/,!0],[/^<!\[CDATA\[/,/\]\]>/,!0],[new RegExp("^</?("+Na.join("|")+")(?=(\\s|/?>|$))","i"),/^$/,!0],[new RegExp(ja.source+"\\s*$"),/^$/,!1]];function Wa(e,t,u,r){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t];if(e.sCount[t]-e.blkIndent>=4||!e.md.options.html||e.src.charCodeAt(n)!==60)return!1;let o=e.src.slice(n,i),a=0;for(;a<ge.length&&!ge[a][0].test(o);a++);if(a===ge.length)return!1;if(r)return ge[a][2];let s=t+1;const c=ge[a][1].test("");if(!ge[a][1].test(o)){for(;s<u&&!(e.sCount[s]<e.blkIndent&&(c||!e.isEmpty(s)));s++)if(n=e.bMarks[s]+e.tShift[s],i=e.eMarks[s],o=e.src.slice(n,i),ge[a][1].test(o)){o.length!==0&&s++;break}}e.line=s;const l=e.push("html_block","",0);return l.map=[t,s],l.content=e.getLines(t,s,e.blkIndent,!0),!0}function Ga(e,t,u,r){let n=e.bMarks[t]+e.tShift[t],i=e.eMarks[t];if(e.sCount[t]-e.blkIndent>=4)return!1;let o=e.src.charCodeAt(n);if(o!==35||n>=i)return!1;let a=1;for(o=e.src.charCodeAt(++n);o===35&&n<i&&a<=6;)a++,o=e.src.charCodeAt(++n);if(a>6||n<i&&!P(o))return!1;if(r)return!0;i=e.skipSpacesBack(i,n);const s=e.skipCharsBack(i,35,n);s>n&&P(e.src.charCodeAt(s-1))&&(i=s),e.line=t+1;const c=e.push("heading_open","h"+String(a),1);c.markup="########".slice(0,a),c.map=[t,e.line];const l=e.push("inline","",0);l.content=dt(e.src.slice(n,i)),l.map=[t,e.line],l.children=[];const d=e.push("heading_close","h"+String(a),-1);return d.markup="########".slice(0,a),!0}function Va(e,t,u){const r=e.md.block.ruler.getRules("paragraph");if(e.sCount[t]-e.blkIndent>=4)return!1;const n=e.parentType;e.parentType="paragraph";let i=0,o,a=t+1;for(;a<u&&!e.isEmpty(a);a++){if(e.sCount[a]-e.blkIndent>3)continue;if(e.sCount[a]>=e.blkIndent){let f=e.bMarks[a]+e.tShift[a];const p=e.eMarks[a];if(f<p&&(o=e.src.charCodeAt(f),(o===45||o===61)&&(f=e.skipChars(f,o),f=e.skipSpaces(f),f>=p))){i=o===61?1:2;break}}if(e.sCount[a]<0)continue;let h=!1;for(let f=0,p=r.length;f<p;f++)if(r[f](e,a,u,!0)){h=!0;break}if(h)break}if(!i)return e.parentType=n,!1;const s=dt(e.getLines(t,a,e.blkIndent,!1));e.line=a+1;const c=e.push("heading_open","h"+String(i),1);c.markup=String.fromCharCode(o),c.map=[t,e.line];const l=e.push("inline","",0);l.content=s,l.map=[t,e.line-1],l.children=[];const d=e.push("heading_close","h"+String(i),-1);return d.markup=String.fromCharCode(o),e.parentType=n,!0}function Za(e,t,u){const r=e.md.block.ruler.getRules("paragraph"),n=e.parentType;let i=t+1;for(e.parentType="paragraph";i<u&&!e.isEmpty(i);i++){if(e.sCount[i]-e.blkIndent>3||e.sCount[i]<0)continue;let c=!1;for(let l=0,d=r.length;l<d;l++)if(r[l](e,i,u,!0)){c=!0;break}if(c)break}const o=dt(e.getLines(t,i,e.blkIndent,!1));e.line=i;const a=e.push("paragraph_open","p",1);a.map=[t,e.line];const s=e.push("inline","",0);return s.content=o,s.map=[t,e.line],s.children=[],e.push("paragraph_close","p",-1),e.parentType=n,!0}const ft=[["table",Da,["paragraph","reference"]],["code",Ta],["fence",Pa,["paragraph","reference","blockquote","list"]],["blockquote",Fa,["paragraph","reference","blockquote","list"]],["hr",$a,["paragraph","reference","blockquote","list"]],["list",Ma,["paragraph","reference","blockquote"]],["reference",Ra],["html_block",Wa,["paragraph","reference","blockquote"]],["heading",Ga,["paragraph","reference","blockquote"]],["lheading",Va],["paragraph",Za]];function ht(){this.ruler=new O;for(let e=0;e<ft.length;e++)this.ruler.push(ft[e][0],ft[e][1],{alt:(ft[e][2]||[]).slice()})}ht.prototype.tokenize=function(e,t,u){const r=this.ruler.getRules(""),n=r.length,i=e.md.options.maxNesting;let o=t,a=!1;for(;o<u&&(e.line=o=e.skipEmptyLines(o),!(o>=u||e.sCount[o]<e.blkIndent));){if(e.level>=i){e.line=u;break}const s=e.line;let c=!1;for(let l=0;l<n;l++)if(c=r[l](e,o,u,!1),c){if(s>=e.line)throw new Error("block rule didn't increment state.line");break}if(!c)throw new Error("none of the block rules matched");e.tight=!a,e.isEmpty(e.line-1)&&(a=!0),o=e.line,o<u&&e.isEmpty(o)&&(a=!0,o++,e.line=o)}},ht.prototype.parse=function(e,t,u,r){if(!e)return;const n=new this.State(e,t,u,r);this.tokenize(n,n.line,n.lineMax)},ht.prototype.State=Y;function Ve(e,t,u,r){this.src=e,this.env=u,this.md=t,this.tokens=r,this.tokens_meta=Array(r.length),this.pos=0,this.posMax=this.src.length,this.level=0,this.pending="",this.pendingLevel=0,this.cache={},this.delimiters=[],this._prev_delimiters=[],this.backticks={},this.backticksScanned=!1,this.linkLevel=0}Ve.prototype.pushPending=function(){const e=new j("text","",0);return e.content=this.pending,e.level=this.pendingLevel,this.tokens.push(e),this.pending="",e},Ve.prototype.push=function(e,t,u){this.pending&&this.pushPending();const r=new j(e,t,u);let n=null;return u<0&&(this.level--,this.delimiters=this._prev_delimiters.pop()),r.level=this.level,u>0&&(this.level++,this._prev_delimiters.push(this.delimiters),this.delimiters=[],n={delimiters:this.delimiters}),this.pendingLevel=this.level,this.tokens.push(r),this.tokens_meta.push(n),r},Ve.prototype.scanDelims=function(e,t){const u=this.posMax,r=this.src.charCodeAt(e);let n;if(e===0)n=32;else if(e===1)n=this.src.charCodeAt(0),(n&63488)===55296&&(n=65533);else if(n=this.src.charCodeAt(e-1),(n&64512)===56320){const _=this.src.charCodeAt(e-2);n=(_&64512)===55296?65536+(_-55296<<10)+(n-56320):65533}else(n&64512)===55296&&(n=65533);let i=e;for(;i<u&&this.src.charCodeAt(i)===r;)i++;const o=i-e;let a=i<u?this.src.charCodeAt(i):32;if((a&64512)===55296){const _=this.src.charCodeAt(i+1);a=(_&64512)===56320?65536+(a-55296<<10)+(_-56320):65533}else(a&64512)===56320&&(a=65533);const s=Ge(n)||We(n),c=Ge(a)||We(a),l=je(n),d=je(a),h=!d&&(!c||l||s),f=!l&&(!s||d||c);return{can_open:h&&(t||!f||s),can_close:f&&(t||!h||c),length:o}},Ve.prototype.Token=j;function Ya(e){switch(e){case 10:case 33:case 35:case 36:case 37:case 38:case 42:case 43:case 45:case 58:case 60:case 61:case 62:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 125:case 126:return!0;default:return!1}}function Qa(e,t){let u=e.pos;for(;u<e.posMax&&!Ya(e.src.charCodeAt(u));)u++;return u===e.pos?!1:(t||(e.pending+=e.src.slice(e.pos,u)),e.pos=u,!0)}const Ja=/(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;function Xa(e,t){if(!e.md.options.linkify||e.linkLevel>0)return!1;const u=e.pos,r=e.posMax;if(u+3>r||e.src.charCodeAt(u)!==58||e.src.charCodeAt(u+1)!==47||e.src.charCodeAt(u+2)!==47)return!1;const n=e.pending.match(Ja);if(!n)return!1;const i=n[1],o=e.md.linkify.matchAtStart(e.src.slice(u-i.length));if(!o)return!1;let a=o.url;if(a.length<=i.length)return!1;let s=a.length;for(;s>0&&a.charCodeAt(s-1)===42;)s--;s!==a.length&&(a=a.slice(0,s));const c=e.md.normalizeLink(a);if(!e.md.validateLink(c))return!1;if(!t){e.pending=e.pending.slice(0,-i.length);const l=e.push("link_open","a",1);l.attrs=[["href",c]],l.markup="linkify",l.info="auto";const d=e.push("text","",0);d.content=e.md.normalizeLinkText(a);const h=e.push("link_close","a",-1);h.markup="linkify",h.info="auto"}return e.pos+=a.length-i.length,!0}function Ka(e,t){let u=e.pos;if(e.src.charCodeAt(u)!==10)return!1;const r=e.pending.length-1,n=e.posMax;if(!t)if(r>=0&&e.pending.charCodeAt(r)===32)if(r>=1&&e.pending.charCodeAt(r-1)===32){let i=r-1;for(;i>=1&&e.pending.charCodeAt(i-1)===32;)i--;e.pending=e.pending.slice(0,i),e.push("hardbreak","br",0)}else e.pending=e.pending.slice(0,-1),e.push("softbreak","br",0);else e.push("softbreak","br",0);for(u++;u<n&&P(e.src.charCodeAt(u));)u++;return e.pos=u,!0}const Qt=[];for(let e=0;e<256;e++)Qt.push(0);"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(e){Qt[e.charCodeAt(0)]=1});function es(e,t){let u=e.pos;const r=e.posMax;if(e.src.charCodeAt(u)!==92||(u++,u>=r))return!1;let n=e.src.charCodeAt(u);if(n===10){for(t||e.push("hardbreak","br",0),u++;u<r&&(n=e.src.charCodeAt(u),!!P(n));)u++;return e.pos=u,!0}let i=e.src[u];if(n>=55296&&n<=56319&&u+1<r){const a=e.src.charCodeAt(u+1);a>=56320&&a<=57343&&(i+=e.src[u+1],u++)}const o="\\"+i;if(!t){const a=e.push("text_special","",0);n<256&&Qt[n]!==0?a.content=i:a.content=o,a.markup=o,a.info="escape"}return e.pos=u+1,!0}function ts(e,t){let u=e.pos;if(e.src.charCodeAt(u)!==96)return!1;const n=u;u++;const i=e.posMax;for(;u<i&&e.src.charCodeAt(u)===96;)u++;const o=e.src.slice(n,u),a=o.length;if(e.backticksScanned&&(e.backticks[a]||0)<=n)return t||(e.pending+=o),e.pos+=a,!0;let s=u,c;for(;(c=e.src.indexOf("`",s))!==-1;){for(s=c+1;s<i&&e.src.charCodeAt(s)===96;)s++;const l=s-c;if(l===a){if(!t){const d=e.push("code_inline","code",0);d.markup=o,d.content=e.src.slice(u,c).replace(/\n/g," ").replace(/^ (.+) $/,"$1")}return e.pos=s,!0}e.backticks[l]=c}return e.backticksScanned=!0,t||(e.pending+=o),e.pos+=a,!0}function us(e,t){const u=e.pos,r=e.src.charCodeAt(u);if(t||r!==126)return!1;const n=e.scanDelims(e.pos,!0);let i=n.length;const o=String.fromCharCode(r);if(i<2)return!1;let a;i%2&&(a=e.push("text","",0),a.content=o,i--);for(let s=0;s<i;s+=2)a=e.push("text","",0),a.content=o+o,e.delimiters.push({marker:r,length:0,token:e.tokens.length-1,end:-1,open:n.can_open,close:n.can_close});return e.pos+=n.length,!0}function Sr(e,t){let u;const r=[],n=t.length;for(let i=0;i<n;i++){const o=t[i];if(o.marker!==126||o.end===-1)continue;const a=t[o.end];u=e.tokens[o.token],u.type="s_open",u.tag="s",u.nesting=1,u.markup="~~",u.content="",u=e.tokens[a.token],u.type="s_close",u.tag="s",u.nesting=-1,u.markup="~~",u.content="",e.tokens[a.token-1].type==="text"&&e.tokens[a.token-1].content==="~"&&r.push(a.token-1)}for(;r.length;){const i=r.pop();let o=i+1;for(;o<e.tokens.length&&e.tokens[o].type==="s_close";)o++;o--,i!==o&&(u=e.tokens[o],e.tokens[o]=e.tokens[i],e.tokens[i]=u)}}function rs(e){const t=e.tokens_meta,u=e.tokens_meta.length;Sr(e,e.delimiters);for(let r=0;r<u;r++)t[r]&&t[r].delimiters&&Sr(e,t[r].delimiters)}const Dr={tokenize:us,postProcess:rs};function ns(e,t){const u=e.pos,r=e.src.charCodeAt(u);if(t||r!==95&&r!==42)return!1;const n=e.scanDelims(e.pos,r===42);for(let i=0;i<n.length;i++){const o=e.push("text","",0);o.content=String.fromCharCode(r),e.delimiters.push({marker:r,length:n.length,token:e.tokens.length-1,end:-1,open:n.can_open,close:n.can_close})}return e.pos+=n.length,!0}function Tr(e,t){const u=t.length;for(let r=u-1;r>=0;r--){const n=t[r];if(n.marker!==95&&n.marker!==42||n.end===-1)continue;const i=t[n.end],o=r>0&&t[r-1].end===n.end+1&&t[r-1].marker===n.marker&&t[r-1].token===n.token-1&&t[n.end+1].token===i.token+1,a=String.fromCharCode(n.marker),s=e.tokens[n.token];s.type=o?"strong_open":"em_open",s.tag=o?"strong":"em",s.nesting=1,s.markup=o?a+a:a,s.content="";const c=e.tokens[i.token];c.type=o?"strong_close":"em_close",c.tag=o?"strong":"em",c.nesting=-1,c.markup=o?a+a:a,c.content="",o&&(e.tokens[t[r-1].token].content="",e.tokens[t[n.end+1].token].content="",r--)}}function is(e){const t=e.tokens_meta,u=e.tokens_meta.length;Tr(e,e.delimiters);for(let r=0;r<u;r++)t[r]&&t[r].delimiters&&Tr(e,t[r].delimiters)}const Pr={tokenize:ns,postProcess:is};function os(e,t){let u,r,n,i,o="",a="",s=e.pos,c=!0;if(e.src.charCodeAt(e.pos)!==91)return!1;const l=e.pos,d=e.posMax,h=e.pos+1,f=e.md.helpers.parseLinkLabel(e,e.pos,!0);if(f<0)return!1;let p=f+1;if(p<d&&e.src.charCodeAt(p)===40){for(c=!1,p++;p<d&&(u=e.src.charCodeAt(p),!(!P(u)&&u!==10));p++);if(p>=d)return!1;if(s=p,n=e.md.helpers.parseLinkDestination(e.src,p,e.posMax),n.ok){for(o=e.md.normalizeLink(n.str),e.md.validateLink(o)?p=n.pos:o="",s=p;p<d&&(u=e.src.charCodeAt(p),!(!P(u)&&u!==10));p++);if(n=e.md.helpers.parseLinkTitle(e.src,p,e.posMax),p<d&&s!==p&&n.ok)for(a=n.str,p=n.pos;p<d&&(u=e.src.charCodeAt(p),!(!P(u)&&u!==10));p++);}(p>=d||e.src.charCodeAt(p)!==41)&&(c=!0),p++}if(c){if(typeof e.env.references>"u")return!1;if(p<d&&e.src.charCodeAt(p)===91?(s=p+1,p=e.md.helpers.parseLinkLabel(e,p),p>=0?r=e.src.slice(s,p++):p=f+1):p=f+1,r||(r=e.src.slice(h,f)),i=e.env.references[lt(r)],!i)return e.pos=l,!1;o=i.href,a=i.title}if(!t){e.pos=h,e.posMax=f;const w=e.push("link_open","a",1),_=[["href",o]];w.attrs=_,a&&_.push(["title",a]),e.linkLevel++,e.md.inline.tokenize(e),e.linkLevel--,e.push("link_close","a",-1)}return e.pos=p,e.posMax=d,!0}function as(e,t){let u,r,n,i,o,a,s,c,l="";const d=e.pos,h=e.posMax;if(e.src.charCodeAt(e.pos)!==33||e.src.charCodeAt(e.pos+1)!==91)return!1;const f=e.pos+2,p=e.md.helpers.parseLinkLabel(e,e.pos+1,!1);if(p<0)return!1;if(i=p+1,i<h&&e.src.charCodeAt(i)===40){for(i++;i<h&&(u=e.src.charCodeAt(i),!(!P(u)&&u!==10));i++);if(i>=h)return!1;for(c=i,a=e.md.helpers.parseLinkDestination(e.src,i,e.posMax),a.ok&&(l=e.md.normalizeLink(a.str),e.md.validateLink(l)?i=a.pos:l=""),c=i;i<h&&(u=e.src.charCodeAt(i),!(!P(u)&&u!==10));i++);if(a=e.md.helpers.parseLinkTitle(e.src,i,e.posMax),i<h&&c!==i&&a.ok)for(s=a.str,i=a.pos;i<h&&(u=e.src.charCodeAt(i),!(!P(u)&&u!==10));i++);else s="";if(i>=h||e.src.charCodeAt(i)!==41)return e.pos=d,!1;i++}else{if(typeof e.env.references>"u")return!1;if(i<h&&e.src.charCodeAt(i)===91?(c=i+1,i=e.md.helpers.parseLinkLabel(e,i),i>=0?n=e.src.slice(c,i++):i=p+1):i=p+1,n||(n=e.src.slice(f,p)),o=e.env.references[lt(n)],!o)return e.pos=d,!1;l=o.href,s=o.title}if(!t){r=e.src.slice(f,p);const w=[];e.md.inline.parse(r,e.md,e.env,w);const _=e.push("image","img",0),E=[["src",l],["alt",""]];_.attrs=E,_.children=w,_.content=r,s&&E.push(["title",s])}return e.pos=i,e.posMax=h,!0}const ss=/^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/,cs=/^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;function ls(e,t){let u=e.pos;if(e.src.charCodeAt(u)!==60)return!1;const r=e.pos,n=e.posMax;for(;;){if(++u>=n)return!1;const o=e.src.charCodeAt(u);if(o===60)return!1;if(o===62)break}const i=e.src.slice(r+1,u);if(cs.test(i)){const o=e.md.normalizeLink(i);if(!e.md.validateLink(o))return!1;if(!t){const a=e.push("link_open","a",1);a.attrs=[["href",o]],a.markup="autolink",a.info="auto";const s=e.push("text","",0);s.content=e.md.normalizeLinkText(i);const c=e.push("link_close","a",-1);c.markup="autolink",c.info="auto"}return e.pos+=i.length+2,!0}if(ss.test(i)){const o=e.md.normalizeLink("mailto:"+i);if(!e.md.validateLink(o))return!1;if(!t){const a=e.push("link_open","a",1);a.attrs=[["href",o]],a.markup="autolink",a.info="auto";const s=e.push("text","",0);s.content=e.md.normalizeLinkText(i);const c=e.push("link_close","a",-1);c.markup="autolink",c.info="auto"}return e.pos+=i.length+2,!0}return!1}function ds(e){return/^<a[>\s]/i.test(e)}function ps(e){return/^<\/a\s*>/i.test(e)}function fs(e){const t=e|32;return t>=97&&t<=122}function hs(e,t){if(!e.md.options.html)return!1;const u=e.posMax,r=e.pos;if(e.src.charCodeAt(r)!==60||r+2>=u)return!1;const n=e.src.charCodeAt(r+1);if(n!==33&&n!==63&&n!==47&&!fs(n))return!1;const i=e.src.slice(r).match(Ha);if(!i)return!1;if(!t){const o=e.push("html_inline","",0);o.content=i[0],ds(o.content)&&e.linkLevel++,ps(o.content)&&e.linkLevel--}return e.pos+=i[0].length,!0}const gs=/^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i,bs=/^&([a-z][a-z0-9]{1,31});/i;function ms(e,t){const u=e.pos,r=e.posMax;if(e.src.charCodeAt(u)!==38||u+1>=r)return!1;if(e.src.charCodeAt(u+1)===35){const i=e.src.slice(u).match(gs);if(i){if(!t){const o=i[1][0].toLowerCase()==="x"?parseInt(i[1].slice(1),16):parseInt(i[1],10),a=e.push("text_special","",0);a.content=Gt(o)?He(o):He(65533),a.markup=i[0],a.info="entity"}return e.pos+=i[0].length,!0}}else{const i=e.src.slice(u).match(bs);if(i){const o=Uo(i[0]);if(o!==i[0]){if(!t){const a=e.push("text_special","",0);a.content=o,a.markup=i[0],a.info="entity"}return e.pos+=i[0].length,!0}}}return!1}function Fr(e){const t={},u=e.length;if(!u)return;let r=0,n=-2;const i=[];for(let o=0;o<u;o++){const a=e[o];if(i.push(0),(e[r].marker!==a.marker||n!==a.token-1)&&(r=o),n=a.token,a.length=a.length||0,!a.close)continue;t.hasOwnProperty(a.marker)||(t[a.marker]=[-1,-1,-1,-1,-1,-1]);const s=t[a.marker][(a.open?3:0)+a.length%3];let c=r-i[r]-1,l=c;for(;c>s;c-=i[c]+1){const d=e[c];if(d.marker===a.marker&&d.open&&d.end<0){let h=!1;if((d.close||a.open)&&(d.length+a.length)%3===0&&(d.length%3!==0||a.length%3!==0)&&(h=!0),!h){const f=c>0&&!e[c-1].open?i[c-1]+1:0;i[o]=o-c+f,i[c]=f,a.open=!1,d.end=o,d.close=!1,l=-1,n=-2;break}}}l!==-1&&(t[a.marker][(a.open?3:0)+(a.length||0)%3]=l)}}function xs(e){const t=e.tokens_meta,u=e.tokens_meta.length;Fr(e.delimiters);for(let r=0;r<u;r++)t[r]&&t[r].delimiters&&Fr(t[r].delimiters)}function ys(e){let t,u,r=0;const n=e.tokens,i=e.tokens.length;for(t=u=0;t<i;t++)n[t].nesting<0&&r--,n[t].level=r,n[t].nesting>0&&r++,n[t].type==="text"&&t+1<i&&n[t+1].type==="text"?n[t+1].content=n[t].content+n[t+1].content:(t!==u&&(n[u]=n[t]),u++);t!==u&&(n.length=u)}const Jt=[["text",Qa],["linkify",Xa],["newline",Ka],["escape",es],["backticks",ts],["strikethrough",Dr.tokenize],["emphasis",Pr.tokenize],["link",os],["image",as],["autolink",ls],["html_inline",hs],["entity",ms]],Xt=[["balance_pairs",xs],["strikethrough",Dr.postProcess],["emphasis",Pr.postProcess],["fragments_join",ys]];function Ze(){this.ruler=new O;for(let e=0;e<Jt.length;e++)this.ruler.push(Jt[e][0],Jt[e][1]);this.ruler2=new O;for(let e=0;e<Xt.length;e++)this.ruler2.push(Xt[e][0],Xt[e][1])}Ze.prototype.skipToken=function(e){const t=e.pos,u=this.ruler.getRules(""),r=u.length,n=e.md.options.maxNesting,i=e.cache;if(typeof i[t]<"u"){e.pos=i[t];return}let o=!1;if(e.level<n){for(let a=0;a<r;a++)if(e.level++,o=u[a](e,!0),e.level--,o){if(t>=e.pos)throw new Error("inline rule didn't increment state.pos");break}}else e.pos=e.posMax;o||e.pos++,i[t]=e.pos},Ze.prototype.tokenize=function(e){const t=this.ruler.getRules(""),u=t.length,r=e.posMax,n=e.md.options.maxNesting;for(;e.pos<r;){const i=e.pos;let o=!1;if(e.level<n){for(let a=0;a<u;a++)if(o=t[a](e,!1),o){if(i>=e.pos)throw new Error("inline rule didn't increment state.pos");break}}if(o){if(e.pos>=r)break;continue}e.pending+=e.src[e.pos++]}e.pending&&e.pushPending()},Ze.prototype.parse=function(e,t,u,r){const n=new this.State(e,t,u,r);this.tokenize(n);const i=this.ruler2.getRules(""),o=i.length;for(let a=0;a<o;a++)i[a](n)},Ze.prototype.State=Ve;function _s(e){const t={};e=e||{},t.src_Any=sr.source,t.src_Cc=cr.source,t.src_Z=dr.source,t.src_P=qt.source,t.src_ZPCc=[t.src_Z,t.src_P,t.src_Cc].join("|"),t.src_ZCc=[t.src_Z,t.src_Cc].join("|");const u="[><｜]";return t.src_pseudo_letter="(?:(?!"+u+"|"+t.src_ZPCc+")"+t.src_Any+")",t.src_ip4="(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",t.src_auth="(?:(?:(?!"+t.src_ZCc+"|[@/\\[\\]()]).)+@)?",t.src_port="(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?",t.src_host_terminator="(?=$|"+u+"|"+t.src_ZPCc+")(?!"+(e["---"]?"-(?!--)|":"-|")+"_|:\\d|\\.-|\\.(?!$|"+t.src_ZPCc+"))",t.src_path="(?:[/?#](?:(?!"+t.src_ZCc+"|"+u+`|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!`+t.src_ZCc+"|\\]).)*\\]|\\((?:(?!"+t.src_ZCc+"|[)]).)*\\)|\\{(?:(?!"+t.src_ZCc+'|[}]).)*\\}|\\"(?:(?!'+t.src_ZCc+`|["]).)+\\"|\\'(?:(?!`+t.src_ZCc+"|[']).)+\\'|\\'(?="+t.src_pseudo_letter+"|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!"+t.src_ZCc+"|[.]|$)|"+(e["---"]?"\\-(?!--(?:[^-]|$))(?:-*)|":"\\-+|")+",(?!"+t.src_ZCc+"|$)|;(?!"+t.src_ZCc+"|$)|\\!+(?!"+t.src_ZCc+"|[!]|$)|\\?(?!"+t.src_ZCc+"|[?]|$))+|\\/)?",t.src_email_name='[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*',t.src_xn="xn--[a-z0-9\\-]{1,59}",t.src_domain_root="(?:"+t.src_xn+"|"+t.src_pseudo_letter+"{1,63})",t.src_domain="(?:"+t.src_xn+"|(?:"+t.src_pseudo_letter+")|(?:"+t.src_pseudo_letter+"(?:-|"+t.src_pseudo_letter+"){0,61}"+t.src_pseudo_letter+"))",t.src_host="(?:(?:(?:(?:"+t.src_domain+")\\.)*"+t.src_domain+"))",t.tpl_host_fuzzy="(?:"+t.src_ip4+"|(?:(?:(?:"+t.src_domain+")\\.)+(?:%TLDS%)))",t.tpl_host_no_ip_fuzzy="(?:(?:(?:"+t.src_domain+")\\.)+(?:%TLDS%))",t.src_host_strict=t.src_host+t.src_host_terminator,t.tpl_host_fuzzy_strict=t.tpl_host_fuzzy+t.src_host_terminator,t.src_host_port_strict=t.src_host+t.src_port+t.src_host_terminator,t.tpl_host_port_fuzzy_strict=t.tpl_host_fuzzy+t.src_port+t.src_host_terminator,t.tpl_host_port_no_ip_fuzzy_strict=t.tpl_host_no_ip_fuzzy+t.src_port+t.src_host_terminator,t.tpl_host_fuzzy_test="localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:"+t.src_ZPCc+"|>|$))",t.tpl_email_fuzzy="(^|"+u+'|"|\\(|'+t.src_ZCc+")("+t.src_email_name+"@"+t.tpl_host_fuzzy_strict+")",t.tpl_link_fuzzy="(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|"+t.src_ZPCc+"))((?![$+<=>^`|｜])"+t.tpl_host_port_fuzzy_strict+t.src_path+")",t.tpl_link_no_ip_fuzzy="(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|"+t.src_ZPCc+"))((?![$+<=>^`|｜])"+t.tpl_host_port_no_ip_fuzzy_strict+t.src_path+")",t}function Kt(e){return Array.prototype.slice.call(arguments,1).forEach(function(u){u&&Object.keys(u).forEach(function(r){e[r]=u[r]})}),e}function gt(e){return Object.prototype.toString.call(e)}function ws(e){return gt(e)==="[object String]"}function Cs(e){return gt(e)==="[object Object]"}function vs(e){return gt(e)==="[object RegExp]"}function $r(e){return gt(e)==="[object Function]"}function As(e){return e.replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")}const Ir={fuzzyLink:!0,fuzzyEmail:!0,fuzzyIP:!1};function ks(e){return Object.keys(e||{}).reduce(function(t,u){return t||Ir.hasOwnProperty(u)},!1)}const Es={"http:":{validate:function(e,t,u){const r=e.slice(t);return u.re.http||(u.re.http=new RegExp("^\\/\\/"+u.re.src_auth+u.re.src_host_port_strict+u.re.src_path,"i")),u.re.http.test(r)?r.match(u.re.http)[0].length:0}},"https:":"http:","ftp:":"http:","//":{validate:function(e,t,u){const r=e.slice(t);return u.re.no_http||(u.re.no_http=new RegExp("^"+u.re.src_auth+"(?:localhost|(?:(?:"+u.re.src_domain+")\\.)+"+u.re.src_domain_root+")"+u.re.src_port+u.re.src_host_terminator+u.re.src_path,"i")),u.re.no_http.test(r)?t>=3&&e[t-3]===":"||t>=3&&e[t-3]==="/"?0:r.match(u.re.no_http)[0].length:0}},"mailto:":{validate:function(e,t,u){const r=e.slice(t);return u.re.mailto||(u.re.mailto=new RegExp("^"+u.re.src_email_name+"@"+u.re.src_host_strict,"i")),u.re.mailto.test(r)?r.match(u.re.mailto)[0].length:0}}},Ss="a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]",Ds="biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");function Ts(e){return function(t,u){const r=t.slice(u);return e.test(r)?r.match(e)[0].length:0}}function Mr(){return function(e,t){t.normalize(e)}}function bt(e){const t=e.re=_s(e.__opts__),u=e.__tlds__.slice();e.onCompile(),e.__tlds_replaced__||u.push(Ss),u.push(t.src_xn),t.src_tlds=u.join("|");function r(a){return a.replace("%TLDS%",t.src_tlds)}t.email_fuzzy=RegExp(r(t.tpl_email_fuzzy),"i"),t.email_fuzzy_global=RegExp(r(t.tpl_email_fuzzy),"ig"),t.link_fuzzy=RegExp(r(t.tpl_link_fuzzy),"i"),t.link_fuzzy_global=RegExp(r(t.tpl_link_fuzzy),"ig"),t.link_no_ip_fuzzy=RegExp(r(t.tpl_link_no_ip_fuzzy),"i"),t.link_no_ip_fuzzy_global=RegExp(r(t.tpl_link_no_ip_fuzzy),"ig"),t.host_fuzzy_test=RegExp(r(t.tpl_host_fuzzy_test),"i");const n=[];e.__compiled__={};function i(a,s){throw new Error('(LinkifyIt) Invalid schema "'+a+'": '+s)}Object.keys(e.__schemas__).forEach(function(a){const s=e.__schemas__[a];if(s===null)return;const c={validate:null,link:null};if(e.__compiled__[a]=c,Cs(s)){vs(s.validate)?c.validate=Ts(s.validate):$r(s.validate)?c.validate=s.validate:i(a,s),$r(s.normalize)?c.normalize=s.normalize:s.normalize?i(a,s):c.normalize=Mr();return}if(ws(s)){n.push(a);return}i(a,s)}),n.forEach(function(a){e.__compiled__[e.__schemas__[a]]&&(e.__compiled__[a].validate=e.__compiled__[e.__schemas__[a]].validate,e.__compiled__[a].normalize=e.__compiled__[e.__schemas__[a]].normalize)}),e.__compiled__[""]={validate:null,normalize:Mr()};const o=Object.keys(e.__compiled__).filter(function(a){return a.length>0&&e.__compiled__[a]}).map(As).join("|");e.re.schema_test=RegExp("(^|(?!_)(?:[><｜]|"+t.src_ZPCc+"))("+o+")","i"),e.re.schema_search=RegExp("(^|(?!_)(?:[><｜]|"+t.src_ZPCc+"))("+o+")","ig"),e.re.schema_at_start=RegExp("^"+e.re.schema_search.source,"i"),e.re.pretest=RegExp("("+e.re.schema_test.source+")|("+e.re.host_fuzzy_test.source+")|@","i")}function Rr(e,t,u,r){const n=e.slice(u,r);this.schema=t.toLowerCase(),this.index=u,this.lastIndex=r,this.raw=n,this.text=n,this.url=n}function L(e,t){if(!(this instanceof L))return new L(e,t);t||ks(e)&&(t=e,e={}),this.__opts__=Kt({},Ir,t),this.__schemas__=Kt({},Es,e),this.__compiled__={},this.__tlds__=Ds,this.__tlds_replaced__=!1,this.re={},bt(this)}L.prototype.add=function(t,u){return this.__schemas__[t]=u,bt(this),this},L.prototype.set=function(t){return this.__opts__=Kt(this.__opts__,t),this},L.prototype.test=function(t){if(!t.length)return!1;let u,r;if(this.re.schema_test.test(t)){for(r=this.re.schema_search,r.lastIndex=0;(u=r.exec(t))!==null;)if(this.testSchemaAt(t,u[2],r.lastIndex))return!0}return!!(this.__opts__.fuzzyLink&&this.__compiled__["http:"]&&t.search(this.re.host_fuzzy_test)>=0&&t.match(this.__opts__.fuzzyIP?this.re.link_fuzzy:this.re.link_no_ip_fuzzy)!==null||this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"]&&t.indexOf("@")>=0&&t.match(this.re.email_fuzzy)!==null)},L.prototype.pretest=function(t){return this.re.pretest.test(t)},L.prototype.testSchemaAt=function(t,u,r){return this.__compiled__[u.toLowerCase()]?this.__compiled__[u.toLowerCase()].validate(t,r,this):0},L.prototype.match=function(t){const u=[],r=[],n=[],i=[];let o,a,s;function c(h,f){return h?f?h.index!==f.index?h.index<f.index?h:f:h.lastIndex>=f.lastIndex?h:f:h:f}if(!t.length)return null;if(this.re.schema_test.test(t))for(s=this.re.schema_search,s.lastIndex=0;(o=s.exec(t))!==null;)a=this.testSchemaAt(t,o[2],s.lastIndex),a&&r.push({schema:o[2],index:o.index+o[1].length,lastIndex:o.index+o[0].length+a});if(this.__opts__.fuzzyLink&&this.__compiled__["http:"])for(s=this.__opts__.fuzzyIP?this.re.link_fuzzy_global:this.re.link_no_ip_fuzzy_global,s.lastIndex=0;(o=s.exec(t))!==null;)n.push({schema:"",index:o.index+o[1].length,lastIndex:o.index+o[0].length});if(this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"])for(s=this.re.email_fuzzy_global,s.lastIndex=0;(o=s.exec(t))!==null;)i.push({schema:"mailto:",index:o.index+o[1].length,lastIndex:o.index+o[0].length});const l=[0,0,0];let d=0;for(;;){const h=[r[l[0]],i[l[1]],n[l[2]]],f=c(c(h[0],h[1]),h[2]);if(!f)break;if(f===h[0]?l[0]++:f===h[1]?l[1]++:l[2]++,f.index<d)continue;const p=new Rr(t,f.schema,f.index,f.lastIndex);this.__compiled__[p.schema].normalize(p,this),u.push(p),d=f.lastIndex}return u.length?u:null},L.prototype.matchAtStart=function(t){if(!t.length)return null;const u=this.re.schema_at_start.exec(t);if(!u)return null;const r=this.testSchemaAt(t,u[2],u[0].length);if(!r)return null;const n=new Rr(t,u[2],u.index+u[1].length,u.index+u[0].length+r);return this.__compiled__[n.schema].normalize(n,this),n},L.prototype.tlds=function(t,u){return t=Array.isArray(t)?t:[t],u?(this.__tlds__=this.__tlds__.concat(t).sort().filter(function(r,n,i){return r!==i[n-1]}).reverse(),bt(this),this):(this.__tlds__=t.slice(),this.__tlds_replaced__=!0,bt(this),this)},L.prototype.normalize=function(t){t.schema||(t.url="http://"+t.url),t.schema==="mailto:"&&!/^mailto:/i.test(t.url)&&(t.url="mailto:"+t.url)},L.prototype.onCompile=function(){};const Ae=2147483647,Q=36,eu=1,Ye=26,Ps=38,Fs=700,Nr=72,zr=128,Or="-",$s=/^xn--/,Is=/[^\0-\x7F]/,Ms=/[\x2E\u3002\uFF0E\uFF61]/g,Rs={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},tu=Q-eu,J=Math.floor,uu=String.fromCharCode;function oe(e){throw new RangeError(Rs[e])}function Ns(e,t){const u=[];let r=e.length;for(;r--;)u[r]=t(e[r]);return u}function Lr(e,t){const u=e.split("@");let r="";u.length>1&&(r=u[0]+"@",e=u[1]),e=e.replace(Ms,".");const n=e.split("."),i=Ns(n,t).join(".");return r+i}function Br(e){const t=[];let u=0;const r=e.length;for(;u<r;){const n=e.charCodeAt(u++);if(n>=55296&&n<=56319&&u<r){const i=e.charCodeAt(u++);(i&64512)==56320?t.push(((n&1023)<<10)+(i&1023)+65536):(t.push(n),u--)}else t.push(n)}return t}const zs=e=>String.fromCodePoint(...e),Os=function(e){return e>=48&&e<58?26+(e-48):e>=65&&e<91?e-65:e>=97&&e<123?e-97:Q},Ur=function(e,t){return e+22+75*(e<26)-((t!=0)<<5)},qr=function(e,t,u){let r=0;for(e=u?J(e/Fs):e>>1,e+=J(e/t);e>tu*Ye>>1;r+=Q)e=J(e/tu);return J(r+(tu+1)*e/(e+Ps))},Hr=function(e){const t=[],u=e.length;let r=0,n=zr,i=Nr,o=e.lastIndexOf(Or);o<0&&(o=0);for(let a=0;a<o;++a)e.charCodeAt(a)>=128&&oe("not-basic"),t.push(e.charCodeAt(a));for(let a=o>0?o+1:0;a<u;){const s=r;for(let l=1,d=Q;;d+=Q){a>=u&&oe("invalid-input");const h=Os(e.charCodeAt(a++));h>=Q&&oe("invalid-input"),h>J((Ae-r)/l)&&oe("overflow"),r+=h*l;const f=d<=i?eu:d>=i+Ye?Ye:d-i;if(h<f)break;const p=Q-f;l>J(Ae/p)&&oe("overflow"),l*=p}const c=t.length+1;i=qr(r-s,c,s==0),J(r/c)>Ae-n&&oe("overflow"),n+=J(r/c),r%=c,t.splice(r++,0,n)}return String.fromCodePoint(...t)},jr=function(e){const t=[];e=Br(e);const u=e.length;let r=zr,n=0,i=Nr;for(const s of e)s<128&&t.push(uu(s));const o=t.length;let a=o;for(o&&t.push(Or);a<u;){let s=Ae;for(const l of e)l>=r&&l<s&&(s=l);const c=a+1;s-r>J((Ae-n)/c)&&oe("overflow"),n+=(s-r)*c,r=s;for(const l of e)if(l<r&&++n>Ae&&oe("overflow"),l===r){let d=n;for(let h=Q;;h+=Q){const f=h<=i?eu:h>=i+Ye?Ye:h-i;if(d<f)break;const p=d-f,w=Q-f;t.push(uu(Ur(f+p%w,0))),d=J(p/w)}t.push(uu(Ur(d,0))),i=qr(n,c,a===o),n=0,++a}++n,++r}return t.join("")},Wr={version:"2.3.1",ucs2:{decode:Br,encode:zs},decode:Hr,encode:jr,toASCII:function(e){return Lr(e,function(t){return Is.test(t)?"xn--"+jr(t):t})},toUnicode:function(e){return Lr(e,function(t){return $s.test(t)?Hr(t.slice(4).toLowerCase()):t})}},Ls={default:{options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:100},components:{core:{},block:{},inline:{}}},zero:{options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["paragraph"]},inline:{rules:["text"],rules2:["balance_pairs","fragments_join"]}}},commonmark:{options:{html:!0,xhtmlOut:!0,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"“”‘’",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["blockquote","code","fence","heading","hr","html_block","lheading","list","reference","paragraph"]},inline:{rules:["autolink","backticks","emphasis","entity","escape","html_inline","image","link","newline","text"],rules2:["balance_pairs","emphasis","fragments_join"]}}}},Bs=/^(vbscript|javascript|file|data):/,Us=/^data:image\/(gif|png|jpeg|webp);/;function qs(e){const t=e.trim().toLowerCase();return Bs.test(t)?Us.test(t):!0}const Gr=["http:","https:","mailto:"];function Hs(e){const t=Ut(e,!0);if(t.hostname&&(!t.protocol||Gr.indexOf(t.protocol)>=0))try{t.hostname=Wr.toASCII(t.hostname)}catch{}return qe(Bt(t))}function js(e){const t=Ut(e,!0);if(t.hostname&&(!t.protocol||Gr.indexOf(t.protocol)>=0))try{t.hostname=Wr.toUnicode(t.hostname)}catch{}return we(Bt(t),we.defaultChars+"%")}function U(e,t){if(!(this instanceof U))return new U(e,t);t||Wt(e)||(t=e||{},e="default"),this.inline=new Ze,this.block=new ht,this.core=new Zt,this.renderer=new ve,this.linkify=new L,this.validateLink=qs,this.normalizeLink=Hs,this.normalizeLinkText=js,this.utils=ua,this.helpers=ct({},oa),this.options={},this.configure(e),t&&this.set(t)}U.prototype.set=function(e){return ct(this.options,e),this},U.prototype.configure=function(e){const t=this;if(Wt(e)){const u=e;if(e=Ls[u],!e)throw new Error('Wrong `markdown-it` preset "'+u+'", check name')}if(!e)throw new Error("Wrong `markdown-it` preset, can't be empty");return e.options&&t.set(e.options),e.components&&Object.keys(e.components).forEach(function(u){e.components[u].rules&&t[u].ruler.enableOnly(e.components[u].rules),e.components[u].rules2&&t[u].ruler2.enableOnly(e.components[u].rules2)}),this},U.prototype.enable=function(e,t){let u=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(n){u=u.concat(this[n].ruler.enable(e,!0))},this),u=u.concat(this.inline.ruler2.enable(e,!0));const r=e.filter(function(n){return u.indexOf(n)<0});if(r.length&&!t)throw new Error("MarkdownIt. Failed to enable unknown rule(s): "+r);return this},U.prototype.disable=function(e,t){let u=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(n){u=u.concat(this[n].ruler.disable(e,!0))},this),u=u.concat(this.inline.ruler2.disable(e,!0));const r=e.filter(function(n){return u.indexOf(n)<0});if(r.length&&!t)throw new Error("MarkdownIt. Failed to disable unknown rule(s): "+r);return this},U.prototype.use=function(e){const t=[this].concat(Array.prototype.slice.call(arguments,1));return e.apply(e,t),this},U.prototype.parse=function(e,t){if(typeof e!="string")throw new Error("Input data should be a String");const u=new this.core.State(e,this,t);return this.core.process(u),u.tokens},U.prototype.render=function(e,t){return t=t||{},this.renderer.render(this.parse(e,t),this.options,t)},U.prototype.parseInline=function(e,t){const u=new this.core.State(e,this,t);return u.inlineMode=!0,this.core.process(u),u.tokens},U.prototype.renderInline=function(e,t){return t=t||{},this.renderer.render(this.parseInline(e,t),this.options,t)};const mt=new U({breaks:!0,html:!1,linkify:!1,typographer:!1}),Ws=mt.renderer.rules.link_open??((e,t,u,r,n)=>n.renderToken(e,t,u));mt.renderer.rules.link_open=(e,t,u,r,n)=>{const i=e[t],o=i.attrGet("href");return o&&!mt.validateLink(o)&&i.attrSet("href",""),i.attrSet("target","_blank"),i.attrSet("rel","noopener noreferrer"),Ws(e,t,u,r,n)};function ke(e=new Date){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function Vr(e){return mt.render(Gs(e))}function Gs(e){return e.replace(/\r\n?/g,`
`).replace(/([^\n])---(?=#{1,6})/g,`$1

---

`).replace(/(^|\n)---(?=#{1,6})/g,`$1---

`).replace(/([^\n#])(#{1,6})(?=[^\s#])/g,`$1

$2`).replace(/(^|\n)(#{1,6})(?=[^\s#])/g,"$1$2 ").replace(/([:：])-(?=(?:\*\*|【|[\p{L}\p{N}]))/gu,`$1
- `).replace(/([^\n])-(?=\*\*)/g,`$1
- `).replace(/(^|\n)-(?=\S)/g,"$1- ")}const Vs=Fe`
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
`,Zs=Fe`
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
`,Ys=Fe`
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
    color: color-mix(in srgb, var(--rag-text) 88%, var(--rag-gold-strong));
  }

  .markdown-body hr {
    height: 1px;
    margin: 12px 0;
    border: 0;
    background: color-mix(in srgb, var(--rag-line) 76%, transparent);
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
    border: 1px solid color-mix(in srgb, var(--rag-line) 72%, transparent);
    text-align: left;
    vertical-align: top;
  }

  .markdown-body th {
    background: color-mix(in srgb, var(--rag-secondary-soft) 58%, transparent);
    font-weight: 820;
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
    align-items: start;
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
    margin-top: 1px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--rag-gold-soft) 34%, transparent);
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
    color: color-mix(in srgb, var(--rag-muted) 82%, transparent);
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
`,Qs=Fe`
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
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(410px, calc(100vw - 32px));
    height: min(var(--rag-pet-panel-height, 318px), calc(100dvh - 132px));
    padding: 13px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 62%, white);
    border-radius: var(--rag-radius-panel, 20px);
    background:
      radial-gradient(circle at 14% 0%, color-mix(in srgb, var(--rag-gold) 11%, transparent), transparent 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), color-mix(in srgb, var(--rag-panel) 92%, white));
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
    background: color-mix(in srgb, var(--rag-muted) 28%, transparent);
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
    background: color-mix(in srgb, var(--rag-gold) 54%, var(--rag-muted));
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
    color: color-mix(in srgb, var(--rag-muted) 82%, transparent);
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
    border: 1px solid color-mix(in srgb, var(--rag-line) 68%, transparent);
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-muted) 82%, var(--rag-text));
    background: color-mix(in srgb, var(--rag-paper) 82%, transparent);
    cursor: pointer;
  }

  .pet-message-actions button:hover:not(:disabled) {
    color: var(--rag-gold-strong);
    border-color: color-mix(in srgb, var(--rag-gold) 24%, var(--rag-line));
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
    border: 1px solid color-mix(in srgb, var(--rag-line) 68%, transparent);
    border-radius: 14px;
    color: #263244;
    background: color-mix(in srgb, var(--rag-paper) 84%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.54);
    font-size: 12.8px;
    line-height: 1.62;
    overflow-wrap: anywhere;
  }

  .pet-panel-message.user .pet-panel-bubble {
    color: var(--rag-primary-contrast);
    border-color: color-mix(in srgb, var(--rag-gold) 46%, transparent);
    background:
      linear-gradient(145deg, var(--rag-user-message-start), var(--rag-user-message-end));
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.18) inset,
      0 8px 18px color-mix(in srgb, var(--rag-gold) 12%, transparent);
  }

  .pet-panel-bubble.error {
    color: #9f1d1d;
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 247, 247, 0.94);
  }

  .pet-panel-bubble.streaming {
    border-color: color-mix(in srgb, var(--rag-gold) 30%, var(--rag-line));
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
    border: 1px solid color-mix(in srgb, var(--rag-line) 72%, transparent);
    border-radius: 999px;
    color: var(--rag-gold-strong);
    background: color-mix(in srgb, var(--rag-gold-faint) 68%, white);
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
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 20%, transparent),
      0 8px 18px color-mix(in srgb, var(--rag-gold) 12%, transparent);
    font-size: 12px;
    font-weight: 840;
  }

  .pet-panel-avatar.has-image {
    background: color-mix(in srgb, var(--rag-paper) 88%, white);
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
    color: color-mix(in srgb, var(--rag-muted) 82%, var(--rag-text));
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
    border-left: 1px solid color-mix(in srgb, var(--rag-line) 76%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--rag-line) 76%, transparent);
    background: color-mix(in srgb, var(--rag-paper) 96%, white);
    transform: translateY(3px) rotate(45deg);
  }

  .pet-panel-action[data-tooltip]::after {
    content: attr(data-tooltip);
    top: calc(100% + 7px);
    min-width: max-content;
    max-width: 160px;
    padding: 6px 8px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 76%, transparent);
    border-radius: 9px;
    color: var(--rag-text);
    background: color-mix(in srgb, var(--rag-paper) 96%, white);
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
    border-color: color-mix(in srgb, var(--rag-gold) 42%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 92%, white), var(--rag-gold-strong));
  }

  .pet-panel-action.is-danger {
    color: #b91c1c;
    border-color: rgba(239, 68, 68, 0.18);
    background: rgba(254, 242, 242, 0.82);
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
    min-height: 0;
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
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
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
    flex: 1 1 auto;
    max-height: none;
    min-height: 0;
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
    flex: 1 1 auto;
    display: grid;
    align-content: start;
    gap: 10px;
    padding: 11px;
    overflow: auto;
    border: 1px dashed color-mix(in srgb, var(--rag-line) 74%, transparent);
    color: color-mix(in srgb, var(--rag-muted) 90%, var(--rag-text));
    background: color-mix(in srgb, var(--rag-panel) 76%, white);
  }

  .pet-panel-welcome {
    margin: 0;
    color: #263244;
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
    border: 1px solid color-mix(in srgb, var(--rag-line) 72%, transparent);
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-text) 78%, var(--rag-muted));
    background: color-mix(in srgb, var(--rag-paper) 82%, transparent);
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
    border-color: color-mix(in srgb, var(--rag-gold) 22%, var(--rag-line));
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
`,Js=Fe`
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
    border-color: color-mix(in srgb, var(--rag-line) 70%, transparent);
    background: color-mix(in srgb, var(--rag-paper) 72%, transparent);
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
      height: min(var(--rag-pet-panel-height, 318px), calc(100dvh - 132px));
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
`,Xs=[Vs,Qs,Ys,Zs,Js];function Ee(e,t,u={}){return{id:u.id||Qe(),role:e,content:t,time:u.time||ke(),sources:u.sources,streaming:u.streaming,error:u.error}}function Ks(e,t,u){return e.map(r=>r.id===t?u(r):r)}function Qe(){return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}const Se={visible:!1,text:"",x:0,y:0};function e0(e){const t=window.getSelection();if(!t||t.isCollapsed||t.rangeCount===0)return Se;const u=t.toString().replace(/\s+/g," ").trim();if(u.length<2||t0(t))return Se;const n=t.getRangeAt(0).getBoundingClientRect();if(!n||n.width===0&&n.height===0)return Se;const i=Math.max(72,Math.min(n.left+n.width/2,window.innerWidth-72)),o=Math.max(42,n.top-12);return{visible:!0,text:u.slice(0,e),x:Math.round(i),y:Math.round(o)}}function t0(e){return Zr(e.anchorNode)||Zr(e.focusNode)}function Zr(e){return!!(e instanceof Element?e:e?.parentElement)?.closest('input, textarea, select, [contenteditable="true"], summaraid-rag-assistant')}class B extends Error{status;response;constructor(t,u={}){super(t),this.name="AIUIError",this.status=u.status,this.response=u.response,u.cause!==void 0&&Object.defineProperty(this,"cause",{configurable:!0,enumerable:!1,value:u.cause})}}class N extends B{constructor(t,u={}){super(t,u),this.name="AIUIProtocolError"}}class u0 extends N{target;partType;partName;partId;constructor(t,u){super(t,{cause:u.cause}),this.name="AIUISchemaValidationError",this.target=u.target,this.partType=u.partType,this.partName=u.partName,this.partId=u.partId}}function xt(e){return e instanceof Error?e:new Error(String(e))}function r0(e){return e instanceof N}function n0(e){return(e instanceof DOMException||e instanceof Error)&&e.name==="AbortError"}let Yr=0;function yt(e="msg"){return Yr+=1,`${e}_${Date.now().toString(36)}_${Yr.toString(36)}`}function i0(e){if(s0(e))return e;const t=e;if(typeof t.toJSONSchema=="function")return t.toJSONSchema();const u=e;if(typeof u.toJsonSchema=="function")return u.toJsonSchema();throw new B("A JSON Schema object is required unless the schema can export JSON Schema.")}function Qr(e,t,u){return o0(e,t,{makeError:(r,n)=>new u0(`UI message ${u.target} validation failed: ${r}`,{...u,cause:n})})}function o0(e,t,u){if(c0(t))try{const i=t["~standard"].validate(e);if(l0(i))throw u.makeError("Async schemas are not supported for UI message streams.");if("issues"in i&&i.issues&&i.issues.length>0)throw u.makeError(d0(i.issues),i.issues);return i.value}catch(i){throw nu(i)?i:u.makeError(Je(i),i)}const r=t;if(typeof r.safeParse=="function")try{const i=r.safeParse(e);if(!i.success)throw u.makeError(Je(i.error),i.error);return i.data}catch(i){throw nu(i)?i:u.makeError(Je(i),i)}const n=t;if(typeof n.parse=="function")try{return n.parse(e)}catch(i){throw u.makeError(Je(i),i)}try{return ru(e,i0(t),"$"),e}catch(i){throw nu(i)?i:u.makeError(Je(i),i)}}function ru(e,t,u){if(t.enum&&!t.enum.some(r=>Object.is(r,e)))throw new B(`${u} must be one of ${t.enum.join(", ")}`);if(t.type==="object"||t.properties){if(!p0(e))throw new B(`${u} must be an object`);for(const r of t.required??[])if(!(r in e))throw new B(`${u}.${r} is required`);for(const[r,n]of Object.entries(t.properties??{}))e[r]!==void 0&&ru(e[r],n,`${u}.${r}`);return}if(t.type==="array"||t.items){if(!Array.isArray(e))throw new B(`${u} must be an array`);t.items&&e.forEach((r,n)=>ru(r,t.items,`${u}[${n}]`));return}if(t.type&&!a0(e,t.type))throw new B(`${u} must be ${t.type}`)}function a0(e,t){switch(t){case"string":return typeof e=="string";case"number":return typeof e=="number";case"integer":return Number.isInteger(e);case"boolean":return typeof e=="boolean";case"null":return e===null;default:return!0}}function s0(e){return typeof e=="object"&&e!==null&&("type"in e||"properties"in e)}function c0(e){return typeof e=="object"&&e!==null&&"~standard"in e&&typeof e["~standard"]?.validate=="function"}function l0(e){return typeof e=="object"&&e!==null&&typeof e.then=="function"}function nu(e){return e instanceof B}function d0(e){return e.map(t=>`${t.path?.length?`${t.path.map(String).join(".")}: `:""}${t.message??"Invalid value"}`).join("; ")}function Je(e){return e instanceof Error?e.message:typeof e=="object"&&e!==null&&"message"in e?String(e.message):String(e)}function p0(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function f0(e={}){return{message:e.message??{id:e.messageId??yt("msg"),role:"assistant",parts:[],metadata:e.metadata},terminal:{},visible:!!e.message?.parts.length,messageMetadataSchema:e.messageMetadataSchema,dataPartSchemas:e.dataPartSchemas}}function h0(e,t){if(g0(t),Kr(t)){if(!t.transient){const u=k0(e,t);ae(e,{type:t.type,id:t.id,name:t.name,data:u,transientData:!1})}return e}if(ou(t))return Xr(e,E0(t)),e;if(en(t))return Xr(e,t),e;switch(t.type){case"start":e.message={...e.message,id:t.messageId??e.message.id,metadata:iu(e,t.messageMetadata)};break;case"text-start":ae(e,{type:"text",id:t.id,text:""});break;case"text-delta":y0(e,t.id,t.delta);break;case"text-end":break;case"reasoning-start":ae(e,{type:"reasoning",id:t.id,text:""});break;case"reasoning-delta":_0(e,t.id,t.delta,t.providerMetadata);break;case"reasoning-end":break;case"message-metadata":e.message={...e.message,metadata:iu(e,t.messageMetadata)};break;case"source-url":ae(e,{type:"source-url",sourceId:t.sourceId??t.id??t.url,url:t.url,title:t.title,providerMetadata:t.providerMetadata});break;case"file":ae(e,{type:"file",id:t.id,url:t.url,title:t.title,mediaType:t.mediaType,data:t.data,providerMetadata:t.providerMetadata});break;case"start-step":break;case"finish-step":e.terminal={...e.terminal,finishReason:t.finishReason??e.terminal.finishReason,rawFinishReason:t.rawFinishReason??e.terminal.rawFinishReason,usage:t.usage??e.terminal.usage};break;case"finish":e.message={...e.message,metadata:iu(e,t.messageMetadata)},e.terminal=v0(e.terminal,t);break;case"error":e.terminal={...e.terminal,errorText:t.errorText};break;case"abort":e.terminal={...e.terminal,aborted:!0};break}return e}function g0(e){if(!e||typeof e.type!="string"||e.type.length===0)throw new N("UI message chunk type is required.");if(Kr(e)){if(cu(e.name,/^[A-Za-z][A-Za-z0-9_-]*$/,"data name"),e.type!==`data-${e.name}`)throw new N(`Data chunk type must be data-${e.name}.`);if(!e.id)throw new N("Data chunk id is required.");return}if(ou(e)){if(S0(e.type,e.toolCallId,e.toolName),e.type==="tool-input-delta"&&!e.inputTextDelta)throw new N("Tool input-delta chunk inputTextDelta is required.");if(e.type==="tool-output-error"&&!e.errorText)throw new N("Tool output-error chunk errorText is required.");if((e.type==="tool-approval-request"||e.type==="tool-approval-response")&&!e.approvalId)throw new N("Tool approval chunk approvalId is required.");if(e.type==="tool-approval-response"&&typeof e.approved!="boolean")throw new N("Tool approval-response chunk approved is required.");return}if(en(e)){if(cu(e.toolName,/^[A-Za-z][A-Za-z0-9_-]*$/,"tool name"),e.type!==`tool-${e.toolName}`)throw new N(`Tool chunk type must be tool-${e.toolName}.`);if(!e.toolCallId)throw new N("Tool chunk toolCallId is required.");if(!e.state)throw new N("Tool chunk state is required.");if(e.state==="output-error"&&!e.errorText)throw new N("Tool output-error chunk errorText is required.")}}function b0(e,t){const u=wt(e,t.toolCallId);return _t(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"output-available",input:u?.input,output:t.output??t.result,approval:u?.approval,providerMetadata:t.providerMetadata??u?.providerMetadata})}function m0(e,t){const u=wt(e,t.toolCallId);return _t(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"output-error",input:u?.input,errorText:t.errorText,approval:u?.approval,providerMetadata:t.providerMetadata??u?.providerMetadata})}function x0(e,t){const u=wt(e,t.toolCallId);return _t(e,{type:`tool-${t.toolName}`,toolCallId:t.toolCallId,toolName:t.toolName,state:"approval-responded",input:u?.input,errorText:u?.errorText,approval:{id:t.approvalId,approved:t.approved,reason:t.reason},providerMetadata:t.providerMetadata??u?.providerMetadata})}function y0(e,t,u){const r=e.message.parts.find(n=>n.type==="text"&&n.id===t);ae(e,{type:"text",id:t,text:`${r?.text??""}${u??""}`})}function _0(e,t,u,r){const n=e.message.parts.find(i=>i.type==="reasoning"&&i.id===t);ae(e,{type:"reasoning",id:t,text:`${n?.text??""}${u??""}`,providerMetadata:r??n?.providerMetadata})}function ae(e,t){e.message=_t(e.message,t),e.visible=e.visible||C0(t)}function _t(e,t){const u=e.parts.findIndex(n=>w0(n,t)),r=[...e.parts];return u===-1?r.push(t):r[u]=t,{...e,parts:r}}function w0(e,t){if(e.type!==t.type)return!1;if(au(t))return au(e)&&e.id===t.id;switch(t.type){case"text":case"reasoning":case"file":return"id"in e&&e.id===t.id;case"source-url":return"sourceId"in e&&e.sourceId===t.sourceId;default:return su(t)?su(e)&&e.toolCallId===t.toolCallId:!1}}function C0(e){return!au(e)||!e.transientData}function v0(e,t){return{...e,finishReason:t.finishReason,rawFinishReason:t.rawFinishReason,usage:t.usage}}function A0(e,t){return t==null?e:Jr(e)&&Jr(t)?{...e,...t}:t}function iu(e,t){const u=A0(e.message.metadata,t);return t==null||!e.messageMetadataSchema?u:Qr(u,e.messageMetadataSchema,{target:"message-metadata"})}function k0(e,t){const u=e.dataPartSchemas?.[t.name];return u?Qr(t.data,u,{target:"data-part",partType:t.type,partName:t.name,partId:t.id}):t.data}function Jr(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Xr(e,t){const u=wt(e.message,t.toolCallId),r=t.state==="input-streaming"?`${u?.inputText??""}${t.inputTextDelta??""}`:void 0;ae(e,{type:t.type,toolCallId:t.toolCallId,toolName:t.toolName,state:t.state,input:t.input??u?.input,inputText:r,output:t.output??u?.output,errorText:t.errorText??u?.errorText,approval:t.approval??u?.approval,providerMetadata:t.providerMetadata??u?.providerMetadata})}function E0(e){const t={type:`tool-${e.toolName}`,toolCallId:e.toolCallId,toolName:e.toolName,providerMetadata:"providerMetadata"in e?e.providerMetadata:void 0};switch(e.type){case"tool-input-start":return{...t,state:"input-streaming",inputTextDelta:""};case"tool-input-delta":return{...t,state:"input-streaming",inputTextDelta:e.inputTextDelta};case"tool-input-available":return{...t,state:"input-available",input:e.input};case"tool-output-available":return{...t,state:"output-available",output:e.output};case"tool-output-error":return{...t,state:"output-error",errorText:e.errorText};case"tool-approval-request":return{...t,state:"approval-requested",input:e.input,approval:{id:e.approvalId}};case"tool-approval-response":return{...t,state:"approval-responded",approval:{id:e.approvalId,approved:e.approved,reason:e.reason}}}}function wt(e,t){return e.parts.find(u=>su(u)&&u.toolCallId===t)}function Kr(e){return e.type.startsWith("data-")}function ou(e){return e.type==="tool-input-start"||e.type==="tool-input-delta"||e.type==="tool-input-available"||e.type==="tool-output-available"||e.type==="tool-output-error"||e.type==="tool-approval-request"||e.type==="tool-approval-response"}function en(e){return e.type.startsWith("tool-")&&!ou(e)}function au(e){return e.type.startsWith("data-")}function su(e){return e.type.startsWith("tool-")}function cu(e,t,u){if(!e||!t.test(e))throw new N(`${u} must be a simple identifier.`)}function S0(e,t,u){if(cu(u,/^[A-Za-z][A-Za-z0-9_-]*$/,"tool name"),!t)throw new N(`${e} chunk toolCallId is required.`)}const D0="X-Halo-AI-UI-Message-Stream",T0="v1",Ct="[DONE]";function P0(e){const t=e.headers.get(D0);if(t&&t!==T0)throw new B(`Unsupported Halo UI message stream version: ${t}`,{response:e,status:e.status})}async function*F0(e){const t=e.getReader(),u=new TextDecoder;try{for(;;){const{value:n,done:i}=await t.read();if(i)break;if(n){const o=u.decode(n,{stream:!0});o&&(yield o)}}const r=u.decode();r&&(yield r)}finally{t.releaseLock()}}async function*$0(e){let t="";for await(const r of F0(e)){t+=r;const i=t.replace(/\r\n/g,`
`).split(`

`);t=i.pop()??"";for(const o of i){const a=tn(o);a===Ct||a==null||(yield a)}}const u=t.trim();if(u){const r=tn(u);r!==Ct&&r!=null&&(yield r)}}function tn(e){const t=e.split(`
`).filter(r=>r.startsWith("data:")).map(r=>r.slice(5).trimStart());if(!t.length)return;const u=t.join(`
`).trim();if(!u||u===Ct)return Ct;try{return JSON.parse(u)}catch(r){throw new B("Failed to parse Halo UI message stream chunk.",{cause:r})}}class I0{api;credentials;headers;body;fetch;prepareSendMessagesRequest;constructor(t={}){this.api=t.api??"/api/chat",this.credentials=t.credentials,this.headers=t.headers,this.body=t.body,this.fetch=t.fetch,this.prepareSendMessagesRequest=t.prepareSendMessagesRequest}async sendMessages(t){const u=await lu(this.body),r=M0(await lu(this.headers),t.headers),n=t.credentials??await lu(this.credentials),i={...u,...t.body,id:t.chatId,messages:t.messages,trigger:t.trigger,messageId:t.messageId??null},o=await this.prepareSendMessagesRequest?.({...t,api:this.api,body:i,headers:r,credentials:n}),a=await this.fetchResponse({api:o?.api??this.api,body:o?.body??i,headers:o?.headers??r,credentials:o?.credentials??n,abortSignal:t.abortSignal});return this.processResponse(a)}async fetchResponse(t){const u=this.fetch??globalThis.fetch;if(!u)throw new B("No fetch implementation is available.");const r=await u(t.api,{method:"POST",headers:{"Content-Type":"application/json",...rn(t.headers)},body:JSON.stringify(t.body),credentials:t.credentials,signal:t.abortSignal});if(!r.ok)throw new B(await r.text()||"Failed to fetch chat response.",{status:r.status,response:r});if(!r.body)throw new B("The response body is empty.",{status:r.status,response:r});return r}}class un extends I0{processResponse(t){return P0(t),$0(t.body)}}async function lu(e){return typeof e=="function"?await e():e}function M0(...e){return Object.assign({},...e.map(rn))}function rn(e){return e?e instanceof Headers?Object.fromEntries(e.entries()):Array.isArray(e)?Object.fromEntries(e):e:{}}class R0{id;generateId;state;transport;onError;onData;onToolCall;onAutomaticStepLimitExceeded;onFinish;sendAutomaticallyWhen;maxAutomaticSteps;messageMetadataSchema;dataPartSchemas;notifiedToolCalls=new Set;consumedAutomaticContinuationKeys=new Set;listeners=new Set;activeAbortController;automaticStepCount=0;hasPendingAutomaticContinuation=!1;pendingAutomaticContinuationOptions;toolCallbackFailure;constructor(t={}){this.generateId=t.generateId??(()=>yt("msg")),this.id=t.id??this.generateId(),this.state=t.state??N0({messages:t.messages??[]}),this.transport=t.transport??new un,this.onError=t.onError,this.onData=t.onData,this.onToolCall=t.onToolCall,this.onAutomaticStepLimitExceeded=t.onAutomaticStepLimitExceeded,this.onFinish=t.onFinish,this.sendAutomaticallyWhen=t.sendAutomaticallyWhen,this.maxAutomaticSteps=V0(t.maxAutomaticSteps),this.messageMetadataSchema=t.messageMetadataSchema,this.dataPartSchemas=t.dataPartSchemas}get messages(){return this.state.getMessages()}set messages(t){this.setMessages(t)}get status(){return this.state.getStatus()}get error(){return this.state.getError()}setMessages(t){this.setChatMessages([...t])}clearError(){this.setChatError(void 0),(this.status==="error"||this.status==="disconnected")&&this.setChatStatus("ready")}subscribe(t){return this.listeners.add(t),()=>{this.listeners.delete(t)}}async sendMessage(t,u){this.resetAutomaticContinuation(),t&&this.applyUserMessage(t),await this.makeRequest({trigger:"submit-message",messageId:t?.messageId,options:u})}async regenerate({messageId:t,...u}={}){this.resetAutomaticContinuation();const r=this.messages,n=t==null?nn(r,o=>o.role==="assistant"):r.findIndex(o=>o.id===t);if(n===-1)throw new Error(`message ${t??"<last assistant>"} not found`);const i=r[n].role==="assistant"?n:n+1;this.setMessages(r.slice(0,i)),await this.makeRequest({trigger:"regenerate-message",messageId:t,options:u,requestMessages:r})}stop(){this.activeAbortController?.abort()}async appendToolOutputSuccess(t,u){const r=this.resolveToolCall(t.toolCallId,t.toolName);this.updateLastAssistant(n=>b0(n,{...t,toolName:r.toolName})),await this.maybeSendAutomaticallyAfterToolUpdate(u)}async appendToolOutputError(t,u){const r=this.resolveToolCall(t.toolCallId,t.toolName);this.updateLastAssistant(n=>m0(n,{...t,toolName:r.toolName})),await this.maybeSendAutomaticallyAfterToolUpdate(u)}async addToolOutput(t,u){const r=t.toolName??t.tool;if("state"in t&&t.state==="output-error"){await this.appendToolOutputError({toolCallId:t.toolCallId,toolName:r,errorText:t.errorText,providerMetadata:t.providerMetadata},u);return}const n=t;await this.appendToolOutputSuccess({toolCallId:n.toolCallId,toolName:r,result:n.output??n.result,providerMetadata:n.providerMetadata},u)}async rejectToolCall(t,u){await this.addToolApprovalResponse({...t,approved:!1},u)}async addToolApprovalResponse(t,u){const r=t.id||t.approvalId?this.resolveApprovalRequest(t.id??t.approvalId):void 0,n=t.toolCallId??r?.toolCallId;if(!n)throw new Error("Tool call id is required.");const i=this.resolveToolCall(n,t.toolName??t.tool);this.updateLastAssistant(o=>x0(o,{approvalId:r?.approval?.id??t.id??t.approvalId??n,toolCallId:n,toolName:t.toolName??t.tool??i.toolName,approved:t.approved,reason:t.reason,providerMetadata:t.providerMetadata})),await this.maybeSendAutomaticallyAfterToolUpdate(u)}applyUserMessage(t){const u=this.messages,r={id:t.id??this.generateId(),role:t.role??"user",parts:this.userMessageParts(t),metadata:t.metadata};if(t.messageId){const n=u.findIndex(i=>i.id===t.messageId);if(n===-1)throw new Error(`message with id ${t.messageId} not found`);if(u[n].role!=="user")throw new Error(`message with id ${t.messageId} is not a user message`);this.setMessages([...u.slice(0,n),{...r,id:t.messageId}]);return}this.setMessages([...u,r])}userMessageParts(t){if(t.parts)return t.parts;const u=[];t.text!=null&&u.push({type:"text",id:yt("text"),text:t.text});for(const r of t.files??[])u.push({type:"file",id:r.id??yt("file"),url:r.url,title:r.title,mediaType:r.mediaType,data:r.data,providerMetadata:r.providerMetadata});return u}async makeRequest({trigger:t,messageId:u,options:r,requestMessages:n,reducerMessage:i}){const o=await this.consumeAssistantStream({reducerMessage:i??{id:this.generateId(),role:"assistant",parts:[]},createStream:a=>this.transport.sendMessages({chatId:this.id,messages:j0(n??this.messages),trigger:t,messageId:u,headers:r?.headers,body:r?.body,credentials:r?.credentials,metadata:r?.metadata,abortSignal:a})});this.status==="ready"&&!o.isAbort&&!o.isError?await this.maybeSendAutomatically(this.consumePendingAutomaticContinuationOptions(r)):this.clearPendingAutomaticContinuation()}async consumeAssistantStream({reducerMessage:t,createStream:u}){this.setChatStatus("submitted"),this.setChatError(void 0),this.toolCallbackFailure=void 0;let r=!1,n=!1,i=!1;const o=new AbortController;this.activeAbortController=o;const a=f0({message:t,messageMetadataSchema:this.messageMetadataSchema,dataPartSchemas:this.dataPartSchemas});try{const s=await u(o.signal);for await(const c of s)this.applyAssistantChunk(a,c),i=!0,this.setChatStatus("streaming");if(this.toolCallbackFailure)n=!0,this.failChat(this.toolCallbackFailure);else if(a.terminal.errorText){n=!0;const c=new Error(a.terminal.errorText);this.setChatError(c),this.setChatStatus("error"),this.onError?.(c)}else this.setChatStatus("ready")}catch(s){if(n0(s)||o.signal.aborted)return r=!0,this.setChatStatus("ready"),{isAbort:r,isError:n};o.abort(),n=!0;const c=xt(s);this.setChatError(c),i&&!r0(c)?(n=!1,this.setChatStatus("disconnected")):this.setChatStatus("error"),this.onError?.(c)}finally{this.activeAbortController===o&&(this.activeAbortController=void 0),await this.onFinish?.({message:a.message,messages:this.messages,terminal:a.terminal,isAbort:r,isError:n})}return{isAbort:r,isError:n}}applyAssistantChunk(t,u){h0(t,u);let r;Q0(u)&&this.onData?.(J0(t.message,u));const n=t.message.parts[t.message.parts.length-1];if(n&&te(n)&&n.state==="input-available"){const a=n;this.notifiedToolCalls.has(a.toolCallId)||(this.notifiedToolCalls.add(a.toolCallId),r=a)}if(!t.visible&&u.type!=="error"&&u.type!=="abort")return;const i=this.messages,o=i[i.length-1];o?.role==="assistant"&&o.id===t.message.id?(t.message=H0(t.message,o),this.setMessages([...i.slice(0,-1),t.message])):this.setMessages([...i,t.message]),r&&this.notifyToolCall(r)}updateLastAssistant(t){const u=this.messages,r=nn(u,n=>n.role==="assistant");if(r===-1)throw new Error("No assistant message is available for tool continuation.");this.setMessages([...u.slice(0,r),t(u[r]),...u.slice(r+1)])}resolveToolCall(t,u){const r=z0(this.messages,t),n=u??r?.toolName;if(!n)throw new Error(`Tool call ${t} was not found.`);return{toolName:n}}resolveApprovalRequest(t){if(!t)throw new Error("Tool approval id is required.");const u=O0(this.messages,t);if(!u)throw new Error(`Tool approval request ${t} was not found.`);return u}async maybeSendAutomatically(t){if(this.status==="submitted"||this.status==="streaming")return;if(!await this.shouldSendAutomatically()){this.resetAutomaticContinuationIfIdle();return}const u=W0(this.messages);if(u.filter(n=>!this.consumedAutomaticContinuationKeys.has(n)).length!==0){if(this.automaticStepCount>=this.maxAutomaticSteps){this.onAutomaticStepLimitExceeded?.({messages:this.messages,maxAutomaticSteps:this.maxAutomaticSteps});return}for(const n of u)this.consumedAutomaticContinuationKeys.add(n);this.automaticStepCount+=1,await this.makeRequest({trigger:"submit-message",messageId:this.messages[this.messages.length-1]?.id,options:t,reducerMessage:this.lastAssistantMessage()})}}async maybeSendAutomaticallyAfterToolUpdate(t){if(this.status==="submitted"||this.status==="streaming"){this.rememberPendingAutomaticContinuation(t);return}await this.maybeSendAutomatically(t)}lastAssistantMessage(){return[...this.messages].reverse().find(t=>t.role==="assistant")}async shouldSendAutomatically(){if(!this.sendAutomaticallyWhen)return!1;try{return!!await this.sendAutomaticallyWhen({messages:this.messages})}catch(t){throw this.failChat(t)}}notifyToolCall(t){try{const u=this.onToolCall?.(t);Z0(u)&&u.catch(r=>{const n=xt(r);this.toolCallbackFailure=n,this.status!=="submitted"&&this.status!=="streaming"&&this.failChat(n)})}catch(u){throw xt(u)}}failChat(t){const u=xt(t);return this.setChatError(u),this.setChatStatus("error"),this.onError?.(u),u}resetAutomaticContinuation(){this.automaticStepCount=0,this.consumedAutomaticContinuationKeys.clear(),this.clearPendingAutomaticContinuation()}rememberPendingAutomaticContinuation(t){this.hasPendingAutomaticContinuation=!0,t&&(this.pendingAutomaticContinuationOptions=t)}consumePendingAutomaticContinuationOptions(t){const u=this.hasPendingAutomaticContinuation?this.pendingAutomaticContinuationOptions??t:t;return this.hasPendingAutomaticContinuation=!1,this.pendingAutomaticContinuationOptions=void 0,u}clearPendingAutomaticContinuation(){this.hasPendingAutomaticContinuation=!1,this.pendingAutomaticContinuationOptions=void 0}resetAutomaticContinuationIfIdle(){const t=this.lastAssistantMessage();(!t||!t.parts.some(L0))&&(this.automaticStepCount=0,this.clearPendingAutomaticContinuation())}setChatMessages(t){this.state.setMessages(t),this.emitChange()}setChatStatus(t){this.state.setStatus(t),this.emitChange()}setChatError(t){this.state.setError(t),this.emitChange()}emitChange(){for(const t of this.listeners)t()}}function N0({messages:e=[],status:t="ready",error:u}={}){let r=e,n=t,i=u;return{getMessages:()=>r,setMessages:o=>{r=o},getStatus:()=>n,setStatus:o=>{n=o},getError:()=>i,setError:o=>{i=o}}}function nn(e,t){for(let u=e.length-1;u>=0;u-=1)if(t(e[u]))return u;return-1}function z0(e,t){for(let u=e.length-1;u>=0;u-=1){const r=e[u];if(r.role==="assistant")for(let n=r.parts.length-1;n>=0;n-=1){const i=r.parts[n];if(te(i)&&i.toolCallId===t)return{toolName:i.toolName}}}}function O0(e,t){for(let u=e.length-1;u>=0;u-=1){const r=e[u];if(r.role==="assistant")for(let n=r.parts.length-1;n>=0;n-=1){const i=r.parts[n];if(te(i)&&i.state==="approval-requested"&&i.approval?.id===t)return i}}}function te(e){return e.type.startsWith("tool-")}function L0(e){return te(e)&&(e.state==="input-streaming"||e.state==="input-available"||e.state==="approval-requested")}function B0(e){return te(e)&&(e.state==="output-available"||e.state==="output-error"||e.state==="output-denied")}function U0(e){return te(e)&&e.state==="approval-responded"}function q0(e){return B0(e)||U0(e)}function on(e){return an(e)||e.state==="approval-responded"}function an(e){return e.state==="output-available"||e.state==="output-error"||e.state==="output-denied"}function H0(e,t){const u=new Map(t.parts.filter(i=>te(i)&&on(i)).map(i=>[i.toolCallId,i]));if(u.size===0)return e;let r=!1;const n=e.parts.map(i=>{if(!te(i)||on(i))return i;const o=u.get(i.toolCallId);return o?(r=!0,{...i,...o,input:o.input??i.input,inputText:o.inputText??i.inputText,providerMetadata:o.providerMetadata??i.providerMetadata}):i});return r?{...e,parts:n}:e}function j0(e){const t=new Set;let u=!1;const r=[...e].reverse().map(n=>{if(n.role!=="assistant")return n;const i=[...n.parts].reverse().filter(o=>!te(o)||!an(o)?!0:t.has(o.toolCallId)?(u=!0,!1):(t.add(o.toolCallId),!0)).reverse();return i.length===n.parts.length?n:{...n,parts:i}}).reverse();return u?r:e}function W0(e){const t=[...e].reverse().find(r=>r.role==="assistant");if(!t)return[];const u=t.parts.filter(q0);return u.length===0?[]:Array.from(new Set(u.map(G0)))}function G0(e){return Y0({toolCallId:e.toolCallId,toolName:e.toolName,state:e.state,approvalId:e.approval?.id,approved:e.approval?.approved})}function V0(e){return!Number.isFinite(e)||e==null||e<1?5:Math.floor(e)}function Z0(e){return typeof e=="object"&&e!==null&&"then"in e&&typeof e.then=="function"}function Y0(e){const t=new WeakSet,u=r=>{if(r===void 0)return'"[Undefined]"';if(typeof r=="bigint")return JSON.stringify(r.toString());if(r===null||typeof r=="string"||typeof r=="number"||typeof r=="boolean")return JSON.stringify(r);if(typeof r!="object")return JSON.stringify(String(r));if(t.has(r))return'"[Circular]"';if(t.add(r),Array.isArray(r))return`[${r.map(u).join(",")}]`;const n=r;return`{${Object.keys(n).sort().map(o=>`${JSON.stringify(o)}:${u(n[o])}`).join(",")}}`};return u(e)}function Q0(e){return e.type.startsWith("data-")}function J0(e,t){return t.transient?{type:t.type,id:t.id,name:t.name,data:t.data,transientData:!0}:e.parts.find(r=>r.type===t.type&&r.type.startsWith("data-")&&r.id===t.id)??{type:t.type,id:t.id,name:t.name,data:t.data,transientData:!1}}function X0(e,t={}){const u=t.maxMessages,r=typeof u=="number"&&u>=0?e.slice(Math.max(0,e.length-u)):[...e],n=t.removePendingToolParts!==!1,i=[];for(const o of r){const a=n?o.parts.filter(s=>!K0(s)):[...o.parts];a.length!==0&&i.push({...o,parts:a.map(s=>({...s}))})}return i}function K0(e){return ec(e)&&(e.state==="input-streaming"||e.state==="input-available"||e.state==="approval-requested")}function ec(e){return e.type.startsWith("tool-")}const du="summaraidgpt:agent-after-navigation",tc=15e3,uc="我已经打开了新的页面，请基于当前页面继续完成上一条用户请求。必要时先查看当前页面上下文。";function vt(e={},t=window.sessionStorage){const u={openChat:!0,focusChatInput:!0,displayMode:e.displayMode??"panel",expiresAt:Date.now()+tc};e.resume?.historyMessages?.length&&(u.resume={message:e.resume.message?.trim()||uc,historyMessages:e.resume.historyMessages}),t.setItem(du,JSON.stringify(u))}function rc(e=window.sessionStorage){const t=e.getItem(du);if(e.removeItem(du),!!t)try{const u=JSON.parse(t);return typeof u.expiresAt!="number"||u.expiresAt<Date.now()?void 0:{openChat:u.openChat===!0,focusChatInput:u.focusChatInput!==!1,displayMode:u.displayMode==="stage"?"stage":"panel",resume:nc(u.resume),expiresAt:u.expiresAt}}catch{return}}function nc(e){if(typeof e!="object"||e===null)return;const t=e;if(!(typeof t.message!="string"||!t.message.trim()||!Array.isArray(t.historyMessages)))return{message:t.message.trim(),historyMessages:t.historyMessages}}const sn=new Map,cn="#a16207",ic="#ffffff",oc="#f4f4f5",ac="#52525b";function ln(e,t){/^[a-z][a-z0-9_]{2,63}$/.test(e)&&sn.set(e,t)}function sc(){window.SummaraidGPTAI||(window.SummaraidGPTAI={registerTool:ln}),window.Live2DAI||(window.Live2DAI={registerTool:ln})}sc();class cc{constructor(t){this.trustedResources=new Map,this.trustedPageLinks=new Map,this.navigationStarted=!1,this.config=Mt(t)}canExecute(t){return this.builtInToolNames().has(t)||this.config.aiTools.some(u=>u.name===t)}ingestMessages(t){for(const u of t)for(const r of u.parts)!lc(r)||r.state!=="output-available"||this.ingestToolOutput(r.output)}async execute(t){const u=t.input??{};try{if(t.toolName==="get_current_page_context")return this.getCurrentPageContext();if(t.toolName==="open_halo_resource")return this.openHaloResource(u);if(t.toolName==="open_current_page_link")return this.openCurrentPageLink(u);if(t.toolName==="open_comment_area")return this.scrollToCommentArea();if(t.toolName==="draft_comment")return this.config.builtIn.commentCapability==="off"?R("TOOL_NOT_ALLOWED","评论辅助能力未启用"):this.fillCommentDraft(u);if(t.toolName==="submit_comment")return this.config.builtIn.commentCapability!=="submit"?R("TOOL_NOT_ALLOWED","评论提交能力未启用"):this.submitComment(u);const r=this.config.aiTools.find(o=>o.name===t.toolName);if(!r)return R("TOOL_NOT_FOUND","这个功能还没有配置好");const n=r.action;if(this.requiresApproval(r.approval,n)&&!await this.requestApproval(`要我帮你执行「${r.description}」吗？`))return R("TOOL_APPROVAL_DENIED","访客取消了这次操作");this.showStatus(n.pendingMessage??"我来帮你处理一下");const i=await this.executeCustomAction(n,u,t.toolName);return this.showStatus(i.ok?n.successMessage:n.errorMessage),i}catch(r){return R("TOOL_EXECUTION_FAILED",r instanceof Error?r.message:"工具执行失败")}}tryOpenStrongResourceMatch(t){if(this.navigationStarted||!this.config.builtIn.haloNavigation)return;const u=dc(t);if(!u||!pc(u))return;const i=[...this.trustedResources.values()].map(o=>({resource:o,score:fc(o,u)})).filter(o=>o.score>0).sort((o,a)=>a.score-o.score)[0]?.resource;if(i)return this.showStatus(`正在打开${i.title||"页面"}`),this.navigate(i.permalink)}requestApproval(t){return new Promise(u=>{document.getElementById("summaraid-agent-approval")?.remove();const r=document.createElement("div");r.id="summaraid-agent-approval",r.style.cssText=["position:fixed","left:50%","bottom:5.5rem","z-index:100001","transform:translateX(-50%)","display:flex","align-items:center","gap:.5rem","max-width:min(28rem,calc(100vw - 1rem))","padding:.5rem .625rem","border:1px solid rgba(24,24,27,.12)","border-radius:.75rem","background:rgba(255,255,255,.98)","box-shadow:0 18px 44px rgba(15,23,42,.16)","font-size:13px","color:#334155"].join(";");const n=document.createElement("span");n.textContent=t,n.style.cssText="line-height:1.4;min-width:0;flex:1;";const i=document.createElement("button");i.type="button",i.textContent="允许",i.style.cssText=dn(cn,ic);const o=document.createElement("button");o.type="button",o.textContent="取消",o.style.cssText=dn(oc,ac);const a=s=>{r.remove(),u(s)};i.addEventListener("click",()=>a(!0),{once:!0}),o.addEventListener("click",()=>a(!1),{once:!0}),r.append(n,i,o),document.body.append(r)})}builtInToolNames(){const t=new Set;if(!this.config.enabled)return t;const u=this.config.builtIn;return u.pageContext&&t.add("get_current_page_context"),u.haloNavigation&&(t.add("open_halo_resource"),t.add("open_current_page_link")),u.commentCapability!=="off"&&(t.add("open_comment_area"),t.add("draft_comment")),u.commentCapability==="submit"&&t.add("submit_comment"),t}getCurrentPageContext(){const t=window.getSelection()?.toString().trim()??"",u=this.findCommentInput(),r=this.findCommentArea(),n=u?.container?this.findCommentSubmitButton(u.container):void 0,i=this.collectLinkSummaries();this.trustedPageLinks.clear();for(const o of i)this.trustedPageLinks.set(o.linkId,o);return{ok:!0,title:document.title,url:window.location.href,path:window.location.pathname,description:document.querySelector("meta[name='description']")?.content.trim()??"",headings:this.collectHeadings(),selectedText:t.slice(0,1600),capabilities:{comment:{hasArea:!!r,hasInput:!!u,hasSubmitButton:!!n,reason:r?u?n?"当前页面支持填写评论":"当前页面有可写评论输入框，但没有检测到提交按钮":"当前页面有评论区，但没有检测到可写评论输入框":"当前页面没有检测到评论区"},forms:this.collectFormSummaries(),links:i}}}openHaloResource(t){const u=pu(t.resourceId);if(!u)return R("INVALID_INPUT","resourceId is required");const r=this.trustedResources.get(u);return r?this.navigate(r.permalink):R("RESOURCE_NOT_TRUSTED","没有找到可信资源")}openCurrentPageLink(t){const u=pu(t.linkId);if(!u)return R("INVALID_INPUT","linkId is required");const r=this.trustedPageLinks.get(u);return r?this.navigate(r.href):R("LINK_NOT_TRUSTED","没有找到可信链接")}scrollToCommentArea(){const t=this.findCommentArea();return t?(t.scrollIntoView?.({behavior:"smooth",block:"center"}),this.showStatus("已经帮你定位到评论区"),{ok:!0}):R("COMMENT_AREA_NOT_FOUND","当前页面没有检测到评论区")}fillCommentDraft(t){const u=pu(t.content);if(!u)return R("INVALID_INPUT","content is required");const r=this.findCommentInput();return r?(r.container?.scrollIntoView?.({behavior:"smooth",block:"center"}),this.writeCommentInput(r.input,u),r.input.focus(),this.showStatus("评论草稿已经帮你填好了"),{ok:!0,drafted:!0}):(this.scrollToCommentArea(),R("COMMENT_INPUT_NOT_FOUND",this.findCommentArea()?"当前页面有评论区，但没有找到可写评论输入框":"当前页面没有检测到评论区，无法填写评论"))}submitComment(t){const u=this.fillCommentDraft(t);if(!u.ok)return u;const r=this.findCommentInput(),n=r?.container?this.findCommentSubmitButton(r.container):void 0;return n?(n.click(),this.showStatus("已经尝试提交评论"),{ok:!0,submitted:!0}):R("COMMENT_SUBMIT_NOT_FOUND","没有找到评论提交按钮")}async executeCustomAction(t,u,r){if(t.type==="navigate")return this.navigate(t.url,t.target);if(t.type==="scroll-to")return this.scrollToSelector(t.selector,t.behavior);if(t.type==="highlight")return this.highlight(t.selector,t.duration);if(t.type==="dispatch-event")return window.dispatchEvent(new CustomEvent(t.event,{detail:u})),{ok:!0};const n=sn.get(r);return n?{ok:!0,output:await n({input:u,toolName:r})}:R("TOOL_EXECUTOR_NOT_FOUND","这个站点还没有启用对应能力")}navigate(t,u="_self"){const r=new URL(t,window.location.origin);if(!this.isAllowedUrl(r))return R("URL_NOT_ALLOWED","这个链接不在允许范围内");const n=u==="_blank"&&this.config.toolSecurity.allowNewTab;return this.navigationStarted=!0,n||vt(),window.setTimeout(()=>{n?window.open(r.href,"_blank","noopener,noreferrer"):window.location.assign(r.href)},50),{ok:!0,navigating:!0,pageReload:!n,url:r.href}}scrollToSelector(t,u="smooth"){const r=document.querySelector(t);return r?(r.scrollIntoView?.({behavior:u,block:"center"}),{ok:!0}):R("ELEMENT_NOT_FOUND","没有找到对应的位置")}highlight(t,u=1600){const r=document.querySelector(t);if(!r)return R("ELEMENT_NOT_FOUND","没有找到对应的位置");const n=r.style.outline,i=r.style.outlineOffset;return r.style.outline=`2px solid ${cn}`,r.style.outlineOffset="3px",window.setTimeout(()=>{r.style.outline=n,r.style.outlineOffset=i},u),{ok:!0}}isAllowedUrl(t){return t.protocol!=="http:"&&t.protocol!=="https:"?!1:t.origin===window.location.origin?!0:this.config.toolSecurity.allowedExternalOrigins.includes(t.origin)}requiresApproval(t,u){return t==="always"?!0:t==="never"?!1:u.type==="registered"||u.type==="dispatch-event"?!0:u.type==="navigate"&&u.url?new URL(u.url,window.location.origin).origin!==window.location.origin:!1}ingestToolOutput(t){if(!t||typeof t!="object")return;const u=t;if(Array.isArray(u.resources))for(const r of u.resources)this.ingestResource(r);this.ingestResource(u.resource),this.ingestToolOutput(u.output)}ingestResource(t){if(!t||typeof t!="object")return;const u=t;u.resourceId&&u.permalink&&this.trustedResources.set(u.resourceId,{resourceId:u.resourceId,permalink:u.permalink,title:u.title,resourceType:typeof u.resourceType=="string"?u.resourceType:void 0,metadataName:typeof u.metadataName=="string"?u.metadataName:void 0})}showStatus(t){t&&window.dispatchEvent(new CustomEvent("summaraid:agent-status",{detail:{message:t}}))}findCommentInput(){const t=this.commentContainers();for(const r of t){const n=this.findWritableCommentInput(r);if(n)return{container:r,input:n}}const u=this.findWritableCommentInput(document.body);return u?{container:void 0,input:u}:void 0}commentContainers(){return[...document.querySelectorAll(["#comment","#comments","halo-comment","[data-comment]",".comment",".comments",".comment-form"].join(","))]}findCommentArea(){return this.commentContainers()[0]}collectHeadings(){return[...document.querySelectorAll("h1,h2,h3")].map(t=>({level:Number(t.tagName.slice(1)),text:(t.textContent??"").trim()})).filter(t=>t.text).slice(0,8)}collectFormSummaries(){return[...document.querySelectorAll("form")].map(t=>({id:t.id||void 0,name:t.getAttribute("name")||void 0,fields:[...t.querySelectorAll("input,textarea,select")].map(u=>u.getAttribute("name")||u.getAttribute("aria-label")||u.id).filter(u=>!!u).slice(0,12),submitLabels:[...t.querySelectorAll("button,input[type='submit']")].map(u=>(u.textContent||u.getAttribute("value")||u.getAttribute("aria-label")||"").trim()).filter(u=>u).slice(0,6)})).slice(0,6)}collectLinkSummaries(){return[...document.querySelectorAll("a[href]")].map((t,u)=>({linkId:`link-${u}`,text:(t.textContent??"").trim().replace(/\s+/g," "),href:t.href})).filter(t=>t.text&&this.isAllowedUrl(new URL(t.href))).slice(0,30)}findWritableCommentInput(t){const u=["textarea:not([disabled]):not([readonly])","[contenteditable='true']","[contenteditable='']","input[name='content']:not([disabled]):not([readonly])","input[name='comment']:not([disabled]):not([readonly])"];for(const r of u){const n=this.deepQuerySelector(t,r);if(n&&this.isWritableCommentInput(n))return n}}findCommentSubmitButton(t){const u=["button[type='submit']:not([disabled])","input[type='submit']:not([disabled])","button:not([disabled])","[role='button']:not([aria-disabled='true'])"];for(const r of u){const i=this.deepQuerySelectorAll(t,r).find(o=>{const a=`${o.textContent??""} ${o.getAttribute("aria-label")??""} ${o.getAttribute("value")??""}`.trim();return/提交|评论|发送|发布|回复|submit|send|post|reply/i.test(a)});if(i)return i}}deepQuerySelector(t,u){return this.deepQuerySelectorAll(t,u)[0]}deepQuerySelectorAll(t,u){const r=[],n=i=>{if("querySelectorAll"in i){r.push(...i.querySelectorAll(u));for(const o of[...i.querySelectorAll("*")])o.shadowRoot&&n(o.shadowRoot)}};return n(t),r}isWritableCommentInput(t){return t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement||t instanceof HTMLElement&&t.isContentEditable}writeCommentInput(t,u){t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement?Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t),"value")?.set?.call(t,u):t.textContent=u;const r=typeof InputEvent=="function"?new InputEvent("input",{bubbles:!0,inputType:"insertText",data:u}):new Event("input",{bubbles:!0});t.dispatchEvent(r),t.dispatchEvent(new Event("change",{bubbles:!0}))}}function lc(e){return e.type.startsWith("tool-")}function pu(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function R(e,t){return{ok:!1,errorCode:e,message:t}}function dn(e,t){return["border:none","border-radius:.55rem","padding:.35rem .65rem","font:inherit","font-weight:700",`background:${e}`,`color:${t}`,"cursor:pointer"].join(";")}function dc(e){return e.trim().replace(/^(打开|跳转到?|带我去|看看|查看|进入|去一下|访问)\s*/u,"").replace(/[。！？?!,.，、\s]/gu,"").toLowerCase()}function pn(e){return(e??"").trim().replace(/[。！？?!,.，、\s_-]/gu,"").toLowerCase()}function pc(e){return!(e.length<2||e.length>18||/^(为什么|怎么|如何|什么|是否|能不能|可不可以|介绍|解释|总结|告诉我)/u.test(e))}function fc(e,t){const u=pn(e.title),r=pn(e.metadataName),o=(e.resourceType??"").includes("singlepage")?20:0;return u&&u===t?100+o:r&&r===t?92+o:u&&(t.includes(u)||u.includes(t))&&Math.min(u.length,t.length)>=2?80+o:r&&(t.includes(r)||r.includes(t))&&Math.min(r.length,t.length)>=2?70+o:0}const hc=/^[A-Za-z][A-Za-z0-9_-]*$/;class gc extends un{async*processResponse(t){const u=new Map,r=t.headers.get("X-SummaraidGPT-Trace-Id");let n=0;for await(const i of super.processResponse(t)){if(n+=1,!i?.type?.startsWith("tool-")){yield i;continue}const o=i,a=typeof o.toolCallId=="string"?o.toolCallId:"",s=u.get(a),l=o.toolName==null||typeof o.toolName=="string"&&!o.toolName.trim()?s:o.toolName,d={eventType:i.type,eventIndex:n,toolName:o.toolName,toolCallId:o.toolCallId,previousName:s,traceId:r};if(l==null)throw new fu("missing-name",d);if(typeof l!="string"||!hc.test(l))throw new fu("invalid-name",d);if(s&&s!==l)throw new fu("conflicting-name",d);a.trim()&&u.set(a,l),yield{...i,toolName:l}}}}class fu extends Error{constructor(t,u){const r={"missing-name":"工具调用事件缺少 toolName，且没有同一调用的已知工具名可供补全。","invalid-name":"工具名格式无效：必须以英文字母开头，后续只能包含字母、数字、下划线或连字符。","conflicting-name":"同一个 toolCallId 返回了不同的工具名，已停止本次调用。"};super([`Agent 工具调用协议异常：${r[t]}`,`事件：${Xe(u.eventType)}（第 ${u.eventIndex} 个）`,`工具名：${Xe(u.toolName)}`,`调用 ID：${Xe(u.toolCallId)}`,...u.previousName?[`此前工具名：${Xe(u.previousName)}`]:[],...u.traceId?[`追踪 ID：${Xe(u.traceId)}`]:[],"请站长检查模型的工具调用输出及 AI Foundation 版本，结合服务端日志排查。"].join(`
`)),this.name="AgentToolStreamError",this.reason=t,this.details=u}}function Xe(e){return e==null?"（缺失）":typeof e!="string"?`（类型错误：${typeof e}）`:JSON.stringify(e.length>160?`${e.slice(0,160)}...`:e)}const bc=new Set(["search_halo_resources","get_halo_resource_detail","get_latest_halo_resources","get_categories","get_tags","get_posts_by_category","get_posts_by_tag","get_pages","search_rag_resources","get_rag_resource_detail","fetch_allowed_url"]),mc=6;class fn{async sendMessage(t,u,r={}){const n=new cc(u.agent),i=new Set,o=new Map,a=new Set,s=new Set,c=new Set,l=new Set;let d="";Dc(u.historyMessages??[],c);const h=g=>{const b=g.finally(()=>i.delete(b));return i.add(b),b},f=()=>this.chat?.status==="submitted"||this.chat?.status==="streaming",p=g=>{if(!a.has(g.toolCallId)){if(f()){o.set(g.toolCallId,g);return}return a.add(g.toolCallId),n.canExecute(g.toolName)?h(n.execute(g).then(b=>(At(b)&&vt({displayMode:u.afterNavigationDisplayMode,resume:{historyMessages:Ec(this.chat.messages,g,b)}}),this.chat.addToolOutput({toolCallId:g.toolCallId,toolName:g.toolName,output:b}).then(()=>b))).then(b=>{At(b)&&vt({displayMode:u.afterNavigationDisplayMode,resume:{historyMessages:hu(this.chat.messages)}})}).then(()=>{})):bc.has(g.toolName)?void 0:h(this.chat.addToolOutput({toolCallId:g.toolCallId,toolName:g.toolName,state:"output-error",errorText:"当前页面没有启用这个浏览器能力"}).then(()=>{}))}},w=()=>{if(f()||o.size===0)return;const g=[...o.values()];o.clear(),g.forEach(p)},_=async()=>{for(;(i.size>0||o.size>0)&&(w(),i.size!==0);)await Promise.allSettled([...i])},E=()=>{const g=this.chat;if(!g)return;const b=gu(g.messages);if(b.some(yn))return;const y=xc(b);if(!y.length)return;const T=JSON.stringify(y.map(D=>[D.id,D.title,D.url,D.sourceType]));T!==d&&(d=T,r.onSources?.(y))};this.chat=new R0({id:"summaraid-rag-agent",messages:u.historyMessages??[],transport:new gc({api:`${at}/ragAgentChat`,credentials:"same-origin",body:{conversationId:u.conversationId,visitorId:u.visitorId,recordUserMessage:u.recordUserMessage!==!1,ragEnabledForAgent:u.ragEnabledForAgent===!0},prepareSendMessagesRequest:g=>{for(const b of _n(g.messages,y=>n.canExecute(y.toolName)))l.add(b);return{}}}),onError:g=>{console.error("[summaraidGPT] Agent chat stream failed",g),r.onError?.(g.message)},onToolCall:g=>{if(g.state==="input-available")return p(g)},sendAutomaticallyWhen:({messages:g})=>{const b=_n(g,y=>n.canExecute(y.toolName));return Ac(g,y=>n.canExecute(y.toolName))&&b.some(y=>!l.has(y))},maxAutomaticSteps:5,onFinish:({messages:g,isAbort:b,isError:y})=>{!b&&!y&&r.onFinish?.(g)}});const m=this.chat.subscribe(()=>{const g=this.chat;if(!g)return;const b=g.messages[g.messages.length-1];if(n.ingestMessages(g.messages),Tc(g.messages,c),E(),!b||b.role!=="assistant"){w();return}for(const D of b.parts)vn(D,c),q(D)&&D.state==="input-available"&&p(D),q(D)&&D.state==="approval-requested"&&D.approval?.id&&!s.has(D.approval.id)&&(s.add(D.approval.id),h(n.requestApproval(`要我帮你执行「${D.toolName}」吗？`).then(G=>g.addToolApprovalResponse({id:D.approval?.id,toolCallId:D.toolCallId,toolName:D.toolName,approved:G,reason:G?"Approved by visitor":"Denied by visitor"})).then(()=>{})));const y=n.tryOpenStrongResourceMatch(t);y?.ok&&At(y)&&vt({displayMode:u.afterNavigationDisplayMode,resume:{historyMessages:hu(g.messages)}});const T=Cc(g.messages);T!==void 0&&r.onText?.(T),w()}),x=()=>this.stop();u.signal?.addEventListener("abort",x,{once:!0});try{if(await this.chat.sendMessage({text:t}),w(),await _(),E(),r.onFinish?.(this.chat.messages),this.chat.error)throw this.chat.error;return this.chat.messages}catch(g){throw console.error("[summaraidGPT] Agent chat request failed",g),g}finally{u.signal?.removeEventListener("abort",x),m()}}stop(){this.chat?.stop(),this.chat=void 0}}function xc(e){const t=[];let u=0;const r=o=>{if(!o||typeof o!="object")return;const a=o;if(Array.isArray(a.resources))for(const s of a.resources)hn(s,t,1,u++);hn(a.resource,t,2,u++),r(a.output)};for(const o of e)for(const a of o.parts)q(a)&&a.state==="output-available"&&r(a.output);const n=yc(t),i=n.some(o=>o.priority>=2);return n.filter(o=>!i||o.priority>=2).sort(_c).slice(0,mc).map(o=>o.source)}function hn(e,t,u,r){if(!e||typeof e!="object")return;const n=e,i=se(n.resourceId)||se(n.id);i&&t.push({priority:u,order:r,source:{id:i,title:se(n.title),url:se(n.permalink)||se(n.url),sourceType:se(n.resourceType),content:se(n.excerpt),metadata:{metadataName:se(n.metadataName)||""}}})}function yc(e){const t=[];for(const u of e){const r=gn(u.source),n=t.find(o=>gn(o.source).some(a=>r.includes(a)));if(!n){t.push({...u});continue}const i=n.priority;n.priority=Math.max(n.priority,u.priority),n.order=Math.min(n.order,u.order),(De(u.source)>De(n.source)||De(u.source)===De(n.source)&&u.priority>i)&&(n.source=u.source)}return t}function _c(e,t){return t.priority-e.priority||De(t.source)-De(e.source)||e.order-t.order}function gn(e){return[e.id?`id:${e.id}`:void 0,bn(e.url)?`url:${bn(e.url)}`:void 0,mn(e.title)?`title:${mn(e.title)}`:void 0].filter(t=>!!t)}function De(e){const t=e.sourceType?.toLowerCase()||"";return t.includes("post.content.halo.run")||t.includes("singlepage.content.halo.run")?3:t.includes("ragdocument")?2:e.url?1:0}function bn(e){if(!e)return"";try{const t=new URL(e,window.location.origin);return t.hash="",t.href.replace(/\/$/,"").toLowerCase()}catch{return e.trim().replace(/\/$/,"").toLowerCase()}}function mn(e){return e?.trim().replace(/\s+/g," ").toLowerCase()||""}function xn(e){return wc(e.parts.filter(t=>t.type==="text").map(t=>t.text).join(""))}function wc(e){return e.replace(/<\|tool_calls_section_begin\|>[\s\S]*?(?:<\|tool_calls_section_end\|>|$)/g,"").replace(/<\|tool_call_begin\|>[\s\S]*?(?:<\|tool_call_end\|>|$)/g,"").replace(/<\|tool_call_argument_begin\|>[\s\S]*?(?:<\|tool_call_end\|>|$)/g,"").replace(/<\|tool_[^>\s]*(?:\|>)?/g,"").trimEnd()}function Cc(e){const t=gu(e),u=[...t].reverse().find(i=>i.role==="assistant");if(!u)return;if(!t.some(i=>i.parts.some(o=>q(o))))return xn(u);if(t.some(yn))return"";const n=vc(u);return n<0?xn(u):u.parts.slice(n+1).filter(i=>i.type==="text").map(i=>i.text).join("")}function vc(e){for(let t=e.parts.length-1;t>=0;t-=1)if(q(e.parts[t]))return t;return-1}function yn(e){return e.parts.some(t=>q(t)&&t.state!=="output-available"&&t.state!=="output-error"&&t.state!=="output-denied"&&t.state!=="approval-responded")}function _n(e,t=()=>!0){const u=[...e].reverse().find(n=>n.role==="assistant");if(!u)return[];const r=u.parts.filter(n=>q(n)).filter(t).filter(wn).map(kc);return[...new Set(r)]}function Ac(e,t){const u=[...e].reverse().find(n=>n.role==="assistant");if(!u)return!1;const r=u.parts.filter(n=>q(n)).filter(t);return r.length>0&&r.every(wn)}function wn(e){return Cn(e)||e.state==="approval-responded"}function kc(e){return JSON.stringify({toolCallId:e.toolCallId,toolName:e.toolName,state:e.state,approvalId:e.approval?.id,approved:e.approval?.approved})}function Cn(e){return e.state==="output-available"||e.state==="output-error"||e.state==="output-denied"}function At(e){if(typeof e!="object"||e===null)return!1;const t=e;return t.navigating===!0?t.pageReload!==!1:At(t.output)}function Ec(e,t,u){return hu(e.map(r=>{if(r.role!=="assistant")return r;const n=r.parts.map(i=>!q(i)||i.toolCallId!==t.toolCallId?i:{...i,type:`tool-${t.toolName}`,toolName:t.toolName,toolCallId:t.toolCallId,state:"output-available",output:u});return{...r,parts:n}}))}function hu(e,t){return Sc(X0(e,{maxMessages:t}))}function Sc(e){const t=new Set;return[...e].reverse().map(u=>{if(u.role!=="assistant")return u;const r=[...u.parts].reverse().filter(n=>!q(n)||!Cn(n)?!0:t.has(n.toolCallId)?!1:(t.add(n.toolCallId),!0)).reverse();return r.length===u.parts.length?u:{...u,parts:r}}).reverse().filter(u=>u.parts.length>0)}function q(e){return e.type.startsWith("tool-")}function se(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function gu(e){for(let t=e.length-1;t>=0;t-=1)if(e[t].role==="user")return e.slice(t+1);return e}function Dc(e,t){for(const u of e)for(const r of u.parts)q(r)&&t.add(`${r.toolCallId}:${r.state}`)}function Tc(e,t){for(const u of gu(e))for(const r of u.parts)vn(r,t)}function vn(e,t){if(!q(e))return;const u=`${e.toolCallId}:${e.state}`;if(t.has(u))return;const r=Pc(e);r&&(t.add(u),window.dispatchEvent(new CustomEvent("summaraid:agent-status",{detail:r})))}function Pc(e){if(e.state==="input-available")return{message:Fc(e.toolName),kind:"pending"};if(e.state==="approval-requested")return{message:`等待确认「${Ke(e.toolName)}」`,kind:"warning"};if(e.state==="output-available")return{message:$c(e.toolName,e.output),kind:"success"};if(e.state==="output-error")return{message:`${Ke(e.toolName)}失败`,kind:"error"};if(e.state==="output-denied")return{message:`已取消「${Ke(e.toolName)}」`,kind:"warning"}}function Fc(e){return{get_current_page_context:"正在读取当前页面",search_halo_resources:"正在搜索站内内容",get_halo_resource_detail:"正在读取站内资源",get_latest_halo_resources:"正在查看最新内容",get_categories:"正在查看分类",get_tags:"正在查看标签",get_posts_by_category:"正在查看分类文章",get_posts_by_tag:"正在查看标签文章",get_pages:"正在查找页面",search_rag_resources:"正在检索知识库",get_rag_resource_detail:"正在读取知识库详情",open_halo_resource:"正在打开页面",open_current_page_link:"正在打开当前页链接",open_comment_area:"正在定位评论区",draft_comment:"正在填写评论草稿",submit_comment:"正在提交评论",fetch_allowed_url:"正在读取外部资料"}[e]||`正在执行「${Ke(e)}」`}function $c(e,t){const u=An(t);return e==="search_rag_resources"?u>0?`知识库命中 ${u} 条资料`:"知识库没有命中资料":e==="search_halo_resources"||e==="get_pages"?u>0?`找到 ${u} 个站内资源`:"没有找到匹配资源":e==="get_current_page_context"?"已读取当前页面":e.startsWith("open_")?"页面打开请求已发送":e.includes("comment")?"评论操作已处理":`${Ke(e)}完成`}function Ke(e){return{get_current_page_context:"读取页面",search_halo_resources:"站内搜索",search_rag_resources:"知识库检索",get_rag_resource_detail:"知识库详情",open_halo_resource:"打开页面",open_current_page_link:"打开链接",draft_comment:"评论草稿",submit_comment:"提交评论"}[e]||e.replace(/^tool-/,"").replace(/_/g," ")}function An(e){if(!e||typeof e!="object")return 0;const t=e;return Array.isArray(t.resources)?t.resources.length:t.resource?1:An(t.output)}const kn={ATTRIBUTE:1,CHILD:2},En=e=>(...t)=>({_$litDirective$:e,values:t});let Sn=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,u,r){this._$Ct=t,this._$AM=u,this._$Ci=r}_$AS(t,u){return this.update(t,u)}update(t,u){return this.render(...u)}};class bu extends Sn{constructor(t){if(super(t),this.it=C,t.type!==kn.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===C||t==null)return this._t=void 0,this.it=t;if(t===re)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const u=[t];return u.raw=u,this._t={_$litType$:this.constructor.resultType,strings:u,values:[]}}}bu.directiveName="unsafeHTML",bu.resultType=1;const Dn=En(bu);const Tn="important",Ic=" !"+Tn,Mc=En(class extends Sn{constructor(e){if(super(e),e.type!==kn.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,u)=>{const r=e[u];return r==null?t:t+`${u=u.includes("-")?u:u.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:u}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(const r of this.ft)t[r]==null&&(this.ft.delete(r),r.includes("-")?u.removeProperty(r):u[r]=null);for(const r in t){const n=t[r];if(n!=null){this.ft.add(r);const i=typeof n=="string"&&n.endsWith(Ic);r.includes("-")||i?u.setProperty(r,i?n.slice(0,-11):n,i?Tn:""):u[r]=n}}return re}}),Pn="ri:book-open-line",Fn="https://api.iconify.design",$n=/^([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)$/i;function W(e,t="iconify-icon"){const u=Rc(e)||mu(Pn);return v`
    <span
      class=${t}
      style=${Mc({"--rag-icon-source":`url("${u}")`})}
      aria-hidden="true"
    ></span>
  `}function Rc(e){const t=e?.trim();if(t){if(Nc(t))return mu(t);if(zc(t))return Bc(t);if(Oc(t)||Lc(t))return t}}function Nc(e){return $n.test(e)}function mu(e){const t=e.match($n);if(!t)return mu(Pn);const[,u,r]=t;return`${Fn}/${encodeURIComponent(u)}/${encodeURIComponent(r)}.svg`}function zc(e){return e.startsWith("<svg")&&e.endsWith("</svg>")}function Oc(e){return e.startsWith("data:image/svg+xml")}function Lc(e){try{const t=new URL(e);return t.origin===Fn&&t.pathname.endsWith(".svg")}catch{return!1}}function Bc(e){return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`}function In(){return W("ri:close-line")}function Mn(){return W("ri:send-plane-2-line")}function xu(){return W("ri:chat-new-line")}function Uc(){return W("ri:file-text-line")}function qc(){return W("ri:external-link-line")}function Hc(){return W("ri:fullscreen-line")}function jc(){return W("ri:focus-3-line")}function be(){return W("ri:question-answer-line")}function Rn(){return W("ri:file-copy-line")}function Nn(){return W("ri:refresh-line")}function zn(){return W("ri:stop-circle-line")}function On(e){return v`<div class="pet-source-list">${e.map(t=>Wc(t))}</div>`}function Wc(e){const t=Vc(e),u=v`
    <span class="pet-source-icon">${Uc()}</span>
    <span class="pet-source-main">
      <span class="pet-source-title">${Gc(e)}</span>
      ${t?v`<span class="pet-source-meta">${t}</span>`:C}
    </span>
    ${e.url?v`<span class="pet-source-open">${qc()}</span>`:C}
  `;return e.url?v`
        <a class="pet-source-row" href=${e.url} target="_blank" rel="noopener noreferrer">
          ${u}
        </a>
      `:v`<div class="pet-source-row">${u}</div>`}function Gc(e){const t=e.title?.trim();return t?`《${t}》`:"未命名来源"}function Vc(e){return[Zc(e.sourceType),typeof e.score=="number"?`score ${Yc(e.score)}`:void 0,e.chunkCount?`${e.chunkCount} 分块`:void 0,e.chunkIndexes?.length?`#${e.chunkIndexes.join(", #")}`:void 0].filter(Boolean).join(" · ")}function Zc(e){if(!e)return;const t=e.trim().toLowerCase();return{"ragdocument.summaraidgpt.lik.cc":"RAG 知识库","post.content.halo.run":"站内文章","singlepage.content.halo.run":"独立页面","category.content.halo.run":"分类","tag.content.halo.run":"标签",post:"站内文章",page:"独立页面",docsme:"Docsme 文档",manual:"手动导入",attachment:"附件"}[t]||void 0}function Yc(e){return Number.isFinite(e)?Math.abs(e)>=10?e.toFixed(2):e.toFixed(4):"-"}function Ln(){return v`<span class="typing" aria-label="正在输出"><span></span><span></span><span></span></span>`}function Qc(e){return v`
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
          ${Jc(e)}
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
            ${Hc()}
          </button>
          <button
            class="pet-panel-action"
            type="button"
            title="新会话"
            aria-label="新会话"
            data-tooltip="新会话"
            @click=${e.onNewConversation}
          >
            ${xu()}
          </button>
          ${e.streaming?v`
                <button
                  class="pet-panel-action is-danger"
                  type="button"
                  title="停止生成"
                  aria-label="停止生成"
                  data-tooltip="停止生成"
                  @click=${e.onStop}
                >
                  ${zn()}
                </button>
              `:C}
        </div>
      </div>

      <div class="pet-panel-content">
        ${e.selectedContext?v`
              <div class="pet-context">
                <span>选中内容</span>
                <p>${e.selectedContextPreview}</p>
                <button type="button" title="移除选中内容" @click=${e.onClearSelectedContext}>
                  ${In()}
                </button>
              </div>
            `:C}

        ${e.messages.length?el(e):Kc(e)}
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
          ${Mn()}
        </button>
      </form>
    </section>
  `}function Jc(e){const t=e.assistantAvatar?.trim();return v`
    <span class=${t?"pet-panel-avatar has-image":"pet-panel-avatar"} aria-hidden="true">
      <span class="pet-panel-avatar-fallback">${e.avatarFallbackText}</span>
      ${t?v`
            <img
              class="pet-panel-avatar-image"
              src=${t}
              alt=""
              @error=${Xc}
            />
          `:C}
    </span>
  `}function Xc(e){const t=e.currentTarget;t instanceof HTMLImageElement&&(t.parentElement?.classList.remove("has-image"),t.remove())}function Kc(e){return v`
    <div class="pet-panel-empty">
      <p class="pet-panel-welcome">${e.welcomeMessage}</p>
      ${e.quickQuestions.length?v`
            <div class="pet-panel-quick">
              ${e.quickQuestions.map(t=>v`
                <button type="button" @click=${()=>e.onUsePrompt(t)}>
                  ${be()}<span>${t}</span>
                </button>
              `)}
            </div>
          `:C}
    </div>
  `}function el(e){return v`
    <div class="pet-panel-thread" aria-live="polite">
      ${e.messages.map(t=>tl(t,e))}
    </div>
  `}function tl(e,t){const u=e.sources||[],r=e.content||(e.streaming?"正在思考中...":"");return v`
    <article class=${`pet-panel-message ${e.role}`}>
      <div class="pet-panel-message-meta">
        <span>${e.role==="user"?"我":"助手"}</span>
        <time>${e.time}</time>
        <span class="pet-message-actions">
          <button type="button" title="复制" @click=${()=>t.onCopyMessage(e)}>
            ${Rn()}
          </button>
          <button
            type="button"
            title=${e.role==="assistant"?"重新生成":"再次发送"}
            ?disabled=${t.streaming}
            @click=${()=>t.onRetryMessage(e)}
          >
            ${Nn()}
          </button>
        </span>
      </div>
      <div class=${`pet-panel-bubble${e.error?" error":""}${e.streaming?" streaming":""}`}>
        ${e.role==="assistant"&&!e.error?v`<div class="markdown-body">${Dn(Vr(r))}</div>`:v`<span class="message-text">${r}</span>`}
        ${e.streaming?Ln():C}
      </div>
      ${u.length?v`
            <details class="pet-panel-sources">
              <summary>${be()} ${u.length} 个关联资源</summary>
              ${On(u)}
            </details>
          `:C}
    </article>
  `}function ul(e){return v`
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
            ${be()} 关联资源
          </button>
          <button class="pet-stage-action" type="button" @click=${e.onNewConversation}>
            ${xu()} 新聊
          </button>
          ${e.streaming?v`
                <button class="pet-stage-action is-danger" type="button" @click=${e.onStop}>
                  ${zn()} 停止
                </button>
              `:C}
          <button class="pet-stage-close" type="button" title="关闭" aria-label="关闭" @click=${e.onClose}>
            ${In()}
          </button>
        </div>
      </header>
      <main class="pet-stage-output">
        <div class="pet-stage-output-inner">
          ${e.messages.length?e.messages.map(t=>nl(t,e)):il(e)}
        </div>
      </main>
      <footer class="pet-stage-footer">
        ${rl(e)}
        ${cl(e)}
        <div class="pet-stage-note">内容由 AI 生成，仅供参考</div>
      </footer>
    </section>
  `}function rl(e){return v`
    <div class="pet-stage-shortcuts" aria-label="快捷操作">
      ${e.quickQuestions.map(t=>v`
        <button type="button" @click=${()=>e.onUsePrompt(t)}>
          ${be()}<span>${t}</span>
        </button>
      `)}
      <button type="button" ?disabled=${!e.hasSources} @click=${e.onExpandLatestSources}>
        ${be()}<span>关联资源</span>
      </button>
      <button type="button" @click=${e.onNewConversation}>
        ${xu()}<span>新会话</span>
      </button>
      <button type="button" @click=${e.onClose}>
        ${jc()}<span>收起</span>
      </button>
    </div>
  `}function nl(e,t){const u=e.sources||[];return v`
    <article class=${`pet-stage-message ${e.role}`}>
      ${e.role==="assistant"?Bn(t):C}
      <div class="pet-stage-message-stack">
        <div class=${`pet-stage-bubble${e.error?" error":""}${e.streaming?" streaming":""}`}>
          ${sl(e)}
          ${e.streaming?Ln():C}
        </div>
        <div class="pet-stage-message-actions">
          <button type="button" title="复制" @click=${()=>t.onCopyMessage(e)}>
            ${Rn()}<span>复制</span>
          </button>
          <button
            type="button"
            title=${e.role==="assistant"?"重新生成":"再次发送"}
            ?disabled=${t.streaming}
            @click=${()=>t.onRetryMessage(e)}
          >
            ${Nn()}<span>${e.role==="assistant"?"重试":"再问"}</span>
          </button>
        </div>
        ${e.role==="assistant"?al(u,e.id,t):C}
        <div class="pet-stage-time">${e.time}</div>
      </div>
    </article>
  `}function il(e){return v`
    <div class="pet-stage-message assistant">
      ${Bn(e)}
      <div class="pet-stage-message-stack">
        <div class="pet-stage-bubble">
          <span class="message-text">${e.welcomeMessage}</span>
        </div>
        <div class="pet-stage-time">${e.welcomeTime}</div>
      </div>
    </div>
  `}function Bn(e){const t=e.assistantAvatar?.trim();return v`
    <span class=${t?"pet-stage-avatar has-image":"pet-stage-avatar"} aria-hidden="true">
      <span class="pet-stage-avatar-fallback">${e.avatarFallbackText}</span>
      ${t?v`
            <img
              class="pet-stage-avatar-image"
              src=${t}
              alt=""
              @error=${ol}
            />
          `:C}
    </span>
  `}function ol(e){const t=e.currentTarget;t instanceof HTMLImageElement&&(t.parentElement?.classList.remove("has-image"),t.remove())}function al(e,t,u){return e.length?v`
    <details
      class="pet-stage-sources"
      ?open=${u.isSourceReferencesOpen(t)}
      @toggle=${r=>u.onToggleSourceReferences(t,r)}
    >
      <summary>
        ${be()} <span>${e.length} 个关联资源</span>
      </summary>
      ${On(e)}
    </details>
  `:C}function sl(e){const t=e.content||(e.streaming?"正在思考中...":"");return e.role==="assistant"&&!e.error&&t?v`<div class="message-text markdown-body">${Dn(Vr(t))}</div>`:v`<span class="message-text">${t}</span>`}function cl(e){return v`
    <div class="composer-wrap">
      <form class="composer" @submit=${e.onSubmit}>
        <textarea
          class="conversation-input input"
          rows="1"
          .value=${e.input}
          placeholder=${e.inputPlaceholder||er}
          ?disabled=${e.streaming}
          @input=${e.onInput}
          @keydown=${e.onKeydown}
          @compositionstart=${e.onCompositionStart}
          @compositionend=${e.onCompositionEnd}
        ></textarea>
        <button class="send" type="submit" ?disabled=${e.streaming||!e.input.trim()} aria-label="发送">
          ${Mn()}
        </button>
      </form>
    </div>
  `}function ll(e,t,u="问助手"){return e.visible?v`
    <div
      class="selection-popover"
      style=${`left:${e.x}px;top:${e.y}px`}
    >
      <button type="button" @click=${t}>
        ${be()} ${u}
      </button>
    </div>
  `:C}var dl=Object.defineProperty,pl=Object.getOwnPropertyDescriptor,S=(e,t,u,r)=>{for(var n=r>1?void 0:r?pl(t,u):t,i=e.length-1,o;i>=0;i--)(o=e[i])&&(n=(r?o(t,u,n):o(n))||n);return r&&n&&dl(t,u,n),n};const fl=1600,Un="likcc_summaraidgpt_rag_assistant_position",yu="likcc_summaraidgpt_rag_conversation_id",qn="likcc_summaraidgpt_rag_visitor_id",Hn="likcc_summaraidgpt_rag_panel_height",ce=16,hl=4,Te=318,jn=Te,gl=12;let k=class extends Oe{constructor(){super(...arguments),this.position="right",this.config=_e,this.configLoaded=!1,this.open=!1,this.petPanelOpen=!1,this.input="",this.selectedContext="",this.messages=[],this.agentActivities=[],this.streaming=!1,this.composingInput=!1,this.expandedSourceMessageIds=[],this.selectionPopup=Se,this.floatingPositionReady=!1,this.petSpriteReady=!1,this.draggingBubble=!1,this.petFrameIndex=0,this.petHovering=!1,this.petDragDirection="",this.petErrorUntil=0,this.petSpeechVisible=!1,this.petSpeechIndex=0,this.petSpeechText="",this.petPanelHeight=Te,this.resizingPetPanel=!1,this.agentHistoryMessages=[],this.visitorId=this.loadOrCreateVisitorId(),this.suppressNextBubbleClick=!1,this.floatingPositionLocked=!1,this.petAnimationTimer=0,this.petSpeechTimer=0,this.petSpeechHideTimer=0,this.welcomeTime=ke(),this.handleDocumentMouseUp=()=>{window.setTimeout(()=>this.updateSelectionPopup(),0)},this.handleDocumentKeyUp=()=>{window.setTimeout(()=>this.updateSelectionPopup(),0)},this.handleDocumentMouseDown=e=>{e.composedPath().includes(this)||(this.clearSelectionPopup(),!this.streaming&&!this.open&&(this.petPanelOpen=!1))},this.handleWindowScroll=()=>{this.clearSelectionPopup()},this.handleWindowResize=()=>{this.clampCurrentFloatingPosition(),this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight)},this.handleAgentStatus=e=>{const t=e.detail,u=t?.message?.trim();u&&(this.petSpeechText=u,this.petSpeechVisible=!0,this.appendAgentActivity(u,t?.kind||"pending"))},this.handleBubblePointerMove=e=>{const t=this.bubbleDragState;if(!t||e.pointerId!==t.pointerId)return;const u=e.clientX-t.startX,r=e.clientY-t.startY,n=Math.hypot(u,r);!t.moved&&n<hl||(t.moved=!0,this.draggingBubble=!0,this.petDragDirection=e.clientX>=t.lastX?"right":"left",t.lastX=e.clientX,e.preventDefault(),this.setFloatingPosition(this.clampFloatingPosition({x:t.originX+u,y:t.originY+r},this.bubbleWidth,this.bubbleHeight),!1))},this.handleBubblePointerEnd=e=>{const t=this.bubbleDragState;!t||e.pointerId!==t.pointerId||(t.target.hasPointerCapture(e.pointerId)&&t.target.releasePointerCapture(e.pointerId),this.unbindBubbleDragListeners(),this.bubbleDragState=void 0,this.draggingBubble=!1,this.petDragDirection="",t.moved&&this.floatingPosition&&(e.preventDefault(),this.suppressNextBubbleClick=!0,this.floatingPositionLocked=!0,this.saveFloatingPosition(this.floatingPosition),window.setTimeout(()=>{this.suppressNextBubbleClick=!1},0)))},this.handlePanelResizePointerMove=e=>{const t=this.panelResizeState;if(!t||e.pointerId!==t.pointerId)return;e.preventDefault();const u=e.clientY-t.startY;this.petPanelHeight=this.clampPetPanelHeight(t.startHeight-u)},this.handlePanelResizePointerEnd=e=>{const t=this.panelResizeState;!t||e.pointerId!==t.pointerId||(t.target.hasPointerCapture(e.pointerId)&&t.target.releasePointerCapture(e.pointerId),this.unbindPanelResizeListeners(),this.panelResizeState=void 0,this.resizingPetPanel=!1,this.savePetPanelHeight(this.petPanelHeight))}}connectedCallback(){super.connectedCallback(),this.applyTheme(),this.petPanelHeight=this.clampPetPanelHeight(this.loadSavedPetPanelHeight()),this.floatingPositionLocked=this.applySavedFloatingPosition(),this.bindSelectionListeners(),window.addEventListener("resize",this.handleWindowResize,{passive:!0}),window.addEventListener("summaraid:agent-status",this.handleAgentStatus),this.initializeAssistant()}disconnectedCallback(){super.disconnectedCallback(),this.unbindSelectionListeners(),window.removeEventListener("resize",this.handleWindowResize),window.removeEventListener("summaraid:agent-status",this.handleAgentStatus),this.unbindBubbleDragListeners(),this.unbindPanelResizeListeners(),this.stopPetAnimation(),this.stopPetSpeechCycle(),this.abortCurrentRequest()}updated(e){(e.has("open")||e.has("petPanelOpen")||e.has("streaming"))&&this.syncPetThinkingSpeech(),(e.has("messages")||e.has("petPanelOpen"))&&this.scrollPetPanelToBottom()}openAssistant(e,t=!1){if(this.isPetOnlyMode){this.petPanelOpen=!1,this.open=!1,this.clearSelectionPopup(),this.showNextPetSpeech();return}if(this.petPanelOpen=!0,this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight),this.petSpeechVisible=!1,this.clearSelectionPopup(),e?.trim()){t?this.submitQuestion(e):(this.input=e,this.updateComplete.then(()=>this.focusPetInput()));return}this.updateComplete.then(()=>this.focusPetInput())}render(){return v`
      ${this.renderSelectionPopup()}
      ${this.renderBubble()}
      ${this.open&&!this.isPetOnlyMode?this.renderStage():C}
    `}async loadConfig(){const e=await to();this.config=e,this.configLoaded=!0,this.applyTheme(e),this.floatingPositionLocked?this.clampCurrentFloatingPosition():(this.position=e.buttonPosition,this.applyDefaultFloatingPosition(e)),this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight),this.floatingPositionReady=!0,await this.preparePetSprite(e)}async initializeAssistant(){if(await this.loadConfig(),this.isPetOnlyMode){this.open=!1,this.petPanelOpen=!1,this.clearSelectionPopup();return}await this.loadStoredConversation(),await this.resumeAgentAfterNavigationIfNeeded()}async resumeAgentAfterNavigationIfNeeded(){if(this.isPetOnlyMode)return;const e=rc();e?.openChat&&(this.open=e.displayMode==="stage",this.petPanelOpen=e.displayMode!=="stage",this.petSpeechVisible=!1,this.clearSelectionPopup(),await this.updateComplete,e.focusChatInput&&this.focusCurrentInput(),e.resume&&await this.resumeAgentAfterNavigation(e.resume))}bindSelectionListeners(){document.addEventListener("mouseup",this.handleDocumentMouseUp,{passive:!0}),document.addEventListener("keyup",this.handleDocumentKeyUp,{passive:!0}),document.addEventListener("mousedown",this.handleDocumentMouseDown),window.addEventListener("scroll",this.handleWindowScroll,{passive:!0})}unbindSelectionListeners(){document.removeEventListener("mouseup",this.handleDocumentMouseUp),document.removeEventListener("keyup",this.handleDocumentKeyUp),document.removeEventListener("mousedown",this.handleDocumentMouseDown),window.removeEventListener("scroll",this.handleWindowScroll)}renderBubble(){if(!this.canRenderFloatingPet)return C;const e=this.petPanelOpen?"":this.getCurrentPetSpeech();return v`
      <span class=${this.petPanelOpen?"bubble-wrapper panel-open":"bubble-wrapper"}>
        ${this.petPanelOpen&&!this.open?this.renderPetPanel():C}
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
          ${e?v`<span class=${this.petSpeechVisible?"pet-speech visible":"pet-speech"}>${e}</span>`:C}
          <span class="pet-sprite" style=${this.petSpriteStyle} aria-hidden="true"></span>
        </button>
      </span>
    `}renderPetPanel(){return Qc({assistantName:this.assistantName,assistantAvatar:this.config.assistantAvatar,avatarFallbackText:this.avatarFallbackText,streaming:this.streaming,statusText:this.panelStatusText,selectedContext:this.selectedContext,selectedContextPreview:this.selectedContextPreview,messages:this.messages,welcomeMessage:this.welcomeMessage,quickQuestions:this.quickQuestions,input:this.input,petInputPlaceholder:this.petInputPlaceholder,panelStyle:this.petPanelStyle,resizing:this.resizingPetPanel,onOpenStage:()=>this.openPetStage(),onResizePointerDown:e=>this.handlePetPanelResizePointerDown(e),onNewConversation:()=>this.newConversation(),onUsePrompt:e=>this.usePrompt(e),onStop:()=>this.stopCurrentResponse(),onCopyMessage:e=>this.copyMessage(e),onRetryMessage:e=>this.retryMessage(e),onClearSelectedContext:()=>this.clearSelectedContext(),onSubmit:e=>this.handleSubmit(e),onInput:e=>this.handleInput(e),onKeydown:e=>this.handleInputKeydown(e),onCompositionStart:()=>this.handleCompositionStart(),onCompositionEnd:()=>this.handleCompositionEnd()})}renderStage(){return ul({assistantName:this.assistantName,assistantAvatar:this.config.assistantAvatar,avatarFallbackText:this.avatarFallbackText,messages:this.messages,statusText:this.panelStatusText,welcomeMessage:this.welcomeMessage,welcomeTime:this.welcomeTime,quickQuestions:this.quickQuestions,input:this.input,inputPlaceholder:this.petInputPlaceholder,streaming:this.streaming,hasSources:this.hasLatestSources,isSourceReferencesOpen:e=>this.isSourceReferencesOpen(e),onToggleSourceReferences:(e,t)=>this.toggleSourceReferences(e,t),onClose:()=>this.close(),onNewConversation:()=>this.newConversation(),onExpandLatestSources:()=>this.expandLatestSources(),onUsePrompt:e=>this.usePrompt(e),onStop:()=>this.stopCurrentResponse(),onCopyMessage:e=>this.copyMessage(e),onRetryMessage:e=>this.retryMessage(e),onSubmit:e=>this.handleSubmit(e),onInput:e=>this.handleInput(e),onKeydown:e=>this.handleInputKeydown(e),onCompositionStart:()=>this.handleCompositionStart(),onCompositionEnd:()=>this.handleCompositionEnd()})}renderSelectionPopup(){return this.isPetOnlyMode?C:ll(this.selectionPopup,()=>this.askWithSelection(),this.selectionActionLabel)}handleSubmit(e){e.preventDefault(),this.submitQuestion(this.input)}handleInput(e){const t=e.currentTarget;t instanceof HTMLTextAreaElement&&(this.input=t.value,this.resizeInput(t))}handleCompositionStart(){this.composingInput=!0}handleCompositionEnd(){this.composingInput=!1}handleInputKeydown(e){e.key!=="Enter"||e.shiftKey||this.streaming||e.isComposing||this.composingInput||e.keyCode===229||(e.preventDefault(),this.submitQuestion(this.input))}handleBubblePointerDown(e){if(!e.isPrimary||e.button!==0)return;const t=e.currentTarget;if(!(t instanceof HTMLElement))return;const u=t.getBoundingClientRect(),r=this.currentFloatingPosition(u);this.bubbleDragState={pointerId:e.pointerId,target:t,startX:e.clientX,startY:e.clientY,originX:r.x,originY:r.y,lastX:e.clientX,moved:!1},this.petSpeechVisible=!1,e.preventDefault(),t.setPointerCapture(e.pointerId),t.addEventListener("pointermove",this.handleBubblePointerMove),t.addEventListener("pointerup",this.handleBubblePointerEnd),t.addEventListener("pointercancel",this.handleBubblePointerEnd)}handleBubbleClick(e){if(this.suppressNextBubbleClick){e.preventDefault(),e.stopPropagation();return}if(this.isPetOnlyMode){this.petPanelOpen=!1,this.open=!1,this.petSpeechVisible?this.petSpeechVisible=!1:this.showNextPetSpeech();return}this.petPanelOpen=!this.petPanelOpen,this.petSpeechVisible=!1,this.petPanelOpen&&(this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight),this.updateComplete.then(()=>this.focusPetInput()))}unbindBubbleDragListeners(){const e=this.bubbleDragState?.target;e&&(e.removeEventListener("pointermove",this.handleBubblePointerMove),e.removeEventListener("pointerup",this.handleBubblePointerEnd),e.removeEventListener("pointercancel",this.handleBubblePointerEnd))}handlePetPanelResizePointerDown(e){if(!e.isPrimary||e.button!==0)return;const t=e.currentTarget;if(!(t instanceof HTMLElement))return;const u=t.closest(".pet-panel");if(!(u instanceof HTMLElement))return;const r=u.getBoundingClientRect();this.panelResizeState={pointerId:e.pointerId,target:t,startY:e.clientY,startHeight:r.height||this.petPanelHeight},this.resizingPetPanel=!0,e.preventDefault(),e.stopPropagation(),t.setPointerCapture(e.pointerId),t.addEventListener("pointermove",this.handlePanelResizePointerMove),t.addEventListener("pointerup",this.handlePanelResizePointerEnd),t.addEventListener("pointercancel",this.handlePanelResizePointerEnd)}unbindPanelResizeListeners(){const e=this.panelResizeState?.target;e&&(e.removeEventListener("pointermove",this.handlePanelResizePointerMove),e.removeEventListener("pointerup",this.handlePanelResizePointerEnd),e.removeEventListener("pointercancel",this.handlePanelResizePointerEnd))}applySavedFloatingPosition(){const e=this.loadSavedFloatingPosition();return e?(this.setFloatingPosition(this.clampFloatingPosition(e),!1),!0):!1}applyDefaultFloatingPosition(e){this.setFloatingPosition(this.clampFloatingPosition(this.defaultFloatingPosition(e)),!1)}currentFloatingPosition(e){return this.floatingPosition?this.floatingPosition:e&&Number.isFinite(e.left)&&Number.isFinite(e.top)?{x:e.left,y:e.top}:this.defaultFloatingPosition(this.config)}defaultFloatingPosition(e){const t=this.normalizeFloatingOffset(e.horizontalOffset),u=this.normalizeFloatingOffset(e.verticalOffset);return{x:e.buttonPosition==="left"?t:window.innerWidth-this.bubbleWidth-t,y:window.innerHeight-this.bubbleHeight-u}}clampCurrentFloatingPosition(){if(!this.floatingPosition)return;const e=this.clampFloatingPosition(this.floatingPosition,this.bubbleWidth,this.bubbleHeight);(e.x!==this.floatingPosition.x||e.y!==this.floatingPosition.y)&&this.setFloatingPosition(e,!0)}clampFloatingPosition(e,t=this.bubbleWidth,u=this.bubbleHeight){const r=Math.max(ce,window.innerWidth-t-ce),n=Math.max(ce,window.innerHeight-u-ce);return{x:this.clamp(e.x,ce,r),y:this.clamp(e.y,ce,n)}}clampPetPanelHeight(e){const t=Number.isFinite(e)?e:Te;return this.clamp(t,jn,this.maxPetPanelHeight())}maxPetPanelHeight(){const t=(this.floatingPosition?.y??this.defaultFloatingPosition(this.config).y)-gl,u=window.innerHeight-ce*2;return Math.max(jn,Math.min(u,t-ce))}setFloatingPosition(e,t){this.floatingPosition=e,this.position=e.x+this.bubbleWidth/2<window.innerWidth/2?"left":"right",this.style.left=`${Math.round(e.x)}px`,this.style.top=`${Math.round(e.y)}px`,this.style.right="auto",this.style.bottom="auto",this.petPanelHeight=this.clampPetPanelHeight(this.petPanelHeight),t&&this.saveFloatingPosition(e)}applyTheme(e=this.config){qi(this,e.styleConfig)}async preparePetSprite(e){this.stopPetAnimation(),this.stopPetSpeechCycle(),this.petSpriteReady=!1,this.petSpeechVisible=!1,this.petSpeechText="";const t=e.pet?.spritesheetUrl?.trim();if(t)try{if(await this.preloadImage(t),this.petSpriteUrl!==t)return;this.petSpriteReady=!0,this.startPetAnimation(),this.startPetSpeechCycle()}catch{this.petSpriteUrl===t&&(this.petSpriteReady=!1)}}preloadImage(e){return new Promise((t,u)=>{const r=new Image;let n=!1;const i=o=>{n||(n=!0,o())};r.onload=()=>i(()=>t()),r.onerror=()=>i(()=>u(new Error("Pet spritesheet failed to load"))),r.src=e})}startPetAnimation(){this.petAnimationTimer||!this.canRenderFloatingPet||(this.petAnimationTimer=window.setInterval(()=>{this.petFrameIndex=(this.petFrameIndex+1)%Bu(this.petAnimationState).length},150))}stopPetAnimation(){this.petAnimationTimer&&(window.clearInterval(this.petAnimationTimer),this.petAnimationTimer=0)}startPetSpeechCycle(){this.petSpeechTimer||!this.canRenderFloatingPet||(window.setTimeout(()=>this.showNextPetSpeech(),1600),this.petSpeechTimer=window.setInterval(()=>this.showNextPetSpeech(),15e3))}stopPetSpeechCycle(){this.petSpeechTimer&&(window.clearInterval(this.petSpeechTimer),this.petSpeechTimer=0),this.petSpeechHideTimer&&(window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=0)}showNextPetSpeech(){if(!this.canShowPetSpeech()){this.petSpeechVisible=!1;return}if(this.isPetThinkingOutsideWindow()){this.showPetThinkingSpeech();return}const e=this.petSpeechMessages;this.petSpeechText=e[this.petSpeechIndex%e.length]||"",this.petSpeechVisible=!0,this.petSpeechHideTimer&&window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=window.setTimeout(()=>{this.petSpeechVisible=!1,this.petSpeechHideTimer=0},7200),this.petSpeechIndex=(this.petSpeechIndex+1)%e.length}syncPetThinkingSpeech(){if(!this.canRenderFloatingPet){this.petSpeechVisible=!1,this.petSpeechText="";return}if(this.isPetThinkingOutsideWindow()){this.showPetThinkingSpeech();return}this.petSpeechText===Lu&&(this.petSpeechVisible=!1,this.petSpeechText="")}showPetThinkingSpeech(){this.draggingBubble||(this.petSpeechText=Lu,this.petSpeechVisible=!0,this.petSpeechHideTimer&&(window.clearTimeout(this.petSpeechHideTimer),this.petSpeechHideTimer=0))}canShowPetSpeech(){return this.canRenderFloatingPet&&!this.open&&!this.petPanelOpen&&!this.draggingBubble&&(this.isPetThinkingOutsideWindow()||this.petSpeechMessages.length>0)}isPetThinkingOutsideWindow(){return!this.open&&!this.petPanelOpen&&this.streaming}handlePetMouseEnter(){this.petHovering=!0}handlePetMouseLeave(){this.petHovering=!1}triggerPetError(){this.canRenderFloatingPet&&(this.petErrorUntil=Date.now()+3600,this.petFrameIndex=0)}loadSavedFloatingPosition(){try{const e=window.localStorage.getItem(Un);if(!e)return;const t=JSON.parse(e);if(typeof t.x=="number"&&Number.isFinite(t.x)&&typeof t.y=="number"&&Number.isFinite(t.y))return{x:Number(t.x),y:Number(t.y)}}catch{return}}saveFloatingPosition(e){try{window.localStorage.setItem(Un,JSON.stringify(e))}catch{}}loadSavedPetPanelHeight(){try{const e=window.localStorage.getItem(Hn),t=e?Number(e):Te;return Number.isFinite(t)?t:Te}catch{return Te}}savePetPanelHeight(e){try{window.localStorage.setItem(Hn,String(Math.round(this.clampPetPanelHeight(e))))}catch{}}async submitQuestion(e){if(this.isPetOnlyMode)return;const t=e.trim();if(!t||this.streaming)return;if(!this.canUseAssistantChat){this.showLoginRequiredMessage();return}if(!this.canUseSelectedChatMode){this.showChatModeUnavailableMessage();return}const u=this.selectedContext.trim(),r=u?`请结合我选中的内容回答：

${u}

我的问题：${t}`:t,n=u?`${t}

选中内容：${this.truncateText(u,180)}`:t,i=Qe();this.input="",this.selectedContext="",this.petPanelOpen=!0,this.streaming=!0,this.agentActivities=[],this.appendAgentActivity(this.useAgentChat?"正在准备 Agent":"正在检索知识库","pending"),this.abortController=new AbortController,this.messages=[...this.messages,Ee("user",n),Ee("assistant","",{id:i,streaming:!0})],await this.updateComplete,this.resizeInput(this.inputElement),this.resizeInput(this.petInputElement),this.scrollToBottom();try{this.useAgentChat?await this.askAgentStream(r,i):await this.askRagStream(r,i)}catch(o){if(this.abortController.signal.aborted)return;const a=o instanceof Error?o.message:"智能助手回答失败";this.failAssistantMessage(i,`抱歉，暂时无法回答，请稍后重试。${a?`（${a}）`:""}`)}finally{this.finishAssistantMessage(i),this.streaming=!1,this.abortController=void 0,this.agentChatClient=void 0,await this.updateComplete,this.scrollToBottom()}}async askAgentStream(e,t){this.appendAgentActivity("正在调用 Agent","pending");const u=new fn;this.agentChatClient=u;const r=this.ensureConversationId();try{const n=await u.sendMessage(e,{agent:this.config.agent,historyMessages:this.agentHistoryMessages,conversationId:r,visitorId:this.visitorId,ragEnabledForAgent:this.shouldAttachRagToAgent,afterNavigationDisplayMode:this.open?"stage":"panel",signal:this.abortController?.signal},{onText:i=>this.setAssistantContent(t,i),onSources:i=>this.receiveSources(t,i),onError:i=>{if(this.isAgentToolCallStreamProtocolError(i)){this.appendAgentActivity("当前模型的工具调用流格式不兼容","warning");return}this.failAssistantMessage(t,i)},onFinish:i=>{this.agentHistoryMessages=i}});this.agentHistoryMessages=n}catch(n){if(!this.isAgentToolCallStreamProtocolError(n))throw n;if(u.stop(),this.agentChatClient=void 0,!this.canFallbackToRagChat)throw new Error("当前模型的工具调用流格式不兼容，无法继续使用 Agent 模式");this.resetAssistantMessageForFallback(t),this.appendAgentActivity("已切换为知识库问答模式","warning"),await this.askRagStream(e,t)}}async resumeAgentAfterNavigation(e){if(this.isPetOnlyMode||this.streaming||!this.useAgentChat)return;const t=Qe();this.petPanelOpen=!0,this.streaming=!0,this.abortController=new AbortController,this.agentActivities=[],this.appendAgentActivity("页面已打开，正在继续回答","pending"),this.messages=[...this.messages,Ee("assistant","",{id:t,streaming:!0})],await this.updateComplete,this.scrollToBottom();const u=new fn;this.agentChatClient=u;try{const r=await u.sendMessage(e.message,{agent:this.config.agent,historyMessages:e.historyMessages,conversationId:this.ensureConversationId(),visitorId:this.visitorId,recordUserMessage:!1,ragEnabledForAgent:this.shouldAttachRagToAgent,afterNavigationDisplayMode:this.open?"stage":"panel",signal:this.abortController.signal},{onText:n=>this.setAssistantContent(t,n),onSources:n=>this.receiveSources(t,n),onError:n=>{if(this.isAgentToolCallStreamProtocolError(n)){this.appendAgentActivity("当前模型的工具调用流格式不兼容","warning");return}this.failAssistantMessage(t,n)},onFinish:n=>{this.agentHistoryMessages=n}});this.agentHistoryMessages=r}catch(r){if(!this.abortController.signal.aborted){if(this.isAgentToolCallStreamProtocolError(r)){if(u.stop(),this.agentChatClient=void 0,!this.canFallbackToRagChat){this.failAssistantMessage(t,"当前模型的工具调用流格式不兼容，无法继续使用 Agent 模式");return}this.resetAssistantMessageForFallback(t),this.appendAgentActivity("已切换为知识库问答模式","warning"),await this.askRagStream(e.message,t);return}const n=r instanceof Error?r.message:"Agent 恢复回答失败";this.failAssistantMessage(t,n)}}finally{this.finishAssistantMessage(t),this.streaming=!1,this.abortController=void 0,this.agentChatClient=void 0,await this.updateComplete,this.scrollToBottom()}}async askRagStream(e,t){if(!this.useRagChat)throw new Error("当前模式没有启用 RAG 知识库问答");await uo({question:e,limit:go,conversationId:this.conversationId,visitorId:this.visitorId},{onConversationId:u=>this.persistConversationId(u),onSources:u=>{this.appendAgentActivity(u.length?`知识库命中 ${u.length} 个来源`:"知识库没有命中来源",u.length?"success":"warning"),this.receiveSources(t,u)},onDelta:u=>this.appendAssistantDelta(t,u),onError:u=>this.failAssistantMessage(t,u),onDone:()=>this.finishAssistantMessage(t)},this.abortController?.signal)}receiveSources(e,t){t.length&&(this.updateMessage(e,u=>({...u,sources:t})),this.appendAgentActivity(`已关联 ${t.length} 个资源`,"success"))}appendAgentActivity(e,t="pending"){const u=e.trim();if(!u)return;const r=this.agentActivities[this.agentActivities.length-1];r?.message===u&&r.kind===t||(this.agentActivities=[...this.agentActivities,{id:Qe(),message:u,kind:t,time:ke()}].slice(-8),this.updateComplete.then(()=>this.scrollPetPanelToBottom()))}async loadStoredConversation(){const e=this.loadConversationId();if(e)try{const t=await ro(e,this.visitorId);if(!t){this.clearConversationId();return}this.conversationId=t.metadata.name,this.messages=this.toAssistantMessages(t),this.agentHistoryMessages=this.toAgentHistoryMessages(t),await this.updateComplete,this.scrollToBottom()}catch{this.clearConversationId()}}toAssistantMessages(e){return(e.spec?.messages||[]).filter(t=>t.role==="user"||t.role==="assistant").filter(t=>!!t.content?.trim()).map(t=>Ee(t.role,t.content||"",{id:t.id,time:this.messageTime(t),sources:t.sources,error:t.error}))}toAgentHistoryMessages(e){return(e.spec?.messages||[]).filter(t=>t.role==="user"||t.role==="assistant").filter(t=>!!t.content?.trim()).map(t=>{const u=t.id||Qe();return{id:u,role:t.role==="assistant"?"assistant":"user",parts:[{type:"text",id:`${u}-text`,text:t.content||""}]}})}messageTime(e){if(!e.createdAt)return ke();const t=new Date(e.createdAt);return Number.isNaN(t.getTime())?ke():ke(t)}persistConversationId(e){if(e.trim()){this.conversationId=e;try{window.localStorage.setItem(yu,e)}catch{}}}ensureConversationId(){if(this.conversationId)return this.conversationId;const e=this.loadConversationId();if(e)return this.conversationId=e,e;const t=`rag-conv-${this.randomId().toLowerCase()}`;return this.persistConversationId(t),t}loadConversationId(){try{return window.localStorage.getItem(yu)||void 0}catch{return}}loadOrCreateVisitorId(){try{const e=window.localStorage.getItem(qn);if(e)return e;const t=`rag-visitor-${this.randomId()}`;return window.localStorage.setItem(qn,t),t}catch{return`rag-visitor-${this.randomId()}`}}randomId(){return window.crypto?.randomUUID?window.crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}clearConversationId(){this.conversationId=void 0;try{window.localStorage.removeItem(yu)}catch{}}setAssistantContent(e,t){this.updateMessage(e,u=>({...u,content:t})),this.updateComplete.then(()=>this.scrollToBottom())}appendAssistantDelta(e,t){t&&(this.updateMessage(e,u=>({...u,content:`${u.content}${t}`})),this.updateComplete.then(()=>this.scrollToBottom()))}failAssistantMessage(e,t){this.triggerPetError(),this.updateMessage(e,u=>({...u,content:t,error:!0,streaming:!1})),this.streaming=!1}resetAssistantMessageForFallback(e){this.updateMessage(e,t=>({...t,content:"",error:!1,streaming:!0,sources:void 0}))}isAgentToolCallStreamProtocolError(e){const t=typeof e=="string"?e:e instanceof Error?e.message:String(e??"");return/tool-call stream part toolCallId must not be blank|toolCallId must not be blank/i.test(t)}showLoginRequiredMessage(){const e="请登录后再使用智能助手。",t=this.messages[this.messages.length-1];this.petPanelOpen=!0,this.petSpeechVisible=!1,this.appendAgentActivity("请登录后再使用智能助手","warning"),!(t?.role==="assistant"&&t.content===e)&&(this.messages=[...this.messages,Ee("assistant",e,{error:!0})],this.updateComplete.then(()=>this.scrollPetPanelToBottom()))}showChatModeUnavailableMessage(){const e=this.chatModeUnavailableMessage,t=this.messages[this.messages.length-1];this.petPanelOpen=!0,this.petSpeechVisible=!1,this.appendAgentActivity(e,"warning"),!(t?.role==="assistant"&&t.content===e)&&(this.messages=[...this.messages,Ee("assistant",e,{error:!0})],this.updateComplete.then(()=>this.scrollPetPanelToBottom()))}finishAssistantMessage(e){this.updateMessage(e,t=>({...t,content:t.content||(t.error?t.content:"未找到相关资料，可尝试换个问题。"),streaming:!1}))}updateMessage(e,t){this.messages=Ks(this.messages,e,t)}toggleSourceReferences(e,t){const u=t.currentTarget;if(!(u instanceof HTMLDetailsElement))return;const r=new Set(this.expandedSourceMessageIds);u.open?r.add(e):r.delete(e),this.expandedSourceMessageIds=Array.from(r)}close(){this.open=!1,this.clearSelectionPopup()}newConversation(){this.isPetOnlyMode||(this.abortCurrentRequest(),this.clearConversationId(),this.agentHistoryMessages=[],this.messages=[],this.agentActivities=[],this.input="",this.selectedContext="",this.streaming=!1,this.petPanelOpen=!0,this.updateComplete.then(()=>this.focusCurrentInput()))}askWithSelection(){if(this.isPetOnlyMode){this.clearSelectionPopup();return}const e=this.selectionPopup.text.trim();e&&(this.selectedContext=e,this.petPanelOpen=!0,this.petSpeechVisible=!1,this.clearSelectionPopup(),this.updateComplete.then(()=>this.focusPetInput()))}updateSelectionPopup(){if(this.isPetOnlyMode){this.selectionPopup=Se;return}this.selectionPopup=e0(fl)}clearSelectionPopup(){this.selectionPopup.visible&&(this.selectionPopup=Se)}resizeInput(e){e&&(e.style.height="auto",e.style.height=`${Math.min(Math.max(e.scrollHeight,38),118)}px`)}focusInput(){this.inputElement?.focus()}focusPetInput(){this.petInputElement?.focus()}focusCurrentInput(){if(this.open){this.focusInput();return}this.focusPetInput()}openPetStage(){this.isPetOnlyMode||(this.open=!0,this.petPanelOpen=!1,this.updateComplete.then(()=>{this.scrollToBottom(),this.focusInput()}))}clearSelectedContext(){this.selectedContext="",this.updateComplete.then(()=>this.focusPetInput())}expandLatestSources(){const e=this.latestAssistantMessageWithSources?.id;if(!e)return;const t=new Set(this.expandedSourceMessageIds);t.add(e),this.expandedSourceMessageIds=Array.from(t),this.open=!0,this.updateComplete.then(()=>this.scrollToBottom())}usePrompt(e){e&&(this.input=e),this.updateComplete.then(()=>this.focusCurrentInput())}scrollToBottom(){this.messagesElement&&(this.messagesElement.scrollTop=this.messagesElement.scrollHeight)}scrollPetPanelToBottom(){this.updateComplete.then(()=>{this.petPanelThreadElement&&(this.petPanelThreadElement.scrollTop=this.petPanelThreadElement.scrollHeight)})}abortCurrentRequest(){this.agentChatClient?.stop(),this.agentChatClient=void 0,!(!this.abortController||this.abortController.signal.aborted)&&this.abortController.abort()}stopCurrentResponse(){if(!this.streaming)return;const e=[...this.messages].reverse().find(t=>t.role==="assistant"&&t.streaming);e&&this.updateMessage(e.id,t=>({...t,content:t.content||"已停止生成。",streaming:!1})),this.appendAgentActivity("已停止生成","warning"),this.streaming=!1,this.abortCurrentRequest()}async copyMessage(e){const t=e.content.trim();if(t)try{if(!navigator.clipboard?.writeText)throw new Error("Clipboard API is unavailable");await navigator.clipboard.writeText(t),this.appendAgentActivity("已复制到剪贴板","success")}catch{this.appendAgentActivity("复制失败，请手动选择文本","error")}}retryMessage(e){if(this.streaming)return;const t=e.role==="user"?e.content:this.previousUserQuestion(e.id);t.trim()&&this.submitQuestion(t)}previousUserQuestion(e){const t=this.messages.findIndex(u=>u.id===e);if(t<=0)return"";for(let u=t-1;u>=0;u-=1){const r=this.messages[u];if(r.role==="user"&&r.content.trim())return r.content}return""}clamp(e,t,u){return Math.min(Math.max(e,t),u)}normalizeFloatingOffset(e){return Number.isFinite(e)?Math.max(0,e):_e.horizontalOffset}isSourceReferencesOpen(e){return this.expandedSourceMessageIds.includes(e)}get assistantName(){return this.config.assistantName||_e.assistantName}get isPetOnlyMode(){return this.config.displayMode==="petOnly"}get isRagAgentMode(){return this.config.displayMode==="ragAgent"}get isRagOnlyMode(){return this.config.displayMode==="rag"}get isAgentOnlyMode(){return this.config.displayMode==="agent"}get canUseAssistantChat(){return this.config.access.allowAnonymous||this.config.access.authenticated}get canUseSelectedChatMode(){return this.useAgentChat||this.useRagChat}get canFallbackToRagChat(){return this.isRagAgentMode&&this.useRagChat}get petInputPlaceholder(){return this.canUseAssistantChat?this.canUseSelectedChatMode?this.selectedContext?"想问这段内容什么？":this.isAgentOnlyMode?"请输入要让助手处理的问题...":this.isRagAgentMode?"请输入问题，助手会按需使用站点工具或知识库...":er:this.chatModeUnavailableMessage:"请登录后使用智能助手"}get selectedContextPreview(){return this.truncateText(this.selectedContext,120)}get petPanelStyle(){return`--rag-pet-panel-height:${Math.round(this.clampPetPanelHeight(this.petPanelHeight))}px`}get latestAssistantMessageWithSources(){return[...this.messages].reverse().find(e=>e.role==="assistant"&&!!e.sources?.length)}get hasLatestSources(){return!!this.latestAssistantMessageWithSources}get panelStatusText(){const e=this.agentActivities[this.agentActivities.length-1]?.message;return this.streaming&&e?e:this.streaming?"正在找答案":"想问我什么？"}get useAgentChat(){return(this.isRagAgentMode||this.isAgentOnlyMode)&&this.config.agent?.enabled!==!1&&this.config.access.agentAllowed!==!1}get useRagChat(){return(this.isRagAgentMode||this.isRagOnlyMode)&&this.config.ragEnabled!==!1}get shouldAttachRagToAgent(){return this.isRagAgentMode&&this.config.ragEnabled!==!1}get chatModeUnavailableMessage(){if(this.isPetOnlyMode)return"当前为纯宠物模式，不提供问答面板。";if(this.isRagOnlyMode&&this.config.ragEnabled===!1)return"当前为 RAG 模式，但 RAG 知识库未启用。";if(this.isAgentOnlyMode){if(this.config.agent?.enabled===!1)return"当前为 Agent 模式，但 Agent 能力未启用。";if(this.config.access.agentAllowed===!1)return"当前访问模式未开放 Agent。"}if(this.isRagAgentMode){if(this.config.agent?.enabled===!1&&this.config.ragEnabled===!1)return"当前为知识库问答 + Agent 模式，但知识库问答和 Agent 都未启用。";if(this.config.agent?.enabled!==!1&&this.config.access.agentAllowed===!1&&this.config.ragEnabled===!1)return"当前访问模式未开放 Agent，且知识库问答未启用。"}return"当前前台显示模式暂不可用，请联系站长检查配置。"}get selectionActionLabel(){return this.isRagOnlyMode?"问知识库":"问助手"}get avatarFallbackText(){return Array.from(this.assistantName.trim())[0]||"智"}get petSize(){return this.config.petSize||It}get petMetrics(){return Fi(this.petSize)}get bubbleWidth(){return this.petMetrics.width}get bubbleHeight(){return this.petMetrics.height}get petButtonStyle(){const e=this.petMetrics;return[`--rag-pet-width:${e.width}px`,`--rag-pet-height:${e.height}px`,`--rag-pet-sheet-width:${e.sheetWidth}px`,`--rag-pet-sheet-height:${e.sheetHeight}px`].join(";")}get petSpriteStyle(){const e=this.petMetrics,t=$i(this.petAnimationState,this.petFrameIndex);return[`background-image:url("${this.escapeCssUrl(this.petSpriteUrl)}")`,`--rag-pet-frame-x:${-t.col*e.width}px`,`--rag-pet-frame-y:${-t.row*e.height}px`].join(";")}get petAnimationState(){return{errorActive:this.petErrorUntil>Date.now(),direction:this.petDragDirection,thinking:this.isPetThinkingOutsideWindow(),hovering:this.petHovering}}get petSpeechMessages(){const e=this.config.petSpeechMessages||[];return e.length?e:$t}get quickQuestions(){return(this.config.quickQuestions||[]).filter(t=>t.trim()).slice(0,8)}getCurrentPetSpeech(){return this.petSpeechText}get hasActivePet(){return!!this.config.pet?.spritesheetUrl}get canRenderFloatingPet(){return this.configLoaded&&this.floatingPositionReady&&this.hasActivePet&&this.petSpriteReady}get petSpriteUrl(){return this.config.pet?.spritesheetUrl||""}escapeCssUrl(e){return e.replace(/["\\\n\r\f]/g,"")}truncateText(e,t){const u=e.replace(/\s+/g," ").trim();return u.length<=t?u:`${u.slice(0,Math.max(0,t-1))}…`}get welcomeMessage(){return(this.config.welcomeMessage||_e.welcomeMessage).replace("{assistantName}",this.assistantName)}};k.styles=Xs,S([Ou({type:String,reflect:!0})],k.prototype,"position",2),S([F()],k.prototype,"config",2),S([F()],k.prototype,"configLoaded",2),S([F()],k.prototype,"open",2),S([F()],k.prototype,"petPanelOpen",2),S([F()],k.prototype,"input",2),S([F()],k.prototype,"selectedContext",2),S([F()],k.prototype,"messages",2),S([F()],k.prototype,"agentActivities",2),S([F()],k.prototype,"streaming",2),S([F()],k.prototype,"expandedSourceMessageIds",2),S([F()],k.prototype,"selectionPopup",2),S([F()],k.prototype,"floatingPosition",2),S([F()],k.prototype,"floatingPositionReady",2),S([F()],k.prototype,"petSpriteReady",2),S([F()],k.prototype,"draggingBubble",2),S([F()],k.prototype,"petFrameIndex",2),S([F()],k.prototype,"petHovering",2),S([F()],k.prototype,"petDragDirection",2),S([F()],k.prototype,"petErrorUntil",2),S([F()],k.prototype,"petSpeechVisible",2),S([F()],k.prototype,"petSpeechIndex",2),S([F()],k.prototype,"petSpeechText",2),S([F()],k.prototype,"petPanelHeight",2),S([F()],k.prototype,"resizingPetPanel",2),S([it(".pet-stage-output")],k.prototype,"messagesElement",2),S([it(".conversation-input")],k.prototype,"inputElement",2),S([it(".pet-composer-input")],k.prototype,"petInputElement",2),S([it(".pet-panel-thread")],k.prototype,"petPanelThreadElement",2),k=S([bi("summaraid-rag-assistant")],k);const Wn="summaraid-rag-assistant";function bl(){window.likcc_summaraidGPT_ragAssistantLoaded||(console.log("%c智阅GPT-前台智能助手","color: #1f1f1f; font-size: 16px; font-weight: bold;"),console.log("%c支持宠物陪伴、知识库问答和 Agent 工具调用","color: #8a6f38; font-size: 12px;"),window.likcc_summaraidGPT_ragAssistantLoaded=!0)}async function _u(){if(!document.body)return;const e=document.querySelector(Wn);if(e)return e;const t=document.createElement(Wn);return document.body.appendChild(t),t}async function ml(e){(await _u())?.openAssistant(e)}function Gn(){window.setTimeout(()=>{_u()},0)}bl(),window.likcc_summaraidGPT_initRagAssistant=_u,window.likcc_summaraidGPT_openRagAssistant=ml,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Gn,{once:!0}):Gn()}));
