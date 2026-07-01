<template>
  <div
    ref="panelRef"
    class=":uno: flex w-[396px] flex-col gap-2.5 rounded-[22px] border border-[rgba(0,0,0,0.06)] bg-[rgba(250,250,252,0.88)] p-3 font-sans shadow-2xl backdrop-blur-2xl backdrop-saturate-150"
    :class="expandDirection === 'up' ? ':uno: -translate-y-[calc(100%+58px)]' : ''"
    :style="{ '--panel-max-height': `${panelMaxHeight}px` }"
    @click.stop
  >
    <div class=":uno: flex items-center justify-between gap-3">
      <div class=":uno: flex flex-col gap-[3px]">
        <div
          class=":uno: w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600"
        >
          AI 助手
        </div>
        <div class=":uno: text-xs leading-snug tracking-normal text-black/50">
          针对选中文本即时处理
        </div>
      </div>
      <div
        v-if="selectedText"
        class=":uno: text-xs font-semibold leading-snug tracking-normal text-black/80"
      >
        {{ selectedText.length }} 字
      </div>
    </div>

    <div v-if="selectedText" class=":uno: rounded-2xl bg-[rgba(245,245,247,0.92)] px-3 py-2.5">
      <div class=":uno: mb-1.5 text-[10px] font-semibold tracking-normal text-black/50">
        当前选中
      </div>
      <div class=":uno: text-xs leading-relaxed tracking-normal text-[#1d1d1f]">
        {{ selectedPreview }}
      </div>
    </div>

    <div
      class=":uno: flex items-center gap-2 rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-white/72 p-2 shadow-inner"
    >
      <textarea
        ref="instructionInputRef"
        v-model="instruction"
        class=":uno: min-h-[38px] flex-1 resize-none overflow-y-auto rounded-[14px] border-0 bg-transparent px-2.5 py-2 text-[17px] font-normal leading-relaxed tracking-normal text-[#1d1d1f] outline-none focus:bg-white/40 disabled:cursor-not-allowed"
        rows="1"
        :disabled="loading"
        :placeholder="
          selectedText ? '直接告诉 AI 你要它怎么处理这段文字' : '请先在编辑器中选中一段文字'
        "
        @keydown.enter.exact.prevent="handleSend"
        @input="resizeInstructionInput"
      />
      <button
        class=":uno: h-[38px] min-w-[58px] cursor-pointer rounded-full border-0 bg-blue-600 px-4 text-sm font-normal leading-snug tracking-normal text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loading || !canSend"
        @click="handleSend"
      >
        <span v-if="loading">...</span>
        <span v-else>发送</span>
      </button>
    </div>

    <div class=":uno: flex flex-wrap gap-1.5">
      <button
        v-for="item in quickActions"
        :key="item.label"
        class=":uno: cursor-pointer rounded-full border border-black/10 bg-white/75 px-[11px] py-1.5 text-xs leading-snug tracking-normal text-black/80 transition-all duration-200 hover:border-blue-500/25 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loading"
        @click="runQuickAction(item.prompt)"
      >
        {{ item.label }}
      </button>
    </div>

    <VAlert
      v-if="errorMessage"
      class=":uno: m-0"
      type="error"
      :title="errorMessage"
      :closable="false"
    />

    <div
      v-else-if="loading && !resultText"
      class=":uno: flex min-h-[108px] max-h-[var(--panel-max-height)] items-center justify-center gap-2 overflow-auto rounded-[18px] border border-black/5 bg-white/70 p-3.5 text-black/50"
    >
      <VLoading />
      <span>AI 正在思考...</span>
    </div>

    <div
      v-else-if="resultText"
      class=":uno: min-h-[108px] max-h-[var(--panel-max-height)] overflow-auto rounded-[18px] border border-black/5 bg-white/70 p-3.5"
    >
      <div class=":uno: mb-2 text-[10px] font-semibold tracking-normal text-black/50">处理结果</div>
      <div
        class=":uno: whitespace-pre-wrap break-words text-sm leading-snug tracking-normal text-[#1d1d1f]"
      >
        {{ resultText }}
        <span
          v-if="loading"
          class=":uno: ml-0.5 inline-block h-[1em] w-px animate-pulse align-text-bottom bg-current"
        ></span>
      </div>
    </div>

    <div
      v-else
      class=":uno: flex min-h-[108px] max-h-[var(--panel-max-height)] flex-col justify-center gap-1.5 overflow-auto rounded-[18px] border border-black/5 bg-white/70 p-3.5"
    >
      <div class=":uno: text-sm font-semibold leading-snug tracking-normal text-[#1d1d1f]">
        怎么用更顺手
      </div>
      <div class=":uno: text-xs leading-relaxed tracking-normal text-black/50">
        先点一个快捷动作，或者直接输入要求，比如“润色得更口语一点”或“继续写两段”。
      </div>
    </div>

    <div
      class=":uno: sticky bottom-0 flex justify-end gap-2 bg-gradient-to-b from-[rgba(250,250,252,0)] to-[rgba(250,250,252,0.96)] pt-1 backdrop-blur"
      :class="!resultText ? ':uno: opacity-72' : ''"
    >
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

  return raw.trim()
}

const streamConversation = async (prompt: string) => {
  const response = await fetch(
    '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/conversationStream',
    {
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
    },
  )

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
