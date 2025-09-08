<template>
  <div class="polish-toolbar-item">
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
        class="polish-toolbar-btn"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <IconSparkles class="h-4 w-4" />
      </button>

      <template #popper>
        <div class="polish-dropdown" @click.stop>
          <!-- 使用说明 -->
          <div class="p-3">
            <VAlert
              type="info"
              title="AI文章润色"
              description="使用AI对选中的文本进行润色，改善语言表达和流畅性"
              :closable="false"
              class="text-xs"
            />
          </div>

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
                <div class="content-text" v-html="renderContent(originalContent)"></div>
              </div>
            </div>

            <!-- 分隔线 -->
            <div class="content-divider">
              <IconArrowRight />
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
                  <p>AI正在帮你润色，马上就好～</p>
                </div>

                <div v-else-if="polishedContent" class="content-text" v-html="renderContent(polishedContent)"></div>

                <div v-else class="empty-state">
                  <VEmpty
                    message="准备开始润色"
                    description="AI将为您优化选中的文本内容"
                  >
                    <template #actions>
                      <VButton
                        size="sm"
                        type="primary"
                        @click="handlePolish"
                        :disabled="loading"
                      >
                        <template #icon>
                          <IconSparkles />
                        </template>
                        开始润色
                      </VButton>
                    </template>
                  </VEmpty>
                </div>
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

          <!-- 替换状态提示 -->
          <div v-if="polishedContent && !loading" class="px-3 py-2 border-t border-gray-100">
            <div class="flex items-center gap-2 text-xs">
              <IconCheck v-if="canReplace" class="text-green-500" />
              <IconRefresh v-else class="text-orange-500" />
              <span :class="canReplace ? 'text-green-600' : 'text-orange-600'">
                {{ canReplace ? '可以替换原内容' : '原内容位置已改变，将尝试智能匹配替换' }}
              </span>
            </div>
          </div>

          <!-- 底部操作 -->
          <div v-if="polishedContent || loading" class="p-3 border-t border-gray-100">
            <div class="flex items-center justify-between gap-2">
              <!-- 左侧操作按钮 -->
              <div class="flex items-center gap-2">
                <VButton
                  size="sm"
                  type="danger"
                  @click="handleClear"
                >
                  <template #icon>
                    <IconTrash />
                  </template>
                  清空
                </VButton>

                <VButton
                  size="sm"
                  type="secondary"
                  @click="handleRepolish"
                  :disabled="loading"
                >
                  <template #icon>
                    <IconRefresh />
                  </template>
                  重新润色
                </VButton>
              </div>

              <!-- 右侧操作按钮 -->
              <div class="flex items-center gap-2">
                <VButton
                  size="sm"
                  type="secondary"
                  @click="handleCopy"
                >
                  <template #icon>
                    <IconCopy />
                  </template>
                  复制润色内容
                </VButton>

                <VButton
                  size="sm"
                  type="primary"
                  :disabled="!canReplace"
                  @click="handleReplace"
                >
                  <template #icon>
                    <IconCheck />
                  </template>
                  {{ canReplace ? '替换原内容' : '无法替换' }}
                </VButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  VButton,
  VDropdown,
  VAlert,
  VLoading,
  Toast
} from '@halo-dev/components'
import type { Editor } from '@tiptap/core'
import axios from 'axios'
import { marked } from 'marked'

// Icons
import IconSparkles from '~icons/lucide/sparkles'
import IconDocument from '~icons/lucide/file-text'
import IconArrowRight from '~icons/lucide/arrow-right'
import IconCopy from '~icons/lucide/clipboard'
import IconCheck from '~icons/lucide/refresh-cw'
import IconTrash from '~icons/lucide/trash-2'
import IconRefresh from '~icons/lucide/rotate-ccw'

interface Props {
  editor: Editor
  isActive?: boolean
  disabled?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  disabled: false,
  maxLength: 2000
})

// 响应式数据
const dropdownVisible = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const originalContent = ref('')
const polishedContent = ref('')
const selectedRange = ref<{ from: number; to: number } | null>(null)
const editorContent = ref('')

// 计算属性
const tooltipText = computed(() => {
  if (props.disabled) {
    return '请先选择要润色的文本片段'
  }
  return '润色选中文本 - 使用AI改善语言表达'
})

