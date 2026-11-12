import type { ToolPart, UIMessage } from '@halo-dev/ai-foundation-sdk';

export interface McpResultContent {
  type: 'text' | 'image' | 'link';
  text?: string;
  url?: string;
  title?: string;
  mimeType?: string;
  data?: string;
}

export interface McpResultCard {
  id: string;
  title: string;
  status: 'pending' | 'approval' | 'success' | 'error' | 'cancelled';
  content: McpResultContent[];
  structuredContent?: unknown;
  truncated?: boolean;
}

export function isMcpTool(name: string): boolean {
  return /^mcp_[a-f0-9]{12}_[a-z0-9_]{1,47}$/.test(name);
}

export function mcpToolLabel(name: string): string {
  return name.replace(/^mcp_[a-f0-9]{12}_/, '').replace(/_/g, ' ');
}

export function mcpMessagesForTransport(messages: UIMessage[]): UIMessage[] {
  return messages.map(message => ({ ...message, parts: message.parts.map(part => {
    if (!part.type.startsWith('tool-')) return part;
    const tool = part as ToolPart;
    const output = record(tool.output);
    if (!isMcpTool(tool.toolName) || output?.kind !== 'mcp' || !Array.isArray(output.content)) return part;
    return { ...tool, output: { ...output, content: output.content.map(item => {
      if (record(item)?.type !== 'image') return item;
      return { type: 'text', text: '外部工具返回了一张图片，已在前台展示。' };
    }) } };
  }) }));
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}

export function safeMcpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href : undefined;
  } catch { return undefined; }
}

/** Some document services return source URLs inside text instead of resource_link blocks. */
export function mcpTextSources(content: McpResultContent[]): string[] {
  const urls = new Set<string>();
  for (const block of content) {
    if (block.type !== 'text') continue;
    for (const match of (block.text || '').matchAll(/https?:\/\/[^\s<>"'\]})]+/g)) {
      const url = safeMcpUrl(match[0].replace(/[.,;:!?，。；：！？]+$/, ''));
      if (url && url.length <= 2000) urls.add(url);
      if (urls.size >= 12) return [...urls];
    }
  }
  return [...urls];
}

export function extractMcpCards(messages: UIMessage[]): McpResultCard[] {
  const cards = new Map<string, McpResultCard>();
  for (const message of messages) {
    for (const part of message.parts) {
      if (!part.type.startsWith('tool-')) continue;
      const tool = part as ToolPart;
      if (!isMcpTool(tool.toolName)) continue;
      const output = record(tool.output);
      const content: McpResultContent[] = [];
      for (const value of Array.isArray(output?.content) ? output.content.slice(0, 12) : []) {
        const item = record(value);
        if (!item) continue;
        if (item.type === 'text' && typeof item.text === 'string') {
          content.push({ type: 'text', text: item.text.slice(0, 16000) });
        } else if (item.type === 'link') {
          const url = safeMcpUrl(item.url);
          if (url) content.push({ type: 'link', url, title: String(item.title || '查看资源').slice(0, 200) });
        } else if (item.type === 'image' && typeof item.data === 'string'
          && item.data.length <= 1_400_000 && /^[A-Za-z0-9+/=\r\n]+$/.test(item.data)
          && ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(String(item.mimeType))) {
          content.push({ type: 'image', data: item.data, mimeType: String(item.mimeType) });
        }
      }
      if (typeof output?.structuredPreview === 'string') {
        content.push({ type: 'text', text: output.structuredPreview.slice(0, 12000) });
      }
      if (tool.state === 'output-error' && tool.errorText) {
        content.push({ type: 'text', text: tool.errorText });
      }
      const title = output?.kind === 'mcp'
        ? `${String(output.server || 'MCP').slice(0, 100)} · ${String(output.tool || '外部工具').slice(0, 150)}`
        : `MCP · ${mcpToolLabel(tool.toolName)}`;
      let status: McpResultCard['status'] = 'pending';
      if (tool.state === 'approval-requested' || tool.state === 'approval-responded') status = 'approval';
      if (tool.state === 'output-available') status = output?.ok === false ? 'error' : 'success';
      if (tool.state === 'output-error') status = 'error';
      if (tool.state === 'output-denied') status = 'cancelled';
      cards.set(tool.toolCallId, {
        id: tool.toolCallId, title, status, content,
        structuredContent: output?.structuredContent,
        truncated: output?.truncated === true,
      });
    }
  }
  return [...cards.values()].slice(-16);
}

/** Common structured search results also work when delivered as JSON text content. */
export function mcpStructuredValue(card: McpResultCard): unknown {
  if (card.structuredContent != null) return card.structuredContent;
  const text = card.content.find(item => item.type === 'text')?.text;
  if (!text || text.length > 12000 || !/^[\s]*[\[{]/.test(text)) return undefined;
  try { return JSON.parse(text); } catch { return undefined; }
}

export function mcpRows(value: unknown): Record<string, unknown>[] | undefined {
  const object = record(value);
  const rows = Array.isArray(value) ? value : object?.results ?? object?.items ?? object?.documents ?? object?.rows;
  if (!Array.isArray(rows) || rows.length === 0 || !rows.every(row => record(row))) return undefined;
  return rows.slice(0, 30) as Record<string, unknown>[];
}
