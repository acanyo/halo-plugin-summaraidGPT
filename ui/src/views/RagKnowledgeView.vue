<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  Dialog,
  IconRefreshLine,
  Toast,
  VButton,
  VEmpty,
  VLoading,
  VModal,
  VPageHeader,
  VPagination,
  VSpace,
  VStatusDot,
  VSwitch,
  VTag,
} from '@halo-dev/components'
import RiAddLine from '~icons/ri/add-line'
import RiAlertLine from '~icons/ri/alert-line'
import RiArrowLeftLine from '~icons/ri/arrow-left-line'
import RiArrowRightSLine from '~icons/ri/arrow-right-s-line'
import RiArticleLine from '~icons/ri/article-line'
import RiBookOpenLine from '~icons/ri/book-open-line'
import RiCloseLine from '~icons/ri/close-line'
import RiDeleteBinLine from '~icons/ri/delete-bin-line'
import RiEdit2Line from '~icons/ri/edit-2-line'
import RiQuestionAnswerLine from '~icons/ri/question-answer-line'
import RiSearchLine from '~icons/ri/search-line'
import RiUploadLine from '~icons/ri/upload-line'
import {
  ragApi,
  type RagDocument,
  type RagImportablePost,
  type RagIndexTask,
  type RagKnowledgeBase,
  type RagSearchResult,
  type RagSourceReference,
  type RagStats,
} from '@/api/rag'

const loadingKnowledgeBases = ref(false)
const loadingDocuments = ref(false)
const loadingStats = ref(false)
const loadingImportablePosts = ref(false)
const importing = ref(false)
const rebuildingIndex = ref(false)
const searching = ref(false)
const asking = ref(false)
const mutatingDocument = ref(false)

const viewMode = ref<'list' | 'detail'>('list')
const knowledgeBases = ref<RagKnowledgeBase[]>([])
const documents = ref<RagDocument[]>([])
const stats = ref<RagStats>()
const latestTask = ref<RagIndexTask>()
const importablePosts = ref<RagImportablePost[]>([])
const activeKnowledgeBaseName = ref('')

const showKnowledgeBaseModal = ref(false)
const editingKnowledgeBase = ref<RagKnowledgeBase>()
const knowledgeBaseForm = reactive({
  name: '',
  displayName: '',
  description: '',
  enabled: true,
})

const showDocumentModal = ref(false)
const editingDocument = ref<RagDocument>()
const documentForm = reactive({
  name: '',
  sourceType: 'MANUAL',
  sourceName: '',
  title: '',
  url: '',
  content: '',
  enabled: true,
  tags: '',
  categories: '',
})

const showImportPostsModal = ref(false)
const importKeyword = ref('')
const selectedPostNames = ref<string[]>([])
const rebuildAfterImport = ref(true)

const showSearchPanel = ref(false)
const searchQuery = ref('')
const searchResults = ref<RagSearchResult[]>([])

const showAskPanel = ref(false)
const askQuestion = ref('')
const answer = ref('')
const answerSources = ref<RagSourceReference[]>([])
const askStreamError = ref('')

const documentPage = ref(1)
const documentPageSize = ref(10)
const localNeedsRebuild = ref(false)

let taskEventSource: EventSource | undefined
let subscribedTaskName = ''
let askAbortController: AbortController | undefined

const activeKnowledgeBase = computed(() =>
  knowledgeBases.value.find((item) => item.metadata.name === activeKnowledgeBaseName.value),
)

const categories = computed(() => {
  const names = new Set<string>()
  documents.value.forEach((document) => {
    ;(document.spec?.categories || []).forEach((category) => names.add(category))
  })
  return Array.from(names)
})

const enabledDocumentCount = computed(
  () =>
    stats.value?.enabledDocuments ??
    documents.value.filter((item) => item.spec?.enabled !== false).length,
)

const chunkCount = computed(
  () => stats.value?.chunkCount ?? activeKnowledgeBase.value?.status?.chunkCount ?? 0,
)

const pagedDocuments = computed(() => {
  const start = (documentPage.value - 1) * documentPageSize.value
  return documents.value.slice(start, start + documentPageSize.value)
})

const importableFilteredPosts = computed(() => {
  const keyword = importKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return importablePosts.value
  }
  return importablePosts.value.filter((post) => {
    return (
      post.postName.toLowerCase().includes(keyword) ||
      (post.title || '').toLowerCase().includes(keyword)
    )
  })
})

const selectedImportableSet = computed(() => new Set(selectedPostNames.value))

const allVisiblePostsSelected = computed(
  () =>
    importableFilteredPosts.value.length > 0 &&
    importableFilteredPosts.value.every((post) => selectedImportableSet.value.has(post.postName)),
)

const latestTaskRunning = computed(() => {
  const phase = latestTask.value?.status?.phase
  return phase === 'QUEUED' || phase === 'RUNNING'
})

const canRebuildIndex = computed(() => !latestTaskRunning.value && !rebuildingIndex.value)

const needsRebuild = computed(() => localNeedsRebuild.value || stats.value?.needsRebuild === true)

const latestTaskFailed = computed(() => latestTask.value?.status?.phase === 'FAILED')

const indexErrorMessage = computed(() => {
  const isKnowledgeBaseErrored = activeKnowledgeBase.value?.status?.indexState === 'ERROR'
  if (!latestTaskFailed.value && !isKnowledgeBaseErrored) {
    return ''
  }
  return formatIndexError(
    latestTask.value?.status?.errorMessage ||
      activeKnowledgeBase.value?.status?.errorMessage ||
      latestTask.value?.status?.message,
  )
})

const showIndexErrorNotice = computed(
  () => Boolean(indexErrorMessage.value) && !latestTaskRunning.value,
)

const showNeedsRebuildNotice = computed(
  () => needsRebuild.value && !latestTaskRunning.value && !showIndexErrorNotice.value,
)

const rebuildNoticeTitle = computed(() => {
  const staleDocuments = stats.value?.staleDocuments ?? 0
  if (staleDocuments > 0) {
    return `${staleDocuments} 个条目有未写入索引的变更`
  }
  return '当前变更还没有写入索引'
})

const rebuildNoticeDescription = computed(
  () =>
    '检索和问答会继续使用上一次成功构建的索引。重建完成后，新导入、编辑、启用或禁用的内容才会生效。',
)

