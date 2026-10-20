<script setup lang="ts">
import WorkbenchIcon from '@/workbench/components/WorkbenchIcon.vue'

const duration = defineModel<number>('duration', { required: true })
const style = defineModel<string>('style', { required: true })
const props = defineProps<{
  locked: boolean
  canGenerate: boolean
  generating: boolean
  hasScript: boolean
  providerLabel: string
}>()
const emit = defineEmits<{ generate: [] }>()

function generate() {
  if (!props.locked && props.canGenerate) emit('generate')
}
</script>

<template>
  <section class="sw-podcast-options" aria-label="讨论稿设置">
    <header class="sw-podcast-options-heading">
      <h3>讨论稿设置</h3>
      <p>先生成讨论稿，逐轮确认台词后，再合成双人播客。</p>
    </header>
    <FormKit
      type="form"
      :actions="false"
      :disabled="locked"
      form-class="sw-podcast-options-form"
      @submit="generate"
    >
      <div class="sw-podcast-options-fields">
        <FormKit
          v-model="duration"
          name="duration"
          type="select"
          label="目标时长"
          validation="required"
          :options="[
            { label: '约 1 分钟', value: 1 },
            { label: '约 2 分钟', value: 2 },
            { label: '约 3 分钟', value: 3 },
          ]"
        />
        <FormKit
          v-model="style"
          name="style"
          type="select"
          label="讨论风格"
          :options="[
            { label: '轻松交流', value: 'casual' },
            { label: '深入解读', value: 'deep' },
          ]"
          :allow-create="true"
          :searchable="true"
          validation="required|length:1,200"
          placeholder="选择预设，或输入自定义风格"
          help="可输入自己的风格并按回车确认，例如：像朋友聊天，用生活里的例子解释。最多 200 字。"
        />
      </div>
      <footer class="sw-podcast-options-actions">
        <div class="sw-podcast-service">
          <span class="sw-podcast-service-icon"
            ><WorkbenchIcon name="headphones" :size="17"
          /></span>
          <div>
            <p>{{ providerLabel }}</p>
            <span>双音色 · 音频保存到附件库</span>
          </div>
        </div>
        <button class="sw-button is-primary" type="submit" :disabled="locked || !canGenerate">
          <WorkbenchIcon
            :name="generating ? 'loading' : 'sparkles'"
            :size="15"
            :class="{ 'is-spinning': generating }"
          />
          {{ generating ? '正在编稿…' : hasScript ? '重新生成讨论稿' : '生成讨论稿' }}
        </button>
      </footer>
    </FormKit>
  </section>
</template>
