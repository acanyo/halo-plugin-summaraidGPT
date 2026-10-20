import { doubaoPodcastVoiceOptions } from '@/components/podcast/doubao-podcast-voices'
import type { SettingsField } from '../groups'

interface VoiceFieldNode {
  value: unknown
  at: (name: string) => { value: unknown } | undefined
}

function differentHost(node: VoiceFieldNode) {
  return String(node.value || '').trim() !== String(node.at('voiceA')?.value || '').trim()
}

function podcastVoiceId(node: VoiceFieldNode) {
  return typeof node.value === 'string' && /^[A-Za-z0-9_.-]{1,200}$/.test(node.value.trim())
}

const voiceHelp = '可选择原生播客音色，或输入已授权且兼容播客接口的音色 ID 后按回车确认。'
const doubaoPodcast: SettingsField = {
  $formkit: 'group',
  name: 'doubao',
  key: 'podcast-doubao-settings',
  label: '豆包原生双人播客',
  if: "$get(podcastProvider).value === 'doubao'",
  value: {
    model: 'podcast',
    voiceA: 'zh_male_dayixiansheng_v2_saturn_bigtts',
    voiceB: 'zh_female_mizaitongxue_v2_saturn_bigtts',
    speechRate: 0,
  },
  children: [
    {
      $formkit: 'password',
      name: 'apiKey',
      label: '豆包语音 API Key',
      help: '使用豆包语音控制台 API Key，并开通原生播客资源 volc.service_type.10050。密钥保存在 Halo Secret，留空并保存可清除。',
    },
    {
      $formkit: 'select',
      name: 'voiceA',
      label: '主持人 A 音色',
      options: doubaoPodcastVoiceOptions,
      'allow-create': true,
      searchable: true,
      validation: 'required|podcastVoiceId',
      'validation-rules': { podcastVoiceId },
      'validation-messages': {
        podcastVoiceId: '音色 ID 最多 200 字符，仅可包含字母、数字、下划线、点和连字符。',
      },
      placeholder: '选择或输入音色 ID',
      help: `负责提问。${voiceHelp}`,
    },
    {
      $formkit: 'select',
      name: 'voiceB',
      label: '主持人 B 音色',
      options: doubaoPodcastVoiceOptions,
      'allow-create': true,
      searchable: true,
      validation: 'required|podcastVoiceId|differentHost',
      'validation-rules': { podcastVoiceId, differentHost },
      'validation-messages': {
        differentHost: '请为主持人 B 选择与 A 不同的音色。',
        podcastVoiceId: '音色 ID 最多 200 字符，仅可包含字母、数字、下划线、点和连字符。',
      },
      placeholder: '选择或输入音色 ID',
      help: `负责解释，使用与 A 不同的音色。${voiceHelp}`,
    },
    {
      $formkit: 'number',
      name: 'speechRate',
      label: '播客语速',
      value: 0,
      min: -50,
      max: 100,
      step: 1,
      validation: 'required|number|between:-50,100|matches:/^-?\\d+$/',
      'validation-messages': {
        between: '语速必须在 -50 到 100 之间。',
        matches: '请填写整数语速。',
      },
      help: '0 为正常语速，-50 约为 0.5 倍速，100 约为 2 倍速；合成时应用，与播放器倍速独立。',
    },
  ],
}

export default doubaoPodcast
