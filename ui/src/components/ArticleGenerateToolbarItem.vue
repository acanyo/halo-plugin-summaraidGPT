<template>
  <div class="generate-toolbar-item">
    <VDropdown
      v-model:visible="dropdownVisible"
      :disabled="disabled"
      :triggers="['click']"
      :auto-close="false"
      :close-on-content-click="false"
      @update:visible="handleOpenDropdown"
    >
      <button
        v-tooltip="tooltipText"
        class="generate-toolbar-btn"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <IconWand2 class="h-4 w-4" />
      </button>

      <template #popper>
        <div class="generate-dropdown" @click.stop>
          <!-- 使用说明 -->
          <div class="p-3">
            <VAlert
              type="info"
              title="AI智能生成"
              description="使用AI生成文章、标题和标签，常用写作操作集中在一个入口里"
              :closable="false"
              class="text-xs"
            />
          </div>

          <!-- 标签页导航 -->
          <div class="p-3">
            <VTabbar
              v-model:activeId="activeTab"
              :items="tabItems"
              type="default"
            />
          </div>

          <!-- 文章生成标签页 -->
          <div v-if="activeTab === 'article'" class="px-4 pb-4">
            <!-- 主要内容区域 -->
            <div class="generate-content">
              <!-- 左侧：文章主题区域 -->
              <div class="topic-section">
                <div class="section-header">
                  <h4 class="section-title">
                    <IconEdit />
                    文章主题
                  </h4>
                </div>
                <div class="section-content">
                  <FormKit
                    type="form"
                    v-model="formData"
                    :actions="false"
                    @submit="handleGenerate"
                  >
                    <FormKit
                      name="topic"
                      label="文章主题"
                      type="textarea"
                      placeholder="请输入文章主题或关键词，例如：人工智能的发展趋势"
                      :rows="6"
                      validation="required"
                    />

                    <FormKitMessages />
                  </FormKit>
                </div>
              </div>

              <!-- 右侧：生成设置区域 -->
              <div class="format-section">
                <div class="section-header">
                  <h4 class="section-title">
                    <IconSparkles />
                    生成设置
                  </h4>
                </div>
                <div class="section-content">
                  <FormKit
                    type="form"
                    v-model="formData"
                    :actions="false"
                    @submit="handleGenerate"
                  >
                    <FormKit
                      name="format"
                      label="内容格式"
                      type="select"
                      :options="[
                        { label: '🌐 富文本', value: 'html' },
                        { label: '📝 Markdown', value: 'markdown' }
                      ]"
                      :allow-create=true
                      placeholder="选择格式类型"
                    />

                    <FormKit
                      name="style"
                      label="写作风格"
                      type="select"
                      :options="styleOptions"
                      :allow-create=true
                      placeholder="选择写作风格"
                      :help="styleHelpText"
                    />

                    <FormKit
                      name="maxLength"
                      label="生成长度"
                      type="number"
                      value="2000"
                      :min="200"
                      :max="8000"
                      :step="100"
                      suffix="字符"
                    />

                    <FormKitMessages />
                  </FormKit>
                </div>
              </div>
            </div>

            <!-- 错误提示 -->
            <div v-if="errorMessage" class="mt-4">
              <VAlert
                type="error"
                :title="errorMessage"
                closable
                @close="errorMessage = ''"
              />
            </div>

            <!-- 底部操作 -->
            <div class="mt-4 mb-4 flex items-center justify-end gap-2">
              <VButton
                size="sm"
                type="primary"
                :disabled="!formData.topic.trim() || loading"
                :loading="loading"
                @click="handleGenerate"
              >
                <template #icon>
                  <IconSparkles />
                </template>
                生成文章
              </VButton>
            </div>
          </div>

          <!-- 标题生成标签页 -->
          <div v-if="activeTab === 'title'" class="px-4 pb-4">
            <!-- 标题生成设置区域 -->
            <div class="likcc-summaraidgpt-title-settings mb-4">
              <div class="likcc-summaraidgpt-title-config">
                <div class="likcc-summaraidgpt-config-row">
                  <div class="likcc-summaraidgpt-config-item">
                    <label class="likcc-summaraidgpt-label">标题风格</label>
                    <FormKit
                      v-model="titleStyle"
                      type="select"
                      :options="titleStyleOptions"
                      :allow-create="true"
                      placeholder="选择标题风格"
                      class="likcc-summaraidgpt-select"
                    />
                  </div>
                  <div class="likcc-summaraidgpt-config-item">
                    <label class="likcc-summaraidgpt-label">生成数量</label>
                    <FormKit
                      v-model="titleCount"
                      type="number"
                      :min="3"
                      :max="10"
                      :step="1"
                      class="likcc-summaraidgpt-number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 生成按钮 -->
            <div class="likcc-summaraidgpt-generate-section mb-4">
              <VButton
                size="sm"
                type="primary"
                :loading="titleLoading"
                :disabled="!canGenerateTitle"
                @click="generateTitles"
              >
                <template #icon>
                  <IconSparkles />
                </template>
                生成标题
              </VButton>
              <span class="likcc-summaraidgpt-hint">
                将根据编辑器内容生成 {{ titleCount }} 个{{ titleStyle }}风格的标题
              </span>
            </div>

            <!-- 错误提示 -->
            <div v-if="titleErrorMessage" class="mb-4">
              <VAlert
                type="error"
                :title="titleErrorMessage"
                closable
                @close="titleErrorMessage = ''"
              />
            </div>

            <!-- 生成的标题列表 -->
            <div v-if="generatedTitles.length > 0" class="max-h-64 overflow-y-auto">
              <div class="space-y-2">
                <div
                  v-for="(title, index) in generatedTitles"
                  :key="index"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  @click="copyTitle(title)"
                >
                  <span class="text-sm text-gray-900 flex-1">{{ title }}</span>
                  <span class="text-xs text-gray-500 ml-2">点击复制</span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!titleLoading && !titleErrorMessage" class="text-center py-8 mb-4">
              <div class="text-sm text-gray-500">
                点击"生成标题"按钮开始生成，生成的标题可以点击复制
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'tags'" class="px-4 pb-4">
            <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-medium text-gray-900">AI标签生成</div>
                  <div class="mt-1 text-xs text-gray-500">
                    基于当前文章内容生成建议标签，确认后会直接写回文章。
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <VButton
                    v-if="!tagLoading && tags.length > 0"
                    size="sm"
                    type="secondary"
                    @click="handleSelectAll"
                  >
                    {{ isAllSelected ? '取消全选' : '全选' }}
                  </VButton>
                  <VButton
                    size="sm"
                    type="secondary"
                    :loading="tagLoading"
                    @click="handleRefreshTags"
                  >
                    <template #icon>
                      <MdiRefresh class="h-3.5 w-3.5" />
                    </template>
                    {{ tags.length > 0 ? '重新生成' : '生成标签' }}
                  </VButton>
                </div>
              </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white">
              <div v-if="tagLoading" class="flex items-center justify-center py-10">
                <VLoading />
                <span class="ml-2 text-sm text-gray-500">AI 正在生成标签...</span>
              </div>

              <div v-else-if="tagErrorMessage" class="p-6">
                <VEmpty
                  title="标签生成失败"
                  :description="tagErrorMessage"
                >
                  <template #actions>
                    <VButton size="sm" type="primary" @click="handleRefreshTags">
                      重试
                    </VButton>
                  </template>
                </VEmpty>
              </div>

              <div v-else-if="tags.length > 0">
                <div class="border-b border-gray-100 px-4 py-3 text-xs text-gray-500">
                  共 {{ tagStats.total }} 个标签，
                  <span class="text-green-600">已有 {{ tagStats.existing }}</span>
                  ，
                  <span class="text-orange-500">新增 {{ tagStats.new }}</span>
                </div>

                <div class="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto p-4">
                  <button
                    v-for="tag in tags"
                    :key="tag.name"
                    type="button"
                    class="inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-center text-sm font-medium transition-all duration-150"
                    :class="selectedTags.includes(tag.name)
                      ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'"
                    @click="toggleTag(tag.name)"
                  >
                    <span class="truncate">{{ tag.name }}</span>
                    <span
                      v-if="tag.isExisting"
                      class="rounded bg-green-100 px-1 py-0.5 text-[10px] font-medium text-green-700"
                    >
                      已有
                    </span>
                    <span
                      v-else
                      class="rounded bg-orange-100 px-1 py-0.5 text-[10px] font-medium text-orange-700"
                    >
                      新增
                    </span>
                  </button>
                </div>

                <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                  <span class="text-xs text-gray-500">已选择 {{ selectedTags.length }} 个标签</span>
                  <VButton
                    size="sm"
                    type="primary"
                    :disabled="selectedTags.length === 0"
                    :loading="tagLoading"
                    @click="confirmSelection"
                  >
                    应用到文章
                  </VButton>
                </div>
              </div>

              <div v-else class="p-6">
                <VEmpty
                  title="还没有生成标签"
                  description="点击上方“生成标签”，系统会根据文章内容给出建议标签。"
                >
                  <template #actions>
                    <VButton size="sm" type="primary" @click="handleRefreshTags">
                      生成标签
                    </VButton>
                  </template>
                </VEmpty>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { Editor } from '@tiptap/core'
