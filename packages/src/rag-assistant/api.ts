import type {
  RagAskStreamHandlers,
  RagAssistantConfig,
  RagChatStreamEvent,
  RagConversation,
} from './types';
import {
  DEFAULT_RAG_PET_SIZE,
  DEFAULT_RAG_PET_SPEECH_MESSAGES,
  MAX_RAG_PET_SIZE,
  MIN_RAG_PET_SIZE,
} from './petdex';
import { normalizeAgentRuntimeConfig } from './agent/normalize';
import { DEFAULT_RAG_ASSISTANT_STYLE, normalizeAssistantStyle } from './theme';

export const RAG_API_BASE = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1';
const DEFAULT_FLOATING_OFFSET = 24;
const MAX_FLOATING_OFFSET = 800;
const MAX_WELCOME_MESSAGE_CHARS = 260;
const MAX_QUICK_QUESTION_CHARS = 80;
const DEFAULT_ASSISTANT_NAME = '智阅助手';
const DEFAULT_ASSISTANT_AVATAR = '/plugins/summaraidGPT/assets/static/icon.svg';
const DEFAULT_WELCOME_MESSAGE =
  '你好，我是 {assistantName}。\n我可以帮你检索站内知识库、总结当前页，也可以带你打开相关页面。';
const DEFAULT_QUICK_QUESTIONS = [
  '关于博主是谁？',
  '最近更新了什么？',
  '帮我总结当前页',
  '有哪些值得先读的内容？',
];
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
  displayMode: 'assistant',
  welcomeMessage: DEFAULT_WELCOME_MESSAGE.replace('{assistantName}', DEFAULT_ASSISTANT_NAME),
  quickQuestions: DEFAULT_QUICK_QUESTIONS,
  styleConfig: DEFAULT_RAG_ASSISTANT_STYLE,
  buttonPosition: 'right',
  horizontalOffset: DEFAULT_FLOATING_OFFSET,
  verticalOffset: DEFAULT_FLOATING_OFFSET,
  petSize: DEFAULT_RAG_PET_SIZE,
  petSpeechMessages: DEFAULT_RAG_PET_SPEECH_MESSAGES,
  pet: DEFAULT_RAG_ASSISTANT_PET,
  access: {
    mode: 'anonymous_chat_agent',
    allowAnonymous: true,
    agentAllowed: true,
    authenticated: false,
  },
  agent: normalizeAgentRuntimeConfig(undefined),
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
    displayMode: normalizeDisplayMode(config.displayMode),
    welcomeMessage: normalizeWelcomeMessage(config.welcomeMessage, config.assistantName),
    quickQuestions:
      normalizeStringList(config.quickQuestions, 8, MAX_QUICK_QUESTION_CHARS)
      || DEFAULT_QUICK_QUESTIONS,
    styleConfig: normalizeAssistantStyle(config.styleConfig),
    horizontalOffset: normalizeFloatingOffset(config.horizontalOffset),
    verticalOffset: normalizeFloatingOffset(config.verticalOffset),
    petSize: normalizePetSize(config.petSize),
    petSpeechMessages:
      normalizeStringList(config.petSpeechMessages, 12) || DEFAULT_RAG_PET_SPEECH_MESSAGES,
    pet: normalizePetConfig(config.pet) || DEFAULT_RAG_ASSISTANT_PET,
    access: normalizeAccessConfig(config.access),
    agent: normalizeAgentRuntimeConfig(config.agent),
  };
}

function normalizeAccessConfig(
  access: Partial<RagAssistantConfig['access']> | undefined,
): RagAssistantConfig['access'] {
  const mode = normalizeAccessMode(access?.mode);
  return {
    mode,
    allowAnonymous: mode === 'anonymous_chat' || mode === 'anonymous_chat_agent',
    agentAllowed: mode === 'anonymous_chat_agent' || mode === 'authenticated_chat_agent',
    authenticated: access?.authenticated === true,
  };
}

function normalizeAccessMode(mode?: string): RagAssistantConfig['access']['mode'] {
  if (
    mode === 'anonymous_chat'
    || mode === 'anonymous_chat_agent'
    || mode === 'authenticated_chat'
    || mode === 'authenticated_chat_agent'
  ) {
    return mode;
  }
  return 'anonymous_chat_agent';
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

function normalizeStringList(
  messages?: string[],
  maxItems = 12,
  maxItemLength = 120,
): string[] | undefined {
  if (!Array.isArray(messages)) {
    return undefined;
  }
  const normalized = messages
    .map((message) => `${message || ''}`.trim())
    .filter(Boolean)
    .map((message) => message.slice(0, maxItemLength))
    .slice(0, maxItems);
  return normalized.length ? normalized : undefined;
}

function normalizeWelcomeMessage(message: string | undefined, assistantName: string | undefined): string {
  const normalized = normalizeTextBlock(message, MAX_WELCOME_MESSAGE_CHARS) || DEFAULT_WELCOME_MESSAGE;
  return normalized.replace('{assistantName}', normalizeAssistantName(assistantName));
}

function normalizeTextBlock(value: string | undefined, maxLength: number): string | undefined {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }
  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
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

function normalizePetSize(size?: number): number {
  const value = Number(size);
  if (!Number.isFinite(value)) {
    return DEFAULT_RAG_PET_SIZE;
  }
  return Math.round(Math.min(Math.max(value, MIN_RAG_PET_SIZE), MAX_RAG_PET_SIZE));
}

function normalizeAssistantName(name?: string): string {
  const value = name?.trim();
  return value || DEFAULT_ASSISTANT_NAME;
}

function normalizeDisplayMode(mode?: string): RagAssistantConfig['displayMode'] {
  return mode === 'petOnly' ? 'petOnly' : 'assistant';
}

function parseSseFrame(frame: string): string | undefined {
  const dataLines = frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace(/^data:\s?/, ''));

  return dataLines.length ? dataLines.join('\n') : undefined;
}
