import { css } from 'lit';

export const stageStyles = css`
  .pet-stage-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99997;
    background:
      radial-gradient(circle at 50% 28%, rgba(32, 68, 148, 0.2), transparent 34%),
      radial-gradient(circle at 34% 72%, color-mix(in srgb, var(--rag-gold) 18%, transparent), transparent 28%),
      linear-gradient(180deg, rgba(8, 10, 16, 0.43), rgba(5, 7, 12, 0.74));
    backdrop-filter: blur(5px) saturate(0.9);
    -webkit-backdrop-filter: blur(5px) saturate(0.9);
    animation: stage-backdrop-in 0.2s ease-out;
  }

  .pet-stage {
    position: fixed;
    z-index: 99999;
    inset: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: clamp(12px, 2vh, 22px);
    min-width: 0;
    overflow: visible;
    padding:
      clamp(20px, 4vh, 46px)
      max(28px, calc((100vw - 1680px) / 2 + 42px))
      clamp(18px, 3.6vh, 42px);
    background: transparent;
    pointer-events: none;
    animation: stage-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pet-stage-head {
    width: min(1360px, 100%);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0;
    pointer-events: auto;
  }

  .pet-stage-title {
    display: grid;
    align-items: start;
    min-width: 0;
    gap: 5px;
  }

  .pet-stage-title span {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.76);
    font-size: 14px;
    font-weight: 840;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.28);
  }

  .pet-stage-title strong {
    color: rgba(255, 255, 255, 0.92);
    font-size: 20px;
    font-weight: 860;
    line-height: 1.18;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.34);
  }

  .pet-stage-actions {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .pet-stage-action,
  .pet-stage-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: rgba(255, 255, 255, 0.86);
    background: rgba(255, 255, 255, 0.16);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
    cursor: pointer;
    transition:
      transform 0.14s ease,
      background 0.14s ease,
      color 0.14s ease,
      border-color 0.14s ease;
    backdrop-filter: blur(16px) saturate(1.1);
    -webkit-backdrop-filter: blur(16px) saturate(1.1);
  }

  .pet-stage-action {
    gap: 6px;
    min-height: 40px;
    padding: 0 15px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 780;
    white-space: nowrap;
  }

  .pet-stage-close {
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 999px;
  }

  .pet-stage-action:hover,
  .pet-stage-close:hover {
    transform: translateY(-1px);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.26);
    background: rgba(255, 255, 255, 0.24);
  }

  .pet-stage-action.is-danger {
    color: rgba(255, 226, 226, 0.96);
    border-color: rgba(248, 113, 113, 0.24);
    background: rgba(127, 29, 29, 0.28);
  }

  .pet-stage-action:disabled,
  .pet-stage-shortcuts button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
    transform: none;
  }

  .pet-stage-action svg,
  .pet-stage-action .iconify-icon,
  .pet-stage-close svg,
  .pet-stage-close .iconify-icon {
    width: 15px;
    height: 15px;
  }

  .pet-stage-output {
    align-self: stretch;
    width: min(1320px, 100%);
    margin: 0 auto;
    min-height: 0;
    max-height: none;
    overflow: auto;
    padding: clamp(28px, 5vh, 70px) 4px 6px;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    scroll-behavior: smooth;
    pointer-events: auto;
    mask-image: linear-gradient(180deg, transparent 0, #000 28px, #000 calc(100% - 10px), transparent 100%);
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 28px, #000 calc(100% - 10px), transparent 100%);
  }

  .pet-stage-output-inner {
    width: min(1180px, 100%);
    margin: 0 auto;
  }

  .pet-stage-output::-webkit-scrollbar {
    width: 10px;
  }

  .pet-stage-output::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background:
      linear-gradient(rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.24))
      content-box;
  }

  .pet-stage-message {
    display: flex;
    gap: 14px;
    margin-bottom: 24px;
    min-width: 0;
    animation: message-in 0.18s ease-out both;
  }

  .pet-stage-message.user {
    justify-content: flex-end;
  }

  .pet-stage-avatar {
    position: relative;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    margin-top: 1px;
    border-radius: 999px;
    color: var(--rag-primary-contrast);
    background:
      radial-gradient(circle at 32% 20%, rgba(255, 255, 255, 0.24), transparent 26%),
      linear-gradient(145deg, var(--rag-gold), var(--rag-gold-strong));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--rag-gold) 22%, transparent),
      0 5px 14px color-mix(in srgb, var(--rag-gold) 12%, transparent);
    font-size: 12px;
    font-weight: 820;
    overflow: hidden;
  }

  .pet-stage-avatar.has-image {
    background: color-mix(in srgb, var(--rag-paper) 86%, white);
  }

  .pet-stage-avatar-fallback {
    position: relative;
    z-index: 1;
  }

  .pet-stage-avatar.has-image .pet-stage-avatar-fallback {
    opacity: 0;
  }

  .pet-stage-avatar-image {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pet-stage-message-stack {
    flex: 0 1 auto;
    min-width: 0;
    width: fit-content;
    max-width: min(92%, 960px);
  }

  .pet-stage-message.assistant .pet-stage-message-stack {
    width: min(100%, 1120px);
    max-width: min(100%, 1120px);
  }

  .pet-stage-message.user .pet-stage-message-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    max-width: min(72%, 620px);
  }

  .pet-stage-bubble {
    position: relative;
    display: inline-block;
    width: fit-content;
    max-width: 100%;
    padding: 12px 15px 13px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(18, 22, 32, 0.42);
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    font-size: 14px;
    line-height: 1.72;
    word-break: break-word;
    overflow-wrap: anywhere;
    backdrop-filter: blur(18px) saturate(1.08);
    -webkit-backdrop-filter: blur(18px) saturate(1.08);
  }

  .pet-stage-message.assistant .pet-stage-bubble {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    border-radius: 0;
    color: rgba(255, 255, 255, 0.9);
    background: transparent;
    box-shadow: none;
    font-size: clamp(17px, 1.28vw, 22px);
    line-height: 1.9;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.34);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .pet-stage-bubble.streaming {
    border-color: color-mix(in srgb, var(--rag-gold) 30%, var(--rag-line));
  }

  .pet-stage-bubble.error {
    color: #9f1d1d;
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 247, 247, 0.96);
  }

  .pet-stage-message.user .pet-stage-bubble {
    padding: 12px 15px 13px;
    border-radius: 20px;
    color: var(--rag-primary-contrast);
    background:
      linear-gradient(145deg, var(--rag-user-message-start), var(--rag-user-message-end));
    border-color: color-mix(in srgb, var(--rag-gold) 46%, transparent);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.16) inset,
      0 8px 18px color-mix(in srgb, var(--rag-gold) 16%, transparent);
  }

  .pet-stage-message-actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    opacity: 0;
    transform: translateY(2px);
    transition:
      opacity 0.14s ease,
      transform 0.14s ease;
  }

  .pet-stage-message:hover .pet-stage-message-actions,
  .pet-stage-message:focus-within .pet-stage-message-actions {
    opacity: 1;
    transform: translateY(0);
  }

  .pet-stage-message-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 26px;
    padding: 0 9px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.11);
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 740;
    backdrop-filter: blur(14px) saturate(1.06);
    -webkit-backdrop-filter: blur(14px) saturate(1.06);
  }

  .pet-stage-message-actions button:hover:not(:disabled) {
    color: #fff;
    background: rgba(255, 255, 255, 0.17);
  }

  .pet-stage-message-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }

  .pet-stage-message-actions svg,
  .pet-stage-message-actions .iconify-icon {
    width: 13px;
    height: 13px;
  }

  .pet-stage-message.user .pet-stage-message-actions button {
    color: var(--rag-muted);
    border-color: color-mix(in srgb, var(--rag-line) 70%, transparent);
    background: color-mix(in srgb, var(--rag-paper) 72%, transparent);
  }

  .pet-stage .markdown-body h1,
  .pet-stage .markdown-body h2,
  .pet-stage .markdown-body h3,
  .pet-stage .markdown-body h4,
  .pet-stage .markdown-body h5,
  .pet-stage .markdown-body h6 {
    color: rgba(255, 255, 255, 0.94);
  }

  .pet-stage .markdown-body hr {
    background: rgba(255, 255, 255, 0.18);
  }

  .pet-stage .markdown-body code {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.92);
  }

  .pet-stage .markdown-body blockquote {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.78);
  }

  .pet-stage .markdown-body th,
  .pet-stage .markdown-body td {
    border-color: rgba(255, 255, 255, 0.16);
  }

  .pet-stage .markdown-body th {
    background: rgba(255, 255, 255, 0.11);
  }

  .pet-stage .markdown-body a {
    color: rgba(255, 236, 192, 0.96);
    border-bottom-color: rgba(255, 236, 192, 0.28);
  }

  .pet-stage-time {
    margin-top: 7px;
    color: rgba(255, 255, 255, 0.54);
    font-size: 11.5px;
    line-height: 1;
  }

  .pet-stage-message.user .pet-stage-time {
    color: var(--rag-muted);
  }

  .pet-stage-sources {
    margin-top: 8px;
  }

  .pet-stage-sources summary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.14);
    cursor: pointer;
    font-size: 12px;
    font-weight: 780;
    list-style: none;
  }

  .pet-stage-sources summary::-webkit-details-marker {
    display: none;
  }

  .pet-stage-sources summary svg,
  .pet-stage-sources summary .iconify-icon {
    width: 14px;
    height: 14px;
  }

  .pet-stage-sources .pet-source-list {
    margin-top: 6px;
    width: min(100%, 560px);
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(18px) saturate(1.08);
    -webkit-backdrop-filter: blur(18px) saturate(1.08);
  }

  .pet-stage-sources .pet-source-row {
    color: rgba(255, 255, 255, 0.82);
  }

  .pet-stage-sources .pet-source-row:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.13);
  }

  .pet-stage-sources .pet-source-icon,
  .pet-stage-sources .pet-source-open {
    color: rgba(255, 236, 192, 0.92);
  }

  .pet-stage-sources .pet-source-icon {
    background: rgba(255, 255, 255, 0.12);
  }

  .pet-stage-footer {
    width: min(980px, 100%);
    margin: 0 auto;
    padding: 0;
    background: transparent;
    pointer-events: auto;
  }

  .pet-stage-shortcuts {
    display: flex;
    justify-content: center;
    gap: 2px;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto 10px;
    overflow-x: auto;
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    background: rgba(14, 18, 28, 0.22);
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    scrollbar-width: none;
    backdrop-filter: blur(18px) saturate(1.08);
    -webkit-backdrop-filter: blur(18px) saturate(1.08);
  }

  .pet-stage-shortcuts::-webkit-scrollbar {
    display: none;
  }

  .pet-stage-shortcuts button {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 11px;
    border: 0;
    border-radius: 13px;
    color: rgba(255, 255, 255, 0.76);
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 720;
    white-space: nowrap;
    transition:
      transform 0.14s ease,
      color 0.14s ease,
      background 0.14s ease,
      border-color 0.14s ease;
  }

  .pet-stage-shortcuts button:hover:not(:disabled) {
    transform: translateY(-1px);
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
  }

  .pet-stage-shortcuts svg,
  .pet-stage-shortcuts .iconify-icon {
    width: 16px;
    height: 16px;
  }

  .pet-stage-note {
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 680;
    text-align: center;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.34);
  }

  .pet-stage .composer-wrap {
    width: min(980px, 100%);
  }

  .pet-stage .composer {
    min-height: 96px;
    padding: 16px 16px 14px 20px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 24px;
    background:
      radial-gradient(circle at 14% 12%, rgba(255, 255, 255, 0.08), transparent 26%),
      linear-gradient(112deg, rgba(73, 61, 76, 0.42), rgba(37, 73, 67, 0.38) 52%, rgba(42, 58, 100, 0.44));
    box-shadow:
      0 22px 60px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      inset 0 -1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(24px) saturate(1.08);
    -webkit-backdrop-filter: blur(24px) saturate(1.08);
  }

  .pet-stage .composer:focus-within {
    border-color: rgba(255, 255, 255, 0.2);
    background:
      radial-gradient(circle at 14% 12%, rgba(255, 255, 255, 0.1), transparent 26%),
      linear-gradient(112deg, rgba(78, 64, 80, 0.5), rgba(38, 83, 73, 0.46) 52%, rgba(43, 60, 112, 0.52));
    box-shadow:
      0 24px 66px rgba(0, 0, 0, 0.26),
      0 0 0 1px rgba(255, 255, 255, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.16);
  }

  .pet-stage .input {
    min-height: 58px;
    max-height: 150px;
    padding: 5px 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 16.5px;
    font-weight: 590;
    line-height: 1.55;
  }

  .pet-stage .input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .pet-stage .send {
    width: 42px;
    height: 42px;
    align-self: flex-end;
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.88);
    background: rgba(255, 255, 255, 0.15);
    box-shadow:
      0 12px 28px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }

  .pet-stage .send:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.23);
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

    .pet-panel {
      width: min(344px, calc(100vw - 32px));
      height: min(var(--rag-pet-panel-height, 318px), calc(100dvh - 132px));
      overflow: hidden;
    }

    .pet-panel-head {
      flex-direction: column;
      gap: 8px;
    }

    .pet-panel-actions {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .pet-stage {
      gap: 10px;
      padding: 14px 12px 16px;
    }

    .pet-stage-head {
      gap: 10px;
    }

    .pet-stage-title {
      display: grid;
      gap: 4px;
    }

    .pet-stage-title span {
      max-width: calc(100vw - 140px);
      font-size: 12px;
    }

    .pet-stage-title strong {
      font-size: 14px;
    }

    .pet-stage-output {
      padding: 16px 2px 4px;
    }

    .pet-stage-message-stack,
    .pet-stage-message.user .pet-stage-message-stack {
      max-width: 88%;
    }

    .pet-stage-message.assistant .pet-stage-message-stack {
      max-width: 100%;
      width: 100%;
    }

    .pet-stage-message.assistant .pet-stage-bubble {
      font-size: 16px;
      line-height: 1.82;
    }

    .pet-stage-footer {
      width: 100%;
    }

    .pet-stage-shortcuts {
      justify-content: flex-start;
      margin-bottom: 10px;
    }

    .pet-stage-shortcuts button {
      min-height: 36px;
      padding: 0 13px;
      font-size: 12px;
    }

    .pet-stage .composer {
      min-height: 96px;
      padding: 15px 15px 13px 18px;
      border-radius: 22px;
    }

    .pet-stage .input {
      min-height: 58px;
      font-size: 16px;
    }

    .pet-stage .send {
      width: 42px;
      height: 42px;
    }

    .pet-stage-note {
      margin-top: 10px;
      font-size: 11px;
    }
  }
`;
