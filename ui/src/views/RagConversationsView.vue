<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Dialog,
  IconRefreshLine,
  Toast,
  VButton,
  VEmpty,
  VLoading,
  VPageHeader,
  VSpace,
  VTag,
} from '@halo-dev/components'
import RiDeleteBinLine from '~icons/ri/delete-bin-line'
import RiMessage3Line from '~icons/ri/message-3-line'
import RiSearchLine from '~icons/ri/search-line'
import {
  ragApi,
  type RagConversation,
  type RagKnowledgeBase,
  type RagSourceReference,
} from '@/api/rag'

const loadingKnowledgeBases = ref(false)
const loadingConversations = ref(false)
const deleting = ref(false)
const knowledgeBases = ref<RagKnowledgeBase[]>([])
const conversations = ref<RagConversation[]>([])
const activeKnowledgeBaseName = ref('')
const activeConversationName = ref('')
const keyword = ref('')

const activeKnowledgeBase = computed(() =>
  knowledgeBases.value.find((item) => item.metadata.name === activeKnowledgeBaseName.value),
)

const filteredConversations = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) {
    return conversations.value
  }
  return conversations.value.filter((conversation) => {
    const haystack = [
      conversationTitle(conversation),
      visitorText(conversation),
      conversationPreview(conversation),
      conversation.metadata.name,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(value)
  })
})

const activeConversation = computed(() =>
  conversations.value.find((item) => item.metadata.name === activeConversationName.value),
)

const fetchKnowledgeBases = async () => {
  loadingKnowledgeBases.value = true
  try {
    knowledgeBases.value = await ragApi.listKnowledgeBases()
    if (
      !activeKnowledgeBaseName.value ||
      !knowledgeBases.value.some((item) => item.metadata.name === activeKnowledgeBaseName.value)
    ) {
      activeKnowledgeBaseName.value = knowledgeBases.value[0]?.metadata.name || ''
    }
  } catch (error) {
    Toast.error('知识库加载失败')
  } finally {
    loadingKnowledgeBases.value = false
  }
}

const fetchConversations = async () => {
  if (!activeKnowledgeBaseName.value) {
    conversations.value = []
    activeConversationName.value = ''
    return
  }
  loadingConversations.value = true
  try {
    conversations.value = await ragApi.listConversations(activeKnowledgeBaseName.value, 120)
    if (
      !activeConversationName.value ||
      !conversations.value.some((item) => item.metadata.name === activeConversationName.value)
    ) {
      activeConversationName.value = conversations.value[0]?.metadata.name || ''
    }
  } catch (error) {
    Toast.error('会话记录加载失败')
  } finally {
    loadingConversations.value = false
  }
}

const refreshAll = async () => {
  await fetchKnowledgeBases()
  await fetchConversations()
}

const handleKnowledgeBaseChange = async () => {
  activeConversationName.value = ''
  keyword.value = ''
  await fetchConversations()
}

const selectConversation = (conversation: RagConversation) => {
  activeConversationName.value = conversation.metadata.name
}

const deleteConversation = (conversation: RagConversation) => {
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

const displayName = (knowledgeBase?: RagKnowledgeBase) =>
  knowledgeBase?.spec?.displayName || knowledgeBase?.metadata.name || '知识库'

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

const messageRoleClass = (role?: string) =>
  role === 'assistant' ? 'conversation-message-assistant' : 'conversation-message-user'

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
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return '-'
  const diff = Date.now() - time
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < month) return `${Math.floor(diff / day)} 天前`
  return `${Math.floor(diff / month)} 个月前`
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

onMounted(async () => {
  await fetchKnowledgeBases()
  await fetchConversations()
})
</script>

