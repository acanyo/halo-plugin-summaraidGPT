<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { utils } from '@halo-dev/ui-shared'
import { VLoading } from '@halo-dev/components'
import WorkbenchIcon from '@/workbench/components/WorkbenchIcon.vue'
import WorkbenchSectionHeader from '@/workbench/components/WorkbenchSectionHeader.vue'
import InsightGraphPreview from '@/components/article-reading/InsightGraphPreview.vue'
import { useArticlePostList } from '@/components/article-reading/useArticlePostList'
import { useArticleReading } from '@/components/article-reading/useArticleReading'
import { hasUiPermission } from '@/utils/permissions'
import { workbenchLocation } from '@/workbench/navigation'
import type { SelectablePost } from '@/api/article-reading'
import '@/components/article-reading/manager.css'

const route = useRoute()
const router = useRouter()
const articles = useArticlePostList()
const { posts, keyword, page, total, pages, loading: postsLoading, error: postsError } = articles
const postName = computed(() => (typeof route.query.post === 'string' ? route.query.post : ''))
const { reading, loading, generating, generatingFor, error, load, generate } =
  useArticleReading(postName)
const selectedPost = computed(() => posts.value.find((post) => post.name === postName.value))
const title = computed(
  () => selectedPost.value?.title || reading.value?.spec?.postTitle || '文章洞察',
)
const canGenerate = computed(() => hasUiPermission('plugin:summaraidGPT:article-reading:manage'))
const formatDate = (value?: string) => (value ? utils.date.format(value, 'YYYY-MM-DD') : '未发布')
function selectPost(post: SelectablePost) {
  void router.replace(workbenchLocation('reading', { ...route.query, post: post.name }))
}
</script>

