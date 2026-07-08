<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Component } from 'vue'
import type { ArticleReadingSpec, InsightNode } from '@/api/article-reading'
import RiBarChartLine from '~icons/ri/bar-chart-line'
import RiBookOpenLine from '~icons/ri/book-open-line'
import RiBrainLine from '~icons/ri/brain-line'
import RiDatabase2Line from '~icons/ri/database-2-line'
import RiBox3Line from '~icons/ri/box-3-line'
import RiCheckLine from '~icons/ri/check-line'
import RiCloseLine from '~icons/ri/close-line'
import RiErrorWarningLine from '~icons/ri/error-warning-line'
import RiFileTextLine from '~icons/ri/file-text-line'
import RiFlagLine from '~icons/ri/flag-line'
import RiMessage3Line from '~icons/ri/message-3-line'
import RiQuestionLine from '~icons/ri/question-line'
import RiRouteLine from '~icons/ri/route-line'
import RiSearchLine from '~icons/ri/search-line'
import RiStarSmileLine from '~icons/ri/star-smile-line'
import RiTimeLine from '~icons/ri/time-line'
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
  level: 'branch' | 'leaf'
}

interface GraphLayoutMetrics {
  branchRadiusX: number
  branchRadiusY: number
  childOffsetX: number
  childOffsetY: number
  childSpreadX: number
  childSpreadY: number
  orphanLeafRadiusX: number
  orphanLeafRadiusY: number
}

const props = defineProps<{
  spec: ArticleReadingSpec
}>()

const graphTones: GraphTone[] = ['conclusion', 'background', 'core', 'argument']

const activeNodeId = ref('root')
const detailOpen = ref(false)
const compactViewport = ref(false)
let compactViewportQuery: MediaQueryList | undefined

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

const graphEdges = computed(() =>
  (props.spec.edges || []).filter((edge) => nodeById.value.has(edge.from) && nodeById.value.has(edge.to)),
)

const graphChildNodes = (parentId: string) => {
  const seen = new Set<string>()
  return graphEdges.value
    .filter((edge) => edge.from === parentId)
    .map((edge) => nodeById.value.get(edge.to))
    .filter((node): node is InsightNode => {
      if (!node || seen.has(node.id)) {
        return false
      }
      seen.add(node.id)
      return true
    })
}

