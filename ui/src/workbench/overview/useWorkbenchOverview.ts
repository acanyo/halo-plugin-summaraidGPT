import { computed, onMounted, ref, shallowRef } from 'vue'
import { aiCallLogApi } from '@/api/ai-call-logs'
import { petApi, type PetCompanion } from '@/api/pets'
import { ragApi, type RagKnowledgeBase } from '@/api/rag'
import { workbenchApi, type PluginConfig } from '@/api/workbench'
import { hasUiPermission } from '@/utils/permissions'
import { workbenchErrorMessage } from '../errors'

export function useWorkbenchOverview(options: { activity?: boolean } = {}) {
  const loading = ref(true)
  const errors = ref<string[]>([])
  const config = shallowRef<PluginConfig>()
  const knowledgeBases = ref<RagKnowledgeBase[]>()
  const importedDocuments = ref<number>()
  const pets = ref<PetCompanion[]>()
  const conversationCount = ref<number>()
  const callCount = ref<number>()

  const languageModel = computed(() => {
    const basic = config.value?.basic
    const text = basic?.textModelSetting as Record<string, unknown> | undefined
    return String(text?.ragLanguageModelName || basic?.languageModelName || '').trim()
  })
  const embeddingModel = computed(() => {
    const vector = config.value?.basic?.vectorModelSetting as Record<string, unknown> | undefined
    return String(vector?.embeddingModelName || '').trim()
  })
  const activePet = computed(() => pets.value?.find((pet) => pet.spec?.active && pet.spec.enabled))
  const readyKnowledgeBases = computed(() =>
    knowledgeBases.value?.filter(
      (kb) =>
        kb.spec?.enabled !== false &&
        kb.status?.indexState === 'READY' &&
        !kb.metadata.deletionTimestamp,
    ),
  )
  const indexedDocuments = computed(() =>
    knowledgeBases.value?.reduce((total, kb) => total + (kb.status?.documentCount || 0), 0),
  )
  const failedKnowledgeBases = computed(
    () =>
      knowledgeBases.value?.filter(
        (kb) => kb.status?.indexState === 'ERROR' && !kb.metadata.deletionTimestamp,
      ) || [],
  )

  async function load() {
    if (!loading.value) loading.value = true
    errors.value = []
    const read = async (permission: string, label: string, action: () => Promise<void>) => {
      if (!hasUiPermission(permission)) return
      try {
        await action()
      } catch (error) {
        errors.value.push(`${label}：${workbenchErrorMessage(error, '读取失败，请重试')}`)
      }
    }
    await Promise.all([
      read('system:plugins:view', '模型与助手设置', async () => {
        config.value = await workbenchApi.getConfig()
      }),
      read('plugin:summaraidGPT:rag:view', '知识库', async () => {
        knowledgeBases.value = (await ragApi.listKnowledgeBases()).filter(
          (kb) => !kb.metadata.deletionTimestamp,
        )
        const stats = await Promise.all(
          knowledgeBases.value.map((kb) => ragApi.stats(kb.metadata.name)),
        )
        importedDocuments.value = stats.reduce((total, item) => total + item.totalDocuments, 0)
      }),
      read('plugin:summaraidGPT:pets:view', '助手形象', async () => {
        pets.value = await petApi.list()
      }),
      options.activity !== false &&
        read('plugin:summaraidGPT:rag:view', '会话记录', async () => {
          conversationCount.value = (await ragApi.listConversations({ page: 1, size: 1 })).total
        }),
      options.activity !== false &&
        read('plugin:summaraidGPT:ai-call-logs:view', '调用日志', async () => {
          callCount.value = (await aiCallLogApi.list({ page: 1, size: 1 })).total
        }),
    ])
    loading.value = false
  }

  onMounted(load)

  return {
    loading,
    errors,
    config,
    knowledgeBases,
    importedDocuments,
    languageModel,
    embeddingModel,
    activePet,
    readyKnowledgeBases,
    indexedDocuments,
    failedKnowledgeBases,
    conversationCount,
    callCount,
    load,
  }
}
