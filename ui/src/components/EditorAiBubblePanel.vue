<template>
  <div
    ref="panelRef"
    class="editor-ai-bubble-panel"
    :class="[`direction-${expandDirection}`]"
    :style="{ '--panel-max-height': `${panelMaxHeight}px` }"
    @click.stop
  >
    <div class="panel-head">
      <div class="head-title-wrap">
        <div class="head-badge">AI 助手</div>
        <div class="head-title">针对选中文本即时处理</div>
      </div>
      <div class="head-meta" v-if="selectedText">{{ selectedText.length }} 字</div>
    </div>

    <div v-if="selectedText" class="selection-preview">
      <div class="preview-label">当前选中</div>
      <div class="preview-text">{{ selectedPreview }}</div>
    </div>

    <div class="prompt-box">
      <textarea
        ref="instructionInputRef"
        v-model="instruction"
        class="prompt-input"
        rows="1"
        :disabled="loading"
        :placeholder="selectedText ? '直接告诉 AI 你要它怎么处理这段文字' : '请先在编辑器中选中一段文字'"
        @keydown.enter.exact.prevent="handleSend"
        @input="resizeInstructionInput"
      />
      <button
        class="send-button"
        :disabled="loading || !canSend"
        @click="handleSend"
      >
        <span v-if="loading">...</span>
        <span v-else>发送</span>
      </button>
    </div>

    <div class="quick-actions">
      <button
        v-for="item in quickActions"
        :key="item.label"
        class="quick-action"
        :disabled="loading"
        @click="runQuickAction(item.prompt)"
      >
        {{ item.label }}
      </button>
    </div>

    <VAlert
      v-if="errorMessage"
      class="panel-alert"
      type="error"
      :title="errorMessage"
      :closable="false"
    />

    <div v-else-if="loading && !resultText" class="content-box state-box">
      <VLoading />
      <span>AI 正在思考...</span>
    </div>

    <div v-else-if="resultText" class="content-box result-box">
      <div class="result-label">处理结果</div>
      <div class="result-text">
        {{ resultText }}
        <span v-if="loading" class="typing-caret"></span>
      </div>
    </div>

    <div v-else class="content-box empty-box">
      <div class="empty-title">怎么用更顺手</div>
      <div class="empty-text">先点一个快捷动作，或者直接输入要求，比如“润色得更口语一点”或“继续写两段”。</div>
    </div>

    <div class="footer-row" :class="{ compact: !resultText }">
      <VButton size="sm" type="secondary" :disabled="!resultText" @click="copyResult">
        复制
      </VButton>
      <VButton size="sm" type="secondary" :disabled="!resultText" @click="insertAfter">
        插到后面
      </VButton>
      <VButton size="sm" type="primary" :disabled="!resultText" @click="replaceSelection">
        替换选中内容
      </VButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Toast, VAlert, VButton, VLoading } from '@halo-dev/components'
import {
  bubbleEditor,
  bubbleSelectedRange,
  bubbleSelectedText,
} from '@/extensions/editor-ai-bubble-state'

const instruction = ref('')
const loading = ref(false)
const errorMessage = ref('')
const resultText = ref('')
const panelRef = ref<HTMLElement>()
const instructionInputRef = ref<HTMLTextAreaElement>()
const expandDirection = ref<'up' | 'down'>('down')
const panelMaxHeight = ref(248)

const selectedText = computed(() => bubbleSelectedText.value)
const selectedPreview = computed(() => {
  const text = selectedText.value.replace(/\s+/g, ' ').trim()
  return text.length > 88 ? `${text.slice(0, 88)}...` : text
})
const canSend = computed(() => selectedText.value.trim() && instruction.value.trim())

const quickActions = [
  { label: '继续写', prompt: '请基于这段内容继续往下写，保持语气和主题一致。' },
  { label: '润色', prompt: '请润色这段内容，让表达更自然流畅。' },
  { label: '改写', prompt: '请改写这段内容，保持原意不变但表达更好。' },
  { label: '精简', prompt: '请把这段内容精简一些，保留关键信息。' },
  { label: '总结', prompt: '请总结这段内容的核心观点。' },
]

