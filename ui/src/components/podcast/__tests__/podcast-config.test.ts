import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosInstance } from '@halo-dev/api-client'
import { workbenchApi } from '@/api/workbench'
import { readPodcastConfig, savePodcastConfig } from '@/api/podcast-config'

vi.mock('@halo-dev/api-client', () => ({ axiosInstance: { put: vi.fn(), get: vi.fn() } }))
vi.mock('@/api/workbench', () => ({ workbenchApi: { saveConfigGroup: vi.fn() } }))

beforeEach(() => vi.resetAllMocks())
describe('podcast credential storage', () => {
  it('sends credentials only to the secret endpoint and returns masked form values', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({ data: { minimax: '********' } })
    vi.mocked(workbenchApi.saveConfigGroup).mockImplementation(async (_, values) => values)
    const values = { enabled: true, minimax: { apiKey: 'test-secret', model: 'speech-2.8-turbo' } }
    const saved = await savePodcastConfig(values)
    expect(axiosInstance.put).toHaveBeenCalledWith(expect.stringContaining('podcastCredentials'), {
      minimax: 'test-secret',
    })
    expect(workbenchApi.saveConfigGroup).toHaveBeenCalledWith('podcast', {
      enabled: true,
      minimax: { model: 'speech-2.8-turbo' },
    })
    expect(saved.minimax).toEqual({ model: 'speech-2.8-turbo', apiKey: '********' })
    expect(values.minimax.apiKey).toBe('test-secret')
  })

  it.each([
    ['bailian-cosyvoice', 'cosyvoice', 'cosyvoice-v3-flash'],
    ['bailian-minimax', 'bailianMinimax', 'MiniMax/speech-2.8-turbo'],
  ])(
    'migrates %s to the shared Bailian channel without losing its credentials',
    async (provider, source, model) => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { [source]: '********' } })
      const original = {
        provider,
        [source]: { model, voiceA: 'existing-a', voiceB: 'existing-b', workspaceId: 'workspace' },
      }
      const originalVoice = {
        model,
        voiceA: 'existing-a',
        voiceB: 'existing-b',
        workspaceId: 'workspace',
      }
      const loaded = await readPodcastConfig(original)
      expect(loaded).toMatchObject({
        provider: 'bailian',
        bailianCredentialSource: source,
        bailian: { ...originalVoice, apiKey: '********' },
        [source]: { ...originalVoice, apiKey: '********' },
      })
      expect(original.provider).toBe(provider)

      vi.mocked(workbenchApi.saveConfigGroup).mockImplementation(async (_, values) => values)
      await savePodcastConfig(loaded)
      expect(axiosInstance.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          bailian: '********',
          bailianSource: source,
        }),
      )
      const persisted = vi.mocked(workbenchApi.saveConfigGroup).mock.calls[0]![1]
      expect(persisted).not.toHaveProperty('bailianCredentialSource')
      for (const value of Object.values(persisted)) {
        if (value && typeof value === 'object') expect(value).not.toHaveProperty('apiKey')
      }
      expect(persisted[source]).toEqual(original[source])
    },
  )

  it('keeps an explicitly cleared migrated key empty', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({ data: {} })
    vi.mocked(workbenchApi.saveConfigGroup).mockImplementation(async (_, values) => values)
    await savePodcastConfig({
      provider: 'bailian',
      bailianCredentialSource: 'cosyvoice',
      bailian: { model: 'cosyvoice-v3-flash', apiKey: '' },
    })
    expect(axiosInstance.put).toHaveBeenCalledWith(expect.any(String), {
      bailian: '',
      bailianSource: 'cosyvoice',
    })
  })
})
