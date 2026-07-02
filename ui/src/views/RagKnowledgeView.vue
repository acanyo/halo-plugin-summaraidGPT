<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  Dialog,
  IconRefreshLine,
  Toast,
  VButton,
  VCard,
  VDropdownItem,
  VEmpty,
  VEntity,
  VEntityContainer,
  VEntityField,
  VLoading,
  VModal,
  VPageHeader,
  VPagination,
  VSpace,
  VStatusDot,
  VSwitch,
  VTag,
} from '@halo-dev/components'
import { utils } from '@halo-dev/ui-shared'
import RiAddLine from '~icons/ri/add-line'
import RiAlertLine from '~icons/ri/alert-line'
import RiArrowLeftLine from '~icons/ri/arrow-left-line'
import RiArrowRightSLine from '~icons/ri/arrow-right-s-line'
import RiArticleLine from '~icons/ri/article-line'
import RiBookOpenLine from '~icons/ri/book-open-line'
import RiCloseLine from '~icons/ri/close-line'
import RiFileTextLine from '~icons/ri/file-text-line'
import RiQuestionAnswerLine from '~icons/ri/question-answer-line'
import RiSearchLine from '~icons/ri/search-line'
import RiUploadLine from '~icons/ri/upload-line'
import RagTextImportFormPanel from '@/components/rag/RagTextImportFormPanel.vue'
import { createRagTextImportForm, type RagTextImportFile } from '@/components/rag/text-import'
import {
  ragApi,
  type RagDocument,
  type RagImportableDocsmeDocument,
  type RagImportablePost,
  type RagIndexTask,
  type RagKnowledgeBase,
  type RagSearchResult,
  type RagSourceReference,
  type RagStats,
} from '@/api/rag'
import { hasUiPermission } from '@/utils/permissions'

type ImportSourceType = 'POST' | 'DOCSME' | 'TEXT'

const loadingKnowledgeBases = ref(false)
const loadingDocuments = ref(false)
const loadingStats = ref(false)
const loadingImportablePosts = ref(false)
const loadingImportableDocsmeDocuments = ref(false)
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
const importableDocsmeDocuments = ref<RagImportableDocsmeDocument[]>([])
const docsmeImportAvailable = ref(true)
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

const documentSourceTypeOptions = [
  { label: '手动', value: 'MANUAL' },
  { label: '文章', value: 'POST' },
  { label: '文档', value: 'DOCSME' },
  { label: '页面', value: 'PAGE' },
  { label: '附件', value: 'ATTACHMENT' },
]

const showImportPostsModal = ref(false)
const importSourceType = ref<ImportSourceType>('POST')
const importKeyword = ref('')
const selectedPostNames = ref<string[]>([])
const selectedDocsmeDocumentNames = ref<string[]>([])
const rebuildAfterImport = ref(false)
const importablePostPage = ref(1)
const importableDocsmeDocumentPage = ref(1)
const importablePageSize = ref(10)
const textImportForm = ref(createRagTextImportForm())

const showSearchPanel = ref(false)
const searchQuery = ref('')
const searchLimit = ref(10)
const searchResults = ref<RagSearchResult[]>([])
const searchElapsedMs = ref<number>()

const showAskPanel = ref(false)
const askQuestion = ref('')
const answer = ref('')
const answerSources = ref<RagSourceReference[]>([])
const askStreamError = ref('')

const documentPage = ref(1)
const documentPageSize = ref(10)
const localNeedsRebuild = ref(false)
const RAG_MANAGE_PERMISSION = 'plugin:summaraidGPT:rag:manage'
const RAG_DELETING_REFETCH_INTERVAL = 1000

let taskEventSource: EventSource | undefined
let subscribedTaskName = ''
let askAbortController: AbortController | undefined
let deletingKnowledgeBaseRefetchTimer: number | undefined
let deletingDocumentRefetchTimer: number | undefined

const activeKnowledgeBase = computed(() =>
  knowledgeBases.value.find((item) => item.metadata.name === activeKnowledgeBaseName.value),
)

const canManageRag = computed(() => hasUiPermission(RAG_MANAGE_PERMISSION))

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

function pagedItems<T>(items: T[], page: number, size: number) {
  const start = (page - 1) * size
  return items.slice(start, start + size)
}

const importableMaxPage = (total: number) =>
  Math.max(1, Math.ceil(total / Math.max(1, importablePageSize.value)))

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

const importableFilteredDocsmeDocuments = computed(() => {
  const keyword = importKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return importableDocsmeDocuments.value
  }
  return importableDocsmeDocuments.value.filter((document) => {
    return (
      document.docName.toLowerCase().includes(keyword) ||
      (document.docTreeName || '').toLowerCase().includes(keyword) ||
      (document.title || '').toLowerCase().includes(keyword) ||
      (document.projectDisplayName || '').toLowerCase().includes(keyword) ||
      (document.projectName || '').toLowerCase().includes(keyword) ||
      (document.versionSlug || '').toLowerCase().includes(keyword)
    )
  })
})

const selectedImportableSet = computed(() => new Set(selectedPostNames.value))
const selectedDocsmeDocumentSet = computed(() => new Set(selectedDocsmeDocumentNames.value))

const importablePostMaxPage = computed(() =>
  importableMaxPage(importableFilteredPosts.value.length),
)

const importableDocsmeDocumentMaxPage = computed(() =>
  importableMaxPage(importableFilteredDocsmeDocuments.value.length),
)

const pagedImportablePosts = computed(() =>
  pagedItems(importableFilteredPosts.value, importablePostPage.value, importablePageSize.value),
)

const pagedImportableDocsmeDocuments = computed(() =>
  pagedItems(
    importableFilteredDocsmeDocuments.value,
    importableDocsmeDocumentPage.value,
    importablePageSize.value,
  ),
)

const allVisiblePostsSelected = computed(
  () =>
    pagedImportablePosts.value.length > 0 &&
    pagedImportablePosts.value.every((post) => selectedImportableSet.value.has(post.postName)),
)

const allVisibleDocsmeDocumentsSelected = computed(
  () =>
    pagedImportableDocsmeDocuments.value.length > 0 &&
    pagedImportableDocsmeDocuments.value.every((document) =>
      selectedDocsmeDocumentSet.value.has(document.docName),
    ),
)

const selectedImportCount = computed(() => {
  if (importSourceType.value === 'POST') return selectedPostNames.value.length
  if (importSourceType.value === 'DOCSME') return selectedDocsmeDocumentNames.value.length
  return 0
})

const loadingActiveImportables = computed(() =>
  importSourceType.value === 'POST'
    ? loadingImportablePosts.value
    : importSourceType.value === 'DOCSME'
      ? loadingImportableDocsmeDocuments.value
      : false,
)

const activeImportAllButtonText = computed(() => {
  if (importSourceType.value === 'POST') return '导入全部文章'
  if (importSourceType.value === 'DOCSME') return '导入全部文档'
  return '导入文件'
})

const activeImportUnavailable = computed(
  () => importSourceType.value === 'DOCSME' && !docsmeImportAvailable.value,
)

const importSourceTitle = computed(() => {
  if (importSourceType.value === 'POST') return '导入 Halo 文章'
  if (importSourceType.value === 'DOCSME') return '导入 Docsme 文档'
  return '导入 Markdown / 富文本文件'
})

const importSourceDescription = computed(() => {
  if (importSourceType.value === 'POST') return '将已发布的博客文章同步到当前知识库'
  if (importSourceType.value === 'DOCSME') return '将 Docsme 已发布文档同步到当前知识库'
  return '上传文件并保存为当前知识库条目'
})

const importableTextFiles = computed(() =>
  textImportForm.value.files.filter((file) => plainTextFromImportFile(file).length > 0),
)

