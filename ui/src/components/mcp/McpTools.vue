<script setup lang="ts">
import { computed, ref } from 'vue'
import type { McpServer, McpDiscovery, McpToolPolicy } from '@/api/mcp'
import WorkbenchIcon from '@/workbench/components/WorkbenchIcon.vue'
const props = defineProps<{ server: McpServer; catalog?: McpDiscovery; busy: boolean }>()
const emit = defineEmits<{ update: [McpServer]; discover: []; connection: [] }>()
const search = ref(''),
  onlyEnabled = ref(false)
const tools = computed(() =>
  props.server.tools.filter(
    (tool) =>
      (!onlyEnabled.value || tool.enabled) &&
      `${tool.name} ${tool.label || ''} ${description(tool.name)}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
)
const enabled = computed(() => props.server.tools.filter((tool) => tool.enabled).length)
function description(name: string) {
  return props.catalog?.tools.find((t) => t.name === name)?.description || ''
}
function patch(name: string, values: Partial<McpToolPolicy>) {
  emit('update', {
    ...props.server,
    tools: props.server.tools.map((t) => (t.name === name ? { ...t, ...values } : t)),
  })
}
function batch(value: boolean) {
  const names = new Set(tools.value.map((t) => t.name))
  emit('update', {
    ...props.server,
    tools: props.server.tools.map((t) => (names.has(t.name) ? { ...t, enabled: value } : t)),
  })
}
const input = (event: Event) => (event.target as HTMLInputElement).value
const checked = (event: Event) => (event.target as HTMLInputElement).checked
</script>
<template>
  <div v-if="!server.tools.length" class="mc-empty mc-tool-empty">
    <WorkbenchIcon name="graph" :size="34" />
    <h3>先发现这个服务的工具</h3>
    <p>连接成功后，工具会列在这里。选择开放范围，再保存生效。</p>
    <button class="sw-button is-primary" :disabled="busy || !server.url" @click="emit('discover')">
      {{ busy ? '正在连接…' : '连接并发现工具' }}</button
    ><button class="sw-text-button" @click="emit('connection')">编辑连接信息</button>
  </div>
  <div v-else>
    <div class="mc-tools-toolbar">
      <label class="mc-search"
        ><WorkbenchIcon name="search" :size="16" /><input
          v-model="search"
          type="search"
          aria-label="搜索工具"
          placeholder="搜索工具名称或描述"
      /></label>
      <label class="mc-checkbox"><input v-model="onlyEnabled" type="checkbox" />仅看已开放</label>
      <button class="sw-button" :disabled="busy" @click="emit('discover')">
        <WorkbenchIcon name="refresh" :size="14" />刷新工具
      </button>
    </div>
    <div class="mc-tools-summary">
      <span
        >已开放 <b>{{ enabled }}</b> / {{ server.tools.length }} 个工具</span
      >
      <div>
        <button class="sw-text-button" :disabled="busy || !tools.length" @click="batch(true)">
          开放当前结果</button
        ><button class="sw-text-button" :disabled="busy || !tools.length" @click="batch(false)">
          关闭当前结果
        </button>
      </div>
    </div>
    <p v-if="!tools.length" class="mc-no-results">没有匹配的工具。调整关键词或筛选条件。</p>
    <article
      v-for="tool in tools"
      :key="tool.name"
      class="mc-tool"
      :class="{ 'is-enabled': tool.enabled }"
    >
      <header>
        <label class="mc-tool-title"
          ><input
            type="checkbox"
            :aria-label="`开放工具 ${tool.name}`"
            :checked="tool.enabled"
            :disabled="busy"
            @change="patch(tool.name, { enabled: checked($event) })"
          /><span
            ><strong>{{ tool.label || tool.name }}</strong
            ><code>{{ tool.name }}</code></span
          ></label
        ><span class="mc-pill" :class="{ 'is-ready': tool.enabled }">{{
          tool.enabled ? '已开放' : '未开放'
        }}</span>
      </header>
      <p v-if="description(tool.name)" class="mc-tool-description">{{ description(tool.name) }}</p>
      <div class="mc-tool-policies">
        <label class="mc-checkbox"
          ><input
            type="checkbox"
            :checked="tool.requireApproval !== false"
            :disabled="busy || !tool.enabled"
            @change="patch(tool.name, { requireApproval: checked($event) })"
          />执行前确认</label
        ><label class="mc-checkbox"
          ><input
            type="checkbox"
            :checked="tool.authenticatedOnly"
            :disabled="busy || !tool.enabled"
            @change="patch(tool.name, { authenticatedOnly: checked($event) })"
          />仅登录用户</label
        ><span v-if="tool.enabled && !tool.authenticatedOnly">访客可用</span>
      </div>
      <details class="mc-tool-display">
        <summary>聊天入口与示例问题</summary>
        <div class="mc-form-grid">
          <label
            >访客看到的名称<input
              :value="tool.label || ''"
              :aria-label="`${tool.name} 展示名称`"
              maxlength="80"
              :disabled="busy"
              placeholder="例如：搜索开发文档"
              @input="patch(tool.name, { label: input($event) })" /></label
          ><label
            >示例问题<input
              :value="tool.prompt || ''"
              :aria-label="`${tool.name} 示例问题`"
              maxlength="300"
              :disabled="busy"
              placeholder="例如：帮我查找 Workers 的入门文档"
              @input="patch(tool.name, { prompt: input($event) })"
            /><small>点击聊天能力入口时填入输入框，访客确认后发送。</small></label
          >
        </div>
      </details>
    </article>
  </div>
</template>
