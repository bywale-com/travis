# SYSTEMS-CHANGE-PACKET-031 — Dest harness recut (kit, not keywords)

**Number:** `031` — next systems packet is `032`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#154](https://github.com/bywale-com/travis/pull/154)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-07  
**PM packet:** [`PM-PACKET-015-DEST-HARNESS.md`](./PM-PACKET-015-DEST-HARNESS.md)  
**Test:** [`PM-PACKET-015-DEST-HARNESS-TEST.md`](./PM-PACKET-015-DEST-HARNESS-TEST.md)  
**FACE (look, do not mint from PNG):** [`PLATES-STREAM.md`](./PLATES-STREAM.md) ST1–ST3. No new plates. Staples — **Stream** (compartment = card) · **process** body is the **print** · dest Log line contains the **ask and the print** · **Technical PM** (seated dest, not a new person).  
**Prior (do not remint):** **023** `dest_job` · **024** `travis.stream` / `stream_event` · **025** hang · **026** `heard_at` · **027** stay / `reference_turn_id` · **028** usable chat · **029** room wire · **030** Deep Agents hang / dest grain stores · **011–013** Here clip / motion / OS · **014** log-beats · **015** disposable seats (`protocol_path`).  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** `https://travis-psi.vercel.app` — room Travis. **Log · Type.** Voice parked.

030 planted the harness and a marker-gated dest rewrite. This recut is how that fork fires: every dest send assembles ask + print. The kit hook hangs the print file and a roster fact. Dest seats stay Cursor.

---

## 1. Intent

The dest-with-context fork is a phrase list plus a middleware that classifies and returns. 907 said “alongside” / “this chat,” created a person, and never mailed. This cut drops the marker gate. `send_to_seat` / `dispatch_to_seat` always assemble `prompt` = founder ask + dest print. `/print.md` and a short `/roster.md` live in the kit filesystem. `wrapModelCall` does not paste that print into every think. Spoken Here stays clipped. Named dest to Technical PM / SA / Engineer is `seat=pm|sa|engineer` — not `create_agent` when that protocol is already seated. Dest seats stay Cursor. No new table.

---

## 2. Story

### Must

- Every dest leave (`send_to_seat` / `dispatch_to_seat`) assembles the dest body. Last `kind=user` is the ask. Dest print is this session’s tape (below). Model wrap is discarded.
- A 907-style line (no marker words) leaves a dest body that **contains the ask and the print**. Instruction-only dest when tape exists is a miss.
- Creating Technical PM when he is already seated is a miss. Dest `seat=pm`. Catalog `pm` is not this bind.
- Cheap think (“ok”) is not dest. Do not dump the room into that model call.
- Here stays clipped (`LINE_CAP` 300 · `WINDOW_TURNS` 14 · `WINDOW_CHAR_CAP` 2600).
- Stream chrome is 008 (ST1–ST3). Kinds stay `message` | `process` | `thought`. Dest leave is a `process` whose **body is the print**. Receipt does not overwrite that body.
- Dest seats stay Cursor. Same `dest_job.payload.text`.
- Log · Type first. Phone chrome unchanged. No Hear it / Skip buttons.

### Must-not

- Remint `voice_turn` / `dest_job` / `heard_at` / `reference_turn_id` / `travis.stream` / `stream_event`.
- Remint 030 tables. Rewrite 014 as if it never planted. Remint 011–013 / 027–029 / 015 sit.
- Keep `isDestWithContextAsk` / `MARKERS` as the dest fork.
- Invent a second phrase list for “Technical PM” / “alongside” / “this chat.”
- Inject the dest print into every `wrapModelCall` request (messages / system).
- Swap dest for a Deep Agents `task` / subagent. Remint `dest_job`.
- Mint `/protocols/technical-pm.md`. Mail catalog `pm`.
- Unclip Here. Product cap on dest print length. Cousin PR.
- Plant Hear it / Skip buttons.

### Chain

