# PM look — 016 compose the send harness

**Packet:** PM-PACKET-016
**Change packet:** SYSTEMS-CHANGE-PACKET-032
**PR:** https://github.com/bywale-com/travis/pull/157
**Preview:** https://travis-git-cursor-packet-016-comp-9065c4-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-016 / SCP-032 / ST1–ST3 staples).** Type send’s process around the model is the Deep Agents kit (`createDeepAgent` from `deepagents/node`). Not a Travis-designed engine beside it. Delete `generateTravisTextViaResponses` and the silent `catch` that started that six-step `/v1/responses` cousin. If `invokeDeepAgent` throws, the mouth is `travisGenerateMiss` (080). Dest leave still assembles last `kind=user` + dest print (015 / 031). Instruction-only dest when tape exists is still a miss. Here stays clipped (`LINE_CAP` 300 · `WINDOW_TURNS` 14 · `WINDOW_CHAR_CAP` 2600). Stream chrome is 008 (ST1–ST3). Dest leave `tool=dest_with_context` `body` = the print. 080 hang stays: dynamic import, `deepagents/node`, `serverExternalPackages`. Phone chrome unchanged. No Hear it / Skip **buttons**. Do not remint `voice_turn` / `dest_job` / `heard_at` / `reference_turn_id` / `travis.stream` / `stream_event`. Do not remint 014 / 015 / 030 / 031. Live / Realtime is named silence. Plate staples: Stream · Log · Type.

**src/ (planted, this PR, `fb3cec3`).** Engineer handoff last plant **032 compose the send harness** on #157. Type `generateTravisText` is `invokeDeepAgent` only. The cousin function and the inner `catch` are gone. `finally` still runs `runMotionRunner`. A kit throw reaches `pipeTravisText` → `travisGenerateMiss`. Dest assemble, `/print.md`, `/roster.md`, Here clip, and `dest_job` were not reminted.

```75:99:src/server/travis-openai.ts
export async function generateTravisText(params: {
  sessionId: string;
  prompt: string;
}): Promise<string> {
  const key = openaiKey();
  if (!key) {
    await runMotionRunner(params.sessionId);
    return "";
  }
  const room = await roomContextFor(params.sessionId).catch(() => "");
  try {
    // Load after the send route has already returned SSE. A static import
    // of deepagents on this module made finalize/send/live-token HTML 500
    // at function load — the phone then parsed <!DOCTYPE as JSON.
    // 080: hang `deepagents/node` so Vercel require() hits CJS, not browser ESM.
    // 032: kit throw reaches pipeTravisText → travisGenerateMiss. No cousin.
    const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
    return await invokeDeepAgent({
      sessionId: params.sessionId,
      prompt: params.prompt,
      room,
    });
  } finally {
    await runMotionRunner(params.sessionId);
  }
}
```

`src/` search for `generateTravisTextViaResponses` / `ran out of tool steps` is empty. The six-step `/v1/responses` Type loop is deleted from this file.

Kit is still the process. Seed at invoke is `/print.md` + `/roster.md`. Middleware hangs files, not the request.

```141:154:src/server/travis-deep-agent.ts
  const agent = createDeepAgent({
    model: travisChatModel(),
    systemPrompt: TRAVIS_SYSTEM,
    tools: wrapTravisTools(params.sessionId),
    backend: new StateBackend(),
    middleware: [destKitMiddleware(params.sessionId)],
    subagents: [],
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: input }],
    files: kitFiles(print, roster),
  });
```

Kit throw is visible on the Log. `pipeTravisText` does not swallow into a second engine.

```57:75:src/server/travis-reply.ts
  let reply = "";
  try {
    reply = (await generateTravisText({ sessionId, prompt })).trim();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = await insertStatusTurn(
      sessionId,
      travisGenerateMiss(msg),
    );
    await maybeCloseTravisStream({ sessionId, failed: true }).catch(() => {});
    send("done", {
      matched: true,
      mode: "error",
      seatKey: "travis",
      seatLabel: "Travis",
      postTurn: null,
      turns: [userTurn, status],
    });
    return;
  }
```

