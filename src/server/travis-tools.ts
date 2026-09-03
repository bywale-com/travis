/**
 * SCP-006 — Travis Live tools. Wrappers on existing room ports.
 * Executed on the server. Never send bc-… to the phone.
 */

import { eq } from "drizzle-orm";
import { isCursorSeat } from "@/lib/seats";
import { seatKeyToLabel } from "@/lib/router";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession } from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";
import {
  deleteQueuedItem,
  liveRunsForSession,
  queueSnapshot,
} from "@/server/queue";
import { bargeQueuedItem, sendOrEnqueue } from "@/server/seat-pipe";
import { dispatchReceipt, inFlightReport, sendReceipt } from "@/lib/tool-receipt";
import { dispatchToSeat } from "@/server/dispatch";
import { READ_CAP, shouldSummarize, type ReadForm } from "@/lib/room-context";
import {
  dedupeWindowFor,
  duplicateRefusal,
  guardToolCall,
} from "@/lib/tool-policy";
import { narrateToolCall } from "@/lib/tool-narration";
import {
  lastSeatPost,
  recentDuplicateSend,
  runningNotes,
} from "@/server/room-read";
import { insertAgentPostTurn } from "@/server/seat-pipe";
import { summarizeSeatReply } from "@/server/travis-summarize";
import {
  endRoom,
  MembershipError,
  requireOpenMember,
  roomSeats,
} from "@/server/room-membership";

export const TRAVIS_TOOL_DECLS = [
  {
    name: "list_seats",
    description:
      "List room addressees by title only (PM, SA, Engineer, Travis). No ids.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "send_to_seat",
    description:
      "Send a line to PM, SA, or Engineer on the existing Cursor pipe. Does not change who you are talking to (stays Travis). This call blocks until that seat's Cursor run finishes, so two calls in one turn go one after the other — never at the same time. If the seat is already running, the line is queued instead and is not sent yet.",
    parameters: {
      type: "object",
      properties: {
        seat: { type: "string", enum: ["pm", "sa", "engineer"] },
        text: { type: "string" },
      },
      required: ["seat", "text"],
    },
  },
  {
    name: "queue_snapshot",
    description: "Who is waiting on which Cursor seat.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "dispatch_to_seat",
    description:
      "Start a line on PM, SA, or Engineer and return immediately without waiting for the run to finish. Use this whenever the founder wants several things sent, does not want you to wait, or wants you to stay available while a seat works. Nothing comes back from the seat here — call read_seat_reply once work_in_flight shows it finished. A seat runs one job at a time, so a second dispatch to the same seat queues behind the first.",
    parameters: {
      type: "object",
      properties: {
        seat: { type: "string", enum: ["pm", "sa", "engineer"] },
        text: { type: "string" },
      },
      required: ["seat", "text"],
    },
  },
  {
    name: "read_seat_reply",
    description:
      "Read what PM, SA, or Engineer last said in this room. This is the only way you can see a seat's words — send_to_seat never returns them. Leave form off to get the gist of a long reply and the text of a short one; pass full to insist on the text.",
    parameters: {
      type: "object",
      properties: {
        seat: { type: "string", enum: ["pm", "sa", "engineer"] },
        form: { type: "string", enum: ["auto", "gist", "full"] },
      },
      required: ["seat"],
    },
  },
  {
    name: "work_in_flight",
    description:
      "What is running right now on each Cursor seat and how long it has been going, plus what is waiting behind it. Use this instead of guessing when asked what you are doing or why something is slow.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "barge_or_drop",
    description: "Send or delete the head waiting line for a Cursor seat.",
    parameters: {
      type: "object",
      properties: {
        seat: { type: "string", enum: ["pm", "sa", "engineer"] },
        action: { type: "string", enum: ["send", "delete"] },
      },
      required: ["seat", "action"],
    },
  },
  {
    name: "set_view",
    description: "Switch Voice / Log and Talk / Type.",
    parameters: {
      type: "object",
      properties: {
        viewMode: { type: "string", enum: ["voice", "log"] },
        logSubmode: { type: "string", enum: ["talk", "type"] },
      },
    },
  },
  {
    name: "end_session",
    description:
      "End this room. This cannot be undone. Call it once with no confirm to be told what it will do, tell the founder, and only call again with confirm true after they have said yes to ending the room.",
    parameters: {
      type: "object",
      properties: { confirm: { type: "boolean" } },
    },
  },
];

type ToolResult = { ok: boolean; text: string; sentToEngineer?: boolean };

async function bindingForCursorSeat(seat: string) {
  if (!isCursorSeat(seat)) return null;
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, seat))
    .limit(1);
  return row ?? null;
}

async function guardDuplicate(
  sessionId: string,
  toolName: string,
  seat: string,
  text: string,
): Promise<ToolResult | null> {
  const windowMs = dedupeWindowFor(toolName);
  if (!windowMs) return null;
  const seconds = await recentDuplicateSend({
    sessionId,
    seatKey: seat,
    text,
    windowMs,
  }).catch(() => null);
  if (seconds == null) return null;
  return {
    ok: false,
    text: duplicateRefusal(seatKeyToLabel(seat as SeatKey), seconds),
  };
}