import {
  VButton,
  VDropdown,
  VLoading,
  Toast,
  VEmpty,
  VAlert,
  VTabbar
} from '@halo-dev/components'
import { FormKit, FormKitMessages } from '@formkit/vue'
import axios, { AxiosError } from 'axios'

import IconSparkles from '~icons/lucide/sparkles'
import IconEdit from '~icons/lucide/edit-3'
import IconWand2 from '~icons/lucide/wand-2'
import MdiRefresh from '~icons/mdi/refresh'

interface Props {
  editor: Editor
  isActive?: boolean
  disabled?: boolean
}

interface GenerateResponse {
  success: boolean
  content?: string
  message?: string
}

interface TagItem {
  name: string
  isExisting: boolean
}

interface TagResponse {
  success: boolean
  message?: string
  tags: TagItem[]
  totalCount: number
  existingCount: number
  newCount: number
}

interface HaloTag {
  metadata: {
    name: string
  }
  spec: {
    displayName: string
  }
}

interface HaloTagListResponse {
  items: HaloTag[]
}

type ActiveTab = 'article' | 'title' | 'tags'

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  disabled: false
})

const dropdownVisible = ref(false)
const activeTab = ref<ActiveTab>('article')
const loading = ref(false)
const titleLoading = ref(false)
const tagLoading = ref(false)
const errorMessage = ref('')
const titleErrorMessage = ref('')
const tagErrorMessage = ref('')
const generatedTitles = ref<string[]>([])
const tags = ref<TagItem[]>([])
const selectedTags = ref<string[]>([])
const tagStats = ref({ total: 0, existing: 0, new: 0 })

