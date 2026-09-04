import { and, desc, eq } from "drizzle-orm";
import { delay, isDeadStreamError } from "@/lib/cursor-busy";
import { absorbText, nextLiveTravisText } from "@/lib/absorb-text";
import { nextDestSeatText, nextSeatBeat, postIsInRunChain } from "@/lib/beats";
import { isTravisSeat } from "@/lib/seats";
import { seatKeyToLabel } from "@/lib/router";
import {
  isDrainableSeat,
  shouldHarvestStoredRun,
  shouldQueueForSeat,
  type QueueSnapshot,
} from "@/lib/queue-logic";
import {
  cancelCursorRun,
  discoverActiveRunId,
  harvestFinishedRun,
  probeCursorRun,
  streamCursorReply,
  type CursorStreamEvent,
} from "@/server/cursor-port";
import { harvestTurnArtifacts } from "@/server/artifacts";
import { db } from "@/server/db/client";
import { ensureInitiativeStore } from "@/server/initiative";
import { runMotionRunner } from "@/server/motion";
import { isOpenMember, requireOpenMember } from "@/server/room-membership";
import {
  agentBinding,
  voiceTurn,
  type AgentBinding,
  type SeatKey,
  type VoiceTurn,
} from "@/server/db/schema";
import {
  bindingsWithQueuedItems,
  claimLiveRun,
  enqueueUtterance,
  getLiveRun,
  getQueueHead,
  getQueuedItem,
  liveRunsForSession,
  queueSnapshot,
  releaseLiveRunIfMatch,
  upsertLiveRun,
  deleteQueuedItem,
} from "@/server/queue";

const POST_PERSIST_MS = 400;

export function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

export async function nextTurnSeq(sessionId: string) {
  const [last] = await db
    .select({ seq: voiceTurn.seq })
    .from(voiceTurn)
    .where(eq(voiceTurn.sessionId, sessionId))
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  return (last?.seq ?? 0) + 1;
}

const seqTails = new Map<string, Promise<unknown>>();

async function withSeqLock<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
  const prev = seqTails.get(sessionId) ?? Promise.resolve();
  let release!: (value: unknown) => void;
  const next = new Promise((resolve) => {
    release = resolve;
  });
  seqTails.set(
    sessionId,
    prev.then(() => next),
  );
  try {
    await prev;
    return await fn();
  } finally {
    release(undefined);
  }
}

const drainTails = new Map<string, Promise<unknown>>();

async function withDrainLock<T>(
  bindingId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = drainTails.get(bindingId) ?? Promise.resolve();
  let release!: (value: unknown) => void;
  const next = new Promise((resolve) => {
    release = resolve;
  });
  drainTails.set(
    bindingId,
    prev.then(() => next),
  );
  try {
    await prev;
    return await fn();
  } finally {
    release(undefined);
  }
}

async function insertTurn(
  sessionId: string,
  values: {
    role: string;
    kind: string;
    seatKey?: SeatKey | null;
    speakable: boolean;
    text: string;
    thoughtStatus?: string | null;
    referenceTurnId?: string | null;
    initiativeId?: string | null;
  },
): Promise<VoiceTurn> {
  await ensureInitiativeStore();
  return withSeqLock(sessionId, async () => {
    const seq = await nextTurnSeq(sessionId);
    const [row] = await db
      .insert(voiceTurn)
      .values({ sessionId, seq, ...values })
      .returning();
    return row;
  });
}

/**
 * True only if this seat still has an active Cursor run. A leftover
 * seat_live_run row against a finished/dead stream is cleared so the
 * next utterance sends instead of queuing.
 */
export async function seatHasActiveRun(
  binding: AgentBinding,
): Promise<boolean> {
  if (isTravisSeat(binding.seatKey)) return false;
  const live = await getLiveRun(binding.id);
  if (!live) return false;
  const active = await discoverActiveRunId(binding.cursorAgentId ?? "");
  if (shouldQueueForSeat({ hasLiveRow: true, cursorHasActiveRun: Boolean(active) })) {
    return true;
  }
  await claimLiveRun(binding.id);
  return false;
}

