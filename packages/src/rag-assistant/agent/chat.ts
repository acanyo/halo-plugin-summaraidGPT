import {
  Chat,
  DefaultChatTransport,
  pruneMessages,
  type ToolPart,
  type UIMessage,
} from '@halo-dev/ai-foundation-sdk';
import { RAG_API_BASE } from '../api';
import type { RagSourceReference } from '../types';
import {
  rememberAgentAfterNavigationIntent,
  type AgentAfterNavigationDisplayMode,
} from './navigation-intent';
import { AgentToolRuntime } from './runtime';
import type { AgentRuntimeConfig } from './types';

const SERVER_MANAGED_TOOL_NAMES = new Set([
  'search_halo_resources',
  'get_halo_resource_detail',
  'get_latest_halo_resources',
  'get_categories',
  'get_tags',
  'get_posts_by_category',
  'get_posts_by_tag',
  'get_pages',
  'search_rag_resources',
  'get_rag_resource_detail',
  'fetch_allowed_url',
]);
const ASSOCIATED_SOURCE_LIMIT = 6;

interface SourceCandidate {
  source: RagSourceReference;
  priority: number;
  order: number;
}

export interface AgentChatCallbacks {
  onText?: (text: string) => void;
  onSources?: (sources: RagSourceReference[]) => void;
  onError?: (error: string) => void;
  onFinish?: (messages: UIMessage[]) => void;
}

export interface AgentChatOptions {
  agent?: AgentRuntimeConfig;
  historyMessages?: UIMessage[];
  conversationId?: string;
  visitorId?: string;
  recordUserMessage?: boolean;
  ragEnabledForAgent?: boolean;
  afterNavigationDisplayMode?: AgentAfterNavigationDisplayMode;
  signal?: AbortSignal;
}

export class AgentChatClient {
  private chat?: Chat;

