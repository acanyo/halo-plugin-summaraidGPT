<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Dialog,
  IconRefreshLine,
  Toast,
  VButton,
  VCard,
  VDropdownItem,
  VEmpty,
  VEntity,
  VEntityContainer,
  VEntityField,
  VLoading,
  VPageHeader,
  VPagination,
  VSpace,
  VStatusDot,
} from '@halo-dev/components'
import { utils } from '@halo-dev/ui-shared'
import RiDeleteBinLine from '~icons/ri/delete-bin-line'
import RiMessage3Line from '~icons/ri/message-3-line'
import { ragApi, type RagConversation, type RagSourceReference } from '@/api/rag'
import { hasUiPermission } from '@/utils/permissions'

const loadingConversations = ref(false)
const deleting = ref(false)
const conversations = ref<RagConversation[]>([])
const activeConversationName = ref('')
const keyword = ref('')
const conversationPage = ref(1)
const conversationPageSize = ref(20)
const conversationTotal = ref(0)
const RAG_MANAGE_PERMISSION = 'plugin:summaraidGPT:rag:manage'
const CONVERSATION_DELETING_REFETCH_INTERVAL = 1000
let keywordTimer: ReturnType<typeof window.setTimeout> | undefined
let deletingConversationRefetchTimer: ReturnType<typeof window.setInterval> | undefined

const canManageRag = computed(() => hasUiPermission(RAG_MANAGE_PERMISSION))
const activeConversation = computed(() =>
  conversations.value.find((item) => item.metadata.name === activeConversationName.value),
)

const isConversationDeleting = (conversation?: RagConversation) =>
  Boolean(conversation?.metadata.deletionTimestamp)

const deletingConversationRefetchInterval = (data?: RagConversation[]) => {
  const hasDeletingConversation = data?.some((item) => item.metadata.deletionTimestamp)
  return hasDeletingConversation ? CONVERSATION_DELETING_REFETCH_INTERVAL : false
}

const clearDeletingConversationRefetch = () => {
  if (!deletingConversationRefetchTimer) {
    return
  }
  window.clearInterval(deletingConversationRefetchTimer)
  deletingConversationRefetchTimer = undefined
}

const syncDeletingConversationRefetch = () => {
  const interval = deletingConversationRefetchInterval(conversations.value)
  if (!interval) {
    clearDeletingConversationRefetch()
    return
  }
  if (deletingConversationRefetchTimer) {
    return
  }
  deletingConversationRefetchTimer = window.setInterval(() => {
    fetchConversations({ silent: true })
  }, interval)
}

const fetchConversations = async (options: { silent?: boolean } = {}) => {
  if (!options.silent) {
    loadingConversations.value = true
  }
  try {
    const page = await ragApi.listConversations({
      keyword: keyword.value.trim() || undefined,
      page: conversationPage.value,
      size: conversationPageSize.value,
    })
    conversations.value = page.items
    conversationPage.value = page.page
    conversationPageSize.value = page.size
    conversationTotal.value = page.total
    syncDeletingConversationRefetch()
    if (page.items.length === 0 && page.total > 0 && conversationPage.value > 1) {
      conversationPage.value = Math.max(1, Math.ceil(page.total / conversationPageSize.value))
      return
    }
    const selectedConversation = conversations.value.find(
      (item) => item.metadata.name === activeConversationName.value,
    )
    if (
      !activeConversationName.value ||
      !selectedConversation ||
      isConversationDeleting(selectedConversation)
    ) {
      activeConversationName.value =
        conversations.value.find((item) => !isConversationDeleting(item))?.metadata.name || ''
    }
  } catch (error) {
    if (!options.silent) {
      Toast.error('会话记录加载失败')
    }
  } finally {
    if (!options.silent) {
      loadingConversations.value = false
    }
  }
}

const refreshAll = async () => {
  await fetchConversations()
}