export async function runTravisTool(params: {
  sessionId: string;
  name: string;
  args: Record<string, unknown>;
}): Promise<ToolResult> {
  const { sessionId, name, args } = params;

  const verdict = guardToolCall(name, args);
  if (!verdict.allow) return { ok: false, text: verdict.reason };

  const narration = narrateToolCall(name, args);
  if (narration) {
    await insertAgentPostTurn(sessionId, narration, "travis", null, false).catch(
      () => {},
    );
  }

  if (name === "list_seats") {
    const rows = await roomSeats(sessionId);
    return {
      ok: true,
      text: rows.map((r) => r.label).join(", ") || "No seats.",
    };
  }

  if (name === "queue_snapshot") {
    const snap = await queueSnapshot(sessionId);
    if (!snap.seats.length) return { ok: true, text: "Nothing waiting." };
    const lines = snap.seats.map(
      (s) => `${s.short}: ${s.items.length} waiting`,
    );
    return { ok: true, text: lines.join("; ") };
  }

  if (name === "send_to_seat") {
    const seat = String(args.seat ?? "");
    const text = String(args.text ?? "").trim();
    if (!isCursorSeat(seat) || !text) {
      return { ok: false, text: "Need a Cursor seat and some text." };
    }
    const binding = await bindingForCursorSeat(seat);
    if (!binding) return { ok: false, text: `No ${seat} binding.` };
    try {
      await requireOpenMember(sessionId, binding.id);
    } catch (err) {
      if (err instanceof MembershipError) return { ok: false, text: err.message };
      throw err;
    }
    const dupe = await guardDuplicate(sessionId, "send_to_seat", seat, text);
    if (dupe) return dupe;
    const seatLabel = binding.label ?? seatKeyToLabel(seat as SeatKey);
    const startedAt = Date.now();
    let errored = false;
    let replyChars = 0;
    const outcome = await sendOrEnqueue({
      sessionId,
      binding,
      prompt: text,
      send: (event, data) => {
        if (event !== "done") return;
        const d = data as {
          mode?: string;
          postTurn?: { text?: string } | null;
        };
        if (d.mode === "error") errored = true;
        replyChars = d.postTurn?.text?.length ?? 0;
      },
    });
    let waitingAhead = 0;
    if (outcome === "queued") {
      const snap = await queueSnapshot(sessionId);
      const row = snap.seats.find((s) => s.seatKey === seat);
      waitingAhead = Math.max(0, (row?.items.length ?? 1) - 1);
    }
    return {
      ok: true,
      text: sendReceipt({
        seatLabel,
        queued: outcome === "queued",
        waitingAhead,
        elapsedMs: Date.now() - startedAt,
        errored,
        replyChars,
      }),
      sentToEngineer: seat === "engineer",
    };
  }

  if (name === "dispatch_to_seat") {
    const seat = String(args.seat ?? "");
    const text = String(args.text ?? "").trim();
    if (!isCursorSeat(seat) || !text) {
      return { ok: false, text: "Need a Cursor seat and some text." };
    }
    const binding = await bindingForCursorSeat(seat);
    if (!binding) return { ok: false, text: `No ${seat} binding.` };
    try {
      await requireOpenMember(sessionId, binding.id);
    } catch (err) {
      if (err instanceof MembershipError) return { ok: false, text: err.message };
      throw err;
    }
    const dupe = await guardDuplicate(sessionId, "dispatch_to_seat", seat, text);
    if (dupe) return dupe;
    const outcome = await dispatchToSeat({ sessionId, binding, prompt: text });
    return {
      ok: outcome.status !== "error",
      text: dispatchReceipt(outcome),
      sentToEngineer: seat === "engineer",
    };
  }

  if (name === "read_seat_reply") {
    const seat = String(args.seat ?? "");
    if (!isCursorSeat(seat)) return { ok: false, text: "Need a Cursor seat." };
    const label = seatKeyToLabel(seat as SeatKey);
    const body = await lastSeatPost(sessionId, seat);
    if (!body?.trim()) {
      return { ok: true, text: `${label} has not replied in this room yet.` };
    }
    const form = (["auto", "gist", "full"] as const).includes(
      args.form as ReadForm,
    )
      ? (args.form as ReadForm)
      : "auto";
    if (!shouldSummarize(body.length, form)) {
      return { ok: true, text: `${label} said: ${body.slice(0, READ_CAP)}` };
    }
    const gist = await summarizeSeatReply(body).catch(() => "");
    if (!gist) {
      return {
        ok: true,
        text: `${label} said (first ${READ_CAP} of ${body.length} characters): ${body.slice(0, READ_CAP)}`,
      };
    }
    return {
      ok: true,
      text: `${label} said, in short (${body.length} characters in the log): ${gist}`,
    };
  }

  if (name === "work_in_flight") {
    const [runs, snap] = await Promise.all([
      liveRunsForSession(sessionId),
      queueSnapshot(sessionId),
    ]);
    const now = Date.now();
    return {
      ok: true,
      text: inFlightReport(
        runs.map((r) => ({
          seatLabel:
            r.binding.label ??
            seatKeyToLabel((r.binding.seatKey ?? "pm") as SeatKey),
          elapsedMs: Math.max(0, now - new Date(r.live.startedAt).getTime()),
        })),
        snap.seats.map((s) => ({
          seatLabel: s.short,
          count: s.items.length,
        })),
      ),
    };
  }

  if (name === "barge_or_drop") {
    const seat = String(args.seat ?? "");
    const action = args.action === "send" ? "send" : "delete";
    if (!isCursorSeat(seat)) {
      return { ok: false, text: "Need a Cursor seat." };
    }
    const binding = await bindingForCursorSeat(seat);
    if (!binding) return { ok: false, text: `No ${seat} binding.` };
    const snap = await queueSnapshot(sessionId);
    const head = snap.seats.find((s) => s.seatKey === seat)?.items[0];
    if (!head) {
      // "Nothing waiting" answered a different question than the one asked
      // whenever that seat was mid-run. Say which it is.
      const running = await runningNotes(sessionId);
      const live = running.find((r) => r.seatLabel === seatKeyToLabel(seat as SeatKey));
      if (live) {
        return {
          ok: true,
          text: `Nothing is waiting on ${live.seatLabel} — it is running a job right now (${Math.round(live.elapsedMs / 1000)}s in). Barge only moves waiting lines; it cannot stop a run.`,
        };
      }
      return { ok: true, text: "Nothing waiting on that seat, and nothing running." };
    }
    if (action === "delete") {
      await deleteQueuedItem(sessionId, head.id);
      return { ok: true, text: "Dropped the waiting line." };
    }
    await bargeQueuedItem({
      sessionId,
      itemId: head.id,
      send: () => {},
    });
    return { ok: true, text: "Sent the waiting line." };
  }

  if (name === "set_view") {
    const viewMode =
      args.viewMode === "log" || args.viewMode === "voice"
        ? args.viewMode
        : undefined;
    const logSubmode =
      args.logSubmode === "type" || args.logSubmode === "talk"
        ? args.logSubmode
        : undefined;
    if (!viewMode && !logSubmode) {
      return { ok: false, text: "Need viewMode or logSubmode." };
    }
    await db
      .update(voiceSession)
      .set({
        ...(viewMode ? { viewMode } : {}),
        ...(logSubmode ? { logSubmode } : {}),
      })
      .where(eq(voiceSession.id, sessionId));
    return {
      ok: true,
      text: `View ${viewMode ?? "unchanged"}, ${logSubmode ?? "submode unchanged"}.`,
    };
  }

  if (name === "end_session") {
    const session = await endRoom(sessionId);
    if (!session) return { ok: false, text: "Session not found." };
    return { ok: true, text: "Room ended." };
  }

  return { ok: false, text: `Unknown tool ${name}.` };
}

