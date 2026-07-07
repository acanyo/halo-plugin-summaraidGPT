<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import type { ArticleReadingSpec, InsightNode } from '@/api/article-reading'
import RiBarChartLine from '~icons/ri/bar-chart-line'
import RiBookOpenLine from '~icons/ri/book-open-line'
import RiBrainLine from '~icons/ri/brain-line'
import RiDatabase2Line from '~icons/ri/database-2-line'
import RiFileTextLine from '~icons/ri/file-text-line'
import RiFlagLine from '~icons/ri/flag-line'
import RiFocus3Line from '~icons/ri/focus-3-line'
import RiLineChartLine from '~icons/ri/line-chart-line'
import RiMessage3Line from '~icons/ri/message-3-line'
import RiQuestionLine from '~icons/ri/question-line'
import RiSearchLine from '~icons/ri/search-line'
import RiStarSmileLine from '~icons/ri/star-smile-line'
import RiUser3Line from '~icons/ri/user-3-line'

type GraphTone = 'neutral' | 'conclusion' | 'background' | 'core' | 'argument'
type GraphLevel = 'root' | 'branch' | 'leaf'

interface GraphNodeView {
  node: InsightNode
  x: number
  y: number
  level: GraphLevel
  tone: GraphTone
}

interface GraphLinkView {
  from: GraphNodeView
  to: GraphNodeView
  tone: GraphTone
}

const props = defineProps<{
  spec: ArticleReadingSpec
}>()

const visualNodeLayout = [
  ['tl-conclusion', 50, 18, 'branch', 'conclusion'],
  ['dl-advice', 37, 10, 'leaf', 'conclusion'],
  ['dl-follow-up', 63, 10, 'leaf', 'conclusion'],
  ['tl-background', 20, 39, 'branch', 'background'],
  ['dl-problem-source', 12, 27, 'leaf', 'background'],
  ['dl-current-status', 12, 52, 'leaf', 'background'],
  ['tl-core', 80, 39, 'branch', 'core'],
  ['dl-key-judgment', 88, 27, 'leaf', 'core'],
  ['dl-author-claim', 88, 52, 'leaf', 'core'],
  ['tl-argument', 50, 82, 'branch', 'argument'],
  ['dl-data-fact', 34, 91, 'leaf', 'argument'],
  ['dl-case', 66, 91, 'leaf', 'argument'],
] as const

const visualLinks = [
  ['root', 'tl-conclusion', 'conclusion'],
  ['tl-conclusion', 'dl-advice', 'conclusion'],
  ['tl-conclusion', 'dl-follow-up', 'conclusion'],
  ['root', 'tl-background', 'background'],
  ['tl-background', 'dl-problem-source', 'background'],
  ['tl-background', 'dl-current-status', 'background'],
  ['root', 'tl-core', 'core'],
  ['tl-core', 'dl-key-judgment', 'core'],
  ['tl-core', 'dl-author-claim', 'core'],
  ['root', 'tl-argument', 'argument'],
  ['tl-argument', 'dl-data-fact', 'argument'],
  ['tl-argument', 'dl-case', 'argument'],
] as const

const nodeIcons: Record<string, Component> = {
  root: RiBrainLine,
  'tl-conclusion': RiFlagLine,
  'dl-advice': RiMessage3Line,
  'dl-follow-up': RiQuestionLine,
  'tl-background': RiBookOpenLine,
  'dl-problem-source': RiFocus3Line,
  'dl-current-status': RiLineChartLine,
  'tl-core': RiStarSmileLine,
  'dl-key-judgment': RiSearchLine,
  'dl-author-claim': RiUser3Line,
  'tl-argument': RiBarChartLine,
  'dl-data-fact': RiDatabase2Line,
  'dl-case': RiFileTextLine,
}

const activeNodeId = ref('root')

const rootNode = computed<InsightNode>(() => ({
  id: props.spec.root?.id || 'root',
  title: props.spec.root?.title || props.spec.postTitle || '文章标题',
  kind: 'root',
  summary: props.spec.root?.summary || '洞察图谱',
  sourceRange: props.spec.root?.sourceRange,
  payload: props.spec.root?.payload,
}))

const nodeById = computed(() => {
  const nodes = new Map<string, InsightNode>()
  nodes.set(rootNode.value.id, rootNode.value)
  ;(props.spec.nodes || []).forEach((node) => nodes.set(node.id, node))
  return nodes
})

const nodeViews = computed<GraphNodeView[]>(() => {
  const views: GraphNodeView[] = [
    {
      node: rootNode.value,
      x: 50,
      y: 50,
      level: 'root',
      tone: 'neutral',
    },
  ]
  visualNodeLayout.forEach(([id, x, y, level, tone]) => {
    const node = nodeById.value.get(id)
    if (node) {
      views.push({ node, x, y, level, tone })
    }
  })
  return views
})

