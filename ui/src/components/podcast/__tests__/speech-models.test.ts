import { describe, expect, it } from 'vitest'
import {
  selectSpeechModel,
  selectSpeechVoice,
  findSpeechModel,
  speechCapabilities,
  speechInstructionFits,
  speechModels,
} from '../speech-models'

describe('speech model compatibility', () => {
  it('replaces incompatible system voices while retaining API settings', () => {
    const result = selectSpeechModel(
      {
        model: 'cosyvoice-v3-flash',
        voiceA: 'longanyang',
        voiceB: 'longanhuan',
        apiKey: '********',
        workspaceId: 'existing-workspace',
        emotion: 'happy',
      },
      'qwen-audio-3.1-tts-flash',
    )
    expect(result).toMatchObject({
      model: 'qwen-audio-3.1-tts-flash',
      voiceA: 'longanyang_v3.1',
      voiceB: 'longanhuan_v3.1',
      apiKey: '********',
      workspaceId: 'existing-workspace',
      emotion: '',
    })
  })

  it('keeps authorized custom voices and leaves clone-only models without invented presets', () => {
    expect(
      selectSpeechModel(
        {
          voiceA: 'cosyvoice-v3.5-plus-custom-a',
          voiceB: 'cosyvoice-v3.5-plus-custom-b',
        },
        'cosyvoice-v3.5-plus',
      ),
    ).toMatchObject({
      voiceA: 'cosyvoice-v3.5-plus-custom-a',
      voiceB: 'cosyvoice-v3.5-plus-custom-b',
    })
    expect(
      selectSpeechModel(
        {
          voiceA: 'longanyang',
          voiceB: 'longanhuan',
        },
        'cosyvoice-v3.5-plus',
      ),
    ).toMatchObject({ voiceA: '', voiceB: '' })
    expect(
      selectSpeechModel(
        { voiceA: 'cosyvoice-v3-flash-custom-a', voiceB: 'cosyvoice-v3-flash-custom-b' },
        'cosyvoice-v3.5-plus',
      ),
    ).toMatchObject({ voiceA: '', voiceB: '' })
  })

  it('offers fixed CosyVoice emotions without a free instruction field', () => {
    expect(
      speechCapabilities({
        model: 'cosyvoice-v3-flash',
        voiceA: 'longanyang',
        voiceB: 'longanhuan',
      }),
    ).toMatchObject({
      freeInstruction: false,
      autoEmotion: true,
      emotions: ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'],
      languages: ['zh', 'en'],
    })
  })

  it('clears unsupported settings for a CosyVoice V2 selection', () => {
    expect(
      selectSpeechModel(
        {
          voiceA: 'longanyang',
          voiceB: 'longanhuan',
          instruction: '温暖柔和',
          emotion: 'happy',
          autoEmotion: true,
          language: 'ja',
        },
        'cosyvoice-v2',
      ),
    ).toMatchObject({
      instruction: '',
      emotion: '',
      autoEmotion: false,
      language: '',
    })
  })

  it('restricts language to both voices and removes instructions for an English-only voice', () => {
    const settings = {
      model: 'qwen-audio-3.0-tts-flash',
      voiceA: 'longchuanshu_v3.6',
      voiceB: 'longanhuan_v3.6',
      instruction: '温暖柔和',
      language: 'zh',
    }
    const changed = selectSpeechVoice(settings, 'voiceB', 'loongmary')
    expect(changed).toMatchObject({ instruction: '', language: '' })
    expect(speechCapabilities(changed)).toMatchObject({ freeInstruction: false, languages: ['en'] })
  })

  it('allows free instructions for two compatible custom CosyVoice Flash voices', () => {
    expect(
      speechCapabilities({
        model: 'cosyvoice-v3-flash',
        voiceA: 'cosyvoice-v3-flash-custom-a',
        voiceB: 'cosyvoice-v3-flash-custom-b',
      }).freeInstruction,
    ).toBe(true)
    expect(
      speechCapabilities({
        model: 'cosyvoice-v3-plus',
        voiceA: 'cosyvoice-v3-flash-custom-a',
        voiceB: 'longanhuan',
      }),
    ).toMatchObject({ freeInstruction: false, emotions: [], autoEmotion: false })
  })

  it('requires recognized clone prefixes before enabling instruction capabilities', () => {
    expect(
      speechCapabilities({
        model: 'cosyvoice-v3.5-plus',
        voiceA: 'unknown-system-a',
        voiceB: 'unknown-system-b',
      }),
    ).toMatchObject({ freeInstruction: false, emotions: [], autoEmotion: false })
  })

  it('counts Han characters and reserves space for automatic emotion instructions', () => {
    expect(speechInstructionFits('温'.repeat(50), 'cosyvoice', '', false)).toBe(true)
    expect(speechInstructionFits('温'.repeat(50), 'cosyvoice', 'happy', false)).toBe(false)
    expect(speechInstructionFits('温'.repeat(50), 'cosyvoice', '', true)).toBe(false)
    expect(speechInstructionFits('温暖柔和', 'cosyvoice', '', true)).toBe(true)
  })

  it('offers only the MiniMax models available through the selected channel', () => {
    const minimaxModels = speechModels.filter((model) => model.family === 'minimax')
    expect(minimaxModels.filter((model) => model.channels.includes('minimax'))).toHaveLength(8)
    expect(minimaxModels.filter((model) => model.channels.includes('bailian'))).toHaveLength(4)
    for (const modelId of [
      'MiniMax/speech-2.6-turbo',
      'MiniMax/speech-2.6-hd',
      'MiniMax/speech-01-turbo',
      'MiniMax/speech-01-hd',
    ]) {
      expect(findSpeechModel(modelId, 'minimax')).toBeDefined()
      expect(findSpeechModel(modelId, 'bailian')).toBeUndefined()
    }
  })

  it.each(['turbo', 'hd'])(
    'applies channel-specific 02 %s emotion and language limits without changing the catalog',
    (quality) => {
      const modelId = `MiniMax/speech-02-${quality}`
      const settings = {
        model: modelId,
        voiceA: 'male-qn-qingse',
        voiceB: 'female-shaonv',
      }
      const direct = speechCapabilities(settings, 'minimax')
      const bailian = speechCapabilities(settings, 'bailian')
      expect(direct.emotions).not.toContain('whisper')
      expect(direct.languages).not.toContain('fil')
      expect(bailian.emotions).toContain('whisper')
      expect(bailian.languages).toContain('fil')
      // A later read for Bailian must retain its original capabilities.
      expect(findSpeechModel(modelId, 'bailian')?.emotions).toContain('whisper')
      expect(findSpeechModel(modelId, 'bailian')?.languages).toContain('fil')
    },
  )

  it.each(['turbo', 'hd'])(
    'retains direct 2.6 %s fluent and whisper expressions when selecting a voice',
    (quality) => {
      const settings = {
        model: `MiniMax/speech-2.6-${quality}`,
        voiceA: 'male-qn-qingse',
        voiceB: 'female-shaonv',
        emotion: 'fluent',
        language: 'zh',
        apiKey: '********',
      }
      expect(speechCapabilities(settings, 'minimax').emotions).toEqual(
        expect.arrayContaining(['fluent', 'whisper']),
      )
      expect(
        selectSpeechVoice(settings, 'voiceB', 'authorized-custom-voice', 'minimax'),
      ).toMatchObject({
        model: settings.model,
        apiKey: '********',
        emotion: 'fluent',
        language: 'zh',
      })
    },
  )

  it('clears only incompatible expressions when changing direct MiniMax models', () => {
    const original = {
      model: 'MiniMax/speech-2.6-turbo',
      voiceA: 'male-qn-qingse',
      voiceB: 'female-shaonv',
      emotion: 'whisper',
      language: 'fil',
      autoEmotion: true,
      apiKey: '********',
      workspaceId: 'stored-channel-workspace',
    }
    expect(selectSpeechModel(original, 'MiniMax/speech-02-hd', 'minimax')).toMatchObject({
      model: 'MiniMax/speech-02-hd',
      emotion: '',
      language: '',
      autoEmotion: true,
      apiKey: '********',
      workspaceId: 'stored-channel-workspace',
    })
    expect(original.emotion).toBe('whisper')
    expect(original.language).toBe('fil')
    expect(original.model).toBe('MiniMax/speech-2.6-turbo')
  })
})
