export type ConfigValues = Record<string, unknown>
export type PluginConfig = Record<string, ConfigValues>

function isObject(value: unknown): value is ConfigValues {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Arrays and explicit empty/false values replace the old value; nested objects retain unknown keys.
export function mergeConfigValues(base: ConfigValues, updates: ConfigValues): ConfigValues {
  const result = structuredClone(base)
  for (const [key, value] of Object.entries(updates)) {
    result[key] =
      isObject(value) && isObject(result[key])
        ? mergeConfigValues(result[key], value)
        : structuredClone(value)
  }
  return result
}
