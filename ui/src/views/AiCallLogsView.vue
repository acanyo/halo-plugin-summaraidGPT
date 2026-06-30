<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Dialog,
  IconRefreshLine,
  Toast,
  VButton,
  VEmpty,
  VLoading,
  VPageHeader,
  VSpace,
  VStatusDot,
  VTag,
} from '@halo-dev/components'
import RiDeleteBinLine from '~icons/ri/delete-bin-line'
import RiFileList3Line from '~icons/ri/file-list-3-line'
import RiFilter3Line from '~icons/ri/filter-3-line'
import RiPulseLine from '~icons/ri/pulse-line'
import {
  aiCallLogApi,
  type AiCallLog,
  type ListAiCallLogsParams,
} from '@/api/ai-call-logs'

const loading = ref(false)
const deleting = ref(false)
const logs = ref<AiCallLog[]>([])

const filters = reactive({
  operation: '',
  modelType: '',
  success: '',
  limit: 50,
})

const failedCount = computed(() => logs.value.filter((item) => item.spec?.success === false).length)
const successCount = computed(() => logs.value.filter((item) => item.spec?.success === true).length)
const averageDuration = computed(() => {
  const durations = logs.value
    .map((item) => item.spec?.durationMillis)
    .filter((value): value is number => typeof value === 'number')
  if (!durations.length) return 0
  return Math.round(durations.reduce((total, value) => total + value, 0) / durations.length)
})

const latestError = computed(() =>
  logs.value.find((item) => item.spec?.success === false && item.spec?.errorMessage)?.spec,
)

