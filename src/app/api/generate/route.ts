import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { extractTags } from "@/lib/tags";
import { hashPrompt } from "@/lib/security";
import { createGeneratedPlan } from "@/lib/plan";
import { selectVideos } from "@/lib/matcher";
import { writePlanText } from "@/server/ai";
import { errorResponse, requireAdmin } from "@/server/auth";
import { checkRateLimit } from "@/server/rate-limit";
import { savePlan } from "@/server/store";

export const maxDuration = 30;

const GenerateSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { sessionId } = await auth();
    const rateKey = sessionId ?? "unknown";
    if (!checkRateLimit(`generate:${rateKey}`, 10, 24 * 60 * 60 * 1000)) {
      return Response.json({ error: "Daily generation limit reached" }, { status: 429 });
    }

    const body = GenerateSchema.safeParse(await request.json());
    if (!body.success) {
      return Response.json({ error: "Prompt must be 1-500 characters" }, { status: 400 });
    }

    const tags = extractTags(body.data.prompt);
    const scoredVideos = selectVideos(tags);
    const selectedVideos = scoredVideos.map((item) => item.video);
    const aiText = await writePlanText(selectedVideos);
    const plan = createGeneratedPlan({
      promptHash: hashPrompt(body.data.prompt),
      scoredVideos,
      rationale: aiText.rationale,
      weeklyGuidance: aiText.weeklyGuidance,
    });

    await savePlan(plan);
    return Response.json({ plan, extractedTags: tags });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    return Response.json({ error: msg, cause }, { status: 500 });
  }
}
