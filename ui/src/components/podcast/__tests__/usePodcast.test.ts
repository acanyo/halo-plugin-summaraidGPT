import { effectScope, nextTick, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePodcast } from '../usePodcast'
import { podcastApi, type PodcastEpisodeView } from '@/api/podcast'
vi.mock('@/api/podcast', () => ({
  podcastApi: { get: vi.fn(), save: vi.fn(), generate: vi.fn(), render: vi.fn(), remove: vi.fn() },
}))
const view = (name: string): PodcastEpisodeView => ({
  episode: {
    spec: {
      postName: name,
      durationMinutes: 2,
      style: 'casual',
      turns: [{ speaker: 'A', text: name }],
    },
    status: { phase: 'DRAFT' },
  },
  stale: false,
  audioOutdated: false,
})
afterEach(() => vi.clearAllMocks())
describe('podcast selection', () => {
  it('ignores a previous article response after switching selections', async () => {
    let resolveOld!: (value: PodcastEpisodeView) => void
    vi.mocked(podcastApi.get).mockImplementation((name) =>
      name === 'old'
        ? new Promise((resolve) => {
            resolveOld = resolve
          })
        : Promise.resolve(view(name)),
    )
    const selected = ref('old')
    const scope = effectScope()
    const state = scope.run(() => usePodcast(selected))!
    selected.value = 'new'
    await nextTick()
    await flushPromises()
    resolveOld(view('old'))
    await flushPromises()
    expect(state.episode.value?.spec.postName).toBe('new')
    expect(state.draft.value[0].text).toBe('new')
    scope.stop()
  })
})
