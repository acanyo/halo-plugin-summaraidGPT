import { Extension } from '@tiptap/core'
import { markRaw } from 'vue'
import type { Editor } from '@tiptap/core'
import type { Component } from 'vue'
import TagViewerToolbarItem from '../components/TagViewerToolbarItem.vue'
import IconTag from '~icons/lucide/tag'

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
          priority: 140, // 设置优先级，在润色按钮之后
          component: markRaw(TagViewerToolbarItem),
          props: {
            editor,
            isActive: false, // 标签查看器不需要激活状态
            icon: markRaw(IconTag),
            title: 'AI智能标签',
            disabled: false,
          },
        }
      },
    }
  },
})

export default TagViewer
