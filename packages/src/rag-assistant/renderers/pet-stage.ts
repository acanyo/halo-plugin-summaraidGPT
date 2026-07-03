import { html, nothing, type TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { RAG_INPUT_PLACEHOLDER } from '../constants';
import {
  closeIcon,
  copyIcon,
  focusIcon,
  newChatIcon,
  questionAnswerIcon,
  retryIcon,
  sendIcon,
  stopIcon,
} from '../icons';
import { markdownToHtml } from '../format';
import { renderSourceList } from '../source-list';
import { renderTyping } from './common';
import type { RagAssistantMessage, RagSourceReference } from '../types';

export interface PetStageRenderOptions {
  assistantName: string;
  assistantAvatar?: string;
  avatarFallbackText: string;
  messages: RagAssistantMessage[];
  statusText: string;
  welcomeMessage: string;
  welcomeTime: string;
  quickQuestions: string[];
  input: string;
  inputPlaceholder: string;
  streaming: boolean;
  hasSources: boolean;
  isSourceReferencesOpen: (messageId: string) => boolean;
  onToggleSourceReferences: (messageId: string, event: Event) => void;
  onClose: () => void;
  onNewConversation: () => void;
  onExpandLatestSources: () => void;
  onUsePrompt: (prompt: string) => void;
  onStop: () => void;
  onCopyMessage: (message: RagAssistantMessage) => void;
  onRetryMessage: (message: RagAssistantMessage) => void;
  onSubmit: (event: Event) => void;
  onInput: (event: Event) => void;
  onKeydown: (event: KeyboardEvent) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
}

export function renderPetStage(options: PetStageRenderOptions): TemplateResult {
  return html`
    <div class="pet-stage-backdrop" @click=${options.onClose}></div>
    <section class="pet-stage" role="dialog" aria-label=${`${options.assistantName} 会话`}>
      <header class="pet-stage-head">
        <div class="pet-stage-title">
          <span>${options.assistantName}</span>
          <strong>${options.statusText}</strong>
        </div>
        <div class="pet-stage-actions">
          <button
            class="pet-stage-action"
            type="button"
            ?disabled=${!options.hasSources}
            @click=${options.onExpandLatestSources}
          >
            ${questionAnswerIcon()} 关联资源
          </button>
          <button class="pet-stage-action" type="button" @click=${options.onNewConversation}>
            ${newChatIcon()} 新聊
          </button>
          ${options.streaming
            ? html`
                <button class="pet-stage-action is-danger" type="button" @click=${options.onStop}>
                  ${stopIcon()} 停止
                </button>
              `
            : nothing}
          <button class="pet-stage-close" type="button" title="关闭" aria-label="关闭" @click=${options.onClose}>
            ${closeIcon()}
          </button>
        </div>
      </header>
      <main class="pet-stage-output">
        <div class="pet-stage-output-inner">
          ${options.messages.length
            ? options.messages.map((message) => renderStageMessage(message, options))
            : renderWelcomeMessage(options)}
        </div>
      </main>
      <footer class="pet-stage-footer">
        ${renderShortcuts(options)}
        ${renderComposer(options)}
        <div class="pet-stage-note">内容由 AI 生成，仅供参考</div>
      </footer>
    </section>
  `;
}

function renderShortcuts(options: PetStageRenderOptions): TemplateResult {
  return html`
    <div class="pet-stage-shortcuts" aria-label="快捷操作">
      ${options.quickQuestions.map((prompt) => html`
        <button type="button" @click=${() => options.onUsePrompt(prompt)}>
          ${questionAnswerIcon()}<span>${prompt}</span>
        </button>
      `)}
      <button type="button" ?disabled=${!options.hasSources} @click=${options.onExpandLatestSources}>
        ${questionAnswerIcon()}<span>关联资源</span>
      </button>
      <button type="button" @click=${options.onNewConversation}>
        ${newChatIcon()}<span>新会话</span>
      </button>
      <button type="button" @click=${options.onClose}>
        ${focusIcon()}<span>收起</span>
      </button>
    </div>
  `;
}

function renderStageMessage(
  message: RagAssistantMessage,
  options: PetStageRenderOptions,
): TemplateResult {
  const sources = message.sources || [];

  return html`
    <article class=${`pet-stage-message ${message.role}`}>
      ${message.role === 'assistant'
        ? renderStageAvatar(options)
        : nothing}
      <div class="pet-stage-message-stack">
        <div class=${`pet-stage-bubble${message.error ? ' error' : ''}${message.streaming ? ' streaming' : ''}`}>
          ${renderMessageContent(message)}
          ${message.streaming ? renderTyping() : nothing}
        </div>
        <div class="pet-stage-message-actions">
          <button type="button" title="复制" @click=${() => options.onCopyMessage(message)}>
            ${copyIcon()}<span>复制</span>
          </button>
          <button
            type="button"
            title=${message.role === 'assistant' ? '重新生成' : '再次发送'}
            ?disabled=${options.streaming}
            @click=${() => options.onRetryMessage(message)}
          >
            ${retryIcon()}<span>${message.role === 'assistant' ? '重试' : '再问'}</span>
          </button>
        </div>
        ${message.role === 'assistant' ? renderStageSources(sources, message.id, options) : nothing}
        <div class="pet-stage-time">${message.time}</div>
      </div>
    </article>
  `;
}

function renderWelcomeMessage(options: PetStageRenderOptions): TemplateResult {
  return html`
    <div class="pet-stage-message assistant">
      ${renderStageAvatar(options)}
      <div class="pet-stage-message-stack">
        <div class="pet-stage-bubble">
          <span class="message-text">${options.welcomeMessage}</span>
        </div>
        <div class="pet-stage-time">${options.welcomeTime}</div>
      </div>
    </div>
  `;
}

function renderStageAvatar(options: PetStageRenderOptions): TemplateResult {
  const avatarUrl = options.assistantAvatar?.trim();
  return html`
    <span class=${avatarUrl ? 'pet-stage-avatar has-image' : 'pet-stage-avatar'} aria-hidden="true">
      <span class="pet-stage-avatar-fallback">${options.avatarFallbackText}</span>
      ${avatarUrl
        ? html`
            <img
              class="pet-stage-avatar-image"
              src=${avatarUrl}
              alt=""
              @error=${handleAvatarImageError}
            />
          `
        : nothing}
    </span>
  `;
}

function handleAvatarImageError(event: Event): void {
  const image = event.currentTarget;
  if (!(image instanceof HTMLImageElement)) {
    return;
  }
  image.parentElement?.classList.remove('has-image');
  image.remove();
}

function renderStageSources(
  sources: RagSourceReference[],
  messageId: string,
  options: PetStageRenderOptions,
): TemplateResult | typeof nothing {
  if (!sources.length) {
    return nothing;
  }
  return html`
    <details
      class="pet-stage-sources"
      ?open=${options.isSourceReferencesOpen(messageId)}
      @toggle=${(event: Event) => options.onToggleSourceReferences(messageId, event)}
    >
      <summary>
        ${questionAnswerIcon()} <span>${sources.length} 个关联资源</span>
      </summary>
      ${renderSourceList(sources)}
    </details>
  `;
}

function renderMessageContent(message: RagAssistantMessage): TemplateResult {
  const content = message.content || (message.streaming ? '正在思考中...' : '');
  if (message.role === 'assistant' && !message.error && content) {
    return html`<div class="message-text markdown-body">${unsafeHTML(markdownToHtml(content))}</div>`;
  }
  return html`<span class="message-text">${content}</span>`;
}

function renderComposer(options: PetStageRenderOptions): TemplateResult {
  return html`
    <div class="composer-wrap">
      <form class="composer" @submit=${options.onSubmit}>
        <textarea
          class="conversation-input input"
          rows="1"
          .value=${options.input}
          placeholder=${options.inputPlaceholder || RAG_INPUT_PLACEHOLDER}
          ?disabled=${options.streaming}
          @input=${options.onInput}
          @keydown=${options.onKeydown}
          @compositionstart=${options.onCompositionStart}
          @compositionend=${options.onCompositionEnd}
        ></textarea>
        <button class="send" type="submit" ?disabled=${options.streaming || !options.input.trim()} aria-label="发送">
          ${sendIcon()}
        </button>
      </form>
    </div>
  `;
}