export async function persistDiscoveredRun(params: {
  bindingId: string;
  sessionId: string;
  cursorAgentId: string;
  discoveredRunId: string | null;
}): Promise<void> {
  const live = await getLiveRun(params.bindingId);
  if (live?.cursorRunId) return;
  const runId =
    params.discoveredRunId ??
    (await discoverActiveRunId(params.cursorAgentId));
  if (!runId) return;
  await upsertLiveRun({
    bindingId: params.bindingId,
    sessionId: params.sessionId,
    cursorRunId: runId,
    userTurnId: null,
  });
}

export async function enqueueOnSeat(params: {
  sessionId: string;
  binding: AgentBinding;
  text: string;
  discoveredRunId?: string | null;
  initiativeId?: string | null;
}): Promise<QueueSnapshot> {
  if (isTravisSeat(params.binding.seatKey)) {
    throw new Error("Travis is never queued");
  }
  await requireOpenMember(params.sessionId, params.binding.id);
  await persistDiscoveredRun({
    bindingId: params.binding.id,
    sessionId: params.sessionId,
    cursorAgentId: params.binding.cursorAgentId,
    discoveredRunId: params.discoveredRunId ?? null,
  });
  await enqueueUtterance({
    sessionId: params.sessionId,
    binding: params.binding,
    text: params.text,
    initiativeId: params.initiativeId,
  });
  return queueSnapshot(params.sessionId);
}

export type SendFn = (event: string, data: unknown) => void;

export async function insertUserTurn(
  sessionId: string,
  prompt: string,
  seatKey: SeatKey,
  initiativeId?: string | null,
): Promise<VoiceTurn> {
  return insertTurn(sessionId, {
    role: "user",
    kind: "user",
    seatKey,
    speakable: true,
    text: prompt,
    initiativeId: initiativeId ?? undefined,
  });
}

/**
 * Dest-seat posts use the Live Travis closer. A growing snapshot updates
 * the open beat. A new message inserts and quotes the previous post.
 */
export async function absorbStreamingAgentPost(params: {
  sessionId: string;
  userTurnId: string;
  seatKey: SeatKey;
  text: string;
}): Promise<VoiceTurn> {
  const incoming = params.text.trim();
  return withSeqLock(params.sessionId, async () => {
    const posts = await db
      .select()
      .from(voiceTurn)
      .where(
        and(
          eq(voiceTurn.sessionId, params.sessionId),
          eq(voiceTurn.kind, "agent_post"),
          eq(voiceTurn.seatKey, params.seatKey),
        ),
      )
      .orderBy(desc(voiceTurn.seq));
    const byId = new Map(posts.map((p) => [p.id, p]));
    const current =
      posts.find((p) =>
        postIsInRunChain(p, params.userTurnId, (id) => byId.get(id) ?? null),
      ) ?? null;
    const [answered] = await db
      .select({ initiativeId: voiceTurn.initiativeId })
      .from(voiceTurn)
      .where(eq(voiceTurn.id, params.userTurnId))
      .limit(1);
    const initiativeId = answered?.initiativeId ?? undefined;
    const next = nextSeatBeat({
      current: current ? { id: current.id, text: current.text } : null,
      incoming,
      userTurnId: params.userTurnId,
    });
    if (next.mode === "update" && current) {
      if (
        current.text === next.text &&
        current.initiativeId === (initiativeId ?? null)
      ) {
        return current;
      }
      const [row] = await db
        .update(voiceTurn)
        .set({
          text: next.text,
          initiativeId: initiativeId ?? current.initiativeId,
        })
        .where(eq(voiceTurn.id, current.id))
        .returning();
      return row;
    }
    const seq = await nextTurnSeq(params.sessionId);
    const [row] = await db
      .insert(voiceTurn)
      .values({
        sessionId: params.sessionId,
        seq,
        role: "assistant",
        kind: "agent_post",
        seatKey: params.seatKey,
        referenceTurnId: next.referenceTurnId,
        speakable: true,
        text: next.text,
        initiativeId,
      })
      .returning();
    return row;
  });
}

