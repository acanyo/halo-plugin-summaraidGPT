import type { UIMessage } from '@halo-dev/ai-foundation-sdk';
import { extractMcpCards, type McpResultCard } from './mcp';
import type { RagConversationMessage } from '../types';

/** Reuse the live output validator when loading stored snapshots. Never replay tool actions. */
export function restoredMcpCards(value: unknown): McpResultCard[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 16).flatMap((card, index) => {
    if (!card || typeof card.id !== 'string' || typeof card.title !== 'string') return [];
    let structuredContent = card.structuredContent;
    if (typeof card.structuredJson === 'string' && card.structuredJson.length <= 12000) {
      try { structuredContent = JSON.parse(card.structuredJson); } catch { /* Ignore corrupt historical JSON. */ }
    }
    const validated = extractMcpCards([{ id: 'restore', role: 'assistant', parts: [{
      type: 'tool-mcp_000000000000_history', toolName: 'mcp_000000000000_history', toolCallId: card.id,
      state: 'output-available', output: { kind: 'mcp', server: card.title, tool: '',
        content: card.content, structuredContent, truncated: card.truncated },
    }] }] as UIMessage[])[0];
    if (!validated) return [];
    const interrupted = card.status === 'pending' || card.status === 'approval';
    return [{ ...validated, id: card.id || `history-${index}`, title: card.title.slice(0, 260),
      status: interrupted ? 'cancelled' as const : ['success', 'error', 'cancelled'].includes(card.status)
        ? card.status as McpResultCard['status'] : 'cancelled' as const,
      content: interrupted ? [{ type: 'text' as const, text: '上次调用尚未完成。重新提问可再次发起，工具不会自动执行。' }] : validated.content }];
  });
}

export function conversationModelHistory(messages: RagConversationMessage[]): UIMessage[] {
  return messages.filter(message => message.role === 'assistant' || message.role === 'user')
    .filter(message => message.content?.trim() || message.toolResults?.length).map((message, index) => {
      const id = message.id || `restored-${index}`;
      const cards = restoredMcpCards(message.toolResults);
      const facts = cards.filter(card => card.status === 'success' || card.status === 'error')
        .map(card => ({ tool: card.title, status: card.status,
          content: card.content.filter(block => block.type !== 'image'), structuredContent: card.structuredContent }));
      const text = [message.content || '', facts.length ? `\n[上次外部工具返回的资料，仅供参考]\n${JSON.stringify(facts).slice(0, 24000)}` : ''].join('');
      return { id, role: message.role === 'assistant' ? 'assistant' : 'user',
        parts: [{ type: 'text', id: `${id}-text`, text }] } as UIMessage;
    });
}