  async sendMessage(
    message: string,
    options: AgentChatOptions,
    callbacks: AgentChatCallbacks = {},
  ): Promise<UIMessage[]> {
    const runtime = new AgentToolRuntime(options.agent);
    const pendingContinuations = new Set<Promise<void>>();
    const queuedToolCalls = new Map<string, ToolPart>();
    const handledToolCalls = new Set<string>();
    const handledApprovals = new Set<string>();
    const handledToolStatuses = new Set<string>();
    const submittedAutomaticContinuationKeys = new Set<string>();
    let latestSourcesKey = '';
    seedHandledToolStatuses(options.historyMessages ?? [], handledToolStatuses);

    const trackContinuation = (continuation: Promise<void>) => {
      const tracked = continuation.finally(() => pendingContinuations.delete(tracked));
      pendingContinuations.add(tracked);
      return tracked;
    };

    const shouldQueueToolCall = () => this.chat?.status === 'submitted' || this.chat?.status === 'streaming';

    const executeToolCall = (part: ToolPart) => {
      if (handledToolCalls.has(part.toolCallId)) {
        return;
      }
      if (shouldQueueToolCall()) {
        queuedToolCalls.set(part.toolCallId, part);
        return;
      }
      handledToolCalls.add(part.toolCallId);
      if (!runtime.canExecute(part.toolName)) {
        if (SERVER_MANAGED_TOOL_NAMES.has(part.toolName)) {
          return undefined;
        }
        return trackContinuation(
          this.chat!.addToolOutput({
            toolCallId: part.toolCallId,
            toolName: part.toolName,
            state: 'output-error',
            errorText: '当前页面没有启用这个浏览器能力',
          }).then(() => undefined),
        );
      }
      return trackContinuation(
        runtime.execute(part)
          .then((output) => {
            if (shouldResumeAfterNavigation(output)) {
              rememberAgentAfterNavigationIntent({
                displayMode: options.afterNavigationDisplayMode,
                resume: {
                  historyMessages: historyWithToolOutput(this.chat!.messages, part, output),
                },
              });
            }
            return this.chat!.addToolOutput({
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              output,
            }).then(() => output);
          })
          .then((output) => {
            if (shouldResumeAfterNavigation(output)) {
              rememberAgentAfterNavigationIntent({
                displayMode: options.afterNavigationDisplayMode,
                resume: {
                  historyMessages: stabilizeHistory(this.chat!.messages),
                },
              });
            }
          })
          .then(() => undefined),
      );
    };

    const flushQueuedToolCalls = () => {
      if (shouldQueueToolCall() || queuedToolCalls.size === 0) {
        return;
      }
      const parts = [...queuedToolCalls.values()];
      queuedToolCalls.clear();
      parts.forEach(executeToolCall);
    };

    const waitForContinuations = async () => {
      while (pendingContinuations.size > 0 || queuedToolCalls.size > 0) {
        flushQueuedToolCalls();
        if (pendingContinuations.size === 0) {
          break;
        }
        await Promise.allSettled([...pendingContinuations]);
      }
    };

    const emitSources = () => {
      const chat = this.chat;
      if (!chat) {
        return;
      }
      const turnMessages = currentTurnMessages(chat.messages);
      if (turnMessages.some(hasPendingToolPart)) {
        return;
      }
      const sources = extractSources(turnMessages);
      if (!sources.length) {
        return;
      }
      const key = JSON.stringify(sources.map((source) => [
        source.id,
        source.title,
        source.url,
        source.sourceType,
      ]));
      if (key === latestSourcesKey) {
        return;
      }
      latestSourcesKey = key;
      callbacks.onSources?.(sources);
    };

    this.chat = new Chat({
      id: 'summaraid-rag-agent',
      messages: options.historyMessages ?? [],
      transport: new DefaultChatTransport({
        api: `${RAG_API_BASE}/ragAgentChat`,
        credentials: 'same-origin',
        body: {
          conversationId: options.conversationId,
          visitorId: options.visitorId,
          recordUserMessage: options.recordUserMessage !== false,
          ragEnabledForAgent: options.ragEnabledForAgent === true,
        },
        prepareSendMessagesRequest: (request) => {
          for (const key of automaticContinuationKeys(
            request.messages,
            (part) => runtime.canExecute(part.toolName),
          )) {
            submittedAutomaticContinuationKeys.add(key);
          }
          return {};
        },
      }),
      onError: (error) => {
        console.error('[summaraidGPT] Agent chat stream failed', error);
        callbacks.onError?.(error.message);
      },
      onToolCall: (part) => {
        if (part.state === 'input-available') {
          return executeToolCall(part);
        }
        return undefined;
      },
      sendAutomaticallyWhen: ({ messages }) => {
        const continuationKeys = automaticContinuationKeys(
          messages,
          (part) => runtime.canExecute(part.toolName),
        );
        return lastAssistantMessageHasCompletedClientToolContinuations(
          messages,
          (part) => runtime.canExecute(part.toolName),
        )
          && continuationKeys.some((key) => !submittedAutomaticContinuationKeys.has(key));
      },
      maxAutomaticSteps: 5,
      onFinish: ({ messages, isAbort, isError }) => {
        if (!isAbort && !isError) {
          callbacks.onFinish?.(messages);
        }
      },
    });

    const unsubscribe = this.chat.subscribe(() => {
      const chat = this.chat;
      if (!chat) {
        return;
      }
      const latest = chat.messages[chat.messages.length - 1];
      runtime.ingestMessages(chat.messages);
      emitToolStatusesForCurrentTurn(chat.messages, handledToolStatuses);
      emitSources();
      if (!latest || latest.role !== 'assistant') {
        flushQueuedToolCalls();
        return;
      }
      for (const part of latest.parts) {
        emitToolStatusOnce(part, handledToolStatuses);
        if (isToolPart(part) && part.state === 'input-available') {
          executeToolCall(part);
        }
        if (
          isToolPart(part)
          && part.state === 'approval-requested'
          && part.approval?.id
          && !handledApprovals.has(part.approval.id)
        ) {
          handledApprovals.add(part.approval.id);
          trackContinuation(
            runtime.requestApproval(`要我帮你执行「${part.toolName}」吗？`)
              .then((approved) => chat.addToolApprovalResponse({
                id: part.approval?.id,
                toolCallId: part.toolCallId,
                toolName: part.toolName,
                approved,
                reason: approved ? 'Approved by visitor' : 'Denied by visitor',
              }))
              .then(() => undefined),
          );
        }
      }
      const navigationResult = runtime.tryOpenStrongResourceMatch(message);
      if (navigationResult?.ok && shouldResumeAfterNavigation(navigationResult)) {
        rememberAgentAfterNavigationIntent({
          displayMode: options.afterNavigationDisplayMode,
          resume: {
            historyMessages: stabilizeHistory(chat.messages),
          },
        });
      }
      const visibleText = visibleAssistantText(chat.messages);
      if (visibleText !== undefined) {
        callbacks.onText?.(visibleText);
      }
      flushQueuedToolCalls();
    });

    const abortHandler = () => this.stop();
    options.signal?.addEventListener('abort', abortHandler, { once: true });
    try {
      await this.chat.sendMessage({ text: message });
      flushQueuedToolCalls();
      await waitForContinuations();
      emitSources();
      callbacks.onFinish?.(this.chat.messages);
      if (this.chat.error) {
        throw this.chat.error;
      }
      return this.chat.messages;
    } catch (error) {
      console.error('[summaraidGPT] Agent chat request failed', error);
      throw error;
    } finally {
      options.signal?.removeEventListener('abort', abortHandler);
      unsubscribe();
    }
  }

