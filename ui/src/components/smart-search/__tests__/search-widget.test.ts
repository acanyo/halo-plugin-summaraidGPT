// @vitest-environment node
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { afterAll, beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

type Extension = HTMLElement & { updateComplete: Promise<boolean> }
type Modal = HTMLElement & { open: boolean; options: Record<string, unknown> }
let dom: JSDOM
let modal: Modal
let fetch: ReturnType<typeof vi.fn>
let discoveryFetch: ReturnType<typeof vi.fn>
let restore: () => void
let install: (config: Record<string, unknown>) => () => void
const tick = () => new Promise(resolve => setTimeout(resolve, 0))

beforeAll(() => {
  const require = createRequire(import.meta.url)
  const vite = require.resolve('../../../../../packages/node_modules/vite/package.json')
  const bundler = require(require.resolve('esbuild', { paths: [vite] }))
  const result = bundler.buildSync({
    stdin: {
      contents: 'export { bridgeSearchWidget } from "./bridge";',
      resolveDir: fileURLToPath(new URL('../../../../../packages/src/smart-search', import.meta.url)),
    },
    tsconfig: fileURLToPath(new URL('../../../../../packages/tsconfig.json', import.meta.url)),
    loader: { '.svg': 'text' },
    bundle: true, write: false, format: 'iife', globalName: 'SearchTest', target: 'es2022',
  })
  dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://site.test', runScripts: 'outside-only', pretendToBeVisual: true,
  })
  const window = dom.window
  Object.assign(window, { AbortController, TextDecoder, TextEncoder, Response })
  // Model the official lifecycle: preserve all native nodes, create a new form on reopen.
  window.customElements.define('search-form', class extends window.HTMLElement {
    options = {}
    constructor() {
      super()
      this.attachShadow({ mode: 'open' }).innerHTML = '<div class="native-header"><form><input placeholder="输入关键词以搜索"></form></div><div class="native-results">原生结果</div><footer>选择 确认 关闭</footer>'
    }
  })
  window.customElements.define('search-modal', class extends window.HTMLElement {
    options = {}
    private opened = false
    constructor() { super(); this.attachShadow({ mode: 'open' }) }
    get open() { return this.opened }
    set open(value: boolean) {
      this.opened = value
      this.shadowRoot!.replaceChildren()
      if (value) {
        const form = window.document.createElement('search-form') as HTMLElement & { options: unknown }
        form.options = this.options
        this.shadowRoot!.append(form)
      }
    }
  })
  window.eval(result.outputFiles[0]!.text + '\nglobalThis.SearchTest = SearchTest;')
  install = (window as unknown as { SearchTest: { bridgeSearchWidget: typeof install } }).SearchTest.bridgeSearchWidget
})

afterAll(() => dom?.window.close())
afterEach(() => { restore?.(); modal?.remove() })
beforeEach(async () => {
  fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ hits: [], message: '' })))
  discoveryFetch = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
    random: [{ id: 'random', title: '随机文章', url: '/random', visits: 3 }],
    popular: [{ id: 'popular', title: '热门文章标题', url: '/popular', visits: 120 }],
  }))))
  dom.window.fetch = ((url: string, options: unknown) => url.endsWith('/smartSearchDiscovery')
    ? discoveryFetch(url, options) : fetch(url, options)) as typeof dom.window.fetch
  modal = dom.window.document.createElement('search-modal') as Modal
  modal.options = { includeTagNames: ['halo'] }
  dom.window.document.body.append(modal)
  restore = install({ enable: true, enableSemantic: true, enableAi: true })
  modal.open = true
  await tick()
})
function form() { return modal.shadowRoot!.querySelector('search-form')! }
function extension() { return form().shadowRoot!.querySelector('summaraid-search-extension') as Extension }
function input(value: string) {
  const input = form().shadowRoot!.querySelector('input')!
  input.value = value
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true, composed: true }))
  return input
}
async function button(label: string) {
  await extension().updateComplete
  return [...extension().shadowRoot!.querySelectorAll('button')].find(button => button.textContent?.trim() === label)!
}

