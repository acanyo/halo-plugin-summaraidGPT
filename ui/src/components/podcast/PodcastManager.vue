<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { Dialog, VLoading } from '@halo-dev/components'
import { podcastApi, type PodcastCapabilities } from '@/api/podcast'
import { useArticlePostList } from '@/components/article-reading/useArticlePostList'
import { hasUiPermission } from '@/utils/permissions'
import { workbenchLocation } from '@/workbench/navigation'
import { workbenchErrorMessage } from '@/workbench/errors'
import WorkbenchIcon from '@/workbench/components/WorkbenchIcon.vue'
import WorkbenchSectionHeader from '@/workbench/components/WorkbenchSectionHeader.vue'
import PodcastPlayer from './PodcastPlayer.vue'
import PodcastScriptOptions from './PodcastScriptOptions.vue'
import PodcastTurnExpression from './PodcastTurnExpression.vue'
import { usePodcast } from './usePodcast'
import '@/components/article-reading/manager.css'
import './podcast.css'

const route = useRoute()
const router = useRouter()
const post = computed(() => (typeof route.query.post === 'string' ? route.query.post : ''))
const articles = useArticlePostList()
const { posts, keyword, page, pages, total, loading: postsLoading, error: postsError } = articles
const state = usePodcast(post)
const { view, episode, draft, dirty, busy, loading, submitting, error } = state
const capabilities = ref<PodcastCapabilities>()
const capabilityError = ref('')
const duration = ref(2)
const style = ref('casual')
const canManage = computed(() => hasUiPermission('plugin:summaraidGPT:podcast:manage'))
const locked = computed(() => !canManage.value || busy.value || submitting.value)
const title = computed(
  () =>
    posts.value.find((p) => p.name === post.value)?.title ||
    episode.value?.spec.postTitle ||
    '选择一篇文章',
)
const providerLabels: Record<string, string> = {
  bailian: '阿里百炼',
  'bailian-cosyvoice': '百炼 CosyVoice',
  'bailian-minimax': '百炼 MiniMax',
  minimax: 'MiniMax 直连',
  doubao: '豆包双人播客',
}
onMounted(async () => {
  try {
    capabilities.value = await podcastApi.capabilities()
    duration.value = capabilities.value.durationMinutes
    style.value = capabilities.value.style || 'casual'
  } catch (cause) {
    capabilityError.value = workbenchErrorMessage(cause, '语音服务状态加载失败')
  }
})
function confirmDiscard() {
  if (!dirty.value) return true
  return new Promise<boolean>((resolve) =>
    Dialog.warning({
      title: '讨论稿有未保存的修改',
      description: '离开后修改会丢失。',
      confirmText: '放弃修改',
      cancelText: '继续编辑',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    }),
  )
}
onBeforeRouteLeave(confirmDiscard)
onBeforeRouteUpdate((to) => (to.query.post === route.query.post ? true : confirmDiscard()))
function regenerate() {
  if (!draft.value.length) return state.generate(Number(duration.value), style.value)
  Dialog.warning({
    title: '重新生成讨论稿',
    description: '将替换当前讨论稿。已生成的音频会保留，直到新音频合成成功。',
    confirmText: '生成讨论稿',
    onConfirm: () => state.generate(Number(duration.value), style.value),
  })
}
function remove() {
  Dialog.warning({
    title: '移除这篇播客',
    description: '文章页将不再展示该播客，已上传的音频仍保留在附件库。',
    confirmText: '移除',
    onConfirm: state.remove,
  })
}
</script>