  stop(): void {
    this.chat?.stop();
    this.chat = undefined;
  }
}

export function extractSources(messages: UIMessage[]): RagSourceReference[] {
  const candidates: SourceCandidate[] = [];
  let order = 0;
  const ingest = (output: unknown) => {
    if (!output || typeof output !== 'object') {
      return;
    }
    const record = output as { resources?: unknown; resource?: unknown; output?: unknown };
    if (Array.isArray(record.resources)) {
      for (const item of record.resources) {
        ingestResource(item, candidates, 1, order++);
      }
    }
    ingestResource(record.resource, candidates, 2, order++);
    ingest(record.output);
  };
  for (const message of messages) {
    for (const part of message.parts) {
      if (isToolPart(part) && part.state === 'output-available') {
        ingest(part.output);
      }
    }
  }
  const merged = mergeSourceCandidates(candidates);
  const hasDetailedSource = merged.some((candidate) => candidate.priority >= 2);
  return merged
    .filter((candidate) => !hasDetailedSource || candidate.priority >= 2)
    .sort(compareSourceCandidates)
    .slice(0, ASSOCIATED_SOURCE_LIMIT)
    .map((candidate) => candidate.source);
}

function ingestResource(
  resource: unknown,
  candidates: SourceCandidate[],
  priority: number,
  order: number,
): void {
  if (!resource || typeof resource !== 'object') {
    return;
  }
  const record = resource as Record<string, unknown>;
  const id = stringValue(record.resourceId) || stringValue(record.id);
  if (!id) {
    return;
  }
  candidates.push({
    priority,
    order,
    source: {
      id,
      title: stringValue(record.title),
      url: stringValue(record.permalink) || stringValue(record.url),
      sourceType: stringValue(record.resourceType),
      content: stringValue(record.excerpt),
      metadata: {
        metadataName: stringValue(record.metadataName) || '',
      },
    },
  });
}

function mergeSourceCandidates(candidates: SourceCandidate[]): SourceCandidate[] {
  const merged: SourceCandidate[] = [];
  for (const candidate of candidates) {
    const keys = sourceIdentityKeys(candidate.source);
    const existing = merged.find((item) =>
      sourceIdentityKeys(item.source).some((key) => keys.includes(key)),
    );
    if (!existing) {
      merged.push({ ...candidate });
      continue;
    }
    const previousPriority = existing.priority;
    existing.priority = Math.max(existing.priority, candidate.priority);
    existing.order = Math.min(existing.order, candidate.order);
    if (
      sourceDisplayRank(candidate.source) > sourceDisplayRank(existing.source)
      || (
        sourceDisplayRank(candidate.source) === sourceDisplayRank(existing.source)
        && candidate.priority > previousPriority
      )
    ) {
      existing.source = candidate.source;
    }
  }
  return merged;
}

