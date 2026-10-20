import type { useFormKitContext } from '@formkit/vue'
import type { SpeechSettings } from './speech-models'

type SpeechNode = NonNullable<ReturnType<typeof useFormKitContext<SpeechSettings>>['value']>['node']

/** Commit related fields together before a select input settles its parent group. */
export function createSpeechSettingsUpdater(node: SpeechNode, directMinimax: () => boolean) {
  let committing = false
  return (settings: SpeechSettings) => {
    if (committing || node.props.disabled) return
    const next = { ...settings }
    if (directMinimax() && next.model) next.model = next.model.replace('MiniMax/', '')
    const previous = (node._value || {}) as SpeechSettings
    if (
      Object.keys(previous).length === Object.keys(next).length &&
      Object.entries(next).every(([key, value]) => previous[key] === value)
    )
      return
    committing = true
    try {
      // A group hydration skips children that are still settling. Update the actual
      // child nodes synchronously so a pending select commit cannot restore old voices.
      for (const [key, value] of Object.entries(next)) {
        const child = node.children.find((item) => item.name === key)
        if (child && child._value !== value) child.input(value, false)
      }
      node.input(next, false)
    } finally {
      committing = false
    }
  }
}
