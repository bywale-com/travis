/**
 * SCP-030 — load dest-with-context from unclipped tape.
 */

import {
  assembleDestWithContext,
  isDestWithContextAsk,
  unclippedPrint,
  type PrintTurn,
} from "@/lib/dest-with-context";
import { recentTurns } from "@/server/room-read";

export type DestWithContext = {
  ask: string;
  print: string;
  assembled: string;
};

export async function unclippedPrintFor(sessionId: string): Promise<string> {
  const turns = (await recentTurns(sessionId)) as PrintTurn[];
  return unclippedPrint(turns);
}

export async function destWithContextFor(
  sessionId: string,
): Promise<DestWithContext | null> {
  const turns = (await recentTurns(sessionId)) as PrintTurn[];
  const lastUser = [...turns].reverse().find((t) => t.kind === "user");
  if (!lastUser || !isDestWithContextAsk(lastUser.text)) return null;
  const print = unclippedPrint(turns);
  if (!print.trim()) return null;
  return {
    ask: lastUser.text,
    print,
    assembled: assembleDestWithContext({ ask: lastUser.text, print }),
  };
}
