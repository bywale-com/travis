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
import { deleteQueuedItem, queueSnapshot } from "@/server/queue";
import { bargeQueuedItem, sendOrEnqueue } from "@/server/seat-pipe";

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
      "Send a line to PM, SA, or Engineer on the existing Cursor pipe. Does not change who you are talking to (stays Travis).",
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
    description: "End this room.",
    parameters: { type: "object", properties: {} },
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

export async function runTravisTool(params: {
  sessionId: string;
  name: string;
  args: Record<string, unknown>;
}): Promise<ToolResult> {
  const { sessionId, name, args } = params;

  if (name === "list_seats") {
    const rows = await db
      .select({
        seatKey: agentBinding.seatKey,
        label: agentBinding.label,
      })
      .from(agentBinding)
      .where(eq(agentBinding.active, true));
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
    const chunks: string[] = [];
    await sendOrEnqueue({
      sessionId,
      binding,
      prompt: text,
      send: (event, data) => {
        if (event === "queued") chunks.push("queued");
        if (event === "done") chunks.push("sent");
        void data;
      },
    });
    return {
      ok: true,
      text: chunks.includes("queued")
        ? `Queued for ${seatKeyToLabel(seat as SeatKey)}.`
        : `Sent to ${seatKeyToLabel(seat as SeatKey)}.`,
      sentToEngineer: seat === "engineer",
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
    if (!head) return { ok: true, text: "Nothing waiting on that seat." };
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
    await db
      .update(voiceSession)
      .set({
        status: "ended",
        endedAt: new Date(),
        travisLiveHandle: null,
      })
      .where(eq(voiceSession.id, sessionId));
    return { ok: true, text: "Room ended." };
  }

  return { ok: false, text: `Unknown tool ${name}.` };
}

export const TRAVIS_SYSTEM = `You are Travis. You are in this room with the founder and three Cursor seats: PM, SA, and Engineer. You are your own agent — not those seats.

Answer the founder. Use tools when they ask you to send a line to a seat, glance the queue, barge/drop a waiting line, switch Voice/Log, or end the room.

send_to_seat does not change who they are talking to. They stay with you.

Never invent Cursor agent ids. Never speak a bc- id. Never claim to be PM, SA, or Engineer.`;
