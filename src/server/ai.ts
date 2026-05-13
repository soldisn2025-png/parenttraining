import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { Video, WeeklyBlock } from "@/types/domain";

export interface AiPlanText {
  rationale: string;
  weeklyGuidance: WeeklyBlock[];
}

export async function writePlanText(videos: Video[]): Promise<AiPlanText> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackPlanText(videos);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system:
      "You are a clinical writer for an ABA parent training program. Write clear English. Never invent video content. Do not include identifying information. Return valid JSON with rationale and weeklyGuidance.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          videos: videos.map((video) => ({
            id: video.id,
            title: video.title,
            keyPoints: video.keyPoints,
            homePractice: video.homePractice,
          })),
        }),
      },
    ],
  });

  const text = response.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");

  try {
    return JSON.parse(text) as AiPlanText;
  } catch {
    return fallbackPlanText(videos);
  }
}

export function fallbackPlanText(videos: Video[]): AiPlanText {
  return {
    rationale: videos
      .map((video) => `${video.title}: This is a short, practical place to start because it gives the parent one clear action to try at home.`)
      .join("\n\n"),
    weeklyGuidance: [
      {
        week: 1,
        focus: "Start small",
        videos: videos.map((video) => video.id),
        practiceGoal: "Watch the videos and try one short practice moment each day.",
      },
      { week: 2, focus: "Repeat what worked", videos: videos.map((video) => video.id), practiceGoal: "Use the same routine again so it feels familiar." },
      { week: 3, focus: "Try another routine", videos: videos.map((video) => video.id), practiceGoal: "Practice in one new daily moment." },
      { week: 4, focus: "Bring questions", videos: videos.map((video) => video.id), practiceGoal: "Tell Kelly what felt easy and what needs more help." },
    ],
  };
}
