import { videos } from "@/data/catalog";
import type { Level, Module, Video, VideoId } from "@/types/domain";

const modulePriority: Record<Module, number> = {
  F: 1.0,
  A: 1.0,
  C: 0.7,
  T: 0.7,
  S: 0.5,
  B: 0.5,
};

const levelBoost: Record<Level, number> = {
  Beginner: 1.0,
  All: 0.9,
  Intermediate: 0.8,
  Advanced: 0.6,
};

export interface ScoredVideo {
  video: Video;
  score: number;
}

export function scoreVideo(video: Video, extractedTags: string[]): number {
  const matched = video.targetSkillTags.filter((tag) =>
    extractedTags.some((extracted) => tag.toLowerCase().includes(extracted.toLowerCase()))
  ).length;
  const tagMatchScore = extractedTags.length > 0 ? matched / extractedTags.length : 0;

  const score =
    tagMatchScore * 0.5 +
    modulePriority[video.module] * 0.3 +
    levelBoost[video.level] * 0.2;

  return Math.min(1, Number(score.toFixed(4)));
}

export function rankVideos(extractedTags: string[]): ScoredVideo[] {
  return videos
    .map((video) => ({ video, score: scoreVideo(video, extractedTags) }))
    .sort((a, b) => b.score - a.score || a.video.id.localeCompare(b.video.id));
}

export function selectVideos(extractedTags: string[], count = 3): ScoredVideo[] {
  const limit = Math.min(Math.max(count, 3), 5);
  const ranked = rankVideos(extractedTags);
  if (ranked.every((item) => item.score < 0.2)) {
    return videos
      .filter((video) => video.module === "F" && video.level === "Beginner")
      .slice(0, 3)
      .map((video) => ({ video, score: scoreVideo(video, extractedTags) }));
  }
  return ranked.slice(0, limit);
}

export function scoreMap(scoredVideos: ScoredVideo[]): Record<VideoId, number> {
  return Object.fromEntries(scoredVideos.map(({ video, score }) => [video.id, score])) as Record<
    VideoId,
    number
  >;
}
