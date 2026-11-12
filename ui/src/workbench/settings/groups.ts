import basic from './schemas/basic'
import roles from './schemas/roles'
import rag from './schemas/rag'
import summary from './schemas/summary'
import articleReading from './schemas/articleReading'
import glossary from './schemas/glossary'
import smartSearch from './schemas/smartSearch'
import style from './schemas/style'
import assistant from './schemas/assistant'
import agent from './schemas/agent'
import mcp from './schemas/mcp'
import podcast from './schemas/podcast'
import { mergeConfigValues, type ConfigValues } from '@/api/plugin-config'

export interface SettingsField {
  $formkit: string
  name?: string
  value?: unknown
  if?: string
  children?: SettingsField[]
  [key: string]: unknown
}

const schemas = {
  basic,
  rag,
  roles,
  summary,
  articleReading,
  glossary,
  smartSearch,
  podcast,
  style,
  assistant,
  agent,
  mcp,
}
export type SettingGroupId = keyof typeof schemas

export const settingGroupDetails: Record<string, { description: string; icon: string }> = {
  basic: {
    description: '选择各项功能使用的模型，并配置访问方式、来源校验和请求限流。',
    icon: 'sparkles',
  },
  rag: { description: '调整内容分块、索引构建、混合检索和多轮对话上下文。', icon: 'book' },
  roles: { description: '为摘要、写作、润色和问答设置不同的角色与提示词。', icon: 'message' },
  summary: { description: '控制文章摘要的生成、同步方式和前台展示。', icon: 'book' },
  articleReading: { description: '配置洞察图谱的生成、文章页展示与默认折叠。', icon: 'graph' },
  glossary: { description: '自动识别文章中的生僻词与专业术语，结合上下文提供解释。', icon: 'book' },
  smartSearch: {
    description: '连接主题搜索入口，提供语义查找与带来源的 AI 解答。',
    icon: 'search',
  },
  podcast: {
    description: '用 AI 基座编写讨论稿，配置双音色语音服务与音频存储。',
    icon: 'headphones',
  },
  style: { description: '调整文章摘要框的布局、字体、颜色和外观。', icon: 'settings' },
  assistant: { description: '设置助手名称、欢迎语、快捷问题、外观和显示位置。', icon: 'pet' },
  agent: {
    description: '选择助手可以使用的站点工具，并设置工具范围和执行方式。',
    icon: 'activity',
  },
  mcp: {
    description: '连接外部工具服务，为前台聊天添加搜索、文档和业务查询能力。',
    icon: 'activity',
  },
}

const labels: Record<SettingGroupId, string> = {
  basic: 'AI 设置',
  rag: '知识库设置',
  roles: '角色设置',
  summary: '摘要设置',
  articleReading: '洞察图谱',
  glossary: '热词注释',
  smartSearch: '智能搜索',
  podcast: '播客听读',
  style: '摘要样式',
  assistant: '前台智能助手',
  agent: 'Agent 能力',
  mcp: 'MCP 服务',
}

function prepareSchema(fields: SettingsField[]): SettingsField[] {
  return fields.map((field) => ({
    ...field,
    ...(field.if ? { preserve: true } : {}),
    ...(field.children ? { children: prepareSchema(field.children) } : {}),
  }))
}

export const settingGroups = (Object.keys(schemas) as SettingGroupId[]).map((group) => ({
  group,
  label: labels[group],
  formSchema: prepareSchema(schemas[group] as SettingsField[]),
}))

export function getSettingGroup(value: unknown) {
  return settingGroups.find((group) => group.group === value) || settingGroups[0]!
}

export function schemaDefaults(fields: SettingsField[]): ConfigValues {
  const values: ConfigValues = {}
  for (const field of fields) {
    if (!field.name) continue
    if (field.$formkit === 'group') {
      values[field.name] = mergeConfigValues(
        schemaDefaults(field.children || []),
        (field.value || {}) as ConfigValues,
      )
    } else if (field.value !== undefined) {
      values[field.name] = structuredClone(field.value)
    }
  }
  return values
}

export function groupValues(group: SettingGroupId, saved: ConfigValues = {}) {
  return mergeConfigValues(schemaDefaults(getSettingGroup(group).formSchema), saved)
}