<template>
  <VPageHeader title="会话记录">
    <template #icon>
      <RiMessage3Line class="mr-2 self-center" />
    </template>
    <template #actions>
      <VSpace>
        <VButton
          type="secondary"
          :loading="loadingKnowledgeBases || loadingConversations"
          @click="refreshAll"
        >
          <template #icon>
            <IconRefreshLine class="h-full w-full" />
          </template>
          刷新
        </VButton>
      </VSpace>
    </template>
  </VPageHeader>

  <div class="conversation-page">
    <section class="conversation-toolbar">
      <div>
        <span class="section-kicker">RAG 会话</span>
        <h2>{{ displayName(activeKnowledgeBase) }}</h2>
        <p>{{ conversations.length }} 条会话，{{ filteredConversations.length }} 条匹配当前筛选</p>
      </div>
      <div class="toolbar-controls">
        <select
          v-model="activeKnowledgeBaseName"
          class="toolbar-select"
          @change="handleKnowledgeBaseChange"
        >
          <option
            v-for="knowledgeBase in knowledgeBases"
            :key="knowledgeBase.metadata.name"
            :value="knowledgeBase.metadata.name"
          >
            {{ displayName(knowledgeBase) }}
          </option>
        </select>
        <div class="toolbar-search">
          <RiSearchLine />
          <input v-model="keyword" placeholder="搜索标题、访客或消息" />
        </div>
      </div>
    </section>

    <VLoading v-if="loadingKnowledgeBases || loadingConversations" />
    <VEmpty
      v-else-if="knowledgeBases.length === 0"
      title="暂无知识库"
      message="创建知识库后，会话记录会按知识库归档在这里"
    />
    <VEmpty
      v-else-if="conversations.length === 0"
      title="暂无会话记录"
      message="前台 RAG 智能助手产生问答后，会在这里保存用户会话"
    />

    <section v-else class="conversation-shell">
      <aside class="conversation-list-panel">
        <div class="conversation-list-head">
          <strong>会话列表</strong>
          <VTag size="sm">{{ filteredConversations.length }}</VTag>
        </div>

        <VEmpty
          v-if="filteredConversations.length === 0"
          title="没有匹配会话"
          message="换个关键词试试"
        />
        <div v-else class="conversation-list">
          <button
            v-for="conversation in filteredConversations"
            :key="conversation.metadata.name"
            type="button"
            class="conversation-item"
            :class="{ active: activeConversationName === conversation.metadata.name }"
            @click="selectConversation(conversation)"
          >
            <span class="conversation-item-title">{{ conversationTitle(conversation) }}</span>
            <span class="conversation-item-preview">{{ conversationPreview(conversation) }}</span>
            <span class="conversation-item-meta">
              {{ visitorText(conversation) }} · {{ conversation.status?.messageCount || 0 }} 条 ·
              {{
                formatRelativeDate(
                  conversation.status?.lastMessageAt || conversation.metadata.creationTimestamp,
                )
              }}
            </span>
          </button>
        </div>
      </aside>

      <main class="conversation-detail">
        <template v-if="activeConversation">
          <div class="conversation-detail-head">
            <div>
              <span class="section-kicker">会话详情</span>
              <h3>{{ conversationTitle(activeConversation) }}</h3>
              <p>
                访客：{{ visitorText(activeConversation) }} · 最近：{{
                  formatDate(
                    activeConversation.status?.lastMessageAt ||
                      activeConversation.metadata.creationTimestamp,
                  )
                }}
              </p>
            </div>
            <button
              class="danger-action"
              :disabled="deleting"
              @click="deleteConversation(activeConversation)"
            >
              <RiDeleteBinLine />
              删除
            </button>
          </div>

          <dl class="conversation-metrics">
            <div>
              <dt>消息</dt>
              <dd>{{ activeConversation.status?.messageCount || 0 }}</dd>
            </div>
            <div>
              <dt>用户提问</dt>
              <dd>{{ activeConversation.status?.userMessageCount || 0 }}</dd>
            </div>
            <div>
              <dt>助手回复</dt>
              <dd>{{ activeConversation.status?.assistantMessageCount || 0 }}</dd>
            </div>
            <div>
              <dt>输入字符</dt>
              <dd>{{ activeConversation.status?.totalInputChars || 0 }}</dd>
            </div>
            <div>
              <dt>输出字符</dt>
              <dd>{{ activeConversation.status?.totalOutputChars || 0 }}</dd>
            </div>
          </dl>

          <div class="conversation-messages">
            <div
              v-for="message in activeConversation.spec?.messages || []"
              :key="message.id || `${message.role}-${message.createdAt}`"
              class="conversation-message"
              :class="messageRoleClass(message.role)"
            >
              <div class="conversation-message-head">
                <span>{{ messageRoleText(message.role) }}</span>
                <time>{{ formatDate(message.createdAt) }}</time>
              </div>
              <div class="conversation-message-content">{{ message.content }}</div>
              <div v-if="message.sources?.length" class="conversation-message-sources">
                <a
                  v-for="source in message.sources"
                  :key="source.id"
                  :href="source.url || undefined"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ sourceTitle(source) }}
                </a>
              </div>
            </div>
          </div>
        </template>
        <VEmpty v-else title="请选择会话" message="从左侧选择一条会话查看完整问答记录" />
      </main>
    </section>
  </div>
