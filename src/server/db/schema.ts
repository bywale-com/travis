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
  /** Mode B only: talk = current log listen; type = composer. */
  logSubmode: text("log_submode").notNull().default("talk"),
  routerState: text("router_state").notNull().default("normal"),
  status: text("status").notNull().default("listening"),
  /** Stand-in identity until a real user. Empty = do not resume. */
  clientIp: text("client_ip").notNull().default(""),
  /** Gemini Live resume handle. Empty on open. Clear on End. */
  travisLiveHandle: text("travis_live_handle"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  title: text("title").notNull().default(""),
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
  /** SCP-008 — founding user, pass-on user, answering agent_post. FK is SQL. */
  initiativeId: uuid("initiative_id"),
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
  /** SCP-008 — drain stamps the same ticket. FK is SQL. */
  initiativeId: uuid("initiative_id"),
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

export const roomMembership = travis.table("room_membership", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  leftAt: timestamp("left_at", { withTimezone: true }),
});

/** SCP-008 — one ticket. Founding line is founding_turn_id. */
export const initiative = travis.table("initiative", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  foundingTurnId: uuid("founding_turn_id")
    .notNull()
    .unique()
    .references(() => voiceTurn.id),
  source: text("source").notNull(),
  status: text("status").notNull().default("open"),
  /** SCP-010 — catalog name. First write = harness clip. */
  title: text("title").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

/** SCP-009 — files/images hung on a stamped agent_post. Bytes stay at Cursor. */
export const turnArtifact = travis.table("turn_artifact", {
  id: uuid("id").defaultRandom().primaryKey(),
  turnId: uuid("turn_id")
    .notNull()
    .references(() => voiceTurn.id),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  kind: text("kind").notNull(),
  path: text("path").notNull(),
  filename: text("filename").notNull(),
  sizeBytes: integer("size_bytes"),
  cursorUpdatedAt: timestamp("cursor_updated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AgentBinding = typeof agentBinding.$inferSelect;
export type VoiceSession = typeof voiceSession.$inferSelect;
export type VoiceTurn = typeof voiceTurn.$inferSelect;
export type TurnConductorPhrase = typeof turnConductorPhrase.$inferSelect;
export type QueuedUtterance = typeof queuedUtterance.$inferSelect;
export type SeatLiveRun = typeof seatLiveRun.$inferSelect;
export type RoomMembership = typeof roomMembership.$inferSelect;
export type MembershipRole = "member" | "facilitator";
export type Initiative = typeof initiative.$inferSelect;
export type InitiativeSource = "via_travis" | "hold";
export type InitiativeStatus = "open" | "done";
export type TurnArtifact = typeof turnArtifact.$inferSelect;
export type ArtifactKind = "image" | "file";

export type TurnKind =
  | "user"
  | "agent_thought"
  | "agent_post"
  | "status"
  | "travis_prompt";

export type SeatKey = "pm" | "sa" | "engineer" | "travis";
