<script setup lang="ts">
import { ref, watch } from 'vue'
import { mcpApi } from '@/api/mcp'
import type { AiCallLog } from '@/api/ai-call-logs'
import { workbenchErrorMessage } from '@/workbench/errors'
import { utils } from '@halo-dev/ui-shared'
const props = defineProps<{ serverId?: string }>()
const rows = ref<AiCallLog[]>([]),
  total = ref(0),
  page = ref(1),
  state = ref(''),
  phase = ref('')
const loading = ref(false),
  error = ref('')
let generation = 0
async function load() {
  const turn = ++generation
  loading.value = true
  error.value = ''
  try {
    const data = await mcpApi.calls({
      serverId: props.serverId,
      page: page.value,
      size: 15,
      state: state.value,
      phase: phase.value,
    })
    if (turn !== generation) return
    rows.value = data.items
    total.value = data.total
  } catch (cause) {
    if (turn === generation) error.value = workbenchErrorMessage(cause, '调用记录加载失败，请重试')
  } finally {
    if (turn === generation) loading.value = false
  }
}
watch(
  () => [props.serverId, state.value, phase.value],
  () => {
    page.value = 1
    void load()
  },
  { immediate: true },
)
watch(page, () => void load())
const date = (value?: string) => (value ? utils.date.format(value, 'MM-DD HH:mm:ss') : '—')
</script>
<template>
  <div class="mc-calls">
    <header class="mc-calls-filters">
      <label
        >结果<select v-model="state" aria-label="筛选调用结果">
          <option value="">全部结果</option>
          <option value="success">成功</option>
          <option value="error">失败</option>
        </select></label
      ><label
        >操作<select v-model="phase" aria-label="筛选调用类型">
          <option value="">全部操作</option>
          <option value="call">工具调用</option>
          <option value="discovery">工具发现</option>
        </select></label
      ><button class="sw-button" :disabled="loading" @click="load">刷新记录</button>
    </header>
    <p v-if="error" class="mc-error" role="alert">{{ error }}</p>
    <p v-if="loading" role="status" class="mc-no-results">正在加载调用记录…</p>
    <div v-else-if="!rows.length" class="mc-empty">
      <h3>暂无调用记录</h3>
      <p>测试连接或在前台使用工具后，可以在这里查看耗时与结果。</p>
    </div>
    <div v-else class="mc-table-wrap">
      <table>
        <thead>
          <tr>
            <th>工具 / 服务</th>
            <th>类型</th>
            <th>结果</th>
            <th>耗时</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.metadata.name">
            <td>
              <strong>{{ row.spec?.metadata?.tool || row.spec?.modelName }}</strong
              ><small>{{ row.spec?.metadata?.tool ? row.spec?.modelName : '获取工具目录' }}</small
              ><span v-if="row.spec?.errorMessage" class="mc-call-error">{{
                row.spec.errorMessage
              }}</span>
            </td>
            <td>{{ row.spec?.metadata?.phase === 'call' ? '工具调用' : '工具发现' }}</td>
            <td>
              <span class="mc-pill" :class="row.spec?.success ? 'is-ready' : 'is-error'">{{
                row.spec?.success ? '成功' : '失败'
              }}</span>
            </td>
            <td class="mc-mono">{{ row.spec?.durationMillis ?? 0 }} ms</td>
            <td class="mc-mono">{{ date(row.spec?.startedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer v-if="total" class="mc-pagination">
      <span>共 {{ total }} 条 · 第 {{ page }} / {{ Math.ceil(total / 15) }} 页</span>
      <div>
        <button class="sw-button" :disabled="page <= 1 || loading" @click="page--">上一页</button
        ><button class="sw-button" :disabled="page * 15 >= total || loading" @click="page++">
          下一页
        </button>
      </div>
    </footer>
    <p class="mc-footnote">
      记录服务、工具、耗时和失败原因；不记录凭证、提问参数或工具返回的正文。
    </p>
  </div>
</template>
