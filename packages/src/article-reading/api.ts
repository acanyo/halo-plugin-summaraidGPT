import { SUMMARY_API_BASE } from '../article-summary/shared';
import type { ArticleReading, ConversationResponse, ErrorResponse } from './types';

interface InteractionRequest {
  postName: string;
  nodeId: string;
  interactionType: string;
  value: string;
  visitorId: string;
}

export async function fetchExistingArticleReading(postName: string): Promise<ArticleReading> {
  const response = await fetch(
    `${SUMMARY_API_BASE}/articleReadings/${encodeURIComponent(postName)}`,
  );

  const data = (await response.json().catch(() => undefined)) as
    | ArticleReading
    | ErrorResponse
    | undefined;

  if (!response.ok) {
    throw new Error(
      data && 'message' in data && data.message
        ? data.message
        : `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  if (!data || !('spec' in data) || !data.spec) {
    throw new Error((data as ErrorResponse | undefined)?.message || '洞察图谱尚未生成');
  }

  return data as ArticleReading;
}

export async function askArticleReading(question: string, context: string): Promise<string> {
  const conversationHistory = JSON.stringify([
    {
      role: 'user',
      content: `${context}\n\n用户问题：${question}`,
    },
  ]);

  const response = await fetch(`${SUMMARY_API_BASE}/conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conversationHistory }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as ConversationResponse;
  if (data.success === false) {
    throw new Error(data.message || '提问失败');
  }
  return data.response || '';
}

export async function recordReadingInteraction(
  request: InteractionRequest,
): Promise<void> {
  try {
    await fetch(`${SUMMARY_API_BASE}/articleReadingInteractions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.warn('记录洞察图谱互动失败:', error);
  }
}

export function ensureVisitorId(): string {
  const key = 'likcc-article-reading-visitor-id';
  const id = window.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random()}`;
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) {
      return existing;
    }
    window.localStorage.setItem(key, id);
  } catch {
    return id;
  }
  return id;
}
