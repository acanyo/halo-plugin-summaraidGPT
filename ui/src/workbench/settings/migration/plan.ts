import type { ConfigValues, PluginConfig } from '@/api/plugin-config'
import { schemaDefaults, settingGroups } from '../groups'

export const MIGRATION_VERSION = 1
export const MIGRATION_GROUP = '_workbench'
export interface AddedSetting {
  path: string[]
  value: unknown
}
export interface MigrationRecord {
  version: number
  completedAt: string
  backup: PluginConfig
  added: AddedSetting[]
}

function isObject(value: unknown): value is ConfigValues {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
function has(object: ConfigValues, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key)
}
function equalValues(first: unknown, second: unknown): boolean {
  if (Array.isArray(first) && Array.isArray(second))
    return (
      first.length === second.length &&
      first.every((value, index) => equalValues(value, second[index]))
    )
  if (isObject(first) && isObject(second))
    return (
      Object.keys(first).length === Object.keys(second).length &&
      Object.keys(first).every((key) => has(second, key) && equalValues(first[key], second[key]))
    )
  return first === second
}
function fillMissing(
  target: ConfigValues,
  defaults: ConfigValues,
  path: string[],
  added: AddedSetting[],
) {
  for (const [name, value] of Object.entries(defaults)) {
    if (!has(target, name)) {
      target[name] = structuredClone(value)
      added.push({ path: [...path, name], value: structuredClone(value) })
    } else if (isObject(target[name]) && isObject(value)) {
      fillMissing(target[name], value, [...path, name], added)
    }
  }
}

export function migrationRecord(config: PluginConfig): MigrationRecord | undefined {
  const record = config[MIGRATION_GROUP]?.legacyMigration
  if (
    !isObject(record) ||
    record.version !== MIGRATION_VERSION ||
    typeof record.completedAt !== 'string' ||
    !isObject(record.backup) ||
    !Array.isArray(record.added)
  )
    return undefined
  return record as unknown as MigrationRecord
}

export function planLegacyMigration(config: PluginConfig) {
  const next = structuredClone(config)
  const added: AddedSetting[] = []
  const groups = settingGroups.map((group) => {
    const previous = config[group.group]
    const detected = isObject(previous) && Object.keys(previous).length > 0
    const defaults = schemaDefaults(group.formSchema)
    const start = added.length
    // An explicit null/array is preserved for a future version to interpret.
    if (!has(next, group.group)) {
      next[group.group] = {}
      fillMissing(next[group.group], defaults, [group.group], added)
      if (Object.keys(next[group.group]).length === 0) delete next[group.group]
    } else if (isObject(next[group.group])) {
      fillMissing(next[group.group], defaults, [group.group], added)
    }
    return { group: group.group, label: group.label, detected, addedCount: added.length - start }
  })
  return { next, groups, added, detectedCount: groups.filter((group) => group.detected).length }
}

export function migratedConfig(config: PluginConfig, completedAt: string): PluginConfig {
  if (migrationRecord(config)) return structuredClone(config)
  const plan = planLegacyMigration(config)
  if (!plan.detectedCount) throw new Error('没有检测到旧设置，请先通过使用引导配置插件。')
  const backup = structuredClone(config)
  const record: MigrationRecord = {
    version: MIGRATION_VERSION,
    completedAt,
    backup,
    added: plan.added,
  }
  return {
    ...plan.next,
    [MIGRATION_GROUP]: { ...config[MIGRATION_GROUP], legacyMigration: record },
  }
}

// Remove only migration additions that still match. Settings edited afterwards are retained.
export function undoLegacyMigration(config: PluginConfig) {
  const record = migrationRecord(config)
  if (!record) throw new Error('没有可撤销的迁移记录。')
  const next = structuredClone(config)
  let retained = 0
  for (const addition of record.added) {
    const parentPath = addition.path.slice(0, -1)
    const name = addition.path[addition.path.length - 1]!
    let parent: ConfigValues = next
    for (const key of parentPath) {
      if (!isObject(parent[key])) {
        parent = {}
        break
      }
      parent = parent[key]
    }
    if (!has(parent, name)) continue
    if (equalValues(parent[name], addition.value)) delete parent[name]
    else retained++
  }
  for (const group of settingGroups) {
    if (
      !has(record.backup, group.group) &&
      isObject(next[group.group]) &&
      !Object.keys(next[group.group]).length
    )
      delete next[group.group]
  }
  const meta = { ...next[MIGRATION_GROUP] }
  if (record.backup[MIGRATION_GROUP]?.legacyMigration !== undefined)
    meta.legacyMigration = record.backup[MIGRATION_GROUP].legacyMigration
  else delete meta.legacyMigration
  if (Object.keys(meta).length) next[MIGRATION_GROUP] = meta
  else delete next[MIGRATION_GROUP]
  return { config: next, retained }
}
