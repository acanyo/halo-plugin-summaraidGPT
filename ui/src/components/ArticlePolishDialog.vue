<template>
  <VDialog
    v-model:visible="dialogVisible"
    :title="dialogTitle"
    width="900px"
    height="600px"
    @close="handleClose"
  >
    <div class="polish-dialog">
      <!-- 内容长度提示 -->
      <VAlert
        v-if="isContentTooLong"
        type="warning"
        title="内容过长提示"
        :description="`当前选中内容长度为 ${originalContent.length} 字符，超过最大限制 ${maxLength} 字符。请选择较短的文本片段进行润色。`"
        closable
        @close="handleClose"
      />

      <!-- 错误提示 -->
      <VAlert
        v-if="errorMessage"
        type="error"
        :title="errorMessage"
        closable
        @close="errorMessage = ''"
      />

      <!-- 内容对比区域 -->
      <div v-if="!isContentTooLong" class="polish-dialog__content">
        <div class="content-comparison">
          <!-- 原始内容 -->
          <div class="content-panel original-panel">
            <div class="panel-header">
              <h4 class="panel-title">
                <IconDocument />
                原始内容
              </h4>
              <div class="content-stats">
                字数: {{ originalContent.length }}
              </div>
            </div>
            <div class="panel-content">
              <div 
                class="content-display original-content"
                v-html="formatContent(originalContent)"
              />
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="content-divider">
            <IconArrowRight v-if="!loading" />
            <VLoading v-else />
          </div>

          <!-- 润色后内容 -->
          <div class="content-panel polished-panel">
            <div class="panel-header">
              <h4 class="panel-title">
                <IconSparkles />
                润色后内容
              </h4>
              <div class="content-stats" v-if="polishedContent">
                字数: {{ polishedContent.length }}
                <span class="diff-indicator" :class="lengthDiffClass">
                  ({{ lengthDiff }})
                </span>
              </div>
            </div>
            <div class="panel-content">
              <VEmpty
                v-if="!polishedContent && !loading"
                title="等待润色"
                description="点击下方按钮开始润色选中的文本"
              >
                <template #image>
                  <IconSparkles />
                </template>
              </VEmpty>
              
              <div 
                v-else-if="polishedContent"
                class="content-display polished-content"
                v-html="formatContent(polishedContent)"
              />
              
              <div v-else-if="loading" class="loading-placeholder">
                <VLoading />
                <p>AI正在润色您的文章，请稍候...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <VButton @click="handleClose">
          取消
        </VButton>
        
        <VButton
          v-if="!isContentTooLong && !polishedContent"
          type="primary"
          :loading="loading"
          :disabled="!canPolish"
          @click="handlePolish"
        >
          <IconSparkles />
          {{ loading ? '润色中...' : '开始润色' }}
        </VButton>
        
        <VButton
          v-if="polishedContent"
          type="secondary"
          @click="handleCopy"
        >
          <IconCopy />
          复制润色内容
        </VButton>
        
        <VButton
          v-if="polishedContent"
          type="primary"
          @click="handleReplace"
        >
          <IconCheck />
          替换原内容
        </VButton>
      </div>
    </template>
  </VDialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import {
  VDialog,
  VButton,
  VAlert,
  VEmpty,
  VLoading,
  Toast
} from '@halo-dev/components'
import axios from 'axios'

// Icons
import IconSparkles from '~icons/lucide/sparkles'
import IconDocument from '~icons/lucide/file-text'
import IconArrowRight from '~icons/lucide/arrow-right'
import IconCopy from '~icons/lucide/copy'
import IconCheck from '~icons/lucide/check'

interface Props {
  visible: boolean
  content: string
  maxLength?: number
}

interface Emits {
  'update:visible': [visible: boolean]
  'replace-content': [newContent: string]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  content: '',
  maxLength: 2000
})

const emit = defineEmits<Emits>()

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const dialogTitle = '文章润色'
const loading = ref(false)
const errorMessage = ref('')
const originalContent = ref('')
const polishedContent = ref('')

// 计算属性
const isContentTooLong = computed(() => {
  return originalContent.value.length > props.maxLength
})

const canPolish = computed(() => {
  return originalContent.value.trim().length > 0 && !loading.value && !isContentTooLong.value
})

const lengthDiff = computed(() => {
  if (!polishedContent.value) return 0
  const diff = polishedContent.value.length - originalContent.value.length
  return diff > 0 ? `+${diff}` : diff.toString()
})

const lengthDiffClass = computed(() => {
  const diff = polishedContent.value.length - originalContent.value.length
  if (diff > 0) return 'diff-positive'
  if (diff < 0) return 'diff-negative'
  return 'diff-neutral'
})

// 监听器
watch(() => props.visible, (visible) => {
  if (visible) {
    resetDialog()
    originalContent.value = props.content
  }
})

// 方法
const resetDialog = () => {
  polishedContent.value = ''
  errorMessage.value = ''
  loading.value = false
}

const handleClose = () => {
  emit('update:visible', false)
}

const handlePolish = async () => {
  if (!canPolish.value) return

  try {
    loading.value = true
    errorMessage.value = ''

    const response = await axios.post('/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/polish', {
      content: originalContent.value
    })

    if (response.data.success) {
      polishedContent.value = response.data.polishedContent
      Toast.success('文章润色完成')
    } else {
      errorMessage.value = response.data.message || '润色失败'
    }
  } catch (error: any) {
    console.error('润色请求失败:', error)
    errorMessage.value = error.response?.data?.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(polishedContent.value)
    Toast.success('润色内容已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    Toast.error('复制失败，请手动复制')
  }
}

const handleReplace = () => {
  emit('replace-content', polishedContent.value)
  Toast.success('内容已替换')
  handleClose()
}

const formatContent = (content: string) => {
  // 简单的HTML格式化，保持换行
  return content
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/, '<p>$1</p>')
}
</script>

<style scoped>
.polish-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.polish-dialog__content {
  flex: 1;
  overflow: hidden;
}

.content-comparison {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  gap: 16px;
  height: 100%;
}

.content-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--halo-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--halo-bg-color-secondary);
  border-bottom: 1px solid var(--halo-border-color);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--halo-text-color);
}

.content-stats {
  font-size: 12px;
  color: var(--halo-text-color-secondary);
}

.diff-indicator {
  font-weight: 500;
}

.diff-positive {
  color: var(--halo-success-color);
}

.diff-negative {
  color: var(--halo-warning-color);
}

.diff-neutral {
  color: var(--halo-text-color-secondary);
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.content-display {
  line-height: 1.6;
  color: var(--halo-text-color);
}

.content-display :deep(p) {
  margin-bottom: 12px;
}

.content-display :deep(p:last-child) {
  margin-bottom: 0;
}

.original-content {
  background: var(--halo-bg-color);
}

.polished-content {
  background: var(--halo-success-bg-color);
  border-radius: 4px;
  padding: 12px;
}

.content-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--halo-text-color-secondary);
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
  color: var(--halo-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-comparison {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .content-divider {
    transform: rotate(90deg);
  }
  
  .dialog-footer {
    flex-direction: column-reverse;
  }
}
</style>
