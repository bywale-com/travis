/**
 * SCP-008 — initiative store. Engineer pastes; no leftover analysis.
 *
 * Via-Travis only on Travis pass-on. Hold is HTTP. Done is a write.
 * Requests stays kind=user.
 */

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { formatLandedFiles } from "@/lib/artifact-kind";
import { quoteAuthorLabel } from "@/lib/dest-glass";
import {
  catalogNeedleHits,
  clipInitiativeTitle,
  namedTicketFromSpeech,
  pathBasename,
} from "@/lib/initiative-title";
import {
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
import { streamShowsCard } from "@/lib/stream";
import { db } from "@/server/db/client";
import {
  destJob,
  initiative,
  queuedUtterance,
  turnArtifact,
  voiceSession,
  voiceTurn,
  type Initiative,
  type InitiativeSource,
  type InitiativeStatus,
} from "@/server/db/schema";
import { ensureDestJobStore, fileDestJobInitiative } from "@/server/dest-job";
import { listSessionStreams } from "@/server/stream";

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
    CREATE INDEX IF NOT EXISTS voice_turn_session_seq_idx
      ON travis.voice_turn (session_id, seq)
  `);
  await db.execute(sql`
    ALTER TABLE travis.queued_utterance
      ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES travis.initiative(id)
  `);
  await db.execute(sql`
    ALTER TABLE travis.initiative
      ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT ''
  `);
  await db.execute(sql`
    ALTER TABLE travis.voice_turn
      ADD COLUMN IF NOT EXISTS heard_at timestamptz
  `);
  await applyHeardCutoffOnce();
  await backfillEmptyTitles();
  initiativeStoreReady = true;
}

/** SCP-027 — one-shot. Column comment is the latch so a new isolate does not eat New. */
export async function applyHeardCutoffOnce(): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF COALESCE(
        col_description('travis.voice_turn'::regclass, (
          SELECT attnum FROM pg_attribute
          WHERE attrelid = 'travis.voice_turn'::regclass
            AND attname = 'heard_at'
        )),
        ''
      ) NOT LIKE '%027-cutoff%' THEN
        UPDATE travis.voice_turn
        SET heard_at = created_at
        WHERE heard_at IS NULL
          AND kind = 'agent_post'
          AND speakable = true
          AND seat_key IS DISTINCT FROM 'travis';
        COMMENT ON COLUMN travis.voice_turn.heard_at IS '027-cutoff';
      END IF;
    END $$
  `);
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
  const { notifyRoom } = await import("@/server/room-bus");
  await notifyRoom(sessionId).catch(() => {});
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

async function openTicketTitles(
  sessionId: string,
): Promise<Array<{ id: string; title: string }>> {
  return db
    .select({ id: initiative.id, title: initiative.title })
    .from(initiative)
    .where(
      and(eq(initiative.sessionId, sessionId), eq(initiative.status, "open")),
    );
}

