import { css } from 'lit';

export const composerStyles = css`
  .composer-wrap {
    width: min(640px, 100%);
    margin: 0 auto;
  }

  .composer,
  .pet-composer {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 7px 7px 7px 11px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 82%, var(--rag-gold) 8%);
    border-radius: 16px;
    background: color-mix(in srgb, var(--rag-input-surface-resolved) 90%, white);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.055);
    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;
  }

  .composer:focus-within,
  .pet-composer:focus-within {
    border-color: var(--rag-ring);
    background: var(--rag-paper);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--rag-gold) 13%, transparent),
      0 8px 18px rgba(15, 23, 42, 0.055);
  }

  .input,
  .pet-composer-input {
    flex: 1;
    min-width: 0;
    max-height: 118px;
    min-height: 30px;
    padding: 8px 0;
    resize: none;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--rag-text);
    font-size: 13px;
    line-height: 1.5;
  }

  .pet-composer-input {
    max-height: 92px;
    min-height: 28px;
    padding: 7px 0;
  }

  .input:focus-visible,
  .pet-composer-input:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .input::placeholder,
  .pet-composer-input::placeholder {
    color: color-mix(in srgb, var(--rag-muted) 78%, transparent);
  }

  .send,
  .pet-send {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    padding: 0;
    border: 0;
    border-radius: 12px;
    color: var(--rag-primary-contrast);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--rag-gold) 92%, white), var(--rag-gold-strong));
    box-shadow:
      0 8px 18px color-mix(in srgb, var(--rag-gold) 17%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
    cursor: pointer;
    transition:
      transform 0.14s ease,
      filter 0.14s ease,
      opacity 0.14s ease;
  }

  .pet-send {
    width: 34px;
    height: 34px;
  }

  .send:hover:not(:disabled),
  .pet-send:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }

  .send:active:not(:disabled),
  .pet-send:active:not(:disabled) {
    transform: translateY(0) scale(0.96);
  }

  .send:disabled,
  .pet-send:disabled {
    cursor: not-allowed;
    opacity: 0.44;
    box-shadow: none;
  }

  .send svg,
  .send .iconify-icon,
  .pet-send svg,
  .pet-send .iconify-icon {
    width: 18px;
    height: 18px;
  }
`;
