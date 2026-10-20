import { LitElement, html, nothing, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { articleReadingStyles } from './styles';
import {
  askArticleReading,
  ensureVisitorId,
  fetchExistingArticleReading,
  recordReadingInteraction,
} from './api';
import type { ArticleReadingSpec, InsightGraph, InsightNode } from './types';
import { buildThemeObserver, matchesDarkSelector } from '../article-summary/shared';
import {
  createInsightLayout,
  insightKindLabel,
  insightNodePath,
  type InsightLayout,
} from '../../../shared/insight-graph/layout';
import {
  bindGraphPan,
  clampGraphZoom,
  fitGraphZoom,
  preserveGraphCenter,
  revealGraphNode,
} from '../../../shared/insight-graph/viewport';

const GRAPH_SCHEMA_VERSION = 5;
const READING_POLL_INTERVAL_MS = 3000;
const READING_POLL_MAX_ATTEMPTS = 600;

@customElement('likcc-article-reading')
export class ArticleReadingWidget extends LitElement {
  static styles = articleReadingStyles;

  @property({ type: String, attribute: 'post-name' })
  postName = '';

  @property({ type: String, attribute: 'dark-selector' })
  darkSelector = '';

  @property({ type: Boolean, attribute: 'default-collapsed' })
  defaultCollapsed = false;

  @state()
  private reading?: ArticleReadingSpec;

  @state()
  private loading = true;

  @state()
  private errorMessage = '';

  @state()
  private notGenerated = false;

  @state()
  private activeNodeId = '';

  @state()
  private popoverOpen = false;

  @state()
  private questionOpen = false;

  @state()
  private question = '';

  @state()
  private answer = '';

  @state()
  private asking = false;

  @state()
  private isDark = false;

  @state()
  private isCompactViewport = false;

  @state()
  private viewMode: 'graph' | 'outline' = 'graph';

  @state()
  private zoom = 1;

  private modeTouched = false;
  private manuallyZoomed = false;
  private viewport?: HTMLElement;
  private viewportObserver?: ResizeObserver;
  private unbindPan?: () => void;
  private readingRequest = 0;
  private questionRequest = 0;

  @state()
  private collapsed = false;

  private themeObservers: MutationObserver[] = [];
  private colorSchemeQuery?: MediaQueryList;
  private compactViewportQuery?: MediaQueryList;
  private visitorId = '';
  private collapseTouched = false;
  private initialized = false;
  private pollTimer?: number;
  private pollAttempts = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.visitorId = ensureVisitorId();
    this.refreshThemeMode();
    this.refreshCompactViewport();
    this.bindThemeObservers();
    this.bindEnvironmentObservers();
  }

  protected firstUpdated(): void {
    this.collapsed = this.defaultCollapsed;
    void this.loadReading();
    this.initialized = true;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearPollTimer();
    this.readingRequest++;
    this.questionRequest++;
    this.viewportObserver?.disconnect();
    this.unbindPan?.();
    this.viewport = undefined;
    this.unbindEnvironmentObservers();
    this.unbindThemeObservers();
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('darkSelector')) {
      this.refreshThemeMode();
      this.bindThemeObservers();
    }

    // 读者手动展开或收起后，站点配置的默认折叠不再覆盖读者的选择
    if (changedProperties.has('defaultCollapsed') && !this.collapseTouched) {
      this.collapsed = this.defaultCollapsed;
    }

    if (!this.initialized) {
      return;
    }

    if (changedProperties.has('postName')) {
      this.pollAttempts = 0;
      this.clearPollTimer();
      void this.loadReading();
    }
    this.bindViewport();

    void changedProperties;
  }

  private async loadReading(silent = false): Promise<void> {
    const request = ++this.readingRequest;
    if (!silent) {
      this.manuallyZoomed = false;
      this.reading = undefined;
      this.notGenerated = false;
      this.questionRequest++;
      this.asking = false;
      this.answer = '';
    }
    if (!this.postName) {
      this.loading = false;
      this.errorMessage = '文章名称为空';
      return;
    }

    if (!silent) {
      this.loading = true;
    }
    this.errorMessage = '';
    this.popoverOpen = false;
    this.questionOpen = false;

    try {
      const data = await fetchExistingArticleReading(this.postName);
      if (request !== this.readingRequest) return;
      if (!this.isRenderableReading(data.spec)) {
        this.reading = undefined;
        this.notGenerated = true;
        this.scheduleExistingPoll();
        return;
      }
      this.clearPollTimer();
      this.pollAttempts = 0;
      this.reading = data.spec;
      this.notGenerated = false;
      this.activeNodeId = this.graph.root.id;
    } catch (error) {
      if (request !== this.readingRequest) return;
      console.warn('洞察图谱加载失败:', error);
      const message = error instanceof Error ? error.message : '洞察图谱加载失败';
      if (this.isPendingGenerationError(message)) {
        this.notGenerated = true;
        this.scheduleExistingPoll();
      } else {
        this.notGenerated = false;
        this.errorMessage = message;
      }
    } finally {
      if (request === this.readingRequest) this.loading = false;
    }
  }

  private scheduleExistingPoll(): void {
    this.clearPollTimer();
    if (this.pollAttempts >= READING_POLL_MAX_ATTEMPTS) {
      return;
    }
    this.pollAttempts += 1;
    this.pollTimer = window.setTimeout(() => {
      this.pollTimer = undefined;
      void this.loadReading(true);
    }, READING_POLL_INTERVAL_MS);
  }

  private clearPollTimer(): void {
    if (this.pollTimer) {
      window.clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  private refreshThemeMode(): void {
    this.isDark = matchesDarkSelector(this.darkSelector);
  }

  private refreshCompactViewport(): void {
    this.isCompactViewport = window.matchMedia?.('(max-width: 640px)').matches ?? false;
    if (!this.modeTouched) this.viewMode = this.isCompactViewport ? 'outline' : 'graph';
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

  private bindEnvironmentObservers(): void {
    if (!window.matchMedia) {
      return;
    }
    this.colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.compactViewportQuery = window.matchMedia('(max-width: 640px)');
    this.addMediaListener(this.colorSchemeQuery, this.handleColorSchemeChange);
    this.addMediaListener(this.compactViewportQuery, this.handleCompactViewportChange);
  }

  private unbindEnvironmentObservers(): void {
    if (this.colorSchemeQuery) {
      this.removeMediaListener(this.colorSchemeQuery, this.handleColorSchemeChange);
      this.colorSchemeQuery = undefined;
    }
    if (this.compactViewportQuery) {
      this.removeMediaListener(this.compactViewportQuery, this.handleCompactViewportChange);
      this.compactViewportQuery = undefined;
    }
  }

  private handleColorSchemeChange = (): void => {
    this.refreshThemeMode();
  };

  private handleCompactViewportChange = (): void => {
    this.refreshCompactViewport();
  };

  private addMediaListener(query: MediaQueryList, listener: () => void): void {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', listener);
      return;
    }
    (query as MediaQueryList & { addListener: (listener: () => void) => void }).addListener(
      listener
    );
  }

  private removeMediaListener(query: MediaQueryList, listener: () => void): void {
    if (typeof query.removeEventListener === 'function') {
      query.removeEventListener('change', listener);
      return;
    }
    (query as MediaQueryList & { removeListener: (listener: () => void) => void }).removeListener(
      listener
    );
  }

  private get graph(): InsightGraph {
    const root: InsightNode = this.reading?.root || {
      id: 'root',
      title: this.reading?.postTitle || '文章标题',
      kind: 'root',
      summary: '洞察图谱',
    };
    const nodes = (this.reading?.nodes || []).filter((node) => !this.isLegacyGraphNode(node));
    const visibleIds = new Set([root.id, ...nodes.map((node) => node.id)]);
    return {
      root,
      nodes,
      edges: (this.reading?.edges || []).filter(
        (edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to)
      ),
    };
  }

  private get allNodes(): InsightNode[] {
    return [this.graph.root, ...this.graph.nodes.filter((node) => node.id !== this.graph.root.id)];
  }

  private get activeNode(): InsightNode {
    return this.nodeById(this.activeNodeId) || this.graph.root;
  }

  protected render() {
    const shellClass = this.isDark ? 'reading-shell is-dark' : 'reading-shell';
    if (this.collapsed) {
      return html` <section class=${shellClass}>
        <button
          class="reading-collapsed"
          type="button"
          aria-expanded="false"
          @click=${this.toggleCollapsed}
        >
          <span class="reading-mark">${this.renderInlineIcon('graph')}</span>
          <strong>洞察图谱</strong><span class="collapsed-summary">${this.collapsedSummary()}</span>
          <span class="collapse-mark">${this.renderInlineIcon('plus')}</span>
        </button>
      </section>`;
    }
    return html` <section class=${shellClass} @keydown=${this.handleKeydown}>
      <header class="reading-header">
        <div class="reading-heading">
          <span class="reading-mark">${this.renderInlineIcon('graph')}</span>
          <div><strong>洞察图谱</strong><small>沿着主题，探索文章</small></div>
        </div>
        <button
          class="reading-collapse"
          type="button"
          aria-expanded="true"
          @click=${this.toggleCollapsed}
        >
          收起${this.renderInlineIcon('chevron')}
        </button>
      </header>
      ${this.renderBody()}
    </section>`;
  }

  private toggleCollapsed = (): void => {
    this.collapseTouched = true;
    this.collapsed = !this.collapsed;
    this.popoverOpen = false;
    this.questionOpen = false;
  };

  private collapsedSummary(): string {
    if (this.loading) {
      return '正在读取';
    }
    if (this.notGenerated) {
      return '后台生成中';
    }
    if (this.errorMessage) {
      return '加载失败';
    }
    return this.reading?.postTitle || this.graph.root.title || '点击展开查看';
  }

  private renderBody() {
    if (this.loading) {
      return html`<div class="state-box">正在读取洞察图谱…</div>`;
    }
    if (this.notGenerated) {
      return html`
        <div class="state-box">洞察图谱正在后台生成，完成后会自动刷新显示，无需手动刷新页面。</div>
      `;
    }
    if (this.errorMessage) {
      return html`<div class="state-box">${this.errorMessage}</div>`;
    }
    if (!this.reading) {
      return html`<div class="state-box">暂无洞察图谱</div>`;
    }

    return this.renderGraph();
  }

  private renderGraph() {
    const layout = this.layout;
    const path = this.popoverOpen
      ? insightNodePath(this.activeNodeId, layout.parents)
      : new Set<string>();
    return html` <div class=${`ig-reader ${this.isDark ? 'is-dark' : ''}`}>
      <header class="ig-toolbar">
        <div class="ig-modes" role="group" aria-label="图谱显示方式">
          <button
            type="button"
            aria-pressed=${String(this.viewMode === 'graph')}
            @click=${() => this.setViewMode('graph')}
          >
            ${this.renderInlineIcon('graph')}图谱
          </button>
          <button
            type="button"
            aria-pressed=${String(this.viewMode === 'outline')}
            @click=${() => this.setViewMode('outline')}
          >
            ${this.renderInlineIcon('list')}大纲
          </button>
        </div>
        <div class="ig-toolbar-actions">
          ${this.viewMode === 'graph'
            ? html` <button
                  type="button"
                  class="ig-tool"
                  aria-label="缩小图谱"
                  ?disabled=${this.zoom <= 0.35}
                  @click=${() => this.changeZoom(-0.15)}
                >
                  ${this.renderInlineIcon('minus')}
                </button>
                <span class="ig-zoom-label" aria-live="polite"
                  >${Math.round(this.zoom * 100)}%</span
                >
                <button
                  type="button"
                  class="ig-tool"
                  aria-label="放大图谱"
                  ?disabled=${this.zoom >= 1.6}
                  @click=${() => this.changeZoom(0.15)}
                >
                  ${this.renderInlineIcon('plus')}
                </button>
                <button type="button" class="ig-tool" @click=${this.fitGraph}>适应视图</button
                ><span class="ig-tool-divider"></span>`
            : nothing}
          <button
            type="button"
            class="ig-tool"
            aria-pressed=${String(this.popoverOpen)}
            @click=${this.toggleDetails}
          >
            ${this.renderInlineIcon('panel')}详情
          </button>
        </div>
      </header>
      <div class=${`ig-workspace ${this.popoverOpen ? 'has-detail' : ''}`}>
        ${this.viewMode === 'graph'
          ? html` <div class="ig-viewport" tabindex="0" aria-label="图谱画布，可滚动和缩放">
              <div class="ig-scroll-area">
                <div
                  class="ig-board-frame"
                  style=${`width:${layout.width * this.zoom}px;height:${layout.height * this.zoom}px`}
                >
                  <div
                    class="ig-board"
                    style=${`width:${layout.width}px;height:${layout.height}px;transform:scale(${this.zoom})`}
                  >
                    <svg
                      class="ig-links"
                      width=${layout.width}
                      height=${layout.height}
                      aria-hidden="true"
                    >
                      ${layout.links.map(
                        (link) =>
                          svg`<path class=${`ig-link ${path.has(link.from.node.id) && path.has(link.to.node.id) ? 'is-active' : ''}`} d=${link.path}></path>`
                      )}
                    </svg>
                    ${layout.nodes.map(
                      (view) =>
                        html` <button
                          class=${`ig-node ig-node--${view.level} ${this.popoverOpen && this.activeNodeId === view.node.id ? 'is-active' : ''}`}
                          type="button"
                          data-node-id=${view.node.id}
                          style=${`left:${view.x}px;top:${view.y}px;width:${view.width}px;height:${view.height}px`}
                          title=${view.node.title}
                          aria-label=${view.node.title}
                          aria-pressed=${String(
                            this.popoverOpen && this.activeNodeId === view.node.id
                          )}
                          @click=${() => this.handleNodeClick(view.node)}
                        >
                          ${view.level === 'root'
                            ? html`<span class="ig-node-kicker">文章概览</span>`
                            : html`<span class="ig-node-marker" aria-hidden="true"
                                >${view.level === 'branch'
                                  ? layout.groups.findIndex(
                                      (group) => group.node.id === view.node.id
                                    ) + 1
                                  : ''}</span
                              >`}<span class="ig-node-title">${view.node.title}</span>
                        </button>`
                    )}
                  </div>
                </div>
              </div>
            </div>`
          : this.renderOutline(layout)}
        ${this.popoverOpen ? this.renderPopover() : nothing}
      </div>
      <footer class="ig-footnote">
        <span
          >${layout.groups.filter((group) => group.node.kind === 'tl').length} 个主题 ·
          ${this.graph.nodes.filter((node) => node.kind === 'dl').length} 条延伸阅读</span
        ><span
          >${this.viewMode === 'graph'
            ? '拖动画布浏览，选择节点查看详情'
            : '按主题浏览，选择条目查看详情'}</span
        >
      </footer>
    </div>`;
  }

  private renderOutline(layout: InsightLayout<InsightNode>) {
    const renderNode = (node: InsightNode, summary = false) =>
      html` <button
        class=${`ig-outline-node ${this.popoverOpen && this.activeNodeId === node.id ? 'is-active' : ''}`}
        type="button"
        @click=${() => this.handleNodeClick(node)}
      >
        <strong>${node.title}</strong>${summary && node.summary
          ? html`<small>${node.summary}</small>`
          : nothing}
      </button>`;
    return html`<nav class="ig-outline" aria-label="文章图谱大纲">
      ${renderNode(this.graph.root, true)}${layout.groups.map(
        (group) =>
          html`<div>
            ${renderNode(group.node, true)}${group.children.length
              ? html`<div class="ig-outline-children">
                  ${group.children.map((node) => renderNode(node))}
                </div>`
              : nothing}
          </div>`
      )}
    </nav>`;
  }

  private renderPopover() {
    const node = this.activeNode;
    const items = this.payloadItems(node);
    return html` <aside class="ig-detail" aria-label="节点详情" tabindex="-1">
      <div class="ig-detail-head">
        <span class="ig-detail-kicker">${insightKindLabel(node.kind)}</span
        ><button
          class="ig-tool"
          type="button"
          @click=${this.closePopover}
          aria-label="关闭节点详情"
        >
          ${this.renderInlineIcon('x')}
        </button>
      </div>
      <h3>${node.title}</h3>
      ${node.summary ? html`<p>${node.summary}</p>` : nothing}
      ${!node.summary ? html`<p>${this.branchChildTitles(node).join(' / ')}</p>` : nothing}
      ${node.sourceRange?.anchor
        ? html`<div class="ig-source">
            <small>原文依据</small>
            <blockquote>${node.sourceRange.anchor}</blockquote>
          </div>`
        : nothing}
      ${items.length
        ? html`<ul class="ig-items">
            ${items.map((item) => html`<li>${item}</li>`)}
          </ul>`
        : nothing}
      ${node.kind !== 'root'
        ? html`<div class="ig-detail-actions">
            <button
              type="button"
              ?disabled=${!node.sourceRange?.anchor}
              @click=${() => this.scrollNodeSource(node)}
            >
              ${this.renderInlineIcon('rotate')}跳回原文</button
            ><button type="button" @click=${() => this.openQuestion(node)}>
              ${this.renderInlineIcon('message')}问这一块
            </button>
          </div>`
        : nothing}
      ${this.questionOpen ? this.renderQuestionComposer() : nothing}
    </aside>`;
  }

  private renderQuestionComposer() {
    return html`
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
            ?disabled=${this.asking || !this.question.trim()}
          >
            ${this.asking ? '思考中…' : '提问'}
          </button>
          <button type="button" @click=${() => (this.questionOpen = false)}>收起</button>
        </div>
        ${this.answer ? html`<div class="answer-box">${this.answer}</div>` : nothing}
      </div>
    `;
  }

  private handleNodeClick(node: InsightNode): void {
    this.manuallyZoomed = true;
    this.questionRequest++;
    this.asking = false;
    this.question = '';
    const wasOpen = this.popoverOpen && this.activeNode.id === node.id;
    this.activeNodeId = node.id;
    this.questionOpen = false;
    this.answer = '';
    this.popoverOpen = !wasOpen;
    void this.updateComplete.then(() => {
      if (this.viewport && this.popoverOpen) revealGraphNode(this.viewport, node.id);
      if (this.isCompactViewport && this.popoverOpen) {
        const detail = this.renderRoot.querySelector<HTMLElement>('.ig-detail');
        detail?.focus({ preventScroll: true });
        detail?.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  private toggleDetails = (): void => {
    this.manuallyZoomed = true;
    this.popoverOpen = !this.popoverOpen;
    void this.updateComplete.then(() => {
      if (this.viewport && this.popoverOpen) revealGraphNode(this.viewport, this.activeNodeId);
    });
  };

  private closePopover = (): void => {
    this.popoverOpen = false;
  };

  private openQuestion(node: InsightNode): void {
    this.activeNodeId = node.id;
    this.questionOpen = true;
    this.popoverOpen = true;
    this.answer = '';
    if (!this.question) {
      this.question = '这一块还能怎么理解？';
    }
  }

  private handleQuestionInput(event: Event): void {
    this.question = (event.target as HTMLTextAreaElement).value;
  }

  private async submitQuestion(): Promise<void> {
    if (!this.question.trim() || this.asking) return;
    const request = ++this.questionRequest;
    const node = this.activeNode;
    const question = this.question.trim();
    this.asking = true;
    this.answer = '';
    try {
      const answer = await askArticleReading(question, this.buildNodeContext(node));
      if (request !== this.questionRequest) return;
      this.answer = answer;
      void this.recordInteraction(node.id, 'ask', question);
    } catch (error) {
      if (request === this.questionRequest)
        this.answer = error instanceof Error ? error.message : '提问失败';
    } finally {
      if (request === this.questionRequest) this.asking = false;
    }
  }

  private buildNodeContext(node: InsightNode): string {
    return [
      `文章标题：${this.reading?.postTitle || ''}`,
      `节点标题：${node.title}`,
      `节点类型：${this.kindLabel(node.kind)}`,
      `节点摘要：${node.summary || ''}`,
      `原文依据：${node.sourceRange?.anchor || ''}`,
      `节点补充：${this.payloadItems(node).join('；')}`,
    ].join('\n');
  }

  private async recordInteraction(
    nodeId: string,
    interactionType: string,
    value: string
  ): Promise<void> {
    if (!this.postName) {
      return;
    }
    await recordReadingInteraction({
      postName: this.postName,
      nodeId,
      interactionType,
      value,
      visitorId: this.visitorId,
    });
  }

  private scrollNodeSource(node: InsightNode): void {
    const anchor = node.sourceRange?.anchor;
    if (!anchor) {
      return;
    }
    const element = this.findTextElement(anchor);
    if (element) {
      element.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      });
      this.highlightElement(element);
    }
  }

  private findTextElement(query: string): HTMLElement | null {
    const needle = this.normalizeForSearch(query).slice(0, 48);
    if (!needle || !document.body) {
      return null;
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,noscript,template,likcc-article-reading')) {
          return NodeFilter.FILTER_REJECT;
        }
        const haystack = this.normalizeForSearch(node.textContent || '');
        return haystack.includes(needle) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });

    const node = walker.nextNode();
    return node?.parentElement || null;
  }

  private highlightElement(element: HTMLElement): void {
    const previousOutline = element.style.outline;
    const previousOffset = element.style.outlineOffset;
    const previousScrollMargin = element.style.scrollMarginTop;
    element.style.outline = '2px solid var(--likcc-reading-accent, #0f766e)';
    element.style.outlineOffset = '4px';
    element.style.scrollMarginTop = '96px';
    window.setTimeout(() => {
      element.style.outline = previousOutline;
      element.style.outlineOffset = previousOffset;
      element.style.scrollMarginTop = previousScrollMargin;
    }, 1800);
  }

  private nodeById(id: string): InsightNode | undefined {
    return this.allNodes.find((node) => node.id === id);
  }

  private get layout(): InsightLayout<InsightNode> {
    const graph = this.graph;
    return createInsightLayout(graph.root, graph.nodes, graph.edges);
  }

  private renderInlineIcon(name: string) {
    const paths: Record<string, string> = {
      graph: 'M12 8V4m0 4-6 5m6-5 6 5M6 16v4m12-4v4M9 4h6M3 13h6v3H3Zm12 0h6v3h-6Z',
      list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
      plus: 'M12 5v14M5 12h14',
      minus: 'M5 12h14',
      panel: 'M3 4h18v16H3ZM15 4v16',
      x: 'm6 6 12 12M6 18 18 6',
      rotate: 'M9 10H3V4m0 6 4-4a8 8 0 1 1-2 9',
      message: 'M21 11a8 8 0 0 1-8 8H8l-5 3V5a2 2 0 0 1 2-2h8a8 8 0 0 1 8 8Z',
      chevron: 'm6 9 6 6 6-6',
    };
    return svg`<svg class="reading-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${paths[name] || paths.graph}></path></svg>`;
  }

  private fitGraph = (): void => {
    if (!this.viewport) return;
    this.manuallyZoomed = false;
    const layout = this.layout;
    this.zoom = fitGraphZoom(this.viewport, layout.width, layout.height);
    this.viewport.scrollTo({ left: 0, top: 0 });
  };

  private async changeZoom(delta: number): Promise<void> {
    const previous = this.zoom;
    this.manuallyZoomed = true;
    this.zoom = clampGraphZoom(previous + delta);
    await this.updateComplete;
    if (this.viewport) preserveGraphCenter(this.viewport, previous, this.zoom);
  }

  private setViewMode(mode: 'graph' | 'outline'): void {
    this.modeTouched = true;
    this.viewMode = mode;
  }

  private bindViewport(): void {
    const viewport = this.renderRoot.querySelector<HTMLElement>('.ig-viewport') || undefined;
    if (viewport === this.viewport) return;
    this.viewportObserver?.disconnect();
    this.unbindPan?.();
    this.viewport = viewport;
    if (!viewport) return;
    this.unbindPan = bindGraphPan(viewport);
    this.viewportObserver = new ResizeObserver(() => {
      if (!this.manuallyZoomed) this.fitGraph();
    });
    this.viewportObserver.observe(viewport);
    this.fitGraph();
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    if (this.questionOpen) this.questionOpen = false;
    else this.closePopover();
  };

  private branchChildTitles(node: InsightNode): string[] {
    return (
      this.layout.groups
        .find((group) => group.node.id === node.id)
        ?.children.map((child) => child.title) || []
    );
  }

  private isLegacyGraphNode(node: InsightNode): boolean {
    return (
      (node.kind as string) === 'overview' ||
      (node.kind as string) === 'action' ||
      node.id === 'overview-30s' ||
      node.id === 'overview-conclusion' ||
      node.id === 'overview-keypoints' ||
      node.id === 'tl-group' ||
      node.id === 'dl-group' ||
      node.id === 'action-group' ||
      node.id.startsWith('action-') ||
      [
        '30秒概览',
        '一句话结论',
        '3个关键点',
        'TL分块',
        'DL深挖',
        '用户互动',
        '跳回原文',
        '问这一块',
        '收藏节点',
        '点赞反馈',
      ].includes(node.title)
    );
  }

  private payloadItems(node: InsightNode): string[] {
    const items = node.payload?.items;
    if (!Array.isArray(items)) {
      return [];
    }
    return items
      .map((item) => String(item))
      .filter(Boolean)
      .slice(0, 6);
  }

  private kindLabel(kind: string): string {
    return insightKindLabel(kind);
  }

  private normalizeForSearch(value: string): string {
    return value.replace(/\s+/g, '').toLowerCase();
  }

  private isRenderableReading(spec?: ArticleReadingSpec): boolean {
    if (!spec?.root || !Array.isArray(spec.nodes) || !Array.isArray(spec.edges)) {
      return false;
    }
    if ((spec.schemaVersion || 0) < GRAPH_SCHEMA_VERSION) {
      return false;
    }
    const tlIds = new Set(
      spec.nodes.filter((node) => node.kind === 'tl' && Boolean(node.id)).map((node) => node.id)
    );
    const dlIds = new Set(
      spec.nodes.filter((node) => node.kind === 'dl' && Boolean(node.id)).map((node) => node.id)
    );
    if (tlIds.size < 3 || dlIds.size === 0) {
      return false;
    }
    const rootId = spec.root.id || 'root';
    const rootTargets = new Set(
      spec.edges.filter((edge) => edge.from === rootId).map((edge) => edge.to)
    );
    return Array.from(tlIds).every((id) => rootTargets.has(id));
  }

  private isPendingGenerationError(message: string): boolean {
    return ['尚未生成', '不存在', '需要重建', 'HTTP 404'].some((keyword) =>
      message.includes(keyword)
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'likcc-article-reading': ArticleReadingWidget;
  }
}
