<script setup lang="ts">
import type { McpServer } from '@/api/mcp'
const props = defineProps<{ server: McpServer; busy: boolean }>()
const emit = defineEmits<{ update: [McpServer]; test: [] }>()
function patch<K extends keyof McpServer>(key: K, value: McpServer[K]) {
  emit('update', { ...props.server, [key]: value })
}
const value = (event: Event) => (event.target as HTMLInputElement).value
function header(index: number, key: 'name' | 'value', text: string) {
  patch(
    'headers',
    props.server.headers.map((h, i) => (i === index ? { ...h, [key]: text } : h)),
  )
}
</script>
<template>
  <form class="mc-connection" @submit.prevent="emit('test')">
    <div class="mc-section-label">
      <span>服务连接</span>
      <p>填写服务地址，连接后选择要开放的工具。</p>
    </div>
    <div class="mc-form-grid">
      <label
        >服务名称<input
          :value="server.name"
          required
          maxlength="100"
          placeholder="例如：文档助手"
          :disabled="busy"
          @input="patch('name', value($event))"
      /></label>
      <label
        >MCP 地址<input
          :value="server.url"
          required
          type="url"
          placeholder="https://example.com/mcp"
          :disabled="busy"
          @input="patch('url', value($event))"
        /><small>使用服务提供的 Streamable HTTP 地址。</small></label
      >
      <label
        >Bearer Token<input
          :value="server.token"
          type="password"
          autocomplete="new-password"
          placeholder="无需鉴权时留空"
          :disabled="busy"
          @input="patch('token', value($event))"
      /></label>
      <label
        >超时（秒）<input
          :value="server.timeoutSeconds"
          type="number"
          min="3"
          max="60"
          :disabled="busy"
          @input="patch('timeoutSeconds', Math.min(60, Math.max(3, Number(value($event)) || 20)))"
      /></label>
    </div>
    <details class="mc-advanced">
      <summary>更多连接选项</summary>
      <label class="mc-checkbox"
        ><input
          type="checkbox"
          :checked="server.allowPrivateNetwork"
          :disabled="busy"
          @change="patch('allowPrivateNetwork', ($event.target as HTMLInputElement).checked)"
        />允许连接本机或内网服务</label
      >
      <p>网络地址相对于 Halo 运行环境；容器内的 localhost 指向容器本身。</p>
      <div v-for="(item, index) in server.headers" :key="index" class="mc-header-row">
        <input
          :value="item.name"
          :aria-label="`请求头 ${index + 1} 名称`"
          placeholder="X-API-Key"
          :disabled="busy"
          @input="header(index, 'name', value($event))"
        />
        <input
          :value="item.value"
          :aria-label="`请求头 ${index + 1} 值`"
          type="password"
          autocomplete="new-password"
          placeholder="请求头值"
          :disabled="busy"
          @input="header(index, 'value', value($event))"
        />
        <button
          type="button"
          class="sw-text-button"
          :disabled="busy"
          @click="
            patch(
              'headers',
              server.headers.filter((_, i) => i !== index),
            )
          "
        >
          删除
        </button>
      </div>
      <button
        type="button"
        class="sw-text-button"
        :disabled="busy || server.headers.length >= 20"
        @click="patch('headers', [...server.headers, { name: '', value: '' }])"
      >
        ＋ 添加请求头
      </button>
    </details>
    <footer class="mc-form-footer">
      <span>凭证仅供后端连接使用。</span
      ><button
        class="sw-button is-primary"
        type="submit"
        :disabled="busy || !server.url || !server.name"
      >
        {{ busy ? '正在连接…' : '连接并发现工具' }}
      </button>
    </footer>
  </form>
</template>