const canReplace = computed(() => {
  if (!polishedContent.value || !originalContent.value) {
    return false
  }

  // 检查当前选中内容是否匹配
  const selection = props.editor.state.selection
  if (!selection.empty) {
    const currentSelected = props.editor.state.doc.textBetween(selection.from, selection.to, '\n')
    return currentSelected.trim() === originalContent.value.trim()
  }

  // 检查保存的范围是否仍然有效
  if (selectedRange.value) {
    try {
      const currentDoc = props.editor.state.doc
      const rangeText = currentDoc.textBetween(selectedRange.value.from, selectedRange.value.to, '\n')
      return rangeText.trim() === originalContent.value.trim()
    } catch {
      return false
    }
  }

  // 检查智能匹配是否可能
  const currentContent = props.editor.getText()
  return currentContent.includes(originalContent.value.trim())
})

// 方法
const getSelectedContent = () => {
  const selection = props.editor.state.selection
  if (!selection.empty) {
    return props.editor.state.doc.textBetween(selection.from, selection.to, '\n')
  }
  return ''
}

const handleOpenDropdown = (visible: boolean) => {
  if (!visible) {
    dropdownVisible.value = false
    return
  }

  // 如果下拉框打开但没有内容，尝试获取选中文本
  if (!originalContent.value) {
    const content = getSelectedContent()
    if (content.trim()) {
      originalContent.value = content
      polishedContent.value = ''
      errorMessage.value = ''

      setTimeout(() => {
        handlePolish()
      }, 100)
    }
  }
}

const toggleDropdown = () => {
  if (!dropdownVisible.value) {
    const selection = props.editor.state.selection
    const content = getSelectedContent()

    if (!content.trim()) {
      Toast.warning('请先选择要润色的文本片段')
      return
    }

    if (content.length > props.maxLength) {
      Toast.warning(`选中内容过长（${content.length} 字符），请选择较短的文本片段（最多 ${props.maxLength} 字符）`)
      return
    }

    // 保存选中范围和编辑器内容
    selectedRange.value = {
      from: selection.from,
      to: selection.to
    }
    editorContent.value = props.editor.getHTML()
    originalContent.value = content
    polishedContent.value = ''
    errorMessage.value = ''

    dropdownVisible.value = true

    // 延迟开始润色
    setTimeout(() => {
      handlePolish()
    }, 100)
  } else {
    dropdownVisible.value = false
  }
}

const handlePolish = async () => {
  if (!originalContent.value || originalContent.value.trim().length === 0) {
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    polishedContent.value = ''

    const response = await axios.post('/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/polish', {
      content: originalContent.value
    })

    if (response.data.success) {
      polishedContent.value = response.data.polishedContent
      Toast.success('文章润色完成')
    } else {
      errorMessage.value = response.data.message || '润色失败'
      Toast.error('润色失败: ' + (response.data.message || '未知错误'))
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : '网络错误，请稍后重试'
    const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
    errorMessage.value = responseMessage || errorMsg
    Toast.error('润色失败: ' + (responseMessage || '网络错误'))
  } finally {
    loading.value = false
  }
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(polishedContent.value)
    Toast.success('润色内容已复制到剪贴板')
  } catch (error) {
    Toast.error('复制失败，请手动复制')
  }
}

const handleReplace = () => {
  if (!polishedContent.value) {
    Toast.warning('没有润色内容可替换')
    return
  }

  const selection = props.editor.state.selection
  let replaced = false

  // 方法1：如果当前有选中内容且与原始内容匹配，直接替换
  if (!selection.empty) {
    const currentSelected = props.editor.state.doc.textBetween(selection.from, selection.to, '\n')
    if (currentSelected.trim() === originalContent.value.trim()) {
      props.editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent(polishedContent.value)
        .run()
      replaced = true
    }
  }

  // 方法2：如果保存的选中范围仍然有效，使用范围替换
  if (!replaced && selectedRange.value) {
    try {
      const currentDoc = props.editor.state.doc
      const rangeText = currentDoc.textBetween(selectedRange.value.from, selectedRange.value.to, '\n')
      if (rangeText.trim() === originalContent.value.trim()) {
        props.editor
          .chain()
          .focus()
          .setTextSelection({ from: selectedRange.value.from, to: selectedRange.value.to })
          .deleteSelection()
          .insertContent(polishedContent.value)
          .run()
        replaced = true
      }
    } catch (error) {
      console.warn('范围替换失败:', error)
    }
  }

  // 方法3：智能文本匹配替换
  if (!replaced) {
    const currentContent = props.editor.getText()
    const originalText = originalContent.value.trim()
    const polishedText = polishedContent.value.trim()

    // 查找原始文本在编辑器中的位置
    const index = currentContent.indexOf(originalText)
    if (index !== -1) {
      // 计算在文档中的位置
      const beforeText = currentContent.substring(0, index)
      const from = beforeText.length
      const to = from + originalText.length

      try {
        props.editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .deleteSelection()
          .insertContent(polishedText)
          .run()
        replaced = true
      } catch (error) {
        console.warn('智能匹配替换失败:', error)
      }
    }
  }

  if (replaced) {
    Toast.success('内容已替换')
    dropdownVisible.value = false
  } else {
    Toast.warning('无法找到原始文本进行替换，请手动复制润色内容')
  }
}

