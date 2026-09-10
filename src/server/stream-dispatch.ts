/**
 * SCP-035 — Do. Thin switch on classify. No speak. No motion board.
 * Hangs dest assemble / dest-follow / cancelCursorRun / invokeDeepAgent.
 */

import { destEnqueueIfBusy } from "@/lib/dest-follow";
import type { StreamIntent } from "@/lib/stream-intent";
import { cancelCursorRun, discoverActiveRunId } from "@/server/cursor-port";
import { destWithContextFor } from "@/server/dest-with-context";
import { listOpenDestJobs } from "@/server/dest-job";
import { dispatchToSeat } from "@/server/dispatch";
import { getLiveRun } from "@/server/queue";
import { generateTravisText } from "@/server/travis-openai";
import { handToDest } from "@/server/travis-tools";

export type StreamDispatchSkip = {
  seatKeys?: Array<string | null | undefined>;
  bindingIds?: string[];
};

function skippedSeat(
  skip: StreamDispatchSkip | undefined,
  seatKey: string,
): boolean {
  return Boolean(skip?.seatKeys?.some((k) => k === seatKey));
}

function skippedBind(
  skip: StreamDispatchSkip | undefined,
  bindingId: string,
): boolean {
  return Boolean(skip?.bindingIds?.includes(bindingId));
}

async function destBody(sessionId: string, phrase: string): Promise<{
  ask: string;
  text: string;
}> {
  const ctx = await destWithContextFor(sessionId).catch(() => null);
  const ask = ctx?.ask?.trim() || phrase.trim();
  return { ask, text: ctx?.assembled?.trim() || ask };
}

export async function dispatchStreamIntents(params: {
  sessionId: string;
  phrase: string;
  intents: StreamIntent[];
  skip?: StreamDispatchSkip;
  /** Finalize backup: dest new/change only if that leave never started. */
  backupOnly?: boolean;
}): Promise<void> {
  const open = await listOpenDestJobs(params.sessionId).catch(() => []);
  for (const intent of params.intents) {
    if (intent.kind === "talk") continue;

    if (intent.kind === "new" && intent.target?.kind === "travis-thread") {
      if (params.backupOnly) continue;
      await generateTravisText({
        sessionId: params.sessionId,
        prompt: params.phrase,
        mode: "update",
      }).catch(() => "");
      continue;
    }

    if (intent.kind === "change" && intent.target?.kind === "travis-thread") {
      if (params.backupOnly) continue;
      await generateTravisText({
        sessionId: params.sessionId,
        prompt: params.phrase,
        mode: "update",
      }).catch(() => "");
      continue;
    }

    if (intent.kind === "new" && intent.target?.kind === "seat") {
      const seatKey = intent.target.seatKey;
      if (skippedSeat(params.skip, seatKey)) continue;
      if (
        params.backupOnly &&
        open.some((row) => row.binding.seatKey === seatKey)
      ) {
        continue;
      }
      const { ask, text } = await destBody(params.sessionId, params.phrase);
      await handToDest({
        sessionId: params.sessionId,
        seat: seatKey,
        who: "",
        text,
        ask,
        ticketHint: ask,
      }).catch(() => {});
      continue;
    }

    if (intent.kind === "change" && intent.target?.kind === "dest") {
      const target = intent.target;
      const row = open.find((r) => r.job.id === target.destJobId)
        ?? open.find((r) => r.binding.id === target.bindingId);
      if (!row) continue;
      if (skippedBind(params.skip, row.binding.id)) continue;
      const { text } = await destBody(params.sessionId, params.phrase);
      await dispatchToSeat({
        sessionId: params.sessionId,
        binding: row.binding,
        prompt: text,
        enqueueIfBusy: destEnqueueIfBusy("follow-up"),
      }).catch(() => {});
      continue;
    }

    if (intent.kind === "cancel" && intent.target?.kind === "dest") {
      const target = intent.target;
      const row = open.find((r) => r.job.id === target.destJobId)
        ?? open.find((r) => r.binding.id === target.bindingId);
      if (!row) continue;
      const agentId = row.binding.cursorAgentId ?? "";
      const live = await getLiveRun(row.binding.id).catch(() => null);
      let runId = live?.cursorRunId ?? null;
      if (!runId) runId = await discoverActiveRunId(agentId).catch(() => null);
      if (!runId || !agentId) continue;
      await cancelCursorRun(agentId, runId).catch(() => {});
    }
  }
}
