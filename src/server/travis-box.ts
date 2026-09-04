/**
 * 020 — Travis's box. Fly Sprites HTTP. Pointer in env. No table.
 * Token after: SPRITES_TOKEN. Name defaults to travis.
 */

import {
  BOX_NOT_WIRED,
  boxSpriteName,
  boxToken,
  formatBoxExec,
  parseBoxExecBody,
} from "@/lib/travis-box";

const SPRITES_BASE = "https://api.sprites.dev/v1";
const EXEC_MS = 20_000;

export class BoxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BoxError";
  }
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

async function spritesFetch(
  token: string,
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = EXEC_MS, ...rest } = init;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(`${SPRITES_BASE}${path}`, {
      ...rest,
      headers: { ...authHeaders(token), ...(rest.headers ?? {}) },
      signal: ctrl.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new BoxError("Box timed out. Same box — retry here.");
    }
    throw new BoxError(
      err instanceof Error ? err.message : "Box request failed.",
    );
  } finally {
    clearTimeout(t);
  }
}

async function ensureSprite(token: string, name: string): Promise<void> {
  const got = await spritesFetch(token, `/sprites/${encodeURIComponent(name)}`, {
    timeoutMs: 15_000,
  });
  if (got.ok) return;
  if (got.status !== 404) {
    const body = await got.text();
    throw new BoxError(
      `Box lookup failed (${got.status}). ${body.slice(0, 200)}`.trim(),
    );
  }
  const created = await spritesFetch(token, "/sprites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
    timeoutMs: 30_000,
  });
  if (created.ok || created.status === 409) return;
  const body = await created.text();
  throw new BoxError(
    `Could not create the box (${created.status}). ${body.slice(0, 200)}`.trim(),
  );
}

async function execOnBox(params: {
  token: string;
  name: string;
  cmds: string[];
  stdin?: string;
  dir?: string;
}): Promise<{ exit: number; stdout: string; stderr: string }> {
  const query = new URLSearchParams();
  for (const cmd of params.cmds) query.append("cmd", cmd);
  if (params.stdin != null) query.set("stdin", "true");
  if (params.dir) query.set("dir", params.dir);
  const path = `/sprites/${encodeURIComponent(params.name)}/exec?${query}`;
  const res = await spritesFetch(params.token, path, {
    method: "POST",
    body: params.stdin != null ? params.stdin : undefined,
    headers:
      params.stdin != null
        ? { "Content-Type": "application/octet-stream" }
        : undefined,
  });
  const raw = await res.text();
  if (res.status === 404) {
    throw new BoxError("missing");
  }
  if (!res.ok && res.status !== 200) {
    const parsed = parseBoxExecBody(res.status, raw);
    if (parsed.stdout || parsed.stderr) return parsed;
    throw new BoxError(
      `Box exec failed (${res.status}). ${raw.slice(0, 240)}`.trim(),
    );
  }
  return parseBoxExecBody(res.status, raw);
}

async function execEnsured(params: {
  cmds: string[];
  stdin?: string;
  dir?: string;
}): Promise<{ exit: number; stdout: string; stderr: string }> {
  const token = boxToken();
  if (!token) throw new BoxError(BOX_NOT_WIRED);
  const name = boxSpriteName();
  try {
    return await execOnBox({ token, name, ...params });
  } catch (err) {
    if (!(err instanceof BoxError) || err.message !== "missing") throw err;
    await ensureSprite(token, name);
    return execOnBox({ token, name, ...params });
  }
}

export async function runBox(cmd: string): Promise<string> {
  const line = String(cmd ?? "").trim();
  if (!line) throw new BoxError("Need a command.");
  const result = await execEnsured({
    cmds: ["bash", "-lc", line],
  });
  return formatBoxExec({ cmd: line, ...result });
}

export async function readBox(path: string): Promise<string> {
  const file = String(path ?? "").trim();
  if (!file) throw new BoxError("Need a path.");
  const result = await execEnsured({ cmds: ["cat", file] });
  return formatBoxExec({ cmd: `cat ${file}`, ...result });
}

export async function writeBox(path: string, body: unknown): Promise<string> {
  const file = String(path ?? "").trim();
  if (!file) throw new BoxError("Need a path.");
  if (typeof body !== "string" || !body) {
    throw new BoxError("Need a body.");
  }
  const result = await execEnsured({
    cmds: ["tee", file],
    stdin: body,
  });
  if (result.exit !== 0) {
    return formatBoxExec({ cmd: `tee ${file}`, ...result });
  }
  return `Wrote ${file} on the box.`;
}

export function boxWired(): boolean {
  return Boolean(boxToken());
}
