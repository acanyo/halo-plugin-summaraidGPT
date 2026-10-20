import type { LocationQuery, RouteLocationAsPathGeneric } from 'vue-router'

export const WORKBENCH_PATH = '/summaraidgpt'

export const workbenchTabs = [
  { id: 'guide', label: '使用引导', icon: 'sparkles', permission: undefined },
  { id: 'overview', label: '概览', icon: 'home', permission: undefined },
  { id: 'knowledge', label: '知识库', icon: 'book', permission: 'plugin:summaraidGPT:rag:view' },
  {
    id: 'reading',
    label: '洞察图谱',
    icon: 'graph',
    permission: 'plugin:summaraidGPT:article-reading:view',
  },
  { id: 'assistant', label: '前台助手', icon: 'pet', permission: 'plugin:summaraidGPT:pets:view' },
  {
    id: 'podcast',
    label: '播客听读',
    icon: 'headphones',
    permission: 'plugin:summaraidGPT:podcast:view',
  },
  {
    id: 'conversations',
    label: '会话记录',
    icon: 'message',
    permission: 'plugin:summaraidGPT:rag:view',
  },
  {
    id: 'logs',
    label: '调用日志',
    icon: 'activity',
    permission: 'plugin:summaraidGPT:ai-call-logs:view',
  },
  { id: 'settings', label: '设置', icon: 'settings', permission: 'system:plugins:view' },
] as const

export type WorkbenchTabId = (typeof workbenchTabs)[number]['id']
export type WorkbenchTab = (typeof workbenchTabs)[number]

export const workbenchPermissions = [
  ...new Set(workbenchTabs.flatMap((tab) => (tab.permission ? [tab.permission] : []))),
]

export const legacyWorkbenchPages = [
  { path: '/summaraidgpt/article-readings', name: 'SummaraidGptArticleReadings', tab: 'reading' },
  { path: '/summaraidgpt/rag', name: 'SummaraidGptRagKnowledge', tab: 'knowledge' },
  { path: '/summaraidgpt/pets', name: 'SummaraidGptPets', tab: 'assistant' },
  {
    path: '/summaraidgpt/rag-conversations',
    name: 'SummaraidGptRagConversations',
    tab: 'conversations',
  },
  { path: '/summaraidgpt/ai-call-logs', name: 'SummaraidGptAiCallLogs', tab: 'logs' },
] as const

export function getWorkbenchTab(value: unknown): WorkbenchTab {
  return workbenchTabs.find((tab) => tab.id === value) || workbenchTabs[0]
}

export function visibleWorkbenchTabs(hasPermission: (permission: string) => boolean) {
  return workbenchTabs.filter((tab) => !tab.permission || hasPermission(tab.permission))
}

export function workbenchLocation(
  tab: WorkbenchTabId,
  query: LocationQuery = {},
): RouteLocationAsPathGeneric {
  return { path: WORKBENCH_PATH, query: { ...query, tab } }
}

export function legacyWorkbenchRedirect(
  tab: WorkbenchTabId,
  location: { query: LocationQuery; hash: string },
): RouteLocationAsPathGeneric {
  return { ...workbenchLocation(tab, location.query), hash: location.hash }
}
