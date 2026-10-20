import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { articleReadingApi, type SelectablePost } from '@/api/article-reading'
import { workbenchErrorMessage } from '@/workbench/errors'

export function useArticlePostList() {
  const posts = ref<SelectablePost[]>([])
  const keyword = ref('')
  const page = ref(1)
  const total = ref(0)
  const loading = ref(false)
  const error = ref('')
  const pageSize = 10
  let request = 0
  const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

  async function load() {
    const current = ++request
    loading.value = true
    error.value = ''
    try {
      const result = await articleReadingApi.listSelectablePosts({
        page: page.value,
        size: pageSize,
        keyword: keyword.value,
      })
      if (current !== request) return
      posts.value = result.items
      total.value = result.total
    } catch (cause) {
      if (current === request)
        error.value = workbenchErrorMessage(cause, '文章列表加载失败，请重试')
    } finally {
      if (current === request) loading.value = false
    }
  }
  function search() {
    if (page.value === 1) void load()
    else page.value = 1
  }
  function clearSearch() {
    keyword.value = ''
    search()
  }
  watch(page, load)
  onMounted(load)
  onBeforeUnmount(() => {
    request++
  })
  return { posts, keyword, page, total, pages, loading, error, load, search, clearSearch }
}
