import type {ListedPost} from "@halo-dev/api-client";
import {Dialog, Toast, VDropdownDivider, VDropdownItem} from "@halo-dev/components";
import {definePlugin} from "@halo-dev/console-shared";
import axios, {AxiosError} from "axios";
import {markRaw} from "vue";


export default definePlugin({
  extensionPoints: {
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
                    '同步此文章内容会从新发布AI，此操作数据无法逆转！',
                  onConfirm: async () => {
                    try {
                      await axios.put(
                        `/apis/api.plugin.halo.run/v1alpha1/plugins/summaraidGPT/summary/update`,
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
  },
});
