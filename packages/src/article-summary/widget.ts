import { LitElement, html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { customElement, property, state } from 'lit/decorators.js';
import { articleSummaryStyles } from './styles';
import {
  buildThemeObserver,
  fetchSummaryContent,
  matchesDarkSelector,
  parseTheme,
  resolveLogoUrl,
  type SummaryTheme,
} from './shared';

type ThemeVariant = 'default' | 'dark' | 'blue' | 'green' | 'custom';
type UiStyleVariant = 'classic' | 'inline' | 'simple';
type FixedToneVariant = 'violet' | 'graphite' | 'copper';
type FixedDensityVariant = 'compact' | 'comfortable';

@customElement('likcc-article-summary')
export class ArticleSummaryWidget extends LitElement {
  static styles = articleSummaryStyles;

  @property({ type: String, attribute: 'post-name' })
  postName = '';

  @property({ type: String })
  logo = '';

  @property({ type: String, attribute: 'summary-title' })
  summaryTitle = '文章摘要';

  @property({ type: String, attribute: 'gpt-name' })
  gptName = '智阅GPT';

  @property({ type: Number, attribute: 'type-speed' })
  typeSpeed = 20;

  @property({ type: Boolean })
  typewriter = true;

  @property({ type: String, attribute: 'dark-selector' })
  darkSelector = '';

  @property({ type: String, attribute: 'theme-name' })
  themeName = 'custom';

  @property({ type: String, attribute: 'ui-style' })
  uiStyle = 'classic';

  @property({ type: String, attribute: 'fixed-tone' })
  fixedTone = 'violet';

  @property({ type: String, attribute: 'fixed-density' })
  fixedDensity = 'compact';

  @property({ attribute: false })
  theme: SummaryTheme | string = {};

  @state()
  private content = '';

  @state()
  private displayContent = '';

  @state()
  private loading = true;

  @state()
  private typing = false;

  @state()
  private loadFailed = false;

  @state()
  private isDark = false;

  private themeObservers: MutationObserver[] = [];
  private typewriterTimer?: number;
  private initialized = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.refreshThemeMode();
    this.bindThemeObservers();
  }

  protected firstUpdated(): void {
    if (this.postName) {
      void this.loadSummary();
    } else {
      this.loading = false;
      this.loadFailed = true;
      this.displayContent = '摘要加载失败，请稍后重试';
    }

    this.initialized = true;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unbindThemeObservers();
    this.stopTypewriter();
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('darkSelector')) {
      this.refreshThemeMode();
      this.bindThemeObservers();
    }

    if (!this.initialized) {
      return;
    }

    if (changedProperties.has('postName') && this.postName) {
      void this.loadSummary();
    }
  }

  private async loadSummary(): Promise<void> {
    this.stopTypewriter();
    this.loading = true;
    this.loadFailed = false;
    this.displayContent = '';

    try {
      const data = await fetchSummaryContent(this.postName);
      this.content = data.summaryContent?.trim() || '暂无摘要内容';
      this.applyContent();
    } catch (error) {
      console.warn('获取摘要失败:', error);
      this.content = '摘要加载失败，请稍后重试';
      this.displayContent = this.content;
      this.loadFailed = true;
    } finally {
      this.loading = false;
    }
  }

  private applyContent(): void {
    this.stopTypewriter();

    if (!this.typewriter) {
      this.displayContent = this.content;
      this.typing = false;
      return;
    }

    this.typing = true;
    this.displayContent = '';

    const speed = Number.isFinite(this.typeSpeed) ? Math.max(this.typeSpeed, 0) : 20;
    let index = 0;

    const tick = () => {
      index += 1;
      this.displayContent = this.content.slice(0, index);

      if (index >= this.content.length) {
        this.typing = false;
        this.typewriterTimer = undefined;
        return;
      }

      this.typewriterTimer = window.setTimeout(tick, speed);
    };

    if (!this.content) {
      this.typing = false;
      return;
    }

    tick();
  }

  private stopTypewriter(): void {
    this.typing = false;
    if (this.typewriterTimer) {
      window.clearTimeout(this.typewriterTimer);
      this.typewriterTimer = undefined;
    }
  }

  private refreshThemeMode(): void {
    this.isDark = matchesDarkSelector(this.darkSelector);
  }

  private bindThemeObservers(): void {
    this.unbindThemeObservers();
    this.themeObservers = buildThemeObserver(this.darkSelector, () => {
      this.refreshThemeMode();
    });
  }

  private unbindThemeObservers(): void {
    this.themeObservers.forEach((observer) => observer.disconnect());
    this.themeObservers = [];
  }

  private get effectiveThemeName(): ThemeVariant {
    if (this.darkSelector && this.isDark) {
      return 'dark';
    }

    if (
      this.themeName === 'dark' ||
      this.themeName === 'blue' ||
      this.themeName === 'green' ||
      this.themeName === 'custom'
    ) {
      return this.themeName;
    }

    return 'default';
  }

  private get effectiveUiStyle(): UiStyleVariant {
    if (this.uiStyle === 'simple') {
      return 'simple';
    }
    if (this.uiStyle === 'quiet') {
      return 'simple';
    }
    if (this.uiStyle === 'note' || this.uiStyle === 'minimal' || this.uiStyle === 'stripe' || this.uiStyle === 'inline') {
      return this.uiStyle === 'inline' ? 'inline' : 'simple';
    }
    if (this.themeName === 'spotlight') {
      return 'simple';
    }
    return 'classic';
  }

  private get customThemeStyles(): Record<string, string> {
    if (this.effectiveThemeName !== 'custom') {
      return {};
    }

    const theme = parseTheme(this.theme);

    return {
      '--likcc-summaraid-bg': theme.bg ?? '',
      '--likcc-summaraid-main': theme.main ?? '',
      '--likcc-summaraid-contentFontSize': theme.contentFontSize ?? '',
      '--likcc-summaraid-title': theme.title ?? '',
      '--likcc-summaraid-content': theme.content ?? '',
      '--likcc-summaraid-gptName': theme.gptName ?? '',
      '--likcc-summaraid-contentBg': theme.contentBg ?? '',
      '--likcc-summaraid-border': theme.border ?? '',
      '--likcc-summaraid-shadow': theme.shadow ?? '',
      '--likcc-summaraid-tagBg': theme.tagBg ?? '',
      '--likcc-summaraid-tagColor': theme.tagColor ?? '',
      '--likcc-summaraid-cursor': theme.cursor ?? '',
    };
  }

  private get effectiveFixedTone(): FixedToneVariant {
    if (this.fixedTone === 'graphite' || this.fixedTone === 'copper') {
      return this.fixedTone;
    }
    return 'violet';
  }

  private get effectiveFixedDensity(): FixedDensityVariant {
    if (this.fixedDensity === 'comfortable') {
      return 'comfortable';
    }
    return 'compact';
  }

  private get fixedStyleClassName(): string {
    return [
      'likcc-summaraidGPT-fixed',
      `likcc-summaraidGPT-tone--${this.effectiveFixedTone}`,
      `likcc-summaraidGPT-density--${this.effectiveFixedDensity}`,
    ].join(' ');
  }

  protected render() {
    if (this.effectiveUiStyle === 'simple') {
      return this.renderSimpleCard();
    }
    if (this.effectiveUiStyle === 'inline') {
      return this.renderInlineCard();
    }

    return this.renderClassicCard();
  }

  private renderClassicCard() {
    const themeClass = `likcc-summaraidGPT-summary--${this.effectiveThemeName}`;
    const logoUrl = resolveLogoUrl(this.logo);
    const content = this.loading ? '正在生成摘要…' : this.displayContent;

    return html`
      <div class="likcc-summaraidGPT-summary-container ${themeClass}" style=${styleMap(this.customThemeStyles)}>
        <div class="likcc-summaraidGPT-summary-header">
          <div class="likcc-summaraidGPT-header-left">
            ${logoUrl
              ? html`<img class="likcc-summaraidGPT-logo not-prose" src=${logoUrl} alt=${this.gptName || 'AI Logo'} width="20" height="20" />`
              : nothing}
            <span class="likcc-summaraidGPT-summary-title">${this.summaryTitle || '文章摘要'}</span>
          </div>
          <span class="likcc-summaraidGPT-gpt-name">${this.gptName || '智阅GPT'}</span>
        </div>
        <div class="likcc-summaraidGPT-summary-content">
          ${this.loading || this.loadFailed
            ? html`<span style="color:#bbb;">${content}</span>`
            : content}
          ${this.typing ? html`<span class="likcc-summaraidGPT-cursor"></span>` : nothing}
        </div>
      </div>
    `;
  }

  private renderInlineCard() {
    const content = this.loading ? '正在生成摘要…' : this.displayContent;
    const title = this.summaryTitle || 'AI 总结';

    return html`
      <div class="likcc-summaraidGPT-inline-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-inline-shell">
          <div class="likcc-summaraidGPT-inline-header">
            ${this.renderSparklesIcon('likcc-summaraidGPT-inline-icon')}
            <span class="likcc-summaraidGPT-inline-title">${title}</span>
          </div>
          <div class="likcc-summaraidGPT-inline-content">
            ${this.loading || this.loadFailed
              ? html`<span style="color:#8892a6;">${content}</span>`
              : content}
            ${this.typing ? html`<span class="likcc-summaraidGPT-cursor"></span>` : nothing}
          </div>
        </div>
      </div>
    `;
  }

  private renderSimpleCard() {
    const content = this.loading ? '正在生成摘要…' : this.displayContent;
    const title = this.summaryTitle || 'AI 总结';

    return html`
      <div class="likcc-summaraidGPT-simple-container ${this.fixedStyleClassName}">
        <div class="likcc-summaraidGPT-simple-shell">
          <div class="likcc-summaraidGPT-simple-header">
            ${this.renderSparklesIcon('likcc-summaraidGPT-simple-icon')}
            <span class="likcc-summaraidGPT-simple-title">${title}</span>
          </div>
          <div class="likcc-summaraidGPT-simple-content">
            ${this.loading || this.loadFailed
              ? html`<span style="color:#8892a6;">${content}</span>`
              : content}
            ${this.typing ? html`<span class="likcc-summaraidGPT-cursor"></span>` : nothing}
          </div>
        </div>
      </div>
    `;
  }

  private renderSparklesIcon(className: string) {
    return html`
      <span class=${className} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.22 3.39a.35.35 0 0 1 .66 0l1.52 4.23a.38.38 0 0 0 .22.22l4.23 1.52a.35.35 0 0 1 0 .66l-4.23 1.52a.38.38 0 0 0-.22.22l-1.52 4.23a.35.35 0 0 1-.66 0l-1.52-4.23a.38.38 0 0 0-.22-.22L4.25 10.02a.35.35 0 0 1 0-.66l4.23-1.52a.38.38 0 0 0 .22-.22l1.52-4.23Z" />
          <path d="M18.38 4.18a.24.24 0 0 1 .45 0l.59 1.66c.02.07.08.13.15.15l1.66.59a.24.24 0 0 1 0 .45l-1.66.59a.25.25 0 0 0-.15.15l-.59 1.66a.24.24 0 0 1-.45 0l-.59-1.66a.25.25 0 0 0-.15-.15l-1.66-.59a.24.24 0 0 1 0-.45l1.66-.59a.24.24 0 0 0 .15-.15l.59-1.66Z" />
        </svg>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'likcc-article-summary': ArticleSummaryWidget;
  }
}
