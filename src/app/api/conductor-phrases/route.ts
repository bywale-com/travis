import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { turnConductorPhrase } from "@/server/db/schema";

/** Active conductor phrases from DB — never hard-coded in SPA. */
export async function GET() {
  const rows = await db
    .select({ phrase: turnConductorPhrase.phrase })
    .from(turnConductorPhrase)
    .where(eq(turnConductorPhrase.active, true));

  // Longer first for client matching
  const phrases = rows
    .map((r) => r.phrase)
    .sort((a, b) => b.length - a.length);

  return NextResponse.json({ phrases });
}
