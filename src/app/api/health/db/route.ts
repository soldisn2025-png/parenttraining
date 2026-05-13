import { sql } from "drizzle-orm";
import { requireAdmin, errorResponse } from "@/server/auth";
import { getDb } from "@/server/db";
import { classifyDatabaseError, getErrorCauseMessage, getErrorMessage } from "@/server/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    if (!db) {
      return Response.json({
        ok: false,
        configured: false,
        checks: [],
        hint: "DATABASE_URL is not configured.",
      });
    }

    const checks = [];

    try {
      await db.execute(sql`select 1`);
      checks.push({ name: "connect", ok: true });
    } catch (error) {
      checks.push({
        name: "connect",
        ok: false,
        category: classifyDatabaseError(error),
        message: getErrorCauseMessage(error) || getErrorMessage(error),
      });
      return Response.json({ ok: false, configured: true, checks }, { status: 500 });
    }

    try {
      await db.execute(sql`select id from generated_plans limit 1`);
      checks.push({ name: "generated_plans_select", ok: true });
    } catch (error) {
      checks.push({
        name: "generated_plans_select",
        ok: false,
        category: classifyDatabaseError(error),
        message: getErrorCauseMessage(error) || getErrorMessage(error),
      });
      return Response.json({ ok: false, configured: true, checks }, { status: 500 });
    }

    return Response.json({ ok: true, configured: true, checks });
  } catch (error) {
    return errorResponse(error);
  }
}
