# PM look — 079 Talk HTML as JSON

**Packet:** HOTFIX-079
**Change packet:** none (hotfix)
**PR:** https://github.com/bywale-com/travis/pull/149
**Preview:** https://travis-git-cursor-hotfix-079-talk-395a25-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

Lock ([`HOTFIX-079-TALK-HTML-JSON.md`](./HOTFIX-079-TALK-HTML-JSON.md) + 14:02 / 14:22): sending **anything** to Travis — Voice, Talk, or Type — showed `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`. That is the phone parsing an HTML page as JSON. Cut: (1) Voice finalize, Talk finalize, and Type `/send` use `readJson` on non-SSE — banner names status / that it was not JSON, never `Unexpected token '<'`. (2) `consumeAgentStream` / VoiceSession must not dump that parser string onto the banner if a chunk is not JSON. (3) Find why POST returned HTML after 014; if Deep Agents dies before SSE, catch and return JSON or SSE — do not let Next render `<!DOCTYPE`. `maxDuration` 60 on finalize/send if the hang needs it. Keep dest-with-context. Do not remint 014 / 030. Do not put Hear it / Skip **buttons** back.

Plant (Engineer `3b0a166`, handoff last plant **079 Talk HTML as JSON**):

```59:96:src/lib/http.ts
export function parseJsonText<T>(raw: string, what = "payload"): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const flat = raw.replace(/\s+/g, " ").trim();
    const snippet =
      flat.length > SNIPPET ? `${flat.slice(0, SNIPPET)}…` : flat;
    throw new Error(
      snippet
        ? `${what} was not JSON: ${snippet}`
        : `${what} was empty, not JSON`,
    );
  }
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
```

Talk finalize and Type `/send` use `readJson` when the answer is not an event-stream (`Room.tsx` 1307–1317, 1452–1460). Voice finalize is the same (`VoiceSession.tsx` 129–134). Catch still `setError`. `consumeAgentStream` and VoiceSession stream events use `parseJsonText(..., "stream event")` — a `<!DOCTYPE` chunk throws `stream event was not JSON: …`, not `Unexpected token '<'`.

The HTML 500: `generateTravisText` lazy-loads Deep Agents **after** the route has returned SSE:

```85:94:src/server/travis-openai.ts
  try {
    // Load after the send route has already returned SSE. A static import
    // of deepagents on this module made finalize/send/live-token HTML 500
    // at function load — the phone then parsed <!DOCTYPE as JSON.
    const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
    return await invokeDeepAgent({
      sessionId: params.sessionId,
      prompt: params.prompt,
      room,
    });
```

`jsonRoute` wraps finalize / send / live-token so a throw still returns JSON `{ error }` via `describeServerError`. `maxDuration = 60` on finalize and send. Dest-with-context files are unchanged vs `main` (`40afc18`). No Hear it / Skip **buttons** in `src/components/*.tsx`. Spoken invites stay.

`npx tsx --test src/lib/http.test.ts` — 10 pass, 0 fail. HTML 500 → `did not return JSON (500)`; stream chunk → `stream event was not JSON`; neither message contains `Unexpected token`.

**Preview.** Opened this PR’s preview host, not `travis-psi`. Phone viewport (390×844). Redirected to Vercel SSO (`vercel.com/login?next=…sso-api?url=…travis-git-cursor-hotfix-079-talk-395a25…`). I did not sign in. I did not see Voice / Log / Talk glass. No orange banner. Do not fail a hotfix look for that.

Room-bus `applyRoomEvent` still `JSON.parse`s and swallows (`Room.tsx` 1911–1914). That is 029 list catch-up, not consumeAgentStream / VoiceSession send. It does not write the parser line onto the banner.

## Test

Walked [`HOTFIX-079-TALK-HTML-JSON-TEST.md`](./HOTFIX-079-TALK-HTML-JSON-TEST.md).

**URL I opened:** https://travis-git-cursor-hotfix-079-talk-395a25-wale-omotayos-projects.vercel.app  
**Device:** this bind (no phone).  
**Talk | Type | Voice:** never reached the desk.

### A.1 Send a short line (Talk)
**I saw:** SSO wall. Not Log. Not Talk. Not Listening · Clear · Pause. Did not send a line.

### B.1 Type a short line
**I saw:** did not Type. Did not `/send`.

### C.1 One line on Voice
**I saw:** did not open Voice. Did not finalize a spoken line.

**Grain I could walk:** `readJson` / `parseJsonText` on HTML never emit `Unexpected token '<'` or `is not valid JSON`. Finalize / send return JSON or SSE on a throw. Deep Agents load is after SSE headers. Dest-with-context not reminted. Hear / Skip buttons stay off.

**After:** no Hear it / Skip buttons in the planted face.

**Steps I could not do (human):** Vercel team SSO. Talk on a phone. Type a short line on the live desk. Voice one line. Confirm the orange banner never says `Unexpected token '<'` after a real send. Those are the human’s. I do not fail the look for them.

## Loop

Pass: emerged. Human may walk the same sheet on this preview (SSO, then A–C). Same PR. No cousin. No `fail-look`.
