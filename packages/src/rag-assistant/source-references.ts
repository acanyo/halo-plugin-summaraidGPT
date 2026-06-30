import { html, nothing, type TemplateResult } from 'lit';
import { chevronDownIcon, externalLinkIcon, fileIcon } from './icons';
import type { RagSourceReference } from './types';

export interface SourceReferencesOptions {
  open: boolean;
  onToggle: (event: Event) => void;
}

export function renderSourceReferences(
  sources: RagSourceReference[],
  options: SourceReferencesOptions,
): TemplateResult | typeof nothing {
  if (!sources.length) {
    return nothing;
  }

  return html`
    <details class="source-references" ?open=${options.open} @toggle=${options.onToggle}>
      <summary class="source-summary">
        <span class="source-summary-label">参考来源</span>
        <span class="source-count">${sources.length}</span>
        <span class="source-summary-icon">${chevronDownIcon()}</span>
      </summary>
      <div class="source-reference-list">
        ${sources.map((source) => renderSourceRow(source))}
      </div>
    </details>
  `;
}

function renderSourceRow(source: RagSourceReference): TemplateResult {
  const content = html`
    <span class="source-icon">${fileIcon()}</span>
    <span class="source-main">
      <span class="source-title">${formatSourceTitle(source)}</span>
    </span>
    <span class="source-side">
      ${source.url ? html`<span class="source-link-icon" aria-hidden="true">${externalLinkIcon()}</span>` : nothing}
    </span>
  `;

  return source.url
    ? html`
        <a class="source-reference-row" href=${source.url} target="_blank" rel="noopener noreferrer">
          ${content}
        </a>
      `
    : html`<div class="source-reference-row">${content}</div>`;
}

function formatSourceTitle(source: RagSourceReference): string {
  const title = source.title?.trim();
  return title ? `《${title}》` : '未命名来源';
}