</template>

<style scoped>
.conversation-page {
  display: grid;
  gap: 14px;
  padding: 14px;
}

.conversation-toolbar,
.conversation-shell {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.conversation-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
}

.section-kicker {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 650;
}

.conversation-toolbar h2,
.conversation-detail-head h3 {
  margin: 2px 0 0;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
}

.conversation-toolbar p,
.conversation-detail-head p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.toolbar-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.toolbar-select,
.toolbar-search {
  height: 34px;
  border: 1px solid #d8dee8;
  border-radius: 7px;
  background: #fff;
}

.toolbar-select {
  min-width: 180px;
  padding: 0 10px;
  color: #111827;
  font-size: 13px;
}

.toolbar-search {
  display: grid;
  grid-template-columns: 16px minmax(160px, 220px);
  gap: 8px;
  align-items: center;
  padding: 0 10px;
}

.toolbar-search svg {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.toolbar-search input {
  min-width: 0;
  border: 0;
  outline: none;
  color: #111827;
  font-size: 13px;
}

.conversation-shell {
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  min-height: 580px;
  overflow: hidden;
}

.conversation-list-panel {
  min-width: 0;
  border-right: 1px solid #edf0f5;
}

.conversation-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid #edf0f5;
}

.conversation-list-head strong {
  color: #111827;
  font-size: 13px;
}

.conversation-list {
  display: grid;
  max-height: 640px;
  overflow-y: auto;
}

.conversation-item {
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 12px 14px;
  border: 0;
  border-bottom: 1px solid #edf0f5;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.conversation-item:hover,
.conversation-item.active {
  background: #f8fafc;
}

.conversation-item.active {
  box-shadow: inset 3px 0 0 #0f766e;
}

.conversation-item-title {
  overflow: hidden;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-item-preview {
  display: -webkit-box;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.conversation-item-meta {
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-detail {
  min-width: 0;
  background: #fff;
}

.conversation-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #edf0f5;
}

.danger-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  color: #dc2626;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 7px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.danger-action:hover {
  background: #fff7f7;
}

.danger-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.danger-action svg {
  width: 15px;
  height: 15px;
}

.conversation-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0;
  margin: 0;
  border-bottom: 1px solid #edf0f5;
}

.conversation-metrics div {
  min-width: 0;
  padding: 11px 14px;
  border-right: 1px solid #edf0f5;
}

.conversation-metrics div:last-child {
  border-right: none;
}

.conversation-metrics dt {
  color: #94a3b8;
  font-size: 12px;
}

.conversation-metrics dd {
  margin: 4px 0 0;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.conversation-messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 560px;
  padding: 16px;
  overflow-y: auto;
}

.conversation-message {
  max-width: 86%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.conversation-message-user {
  align-self: flex-end;
  background: #f8fafc;
  border-color: #cbd5e1;
}

.conversation-message-assistant {
  align-self: flex-start;
  background: #fff;
}

.conversation-message-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 11px;
}

.conversation-message-head span {
  font-weight: 700;
}

.conversation-message-content {
  color: #1e293b;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
}

.conversation-message-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.conversation-message-sources a {
  max-width: 220px;
  overflow: hidden;
  padding: 3px 7px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 999px;
  font-size: 11px;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
}

@media (max-width: 960px) {
  .conversation-toolbar,
  .conversation-detail-head {
    flex-direction: column;
  }

  .toolbar-controls {
    width: 100%;
    justify-content: flex-start;
  }

  .conversation-shell {
    grid-template-columns: 1fr;
  }

  .conversation-list-panel {
    border-right: 0;
    border-bottom: 1px solid #edf0f5;
  }
}

@media (max-width: 680px) {
  .conversation-page {
    padding: 12px;
  }

  .toolbar-select,
  .toolbar-search {
    width: 100%;
  }

  .toolbar-search {
    grid-template-columns: 16px minmax(0, 1fr);
  }

  .conversation-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .conversation-metrics div {
    border-bottom: 1px solid #edf0f5;
  }

  .conversation-message {
    max-width: 100%;
  }
}
</style>
