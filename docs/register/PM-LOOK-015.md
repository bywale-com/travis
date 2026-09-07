# PM look — 015 dest harness recut

**Packet:** PM-PACKET-015
**Change packet:** SYSTEMS-CHANGE-PACKET-031
**PR:** https://github.com/bywale-com/travis/pull/154
**Preview:** https://travis-git-cursor-packet-015-dest-ba125c-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-015 / SCP-031 / ST1–ST3 staples).** No marker words. Every dest leave (`send_to_seat` / `dispatch_to_seat`) assembles founder ask + dest print. Dest print is this session’s `REQUEST_SCAN` worthy tape — raw text, no `LINE_CAP`, no `WINDOW_CHAR_CAP`, no last-Travis-required. Empty print still dests (assembled = ask). Kit hook hangs `/print.md` + `/roster.md`; does not paste the print into every think. Named dest to Technical PM / SA / Engineer is `seat=pm|sa|engineer`, not `create_agent` when that protocol is already seated. Dest seats stay Cursor. Stream chrome is 008. Dest leave is `kind=process` · `tool=dest_with_context` · **body is the print**; receipt does not overwrite. Cheap `ok` is not dest. Here stays clipped (`LINE_CAP` 300 · `WINDOW_TURNS` 14 · `WINDOW_CHAR_CAP` 2600). No Hear it / Skip **buttons**. Do not remint 011–013 / 023–030. Plate staples: Stream · process body = the print · dest Log line = ask + print · Technical PM.

**src/ (planted, this PR, `3f69774`).** Engineer handoff last plant **031 dest harness recut** on #154. Marker gate is gone. `isDestWithContextAsk` / `MARKERS` have no remaining hits in `src/`. Dest grain always assembles. Kit files seed at invoke. Stream dest process body is the print.

Grain — always assemble. Null only when there is no last `kind=user`. Empty print is still a dest.

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

```33:55:src/lib/dest-with-context.ts
export function unclippedPrint(turns: PrintTurn[]): string {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const turn of turns) {
    if (!isContextWorthy(turn)) continue;
    const text = turn.text.trim();
    if (!text) continue;
    const line = formatPrintLine(turn);
    if (seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }
  return lines.join("\n");
}

export function assembleDestWithContext(params: {
  ask: string;
  print: string;
}): string {
  const ask = params.ask.trim();
  if (!params.print.trim()) return ask;
  return `${ask}\n\n${params.print}`;
}
```

`destPrintTurns` is `recentTurns(sessionId, REQUEST_SCAN)`. Here still uses default `recentTurns` + clip. `REQUEST_SCAN` is 200 — reused, not a new cap.

Dest rewrite in `runTravisTool` **always** on dest leave. Stream `tool=dest_with_context` · `body=print`. `finishStreamProcess` skipped on dest leave. Dest `text` is `assembled` (or `args.text` if grain is null). `handToDest` still writes `insertDestJob({ text })` and `dispatchToSeat({ prompt: text })`. `dest_job` columns not reminted.

```640:660:src/server/travis-tools.ts
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

  const finish = async (result: ToolResult): Promise<ToolResult> => {
    if (processEv && !destLeave) {
      await finishStreamProcess({
        eventId: processEv.id,
        body: result.text,
      }).catch(() => {});
    }
```

```691:696:src/server/travis-tools.ts
  if (name === "send_to_seat" || name === "dispatch_to_seat") {
    const seat = String(args.seat ?? "");
    const who = String(args.who ?? "").trim();
    const text = destFork
      ? destFork.assembled
      : String(args.text ?? "").trim();
```

Kit hook hangs files. Does not append print to `request.messages` or system. Seed at invoke is both `/print.md` and `/roster.md`. Roster fact is the three named-dest lines, not a phrase classifier.

```104:117:src/server/travis-deep-agent.ts
function destKitMiddleware(sessionId: string) {
  return createMiddleware({
    name: "dest-with-context",
    wrapModelCall: async (request, handler) => {
      const print = await unclippedPrintFor(sessionId).catch(() => "");
      const roster = await rosterFactFor(sessionId).catch(() =>
        formatRosterFact(""),
      );
      const files = kitFiles(print, roster);
      const state = request.state as { files?: Record<string, unknown> };
      state.files = { ...(state.files ?? {}), ...files };
      return handler(request);
    },
  });
}
```

