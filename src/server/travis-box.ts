/**
 * 020 / 021 — Travis's box. Fly Sprites HTTP. Pointer in env. No table.
 * Token after: SPRITES_TOKEN. Name defaults to travis.
 * prove_box is the harness loop. run_box stays one-shot.
 */

import {
  BOX_NOT_WIRED,
  boxSpriteName,
  boxToken,
  formatBoxExec,
  parseBoxExecBody,
} from "@/lib/travis-box";
import {
  NEED_A_CHECK,
  NEED_A_DO,
  confirmWriteOnBox,
  parseProveArgs,
  runProveCycles,
  shellSingleQuote,
  type ProveExecResult,
} from "@/lib/travis-prove";

const SPRITES_BASE = "https://api.sprites.dev/v1";
const EXEC_MS = 20_000;

export class BoxError extends Error {
  readonly noRetry: boolean;
  constructor(message: string, opts?: { noRetry?: boolean }) {
    super(message);
    this.name = "BoxError";
    this.noRetry = opts?.noRetry === true;
  }
}

const BOX_AUTH_FAILED =
  "Box auth failed (401). Check SPRITES_TOKEN. Same box — not a new ticket.";

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
  if (got.status === 401 || got.status === 403) {
    throw new BoxError(BOX_AUTH_FAILED, { noRetry: true });
  }
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
  if (created.status === 401 || created.status === 403) {
    throw new BoxError(BOX_AUTH_FAILED, { noRetry: true });
  }
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
  env?: Record<string, string>;
  timeoutMs?: number;
}): Promise<{ exit: number; stdout: string; stderr: string }> {
  const query = new URLSearchParams();
  for (const cmd of params.cmds) query.append("cmd", cmd);
  if (params.stdin != null) query.set("stdin", "true");
  if (params.dir) query.set("dir", params.dir);
  if (params.env) {
    for (const [key, value] of Object.entries(params.env)) {
      query.append("env", `${key}=${value}`);
    }
  }
  const path = `/sprites/${encodeURIComponent(params.name)}/exec?${query}`;
  const res = await spritesFetch(params.token, path, {
    method: "POST",
    body: params.stdin != null ? params.stdin : undefined,
    headers:
      params.stdin != null
        ? { "Content-Type": "application/octet-stream" }
        : undefined,
    timeoutMs: params.timeoutMs,
  });
  const raw = await res.text();
  if (res.status === 401 || res.status === 403) {
    throw new BoxError(BOX_AUTH_FAILED, { noRetry: true });
  }
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

export async function execBoxRaw(params: {
  cmd: string;
  stdin?: string;
  dir?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
}): Promise<{ exit: number; stdout: string; stderr: string }> {
  const token = boxToken();
  if (!token) throw new BoxError(BOX_NOT_WIRED, { noRetry: true });
  const name = boxSpriteName();
  const cmds = ["bash", "-lc", params.cmd];
  const shared = {
    token,
    name,
    cmds,
    stdin: params.stdin,
    dir: params.dir,
    env: params.env,
    timeoutMs: params.timeoutMs,
  };
  try {
    return await execOnBox(shared);
  } catch (err) {
    if (!(err instanceof BoxError) || err.message !== "missing") throw err;
    await ensureSprite(token, name);
    return execOnBox(shared);
  }
}

async function execEnsured(params: {
  cmds: string[];
  stdin?: string;
  dir?: string;
  env?: Record<string, string>;
}): Promise<{ exit: number; stdout: string; stderr: string }> {
  const token = boxToken();
  if (!token) throw new BoxError(BOX_NOT_WIRED, { noRetry: true });
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
  if (!line) throw new BoxError(NEED_A_DO, { noRetry: true });
  const result = await execEnsured({
    cmds: ["bash", "-lc", line],
  });
  return formatBoxExec({ cmd: line, ...result });
}

export async function readBox(path: string): Promise<string> {
  const file = String(path ?? "").trim();
  if (!file) throw new BoxError("Need a path.", { noRetry: true });
  const result = await execEnsured({ cmds: ["cat", file] });
  return formatBoxExec({ cmd: `cat ${file}`, ...result });
}

export async function writeBox(path: string, body: unknown): Promise<string> {
  const file = String(path ?? "").trim();
  if (!file) throw new BoxError("Need a path.", { noRetry: true });
  if (typeof body !== "string" || !body) {
    throw new BoxError("Need a body.", { noRetry: true });
  }
  const result = await execEnsured({
    cmds: ["tee", file],
    stdin: body,
  });
  if (result.exit !== 0) {
    return formatBoxExec({ cmd: `tee ${file}`, ...result });
  }
  const quoted = shellSingleQuote(file);
  return confirmWriteOnBox({
    path: file,
    testExists: async () => {
      const check = await execEnsured({
        cmds: ["bash", "-lc", `test -e ${quoted}`],
      });
      return check.exit === 0;
    },
    rewrite: async () => {
      await execEnsured({
        cmds: ["tee", file],
        stdin: body,
      });
    },
  });
}

function toProveExec(result: { exit: number; stdout: string; stderr: string }): ProveExecResult {
  return { ok: true, ...result };
}

export async function proveBox(
  args: {
    do?: unknown;
    check?: unknown;
    path?: unknown;
    url?: unknown;
  },
  opts?: { env?: Record<string, string>; timeoutMs?: number },
): Promise<string> {
  const parsed = parseProveArgs(args);
  if (!parsed.ok) {
    throw new BoxError(parsed.reason, { noRetry: true });
  }
  if (!boxToken()) {
    throw new BoxError(BOX_NOT_WIRED, { noRetry: true });
  }
  return runProveCycles(parsed.spec, async (cmd) => {
    try {
      return toProveExec(
        await execBoxRaw({
          cmd,
          env: opts?.env,
          timeoutMs: opts?.timeoutMs,
        }),
      );
    } catch (err) {
      if (err instanceof BoxError && err.noRetry) {
        return { ok: false, noRetry: true, reason: err.message };
      }
      const reason =
        err instanceof Error ? err.message : "Box request failed.";
      return { ok: false, noRetry: false, reason };
    }
  });
}

export function boxWired(): boolean {
  return Boolean(boxToken());
}

export { NEED_A_CHECK, NEED_A_DO };
