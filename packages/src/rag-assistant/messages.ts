import { formatTime } from './format';
import type { RagAssistantMessage } from './types';

export function createMessage(
  role: RagAssistantMessage['role'],
  content: string,
  options: Partial<Pick<RagAssistantMessage, 'id' | 'streaming' | 'sources' | 'error' | 'time'>> = {},
): RagAssistantMessage {
  return {
    id: options.id || createMessageId(),
    role,
    content,
    time: options.time || formatTime(),
    sources: options.sources,
    streaming: options.streaming,
    error: options.error,
  };
}

export function updateMessageById(
  messages: RagAssistantMessage[],
  messageId: string,
  updater: (message: RagAssistantMessage) => RagAssistantMessage,
): RagAssistantMessage[] {
  return messages.map((message) => (message.id === messageId ? updater(message) : message));
}

export function createMessageId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