async function recentTravisSpeech(sessionId: string): Promise<string[]> {
  const rows = await db
    .select({ text: voiceTurn.text })
    .from(voiceTurn)
    .where(
      and(
        eq(voiceTurn.sessionId, sessionId),
        eq(voiceTurn.kind, "agent_post"),
        eq(voiceTurn.seatKey, "travis"),
      ),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(12);
  return rows.map((r) => r.text);
}

async function stampLatestOnto(
  sessionId: string,
  row: Initiative,
): Promise<Initiative> {
  const latest = await latestTravisUserTurn(sessionId);
  if (latest && !latest.initiativeId) {
    await stampTurn(latest.id, row.id);
  }
  return row;
}

/**
 * Lived 20:38 — “bundle That’s fine. and send” minted a new ticket from
 * “Yes, that’s the exact one.” Pass id when you have it. If the send
 * text or Travis’s last speech already names an open title, hang there.
 * Do not insertOpen from confirmation chatter.
 */
export async function ticketForHand(
  sessionId: string,
  initiativeId?: string,
  sendText?: string,
): Promise<Initiative | null> {
  await ensureInitiativeStore();
  const id = initiativeId?.trim();
  if (id) {
    const row = await getInitiative(id);
    if (!row || row.sessionId !== sessionId) {
      throw new InitiativeError("Initiative not found", 404);
    }
    return stampLatestOnto(sessionId, row);
  }
  const namedId = namedTicketFromSpeech(await openTicketTitles(sessionId), [
    ...(sendText?.trim() ? [sendText] : []),
    ...(await recentTravisSpeech(sessionId)),
  ]);
  if (namedId) {
    const row = await getInitiative(namedId);
    if (row && row.sessionId === sessionId) {
      return stampLatestOnto(sessionId, row);
    }
  }
  const inherited = await inheritOpenDestTicket(sessionId);
  if (inherited) return stampLatestOnto(sessionId, inherited);
  return ensureViaTravis(sessionId);
}

/** Follow-on dest without id: last dest_job ticket, else last dest user stamp. */
async function inheritOpenDestTicket(
  sessionId: string,
): Promise<Initiative | null> {
  await ensureDestJobStore();
  const [fromJob] = await db
    .select({
      id: initiative.id,
      sessionId: initiative.sessionId,
      foundingTurnId: initiative.foundingTurnId,
      source: initiative.source,
      status: initiative.status,
      title: initiative.title,
      createdAt: initiative.createdAt,
      doneAt: initiative.doneAt,
    })
    .from(destJob)
    .innerJoin(initiative, eq(destJob.initiativeId, initiative.id))
    .where(
      and(
        eq(destJob.sessionId, sessionId),
        eq(initiative.status, "open"),
      ),
    )
    .orderBy(desc(destJob.createdAt))
    .limit(1);
  if (fromJob) return fromJob;

  const dests = await db
    .select({
      initiativeId: voiceTurn.initiativeId,
      seatKey: voiceTurn.seatKey,
    })
    .from(voiceTurn)
    .where(
      and(eq(voiceTurn.sessionId, sessionId), eq(voiceTurn.kind, "user")),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(40);
  for (const dest of dests) {
    if (!dest.initiativeId || !isCursorSeat(dest.seatKey)) continue;
    const row = await getInitiative(dest.initiativeId);
    if (row && row.sessionId === sessionId && row.status === "open") return row;
  }
  return null;
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
  if (params.userTurnId) {
    const [existing] = await db
      .select()
      .from(voiceTurn)
      .where(eq(voiceTurn.id, params.userTurnId))
      .limit(1);
    if (existing?.initiativeId) {
      await fileDestJobInitiative({
        sessionId,
        userTurnId: params.userTurnId,
        initiativeId: existing.initiativeId,
      });
      if (params.queuedId) {
        await stampQueued(params.queuedId, existing.initiativeId);
      }
      return getInitiative(existing.initiativeId);
    }
  }
  let row = await ensureViaTravis(sessionId);
  if (!row && params.userTurnId) {
    row = await ensureOnPassOn(sessionId, params.userTurnId);
  }
  if (!row) return null;
  if (params.userTurnId) await stampTurn(params.userTurnId, row.id);
  if (params.queuedId) await stampQueued(params.queuedId, row.id);
  await fileDestJobInitiative({
    sessionId,
    userTurnId: params.userTurnId ?? null,
    initiativeId: row.id,
  });
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
  const { notifyRoom } = await import("@/server/room-bus");
  await notifyRoom(sessionId).catch(() => {});
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
  const { notifyRoom } = await import("@/server/room-bus");
  await notifyRoom(sessionId).catch(() => {});
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

async function artifactNamesForInitiatives(
  initiativeIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (!initiativeIds.length) return map;
  try {
    const list = await db
      .select({
        initiativeId: voiceTurn.initiativeId,
        filename: turnArtifact.filename,
        path: turnArtifact.path,
      })
      .from(turnArtifact)
      .innerJoin(voiceTurn, eq(voiceTurn.id, turnArtifact.turnId))
      .where(inArray(voiceTurn.initiativeId, initiativeIds));
    for (const row of list) {
      const id = row.initiativeId;
      if (!id) continue;
      const names = map.get(id) ?? [];
      if (typeof row.filename === "string" && row.filename.trim()) {
        names.push(row.filename);
      }
      if (typeof row.path === "string" && row.path.trim()) {
        names.push(pathBasename(row.path));
      }
      map.set(id, names);
    }
    return map;
  } catch {
    return map;
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

  const windowed = rows.filter((row) =>
    requestInWindow(row.createdAt, requestWindowStart(when)),
  );
  if (!windowed.length) return [];

  const ids = windowed.map((row) => row.id);
  const grain = await db
    .select({
      id: voiceTurn.id,
      seq: voiceTurn.seq,
      kind: voiceTurn.kind,
      seatKey: voiceTurn.seatKey,
      text: voiceTurn.text,
      createdAt: voiceTurn.createdAt,
      referenceTurnId: voiceTurn.referenceTurnId,
      initiativeId: voiceTurn.initiativeId,
    })
    .from(voiceTurn)
    .where(
      and(
        inArray(voiceTurn.initiativeId, ids),
        inArray(voiceTurn.kind, ["user", "agent_post"]),
      ),
    )
    .orderBy(asc(voiceTurn.seq));

  const byInit = new Map<string, TicketTurn[]>();
  for (const t of grain) {
    if (!t.initiativeId) continue;
    const list = byInit.get(t.initiativeId) ?? [];
    list.push({
      id: t.id,
      seq: t.seq,
      kind: t.kind,
      seatKey: t.seatKey,
      text: t.text,
      createdAt: t.createdAt,
      referenceTurnId: t.referenceTurnId,
    });
    byInit.set(t.initiativeId, list);
  }

  const filesByInit = q.trim()
    ? await artifactNamesForInitiatives(ids)
    : null;

  const out: InitiativeListItem[] = [];
  for (const row of windowed) {
    const turns = byInit.get(row.id) ?? [];
    const [founding] = turns.filter((t) => t.id === row.foundingTurnId);
    const posts = turns.filter((t) => t.kind === "agent_post");
    if (q.trim()) {
      const messages = turns.map((t) => t.text);
      const files = filesByInit?.get(row.id) ?? [];
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
    kind: string;
    seatKey: string | null;
    text: string;
    createdAt: Date;
    referenceTurnId: string | null;
    quote: { authorLabel: string; text: string } | null;
  }>;
  destLines: Array<{
    id: string;
    seatKey: string | null;
    text: string;
    createdAt: Date;
    referenceTurnId: string | null;
    quote: { authorLabel: string; text: string } | null;
  }>;
  streams: Array<{
    id: string;
    closeTurnId: string | null;
    triggerText: string;
    status: string;
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
  const destLines = turns.filter(
    (t) => t.kind === "user" && isCursorSeat(t.seatKey),
  );
  const posts = turns.filter(
    (t) => t.kind === "agent_post" && isCursorSeat(t.seatKey),
  );
  const quoteFor = (turn: TicketTurn) => {
    if (!turn.referenceTurnId) return null;
    const ref = turns.find((x) => x.id === turn.referenceTurnId);
    if (!ref) return null;
    return {
      authorLabel: quoteAuthorLabel({
        kind: ref.kind,
        seatKey: ref.seatKey,
      }),
      text: ref.text,
    };
  };
  const turnIds = new Set(turns.map((t) => t.id));
  const streams = (await listSessionStreams(sessionId).catch(() => ({
    live: [],
    cards: [],
  }))).cards
    .filter((card) => streamShowsCard(card))
    .filter(
      (card) =>
        turnIds.has(card.triggerTurnId) ||
        (card.closeTurnId != null && turnIds.has(card.closeTurnId)),
    )
    .map((card) => ({
      id: card.id,
      closeTurnId: card.closeTurnId,
      triggerText: card.triggerText,
      status: card.status,
    }));
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
      kind: p.kind,
      seatKey: p.seatKey,
      text: p.text,
      createdAt: p.createdAt,
      referenceTurnId: p.referenceTurnId,
      quote: quoteFor(p),
    })),
    destLines: destLines.map((d) => ({
      id: d.id,
      seatKey: d.seatKey,
      text: d.text,
      createdAt: d.createdAt,
      referenceTurnId: d.referenceTurnId,
      quote: quoteFor(d),
    })),
    streams,
    next: nextOf(row, turns),
    attachments: await attachmentsForInitiative(row.id),
  };
}

export async function glanceOpenInitiatives(
  sessionId: string,
): Promise<{
  titles: string[];
  openCount: number;
  items: Array<{ title: string; posted: boolean }>;
}> {
  await ensureInitiativeStore();
  const rows = await db
    .select({ id: initiative.id, title: initiative.title })
    .from(initiative)
    .where(
      and(eq(initiative.sessionId, sessionId), eq(initiative.status, "open")),
    )
    .orderBy(desc(initiative.createdAt));
  const ids = rows.map((r) => r.id);
  const posted = new Set<string>();
  if (ids.length) {
    const posts = await db
      .select({
        initiativeId: voiceTurn.initiativeId,
        seatKey: voiceTurn.seatKey,
      })
      .from(voiceTurn)
      .where(
        and(
          inArray(voiceTurn.initiativeId, ids),
          eq(voiceTurn.kind, "agent_post"),
        ),
      );
    for (const p of posts) {
      if (p.initiativeId && isCursorSeat(p.seatKey)) posted.add(p.initiativeId);
    }
  }
  const items = rows.map((r) => ({
    title: r.title,
    posted: posted.has(r.id),
  }));
  return {
    titles: items.map((i) => i.title),
    openCount: rows.length,
    items,
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
        ? `No initiatives matching “${q}”. Do not substitute another ticket. ${n} open in this room.`
        : `No initiatives matching “${q}”. Do not substitute another ticket.`;
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
  const dest = (ticket.destLines ?? [])
    .filter((d) => d.id !== ticket.founding?.id)
    .map(
      (d) =>
        `dest ${d.seatKey ?? "?"}: ${d.text.replace(/\s+/g, " ").trim().slice(0, 180)}`,
    )
    .join("\n");
  const hasSeatPost = ticket.posts.some(
    (p) => p.kind === "agent_post" || isCursorSeat(p.seatKey),
  );
  const streamLines = (ticket.streams ?? [])
    .map((s) => `Stream: ${s.triggerText.replace(/\s+/g, " ").trim().slice(0, 180)}`)
    .join("\n");
  const posts = hasSeatPost
    ? ticket.posts
        .map((p) => `${p.seatKey ?? "?"}: ${p.text.replace(/\s+/g, " ").trim().slice(0, 180)}`)
        .join("\n")
    : ticket.streams?.length
      ? streamLines
      : "No seat has posted on this ticket.";
  const files = formatLandedFiles(ticket.attachments);
  const body = [founding, dest, posts, hasSeatPost ? streamLines : "", files]
    .filter((line) => line && line.trim())
    .join("\n");
  return `${ticket.id}\n${title}\n${ticket.status}. ${body}\n${next}`;
}
