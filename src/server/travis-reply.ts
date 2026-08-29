import { generateTravisText, travisIsWired } from "@/server/travis-gemini";
import {
  insertAgentPostTurn,
  insertStatusTurn,
  insertUserTurn,
  type SendFn,
} from "@/server/seat-pipe";
import type { VoiceTurn } from "@/server/db/schema";

type Send = (event: string, data: unknown) => void;

export async function pipeTravisText(params: {
  sessionId: string;
  prompt: string;
  send: Send;
  userTurn?: VoiceTurn;
}): Promise<void> {
  const { sessionId, prompt, send } = params;
  const createdHere = !params.userTurn;
  const userTurn =
    params.userTurn ?? (await insertUserTurn(sessionId, prompt, "travis"));
  send("matched", {
    matched: true,
    userTurn,
    activeSeatKey: "travis",
    activeLabel: "Travis",
  });

  if (!travisIsWired()) {
    const status = await insertStatusTurn(sessionId, "Travis isn’t wired");
    send("done", {
      matched: true,
      mode: "stand-in",
      seatKey: "travis",
      seatLabel: "Travis",
      postTurn: null,
      turns: [userTurn, status],
    });
    if (createdHere) {
      /* user turn stays so the dest switch is visible */
    }
    return;
  }

  let reply = "";
  try {
    reply = (await generateTravisText({ sessionId, prompt })).trim();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = await insertStatusTurn(sessionId, `Travis: ${msg}`);
    send("done", {
      matched: true,
      mode: "error",
      seatKey: "travis",
      seatLabel: "Travis",
      postTurn: null,
      turns: [userTurn, status],
    });
    return;
  }

  if (!reply) reply = "…";
  send("post_delta", {
    text: reply,
    seatKey: "travis",
    seatLabel: "Travis",
  });
  const postTurn = await insertAgentPostTurn(
    sessionId,
    reply,
    "travis",
    userTurn.id,
  );
  send("done", {
    matched: true,
    mode: "real",
    seatKey: "travis",
    seatLabel: "Travis",
    postTurn,
    turns: [userTurn, postTurn],
  });
}

/** Confirm after send_to_seat — dest stays Travis. */
export async function pipeTravisNote(params: {
  sessionId: string;
  text: string;
  send?: SendFn;
}): Promise<VoiceTurn> {
  const post = await insertAgentPostTurn(params.sessionId, params.text, "travis");
  params.send?.("post_delta", {
    text: params.text,
    seatKey: "travis",
    seatLabel: "Travis",
  });
  return post;
}
