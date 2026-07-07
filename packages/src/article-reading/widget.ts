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
}

type GraphTone = 'neutral' | 'conclusion' | 'background' | 'core' | 'argument';

const GRAPH_SCHEMA_VERSION = 4;
const READING_POLL_INTERVAL_MS = 3000;
const READING_POLL_MAX_ATTEMPTS = 600;
const REQUIRED_GRAPH_NODE_IDS = [
  'tl-background',
  'dl-problem-source',
  'dl-current-status',
  'tl-core',
  'dl-key-judgment',
  'dl-author-claim',
  'tl-argument',
  'dl-data-fact',
  'dl-case',
  'tl-conclusion',
  'dl-advice',
  'dl-follow-up',
];

const VISUAL_GRAPH_LINKS = [
  ['root', 'tl-conclusion', 'conclusion'],
  ['tl-conclusion', 'dl-advice', 'conclusion'],
  ['tl-conclusion', 'dl-follow-up', 'conclusion'],
  ['root', 'tl-background', 'background'],
  ['tl-background', 'dl-problem-source', 'background'],
  ['tl-background', 'dl-current-status', 'background'],
  ['root', 'tl-core', 'core'],
  ['tl-core', 'dl-key-judgment', 'core'],
  ['tl-core', 'dl-author-claim', 'core'],
  ['root', 'tl-argument', 'argument'],
  ['tl-argument', 'dl-data-fact', 'argument'],
  ['tl-argument', 'dl-case', 'argument'],
] as const;

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
  private collapsed = false;

  private themeObservers: MutationObserver[] = [];
  private visitorId = '';
  private initialized = false;
  private pollTimer?: number;
  private pollAttempts = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.visitorId = ensureVisitorId();
    this.refreshThemeMode();
    this.bindThemeObservers();
  }

  protected firstUpdated(): void {
    void this.loadReading();
    this.initialized = true;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearPollTimer();
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

    return html`
      <section class=${shellClass}>
        <button
          class="reading-collapse"
          type="button"
          aria-expanded=${String(!this.collapsed)}
          @click=${this.toggleCollapsed}
        >
          <span>${this.collapsed ? '展开洞察图谱' : '收起洞察图谱'}</span>
          <span class="collapse-mark" aria-hidden="true">${this.collapsed ? '+' : '-'}</span>
        </button>
        ${this.collapsed ? nothing : this.renderBody()}
      </section>
    `;
  }

  private toggleCollapsed = (): void => {
    this.collapsed = !this.collapsed;
    this.popoverOpen = false;
    this.questionOpen = false;
  };

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
                  class=${`graph-link graph-link--${link.tone}`}
                  d=${this.linkPath(link)}
                ></path>
                <circle
                  class=${`graph-dot graph-dot--${link.tone}`}
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
              >
                <span class="node-icon" aria-hidden="true">${this.renderNodeIcon(view)}</span>
                <span class="node-title">${view.node.title}</span>
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

    const fixedPositions: Record<string, Omit<GraphNodeView, 'node'>> = {
      'tl-conclusion': { x: 50, y: 27, level: 'branch', tone: 'conclusion' },
      'dl-advice': { x: 38, y: 15, level: 'leaf', tone: 'conclusion' },
      'dl-follow-up': { x: 62, y: 15, level: 'leaf', tone: 'conclusion' },
      'tl-background': { x: 69, y: 50, level: 'branch', tone: 'background' },
      'dl-problem-source': { x: 84, y: 37, level: 'leaf', tone: 'background' },
      'dl-current-status': { x: 84, y: 63, level: 'leaf', tone: 'background' },
      'tl-core': { x: 50, y: 74, level: 'branch', tone: 'core' },
      'dl-key-judgment': { x: 39, y: 87, level: 'leaf', tone: 'core' },
      'dl-author-claim': { x: 61, y: 87, level: 'leaf', tone: 'core' },
      'tl-argument': { x: 31, y: 50, level: 'branch', tone: 'argument' },
      'dl-data-fact': { x: 16, y: 37, level: 'leaf', tone: 'argument' },
      'dl-case': { x: 16, y: 63, level: 'leaf', tone: 'argument' },
    };

    Object.entries(fixedPositions).forEach(([nodeId, position]) => {
      const node = this.nodeById(nodeId);
      if (node) {
        this.addGraphView(views, node, position.x, position.y, position.level, position.tone);
      }
    });

    const unknownNodes = this.graph.nodes.filter((node) => !views.has(node.id));
    unknownNodes.forEach((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(1, unknownNodes.length) - Math.PI / 2;
      const radius = this.isBranchNode(node.id) ? 28 : 38;
      this.addGraphView(
        views,
        node,
        50 + Math.cos(angle) * radius,
        50 + Math.sin(angle) * radius,
        this.isBranchNode(node.id) ? 'branch' : 'leaf',
        this.toneForNode(node.id),
      );
    });

    return Array.from(views.values());
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
    const fixedLinks = VISUAL_GRAPH_LINKS.map(([fromId, toId, tone]) => this.linkView(viewById, fromId, toId, tone));
    const edgeLinks = this.graph.edges.map((edge) => this.linkView(viewById, edge.from, edge.to));

    const seen = new Set<string>();
    return [...fixedLinks, ...edgeLinks]
      .filter((link): link is GraphLinkView => Boolean(link))
      .filter((link) => {
        const key = `${link.from.node.id}->${link.to.node.id}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  private linkView(
    viewById: Map<string, GraphNodeView>,
    fromId: string,
    toId: string,
    tone?: GraphTone,
  ): GraphLinkView | undefined {
    const from = viewById.get(fromId);
    const to = viewById.get(toId);
    return from && to ? { from, to, tone: tone || to.tone || from.tone } : undefined;
  }

  private linkPath(link: GraphLinkView): string {
    const dx = link.to.x - link.from.x;
    const dy = link.to.y - link.from.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return `M ${link.from.x} ${link.from.y} C ${link.from.x + dx * 0.44} ${link.from.y}, ${link.from.x + dx * 0.56} ${link.to.y}, ${link.to.x} ${link.to.y}`;
    }
    return `M ${link.from.x} ${link.from.y} C ${link.from.x} ${link.from.y + dy * 0.44}, ${link.to.x} ${link.from.y + dy * 0.56}, ${link.to.x} ${link.to.y}`;
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

  private toneForNode(nodeId: string): GraphTone {
    if (nodeId.includes('conclusion') || nodeId.includes('advice') || nodeId.includes('follow')) {
      return 'conclusion';
    }
    if (nodeId.includes('background') || nodeId.includes('problem') || nodeId.includes('status')) {
      return 'background';
    }
    if (nodeId.includes('core') || nodeId.includes('judgment') || nodeId.includes('claim')) {
      return 'core';
    }
    if (nodeId.includes('argument') || nodeId.includes('data') || nodeId.includes('case')) {
      return 'argument';
    }
    return 'neutral';
  }

  private renderNodeIcon(view: GraphNodeView) {
    if (view.level === 'root') {
      return this.renderInlineIcon('brain');
    }
    switch (view.node.id) {
      case 'tl-conclusion':
        return this.renderInlineIcon('flag');
      case 'dl-advice':
        return this.renderInlineIcon('message');
      case 'dl-follow-up':
        return this.renderInlineIcon('help');
      case 'tl-background':
        return this.renderInlineIcon('book');
      case 'dl-problem-source':
        return this.renderInlineIcon('target');
      case 'dl-current-status':
        return this.renderInlineIcon('monitor');
      case 'tl-core':
        return this.renderInlineIcon('star');
      case 'dl-key-judgment':
        return this.renderInlineIcon('search');
      case 'dl-author-claim':
        return this.renderInlineIcon('user');
      case 'tl-argument':
        return this.renderInlineIcon('bar');
      case 'dl-data-fact':
        return this.renderInlineIcon('database');
      case 'dl-case':
        return this.renderInlineIcon('file');
      default:
        return this.renderInlineIcon(view.node.kind === 'tl' ? 'flag' : 'message');
    }
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
    const nodeIds = new Set([spec.root.id, ...spec.nodes.map((node) => node.id)]);
    return REQUIRED_GRAPH_NODE_IDS.every((id) => nodeIds.has(id));
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
