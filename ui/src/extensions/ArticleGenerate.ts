import { Extension } from '@tiptap/core'
import { markRaw } from 'vue'
import type { Editor } from '@tiptap/core'
import ArticleGenerateToolbarItem from '../components/ArticleGenerateToolbarItem.vue'

export interface ToolbarItem {
  priority: number
  component: any
  props: any
}

export interface ArticleGenerateOptions {
  getToolbarItems?: ({
    editor,
  }: {
    editor: Editor;
  }) => ToolbarItem[];
}

export default Extension.create<ArticleGenerateOptions>({
  name: 'articleGenerate',

  addOptions() {
    return {
      getToolbarItems: ({ editor }) => {
        return [
          {
            priority: 142,
            component: markRaw(ArticleGenerateToolbarItem),
            props: {
              editor,
              isActive: false,
              disabled: false,
            },
          },
        ];
      },
    }
  },
})