Type send → `pipeTravisText` inserts `kind=user` → `generateTravisText` → `invokeDeepAgent` → kit hook every think (`/print.md` + `/roster.md`; no print in the request) → dest tool → grain assembles ask + dest print **always** → `insertDestJob` + `dispatchToSeat({ prompt: assembled })` → Cursor. Stream `process` `tool=dest_with_context` body = print.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Cost / token product** | Founder fear named. PM: later. Control this cut = file + dest mail once. Here clip stays. |
| **Live / Realtime harness** | 030. Voice parked. `mintLiveToken` / `/live/tool` stay. Dest grain in `runTravisTool` still rewrites if Live dests. |
| **LangGraph checkpoint table** | 030. Per-invoke. Do not mint. |
| **Deep Agents `task` / subagent dest** | Dest is Cursor. |
| **Unbounded session tape** | 038: every query is bounded. Dest print reuses `REQUEST_SCAN`. Not a new cap. |
| **Hear / Next / Skip table** | 007 / 027. Buttons stay off. |
| **Chip dest without Travis** | Direct chip → `sendOrEnqueueMany` is not this fork. |
| **022 `travis.port`** | Stands. Do not remint. |
| **Other harness forks** | First fork is still dest. Do not invent a catalog. |

---

## 3. Requirements (extraction)

From PM-015 + founder lock. Not a second invention.

1. No more marker words. Assemble on **every** dest send.
2. Kit hook, not a cousin classifier. Print in the filesystem. Do not inject the full print into every model request.
3. Named dest, not create. When they name Technical PM / SA / Engineer as the addressee, dest `seat=pm|sa|engineer`. Do not invent a phrase list. Do not mail catalog `pm`.
4. Dest print is this chat, not Here. SA names the look. No new table.
5. Stream process body on dest is the print. Cheap “ok” is not dest.
6. Dest seats stay Cursor. Do not remint `dest_job`.

Plate staples (not scenery): **Stream** · process body = the **print** · dest Log line = **ask + print** · **Technical PM**.

Do not build from scenery: ST2 labeled Term, bezel, Hear it / Skip buttons, a new phone face.

---

## 4. Quoted stood-up (not memory)

Marker gate (drop this as the fork):

```12:25:src/lib/dest-with-context.ts
const MARKERS = [
  "as context",
  "printed chat",
  "send that list",
  "including what we just",
  "including the one we just",
] as const;

export function isDestWithContextAsk(text: string): boolean {
  const t = text.toLowerCase();
  return MARKERS.some((m) => t.includes(m));
}
```

Grain only after send, and only if that gate hits — and empty print refuses:

```24:36:src/server/dest-with-context.ts
export async function destWithContextFor(
  sessionId: string,
): Promise<DestWithContext | null> {
  const turns = (await recentTurns(sessionId)) as PrintTurn[];
  const lastUser = [...turns].reverse().find((t) => t.kind === "user");
  if (!lastUser || !isDestWithContextAsk(lastUser.text)) return null;
  const print = unclippedPrint(turns);
  if (!print.trim()) return null;
  return {
    ask: lastUser.text,
    print,
    assembled: assembleDestWithContext({ ask: lastUser.text, print }),
  };
}
```

`unclippedPrint` requires a last Travis speakable post, then last `WINDOW_TURNS` worthy, no `LINE_CAP` (`src/lib/dest-with-context.ts` L59–79). `recentTurns` default look is `WINDOW_TURNS * 3` (`src/server/room-read.ts` L37–39). Full `voice_turn.text` is already selected.

Middleware classifies and does nothing:

```98:104:src/server/travis-deep-agent.ts
const destWithContextMiddleware = createMiddleware({
  name: "dest-with-context",
  wrapModelCall: async (request, handler) => {
    void isDestWithContextAsk(lastUserText(request.messages));
    return handler(request);
  },
});
```

`/print.md` is already seeded at invoke (`printFile(print)` · `travis-deep-agent.ts` L115–147). Filesystem tools are not the dest path.

Dest rewrite + stream (only when the gate returns a fork):

