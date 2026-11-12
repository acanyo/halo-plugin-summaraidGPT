import type { AnswerEvent, SearchDiscovery, SearchOptions, SearchResult, SmartSearchConfig } from './types';

export const SEARCH_API = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1';

export async function fetchSearchConfig(): Promise<SmartSearchConfig> {
  const response = await fetch(`${SEARCH_API}/smartSearchConfig`);
  if (!response.ok) throw new Error('无法读取搜索配置');
  return response.json();
}

async function post(path: string, query: string, options: SearchOptions, mode: string,
  signal: AbortSignal): Promise<Response> {
  const response = await fetch(`${SEARCH_API}/${path}`, {
    method: 'POST', credentials: 'same-origin', signal,
    headers: { 'Content-Type': 'application/json', Accept: path === 'smartSearchAnswer'
      ? 'text/event-stream' : 'application/json' },
    body: JSON.stringify({ query, mode, options }),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('登录后即可使用此功能。');
    if (response.status === 429) throw new Error('请求较频繁，请稍后再试。');
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.detail || (response.status === 403
      ? '当前访问方式不允许使用此功能，请联系站点管理员。' : '搜索暂时不可用，请稍后重试。'));
  }
  return response;
}

export async function search(query: string, mode: string, options: SearchOptions,
  signal: AbortSignal): Promise<SearchResult> {
  return (await post('smartSearch', query, options, mode, signal)).json();
}

export async function discover(options: SearchOptions, excludeIds: string[],
  signal: AbortSignal): Promise<SearchDiscovery> {
  const response = await fetch(`${SEARCH_API}/smartSearchDiscovery`, {
    method: 'POST', credentials: 'same-origin', signal,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ options, excludeIds }),
  });
  if (!response.ok) throw new Error('文章推荐暂时不可用');
  return response.json();
}

export async function answer(query: string, options: SearchOptions, signal: AbortSignal,
  onEvent: (event: AnswerEvent) => void): Promise<void> {
  const response = await post('smartSearchAnswer', query, options, 'semantic', signal);
  if (!response.body) throw new Error('无法读取 AI 解答，请重试。');
  await consumeAnswerStream(response.body, onEvent);
}

export async function consumeAnswerStream(body: ReadableStream<Uint8Array>,
  onEvent: (event: AnswerEvent) => void): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed = false;
  const dispatch = (frame: string) => {
    const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart()).join('\n');
    if (!data) return;
    const event: AnswerEvent = JSON.parse(data);
    if (event.type === 'done' || event.type === 'error') completed = true;
    onEvent(event);
  };
  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() || '';
      frames.forEach(dispatch);
      if (done) break;
    }
    if (buffer.trim()) dispatch(buffer);
    if (!completed) throw new Error('解答连接已中断，请重新生成。');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function safeLink(value: string): string | undefined {
  try {
    const url = new URL(value, location.origin);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href : undefined;
  } catch { return undefined; }
}
