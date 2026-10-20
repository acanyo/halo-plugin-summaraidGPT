import { getSettingGroup, type SettingGroupId } from './groups'

interface SettingSection {
  id: string
  title: string
  description: string
  fields: string[]
}
const section = (
  id: string,
  title: string,
  description: string,
  fields: string[],
): SettingSection => ({ id, title, description, fields })
const definitions: Partial<Record<SettingGroupId, SettingSection[]>> = {
  podcast: [
    section('reading', '听读与讨论稿', '每篇文章先生成讨论稿，确认后再合成两位主持人的音频。', [
      'enabled',
      'enableUiInjection',
      'scriptModelName',
      'durationMinutes',
      'style',
      'introText',
      'outroText',
    ]),
    section('speech', '语音服务', '语音直接调用所选渠道，模型与音色需在该渠道开通。', [
      'provider',
      'bailian',
      'minimax',
      'doubao',
    ]),
    section(
      'storage',
      '音频保存',
      '保存后可重复播放。重新生成的历史音频仍保留在附件库，可自行清理。',
      ['policyName', 'groupName'],
    ),
  ],
  basic: [
    section('models', '模型选择', '选择主模型与知识库模型；留空时沿用 AI 基座默认值。', [
      'languageModelName',
      'vectorModelSetting',
    ]),
    section('feature-models', '各功能模型', '需要为特定任务使用不同模型时，再单独指定。', [
      'textModelSetting',
    ]),
    section('generation', '内容生成', '控制标签数量与单次润色长度。', ['generationSetting']),
    section('access', '访问与限流', '设置访客访问方式、来源校验和请求频率。', [
      'aiSecuritySetting',
    ]),
  ],
  assistant: [
    section('identity', '助手与对话', '决定访客看到的名称、欢迎语和提问入口。', [
      'enableAssistant',
      'displayMode',
      'assistantName',
      'welcomeMessage',
      'quickQuestions',
      'assistantAvatar',
    ]),
    section('pet', '宠物与资源', '调整悬浮形象的大小，以及远程资源的加载方式。', [
      'petSize',
      'petdexProxyBaseUrl',
      'petdexAttachmentStorage',
    ]),
    section('speech', '气泡文案', '根据显示模式，为宠物设置合适的提示语。', [
      'petSpeechMessages',
      'petOnlySpeechMessages',
    ]),
    section('appearance', '外观与位置', '选择配色、明暗模式和默认悬浮位置。', [
      'styleConfig',
      'floatingPosition',
    ]),
  ],
  rag: [
    section('index', '内容与索引', '控制知识库开关、内容切分和索引构建。', [
      'enableRag',
      'chunkSize',
      'chunkOverlap',
      'indexDocumentBatchSize',
      'embeddingCallSetting',
    ]),
    section('retrieval', '检索与精排', '平衡召回范围、结果相关性和上下文长度。', [
      'enableHybridSearch',
      'vectorTopK',
      'keywordTopK',
      'enableRerank',
      'rerankTopN',
      'maxContextCharacters',
    ]),
    section('conversation', '会话上下文', '控制每次问答带入的历史消息和字符预算。', [
      'conversationMaxMessages',
      'conversationMaxContextCharacters',
    ]),
  ],
  agent: [
    section('capabilities', '站点能力', '选择 Agent 可以使用的工具范围。', ['enabled', 'builtIn']),
    section('navigation', '页面与内容', '调整可信页面导航、搜索类型和返回数量。', [
      'toolSecurity',
      'haloSearch',
      'ragSearch',
      'haloResourceDetail',
    ]),
    section('network', '网络与自定义工具', '按需开放外部网络与自定义浏览器动作。', [
      'networkAccess',
      'aiTools',
    ]),
  ],
  roles: [
    section('reading', '阅读与知识问答', '为摘要、洞察图谱和知识库问答设定表达方式。', [
      'summarySystemPrompt',
      'articleReadingSystemPrompt',
      'ragSystemPrompt',
    ]),
    section('writing', '写作与编辑', '为写作、润色、标题、标签和编辑器对话设置角色。', [
      'conversationSystemPrompt',
      'tagGenerationPrompt',
      'polishSystemPrompt',
      'generateSystemPrompt',
      'titleSystemPrompt',
    ]),
    section('agent', '站点 Agent', '设定站点助手在工具调用和操作中的行为边界。', [
      'agentSystemPrompt',
    ]),
  ],
}

export function settingSections(group: SettingGroupId) {
  const fields = getSettingGroup(group).formSchema
  const sections = definitions[group] || [
    section(
      'preferences',
      '功能偏好',
      '',
      fields.map((field) => field.name || ''),
    ),
  ]
  return sections
    .map((item) => ({
      ...item,
      schema: fields.filter((field) => item.fields.includes(field.name || '')),
    }))
    .filter((item) => item.schema.length)
}

export const settingsCategories = [
  { label: '基础配置', groups: ['basic', 'roles'] },
  { label: '内容与阅读', groups: ['rag', 'summary', 'articleReading', 'podcast', 'style'] },
  { label: '站点体验', groups: ['assistant', 'agent'] },
] as const
