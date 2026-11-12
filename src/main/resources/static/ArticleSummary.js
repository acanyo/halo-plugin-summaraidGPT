(function(C){typeof define=="function"&&define.amd?define(C):C()})((function(){"use strict";const C=globalThis,se=C.ShadowRoot&&(C.ShadyCSS===void 0||C.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,re=Symbol(),ue=new WeakMap;let ge=class{constructor(e,i,s){if(this._$cssResult$=!0,s!==re)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=i}get styleSheet(){let e=this.o;const i=this.t;if(se&&e===void 0){const s=i!==void 0&&i.length===1;s&&(e=ue.get(i)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ue.set(i,e))}return e}toString(){return this.cssText}};const fe=t=>new ge(typeof t=="string"?t:t+"",void 0,re),be=(t,...e)=>{const i=t.length===1?t[0]:e.reduce((s,r,a)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[a+1],t[0]);return new ge(i,t,re)},Je=(t,e)=>{if(se)t.adoptedStyleSheets=e.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(const i of e){const s=document.createElement("style"),r=C.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}},ye=se?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let i="";for(const s of e.cssRules)i+=s.cssText;return fe(i)})(t):t;const{is:Xe,defineProperty:Ke,getOwnPropertyDescriptor:et,getOwnPropertyNames:tt,getOwnPropertySymbols:it,getPrototypeOf:st}=Object,B=globalThis,ve=B.trustedTypes,rt=ve?ve.emptyScript:"",at=B.reactiveElementPolyfillSupport,R=(t,e)=>t,V={toAttribute(t,e){switch(e){case Boolean:t=t?rt:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=t!==null;break;case Number:i=t===null?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch{i=null}}return i}},ae=(t,e)=>!Xe(t,e),xe={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:ae};Symbol.metadata??=Symbol("metadata"),B.litPropertyMetadata??=new WeakMap;let N=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,i=xe){if(i.state&&(i.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(e,i),!i.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(e,s,i);r!==void 0&&Ke(this.prototype,e,r)}}static getPropertyDescriptor(e,i,s){const{get:r,set:a}=et(this.prototype,e)??{get(){return this[i]},set(n){this[i]=n}};return{get:r,set(n){const o=r?.call(this);a?.call(this,n),this.requestUpdate(e,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??xe}static _$Ei(){if(this.hasOwnProperty(R("elementProperties")))return;const e=st(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(R("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(R("properties"))){const i=this.properties,s=[...tt(i),...it(i)];for(const r of s)this.createProperty(r,i[r])}const e=this[Symbol.metadata];if(e!==null){const i=litPropertyMetadata.get(e);if(i!==void 0)for(const[s,r]of i)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[i,s]of this.elementProperties){const r=this._$Eu(i,s);r!==void 0&&this._$Eh.set(r,i)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const i=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)i.unshift(ye(r))}else e!==void 0&&i.push(ye(e));return i}static _$Eu(e,i){const s=i.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,i=this.constructor.elementProperties;for(const s of i.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Je(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,i,s){this._$AK(e,s)}_$ET(e,i){const s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){const a=(s.converter?.toAttribute!==void 0?s.converter:V).toAttribute(i,s.type);this._$Em=e,a==null?this.removeAttribute(r):this.setAttribute(r,a),this._$Em=null}}_$AK(e,i){const s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const a=s.getPropertyOptions(r),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:V;this._$Em=r;const o=n.fromAttribute(i,a.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(e,i,s,r=!1,a){if(e!==void 0){const n=this.constructor;if(r===!1&&(a=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??ae)(a,i)||s.useDefault&&s.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,i,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,i,{useDefault:s,reflect:r,wrapped:a},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??i??this[e]),a!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(i=void 0),this._$AL.set(e,i)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(i){Promise.reject(i)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,a]of this._$Ep)this[r]=a;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,a]of s){const{wrapped:n}=a,o=this[r];n!==!0||this._$AL.has(r)||o===void 0||this.C(r,void 0,a,o)}}let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(i)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(i)}willUpdate(e){}_$AE(e){this._$EO?.forEach(i=>i.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(i=>this._$ET(i,this[i])),this._$EM()}updated(e){}firstUpdated(e){}};N.elementStyles=[],N.shadowRootOptions={mode:"open"},N[R("elementProperties")]=new Map,N[R("finalized")]=new Map,at?.({ReactiveElement:N}),(B.reactiveElementVersions??=[]).push("2.1.2");const ne=globalThis,ke=t=>t,W=ne.trustedTypes,$e=W?W.createPolicy("lit-html",{createHTML:t=>t}):void 0,we="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,Te="?"+A,nt=`<${Te}>`,_=document,z=()=>_.createComment(""),D=t=>t===null||typeof t!="object"&&typeof t!="function",oe=Array.isArray,ot=t=>oe(t)||typeof t?.[Symbol.iterator]=="function",le=`[ 	
\f\r]`,q=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Se=/-->/g,Ae=/>/g,E=RegExp(`>|${le}(?:([^\\s"'>=/]+)(${le}*=${le}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ce=/'/g,_e=/"/g,Ee=/^(?:script|style|textarea|title)$/i,Pe=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),h=Pe(1),Me=Pe(2),P=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),Ne=new WeakMap,M=_.createTreeWalker(_,129);function Oe(t,e){if(!oe(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return $e!==void 0?$e.createHTML(e):e}const lt=(t,e)=>{const i=t.length-1,s=[];let r,a=e===2?"<svg>":e===3?"<math>":"",n=q;for(let o=0;o<i;o++){const l=t[o];let p,u,d=-1,f=0;for(;f<l.length&&(n.lastIndex=f,u=n.exec(l),u!==null);)f=n.lastIndex,n===q?u[1]==="!--"?n=Se:u[1]!==void 0?n=Ae:u[2]!==void 0?(Ee.test(u[2])&&(r=RegExp("</"+u[2],"g")),n=E):u[3]!==void 0&&(n=E):n===E?u[0]===">"?(n=r??q,d=-1):u[1]===void 0?d=-2:(d=n.lastIndex-u[2].length,p=u[1],n=u[3]===void 0?E:u[3]==='"'?_e:Ce):n===_e||n===Ce?n=E:n===Se||n===Ae?n=q:(n=E,r=void 0);const w=n===E&&t[o+1].startsWith("/>")?" ":"";a+=n===q?l+nt:d>=0?(s.push(p),l.slice(0,d)+we+l.slice(d)+A+w):l+A+(d===-2?o:w)}return[Oe(t,a+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class U{constructor({strings:e,_$litType$:i},s){let r;this.parts=[];let a=0,n=0;const o=e.length-1,l=this.parts,[p,u]=lt(e,i);if(this.el=U.createElement(p,s),M.currentNode=this.el.content,i===2||i===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(r=M.nextNode())!==null&&l.length<o;){if(r.nodeType===1){if(r.hasAttributes())for(const d of r.getAttributeNames())if(d.endsWith(we)){const f=u[n++],w=r.getAttribute(d).split(A),T=/([.?@])?(.*)/.exec(f);l.push({type:1,index:a,name:T[2],strings:w,ctor:T[1]==="."?dt:T[1]==="?"?ht:T[1]==="@"?mt:Q}),r.removeAttribute(d)}else d.startsWith(A)&&(l.push({type:6,index:a}),r.removeAttribute(d));if(Ee.test(r.tagName)){const d=r.textContent.split(A),f=d.length-1;if(f>0){r.textContent=W?W.emptyScript:"";for(let w=0;w<f;w++)r.append(d[w],z()),M.nextNode(),l.push({type:2,index:++a});r.append(d[f],z())}}}else if(r.nodeType===8)if(r.data===Te)l.push({type:2,index:a});else{let d=-1;for(;(d=r.data.indexOf(A,d+1))!==-1;)l.push({type:7,index:a}),d+=A.length-1}a++}}static createElement(e,i){const s=_.createElement("template");return s.innerHTML=e,s}}function O(t,e,i=t,s){if(e===P)return e;let r=s!==void 0?i._$Co?.[s]:i._$Cl;const a=D(e)?void 0:e._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),a===void 0?r=void 0:(r=new a(t),r._$AT(t,i,s)),s!==void 0?(i._$Co??=[])[s]=r:i._$Cl=r),r!==void 0&&(e=O(t,r._$AS(t,e.values),r,s)),e}class ct{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:i},parts:s}=this._$AD,r=(e?.creationScope??_).importNode(i,!0);M.currentNode=r;let a=M.nextNode(),n=0,o=0,l=s[0];for(;l!==void 0;){if(n===l.index){let p;l.type===2?p=new H(a,a.nextSibling,this,e):l.type===1?p=new l.ctor(a,l.name,l.strings,this,e):l.type===6&&(p=new pt(a,this,e)),this._$AV.push(p),l=s[++o]}n!==l?.index&&(a=M.nextNode(),n++)}return M.currentNode=_,r}p(e){let i=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,i),i+=s.strings.length-2):s._$AI(e[i])),i++}}class H{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,i,s,r){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&e?.nodeType===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=O(this,e,i),D(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==P&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ot(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(_.createTextNode(e)),this._$AH=e}$(e){const{values:i,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=U.createElement(Oe(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(i);else{const a=new ct(r,this),n=a.u(this.options);a.p(i),this.T(n),this._$AH=a}}_$AC(e){let i=Ne.get(e.strings);return i===void 0&&Ne.set(e.strings,i=new U(e)),i}k(e){oe(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,r=0;for(const a of e)r===i.length?i.push(s=new H(this.O(z()),this.O(z()),this,this.options)):s=i[r],s._$AI(a),r++;r<i.length&&(this._$AR(s&&s._$AB.nextSibling,r),i.length=r)}_$AR(e=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);e!==this._$AB;){const s=ke(e).nextSibling;ke(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,s,r,a){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=i,this._$AM=r,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=m}_$AI(e,i=this,s,r){const a=this.strings;let n=!1;if(a===void 0)e=O(this,e,i,0),n=!D(e)||e!==this._$AH&&e!==P,n&&(this._$AH=e);else{const o=e;let l,p;for(e=a[0],l=0;l<a.length-1;l++)p=O(this,o[s+l],i,l),p===P&&(p=this._$AH[l]),n||=!D(p)||p!==this._$AH[l],p===m?e=m:e!==m&&(e+=(p??"")+a[l+1]),this._$AH[l]=p}n&&!r&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class dt extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}}class ht extends Q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}}class mt extends Q{constructor(e,i,s,r,a){super(e,i,s,r,a),this.type=5}_$AI(e,i=this){if((e=O(this,e,i,0)??m)===P)return;const s=this._$AH,r=e===m&&s!==m||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==m&&(s===m||r);r&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class pt{constructor(e,i,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}}const ut=ne.litHtmlPolyfillSupport;ut?.(U,H),(ne.litHtmlVersions??=[]).push("3.3.2");const gt=(t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(r===void 0){const a=i?.renderBefore??null;s._$litPart$=r=new H(e.insertBefore(z(),a),a,void 0,i??{})}return r._$AI(t),r};const ce=globalThis;let G=class extends N{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=gt(i,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return P}};G._$litElement$=!0,G.finalized=!0,ce.litElementHydrateSupport?.({LitElement:G});const ft=ce.litElementPolyfillSupport;ft?.({LitElement:G}),(ce.litElementVersions??=[]).push("4.2.2");const bt={ATTRIBUTE:1},yt=t=>(...e)=>({_$litDirective$:t,values:e});let vt=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,s){this._$Ct=e,this._$AM=i,this._$Ci=s}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};const Ge="important",xt=" !"+Ge,kt=yt(class extends vt{constructor(t){if(super(t),t.type!==bt.ATTRIBUTE||t.name!=="style"||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,i)=>{const s=t[i];return s==null?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(t,[e]){const{style:i}=t.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(const s of this.ft)e[s]==null&&(this.ft.delete(s),s.includes("-")?i.removeProperty(s):i[s]=null);for(const s in e){const r=e[s];if(r!=null){this.ft.add(s);const a=typeof r=="string"&&r.endsWith(xt);s.includes("-")||a?i.setProperty(s,a?r.slice(0,-11):r,a?Ge:""):i[s]=r}}return P}});const Le=t=>(e,i)=>{i!==void 0?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};const $t={attribute:!0,type:String,converter:V,reflect:!1,hasChanged:ae},wt=(t=$t,e,i)=>{const{kind:s,metadata:r}=i;let a=globalThis.litPropertyMetadata.get(r);if(a===void 0&&globalThis.litPropertyMetadata.set(r,a=new Map),s==="setter"&&((t=Object.create(t)).wrapped=!0),a.set(i.name,t),s==="accessor"){const{name:n}=i;return{set(o){const l=e.get.call(this);e.set.call(this,o),this.requestUpdate(n,l,t,!0,o)},init(o){return o!==void 0&&this.C(n,void 0,t,o),o}}}if(s==="setter"){const{name:n}=i;return function(o){const l=this[n];e.call(this,o),this.requestUpdate(n,l,t,!0,o)}}throw Error("Unsupported decorator location: "+s)};function $(t){return(e,i)=>typeof i=="object"?wt(t,e,i):((s,r,a)=>{const n=r.hasOwnProperty(a);return r.constructor.createProperty(a,s),n?Object.getOwnPropertyDescriptor(r,a):void 0})(t,e,i)}function b(t){return $({...t,state:!0,attribute:!1})}const Tt=be`
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
`,Ie="/plugins/plugin-lingui/assets/reader/lingui-reader.js",Re="/plugins/plugin-lingui/assets/reader/lingui-reader.css",de="lingui-component",St="zhiyue.summary";let F;function At(){return customElements.get(de)?Promise.resolve():F||(F=new Promise((t,e)=>{const i=Array.from(document.scripts).find(o=>new URL(o.src||document.baseURI,document.baseURI).pathname===Ie),s=i||document.createElement("script"),r=window.setTimeout(()=>n(),1e4);function a(){window.clearTimeout(r),s.removeEventListener("error",n)}function n(){a(),i||s.remove(),e(new Error("灵构 UI 渲染资源不可用"))}if(s.addEventListener("error",n,{once:!0}),customElements.whenDefined(de).then(()=>{a(),t()}),i||(s.src=Ie,s.defer=!0,document.head.append(s)),!document.querySelector(`link[href="${Re}"]`)){const o=document.createElement("link");o.rel="stylesheet",o.href=Re,document.head.append(o)}}).catch(t=>{throw F=void 0,t}),F)}function Ct(t,e,i,s,r){let a=!1,n,o;const l=new Set;function p(){a=!0,window.clearTimeout(o),n?.remove()}function u(){a||(p(),r())}return At().then(()=>{a||!t.isConnected||(n=document.createElement(de),n.slot="lingui-summary",n.setAttribute("data-lingui",e),n.interactions={inheritRegistered:!1,requests:{allow:()=>!1},callbacks:{[St]:(d,f)=>(f.runId&&l.add(f.runId),{...i})},onEvent:d=>{a||d.scope||!d.runId||!l.has(d.runId)||(d.phase==="success"?(window.clearTimeout(o),s()):d.phase==="error"&&u())}},o=window.setTimeout(u,18e3),t.append(n))}).catch(u),p}const L="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",j={bg:"#f7f9fe",main:"#4F8DFD",contentFontSize:"16px",title:"#3A5A8C",content:"#222",gptName:"#7B88A8",contentBg:"#fff",border:"#e3e8f7",shadow:"0 2px 12px 0 rgba(60,80,180,0.08)",tagBg:"#f0f4ff",tagColor:"#4F8DFD",cursor:"#4F8DFD"},he={logo:"icon.svg",summaryTitle:"文章摘要",gptName:"智阅GPT",typeSpeed:20,darkSelector:"",uiStyle:"simple",linguiProjectId:"",fixedTone:"violet",fixedDensity:"compact",themeName:"custom",theme:j,typewriter:!0,readingDefaultCollapsed:!1};function _t(t){if(!t)return{...j};if(typeof t=="string")try{const e=JSON.parse(t);return{...j,...e}}catch{return{...j}}return{...j,...t}}function ze(t){const e=document.documentElement,i=document.body,s=window.matchMedia?.("(prefers-color-scheme: dark)").matches??!1,r=e.getAttribute("data-color-scheme")||i.getAttribute("data-color-scheme");if(r==="dark")return!0;if(r==="light")return!1;if(r==="auto")return s;const a=e.getAttribute("data-theme")||i.getAttribute("data-theme")||e.getAttribute("data-mode")||i.getAttribute("data-mode")||e.getAttribute("data-bs-theme")||i.getAttribute("data-bs-theme");if(a==="dark")return!0;if(a==="light")return!1;if(a==="auto"||a==="system")return s;if(e.classList.contains("color-scheme-dark")||i.classList.contains("color-scheme-dark")||e.classList.contains("dark")||i.classList.contains("dark"))return!0;if(e.classList.contains("color-scheme-light")||i.classList.contains("color-scheme-light")||e.classList.contains("light")||i.classList.contains("light"))return!1;if(e.classList.contains("color-scheme-auto")||i.classList.contains("color-scheme-auto")||!t)return s;const n=t.match(/^data-([\w-]+)=(.+)$/);if(n){const l=`data-${n[1]}`,p=n[2];return e.getAttribute(l)===p||i.getAttribute(l)===p}const o=t.match(/^class=(.+)$/);if(o){const l=o[1];return e.classList.contains(l)||i.classList.contains(l)}return e.classList.contains(t)||i.classList.contains(t)}function De(t,e){const i=document.documentElement,s=document.body,r={attributes:!0,attributeFilter:["class","data-color-scheme","data-theme","data-mode","data-bs-theme"]},a=t.match(/^data-([\w-]+)=(.+)$/);a&&(r.attributeFilter=["class","data-color-scheme","data-theme","data-mode","data-bs-theme",`data-${a[1]}`]);const n=new MutationObserver(e),o=new MutationObserver(e);return n.observe(i,r),o.observe(s,r),[n,o]}async function Et(){try{const t=await fetch(`${L}/summaryConfig`);if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);const e=await t.json();return{...he,...e,theme:e.theme??he.theme}}catch{return{...he}}}async function qe(t){const e=await fetch(`${L}/updateContent`,{method:"POST",headers:{"Content-Type":"application/json"},body:t});if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);return await e.json()}function Pt(t){return t?t.startsWith("http://")||t.startsWith("https://")||t.startsWith("/")||t.startsWith("data:")?t:`/plugins/summaraidGPT/assets/static/${t}`:""}var Mt=Object.defineProperty,Nt=Object.getOwnPropertyDescriptor,y=(t,e,i,s)=>{for(var r=s>1?void 0:s?Nt(e,i):e,a=t.length-1,n;a>=0;a--)(n=t[a])&&(r=(s?n(e,i,r):n(r))||r);return s&&r&&Mt(e,i,r),r};let g=class extends G{constructor(){super(...arguments),this.postName="",this.logo="",this.summaryTitle="文章摘要",this.gptName="智阅GPT",this.typeSpeed=20,this.typewriter=!0,this.darkSelector="",this.themeName="custom",this.uiStyle="simple",this.linguiProjectId="",this.fixedTone="violet",this.fixedDensity="compact",this.theme={},this.content="",this.displayContent="",this.loading=!0,this.typing=!1,this.loadFailed=!1,this.isDark=!1,this.linguiReady=!1,this.themeObservers=[],this.summaryGeneration=0,this.handleSystemColorSchemeChange=()=>{this.refreshThemeMode()}}connectedCallback(){super.connectedCallback(),this.refreshThemeMode(),this.bindThemeObservers(),this.bindSystemColorSchemeListener(),this.hasUpdated&&this.requestUpdate("postName")}disconnectedCallback(){super.disconnectedCallback(),this.unbindThemeObservers(),this.unbindSystemColorSchemeListener(),this.stopTypewriter(),this.summaryGeneration++,this.resetLingui()}updated(t){this.isConnected&&(t.has("darkSelector")&&(this.refreshThemeMode(),this.bindThemeObservers()),t.has("postName")?this.postName?this.loadSummary():(this.summaryGeneration++,this.resetLingui(),this.stopTypewriter(),this.loading=!1,this.loadFailed=!0,this.displayContent="摘要加载失败，请稍后重试"):(t.has("linguiProjectId")||t.has("uiStyle")||t.has("summaryTitle")||t.has("gptName"))&&this.syncLingui())}async loadSummary(){const t=++this.summaryGeneration;this.resetLingui(),this.stopTypewriter(),this.loading=!0,this.loadFailed=!1,this.displayContent="";try{const e=await qe(this.postName);if(t!==this.summaryGeneration)return;this.content=e.summaryContent?.trim()||"暂无摘要内容",this.applyContent()}catch(e){if(t!==this.summaryGeneration)return;console.warn("获取摘要失败:",e),this.content="摘要加载失败，请稍后重试",this.displayContent=this.content,this.loadFailed=!0}finally{t===this.summaryGeneration&&(this.loading=!1,this.syncLingui())}}resetLingui(){this.disposeLingui?.(),this.disposeLingui=void 0,this.linguiReady=!1}syncLingui(){this.resetLingui(),!(this.uiStyle!=="lingui"||!this.linguiProjectId.trim()||this.loading||this.loadFailed||!this.isConnected)&&(this.disposeLingui=Ct(this,this.linguiProjectId.trim(),{title:this.summaryTitle||"文章摘要",gptName:this.gptName||"智阅GPT",content:this.content,postId:this.postName,loading:!1,error:""},()=>{this.linguiReady=!0},()=>{this.linguiReady=!1}))}applyContent(){if(this.stopTypewriter(),!this.typewriter){this.displayContent=this.content,this.typing=!1;return}this.typing=!0,this.displayContent="";const t=Number.isFinite(this.typeSpeed)?Math.max(this.typeSpeed,0):20;let e=0;const i=()=>{if(e+=1,this.displayContent=this.content.slice(0,e),e>=this.content.length){this.typing=!1,this.typewriterTimer=void 0;return}this.typewriterTimer=window.setTimeout(i,t)};if(!this.content){this.typing=!1;return}i()}stopTypewriter(){this.typing=!1,this.typewriterTimer&&(window.clearTimeout(this.typewriterTimer),this.typewriterTimer=void 0)}refreshThemeMode(){this.isDark=ze(this.darkSelector)}bindThemeObservers(){this.unbindThemeObservers(),this.themeObservers=De(this.darkSelector,()=>{this.refreshThemeMode()})}unbindThemeObservers(){this.themeObservers.forEach(t=>t.disconnect()),this.themeObservers=[]}bindSystemColorSchemeListener(){if(window.matchMedia){if(this.prefersColorSchemeQuery=window.matchMedia("(prefers-color-scheme: dark)"),typeof this.prefersColorSchemeQuery.addEventListener=="function"){this.prefersColorSchemeQuery.addEventListener("change",this.handleSystemColorSchemeChange);return}this.prefersColorSchemeQuery.addListener?.(this.handleSystemColorSchemeChange)}}unbindSystemColorSchemeListener(){this.prefersColorSchemeQuery&&(typeof this.prefersColorSchemeQuery.removeEventListener=="function"?this.prefersColorSchemeQuery.removeEventListener("change",this.handleSystemColorSchemeChange):this.prefersColorSchemeQuery.removeListener?.(this.handleSystemColorSchemeChange),this.prefersColorSchemeQuery=void 0)}get effectiveThemeName(){return this.isDark?"dark":this.themeName==="dark"||this.themeName==="blue"||this.themeName==="green"||this.themeName==="custom"?this.themeName:"default"}get effectiveUiStyle(){return this.uiStyle==="simple"||this.uiStyle==="quiet"?"simple":this.uiStyle==="note"||this.uiStyle==="minimal"||this.uiStyle==="stripe"||this.uiStyle==="inline"?this.uiStyle==="inline"?"inline":"simple":this.themeName==="spotlight"?"simple":"classic"}get customThemeStyles(){if(this.effectiveThemeName!=="custom")return{};const t=_t(this.theme);return{"--likcc-summaraid-bg":t.bg??"","--likcc-summaraid-main":t.main??"","--likcc-summaraid-contentFontSize":t.contentFontSize??"","--likcc-summaraid-title":t.title??"","--likcc-summaraid-content":t.content??"","--likcc-summaraid-gptName":t.gptName??"","--likcc-summaraid-contentBg":t.contentBg??"","--likcc-summaraid-border":t.border??"","--likcc-summaraid-shadow":t.shadow??"","--likcc-summaraid-tagBg":t.tagBg??"","--likcc-summaraid-tagColor":t.tagColor??"","--likcc-summaraid-cursor":t.cursor??""}}get effectiveFixedTone(){return this.fixedTone==="graphite"||this.fixedTone==="copper"?this.fixedTone:"violet"}get effectiveFixedDensity(){return this.fixedDensity==="comfortable"?"comfortable":"compact"}get fixedStyleClassName(){const t=["likcc-summaraidGPT-fixed",`likcc-summaraidGPT-tone--${this.effectiveFixedTone}`,`likcc-summaraidGPT-density--${this.effectiveFixedDensity}`];return this.isDark&&t.push("likcc-summaraidGPT-fixed--dark"),t.join(" ")}render(){return this.uiStyle==="lingui"?h`
        <div ?hidden=${!this.linguiReady}><slot name="lingui-summary"></slot></div>
        ${this.linguiReady?m:this.renderSimpleCard()}
      `:this.effectiveUiStyle==="simple"?this.renderSimpleCard():this.effectiveUiStyle==="inline"?this.renderInlineCard():this.renderClassicCard()}renderClassicCard(){const t=`likcc-summaraidGPT-summary--${this.effectiveThemeName}`,e=Pt(this.logo),i=this.loading?"正在生成摘要…":this.displayContent;return h`
      <div class="likcc-summaraidGPT-summary-container ${t}" style=${kt(this.customThemeStyles)}>
        <div class="likcc-summaraidGPT-summary-header">
          <div class="likcc-summaraidGPT-header-left">
            ${e?h`<img class="likcc-summaraidGPT-logo not-prose" src=${e} alt=${this.gptName||"AI Logo"} width="20" height="20" />`:m}
            <span class="likcc-summaraidGPT-summary-title">${this.summaryTitle||"文章摘要"}</span>
          </div>
          <span class="likcc-summaraidGPT-gpt-name">${this.gptName||"智阅GPT"}</span>
        </div>
        <div class="likcc-summaraidGPT-summary-content">
          ${this.loading||this.loadFailed?h`<span style="color:#bbb;">${i}</span>`:i}
          ${this.typing?h`<span class="likcc-summaraidGPT-cursor"></span>`:m}
        </div>
      </div>
    `}renderInlineCard(){const t=this.loading?"正在生成摘要…":this.displayContent,e=this.summaryTitle||"AI 总结";return h`
      <div class="likcc-summaraidGPT-inline-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-inline-shell">
          <div class="likcc-summaraidGPT-inline-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-inline-icon")}
            <span class="likcc-summaraidGPT-inline-title">${e}</span>
          </div>
          <div class="likcc-summaraidGPT-inline-content">
            ${this.loading||this.loadFailed?h`<span style="color:#8892a6;">${t}</span>`:t}
            ${this.typing?h`<span class="likcc-summaraidGPT-cursor"></span>`:m}
          </div>
        </div>
      </div>
    `}renderSimpleCard(){const t=this.loading?"正在生成摘要…":this.displayContent,e=this.summaryTitle||"AI 总结";return h`
      <div class="likcc-summaraidGPT-simple-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-simple-shell">
          <div class="likcc-summaraidGPT-simple-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-simple-icon")}
            <span class="likcc-summaraidGPT-simple-title">${e}</span>
          </div>
          <div class="likcc-summaraidGPT-simple-content">
            ${this.loading||this.loadFailed?h`<span style="color:#8892a6;">${t}</span>`:t}
            ${this.typing?h`<span class="likcc-summaraidGPT-cursor"></span>`:m}
          </div>
        </div>
      </div>
    `}renderSparklesIcon(t){return h`
      <span class=${t} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.22 3.39a.35.35 0 0 1 .66 0l1.52 4.23a.38.38 0 0 0 .22.22l4.23 1.52a.35.35 0 0 1 0 .66l-4.23 1.52a.38.38 0 0 0-.22.22l-1.52 4.23a.35.35 0 0 1-.66 0l-1.52-4.23a.38.38 0 0 0-.22-.22L4.25 10.02a.35.35 0 0 1 0-.66l4.23-1.52a.38.38 0 0 0 .22-.22l1.52-4.23Z" />
          <path d="M18.38 4.18a.24.24 0 0 1 .45 0l.59 1.66c.02.07.08.13.15.15l1.66.59a.24.24 0 0 1 0 .45l-1.66.59a.25.25 0 0 0-.15.15l-.59 1.66a.24.24 0 0 1-.45 0l-.59-1.66a.25.25 0 0 0-.15-.15l-1.66-.59a.24.24 0 0 1 0-.45l1.66-.59a.24.24 0 0 0 .15-.15l.59-1.66Z" />
        </svg>
      </span>
    `}};g.styles=Tt,y([$({type:String,attribute:"post-name"})],g.prototype,"postName",2),y([$({type:String})],g.prototype,"logo",2),y([$({type:String,attribute:"summary-title"})],g.prototype,"summaryTitle",2),y([$({type:String,attribute:"gpt-name"})],g.prototype,"gptName",2),y([$({type:Number,attribute:"type-speed"})],g.prototype,"typeSpeed",2),y([$({type:Boolean})],g.prototype,"typewriter",2),y([$({type:String,attribute:"dark-selector"})],g.prototype,"darkSelector",2),y([$({type:String,attribute:"theme-name"})],g.prototype,"themeName",2),y([$({type:String,attribute:"ui-style"})],g.prototype,"uiStyle",2),y([$({type:String,attribute:"lingui-project-id"})],g.prototype,"linguiProjectId",2),y([$({type:String,attribute:"fixed-tone"})],g.prototype,"fixedTone",2),y([$({type:String,attribute:"fixed-density"})],g.prototype,"fixedDensity",2),y([$({attribute:!1})],g.prototype,"theme",2),y([b()],g.prototype,"content",2),y([b()],g.prototype,"displayContent",2),y([b()],g.prototype,"loading",2),y([b()],g.prototype,"typing",2),y([b()],g.prototype,"loadFailed",2),y([b()],g.prototype,"isDark",2),y([b()],g.prototype,"linguiReady",2),g=y([Le("likcc-article-summary")],g);const Ot=[fe(".ig-reader{--ig-bg: var(--sw-bg, #fff);--ig-surface: var(--sw-sidebar, #fafafa);--ig-subtle: var(--sw-subtle, #f1f1f1);--ig-text: var(--sw-text, #171717);--ig-muted: var(--sw-muted, #737373);--ig-line: var(--sw-border, #e5e5e5);--ig-accent: #267566;container:insight-reader / inline-size;overflow:hidden;border:1px solid var(--ig-line);border-radius:14px;background:var(--ig-bg);color:var(--ig-text);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif;font-size:13px;line-height:1.5;text-align:left}.ig-reader.is-dark{--ig-bg: #212121;--ig-surface: #1b1b1b;--ig-subtle: #303030;--ig-text: #ececec;--ig-muted: #a0a0a0;--ig-line: #3a3a3a;--ig-accent: #89c7b2}.ig-reader *{box-sizing:border-box}.ig-reader button{font:inherit;cursor:pointer;color:inherit}.ig-reader button:disabled{opacity:.4;cursor:default}.ig-reader :is(button,a,textarea,[tabindex]):focus-visible{outline:2px solid var(--ig-accent);outline-offset:3px}.ig-toolbar{display:flex;justify-content:space-between;flex-wrap:wrap;align-items:center;gap:12px;min-height:60px;padding:12px 16px;border-bottom:1px solid var(--ig-line)}.ig-modes{display:flex;gap:3px;padding:3px;border-radius:9px;background:var(--ig-subtle)}.ig-modes button{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:4px 11px;border:0;border-radius:7px;background:transparent;font-size:12px;color:var(--ig-muted)}.ig-modes button[aria-pressed=true]{background:var(--ig-bg);color:var(--ig-text);box-shadow:0 1px 3px #0000000d}.ig-toolbar-actions{display:flex;align-items:center;gap:3px}.ig-reader .ig-tool{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:30px;min-width:30px;padding:5px 8px;border:0;border-radius:7px;background:transparent;color:var(--ig-muted);font-size:11px}.ig-reader .ig-tool:hover{background:var(--ig-subtle);color:var(--ig-text)}.ig-zoom-label{min-width:37px;text-align:center;color:var(--ig-muted);font-size:11px;font-variant-numeric:tabular-nums}.ig-tool-divider{width:1px;height:16px;margin:0 7px;background:var(--ig-line)}.ig-workspace{display:grid;grid-template-columns:minmax(0,1fr);min-width:0}.ig-workspace.has-detail{grid-template-columns:minmax(0,1fr) 270px}.ig-viewport{position:relative;min-width:0;height:510px;overflow:auto;overscroll-behavior:contain;background:var(--ig-surface);cursor:grab;scrollbar-width:thin;scrollbar-color:var(--ig-line) transparent}.ig-viewport[data-panning=true]{cursor:grabbing;-webkit-user-select:none;user-select:none}.ig-scroll-area{display:grid;place-items:center;min-width:100%;min-height:100%;padding:20px}.ig-board-frame{position:relative;flex-shrink:0}.ig-board{position:absolute;inset:0;transform-origin:top left}.ig-links{position:absolute;inset:0;overflow:visible;pointer-events:none}.ig-link{fill:none;stroke:var(--ig-line);stroke-width:1.5;vector-effect:non-scaling-stroke;transition:stroke .15s}.ig-link.is-active{stroke:var(--ig-accent);stroke-width:2}.ig-reader .ig-node{position:absolute;display:flex;align-items:center;gap:10px;padding:10px 13px;border:1px solid var(--ig-line);border-radius:10px;background:var(--ig-bg);color:var(--ig-text);text-align:left;box-shadow:0 2px 5px #00000003;transition:border-color .15s,box-shadow .15s}.ig-reader .ig-node:hover{border-color:var(--ig-muted);box-shadow:0 3px 9px #00000008}.ig-reader .ig-node.is-active{border-color:var(--ig-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--ig-accent) 12%,transparent)}.ig-reader .ig-node--root{flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;background:var(--ig-text);color:var(--ig-bg);border-color:var(--ig-text);padding:14px 18px}.ig-reader .ig-node--root.is-active{border-color:var(--ig-text);box-shadow:0 0 0 3px color-mix(in srgb,var(--ig-text) 12%,transparent)}.ig-node-kicker{opacity:.6;font-size:10px;letter-spacing:.6px}.ig-node-marker{display:grid;flex-shrink:0;place-items:center;width:22px;height:22px;border-radius:6px;background:var(--ig-subtle);color:var(--ig-muted);font-size:11px}.ig-node--leaf .ig-node-marker{width:5px;height:5px;margin:0 6px;border-radius:50%;background:var(--ig-muted)}.ig-node-title{display:-webkit-box;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere;font-size:13px;font-weight:500;line-height:1.45}.ig-node--root .ig-node-title{font-size:14px;font-weight:550}.ig-detail{min-width:0;max-height:510px;overflow:auto;border-left:1px solid var(--ig-line);padding:22px;background:var(--ig-bg)}.ig-detail-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.ig-detail-kicker{font-size:10px;color:var(--ig-muted);letter-spacing:.5px}.ig-detail h3{margin:0;font-size:17px;font-weight:550;line-height:1.6;letter-spacing:-.3px}.ig-detail p{margin:12px 0 0;font-size:13px;color:var(--ig-muted);line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere}.ig-source{margin:20px 0 0;padding:12px 14px;border-left:2px solid var(--ig-line);background:var(--ig-surface);border-radius:0 8px 8px 0}.ig-source small{display:block;margin-bottom:5px;color:var(--ig-muted);font-size:10px}.ig-source blockquote{margin:0;color:var(--ig-muted);font-size:12px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}.ig-items{display:grid;gap:9px;margin:20px 0 0;padding-left:16px;color:var(--ig-text);list-style:disc;font-size:12px;line-height:1.8}.ig-items li::marker{color:var(--ig-muted)}.ig-detail-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.ig-detail-actions :is(a,button){display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;padding:6px 11px;border:1px solid var(--ig-line);border-radius:999px;background:var(--ig-bg);color:var(--ig-text);font-size:11px;text-decoration:none}.ig-detail-actions :is(a,button):hover{background:var(--ig-subtle)}.ig-outline{min-width:0;height:510px;overflow:auto;padding:24px;background:var(--ig-surface)}.ig-reader .ig-outline-node{display:block;width:100%;padding:11px 13px;border:1px solid transparent;border-radius:9px;background:transparent;text-align:left}.ig-reader .ig-outline-node:hover{background:var(--ig-subtle)}.ig-reader .ig-outline-node.is-active{border-color:var(--ig-line);background:var(--ig-bg)}.ig-outline-node strong{display:block;font-size:13px;font-weight:500;line-height:1.7}.ig-outline-node small{display:-webkit-box;margin-top:5px;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:var(--ig-muted);font-size:12px;line-height:1.8}.ig-outline-children{margin:4px 0 12px 17px;padding-left:12px;border-left:1px solid var(--ig-line)}.ig-outline-children .ig-outline-node strong{color:var(--ig-muted);font-size:12px}.ig-footnote{display:flex;justify-content:space-between;flex-wrap:wrap;gap:7px;padding:10px 16px;border-top:1px solid var(--ig-line);color:var(--ig-muted);font-size:10px;line-height:1.7}@container insight-reader (max-width: 700px){.ig-workspace.has-detail{grid-template-columns:minmax(0,1fr)}.ig-detail{max-height:360px;border-left:0;border-top:1px solid var(--ig-line)}.ig-viewport,.ig-outline{height:430px}.ig-toolbar{padding:10px 12px;gap:7px}.ig-tool-divider{margin:0 2px}.ig-reader .ig-tool{padding:5px}.ig-outline{padding:16px}}@media(prefers-reduced-motion:reduce){.ig-reader *{transition:none!important;scroll-behavior:auto!important}}"),be`
    :host {
      display: block;
      width: 100%;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .reading-shell {
      --reading-bg: #fff;
      --reading-surface: #fafafa;
      --reading-text: #171717;
      --reading-muted: #737373;
      --reading-line: #e5e5e5;
      --likcc-reading-accent: #267566;
      overflow: hidden;
      margin: 24px 0;
      border: 1px solid var(--reading-line);
      border-radius: 16px;
      background: var(--reading-bg);
      color: var(--reading-text);
    }
    .reading-shell.is-dark {
      --reading-bg: #212121;
      --reading-surface: #1b1b1b;
      --reading-text: #ececec;
      --reading-muted: #a0a0a0;
      --reading-line: #3a3a3a;
      --likcc-reading-accent: #89c7b2;
    }
    .reading-shell * {
      box-sizing: border-box;
    }
    .reading-shell button {
      font: inherit;
      cursor: pointer;
    }
    .reading-shell button:focus-visible,
    .reading-shell textarea:focus-visible {
      outline: 2px solid var(--likcc-reading-accent);
      outline-offset: 3px;
    }
    .reading-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 22px;
      border-bottom: 1px solid var(--reading-line);
    }
    .reading-heading {
      display: flex;
      align-items: center;
      gap: 11px;
    }
    .reading-heading strong {
      display: block;
      font-size: 14px;
      font-weight: 550;
    }
    .reading-heading small {
      display: block;
      margin-top: 3px;
      color: var(--reading-muted);
      font-size: 11px;
    }
    .reading-mark {
      display: inline-grid;
      flex-shrink: 0;
      place-items: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--reading-line);
      border-radius: 9px;
      background: var(--reading-surface);
      color: var(--reading-text);
    }
    .reading-mark .reading-icon {
      width: 17px;
      height: 17px;
    }
    .reading-collapse {
      display: flex;
      align-items: center;
      gap: 7px;
      min-height: 32px;
      padding: 4px 9px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--reading-muted);
      font-size: 11px !important;
    }
    .reading-collapse:hover {
      background: var(--reading-surface);
    }
    .reading-collapsed {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 16px 20px;
      border: 0;
      background: transparent;
      color: var(--reading-text);
      text-align: left;
    }
    .reading-collapsed:hover {
      background: var(--reading-surface);
    }
    .reading-collapsed strong {
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 550;
    }
    .collapsed-summary {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
      color: var(--reading-muted);
    }
    .collapse-mark {
      display: inline-flex;
      color: var(--reading-muted);
    }
    .reading-icon {
      display: inline-block;
      flex-shrink: 0;
      vertical-align: middle;
    }
    .state-box {
      min-height: 170px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
      text-align: center;
      font-size: 12px;
      color: var(--reading-muted);
      line-height: 1.9;
    }
    .reading-shell .ig-reader {
      border: 0;
      border-radius: 0;
    }
    .question-composer {
      margin-top: 20px;
      padding-top: 18px;
      border-top: 1px solid var(--ig-line);
    }
    .question-input {
      display: block;
      width: 100%;
      min-height: 84px;
      resize: vertical;
      padding: 12px;
      border: 1px solid var(--ig-line);
      border-radius: 10px;
      background: var(--ig-surface);
      color: var(--ig-text);
      font: inherit;
      font-size: 12px;
      line-height: 1.8;
    }
    .question-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }
    .question-actions button {
      min-height: 30px;
      padding: 5px 12px;
      border: 1px solid var(--ig-line);
      border-radius: 999px;
      background: var(--ig-bg);
      color: var(--ig-muted);
      font-size: 11px;
    }
    .question-actions .primary-action {
      background: var(--ig-text);
      border-color: var(--ig-text);
      color: var(--ig-bg);
    }
    .question-actions button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .answer-box {
      margin-top: 16px;
      padding: 14px;
      border: 1px solid var(--ig-line);
      border-radius: 10px;
      background: var(--ig-surface);
      color: var(--ig-text);
      font-size: 12px;
      line-height: 1.9;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    @media (max-width: 640px) {
      .reading-header {
        padding: 15px 16px;
      }
      .reading-collapsed {
        gap: 9px;
        padding: 14px;
      }
      .reading-mark {
        width: 29px;
        height: 29px;
      }
    }
  `];async function Gt(t){const e=await fetch(`${L}/articleReadings/${encodeURIComponent(t)}`),i=await e.json().catch(()=>{});if(!e.ok)throw new Error(i&&"message"in i&&i.message?i.message:`HTTP ${e.status}: ${e.statusText}`);if(!i||!("spec"in i)||!i.spec)throw new Error(i?.message||"洞察图谱尚未生成");return i}async function Lt(t,e){const i=JSON.stringify([{role:"user",content:`${e}

用户问题：${t}`}]),s=await fetch(`${L}/conversation`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationHistory:i})});if(!s.ok){const a=await s.json().catch(()=>{});throw new Error(a?.detail||a?.message||`HTTP ${s.status}: ${s.statusText}`)}const r=await s.json();if(r.success===!1)throw new Error(r.message||"提问失败");return r.response||""}async function It(t){try{await fetch(`${L}/articleReadingInteractions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})}catch(e){console.warn("记录洞察图谱互动失败:",e)}}function Rt(){const t="likcc-article-reading-visitor-id",e=window.crypto?.randomUUID?.()||`visitor-${Date.now()}-${Math.random()}`;try{const i=window.localStorage.getItem(t);if(i)return i;window.localStorage.setItem(t,e)}catch{return e}return e}const Ue=184,Y=48,Z=62,He=28,zt=44;function Dt(t,e,i){const s=new Map([[t.id,t]]);for(const c of e)c.id&&!s.has(c.id)&&s.set(c.id,c);const r=[...s.values()].filter(c=>c.kind==="tl"),a=[...s.values()].filter(c=>c.kind==="dl"),n=new Map;for(const c of r)n.set(c.id,t.id);for(const c of i)s.get(c.from)?.kind==="tl"&&s.get(c.to)?.kind==="dl"&&!n.has(c.to)&&n.set(c.to,c.from);for(const c of a){if(n.has(c.id))continue;const k=c.id.match(/^dl-(\d+)-/),S=k?r[Number(k[1])-1]:void 0;S&&n.set(c.id,S.id)}const o=r.map(c=>({node:c,children:a.filter(k=>n.get(k.id)===c.id)}));for(const c of a)n.has(c.id)||(n.set(c.id,t.id),o.push({node:c,children:[]}));const l=o.reduce((c,k)=>c+Math.max(1,k.children.length)*Z,0)+Math.max(0,o.length-1)*He,p=Math.max(360,l+zt*2),u=[{node:t,x:36,y:p/2-46,width:204,height:92,level:"root"}];let d=(p-l)/2;for(const c of o){const k=Math.max(1,c.children.length)*Z;u.push({node:c.node,x:334,y:d+(k-Y)/2,width:Ue,height:Y,level:c.node.kind==="tl"?"branch":"leaf"}),c.children.forEach((S,ie)=>u.push({node:S,x:616,y:d+ie*Z+(Z-Y)/2,width:Ue,height:Y,level:"leaf"})),d+=k+He}const f=new Map(u.map(c=>[c.node.id,c])),w=new Map;for(const c of i)c.from!==c.to&&f.has(c.from)&&f.has(c.to)&&w.set(`${c.from}:${c.to}`,c);for(const[c,k]of n)w.set(`${k}:${c}`,{from:k,to:c});const T=[...w.values()].map(c=>{const k=f.get(c.from),S=f.get(c.to),ie=k.x+k.width,Qe=k.y+k.height/2,Ye=S.y+S.height/2,Ze=(ie+S.x)/2;return{from:k,to:S,path:`M ${ie} ${Qe} C ${Ze} ${Qe}, ${Ze} ${Ye}, ${S.x} ${Ye}`}});return{nodes:u,links:T,groups:o,parents:n,width:836,height:p}}function qt(t,e){const i=new Set;let s=t;for(;s&&!i.has(s);)i.add(s),s=e.get(s);return i}function Fe(t){return t==="root"?"文章概览":t==="tl"?"主题":"延伸阅读"}function je(t){return Math.max(.35,Math.min(1.6,Math.round(t*100)/100))}function Ut(t,e,i){return je(Math.min((t.clientWidth-40)/e,(t.clientHeight-40)/i,1))}function Ht(t,e,i){const s=i/e;t.scrollLeft=(t.scrollLeft+t.clientWidth/2)*s-t.clientWidth/2,t.scrollTop=(t.scrollTop+t.clientHeight/2)*s-t.clientHeight/2}function Be(t,e){const i=t.querySelector(`[data-node-id="${CSS.escape(e)}"]`);if(!i)return;const s=i.getBoundingClientRect(),r=t.getBoundingClientRect();t.scrollTo({left:t.scrollLeft+s.left-r.left-(t.clientWidth-s.width)/2,top:t.scrollTop+s.top-r.top-(t.clientHeight-s.height)/2})}function Ft(t){let e;const i=a=>{a.pointerType!=="mouse"||a.button!==0||a.target.closest("button, a, input, textarea")||(e={id:a.pointerId,x:a.clientX,y:a.clientY,left:t.scrollLeft,top:t.scrollTop},t.setPointerCapture(a.pointerId),t.dataset.panning="true")},s=a=>{!e||e.id!==a.pointerId||(t.scrollLeft=e.left-(a.clientX-e.x),t.scrollTop=e.top-(a.clientY-e.y))},r=()=>{e=void 0,delete t.dataset.panning};return t.addEventListener("pointerdown",i),t.addEventListener("pointermove",s),t.addEventListener("pointerup",r),t.addEventListener("lostpointercapture",r),()=>{t.removeEventListener("pointerdown",i),t.removeEventListener("pointermove",s),t.removeEventListener("pointerup",r),t.removeEventListener("lostpointercapture",r)}}var jt=Object.defineProperty,Bt=Object.getOwnPropertyDescriptor,x=(t,e,i,s)=>{for(var r=s>1?void 0:s?Bt(e,i):e,a=t.length-1,n;a>=0;a--)(n=t[a])&&(r=(s?n(e,i,r):n(r))||r);return s&&r&&jt(e,i,r),r};const Vt=5,Wt=3e3,Qt=600;let v=class extends G{constructor(){super(...arguments),this.postName="",this.darkSelector="",this.defaultCollapsed=!1,this.loading=!0,this.errorMessage="",this.notGenerated=!1,this.activeNodeId="",this.popoverOpen=!1,this.questionOpen=!1,this.question="",this.answer="",this.asking=!1,this.isDark=!1,this.isCompactViewport=!1,this.viewMode="graph",this.zoom=1,this.modeTouched=!1,this.manuallyZoomed=!1,this.readingRequest=0,this.questionRequest=0,this.collapsed=!1,this.themeObservers=[],this.visitorId="",this.collapseTouched=!1,this.initialized=!1,this.pollAttempts=0,this.handleColorSchemeChange=()=>{this.refreshThemeMode()},this.handleCompactViewportChange=()=>{this.refreshCompactViewport()},this.toggleCollapsed=()=>{this.collapseTouched=!0,this.collapsed=!this.collapsed,this.popoverOpen=!1,this.questionOpen=!1},this.toggleDetails=()=>{this.manuallyZoomed=!0,this.popoverOpen=!this.popoverOpen,this.updateComplete.then(()=>{this.viewport&&this.popoverOpen&&Be(this.viewport,this.activeNodeId)})},this.closePopover=()=>{this.popoverOpen=!1},this.fitGraph=()=>{if(!this.viewport)return;this.manuallyZoomed=!1;const t=this.layout;this.zoom=Ut(this.viewport,t.width,t.height),this.viewport.scrollTo({left:0,top:0})},this.handleKeydown=t=>{t.key==="Escape"&&(this.questionOpen?this.questionOpen=!1:this.closePopover())}}connectedCallback(){super.connectedCallback(),this.visitorId=Rt(),this.refreshThemeMode(),this.refreshCompactViewport(),this.bindThemeObservers(),this.bindEnvironmentObservers()}firstUpdated(){this.collapsed=this.defaultCollapsed,this.loadReading(),this.initialized=!0}disconnectedCallback(){super.disconnectedCallback(),this.clearPollTimer(),this.readingRequest++,this.questionRequest++,this.viewportObserver?.disconnect(),this.unbindPan?.(),this.viewport=void 0,this.unbindEnvironmentObservers(),this.unbindThemeObservers()}updated(t){t.has("darkSelector")&&(this.refreshThemeMode(),this.bindThemeObservers()),t.has("defaultCollapsed")&&!this.collapseTouched&&(this.collapsed=this.defaultCollapsed),this.initialized&&(t.has("postName")&&(this.pollAttempts=0,this.clearPollTimer(),this.loadReading()),this.bindViewport())}async loadReading(t=!1){const e=++this.readingRequest;if(t||(this.manuallyZoomed=!1,this.reading=void 0,this.notGenerated=!1,this.questionRequest++,this.asking=!1,this.answer=""),!this.postName){this.loading=!1,this.errorMessage="文章名称为空";return}t||(this.loading=!0),this.errorMessage="",this.popoverOpen=!1,this.questionOpen=!1;try{const i=await Gt(this.postName);if(e!==this.readingRequest)return;if(!this.isRenderableReading(i.spec)){this.reading=void 0,this.notGenerated=!0,this.scheduleExistingPoll();return}this.clearPollTimer(),this.pollAttempts=0,this.reading=i.spec,this.notGenerated=!1,this.activeNodeId=this.graph.root.id}catch(i){if(e!==this.readingRequest)return;console.warn("洞察图谱加载失败:",i);const s=i instanceof Error?i.message:"洞察图谱加载失败";this.isPendingGenerationError(s)?(this.notGenerated=!0,this.scheduleExistingPoll()):(this.notGenerated=!1,this.errorMessage=s)}finally{e===this.readingRequest&&(this.loading=!1)}}scheduleExistingPoll(){this.clearPollTimer(),!(this.pollAttempts>=Qt)&&(this.pollAttempts+=1,this.pollTimer=window.setTimeout(()=>{this.pollTimer=void 0,this.loadReading(!0)},Wt))}clearPollTimer(){this.pollTimer&&(window.clearTimeout(this.pollTimer),this.pollTimer=void 0)}refreshThemeMode(){this.isDark=ze(this.darkSelector)}refreshCompactViewport(){this.isCompactViewport=window.matchMedia?.("(max-width: 640px)").matches??!1,this.modeTouched||(this.viewMode=this.isCompactViewport?"outline":"graph")}bindThemeObservers(){this.unbindThemeObservers(),this.themeObservers=De(this.darkSelector,()=>{this.refreshThemeMode()})}unbindThemeObservers(){this.themeObservers.forEach(t=>t.disconnect()),this.themeObservers=[]}bindEnvironmentObservers(){window.matchMedia&&(this.colorSchemeQuery=window.matchMedia("(prefers-color-scheme: dark)"),this.compactViewportQuery=window.matchMedia("(max-width: 640px)"),this.addMediaListener(this.colorSchemeQuery,this.handleColorSchemeChange),this.addMediaListener(this.compactViewportQuery,this.handleCompactViewportChange))}unbindEnvironmentObservers(){this.colorSchemeQuery&&(this.removeMediaListener(this.colorSchemeQuery,this.handleColorSchemeChange),this.colorSchemeQuery=void 0),this.compactViewportQuery&&(this.removeMediaListener(this.compactViewportQuery,this.handleCompactViewportChange),this.compactViewportQuery=void 0)}addMediaListener(t,e){if(typeof t.addEventListener=="function"){t.addEventListener("change",e);return}t.addListener(e)}removeMediaListener(t,e){if(typeof t.removeEventListener=="function"){t.removeEventListener("change",e);return}t.removeListener(e)}get graph(){const t=this.reading?.root||{id:"root",title:this.reading?.postTitle||"文章标题",kind:"root",summary:"洞察图谱"},e=(this.reading?.nodes||[]).filter(s=>!this.isLegacyGraphNode(s)),i=new Set([t.id,...e.map(s=>s.id)]);return{root:t,nodes:e,edges:(this.reading?.edges||[]).filter(s=>i.has(s.from)&&i.has(s.to))}}get allNodes(){return[this.graph.root,...this.graph.nodes.filter(t=>t.id!==this.graph.root.id)]}get activeNode(){return this.nodeById(this.activeNodeId)||this.graph.root}render(){const t=this.isDark?"reading-shell is-dark":"reading-shell";return this.collapsed?h` <section class=${t}>
        <button
          class="reading-collapsed"
          type="button"
          aria-expanded="false"
          @click=${this.toggleCollapsed}
        >
          <span class="reading-mark">${this.renderInlineIcon("graph")}</span>
          <strong>洞察图谱</strong><span class="collapsed-summary">${this.collapsedSummary()}</span>
          <span class="collapse-mark">${this.renderInlineIcon("plus")}</span>
        </button>
      </section>`:h` <section class=${t} @keydown=${this.handleKeydown}>
      <header class="reading-header">
        <div class="reading-heading">
          <span class="reading-mark">${this.renderInlineIcon("graph")}</span>
          <div><strong>洞察图谱</strong><small>沿着主题，探索文章</small></div>
        </div>
        <button
          class="reading-collapse"
          type="button"
          aria-expanded="true"
          @click=${this.toggleCollapsed}
        >
          收起${this.renderInlineIcon("chevron")}
        </button>
      </header>
      ${this.renderBody()}
    </section>`}collapsedSummary(){return this.loading?"正在读取":this.notGenerated?"后台生成中":this.errorMessage?"加载失败":this.reading?.postTitle||this.graph.root.title||"点击展开查看"}renderBody(){return this.loading?h`<div class="state-box">正在读取洞察图谱…</div>`:this.notGenerated?h`
        <div class="state-box">洞察图谱正在后台生成，完成后会自动刷新显示，无需手动刷新页面。</div>
      `:this.errorMessage?h`<div class="state-box">${this.errorMessage}</div>`:this.reading?this.renderGraph():h`<div class="state-box">暂无洞察图谱</div>`}renderGraph(){const t=this.layout,e=this.popoverOpen?qt(this.activeNodeId,t.parents):new Set;return h` <div class=${`ig-reader ${this.isDark?"is-dark":""}`}>
      <header class="ig-toolbar">
        <div class="ig-modes" role="group" aria-label="图谱显示方式">
          <button
            type="button"
            aria-pressed=${String(this.viewMode==="graph")}
            @click=${()=>this.setViewMode("graph")}
          >
            ${this.renderInlineIcon("graph")}图谱
          </button>
          <button
            type="button"
            aria-pressed=${String(this.viewMode==="outline")}
            @click=${()=>this.setViewMode("outline")}
          >
            ${this.renderInlineIcon("list")}大纲
          </button>
        </div>
        <div class="ig-toolbar-actions">
          ${this.viewMode==="graph"?h` <button
                  type="button"
                  class="ig-tool"
                  aria-label="缩小图谱"
                  ?disabled=${this.zoom<=.35}
                  @click=${()=>this.changeZoom(-.15)}
                >
                  ${this.renderInlineIcon("minus")}
                </button>
                <span class="ig-zoom-label" aria-live="polite"
                  >${Math.round(this.zoom*100)}%</span
                >
                <button
                  type="button"
                  class="ig-tool"
                  aria-label="放大图谱"
                  ?disabled=${this.zoom>=1.6}
                  @click=${()=>this.changeZoom(.15)}
                >
                  ${this.renderInlineIcon("plus")}
                </button>
                <button type="button" class="ig-tool" @click=${this.fitGraph}>适应视图</button
                ><span class="ig-tool-divider"></span>`:m}
          <button
            type="button"
            class="ig-tool"
            aria-pressed=${String(this.popoverOpen)}
            @click=${this.toggleDetails}
          >
            ${this.renderInlineIcon("panel")}详情
          </button>
        </div>
      </header>
      <div class=${`ig-workspace ${this.popoverOpen?"has-detail":""}`}>
        ${this.viewMode==="graph"?h` <div class="ig-viewport" tabindex="0" aria-label="图谱画布，可滚动和缩放">
              <div class="ig-scroll-area">
                <div
                  class="ig-board-frame"
                  style=${`width:${t.width*this.zoom}px;height:${t.height*this.zoom}px`}
                >
                  <div
                    class="ig-board"
                    style=${`width:${t.width}px;height:${t.height}px;transform:scale(${this.zoom})`}
                  >
                    <svg
                      class="ig-links"
                      width=${t.width}
                      height=${t.height}
                      aria-hidden="true"
                    >
                      ${t.links.map(i=>Me`<path class=${`ig-link ${e.has(i.from.node.id)&&e.has(i.to.node.id)?"is-active":""}`} d=${i.path}></path>`)}
                    </svg>
                    ${t.nodes.map(i=>h` <button
                          class=${`ig-node ig-node--${i.level} ${this.popoverOpen&&this.activeNodeId===i.node.id?"is-active":""}`}
                          type="button"
                          data-node-id=${i.node.id}
                          style=${`left:${i.x}px;top:${i.y}px;width:${i.width}px;height:${i.height}px`}
                          title=${i.node.title}
                          aria-label=${i.node.title}
                          aria-pressed=${String(this.popoverOpen&&this.activeNodeId===i.node.id)}
                          @click=${()=>this.handleNodeClick(i.node)}
                        >
                          ${i.level==="root"?h`<span class="ig-node-kicker">文章概览</span>`:h`<span class="ig-node-marker" aria-hidden="true"
                                >${i.level==="branch"?t.groups.findIndex(s=>s.node.id===i.node.id)+1:""}</span
                              >`}<span class="ig-node-title">${i.node.title}</span>
                        </button>`)}
                  </div>
                </div>
              </div>
            </div>`:this.renderOutline(t)}
        ${this.popoverOpen?this.renderPopover():m}
      </div>
      <footer class="ig-footnote">
        <span
          >${t.groups.filter(i=>i.node.kind==="tl").length} 个主题 ·
          ${this.graph.nodes.filter(i=>i.kind==="dl").length} 条延伸阅读</span
        ><span
          >${this.viewMode==="graph"?"拖动画布浏览，选择节点查看详情":"按主题浏览，选择条目查看详情"}</span
        >
      </footer>
    </div>`}renderOutline(t){const e=(i,s=!1)=>h` <button
        class=${`ig-outline-node ${this.popoverOpen&&this.activeNodeId===i.id?"is-active":""}`}
        type="button"
        @click=${()=>this.handleNodeClick(i)}
      >
        <strong>${i.title}</strong>${s&&i.summary?h`<small>${i.summary}</small>`:m}
      </button>`;return h`<nav class="ig-outline" aria-label="文章图谱大纲">
      ${e(this.graph.root,!0)}${t.groups.map(i=>h`<div>
            ${e(i.node,!0)}${i.children.length?h`<div class="ig-outline-children">
                  ${i.children.map(s=>e(s))}
                </div>`:m}
          </div>`)}
    </nav>`}renderPopover(){const t=this.activeNode,e=this.payloadItems(t);return h` <aside class="ig-detail" aria-label="节点详情" tabindex="-1">
      <div class="ig-detail-head">
        <span class="ig-detail-kicker">${Fe(t.kind)}</span
        ><button
          class="ig-tool"
          type="button"
          @click=${this.closePopover}
          aria-label="关闭节点详情"
        >
          ${this.renderInlineIcon("x")}
        </button>
      </div>
      <h3>${t.title}</h3>
      ${t.summary?h`<p>${t.summary}</p>`:m}
      ${t.summary?m:h`<p>${this.branchChildTitles(t).join(" / ")}</p>`}
      ${t.sourceRange?.anchor?h`<div class="ig-source">
            <small>原文依据</small>
            <blockquote>${t.sourceRange.anchor}</blockquote>
          </div>`:m}
      ${e.length?h`<ul class="ig-items">
            ${e.map(i=>h`<li>${i}</li>`)}
          </ul>`:m}
      ${t.kind!=="root"?h`<div class="ig-detail-actions">
            <button
              type="button"
              ?disabled=${!t.sourceRange?.anchor}
              @click=${()=>this.scrollNodeSource(t)}
            >
              ${this.renderInlineIcon("rotate")}跳回原文</button
            ><button type="button" @click=${()=>this.openQuestion(t)}>
              ${this.renderInlineIcon("message")}问这一块
            </button>
          </div>`:m}
      ${this.questionOpen?this.renderQuestionComposer():m}
    </aside>`}renderQuestionComposer(){return h`
      <div class="question-composer">
        <textarea
          class="question-input"
          .value=${this.question}
          aria-label="关于当前节点的问题"
          placeholder="输入关于当前节点的问题"
          ?disabled=${this.asking}
          @input=${this.handleQuestionInput}
        ></textarea>
        <div class="question-actions">
          <button
            class="primary-action"
            type="button"
            @click=${this.submitQuestion}
            ?disabled=${this.asking||!this.question.trim()}
          >
            ${this.asking?"思考中…":"提问"}
          </button>
          <button type="button" @click=${()=>this.questionOpen=!1}>收起</button>
        </div>
        ${this.answer?h`<div class="answer-box">${this.answer}</div>`:m}
      </div>
    `}handleNodeClick(t){this.manuallyZoomed=!0,this.questionRequest++,this.asking=!1,this.question="";const e=this.popoverOpen&&this.activeNode.id===t.id;this.activeNodeId=t.id,this.questionOpen=!1,this.answer="",this.popoverOpen=!e,this.updateComplete.then(()=>{if(this.viewport&&this.popoverOpen&&Be(this.viewport,t.id),this.isCompactViewport&&this.popoverOpen){const i=this.renderRoot.querySelector(".ig-detail");i?.focus({preventScroll:!0}),i?.scrollIntoView({block:"nearest"})}})}openQuestion(t){this.activeNodeId=t.id,this.questionOpen=!0,this.popoverOpen=!0,this.answer="",this.question||(this.question="这一块还能怎么理解？")}handleQuestionInput(t){this.question=t.target.value}async submitQuestion(){if(!this.question.trim()||this.asking)return;const t=++this.questionRequest,e=this.activeNode,i=this.question.trim();this.asking=!0,this.answer="";try{const s=await Lt(i,this.buildNodeContext(e));if(t!==this.questionRequest)return;this.answer=s,this.recordInteraction(e.id,"ask",i)}catch(s){t===this.questionRequest&&(this.answer=s instanceof Error?s.message:"提问失败")}finally{t===this.questionRequest&&(this.asking=!1)}}buildNodeContext(t){return[`文章标题：${this.reading?.postTitle||""}`,`节点标题：${t.title}`,`节点类型：${this.kindLabel(t.kind)}`,`节点摘要：${t.summary||""}`,`原文依据：${t.sourceRange?.anchor||""}`,`节点补充：${this.payloadItems(t).join("；")}`].join(`
`)}async recordInteraction(t,e,i){this.postName&&await It({postName:this.postName,nodeId:t,interactionType:e,value:i,visitorId:this.visitorId})}scrollNodeSource(t){const e=t.sourceRange?.anchor;if(!e)return;const i=this.findTextElement(e);i&&(i.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"}),this.highlightElement(i))}findTextElement(t){const e=this.normalizeForSearch(t).slice(0,48);return!e||!document.body?null:document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:r=>{const a=r.parentElement;return!a||a.closest("script,style,noscript,template,likcc-article-reading")?NodeFilter.FILTER_REJECT:this.normalizeForSearch(r.textContent||"").includes(e)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}}).nextNode()?.parentElement||null}highlightElement(t){const e=t.style.outline,i=t.style.outlineOffset,s=t.style.scrollMarginTop;t.style.outline="2px solid var(--likcc-reading-accent, #0f766e)",t.style.outlineOffset="4px",t.style.scrollMarginTop="96px",window.setTimeout(()=>{t.style.outline=e,t.style.outlineOffset=i,t.style.scrollMarginTop=s},1800)}nodeById(t){return this.allNodes.find(e=>e.id===t)}get layout(){const t=this.graph;return Dt(t.root,t.nodes,t.edges)}renderInlineIcon(t){const e={graph:"M12 8V4m0 4-6 5m6-5 6 5M6 16v4m12-4v4M9 4h6M3 13h6v3H3Zm12 0h6v3h-6Z",list:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",plus:"M12 5v14M5 12h14",minus:"M5 12h14",panel:"M3 4h18v16H3ZM15 4v16",x:"m6 6 12 12M6 18 18 6",rotate:"M9 10H3V4m0 6 4-4a8 8 0 1 1-2 9",message:"M21 11a8 8 0 0 1-8 8H8l-5 3V5a2 2 0 0 1 2-2h8a8 8 0 0 1 8 8Z",chevron:"m6 9 6 6 6-6"};return Me`<svg class="reading-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${e[t]||e.graph}></path></svg>`}async changeZoom(t){const e=this.zoom;this.manuallyZoomed=!0,this.zoom=je(e+t),await this.updateComplete,this.viewport&&Ht(this.viewport,e,this.zoom)}setViewMode(t){this.modeTouched=!0,this.viewMode=t}bindViewport(){const t=this.renderRoot.querySelector(".ig-viewport")||void 0;t!==this.viewport&&(this.viewportObserver?.disconnect(),this.unbindPan?.(),this.viewport=t,t&&(this.unbindPan=Ft(t),this.viewportObserver=new ResizeObserver(()=>{this.manuallyZoomed||this.fitGraph()}),this.viewportObserver.observe(t),this.fitGraph()))}branchChildTitles(t){return this.layout.groups.find(e=>e.node.id===t.id)?.children.map(e=>e.title)||[]}isLegacyGraphNode(t){return t.kind==="overview"||t.kind==="action"||t.id==="overview-30s"||t.id==="overview-conclusion"||t.id==="overview-keypoints"||t.id==="tl-group"||t.id==="dl-group"||t.id==="action-group"||t.id.startsWith("action-")||["30秒概览","一句话结论","3个关键点","TL分块","DL深挖","用户互动","跳回原文","问这一块","收藏节点","点赞反馈"].includes(t.title)}payloadItems(t){const e=t.payload?.items;return Array.isArray(e)?e.map(i=>String(i)).filter(Boolean).slice(0,6):[]}kindLabel(t){return Fe(t)}normalizeForSearch(t){return t.replace(/\s+/g,"").toLowerCase()}isRenderableReading(t){if(!t?.root||!Array.isArray(t.nodes)||!Array.isArray(t.edges)||(t.schemaVersion||0)<Vt)return!1;const e=new Set(t.nodes.filter(a=>a.kind==="tl"&&!!a.id).map(a=>a.id)),i=new Set(t.nodes.filter(a=>a.kind==="dl"&&!!a.id).map(a=>a.id));if(e.size<3||i.size===0)return!1;const s=t.root.id||"root",r=new Set(t.edges.filter(a=>a.from===s).map(a=>a.to));return Array.from(e).every(a=>r.has(a))}isPendingGenerationError(t){return["尚未生成","不存在","需要重建","HTTP 404"].some(e=>t.includes(e))}};v.styles=Ot,x([$({type:String,attribute:"post-name"})],v.prototype,"postName",2),x([$({type:String,attribute:"dark-selector"})],v.prototype,"darkSelector",2),x([$({type:Boolean,attribute:"default-collapsed"})],v.prototype,"defaultCollapsed",2),x([b()],v.prototype,"reading",2),x([b()],v.prototype,"loading",2),x([b()],v.prototype,"errorMessage",2),x([b()],v.prototype,"notGenerated",2),x([b()],v.prototype,"activeNodeId",2),x([b()],v.prototype,"popoverOpen",2),x([b()],v.prototype,"questionOpen",2),x([b()],v.prototype,"question",2),x([b()],v.prototype,"answer",2),x([b()],v.prototype,"asking",2),x([b()],v.prototype,"isDark",2),x([b()],v.prototype,"isCompactViewport",2),x([b()],v.prototype,"viewMode",2),x([b()],v.prototype,"zoom",2),x([b()],v.prototype,"collapsed",2),v=x([Le("likcc-article-reading")],v);const Yt="a,button,input,textarea,select,pre,code,kbd,samp,script,style,noscript,template,svg,math,nav,h1,h2,h3,h4,h5,h6,[contenteditable],ai-summaraidgpt,ai-summaraidgpt-reading,ai-summaraidgpt-data,ai-summaraidgpt-glossary,likcc-article-summary,likcc-article-reading,likcc-article-podcast,likcc-article-term";function Zt(t,e,i=0){let s=t.indexOf(e,i);for(;s>=0;){const r=Array.from(t.slice(0,s)).at(-1)||"",a=Array.from(t.slice(s+e.length))[0]||"",n=/[\p{Script=Latin}\d_]/u;if(!(n.test(e[0])&&n.test(r))&&!(n.test(e.at(-1)||"")&&n.test(a)))return s;s=t.indexOf(e,s+e.length)}return-1}function Jt(t,e){const i=e.filter(o=>o.term.length>=2&&o.explanation.trim()).sort((o,l)=>l.term.length-o.term.length).slice(0,15),s=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode(o){return o.parentElement?.closest(Yt)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),r=[];for(;s.nextNode();)r.push(s.currentNode);const a=new Set(Array.from(t.querySelectorAll("likcc-article-term"),o=>o.textContent||"")),n=a.size;for(const o of r){let l=o.data;const p=document.createDocumentFragment();let u=!1;for(;l;){let d,f=-1;for(const T of i){if(a.has(T.term))continue;const c=Zt(l,T.term);c>=0&&(f<0||c<f)&&(d=T,f=c)}if(!d){p.append(document.createTextNode(l));break}p.append(document.createTextNode(l.slice(0,f)));const w=document.createElement("likcc-article-term");w.textContent=d.term,w.setAttribute("explanation",d.explanation),p.append(w),l=l.slice(f+d.term.length),a.add(d.term),u=!0}u&&o.replaceWith(p)}return a.size-n}const Xt=`
  :host { display:inline; font:inherit; color:inherit; }
  button { font:inherit; color:inherit; background:none; border:0; padding:0; margin:0;
    text-decoration:underline dotted; text-underline-offset:.22em; text-decoration-color:#5b8a91;
    cursor:help; border-radius:2px; }
  button:hover { color:#39717b; }
  button:focus-visible { outline:2px solid #39717b; outline-offset:3px; }
  [popover] { position:fixed; inset:auto; margin:0; box-sizing:border-box;
    padding:16px 18px; border:1px solid #dce6e7; border-radius:12px;
    background:#fff; color:#25353b; box-shadow:0 8px 32px #152f3820;
    font:400 14px/1.75 system-ui,sans-serif; text-align:left; overflow-wrap:anywhere; }
  small { display:block; font-size:11px; color:#657e85; margin-bottom:6px; letter-spacing:.04em; }
  strong { display:block; font-size:16px; margin-bottom:6px; }
  p { margin:0; } footer { margin-top:10px; color:#6e7e84; font-size:11px; }
  @media (prefers-color-scheme:dark) {
    [popover] { background:#202c31; color:#e7eef0; border-color:#42545b; }
    small,footer { color:#a3bac1; } button:hover { color:#87c2cc; }
  }
`;class Kt extends HTMLElement{constructor(){super(...arguments),this.pinned=!1,this.dismissed=!1,this.close=()=>{this.panel.isConnected&&this.panel.hidePopover?.(),this.pinned=!1,this.trigger.setAttribute("aria-expanded","false")},this.position=()=>{if(!this.panel.showPopover||!this.panel.matches(":popover-open"))return;const e=this.getBoundingClientRect(),i=Math.min(310,window.innerWidth-24);this.panel.style.width=`${i}px`,this.panel.style.maxHeight=`${Math.max(100,window.innerHeight-24)}px`,this.panel.style.left=`${Math.max(12,Math.min(e.left,window.innerWidth-i-12))}px`;const s=this.panel.getBoundingClientRect().height,r=e.bottom+8;this.panel.style.top=`${Math.max(12,Math.min(r+s<=window.innerHeight-12?r:e.top-s-8,window.innerHeight-s-12))}px`}}open(){this.dismissed||this.panel.showPopover&&(this.panel.showPopover(),this.trigger.setAttribute("aria-expanded","true"),this.position())}connectedCallback(){if(this.shadowRoot)return;const e=this.attachShadow({mode:"open"}),i=document.createElement("style");i.textContent=Xt,this.trigger=document.createElement("button"),this.trigger.type="button",this.trigger.append(document.createElement("slot")),this.trigger.setAttribute("aria-label",`${this.textContent}：查看词语解释`),this.trigger.setAttribute("aria-describedby","explanation"),this.trigger.setAttribute("aria-expanded","false"),this.panel=document.createElement("div"),this.panel.id="explanation",this.panel.setAttribute("popover","auto"),this.panel.setAttribute("role","tooltip");const s=document.createElement("small");s.textContent="AI 词语注释";const r=document.createElement("strong");r.textContent=this.textContent;const a=document.createElement("p");a.textContent=this.getAttribute("explanation");const n=document.createElement("footer");n.textContent="结合本文生成 · 仅供理解参考",this.panel.append(s,r,a,n),e.append(i,this.trigger,this.panel),this.panel.showPopover||(this.trigger.title=a.textContent||""),this.trigger.addEventListener("click",()=>{this.dismissed=!1,this.pinned?this.close():(this.pinned=!0,this.open())}),this.trigger.addEventListener("keydown",o=>{o.key==="Escape"&&(this.dismissed=!0,this.close(),o.preventDefault())}),this.trigger.addEventListener("focus",()=>{this.dismissed=!1,this.open()}),this.trigger.addEventListener("blur",this.close),this.addEventListener("pointerenter",()=>{clearTimeout(this.hideTimer),this.open()}),this.addEventListener("pointerleave",()=>{this.dismissed=!1,this.hideTimer=setTimeout(()=>{this.pinned||this.close()},160)}),this.panel.addEventListener("pointerenter",()=>clearTimeout(this.hideTimer)),this.panel.addEventListener("pointerleave",()=>{this.pinned||this.close()}),this.panel.addEventListener("toggle",()=>{this.panel.matches(":popover-open")||this.close()}),window.addEventListener("resize",this.position),window.addEventListener("scroll",this.position,!0)}disconnectedCallback(){clearTimeout(this.hideTimer),this.close(),window.removeEventListener("resize",this.position),window.removeEventListener("scroll",this.position,!0)}}class ei extends HTMLElement{constructor(){super(...arguments),this.attempts=0,this.start=()=>{this.load()}}connectedCallback(){this.hidden=!0,this.attempts=0,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",this.start,{once:!0}):this.start()}disconnectedCallback(){clearTimeout(this.timer),this.controller?.abort(),document.removeEventListener("DOMContentLoaded",this.start)}async load(){const e=this.getAttribute("name");if(!(!e||!this.parentElement||!this.isConnected)){this.controller=new AbortController;try{const i=await fetch(`${L}/articleGlossaries/${encodeURIComponent(e)}`,{signal:this.controller.signal,credentials:"same-origin"});if(!this.isConnected)return;if(i.status===204&&this.getAttribute("poll")==="true"&&++this.attempts<25){this.timer=setTimeout(()=>{this.load()},4e3);return}if(!i.ok||i.status===204)return;const s=await i.json();this.isConnected&&this.parentElement&&Array.isArray(s.spec?.terms)&&Jt(this.parentElement,s.spec.terms)}catch{}}}}customElements.get("likcc-article-term")||customElements.define("likcc-article-term",Kt),customElements.get("ai-summaraidgpt-glossary")||customElements.define("ai-summaraidgpt-glossary",ei);const J="ai-summaraidGPT",X="ai-summaraidGPT-data",Ve="likcc-article-summary",K="ai-summaraidGPT-reading",ti="likcc-article-reading",ee="data-summary-lit-mounted",We="data-summary-silent-processed";let te,me;function ii(){window.likcc_summaraidGPT_scriptLoaded||(console.log("%c智阅GPT-智能AI助手","color: #4F8DFD; font-size: 16px; font-weight: bold;"),console.log("%c智阅点睛，一键洞见——基于AI大模型的Halo智能AI助手","color: #666; font-size: 12px;"),console.log("%c作者: Handsome | 网站: https://lik.cc","color: #999; font-size: 11px;"),window.likcc_summaraidGPT_scriptLoaded=!0)}function si(t,e,i){t.postName=i.getAttribute("name")||"",t.logo=e.logo||"",t.summaryTitle=e.summaryTitle||"文章摘要",t.gptName=e.gptName||"智阅GPT",t.typeSpeed=e.typeSpeed??20,t.typewriter=e.typewriter??!0,t.darkSelector=e.darkSelector||"",t.uiStyle=e.uiStyle||"simple",t.linguiProjectId=e.linguiProjectId||"",t.fixedTone=e.fixedTone||"violet",t.fixedDensity=e.fixedDensity||"compact",t.themeName=e.themeName||"custom",t.theme=e.theme||{}}function ri(t,e,i){t.postName=i.getAttribute("name")||"",t.darkSelector=e.darkSelector||"",t.defaultCollapsed=e.readingDefaultCollapsed??!1}async function pe(t={}){const e=Array.from(document.querySelectorAll(`${J}:not([${ee}="true"])`)),i=Array.from(document.querySelectorAll(`${K}:not([${ee}="true"])`));if(e.length===0&&i.length===0)return[];const r={...await Et(),...t},a=e.map(o=>{const l=document.createElement(Ve);return si(l,r,o),o.setAttribute(ee,"true"),o.replaceWith(l),l}),n=i.map(o=>{const l=document.createElement(ti);return ri(l,r,o),o.setAttribute(ee,"true"),o.replaceWith(l),l});return[...a,...n]}async function ai(){const t=Array.from(document.querySelectorAll(`${X}:not([${We}="true"])`));await Promise.all(t.map(async e=>{const i=e.getAttribute("name");if(i){e.setAttribute(We,"true");try{await qe(i)}catch(s){console.warn("摘要入库失败:",s)}}}))}async function ni(){const t=document.querySelectorAll(J),e=document.querySelectorAll(K),i=document.querySelectorAll(X),s=document.querySelector(Ve);if(t.length>0||e.length>0){await pe();return}i.length>0&&!s&&await ai()}function I(){te&&window.clearTimeout(te),te=window.setTimeout(()=>{te=void 0,ni()},0)}function oi(t){return t.type!=="childList"?!1:Array.from(t.addedNodes).some(i=>i instanceof Element?i.matches(J)||i.matches(X)||i.matches(K)||i.querySelector(J)!==null||i.querySelector(X)!==null||i.querySelector(K)!==null:!1)}function li(){me||(me=new MutationObserver(t=>{t.some(oi)&&I()}),me.observe(document.documentElement,{childList:!0,subtree:!0}))}function ci(){["pjax:success","pjax:complete","swup:content-replaced","swup:page:view","swup:animation:in:end"].forEach(e=>{document.addEventListener(e,I)}),window.swup?.hooks?.on?.("page:view",I),window.swup?.hooks?.on?.("content:replace",I)}ii(),window.likcc_summaraidGPT_initSummaryBox=pe,window.likcc_summaraidGPT_reinit=pe,li(),ci(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{I()},{once:!0}):I()}));
