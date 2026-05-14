import { z } from "zod";
import { errorResponse, requireAdmin } from "@/server/auth";
import { EmailSendError, sendAssignmentEmail } from "@/server/email";
import { createAssignmentToken, markAssignmentSent } from "@/server/store";

const SendSchema = z.object({
  contactId: z.string().uuid(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAdmin();
    const parsed = SendSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Contact is required" }, { status: 400 });
    const prepared = await createAssignmentToken(id, parsed.data.contactId);
    if (!prepared) return Response.json({ error: "Plan or contact not found" }, { status: 404 });
    const assignmentUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/assignment/${prepared.token.token}`;

    await sendAssignmentEmail({
      to: prepared.contact.email,
      firstName: prepared.contact.firstName,
      assignmentUrl,
    });

    const plan = await markAssignmentSent(id, prepared.token);
    if (!plan) return Response.json({ error: "Plan or contact not found" }, { status: 404 });
    const sent = { ...prepared, plan };
    return Response.json({
      assignmentUrl,
      sent,
    });
  } catch (error) {
    if (error instanceof EmailSendError) {
      return Response.json({ error: error.message }, { status: 502 });
    }
    return errorResponse(error);
  }
}