const rebuildProgress = computed(() => {
  if (!latestTask.value || !latestTaskRunning.value) {
    return undefined
  }
  return {
    current: latestTask.value.status?.progress ?? 0,
    total: 100,
    message: latestTask.value.status?.message || '正在处理...',
  }
})

const fetchKnowledgeBases = async () => {
  loadingKnowledgeBases.value = true
  try {
    knowledgeBases.value = await ragApi.listKnowledgeBases()
    if (
      !activeKnowledgeBaseName.value ||
      !knowledgeBases.value.some((item) => item.metadata.name === activeKnowledgeBaseName.value)
    ) {
      activeKnowledgeBaseName.value = knowledgeBases.value[0]?.metadata.name || ''
    }
  } catch (error) {
    Toast.error('加载失败')
  } finally {
    loadingKnowledgeBases.value = false
  }
}

const fetchDocuments = async () => {
  if (!activeKnowledgeBaseName.value) {
    documents.value = []
    return
  }
  loadingDocuments.value = true
  try {
    documents.value = await ragApi.listDocuments({ knowledgeBase: activeKnowledgeBaseName.value })
    documentPage.value = 1
  } catch (error) {
    Toast.error('文档加载失败')
  } finally {
    loadingDocuments.value = false
  }
}

const fetchStats = async () => {
  if (!activeKnowledgeBaseName.value) {
    stats.value = undefined
    return
  }
  loadingStats.value = true
  try {
    stats.value = await ragApi.stats(activeKnowledgeBaseName.value)
  } catch (error) {
    Toast.error('统计加载失败')
  } finally {
    loadingStats.value = false
  }
}

const fetchLatestTask = async (silent = false) => {
  if (!activeKnowledgeBaseName.value) {
    latestTask.value = undefined
    return
  }
  try {
    const task = await ragApi.latestIndexTask(activeKnowledgeBaseName.value)
    latestTask.value = task
    if (task && taskIsRunning(task)) {
      subscribeIndexTask(task)
    } else {
      closeTaskSubscription()
    }
  } catch (error) {
    if (!silent) {
      Toast.error('索引状态加载失败')
    }
  }
}

const fetchDetailData = async () => {
  await Promise.all([fetchDocuments(), fetchStats(), fetchLatestTask(true)])
}

const refreshAll = async () => {
  await fetchKnowledgeBases()
  await fetchDetailData()
}

const openKnowledgeBaseDetail = async (knowledgeBase: RagKnowledgeBase) => {
  activeKnowledgeBaseName.value = knowledgeBase.metadata.name
  viewMode.value = 'detail'
  await fetchDetailData()
}

const backToKnowledgeBases = () => {
  viewMode.value = 'list'
  showSearchPanel.value = false
  showAskPanel.value = false
}

const openKnowledgeBaseModal = (knowledgeBase?: RagKnowledgeBase) => {
  editingKnowledgeBase.value = knowledgeBase
  knowledgeBaseForm.name = knowledgeBase?.metadata.name || ''
  knowledgeBaseForm.displayName = knowledgeBase?.spec?.displayName || ''
  knowledgeBaseForm.description = knowledgeBase?.spec?.description || ''
  knowledgeBaseForm.enabled = knowledgeBase?.spec?.enabled !== false
  showKnowledgeBaseModal.value = true
}

const saveKnowledgeBase = async () => {
  if (!knowledgeBaseForm.name.trim() || !knowledgeBaseForm.displayName.trim()) {
    Toast.warning('请填写知识库标识和名称')
    return
  }
  try {
    const saved = await ragApi.saveKnowledgeBase({
      name: knowledgeBaseForm.name.trim(),
      displayName: knowledgeBaseForm.displayName.trim(),
      description: knowledgeBaseForm.description.trim() || undefined,
      enabled: knowledgeBaseForm.enabled,
      sourceTypes: ['POST', 'MANUAL'],
    })
    Toast.success(editingKnowledgeBase.value ? '更新成功' : '创建成功')
    showKnowledgeBaseModal.value = false
    activeKnowledgeBaseName.value = saved.metadata.name
    await refreshAll()
    if (viewMode.value === 'detail') {
      await fetchDetailData()
    }
  } catch (error) {
    Toast.error('保存失败')
  }
}

const deleteKnowledgeBase = (event: Event | undefined, knowledgeBase: RagKnowledgeBase) => {
  event?.stopPropagation()
  Dialog.warning({
    title: '确认删除',
    description: `确定要删除知识库「${displayName(knowledgeBase)}」吗？文档和本地索引会一并删除，此操作不可恢复。`,
    confirmType: 'danger',
    onConfirm: async () => {
      try {
        await ragApi.deleteKnowledgeBase(knowledgeBase.metadata.name)
        Toast.success('删除成功')
        viewMode.value = 'list'
        activeKnowledgeBaseName.value = ''
        localNeedsRebuild.value = false
        await fetchKnowledgeBases()
      } catch (error) {
        Toast.error('删除失败')
      }
    },
  })
}

const openDocumentModal = (document?: RagDocument) => {
  editingDocument.value = document
  documentForm.name = document?.metadata.name || ''
  documentForm.sourceType = document?.spec?.sourceType || 'MANUAL'
  documentForm.sourceName = document?.spec?.sourceName || ''
  documentForm.title = document?.spec?.title || ''
  documentForm.url = document?.spec?.url || ''
  documentForm.content = document?.spec?.content || ''
  documentForm.enabled = document?.spec?.enabled !== false
  documentForm.tags = (document?.spec?.tags || []).join(', ')
  documentForm.categories = (document?.spec?.categories || []).join(', ')
  showDocumentModal.value = true
}

