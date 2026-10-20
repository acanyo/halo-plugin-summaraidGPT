// @vitest-environment node
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LinguiSummaryData } from '../../../../../packages/src/article-summary/lingui'

interface SummaryWidget extends HTMLElement {
  postName: string
  uiStyle: string
  linguiProjectId: string
  typewriter: boolean
  updateComplete: Promise<boolean>
}

interface Interactions {
  callbacks: Record<string, (args: unknown, context: { runId: string }) => LinguiSummaryData>
  onEvent: (report: { runId: string; phase: string }) => void
}

interface RendererElement extends HTMLElement {
  snapshot?: LinguiSummaryData
}

interface PendingSummary {
  postId: string
  resolve: (response: Response) => void
}

interface Bundler {
  buildSync: (options: Record<string, unknown>) => { outputFiles: { text: string }[] }
}

const mounted: RendererElement[] = []
let window: JSDOM['window']
let document: Document
let pending: PendingSummary[]
let fetchSummary: ReturnType<typeof vi.fn>

beforeAll(() => {
  // Keep Lit's legacy decorator settings scoped to the widget's own TypeScript project.
  const require = createRequire(import.meta.url)
  const vitePackage = require.resolve('../../../../../packages/node_modules/vite/package.json')
  const bundler = require(require.resolve('esbuild', { paths: [vitePackage] })) as Bundler
  const entry = fileURLToPath(
    new URL('../../../../../packages/src/article-summary/widget.ts', import.meta.url),
  )
  const tsconfig = fileURLToPath(new URL('../../../../../packages/tsconfig.json', import.meta.url))
  const bundled = bundler.buildSync({
    entryPoints: [entry],
    tsconfig,
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2022',
  })
  const dom = new JSDOM('<!doctype html><head></head><body></body>', {
    url: 'https://site.test/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  window = dom.window
  document = window.document
  window.eval(bundled.outputFiles[0]!.text)

  class Renderer extends window.HTMLElement implements RendererElement {
    interactions!: Interactions
    snapshot?: LinguiSummaryData

    connectedCallback() {
      const runId = `summary-mount-${mounted.length}`
      this.snapshot = this.interactions.callbacks['zhiyue.summary']!(undefined, { runId })
      mounted.push(this)
      this.interactions.onEvent({ runId, phase: 'success' })
    }
  }
  window.customElements.define('lingui-component', Renderer)
})

beforeEach(() => {
  mounted.length = 0
  pending = []
  window.matchMedia = (() => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
  fetchSummary = vi.fn(
    (_input: unknown, init?: RequestInit) =>
      new Promise<Response>((resolve) => {
        pending.push({ postId: String(init?.body), resolve })
      }),
  )
  window.fetch = fetchSummary as typeof window.fetch
})

afterEach(() => {
  document.body.replaceChildren()
})

afterAll(() => window.close())

function mountWidget(postId = 'article-a') {
  const widget = document.createElement('likcc-article-summary') as SummaryWidget
  widget.postName = postId
  widget.uiStyle = 'lingui'
  widget.linguiProjectId = 'summary-project'
  widget.typewriter = false
  document.body.append(widget)
  return widget
}

async function settle(widget: SummaryWidget) {
  for (let index = 0; index < 6; index++) {
    await Promise.resolve()
    await widget.updateComplete
  }
}

function respond(index: number, content: string) {
  pending[index]!.resolve({
    ok: true,
    json: async () => ({ summaryContent: content }),
  } as Response)
}

function renderer(widget: SummaryWidget) {
  return widget.querySelector<RendererElement>('lingui-component')
}

describe('summary widget lifecycle', () => {
  it('fetches once on the first connection and mounts the matching real summary', async () => {
    const widget = mountWidget()
    await settle(widget)

    expect(fetchSummary).toHaveBeenCalledTimes(1)
    expect(pending.map((request) => request.postId)).toEqual(['article-a'])
    respond(0, '文章 A 的真实摘要')
    await settle(widget)

    expect(fetchSummary).toHaveBeenCalledTimes(1)
    expect(mounted).toHaveLength(1)
    expect(renderer(widget)?.snapshot).toMatchObject({
      postId: 'article-a',
      content: '文章 A 的真实摘要',
    })
  })

  it('keeps article B when the earlier article A response arrives last', async () => {
    const widget = mountWidget()
    await settle(widget)
    widget.postName = 'article-b'
    await settle(widget)
    expect(pending.map((request) => request.postId)).toEqual(['article-a', 'article-b'])

    respond(1, '文章 B 的真实摘要')
    await settle(widget)
    const current = renderer(widget)
    expect(current?.snapshot).toMatchObject({ postId: 'article-b', content: '文章 B 的真实摘要' })

    respond(0, '已经过时的文章 A 摘要')
    await settle(widget)
    expect(renderer(widget)).toBe(current)
    expect(renderer(widget)?.snapshot?.content).toBe('文章 B 的真实摘要')
    expect(mounted).toHaveLength(1)
  })

  it('does not mount a renderer when a pending response arrives after disconnection', async () => {
    const widget = mountWidget()
    await settle(widget)
    widget.remove()

    respond(0, '断开后才返回的摘要')
    await settle(widget)

    expect(widget.isConnected).toBe(false)
    expect(renderer(widget)).toBeNull()
    expect(mounted).toHaveLength(0)
  })

  it('invalidates a pending summary when the article ID is cleared', async () => {
    const widget = mountWidget()
    await settle(widget)
    widget.postName = ''
    await settle(widget)

    respond(0, '已清除文章的过时摘要')
    await settle(widget)

    expect(fetchSummary).toHaveBeenCalledTimes(1)
    expect(renderer(widget)).toBeNull()
    expect(mounted).toHaveLength(0)
    expect(widget.shadowRoot?.textContent).toContain('摘要加载失败，请稍后重试')
    expect(widget.shadowRoot?.textContent).not.toContain('已清除文章的过时摘要')
  })

  it('disposes the old renderer and reloads once when the same widget reconnects', async () => {
    const widget = mountWidget()
    await settle(widget)
    respond(0, '首次挂载的摘要')
    await settle(widget)
    const previous = renderer(widget)!

    widget.remove()
    expect(previous.isConnected).toBe(false)
    expect(renderer(widget)).toBeNull()
    document.body.append(widget)
    await settle(widget)

    expect(fetchSummary).toHaveBeenCalledTimes(2)
    expect(renderer(widget)).toBeNull()
    expect(mounted).toHaveLength(1)
    respond(1, '重新连接后取得的摘要')
    await settle(widget)

    expect(renderer(widget)).not.toBe(previous)
    expect(renderer(widget)?.snapshot).toMatchObject({
      postId: 'article-a',
      content: '重新连接后取得的摘要',
    })
    expect(mounted).toHaveLength(2)
    expect(fetchSummary).toHaveBeenCalledTimes(2)
  })

  it('coalesces reconnection and a queued article change into one new summary request', async () => {
    const widget = mountWidget()
    await settle(widget)
    respond(0, '文章 A 的摘要')
    await settle(widget)
    const previous = renderer(widget)!

    widget.remove()
    widget.postName = 'article-b'
    document.body.append(widget)
    await settle(widget)

    expect(pending.map((request) => request.postId)).toEqual(['article-a', 'article-b'])
    expect(previous.isConnected).toBe(false)
    expect(renderer(widget)).toBeNull()
    respond(1, '文章 B 的摘要')
    await settle(widget)

    expect(fetchSummary).toHaveBeenCalledTimes(2)
    expect(renderer(widget)?.snapshot).toMatchObject({
      postId: 'article-b',
      content: '文章 B 的摘要',
    })
    expect(mounted).toHaveLength(2)
  })

  it('clears the previous summary when its article ID changes while disconnected', async () => {
    const widget = mountWidget()
    await settle(widget)
    respond(0, '已经离开的文章摘要')
    await settle(widget)

    widget.remove()
    widget.postName = ''
    await settle(widget)
    document.body.append(widget)
    await settle(widget)

    expect(fetchSummary).toHaveBeenCalledTimes(1)
    expect(renderer(widget)).toBeNull()
    expect(widget.shadowRoot?.textContent).toContain('摘要加载失败，请稍后重试')
    expect(widget.shadowRoot?.textContent).not.toContain('已经离开的文章摘要')
  })
})
