import { desc, eq } from "drizzle-orm";
import { absorbText, collapseSpeechStutter } from "@/lib/absorb-text";
import { matchConductorPhrase } from "@/lib/conductor";
import {
  parseCallByName,
  parseClarificationResponse,
  parseDeadManResponse,
  seatKeyToLabel,
} from "@/lib/router";
import { streamCursorReply } from "@/server/cursor-port";
import { db } from "@/server/db/client";
import {
  agentBinding,
  turnConductorPhrase,
  voiceSession,
  voiceTurn,
} from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";

type Body = { utterance: string };

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

async function nextSeq(sessionId: string) {
  const [last] = await db
    .select({ seq: voiceTurn.seq })
    .from(voiceTurn)
    .where(eq(voiceTurn.sessionId, sessionId))
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  return (last?.seq ?? 0) + 1;
}

async function bindingForSeat(seatKey: SeatKey) {
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, seatKey))
    .limit(1);
  return row;
}

async function setActiveBinding(sessionId: string, bindingId: string) {
  await db
    .update(voiceSession)
    .set({ activeBindingId: bindingId, bindingId })
    .where(eq(voiceSession.id, sessionId));
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const body = (await req.json()) as Body;
  const utterance = body.utterance ?? "";

  let [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status === "ended") {
    return Response.json({ error: "Session ended" }, { status: 400 });
  }

  const phrases = await db
    .select()
    .from(turnConductorPhrase)
    .where(eq(turnConductorPhrase.active, true));

  const match = matchConductorPhrase(
    utterance,
    phrases.map((p) => p.phrase),
  );

  // Dead-man: only short no / no X / yes. A real turn falls through and sends.
  if (session.routerState === "awaiting_dead_man") {
    const forRouter = match.matched ? match.cleanedText : utterance;
    const parsed = parseDeadManResponse(forRouter);
    if (parsed.action !== "ignore") {
      const targetKey =
        parsed.action === "seat" && parsed.seatKey
          ? parsed.seatKey
          : parsed.action === "stay"
            ? ((
                await db
                  .select()
                  .from(agentBinding)
                  .where(eq(agentBinding.id, session.activeBindingId))
                  .limit(1)
              )[0]?.seatKey as SeatKey | undefined) ?? "pm"
            : "pm";
      const binding = await bindingForSeat(targetKey);
      if (parsed.action !== "stay" && binding) {
        await setActiveBinding(sessionId, binding.id);
        [session] = await db
          .select()
          .from(voiceSession)
          .where(eq(voiceSession.id, sessionId))
          .limit(1);
      }
      await db
        .update(voiceSession)
        .set({ routerState: "normal" })
        .where(eq(voiceSession.id, sessionId));

      return Response.json({
        matched: false,
        routerHandled: true,
        activeSeatKey: targetKey,
        activeLabel: binding?.label ?? seatKeyToLabel(targetKey),
      });
    }
    await db
      .update(voiceSession)
      .set({ routerState: "normal" })
      .where(eq(voiceSession.id, sessionId));
    [session] = await db
      .select()
      .from(voiceSession)
      .where(eq(voiceSession.id, sessionId))
      .limit(1);
  }

  // Router: clarification
  if (session.routerState === "awaiting_clarification") {
    const seatKey = parseClarificationResponse(
      match.matched ? match.cleanedText : utterance,
    );
    if (!seatKey) {
      return Response.json({
        matched: false,
        routerHandled: false,
        needClarification: true,
      });
    }
    const binding = await bindingForSeat(seatKey);
    if (binding) await setActiveBinding(sessionId, binding.id);
    await db
      .update(voiceSession)
      .set({ routerState: "normal" })
      .where(eq(voiceSession.id, sessionId));

    return Response.json({
      matched: false,
      routerHandled: true,
      activeSeatKey: seatKey,
      activeLabel: binding?.label ?? seatKeyToLabel(seatKey),
    });
  }

  if (!match.matched) {
    return Response.json({
      matched: false,
      cleanedText: match.cleanedText,
    });
  }

  let prompt = collapseSpeechStutter(match.cleanedText.trim());
  const { seatKey: calledSeat, remainder } = parseCallByName(prompt);
  if (calledSeat) {
    const binding = await bindingForSeat(calledSeat);
    if (binding) {
      await setActiveBinding(sessionId, binding.id);
      [session] = await db
        .select()
        .from(voiceSession)
        .where(eq(voiceSession.id, sessionId))
        .limit(1);
    }
    prompt = collapseSpeechStutter(remainder.trim());
  }

  if (!prompt) {
    if (calledSeat) {
      const binding = await bindingForSeat(calledSeat);
      return Response.json({
        matched: false,
        routerHandled: true,
        activeSeatKey: calledSeat,
        activeLabel: binding?.label ?? seatKeyToLabel(calledSeat),
      });
    }
    return Response.json(
      {
        matched: true,
        error: "Conductor matched but no prompt text left after routing strip.",
      },
      { status: 400 },
    );
  }

  let seq = await nextSeq(sessionId);

  const [userTurn] = await db
    .insert(voiceTurn)
    .values({
      sessionId,
      seq,
      role: "user",
      kind: "user",
      speakable: true,
      text: prompt,
    })
    .returning();
  seq += 1;

  const [binding] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session!.activeBindingId))
    .limit(1);

  const seatKey = (binding?.seatKey ?? "pm") as SeatKey;
  const seatLabel = binding?.label ?? seatKeyToLabel(seatKey);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };

      let thoughtTurnId: string | null = null;
      let thoughtText = "";
      let postText = "";

      try {
        send("matched", {
          matched: true,
          matchedPhrase: match.matchedPhrase,
          userTurn,
          activeSeatKey: seatKey,
          activeLabel: seatLabel,
        });
        send("status", { text: "running" });

        let donePayload: {
          mode: string;
          statusText: string;
          error?: string;
        } | null = null;

        for await (const ev of streamCursorReply({
          cursorAgentId: binding?.cursorAgentId ?? "",
          prompt,
        })) {
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
          } else if (ev.type === "post_delta") {
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
            donePayload = {
              mode: ev.mode,
              statusText: ev.statusText,
              error: ev.error,
            };
          }
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

        const bareError = donePayload?.mode === "error" && !postText.trim();
        let postTurn: (typeof userTurn) | null = null;
        if (!bareError) {
          const finalPost =
            postText.trim() || "Run finished (no assistant text).";
          const [row] = await db
            .insert(voiceTurn)
            .values({
              sessionId,
              seq,
              role: "assistant",
              kind: "agent_post",
              seatKey,
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
          send("error", {
            error: donePayload?.error ?? "Cursor send failed",
          });
        }

        send("done", {
          matched: true,
          mode: donePayload?.mode ?? "real",
          matchedPhrase: match.matchedPhrase,
          seatKey,
          seatLabel,
          postTurn,
          thoughtTurnId,
          turns: postTurn
            ? [userTurn, postTurn, statusTurn]
            : [userTurn, statusTurn],
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send("error", { error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
