import catalog from '../../../../shared/podcast/speech-models.json'

export interface SpeechVoice {
  id: string
  label: string
  instructionMode: string
  emotionTemplate: string
  emotions: string[]
  languages: string[]
  channels?: string[]
}
export interface SpeechModel {
  id: string
  label: string
  family: string
  voices: SpeechVoice[]
  instructionMode: string
  customVoiceInstructionMode: string
  customVoicesOnly: boolean
  emotions: string[]
  interjections: string[]
  languages: string[]
  channels: string[]
  channelOverrides?: Record<
    string,
    { emotions: string[]; interjections: string[]; languages: string[] }
  >
  voiceSet?: string
}
export interface SpeechSettings {
  [key: string]: unknown
  model?: string
  voiceA?: string
  voiceB?: string
  instruction?: string
  emotion?: string
  language?: string
  autoEmotion?: boolean
}

const voiceSets: Record<string, SpeechVoice[]> = catalog.voiceSets
export const speechModels: SpeechModel[] = catalog.models.map((model) => ({
  ...model,
  voices: model.voiceSet ? voiceSets[model.voiceSet] : model.voices,
}))
export const speechEmotions = catalog.emotions
export const speechLanguages = catalog.languages
export const speakingStyleOptions = [
  { label: '模型默认', value: '' },
  { label: '自然亲切', value: '请用自然亲切、轻松交流的语气说话。' },
  { label: '温暖舒缓', value: '请用温暖舒缓、柔和从容的语气说话。' },
  { label: '清晰专业', value: '请用清晰专业、沉稳可信的语气说话。' },
  { label: '轻快活泼', value: '请用轻快活泼、有感染力的语气说话。' },
]

export function findSpeechModel(id: unknown, channel = 'bailian') {
  const model = speechModels.find((model) => model.id === id && model.channels.includes(channel))
  return model
    ? {
        ...model,
        ...model.channelOverrides?.[channel],
        voices: model.voices.filter((voice) => !voice.channels || voice.channels.includes(channel)),
      }
    : undefined
}

function voiceInstructionMode(model: SpeechModel, voiceId: unknown) {
  const voice = model.voices.find((item) => item.id === voiceId)
  if (voice) return voice.instructionMode
  const prefix = `${model.id}-`
  return typeof voiceId === 'string' && voiceId.startsWith(prefix)
    ? model.customVoiceInstructionMode
    : 'none'
}

export function speechCapabilities(
  settings: SpeechSettings,
  channel = 'bailian',
): {
  model: SpeechModel | undefined
  freeInstruction: boolean
  emotions: string[]
  languages: string[]
  autoEmotion: boolean
} {
  const model = findSpeechModel(settings.model, channel)
  if (!model)
    return { model, freeInstruction: false, emotions: [], languages: [], autoEmotion: false }
  const voices = [settings.voiceA, settings.voiceB]
  const freeInstruction = voices.every((voice) => voiceInstructionMode(model, voice) === 'free')
  const emotions = model.emotions.filter((emotion) =>
    voices.every((voiceId) => {
      if (model.family !== 'cosyvoice') return true
      const mode = voiceInstructionMode(model, voiceId)
      if (mode === 'none') return false
      const voice = model.voices.find((item) => item.id === voiceId)
      return mode === 'free' || Boolean(voice?.emotions.includes(emotion))
    }),
  )
  const languages = model.languages.filter((language) =>
    voices.every((voiceId) => {
      const voice = model.voices.find((item) => item.id === voiceId)
      return !voice || !voice.languages.length || voice.languages.includes(language)
    }),
  )
  return { model, freeInstruction, emotions, languages, autoEmotion: emotions.length > 0 }
}

function compatibleSettings(settings: SpeechSettings, channel: string): SpeechSettings {
  const result = { ...settings }
  const capabilities = speechCapabilities(result, channel)
  if (!capabilities.freeInstruction) result.instruction = ''
  if (!capabilities.emotions.includes(result.emotion || '')) result.emotion = ''
  if (!capabilities.autoEmotion) result.autoEmotion = false
  if (!capabilities.languages.includes(result.language || '')) result.language = ''
  return result
}

export function selectSpeechModel(
  settings: SpeechSettings,
  modelId: string,
  channel = 'bailian',
): SpeechSettings {
  const model = findSpeechModel(modelId, channel)
  if (!model) return { ...settings, model: modelId }
  const result = { ...settings, model: modelId }
  for (const [index, key] of ['voiceA', 'voiceB'].entries()) {
    const field = key as 'voiceA' | 'voiceB'
    const existing = settings[field]
    const existingSystemVoice = speechModels.some((item) =>
      item.voices.some((voice) => voice.id === existing),
    )
    const existingClone = speechModels.some((item) => existing?.startsWith(`${item.id}-`))
    const incompatibleClone = existingClone && !existing?.startsWith(`${model.id}-`)
    const compatibleVoice = model.voices.some((voice) => voice.id === existing)
    if (!existing || (existingSystemVoice && !compatibleVoice) || incompatibleClone) {
      result[field] = model.voices[index]?.id || ''
    }
  }
  return compatibleSettings(result, channel)
}

export function selectSpeechVoice(
  settings: SpeechSettings,
  field: 'voiceA' | 'voiceB',
  voiceId: string,
  channel = 'bailian',
) {
  return compatibleSettings({ ...settings, [field]: voiceId }, channel)
}

export function speechInstructionFits(
  instruction: string,
  family: string,
  emotion: string,
  automatic: boolean,
): boolean {
  if (family !== 'cosyvoice') return [...instruction].length <= 200
  const weight = (value: string) =>
    [...value].reduce((total, character) => total + (/\p{Script=Han}/u.test(character) ? 2 : 1), 0)
  const labels = automatic
    ? speechEmotions.map((item) => item.label)
    : speechEmotions.filter((item) => item.value === emotion).map((item) => item.label)
  const base = instruction.trim()
  return (
    Math.max(
      weight(base),
      ...labels.map((label) => weight(base + (base ? '\n' : '') + `请用${label}的情感表达。`)),
    ) <= 100
  )
}
