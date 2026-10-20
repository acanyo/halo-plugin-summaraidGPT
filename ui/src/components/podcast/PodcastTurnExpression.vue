<script setup lang="ts">
import { computed } from 'vue'
import type { PodcastCapabilities, PodcastTurn } from '@/api/podcast'
import catalog from '../../../../shared/podcast/speech-models.json'

const turn = defineModel<PodcastTurn>({ required: true })
const props = defineProps<{
  speech?: PodcastCapabilities['speech']
  locked: boolean
  index: number
}>()

function options(type: 'emotion' | 'interjection') {
  const entries = type === 'emotion' ? catalog.emotions : catalog.interjections
  const allowed = type === 'emotion' ? props.speech?.emotions : props.speech?.interjections
  const current = turn.value[type]
  const values = entries
    .filter((item) => allowed?.includes(item.value))
    .map((item) => ({ label: item.label, value: item.value }))
  if (current && !values.some((item) => item.value === current)) {
    values.push({
      label: `${entries.find((item) => item.value === current)?.label || current}（当前模型不支持）`,
      value: current,
    })
  }
  return [{ label: type === 'emotion' ? '沿用全局设置' : '无拟声效果', value: '' }, ...values]
}
const emotions = computed(() => options('emotion'))
const interjections = computed(() => options('interjection'))
const emotion = computed({
  get: () => turn.value.emotion || '',
  set: (value: string) => {
    turn.value = { ...turn.value, emotion: value || undefined }
  },
})
const interjection = computed({
  get: () => turn.value.interjection || '',
  set: (value: string) => {
    turn.value = { ...turn.value, interjection: value || undefined }
  },
})
</script>

<template>
  <div v-if="emotions.length > 1 || interjections.length > 1" class="sw-podcast-expressions">
    <FormKit
      v-if="emotions.length > 1"
      v-model="emotion"
      type="select"
      :label="`第 ${index + 1} 轮语音情感`"
      :options="emotions"
      :disabled="locked"
    />
    <FormKit
      v-if="interjections.length > 1"
      v-model="interjection"
      type="select"
      :label="`第 ${index + 1} 轮拟声效果`"
      :options="interjections"
      :disabled="locked"
    />
  </div>
</template>
