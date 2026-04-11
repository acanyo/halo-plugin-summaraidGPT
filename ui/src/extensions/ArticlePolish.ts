import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { markRaw } from 'vue'
import { TEXT_BUBBLE_MENU_KEY } from '@halo-dev/richtext-editor'
import EditorAiBubblePanel from '../components/EditorAiBubblePanel.vue'
import IconSparkles from '~icons/lucide/sparkles'
import { setEditorAiBubbleSelection } from './editor-ai-bubble-state'

export interface BubbleItem {
  priority: number;
  key?: string;
  props: {
    isActive: ({ editor }: { editor: Editor }) => boolean;
    visible?: ({ editor }: { editor: Editor }) => boolean;
    icon?: any;
    title?: string;
    action?: ({ editor }: { editor: Editor }) => any;
  };
}

export interface NodeBubbleMenu {
  pluginKey?: string;
  extendsKey?: string | object;
  shouldShow?: (props: {
    editor: Editor;
    from?: number;
    to?: number;
    state?: any;
  }) => boolean;
  component?: any;
  tippyOptions?: Record<string, unknown>;
  getRenderContainer?: () => HTMLElement | null;
  defaultAnimation?: boolean;
  items?: BubbleItem[];
}

export default Extension.create({
  name: 'articlePolish',

  addOptions() {
    return {
      getBubbleMenu: () => {
        return {
          extendsKey: TEXT_BUBBLE_MENU_KEY,
          items: [
            {
              priority: 10,
              key: 'summaraidgpt-ai-assistant',
              props: {
                isActive: () => false,
                visible: () => true,
                icon: markRaw(IconSparkles),
                title: '智阅助手',
                action: ({ editor }: { editor: Editor }) => {
                  setEditorAiBubbleSelection(editor)
                  return markRaw(EditorAiBubblePanel)
                },
              },
            },
          ],
        }
      },
    }
  },
})
