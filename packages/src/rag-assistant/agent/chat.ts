import {
  Chat,
  DefaultChatTransport,
  lastAssistantMessageHasCompletedToolContinuations,
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
    const submittedAutomaticContinuationKeys = new Set<string>();

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
        },
        prepareSendMessagesRequest: (request) => {
          for (const key of automaticContinuationKeys(request.messages)) {
            submittedAutomaticContinuationKeys.add(key);
          }
          return {};
        },
      }),
      onError: (error) => callbacks.onError?.(error.message),
      onToolCall: (part) => {
        if (part.state === 'input-available') {
          return executeToolCall(part);
        }
        return undefined;
      },
      sendAutomaticallyWhen: ({ messages }) => {
        const continuationKeys = automaticContinuationKeys(messages);
        return lastAssistantMessageHasCompletedToolContinuations({ messages })
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
      callbacks.onSources?.(extractSources(chat.messages));
      if (!latest || latest.role !== 'assistant') {
        flushQueuedToolCalls();
        return;
      }
      for (const part of latest.parts) {
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
      callbacks.onText?.(messageText(latest));
      flushQueuedToolCalls();
    });

    const abortHandler = () => this.stop();
    options.signal?.addEventListener('abort', abortHandler, { once: true });
    try {
      await this.chat.sendMessage({ text: message });
      flushQueuedToolCalls();
      await waitForContinuations();
      callbacks.onSources?.(extractSources(this.chat.messages));
      callbacks.onFinish?.(this.chat.messages);
      if (this.chat.error) {
        throw this.chat.error;
      }
      return this.chat.messages;
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
  const sources = new Map<string, RagSourceReference>();
  const ingest = (output: unknown) => {
    if (!output || typeof output !== 'object') {
      return;
    }
    const record = output as { resources?: unknown; resource?: unknown; output?: unknown };
    if (Array.isArray(record.resources)) {
      for (const item of record.resources) {
        ingestResource(item, sources);
      }
    }
    ingestResource(record.resource, sources);
    ingest(record.output);
  };
  for (const message of messages) {
    for (const part of message.parts) {
      if (isToolPart(part) && part.state === 'output-available') {
        ingest(part.output);
      }
    }
  }
  return [...sources.values()];
}

function ingestResource(resource: unknown, sources: Map<string, RagSourceReference>): void {
  if (!resource || typeof resource !== 'object') {
    return;
  }
  const record = resource as Record<string, unknown>;
  const id = stringValue(record.resourceId) || stringValue(record.id);
  if (!id || sources.has(id)) {
    return;
  }
  sources.set(id, {
    id,
    title: stringValue(record.title),
    url: stringValue(record.permalink) || stringValue(record.url),
    sourceType: stringValue(record.resourceType),
    content: stringValue(record.excerpt),
    metadata: {
      metadataName: stringValue(record.metadataName) || '',
    },
  });
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

function automaticContinuationKeys(messages: UIMessage[]): string[] {
  const assistant = [...messages].reverse().find((message) => message.role === 'assistant');
  if (!assistant) {
    return [];
  }
  const keys = assistant.parts
    .filter((part): part is ToolPart => isToolPart(part))
    .filter(isContinuableToolPart)
    .map(automaticContinuationKey);
  return [...new Set(keys)];
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
