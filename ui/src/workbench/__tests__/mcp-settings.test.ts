import { describe, expect, it, vi } from 'vitest'
import { groupValues } from '../settings/groups'
import { mergeDiscoveredTools } from '@/api/mcp'

vi.mock('@halo-dev/api-client', () => ({ axiosInstance: { post: vi.fn() } }))

describe('MCP service settings', () => {
  it('starts disabled and keeps server credentials separate from public Agent settings', () => {
    expect(groupValues('mcp')).toEqual({ enabled: false, servers: [] })
    expect(groupValues('agent')).not.toHaveProperty('servers')
    expect(groupValues('mcp', { servers: [{ id: 'search', token: 'saved-token' }] })).toMatchObject(
      {
        servers: [{ id: 'search', token: 'saved-token' }],
      },
    )
  })

  it('requires explicit enablement and user confirmation for newly discovered tools', () => {
    expect(
      mergeDiscoveredTools(
        [],
        [{ name: 'search', description: 'Search documents', inputSchema: {} }],
      ),
    ).toEqual([{ name: 'search', enabled: false, requireApproval: true, authenticatedOnly: false, label: 'search', prompt: '' }])
  })

  it('preserves chosen access policies while removing tools no longer offered by the service', () => {
    expect(
      mergeDiscoveredTools(
        [
          { name: 'search', enabled: true, requireApproval: false, authenticatedOnly: true, label: '查询文档', prompt: '查找接入说明' },
          { name: 'removed', enabled: true, requireApproval: false, authenticatedOnly: false },
        ],
        [
          { name: 'search', inputSchema: {} },
          { name: 'new_tool', inputSchema: {} },
        ],
      ),
    ).toEqual([
      { name: 'search', enabled: true, requireApproval: false, authenticatedOnly: true, label: '查询文档', prompt: '查找接入说明' },
      { name: 'new_tool', enabled: false, requireApproval: true, authenticatedOnly: false, label: 'new tool', prompt: '' },
    ])
  })
})
