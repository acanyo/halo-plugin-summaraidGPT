import { afterEach, describe, expect, it, vi } from 'vitest';
import { observeAssistantViewport } from '../src/rag-assistant/viewport';

afterEach(() => vi.unstubAllGlobals());

describe('assistant visible viewport', () => {
  it('tracks keyboard resize, zoom/pan and rotation, and releases listeners on disconnect', () => {
    const viewport = Object.assign(new EventTarget(), { width: 390, height: 844, offsetLeft: 0, offsetTop: 0 });
    const window = Object.assign(new EventTarget(), { visualViewport: viewport, innerWidth: 390, innerHeight: 844 });
    vi.stubGlobal('window', window);
    const vars = new Map<string, string>();
    const host = { style: { setProperty: (key: string, value: string) => vars.set(key, value) } } as HTMLElement;
    const stop = observeAssistantViewport(host);
    expect(vars.get('--rag-viewport-height')).toBe('844px');
    Object.assign(viewport, { height: 360, offsetTop: 72 });
    viewport.dispatchEvent(new Event('resize'));
    expect(vars.get('--rag-viewport-height')).toBe('360px');
    expect(vars.get('--rag-viewport-top')).toBe('72px');
    Object.assign(viewport, { width: 260, offsetLeft: 40 });
    viewport.dispatchEvent(new Event('scroll'));
    expect(vars.get('--rag-viewport-left')).toBe('40px');
    expect(vars.get('--rag-viewport-width')).toBe('260px');
    Object.assign(viewport, { width: 844, height: 390 });
    window.dispatchEvent(new Event('resize'));
    expect(vars.get('--rag-viewport-width')).toBe('844px');
    stop();
    viewport.height = 100;
    viewport.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
    expect(vars.get('--rag-viewport-height')).toBe('390px');
  });

  it('uses pixel window dimensions when VisualViewport and dynamic viewport units are unavailable', () => {
    const window = Object.assign(new EventTarget(), { innerWidth: 320, innerHeight: 568 });
    vi.stubGlobal('window', window);
    const vars = new Map<string, string>();
    const host = { style: { setProperty: (key: string, value: string) => vars.set(key, value) } } as HTMLElement;
    const stop = observeAssistantViewport(host);
    expect([...vars.values()]).toEqual(['320px', '568px', '0px', '0px']);
    window.innerHeight = 290;
    window.dispatchEvent(new Event('resize'));
    expect(vars.get('--rag-viewport-height')).toBe('290px');
    stop();
  });
});
