import { consoleApiClient, axiosInstance } from '@halo-dev/api-client'
import { mergeConfigValues, type PluginConfig } from './plugin-config'

export type { PluginConfig } from './plugin-config'

const PLUGIN_NAME = 'summaraidGPT'

export const workbenchApi = {
  async getConfig(): Promise<PluginConfig> {
    const { data } = await consoleApiClient.plugin.plugin.fetchPluginJsonConfig({
      name: PLUGIN_NAME,
    })
    return (data || {}) as PluginConfig
  },

  async saveConfigGroup(group: string, values: Record<string, unknown>) {
    // Read again before saving so editing one group never replaces another group's newer values.
    const config = await this.getConfig()
    const savedValues = mergeConfigValues(config[group] || {}, values)
    await consoleApiClient.plugin.plugin.updatePluginJsonConfig({
      name: PLUGIN_NAME,
      body: { ...config, [group]: savedValues },
    })
    return savedValues
  },

  async replaceConfig(config: PluginConfig) {
    await consoleApiClient.plugin.plugin.updatePluginJsonConfig({ name: PLUGIN_NAME, body: config })
  },

  async syncSummaries() {
    const { data } = await axiosInstance.post<string>(
      '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/syncAll',
    )
    return data
  },
}
