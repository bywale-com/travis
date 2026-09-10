# SYSTEMS-CHANGE-PACKET-035 — Stream architecture (start before wrap)

**Number:** `035` — next systems packet is **036**. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#163](https://github.com/bywale-com/travis/pull/163)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-09  
**PM packet:** [`PM-PACKET-019-STREAM-ARCH.md`](./PM-PACKET-019-STREAM-ARCH.md)  
**Test:** [`PM-PACKET-019-STREAM-ARCH-TEST.md`](./PM-PACKET-019-STREAM-ARCH-TEST.md)  
**FACE (look, do not mint from PNG):** [`PLATES-STREAM.md`](./PLATES-STREAM.md) ST1–ST3. No new plates. Staples — **Stream** (compartment = card) · **Log** · **Type**. Dest Log line = **ask + print**. Seat glass = **Technical Architect** (catalog `pm` hidden).  
**Prior (do not remint):** **023** `dest_job` · **024** `travis.stream` / `stream_event` · **025** hang · **026** `heard_at` · **027** stay / `reference_turn_id` · **028** usable chat · **029** room wire · **030** Deep Agents hang · **031** dest assemble / `/print.md` / `/roster.md` · **032** kit-only Type send · **033** dest-gate-on-ask / Cloud create / living sit · **034** checkpointer + `thread_id = voice_session.id` + dest follow-up on an open `dest_job` · **011–013** Here clip / motion / OS · **014** log-beats · **015** disposable seats · **007** membership · **080** `deepagents/node` + `serverExternalPackages` + `travisGenerateMiss`.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** `https://travis-psi.vercel.app` — a room with tape. **Log · Type** first. Voice wrap after, if you can.

014–018 / 034 stay hung. This cut splits **start work** from **speak**. Classify is one lib. Do is hang. Mouth is last. Not a Travis orchestrator. Not Pipecat.

---

## 1. Intent

In-flight work is already two lists: open `travis.dest_job` rows (`listOpenDestJobs`) and the LangGraph checkpoint on `thread_id = voice_session.id` (034). That pair holds “what he just started.” Do not mint a job table, a vector store, or an event bus. A live phrase is classified in `stream-intent` (pivots + match those lists + seat names `router` already hears). `stream-dispatch` only hangs ports that exist: dest assemble + `dispatchToSeat` / 034 follow-up, `cancelCursorRun`, and a later `invoke` on the same `thread_id`. `parent_id` stays unused — a change is follow-up on the **existing** open row, not a child insert. Live transcript never full-pipes Travis. Finalize (Voice) and Type-after-Do speak once from the thread + open dests. Glass string for catalog `pm` is **Technical Architect**. Protocol path stays `/protocols/pm.md`.

---

## 2. Story

### Must

- Work starts on the phrase, not on “I’m done.” Leaves that classify as `new` / `change` / `cancel` run from `live/transcript` (Voice) or from Type send **before** the wrap.
- In-flight staple = open `dest_job` (`created` | `dispatched` | `in_progress`) + LangGraph checkpoint (`thread_id = sessionId`). Classify reads those. No new store.
- Classify is `src/lib/stream-intent.ts` only. Emit `new` | `change` | `cancel` | `talk`. Name a target: open `dest_job.id` or `travis-thread`. No prose. No speak.
- Change pivots are zero-token and **not** dest-gate: *actually, wait, instead, scrap that, no — the*. Do not add them to `dest-gate.ts`.
- Match the target by comparing the phrase to `payload.text` + `binding.label` / seat on `listOpenDestJobs`. Checkpoint / tape last claims are the Travis-thread side. No embeddings.
- `new` + named seat → existing dest leave (031 assemble + 033 living resolve + 034 `destPathForBind`). Ticket only after `insertDestJob` (033). Living person. No create.
- `new` + walk-back → same-thread `invoke` (update). `search_room` / print already on that kit. No dest.
- `change` + open dest → Cursor follow-up on **that bind** (034). Same `dest_job` row. Do not `insertDestJob`. Do not set `parent_id`.
- `change` + Travis thread → later `invoke` on the same `thread_id`. May run tools. Does not owe a spoken wrap.
- `cancel` + open dest → `cancelCursorRun` for that bind’s live run. Job finishes failed/cancelled on the existing harvest path. No cousin dest.
- `talk` → tape write only (the door already inserts `kind=user`). No dest. No invoke.
- Type send: classify the line (it may hold more than one intent) → dispatch each `new` / `change` / `cancel` → **then** synthesize. Type has no second done-door.
- Voice finalize: conductor still strips “I’m done.” Synthesize only. Catch a missed leave **once**, then speak. Leaves that already left stay left.
- Live `liveShouldPipeTravis` is **false**. Dest-by-name on transcript may still leave (already works). Do not `pipeTravisText` on every flush.
- 014–018 / 034 stay. Dest body ask + print. Dest-gate on the last ask. Cloud create. Checkpointer + `thread_id`. Follow-up when an open job exists for that bind.
- Glass: `destGlassName` / `SIT_ROLE_LABEL.pm` / `seatKeyToLabel("pm")` → **Technical Architect**. Spoken “Technical Architect” and “Technical PM” both route to `pm`. Path `/protocols/pm.md`. Catalog `pm` hidden. Person label still wins when it is a real name (not `PM` / `Technical PM`).
- Log · Type first. No Hear it / Skip buttons. No Responses cousin. No Pipecat.