const saveDocument = async () => {
  if (!documentForm.title.trim()) {
    Toast.warning('请输入标题')
    return
  }
  if (!documentForm.content.trim()) {
    Toast.warning('请输入内容')
    return
  }

  try {
    await ragApi.saveDocument({
      name: documentForm.name || undefined,
      knowledgeBase: activeKnowledgeBaseName.value,
      sourceType: documentForm.sourceType || 'MANUAL',
      sourceName: documentForm.sourceName.trim() || undefined,
      title: documentForm.title.trim(),
      url: documentForm.url.trim() || undefined,
      content: documentForm.content.trim(),
      enabled: documentForm.enabled,
      tags: splitInput(documentForm.tags),
      categories: splitInput(documentForm.categories),
    })
    Toast.success('保存成功，请重建索引后生效')
    showDocumentModal.value = false
    markNeedsRebuild()
    await Promise.all([fetchDocuments(), fetchStats()])
  } catch (error) {
    Toast.error('保存失败')
  }
}

const deleteDocument = (document: RagDocument) => {
  Dialog.warning({
    title: '确认删除',
    description: `确定要删除「${document.spec?.title || document.metadata.name}」吗？删除后需要重建索引。`,
    confirmType: 'danger',
    onConfirm: async () => {
      try {
        await ragApi.deleteDocument(document.metadata.name)
        Toast.success('删除成功')
        markNeedsRebuild()
        await Promise.all([fetchDocuments(), fetchStats()])
      } catch (error) {
        Toast.error('删除失败')
      }
    },
  })
}

const updateDocumentEnabled = async (document: RagDocument, enabled: boolean) => {
  mutatingDocument.value = true
  try {
    await ragApi.updateDocumentStatus(document.metadata.name, { enabled })
    Toast.success(enabled ? '已启用' : '已禁用')
    markNeedsRebuild()
    await Promise.all([fetchDocuments(), fetchStats()])
  } catch (error) {
    Toast.error('状态更新失败')
  } finally {
    mutatingDocument.value = false
  }
}

const openImportPostsModal = async () => {
  showImportPostsModal.value = true
  selectedPostNames.value = []
  importKeyword.value = ''
  await fetchImportablePosts()
}

const fetchImportablePosts = async () => {
  if (!activeKnowledgeBaseName.value) {
    return
  }
  loadingImportablePosts.value = true
  try {
    importablePosts.value = await ragApi.listImportablePosts({
      knowledgeBase: activeKnowledgeBaseName.value,
    })
  } catch (error) {
    Toast.error('可导入文章加载失败')
  } finally {
    loadingImportablePosts.value = false
  }
}

const togglePostSelection = (name: string, checked: boolean) => {
  selectedPostNames.value = checked
    ? Array.from(new Set([...selectedPostNames.value, name]))
    : selectedPostNames.value.filter((item) => item !== name)
}

const toggleAllVisiblePosts = (checked: boolean) => {
  selectedPostNames.value = checked
    ? importableFilteredPosts.value.map((post) => post.postName)
    : []
}

const importPosts = (mode: 'all' | 'selected') => {
  const postNames = mode === 'selected' ? selectedPostNames.value : []
  if (mode === 'selected' && postNames.length === 0) {
    Toast.warning('请先选择要导入的文章')
    return
  }

  Dialog.warning({
    title: '导入公开文章',
    description:
      mode === 'selected'
        ? `将导入所选 ${postNames.length} 篇公开文章。${rebuildAfterImport.value ? '导入后会立即重建索引。' : ''}`
        : `将导入全部已发布且公开可见的文章。${rebuildAfterImport.value ? '导入后会立即重建索引。' : ''}`,
    onConfirm: async () => {
      importing.value = true
      try {
        const result = await ragApi.importPosts(activeKnowledgeBaseName.value, postNames, {
          rebuildAfterImport: rebuildAfterImport.value,
        })
        Toast.success(
          result.task
            ? `已导入 ${result.imported} 篇文章，索引任务已启动`
            : `已导入 ${result.imported} 篇文章，请重建索引`,
        )
        showImportPostsModal.value = false
        selectedPostNames.value = []
        if (result.task) {
          latestTask.value = result.task
          subscribeIndexTask(result.task)
        } else {
          markNeedsRebuild()
        }
        await refreshAll()
      } catch (error) {
        Toast.error('导入失败')
      } finally {
        importing.value = false
      }
    },
  })
}

const rebuildIndex = () => {
  Dialog.warning({
    title: '确认重建索引',
    description:
      '重建索引将调用 AI 基座 Embedding 模型重新向量化全部启用文档，并覆盖本地 Lucene 索引。',
    confirmText: '确认重建',
    cancelText: '取消',
    onConfirm: async () => {
      rebuildingIndex.value = true
      try {
        const result = await ragApi.rebuild(activeKnowledgeBaseName.value)
        latestTask.value = result.task
        subscribeIndexTask(result.task)
        Toast.success('索引任务已启动')
        await refreshAll()
      } catch (error) {
        Toast.error('重建索引失败')
      } finally {
        rebuildingIndex.value = false
      }
    },
  })
}

const runSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    searchResults.value = await ragApi.search({
      knowledgeBase: activeKnowledgeBaseName.value,
      query: searchQuery.value.trim(),
      limit: 10,
    })
  } catch (error) {
    Toast.error('搜索失败')
  } finally {
    searching.value = false
  }
}

const runAsk = async () => {
  if (!askQuestion.value.trim()) {
    Toast.warning('请输入问题')
    return
  }
  askAbortController?.abort()
  const controller = new AbortController()
  askAbortController = controller
  asking.value = true
  answer.value = ''
  answerSources.value = []
  askStreamError.value = ''

  try {
    await ragApi.askStream(
      {
        knowledgeBase: activeKnowledgeBaseName.value,
        question: askQuestion.value.trim(),
        limit: 8,
      },
      {
        onSources: (sources) => {
          answerSources.value = sources
        },
        onDelta: (delta) => {
          answer.value += delta
        },
        onError: (message) => {
          askStreamError.value = message
          Toast.error(message)
        },
      },
      controller.signal,
    )
  } catch (error) {
    if (!controller.signal.aborted) {
      Toast.error('问答失败')
    }
  } finally {
    if (askAbortController === controller) {
      askAbortController = undefined
    }
    asking.value = false
  }
}

const stopAsk = () => {
  askAbortController?.abort()
  askAbortController = undefined
  asking.value = false
}

const closeTaskSubscription = () => {
  taskEventSource?.close()
  taskEventSource = undefined
  subscribedTaskName = ''
}