const linkViews = computed<GraphLinkView[]>(() => {
  const views = new Map(nodeViews.value.map((view) => [view.node.id, view]))
  return visualLinks
    .map(([fromId, toId, tone]) => {
      const from = views.get(fromId)
      const to = views.get(toId)
      return from && to ? { from, to, tone } : undefined
    })
    .filter(Boolean) as GraphLinkView[]
})

const activeView = computed(() =>
  nodeViews.value.find((view) => view.node.id === activeNodeId.value) || nodeViews.value[0],
)
const activeNode = computed(() => activeView.value?.node || rootNode.value)
const payloadItems = computed(() =>
  Array.isArray(activeNode.value.payload?.items)
    ? activeNode.value.payload.items.map((item) => String(item)).filter(Boolean).slice(0, 6)
    : [],
)

const linkPath = (link: GraphLinkView) => {
  const dx = link.to.x - link.from.x
  const dy = link.to.y - link.from.y
  if (Math.abs(dx) > Math.abs(dy)) {
    return `M ${link.from.x} ${link.from.y} C ${link.from.x + dx * 0.44} ${link.from.y}, ${
      link.from.x + dx * 0.56
    } ${link.to.y}, ${link.to.x} ${link.to.y}`
  }
  return `M ${link.from.x} ${link.from.y} C ${link.from.x} ${
    link.from.y + dy * 0.44
  }, ${link.to.x} ${link.from.y + dy * 0.56}, ${link.to.x} ${link.to.y}`
}

const nodeClass = (view: GraphNodeView) => [
  'preview-node',
  `preview-node--${view.level}`,
  `preview-node--${view.tone}`,
  activeNodeId.value === view.node.id ? 'is-active' : '',
]

const selectNode = (node: InsightNode) => {
  activeNodeId.value = node.id
}

const iconForNode = (view: GraphNodeView) =>
  nodeIcons[view.node.id] || (view.level === 'branch' ? RiFlagLine : RiMessage3Line)

watch(
  () => props.spec.postMetadataName,
  () => {
    activeNodeId.value = 'root'
  },
)
</script>

<template>
  <div class="graph-preview">
    <div class="graph-stage" aria-label="洞察图谱预览">
      <svg class="preview-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <template v-for="link in linkViews" :key="`${link.from.node.id}-${link.to.node.id}`">
          <path :class="['preview-link', `preview-link--${link.tone}`]" :d="linkPath(link)" />
          <circle :class="['preview-dot', `preview-dot--${link.tone}`]" :cx="link.to.x" :cy="link.to.y" r="0.72" />
        </template>
      </svg>

      <button
        v-for="view in nodeViews"
        :key="view.node.id"
        type="button"
        :class="nodeClass(view)"
        :style="{ left: `${view.x}%`, top: `${view.y}%` }"
        @click="selectNode(view.node)"
      >
        <span class="preview-node-icon" aria-hidden="true">
          <component :is="iconForNode(view)" />
        </span>
        <span class="preview-node-title">{{ view.node.title }}</span>
      </button>
    </div>

    <aside class="graph-detail">
      <div class="detail-kicker">当前节点</div>
      <h3>{{ activeNode.title }}</h3>
      <p v-if="activeNode.summary">{{ activeNode.summary }}</p>
      <div v-if="activeNode.sourceRange?.anchor" class="detail-source">
        {{ activeNode.sourceRange.anchor }}
      </div>
      <ul v-if="payloadItems.length" class="detail-items">
        <li v-for="item in payloadItems" :key="item">{{ item }}</li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.graph-preview {
  --graph-text: #172132;
  --graph-muted: #64748b;
  --graph-line: #d9d4cc;
  --tone-conclusion: #b15f20;
  --tone-background: #36a190;
  --tone-core: #5f8fd6;
  --tone-argument: #b864ad;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 21rem);
  gap: 1rem;
  align-items: stretch;
  min-height: 31rem;
  color: var(--graph-text);
}

.graph-stage {
  position: relative;
  min-height: 31rem;
  overflow: hidden;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(249, 250, 251, 0.9)),
    radial-gradient(circle at 50% 50%, rgba(17, 24, 39, 0.045), transparent 26%);
}

