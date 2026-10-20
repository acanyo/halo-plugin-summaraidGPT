import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App, type Ref } from 'vue'
import type { ArticleReading } from '@/api/article-reading'
import { useArticleReading } from '../useArticleReading'

const api = vi.hoisted(() => ({ get: vi.fn(), generate: vi.fn(), success: vi.fn() }))
vi.mock('@/api/article-reading', () => ({
  ARTICLE_READING_GRAPH_SCHEMA_VERSION: 5,
  articleReadingApi: api,
}))
vi.mock('@halo-dev/components', () => ({ Toast: { success: api.success } }))
const fixture = (post: string): ArticleReading => ({
  spec: {
    postMetadataName: post,
    schemaVersion: 5,
    root: { id: 'root', title: post, kind: 'root' },
    nodes: [
      { id: 'a', title: 'a', kind: 'tl' },
      { id: 'b', title: 'b', kind: 'tl' },
      { id: 'c', title: 'c', kind: 'tl' },
      { id: 'd', title: 'd', kind: 'dl' },
    ],
    edges: ['a', 'b', 'c'].map((to) => ({ from: 'root', to, type: 'contains' })),
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
const mount = (name: Ref<string>) => {
  let reading!: ReturnType<typeof useArticleReading>
  app = createApp({
    setup() {
      reading = useArticleReading(name)
      return () => h('div')
    },
  })
  app.mount(document.createElement('div'))
  return reading
}
afterEach(() => {
  app?.unmount()
  vi.resetAllMocks()
})

describe('article switching while requests finish', () => {
  it('keeps the newer article when an earlier preview arrives late', async () => {
    const old = deferred<ArticleReading>()
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
    expect(state.reading.value?.spec?.postMetadataName).toBe('current')
    expect(state.loading.value).toBe(false)
  })

  it('keeps another article visible when a background generation finishes', async () => {
    const generated = deferred<ArticleReading>()
    api.get.mockImplementation((name: string) => Promise.resolve(fixture(name)))
    api.generate.mockReturnValue(generated.promise)
    const name = ref('first')
    const state = mount(name)
    await nextTick()
    const saving = state.generate()
    name.value = 'second'
    await nextTick()
    await Promise.resolve()
    generated.resolve(fixture('first'))
    await saving
    expect(state.reading.value?.spec?.postMetadataName).toBe('second')
    expect(state.generatingFor.value).toBe('')
    expect(api.success).not.toHaveBeenCalled()
  })
})
