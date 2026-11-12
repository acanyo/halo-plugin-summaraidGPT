import { afterEach, describe, expect, it, vi } from 'vitest';
import { conversationModelHistory, restoredMcpCards } from '../src/rag-assistant/agent/mcp-history';
import { fetchMcpCapabilities } from '../src/rag-assistant/agent/mcp-capabilities';

afterEach(() => vi.unstubAllGlobals());
describe('MCP history and capability entry', () => {
  it('restores validated result cards and supplies facts for follow-up without replaying approvals or images', () => {
    const cards = [{ id: 'c1', title: '文档 · 搜索', status: 'success', content: [
      { type: 'text', text: '验收代号 MCP-42' },
      { type: 'link', url: 'https://example.com/docs', title: '来源' },
      { type: 'link', url: 'javascript:alert(1)' },
      { type: 'image', mimeType: 'image/png', data: 'aGVsbG8=' },
    ], structuredJson: JSON.stringify([{ title: '来源', url: 'https://example.com/docs' }]) }, { id: 'c2', title: '待确认', status: 'approval', content: [] }];
    const restored = restoredMcpCards(cards);
    expect(restored[0].content).toHaveLength(3);
    expect(restored[0].structuredContent).toEqual([{ title: '来源', url: 'https://example.com/docs' }]);
    expect(restored[1]).toMatchObject({ status: 'cancelled' });
    const history = conversationModelHistory([{ id: 'a1', role: 'assistant', content: '', toolResults: cards as never }]);
    expect(JSON.stringify(history)).toContain('MCP-42');
    expect(JSON.stringify(history)).not.toMatch(/aGVsbG8|approval-requested|toolCallId|javascript:/);
    expect(history[0].parts.every(part => part.type === 'text')).toBe(true);
    expect(restoredMcpCards([null, {}, { title: '无标识' }])).toEqual([]);
  });
  it('handles capability endpoint failures without affecting chat and bounds published entries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await fetchMcpCapabilities()).toEqual([]);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(Array.from({ length: 20 }, (_, i) =>
      ({ id: `${i}`, title: '文档', prompt: '查询资料', service: '服务', approval: true }))))));
    expect(await fetchMcpCapabilities()).toHaveLength(12);
  });
});
