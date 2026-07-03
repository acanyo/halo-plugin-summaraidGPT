import type { ToolPart, UIMessage } from '@halo-dev/ai-foundation-sdk';
import { rememberAgentAfterNavigationIntent } from './navigation-intent';
import { normalizeAgentRuntimeConfig } from './normalize';
import type { AgentRuntimeConfig, AgentToolResult } from './types';

type WritableCommentInput = HTMLTextAreaElement | HTMLInputElement | HTMLElement;

type RegisteredExecutor = (context: {
  input: Record<string, unknown>;
  toolName: string;
}) => Promise<unknown> | unknown;

interface TrustedResource {
  resourceId: string;
  permalink: string;
  title?: string;
  resourceType?: string;
  metadataName?: string;
}

interface TrustedPageLink {
  linkId: string;
  href: string;
  text: string;
}

const registeredExecutors = new Map<string, RegisteredExecutor>();
const AGENT_ACCENT_COLOR = '#a16207';
const AGENT_ACCENT_CONTRAST = '#ffffff';
const AGENT_SECONDARY_BACKGROUND = '#f4f4f5';
const AGENT_SECONDARY_TEXT = '#52525b';

declare global {
  interface Window {
    SummaraidGPTAI?: {
      registerTool: (name: string, executor: RegisteredExecutor) => void;
    };
    Live2DAI?: {
      registerTool: (name: string, executor: RegisteredExecutor) => void;
    };
  }
}

function registerTool(name: string, executor: RegisteredExecutor): void {
  if (!/^[a-z][a-z0-9_]{2,63}$/.test(name)) {
    return;
  }
  registeredExecutors.set(name, executor);
}

function ensureGlobalRegistry(): void {
  if (!window.SummaraidGPTAI) {
    window.SummaraidGPTAI = { registerTool };
  }
  if (!window.Live2DAI) {
    window.Live2DAI = { registerTool };
  }
}

ensureGlobalRegistry();

export class AgentToolRuntime {
  private readonly config: AgentRuntimeConfig;
  private readonly trustedResources = new Map<string, TrustedResource>();
  private readonly trustedPageLinks = new Map<string, TrustedPageLink>();
  private navigationStarted = false;

  constructor(config?: AgentRuntimeConfig) {
    this.config = normalizeAgentRuntimeConfig(config);
  }

  canExecute(toolName: string): boolean {
    return this.builtInToolNames().has(toolName)
      || this.config.aiTools.some((tool) => tool.name === toolName);
  }

  ingestMessages(messages: UIMessage[]): void {
    for (const message of messages) {
      for (const part of message.parts) {
        if (!isToolPart(part) || part.state !== 'output-available') {
          continue;
        }
        this.ingestToolOutput(part.output);
      }
    }
  }

  async execute(part: ToolPart): Promise<AgentToolResult> {
    const input = part.input ?? {};
    try {
      if (part.toolName === 'get_current_page_context') {
        return this.getCurrentPageContext();
      }
      if (part.toolName === 'open_halo_resource') {
        return this.openHaloResource(input);
      }
      if (part.toolName === 'open_current_page_link') {
        return this.openCurrentPageLink(input);
      }
      if (part.toolName === 'open_comment_area') {
        return this.scrollToCommentArea();
      }
      if (part.toolName === 'draft_comment') {
        if (this.config.builtIn.commentCapability === 'off') {
          return failure('TOOL_NOT_ALLOWED', '评论辅助能力未启用');
        }
        return this.fillCommentDraft(input);
      }
      if (part.toolName === 'submit_comment') {
        if (this.config.builtIn.commentCapability !== 'submit') {
          return failure('TOOL_NOT_ALLOWED', '评论提交能力未启用');
        }
        return this.submitComment(input);
      }

      const customTool = this.config.aiTools.find((tool) => tool.name === part.toolName);
      if (!customTool) {
        return failure('TOOL_NOT_FOUND', '这个功能还没有配置好');
      }
      const action = customTool.action;
      if (this.requiresApproval(customTool.approval, action)) {
        const approved = await this.requestApproval(`要我帮你执行「${customTool.description}」吗？`);
        if (!approved) {
          return failure('TOOL_APPROVAL_DENIED', '访客取消了这次操作');
        }
      }
      this.showStatus(action.pendingMessage ?? '我来帮你处理一下');
      const result = await this.executeCustomAction(action, input, part.toolName);
      this.showStatus(result.ok ? action.successMessage : action.errorMessage);
      return result;
    } catch (error) {
      return failure('TOOL_EXECUTION_FAILED', error instanceof Error ? error.message : '工具执行失败');
    }
  }

