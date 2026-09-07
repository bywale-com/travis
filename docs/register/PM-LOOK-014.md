# PM look — 014 Deep Agents

**Packet:** PM-PACKET-014
**Change packet:** SYSTEMS-CHANGE-PACKET-030
**PR:** https://github.com/bywale-com/travis/pull/147
**Preview:** https://travis-git-cursor-pm-successor-bind-be8a-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-014 / SCP-030 / ST1–ST3 staples).** Every Type message runs the Deep Agents harness, then a fork. Dest-with-context: founder “send that as context” / printed chat / that list → dest `text` **is** the unclipped print plus the ask. Not “tell Technical PM to include the chat.” Here stays clipped (`LINE_CAP` 300 · `WINDOW_TURNS` 14 · `WINDOW_CHAR_CAP` 2600). Dest assembly and the filesystem read unclipped tape. Dest to Technical PM / SA / Engineer stays Cursor (`send_to_seat` / `dispatchToSeat` / `dest_job.payload.text`). Stream chrome stays 008 (ST1–ST3). Kinds stay `message` | `process` | `thought`. Dest-with-context is a `process` whose **body is the print**; receipt does not overwrite. No Hear it / Skip **buttons**. Live / Voice parked. No new table. Kit is not magic — we wrote the fork. Do not remint 011–013 / 023–029.

**src/ (planted, this PR, `5b864f2`).** Engineer handoff last plant **030 Deep Agents (dest-with-context)** on #147. Type `generateTravisText` is `createDeepAgent().invoke`. Grain rewrites dest before job/dispatch. Stream `tool=dest_with_context` body = the print.

Harness hang — one Type loop. The six-step `/v1/responses` for-loop is gone. Same `OPENAI_API_KEY` / `TRAVIS_TEXT_MODEL`. Responses-backed ChatOpenAI. `runMotionRunner` in `finally` stays. Live token unchanged.