export async function insertAgentPostTurn(
  sessionId: string,
  text: string,
  seatKey: SeatKey,
  referenceTurnId?: string | null,
  /** 041 narration is a receipt, not speech. It shows, it is never read. */
  speakable = true,
): Promise<VoiceTurn> {
  let initiativeId: string | undefined;
  if (referenceTurnId) {
    const [answered] = await db
      .select({ initiativeId: voiceTurn.initiativeId })
      .from(voiceTurn)
      .where(eq(voiceTurn.id, referenceTurnId))
      .limit(1);
    initiativeId = answered?.initiativeId ?? undefined;
  }
  return insertTurn(sessionId, {
    role: "assistant",
    kind: "agent_post",
    seatKey,
    referenceTurnId: referenceTurnId ?? undefined,
    speakable,
    text,
    initiativeId,
  });
}

/** Live output is snapshots/deltas. One Travis post, not a row per chunk. */
export async function absorbLiveTravisPost(
  sessionId: string,
  text: string,
): Promise<VoiceTurn> {
  const incoming = text.trim();
  return withSeqLock(sessionId, async () => {
    const [last] = await db
      .select()
      .from(voiceTurn)
      .where(eq(voiceTurn.sessionId, sessionId))
      .orderBy(desc(voiceTurn.seq))
      .limit(1);
    if (last?.kind === "agent_post" && last.seatKey === "travis") {
      const next = nextLiveTravisText(last.text, incoming);
      if (next.mode === "update") {
        if (next.text === last.text) return last;
        const [row] = await db
          .update(voiceTurn)
          .set({ text: next.text })
          .where(eq(voiceTurn.id, last.id))
          .returning();
        return row;
      }
    }
    const seq = await nextTurnSeq(sessionId);
    const [row] = await db
      .insert(voiceTurn)
      .values({
        sessionId,
        seq,
        role: "assistant",
        kind: "agent_post",
        seatKey: "travis",
        speakable: true,
        text: incoming,
      })
      .returning();
    return row;
  });
}

export async function insertStatusTurn(
  sessionId: string,
  text: string,
): Promise<VoiceTurn> {
  return insertTurn(sessionId, {
    role: "status",
    kind: "status",
    speakable: false,
    text,
  });
}

/**
 * Drive one Cursor send into turns + SSE. Caller has already decided to send
 * (not enqueue). Returns whether this stream still owned the live-run row at
 * terminal — only then may the caller drain.
 */
