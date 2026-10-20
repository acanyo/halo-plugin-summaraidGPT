import { defineComponent, h, markRaw, type PropType, type Component } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { FormKit, defaultConfig, plugin, type useFormKitContext } from '@formkit/vue'
import { describe, expect, it } from 'vitest'
import { createSpeechSettingsUpdater } from '../speech-form-state'
import { selectSpeechModel, selectSpeechVoice, type SpeechSettings } from '../speech-models'

type SpeechContext = NonNullable<ReturnType<typeof useFormKitContext<SpeechSettings>>['value']>
const Field = FormKit as unknown as Component

describe('speech form state', () => {
  it('commits compatible voices to child nodes and the form when a model select settles', async () => {
    let context: SpeechContext | undefined
    const Fields = defineComponent({
      props: { context: { type: Object as PropType<SpeechContext>, required: true } },
      setup(props) {
        context = props.context
        const update = createSpeechSettingsUpdater(props.context.node, () => false)
        return () =>
          h('div', [
            h(Field, {
              type: 'text',
              name: 'model',
              onInput: (value: unknown) =>
                update(selectSpeechModel(props.context._value, String(value))),
            }),
            ...(['voiceA', 'voiceB'] as const).map((field) =>
              h(Field, {
                type: 'text',
                name: field,
                onInput: (value: unknown) =>
                  update(selectSpeechVoice(props.context._value, field, String(value))),
              }),
            ),
          ])
      },
    })
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Field,
            {
              type: 'form',
              actions: false,
              value: {
                bailianCredentialSource: 'cosyvoice',
                bailian: {
                  model: 'cosyvoice-v3-flash',
                  voiceA: 'longanyang',
                  voiceB: 'longanhuan',
                  apiKey: '********',
                  workspaceId: 'existing-workspace',
                },
              },
            },
            {
              default: () => h(Field, { type: 'speechSettings', name: 'bailian' }),
            },
          ),
      }),
      {
        global: {
          plugins: [
            [
              plugin,
              defaultConfig({
                inputs: { speechSettings: { type: 'group', component: markRaw(Fields) } },
              }),
            ],
          ],
        },
      },
    )
    await flushPromises()
    await context!.node.at('$self.model')!.input('qwen-audio-3.1-tts-flash', false)
    await flushPromises()
    const expected = {
      model: 'qwen-audio-3.1-tts-flash',
      voiceA: 'longanyang_v3.1',
      voiceB: 'longanhuan_v3.1',
      apiKey: '********',
      workspaceId: 'existing-workspace',
    }
    expect(context!.node.value).toMatchObject(expected)
    expect(context!.node.at('$self.voiceA')!.value).toBe(expected.voiceA)
    expect(context!.node.at('$self.voiceB')!.value).toBe(expected.voiceB)
    expect(context!.node.root.value).toMatchObject({
      bailianCredentialSource: 'cosyvoice',
      bailian: expected,
    })
    wrapper.unmount()
  })
})
