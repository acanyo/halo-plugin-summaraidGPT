import { html, nothing, type TemplateResult } from 'lit';
import { externalLinkIcon, fileIcon } from './icons';
import type { RagSourceReference } from './types';

export function renderSourceList(sources: RagSourceReference[]): TemplateResult {
  return html`<div class="pet-source-list">${sources.map((source) => renderSourceRow(source))}</div>`;
}

function renderSourceRow(source: RagSourceReference): TemplateResult {
  const content = html`
    <span class="pet-source-icon">${fileIcon()}</span>
    <span class="pet-source-title">${formatSourceTitle(source)}</span>
    ${source.url ? html`<span class="pet-source-open">${externalLinkIcon()}</span>` : nothing}
  `;

  return source.url
    ? html`
        <a class="pet-source-row" href=${source.url} target="_blank" rel="noopener noreferrer">
          ${content}
        </a>
      `
    : html`<div class="pet-source-row">${content}</div>`;
}

function formatSourceTitle(source: RagSourceReference): string {
  const title = source.title?.trim();
  return title ? `《${title}》` : '未命名来源';
}
