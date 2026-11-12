<script setup lang="ts">
import type { McpHistoryResult } from '@/api/rag'
defineProps<{ results: McpHistoryResult[] }>()
const states: Record<string, string> = {
  success: '已完成',
  error: '失败',
  cancelled: '已取消',
  pending: '未完成',
  approval: '等待确认',
}
function structured(result: McpHistoryResult) {
  try { return result.structuredJson ? JSON.parse(result.structuredJson) : result.structuredContent }
  catch { return undefined }
}
function safeUrl(value?: string) {
  try {
    const url = new URL(value || '')
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}
</script>
<template>
  <div class="mc-history">
    <details v-for="result in results" :key="result.id">
      <summary>
        <strong>{{ result.title }}</strong
        ><span>{{ states[result.status] || '未完成' }}</span>
      </summary>
      <template v-for="(block, index) in result.content || []" :key="index">
        <p v-if="block.type === 'text'">{{ block.text }}</p>
        <a
          v-else-if="block.type === 'link' && safeUrl(block.url)"
          :href="safeUrl(block.url)"
          target="_blank"
          rel="noopener noreferrer"
          >{{ block.title || block.url }}</a
        >
        <p v-else-if="block.type === 'image'">包含图片结果，可在前台会话中查看。</p>
      </template>
      <pre v-if="structured(result)">{{
        JSON.stringify(structured(result), null, 2)
      }}</pre>
      <p v-if="result.truncated">结果较长，历史记录保留了部分内容。</p>
      <p v-if="['pending', 'approval'].includes(result.status)">
        上次调用尚未完成，重新提问可再次发起。
      </p>
    </details>
  </div>
</template>
<style scoped>
.mc-history {
  width: 100%;
  font-size: 12px;
}
.mc-history details {
  margin-top: 4px;
  padding: 10px 12px;
  border: 1px solid var(--sw-border);
  border-radius: 8px;
  background: var(--sw-bg);
}
.mc-history summary {
  cursor: pointer;
  overflow-wrap: anywhere;
}
.mc-history summary span {
  margin-left: 10px;
  color: var(--sw-muted);
}
.mc-history p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.mc-history a {
  display: block;
  margin: 8px 0;
  overflow-wrap: anywhere;
}
.mc-history pre {
  max-height: 280px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