const loadLogs = async () => {
  loading.value = true
  try {
    const params: ListAiCallLogsParams = {
      limit: filters.limit,
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
    logs.value = await aiCallLogApi.list(params)
  } catch (error) {
    Toast.error('AI 调用日志加载失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  filters.operation = ''
  filters.modelType = ''
  filters.success = ''
  filters.limit = 50
  await loadLogs()
}

const deleteLog = (log: AiCallLog) => {
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
  return new Date(value).toLocaleString()
}

const metadataEntries = (metadata?: Record<string, string>) =>
  Object.entries(metadata || {}).filter(([, value]) => value !== undefined && value !== null)

onMounted(loadLogs)
</script>

<template>
  <VPageHeader title="AI 调用日志">
    <template #icon>
      <RiFileList3Line class="mr-2 self-center" />
    </template>
    <template #actions>
      <VSpace>
        <VButton type="secondary" :loading="loading" @click="loadLogs">
          <template #icon>
            <IconRefreshLine class="h-full w-full" />
          </template>
          刷新
        </VButton>
      </VSpace>
    </template>
  </VPageHeader>

  <div class="ai-log-container">
    <div class="metric-grid">
      <div class="metric-card">
        <span class="metric-label">本页调用</span>
        <strong>{{ logs.length }}</strong>
      </div>
      <div class="metric-card metric-card-success">
        <span class="metric-label">成功</span>
        <strong>{{ successCount }}</strong>
      </div>
      <div class="metric-card metric-card-error">
        <span class="metric-label">失败</span>
        <strong>{{ failedCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">平均耗时</span>
        <strong>{{ formatDuration(averageDuration) }}</strong>
      </div>
    </div>

    <div v-if="latestError" class="latest-error">
      <RiPulseLine />
      <div>
        <strong>最近失败：{{ operationText(latestError.operation) }}</strong>
        <p>{{ latestError.errorType || 'Error' }}：{{ latestError.errorMessage }}</p>
      </div>
    </div>

    <div class="filter-panel">
      <div class="filter-title">
        <RiFilter3Line />
        <span>筛选</span>
      </div>
      <div class="filter-controls">
        <select v-model="filters.operation" class="filter-input" @change="loadLogs">
          <option value="">全部调用</option>
          <option value="text-generate">文本生成</option>
          <option value="chat-generate">对话生成</option>
          <option value="stream-chat">流式对话</option>
          <option value="rag-embed-values">批量向量化</option>
          <option value="rag-embed-query">查询向量化</option>
          <option value="rag-rerank">Rerank 精排</option>
          <option value="rag-generate-answer">RAG 回答</option>
          <option value="rag-stream-answer">RAG 流式回答</option>
        </select>
        <select v-model="filters.modelType" class="filter-input" @change="loadLogs">
          <option value="">全部模型</option>
          <option value="language">语言模型</option>
          <option value="embedding">向量模型</option>
          <option value="rerank">精排模型</option>
        </select>
        <select v-model="filters.success" class="filter-input" @change="loadLogs">
          <option value="">全部状态</option>
          <option value="true">成功</option>
          <option value="false">失败</option>
        </select>
        <select v-model.number="filters.limit" class="filter-input filter-limit" @change="loadLogs">
          <option :value="20">20 条</option>
          <option :value="50">50 条</option>
          <option :value="100">100 条</option>
          <option :value="200">200 条</option>
        </select>
        <VButton size="sm" type="secondary" @click="resetFilters">重置</VButton>
      </div>
    </div>

    <VLoading v-if="loading" />
    <VEmpty
      v-else-if="logs.length === 0"
      title="暂无 AI 调用日志"
      message="触发摘要、标签、RAG 索引或问答后会在这里记录调用诊断信息"
    />

    <div v-else class="log-list">
      <div v-for="log in logs" :key="log.metadata.name" class="log-item">
        <div class="log-main">
          <div class="log-head">
            <VStatusDot
              :state="log.spec?.success === false ? 'error' : 'success'"
              :text="log.spec?.success === false ? '失败' : '成功'"
            />
            <strong>{{ operationText(log.spec?.operation) }}</strong>
            <VTag size="sm">{{ modelTypeText(log.spec?.modelType) }}</VTag>
            <span class="log-time">{{ formatDate(log.spec?.startedAt || log.metadata.creationTimestamp) }}</span>
          </div>

          <div class="log-meta">
            <span>模型：{{ log.spec?.modelName || '&lt;default&gt;' }}</span>
            <span>耗时：{{ formatDuration(log.spec?.durationMillis) }}</span>
            <span>输入：{{ formatNumber(log.spec?.inputCount) }} 项 / {{ formatNumber(log.spec?.inputChars) }} 字符</span>
            <span v-if="log.spec?.outputChars !== undefined">
              输出：{{ formatNumber(log.spec?.outputCount) }} 项 / {{ formatNumber(log.spec?.outputChars) }} 字符
            </span>
            <span v-if="log.spec?.candidateCount !== undefined">
              候选：{{ formatNumber(log.spec?.candidateCount) }}
            </span>
            <span v-if="log.spec?.sourceCount !== undefined">
              来源：{{ formatNumber(log.spec?.sourceCount) }}
            </span>
          </div>

          <div v-if="log.spec?.success === false" class="log-error">
            {{ log.spec?.errorType || 'Error' }}：{{ log.spec?.errorMessage || '未知错误' }}
          </div>

          <div v-if="metadataEntries(log.spec?.metadata).length" class="metadata-row">
            <span v-for="[key, value] in metadataEntries(log.spec?.metadata)" :key="key">
              {{ key }}={{ value }}
            </span>
          </div>
        </div>

        <button
          class="delete-btn"
          type="button"
          title="删除"
          :disabled="deleting"
          @click="deleteLog(log)"
        >
          <RiDeleteBinLine />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-log-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.metric-label {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;
}

.metric-card strong {
  color: #0f172a;
  font-size: 22px;
  line-height: 1;
}

.metric-card-success strong {
  color: #059669;
}

.metric-card-error strong {
  color: #dc2626;
}

.latest-error {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
}

.latest-error svg {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  margin-top: 1px;
}

.latest-error strong {
  color: #7f1d1d;
  font-size: 13px;
}

.latest-error p {
  margin: 4px 0 0;
  color: #b91c1c;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-word;
}

.filter-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.filter-title svg {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.filter-input {
  min-width: 128px;
  padding: 7px 10px;
  color: #1e293b;
  font-size: 13px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
}

.filter-input:focus {
  background: #fff;
  border-color: #2563eb;
}

.filter-limit {
  min-width: 96px;
}

.log-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.log-item:last-child {
  border-bottom: none;
}

.log-main {
  flex: 1;
  min-width: 0;
}

.log-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.log-head strong {
  color: #0f172a;
  font-size: 14px;
}

.log-time {
  color: #94a3b8;
  font-size: 12px;
}

.log-meta,
.metadata-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.log-meta span,
.metadata-row span {
  padding: 3px 7px;
  color: #475569;
  font-size: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.log-error {
  margin-top: 10px;
  padding: 9px 10px;
  color: #b91c1c;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-word;
  background: #fef2f2;
  border-radius: 8px;
}

.metadata-row {
  margin-top: 8px;
}

.metadata-row span {
  color: #64748b;
  background: #f1f5f9;
  border-color: transparent;
}

.delete-btn {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
}

.delete-btn:hover {
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
}

.delete-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 900px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-controls {
    justify-content: flex-start;
  }
}

@media (max-width: 560px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .filter-input {
    width: 100%;
  }

  .log-item {
    gap: 10px;
    padding: 12px;
  }
}
</style>
