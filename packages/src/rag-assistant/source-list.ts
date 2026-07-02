import { html, nothing, type TemplateResult } from 'lit';
import { externalLinkIcon, fileIcon } from './icons';
import type { RagSourceReference } from './types';

export function renderSourceList(sources: RagSourceReference[]): TemplateResult {
  return html`<div class="pet-source-list">${sources.map((source) => renderSourceRow(source))}</div>`;
}

function renderSourceRow(source: RagSourceReference): TemplateResult {
  const meta = formatSourceMeta(source);
  const content = html`
    <span class="pet-source-icon">${fileIcon()}</span>
    <span class="pet-source-main">
      <span class="pet-source-title">${formatSourceTitle(source)}</span>
      ${meta
        ? html`<span class="pet-source-meta">${meta}</span>`
        : nothing}
    </span>
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

function formatSourceMeta(source: RagSourceReference): string {
  return [
    formatSourceType(source.sourceType),
    typeof source.score === 'number' ? `score ${formatScore(source.score)}` : undefined,
    source.chunkCount ? `${source.chunkCount} 分块` : undefined,
    source.chunkIndexes?.length ? `#${source.chunkIndexes.join(', #')}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
}

function formatSourceType(sourceType: string | undefined): string | undefined {
  if (!sourceType) {
    return undefined;
  }
  const type = sourceType.trim().toLowerCase();
  const labels: Record<string, string> = {
    'ragdocument.summaraidgpt.lik.cc': 'RAG 知识库',
    'post.content.halo.run': '站内文章',
    'singlepage.content.halo.run': '独立页面',
    'category.content.halo.run': '分类',
    'tag.content.halo.run': '标签',
    post: '站内文章',
    page: '独立页面',
    docsme: 'Docsme 文档',
    manual: '手动导入',
    attachment: '附件',
  };
  return labels[type] || undefined;
}

function formatScore(value: number): string {
  if (!Number.isFinite(value)) {
    return '-';
  }
  const absolute = Math.abs(value);
  if (absolute >= 10) {
    return value.toFixed(2);
  }
  return value.toFixed(4);
}
