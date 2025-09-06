<template>
  <div class="polish-toolbar-item">
    <VButton
      v-tooltip="tooltipText"
      :class="buttonClass"
      :disabled="disabled"
      size="sm"
      @click="handleClick"
    >
      <IconSparkles />
    </VButton>
    
    <!-- 润色对话框 -->
    <ArticlePolishDialog
      v-model:visible="dialogVisible"
      :content="selectedContent"
      :max-length="maxLength"
      @replace-content="handleReplaceContent"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { VButton, Toast } from '@halo-dev/components'
import type { Editor } from '@tiptap/core'
import ArticlePolishDialog from './ArticlePolishDialog.vue'

// Icons
import IconSparkles from '~icons/lucide/sparkles'

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
const dialogVisible = ref(false)
const selectedContent = ref('')

// 计算属性
const buttonClass = computed(() => ({
  'toolbar-button': true,
  'toolbar-button--active': props.isActive,
  'toolbar-button--disabled': props.disabled
}))

const tooltipText = computed(() => {
  if (props.disabled) {
    return '请先选择要润色的文本片段'
  }
  return '润色选中文本 - 使用AI改善语言表达'
})

// 方法
const handleClick = () => {
  if (props.disabled) return

  // 获取选中的文本
  const selection = props.editor.state.selection
  let content = ''

  if (!selection.empty) {
    // 如果有选中文本，使用选中的内容
    content = props.editor.state.doc.textBetween(selection.from, selection.to, '\n')
  } else {
    // 如果没有选中文本，提示用户选择
    Toast.warning('请先选择要润色的文本片段')
    return
  }

  if (!content.trim()) {
    Toast.warning('选中的内容为空，请选择有效的文本')
    return
  }

  // 检查内容长度
  if (content.length > props.maxLength) {
    Toast.warning(`选中内容过长（${content.length} 字符），请选择较短的文本片段（最多 ${props.maxLength} 字符）`)
    return
  }

  selectedContent.value = content
  dialogVisible.value = true
}

const handleReplaceContent = (newContent: string) => {
  const selection = props.editor.state.selection

  if (!selection.empty) {
    // 替换选中的文本
    props.editor
      .chain()
      .focus()
      .deleteSelection()
      .insertContent(newContent)
      .run()
  }
}
</script>

<style scoped>
.polish-toolbar-item {
  display: inline-block;
}

.toolbar-button {
  --button-bg: transparent;
  --button-bg-hover: var(--halo-bg-color-secondary);
  --button-border: 1px solid transparent;
  --button-border-hover: 1px solid var(--halo-border-color);
  
  background: var(--button-bg);
  border: var(--button-border);
  border-radius: 6px;
  color: var(--halo-text-color);
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-button:hover:not(.toolbar-button--disabled) {
  background: var(--button-bg-hover);
  border: var(--button-border-hover);
  color: var(--halo-primary-color);
}

.toolbar-button--active {
  --button-bg: var(--halo-primary-color);
  --button-bg-hover: var(--halo-primary-hover-color);
  color: white;
}

.toolbar-button--active:hover {
  background: var(--button-bg-hover);
}

.toolbar-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-button :deep(.v-button__content) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
