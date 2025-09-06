import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { markRaw } from 'vue'
import ArticlePolishToolbarItem from '../components/ArticlePolishToolbarItem.vue'

export interface ArticlePolishOptions {
  getToolbarItems?: ({
    editor,
  }: {
    editor: Editor;
  }) => ToolbarItem[];
  maxLength?: number;
}

export interface ToolbarItem {
  priority: number;
  component: any;
  props: Record<string, any>;
}

/**
 * 文章润色TipTap扩展
 * 为编辑器添加AI润色功能的工具栏按钮
 */
export default Extension.create<ArticlePolishOptions>({
  name: 'articlePolish',

  addOptions() {
    return {
      maxLength: 2000,
      getToolbarItems: ({ editor }) => {
        const hasSelection = !editor.state.selection.empty;
        const selectionLength = hasSelection 
          ? editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, '\n').length 
          : 0;
        
        return [
          {
            priority: 185, // 设置优先级，在标签查看器之前
            component: markRaw(ArticlePolishToolbarItem),
            props: {
              editor,
              isActive: false,
              disabled: !hasSelection || selectionLength === 0,
              maxLength: 2000,
            },
          },
        ];
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl+Shift+P 快捷键打开润色功能
      'Mod-Shift-p': () => {
        const { selection } = this.editor.state;
        if (!selection.empty) {
          // 触发工具栏按钮点击
          const event = new CustomEvent('polish:trigger', {
            detail: { 
              editor: this.editor,
              content: this.editor.state.doc.textBetween(selection.from, selection.to, '\n')
            }
          });
          document.dispatchEvent(event);
        }
        return true;
      },
    }
  },

  onCreate() {
    // 监听编辑器选择变化，更新工具栏按钮状态
    this.editor.on('selectionUpdate', () => {
      // 触发工具栏更新
      this.options.getToolbarItems?.({ editor: this.editor });
    });
  },

  onDestroy() {
    // 清理事件监听器
    this.editor.off('selectionUpdate');
  },
})
