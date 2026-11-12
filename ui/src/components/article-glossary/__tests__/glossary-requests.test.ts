import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App, type Ref } from 'vue'
import type { ArticleGlossary } from '@/api/article-glossary'
import { useArticleGlossary } from '../useArticleGlossary'

const api = vi.hoisted(() => ({ get: vi.fn(), generate: vi.fn() }))
vi.mock('@/api/article-glossary', () => ({ articleGlossaryApi: api }))
const fixture = (name: string): ArticleGlossary => ({
  spec: {
    postName: name,
    postTitle: name,
    generatedAt: '2026-11-12T03:00:00Z',
    terms: [],
  },
})
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
let app: App | undefined
function mount(name: Ref<string>) {
  let state!: ReturnType<typeof useArticleGlossary>
  app = createApp({
    setup() {
      state = useArticleGlossary(name)
      return () => h('div')
    },
  })
  app.mount(document.createElement('div'))
  return state
}
afterEach(() => {
  app?.unmount()
  vi.resetAllMocks()
})

describe('glossary requests', () => {
  it('does not generate or load when no article is selected', () => {
    const state = mount(ref(''))
    expect(state.loading.value).toBe(false)
    expect(state.generating.value).toBe(false)
    expect(api.get).not.toHaveBeenCalled()
  })

  it('keeps the newer article when an earlier load arrives late', async () => {
    const old = deferred<ArticleGlossary>()
    api.get.mockImplementation((name: string) =>
      name === 'old' ? old.promise : Promise.resolve(fixture(name)),
    )
    const name = ref('old')
    const state = mount(name)
    name.value = 'current'
    await nextTick()
    await Promise.resolve()
    old.resolve(fixture('old'))
    await Promise.resolve()
    await nextTick()
    expect(state.glossary.value?.spec.postName).toBe('current')
    expect(state.loading.value).toBe(false)
  })

  it('does not replace the selected article with a completed generation for another article', async () => {
    const pending = deferred<ArticleGlossary>()
    api.get.mockImplementation((name: string) => Promise.resolve(fixture(name)))
    api.generate.mockReturnValue(pending.promise)
    const name = ref('first')
    const state = mount(name)
    await nextTick()
    const saving = state.generate()
    name.value = 'second'
    await nextTick()
    await Promise.resolve()
    pending.resolve(fixture('first'))
    await saving
    expect(state.glossary.value?.spec.postName).toBe('second')
    expect(state.generatingFor.value).toBe('')
  })
})
