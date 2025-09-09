<template>
  <div class="generate-toolbar-item">
    <VDropdown
      v-model:visible="dropdownVisible"
      :disabled="disabled"
      :triggers="['click']"
      :auto-close="false"
      :close-on-content-click="false"
      @update:visible="handleOpenDropdown"
    >
      <button
        v-tooltip="tooltipText"
        class="generate-toolbar-btn"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <IconEdit class="h-4 w-4" />
      </button>

      <template #popper>
        <div class="generate-dropdown" @click.stop>
          <!-- 使用说明 -->
          <div class="p-3">
            <VAlert
              type="info"
              title="AI文章生成"
              description="使用AI根据您的主题和要求生成文章内容，支持多种写作风格和格式"
              :closable="false"
              class="text-xs"
            />
          </div>

          <!-- 主要内容区域 -->
          <div class="generate-content">
            <!-- 左侧：文章主题区域 -->
            <div class="topic-section">
              <div class="section-header">
                <h4 class="section-title">
                  <IconEdit />
                  文章主题
                </h4>
              </div>
              <div class="section-content">
                <FormKit
                  type="form"
                  v-model="formData"
                  :actions="false"
                  @submit="handleGenerate"
                >
                  <FormKit 
                    name="topic" 
                    label="文章主题" 
                    type="textarea" 
                    placeholder="请输入文章主题或关键词，例如：人工智能的发展趋势"
                    :rows="6"
                    validation="required"
                  />
                  
                  <FormKitMessages />
                </FormKit>
              </div>
            </div>

            <!-- 右侧：生成设置区域 -->
            <div class="format-section">
              <div class="section-header">
                <h4 class="section-title">
                  <IconSparkles />
                  生成设置
                </h4>
              </div>
              <div class="section-content">
                <FormKit
                  type="form"
                  v-model="formData"
                  :actions="false"
                  @submit="handleGenerate"
                >
                  <FormKit 
                    name="format" 
                    label="内容格式" 
                    type="select"
                    :options="[
                      { label: '🌐 富文本', value: 'html' },
                      { label: '📝 Markdown', value: 'markdown' }
                     
                    ]"
                    :allow-create=true
                    placeholder="选择格式类型"
                  />
                  
                  <FormKit 
                    name="style" 
                    label="写作风格" 
                    type="select"
                    :options="styleOptions"
                    :allow-create=true
                    placeholder="选择写作风格"
                    :help="styleHelpText"
                  />
                  
                  <FormKit 
                    name="maxLength" 
                    label="生成长度" 
                    type="number"
                    value="2000"
                    :min="200"
                    :max="8000"
                    :step="100"
                    suffix="字符"
                  />
                  
                  <FormKitMessages />
                </FormKit>
              </div>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="p-3">
            <VAlert
              type="error"
              :title="errorMessage"
              closable
              @close="errorMessage = ''"
            />
          </div>

          <!-- 底部操作 -->
          <div class="p-3 border-t border-gray-100">
            <div class="flex items-center justify-end gap-2">
              <VButton
                size="sm"
                type="primary"
                :disabled="!formData.topic.trim() || loading"
                :loading="loading"
                @click="handleGenerate"
              >
                <template #icon>
                  <IconSparkles />
                </template>
                生成文章
              </VButton>
            </div>
          </div>
        </div>
      </template>
    </VDropdown>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/core'
import {
  VButton,
  VDropdown,
  Toast,
  VAlert
} from '@halo-dev/components'
import { FormKit, FormKitMessages } from '@formkit/vue'
import axios from 'axios'

// Icons
import IconSparkles from '~icons/lucide/sparkles'
import IconEdit from '~icons/lucide/edit-3'

interface Props {
  editor: Editor
  isActive?: boolean
  disabled?: boolean
}

interface GenerateResponse {
  success: boolean
  content?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  disabled: false
})

// 响应式数据
const dropdownVisible = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// 表单数据
const formData = ref({
  topic: '',
  format: 'html',
  style: '通俗易懂',
  maxLength: 2000
})

// 写作风格选项
const styleOptions = [
  { label: '通俗易懂', value: '通俗易懂' },
  { label: '正式学术', value: '正式学术' },
  { label: '新闻资讯', value: '新闻资讯' },
  { label: '技术文档', value: '技术文档' },
  { label: '创意文学', value: '创意文学' },
  { label: '幽默风趣', value: '幽默风趣' },
  { label: '严谨专业', value: '严谨专业' },
  { label: '轻松活泼', value: '轻松活泼' },
  { label: '商务正式', value: '商务正式' },
  { label: '科普教育', value: '科普教育' },
  { label: '个人博客', value: '个人博客' },
  { label: '产品介绍', value: '产品介绍' },
  { label: '教程指南', value: '教程指南' },
  { label: '评论分析', value: '评论分析' },
  { label: '故事叙述', value: '故事叙述' },
  { label: '对话访谈', value: '对话访谈' }
]

