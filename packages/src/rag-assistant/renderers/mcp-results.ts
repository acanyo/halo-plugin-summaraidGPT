import { css, html, nothing } from 'lit';
import { mcpRows, mcpStructuredValue, mcpTextSources, safeMcpUrl, type McpResultCard } from '../agent/mcp';

const statuses = {
  pending: '调用中', approval: '等待确认', success: '已完成', error: '调用失败', cancelled: '已取消',
};

export function renderMcpResults(cards: McpResultCard[] = []) {
  if (!cards.length) return nothing;
  return html`<div class="mcp-results" aria-label="外部工具结果">${cards.map(card => html`
    <details class="mcp-result" data-status=${card.status}>
      <summary><span class="mcp-result-label">MCP</span><strong>${card.title}</strong>
        <span class="mcp-result-status" role="status">${statuses[card.status]}</span></summary>
      <div class="mcp-result-body">${renderBody(card)}
        ${card.truncated ? html`<p class="mcp-result-hint">结果较长，已显示部分内容。</p>` : nothing}
      </div>
    </details>`)}
  </div>`;
}

function renderBody(card: McpResultCard) {
  const structured = mcpStructuredValue(card);
  const rows = mcpRows(structured);
  const links = rows?.map(row => ({ row, url: safeMcpUrl(row.url ?? row.link ?? row.uri) }));
  const isLinkList = links?.every(item => item.url);
  const columns = rows ? [...new Set(rows.flatMap(row => Object.keys(row)))].slice(0, 8) : [];
  const textSources = mcpTextSources(card.content);
  return html`
    ${card.content.map(item => {
      if (item.type === 'image') return html`<img class="mcp-result-image" src=${`data:${item.mimeType};base64,${item.data}`} alt="外部工具返回的图片" loading="lazy" />`;
      if (item.type === 'link') return html`<a class="mcp-result-link" href=${item.url!} target="_blank" rel="noopener noreferrer">${item.title}</a>`;
      if (structured !== undefined) {
        try { if (JSON.stringify(JSON.parse(item.text || '')) === JSON.stringify(structured)) return nothing; } catch { /* Plain text is rendered below. */ }
      }
      const rawPayload = rows && /^\s*(?:[\[{]|<\w)/.test(item.text || '');
      return rawPayload ? html`<details class="mcp-result-raw"><summary>查看原始返回</summary><pre class="mcp-result-text">${item.text}</pre></details>`
        : html`<pre class="mcp-result-text">${item.text}</pre>`;
    })}
    ${rows && isLinkList ? html`<div class="mcp-resource-list">${links!.map(({ row, url }) => html`
      <a class="mcp-resource" href=${url!} target="_blank" rel="noopener noreferrer">
        <strong>${cell(row.title ?? row.name ?? url)}</strong>
        <span>${cell(row.description ?? row.snippet ?? row.content ?? '')}</span>
        <small>${new URL(url!).hostname}</small>
      </a>`)}</div>` : rows ? html`<div class="mcp-table-scroll"><table><thead><tr>${columns.map(key => html`<th scope="col">${key}</th>`)}</tr></thead>
      <tbody>${rows.map(row => html`<tr>${columns.map(key => html`<td>${cell(row[key])}</td>`)}</tr>`)}</tbody></table></div>`
      : structured !== undefined ? html`<pre class="mcp-result-text">${JSON.stringify(structured, null, 2)}</pre>` : nothing}
    ${textSources.length && !isLinkList ? html`<div class="mcp-resource-list" aria-label="来源链接">${textSources.map(url => html`<a class="mcp-result-link" href=${url} target="_blank" rel="noopener noreferrer">${new URL(url).hostname}${new URL(url).pathname}</a>`)}</div>` : nothing}
    ${!card.content.length && structured === undefined ? html`<p class="mcp-result-hint">${card.status === 'approval' ? '确认后才会执行此工具。' : card.status === 'pending' ? '正在等待外部服务返回结果…' : card.status === 'cancelled' ? '本次操作已取消。' : '工具没有返回可展示的内容。'}</p>` : nothing}
  `;
}

function cell(value: unknown): string {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return text.slice(0, 1000);
}

