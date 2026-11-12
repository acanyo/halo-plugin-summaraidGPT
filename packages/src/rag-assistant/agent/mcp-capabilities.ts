import { html, nothing, type TemplateResult } from 'lit';
import { RAG_API_BASE } from '../api';

export interface McpCapability { id: string; title: string; service: string; prompt: string; approval: boolean }

export async function fetchMcpCapabilities(): Promise<McpCapability[]> {
  try {
    const response = await fetch(`${RAG_API_BASE}/mcpCapabilities`, { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) return [];
    const body: unknown = await response.json();
    if (!Array.isArray(body)) return [];
    return body.slice(0, 12).filter((item): item is McpCapability => typeof item?.id === 'string'
      && typeof item?.title === 'string' && typeof item?.prompt === 'string' && typeof item?.service === 'string');
  } catch { return []; }
}

export function renderMcpCapabilities(capabilities: McpCapability[], busy: boolean,
  select: (prompt: string) => void): TemplateResult | typeof nothing {
  if (!capabilities.length) return nothing;
  return html`<details class="mcp-capabilities"><summary>可用工具 <span>${capabilities.length}</span></summary>
    <div class="mcp-capability-list">${capabilities.map(item => html`
      <button type="button" ?disabled=${busy} @click=${() => select(item.prompt)}
        title=${item.prompt}><strong>${item.title}</strong><small>${item.service}${item.approval ? ' · 执行前确认' : ''}</small></button>
    `)}</div><p>选择工具会填入示例问题，编辑后发送。</p></details>`;
}