// 风格帮助信息
const styleHelpMap: Record<string, string> = {
  '通俗易懂': '用简单语言解释复杂概念，适合大众阅读',
  '正式学术': '严谨的学术写作风格，适合论文和研究报告',
  '新闻资讯': '客观、简洁的新闻报道风格，注重事实',
  '技术文档': '详细、准确的技术说明，适合开发者',
  '创意文学': '富有想象力的文学表达，语言优美',
  '幽默风趣': '轻松幽默的表达方式，增加趣味性',
  '严谨专业': '专业、权威的写作风格，适合商务场合',
  '轻松活泼': '轻松愉快的表达方式，亲和力强',
  '商务正式': '正式的商务写作风格，专业且礼貌',
  '科普教育': '通俗易懂的科学解释，适合教学',
  '个人博客': '个人化的写作风格，亲切自然',
  '产品介绍': '突出产品特点，吸引用户关注',
  '教程指南': '步骤清晰，易于跟随操作',
  '评论分析': '深入分析，提供独到见解',
  '故事叙述': '生动有趣的故事化表达',
  '对话访谈': '问答形式，互动性强'
}

// 计算属性
const tooltipText = computed(() => {
  if (props.disabled) {
    return '请先选择要生成的位置'
  }
  return 'AI文章生成 - 根据主题生成文章内容'
})

const canGenerate = computed(() => {
  return formData.value.topic.trim().length > 0 && 
         formData.value.topic.length <= 1000 && 
         !loading.value
})

// 风格帮助文本计算属性
const styleHelpText = computed(() => {
  const style = formData.value.style
  if (!style) {
    return '选择或输入写作风格，将影响生成文章的语言风格和表达方式'
  }
  return styleHelpMap[style] || '自定义写作风格，将按照您的描述生成文章'
})

// 方法
const handleOpenDropdown = (visible: boolean) => {
  if (!visible) {
    dropdownVisible.value = false
    return
  }
  
  // 重置表单和状态
  resetForm()
  dropdownVisible.value = true
}

const toggleDropdown = () => {
  if (!dropdownVisible.value) {
    resetForm()
    dropdownVisible.value = true
  } else {
    dropdownVisible.value = false
  }
}

const resetForm = () => {
  formData.value = {
    topic: '',
    format: 'html',
    style: '通俗易懂',
    maxLength: 2000
  }
  errorMessage.value = ''
}

const handleGenerate = async () => {
  if (!canGenerate.value) return

  try {
    loading.value = true
    errorMessage.value = ''

    const response = await generateContent()
    
    if (response.success && response.content) {
      // 直接插入生成的内容到编辑器
      props.editor.chain().focus().insertContent(response.content).run()
      Toast.success('文章生成完成并已插入到编辑器')
      dropdownVisible.value = false
    } else {
      errorMessage.value = response.message || '生成失败'
      Toast.error(errorMessage.value)
    }
  } catch (error) {
    console.error('生成失败:', error)
    const errorMsg = error instanceof Error ? error.message : '生成失败，请稍后重试'
    errorMessage.value = errorMsg
    Toast.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const generateContent = async (): Promise<GenerateResponse> => {
  const baseUrl = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'
  
  return await axios.post(`${baseUrl}/generate/article`, {
    topic: formData.value.topic,
    format: formData.value.format,
    style: formData.value.style,
    type: 'full',
    maxLength: formData.value.maxLength
  }).then(res => res.data)
}

</script>

<style scoped>
.generate-toolbar-item {
  display: inline-block;
}

.generate-toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.generate-toolbar-btn:hover:not(:disabled) {
  color: #374151;
  background: transparent;
}

.generate-toolbar-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.generate-toolbar-btn:disabled:hover {
  background: transparent;
}

/* 生成下拉框样式 */
.generate-dropdown {
  width: 800px;
  max-height: 600px;
  overflow: hidden;
}

.generate-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 400px;
  padding: 12px;
}

.topic-section,
.format-section {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.section-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}





/* 响应式设计 */
@media (max-width: 768px) {
  .generate-dropdown {
    width: 90vw;
  }

  .generate-content {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>