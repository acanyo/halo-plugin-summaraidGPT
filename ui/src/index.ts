import type {ListedPost} from "@halo-dev/api-client";
import {Dialog, Toast, VDropdownDivider, VDropdownItem} from "@halo-dev/components";
import {definePlugin} from "@halo-dev/console-shared";
import axios, {AxiosError} from "axios";
import {markRaw} from "vue";
import SynchronousAiSummary from '@/views/SynchronousAiSummary.vue'
import TagViewer from '@/extensions/TagViewer'


export default definePlugin({
  extensionPoints: {
    "default:editor:extension:create": () => {
      return [TagViewer];
    },
    'post:list-item:operation:create': () => {
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
              action: async (item?: ListedPost) => {
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
            {
              priority: 1,
              component: markRaw(VDropdownItem),
              label: '同步文章标签',
              visible: true,
              action: async (item?: ListedPost) => {
                if (!item) return;
                const postName = item.post.metadata?.name;
                if (!postName) {
                  Toast.error('未获取到文章标识');
                  return;
                }
                try {
                  const { data } = await axios.post(
                    `/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/generateTags`,
                    { postName, ensure: true },
                    { headers: { 'Content-Type': 'application/json' } }
                  );
                  const tags: string[] = Array.isArray(data?.tags) ? data.tags : [];
                  if (!data?.success) {
                    Toast.error(data?.message || '生成标签失败');
                    return;
                  }
                  Dialog.info({
                    title: 'AI 推荐标签',
                    description: tags.length ? tags.join('，') : '未生成到可用标签',
                  });
                  Toast.success('同步AI完成');
                } catch (error) {
                  if (error instanceof AxiosError) {
                    Toast.error(error.response?.data?.detail || '请求失败，请重试');
                  } else {
                    Toast.error('请求异常，请重试');
                  }
                }
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