### Must-not

- Mint `travis.thread`, a memory table, a job/in-flight table, a vector store, or an event-bus table.
- Remint `dest_job` / use `parent_id` as a change DAG or a second open row.
- Remint 031 assemble, 032 Type kit, 033 gate/create/sit, 034 checkpointer / `dest-follow`.
- Hang `Command({ update })`, `graph.updateState`, `interrupt_on`, or `Command({ resume })`. Official persistence edit exists ([LangGraph checkpointers](https://docs.langchain.com/oss/javascript/langgraph/checkpointers) `updateState`); we do not have Travis claim-channels. Tape + `dest_job` + later `invoke` are enough.
- Invent a Travis orchestrator / Temporal / Inngest / homemade bus. Grow `motion.ts` into this board.
- Install Pipecat. Replace `travis-live-client.ts`. Restore Responses.
- Put classify in the browser, in `conductor.ts`, or in `dest-gate.ts`.
- Add *actually* / *wait* to `HIS_WORK` / dest-gate.
- Full-pipe Travis on live flush. Speak the wrap from transcript.
- Role-dest spin or create on a change. Enqueue-as-modify when the seat is idle (034 stands).
- Plant coffee / board / bike products. Mint `/protocols/technical-architect.md`.
- Product cap. Cousin PR. Hear / Skip buttons.

### Chain

Voice phrase → `live/transcript` writes `kind=user` → `streamIntent(phrase, listOpenDestJobs)` → dest-by-name still leaves if `parseCallByName` already named a Cursor seat (do **not** `new`-dispatch that seat again) → `stream-dispatch` for remaining `new` / `change` / `cancel` / walk-back → return. No `pipeTravisText`.

Voice wrap → `finalize` strips done-phrase (`conductor.ts`) → synthesize `invoke` (read thread + open dests) → `pipeTravisText` once.

Type send → write `kind=user` → classify (one or more intents) → dispatch each Do → synthesize `pipeTravisText`.

`new` dest (no open job for that bind) → `destWithContextFor` (this phrase is the last `kind=user`) → `classifyDestPrompt(ask)` → living resolve → `insertDestJob` → ticket → `dispatchToSeat`.

`change` dest (open job for that bind, or classify named that `dest_job.id`) → same assemble grain → `destPathForBind(true)` → `streamCursorReply` / `dispatchToSeat` with `destEnqueueIfBusy("follow-up")`. No new row. Busy → 034 named `agent_busy`.

Walk-back / Travis `change` → `invokeDeepAgent({ mode: "update" })` on `thread_id = sessionId`. Do not dest. Do not speak.

`talk` → stop after the tape write.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **`dest_job.parent_id` as change pointer** | Column exists (`dest-job.ts` L30). `insertDestJob` never sets it. A change is follow-up on the **same** open row. A child row would be a second in-flight staple and confuse match. Tape + Cursor conversation already hold the follow-up text. |
| **Vector / embeddings match** | Open dest `payload.text` + label, plus tape / checkpoint last claims, can match the walk. Prove that pair first. Do not open a store. |
| **Scoped extract model** | After pivot + target, the phrase **is** the new ask. 015 assemble (ask + print) is enough. Cursor already has the dest conversation. Do not mint a second structured-read model. |
| **`Command({ update })` / `updateState` / HITL** | 034 silence stands. Later `invoke` on the same `thread_id` is the Travis-side change. `updateState` would invent claim-channels we refused to mint. |
| **Coffee / board / bike dests** | Founder stand-ins for *a* leave. This cut’s `new` dest is dest-by-name (router / Type chips) or a classify `new` that names a living seat. “Put this in the notes” without a seat is `talk` (or Travis-thread update if it is walk-back-shaped). Do not plant those products. |
| **Event bus / Temporal / Inngest** | LangGraph thread + Cursor follow-up **are** the bus. |
| **Pipecat / second WebSocket** | Realtime + `response.cancel` already hung (`travis-live-client.ts`). |
| **Letta / `travis.thread` / MemorySaver** | 032 / 034. |
| **Hear / Next / Skip** | 007 / 027. Buttons stay off. |
| **Unseat / Cursor rebind / 022 `travis.port`** | 023 / 022. |
| **Live dest grain remint** | Named dests on transcript stay. Classify does not rewrite `sendOrEnqueueMany`. |

---

## 3. Requirements (extraction)

From PM-019 founder lock + file plan + BUILD-PROTOCOL “Compose, don’t invent.” Not a second invention.

1. Confirm in-flight is open `dest_job` + LangGraph checkpoint. Mint only if that pair cannot hold “what he just started.” It can. Refuse the mint.
2. Name the change primitive: dest = Cursor follow-up on the existing open row (`parent_id` unused). Travis = later `invoke` on the same `thread_id`.
3. Stream-intent is lib. Stream-dispatch is hang. No event-bus table.
4. Glass: Technical Architect. Protocol path unchanged.
5. Do not remint 031 / 032 / 033 / 034 / `dest_job`.

Plate staples (not scenery): **Stream** · **Log** · **Type**. Dest line = **ask + print**. Seat glass = **Technical Architect**.

Do not build from scenery: ST2 labeled Term, bezel, Hear it / Skip buttons, coffee/board/bike apps.

---

## 4. Inventory — quoted stood-up

### In-flight dests (classify reads)

```30:30:src/server/dest-job.ts
      parent_id uuid REFERENCES travis.dest_job(id),
```

```66:97:src/server/dest-job.ts
export async function insertDestJob(params: {
  // ...
}): Promise<DestJob> {
  // ...
  const [row] = await db
    .insert(destJob)
    .values({
      sessionId: params.sessionId,
      bindingId: params.binding.id,
      // ...
      payload: { text: params.text.trim(), done: "" },
      idempotencyKey: key,
      status: params.status ?? "created",
    })
```

`parentId` is on the drizzle row (`schema.ts` L210). Insert never writes it.

```131:145:src/server/dest-job.ts
const OPEN_DEST = ["created", "dispatched", "in_progress"] as const;

export async function listOpenDestJobs(sessionId: string): Promise<
  Array<{ job: DestJob; binding: AgentBinding }>
>
```

Payload staple for match = `payload.text` (the dest ask). Label staple = `binding.label` / `seatKey`.

### Room thread (034 — hung, do not remint)

```143:159:src/server/travis-deep-agent.ts
  const checkpointer = await travisCheckpointer();
  const agent = createDeepAgent({
    // ...
    checkpointer,
    middleware: [destKitMiddleware(params.sessionId)],
    subagents: [],
  });
  const result = await agent.invoke(
    { messages: [{ role: "user", content: input }], files: kitFiles(print, roster) },
    { configurable: { thread_id: params.sessionId } },
  );
```

```35:38:src/server/travis-checkpointer.ts
  const saver = new PostgresSaver(pool, undefined, {
    schema: CHECKPOINTER_SCHEMA,
  });
```

Schema `langgraph`, not `travis`. Official `PostgresSaver.setup()`.

### Dest follow-up (034 — hung)

```8:15:src/lib/dest-follow.ts
export function destPathForBind(openJobForBind: boolean): DestPath {
  return openJobForBind ? "follow-up" : "new-leave";
}
```

`travis-tools.ts` L508–567 already pins follow-up on an open living bind and sets `destEnqueueIfBusy("follow-up")`.

Cursor follow-up contract (same as 034): `Agent.resume` + `send` = Cloud `POST /v1/agents/{id}/runs`. Busy = `409 agent_busy` / `isAgentBusyError`.

```300:312:src/server/cursor-port.ts
export async function cancelCursorRun(
  agentId: string,
  runId: string,
): Promise<void> {
  // Agent.cancelRun(runId, { runtime: "cloud", agentId, apiKey })
}
```

### Live still full-pipes (this comes **out**)

```6:11:src/lib/live-harness.ts
export function liveShouldPipeTravis(params: {
  prompt: string;
  cursorDestCount: number;
}): boolean {
  return Boolean(params.prompt.trim()) && params.cursorDestCount === 0;
}
```

```170:188:src/app/api/session/[id]/live/transcript/route.ts
  if (liveShouldPipeTravis({ prompt, cursorDestCount: cursorDests.length })) {
    let spoken = "";
    await pipeTravisText({
```

### Conductor is done-phrase only (keep)

`conductor.ts` matches locked “I’m done” tails and strips them. It does not classify intent. Do not add pivots here.

### Dest-gate is refuse-his-work (keep)

`dest-gate.ts` `HIS_WORK` / `classifyDestPrompt` / `destClassifyText(ask)`. No *actually* / *wait*. Classify the last ask only (033).

### Ear cancel already hung

`travis-live-client.ts` sends `response.cancel` on user flush. Do not replace with Pipecat.

### Glass still says Technical PM

```30:40:src/lib/dest-glass.ts
export function destGlassName(...) {
  const named = label?.trim();
  if (named && named !== "PM") return named;
  // ...
  if (seatKey === "pm") return "Technical PM";
}
```

```13:16:src/lib/protocol-path.ts
export const SIT_ROLE_LABEL: Record<SitProtocolRole, string> = {
  pm: "Technical PM",
```

```19:24:src/lib/router.ts
const SEAT_NAME =
  "Technical Product Manager|Technical PM|Systems Analyst|Engineer|Eng|P\\.M\\.?|PM|SA|Travis";
export function seatKeyToLabel(key: SeatKey): string {
  if (key === "pm") return "Technical PM";
```

Docs / protocol identity may already say Technical Architect on this PR. `src/` glass does not. Recut strings only. Do not mint a protocol file.

### Three doors (keep; recut the job)

| Door | Stays | Recut |
|------|--------|--------|
| `live/transcript` | Ear flush. Dest-by-name may leave. | Classify + Do. **No** `pipeTravisText`. |
| `finalize` | Conductor strip. | Synthesize only. Backup Do once if classify missed. |
| `send` | Type tap = completed line. | Classify → Do → synthesize. |

`live/token` stays credential only.

---

## 5. Primitive per kind

| Kind | Primitive | Target | Write |
|------|-----------|--------|-------|
| **Walk-back** (`new` + `travis-thread`) | `invokeDeepAgent({ mode: "update" })` same `thread_id`. Tools may `search_room`. | Session thread | Checkpoint + tape (door). No `dest_job`. |
| **New dest** | 031 + 033 + 034 `new-leave` | Named living bind | `insertDestJob` then leave. |
| **Change dest** | 034 follow-up (`resume` + `send`) | Open `dest_job.id` / that bind | **No insert.** Same row stays open. `parent_id` untouched. |
| **Change Travis** | Later `invoke` `mode: "update"` | `travis-thread` | Checkpoint only. |
| **Cancel dest** | `cancelCursorRun` | That bind’s live run | Existing finish/harvest. |
| **Talk** | Door `insertUserTurn` | — | Tape only. |
| **Wrap** | `invoke` `mode: "synthesize"` then `pipeTravisText` | — | Assistant turn as today. |

Cost thought: two new files (`stream-intent`, `stream-dispatch`) because source / speed / failure differ (PM three questions). Everything else is hang or recut.

---

## 6. Stores / fields / contracts

### Add (lib + hang — not a Travis mint)

| What | Contract |
|------|----------|
| `src/lib/stream-intent.ts` | Pure classify. See §7 emit shape. Tests: `stream-intent.test.ts` (PM walk). |
| `src/server/stream-dispatch.ts` | Thin switch. Calls dest assemble / `dispatchToSeat` / `dest-follow` / `cancelCursorRun` / `invokeDeepAgent`. No speak. |
| `invokeDeepAgent` mode | `"update" \| "synthesize"`. Default `"synthesize"` for today’s Type wrap. Same saver + `thread_id`. |

### Change (runtime / glass only)

| What | Change |
|------|--------|
| `liveShouldPipeTravis` | Always `false`. Keep the helper so the door stays explicit. Dest-by-name path unchanged. |
| `live/transcript` | After tape write + existing named dest leave: `streamIntent` → `stream-dispatch` for kinds the named-dest path did not already file. Never `pipeTravisText`. |
| `send` | After tape write: classify → dispatch → **then** existing `pipeTravisText` (synthesize). De-dupe: if Type chips / `destBindingsForSend` already left a seat, do not `new`-dispatch that seat. |
| `finalize` | Strip done-phrase. Dispatch only if classify still has an un-started `new`/`change` (backup once). Then `pipeTravisText`. |
| `travis-openai` / `generateTravisText` | Pass `mode`. Finalize / Type-after-Do use `synthesize`. Dispatch walk-back / Travis change use `update` (do not call `pipeTravisText` on that result). |
| `TRAVIS_SYSTEM` | He may dest while the stretch is still open. Walk-back from thread + print + `search_room`. Do not recap unasked. Do not tell him to wait for “I’m done” to dest. |
| `destGlassName` | If label is a real person name (not empty / `PM` / `Technical PM`), it wins. Else `seatKey === "pm"` → **Technical Architect**. |
| `SIT_ROLE_LABEL.pm` | **Technical Architect**. Path still `/protocols/pm.md`. |
| `seatKeyToLabel("pm")` | **Technical Architect**. |
| `router` `SEAT_NAME` / `SEAT_ALIASES` | Add `Technical Architect`. Keep `Technical PM` / `Technical Product Manager`. |
| Tests next to those files | Glass string + alias. |

### Refuse

| What | Why |
|------|-----|
| New `travis.*` table / `parent_id` product / vector store / event bus | Pair already holds in-flight. |
| Remint 031–034 / `dest_job` columns | Stands. |
| `Command({ update })` / `updateState` / `interrupt_on` | No claim-channels. Later invoke is the hang. |
| Pipecat / Responses / `motion.ts` as this board | Wrong slice. |
| `/protocols/technical-architect.md` | Path stays `pm.md`. |
| Hear / Skip buttons | 027. |

No signed SQL this packet.

---

## 7. Runtime behavior

### `streamIntent` (lib — no I/O except the lists the caller passes)

```ts
type StreamTarget =
  | { kind: "dest"; destJobId: string; bindingId: string }
  | { kind: "travis-thread" }
  | { kind: "seat"; seatKey: "pm" | "sa" | "engineer" };

type StreamIntent = {
  kind: "new" | "change" | "cancel" | "talk";
  target?: StreamTarget;
};
```

Caller passes `{ phrase, openJobs: listOpenDestJobs(...) }`. May return **one or more** intents (Type line with walk-back + a dest).

**Zero-token change-mode** (whole-word, case-insensitive): `actually`, `wait`, `instead`, `scrap that`, `no — the`, `no- the`, `no the` only when it is `no — the` / `no-the` style (the locked “no — the …” pivot). Do not treat a lone “no” as change (conductor / dead-man already owns bare no).

**Zero-token cancel-mode:** `scrap that`, `cancel that`, `never mind that`. If the phrase is only that (plus a target match), emit `cancel`. `scrap that` in a longer change sentence stays change-mode unless it is the whole ask.

**Zero-token walk-back** (emit `new` + `travis-thread` when no dest-by-name ate the line): `what did we do`, `where are we`, `yesterday`, `last time we`, `what were we`. Locked like conductor phrases. Do not grow this into dest detection.

**Seat names:** `parseCallByName` / existing aliases. A seat name without change-mode → `new` + `{ kind: "seat", seatKey }` (dispatch resolves living bind; 034 then chooses follow-up vs new-leave). A seat name **with** change-mode that matches an open job for that living role → `change` of that `destJobId`. “By the way, … Engineer” is **not** a change pivot → `new` second dest.

**Match open dests** (no vector):

1. Tokenize phrase; drop stopwords and the pivot words themselves.
2. Score each open job by token overlap with `payload.text` + `binding.label` + `seatKey`.
3. Change-mode + **exactly one** open dest → that dest even if score is 0 (“actually, the blue one”).
4. Change-mode + several opens → unique highest score ≥ 1 wins; else `talk` (do not guess).
5. Cancel-mode uses the same match. One open dest + cancel-mode → that dest.
6. No change/cancel + no seat + walk-back pivot → `new` + `travis-thread`.
7. Else → `talk`.

Do not call dest assemble, Cursor, or the kit from this file.

### `stream-dispatch` (server hang)

| Intent | Call |
|--------|------|
| `new` + seat | Existing dest grain (`destWithContextFor` + gate on ask + living resolve + `insertDestJob` if `destPathForBind` is `new-leave` + `dispatchToSeat`). If 034 says follow-up, do **not** insert. |
| `new` + travis-thread | `invokeDeepAgent({ mode: "update" })`. Ignore returned text. |
| `change` + dest | Follow-up on that job’s bind (`dispatchToSeat` / `streamCursorReply`). `destEnqueueIfBusy("follow-up")`. No `insertDestJob`. No `parent_id`. |
| `change` + travis-thread | `invokeDeepAgent({ mode: "update" })`. Ignore returned text. |
| `cancel` + dest | `cancelCursorRun` for that bind’s live run (same helper `seat-pipe` already uses). If no live run, no-op. Do not create. |
| `talk` | Return. |

De-dupe against a dest the HTTP door already filed on this request (named transcript dest / Type chips): skip `new` for that `seatKey` / bind.

Do not speak. Do not call `motion.ts` as the board.

### Who writes

- Tape: existing `insertUserTurn` on the door (unchanged).
- `dest_job`: existing insert on **new** leave only.
- Checkpointer: official saver on `update` and `synthesize` invokes.
- Cursor run: existing `upsertLiveRun` / `streamCursorReply` / cancel.

### Who reads

- Classify: `listOpenDestJobs` + phrase. Optional last user/assistant texts from tape if match needs Travis-thread claims — `search_room` / print already exist; do not add a getState dependency this cut unless invoke-update needs it (it does not; match dests from `dest_job`, Travis-thread target from walk-back pivots).
- Wrap: kit thread + `/print.md` + `work_in_flight` / open dests (already on the kit).

### Triggers

- Faceless: Cursor run finished → 034 follow-up can proceed. Do not invent a Travis bus.
- Conductor “I’m done” → finalize synthesize only.

---

## 8. Ports

| Port | Real vs stand-in |
|------|------------------|
| Deep Agents + PostgresSaver + `thread_id` | **Real** (034). Hang `mode`. |
| `listOpenDestJobs` / `dest_job.payload.text` | **Real** in-flight dest list. |
| `dest-follow` / `Agent.resume` + `send` | **Real** change-on-dest. |
| `cancelCursorRun` | **Real** cancel. |
| `destWithContextFor` / dest-gate-on-ask | **Real** (031 / 033). |
| `parseCallByName` / Type chips | **Real** seat names. |
| OpenAI Realtime + `response.cancel` | **Real** ear. Do not add Pipecat. |
| `conductor.ts` | **Real** done-phrase. |
| `liveShouldPipeTravis` | **Recut** to never pipe. |
| LangGraph `updateState` / `Command` | **Stand-in refused.** |
| Letta / Temporal / vector store | **Refused.** |
| Live / Voice wrap | **Planted door; mouth waits for finalize.** |

API keys stay server-side (`CURSOR_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`).

---

## 9. Verify

Smoke on `https://travis-psi.vercel.app` — Log · Type — [`PM-PACKET-019-STREAM-ARCH-TEST.md`](./PM-PACKET-019-STREAM-ARCH-TEST.md). Pass from `src/` only is a miss.

| Step | Proves |
|------|--------|
| **A.1** “What did we do yesterday?” | Walk-back from this room’s thread / tape. No dest. No create. Not `Travis isn’t wired`. Not ESM `import` miss. |
| **B.1** Notes + “Send that to Technical Architect…” | Dest leaves. Body ask + print. Glass **Technical Architect**. No create. |
| **C.1** “By the way, send that to Engineer as well.” | Second dest. Not a change of B. No create. |
| **D.1** “Actually, use the living Technical Architect bind…” while dests live | Follow-up on that bind. No cousin dest. No create. Busy = named `agent_busy`. |
| **E.1** Voice “I’m done” (if you can) | Leaves already started. Wrap speaks what left / changed. No Hear it / Skip **buttons**. |
| After | Glass Technical Architect. Catalog PM hidden. Protocol still `/protocols/pm.md`. |

Human leftover on the test sheet (Talk on a phone; two seats seated; a dest still running when D fires; paying Cursor) is not Engineer’s miss.

Lib proof before psi: `stream-intent.test.ts` covers the walk (yesterday → travis-thread; notes+Architect → new dest; by-the-way Engineer → second new; actually-blue after one open dest → change of that id; I’m done is **not** this file).

---

## 10. Out of scope

- Remint 011–018 / 023–034 / 027 sit / 080 load hang.
- Voice Hear-it buttons. Pipecat. Responses cousin.
- Letta, Zep, Temporal, Inngest, a Travis orchestrator, `motion.ts` as workers.
- Minting `travis.thread` or designing checkpoint SQL.
- Using `parent_id`. Embedding search.
- Unclipping Here. Widening dest print.
- Coffee / board / bike products. A notes app.
- Mint `/protocols/technical-architect.md`. A fourth seat.
- Computer use / browser. Cross-room search.
- Cousin PR.

---

## 11. Engineer paste (no leftover analysis)

1. Add `src/lib/stream-intent.ts` + `src/lib/stream-intent.test.ts` exactly as §7. Pivots are not dest-gate. No I/O. No embeddings.
2. Add `src/server/stream-dispatch.ts` — thin switch in §7. Hang 031 / 033 / 034 / `cancelCursorRun` / `invokeDeepAgent`. No speak. No `motion.ts`. No bus table.
3. `invokeDeepAgent({ mode: "update" | "synthesize" })`. Same checkpointer + `thread_id = sessionId`. `update` may run tools; caller does not pipe the text. `synthesize` is today’s wrap invoke. Do not hang `Command` / `updateState`.
4. `liveShouldPipeTravis` → always `false`. Transcript: keep named dest leave; classify + dispatch the rest; never `pipeTravisText`.
5. Type `send`: classify → dispatch → then existing `pipeTravisText`. De-dupe seats the door already filed.
6. `finalize`: conductor strip stays; backup Do once if a leave never started; then synthesize. Do not start the whole think as if nothing left.
7. Do not `insertDestJob` on `change`. Do not write `parent_id`. 034 `dest-follow` stays the dest path.
8. Glass: `destGlassName` / `SIT_ROLE_LABEL.pm` / `seatKeyToLabel("pm")` → **Technical Architect**. Router alias “Technical Architect” → `pm`. Keep “Technical PM.” Person label wins when it is not `PM` / `Technical PM`. Path `/protocols/pm.md`. Tests next to those files.
9. Do not remint dest assemble, dest-gate-on-ask, Cloud create, checkpointer, `dest_job`. Do not install Pipecat. Do not restore Responses. Do not grow `motion.ts`.
10. Computer-use the 019 test sheet on psi. Log · Type first.
