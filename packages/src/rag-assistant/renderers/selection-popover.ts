import { html, nothing, type TemplateResult } from 'lit';
import { questionAnswerIcon } from '../icons';
import type { SelectionPopupState } from '../types';

export function renderSelectionPopover(
  selectionPopup: SelectionPopupState,
  onAskWithSelection: () => void,
): TemplateResult | typeof nothing {
  if (!selectionPopup.visible) {
    return nothing;
  }

  return html`
    <div
      class="selection-popover"
      style=${`left:${selectionPopup.x}px;top:${selectionPopup.y}px`}
    >
      <button type="button" @click=${onAskWithSelection}>
        ${questionAnswerIcon()} 问知识库
      </button>
    </div>
  `;
}