.preview-links {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.preview-link {
  fill: none;
  stroke: var(--graph-line);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3.2;
  opacity: 0.62;
  vector-effect: non-scaling-stroke;
}

.preview-dot {
  fill: #fff;
  stroke: var(--graph-line);
  stroke-width: 0.42;
  vector-effect: non-scaling-stroke;
}

.preview-link--conclusion,
.preview-dot--conclusion {
  stroke: var(--tone-conclusion);
}

.preview-link--background,
.preview-dot--background {
  stroke: var(--tone-background);
}

.preview-link--core,
.preview-dot--core {
  stroke: var(--tone-core);
}

.preview-link--argument,
.preview-dot--argument {
  stroke: var(--tone-argument);
}

.preview-node {
  position: absolute;
  z-index: 2;
  --node-color: var(--graph-line);
  display: inline-grid;
  grid-template-columns: auto max-content;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  min-height: 2.35rem;
  min-width: 5.35rem;
  max-width: 10.5rem;
  padding: 0.34rem 0.6rem;
  border: 1px solid color-mix(in srgb, var(--node-color) 34%, #e7e2da);
  border-radius: 10px;
  background: color-mix(in srgb, var(--node-color) 7%, rgba(255, 255, 255, 0.95));
  color: var(--graph-text);
  box-shadow: 0 9px 22px rgba(24, 34, 49, 0.07);
  font-size: 0.78rem;
  font-weight: 760;
  line-height: 1.15;
  text-align: center;
  transform: translate(-50%, -50%);
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.preview-node:hover,
.preview-node.is-active {
  border-color: color-mix(in srgb, var(--node-color) 72%, #e7e2da);
  background: color-mix(in srgb, var(--node-color) 13%, rgba(255, 255, 255, 0.98));
  box-shadow: 0 12px 28px rgba(24, 34, 49, 0.12);
}

.preview-node--root {
  grid-template-columns: 1fr;
  gap: 0.48rem;
  width: 8.1rem;
  height: 8.1rem;
  min-width: 0;
  min-height: 0;
  border-color: #26323f;
  border-radius: 999px;
  background:
    radial-gradient(circle at 38% 26%, rgba(255, 255, 255, 0.1), transparent 28%),
    linear-gradient(145deg, #1a2432, #0f1722 76%);
  color: #fff;
}

.preview-node--root:hover,
.preview-node--root.is-active {
  background:
    radial-gradient(circle at 38% 26%, rgba(255, 255, 255, 0.1), transparent 28%),
    linear-gradient(145deg, #1a2432, #0f1722 76%);
}

.preview-node--branch {
  min-width: 5.55rem;
  font-size: 0.86rem;
  font-weight: 820;
}

.preview-node--leaf {
  background: color-mix(in srgb, var(--node-color) 5%, rgba(255, 255, 255, 0.88));
  font-size: 0.74rem;
}

.preview-node--conclusion {
  --node-color: var(--tone-conclusion);
}

.preview-node--background {
  --node-color: var(--tone-background);
}

.preview-node--core {
  --node-color: var(--tone-core);
}

.preview-node--argument {
  --node-color: var(--tone-argument);
}

.preview-node-icon {
  display: inline-grid;
  place-items: center;
  width: 1.42rem;
  height: 1.42rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--node-color) 12%, #fff);
  color: var(--node-color);
}

.preview-node-icon svg {
  width: 0.88rem;
  height: 0.88rem;
}

.preview-node--root .preview-node-icon {
  width: 1.76rem;
  height: 1.76rem;
  background: transparent;
  color: #fff;
}

.preview-node--root .preview-node-icon svg {
  width: 1.42rem;
  height: 1.42rem;
}

.preview-node-title {
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-node--root .preview-node-title {
  display: -webkit-box;
  max-width: 6.5rem;
  white-space: normal;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.graph-detail {
  align-self: stretch;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  padding: 1rem;
  box-shadow: 0 16px 38px rgba(24, 34, 49, 0.08);
}

.detail-kicker {
  color: var(--graph-muted);
  font-size: 0.72rem;
  font-weight: 760;
}

.graph-detail h3 {
  margin: 0.32rem 0 0;
  color: var(--graph-text);
  font-size: 1.04rem;
  font-weight: 860;
  line-height: 1.35;
}

.graph-detail p {
  margin: 0.72rem 0 0;
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.75;
}

.detail-source {
  margin-top: 0.8rem;
  border-left: 3px solid #2d9b8a;
  border-radius: 8px;
  background: #f8fafc;
  padding: 0.62rem 0.72rem;
  color: #475569;
  font-size: 0.78rem;
  line-height: 1.62;
}

.detail-items {
  display: grid;
  gap: 0.42rem;
  margin: 0.84rem 0 0;
  padding: 0;
  list-style: none;
}

.detail-items li {
  position: relative;
  padding-left: 0.84rem;
  color: #334155;
  font-size: 0.8rem;
  line-height: 1.56;
}

.detail-items li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.66em;
  width: 0.32rem;
  height: 0.32rem;
  border-radius: 999px;
  background: #2d9b8a;
}

@media (max-width: 960px) {
  .graph-preview {
    grid-template-columns: 1fr;
  }

  .graph-stage {
    min-height: 34rem;
  }
}

@media (max-width: 680px) {
  .preview-node {
    min-width: 4.85rem;
    max-width: 6.6rem;
    gap: 0.3rem;
    padding-inline: 0.42rem;
    font-size: 0.7rem;
  }

  .preview-node-icon {
    width: 1.28rem;
    height: 1.28rem;
  }

  .preview-node--root {
    width: 6.4rem;
    height: 6.4rem;
    font-size: 0.68rem;
  }
}
</style>
