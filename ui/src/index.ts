import type { ListedPost } from "@halo-dev/api-client";
import {Dialog, Toast, VDropdownDivider, VDropdownItem} from "@halo-dev/components";
import {definePlugin} from "@halo-dev/ui-shared";
import axios, {AxiosError} from "axios";
import {markRaw, type Ref} from "vue";
import SynchronousAiSummary from '@/views/SynchronousAiSummary.vue'
import TagViewer from '@/extensions/TagViewer'
import ArticlePolish from '@/extensions/ArticlePolish'
import ArticleGenerate from '@/extensions/ArticleGenerate'


export default definePlugin({
  extensionPoints: {
    "default:editor:extension:create": () => {
      return [TagViewer, ArticlePolish, ArticleGenerate];
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
                const item = post.value;
                if (!item) return;
                Dialog.warning({
                  title: '同步摘要内容',
                  description:
                    '同步此文章内容会重新发布AI，此操作数据无法逆转！',
                  onConfirm: async () => {
                    try {
                      await axios.post(
                        `/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/summaries`,
                        item.post,
                        {
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        }
                      );
                      Toast.success('同步AI完成');
                    } catch (error) {
                      if (error instanceof AxiosError) {
                        Toast.error(error.response?.data.detail || '同步失败，请重试');
                      }
                    }

                  },
                });
              },
            },
          ],
        },
      ];
    },
    "post:list-item:field:create": (post) => {
      return [{
        priority: 40,
        position: "end",
        component: markRaw(SynchronousAiSummary),
        props: {
          post
        }
      }];
    },
  },
});
