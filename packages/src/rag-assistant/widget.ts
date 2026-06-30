import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {
  askRagStream,
  DEFAULT_RAG_ASSISTANT_CONFIG,
  fetchRagAssistantConfig,
  fetchRagConversation,
} from './api';
import {
  closeIcon,
  fullscreenIcon,
  newChatIcon,
  restoreIcon,
  sendIcon,
  shieldIcon,
  questionAnswerIcon,
} from './icons';
import {
  formatTime,
  markdownToHtml,
} from './format';
import { renderSourceReferences } from './source-references';
import { ragAssistantStyles } from './styles';
import {
  DEFAULT_RAG_PET_SPEECH_MESSAGES,
  PETDEX_THINKING_SPEECH_MESSAGE,
  getPetdexFrame,
  getPetdexFrames,
  getPetdexMetrics,
  type PetdexDirection,
} from './petdex';
import {
  createMessage,
  createMessageId,
  updateMessageById,
} from './messages';
import {
  EMPTY_SELECTION_POPUP,
  resolveSelectionPopup,
} from './selection';
import { applyAssistantTheme } from './theme';
import type {
  RagAssistantConfig,
  RagAssistantMessage,
  RagConversation,
  RagConversationMessage,
  RagSourceReference,
  SelectionPopupState,
} from './types';

const MAX_SELECTION_LENGTH = 1600;
const SOURCE_LIMIT = 8;
const INPUT_PLACEHOLDER = '请输入您想从知识库了解的问题...';
const FLOATING_POSITION_STORAGE_KEY = 'likcc_summaraidgpt_rag_assistant_position';
const CONVERSATION_ID_STORAGE_KEY = 'likcc_summaraidgpt_rag_conversation_id';
const VISITOR_ID_STORAGE_KEY = 'likcc_summaraidgpt_rag_visitor_id';
const FLOATING_MARGIN = 16;
const PET_BUTTON_SIZE = 76;
const PET_METRICS = getPetdexMetrics(PET_BUTTON_SIZE);
const BUBBLE_WIDTH = PET_METRICS.width;
const BUBBLE_HEIGHT = PET_METRICS.height;
const DRAG_THRESHOLD = 4;

interface FloatingPosition {
  x: number;
  y: number;
}

interface BubbleDragState {
  pointerId: number;
  target: HTMLElement;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  lastX: number;
  moved: boolean;
}

@customElement('summaraid-rag-assistant')
export class RagAssistantWidget extends LitElement {
  static styles = ragAssistantStyles;

  @property({ type: String, reflect: true })
  position: 'left' | 'right' = 'right';

  @state()
  private config: RagAssistantConfig = DEFAULT_RAG_ASSISTANT_CONFIG;

  @state()
  private configLoaded = false;

  @state()
  private open = false;

  @state()
  private fullscreen = false;

  @state()
  private input = '';

  @state()
  private messages: RagAssistantMessage[] = [];

  @state()
  private streaming = false;

  private composingInput = false;

  @state()
  private expandedSourceMessageIds: string[] = [];

  @state()
  private selectionPopup: SelectionPopupState = EMPTY_SELECTION_POPUP;

  @state()
  private floatingPosition?: FloatingPosition;

  @state()
  private floatingPositionReady = false;

  @state()
  private petSpriteReady = false;

  @state()
  private draggingBubble = false;

  @state()
  private petFrameIndex = 0;

  @state()
  private petHovering = false;

  @state()
  private petDragDirection: PetdexDirection = '';

  @state()
  private petErrorUntil = 0;

  @state()
  private petSpeechVisible = false;

  @state()
  private petSpeechIndex = 0;

  @state()
  private petSpeechText = '';

  @state()
  private avatarLoadFailed = false;

  @query('.messages')
  private messagesElement?: HTMLElement;

  @query('.input')
  private inputElement?: HTMLTextAreaElement;

