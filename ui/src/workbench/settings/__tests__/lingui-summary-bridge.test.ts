import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LinguiSummaryData } from '../../../../../packages/src/article-summary/lingui'

type BridgeModule = typeof import('../../../../../packages/src/article-summary/lingui')
type Report = { runId?: string; phase: string; scope?: string }
type Interactions = {
  inheritRegistered: boolean
  requests: { allow: () => boolean }
  callbacks: Record<string, (args: unknown, context: { runId?: string }) => LinguiSummaryData>
  onEvent: (report: Report) => void
}
type SummaryElement = HTMLElement & { interactions: Interactions }

const snapshot: LinguiSummaryData = {
  title: '实际文章摘要',
  gptName: '站点已配置的 AI',
  content: '这段内容来自当前文章的真实摘要。',
  postId: 'post-real-name',
  loading: false,
  error: '',
}

let bridge: BridgeModule
let registered: boolean
let finishRegistration: () => void
let whenDefined: ReturnType<typeof vi.fn>
let host: HTMLElement
let builtin: HTMLElement

async function settle() {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  registered = false
  const registration = new Promise<void>((resolve) => {
    finishRegistration = () => {
      registered = true
      resolve()
    }
  })
  whenDefined = vi.fn(() => registration)
  vi.stubGlobal('customElements', {
    get: vi.fn(() => (registered ? HTMLElement : undefined)),
    whenDefined,
  })
  host = document.createElement('div')
  builtin = document.createElement('p')
  builtin.textContent = snapshot.content
  host.append(builtin)
  document.body.append(host)
  bridge = await import('../../../../../packages/src/article-summary/lingui')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  document.body.replaceChildren()
  document.head.querySelectorAll('script, link').forEach((element) => element.remove())
})

function renderedElement() {
  return host.querySelector('lingui-component') as SummaryElement
}

describe('LingUI summary runtime bridge', () => {
  it('waits for registration and installs interactions before appending the upgraded element', async () => {
    const order: string[] = []
    const nativeCreate = document.createElement.bind(document)
    const create = vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = nativeCreate(tag, options)
      if (tag === 'lingui-component') {
        order.push('create')
        let interactions: Interactions
        Object.defineProperty(element, 'interactions', {
          get: () => interactions,
          set: (value: Interactions) => {
            order.push('interactions')
            interactions = value
          },
        })
      }
      return element
    })
    const nativeAppend = host.append.bind(host)
    vi.spyOn(host, 'append').mockImplementation((...nodes) => {
      order.push('append')
      expect((nodes[0] as SummaryElement).interactions).toBeDefined()
      nativeAppend(...nodes)
    })
    bridge.mountLinguiSummary(host, 'project-real-id', snapshot, vi.fn(), vi.fn())
    await settle()
    expect(whenDefined).toHaveBeenCalledWith('lingui-component')
    expect(create.mock.calls.some(([tag]) => tag === 'lingui-component')).toBe(false)
    expect(order).toEqual([])
    expect(renderedElement()).toBeNull()
    finishRegistration()
    await settle()
    expect(order).toEqual(['create', 'interactions', 'append'])
    expect(renderedElement().getAttribute('data-lingui')).toBe('project-real-id')
    expect(renderedElement().slot).toBe('lingui-summary')
  })

  it('returns a fresh real snapshot and isolates the embedded interaction host', async () => {
    registered = true
    bridge.mountLinguiSummary(host, 'project-real-id', snapshot, vi.fn(), vi.fn())
    await settle()
    const interactions = renderedElement().interactions
    expect(interactions.inheritRegistered).toBe(false)
    expect(interactions.requests.allow()).toBe(false)
    const first = interactions.callbacks[bridge.SUMMARY_CALLBACK](undefined, { runId: 'mount-run' })
    expect(first).toEqual(snapshot)
    expect(first).not.toBe(snapshot)
    first.content = '作品修改自己的返回副本'
    expect(
      interactions.callbacks[bridge.SUMMARY_CALLBACK](undefined, { runId: 'another-run' }),
    ).toEqual(snapshot)
  })

  it('requires a successful terminal event from the same callback run before becoming ready', async () => {
    registered = true
    const ready = vi.fn()
    const failed = vi.fn()
    bridge.mountLinguiSummary(host, 'project-real-id', snapshot, ready, failed)
    await settle()
    const interactions = renderedElement().interactions
    interactions.onEvent({ runId: 'unrelated', phase: 'success' })
    interactions.callbacks[bridge.SUMMARY_CALLBACK](undefined, { runId: 'mount-run' })
    for (const report of [
      { runId: 'unrelated', phase: 'success' },
      { runId: 'mount-run', phase: 'start' },
      { runId: 'mount-run', phase: 'success', scope: 'nested' },
      { phase: 'success' },
    ])
      interactions.onEvent(report)
    expect(ready).not.toHaveBeenCalled()
    interactions.onEvent({ runId: 'mount-run', phase: 'success' })
    expect(ready).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(18000)
    expect(failed).not.toHaveBeenCalled()
  })

  it('falls back on reader resource errors without replacing the built-in summary', async () => {
    const ready = vi.fn()
    const failed = vi.fn()
    bridge.mountLinguiSummary(host, 'project-real-id', snapshot, ready, failed)
    const script = document.head.querySelector('script')!
    script.dispatchEvent(new Event('error'))
    await settle()
    expect(failed).toHaveBeenCalledTimes(1)
    expect(ready).not.toHaveBeenCalled()
    expect(renderedElement()).toBeNull()
    expect(builtin.parentElement).toBe(host)
    expect(builtin.textContent).toBe(snapshot.content)
  })

  it('times out static works without a callback and keeps the built-in summary available', async () => {
    registered = true
    const ready = vi.fn()
    const failed = vi.fn()
    bridge.mountLinguiSummary(host, 'static-project', snapshot, ready, failed)
    await settle()
    renderedElement().interactions.onEvent({ runId: 'static-mount', phase: 'success' })
    await vi.advanceTimersByTimeAsync(18000)
    expect(ready).not.toHaveBeenCalled()
    expect(failed).toHaveBeenCalledTimes(1)
    expect(renderedElement()).toBeNull()
    expect(builtin.parentElement).toBe(host)
  })

  it('does not mutate the host after disposing a mount that is still waiting for registration', async () => {
    const ready = vi.fn()
    const failed = vi.fn()
    const append = vi.spyOn(host, 'append')
    const dispose = bridge.mountLinguiSummary(host, 'pending-project', snapshot, ready, failed)
    dispose()
    finishRegistration()
    await settle()
    await vi.advanceTimersByTimeAsync(30000)
    expect(append).not.toHaveBeenCalled()
    expect(ready).not.toHaveBeenCalled()
    expect(failed).not.toHaveBeenCalled()
    expect(host.children).toHaveLength(1)
    expect(host.firstElementChild).toBe(builtin)
  })
})