```640:695:src/server/travis-tools.ts
  const destFork =
    name === "send_to_seat" || name === "dispatch_to_seat"
      ? await destWithContextFor(sessionId).catch(() => null)
      : null;
  // startStreamProcess tool=dest_with_context body=destFork.print
  // finishStreamProcess skipped when destFork
  // dest text = destFork.assembled else args.text
```

Here clip (mouth). Dest must not use this path:

```25:31:src/lib/room-context.ts
export const WINDOW_TURNS = 14;
export const LINE_CAP = 300;
export const RECEIPT_QUOTE = 140;
export const WINDOW_CHAR_CAP = 2600;
```

Request-log scan already stands for “beyond Here” (not a new dest cap):

```9:11:src/lib/request-log.ts
export const REQUEST_LOG_LIMIT = 30;
export const REQUEST_LINE_CAP = 180;
export const REQUEST_SCAN = 200;
```

038: every room-read query is bounded at the database (`room-read.ts` L4–5).

Role dest / seated (015). Empty `protocol_path` is created, not seated. Locked paths `/protocols/pm.md` \| `sa.md` \| `engineer.md`. `SIT_ROLE_LABEL.pm` = `Technical PM`. `resolveRoleDest` = idle seated or spin + sit. Catalog `pm` is nobody.

```1135:1139:src/server/travis-tools.ts
You can create a person with create_agent — a name, optional model and repo. …
When the founder wants the PM, SA, or Engineer, send_to_seat or dispatch_to_seat with seat and no who. …
An unseated catalog slug is nobody — do not mail it. Create and sit, or offer Engineer.
```

`dest_job.payload.text` is the dest body (`schema.ts` L211 · `dest-job.ts` L94). `dispatchToSeat({ prompt })` (`dispatch.ts`).

Stream kinds locked. Empty `tool` on process is forbidden:

```12:13:src/lib/stream.ts
export const STREAM_EVENT_KINDS = ["message", "process", "thought"] as const;
```

Live dest already hits `runTravisTool` (`src/app/api/session/[id]/live/tool/route.ts`).

---

## 5. Stores / fields / contracts

### Refuse (do not mint)

| Thing | Why |
|-------|-----|
| New table for dest print | Tape is `voice_turn.text`. |
| `dest_job` columns | `payload.text` is the dest body. Write a longer string. |
| `travis.stream` / `stream_event` columns or kinds | `tool` is already a string. `dest_with_context` stays the dest-leave name. |
| `voice_turn` / `heard_at` / `reference_turn_id` | Stand. |
| `/protocols/technical-pm.md` | 027. |
| Marker / “Technical PM” phrase list | Cousin classifier. 015 lock 1–3. |
| Dest print length as a product cap | Founder: no caps. Bound is the existing `REQUEST_SCAN` query. |
| LangGraph checkpoint table | 030 silence. |

### Change (grain + runtime — not SQL)

| What | Change |
|------|--------|
| `MARKERS` / `isDestWithContextAsk` | **Delete** as the dest fork. Recut tests that assert true/false on the 014 dest sentence. |
| `unclippedPrint` | Recut: this session’s `isContextWorthy` turns, raw `text`, `formatPrintLine`, no `LINE_CAP`, no `WINDOW_CHAR_CAP`, **no** last-Travis-required. Empty tape → `""`. |
| Dest print load | `recentTurns(sessionId, REQUEST_SCAN)` for dest print **and** `/print.md`. Here still uses default `recentTurns` + clip. Reuse `REQUEST_SCAN`. Do not mint a constant. |
| `assembleDestWithContext` | `print` empty → return `ask.trim()` only. Else `ask + blank line + print`. |
| `destWithContextFor` | Last `kind=user` = ask. Always assemble. Null only when there is no last user. Empty print is still a dest (`assembled` = ask). |
| Dest path in `runTravisTool` | On `send_to_seat` / `dispatch_to_seat`, always run that grain before `guardDuplicate` / `insertDestJob` / `dispatchToSeat`. `text` = assembled (or `args.text` if grain is null). |
| Stream process on dest leave | Always `kind=process` · `tool=dest_with_context` · `body` = print (empty print → empty body). **Do not** `finishStreamProcess` overwrite with the dest receipt. Other tools keep today’s finish-with-result. |
| `wrapModelCall` | Close over `sessionId`. Hang `/print.md` = dest print and `/roster.md` = roster fact (below). **Do not** append print to `request.messages` or system. `return handler(request)`. Drop `void isDestWithContextAsk(...)`. |
| `invokeDeepAgent` | Keep `files:` seed. Seed both `/print.md` and `/roster.md` at invoke. Hook may refresh them. Same `StateBackend`. |
| `TRAVIS_SYSTEM` | Do not rewrite the novel. Do not add a phrase list. Roster fact lives in `/roster.md`. |

