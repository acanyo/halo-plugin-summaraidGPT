import { computed, onMounted, ref, shallowRef } from 'vue'
import { Dialog, Toast } from '@halo-dev/components'
import { events } from '@halo-dev/ui-shared'
import { workbenchApi, type PluginConfig } from '@/api/workbench'
import { hasUiPermission } from '@/utils/permissions'
import { workbenchErrorMessage } from '../../errors'
import { migratedConfig, migrationRecord, planLegacyMigration, undoLegacyMigration } from './plan'
import { settingGroups } from '../groups'

export function useLegacyMigration() {
  const config = shallowRef<PluginConfig>({})
  const loading = ref(true)
  const saving = ref(false)
  const loaded = ref(false)
  const error = ref('')
  const canManage = computed(() => hasUiPermission('system:plugins:manage'))
  const record = computed(() => migrationRecord(config.value))
  const plan = computed(() => planLegacyMigration(config.value))
  async function load() {
    loading.value = true
    error.value = ''
    try {
      config.value = await workbenchApi.getConfig()
      loaded.value = true
    } catch (cause) {
      error.value = workbenchErrorMessage(cause, '旧设置检查失败，请重试')
    } finally {
      loading.value = false
    }
  }
  function notify() {
    for (const { group } of settingGroups)
      events.emit('core:plugin:configMap:updated', { pluginName: 'summaraidGPT', group })
  }
  async function migrate() {
    if (!canManage.value || saving.value || !loaded.value) return
    saving.value = true
    error.value = ''
    try {
      // Re-read immediately before the write: the preview may have been open while settings changed.
      const latest = await workbenchApi.getConfig()
      const next = migratedConfig(latest, new Date().toISOString())
      if (!migrationRecord(latest)) await workbenchApi.replaceConfig(next)
      config.value = next
      notify()
      Toast.success('旧设置迁移完成，原有配置已保留')
    } catch (cause) {
      error.value = workbenchErrorMessage(cause, '迁移失败，旧设置未删除，请重试')
    } finally {
      saving.value = false
    }
  }
  function undo() {
    if (!canManage.value || saving.value || !record.value) return
    Dialog.warning({
      title: '撤销旧设置迁移',
      description: '仅移除迁移补齐且之后没有修改的配置。迁移后手动调整的值会保留。',
      confirmText: '撤销迁移',
      onConfirm: async () => {
        saving.value = true
        error.value = ''
        try {
          const result = undoLegacyMigration(await workbenchApi.getConfig())
          await workbenchApi.replaceConfig(result.config)
          config.value = result.config
          notify()
          Toast.success(
            result.retained ? `已撤销迁移，保留 ${result.retained} 项后续修改` : '已撤销迁移',
          )
        } catch (cause) {
          error.value = workbenchErrorMessage(cause, '撤销失败，请重试')
        } finally {
          saving.value = false
        }
      },
    })
  }
  function downloadBackup() {
    if (!record.value) return
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(record.value.backup, null, 2)], { type: 'application/json' }),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `summaraidgpt-before-migration-${record.value.completedAt.slice(0, 10)}.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  onMounted(load)
  return {
    loading,
    loaded,
    saving,
    error,
    canManage,
    record,
    plan,
    load,
    migrate,
    undo,
    downloadBackup,
  }
}
