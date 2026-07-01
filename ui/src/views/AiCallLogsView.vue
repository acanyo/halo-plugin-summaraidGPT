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
  VPageHeader,
  VPagination,
  VSpace,
  VStatusDot,
  VTag,
} from '@halo-dev/components'
import { utils } from '@halo-dev/ui-shared'
import RiDeleteBinLine from '~icons/ri/delete-bin-line'
import RiFileList3Line from '~icons/ri/file-list-3-line'
import RiPulseLine from '~icons/ri/pulse-line'
import { aiCallLogApi, type AiCallLog, type ListAiCallLogsParams } from '@/api/ai-call-logs'
import { hasUiPermission } from '@/utils/permissions'

const loading = ref(false)
const deleting = ref(false)
const clearing = ref(false)
const logs = ref<AiCallLog[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const AI_CALL_LOGS_MANAGE_PERMISSION = 'plugin:summaraidGPT:ai-call-logs:manage'
const AI_CALL_LOG_DELETING_REFETCH_INTERVAL = 1000
let deletingLogRefetchTimer: ReturnType<typeof window.setInterval> | undefined

const filters = reactive({
  operation: '',
  modelType: '',
  success: '',
})

const canManageLogs = computed(() => hasUiPermission(AI_CALL_LOGS_MANAGE_PERMISSION))
const failedCount = computed(() => logs.value.filter((item) => item.spec?.success === false).length)
const successCount = computed(() => logs.value.filter((item) => item.spec?.success === true).length)
const hasFilters = computed(() =>
  Boolean(filters.operation || filters.modelType || filters.success),
)
const averageDuration = computed(() => {
  const durations = logs.value
    .map((item) => item.spec?.durationMillis)
    .filter((value): value is number => typeof value === 'number')
  if (!durations.length) return 0
  return Math.round(durations.reduce((total, value) => total + value, 0) / durations.length)
})

const latestError = computed(
  () => logs.value.find((item) => item.spec?.success === false && item.spec?.errorMessage)?.spec,
)

const isLogDeleting = (log?: AiCallLog) => Boolean(log?.metadata.deletionTimestamp)

const deletingLogRefetchInterval = (data?: AiCallLog[]) => {
  const hasDeletingLog = data?.some((log) => log.metadata.deletionTimestamp)
  return hasDeletingLog ? AI_CALL_LOG_DELETING_REFETCH_INTERVAL : false
}

const clearDeletingLogRefetch = () => {
  if (!deletingLogRefetchTimer) {
    return
  }
  window.clearInterval(deletingLogRefetchTimer)
  deletingLogRefetchTimer = undefined
}

const syncDeletingLogRefetch = () => {
  const interval = deletingLogRefetchInterval(logs.value)
  if (!interval) {
    clearDeletingLogRefetch()
    return
  }
  if (deletingLogRefetchTimer) {
    return
  }
  deletingLogRefetchTimer = window.setInterval(() => {
    loadLogs({ silent: true })
  }, interval)
}

const operationFilterItems = [
  { label: '全部调用', value: '' },
  { label: '文本生成', value: 'text-generate' },
  { label: '对话生成', value: 'chat-generate' },
  { label: '流式对话', value: 'stream-chat' },
  { label: '批量向量化', value: 'rag-embed-values' },
  { label: '查询向量化', value: 'rag-embed-query' },
  { label: 'Rerank 精排', value: 'rag-rerank' },
  { label: 'RAG 回答', value: 'rag-generate-answer' },
  { label: 'RAG 流式回答', value: 'rag-stream-answer' },
]

const modelTypeFilterItems = [
  { label: '全部模型', value: '' },
  { label: '语言模型', value: 'language' },
  { label: '向量模型', value: 'embedding' },
  { label: '精排模型', value: 'rerank' },
]

const successFilterItems = [
  { label: '全部状态', value: '' },
  { label: '成功', value: 'true' },
  { label: '失败', value: 'false' },
]

const loadLogs = async (options: { silent?: boolean } = {}) => {
  if (!options.silent) {
    loading.value = true
  }
  try {
    const params: ListAiCallLogsParams = {
      page: page.value,
      size: pageSize.value,
    }
    if (filters.operation) {
      params.operation = filters.operation
    }
    if (filters.modelType) {
      params.modelType = filters.modelType
    }
    if (filters.success) {
      params.success = filters.success === 'true'
    }
    const result = await aiCallLogApi.list(params)
    logs.value = result.items
    page.value = result.page
    pageSize.value = result.size
    total.value = result.total
    syncDeletingLogRefetch()
    if (result.items.length === 0 && result.total > 0 && page.value > 1) {
      page.value = Math.max(1, Math.ceil(result.total / pageSize.value))
      return
    }
  } catch (error) {
    if (!options.silent) {
      Toast.error('AI 调用日志加载失败')
    }
  } finally {
    if (!options.silent) {
      loading.value = false
    }
  }
}

const resetFilters = async () => {
  filters.operation = ''
  filters.modelType = ''
  filters.success = ''
  await applyFilters()
}

const applyFilters = async () => {
  if (page.value === 1) {
    await loadLogs()
    return
  }
  page.value = 1
}

const deleteLog = (log: AiCallLog) => {
  if (isLogDeleting(log)) {
    return
  }

  Dialog.warning({
    title: '删除调用日志',
    description: `确定删除「${log.metadata.name}」吗？此操作不可恢复。`,
    confirmType: 'danger',
    onConfirm: async () => {
      deleting.value = true
      try {
        await aiCallLogApi.delete(log.metadata.name)
        Toast.success('已删除')
        await loadLogs()
      } catch (error) {
        Toast.error('删除失败')
      } finally {
        deleting.value = false
      }
    },
  })
}

const clearLogs = () => {
  Dialog.warning({
    title: '清空 AI 调用日志',
    description: '确定要删除全部 AI 调用日志吗？此操作不可恢复，不会影响知识库、宠物或会话数据。',
    confirmType: 'danger',
    onConfirm: async () => {
      clearing.value = true
      try {
        const result = await aiCallLogApi.clear()
        Toast.success(`已清空 ${result.affected || 0} 条日志`)
        if (page.value === 1) {
          await loadLogs()
        } else {
          page.value = 1
        }
      } catch (error) {
        Toast.error('清空失败')
      } finally {
        clearing.value = false
      }
    },
  })
}

const operationText = (operation?: string) => {
  const map: Record<string, string> = {
    'text-generate': '文本生成',
    'chat-generate': '对话生成',
    'stream-chat': '流式对话',
    'rag-embed-values': '批量向量化',
    'rag-embed-query': '查询向量化',
    'rag-rerank': 'Rerank 精排',
    'rag-generate-answer': 'RAG 回答',
    'rag-stream-answer': 'RAG 流式回答',
  }
  return operation ? map[operation] || operation : '-'
}

const modelTypeText = (modelType?: string) => {
  if (modelType === 'language') return '语言'
  if (modelType === 'embedding') return '向量'
  if (modelType === 'rerank') return '精排'
  return modelType || '-'
}

const modelNameText = (modelName?: string) => modelName || '默认模型'

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat().format(value)
}

