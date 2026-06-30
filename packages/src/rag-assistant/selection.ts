import type { SelectionPopupState } from './types';

export const EMPTY_SELECTION_POPUP: SelectionPopupState = {
  visible: false,
  text: '',
  x: 0,
  y: 0,
};

export function resolveSelectionPopup(maxLength: number): SelectionPopupState {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return EMPTY_SELECTION_POPUP;
  }

  const text = selection.toString().replace(/\s+/g, ' ').trim();
  if (text.length < 2 || selectionInsideEditable(selection)) {
    return EMPTY_SELECTION_POPUP;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    return EMPTY_SELECTION_POPUP;
  }

  const x = Math.max(72, Math.min(rect.left + rect.width / 2, window.innerWidth - 72));
  const y = Math.max(42, rect.top - 12);

  return {
    visible: true,
    text: text.slice(0, maxLength),
    x: Math.round(x),
    y: Math.round(y),
  };
}

function selectionInsideEditable(selection: Selection): boolean {
  return nodeInsideEditable(selection.anchorNode) || nodeInsideEditable(selection.focusNode);
}

function nodeInsideEditable(node: Node | null): boolean {
  const element = node instanceof Element ? node : node?.parentElement;
  return Boolean(element?.closest('input, textarea, select, [contenteditable="true"], summaraid-rag-assistant'));
}
