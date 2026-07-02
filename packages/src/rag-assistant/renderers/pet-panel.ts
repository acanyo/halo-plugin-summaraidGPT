import { html, nothing, type TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {
  closeIcon,
  copyIcon,
  fullscreenIcon,
  newChatIcon,
  questionAnswerIcon,
  retryIcon,
  sendIcon,
  stopIcon,
} from '../icons';
import { markdownToHtml } from '../format';
import { renderSourceList } from '../source-list';
import { renderTyping } from './common';
import type { RagAssistantMessage } from '../types';

export interface PetPanelRenderOptions {
  assistantName: string;
  assistantAvatar?: string;
  avatarFallbackText: string;
  streaming: boolean;
  statusText: string;
  selectedContext: string;
  selectedContextPreview: string;
  messages: RagAssistantMessage[];
  welcomeMessage: string;
  quickQuestions: string[];
  input: string;
  petInputPlaceholder: string;
  panelStyle: string;
  resizing: boolean;
  onOpenStage: () => void;
  onResizePointerDown: (event: PointerEvent) => void;
  onNewConversation: () => void;
  onUsePrompt: (prompt: string) => void;
  onStop: () => void;
  onCopyMessage: (message: RagAssistantMessage) => void;
  onRetryMessage: (message: RagAssistantMessage) => void;
  onClearSelectedContext: () => void;
  onSubmit: (event: Event) => void;
  onInput: (event: Event) => void;
  onKeydown: (event: KeyboardEvent) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
}

export function renderPetPanel(options: PetPanelRenderOptions): TemplateResult {
  return html`
    <section
      class=${options.resizing ? 'pet-panel resizing' : 'pet-panel'}
      style=${options.panelStyle}
      aria-label="宠物问答"
    >
      <button
        class="pet-panel-resize"
        type="button"
        title="拖拽调整高度"
        aria-label="拖拽调整对话框高度"
        @pointerdown=${options.onResizePointerDown}
      ></button>
      <div class="pet-panel-head">
        <div class="pet-panel-title-wrap">
          ${renderPanelAvatar(options)}
          <div class="pet-panel-title">
            <span class="pet-panel-kicker">${options.assistantName}</span>
            <strong>${options.statusText}</strong>
          </div>
        </div>
        <div class="pet-panel-actions">
          <button
            class="pet-panel-action is-primary"
            type="button"
            title="全屏会话"
            aria-label="全屏会话"
            data-tooltip="全屏会话"
            @click=${options.onOpenStage}
          >
            ${fullscreenIcon()}
          </button>
          <button
            class="pet-panel-action"
            type="button"
            title="新会话"
            aria-label="新会话"
            data-tooltip="新会话"
            @click=${options.onNewConversation}
          >
            ${newChatIcon()}
          </button>
          ${options.streaming
            ? html`
                <button
                  class="pet-panel-action is-danger"
                  type="button"
                  title="停止生成"
                  aria-label="停止生成"
                  data-tooltip="停止生成"
                  @click=${options.onStop}
                >
                  ${stopIcon()}
                </button>
              `
            : nothing}
        </div>
      </div>

      <div class="pet-panel-content">
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

        ${options.messages.length
          ? renderPanelThread(options)
          : renderPanelWelcome(options)}
      </div>

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

function renderPanelAvatar(options: PetPanelRenderOptions): TemplateResult {
  const avatarUrl = options.assistantAvatar?.trim();
  return html`
    <span class=${avatarUrl ? 'pet-panel-avatar has-image' : 'pet-panel-avatar'} aria-hidden="true">
      <span class="pet-panel-avatar-fallback">${options.avatarFallbackText}</span>
      ${avatarUrl
        ? html`
            <img
              class="pet-panel-avatar-image"
              src=${avatarUrl}
              alt=""
              @error=${handlePanelAvatarImageError}
            />
          `
        : nothing}
    </span>
  `;
}

function handlePanelAvatarImageError(event: Event): void {
  const image = event.currentTarget;
  if (!(image instanceof HTMLImageElement)) {
    return;
  }
  image.parentElement?.classList.remove('has-image');
  image.remove();
}

function renderPanelWelcome(options: PetPanelRenderOptions): TemplateResult {
  return html`
    <div class="pet-panel-empty">
      <p class="pet-panel-welcome">${options.welcomeMessage}</p>
      ${options.quickQuestions.length
        ? html`
            <div class="pet-panel-quick">
              ${options.quickQuestions.map((prompt) => html`
                <button type="button" @click=${() => options.onUsePrompt(prompt)}>
                  ${questionAnswerIcon()}<span>${prompt}</span>
                </button>
              `)}
            </div>
          `
        : nothing}
    </div>
  `;
}

function renderPanelThread(options: PetPanelRenderOptions): TemplateResult {
  return html`
    <div class="pet-panel-thread" aria-live="polite">
      ${options.messages.map((message) => renderPanelMessage(message, options))}
    </div>
  `;
}

function renderPanelMessage(
  message: RagAssistantMessage,
  options: PetPanelRenderOptions,
): TemplateResult {
  const sources = message.sources || [];
  const content = message.content || (message.streaming ? '正在思考中...' : '');

  return html`
    <article class=${`pet-panel-message ${message.role}`}>
      <div class="pet-panel-message-meta">
        <span>${message.role === 'user' ? '我' : '助手'}</span>
        <time>${message.time}</time>
        <span class="pet-message-actions">
          <button type="button" title="复制" @click=${() => options.onCopyMessage(message)}>
            ${copyIcon()}
          </button>
          <button
            type="button"
            title=${message.role === 'assistant' ? '重新生成' : '再次发送'}
            ?disabled=${options.streaming}
            @click=${() => options.onRetryMessage(message)}
          >
            ${retryIcon()}
          </button>
        </span>
      </div>
      <div class=${`pet-panel-bubble${message.error ? ' error' : ''}${message.streaming ? ' streaming' : ''}`}>
        ${message.role === 'assistant' && !message.error
          ? html`<div class="markdown-body">${unsafeHTML(markdownToHtml(content))}</div>`
          : html`<span class="message-text">${content}</span>`}
        ${message.streaming ? renderTyping() : nothing}
      </div>
      ${sources.length
        ? html`
            <details class="pet-panel-sources">
              <summary>${questionAnswerIcon()} ${sources.length} 个关联资源</summary>
              ${renderSourceList(sources)}
            </details>
          `
        : nothing}
    </article>
  `;
}
