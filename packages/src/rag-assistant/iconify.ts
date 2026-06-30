import { html, type TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

export const DEFAULT_ASSISTANT_ICON = 'ri:book-open-line';

const ICONIFY_API_BASE = 'https://api.iconify.design';
const ICONIFY_NAME_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)$/i;

export function renderIconifyIcon(
  icon: string | undefined,
  className = 'iconify-icon',
): TemplateResult {
  const source = resolveIconifySource(icon) || iconifyApiUrl(DEFAULT_ASSISTANT_ICON);

  return html`
    <span
      class=${className}
      style=${styleMap({ '--rag-icon-source': `url("${source}")` })}
      aria-hidden="true"
    ></span>
  `;
}

export function resolveIconifySource(value?: string): string | undefined {
  const icon = value?.trim();
  if (!icon) {
    return undefined;
  }

  if (isIconifyName(icon)) {
    return iconifyApiUrl(icon);
  }

  if (isSvgMarkup(icon)) {
    return svgToDataUrl(icon);
  }

  if (isSvgDataUrl(icon)) {
    return icon;
  }

  if (isIconifyApiUrl(icon)) {
    return icon;
  }

  return undefined;
}

function isIconifyName(value: string): boolean {
  return ICONIFY_NAME_PATTERN.test(value);
}

function iconifyApiUrl(icon: string): string {
  const match = icon.match(ICONIFY_NAME_PATTERN);
  if (!match) {
    return iconifyApiUrl(DEFAULT_ASSISTANT_ICON);
  }

  const [, prefix, name] = match;
  return `${ICONIFY_API_BASE}/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg`;
}

function isSvgMarkup(value: string): boolean {
  return value.startsWith('<svg') && value.endsWith('</svg>');
}

function isSvgDataUrl(value: string): boolean {
  return value.startsWith('data:image/svg+xml');
}

function isIconifyApiUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === ICONIFY_API_BASE && url.pathname.endsWith('.svg');
  } catch {
    return false;
  }
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
