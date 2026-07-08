(function(T){typeof define=="function"&&define.amd?define(T):T()})((function(){"use strict";const T=globalThis,X=T.ShadowRoot&&(T.ShadyCSS===void 0||T.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,J=Symbol(),oe=new WeakMap;let ce=class{constructor(e,i,r){if(this._$cssResult$=!0,r!==J)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=i}get styleSheet(){let e=this.o;const i=this.t;if(X&&e===void 0){const r=i!==void 0&&i.length===1;r&&(e=oe.get(i)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&oe.set(i,e))}return e}toString(){return this.cssText}};const ze=t=>new ce(typeof t=="string"?t:t+"",void 0,J),le=(t,...e)=>{const i=t.length===1?t[0]:e.reduce((r,a,s)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+t[s+1],t[0]);return new ce(i,t,J)},De=(t,e)=>{if(X)t.adoptedStyleSheets=e.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(const i of e){const r=document.createElement("style"),a=T.litNonce;a!==void 0&&r.setAttribute("nonce",a),r.textContent=i.cssText,t.appendChild(r)}},de=X?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let i="";for(const r of e.cssRules)i+=r.cssText;return ze(i)})(t):t;const{is:Ue,defineProperty:Be,getOwnPropertyDescriptor:Fe,getOwnPropertyNames:He,getOwnPropertySymbols:je,getPrototypeOf:Ve}=Object,B=globalThis,he=B.trustedTypes,qe=he?he.emptyScript:"",Ye=B.reactiveElementPolyfillSupport,O=(t,e)=>t,F={toAttribute(t,e){switch(e){case Boolean:t=t?qe:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=t!==null;break;case Number:i=t===null?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch{i=null}}return i}},Z=(t,e)=>!Ue(t,e),me={attribute:!0,type:String,converter:F,reflect:!1,useDefault:!1,hasChanged:Z};Symbol.metadata??=Symbol("metadata"),B.litPropertyMetadata??=new WeakMap;let C=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,i=me){if(i.state&&(i.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(e,i),!i.noAccessor){const r=Symbol(),a=this.getPropertyDescriptor(e,r,i);a!==void 0&&Be(this.prototype,e,a)}}static getPropertyDescriptor(e,i,r){const{get:a,set:s}=Fe(this.prototype,e)??{get(){return this[i]},set(n){this[i]=n}};return{get:a,set(n){const o=a?.call(this);s?.call(this,n),this.requestUpdate(e,o,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??me}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;const e=Ve(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){const i=this.properties,r=[...He(i),...je(i)];for(const a of r)this.createProperty(a,i[a])}const e=this[Symbol.metadata];if(e!==null){const i=litPropertyMetadata.get(e);if(i!==void 0)for(const[r,a]of i)this.elementProperties.set(r,a)}this._$Eh=new Map;for(const[i,r]of this.elementProperties){const a=this._$Eu(i,r);a!==void 0&&this._$Eh.set(a,i)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const i=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const a of r)i.unshift(de(a))}else e!==void 0&&i.push(de(e));return i}static _$Eu(e,i){const r=i.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,i=this.constructor.elementProperties;for(const r of i.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return De(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,i,r){this._$AK(e,r)}_$ET(e,i){const r=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,r);if(a!==void 0&&r.reflect===!0){const s=(r.converter?.toAttribute!==void 0?r.converter:F).toAttribute(i,r.type);this._$Em=e,s==null?this.removeAttribute(a):this.setAttribute(a,s),this._$Em=null}}_$AK(e,i){const r=this.constructor,a=r._$Eh.get(e);if(a!==void 0&&this._$Em!==a){const s=r.getPropertyOptions(a),n=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:F;this._$Em=a;const o=n.fromAttribute(i,s.type);this[a]=o??this._$Ej?.get(a)??o,this._$Em=null}}requestUpdate(e,i,r,a=!1,s){if(e!==void 0){const n=this.constructor;if(a===!1&&(s=this[e]),r??=n.getPropertyOptions(e),!((r.hasChanged??Z)(s,i)||r.useDefault&&r.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,i,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,i,{useDefault:r,reflect:a,wrapped:s},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??i??this[e]),s!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(i=void 0),this._$AL.set(e,i)),a===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(i){Promise.reject(i)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[a,s]of this._$Ep)this[a]=s;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[a,s]of r){const{wrapped:n}=s,o=this[a];n!==!0||this._$AL.has(a)||o===void 0||this.C(a,void 0,s,o)}}let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(i)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(i)}willUpdate(e){}_$AE(e){this._$EO?.forEach(i=>i.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(i=>this._$ET(i,this[i])),this._$EM()}updated(e){}firstUpdated(e){}};C.elementStyles=[],C.shadowRootOptions={mode:"open"},C[O("elementProperties")]=new Map,C[O("finalized")]=new Map,Ye?.({ReactiveElement:C}),(B.reactiveElementVersions??=[]).push("2.1.2");const K=globalThis,pe=t=>t,H=K.trustedTypes,ue=H?H.createPolicy("lit-html",{createHTML:t=>t}):void 0,ge="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+$,We=`<${fe}>`,S=document,G=()=>S.createComment(""),I=t=>t===null||typeof t!="object"&&typeof t!="function",ee=Array.isArray,Qe=t=>ee(t)||typeof t?.[Symbol.iterator]=="function",te=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,be=/-->/g,ke=/>/g,A=RegExp(`>|${te}(?:([^\\s"'>=/]+)(${te}*=${te}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ye=/'/g,ve=/"/g,we=/^(?:script|style|textarea|title)$/i,xe=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),m=xe(1),Xe=xe(2),_=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),$e=new WeakMap,P=S.createTreeWalker(S,129);function Te(t,e){if(!ee(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return ue!==void 0?ue.createHTML(e):e}const Je=(t,e)=>{const i=t.length-1,r=[];let a,s=e===2?"<svg>":e===3?"<math>":"",n=L;for(let o=0;o<i;o++){const c=t[o];let l,p,d=-1,y=0;for(;y<c.length&&(n.lastIndex=y,p=n.exec(c),p!==null);)y=n.lastIndex,n===L?p[1]==="!--"?n=be:p[1]!==void 0?n=ke:p[2]!==void 0?(we.test(p[2])&&(a=RegExp("</"+p[2],"g")),n=A):p[3]!==void 0&&(n=A):n===A?p[0]===">"?(n=a??L,d=-1):p[1]===void 0?d=-2:(d=n.lastIndex-p[2].length,l=p[1],n=p[3]===void 0?A:p[3]==='"'?ve:ye):n===ve||n===ye?n=A:n===be||n===ke?n=L:(n=A,a=void 0);const w=n===A&&t[o+1].startsWith("/>")?" ":"";s+=n===L?c+We:d>=0?(r.push(l),c.slice(0,d)+ge+c.slice(d)+$+w):c+$+(d===-2?o:w)}return[Te(t,s+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};class R{constructor({strings:e,_$litType$:i},r){let a;this.parts=[];let s=0,n=0;const o=e.length-1,c=this.parts,[l,p]=Je(e,i);if(this.el=R.createElement(l,r),P.currentNode=this.el.content,i===2||i===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(a=P.nextNode())!==null&&c.length<o;){if(a.nodeType===1){if(a.hasAttributes())for(const d of a.getAttributeNames())if(d.endsWith(ge)){const y=p[n++],w=a.getAttribute(d).split($),x=/([.?@])?(.*)/.exec(y);c.push({type:1,index:s,name:x[2],strings:w,ctor:x[1]==="."?Ke:x[1]==="?"?et:x[1]==="@"?tt:j}),a.removeAttribute(d)}else d.startsWith($)&&(c.push({type:6,index:s}),a.removeAttribute(d));if(we.test(a.tagName)){const d=a.textContent.split($),y=d.length-1;if(y>0){a.textContent=H?H.emptyScript:"";for(let w=0;w<y;w++)a.append(d[w],G()),P.nextNode(),c.push({type:2,index:++s});a.append(d[y],G())}}}else if(a.nodeType===8)if(a.data===fe)c.push({type:2,index:s});else{let d=-1;for(;(d=a.data.indexOf($,d+1))!==-1;)c.push({type:7,index:s}),d+=$.length-1}s++}}static createElement(e,i){const r=S.createElement("template");return r.innerHTML=e,r}}function E(t,e,i=t,r){if(e===_)return e;let a=r!==void 0?i._$Co?.[r]:i._$Cl;const s=I(e)?void 0:e._$litDirective$;return a?.constructor!==s&&(a?._$AO?.(!1),s===void 0?a=void 0:(a=new s(t),a._$AT(t,i,r)),r!==void 0?(i._$Co??=[])[r]=a:i._$Cl=a),a!==void 0&&(e=E(t,a._$AS(t,e.values),a,r)),e}class Ze{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:i},parts:r}=this._$AD,a=(e?.creationScope??S).importNode(i,!0);P.currentNode=a;let s=P.nextNode(),n=0,o=0,c=r[0];for(;c!==void 0;){if(n===c.index){let l;c.type===2?l=new z(s,s.nextSibling,this,e):c.type===1?l=new c.ctor(s,c.name,c.strings,this,e):c.type===6&&(l=new it(s,this,e)),this._$AV.push(l),c=r[++o]}n!==c?.index&&(s=P.nextNode(),n++)}return P.currentNode=S,a}p(e){let i=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,i),i+=r.strings.length-2):r._$AI(e[i])),i++}}class z{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,i,r,a){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=r,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&e?.nodeType===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=E(this,e,i),I(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==_&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Qe(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&I(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){const{values:i,_$litType$:r}=e,a=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=R.createElement(Te(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===a)this._$AH.p(i);else{const s=new Ze(a,this),n=s.u(this.options);s.p(i),this.T(n),this._$AH=s}}_$AC(e){let i=$e.get(e.strings);return i===void 0&&$e.set(e.strings,i=new R(e)),i}k(e){ee(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let r,a=0;for(const s of e)a===i.length?i.push(r=new z(this.O(G()),this.O(G()),this,this.options)):r=i[a],r._$AI(s),a++;a<i.length&&(this._$AR(r&&r._$AB.nextSibling,a),i.length=a)}_$AR(e=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);e!==this._$AB;){const r=pe(e).nextSibling;pe(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class j{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,r,a,s){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=i,this._$AM=a,this.options=s,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=h}_$AI(e,i=this,r,a){const s=this.strings;let n=!1;if(s===void 0)e=E(this,e,i,0),n=!I(e)||e!==this._$AH&&e!==_,n&&(this._$AH=e);else{const o=e;let c,l;for(e=s[0],c=0;c<s.length-1;c++)l=E(this,o[r+c],i,c),l===_&&(l=this._$AH[c]),n||=!I(l)||l!==this._$AH[c],l===h?e=h:e!==h&&(e+=(l??"")+s[c+1]),this._$AH[c]=l}n&&!a&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ke extends j{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}}class et extends j{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}}class tt extends j{constructor(e,i,r,a,s){super(e,i,r,a,s),this.type=5}_$AI(e,i=this){if((e=E(this,e,i,0)??h)===_)return;const r=this._$AH,a=e===h&&r!==h||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,s=e!==h&&(r===h||a);a&&this.element.removeEventListener(this.name,this,r),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class it{constructor(e,i,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}}const rt=K.litHtmlPolyfillSupport;rt?.(R,z),(K.litHtmlVersions??=[]).push("3.3.2");const at=(t,e,i)=>{const r=i?.renderBefore??e;let a=r._$litPart$;if(a===void 0){const s=i?.renderBefore??null;r._$litPart$=a=new z(e.insertBefore(G(),s),s,void 0,i??{})}return a._$AI(t),a};const ie=globalThis;let N=class extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=at(i,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}};N._$litElement$=!0,N.finalized=!0,ie.litElementHydrateSupport?.({LitElement:N});const st=ie.litElementPolyfillSupport;st?.({LitElement:N}),(ie.litElementVersions??=[]).push("4.2.2");const nt={ATTRIBUTE:1},ot=t=>(...e)=>({_$litDirective$:t,values:e});let ct=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,r){this._$Ct=e,this._$AM=i,this._$Ci=r}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};const Se="important",lt=" !"+Se,Ae=ot(class extends ct{constructor(t){if(super(t),t.type!==nt.ATTRIBUTE||t.name!=="style"||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,i)=>{const r=t[i];return r==null?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(t,[e]){const{style:i}=t.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(const r of this.ft)e[r]==null&&(this.ft.delete(r),r.includes("-")?i.removeProperty(r):i[r]=null);for(const r in e){const a=e[r];if(a!=null){this.ft.add(r);const s=typeof a=="string"&&a.endsWith(lt);r.includes("-")||s?i.setProperty(r,s?a.slice(0,-11):a,s?Se:""):i[r]=a}}return _}});const _e=t=>(e,i)=>{i!==void 0?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};const dt={attribute:!0,type:String,converter:F,reflect:!1,hasChanged:Z},ht=(t=dt,e,i)=>{const{kind:r,metadata:a}=i;let s=globalThis.litPropertyMetadata.get(a);if(s===void 0&&globalThis.litPropertyMetadata.set(a,s=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),r==="accessor"){const{name:n}=i;return{set(o){const c=e.get.call(this);e.set.call(this,o),this.requestUpdate(n,c,t,!0,o)},init(o){return o!==void 0&&this.C(n,void 0,t,o),o}}}if(r==="setter"){const{name:n}=i;return function(o){const c=this[n];e.call(this,o),this.requestUpdate(n,c,t,!0,o)}}throw Error("Unsupported decorator location: "+r)};function v(t){return(e,i)=>typeof i=="object"?ht(t,e,i):((r,a,s)=>{const n=a.hasOwnProperty(s);return a.constructor.createProperty(s,r),n?Object.getOwnPropertyDescriptor(a,s):void 0})(t,e,i)}function g(t){return v({...t,state:!0,attribute:!1})}const mt=le`
  :host {
    display: block;
    width: 100%;
    --likcc-summaraid-bg: #f7f9fe;
    --likcc-summaraid-main: #425AEF;
    --likcc-summaraid-title: #363636;
    --likcc-summaraid-content: #222;
    --likcc-summaraid-gptName: #999999;
    --likcc-summaraid-contentBg: #fff;
    --likcc-summaraid-border: #e3e8f7;
    --likcc-summaraid-shadow: 0 4px 24px rgba(66, 90, 239, 0.08);
    --likcc-summaraid-tagBg: #f0f4ff;
    --likcc-summaraid-tagColor: #425AEF;
    --likcc-summaraid-cursor: #425AEF;
    --likcc-summaraid-contentFontSize: 14px;
  }

  .likcc-summaraidGPT-summary--dark {
    --likcc-summaraid-bg: #23272e;
    --likcc-summaraid-main: #90caf9;
    --likcc-summaraid-title: #fff;
    --likcc-summaraid-content: #e3e8f7;
    --likcc-summaraid-gptName: #b0b8c9;
    --likcc-summaraid-contentBg: #2a2d32;
    --likcc-summaraid-border: #444;
    --likcc-summaraid-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.18);
    --likcc-summaraid-tagBg: rgba(255, 255, 255, 0.12);
    --likcc-summaraid-tagColor: #7ca6ff;
    --likcc-summaraid-cursor: #90caf9;
  }

  .likcc-summaraidGPT-summary--default {
    --likcc-summaraid-bg: #f7f9fe;
    --likcc-summaraid-main: #4F8DFD;
    --likcc-summaraid-title: #3A5A8C;
    --likcc-summaraid-content: #222;
    --likcc-summaraid-gptName: #7B88A8;
    --likcc-summaraid-contentBg: #fff;
    --likcc-summaraid-border: #e3e8f7;
    --likcc-summaraid-shadow: 0 2px 12px 0 rgba(60, 80, 180, 0.08);
    --likcc-summaraid-tagBg: #f0f4ff;
    --likcc-summaraid-tagColor: #4F8DFD;
    --likcc-summaraid-cursor: #4F8DFD;
  }

  .likcc-summaraidGPT-summary--blue {
    --likcc-summaraid-bg: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    --likcc-summaraid-main: #1976d2;
    --likcc-summaraid-title: #1976d2;
    --likcc-summaraid-content: #22577a;
    --likcc-summaraid-gptName: #fff;
    --likcc-summaraid-contentBg: #fafdff;
    --likcc-summaraid-border: #90caf9;
    --likcc-summaraid-shadow: 0 2px 12px 0 rgba(66, 165, 245, 0.1);
    --likcc-summaraid-tagBg: linear-gradient(90deg, #b3e5fc 0%, #e3f2fd 100%);
    --likcc-summaraid-tagColor: #1976d2;
    --likcc-summaraid-cursor: #1976d2;
  }

  .likcc-summaraidGPT-summary--green {
    --likcc-summaraid-bg: linear-gradient(135deg, #e0f7fa 0%, #a5d6a7 100%);
    --likcc-summaraid-main: #43a047;
    --likcc-summaraid-title: #2e7d32;
    --likcc-summaraid-content: #225744;
    --likcc-summaraid-gptName: #fff;
    --likcc-summaraid-contentBg: #fafdff;
    --likcc-summaraid-border: #a5d6a7;
    --likcc-summaraid-shadow: 0 2px 12px 0 rgba(67, 160, 71, 0.1);
    --likcc-summaraid-tagBg: linear-gradient(90deg, #b2dfdb 0%, #e0f7fa 100%);
    --likcc-summaraid-tagColor: #43a047;
    --likcc-summaraid-cursor: #43a047;
  }

  .likcc-summaraidGPT-fixed {
    --likcc-summaraid-fixed-accent: #5f67f8;
    --likcc-summaraid-fixed-accent-soft: rgba(95, 103, 248, 0.1);
    --likcc-summaraid-fixed-accent-faint: rgba(95, 103, 248, 0.04);
    --likcc-summaraid-fixed-line: rgba(95, 103, 248, 0.18);
    --likcc-summaraid-fixed-text: #273142;
    --likcc-summaraid-fixed-muted: #667085;
    --likcc-summaraid-fixed-surface: #ffffff;
    --likcc-summaraid-fixed-shell-y: 0.72rem;
    --likcc-summaraid-fixed-shell-x: 0.92rem;
    --likcc-summaraid-fixed-gap: 0.52rem;
    --likcc-summaraid-fixed-title-size: 0.76rem;
    --likcc-summaraid-fixed-content-size: 0.96rem;
    --likcc-summaraid-fixed-content-line: 1.68;
  }

  .likcc-summaraidGPT-tone--graphite {
    --likcc-summaraid-fixed-accent: #27303f;
    --likcc-summaraid-fixed-accent-soft: rgba(39, 48, 63, 0.09);
    --likcc-summaraid-fixed-accent-faint: rgba(39, 48, 63, 0.035);
    --likcc-summaraid-fixed-line: rgba(39, 48, 63, 0.16);
  }

  .likcc-summaraidGPT-tone--copper {
    --likcc-summaraid-fixed-accent: #b4682d;
    --likcc-summaraid-fixed-accent-soft: rgba(180, 104, 45, 0.12);
    --likcc-summaraid-fixed-accent-faint: rgba(180, 104, 45, 0.04);
    --likcc-summaraid-fixed-line: rgba(180, 104, 45, 0.2);
  }

  .likcc-summaraidGPT-density--comfortable {
    --likcc-summaraid-fixed-shell-y: 0.94rem;
    --likcc-summaraid-fixed-shell-x: 1.08rem;
    --likcc-summaraid-fixed-gap: 0.64rem;
    --likcc-summaraid-fixed-title-size: 0.82rem;
    --likcc-summaraid-fixed-content-size: 1rem;
    --likcc-summaraid-fixed-content-line: 1.74;
  }

  .likcc-summaraidGPT-fixed--dark {
    --likcc-summaraid-fixed-accent: #8fa0ff;
    --likcc-summaraid-fixed-accent-soft: rgba(143, 160, 255, 0.14);
    --likcc-summaraid-fixed-accent-faint: rgba(143, 160, 255, 0.07);
    --likcc-summaraid-fixed-line: rgba(143, 160, 255, 0.26);
    --likcc-summaraid-fixed-text: #e8edf7;
    --likcc-summaraid-fixed-muted: #aab6cc;
    --likcc-summaraid-fixed-surface: #171c25;
  }

  .likcc-summaraidGPT-simple-container,
  .likcc-summaraidGPT-inline-container {
    margin: 0.16rem 0 0.1rem;
  }

  .likcc-summaraidGPT-simple-icon,
  .likcc-summaraidGPT-inline-icon {
    width: 0.92rem;
    height: 0.92rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }

  .likcc-summaraidGPT-simple-icon svg,
  .likcc-summaraidGPT-inline-icon svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  .likcc-summaraidGPT-simple-title,
  .likcc-summaraidGPT-inline-title {
    font-size: var(--likcc-summaraid-fixed-title-size);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-wrap: pretty;
  }

  .likcc-summaraidGPT-simple-content,
  .likcc-summaraidGPT-inline-content {
    color: var(--likcc-summaraid-fixed-text);
    font-size: var(--likcc-summaraid-fixed-content-size);
    line-height: var(--likcc-summaraid-fixed-content-line);
    letter-spacing: 0;
    word-break: break-word;
  }

  .likcc-summaraidGPT-simple-shell {
    background: var(--likcc-summaraid-fixed-surface);
    border: 1px solid var(--likcc-summaraid-fixed-line);
    border-radius: 1.15rem;
    padding: calc(var(--likcc-summaraid-fixed-shell-y) + 0.18rem)
      calc(var(--likcc-summaraid-fixed-shell-x) + 0.14rem);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  }

  .likcc-summaraidGPT-simple-header,
  .likcc-summaraidGPT-inline-header {
    display: flex;
    align-items: center;
    gap: 0.42rem;
    color: var(--likcc-summaraid-fixed-accent);
  }

  .likcc-summaraidGPT-simple-header {
    margin-bottom: 0.76rem;
  }

  .likcc-summaraidGPT-simple-title {
    font-size: calc(var(--likcc-summaraid-fixed-title-size) + 0.18rem);
    letter-spacing: 0.04em;
    text-transform: none;
  }

  .likcc-summaraidGPT-simple-content {
    font-size: calc(var(--likcc-summaraid-fixed-content-size) + 0.16rem);
    line-height: calc(var(--likcc-summaraid-fixed-content-line) + 0.08);
    letter-spacing: 0;
    text-wrap: pretty;
  }

  .likcc-summaraidGPT-inline-header {
    margin-bottom: 0.34rem;
  }

  .likcc-summaraidGPT-inline-header {
    position: relative;
  }

  .likcc-summaraidGPT-inline-shell {
    padding-top: 0.12rem;
  }

  .likcc-summaraidGPT-inline-header::after {
    content: '';
    flex: 1;
    min-width: 28px;
    height: 1px;
    margin-left: 0.18rem;
    background: linear-gradient(90deg, var(--likcc-summaraid-fixed-line) 0%, rgba(255, 255, 255, 0) 100%);
  }

  .likcc-summaraidGPT-summary-container {
    width: 100%;
    box-sizing: border-box;
    border-radius: 0.7rem;
    background: var(--likcc-summaraid-bg, rgba(250, 245, 255, 0.85));
    border: 1px solid var(--likcc-summaraid-border, #f3e6f9);
    box-shadow: var(--likcc-summaraid-shadow, 0 1px 4px 0 rgba(177, 108, 234, 0.04));
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    z-index: 0;
    line-height: 1.5;
    padding: 0.5rem;
    font-size: 0.98rem;
    transition: box-shadow 0.25s, background 0.2s, transform 0.18s;
    opacity: 0;
    transform: translateY(12px);
    animation: likcc-summaraidGPT-fadein 0.7s cubic-bezier(0.4, 1.4, 0.6, 1) forwards;
    margin: 0.25rem 0;
  }

  .likcc-summaraidGPT-summary-container:hover {
    box-shadow: 0 10px 32px 0 rgba(60, 80, 180, 0.13), 0 2px 8px 0 rgba(60, 80, 180, 0.07);
    transform: translateY(-1.5px) scale(1.01);
  }

  .likcc-summaraidGPT-summary-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }

  .likcc-summaraidGPT-header-left {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .likcc-summaraidGPT-logo {
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 0.3rem;
    background: #fff;
    border: 1px solid var(--likcc-summaraid-border, #f3e6f9);
    object-fit: cover;
  }

  .likcc-summaraidGPT-summary-title {
    font-weight: 600;
    font-size: 0.97rem;
    color: var(--likcc-summaraid-title, #5a3a7a);
    margin-right: 0.4rem;
    text-wrap: pretty;
  }

  .likcc-summaraidGPT-gpt-name {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--likcc-summaraid-tagColor, var(--likcc-summaraid-gptName, #a16cea));
    background: var(--likcc-summaraid-tagBg, linear-gradient(90deg, #b3e5fc 0%, #e3f2fd 100%));
    border-radius: 0.35rem;
    padding: 1px 7px;
    margin-left: auto;
    min-width: 24px;
    position: relative;
    overflow: hidden;
    box-shadow: none;
  }

  .likcc-summaraidGPT-gpt-name::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(66, 90, 239, 0.13), transparent);
    animation: likcc-summaraidGPT-shine 3s infinite linear;
    pointer-events: none;
  }

  .likcc-summaraidGPT-summary-content {
    background: var(--likcc-summaraid-contentBg, rgba(255, 255, 255, 0.92));
    border-radius: 0.45rem;
    padding: 0.4rem 0.4rem 0.3rem;
    font-size: var(--likcc-summaraid-contentFontSize, 14px);
    color: var(--likcc-summaraid-content, #4b2e5c);
    border: 1px solid var(--likcc-summaraid-border, #f3e6f9);
    margin: 0;
    word-break: break-word;
    line-height: 1.85;
    box-shadow: var(--likcc-summaraid-shadow, none);
    transition: background 0.3s, box-shadow 0.2s;
    opacity: 0;
    transform: translateY(6px);
    animation: likcc-summaraidGPT-contentin 0.7s 0.12s cubic-bezier(0.4, 1.4, 0.6, 1) forwards;
  }

  .likcc-summaraidGPT-cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: var(--likcc-summaraid-cursor);
    margin-left: 2px;
    animation: likcc-summaraidGPT-blink 1.1s steps(1, end) infinite;
    vertical-align: middle;
    border-radius: 1px;
  }

  @media (max-width: 768px) {
    .likcc-summaraidGPT-simple-shell {
      border-radius: 0.98rem;
      padding: calc(var(--likcc-summaraid-fixed-shell-y) + 0.06rem) calc(var(--likcc-summaraid-fixed-shell-x) - 0.04rem);
    }

    .likcc-summaraidGPT-simple-header {
      margin-bottom: 0.62rem;
    }

    .likcc-summaraidGPT-inline-title {
      font-size: 0.74rem;
    }

    .likcc-summaraidGPT-simple-title {
      font-size: 0.98rem;
    }

    .likcc-summaraidGPT-simple-content {
      font-size: 1rem;
      line-height: 1.76;
    }

    .likcc-summaraidGPT-inline-content {
      font-size: 0.92rem;
      line-height: 1.66;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .likcc-summaraidGPT-summary-container,
    .likcc-summaraidGPT-summary-content,
    .likcc-summaraidGPT-gpt-name::before,
    .likcc-summaraidGPT-cursor {
      animation: none !important;
      transition: none !important;
      transform: none !important;
      opacity: 1 !important;
    }

    .likcc-summaraidGPT-summary-container:hover {
      transform: none;
    }
  }

  @keyframes likcc-summaraidGPT-fadein {
    0% {
      opacity: 0;
      transform: translateY(12px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes likcc-summaraidGPT-contentin {
    0% {
      opacity: 0;
      transform: translateY(6px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes likcc-summaraidGPT-shine {
    0% {
      left: -100%;
    }
    20% {
      left: 100%;
    }
    100% {
      left: 100%;
    }
  }

  @keyframes likcc-summaraidGPT-blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }
`,D="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",U={bg:"#f7f9fe",main:"#4F8DFD",contentFontSize:"16px",title:"#3A5A8C",content:"#222",gptName:"#7B88A8",contentBg:"#fff",border:"#e3e8f7",shadow:"0 2px 12px 0 rgba(60,80,180,0.08)",tagBg:"#f0f4ff",tagColor:"#4F8DFD",cursor:"#4F8DFD"},re={logo:"icon.svg",summaryTitle:"文章摘要",gptName:"智阅GPT",typeSpeed:20,darkSelector:"",uiStyle:"simple",fixedTone:"violet",fixedDensity:"compact",themeName:"custom",theme:U,typewriter:!0};function pt(t){if(!t)return{...U};if(typeof t=="string")try{const e=JSON.parse(t);return{...U,...e}}catch{return{...U}}return{...U,...t}}function Pe(t){const e=document.documentElement,i=document.body,r=window.matchMedia?.("(prefers-color-scheme: dark)").matches??!1,a=e.getAttribute("data-color-scheme")||i.getAttribute("data-color-scheme");if(a==="dark")return!0;if(a==="light")return!1;if(a==="auto")return r;const s=e.getAttribute("data-theme")||i.getAttribute("data-theme")||e.getAttribute("data-mode")||i.getAttribute("data-mode")||e.getAttribute("data-bs-theme")||i.getAttribute("data-bs-theme");if(s==="dark")return!0;if(s==="light")return!1;if(s==="auto"||s==="system")return r;if(e.classList.contains("color-scheme-dark")||i.classList.contains("color-scheme-dark")||e.classList.contains("dark")||i.classList.contains("dark"))return!0;if(e.classList.contains("color-scheme-light")||i.classList.contains("color-scheme-light")||e.classList.contains("light")||i.classList.contains("light"))return!1;if(e.classList.contains("color-scheme-auto")||i.classList.contains("color-scheme-auto")||!t)return r;const n=t.match(/^data-([\w-]+)=(.+)$/);if(n){const c=`data-${n[1]}`,l=n[2];return e.getAttribute(c)===l||i.getAttribute(c)===l}const o=t.match(/^class=(.+)$/);if(o){const c=o[1];return e.classList.contains(c)||i.classList.contains(c)}return e.classList.contains(t)||i.classList.contains(t)}function Ce(t,e){const i=document.documentElement,r=document.body,a={attributes:!0,attributeFilter:["class","data-color-scheme","data-theme","data-mode","data-bs-theme"]},s=t.match(/^data-([\w-]+)=(.+)$/);s&&(a.attributeFilter=["class","data-color-scheme","data-theme","data-mode","data-bs-theme",`data-${s[1]}`]);const n=new MutationObserver(e),o=new MutationObserver(e);return n.observe(i,a),o.observe(r,a),[n,o]}async function ut(){try{const t=await fetch(`${D}/summaryConfig`);if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);const e=await t.json();return{...re,...e,theme:e.theme??re.theme}}catch{return{...re}}}async function Ee(t){const e=await fetch(`${D}/updateContent`,{method:"POST",headers:{"Content-Type":"application/json"},body:t});if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);return await e.json()}function gt(t){return t?t.startsWith("http://")||t.startsWith("https://")||t.startsWith("/")||t.startsWith("data:")?t:`/plugins/summaraidGPT/assets/static/${t}`:""}var ft=Object.defineProperty,bt=Object.getOwnPropertyDescriptor,f=(t,e,i,r)=>{for(var a=r>1?void 0:r?bt(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(a=(r?n(e,i,a):n(a))||a);return r&&a&&ft(e,i,a),a};let u=class extends N{constructor(){super(...arguments),this.postName="",this.logo="",this.summaryTitle="文章摘要",this.gptName="智阅GPT",this.typeSpeed=20,this.typewriter=!0,this.darkSelector="",this.themeName="custom",this.uiStyle="simple",this.fixedTone="violet",this.fixedDensity="compact",this.theme={},this.content="",this.displayContent="",this.loading=!0,this.typing=!1,this.loadFailed=!1,this.isDark=!1,this.themeObservers=[],this.initialized=!1,this.handleSystemColorSchemeChange=()=>{this.refreshThemeMode()}}connectedCallback(){super.connectedCallback(),this.refreshThemeMode(),this.bindThemeObservers(),this.bindSystemColorSchemeListener()}firstUpdated(){this.postName?this.loadSummary():(this.loading=!1,this.loadFailed=!0,this.displayContent="摘要加载失败，请稍后重试"),this.initialized=!0}disconnectedCallback(){super.disconnectedCallback(),this.unbindThemeObservers(),this.unbindSystemColorSchemeListener(),this.stopTypewriter()}updated(t){t.has("darkSelector")&&(this.refreshThemeMode(),this.bindThemeObservers()),this.initialized&&t.has("postName")&&this.postName&&this.loadSummary()}async loadSummary(){this.stopTypewriter(),this.loading=!0,this.loadFailed=!1,this.displayContent="";try{const t=await Ee(this.postName);this.content=t.summaryContent?.trim()||"暂无摘要内容",this.applyContent()}catch(t){console.warn("获取摘要失败:",t),this.content="摘要加载失败，请稍后重试",this.displayContent=this.content,this.loadFailed=!0}finally{this.loading=!1}}applyContent(){if(this.stopTypewriter(),!this.typewriter){this.displayContent=this.content,this.typing=!1;return}this.typing=!0,this.displayContent="";const t=Number.isFinite(this.typeSpeed)?Math.max(this.typeSpeed,0):20;let e=0;const i=()=>{if(e+=1,this.displayContent=this.content.slice(0,e),e>=this.content.length){this.typing=!1,this.typewriterTimer=void 0;return}this.typewriterTimer=window.setTimeout(i,t)};if(!this.content){this.typing=!1;return}i()}stopTypewriter(){this.typing=!1,this.typewriterTimer&&(window.clearTimeout(this.typewriterTimer),this.typewriterTimer=void 0)}refreshThemeMode(){this.isDark=Pe(this.darkSelector)}bindThemeObservers(){this.unbindThemeObservers(),this.themeObservers=Ce(this.darkSelector,()=>{this.refreshThemeMode()})}unbindThemeObservers(){this.themeObservers.forEach(t=>t.disconnect()),this.themeObservers=[]}bindSystemColorSchemeListener(){if(window.matchMedia){if(this.prefersColorSchemeQuery=window.matchMedia("(prefers-color-scheme: dark)"),typeof this.prefersColorSchemeQuery.addEventListener=="function"){this.prefersColorSchemeQuery.addEventListener("change",this.handleSystemColorSchemeChange);return}this.prefersColorSchemeQuery.addListener?.(this.handleSystemColorSchemeChange)}}unbindSystemColorSchemeListener(){this.prefersColorSchemeQuery&&(typeof this.prefersColorSchemeQuery.removeEventListener=="function"?this.prefersColorSchemeQuery.removeEventListener("change",this.handleSystemColorSchemeChange):this.prefersColorSchemeQuery.removeListener?.(this.handleSystemColorSchemeChange),this.prefersColorSchemeQuery=void 0)}get effectiveThemeName(){return this.isDark?"dark":this.themeName==="dark"||this.themeName==="blue"||this.themeName==="green"||this.themeName==="custom"?this.themeName:"default"}get effectiveUiStyle(){return this.uiStyle==="simple"||this.uiStyle==="quiet"?"simple":this.uiStyle==="note"||this.uiStyle==="minimal"||this.uiStyle==="stripe"||this.uiStyle==="inline"?this.uiStyle==="inline"?"inline":"simple":this.themeName==="spotlight"?"simple":"classic"}get customThemeStyles(){if(this.effectiveThemeName!=="custom")return{};const t=pt(this.theme);return{"--likcc-summaraid-bg":t.bg??"","--likcc-summaraid-main":t.main??"","--likcc-summaraid-contentFontSize":t.contentFontSize??"","--likcc-summaraid-title":t.title??"","--likcc-summaraid-content":t.content??"","--likcc-summaraid-gptName":t.gptName??"","--likcc-summaraid-contentBg":t.contentBg??"","--likcc-summaraid-border":t.border??"","--likcc-summaraid-shadow":t.shadow??"","--likcc-summaraid-tagBg":t.tagBg??"","--likcc-summaraid-tagColor":t.tagColor??"","--likcc-summaraid-cursor":t.cursor??""}}get effectiveFixedTone(){return this.fixedTone==="graphite"||this.fixedTone==="copper"?this.fixedTone:"violet"}get effectiveFixedDensity(){return this.fixedDensity==="comfortable"?"comfortable":"compact"}get fixedStyleClassName(){const t=["likcc-summaraidGPT-fixed",`likcc-summaraidGPT-tone--${this.effectiveFixedTone}`,`likcc-summaraidGPT-density--${this.effectiveFixedDensity}`];return this.isDark&&t.push("likcc-summaraidGPT-fixed--dark"),t.join(" ")}render(){return this.effectiveUiStyle==="simple"?this.renderSimpleCard():this.effectiveUiStyle==="inline"?this.renderInlineCard():this.renderClassicCard()}renderClassicCard(){const t=`likcc-summaraidGPT-summary--${this.effectiveThemeName}`,e=gt(this.logo),i=this.loading?"正在生成摘要…":this.displayContent;return m`
      <div class="likcc-summaraidGPT-summary-container ${t}" style=${Ae(this.customThemeStyles)}>
        <div class="likcc-summaraidGPT-summary-header">
          <div class="likcc-summaraidGPT-header-left">
            ${e?m`<img class="likcc-summaraidGPT-logo not-prose" src=${e} alt=${this.gptName||"AI Logo"} width="20" height="20" />`:h}
            <span class="likcc-summaraidGPT-summary-title">${this.summaryTitle||"文章摘要"}</span>
          </div>
          <span class="likcc-summaraidGPT-gpt-name">${this.gptName||"智阅GPT"}</span>
        </div>
        <div class="likcc-summaraidGPT-summary-content">
          ${this.loading||this.loadFailed?m`<span style="color:#bbb;">${i}</span>`:i}
          ${this.typing?m`<span class="likcc-summaraidGPT-cursor"></span>`:h}
        </div>
      </div>
    `}renderInlineCard(){const t=this.loading?"正在生成摘要…":this.displayContent,e=this.summaryTitle||"AI 总结";return m`
      <div class="likcc-summaraidGPT-inline-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-inline-shell">
          <div class="likcc-summaraidGPT-inline-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-inline-icon")}
            <span class="likcc-summaraidGPT-inline-title">${e}</span>
          </div>
          <div class="likcc-summaraidGPT-inline-content">
            ${this.loading||this.loadFailed?m`<span style="color:#8892a6;">${t}</span>`:t}
            ${this.typing?m`<span class="likcc-summaraidGPT-cursor"></span>`:h}
          </div>
        </div>
      </div>
    `}renderSimpleCard(){const t=this.loading?"正在生成摘要…":this.displayContent,e=this.summaryTitle||"AI 总结";return m`
      <div class="likcc-summaraidGPT-simple-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-simple-shell">
          <div class="likcc-summaraidGPT-simple-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-simple-icon")}
            <span class="likcc-summaraidGPT-simple-title">${e}</span>
          </div>
          <div class="likcc-summaraidGPT-simple-content">
            ${this.loading||this.loadFailed?m`<span style="color:#8892a6;">${t}</span>`:t}
            ${this.typing?m`<span class="likcc-summaraidGPT-cursor"></span>`:h}
          </div>
        </div>
      </div>
    `}renderSparklesIcon(t){return m`
      <span class=${t} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.22 3.39a.35.35 0 0 1 .66 0l1.52 4.23a.38.38 0 0 0 .22.22l4.23 1.52a.35.35 0 0 1 0 .66l-4.23 1.52a.38.38 0 0 0-.22.22l-1.52 4.23a.35.35 0 0 1-.66 0l-1.52-4.23a.38.38 0 0 0-.22-.22L4.25 10.02a.35.35 0 0 1 0-.66l4.23-1.52a.38.38 0 0 0 .22-.22l1.52-4.23Z" />
          <path d="M18.38 4.18a.24.24 0 0 1 .45 0l.59 1.66c.02.07.08.13.15.15l1.66.59a.24.24 0 0 1 0 .45l-1.66.59a.25.25 0 0 0-.15.15l-.59 1.66a.24.24 0 0 1-.45 0l-.59-1.66a.25.25 0 0 0-.15-.15l-1.66-.59a.24.24 0 0 1 0-.45l1.66-.59a.24.24 0 0 0 .15-.15l.59-1.66Z" />
        </svg>
      </span>
    `}};u.styles=mt,f([v({type:String,attribute:"post-name"})],u.prototype,"postName",2),f([v({type:String})],u.prototype,"logo",2),f([v({type:String,attribute:"summary-title"})],u.prototype,"summaryTitle",2),f([v({type:String,attribute:"gpt-name"})],u.prototype,"gptName",2),f([v({type:Number,attribute:"type-speed"})],u.prototype,"typeSpeed",2),f([v({type:Boolean})],u.prototype,"typewriter",2),f([v({type:String,attribute:"dark-selector"})],u.prototype,"darkSelector",2),f([v({type:String,attribute:"theme-name"})],u.prototype,"themeName",2),f([v({type:String,attribute:"ui-style"})],u.prototype,"uiStyle",2),f([v({type:String,attribute:"fixed-tone"})],u.prototype,"fixedTone",2),f([v({type:String,attribute:"fixed-density"})],u.prototype,"fixedDensity",2),f([v({attribute:!1})],u.prototype,"theme",2),f([g()],u.prototype,"content",2),f([g()],u.prototype,"displayContent",2),f([g()],u.prototype,"loading",2),f([g()],u.prototype,"typing",2),f([g()],u.prototype,"loadFailed",2),f([g()],u.prototype,"isDark",2),u=f([_e("likcc-article-summary")],u);const kt=le`
  :host {
    display: block;
    width: 100%;
    color: var(--likcc-reading-text, #172132);
    --likcc-reading-surface: #fbfaf7;
    --likcc-reading-panel: #ffffff;
    --likcc-reading-soft: #f5f7f8;
    --likcc-reading-line: rgba(23, 33, 50, 0.12);
    --likcc-reading-muted: #637185;
    --likcc-reading-text: #172132;
    --likcc-reading-accent: #2d9b8a;
    --likcc-reading-link: #d8d5cf;
    --likcc-reading-node: rgba(255, 255, 255, 0.92);
    --likcc-reading-node-soft: rgba(255, 255, 255, 0.84);
    --likcc-reading-node-strong: rgba(255, 255, 255, 0.96);
    --likcc-reading-node-border: #eee3d9;
    --likcc-reading-conclusion: #b15f20;
    --likcc-reading-background: #45aa9b;
    --likcc-reading-core: #6b98dd;
    --likcc-reading-argument: #b864ad;
    --likcc-reading-tl: #b45309;
    --likcc-reading-dl: #be3455;
    --likcc-reading-shadow: 0 18px 45px rgba(24, 34, 49, 0.12);
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  }

  .reading-shell {
    box-sizing: border-box;
    width: 100%;
    margin: 1.2rem 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .reading-shell.is-dark {
    --likcc-reading-surface: #111827;
    --likcc-reading-panel: #182132;
    --likcc-reading-soft: #202b3b;
    --likcc-reading-line: rgba(226, 232, 240, 0.16);
    --likcc-reading-muted: #a8b4c6;
    --likcc-reading-text: #edf2f7;
    --likcc-reading-accent: #72d6c8;
    --likcc-reading-link: #495567;
    --likcc-reading-node: rgba(31, 41, 55, 0.94);
    --likcc-reading-node-soft: rgba(24, 34, 49, 0.9);
    --likcc-reading-node-strong: rgba(39, 50, 68, 0.98);
    --likcc-reading-node-border: #374254;
    --likcc-reading-conclusion: #e1a05e;
    --likcc-reading-background: #6fd3c5;
    --likcc-reading-core: #93b8ff;
    --likcc-reading-argument: #d99bdd;
    --likcc-reading-tl: #fbbf24;
    --likcc-reading-dl: #fb7185;
    --likcc-reading-shadow: 0 18px 36px rgba(0, 0, 0, 0.26);
  }

  .reading-collapse {
    display: flex;
    align-items: center;
    gap: 0.42rem;
    width: max-content;
    min-height: 1.6rem;
    margin: 0 0 0.48rem auto;
    padding: 0.08rem 0.12rem;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--likcc-reading-accent);
    font-size: 0.84rem;
    font-weight: 720;
    line-height: 1.2;
  }

  .reading-collapse:hover {
    border-color: transparent;
    background: transparent;
    transform: none;
    color: color-mix(in srgb, var(--likcc-reading-accent) 74%, var(--likcc-reading-text));
  }

  .reading-collapsed {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0.58rem;
    width: 100%;
    min-height: 2.55rem;
    padding: 0.36rem 0;
    border: 0;
    border-top: 1px solid color-mix(in srgb, var(--likcc-reading-accent) 20%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--likcc-reading-accent) 14%, transparent);
    border-radius: 0;
    background: transparent;
    color: var(--likcc-reading-text);
    box-shadow: none;
    text-align: left;
  }

  .reading-collapsed:hover {
    border-color: color-mix(in srgb, var(--likcc-reading-accent) 30%, transparent);
    background: color-mix(in srgb, var(--likcc-reading-accent) 4%, transparent);
    transform: none;
  }

  .collapsed-title {
    color: var(--likcc-reading-accent);
    font-size: 0.9rem;
    font-weight: 820;
    line-height: 1.2;
    white-space: nowrap;
  }

  .collapsed-summary {
    min-width: 0;
    overflow: hidden;
    color: var(--likcc-reading-muted);
    font-size: 0.84rem;
    font-weight: 620;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .collapse-mark {
    display: inline-grid;
    place-items: center;
    width: 1rem;
    height: 1rem;
    border: 1px solid color-mix(in srgb, var(--likcc-reading-accent) 34%, transparent);
    border-radius: 6px;
    font-size: 0.78rem;
    line-height: 1;
  }

  button {
    box-sizing: border-box;
    border: 1px solid var(--likcc-reading-line);
    border-radius: 8px;
    background: var(--likcc-reading-panel);
    color: var(--likcc-reading-text);
    min-height: 2rem;
    padding: 0.36rem 0.58rem;
    font: inherit;
    font-size: 0.86rem;
    line-height: 1.2;
    letter-spacing: 0;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease,
      transform 0.18s ease, box-shadow 0.18s ease;
  }

  button:hover {
    border-color: color-mix(in srgb, var(--likcc-reading-accent) 45%, var(--likcc-reading-line));
    transform: translateY(-1px);
  }

  button:focus-visible,
  textarea:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--likcc-reading-accent) 64%, transparent);
    outline-offset: 2px;
  }

  button[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  .primary-action {
    border-color: transparent;
    background: var(--likcc-reading-accent);
    color: #ffffff;
  }

  .state-box {
    padding: 0.7rem 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--likcc-reading-muted);
    line-height: 1.7;
  }

  .insight-graph {
    overflow: visible;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .graph-canvas {
    position: relative;
    width: 100%;
    min-width: 0;
    aspect-ratio: 16 / 9;
    min-height: 29rem;
    max-height: 42rem;
    overflow: visible;
    padding: 0;
    background: transparent;
  }

  .graph-board {
    position: absolute;
    inset: 0;
  }

  .graph-links {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .graph-links path {
    fill: none;
    stroke: var(--likcc-reading-link);
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.44;
    vector-effect: non-scaling-stroke;
  }

  .graph-link--branch {
    stroke-width: 2.2;
    opacity: 0.34;
  }

  .graph-link--leaf {
    stroke-width: 2.9;
    opacity: 0.76;
  }

  .graph-dot {
    fill: var(--likcc-reading-panel);
    stroke: var(--likcc-reading-link);
    stroke-width: 0.42;
    opacity: 0.82;
    vector-effect: non-scaling-stroke;
  }

  .graph-dot--branch {
    opacity: 0.5;
  }

  .graph-dot--leaf {
    opacity: 0.92;
  }

  .graph-link--conclusion {
    stroke: var(--likcc-reading-conclusion);
  }

  .graph-dot--conclusion {
    stroke: var(--likcc-reading-conclusion);
  }

  .graph-link--background {
    stroke: var(--likcc-reading-background);
  }

  .graph-dot--background {
    stroke: var(--likcc-reading-background);
  }

  .graph-link--core {
    stroke: var(--likcc-reading-core);
  }

  .graph-dot--core {
    stroke: var(--likcc-reading-core);
  }

  .graph-link--argument {
    stroke: var(--likcc-reading-argument);
  }

  .graph-dot--argument {
    stroke: var(--likcc-reading-argument);
  }

  .graph-node {
    position: absolute;
    z-index: 2;
    --node-color: var(--likcc-reading-link);
    --node-tint: color-mix(in srgb, var(--node-color) 7%, var(--likcc-reading-node));
    display: inline-grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    justify-content: center;
    justify-items: center;
    gap: 0.42rem;
    min-height: 2.36rem;
    min-width: 0;
    width: 8.6rem;
    max-width: 8.6rem;
    padding: 0.32rem 0.58rem 0.34rem;
    border: 1px solid color-mix(in srgb, var(--node-color) 30%, var(--likcc-reading-node-border));
    border-radius: 10px;
    background: var(--node-tint);
    color: var(--likcc-reading-text);
    box-shadow: 0 8px 20px rgba(24, 34, 49, 0.06);
    font-size: 0.82rem;
    font-weight: 760;
    line-height: 1.14;
    text-align: center;
    transform: translate(-50%, -50%);
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease,
      box-shadow 0.18s ease, color 0.18s ease;
  }

  .graph-node::after {
    display: none;
  }

  .node-title {
    display: block;
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
    text-align: center;
  }

  .node-icon {
    display: inline-grid;
    place-items: center;
    width: 1.48rem;
    height: 1.48rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--node-color) 12%, var(--likcc-reading-panel));
    color: var(--node-color);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--node-color) 8%, transparent);
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

  .node-icon .iconify-icon,
  .icon-button .iconify-icon,
  .popover-actions .iconify-icon {
    width: 0.9rem;
    height: 0.9rem;
  }

  .graph-node:hover {
    border-color: color-mix(in srgb, var(--node-color) 52%, var(--likcc-reading-node-border));
    background: color-mix(in srgb, var(--node-color) 12%, var(--likcc-reading-node));
    box-shadow: 0 10px 24px rgba(24, 34, 49, 0.1);
    transform: translate(-50%, calc(-50% - 1px));
  }

  .graph-node.is-active {
    border-color: color-mix(in srgb, var(--node-color) 72%, var(--likcc-reading-node-border));
    background: color-mix(in srgb, var(--node-color) 15%, var(--likcc-reading-node));
    box-shadow: 0 10px 24px rgba(24, 34, 49, 0.12);
  }

  .graph-node--root {
    --node-color: #ffffff;
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.48rem;
    width: 8.25rem;
    height: 8.25rem;
    min-height: 0;
    min-width: 0;
    padding: 0.62rem;
    border: 1px solid #26323f;
    border-radius: 999px;
    background:
      radial-gradient(circle at 38% 26%, rgba(255, 255, 255, 0.1), transparent 28%),
      linear-gradient(145deg, #1a2432, #0f1722 76%);
    color: #ffffff;
    box-shadow: 0 16px 34px rgba(20, 30, 45, 0.18);
    font-size: 0.78rem;
    font-weight: 760;
    line-height: 1.36;
    text-align: center;
  }

  .graph-node--root > * {
    position: relative;
    z-index: 1;
  }

  .graph-node--root::before {
    content: "";
    position: absolute;
    inset: -0.55rem;
    border: 1px dashed rgba(100, 116, 139, 0.32);
    border-radius: inherit;
    pointer-events: none;
  }

  .graph-node--root .node-icon {
    width: 1.78rem;
    height: 1.78rem;
    background: transparent;
    color: #ffffff;
    box-shadow: none;
  }

  .graph-node--root .node-icon .iconify-icon {
    width: 1.45rem;
    height: 1.45rem;
  }

  .graph-node--root .node-title {
    display: -webkit-box;
    max-width: 6.6rem;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .graph-node--root:hover,
  .graph-node--root.is-active {
    border-color: #26323f;
    background:
      radial-gradient(circle at 38% 26%, rgba(255, 255, 255, 0.1), transparent 28%),
      linear-gradient(145deg, #1a2432, #0f1722 76%);
    color: #ffffff;
    box-shadow: 0 16px 34px rgba(20, 30, 45, 0.18);
    transform: translate(-50%, -50%);
  }

  .graph-node--root::after {
    display: none;
  }

  .graph-node--branch {
    width: 8.8rem;
    min-width: 8.8rem;
    min-height: 2.58rem;
    max-width: 8.8rem;
    font-size: 0.88rem;
    font-weight: 800;
  }

  .graph-node--leaf {
    min-height: 2.34rem;
    width: 7.55rem;
    min-width: 7.55rem;
    max-width: 7.55rem;
    background: color-mix(in srgb, var(--node-color) 5%, var(--likcc-reading-node-soft));
    box-shadow: 0 8px 18px rgba(24, 34, 49, 0.05);
    font-size: 0.76rem;
    font-weight: 720;
  }

  .graph-node--branch .node-title,
  .graph-node--leaf .node-title {
    display: -webkit-box;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .graph-node--branch .node-title {
    max-width: 6.6rem;
  }

  .graph-node--leaf .node-title {
    max-width: 5.45rem;
  }

  .graph-node--tone-conclusion {
    --node-color: var(--likcc-reading-conclusion);
  }

  .graph-node--tone-background {
    --node-color: var(--likcc-reading-background);
  }

  .graph-node--tone-core {
    --node-color: var(--likcc-reading-core);
  }

  .graph-node--tone-argument {
    --node-color: var(--likcc-reading-argument);
  }

  .reading-shell.is-dark .insight-graph {
    background: transparent;
  }

  .reading-shell.is-dark .graph-node {
    background: color-mix(in srgb, var(--node-color) 8%, var(--likcc-reading-node));
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
  }

  .reading-shell.is-dark .graph-node--root {
    background: #111827;
    border-color: #566274;
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.3);
  }

  .reading-shell.is-dark .graph-node--leaf {
    background: color-mix(in srgb, var(--node-color) 8%, var(--likcc-reading-node-soft));
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  }

  .reading-shell.is-dark .node-icon {
    background: color-mix(in srgb, var(--node-color) 18%, var(--likcc-reading-panel));
  }

  .node-popover {
    position: absolute;
    top: 50%;
    right: 1.25rem;
    z-index: 4;
    box-sizing: border-box;
    width: min(20.5rem, 28vw);
    max-height: min(31rem, calc(100% - 3rem));
    overflow: auto;
    padding: 1.22rem;
    border: 1px solid var(--likcc-reading-line);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.9));
    color: var(--likcc-reading-text);
    box-shadow: 0 22px 50px rgba(24, 34, 49, 0.14);
    transform: translateY(-50%);
    animation: reading-popover-in 0.2s ease both;
  }

  .reading-shell.is-dark .node-popover {
    border-color: var(--likcc-reading-line);
    background: linear-gradient(180deg, rgba(24, 33, 50, 0.98), rgba(18, 25, 38, 0.94));
    box-shadow: 0 20px 46px rgba(0, 0, 0, 0.38);
  }

  .popover-head,
  .question-actions,
  .popover-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.42rem;
  }

  .popover-head {
    justify-content: flex-end;
    margin-bottom: 0.72rem;
  }

  .icon-button {
    display: inline-grid;
    place-items: center;
    width: 2rem;
    min-height: 2rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--likcc-reading-text);
  }

  .node-popover h3 {
    margin: 0;
    color: var(--likcc-reading-text);
    font-size: 1.1rem;
    font-weight: 850;
    line-height: 1.38;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }

  .node-popover p {
    margin: 0.72rem 0 0;
    color: var(--likcc-reading-muted);
    font-size: 0.92rem;
    line-height: 1.82;
    overflow-wrap: anywhere;
  }

  .source-anchor {
    width: 100%;
    min-height: 2.8rem;
    margin-top: 1rem;
    border: 1px solid color-mix(in srgb, var(--likcc-reading-accent) 26%, var(--likcc-reading-line));
    border-radius: 9px;
    background: color-mix(in srgb, var(--likcc-reading-accent) 7%, var(--likcc-reading-panel));
    color: var(--likcc-reading-text);
    text-align: left;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .reading-shell.is-dark .source-anchor {
    background: color-mix(in srgb, var(--likcc-reading-accent) 10%, var(--likcc-reading-panel));
  }

  .payload-list {
    display: grid;
    gap: 0.42rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
  }

  .payload-list li {
    position: relative;
    padding-left: 0.92rem;
    color: var(--likcc-reading-text);
    font-size: 0.88rem;
    line-height: 1.58;
    overflow-wrap: anywhere;
  }

  .payload-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.64em;
    width: 0.34rem;
    height: 0.34rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--likcc-reading-accent) 76%, var(--likcc-reading-muted));
  }

  .popover-actions {
    margin-top: 1.05rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--likcc-reading-line);
  }

  .popover-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.48rem;
    min-height: 2rem;
    padding: 0.34rem 0.2rem;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--likcc-reading-text);
    font-size: 0.84rem;
    font-weight: 700;
  }

  .question-composer {
    margin-top: 0.72rem;
    padding-top: 0.72rem;
    border-top: 1px solid var(--likcc-reading-line);
  }

  .question-input {
    box-sizing: border-box;
    width: 100%;
    min-height: 5.2rem;
    resize: vertical;
    border: 1px solid var(--likcc-reading-line);
    border-radius: 8px;
    background: var(--likcc-reading-panel);
    color: var(--likcc-reading-text);
    padding: 0.62rem;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .reading-shell.is-dark .question-input {
    background: var(--likcc-reading-soft);
  }

  .question-actions {
    margin-top: 0.5rem;
  }

  .answer-box {
    margin-top: 0.62rem;
    padding: 0.64rem 0.7rem;
    border-left: 3px solid var(--likcc-reading-accent);
    background: color-mix(in srgb, var(--likcc-reading-accent) 8%, transparent);
    color: var(--likcc-reading-text);
    font-size: 0.9rem;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  @media (max-width: 760px) {
    .reading-shell {
      padding: 0;
    }

    .graph-canvas {
      aspect-ratio: 9 / 14;
      min-height: clamp(34rem, 138vw, 44rem);
    }

    .graph-node {
      width: 5.75rem;
      min-width: 5.75rem;
      max-width: 5.75rem;
      min-height: 2.08rem;
      padding: 0.26rem 0.38rem;
      gap: 0.28rem;
      font-size: 0.68rem;
      line-height: 1.12;
    }

    .node-icon {
      width: 1.16rem;
      height: 1.16rem;
    }

    .node-icon .iconify-icon,
    .icon-button .iconify-icon,
    .popover-actions .iconify-icon {
      width: 0.74rem;
      height: 0.74rem;
    }

    .node-title {
      display: -webkit-box;
      max-width: 3.9rem;
      overflow: hidden;
      white-space: normal;
      word-break: break-word;
      overflow-wrap: anywhere;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .graph-node--root {
      width: 5.7rem;
      height: 5.7rem;
      padding: 0.5rem;
      font-size: 0.62rem;
    }

    .graph-node--root::before {
      inset: -0.38rem;
    }

    .graph-node--root .node-icon {
      width: 1.36rem;
      height: 1.36rem;
    }

    .graph-node--root .node-icon .iconify-icon {
      width: 1.08rem;
      height: 1.08rem;
    }

    .graph-node--root .node-title {
      max-width: 4.6rem;
      -webkit-line-clamp: 3;
    }

    .graph-node--branch {
      width: 5.9rem;
      min-width: 5.9rem;
      max-width: 5.9rem;
      font-size: 0.72rem;
    }

    .graph-node--leaf {
      width: 5.45rem;
      min-width: 5.45rem;
      max-width: 5.45rem;
      font-size: 0.66rem;
    }

    .node-popover {
      position: fixed;
      inset: auto 1rem 1rem 1rem;
      width: auto;
      max-height: 24rem;
      transform: none;
      animation: reading-popover-mobile-in 0.2s ease both;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }

    button:hover {
      transform: none;
    }

    .node-popover {
      animation: none;
    }
  }

  @keyframes reading-popover-in {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(14px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0) scale(1);
    }
  }

  @keyframes reading-popover-mobile-in {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;async function yt(t){const e=await fetch(`${D}/articleReadings/${encodeURIComponent(t)}`),i=await e.json().catch(()=>{});if(!e.ok)throw new Error(i&&"message"in i&&i.message?i.message:`HTTP ${e.status}: ${e.statusText}`);if(!i||!("spec"in i)||!i.spec)throw new Error(i?.message||"洞察图谱尚未生成");return i}async function vt(t,e){const i=JSON.stringify([{role:"user",content:`${e}

用户问题：${t}`}]),r=await fetch(`${D}/conversation`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationHistory:i})});if(!r.ok)throw new Error(`HTTP ${r.status}: ${r.statusText}`);const a=await r.json();if(a.success===!1)throw new Error(a.message||"提问失败");return a.response||""}async function wt(t){try{await fetch(`${D}/articleReadingInteractions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})}catch(e){console.warn("记录洞察图谱互动失败:",e)}}function xt(){const t="likcc-article-reading-visitor-id",e=window.crypto?.randomUUID?.()||`visitor-${Date.now()}-${Math.random()}`;try{const i=window.localStorage.getItem(t);if(i)return i;window.localStorage.setItem(t,e)}catch{return e}return e}const Ne="ri:book-open-line",Me="https://api.iconify.design",Oe=/^([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)$/i;function $t(t,e="iconify-icon"){const i=Tt(t)||ae(Ne);return m`
    <span
      class=${e}
      style=${Ae({"--rag-icon-source":`url("${i}")`})}
      aria-hidden="true"
    ></span>
  `}function Tt(t){const e=t?.trim();if(e){if(St(e))return ae(e);if(At(e))return Ct(e);if(_t(e)||Pt(e))return e}}function St(t){return Oe.test(t)}function ae(t){const e=t.match(Oe);if(!e)return ae(Ne);const[,i,r]=e;return`${Me}/${encodeURIComponent(i)}/${encodeURIComponent(r)}.svg`}function At(t){return t.startsWith("<svg")&&t.endsWith("</svg>")}function _t(t){return t.startsWith("data:image/svg+xml")}function Pt(t){try{const e=new URL(t);return e.origin===Me&&e.pathname.endsWith(".svg")}catch{return!1}}function Ct(t){return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(t)}`}var Et=Object.defineProperty,Nt=Object.getOwnPropertyDescriptor,k=(t,e,i,r)=>{for(var a=r>1?void 0:r?Nt(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(a=(r?n(e,i,a):n(a))||a);return r&&a&&Et(e,i,a),a};const Mt=5,Ot=3e3,Gt=600,Ge=["conclusion","background","core","argument"];let b=class extends N{constructor(){super(...arguments),this.postName="",this.darkSelector="",this.loading=!0,this.errorMessage="",this.notGenerated=!1,this.activeNodeId="",this.popoverOpen=!1,this.questionOpen=!1,this.question="",this.answer="",this.asking=!1,this.isDark=!1,this.isCompactViewport=!1,this.collapsed=!1,this.themeObservers=[],this.visitorId="",this.initialized=!1,this.pollAttempts=0,this.handleColorSchemeChange=()=>{this.refreshThemeMode()},this.handleCompactViewportChange=()=>{this.refreshCompactViewport()},this.toggleCollapsed=()=>{this.collapsed=!this.collapsed,this.popoverOpen=!1,this.questionOpen=!1},this.closePopover=()=>{this.popoverOpen=!1}}connectedCallback(){super.connectedCallback(),this.visitorId=xt(),this.refreshThemeMode(),this.refreshCompactViewport(),this.bindThemeObservers(),this.bindEnvironmentObservers()}firstUpdated(){this.loadReading(),this.initialized=!0}disconnectedCallback(){super.disconnectedCallback(),this.clearPollTimer(),this.unbindEnvironmentObservers(),this.unbindThemeObservers()}updated(t){t.has("darkSelector")&&(this.refreshThemeMode(),this.bindThemeObservers()),this.initialized&&t.has("postName")&&this.loadReading()}async loadReading(t=!1){if(!this.postName){this.loading=!1,this.errorMessage="文章名称为空";return}t||(this.loading=!0),this.errorMessage="",this.popoverOpen=!1,this.questionOpen=!1;try{const e=await yt(this.postName);if(!this.isRenderableReading(e.spec)){this.reading=void 0,this.notGenerated=!0,this.scheduleExistingPoll();return}this.clearPollTimer(),this.pollAttempts=0,this.reading=e.spec,this.notGenerated=!1,this.activeNodeId=this.graph.root.id}catch(e){console.warn("洞察图谱加载失败:",e);const i=e instanceof Error?e.message:"洞察图谱加载失败";this.isPendingGenerationError(i)?(this.notGenerated=!0,this.scheduleExistingPoll()):this.errorMessage=i}finally{this.loading=!1}}scheduleExistingPoll(){this.clearPollTimer(),!(this.pollAttempts>=Gt)&&(this.pollAttempts+=1,this.pollTimer=window.setTimeout(()=>{this.pollTimer=void 0,this.loadReading(!0)},Ot))}clearPollTimer(){this.pollTimer&&(window.clearTimeout(this.pollTimer),this.pollTimer=void 0)}refreshThemeMode(){this.isDark=Pe(this.darkSelector)}refreshCompactViewport(){this.isCompactViewport=window.matchMedia?.("(max-width: 760px)").matches??!1}bindThemeObservers(){this.unbindThemeObservers(),this.themeObservers=Ce(this.darkSelector,()=>{this.refreshThemeMode()})}unbindThemeObservers(){this.themeObservers.forEach(t=>t.disconnect()),this.themeObservers=[]}bindEnvironmentObservers(){window.matchMedia&&(this.colorSchemeQuery=window.matchMedia("(prefers-color-scheme: dark)"),this.compactViewportQuery=window.matchMedia("(max-width: 760px)"),this.addMediaListener(this.colorSchemeQuery,this.handleColorSchemeChange),this.addMediaListener(this.compactViewportQuery,this.handleCompactViewportChange))}unbindEnvironmentObservers(){this.colorSchemeQuery&&(this.removeMediaListener(this.colorSchemeQuery,this.handleColorSchemeChange),this.colorSchemeQuery=void 0),this.compactViewportQuery&&(this.removeMediaListener(this.compactViewportQuery,this.handleCompactViewportChange),this.compactViewportQuery=void 0)}addMediaListener(t,e){if(typeof t.addEventListener=="function"){t.addEventListener("change",e);return}t.addListener(e)}removeMediaListener(t,e){if(typeof t.removeEventListener=="function"){t.removeEventListener("change",e);return}t.removeListener(e)}get graph(){const t=this.reading?.root||{id:"root",title:this.reading?.postTitle||"文章标题",kind:"root",summary:"洞察图谱"},e=(this.reading?.nodes||[]).filter(r=>!this.isLegacyGraphNode(r)),i=new Set([t.id,...e.map(r=>r.id)]);return{root:t,nodes:e,edges:(this.reading?.edges||[]).filter(r=>i.has(r.from)&&i.has(r.to))}}get allNodes(){return[this.graph.root,...this.graph.nodes.filter(t=>t.id!==this.graph.root.id)]}get activeNode(){return this.nodeById(this.activeNodeId)||this.graph.root}render(){const t=this.isDark?"reading-shell is-dark":"reading-shell";return this.collapsed?m`
        <section class=${t}>
          <button
            class="reading-collapsed"
            type="button"
            aria-expanded="false"
            @click=${this.toggleCollapsed}
          >
            <span class="collapsed-title">洞察图谱</span>
            <span class="collapsed-summary">${this.collapsedSummary()}</span>
            <span class="collapse-mark" aria-hidden="true">+</span>
          </button>
        </section>
      `:m`
      <section class=${t}>
        <button
          class="reading-collapse"
          type="button"
          aria-expanded=${String(!this.collapsed)}
          @click=${this.toggleCollapsed}
        >
          <span>收起洞察图谱</span>
          <span class="collapse-mark" aria-hidden="true">-</span>
        </button>
        ${this.renderBody()}
      </section>
    `}collapsedSummary(){return this.loading?"正在读取":this.notGenerated?"后台生成中":this.errorMessage?"加载失败":this.reading?.postTitle||this.graph.root.title||"点击展开查看"}renderBody(){return this.loading?m`<div class="state-box">正在读取洞察图谱…</div>`:this.notGenerated?m`
        <div class="state-box">
          洞察图谱正在后台生成，完成后会自动刷新显示，无需手动刷新页面。
        </div>
      `:this.errorMessage?m`<div class="state-box">${this.errorMessage}</div>`:this.reading?this.renderGraph():m`<div class="state-box">暂无洞察图谱</div>`}renderGraph(){const t=this.graphNodeViews(),e=this.graphLinkViews(t);return m`
      <div class="insight-graph">
        <div class="graph-canvas">
          <div class="graph-board">
            <svg class="graph-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${e.map(i=>Xe`
                <path
                  class=${`graph-link graph-link--${i.level} graph-link--${i.tone}`}
                  d=${this.linkPath(i)}
                ></path>
                <circle
                  class=${`graph-dot graph-dot--${i.level} graph-dot--${i.tone}`}
                  cx=${i.to.x}
                  cy=${i.to.y}
                  r="0.72"
                ></circle>
              `)}
            </svg>
            ${t.map(i=>m`
              <button
                class=${this.nodeClass(i)}
                type="button"
                style=${`left:${i.x}%;top:${i.y}%`}
                @click=${()=>this.handleNodeClick(i.node)}
                aria-label=${i.node.title}
                title=${i.node.title}
              >
                <span class="node-icon" aria-hidden="true">${this.renderNodeIcon(i)}</span>
                <span class="node-title">${this.nodeDisplayTitle(i)}</span>
              </button>
            `)}
          </div>
          ${this.popoverOpen?this.renderPopover():h}
        </div>
      </div>
    `}renderPopover(){const t=this.activeNode,e=this.payloadItems(t);return m`
      <aside class=${`node-popover node-popover--${this.toneForNode(t.id)}`}>
        <div class="popover-head">
          <button class="icon-button" type="button" @click=${this.closePopover} aria-label="关闭详情">
            ${this.renderInlineIcon("x")}
          </button>
        </div>
        <h3>${t.title}</h3>
        ${t.summary?m`<p>${t.summary}</p>`:h}
        ${!t.summary&&this.isBranchNode(t.id)?m`
          <p>${this.branchChildTitles(t).join(" / ")}</p>
        `:h}
        ${t.sourceRange?.anchor?m`
          <button class="source-anchor" type="button" @click=${()=>this.scrollNodeSource(t)}>
            ${t.sourceRange.anchor}
          </button>
        `:h}
        ${e.length>0?m`
          <ul class="payload-list">
            ${e.map(i=>m`<li>${i}</li>`)}
          </ul>
        `:h}
        ${t.kind!=="root"?m`
          <div class="popover-actions">
            <button
              type="button"
              ?disabled=${!t.sourceRange?.anchor}
              @click=${()=>this.scrollNodeSource(t)}
            >
              ${this.renderInlineIcon("rotate")}<span>跳回原文</span>
            </button>
            <button type="button" @click=${()=>this.openQuestion(t)}>
              ${this.renderInlineIcon("message")}<span>问这一块</span>
            </button>
          </div>
        `:h}
        ${this.questionOpen?this.renderQuestionComposer():h}
      </aside>
    `}renderQuestionComposer(){return m`
      <div class="question-composer">
        <textarea
          class="question-input"
          .value=${this.question}
          placeholder="输入关于当前节点的问题"
          @input=${this.handleQuestionInput}
        ></textarea>
        <div class="question-actions">
          <button class="primary-action" type="button" @click=${this.submitQuestion} ?disabled=${this.asking}>
            ${this.asking?"思考中…":"提问"}
          </button>
          <button type="button" @click=${()=>this.questionOpen=!1}>收起</button>
        </div>
        ${this.answer?m`<div class="answer-box">${this.answer}</div>`:h}
      </div>
    `}handleNodeClick(t){const e=this.popoverOpen&&this.activeNode.id===t.id;this.activeNodeId=t.id,this.questionOpen=!1,this.answer="",this.popoverOpen=!e}openQuestion(t){this.activeNodeId=t.id,this.questionOpen=!0,this.popoverOpen=!0,this.answer="",this.question||(this.question="这一块还能怎么理解？")}handleQuestionInput(t){this.question=t.target.value}async submitQuestion(){if(this.question.trim()){this.asking=!0,this.answer="";try{this.answer=await vt(this.question.trim(),this.buildNodeContext(this.activeNode)),this.recordInteraction(this.activeNode.id,"ask",this.question.trim())}catch(t){this.answer=t instanceof Error?t.message:"提问失败"}finally{this.asking=!1}}}buildNodeContext(t){return[`文章标题：${this.reading?.postTitle||""}`,`节点标题：${t.title}`,`节点类型：${this.kindLabel(t.kind)}`,`节点摘要：${t.summary||""}`,`原文依据：${t.sourceRange?.anchor||""}`,`节点补充：${this.payloadItems(t).join("；")}`].join(`
`)}async recordInteraction(t,e,i){this.postName&&await wt({postName:this.postName,nodeId:t,interactionType:e,value:i,visitorId:this.visitorId})}scrollNodeSource(t){const e=t.sourceRange?.anchor;if(!e)return;const i=this.findTextElement(e);i&&(i.scrollIntoView({behavior:"smooth",block:"center"}),this.highlightElement(i))}findTextElement(t){const e=this.normalizeForSearch(t).slice(0,48);return!e||!document.body?null:document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:a=>{const s=a.parentElement;return!s||s.closest("script,style,noscript,template,likcc-article-reading")?NodeFilter.FILTER_REJECT:this.normalizeForSearch(a.textContent||"").includes(e)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}}).nextNode()?.parentElement||null}highlightElement(t){const e=t.style.outline,i=t.style.outlineOffset,r=t.style.scrollMarginTop;t.style.outline="2px solid var(--likcc-reading-accent, #0f766e)",t.style.outlineOffset="4px",t.style.scrollMarginTop="96px",window.setTimeout(()=>{t.style.outline=e,t.style.outlineOffset=i,t.style.scrollMarginTop=r},1800)}nodeById(t){return this.allNodes.find(e=>e.id===t)}graphNodeViews(){const t=new Map;this.addGraphView(t,this.graph.root,50,50,"root","neutral");const e=this.graph.nodes.filter(o=>o.kind==="tl"),i=this.nodeParentMap(),r=this.nodeToneMap(),a=Math.max(1,e.length),s=this.graphLayoutMetrics(a);e.forEach((o,c)=>{const l=this.branchAngle(c,a),p=this.clampPosition(50+Math.cos(l)*s.branchRadiusX),d=this.clampPosition(50+Math.sin(l)*s.branchRadiusY);this.addGraphView(t,o,p,d,"branch",r.get(o.id)||this.keywordTone(o.title));const y=this.graphChildNodes(o.id).filter(x=>x.kind==="dl"),w=Math.max(1,y.length);y.forEach((x,Vt)=>{const Re=this.childNodePosition(p,d,l,Vt,w,s);this.addGraphView(t,x,Re.x,Re.y,"leaf",r.get(x.id)||r.get(o.id)||this.keywordTone(x.title))})});const n=this.graph.nodes.filter(o=>!t.has(o.id));return n.forEach((o,c)=>{const l=this.branchAngle(c,Math.max(1,n.length)),p=!!i.get(o.id),d=p||o.kind==="dl"?s.orphanLeafRadiusX:s.branchRadiusX,y=p||o.kind==="dl"?s.orphanLeafRadiusY:s.branchRadiusY;this.addGraphView(t,o,this.clampPosition(50+Math.cos(l)*d),this.clampPosition(50+Math.sin(l)*y),o.kind==="tl"?"branch":"leaf",r.get(o.id)||this.keywordTone(o.title))}),Array.from(t.values())}graphLayoutMetrics(t){const e=t>4;if(this.isCompactViewport){const n=e?27:25,o=e?30:28,c=e?17:18,l=e?13:14;return{branchRadiusX:n,branchRadiusY:o,childOffsetX:c,childOffsetY:l,childSpreadX:e?16:17,childSpreadY:e?8.2:8.8,orphanLeafRadiusX:n+c,orphanLeafRadiusY:o+l}}const i=e?25:23,r=e?24:22,a=e?18.5:20.5,s=e?12:13.5;return{branchRadiusX:i,branchRadiusY:r,childOffsetX:a,childOffsetY:s,childSpreadX:e?16.5:17.5,childSpreadY:e?7.2:7.8,orphanLeafRadiusX:i+a,orphanLeafRadiusY:r+s}}childNodePosition(t,e,i,r,a,s){const n=r-(a-1)/2,o=a===1?0:n*s.childSpreadX,c=a===1?0:n*s.childSpreadY,l=this.branchSide(i);if(l==="top"||l==="bottom"){const w=l==="top"?-1:1;return{x:this.clampPosition(t+o),y:this.clampPosition(e+w*s.childOffsetY)}}const p=l==="left"?-1:1,d=Math.sin(i),y=Math.abs(d)>.22?(d<0?-1:1)*r*s.childSpreadY:c;return{x:this.clampPosition(t+p*s.childOffsetX),y:this.clampPosition(e+y)}}branchSide(t){const e=Math.cos(t),i=Math.sin(t);return i<-.86?"top":i>.86?"bottom":e<0?"left":"right"}addGraphView(t,e,i,r,a,s){t.set(e.id,{node:e,x:i,y:r,level:a,tone:s})}graphLinkViews(t){const e=new Map(t.map(s=>[s.node.id,s])),i=this.graph.edges.map(s=>this.linkView(e,s.from,s.to)),r=this.inferredGraphEdges().map(s=>this.linkView(e,s.from,s.to)),a=new Set;return[...i,...r].filter(s=>!!s).filter(s=>{const n=`${s.from.node.id}->${s.to.node.id}`;return a.has(n)?!1:(a.add(n),!0)}).sort((s,n)=>s.level===n.level?0:s.level==="branch"?-1:1)}linkView(t,e,i,r){const a=t.get(e),s=t.get(i);if(!(!a||!s))return{from:a,to:s,tone:r||s.tone||a.tone,level:a.level==="branch"&&s.level==="leaf"?"leaf":"branch"}}linkPath(t){const e=t.to.x-t.from.x,i=t.to.y-t.from.y,r=t.level==="leaf"?.08:.14,a=-i*r,s=e*r;return`M ${t.from.x} ${t.from.y} C ${t.from.x+e*.42+a} ${t.from.y+i*.42+s}, ${t.from.x+e*.58+a} ${t.from.y+i*.58+s}, ${t.to.x} ${t.to.y}`}nodeClass(t){return["graph-node",`graph-node--${t.level}`,`graph-node--${t.node.kind}`,`graph-node--tone-${t.tone}`,this.activeNodeId===t.node.id&&this.popoverOpen?"is-active":""].filter(Boolean).join(" ")}nodeDisplayTitle(t){const e=this.normalizeTitle(t.node.title),i=this.nodeTitleLimit(t.level);if(!e)return"未命名节点";const r=e.split(/[：:]/)[0]?.trim();if(r&&r.length>=2&&this.visualLength(r)<=i)return r;const a=e.split(/[，,。；;、|｜/（(]/)[0]?.trim();return a&&a.length>=2&&this.visualLength(a)<=i?a:this.truncateTitle(e,i)}nodeTitleLimit(t){return t==="root"?this.isCompactViewport?16:22:t==="branch"?this.isCompactViewport?8:10:this.isCompactViewport?7:9}normalizeTitle(t){return t.replace(/\s+/g," ").trim()}truncateTitle(t,e){const i=Array.from(t);let r=0,a="";for(const s of i){const n=this.visualLength(s);if(r+n>e)return`${a.trim()}…`;a+=s,r+=n}return a.trim()}visualLength(t){return Array.from(t).reduce((e,i)=>e+(/[\u3400-\u9fff\uff00-\uffef]/.test(i)?1:.55),0)}toneForNode(t){const e=this.nodeById(t);return this.nodeToneMap().get(t)||this.keywordTone(e?.title||t)}renderNodeIcon(t){return t.level==="root"?this.renderInlineIcon("brain"):this.renderInlineIcon(this.iconNameForNode(t.node,t.level))}branchAngle(t,e){return e===1?0:e===2?t===0?Math.PI:0:Math.PI*2*t/Math.max(1,e)-Math.PI/2}clampPosition(t){const e=this.isCompactViewport?11:8,i=this.isCompactViewport?89:92;return Math.min(i,Math.max(e,t))}nodeParentMap(){const t=new Set(this.allNodes.map(i=>i.id)),e=new Map;return this.graph.edges.forEach(i=>{t.has(i.from)&&t.has(i.to)&&!e.has(i.to)&&e.set(i.to,i.from)}),e}nodeToneMap(){const t=new Map;return this.graph.nodes.filter(i=>i.kind==="tl").forEach((i,r)=>{const a=this.keywordTone(i.title,Ge[r%Ge.length]);t.set(i.id,a),this.graphChildNodes(i.id).forEach(s=>t.set(s.id,a))}),t}inferredGraphEdges(){const t=this.graph.root.id,e=new Set(this.graph.edges.map(s=>`${s.from}->${s.to}`)),i=[],r=this.graph.nodes.filter(s=>s.kind==="tl");r.forEach(s=>{const n=`${t}->${s.id}`;e.has(n)||i.push({from:t,to:s.id})});const a=new Map;return r.forEach((s,n)=>{a.set(String(n+1),s.id)}),this.graph.nodes.filter(s=>s.kind==="dl").forEach(s=>{if(this.graph.edges.some(l=>l.to===s.id))return;const o=s.id.match(/^dl-(\d+)-/),c=o?a.get(o[1]):void 0;c&&i.push({from:c,to:s.id})}),i}keywordTone(t,e="neutral"){const i=t.toLowerCase();return/结论|建议|行动|清单|追问|conclusion|advice|action|question|follow/.test(i)?"conclusion":/背景|来源|上下文|时间|历程|开篇|background|source|timeline/.test(i)?"background":/核心|观点|判断|概念|术语|解释|人物|产品|core|concept|term|people|product/.test(i)?"core":/论据|证据|事实|数据|案例|风险|问题|argument|evidence|data|case|risk/.test(i)?"argument":e}iconNameForNode(t,e){const i=`${t.title} ${t.id}`.toLowerCase();return/背景|来源|上下文|开篇|background|source/.test(i)?"book":/时间|历程|阶段|timeline|history|stage/.test(i)?"timeline":/核心|观点|判断|主张|core|claim|judgment/.test(i)?"star":/证据|依据|事实|数据|evidence|data|fact/.test(i)?"database":/案例|故事|实践|case|story|practice/.test(i)?"file":/步骤|流程|方法|教程|step|process|method|guide/.test(i)?"route":/风险|问题|争议|risk|problem|issue/.test(i)?"alert":/概念|术语|解释|term|concept|explain/.test(i)?"search":/人物|角色|作者|user|people|person|role/.test(i)?"user":/产品|工具|模型|product|tool|model/.test(i)?"box":/行动|建议|清单|todo|action|advice|list/.test(i)?"check":/追问|问题|question|follow/.test(i)?"help":/结论|总结|收束|conclusion|summary/.test(i)||e==="branch"?"flag":"message"}renderInlineIcon(t){return $t({brain:"ri:brain-line",flag:"ri:flag-line",message:"ri:message-3-line",help:"ri:question-line",book:"ri:book-open-line",target:"ri:focus-3-line",monitor:"ri:line-chart-line",star:"ri:star-smile-line",search:"ri:search-line",user:"ri:user-3-line",bar:"ri:bar-chart-line",database:"ri:database-2-line",file:"ri:file-text-line",route:"ri:route-line",timeline:"ri:time-line",alert:"ri:error-warning-line",box:"ri:box-3-line",check:"ri:check-line",rotate:"ri:arrow-go-back-line",x:"ri:close-line"}[t]||"ri:circle-line")}graphChildNodes(t){const e=new Map(this.allNodes.map(r=>[r.id,r])),i=new Set;return this.graph.edges.filter(r=>r.from===t).map(r=>e.get(r.to)).filter(r=>!r||i.has(r.id)?!1:(i.add(r.id),!0))}isBranchNode(t){return this.graphChildNodes(t).length>0}isLegacyGraphNode(t){return t.kind==="overview"||t.kind==="action"||t.id==="overview-30s"||t.id==="overview-conclusion"||t.id==="overview-keypoints"||t.id==="tl-group"||t.id==="dl-group"||t.id==="action-group"||t.id.startsWith("action-")||["30秒概览","一句话结论","3个关键点","TL分块","DL深挖","用户互动","跳回原文","问这一块","收藏节点","点赞反馈"].includes(t.title)}branchChildTitles(t){return this.graphChildNodes(t.id).map(e=>e.title)}payloadItems(t){const e=t.payload?.items;return Array.isArray(e)?e.map(i=>String(i)).filter(Boolean).slice(0,6):[]}kindLabel(t){return It(t)}normalizeForSearch(t){return t.replace(/\s+/g,"").toLowerCase()}isRenderableReading(t){if(!t?.root||!Array.isArray(t.nodes)||!Array.isArray(t.edges)||(t.schemaVersion||0)<Mt)return!1;const e=new Set(t.nodes.filter(s=>s.kind==="tl"&&!!s.id).map(s=>s.id)),i=new Set(t.nodes.filter(s=>s.kind==="dl"&&!!s.id).map(s=>s.id));if(e.size<3||i.size===0)return!1;const r=t.root.id||"root",a=new Set(t.edges.filter(s=>s.from===r).map(s=>s.to));return Array.from(e).every(s=>a.has(s))}isPendingGenerationError(t){return["尚未生成","不存在","需要重建","HTTP 404"].some(e=>t.includes(e))}};b.styles=kt,k([v({type:String,attribute:"post-name"})],b.prototype,"postName",2),k([v({type:String,attribute:"dark-selector"})],b.prototype,"darkSelector",2),k([g()],b.prototype,"reading",2),k([g()],b.prototype,"loading",2),k([g()],b.prototype,"errorMessage",2),k([g()],b.prototype,"notGenerated",2),k([g()],b.prototype,"activeNodeId",2),k([g()],b.prototype,"popoverOpen",2),k([g()],b.prototype,"questionOpen",2),k([g()],b.prototype,"question",2),k([g()],b.prototype,"answer",2),k([g()],b.prototype,"asking",2),k([g()],b.prototype,"isDark",2),k([g()],b.prototype,"isCompactViewport",2),k([g()],b.prototype,"collapsed",2),b=k([_e("likcc-article-reading")],b);function It(t){switch(t){case"root":return"文章";case"tl":return"TL";case"dl":return"DL";default:return t}}const V="ai-summaraidGPT",q="ai-summaraidGPT-data",Ie="likcc-article-summary",Y="ai-summaraidGPT-reading",Lt="likcc-article-reading",W="data-summary-lit-mounted",Le="data-summary-silent-processed";let Q,se;function Rt(){window.likcc_summaraidGPT_scriptLoaded||(console.log("%c智阅GPT-智能AI助手","color: #4F8DFD; font-size: 16px; font-weight: bold;"),console.log("%c智阅点睛，一键洞见——基于AI大模型的Halo智能AI助手","color: #666; font-size: 12px;"),console.log("%c作者: Handsome | 网站: https://lik.cc","color: #999; font-size: 11px;"),window.likcc_summaraidGPT_scriptLoaded=!0)}function zt(t,e,i){t.postName=i.getAttribute("name")||"",t.logo=e.logo||"",t.summaryTitle=e.summaryTitle||"文章摘要",t.gptName=e.gptName||"智阅GPT",t.typeSpeed=e.typeSpeed??20,t.typewriter=e.typewriter??!0,t.darkSelector=e.darkSelector||"",t.uiStyle=e.uiStyle||"simple",t.fixedTone=e.fixedTone||"violet",t.fixedDensity=e.fixedDensity||"compact",t.themeName=e.themeName||"custom",t.theme=e.theme||{}}function Dt(t,e,i){t.postName=i.getAttribute("name")||"",t.darkSelector=e.darkSelector||""}async function ne(t={}){const e=Array.from(document.querySelectorAll(`${V}:not([${W}="true"])`)),i=Array.from(document.querySelectorAll(`${Y}:not([${W}="true"])`));if(e.length===0&&i.length===0)return[];const a={...await ut(),...t},s=e.map(o=>{const c=document.createElement(Ie);return zt(c,a,o),o.setAttribute(W,"true"),o.replaceWith(c),c}),n=i.map(o=>{const c=document.createElement(Lt);return Dt(c,a,o),o.setAttribute(W,"true"),o.replaceWith(c),c});return[...s,...n]}async function Ut(){const t=Array.from(document.querySelectorAll(`${q}:not([${Le}="true"])`));await Promise.all(t.map(async e=>{const i=e.getAttribute("name");if(i){e.setAttribute(Le,"true");try{await Ee(i)}catch(r){console.warn("摘要入库失败:",r)}}}))}async function Bt(){const t=document.querySelectorAll(V),e=document.querySelectorAll(Y),i=document.querySelectorAll(q),r=document.querySelector(Ie);if(t.length>0||e.length>0){await ne();return}i.length>0&&!r&&await Ut()}function M(){Q&&window.clearTimeout(Q),Q=window.setTimeout(()=>{Q=void 0,Bt()},0)}function Ft(t){return t.type!=="childList"?!1:Array.from(t.addedNodes).some(i=>i instanceof Element?i.matches(V)||i.matches(q)||i.matches(Y)||i.querySelector(V)!==null||i.querySelector(q)!==null||i.querySelector(Y)!==null:!1)}function Ht(){se||(se=new MutationObserver(t=>{t.some(Ft)&&M()}),se.observe(document.documentElement,{childList:!0,subtree:!0}))}function jt(){["pjax:success","pjax:complete","swup:content-replaced","swup:page:view","swup:animation:in:end"].forEach(e=>{document.addEventListener(e,M)}),window.swup?.hooks?.on?.("page:view",M),window.swup?.hooks?.on?.("content:replace",M)}Rt(),window.likcc_summaraidGPT_initSummaryBox=ne,window.likcc_summaraidGPT_reinit=ne,Ht(),jt(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{M()},{once:!0}):M()}));
