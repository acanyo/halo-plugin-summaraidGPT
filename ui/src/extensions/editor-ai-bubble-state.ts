import { ref } from 'vue'
import type { Editor } from '@tiptap/core'

export const bubbleEditor = ref<Editor | null>(null)
export const bubbleSelectedText = ref('')
export const bubbleSelectedRange = ref<{ from: number; to: number } | null>(null)

export const setEditorAiBubbleSelection = (editor: Editor) => {
  const { from, to, empty } = editor.state.selection
  const text = empty ? '' : editor.state.doc.textBetween(from, to, '\n').trim()

  bubbleEditor.value = editor
  bubbleSelectedText.value = text
  bubbleSelectedRange.value = empty ? null : { from, to }
}
