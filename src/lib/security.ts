import { createHash } from "crypto";

export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt, "utf8").digest("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getAssignmentExpiry(now = new Date()): Date {
  const days = Number(process.env.ASSIGNMENT_TOKEN_TTL_DAYS ?? "14");
  const expiry = new Date(now);
  expiry.setDate(expiry.getDate() + (Number.isFinite(days) && days > 0 ? days : 14));
  return expiry;
}
