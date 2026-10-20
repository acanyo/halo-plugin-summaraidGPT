<script setup lang="ts">
import { computed } from 'vue'
import type { useFormKitContext } from '@formkit/vue'
import { createSpeechSettingsUpdater } from './speech-form-state'
import {
  findSpeechModel,
  selectSpeechModel,
  selectSpeechVoice,
  speakingStyleOptions,
  speechCapabilities,
  speechEmotions,
  speechLanguages,
  speechInstructionFits,
  speechModels,
  type SpeechSettings,
} from './speech-models'

type FormContext = NonNullable<ReturnType<typeof useFormKitContext<SpeechSettings>>['value']>
const props = defineProps<{ context: FormContext & { channel?: string } }>()
const haloSwitchType = 'switch' as 'checkbox'
const enabled = computed(() => {
  const root = props.context.node.root.context?.value as Record<string, unknown> | undefined
  return Boolean(root?.enabled)
})
const directMinimax = computed(() => props.context.channel === 'minimax')
const channel = computed(() => (directMinimax.value ? 'minimax' : 'bailian'))
const updateSettings = computed(() =>
  createSpeechSettingsUpdater(props.context.node, () => directMinimax.value),
)
const settings = computed<SpeechSettings>(() => {
  const value = props.context._value || {}
  return {
    ...value,
    model:
      directMinimax.value && typeof value.model === 'string'
        ? `MiniMax/${value.model}`
        : value.model,
  }
})
const capabilities = computed(() => speechCapabilities(settings.value, channel.value))
const model = computed(() => capabilities.value.model)
const modelOptions = computed(() => {
  const options = speechModels
    .filter((item) => item.channels.includes(channel.value))
    .map((item) => ({
      label: item.label,
      value: directMinimax.value ? item.id.replace('MiniMax/', '') : item.id,
    }))
  const savedModel = props.context._value?.model
  if (savedModel && !findSpeechModel(settings.value.model, channel.value)) {
    options.unshift({ label: `已保存模型：${savedModel}`, value: savedModel })
  }
  return options
})
const voiceOptions = computed(() =>
  (model.value?.voices || []).map((voice) => ({ label: voice.label, value: voice.id })),
)
const emotionOptions = computed(() => [
  { label: '模型默认', value: '' },
  ...speechEmotions
    .filter((emotion) => capabilities.value.emotions.includes(emotion.value))
    .map(({ label, value }) => ({ label, value })),
])
const languageOptions = computed(() => [
  { label: '自动识别', value: '' },
  ...speechLanguages
    .filter((language) => capabilities.value.languages.includes(language.value))
    .map(({ label, value }) => ({ label, value })),
])
const voiceHelp = computed(() =>
  model.value?.customVoicesOnly
    ? `此模型使用复刻或设计音色，请输入以 ${model.value.id}- 开头的已授权音色 ID，并按回车确认。`
    : '选择匹配模型的系统音色，或输入已授权的音色 ID 后按回车确认。',
)
const emotionHelp = computed(() =>
  model.value?.family === 'cosyvoice'
    ? '仅显示两位主持人音色均支持的情感；系统音色由情感选项控制表达。'
    : '设置整体表达倾向。开启自动标注后，讨论稿可以为每轮对话使用不同情感。',
)
const instructionValidation = computed(
  () =>
    `speechInstruction:${model.value?.family || ''},${settings.value.emotion || ''},${Boolean(settings.value.autoEmotion)}`,
)
const voiceValidation = computed(() =>
  enabled.value
    ? `required${model.value?.customVoicesOnly ? `|speechClone:${model.value.id}` : ''}`
    : '',
)
const voiceValidationMessages = computed(() => ({
  speechClone: `此模型需要复刻或设计音色，请填写以 ${model.value?.id}- 开头的已授权音色 ID。`,
}))
function validateClone(node: { value: unknown }, modelId: string) {
  return typeof node.value === 'string' && node.value.startsWith(`${modelId}-`)
}
function validateInstruction(
  node: { value: unknown },
  family: string,
  emotion: string,
  automatic: string,
) {
  return (
    typeof node.value !== 'string' ||
    speechInstructionFits(node.value, family, emotion, automatic === 'true')
  )
}

function changeModel(value: unknown) {
  if (typeof value !== 'string') return
  const modelId = directMinimax.value ? `MiniMax/${value}` : value
  updateSettings.value(selectSpeechModel(settings.value, modelId, channel.value))
}

function changeVoice(field: 'voiceA' | 'voiceB', value: unknown) {
  if (typeof value === 'string')
    updateSettings.value(selectSpeechVoice(settings.value, field, value, channel.value))
}
</script>

