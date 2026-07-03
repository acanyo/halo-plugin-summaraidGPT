import './rag-assistant/widget';
import type { RagAssistantWidget } from './rag-assistant/widget';

declare global {
  interface Window {
    likcc_summaraidGPT_ragAssistantLoaded?: boolean;
    likcc_summaraidGPT_initRagAssistant?: () => Promise<RagAssistantWidget | undefined>;
    likcc_summaraidGPT_openRagAssistant?: (question?: string) => Promise<void>;
  }
}

const RAG_ASSISTANT_TAG = 'summaraid-rag-assistant';

function printBanner(): void {
  if (window.likcc_summaraidGPT_ragAssistantLoaded) {
    return;
  }

  console.log('%c智阅GPT-前台智能助手', 'color: #1f1f1f; font-size: 16px; font-weight: bold;');
  console.log('%c支持宠物陪伴、知识库问答和 Agent 工具调用', 'color: #8a6f38; font-size: 12px;');
  window.likcc_summaraidGPT_ragAssistantLoaded = true;
}

async function mountRagAssistant(): Promise<RagAssistantWidget | undefined> {
  if (!document.body) {
    return undefined;
  }

  const existing = document.querySelector<RagAssistantWidget>(RAG_ASSISTANT_TAG);
  if (existing) {
    return existing;
  }

  const assistant = document.createElement(RAG_ASSISTANT_TAG) as RagAssistantWidget;
  document.body.appendChild(assistant);
  return assistant;
}

async function openRagAssistant(question?: string): Promise<void> {
  const assistant = await mountRagAssistant();
  assistant?.openAssistant(question);
}

function scheduleMount(): void {
  window.setTimeout(() => {
    void mountRagAssistant();
  }, 0);
}

printBanner();

window.likcc_summaraidGPT_initRagAssistant = mountRagAssistant;
window.likcc_summaraidGPT_openRagAssistant = openRagAssistant;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleMount, { once: true });
} else {
  scheduleMount();
}
