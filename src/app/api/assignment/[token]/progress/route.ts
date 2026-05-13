import { z } from "zod";
import { updateProgress } from "@/server/store";
import { toVideoId } from "@/types/domain";

const ProgressSchema = z.object({
  videoId: z.string().min(1),
  watched: z.boolean().optional(),
  triedIt: z.boolean().optional(),
  needHelp: z.boolean().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = ProgressSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid progress update" }, { status: 400 });
  const updated = await updateProgress(token, toVideoId(parsed.data.videoId), parsed.data);
  if (!updated) {
    return Response.json({ error: "This link has expired. Ask Kelly for a new one." }, { status: 404 });
  }
  return Response.json({ progress: updated });
}
