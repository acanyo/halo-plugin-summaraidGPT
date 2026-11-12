// @vitest-environment node
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

interface AssistantWidget extends HTMLElement {
  updateComplete: Promise<boolean>
}

let bundle: string
let window: JSDOM['window']

beforeAll(() => {
  const require = createRequire(import.meta.url)
  const vitePackage = require.resolve('../../../../../packages/node_modules/vite/package.json')
  const bundler = require(require.resolve('esbuild', { paths: [vitePackage] }))
  bundle = bundler.buildSync({
    entryPoints: [
      fileURLToPath(
        new URL('../../../../../packages/src/rag-assistant/widget.ts', import.meta.url),
      ),
    ],
    tsconfig: fileURLToPath(new URL('../../../../../packages/tsconfig.json', import.meta.url)),
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2022',
  }).outputFiles[0].text
})

afterEach(() => window?.document.body.replaceChildren())
afterAll(() => window?.close())

async function mountAssistant(legacyMediaQuery: boolean, colorMode = 'auto') {
  window?.close()
  window = new JSDOM('<!doctype html><head></head><body></body>', {
    url: 'https://site.test/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  }).window
  let dark = false
  const changes = new window.EventTarget()
  const add = vi.fn((_type: string, listener: EventListener) =>
    changes.addEventListener('change', listener),
  )
  const remove = vi.fn((_type: string, listener: EventListener) =>
    changes.removeEventListener('change', listener),
  )
  const media = {
    get matches() {
      return dark
    },
    ...(legacyMediaQuery
      ? {
          addListener: (listener: EventListener) => add('change', listener),
          removeListener: (listener: EventListener) => remove('change', listener),
        }
      : { addEventListener: add, removeEventListener: remove }),
  }
  window.matchMedia = (() => media) as unknown as typeof window.matchMedia
  window.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({
      displayMode: 'rag',
      styleConfig: { stylePreset: 'azure', colorMode },
      access: { mode: 'anonymous_chat' },
    }),
  })) as unknown as typeof window.fetch
  window.Image = class {
    onload?: () => void
    set src(_value: string) {
      queueMicrotask(() => this.onload?.())
    }
  } as unknown as typeof window.Image
  window.eval(bundle)
  const widget = window.document.createElement('summaraid-rag-assistant') as AssistantWidget
  window.document.body.append(widget)
  await settle(widget)
  return {
    widget,
    add,
    remove,
    setDark(value: boolean) {
      dark = value
      changes.dispatchEvent(new window.Event('change'))
    },
  }
}

async function settle(widget: AssistantWidget) {
  for (let index = 0; index < 12; index++) {
    await Promise.resolve()
    await widget.updateComplete
  }
}

function click(widget: AssistantWidget, selector: string) {
  const button = widget.shadowRoot!.querySelector<HTMLButtonElement>(selector)
  expect(button).not.toBeNull()
  button!.click()
}

describe('assistant theme and close lifecycle', () => {
  it.each([false, true])(
    'follows system colors and releases the listener (legacy=%s)',
    async (legacy) => {
      const { widget, add, remove, setDark } = await mountAssistant(legacy)
      expect(widget.style.getPropertyValue('--rag-panel')).toBe('#f8fafc')
      setDark(true)
      expect(widget.style.getPropertyValue('--rag-panel')).toBe('#171717')
      setDark(false)
      expect(widget.style.getPropertyValue('--rag-panel')).toBe('#f8fafc')
      expect(add).toHaveBeenCalledTimes(1)
      widget.remove()
      expect(remove).toHaveBeenCalledTimes(1)
      setDark(true)
      expect(widget.style.getPropertyValue('--rag-panel')).toBe('#f8fafc')
    },
  )

  it('keeps a fixed color mode when the system appearance changes', async () => {
    const { widget, setDark } = await mountAssistant(false, 'light')
    setDark(true)
    expect(widget.style.getPropertyValue('--rag-panel')).toBe('#f8fafc')
  })

  it('exits fullscreen through both the close button and Escape', async () => {
    const { widget } = await mountAssistant(false)
    const openStage = async () => {
      click(widget, '[aria-label="打开智能助手"]')
      await settle(widget)
      click(widget, '[aria-label="全屏会话"]')
      await settle(widget)
      expect(widget.shadowRoot!.querySelector('[role="dialog"]')).not.toBeNull()
      expect(widget.shadowRoot!.querySelector('.bubble')).toBeNull()
    }
    await openStage()
    click(widget, '.pet-stage-close')
    await settle(widget)
    expect(widget.shadowRoot!.querySelector('[role="dialog"]')).toBeNull()
    expect(widget.shadowRoot!.querySelector('.bubble')).not.toBeNull()
    await openStage()
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
    await settle(widget)
    expect(widget.shadowRoot!.querySelector('[role="dialog"]')).toBeNull()
  })
})