export async function pipeOneSend(params: {
  sessionId: string;
  binding: AgentBinding;
  prompt: string;
  send: SendFn;
  matchedPhrase?: string;
  gen?: AsyncGenerator<CursorStreamEvent>;
  /** Fan-out shares one user turn across dests. */
  userTurn?: VoiceTurn;
  initiativeId?: string | null;
  /** SCP-015 role dest: never enqueue. Default true (person dest). */
  enqueueIfBusy?: boolean;
}): Promise<{ ownedTerminal: boolean; queue?: QueueSnapshot; busy?: boolean }> {
  const { sessionId, binding, prompt, send } = params;
  if (isTravisSeat(binding.seatKey)) {
    throw new Error("Travis dest never uses the Cursor send path");
  }
  if (!(await isOpenMember(sessionId, binding.id))) {
    throw new Error("Dest is not an open member of this room");
  }
  const seatKey = (binding.seatKey ?? "pm") as SeatKey;
  const seatLabel = binding.label ?? seatKeyToLabel(seatKey);

  const gen = params.gen ?? streamCursorReply({
    cursorAgentId: binding.cursorAgentId ?? "",
    prompt,
  });

  const first = await gen.next();
  if (first.done) {
    return { ownedTerminal: false };
  }

  if (first.value.type === "busy") {
    await gen.return(undefined);
    if (params.enqueueIfBusy === false) {
      return { ownedTerminal: false, busy: true };
    }
    const queue = await enqueueOnSeat({
      sessionId,
      binding,
      text: prompt,
      discoveredRunId: first.value.discoveredRunId,
      initiativeId: params.initiativeId,
    });
    send("queued", { queue });
    return { ownedTerminal: false, queue };
  }

  const userTurn =
    params.userTurn ??
    (await insertUserTurn(sessionId, prompt, seatKey, params.initiativeId));
  send("matched", {
    matched: true,
    matchedPhrase: params.matchedPhrase,
    userTurn,
    activeSeatKey: seatKey,
    activeLabel: seatLabel,
  });

  let thoughtTurnId: string | null = null;
  let thoughtText = "";
  let postText = "";
  let postTurn: VoiceTurn | null = null;
  let lastPostPersist = 0;
  let liveRunId: string | null = null;
  let runStartedAt: Date | null = null;
  const doneBox: {
    current: {
      mode: string;
      statusText: string;
      error?: string;
      runId?: string;
    } | null;
  } = { current: null };

  const handle = async (ev: CursorStreamEvent) => {
    if (ev.type === "run_started") {
      liveRunId = ev.runId;
      await upsertLiveRun({
        bindingId: binding.id,
        sessionId,
        cursorRunId: ev.runId,
        userTurnId: userTurn.id,
      });
      const live = await getLiveRun(binding.id);
      runStartedAt = live?.startedAt ?? new Date();
      return;
    }
    if (ev.type === "busy") {
      return;
    }
    if (ev.type === "status") {
      send("status", { text: ev.text });
    } else if (ev.type === "thought_delta") {
      thoughtText = absorbText(thoughtText, ev.text).acc;
      if (!thoughtTurnId) {
        const row = await insertTurn(sessionId, {
          role: "assistant",
          kind: "agent_thought",
          seatKey,
          speakable: false,
          thoughtStatus: "streaming",
          text: thoughtText,
        });
        thoughtTurnId = row.id;
        send("thought", { turn: row });
      } else {
        await db
          .update(voiceTurn)
          .set({ text: thoughtText })
          .where(eq(voiceTurn.id, thoughtTurnId));
        send("thought_delta", { id: thoughtTurnId, text: thoughtText });
      }
    } else if (
      ev.type === "post_delta" ||
      ev.type === "delta" ||
      ev.type === "post_beat"
    ) {
      const next = nextDestSeatText(postText, ev.text);
      const closed =
        (next.mode === "insert" || ev.type === "post_beat") &&
        Boolean(postText.trim()) &&
        postTurn;
      if (closed && postTurn && runStartedAt) {
        await harvestTurnArtifacts({
          post: postTurn,
          binding,
          startedAt: runStartedAt,
        });
      }
      postText = next.text;
      if (next.mode === "insert" && closed) {
        send("post_beat", { text: next.text, seatKey, seatLabel });
      } else if (next.delta) {
        send("post_delta", { text: next.delta, seatKey, seatLabel });
      }
      const now = Date.now();
      if (
        postText.trim() &&
        (closed || !postTurn || now - lastPostPersist >= POST_PERSIST_MS)
      ) {
        lastPostPersist = now;
        postTurn = await absorbStreamingAgentPost({
          sessionId,
          userTurnId: userTurn.id,
          seatKey,
          text: postText,
        });
        send("post", { turn: postTurn });
      }
    } else if (ev.type === "done") {
      if (ev.mode !== "error" && !postText.trim()) {
        postText = ev.assistantText;
      } else if (
        ev.mode === "error" &&
        ev.assistantText.trim() &&
        !postText.trim()
      ) {
        postText = ev.assistantText;
      }
      if (!thoughtText.trim() && ev.thoughtText) thoughtText = ev.thoughtText;
      doneBox.current = {
        mode: ev.mode,
        statusText: ev.statusText,
        error: ev.error,
        runId: ev.runId,
      };
      if (ev.runId) liveRunId = ev.runId;
    }
  };

  await handle(first.value);
  for (;;) {
    const next = await gen.next();
    if (next.done) break;
    await handle(next.value);
  }

  if (thoughtTurnId && thoughtText.trim()) {
    await db
      .update(voiceTurn)
      .set({
        text: thoughtText.trim(),
        thoughtStatus: postText.trim() ? "promoted" : "collapsed",
      })
      .where(eq(voiceTurn.id, thoughtTurnId));
  } else if (thoughtText.trim() && !thoughtTurnId) {
    const row = await insertTurn(sessionId, {
      role: "assistant",
      kind: "agent_thought",
      seatKey,
      speakable: false,
      thoughtStatus: postText.trim() ? "promoted" : "collapsed",
      text: thoughtText.trim(),
    });
    thoughtTurnId = row.id;
  }

  const donePayload = doneBox.current;
  const cancelled = donePayload?.statusText === "cancelled";
  const bareError = donePayload?.mode === "error" && !postText.trim();
  const finalPost = postText.trim()
    ? postText.trim()
    : cancelled || bareError
      ? ""
      : "Run finished (no assistant text).";
  if (finalPost) {
    postTurn = await absorbStreamingAgentPost({
      sessionId,
      userTurnId: userTurn.id,
      seatKey,
      text: finalPost,
    });
  }

  await harvestTurnArtifacts({
    post: postTurn,
    binding,
    startedAt: runStartedAt,
  });

  const statusText = donePayload?.statusText ?? "finished";
  const statusTurn = await insertTurn(sessionId, {
    role: "status",
    kind: "status",
    speakable: false,
    text: statusText,
  });

  if (bareError) {
    const errText = donePayload?.error ?? "Cursor send failed";
    if (!/agent_busy/i.test(errText)) {
      send("error", { error: errText });
    }
  }

  const deadStream =
    bareError || isDeadStreamError(donePayload?.error ?? statusText);

  let ownedTerminal = false;
  if (liveRunId) {
    ownedTerminal = await releaseLiveRunIfMatch(binding.id, liveRunId);
  }
  if (!ownedTerminal && deadStream) {
    ownedTerminal = !(await seatHasActiveRun(binding));
  }

  send("done", {
    matched: true,
    mode: donePayload?.mode ?? "real",
    matchedPhrase: params.matchedPhrase,
    seatKey,
    seatLabel,
    postTurn,
    thoughtTurnId,
    turns: postTurn
      ? [userTurn, postTurn, statusTurn]
      : [userTurn, statusTurn],
  });

  return { ownedTerminal };
}

