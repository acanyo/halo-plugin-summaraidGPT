<script setup lang="ts">
import { ref, watch } from 'vue'
import { ensureLinguiReader } from '../../../../packages/src/article-summary/lingui'

const props = defineProps<{ projectId: string; ready: boolean }>()
const host = ref<HTMLElement>()
const loading = ref(false)
const failed = ref(false)

interface PreviewElement extends HTMLElement {
  interactions: {
    autoStart: boolean
    inheritRegistered: boolean
    requests: { allow: () => boolean }
  }
}

watch(
  [() => props.projectId.trim(), () => props.ready, host],
  ([projectId, ready, target], _previous, onCleanup) => {
    let cancelled = false
    let element: PreviewElement | undefined
    onCleanup(() => {
      cancelled = true
      element?.remove()
    })
    loading.value = false
    failed.value = false
    if (!ready || !projectId || !target) return
    loading.value = true
    void ensureLinguiReader()
      .then(() => {
        if (cancelled || !target.isConnected) return
        element = document.createElement('lingui-component') as PreviewElement
        element.setAttribute('data-lingui', projectId)
        element.interactions = {
          autoStart: false,
          inheritRegistered: false,
          requests: { allow: () => false },
        }
        target.append(element)
        loading.value = false
      })
      .catch(() => {
        if (cancelled) return
        loading.value = false
        failed.value = true
      })
  },
  { immediate: true, flush: 'post' },
)
</script>

<template>
  <section class="sw-lingui-static-preview" aria-label="灵构 UI 作品静态预览" :aria-busy="loading">
    <p class="sw-lingui-preview-label">作品静态预览</p>
    <p v-if="loading" class="sw-lingui-preview-status" role="status">正在加载预览资源…</p>
    <p v-if="failed" class="sw-lingui-preview-status" role="status">
      预览资源暂时无法加载。已保留所选作品，可检查灵构 UI 插件后重新选择。
    </p>
    <div ref="host" class="sw-lingui-preview-host" />
    <p class="sw-lingui-preview-status">
      仅展示作品自身的初始外观，预览不会执行交互或读取文章摘要。真实内容在文章页填充。
    </p>
  </section>
</template>

<style scoped>
.sw-lingui-static-preview {
  display: block;
  min-width: 0;
  width: 100%;
  margin-top: 6px;
}
.sw-lingui-preview-label {
  color: var(--sw-text, #171717);
  font-size: 12px;
  font-weight: 600;
}
.sw-lingui-preview-status {
  color: var(--sw-muted, #737373);
  font-size: 12px;
  line-height: 1.8;
}
.sw-lingui-preview-host {
  display: block;
  min-width: 0;
  width: 100%;
  max-height: 384px;
  margin: 8px 0;
  padding: 16px;
  overflow: auto;
  border: 1px solid var(--sw-border, #e5e5e5);
  border-radius: 8px;
}
.sw-lingui-preview-host :deep(lingui-component) {
  display: block;
  min-width: 0;
  width: 100%;
}
.sw-lingui-preview-host:empty {
  display: none;
}
</style>
