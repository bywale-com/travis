/**
 * SCP-012 — Travis OS house. Rows that look like folders.
 * Protocols and templates. No session_id. No seated link.
 */
import { and, asc, eq, like, sql } from "drizzle-orm";
import { clipOsBody, parseOsPath, parentOsPath } from "@/lib/os-path";
import { db } from "@/server/db/client";
import { agentBinding, osNode } from "@/server/db/schema";

export class OsHouseError extends Error {
  constructor(
    message: string,
    public status: 400 | 404,
  ) {
    super(message);
    this.name = "OsHouseError";
  }
}

let osStoreReady = false;

export async function ensureOsStore(): Promise<void> {
  if (osStoreReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.os_node (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_id uuid REFERENCES travis.os_node(id),
      path text NOT NULL UNIQUE,
      name text NOT NULL,
      kind text NOT NULL,
      body text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      writer_binding_id uuid REFERENCES travis.agent_binding(id),
      CONSTRAINT os_node_kind_chk CHECK (kind IN ('dir', 'file')),
      CONSTRAINT os_node_dir_body_chk CHECK (
        (kind = 'dir' AND body = '') OR kind = 'file'
      )
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS os_node_parent_idx
      ON travis.os_node (parent_id)
  `);
  await db.execute(sql`
    INSERT INTO travis.os_node (path, name, kind, parent_id)
    VALUES ('/', '', 'dir', NULL)
    ON CONFLICT (path) DO NOTHING
  `);
  await db.execute(sql`
    INSERT INTO travis.os_node (path, name, kind, parent_id)
    SELECT '/protocols', 'protocols', 'dir', id
    FROM travis.os_node WHERE path = '/'
    ON CONFLICT (path) DO NOTHING
  `);
  await db.execute(sql`
    INSERT INTO travis.os_node (path, name, kind, parent_id)
    SELECT '/templates', 'templates', 'dir', id
    FROM travis.os_node WHERE path = '/'
    ON CONFLICT (path) DO NOTHING
  `);
  await db.execute(sql`
    INSERT INTO travis.os_node (path, name, kind, parent_id)
    SELECT '/logs', 'logs', 'dir', id
    FROM travis.os_node WHERE path = '/'
    ON CONFLICT (path) DO NOTHING
  `);
  osStoreReady = true;
}

export type OsChild = {
  path: string;
  name: string;
  kind: "dir" | "file";
  updatedAt: Date;
};

export type OsList = {
  path: string;
  kind: "dir";
  children: OsChild[];
};

export type OsFile = {
  path: string;
  kind: "file";
  body: string;
  updatedAt: Date;
};

async function nodeByPath(path: string) {
  const [row] = await db
    .select()
    .from(osNode)
    .where(eq(osNode.path, path))
    .limit(1);
  return row ?? null;
}

export async function getOs(pathRaw?: string): Promise<OsList | OsFile> {
  await ensureOsStore();
  const parsed = parseOsPath(pathRaw ?? "/");
  if (!parsed.ok) throw new OsHouseError(parsed.reason, 400);
  const row = await nodeByPath(parsed.path);
  if (!row) throw new OsHouseError("Not in the house.", 404);
  if (row.kind === "dir") return listOs(parsed.path);
  return readOs(parsed.path);
}

export async function listOs(pathRaw?: string): Promise<OsList> {
  await ensureOsStore();
  const parsed = parseOsPath(pathRaw ?? "/");
  if (!parsed.ok) throw new OsHouseError(parsed.reason, 400);
  const row = await nodeByPath(parsed.path);
  if (!row) throw new OsHouseError("Not in the house.", 404);
  if (row.kind !== "dir") {
    throw new OsHouseError("That path is a file. Use read_os.", 400);
  }
  const kids = await db
    .select({
      path: osNode.path,
      name: osNode.name,
      kind: osNode.kind,
      updatedAt: osNode.updatedAt,
    })
    .from(osNode)
    .where(eq(osNode.parentId, row.id))
    .orderBy(asc(osNode.name));
  return {
    path: row.path,
    kind: "dir",
    children: kids.map((k) => ({
      path: k.path,
      name: k.name,
      kind: k.kind as "dir" | "file",
      updatedAt: k.updatedAt,
    })),
  };
}

export async function readOs(pathRaw: string): Promise<OsFile> {
  await ensureOsStore();
  const parsed = parseOsPath(pathRaw);
  if (!parsed.ok) throw new OsHouseError(parsed.reason, 400);
  const row = await nodeByPath(parsed.path);
  if (!row) throw new OsHouseError("Not in the house.", 404);
  if (row.kind !== "file") {
    throw new OsHouseError("That path is a folder. Use list_os.", 400);
  }
  return {
    path: row.path,
    kind: "file",
    body: row.body,
    updatedAt: row.updatedAt,
  };
}

async function ensureDir(path: string): Promise<{ id: string }> {
  const parsed = parseOsPath(path);
  if (!parsed.ok) throw new OsHouseError(parsed.reason, 400);
  const existing = await nodeByPath(parsed.path);
  if (existing) {
    if (existing.kind !== "dir") {
      throw new OsHouseError("A file is already at that path.", 400);
    }
    return { id: existing.id };
  }
  const parentPath = parentOsPath(parsed.path);
  const parent = parentPath ? await ensureDir(parentPath) : null;
  const [row] = await db
    .insert(osNode)
    .values({
      parentId: parent?.id ?? null,
      path: parsed.path,
      name: parsed.name,
      kind: "dir",
      body: "",
    })
    .returning({ id: osNode.id });
  if (!row) throw new OsHouseError("Could not make the folder.", 400);
  return row;
}

async function travisBindingId(): Promise<string | null> {
  const [row] = await db
    .select({ id: agentBinding.id })
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, "travis"))
    .limit(1);
  return row?.id ?? null;
}

export async function writeOs(opts: {
  path: string;
  body: unknown;
  writerBindingId?: string | null;
}): Promise<{ path: string }> {
  await ensureOsStore();
  const parsed = parseOsPath(opts.path);
  if (!parsed.ok) throw new OsHouseError(parsed.reason, 400);
  if (parsed.path === "/") {
    throw new OsHouseError("Cannot write the root as a file.", 400);
  }
  const clipped = clipOsBody(opts.body);
  if (!clipped.ok) throw new OsHouseError(clipped.reason, 400);
  const parentPath = parentOsPath(parsed.path);
  if (!parentPath) throw new OsHouseError("Cannot write the root as a file.", 400);
  const parent = await ensureDir(parentPath);
  const existing = await nodeByPath(parsed.path);
  const now = new Date();
  const writerBindingId =
    opts.writerBindingId === undefined ? null : opts.writerBindingId;
  if (existing) {
    if (existing.kind !== "file") {
      throw new OsHouseError("A folder is already at that path.", 400);
    }
    await db
      .update(osNode)
      .set({
        body: clipped.body,
        updatedAt: now,
        writerBindingId,
      })
      .where(eq(osNode.id, existing.id));
    return { path: existing.path };
  }
  await db.insert(osNode).values({
    parentId: parent.id,
    path: parsed.path,
    name: parsed.name,
    kind: "file",
    body: clipped.body,
    writerBindingId,
    updatedAt: now,
  });
  return { path: parsed.path };
}

export async function writeOsAsTravis(path: string, body: unknown) {
  return writeOs({
    path,
    body,
    writerBindingId: await travisBindingId(),
  });
}

/** Files only, descendants of a house folder. Server helper — not a new tool. */
export async function listOsFilesUnder(
  dirRaw: string,
): Promise<{ path: string; relative: string; body: string }[]> {
  await ensureOsStore();
  const parsed = parseOsPath(dirRaw);
  if (!parsed.ok || parsed.path === "/") return [];
  const prefix = parsed.path;
  const rows = await db
    .select({
      path: osNode.path,
      body: osNode.body,
    })
    .from(osNode)
    .where(and(eq(osNode.kind, "file"), like(osNode.path, `${prefix}/%`)))
    .orderBy(asc(osNode.path));
  return rows.map((r) => ({
    path: r.path,
    relative: r.path.slice(prefix.length + 1),
    body: r.body,
  }));
}

export function formatOsList(list: OsList): string {
  if (!list.children.length) {
    return `${list.path} is empty.`;
  }
  const lines = list.children.map((c) =>
    c.kind === "dir" ? `${c.name}/` : c.name,
  );
  return `${list.path}: ${lines.join(", ")}`;
}

export function formatOsWrite(path: string): string {
  return `Filed ${path}.`;
}