export async function drainHead(
  sessionId: string,
  binding: AgentBinding,
  send: SendFn,
): Promise<void> {
  if (!(await isOpenMember(sessionId, binding.id))) return;
  await withDrainLock(binding.id, async () => {
    for (;;) {
      const stillLive = await getLiveRun(binding.id);
      if (stillLive) return;
      const head = await getQueueHead(sessionId, binding.id);
      if (!head) return;
      const claimed = await deleteQueuedItem(sessionId, head.id);
      if (!claimed) continue;
      send("queue", { queue: await queueSnapshot(sessionId) });
      const result = await pipeOneSend({
        sessionId,
        binding,
        prompt: head.text,
        send,
        initiativeId: head.initiativeId,
      });
      if (!result.ownedTerminal) return;
    }
  });
  await runMotionRunner(sessionId);
}

/**
 * If the SSE died before `done`, the Cursor run may still finish. Pull
 * that run's assistant text into the log and drop the leftover live-run
 * row. A newer follow-up on the same seat does not block this.
 */
export async function reapFinishedLiveRuns(sessionId: string): Promise<void> {
  const rows = await liveRunsForSession(sessionId);
  for (const { live, binding } of rows) {
    if (isTravisSeat(binding.seatKey)) continue;
    const harvested = await harvestFinishedRun({
      agentId: binding.cursorAgentId ?? "",
      runId: live.cursorRunId,
    });
    if (!shouldHarvestStoredRun({ storedRunStatus: harvested.status })) {
      continue;
    }
    const seatKey = (binding.seatKey ?? "pm") as SeatKey;
    const beats = harvested.beats.length
      ? harvested.beats
      : harvested.assistantText.trim()
        ? [harvested.assistantText.trim()]
        : ["Run finished (no assistant text)."];
    let post: VoiceTurn | null = null;
    for (const beat of beats) {
      post = live.userTurnId
        ? await absorbStreamingAgentPost({
            sessionId,
            userTurnId: live.userTurnId,
            seatKey,
            text: beat,
          })
        : await insertAgentPostTurn(sessionId, beat, seatKey);
      await harvestTurnArtifacts({
        post,
        binding,
        startedAt: live.startedAt,
      });
    }
    await insertStatusTurn(sessionId, "finished");
    await releaseLiveRunIfMatch(binding.id, live.cursorRunId);
  }
}

