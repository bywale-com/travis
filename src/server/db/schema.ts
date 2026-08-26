import { boolean, integer, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Isolated from other apps sharing this Postgres (e.g. Tower). */
export const travis = pgSchema("travis");

/** Which Cursor cloud agent a Travis session talks to. Data only — never SPA constants. */
export const agentBinding = travis.table("agent_binding", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  cursorAgentId: text("cursor_agent_id").notNull().default(""),
  runtime: text("runtime").notNull().default("cloud"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const voiceSession = travis.table("voice_session", {
  id: uuid("id").defaultRandom().primaryKey(),
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  status: text("status").notNull().default("listening"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
});

export const voiceTurn = travis.table("voice_turn", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  seq: integer("seq").notNull(),
  role: text("role").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const turnConductorPhrase = travis.table("turn_conductor_phrase", {
  id: uuid("id").defaultRandom().primaryKey(),
  phrase: text("phrase").notNull(),
  active: boolean("active").notNull().default(true),
});

export type AgentBinding = typeof agentBinding.$inferSelect;
export type VoiceSession = typeof voiceSession.$inferSelect;
export type VoiceTurn = typeof voiceTurn.$inferSelect;
export type TurnConductorPhrase = typeof turnConductorPhrase.$inferSelect;