describe('official search extension', () => {
  it('shows discovery before native history, preserves scopes, reshuffles and hides while typing', async () => {
    const discovery = () => extension().shadowRoot!.querySelector('summaraid-search-discovery')!
    await tick()
    expect(discovery().shadowRoot!.textContent).toContain('随机推荐')
    expect(discovery().shadowRoot!.textContent).toContain('热门文章')
    expect(discovery().shadowRoot!.textContent).toContain('120 阅读')
    expect(extension().nextElementSibling!.className).toBe('native-results')
    expect(JSON.parse(discoveryFetch.mock.calls[0]![1].body)).toMatchObject({ options: { includeTagNames: ['halo'] } })
    discoveryFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      random: [{ id: 'new', title: '另一篇文章', url: '/new', visits: 0 },
        { id: 'bad', title: '非法链接', url: 'javascript:alert(1)', visits: 0 }], popular: [],
    })))
    ;(discovery().shadowRoot!.querySelector('button') as HTMLButtonElement).click()
    await tick()
    expect(JSON.parse(discoveryFetch.mock.calls[1]![1].body).excludeIds).toEqual(['random'])
    expect(discovery().shadowRoot!.textContent).toContain('另一篇文章')
    expect(discovery().shadowRoot!.querySelectorAll('a')).toHaveLength(1)
    input('Halo')
    await tick()
    expect(discovery()).toBeNull()
    expect(form().shadowRoot!.querySelector('.native-results')!.textContent).toBe('原生结果')
    input('')
    await tick()
    expect(discovery()).not.toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('offers retry on discovery failure without blocking native search', async () => {
    input('Halo'); await tick()
    discoveryFetch.mockRejectedValueOnce(new Error('offline'))
    input(''); await tick(); await tick()
    const discovery = extension().shadowRoot!.querySelector('summaraid-search-discovery')!
    expect(discovery.shadowRoot!.textContent).toContain('文章推荐暂时不可用')
    const retry = [...discovery.shadowRoot!.querySelectorAll('button')].find(button => button.textContent === '重试')!
    retry.click(); await tick()
    expect(discovery.shadowRoot!.textContent).toContain('随机文章')
    expect(form().shadowRoot!.querySelector('input')).not.toBeNull()
  })

  it('preserves native nodes, listeners and open property through attachment and cleanup', async () => {
    restore()
    const nativeForm = form()
    const nativeInput = nativeForm.shadowRoot!.querySelector('input')!
    const results = nativeForm.shadowRoot!.querySelector('.native-results')!
    const footer = nativeForm.shadowRoot!.querySelector('footer')!
    const markup = [nativeInput.outerHTML, results.outerHTML, footer.outerHTML]
    const listener = vi.fn()
    nativeInput.addEventListener('input', listener)
    restore = install({ enableSemantic: true, enableAi: true })
    await tick()
    input('Halo')
    expect(listener).toHaveBeenCalledOnce()
    expect(Object.getOwnPropertyDescriptor(modal, 'open')).toBeUndefined()
    expect(modal.open).toBe(true)
    expect(nativeForm.shadowRoot!.querySelector('input')).toBe(nativeInput)
    expect([nativeInput.outerHTML, results.outerHTML, footer.outerHTML]).toEqual(markup)
    expect(dom.window.document.querySelector('summaraid-smart-search')).toBeNull()
    restore()
    expect(nativeForm.shadowRoot!.querySelector('summaraid-search-extension')).toBeNull()
    expect(nativeForm.shadowRoot!.querySelector('.native-results')).toBe(results)
  })

  it('adds one extension to later forms, aborts on close and starts fresh on reopen', async () => {
    input('Halo')
    fetch.mockResolvedValueOnce(new Response(new ReadableStream<Uint8Array>({ start() {} })))
    ;(await button('AI 解答')).click()
    await tick()
    const signal: AbortSignal = fetch.mock.calls[0]![1].signal
    modal.open = false
    expect(signal.aborted).toBe(true)
    modal.open = true
    await tick()
    expect(form().shadowRoot!.querySelectorAll('summaraid-search-extension')).toHaveLength(1)
    expect((await button('AI 解答')).disabled).toBe(true)
    const late = dom.window.document.createElement('search-modal') as Modal
    dom.window.document.body.append(late)
    late.open = true
    await tick()
    expect(late.shadowRoot!.querySelector('search-form')!.shadowRoot!.querySelectorAll('summaraid-search-extension')).toHaveLength(1)
    late.remove()
  })

  it('calls semantic search only on click, preserves filters and ignores stale responses', async () => {
    input('如何部署 Halo')
    await new Promise(resolve => setTimeout(resolve, 400))
    expect(fetch).not.toHaveBeenCalled()
    let resolve!: (response: Response) => void
    fetch.mockImplementationOnce(() => new Promise<Response>(done => { resolve = done }))
    ;(await button('智能搜索')).click()
    await tick()
    expect(JSON.parse(fetch.mock.calls[0]![1].body)).toMatchObject({
      mode: 'semantic', query: '如何部署 Halo', options: { includeTagNames: ['halo'] },
    })
    const signal: AbortSignal = fetch.mock.calls[0]![1].signal
    input('新问题')
    expect(signal.aborted).toBe(true)
    resolve(new Response(JSON.stringify({ hits: [{ id: 'stale', title: '旧结果', url: '/old' }], message: '' })))
    await tick()
    expect(extension().shadowRoot!.textContent).not.toContain('旧结果')
  })

  it('renders safe supplemental results and collapses without changing native results', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ hits: [
      { id: 'bad', title: 'unsafe', url: 'javascript:alert(1)', excerpt: 'bad' },
      { id: 'safe', title: '<img src=x onerror=alert(1)>', url: '/article', excerpt: '<script>bad</script>' },
    ], message: '' })))
    input('Halo')
    ;(await button('智能搜索')).click()
    await tick()
    expect(extension().shadowRoot!.querySelectorAll('.result')).toHaveLength(1)
    expect(extension().shadowRoot!.querySelector('.result img')).toBeNull()
    expect(form().shadowRoot!.querySelector('.native-results')!.textContent).toBe('原生结果')
    ;(await button('收起')).click()
    await tick()
    expect(extension().shadowRoot!.querySelector('section')).toBeNull()
  })

  it('streams AI with citations and clears when the native clear control changes input.value', async () => {
    const events = [
      { type: 'sources', sources: [{ id: 'halo', title: 'Halo', url: '/halo' }] },
      { type: 'delta', delta: '答案 <script>bad</script>' }, { type: 'done' },
    ].map(event => `data: ${JSON.stringify(event)}\n\n`).join('')
    fetch.mockResolvedValueOnce(new Response(events))
    input('Halo')
    ;(await button('AI 解答')).click()
    await tick()
    expect(extension().shadowRoot!.querySelector('.prose')!.textContent).toContain('答案')
    expect(extension().shadowRoot!.querySelector('script')).toBeNull()
    expect(extension().shadowRoot!.querySelector('.sources a')!.getAttribute('href')).toBe('https://site.test/halo')
    const nativeInput = form().shadowRoot!.querySelector('input')!
    nativeInput.value = ''
    nativeInput.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    await tick()
    expect(extension().shadowRoot!.querySelector('section')).toBeNull()
  })

  it('keeps the native keyword list without duplicating fallback results', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({
      hits: [{ id: 'fallback', title: '关键词结果', url: '/article', excerpt: '' }],
      fallback: true, message: '语义服务暂不可用，请查看关键词结果。',
    })))
    input('Halo')
    ;(await button('智能搜索')).click()
    await tick()
    expect(extension().shadowRoot!.querySelectorAll('.result')).toHaveLength(0)
    expect(extension().shadowRoot!.textContent).toContain('语义服务暂不可用')
    expect(form().shadowRoot!.querySelector('.native-results')!.textContent).toBe('原生结果')
  })

  it('keeps button keys out of native result navigation, while Escape still bubbles', async () => {
    const nativeKey = vi.fn()
    form().addEventListener('keydown', nativeKey)
    input('Halo')
    const ai = await button('AI 解答')
    ai.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
    expect(nativeKey).not.toHaveBeenCalled()
    ai.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }))
    expect(nativeKey).toHaveBeenCalledOnce()
  })
})