const titleStyle = ref('有利于SEO的标题')
const titleCount = ref('5')

const formData = ref({
  topic: '',
  format: 'html',
  style: '通俗易懂',
  maxLength: 2000
})

const tabItems = [
  {
    id: 'article',
    label: '文章生成'
  },
  {
    id: 'title',
    label: '标题生成'
  },
  {
    id: 'tags',
    label: 'AI标签'
  }
]

const styleOptions = [
  { label: '通俗易懂', value: '通俗易懂' },
  { label: '正式学术', value: '正式学术' },
  { label: '新闻资讯', value: '新闻资讯' },
  { label: '技术文档', value: '技术文档' },
  { label: '创意文学', value: '创意文学' },
  { label: '幽默风趣', value: '幽默风趣' },
  { label: '严谨专业', value: '严谨专业' },
  { label: '轻松活泼', value: '轻松活泼' },
  { label: '商务正式', value: '商务正式' },
  { label: '科普教育', value: '科普教育' },
  { label: '个人博客', value: '个人博客' },
  { label: '产品介绍', value: '产品介绍' },
  { label: '教程指南', value: '教程指南' },
  { label: '评论分析', value: '评论分析' },
  { label: '故事叙述', value: '故事叙述' },
  { label: '对话访谈', value: '对话访谈' }
]

const titleStyleOptions = [
  { label: '有利于SEO的标题', value: '有利于SEO的标题' },
  { label: '吸引眼球的标题', value: '吸引眼球的标题' },
  { label: '简洁明了', value: '简洁明了' },
  { label: '文艺范', value: '文艺范' },
  { label: '专业术语', value: '专业术语' },
  { label: '疑问式', value: '疑问式' },
  { label: '数字式', value: '数字式' },
  { label: '对比式', value: '对比式' },
  { label: '故事式', value: '故事式' },
  { label: '热点式', value: '热点式' }
]

