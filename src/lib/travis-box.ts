/**
 * 020 — Travis's box receipts. No table. Pointer is env.
 */

export const BOX_NOT_WIRED =
  "Box is not wired. Set SPRITES_TOKEN. Same machine after that — not a new ticket.";

export const BOX_OUTPUT_CAP = 4000;

export function clipBoxText(raw: string, cap = BOX_OUTPUT_CAP): string {
  const text = String(raw ?? "").replace(/\r\n/g, "\n");
  if (text.length <= cap) return text;
  return `${text.slice(0, cap).trimEnd()}\n…`;
}

export function formatBoxExec(params: {
  cmd: string;
  exit: number;
  stdout: string;
  stderr: string;
}): string {
  const out = clipBoxText(params.stdout).trim();
  const err = clipBoxText(params.stderr).trim();
  if (params.exit === 0) {
    return out || "ok (exit 0)";
  }
  const bits = [`exit ${params.exit}.`];
  if (err) bits.push(err);
  if (out) bits.push(out);
  bits.push("Same box. Retry here — do not mint a ticket.");
  return bits.join(" ");
}

export function parseBoxExecBody(
  status: number,
  raw: string,
): { exit: number; stdout: string; stderr: string } {
  const text = String(raw ?? "");
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    const stdout = String(json.stdout ?? json.output ?? json.out ?? "");
    const stderr = String(json.stderr ?? json.error ?? json.err ?? "");
    const exitRaw = json.exit_code ?? json.exitCode ?? json.status;
    const exit =
      typeof exitRaw === "number"
        ? exitRaw
        : status >= 200 && status < 300
          ? 0
          : status;
    return { exit, stdout, stderr };
  } catch {
    return {
      exit: status >= 200 && status < 300 ? 0 : status,
      stdout: text,
      stderr: "",
    };
  }
}

export function boxSpriteName(env: NodeJS.ProcessEnv = process.env): string {
  const named = (
    env.TRAVIS_SPRITE_NAME ??
    env.SPRITE_NAME ??
    env.FLY_SPRITE_ID ??
    "travis"
  )
    .trim()
    .toLowerCase();
  return named || "travis";
}

export function boxToken(env: NodeJS.ProcessEnv = process.env): string {
  return (
    env.SPRITES_TOKEN?.trim() ||
    env.SPRITE_TOKEN?.trim() ||
    env.FLY_API_TOKEN?.trim() ||
    ""
  );
}
