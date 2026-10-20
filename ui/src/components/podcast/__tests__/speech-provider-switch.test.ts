import { computed, defineComponent, h, markRaw, type Component, type PropType } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { defaultConfig, FormKit, FormKitSchema, plugin, type useFormKitContext } from '@formkit/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosInstance } from '@halo-dev/api-client'
import { workbenchApi } from '@/api/workbench'
import { readPodcastConfig, savePodcastConfig } from '@/api/podcast-config'
import type { ConfigValues } from '@/api/plugin-config'
import { getSettingGroup, groupValues } from '@/workbench/settings/groups'
import { createSpeechSettingsUpdater } from '../speech-form-state'
import { selectSpeechModel, type SpeechSettings } from '../speech-models'

type SpeechContext = NonNullable<ReturnType<typeof useFormKitContext<SpeechSettings>>['value']>
type SpeechNode = SpeechContext['node']
const Field = FormKit as unknown as Component
const Schema = FormKitSchema as unknown as Component

vi.mock('@halo-dev/api-client', () => ({ axiosInstance: { put: vi.fn(), get: vi.fn() } }))
vi.mock('@/api/workbench', () => ({ workbenchApi: { saveConfigGroup: vi.fn() } }))
beforeEach(() => vi.resetAllMocks())

describe('speech provider switching', () => {
  it('preserves independent model and credential values while switching among all channels', async () => {
    let root: SpeechNode | undefined
    const Fields = defineComponent({
      props: {
        context: { type: Object as PropType<SpeechContext & { channel?: string }>, required: true },
      },
      setup(props) {
        const direct = computed(() => props.context.channel === 'minimax')
        const update = computed(() =>
          createSpeechSettingsUpdater(props.context.node, () => direct.value),
        )
        return () =>
          h('div', [
            h(Field, { type: 'password', name: 'apiKey' }),
            h(Field, {
              type: 'text',
              name: 'model',
              onInput: (value: unknown) =>
                update.value(
                  selectSpeechModel(
                    props.context._value,
                    direct.value ? `MiniMax/${String(value)}` : String(value),
                    direct.value ? 'minimax' : 'bailian',
                  ),
                ),
            }),
            h(Field, { type: 'text', name: 'voiceA' }),
            h(Field, { type: 'text', name: 'voiceB' }),
          ])
      },
    })
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { bailian: '********', doubao: '********' },
    })
    const values = groupValues(
      'podcast',
      await readPodcastConfig({
        provider: 'bailian',
        bailian: { model: 'cosyvoice-v3-flash' },
        minimax: { model: 'speech-2.8-turbo' },
        doubao: { model: 'podcast' },
      }),
    )
    const schema = getSettingGroup('podcast').formSchema.filter((field) =>
      ['provider', 'bailian', 'minimax', 'doubao'].includes(field.name || ''),
    )
    for (const field of schema.filter((item) => item.name !== 'provider')) {
      expect(field.preserve).toBe(true)
    }
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Field,
            {
              type: 'form',
              actions: false,
              value: values,
              onNode: (node: SpeechNode) => {
                root = node
              },
            },
            { default: () => h(Schema, { schema, data: values }) },
          ),
      }),
      {
        global: {
          plugins: [
            [
              plugin,
              defaultConfig({
                inputs: {
                  summaraidSpeechSettings: {
                    type: 'group',
                    props: ['channel'],
                    component: markRaw(Fields),
                  },
                },
              }),
            ],
          ],
        },
      },
    )
    await flushPromises()
    const provider = root!.at('$self.provider')!
    const switchProvider = async (name: string) => {
      await provider.input(name, false)
      await flushPromises()
      await root!.settled
      await flushPromises()
    }
    expect(root!.at('$self.bailian.apiKey')!.value).toBe('********')
    await switchProvider('minimax')
    expect(root!.at('$self.minimax.model')!.value).toBe('speech-2.8-turbo')
    expect(root!.at('$self.minimax.apiKey')!.value).toBe('')
    expect(root!.value).toMatchObject({
      bailian: { model: 'cosyvoice-v3-flash', apiKey: '********' },
    })
    await root!.at('$self.minimax.apiKey')!.input('new-minimax-key', false)
    await root!.at('$self.minimax.model')!.input('speech-2.6-hd', false)
    await flushPromises()
    await switchProvider('bailian')
    expect(root!.at('$self.bailian.model')!.value).toBe('cosyvoice-v3-flash')
    expect(root!.at('$self.bailian.apiKey')!.value).toBe('********')
    await switchProvider('doubao')
    expect(root!.at('$self.doubao.apiKey')!.value).toBe('********')
    expect(root!.at('$self.doubao.voiceA')!.value).toBe('zh_male_dayixiansheng_v2_saturn_bigtts')
    await switchProvider('minimax')
    expect(root!.at('$self.minimax.model')!.value).toBe('speech-2.6-hd')
    expect(root!.at('$self.minimax.apiKey')!.value).toBe('new-minimax-key')
    expect(root!.value).toMatchObject({
      bailian: { model: 'cosyvoice-v3-flash', apiKey: '********' },
      minimax: { model: 'speech-2.6-hd', apiKey: 'new-minimax-key' },
      doubao: { model: 'podcast', apiKey: '********' },
    })
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { bailian: '********', minimax: '********', doubao: '********' },
    })
    vi.mocked(workbenchApi.saveConfigGroup).mockImplementation(async (_, config) => config)
    const saved = await savePodcastConfig(root!.value as ConfigValues)
    expect(axiosInstance.put).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        bailian: '********',
        minimax: 'new-minimax-key',
        doubao: '********',
      }),
    )
    expect(vi.mocked(workbenchApi.saveConfigGroup).mock.calls[0]![1]).toMatchObject({
      provider: 'minimax',
      bailian: { model: 'cosyvoice-v3-flash' },
      minimax: { model: 'speech-2.6-hd' },
    })
    expect(saved).toMatchObject({
      bailian: { model: 'cosyvoice-v3-flash', apiKey: '********' },
      minimax: { model: 'speech-2.6-hd', apiKey: '********' },
      doubao: { model: 'podcast', apiKey: '********' },
    })
    wrapper.unmount()
  })
})
