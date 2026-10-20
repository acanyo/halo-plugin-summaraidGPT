<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PodcastAudio } from '@/api/podcast'
import { activePodcastTurn, nextPodcastSpeed, podcastTime } from '../../../../shared/podcast/types'
import '../../../../shared/podcast/player.css'

const props = defineProps<{ audio: PodcastAudio }>()
const player = ref<HTMLAudioElement>()
const speed = ref(1)
const currentMs = ref(0)
const durationMs = ref(props.audio.durationMs)
const playing = ref(false)
const waiting = ref(false)
const transcriptOpen = ref(false)
const mediaError = ref(false)
const active = computed(() => activePodcastTurn(props.audio.turns, currentMs.value))
const progress = computed(() =>
  durationMs.value ? Math.min(100, (currentMs.value / durationMs.value) * 100) : 0,
)
watch(
  () => props.audio.url,
  () => {
    player.value?.pause()
    currentMs.value = 0
    durationMs.value = props.audio.durationMs
    speed.value = 1
    playing.value = false
    waiting.value = false
    transcriptOpen.value = false
    mediaError.value = false
  },
)
onBeforeUnmount(() => player.value?.pause())
async function togglePlayback() {
  if (!player.value) return
  if (!player.value.paused) {
    player.value.pause()
    return
  }
  mediaError.value = false
  try {
    if (player.value.error) player.value.load()
    player.value.playbackRate = speed.value
    await player.value.play()
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) mediaError.value = true
    waiting.value = false
  }
}
function seek(time?: number) {
  if (player.value && time !== undefined && Number.isFinite(time)) {
    player.value.currentTime = Math.min(durationMs.value, Math.max(0, time)) / 1000
    currentMs.value = player.value.currentTime * 1000
  }
}
function changeSpeed() {
  speed.value = nextPodcastSpeed(speed.value)
  if (player.value) player.value.playbackRate = speed.value
}
function updateDuration() {
  if (player.value && Number.isFinite(player.value.duration) && player.value.duration > 0) {
    durationMs.value = player.value.duration * 1000
  }
}
function stopPlaying() {
  playing.value = false
  waiting.value = false
}
function failPlayback() {
  mediaError.value = true
  stopPlaying()
}
</script>

<template>
  <section class="podcast-player" aria-label="播客试听">
    <audio
      ref="player"
      :key="audio.url"
      :src="audio.url"
      preload="metadata"
      @timeupdate="currentMs = (player?.currentTime || 0) * 1000"
      @loadedmetadata="updateDuration"
      @durationchange="updateDuration"
      @play="playing = true"
      @playing="waiting = false"
      @waiting="waiting = true"
      @pause="stopPlaying"
      @ended="stopPlaying"
      @error="failPlayback"
    />
    <div class="podcast-bar" :style="{ '--podcast-progress': `${progress}%` }">
      <input
        type="range"
        min="0"
        :max="durationMs"
        step="1000"
        :value="currentMs"
        aria-label="播客播放进度"
        title="拖动或使用方向键调整进度"
        :aria-valuetext="`${podcastTime(currentMs)}，共 ${podcastTime(durationMs)}`"
        :disabled="!durationMs || mediaError"
        @input="seek(Number(($event.target as HTMLInputElement).value))"
      />
      <span class="podcast-mark" aria-hidden="true">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.6"
          stroke-linecap="round"
        >
          <path d="M4 10v4m4-7v10m4-14v18m4-13v8m4-6v4" />
        </svg>
      </span>
      <div class="podcast-copy">
        <button
          type="button"
          class="podcast-title"
          :aria-label="transcriptOpen ? '收起对话稿' : '展开对话稿'"
          :aria-expanded="transcriptOpen"
          title="查看对话稿"
          @click="transcriptOpen = !transcriptOpen"
        >
          <strong>播客听读</strong
          ><svg
            :class="{ 'is-open': transcriptOpen }"
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m5 6 3 3 3-3" />
          </svg>
        </button>
        <small
          ><span class="podcast-caption">AI 双人对谈 · </span
          ><span class="podcast-time"
            >{{ currentMs > 0 ? `${podcastTime(currentMs)} / ` : ''
            }}{{ podcastTime(durationMs) }}</span
          ></small
        >
      </div>
      <div class="podcast-actions">
        <button
          type="button"
          class="podcast-action podcast-speed"
          :aria-label="`播放速度 ${speed} 倍，点击切换`"
          title="切换播放速度"
          @click="changeSpeed"
        >
          {{ speed }}×
        </button>
        <button
          type="button"
          class="podcast-play"
          :aria-label="playing ? '暂停播客' : '播放播客'"
          @click="togglePlayback"
        >
          <span v-if="waiting && playing" class="podcast-spinner" aria-hidden="true" />
          <svg
            v-else
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path :d="playing ? 'M7 5h3v14H7zm7 0h3v14h-3z' : 'm8 5 11 7-11 7z'" />
          </svg>
          <span>{{ playing ? '暂停' : '播放' }}</span>
        </button>
      </div>
    </div>
    <p v-if="mediaError" class="podcast-error" role="alert">音频暂时无法播放，请点击播放重试。</p>
    <div v-if="transcriptOpen" class="podcast-transcript">
      <div class="podcast-transcript-head">
        <span>对话稿 · 点击跳转</span>
      </div>
      <ol>
        <li
          v-for="(turn, index) in audio.turns"
          :key="index"
          :class="{ 'is-active': index === active }"
        >
          <button class="podcast-turn" type="button" @click="seek(turn.startMs)">
            <span
              >{{ turn.speaker === 'A' ? '主持人 A' : '主持人 B' }}
              <time>{{ podcastTime(turn.startMs || 0) }}</time></span
            >
            <p>{{ turn.text }}</p>
          </button>
        </li>
      </ol>
    </div>
  </section>
</template>
