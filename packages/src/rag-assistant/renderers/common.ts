import { html, type TemplateResult } from 'lit';

export function renderTyping(): TemplateResult {
  return html`<span class="typing" aria-label="正在输出"><span></span><span></span><span></span></span>`;
}
