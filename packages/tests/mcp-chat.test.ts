import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UIMessage } from '@halo-dev/ai-foundation-sdk';
import { extractMcpCards, isMcpTool, mcpMessagesForTransport, mcpRows, mcpStructuredValue, mcpTextSources, safeMcpUrl } from '../src/rag-assistant/agent/mcp';

const toolName = 'mcp_0123456789ab_web_search';
const output = { kind: 'mcp', server: '搜索', tool: 'web_search', ok: true,
  content: [{ type: 'text', text: '外部资料' }],
  structuredContent: { results: [{ title: 'Halo 文档', url: 'https://docs.halo.run/' }] } };

function response(events: unknown[]) {
  return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n', {
    headers: { 'Content-Type': 'text/event-stream', 'X-Halo-AI-UI-Message-Stream': 'v1' },
  });
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('MCP chat integration', () => {
  it('extracts clickable sources from plain document results without accepting credential URLs', () => {
    expect(mcpTextSources([{ type: 'text', text: '<url>https://example.com/docs</url> [指南](https://example.com/guide). https://example.com/docs https://user:secret@example.com/private javascript:alert(1)' }]))
      .toEqual(['https://example.com/docs', 'https://example.com/guide']);
  });
  it('keeps image data in local cards while omitting it from subsequent request bodies', () => {
    const messages = [{ id: 'a', role: 'assistant', parts: [{ type: `tool-${toolName}`,
      toolName, toolCallId: 'call-1', state: 'output-available', output: { ...output,
        content: [{ type: 'image', mimeType: 'image/png', data: 'aGVsbG8=' }] },
    }] }] as UIMessage[];
    expect(JSON.stringify(mcpMessagesForTransport(messages))).not.toContain('aGVsbG8=');
    expect(extractMcpCards(messages)[0].content[0].data).toBe('aGVsbG8=');
  });
  it('renders structured results while independently rejecting active URLs and unsafe images', () => {
    const cards = extractMcpCards([{ id: 'a', role: 'assistant', parts: [{
      type: `tool-${toolName}`, toolName, toolCallId: 'call-1', state: 'output-available',
      output: { ...output, content: [
        ...output.content, { type: 'link', url: 'javascript:alert(1)' },
        { type: 'image', mimeType: 'image/svg+xml', data: 'PHN2Zz4=' },
      ] },
    }] }] as UIMessage[]);
    expect(cards[0]).toMatchObject({ title: '搜索 · web_search', status: 'success', content: output.content });
    expect(mcpRows(mcpStructuredValue(cards[0]))).toEqual(output.structuredContent.results);
    expect(safeMcpUrl('https://user:secret@example.com')).toBeUndefined();
    expect(isMcpTool('mcp_arbitrary_browser_tool')).toBe(false);
  });

  it('waits for approval and sends the decision to the server without browser execution or an extra round', async () => {
    vi.stubGlobal('window', new EventTarget());
    const { AgentToolRuntime } = await import('../src/rag-assistant/agent/runtime');
    const { AgentChatClient } = await import('../src/rag-assistant/agent/chat');
    let approve: (value: boolean) => void = () => {};
    const requestApproval = vi.spyOn(AgentToolRuntime.prototype, 'requestApproval')
      .mockImplementation(() => new Promise(resolve => { approve = resolve; }));
    const execute = vi.spyOn(AgentToolRuntime.prototype, 'execute');
    const bodies: Record<string, unknown>[] = [];
    const fetch = vi.fn(async (_url: unknown, init: RequestInit) => {
      bodies.push(JSON.parse(String(init.body)));
      if (bodies.length === 1) return response([
        { type: 'start', messageId: 'a1' },
        { type: 'tool-input-available', toolCallId: 'c1', toolName, input: { query: 'Halo' } },
        { type: 'tool-approval-request', approvalId: 'approval-1', toolCallId: 'c1', toolName, input: { query: 'Halo' } },
        { type: 'finish' },
      ]);
      return response([
        { type: 'start', messageId: 'a1' },
        { type: 'tool-output-available', toolCallId: 'c1', toolName, output },
        { type: 'text-start', id: 't' }, { type: 'text-delta', id: 't', delta: '根据资料回答。' },
        { type: 'text-end', id: 't' }, { type: 'finish' },
      ]);
    });
    vi.stubGlobal('fetch', fetch);
    const onToolResults = vi.fn();
    const request = new AgentChatClient().sendMessage('找 Halo 资料', {}, { onToolResults });
    await vi.waitFor(() => expect(requestApproval).toHaveBeenCalledOnce());
    expect(fetch).toHaveBeenCalledOnce();
    expect(execute).not.toHaveBeenCalled();
    approve(true);
    const messages = await request;
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(bodies[1])).toContain('approval-responded');
    expect(JSON.stringify(bodies[1])).toContain('"approved":true');
    expect(JSON.stringify(messages)).not.toContain('当前页面没有启用这个浏览器能力');
    expect(onToolResults).toHaveBeenLastCalledWith([expect.objectContaining({ status: 'success' })]);
    expect(execute).not.toHaveBeenCalled();
  });
});