const subscribeIndexTask = (task: RagIndexTask) => {
  if (!taskIsRunning(task)) {
    closeTaskSubscription()
    return
  }
  if (taskEventSource && subscribedTaskName === task.metadata.name) {
    return
  }

  closeTaskSubscription()
  subscribedTaskName = task.metadata.name
  taskEventSource = ragApi.subscribeIndexTask(
    task.metadata.name,
    async (updatedTask) => {
      latestTask.value = updatedTask
      if (!taskIsTerminal(updatedTask)) {
        return
      }

      closeTaskSubscription()
      if (updatedTask.status?.phase === 'SUCCEEDED') {
        localNeedsRebuild.value = false
        Toast.success('索引重建完成')
      } else if (updatedTask.status?.phase === 'FAILED') {
        localNeedsRebuild.value = true
        Toast.error(formatIndexError(updatedTask.status?.errorMessage))
      }
      await refreshAll()
    },
    () => {
      if (!latestTask.value || taskIsTerminal(latestTask.value)) {
        closeTaskSubscription()
        return
      }
      window.setTimeout(() => fetchLatestTask(true), 1500)
    },
  )
}

const taskIsRunning = (task?: RagIndexTask) => {
  const phase = task?.status?.phase
  return phase === 'QUEUED' || phase === 'RUNNING'
}

const taskIsTerminal = (task?: RagIndexTask) => {
  const phase = task?.status?.phase
  return phase === 'SUCCEEDED' || phase === 'FAILED' || phase === 'CANCELED'
}

const statusInfo = (state?: string) => {
  switch (state) {
    case 'READY':
      return { state: 'success' as const, text: '就绪' }
    case 'INDEXING':
      return { state: 'warning' as const, text: '索引中' }
    case 'ERROR':
      return { state: 'error' as const, text: '错误' }
    case 'EMPTY':
      return { state: 'default' as const, text: '空索引' }
    default:
      return { state: 'default' as const, text: '待索引' }
  }
}

const sourceTypeText = (sourceType?: string) => {
  if (sourceType === 'POST') return '文章'
  if (sourceType === 'PAGE') return '页面'
  if (sourceType === 'MANUAL') return '手动'
  if (sourceType === 'ATTACHMENT') return '附件'
  return sourceType || '未知'
}

const displayName = (knowledgeBase?: RagKnowledgeBase) =>
  knowledgeBase?.spec?.displayName || knowledgeBase?.metadata.name || '知识库'

const firstCharacter = (knowledgeBase: RagKnowledgeBase) =>
  displayName(knowledgeBase).trim().slice(0, 1)

const stripHtmlAndMarkdown = (text?: string): string => {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const splitInput = (value: string) =>
  value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)

const markNeedsRebuild = () => {
  localNeedsRebuild.value = true
}

function formatIndexError(message?: string) {
  if (!message) {
    return '索引重建失败，请检查 AI 基座模型配置后重试。'
  }
  const normalized = message.toLowerCase()
  if (normalized.includes('retries exhausted')) {
    return 'AI 基座调用失败：Embedding 模型连续重试后仍未成功。请检查向量模型、服务可用性、额度或网络后重新重建索引。'
  }
  if (normalized.includes('exceeded limit on max bytes to buffer')) {
    return 'AI 基座返回内容超过当前缓冲限制。已改为小批量向量化；请重新重建索引，若仍失败可先减少单次导入内容。'
  }
  if (normalized.includes('timeout')) {
    return 'AI 基座调用超时。请检查向量模型响应速度，或减少单次导入内容后重新重建索引。'
  }
  if (message.includes('AI Foundation 插件未安装或未启用')) {
    return message
  }
  return message
}

const formatRelativeDate = (value?: string) => {
  if (!value) return '-'
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return '-'
  const diff = Date.now() - time
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < month) return `${Math.floor(diff / day)} 天前`
  return `${Math.floor(diff / month)} 个月前`
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

watch(activeKnowledgeBaseName, () => {
  closeTaskSubscription()
  stopAsk()
  searchResults.value = []
  answer.value = ''
  answerSources.value = []
  askStreamError.value = ''
  latestTask.value = undefined
  localNeedsRebuild.value = false
})

onMounted(async () => {
  await fetchKnowledgeBases()
  if (activeKnowledgeBaseName.value) {
    await fetchDetailData()
  }
})

onBeforeUnmount(() => {
  closeTaskSubscription()
  stopAsk()
})
</script>

