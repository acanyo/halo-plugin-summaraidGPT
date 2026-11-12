import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { articleGlossaryApi, type ArticleGlossary } from '@/api/article-glossary'
import { workbenchErrorMessage } from '@/workbench/errors'

export function useArticleGlossary(postName: Ref<string>) {
  const glossary = ref<ArticleGlossary>()
  const loading = ref(false)
  const generatingFor = ref('')
  const generating = computed(
    () => Boolean(postName.value) && generatingFor.value === postName.value,
  )
  const error = ref('')
  let request = 0
  async function load() {
    const current = ++request
    glossary.value = undefined
    error.value = ''
    loading.value = Boolean(postName.value)
    if (!postName.value) return
    try {
      const result = await articleGlossaryApi.get(postName.value)
      if (current === request) glossary.value = result
    } catch (cause) {
      if (current === request) error.value = workbenchErrorMessage(cause, '热词加载失败，请重试')
    } finally {
      if (current === request) loading.value = false
    }
  }
  async function generate() {
    if (generatingFor.value || !postName.value) return
    const name = postName.value
    generatingFor.value = name
    error.value = ''
    const current = ++request
    try {
      const result = await articleGlossaryApi.generate(name)
      if (current === request && postName.value === name) glossary.value = result
    } catch (cause) {
      if (current === request)
        error.value = workbenchErrorMessage(cause, '热词生成失败，请检查模型配置后重试')
    } finally {
      generatingFor.value = ''
    }
  }
  watch(postName, load, { immediate: true })
  onBeforeUnmount(() => {
    request++
  })
  return { glossary, loading, generatingFor, generating, error, load, generate }
}
