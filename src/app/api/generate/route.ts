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
import { classifyDatabaseError, getErrorCauseMessage, getErrorMessage } from "@/server/errors";

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
    const category = classifyDatabaseError(error);
    const msg = getErrorMessage(error);
    const cause = getErrorCauseMessage(error);

    console.error("generate_plan_failed", {
      category,
      message: msg,
      cause,
    });

    if (category === "database_auth") {
      return Response.json(
        {
          error:
            "Database authentication failed. Check the DATABASE_URL value in Vercel.",
        },
        { status: 500 }
      );
    }

    if (category === "database_schema") {
      return Response.json(
        {
          error:
            "Database schema is not ready. Run the Drizzle migration against the production database.",
        },
        { status: 500 }
      );
    }

    if (category === "database_permission") {
      return Response.json(
        {
          error:
            "Database permission check failed. Verify the production database role/RLS setup.",
        },
        { status: 500 }
      );
    }

    return Response.json(
      { error: `Error [${category}]: ${msg}${cause ? ` — ${cause}` : ""}` },
      { status: 500 }
    );
  }
}
