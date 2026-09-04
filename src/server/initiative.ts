/**
 * SCP-008 — initiative store. Engineer pastes; no leftover analysis.
 *
 * Via-Travis only on Travis pass-on. Hold is HTTP. Done is a write.
 * Requests stays kind=user.
 */

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { formatLandedFiles } from "@/lib/artifact-kind";
import {
  catalogNeedleHits,
  clipInitiativeTitle,
  pathBasename,
} from "@/lib/initiative-title";
import {
  canonicalPosts,
  deriveNext,
  litSeatKeys,
  type InitiativeAttachment,
} from "@/lib/initiative";
import {
  parseRequestWhen,
  requestInWindow,
  requestWindowStart,
  type RequestWhen,
} from "@/lib/request-log";
import { attachmentsForInitiative } from "@/server/artifacts";
import { isCursorSeat } from "@/lib/seats";
import { db } from "@/server/db/client";
import {
  initiative,
  queuedUtterance,
  voiceSession,
  voiceTurn,
  type Initiative,
  type InitiativeSource,
  type InitiativeStatus,
} from "@/server/db/schema";

let initiativeStoreReady = false;

/** Same isolate-once DDL as 045 membership. Live DB had no 008 columns. */
export async function ensureInitiativeStore(): Promise<void> {
  if (initiativeStoreReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.initiative (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      founding_turn_id uuid NOT NULL REFERENCES travis.voice_turn(id),
      source text NOT NULL,
      status text NOT NULL DEFAULT 'open',
      created_at timestamptz NOT NULL DEFAULT now(),
      done_at timestamptz,
      title text NOT NULL DEFAULT '',
      CONSTRAINT initiative_source_chk
        CHECK (source IN ('via_travis', 'hold')),
      CONSTRAINT initiative_status_chk
        CHECK (status IN ('open', 'done')),
      CONSTRAINT initiative_done_at_chk
        CHECK (
          (status = 'open' AND done_at IS NULL)
          OR (status = 'done' AND done_at IS NOT NULL)
        ),
      CONSTRAINT initiative_founding_uniq UNIQUE (founding_turn_id)
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS initiative_open_by_session
      ON travis.initiative (session_id)
      WHERE status = 'open'
  `);
  await db.execute(sql`
    ALTER TABLE travis.voice_turn
      ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES travis.initiative(id)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS voice_turn_initiative_idx
      ON travis.voice_turn (initiative_id)
      WHERE initiative_id IS NOT NULL
  `);
  await db.execute(sql`
    ALTER TABLE travis.queued_utterance
      ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES travis.initiative(id)
  `);
  await db.execute(sql`
    ALTER TABLE travis.initiative
      ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT ''
  `);
  await backfillEmptyTitles();
  initiativeStoreReady = true;
}

async function backfillEmptyTitles(): Promise<void> {
  const empties = await db
    .select({
      id: initiative.id,
      foundingTurnId: initiative.foundingTurnId,
    })
    .from(initiative)
    .where(eq(initiative.title, ""));
  for (const row of empties) {
    const [founding] = await db
      .select({ text: voiceTurn.text })
      .from(voiceTurn)
      .where(eq(voiceTurn.id, row.foundingTurnId))
      .limit(1);
    const title = clipInitiativeTitle(founding?.text ?? "");
    if (!title) continue;
    await db
      .update(initiative)
      .set({ title })
      .where(eq(initiative.id, row.id));
  }
}

export class InitiativeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "InitiativeError";
  }
}

export const HOLD_FEED_PREFIX =
  "The founder promoted this line to an initiative. Orchestrate it to done.\n\n";

async function getInitiative(id: string): Promise<Initiative | null> {
  const [row] = await db
    .select()
    .from(initiative)
    .where(eq(initiative.id, id))
    .limit(1);
  return row ?? null;
}

export async function latestTravisUserTurn(sessionId: string) {
  const [row] = await db
    .select()
    .from(voiceTurn)
    .where(
      and(
        eq(voiceTurn.sessionId, sessionId),
        eq(voiceTurn.kind, "user"),
        eq(voiceTurn.seatKey, "travis"),
      ),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  return row ?? null;
}

async function insertOpen(
  sessionId: string,
  foundingTurnId: string,
  source: InitiativeSource,
): Promise<Initiative> {
  const [founding] = await db
    .select({ text: voiceTurn.text })
    .from(voiceTurn)
    .where(eq(voiceTurn.id, foundingTurnId))
    .limit(1);
  const [row] = await db
    .insert(initiative)
    .values({
      sessionId,
      foundingTurnId,
      source,
      status: "open",
      title: clipInitiativeTitle(founding?.text ?? ""),
    })
    .returning();
  await stampTurn(foundingTurnId, row.id);
  return row;
}

export async function stampTurn(
  turnId: string,
  initiativeId: string,
): Promise<void> {
  await db
    .update(voiceTurn)
    .set({ initiativeId })
    .where(eq(voiceTurn.id, turnId));
}

export async function stampQueued(
  queuedId: string,
  initiativeId: string,
): Promise<void> {
  await db
    .update(queuedUtterance)
    .set({ initiativeId })
    .where(eq(queuedUtterance.id, queuedId));
}

export async function initiativeIdForTurn(
  turnId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ initiativeId: voiceTurn.initiativeId })
    .from(voiceTurn)
    .where(eq(voiceTurn.id, turnId))
    .limit(1);
  return row?.initiativeId ?? null;
}

/**
 * Latest founder→Travis line, or null if Travis is passing on
 * without one (founding becomes the pass-on row).
 */
export async function ensureViaTravis(
  sessionId: string,
): Promise<Initiative | null> {
  await ensureInitiativeStore();
  const founding = await latestTravisUserTurn(sessionId);
  if (!founding) return null;
  if (founding.initiativeId) {
    return getInitiative(founding.initiativeId);
  }
  return insertOpen(sessionId, founding.id, "via_travis");
}

/** No Travis founding line — the pass-on user row is the ticket. */
export async function ensureOnPassOn(
  sessionId: string,
  passOnTurnId: string,
): Promise<Initiative> {
  await ensureInitiativeStore();
  const prior = await ensureViaTravis(sessionId);
  if (prior) {
    await stampTurn(passOnTurnId, prior.id);
    return prior;
  }
  const [existing] = await db
    .select()
    .from(voiceTurn)
    .where(eq(voiceTurn.id, passOnTurnId))
    .limit(1);
  if (existing?.initiativeId) {
    const row = await getInitiative(existing.initiativeId);
    if (row) return row;
  }
  return insertOpen(sessionId, passOnTurnId, "via_travis");
}

export async function stampPassOn(
  sessionId: string,
  params: { userTurnId?: string | null; queuedId?: string | null },
): Promise<Initiative | null> {
  let row = await ensureViaTravis(sessionId);
  if (!row && params.userTurnId) {
    row = await ensureOnPassOn(sessionId, params.userTurnId);
  }
  if (!row) return null;
  if (params.userTurnId) await stampTurn(params.userTurnId, row.id);
  if (params.queuedId) await stampQueued(params.queuedId, row.id);
  return row;
}

/** After a Travis send/dispatch: stamp the dest user row and any waiting line. */
export async function stampLatestPassOn(
  sessionId: string,
  seatKey: string,
  text: string,
): Promise<Initiative | null> {
  const [user] = await db
    .select()
    .from(voiceTurn)
    .where(
      and(
        eq(voiceTurn.sessionId, sessionId),
        eq(voiceTurn.kind, "user"),
        eq(voiceTurn.seatKey, seatKey),
        eq(voiceTurn.text, text),
      ),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  const [queued] = await db
    .select()
    .from(queuedUtterance)
    .where(
      and(
        eq(queuedUtterance.sessionId, sessionId),
        eq(queuedUtterance.seatKey, seatKey),
        eq(queuedUtterance.text, text),
      ),
    )
    .orderBy(desc(queuedUtterance.seq))
    .limit(1);
  return stampPassOn(sessionId, {
    userTurnId: user?.id,
    queuedId: queued?.id,
  });
}

async function requireOpenSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);
  if (!session) throw new InitiativeError("Session not found", 404);
  if (session.status === "ended") {
    throw new InitiativeError("Session ended", 400);
  }
  return session;
}

export async function holdInitiative(
  sessionId: string,
  foundingTurnId: string,
): Promise<Initiative> {
  await ensureInitiativeStore();
  await requireOpenSession(sessionId);
  const [turn] = await db
    .select()
    .from(voiceTurn)
    .where(eq(voiceTurn.id, foundingTurnId))
    .limit(1);
  if (!turn || turn.sessionId !== sessionId) {
    throw new InitiativeError("Turn not found", 404);
  }
  if (turn.kind !== "user") {
    throw new InitiativeError("Only a founder line can become an initiative", 400);
  }
  if (turn.initiativeId) {
    throw new InitiativeError("Already on a ticket", 409);
  }
  return insertOpen(sessionId, turn.id, "hold");
}

export async function renameInitiative(
  sessionId: string,
  initiativeId: string,
  rawTitle: string,
): Promise<Initiative> {
  await ensureInitiativeStore();
  const row = await getInitiative(initiativeId);
  if (!row || row.sessionId !== sessionId) {
    throw new InitiativeError("Initiative not found", 404);
  }
  const trimmed = String(rawTitle ?? "").trim();
  if (!trimmed) {
    throw new InitiativeError("Title required", 400);
  }
  const title = clipInitiativeTitle(trimmed);
  if (!title) {
    throw new InitiativeError("Title required", 400);
  }
  const [updated] = await db
    .update(initiative)
    .set({ title })
    .where(eq(initiative.id, initiativeId))
    .returning();
  return updated;
}

export async function markInitiativeDone(
  sessionId: string,
  initiativeId: string,
): Promise<Initiative> {
  await ensureInitiativeStore();
  const row = await getInitiative(initiativeId);
  if (!row || row.sessionId !== sessionId) {
    throw new InitiativeError("Initiative not found", 404);
  }
  if (row.status === "done") {
    throw new InitiativeError("Already done", 409);
  }
  const [updated] = await db
    .update(initiative)
    .set({ status: "done", doneAt: new Date() })
    .where(eq(initiative.id, initiativeId))
    .returning();
  return updated;
}

type TicketTurn = {
  id: string;
  seq: number;
  kind: string;
  seatKey: string | null;
  text: string;
  createdAt: Date;
  referenceTurnId: string | null;
};

async function turnsForInitiative(initiativeId: string): Promise<TicketTurn[]> {
  return db
    .select({
      id: voiceTurn.id,
      seq: voiceTurn.seq,
      kind: voiceTurn.kind,
      seatKey: voiceTurn.seatKey,
      text: voiceTurn.text,
      createdAt: voiceTurn.createdAt,
      referenceTurnId: voiceTurn.referenceTurnId,
    })
    .from(voiceTurn)
    .where(eq(voiceTurn.initiativeId, initiativeId))
    .orderBy(asc(voiceTurn.seq));
}

function nextOf(
  row: Initiative,
  turns: TicketTurn[],
): "travis" | "pm" | "sa" | "engineer" | null {
  return deriveNext({
    status: row.status as InitiativeStatus,
    legs: turns.filter((t) => t.kind === "user"),
    posts: turns.filter((t) => t.kind === "agent_post"),
  });
}

export type InitiativeListItem = {
  id: string;
  title: string;
  foundingText: string;
  status: string;
  createdAt: Date;
  doneAt: Date | null;
  source: string;
  litSeatKeys: string[];
  next: ReturnType<typeof deriveNext>;
};

export type ListInitiativesOpts = {
  status?: InitiativeStatus | "all";
  when?: RequestWhen;
  q?: string;
};

async function artifactNamesForInitiative(
  initiativeId: string,
): Promise<string[]> {
  try {
    const raw = await db.execute(sql`
      SELECT a.filename, a.path
      FROM travis.turn_artifact a
      INNER JOIN travis.voice_turn t ON t.id = a.turn_id
      WHERE t.initiative_id = ${initiativeId}::uuid
    `);
    const list = (
      Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object" && Array.isArray((raw as { rows?: unknown }).rows)
          ? (raw as { rows: unknown[] }).rows
          : []
    ) as Array<{ filename?: string; path?: string }>;
    const names: string[] = [];
    for (const row of list) {
      if (typeof row.filename === "string" && row.filename.trim()) {
        names.push(row.filename);
      }
      if (typeof row.path === "string" && row.path.trim()) {
        names.push(pathBasename(row.path));
      }
    }
    return names;
  } catch {
    return [];
  }
}

export async function listInitiatives(
  sessionId: string,
  opts: ListInitiativesOpts | InitiativeStatus | "all" = {},
): Promise<InitiativeListItem[]> {
  await ensureInitiativeStore();
  const parsed: ListInitiativesOpts =
    typeof opts === "string" ? { status: opts } : opts;
  const status = parsed.status ?? "open";
  const when = parseRequestWhen(parsed.when ?? "all");
  const q = typeof parsed.q === "string" ? parsed.q : "";
  const rows =
    status === "all"
      ? await db
          .select()
          .from(initiative)
          .where(eq(initiative.sessionId, sessionId))
          .orderBy(desc(initiative.createdAt))
      : await db
          .select()
          .from(initiative)
          .where(
            and(
              eq(initiative.sessionId, sessionId),
              eq(initiative.status, status),
            ),
          )
          .orderBy(desc(initiative.createdAt));

  const out: InitiativeListItem[] = [];
  for (const row of rows) {
    if (!requestInWindow(row.createdAt, requestWindowStart(when))) {
      continue;
    }
    const turns = await turnsForInitiative(row.id);
    const [founding] = turns.filter((t) => t.id === row.foundingTurnId);
    const posts = turns.filter((t) => t.kind === "agent_post");
    if (q.trim()) {
      const messages = turns
        .filter((t) => t.kind === "user" || t.kind === "agent_post")
        .map((t) => t.text);
      const files = await artifactNamesForInitiative(row.id);
      if (
        !catalogNeedleHits(q, [
          row.title,
          founding?.text ?? "",
          ...messages,
          ...files,
        ])
      ) {
        continue;
      }
    }
    out.push({
      id: row.id,
      title: row.title,
      foundingText: founding?.text ?? "",
      status: row.status,
      createdAt: row.createdAt,
      doneAt: row.doneAt,
      source: row.source,
      litSeatKeys: litSeatKeys(posts),
      next: nextOf(row, turns),
    });
  }
  return out;
}

export type InitiativeRead = {
  id: string;
  title: string;
  status: string;
  source: string;
  createdAt: Date;
  doneAt: Date | null;
  founding: {
    id: string;
    text: string;
    seatKey: string | null;
    createdAt: Date;
  } | null;
  posts: Array<{
    id: string;
    seatKey: string | null;
    text: string;
    createdAt: Date;
  }>;
  next: ReturnType<typeof deriveNext>;
  attachments: InitiativeAttachment[];
};

export async function readInitiative(
  sessionId: string,
  initiativeId: string,
): Promise<InitiativeRead> {
  await ensureInitiativeStore();
  const row = await getInitiative(initiativeId);
  if (!row || row.sessionId !== sessionId) {
    throw new InitiativeError("Initiative not found", 404);
  }
  const turns = await turnsForInitiative(row.id);
  const founding = turns.find((t) => t.id === row.foundingTurnId) ?? null;
  const posts = canonicalPosts(
    turns.filter((t) => t.kind === "agent_post" && isCursorSeat(t.seatKey)),
  );
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt,
    doneAt: row.doneAt,
    founding: founding
      ? {
          id: founding.id,
          text: founding.text,
          seatKey: founding.seatKey,
          createdAt: founding.createdAt,
        }
      : null,
    posts: posts.map((p) => ({
      id: p.id,
      seatKey: p.seatKey,
      text: p.text,
      createdAt: p.createdAt,
    })),
    next: nextOf(row, turns),
    attachments: await attachmentsForInitiative(row.id),
  };
}

export async function glanceOpenInitiatives(
  sessionId: string,
): Promise<{ titles: string[]; openCount: number }> {
  await ensureInitiativeStore();
  const rows = await db
    .select({ title: initiative.title })
    .from(initiative)
    .where(
      and(eq(initiative.sessionId, sessionId), eq(initiative.status, "open")),
    )
    .orderBy(desc(initiative.createdAt));
  return {
    titles: rows.map((r) => r.title),
    openCount: rows.length,
  };
}

export function formatInitiativeList(
  items: InitiativeListItem[],
  opts: { q?: string; openCount?: number } = {},
): string {
  if (!items.length) {
    const q = opts.q?.trim();
    if (q) {
      const n = opts.openCount ?? 0;
      return n
        ? `No initiatives matching “${q}”. ${n} open in this room.`
        : `No initiatives matching “${q}”.`;
    }
    return "No initiatives in this room.";
  }
  const lines = items.map((item) => {
    const next = item.next ? ` · next ${item.next}` : "";
    const lit = item.litSeatKeys.length
      ? ` · ${item.litSeatKeys.join(",")}`
      : "";
    const title = item.title.trim() || "(no title)";
    return `${item.status}: ${item.id} ${title}${lit}${next}`;
  });
  return `${items.length} initiative${items.length === 1 ? "" : "s"}.\n${lines.join("\n")}`;
}

export function formatInitiativeRead(ticket: InitiativeRead): string {
  const next = ticket.next ? `Next: ${ticket.next}.` : "Done.";
  const title = ticket.title.trim() || "(no title)";
  const founding = ticket.founding?.text.replace(/\s+/g, " ").trim() ?? "";
  const posts = ticket.posts.length
    ? ticket.posts
        .map((p) => `${p.seatKey ?? "?"}: ${p.text.replace(/\s+/g, " ").trim().slice(0, 180)}`)
        .join("\n")
    : "No seat posts yet.";
  const files = formatLandedFiles(ticket.attachments);
  return files
    ? `${ticket.id}\n${title}\n${ticket.status}. ${founding}\n${posts}\n${files}\n${next}`
    : `${ticket.id}\n${title}\n${ticket.status}. ${founding}\n${posts}\n${next}`;
}
