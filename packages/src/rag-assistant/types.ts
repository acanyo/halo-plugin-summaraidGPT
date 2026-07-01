import type { AgentRuntimeConfig } from './agent/types';

export interface RagAssistantConfig {
  assistantAvatar?: string;
  assistantName: string;
  styleConfig: RagAssistantStyleConfig;
  buttonPosition: 'left' | 'right';
  horizontalOffset: number;
  verticalOffset: number;
  petSize: number;
  petSpeechMessages?: string[];
  pet?: RagAssistantPetConfig;
  agent?: AgentRuntimeConfig;
}

export interface RagAssistantPetConfig {
  enabled: boolean;
  displayName?: string;
  petJsonUrl?: string;
  spritesheetUrl: string;
}

export interface RagAssistantStyleConfig {
  stylePreset: 'default' | 'graphite' | 'ocean' | 'forest' | 'rose' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: 'standard' | 'soft' | 'round';
  colorMode: 'auto' | 'light' | 'dark';
}

export interface RagSourceReference {
  id: string;
  documentName?: string;
  sourceName?: string;
  sourceType?: string;
  title?: string;
  url?: string;
  score?: number;
  chunkCount?: number;
  chunkIndexes?: string[];
  sourceIds?: string[];
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface RagConversationMessage {
  id?: string;
  role?: 'assistant' | 'user' | string;
  content?: string;
  createdAt?: string;
  sources?: RagSourceReference[];
  error?: boolean;
}

export interface RagConversation {
  metadata: {
    name: string;
    creationTimestamp?: string;
  };
  spec?: {
    knowledgeBase?: string;
    visitorId?: string;
    title?: string;
    messages?: RagConversationMessage[];
  };
  status?: {
    messageCount?: number;
    lastMessageAt?: string;
  };
}

export interface RagChatStreamEvent {
  type?: 'conversation' | 'sources' | 'delta' | 'done' | 'error' | string;
  delta?: string;
  sources?: RagSourceReference[];
  error?: string;
  conversationId?: string;
}

export interface RagAskStreamHandlers {
  onConversationId?: (conversationId: string) => void;
  onSources?: (sources: RagSourceReference[]) => void;
  onDelta?: (delta: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export interface RagAssistantMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  time: string;
  sources?: RagSourceReference[];
  streaming?: boolean;
  error?: boolean;
}

export interface SelectionPopupState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}
