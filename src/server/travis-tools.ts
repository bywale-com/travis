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
import { clampRequestLimit, parseRequestWhen } from "@/lib/request-log";
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
  searchRoomText,
} from "@/server/room-read";
import { insertAgentPostTurn } from "@/server/seat-pipe";
import { summarizeSeatReply } from "@/server/travis-summarize";
import {
  addMember,
  endRoom,
  MembershipError,
  renameRoom,
  requireOpenMember,
  roomSeats,
} from "@/server/room-membership";
import { createAgentBinding } from "@/server/create-agent";
import {
  ensureViaTravis,
  formatInitiativeList,
  formatInitiativeRead,
  InitiativeError,
  listInitiatives,
  markInitiativeDone,
  readInitiative,
  renameInitiative,
  stampLatestPassOn,
} from "@/server/initiative";
import type { InitiativeStatus } from "@/server/db/schema";
import {
  OsHouseError,
  formatOsList,
  formatOsWrite,
  listOs,
  readOs,
  writeOsAsTravis,
} from "@/server/os-house";
import {
  MotionError,
  filePlan,
  formatBacklogToolText,
  formatFilePlanResult,
  listBacklog,
} from "@/server/motion";
import { parseBacklogView } from "@/lib/motion";

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
    name: "search_room",
    description:
      "Search this room's request log — every line the founder or you sent, with UTC timestamps, not just the short window you are shown. Leave q off to list the newest. when=today is this UTC day; when=week is the last 7 days; omit when for all. limit is the last N (e.g. 10). Pass seat to only see what went to PM, SA, Engineer, or Travis. Everyone this week = when week, no seat.",
    parameters: {
      type: "object",
      properties: {
        q: { type: "string" },
        seat: { type: "string", enum: ["pm", "sa", "engineer", "travis"] },
        when: { type: "string", enum: ["today", "week", "all"] },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "list_initiatives",
    description:
      "List this room's backlog — initiatives you are orchestrating, not every request. Default is open. Pass status done or all to see closed ones. when=today is this UTC day; when=week is the last 7 days; omit when for all. q matches title, founding line, stamped messages, or artifact filenames. A miss is an empty list — do not invent a ticket.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["open", "done", "all"] },
        when: { type: "string", enum: ["today", "week", "all"] },
        q: { type: "string" },
      },
    },
  },
  {
    name: "read_initiative",
    description:
      "Read one initiative: founding line, each seat's canonical post, files that landed, and whose turn is next.",
    parameters: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "mark_initiative_done",
    description:
      "Mark an initiative done. The pipe finished. A seat post does not close it — only this or the founder.",
    parameters: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "rename_initiative",
    description:
      "Rename one initiative in the catalog. Same write as the founder PATCH. Does not change the founding line. Do not name a ticket when you mint it — only when they ask to rename.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
      },
      required: ["id", "title"],
    },
  },
  {
    name: "rename_room",
    description:
      "Rename this room. Same write as the founder. Empty title is Untitled. Only this room — you cannot see or rename other rooms. Only when they ask. Do not invent a name.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
      },
      required: ["title"],
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
    name: "list_os",
    description:
      "List a folder in Travis's house — protocols and templates, not rooms and not a work repo. Default path is /. Reading this house is not unfolding a template into a repo.",
    parameters: {
      type: "object",
      properties: { path: { type: "string" } },
    },
  },
  {
    name: "read_os",
    description:
      "Read one file in Travis's house (a protocol or template file). Not a work-repo file. Not a room log. If the path is a folder, use list_os.",
    parameters: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "write_os",
    description:
      "File text into Travis's house — a protocol or template path. Overwrite is allowed. Does not write into a work repo. Does not change the room. Empty body is refused.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string" },
        body: { type: "string" },
      },
      required: ["path", "body"],
    },
  },
  {
    name: "create_agent",
    description:
      "Create a person in the catalog the same way the Create an agent screen does. Name them. Optional model, repository, and ref. join defaults true — they become a member of this room. join false is catalog only. You do not assign a role. You do not invent a Cursor id. Prompt stays the one-line stub. Not a seated protocol.",
    parameters: {
      type: "object",
      properties: {
        label: { type: "string" },
        model: { type: "string" },
        repository: { type: "string" },
        ref: { type: "string" },
        join: { type: "boolean" },
      },
      required: ["label"],
    },
  },
  {
    name: "file_plan",
    description:
      "File an ordered sequence of your own tools as a Travis process and stay with the founder. The runner advances the steps after you return. Use this when several of your tools should run in a row (list then rename, two writes). Each step is one allowlisted tool plus frozen args. Cannot include send_to_seat, dispatch_to_seat, barge_or_drop, end_session, set_view, file_plan, or create_agent. Title empty clips the latest user line.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              tool: { type: "string" },
              args: { type: "object" },
            },
            required: ["tool"],
          },
        },
      },
      required: ["steps"],
    },
  },
  {
    name: "list_backlog",
    description:
      "Glance the backlog pile: Travis processes and tickets. view=all is both. view=in_motion is only processes still waiting, running, or failed. view=initiatives is only tickets. Use this when they ask how a plan is coming. Do not invent progress.",
    parameters: {
      type: "object",
      properties: {
        view: { type: "string", enum: ["all", "in_motion", "initiatives"] },
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
    const prior = await ensureViaTravis(sessionId);
    const seatLabel = binding.label ?? seatKeyToLabel(seat as SeatKey);
    const startedAt = Date.now();
    let errored = false;
    let replyChars = 0;
    const outcome = await sendOrEnqueue({
      sessionId,
      binding,
      prompt: text,
      initiativeId: prior?.id,
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
    await stampLatestPassOn(sessionId, seat, text).catch(() => {});
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
    const prior = await ensureViaTravis(sessionId);
    const outcome = await dispatchToSeat({
      sessionId,
      binding,
      prompt: text,
      initiativeId: prior?.id,
    });
    if (outcome.status !== "error") {
      await stampLatestPassOn(sessionId, seat, text).catch(() => {});
    }
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

  if (name === "list_initiatives") {
    const status = ["open", "done", "all"].includes(String(args.status ?? ""))
      ? (String(args.status) as InitiativeStatus | "all")
      : "open";
    const when = parseRequestWhen(args.when ?? "all");
    const q = typeof args.q === "string" ? args.q : "";
    const items = await listInitiatives(sessionId, { status, when, q });
    return { ok: true, text: formatInitiativeList(items) };
  }

  if (name === "read_initiative") {
    const id = String(args.id ?? "").trim();
    if (!id) return { ok: false, text: "Need an initiative id." };
    try {
      const ticket = await readInitiative(sessionId, id);
      return { ok: true, text: formatInitiativeRead(ticket) };
    } catch (err) {
      if (err instanceof InitiativeError) return { ok: false, text: err.message };
      throw err;
    }
  }

  if (name === "mark_initiative_done") {
    const id = String(args.id ?? "").trim();
    if (!id) return { ok: false, text: "Need an initiative id." };
    try {
      await markInitiativeDone(sessionId, id);
      return { ok: true, text: "Initiative marked done." };
    } catch (err) {
      if (err instanceof InitiativeError) return { ok: false, text: err.message };
      throw err;
    }
  }

  if (name === "rename_initiative") {
    const id = String(args.id ?? "").trim();
    const title = typeof args.title === "string" ? args.title : "";
    if (!id) return { ok: false, text: "Need an initiative id." };
    try {
      const row = await renameInitiative(sessionId, id, title);
      return { ok: true, text: `Renamed to ${row.title}.` };
    } catch (err) {
      if (err instanceof InitiativeError) return { ok: false, text: err.message };
      throw err;
    }
  }

  if (name === "rename_room") {
    const title = typeof args.title === "string" ? args.title : "";
    const row = await renameRoom(sessionId, title);
    if (!row) return { ok: false, text: "Room not found." };
    const name = row.title.trim() || "Untitled";
    return { ok: true, text: `Room renamed to ${name}.` };
  }

  if (name === "search_room") {
    const q = typeof args.q === "string" ? args.q : "";
    const seat = ["pm", "sa", "engineer", "travis"].includes(String(args.seat ?? ""))
      ? String(args.seat)
      : undefined;
    const when = parseRequestWhen(args.when);
    const limit = args.limit != null ? clampRequestLimit(args.limit) : undefined;
    const text = await searchRoomText(sessionId, { q, seat, when, limit });
    return { ok: true, text };
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

  if (name === "list_os") {
    try {
      const list = await listOs(
        typeof args.path === "string" ? args.path : "/",
      );
      return { ok: true, text: formatOsList(list) };
    } catch (err) {
      if (err instanceof OsHouseError) return { ok: false, text: err.message };
      throw err;
    }
  }

  if (name === "read_os") {
    try {
      const file = await readOs(String(args.path ?? ""));
      return { ok: true, text: file.body };
    } catch (err) {
      if (err instanceof OsHouseError) return { ok: false, text: err.message };
      throw err;
    }
  }

  if (name === "write_os") {
    try {
      const filed = await writeOsAsTravis(
        String(args.path ?? ""),
        args.body,
      );
      return { ok: true, text: formatOsWrite(filed.path) };
    } catch (err) {
      if (err instanceof OsHouseError) return { ok: false, text: err.message };
      throw err;
    }
  }

  if (name === "file_plan") {
    try {
      const filed = await filePlan(sessionId, {
        title: typeof args.title === "string" ? args.title : "",
        steps: args.steps,
      });
      return { ok: true, text: formatFilePlanResult(filed) };
    } catch (err) {
      if (err instanceof MotionError) return { ok: false, text: err.message };
      throw err;
    }
  }

  if (name === "create_agent") {
    const label = String(args.label ?? "").trim();
    if (!label) return { ok: false, text: "Name the agent." };
    const join = args.join === false || args.join === "false" ? false : true;
    try {
      const agent = await createAgentBinding({
        label,
        model: args.model ? String(args.model) : undefined,
        repository: args.repository ? String(args.repository) : undefined,
        ref: args.ref ? String(args.ref) : undefined,
      });
      if (join) {
        try {
          await addMember(sessionId, agent.id);
        } catch (err) {
          if (err instanceof MembershipError) {
            return {
              ok: true,
              text: `Created ${agent.label}. They are not in this room — ${err.message}`,
            };
          }
          throw err;
        }
        return { ok: true, text: `Created ${agent.label} in this room.` };
      }
      return { ok: true, text: `Created ${agent.label} in the catalog.` };
    } catch (err) {
      return {
        ok: false,
        text: err instanceof Error ? err.message : "Could not create the agent.",
      };
    }
  }

  if (name === "list_backlog") {
    const view = parseBacklogView(args.view);
    const pile = await listBacklog(sessionId, { view, status: "all" });
    return { ok: true, text: formatBacklogToolText(view, pile) };
  }

  if (name === "end_session") {
    const session = await endRoom(sessionId);
    if (!session) return { ok: false, text: "Session not found." };
    return { ok: true, text: "Room ended." };
  }

  return { ok: false, text: `Unknown tool ${name}.` };
}

export const TRAVIS_SYSTEM = `You are Travis. You are in this room with the founder and three Cursor seats: PM, SA, and Engineer. You are your own agent — not those seats.

Answer the founder. Use tools when they ask you to send a line to a seat, glance the queue, barge/drop a waiting line, switch Voice/Log, file something into your house, create a person, or end the room.

You own a house that is not this room and not a work repo: list_os, read_os, write_os. It holds protocols and templates (paths like /protocols and /templates). Opening a folder there does not leave this room. Reading a protocol is not unfolding it into a repo. You still cannot see a work repository, a diff, a branch, a test run, or CI. You have no view of the code and no way to check whether anything passed. If the founder asks for a code review, a test check, a migration risk assessment, a rollout plan, or anything else that needs the repo, say plainly that you cannot see it and offer to send it to the Engineer, SA or PM. Never describe a review, a check, or an analysis you are not able to perform. The room and the tools listed above are your entire view of the world — reading about work in the room log is not the same as being able to do it.

You are shown a short room-state block with recent turns and what is running. Treat it as already true — do not ask the founder to repeat something that is in it. Seat replies appear there only as receipts; call read_seat_reply when you need what a seat actually said. The window is not the whole room. When they ask what was requested, what is in motion, or what you already routed to a seat, call search_room. That log has UTC timestamps and stays in this room. “Requests today” → when today. “Last 10” → limit 10. “Everyone this week” → when week, no seat. Do not invent a list — call the tool.

The backlog is separate. search_room is every line. Initiatives are only what you passed on, or what they promoted with Hold. list_initiatives / read_initiative / rename_initiative / mark_initiative_done for that pipe. “This week” → list_initiatives when week. “The artifact one” → list_initiatives q. A miss is an empty list — do not invent a ticket. You do not name a ticket when you mint it. rename_initiative only when they ask to rename. A seat finishing does not mark it done — you or they do. list_initiatives and read_initiative print each ticket's id — use that id on rename_initiative; do not guess.

The turn is not the work. Several of your own tools in a row — list then rename, two writes, a glance then a write — file them with file_plan and stay with the founder. send_to_seat is one blocking hand, not a batch and not a plan step. Glance / “how is that coming?” → list_backlog. Do not invent progress. A filed plan keeps running after you have already answered.

You can create a person with create_agent — a name, optional model and repo. Same write as the Create an agent screen. You do not assign a role. You do not invent a Cursor id. join defaults to this room as a member. join false is catalog only.

rename_room names this room. Only when they ask. Do not invent a name for an untitled room. You cannot list or rename other rooms.

How a request becomes a backlog ticket is not a judgment call. The founder Holds an unmarked line, or you pass work to a seat and the harness stamps it. Direct-to-seat stays off the backlog. Do not invent an elevation rule. If they ask what is on the backlog, call list_initiatives. If they ask you to rename this room, call rename_room.

Report what the tools actually told you.

Two ways to send. send_to_seat blocks until that seat finishes and is right when the founder asked one thing and wants the answer in the same breath. dispatch_to_seat returns straight away and is right for everything else — several sends, "don't wait", or any time you should stay available while a seat works. Prefer dispatch when the founder is talking to you out loud.

Several send_to_seat calls in one turn go one after the other; never describe them as parallel or simultaneous. A seat runs one job at a time, so two lines to the same seat are always sequential no matter which tool you use — say so plainly instead of promising parallelism you cannot deliver. Different seats do run at the same time when dispatched.

If you are asked what you are doing or why something is slow, call work_in_flight instead of guessing.

send_to_seat does not change who they are talking to. They stay with you.

Never invent Cursor agent ids. Never speak a bc- id. Never claim to be PM, SA, or Engineer.`;
