import type { RagAssistantStyleConfig } from './types';

export const DEFAULT_RAG_ASSISTANT_STYLE: RagAssistantStyleConfig = {
  stylePreset: 'default',
  primaryColor: '#2563eb',
  secondaryColor: '#eaf3ff',
  surfaceColor: '#fbfdff',
  textColor: '#172033',
  borderRadius: 'soft',
  colorMode: 'light',
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type RadiusTokens = {
  panel: string;
  card: string;
  control: string;
};

const DARK_DEFAULTS = {
  surfaceColor: '#171717',
  textColor: '#f7f2e8',
  secondaryColor: '#292524',
};

const STYLE_PRESETS: Record<
  Exclude<RagAssistantStyleConfig['stylePreset'], 'custom'>,
  Pick<RagAssistantStyleConfig, 'primaryColor' | 'secondaryColor' | 'surfaceColor' | 'textColor'>
> = {
  default: {
    primaryColor: '#2563eb',
    secondaryColor: '#eaf3ff',
    surfaceColor: '#fbfdff',
    textColor: '#172033',
  },
  graphite: {
    primaryColor: '#d6b46c',
    secondaryColor: '#2a2a28',
    surfaceColor: '#171717',
    textColor: '#f7f2e8',
  },
  ocean: {
    primaryColor: '#1f7a8c',
    secondaryColor: '#d9f0f3',
    surfaceColor: '#fbfeff',
    textColor: '#142326',
  },
  forest: {
    primaryColor: '#2f7d50',
    secondaryColor: '#dceedd',
    surfaceColor: '#fbfdf8',
    textColor: '#18251b',
  },
  rose: {
    primaryColor: '#b85c7a',
    secondaryColor: '#f8dfe8',
    surfaceColor: '#fffafc',
    textColor: '#2b1720',
  },
};

const RADIUS_TOKENS: Record<RagAssistantStyleConfig['borderRadius'], RadiusTokens> = {
  standard: {
    panel: '10px',
    card: '8px',
    control: '10px',
  },
  soft: {
    panel: '18px',
    card: '13px',
    control: '999px',
  },
  round: {
    panel: '26px',
    card: '18px',
    control: '999px',
  },
};

export function normalizeAssistantStyle(
  style?: Partial<RagAssistantStyleConfig>,
): RagAssistantStyleConfig {
  const stylePreset = normalizeStylePreset(style?.stylePreset);
  const presetPalette = stylePreset === 'custom'
    ? STYLE_PRESETS.default
    : STYLE_PRESETS[stylePreset];
  const custom = stylePreset === 'custom';

  return {
    stylePreset,
    primaryColor: normalizeHexColor(
      custom ? style?.primaryColor : presetPalette.primaryColor,
      DEFAULT_RAG_ASSISTANT_STYLE.primaryColor,
    ),
    secondaryColor: normalizeHexColor(
      custom ? style?.secondaryColor : presetPalette.secondaryColor,
      DEFAULT_RAG_ASSISTANT_STYLE.secondaryColor,
    ),
    surfaceColor: normalizeHexColor(
      custom ? style?.surfaceColor : presetPalette.surfaceColor,
      DEFAULT_RAG_ASSISTANT_STYLE.surfaceColor,
    ),
    textColor: normalizeHexColor(
      custom ? style?.textColor : presetPalette.textColor,
      DEFAULT_RAG_ASSISTANT_STYLE.textColor,
    ),
    borderRadius: normalizeBorderRadius(style?.borderRadius),
    colorMode: normalizeColorMode(style?.colorMode),
  };
}

export function applyAssistantTheme(
  host: HTMLElement,
  style: RagAssistantStyleConfig,
): void {
  const resolvedStyle = resolveModePalette(normalizeAssistantStyle(style));
  const primary = parseHexColor(resolvedStyle.primaryColor);
  const surface = parseHexColor(resolvedStyle.surfaceColor);
  const text = parseHexColor(resolvedStyle.textColor);
  const secondary = parseHexColor(resolvedStyle.secondaryColor);
  const radii = RADIUS_TOKENS[resolvedStyle.borderRadius];
  const dark = isDarkStyle(resolvedStyle);
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };

  setCssVar(host, '--rag-text', resolvedStyle.textColor);
  setCssVar(host, '--rag-muted', toHex(mixColors(text, surface, 0.42)));
  setCssVar(host, '--rag-line', withAlpha(text, 0.095));
  setCssVar(host, '--rag-soft-line', withAlpha(text, 0.06));
  setCssVar(host, '--rag-paper', withAlpha(surface, 0.97));
  setCssVar(host, '--rag-panel', resolvedStyle.surfaceColor);
  setCssVar(host, '--rag-ink', resolvedStyle.textColor);
  setCssVar(host, '--rag-secondary', resolvedStyle.secondaryColor);
  setCssVar(host, '--rag-gold', resolvedStyle.primaryColor);
  setCssVar(host, '--rag-gold-strong', toHex(mixColors(primary, { r: 0, g: 0, b: 0 }, 0.18)));
  setCssVar(host, '--rag-gold-soft', withAlpha(primary, 0.16));
  setCssVar(host, '--rag-gold-faint', withAlpha(primary, 0.05));
  setCssVar(host, '--rag-primary-contrast', readableTextOn(primary));
  setCssVar(host, '--rag-secondary-soft', withAlpha(secondary, 0.48));
  setCssVar(host, '--rag-radius-panel', radii.panel);
  setCssVar(host, '--rag-radius-card', radii.card);
  setCssVar(host, '--rag-radius-control', radii.control);
  setCssVar(host, '--rag-shadow', shadowFor(text, dark));
  setCssVar(host, '--rag-window-surface', toHex(mixColors(surface, dark ? white : primary, dark ? 0.055 : 0.018)));
  setCssVar(host, '--rag-window-surface-2', toHex(mixColors(surface, dark ? black : white, dark ? 0.1 : 0.42)));
  setCssVar(host, '--rag-header-surface', withAlpha(mixColors(surface, dark ? white : primary, dark ? 0.075 : 0.035), dark ? 0.96 : 0.985));
  setCssVar(host, '--rag-messages-surface', toHex(mixColors(surface, dark ? black : white, dark ? 0.045 : 0.36)));
  setCssVar(host, '--rag-footer-surface', withAlpha(mixColors(surface, dark ? black : white, dark ? 0.035 : 0.28), 0.98));
  setCssVar(host, '--rag-control-surface', withAlpha(mixColors(surface, dark ? white : white, dark ? 0.07 : 0.68), dark ? 0.78 : 0.9));
  setCssVar(host, '--rag-input-surface-resolved', toHex(mixColors(surface, dark ? white : white, dark ? 0.065 : 0.62)));
  setCssVar(host, '--rag-assistant-message-bg', toHex(mixColors(surface, white, dark ? 0.075 : 0.82)));
  setCssVar(host, '--rag-assistant-message-border', withAlpha(mixColors(dark ? text : primary, surface, dark ? 0.78 : 0.72), dark ? 0.2 : 0.18));
  setCssVar(host, '--rag-window-border', withAlpha(mixColors(text, surface, dark ? 0.74 : 0.86), dark ? 0.18 : 0.13));
  setCssVar(host, '--rag-divider', withAlpha(text, dark ? 0.075 : 0.08));
  setCssVar(host, '--rag-card-shadow', dark
    ? '0 8px 18px rgba(0, 0, 0, 0.18)'
    : `0 10px 24px ${withAlpha(text, 0.055)}`);
  setCssVar(host, '--rag-control-shadow', dark
    ? '0 8px 18px rgba(0, 0, 0, 0.16)'
    : `0 8px 18px ${withAlpha(text, 0.05)}`);
  setCssVar(host, '--rag-user-message-start', toHex(mixColors(primary, white, dark ? 0.08 : 0.16)));
  setCssVar(host, '--rag-user-message-end', toHex(mixColors(primary, black, 0.18)));
}