<template>
  <template v-if="viewMode === 'list'">
    <VPageHeader title="知识库">
      <template #icon>
        <RiBookOpenLine class="mr-2 self-center" />
      </template>
      <template #actions>
        <VSpace>
          <VButton type="secondary" :loading="loadingKnowledgeBases" @click="refreshAll">
            <template #icon>
              <IconRefreshLine class="h-full w-full" />
            </template>
            刷新
          </VButton>
          <VButton type="secondary" @click="openKnowledgeBaseModal()">
            <template #icon>
              <RiAddLine class="h-full w-full" />
            </template>
            新建知识库
          </VButton>
        </VSpace>
      </template>
    </VPageHeader>

    <div class="knowledge-list-container">
      <VLoading v-if="loadingKnowledgeBases" />
      <VEmpty
        v-else-if="knowledgeBases.length === 0"
        title="暂无知识库"
        message="创建知识库来存储和管理 RAG 检索内容"
      >
        <template #actions>
          <VButton type="secondary" @click="openKnowledgeBaseModal()">
            <template #icon>
              <RiAddLine class="h-full w-full" />
            </template>
            新建知识库
          </VButton>
        </template>
      </VEmpty>

      <div v-else class="knowledge-list">
        <article
          v-for="knowledgeBase in knowledgeBases"
          :key="knowledgeBase.metadata.name"
          class="kb-row"
          @click="openKnowledgeBaseDetail(knowledgeBase)"
        >
          <div class="kb-avatar">{{ firstCharacter(knowledgeBase) }}</div>

          <div class="kb-main">
            <div class="kb-title-row">
              <h3 class="kb-title">{{ displayName(knowledgeBase) }}</h3>
              <VStatusDot v-bind="statusInfo(knowledgeBase.status?.indexState)" class="kb-status" />
            </div>
            <p v-if="knowledgeBase.spec?.description" class="kb-desc">
              {{ knowledgeBase.spec.description }}
            </p>
            <p v-else class="kb-desc muted">暂无描述</p>
          </div>

          <div class="kb-row-meta">
            <span>文档 {{ knowledgeBase.status?.documentCount || 0 }}</span>
            <span>最后索引 {{ formatRelativeDate(knowledgeBase.status?.lastIndexedAt) }}</span>
          </div>

          <div class="kb-actions">
            <button
              class="kb-action-btn"
              title="编辑"
              @click.stop="openKnowledgeBaseModal(knowledgeBase)"
            >
              <RiEdit2Line />
            </button>
            <button
              class="kb-action-btn kb-action-btn-danger"
              title="删除"
              @click="deleteKnowledgeBase($event, knowledgeBase)"
            >
              <RiDeleteBinLine />
            </button>
            <RiArrowRightSLine class="kb-arrow" />
          </div>
        </article>

        <button class="create-kb-row" type="button" @click="openKnowledgeBaseModal()">
          <RiAddLine />
          <span>新建知识库</span>
        </button>
      </div>
    </div>
  </template>

  <template v-else>
    <VPageHeader :title="displayName(activeKnowledgeBase)">
      <template #icon>
        <button class="back-btn" @click="backToKnowledgeBases">
          <RiArrowLeftLine />
        </button>
      </template>
      <template #actions>
        <VSpace>
          <VButton size="sm" @click="showSearchPanel = !showSearchPanel">
            <template #icon>
              <RiSearchLine class="h-full w-full" />
            </template>
            检索测试
          </VButton>
          <VButton size="sm" @click="showAskPanel = !showAskPanel">
            <template #icon>
              <RiQuestionAnswerLine class="h-full w-full" />
            </template>
            RAG 问答
          </VButton>
          <VButton
            size="sm"
            :loading="rebuildingIndex || latestTaskRunning"
            :disabled="!canRebuildIndex"
            @click="rebuildIndex"
          >
            <template #icon>
              <IconRefreshLine class="h-full w-full" />
            </template>
            <template v-if="rebuildProgress">
              {{ rebuildProgress.current }}/{{ rebuildProgress.total }}
            </template>
            <template v-else>重建索引</template>
          </VButton>
          <VButton size="sm" @click="openImportPostsModal">
            <template #icon>
              <RiUploadLine class="h-full w-full" />
            </template>
            导入
          </VButton>
          <VButton type="secondary" @click="openDocumentModal()">
            <template #icon>
              <RiAddLine class="h-full w-full" />
            </template>
            新建条目
          </VButton>
        </VSpace>
      </template>
    </VPageHeader>

    <div class="kb-detail-container">
      <VLoading v-if="loadingDocuments || loadingStats" />

      <template v-else-if="activeKnowledgeBase">
        <div class="kb-overview">
          <div class="kb-overview-main">
            <VStatusDot v-bind="statusInfo(activeKnowledgeBase.status?.indexState)" />
            <p>
              {{ activeKnowledgeBase.spec?.description || '这个知识库还没有描述。' }}
            </p>
          </div>
          <dl class="kb-metrics">
            <div>
              <dt>已索引文档</dt>
              <dd>{{ activeKnowledgeBase.status?.documentCount || enabledDocumentCount }}</dd>
            </div>
            <div>
              <dt>启用条目</dt>
              <dd>{{ enabledDocumentCount }}</dd>
            </div>
            <div>
              <dt>分块</dt>
              <dd>{{ chunkCount }}</dd>
            </div>
            <div>
              <dt>分类</dt>
              <dd>{{ categories.length }}</dd>
            </div>
            <div>
              <dt>最后索引</dt>
              <dd>{{ formatRelativeDate(activeKnowledgeBase.status?.lastIndexedAt) }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="showIndexErrorNotice" class="index-notice index-notice-error">
          <span class="index-notice-icon">
            <RiAlertLine />
          </span>
          <div class="index-notice-body">
            <strong>{{ latestTaskFailed ? '上次索引重建失败' : '知识库索引异常' }}</strong>
            <p>{{ indexErrorMessage }}</p>
          </div>
          <VButton
            size="sm"
            :disabled="!canRebuildIndex"
            :loading="rebuildingIndex"
            @click="rebuildIndex"
          >
            重新重建
          </VButton>
        </div>

        <div v-if="showNeedsRebuildNotice" class="index-notice index-notice-warning">
          <span class="index-notice-icon">
            <RiAlertLine />
          </span>
          <div class="index-notice-body">
            <strong>{{ rebuildNoticeTitle }}</strong>
            <p>{{ rebuildNoticeDescription }}</p>
          </div>
          <VButton
            size="sm"
            :disabled="!canRebuildIndex"
            :loading="rebuildingIndex"
            @click="rebuildIndex"
          >
            立即重建
          </VButton>
        </div>

        <div v-if="latestTaskRunning && latestTask" class="task-panel">
          <div class="task-head">
            <span>{{ latestTask.status?.message || '索引任务执行中' }}</span>
            <strong>{{ latestTask.status?.progress ?? 0 }}%</strong>
          </div>
          <div class="progress-track">
            <span :style="{ width: `${latestTask.status?.progress ?? 0}%` }"></span>
          </div>
        </div>

        <div v-if="showSearchPanel" class="search-panel">
          <div class="search-panel-header">
            <div class="search-panel-title">
              <RiSearchLine class="search-panel-icon" />
              <span>检索测试</span>
            </div>
            <button class="search-panel-close" @click="showSearchPanel = false">
              <RiCloseLine />
            </button>
          </div>
          <div class="search-panel-body">
            <div class="search-input-wrapper">
              <RiSearchLine class="search-input-icon" />
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="输入关键词或问题进行测试..."
                @keyup.enter="runSearch"
              />
              <VButton size="sm" :loading="searching" @click="runSearch">搜索</VButton>
            </div>
            <div class="search-results">
              <div v-if="searchResults.length === 0" class="search-empty">
                <RiSearchLine class="search-empty-icon" />
                <span>{{ searchQuery ? '没有匹配的结果' : '输入关键词开始测试' }}</span>
              </div>
              <div v-else class="search-results-list">
                <div
                  v-for="(item, index) in searchResults"
                  :key="item.id"
                  class="search-result-item"
                >
                  <span class="search-result-index">{{ index + 1 }}</span>
                  <div class="search-result-content">
                    <div class="search-result-header">
                      <div class="search-result-title">{{ item.title || item.id }}</div>
                      <div class="search-result-score">
                        {{ ((item.rerankScore ?? item.score ?? 0) * 100).toFixed(1) }}%
                      </div>
                    </div>
                    <div class="search-result-desc">{{ stripHtmlAndMarkdown(item.content) }}</div>
                    <div v-if="item.sourceType" class="search-result-category">
                      <VTag size="sm">{{ sourceTypeText(item.sourceType) }}</VTag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showAskPanel" class="search-panel">
          <div class="search-panel-header">
            <div class="search-panel-title">
              <RiQuestionAnswerLine class="search-panel-icon" />
              <span>RAG 问答</span>
            </div>
            <button class="search-panel-close" @click="showAskPanel = false">
              <RiCloseLine />
            </button>
          </div>
          <div class="ask-panel-body">
            <textarea
              v-model="askQuestion"
              class="ask-input"
              placeholder="输入问题，基于当前知识库资料生成回答..."
            ></textarea>
            <VSpace>
              <VButton type="primary" :loading="asking" @click="runAsk">提问</VButton>
              <VButton v-if="asking" type="secondary" @click="stopAsk">停止</VButton>
            </VSpace>
            <div v-if="askStreamError" class="ask-error">{{ askStreamError }}</div>
            <div v-if="answer" class="answer-box">{{ answer }}</div>
            <div v-if="answerSources.length" class="source-list">
              <div v-for="source in answerSources" :key="source.id" class="source-item">
                <RiArticleLine />
                <a v-if="source.url" :href="source.url" target="_blank">{{
                  source.title || source.id
                }}</a>
                <span v-else>{{ source.title || source.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="entries-section">
          <div class="entries-header">
            <h3 class="entries-title">知识库条目</h3>
            <span class="entries-count">{{ documents.length }} 条</span>
          </div>

          <div class="entries-content">
            <VEmpty
              v-if="documents.length === 0"
              title="暂无条目"
              message="点击右上角「新建条目」或「导入」添加数据"
              class="entries-empty"
            />

            <div v-else class="entries-list">
              <div
                v-for="document in pagedDocuments"
                :key="document.metadata.name"
                class="entry-item"
                :class="{ 'entry-deleting': !!document.metadata.deletionTimestamp }"
              >
                <div class="entry-main">
                  <div class="entry-title">
                    {{ document.spec?.title || document.metadata.name }}
                    <span v-if="document.metadata.deletionTimestamp" class="deleting-badge"
                      >删除中...</span
                    >
                  </div>
                  <div class="entry-desc">{{ stripHtmlAndMarkdown(document.spec?.content) }}</div>
                  <div class="entry-meta">
                    <VTag size="sm">{{ sourceTypeText(document.spec?.sourceType) }}</VTag>
                    <VTag
                      v-for="category in (document.spec?.categories || []).slice(0, 2)"
                      :key="category"
                      size="sm"
                    >
                      {{ category }}
                    </VTag>
                    <VStatusDot
                      :state="document.spec?.enabled !== false ? 'success' : 'default'"
                      :text="document.spec?.enabled !== false ? '启用' : '禁用'"
                    />
                    <span v-if="document.status?.chunkCount" class="entry-keyword">
                      {{ document.status.chunkCount }} 分块
                    </span>
                    <span v-if="document.status?.lastIndexedAt" class="entry-keyword">
                      {{ formatRelativeDate(document.status.lastIndexedAt) }}
                    </span>
                  </div>
                </div>
                <div v-if="!document.metadata.deletionTimestamp" class="entry-actions">
                  <label class="entry-switch">
                    <span>启用</span>
                    <VSwitch
                      :model-value="document.spec?.enabled !== false"
                      :disabled="mutatingDocument"
                      @update:model-value="(checked) => updateDocumentEnabled(document, checked)"
                    />
                  </label>
                  <button class="entry-action-btn" @click="openDocumentModal(document)">
                    编辑
                  </button>
                  <button
                    class="entry-action-btn entry-action-btn-danger"
                    @click="deleteDocument(document)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="documents.length > documentPageSize" class="entries-pagination">
            <VPagination
              v-model:page="documentPage"
              v-model:size="documentPageSize"
              :total="documents.length"
              :size-options="[10, 20, 50]"
            />
          </div>
        </div>
      </template>
    </div>
  </template>

  <VModal
    v-model:visible="showKnowledgeBaseModal"
    :title="editingKnowledgeBase ? '编辑知识库' : '新建知识库'"
    :width="480"
  >
    <div class="form-stack">
      <label class="form-field">
        <span>标识</span>
        <input
          v-model="knowledgeBaseForm.name"
          class="form-input"
          :disabled="Boolean(editingKnowledgeBase)"
          placeholder="default"
        />
      </label>
      <label class="form-field">
        <span>名称</span>
        <input
          v-model="knowledgeBaseForm.displayName"
          class="form-input"
          placeholder="如：产品文档、常见问题"
        />
      </label>
      <label class="form-field">
        <span>描述</span>
        <textarea
          v-model="knowledgeBaseForm.description"
          class="form-textarea"
          placeholder="可选，简要描述知识库用途"
        />
      </label>
      <label class="switch-row">
        <VSwitch v-model="knowledgeBaseForm.enabled" />
        <span>启用知识库</span>
      </label>
    </div>
    <template #footer>
      <VSpace>
        <VButton @click="showKnowledgeBaseModal = false">取消</VButton>
        <VButton type="primary" @click="saveKnowledgeBase">保存</VButton>
      </VSpace>
    </template>
  </VModal>

  <VModal
    v-model:visible="showDocumentModal"
    :title="editingDocument ? '编辑知识库条目' : '新建知识库条目'"
    :width="650"
  >
    <div class="form-stack">
      <label class="form-field">
        <span>标题</span>
        <input v-model="documentForm.title" class="form-input" placeholder="问题或知识点标题" />
      </label>

      <label class="form-field">
        <span>内容</span>
        <textarea
          v-model="documentForm.content"
          class="form-textarea form-textarea-large"
          placeholder="答案或详细内容，支持 Markdown 格式"
        />
      </label>

      <div class="form-grid">
        <label class="form-field">
          <span>来源类型</span>
          <select
            v-model="documentForm.sourceType"
            class="form-input"
            :disabled="Boolean(editingDocument)"
          >
            <option value="MANUAL">手动</option>
            <option value="POST">文章</option>
            <option value="PAGE">页面</option>
            <option value="ATTACHMENT">附件</option>
          </select>
        </label>
        <label class="form-field">
          <span>来源标识</span>
          <input
            v-model="documentForm.sourceName"
            class="form-input"
            placeholder="可选，默认自动生成"
          />
        </label>
      </div>

      <label class="form-field">
        <span>URL</span>
        <input v-model="documentForm.url" class="form-input" placeholder="可选，来源链接" />
      </label>

      <div class="form-grid">
        <label class="form-field">
          <span>标签</span>
          <input v-model="documentForm.tags" class="form-input" placeholder="多个标签用逗号分隔" />
        </label>
        <label class="form-field">
          <span>分类</span>
          <input
            v-model="documentForm.categories"
            class="form-input"
            placeholder="多个分类用逗号分隔"
          />
        </label>
      </div>

      <label class="switch-row">
        <VSwitch v-model="documentForm.enabled" />
        <span>启用此条目</span>
      </label>
    </div>
    <template #footer>
      <VSpace>
        <VButton @click="showDocumentModal = false">取消</VButton>
        <VButton type="primary" @click="saveDocument">保存</VButton>
      </VSpace>
    </template>
  </VModal>

  <VModal v-model:visible="showImportPostsModal" title="导入知识库" :width="760">
    <div class="import-container">
      <div class="posts-section">
        <div class="posts-header">
          <div class="posts-icon">
            <RiArticleLine />
          </div>
          <div class="posts-title">
            <h4>导入 Halo 文章</h4>
            <p>将已发布的博客文章同步到当前知识库</p>
          </div>
        </div>

        <div class="search-input-wrapper import-search">
          <RiSearchLine class="search-input-icon" />
          <input v-model="importKeyword" class="search-input" placeholder="搜索公开文章" />
          <VButton size="sm" :loading="loadingImportablePosts" @click="fetchImportablePosts"
            >刷新</VButton
          >
        </div>

        <label class="switch-row">
          <VSwitch v-model="rebuildAfterImport" />
          <span>导入后立即重建索引</span>
        </label>

        <VLoading v-if="loadingImportablePosts" />
        <VEmpty v-else-if="importableFilteredPosts.length === 0" title="暂无可导入文章" />
        <div v-else class="post-list">
          <div class="post-row post-row-head">
            <VSwitch
              :model-value="allVisiblePostsSelected"
              @update:model-value="toggleAllVisiblePosts"
            />
            <span>文章</span>
            <span>状态</span>
          </div>
          <label v-for="post in importableFilteredPosts" :key="post.postName" class="post-row">
            <VSwitch
              :model-value="selectedImportableSet.has(post.postName)"
              @update:model-value="(checked) => togglePostSelection(post.postName, checked)"
            />
            <span class="post-main">
              <span class="post-title">{{ post.title || post.postName }}</span>
              <span class="post-meta">
                {{ post.postName }} · {{ post.chunkCount || 0 }} 分块 ·
                {{ formatDate(post.lastImportedAt) }}
              </span>
            </span>
            <VTag :class="post.imported ? 'tag-success' : 'tag-muted'">
              {{ post.imported ? '已导入' : '未导入' }}
            </VTag>
          </label>
        </div>
      </div>
    </div>
    <template #footer>
      <VSpace>
        <VButton @click="showImportPostsModal = false">取消</VButton>
        <VButton :loading="importing" @click="importPosts('all')">导入全部</VButton>
        <VButton type="primary" :loading="importing" @click="importPosts('selected')">
          导入所选 {{ selectedPostNames.length }}
        </VButton>
      </VSpace>
    </template>
  </VModal>
</template>

<style scoped>
.knowledge-list-container {
  padding: 16px;
}

.knowledge-list {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.kb-row,
.create-kb-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) minmax(190px, auto) auto;
  gap: 14px;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-bottom: 1px solid #edf0f5;
  background: #fff;
  text-align: left;
}

.kb-row {
  cursor: pointer;
}

.kb-row:hover,
.create-kb-row:hover {
  background: #fafafa;
}

.kb-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #111827;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 700;
}

.kb-main {
  min-width: 0;
}

.kb-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kb-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #6b7280;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s;
}

