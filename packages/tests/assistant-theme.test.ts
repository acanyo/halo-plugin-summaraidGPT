import { describe, expect, it, afterEach, vi } from 'vitest';
import { applyAssistantTheme, normalizeAssistantStyle } from '../src/rag-assistant/theme';
import { baseStyles } from '../src/rag-assistant/styles/base';
import { petStyles } from '../src/rag-assistant/styles/pet';
import { composerStyles } from '../src/rag-assistant/styles/composer';
import { contentStyles } from '../src/rag-assistant/styles/content';
import { stageStyles } from '../src/rag-assistant/styles/stage';

afterEach(() => vi.unstubAllGlobals());

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/../g)!.map(value => {
    const n = parseInt(value, 16) / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}
function contrast(a: string, b: string): number {
  const [dark, light] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (light! + 0.05) / (dark! + 0.05);
}

describe('assistant colors without color-mix support', () => {
  it.each(['light', 'dark'] as const)('resolves readable %s surfaces, labels and links without CSS color functions', colorMode => {
    const vars = new Map<string, string>();
    const host = { style: { setProperty: (key: string, value: string) => vars.set(key, value) } } as HTMLElement;
    applyAssistantTheme(host, normalizeAssistantStyle({ colorMode }));
    for (const value of vars.values()) expect(value).not.toMatch(/color-mix|var\(/);
    for (const key of ['--rag-window-surface', '--rag-assistant-message-bg', '--rag-input-surface-resolved', '--rag-highlight-surface']) {
      expect(contrast(vars.get('--rag-text')!, vars.get(key)!)).toBeGreaterThan(4.5);
    }
    expect(contrast(vars.get('--rag-link')!, vars.get('--rag-assistant-message-bg')!)).toBeGreaterThan(4.5);
    expect(contrast(vars.get('--rag-error-text')!, vars.get('--rag-error-surface')!)).toBeGreaterThan(4.5);
  });
  it('uses the system palette for auto mode while preserving custom colors', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
    const vars = new Map<string, string>();
    const host = { style: { setProperty: (key: string, value: string) => vars.set(key, value) } } as HTMLElement;
    applyAssistantTheme(host, normalizeAssistantStyle({ colorMode: 'auto' }));
    expect(vars.get('--rag-panel')).toBe('#171717');
    applyAssistantTheme(host, normalizeAssistantStyle({ stylePreset: 'custom', colorMode: 'auto', surfaceColor: '#202535', textColor: '#e0e4ef' }));
    expect(vars.get('--rag-panel')).toBe('#202535');
    expect(vars.get('--rag-text')).toBe('#e0e4ef');
  });
  it.each(['default', 'graphite', 'ocean', 'azure', 'forest', 'rose'] as const)(
    'adapts the %s preset to system dark mode and restores its light palette', stylePreset => {
      let dark = true;
      vi.stubGlobal('window', { matchMedia: () => ({ matches: dark }) });
      const vars = new Map<string, string>();
      const host = { style: { setProperty: (key: string, value: string) => vars.set(key, value) } } as HTMLElement;
      const style = normalizeAssistantStyle({ stylePreset, colorMode: 'auto' });
      applyAssistantTheme(host, style);
      expect(vars.get('--rag-panel')).toBe('#171717');
      expect(contrast(vars.get('--rag-text')!, vars.get('--rag-assistant-message-bg')!)).toBeGreaterThan(4.5);
      expect(vars.get('--rag-gold')).toBe(style.primaryColor);
      dark = false;
      applyAssistantTheme(host, style);
      expect(vars.get('--rag-panel')).toBe(style.surfaceColor);
      expect(vars.get('--rag-text')).toBe(style.textColor);
    },
  );
  it('ships complete backgrounds and borders without requiring color-mix() or dvh support', () => {
    const css = [baseStyles, petStyles, composerStyles, contentStyles, stageStyles].map(style => style.cssText).join('\n');
    expect(css).not.toMatch(/color-mix\(|\d+dvh/);
    expect(css).not.toMatch(/(--rag-[\w-]+):\s*var\(\1\)/);
  });
});
