import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";
import { catalog } from "@/data/catalog";
import { assignmentTokens, auditEvents, generatedPlans, parentContacts, videoProgress } from "@/db/schema";
import { getAssignmentExpiry, normalizeEmail } from "@/lib/security";
import type { GeneratedPlan, OverrideEvent, VideoId } from "@/types/domain";
import { getDb } from "@/server/db";

export interface ParentContact {
  id: string;
  email: string;
  firstName: string;
  createdAt: string;
}

export interface AssignmentTokenRecord {
  id: string;
  planId: string;
  contactId: string;
  token: string;
  expiresAt: string;
  sentAt: string;
  invalidatedAt: string | null;
}

export interface VideoProgressRecord {
  tokenId: string;
  videoId: VideoId;
  watched: boolean;
  triedIt: boolean;
  needHelp: boolean;
  updatedAt: string;
}

const contacts = new Map<string, ParentContact>();
const plans = new Map<string, GeneratedPlan>();
const tokens = new Map<string, AssignmentTokenRecord>();
const progress = new Map<string, VideoProgressRecord>();

export async function listContacts() {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(parentContacts);
    return rows
      .map((row) => ({
        id: row.id,
        email: row.email,
        firstName: row.firstName,
        createdAt: row.createdAt.toISOString(),
      }))
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }
  return Array.from(contacts.values()).sort((a, b) => a.firstName.localeCompare(b.firstName));
}

export async function upsertContact(input: { firstName: string; email: string }) {
  const email = normalizeEmail(input.email);
  const db = getDb();
  if (db) {
    const [row] = await db
      .insert(parentContacts)
      .values({ email, firstName: input.firstName.trim() })
      .onConflictDoUpdate({
        target: parentContacts.email,
        set: { firstName: input.firstName.trim() },
      })
      .returning();
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      createdAt: row.createdAt.toISOString(),
    };
  }
  const existing = Array.from(contacts.values()).find((contact) => contact.email === email);
  if (existing) return existing;
  const contact: ParentContact = {
    id: crypto.randomUUID(),
    email,
    firstName: input.firstName.trim(),
    createdAt: new Date().toISOString(),
  };
  contacts.set(contact.id, contact);
  return contact;
}

export async function deleteContact(id: string) {
  const db = getDb();
  if (db) {
    await db.delete(parentContacts).where(eq(parentContacts.id, id));
    return;
  }
  contacts.delete(id);
}

export async function savePlan(plan: GeneratedPlan) {
  const db = getDb();
  if (db) {
    await db.insert(generatedPlans).values({
      id: plan.id,
      catalogVersion: plan.catalogVersion,
      promptHash: plan.promptHash,
      reviewStatus: plan.reviewStatus,
      systemSelectedVideos: plan.systemSelectedVideos,
      systemScores: plan.systemScoresByVideoId,
      manuallyAdded: plan.manuallyAddedVideos,
      manuallyRemoved: plan.manuallyRemovedVideos,
      finalVideoOrder: plan.finalVideoOrder,
      rationale: plan.rationale,
      weeklyGuidance: plan.weeklyGuidance,
    });
  }
  plans.set(plan.id, plan);
  return plan;
}

export async function getPlan(id: string) {
  const db = getDb();
  if (db) {
    const [row] = await db.select().from(generatedPlans).where(eq(generatedPlans.id, id));
    if (!row) return null;
    const events = await db.select().from(auditEvents).where(eq(auditEvents.planId, id));
    return planFromRow(row, events);
  }
  return plans.get(id) ?? null;
}

export async function listPlans() {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(generatedPlans);
    return rows
      .map((row) => planFromRow(row, []))
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }
  return Array.from(plans.values()).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

export async function updatePlan(id: string, updater: (plan: GeneratedPlan) => GeneratedPlan) {
  const plan = await getPlan(id);
  if (!plan) return null;
  const updated = updater(plan);
  const db = getDb();
  if (db) {
    await db
      .update(generatedPlans)
      .set({
        reviewStatus: updated.reviewStatus,
        manuallyAdded: updated.manuallyAddedVideos,
        manuallyRemoved: updated.manuallyRemovedVideos,
        finalVideoOrder: updated.finalVideoOrder,
        rationale: updated.rationale,
        weeklyGuidance: updated.weeklyGuidance,
        updatedAt: new Date(),
      })
      .where(eq(generatedPlans.id, id));
    const latest = updated.overrideLog.at(-1);
    if (latest && latest.timestamp !== plan.overrideLog.at(-1)?.timestamp) {
      await db.insert(auditEvents).values({
        planId: id,
        action: latest.action,
        videoId: latest.videoId,
        prevOrder: latest.previousOrder,
        nextOrder: latest.nextOrder,
        createdAt: new Date(latest.timestamp),
      });
    }
  }
  plans.set(id, updated);
  return updated;
}

