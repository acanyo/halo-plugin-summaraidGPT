import { Extension } from '@tiptap/core'
import { markRaw } from 'vue'
import type { Editor } from '@tiptap/core'
import type { Component } from 'vue'
import TagViewerToolbarItem from '../components/TagViewerToolbarItem.vue'
import LinemdCloudAltTags from '~icons/line-md/cloud-alt-tags'

interface ToolbarItem {
  priority: number;
  component: Component;
  props: {
    editor: Editor;
    isActive: boolean;
    disabled?: boolean;
    icon?: Component;
    title?: string;
    action?: () => void;
  };
}

export interface TagViewerOptions {
  /**
   * 获取工具栏项目
   */
  getToolbarItems?: ({
    editor,
  }: {
    editor: Editor;
  }) => ToolbarItem;
}

export const TagViewer = Extension.create<TagViewerOptions>({
  name: 'tagViewer',

  addOptions() {
    return {
      ...this.parent?.(),
      getToolbarItems: ({ editor }: { editor: Editor }) => {
        return {
          priority: 150, // 设置优先级，决定在工具栏中的位置
          component: markRaw(TagViewerToolbarItem),
          props: {
            editor,
            isActive: false, // 标签查看器不需要激活状态
            icon: markRaw(LinemdCloudAltTags),
            title: 'AI智能标签',
            disabled: false,
          },
        }
      },
    }
  },
})

export default TagViewer
