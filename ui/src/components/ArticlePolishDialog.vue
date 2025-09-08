<template>
  <VDialog
    v-model:visible="dialogVisible"
    title="文章润色"
    width="1000px"
    height="700px"
    @close="handleClose"
  >
    <div class="polish-dialog">
      <!-- 错误提示 -->
      <VAlert
        v-if="errorMessage"
        type="error"
        :title="errorMessage"
        closable
        @close="errorMessage = ''"
      />

      <!-- 内容对比区域 -->
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
            <div class="content-text">
              {{ originalContent }}
            </div>
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
            </div>
          </div>
          <div class="panel-content">
            <div v-if="loading" class="loading-state">
              <VLoading />
              <p>AI正在润色您的文章，请稍候...</p>
            </div>
            
            <div v-else-if="polishedContent" class="content-text">
              {{ polishedContent }}
            </div>
            
            <div v-else class="empty-state">
              <IconSparkles />
              <p>等待润色结果...</p>
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

const loading = ref(false)
const errorMessage = ref('')
const originalContent = ref('')
const polishedContent = ref('')

// 监听器
watch(() => props.visible, (visible) => {
  console.log('润色对话框可见性变化:', visible)
  if (visible) {
    console.log('重置对话框，内容:', props.content)
    resetDialog()
    originalContent.value = props.content
    // 自动开始润色
    handlePolish()
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
  console.log('开始润色，内容:', originalContent.value)
  
  if (!originalContent.value || originalContent.value.trim().length === 0) {
    console.log('内容为空，跳过润色')
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    polishedContent.value = ''

    console.log('发送润色请求到:', '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/polish')
    console.log('请求内容:', originalContent.value)

    const response = await axios.post('/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/polish', {
      content: originalContent.value
    })

    console.log('润色响应:', response.data)

    if (response.data.success) {
      polishedContent.value = response.data.polishedContent
      Toast.success('文章润色完成')
    } else {
      errorMessage.value = response.data.message || '润色失败'
      Toast.error('润色失败: ' + (response.data.message || '未知错误'))
    }
  } catch (error: any) {
    console.error('润色请求失败:', error)
    console.error('错误详情:', error.response?.data)
    errorMessage.value = error.response?.data?.message || '网络错误，请稍后重试'
    Toast.error('润色失败: ' + (error.response?.data?.message || '网络错误'))
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
</script>

<style scoped>
.polish-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-comparison {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  gap: 16px;
  height: 500px;
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

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.content-text {
  line-height: 1.6;
  color: var(--halo-text-color);
  white-space: pre-wrap;
  word-wrap: break-word;
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
  color: var(--halo-text-color-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
  color: var(--halo-text-color-secondary);
}

.empty-state svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
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