.kb-action-btn:hover {
  color: #374151;
  background: #f8fafc;
}

.kb-action-btn-danger:hover {
  color: #ef4444;
  border-color: #fecaca;
  background: #fff7f7;
}

.kb-action-btn svg {
  width: 14px;
  height: 14px;
}

.kb-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin-bottom: 4px;
}

.kb-title {
  overflow: hidden;
  margin: 0;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kb-status {
  flex: 0 0 auto;
}

.kb-desc {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.kb-desc.muted {
  color: #9ca3af;
}

.kb-row-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
}

.kb-arrow {
  width: 20px;
  height: 20px;
  color: #d1d5db;
  transition: all 0.2s;
}

.kb-row:hover .kb-arrow {
  color: #475569;
  transform: translateX(2px);
}

.create-kb-row {
  grid-template-columns: 20px minmax(0, 1fr);
  color: #475569;
  font-size: 13px;
  font-weight: 650;
  border-bottom: none;
  cursor: pointer;
}

.create-kb-row svg {
  width: 16px;
  height: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #64748b;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #111827;
  background: #f8fafc;
  border-color: #cbd5e1;
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.kb-detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
}

.kb-overview {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.kb-overview-main {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.kb-overview-main p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.kb-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(74px, auto));
  gap: 12px;
  margin: 0;
}

.kb-metrics div {
  min-width: 0;
  padding-left: 12px;
  border-left: 1px solid #edf0f5;
}

.kb-metrics dt {
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
}

.kb-metrics dd {
  margin: 4px 0 0;
  overflow: hidden;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.index-notice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid;
  border-radius: 8px;
}

.index-notice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
}

