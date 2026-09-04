/**
 * 021 — Prove rules. Harness loop around the box he already has.
 * No table. Same sprite. Model calling run_box again is not this.
 */

import { clipBoxText } from "@/lib/travis-box";

export const PROVE_MAX = 3;

export const NEED_A_CHECK = "Need a check — path, url, or check.";

export const NEED_A_DO = "Need a command.";

export function shellSingleQuote(raw: string): string {
  return `'${String(raw).replace(/'/g, `'\\''`)}'`;
}

export type ProveSpec = {
  do: string;
  checkCmd: string;
};

export type ProveParse =
  | { ok: true; spec: ProveSpec }
  | { ok: false; reason: string };

export function parseProveArgs(args: {
  do?: unknown;
  check?: unknown;
  path?: unknown;
  url?: unknown;
}): ProveParse {
  const line = typeof args.do === "string" ? args.do.trim() : "";
  if (!line) return { ok: false, reason: NEED_A_DO };
  const check =
    typeof args.check === "string" ? args.check.trim() : "";
  const path = typeof args.path === "string" ? args.path.trim() : "";
  const url = typeof args.url === "string" ? args.url.trim() : "";
  if (check) return { ok: true, spec: { do: line, checkCmd: check } };
  if (path) {
    return {
      ok: true,
      spec: { do: line, checkCmd: `test -e ${shellSingleQuote(path)}` },
    };
  }
  if (url) {
    return {
      ok: true,
      spec: {
        do: line,
        checkCmd: `curl -fsS -o /dev/null ${shellSingleQuote(url)}`,
      },
    };
  }
  return { ok: false, reason: NEED_A_CHECK };
}

export function formatProveWorked(attempt: number, checkStdout: string): string {
  const n = Math.min(Math.max(1, attempt), PROVE_MAX);
  const clip = clipBoxText(checkStdout).trim();
  return clip ? `Proved. attempt ${n}/3. ${clip}` : `Proved. attempt ${n}/3.`;
}

export function formatProveFailed(n: number, last: string): string {
  const clip = clipBoxText(last).trim() || "check failed";
  return `Failed after ${n}. last: ${clip} Same box. Do not mint a ticket.`;
}

export function formatWriteBoxOk(path: string): string {
  return `Wrote ${path} on the box.`;
}

export function formatWriteBoxMissing(path: string): string {
  return `Write did not land at ${path}. Same box. Do not mint a ticket.`;
}

export type ProveExecOk = {
  ok: true;
  exit: number;
  stdout: string;
  stderr: string;
};

export type ProveExecFail = {
  ok: false;
  noRetry: boolean;
  reason: string;
};

export type ProveExecResult = ProveExecOk | ProveExecFail;

function lastFrom(result: ProveExecResult): string {
  if (!result.ok) return result.reason;
  const bits = [result.stderr, result.stdout].map((s) => s.trim()).filter(Boolean);
  return bits.join(" ") || `exit ${result.exit}`;
}

/**
 * Do → check on the same machine → retry from do. Max 3.
 * Auth / unwired / empty / bad args are noRetry and stop at once.
 */
export async function runProveCycles(
  spec: ProveSpec,
  exec: (cmd: string) => Promise<ProveExecResult>,
): Promise<string> {
  let last = "check failed";
  for (let attempt = 1; attempt <= PROVE_MAX; attempt++) {
    const did = await exec(spec.do);
    if (!did.ok && did.noRetry) return did.reason;
    if (did.ok || !did.noRetry) {
      last = lastFrom(did);
    }
    const checked = await exec(spec.checkCmd);
    if (!checked.ok && checked.noRetry) return checked.reason;
    if (checked.ok && checked.exit === 0) {
      return formatProveWorked(attempt, checked.stdout);
    }
    last = lastFrom(checked);
  }
  return formatProveFailed(PROVE_MAX, last);
}

export async function confirmWriteOnBox(params: {
  path: string;
  testExists: () => Promise<boolean>;
  rewrite: () => Promise<void>;
}): Promise<string> {
  if (await params.testExists()) return formatWriteBoxOk(params.path);
  await params.rewrite();
  if (await params.testExists()) return formatWriteBoxOk(params.path);
  return formatWriteBoxMissing(params.path);
}
