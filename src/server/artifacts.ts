/**
 * SCP-009 — hang Cursor files on a stamped agent_post. Proxy at read.
 * Do not remint initiative. Do not store the 15-minute URL.
 */

import { asc, eq, sql } from "drizzle-orm";
import {
  artifactFilename,
  artifactKindFromPath,
  parseCursorUpdatedAt,
  shouldHangArtifact,
} from "@/lib/artifact-kind";
import type { InitiativeAttachment } from "@/lib/initiative";
import { db } from "@/server/db/client";
import {
  agentBinding,
  turnArtifact,
  voiceSession,
  voiceTurn,
  type AgentBinding,
  type VoiceTurn,
} from "@/server/db/schema";
import { listCursorArtifacts } from "@/server/cursor-port";

let artifactStoreReady = false;

export async function ensureArtifactStore(): Promise<void> {
  if (artifactStoreReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.turn_artifact (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      turn_id uuid NOT NULL REFERENCES travis.voice_turn(id),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
      kind text NOT NULL,
      path text NOT NULL,
      filename text NOT NULL,
      size_bytes integer,
      cursor_updated_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT turn_artifact_kind_chk
        CHECK (kind IN ('image', 'file')),
      CONSTRAINT turn_artifact_turn_path_uniq UNIQUE (turn_id, path)
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS turn_artifact_session_created_idx
      ON travis.turn_artifact (session_id, created_at)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS turn_artifact_turn_idx
      ON travis.turn_artifact (turn_id)
  `);
  artifactStoreReady = true;
}

export async function harvestTurnArtifacts(params: {
  post: VoiceTurn | null;
  binding: AgentBinding;
  startedAt: Date | null;
}): Promise<void> {
  try {
    await ensureArtifactStore();
    const post = params.post;
    if (!post || post.kind !== "agent_post") return;
    if (!params.startedAt) return;
    const agentId = params.binding.cursorAgentId?.trim() ?? "";
    if (!agentId) return;
    const items = await listCursorArtifacts(agentId);
    for (const item of items) {
      const updatedAt = parseCursorUpdatedAt(item.updatedAt);
      if (
        !shouldHangArtifact({
          startedAt: params.startedAt,
          updatedAt,
        })
      ) {
        continue;
      }
      await db
        .insert(turnArtifact)
        .values({
          turnId: post.id,
          sessionId: post.sessionId,
          bindingId: params.binding.id,
          kind: artifactKindFromPath(item.path),
          path: item.path,
          filename: artifactFilename(item.path),
          sizeBytes: item.sizeBytes,
          cursorUpdatedAt: updatedAt,
        })
        .onConflictDoNothing();
    }
  } catch (err) {
    console.error("[travis] artifact harvest failed:", err);
  }
}

export type TurnAttachment = {
  id: string;
  turnId: string;
  kind: "image" | "file";
  filename: string;
  sizeBytes: number | null;
};

export async function attachmentsForTurns(
  sessionId: string,
): Promise<Map<string, TurnAttachment[]>> {
  await ensureArtifactStore();
  const rows = await db
    .select({
      id: turnArtifact.id,
      turnId: turnArtifact.turnId,
      kind: turnArtifact.kind,
      filename: turnArtifact.filename,
      sizeBytes: turnArtifact.sizeBytes,
    })
    .from(turnArtifact)
    .where(eq(turnArtifact.sessionId, sessionId))
    .orderBy(asc(turnArtifact.createdAt));
  const map = new Map<string, TurnAttachment[]>();
  for (const row of rows) {
    const item: TurnAttachment = {
      id: row.id,
      turnId: row.turnId,
      kind: row.kind === "image" ? "image" : "file",
      filename: row.filename,
      sizeBytes: row.sizeBytes,
    };
    const list = map.get(row.turnId) ?? [];
    list.push(item);
    map.set(row.turnId, list);
  }
  return map;
}

export async function attachmentsForInitiative(
  initiativeId: string,
): Promise<InitiativeAttachment[]> {
  await ensureArtifactStore();
  const rows = await db
    .select({
      id: turnArtifact.id,
      turnId: turnArtifact.turnId,
      kind: turnArtifact.kind,
      filename: turnArtifact.filename,
      sizeBytes: turnArtifact.sizeBytes,
      createdAt: turnArtifact.createdAt,
      seatKey: voiceTurn.seatKey,
    })
    .from(turnArtifact)
    .innerJoin(voiceTurn, eq(turnArtifact.turnId, voiceTurn.id))
    .where(eq(voiceTurn.initiativeId, initiativeId))
    .orderBy(asc(turnArtifact.createdAt));
  return rows.map((row) => ({
    id: row.id,
    turnId: row.turnId,
    kind: row.kind === "image" ? "image" : "file",
    filename: row.filename,
    sizeBytes: row.sizeBytes,
    createdAt: row.createdAt,
    seatKey: row.seatKey,
  }));
}

export async function artifactForProxy(artifactId: string): Promise<{
  id: string;
  sessionId: string;
  path: string;
  filename: string;
  kind: "image" | "file";
  cursorAgentId: string;
} | null> {
  await ensureArtifactStore();
  const [row] = await db
    .select({
      id: turnArtifact.id,
      sessionId: turnArtifact.sessionId,
      path: turnArtifact.path,
      filename: turnArtifact.filename,
      kind: turnArtifact.kind,
      cursorAgentId: agentBinding.cursorAgentId,
      ownedSessionId: voiceSession.id,
    })
    .from(turnArtifact)
    .innerJoin(voiceSession, eq(turnArtifact.sessionId, voiceSession.id))
    .innerJoin(agentBinding, eq(turnArtifact.bindingId, agentBinding.id))
    .where(eq(turnArtifact.id, artifactId))
    .limit(1);
  if (!row || row.sessionId !== row.ownedSessionId) return null;
  return {
    id: row.id,
    sessionId: row.sessionId,
    path: row.path,
    filename: row.filename,
    kind: row.kind === "image" ? "image" : "file",
    cursorAgentId: row.cursorAgentId ?? "",
  };
}

