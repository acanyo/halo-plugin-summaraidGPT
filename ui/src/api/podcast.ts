import { axiosInstance } from '@halo-dev/api-client'
import type { PodcastAudio, PodcastTurn } from '../../../shared/podcast/types'
export type { PodcastAudio, PodcastTurn } from '../../../shared/podcast/types'

const API = '/apis/console.api.summary.summaraidgpt.lik.cc/v1alpha1'
export interface PodcastEpisode {
  spec: {
    postName: string
    postTitle?: string
    contentHash?: string
    durationMinutes: number
    style: string
    turns: PodcastTurn[]
    audio?: PodcastAudio
  }
  status: { phase: string; message?: string }
}
export interface PodcastEpisodeView {
  episode: PodcastEpisode
  stale: boolean
  audioOutdated: boolean
}
export interface PodcastCapabilities {
  enabled: boolean
  ready: boolean
  message: string
  provider: string
  durationMinutes: number
  style: string
  speech?: { model: string; emotions: string[]; interjections: string[]; automatic: boolean }
}
export const podcastApi = {
  async capabilities() {
    return (await axiosInstance.get<PodcastCapabilities>(`${API}/podcastCapabilities`)).data
  },
  async get(post: string): Promise<PodcastEpisodeView | undefined> {
    const { data } = await axiosInstance.get<PodcastEpisodeView | ''>(
      `${API}/podcastEpisodes/${encodeURIComponent(post)}`,
    )
    return data || undefined
  },
  async generate(postName: string, durationMinutes: number, style: string) {
    return (
      await axiosInstance.post<PodcastEpisode>(`${API}/podcastScripts`, {
        postName,
        durationMinutes,
        style,
      })
    ).data
  },
  async save(post: string, turns: PodcastTurn[]) {
    return (
      await axiosInstance.put<PodcastEpisode>(
        `${API}/podcastEpisodes/${encodeURIComponent(post)}`,
        { turns },
      )
    ).data
  },
  async render(post: string) {
    return (
      await axiosInstance.post<PodcastEpisode>(
        `${API}/podcastEpisodes/${encodeURIComponent(post)}/audio`,
      )
    ).data
  },
  async remove(post: string) {
    await axiosInstance.delete(`${API}/podcastEpisodes/${encodeURIComponent(post)}`)
  },
}
