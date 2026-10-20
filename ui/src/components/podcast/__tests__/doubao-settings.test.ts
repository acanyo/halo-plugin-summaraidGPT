import { defineComponent, h, type Component } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { defaultConfig, FormKit, FormKitSchema, plugin, type useFormKitContext } from '@formkit/vue'
import { describe, expect, it, vi } from 'vitest'
import doubaoPodcast from '@/workbench/settings/schemas/doubaoPodcast'

type FormNode = NonNullable<ReturnType<typeof useFormKitContext>['value']>['node']
const Field = FormKit as unknown as Component
const Schema = FormKitSchema as unknown as Component

async function mountSettings(overrides: Record<string, unknown> = {}) {
  let root: FormNode | undefined
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Field,
          {
            type: 'form',
            actions: false,
            value: {
              doubao: { ...(doubaoPodcast.value as Record<string, unknown>), ...overrides },
            },
            onNode: (node: FormNode) => {
              root = node
            },
          },
          {
            default: () =>
              h(Schema, {
                schema: {
                  $formkit: 'group',
                  name: 'doubao',
                  children: doubaoPodcast.children,
                },
              }),
          },
        ),
    }),
    {
      global: {
        plugins: [[plugin, defaultConfig()]],
      },
    },
  )
  await flushPromises()
  await root!.settled
  return { wrapper, root: root!, group: root!.at('$self.doubao')! }
}

describe('Doubao native podcast settings', () => {
  it('retains custom voice IDs and native options in submitted settings', async () => {
    const { wrapper, root } = await mountSettings({
      voiceA: 'S_authorized_custom_voice',
      speechRate: -20,
    })
    expect(root.value).toMatchObject({
      doubao: {
        voiceA: 'S_authorized_custom_voice',
        speechRate: -20,
      },
    })
    expect(root.value).not.toHaveProperty('doubao.useHeadMusic')
    expect(root.value).not.toHaveProperty('doubao.useTailMusic')
    wrapper.unmount()
  })

  it('rejects duplicate hosts and revalidates when the other host changes', async () => {
    const { wrapper, group } = await mountSettings()
    const first = group.at('$self.voiceA')!
    const second = group.at('$self.voiceB')!
    await second.input(first.value, false)
    await vi.waitFor(() => expect(second.context!.state.valid).toBe(false))
    await first.input('zh_male_liufei_v2_saturn_bigtts', false)
    await vi.waitFor(() => expect(second.context!.state.valid).toBe(true))
    wrapper.unmount()
  })

  it('accepts native rate boundaries and rejects out-of-range or fractional values', async () => {
    const { wrapper, group } = await mountSettings()
    const rate = group.at('$self.speechRate')!
    for (const value of [-50, 0, 100]) {
      await rate.input(value, false)
      await vi.waitFor(() => expect(rate.context!.state.valid).toBe(true))
    }
    for (const value of [-51, 101, 0.5]) {
      await rate.input(value, false)
      await vi.waitFor(() => expect(rate.context!.state.valid).toBe(false))
    }
    wrapper.unmount()
  })

  it('validates custom speaker IDs before submitting to the paid service', async () => {
    const { wrapper, group } = await mountSettings()
    const voice = group.at('$self.voiceA')!
    for (const value of ['S_authorized.clone-2', ' zh_male_liufei_v2_saturn_bigtts ']) {
      await voice.input(value, false)
      await vi.waitFor(() => expect(voice.context!.state.valid).toBe(true))
    }
    for (const value of ['声音名称', 'voice/other', 'A'.repeat(201)]) {
      await voice.input(value, false)
      await vi.waitFor(() => expect(voice.context!.state.valid).toBe(false))
    }
    wrapper.unmount()
  })
})