const branchAngle = (index: number, total: number) =>
  total === 1
    ? 0
    : total === 2
      ? index === 0
        ? Math.PI
        : 0
      : (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2

const clampPosition = (value: number) => {
  const min = compactViewport.value ? 11 : 8
  const max = compactViewport.value ? 89 : 92
  return Math.min(max, Math.max(min, value))
}

const graphLayoutMetrics = (branchCount: number): GraphLayoutMetrics => {
  const dense = branchCount > 4
  if (compactViewport.value) {
    const branchRadiusX = dense ? 27 : 25
    const branchRadiusY = dense ? 30 : 28
    const childOffsetX = dense ? 17 : 18
    const childOffsetY = dense ? 13 : 14
    return {
      branchRadiusX,
      branchRadiusY,
      childOffsetX,
      childOffsetY,
      childSpreadX: dense ? 16 : 17,
      childSpreadY: dense ? 8.2 : 8.8,
      orphanLeafRadiusX: branchRadiusX + childOffsetX,
      orphanLeafRadiusY: branchRadiusY + childOffsetY,
    }
  }

  const branchRadiusX = dense ? 25 : 23
  const branchRadiusY = dense ? 24 : 22
  const childOffsetX = dense ? 18.5 : 20.5
  const childOffsetY = dense ? 12 : 13.5
  return {
    branchRadiusX,
    branchRadiusY,
    childOffsetX,
    childOffsetY,
    childSpreadX: dense ? 16.5 : 17.5,
    childSpreadY: dense ? 7.2 : 7.8,
    orphanLeafRadiusX: branchRadiusX + childOffsetX,
    orphanLeafRadiusY: branchRadiusY + childOffsetY,
  }
}

const branchSide = (angle: number): 'top' | 'right' | 'bottom' | 'left' => {
  const x = Math.cos(angle)
  const y = Math.sin(angle)
  if (y < -0.86) {
    return 'top'
  }
  if (y > 0.86) {
    return 'bottom'
  }
  return x < 0 ? 'left' : 'right'
}

const childNodePosition = (
  parentX: number,
  parentY: number,
  angle: number,
  childIndex: number,
  childCount: number,
  layout: GraphLayoutMetrics,
) => {
  const centeredIndex = childIndex - (childCount - 1) / 2
  const shiftX = childCount === 1 ? 0 : centeredIndex * layout.childSpreadX
  const shiftY = childCount === 1 ? 0 : centeredIndex * layout.childSpreadY
  const side = branchSide(angle)

  if (side === 'top' || side === 'bottom') {
    const direction = side === 'top' ? -1 : 1
    return {
      x: clampPosition(parentX + shiftX),
      y: clampPosition(parentY + direction * layout.childOffsetY),
    }
  }

  const direction = side === 'left' ? -1 : 1
  const verticalDirection = Math.sin(angle)
  const sideShiftY =
    Math.abs(verticalDirection) > 0.22
      ? (verticalDirection < 0 ? -1 : 1) * childIndex * layout.childSpreadY
      : shiftY
  return {
    x: clampPosition(parentX + direction * layout.childOffsetX),
    y: clampPosition(parentY + sideShiftY),
  }
}

const keywordTone = (value: string, fallback: GraphTone = 'neutral'): GraphTone => {
  const text = value.toLowerCase()
  if (/结论|建议|行动|清单|追问|conclusion|advice|action|question|follow/.test(text)) {
    return 'conclusion'
  }
  if (/背景|来源|上下文|时间|历程|开篇|background|source|timeline/.test(text)) {
    return 'background'
  }
  if (/核心|观点|判断|概念|术语|解释|人物|产品|core|concept|term|people|product/.test(text)) {
    return 'core'
  }
  if (/论据|证据|事实|数据|案例|风险|问题|argument|evidence|data|case|risk/.test(text)) {
    return 'argument'
  }
  return fallback
}

const nodeToneMap = computed(() => {
  const tones = new Map<string, GraphTone>()
  const tlNodes = (props.spec.nodes || []).filter((node) => node.kind === 'tl')
  tlNodes.forEach((node, index) => {
    const tone = keywordTone(node.title, graphTones[index % graphTones.length])
    tones.set(node.id, tone)
    graphChildNodes(node.id).forEach((child) => tones.set(child.id, tone))
  })
  return tones
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

  const tlNodes = (props.spec.nodes || []).filter((node) => node.kind === 'tl')
  const branchCount = Math.max(1, tlNodes.length)
  const layout = graphLayoutMetrics(branchCount)

  tlNodes.forEach((node, index) => {
    const angle = branchAngle(index, branchCount)
    const tone = nodeToneMap.value.get(node.id) || keywordTone(node.title)
    const branchX = clampPosition(50 + Math.cos(angle) * layout.branchRadiusX)
    const branchY = clampPosition(50 + Math.sin(angle) * layout.branchRadiusY)
    views.push({
      node,
      x: branchX,
      y: branchY,
      level: 'branch',
      tone,
    })

    const children = graphChildNodes(node.id).filter((child) => child.kind === 'dl')
    const childCount = Math.max(1, children.length)
    children.forEach((child, childIndex) => {
      const childPosition = childNodePosition(branchX, branchY, angle, childIndex, childCount, layout)
      views.push({
        node: child,
        x: childPosition.x,
        y: childPosition.y,
        level: 'leaf',
        tone,
      })
    })
  })

  const visibleIds = new Set(views.map((view) => view.node.id))
  ;(props.spec.nodes || [])
    .filter((node) => !visibleIds.has(node.id))
    .forEach((node, index, nodes) => {
      const angle = branchAngle(index, Math.max(1, nodes.length))
      const radiusX = node.kind === 'tl' ? layout.branchRadiusX : layout.orphanLeafRadiusX
      const radiusY = node.kind === 'tl' ? layout.branchRadiusY : layout.orphanLeafRadiusY
      views.push({
        node,
        x: clampPosition(50 + Math.cos(angle) * radiusX),
        y: clampPosition(50 + Math.sin(angle) * radiusY),
        level: node.kind === 'tl' ? 'branch' : 'leaf',
        tone: nodeToneMap.value.get(node.id) || keywordTone(node.title),
      })
    })
  return views
})

const linkViews = computed<GraphLinkView[]>(() => {
  const views = new Map(nodeViews.value.map((view) => [view.node.id, view]))
  const seen = new Set<string>()
  const links = graphEdges.value
    .map((edge) => {
      const from = views.get(edge.from)
      const to = views.get(edge.to)
      return from && to
        ? {
            from,
            to,
            tone: to.tone || from.tone,
            level: from.level === 'branch' && to.level === 'leaf' ? 'leaf' : 'branch',
          }
        : undefined
    })
    .filter(Boolean) as GraphLinkView[]

  ;(props.spec.nodes || [])
    .filter((node) => node.kind === 'tl')
    .forEach((node) => {
      const key = `${rootNode.value.id}->${node.id}`
      if (!seen.has(key) && !links.some((link) => link.from.node.id === rootNode.value.id && link.to.node.id === node.id)) {
        const from = views.get(rootNode.value.id)
        const to = views.get(node.id)
        if (from && to) {
          links.push({ from, to, tone: to.tone || from.tone, level: 'branch' })
        }
      }
    })

  return links.filter((link) => {
    const key = `${link.from.node.id}->${link.to.node.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => (a.level === b.level ? 0 : a.level === 'branch' ? -1 : 1))
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

const visualLength = (value: string) =>
  Array.from(value).reduce((length, char) => length + (/[\u3400-\u9fff\uff00-\uffef]/.test(char) ? 1 : 0.55), 0)

const normalizeTitle = (title: string) => title.replace(/\s+/g, ' ').trim()

const titleLimit = (level: GraphLevel) => {
  if (level === 'root') return compactViewport.value ? 16 : 22
  if (level === 'branch') return compactViewport.value ? 8 : 10
  return compactViewport.value ? 7 : 9
}

const truncateTitle = (title: string, limit: number) => {
  let width = 0
  let result = ''
  for (const char of Array.from(title)) {
    const charWidth = visualLength(char)
    if (width + charWidth > limit) {
      return `${result.trim()}…`
    }
    result += char
    width += charWidth
  }
  return result.trim()
}

const nodeDisplayTitle = (view: GraphNodeView) => {
  const title = normalizeTitle(view.node.title)
  const limit = titleLimit(view.level)
  if (!title) return '未命名节点'

  const colonTitle = title.split(/[：:]/)[0]?.trim()
  if (colonTitle && colonTitle.length >= 2 && visualLength(colonTitle) <= limit) {
    return colonTitle
  }

  const sentenceTitle = title.split(/[，,。；;、|｜/（(]/)[0]?.trim()
  if (sentenceTitle && sentenceTitle.length >= 2 && visualLength(sentenceTitle) <= limit) {
    return sentenceTitle
  }

  return truncateTitle(title, limit)
}

const linkPath = (link: GraphLinkView) => {
  const dx = link.to.x - link.from.x
  const dy = link.to.y - link.from.y
  const bend = link.level === 'leaf' ? 0.08 : 0.14
  const normalX = -dy * bend
  const normalY = dx * bend
  return `M ${link.from.x} ${link.from.y} C ${link.from.x + dx * 0.42 + normalX} ${
    link.from.y + dy * 0.42 + normalY
  }, ${link.from.x + dx * 0.58 + normalX} ${link.from.y + dy * 0.58 + normalY}, ${link.to.x} ${link.to.y}`
}

const nodeClass = (view: GraphNodeView) => [
  'preview-node',
  `preview-node--${view.level}`,
  `preview-node--${view.tone}`,
  activeNodeId.value === view.node.id ? 'is-active' : '',
]

const selectNode = (node: InsightNode) => {
  const wasOpen = detailOpen.value && activeNodeId.value === node.id
  activeNodeId.value = node.id
  detailOpen.value = !wasOpen
}

const refreshCompactViewport = () => {
  compactViewport.value = window.matchMedia?.('(max-width: 760px)').matches ?? false
}

const iconForNode = (view: GraphNodeView): Component => {
  if (view.level === 'root') return RiBrainLine
  const text = `${view.node.title} ${view.node.id}`.toLowerCase()
  if (/背景|来源|上下文|开篇|background|source/.test(text)) return RiBookOpenLine
  if (/时间|历程|阶段|timeline|history|stage/.test(text)) return RiTimeLine
  if (/核心|观点|判断|主张|core|claim|judgment/.test(text)) return RiStarSmileLine
  if (/证据|依据|事实|数据|evidence|data|fact/.test(text)) return RiDatabase2Line
  if (/案例|故事|实践|case|story|practice/.test(text)) return RiFileTextLine
  if (/步骤|流程|方法|教程|step|process|method|guide/.test(text)) return RiRouteLine
  if (/风险|问题|争议|risk|problem|issue/.test(text)) return RiErrorWarningLine
  if (/概念|术语|解释|term|concept|explain/.test(text)) return RiSearchLine
  if (/人物|角色|作者|user|people|person|role/.test(text)) return RiUser3Line
  if (/产品|工具|模型|product|tool|model/.test(text)) return RiBox3Line
  if (/行动|建议|清单|todo|action|advice|list/.test(text)) return RiCheckLine
  if (/追问|问题|question|follow/.test(text)) return RiQuestionLine
  if (/结论|总结|收束|conclusion|summary/.test(text)) return RiFlagLine
  return view.level === 'branch' ? RiBarChartLine : RiMessage3Line
}

watch(
  () => props.spec.postMetadataName,
  () => {
    activeNodeId.value = 'root'
    detailOpen.value = false
  },
)

onMounted(() => {
  refreshCompactViewport()
  compactViewportQuery = window.matchMedia?.('(max-width: 760px)')
  compactViewportQuery?.addEventListener('change', refreshCompactViewport)
})

onUnmounted(() => {
  compactViewportQuery?.removeEventListener('change', refreshCompactViewport)
})
</script>

<template>
  <div class="graph-preview">
    <div class="graph-stage" aria-label="洞察图谱预览">
      <div class="graph-board">
        <svg class="preview-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <template v-for="link in linkViews" :key="`${link.from.node.id}-${link.to.node.id}`">
            <path :class="['preview-link', `preview-link--${link.level}`, `preview-link--${link.tone}`]" :d="linkPath(link)" />
            <circle
              :class="['preview-dot', `preview-dot--${link.level}`, `preview-dot--${link.tone}`]"
              :cx="link.to.x"
              :cy="link.to.y"
              r="0.72"
            />
          </template>
        </svg>

        <button
          v-for="view in nodeViews"
          :key="view.node.id"
          type="button"
          :class="nodeClass(view)"
          :style="{ left: `${view.x}%`, top: `${view.y}%` }"
          :title="view.node.title"
          :aria-label="view.node.title"
          @click="selectNode(view.node)"
        >
          <span class="preview-node-icon" aria-hidden="true">
            <component :is="iconForNode(view)" />
          </span>
          <span class="preview-node-title">{{ nodeDisplayTitle(view) }}</span>
        </button>
      </div>

      <aside v-if="detailOpen" class="graph-detail">
        <div class="detail-head">
          <span class="detail-kicker">当前节点</span>
          <button class="detail-close" type="button" aria-label="关闭详情" @click="detailOpen = false">
            <RiCloseLine />
          </button>
        </div>
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
  --graph-panel: #fff;
  --graph-node: rgba(255, 255, 255, 0.95);
  --graph-node-soft: rgba(255, 255, 255, 0.88);
  --graph-node-border: #e7e2da;
  display: block;
  color: var(--graph-text);
}

:global(.dark) .graph-preview,
:global(.color-scheme-dark) .graph-preview,
:global([data-color-scheme="dark"]) .graph-preview {
  --graph-text: #edf2f7;
  --graph-muted: #a8b4c6;
  --graph-line: #495567;
  --graph-panel: #182132;
  --graph-node: rgba(31, 41, 55, 0.94);
  --graph-node-soft: rgba(24, 34, 49, 0.9);
  --graph-node-border: #374254;
  --tone-conclusion: #e1a05e;
  --tone-background: #6fd3c5;
  --tone-core: #93b8ff;
  --tone-argument: #d99bdd;
}

@media (prefers-color-scheme: dark) {
  :global([data-color-scheme="auto"]) .graph-preview {
    --graph-text: #edf2f7;
    --graph-muted: #a8b4c6;
    --graph-line: #495567;
    --graph-panel: #182132;
    --graph-node: rgba(31, 41, 55, 0.94);
    --graph-node-soft: rgba(24, 34, 49, 0.9);
    --graph-node-border: #374254;
    --tone-conclusion: #e1a05e;
    --tone-background: #6fd3c5;
    --tone-core: #93b8ff;
    --tone-argument: #d99bdd;
  }
}

.graph-stage {
  position: relative;
  min-width: 0;
  aspect-ratio: 16 / 9;
  min-height: 29rem;
  max-height: 42rem;
  overflow: visible;
  background: transparent;
}

.graph-board {
  position: absolute;
  inset: 0;
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
  stroke-width: 2.4;
  opacity: 0.44;
  vector-effect: non-scaling-stroke;
}

.preview-link--branch {
  stroke-width: 2.2;
  opacity: 0.34;
}

.preview-link--leaf {
  stroke-width: 2.9;
  opacity: 0.76;
}

.preview-dot {
  fill: var(--graph-panel);
  stroke: var(--graph-line);
  stroke-width: 0.42;
  opacity: 0.82;
  vector-effect: non-scaling-stroke;
}

.preview-dot--branch {
  opacity: 0.5;
}

.preview-dot--leaf {
  opacity: 0.92;
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
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  justify-content: center;
  justify-items: center;
  gap: 0.42rem;
  min-height: 2.36rem;
  min-width: 0;
  width: 8.6rem;
  max-width: 8.6rem;
  padding: 0.32rem 0.58rem 0.34rem;
  border: 1px solid color-mix(in srgb, var(--node-color) 34%, var(--graph-node-border));
  border-radius: 10px;
  background: color-mix(in srgb, var(--node-color) 7%, var(--graph-node));
  color: var(--graph-text);
  box-shadow: 0 8px 20px rgba(24, 34, 49, 0.06);
  font-size: 0.82rem;
  font-weight: 760;
  line-height: 1.15;
  text-align: center;
  transform: translate(-50%, -50%);
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.preview-node:hover,
.preview-node.is-active {
  border-color: color-mix(in srgb, var(--node-color) 72%, var(--graph-node-border));
  background: color-mix(in srgb, var(--node-color) 13%, var(--graph-node));
  box-shadow: 0 10px 24px rgba(24, 34, 49, 0.12);
}

.preview-node--root {
  grid-template-columns: 1fr;
  gap: 0.48rem;
  width: 8.25rem;
  height: 8.25rem;
  min-width: 0;
  min-height: 0;
  border-color: #26323f;
  border-radius: 999px;
  background:
    radial-gradient(circle at 38% 26%, rgba(255, 255, 255, 0.1), transparent 28%),
    linear-gradient(145deg, #1a2432, #0f1722 76%);
  color: #fff;
  box-shadow: 0 16px 34px rgba(20, 30, 45, 0.18);
  font-size: 0.78rem;
  line-height: 1.36;
}

.preview-node--root:hover,
.preview-node--root.is-active {
  background:
    radial-gradient(circle at 38% 26%, rgba(255, 255, 255, 0.1), transparent 28%),
    linear-gradient(145deg, #1a2432, #0f1722 76%);
}

.preview-node--branch {
  width: 8.8rem;
  min-width: 8.8rem;
  min-height: 2.58rem;
  max-width: 8.8rem;
  font-size: 0.86rem;
  font-weight: 820;
}

.preview-node--leaf {
  background: color-mix(in srgb, var(--node-color) 5%, var(--graph-node-soft));
  min-height: 2.34rem;
  width: 7.55rem;
  min-width: 7.55rem;
  max-width: 7.55rem;
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
  background: color-mix(in srgb, var(--node-color) 12%, var(--graph-panel));
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
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.preview-node--branch .preview-node-title,
.preview-node--leaf .preview-node-title {
  display: -webkit-box;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.preview-node--branch .preview-node-title {
  max-width: 6.6rem;
}

.preview-node--leaf .preview-node-title {
  max-width: 5.45rem;
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
  position: absolute;
  top: 50%;
  right: 1.25rem;
  z-index: 4;
  box-sizing: border-box;
  width: min(20.5rem, 28vw);
  max-height: min(31rem, calc(100% - 3rem));
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--graph-line) 68%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--graph-panel) 94%, transparent);
  padding: 1.22rem;
  box-shadow: 0 22px 50px rgba(24, 34, 49, 0.14);
  transform: translateY(-50%);
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.72rem;
  margin-bottom: 0.72rem;
}

.detail-kicker {
  color: var(--graph-muted);
  font-size: 0.72rem;
  font-weight: 760;
}

.detail-close {
  display: inline-grid;
  place-items: center;
  width: 2rem;
  min-height: 2rem;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--graph-text);
}

.detail-close svg {
  width: 1rem;
  height: 1rem;
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

:global(.dark) .graph-detail p,
:global(.color-scheme-dark) .graph-detail p,
:global([data-color-scheme="dark"]) .graph-detail p {
  color: var(--graph-muted);
}

.detail-source {
  margin-top: 0.8rem;
  border-left: 3px solid #2d9b8a;
  border-radius: 8px;
  background: color-mix(in srgb, var(--tone-background) 8%, var(--graph-panel));
  padding: 0.62rem 0.72rem;
  color: var(--graph-muted);
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
  color: var(--graph-text);
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
  .graph-stage {
    aspect-ratio: 9 / 14;
    min-height: clamp(34rem, 138vw, 44rem);
  }

  .graph-detail {
    position: absolute;
    inset: auto 1rem 1rem 1rem;
    width: auto;
    max-height: 24rem;
    transform: none;
  }
}

@media (max-width: 680px) {
  .preview-node {
    width: 5.75rem;
    min-width: 5.75rem;
    max-width: 5.75rem;
    min-height: 2.08rem;
    gap: 0.28rem;
    padding: 0.26rem 0.38rem;
    font-size: 0.68rem;
    line-height: 1.12;
  }

  .preview-node-icon {
    width: 1.16rem;
    height: 1.16rem;
  }

  .preview-node-icon svg {
    width: 0.74rem;
    height: 0.74rem;
  }

  .preview-node-title {
    display: -webkit-box;
    max-width: 3.9rem;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .preview-node--root {
    width: 5.7rem;
    height: 5.7rem;
    padding: 0.5rem;
    font-size: 0.62rem;
  }

  .preview-node--root .preview-node-icon {
    width: 1.36rem;
    height: 1.36rem;
  }

  .preview-node--root .preview-node-icon svg {
    width: 1.08rem;
    height: 1.08rem;
  }

  .preview-node--root .preview-node-title {
    max-width: 4.6rem;
    -webkit-line-clamp: 3;
  }

  .preview-node--branch {
    width: 5.9rem;
    min-width: 5.9rem;
    max-width: 5.9rem;
    font-size: 0.72rem;
  }

  .preview-node--leaf {
    width: 5.45rem;
    min-width: 5.45rem;
    max-width: 5.45rem;
    font-size: 0.66rem;
  }

}
</style>