const recomputePlacement = () => {
  nextTick(() => {
    const el = panelRef.value
    if (!el) {
      return
    }

    const rect = el.getBoundingClientRect()
    const margin = 20
    const estimatedToolbarHeight = 56
    const availableBelow = window.innerHeight - rect.top - margin
    const availableAbove = rect.bottom - margin - estimatedToolbarHeight

    if (availableBelow < 260 && availableAbove > availableBelow) {
      expandDirection.value = 'up'
      panelMaxHeight.value = Math.max(176, Math.min(availableAbove, 340))
      return
    }

    expandDirection.value = 'down'
    panelMaxHeight.value = Math.max(176, Math.min(availableBelow, 340))
  })
}

const resizeInstructionInput = () => {
  nextTick(() => {
    const el = instructionInputRef.value
    if (!el) {
      return
    }

    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, 84)}px`
  })
}

const buildPrompt = (userInstruction: string) => {
  return `你是一个专业的中文写作助手。请根据下面的要求处理已选中的文本，并直接返回处理结果，不要解释。\n\n处理要求：\n${userInstruction}\n\n已选中文本：\n${selectedText.value}`
}

const extractAiResponse = (raw: string) => {
  if (!raw) {
    return ''
  }

  const trimmed = raw.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return trimmed
  }

  try {
    const parsed = JSON.parse(trimmed)

    if (Array.isArray(parsed?.content)) {
      return parsed.content
        .filter((item: any) => item?.type === 'text')
        .map((item: any) => item?.text || '')
        .join('')
        .trim()
    }

    const openAiContent = parsed?.choices?.[0]?.message?.content
    if (typeof openAiContent === 'string') {
      return openAiContent.trim()
    }

    const zhipuContent = parsed?.data?.choices?.[0]?.content
    if (typeof zhipuContent === 'string') {
      return zhipuContent.trim()
    }

    return trimmed
  } catch {
    return trimmed
  }
}

const streamConversation = async (prompt: string) => {
  const response = await fetch('/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/conversationStream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationHistory: JSON.stringify([
        {
          role: 'user',
          content: prompt,
        },
      ]),
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let streamedText = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    const chunk = decoder.decode(value, { stream: true })
    if (chunk.startsWith('ERROR:')) {
      throw new Error(chunk.replace(/^ERROR:\s*/, '').trim())
    }

    streamedText += chunk
    resultText.value = streamedText
  }
}

const submit = async (userInstruction: string) => {
  if (!selectedText.value.trim()) {
    errorMessage.value = '请先选择要处理的文本片段'
    return
  }

  if (!userInstruction.trim()) {
    errorMessage.value = '请先输入你希望 AI 做什么'
    return
  }

  loading.value = true
  errorMessage.value = ''
  resultText.value = ''

  try {
    await streamConversation(buildPrompt(userInstruction))
    resultText.value = extractAiResponse(resultText.value)
  } catch (error: any) {
    errorMessage.value = error?.message || 'AI 处理失败'
    Toast.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

const handleSend = async () => {
  await submit(instruction.value)
}

const runQuickAction = async (prompt: string) => {
  instruction.value = prompt
  await submit(prompt)
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(resultText.value)
    Toast.success('已复制到剪贴板')
  } catch {
    Toast.error('复制失败')
  }
}

const replaceSelection = () => {
  const editor = bubbleEditor.value
  const range = bubbleSelectedRange.value
  const text = resultText.value.trim()

  if (!editor || !range || !text) {
    Toast.warning('当前没有可替换的内容')
    return
  }

  const current = editor.state.doc.textBetween(range.from, range.to, '\n').trim()
  if (current !== selectedText.value.trim()) {
    Toast.warning('选中文本已变化，请重新选择后再操作')
    return
  }

  editor.chain().focus().deleteRange(range).insertContentAt(range.from, text).run()
  Toast.success('已替换选中内容')
}

const insertAfter = () => {
  const editor = bubbleEditor.value
  const range = bubbleSelectedRange.value
  const text = resultText.value.trim()

  if (!editor || !range || !text) {
    Toast.warning('当前没有可插入的内容')
    return
  }

  editor.chain().focus().insertContentAt(range.to, `\n${text}`).run()
  Toast.success('已插入到选中文本后')
}

onMounted(() => {
  recomputePlacement()
  resizeInstructionInput()
  window.addEventListener('resize', recomputePlacement)
  window.addEventListener('scroll', recomputePlacement, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', recomputePlacement)
  window.removeEventListener('scroll', recomputePlacement, true)
})

watch(instruction, () => {
  resizeInstructionInput()
})
</script>

<style scoped>
.editor-ai-bubble-panel {
  width: 396px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 22px;
  background: rgba(250, 250, 252, 0.88);
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.14),
    0 6px 18px rgba(0, 0, 0, 0.08);
  backdrop-filter: saturate(180%) blur(24px);
  font-family: 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.editor-ai-bubble-panel.direction-up {
  transform: translateY(calc(-100% - 58px));
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.head-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.head-badge {
  width: fit-content;
  border-radius: 980px;
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: -0.08px;
}

.head-title {
  font-size: 12px;
  line-height: 1.33;
  letter-spacing: -0.12px;
  color: rgba(0, 0, 0, 0.48);
}

.head-meta {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.33;
  letter-spacing: -0.12px;
  color: rgba(0, 0, 0, 0.8);
}

.prompt-box {
  display: flex;
  gap: 8px;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.selection-preview {
  border-radius: 16px;
  background: rgba(245, 245, 247, 0.92);
  padding: 10px 12px;
}

.preview-label {
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.48);
  letter-spacing: -0.08px;
}

.preview-text {
  font-size: 12px;
  line-height: 1.47;
  letter-spacing: -0.12px;
  color: #1d1d1f;
}

.prompt-input {
  flex: 1;
  min-height: 38px;
  max-height: 84px;
  resize: none;
  overflow-y: auto;
  border: 0;
  border-radius: 14px;
  padding: 8px 10px;
  outline: none;
  font: inherit;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.47;
  letter-spacing: -0.374px;
  color: #1d1d1f;
  background: transparent;
}

.prompt-input::-webkit-scrollbar {
  display: none;
}

.prompt-input {
  scrollbar-width: none;
}

.prompt-input:focus {
  background: rgba(255, 255, 255, 0.4);
}

.send-button {
  height: 38px;
  min-width: 58px;
  border: 0;
  border-radius: 980px;
  background: #0071e3;
  color: #fff;
  cursor: pointer;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: -0.224px;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-action {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  padding: 6px 11px;
  font-size: 12px;
  line-height: 1.33;
  letter-spacing: -0.12px;
  cursor: pointer;
  transition: all 0.18s ease;
  color: rgba(0, 0, 0, 0.8);
}

.quick-action:hover {
  border-color: rgba(0, 113, 227, 0.24);
  background: rgba(0, 113, 227, 0.06);
}

.quick-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.content-box {
  border-radius: 18px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.result-box,
.state-box,
.empty-box {
  min-height: 108px;
  max-height: var(--panel-max-height);
  overflow: auto;
}

.result-label {
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: -0.08px;
  color: rgba(0, 0, 0, 0.48);
}

.result-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.224px;
  color: #1d1d1f;
}

.state-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.48);
}

.empty-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.29;
  letter-spacing: -0.224px;
  color: #1d1d1f;
}

.empty-text {
  font-size: 12px;
  line-height: 1.47;
  letter-spacing: -0.12px;
  color: rgba(0, 0, 0, 0.48);
}

.panel-alert {
  margin: 0;
}

.typing-caret {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: currentColor;
  animation: blink 1s step-end infinite;
}

.footer-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
  position: sticky;
  bottom: 0;
  background: linear-gradient(180deg, rgba(250, 250, 252, 0), rgba(250, 250, 252, 0.96) 28%);
  backdrop-filter: blur(10px);
}

.footer-row.compact {
  opacity: 0.72;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
