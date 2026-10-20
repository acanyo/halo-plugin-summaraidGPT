import { axiosInstance } from '@halo-dev/api-client'
import { workbenchApi } from './workbench'
import type { ConfigValues } from './plugin-config'

const API = '/apis/console.api.summary.summaraidgpt.lik.cc/v1alpha1/podcastCredentials'
const channels = ['bailian', 'cosyvoice', 'bailianMinimax', 'minimax', 'doubao']
const legacyBailianChannels: Record<string, string> = {
  'bailian-cosyvoice': 'cosyvoice',
  'bailian-minimax': 'bailianMinimax',
}

function voiceValues(value: unknown): ConfigValues {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as ConfigValues)
    : {}
}

export async function readPodcastConfig(config: ConfigValues = {}): Promise<ConfigValues> {
  const { data } = await axiosInstance.get<Record<string, string>>(API)
  const values = structuredClone(config)
  for (const channel of channels) {
    values[channel] = { ...voiceValues(values[channel]), apiKey: data[channel] || '' }
  }
  const source = legacyBailianChannels[String(values.provider)]
  if (source) {
    values.provider = 'bailian'
    values.bailian = { ...voiceValues(values[source]) }
    // Only the secret endpoint receives this migration hint when the user saves.
    values.bailianCredentialSource = source
  }
  return values
}

export async function savePodcastConfig(values: ConfigValues): Promise<ConfigValues> {
  const config = structuredClone(values)
  const credentials: Record<string, string> = {}
  const source = config.bailianCredentialSource
  if (source === 'cosyvoice' || source === 'bailianMinimax') {
    credentials.bailianSource = source
  }
  delete config.bailianCredentialSource
  for (const channel of channels) {
    const voice = config[channel] as ConfigValues | undefined
    if (voice && typeof voice.apiKey === 'string') credentials[channel] = voice.apiKey
    if (voice) delete voice.apiKey
  }
  await axiosInstance.put(API, credentials)
  const saved = await workbenchApi.saveConfigGroup('podcast', config)
  return readPodcastConfig(saved)
}
