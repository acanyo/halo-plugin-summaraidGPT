import { css } from 'lit';

export const contentStyles = css`
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
  .markdown-body h4,
  .markdown-body h5,
  .markdown-body h6 {
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

  .markdown-body hr {
    height: 1px;
    margin: 12px 0;
    border: 0;
    background: color-mix(in srgb, var(--rag-line) 76%, transparent);
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
    background: #0f172a;
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
    border-radius: 0 12px 12px 0;
    background: color-mix(in srgb, var(--rag-secondary-soft) 64%, transparent);
    color: color-mix(in srgb, var(--rag-text) 72%, var(--rag-muted));
  }

  .markdown-body table {
    display: block;
    width: 100%;
    margin: 8px 0 10px;
    overflow-x: auto;
    border-collapse: collapse;
  }

  .markdown-body th,
  .markdown-body td {
    padding: 6px 8px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 72%, transparent);
    text-align: left;
    vertical-align: top;
  }

  .markdown-body th {
    background: color-mix(in srgb, var(--rag-secondary-soft) 58%, transparent);
    font-weight: 820;
  }

  .markdown-body a {
    color: var(--rag-gold-strong);
    font-weight: 750;
    text-decoration: none;
    border-bottom: 1px solid color-mix(in srgb, var(--rag-gold) 32%, transparent);
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

  .pet-compact-sources {
    margin-top: 8px;
    animation: source-list-in 0.16s ease-out;
  }

  .pet-source-list {
    display: grid;
    gap: 5px;
    padding: 5px;
    border: 1px solid color-mix(in srgb, var(--rag-line) 64%, transparent);
    border-radius: 13px;
    background: color-mix(in srgb, var(--rag-paper) 78%, transparent);
  }

  .pet-source-row {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr) 16px;
    align-items: start;
    gap: 7px;
    min-height: 32px;
    padding: 5px 7px;
    border-radius: 10px;
    color: #334155;
    text-decoration: none;
    transition:
      background 0.14s ease,
      color 0.14s ease;
  }

  .pet-source-row:hover {
    color: var(--rag-text);
    background: color-mix(in srgb, var(--rag-gold-faint) 74%, white);
  }

  .pet-source-icon,
  .pet-source-open {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--rag-gold-strong);
  }

  .pet-source-icon {
    width: 22px;
    height: 22px;
    margin-top: 1px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--rag-gold-soft) 34%, transparent);
  }

  .pet-source-main {
    display: grid;
    min-width: 0;
    gap: 2px;
  }

  .pet-source-title {
    overflow: hidden;
    color: inherit;
    font-size: 12px;
    font-weight: 720;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-source-meta {
    overflow: hidden;
    color: color-mix(in srgb, var(--rag-muted) 82%, transparent);
    font-size: 10.5px;
    font-weight: 650;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pet-source-icon svg,
  .pet-source-icon .iconify-icon,
  .pet-source-open svg,
  .pet-source-open .iconify-icon {
    width: 14px;
    height: 14px;
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
    animation: source-list-in 0.14s ease-out;
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
  }

  .selection-popover button:hover {
    background: var(--rag-secondary-soft);
  }

  .selection-popover svg,
  .selection-popover .iconify-icon {
    width: 16px;
    height: 16px;
  }
`;