const activeImportPrimaryDisabled = computed(
  () =>
    activeImportUnavailable.value ||
    (importSourceType.value === 'TEXT' && importableTextFiles.value.length === 0),
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

const deletingResourceRefetchInterval = <T extends { metadata: { deletionTimestamp?: string } }>(
  data?: T[],
) => {
  const hasDeletingResource = data?.some((item) => item.metadata.deletionTimestamp)
  return hasDeletingResource ? RAG_DELETING_REFETCH_INTERVAL : false
}

const clearDeletingKnowledgeBaseRefetch = () => {
  if (!deletingKnowledgeBaseRefetchTimer) {
    return
  }
  window.clearInterval(deletingKnowledgeBaseRefetchTimer)
  deletingKnowledgeBaseRefetchTimer = undefined
}

const clearDeletingDocumentRefetch = () => {
  if (!deletingDocumentRefetchTimer) {
    return
  }
  window.clearInterval(deletingDocumentRefetchTimer)
  deletingDocumentRefetchTimer = undefined
}

const syncDeletingKnowledgeBaseRefetch = (data = knowledgeBases.value) => {
  const interval = deletingResourceRefetchInterval(data)
  if (!interval) {
    clearDeletingKnowledgeBaseRefetch()
    return
  }
  if (deletingKnowledgeBaseRefetchTimer) {
    return
  }
  deletingKnowledgeBaseRefetchTimer = window.setInterval(() => {
    fetchKnowledgeBases({ silent: true })
  }, interval)
}

const syncDeletingDocumentRefetch = (data = documents.value) => {
  const interval = deletingResourceRefetchInterval(data)
  if (!interval) {
    clearDeletingDocumentRefetch()
    return
  }
  if (deletingDocumentRefetchTimer) {
    return
  }
  deletingDocumentRefetchTimer = window.setInterval(() => {
    fetchDocuments(false, { silent: true })
  }, interval)
}

const fetchKnowledgeBases = async (options: { silent?: boolean } = {}) => {
  if (!options.silent) {
    loadingKnowledgeBases.value = true
  }
  try {
    knowledgeBases.value = await ragApi.listKnowledgeBases()
    syncDeletingKnowledgeBaseRefetch()
    if (
      !activeKnowledgeBaseName.value ||
      !knowledgeBases.value.some((item) => item.metadata.name === activeKnowledgeBaseName.value)
    ) {
      activeKnowledgeBaseName.value = knowledgeBases.value[0]?.metadata.name || ''
    }
  } catch (error) {
    if (!options.silent) {
      Toast.error('加载失败')
    }
  } finally {
    if (!options.silent) {
      loadingKnowledgeBases.value = false
    }
  }
}

const fetchDocuments = async (resetPage = true, options: { silent?: boolean } = {}) => {
  if (!activeKnowledgeBaseName.value) {
    documents.value = []
    clearDeletingDocumentRefetch()
    return
  }
  if (!options.silent) {
    loadingDocuments.value = true
  }
  try {
    documents.value = await ragApi.listDocuments({ knowledgeBase: activeKnowledgeBaseName.value })
    syncDeletingDocumentRefetch()
    const maxPage = Math.max(1, Math.ceil(documents.value.length / documentPageSize.value))
    documentPage.value = resetPage ? 1 : Math.min(documentPage.value, maxPage)
  } catch (error) {
    if (!options.silent) {
      Toast.error('文档加载失败')
    }
  } finally {
    if (!options.silent) {
      loadingDocuments.value = false
    }
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

const editKnowledgeBaseFromRow = (event: Event, knowledgeBase: RagKnowledgeBase) => {
  event.stopPropagation()
  openKnowledgeBaseModal(knowledgeBase)
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
      sourceTypes: ['POST', 'MANUAL', 'DOCSME'],
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
    await Promise.all([fetchDocuments(!editingDocument.value), fetchStats()])
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
        await Promise.all([fetchDocuments(false), fetchStats()])
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
    await Promise.all([fetchDocuments(false), fetchStats()])
  } catch (error) {
    Toast.error('状态更新失败')
  } finally {
    mutatingDocument.value = false
  }
}

const openImportPostsModal = async () => {
  showImportPostsModal.value = true
  importSourceType.value = 'POST'
  selectedPostNames.value = []
  selectedDocsmeDocumentNames.value = []
  importKeyword.value = ''
  importablePostPage.value = 1
  importableDocsmeDocumentPage.value = 1
  textImportForm.value = createRagTextImportForm()
  await fetchImportablePosts()
}

const switchImportSourceType = async (sourceType: ImportSourceType) => {
  importSourceType.value = sourceType
  if (sourceType === 'POST') {
    importablePostPage.value = 1
  } else if (sourceType === 'DOCSME') {
    importableDocsmeDocumentPage.value = 1
  }
  if (sourceType === 'POST' && importablePosts.value.length === 0) {
    await fetchImportablePosts()
  }
  if (sourceType === 'DOCSME' && importableDocsmeDocuments.value.length === 0) {
    await fetchImportableDocsmeDocuments()
  }
}

const fetchActiveImportables = async () => {
  if (importSourceType.value === 'POST') {
    await fetchImportablePosts()
    return
  }
  if (importSourceType.value === 'DOCSME') {
    await fetchImportableDocsmeDocuments()
  }
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

const fetchImportableDocsmeDocuments = async () => {
  if (!activeKnowledgeBaseName.value) {
    return
  }
  loadingImportableDocsmeDocuments.value = true
  try {
    const result = await ragApi.listImportableDocsmeDocuments({
      knowledgeBase: activeKnowledgeBaseName.value,
    })
    importableDocsmeDocuments.value = result.items
    docsmeImportAvailable.value = result.docsmeAvailable
  } catch (error) {
    Toast.error('可导入文档加载失败')
  } finally {
    loadingImportableDocsmeDocuments.value = false
  }
}

const togglePostSelection = (name: string, checked: boolean) => {
  selectedPostNames.value = checked
    ? Array.from(new Set([...selectedPostNames.value, name]))
    : selectedPostNames.value.filter((item) => item !== name)
}

const checkboxChecked = (event: Event) => (event.target as HTMLInputElement).checked

const toggleAllVisiblePosts = (checked: boolean) => {
  const currentPageNames = pagedImportablePosts.value.map((post) => post.postName)
  if (checked) {
    selectedPostNames.value = Array.from(new Set([...selectedPostNames.value, ...currentPageNames]))
    return
  }
  const currentPageNameSet = new Set(currentPageNames)
  selectedPostNames.value = selectedPostNames.value.filter((item) => !currentPageNameSet.has(item))
}

const toggleDocsmeDocumentSelection = (name: string, checked: boolean) => {
  selectedDocsmeDocumentNames.value = checked
    ? Array.from(new Set([...selectedDocsmeDocumentNames.value, name]))
    : selectedDocsmeDocumentNames.value.filter((item) => item !== name)
}

const toggleAllVisibleDocsmeDocuments = (checked: boolean) => {
  const currentPageNames = pagedImportableDocsmeDocuments.value.map((document) => document.docName)
  if (checked) {
    selectedDocsmeDocumentNames.value = Array.from(
      new Set([...selectedDocsmeDocumentNames.value, ...currentPageNames]),
    )
    return
  }
  const currentPageNameSet = new Set(currentPageNames)
  selectedDocsmeDocumentNames.value = selectedDocsmeDocumentNames.value.filter(
    (item) => !currentPageNameSet.has(item),
  )
}

const importAllActive = () => {
  if (importSourceType.value === 'POST') {
    importPosts('all')
    return
  }
  if (importSourceType.value === 'DOCSME') {
    importDocsmeDocuments('all')
    return
  }
  importTextDocument()
}

const importSelectedActive = () => {
  if (importSourceType.value === 'POST') {
    importPosts('selected')
    return
  }
  if (importSourceType.value === 'DOCSME') {
    importDocsmeDocuments('selected')
  }
}

const importPosts = (mode: 'all' | 'selected') => {
  const postNames = mode === 'selected' ? selectedPostNames.value : []
  if (mode === 'selected' && postNames.length === 0) {
    Toast.warning('请先选择要导入的文章')
    return
  }

  Dialog.warning({
    title: '导入公开文章',
    confirmText: mode === 'selected' ? '导入所选' : '导入全部',
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

const importDocsmeDocuments = (mode: 'all' | 'selected') => {
  if (!docsmeImportAvailable.value) {
    Toast.warning('未检测到 Docsme 文档插件')
    return
  }
  const docNames = mode === 'selected' ? selectedDocsmeDocumentNames.value : []
  if (mode === 'selected' && docNames.length === 0) {
    Toast.warning('请先选择要导入的文档')
    return
  }

  Dialog.warning({
    title: '导入 Docsme 文档',
    confirmText: mode === 'selected' ? '导入所选' : '导入全部',
    description:
      mode === 'selected'
        ? `将导入所选 ${docNames.length} 篇已发布文档。${rebuildAfterImport.value ? '导入后会立即重建索引。' : ''}`
        : `将导入全部已发布的 Docsme 文档。${rebuildAfterImport.value ? '导入后会立即重建索引。' : ''}`,
    onConfirm: async () => {
      importing.value = true
      try {
        const result = await ragApi.importDocsmeDocuments(activeKnowledgeBaseName.value, docNames, {
          rebuildAfterImport: rebuildAfterImport.value,
        })
        Toast.success(
          result.task
            ? `已导入 ${result.imported} 篇文档，索引任务已启动`
            : `已导入 ${result.imported} 篇文档，请重建索引`,
        )
        showImportPostsModal.value = false
        selectedDocsmeDocumentNames.value = []
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

const importTextDocument = async () => {
  const files = importableTextFiles.value
  if (files.length === 0) {
    Toast.warning('请先上传可导入的文件')
    return
  }

  importing.value = true
  try {
    await Promise.all(
      files.map((file) => {
        const title = file.title.trim() || textImportTitleFromFileName(file.fileName)
        const sourceName = file.sourceName.trim() || title || generatedTextImportSourceName()
        return ragApi.saveDocument({
          name: textImportDocumentName(sourceName),
          knowledgeBase: activeKnowledgeBaseName.value,
          sourceType: 'MANUAL',
          sourceName,
          title,
          content: textImportFileContent(file).trim(),
          enabled: true,
          tags: [],
          categories: [],
        })
      }),
    )

    if (rebuildAfterImport.value) {
      const result = await ragApi.rebuild(activeKnowledgeBaseName.value)
      latestTask.value = result.task
      subscribeIndexTask(result.task)
      Toast.success(`已导入 ${files.length} 个文件，索引任务已启动`)
    } else {
      markNeedsRebuild()
      Toast.success(`已导入 ${files.length} 个文件，请重建索引`)
    }

    showImportPostsModal.value = false
    textImportForm.value = createRagTextImportForm()
    await refreshAll()
  } catch (error) {
    Toast.error('文件导入失败')
  } finally {
    importing.value = false
  }
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
    searchElapsedMs.value = undefined
    return
  }
  searching.value = true
  searchElapsedMs.value = undefined
  const startedAt = performance.now()
  try {
    searchResults.value = await ragApi.search({
      knowledgeBase: activeKnowledgeBaseName.value,
      query: searchQuery.value.trim(),
      limit: Number(searchLimit.value) || 10,
    })
    searchElapsedMs.value = Math.round(performance.now() - startedAt)
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
  if (sourceType === 'DOCSME') return '文档'
  if (sourceType === 'PAGE') return '页面'
  if (sourceType === 'MANUAL') return '手动'
  if (sourceType === 'ATTACHMENT') return '附件'
  return sourceType || '未知'
}

const searchScoreBreakdown = (item: RagSearchResult) =>
  [
    { label: '综合', value: item.score },
    { label: '向量', value: item.vectorScore },
    { label: '关键词', value: item.keywordScore },
    { label: '重排', value: item.rerankScore },
  ].filter((score) => typeof score.value === 'number' && Number.isFinite(score.value))

const formatScore = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-'
  }
  const absolute = Math.abs(value)
  if (absolute >= 100) {
    return value.toFixed(0)
  }
  if (absolute >= 10) {
    return value.toFixed(2)
  }
  return value.toFixed(4)
}

const searchResultTitle = (item: RagSearchResult) =>
  item.title || item.documentName || item.sourceName || item.id

const searchResultMetaLine = (item: RagSearchResult) =>
  [
    sourceTypeText(item.sourceType),
    item.sourceName,
    item.documentName,
    typeof item.chunkIndex === 'number' ? `分块 #${item.chunkIndex}` : undefined,
  ]
    .filter((value) => value && !isImportedTechnicalLabel(item.sourceType, value))
    .join(' · ')

const searchMetadataEntries = (item: RagSearchResult) =>
  Object.entries(item.metadata || {})
    .filter(([, value]) => value !== undefined && value !== null && `${value}`.trim() !== '')
    .slice(0, 8)
    .map(([key, value]) => ({
      key,
      value: metadataValueText(value),
    }))

const metadataValueText = (value: unknown) => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const visibleDocumentCategories = (document: RagDocument) => {
  const sourceType = document.spec?.sourceType
  return (document.spec?.categories || [])
    .map((category) => category.trim())
    .filter(Boolean)
    .filter((category, index, categories) => categories.indexOf(category) === index)
    .filter((category) => !isImportedTechnicalLabel(sourceType, category))
    .slice(0, 2)
}

const isImportedTechnicalLabel = (sourceType: string | undefined, value: string) => {
  if (sourceType === 'MANUAL') {
    return false
  }
  return isUuidLike(value) || isDocsmeProjectId(sourceType, value)
}

const isUuidLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )

const isDocsmeProjectId = (sourceType: string | undefined, value: string) =>
  sourceType === 'DOCSME' && /^project-[a-z0-9-]+$/i.test(value)

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

const textImportFileContent = (file: RagTextImportFile) =>
  file.mode === 'RICH_TEXT' ? file.richText : file.markdown

const plainTextFromImportFile = (file: RagTextImportFile) => {
  const content = textImportFileContent(file)
  if (!content.trim()) {
    return ''
  }
  if (file.mode !== 'RICH_TEXT') {
    return content.trim()
  }
  if (typeof DOMParser === 'undefined') {
    return content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  const parsed = new DOMParser().parseFromString(content, 'text/html')
  return (parsed.body.textContent || '').replace(/\s+/g, ' ').trim()
}

const generatedTextImportSourceName = () =>
  `text-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const textImportTitleFromFileName = (fileName: string) =>
  fileName.replace(/\.(md|markdown|txt|html?)$/i, '').trim()

const textImportDocumentName = (sourceName: string) => {
  const segment =
    sourceName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || generatedTextImportSourceName()
  return `ragdoc-text-${segment}`.slice(0, 63).replace(/-+$/g, '')
}

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
  return utils.date.timeAgo(value)
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return utils.date.format(value)
}

watch(activeKnowledgeBaseName, () => {
  closeTaskSubscription()
  stopAsk()
  searchResults.value = []
  searchElapsedMs.value = undefined
  answer.value = ''
  answerSources.value = []
  askStreamError.value = ''
  latestTask.value = undefined
  localNeedsRebuild.value = false
})

watch(importKeyword, () => {
  importablePostPage.value = 1
  importableDocsmeDocumentPage.value = 1
})

watch(importablePageSize, () => {
  importablePostPage.value = 1
  importableDocsmeDocumentPage.value = 1
})

watch(
  () => importableFilteredPosts.value.length,
  () => {
    importablePostPage.value = Math.min(importablePostPage.value, importablePostMaxPage.value)
  },
)

watch(
  () => importableFilteredDocsmeDocuments.value.length,
  () => {
    importableDocsmeDocumentPage.value = Math.min(
      importableDocsmeDocumentPage.value,
      importableDocsmeDocumentMaxPage.value,
    )
  },
)

onMounted(async () => {
  await fetchKnowledgeBases()
  if (activeKnowledgeBaseName.value) {
    await fetchDetailData()
  }
})

onBeforeUnmount(() => {
  closeTaskSubscription()
  stopAsk()
  clearDeletingKnowledgeBaseRefetch()
  clearDeletingDocumentRefetch()
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
          <VButton
            v-if="canManageRag"
            v-permission="[RAG_MANAGE_PERMISSION]"
            type="secondary"
            @click="openKnowledgeBaseModal()"
          >
            <template #icon>
              <RiAddLine class="h-full w-full" />
            </template>
            新建知识库
          </VButton>
        </VSpace>
      </template>
    </VPageHeader>

    <div class=":uno: m-0 md:m-4">
      <VCard :body-class="[':uno: !p-0']">
        <template #header>
          <div class=":uno: flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3">
            <div class=":uno: flex min-w-0 flex-wrap items-center gap-2 text-xs text-gray-500">
              <strong class=":uno: text-lg leading-none text-gray-900">{{
                knowledgeBases.length
              }}</strong>
              <span>个知识库</span>
              <span>全库问答会默认混合检索已就绪内容</span>
            </div>
          </div>
        </template>

        <VLoading v-if="loadingKnowledgeBases" />
        <VEmpty
          v-else-if="knowledgeBases.length === 0"
          :title="canManageRag ? '暂无知识库' : '暂无可查看知识库'"
          :message="
            canManageRag
              ? '创建知识库来存储和管理 RAG 检索内容'
              : '当前账号没有可查看的知识库，或还没有创建任何知识库'
          "
        >
          <template #actions>
            <VButton
              v-if="canManageRag"
              v-permission="[RAG_MANAGE_PERMISSION]"
              type="secondary"
              @click="openKnowledgeBaseModal()"
            >
              <template #icon>
                <RiAddLine class="h-full w-full" />
              </template>
              新建知识库
            </VButton>
          </template>
        </VEmpty>

        <VEntityContainer v-else class="kb-list :uno: overflow-hidden">
          <VEntity
            v-for="knowledgeBase in knowledgeBases"
            :key="knowledgeBase.metadata.name"
            class=":uno: cursor-pointer"
            :class="{
              ':uno: pointer-events-none opacity-[0.56]':
                !!knowledgeBase.metadata.deletionTimestamp,
            }"
            @click="
              !knowledgeBase.metadata.deletionTimestamp && openKnowledgeBaseDetail(knowledgeBase)
            "
          >
            <template #start>
              <div
                class=":uno: grid h-[38px] w-[38px] place-items-center rounded-lg border border-gray-200 bg-slate-50 text-sm font-bold text-gray-900"
              >
                {{ firstCharacter(knowledgeBase) }}
              </div>
              <VEntityField
                :title="displayName(knowledgeBase)"
                :description="knowledgeBase.spec?.description || knowledgeBase.metadata.name"
                width="24rem"
              >
                <template #extra>
                  <VStatusDot
                    v-if="knowledgeBase.metadata.deletionTimestamp"
                    v-tooltip="'删除中'"
                    state="warning"
                    text="删除中"
                  />
                  <VStatusDot v-else v-bind="statusInfo(knowledgeBase.status?.indexState)" />
                </template>
              </VEntityField>
            </template>

            <template #end>
              <VEntityField width="7rem">
                <template #description>
                  <span
                    class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                  >
                    文档 {{ knowledgeBase.status?.documentCount || 0 }}
                  </span>
                </template>
              </VEntityField>
              <VEntityField width="11rem">
                <template #description>
                  <span
                    class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-400 tabular-nums"
                  >
                    {{ formatRelativeDate(knowledgeBase.status?.lastIndexedAt) }}
                  </span>
                </template>
              </VEntityField>
              <VEntityField>
                <template #description>
                  <RiArrowRightSLine
                    class=":uno: h-5 w-5 text-slate-400 transition-all duration-200"
                  />
                </template>
              </VEntityField>
            </template>

            <template
              v-if="canManageRag && !knowledgeBase.metadata.deletionTimestamp"
              #dropdownItems
            >
              <VDropdownItem
                v-permission="[RAG_MANAGE_PERMISSION]"
                @click="editKnowledgeBaseFromRow($event, knowledgeBase)"
              >
                编辑
              </VDropdownItem>
              <VDropdownItem
                v-permission="[RAG_MANAGE_PERMISSION]"
                type="danger"
                @click="deleteKnowledgeBase($event, knowledgeBase)"
              >
                删除
              </VDropdownItem>
            </template>
          </VEntity>
        </VEntityContainer>
      </VCard>
    </div>
  </template>

  <template v-else>
    <div
      class=":uno: flex items-center justify-between gap-4 border-b border-[#edf0f5] bg-white px-5 py-3 max-[720px]:flex-col max-[720px]:items-start max-[720px]:px-3"
    >
      <div class=":uno: flex min-w-0 items-center gap-3">
        <VButton size="sm" type="secondary" @click="backToKnowledgeBases">
          <template #icon>
            <RiArrowLeftLine class="h-full w-full" />
          </template>
          返回
        </VButton>
        <div class=":uno: grid min-w-0 gap-0.5">
          <h1
            class=":uno: m-0 overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold leading-snug text-gray-900"
          >
            {{ displayName(activeKnowledgeBase) }}
          </h1>
          <span class=":uno: text-xs leading-snug text-slate-500">知识库详情</span>
        </div>
      </div>

      <VSpace class=":uno: flex-wrap justify-end max-[720px]:justify-start">
        <VButton size="sm" @click="showSearchPanel = !showSearchPanel">
          <template #icon>
            <RiSearchLine class="h-full w-full" />
          </template>
          命中调试
        </VButton>
        <VButton size="sm" @click="showAskPanel = !showAskPanel">
          <template #icon>
            <RiQuestionAnswerLine class="h-full w-full" />
          </template>
          RAG 问答
        </VButton>
        <VButton
          v-if="canManageRag"
          v-permission="[RAG_MANAGE_PERMISSION]"
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
        <VButton
          v-if="canManageRag"
          v-permission="[RAG_MANAGE_PERMISSION]"
          size="sm"
          @click="openImportPostsModal"
        >
          <template #icon>
            <RiUploadLine class="h-full w-full" />
          </template>
          导入
        </VButton>
        <VButton
          v-if="canManageRag"
          v-permission="[RAG_MANAGE_PERMISSION]"
          type="secondary"
          @click="openDocumentModal()"
        >
          <template #icon>
            <RiAddLine class="h-full w-full" />
          </template>
          新建条目
        </VButton>
      </VSpace>
    </div>

    <div class=":uno: flex flex-col gap-4 p-4 max-[720px]:p-3">
      <VLoading v-if="loadingDocuments || loadingStats" />

      <template v-else-if="activeKnowledgeBase">
        <div
          class=":uno: grid grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] overflow-hidden rounded-lg border border-[#edf0f5] bg-white max-[1080px]:grid-cols-1"
        >
          <div class=":uno: flex min-w-0 items-start gap-3 p-4">
            <VStatusDot v-bind="statusInfo(activeKnowledgeBase.status?.indexState)" />
            <p class=":uno: m-0 line-clamp-3 min-w-0 text-[13px] leading-relaxed text-slate-600">
              {{ activeKnowledgeBase.spec?.description || '这个知识库还没有描述。' }}
            </p>
          </div>
          <dl
            class=":uno: m-0 grid grid-cols-[repeat(5,minmax(0,1fr))] border-l border-[#edf0f5] max-[1080px]:border-l-0 max-[1080px]:border-t max-[720px]:grid-cols-2 max-[520px]:grid-cols-1"
          >
            <div class=":uno: min-w-0 border-r border-[#edf0f5] px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">已索引文档</dt>
              <dd class=":uno: m-0 mt-1 text-base font-bold text-gray-900">
                {{ activeKnowledgeBase.status?.documentCount || enabledDocumentCount }}
              </dd>
            </div>
            <div class=":uno: min-w-0 border-r border-[#edf0f5] px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">启用条目</dt>
              <dd class=":uno: m-0 mt-1 text-base font-bold text-gray-900">
                {{ enabledDocumentCount }}
              </dd>
            </div>
            <div class=":uno: min-w-0 border-r border-[#edf0f5] px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">分块</dt>
              <dd class=":uno: m-0 mt-1 text-base font-bold text-gray-900">{{ chunkCount }}</dd>
            </div>
            <div class=":uno: min-w-0 border-r border-[#edf0f5] px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">分类</dt>
              <dd class=":uno: m-0 mt-1 text-base font-bold text-gray-900">
                {{ categories.length }}
              </dd>
            </div>
            <div class=":uno: min-w-0 px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">最后索引</dt>
              <dd class=":uno: m-0 mt-1 text-base font-bold text-gray-900">
                {{ formatRelativeDate(activeKnowledgeBase.status?.lastIndexedAt) }}
              </dd>
            </div>
          </dl>
        </div>

        <div
          v-if="showIndexErrorNotice"
          class=":uno: flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 max-[640px]:flex-col max-[640px]:items-start"
        >
          <span
            class=":uno: grid h-9 w-9 flex-none place-items-center rounded-full bg-red-100 text-red-600"
          >
            <RiAlertLine />
          </span>
          <div class=":uno: grid min-w-0 flex-1 gap-1">
            <strong class=":uno: text-[13px] font-bold text-red-900">
              {{ latestTaskFailed ? '上次索引重建失败' : '知识库索引异常' }}
            </strong>
            <p class=":uno: m-0 text-xs leading-relaxed text-red-800">{{ indexErrorMessage }}</p>
          </div>
          <VButton
            v-if="canManageRag"
            v-permission="[RAG_MANAGE_PERMISSION]"
            size="sm"
            :disabled="!canRebuildIndex"
            :loading="rebuildingIndex"
            @click="rebuildIndex"
          >
            重新重建
          </VButton>
        </div>

        <div
          v-if="showNeedsRebuildNotice"
          class=":uno: flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 max-[640px]:flex-col max-[640px]:items-start"
        >
          <span
            class=":uno: grid h-9 w-9 flex-none place-items-center rounded-full bg-amber-100 text-amber-600"
          >
            <RiAlertLine />
          </span>
          <div class=":uno: grid min-w-0 flex-1 gap-1">
            <strong class=":uno: text-[13px] font-bold text-amber-900">
              {{ rebuildNoticeTitle }}
            </strong>
            <p class=":uno: m-0 text-xs leading-relaxed text-amber-800">
              {{ rebuildNoticeDescription }}
            </p>
          </div>
          <VButton
            v-if="canManageRag"
            v-permission="[RAG_MANAGE_PERMISSION]"
            size="sm"
            :disabled="!canRebuildIndex"
            :loading="rebuildingIndex"
            @click="rebuildIndex"
          >
            立即重建
          </VButton>
        </div>

        <div
          v-if="latestTaskRunning && latestTask"
          class=":uno: grid gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3"
        >
          <div class=":uno: flex items-center justify-between gap-3 text-xs text-blue-700">
            <span>{{ latestTask.status?.message || '索引任务执行中' }}</span>
            <strong>{{ latestTask.status?.progress ?? 0 }}%</strong>
          </div>
          <div class=":uno: h-1.5 overflow-hidden rounded-full bg-blue-100">
            <span
              class=":uno: block h-full rounded-full bg-blue-500 transition-all duration-300"
              :style="{ width: `${latestTask.status?.progress ?? 0}%` }"
            ></span>
          </div>
        </div>

        <div
          v-if="showSearchPanel"
          class=":uno: overflow-hidden rounded-lg border border-[#edf0f5] bg-white"
        >
          <div
            class=":uno: flex items-center justify-between gap-3 border-b border-[#edf0f5] bg-slate-50 px-4 py-3"
          >
            <div class=":uno: flex items-center gap-2 text-[13px] font-bold text-gray-900">
              <RiSearchLine class=":uno: h-4 w-4 text-slate-500" />
              <span>RAG 命中调试</span>
            </div>
            <VButton size="sm" circle v-tooltip="'关闭'" @click="showSearchPanel = false">
              <template #icon>
                <RiCloseLine class="h-full w-full" />
              </template>
            </VButton>
          </div>
          <div class=":uno: grid gap-3 p-4">
            <div
              class="panel-form-row :uno: grid grid-cols-[minmax(0,1fr)_8.5rem_max-content] items-end gap-2.5 max-[720px]:grid-cols-1"
            >
              <FormKit
                v-model="searchQuery"
                type="text"
                name="searchQuery"
                label="检索内容"
                placeholder="输入关键词或问题进行测试"
                @keyup.enter="runSearch"
              />
              <FormKit
                v-model="searchLimit"
                type="select"
                name="searchLimit"
                label="返回条数"
                :options="[
                  { label: '5 条', value: 5 },
                  { label: '10 条', value: 10 },
                  { label: '20 条', value: 20 },
                ]"
              />
              <VButton size="sm" :loading="searching" @click="runSearch">搜索</VButton>
            </div>
            <div
              class=":uno: flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700"
            >
              <span>当前知识库：{{ displayName(activeKnowledgeBase) }}</span>
              <span v-if="searchElapsedMs !== undefined">耗时 {{ searchElapsedMs }}ms</span>
              <span v-if="searchResults.length">命中 {{ searchResults.length }} 条</span>
              <span v-if="activeKnowledgeBase?.status?.indexState">
                索引 {{ statusInfo(activeKnowledgeBase.status?.indexState).text }}
              </span>
            </div>
            <div
              class=":uno: min-h-[160px] overflow-hidden rounded-lg border border-[#edf0f5] bg-slate-50"
            >
              <VLoading v-if="searching" />
              <div
                v-else-if="searchResults.length === 0"
                class=":uno: flex min-h-[160px] flex-col items-center justify-center gap-2 text-xs text-slate-400"
              >
                <RiSearchLine class=":uno: h-8 w-8 text-slate-300" />
                <span>{{ searchQuery ? '没有匹配的结果' : '输入关键词开始测试' }}</span>
              </div>
              <div v-else class=":uno: divide-y divide-slate-100 bg-white">
                <div
                  v-for="(item, index) in searchResults"
                  :key="item.id"
                  class=":uno: grid grid-cols-[32px_minmax(0,1fr)] gap-3 px-3.5 py-3 hover:bg-slate-50"
                >
                  <span
                    class=":uno: grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-600"
                  >
                    {{ index + 1 }}
                  </span>
                  <div class=":uno: grid min-w-0 gap-2">
                    <div class=":uno: flex items-start justify-between gap-3">
                      <div
                        class=":uno: min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-gray-900"
                      >
                        {{ searchResultTitle(item) }}
                      </div>
                      <div class=":uno: flex flex-none flex-wrap justify-end gap-1.5">
                        <span
                          v-for="score in searchScoreBreakdown(item)"
                          :key="score.label"
                          class=":uno: inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                        >
                          <span>{{ score.label }}</span>
                          <strong class=":uno: font-mono text-blue-600">{{
                            formatScore(score.value)
                          }}</strong>
                        </span>
                      </div>
                    </div>
                    <div class=":uno: flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <VTag v-if="item.sourceType" size="sm">
                        {{ sourceTypeText(item.sourceType) }}
                      </VTag>
                      <span>{{ searchResultMetaLine(item) || '无来源元信息' }}</span>
                    </div>
                    <div class=":uno: line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {{ stripHtmlAndMarkdown(item.content) }}
                    </div>
                    <details class=":uno: rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                      <summary class=":uno: cursor-pointer text-xs font-semibold text-slate-600">
                        查看命中片段和调试信息
                      </summary>
                      <div
                        class=":uno: mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded bg-white p-2 text-xs leading-relaxed text-slate-700"
                      >
                        {{ item.content || '暂无片段内容' }}
                      </div>
                      <div
                        v-if="searchMetadataEntries(item).length"
                        class=":uno: mt-2 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1 text-[11px] text-slate-500"
                      >
                        <template
                          v-for="entry in searchMetadataEntries(item)"
                          :key="entry.key"
                        >
                          <span class=":uno: font-semibold text-slate-400">{{ entry.key }}</span>
                          <span class=":uno: min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                            {{ entry.value }}
                          </span>
                        </template>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showAskPanel"
          class=":uno: overflow-hidden rounded-lg border border-[#edf0f5] bg-white"
        >
          <div
            class=":uno: flex items-center justify-between gap-3 border-b border-[#edf0f5] bg-slate-50 px-4 py-3"
          >
            <div class=":uno: flex items-center gap-2 text-[13px] font-bold text-gray-900">
              <RiQuestionAnswerLine class=":uno: h-4 w-4 text-slate-500" />
              <span>RAG 问答</span>
            </div>
            <VButton size="sm" circle v-tooltip="'关闭'" @click="showAskPanel = false">
              <template #icon>
                <RiCloseLine class="h-full w-full" />
              </template>
            </VButton>
          </div>
          <div class=":uno: grid gap-3 p-4">
            <FormKit
              v-model="askQuestion"
              type="textarea"
              name="askQuestion"
              label="问题"
              placeholder="输入问题，基于当前知识库资料生成回答"
              rows="4"
            />
            <VSpace>
              <VButton type="primary" :loading="asking" @click="runAsk">提问</VButton>
              <VButton v-if="asking" type="secondary" @click="stopAsk">停止</VButton>
            </VSpace>
            <div
              v-if="askStreamError"
              class=":uno: rounded-lg bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-700"
            >
              {{ askStreamError }}
            </div>
            <div
              v-if="answer"
              class=":uno: whitespace-pre-wrap rounded-lg border border-[#edf0f5] bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-800"
            >
              {{ answer }}
            </div>
            <div v-if="answerSources.length" class=":uno: flex flex-wrap gap-2">
              <div
                v-for="source in answerSources"
                :key="source.id"
                class=":uno: inline-flex max-w-full items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-600"
              >
                <RiArticleLine class=":uno: h-3.5 w-3.5 flex-none" />
                <a
                  v-if="source.url"
                  :href="source.url"
                  target="_blank"
                  class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-blue-600 no-underline"
                >
                  {{ source.title || source.id }}
                </a>
                <span v-else>{{ source.title || source.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <VCard class=":uno: overflow-hidden" :body-class="[':uno: !p-0']">
          <template #header>
            <div class=":uno: flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3">
              <div class=":uno: flex min-w-0 flex-wrap items-center gap-2 text-xs text-gray-500">
                <strong class=":uno: text-lg leading-none text-gray-900">{{
                  documents.length
                }}</strong>
                <span>条内容</span>
                <span>编辑后需要重建索引才会进入检索结果</span>
              </div>
            </div>
          </template>

          <VEmpty
            v-if="documents.length === 0"
            title="暂无条目"
            :message="
              canManageRag
                ? '点击右上角「新建条目」或「导入」添加数据'
                : '这个知识库还没有可查看的条目'
            "
            class=":uno: py-8"
          />

          <VEntityContainer v-else class="document-list :uno: overflow-hidden">
            <VEntity
              v-for="document in pagedDocuments"
              :key="document.metadata.name"
              :class="{
                ':uno: pointer-events-none opacity-[0.56]': !!document.metadata.deletionTimestamp,
              }"
            >
              <template #start>
                <VEntityField
                  :title="document.spec?.title || document.metadata.name"
                  :description="stripHtmlAndMarkdown(document.spec?.content)"
                  width="30rem"
                >
                  <template #extra>
                    <VStatusDot
                      v-if="!document.metadata.deletionTimestamp"
                      :state="document.spec?.enabled !== false ? 'success' : 'default'"
                      :text="document.spec?.enabled !== false ? '启用' : '禁用'"
                    />
                    <VStatusDot v-else v-tooltip="'删除中'" state="warning" text="删除中" />
                  </template>
                </VEntityField>
              </template>

              <template #end>
                <VEntityField>
                  <template #description>
                    <VTag size="sm">{{ sourceTypeText(document.spec?.sourceType) }}</VTag>
                  </template>
                </VEntityField>
                <VEntityField
                  v-for="category in visibleDocumentCategories(document)"
                  :key="category"
                  width="6rem"
                >
                  <template #description>
                    <VTag size="sm">{{ category }}</VTag>
                  </template>
                </VEntityField>
                <VEntityField v-if="document.status?.chunkCount">
                  <template #description>
                    <span
                      class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                    >
                      {{ document.status.chunkCount }} 分块
                    </span>
                  </template>
                </VEntityField>
                <VEntityField v-if="document.status?.lastIndexedAt" width="10rem">
                  <template #description>
                    <span
                      class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-400 tabular-nums"
                    >
                      {{ formatRelativeDate(document.status.lastIndexedAt) }}
                    </span>
                  </template>
                </VEntityField>
                <VEntityField
                  v-if="canManageRag && !document.metadata.deletionTimestamp"
                  v-permission="[RAG_MANAGE_PERMISSION]"
                >
                  <template #description>
                    <VSwitch
                      :model-value="document.spec?.enabled !== false"
                      :disabled="mutatingDocument"
                      @update:model-value="(checked) => updateDocumentEnabled(document, checked)"
                    />
                  </template>
                </VEntityField>
              </template>

              <template v-if="canManageRag && !document.metadata.deletionTimestamp" #dropdownItems>
                <VDropdownItem
                  v-permission="[RAG_MANAGE_PERMISSION]"
                  @click="openDocumentModal(document)"
                >
                  编辑
                </VDropdownItem>
                <VDropdownItem
                  v-permission="[RAG_MANAGE_PERMISSION]"
                  type="danger"
                  :disabled="mutatingDocument"
                  @click="deleteDocument(document)"
                >
                  删除
                </VDropdownItem>
              </template>
            </VEntity>
          </VEntityContainer>

          <template #footer>
            <VPagination
              v-model:page="documentPage"
              v-model:size="documentPageSize"
              page-label="页"
              size-label="条 / 页"
              :total-label="`共 ${documents.length} 项数据`"
              :total="documents.length"
              :size-options="[10, 20, 50]"
            />
          </template>
        </VCard>
      </template>
    </div>
  </template>

  <VModal
    v-model:visible="showKnowledgeBaseModal"
    :title="editingKnowledgeBase ? '编辑知识库' : '新建知识库'"
    :width="480"
  >
    <div class="form-stack :uno: flex w-full min-w-0 flex-col gap-4">
      <FormKit
        v-model="knowledgeBaseForm.name"
        type="text"
        name="name"
        label="标识"
        :disabled="Boolean(editingKnowledgeBase)"
        placeholder="default"
        validation="required"
      />
      <FormKit
        v-model="knowledgeBaseForm.displayName"
        type="text"
        name="displayName"
        label="名称"
        placeholder="如：产品文档、常见问题"
        validation="required"
      />
      <FormKit
        v-model="knowledgeBaseForm.description"
        type="textarea"
        name="description"
        label="描述"
        placeholder="可选，简要描述知识库用途"
      />
      <label class=":uno: inline-flex items-center gap-2 text-[13px] text-slate-700">
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
    <div class="form-stack :uno: flex w-full min-w-0 flex-col gap-4">
      <FormKit
        v-model="documentForm.title"
        type="text"
        name="title"
        label="标题"
        placeholder="问题或知识点标题"
        validation="required"
      />

      <FormKit
        v-model="documentForm.content"
        type="textarea"
        name="content"
        label="内容"
        placeholder="答案或详细内容，支持 Markdown 格式"
        validation="required"
        rows="8"
      />

      <div class=":uno: grid w-full min-w-0 grid-cols-1 gap-3.5">
        <FormKit
          v-model="documentForm.sourceType"
          type="select"
          name="sourceType"
          label="来源类型"
          :options="documentSourceTypeOptions"
          :disabled="Boolean(editingDocument)"
        />
        <FormKit
          v-model="documentForm.sourceName"
          type="text"
          name="sourceName"
          label="来源标识"
          placeholder="可选，默认自动生成"
        />
      </div>

      <FormKit
        v-model="documentForm.url"
        type="text"
        name="url"
        label="URL"
        placeholder="可选，来源链接"
      />

      <div class=":uno: grid w-full min-w-0 grid-cols-1 gap-3.5">
        <FormKit
          v-model="documentForm.tags"
          type="text"
          name="tags"
          label="标签"
          placeholder="多个标签用逗号分隔"
        />
        <FormKit
          v-model="documentForm.categories"
          type="text"
          name="categories"
          label="分类"
          placeholder="多个分类用逗号分隔"
        />
      </div>

      <label class=":uno: inline-flex items-center gap-2 text-[13px] text-slate-700">
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

  <VModal v-model:visible="showImportPostsModal" title="导入知识库" :width="820">
    <div class=":uno: grid gap-4">
      <div class=":uno: flex flex-wrap gap-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          class=":uno: inline-flex flex-1 items-center justify-center gap-2 rounded-md border-0 px-3 py-2 text-sm font-medium transition-colors"
          :class="
            importSourceType === 'POST'
              ? ':uno: bg-white text-blue-600 shadow-sm'
              : ':uno: bg-transparent text-slate-500 hover:text-slate-800'
          "
          @click="switchImportSourceType('POST')"
        >
          <RiArticleLine class=":uno: h-4 w-4" />
          <span>文章导入</span>
        </button>
        <button
          type="button"
          class=":uno: inline-flex flex-1 items-center justify-center gap-2 rounded-md border-0 px-3 py-2 text-sm font-medium transition-colors"
          :class="
            importSourceType === 'DOCSME'
              ? ':uno: bg-white text-blue-600 shadow-sm'
              : ':uno: bg-transparent text-slate-500 hover:text-slate-800'
          "
          @click="switchImportSourceType('DOCSME')"
        >
          <RiFileTextLine class=":uno: h-4 w-4" />
          <span>文档导入</span>
        </button>
        <button
          type="button"
          class=":uno: inline-flex flex-1 items-center justify-center gap-2 rounded-md border-0 px-3 py-2 text-sm font-medium transition-colors"
          :class="
            importSourceType === 'TEXT'
              ? ':uno: bg-white text-blue-600 shadow-sm'
              : ':uno: bg-transparent text-slate-500 hover:text-slate-800'
          "
          @click="switchImportSourceType('TEXT')"
        >
          <RiFileTextLine class=":uno: h-4 w-4" />
          <span>文件导入</span>
        </button>
      </div>

      <div class=":uno: grid gap-4 rounded-lg border border-[#edf0f5] bg-white p-4">
        <div class=":uno: flex items-center gap-3">
          <div class=":uno: grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <RiArticleLine v-if="importSourceType === 'POST'" class=":uno: h-5 w-5" />
            <RiFileTextLine v-else class=":uno: h-5 w-5" />
          </div>
          <div>
            <h4 class=":uno: m-0 text-sm font-bold text-gray-900">
              {{ importSourceTitle }}
            </h4>
            <p class=":uno: m-0 mt-1 text-xs text-slate-500">
              {{ importSourceDescription }}
            </p>
          </div>
        </div>

        <div
          v-if="importSourceType !== 'TEXT'"
          class="panel-form-row :uno: grid w-full grid-cols-[minmax(0,42rem)_max-content] items-end justify-start gap-2.5 max-[720px]:grid-cols-1"
        >
          <FormKit
            v-model="importKeyword"
            type="text"
            name="importKeyword"
            :label="importSourceType === 'POST' ? '搜索文章' : '搜索文档'"
            :placeholder="
              importSourceType === 'POST' ? '输入标题或文章标识' : '输入标题、文档标识或项目名'
            "
          />
          <VButton size="sm" :loading="loadingActiveImportables" @click="fetchActiveImportables">
            刷新
          </VButton>
        </div>

        <div
          class=":uno: rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-3 text-amber-950"
        >
          <div class=":uno: flex items-start justify-between gap-3 max-[720px]:flex-col">
            <div class=":uno: flex min-w-0 gap-2.5">
              <div
                class=":uno: mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-md bg-amber-100 text-amber-700"
              >
                <RiAlertLine class=":uno: h-4.5 w-4.5" />
              </div>
              <div class=":uno: min-w-0">
                <p class=":uno: m-0 text-sm font-semibold">导入完成后立即重建索引</p>
                <p class=":uno: m-0 mt-1 text-xs leading-5 text-amber-800">
                  会重新向量化当前知识库全部启用条目，可能耗时并消耗 AI
                  配额；通常建议导入完成后确认内容，再手动重建。
                </p>
              </div>
            </div>
            <VSwitch v-model="rebuildAfterImport" />
          </div>
        </div>

        <RagTextImportFormPanel v-if="importSourceType === 'TEXT'" v-model="textImportForm" />

        <template v-else-if="importSourceType === 'POST'">
          <VLoading v-if="loadingImportablePosts" />
          <VEmpty v-else-if="importableFilteredPosts.length === 0" title="暂无可导入文章" />
          <VEntityContainer
            v-else
            class="post-list :uno: max-h-[420px] overflow-auto rounded-lg border border-[#edf0f5]"
          >
            <VEntity>
              <template #start>
                <div
                  class=":uno: grid w-[min(38rem,60vw)] min-w-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 max-[1080px]:w-[min(100%,60vw)] max-[720px]:w-full"
                >
                  <label
                    class="selection-checkbox :uno: inline-flex h-9 w-9 items-center justify-center"
                  >
                    <input
                      :checked="allVisiblePostsSelected"
                      type="checkbox"
                      aria-label="选择当前页文章"
                      @change="(event) => toggleAllVisiblePosts(checkboxChecked(event))"
                    />
                  </label>
                  <VEntityField
                    title="文章"
                    :description="`当前页 ${pagedImportablePosts.length} / ${importableFilteredPosts.length}`"
                  />
                </div>
              </template>
              <template #end>
                <VEntityField>
                  <template #description>
                    <span
                      class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                    >
                      已选 {{ selectedPostNames.length }}
                    </span>
                  </template>
                </VEntityField>
              </template>
            </VEntity>
            <VEntity v-for="post in pagedImportablePosts" :key="post.postName">
              <template #start>
                <div
                  class=":uno: grid w-[min(38rem,60vw)] min-w-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 max-[1080px]:w-[min(100%,60vw)] max-[720px]:w-full"
                >
                  <label
                    class="selection-checkbox :uno: inline-flex h-9 w-9 items-center justify-center"
                  >
                    <input
                      :checked="selectedImportableSet.has(post.postName)"
                      type="checkbox"
                      :aria-label="`选择 ${post.title || post.postName}`"
                      @change="
                        (event) => togglePostSelection(post.postName, checkboxChecked(event))
                      "
                    />
                  </label>
                  <VEntityField :title="post.title || post.postName">
                    <template #description>
                      <span
                        class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                      >
                        {{ post.postName }} · {{ post.chunkCount || 0 }} 分块 ·
                        {{ formatDate(post.lastImportedAt) }}
                      </span>
                    </template>
                  </VEntityField>
                </div>
              </template>
              <template #end>
                <VEntityField>
                  <template #description>
                    <VTag
                      :class="
                        post.imported
                          ? ':uno: bg-emerald-50 text-emerald-700'
                          : ':uno: bg-slate-100 text-slate-500'
                      "
                    >
                      {{ post.imported ? '已导入' : '未导入' }}
                    </VTag>
                  </template>
                </VEntityField>
              </template>
            </VEntity>
          </VEntityContainer>
          <div
            v-if="importableFilteredPosts.length > importablePageSize"
            class=":uno: flex justify-end overflow-x-auto"
          >
            <VPagination
              v-model:page="importablePostPage"
              v-model:size="importablePageSize"
              page-label="页"
              size-label="条 / 页"
              :total-label="`共 ${importableFilteredPosts.length} 篇文章`"
              :total="importableFilteredPosts.length"
              :size-options="[10, 20, 50]"
            />
          </div>
        </template>

        <template v-else>
          <VLoading v-if="loadingImportableDocsmeDocuments" />
          <VEmpty v-else-if="!docsmeImportAvailable" title="未检测到 Docsme 文档插件" />
          <VEmpty
            v-else-if="importableFilteredDocsmeDocuments.length === 0"
            title="暂无可导入文档"
          />
          <VEntityContainer
            v-else
            class="post-list :uno: max-h-[420px] overflow-auto rounded-lg border border-[#edf0f5]"
          >
            <VEntity>
              <template #start>
                <div
                  class=":uno: grid w-[min(38rem,60vw)] min-w-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 max-[1080px]:w-[min(100%,60vw)] max-[720px]:w-full"
                >
                  <label
                    class="selection-checkbox :uno: inline-flex h-9 w-9 items-center justify-center"
                  >
                    <input
                      :checked="allVisibleDocsmeDocumentsSelected"
                      type="checkbox"
                      aria-label="选择当前页文档"
                      @change="(event) => toggleAllVisibleDocsmeDocuments(checkboxChecked(event))"
                    />
                  </label>
                  <VEntityField
                    title="文档"
                    :description="`当前页 ${pagedImportableDocsmeDocuments.length} / ${importableFilteredDocsmeDocuments.length}`"
                  />
                </div>
              </template>
              <template #end>
                <VEntityField>
                  <template #description>
                    <span
                      class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                    >
                      已选 {{ selectedDocsmeDocumentNames.length }}
                    </span>
                  </template>
                </VEntityField>
              </template>
            </VEntity>
            <VEntity v-for="document in pagedImportableDocsmeDocuments" :key="document.docName">
              <template #start>
                <div
                  class=":uno: grid w-[min(38rem,60vw)] min-w-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 max-[1080px]:w-[min(100%,60vw)] max-[720px]:w-full"
                >
                  <label
                    class="selection-checkbox :uno: inline-flex h-9 w-9 items-center justify-center"
                  >
                    <input
                      :checked="selectedDocsmeDocumentSet.has(document.docName)"
                      type="checkbox"
                      :aria-label="`选择 ${document.title || document.docName}`"
                      @change="
                        (event) =>
                          toggleDocsmeDocumentSelection(document.docName, checkboxChecked(event))
                      "
                    />
                  </label>
                  <VEntityField :title="document.title || document.docName">
                    <template #description>
                      <span
                        class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                      >
                        {{ document.projectDisplayName || document.projectName || 'Docsme' }} ·
                        {{ document.versionSlug || 'default' }} ·
                        {{ document.chunkCount || 0 }} 分块 ·
                        {{ formatDate(document.lastImportedAt) }}
                      </span>
                    </template>
                  </VEntityField>
                </div>
              </template>
              <template #end>
                <VEntityField>
                  <template #description>
                    <VTag
                      :class="
                        document.imported
                          ? ':uno: bg-emerald-50 text-emerald-700'
                          : ':uno: bg-slate-100 text-slate-500'
                      "
                    >
                      {{ document.imported ? '已导入' : '未导入' }}
                    </VTag>
                  </template>
                </VEntityField>
              </template>
            </VEntity>
          </VEntityContainer>
          <div
            v-if="importableFilteredDocsmeDocuments.length > importablePageSize"
            class=":uno: flex justify-end overflow-x-auto"
          >
            <VPagination
              v-model:page="importableDocsmeDocumentPage"
              v-model:size="importablePageSize"
              page-label="页"
              size-label="条 / 页"
              :total-label="`共 ${importableFilteredDocsmeDocuments.length} 篇文档`"
              :total="importableFilteredDocsmeDocuments.length"
              :size-options="[10, 20, 50]"
            />
          </div>
        </template>
      </div>
    </div>
    <template #footer>
      <VSpace>
        <VButton @click="showImportPostsModal = false">取消</VButton>
        <VButton
          v-if="importSourceType !== 'TEXT'"
          :loading="importing"
          :disabled="selectedImportCount === 0 || importing || activeImportUnavailable"
          @click="importSelectedActive"
        >
          导入所选 {{ selectedImportCount }}
        </VButton>
        <VButton
          type="primary"
          :loading="importing"
          :disabled="activeImportPrimaryDisabled"
          @click="importAllActive"
        >
          {{ activeImportAllButtonText }}
        </VButton>
      </VSpace>
    </template>
  </VModal>
</template>

<style scoped>
.kb-list :deep(.entity-start),
.document-list :deep(.entity-start) {
  min-width: 0;
  width: 100%;
}

.kb-list :deep(.entity-end),
.document-list :deep(.entity-end) {
  gap: 18px;
  row-gap: 6px;
}

.kb-list :deep(.entity-field-wrapper),
.document-list :deep(.entity-field-wrapper) {
  max-width: none;
}

.panel-form-row :deep(.formkit-outer),
.panel-form-row :deep(.formkit-wrapper),
.panel-form-row :deep(.formkit-inner) {
  margin-bottom: 0;
  width: 100%;
  max-width: none;
  min-width: 0;
}

.panel-form-row :deep(.formkit-input) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-stack :deep(.formkit-outer),
.form-stack :deep(.formkit-wrapper),
.form-stack :deep(.formkit-inner) {
  width: 100%;
  max-width: none;
  min-width: 0;
}

.form-stack :deep(.formkit-input) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.post-list :deep(.entity-start) {
  min-width: 0;
  width: 100%;
}

.post-list :deep(.entity-end) {
  gap: 14px;
  row-gap: 6px;
}

.selection-checkbox input {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: #2563eb;
}

@media (max-width: 720px) {
  .kb-list :deep(.entity-start),
  .document-list :deep(.entity-start),
  .kb-list :deep(.entity-end),
  .document-list :deep(.entity-end) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
