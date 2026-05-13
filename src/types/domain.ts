export type VideoId = string & { readonly __brand: "VideoId" };

export type FilmingStatus = "not_filmed" | "filmed" | "published";
export type Level = "Beginner" | "Intermediate" | "Advanced" | "All";
export type Module = "F" | "A" | "C" | "T" | "S" | "B";
export type ReviewStatus = "draft" | "revised" | "approved" | "sent";

export interface Video {
  id: VideoId;
  module: Module;
  title: string;
  durationRange: string;
  opening: string;
  keyPoints: [string, string, string];
  demoScene: string;
  homePractice: string;
  level: Level;
  routineTags: string[];
  targetSkillTags: string[];
  youtubeUrl: string | null;
  filmingStatus: FilmingStatus;
}

export interface WeeklyBlock {
  week: 1 | 2 | 3 | 4;
  focus: string;
  videos: VideoId[];
  practiceGoal: string;
}

export interface OverrideEvent {
  timestamp: string;
  action:
    | "added"
    | "removed"
    | "reordered"
    | "approved"
    | "reopened"
    | "sent"
    | "rationale_edited"
    | "parent_help_flagged";
  videoId: VideoId | null;
  previousOrder: VideoId[] | null;
  nextOrder: VideoId[] | null;
}

export interface GeneratedPlan {
  id: string;
  generatedAt: string;
  promptHash: string;
  reviewStatus: ReviewStatus;
  catalogVersion: string;
  systemSelectedVideos: VideoId[];
  systemScoresByVideoId: Record<VideoId, number>;
  manuallyAddedVideos: VideoId[];
  manuallyRemovedVideos: VideoId[];
  finalVideoOrder: VideoId[];
  recommendedVideos: VideoId[];
  rationale: string;
  weeklyGuidance: WeeklyBlock[];
  overrideLog: OverrideEvent[];
  parentAssignmentToken?: string;
  sentAt?: string;
  tokenExpiresAt?: string;
  parentHelpFlags: VideoId[];
}

export function toVideoId(value: string): VideoId {
  return value as VideoId;
}
