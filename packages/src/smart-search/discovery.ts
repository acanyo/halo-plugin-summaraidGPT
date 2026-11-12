import { LitElement, html, nothing } from 'lit';
import { discover, safeLink } from './api';
import { documentIcon, flameIcon, linkIcon, refreshIcon, shuffleIcon, viewIcon } from './icons';
import { discoveryStyles } from './discovery-styles';
import type { DiscoveryArticle, SearchOptions } from './types';

/** Empty-query suggestions, isolated from native results and AI requests. */
export class SearchDiscovery extends LitElement {
  static styles = discoveryStyles;
  static properties = {
    options: { attribute: false }, random: { state: true }, popular: { state: true },
    loading: { state: true }, error: { state: true },
  };
  options: SearchOptions = {};
  private random: DiscoveryArticle[] = [];
  private popular: DiscoveryArticle[] = [];
  private loading = true;
  private error = false;
  private controller?: AbortController;

  firstUpdated() { void this.load(); }
  disconnectedCallback() { this.controller?.abort(); super.disconnectedCallback(); }

  private async load() {
    this.controller?.abort();
    const controller = this.controller = new AbortController();
    this.loading = true;
    this.error = false;
    try {
      const result = await discover(this.options, this.random.map(article => article.id), controller.signal);
      if (controller.signal.aborted) return;
      const valid = (articles: DiscoveryArticle[]) => articles.filter(article => !!safeLink(article.url)).slice(0, 3);
      this.random = valid(result.random);
      this.popular = valid(result.popular);
    } catch {
      if (!controller.signal.aborted) this.error = true;
    } finally {
      if (!controller.signal.aborted) this.loading = false;
    }
  }

  private rows(articles: DiscoveryArticle[], popular = false) {
    return articles.map((article, index) => html`<li><a href=${safeLink(article.url)!} title=${article.title}>
      ${popular ? html`<span class="rank" aria-hidden="true">${index + 1}</span>`
        : html`<span class="article-icon">${documentIcon}</span>`}
      <span class="title">${article.title}</span>
      ${popular ? html`<span class="visits">${viewIcon}${new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.max(0, article.visits))} 阅读</span>`
        : html`<span class="arrow">${linkIcon}</span>`}
    </a></li>`);
  }

  render() {
    const initial = this.loading && !this.random.length;
    if (!initial && !this.error && !this.random.length && !this.popular.length) return nothing;
    return html`<div class="discovery" aria-label="文章推荐" aria-busy=${this.loading}>
      <section aria-label="随机推荐"><header><h3><span class="section-icon">${shuffleIcon}</span>随机推荐</h3>
        <button @click=${this.load} ?disabled=${this.loading} aria-label="换一批随机推荐">${refreshIcon}<span>${this.loading ? '加载中' : '换一批'}</span></button></header>
        ${initial ? html`<div class="random-list" aria-hidden="true">${[0,1,2].map(() => html`<div class="random-placeholder"><div class="skeleton"></div><div class="skeleton"></div></div>`)}</div>`
          : html`<ul class="random-list">${this.rows(this.random)}</ul>`}
      </section>
      ${initial || this.popular.length ? html`<section class="popular" aria-label="热门文章"><header><h3><span class="section-icon">${flameIcon}</span>热门文章</h3><span class="caption">按阅读量排序</span></header>
        ${initial ? html`<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`
          : html`<ol class="popular-list">${this.rows(this.popular, true)}</ol>`}</section>` : nothing}
      ${this.error ? html`<p class="message" role="status">文章推荐暂时不可用<button @click=${this.load}>重试</button></p>` : nothing}
    </div>`;
  }
}

if (!customElements.get('summaraid-search-discovery')) customElements.define('summaraid-search-discovery', SearchDiscovery);
