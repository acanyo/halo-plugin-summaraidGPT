<script setup lang="ts">
import { computed } from 'vue'
import { hasUiPermission } from '@/utils/permissions'
import { workbenchLocation, visibleWorkbenchTabs, type WorkbenchTabId } from '../navigation'
import WorkbenchIcon from '../components/WorkbenchIcon.vue'
import WorkbenchSectionHeader from '../components/WorkbenchSectionHeader.vue'
import { useWorkbenchOverview } from './useWorkbenchOverview'

const {
  loading,
  errors,
  config,
  knowledgeBases,
  languageModel,
  embeddingModel,
  activePet,
  readyKnowledgeBases,
  indexedDocuments,
  failedKnowledgeBases,
  conversationCount,
  callCount,
  load,
} = useWorkbenchOverview()

const tabs = computed(() => visibleWorkbenchTabs(hasUiPermission))
const canOpen = (id: WorkbenchTabId) => tabs.value.some((tab) => tab.id === id)
const modelSettings = computed(() =>
  canOpen('settings') ? workbenchLocation('settings', { group: 'basic' }) : undefined,
)
const metrics = computed(() =>
  [
    {
      label: '知识库',
      value: knowledgeBases.value?.length,
      detail: '内容的归处',
      tab: 'knowledge' as const,
      icon: 'book',
    },
    {
      label: '已索引文档',
      value: indexedDocuments.value,
      detail: `${readyKnowledgeBases.value?.length ?? '—'} 个知识库已就绪`,
      tab: 'knowledge' as const,
      icon: 'graph',
    },
    {
      label: '访客会话',
      value: conversationCount.value,
      detail: '每一次内容对话',
      tab: 'conversations' as const,
      icon: 'message',
    },
    {
      label: '模型调用',
      value: callCount.value,
      detail: '查看记录与运行情况',
      tab: 'logs' as const,
      icon: 'activity',
    },
  ].filter((metric) => canOpen(metric.tab)),
)

const shortcuts = computed(() =>
  [
    {
      tab: 'knowledge' as const,
      icon: 'book',
      title: '管理知识库',
      description: '导入资料，测试检索与问答',
    },
    {
      tab: 'reading' as const,
      icon: 'graph',
      title: '生成洞察图谱',
      description: '把文章变成清晰的阅读脉络',
    },
    {
      tab: 'assistant' as const,
      icon: 'pet',
      title: '定制前台助手',
      description: '选择一个适合站点的助手形象',
    },
  ].filter((item) => canOpen(item.tab)),
)
</script>

<template>
  <WorkbenchSectionHeader
    title="让你的内容，随时可以对话。"
    description="从模型到知识库，在这里完成站点 AI 助手的配置与管理。"
  >
    <template #actions>
      <button type="button" class="sw-button" :disabled="loading" @click="load">
        <WorkbenchIcon name="refresh" :size="15" :class="{ 'is-spinning': loading }" />{{
          loading ? '检查中…' : '检查状态'
        }}
      </button>
    </template>
  </WorkbenchSectionHeader>

  <div v-if="errors.length" class="sw-notice" role="alert">
    <WorkbenchIcon name="info" :size="17" />
    <div>
      <strong>部分状态暂时无法读取</strong>
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>
  </div>

  <div class="sw-metrics" :aria-busy="loading">
    <RouterLink
      v-for="metric in metrics"
      :key="metric.label"
      :to="workbenchLocation(metric.tab)"
      class="sw-metric"
    >
      <span class="sw-metric-label"
        ><WorkbenchIcon :name="metric.icon" :size="16" />{{ metric.label
        }}<WorkbenchIcon name="arrow" :size="14"
      /></span>
      <strong>{{
        loading ? '—' : metric.value === undefined ? '—' : metric.value.toLocaleString()
      }}</strong>
      <span class="sw-muted">{{ metric.detail }}</span>
    </RouterLink>
  </div>

  <div class="sw-overview-grid">
    <section class="sw-setup sw-guide-intro" aria-labelledby="sw-guide-intro-title">
      <span class="sw-eyebrow">GET STARTED</span>
      <h2 id="sw-guide-intro-title">第一次使用，从这里开始。</h2>
      <p>跟着引导选择模型、导入知识、构建索引，再开启前台助手。每一步都有操作说明和对应入口。</p>
      <RouterLink :to="workbenchLocation('guide')" class="sw-button is-primary"
        >打开使用引导<WorkbenchIcon name="arrow" :size="16"
      /></RouterLink>
    </section>
    <aside class="sw-workspace-status" aria-labelledby="sw-status-title">
      <header class="sw-card-heading">
        <div>
          <span class="sw-eyebrow">WORKSPACE</span>
          <h2 id="sw-status-title">当前配置</h2>
        </div>
        <WorkbenchIcon name="settings" :size="18" />
      </header>
      <dl class="sw-status-list">
        <div>
          <dt>问答模型</dt>
          <dd :title="languageModel">
            {{ languageModel || (config ? '沿用 AI 基座默认' : '暂未读取') }}
          </dd>
        </div>
        <div>
          <dt>向量模型</dt>
          <dd :title="embeddingModel">
            {{ embeddingModel || (config ? '沿用 AI 基座默认' : '暂未读取') }}
          </dd>
        </div>
        <div>
          <dt>前台助手</dt>
          <dd>
            <span
              class="sw-status-dot"
              :class="{ 'is-ready': config?.assistant?.enableAssistant }"
            />{{ !config ? '暂未读取' : config.assistant?.enableAssistant ? '已开启' : '未开启' }}
          </dd>
        </div>
        <div>
          <dt>当前形象</dt>
          <dd>{{ activePet?.spec?.displayName || '默认形象' }}</dd>
        </div>
      </dl>
      <p class="sw-status-note">模型选择状态来自插件配置，实际可用性请在 AI 基座中测试。</p>
      <RouterLink v-if="modelSettings" :to="modelSettings" class="sw-text-button"
        >管理模型与设置<WorkbenchIcon name="arrow" :size="14"
      /></RouterLink>
      <div v-if="failedKnowledgeBases.length" class="sw-index-alert" role="status">
        <WorkbenchIcon name="info" :size="16" /><span
          >{{ failedKnowledgeBases.length }} 个知识库的索引需要检查</span
        >
        <RouterLink :to="workbenchLocation('knowledge')">查看</RouterLink>
      </div>
    </aside>
  </div>

  <section v-if="shortcuts.length" class="sw-shortcuts" aria-labelledby="sw-shortcuts-title">
    <div class="sw-small-heading">
      <h2 id="sw-shortcuts-title">接下来，试试这些</h2>
      <span>按你的需要开始</span>
    </div>
    <div class="sw-shortcut-grid">
      <RouterLink
        v-for="item in shortcuts"
        :key="item.tab"
        :to="workbenchLocation(item.tab)"
        class="sw-shortcut"
      >
        <span class="sw-shortcut-icon"><WorkbenchIcon :name="item.icon" :size="21" /></span>
        <span
          ><strong>{{ item.title }}</strong
          ><span>{{ item.description }}</span></span
        >
        <WorkbenchIcon name="arrow" :size="17" />
      </RouterLink>
    </div>
  </section>
</template>
