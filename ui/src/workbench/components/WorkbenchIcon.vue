<script setup lang="ts">
import RiRefreshLine from '~icons/ri/refresh-line'
import RiLoader4Line from '~icons/ri/loader-4-line'

withDefaults(defineProps<{ name: string; size?: number }>(), { size: 18 })

const paths: Record<string, string> = {
  headphones: 'M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v9H5a2 2 0 0 1-2-2Zm18 0h-4v9h2a2 2 0 0 0 2-2Z',
  play: 'm9 5 11 7-11 7Z',
  transfer: 'M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  panel: 'M3 4h18v16H3ZM15 4v16',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  book: 'M12 6.5C9 4.5 6 4 3 5v15c3-1 6-.5 9 1 3-1.5 6-2 9-1V5c-3-1-6-.5-9 1.5Zm0 0V21',
  graph: 'M12 8V4m0 4-6 5m6-5 6 5M6 16v4m12-4v4M9 4h6M3 13h6v3H3Zm12 0h6v3h-6Z',
  pet: 'M8 14c2-3 6-3 8 0l2 3c2 4-3 5-6 3-3 2-8 1-6-3ZM5 7c-2 0-2 4 0 4s2-4 0-4Zm14 0c-2 0-2 4 0 4s2-4 0-4ZM9 3c-2 0-2 5 0 5s2-5 0-5Zm6 0c-2 0-2 5 0 5s2-5 0-5Z',
  message:
    'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  external: 'M14 3h7v7m0-7L11 13M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5',
  check: 'm5 12 4 4L19 6',
  info: 'M12 8h.01M12 11v5m9-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  sparkles: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 3v4m-2-2h4',
  chevron: 'm9 5 7 7-7 7',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
}
</script>

<template>
  <component
    :is="name === 'refresh' ? RiRefreshLine : RiLoader4Line"
    v-if="name === 'refresh' || name === 'loading'"
    :width="size"
    :height="size"
    aria-hidden="true"
    focusable="false"
    class="sw-icon"
  />
  <svg
    v-else
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="sw-icon"
  >
    <path v-if="name !== 'settings'" :d="paths[name] || paths.sparkles" />
    <template v-else>
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      <path
        d="m9.5 3-.6 2.3-2 1.2-2.3-.6-2.5 4.2 1.7 1.7v2.4l-1.7 1.7 2.5 4.2 2.3-.6 2 1.2.6 2.3h5l.6-2.3 2-1.2 2.3.6 2.5-4.2-1.7-1.7v-2.4l1.7-1.7-2.5-4.2-2.3.6-2-1.2-.6-2.3Z"
        transform="translate(0 -1) scale(1 .96)"
      />
    </template>
  </svg>
</template>