<template>
  <WorkbenchSectionHeader title="洞察图谱" description="沿着文章的脉络，读懂每一个观点。">
    <template #actions
      ><RouterLink
        v-if="hasUiPermission('system:plugins:view')"
        :to="workbenchLocation('settings', { group: 'articleReading' })"
        class="sw-button"
        ><WorkbenchIcon name="settings" :size="15" />图谱设置</RouterLink
      ></template
    >
  </WorkbenchSectionHeader>
  <div class="sw-reading-layout">
    <aside class="sw-reading-library" aria-label="选择文章">
      <header class="sw-reading-library-head">
        <h2>文章</h2>
        <span>{{ total }} 篇</span
        ><button
          type="button"
          class="sw-text-button"
          aria-label="刷新文章列表"
          :disabled="postsLoading"
          @click="articles.load"
        >
          <WorkbenchIcon name="refresh" :size="15" :class="{ 'is-spinning': postsLoading }" />
        </button>
      </header>
      <form class="sw-reading-search" role="search" @submit.prevent="articles.search">
        <WorkbenchIcon name="search" :size="15" /><input
          v-model="keyword"
          type="search"
          aria-label="搜索文章"
          placeholder="搜索文章…"
        /><button type="submit" aria-label="搜索" :disabled="postsLoading">
          <WorkbenchIcon name="arrow" :size="14" />
        </button>
      </form>
      <VLoading v-if="postsLoading" />
      <div v-else-if="postsError" class="sw-reading-list-state" role="alert">
        <p>{{ postsError }}</p>
        <button type="button" class="sw-text-button" @click="articles.load">重新加载</button>
      </div>
      <div v-else-if="!posts.length" class="sw-reading-list-state">
        <p>{{ keyword ? '没有找到相关文章' : '还没有可用的文章' }}</p>
        <button v-if="keyword" type="button" class="sw-text-button" @click="articles.clearSearch">
          清除搜索
        </button>
      </div>
      <nav v-else class="sw-reading-posts" aria-label="文章列表">
        <button
          v-for="post in posts"
          :key="post.name"
          type="button"
          class="sw-reading-post"
          :class="{ 'is-selected': postName === post.name }"
          :aria-pressed="postName === post.name"
          :aria-label="post.title"
          @click="selectPost(post)"
        >
          <span class="sw-reading-post-icon"><WorkbenchIcon name="book" :size="16" /></span
          ><span class="sw-reading-post-copy"
            ><strong>{{ post.title }}</strong
            ><small
              ><span class="sw-status-dot" :class="{ 'is-ready': post.published }" />{{
                post.published ? '已发布' : '未发布'
              }}<span aria-hidden="true">·</span
              >{{ formatDate(post.publishTime || post.updatedAt) }}</small
            ></span
          ><WorkbenchIcon v-if="postName === post.name" name="chevron" :size="13" />
        </button>
      </nav>
      <footer v-if="total > 10" class="sw-reading-pagination">
        <button
          type="button"
          class="sw-text-button"
          aria-label="上一页文章"
          :disabled="page <= 1 || postsLoading"
          @click="page--"
        >
          <WorkbenchIcon name="chevron" :size="13" class="sw-reading-back" /></button
        ><span>{{ page }} / {{ pages }}</span
        ><button
          type="button"
          class="sw-text-button"
          aria-label="下一页文章"
          :disabled="page >= pages || postsLoading"
          @click="page++"
        >
          <WorkbenchIcon name="chevron" :size="13" />
        </button>
      </footer>
      <p class="sw-reading-library-note">选择文章后，可直接阅读已生成的图谱。</p>
    </aside>
    <section class="sw-reading-preview" aria-label="文章图谱预览">
      <template v-if="postName">
        <header class="sw-reading-preview-head">
          <div>
            <span class="sw-eyebrow">文章洞察</span>
            <h2>{{ title }}</h2>
            <p v-if="reading?.spec?.generatedAt">
              更新于 {{ utils.date.format(reading.spec.generatedAt) }}
            </p>
          </div>
          <div class="sw-reading-preview-actions">
            <button
              type="button"
              class="sw-button"
              aria-label="刷新当前图谱"
              :disabled="loading || generating"
              @click="load"
            >
              <WorkbenchIcon
                name="refresh"
                :size="15"
                :class="{ 'is-spinning': loading }"
              /></button
            ><button
              v-if="canGenerate"
              type="button"
              class="sw-button"
              :class="{ 'is-primary': !reading }"
              :disabled="Boolean(generatingFor) || loading"
              @click="generate"
            >
              <WorkbenchIcon name="sparkles" :size="15" :class="{ 'is-spinning': generating }" />{{
                generating ? '正在生成…' : reading ? '重新生成' : '生成图谱'
              }}
            </button>
          </div>
        </header>
        <div v-if="error && reading" class="sw-notice" role="alert">
          <WorkbenchIcon name="info" :size="16" />{{ error }}
        </div>
        <div v-if="loading || generating" class="sw-reading-state" role="status">
          <WorkbenchIcon
            :name="generating ? 'sparkles' : 'refresh'"
            :size="26"
            class="is-spinning"
          />
          <h3>{{ generating ? '正在梳理文章脉络' : '正在读取图谱' }}</h3>
          <p>
            {{
              generating ? '完成后会在这里显示，你可以先浏览其他文章。' : '正在载入已生成的内容…'
            }}
          </p>
        </div>
        <InsightGraphPreview v-else-if="reading?.spec" :key="postName" :spec="reading.spec" />
        <div v-else class="sw-reading-state">
          <span class="sw-reading-state-icon"><WorkbenchIcon name="graph" :size="27" /></span>
          <h3>这篇文章还没有可用的图谱</h3>
          <p>{{ error || '生成图谱，把文章中的主题、观点与依据连接起来。' }}</p>
          <button
            v-if="canGenerate"
            type="button"
            class="sw-button is-primary"
            :disabled="Boolean(generatingFor)"
            @click="generate"
          >
            <WorkbenchIcon name="sparkles" :size="15" />生成图谱
          </button>
          <p v-else>请联系管理员生成图谱。</p>
        </div>
      </template>
      <div v-else class="sw-reading-state is-intro">
        <span class="sw-reading-state-icon"><WorkbenchIcon name="graph" :size="32" /></span
        ><span class="sw-eyebrow">从一篇文章开始</span>
        <h2>让阅读，多一条清晰的路径。</h2>
        <p>选择一篇文章，查看它的核心主题与延伸内容。<br />点击节点，展开观点和原文依据。</p>
        <div class="sw-reading-legend">
          <span><i class="is-root" />文章</span><span class="sw-reading-legend-line" /><span
            ><i />主题</span
          ><span class="sw-reading-legend-line" /><span><i class="is-leaf" />延伸阅读</span>
        </div>
      </div>
    </section>
  </div>
</template>
