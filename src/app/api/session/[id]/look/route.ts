import { NextResponse } from "next/server";
import { AuthError, jsonRoute } from "@/server/api-error";
import { requireOwnedSession, publicOrigin } from "@/server/operator";
import { tokenFromCookieHeader } from "@/lib/operator-auth";
import { turnsAfterSeq } from "@/server/turns-read";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  isWalkFile,
  lookSeedTooLong,
  parseLookBody,
  renderLookSeed,
} from "@/lib/look-miss";
import {
  LOOK_NOT_WIRED,
  LookGithubError,
  fileLookOnGithub,
  wakeGithubToken,
} from "@/server/look-github";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id: sessionId } = await ctx.params;
    try {
      await requireOwnedSession(req, sessionId);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

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

    let raw: unknown = {};
    try {
      raw = await req.json();
    } catch {
      raw = {};
    }
    const parsed = parseLookBody(raw);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.reason }, { status: 400 });
    }

    const tape = await turnsAfterSeq(sessionId, null);
    const inRoom = new Set(tape.map((row) => row.id));
    for (const id of parsed.turnIds) {
      if (!inRoom.has(id)) {
        return NextResponse.json(
          { error: "Turn not in this room." },
          { status: 400 },
        );
      }
    }

    const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim() || "unknown";
    const vercel = process.env.VERCEL_URL?.trim() || "";
    const deploy =
      publicOrigin(req) ||
      (vercel ? (vercel.startsWith("http") ? vercel : `https://${vercel}`) : "");
    const seed = renderLookSeed({
      sessionId,
      turnIds: parsed.turnIds,
      note: parsed.note,
      sha,
      deploy,
      when: new Date().toISOString(),
    });
    if (lookSeedTooLong(seed)) {
      return NextResponse.json({ error: "Note is too long." }, { status: 400 });
    }

    const cookie = tokenFromCookieHeader(req.headers.get("cookie"));
    if (isWalkFile(cookie)) {
      return NextResponse.json({ ok: true, filed: false, reason: "walk" });
    }

    if (!wakeGithubToken()) {
      return NextResponse.json({ error: LOOK_NOT_WIRED }, { status: 503 });
    }

    try {
      const filed = await fileLookOnGithub({ seed });
      return NextResponse.json({
        ok: true,
        filed: true,
        pr: filed.pr,
        labeled: filed.labeled,
        ...(filed.issue ? { issue: filed.issue } : {}),
      });
    } catch (err) {
      if (err instanceof LookGithubError) {
        return NextResponse.json({ error: err.message }, { status: 503 });
      }
      throw err;
    }
  });
}