```10:14:src/lib/dest-with-context.ts
export const ROSTER_DEST_LINES = [
  "Named dest to Technical PM, SA, or Engineer is send_to_seat or dispatch_to_seat with seat=pm|sa|engineer and no who.",
  "Do not create_agent for that dest. Catalog pm is not this bind.",
  "New PM is create_agent then sit_agent — only when they asked for a new person.",
] as const;
```

Here clip stands. Unchanged.

```25:31:src/lib/room-context.ts
export const WINDOW_TURNS = 14;
export const LINE_CAP = 300;
export const RECEIPT_QUOTE = 140;
export const WINDOW_CHAR_CAP = 2600;
```

Stream kinds locked. No fourth kind.

```12:13:src/lib/stream.ts
export const STREAM_EVENT_KINDS = ["message", "process", "thought"] as const;
```

Phone chrome: no Hear it / Skip **buttons** in `Room.tsx` or `LogComposer.tsx`. Spoken `parseHearInvite` stays. `create_agent` stays for a New person. `TRAVIS_SYSTEM` still names role dest `seat` with no `who` — not a new “Technical PM” phrase list. No new table.

Grain tests (`npx tsx --test src/lib/dest-with-context.test.ts src/lib/handoff-seat.test.ts`): 8 pass, 0 fail. 907 sentence (no markers) + a 2086-character Travis post stays in assemble. Worthy turns older than `WINDOW_TURNS` inside `REQUEST_SCAN` stay in dest print. Empty print → assembled === ask. Dest print does not require a last Travis speakable post. Roster fact hangs the named-dest lines.

Must-not hold: no marker fork, no print-in-every-think, no Here unclip, no Live recut, no `dest_job` remint, no `/protocols/technical-pm.md`, no Hear / Skip buttons, no cousin.

**Preview.** Opened the #154 preview, not `travis-psi`. Phone viewport (430×932). Redirected to `vercel.com/login?next=…sso-api…travis-git-cursor-packet-015-dest-ba125c…`. Heading: “Log in to Vercel.” Email / Google / GitHub / ChatGPT / SAML SSO / Passkey. I did not sign in. I did not open production psi. I did not see Voice / Log / Stream glass from this seat. Vercel comment on this SHA is Ready. I do not treat SSO as a plant miss. `DATABASE_URL` is set; I did not query production as this plant — this PR is unmerged. Human walks a Ready preview of `3f69774`.

## Test

Walked from [`PM-PACKET-015-DEST-HARNESS-TEST.md`](./PM-PACKET-015-DEST-HARNESS-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-015-dest-ba125c-wale-omotayos-projects.vercel.app
**Device:** phone-first (430×932).
**Log | Type:** never reached the room.

### A. Dest carries this chat — A.1 Send the alongside line
**I saw:** SSO wall. Did not type the 907 dest sentence. Did not Send. Grain `destWithContextFor` no longer gates on markers. `assembleDestWithContext` keeps a 2086-character Travis post that `describeTurn` clips. Dest `text` on dest leave is `assembled`, not the model wrap.

### B. Stream shows that dest — B.1 Open Stream
**I saw:** did not open Stream. Plant starts `kind=process` · `tool=dest_with_context` · `body=print` and skips receipt overwrite. Chrome kinds stay three. ST1–ST3 staples are Stream · process body = the print · dest Log line contains the ask and the print.

### C. A cheap line does not dump the room — C.1 Type ok
**I saw:** did not type `ok`. `wrapModelCall` hangs `/print.md` on `state.files` and returns `handler(request)` — it does not concatenate the print into the model request. Dest process fires only on dest leave.

### Voice
**I saw:** no Hear / Skip **buttons** in `Room.tsx`. Spoken invites stay.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Type / Send in room Travis. The 907 alongside line. Open Stream and read the process body. Type `ok` and confirm no dest. Talk on a phone. Dest landing on a live Technical PM bind. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–C). Same PR. No cousin. No `fail-look`. Walk a Ready deploy of `3f69774`, not production psi.
