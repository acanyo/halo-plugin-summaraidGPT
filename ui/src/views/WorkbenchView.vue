<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { hasUiPermission } from '@/utils/permissions'
import WorkbenchIcon from '@/workbench/components/WorkbenchIcon.vue'
import WorkbenchTabs from '@/workbench/components/WorkbenchTabs.vue'
import {
  getWorkbenchTab,
  visibleWorkbenchTabs,
  workbenchLocation,
  type WorkbenchTabId,
} from '@/workbench/navigation'
import '@/workbench/styles/index.css'

const route = useRoute()
const router = useRouter()
const tabs = computed(() => visibleWorkbenchTabs(hasUiPermission))
const activeTab = computed(() => getWorkbenchTab(route.query.tab))
const canAccess = computed(() => tabs.value.some((tab) => tab.id === activeTab.value.id))

const panels = {
  guide: defineAsyncComponent(() => import('@/workbench/guide/WorkbenchGuide.vue')),
  overview: defineAsyncComponent(() => import('@/workbench/overview/WorkbenchOverview.vue')),
  knowledge: defineAsyncComponent(() => import('@/views/RagKnowledgeView.vue')),
  reading: defineAsyncComponent(() => import('@/views/ArticleReadingGraphView.vue')),
  podcast: defineAsyncComponent(() => import('@/components/podcast/PodcastManager.vue')),
  assistant: defineAsyncComponent(() => import('@/views/PetListView.vue')),
  conversations: defineAsyncComponent(() => import('@/views/RagConversationsView.vue')),
  logs: defineAsyncComponent(() => import('@/views/AiCallLogsView.vue')),
  settings: defineAsyncComponent(() => import('@/workbench/settings/WorkbenchSettings.vue')),
}

function navigate(tab: WorkbenchTabId) {
  if (tab !== activeTab.value.id) void router.push(workbenchLocation(tab))
}
</script>

<template>
  <div class="sw-workbench">
    <header class="sw-app-header">
      <RouterLink :to="workbenchLocation('overview')" class="sw-brand" aria-label="智阅工作台概览">
        <img
          src="/plugins/summaraidGPT/assets/static/icon.svg"
          class="sw-brand-mark"
          width="33"
          height="33"
          alt=""
        />
        <strong>智阅</strong>
        <span class="sw-brand-divider" aria-hidden="true">/</span>
        <span class="sw-brand-caption">AI 工作台</span>
      </RouterLink>
      <div class="sw-header-links">
        <a
          href="https://docs.xhhao.com/plugins/zhiyue/"
          target="_blank"
          rel="noopener noreferrer"
          class="sw-text-button"
          aria-label="查看智阅文档（新窗口打开）"
          title="查看智阅文档"
        >
          <WorkbenchIcon name="book" :size="15" /><span>查看文档</span>
        </a>
        <a
          href="https://qm.qq.com/q/YqlBX8d2Ei"
          target="_blank"
          rel="noopener noreferrer"
          class="sw-text-button"
          aria-label="QQ 讨论：Halo插件主题交流群（新窗口打开）"
          title="QQ 讨论：Halo插件主题交流群"
        >
          <WorkbenchIcon name="message" :size="15" /><span>QQ 讨论</span>
        </a>
      </div>
    </header>

    <WorkbenchTabs :tabs="tabs" :active="activeTab.id" @select="navigate" />

    <main
      :id="`sw-panel-${activeTab.id}`"
      class="sw-main"
      role="tabpanel"
      :aria-labelledby="canAccess ? `sw-tab-${activeTab.id}` : undefined"
      tabindex="0"
    >
      <RouterLink
        v-if="activeTab.id !== 'guide' && typeof route.query.guide === 'string'"
        :to="workbenchLocation('guide', { step: route.query.guide })"
        class="sw-text-button sw-guide-return"
        >继续使用引导<WorkbenchIcon name="arrow" :size="15"
      /></RouterLink>
      <component :is="panels[activeTab.id]" v-if="canAccess" :key="activeTab.id" />
      <div v-else class="sw-access-state" role="status">
        <WorkbenchIcon name="info" :size="28" />
        <h1>当前账号没有此功能的访问权限</h1>
        <p>请联系站点管理员分配相应权限，或返回查看其他功能。</p>
        <RouterLink :to="workbenchLocation('overview')" class="sw-button">返回概览</RouterLink>
      </div>
    </main>
    <footer class="sw-footer">
      <span>智阅 AI 工作台</span><span>摘要 · 知识库 · 站点助手</span>
    </footer>
  </div>
</template>