  tryOpenStrongResourceMatch(query: string): AgentToolResult | undefined {
    if (this.navigationStarted || !this.config.builtIn.haloNavigation) {
      return undefined;
    }
    const normalizedQuery = normalizedNavigationQuery(query);
    if (!normalizedQuery || !looksLikePageNavigationQuery(normalizedQuery)) {
      return undefined;
    }
    const resources = [...this.trustedResources.values()];
    const strongMatches = resources
      .map((resource) => ({ resource, score: resourceMatchScore(resource, normalizedQuery) }))
      .filter((match) => match.score > 0)
      .sort((left, right) => right.score - left.score);
    const bestMatch = strongMatches[0]?.resource;
    if (!bestMatch) {
      return undefined;
    }
    this.showStatus(`正在打开${bestMatch.title || '页面'}`);
    return this.navigate(bestMatch.permalink);
  }

  requestApproval(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      document.getElementById('summaraid-agent-approval')?.remove();
      const container = document.createElement('div');
      container.id = 'summaraid-agent-approval';
      container.style.cssText = [
        'position:fixed',
        'left:50%',
        'bottom:5.5rem',
        'z-index:100001',
        'transform:translateX(-50%)',
        'display:flex',
        'align-items:center',
        'gap:.5rem',
        'max-width:min(28rem,calc(100vw - 1rem))',
        'padding:.5rem .625rem',
        'border:1px solid rgba(24,24,27,.12)',
        'border-radius:.75rem',
        'background:rgba(255,255,255,.98)',
        'box-shadow:0 18px 44px rgba(15,23,42,.16)',
        'font-size:13px',
        'color:#334155',
      ].join(';');
      const text = document.createElement('span');
      text.textContent = message;
      text.style.cssText = 'line-height:1.4;min-width:0;flex:1;';
      const allow = document.createElement('button');
      allow.type = 'button';
      allow.textContent = '允许';
      allow.style.cssText = buttonStyle(AGENT_ACCENT_COLOR, AGENT_ACCENT_CONTRAST);
      const deny = document.createElement('button');
      deny.type = 'button';
      deny.textContent = '取消';
      deny.style.cssText = buttonStyle(AGENT_SECONDARY_BACKGROUND, AGENT_SECONDARY_TEXT);
      const cleanup = (approved: boolean) => {
        container.remove();
        resolve(approved);
      };
      allow.addEventListener('click', () => cleanup(true), { once: true });
      deny.addEventListener('click', () => cleanup(false), { once: true });
      container.append(text, allow, deny);
      document.body.append(container);
    });
  }

  private builtInToolNames(): Set<string> {
    const names = new Set<string>();
    if (!this.config.enabled) {
      return names;
    }
    const builtIn = this.config.builtIn;
    if (builtIn.pageContext) {
      names.add('get_current_page_context');
    }
    if (builtIn.haloNavigation) {
      names.add('open_halo_resource');
      names.add('open_current_page_link');
    }
    if (builtIn.commentCapability !== 'off') {
      names.add('open_comment_area');
      names.add('draft_comment');
    }
    if (builtIn.commentCapability === 'submit') {
      names.add('submit_comment');
    }
    return names;
  }

  private getCurrentPageContext(): AgentToolResult {
    const selectedText = window.getSelection()?.toString().trim() ?? '';
    const commentInput = this.findCommentInput();
    const commentArea = this.findCommentArea();
    const commentSubmit = commentInput?.container
      ? this.findCommentSubmitButton(commentInput.container)
      : undefined;
    const links = this.collectLinkSummaries();
    this.trustedPageLinks.clear();
    for (const link of links) {
      this.trustedPageLinks.set(link.linkId, link);
    }
    return {
      ok: true,
      title: document.title,
      url: window.location.href,
      path: window.location.pathname,
      description: document.querySelector<HTMLMetaElement>("meta[name='description']")?.content.trim() ?? '',
      headings: this.collectHeadings(),
      selectedText: selectedText.slice(0, 1600),
      capabilities: {
        comment: {
          hasArea: !!commentArea,
          hasInput: !!commentInput,
          hasSubmitButton: !!commentSubmit,
          reason: !commentArea
            ? '当前页面没有检测到评论区'
            : !commentInput
              ? '当前页面有评论区，但没有检测到可写评论输入框'
              : !commentSubmit
                ? '当前页面有可写评论输入框，但没有检测到提交按钮'
                : '当前页面支持填写评论',
        },
        forms: this.collectFormSummaries(),
        links,
      },
    };
  }

  private openHaloResource(input: Record<string, unknown>): AgentToolResult {
    const resourceId = stringInput(input.resourceId);
    if (!resourceId) {
      return failure('INVALID_INPUT', 'resourceId is required');
    }
    const resource = this.trustedResources.get(resourceId);
    if (!resource) {
      return failure('RESOURCE_NOT_TRUSTED', '没有找到可信资源');
    }
    return this.navigate(resource.permalink);
  }

  private openCurrentPageLink(input: Record<string, unknown>): AgentToolResult {
    const linkId = stringInput(input.linkId);
    if (!linkId) {
      return failure('INVALID_INPUT', 'linkId is required');
    }
    const link = this.trustedPageLinks.get(linkId);
    if (!link) {
      return failure('LINK_NOT_TRUSTED', '没有找到可信链接');
    }
    return this.navigate(link.href);
  }

  private scrollToCommentArea(): AgentToolResult {
    const commentArea = this.findCommentArea();
    if (!commentArea) {
      return failure('COMMENT_AREA_NOT_FOUND', '当前页面没有检测到评论区');
    }
    commentArea.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    this.showStatus('已经帮你定位到评论区');
    return { ok: true };
  }

  private fillCommentDraft(input: Record<string, unknown>): AgentToolResult {
    const content = stringInput(input.content);
    if (!content) {
      return failure('INVALID_INPUT', 'content is required');
    }
    const target = this.findCommentInput();
    if (!target) {
      this.scrollToCommentArea();
      return failure(
        'COMMENT_INPUT_NOT_FOUND',
        this.findCommentArea()
          ? '当前页面有评论区，但没有找到可写评论输入框'
          : '当前页面没有检测到评论区，无法填写评论',
      );
    }
    target.container?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    this.writeCommentInput(target.input, content);
    target.input.focus();
    this.showStatus('评论草稿已经帮你填好了');
    return { ok: true, drafted: true };
  }

  private submitComment(input: Record<string, unknown>): AgentToolResult {
    const draftResult = this.fillCommentDraft(input);
    if (!draftResult.ok) {
      return draftResult;
    }
    const target = this.findCommentInput();
    const submitButton = target?.container ? this.findCommentSubmitButton(target.container) : undefined;
    if (!submitButton) {
      return failure('COMMENT_SUBMIT_NOT_FOUND', '没有找到评论提交按钮');
    }
    submitButton.click();
    this.showStatus('已经尝试提交评论');
    return { ok: true, submitted: true };
  }

  private async executeCustomAction(
    action: AgentRuntimeConfig['aiTools'][number]['action'],
    input: Record<string, unknown>,
    toolName: string,
  ): Promise<AgentToolResult> {
    if (action.type === 'navigate') {
      return this.navigate(action.url, action.target);
    }
    if (action.type === 'scroll-to') {
      return this.scrollToSelector(action.selector, action.behavior);
    }
    if (action.type === 'highlight') {
      return this.highlight(action.selector, action.duration);
    }
    if (action.type === 'dispatch-event') {
      window.dispatchEvent(new CustomEvent(action.event, { detail: input }));
      return { ok: true };
    }
    const executor = registeredExecutors.get(toolName);
    if (!executor) {
      return failure('TOOL_EXECUTOR_NOT_FOUND', '这个站点还没有启用对应能力');
    }
    return { ok: true, output: await executor({ input, toolName }) };
  }

  private navigate(url: string, target: '_self' | '_blank' = '_self'): AgentToolResult {
    const destination = new URL(url, window.location.origin);
    if (!this.isAllowedUrl(destination)) {
      return failure('URL_NOT_ALLOWED', '这个链接不在允许范围内');
    }
    const useBlank = target === '_blank' && this.config.toolSecurity.allowNewTab;
    this.navigationStarted = true;
    if (!useBlank) {
      rememberAgentAfterNavigationIntent();
    }
    window.setTimeout(() => {
      if (useBlank) {
        window.open(destination.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.assign(destination.href);
      }
    }, 50);
    return { ok: true, navigating: true, pageReload: !useBlank, url: destination.href };
  }

  private scrollToSelector(selector: string, behavior: ScrollBehavior = 'smooth'): AgentToolResult {
    const element = document.querySelector(selector);
    if (!element) {
      return failure('ELEMENT_NOT_FOUND', '没有找到对应的位置');
    }
    element.scrollIntoView?.({ behavior, block: 'center' });
    return { ok: true };
  }

  private highlight(selector: string, duration = 1600): AgentToolResult {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) {
      return failure('ELEMENT_NOT_FOUND', '没有找到对应的位置');
    }
    const previousOutline = element.style.outline;
    const previousOutlineOffset = element.style.outlineOffset;
    element.style.outline = `2px solid ${AGENT_ACCENT_COLOR}`;
    element.style.outlineOffset = '3px';
    window.setTimeout(() => {
      element.style.outline = previousOutline;
      element.style.outlineOffset = previousOutlineOffset;
    }, duration);
    return { ok: true };
  }

  private isAllowedUrl(url: URL): boolean {
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    if (url.origin === window.location.origin) {
      return true;
    }
    return this.config.toolSecurity.allowedExternalOrigins.includes(url.origin);
  }

  private requiresApproval(
    approval: 'default' | 'never' | 'always',
    action: { type: string; url?: string },
  ): boolean {
    if (approval === 'always') {
      return true;
    }
    if (approval === 'never') {
      return false;
    }
    if (action.type === 'registered' || action.type === 'dispatch-event') {
      return true;
    }
    if (action.type === 'navigate' && action.url) {
      const destination = new URL(action.url, window.location.origin);
      return destination.origin !== window.location.origin;
    }
    return false;
  }

  private ingestToolOutput(output: unknown): void {
    if (!output || typeof output !== 'object') {
      return;
    }
    const record = output as { resources?: unknown; resource?: unknown; output?: unknown };
    if (Array.isArray(record.resources)) {
      for (const resource of record.resources) {
        this.ingestResource(resource);
      }
    }
    this.ingestResource(record.resource);
    this.ingestToolOutput(record.output);
  }

  private ingestResource(resource: unknown): void {
    if (!resource || typeof resource !== 'object') {
      return;
    }
    const item = resource as Partial<TrustedResource>;
    if (item.resourceId && item.permalink) {
      this.trustedResources.set(item.resourceId, {
        resourceId: item.resourceId,
        permalink: item.permalink,
        title: item.title,
        resourceType: typeof item.resourceType === 'string' ? item.resourceType : undefined,
        metadataName: typeof item.metadataName === 'string' ? item.metadataName : undefined,
      });
    }
  }

  private showStatus(message?: string): void {
    if (!message) {
      return;
    }
    window.dispatchEvent(new CustomEvent('summaraid:agent-status', { detail: { message } }));
  }

  private findCommentInput(): { container: Element | undefined; input: WritableCommentInput } | undefined {
    const containers = this.commentContainers();
    for (const container of containers) {
      const input = this.findWritableCommentInput(container);
      if (input) {
        return { container, input };
      }
    }
    const input = this.findWritableCommentInput(document.body);
    return input ? { container: undefined, input } : undefined;
  }

  private commentContainers(): Element[] {
    return [...document.querySelectorAll([
      '#comment',
      '#comments',
      'halo-comment',
      '[data-comment]',
      '.comment',
      '.comments',
      '.comment-form',
    ].join(','))];
  }

  private findCommentArea(): Element | undefined {
    return this.commentContainers()[0];
  }

  private collectHeadings(): Array<{ level: number; text: string }> {
    return [...document.querySelectorAll<HTMLHeadingElement>('h1,h2,h3')]
      .map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: (heading.textContent ?? '').trim(),
      }))
      .filter((heading) => heading.text)
      .slice(0, 8);
  }

  private collectFormSummaries(): Array<{ id?: string; name?: string; fields: string[]; submitLabels: string[] }> {
    return [...document.querySelectorAll<HTMLFormElement>('form')]
      .map((form) => ({
        id: form.id || undefined,
        name: form.getAttribute('name') || undefined,
        fields: [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input,textarea,select')]
          .map((field) => field.getAttribute('name') || field.getAttribute('aria-label') || field.id)
          .filter((field): field is string => !!field)
          .slice(0, 12),
        submitLabels: [...form.querySelectorAll<HTMLButtonElement | HTMLInputElement>("button,input[type='submit']")]
          .map((button) => (button.textContent || button.getAttribute('value') || button.getAttribute('aria-label') || '').trim())
          .filter((label) => label)
          .slice(0, 6),
      }))
      .slice(0, 6);
  }

  private collectLinkSummaries(): TrustedPageLink[] {
    return [...document.querySelectorAll<HTMLAnchorElement>('a[href]')]
      .map((link, index) => ({
        linkId: `link-${index}`,
        text: (link.textContent ?? '').trim().replace(/\s+/g, ' '),
        href: link.href,
      }))
      .filter((link) => link.text && this.isAllowedUrl(new URL(link.href)))
      .slice(0, 30);
  }

  private findWritableCommentInput(root: ParentNode): WritableCommentInput | undefined {
    const selectors = [
      'textarea:not([disabled]):not([readonly])',
      "[contenteditable='true']",
      "[contenteditable='']",
      "input[name='content']:not([disabled]):not([readonly])",
      "input[name='comment']:not([disabled]):not([readonly])",
    ];
    for (const selector of selectors) {
      const found = this.deepQuerySelector<WritableCommentInput>(root, selector);
      if (found && this.isWritableCommentInput(found)) {
        return found;
      }
    }
    return undefined;
  }

  private findCommentSubmitButton(root: ParentNode): HTMLElement | undefined {
    const selectors = [
      "button[type='submit']:not([disabled])",
      "input[type='submit']:not([disabled])",
      'button:not([disabled])',
      "[role='button']:not([aria-disabled='true'])",
    ];
    for (const selector of selectors) {
      const elements = this.deepQuerySelectorAll<HTMLElement>(root, selector);
      const submit = elements.find((element) => {
        const text = `${element.textContent ?? ''} ${element.getAttribute('aria-label') ?? ''} ${element.getAttribute('value') ?? ''}`.trim();
        return /提交|评论|发送|发布|回复|submit|send|post|reply/i.test(text);
      });
      if (submit) {
        return submit;
      }
    }
    return undefined;
  }

  private deepQuerySelector<T extends Element>(root: ParentNode, selector: string): T | undefined {
    return this.deepQuerySelectorAll<T>(root, selector)[0];
  }

  private deepQuerySelectorAll<T extends Element>(root: ParentNode, selector: string): T[] {
    const results: T[] = [];
    const visit = (node: ParentNode) => {
      if (!('querySelectorAll' in node)) {
        return;
      }
      results.push(...[...(node as Document | DocumentFragment | Element).querySelectorAll<T>(selector)]);
      for (const element of [...(node as Document | DocumentFragment | Element).querySelectorAll('*')]) {
        if (element.shadowRoot) {
          visit(element.shadowRoot);
        }
      }
    };
    visit(root);
    return results;
  }

  private isWritableCommentInput(input: Element): input is WritableCommentInput {
    return input instanceof HTMLTextAreaElement
      || input instanceof HTMLInputElement
      || (input instanceof HTMLElement && input.isContentEditable);
  }

  private writeCommentInput(input: WritableCommentInput, content: string): void {
    if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value');
      descriptor?.set?.call(input, content);
    } else {
      input.textContent = content;
    }
    const inputEvent = typeof InputEvent === 'function'
      ? new InputEvent('input', { bubbles: true, inputType: 'insertText', data: content })
      : new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function isToolPart(part: UIMessage['parts'][number]): part is ToolPart {
  return part.type.startsWith('tool-');
}

function stringInput(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function failure(errorCode: string, message: string): AgentToolResult {
  return { ok: false, errorCode, message };
}

function buttonStyle(background: string, color: string): string {
  return [
    'border:none',
    'border-radius:.55rem',
    'padding:.35rem .65rem',
    'font:inherit',
    'font-weight:700',
    `background:${background}`,
    `color:${color}`,
    'cursor:pointer',
  ].join(';');
}

function normalizedNavigationQuery(query: string): string {
  return query
    .trim()
    .replace(/^(打开|跳转到?|带我去|看看|查看|进入|去一下|访问)\s*/u, '')
    .replace(/[。！？?!,.，、\s]/gu, '')
    .toLowerCase();
}

function normalizeResourceText(text?: string): string {
  return (text ?? '')
    .trim()
    .replace(/[。！？?!,.，、\s_-]/gu, '')
    .toLowerCase();
}

function looksLikePageNavigationQuery(query: string): boolean {
  if (query.length < 2 || query.length > 18) {
    return false;
  }
  if (/^(为什么|怎么|如何|什么|是否|能不能|可不可以|介绍|解释|总结|告诉我)/u.test(query)) {
    return false;
  }
  return true;
}

function resourceMatchScore(resource: TrustedResource, query: string): number {
  const title = normalizeResourceText(resource.title);
  const metadataName = normalizeResourceText(resource.metadataName);
  const resourceType = resource.resourceType ?? '';
  const isPage = resourceType.includes('singlepage');
  const pageBonus = isPage ? 20 : 0;
  if (title && title === query) {
    return 100 + pageBonus;
  }
  if (metadataName && metadataName === query) {
    return 92 + pageBonus;
  }
  if (title && (query.includes(title) || title.includes(query)) && Math.min(title.length, query.length) >= 2) {
    return 80 + pageBonus;
  }
  if (metadataName && (query.includes(metadataName) || metadataName.includes(query)) && Math.min(metadataName.length, query.length) >= 2) {
    return 70 + pageBonus;
  }
  return 0;
}
