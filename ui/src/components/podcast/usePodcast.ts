import { computed, onScopeDispose, ref, toRaw, watch, type Ref } from 'vue'
import { podcastApi, type PodcastEpisodeView, type PodcastTurn } from '@/api/podcast'
import { workbenchErrorMessage } from '@/workbench/errors'

export function usePodcast(post: Ref<string>) {
  const view = ref<PodcastEpisodeView>()
  const draft = ref<PodcastTurn[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref('')
  const savedDraft = ref('[]')
  let request = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const episode = computed(() => view.value?.episode)
  const busy = computed(() =>
    ['SCRIPTING', 'GENERATING'].includes(episode.value?.status.phase || ''),
  )
  const dirty = computed(() => JSON.stringify(draft.value) !== savedDraft.value)

  function clearTimer() {
    if (timer) clearTimeout(timer)
    timer = undefined
  }
  function setView(value?: PodcastEpisodeView) {
    view.value = value
    draft.value = structuredClone(value?.episode.spec.turns || [])
    savedDraft.value = JSON.stringify(draft.value)
    if (busy.value) timer = setTimeout(() => void load(true), 2500)
  }
  async function load(poll = false) {
    clearTimer()
    const selected = post.value
    const id = ++request
    if (!selected) {
      setView()
      return
    }
    if (!poll) loading.value = true
    error.value = ''
    try {
      const value = await podcastApi.get(selected)
      if (id === request) setView(value)
    } catch (cause) {
      if (id === request) error.value = workbenchErrorMessage(cause, '播客加载失败')
    } finally {
      if (id === request) loading.value = false
    }
  }
  async function run(action: (selected: string) => Promise<unknown>) {
    if (!post.value || busy.value || submitting.value) return
    const selected = post.value
    const id = request
    submitting.value = true
    error.value = ''
    try {
      await action(selected)
      if (post.value === selected && id === request) await load()
    } catch (cause) {
      if (post.value === selected) error.value = workbenchErrorMessage(cause, '操作失败，请重试')
    } finally {
      submitting.value = false
    }
  }
  watch(
    post,
    () => {
      view.value = undefined
      draft.value = []
      savedDraft.value = '[]'
      void load()
    },
    { immediate: true },
  )
  onScopeDispose(() => {
    request++
    clearTimer()
  })
  return {
    view,
    episode,
    draft,
    dirty,
    busy,
    loading,
    submitting,
    error,
    load,
    generate: (duration: number, style: string) =>
      run((selected) => podcastApi.generate(selected, duration, style)),
    save: () => run((selected) => podcastApi.save(selected, structuredClone(toRaw(draft.value)))),
    render: () => run((selected) => podcastApi.render(selected)),
    remove: () => run((selected) => podcastApi.remove(selected)),
    discard: () => {
      draft.value = structuredClone(toRaw(episode.value?.spec.turns || []))
      savedDraft.value = JSON.stringify(draft.value)
    },
  }
}
