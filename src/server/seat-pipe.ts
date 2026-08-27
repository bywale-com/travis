import { desc, eq } from "drizzle-orm";
import { delay, isDeadStreamError } from "@/lib/cursor-busy";
import { absorbText } from "@/lib/absorb-text";
import { seatKeyToLabel } from "@/lib/router";
import { shouldQueueForSeat, type QueueSnapshot } from "@/lib/queue-logic";
import {
  cancelCursorRun,
  discoverActiveRunId,
  streamCursorReply,
  type CursorStreamEvent,
} from "@/server/cursor-port";
import { db } from "@/server/db/client";
import {
  agentBinding,
  voiceTurn,
  type AgentBinding,
  type SeatKey,
  type VoiceTurn,
} from "@/server/db/schema";
import {
  claimLiveRun,
  enqueueUtterance,
  getLiveRun,
  getQueueHead,
  getQueuedItem,
  queueSnapshot,
  releaseLiveRunIfMatch,
  upsertLiveRun,
  deleteQueuedItem,
} from "@/server/queue";

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

/**
 * True only if this seat still has an active Cursor run. A leftover
 * seat_live_run row against a finished/dead stream is cleared so the
 * next utterance sends instead of queuing.
 */
export async function seatHasActiveRun(
  binding: AgentBinding,
): Promise<boolean> {
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
}): Promise<QueueSnapshot> {
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
  });
  return queueSnapshot(params.sessionId);
}

type SendFn = (event: string, data: unknown) => void;

async function insertUserTurn(
  sessionId: string,
  prompt: string,
  seatKey: SeatKey,
): Promise<VoiceTurn> {
  const seq = await nextTurnSeq(sessionId);
  const [row] = await db
    .insert(voiceTurn)
    .values({
      sessionId,
      seq,
      role: "user",
      kind: "user",
      seatKey,
      speakable: true,
      text: prompt,
    })
    .returning();
  return row;
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
}): Promise<{ ownedTerminal: boolean; queue?: QueueSnapshot }> {
  const { sessionId, binding, prompt, send } = params;
  const seatKey = (binding.seatKey ?? "pm") as SeatKey;
  const seatLabel = binding.label ?? seatKeyToLabel(seatKey);

  const userTurn = await insertUserTurn(sessionId, prompt, seatKey);
  send("matched", {
    matched: true,
    matchedPhrase: params.matchedPhrase,
    userTurn,
    activeSeatKey: seatKey,
    activeLabel: seatLabel,
  });

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
    await db.delete(voiceTurn).where(eq(voiceTurn.id, userTurn.id));
    send("retract", { id: userTurn.id });
    const queue = await enqueueOnSeat({
      sessionId,
      binding,
      text: prompt,
      discoveredRunId: first.value.discoveredRunId,
    });
    send("queued", { queue });
    return { ownedTerminal: false, queue };
  }

  let seq = userTurn.seq + 1;
  let thoughtTurnId: string | null = null;
  let thoughtText = "";
  let postText = "";
  let liveRunId: string | null = null;
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
        const [row] = await db
          .insert(voiceTurn)
          .values({
            sessionId,
            seq,
            role: "assistant",
            kind: "agent_thought",
            seatKey,
            speakable: false,
            thoughtStatus: "streaming",
            text: thoughtText,
          })
          .returning();
        thoughtTurnId = row.id;
        seq += 1;
        send("thought", { turn: row });
      } else {
        await db
          .update(voiceTurn)
          .set({ text: thoughtText })
          .where(eq(voiceTurn.id, thoughtTurnId));
        send("thought_delta", { id: thoughtTurnId, text: thoughtText });
      }
    } else if (ev.type === "post_delta" || ev.type === "delta") {
      const next = absorbText(postText, ev.text);
      postText = next.acc;
      if (next.delta) {
        send("post_delta", { text: next.delta, seatKey, seatLabel });
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
    const [row] = await db
      .insert(voiceTurn)
      .values({
        sessionId,
        seq,
        role: "assistant",
        kind: "agent_thought",
        seatKey,
        speakable: false,
        thoughtStatus: postText.trim() ? "promoted" : "collapsed",
        text: thoughtText.trim(),
      })
      .returning();
    thoughtTurnId = row.id;
    seq += 1;
  }

  const donePayload = doneBox.current;
  const cancelled = donePayload?.statusText === "cancelled";
  const bareError = donePayload?.mode === "error" && !postText.trim();
  let postTurn: VoiceTurn | null = null;
  const finalPost = postText.trim()
    ? postText.trim()
    : cancelled || bareError
      ? ""
      : "Run finished (no assistant text).";
  if (finalPost) {
    const [row] = await db
      .insert(voiceTurn)
      .values({
        sessionId,
        seq,
        role: "assistant",
        kind: "agent_post",
        seatKey,
        referenceTurnId: userTurn.id,
        speakable: true,
        text: finalPost,
      })
      .returning();
    postTurn = row;
    seq += 1;
  }

  const statusText = donePayload?.statusText ?? "finished";
  const [statusTurn] = await db
    .insert(voiceTurn)
    .values({
      sessionId,
      seq,
      role: "status",
      kind: "status",
      speakable: false,
      text: statusText,
    })
    .returning();

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
  for (;;) {
    const stillLive = await getLiveRun(binding.id);
    if (stillLive) return;
    const head = await getQueueHead(sessionId, binding.id);
    if (!head) return;
    await deleteQueuedItem(sessionId, head.id);
    send("queue", { queue: await queueSnapshot(sessionId) });
    const result = await pipeOneSend({
      sessionId,
      binding,
      prompt: head.text,
      send,
    });
    if (!result.ownedTerminal) return;
  }
}

export async function sendOrEnqueue(params: {
  sessionId: string;
  binding: AgentBinding;
  prompt: string;
  send: SendFn;
  matchedPhrase?: string;
}): Promise<"queued" | "sent"> {
  if (await seatHasActiveRun(params.binding)) {
    const queue = await enqueueOnSeat({
      sessionId: params.sessionId,
      binding: params.binding,
      text: params.prompt,
    });
    params.send("queued", { queue });
    return "queued";
  }

  const result = await pipeOneSend(params);
  if (result.queue) return "queued";
  if (result.ownedTerminal) {
    await drainHead(params.sessionId, params.binding, params.send);
  }
  return "sent";
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