/**
 * Clear a leftover live-run row when Cursor is idle, and name seats whose
 * waiting lines can send now. Does not drain — the phone opens an SSE for that.
 */
export async function inspectAndNudgeQueue(sessionId: string): Promise<{
  queue: QueueSnapshot;
  drainable: SeatKey[];
}> {
  await reapFinishedLiveRuns(sessionId);
  const bindings = await bindingsWithQueuedItems(sessionId);
  const drainable: SeatKey[] = [];
  for (const binding of bindings) {
    if (isTravisSeat(binding.seatKey)) continue;
    const live = await getLiveRun(binding.id);
    const probe = await probeCursorRun(binding.cursorAgentId ?? "");
    if (probe.status !== "idle") continue;
    if (live) await claimLiveRun(binding.id);
    if (
      isDrainableSeat({
        hasQueue: true,
        cursorHasActiveRun: false,
      })
    ) {
      drainable.push((binding.seatKey ?? "pm") as SeatKey);
    }
  }
  return { queue: await queueSnapshot(sessionId), drainable };
}

/** Send waiting lines for seats Cursor is no longer running. */
export async function drainReadySeats(params: {
  sessionId: string;
  send: SendFn;
}): Promise<void> {
  const { drainable } = await inspectAndNudgeQueue(params.sessionId);
  if (!drainable.length) {
    params.send("queue", { queue: await queueSnapshot(params.sessionId) });
    return;
  }
  const seen = new Set<string>();
  for (const seatKey of drainable) {
    if (seen.has(seatKey)) continue;
    seen.add(seatKey);
    const [binding] = await db
      .select()
      .from(agentBinding)
      .where(eq(agentBinding.seatKey, seatKey))
      .limit(1);
    if (!binding) continue;
    const probe = await probeCursorRun(binding.cursorAgentId ?? "");
    if (probe.status !== "idle") continue;
    await drainHead(params.sessionId, binding, params.send);
  }
  await runMotionRunner(params.sessionId);
}