.index-notice-icon svg {
  width: 18px;
  height: 18px;
}

.index-notice-body {
  min-width: 0;
}

.index-notice-body strong {
  display: block;
  margin-bottom: 3px;
  color: #1e293b;
  font-size: 13px;
  line-height: 1.4;
}

.index-notice-body p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.index-notice-warning {
  background: #fffbeb;
  border-color: #fde68a;
}

.index-notice-warning .index-notice-icon {
  color: #b45309;
  background: #fef3c7;
}

.index-notice-error {
  background: #fef2f2;
  border-color: #fecaca;
}

.index-notice-error .index-notice-icon {
  color: #dc2626;
  background: #fee2e2;
}

@media (max-width: 640px) {
  .index-notice {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .index-notice :deep(.v-button) {
    grid-column: 2;
    justify-self: flex-start;
  }
}

.task-panel {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #475569;
  font-size: 13px;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  background: #e2e8f0;
  border-radius: 999px;
}

.progress-track span {
  display: block;
  height: 100%;
  background: #0f766e;
  border-radius: inherit;
  transition: width 0.2s ease;
}

.search-panel {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.search-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.search-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.search-panel-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
}

.search-panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #94a3b8;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.search-panel-close:hover {
  color: #475569;
  background: #e2e8f0;
}

