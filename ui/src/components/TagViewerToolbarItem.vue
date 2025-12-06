<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/core'
import type { Component } from 'vue'
import {
  VButton,
  VDropdown,
  VLoading,
  Toast,
  VEmpty,
  VAlert
} from '@halo-dev/components'
import axios, { AxiosError } from 'axios'
import IconTag from '~icons/lucide/tag'
import MdiRefresh from '~icons/mdi/refresh'

interface Props {
  editor: Editor
  isActive?: boolean
  disabled?: boolean
  icon?: Component
  title?: string
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
  apiVersion: string
  kind: string
  metadata: {
    name: string
    generateName?: string
    finalizers?: string[]
    annotations?: {
      [key: string]: string
    }
    version?: number
    creationTimestamp?: string
    [key: string]: unknown
  }
  spec: {
    displayName: string
    slug: string
    color: string
    cover?: string
  }
  status?: {
    postCount: number
    visiblePostCount: number
    permalink: string
    observedVersion?: number
  }
}

interface HaloTagListResponse {
  items: HaloTag[]
  [key: string]: unknown
}

const { isActive = false, disabled = false, title = 'AI智能标签', icon } = defineProps<Props>()

const dropdownVisible = ref(false)
const loading = ref(false)
const tags = ref<TagItem[]>([])
const selectedTags = ref<string[]>([])
const errorMessage = ref('')
const tagStats = ref({ total: 0, existing: 0, new: 0 })

// 计算属性：是否全选
const isAllSelected = computed(() => {
  return tags.value.length > 0 && selectedTags.value.length === tags.value.length
})

// 获取标签名称列表
const tagNames = computed(() => tags.value.map(t => t.name))

// 从URL中获取postName
const getPostNameFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('name')
}

