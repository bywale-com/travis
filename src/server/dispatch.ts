/**
 * Hotfix 039 — write and leave.
 *
 * `sendOrEnqueue` holds the request open until Cursor says done, which is why
 * two sends in one turn can never overlap and the queue never trips from a
 * single utterance. Dispatch stops at `run_started`: the work now lives in
 * `seat_live_run`, where it already lived, and 032's harvester pulls the reply
 * into the log on the next poll.
 *
 * The live-run row must be written before this returns. A second dispatch
 * checks that row to decide whether the seat is busy, so returning first
 * would let both sends slip through as sends.
 */

import { seatKeyToLabel } from "@/lib/router";
import { isTravisSeat } from "@/lib/seats";
import { streamCursorReply, type CursorStreamEvent } from "@/server/cursor-port";
import { upsertLiveRun } from "@/server/queue";
import {
  enqueueOnSeat,
  insertStatusTurn,
  insertUserTurn,
  seatHasActiveRun,
} from "@/server/seat-pipe";
import type { AgentBinding, SeatKey } from "@/server/db/schema";
import { requireOpenMember } from "@/server/room-membership";

export type DispatchOutcome =
  | { status: "started"; runId: string; seatLabel: string }
  | { status: "queued"; waitingAhead: number; seatLabel: string }
  | { status: "stand-in"; seatLabel: string }
  | { status: "busy"; seatLabel: string }
  | { status: "error"; seatLabel: string; error: string };

export async function dispatchToSeat(params: {
  sessionId: string;
  binding: AgentBinding;
  prompt: string;
  initiativeId?: string | null;
  /** SCP-015 role dest: never enqueue. Default true (person dest). */
  enqueueIfBusy?: boolean;
}): Promise<DispatchOutcome> {
  const { sessionId, binding, prompt, initiativeId } = params;
  if (isTravisSeat(binding.seatKey)) {
    throw new Error("Travis dest never uses the Cursor send path");
  }
  await requireOpenMember(sessionId, binding.id);
  const seatKey = (binding.seatKey ?? "pm") as SeatKey;
  const seatLabel = binding.label ?? seatKeyToLabel(seatKey);

  if (await seatHasActiveRun(binding)) {
    if (params.enqueueIfBusy === false) {
      return { status: "busy", seatLabel };
    }
    const queue = await enqueueOnSeat({
      sessionId,
      binding,
      text: prompt,
      initiativeId,
    });
    const ahead = queue.seats.find((s) => s.seatKey === seatKey)?.items.length;
    return { status: "queued", waitingAhead: Math.max(0, (ahead ?? 1) - 1), seatLabel };
  }

  const gen = streamCursorReply({
    cursorAgentId: binding.cursorAgentId ?? "",
    prompt,
  });

  let event: CursorStreamEvent | undefined;
  try {
    // Walk only as far as the run identifying itself. Anything past that is
    // the harvester's job.
    for (let i = 0; i < 4; i++) {
      const next = await gen.next();
      if (next.done) break;
      event = next.value;
      if (
        event.type === "run_started" ||
        event.type === "busy" ||
        event.type === "done"
      ) {
        break;
      }
    }

    if (event?.type === "run_started") {
      const userTurn = await insertUserTurn(
        sessionId,
        prompt,
        seatKey,
        initiativeId,
      );
      await upsertLiveRun({
        bindingId: binding.id,
        sessionId,
        cursorRunId: event.runId,
        userTurnId: userTurn.id,
      });
      return { status: "started", runId: event.runId, seatLabel };
    }

    if (event?.type === "busy") {
      if (params.enqueueIfBusy === false) {
        return { status: "busy", seatLabel };
      }
      const queue = await enqueueOnSeat({
        sessionId,
        binding,
        text: prompt,
        discoveredRunId: event.discoveredRunId,
        initiativeId,
      });
      const ahead = queue.seats.find((s) => s.seatKey === seatKey)?.items.length;
      return {
        status: "queued",
        waitingAhead: Math.max(0, (ahead ?? 1) - 1),
        seatLabel,
      };
    }

    if (event?.type === "done" && event.mode === "stand-in") {
      await insertUserTurn(sessionId, prompt, seatKey, initiativeId);
      await insertStatusTurn(sessionId, "stand-in");
      return { status: "stand-in", seatLabel };
    }

    const error =
      event?.type === "done" ? (event.error ?? "Cursor send failed") : "No run started";
    return { status: "error", seatLabel, error };
  } finally {
    // Closes our client handle. The Cursor run keeps going without us.
    await gen.return(undefined).catch(() => {});
  }
}
