import { describe, expect, it } from 'vitest'
import {
  migratedConfig,
  migrationRecord,
  planLegacyMigration,
  undoLegacyMigration,
  MIGRATION_GROUP,
} from '../settings/migration/plan'
import { settingGroups } from '../settings/groups'
import { settingSections } from '../settings/sections'
import type { PluginConfig } from '@/api/workbench'

const legacy = (): PluginConfig => ({
  basic: {
    languageModelName: '',
    futureValue: 'keep',
    aiSecuritySetting: { rateLimitEnabled: false, allowedOrigins: [] },
  },
  assistant: {
    enableAssistant: false,
    quickQuestions: [],
    floatingPosition: { horizontalOffset: 0 },
    assistantAvatar: null,
  },
  roles: { summarySystemPrompt: '用户自己的提示词' },
  future: { something: true },
  [MIGRATION_GROUP]: { otherPreference: 'keep' },
})

describe('legacy settings migration', () => {
  it('previews missing settings without mutating old values, defaults or unknown groups', () => {
    const old = legacy()
    const snapshot = structuredClone(old)
    const plan = planLegacyMigration(old)
    expect(old).toEqual(snapshot)
    expect(plan.detectedCount).toBe(3)
    expect(plan.next).toMatchObject({
      basic: {
        languageModelName: '',
        futureValue: 'keep',
        aiSecuritySetting: { rateLimitEnabled: false, allowedOrigins: [], rateLimitRequests: 20 },
      },
      assistant: {
        enableAssistant: false,
        quickQuestions: [],
        floatingPosition: { horizontalOffset: 0, verticalOffset: 24 },
        assistantAvatar: null,
      },
      roles: { summarySystemPrompt: '用户自己的提示词' },
      future: { something: true },
    })
    expect(plan.added.length).toBeGreaterThan(0)
  })

  it('stores an exact original backup and is idempotent on a second migration', () => {
    const old = legacy()
    const next = migratedConfig(old, '2026-10-19T12:00:00.000Z')
    expect(migrationRecord(next)?.backup).toEqual(old)
    expect(migratedConfig(next, 'later')).toEqual(next)
    expect(undoLegacyMigration(next).config).toEqual(old)
  })

  it('retains later edits in new settings, existing settings and unrelated groups during undo', () => {
    const next = migratedConfig(legacy(), '2026-10-19T12:00:00.000Z')
    const security = next.basic!.aiSecuritySetting as Record<string, unknown>
    security.rateLimitRequests = 9
    next.roles!.summarySystemPrompt = '迁移后又改过的提示词'
    next.newGroup = { preserve: true }
    const result = undoLegacyMigration(next)
    expect(result.config.basic!.aiSecuritySetting).toEqual({
      rateLimitEnabled: false,
      allowedOrigins: [],
      rateLimitRequests: 9,
    })
    expect(result.config.roles!.summarySystemPrompt).toBe('迁移后又改过的提示词')
    expect(result.config.newGroup).toEqual({ preserve: true })
    expect(result.retained).toBe(1)
    expect(migrationRecord(result.config)).toBeUndefined()
  })

  it('does not pretend that an empty new installation has old configuration', () => {
    expect(planLegacyMigration({}).detectedCount).toBe(0)
    expect(() => migratedConfig({}, 'now')).toThrow('没有检测到旧设置')
  })

  it('preserves explicit null groups instead of replacing them with defaults', () => {
    const old = { ...legacy(), rag: null } as unknown as PluginConfig
    expect(migratedConfig(old, 'now').rag).toBeNull()
  })
})

describe('settings page sections', () => {
  it.each(settingGroups)('shows all fields in $group exactly once', (group) => {
    const names = settingSections(group.group).flatMap((section) =>
      section.schema.map((field) => field.name),
    )
    expect(names.sort()).toEqual(group.formSchema.map((field) => field.name).sort())
    expect(new Set(names).size).toBe(names.length)
  })
})