export const TRAVIS_SYSTEM = `You are Travis. You are in this room with the founder and three Cursor seats: PM, SA, and Engineer. You are your own agent — not those seats.

Answer the founder. Use tools when they ask you to send a line to a seat, glance the queue, barge/drop a waiting line, switch Voice/Log, or end the room.

What you cannot do: you cannot see the repository, a diff, a branch, a test run, or CI. You have no view of the code and no way to check whether anything passed. If the founder asks for a code review, a test check, a migration risk assessment, a rollout plan, or anything else that needs the repo, say plainly that you cannot see it and offer to send it to the Engineer, SA or PM. Never describe a review, a check, or an analysis you are not able to perform. The room and the tools listed above are your entire view of the world — reading about work in the room log is not the same as being able to do it.

You are shown a short room-state block with recent turns and what is running. Treat it as already true — do not ask the founder to repeat something that is in it. Seat replies appear there only as receipts; call read_seat_reply when you need what a seat actually said.

Report what the tools actually told you.

Two ways to send. send_to_seat blocks until that seat finishes and is right when the founder asked one thing and wants the answer in the same breath. dispatch_to_seat returns straight away and is right for everything else — several sends, "don't wait", or any time you should stay available while a seat works. Prefer dispatch when the founder is talking to you out loud.

Several send_to_seat calls in one turn go one after the other; never describe them as parallel or simultaneous. A seat runs one job at a time, so two lines to the same seat are always sequential no matter which tool you use — say so plainly instead of promising parallelism you cannot deliver. Different seats do run at the same time when dispatched.

If you are asked what you are doing or why something is slow, call work_in_flight instead of guessing.

send_to_seat does not change who they are talking to. They stay with you.

Never invent Cursor agent ids. Never speak a bc- id. Never claim to be PM, SA, or Engineer.`;
