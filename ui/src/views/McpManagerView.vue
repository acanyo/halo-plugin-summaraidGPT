<script setup lang="ts">
import { computed } from 'vue'
import WorkbenchIcon from '@/workbench/components/WorkbenchIcon.vue'
import WorkbenchSectionHeader from '@/workbench/components/WorkbenchSectionHeader.vue'
import McpConnection from '@/components/mcp/McpConnection.vue'
import McpTools from '@/components/mcp/McpTools.vue'
import McpCalls from '@/components/mcp/McpCalls.vue'
import { useMcpManager } from '@/components/mcp/useMcpManager'
import '@/components/mcp/mcp-manager.css'

const {
  config,
  selectedId,
  selected,
  selectedStatus,
  activeTools,
  status,
  catalogs,
  tab,
  loading,
  saving,
  testing,
  error,
  dirty,
  load,
  save,
  add,
  update,
  remove,
  test,
  discard,
  refreshStatus,
} = useMcpManager()
const busy = computed(() => saving.value || testing.value)
function showAllCalls() {
  selectedId.value = ''
  tab.value = 'calls'
}
const statusLabel = computed(() =>
  testing.value
    ? '连接中'
    : selectedStatus.value?.state === 'ready'
      ? '连接正常'
      : selectedStatus.value?.state === 'error'
        ? '连接失败'
        : '尚未检查',
)
const endpoint = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return '尚未填写地址'
  }
}
</script>
<template>
  <section class="mc-manager" aria-label="MCP 工具管理">
    <WorkbenchSectionHeader title="MCP 工具" description="管理外部服务、工具权限和调用记录。">
      <template #actions
        ><div class="mc-page-actions">
          <label class="mc-master" :class="{ 'is-on': config.enabled }"
            ><input
              v-model="config.enabled"
              role="switch"
              type="checkbox"
              aria-label="启用 MCP 外部工具"
              :disabled="loading || busy"
            /><span class="mc-toggle" /><span>{{
              config.enabled ? '外部工具已开启' : '外部工具已关闭'
            }}</span></label
          ><button
            class="sw-button is-primary"
            :disabled="loading || busy || config.servers.length >= 8"
            @click="add()"
          >
            <WorkbenchIcon name="plus" :size="16" />添加服务
          </button>
        </div></template
      >
    </WorkbenchSectionHeader>
    <div v-if="error" class="mc-error" role="alert">
      <WorkbenchIcon name="info" :size="17" /><span>{{ error }}</span
      ><button v-if="!config.servers.length" class="sw-text-button" @click="load">重试</button>
    </div>
    <div v-if="loading" class="mc-loading" role="status">
      <WorkbenchIcon name="loading" :size="22" />正在加载服务…
    </div>
    <div v-else class="mc-workspace">
      <aside class="mc-rail">
        <div class="mc-rail-heading">
          <span>已连接服务</span><span>{{ config.servers.length }} / 8</span>
        </div>
        <div class="mc-service-list">
          <button
            v-for="server in config.servers"
            :key="server.id"
            class="mc-service"
            :class="{ 'is-selected': selectedId === server.id }"
            :aria-pressed="selectedId === server.id"
            :disabled="testing"
            @click="selectedId = server.id"
          >
            <span class="mc-service-symbol"><WorkbenchIcon name="globe" :size="20" /></span
            ><span class="mc-service-text"
              ><strong>{{ server.name || '新服务' }}</strong
              ><small>{{ endpoint(server.url) }}</small
              ><span>{{ server.tools.filter((t) => t.enabled).length }} 个开放工具</span></span
            ><span
              class="mc-dot"
              :class="{ 'is-on': server.enabled && config.enabled }"
              :aria-label="server.enabled && config.enabled ? '已启用' : '未启用'"
            />
          </button>
        </div>
        <div class="mc-rail-summary">
          <span
            >前台可用工具<strong>{{ config.enabled ? activeTools : 0 }}</strong></span
          >
          <p>访客只能使用你开放的工具。执行确认和登录要求可逐项控制。</p>
        </div>
        <button
          class="mc-all-calls"
          :class="{ 'is-selected': !selectedId && tab === 'calls' }"
          @click="showAllCalls"
        >
          <WorkbenchIcon name="activity" :size="17" />全部调用记录<WorkbenchIcon
            name="chevron"
            :size="13"
          />
        </button>
      </aside>
      <main class="mc-surface">
        <template v-if="selected"
          ><header class="mc-service-head">
            <div>
              <div class="mc-service-caption">
                <span
                  class="mc-pill"
                  :class="
                    selectedStatus?.state === 'ready'
                      ? 'is-ready'
                      : selectedStatus?.state === 'error'
                        ? 'is-error'
                        : ''
                  "
                  ><span class="mc-dot" />{{ statusLabel }}</span
                ><span v-if="selectedStatus?.latencyMillis != null" class="mc-mono"
                  >{{ selectedStatus.latencyMillis }} ms</span
                >
              </div>
              <h2>{{ selected.name || '配置新服务' }}</h2>
              <p class="mc-endpoint">{{ selected.url || '填写服务地址后即可连接' }}</p>
            </div>
            <div class="mc-service-actions">
              <label class="mc-checkbox"
                ><input
                  v-model="selected.enabled"
                  type="checkbox"
                  :disabled="busy"
                />启用此服务</label
              ><button
                class="sw-text-button mc-icon-button"
                aria-label="移除当前服务"
                title="移除服务"
                :disabled="busy"
                @click="remove"
              >
                <WorkbenchIcon name="close" :size="17" />
              </button>
            </div>
          </header>
          <div class="mc-tabs" role="tablist" aria-label="服务管理">
            <button
              v-for="item in [
                { id: 'tools', label: '工具与访问' },
                { id: 'connection', label: '连接信息' },
                { id: 'calls', label: '调用记录' },
              ] as const"
              :id="`mc-tab-${item.id}`"
              :key="item.id"
              role="tab"
              :aria-selected="tab === item.id"
              :aria-controls="`mc-panel-${item.id}`"
              @click="tab = item.id"
            >
              {{ item.label }}<span v-if="item.id === 'tools'">{{ selected.tools.length }}</span>
            </button>
          </div>
          <div
            v-if="selectedStatus?.state === 'error' && tab !== 'connection'"
            class="mc-inline-note is-error"
          >
            {{ selectedStatus.error
            }}<button class="sw-text-button" @click="tab = 'connection'">检查连接</button>
          </div>
          <div
            :id="`mc-panel-${tab}`"
            role="tabpanel"
            :aria-labelledby="`mc-tab-${tab}`"
            class="mc-panel"
          >
            <McpConnection
              v-if="tab === 'connection'"
              :server="selected"
              :busy="busy"
              @update="update"
              @test="test"
            /><McpTools
              v-else-if="tab === 'tools'"
              :server="selected"
              :catalog="catalogs[selected.id]"
              :busy="busy"
              @update="update"
              @discover="test"
              @connection="tab = 'connection'"
            /><McpCalls v-else :server-id="selected.id" />
          </div>
        </template>
        <template v-else-if="tab === 'calls'"
          ><header class="mc-service-head">
            <div>
              <span class="sw-eyebrow">运行记录</span>
              <h2>全部调用</h2>
              <p>查看各服务的响应速度与失败原因。</p>
            </div>
          </header>
          <div class="mc-panel"><McpCalls /></div
        ></template>
        <div v-else class="mc-welcome">
          <div class="mc-connection-sketch" aria-hidden="true">
            <span>智阅</span><i /><WorkbenchIcon name="graph" :size="26" /><i /><span>工具</span>
          </div>
          <h2>让对话连接更多能力</h2>
          <p>从一个服务开始。添加地址，发现工具，再决定哪些能力向访客开放。</p>
          <button class="sw-button is-primary" @click="add()">
            <WorkbenchIcon name="plus" :size="17" />连接第一个服务
          </button>
          <div class="mc-starter">
            <div>
              <span class="mc-pill">无需密钥 · 只读</span><strong>Cloudflare 开发文档</strong>
              <p>用公开文档服务体验工具搜索和带来源的回答。</p>
            </div>
            <button class="sw-text-button" @click="add(true)">
              使用此示例<WorkbenchIcon name="arrow" :size="16" />
            </button>
          </div>
        </div>
      </main>
    </div>
    <footer v-if="!loading" class="mc-save-bar">
      <div>
        <span class="mc-dot" :class="{ 'is-on': !dirty }" /><span role="status">{{
          dirty ? '有未保存的服务修改' : '服务配置已同步'
        }}</span
        ><span v-if="status.cacheHits && !dirty" class="mc-cache-note"
          >工具目录缓存已命中 {{ status.cacheHits }} 次</span
        >
      </div>
      <div>
        <button v-if="dirty" class="sw-text-button" :disabled="busy" @click="discard">
          撤销修改</button
        ><button class="sw-button is-primary" :disabled="busy || !dirty" @click="save">
          <WorkbenchIcon v-if="saving" name="loading" :size="15" />{{
            saving ? '保存中…' : '保存修改'
          }}
        </button>
      </div>
    </footer>
    <p class="mc-footnote">
      工具目录缓存
      {{ Math.round(status.ttlSeconds / 60) }}
      分钟；修改连接后立即失效。工具执行仍会检查最新授权。<button
        class="sw-text-button"
        @click="refreshStatus"
      >
        更新状态
      </button>
    </p>
  </section>
</template>
