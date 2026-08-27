import {
  boolean,
  integer,
  pgSchema,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Isolated from other apps sharing this Postgres (e.g. Tower). */
export const travis = pgSchema("travis");

/** Cursor cloud agent binding per seat — data only, never SPA constants. */
export const agentBinding = travis.table("agent_binding", {
  id: uuid("id").defaultRandom().primaryKey(),
  seatKey: text("seat_key").notNull().unique(),
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
  /** Legacy — mirrors active_binding_id after SCP-002 */
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  defaultBindingId: uuid("default_binding_id")
    .notNull()
    .references(() => agentBinding.id),
  activeBindingId: uuid("active_binding_id")
    .notNull()
    .references(() => agentBinding.id),
  viewMode: text("view_mode").notNull().default("voice"),
  routerState: text("router_state").notNull().default("normal"),
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
  /** Legacy role — kept for 001 rows */
  role: text("role").notNull(),
  kind: text("kind").notNull().default("user"),
  seatKey: text("seat_key"),
  referenceTurnId: uuid("reference_turn_id"),
  speakable: boolean("speakable").notNull().default(true),
  thoughtStatus: text("thought_status"),
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

/** Waiting lines — session-scoped, per addressee. Not a voice_turn. */
export const queuedUtterance = travis.table("queued_utterance", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  seatKey: text("seat_key").notNull(),
  seq: integer("seq").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** At most one live Cursor run Travis knows about per binding. */
export const seatLiveRun = travis.table("seat_live_run", {
  bindingId: uuid("binding_id")
    .primaryKey()
    .references(() => agentBinding.id),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  cursorRunId: text("cursor_run_id").notNull(),
  userTurnId: uuid("user_turn_id").references(() => voiceTurn.id),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AgentBinding = typeof agentBinding.$inferSelect;
export type VoiceSession = typeof voiceSession.$inferSelect;
export type VoiceTurn = typeof voiceTurn.$inferSelect;
export type TurnConductorPhrase = typeof turnConductorPhrase.$inferSelect;
export type QueuedUtterance = typeof queuedUtterance.$inferSelect;
export type SeatLiveRun = typeof seatLiveRun.$inferSelect;

export type TurnKind =
  | "user"
  | "agent_thought"
  | "agent_post"
  | "status"
  | "travis_prompt";

export type SeatKey = "pm" | "sa" | "engineer";