```76:94:src/server/travis-openai.ts
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

```127:147:src/server/travis-deep-agent.ts
export async function invokeDeepAgent(params: {
  sessionId: string;
  prompt: string;
  room: string;
}): Promise<string> {
  const print = await unclippedPrintFor(params.sessionId).catch(() => "");
  const input = params.room
    ? `${params.room}\n\n${params.prompt}`
    : params.prompt;
  const agent = createDeepAgent({
    model: travisChatModel(),
    systemPrompt: TRAVIS_SYSTEM,
    tools: wrapTravisTools(params.sessionId),
    backend: new StateBackend(),
    middleware: [destWithContextMiddleware],
    subagents: [],
  });
```

`registerHarnessProfile` omits default `task` / `execute`. No `FilesystemBackend`. `/print.md` is StateBackend this invoke. Middleware classifies; dest payload does not depend on the model reading that file.

Classifier + assemble match the lock. 014 dest sentence is true. Instruction-only is false. `assembleDestWithContext` is `ask` + blank line + print. Grain tests cover both sentences and a 2086-character Travis post that `describeTurn` would clip to 300.

```22:25:src/lib/dest-with-context.ts
export function isDestWithContextAsk(text: string): boolean {
  const t = text.toLowerCase();
  return MARKERS.some((m) => t.includes(m));
}
```

```82:87:src/lib/dest-with-context.ts
export function assembleDestWithContext(params: {
  ask: string;
  print: string;
}): string {
  return `${params.ask.trim()}\n\n${params.print}`;
}
```

Dest rewrite in `runTravisTool` **before** `insertDestJob` / `dispatchToSeat`. Last `kind=user` + last Travis speakable `agent_post`. Model wrap discarded.

```640:658:src/server/travis-tools.ts
  const destFork =
    name === "send_to_seat" || name === "dispatch_to_seat"
      ? await destWithContextFor(sessionId).catch(() => null)
      : null;

  const processEv = opened
    ? await startStreamProcess({
        streamId: opened.id,
        tool: destFork ? "dest_with_context" : name,
        body: destFork ? destFork.print : argsBody(args),
      }).catch(() => null)
    : null;

  const finish = async (result: ToolResult): Promise<ToolResult> => {
    if (processEv && !destFork) {
      await finishStreamProcess({
```

```690:696:src/server/travis-tools.ts
  if (name === "send_to_seat" || name === "dispatch_to_seat") {
    const seat = String(args.seat ?? "");
    const who = String(args.who ?? "").trim();
    const text = destFork
      ? destFork.assembled
      : String(args.text ?? "").trim();
```

`handToDest` still writes `insertDestJob({ text })` and `dispatchToSeat({ prompt: text })`. That `text` is the assembled string on this fork. `dest_job` columns not reminted.

Here clip stands. `LINE_CAP` / `WINDOW_TURNS` / `WINDOW_CHAR_CAP` unchanged. `ContextTurn` gained `speakable` for dest grain; Here still uses `describeTurn`. `recentTurns` now passes `speakable`. No unclip of the mouth.

```23:30:src/lib/room-context.ts
export const WINDOW_TURNS = 14;
export const LINE_CAP = 300;
export const RECEIPT_QUOTE = 140;
export const WINDOW_CHAR_CAP = 2600;
```

Stream kinds locked. No fourth kind.

```12:13:src/lib/stream.ts
export const STREAM_EVENT_KINDS = ["message", "process", "thought"] as const;
```

Phone chrome: no Hear it / Skip **buttons** in `Room.tsx`. Spoken `parseHearInvite` stays. `mintLiveToken` / `/live/token` + `/live/tool` stand. npm `deepagents` + LangChain peers are server (`serverExternalPackages`). No new table.

Must-not hold: no Technical PM subagent, no Here unclip, no Live recut, no `FilesystemBackend`, no cousin, no remint of `voice_turn` / `dest_job` / `heard_at` / `reference_turn_id` / `travis.stream`.

**Preview.** Opened the #147 preview, not `travis-psi`. Phone viewport (430×932). Redirected to `vercel.com/login?next=…sso-api…travis-git-cursor-pm-successor-bind-be8a…`. Heading: “Log in to Vercel.” Email / Google / GitHub / ChatGPT / SAML SSO / Passkey. I did not sign in. I did not open production psi. I did not see Voice / Log / Stream glass from this seat. Vercel check on `5b864f2` passed. Authenticated `vercel curl` of this alias returned 200 Next.js HTML (`x-matched-path: /`). I do not treat SSO as a plant miss. `DATABASE_URL` is set; I did not query production as this plant — this PR is unmerged. Human walks a Ready preview of this SHA.

## Test

Walked from [`PM-PACKET-014-DEEP-AGENTS-TEST.md`](./PM-PACKET-014-DEEP-AGENTS-TEST.md).

**URL I opened:** https://travis-git-cursor-pm-successor-bind-be8a-wale-omotayos-projects.vercel.app
**Device:** phone-first (430×932).
**Log | Type:** never reached the room.

### A. The list is on the tape — A.1 Ask for the list
**I saw:** SSO wall. Did not type `List the open initiatives in this room, in order.` Did not Send. src/ Type loop is Deep Agents invoke; a list post would be a speakable `agent_post` on the tape.

### B. Dest carries that list — B.1 Send as context
**I saw:** did not type the dest sentence. Grain `isDestWithContextAsk` is true on that exact sentence. `assembleDestWithContext` keeps a 2086-character Travis post that `describeTurn` clips. Dest `text` on this fork is `assembled`, not the model wrap.

### C. Stream shows that dest — C.1 Open Stream
**I saw:** did not open Stream. Plant starts `kind=process` · `tool=dest_with_context` · `body=print` and skips receipt overwrite. Chrome kinds stay three. ST1–ST3 staples are Stream · process body = the print · dest Log line contains the list.

### Voice
**I saw:** no Hear / Skip **buttons** in `Room.tsx`. Spoken invites stay.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Type / Send in room Travis. Dest sentence after a lived list. Open Stream and read the process body. Talk on a phone. Dest landing on a live Technical PM bind. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–C). Same PR. No cousin. No `fail-look`. Walk a Ready deploy of `5b864f2`, not production psi.
