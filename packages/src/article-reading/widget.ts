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
import { renderIconifyIcon } from '../rag-assistant/iconify';

interface GraphNodeView {
  node: InsightNode;
  x: number;
  y: number;
  level: 'root' | 'branch' | 'leaf';
  tone: GraphTone;
}

interface GraphLinkView {
  from: GraphNodeView;
  to: GraphNodeView;
  tone: GraphTone;
  level: 'branch' | 'leaf';
}

type GraphTone = 'neutral' | 'conclusion' | 'background' | 'core' | 'argument';

interface GraphLayoutMetrics {
  branchRadiusX: number;
  branchRadiusY: number;
  childOffsetX: number;
  childOffsetY: number;
  childSpreadX: number;
  childSpreadY: number;
  orphanLeafRadiusX: number;
  orphanLeafRadiusY: number;
}

const GRAPH_SCHEMA_VERSION = 5;
const READING_POLL_INTERVAL_MS = 3000;
const READING_POLL_MAX_ATTEMPTS = 600;
const GRAPH_TONES: GraphTone[] = ['conclusion', 'background', 'core', 'argument'];

@customElement('likcc-article-reading')
export class ArticleReadingWidget extends LitElement {
  static styles = articleReadingStyles;

  @property({ type: String, attribute: 'post-name' })
  postName = '';

  @property({ type: String, attribute: 'dark-selector' })
  darkSelector = '';

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
  private collapsed = false;

