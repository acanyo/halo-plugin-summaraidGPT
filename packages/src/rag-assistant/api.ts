import type {
  RagAskStreamHandlers,
  RagAssistantConfig,
  RagChatStreamEvent,
  RagConversation,
} from './types';
import { DEFAULT_RAG_PET_SPEECH_MESSAGES } from './petdex';
import { DEFAULT_RAG_ASSISTANT_STYLE, normalizeAssistantStyle } from './theme';

export const RAG_API_BASE = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1';
const DEFAULT_FLOATING_OFFSET = 24;
const MAX_FLOATING_OFFSET = 800;
const DEFAULT_ASSISTANT_NAME = '智阅助手';
const DEFAULT_ASSISTANT_AVATAR = '/plugins/summaraidGPT/assets/static/icon.svg';
const DEFAULT_PET_JSON_URL = '/plugins/summaraidGPT/assets/static/pets/default-ikun/pet.json';
const DEFAULT_PET_SPRITESHEET_URL =
  '/plugins/summaraidGPT/assets/static/pets/default-ikun/spritesheet.webp';

const DEFAULT_RAG_ASSISTANT_PET: NonNullable<RagAssistantConfig['pet']> = {
  enabled: true,
  displayName: '鸡哥ikun',
  petJsonUrl: DEFAULT_PET_JSON_URL,
  spritesheetUrl: DEFAULT_PET_SPRITESHEET_URL,
};

export const DEFAULT_RAG_ASSISTANT_CONFIG: RagAssistantConfig = {
  assistantAvatar: DEFAULT_ASSISTANT_AVATAR,
  assistantName: DEFAULT_ASSISTANT_NAME,
  styleConfig: DEFAULT_RAG_ASSISTANT_STYLE,
  buttonPosition: 'right',
  horizontalOffset: DEFAULT_FLOATING_OFFSET,
  verticalOffset: DEFAULT_FLOATING_OFFSET,
  petSpeechMessages: DEFAULT_RAG_PET_SPEECH_MESSAGES,
  pet: DEFAULT_RAG_ASSISTANT_PET,
};

export async function fetchRagAssistantConfig(): Promise<RagAssistantConfig> {
  try {
    const response = await fetch(`${RAG_API_BASE}/dialogConfig`, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as Partial<RagAssistantConfig>;
    return normalizeConfig(data);
  } catch {
    return { ...DEFAULT_RAG_ASSISTANT_CONFIG };
  }
}

export async function askRagStream(
  payload: { question: string; limit?: number; conversationId?: string; visitorId?: string },
  handlers: RagAskStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${RAG_API_BASE}/ragAskStream`, {
    method: 'POST',
    credentials: 'same-origin',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (frame: string) => {
    const data = parseSseFrame(frame);
    if (!data) {
      return;
    }

    const event = JSON.parse(data) as RagChatStreamEvent;
    if (event.type === 'conversation') {
      if (event.conversationId) {
        handlers.onConversationId?.(event.conversationId);
      }
    } else if (event.type === 'sources') {
      handlers.onSources?.(event.sources || []);
    } else if (event.type === 'delta') {
      handlers.onDelta?.(event.delta || '');
    } else if (event.type === 'done') {
      handlers.onDone?.();
    } else if (event.type === 'error') {
      handlers.onError?.(event.error || 'RAG 问答失败');
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() || '';
    frames.forEach(dispatch);
  }

  if (buffer.trim()) {
    dispatch(buffer);
  }
}

export async function fetchRagConversation(
  conversationId: string,
  visitorId: string,
): Promise<RagConversation | undefined> {
  if (!conversationId.trim() || !visitorId.trim()) {
    return undefined;
  }
  const params = new URLSearchParams({ visitorId });
  const response = await fetch(
    `${RAG_API_BASE}/ragConversations/${encodeURIComponent(conversationId)}?${params}`,
    {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    },
  );
  if (response.status === 404 || response.status === 403) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as RagConversation;
}

function normalizeConfig(config: Partial<RagAssistantConfig>): RagAssistantConfig {
  const buttonPosition = String(config.buttonPosition).trim() === 'left' ? 'left' : 'right';

  return {
    ...DEFAULT_RAG_ASSISTANT_CONFIG,
    ...config,
    buttonPosition,
    assistantAvatar: normalizeAvatarUrl(config.assistantAvatar),
    assistantName: normalizeAssistantName(config.assistantName),
    styleConfig: normalizeAssistantStyle(config.styleConfig),
    horizontalOffset: normalizeFloatingOffset(config.horizontalOffset),
    verticalOffset: normalizeFloatingOffset(config.verticalOffset),
    petSpeechMessages:
      normalizeSpeechMessages(config.petSpeechMessages) || DEFAULT_RAG_PET_SPEECH_MESSAGES,
    pet: normalizePetConfig(config.pet) || DEFAULT_RAG_ASSISTANT_PET,
  };
}

function normalizePetConfig(
  pet: Partial<NonNullable<RagAssistantConfig['pet']>> | undefined,
): RagAssistantConfig['pet'] {
  if (!pet || pet.enabled === false) {
    return undefined;
  }
  const spritesheetUrl = pet.spritesheetUrl?.trim();
  if (!spritesheetUrl) {
    return undefined;
  }
  return {
    enabled: true,
    displayName: pet.displayName?.trim() || undefined,
    petJsonUrl: pet.petJsonUrl?.trim() || undefined,
    spritesheetUrl,
  };
}

function normalizeSpeechMessages(messages?: string[]): string[] | undefined {
  if (!Array.isArray(messages)) {
    return undefined;
  }
  const normalized = messages
    .map((message) => `${message || ''}`.trim())
    .filter(Boolean)
    .slice(0, 12);
  return normalized.length ? normalized : undefined;
}

function normalizeAvatarUrl(avatarUrl?: string): string | undefined {
  const value = avatarUrl?.trim();
  if (!value || value.toLowerCase().startsWith('javascript:')) {
    return DEFAULT_ASSISTANT_AVATAR;
  }
  return value;
}

function normalizeFloatingOffset(offset?: number): number {
  const value = Number(offset);
  if (!Number.isFinite(value)) {
    return DEFAULT_FLOATING_OFFSET;
  }
  return Math.round(Math.min(Math.max(value, 0), MAX_FLOATING_OFFSET));
}

function normalizeAssistantName(name?: string): string {
  const value = name?.trim();
  return value || DEFAULT_ASSISTANT_NAME;
}

function parseSseFrame(frame: string): string | undefined {
  const dataLines = frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace(/^data:\s?/, ''));

  return dataLines.length ? dataLines.join('\n') : undefined;
}
