import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { Toast } from '@halo-dev/components'
import {
  ARTICLE_READING_GRAPH_SCHEMA_VERSION,
  articleReadingApi,
  type ArticleReading,
  type ArticleReadingSpec,
} from '@/api/article-reading'
import { workbenchErrorMessage } from '@/workbench/errors'

function validateReading(value: ArticleReading) {
  const spec: ArticleReadingSpec | undefined = value.spec
  const topics = spec?.nodes?.filter((node) => node.kind === 'tl') || []
  const rootTargets = new Set(
    spec?.edges?.filter((edge) => edge.from === (spec.root?.id || 'root')).map((edge) => edge.to),
  )
  if (
    !spec?.root ||
    (spec.schemaVersion || 0) < ARTICLE_READING_GRAPH_SCHEMA_VERSION ||
    topics.length < 3 ||
    !spec.nodes?.some((node) => node.kind === 'dl') ||
    !topics.every((node) => rootTargets.has(node.id))
  ) {
    throw new Error('当前图谱是旧版或不完整结构，请重新生成。')
  }
  return value
}

export function useArticleReading(postName: Ref<string>) {
  const reading = ref<ArticleReading>()
  const loading = ref(false)
  const generatingFor = ref('')
  const error = ref('')
  const generating = computed(
    () => generatingFor.value === postName.value && Boolean(postName.value),
  )
  let request = 0
  let disposed = false

  async function load() {
    const name = postName.value
    const current = ++request
    reading.value = undefined
    error.value = ''
    loading.value = Boolean(name)
    if (!name) return
    try {
      const result = validateReading(await articleReadingApi.get(name))
      if (current === request) reading.value = result
    } catch (cause) {
      if (current === request) error.value = workbenchErrorMessage(cause, '洞察图谱尚未生成')
    } finally {
      if (current === request) loading.value = false
    }
  }

  async function generate() {
    const name = postName.value
    if (!name || generatingFor.value) return
    const current = ++request
    loading.value = false
    generatingFor.value = name
    error.value = ''
    try {
      const result = validateReading(await articleReadingApi.generate(name, true))
      if (current === request) {
        reading.value = result
        Toast.success('洞察图谱已生成')
      }
    } catch (cause) {
      if (current === request)
        error.value = workbenchErrorMessage(cause, '生成失败，请检查模型设置后重试')
    } finally {
      if (!disposed) generatingFor.value = ''
    }
  }
  watch(postName, load, { immediate: true })
  onBeforeUnmount(() => {
    disposed = true
    request++
  })
  return { reading, loading, generating, generatingFor, error, load, generate }
}
