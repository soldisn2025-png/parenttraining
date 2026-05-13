import { sql } from "drizzle-orm";
import {
  assignmentTokens,
  auditEvents,
  generatedPlans,
  parentContacts,
  videoProgress,
} from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { classifyDatabaseError, getErrorCauseMessage, getErrorMessage } from "@/server/errors";

export const dynamic = "force-dynamic";

type HealthCheck = {
  name: string;
  ok: boolean;
  category?: string;
  message?: string;
};

export async function GET() {
  const checks: HealthCheck[] = [];

  try {
    try {
      await requireAdmin();
      checks.push({ name: "admin_auth", ok: true });
    } catch (error) {
      checks.push({
        name: "admin_auth",
        ok: false,
        category: "auth",
        message: getErrorMessage(error),
      });
      console.error("db_health_auth_failed", {
        message: getErrorMessage(error),
        cause: getErrorCauseMessage(error),
      });
      return Response.json({ ok: false, configured: Boolean(process.env.DATABASE_URL), checks }, { status: 500 });
    }

    let db;
    try {
      db = getDb();
      checks.push({ name: "database_config", ok: Boolean(db) });
    } catch (error) {
      checks.push({
        name: "database_config",
        ok: false,
        category: classifyDatabaseError(error),
        message: getErrorCauseMessage(error) || getErrorMessage(error),
      });
      console.error("db_health_config_failed", {
        category: classifyDatabaseError(error),
        message: getErrorMessage(error),
        cause: getErrorCauseMessage(error),
      });
      return Response.json({ ok: false, configured: Boolean(process.env.DATABASE_URL), checks }, { status: 500 });
    }

    if (!db) {
      return Response.json({
        ok: false,
        configured: false,
        checks,
        hint: "DATABASE_URL is not configured.",
      });
    }

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
      console.error("db_health_connect_failed", {
        category: classifyDatabaseError(error),
        message: getErrorMessage(error),
        cause: getErrorCauseMessage(error),
      });
      return Response.json({ ok: false, configured: true, checks }, { status: 500 });
    }

    const tableChecks = [
      { name: "generated_plans_select", table: generatedPlans },
      { name: "parent_contacts_select", table: parentContacts },
      { name: "assignment_tokens_select", table: assignmentTokens },
      { name: "video_progress_select", table: videoProgress },
      { name: "audit_events_select", table: auditEvents },
    ];

    for (const check of tableChecks) {
      try {
        await db.select().from(check.table).limit(1);
        checks.push({ name: check.name, ok: true });
      } catch (error) {
        checks.push({
          name: check.name,
          ok: false,
          category: classifyDatabaseError(error),
          message: getErrorCauseMessage(error) || getErrorMessage(error),
        });
        console.error("db_health_table_failed", {
          tableCheck: check.name,
          category: classifyDatabaseError(error),
          message: getErrorMessage(error),
          cause: getErrorCauseMessage(error),
        });
        return Response.json({ ok: false, configured: true, checks }, { status: 500 });
      }
    }

    return Response.json({ ok: true, configured: true, checks });
  } catch (error) {
    console.error("db_health_unexpected_failed", {
      category: classifyDatabaseError(error),
      message: getErrorMessage(error),
      cause: getErrorCauseMessage(error),
    });
    return Response.json(
      {
        ok: false,
        configured: Boolean(process.env.DATABASE_URL),
        checks,
        error: "Database health check failed before completing diagnostics.",
        category: classifyDatabaseError(error),
        message: getErrorCauseMessage(error) || getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