.search-panel-close svg {
  width: 18px;
  height: 18px;
}

.search-panel-body,
.ask-panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px 3px 3px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  transition: all 0.15s;
}

.search-input-wrapper:focus-within {
  background: #fff;
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.12);
}

.search-input-icon {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: 6px 0;
  color: #1e293b;
  font-size: 13px;
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-results {
  max-height: 260px;
  min-height: 100px;
  padding: 0;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 7px;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  gap: 6px;
  color: #94a3b8;
  font-size: 13px;
}

.search-empty-icon {
  width: 28px;
  height: 28px;
  opacity: 0.4;
}

.search-results-list {
  display: flex;
  flex-direction: column;
}

.search-result-item {
  display: flex;
  gap: 10px;
  padding: 11px 12px;
  background: #fff;
  border-bottom: 1px solid #edf0f5;
  transition: all 0.15s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #fafafa;
}

.search-result-index {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  background: #f1f5f9;
  border-radius: 999px;
}

.search-result-content {
  flex: 1;
  min-width: 0;
}

.search-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.search-result-title {
  flex: 1;
  overflow: hidden;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-score {
  flex: 0 0 auto;
  padding: 2px 8px;
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
  background: #ecfdf5;
  border-radius: 4px;
}

.search-result-desc {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.search-result-category {
  margin-top: 4px;
}

.ask-input {
  min-height: 92px;
  padding: 12px;
  color: #1e293b;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  outline: none;
}

.ask-input:focus {
  background: #fff;
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.12);
}

.answer-box {
  padding: 12px;
  color: #334155;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  background: #f8fafc;
  border: 1px solid #edf0f5;
  border-radius: 7px;
}

.ask-error {
  padding: 10px 12px;
  color: #dc2626;
  font-size: 13px;
  background: #fef2f2;
  border-radius: 8px;
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 12px;
}

.source-item svg {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.source-item a {
  color: #2563eb;
  text-decoration: none;
}

.entries-section {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.entries-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.entries-title {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.entries-count {
  padding: 2px 10px;
  color: #64748b;
  font-size: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.entries-content {
  padding: 0;
}

.entries-empty {
  padding: 32px 20px;
}

.entries-list {
  display: flex;
  flex-direction: column;
}

.entry-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}

.entry-item:last-child {
  border-bottom: none;
}

.entry-item:hover {
  background: #f8fafc;
}

.entry-item.entry-deleting {
  pointer-events: none;
  background: #fef2f2;
  opacity: 0.5;
}

.entry-main {
  flex: 1;
  min-width: 0;
}

.entry-title {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  margin-bottom: 4px;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deleting-badge {
  flex: 0 0 auto;
  padding: 2px 8px;
  color: #ef4444;
  font-size: 11px;
  font-weight: 500;
  background: #fee2e2;
  border-radius: 4px;
}

.entry-desc {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.entry-keyword {
  padding: 1px 6px;
  color: #64748b;
  font-size: 11px;
  background: #f1f5f9;
  border-radius: 3px;
}

.entry-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
}

.entry-switch {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding-right: 4px;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.entry-action-btn {
  padding: 5px 12px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s;
}

.entry-action-btn:hover {
  color: #1e293b;
  background: #f8fafc;
}

.entry-action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.entry-action-btn-danger:hover {
  color: #dc2626;
  border-color: #fecaca;
  background: #fff7f7;
}

.entries-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  color: #1f2937;
  font-size: 13px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.12);
}

.form-input:disabled {
  color: #94a3b8;
  background: #f8fafc;
}

.form-textarea {
  min-height: 88px;
  resize: vertical;
}

.form-textarea-large {
  min-height: 180px;
}

.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 13px;
}

.import-container,
.posts-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.posts-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.posts-icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #475569;
  background: #f1f5f9;
  border-radius: 8px;
}

.posts-icon svg {
  width: 22px;
  height: 22px;
}

.posts-title h4 {
  margin: 0;
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
}

.posts-title p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
}

.import-search {
  margin-top: 2px;
}

.post-list {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.post-row {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
}

label.post-row {
  cursor: pointer;
}

.post-row:last-child {
  border-bottom: none;
}

.post-row-head {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  background: #f8fafc;
}

.post-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.post-title {
  overflow: hidden;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-success {
  color: #059669;
}

.tag-muted {
  color: #64748b;
}

@media (max-width: 1080px) {
  .kb-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .kb-row-meta,
  .kb-actions {
    grid-column: 2;
    justify-content: flex-start;
  }

  .kb-overview {
    grid-template-columns: 1fr;
  }

  .kb-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .knowledge-list-container,
  .kb-detail-container {
    padding: 12px;
  }

  .kb-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .index-notice,
  .entry-item {
    grid-template-columns: 1fr;
  }

  .index-notice :deep(.v-button) {
    grid-column: auto;
    justify-self: flex-start;
  }

  .entry-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 520px) {
  .kb-row,
  .create-kb-row {
    grid-template-columns: 1fr;
  }

  .kb-row-meta,
  .kb-actions {
    grid-column: auto;
  }

  .kb-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
