export interface PodcastTurn {
  speaker: "A" | "B";
  text: string;
  emotion?: string;
  interjection?: string;
  startMs?: number;
  endMs?: number;
}

export interface PodcastAudio {
  url: string;
  provider: string;
  model: string;
  durationMs: number;
  generatedAt?: string;
  turns: PodcastTurn[];
}

export interface PublicPodcast {
  title: string;
  audio: PodcastAudio;
}

export const podcastSpeeds = [1, 1.25, 1.5, 2, 0.75] as const;

export function nextPodcastSpeed(current: number) {
  return podcastSpeeds[
    (podcastSpeeds.indexOf(current as (typeof podcastSpeeds)[number]) + 1) % podcastSpeeds.length
  ];
}

export function podcastTime(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function activePodcastTurn(turns: PodcastTurn[], timeMs: number) {
  return turns.findIndex(
    (turn) =>
      turn.startMs !== undefined &&
      turn.endMs !== undefined &&
      timeMs >= turn.startMs &&
      timeMs < turn.endMs,
  );
}
