<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { useFormKitContext, useFormKitNodeById } from '@formkit/vue'
import { stores } from '@halo-dev/ui-shared'
import LinguiSummaryPreview from './LinguiSummaryPreview.vue'

interface UiPluginProviders {
  isRegistered: (name: string) => boolean
  isEnabled?: (name: string) => boolean
}

// Halo 2.25 does not expose provider readiness; retain a usable text field there.
const providerStore = (
  stores as typeof stores & { uiPlugins?: () => UiPluginProviders }
).uiPlugins?.()
const instance = getCurrentInstance()
const form = useFormKitContext<Record<string, unknown>>()
const fieldId = 'summaraidgpt-lingui-summary-project'
const projectField = useFormKitNodeById(fieldId)
const projectId = computed(() => {
  const value = projectField.value?.context?._value
  return typeof value === 'string' ? value : ''
})
const disabled = computed(() => Boolean(projectField.value?.context?.disabled))
const active = computed(() => form.value?.value.uiStyle === 'lingui')
const registered = computed(() => providerStore?.isRegistered('plugin-lingui') ?? false)
const ready = computed(
  () => registered.value && Boolean(instance?.appContext.components.LinguiProjectSelect),
)
const status = computed(() => {
  if (!providerStore)
    return '当前 Halo 版本未提供 UI 插件就绪状态。请使用 Halo 2.26 或更新版本后选择灵构 UI 作品，已保存的作品 ID 会保留。'
  if (registered.value && !ready.value)
    return '当前灵构 UI 版本未提供作品选择器，请将灵构 UI 升级到 1.0.3 或更新版本。已保存的作品 ID 会保留。'
  if (providerStore.isEnabled?.('plugin-lingui'))
    return '灵构 UI 选择器尚未就绪。请检查插件是否加载成功，重新加载页面后重试；已保存的作品 ID 会保留。'
  return '请先安装并启用灵构 UI 1.0.3 或更新版本，再选择公开嵌入的作品。已保存的作品 ID 会保留。'
})
const designPrompt = `请设计一个用于 Halo 文章页的「智阅 AI 摘要框」灵构 UI 作品。
在作品的 integrations.callbacks 中声明名为 zhiyue.summary 的宿主回调，label 为「智阅文章摘要」；integrations.apis 留空。
在作品的 mount 事件中调用宿主回调 zhiyue.summary，把回调结果保存到 /summary。
将摘要标题绑定到 /summary/title，AI 名称绑定到 /summary/gptName，摘要正文绑定到 /summary/content；文章 ID 可从 /summary/postId 读取。
回调还提供 loading 和 error 字段，可用于状态展示。请用 Text 等组件动态绑定这些字段，不要把示例摘要写死，也不要另行发起摘要生成请求。
请保持文章阅读场景下的清晰排版和移动端适配，并开启作品的公开嵌入。设置页的静态预览仅展示作品外观，真实摘要会在文章页由宿主提供。`
const copyMessage = ref('')

async function copyDesignPrompt() {
  try {
    await navigator.clipboard.writeText(designPrompt)
    copyMessage.value = '设计说明已复制'
  } catch {
    copyMessage.value = '复制失败，请选中下方设计说明手动复制。'
  }
}

function choose(value: unknown) {
  if (!disabled.value && typeof value === 'string') projectField.value?.input(value)
}

function editProjectId(event: Event) {
  choose((event.target as HTMLInputElement).value)
}
</script>

<template>
  <div v-show="active" class="sw-lingui-summary-settings">
    <p v-if="!ready" class="sw-lingui-summary-notice" role="status">{{ status }}</p>
    <FormKit :id="fieldId" type="hidden" name="linguiProjectId" preserve />
    <div class="sw-lingui-project-field">
      <label class="sw-lingui-project-label" :for="`${fieldId}-selector`">灵构 UI 作品</label>
      <component
        :is="'LinguiProjectSelect'"
        v-if="ready"
        :id="`${fieldId}-selector`"
        :model-value="projectId"
        :public-only="true"
        :show-preview="false"
        :disabled="disabled"
        :clearable="true"
        @update:model-value="choose"
      />
      <input
        v-else
        :id="`${fieldId}-selector`"
        class="sw-lingui-project-input"
        type="text"
        :value="projectId"
        :disabled="disabled"
        :aria-describedby="`${fieldId}-help`"
        placeholder="已保存的灵构 UI 作品 ID"
        @input="editProjectId"
      />
      <p :id="`${fieldId}-help`" class="sw-lingui-project-help">
        选择已开启公开嵌入的作品，保存作品 ID 后引用最新版本。预览不会自动执行作品交互。
      </p>
      <LinguiSummaryPreview
        v-if="active && ready && projectId.trim()"
        :project-id="projectId"
        :ready="ready"
      />
    </div>
    <p class="sw-lingui-summary-help">
      在灵构 UI 中开启作品的「公开嵌入」后即可选择。静态预览仅展示作品外观，真实摘要在文章页填充。
      <a
        href="https://docs.xhhao.com/plugins/lingui/integration"
        target="_blank"
        rel="noopener noreferrer"
        >查看接入说明</a
      >
    </p>
    <details class="sw-lingui-design-guide">
      <summary>在灵构 AI 设计中使用</summary>
      <p>将下面的说明交给灵构 AI，作品会读取文章页提供的标题、AI 名称和摘要正文。</p>
      <button type="button" class="sw-text-button" @click="copyDesignPrompt">复制设计说明</button>
      <span v-if="copyMessage" role="status">{{ copyMessage }}</span>
      <p class="sw-lingui-design-prompt">{{ designPrompt }}</p>
    </details>
  </div>
</template>

<style scoped>
.sw-lingui-summary-settings {
  display: block;
  min-width: 0;
  width: 100%;
}
.sw-lingui-project-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  width: 100%;
  margin-bottom: 23px;
}
.sw-lingui-project-label {
  color: var(--sw-text, #171717);
  font-size: 13px;
  font-weight: 500;
}
.sw-lingui-project-input {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--sw-border, #e5e5e5);
  border-radius: 5px;
  padding: 8px 12px;
  background: transparent;
  color: var(--sw-text, #171717);
  font-size: 13px;
  line-height: 1.5;
}
.sw-lingui-project-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.sw-lingui-project-help {
  margin: 0;
  color: var(--sw-muted, #737373);
  font-size: 12px;
  line-height: 1.8;
}
.sw-lingui-summary-notice,
.sw-lingui-summary-help,
.sw-lingui-design-guide {
  color: var(--sw-muted, #737373);
  font-size: 12px;
  line-height: 1.8;
}
.sw-lingui-summary-notice {
  margin: 0 0 16px;
}
.sw-lingui-summary-help {
  margin: 0 0 20px;
}
.sw-lingui-summary-help a {
  color: var(--sw-text, #171717);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.sw-lingui-design-guide {
  margin-bottom: 20px;
}
.sw-lingui-design-guide summary {
  width: fit-content;
  color: var(--sw-text, #171717);
  cursor: pointer;
}
.sw-lingui-design-guide > p {
  margin: 12px 0;
}
.sw-lingui-design-guide > span {
  margin-left: 12px;
}
.sw-lingui-design-prompt {
  padding: 14px 16px;
  border: 1px solid var(--sw-border, #e5e5e5);
  border-radius: 8px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  user-select: text;
}
</style>