Dest grain 031 stands. Always assemble. Null only when there is no last `kind=user`. Stream dest process body is the print.

```29:41:src/server/dest-with-context.ts
export async function destWithContextFor(
  sessionId: string,
): Promise<DestWithContext | null> {
  const turns = await destPrintTurns(sessionId);
  const lastUser = [...turns].reverse().find((t) => t.kind === "user");
  if (!lastUser) return null;
  const print = unclippedPrint(turns);
  return {
    ask: lastUser.text,
    print,
    assembled: assembleDestWithContext({ ask: lastUser.text, print }),
  };
}
```

```640:652:src/server/travis-tools.ts
  const destLeave =
    name === "send_to_seat" || name === "dispatch_to_seat";
  const destFork = destLeave
    ? await destWithContextFor(sessionId).catch(() => null)
    : null;

  const processEv = opened
    ? await startStreamProcess({
        streamId: opened.id,
        tool: destLeave ? "dest_with_context" : name,
        body: destLeave ? (destFork?.print ?? "") : argsBody(args),
      }).catch(() => null)
    : null;
```

Here clip stands. Unchanged.

```25:31:src/lib/room-context.ts
export const WINDOW_TURNS = 14;
export const LINE_CAP = 300;
export const RECEIPT_QUOTE = 140;
export const WINDOW_CHAR_CAP = 2600;
```

080 hang stays. `createDeepAgent` from `deepagents/node`. `serverExternalPackages` includes that path.

```5:16:next.config.ts
  serverExternalPackages: [
    "@cursor/sdk",
    "deepagents",
    "deepagents/node",
    "langchain",
    "@langchain/core",
    "@langchain/langgraph",
    "@langchain/openai",
    "@langchain/langgraph-checkpoint",
    "langsmith",
    "openai",
  ],
```

Stream kinds locked. No fourth kind.

```12:13:src/lib/stream.ts
export const STREAM_EVENT_KINDS = ["message", "process", "thought"] as const;
```

Phone chrome: no Hear it / Skip **buttons** in `Room.tsx` or `LogComposer.tsx`. Spoken `parseHearInvite` stays. Live token stays Realtime (`mintLiveToken`). No new table.

Must-not hold: no Responses Type cousin, no dest remint, no Here unclip, no Live recut, no Hear / Skip buttons, no cousin PR.

**Preview.** Opened the #157 preview, not `travis-psi`. Phone viewport (430×932). Redirected to `vercel.com/login?next=…sso-api…travis-git-cursor-packet-016-comp-9065c4…`. Heading: “Log in to Vercel.” Email / Google / GitHub / ChatGPT / SAML SSO / Passkey. I did not sign in. I did not open production psi. I did not see Voice / Log / Type glass from this seat. Vercel status on `fb3cec3` is Ready. I do not treat SSO as a plant miss. This PR is unmerged — I do not treat production psi as this plant.

## Test

Walked from [`PM-PACKET-016-COMPOSE-TEST.md`](./PM-PACKET-016-COMPOSE-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-016-comp-9065c4-wale-omotayos-projects.vercel.app
**Device:** phone-first (430×932).
**Log | Type:** never reached the room.

### A. A send still answers — A.1 Type ok
**I saw:** SSO wall. Did not type `ok`. Did not Send. Plant: Type `generateTravisText` is `invokeDeepAgent` only. No cousin six-step as the loop. Cheap `ok` is not dest (dest process fires only on dest leave).

### B. Dest mail is still 015 — B.1 Send the alongside line
**I saw:** did not type the 907 dest sentence. Grain still always assembles ask + dest print. Dest `text` on dest leave is `assembled`. He does not create Technical PM from this cut (roster fact / 031 stand).

### After — Voice
**I saw:** no Hear / Skip **buttons** in `Room.tsx`. Spoken invites stay.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Type / Send in room Travis. Type `ok` and watch the Log + Stream. The 907 alongside line. Confirm dest body is ask + print. Talk on a phone. Dest landing on a live Technical PM bind. Reading the vendor bill. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–B). Same PR. No cousin. No `fail-look`. Walk a Ready deploy of `fb3cec3`, not production psi.