function compareSourceCandidates(left: SourceCandidate, right: SourceCandidate): number {
  return right.priority - left.priority
    || sourceDisplayRank(right.source) - sourceDisplayRank(left.source)
    || left.order - right.order;
}

function sourceIdentityKeys(source: RagSourceReference): string[] {
  return [
    source.id ? `id:${source.id}` : undefined,
    normalizeSourceUrl(source.url) ? `url:${normalizeSourceUrl(source.url)}` : undefined,
    normalizeSourceText(source.title) ? `title:${normalizeSourceText(source.title)}` : undefined,
  ].filter((key): key is string => Boolean(key));
}

function sourceDisplayRank(source: RagSourceReference): number {
  const type = source.sourceType?.toLowerCase() || '';
  if (type.includes('post.content.halo.run') || type.includes('singlepage.content.halo.run')) {
    return 3;
  }
  if (type.includes('ragdocument')) {
    return 2;
  }
  return source.url ? 1 : 0;
}

function normalizeSourceUrl(url: string | undefined): string {
  if (!url) {
    return '';
  }
  try {
    const parsed = new URL(url, window.location.origin);
    parsed.hash = '';
    return parsed.href.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.trim().replace(/\/$/, '').toLowerCase();
  }
}

function normalizeSourceText(text: string | undefined): string {
  return text?.trim().replace(/\s+/g, ' ').toLowerCase() || '';
}

function messageText(message: UIMessage): string {
  return sanitizeAssistantProtocolText(message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join(''));
}

function sanitizeAssistantProtocolText(text: string): string {
  return text
    .replace(/<\|tool_calls_section_begin\|>[\s\S]*?(?:<\|tool_calls_section_end\|>|$)/g, '')
    .replace(/<\|tool_call_begin\|>[\s\S]*?(?:<\|tool_call_end\|>|$)/g, '')
    .replace(/<\|tool_call_argument_begin\|>[\s\S]*?(?:<\|tool_call_end\|>|$)/g, '')
    .replace(/<\|tool_[^>\s]*(?:\|>)?/g, '')
    .trimEnd();
}

