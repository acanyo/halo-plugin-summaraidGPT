import { describe, expect, it } from 'vitest';
import {
  applyUIMessageChunk,
  createUIMessageReducer,
  DefaultChatTransport,
  type UIMessageChunk,
} from '@halo-dev/ai-foundation-sdk';
import { AgentChatTransport, AgentToolStreamError } from '../src/rag-assistant/agent/transport';

function responseFor(events: unknown[], traceId = 'trace-37'): Response {
  const body = events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('')
    + 'data: [DONE]\n\n';
  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'X-Halo-AI-UI-Message-Stream': 'v1',
      'X-SummaraidGPT-Trace-Id': traceId,
    },
  });
}

async function collect(transport: DefaultChatTransport): Promise<UIMessageChunk[]> {
  const stream = await transport.sendMessages({
    chatId: 'test-chat',
    messages: [],
    trigger: 'submit-message',
  });
  const chunks: UIMessageChunk[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

const start = { type: 'tool-input-start', toolCallId: 'call-1', toolName: 'get_pages' };
const delta = { type: 'tool-input-delta', toolCallId: 'call-1', inputTextDelta: '{}' };

describe('Agent chat tool stream compatibility', () => {
  it('reproduces the reported SDK error when a subsequent event omits the tool name', async () => {
    const chunks = await collect(new DefaultChatTransport({
      fetch: async () => responseFor([start, delta]),
    }));
    const reducer = createUIMessageReducer();
    applyUIMessageChunk(reducer, chunks[0]!);
    expect(() => applyUIMessageChunk(reducer, chunks[1]!))
      .toThrow('tool name must be a simple identifier.');
  });

  it('restores the name for deltas and results so the SDK can reduce the complete call', async () => {
    const chunks = await collect(new AgentChatTransport({
      fetch: async () => responseFor([
        start,
        delta,
        { type: 'tool-input-available', toolCallId: 'call-1', input: {} },
        { type: 'tool-output-available', toolCallId: 'call-1', output: { pages: [] } },
        { type: 'finish' },
      ]),
    }));
    const reducer = createUIMessageReducer();
    chunks.forEach(chunk => applyUIMessageChunk(reducer, chunk));
    expect(reducer.message.parts).toEqual([
      expect.objectContaining({
        toolName: 'get_pages',
        toolCallId: 'call-1',
        state: 'output-available',
        output: { pages: [] },
      }),
    ]);
  });

  it('keeps interleaved tool calls separate', async () => {
    const chunks = await collect(new AgentChatTransport({
      fetch: async () => responseFor([
        start,
        { ...start, toolCallId: 'call-2', toolName: 'get_tags' },
        { ...delta, toolCallId: 'call-2' },
        delta,
      ]),
    }));
    expect(chunks.slice(2)).toEqual([
      { ...delta, toolCallId: 'call-2', toolName: 'get_tags' },
      { ...delta, toolName: 'get_pages' },
    ]);
  });

  it('reports missing names with the exact event, call ID and trace ID', async () => {
    const transport = new AgentChatTransport({ fetch: async () => responseFor([delta]) });
    await expect(collect(transport)).rejects.toMatchObject({
      name: 'AgentToolStreamError',
      reason: 'missing-name',
      details: {
        eventType: 'tool-input-delta',
        eventIndex: 1,
        toolName: undefined,
        toolCallId: 'call-1',
        traceId: 'trace-37',
      },
    });
  });

  it.each(['functions.get_pages', 'get pages', '123tool', 42])(
    'reports an invalid tool name without guessing another tool: %s', async (toolName) => {
      const transport = new AgentChatTransport({
        fetch: async () => responseFor([{ ...start, toolName }]),
      });
      await expect(collect(transport)).rejects.toMatchObject({
        reason: 'invalid-name',
        details: { toolName },
      });
    },
  );

  it('rejects name changes for an existing call', async () => {
    const transport = new AgentChatTransport({
      fetch: async () => responseFor([start, { ...delta, toolName: 'submit_comment' }]),
    });
    await expect(collect(transport)).rejects.toMatchObject({ reason: 'conflicting-name' });
  });

  it('does not reuse tool identities from a previous response', async () => {
    let requestCount = 0;
    const transport = new AgentChatTransport({
      fetch: async () => responseFor(requestCount++ === 0 ? [start] : [delta]),
    });
    await collect(transport);
    await expect(collect(transport)).rejects.toMatchObject({ reason: 'missing-name' });
  });

  it('preserves text and server error events', async () => {
    const events = [
      { type: 'text-start', id: 'text-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Hello' },
      { type: 'error', errorText: 'Model unavailable' },
    ];
    expect(await collect(new AgentChatTransport({ fetch: async () => responseFor(events) })))
      .toEqual(events);
  });

  it('shows diagnostic metadata as literal text without including tool arguments', async () => {
    const toolName = '[bad](https://example.com)';
    try {
      await collect(new AgentChatTransport({
        fetch: async () => responseFor([{
          ...start,
          toolName,
          input: { apiKey: 'private-test-value' },
        }]),
      }));
      expect.fail('Expected the invalid tool name to be rejected');
    } catch (error) {
      expect(error).toBeInstanceOf(AgentToolStreamError);
      const failure = error as AgentToolStreamError;
      expect(failure.message).toContain('工具名格式无效');
      expect(failure.message).toContain('追踪 ID');
      expect(failure.message).toContain(toolName);
      expect(failure.message).not.toContain('private-test-value');
      expect(failure.details.toolName).toBe(toolName);
    }
  });
});