function resolveModePalette(style: RagAssistantStyleConfig): RagAssistantStyleConfig {
  if (!shouldUseDarkMode(style.colorMode)) {
    return style;
  }

  return {
    ...style,
    surfaceColor: replaceDefault(style.surfaceColor, DEFAULT_RAG_ASSISTANT_STYLE.surfaceColor, DARK_DEFAULTS.surfaceColor),
    textColor: replaceDefault(style.textColor, DEFAULT_RAG_ASSISTANT_STYLE.textColor, DARK_DEFAULTS.textColor),
    secondaryColor: replaceDefault(style.secondaryColor, DEFAULT_RAG_ASSISTANT_STYLE.secondaryColor, DARK_DEFAULTS.secondaryColor),
  };
}

function shouldUseDarkMode(colorMode: RagAssistantStyleConfig['colorMode']): boolean {
  if (colorMode === 'dark') {
    return true;
  }
  if (colorMode === 'light') {
    return false;
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function isDarkStyle(style: RagAssistantStyleConfig): boolean {
  return relativeLuminance(parseHexColor(style.surfaceColor)) < 0.28;
}

function normalizeHexColor(value: string | undefined, fallback: string): string {
  const color = value?.trim();
  return color && isHexColor(color) ? expandHexColor(color).toLowerCase() : fallback;
}

function normalizeStylePreset(
  value: RagAssistantStyleConfig['stylePreset'] | undefined,
): RagAssistantStyleConfig['stylePreset'] {
  return value === 'graphite'
    || value === 'ocean'
    || value === 'forest'
    || value === 'rose'
    || value === 'custom'
    ? value
    : DEFAULT_RAG_ASSISTANT_STYLE.stylePreset;
}

function normalizeBorderRadius(
  value: RagAssistantStyleConfig['borderRadius'] | undefined,
): RagAssistantStyleConfig['borderRadius'] {
  return value === 'standard' || value === 'round' ? value : DEFAULT_RAG_ASSISTANT_STYLE.borderRadius;
}

function normalizeColorMode(
  value: RagAssistantStyleConfig['colorMode'] | undefined,
): RagAssistantStyleConfig['colorMode'] {
  return value === 'auto' || value === 'light' || value === 'dark'
    ? value
    : DEFAULT_RAG_ASSISTANT_STYLE.colorMode;
}

function replaceDefault(value: string, defaultValue: string, replacement: string): string {
  return value.toLowerCase() === defaultValue.toLowerCase() ? replacement : value;
}

function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function expandHexColor(value: string): string {
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value;
}

function parseHexColor(value: string): RgbColor {
  const color = expandHexColor(value).slice(1);
  return {
    r: Number.parseInt(color.slice(0, 2), 16),
    g: Number.parseInt(color.slice(2, 4), 16),
    b: Number.parseInt(color.slice(4, 6), 16),
  };
}

function mixColors(from: RgbColor, to: RgbColor, toWeight: number): RgbColor {
  const fromWeight = 1 - toWeight;
  return {
    r: Math.round(from.r * fromWeight + to.r * toWeight),
    g: Math.round(from.g * fromWeight + to.g * toWeight),
    b: Math.round(from.b * fromWeight + to.b * toWeight),
  };
}

function withAlpha(color: RgbColor, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function toHex(color: RgbColor): string {
  return `#${hexPart(color.r)}${hexPart(color.g)}${hexPart(color.b)}`;
}

function hexPart(value: number): string {
  return Math.min(Math.max(value, 0), 255).toString(16).padStart(2, '0');
}

function readableTextOn(color: RgbColor): string {
  return relativeLuminance(color) > 0.55 ? '#171717' : '#ffffff';
}

function relativeLuminance(color: RgbColor): number {
  const channels = [color.r, color.g, color.b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function shadowFor(text: RgbColor, dark: boolean): string {
  return dark
    ? `0 20px 56px ${withAlpha(text, 0.1)}, 0 6px 18px rgba(0, 0, 0, 0.34)`
    : `0 20px 56px ${withAlpha(text, 0.12)}, 0 6px 18px ${withAlpha(text, 0.07)}`;
}

function setCssVar(host: HTMLElement, name: string, value: string): void {
  host.style.setProperty(name, value);
}
