import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function hasDatabase() {
  return Boolean(getDatabaseUrl());
}

export function getDb() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  if (!client) {
    client = postgres(databaseUrl, {
      prepare: false,
      ssl: "require",
      connect_timeout: 10,
      max: 1,
    });
    db = drizzle(client, { schema });
  }
  return db;
}

function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
  return raw.trim().replace(/^['"]|['"]$/g, "");
}
