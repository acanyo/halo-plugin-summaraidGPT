import type { ListedPost } from '@halo-dev/api-client'
import { Dialog, Toast, VDropdownDivider, VDropdownItem } from '@halo-dev/components'
import { definePlugin } from '@halo-dev/ui-shared'
import { AxiosError } from 'axios'
import { markRaw, type Ref } from 'vue'
import SynchronousAiSummary from '@/views/SynchronousAiSummary.vue'
import ArticlePolish from '@/extensions/ArticlePolish'
import ArticleGenerate from '@/extensions/ArticleGenerate'
import { articleReadingApi } from '@/api/article-reading'
import { hasUiPermission } from '@/utils/permissions'
import RiBrainLine from '~icons/ri/brain-line'
import RiBearSmileLine from '~icons/ri/bear-smile-line'
import RiFileList3Line from '~icons/ri/file-list-3-line'
import RiMessage3Line from '~icons/ri/message-3-line'
import 'uno.css'

export default definePlugin({
  routes: [
    {
      parentName: 'Root',
      route: {
        path: '/summaraidgpt/article-readings',
        name: 'SummaraidGptArticleReadings',
        component: () => import('@/views/ArticleReadingGraphView.vue'),
        meta: {
          title: '洞察图谱',
          searchable: true,
          permissions: ['plugin:summaraidGPT:article-reading:view'],
          menu: {
            name: '洞察图谱',
            group: '智阅 AI 助手',
            icon: markRaw(RiBrainLine),
            priority: 44,
          },
        },
      },
    },
    {
      parentName: 'Root',
      route: {
        path: '/summaraidgpt/rag',
        name: 'SummaraidGptRagKnowledge',
        component: () => import('@/views/RagKnowledgeView.vue'),
        meta: {
          title: 'RAG 知识库',
          searchable: true,
          permissions: ['plugin:summaraidGPT:rag:view'],
          menu: {
            name: 'RAG 知识库',
            group: '智阅 AI 助手',
            icon: markRaw(RiBrainLine),
            priority: 45,
          },
        },
      },
    },
    {
      parentName: 'Root',
      route: {
        path: '/summaraidgpt/pets',
        name: 'SummaraidGptPets',
        component: () => import('@/views/PetListView.vue'),
        meta: {
          title: '宠物列表',
          searchable: true,
          permissions: ['plugin:summaraidGPT:pets:view'],
          menu: {
            name: '宠物列表',
            group: '智阅 AI 助手',
            icon: markRaw(RiBearSmileLine),
            priority: 46,
          },
        },
      },
    },
    {
      parentName: 'Root',
      route: {
        path: '/summaraidgpt/rag-conversations',
        name: 'SummaraidGptRagConversations',
        component: () => import('@/views/RagConversationsView.vue'),
        meta: {
          title: '会话记录',
          searchable: true,
          permissions: ['plugin:summaraidGPT:rag:view'],
          menu: {
            name: '会话记录',
            group: '智阅 AI 助手',
            icon: markRaw(RiMessage3Line),
            priority: 47,
          },
        },
      },
    },
    {
      parentName: 'Root',
      route: {
        path: '/summaraidgpt/ai-call-logs',
        name: 'SummaraidGptAiCallLogs',
        component: () => import('@/views/AiCallLogsView.vue'),
        meta: {
          title: 'AI 调用日志',
          searchable: true,
          permissions: ['plugin:summaraidGPT:ai-call-logs:view'],
          menu: {
            name: 'AI 调用日志',
            group: '智阅 AI 助手',
            icon: markRaw(RiFileList3Line),
            priority: 48,
          },
        },
      },
    },
  ],
  extensionPoints: {
    'default:editor:extension:create': () => {
      return [ArticlePolish, ArticleGenerate]
    },
    'post:list-item:operation:create': (post: Ref<ListedPost>) => {
      const canManageArticleReading = hasUiPermission('plugin:summaraidGPT:article-reading:manage')
      return [
        {
          priority: 21,
          component: markRaw(VDropdownDivider),
          visible: canManageArticleReading,
        },
        {
          priority: 22,
          component: markRaw(VDropdownItem),
          label: '图谱生成',
          visible: canManageArticleReading,
          action: () => {
            const item = post.value
            const postName = item?.post.metadata.name
            if (!postName) return
            Dialog.warning({
              title: '图谱生成',
              description: '将重新生成洞察图谱，只包含 TL 主题节点和 DL 深挖节点。',
              onConfirm: async () => {
                try {
                  await articleReadingApi.generate(postName, true)
                  Toast.success('洞察图谱已生成')
                } catch (error) {
                  if (error instanceof AxiosError) {
                    Toast.error(error.response?.data.detail || '生成失败，请重试')
                    return
                  }
                  if (error instanceof Error) {
                    Toast.error(error.message || '生成失败，请重试')
                    return
                  }
                  Toast.error('生成失败，请重试')
                }
              },
            })
          },
        },
      ]
    },
    'post:list-item:field:create': (post) => {
      return [
        {
          priority: 40,
          position: 'end',
          component: markRaw(SynchronousAiSummary),
          props: {
            post,
          },
        },
      ]
    },
  },
})