<template>
  <WorkbenchSectionHeader title="播客听读" description="让两位主持人，把文章里的重点聊给你听。"
    ><template #actions
      ><RouterLink
        v-if="hasUiPermission('system:plugins:view')"
        :to="workbenchLocation('settings', { group: 'podcast' })"
        class="sw-button"
        ><WorkbenchIcon name="settings" :size="15" />播客设置</RouterLink
      ></template
    ></WorkbenchSectionHeader
  >
  <div
    v-if="capabilityError || (capabilities && !capabilities.ready)"
    class="sw-notice"
    role="status"
  >
    <WorkbenchIcon name="info" :size="17" /><span
      >{{ capabilityError || capabilities?.message }}。讨论稿使用 AI
      基座，合成音频前请完成语音服务配置。</span
    >
  </div>
  <div class="sw-reading-layout">
    <aside class="sw-reading-library" aria-label="选择播客文章">
      <header class="sw-reading-library-head">
        <h2>文章</h2>
        <span>{{ total }} 篇</span
        ><button
          class="sw-text-button"
          type="button"
          aria-label="刷新播客文章"
          :disabled="postsLoading"
          @click="articles.load"
        >
          <WorkbenchIcon name="refresh" :size="15" />
        </button>
      </header>
      <form class="sw-reading-search" @submit.prevent="articles.search">
        <WorkbenchIcon name="search" :size="15" /><input
          v-model="keyword"
          type="search"
          aria-label="搜索播客文章"
          placeholder="搜索文章…"
        /><button type="submit" aria-label="搜索"><WorkbenchIcon name="arrow" :size="14" /></button>
      </form>
      <VLoading v-if="postsLoading" />
      <p v-else-if="postsError" class="sw-reading-list-state" role="alert">{{ postsError }}</p>
      <p v-else-if="!posts.length" class="sw-reading-list-state">
        {{ keyword ? '没有找到相关文章' : '还没有可用的文章' }}
      </p>
      <nav v-else class="sw-reading-posts">
        <button
          v-for="item in posts"
          :key="item.name"
          type="button"
          class="sw-reading-post"
          :class="{ 'is-selected': post === item.name }"
          :aria-pressed="post === item.name"
          @click="router.replace(workbenchLocation('podcast', { post: item.name }))"
        >
          <WorkbenchIcon name="book" :size="16" /><span class="sw-reading-post-copy"
            ><strong>{{ item.title }}</strong
            ><small>{{ item.published ? '已发布' : '未发布' }}</small></span
          >
        </button>
      </nav>
      <footer v-if="pages > 1" class="sw-reading-pagination">
        <button class="sw-text-button" :disabled="page <= 1" aria-label="上一页" @click="page--">
          ←</button
        ><span>{{ page }} / {{ pages }}</span
        ><button
          class="sw-text-button"
          :disabled="page >= pages"
          aria-label="下一页"
          @click="page++"
        >
          →
        </button>
      </footer>
      <p class="sw-reading-library-note">手动生成一次，访客即可重复收听。</p>
    </aside>
    <section class="sw-podcast-studio" aria-label="播客制作">
      <div v-if="!post" class="sw-podcast-empty">
        <WorkbenchIcon name="headphones" :size="38" />
        <h2>从一篇文章，开始一次对谈</h2>
        <p>选择文章，生成讨论稿，再用两个音色制作播客。</p>
      </div>
      <VLoading v-else-if="loading" />
      <template v-else>
        <header class="sw-podcast-heading">
          <div>
            <span class="sw-eyebrow">ARTICLE PODCAST</span>
            <h2>{{ title }}</h2>
            <p>{{ episode?.status.message || '先编写讨论稿，确认内容后再合成声音。' }}</p>
          </div>
          <button
            class="sw-text-button"
            :disabled="dirty || submitting"
            aria-label="刷新播客状态"
            @click="state.load()"
          >
            <WorkbenchIcon name="refresh" :size="16" />
          </button>
        </header>
        <div v-if="error" class="sw-notice" role="alert">
          {{ error
          }}<button v-if="busy" class="sw-text-button" @click="state.load()">重新检查</button>
        </div>
        <div v-if="view?.stale || view?.audioOutdated" class="sw-notice">
          {{
            view.stale
              ? '文章内容已更新，建议重新生成讨论稿。'
              : '讨论稿已更新，当前音频仍使用上次生成的内容。'
          }}
        </div>
        <PodcastPlayer v-if="episode?.spec.audio" :audio="episode.spec.audio" />
        <PodcastScriptOptions
          v-model:duration="duration"
          v-model:style="style"
          :locked="locked"
          :can-generate="!dirty && !!capabilities?.enabled"
          :generating="busy && episode?.status.phase === 'SCRIPTING'"
          :has-script="draft.length > 0"
          :provider-label="providerLabels[capabilities?.provider || ''] || '请配置语音服务'"
          @generate="regenerate"
        />
        <section v-if="draft.length" class="sw-podcast-script" aria-label="编辑讨论稿">
          <header>
            <h3>讨论稿</h3>
            <span
              >{{ draft.reduce((n, t) => n + t.text.length, 0) }} 字 · {{ draft.length }} 轮{{
                dirty ? ' · 未保存' : ''
              }}</span
            >
          </header>
          <p v-if="capabilities?.speech?.automatic" class="sw-podcast-expression-note">
            编稿时会根据内容标注语音情感。可逐轮调整；拟声效果出现在该轮开头。
          </p>
          <div v-for="(turn, index) in draft" :key="index" class="sw-podcast-turn">
            <select
              v-model="turn.speaker"
              :aria-label="`第 ${index + 1} 轮主持人`"
              :disabled="locked"
            >
              <option value="A">主持人 A</option>
              <option value="B">主持人 B</option>
            </select>
            <div class="sw-podcast-turn-content">
              <textarea
                v-model="turn.text"
                :aria-label="`第 ${index + 1} 轮台词`"
                maxlength="300"
                rows="3"
                :disabled="locked"
              />
              <PodcastTurnExpression
                v-model="draft[index]!"
                :speech="capabilities?.speech"
                :locked="locked"
                :index="index"
              />
            </div>
            <button
              type="button"
              class="sw-text-button"
              :aria-label="`删除第 ${index + 1} 轮`"
              :disabled="locked || draft.length <= 4"
              @click="draft.splice(index, 1)"
            >
              <WorkbenchIcon name="close" :size="14" />
            </button>
          </div>
          <button
            class="sw-text-button"
            :disabled="locked || draft.length >= 40"
            @click="
              draft.push({
                speaker: draft[draft.length - 1]?.speaker === 'A' ? 'B' : 'A',
                text: '',
              })
            "
          >
            <WorkbenchIcon name="plus" :size="14" />添加一轮
          </button>
        </section>
        <div v-if="draft.length" class="sw-podcast-footer">
          <div>
            <p>{{ dirty ? '讨论稿有未保存的修改' : '确认台词后，即可合成声音' }}</p>
            <span>{{
              dirty
                ? '保存后再合成，修改将用于下一次生成的音频。'
                : '合成成功后，访客可以在文章页收听。'
            }}</span>
          </div>
          <button v-if="dirty" class="sw-text-button" :disabled="locked" @click="state.discard">
            撤销修改</button
          ><button v-if="dirty" class="sw-button" :disabled="locked" @click="state.save">
            保存讨论稿</button
          ><button
            v-else-if="draft.length"
            class="sw-button is-primary"
            :disabled="locked || !capabilities?.ready"
            @click="state.render"
          >
            <WorkbenchIcon name="headphones" :size="15" />{{
              episode?.status.phase === 'GENERATING'
                ? '合成中…'
                : episode?.spec.audio
                  ? '重新合成音频'
                  : '合成双人播客'
            }}
          </button>
        </div>
        <button
          v-if="episode && canManage"
          class="sw-text-button sw-podcast-remove"
          :disabled="locked"
          @click="remove"
        >
          移除播客
        </button>
      </template>
    </section>
  </div>
</template>
