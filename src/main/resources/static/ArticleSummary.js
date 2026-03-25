(function(b){typeof define=="function"&&define.amd?define(b):b()})((function(){"use strict";const b=globalThis,W=b.ShadowRoot&&(b.ShadyCSS===void 0||b.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,q=Symbol(),et=new WeakMap;let it=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(W&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=et.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&et.set(e,t))}return t}toString(){return this.cssText}};const Tt=i=>new it(typeof i=="string"?i:i+"",void 0,q),xt=(i,...t)=>{const e=i.length===1?i[0]:t.reduce((s,r,a)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[a+1],i[0]);return new it(e,i,q)},At=(i,t)=>{if(W)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),r=b.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}},st=W?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return Tt(e)})(i):i;const{is:St,defineProperty:wt,getOwnPropertyDescriptor:Pt,getOwnPropertyNames:Et,getOwnPropertySymbols:Ct,getPrototypeOf:Gt}=Object,z=globalThis,rt=z.trustedTypes,Nt=rt?rt.emptyScript:"",Ot=z.reactiveElementPolyfillSupport,E=(i,t)=>i,R={toAttribute(i,t){switch(t){case Boolean:i=i?Nt:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},Y=(i,t)=>!St(i,t),at={attribute:!0,type:String,converter:R,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??=Symbol("metadata"),z.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=at){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&wt(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){const{get:r,set:a}=Pt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:r,set(n){const c=r?.call(this);a?.call(this,n),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??at}static _$Ei(){if(this.hasOwnProperty(E("elementProperties")))return;const t=Gt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(E("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(E("properties"))){const e=this.properties,s=[...Et(e),...Ct(e)];for(const r of s)this.createProperty(r,e[r])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const r of s)e.unshift(st(r))}else t!==void 0&&e.push(st(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return At(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){const a=(s.converter?.toAttribute!==void 0?s.converter:R).toAttribute(e,s.type);this._$Em=t,a==null?this.removeAttribute(r):this.setAttribute(r,a),this._$Em=null}}_$AK(t,e){const s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){const a=s.getPropertyOptions(r),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:R;this._$Em=r;const c=n.fromAttribute(e,a.type);this[r]=c??this._$Ej?.get(r)??c,this._$Em=null}}requestUpdate(t,e,s,r=!1,a){if(t!==void 0){const n=this.constructor;if(r===!1&&(a=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??Y)(a,e)||s.useDefault&&s.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:a},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),a!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,a]of this._$Ep)this[r]=a;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,a]of s){const{wrapped:n}=a,c=this[r];n!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,a,c)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[E("elementProperties")]=new Map,A[E("finalized")]=new Map,Ot?.({ReactiveElement:A}),(z.reactiveElementVersions??=[]).push("2.1.2");const V=globalThis,nt=i=>i,H=V.trustedTypes,ot=H?H.createPolicy("lit-html",{createHTML:i=>i}):void 0,ct="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,lt="?"+$,Mt=`<${lt}>`,v=document,C=()=>v.createComment(""),G=i=>i===null||typeof i!="object"&&typeof i!="function",Z=Array.isArray,Ut=i=>Z(i)||typeof i?.[Symbol.iterator]=="function",J=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,dt=/-->/g,mt=/>/g,_=RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ut=/'/g,ht=/"/g,pt=/^(?:script|style|textarea|title)$/i,Dt=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),g=Dt(1),T=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ft=new WeakMap,x=v.createTreeWalker(v,129);function gt(i,t){if(!Z(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return ot!==void 0?ot.createHTML(t):t}const zt=(i,t)=>{const e=i.length-1,s=[];let r,a=t===2?"<svg>":t===3?"<math>":"",n=N;for(let c=0;c<e;c++){const o=i[c];let h,p,l=-1,y=0;for(;y<o.length&&(n.lastIndex=y,p=n.exec(o),p!==null);)y=n.lastIndex,n===N?p[1]==="!--"?n=dt:p[1]!==void 0?n=mt:p[2]!==void 0?(pt.test(p[2])&&(r=RegExp("</"+p[2],"g")),n=_):p[3]!==void 0&&(n=_):n===_?p[0]===">"?(n=r??N,l=-1):p[1]===void 0?l=-2:(l=n.lastIndex-p[2].length,h=p[1],n=p[3]===void 0?_:p[3]==='"'?ht:ut):n===ht||n===ut?n=_:n===dt||n===mt?n=N:(n=_,r=void 0);const k=n===_&&i[c+1].startsWith("/>")?" ":"";a+=n===N?o+Mt:l>=0?(s.push(h),o.slice(0,l)+ct+o.slice(l)+$+k):o+$+(l===-2?c:k)}return[gt(i,a+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class O{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let a=0,n=0;const c=t.length-1,o=this.parts,[h,p]=zt(t,e);if(this.el=O.createElement(h,s),x.currentNode=this.el.content,e===2||e===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=x.nextNode())!==null&&o.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(const l of r.getAttributeNames())if(l.endsWith(ct)){const y=p[n++],k=r.getAttribute(l).split($),j=/([.?@])?(.*)/.exec(y);o.push({type:1,index:a,name:j[2],strings:k,ctor:j[1]==="."?Ht:j[1]==="?"?Bt:j[1]==="@"?Ft:B}),r.removeAttribute(l)}else l.startsWith($)&&(o.push({type:6,index:a}),r.removeAttribute(l));if(pt.test(r.tagName)){const l=r.textContent.split($),y=l.length-1;if(y>0){r.textContent=H?H.emptyScript:"";for(let k=0;k<y;k++)r.append(l[k],C()),x.nextNode(),o.push({type:2,index:++a});r.append(l[y],C())}}}else if(r.nodeType===8)if(r.data===lt)o.push({type:2,index:a});else{let l=-1;for(;(l=r.data.indexOf($,l+1))!==-1;)o.push({type:7,index:a}),l+=$.length-1}a++}}static createElement(t,e){const s=v.createElement("template");return s.innerHTML=t,s}}function S(i,t,e=i,s){if(t===T)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl;const a=G(t)?void 0:t._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),a===void 0?r=void 0:(r=new a(i),r._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=r:e._$Cl=r),r!==void 0&&(t=S(i,r._$AS(i,t.values),r,s)),t}class Rt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??v).importNode(e,!0);x.currentNode=r;let a=x.nextNode(),n=0,c=0,o=s[0];for(;o!==void 0;){if(n===o.index){let h;o.type===2?h=new M(a,a.nextSibling,this,t):o.type===1?h=new o.ctor(a,o.name,o.strings,this,t):o.type===6&&(h=new Lt(a,this,t)),this._$AV.push(h),o=s[++c]}n!==o?.index&&(a=x.nextNode(),n++)}return x.currentNode=v,r}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class M{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=S(this,t,e),G(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==T&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ut(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&G(this._$AH)?this._$AA.nextSibling.data=t:this.T(v.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=O.createElement(gt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{const a=new Rt(r,this),n=a.u(this.options);a.p(e),this.T(n),this._$AH=a}}_$AC(t){let e=ft.get(t.strings);return e===void 0&&ft.set(t.strings,e=new O(t)),e}k(t){Z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,r=0;for(const a of t)r===e.length?e.push(s=new M(this.O(C()),this.O(C()),this,this.options)):s=e[r],s._$AI(a),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const s=nt(t).nextSibling;nt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class B{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,a){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,r){const a=this.strings;let n=!1;if(a===void 0)t=S(this,t,e,0),n=!G(t)||t!==this._$AH&&t!==T,n&&(this._$AH=t);else{const c=t;let o,h;for(t=a[0],o=0;o<a.length-1;o++)h=S(this,c[s+o],e,o),h===T&&(h=this._$AH[o]),n||=!G(h)||h!==this._$AH[o],h===d?t=d:t!==d&&(t+=(h??"")+a[o+1]),this._$AH[o]=h}n&&!r&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Ht extends B{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}}class Bt extends B{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}}class Ft extends B{constructor(t,e,s,r,a){super(t,e,s,r,a),this.type=5}_$AI(t,e=this){if((t=S(this,t,e,0)??d)===T)return;const s=this._$AH,r=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,a=t!==d&&(s===d||r);r&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Lt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t)}}const It=V.litHtmlPolyfillSupport;It?.(O,M),(V.litHtmlVersions??=[]).push("3.3.2");const jt=(i,t,e)=>{const s=e?.renderBefore??t;let r=s._$litPart$;if(r===void 0){const a=e?.renderBefore??null;s._$litPart$=r=new M(t.insertBefore(C(),a),a,void 0,e??{})}return r._$AI(i),r};const K=globalThis;let U=class extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=jt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};U._$litElement$=!0,U.finalized=!0,K.litElementHydrateSupport?.({LitElement:U});const Wt=K.litElementPolyfillSupport;Wt?.({LitElement:U}),(K.litElementVersions??=[]).push("4.2.2");const qt={ATTRIBUTE:1},Yt=i=>(...t)=>({_$litDirective$:i,values:t});let Vt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const yt="important",Zt=" !"+yt,Jt=Yt(class extends Vt{constructor(i){if(super(i),i.type!==qt.ATTRIBUTE||i.name!=="style"||i.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(i){return Object.keys(i).reduce((t,e)=>{const s=i[e];return s==null?t:t+`${e=e.includes("-")?e:e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(i,[t]){const{style:e}=i.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(const s of this.ft)t[s]==null&&(this.ft.delete(s),s.includes("-")?e.removeProperty(s):e[s]=null);for(const s in t){const r=t[s];if(r!=null){this.ft.add(s);const a=typeof r=="string"&&r.endsWith(Zt);s.includes("-")||a?e.setProperty(s,a?r.slice(0,-11):r,a?yt:""):e[s]=r}}return T}});const Kt=i=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(i,t)}):customElements.define(i,t)};const Qt={attribute:!0,type:String,converter:R,reflect:!1,hasChanged:Y},Xt=(i=Qt,t,e)=>{const{kind:s,metadata:r}=e;let a=globalThis.litPropertyMetadata.get(r);if(a===void 0&&globalThis.litPropertyMetadata.set(r,a=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),a.set(e.name,i),s==="accessor"){const{name:n}=e;return{set(c){const o=t.get.call(this);t.set.call(this,c),this.requestUpdate(n,o,i,!0,c)},init(c){return c!==void 0&&this.C(n,void 0,i,c),c}}}if(s==="setter"){const{name:n}=e;return function(c){const o=this[n];t.call(this,c),this.requestUpdate(n,o,i,!0,c)}}throw Error("Unsupported decorator location: "+s)};function f(i){return(t,e)=>typeof e=="object"?Xt(i,t,e):((s,r,a)=>{const n=r.hasOwnProperty(a);return r.constructor.createProperty(a,s),n?Object.getOwnPropertyDescriptor(r,a):void 0})(i,t,e)}function w(i){return f({...i,state:!0,attribute:!1})}const te=xt`
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
    letter-spacing: -0.012em;
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
    letter-spacing: -0.02em;
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
`,$t="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",D={bg:"#f7f9fe",main:"#4F8DFD",contentFontSize:"16px",title:"#3A5A8C",content:"#222",gptName:"#7B88A8",contentBg:"#fff",border:"#e3e8f7",shadow:"0 2px 12px 0 rgba(60,80,180,0.08)",tagBg:"#f0f4ff",tagColor:"#4F8DFD",cursor:"#4F8DFD"},Q={logo:"icon.svg",summaryTitle:"文章摘要",gptName:"智阅GPT",typeSpeed:20,darkSelector:"",uiStyle:"classic",fixedTone:"violet",fixedDensity:"compact",themeName:"custom",theme:D,typewriter:!0};function ee(i){if(!i)return{...D};if(typeof i=="string")try{const t=JSON.parse(i);return{...D,...t}}catch{return{...D}}return{...D,...i}}function ie(i){if(!i)return!1;const t=document.documentElement,e=document.body,s=i.match(/^data-([\w-]+)=(.+)$/);if(s){const a=`data-${s[1]}`,n=s[2];return t.getAttribute(a)===n||e.getAttribute(a)===n}const r=i.match(/^class=(.+)$/);if(r){const a=r[1];return t.classList.contains(a)||e.classList.contains(a)}return t.classList.contains(i)||e.classList.contains(i)}function se(i,t){if(!i)return[];const e=document.documentElement,s=document.body,r=i.match(/^data-([\w-]+)=(.+)$/),a={attributes:!0,attributeFilter:["class"]};r&&(a.attributeFilter=["class",`data-${r[1]}`]);const n=new MutationObserver(t),c=new MutationObserver(t);return n.observe(e,a),c.observe(s,a),[n,c]}async function re(){try{const i=await fetch(`${$t}/summaryConfig`);if(!i.ok)throw new Error(`HTTP ${i.status}: ${i.statusText}`);const t=await i.json();return{...Q,...t,theme:t.theme??Q.theme}}catch{return{...Q}}}async function kt(i){const t=await fetch(`${$t}/updateContent`,{method:"POST",headers:{"Content-Type":"application/json"},body:i});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);return await t.json()}function ae(i){return i?i.startsWith("http://")||i.startsWith("https://")||i.startsWith("/")||i.startsWith("data:")?i:`/plugins/summaraidGPT/assets/static/${i}`:""}var ne=Object.defineProperty,oe=Object.getOwnPropertyDescriptor,u=(i,t,e,s)=>{for(var r=s>1?void 0:s?oe(t,e):t,a=i.length-1,n;a>=0;a--)(n=i[a])&&(r=(s?n(t,e,r):n(r))||r);return s&&r&&ne(t,e,r),r};let m=class extends U{constructor(){super(...arguments),this.postName="",this.logo="",this.summaryTitle="文章摘要",this.gptName="智阅GPT",this.typeSpeed=20,this.typewriter=!0,this.darkSelector="",this.themeName="custom",this.uiStyle="classic",this.fixedTone="violet",this.fixedDensity="compact",this.theme={},this.content="",this.displayContent="",this.loading=!0,this.typing=!1,this.loadFailed=!1,this.isDark=!1,this.themeObservers=[],this.initialized=!1}connectedCallback(){super.connectedCallback(),this.refreshThemeMode(),this.bindThemeObservers()}firstUpdated(){this.postName?this.loadSummary():(this.loading=!1,this.loadFailed=!0,this.displayContent="摘要加载失败，请稍后重试"),this.initialized=!0}disconnectedCallback(){super.disconnectedCallback(),this.unbindThemeObservers(),this.stopTypewriter()}updated(i){i.has("darkSelector")&&(this.refreshThemeMode(),this.bindThemeObservers()),this.initialized&&i.has("postName")&&this.postName&&this.loadSummary()}async loadSummary(){this.stopTypewriter(),this.loading=!0,this.loadFailed=!1,this.displayContent="";try{const i=await kt(this.postName);this.content=i.summaryContent?.trim()||"暂无摘要内容",this.applyContent()}catch(i){console.warn("获取摘要失败:",i),this.content="摘要加载失败，请稍后重试",this.displayContent=this.content,this.loadFailed=!0}finally{this.loading=!1}}applyContent(){if(this.stopTypewriter(),!this.typewriter){this.displayContent=this.content,this.typing=!1;return}this.typing=!0,this.displayContent="";const i=Number.isFinite(this.typeSpeed)?Math.max(this.typeSpeed,0):20;let t=0;const e=()=>{if(t+=1,this.displayContent=this.content.slice(0,t),t>=this.content.length){this.typing=!1,this.typewriterTimer=void 0;return}this.typewriterTimer=window.setTimeout(e,i)};if(!this.content){this.typing=!1;return}e()}stopTypewriter(){this.typing=!1,this.typewriterTimer&&(window.clearTimeout(this.typewriterTimer),this.typewriterTimer=void 0)}refreshThemeMode(){this.isDark=ie(this.darkSelector)}bindThemeObservers(){this.unbindThemeObservers(),this.themeObservers=se(this.darkSelector,()=>{this.refreshThemeMode()})}unbindThemeObservers(){this.themeObservers.forEach(i=>i.disconnect()),this.themeObservers=[]}get effectiveThemeName(){return this.darkSelector&&this.isDark?"dark":this.themeName==="dark"||this.themeName==="blue"||this.themeName==="green"||this.themeName==="custom"?this.themeName:"default"}get effectiveUiStyle(){return this.uiStyle==="simple"||this.uiStyle==="quiet"?"simple":this.uiStyle==="note"||this.uiStyle==="minimal"||this.uiStyle==="stripe"||this.uiStyle==="inline"?this.uiStyle==="inline"?"inline":"simple":this.themeName==="spotlight"?"simple":"classic"}get customThemeStyles(){if(this.effectiveThemeName!=="custom")return{};const i=ee(this.theme);return{"--likcc-summaraid-bg":i.bg??"","--likcc-summaraid-main":i.main??"","--likcc-summaraid-contentFontSize":i.contentFontSize??"","--likcc-summaraid-title":i.title??"","--likcc-summaraid-content":i.content??"","--likcc-summaraid-gptName":i.gptName??"","--likcc-summaraid-contentBg":i.contentBg??"","--likcc-summaraid-border":i.border??"","--likcc-summaraid-shadow":i.shadow??"","--likcc-summaraid-tagBg":i.tagBg??"","--likcc-summaraid-tagColor":i.tagColor??"","--likcc-summaraid-cursor":i.cursor??""}}get effectiveFixedTone(){return this.fixedTone==="graphite"||this.fixedTone==="copper"?this.fixedTone:"violet"}get effectiveFixedDensity(){return this.fixedDensity==="comfortable"?"comfortable":"compact"}get fixedStyleClassName(){return["likcc-summaraidGPT-fixed",`likcc-summaraidGPT-tone--${this.effectiveFixedTone}`,`likcc-summaraidGPT-density--${this.effectiveFixedDensity}`].join(" ")}render(){return this.effectiveUiStyle==="simple"?this.renderSimpleCard():this.effectiveUiStyle==="inline"?this.renderInlineCard():this.renderClassicCard()}renderClassicCard(){const i=`likcc-summaraidGPT-summary--${this.effectiveThemeName}`,t=ae(this.logo),e=this.loading?"正在生成摘要…":this.displayContent;return g`
      <div class="likcc-summaraidGPT-summary-container ${i}" style=${Jt(this.customThemeStyles)}>
        <div class="likcc-summaraidGPT-summary-header">
          <div class="likcc-summaraidGPT-header-left">
            ${t?g`<img class="likcc-summaraidGPT-logo not-prose" src=${t} alt=${this.gptName||"AI Logo"} width="20" height="20" />`:d}
            <span class="likcc-summaraidGPT-summary-title">${this.summaryTitle||"文章摘要"}</span>
          </div>
          <span class="likcc-summaraidGPT-gpt-name">${this.gptName||"智阅GPT"}</span>
        </div>
        <div class="likcc-summaraidGPT-summary-content">
          ${this.loading||this.loadFailed?g`<span style="color:#bbb;">${e}</span>`:e}
          ${this.typing?g`<span class="likcc-summaraidGPT-cursor"></span>`:d}
        </div>
      </div>
    `}renderInlineCard(){const i=this.loading?"正在生成摘要…":this.displayContent,t=this.summaryTitle||"AI 总结";return g`
      <div class="likcc-summaraidGPT-inline-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-inline-shell">
          <div class="likcc-summaraidGPT-inline-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-inline-icon")}
            <span class="likcc-summaraidGPT-inline-title">${t}</span>
          </div>
          <div class="likcc-summaraidGPT-inline-content">
            ${this.loading||this.loadFailed?g`<span style="color:#8892a6;">${i}</span>`:i}
            ${this.typing?g`<span class="likcc-summaraidGPT-cursor"></span>`:d}
          </div>
        </div>
      </div>
    `}renderSimpleCard(){const i=this.loading?"正在生成摘要…":this.displayContent,t=this.summaryTitle||"AI 总结";return g`
      <div class="likcc-summaraidGPT-simple-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-simple-shell">
          <div class="likcc-summaraidGPT-simple-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-simple-icon")}
            <span class="likcc-summaraidGPT-simple-title">${t}</span>
          </div>
          <div class="likcc-summaraidGPT-simple-content">
            ${this.loading||this.loadFailed?g`<span style="color:#8892a6;">${i}</span>`:i}
            ${this.typing?g`<span class="likcc-summaraidGPT-cursor"></span>`:d}
          </div>
        </div>
      </div>
    `}renderSparklesIcon(i){return g`
      <span class=${i} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.22 3.39a.35.35 0 0 1 .66 0l1.52 4.23a.38.38 0 0 0 .22.22l4.23 1.52a.35.35 0 0 1 0 .66l-4.23 1.52a.38.38 0 0 0-.22.22l-1.52 4.23a.35.35 0 0 1-.66 0l-1.52-4.23a.38.38 0 0 0-.22-.22L4.25 10.02a.35.35 0 0 1 0-.66l4.23-1.52a.38.38 0 0 0 .22-.22l1.52-4.23Z" />
          <path d="M18.38 4.18a.24.24 0 0 1 .45 0l.59 1.66c.02.07.08.13.15.15l1.66.59a.24.24 0 0 1 0 .45l-1.66.59a.25.25 0 0 0-.15.15l-.59 1.66a.24.24 0 0 1-.45 0l-.59-1.66a.25.25 0 0 0-.15-.15l-1.66-.59a.24.24 0 0 1 0-.45l1.66-.59a.24.24 0 0 0 .15-.15l.59-1.66Z" />
        </svg>
      </span>
    `}};m.styles=te,u([f({type:String,attribute:"post-name"})],m.prototype,"postName",2),u([f({type:String})],m.prototype,"logo",2),u([f({type:String,attribute:"summary-title"})],m.prototype,"summaryTitle",2),u([f({type:String,attribute:"gpt-name"})],m.prototype,"gptName",2),u([f({type:Number,attribute:"type-speed"})],m.prototype,"typeSpeed",2),u([f({type:Boolean})],m.prototype,"typewriter",2),u([f({type:String,attribute:"dark-selector"})],m.prototype,"darkSelector",2),u([f({type:String,attribute:"theme-name"})],m.prototype,"themeName",2),u([f({type:String,attribute:"ui-style"})],m.prototype,"uiStyle",2),u([f({type:String,attribute:"fixed-tone"})],m.prototype,"fixedTone",2),u([f({type:String,attribute:"fixed-density"})],m.prototype,"fixedDensity",2),u([f({attribute:!1})],m.prototype,"theme",2),u([w()],m.prototype,"content",2),u([w()],m.prototype,"displayContent",2),u([w()],m.prototype,"loading",2),u([w()],m.prototype,"typing",2),u([w()],m.prototype,"loadFailed",2),u([w()],m.prototype,"isDark",2),m=u([Kt("likcc-article-summary")],m);const F="ai-summaraidGPT",L="ai-summaraidGPT-data",bt="likcc-article-summary",vt="data-summary-lit-mounted",_t="data-summary-silent-processed";let I,X;function ce(){window.likcc_summaraidGPT_scriptLoaded||(console.log("%c智阅GPT-智能AI助手","color: #4F8DFD; font-size: 16px; font-weight: bold;"),console.log("%c智阅点睛，一键洞见——基于AI大模型的Halo智能AI助手","color: #666; font-size: 12px;"),console.log("%c作者: Handsome | 网站: https://lik.cc","color: #999; font-size: 11px;"),window.likcc_summaraidGPT_scriptLoaded=!0)}function le(i,t,e){i.postName=e.getAttribute("name")||"",i.logo=t.logo||"",i.summaryTitle=t.summaryTitle||"文章摘要",i.gptName=t.gptName||"智阅GPT",i.typeSpeed=t.typeSpeed??20,i.typewriter=t.typewriter??!0,i.darkSelector=t.darkSelector||"",i.uiStyle=t.uiStyle||"classic",i.fixedTone=t.fixedTone||"violet",i.fixedDensity=t.fixedDensity||"compact",i.themeName=t.themeName||"custom",i.theme=t.theme||{}}async function tt(i={}){const t=Array.from(document.querySelectorAll(`${F}:not([${vt}="true"])`));if(t.length===0)return[];const s={...await re(),...i};return t.map(r=>{const a=document.createElement(bt);return le(a,s,r),r.setAttribute(vt,"true"),r.replaceWith(a),a})}async function de(){const i=Array.from(document.querySelectorAll(`${L}:not([${_t}="true"])`));await Promise.all(i.map(async t=>{const e=t.getAttribute("name");if(e){t.setAttribute(_t,"true");try{await kt(e)}catch(s){console.warn("摘要入库失败:",s)}}}))}async function me(){const i=document.querySelectorAll(F),t=document.querySelectorAll(L),e=document.querySelector(bt);if(i.length>0){await tt();return}t.length>0&&!e&&await de()}function P(){I&&window.clearTimeout(I),I=window.setTimeout(()=>{I=void 0,me()},0)}function ue(i){return i.type!=="childList"?!1:Array.from(i.addedNodes).some(e=>e instanceof Element?e.matches(F)||e.matches(L)||e.querySelector(F)!==null||e.querySelector(L)!==null:!1)}function he(){X||(X=new MutationObserver(i=>{i.some(ue)&&P()}),X.observe(document.documentElement,{childList:!0,subtree:!0}))}function pe(){["pjax:success","pjax:complete","swup:content-replaced","swup:page:view","swup:animation:in:end"].forEach(t=>{document.addEventListener(t,P)}),window.swup?.hooks?.on?.("page:view",P),window.swup?.hooks?.on?.("content:replace",P)}ce(),window.likcc_summaraidGPT_initSummaryBox=tt,window.likcc_summaraidGPT_reinit=tt,he(),pe(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{P()},{once:!0}):P()}));