  private themeObservers: MutationObserver[] = [];
  private colorSchemeQuery?: MediaQueryList;
  private compactViewportQuery?: MediaQueryList;
  private visitorId = '';
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
    void this.loadReading();
    this.initialized = true;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearPollTimer();
    this.unbindEnvironmentObservers();
    this.unbindThemeObservers();
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('darkSelector')) {
      this.refreshThemeMode();
      this.bindThemeObservers();
    }

    if (!this.initialized) {
      return;
    }

    if (changedProperties.has('postName')) {
      void this.loadReading();
    }

    void changedProperties;
  }

  private async loadReading(silent = false): Promise<void> {
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
      console.warn('洞察图谱加载失败:', error);
      const message = error instanceof Error ? error.message : '洞察图谱加载失败';
      if (this.isPendingGenerationError(message)) {
        this.notGenerated = true;
        this.scheduleExistingPoll();
      } else {
        this.errorMessage = message;
      }
    } finally {
      this.loading = false;
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
    this.isCompactViewport = window.matchMedia?.('(max-width: 760px)').matches ?? false;
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
    this.compactViewportQuery = window.matchMedia('(max-width: 760px)');
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
    (query as MediaQueryList & { addListener: (listener: () => void) => void })
      .addListener(listener);
  }

  private removeMediaListener(query: MediaQueryList, listener: () => void): void {
    if (typeof query.removeEventListener === 'function') {
      query.removeEventListener('change', listener);
      return;
    }
    (query as MediaQueryList & { removeListener: (listener: () => void) => void })
      .removeListener(listener);
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
        (edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to),
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
      return html`
        <section class=${shellClass}>
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
      `;
    }

    return html`
      <section class=${shellClass}>
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
    `;
  }

  private toggleCollapsed = (): void => {
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
        <div class="state-box">
          洞察图谱正在后台生成，完成后会自动刷新显示，无需手动刷新页面。
        </div>
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
    const nodes = this.graphNodeViews();
    const links = this.graphLinkViews(nodes);
    return html`
      <div class="insight-graph">
        <div class="graph-canvas">
          <div class="graph-board">
            <svg class="graph-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${links.map((link) => svg`
                <path
                  class=${`graph-link graph-link--${link.level} graph-link--${link.tone}`}
                  d=${this.linkPath(link)}
                ></path>
                <circle
                  class=${`graph-dot graph-dot--${link.level} graph-dot--${link.tone}`}
                  cx=${link.to.x}
                  cy=${link.to.y}
                  r="0.72"
                ></circle>
              `)}
            </svg>
            ${nodes.map((view) => html`
              <button
                class=${this.nodeClass(view)}
                type="button"
                style=${`left:${view.x}%;top:${view.y}%`}
                @click=${() => this.handleNodeClick(view.node)}
                aria-label=${view.node.title}
                title=${view.node.title}
              >
                <span class="node-icon" aria-hidden="true">${this.renderNodeIcon(view)}</span>
                <span class="node-title">${this.nodeDisplayTitle(view)}</span>
              </button>
            `)}
          </div>
          ${this.popoverOpen ? this.renderPopover() : nothing}
        </div>
      </div>
    `;
  }

  private renderPopover() {
    const node = this.activeNode;
    const payloadItems = this.payloadItems(node);
    return html`
      <aside class=${`node-popover node-popover--${this.toneForNode(node.id)}`}>
        <div class="popover-head">
          <button class="icon-button" type="button" @click=${this.closePopover} aria-label="关闭详情">
            ${this.renderInlineIcon('x')}
          </button>
        </div>
        <h3>${node.title}</h3>
        ${node.summary ? html`<p>${node.summary}</p>` : nothing}
        ${!node.summary && this.isBranchNode(node.id) ? html`
          <p>${this.branchChildTitles(node).join(' / ')}</p>
        ` : nothing}
        ${node.sourceRange?.anchor ? html`
          <button class="source-anchor" type="button" @click=${() => this.scrollNodeSource(node)}>
            ${node.sourceRange.anchor}
          </button>
        ` : nothing}
        ${payloadItems.length > 0 ? html`
          <ul class="payload-list">
            ${payloadItems.map((item) => html`<li>${item}</li>`)}
          </ul>
        ` : nothing}
        ${node.kind !== 'root' ? html`
          <div class="popover-actions">
            <button
              type="button"
              ?disabled=${!node.sourceRange?.anchor}
              @click=${() => this.scrollNodeSource(node)}
            >
              ${this.renderInlineIcon('rotate')}<span>跳回原文</span>
            </button>
            <button type="button" @click=${() => this.openQuestion(node)}>
              ${this.renderInlineIcon('message')}<span>问这一块</span>
            </button>
          </div>
        ` : nothing}
        ${this.questionOpen ? this.renderQuestionComposer() : nothing}
      </aside>
    `;
  }

  private renderQuestionComposer() {
    return html`
      <div class="question-composer">
        <textarea
          class="question-input"
          .value=${this.question}
          placeholder="输入关于当前节点的问题"
          @input=${this.handleQuestionInput}
        ></textarea>
        <div class="question-actions">
          <button class="primary-action" type="button" @click=${this.submitQuestion} ?disabled=${this.asking}>
            ${this.asking ? '思考中…' : '提问'}
          </button>
          <button type="button" @click=${() => (this.questionOpen = false)}>收起</button>
        </div>
        ${this.answer ? html`<div class="answer-box">${this.answer}</div>` : nothing}
      </div>
    `;
  }

  private handleNodeClick(node: InsightNode): void {
    const wasOpen = this.popoverOpen && this.activeNode.id === node.id;
    this.activeNodeId = node.id;
    this.questionOpen = false;
    this.answer = '';
    this.popoverOpen = !wasOpen;
  }

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
    if (!this.question.trim()) {
      return;
    }
    this.asking = true;
    this.answer = '';
    try {
      this.answer = await askArticleReading(this.question.trim(), this.buildNodeContext(this.activeNode));
      void this.recordInteraction(this.activeNode.id, 'ask', this.question.trim());
    } catch (error) {
      this.answer = error instanceof Error ? error.message : '提问失败';
    } finally {
      this.asking = false;
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

  private async recordInteraction(nodeId: string, interactionType: string, value: string): Promise<void> {
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
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightElement(element);
    }
  }

  private findTextElement(query: string): HTMLElement | null {
    const needle = this.normalizeForSearch(query).slice(0, 48);
    if (!needle || !document.body) {
      return null;
    }

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent || parent.closest('script,style,noscript,template,likcc-article-reading')) {
            return NodeFilter.FILTER_REJECT;
          }
          const haystack = this.normalizeForSearch(node.textContent || '');
          return haystack.includes(needle)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        },
      },
    );

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

  private graphNodeViews(): GraphNodeView[] {
    const views = new Map<string, GraphNodeView>();
    this.addGraphView(views, this.graph.root, 50, 50, 'root', 'neutral');

    const tlNodes = this.graph.nodes.filter((node) => node.kind === 'tl');
    const parentMap = this.nodeParentMap();
    const toneMap = this.nodeToneMap();
    const branchCount = Math.max(1, tlNodes.length);
    const layout = this.graphLayoutMetrics(branchCount);

    tlNodes.forEach((node, index) => {
      const angle = this.branchAngle(index, branchCount);
      const branchX = this.clampPosition(50 + Math.cos(angle) * layout.branchRadiusX);
      const branchY = this.clampPosition(50 + Math.sin(angle) * layout.branchRadiusY);
      this.addGraphView(
        views,
        node,
        branchX,
        branchY,
        'branch',
        toneMap.get(node.id) || this.keywordTone(node.title),
      );

      const children = this.graphChildNodes(node.id).filter((child) => child.kind === 'dl');
      const childCount = Math.max(1, children.length);
      children.forEach((child, childIndex) => {
        const childPosition = this.childNodePosition(branchX, branchY, angle, childIndex, childCount, layout);
        this.addGraphView(
          views,
          child,
          childPosition.x,
          childPosition.y,
          'leaf',
          toneMap.get(child.id) || toneMap.get(node.id) || this.keywordTone(child.title),
        );
      });
    });

    const orphanNodes = this.graph.nodes.filter((node) => !views.has(node.id));
    orphanNodes.forEach((node, index) => {
      const angle = this.branchAngle(index, Math.max(1, orphanNodes.length));
      const hasParent = Boolean(parentMap.get(node.id));
      const radiusX = hasParent || node.kind === 'dl' ? layout.orphanLeafRadiusX : layout.branchRadiusX;
      const radiusY = hasParent || node.kind === 'dl' ? layout.orphanLeafRadiusY : layout.branchRadiusY;
      this.addGraphView(
        views,
        node,
        this.clampPosition(50 + Math.cos(angle) * radiusX),
        this.clampPosition(50 + Math.sin(angle) * radiusY),
        node.kind === 'tl' ? 'branch' : 'leaf',
        toneMap.get(node.id) || this.keywordTone(node.title),
      );
    });

    return Array.from(views.values());
  }

  private graphLayoutMetrics(branchCount: number): GraphLayoutMetrics {
    const dense = branchCount > 4;
    if (this.isCompactViewport) {
      const branchRadiusX = dense ? 27 : 25;
      const branchRadiusY = dense ? 30 : 28;
      const childOffsetX = dense ? 17 : 18;
      const childOffsetY = dense ? 13 : 14;
      return {
        branchRadiusX,
        branchRadiusY,
        childOffsetX,
        childOffsetY,
        childSpreadX: dense ? 16 : 17,
        childSpreadY: dense ? 8.2 : 8.8,
        orphanLeafRadiusX: branchRadiusX + childOffsetX,
        orphanLeafRadiusY: branchRadiusY + childOffsetY,
      };
    }

    const branchRadiusX = dense ? 25 : 23;
    const branchRadiusY = dense ? 24 : 22;
    const childOffsetX = dense ? 18.5 : 20.5;
    const childOffsetY = dense ? 12 : 13.5;
    return {
      branchRadiusX,
      branchRadiusY,
      childOffsetX,
      childOffsetY,
      childSpreadX: dense ? 16.5 : 17.5,
      childSpreadY: dense ? 7.2 : 7.8,
      orphanLeafRadiusX: branchRadiusX + childOffsetX,
      orphanLeafRadiusY: branchRadiusY + childOffsetY,
    };
  }

  private childNodePosition(
    parentX: number,
    parentY: number,
    angle: number,
    childIndex: number,
    childCount: number,
    layout: GraphLayoutMetrics,
  ): { x: number; y: number } {
    const centeredIndex = childIndex - (childCount - 1) / 2;
    const shiftX = childCount === 1 ? 0 : centeredIndex * layout.childSpreadX;
    const shiftY = childCount === 1 ? 0 : centeredIndex * layout.childSpreadY;
    const side = this.branchSide(angle);

    if (side === 'top' || side === 'bottom') {
      const direction = side === 'top' ? -1 : 1;
      return {
        x: this.clampPosition(parentX + shiftX),
        y: this.clampPosition(parentY + direction * layout.childOffsetY),
      };
    }

    const direction = side === 'left' ? -1 : 1;
    const verticalDirection = Math.sin(angle);
    const sideShiftY = Math.abs(verticalDirection) > 0.22
      ? (verticalDirection < 0 ? -1 : 1) * childIndex * layout.childSpreadY
      : shiftY;
    return {
      x: this.clampPosition(
        parentX + direction * layout.childOffsetX,
      ),
      y: this.clampPosition(
        parentY + sideShiftY,
      ),
    };
  }

  private branchSide(angle: number): 'top' | 'right' | 'bottom' | 'left' {
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    if (y < -0.86) {
      return 'top';
    }
    if (y > 0.86) {
      return 'bottom';
    }
    return x < 0 ? 'left' : 'right';
  }

  private addGraphView(
    views: Map<string, GraphNodeView>,
    node: InsightNode,
    x: number,
    y: number,
    level: GraphNodeView['level'],
    tone: GraphTone,
  ): void {
    views.set(node.id, { node, x, y, level, tone });
  }

  private graphLinkViews(nodes: GraphNodeView[]): GraphLinkView[] {
    const viewById = new Map(nodes.map((view) => [view.node.id, view]));
    const edgeLinks = this.graph.edges.map((edge) => this.linkView(viewById, edge.from, edge.to));
    const inferredLinks = this.inferredGraphEdges().map((edge) =>
      this.linkView(viewById, edge.from, edge.to),
    );

    const seen = new Set<string>();
    return [...edgeLinks, ...inferredLinks]
      .filter((link): link is GraphLinkView => Boolean(link))
      .filter((link) => {
        const key = `${link.from.node.id}->${link.to.node.id}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .sort((a, b) => (a.level === b.level ? 0 : a.level === 'branch' ? -1 : 1));
  }

  private linkView(
    viewById: Map<string, GraphNodeView>,
    fromId: string,
    toId: string,
    tone?: GraphTone,
  ): GraphLinkView | undefined {
    const from = viewById.get(fromId);
    const to = viewById.get(toId);
    if (!from || !to) {
      return undefined;
    }
    return {
      from,
      to,
      tone: tone || to.tone || from.tone,
      level: from.level === 'branch' && to.level === 'leaf' ? 'leaf' : 'branch',
    };
  }

  private linkPath(link: GraphLinkView): string {
    const dx = link.to.x - link.from.x;
    const dy = link.to.y - link.from.y;
    const bend = link.level === 'leaf' ? 0.08 : 0.14;
    const normalX = -dy * bend;
    const normalY = dx * bend;
    return `M ${link.from.x} ${link.from.y} C ${link.from.x + dx * 0.42 + normalX} ${link.from.y + dy * 0.42 + normalY}, ${link.from.x + dx * 0.58 + normalX} ${link.from.y + dy * 0.58 + normalY}, ${link.to.x} ${link.to.y}`;
  }

  private nodeClass(view: GraphNodeView): string {
    return [
      'graph-node',
      `graph-node--${view.level}`,
      `graph-node--${view.node.kind}`,
      `graph-node--tone-${view.tone}`,
      this.activeNodeId === view.node.id && this.popoverOpen ? 'is-active' : '',
    ].filter(Boolean).join(' ');
  }

  private nodeDisplayTitle(view: GraphNodeView): string {
    const title = this.normalizeTitle(view.node.title);
    const limit = this.nodeTitleLimit(view.level);
    if (!title) {
      return '未命名节点';
    }

    const colonTitle = title.split(/[：:]/)[0]?.trim();
    if (colonTitle && colonTitle.length >= 2 && this.visualLength(colonTitle) <= limit) {
      return colonTitle;
    }

    const sentenceTitle = title.split(/[，,。；;、|｜/（(]/)[0]?.trim();
    if (sentenceTitle && sentenceTitle.length >= 2 && this.visualLength(sentenceTitle) <= limit) {
      return sentenceTitle;
    }

    return this.truncateTitle(title, limit);
  }

  private nodeTitleLimit(level: GraphNodeView['level']): number {
    if (level === 'root') {
      return this.isCompactViewport ? 16 : 22;
    }
    if (level === 'branch') {
      return this.isCompactViewport ? 8 : 10;
    }
    return this.isCompactViewport ? 7 : 9;
  }

  private normalizeTitle(title: string): string {
    return title.replace(/\s+/g, ' ').trim();
  }

  private truncateTitle(title: string, limit: number): string {
    const chars = Array.from(title);
    let width = 0;
    let result = '';
    for (const char of chars) {
      const charWidth = this.visualLength(char);
      if (width + charWidth > limit) {
        return `${result.trim()}…`;
      }
      result += char;
      width += charWidth;
    }
    return result.trim();
  }

  private visualLength(value: string): number {
    return Array.from(value).reduce((length, char) => {
      return length + (/[\u3400-\u9fff\uff00-\uffef]/.test(char) ? 1 : 0.55);
    }, 0);
  }

  private toneForNode(nodeId: string): GraphTone {
    const node = this.nodeById(nodeId);
    return this.nodeToneMap().get(nodeId) || this.keywordTone(node?.title || nodeId);
  }

  private renderNodeIcon(view: GraphNodeView) {
    if (view.level === 'root') {
      return this.renderInlineIcon('brain');
    }
    return this.renderInlineIcon(this.iconNameForNode(view.node, view.level));
  }

  private branchAngle(index: number, total: number): number {
    if (total === 1) {
      return 0;
    }
    if (total === 2) {
      return index === 0 ? Math.PI : 0;
    }
    return (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;
  }

  private clampPosition(value: number): number {
    const min = this.isCompactViewport ? 11 : 8;
    const max = this.isCompactViewport ? 89 : 92;
    return Math.min(max, Math.max(min, value));
  }

  private nodeParentMap(): Map<string, string> {
    const nodeIds = new Set(this.allNodes.map((node) => node.id));
    const parentMap = new Map<string, string>();
    this.graph.edges.forEach((edge) => {
      if (nodeIds.has(edge.from) && nodeIds.has(edge.to) && !parentMap.has(edge.to)) {
        parentMap.set(edge.to, edge.from);
      }
    });
    return parentMap;
  }

  private nodeToneMap(): Map<string, GraphTone> {
    const tones = new Map<string, GraphTone>();
    const tlNodes = this.graph.nodes.filter((node) => node.kind === 'tl');
    tlNodes.forEach((node, index) => {
      const tone = this.keywordTone(node.title, GRAPH_TONES[index % GRAPH_TONES.length]);
      tones.set(node.id, tone);
      this.graphChildNodes(node.id).forEach((child) => tones.set(child.id, tone));
    });
    return tones;
  }

  private inferredGraphEdges(): Array<{ from: string; to: string }> {
    const rootId = this.graph.root.id;
    const existing = new Set(this.graph.edges.map((edge) => `${edge.from}->${edge.to}`));
    const inferred: Array<{ from: string; to: string }> = [];
    const tlNodes = this.graph.nodes.filter((node) => node.kind === 'tl');
    tlNodes.forEach((node) => {
      const key = `${rootId}->${node.id}`;
      if (!existing.has(key)) {
        inferred.push({ from: rootId, to: node.id });
      }
    });

    const tlByIndex = new Map<string, string>();
    tlNodes.forEach((node, index) => {
      tlByIndex.set(String(index + 1), node.id);
    });
    this.graph.nodes
      .filter((node) => node.kind === 'dl')
      .forEach((node) => {
        const hasParent = this.graph.edges.some((edge) => edge.to === node.id);
        if (hasParent) {
          return;
        }
        const match = node.id.match(/^dl-(\d+)-/);
        const parentId = match ? tlByIndex.get(match[1]) : undefined;
        if (parentId) {
          inferred.push({ from: parentId, to: node.id });
        }
      });
    return inferred;
  }

  private keywordTone(value: string, fallback: GraphTone = 'neutral'): GraphTone {
    const text = value.toLowerCase();
    if (
      /结论|建议|行动|清单|追问|conclusion|advice|action|question|follow/.test(text)
    ) {
      return 'conclusion';
    }
    if (/背景|来源|上下文|时间|历程|开篇|background|source|timeline/.test(text)) {
      return 'background';
    }
    if (/核心|观点|判断|概念|术语|解释|人物|产品|core|concept|term|people|product/.test(text)) {
      return 'core';
    }
    if (/论据|证据|事实|数据|案例|风险|问题|argument|evidence|data|case|risk/.test(text)) {
      return 'argument';
    }
    return fallback;
  }

  private iconNameForNode(node: InsightNode, level: GraphNodeView['level']): string {
    const text = `${node.title} ${node.id}`.toLowerCase();
    if (/背景|来源|上下文|开篇|background|source/.test(text)) return 'book';
    if (/时间|历程|阶段|timeline|history|stage/.test(text)) return 'timeline';
    if (/核心|观点|判断|主张|core|claim|judgment/.test(text)) return 'star';
    if (/证据|依据|事实|数据|evidence|data|fact/.test(text)) return 'database';
    if (/案例|故事|实践|case|story|practice/.test(text)) return 'file';
    if (/步骤|流程|方法|教程|step|process|method|guide/.test(text)) return 'route';
    if (/风险|问题|争议|risk|problem|issue/.test(text)) return 'alert';
    if (/概念|术语|解释|term|concept|explain/.test(text)) return 'search';
    if (/人物|角色|作者|user|people|person|role/.test(text)) return 'user';
    if (/产品|工具|模型|product|tool|model/.test(text)) return 'box';
    if (/行动|建议|清单|todo|action|advice|list/.test(text)) return 'check';
    if (/追问|问题|question|follow/.test(text)) return 'help';
    if (/结论|总结|收束|conclusion|summary/.test(text)) return 'flag';
    return level === 'branch' ? 'flag' : 'message';
  }

  private renderInlineIcon(name: string) {
    const icons: Record<string, string> = {
      brain: 'ri:brain-line',
      flag: 'ri:flag-line',
      message: 'ri:message-3-line',
      help: 'ri:question-line',
      book: 'ri:book-open-line',
      target: 'ri:focus-3-line',
      monitor: 'ri:line-chart-line',
      star: 'ri:star-smile-line',
      search: 'ri:search-line',
      user: 'ri:user-3-line',
      bar: 'ri:bar-chart-line',
      database: 'ri:database-2-line',
      file: 'ri:file-text-line',
      route: 'ri:route-line',
      timeline: 'ri:time-line',
      alert: 'ri:error-warning-line',
      box: 'ri:box-3-line',
      check: 'ri:check-line',
      rotate: 'ri:arrow-go-back-line',
      x: 'ri:close-line',
    };
    return renderIconifyIcon(icons[name] || 'ri:circle-line');
  }

  private graphChildNodes(parentId: string): InsightNode[] {
    const nodeById = new Map(this.allNodes.map((node) => [node.id, node]));
    const seen = new Set<string>();
    return this.graph.edges
      .filter((edge) => edge.from === parentId)
      .map((edge) => nodeById.get(edge.to))
      .filter((node): node is InsightNode => {
        if (!node || seen.has(node.id)) {
          return false;
        }
        seen.add(node.id);
        return true;
      });
  }

  private isBranchNode(nodeId: string): boolean {
    return this.graphChildNodes(nodeId).length > 0;
  }

  private isLegacyGraphNode(node: InsightNode): boolean {
    return (node.kind as string) === 'overview'
      || (node.kind as string) === 'action'
      || node.id === 'overview-30s'
      || node.id === 'overview-conclusion'
      || node.id === 'overview-keypoints'
      || node.id === 'tl-group'
      || node.id === 'dl-group'
      || node.id === 'action-group'
      || node.id.startsWith('action-')
      || [
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
      ].includes(node.title);
  }

  private branchChildTitles(node: InsightNode): string[] {
    return this.graphChildNodes(node.id).map((child) => child.title);
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
    return switchKind(kind);
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
      spec.nodes
        .filter((node) => node.kind === 'tl' && Boolean(node.id))
        .map((node) => node.id),
    );
    const dlIds = new Set(
      spec.nodes
        .filter((node) => node.kind === 'dl' && Boolean(node.id))
        .map((node) => node.id),
    );
    if (tlIds.size < 3 || dlIds.size === 0) {
      return false;
    }
    const rootId = spec.root.id || 'root';
    const rootTargets = new Set(
      spec.edges.filter((edge) => edge.from === rootId).map((edge) => edge.to),
    );
    return Array.from(tlIds).every((id) => rootTargets.has(id));
  }

  private isPendingGenerationError(message: string): boolean {
    return ['尚未生成', '不存在', '需要重建', 'HTTP 404'].some((keyword) =>
      message.includes(keyword),
    );
  }
}

function switchKind(kind: string): string {
  switch (kind) {
    case 'root':
      return '文章';
    case 'tl':
      return 'TL';
    case 'dl':
      return 'DL';
    default:
      return kind;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'likcc-article-reading': ArticleReadingWidget;
  }
}
