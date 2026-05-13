import { catalogVersion } from "@/data/catalog";
import { scoreMap, type ScoredVideo } from "@/lib/matcher";
import type { GeneratedPlan, ReviewStatus, VideoId } from "@/types/domain";

export const MAX_PLAN_VIDEOS = 5;

export function assertWithinVideoCap(videoIds: VideoId[]): void {
  if (videoIds.length > MAX_PLAN_VIDEOS) {
    throw new Error("finalVideoOrder cannot exceed 5 videos");
  }
}

export function createGeneratedPlan(params: {
  promptHash: string;
  scoredVideos: ScoredVideo[];
  rationale: string;
  weeklyGuidance: GeneratedPlan["weeklyGuidance"];
}): GeneratedPlan {
  const selected = params.scoredVideos.slice(0, MAX_PLAN_VIDEOS).map((item) => item.video.id);
  assertWithinVideoCap(selected);
  return {
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    promptHash: params.promptHash,
    reviewStatus: "draft",
    catalogVersion,
    systemSelectedVideos: selected,
    systemScoresByVideoId: scoreMap(params.scoredVideos),
    manuallyAddedVideos: [],
    manuallyRemovedVideos: [],
    finalVideoOrder: selected,
    recommendedVideos: selected,
    rationale: params.rationale,
    weeklyGuidance: params.weeklyGuidance,
    overrideLog: [],
    parentHelpFlags: [],
  };
}

export function transitionStatus(current: ReviewStatus, action: "edit" | "approve" | "send" | "reopen"): ReviewStatus {
  if (action === "edit") return "revised";
  if (action === "approve") return "approved";
  if (action === "send") {
    if (current !== "approved") throw new Error("Only approved plans can be sent");
    return "sent";
  }
  return "revised";
}