export async function sendAssignment(planId: string, contactId: string) {
  const plan = await getPlan(planId);
  const contact = contacts.get(contactId);
  const db = getDb();
  const dbContact = db ? await getContact(contactId) : contact;
  if (!plan || !dbContact) return null;
  if (plan.reviewStatus !== "approved") return null;

  if (db) {
    await db
      .update(assignmentTokens)
      .set({ invalidatedAt: new Date() })
      .where(and(eq(assignmentTokens.contactId, contactId), isNull(assignmentTokens.invalidatedAt), gt(assignmentTokens.expiresAt, new Date())));
  } else {
    for (const token of Array.from(tokens.values())) {
      if (token.contactId === contactId && !token.invalidatedAt && new Date(token.expiresAt) > new Date()) {
        token.invalidatedAt = new Date().toISOString();
      }
    }
  }

  const token = crypto.randomUUID();
  const record: AssignmentTokenRecord = {
    id: crypto.randomUUID(),
    planId,
    contactId,
    token,
    expiresAt: getAssignmentExpiry().toISOString(),
    sentAt: new Date().toISOString(),
    invalidatedAt: null,
  };
  if (db) {
    await db.insert(assignmentTokens).values({
      id: record.id,
      planId,
      contactId,
      token,
      expiresAt: new Date(record.expiresAt),
      sentAt: new Date(record.sentAt),
    });
  } else {
    tokens.set(token, record);
  }

  const event: OverrideEvent = {
    timestamp: record.sentAt,
    action: "sent",
    videoId: null,
    previousOrder: null,
    nextOrder: plan.finalVideoOrder,
  };

  await updatePlan(planId, (current) => ({
    ...current,
    reviewStatus: "sent",
    parentAssignmentToken: token,
    tokenExpiresAt: record.expiresAt,
    sentAt: record.sentAt,
    overrideLog: [...current.overrideLog, event],
  }));

  return { token: record, contact: dbContact };
}

export async function getAssignmentByToken(token: string) {
  const db = getDb();
  if (db) {
    const [record] = await db.select().from(assignmentTokens).where(eq(assignmentTokens.token, token));
    if (!record || record.invalidatedAt || record.expiresAt <= new Date()) return null;
    const plan = await getPlan(record.planId);
    const contact = await getContact(record.contactId);
    if (!plan || !contact) return null;
    return {
      token: {
        id: record.id,
        planId: record.planId,
        contactId: record.contactId,
        token: record.token,
        expiresAt: record.expiresAt.toISOString(),
        sentAt: record.sentAt?.toISOString() ?? new Date().toISOString(),
        invalidatedAt: null,
      },
      plan,
      contact,
    };
  }
  const record = tokens.get(token);
  if (!record || record.invalidatedAt || new Date(record.expiresAt) <= new Date()) return null;
  const plan = await getPlan(record.planId);
  const contact = contacts.get(record.contactId);
  if (!plan || !contact) return null;
  return { token: record, plan, contact };
}

export async function getInvalidAssignmentReason(token: string) {
  const db = getDb();
  if (db) {
    const [record] = await db.select().from(assignmentTokens).where(eq(assignmentTokens.token, token));
    if (record?.invalidatedAt) return "updated";
    return "expired";
  }
  const record = tokens.get(token);
  if (record?.invalidatedAt) return "updated";
  return "expired";
}

export async function listProgressForToken(tokenId: string) {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(videoProgress).where(eq(videoProgress.tokenId, tokenId));
    return rows.map(progressFromRow);
  }
  return Array.from(progress.values()).filter((item) => item.tokenId === tokenId);
}

