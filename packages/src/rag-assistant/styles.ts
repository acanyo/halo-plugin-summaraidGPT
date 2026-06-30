import { css } from 'lit';

export const ragAssistantStyles = css`
  :host {
    --rag-text: #18181b;
    --rag-muted: #71717a;
    --rag-line: rgba(24, 24, 27, 0.095);
    --rag-soft-line: rgba(24, 24, 27, 0.06);
    --rag-paper: rgba(255, 255, 255, 0.97);
    --rag-panel: #fafafa;
    --rag-ink: #18181b;
    --rag-secondary: #f4f4f5;
    --rag-secondary-soft: rgba(244, 244, 245, 0.62);
    --rag-gold: #a16207;
    --rag-gold-strong: #85510a;
    --rag-gold-soft: rgba(161, 98, 7, 0.16);
    --rag-gold-faint: rgba(161, 98, 7, 0.05);
    --rag-surface-lift: color-mix(in srgb, var(--rag-paper) 90%, white);
    --rag-surface-muted: color-mix(in srgb, var(--rag-panel) 88%, var(--rag-secondary));
    --rag-control: color-mix(in srgb, var(--rag-paper) 96%, transparent);
    --rag-window-surface: color-mix(in srgb, var(--rag-panel) 96%, var(--rag-text) 4%);
    --rag-window-surface-2: var(--rag-panel);
    --rag-header-surface: color-mix(in srgb, var(--rag-panel) 94%, transparent);
    --rag-messages-surface: var(--rag-panel);
    --rag-footer-surface: color-mix(in srgb, var(--rag-panel) 96%, transparent);
    --rag-control-surface: color-mix(in srgb, var(--rag-paper) 86%, transparent);
    --rag-input-surface-resolved: color-mix(in srgb, var(--rag-panel) 90%, white);
    --rag-assistant-message-bg: color-mix(in srgb, var(--rag-panel) 92%, white);
    --rag-assistant-message-border: color-mix(in srgb, var(--rag-line) 76%, transparent);
    --rag-window-border: var(--rag-line);
    --rag-divider: var(--rag-soft-line);
    --rag-card-shadow: 0 10px 24px rgba(18, 18, 18, 0.055);
    --rag-control-shadow: 0 8px 18px rgba(18, 18, 18, 0.05);
    --rag-user-message-start: var(--rag-gold);
    --rag-user-message-end: var(--rag-gold-strong);
    --rag-ring: color-mix(in srgb, var(--rag-gold) 42%, transparent);
    --rag-frost: color-mix(in srgb, var(--rag-paper) 74%, transparent);
    --rag-primary-contrast: #fff;
    --rag-radius-panel: 18px;
    --rag-radius-card: 13px;
    --rag-radius-control: 999px;
    --rag-shadow: 0 20px 56px rgba(18, 18, 18, 0.12), 0 6px 18px rgba(18, 18, 18, 0.07);
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 99999;
    display: block;
    color: var(--rag-text);
    font-size: 14px;
    line-height: 1.5;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      'PingFang SC',
      'Hiragino Sans GB',
      'Microsoft YaHei',
      ui-sans-serif,
      sans-serif;
    letter-spacing: 0;
    text-rendering: geometricPrecision;
  }

  :host([position='left']) {
    right: auto;
    left: 24px;
  }

  * {
    box-sizing: border-box;
  }

  button,
  textarea {
    font: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  button:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--rag-ring);
    outline-offset: 3px;
  }

  .bubble {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--rag-pet-width, 76px);
    min-width: var(--rag-pet-width, 76px);
    height: var(--rag-pet-height, 82px);
    padding: 0;
    border: 0;
    border-radius: 0;
    color: inherit;
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    overflow: visible;
    appearance: none;
    -webkit-appearance: none;
    transition:
      transform 0.22s cubic-bezier(0.2, 0.82, 0.2, 1),
      filter 0.18s ease;
  }

  .bubble-wrapper {
    position: relative;
    display: inline-flex;
    width: var(--rag-pet-width, 76px);
    height: var(--rag-pet-height, 82px);
  }

  .bubble:hover,
  .bubble:focus-visible {
    transform: translateY(-2px);
    filter: saturate(1.04);
  }

  .bubble:active {
    transform: translateY(0) scale(0.98);
  }

  .bubble.dragging,
  .bubble.dragging:hover,
  .bubble.dragging:focus-visible {
    cursor: grabbing;
    transform: scale(0.985);
    transition: none;
  }

  .avatar,
  .message-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
    background: var(--rag-gold);
    color: var(--rag-primary-contrast);
  }

  .pet-sprite {
    position: relative;
    z-index: 2;
    display: block;
    width: var(--rag-pet-width, 76px);
    height: var(--rag-pet-height, 82px);
    background-repeat: no-repeat;
    background-position:
      var(--rag-pet-frame-x, 0)
      var(--rag-pet-frame-y, 0);
    background-size:
      var(--rag-pet-sheet-width, 608px)
      var(--rag-pet-sheet-height, 738px);
    filter: drop-shadow(0 14px 20px rgba(15, 23, 42, 0.23));
    image-rendering: pixelated;
    transition:
      filter 0.18s ease,
      transform 0.18s ease;
  }

  .bubble:hover .pet-sprite,
  .bubble:focus-visible .pet-sprite {
    filter:
      drop-shadow(0 16px 24px rgba(15, 23, 42, 0.24))
      drop-shadow(0 0 14px color-mix(in srgb, var(--rag-gold) 28%, transparent));
  }

  .bubble.dragging .pet-sprite {
    filter: drop-shadow(0 18px 24px rgba(15, 23, 42, 0.28));
  }

  .bubble:focus-visible {
    outline: none;
  }

  .pet-speech {
    position: absolute;
    z-index: 1;
    bottom: calc(100% + 8px);
    width: max-content;
    max-width: min(196px, calc(100vw - 32px));
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 58%, white);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.82));
    color: #334155;
    box-shadow:
      0 10px 24px rgba(15, 23, 42, 0.11),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
    font-size: 12px;
    font-weight: 620;
    line-height: 1.38;
    text-align: left;
    white-space: normal;
    pointer-events: none;
    opacity: 0;
    transform: translateY(7px) scale(0.94);
    transform-origin: bottom center;
    transition:
      opacity 0.24s ease,
      transform 0.34s cubic-bezier(0.18, 0.89, 0.32, 1.16);
    backdrop-filter: blur(14px) saturate(1.08);
    -webkit-backdrop-filter: blur(14px) saturate(1.08);
  }

  .pet-speech.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  :host([position='right']) .pet-speech {
    right: 0;
  }

  :host([position='left']) .pet-speech {
    left: 0;
  }

  .iconify-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    flex: 0 0 auto;
    background: currentColor;
    mask: var(--rag-icon-source) center / contain no-repeat;
    -webkit-mask: var(--rag-icon-source) center / contain no-repeat;
  }

  .avatar-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--rag-primary-contrast);
    font-weight: 820;
    line-height: 1;
  }

  .unread {
    position: absolute;
    top: -7px;
    right: -4px;
    min-width: 19px;
    height: 19px;
    padding: 0 6px;
    border-radius: 999px;
    background: #ef3e2d;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(239, 62, 45, 0.35);
  }

  .selection-popover {
    position: fixed;
    z-index: 100000;
    transform: translate(-50%, -100%);
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px;
    border-radius: 999px;
    background: var(--rag-frost);
    border: 1px solid var(--rag-line);
    box-shadow:
      0 18px 44px rgba(18, 18, 18, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.34);
    backdrop-filter: blur(18px) saturate(1.08);
    animation: popover-in 0.14s ease-out;
  }

  .selection-popover button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    border: 0;
    border-radius: 999px;
    padding: 0 13px;
    color: var(--rag-text);
    font-size: 13px;
    font-weight: 720;
    background: transparent;
    cursor: pointer;
    transition:
      background 0.14s ease,
      color 0.14s ease;
  }

  .selection-popover button:hover {
    background: var(--rag-secondary-soft);
  }

  .selection-popover svg,
  .selection-popover .iconify-icon {
    width: 16px;
    height: 16px;
  }

  .window-shell {
    position: fixed;
    right: clamp(16px, 3vw, 32px);
    bottom: clamp(16px, 3vw, 32px);
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 16px;
    width: min(536px, calc(100vw - 32px));
    max-width: calc(100vw - 32px);
    transform-origin: bottom right;
    animation: shell-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .window-shell.fullscreen {
    top: 24px;
    right: 24px;
    bottom: 24px;
    left: 24px;
    width: auto;
    max-width: none;
    grid-template-columns: minmax(0, 1fr);
    transform-origin: center;
  }

  :host([position='left']) .window-shell {
    right: auto;
    left: clamp(16px, 3vw, 32px);
    transform-origin: bottom left;
  }

  :host([position='left']) .window-shell.fullscreen {
    right: 24px;
    left: 24px;
  }

  .chat-window {
    position: relative;
    overflow: hidden;
    border-radius: var(--rag-radius-panel);
    background: linear-gradient(180deg, var(--rag-window-surface), var(--rag-window-surface-2));
    border: 1px solid var(--rag-window-border);
    box-shadow:
      var(--rag-shadow),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px) saturate(1.02);
  }

  .chat-window {
    width: 100%;
    height: min(608px, calc(100vh - 48px));
    min-height: 456px;
    display: flex;
    flex-direction: column;
  }

  .window-shell.fullscreen .chat-window {
    height: 100%;
    min-height: 0;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 13px 14px 12px 16px;
    border-bottom: 1px solid var(--rag-divider);
    background: var(--rag-header-surface);
    backdrop-filter: blur(16px) saturate(1.02);
    -webkit-backdrop-filter: blur(16px) saturate(1.02);
  }

  .brand {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 12px;
  }

  .avatar {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    color: var(--rag-primary-contrast);
    background:
      radial-gradient(circle at 32% 22%, rgba(255, 255, 255, 0.28), transparent 27%),
      linear-gradient(145deg, var(--rag-gold), var(--rag-gold-strong));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 24%, transparent),
      0 7px 16px color-mix(in srgb, var(--rag-gold) 12%, transparent);
  }

  .avatar .avatar-fallback {
    font-size: 14px;
  }

  .brand-text {
    flex: 1 1 auto;
    min-width: 0;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .title {
    overflow: hidden;
    color: var(--rag-text);
    font-size: 14.5px;
    font-weight: 760;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-dot {
    flex: 0 0 auto;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #35c878;
    box-shadow: 0 0 0 3px rgba(53, 200, 120, 0.12);
  }

  .subtitle {
    margin-top: 4px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: color-mix(in srgb, var(--rag-muted) 88%, var(--rag-text));
    font-size: 12px;
    line-height: 1.3;
  }

  .header-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .icon-button {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--rag-text) 82%, var(--rag-muted));
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    cursor: pointer;
    transition:
      transform 0.14s ease,
      background 0.14s ease,
      border-color 0.14s ease,
      color 0.14s ease;
  }

  .icon-button:hover {
    transform: translateY(-1px);
    color: var(--rag-text);
    background: var(--rag-control-surface);
    border-color: color-mix(in srgb, var(--rag-window-border) 76%, var(--rag-gold) 12%);
  }

  .icon-button:active {
    transform: translateY(0) scale(0.96);
  }

  .icon-button svg,
  .icon-button .iconify-icon {
    width: 17px;
    height: 17px;
    opacity: 0.9;
  }

  .icon-button:hover svg,
  .icon-button:hover .iconify-icon {
    opacity: 1;
  }

  .messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 18px 20px 14px;
    background: var(--rag-messages-surface);
    scroll-behavior: smooth;
  }

  .messages::-webkit-scrollbar {
    width: 8px;
  }

  .messages::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background:
      linear-gradient(color-mix(in srgb, var(--rag-muted) 32%, transparent), color-mix(in srgb, var(--rag-muted) 32%, transparent))
      content-box;
  }

  .messages::-webkit-scrollbar-track {
    border-radius: 999px;
  }

  .message-row {
    display: flex;
    gap: 9px;
    margin-bottom: 16px;
    min-width: 0;
    animation: message-in 0.18s ease-out both;
  }

  .message-row.user {
    justify-content: flex-end;
  }

  .message-avatar {
    flex: 0 0 auto;
    width: 27px;
    height: 27px;
    margin-top: 1px;
    color: var(--rag-primary-contrast);
    background:
      radial-gradient(circle at 32% 20%, rgba(255, 255, 255, 0.24), transparent 26%),
      linear-gradient(145deg, var(--rag-gold), var(--rag-gold-strong));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 22%, transparent),
      0 5px 14px color-mix(in srgb, var(--rag-gold) 12%, transparent);
  }

  .message-avatar .avatar-fallback {
    font-size: 11px;
  }

  .message-stack {
    flex: 0 1 auto;
    min-width: 0;
    width: fit-content;
    max-width: min(78%, 468px);
  }

  .message-row.user .message-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    max-width: min(66%, 382px);
  }

  .bubble-card {
    position: relative;
    display: inline-block;
    width: fit-content;
    max-width: 100%;
    padding: 10px 13px 11px;
    border-radius: calc(var(--rag-radius-card) + 1px);
    color: var(--rag-text);
    background: var(--rag-assistant-message-bg);
    border: 1px solid var(--rag-assistant-message-border);
    box-shadow: var(--rag-card-shadow);
    line-height: 1.68;
    font-size: 13.5px;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .bubble-card.streaming {
    border-color: color-mix(in srgb, var(--rag-gold) 30%, var(--rag-line));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 8%, transparent),
      var(--rag-card-shadow);
  }

  .message-text {
    display: block;
    white-space: pre-wrap;
  }

  .markdown-body {
    white-space: normal;
  }

  .markdown-body :first-child {
    margin-top: 0;
  }

  .markdown-body :last-child {
    margin-bottom: 0;
  }

  .markdown-body p {
    margin: 0 0 10px;
  }

  .markdown-body h1,
  .markdown-body h2,
  .markdown-body h3,
  .markdown-body h4 {
    margin: 10px 0 6px;
    color: var(--rag-text);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 850;
  }

  .markdown-body ul,
  .markdown-body ol {
    margin: 6px 0 10px;
    padding-left: 20px;
  }

  .markdown-body li {
    margin: 3px 0;
  }

  .markdown-body strong {
    font-weight: 850;
  }

  .markdown-body em {
    color: color-mix(in srgb, var(--rag-text) 88%, var(--rag-gold-strong));
  }

  .markdown-body code {
    padding: 1px 5px 2px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--rag-text) 7%, transparent);
    color: color-mix(in srgb, var(--rag-text) 76%, var(--rag-gold-strong));
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.92em;
  }

  .markdown-body pre {
    max-width: 100%;
    margin: 8px 0 10px;
    padding: 11px 12px;
    overflow-x: auto;
    border-radius: 10px;
    background: color-mix(in srgb, #0f172a 90%, var(--rag-text));
    color: #f8fafc;
  }

  .markdown-body pre code {
    padding: 0;
    color: inherit;
    background: transparent;
  }

  .markdown-body blockquote {
    margin: 8px 0 10px;
    padding: 8px 10px;
    border-left: 3px solid var(--rag-gold);
    border-radius: 0 var(--rag-radius-card) var(--rag-radius-card) 0;
    background: color-mix(in srgb, var(--rag-secondary-soft) 64%, transparent);
    color: color-mix(in srgb, var(--rag-text) 72%, var(--rag-muted));
  }

  .markdown-body a {
    color: var(--rag-gold-strong);
    font-weight: 750;
    text-decoration: none;
    border-bottom: 1px solid color-mix(in srgb, var(--rag-gold) 32%, transparent);
  }

  .bubble-card.error {
    color: #9f1d1d;
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 247, 247, 0.96);
  }

  .message-row.assistant .bubble-card::before {
    display: none;
  }

  .message-row.user .bubble-card {
    color: var(--rag-primary-contrast);
    background:
      linear-gradient(145deg, var(--rag-user-message-start), var(--rag-user-message-end));
    border-color: color-mix(in srgb, var(--rag-gold) 46%, transparent);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.16) inset,
      0 8px 18px color-mix(in srgb, var(--rag-gold) 16%, transparent);
    text-align: left;
  }

  .message-time {
    margin-top: 7px;
    color: color-mix(in srgb, var(--rag-muted) 82%, transparent);
    font-size: 11.5px;
    line-height: 1;
  }

  .message-row.user .message-time {
    color: var(--rag-muted);
  }

  .typing {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-left: 8px;
    min-width: 46px;
    height: 18px;
    vertical-align: middle;
  }

  .typing span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--rag-gold);
    animation: typing 1.05s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }

  .typing span:nth-child(2) {
    animation-delay: 0.12s;
  }

  .typing span:nth-child(3) {
    animation-delay: 0.24s;
  }

  .source-references {
    width: min(100%, 420px);
    margin-top: 8px;
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: 12px;
    background: transparent;
  }

  .source-references[open] .source-summary-icon {
    transform: rotate(180deg);
  }

  .source-summary {
    display: flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    min-height: 27px;
    padding: 0 9px;
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-muted) 78%, var(--rag-text));
    cursor: pointer;
    outline: none;
    list-style: none;
    user-select: none;
    transition:
      background 0.14s ease,
      color 0.14s ease;
  }

  .source-summary:hover {
    color: var(--rag-text);
    background: color-mix(in srgb, var(--rag-secondary) 64%, transparent);
  }

  .source-summary:focus-visible {
    border-radius: 999px;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--rag-gold) 16%, transparent);
  }

  .source-summary::-webkit-details-marker {
    display: none;
  }

  .source-summary-label {
    font-size: 12.5px;
    font-weight: 760;
  }

  .source-count {
    min-width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    border-radius: 999px;
    color: var(--rag-gold-strong);
    background: color-mix(in srgb, var(--rag-gold-soft) 68%, transparent);
    font-size: 10.5px;
    font-weight: 820;
    line-height: 1;
  }

  .source-summary-icon {
    margin-left: 0;
    display: inline-flex;
    color: var(--rag-muted);
    transition:
      transform 0.16s ease,
      color 0.14s ease;
  }

  .source-summary-icon svg,
  .source-summary-icon .iconify-icon {
    width: 17px;
    height: 17px;
  }

  .source-reference-list {
    display: grid;
    gap: 0;
    margin-top: 5px;
    padding: 5px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 62%, transparent);
    border-radius: 12px;
    background: var(--rag-control-surface);
    animation: source-list-in 0.16s ease-out;
  }

  .source-reference-row {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr) auto;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    padding: 5px 7px;
    border: 0;
    border-radius: 9px;
    color: var(--rag-text);
    background: transparent;
    text-decoration: none;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .source-reference-row:hover {
    background: color-mix(in srgb, var(--rag-secondary) 70%, transparent);
  }

  .source-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--rag-gold-strong);
    border-radius: 6px;
    background: color-mix(in srgb, var(--rag-gold-soft) 42%, transparent);
  }

  .source-icon svg,
  .source-icon .iconify-icon {
    width: 13px;
    height: 13px;
  }

  .source-main {
    display: block;
    min-width: 0;
  }

  .source-title {
    overflow: hidden;
    color: var(--rag-text);
    font-size: 12.5px;
    font-weight: 700;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .source-side {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    color: var(--rag-muted);
    white-space: nowrap;
  }

  .source-link-icon {
    display: inline-flex;
    color: var(--rag-gold-strong);
  }

  .source-link-icon svg,
  .source-link-icon .iconify-icon {
    width: 14px;
    height: 14px;
  }

  .composer-wrap {
    padding: 11px 18px 9px;
    border-top: 1px solid var(--rag-divider);
    background: var(--rag-footer-surface);
  }

  .composer {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 7px 7px 7px 12px;
    border-radius: calc(var(--rag-radius-card) + 2px);
    border: 1px solid color-mix(in srgb, var(--rag-line) 82%, var(--rag-gold) 7%);
    background: var(--rag-input-surface-resolved);
    box-shadow: var(--rag-control-shadow);
    min-width: 0;
    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;
  }

  .composer:focus-within {
    border-color: var(--rag-ring);
    background: color-mix(in srgb, var(--rag-input-surface-resolved) 92%, var(--rag-text) 3%);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--rag-gold) 13%, transparent),
      var(--rag-control-shadow);
  }

  .input {
    flex: 1;
    min-width: 0;
    max-height: 120px;
    min-height: 30px;
    padding: 8px 0;
    resize: none;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--rag-text);
    font-size: 13.5px;
    line-height: 1.5;
  }

  .input:focus-visible {
    outline: none;
  }

  .input::placeholder {
    color: color-mix(in srgb, var(--rag-muted) 78%, transparent);
  }

  .send {
    flex: 0 0 auto;
    width: 37px;
    height: 37px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: calc(var(--rag-radius-card) + 1px);
    color: var(--rag-primary-contrast);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 92%, white), var(--rag-gold-strong));
    box-shadow:
      0 10px 22px color-mix(in srgb, var(--rag-gold) 18%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.24);
    cursor: pointer;
    transition:
      transform 0.14s ease,
      filter 0.14s ease,
      opacity 0.14s ease,
      box-shadow 0.14s ease;
  }

  .send:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }

  .send:active:not(:disabled) {
    transform: translateY(0) scale(0.96);
  }

  .send:disabled {
    cursor: not-allowed;
    opacity: 0.44;
    box-shadow: none;
  }

  .send svg,
  .send .iconify-icon {
    width: 19px;
    height: 19px;
  }

  .disclaimer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--rag-muted);
    font-size: 11.5px;
    padding: 0 20px 12px;
    background: var(--rag-footer-surface);
  }

  .disclaimer svg,
  .disclaimer .iconify-icon {
    width: 14px;
    height: 14px;
  }

  @keyframes shell-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.976);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes popover-in {
    from {
      opacity: 0;
      transform: translate(-50%, calc(-100% + 6px)) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%) scale(1);
    }
  }

  @keyframes message-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes source-list-in {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes typing {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.38;
    }
    40% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }

  @media (max-width: 980px) {
    .window-shell {
      right: 16px;
      bottom: 16px;
      width: min(536px, calc(100vw - 32px));
      grid-template-columns: minmax(0, 1fr);
    }

    .window-shell.fullscreen {
      inset: 16px;
      width: auto;
      max-width: none;
      grid-template-columns: minmax(0, 1fr);
    }

    :host([position='left']) .window-shell {
      left: 16px;
      right: auto;
    }

    :host([position='left']) .window-shell.fullscreen {
      left: 16px;
      right: 16px;
    }
  }

  @media (max-width: 960px) {
    :host,
    :host([position='left']) {
      right: 16px;
      left: auto;
      bottom: 16px;
    }

    .bubble,
    .bubble-wrapper {
      width: var(--rag-pet-width, 76px);
      min-width: var(--rag-pet-width, 76px);
      height: var(--rag-pet-height, 82px);
    }

    .pet-speech {
      max-width: min(176px, calc(100vw - 32px));
      font-size: 11.5px;
    }

    .window-shell {
      position: fixed;
      inset: 0;
      display: block;
      transform-origin: center;
    }

    .window-shell.fullscreen {
      inset: 0;
    }

    .chat-window {
      width: 100vw;
      height: 100dvh;
      min-height: 0;
      border-radius: 0;
      border: 0;
    }

    .chat-header {
      padding: 12px 12px 11px;
    }

    .avatar {
      width: 34px;
      height: 34px;
    }

    .title {
      font-size: 14px;
    }

    .subtitle {
      display: none;
    }

    .icon-button {
      width: 30px;
      height: 30px;
      box-shadow: none;
    }

    .messages {
      padding: 18px 13px 10px;
    }

    .message-stack {
      max-width: 84%;
    }

    .message-row {
      margin-bottom: 18px;
    }

    .composer-wrap {
      padding: 0 12px 11px;
    }

    .disclaimer {
      padding: 0 12px 10px;
    }

    .source-reference-row {
      grid-template-columns: 20px minmax(0, 1fr);
    }

    .source-side {
      grid-column: 2;
      justify-content: flex-start;
    }
  }
`;
