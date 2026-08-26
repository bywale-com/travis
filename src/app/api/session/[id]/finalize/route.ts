import { desc, eq } from "drizzle-orm";
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

  // Router: dead-man response (short utterance, no conductor required)
  if (session.routerState === "awaiting_dead_man") {
    const parsed = parseDeadManResponse(utterance);
    const targetKey =
      parsed.action === "seat" && parsed.seatKey ? parsed.seatKey : "pm";
    const binding = await bindingForSeat(targetKey);
    if (binding) {
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

  // Router: clarification
  if (session.routerState === "awaiting_clarification") {
    const seatKey = parseClarificationResponse(utterance);
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

  const phrases = await db
    .select()
    .from(turnConductorPhrase)
    .where(eq(turnConductorPhrase.active, true));

  const match = matchConductorPhrase(
    utterance,
    phrases.map((p) => p.phrase),
  );

  if (!match.matched) {
    return Response.json({
      matched: false,
      cleanedText: match.cleanedText,
    });
  }

  let prompt = match.cleanedText.trim();
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
    prompt = remainder.trim();
  }

  if (!prompt) {
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
        } | null = null;

        for await (const ev of streamCursorReply({
          cursorAgentId: binding?.cursorAgentId ?? "",
          prompt,
        })) {
          if (ev.type === "status") {
            send("status", { text: ev.text });
          } else if (ev.type === "thought_delta") {
            thoughtText += ev.text;
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
                  text: ev.text,
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
          } else if (
            ev.type === "post_delta" ||
            ev.type === "delta"
          ) {
            postText += ev.text;
            send("post_delta", { text: ev.text, seatKey, seatLabel });
          } else if (ev.type === "done") {
            if (!postText.trim()) postText = ev.assistantText;
            if (!thoughtText.trim() && ev.thoughtText) thoughtText = ev.thoughtText;
            donePayload = {
              mode: ev.mode,
              statusText: ev.statusText,
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

        const finalPost =
          postText.trim() || "Run finished (no assistant text).";

        const [postTurn] = await db
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
        seq += 1;

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

        send("done", {
          matched: true,
          mode: donePayload?.mode ?? "real",
          matchedPhrase: match.matchedPhrase,
          seatKey,
          seatLabel,
          postTurn,
          thoughtTurnId,
          turns: [userTurn, postTurn, statusTurn],
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
