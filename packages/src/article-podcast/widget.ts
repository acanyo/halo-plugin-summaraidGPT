import { LitElement, html, svg, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { buildThemeObserver, matchesDarkSelector } from '../article-summary/shared';
import { activePodcastTurn, nextPodcastSpeed, podcastTime, type PublicPodcast } from '../../../shared/podcast/types';
import { podcastStyles } from './styles';

@customElement('likcc-article-podcast')
export class ArticlePodcastWidget extends LitElement {
  static styles = podcastStyles;

  @property({ attribute: 'post-name' }) postName = '';
  @state() private podcast?: PublicPodcast;
  @state() private currentMs = 0;
  @state() private durationMs = 0;
  @state() private speed = 1;
  @state() private playing = false;
  @state() private waiting = false;
  @state() private transcriptOpen = false;
  @state() private mediaError = false;
  @state() private dark = false;
  private request?: AbortController;
  private observers: MutationObserver[] = [];
  private media?: MediaQueryList;
  private updateTheme = () => { this.dark = matchesDarkSelector(''); };

  connectedCallback() {
    super.connectedCallback();
    this.updateTheme();
    this.observers = buildThemeObserver('', this.updateTheme);
    this.media = window.matchMedia('(prefers-color-scheme: dark)');
    this.media.addEventListener('change', this.updateTheme);
    if (this.hasUpdated) void this.load();
  }

  disconnectedCallback() {
    this.request?.abort();
    this.observers.forEach(observer => observer.disconnect());
    this.media?.removeEventListener('change', this.updateTheme);
    this.player?.pause();
    super.disconnectedCallback();
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('postName')) void this.load();
  }

  private get player() { return this.renderRoot.querySelector('audio'); }

  private async load() {
    this.request?.abort();
    this.player?.pause();
    this.podcast = undefined;
    this.currentMs = 0;
    this.durationMs = 0;
    this.speed = 1;
    this.playing = false;
    this.waiting = false;
    this.transcriptOpen = false;
    this.mediaError = false;
    if (!this.postName) return;
    const request = new AbortController();
    this.request = request;
    try {
      const response = await fetch(`/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/articlePodcasts/${encodeURIComponent(this.postName)}`, { signal: request.signal, credentials: 'same-origin' });
      if (!response.ok) return;
      const value = await response.json() as PublicPodcast;
      if (request !== this.request || !this.isConnected) return;
      const url = new URL(value.audio?.url || '', window.location.href);
      if (!value.audio?.url || !['http:', 'https:'].includes(url.protocol) || !Array.isArray(value.audio.turns)) return;
      this.durationMs = Math.max(0, value.audio.durationMs || 0);
      this.podcast = value;
    } catch { /* Missing podcasts leave no empty player on the article. */ }
  }

  private async togglePlayback() {
    const player = this.player;
    if (!player) return;
    if (!player.paused) { player.pause(); return; }
    this.mediaError = false;
    try {
      if (player.error) player.load();
      player.playbackRate = this.speed;
      await player.play();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) this.mediaError = true;
      this.waiting = false;
    }
  }

  private seek(ms?: number) {
    const player = this.player;
    if (player && ms !== undefined && Number.isFinite(ms)) {
      player.currentTime = Math.min(this.durationMs, Math.max(0, ms)) / 1000;
      this.currentMs = player.currentTime * 1000;
    }
  }

  private changeSpeed() {
    this.speed = nextPodcastSpeed(this.speed);
    if (this.player) this.player.playbackRate = this.speed;
  }

  private updateDuration(event: Event) {
    const player = event.target as HTMLAudioElement;
    if (Number.isFinite(player.duration) && player.duration > 0) this.durationMs = player.duration * 1000;
  }

  render() {
    if (!this.podcast) return nothing;
    const { audio } = this.podcast;
    const active = activePodcastTurn(audio.turns, this.currentMs);
    const progress = this.durationMs ? Math.min(100, this.currentMs / this.durationMs * 100) : 0;
    return html`<section class=${this.dark ? 'podcast-player is-dark' : 'podcast-player'} aria-label="文章播客">
      <audio src=${audio.url} preload="metadata"
        @timeupdate=${(event: Event) => { this.currentMs = (event.target as HTMLAudioElement).currentTime * 1000; }}
        @loadedmetadata=${this.updateDuration} @durationchange=${this.updateDuration}
        @play=${() => { this.playing = true; }}
        @playing=${() => { this.waiting = false; }}
        @waiting=${() => { this.waiting = true; }}
        @pause=${() => { this.playing = false; this.waiting = false; }}
        @ended=${() => { this.playing = false; this.waiting = false; }}
        @error=${() => { this.mediaError = true; this.waiting = false; this.playing = false; }}></audio>
      <div class="podcast-bar" style=${`--podcast-progress:${progress}%`}>
        <input type="range" min="0" max=${this.durationMs} step="1000" .value=${String(this.currentMs)}
          aria-label="播客播放进度" title="拖动或使用方向键调整进度"
          aria-valuetext=${`${podcastTime(this.currentMs)}，共 ${podcastTime(this.durationMs)}`}
          ?disabled=${!this.durationMs || this.mediaError} @input=${(event: Event) => this.seek(Number((event.target as HTMLInputElement).value))}/>
        <span class="podcast-mark" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 10v4m4-7v10m4-14v18m4-13v8m4-6v4"/></svg></span>
        <div class="podcast-copy">
          <button type="button" class="podcast-title" aria-label=${this.transcriptOpen ? '收起对话稿' : '展开对话稿'} aria-expanded=${String(this.transcriptOpen)} aria-controls="podcast-transcript" title="查看对话稿" @click=${() => { this.transcriptOpen = !this.transcriptOpen; }}>
            <strong>播客听读</strong><svg class=${this.transcriptOpen ? 'is-open' : ''} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 6 3 3 3-3"/></svg>
          </button>
          <small><span class="podcast-caption">AI 双人对谈 · </span><span class="podcast-time">${this.currentMs > 0 ? html`${podcastTime(this.currentMs)} / ` : nothing}${podcastTime(this.durationMs)}</span></small>
        </div>
        <div class="podcast-actions">
          <button type="button" class="podcast-action podcast-speed" aria-label=${`播放速度 ${this.speed} 倍，点击切换`} title="切换播放速度" @click=${this.changeSpeed}>${this.speed}×</button>
          <button type="button" class="podcast-play" aria-label=${this.playing ? '暂停播客' : '播放播客'} @click=${this.togglePlayback}>
            ${this.waiting && this.playing ? html`<span class="podcast-spinner" aria-hidden="true"></span>` : html`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${this.playing ? svg`<path d="M7 5h3v14H7zm7 0h3v14h-3z"/>` : svg`<path d="m8 5 11 7-11 7z"/>`}</svg>`}
            <span>${this.playing ? '暂停' : '播放'}</span>
          </button>
        </div>
      </div>
      ${this.mediaError ? html`<p class="podcast-error" role="alert">音频暂时无法播放，请点击播放重试。</p>` : nothing}
      ${this.transcriptOpen ? html`<div class="podcast-transcript" id="podcast-transcript"><div class="podcast-transcript-head"><span>对话稿 · 点击跳转</span></div><ol>${audio.turns.map((turn, index) => html`<li class=${index === active ? 'is-active' : ''}><button class="podcast-turn" type="button" @click=${() => this.seek(turn.startMs)}><span>${turn.speaker === 'A' ? '主持人 A' : '主持人 B'} <time>${podcastTime(turn.startMs || 0)}</time></span><p>${turn.text}</p></button></li>`)}</ol></div>` : nothing}
    </section>`;
  }
}