const selectConversation = (conversation: RagConversation) => {
  if (isConversationDeleting(conversation)) {
    return
  }

  activeConversationName.value = conversation.metadata.name
}

const deleteConversation = (conversation: RagConversation) => {
  if (isConversationDeleting(conversation)) {
    return
  }

  Dialog.warning({
    title: '删除会话记录',
    description: `确定删除「${conversationTitle(conversation)}」吗？此操作不会影响知识库索引。`,
    confirmType: 'danger',
    onConfirm: async () => {
      deleting.value = true
      try {
        await ragApi.deleteConversation(conversation.metadata.name)
        Toast.success('已删除')
        await fetchConversations()
      } catch (error) {
        Toast.error('删除失败')
      } finally {
        deleting.value = false
      }
    },
  })
}

const conversationTitle = (conversation?: RagConversation) =>
  conversation?.spec?.title || conversation?.metadata.name || '未命名会话'

const visitorText = (conversation?: RagConversation) =>
  conversation?.spec?.visitorId
    ? conversation.spec.visitorId.replace(/^rag-visitor-/, '')
    : '未知访客'

const conversationPreview = (conversation?: RagConversation) => {
  const messages = conversation?.spec?.messages || []
  const last = [...messages].reverse().find((message) => message.content?.trim())
  return stripHtmlAndMarkdown(last?.content).slice(0, 120) || '暂无消息'
}

const messageRoleText = (role?: string) => (role === 'assistant' ? '助手' : '用户')

const messageAlignClass = (role?: string) =>
  role === 'assistant' ? ':uno: justify-start' : ':uno: justify-end'

const messageBubbleClass = (role?: string, error?: boolean) => {
  if (error) {
    return ':uno: border border-red-200 bg-red-50 text-red-700'
  }
  if (role === 'assistant') {
    return ':uno: border border-slate-200 bg-white text-slate-800 shadow-sm'
  }
  return ':uno: bg-blue-600 text-white'
}

const sourceTitle = (source: RagSourceReference) => source.title || source.id

