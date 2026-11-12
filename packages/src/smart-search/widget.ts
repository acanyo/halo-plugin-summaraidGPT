import { LitElement, html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { markdownToHtml } from '../rag-assistant/format';
import * as api from './api';
import { searchStyles } from './styles';
import './discovery';
import { answerIcon, collapseIcon, documentIcon, linkIcon, semanticIcon, stopIcon } from './icons';
import type { SearchHit, SearchOptions, SearchSource, SmartSearchConfig } from './types';

export interface NativeSearchForm extends HTMLElement {
  options?: SearchOptions;
  updateComplete?: Promise<unknown>;
}

/** Supplemental content inside the official form; its input, results and shortcuts stay native. */
export class SmartSearchExtension extends LitElement {
  static styles = searchStyles;
  static properties = {
    config: { attribute: false }, query: { state: true }, active: { state: true },
    hits: { state: true }, loading: { state: true }, notice: { state: true }, error: { state: true },
    answerText: { state: true }, sources: { state: true }, answering: { state: true },
  };
  config!: SmartSearchConfig;
  private query = '';
  private active = '';
  private hits: SearchHit[] = [];
  private loading = false;
  private notice = '';
  private error = '';
  private answerText = '';
  private sources: SearchSource[] = [];
  private answering = false;
  private controller?: AbortController;
  private nativeForm?: NativeSearchForm;
  private input?: HTMLInputElement;
  private revision = 0;

  constructor() {
    super();
    // Keep the native Enter/arrow navigation scoped to its own result list.
    this.addEventListener('keydown', event => {
      if (event.key !== 'Escape') event.stopPropagation();
    });
  }

  attach(form: NativeSearchForm) {
    this.detach();
    this.nativeForm = form;
    this.input = form.shadowRoot?.querySelector('input') || undefined;
    this.input?.addEventListener('input', this.syncQuery);
    // The native clear button changes input.value without dispatching an input event.
    form.shadowRoot?.addEventListener('click', this.afterNativeClick);
    this.syncQuery();
  }

  private afterNativeClick = () => { queueMicrotask(this.syncQuery); };
  private syncQuery = () => {
    const query = (this.input?.value || '').slice(0, 500).trim();
    if (query === this.query) return;
    this.query = query;
    this.clear();
  };

  private cancel() {
    ++this.revision;
    this.controller?.abort();
    this.loading = false;
    this.answering = false;
  }

  private clear() {
    this.cancel();
    this.active = '';
    this.hits = [];
    this.notice = '';
    this.error = '';
    this.answerText = '';
    this.sources = [];
  }

  private detach() {
    this.input?.removeEventListener('input', this.syncQuery);
    this.nativeForm?.shadowRoot?.removeEventListener('click', this.afterNativeClick);
    this.cancel();
  }

  disconnectedCallback() { this.detach(); super.disconnectedCallback(); }

  private async run(mode: 'semantic' | 'answer') {
    if (!this.query) return;
    this.clear();
    this.active = mode;
    const controller = this.controller = new AbortController();
    const revision = this.revision;
    const current = () => !controller.signal.aborted && revision === this.revision;
    const options = this.nativeForm?.options || {};
    this.loading = mode === 'semantic';
    this.answering = mode === 'answer';
    try {
      if (mode === 'semantic') {
        const result = await api.search(this.query, mode, options, controller.signal);
        if (!current()) return;
        // The native keyword list is already visible; avoid duplicating it on fallback.
        this.hits = result.fallback ? [] : result.hits.filter(hit => !!api.safeLink(hit.url));
        this.notice = result.message || (this.hits.length ? '' : '没有找到相关内容。');
      } else {
        await api.answer(this.query, options, controller.signal, event => {
          if (!current()) return;
          if (event.type === 'delta') this.answerText += event.delta || '';
          if (event.type === 'sources') this.sources = (event.sources || []).filter(source => !!api.safeLink(source.url));
          if (event.type === 'error') this.error = event.error || 'AI 解答暂时不可用，请重试。';
        });
      }
    } catch (error) {
      if (current()) this.error = error instanceof Error ? error.message : '请求失败，请稍后重试。';
    } finally {
      if (this.controller === controller) { this.loading = false; this.answering = false; }
    }
  }

  private stop() { this.cancel(); this.notice = '生成已停止。'; }

  render() {
    if (!this.config) return nothing;
    return html`
      ${this.config.enableSemantic || this.config.enableAi ? html`<div class="toolbar"><div class="actions" role="group" aria-label="搜索扩展">
        ${this.config.enableSemantic ? html`<button class="action semantic" ?disabled=${!this.query || this.loading}
          aria-expanded=${this.active === 'semantic'} aria-controls="search-extension-content"
          @click=${() => this.run('semantic')}>${semanticIcon}<span>智能搜索</span></button>` : nothing}
        ${this.config.enableAi ? html`<button class="action ai" ?disabled=${!this.query || this.answering}
          aria-expanded=${this.active === 'answer'} aria-controls="search-extension-content"
          @click=${() => this.run('answer')}>${answerIcon}<span>AI 解答</span></button>` : nothing}
      </div>${!this.query ? html`<span class="action-hint">输入关键词后使用</span>` : nothing}</div>` : nothing}
      ${!this.query ? html`<summaraid-search-discovery .options=${this.nativeForm?.options || {}}></summaraid-search-discovery>` : nothing}
      ${this.active ? html`<section id="search-extension-content" class="panel" data-kind=${this.active}
        aria-label=${this.active === 'semantic' ? '智能搜索结果' : 'AI 解答'} aria-busy=${this.loading || this.answering}>
        <div class="heading"><span class="panel-title"><span class="panel-icon">${this.active === 'semantic' ? semanticIcon : answerIcon}</span>
          ${this.active === 'semantic' ? '智能搜索' : 'AI 解答'}</span><div class="panel-controls">
          ${this.answering ? html`<button class="text-action" @click=${this.stop}>${stopIcon}<span>停止生成</span></button>` : nothing}
          <button class="text-action" @click=${this.clear} aria-label="收起扩展内容"><span>收起</span>${collapseIcon}</button>
        </div></div>
        <div class="panel-body">
        <div role="status" aria-live="polite">
          ${this.loading || this.answering ? html`<p class="notice progress"><span class="spinner" aria-hidden="true"></span>${this.loading ? '正在搜索相关文章…' : '正在整理回答…'}</p>` : nothing}
          ${this.notice ? html`<p class="notice">${this.notice}</p>` : nothing}
          ${this.error ? html`<p class="notice error">${this.error}</p>` : nothing}
        </div>
        ${this.active === 'semantic' ? html`<ul class="results">${this.hits.map(hit => html`<li>
          <a class="result" href=${api.safeLink(hit.url)!}><span class="result-icon">${documentIcon}</span>
            <div><strong>${hit.title}</strong><p>${hit.excerpt}</p></div><span class="result-arrow">${linkIcon}</span></a>
        </li>`)}</ul>` : html`<div class="prose">${unsafeHTML(markdownToHtml(this.answerText))}</div>`}
        </div>
        ${this.active === 'answer' && this.sources.length ? html`<div class="sources"><span class="source-label">参考文章</span><div class="source-links">${this.sources.map(source => html`
          <a href=${api.safeLink(source.url)!} target="_blank" rel="noopener noreferrer">${documentIcon}<span>${source.title}</span>${linkIcon}</a>`)}</div></div>` : nothing}
      </section>` : nothing}`;
  }
}

if (!customElements.get('summaraid-search-extension')) {
  customElements.define('summaraid-search-extension', SmartSearchExtension);
}
