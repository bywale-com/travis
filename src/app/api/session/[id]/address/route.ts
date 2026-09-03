import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseCallByName, seatKeyToLabel } from "@/lib/router";
import { isTravisSeat } from "@/lib/seats";
import { travisIsWired } from "@/server/travis-openai";
import {
  bindingForSeat,
  noteTravisUnwired,
  setActiveBinding,
} from "@/server/travis-dest";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";
import { MembershipError, openBindingForSeat } from "@/server/room-membership";

type Body = { seatKey?: SeatKey; utterance?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const body = (await req.json()) as Body;
  const [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status === "ended") {
    return NextResponse.json({ error: "Session ended" }, { status: 400 });
  }

  let seatKey = body.seatKey ?? null;
  if (!seatKey && body.utterance) {
    seatKey = parseCallByName(body.utterance).seatKey;
  }
  if (!seatKey) {
    return NextResponse.json({ error: "No dest" }, { status: 400 });
  }

  const binding =
    (await openBindingForSeat(sessionId, seatKey)) ??
    (await bindingForSeat(seatKey));
  if (!binding) {
    return NextResponse.json({ error: "Unknown dest" }, { status: 400 });
  }
  try {
    await setActiveBinding(sessionId, binding.id);
  } catch (err) {
    if (err instanceof MembershipError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
  if (isTravisSeat(seatKey)) await noteTravisUnwired(sessionId);

  return NextResponse.json({
    routerHandled: true,
    activeSeatKey: seatKey,
    activeLabel: binding.label ?? seatKeyToLabel(seatKey),
    destTravis: isTravisSeat(seatKey),
    wired: travisIsWired(),
  });
}
