import { desc, eq } from "drizzle-orm";
import { matchConductorPhrase } from "@/lib/conductor";
import { streamCursorReply } from "@/server/cursor-port";
import { db } from "@/server/db/client";
import {
  agentBinding,
  turnConductorPhrase,
  voiceSession,
  voiceTurn,
} from "@/server/db/schema";

type Body = {
  utterance: string;
};

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Finalize utterance when conductor phrase matches.
 * Hotfix 001: SSE — user turn → running status → assistant deltas → done.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const body = (await req.json()) as Body;
  const utterance = body.utterance ?? "";

  const [session] = await db
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

  if (!match.matched) {
    return Response.json({
      matched: false,
      cleanedText: match.cleanedText,
    });
  }

  const prompt = match.cleanedText.trim();
  if (!prompt) {
    return Response.json(
      {
        matched: true,
        error: "Conductor matched but no prompt text left after stripping phrase.",
      },
      { status: 400 },
    );
  }

  const [last] = await db
    .select({ seq: voiceTurn.seq })
    .from(voiceTurn)
    .where(eq(voiceTurn.sessionId, sessionId))
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  let seq = (last?.seq ?? 0) + 1;

  const [userTurn] = await db
    .insert(voiceTurn)
    .values({
      sessionId,
      seq,
      role: "user",
      text: prompt,
    })
    .returning();
  seq += 1;

  const [binding] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session.bindingId))
    .limit(1);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };

      try {
        send("matched", {
          matched: true,
          matchedPhrase: match.matchedPhrase,
          userTurn,
        });
        send("status", { text: "running" });

        let assistantText = "";
        let donePayload: {
          mode: string;
          statusText: string;
          agentId?: string;
          runId?: string;
        } | null = null;

        for await (const ev of streamCursorReply({
          cursorAgentId: binding?.cursorAgentId ?? "",
          prompt,
        })) {
          if (ev.type === "status") {
            send("status", { text: ev.text });
          } else if (ev.type === "delta") {
            assistantText += ev.text;
            send("delta", { text: ev.text });
          } else if (ev.type === "done") {
            if (!assistantText.trim()) {
              assistantText = ev.assistantText;
            }
            donePayload = {
              mode: ev.mode,
              statusText: ev.statusText,
              agentId: ev.agentId,
              runId: ev.runId,
            };
          }
        }

        const finalAssistant = assistantText.trim() || "Run finished (no assistant text).";

        const [assistantTurn] = await db
          .insert(voiceTurn)
          .values({
            sessionId,
            seq,
            role: "assistant",
            text: finalAssistant,
          })
          .returning();
        seq += 1;

        let statusTurn = null;
        const statusText = donePayload?.statusText ?? "finished";
        [statusTurn] = await db
          .insert(voiceTurn)
          .values({
            sessionId,
            seq,
            role: "status",
            text: statusText,
          })
          .returning();

        send("done", {
          matched: true,
          mode: donePayload?.mode ?? "real",
          matchedPhrase: match.matchedPhrase,
          turns: [userTurn, assistantTurn, statusTurn].filter(Boolean),
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
