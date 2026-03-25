(function(b){typeof define=="function"&&define.amd?define(b):b()})((function(){"use strict";const b=globalThis,W=b.ShadowRoot&&(b.ShadyCSS===void 0||b.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,q=Symbol(),te=new WeakMap;let ie=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(W&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=te.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&te.set(t,e))}return e}toString(){return this.cssText}};const Te=i=>new ie(typeof i=="string"?i:i+"",void 0,q),xe=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((s,r,a)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[a+1],i[0]);return new ie(t,i,q)},Se=(i,e)=>{if(W)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),r=b.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}},se=W?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return Te(t)})(i):i;const{is:Ae,defineProperty:we,getOwnPropertyDescriptor:Pe,getOwnPropertyNames:Ce,getOwnPropertySymbols:Ee,getPrototypeOf:Ge}=Object,L=globalThis,re=L.trustedTypes,Ne=re?re.emptyScript:"",Oe=L.reactiveElementPolyfillSupport,C=(i,e)=>i,z={toAttribute(i,e){switch(e){case Boolean:i=i?Ne:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},Y=(i,e)=>!Ae(i,e),ae={attribute:!0,type:String,converter:z,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??=Symbol("metadata"),L.litPropertyMetadata??=new WeakMap;let S=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ae){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(e,s,t);r!==void 0&&we(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){const{get:r,set:a}=Pe(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:r,set(n){const c=r?.call(this);a?.call(this,n),this.requestUpdate(e,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ae}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;const e=Ge(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){const t=this.properties,s=[...Ce(t),...Ee(t)];for(const r of s)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,r]of t)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const r=this._$Eu(t,s);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(se(r))}else e!==void 0&&t.push(se(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Se(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){const a=(s.converter?.toAttribute!==void 0?s.converter:z).toAttribute(t,s.type);this._$Em=e,a==null?this.removeAttribute(r):this.setAttribute(r,a),this._$Em=null}}_$AK(e,t){const s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const a=s.getPropertyOptions(r),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:z;this._$Em=r;const c=n.fromAttribute(t,a.type);this[r]=c??this._$Ej?.get(r)??c,this._$Em=null}}requestUpdate(e,t,s,r=!1,a){if(e!==void 0){const n=this.constructor;if(r===!1&&(a=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??Y)(a,t)||s.useDefault&&s.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:r,wrapped:a},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),a!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,a]of this._$Ep)this[r]=a;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,a]of s){const{wrapped:n}=a,c=this[r];n!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,a,c)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[C("elementProperties")]=new Map,S[C("finalized")]=new Map,Oe?.({ReactiveElement:S}),(L.reactiveElementVersions??=[]).push("2.1.2");const Q=globalThis,ne=i=>i,R=Q.trustedTypes,oe=R?R.createPolicy("lit-html",{createHTML:i=>i}):void 0,ce="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,le="?"+k,Me=`<${le}>`,v=document,E=()=>v.createComment(""),G=i=>i===null||typeof i!="object"&&typeof i!="function",V=Array.isArray,Ue=i=>V(i)||typeof i?.[Symbol.iterator]=="function",Z=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,me=/-->/g,de=/>/g,_=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),he=/'/g,ue=/"/g,pe=/^(?:script|style|textarea|title)$/i,De=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),g=De(1),T=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),fe=new WeakMap,x=v.createTreeWalker(v,129);function ge(i,e){if(!V(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return oe!==void 0?oe.createHTML(e):e}const Le=(i,e)=>{const t=i.length-1,s=[];let r,a=e===2?"<svg>":e===3?"<math>":"",n=N;for(let c=0;c<t;c++){const o=i[c];let u,p,l=-1,y=0;for(;y<o.length&&(n.lastIndex=y,p=n.exec(o),p!==null);)y=n.lastIndex,n===N?p[1]==="!--"?n=me:p[1]!==void 0?n=de:p[2]!==void 0?(pe.test(p[2])&&(r=RegExp("</"+p[2],"g")),n=_):p[3]!==void 0&&(n=_):n===_?p[0]===">"?(n=r??N,l=-1):p[1]===void 0?l=-2:(l=n.lastIndex-p[2].length,u=p[1],n=p[3]===void 0?_:p[3]==='"'?ue:he):n===ue||n===he?n=_:n===me||n===de?n=N:(n=_,r=void 0);const $=n===_&&i[c+1].startsWith("/>")?" ":"";a+=n===N?o+Me:l>=0?(s.push(u),o.slice(0,l)+ce+o.slice(l)+k+$):o+k+(l===-2?c:$)}return[ge(i,a+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class O{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let a=0,n=0;const c=e.length-1,o=this.parts,[u,p]=Le(e,t);if(this.el=O.createElement(u,s),x.currentNode=this.el.content,t===2||t===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=x.nextNode())!==null&&o.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(const l of r.getAttributeNames())if(l.endsWith(ce)){const y=p[n++],$=r.getAttribute(l).split(k),j=/([.?@])?(.*)/.exec(y);o.push({type:1,index:a,name:j[2],strings:$,ctor:j[1]==="."?Re:j[1]==="?"?He:j[1]==="@"?Be:H}),r.removeAttribute(l)}else l.startsWith(k)&&(o.push({type:6,index:a}),r.removeAttribute(l));if(pe.test(r.tagName)){const l=r.textContent.split(k),y=l.length-1;if(y>0){r.textContent=R?R.emptyScript:"";for(let $=0;$<y;$++)r.append(l[$],E()),x.nextNode(),o.push({type:2,index:++a});r.append(l[y],E())}}}else if(r.nodeType===8)if(r.data===le)o.push({type:2,index:a});else{let l=-1;for(;(l=r.data.indexOf(k,l+1))!==-1;)o.push({type:7,index:a}),l+=k.length-1}a++}}static createElement(e,t){const s=v.createElement("template");return s.innerHTML=e,s}}function A(i,e,t=i,s){if(e===T)return e;let r=s!==void 0?t._$Co?.[s]:t._$Cl;const a=G(e)?void 0:e._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),a===void 0?r=void 0:(r=new a(i),r._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=r:t._$Cl=r),r!==void 0&&(e=A(i,r._$AS(i,e.values),r,s)),e}class ze{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,r=(e?.creationScope??v).importNode(t,!0);x.currentNode=r;let a=x.nextNode(),n=0,c=0,o=s[0];for(;o!==void 0;){if(n===o.index){let u;o.type===2?u=new M(a,a.nextSibling,this,e):o.type===1?u=new o.ctor(a,o.name,o.strings,this,e):o.type===6&&(u=new Fe(a,this,e)),this._$AV.push(u),o=s[++c]}n!==o?.index&&(a=x.nextNode(),n++)}return x.currentNode=v,r}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class M{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,r){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=A(this,e,t),G(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==T&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ue(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&G(this._$AH)?this._$AA.nextSibling.data=e:this.T(v.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=O.createElement(ge(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(t);else{const a=new ze(r,this),n=a.u(this.options);a.p(t),this.T(n),this._$AH=a}}_$AC(e){let t=fe.get(e.strings);return t===void 0&&fe.set(e.strings,t=new O(e)),t}k(e){V(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const a of e)r===t.length?t.push(s=new M(this.O(E()),this.O(E()),this,this.options)):s=t[r],s._$AI(a),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=ne(e).nextSibling;ne(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,r,a){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=m}_$AI(e,t=this,s,r){const a=this.strings;let n=!1;if(a===void 0)e=A(this,e,t,0),n=!G(e)||e!==this._$AH&&e!==T,n&&(this._$AH=e);else{const c=e;let o,u;for(e=a[0],o=0;o<a.length-1;o++)u=A(this,c[s+o],t,o),u===T&&(u=this._$AH[o]),n||=!G(u)||u!==this._$AH[o],u===m?e=m:e!==m&&(e+=(u??"")+a[o+1]),this._$AH[o]=u}n&&!r&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Re extends H{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}}class He extends H{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}}class Be extends H{constructor(e,t,s,r,a){super(e,t,s,r,a),this.type=5}_$AI(e,t=this){if((e=A(this,e,t,0)??m)===T)return;const s=this._$AH,r=e===m&&s!==m||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==m&&(s===m||r);r&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Fe{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}}const Ie=Q.litHtmlPolyfillSupport;Ie?.(O,M),(Q.litHtmlVersions??=[]).push("3.3.2");const je=(i,e,t)=>{const s=t?.renderBefore??e;let r=s._$litPart$;if(r===void 0){const a=t?.renderBefore??null;s._$litPart$=r=new M(e.insertBefore(E(),a),a,void 0,t??{})}return r._$AI(i),r};const J=globalThis;let U=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=je(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};U._$litElement$=!0,U.finalized=!0,J.litElementHydrateSupport?.({LitElement:U});const We=J.litElementPolyfillSupport;We?.({LitElement:U}),(J.litElementVersions??=[]).push("4.2.2");const qe={ATTRIBUTE:1},Ye=i=>(...e)=>({_$litDirective$:i,values:e});let Qe=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const ye="important",Ve=" !"+ye,Ze=Ye(class extends Qe{constructor(i){if(super(i),i.type!==qe.ATTRIBUTE||i.name!=="style"||i.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(i){return Object.keys(i).reduce((e,t)=>{const s=i[t];return s==null?e:e+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(i,[e]){const{style:t}=i.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(const s of this.ft)e[s]==null&&(this.ft.delete(s),s.includes("-")?t.removeProperty(s):t[s]=null);for(const s in e){const r=e[s];if(r!=null){this.ft.add(s);const a=typeof r=="string"&&r.endsWith(Ve);s.includes("-")||a?t.setProperty(s,a?r.slice(0,-11):r,a?ye:""):t[s]=r}}return T}});const Je=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};const Ke={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:Y},Xe=(i=Ke,e,t)=>{const{kind:s,metadata:r}=t;let a=globalThis.litPropertyMetadata.get(r);if(a===void 0&&globalThis.litPropertyMetadata.set(r,a=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),a.set(t.name,i),s==="accessor"){const{name:n}=t;return{set(c){const o=e.get.call(this);e.set.call(this,c),this.requestUpdate(n,o,i,!0,c)},init(c){return c!==void 0&&this.C(n,void 0,i,c),c}}}if(s==="setter"){const{name:n}=t;return function(c){const o=this[n];e.call(this,c),this.requestUpdate(n,o,i,!0,c)}}throw Error("Unsupported decorator location: "+s)};function f(i){return(e,t)=>typeof t=="object"?Xe(i,e,t):((s,r,a)=>{const n=r.hasOwnProperty(a);return r.constructor.createProperty(a,s),n?Object.getOwnPropertyDescriptor(r,a):void 0})(i,e,t)}function w(i){return f({...i,state:!0,attribute:!1})}const et=xe`
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
`,ke="/apis/api.summary.summaraidgpt.lik.cc/v1alpha1",D={bg:"#f7f9fe",main:"#4F8DFD",contentFontSize:"16px",title:"#3A5A8C",content:"#222",gptName:"#7B88A8",contentBg:"#fff",border:"#e3e8f7",shadow:"0 2px 12px 0 rgba(60,80,180,0.08)",tagBg:"#f0f4ff",tagColor:"#4F8DFD",cursor:"#4F8DFD"},K={logo:"icon.svg",summaryTitle:"文章摘要",gptName:"智阅GPT",typeSpeed:20,darkSelector:"",uiStyle:"classic",fixedTone:"violet",fixedDensity:"compact",themeName:"custom",theme:D,typewriter:!0};function tt(i){if(!i)return{...D};if(typeof i=="string")try{const e=JSON.parse(i);return{...D,...e}}catch{return{...D}}return{...D,...i}}function it(i){const e=document.documentElement,t=document.body,s=window.matchMedia?.("(prefers-color-scheme: dark)").matches??!1,r=e.getAttribute("data-color-scheme")||t.getAttribute("data-color-scheme");if(r==="dark")return!0;if(r==="light")return!1;if(r==="auto")return s;if(e.classList.contains("color-scheme-dark")||t.classList.contains("color-scheme-dark")||e.classList.contains("dark")||t.classList.contains("dark"))return!0;if(e.classList.contains("color-scheme-light")||t.classList.contains("color-scheme-light")||e.classList.contains("light")||t.classList.contains("light"))return!1;if(e.classList.contains("color-scheme-auto")||t.classList.contains("color-scheme-auto"))return s;if(!i)return!1;const a=i.match(/^data-([\w-]+)=(.+)$/);if(a){const c=`data-${a[1]}`,o=a[2];return e.getAttribute(c)===o||t.getAttribute(c)===o}const n=i.match(/^class=(.+)$/);if(n){const c=n[1];return e.classList.contains(c)||t.classList.contains(c)}return e.classList.contains(i)||t.classList.contains(i)}function st(i,e){const t=document.documentElement,s=document.body,r={attributes:!0,attributeFilter:["class","data-color-scheme"]},a=i.match(/^data-([\w-]+)=(.+)$/);a&&(r.attributeFilter=["class","data-color-scheme",`data-${a[1]}`]);const n=new MutationObserver(e),c=new MutationObserver(e);return n.observe(t,r),c.observe(s,r),[n,c]}async function rt(){try{const i=await fetch(`${ke}/summaryConfig`);if(!i.ok)throw new Error(`HTTP ${i.status}: ${i.statusText}`);const e=await i.json();return{...K,...e,theme:e.theme??K.theme}}catch{return{...K}}}async function $e(i){const e=await fetch(`${ke}/updateContent`,{method:"POST",headers:{"Content-Type":"application/json"},body:i});if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);return await e.json()}function at(i){return i?i.startsWith("http://")||i.startsWith("https://")||i.startsWith("/")||i.startsWith("data:")?i:`/plugins/summaraidGPT/assets/static/${i}`:""}var nt=Object.defineProperty,ot=Object.getOwnPropertyDescriptor,h=(i,e,t,s)=>{for(var r=s>1?void 0:s?ot(e,t):e,a=i.length-1,n;a>=0;a--)(n=i[a])&&(r=(s?n(e,t,r):n(r))||r);return s&&r&&nt(e,t,r),r};let d=class extends U{constructor(){super(...arguments),this.postName="",this.logo="",this.summaryTitle="文章摘要",this.gptName="智阅GPT",this.typeSpeed=20,this.typewriter=!0,this.darkSelector="",this.themeName="custom",this.uiStyle="classic",this.fixedTone="violet",this.fixedDensity="compact",this.theme={},this.content="",this.displayContent="",this.loading=!0,this.typing=!1,this.loadFailed=!1,this.isDark=!1,this.themeObservers=[],this.initialized=!1,this.handleSystemColorSchemeChange=()=>{this.refreshThemeMode()}}connectedCallback(){super.connectedCallback(),this.refreshThemeMode(),this.bindThemeObservers(),this.bindSystemColorSchemeListener()}firstUpdated(){this.postName?this.loadSummary():(this.loading=!1,this.loadFailed=!0,this.displayContent="摘要加载失败，请稍后重试"),this.initialized=!0}disconnectedCallback(){super.disconnectedCallback(),this.unbindThemeObservers(),this.unbindSystemColorSchemeListener(),this.stopTypewriter()}updated(i){i.has("darkSelector")&&(this.refreshThemeMode(),this.bindThemeObservers()),this.initialized&&i.has("postName")&&this.postName&&this.loadSummary()}async loadSummary(){this.stopTypewriter(),this.loading=!0,this.loadFailed=!1,this.displayContent="";try{const i=await $e(this.postName);this.content=i.summaryContent?.trim()||"暂无摘要内容",this.applyContent()}catch(i){console.warn("获取摘要失败:",i),this.content="摘要加载失败，请稍后重试",this.displayContent=this.content,this.loadFailed=!0}finally{this.loading=!1}}applyContent(){if(this.stopTypewriter(),!this.typewriter){this.displayContent=this.content,this.typing=!1;return}this.typing=!0,this.displayContent="";const i=Number.isFinite(this.typeSpeed)?Math.max(this.typeSpeed,0):20;let e=0;const t=()=>{if(e+=1,this.displayContent=this.content.slice(0,e),e>=this.content.length){this.typing=!1,this.typewriterTimer=void 0;return}this.typewriterTimer=window.setTimeout(t,i)};if(!this.content){this.typing=!1;return}t()}stopTypewriter(){this.typing=!1,this.typewriterTimer&&(window.clearTimeout(this.typewriterTimer),this.typewriterTimer=void 0)}refreshThemeMode(){this.isDark=it(this.darkSelector)}bindThemeObservers(){this.unbindThemeObservers(),this.themeObservers=st(this.darkSelector,()=>{this.refreshThemeMode()})}unbindThemeObservers(){this.themeObservers.forEach(i=>i.disconnect()),this.themeObservers=[]}bindSystemColorSchemeListener(){if(window.matchMedia){if(this.prefersColorSchemeQuery=window.matchMedia("(prefers-color-scheme: dark)"),typeof this.prefersColorSchemeQuery.addEventListener=="function"){this.prefersColorSchemeQuery.addEventListener("change",this.handleSystemColorSchemeChange);return}this.prefersColorSchemeQuery.addListener?.(this.handleSystemColorSchemeChange)}}unbindSystemColorSchemeListener(){this.prefersColorSchemeQuery&&(typeof this.prefersColorSchemeQuery.removeEventListener=="function"?this.prefersColorSchemeQuery.removeEventListener("change",this.handleSystemColorSchemeChange):this.prefersColorSchemeQuery.removeListener?.(this.handleSystemColorSchemeChange),this.prefersColorSchemeQuery=void 0)}get effectiveThemeName(){return this.isDark?"dark":this.themeName==="dark"||this.themeName==="blue"||this.themeName==="green"||this.themeName==="custom"?this.themeName:"default"}get effectiveUiStyle(){return this.uiStyle==="simple"||this.uiStyle==="quiet"?"simple":this.uiStyle==="note"||this.uiStyle==="minimal"||this.uiStyle==="stripe"||this.uiStyle==="inline"?this.uiStyle==="inline"?"inline":"simple":this.themeName==="spotlight"?"simple":"classic"}get customThemeStyles(){if(this.effectiveThemeName!=="custom")return{};const i=tt(this.theme);return{"--likcc-summaraid-bg":i.bg??"","--likcc-summaraid-main":i.main??"","--likcc-summaraid-contentFontSize":i.contentFontSize??"","--likcc-summaraid-title":i.title??"","--likcc-summaraid-content":i.content??"","--likcc-summaraid-gptName":i.gptName??"","--likcc-summaraid-contentBg":i.contentBg??"","--likcc-summaraid-border":i.border??"","--likcc-summaraid-shadow":i.shadow??"","--likcc-summaraid-tagBg":i.tagBg??"","--likcc-summaraid-tagColor":i.tagColor??"","--likcc-summaraid-cursor":i.cursor??""}}get effectiveFixedTone(){return this.fixedTone==="graphite"||this.fixedTone==="copper"?this.fixedTone:"violet"}get effectiveFixedDensity(){return this.fixedDensity==="comfortable"?"comfortable":"compact"}get fixedStyleClassName(){const i=["likcc-summaraidGPT-fixed",`likcc-summaraidGPT-tone--${this.effectiveFixedTone}`,`likcc-summaraidGPT-density--${this.effectiveFixedDensity}`];return this.isDark&&i.push("likcc-summaraidGPT-fixed--dark"),i.join(" ")}render(){return this.effectiveUiStyle==="simple"?this.renderSimpleCard():this.effectiveUiStyle==="inline"?this.renderInlineCard():this.renderClassicCard()}renderClassicCard(){const i=`likcc-summaraidGPT-summary--${this.effectiveThemeName}`,e=at(this.logo),t=this.loading?"正在生成摘要…":this.displayContent;return g`
      <div class="likcc-summaraidGPT-summary-container ${i}" style=${Ze(this.customThemeStyles)}>
        <div class="likcc-summaraidGPT-summary-header">
          <div class="likcc-summaraidGPT-header-left">
            ${e?g`<img class="likcc-summaraidGPT-logo not-prose" src=${e} alt=${this.gptName||"AI Logo"} width="20" height="20" />`:m}
            <span class="likcc-summaraidGPT-summary-title">${this.summaryTitle||"文章摘要"}</span>
          </div>
          <span class="likcc-summaraidGPT-gpt-name">${this.gptName||"智阅GPT"}</span>
        </div>
        <div class="likcc-summaraidGPT-summary-content">
          ${this.loading||this.loadFailed?g`<span style="color:#bbb;">${t}</span>`:t}
          ${this.typing?g`<span class="likcc-summaraidGPT-cursor"></span>`:m}
        </div>
      </div>
    `}renderInlineCard(){const i=this.loading?"正在生成摘要…":this.displayContent,e=this.summaryTitle||"AI 总结";return g`
      <div class="likcc-summaraidGPT-inline-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-inline-shell">
          <div class="likcc-summaraidGPT-inline-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-inline-icon")}
            <span class="likcc-summaraidGPT-inline-title">${e}</span>
          </div>
          <div class="likcc-summaraidGPT-inline-content">
            ${this.loading||this.loadFailed?g`<span style="color:#8892a6;">${i}</span>`:i}
            ${this.typing?g`<span class="likcc-summaraidGPT-cursor"></span>`:m}
          </div>
        </div>
      </div>
    `}renderSimpleCard(){const i=this.loading?"正在生成摘要…":this.displayContent,e=this.summaryTitle||"AI 总结";return g`
      <div class="likcc-summaraidGPT-simple-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-simple-shell">
          <div class="likcc-summaraidGPT-simple-header">
            ${this.renderSparklesIcon("likcc-summaraidGPT-simple-icon")}
            <span class="likcc-summaraidGPT-simple-title">${e}</span>
          </div>
          <div class="likcc-summaraidGPT-simple-content">
            ${this.loading||this.loadFailed?g`<span style="color:#8892a6;">${i}</span>`:i}
            ${this.typing?g`<span class="likcc-summaraidGPT-cursor"></span>`:m}
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
    `}};d.styles=et,h([f({type:String,attribute:"post-name"})],d.prototype,"postName",2),h([f({type:String})],d.prototype,"logo",2),h([f({type:String,attribute:"summary-title"})],d.prototype,"summaryTitle",2),h([f({type:String,attribute:"gpt-name"})],d.prototype,"gptName",2),h([f({type:Number,attribute:"type-speed"})],d.prototype,"typeSpeed",2),h([f({type:Boolean})],d.prototype,"typewriter",2),h([f({type:String,attribute:"dark-selector"})],d.prototype,"darkSelector",2),h([f({type:String,attribute:"theme-name"})],d.prototype,"themeName",2),h([f({type:String,attribute:"ui-style"})],d.prototype,"uiStyle",2),h([f({type:String,attribute:"fixed-tone"})],d.prototype,"fixedTone",2),h([f({type:String,attribute:"fixed-density"})],d.prototype,"fixedDensity",2),h([f({attribute:!1})],d.prototype,"theme",2),h([w()],d.prototype,"content",2),h([w()],d.prototype,"displayContent",2),h([w()],d.prototype,"loading",2),h([w()],d.prototype,"typing",2),h([w()],d.prototype,"loadFailed",2),h([w()],d.prototype,"isDark",2),d=h([Je("likcc-article-summary")],d);const B="ai-summaraidGPT",F="ai-summaraidGPT-data",be="likcc-article-summary",ve="data-summary-lit-mounted",_e="data-summary-silent-processed";let I,X;function ct(){window.likcc_summaraidGPT_scriptLoaded||(console.log("%c智阅GPT-智能AI助手","color: #4F8DFD; font-size: 16px; font-weight: bold;"),console.log("%c智阅点睛，一键洞见——基于AI大模型的Halo智能AI助手","color: #666; font-size: 12px;"),console.log("%c作者: Handsome | 网站: https://lik.cc","color: #999; font-size: 11px;"),window.likcc_summaraidGPT_scriptLoaded=!0)}function lt(i,e,t){i.postName=t.getAttribute("name")||"",i.logo=e.logo||"",i.summaryTitle=e.summaryTitle||"文章摘要",i.gptName=e.gptName||"智阅GPT",i.typeSpeed=e.typeSpeed??20,i.typewriter=e.typewriter??!0,i.darkSelector=e.darkSelector||"",i.uiStyle=e.uiStyle||"classic",i.fixedTone=e.fixedTone||"violet",i.fixedDensity=e.fixedDensity||"compact",i.themeName=e.themeName||"custom",i.theme=e.theme||{}}async function ee(i={}){const e=Array.from(document.querySelectorAll(`${B}:not([${ve}="true"])`));if(e.length===0)return[];const s={...await rt(),...i};return e.map(r=>{const a=document.createElement(be);return lt(a,s,r),r.setAttribute(ve,"true"),r.replaceWith(a),a})}async function mt(){const i=Array.from(document.querySelectorAll(`${F}:not([${_e}="true"])`));await Promise.all(i.map(async e=>{const t=e.getAttribute("name");if(t){e.setAttribute(_e,"true");try{await $e(t)}catch(s){console.warn("摘要入库失败:",s)}}}))}async function dt(){const i=document.querySelectorAll(B),e=document.querySelectorAll(F),t=document.querySelector(be);if(i.length>0){await ee();return}e.length>0&&!t&&await mt()}function P(){I&&window.clearTimeout(I),I=window.setTimeout(()=>{I=void 0,dt()},0)}function ht(i){return i.type!=="childList"?!1:Array.from(i.addedNodes).some(t=>t instanceof Element?t.matches(B)||t.matches(F)||t.querySelector(B)!==null||t.querySelector(F)!==null:!1)}function ut(){X||(X=new MutationObserver(i=>{i.some(ht)&&P()}),X.observe(document.documentElement,{childList:!0,subtree:!0}))}function pt(){["pjax:success","pjax:complete","swup:content-replaced","swup:page:view","swup:animation:in:end"].forEach(e=>{document.addEventListener(e,P)}),window.swup?.hooks?.on?.("page:view",P),window.swup?.hooks?.on?.("content:replace",P)}ct(),window.likcc_summaraidGPT_initSummaryBox=ee,window.likcc_summaraidGPT_reinit=ee,ut(),pt(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{P()},{once:!0}):P()}));
