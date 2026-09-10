import { contentKind } from "./not-html";
import { doorFetch, type Desk } from "./desk";

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
): Promise<{ ok: boolean; kind: ReturnType<typeof contentKind>; status: number }> {
  const { res, bodyText, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/live/transcript`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "user", text }),
    },
  );
  if (kind === "sse") {
    return { ok: false, kind, status: res.status };
  }
  if (kind !== "json") {
    throw new Error(`transcript expected JSON, got ${kind} (${res.status})`);
  }
  const data = JSON.parse(bodyText) as { ok?: boolean };
  return { ok: data.ok === true, kind, status: res.status };
}

export async function finalize(
  desk: Desk,
  utterance: string,
): Promise<{ kind: ReturnType<typeof contentKind>; status: number }> {
  const { res, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/finalize`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ utterance }),
    },
  );
  if (kind === "sse") {
    void res.body?.cancel();
  }
  return { kind, status: res.status };
}

export async function send(
  desk: Desk,
  text: string,
  options?: { chipSeatKeys?: string[]; chipSeatKey?: string },
): Promise<{ kind: ReturnType<typeof contentKind>; status: number }> {
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
    void res.body?.cancel();
  }
  return { kind, status: res.status };
}