const stripHtmlAndMarkdown = (text?: string): string => {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const formatRelativeDate = (value?: string) => {
  if (!value) return '-'
  return utils.date.timeAgo(value)
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return utils.date.format(value)
}

watch([conversationPage, conversationPageSize], () => fetchConversations())

watch(keyword, () => {
  if (keywordTimer) {
    window.clearTimeout(keywordTimer)
  }
  keywordTimer = window.setTimeout(() => {
    activeConversationName.value = ''
    if (conversationPage.value === 1) {
      fetchConversations()
      return
    }
    conversationPage.value = 1
  }, 280)
})

onBeforeUnmount(() => {
  if (keywordTimer) {
    window.clearTimeout(keywordTimer)
  }
  clearDeletingConversationRefetch()
})

onMounted(fetchConversations)
</script>

<template>
  <VPageHeader title="会话记录">
    <template #icon>
      <RiMessage3Line class="mr-2 self-center" />
    </template>
    <template #actions>
      <VSpace>
        <VButton type="secondary" :loading="loadingConversations" @click="refreshAll">
          <template #icon>
            <IconRefreshLine class="h-full w-full" />
          </template>
          刷新
        </VButton>
      </VSpace>
    </template>
  </VPageHeader>

  <div class=":uno: p-4 max-[680px]:p-3">
    <div
      class=":uno: grid grid-cols-[minmax(320px,420px)_minmax(0,1fr)] items-start gap-2 max-[960px]:grid-cols-1"
    >
      <VCard class=":uno: min-w-0" :body-class="[':uno: !p-0']">
        <template #header>
          <div
            class=":uno: flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3 max-[960px]:flex-col max-[960px]:items-stretch"
          >
            <div class=":uno: flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <strong class=":uno: text-lg leading-none text-gray-900">
                {{ conversationTotal }}
              </strong>
              <span>条会话</span>
              <span v-if="keyword.trim()">匹配“{{ keyword.trim() }}”</span>
            </div>
            <SearchInput v-model="keyword" placeholder="搜索标题、访客或消息" />
          </div>
        </template>

        <VLoading v-if="loadingConversations" />
        <VEmpty
          v-else-if="conversationTotal === 0"
          :title="keyword.trim() ? '没有匹配会话' : '暂无会话记录'"
          :message="keyword.trim() ? '换个关键词试试' : '前台产生 RAG 问答后，会在这里保存会话'"
        />

        <VEntityContainer v-else class="conversation-entity-list">
          <VEntity
            v-for="conversation in conversations"
            :key="conversation.metadata.name"
            :is-selected="activeConversationName === conversation.metadata.name"
            :class="{
              ':uno: pointer-events-none opacity-[0.56]': isConversationDeleting(conversation),
            }"
            @click="selectConversation(conversation)"
          >
            <template #start>
              <VEntityField
                :title="conversationTitle(conversation)"
                :description="conversationPreview(conversation)"
              />
            </template>
            <template #end>
              <VEntityField>
                <template #description>
                  <VStatusDot
                    v-if="isConversationDeleting(conversation)"
                    v-tooltip="'删除中'"
                    state="warning"
                    text="删除中"
                  />
                  <VStatusDot
                    v-else
                    state="success"
                    :text="`${conversation.status?.messageCount || 0} 条`"
                  />
                </template>
              </VEntityField>
              <VEntityField>
                <template #description>
                  <span
                    class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                  >
                    {{ visitorText(conversation) }}
                  </span>
                </template>
              </VEntityField>
              <VEntityField>
                <template #description>
                  <span
                    class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500 tabular-nums"
                  >
                    {{
                      formatRelativeDate(
                        conversation.status?.lastMessageAt ||
                          conversation.metadata.creationTimestamp,
                      )
                    }}
                  </span>
                </template>
              </VEntityField>
            </template>
            <template v-if="canManageRag && !isConversationDeleting(conversation)" #dropdownItems>
              <VDropdownItem
                v-permission="[RAG_MANAGE_PERMISSION]"
                type="danger"
                :disabled="deleting"
                @click="deleteConversation(conversation)"
              >
                删除
              </VDropdownItem>
            </template>
          </VEntity>
        </VEntityContainer>

        <template #footer>
          <VPagination
            v-model:page="conversationPage"
            v-model:size="conversationPageSize"
            page-label="页"
            size-label="条 / 页"
            :total-label="`共 ${conversationTotal} 项数据`"
            :total="conversationTotal"
            :size-options="[10, 20, 50, 100]"
          />
        </template>
      </VCard>

      <VCard class=":uno: min-w-0" :body-class="[':uno: !p-0']">
        <template #header>
          <div
            class=":uno: flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3 max-[960px]:flex-col max-[960px]:items-stretch"
          >
            <div class=":uno: grid min-w-0 gap-[3px]">
              <strong
                class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-snug text-gray-900"
              >
                {{ activeConversation ? conversationTitle(activeConversation) : '会话详情' }}
              </strong>
              <span
                v-if="activeConversation"
                class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
              >
                访客 {{ visitorText(activeConversation) }} · 最近
                {{
                  formatDate(
                    activeConversation.status?.lastMessageAt ||
                      activeConversation.metadata.creationTimestamp,
                  )
                }}
              </span>
              <span v-else class=":uno: text-xs text-slate-500">从左侧选择一条会话</span>
            </div>
            <VButton
              v-if="
                activeConversation && canManageRag && !isConversationDeleting(activeConversation)
              "
              v-permission="[RAG_MANAGE_PERMISSION]"
              size="sm"
              type="danger"
              :disabled="deleting"
              @click="deleteConversation(activeConversation)"
            >
              <template #icon>
                <RiDeleteBinLine class="h-full w-full" />
              </template>
              删除
            </VButton>
          </div>
        </template>

        <template v-if="activeConversation">
          <dl
            class=":uno: m-0 grid grid-cols-5 border-b border-[#edf0f5] bg-white max-[680px]:grid-cols-2"
          >
            <div class=":uno: min-w-0 border-r border-[#edf0f5] px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">消息</dt>
              <dd class=":uno: m-0 mt-1 text-[15px] font-bold text-gray-900">
                {{ activeConversation.status?.messageCount || 0 }}
              </dd>
            </div>
            <div class=":uno: min-w-0 border-r border-[#edf0f5] px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">用户</dt>
              <dd class=":uno: m-0 mt-1 text-[15px] font-bold text-blue-700">
                {{ activeConversation.status?.userMessageCount || 0 }}
              </dd>
            </div>
            <div class=":uno: min-w-0 border-r border-[#edf0f5] px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">助手</dt>
              <dd class=":uno: m-0 mt-1 text-[15px] font-bold text-slate-900">
                {{ activeConversation.status?.assistantMessageCount || 0 }}
              </dd>
            </div>
            <div class=":uno: min-w-0 border-r border-[#edf0f5] px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">输入字符</dt>
              <dd class=":uno: m-0 mt-1 text-[15px] font-bold text-gray-900">
                {{ activeConversation.status?.totalInputChars || 0 }}
              </dd>
            </div>
            <div class=":uno: min-w-0 px-3.5 py-3">
              <dt class=":uno: text-xs text-slate-400">输出字符</dt>
              <dd class=":uno: m-0 mt-1 text-[15px] font-bold text-gray-900">
                {{ activeConversation.status?.totalOutputChars || 0 }}
              </dd>
            </div>
          </dl>

          <div class=":uno: max-h-[640px] overflow-y-auto bg-[#f6f8fb] px-4 py-4">
            <div v-if="activeConversation.spec?.messages?.length" class=":uno: flex flex-col gap-3">
              <article
                v-for="message in activeConversation.spec?.messages || []"
                :key="message.id || `${message.role}-${message.createdAt}`"
                class=":uno: flex"
                :class="messageAlignClass(message.role)"
              >
                <div
                  class=":uno: flex max-w-[min(720px,86%)] flex-col gap-1.5"
                  :class="message.role === 'assistant' ? ':uno: items-start' : ':uno: items-end'"
                >
                  <div class=":uno: flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span class=":uno: font-bold">
                      {{ messageRoleText(message.role) }}
                    </span>
                    <time class=":uno: tabular-nums">{{ formatDate(message.createdAt) }}</time>
                  </div>
                  <div
                    class=":uno: max-w-full whitespace-pre-wrap break-words rounded-lg px-3 py-2.5 text-[13px] leading-relaxed"
                    :class="messageBubbleClass(message.role, message.error)"
                  >
                    {{ message.content || '空消息' }}
                  </div>
                  <div
                    v-if="message.sources?.length"
                    class=":uno: flex max-w-full flex-wrap gap-1.5"
                    :class="
                      message.role === 'assistant' ? ':uno: justify-start' : ':uno: justify-end'
                    "
                  >
                    <a
                      v-for="source in message.sources"
                      :key="source.id"
                      :href="source.url || undefined"
                      target="_blank"
                      rel="noopener noreferrer"
                      class=":uno: max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-blue-100 bg-white px-[7px] py-[3px] text-[11px] text-blue-600 no-underline shadow-sm"
                    >
                      {{ sourceTitle(source) }}
                    </a>
                  </div>
                </div>
              </article>
            </div>
            <VEmpty v-else title="暂无消息" message="这条会话还没有保存消息" />
          </div>
        </template>
        <VEmpty v-else title="请选择会话" message="从左侧选择一条会话查看完整问答记录" />
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.conversation-entity-list :deep(.entity-start) {
  min-width: 0;
  width: 100%;
}

.conversation-entity-list :deep(.entity-end) {
  gap: 16px;
  row-gap: 6px;
}
</style>