export async function sendOrEnqueue(params: {
  sessionId: string;
  binding: AgentBinding;
  prompt: string;
  send: SendFn;
  matchedPhrase?: string;
  userTurn?: VoiceTurn;
  initiativeId?: string | null;
  /** SCP-015 role dest: never enqueue. Default true (person dest). */
  enqueueIfBusy?: boolean;
}): Promise<"queued" | "sent" | "busy"> {
  if (isTravisSeat(params.binding.seatKey)) {
    throw new Error("Travis dest never uses the Cursor send path");
  }
  await requireOpenMember(params.sessionId, params.binding.id);
  if (await seatHasActiveRun(params.binding)) {
    if (params.enqueueIfBusy === false) return "busy";
    const queue = await enqueueOnSeat({
      sessionId: params.sessionId,
      binding: params.binding,
      text: params.prompt,
      initiativeId: params.initiativeId,
    });
    params.send("queued", { queue });
    return "queued";
  }

  const result = await pipeOneSend(params);
  if (result.busy) return "busy";
  if (result.queue) return "queued";
  if (result.ownedTerminal) {
    await drainHead(params.sessionId, params.binding, params.send);
  }
  return "sent";
}

/**
 * Type @ fan-out: one user turn, each tagged seat gets the same body.
 * Per-seat queue still applies. Single dest keeps 003 retract-on-busy.
 */
export async function sendOrEnqueueMany(params: {
  sessionId: string;
  bindings: AgentBinding[];
  prompt: string;
  send: SendFn;
  userTurn?: VoiceTurn;
}): Promise<void> {
  const { sessionId, bindings, prompt, send } = params;
  const cursorOnly = bindings.filter((b) => !isTravisSeat(b.seatKey));
  if (cursorOnly.length === 0) return;
  if (cursorOnly.length === 1) {
    await sendOrEnqueue({
      sessionId,
      binding: cursorOnly[0],
      prompt,
      send,
      userTurn: params.userTurn,
    });
    return;
  }

  const lead = cursorOnly[0];
  const last = cursorOnly[cursorOnly.length - 1];
  const leadKey = (lead.seatKey ?? "pm") as SeatKey;
  const lastKey = (last.seatKey ?? "pm") as SeatKey;
  const userTurn =
    params.userTurn ?? (await insertUserTurn(sessionId, prompt, leadKey));
  send("matched", {
    matched: true,
    userTurn,
    activeSeatKey: lastKey,
    activeLabel: last.label ?? seatKeyToLabel(lastKey),
  });

  await Promise.allSettled(
    cursorOnly.map((binding) =>
      sendOrEnqueue({
        sessionId,
        binding,
        prompt,
        send,
        userTurn,
      }),
    ),
  );
}

export async function bargeQueuedItem(params: {
  sessionId: string;
  itemId: string;
  send: SendFn;
}): Promise<void> {
  const item = await getQueuedItem(params.sessionId, params.itemId);
  if (!item) {
    params.send("queue", { queue: await queueSnapshot(params.sessionId) });
    return;
  }
  const binding = await bindingById(item.bindingId);
  if (!binding) return;
  if (!(await isOpenMember(params.sessionId, binding.id))) {
    params.send("queue", { queue: await queueSnapshot(params.sessionId) });
    return;
  }

  const claimed = await claimLiveRun(binding.id);
  const agentId = binding.cursorAgentId ?? "";
  let runId = claimed?.cursorRunId ?? null;
  if (!runId) runId = await discoverActiveRunId(agentId);
  if (runId) {
    await cancelCursorRun(agentId, runId);
    const start = Date.now();
    while (Date.now() - start < 2500) {
      const still = await discoverActiveRunId(agentId);
      if (!still) break;
      await delay(200);
    }
  }

  await deleteQueuedItem(params.sessionId, item.id);
  params.send("queue", { queue: await queueSnapshot(params.sessionId) });

  const result = await pipeOneSend({
    sessionId: params.sessionId,
    binding,
    prompt: item.text,
    send: params.send,
    initiativeId: item.initiativeId,
  });
  if (result.ownedTerminal) {
    await drainHead(params.sessionId, binding, params.send);
  }
}

export async function bindingById(
  bindingId: string,
): Promise<AgentBinding | null> {
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, bindingId))
    .limit(1);
  return row ?? null;
}
