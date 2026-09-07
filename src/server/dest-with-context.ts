/**
 * SCP-031 — load dest print from this session’s REQUEST_SCAN tape.
 */

import { REQUEST_SCAN } from "@/lib/request-log";
import {
  assembleDestWithContext,
  formatRosterFact,
  unclippedPrint,
  type PrintTurn,
} from "@/lib/dest-with-context";
import { recentTurns } from "@/server/room-read";
import { listSeatRoster } from "@/server/sit";

export type DestWithContext = {
  ask: string;
  print: string;
  assembled: string;
};

async function destPrintTurns(sessionId: string): Promise<PrintTurn[]> {
  return (await recentTurns(sessionId, REQUEST_SCAN)) as PrintTurn[];
}

export async function unclippedPrintFor(sessionId: string): Promise<string> {
  return unclippedPrint(await destPrintTurns(sessionId));
}

export async function destWithContextFor(
  sessionId: string,
): Promise<DestWithContext | null> {
  const turns = await destPrintTurns(sessionId);
  const lastUser = [...turns].reverse().find((t) => t.kind === "user");
  if (!lastUser) return null;
  const print = unclippedPrint(turns);
  return {
    ask: lastUser.text,
    print,
    assembled: assembleDestWithContext({ ask: lastUser.text, print }),
  };
}

export async function rosterFactFor(sessionId: string): Promise<string> {
  const roster = await listSeatRoster(sessionId).catch(() => "");
  return formatRosterFact(roster);
}
