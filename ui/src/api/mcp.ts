import { axiosInstance } from '@halo-dev/api-client'
import type { AiCallLog } from './ai-call-logs'

const PREFIX = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'

export interface McpToolPolicy {
  name: string
  enabled: boolean
  requireApproval: boolean
  authenticatedOnly: boolean
  label?: string
  prompt?: string
}

export interface McpServer {
  id: string
  name: string
  enabled: boolean
  url: string
  token: string
  headers: { name: string; value: string }[]
  allowPrivateNetwork: boolean
  timeoutSeconds: number
  tools: McpToolPolicy[]
}

export interface McpDiscovery {
  serverName: string
  serverVersion: string
  tools: { name: string; title?: string; description?: string; inputSchema: unknown }[]
}

export interface McpConfig {
  enabled: boolean
  servers: McpServer[]
}
export interface McpStatus {
  serverId: string
  state: 'idle' | 'checking' | 'ready' | 'error'
  checkedAt?: string
  expiresAt?: string
  latencyMillis?: number
  toolCount?: number
  error?: string
}
export interface McpStatusSnapshot {
  services: McpStatus[]
  cacheHits: number
  ttlSeconds: number
}
export const mcpApi = {
  async config() {
    return (await axiosInstance.get<McpConfig>(`${PREFIX}/mcpConfig`)).data
  },
  async save(config: McpConfig) {
    return (await axiosInstance.put<McpConfig>(`${PREFIX}/mcpConfig`, config)).data
  },
  async status() {
    return (await axiosInstance.get<McpStatusSnapshot>(`${PREFIX}/mcpStatus`)).data
  },
  async calls(params: {
    serverId?: string
    state?: string
    phase?: string
    page: number
    size: number
  }) {
    return (
      await axiosInstance.get<{ items: AiCallLog[]; total: number }>(`${PREFIX}/mcpCalls`, {
        params,
      })
    ).data
  },
}

export function newMcpServer(): McpServer {
  return {
    id: crypto.randomUUID().slice(0, 12),
    name: '',
    enabled: false,
    url: '',
    token: '',
    headers: [],
    allowPrivateNetwork: false,
    timeoutSeconds: 20,
    tools: [],
  }
}

export async function testMcpServer(server: McpServer): Promise<McpDiscovery> {
  const { data } = await axiosInstance.post<McpDiscovery>(
    '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/mcpTest',
    server,
    { timeout: (server.timeoutSeconds + 8) * 1000 },
  )
  return data
}

export function mergeDiscoveredTools(
  policies: McpToolPolicy[],
  discovered: McpDiscovery['tools'],
): McpToolPolicy[] {
  return discovered.map((tool) => {
    const previous = policies.find((policy) => policy.name === tool.name)
    return {
      name: tool.name,
      enabled: previous?.enabled === true,
      requireApproval: previous?.requireApproval !== false,
      authenticatedOnly: previous?.authenticatedOnly === true,
      label: previous?.label || tool.title || tool.name.replace(/_/g, ' '),
      prompt: previous?.prompt || '',
    }
  })
}