const styleHelpMap: Record<string, string> = {
  '通俗易懂': '用简单语言解释复杂概念，适合大众阅读',
  '正式学术': '严谨的学术写作风格，适合论文和研究报告',
  '新闻资讯': '客观、简洁的新闻报道风格，注重事实',
  '技术文档': '详细、准确的技术说明，适合开发者',
  '创意文学': '富有想象力的文学表达，语言优美',
  '幽默风趣': '轻松幽默的表达方式，增加趣味性',
  '严谨专业': '专业、权威的写作风格，适合商务场合',
  '轻松活泼': '轻松愉快的表达方式，亲和力强',
  '商务正式': '正式的商务写作风格，专业且礼貌',
  '科普教育': '通俗易懂的科学解释，适合教学',
  '个人博客': '个人化的写作风格，亲切自然',
  '产品介绍': '突出产品特点，吸引用户关注',
  '教程指南': '步骤清晰，易于跟随操作',
  '评论分析': '深入分析，提供独到见解',
  '故事叙述': '生动有趣的故事化表达',
  '对话访谈': '问答形式，互动性强'
}

const tooltipText = computed(() => {
  if (props.disabled) {
    return '请先选择要生成的位置'
  }
  return 'AI智能生成 - 生成文章、标题或标签'
})

const canGenerate = computed(() => {
  return formData.value.topic.trim().length > 0 &&
    formData.value.topic.length <= 1000 &&
    !loading.value
})

const canGenerateTitle = computed(() => {
  const content = props.editor.getText()
  return content.trim().length > 0 && !titleLoading.value
})

const isAllSelected = computed(() => {
  return tags.value.length > 0 && selectedTags.value.length === tags.value.length
})

const styleHelpText = computed(() => {
  const style = formData.value.style
  if (!style) {
    return '选择或输入写作风格，将影响生成文章的语言风格和表达方式'
  }
  return styleHelpMap[style] || '自定义写作风格，将按照您的描述生成文章'
})

watch(activeTab, (tab) => {
  if (tab === 'tags' && dropdownVisible.value && tags.value.length === 0 && !tagLoading.value) {
    void fetchAITags()
  }
})

const handleOpenDropdown = (visible: boolean) => {
  if (!visible) {
    dropdownVisible.value = false
    return
  }

  resetForm()
  activeTab.value = 'article'
  dropdownVisible.value = true
}

const toggleDropdown = () => {
  if (!dropdownVisible.value) {
    resetForm()
    activeTab.value = 'article'
    dropdownVisible.value = true
  } else {
    dropdownVisible.value = false
  }
}

const resetForm = () => {
  formData.value = {
    topic: '',
    format: 'html',
    style: '通俗易懂',
    maxLength: 2000
  }
  errorMessage.value = ''
  titleErrorMessage.value = ''
  generatedTitles.value = []
  tagErrorMessage.value = ''
  tags.value = []
  selectedTags.value = []
  tagStats.value = { total: 0, existing: 0, new: 0 }
}

