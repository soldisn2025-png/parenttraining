import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const parentContacts = pgTable(
  "parent_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    firstName: text("first_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("parent_contacts_email_idx").on(table.email),
  })
);

export const generatedPlans = pgTable("generated_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  catalogVersion: text("catalog_version").notNull(),
  promptHash: text("prompt_hash").notNull(),
  reviewStatus: text("review_status").notNull(),
  systemSelectedVideos: text("system_selected_videos").array().notNull(),
  systemScores: jsonb("system_scores").notNull(),
  manuallyAdded: text("manually_added").array().notNull().default([]),
  manuallyRemoved: text("manually_removed").array().notNull().default([]),
  finalVideoOrder: text("final_video_order").array().notNull(),
  rationale: text("rationale"),
  weeklyGuidance: jsonb("weekly_guidance"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const assignmentTokens = pgTable(
  "assignment_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => generatedPlans.id),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => parentContacts.id),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    invalidatedAt: timestamp("invalidated_at", { withTimezone: true }),
  },
  (table) => ({
    tokenIdx: uniqueIndex("assignment_tokens_token_idx").on(table.token),
  })
);

export const videoProgress = pgTable(
  "video_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenId: uuid("token_id")
      .notNull()
      .references(() => assignmentTokens.id),
    videoId: text("video_id").notNull(),
    watched: boolean("watched").notNull().default(false),
    triedIt: boolean("tried_it").notNull().default(false),
    needHelp: boolean("need_help").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenVideoIdx: uniqueIndex("video_progress_token_video_idx").on(table.tokenId, table.videoId),
  })
);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => generatedPlans.id),
  action: text("action").notNull(),
  videoId: text("video_id"),
  prevOrder: text("prev_order").array(),
  nextOrder: text("next_order").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