### Keep

Here clip. `dispatchToSeat`. `dest_job.payload.text`. Stream kinds. 008 desk. 029 room wire. 015 sit / `resolveRoleDest`. `create_agent` for **New** person. `OPENAI_API_KEY` server-side. Cursor dest port. Deep Agents hang on Type.

---

## 6. Runtime behavior

### Who writes

| Writer | What |
|--------|------|
| Founder Type send | `voice_turn` `kind=user` (already, before the loop). |
| Dest grain | Rewrites dest `text` = ask + dest print on every dest leave. |
| `insertDestJob` | `payload.text` = assembled. |
| `dispatchToSeat` | Cursor run `prompt` = assembled. Dest Log line = assembled. |
| `startStreamProcess` | Dest leave: `tool=dest_with_context`, `body=print`. |
| Deep Agents StateBackend | `/print.md` = dest print. `/roster.md` = roster fact. This invoke only. |
| `pipeTravisText` | Final Travis mouth `agent_post` (unchanged leave). |

### Who reads

| Reader | What |
|--------|------|
| Dest grain / `/print.md` | This session: last `kind=user`; `recentTurns(sessionId, REQUEST_SCAN)` worthy, raw `text`. |
| Cursor dest | Assembled `prompt`. |
| Stream pane / Log card | `process` body = print. |
| Here / next Type mouth | Still clipped `roomContextFor`. |
| Kit hook | `/roster.md` — seated protocols this room. Not the dest payload. |

### Triggers

1. **Every Type message** — `invokeDeepAgent` (hook on every model call).
2. **Dest leave** — `send_to_seat` / `dispatch_to_seat`. Assemble **always**. No marker test.
3. **Cheap think** — no dest tool. No dest process. Print stays in the file, not in the request.

### Dest print (lock)

```text
look = recentTurns(sessionId, REQUEST_SCAN)   // existing bound; not a new cap
print = isContextWorthy turns in that look, chronological,
        formatPrintLine, raw text, no LINE_CAP, no WINDOW_CHAR_CAP
        (thoughts / check narration / empty stay out — isContextWorthy)
ask   = last kind=user text. Do not use the model's wrap.
assembled = ask + blank line + print
            if print is blank: ask only
```

Do not require a last Travis speakable post. Do not slice `WINDOW_TURNS` on dest print. Do not duplicate a line.

`destIdempotencyKey` already slices 240 of `text`. Assembled text is a new key. Fine.

### Roster fact (lock — kit file, not a classifier)

`/roster.md` is `listSeatRoster(sessionId)` plus these three lines (always):

```text
Named dest to Technical PM, SA, or Engineer is send_to_seat or dispatch_to_seat with seat=pm|sa|engineer and no who.
Do not create_agent for that dest. Catalog pm is not this bind.
New PM is create_agent then sit_agent — only when they asked for a new person.
```

`listSeatRoster` already prints `label (seat_key) — protocol_path|not seated — idle|busy`. Seated Technical PM = an open member with `protocol_path = /protocols/pm.md`. Same for sa / engineer.

Do not parse the founder line for “technical PM.” Do not refuse `create_agent` as a tool. The hook + existing `TRAVIS_SYSTEM` + 015 role dest are the cut. Verify is the 907 line dests and does not create.

### Cheap think (lock)