function visibleAssistantText(messages: UIMessage[]): string | undefined {
  const turnMessages = currentTurnMessages(messages);
  const latestAssistant = [...turnMessages].reverse()
    .find((message) => message.role === 'assistant');
  if (!latestAssistant) {
    return undefined;
  }

  const hasToolContext = turnMessages.some((message) =>
    message.parts.some((part) => isToolPart(part)),
  );
  if (!hasToolContext) {
    return messageText(latestAssistant);
  }

  if (turnMessages.some(hasPendingToolPart)) {
    return '';
  }

  const latestToolIndex = latestToolPartIndex(latestAssistant);
  if (latestToolIndex < 0) {
    return messageText(latestAssistant);
  }
  return latestAssistant.parts
    .slice(latestToolIndex + 1)
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

function latestToolPartIndex(message: UIMessage): number {
  for (let index = message.parts.length - 1; index >= 0; index -= 1) {
    if (isToolPart(message.parts[index])) {
      return index;
    }
  }
  return -1;
}

function hasPendingToolPart(message: UIMessage): boolean {
  return message.parts.some((part) =>
    isToolPart(part)
    && part.state !== 'output-available'
    && part.state !== 'output-error'
    && part.state !== 'output-denied'
    && part.state !== 'approval-responded',
  );
}

function automaticContinuationKeys(
  messages: UIMessage[],
  shouldInclude: (part: ToolPart) => boolean = () => true,
): string[] {
  const assistant = [...messages].reverse().find((message) => message.role === 'assistant');
  if (!assistant) {
    return [];
  }
  const keys = assistant.parts
    .filter((part): part is ToolPart => isToolPart(part))
    .filter(shouldInclude)
    .filter(isContinuableToolPart)
    .map(automaticContinuationKey);
  return [...new Set(keys)];
}

function lastAssistantMessageHasCompletedClientToolContinuations(
  messages: UIMessage[],
  shouldInclude: (part: ToolPart) => boolean,
): boolean {
  const assistant = [...messages].reverse().find((message) => message.role === 'assistant');
  if (!assistant) {
    return false;
  }
  const toolParts = assistant.parts
    .filter((part): part is ToolPart => isToolPart(part))
    .filter(shouldInclude);
  return toolParts.length > 0 && toolParts.every(isContinuableToolPart);
}

function isContinuableToolPart(part: ToolPart): boolean {
  return hasFinalToolResultState(part) || part.state === 'approval-responded';
}

function automaticContinuationKey(part: ToolPart): string {
  return JSON.stringify({
    toolCallId: part.toolCallId,
    toolName: part.toolName,
    state: part.state,
    approvalId: part.approval?.id,
    approved: part.approval?.approved,
  });
}

function hasFinalToolResultState(part: ToolPart): boolean {
  return part.state === 'output-available'
    || part.state === 'output-error'
    || part.state === 'output-denied';
}

function shouldResumeAfterNavigation(output: unknown): boolean {
  if (typeof output !== 'object' || output === null) {
    return false;
  }
  const record = output as Record<string, unknown>;
  if (record.navigating === true) {
    return record.pageReload !== false;
  }
  return shouldResumeAfterNavigation(record.output);
}

function historyWithToolOutput(messages: UIMessage[], part: ToolPart, output: unknown): UIMessage[] {
  return stabilizeHistory(
    messages.map((message) => {
      if (message.role !== 'assistant') {
        return message;
      }
      const parts = message.parts.map((messagePart) => {
        if (!isToolPart(messagePart) || messagePart.toolCallId !== part.toolCallId) {
          return messagePart;
        }
        return {
          ...messagePart,
          type: `tool-${part.toolName}`,
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          state: 'output-available',
          output,
        } satisfies ToolPart;
      });
      return { ...message, parts };
    }),
  );
}

function stabilizeHistory(messages: UIMessage[], maxMessages?: number): UIMessage[] {
  return sanitizeHistory(pruneMessages(messages, { maxMessages }));
}

function sanitizeHistory(messages: UIMessage[]): UIMessage[] {
  const seenFinalToolCallIds = new Set<string>();
  return [...messages]
    .reverse()
    .map((message) => {
      if (message.role !== 'assistant') {
        return message;
      }
      const parts = [...message.parts]
        .reverse()
        .filter((part) => {
          if (!isToolPart(part) || !hasFinalToolResultState(part)) {
            return true;
          }
          if (seenFinalToolCallIds.has(part.toolCallId)) {
            return false;
          }
          seenFinalToolCallIds.add(part.toolCallId);
          return true;
        })
        .reverse();
      return parts.length === message.parts.length ? message : { ...message, parts };
    })
    .reverse()
    .filter((message) => message.parts.length > 0);
}

function isToolPart(part: UIMessage['parts'][number]): part is ToolPart {
  return part.type.startsWith('tool-');
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function currentTurnMessages(messages: UIMessage[]): UIMessage[] {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') {
      return messages.slice(i + 1);
    }
  }
  return messages;
}

function seedHandledToolStatuses(messages: UIMessage[], handled: Set<string>): void {
  for (const message of messages) {
    for (const part of message.parts) {
      if (isToolPart(part)) {
        handled.add(`${part.toolCallId}:${part.state}`);
      }
    }
  }
}

function emitToolStatusesForCurrentTurn(messages: UIMessage[], handled: Set<string>): void {
  for (const message of currentTurnMessages(messages)) {
    for (const part of message.parts) {
      emitToolStatusOnce(part, handled);
    }
  }
}

