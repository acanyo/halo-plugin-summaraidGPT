import { describe, expect, it } from 'vitest'
import { mergeConfigValues } from '@/api/plugin-config'
import { groupValues, settingGroups } from '../settings/groups'

describe('configuration migration values', () => {
  it('populates nested defaults on an empty installation', () => {
    expect(groupValues('basic')).toMatchObject({
      generationSetting: { tagGenerationCount: 5, polishMaxLength: 2000 },
      aiSecuritySetting: { antiHotlinkEnabled: true, rateLimitRequests: 20 },
    })
    expect(groupValues('rag')).toMatchObject({
      chunkSize: 900,
      embeddingCallSetting: { embeddingBatchSize: 1, embeddingMaxRetries: 0 },
    })
  })

  it('keeps saved disabled features, empty arrays and cleared values', () => {
    expect(
      groupValues('assistant', {
        enableAssistant: false,
        quickQuestions: [],
        styleConfig: { stylePreset: 'custom', primaryColor: '#ffffff' },
        petdexAttachmentStorage: { enabled: false, policyName: null },
      }),
    ).toMatchObject({
      enableAssistant: false,
      quickQuestions: [],
      styleConfig: { stylePreset: 'custom', primaryColor: '#ffffff', colorMode: 'light' },
      petdexAttachmentStorage: { enabled: false, policyName: null },
    })
  })

  it('preserves nested fields and replaces arrays without changing the input', () => {
    const saved = { future: 'keep', security: { allow: true, extra: 10 }, origins: ['old'] }
    expect(mergeConfigValues(saved, { security: { allow: false }, origins: [] })).toEqual({
      future: 'keep',
      security: { allow: false, extra: 10 },
      origins: [],
    })
    expect(saved.security.allow).toBe(true)
    expect(saved.origins).toEqual(['old'])
  })

  it('ships every category and keeps conditional field values', () => {
    expect(settingGroups.map((group) => group.group)).toEqual([
      'basic',
      'rag',
      'roles',
      'summary',
      'articleReading',
      'podcast',
      'style',
      'assistant',
      'agent',
    ])
    const assistant = settingGroups.find((group) => group.group === 'assistant')!
    expect(assistant.formSchema.find((field) => field.name === 'welcomeMessage')).toMatchObject({
      preserve: true,
    })
    expect(groupValues('agent').networkAccess).toMatchObject({ allowedOrigins: [] })
  })
})
