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
    width: min(388px, calc(100vw - 32px));
    padding: 12px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 62%, white);
    border-radius: 20px;
    background:
      radial-gradient(circle at 14% 0%, color-mix(in srgb, var(--rag-gold) 11%, transparent), transparent 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), color-mix(in srgb, var(--rag-panel) 92%, white));
    box-shadow:
      0 22px 58px rgba(15, 23, 42, 0.18),
      0 8px 20px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
    text-align: left;
    transform-origin: bottom right;
    animation: pet-panel-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(18px) saturate(1.05);
    -webkit-backdrop-filter: blur(18px) saturate(1.05);
  }

  .pet-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
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
    color: #263244;
    font-size: 15px;
    font-weight: 850;
    line-height: 1.25;
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

  .pet-panel-action.is-primary {
    color: var(--rag-primary-contrast);
    border-color: color-mix(in srgb, var(--rag-gold) 42%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 92%, white), var(--rag-gold-strong));
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
    max-height: 150px;
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
    padding: 10px 11px;
    border: 1px dashed color-mix(in srgb, var(--rag-line) 74%, transparent);
    color: color-mix(in srgb, var(--rag-muted) 90%, var(--rag-text));
    background: color-mix(in srgb, var(--rag-panel) 76%, white);
    font-size: 12.5px;
    font-weight: 650;
  }
`;
