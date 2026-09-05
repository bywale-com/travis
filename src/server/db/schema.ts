import {
  boolean,
  integer,
  jsonb,
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
  /** SCP-015 — house path when seated. Empty = created, not seated. */
  protocolPath: text("protocol_path").notNull().default(""),
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
  /** Telemetry only. Do not key list or resume to this. */
  clientIp: text("client_ip").notNull().default(""),
  /** Operator who owns the room. Null only on rows not yet backfilled. */
  operatorId: uuid("operator_id"),
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

/** SCP-013 — Travis process. Ordered tool sequence. Not a ticket. */
export const motion = travis.table("motion", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  title: text("title").notNull(),
  status: text("status").notNull(),
  foundingTurnId: uuid("founding_turn_id").references(() => voiceTurn.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

/** SCP-023 — dest is a job he watches and takes back. */
export const destJob = travis.table("dest_job", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  initiativeId: uuid("initiative_id").references(() => initiative.id),
  userTurnId: uuid("user_turn_id").references(() => voiceTurn.id),
  parentId: uuid("parent_id"),
  payload: jsonb("payload").$type<{ text: string; done?: string }>().notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  timeoutMs: integer("timeout_ms").notNull().default(120000),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
});

/** SCP-024 — one working episode. Live vs completed is this row. */
export const stream = travis.table("stream", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  triggerTurnId: uuid("trigger_turn_id")
    .notNull()
    .references(() => voiceTurn.id),
  closeTurnId: uuid("close_turn_id").references(() => voiceTurn.id),
  destJobId: uuid("dest_job_id").references(() => destJob.id),
  motionId: uuid("motion_id").references(() => motion.id),
  cursorRunId: text("cursor_run_id").notNull().default(""),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const streamEvent = travis.table("stream_event", {
  id: uuid("id").defaultRandom().primaryKey(),
  streamId: uuid("stream_id")
    .notNull()
    .references(() => stream.id),
  seq: integer("seq").notNull(),
  kind: text("kind").notNull(),
  body: text("body").notNull().default(""),
  tool: text("tool").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const motionStep = travis.table("motion_step", {
  id: uuid("id").defaultRandom().primaryKey(),
  motionId: uuid("motion_id")
    .notNull()
    .references(() => motion.id),
  seq: integer("seq").notNull(),
  tool: text("tool").notNull(),
  args: text("args").notNull(),
  status: text("status").notNull(),
  resultText: text("result_text").notNull().default(""),
  startedAt: timestamp("started_at", { withTimezone: true }),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

/** SCP-012 — OS house. Protocols and templates. No session_id. */
export const osNode = travis.table("os_node", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  path: text("path").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  body: text("body").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  writerBindingId: uuid("writer_binding_id").references(() => agentBinding.id),
});

/** Allowlisted operator — email that already has an account. No signup. */
export const operator = travis.table("operator", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  /** Durable personal enter token. Resend emails this same secret. */
  loginToken: text("login_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AgentBinding = typeof agentBinding.$inferSelect;
export type Operator = typeof operator.$inferSelect;
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
export type OsNode = typeof osNode.$inferSelect;
export type OsNodeKind = "dir" | "file";
export type Motion = typeof motion.$inferSelect;
export type MotionStep = typeof motionStep.$inferSelect;
export type DestJob = typeof destJob.$inferSelect;
export type DestJobStatus =
  | "created"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "failed"
  | "timed_out";
export type Stream = typeof stream.$inferSelect;
export type StreamEvent = typeof streamEvent.$inferSelect;
export type StreamStatus = "live" | "completed" | "failed";
export type StreamEventKind = "message" | "process" | "thought";

export type TurnKind =
  | "user"
  | "agent_thought"
  | "agent_post"
  | "status"
  | "travis_prompt";

export type SeatKey = "pm" | "sa" | "engineer" | "travis";
