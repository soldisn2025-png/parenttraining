import { z } from "zod";
import { errorResponse, requireAdmin } from "@/server/auth";
import { sendAssignment } from "@/server/store";

const SendSchema = z.object({
  contactId: z.string().uuid(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAdmin();
    const parsed = SendSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Contact is required" }, { status: 400 });
    const sent = await sendAssignment(id, parsed.data.contactId);
    if (!sent) return Response.json({ error: "Plan or contact not found" }, { status: 404 });
    return Response.json({
      assignmentUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/assignment/${sent.token.token}`,
      sent,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