  private abortController?: AbortController;
  private conversationId?: string;
  private visitorId = this.loadOrCreateVisitorId();
  private bubbleDragState?: BubbleDragState;
  private suppressNextBubbleClick = false;
  private floatingPositionLocked = false;
  private petAnimationTimer = 0;
  private petSpeechTimer = 0;
  private petSpeechHideTimer = 0;
  private readonly welcomeTime = formatTime();
  private readonly handleDocumentMouseUp = () => {
    window.setTimeout(() => this.updateSelectionPopup(), 0);
  };
  private readonly handleDocumentKeyUp = () => {
    window.setTimeout(() => this.updateSelectionPopup(), 0);
  };
  private readonly handleDocumentMouseDown = (event: MouseEvent) => {
    if (event.composedPath().includes(this)) {
      return;
    }
    this.clearSelectionPopup();
  };
  private readonly handleWindowScroll = () => {
    this.clearSelectionPopup();
  };
  private readonly handleWindowResize = () => {
    this.clampCurrentFloatingPosition();
  };
  private readonly handleBubblePointerMove = (event: PointerEvent) => {
    const state = this.bubbleDragState;
    if (!state || event.pointerId !== state.pointerId) {
      return;
    }

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    const distance = Math.hypot(deltaX, deltaY);
    if (!state.moved && distance < DRAG_THRESHOLD) {
      return;
    }

    state.moved = true;
    this.draggingBubble = true;
    this.petDragDirection = event.clientX >= state.lastX ? 'right' : 'left';
    state.lastX = event.clientX;
    event.preventDefault();

    this.setFloatingPosition(
      this.clampFloatingPosition(
        {
          x: state.originX + deltaX,
          y: state.originY + deltaY,
        },
        BUBBLE_WIDTH,
        BUBBLE_HEIGHT,
      ),
      false,
    );
  };
  private readonly handleBubblePointerEnd = (event: PointerEvent) => {
    const state = this.bubbleDragState;
    if (!state || event.pointerId !== state.pointerId) {
      return;
    }

    if (state.target.hasPointerCapture(event.pointerId)) {
      state.target.releasePointerCapture(event.pointerId);
    }
    this.unbindBubbleDragListeners();
    this.bubbleDragState = undefined;
    this.draggingBubble = false;
    this.petDragDirection = '';

    if (state.moved && this.floatingPosition) {
      event.preventDefault();
      this.suppressNextBubbleClick = true;
      this.floatingPositionLocked = true;
      this.saveFloatingPosition(this.floatingPosition);
      window.setTimeout(() => {
        this.suppressNextBubbleClick = false;
      }, 0);
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.applyTheme();
    this.floatingPositionLocked = this.applySavedFloatingPosition();
    this.bindSelectionListeners();
    window.addEventListener('resize', this.handleWindowResize, { passive: true });
    void this.loadConfig();
    void this.loadStoredConversation();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unbindSelectionListeners();
    window.removeEventListener('resize', this.handleWindowResize);
    this.unbindBubbleDragListeners();
    this.stopPetAnimation();
    this.stopPetSpeechCycle();
    this.abortCurrentRequest();
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('open') || changedProperties.has('streaming')) {
      this.syncPetThinkingSpeech();
    }
  }

  public openAssistant(question?: string, autoSubmit = false): void {
    this.open = true;
    this.petSpeechVisible = false;
    this.clearSelectionPopup();

    if (question?.trim()) {
      if (autoSubmit) {
        void this.submitQuestion(question);
      } else {
        this.input = question;
        void this.updateComplete.then(() => this.focusInput());
      }
      return;
    }

    void this.updateComplete.then(() => this.focusInput());
  }

  protected render(): TemplateResult {
    return html`
      ${this.renderSelectionPopup()}
      ${this.open ? this.renderWindow() : this.renderBubble()}
    `;
  }

  private async loadConfig(): Promise<void> {
    const config = await fetchRagAssistantConfig();
    this.config = config;
    this.configLoaded = true;
    this.avatarLoadFailed = false;
    this.applyTheme(config);
    if (!this.floatingPositionLocked) {
      this.position = config.buttonPosition;
      this.applyDefaultFloatingPosition(config);
    }
    this.floatingPositionReady = true;
    await this.preparePetSprite(config);
  }

  private bindSelectionListeners(): void {
    document.addEventListener('mouseup', this.handleDocumentMouseUp, { passive: true });
    document.addEventListener('keyup', this.handleDocumentKeyUp, { passive: true });
    document.addEventListener('mousedown', this.handleDocumentMouseDown);
    window.addEventListener('scroll', this.handleWindowScroll, { passive: true });
  }

