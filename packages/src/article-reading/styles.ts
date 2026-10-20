import { css, unsafeCSS } from 'lit';
import graphStyles from '../../../shared/insight-graph/graph.css?inline';

export const articleReadingStyles = [
  unsafeCSS(graphStyles),
  css`
    :host {
      display: block;
      width: 100%;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .reading-shell {
      --reading-bg: #fff;
      --reading-surface: #fafafa;
      --reading-text: #171717;
      --reading-muted: #737373;
      --reading-line: #e5e5e5;
      --likcc-reading-accent: #267566;
      overflow: hidden;
      margin: 24px 0;
      border: 1px solid var(--reading-line);
      border-radius: 16px;
      background: var(--reading-bg);
      color: var(--reading-text);
    }
    .reading-shell.is-dark {
      --reading-bg: #212121;
      --reading-surface: #1b1b1b;
      --reading-text: #ececec;
      --reading-muted: #a0a0a0;
      --reading-line: #3a3a3a;
      --likcc-reading-accent: #89c7b2;
    }
    .reading-shell * {
      box-sizing: border-box;
    }
    .reading-shell button {
      font: inherit;
      cursor: pointer;
    }
    .reading-shell button:focus-visible,
    .reading-shell textarea:focus-visible {
      outline: 2px solid var(--likcc-reading-accent);
      outline-offset: 3px;
    }
    .reading-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 22px;
      border-bottom: 1px solid var(--reading-line);
    }
    .reading-heading {
      display: flex;
      align-items: center;
      gap: 11px;
    }
    .reading-heading strong {
      display: block;
      font-size: 14px;
      font-weight: 550;
    }
    .reading-heading small {
      display: block;
      margin-top: 3px;
      color: var(--reading-muted);
      font-size: 11px;
    }
    .reading-mark {
      display: inline-grid;
      flex-shrink: 0;
      place-items: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--reading-line);
      border-radius: 9px;
      background: var(--reading-surface);
      color: var(--reading-text);
    }
    .reading-mark .reading-icon {
      width: 17px;
      height: 17px;
    }
    .reading-collapse {
      display: flex;
      align-items: center;
      gap: 7px;
      min-height: 32px;
      padding: 4px 9px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--reading-muted);
      font-size: 11px !important;
    }
    .reading-collapse:hover {
      background: var(--reading-surface);
    }
    .reading-collapsed {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 16px 20px;
      border: 0;
      background: transparent;
      color: var(--reading-text);
      text-align: left;
    }
    .reading-collapsed:hover {
      background: var(--reading-surface);
    }
    .reading-collapsed strong {
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 550;
    }
    .collapsed-summary {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
      color: var(--reading-muted);
    }
    .collapse-mark {
      display: inline-flex;
      color: var(--reading-muted);
    }
    .reading-icon {
      display: inline-block;
      flex-shrink: 0;
      vertical-align: middle;
    }
    .state-box {
      min-height: 170px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
      text-align: center;
      font-size: 12px;
      color: var(--reading-muted);
      line-height: 1.9;
    }
    .reading-shell .ig-reader {
      border: 0;
      border-radius: 0;
    }
    .question-composer {
      margin-top: 20px;
      padding-top: 18px;
      border-top: 1px solid var(--ig-line);
    }
    .question-input {
      display: block;
      width: 100%;
      min-height: 84px;
      resize: vertical;
      padding: 12px;
      border: 1px solid var(--ig-line);
      border-radius: 10px;
      background: var(--ig-surface);
      color: var(--ig-text);
      font: inherit;
      font-size: 12px;
      line-height: 1.8;
    }
    .question-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }
    .question-actions button {
      min-height: 30px;
      padding: 5px 12px;
      border: 1px solid var(--ig-line);
      border-radius: 999px;
      background: var(--ig-bg);
      color: var(--ig-muted);
      font-size: 11px;
    }
    .question-actions .primary-action {
      background: var(--ig-text);
      border-color: var(--ig-text);
      color: var(--ig-bg);
    }
    .question-actions button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .answer-box {
      margin-top: 16px;
      padding: 14px;
      border: 1px solid var(--ig-line);
      border-radius: 10px;
      background: var(--ig-surface);
      color: var(--ig-text);
      font-size: 12px;
      line-height: 1.9;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    @media (max-width: 640px) {
      .reading-header {
        padding: 15px 16px;
      }
      .reading-collapsed {
        gap: 9px;
        padding: 14px;
      }
      .reading-mark {
        width: 29px;
        height: 29px;
      }
    }
  `,
];
