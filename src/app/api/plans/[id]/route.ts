import { z } from "zod";
import { assertWithinVideoCap, transitionStatus } from "@/lib/plan";
import { errorResponse, requireAdmin } from "@/server/auth";
import { getPlan, updatePlan } from "@/server/store";
import { toVideoId } from "@/types/domain";

const PatchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("remove"), videoId: z.string().min(1) }),
  z.object({ action: z.literal("add"), videoId: z.string().min(1) }),
  z.object({ action: z.literal("reorder"), finalVideoOrder: z.array(z.string()).min(1).max(5) }),
  z.object({ action: z.literal("rationale"), rationale: z.string().max(4000) }),
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reopen") }),
]);

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAdmin();
    const plan = await getPlan(id);
    if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });
    return Response.json({ plan });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAdmin();
    const parsed = PatchSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid plan update" }, { status: 400 });
    const now = new Date().toISOString();

    const updated = await updatePlan(id, (plan) => {
      if (plan.reviewStatus === "approved" && !["reopen"].includes(parsed.data.action)) {
        throw new Error("Reopen this plan before editing");
      }

      if (parsed.data.action === "remove") {
        const videoId = toVideoId(parsed.data.videoId);
        const nextOrder = plan.finalVideoOrder.filter((id) => id !== videoId);
        return {
          ...plan,
          reviewStatus: transitionStatus(plan.reviewStatus, "edit"),
          manuallyRemovedVideos: plan.manuallyRemovedVideos.includes(videoId)
            ? plan.manuallyRemovedVideos
            : [...plan.manuallyRemovedVideos, videoId],
          finalVideoOrder: nextOrder,
          recommendedVideos: nextOrder,
          overrideLog: [
            ...plan.overrideLog,
            { timestamp: now, action: "removed", videoId, previousOrder: plan.finalVideoOrder, nextOrder },
          ],
        };
      }

      if (parsed.data.action === "add") {
        const videoId = toVideoId(parsed.data.videoId);
        if (plan.finalVideoOrder.includes(videoId)) return plan;
        const nextOrder = [...plan.finalVideoOrder, videoId];
        assertWithinVideoCap(nextOrder);
        const isSystemVideo = plan.systemSelectedVideos.includes(videoId);
        return {
          ...plan,
          reviewStatus: transitionStatus(plan.reviewStatus, "edit"),
          manuallyAddedVideos: isSystemVideo || plan.manuallyAddedVideos.includes(videoId)
            ? plan.manuallyAddedVideos
            : [...plan.manuallyAddedVideos, videoId],
          manuallyRemovedVideos: plan.manuallyRemovedVideos.filter((id) => id !== videoId),
          finalVideoOrder: nextOrder,
          recommendedVideos: nextOrder,
          overrideLog: [
            ...plan.overrideLog,
            { timestamp: now, action: "added", videoId, previousOrder: plan.finalVideoOrder, nextOrder },
          ],
        };
      }

      if (parsed.data.action === "reorder") {
        const nextOrder = parsed.data.finalVideoOrder.map(toVideoId);
        assertWithinVideoCap(nextOrder);
        return {
          ...plan,
          reviewStatus: transitionStatus(plan.reviewStatus, "edit"),
          finalVideoOrder: nextOrder,
          recommendedVideos: nextOrder,
          overrideLog: [
            ...plan.overrideLog,
            { timestamp: now, action: "reordered", videoId: null, previousOrder: plan.finalVideoOrder, nextOrder },
          ],
        };
      }

      if (parsed.data.action === "rationale") {
        return {
          ...plan,
          rationale: parsed.data.rationale,
          reviewStatus: transitionStatus(plan.reviewStatus, "edit"),
          overrideLog: [
            ...plan.overrideLog,
            { timestamp: now, action: "rationale_edited", videoId: null, previousOrder: null, nextOrder: null },
          ],
        };
      }

      if (parsed.data.action === "approve") {
        return {
          ...plan,
          reviewStatus: transitionStatus(plan.reviewStatus, "approve"),
          overrideLog: [
            ...plan.overrideLog,
            { timestamp: now, action: "approved", videoId: null, previousOrder: null, nextOrder: plan.finalVideoOrder },
          ],
        };
      }

      return {
        ...plan,
        reviewStatus: transitionStatus(plan.reviewStatus, "reopen"),
        overrideLog: [
          ...plan.overrideLog,
          { timestamp: now, action: "reopened", videoId: null, previousOrder: null, nextOrder: plan.finalVideoOrder },
        ],
      };
    });

    if (!updated) return Response.json({ error: "Plan not found" }, { status: 404 });
    return Response.json({ plan: updated });
  } catch (error) {
    if (error instanceof Error) return Response.json({ error: error.message }, { status: 400 });
    return errorResponse(error);
  }
}