const formatDuration = (millis?: number) => {
  if (millis === undefined || millis === null) return '-'
  if (millis < 1000) return `${millis}ms`
  if (millis < 60_000) return `${(millis / 1000).toFixed(1)}s`
  return `${Math.round(millis / 60_000)}min`
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return utils.date.format(value)
}

const metadataEntries = (metadata?: Record<string, string>) =>
  Object.entries(metadata || {}).filter(([, value]) => value !== undefined && value !== null)

watch([page, pageSize], () => loadLogs())
watch(
  () => [filters.operation, filters.modelType, filters.success],
  () => {
    applyFilters()
  },
)

onBeforeUnmount(clearDeletingLogRefetch)

onMounted(loadLogs)
</script>

<template>
  <VPageHeader title="AI 调用日志">
    <template #icon>
      <RiFileList3Line class="mr-2 self-center" />
    </template>
    <template #actions>
      <VSpace>
        <VButton
          v-if="canManageLogs"
          v-permission="[AI_CALL_LOGS_MANAGE_PERMISSION]"
          size="sm"
          type="danger"
          :loading="clearing"
          :disabled="loading || clearing || total === 0"
          @click="clearLogs"
        >
          <template #icon>
            <RiDeleteBinLine class="h-full w-full" />
          </template>
          清空日志
        </VButton>
        <VButton type="secondary" :loading="loading" @click="loadLogs()">
          <template #icon>
            <IconRefreshLine class="h-full w-full" />
          </template>
          刷新
        </VButton>
      </VSpace>
    </template>
  </VPageHeader>

  <div class=":uno: flex flex-col gap-3 p-4">
    <VCard v-if="latestError" :body-class="[':uno: flex gap-3 bg-red-50 px-4 py-3.5 text-red-800']">
      <RiPulseLine class=":uno: mt-px h-5 w-5 flex-none" />
      <div>
        <strong class=":uno: text-[13px] text-red-900">
          最近失败：{{ operationText(latestError.operation) }}
        </strong>
        <p class=":uno: m-0 mt-1 break-words text-xs leading-relaxed text-red-700">
          {{ latestError.errorType || 'Error' }}：{{ latestError.errorMessage }}
        </p>
      </div>
    </VCard>

    <VCard :body-class="[':uno: !p-0']">
      <template #header>
        <div
          class=":uno: flex w-full items-center justify-between gap-4 bg-gray-50 px-4 py-3 max-[900px]:flex-col max-[900px]:items-stretch"
        >
          <div class=":uno: flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <strong class=":uno: text-lg leading-none text-gray-900">{{ total }}</strong>
            <span>条日志</span>
            <span>本页成功 {{ successCount }}</span>
            <span>失败 {{ failedCount }}</span>
            <span>平均 {{ formatDuration(averageDuration) }}</span>
          </div>

          <VSpace spacing="lg" class=":uno: flex-wrap justify-end max-[900px]:justify-start">
            <FilterCleanButton v-if="hasFilters" @click="resetFilters" />
            <FilterDropdown
              v-model="filters.operation"
              label="调用"
              :items="operationFilterItems"
            />
            <FilterDropdown
              v-model="filters.modelType"
              label="模型"
              :items="modelTypeFilterItems"
            />
            <FilterDropdown v-model="filters.success" label="状态" :items="successFilterItems" />
          </VSpace>
        </div>
      </template>

      <VLoading v-if="loading" />
      <VEmpty
        v-else-if="logs.length === 0"
        title="暂无 AI 调用日志"
        message="触发摘要、标签、RAG 索引或问答后会在这里记录调用诊断信息"
      />

      <VEntityContainer v-else class="log-entity-list :uno: overflow-hidden">
        <VEntity
          v-for="log in logs"
          :key="log.metadata.name"
          :class="{ ':uno: pointer-events-none opacity-[0.56]': isLogDeleting(log) }"
        >
          <template #start>
            <VEntityField width="22rem">
              <template #title>
                <span class=":uno: flex items-center gap-2">
                  <VStatusDot
                    v-if="isLogDeleting(log)"
                    v-tooltip="'删除中'"
                    state="warning"
                    text="删除中"
                  />
                  <VStatusDot
                    v-else
                    :state="log.spec?.success === false ? 'error' : 'success'"
                    :text="log.spec?.success === false ? '失败' : '成功'"
                  />
                  <span
                    class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-slate-900"
                  >
                    {{ operationText(log.spec?.operation) }}
                  </span>
                </span>
              </template>
              <template #description>
                <span class=":uno: whitespace-nowrap text-xs text-slate-500">
                  模型：{{ modelNameText(log.spec?.modelName) }}
                </span>
              </template>
            </VEntityField>
          </template>

          <template #end>
            <VEntityField width="5rem">
              <template #description>
                <VTag size="sm">{{ modelTypeText(log.spec?.modelType) }}</VTag>
              </template>
            </VEntityField>
            <VEntityField>
              <template #description>
                <span class=":uno: whitespace-nowrap text-xs text-slate-500">
                  耗时 {{ formatDuration(log.spec?.durationMillis) }}
                </span>
              </template>
            </VEntityField>
            <VEntityField>
              <template #description>
                <span class=":uno: whitespace-nowrap text-xs text-slate-500">
                  输入 {{ formatNumber(log.spec?.inputCount) }} 项 /
                  {{ formatNumber(log.spec?.inputChars) }} 字符
                </span>
              </template>
            </VEntityField>
            <VEntityField v-if="log.spec?.outputChars !== undefined">
              <template #description>
                <span class=":uno: whitespace-nowrap text-xs text-slate-500">
                  输出 {{ formatNumber(log.spec?.outputCount) }} 项 /
                  {{ formatNumber(log.spec?.outputChars) }} 字符
                </span>
              </template>
            </VEntityField>
            <VEntityField
              v-if="log.spec?.candidateCount !== undefined || log.spec?.sourceCount !== undefined"
            >
              <template #description>
                <span class=":uno: whitespace-nowrap text-xs text-slate-500">
                  <template v-if="log.spec?.candidateCount !== undefined">
                    候选 {{ formatNumber(log.spec?.candidateCount) }}
                  </template>
                  <template v-if="log.spec?.sourceCount !== undefined">
                    来源 {{ formatNumber(log.spec?.sourceCount) }}
                  </template>
                </span>
              </template>
            </VEntityField>
            <VEntityField>
              <template #description>
                <span class=":uno: whitespace-nowrap text-xs text-slate-400 tabular-nums">
                  {{ formatDate(log.spec?.startedAt || log.metadata.creationTimestamp) }}
                </span>
              </template>
            </VEntityField>
          </template>

          <template
            v-if="log.spec?.success === false || metadataEntries(log.spec?.metadata).length"
            #footer
          >
            <div class=":uno: grid gap-2 px-4 pb-3">
              <div
                v-if="log.spec?.success === false"
                class=":uno: break-words rounded-lg bg-red-50 px-2.5 py-2 text-xs leading-relaxed text-red-700"
              >
                {{ log.spec?.errorType || 'Error' }}：{{ log.spec?.errorMessage || '未知错误' }}
              </div>
              <div
                v-if="metadataEntries(log.spec?.metadata).length"
                class=":uno: flex flex-wrap gap-1.5"
              >
                <span
                  v-for="[key, value] in metadataEntries(log.spec?.metadata)"
                  :key="key"
                  class=":uno: rounded bg-slate-100 px-[7px] py-0.5 text-xs text-slate-500"
                >
                  {{ key }}={{ value }}
                </span>
              </div>
            </div>
          </template>

          <template v-if="canManageLogs && !isLogDeleting(log)" #dropdownItems>
            <VDropdownItem
              v-permission="[AI_CALL_LOGS_MANAGE_PERMISSION]"
              type="danger"
              :disabled="deleting || clearing"
              @click="deleteLog(log)"
            >
              删除
            </VDropdownItem>
          </template>
        </VEntity>
      </VEntityContainer>

      <template #footer>
        <VPagination
          v-model:page="page"
          v-model:size="pageSize"
          page-label="页"
          size-label="条 / 页"
          :total-label="`共 ${total} 项数据`"
          :total="total"
          :size-options="[10, 20, 50, 100]"
        />
      </template>
    </VCard>
  </div>
</template>

<style scoped>
.log-entity-list :deep(.entity-start-wrapper),
.log-entity-list :deep(.entity-end-wrapper) {
  vertical-align: top;
}

.log-entity-list :deep(.entity-end) {
  gap: 16px;
  row-gap: 6px;
}

@media (max-width: 560px) {
  .log-entity-list :deep(.entity-start),
  .log-entity-list :deep(.entity-end) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
