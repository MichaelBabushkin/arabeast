import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ── NextAuth required tables ─────────────────────────────────────────────────

export const users = pgTable("users", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text("name"),
  email:         text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image:         text("image"),
  password:      text("password"), // null for OAuth-only accounts
  language:      text("language", { enum: ["en", "he"] }).notNull().default("en"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  userId:            text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              text("type").$type<AdapterAccountType>().notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        text("token_type"),
  scope:             text("scope"),
  id_token:          text("id_token"),
  session_state:     text("session_state"),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId:       text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull(),
  expires:    timestamp("expires", { mode: "date" }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })]);

// ── App tables ───────────────────────────────────────────────────────────────

export const wordProgress = pgTable("word_progress", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:       text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  wordId:       text("word_id").notNull(),
  timesCorrect: integer("times_correct").notNull().default(0),
  timesWrong:   integer("times_wrong").notNull().default(0),
  lastSeenAt:   timestamp("last_seen_at").notNull().defaultNow(),
  nextReviewAt: timestamp("next_review_at").notNull().defaultNow(),
}, (t) => [unique("word_progress_user_word").on(t.userId, t.wordId)]);

export const userProgress = pgTable("user_progress", {
  userId:         text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  xp:             integer("xp").notNull().default(0),
  streakDays:     integer("streak_days").notNull().default(0),
  lastPlayedAt:   timestamp("last_played_at"),
  completedChapters: text("completed_chapters").array().notNull().default([]),
});
