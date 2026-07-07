(function(w){typeof define=="function"&&define.amd?define(w):w()})((function(){"use strict";const w=globalThis,J=w.ShadowRoot&&(w.ShadyCSS===void 0||w.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Z=Symbol(),oe=new WeakMap;let ce=class{constructor(e,i,r){if(this._$cssResult$=!0,r!==Z)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=i}get styleSheet(){let e=this.o;const i=this.t;if(J&&e===void 0){const r=i!==void 0&&i.length===1;r&&(e=oe.get(i)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&oe.set(i,e))}return e}toString(){return this.cssText}};const Re=t=>new ce(typeof t=="string"?t:t+"",void 0,Z),le=(t,...e)=>{const i=t.length===1?t[0]:e.reduce((r,s,a)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[a+1],t[0]);return new ce(i,t,Z)},ze=(t,e)=>{if(J)t.adoptedStyleSheets=e.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(const i of e){const r=document.createElement("style"),s=w.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}},de=J?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let i="";for(const r of e.cssRules)i+=r.cssText;return Re(i)})(t):t;const{is:Le,defineProperty:De,getOwnPropertyDescriptor:Ue,getOwnPropertyNames:Fe,getOwnPropertySymbols:Be,getPrototypeOf:He}=Object,U=globalThis,he=U.trustedTypes,je=he?he.emptyScript:"",qe=U.reactiveElementPolyfillSupport,O=(t,e)=>t,F={toAttribute(t,e){switch(e){case Boolean:t=t?je:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=t!==null;break;case Number:i=t===null?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch{i=null}}return i}},K=(t,e)=>!Le(t,e),me={attribute:!0,type:String,converter:F,reflect:!1,useDefault:!1,hasChanged:K};Symbol.metadata??=Symbol("metadata"),U.litPropertyMetadata??=new WeakMap;let P=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,i=me){if(i.state&&(i.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(e,i),!i.noAccessor){const r=Symbol(),s=this.getPropertyDescriptor(e,r,i);s!==void 0&&De(this.prototype,e,s)}}static getPropertyDescriptor(e,i,r){const{get:s,set:a}=Ue(this.prototype,e)??{get(){return this[i]},set(n){this[i]=n}};return{get:s,set(n){const c=s?.call(this);a?.call(this,n),this.requestUpdate(e,c,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??me}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;const e=He(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){const i=this.properties,r=[...Fe(i),...Be(i)];for(const s of r)this.createProperty(s,i[s])}const e=this[Symbol.metadata];if(e!==null){const i=litPropertyMetadata.get(e);if(i!==void 0)for(const[r,s]of i)this.elementProperties.set(r,s)}this._$Eh=new Map;for(const[i,r]of this.elementProperties){const s=this._$Eu(i,r);s!==void 0&&this._$Eh.set(s,i)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const i=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const s of r)i.unshift(de(s))}else e!==void 0&&i.push(de(e));return i}static _$Eu(e,i){const r=i.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,i=this.constructor.elementProperties;for(const r of i.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ze(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,i,r){this._$AK(e,r)}_$ET(e,i){const r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){const a=(r.converter?.toAttribute!==void 0?r.converter:F).toAttribute(i,r.type);this._$Em=e,a==null?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(e,i){const r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const a=r.getPropertyOptions(s),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:F;this._$Em=s;const c=n.fromAttribute(i,a.type);this[s]=c??this._$Ej?.get(s)??c,this._$Em=null}}requestUpdate(e,i,r,s=!1,a){if(e!==void 0){const n=this.constructor;if(s===!1&&(a=this[e]),r??=n.getPropertyOptions(e),!((r.hasChanged??K)(a,i)||r.useDefault&&r.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,i,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,i,{useDefault:r,reflect:s,wrapped:a},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??i??this[e]),a!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(i=void 0),this._$AL.set(e,i)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(i){Promise.reject(i)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,a]of this._$Ep)this[s]=a;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[s,a]of r){const{wrapped:n}=a,c=this[s];n!==!0||this._$AL.has(s)||c===void 0||this.C(s,void 0,a,c)}}let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(i)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(i)}willUpdate(e){}_$AE(e){this._$EO?.forEach(i=>i.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(i=>this._$ET(i,this[i])),this._$EM()}updated(e){}firstUpdated(e){}};P.elementStyles=[],P.shadowRootOptions={mode:"open"},P[O("elementProperties")]=new Map,P[O("finalized")]=new Map,qe?.({ReactiveElement:P}),(U.reactiveElementVersions??=[]).push("2.1.2");const X=globalThis,ue=t=>t,B=X.trustedTypes,pe=B?B.createPolicy("lit-html",{createHTML:t=>t}):void 0,ge="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+x,We=`<${fe}>`,T=document,G=()=>T.createComment(""),I=t=>t===null||typeof t!="object"&&typeof t!="function",ee=Array.isArray,Ve=t=>ee(t)||typeof t?.[Symbol.iterator]=="function",te=`[ 	
\f\r]`,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,be=/-->/g,ke=/>/g,S=RegExp(`>|${te}(?:([^\\s"'>=/]+)(${te}*=${te}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ye=/'/g,ve=/"/g,xe=/^(?:script|style|textarea|title)$/i,$e=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),d=$e(1),Ye=$e(2),_=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),we=new WeakMap,A=T.createTreeWalker(T,129);function Te(t,e){if(!ee(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return pe!==void 0?pe.createHTML(e):e}const Qe=(t,e)=>{const i=t.length-1,r=[];let s,a=e===2?"<svg>":e===3?"<math>":"",n=M;for(let c=0;c<i;c++){const o=t[c];let g,b,h=-1,v=0;for(;v<o.length&&(n.lastIndex=v,b=n.exec(o),b!==null);)v=n.lastIndex,n===M?b[1]==="!--"?n=be:b[1]!==void 0?n=ke:b[2]!==void 0?(xe.test(b[2])&&(s=RegExp("</"+b[2],"g")),n=S):b[3]!==void 0&&(n=S):n===S?b[0]===">"?(n=s??M,h=-1):b[1]===void 0?h=-2:(h=n.lastIndex-b[2].length,g=b[1],n=b[3]===void 0?S:b[3]==='"'?ve:ye):n===ve||n===ye?n=S:n===be||n===ke?n=M:(n=S,s=void 0);const $=n===S&&t[c+1].startsWith("/>")?" ":"";a+=n===M?o+We:h>=0?(r.push(g),o.slice(0,h)+ge+o.slice(h)+x+$):o+x+(h===-2?c:$)}return[Te(t,a+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};class R{constructor({strings:e,_$litType$:i},r){let s;this.parts=[];let a=0,n=0;const c=e.length-1,o=this.parts,[g,b]=Qe(e,i);if(this.el=R.createElement(g,r),A.currentNode=this.el.content,i===2||i===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=A.nextNode())!==null&&o.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(const h of s.getAttributeNames())if(h.endsWith(ge)){const v=b[n++],$=s.getAttribute(h).split(x),Q=/([.?@])?(.*)/.exec(v);o.push({type:1,index:a,name:Q[2],strings:$,ctor:Q[1]==="."?Ze:Q[1]==="?"?Ke:Q[1]==="@"?Xe:H}),s.removeAttribute(h)}else h.startsWith(x)&&(o.push({type:6,index:a}),s.removeAttribute(h));if(xe.test(s.tagName)){const h=s.textContent.split(x),v=h.length-1;if(v>0){s.textContent=B?B.emptyScript:"";for(let $=0;$<v;$++)s.append(h[$],G()),A.nextNode(),o.push({type:2,index:++a});s.append(h[v],G())}}}else if(s.nodeType===8)if(s.data===fe)o.push({type:2,index:a});else{let h=-1;for(;(h=s.data.indexOf(x,h+1))!==-1;)o.push({type:7,index:a}),h+=x.length-1}a++}}static createElement(e,i){const r=T.createElement("template");return r.innerHTML=e,r}}function C(t,e,i=t,r){if(e===_)return e;let s=r!==void 0?i._$Co?.[r]:i._$Cl;const a=I(e)?void 0:e._$litDirective$;return s?.constructor!==a&&(s?._$AO?.(!1),a===void 0?s=void 0:(s=new a(t),s._$AT(t,i,r)),r!==void 0?(i._$Co??=[])[r]=s:i._$Cl=s),s!==void 0&&(e=C(t,s._$AS(t,e.values),s,r)),e}class Je{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:i},parts:r}=this._$AD,s=(e?.creationScope??T).importNode(i,!0);A.currentNode=s;let a=A.nextNode(),n=0,c=0,o=r[0];for(;o!==void 0;){if(n===o.index){let g;o.type===2?g=new z(a,a.nextSibling,this,e):o.type===1?g=new o.ctor(a,o.name,o.strings,this,e):o.type===6&&(g=new et(a,this,e)),this._$AV.push(g),o=r[++c]}n!==o?.index&&(a=A.nextNode(),n++)}return A.currentNode=T,s}p(e){let i=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,i),i+=r.strings.length-2):r._$AI(e[i])),i++}}class z{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,i,r,s){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&e?.nodeType===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=C(this,e,i),I(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==_&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ve(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&I(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){const{values:i,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=R.createElement(Te(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(i);else{const a=new Je(s,this),n=a.u(this.options);a.p(i),this.T(n),this._$AH=a}}_$AC(e){let i=we.get(e.strings);return i===void 0&&we.set(e.strings,i=new R(e)),i}k(e){ee(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let r,s=0;for(const a of e)s===i.length?i.push(r=new z(this.O(G()),this.O(G()),this,this.options)):r=i[s],r._$AI(a),s++;s<i.length&&(this._$AR(r&&r._$AB.nextSibling,s),i.length=s)}_$AR(e=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);e!==this._$AB;){const r=ue(e).nextSibling;ue(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,r,s,a){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=i,this._$AM=s,this.options=a,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=l}_$AI(e,i=this,r,s){const a=this.strings;let n=!1;if(a===void 0)e=C(this,e,i,0),n=!I(e)||e!==this._$AH&&e!==_,n&&(this._$AH=e);else{const c=e;let o,g;for(e=a[0],o=0;o<a.length-1;o++)g=C(this,c[r+o],i,o),g===_&&(g=this._$AH[o]),n||=!I(g)||g!==this._$AH[o],g===l?e=l:e!==l&&(e+=(g??"")+a[o+1]),this._$AH[o]=g}n&&!s&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ze extends H{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}}class Ke extends H{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}}class Xe extends H{constructor(e,i,r,s,a){super(e,i,r,s,a),this.type=5}_$AI(e,i=this){if((e=C(this,e,i,0)??l)===_)return;const r=this._$AH,s=e===l&&r!==l||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,a=e!==l&&(r===l||s);s&&this.element.removeEventListener(this.name,this,r),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class et{constructor(e,i,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){C(this,e)}}const tt=X.litHtmlPolyfillSupport;tt?.(R,z),(X.litHtmlVersions??=[]).push("3.3.2");const it=(t,e,i)=>{const r=i?.renderBefore??e;let s=r._$litPart$;if(s===void 0){const a=i?.renderBefore??null;r._$litPart$=s=new z(e.insertBefore(G(),a),a,void 0,i??{})}return s._$AI(t),s};const ie=globalThis;let E=class extends P{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=it(i,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}};E._$litElement$=!0,E.finalized=!0,ie.litElementHydrateSupport?.({LitElement:E});const rt=ie.litElementPolyfillSupport;rt?.({LitElement:E}),(ie.litElementVersions??=[]).push("4.2.2");const st={ATTRIBUTE:1},at=t=>(...e)=>({_$litDirective$:t,values:e});let nt=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,r){this._$Ct=e,this._$AM=i,this._$Ci=r}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};const Se="important",ot=" !"+Se,_e=at(class extends nt{constructor(t){if(super(t),t.type!==st.ATTRIBUTE||t.name!=="style"||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,i)=>{const r=t[i];return r==null?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(t,[e]){const{style:i}=t.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(const r of this.ft)e[r]==null&&(this.ft.delete(r),r.includes("-")?i.removeProperty(r):i[r]=null);for(const r in e){const s=e[r];if(s!=null){this.ft.add(r);const a=typeof s=="string"&&s.endsWith(ot);r.includes("-")||a?i.setProperty(r,a?s.slice(0,-11):s,a?Se:""):i[r]=s}}return _}});const Ae=t=>(e,i)=>{i!==void 0?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};const ct={attribute:!0,type:String,converter:F,reflect:!1,hasChanged:K},lt=(t=ct,e,i)=>{const{kind:r,metadata:s}=i;let a=globalThis.litPropertyMetadata.get(s);if(a===void 0&&globalThis.litPropertyMetadata.set(s,a=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),a.set(i.name,t),r==="accessor"){const{name:n}=i;return{set(c){const o=e.get.call(this);e.set.call(this,c),this.requestUpdate(n,o,t,!0,c)},init(c){return c!==void 0&&this.C(n,void 0,t,c),c}}}if(r==="setter"){const{name:n}=i;return function(c){const o=this[n];e.call(this,c),this.requestUpdate(n,o,t,!0,c)}}throw Error("Unsupported decorator location: "+r)};function k(t){return(e,i)=>typeof i=="object"?lt(t,e,i):((r,s,a)=>{const n=s.hasOwnProperty(a);return s.constructor.createProperty(a,r),n?Object.getOwnPropertyDescriptor(s,a):void 0})(t,e,i)}function p(t){return k({...t,state:!0,attribute:!1})}const dt=le`
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
`,L="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",D={bg:"#f7f9fe",main:"#4F8DFD",contentFontSize:"16px",title:"#3A5A8C",content:"#222",gptName:"#7B88A8",contentBg:"#fff",border:"#e3e8f7",shadow:"0 2px 12px 0 rgba(60,80,180,0.08)",tagBg:"#f0f4ff",tagColor:"#4F8DFD",cursor:"#4F8DFD"},re={logo:"icon.svg",summaryTitle:"文章摘要",gptName:"智阅GPT",typeSpeed:20,darkSelector:"",uiStyle:"simple",fixedTone:"violet",fixedDensity:"compact",themeName:"custom",theme:D,typewriter:!0};function ht(t){if(!t)return{...D};if(typeof t=="string")try{const e=JSON.parse(t);return{...D,...e}}catch{return{...D}}return{...D,...t}}function Pe(t){const e=document.documentElement,i=document.body,r=window.matchMedia?.("(prefers-color-scheme: dark)").matches??!1,s=e.getAttribute("data-color-scheme")||i.getAttribute("data-color-scheme");if(s==="dark")return!0;if(s==="light")return!1;if(s==="auto")return r;if(e.classList.contains("color-scheme-dark")||i.classList.contains("color-scheme-dark")||e.classList.contains("dark")||i.classList.contains("dark"))return!0;if(e.classList.contains("color-scheme-light")||i.classList.contains("color-scheme-light")||e.classList.contains("light")||i.classList.contains("light"))return!1;if(e.classList.contains("color-scheme-auto")||i.classList.contains("color-scheme-auto"))return r;if(!t)return!1;const a=t.match(/^data-([\w-]+)=(.+)$/);if(a){const c=`data-${a[1]}`,o=a[2];return e.getAttribute(c)===o||i.getAttribute(c)===o}const n=t.match(/^class=(.+)$/);if(n){const c=n[1];return e.classList.contains(c)||i.classList.contains(c)}return e.classList.contains(t)||i.classList.contains(t)}function Ce(t,e){const i=document.documentElement,r=document.body,s={attributes:!0,attributeFilter:["class","data-color-scheme"]},a=t.match(/^data-([\w-]+)=(.+)$/);a&&(s.attributeFilter=["class","data-color-scheme",`data-${a[1]}`]);const n=new MutationObserver(e),c=new MutationObserver(e);return n.observe(i,s),c.observe(r,s),[n,c]}async function mt(){try{const t=await fetch(`${L}/summaryConfig`);if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);const e=await t.json();return{...re,...e,theme:e.theme??re.theme}}catch{return{...re}}}async function Ee(t){const e=await fetch(`${L}/updateContent`,{method:"POST",headers:{"Content-Type":"application/json"},body:t});if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);return await e.json()}function ut(t){return t?t.startsWith("http://")||t.startsWith("https://")||t.startsWith("/")||t.startsWith("data:")?t:`/plugins/summaraidGPT/assets/static/${t}`:""}var pt=Object.defineProperty,gt=Object.getOwnPropertyDescriptor,u=(t,e,i,r)=>{for(var s=r>1?void 0:r?gt(e,i):e,a=t.length-1,n;a>=0;a--)(n=t[a])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&pt(e,i,s),s};let m=class extends E{constructor(){super(...arguments),this.postName="",this.logo="",this.summaryTitle="文章摘要",this.gptName="智阅GPT",this.typeSpeed=20,this.typewriter=!0,this.darkSelector="",this.themeName="custom",this.uiStyle="simple",this.fixedTone="violet",this.fixedDensity="compact",this.theme={},this.content="",this.displayContent="",this.loading=!0,this.typing=!1,this.loadFailed=!1,this.isDark=!1,this.themeObservers=[],this.initialized=!1,this.handleSystemColorSchemeChange=()=>{this.refreshThemeMode()}}connectedCallback(){super.connectedCallback(),this.refreshThemeMode(),this.bindThemeObservers(),this.bindSystemColorSchemeListener()}firstUpdated(){this.postName?this.loadSummary():(this.loading=!1,this.loadFailed=!0,this.displayContent="摘要加载失败，请稍后重试"),this.initialized=!0}disconnectedCallback(){super.disconnectedCallback(),this.unbindThemeObservers(),this.unbindSystemColorSchemeListener(),this.stopTypewriter()}updated(t){t.has("darkSelector")&&(this.refreshThemeMode(),this.bindThemeObservers()),this.initialized&&t.has("postName")&&this.postName&&this.loadSummary()}async loadSummary(){this.stopTypewriter(),this.loading=!0,this.loadFailed=!1,this.displayContent="";try{const t=await Ee(this.postName);this.content=t.summaryContent?.trim()||"暂无摘要内容",this.applyContent()}catch(t){console.warn("获取摘要失败:",t),this.content="摘要加载失败，请稍后重试",this.displayContent=this.content,this.loadFailed=!0}finally{this.loading=!1}}applyContent(){if(this.stopTypewriter(),!this.typewriter){this.displayContent=this.content,this.typing=!1;return}this.typing=!0,this.displayContent="";const t=Number.isFinite(this.typeSpeed)?Math.max(this.typeSpeed,0):20;let e=0;const i=()=>{if(e+=1,this.displayContent=this.content.slice(0,e),e>=this.content.length){this.typing=!1,this.typewriterTimer=void 0;return}this.typewriterTimer=window.setTimeout(i,t)};if(!this.content){this.typing=!1;return}i()}stopTypewriter(){this.typing=!1,this.typewriterTimer&&(window.clearTimeout(this.typewriterTimer),this.typewriterTimer=void 0)}refreshThemeMode(){this.isDark=Pe(this.darkSelector)}bindThemeObservers(){this.unbindThemeObservers(),this.themeObservers=Ce(this.darkSelector,()=>{this.refreshThemeMode()})}unbindThemeObservers(){this.themeObservers.forEach(t=>t.disconnect()),this.themeObservers=[]}bindSystemColorSchemeListener(){if(window.matchMedia){if(this.prefersColorSchemeQuery=window.matchMedia("(prefers-color-scheme: dark)"),typeof this.prefersColorSchemeQuery.addEventListener=="function"){this.prefersColorSchemeQuery.addEventListener("change",this.handleSystemColorSchemeChange);return}this.prefersColorSchemeQuery.addListener?.(this.handleSystemColorSchemeChange)}}unbindSystemColorSchemeListener(){this.prefersColorSchemeQuery&&(typeof this.prefersColorSchemeQuery.removeEventListener=="function"?this.prefersColorSchemeQuery.removeEventListener("change",this.handleSystemColorSchemeChange):this.prefersColorSchemeQuery.removeListener?.(this.handleSystemColorSchemeChange),this.prefersColorSchemeQuery=void 0)}get effectiveThemeName(){return this.isDark?"dark":this.themeName==="dark"||this.themeName==="blue"||this.themeName==="green"||this.themeName==="custom"?this.themeName:"default"}get effectiveUiStyle(){return this.uiStyle==="simple"||this.uiStyle==="quiet"?"simple":this.uiStyle==="note"||this.uiStyle==="minimal"||this.uiStyle==="stripe"||this.uiStyle==="inline"?this.uiStyle==="inline"?"inline":"simple":this.themeName==="spotlight"?"simple":"classic"}get customThemeStyles(){if(this.effectiveThemeName!=="custom")return{};const t=ht(this.theme);return{"--likcc-summaraid-bg":t.bg??"","--likcc-summaraid-main":t.main??"","--likcc-summaraid-contentFontSize":t.contentFontSize??"","--likcc-summaraid-title":t.title??"","--likcc-summaraid-content":t.content??"","--likcc-summaraid-gptName":t.gptName??"","--likcc-summaraid-contentBg":t.contentBg??"","--likcc-summaraid-border":t.border??"","--likcc-summaraid-shadow":t.shadow??"","--likcc-summaraid-tagBg":t.tagBg??"","--likcc-summaraid-tagColor":t.tagColor??"","--likcc-summaraid-cursor":t.cursor??""}}get effectiveFixedTone(){return this.fixedTone==="graphite"||this.fixedTone==="copper"?this.fixedTone:"violet"}get effectiveFixedDensity(){return this.fixedDensity==="comfortable"?"comfortable":"compact"}get fixedStyleClassName(){const t=["likcc-summaraidGPT-fixed",`likcc-summaraidGPT-tone--${this.effectiveFixedTone}`,`likcc-summaraidGPT-density--${this.effectiveFixedDensity}`];return this.isDark&&t.push("likcc-summaraidGPT-fixed--dark"),t.join(" ")}render(){return this.effectiveUiStyle==="simple"?this.renderSimpleCard():this.effectiveUiStyle==="inline"?this.renderInlineCard():this.renderClassicCard()}renderClassicCard(){const t=`likcc-summaraidGPT-summary--${this.effectiveThemeName}`,e=ut(this.logo),i=this.loading?"正在生成摘要…":this.displayContent;return d`
      <div class="likcc-summaraidGPT-summary-container ${t}" style=${_e(this.customThemeStyles)}>
        <div class="likcc-summaraidGPT-summary-header">
          <div class="likcc-summaraidGPT-header-left">
            ${e?d`<img class="likcc-summaraidGPT-logo not-prose" src=${e} alt=${this.gptName||"AI Logo"} width="20" height="20" />`:l}
            <span class="likcc-summaraidGPT-summary-title">${this.summaryTitle||"文章摘要"}</span>
          </div>
          <span class="likcc-summaraidGPT-gpt-name">${this.gptName||"智阅GPT"}</span>
        </div>
        <div class="likcc-summaraidGPT-summary-content">
          ${this.loading||this.loadFailed?d`<span style="color:#bbb;">${i}</span>`:i}
          ${this.typing?d`<span class="likcc-summaraidGPT-cursor"></span>`:l}
        </div>
      </div>
    `}renderInlineCard(){const t=this.loading?"正在生成摘要…":this.displayContent,e=this.summaryTitle||"AI 总结";return d`
      <div class="likcc-summaraidGPT-inline-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-inline-shell">
          <div class="likcc-summaraidGPT-inline-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-inline-icon")}
            <span class="likcc-summaraidGPT-inline-title">${e}</span>
          </div>
          <div class="likcc-summaraidGPT-inline-content">
            ${this.loading||this.loadFailed?d`<span style="color:#8892a6;">${t}</span>`:t}
            ${this.typing?d`<span class="likcc-summaraidGPT-cursor"></span>`:l}
          </div>
        </div>
      </div>
    `}renderSimpleCard(){const t=this.loading?"正在生成摘要…":this.displayContent,e=this.summaryTitle||"AI 总结";return d`
      <div class="likcc-summaraidGPT-simple-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-simple-shell">
          <div class="likcc-summaraidGPT-simple-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-simple-icon")}
            <span class="likcc-summaraidGPT-simple-title">${e}</span>
          </div>
          <div class="likcc-summaraidGPT-simple-content">
            ${this.loading||this.loadFailed?d`<span style="color:#8892a6;">${t}</span>`:t}
            ${this.typing?d`<span class="likcc-summaraidGPT-cursor"></span>`:l}
          </div>
        </div>
      </div>
    `}renderSparklesIcon(t){return d`
      <span class=${t} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.22 3.39a.35.35 0 0 1 .66 0l1.52 4.23a.38.38 0 0 0 .22.22l4.23 1.52a.35.35 0 0 1 0 .66l-4.23 1.52a.38.38 0 0 0-.22.22l-1.52 4.23a.35.35 0 0 1-.66 0l-1.52-4.23a.38.38 0 0 0-.22-.22L4.25 10.02a.35.35 0 0 1 0-.66l4.23-1.52a.38.38 0 0 0 .22-.22l1.52-4.23Z" />
          <path d="M18.38 4.18a.24.24 0 0 1 .45 0l.59 1.66c.02.07.08.13.15.15l1.66.59a.24.24 0 0 1 0 .45l-1.66.59a.25.25 0 0 0-.15.15l-.59 1.66a.24.24 0 0 1-.45 0l-.59-1.66a.25.25 0 0 0-.15-.15l-1.66-.59a.24.24 0 0 1 0-.45l1.66-.59a.24.24 0 0 0 .15-.15l.59-1.66Z" />
        </svg>
      </span>
    `}};m.styles=dt,u([k({type:String,attribute:"post-name"})],m.prototype,"postName",2),u([k({type:String})],m.prototype,"logo",2),u([k({type:String,attribute:"summary-title"})],m.prototype,"summaryTitle",2),u([k({type:String,attribute:"gpt-name"})],m.prototype,"gptName",2),u([k({type:Number,attribute:"type-speed"})],m.prototype,"typeSpeed",2),u([k({type:Boolean})],m.prototype,"typewriter",2),u([k({type:String,attribute:"dark-selector"})],m.prototype,"darkSelector",2),u([k({type:String,attribute:"theme-name"})],m.prototype,"themeName",2),u([k({type:String,attribute:"ui-style"})],m.prototype,"uiStyle",2),u([k({type:String,attribute:"fixed-tone"})],m.prototype,"fixedTone",2),u([k({type:String,attribute:"fixed-density"})],m.prototype,"fixedDensity",2),u([k({attribute:!1})],m.prototype,"theme",2),u([p()],m.prototype,"content",2),u([p()],m.prototype,"displayContent",2),u([p()],m.prototype,"loading",2),u([p()],m.prototype,"typing",2),u([p()],m.prototype,"loadFailed",2),u([p()],m.prototype,"isDark",2),m=u([Ae("likcc-article-summary")],m);const ft=le`
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
    stroke-width: 3.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.58;
    vector-effect: non-scaling-stroke;
  }

  .graph-dot {
    fill: var(--likcc-reading-panel);
    stroke: var(--likcc-reading-link);
    stroke-width: 0.42;
    opacity: 0.95;
    vector-effect: non-scaling-stroke;
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
    grid-template-columns: auto max-content;
    align-items: center;
    justify-content: center;
    justify-items: center;
    gap: 0.42rem;
    min-height: 2.36rem;
    min-width: 0;
    width: max-content;
    max-width: 10.8rem;
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
    white-space: nowrap;
    word-break: keep-all;
    overflow-wrap: normal;
    text-align: center;
  }

  .node-icon {
    display: inline-grid;
    place-items: center;
    width: 1.48rem;
    height: 1.48rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--node-color) 12%, #ffffff);
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
    min-width: 5.55rem;
    min-height: 2.58rem;
    font-size: 0.88rem;
    font-weight: 800;
  }

  .graph-node--leaf {
    min-height: 2.34rem;
    min-width: 5.35rem;
    background: color-mix(in srgb, var(--node-color) 5%, var(--likcc-reading-node-soft));
    box-shadow: 0 8px 18px rgba(24, 34, 49, 0.05);
    font-size: 0.76rem;
    font-weight: 720;
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
    background: var(--likcc-reading-node);
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
      aspect-ratio: 4 / 5;
      min-height: 34rem;
    }

    .graph-node {
      min-width: 5.35rem;
      max-width: 6.85rem;
      padding-inline: 0.42rem;
      gap: 0.32rem;
      font-size: 0.72rem;
    }

    .node-icon {
      width: 1.36rem;
      height: 1.36rem;
    }

    .graph-node--root {
      width: 6.45rem;
      height: 6.45rem;
      font-size: 0.68rem;
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
`;async function bt(t){const e=await fetch(`${L}/articleReadings/${encodeURIComponent(t)}`),i=await e.json().catch(()=>{});if(!e.ok)throw new Error(i&&"message"in i&&i.message?i.message:`HTTP ${e.status}: ${e.statusText}`);if(!i||!("spec"in i)||!i.spec)throw new Error(i?.message||"洞察图谱尚未生成");return i}async function kt(t,e){const i=JSON.stringify([{role:"user",content:`${e}

用户问题：${t}`}]),r=await fetch(`${L}/conversation`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationHistory:i})});if(!r.ok)throw new Error(`HTTP ${r.status}: ${r.statusText}`);const s=await r.json();if(s.success===!1)throw new Error(s.message||"提问失败");return s.response||""}async function yt(t){try{await fetch(`${L}/articleReadingInteractions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})}catch(e){console.warn("记录洞察图谱互动失败:",e)}}function vt(){const t="likcc-article-reading-visitor-id",e=window.crypto?.randomUUID?.()||`visitor-${Date.now()}-${Math.random()}`;try{const i=window.localStorage.getItem(t);if(i)return i;window.localStorage.setItem(t,e)}catch{return e}return e}const Ne="ri:book-open-line",Oe="https://api.iconify.design",Ge=/^([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)$/i;function xt(t,e="iconify-icon"){const i=$t(t)||se(Ne);return d`
    <span
      class=${e}
      style=${_e({"--rag-icon-source":`url("${i}")`})}
      aria-hidden="true"
    ></span>
  `}function $t(t){const e=t?.trim();if(e){if(wt(e))return se(e);if(Tt(e))return At(e);if(St(e)||_t(e))return e}}function wt(t){return Ge.test(t)}function se(t){const e=t.match(Ge);if(!e)return se(Ne);const[,i,r]=e;return`${Oe}/${encodeURIComponent(i)}/${encodeURIComponent(r)}.svg`}function Tt(t){return t.startsWith("<svg")&&t.endsWith("</svg>")}function St(t){return t.startsWith("data:image/svg+xml")}function _t(t){try{const e=new URL(t);return e.origin===Oe&&e.pathname.endsWith(".svg")}catch{return!1}}function At(t){return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(t)}`}var Pt=Object.defineProperty,Ct=Object.getOwnPropertyDescriptor,y=(t,e,i,r)=>{for(var s=r>1?void 0:r?Ct(e,i):e,a=t.length-1,n;a>=0;a--)(n=t[a])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Pt(e,i,s),s};const Et=4,Nt=3e3,Ot=600,Gt=["tl-background","dl-problem-source","dl-current-status","tl-core","dl-key-judgment","dl-author-claim","tl-argument","dl-data-fact","dl-case","tl-conclusion","dl-advice","dl-follow-up"],It=[["root","tl-conclusion","conclusion"],["tl-conclusion","dl-advice","conclusion"],["tl-conclusion","dl-follow-up","conclusion"],["root","tl-background","background"],["tl-background","dl-problem-source","background"],["tl-background","dl-current-status","background"],["root","tl-core","core"],["tl-core","dl-key-judgment","core"],["tl-core","dl-author-claim","core"],["root","tl-argument","argument"],["tl-argument","dl-data-fact","argument"],["tl-argument","dl-case","argument"]];let f=class extends E{constructor(){super(...arguments),this.postName="",this.darkSelector="",this.loading=!0,this.errorMessage="",this.notGenerated=!1,this.activeNodeId="",this.popoverOpen=!1,this.questionOpen=!1,this.question="",this.answer="",this.asking=!1,this.isDark=!1,this.collapsed=!1,this.themeObservers=[],this.visitorId="",this.initialized=!1,this.pollAttempts=0,this.toggleCollapsed=()=>{this.collapsed=!this.collapsed,this.popoverOpen=!1,this.questionOpen=!1},this.closePopover=()=>{this.popoverOpen=!1}}connectedCallback(){super.connectedCallback(),this.visitorId=vt(),this.refreshThemeMode(),this.bindThemeObservers()}firstUpdated(){this.loadReading(),this.initialized=!0}disconnectedCallback(){super.disconnectedCallback(),this.clearPollTimer(),this.unbindThemeObservers()}updated(t){t.has("darkSelector")&&(this.refreshThemeMode(),this.bindThemeObservers()),this.initialized&&t.has("postName")&&this.loadReading()}async loadReading(t=!1){if(!this.postName){this.loading=!1,this.errorMessage="文章名称为空";return}t||(this.loading=!0),this.errorMessage="",this.popoverOpen=!1,this.questionOpen=!1;try{const e=await bt(this.postName);if(!this.isRenderableReading(e.spec)){this.reading=void 0,this.notGenerated=!0,this.scheduleExistingPoll();return}this.clearPollTimer(),this.pollAttempts=0,this.reading=e.spec,this.notGenerated=!1,this.activeNodeId=this.graph.root.id}catch(e){console.warn("洞察图谱加载失败:",e);const i=e instanceof Error?e.message:"洞察图谱加载失败";this.isPendingGenerationError(i)?(this.notGenerated=!0,this.scheduleExistingPoll()):this.errorMessage=i}finally{this.loading=!1}}scheduleExistingPoll(){this.clearPollTimer(),!(this.pollAttempts>=Ot)&&(this.pollAttempts+=1,this.pollTimer=window.setTimeout(()=>{this.pollTimer=void 0,this.loadReading(!0)},Nt))}clearPollTimer(){this.pollTimer&&(window.clearTimeout(this.pollTimer),this.pollTimer=void 0)}refreshThemeMode(){this.isDark=Pe(this.darkSelector)}bindThemeObservers(){this.unbindThemeObservers(),this.themeObservers=Ce(this.darkSelector,()=>{this.refreshThemeMode()})}unbindThemeObservers(){this.themeObservers.forEach(t=>t.disconnect()),this.themeObservers=[]}get graph(){const t=this.reading?.root||{id:"root",title:this.reading?.postTitle||"文章标题",kind:"root",summary:"洞察图谱"},e=(this.reading?.nodes||[]).filter(r=>!this.isLegacyGraphNode(r)),i=new Set([t.id,...e.map(r=>r.id)]);return{root:t,nodes:e,edges:(this.reading?.edges||[]).filter(r=>i.has(r.from)&&i.has(r.to))}}get allNodes(){return[this.graph.root,...this.graph.nodes.filter(t=>t.id!==this.graph.root.id)]}get activeNode(){return this.nodeById(this.activeNodeId)||this.graph.root}render(){const t=this.isDark?"reading-shell is-dark":"reading-shell";return d`
      <section class=${t}>
        <button
          class="reading-collapse"
          type="button"
          aria-expanded=${String(!this.collapsed)}
          @click=${this.toggleCollapsed}
        >
          <span>${this.collapsed?"展开洞察图谱":"收起洞察图谱"}</span>
          <span class="collapse-mark" aria-hidden="true">${this.collapsed?"+":"-"}</span>
        </button>
        ${this.collapsed?l:this.renderBody()}
      </section>
    `}renderBody(){return this.loading?d`<div class="state-box">正在读取洞察图谱…</div>`:this.notGenerated?d`
        <div class="state-box">
          洞察图谱正在后台生成，完成后会自动刷新显示，无需手动刷新页面。
        </div>
      `:this.errorMessage?d`<div class="state-box">${this.errorMessage}</div>`:this.reading?this.renderGraph():d`<div class="state-box">暂无洞察图谱</div>`}renderGraph(){const t=this.graphNodeViews(),e=this.graphLinkViews(t);return d`
      <div class="insight-graph">
        <div class="graph-canvas">
          <div class="graph-board">
            <svg class="graph-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${e.map(i=>Ye`
                <path
                  class=${`graph-link graph-link--${i.tone}`}
                  d=${this.linkPath(i)}
                ></path>
                <circle
                  class=${`graph-dot graph-dot--${i.tone}`}
                  cx=${i.to.x}
                  cy=${i.to.y}
                  r="0.72"
                ></circle>
              `)}
            </svg>
            ${t.map(i=>d`
              <button
                class=${this.nodeClass(i)}
                type="button"
                style=${`left:${i.x}%;top:${i.y}%`}
                @click=${()=>this.handleNodeClick(i.node)}
                aria-label=${i.node.title}
              >
                <span class="node-icon" aria-hidden="true">${this.renderNodeIcon(i)}</span>
                <span class="node-title">${i.node.title}</span>
              </button>
            `)}
          </div>
          ${this.popoverOpen?this.renderPopover():l}
        </div>
      </div>
    `}renderPopover(){const t=this.activeNode,e=this.payloadItems(t);return d`
      <aside class=${`node-popover node-popover--${this.toneForNode(t.id)}`}>
        <div class="popover-head">
          <button class="icon-button" type="button" @click=${this.closePopover} aria-label="关闭详情">
            ${this.renderInlineIcon("x")}
          </button>
        </div>
        <h3>${t.title}</h3>
        ${t.summary?d`<p>${t.summary}</p>`:l}
        ${!t.summary&&this.isBranchNode(t.id)?d`
          <p>${this.branchChildTitles(t).join(" / ")}</p>
        `:l}
        ${t.sourceRange?.anchor?d`
          <button class="source-anchor" type="button" @click=${()=>this.scrollNodeSource(t)}>
            ${t.sourceRange.anchor}
          </button>
        `:l}
        ${e.length>0?d`
          <ul class="payload-list">
            ${e.map(i=>d`<li>${i}</li>`)}
          </ul>
        `:l}
        ${t.kind!=="root"?d`
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
        `:l}
        ${this.questionOpen?this.renderQuestionComposer():l}
      </aside>
    `}renderQuestionComposer(){return d`
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
        ${this.answer?d`<div class="answer-box">${this.answer}</div>`:l}
      </div>
    `}handleNodeClick(t){const e=this.popoverOpen&&this.activeNode.id===t.id;this.activeNodeId=t.id,this.questionOpen=!1,this.answer="",this.popoverOpen=!e}openQuestion(t){this.activeNodeId=t.id,this.questionOpen=!0,this.popoverOpen=!0,this.answer="",this.question||(this.question="这一块还能怎么理解？")}handleQuestionInput(t){this.question=t.target.value}async submitQuestion(){if(this.question.trim()){this.asking=!0,this.answer="";try{this.answer=await kt(this.question.trim(),this.buildNodeContext(this.activeNode)),this.recordInteraction(this.activeNode.id,"ask",this.question.trim())}catch(t){this.answer=t instanceof Error?t.message:"提问失败"}finally{this.asking=!1}}}buildNodeContext(t){return[`文章标题：${this.reading?.postTitle||""}`,`节点标题：${t.title}`,`节点类型：${this.kindLabel(t.kind)}`,`节点摘要：${t.summary||""}`,`原文依据：${t.sourceRange?.anchor||""}`,`节点补充：${this.payloadItems(t).join("；")}`].join(`
`)}async recordInteraction(t,e,i){this.postName&&await yt({postName:this.postName,nodeId:t,interactionType:e,value:i,visitorId:this.visitorId})}scrollNodeSource(t){const e=t.sourceRange?.anchor;if(!e)return;const i=this.findTextElement(e);i&&(i.scrollIntoView({behavior:"smooth",block:"center"}),this.highlightElement(i))}findTextElement(t){const e=this.normalizeForSearch(t).slice(0,48);return!e||!document.body?null:document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:s=>{const a=s.parentElement;return!a||a.closest("script,style,noscript,template,likcc-article-reading")?NodeFilter.FILTER_REJECT:this.normalizeForSearch(s.textContent||"").includes(e)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}}).nextNode()?.parentElement||null}highlightElement(t){const e=t.style.outline,i=t.style.outlineOffset,r=t.style.scrollMarginTop;t.style.outline="2px solid var(--likcc-reading-accent, #0f766e)",t.style.outlineOffset="4px",t.style.scrollMarginTop="96px",window.setTimeout(()=>{t.style.outline=e,t.style.outlineOffset=i,t.style.scrollMarginTop=r},1800)}nodeById(t){return this.allNodes.find(e=>e.id===t)}graphNodeViews(){const t=new Map;this.addGraphView(t,this.graph.root,50,50,"root","neutral"),Object.entries({"tl-conclusion":{x:50,y:27,level:"branch",tone:"conclusion"},"dl-advice":{x:38,y:15,level:"leaf",tone:"conclusion"},"dl-follow-up":{x:62,y:15,level:"leaf",tone:"conclusion"},"tl-background":{x:69,y:50,level:"branch",tone:"background"},"dl-problem-source":{x:84,y:37,level:"leaf",tone:"background"},"dl-current-status":{x:84,y:63,level:"leaf",tone:"background"},"tl-core":{x:50,y:74,level:"branch",tone:"core"},"dl-key-judgment":{x:39,y:87,level:"leaf",tone:"core"},"dl-author-claim":{x:61,y:87,level:"leaf",tone:"core"},"tl-argument":{x:31,y:50,level:"branch",tone:"argument"},"dl-data-fact":{x:16,y:37,level:"leaf",tone:"argument"},"dl-case":{x:16,y:63,level:"leaf",tone:"argument"}}).forEach(([r,s])=>{const a=this.nodeById(r);a&&this.addGraphView(t,a,s.x,s.y,s.level,s.tone)});const i=this.graph.nodes.filter(r=>!t.has(r.id));return i.forEach((r,s)=>{const a=Math.PI*2*s/Math.max(1,i.length)-Math.PI/2,n=this.isBranchNode(r.id)?28:38;this.addGraphView(t,r,50+Math.cos(a)*n,50+Math.sin(a)*n,this.isBranchNode(r.id)?"branch":"leaf",this.toneForNode(r.id))}),Array.from(t.values())}addGraphView(t,e,i,r,s,a){t.set(e.id,{node:e,x:i,y:r,level:s,tone:a})}graphLinkViews(t){const e=new Map(t.map(a=>[a.node.id,a])),i=It.map(([a,n,c])=>this.linkView(e,a,n,c)),r=this.graph.edges.map(a=>this.linkView(e,a.from,a.to)),s=new Set;return[...i,...r].filter(a=>!!a).filter(a=>{const n=`${a.from.node.id}->${a.to.node.id}`;return s.has(n)?!1:(s.add(n),!0)})}linkView(t,e,i,r){const s=t.get(e),a=t.get(i);return s&&a?{from:s,to:a,tone:r||a.tone||s.tone}:void 0}linkPath(t){const e=t.to.x-t.from.x,i=t.to.y-t.from.y;return Math.abs(e)>Math.abs(i)?`M ${t.from.x} ${t.from.y} C ${t.from.x+e*.44} ${t.from.y}, ${t.from.x+e*.56} ${t.to.y}, ${t.to.x} ${t.to.y}`:`M ${t.from.x} ${t.from.y} C ${t.from.x} ${t.from.y+i*.44}, ${t.to.x} ${t.from.y+i*.56}, ${t.to.x} ${t.to.y}`}nodeClass(t){return["graph-node",`graph-node--${t.level}`,`graph-node--${t.node.kind}`,`graph-node--tone-${t.tone}`,this.activeNodeId===t.node.id&&this.popoverOpen?"is-active":""].filter(Boolean).join(" ")}toneForNode(t){return t.includes("conclusion")||t.includes("advice")||t.includes("follow")?"conclusion":t.includes("background")||t.includes("problem")||t.includes("status")?"background":t.includes("core")||t.includes("judgment")||t.includes("claim")?"core":t.includes("argument")||t.includes("data")||t.includes("case")?"argument":"neutral"}renderNodeIcon(t){if(t.level==="root")return this.renderInlineIcon("brain");switch(t.node.id){case"tl-conclusion":return this.renderInlineIcon("flag");case"dl-advice":return this.renderInlineIcon("message");case"dl-follow-up":return this.renderInlineIcon("help");case"tl-background":return this.renderInlineIcon("book");case"dl-problem-source":return this.renderInlineIcon("target");case"dl-current-status":return this.renderInlineIcon("monitor");case"tl-core":return this.renderInlineIcon("star");case"dl-key-judgment":return this.renderInlineIcon("search");case"dl-author-claim":return this.renderInlineIcon("user");case"tl-argument":return this.renderInlineIcon("bar");case"dl-data-fact":return this.renderInlineIcon("database");case"dl-case":return this.renderInlineIcon("file");default:return this.renderInlineIcon(t.node.kind==="tl"?"flag":"message")}}renderInlineIcon(t){return xt({brain:"ri:brain-line",flag:"ri:flag-line",message:"ri:message-3-line",help:"ri:question-line",book:"ri:book-open-line",target:"ri:focus-3-line",monitor:"ri:line-chart-line",star:"ri:star-smile-line",search:"ri:search-line",user:"ri:user-3-line",bar:"ri:bar-chart-line",database:"ri:database-2-line",file:"ri:file-text-line",rotate:"ri:arrow-go-back-line",x:"ri:close-line"}[t]||"ri:circle-line")}graphChildNodes(t){const e=new Map(this.allNodes.map(r=>[r.id,r])),i=new Set;return this.graph.edges.filter(r=>r.from===t).map(r=>e.get(r.to)).filter(r=>!r||i.has(r.id)?!1:(i.add(r.id),!0))}isBranchNode(t){return this.graphChildNodes(t).length>0}isLegacyGraphNode(t){return t.kind==="overview"||t.kind==="action"||t.id==="overview-30s"||t.id==="overview-conclusion"||t.id==="overview-keypoints"||t.id==="tl-group"||t.id==="dl-group"||t.id==="action-group"||t.id.startsWith("action-")||["30秒概览","一句话结论","3个关键点","TL分块","DL深挖","用户互动","跳回原文","问这一块","收藏节点","点赞反馈"].includes(t.title)}branchChildTitles(t){return this.graphChildNodes(t.id).map(e=>e.title)}payloadItems(t){const e=t.payload?.items;return Array.isArray(e)?e.map(i=>String(i)).filter(Boolean).slice(0,6):[]}kindLabel(t){return Mt(t)}normalizeForSearch(t){return t.replace(/\s+/g,"").toLowerCase()}isRenderableReading(t){if(!t?.root||!Array.isArray(t.nodes)||!Array.isArray(t.edges)||(t.schemaVersion||0)<Et)return!1;const e=new Set([t.root.id,...t.nodes.map(i=>i.id)]);return Gt.every(i=>e.has(i))}isPendingGenerationError(t){return["尚未生成","不存在","需要重建","HTTP 404"].some(e=>t.includes(e))}};f.styles=ft,y([k({type:String,attribute:"post-name"})],f.prototype,"postName",2),y([k({type:String,attribute:"dark-selector"})],f.prototype,"darkSelector",2),y([p()],f.prototype,"reading",2),y([p()],f.prototype,"loading",2),y([p()],f.prototype,"errorMessage",2),y([p()],f.prototype,"notGenerated",2),y([p()],f.prototype,"activeNodeId",2),y([p()],f.prototype,"popoverOpen",2),y([p()],f.prototype,"questionOpen",2),y([p()],f.prototype,"question",2),y([p()],f.prototype,"answer",2),y([p()],f.prototype,"asking",2),y([p()],f.prototype,"isDark",2),y([p()],f.prototype,"collapsed",2),f=y([Ae("likcc-article-reading")],f);function Mt(t){switch(t){case"root":return"文章";case"tl":return"TL";case"dl":return"DL";default:return t}}const j="ai-summaraidGPT",q="ai-summaraidGPT-data",Ie="likcc-article-summary",W="ai-summaraidGPT-reading",Rt="likcc-article-reading",V="data-summary-lit-mounted",Me="data-summary-silent-processed";let Y,ae;function zt(){window.likcc_summaraidGPT_scriptLoaded||(console.log("%c智阅GPT-智能AI助手","color: #4F8DFD; font-size: 16px; font-weight: bold;"),console.log("%c智阅点睛，一键洞见——基于AI大模型的Halo智能AI助手","color: #666; font-size: 12px;"),console.log("%c作者: Handsome | 网站: https://lik.cc","color: #999; font-size: 11px;"),window.likcc_summaraidGPT_scriptLoaded=!0)}function Lt(t,e,i){t.postName=i.getAttribute("name")||"",t.logo=e.logo||"",t.summaryTitle=e.summaryTitle||"文章摘要",t.gptName=e.gptName||"智阅GPT",t.typeSpeed=e.typeSpeed??20,t.typewriter=e.typewriter??!0,t.darkSelector=e.darkSelector||"",t.uiStyle=e.uiStyle||"simple",t.fixedTone=e.fixedTone||"violet",t.fixedDensity=e.fixedDensity||"compact",t.themeName=e.themeName||"custom",t.theme=e.theme||{}}function Dt(t,e,i){t.postName=i.getAttribute("name")||"",t.darkSelector=e.darkSelector||""}async function ne(t={}){const e=Array.from(document.querySelectorAll(`${j}:not([${V}="true"])`)),i=Array.from(document.querySelectorAll(`${W}:not([${V}="true"])`));if(e.length===0&&i.length===0)return[];const s={...await mt(),...t},a=e.map(c=>{const o=document.createElement(Ie);return Lt(o,s,c),c.setAttribute(V,"true"),c.replaceWith(o),o}),n=i.map(c=>{const o=document.createElement(Rt);return Dt(o,s,c),c.setAttribute(V,"true"),c.replaceWith(o),o});return[...a,...n]}async function Ut(){const t=Array.from(document.querySelectorAll(`${q}:not([${Me}="true"])`));await Promise.all(t.map(async e=>{const i=e.getAttribute("name");if(i){e.setAttribute(Me,"true");try{await Ee(i)}catch(r){console.warn("摘要入库失败:",r)}}}))}async function Ft(){const t=document.querySelectorAll(j),e=document.querySelectorAll(W),i=document.querySelectorAll(q),r=document.querySelector(Ie);if(t.length>0||e.length>0){await ne();return}i.length>0&&!r&&await Ut()}function N(){Y&&window.clearTimeout(Y),Y=window.setTimeout(()=>{Y=void 0,Ft()},0)}function Bt(t){return t.type!=="childList"?!1:Array.from(t.addedNodes).some(i=>i instanceof Element?i.matches(j)||i.matches(q)||i.matches(W)||i.querySelector(j)!==null||i.querySelector(q)!==null||i.querySelector(W)!==null:!1)}function Ht(){ae||(ae=new MutationObserver(t=>{t.some(Bt)&&N()}),ae.observe(document.documentElement,{childList:!0,subtree:!0}))}function jt(){["pjax:success","pjax:complete","swup:content-replaced","swup:page:view","swup:animation:in:end"].forEach(e=>{document.addEventListener(e,N)}),window.swup?.hooks?.on?.("page:view",N),window.swup?.hooks?.on?.("content:replace",N)}zt(),window.likcc_summaraidGPT_initSummaryBox=ne,window.likcc_summaraidGPT_reinit=ne,Ht(),jt(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{N()},{once:!0}):N()}));
