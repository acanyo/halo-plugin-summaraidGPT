import type { TemplateResult } from 'lit';
import { renderIconifyIcon } from './iconify';

export function closeIcon(): TemplateResult {
  return renderIconifyIcon('ri:close-line');
}

export function sendIcon(): TemplateResult {
  return renderIconifyIcon('ri:send-plane-2-line');
}

export function newChatIcon(): TemplateResult {
  return renderIconifyIcon('ri:chat-new-line');
}

export function articleIcon(): TemplateResult {
  return renderIconifyIcon('ri:article-line');
}

export function fileIcon(): TemplateResult {
  return renderIconifyIcon('ri:file-text-line');
}

export function externalLinkIcon(): TemplateResult {
  return renderIconifyIcon('ri:external-link-line');
}

export function focusIcon(): TemplateResult {
  return renderIconifyIcon('ri:focus-3-line');
}

export function historyIcon(): TemplateResult {
  return renderIconifyIcon('ri:history-line');
}

export function searchIcon(): TemplateResult {
  return renderIconifyIcon('ri:search-line');
}

export function questionAnswerIcon(): TemplateResult {
  return renderIconifyIcon('ri:question-answer-line');
}