export const mcpResultStyles = css`
  .mcp-capabilities { margin: 0 0 14px; color: var(--rag-text); font-size: 12px; }
  .mcp-capabilities summary { cursor: pointer; font-weight: 500; list-style: none; display: flex; align-items: center; gap: 7px; }
  .mcp-capabilities summary::before { content: '+'; font-weight: 400; opacity: .65; }
  .mcp-capabilities[open] summary::before { content: '−'; }
  .mcp-capabilities summary>span { opacity: .5; font-size: 10px; }
  .mcp-capability-list { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 6px; margin-top: 10px; max-height: 160px; overflow: auto; }
  .mcp-capability-list button { display: grid; gap: 4px; padding: 9px 10px; text-align: left; border: 1px solid var(--rag-line); border-radius: 8px; background: var(--rag-paper); color: var(--rag-text); cursor: pointer; min-width: 0; }
  .mcp-capability-list strong { font-size: 12px; font-weight: 500; overflow-wrap: anywhere; }
  .mcp-capability-list small { opacity: .6; font-size: 10px; }
  .mcp-capabilities p { font-size: 10px; opacity: .6; margin: 7px 0 0; }
  .mcp-capability-list button:disabled { opacity: .5; cursor: default; }
  .pet-stage .mcp-capabilities { color: #e2e8f0; pointer-events: auto; }
  .pet-stage .mcp-capability-list { grid-template-columns: repeat(auto-fit,minmax(170px,1fr)); max-height: 135px; }
  .pet-stage .mcp-capability-list button { background: #172033; border-color: #ffffff30; color: #f1f5f9; }
  .mcp-results { display: grid; gap: 8px; margin: 10px 0; max-width: 100%; min-width: 0; }
  .mcp-result { border: 1px solid var(--rag-line); border-radius: 10px; overflow: hidden; font-size: 12px; color: var(--rag-text); background: var(--rag-paper); }
  .mcp-result summary { display: flex; align-items: center; gap: 7px; padding: 10px; cursor: pointer; }
  .mcp-result summary strong { flex: 1; font-size: 12px; overflow-wrap: anywhere; font-weight: 500; }
  .mcp-result-label { color: #6366f1; font-size: 10px; letter-spacing: .04em; }
  .mcp-result-status { white-space: nowrap; opacity: .7; font-size: 11px; }
  .mcp-result[data-status=error] .mcp-result-status { color: #dc2626; }
  .mcp-result[data-status=success] .mcp-result-status { color: #059669; }
  .mcp-result[data-status=pending] .mcp-result-label { animation: mcp-pulse 1.2s ease-in-out infinite alternate; }
  .mcp-result-body { padding: 0 10px 10px; display: grid; gap: 8px; min-width: 0; }
  .mcp-result-raw summary { padding: 6px 0; font-size: 11px; opacity: .65; }
  .mcp-result-text { margin: 0; font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 280px; overflow: auto; line-height: 1.7; }
  .mcp-result-image { max-width: 100%; max-height: 320px; object-fit: contain; border-radius: 6px; }
  .mcp-result-link, .mcp-resource { color: inherit; }
  .mcp-resource-list { display: grid; gap: 7px; }
  .mcp-resource { display: grid; gap: 4px; padding: 9px; border: 1px solid var(--rag-line); border-radius: 7px; text-decoration: none; overflow-wrap: anywhere; }
  .mcp-resource:hover { border-color: #818cf8; }
  .mcp-resource span { opacity: .8; line-height: 1.6; }
  .mcp-resource small, .mcp-result-hint { opacity: .65; font-size: 11px; margin: 0; }
  .mcp-table-scroll { overflow: auto; max-height: 300px; }
  .mcp-table-scroll table { border-collapse: collapse; width: 100%; font-size: 11px; }
  .mcp-table-scroll td, .mcp-table-scroll th { padding: 7px 9px; border-bottom: 1px solid var(--rag-line); text-align: left; min-width: 70px; max-width: 220px; overflow-wrap: anywhere; }
  .pet-stage .mcp-result { --rag-line: rgba(255,255,255,.2); color: #f1f5f9; background: rgba(15,23,42,.92); font-size: 13px; }
  .pet-stage .mcp-result-label { color: #c7d2fe; }
  .pet-stage .mcp-result[data-status=success] .mcp-result-status { color: #6ee7b7; }
  .pet-stage .mcp-result[data-status=error] .mcp-result-status { color: #fca5a5; }
  @keyframes mcp-pulse { to { opacity: .4; } }
  @media (prefers-reduced-motion: reduce) { .mcp-result[data-status=pending] .mcp-result-label { animation: none; } }
`;
