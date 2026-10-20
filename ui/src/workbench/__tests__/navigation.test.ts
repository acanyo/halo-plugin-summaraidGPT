import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import {
  getWorkbenchTab,
  legacyWorkbenchPages,
  legacyWorkbenchRedirect,
  visibleWorkbenchTabs,
  WORKBENCH_PATH,
} from '../navigation'

describe('workbench permissions and navigation', () => {
  it('only exposes the sections granted to the current account', () => {
    const granted = new Set(['plugin:summaraidGPT:rag:view'])
    expect(
      visibleWorkbenchTabs((permission) => granted.has(permission)).map((tab) => tab.id),
    ).toEqual(['guide', 'overview', 'knowledge', 'conversations'])
    expect(visibleWorkbenchTabs(() => false).map((tab) => tab.id)).toEqual(['guide', 'overview'])
  })

  it('requires plugin view permission for settings, independently of knowledge-base permissions', () => {
    expect(
      visibleWorkbenchTabs((permission) => permission === 'system:plugins:view').map(
        (tab) => tab.id,
      ),
    ).toEqual(['guide', 'overview', 'settings'])
  })

  it('handles missing, invalid and repeated tab query parameters', () => {
    for (const value of [undefined, '', 'unknown', ['settings', 'knowledge']]) {
      expect(getWorkbenchTab(value).id).toBe('guide')
    }
    expect(getWorkbenchTab('knowledge').permission).toBe('plugin:summaraidGPT:rag:view')
  })

  it.each(legacyWorkbenchPages)('keeps $path bookmarks working', async (legacy) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: WORKBENCH_PATH, component: { template: '<div />' } },
        ...legacyWorkbenchPages.map((page) => ({
          path: page.path,
          name: page.name,
          redirect: (to: import('vue-router').RouteLocation) =>
            legacyWorkbenchRedirect(page.tab, to),
        })),
      ],
    })
    await router.push(`${legacy.path}?keyword=Halo&tab=settings#details`)
    expect(router.currentRoute.value.path).toBe(WORKBENCH_PATH)
    expect(router.currentRoute.value.query).toEqual({ keyword: 'Halo', tab: legacy.tab })
    expect(router.currentRoute.value.hash).toBe('#details')
  })
})
