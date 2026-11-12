import { SUMMARY_API_BASE } from '../article-summary/shared';
import { annotateTerms, type GlossaryTerm } from './annotate';

const TERM_STYLE = `
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
`;

class ArticleTerm extends HTMLElement {
  private panel!: HTMLDivElement;
  private trigger!: HTMLButtonElement;
  private pinned = false;
  private dismissed = false;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private open() {
    if (this.dismissed) return;
    if (!this.panel.showPopover) return;
    this.panel.showPopover();
    this.trigger.setAttribute('aria-expanded', 'true');
    this.position();
  }
  private close = () => {
    if (this.panel.isConnected) this.panel.hidePopover?.();
    this.pinned = false;
    this.trigger.setAttribute('aria-expanded', 'false');
  };
  private position = () => {
    if (!this.panel.showPopover) return;
    if (!this.panel.matches(':popover-open')) return;
    const rect = this.getBoundingClientRect();
    const width = Math.min(310, window.innerWidth - 24);
    this.panel.style.width = `${width}px`;
    this.panel.style.maxHeight = `${Math.max(100, window.innerHeight - 24)}px`;
    this.panel.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`;
    const height = this.panel.getBoundingClientRect().height;
    const below = rect.bottom + 8;
    this.panel.style.top = `${Math.max(12, Math.min(below + height <= window.innerHeight - 12
      ? below : rect.top - height - 8, window.innerHeight - height - 12))}px`;
  };
  connectedCallback() {
    if (this.shadowRoot) return;
    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style'); style.textContent = TERM_STYLE;
    this.trigger = document.createElement('button'); this.trigger.type = 'button';
    this.trigger.append(document.createElement('slot'));
    this.trigger.setAttribute('aria-label', `${this.textContent}：查看词语解释`);
    this.trigger.setAttribute('aria-describedby', 'explanation');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.panel = document.createElement('div');
    this.panel.id = 'explanation'; this.panel.setAttribute('popover', 'auto');
    this.panel.setAttribute('role', 'tooltip');
    const label = document.createElement('small'); label.textContent = 'AI 词语注释';
    const title = document.createElement('strong'); title.textContent = this.textContent;
    const text = document.createElement('p'); text.textContent = this.getAttribute('explanation');
    const footer = document.createElement('footer'); footer.textContent = '结合本文生成 · 仅供理解参考';
    this.panel.append(label, title, text, footer); shadow.append(style, this.trigger, this.panel);
    // Older browsers retain a usable native text tooltip.
    if (!this.panel.showPopover) this.trigger.title = text.textContent || '';
    this.trigger.addEventListener('click', () => {
      this.dismissed = false;
      if (this.pinned) this.close(); else { this.pinned = true; this.open(); }
    });
    this.trigger.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.dismissed = true;
        this.close();
        event.preventDefault();
      }
    });
    this.trigger.addEventListener('focus', () => { this.dismissed = false; this.open(); });
    this.trigger.addEventListener('blur', this.close);
    this.addEventListener('pointerenter', () => { clearTimeout(this.hideTimer); this.open(); });
    this.addEventListener('pointerleave', () => {
      this.dismissed = false;
      this.hideTimer = setTimeout(() => { if (!this.pinned) this.close(); }, 160);
    });
    this.panel.addEventListener('pointerenter', () => clearTimeout(this.hideTimer));
    this.panel.addEventListener('pointerleave', () => { if (!this.pinned) this.close(); });
    this.panel.addEventListener('toggle', () => {
      if (!this.panel.matches(':popover-open')) this.close();
    });
    window.addEventListener('resize', this.position);
    window.addEventListener('scroll', this.position, true);
  }
  disconnectedCallback() {
    clearTimeout(this.hideTimer); this.close();
    window.removeEventListener('resize', this.position);
    window.removeEventListener('scroll', this.position, true);
  }
}

class ArticleGlossaryMarker extends HTMLElement {
  private timer?: ReturnType<typeof setTimeout>;
  private controller?: AbortController;
  private attempts = 0;
  private start = () => { void this.load(); };
  connectedCallback() {
    this.hidden = true;
    this.attempts = 0;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.start, { once: true });
    } else this.start();
  }
  disconnectedCallback() {
    clearTimeout(this.timer);
    this.controller?.abort();
    document.removeEventListener('DOMContentLoaded', this.start);
  }
  private async load() {
    const name = this.getAttribute('name');
    if (!name || !this.parentElement || !this.isConnected) return;
    this.controller = new AbortController();
    try {
      const response = await fetch(`${SUMMARY_API_BASE}/articleGlossaries/${encodeURIComponent(name)}`, {
        signal: this.controller.signal, credentials: 'same-origin',
      });
      if (!this.isConnected) return;
      if (response.status === 204 && this.getAttribute('poll') === 'true' && ++this.attempts < 25) {
        this.timer = setTimeout(() => void this.load(), 4000); return;
      }
      if (!response.ok || response.status === 204) return;
      const data = await response.json() as { spec?: { terms?: GlossaryTerm[] } };
      if (this.isConnected && this.parentElement && Array.isArray(data.spec?.terms)) {
        annotateTerms(this.parentElement, data.spec.terms);
      }
    } catch { /* Annotation failure must not interrupt article reading. */ }
  }
}

if (!customElements.get('likcc-article-term')) customElements.define('likcc-article-term', ArticleTerm);
if (!customElements.get('ai-summaraidgpt-glossary')) customElements.define('ai-summaraidgpt-glossary', ArticleGlossaryMarker);
