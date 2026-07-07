<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Toast,
  VButton,
  VCard,
  VEmpty,
  VLoading,
  VPageHeader,
  VPagination,
} from '@halo-dev/components'
import { utils } from '@halo-dev/ui-shared'
import RiArticleLine from '~icons/ri/article-line'
import RiBrainLine from '~icons/ri/brain-line'
import RiCheckLine from '~icons/ri/check-line'
import RiSearchLine from '~icons/ri/search-line'
import InsightGraphPreview from '@/components/article-reading/InsightGraphPreview.vue'
import {
  articleReadingApi,
  type ArticleReading,
  type SelectablePost,
} from '@/api/article-reading'

const postName = ref('')
const loading = ref(false)
const generating = ref(false)
const reading = ref<ArticleReading>()
const posts = ref<SelectablePost[]>([])
const postsLoading = ref(false)
const postKeyword = ref('')
const postPage = ref(1)
const postPageSize = ref(10)
const postTotal = ref(0)
const selectedPostCache = ref<SelectablePost>()
const graphStatus = ref('')

const spec = computed(() => reading.value?.spec)
const nodeCounts = computed(() => ({
  tl: (spec.value?.nodes || []).filter((node) => node.kind === 'tl').length,
  dl: (spec.value?.nodes || []).filter((node) => node.kind === 'dl').length,
}))
const edgeCount = computed(() => spec.value?.edges?.length || 0)
const selectedPostName = computed(() => postName.value.trim())
const selectedPost = computed(() => {
  const name = selectedPostName.value
  if (!name) {
    return undefined
  }
  return (
    posts.value.find((post) => post.name === name) ||
    (selectedPostCache.value?.name === name ? selectedPostCache.value : undefined)
  )
})

const loadPosts = async () => {
  postsLoading.value = true
  try {
    const result = await articleReadingApi.listSelectablePosts({
      page: postPage.value,
      size: postPageSize.value,
      keyword: postKeyword.value,
    })
    posts.value = result.items
    postPage.value = result.page
    postPageSize.value = result.size
    postTotal.value = result.total
  } catch (error) {
    Toast.error(errorMessage(error, '文章列表加载失败'))
  } finally {
    postsLoading.value = false
  }
}

const searchPosts = async () => {
  if (postPage.value === 1) {
    await loadPosts()
    return
  }
  postPage.value = 1
}

const selectPost = (post: SelectablePost) => {
  if (postName.value !== post.name) {
    reading.value = undefined
  }
  postName.value = post.name
  selectedPostCache.value = post
  graphStatus.value = ''
  void loadExisting(false)
}

const loadExisting = async (notify = true) => {
  const name = selectedPostName.value
  if (!name) {
    Toast.warning('请先选择文章')
    return
  }
  loading.value = true
  graphStatus.value = ''
  try {
    reading.value = await articleReadingApi.get(name)
    if (notify) {
      Toast.success('图谱预览已加载')
    }
  } catch (error) {
    reading.value = undefined
    graphStatus.value = errorMessage(error, '洞察图谱尚未生成')
    if (notify) {
      Toast.error(graphStatus.value)
    }
  } finally {
    loading.value = false
  }
}

const generateGraph = async () => {
  const name = selectedPostName.value
  if (!name) {
    Toast.warning('请先选择文章')
    return
  }
  generating.value = true
  graphStatus.value = ''
  try {
    reading.value = await articleReadingApi.generate(name, true)
    Toast.success('图谱已生成')
  } catch (error) {
    Toast.error(errorMessage(error, '生成失败'))
  } finally {
    generating.value = false
  }
}

const formatDate = (value?: string) => (value ? utils.date.format(value) : '-')

const postPhaseText = (post: SelectablePost) => {
  if (post.phase === 'PUBLISHED' || post.published) return '已发布'
  if (post.phase === 'DRAFT') return '草稿'
  if (post.phase === 'PENDING_APPROVAL') return '待审核'
  if (post.phase === 'FAILED') return '发布失败'
  return post.phase || '未发布'
}

const postPhaseClass = (post: SelectablePost) => {
  if (post.phase === 'PUBLISHED' || post.published) {
    return ':uno: border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (post.phase === 'FAILED') {
    return ':uno: border-rose-200 bg-rose-50 text-rose-700'
  }
  return ':uno: border-slate-200 bg-slate-50 text-slate-600'
}

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message || fallback
  return fallback
}

onMounted(() => {
  loadPosts()
})

watch([postPage, postPageSize], () => {
  loadPosts()
})
</script>

