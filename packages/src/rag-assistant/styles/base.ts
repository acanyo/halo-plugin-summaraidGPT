import { css } from 'lit';

export const baseStyles = css`
  :host {
    --rag-text: #18181b;
    --rag-muted: #71717a;
    --rag-line: rgba(24, 24, 27, 0.1);
    --rag-soft-line: rgba(24, 24, 27, 0.06);
    --rag-paper: rgba(255, 255, 255, 0.97);
    --rag-panel: #fafafa;
    --rag-secondary: #f4f4f5;
    --rag-secondary-soft: rgba(244, 244, 245, 0.62);
    --rag-gold: #a16207;
    --rag-gold-strong: #85510a;
    --rag-gold-soft: rgba(161, 98, 7, 0.16);
    --rag-gold-faint: rgba(161, 98, 7, 0.05);
    --rag-input-surface-resolved: #fdfdfd;
    --rag-user-message-start: var(--rag-gold);
    --rag-user-message-end: var(--rag-gold-strong);
    --rag-ring: rgba(161, 98, 7, 0.42);
    --rag-frost: rgba(255, 255, 255, 0.96);
    --rag-primary-glow: rgba(161, 98, 7, 0.16);
    --rag-code-surface: rgba(24, 24, 27, 0.07);
    --rag-link: #85510a;
    --rag-highlight-surface: #f5f2ed;
    --rag-hover-border: rgba(161, 98, 7, 0.28);
    --rag-error-text: #9f1d1d;
    --rag-error-surface: #fff7f7;
    --rag-error-border: rgba(220, 38, 38, 0.24);
    --rag-primary-contrast: #fff;
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
  textarea:focus-visible,
  summary:focus-visible,
  a:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px var(--rag-primary-glow),
      0 6px 16px rgba(15, 23, 42, 0.06);
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

  @keyframes pet-panel-in {
    from {
      opacity: 0;
      transform: translateY(9px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes stage-backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes stage-in {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
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
`;
