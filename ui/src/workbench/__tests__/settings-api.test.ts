import { beforeEach, describe, expect, it, vi } from 'vitest'
import { workbenchApi } from '@/api/workbench'

const mocks = vi.hoisted(() => ({
  fetchConfig: vi.fn(),
  updateConfig: vi.fn(),
}))

vi.mock('@halo-dev/api-client', () => ({
  consoleApiClient: {
    plugin: {
      plugin: {
        fetchPluginJsonConfig: mocks.fetchConfig,
        updatePluginJsonConfig: mocks.updateConfig,
      },
    },
  },
  axiosInstance: {},
}))

describe('workbench settings persistence', () => {
  beforeEach(() => vi.resetAllMocks())

  it('merges the edited group into the latest config and preserves concurrent changes in other groups', async () => {
    const latestConfig = {
      basic: { languageModelName: 'new-model-from-another-page' },
      rag: { chunkSize: 900 },
      assistant: { enableAssistant: true, assistantName: '站点助手' },
      futureGroup: { preserveMe: true },
    }
    mocks.fetchConfig.mockResolvedValue({ data: latestConfig })
    mocks.updateConfig.mockResolvedValue({})

    await workbenchApi.saveConfigGroup('rag', { chunkSize: 1200, chunkOverlap: 100 })

    expect(mocks.updateConfig).toHaveBeenCalledWith({
      name: 'summaraidGPT',
      body: { ...latestConfig, rag: { chunkSize: 1200, chunkOverlap: 100 } },
    })
    expect(latestConfig.rag.chunkSize).toBe(900)
  })

  it('preserves hidden nested fields while saving a guide form', async () => {
    mocks.fetchConfig.mockResolvedValue({
      data: {
        basic: {
          languageModelName: 'old',
          aiSecuritySetting: { accessMode: 'authenticated_chat', custom: true },
        },
      },
    })
    mocks.updateConfig.mockResolvedValue({})
    const saved = await workbenchApi.saveConfigGroup('basic', {
      languageModelName: '',
      aiSecuritySetting: { accessMode: 'anonymous_chat' },
    })
    expect(saved).toEqual({
      languageModelName: '',
      aiSecuritySetting: { accessMode: 'anonymous_chat', custom: true },
    })
  })

  it('does not write a partial config when reading the latest config fails', async () => {
    mocks.fetchConfig.mockRejectedValue(new Error('permission denied'))
    await expect(workbenchApi.saveConfigGroup('rag', { chunkSize: 1200 })).rejects.toThrow(
      'permission denied',
    )
    expect(mocks.updateConfig).not.toHaveBeenCalled()
  })

  it('propagates save failures so the form retains unsaved changes', async () => {
    mocks.fetchConfig.mockResolvedValue({ data: {} })
    mocks.updateConfig.mockRejectedValue(new Error('conflict'))
    await expect(workbenchApi.saveConfigGroup('rag', { chunkSize: 1200 })).rejects.toThrow(
      'conflict',
    )
  })
})
