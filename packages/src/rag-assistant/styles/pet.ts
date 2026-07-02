import { css } from 'lit';

export const petStyles = css`
  .bubble-wrapper {
    position: relative;
    z-index: 100001;
    display: inline-flex;
    width: var(--rag-pet-width, 76px);
    height: var(--rag-pet-height, 82px);
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

  :host([position='right']) .pet-speech,
  :host([position='right']) .pet-panel {
    right: 0;
  }

  :host([position='left']) .pet-speech,
  :host([position='left']) .pet-panel {
    left: 0;
  }

  .pet-panel {
    position: absolute;
    z-index: 4;
    bottom: calc(100% + 12px);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(410px, calc(100vw - 32px));
    height: min(var(--rag-pet-panel-height, 318px), calc(100dvh - 132px));
    padding: 13px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 62%, white);
    border-radius: var(--rag-radius-panel, 20px);
    background:
      radial-gradient(circle at 14% 0%, color-mix(in srgb, var(--rag-gold) 11%, transparent), transparent 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), color-mix(in srgb, var(--rag-panel) 92%, white));
    box-shadow:
      0 22px 58px rgba(15, 23, 42, 0.18),
      0 8px 20px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
    text-align: left;
    overflow: hidden;
    transform-origin: bottom right;
    animation: pet-panel-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(18px) saturate(1.05);
    -webkit-backdrop-filter: blur(18px) saturate(1.05);
  }

  .pet-panel.resizing {
    animation: none;
    user-select: none;
  }

  .pet-panel-resize {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 2;
    width: 72px;
    height: 18px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    cursor: ns-resize;
    transform: translateX(-50%);
    touch-action: none;
  }

  .pet-panel-resize::before {
    content: "";
    position: absolute;
    top: 5px;
    left: 16px;
    right: 16px;
    height: 3px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--rag-muted) 28%, transparent);
    opacity: 0.52;
    transition:
      opacity 0.14s ease,
      background 0.14s ease,
      transform 0.14s ease;
  }

  .pet-panel-resize:hover::before,
  .pet-panel-resize:focus-visible::before,
  .pet-panel.resizing .pet-panel-resize::before {
    opacity: 0.9;
    background: color-mix(in srgb, var(--rag-gold) 54%, var(--rag-muted));
    transform: scaleX(1.18);
  }

  .pet-panel-content {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .pet-panel-thread {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    margin-bottom: 10px;
    overflow: auto;
    padding: 2px 2px 4px;
    scroll-behavior: smooth;
    scrollbar-width: thin;
  }

  .pet-panel-message {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-width: 92%;
    min-width: 0;
  }

  .pet-panel-message.user {
    align-self: flex-end;
    align-items: flex-end;
  }

  .pet-panel-message.assistant {
    align-self: flex-start;
    align-items: flex-start;
  }

  .pet-panel-message-meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: color-mix(in srgb, var(--rag-muted) 82%, transparent);
    font-size: 10.5px;
    font-weight: 680;
    line-height: 1;
  }

  .pet-message-actions {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    opacity: 0;
    transform: translateY(1px);
    transition:
      opacity 0.14s ease,
      transform 0.14s ease;
  }

  .pet-panel-message:hover .pet-message-actions,
  .pet-panel-message:focus-within .pet-message-actions {
    opacity: 1;
    transform: translateY(0);
  }

  .pet-message-actions button {
    display: inline-grid;
    place-items: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid color-mix(in srgb, var(--rag-line) 68%, transparent);
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-muted) 82%, var(--rag-text));
    background: color-mix(in srgb, var(--rag-paper) 82%, transparent);
    cursor: pointer;
  }

  .pet-message-actions button:hover:not(:disabled) {
    color: var(--rag-gold-strong);
    border-color: color-mix(in srgb, var(--rag-gold) 24%, var(--rag-line));
  }

  .pet-message-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }

  .pet-message-actions svg,
  .pet-message-actions .iconify-icon {
    width: 12px;
    height: 12px;
  }

  .pet-panel-message-meta time {
    font-weight: 560;
  }

  .pet-panel-bubble {
    max-width: 100%;
    padding: 9px 10px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 68%, transparent);
    border-radius: 14px;
    color: #263244;
    background: color-mix(in srgb, var(--rag-paper) 84%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.54);
    font-size: 12.8px;
    line-height: 1.62;
    overflow-wrap: anywhere;
  }

  .pet-panel-message.user .pet-panel-bubble {
    color: var(--rag-primary-contrast);
    border-color: color-mix(in srgb, var(--rag-gold) 46%, transparent);
    background:
      linear-gradient(145deg, var(--rag-user-message-start), var(--rag-user-message-end));
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.18) inset,
      0 8px 18px color-mix(in srgb, var(--rag-gold) 12%, transparent);
  }

  .pet-panel-bubble.error {
    color: #9f1d1d;
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 247, 247, 0.94);
  }

  .pet-panel-bubble.streaming {
    border-color: color-mix(in srgb, var(--rag-gold) 30%, var(--rag-line));
  }

  .pet-panel-sources {
    max-width: 100%;
  }

  .pet-panel-sources summary {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 24px;
    padding: 0 9px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 72%, transparent);
    border-radius: 999px;
    color: var(--rag-gold-strong);
    background: color-mix(in srgb, var(--rag-gold-faint) 68%, white);
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 760;
    list-style: none;
  }

  .pet-panel-sources summary::-webkit-details-marker {
    display: none;
  }

  .pet-panel-sources .pet-source-list {
    margin-top: 6px;
  }

  .pet-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .pet-panel-title-wrap {
    display: inline-grid;
    grid-template-columns: 32px minmax(0, 1fr);
    align-items: center;
    gap: 9px;
    min-width: 0;
  }

  .pet-panel-avatar {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    overflow: hidden;
    border-radius: 12px;
    color: var(--rag-primary-contrast);
    background:
      radial-gradient(circle at 34% 20%, rgba(255, 255, 255, 0.24), transparent 28%),
      linear-gradient(145deg, var(--rag-gold), var(--rag-gold-strong));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 20%, transparent),
      0 8px 18px color-mix(in srgb, var(--rag-gold) 12%, transparent);
    font-size: 12px;
    font-weight: 840;
  }

  .pet-panel-avatar.has-image {
    background: color-mix(in srgb, var(--rag-paper) 88%, white);
  }

  .pet-panel-avatar-fallback {
    position: relative;
    z-index: 1;
  }

  .pet-panel-avatar.has-image .pet-panel-avatar-fallback {
    opacity: 0;
  }

  .pet-panel-avatar-image {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pet-panel-title {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .pet-panel-kicker {
    overflow: hidden;
    color: color-mix(in srgb, var(--rag-muted) 82%, var(--rag-text));
    font-size: 11px;
    font-weight: 740;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-panel-title strong {
    max-width: 220px;
    overflow: hidden;
    color: var(--rag-text);
    font-size: 15px;
    font-weight: 850;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-panel-actions {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .pet-panel-action,
  .pet-source-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 28px;
    padding: 0 9px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 72%, transparent);
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-text) 76%, var(--rag-muted));
    background: color-mix(in srgb, var(--rag-paper) 82%, transparent);
    box-shadow: 0 5px 12px rgba(15, 23, 42, 0.04);
    cursor: pointer;
    font-size: 12px;
    font-weight: 760;
    line-height: 1;
    white-space: nowrap;
    transition:
      transform 0.14s ease,
      background 0.14s ease,
      color 0.14s ease,
      border-color 0.14s ease;
  }

  .pet-panel-action {
    position: relative;
    width: 32px;
    min-width: 32px;
    padding: 0;
  }

  .pet-panel-action[data-tooltip]::before,
  .pet-panel-action[data-tooltip]::after {
    position: absolute;
    right: 0;
    z-index: 8;
    pointer-events: none;
    opacity: 0;
    transform: translateY(3px);
    transition:
      opacity 0.14s ease,
      transform 0.14s ease;
  }

  .pet-panel-action[data-tooltip]::before {
    content: "";
    top: calc(100% + 3px);
    width: 8px;
    height: 8px;
    margin-right: 12px;
    border-left: 1px solid color-mix(in srgb, var(--rag-line) 76%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--rag-line) 76%, transparent);
    background: color-mix(in srgb, var(--rag-paper) 96%, white);
    transform: translateY(3px) rotate(45deg);
  }

  .pet-panel-action[data-tooltip]::after {
    content: attr(data-tooltip);
    top: calc(100% + 7px);
    min-width: max-content;
    max-width: 160px;
    padding: 6px 8px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 76%, transparent);
    border-radius: 9px;
    color: var(--rag-text);
    background: color-mix(in srgb, var(--rag-paper) 96%, white);
    box-shadow:
      0 10px 24px rgba(15, 23, 42, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.58);
    font-size: 11px;
    font-weight: 760;
    line-height: 1;
    white-space: nowrap;
  }

  .pet-panel-action[data-tooltip]:hover::before,
  .pet-panel-action[data-tooltip]:hover::after,
  .pet-panel-action[data-tooltip]:focus-visible::before,
  .pet-panel-action[data-tooltip]:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
  }

  .pet-panel-action[data-tooltip]:hover::before,
  .pet-panel-action[data-tooltip]:focus-visible::before {
    transform: translateY(0) rotate(45deg);
  }

  .pet-panel-action.is-primary {
    color: var(--rag-primary-contrast);
    border-color: color-mix(in srgb, var(--rag-gold) 42%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 92%, white), var(--rag-gold-strong));
  }

  .pet-panel-action.is-danger {
    color: #b91c1c;
    border-color: rgba(239, 68, 68, 0.18);
    background: rgba(254, 242, 242, 0.82);
  }

  .pet-panel-action:hover,
  .pet-source-link:hover {
    transform: translateY(-1px);
    color: var(--rag-text);
    border-color: color-mix(in srgb, var(--rag-gold) 22%, var(--rag-line));
    background: var(--rag-paper);
  }

  .pet-panel-action.is-primary:hover {
    color: var(--rag-primary-contrast);
    background: linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 94%, white), var(--rag-gold-strong));
  }

  .pet-panel-action svg,
  .pet-panel-action .iconify-icon,
  .pet-source-link svg,
  .pet-source-link .iconify-icon {
    width: 14px;
    height: 14px;
  }

  .pet-context,
  .pet-answer,
  .pet-panel-empty {
    min-height: 0;
    margin-bottom: 10px;
    border-radius: 14px;
  }

  .pet-context {
    position: relative;
    display: grid;
    gap: 4px;
    padding: 8px 34px 8px 10px;
    border: 1px solid color-mix(in srgb, var(--rag-gold) 18%, var(--rag-line));
    background: color-mix(in srgb, var(--rag-gold-faint) 82%, white);
  }

  .pet-context span {
    color: var(--rag-gold-strong);
    font-size: 11px;
    font-weight: 820;
    line-height: 1;
  }

  .pet-context p {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    color: #475569;
    font-size: 12px;
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .pet-context button {
    position: absolute;
    top: 7px;
    right: 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-muted) 86%, var(--rag-text));
    background: transparent;
    cursor: pointer;
  }

  .pet-answer {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: 10px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 68%, transparent);
    background: color-mix(in srgb, var(--rag-paper) 84%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.54);
  }

  .pet-answer.error {
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 247, 247, 0.94);
  }

  .pet-answer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 7px;
    color: color-mix(in srgb, var(--rag-muted) 86%, transparent);
    font-size: 11px;
    line-height: 1;
  }

  .pet-answer-meta span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-answer-meta time {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .pet-answer-body {
    flex: 1 1 auto;
    max-height: none;
    min-height: 0;
    overflow: auto;
    color: #263244;
    font-size: 12.8px;
    line-height: 1.62;
    scrollbar-width: thin;
  }

  .pet-source-link {
    margin-top: 8px;
    min-height: 26px;
    color: var(--rag-gold-strong);
    background: color-mix(in srgb, var(--rag-gold-faint) 68%, white);
  }

  .pet-panel-empty {
    flex: 1 1 auto;
    display: grid;
    align-content: start;
    gap: 10px;
    padding: 11px;
    overflow: auto;
    border: 1px dashed color-mix(in srgb, var(--rag-line) 74%, transparent);
    color: color-mix(in srgb, var(--rag-muted) 90%, var(--rag-text));
    background: color-mix(in srgb, var(--rag-panel) 76%, white);
  }

  .pet-panel-welcome {
    margin: 0;
    color: #263244;
    font-size: 12.8px;
    font-weight: 680;
    line-height: 1.58;
    white-space: pre-line;
  }

  .pet-panel-quick {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }

  .pet-panel-quick button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    min-height: 28px;
    padding: 0 9px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 72%, transparent);
    border-radius: 999px;
    color: color-mix(in srgb, var(--rag-text) 78%, var(--rag-muted));
    background: color-mix(in srgb, var(--rag-paper) 82%, transparent);
    box-shadow: 0 5px 12px rgba(15, 23, 42, 0.04);
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 760;
    line-height: 1;
    transition:
      transform 0.14s ease,
      color 0.14s ease,
      background 0.14s ease,
      border-color 0.14s ease;
  }

  .pet-panel-quick button:hover {
    transform: translateY(-1px);
    color: var(--rag-text);
    border-color: color-mix(in srgb, var(--rag-gold) 22%, var(--rag-line));
    background: var(--rag-paper);
  }

  .pet-panel-quick svg,
  .pet-panel-quick .iconify-icon {
    flex: 0 0 auto;
    width: 13px;
    height: 13px;
  }

  .pet-panel-quick span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (hover: none) {
    .pet-message-actions {
      opacity: 1;
      transform: none;
    }
  }
`;
