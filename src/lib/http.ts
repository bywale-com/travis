/**
 * A route that throws before it can write a body returns an empty 500, and
 * `Response.json()` then reports "Unexpected end of JSON input" — which says
 * nothing about what failed. Read the body first and say what came back.
 */

const SNIPPET = 140;

export function describeBadResponse(opts: {
  status: number;
  statusText?: string;
  body: string;
}): string {
  const body = opts.body.trim();
  const code = opts.statusText
    ? `${opts.status} ${opts.statusText}`
    : String(opts.status);

  if (!body) {
    return opts.status >= 500
      ? `Server error ${code} — the request died before it answered. Check the server log.`
      : `Empty response (${code}).`;
  }

  const flat = body.replace(/\s+/g, " ");
  const snippet =
    flat.length > SNIPPET ? `${flat.slice(0, SNIPPET)}…` : flat;
  return `Server did not return JSON (${code}): ${snippet}`;
}

const MAX_ERROR = 200;

/**
 * Drizzle reports a failed query by dumping the SQL and params, which is
 * unreadable on a phone banner. Prefer the underlying cause and keep it short.
 */
export function describeServerError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = (err as { cause?: unknown }).cause;
  const causeMessage = cause instanceof Error ? cause.message.trim() : "";

  let message = err.message.trim();
  if (/^failed query/i.test(message)) {
    message = causeMessage
      ? `Database error — ${causeMessage}`
      : "Database error — the query did not complete.";
  } else if (causeMessage && causeMessage !== message) {
    message = `${message} (${causeMessage})`;
  }

  const flat = message.replace(/\s+/g, " ");
  return flat.length > MAX_ERROR ? `${flat.slice(0, MAX_ERROR)}…` : flat;
}

/** Parse a JSON body, or throw an error that names the real failure. */
export async function readJson<T>(res: Response): Promise<T> {
  const body = await res.text();
  if (!body.trim()) {
    throw new Error(
      describeBadResponse({
        status: res.status,
        statusText: res.statusText,
        body,
      }),
    );
  }
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(
      describeBadResponse({
        status: res.status,
        statusText: res.statusText,
        body,
      }),
    );
  }
}
