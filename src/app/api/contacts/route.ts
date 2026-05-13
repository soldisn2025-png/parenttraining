import { z } from "zod";
import { errorResponse, requireAdmin } from "@/server/auth";
import { deleteContact, listContacts, upsertContact } from "@/server/store";

const ContactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
});

export async function GET() {
  try {
    await requireAdmin();
    return Response.json({ contacts: await listContacts() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = ContactSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Valid first name and email required" }, { status: 400 });
    return Response.json({ contact: await upsertContact(parsed.data) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "Contact id required" }, { status: 400 });
    await deleteContact(id);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
