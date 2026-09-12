import { contentKind } from "./not-html";
import { doorFetch, type Desk } from "./desk";

async function consumeSse(
  res: Response,
): Promise<{ events: string[]; error?: string }> {
  const reader = res.body?.getReader();
  if (!reader) return { events: [] };
  const dec = new TextDecoder();
  let buf = "";
  const events: string[] = [];
  let error: string | undefined;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let sep = buf.indexOf("\n\n");
      while (sep >= 0) {
        const chunk = buf.slice(0, sep);
        buf = buf.slice(sep + 2);
        let event = "message";
        const dataLines: string[] = [];
        for (const line of chunk.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
        }
        if (chunk.trim()) events.push(event);
        if (event === "error") {
          error = dataLines.join("\n") || "sse error";
        }
        if (event === "done" || event === "error") {
          await reader.cancel().catch(() => {});
          return { events, error };
        }
        sep = buf.indexOf("\n\n");
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released after cancel */
    }
  }
  return { events, error };
}

export async function token(desk: Desk): Promise<{
  wired: boolean;
  status: number;
}> {
  const { res, bodyText, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/live/token`,
    { method: "POST" },
  );
  if (kind !== "json") {
    throw new Error(`token expected JSON, got ${kind} (${res.status})`);
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(`token ${res.status}: ${bodyText.slice(0, 140)}`);
  }
  const data = JSON.parse(bodyText) as { wired?: boolean };
  return { wired: Boolean(data.wired), status: res.status };
}

export async function transcript(
  desk: Desk,
  text: string,
): Promise<{
  ok: boolean;
  kind: ReturnType<typeof contentKind>;
  status: number;
  events: string[];
  error?: string;
}> {
  const { res, bodyText, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/live/transcript`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "user", text }),
    },
  );
  if (kind === "sse") {
    const consumed = await consumeSse(res);
    return {
      ok: !consumed.error && res.status >= 200 && res.status < 500,
      kind,
      status: res.status,
      ...consumed,
    };
  }
  if (kind !== "json") {
    return {
      ok: false,
      kind,
      status: res.status,
      events: [],
      error: `transcript ${kind} ${res.status}`,
    };
  }
  const data = JSON.parse(bodyText) as { ok?: boolean };
  return { ok: data.ok === true, kind, status: res.status, events: [] };
}

export async function finalize(
  desk: Desk,
  utterance: string,
): Promise<{
  kind: ReturnType<typeof contentKind>;
  status: number;
  events: string[];
  error?: string;
}> {
  const { res, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/finalize`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ utterance }),
    },
  );
  if (kind === "sse") {
    const consumed = await consumeSse(res);
    return { kind, status: res.status, ...consumed };
  }
  return { kind, status: res.status, events: [] };
}

export async function send(
  desk: Desk,
  text: string,
  options?: { chipSeatKeys?: string[]; chipSeatKey?: string },
): Promise<{
  kind: ReturnType<typeof contentKind>;
  status: number;
  events: string[];
  error?: string;
}> {
  const { res, kind } = await doorFetch(`/api/session/${desk.sessionId}/send`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text,
      chipSeatKeys: options?.chipSeatKeys,
      chipSeatKey: options?.chipSeatKey,
    }),
  });
  if (kind === "sse") {
    const consumed = await consumeSse(res);
    return { kind, status: res.status, ...consumed };
  }
  return { kind, status: res.status, events: [] };
}