<template>
  <div class="podcast-speech-settings">
    <FormKit
      type="password"
      name="apiKey"
      :label="directMinimax ? 'MiniMax API Key' : '阿里百炼 API Key'"
      help="密钥保存在 Halo Secret。已保存时显示占位符，留空并保存可清除。"
    />
    <FormKit
      v-if="!directMinimax"
      type="text"
      name="workspaceId"
      label="百炼业务空间 ID"
      preserve
      :validation="enabled ? 'required' : ''"
      help="所有百炼模型均使用北京地域业务空间端点。请填写业务空间 ID，并确认 API Key 属于同一空间。"
    />
    <FormKit
      type="select"
      name="model"
      label="语音模型"
      :options="modelOptions"
      searchable
      validation="required"
      help="更换模型时会匹配系统音色，并替换属于其他模型的复刻音色。其他自定义音色 ID 请确认在新模型下已授权。"
      @input="changeModel"
    />
    <p v-if="!model" class="podcast-speech-note" role="status">
      当前保存的模型不在支持列表中，请选择可用模型后保存。
    </p>
    <div class="podcast-speech-pair">
      <FormKit
        type="select"
        name="voiceA"
        label="主持人 A 音色"
        :options="voiceOptions"
        :allow-create="true"
        searchable
        :validation="voiceValidation"
        :validation-rules="{ speechClone: validateClone }"
        :validation-messages="voiceValidationMessages"
        placeholder="选择或输入音色 ID"
        :help="`负责提问。${voiceHelp}`"
        @input="changeVoice('voiceA', $event)"
      />
      <FormKit
        type="select"
        name="voiceB"
        label="主持人 B 音色"
        :options="voiceOptions"
        :allow-create="true"
        searchable
        :validation="voiceValidation"
        :validation-rules="{ speechClone: validateClone }"
        :validation-messages="voiceValidationMessages"
        placeholder="选择或输入音色 ID"
        :help="`负责解释，使用与 A 不同的音色。${voiceHelp}`"
        @input="changeVoice('voiceB', $event)"
      />
    </div>
    <FormKit
      v-if="capabilities.freeInstruction"
      type="select"
      name="instruction"
      label="说话风格"
      :options="speakingStyleOptions"
      :allow-create="true"
      searchable
      preserve
      :validation="instructionValidation"
      :validation-rules="{ speechInstruction: validateInstruction }"
      :validation-messages="{
        speechInstruction:
          model?.family === 'cosyvoice'
            ? '说话风格与情感指令合并后最多 100 字符（汉字按 2 字符计算），请缩短描述。'
            : '说话风格最多 200 字，请缩短描述。',
      }"
      placeholder="选择或输入说话风格"
      :help="
        model?.family === 'cosyvoice'
          ? '可选预设或输入自定义描述，按回车确认。与情感指令合并后最多 100 字符（汉字按 2 字符计算）；讨论稿写法由「讨论风格」控制。'
          : '控制声音的表达方式。可输入最多 200 字的自定义描述，按回车确认；讨论稿写法仍由「讨论风格」控制。'
      "
    />
    <p v-else-if="model?.family !== 'minimax'" class="podcast-speech-note">
      {{
        capabilities.emotions.length
          ? '当前音色使用语音情感选项控制表达；自定义说话风格需两位主持人均使用支持指令的音色。'
          : '当前模型或音色不支持情感与自定义说话风格。'
      }}
    </p>
    <div class="podcast-speech-pair">
      <FormKit
        v-if="capabilities.emotions.length"
        type="select"
        name="emotion"
        label="语音情感"
        :options="emotionOptions"
        preserve
        :help="emotionHelp"
      />
      <FormKit
        v-if="model"
        type="select"
        name="language"
        label="合成语种"
        :options="languageOptions"
        searchable
        preserve
        help="引导语音的发音语言，不会翻译讨论稿。"
      />
    </div>
    <FormKit
      v-if="capabilities.autoEmotion"
      :type="haloSwitchType"
      name="autoEmotion"
      :label="model?.interjections.length ? '自动情感与语气标注' : '自动情感标注'"
      preserve
      :help="
        model?.interjections.length
          ? '生成新讨论稿时，模型会按内容添加每轮情感及少量笑声、叹息等语气。合成前可在讨论稿中修改。'
          : '生成新讨论稿时，模型会按内容选择每轮情感。当前模型不添加笑声、叹息等富语言标签。'
      "
    />
  </div>
</template>

<style scoped>
.podcast-speech-settings {
  min-width: 0;
}
.podcast-speech-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.podcast-speech-note {
  margin: 0 0 20px;
  color: var(--sw-muted, #737373);
  font-size: 12px;
  line-height: 1.8;
}
@media (max-width: 720px) {
  .podcast-speech-pair {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
}
</style>