export async function updateProgress(token: string, videoId: VideoId, patch: Partial<Pick<VideoProgressRecord, "watched" | "triedIt" | "needHelp">>) {
  const assignment = await getAssignmentByToken(token);
  if (!assignment || !assignment.plan.finalVideoOrder.includes(videoId) || !catalog[videoId]) return null;
  const db = getDb();
  const key = `${assignment.token.id}:${videoId}`;
  const current = progress.get(key) ?? {
    tokenId: assignment.token.id,
    videoId,
    watched: false,
    triedIt: false,
    needHelp: false,
    updatedAt: new Date().toISOString(),
  };
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  if (db) {
    await db
      .insert(videoProgress)
      .values({
        tokenId: assignment.token.id,
        videoId,
        watched: updated.watched,
        triedIt: updated.triedIt,
        needHelp: updated.needHelp,
        updatedAt: new Date(updated.updatedAt),
      })
      .onConflictDoUpdate({
        target: [videoProgress.tokenId, videoProgress.videoId],
        set: {
          watched: updated.watched,
          triedIt: updated.triedIt,
          needHelp: updated.needHelp,
          updatedAt: new Date(updated.updatedAt),
        },
      });
  } else {
    progress.set(key, updated);
  }

  if (patch.needHelp) {
    await updatePlan(assignment.plan.id, (plan) => ({
      ...plan,
      parentHelpFlags: plan.parentHelpFlags.includes(videoId) ? plan.parentHelpFlags : [...plan.parentHelpFlags, videoId],
      overrideLog: [
        ...plan.overrideLog,
        {
          timestamp: updated.updatedAt,
          action: "parent_help_flagged",
          videoId,
          previousOrder: null,
          nextOrder: null,
        },
      ],
    }));
  }

  return updated;
}

export async function listProgressRows() {
  const db = getDb();
  const tokenRows: AssignmentTokenRecord[] = db
    ? (await db.select().from(assignmentTokens)).map((token) => ({
        id: token.id,
        planId: token.planId,
        contactId: token.contactId,
        token: token.token,
        expiresAt: token.expiresAt.toISOString(),
        sentAt: token.sentAt?.toISOString() ?? new Date().toISOString(),
        invalidatedAt: token.invalidatedAt?.toISOString() ?? null,
      }))
    : Array.from(tokens.values());
  const mapped = await Promise.all(tokenRows.map(async (token) => {
      const plan = await getPlan(token.planId);
      const contact = await getContact(token.contactId);
      const rows = await listProgressForToken(token.id);
      if (!plan || !contact) return null;
      return {
        token,
        plan,
        contact,
        progress: rows,
        watched: rows.filter((row) => row.watched).length,
        tried: rows.filter((row) => row.triedIt).length,
        needHelp: rows.filter((row) => row.needHelp).length,
        lastActive: rows.map((row) => row.updatedAt).sort().slice(-1)[0] ?? token.sentAt,
      };
    }));
  return mapped.filter(Boolean);
}

async function getContact(id: string) {
  const db = getDb();
  if (db) {
    const [row] = await db.select().from(parentContacts).where(eq(parentContacts.id, id));
    return row
      ? { id: row.id, email: row.email, firstName: row.firstName, createdAt: row.createdAt.toISOString() }
      : null;
  }
  return contacts.get(id) ?? null;
}

function planFromRow(row: typeof generatedPlans.$inferSelect, events: Array<typeof auditEvents.$inferSelect>): GeneratedPlan {
  const finalVideoOrder = row.finalVideoOrder as VideoId[];
  return {
    id: row.id,
    generatedAt: row.createdAt.toISOString(),
    promptHash: row.promptHash,
    reviewStatus: row.reviewStatus as GeneratedPlan["reviewStatus"],
    catalogVersion: row.catalogVersion,
    systemSelectedVideos: row.systemSelectedVideos as VideoId[],
    systemScoresByVideoId: row.systemScores as GeneratedPlan["systemScoresByVideoId"],
    manuallyAddedVideos: row.manuallyAdded as VideoId[],
    manuallyRemovedVideos: row.manuallyRemoved as VideoId[],
    finalVideoOrder,
    recommendedVideos: finalVideoOrder,
    rationale: row.rationale ?? "",
    weeklyGuidance: (row.weeklyGuidance ?? []) as GeneratedPlan["weeklyGuidance"],
    overrideLog: events.map((event) => ({
      timestamp: event.createdAt.toISOString(),
      action: event.action as OverrideEvent["action"],
      videoId: (event.videoId as VideoId | null) ?? null,
      previousOrder: event.prevOrder as VideoId[] | null,
      nextOrder: event.nextOrder as VideoId[] | null,
    })),
    parentHelpFlags: [],
  };
}

function progressFromRow(row: typeof videoProgress.$inferSelect): VideoProgressRecord {
  return {
    tokenId: row.tokenId,
    videoId: row.videoId as VideoId,
    watched: row.watched,
    triedIt: row.triedIt,
    needHelp: row.needHelp,
    updatedAt: row.updatedAt.toISOString(),
  };
}
