<script setup lang="ts">
import { nextTick } from 'vue'
import type { WorkbenchTab, WorkbenchTabId } from '../navigation'
import WorkbenchIcon from './WorkbenchIcon.vue'

const props = defineProps<{ tabs: WorkbenchTab[]; active: WorkbenchTabId }>()
const emit = defineEmits<{ select: [tab: WorkbenchTabId] }>()

async function handleKeydown(event: KeyboardEvent, index: number) {
  let next: number
  switch (event.key) {
    case 'ArrowRight':
      next = (index + 1) % props.tabs.length
      break
    case 'ArrowLeft':
      next = (index - 1 + props.tabs.length) % props.tabs.length
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = props.tabs.length - 1
      break
    default:
      return
  }
  event.preventDefault()
  // Move focus without navigating: Enter/Space activates a tab, allowing unsaved-change guards.
  await nextTick()
  const tablist = (event.currentTarget as HTMLElement).parentElement
  tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
}
</script>

<template>
  <nav class="sw-tabs" role="tablist" aria-label="智阅工作台功能">
    <button
      v-for="(tab, index) in tabs"
      :id="`sw-tab-${tab.id}`"
      :key="tab.id"
      type="button"
      role="tab"
      :class="{ 'is-active': active === tab.id }"
      :aria-selected="active === tab.id"
      :aria-controls="`sw-panel-${tab.id}`"
      :tabindex="active === tab.id ? 0 : -1"
      @click="emit('select', tab.id)"
      @keydown="handleKeydown($event, index)"
    >
      <WorkbenchIcon :name="tab.icon" :size="16" />
      {{ tab.label }}
    </button>
  </nav>
</template>