<template>
  <VPageHeader title="洞察图谱">
    <template #icon>
      <RiBrainLine class="mr-2 self-center" />
    </template>
  </VPageHeader>

  <div class=":uno: grid gap-3 p-4 max-[680px]:p-3">
    <VCard :body-class="[':uno: !p-0']">
      <div class=":uno: border-b border-slate-100 px-4 py-3">
        <div class=":uno: flex flex-wrap items-center justify-between gap-3">
          <div class=":uno: min-w-0">
            <div class=":uno: text-sm font-semibold text-slate-900">选择文章</div>
            <div class=":uno: mt-1 text-xs leading-relaxed text-slate-500">
              从 Halo 文章列表选择文章；已生成的洞察图谱会直接在下方预览。
            </div>
          </div>
          <div
            v-if="selectedPostName"
            class=":uno: inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          >
            <RiCheckLine class=":uno: size-4 shrink-0" />
            <span class=":uno: truncate">已选：{{ selectedPost?.title || selectedPostName }}</span>
          </div>
        </div>
      </div>

      <div class=":uno: grid gap-3 p-4">
        <div class=":uno: flex min-w-0 gap-2 max-[680px]:grid">
          <label class=":uno: relative min-w-0 flex-1">
            <RiSearchLine
              class=":uno: pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="postKeyword"
              class=":uno: h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
              placeholder="搜索文章标题、别名或摘要"
              @keydown.enter.prevent="searchPosts"
            />
          </label>
          <VButton type="secondary" :loading="postsLoading" @click="searchPosts">搜索</VButton>
          <VButton type="secondary" :loading="postsLoading" @click="loadPosts">刷新</VButton>
          <VButton
            type="secondary"
            :loading="loading"
            :disabled="!selectedPostName"
            @click="loadExisting(true)"
          >
            预览图谱
          </VButton>
          <VButton
            type="primary"
            :loading="generating"
            :disabled="!selectedPostName"
            @click="generateGraph"
          >
            图谱生成
          </VButton>
        </div>

        <VLoading v-if="postsLoading" />

        <VEmpty
          v-else-if="!posts.length"
          title="没有找到文章"
          message="换个关键词搜索文章。"
        />

        <div v-else class=":uno: grid gap-2">
          <button
            v-for="post in posts"
            :key="post.name"
            type="button"
            class=":uno: w-full rounded-lg border bg-white p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
            :class="
              post.name === selectedPostName
                ? ':uno: border-blue-400 ring-3 ring-blue-100'
                : ':uno: border-slate-200'
            "
            @click="selectPost(post)"
          >
            <div class=":uno: flex min-w-0 items-start gap-3">
              <span
                class=":uno: flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"
              >
                <RiArticleLine class=":uno: size-4" />
              </span>
              <span class=":uno: min-w-0 flex-1">
                <span class=":uno: flex min-w-0 flex-wrap items-center gap-2">
                  <strong class=":uno: min-w-0 truncate text-sm text-slate-900">
                    {{ post.title }}
                  </strong>
                  <span
                    class=":uno: inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold"
                    :class="postPhaseClass(post)"
                  >
                    {{ postPhaseText(post) }}
                  </span>
                </span>
                <span class=":uno: mt-1 block truncate font-mono text-xs text-slate-500">
                  {{ post.name }}
                </span>
                <span class=":uno: mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span v-if="post.slug" class=":uno: truncate">slug: {{ post.slug }}</span>
                  <span v-if="post.publishTime">发布时间：{{ formatDate(post.publishTime) }}</span>
                  <span v-else-if="post.updatedAt">更新：{{ formatDate(post.updatedAt) }}</span>
                </span>
              </span>
              <span
                v-if="post.name === selectedPostName"
                class=":uno: inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"
              >
                <RiCheckLine class=":uno: size-4" />
              </span>
            </div>
          </button>
        </div>
      </div>

      <template v-if="postTotal > 0" #footer>
        <VPagination
          v-model:page="postPage"
          v-model:size="postPageSize"
          page-label="页"
          size-label="条 / 页"
          :total-label="`共 ${postTotal} 篇文章`"
          :total="postTotal"
          :size-options="[10, 20, 50]"
        />
      </template>
    </VCard>

    <VLoading v-if="loading || generating" />

    <VEmpty
      v-if="!reading && !loading && !generating"
      title="暂无洞察图谱"
      :message="graphStatus || '选择文章后会自动预览已生成图谱；未生成时点击图谱生成。'"
    />

    <template v-if="spec">
      <div class=":uno: grid grid-cols-3 gap-2 max-[960px]:grid-cols-2">
        <VCard :body-class="[':uno: px-4 py-3']">
          <div class=":uno: text-xs text-slate-500">主题节点</div>
          <div class=":uno: mt-1 text-xl font-bold text-slate-900">{{ nodeCounts.tl }}</div>
        </VCard>
        <VCard :body-class="[':uno: px-4 py-3']">
          <div class=":uno: text-xs text-slate-500">深挖节点</div>
          <div class=":uno: mt-1 text-xl font-bold text-slate-900">{{ nodeCounts.dl }}</div>
        </VCard>
        <VCard :body-class="[':uno: px-4 py-3']">
          <div class=":uno: text-xs text-slate-500">连线</div>
          <div class=":uno: mt-1 text-xl font-bold text-slate-900">{{ edgeCount }}</div>
        </VCard>
      </div>

      <VCard :body-class="[':uno: !p-0']">
        <template #header>
          <div class=":uno: flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3">
            <div class=":uno: min-w-0">
              <div class=":uno: truncate text-sm font-bold text-slate-900">
                {{ spec.postTitle || spec.root?.title || spec.postMetadataName }}
              </div>
              <div class=":uno: mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>schema v{{ spec.schemaVersion || '-' }}</span>
                <span>model {{ spec.modelName || '-' }}</span>
                <span>{{ formatDate(spec.generatedAt) }}</span>
              </div>
            </div>
          </div>
        </template>

        <div class=":uno: p-4">
          <InsightGraphPreview :spec="spec" />
        </div>
      </VCard>
    </template>
  </div>
</template>