function emitToolStatusOnce(part: UIMessage['parts'][number], handled: Set<string>): void {
  if (!isToolPart(part)) {
    return;
  }
  const key = `${part.toolCallId}:${part.state}`;
  if (handled.has(key)) {
    return;
  }
  const status = toolStatus(part);
  if (!status) {
    return;
  }
  handled.add(key);
  window.dispatchEvent(new CustomEvent('summaraid:agent-status', { detail: status }));
}

function toolStatus(part: ToolPart): { message: string; kind: 'pending' | 'success' | 'warning' | 'error' } | undefined {
  if (part.state === 'input-available') {
    return { message: pendingToolMessage(part.toolName), kind: 'pending' };
  }
  if (part.state === 'approval-requested') {
    return { message: `等待确认「${toolLabel(part.toolName)}」`, kind: 'warning' };
  }
  if (part.state === 'output-available') {
    return { message: successToolMessage(part.toolName, part.output), kind: 'success' };
  }
  if (part.state === 'output-error') {
    return { message: `${toolLabel(part.toolName)}失败`, kind: 'error' };
  }
  if (part.state === 'output-denied') {
    return { message: `已取消「${toolLabel(part.toolName)}」`, kind: 'warning' };
  }
  return undefined;
}

function pendingToolMessage(toolName: string): string {
  const map: Record<string, string> = {
    get_current_page_context: '正在读取当前页面',
    search_halo_resources: '正在搜索站内内容',
    get_halo_resource_detail: '正在读取站内资源',
    get_latest_halo_resources: '正在查看最新内容',
    get_categories: '正在查看分类',
    get_tags: '正在查看标签',
    get_posts_by_category: '正在查看分类文章',
    get_posts_by_tag: '正在查看标签文章',
    get_pages: '正在查找页面',
    search_rag_resources: '正在检索知识库',
    get_rag_resource_detail: '正在读取知识库详情',
    open_halo_resource: '正在打开页面',
    open_current_page_link: '正在打开当前页链接',
    open_comment_area: '正在定位评论区',
    draft_comment: '正在填写评论草稿',
    submit_comment: '正在提交评论',
    fetch_allowed_url: '正在读取外部资料',
  };
  return map[toolName] || `正在执行「${toolLabel(toolName)}」`;
}

function successToolMessage(toolName: string, output: unknown): string {
  const count = resourceCount(output);
  if (toolName === 'search_rag_resources') {
    return count > 0 ? `知识库命中 ${count} 条资料` : '知识库没有命中资料';
  }
  if (toolName === 'search_halo_resources' || toolName === 'get_pages') {
    return count > 0 ? `找到 ${count} 个站内资源` : '没有找到匹配资源';
  }
  if (toolName === 'get_current_page_context') {
    return '已读取当前页面';
  }
  if (toolName.startsWith('open_')) {
    return '页面打开请求已发送';
  }
  if (toolName.includes('comment')) {
    return '评论操作已处理';
  }
  return `${toolLabel(toolName)}完成`;
}

function toolLabel(toolName: string): string {
  const map: Record<string, string> = {
    get_current_page_context: '读取页面',
    search_halo_resources: '站内搜索',
    search_rag_resources: '知识库检索',
    get_rag_resource_detail: '知识库详情',
    open_halo_resource: '打开页面',
    open_current_page_link: '打开链接',
    draft_comment: '评论草稿',
    submit_comment: '提交评论',
  };
  return map[toolName] || toolName.replace(/^tool-/, '').replace(/_/g, ' ');
}

function resourceCount(output: unknown): number {
  if (!output || typeof output !== 'object') {
    return 0;
  }
  const record = output as { resources?: unknown; resource?: unknown; output?: unknown };
  if (Array.isArray(record.resources)) {
    return record.resources.length;
  }
  if (record.resource) {
    return 1;
  }
  return resourceCount(record.output);
}