const handleGenerate = async () => {
  if (!canGenerate.value) return

  try {
    loading.value = true
    errorMessage.value = ''

    const response = await generateContent()

    if (response.success && response.content) {
      props.editor.chain().focus().insertContent(response.content).run()
      Toast.success('文章生成完成并已插入到编辑器')
      dropdownVisible.value = false
    } else {
      errorMessage.value = response.message || '生成失败'
      Toast.error(errorMessage.value)
    }
  } catch (error) {
    console.error('生成失败:', error)
    const errorMsg = error instanceof Error ? error.message : '生成失败，请稍后重试'
    errorMessage.value = errorMsg
    Toast.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const generateContent = async (): Promise<GenerateResponse> => {
  const baseUrl = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'

  return axios.post(`${baseUrl}/generate/article`, {
    topic: formData.value.topic,
    format: formData.value.format,
    style: formData.value.style,
    type: 'full',
    maxLength: formData.value.maxLength
  }).then(res => res.data)
}

const generateTitles = async () => {
  try {
    titleLoading.value = true
    titleErrorMessage.value = ''

    const content = props.editor.getText()
    if (!content.trim()) {
      titleErrorMessage.value = '请先输入文章内容'
      Toast.warning('请先输入文章内容')
      return
    }

    const response = await generateTitleContent(content)

    if (response.success && response.content) {
      const titles = response.content.split('\n')
        .map(title => title.trim())
        .filter(title => title.length > 0)

      generatedTitles.value = titles
      Toast.success(`成功生成 ${titles.length} 个标题`)
    } else {
      titleErrorMessage.value = response.message || '标题生成失败'
      Toast.error(titleErrorMessage.value)
    }
  } catch (error) {
    console.error('标题生成失败:', error)
    const errorMsg = error instanceof Error ? error.message : '标题生成失败，请稍后重试'
    titleErrorMessage.value = errorMsg
    Toast.error(errorMsg)
  } finally {
    titleLoading.value = false
  }
}

const generateTitleContent = async (content: string): Promise<GenerateResponse> => {
  const baseUrl = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'

  return axios.post(`${baseUrl}/generate/title`, {
    content,
    style: titleStyle.value,
    count: parseInt(titleCount.value, 10)
  }).then(res => res.data)
}

const getPostNameFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('name')
}

const checkPostName = () => {
  return getPostNameFromUrl()
}

const fetchAITags = async () => {
  tagLoading.value = true
  tagErrorMessage.value = ''

  try {
    const postName = checkPostName()
    if (!postName) {
      throw new Error('请先保存文章，保存后即可使用AI标签生成功能')
    }

    const { data } = await axios.post<TagResponse>(
      '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/generateTags',
      {
        postName,
        ensure: true
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (data.success && Array.isArray(data.tags)) {
      tags.value = data.tags
      tagStats.value = {
        total: data.totalCount || data.tags.length,
        existing: data.existingCount || 0,
        new: data.newCount || 0
      }

      if (tags.value.length === 0) {
        tagErrorMessage.value = '未能生成相关标签'
      }
    } else {
      throw new Error(data.message || '生成标签失败')
    }
  } catch (error) {
    console.error('获取AI标签失败:', error)
    if (error instanceof AxiosError) {
      tagErrorMessage.value = error.response?.data?.detail || error.response?.data?.message || '请求失败，请重试'
    } else {
      tagErrorMessage.value = error instanceof Error ? error.message : '生成标签失败'
    }
    Toast.error(tagErrorMessage.value)
  } finally {
    tagLoading.value = false
  }
}

const handleRefreshTags = () => {
  selectedTags.value = []
  void fetchAITags()
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const handleSelectAll = () => {
  if (isAllSelected.value) {
    selectedTags.value = []
    return
  }

  selectedTags.value = tags.value.map(tag => tag.name)
}

const confirmSelection = async () => {
  if (selectedTags.value.length === 0) {
    Toast.warning('请选择至少一个标签')
    return
  }

  const postName = checkPostName()
  if (!postName) {
    Toast.warning('请先保存文章，保存后即可使用AI标签生成功能')
    return
  }

  tagLoading.value = true

  try {
    const { data: existingTagsResponse } = await axios.get<HaloTagListResponse>(
      '/apis/content.halo.run/v1alpha1/tags',
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

    const existingTagsMap = new Map<string, string>()
    existingTagsResponse.items?.forEach((tag) => {
      if (selectedTags.value.includes(tag.spec.displayName)) {
        existingTagsMap.set(tag.spec.displayName, tag.metadata.name)
      }
    })

    const createPromises = selectedTags.value
      .filter(tagName => !existingTagsMap.has(tagName))
      .map(async (tagDisplayName) => {
        try {
          const slug = `tag-${Math.random().toString(36).slice(2, 10)}`
          const { data: tag } = await axios.post<HaloTag>(
            '/apis/content.halo.run/v1alpha1/tags',
            {
              apiVersion: 'content.halo.run/v1alpha1',
              kind: 'Tag',
              metadata: {
                generateName: 'tag-',
                annotations: {}
              },
              spec: {
                displayName: tagDisplayName,
                slug,
                color: '#ffffff',
                cover: ''
              }
            },
            {
              headers: { 'Content-Type': 'application/json' }
            }
          )

          return tag.metadata.name
        } catch (error) {
          console.error(`创建标签 "${tagDisplayName}" 失败:`, error)
          return null
        }
      })

    const newTagNames = (await Promise.all(createPromises)).filter((name): name is string => Boolean(name))
    const allTagNames = [
      ...Array.from(existingTagsMap.values()),
      ...newTagNames
    ]

    if (allTagNames.length === 0) {
      throw new Error('没有成功创建或找到任何标签')
    }

    const { data: post } = await axios.get(
      `/apis/content.halo.run/v1alpha1/posts/${postName}`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

    const existingTags = post.spec?.tags || []
    const updatedPost = {
      ...post,
      spec: {
        ...post.spec,
        tags: [...new Set([...existingTags, ...allTagNames])]
      }
    }

    await axios.put(
      `/apis/content.halo.run/v1alpha1/posts/${postName}`,
      updatedPost,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

    Toast.success(`成功应用 ${selectedTags.value.length} 个标签到文章`)
    dropdownVisible.value = false
    selectedTags.value = []
  } catch (error) {
    console.error('应用标签失败:', error)
    if (error instanceof AxiosError) {
      Toast.error(error.response?.data?.message || error.response?.data?.detail || '应用标签失败，请重试')
    } else {
      Toast.error(error instanceof Error ? error.message : '应用标签失败')
    }
  } finally {
    tagLoading.value = false
  }
}

const copyTitle = async (title: string) => {
  // 清理标题中的列表标记
  const cleanTitle = cleanTitleFromListMarkers(title)

  try {
    // 使用现代浏览器的Clipboard API复制清理后的标题
    await navigator.clipboard.writeText(cleanTitle)
    Toast.success('标题已复制到剪贴板，您可以粘贴到标题字段中')
    dropdownVisible.value = false
  } catch (error) {
    // 如果Clipboard API不可用，使用传统方法
    console.warn('Clipboard API不可用，使用传统复制方法:', error)

    // 创建临时文本区域元素
    const textArea = document.createElement('textarea')
    textArea.value = cleanTitle
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        Toast.success('标题已复制到剪贴板，您可以粘贴到标题字段中')
      } else {
        Toast.error('复制失败，请手动复制')
      }
    } catch (err) {
      console.error('复制失败:', err)
      Toast.error('复制失败，请手动复制')
    } finally {
      document.body.removeChild(textArea)
    }

    dropdownVisible.value = false
  }
}

// 清理标题中的列表标记
const cleanTitleFromListMarkers = (title: string): string => {
  if (!title || typeof title !== 'string') {
    return title
  }

  console.log('原始标题:', title)

  // 定义各种列表标记的正则表达式
  const listMarkers = [
    // 有序列表：1. 2. 10. 等
    /^\d+\.\s*/,
    // 字母有序列表：a. b. c. 等
    /^[a-zA-Z]\.\s*/,
    // 罗马数字：i. ii. iii. 等（简单匹配）
    /^[ivxlcdm]+\.\s*/i,
    // 无序列表标记
    /^[-•*+]\s*/,
    // 其他常见标记
    /^[#*]\s*/,
    // 括号数字：(1) (2) 等
    /^\(\d+\)\s*/,
    // 括号字母：(a) (b) 等
    /^\([a-zA-Z]\)\s*/,
  ]

  let cleanedTitle = title.trim()

  // 逐个尝试匹配并移除列表标记
  for (const marker of listMarkers) {
    if (marker.test(cleanedTitle)) {
      cleanedTitle = cleanedTitle.replace(marker, '').trim()
      console.log('检测到列表标记，清理后:', cleanedTitle)
      break // 只处理第一个匹配的标记
    }
  }

  console.log('最终清理后的标题:', cleanedTitle)
  return cleanedTitle
}

</script>

<style scoped>
.generate-toolbar-item {
  display: inline-block;
}

.generate-toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.generate-toolbar-btn:hover:not(:disabled) {
  color: #374151;
  background: transparent;
}

.generate-toolbar-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.generate-toolbar-btn:disabled:hover {
  background: transparent;
}

/* 生成下拉框样式 */
.generate-dropdown {
  width: 900px;
  max-height: 650px;
  overflow: hidden;
}

.generate-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 400px;
  padding: 12px;
}

.topic-section,
.format-section {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.section-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}





/* 标题生成配置样式 */
.likcc-summaraidgpt-title-settings {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
}

.likcc-summaraidgpt-title-config {
  width: 100%;
}

.likcc-summaraidgpt-config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.likcc-summaraidgpt-config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.likcc-summaraidgpt-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.likcc-summaraidgpt-select,
.likcc-summaraidgpt-number {
  width: 100%;
}

.likcc-summaraidgpt-generate-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.likcc-summaraidgpt-hint {
  font-size: 12px;
  color: #6b7280;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .generate-dropdown {
    width: 90vw;
  }

  .generate-content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .likcc-summaraidgpt-config-row {
    grid-template-columns: 1fr;
  }

  .likcc-summaraidgpt-generate-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
