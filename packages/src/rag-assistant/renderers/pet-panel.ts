import { html, nothing, type TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { closeIcon, newChatIcon, questionAnswerIcon, sendIcon } from '../icons';
import { markdownToHtml } from '../format';
import { renderSourceList } from '../source-list';
import { renderTyping } from './common';
import type { RagAssistantMessage } from '../types';

export interface PetPanelRenderOptions {
  assistantName: string;
  streaming: boolean;
  selectedContext: string;
  selectedContextPreview: string;
  latestAssistant?: RagAssistantMessage;
  latestUser?: RagAssistantMessage;
  petSourcesOpen: boolean;
  input: string;
  petInputPlaceholder: string;
  hasConversation: boolean;
  truncateText: (value: string, maxLength: number) => string;
  onOpenStage: () => void;
  onNewConversation: () => void;
  onClearSelectedContext: () => void;
  onTogglePetSources: () => void;
  onSubmit: (event: Event) => void;
  onInput: (event: Event) => void;
  onKeydown: (event: KeyboardEvent) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
}

export function renderPetPanel(options: PetPanelRenderOptions): TemplateResult {
  const latestAssistant = options.latestAssistant;
  const latestUser = options.latestUser;

  return html`
    <section class="pet-panel" aria-label="宠物问答">
      <div class="pet-panel-head">
        <div class="pet-panel-title">
          <span class="pet-panel-kicker">${options.assistantName}</span>
          <strong>${options.streaming ? '正在找答案' : '想问我什么？'}</strong>
        </div>
        <div class="pet-panel-actions">
          <button class="pet-panel-action is-primary" type="button" @click=${options.onOpenStage}>
            ${questionAnswerIcon()} 全屏
          </button>
          ${options.hasConversation
            ? html`
                <button class="pet-panel-action" type="button" @click=${options.onOpenStage}>
                  ${questionAnswerIcon()} 会话
                </button>
              `
            : nothing}
          <button class="pet-panel-action" type="button" @click=${options.onNewConversation}>
            ${newChatIcon()} 新聊
          </button>
        </div>
      </div>

      ${options.selectedContext
        ? html`
            <div class="pet-context">
              <span>选中内容</span>
              <p>${options.selectedContextPreview}</p>
              <button type="button" title="移除选中内容" @click=${options.onClearSelectedContext}>
                ${closeIcon()}
              </button>
            </div>
          `
        : nothing}

      ${latestAssistant
        ? renderLatestAnswer(options, latestAssistant, latestUser)
        : html`<div class="pet-panel-empty">我在这里，直接问就行。</div>`}

      <form class="pet-composer" @submit=${options.onSubmit}>
        <textarea
          class="pet-composer-input"
          rows="1"
          .value=${options.input}
          placeholder=${options.petInputPlaceholder}
          ?disabled=${options.streaming}
          @input=${options.onInput}
          @keydown=${options.onKeydown}
          @compositionstart=${options.onCompositionStart}
          @compositionend=${options.onCompositionEnd}
        ></textarea>
        <button class="pet-send" type="submit" ?disabled=${options.streaming || !options.input.trim()} aria-label="发送">
          ${sendIcon()}
        </button>
      </form>
    </section>
  `;
}

function renderLatestAnswer(
  options: PetPanelRenderOptions,
  latestAssistant: RagAssistantMessage,
  latestUser?: RagAssistantMessage,
): TemplateResult {
  const sources = latestAssistant.sources || [];

  return html`
    <div class=${latestAssistant.error ? 'pet-answer error' : 'pet-answer'}>
      <div class="pet-answer-meta">
        <span>${latestUser ? options.truncateText(latestUser.content, 32) : '最新回复'}</span>
        <time>${latestAssistant.time}</time>
      </div>
      <div class="pet-answer-body markdown-body">
        ${unsafeHTML(markdownToHtml(latestAssistant.content || '正在思考中...'))}
        ${latestAssistant.streaming ? renderTyping() : nothing}
      </div>
      ${sources.length
        ? html`
            <button class="pet-source-link" type="button" @click=${options.onTogglePetSources}>
              ${questionAnswerIcon()} ${sources.length} 个参考来源
            </button>
            ${options.petSourcesOpen
              ? html`<div class="pet-compact-sources">${renderSourceList(sources)}</div>`
              : nothing}
          `
        : nothing}
    </div>
  `;
}