// 获取AI生成的标签
const fetchAITags = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const postName = checkPostName()
    if (!postName) {
      throw new Error('请先保存文章，保存后即可使用AI标签生成功能')
    }

    const { data } = await axios.post<TagResponse>(
      `/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/generateTags`,
      {
        postName: postName,
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
        errorMessage.value = '未能生成相关标签'
      }
    } else {
      throw new Error(data.message || '生成标签失败')
    }
  } catch (error) {
    console.error('获取AI标签失败:', error)
    if (error instanceof AxiosError) {
      errorMessage.value = error.response?.data?.detail || error.response?.data?.message || '请求失败，请重试'
    } else {
      errorMessage.value = error instanceof Error ? error.message : '生成标签失败'
    }
    Toast.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

// 打开下拉框并获取标签
const handleOpenDropdown = (visible: boolean) => {
  if (!visible) {
    dropdownVisible.value = false
    return
  }

  const postName = checkPostName()
  if (!postName) {
    Toast.warning('请先保存文章，保存后即可使用AI标签生成功能')
    dropdownVisible.value = false
    return
  }

  if (tags.value.length === 0) {
    fetchAITags()
  }
}

// 手动切换下拉框
const toggleDropdown = () => {
  if (!dropdownVisible.value) {
    const postName = checkPostName()
    if (!postName) {
      Toast.warning('请先保存文章，保存后即可使用AI标签生成功能')
      return
    }
    dropdownVisible.value = true
    if (tags.value.length === 0) {
      fetchAITags()
    }
  } else {
    dropdownVisible.value = false
  }
}

// 刷新标签
const handleRefresh = () => {
  selectedTags.value = []
  fetchAITags()
}

// 切换标签选择状态
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 全选/取消全选
const handleSelectAll = () => {
  if (isAllSelected.value) {
    // 如果已全选，则取消全选
    selectedTags.value = []
  } else {
    // 如果未全选，则全选
    selectedTags.value = tags.value.map(t => t.name)
  }
}

// 确认选择标签
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

  loading.value = true

  try {
    // 1. 获取所有标签并在前端过滤
    const { data: existingTagsResponse } = await axios.get<HaloTagListResponse>(
      `/apis/content.halo.run/v1alpha1/tags`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

    const existingTagsMap = new Map<string, string>()
    if (existingTagsResponse.items) {
      // 在前端过滤出我们需要的标签
      existingTagsResponse.items.forEach((tag: HaloTag) => {
        if (selectedTags.value.includes(tag.spec.displayName)) {
          existingTagsMap.set(tag.spec.displayName, tag.metadata.name)
        }
      })
    }

    // 2. 创建不存在的标签
    const createPromises = selectedTags.value
      .filter(tagName => !existingTagsMap.has(tagName))
      .map(async (tagDisplayName) => {
        try {
          // 使用随机数生成slug，避免中文乱码问题
          const randomId = Math.random().toString(36).substr(2, 8)
          const slug = `tag-${randomId}`

          const tagData = {
            apiVersion: "content.halo.run/v1alpha1",
            kind: "Tag",
            metadata: {
              generateName: "tag-",
              annotations: {}
            },
            spec: {
              displayName: tagDisplayName,
              slug: slug,
              color: "#ffffff",
              cover: ""
            }
          }

          const { data: tag } = await axios.post<HaloTag>(
            `/apis/content.halo.run/v1alpha1/tags`,
            tagData,
            {
              headers: { 'Content-Type': 'application/json' }
            }
          )

          return tag.metadata.name
        } catch (error) {
          console.error(`创建标签 "${tagDisplayName}" 失败:`, error)
          if (error instanceof AxiosError) {
            console.error('响应数据:', error.response?.data)
            console.error('请求配置:', error.config)
          }
          return null
        }
      })

    const newTagNames = (await Promise.all(createPromises)).filter(name => name !== null)

    // 3. 收集所有标签的metadata.name
    const allTagNames = [
      ...Array.from(existingTagsMap.values()), // 现有标签
      ...newTagNames // 新创建的标签
    ]

    if (allTagNames.length === 0) {
      throw new Error('没有成功创建或找到任何标签')
    }

    // 4. 获取并更新文章
    const { data: post } = await axios.get(
      `/apis/content.halo.run/v1alpha1/posts/${postName}`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

    // 5. 更新文章的标签
    const existingTags = post.spec?.tags || []
    const updatedTags = [...new Set([...existingTags, ...allTagNames])] // 去重合并

    const updatedPost = {
      ...post,
      spec: {
        ...post.spec,
        tags: updatedTags
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
    // 手动关闭下拉框
    dropdownVisible.value = false
    // 清空选择
    selectedTags.value = []
  } catch (error) {
    console.error('应用标签失败:', error)
    if (error instanceof AxiosError) {
      Toast.error(error.response?.data?.message || error.response?.data?.detail || '应用标签失败，请重试')
    } else {
      Toast.error(error instanceof Error ? error.message : '应用标签失败')
    }
  } finally {
    loading.value = false
  }
}

// 检查是否有文章名称
const checkPostName = () => {
  return getPostNameFromUrl()
}
</script>

<template>
  <div class="likcc-summaraidGPT-tag-viewer">
    <VDropdown
      v-model:visible="dropdownVisible"
      :disabled="disabled"
      :triggers="['click']"
      :auto-close="false"
      :close-on-content-click="false"
      @update:visible="handleOpenDropdown"
    >
      <button
        v-tooltip="title"
        :class="{
          'bg-gray-200 text-black': isActive,
          'text-gray-600 hover:text-gray-900 hover:bg-gray-100': !isActive
        }"
        class="likcc-summaraidGPT-tag-viewer-btn"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <component :is="icon || IconTag" class="h-4 w-4" />
      </button>

             <template #popper>
         <div class="likcc-summaraidGPT-tag-dropdown" @click.stop>
          <!-- 使用说明 -->
          <div class="p-3">
            <VAlert
              type="info"
              title="AI智能标签生成"
              description="基于文章内容智能生成相关标签，您可以选择需要的标签应用到文章,建议使用前先保存最新的文章！"
              :closable="false"
              class="text-xs"
            />
          </div>

          <!-- 头部操作 -->
          <div class="px-3 pb-3 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">选择标签</span>
              <div class="flex items-center space-x-2">
                <VButton
                  v-if="!loading && tags.length > 0"
                  size="xs"
                  type="secondary"
                  @click="handleSelectAll"
                >
                  {{ isAllSelected ? '取消全选' : '全选' }}
                </VButton>
                <VButton
                  v-if="!loading && tags.length > 0"
                  size="xs"
                  type="secondary"
                  @click="handleRefresh"
                >
                  <template #icon>
                    <MdiRefresh class="h-3 w-3" />
                  </template>
                  重新生成
                </VButton>
              </div>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="max-h-64 overflow-y-auto">
            <!-- 加载状态 -->
            <div v-if="loading" class="flex items-center justify-center py-6">
              <VLoading />
              <span class="text-sm text-gray-500 ml-2">生成中...</span>
            </div>

            <!-- 错误状态 -->
            <div v-else-if="errorMessage" class="p-4 text-center">
              <VEmpty
                title="生成失败"
                :description="errorMessage"
                class="text-xs"
              >
                <template #actions>
                  <VButton size="xs" type="primary" @click="handleRefresh">
                    重试
                  </VButton>
                </template>
              </VEmpty>
            </div>

            <!-- 标签列表 -->
            <div v-else-if="tags.length > 0" class="py-2">
              <!-- 统计信息 -->
              <div class="px-3 py-1.5 mb-2 text-xs text-gray-500 border-b border-gray-100">
                共 {{ tagStats.total }} 个标签：
                <span class="text-green-600">已有 {{ tagStats.existing }} 个</span>，
                <span class="text-orange-500">新增 {{ tagStats.new }} 个</span>
              </div>
              <!-- 标签云布局 -->
              <div class="px-3 py-2 grid grid-cols-3 gap-2">
                <div
                  v-for="tag in tags"
                  :key="tag.name"
                  class="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border cursor-pointer transition-all duration-150 select-none text-center"
                  :class="selectedTags.includes(tag.name) 
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'"
                  @click="toggleTag(tag.name)"
                >
                  <span class="text-sm font-medium truncate">{{ tag.name }}</span>
                  <span
                    v-if="tag.isExisting"
                    class="shrink-0 inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700"
                  >
                    已有
                  </span>
                  <span
                    v-else
                    class="shrink-0 inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700"
                  >
                    新增
                  </span>
                  <span
                    v-if="selectedTags.includes(tag.name)"
                    class="shrink-0 text-blue-500 text-xs"
                  >
                    ✓
                  </span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="p-4 text-center">
              <VEmpty
                title="暂无标签"
                description="未能生成标签"
                class="text-xs"
              >
                <template #actions>
                  <VButton size="xs" type="primary" @click="handleRefresh">
                    生成标签
                  </VButton>
                </template>
              </VEmpty>
            </div>
          </div>

          <!-- 底部操作 -->
          <div v-if="tags.length > 0 && !loading" class="p-3 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">
                已选择 {{ selectedTags.length }} 个标签
              </span>
                             <VButton
                 size="xs"
                 type="primary"
                 :disabled="selectedTags.length === 0"
                 @click="confirmSelection"
               >
                确认选择
              </VButton>
            </div>
          </div>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<style scoped>
.likcc-summaraidGPT-tag-viewer-btn {
  @apply inline-flex items-center justify-center rounded transition-colors duration-200;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 32px;
  height: 32px;
  padding: 6px;
}

.likcc-summaraidGPT-tag-viewer-btn:disabled {
  @apply text-gray-400 cursor-not-allowed;
}

.likcc-summaraidGPT-tag-viewer-btn:disabled:hover {
  @apply bg-transparent;
}

.likcc-summaraidGPT-tag-content {
  @apply min-h-[200px];
}

.likcc-summaraidGPT-tag-item {
  @apply transition-colors duration-200;
}

.likcc-summaraidGPT-tag-item:hover {
  @apply bg-blue-50 border-blue-200;
}
</style>

