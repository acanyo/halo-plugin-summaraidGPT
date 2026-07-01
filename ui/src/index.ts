import type { ListedPost } from '@halo-dev/api-client'
import { Dialog, Toast, VDropdownDivider, VDropdownItem } from '@halo-dev/components'
import { definePlugin } from '@halo-dev/ui-shared'
import axios, { AxiosError } from 'axios'
import { markRaw, type Ref } from 'vue'
import SynchronousAiSummary from '@/views/SynchronousAiSummary.vue'
import ArticlePolish from '@/extensions/ArticlePolish'
import ArticleGenerate from '@/extensions/ArticleGenerate'
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
      return [
        {
          priority: 21,
          component: markRaw(VDropdownDivider),
        },
        {
          priority: 22,
          component: markRaw(VDropdownItem),
          label: '智阅GPT-同步',
          visible: true,
          children: [
            {
              priority: 0,
              component: markRaw(VDropdownItem),
              label: '同步摘要内容',
              visible: true,
              action: () => {
                const item = post.value
                if (!item) return
                Dialog.warning({
                  title: '同步摘要内容',
                  description: '同步此文章内容会重新发布AI，此操作数据无法逆转！',
                  onConfirm: async () => {
                    try {
                      await axios.post(
                        `/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/summaries`,
                        item.post,
                        {
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        },
                      )
                      Toast.success('同步AI完成')
                    } catch (error) {
                      if (error instanceof AxiosError) {
                        Toast.error(error.response?.data.detail || '同步失败，请重试')
                      }
                    }
                  },
                })
              },
            },
          ],
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