/**
 * 渲染内容，支持 Markdown 和 HTML
 */
const renderContent = (content: string) => {
  if (!content) return ''

  // 检测是否为 HTML 内容
  const isHtml = /<[a-z][\s\S]*>/i.test(content)

  if (isHtml) {
    // 如果是 HTML，直接返回
    return content
  } else {
    // 如果是 Markdown，转换为 HTML
    try {
      return marked(content, {
        breaks: true,
        gfm: true
      })
    } catch (error) {
      console.warn('Markdown 解析失败:', error)
      return content
    }
  }
}

const handleClear = () => {
  polishedContent.value = ''
  errorMessage.value = ''
  loading.value = false
  Toast.success('润色结果已清空')
}

const handleRepolish = () => {
  polishedContent.value = ''
  errorMessage.value = ''
  handlePolish()
  Toast.success('开始重新润色')
}
</script>

<style scoped>
.polish-toolbar-item {
  display: inline-block;
}

.polish-toolbar-btn {
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

.polish-toolbar-btn:hover:not(:disabled) {
  color: #374151;
  background: transparent;
}

.polish-toolbar-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.polish-toolbar-btn:disabled:hover {
  background: transparent;
}

/* 润色下拉框样式 */
.polish-dropdown {
  width: 800px;
  max-height: 600px;
  overflow: hidden;
}

.content-comparison {
  display: grid;
  grid-template-columns: 1fr 40px 1fr;
  gap: 12px;
  height: 400px;
  padding: 0 12px;
}

.content-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.content-stats {
  font-size: 11px;
  color: #6b7280;
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

        .content-text {
          line-height: 1.5;
          color: #374151;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 12px;
        }

        /* Markdown 渲染样式 */
        .content-text :deep(h1),
        .content-text :deep(h2),
        .content-text :deep(h3),
        .content-text :deep(h4),
        .content-text :deep(h5),
        .content-text :deep(h6) {
          margin: 8px 0 4px 0;
          font-weight: 600;
          color: #374151;
        }

        .content-text :deep(h1) { font-size: 16px; }
        .content-text :deep(h2) { font-size: 15px; }
        .content-text :deep(h3) { font-size: 14px; }
        .content-text :deep(h4) { font-size: 13px; }
        .content-text :deep(h5) { font-size: 12px; }
        .content-text :deep(h6) { font-size: 12px; }

        .content-text :deep(p) {
          margin: 4px 0;
          line-height: 1.5;
        }

        .content-text :deep(ul),
        .content-text :deep(ol) {
          margin: 4px 0;
          padding-left: 16px;
        }

        .content-text :deep(li) {
          margin: 2px 0;
        }

        .content-text :deep(blockquote) {
          margin: 4px 0;
          padding: 4px 8px;
          border-left: 3px solid #3b82f6;
          background: #f9fafb;
          font-style: italic;
        }

        .content-text :deep(code) {
          background: #f9fafb;
          padding: 1px 4px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 11px;
        }

        .content-text :deep(pre) {
          background: #f9fafb;
          padding: 8px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 4px 0;
        }

        .content-text :deep(pre code) {
          background: none;
          padding: 0;
        }

        .content-text :deep(strong) {
          font-weight: 600;
        }

        .content-text :deep(em) {
          font-style: italic;
        }

        .content-text :deep(a) {
          color: #3b82f6;
          text-decoration: none;
        }

        .content-text :deep(a:hover) {
          text-decoration: underline;
        }

        .content-text :deep(table) {
          border-collapse: collapse;
          width: 100%;
          margin: 4px 0;
        }

        .content-text :deep(th),
        .content-text :deep(td) {
          border: 1px solid #e5e7eb;
          padding: 4px 8px;
          text-align: left;
        }

        .content-text :deep(th) {
          background: #f9fafb;
          font-weight: 600;
        }

.content-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 150px;
          gap: 12px;
          color: #6b7280;
        }


.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  padding: 20px;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .polish-dropdown {
    width: 90vw;
  }

  .content-comparison {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
  }

  .content-divider {
    transform: rotate(90deg);
  }
}
</style>
