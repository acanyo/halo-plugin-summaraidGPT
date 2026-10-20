import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  toRaw,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { reset, useFormKitNodeById } from '@formkit/vue'
import { Dialog, Toast } from '@halo-dev/components'
import { events } from '@halo-dev/ui-shared'
import { workbenchApi, type PluginConfig } from '@/api/workbench'
import { readPodcastConfig, savePodcastConfig } from '@/api/podcast-config'
import { hasUiPermission } from '@/utils/permissions'
import { workbenchErrorMessage } from '../errors'
import { getSettingGroup, groupValues, schemaDefaults, type SettingGroupId } from './groups'

export function useWorkbenchSettings(groupName: MaybeRefOrGetter<SettingGroupId>) {
  const formId = `summaraidgpt-config-${toValue(groupName)}`
  const config = shallowRef<PluginConfig>({})
  const loading = ref(true)
  const loaded = ref(false)
  const saving = ref(false)
  const syncing = ref(false)
  const error = ref('')
  const savedAt = ref('')
  const canManage = computed(() => hasUiPermission('system:plugins:manage'))
  const group = computed(() => getSettingGroup(toValue(groupName)))
  const values = computed(() => groupValues(group.value.group, config.value[group.value.group]))
  const configured = computed(() => Boolean(config.value[group.value.group]))
  const formNode = useFormKitNodeById(formId)
  const dirty = computed(() => canManage.value && Boolean(formNode.value?.context?.state.dirty))

  async function load() {
    loading.value = true
    error.value = ''
    try {
      config.value = await workbenchApi.getConfig()
      if (group.value.group === 'podcast') {
        config.value = { ...config.value, podcast: await readPodcastConfig(config.value.podcast) }
      }
      loaded.value = true
    } catch (cause) {
      error.value = workbenchErrorMessage(cause, '设置加载失败，请重试')
    } finally {
      loading.value = false
    }
  }

  async function save(data: Record<string, unknown>) {
    if (!loaded.value || !canManage.value || saving.value) return
    saving.value = true
    error.value = ''
    const savedGroup = group.value.group
    try {
      const savedValues = structuredClone(toRaw(data))
      const result =
        savedGroup === 'podcast'
          ? await savePodcastConfig(savedValues)
          : await workbenchApi.saveConfigGroup(savedGroup, savedValues)
      config.value = { ...config.value, [savedGroup]: result }
      reset(formId, groupValues(savedGroup, result))
      events.emit('core:plugin:configMap:updated', {
        pluginName: 'summaraidGPT',
        group: savedGroup,
      })
      Toast.success('设置已保存')
      savedAt.value = new Date().toISOString()
      return true
    } catch (cause) {
      error.value = workbenchErrorMessage(cause, '保存失败，修改已保留，请重试')
    } finally {
      saving.value = false
    }
  }

  function discardChanges() {
    reset(formId, values.value)
    error.value = ''
  }

  function applyDefaultPrompts() {
    Dialog.warning({
      title: '填入内置角色设定',
      description: '将替换当前表单中的角色提示词，保存后生效。',
      confirmText: '填入提示词',
      onConfirm: () => formNode.value?.input(schemaDefaults(group.value.formSchema)),
    })
  }

  function confirmNavigation(): boolean | Promise<boolean> {
    if (saving.value) return false
    if (!dirty.value) return true
    return new Promise((resolve) => {
      Dialog.warning({
        title: '还有未保存的修改',
        description: '离开后，本页尚未保存的设置会丢失。',
        confirmText: '放弃修改并离开',
        cancelText: '继续编辑',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
  }

  function syncSummaries() {
    if (syncing.value || !canManage.value) return
    Dialog.warning({
      title: '同步所有文章摘要',
      description: '将为文章生成 AI 摘要，会调用已配置的模型。请确认模型可用后开始。',
      confirmText: '开始同步',
      onConfirm: async () => {
        syncing.value = true
        try {
          const result = await workbenchApi.syncSummaries()
          Toast.success(result || '摘要同步已在后台开始')
        } catch (cause) {
          Toast.error(workbenchErrorMessage(cause, '摘要同步启动失败'))
        } finally {
          syncing.value = false
        }
      },
    })
  }

  function beforeUnload(event: BeforeUnloadEvent) {
    if (dirty.value || saving.value) {
      event.preventDefault()
      event.returnValue = ''
    }
  }

  onBeforeRouteUpdate(confirmNavigation)
  onBeforeRouteLeave(confirmNavigation)
  onMounted(() => {
    void load()
    window.addEventListener('beforeunload', beforeUnload)
  })
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))

  return {
    formId,
    group,
    values,
    loading,
    loaded,
    saving,
    syncing,
    error,
    dirty,
    configured,
    savedAt,
    canManage,
    load,
    save,
    syncSummaries,
    applyDefaultPrompts,
    discardChanges,
  }
}