  private unbindSelectionListeners(): void {
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
    document.removeEventListener('keyup', this.handleDocumentKeyUp);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown);
    window.removeEventListener('scroll', this.handleWindowScroll);
  }

  private renderBubble(): TemplateResult | typeof nothing {
    if (!this.canRenderFloatingPet) {
      return nothing;
    }

    const speech = this.getCurrentPetSpeech();

    return html`
      <span class="bubble-wrapper">
        <button
          class=${this.draggingBubble ? 'bubble pet-button dragging' : 'bubble pet-button'}
          style=${this.petButtonStyle}
          type="button"
          @pointerdown=${this.handleBubblePointerDown}
          @click=${this.handleBubbleClick}
          @mouseenter=${this.handlePetMouseEnter}
          @mouseleave=${this.handlePetMouseLeave}
          aria-label="打开 RAG 智能助手"
        >
          ${speech
            ? html`<span class=${this.petSpeechVisible ? 'pet-speech visible' : 'pet-speech'}>${speech}</span>`
            : nothing}
          <span class="pet-sprite" style=${this.petSpriteStyle} aria-hidden="true"></span>
        </button>
      </span>
    `;
  }

  private renderWindow(): TemplateResult {
    return html`
      <div class=${this.windowShellClass} style=${this.windowShellStyle}>
        <section class="chat-window" role="dialog" aria-label=${this.assistantName}>
          ${this.renderHeader()}
          <div class="messages">
            ${this.messages.length ? nothing : this.renderWelcomeMessage()}
            ${this.messages.map((message) => this.renderMessage(message))}
          </div>
          ${this.renderComposer()}
          <div class="disclaimer">${shieldIcon()} <span>内容由 AI 生成，仅供参考</span></div>
        </section>
      </div>
    `;
  }

  private renderHeader(): TemplateResult {
    return html`
      <header class="chat-header">
        <div class="brand">
          ${this.renderAssistantAvatar('avatar')}
          <div class="brand-text">
            <div class="title-row">
              <span class="title">${this.assistantName}</span>
            </div>
            <div class="subtitle"><span class="status-dot"></span>基于站点知识库回答</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-button" type="button" title="新会话" aria-label="新会话" @click=${this.newConversation}>
            ${newChatIcon()}
          </button>
          <button
            class="icon-button"
            type="button"
            title=${this.fullscreen ? '退出全屏' : '全屏'}
            aria-label=${this.fullscreen ? '退出全屏' : '全屏'}
            @click=${this.toggleFullscreen}
          >
            ${this.fullscreen ? restoreIcon() : fullscreenIcon()}
          </button>
          <button class="icon-button" type="button" title="关闭" aria-label="关闭" @click=${this.close}>
            ${closeIcon()}
          </button>
        </div>
      </header>
    `;
  }

  private renderWelcomeMessage(): TemplateResult {
    return html`
      <div class="message-row assistant">
        ${this.renderAssistantAvatar('message-avatar')}
        <div class="message-stack">
          <div class="bubble-card">
            <span class="message-text">${this.welcomeMessage}</span>
          </div>
          <div class="message-time">${this.welcomeTime}</div>
        </div>
      </div>
    `;
  }

  private renderMessage(message: RagAssistantMessage): TemplateResult {
    const sources = message.sources || [];

    return html`
      <div class=${`message-row ${message.role}`}>
        ${message.role === 'assistant'
          ? this.renderAssistantAvatar('message-avatar')
          : nothing}
        <div class="message-stack">
          <div class=${`bubble-card${message.error ? ' error' : ''}${message.streaming ? ' streaming' : ''}`}>
            ${this.renderMessageContent(message)}
            ${message.streaming ? this.renderTyping() : nothing}
          </div>
          ${message.role === 'assistant'
            ? renderSourceReferences(sources, {
                open: this.isSourceReferencesOpen(message.id),
                onToggle: (event) => this.toggleSourceReferences(message.id, event),
              })
            : nothing}
          <div class="message-time">${message.time}</div>
        </div>
      </div>
    `;
  }

  private renderTyping(): TemplateResult {
    return html`<span class="typing" aria-label="正在输出"><span></span><span></span><span></span></span>`;
  }

  private renderMessageContent(message: RagAssistantMessage): TemplateResult {
    const content = message.content || (message.streaming ? '正在思考中...' : '');
    if (message.role === 'assistant' && !message.error && content) {
      return html`<div class="message-text markdown-body">${unsafeHTML(markdownToHtml(content))}</div>`;
    }
    return html`<span class="message-text">${content}</span>`;
  }

  private renderComposer(): TemplateResult {
    return html`
      <div class="composer-wrap">
        <form class="composer" @submit=${this.handleSubmit}>
          <textarea
            class="input"
            rows="1"
            .value=${this.input}
            placeholder=${INPUT_PLACEHOLDER}
            ?disabled=${this.streaming}
            @input=${this.handleInput}
            @keydown=${this.handleInputKeydown}
            @compositionstart=${this.handleCompositionStart}
            @compositionend=${this.handleCompositionEnd}
          ></textarea>
          <button class="send" type="submit" ?disabled=${this.streaming || !this.input.trim()} aria-label="发送">
            ${sendIcon()}
          </button>
        </form>
      </div>
    `;
  }

  private renderSelectionPopup(): TemplateResult | typeof nothing {
    if (!this.selectionPopup.visible) {
      return nothing;
    }

    return html`
      <div
        class="selection-popover"
        style=${`left:${this.selectionPopup.x}px;top:${this.selectionPopup.y}px`}
      >
        <button type="button" @click=${this.askWithSelection}>
          ${questionAnswerIcon()} 问知识库
        </button>
      </div>
    `;
  }

  private renderAssistantAvatar(className: 'avatar' | 'message-avatar'): TemplateResult {
    const avatarUrl = this.assistantAvatarUrl;

    return html`
      <span class=${className}>
        ${avatarUrl
          ? html`
              <img
                class="avatar-image"
                src=${avatarUrl}
                alt=""
                decoding="async"
                loading="lazy"
                @error=${this.handleAvatarError}
              />
            `
          : html`<span class="avatar-fallback">${this.avatarFallbackText}</span>`}
      </span>
    `;
  }

  private handleAvatarError(): void {
    this.avatarLoadFailed = true;
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    void this.submitQuestion(this.input);
  }

  private handleInput(event: Event): void {
    const target = event.currentTarget;
    if (target instanceof HTMLTextAreaElement) {
      this.input = target.value;
      this.resizeInput(target);
    }
  }

  private handleCompositionStart(): void {
    this.composingInput = true;
  }

  private handleCompositionEnd(): void {
    this.composingInput = false;
  }

  private handleInputKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter'
      || event.shiftKey
      || this.streaming
      || event.isComposing
      || this.composingInput
      || event.keyCode === 229) {
      return;
    }

    event.preventDefault();
    void this.submitQuestion(this.input);
  }

  private handleBubblePointerDown(event: PointerEvent): void {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    const bubble = event.currentTarget;
    if (!(bubble instanceof HTMLElement)) {
      return;
    }

    const rect = bubble.getBoundingClientRect();
    const origin = this.currentFloatingPosition(rect);
    this.bubbleDragState = {
      pointerId: event.pointerId,
      target: bubble,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
      lastX: event.clientX,
      moved: false,
    };

    this.petSpeechVisible = false;
    event.preventDefault();
    bubble.setPointerCapture(event.pointerId);
    bubble.addEventListener('pointermove', this.handleBubblePointerMove);
    bubble.addEventListener('pointerup', this.handleBubblePointerEnd);
    bubble.addEventListener('pointercancel', this.handleBubblePointerEnd);
  }

  private handleBubbleClick(event: MouseEvent): void {
    if (this.suppressNextBubbleClick) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.openAssistant();
  }

  private unbindBubbleDragListeners(): void {
    const target = this.bubbleDragState?.target;
    if (!target) {
      return;
    }

    target.removeEventListener('pointermove', this.handleBubblePointerMove);
    target.removeEventListener('pointerup', this.handleBubblePointerEnd);
    target.removeEventListener('pointercancel', this.handleBubblePointerEnd);
  }

  private applySavedFloatingPosition(): boolean {
    const savedPosition = this.loadSavedFloatingPosition();
    if (!savedPosition) {
      return false;
    }

    this.setFloatingPosition(this.clampFloatingPosition(savedPosition), false);
    return true;
  }

  private applyDefaultFloatingPosition(config: RagAssistantConfig): void {
    this.setFloatingPosition(this.clampFloatingPosition(this.defaultFloatingPosition(config)), false);
  }

  private currentFloatingPosition(fallbackRect?: DOMRect): FloatingPosition {
    if (this.floatingPosition) {
      return this.floatingPosition;
    }

    if (fallbackRect && Number.isFinite(fallbackRect.left) && Number.isFinite(fallbackRect.top)) {
      return {
        x: fallbackRect.left,
        y: fallbackRect.top,
      };
    }

    return this.defaultFloatingPosition(this.config);
  }

  private defaultFloatingPosition(config: RagAssistantConfig): FloatingPosition {
    const horizontalOffset = this.normalizeFloatingOffset(config.horizontalOffset);
    const verticalOffset = this.normalizeFloatingOffset(config.verticalOffset);
    const x = config.buttonPosition === 'left'
      ? horizontalOffset
      : window.innerWidth - BUBBLE_WIDTH - horizontalOffset;

    return {
      x,
      y: window.innerHeight - BUBBLE_HEIGHT - verticalOffset,
    };
  }

  private clampCurrentFloatingPosition(): void {
    if (!this.floatingPosition) {
      return;
    }

    const nextPosition = this.clampFloatingPosition(
      this.floatingPosition,
      BUBBLE_WIDTH,
      BUBBLE_HEIGHT,
    );

    if (nextPosition.x !== this.floatingPosition.x || nextPosition.y !== this.floatingPosition.y) {
      this.setFloatingPosition(nextPosition, true);
    }
  }

  private clampFloatingPosition(
    position: FloatingPosition,
    width = BUBBLE_WIDTH,
    height = BUBBLE_HEIGHT,
  ): FloatingPosition {
    const maxX = Math.max(FLOATING_MARGIN, window.innerWidth - width - FLOATING_MARGIN);
    const maxY = Math.max(FLOATING_MARGIN, window.innerHeight - height - FLOATING_MARGIN);

    return {
      x: this.clamp(position.x, FLOATING_MARGIN, maxX),
      y: this.clamp(position.y, FLOATING_MARGIN, maxY),
    };
  }

  private setFloatingPosition(position: FloatingPosition, persist: boolean): void {
    this.floatingPosition = position;
    this.position = position.x + BUBBLE_WIDTH / 2 < window.innerWidth / 2 ? 'left' : 'right';
    this.style.left = `${Math.round(position.x)}px`;
    this.style.top = `${Math.round(position.y)}px`;
    this.style.right = 'auto';
    this.style.bottom = 'auto';

    if (persist) {
      this.saveFloatingPosition(position);
    }
  }

  private applyTheme(config: RagAssistantConfig = this.config): void {
    applyAssistantTheme(this, config.styleConfig);
  }

  private async preparePetSprite(config: RagAssistantConfig): Promise<void> {
    this.stopPetAnimation();
    this.stopPetSpeechCycle();
    this.petSpriteReady = false;
    this.petSpeechVisible = false;
    this.petSpeechText = '';

    const spritesheetUrl = config.pet?.spritesheetUrl?.trim();
    if (!spritesheetUrl) {
      return;
    }

    try {
      await this.preloadImage(spritesheetUrl);
      if (this.petSpriteUrl !== spritesheetUrl) {
        return;
      }
      this.petSpriteReady = true;
      this.startPetAnimation();
      this.startPetSpeechCycle();
    } catch {
      if (this.petSpriteUrl === spritesheetUrl) {
        this.petSpriteReady = false;
      }
    }
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      let settled = false;
      const settle = (callback: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        callback();
      };

      image.onload = () => settle(() => resolve());
      image.onerror = () => settle(() => reject(new Error('Pet spritesheet failed to load')));
      image.src = url;
    });
  }

  private startPetAnimation(): void {
    if (this.petAnimationTimer || !this.canRenderFloatingPet) {
      return;
    }
    this.petAnimationTimer = window.setInterval(() => {
      this.petFrameIndex = (this.petFrameIndex + 1) % getPetdexFrames(this.petAnimationState).length;
    }, 150);
  }

  private stopPetAnimation(): void {
    if (!this.petAnimationTimer) {
      return;
    }
    window.clearInterval(this.petAnimationTimer);
    this.petAnimationTimer = 0;
  }

  private startPetSpeechCycle(): void {
    if (this.petSpeechTimer || !this.canRenderFloatingPet) {
      return;
    }
    window.setTimeout(() => this.showNextPetSpeech(), 1600);
    this.petSpeechTimer = window.setInterval(() => this.showNextPetSpeech(), 15000);
  }

  private stopPetSpeechCycle(): void {
    if (this.petSpeechTimer) {
      window.clearInterval(this.petSpeechTimer);
      this.petSpeechTimer = 0;
    }
    if (this.petSpeechHideTimer) {
      window.clearTimeout(this.petSpeechHideTimer);
      this.petSpeechHideTimer = 0;
    }
  }

  private showNextPetSpeech(): void {
    if (!this.canShowPetSpeech()) {
      this.petSpeechVisible = false;
      return;
    }
    if (this.isPetThinkingOutsideWindow()) {
      this.showPetThinkingSpeech();
      return;
    }

    const messages = this.petSpeechMessages;
    this.petSpeechText = messages[this.petSpeechIndex % messages.length] || '';
    this.petSpeechVisible = true;

    if (this.petSpeechHideTimer) {
      window.clearTimeout(this.petSpeechHideTimer);
    }
    this.petSpeechHideTimer = window.setTimeout(() => {
      this.petSpeechVisible = false;
      this.petSpeechHideTimer = 0;
    }, 7200);
    this.petSpeechIndex = (this.petSpeechIndex + 1) % messages.length;
  }

  private syncPetThinkingSpeech(): void {
    if (!this.canRenderFloatingPet) {
      this.petSpeechVisible = false;
      this.petSpeechText = '';
      return;
    }
    if (this.isPetThinkingOutsideWindow()) {
      this.showPetThinkingSpeech();
      return;
    }
    if (this.petSpeechText === PETDEX_THINKING_SPEECH_MESSAGE) {
      this.petSpeechVisible = false;
      this.petSpeechText = '';
    }
  }

  private showPetThinkingSpeech(): void {
    if (this.draggingBubble) {
      return;
    }
    this.petSpeechText = PETDEX_THINKING_SPEECH_MESSAGE;
    this.petSpeechVisible = true;
    if (this.petSpeechHideTimer) {
      window.clearTimeout(this.petSpeechHideTimer);
      this.petSpeechHideTimer = 0;
    }
  }

  private canShowPetSpeech(): boolean {
    return this.canRenderFloatingPet
      && !this.open
      && !this.draggingBubble
      && (this.isPetThinkingOutsideWindow() || this.petSpeechMessages.length > 0);
  }

  private isPetThinkingOutsideWindow(): boolean {
    return !this.open && this.streaming;
  }

  private handlePetMouseEnter(): void {
    this.petHovering = true;
  }

  private handlePetMouseLeave(): void {
    this.petHovering = false;
  }

  private triggerPetError(): void {
    if (!this.canRenderFloatingPet) {
      return;
    }
    this.petErrorUntil = Date.now() + 3600;
    this.petFrameIndex = 0;
  }

  private loadSavedFloatingPosition(): FloatingPosition | undefined {
    try {
      const rawValue = window.localStorage.getItem(FLOATING_POSITION_STORAGE_KEY);
      if (!rawValue) {
        return undefined;
      }

      const position = JSON.parse(rawValue) as Partial<FloatingPosition>;
      if (typeof position.x === 'number'
        && Number.isFinite(position.x)
        && typeof position.y === 'number'
        && Number.isFinite(position.y)
      ) {
        return {
          x: Number(position.x),
          y: Number(position.y),
        };
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  private saveFloatingPosition(position: FloatingPosition): void {
    try {
      window.localStorage.setItem(FLOATING_POSITION_STORAGE_KEY, JSON.stringify(position));
    } catch {
      // localStorage may be unavailable in strict privacy modes.
    }
  }

  private async submitQuestion(rawQuestion: string): Promise<void> {
    const question = rawQuestion.trim();
    if (!question || this.streaming) {
      return;
    }

    const assistantMessageId = createMessageId();
    this.input = '';
    this.streaming = true;
    this.abortController = new AbortController();

    this.messages = [
      ...this.messages,
      createMessage('user', question),
      createMessage('assistant', '', {
        id: assistantMessageId,
        streaming: true,
      }),
    ];

    await this.updateComplete;
    this.resizeInput(this.inputElement);
    this.scrollToBottom();

    try {
      await askRagStream(
        {
          question,
          limit: SOURCE_LIMIT,
          conversationId: this.conversationId,
          visitorId: this.visitorId,
        },
        {
          onConversationId: (conversationId) => this.persistConversationId(conversationId),
          onSources: (sources) => this.receiveSources(assistantMessageId, sources),
          onDelta: (delta) => this.appendAssistantDelta(assistantMessageId, delta),
          onError: (error) => this.failAssistantMessage(assistantMessageId, error),
          onDone: () => this.finishAssistantMessage(assistantMessageId),
        },
        this.abortController.signal,
      );
    } catch (error) {
      if (this.abortController.signal.aborted) {
        return;
      }
      const message = error instanceof Error ? error.message : 'RAG 问答失败';
      this.failAssistantMessage(assistantMessageId, `抱歉，暂时无法回答，请稍后重试。${message ? `（${message}）` : ''}`);
    } finally {
      this.finishAssistantMessage(assistantMessageId);
      this.streaming = false;
      this.abortController = undefined;
      await this.updateComplete;
      this.scrollToBottom();
    }
  }

  private receiveSources(messageId: string, sources: RagSourceReference[]): void {
    this.updateMessage(messageId, (message) => ({
      ...message,
      sources,
    }));
  }

  private async loadStoredConversation(): Promise<void> {
    const conversationId = this.loadConversationId();
    if (!conversationId) {
      return;
    }
    try {
      const conversation = await fetchRagConversation(conversationId, this.visitorId);
      if (!conversation) {
        this.clearConversationId();
        return;
      }
      this.conversationId = conversation.metadata.name;
      this.messages = this.toAssistantMessages(conversation);
      await this.updateComplete;
      this.scrollToBottom();
    } catch {
      this.clearConversationId();
    }
  }

  private toAssistantMessages(conversation: RagConversation): RagAssistantMessage[] {
    return (conversation.spec?.messages || [])
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .filter((message) => Boolean(message.content?.trim()))
      .map((message) => createMessage(message.role as RagAssistantMessage['role'], message.content || '', {
        id: message.id,
        time: this.messageTime(message),
        sources: message.sources,
        error: message.error,
      }));
  }

  private messageTime(message: RagConversationMessage): string {
    if (!message.createdAt) {
      return formatTime();
    }
    const date = new Date(message.createdAt);
    return Number.isNaN(date.getTime()) ? formatTime() : formatTime(date);
  }

  private persistConversationId(conversationId: string): void {
    if (!conversationId.trim()) {
      return;
    }
    this.conversationId = conversationId;
    try {
      window.localStorage.setItem(CONVERSATION_ID_STORAGE_KEY, conversationId);
    } catch {
      // localStorage may be unavailable in strict privacy modes.
    }
  }

  private loadConversationId(): string | undefined {
    try {
      return window.localStorage.getItem(CONVERSATION_ID_STORAGE_KEY) || undefined;
    } catch {
      return undefined;
    }
  }

  private loadOrCreateVisitorId(): string {
    try {
      const existing = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);
      if (existing) {
        return existing;
      }
      const visitorId = `rag-visitor-${this.randomId()}`;
      window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
      return visitorId;
    } catch {
      return `rag-visitor-${this.randomId()}`;
    }
  }

  private randomId(): string {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private clearConversationId(): void {
    this.conversationId = undefined;
    try {
      window.localStorage.removeItem(CONVERSATION_ID_STORAGE_KEY);
    } catch {
      // localStorage may be unavailable in strict privacy modes.
    }
  }

  private appendAssistantDelta(messageId: string, delta: string): void {
    if (!delta) {
      return;
    }

    this.updateMessage(messageId, (message) => ({
      ...message,
      content: `${message.content}${delta}`,
    }));
    void this.updateComplete.then(() => this.scrollToBottom());
  }

  private failAssistantMessage(messageId: string, error: string): void {
    this.triggerPetError();
    this.updateMessage(messageId, (message) => ({
      ...message,
      content: error,
      error: true,
      streaming: false,
    }));
    this.streaming = false;
  }

  private finishAssistantMessage(messageId: string): void {
    this.updateMessage(messageId, (message) => ({
      ...message,
      content: message.content || (message.error ? message.content : '未找到相关资料，可尝试换个问题。'),
      streaming: false,
    }));
  }

  private updateMessage(
    messageId: string,
    updater: (message: RagAssistantMessage) => RagAssistantMessage,
  ): void {
    this.messages = updateMessageById(this.messages, messageId, updater);
  }

  private toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;
  }

  private toggleSourceReferences(messageId: string, event: Event): void {
    const target = event.currentTarget;
    if (!(target instanceof HTMLDetailsElement)) {
      return;
    }

    const expandedIds = new Set(this.expandedSourceMessageIds);
    if (target.open) {
      expandedIds.add(messageId);
    } else {
      expandedIds.delete(messageId);
    }
    this.expandedSourceMessageIds = Array.from(expandedIds);
  }

  private close(): void {
    this.open = false;
    this.fullscreen = false;
    this.clearSelectionPopup();
  }

  private newConversation(): void {
    this.abortCurrentRequest();
    this.clearConversationId();
    this.messages = [];
    this.input = '';
    this.streaming = false;
    void this.updateComplete.then(() => this.focusInput());
  }

  private askWithSelection(): void {
    const text = this.selectionPopup.text.trim();
    if (!text) {
      return;
    }

    const question = `请基于知识库回答，并结合我选中的内容：\n\n${text}`;
    this.openAssistant(question, true);
  }

  private updateSelectionPopup(): void {
    this.selectionPopup = resolveSelectionPopup(MAX_SELECTION_LENGTH);
  }

  private clearSelectionPopup(): void {
    if (!this.selectionPopup.visible) {
      return;
    }

    this.selectionPopup = EMPTY_SELECTION_POPUP;
  }

  private resizeInput(target?: HTMLTextAreaElement): void {
    if (!target) {
      return;
    }

    target.style.height = 'auto';
    target.style.height = `${Math.min(Math.max(target.scrollHeight, 38), 118)}px`;
  }

  private focusInput(): void {
    this.inputElement?.focus();
  }

  private scrollToBottom(): void {
    if (!this.messagesElement) {
      return;
    }

    this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
  }

  private abortCurrentRequest(): void {
    if (!this.abortController || this.abortController.signal.aborted) {
      return;
    }

    this.abortController.abort();
  }

  private isMobileViewport(): boolean {
    return window.matchMedia?.('(max-width: 960px)').matches ?? false;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private normalizeFloatingOffset(value: number): number {
    return Number.isFinite(value)
      ? Math.max(0, value)
      : DEFAULT_RAG_ASSISTANT_CONFIG.horizontalOffset;
  }

  private isSourceReferencesOpen(messageId: string): boolean {
    return this.expandedSourceMessageIds.includes(messageId);
  }

  private get windowShellClass(): string {
    return [
      'window-shell',
      this.fullscreen ? 'fullscreen' : '',
    ].filter(Boolean).join(' ');
  }

  private get windowShellStyle(): string {
    if (this.fullscreen || this.isMobileViewport() || !this.floatingPosition) {
      return '';
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const shellWidth = Math.min(560, viewportWidth - FLOATING_MARGIN * 2);
    const shellHeight = Math.min(636, viewportHeight - FLOATING_MARGIN * 2);
    const anchorX = this.floatingPosition.x + BUBBLE_WIDTH / 2;
    const anchorY = this.floatingPosition.y + BUBBLE_HEIGHT / 2;
    const alignLeft = anchorX < viewportWidth / 2;
    const left = alignLeft
      ? anchorX - BUBBLE_WIDTH / 2
      : anchorX - shellWidth + BUBBLE_WIDTH / 2;
    const top = anchorY - shellHeight + BUBBLE_HEIGHT / 2;

    return [
      `left:${Math.round(this.clamp(left, FLOATING_MARGIN, viewportWidth - shellWidth - FLOATING_MARGIN))}px`,
      `top:${Math.round(this.clamp(top, FLOATING_MARGIN, viewportHeight - shellHeight - FLOATING_MARGIN))}px`,
      'right:auto',
      'bottom:auto',
      `transform-origin:${alignLeft ? 'bottom left' : 'bottom right'}`,
    ].join(';');
  }

  private get assistantName(): string {
    return this.config.assistantName || DEFAULT_RAG_ASSISTANT_CONFIG.assistantName;
  }

  private get assistantAvatarUrl(): string | undefined {
    if (this.avatarLoadFailed) {
      return undefined;
    }
    return this.config.assistantAvatar?.trim() || undefined;
  }

  private get avatarFallbackText(): string {
    return Array.from(this.assistantName.trim())[0] || '智';
  }

  private get petMetrics(): ReturnType<typeof getPetdexMetrics> {
    return getPetdexMetrics(PET_BUTTON_SIZE);
  }

  private get petButtonStyle(): string {
    const metrics = this.petMetrics;
    return [
      `--rag-pet-width:${metrics.width}px`,
      `--rag-pet-height:${metrics.height}px`,
      `--rag-pet-sheet-width:${metrics.sheetWidth}px`,
      `--rag-pet-sheet-height:${metrics.sheetHeight}px`,
    ].join(';');
  }

  private get petSpriteStyle(): string {
    const metrics = this.petMetrics;
    const frame = getPetdexFrame(this.petAnimationState, this.petFrameIndex);
    return [
      `background-image:url("${this.escapeCssUrl(this.petSpriteUrl)}")`,
      `--rag-pet-frame-x:${-frame.col * metrics.width}px`,
      `--rag-pet-frame-y:${-frame.row * metrics.height}px`,
    ].join(';');
  }

  private get petAnimationState() {
    return {
      errorActive: this.petErrorUntil > Date.now(),
      direction: this.petDragDirection,
      thinking: this.isPetThinkingOutsideWindow(),
      hovering: this.petHovering,
    };
  }

  private get petSpeechMessages(): string[] {
    const messages = this.config.petSpeechMessages || [];
    return messages.length ? messages : DEFAULT_RAG_PET_SPEECH_MESSAGES;
  }

  private getCurrentPetSpeech(): string {
    return this.petSpeechText;
  }

  private get hasActivePet(): boolean {
    return Boolean(this.config.pet?.spritesheetUrl);
  }

  private get canRenderFloatingPet(): boolean {
    return this.configLoaded
      && this.floatingPositionReady
      && this.hasActivePet
      && this.petSpriteReady;
  }

  private get petSpriteUrl(): string {
    return this.config.pet?.spritesheetUrl || '';
  }

  private escapeCssUrl(value: string): string {
    return value.replace(/["\\\n\r\f]/g, '');
  }

  private get welcomeMessage(): string {
    return `您好！我是 ${this.assistantName}\n我会基于站点知识库检索并回答，尽量给出可追溯来源\n请问有什么想查的？`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'summaraid-rag-assistant': RagAssistantWidget;
  }
}
