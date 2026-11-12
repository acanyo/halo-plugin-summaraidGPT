<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { utils } from '@halo-dev/ui-shared'
import { VLoading } from '@halo-dev/components'
import WorkbenchIcon from '@/workbench/components/WorkbenchIcon.vue'
import WorkbenchSectionHeader from '@/workbench/components/WorkbenchSectionHeader.vue'
import { useArticlePostList } from '@/components/article-reading/useArticlePostList'
import { useArticleGlossary } from '@/components/article-glossary/useArticleGlossary'
import { hasUiPermission } from '@/utils/permissions'
import { workbenchLocation } from '@/workbench/navigation'
import '@/components/article-reading/manager.css'

const route = useRoute()
const router = useRouter()
const articles = useArticlePostList()
const { posts, keyword, page, pages, total, loading: postsLoading, error: postsError } = articles
const postName = computed(() => (typeof route.query.post === 'string' ? route.query.post : ''))
const selectedPost = computed(() => posts.value.find((post) => post.name === postName.value))
const { glossary, loading, generatingFor, generating, error, load, generate } =
  useArticleGlossary(postName)
const canGenerate = computed(() => hasUiPermission('plugin:summaraidGPT:glossary:manage'))
</script>

<template>
  <WorkbenchSectionHeader title="热词注释" description="把难懂的词，放回文章里解释。">
    <template #actions>
      <RouterLink
        v-if="hasUiPermission('system:plugins:view')"
        :to="workbenchLocation('settings', { group: 'glossary' })"
        class="sw-button"
      >
        <WorkbenchIcon name="settings" :size="15" />注释设置
      </RouterLink>
    </template>
  </WorkbenchSectionHeader>
  <div class="sw-reading-layout">
    <aside class="sw-reading-library" aria-label="选择文章">
      <header class="sw-reading-library-head">
        <h2>文章</h2>
        <span>{{ total }} 篇</span>
      </header>
      <form class="sw-reading-search" role="search" @submit.prevent="articles.search">
        <WorkbenchIcon name="search" :size="15" /><input
          v-model="keyword"
          type="search"
          aria-label="搜索文章"
          placeholder="搜索文章…"
        />
        <button type="submit" aria-label="搜索"><WorkbenchIcon name="arrow" :size="14" /></button>
      </form>
      <VLoading v-if="postsLoading" />
      <div v-else-if="postsError" class="sw-reading-list-state" role="alert">
        <p>{{ postsError }}</p>
        <button class="sw-text-button" @click="articles.load">重新加载</button>
      </div>
      <p v-else-if="!posts.length" class="sw-reading-list-state">没有找到文章，请换个关键词。</p>
      <nav v-else class="sw-reading-posts" aria-label="文章列表">
        <button
          v-for="post in posts"
          :key="post.name"
          type="button"
          class="sw-reading-post"
          :class="{ 'is-selected': postName === post.name }"
          :aria-pressed="postName === post.name"
          @click="router.replace(workbenchLocation('glossary', { post: post.name }))"
        >
          <span class="sw-reading-post-icon"><WorkbenchIcon name="book" :size="16" /></span>
          <span class="sw-reading-post-copy"
            ><strong>{{ post.title }}</strong
            ><small>{{ post.published ? '已发布' : '未发布 · 发布后可生成' }}</small></span
          >
        </button>
      </nav>
      <footer v-if="pages > 1" class="sw-reading-pagination">
        <button class="sw-text-button" :disabled="page <= 1 || postsLoading" @click="page--">
          上一页
        </button>
        <span>{{ page }} / {{ pages }}</span>
        <button class="sw-text-button" :disabled="page >= pages || postsLoading" @click="page++">
          下一页
        </button>
      </footer>
      <p class="sw-reading-library-note">只分析已公开发布的正文，不改写文章。</p>
    </aside>
    <section class="sw-reading-preview" aria-label="词语解释预览">
      <header v-if="postName" class="sw-reading-preview-head">
        <div>
          <span class="sw-eyebrow">结合上下文解释</span>
          <h2>{{ selectedPost?.title || glossary?.spec.postTitle || '文章热词' }}</h2>
          <p v-if="glossary">更新于 {{ utils.date.format(glossary.spec.generatedAt) }}</p>
        </div>
        <div class="sw-reading-preview-actions">
          <button class="sw-button" :disabled="loading || Boolean(generatingFor)" @click="load">
            刷新
          </button>
          <button
            v-if="canGenerate"
            class="sw-button is-primary"
            :disabled="loading || Boolean(generatingFor) || selectedPost?.published === false"
            @click="generate"
          >
            <WorkbenchIcon name="sparkles" :size="15" />{{
              generatingFor === postName ? '正在识别…' : glossary ? '重新生成' : '识别热词'
            }}
          </button>
        </div>
      </header>
      <p v-if="error" class="sw-notice" role="alert">{{ error }}</p>
      <div v-if="loading || generating" class="sw-reading-state" role="status">
        <VLoading />
        <h3>{{ loading ? '正在读取注释' : '正在寻找值得解释的词语' }}</h3>
        <p>AI 会结合原文解释，不会强行凑数。</p>
      </div>
      <template v-else-if="glossary">
        <p class="sw-glossary-note">
          {{ glossary.spec.terms.length }} 个词语 · 启用注释后，读者可在正文中悬停或点击查看。
        </p>
        <dl v-if="glossary.spec.terms.length" class="sw-glossary-terms">
          <div v-for="term in glossary.spec.terms" :key="term.term">
            <dt>{{ term.term }}</dt>
            <dd>{{ term.explanation }}</dd>
          </div>
        </dl>
        <div v-else class="sw-reading-state">
          <h3>这篇文章不需要额外注释</h3>
          <p>AI 没有找到需要解释的生僻词或专业术语。</p>
        </div>
      </template>
      <div v-else class="sw-reading-state is-intro">
        <span class="sw-reading-state-icon"><WorkbenchIcon name="book" :size="28" /></span>
        <h2>{{ postName ? '为阅读补上一点解释' : '从一篇文章开始' }}</h2>
        <p>
          {{
            postName
              ? '点击“识别热词”，为这篇文章生成上下文解释。'
              : '选择文章，看看哪些专业名词和缩写值得解释。'
          }}
        </p>
        <p>可先预览结果，再到注释设置中开启文章页展示。</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sw-glossary-note {
  padding: 20px 24px 0;
  color: var(--sw-muted);
  font-size: 13px;
}
.sw-glossary-terms {
  margin: 0;
  padding: 8px 24px 28px;
}
.sw-glossary-terms > div {
  padding: 20px 0;
  border-bottom: 1px solid var(--sw-border, #e4e8eb);
}
.sw-glossary-terms dt {
  display: inline;
  font-size: 17px;
  font-weight: 650;
  text-decoration: underline dotted #5b8a91;
  text-underline-offset: 6px;
}
.sw-glossary-terms dd {
  margin: 12px 0 0;
  max-width: 66ch;
  line-height: 1.85;
  color: var(--sw-muted);
}
</style>
