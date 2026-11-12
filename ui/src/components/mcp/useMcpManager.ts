import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { Dialog, Toast } from '@halo-dev/components'
import {
  mcpApi,
  testMcpServer,
  mergeDiscoveredTools,
  newMcpServer,
  type McpConfig,
  type McpDiscovery,
  type McpServer,
  type McpStatusSnapshot,
} from '@/api/mcp'
import { workbenchErrorMessage } from '@/workbench/errors'

export function useMcpManager() {
  const config = ref<McpConfig>({ enabled: false, servers: [] })
  const baseline = ref('')
  const selectedId = ref('')
  const tab = ref<'tools' | 'connection' | 'calls'>('tools')
  const loading = ref(true),
    saving = ref(false),
    testing = ref(false),
    error = ref('')
  const catalogs = ref<Record<string, McpDiscovery>>({})
  const status = ref<McpStatusSnapshot>({ services: [], cacheHits: 0, ttlSeconds: 300 })
  const dirty = computed(() => !!baseline.value && JSON.stringify(config.value) !== baseline.value)
  const selected = computed(() =>
    config.value.servers.find((server) => server.id === selectedId.value),
  )
  const selectedStatus = computed(() =>
    status.value.services.find((s) => s.serverId === selectedId.value),
  )
  const activeTools = computed(() =>
    config.value.servers
      .filter((s) => s.enabled)
      .reduce((n, server) => n + server.tools.filter((t) => t.enabled).length, 0),
  )

  async function refreshStatus() {
    try {
      status.value = await mcpApi.status()
    } catch {
      /* Configuration remains usable if status is unavailable. */
    }
  }
  async function load() {
    loading.value = true
    error.value = ''
    try {
      config.value = await mcpApi.config()
      baseline.value = JSON.stringify(config.value)
      if (!selected.value) selectedId.value = config.value.servers[0]?.id || ''
      await refreshStatus()
    } catch (cause) {
      error.value = workbenchErrorMessage(cause, '服务加载失败，请重试')
    } finally {
      loading.value = false
    }
  }
  async function save() {
    if (saving.value) return
    saving.value = true
    error.value = ''
    try {
      config.value = await mcpApi.save(JSON.parse(JSON.stringify(config.value)))
      baseline.value = JSON.stringify(config.value)
      Toast.success('MCP 服务已保存')
      await refreshStatus()
    } catch (cause) {
      error.value = workbenchErrorMessage(cause, '保存失败，修改已保留')
    } finally {
      saving.value = false
    }
  }
  function add(preset = false) {
    if (config.value.servers.length >= 8) return
    const server = newMcpServer()
    if (preset)
      Object.assign(server, { name: 'Cloudflare 文档', url: 'https://docs.mcp.cloudflare.com/mcp' })
    config.value.servers.push(server)
    selectedId.value = server.id
    tab.value = 'connection'
  }
  function update(server: McpServer) {
    config.value.servers = config.value.servers.map((s) => (s.id === server.id ? server : s))
  }
  function remove() {
    const server = selected.value
    if (!server) return
    Dialog.warning({
      title: `移除「${server.name || '未命名服务'}」？`,
      description: '保存后，此服务提供的工具将停止向访客开放。历史调用记录仍会保留。',
      confirmText: '移除服务',
      onConfirm: () => {
        config.value.servers = config.value.servers.filter((s) => s.id !== server.id)
        delete catalogs.value[server.id]
        selectedId.value = config.value.servers[0]?.id || ''
      },
    })
  }
  async function test() {
    const server = selected.value
    if (!server || testing.value) return
    testing.value = true
    error.value = ''
    const draft = JSON.parse(JSON.stringify(server)) as McpServer
    try {
      const result = await testMcpServer(draft)
      const current = config.value.servers.find((s) => s.id === draft.id)
      if (
        !current ||
        JSON.stringify([
          current.url,
          current.token,
          current.headers,
          current.timeoutSeconds,
          current.allowPrivateNetwork,
        ]) !==
          JSON.stringify([
            draft.url,
            draft.token,
            draft.headers,
            draft.timeoutSeconds,
            draft.allowPrivateNetwork,
          ])
      )
        return
      catalogs.value[server.id] = result
      update({ ...current, tools: mergeDiscoveredTools(current.tools, result.tools) })
      Toast.success(`已连接，发现 ${result.tools.length} 个工具`)
      tab.value = 'tools'
    } catch (cause) {
      error.value = workbenchErrorMessage(cause, '连接失败，请检查服务地址与鉴权')
    } finally {
      testing.value = false
      await refreshStatus()
    }
  }
  function discard() {
    config.value = JSON.parse(baseline.value) as McpConfig
    selectedId.value = config.value.servers[0]?.id || ''
    error.value = ''
  }
  function confirmNavigation() {
    if (saving.value || testing.value) return false
    if (!dirty.value) return true
    return new Promise<boolean>((resolve) =>
      Dialog.warning({
        title: '服务修改尚未保存',
        description: '离开后，尚未保存的服务和工具修改会丢失。',
        confirmText: '放弃修改并离开',
        cancelText: '继续编辑',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      }),
    )
  }
  function beforeUnload(event: BeforeUnloadEvent) {
    if (dirty.value) {
      event.preventDefault()
      event.returnValue = ''
    }
  }
  onBeforeRouteLeave(confirmNavigation)
  onBeforeRouteUpdate((to, from) => to.query.tab === from.query.tab || confirmNavigation())
  onMounted(() => {
    void load()
    window.addEventListener('beforeunload', beforeUnload)
  })
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
  return {
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
  }
}
