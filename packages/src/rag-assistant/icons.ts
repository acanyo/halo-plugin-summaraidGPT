import type { TemplateResult } from 'lit';
import { DEFAULT_ASSISTANT_ICON, renderIconifyIcon } from './iconify';

export function botIcon(): TemplateResult {
  return renderIconifyIcon(DEFAULT_ASSISTANT_ICON);
}

export function fullscreenIcon(): TemplateResult {
  return renderIconifyIcon('ri:fullscreen-line');
}

export function restoreIcon(): TemplateResult {
  return renderIconifyIcon('ri:fullscreen-exit-line');
}

export function minusIcon(): TemplateResult {
  return renderIconifyIcon('ri:subtract-line');
}

export function closeIcon(): TemplateResult {
  return renderIconifyIcon('ri:close-line');
}

export function sendIcon(): TemplateResult {
  return renderIconifyIcon('ri:send-plane-2-line');
}

export function newChatIcon(): TemplateResult {
  return renderIconifyIcon('ri:chat-new-line');
}

export function fileIcon(): TemplateResult {
  return renderIconifyIcon('ri:file-text-line');
}

export function chevronDownIcon(): TemplateResult {
  return renderIconifyIcon('ri:arrow-down-s-line');
}

export function externalLinkIcon(): TemplateResult {
  return renderIconifyIcon('ri:external-link-line');
}

export function shieldIcon(): TemplateResult {
  return renderIconifyIcon('ri:shield-check-line');
}

export function questionAnswerIcon(): TemplateResult {
  return renderIconifyIcon('ri:question-answer-line');
}
