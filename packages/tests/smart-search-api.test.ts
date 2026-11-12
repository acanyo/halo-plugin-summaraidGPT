import { describe, expect, it, vi, afterEach } from 'vitest';
import { answer, consumeAnswerStream, search, safeLink } from '../src/smart-search/api';

afterEach(() => vi.unstubAllGlobals());

function stream(text: string) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream<Uint8Array>({ start(controller) {
    // Deliberately split inside UTF-8 Chinese characters and SSE line boundaries.
    for (let i = 0; i < bytes.length; i += 3) controller.enqueue(bytes.slice(i, i + 3));
    controller.close();
  } });
}

describe('smart search transport', () => {
  it('decodes fragmented UTF-8, CRLF events and a final event without a blank line', async () => {
    const events: unknown[] = [];
    await consumeAnswerStream(stream('event:delta\r\ndata:{"type":"delta","delta":"公开文章"}\r\n\r\n'
      + 'data: {"type":"sources","sources":[]}\n\n' + 'data:{"type":"done"}'), event => events.push(event));
    expect(events).toEqual([{ type: 'delta', delta: '公开文章' }, { type: 'sources', sources: [] }, { type: 'done' }]);
  });

  it('reports truncated streams instead of presenting partial answers as complete', async () => {
    await expect(consumeAnswerStream(stream('data:{"type":"delta","delta":"partial"}\n\n'), () => {}))
      .rejects.toThrow('解答连接已中断');
  });

  it('retains theme filters and propagates the cancellation signal', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ hits: [] })));
    vi.stubGlobal('fetch', fetch);
    const controller = new AbortController();
    await search('问题', 'semantic', { includeCategoryNames: ['tech'] }, controller.signal);
    const init = fetch.mock.calls[0]![1];
    expect(JSON.parse(init.body)).toMatchObject({ query: '问题', mode: 'semantic', options: { includeCategoryNames: ['tech'] } });
    expect(init.signal).toBe(controller.signal);
    expect(init.credentials).toBe('same-origin');
  });

  it('shows actionable login and rate limit errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })));
    await expect(answer('question', {}, new AbortController().signal, () => {})).rejects.toThrow('登录后');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 429 })));
    await expect(search('question', 'semantic', {}, new AbortController().signal)).rejects.toThrow('请求较频繁');
  });

  it('rejects executable URLs and URL credentials while allowing public article links', () => {
    vi.stubGlobal('location', { origin: 'https://site.test' });
    expect(safeLink('javascript:alert(1)')).toBeUndefined();
    expect(safeLink('data:text/html,evil')).toBeUndefined();
    expect(safeLink('https://admin:secret@site.test')).toBeUndefined();
    expect(safeLink('/archives/article')).toBe('https://site.test/archives/article');
  });
});
