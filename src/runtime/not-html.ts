/** 079 — a door that should be JSON or SSE must not be a Next HTML page. */

export function isHtmlBody(body: string): boolean {
  const head = body.trimStart().slice(0, 32).toLowerCase();
  return head.startsWith("<!doctype") || head.startsWith("<html");
}

export function assertNotHtml(res: {
  headers: Headers;
  bodyText: string;
}): void {
  if (isHtmlBody(res.bodyText)) {
    throw new Error(
      `Door returned HTML (${res.headers.get("content-type") ?? "no type"}): ${res.bodyText.trim().slice(0, 140)}`,
    );
  }
}

export function contentKind(res: { headers: Headers }): "json" | "sse" | "other" {
  const ct = (res.headers.get("content-type") ?? "").toLowerCase();
  if (ct.includes("text/event-stream")) return "sse";
  if (ct.includes("json")) return "json";
  return "other";
}