`ok` is not dest. `wrapModelCall` must not concatenate `/print.md` into the model request. Kit summarization stays the history control. A dest `process` must not fire on that send.

### Live

Named silence for the library hang. `/live/token` + `/live/tool` unchanged. If Live calls `send_to_seat`, dest grain still runs (same `runTravisTool`). Do not plant Hear / Skip buttons.

---

## 7. Ports

| Port | This cut |
|------|----------|
| OpenAI Type (`OPENAI_API_KEY`, `TRAVIS_TEXT_MODEL`) | **Real.** Still Deep Agents invoke (030). Fallback Responses loop stays if invoke throws. Dest grain is in `runTravisTool` either path. |
| npm `deepagents` `wrapModelCall` / `StateBackend` | **Real.** Files only. Do not inject print into the request. |
| Cursor dest (`dispatchToSeat` / `streamCursorReply`) | **Real.** Prompt is the assembled string. Do not replace with `task`. |
| Deep Agents `FilesystemBackend` | **Refuse.** |
| Deep Agents `task` / subagent dest | **Refuse.** |
| Live Realtime | **Stand-in for the hang.** Dest grain still runs. |
| Here clip | **Real, unchanged.** |

---

## 8. Verify

Smoke is [`PM-PACKET-015-DEST-HARNESS-TEST.md`](./PM-PACKET-015-DEST-HARNESS-TEST.md) on **psi** Log · Type. Do **not** use the 014 dest sentence (it contains the old markers). Pass from `src/` only is a miss.

**Pass**

1. A.1 — 907 alongside line dests Technical PM. Dest body on the Log **contains the ask and the print** (titles / turns), not only a wrap of “send that alongside.” He does **not** say he is creating Technical PM. Process is dest (`send_to_seat` / `dispatch_to_seat` / `dest_with_context`), not `create_agent`.
2. B.1 — Stream is the 008 desk. A `process` row is the dest fork. Body includes the print from A — not only “include the printed chat” / `read_seat_reply`. No create-person process for Technical PM.
3. C.1 — Type `ok`. Travis answers. No dest leaves. Stream process for that send is **not** the whole room pasted as the think.
4. Here still clips Travis mouth on the **next** Type turn (`LINE_CAP` stands).
5. No Hear it / Skip **buttons**.

**Grain tests (Engineer, `src/lib/*.test.ts`)**

- Delete `isDestWithContextAsk` true/false cases.
- 907 sentence (no markers) + a 2086-character Travis post → `assembleDestWithContext` includes that post; `describeTurn` of that post would have been 300.
- Worthy turns older than `WINDOW_TURNS` that sit inside `REQUEST_SCAN` appear in dest print.
- Empty print → assembled === ask.
- `ok` is not a dest assemble test — dest assemble runs only on dest leave.

**Fail**

- Dest `payload.text` / Cursor prompt is the wrap, or the ask without the print when tape exists.
- Stream process body is the receipt or `read_seat_reply`.
- Technical PM is created when already seated.
- Print injected into the cheap `ok` think.
- Here unclipped.
- Live / Voice recut.

---

## 9. Out of scope

- Voice chrome, Live Deep Agents hang, Hear / Skip buttons.
- Unclipping Here. Cost work. Checkpoint table.
- Remint 011–013 / 023–030. Cousin PR.
- Other harness forks after dest.
- 022 plant. Computer use. Canvas.
- Travis-writes-PHASE-ONE-LOG.
- Chip dest without Travis.

---

## 10. Engineer cut order

1. Recut dest print + assemble + `destWithContextFor`. Drop `MARKERS` / `isDestWithContextAsk`. Tests.
2. Dest rewrite in `runTravisTool` **always** on dest leave. Stream `dest_with_context` body = print; skip receipt overwrite.
3. Seed `/print.md` + `/roster.md`. `wrapModelCall` hangs those files; does not inject print into the request. Drop the void classifier.
4. Psi walk of the 015 test sheet (907 wording).

No leftover analysis. Same PR. Next SA number is **032**.
