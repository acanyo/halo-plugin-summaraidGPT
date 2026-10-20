<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { ArticleReadingSpec, InsightNode } from '@/api/article-reading'
import WorkbenchIcon from '@/workbench/components/WorkbenchIcon.vue'
import {
  createInsightLayout,
  insightKindLabel,
  insightNodePath,
} from '../../../../shared/insight-graph/layout'
import {
  bindGraphPan,
  clampGraphZoom,
  fitGraphZoom,
  preserveGraphCenter,
  revealGraphNode,
} from '../../../../shared/insight-graph/viewport'

const props = defineProps<{ spec: ArticleReadingSpec }>()
const mode = ref<'graph' | 'outline'>('graph')
const zoom = ref(1)
const manuallyZoomed = ref(false)
const viewport = ref<HTMLElement>()
const detailPanel = ref<HTMLElement>()
const activeNodeId = ref('')
const detailOpen = ref(false)
const root = computed<InsightNode>(() => ({
  ...props.spec.root,
  id: props.spec.root?.id || 'root',
  title: props.spec.root?.title || props.spec.postTitle || '文章概览',
  kind: 'root',
}))
const layout = computed(() =>
  createInsightLayout(root.value, props.spec.nodes || [], props.spec.edges || []),
)
const activeNode = computed(
  () => layout.value.nodes.find(({ node }) => node.id === activeNodeId.value)?.node || root.value,
)
const activePath = computed(() =>
  detailOpen.value ? insightNodePath(activeNode.value.id, layout.value.parents) : new Set<string>(),
)
const items = computed(() =>
  (activeNode.value.payload?.items || []).map(String).filter(Boolean).slice(0, 6),
)
const articleUrl = computed(() => {
  if (!props.spec.postUrl) return undefined
  try {
    const url = new URL(props.spec.postUrl, window.location.origin)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
})

async function selectNode(node: InsightNode) {
  manuallyZoomed.value = true
  activeNodeId.value = node.id
  detailOpen.value = true
  await nextTick()
  if (viewport.value) revealGraphNode(viewport.value, node.id)
  if (window.matchMedia('(max-width: 640px)').matches) {
    detailPanel.value?.focus({ preventScroll: true })
    detailPanel.value?.scrollIntoView({ block: 'nearest' })
  }
}
async function toggleDetails() {
  manuallyZoomed.value = true
  detailOpen.value = !detailOpen.value
  await nextTick()
  if (viewport.value && detailOpen.value) revealGraphNode(viewport.value, activeNode.value.id)
}
function fit() {
  if (!viewport.value) return
  manuallyZoomed.value = false
  zoom.value = fitGraphZoom(viewport.value, layout.value.width, layout.value.height)
  viewport.value.scrollTo({ left: 0, top: 0 })
}
async function changeZoom(delta: number) {
  const before = zoom.value
  zoom.value = clampGraphZoom(before + delta)
  manuallyZoomed.value = true
  await nextTick()
  if (viewport.value) preserveGraphCenter(viewport.value, before, zoom.value)
}
watch(
  viewport,
  (element, _, onCleanup) => {
    if (!element) return
    const unbind = bindGraphPan(element)
    const observer = new ResizeObserver(() => {
      if (!manuallyZoomed.value) fit()
    })
    observer.observe(element)
    fit()
    onCleanup(() => {
      observer.disconnect()
      unbind()
    })
  },
  { flush: 'post' },
)
watch(
  () => props.spec,
  async () => {
    activeNodeId.value = root.value.id
    detailOpen.value = false
    await nextTick()
    fit()
  },
  { immediate: true },
)
onMounted(() => {
  if (window.matchMedia('(max-width: 640px)').matches) mode.value = 'outline'
})
</script>

<template>
  <section class="ig-reader" aria-label="文章洞察图谱">
    <header class="ig-toolbar">
      <div class="ig-modes" role="group" aria-label="图谱显示方式">
        <button type="button" :aria-pressed="mode === 'graph'" @click="mode = 'graph'">
          <WorkbenchIcon name="graph" :size="14" />图谱
        </button>
        <button type="button" :aria-pressed="mode === 'outline'" @click="mode = 'outline'">
          <WorkbenchIcon name="list" :size="14" />大纲
        </button>
      </div>
      <div class="ig-toolbar-actions">
        <template v-if="mode === 'graph'">
          <button
            type="button"
            class="ig-tool"
            aria-label="缩小图谱"
            :disabled="zoom <= 0.35"
            @click="changeZoom(-0.15)"
          >
            <WorkbenchIcon name="minus" :size="14" />
          </button>
          <span class="ig-zoom-label" aria-live="polite">{{ Math.round(zoom * 100) }}%</span>
          <button
            type="button"
            class="ig-tool"
            aria-label="放大图谱"
            :disabled="zoom >= 1.6"
            @click="changeZoom(0.15)"
          >
            <WorkbenchIcon name="plus" :size="14" />
          </button>
          <button type="button" class="ig-tool" @click="fit">适应视图</button
          ><span class="ig-tool-divider" />
        </template>
        <button type="button" class="ig-tool" :aria-pressed="detailOpen" @click="toggleDetails">
          <WorkbenchIcon name="panel" :size="14" />详情
        </button>
      </div>
    </header>
    <div class="ig-workspace" :class="{ 'has-detail': detailOpen }">
      <div
        v-if="mode === 'graph'"
        ref="viewport"
        class="ig-viewport"
        tabindex="0"
        aria-label="图谱画布，可滚动和缩放"
        @keydown.esc="detailOpen = false"
      >
        <div class="ig-scroll-area">
          <div
            class="ig-board-frame"
            :style="{ width: `${layout.width * zoom}px`, height: `${layout.height * zoom}px` }"
          >
            <div
              class="ig-board"
              :style="{
                width: `${layout.width}px`,
                height: `${layout.height}px`,
                transform: `scale(${zoom})`,
              }"
            >
              <svg
                class="ig-links"
                :width="layout.width"
                :height="layout.height"
                aria-hidden="true"
              >
                <path
                  v-for="link in layout.links"
                  :key="`${link.from.node.id}:${link.to.node.id}`"
                  class="ig-link"
                  :class="{
                    'is-active':
                      activePath.has(link.from.node.id) && activePath.has(link.to.node.id),
                  }"
                  :d="link.path"
                />
              </svg>
              <button
                v-for="view in layout.nodes"
                :key="view.node.id"
                :data-node-id="view.node.id"
                type="button"
                class="ig-node"
                :class="[
                  `ig-node--${view.level}`,
                  { 'is-active': detailOpen && activeNode.id === view.node.id },
                ]"
                :style="{
                  left: `${view.x}px`,
                  top: `${view.y}px`,
                  width: `${view.width}px`,
                  height: `${view.height}px`,
                }"
                :title="view.node.title"
                :aria-label="view.node.title"
                :aria-pressed="detailOpen && activeNode.id === view.node.id"
                @click="selectNode(view.node)"
              >
                <span v-if="view.level === 'root'" class="ig-node-kicker">文章概览</span
                ><span v-else class="ig-node-marker" aria-hidden="true">{{
                  view.level === 'branch'
                    ? layout.groups.findIndex((group) => group.node.id === view.node.id) + 1
                    : ''
                }}</span
                ><span class="ig-node-title">{{ view.node.title }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <nav v-else class="ig-outline" aria-label="文章图谱大纲">
        <button
          type="button"
          class="ig-outline-node"
          :class="{ 'is-active': detailOpen && activeNode.id === root.id }"
          @click="selectNode(root)"
        >
          <strong>{{ root.title }}</strong
          ><small v-if="root.summary">{{ root.summary }}</small>
        </button>
        <div v-for="group in layout.groups" :key="group.node.id">
          <button
            type="button"
            class="ig-outline-node"
            :class="{ 'is-active': detailOpen && activeNode.id === group.node.id }"
            @click="selectNode(group.node)"
          >
            <strong>{{ group.node.title }}</strong
            ><small v-if="group.node.summary">{{ group.node.summary }}</small>
          </button>
          <div v-if="group.children.length" class="ig-outline-children">
            <button
              v-for="child in group.children"
              :key="child.id"
              type="button"
              class="ig-outline-node"
              :class="{ 'is-active': detailOpen && activeNode.id === child.id }"
              @click="selectNode(child)"
            >
              <strong>{{ child.title }}</strong>
            </button>
          </div>
        </div>
      </nav>
      <aside
        v-if="detailOpen"
        ref="detailPanel"
        class="ig-detail"
        tabindex="-1"
        aria-label="节点详情"
        @keydown.esc="detailOpen = false"
      >
        <div class="ig-detail-head">
          <span class="ig-detail-kicker">{{ insightKindLabel(activeNode.kind) }}</span
          ><button
            type="button"
            class="ig-tool"
            aria-label="关闭节点详情"
            @click="detailOpen = false"
          >
            <WorkbenchIcon name="close" :size="15" />
          </button>
        </div>
        <h3>{{ activeNode.title }}</h3>
        <p v-if="activeNode.summary">{{ activeNode.summary }}</p>
        <div v-if="activeNode.sourceRange?.anchor" class="ig-source">
          <small>原文依据</small>
          <blockquote>{{ activeNode.sourceRange.anchor }}</blockquote>
        </div>
        <ul v-if="items.length" class="ig-items">
          <li v-for="(item, index) in items" :key="index">{{ item }}</li>
        </ul>
        <div v-if="articleUrl" class="ig-detail-actions">
          <a :href="articleUrl" target="_blank" rel="noopener noreferrer"
            >阅读原文<WorkbenchIcon name="external" :size="13"
          /></a>
        </div>
      </aside>
    </div>
    <footer class="ig-footnote">
      <span
        >{{ layout.groups.filter((group) => group.node.kind === 'tl').length }} 个主题 ·
        {{ spec.nodes?.filter((node) => node.kind === 'dl').length || 0 }} 条延伸阅读</span
      ><span>{{
        mode === 'graph' ? '拖动画布浏览，选择节点查看详情' : '按主题浏览，选择条目查看详情'
      }}</span>
    </footer>
  </section>
</template>

<style src="../../../../shared/insight-graph/graph.css" scoped></style>
