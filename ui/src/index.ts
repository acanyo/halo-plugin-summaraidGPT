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
import {
  legacyWorkbenchPages,
  legacyWorkbenchRedirect,
  workbenchPermissions,
} from '@/workbench/navigation'
import RiBrainLine from '~icons/ri/brain-line'
import FormKitSpeechSettings from '@/components/podcast/FormKitSpeechSettings.vue'
import 'uno.css'

export default definePlugin({
  formkit: {
    inputs: {
      summaraidSpeechSettings: {
        type: 'group',
        props: ['channel'],
        component: markRaw(FormKitSpeechSettings),
      },
    },
  },
  routes: [
    {
      parentName: 'Root',
      route: {
        path: '/summaraidgpt',
        name: 'SummaraidGptWorkbench',
        component: () => import('@/views/WorkbenchView.vue'),
        meta: {
          title: '智阅 AI 工作台',
          searchable: true,
          permissions: workbenchPermissions,
          menu: {
            name: '智阅 AI',
            group: 'tool',
            icon: markRaw(RiBrainLine),
            priority: 44,
          },
        },
      },
    },
    ...legacyWorkbenchPages.map((page) => ({
      parentName: 'Root',
      route: {
        path: page.path,
        name: page.name,
        redirect: (to: import('vue-router').RouteLocation) => legacyWorkbenchRedirect(page.tab, to),
      },
    })),
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
