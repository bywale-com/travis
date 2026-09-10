# SYSTEMS-CHANGE-PACKET-034 — What exists for the life loop

**Number:** `034` — next systems packet is **035**. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#161](https://github.com/bywale-com/travis/pull/161)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-09  
**PM packet:** [`PM-PACKET-018-WHAT-EXISTS.md`](./PM-PACKET-018-WHAT-EXISTS.md)  
**Test:** [`PM-PACKET-018-WHAT-EXISTS-TEST.md`](./PM-PACKET-018-WHAT-EXISTS-TEST.md)  
**FACE (look, do not mint from PNG):** [`PLATES-STREAM.md`](./PLATES-STREAM.md) ST1–ST3. No new plates. Staples — **Stream** (compartment = card) · **Log** · **Type**. Dest body on the Log is still **ask + print** (015 / 031).  
**Prior (do not remint):** **023** `dest_job` · **024** `travis.stream` / `stream_event` · **025** hang · **026** `heard_at` · **027** stay / `reference_turn_id` · **028** usable chat · **029** room wire · **030** Deep Agents hang · **031** dest assemble / `/print.md` / `/roster.md` · **032** kit-only Type send · **033** dest-gate-on-ask / Cloud create / living sit · **011–013** Here clip / motion / OS · **014** log-beats · **015** disposable seats · **007** membership · **080** `deepagents/node` + `serverExternalPackages` + `travisGenerateMiss`.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**. Meaning glass: **23:25 UTC 2026-09-08** (walk-back · route-plus · interrupt · modify).  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** `https://travis-psi.vercel.app` — a room with tape (After new law, or a room you first fill). **Log · Type.** Voice parked.

014–017 stay hung. This cut is **find, then hang**. Not a Travis process engine. The four situations already have ports in the world or on this wire. Engineer hangs those. Inventing interrupt / resume / “modify all of those” as a Travis orchestrator is a miss.

---

## 1. Intent

Walk-back, route-plus, interrupt, and modify-in-motion are already embodied by three existing machines: the room tape (`voice_turn` + `search_room` + dest print), Deep Agents sitting on LangGraph (durable `thread_id` + official checkpointer — **not hung**), and Cursor Cloud follow-up (`Agent.resume` + `send` = `POST /v1/agents/{id}/runs`). Type send still mints a fresh `createDeepAgent` and `invoke`s with no checkpointer and no `thread_id`, so Travis’s think is a new blank every line. Dest already resumes a living `bc-`; when that person is mid-run, role dest fails as spin and person dest enqueues — that is not follow-up. Hang the kit thread on `voice_session.id`. Hang follow-up on an open `dest_job`’s bind. Do not remint dest mail, kit-only send, dest-gate-on-ask, Cloud create, or `dest_job`. No new Travis table.

---

## 2. Story

### Must

- SA’s first line is what exists. Engineer looks for those ports. Setup and integration only.
- **Same room = same Travis thread.** `createDeepAgent({ checkpointer })` + `invoke(..., { configurable: { thread_id: sessionId } })`. `sessionId` is `voice_session.id`.
- Checkpointer is the official LangGraph Postgres saver against existing `DATABASE_URL` (Neon). Not `MemorySaver` / `InMemorySaver` on the planted Type send (isolate recycle and a day later wipe the think).
- Walk-back (“where are we?”) answers from that thread + `/print.md` + `search_room`. Not a blank card. Not Letta.
- Route-plus and interrupt stay dest leave: `destWithContextFor` = last `kind=user` + unclipped print. Body is ask + print. Living seated resolve (033). No create. No new mail format.
- Modify on dests already left = Cursor follow-up on **that same** `bc-` (`streamCursorReply` / `Agent.resume` + `send`). Not create. Not a cold wrap. Not a different idle person.
- If Cursor returns `409 agent_busy` / `isAgentBusyError`: that is Cursor’s rule — wait for the run to terminate, cancel it, or queue. Name it. Do not report a folder / `sdk-agent-store` error.
- 014–017 stay. Dest-gate on `destFork.ask`. Type send is `invokeDeepAgent` only. Cloud create. Ticket after `dest_job`. Living seated PM.
- Here stays clipped. Stream kinds stay `message` | `process` | `thought`. Dest leave `tool=dest_with_context` `body` = the print.
- Log · Type first. No Hear it / Skip buttons. No Responses cousin.

### Must-not

- Invent a Travis interrupt / resume / modify-all orchestrator. Temporal / Inngest / a workflow runner. A cousin LangGraph graph beside Deep Agents.
- Remint `dest_job` / `voice_turn` / `agent_binding` / `room_membership` / `travis.stream` / `stream_event`. Remint 031 assemble. Remint 032. Remint 033. Restore Responses.
- Mint `travis.thread`, a memory table, a Letta/Zep store, or LangGraph checkpoint **rows we designed**. 032’s refuse of a Travis checkpoint table **stands**. Kit `setup()` tables are the kit’s contract, not a Travis mint.
- Hang `MemorySaver` as the planted checkpointer (walk-back after a day dies).
- Unclip Here. Remint `LINE_CAP` / `WINDOW_TURNS` / `WINDOW_CHAR_CAP`.
- Use `dest_job.parent_id` as a DAG / “all of those” product. Column stays unused this cut.
- Role-dest **spin** or a different idle when this session already has an open `dest_job` for that living bind (modify path).
- Enqueue as the modify path when the seat is idle (follow-up `send` exists).
- Create a person for route-plus / interrupt / modify.
- `FilesystemBackend`. Deep Agents `task` / `execute` / `subagents`. `interrupt_on` this cut.
- Product cap. Cousin PR. Hear / Skip buttons.

### Chain

Type send → `pipeTravisText` inserts `kind=user` → `invokeDeepAgent` with **shared official checkpointer** + `thread_id = sessionId` → kit middleware (`/print.md` + `/roster.md`) → Travis tools.

New dest leave (no open `dest_job` for that bind in this session) → `destWithContextFor` (ask + print) → `classifyDestPrompt(ask)` → living seated resolve → `insertDestJob` → ticket → `dispatchToSeat` (`Agent.resume` + `send`) — 031 / 033 unchanged.

Follow-up / modify (open `dest_job` for that bind) → same assemble grain → **same bind** → `streamCursorReply` again. No spin. No create. Busy → Cursor wait / cancel / queue, named.

Walk-back → same thread + print file + `search_room`. No new think.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Letta / Zep / Deep Agents `AGENTS.md` / `StoreBackend`** | Tape is the walk-back object (`voice_turn` + `search_room` + dest print). Memory product is adjacent only if the tape were not the object. It is. |
| **Temporal / Inngest / “workflow”** | LangGraph checkpoint holds the room thread. Do not open here. |
| **Travis checkpoint table** | 032. Kit PostgresSaver `setup()` in schema `langgraph` is the hang. Not `travis.*`. |
| **`dest_job.parent_id` as “all of those”** | Column exists. `listOpenDestJobs` already names living leaves. Do not remint a DAG. |
| **Deep Agents `interrupt_on` / `Command(resume)` / async subagents / `task`** | In-motion shape for Travis’s own think is a later invoke on the same `thread_id`. Dest stays Cursor. `subagents: []` stays. Profiles still exclude `task` / `execute`. |
| **Live / Realtime hang** | 030. Dest grain still runs if Live dests. |
| **Hear / Next / Skip** | 007 / 027. Buttons stay off. |
| **Unseat / Cursor rebind table** | 023. |
| **022 `travis.port`** | Stands. |
| **v0 `POST /v0/agents/{id}/followup`** | v1 `POST /v1/agents/{id}/runs` is the same product. Dest already uses SDK `send`. Do not hang v0. |

---

## 3. Requirements (extraction)

From PM-018 founder lock + PHASE-ONE-LOG **23:25** + BUILD-PROTOCOL “Compose, don’t invent.” Not a second invention.

1. Find first. Inventory the cases against planted `src/`. Quote.
2. Engineer hangs what exists. Does not create the process.
3. 014–017 stay.
4. Same room = same Travis thread if the primitive is LangGraph / Deep Agents.
5. A living dest is Cursor follow-up, not create, not a cold instruction.
6. Do not remint 031 / 032 / 033 / `dest_job`.
7. Log · Type first. No Hear it / Skip buttons.
8. Paid is allowed. Cost is a thought.

Plate staples (not scenery): **Stream** · **Log** · **Type**. Dest line = **ask + print**. Technical PM = seated living person, not catalog `pm`.

Do not build from scenery: ST2 labeled Term, bezel, Hear it / Skip buttons, a new phone face.

---

## 4. Inventory — kit vs ours vs Cursor vs memory

### Deep Agents (already hung) — Travis think

```129:154:src/server/travis-deep-agent.ts
export async function invokeDeepAgent(params: {
  sessionId: string;
  prompt: string;
  room: string;
}): Promise<string> {
  // ...
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

Kit docs ([`createDeepAgent`](https://reference.langchain.com/javascript/deepagents/node/createDeepAgent) · [backends](https://docs.langchain.com/oss/javascript/deepagents/backends) · [HITL](https://docs.langchain.com/oss/javascript/deepagents/human-in-the-loop)): `checkpointer` + `invoke(..., { configurable: { thread_id } })`. `StateBackend` files persist across turns **via the checkpointer**. We pass neither. Every Type send is a new compiled agent and a new empty thread.

`package.json` already has `deepagents` `^1.13.3` and `@langchain/langgraph` `^1.4.14`. Missing hang: official `@langchain/langgraph-checkpoint-postgres` `PostgresSaver.fromConnString(process.env.DATABASE_URL, { schema: "langgraph" })` then `await checkpointer.setup()` once. Own `pg.Pool` — do **not** share the drizzle client (`src/server/db/pool.ts` `max: 1`). Keep the saver pool tiny (max 1). 029 LISTEN client stays separate. Do not remint 029.

Cost: one more npm + kit tables on the Neon we already pay. Not a product cap.

### LangGraph (under Deep Agents) — in-motion shape

Official persistence: same `thread_id` is resume. `updateState` / `Command({ resume })` / `interrupt_on` are the HITL cousins. **This cut does not hang those.** A later Type line on the same `sessionId` **is** the modification of Travis’s think. Dest to a Cursor person is still Cursor’s wire. Graph does not replace `dest_job`.

### Cursor Cloud Agents — seat follow-up

```445:473:src/server/cursor-port.ts
export async function* streamCursorReply(params: {
  cursorAgentId: string;
  prompt: string;
}): AsyncGenerator<CursorStreamEvent> {
  // ...
  const { Agent } = await import("@cursor/sdk");
  const agent = await Agent.resume(agentId, { apiKey: key });
  try {
    let run: Awaited<ReturnType<typeof agent.send>> | undefined;
    try {
      run = await agent.send(params.prompt);
```

Official contract ([Create A Run](https://cursor.com/docs/cloud-agent/api/endpoints)): `POST /v1/agents/{id}/runs` — “Send a follow-up prompt to an existing active agent. The new run uses the agent's current conversation and workspace state.” One run per agent. While `CREATING` or `RUNNING`: **`409 agent_busy`**. Wait for terminate, or cancel. We already map that (`src/lib/cursor-busy.ts` `isAgentBusyError`). Create stays Cloud `POST /v1/agents` (033). Travis himself has no Cursor thread.

Busy dest today:

```54:65:src/server/dispatch.ts
  if (await seatHasActiveRun(binding)) {
    if (params.enqueueIfBusy === false) {
      return { status: "busy", seatLabel };
    }
    const queue = await enqueueOnSeat({
```

Role dest sets `enqueueIfBusy = false` (`travis-tools.ts` ~519). On busy, the leave **fails** as spin (`nobodyReceipt` / `busy — no idle seated dest`). Person dest enqueues `queued_utterance`. That is our queue, not Cursor follow-up.

`resolveRoleDest` already returns the living bind when idle-in-room is null and living exists (`roleDestPick` → `"living"`). `findIdleSeated` returns null when the preferred living bind has a live run. The miss is the **busy handle**, not the pick.

### Planted Travis — tape, print, jobs

| What | Layer | Quote |
|------|--------|--------|
| Room tape | **Materialized** | `travis.voice_turn` |
| Dest print | **Materialized** | `destWithContextFor` / `unclippedPrint` — `REQUEST_SCAN` worthy turns, no `LINE_CAP` |
| Kit files | **Materialized** | `/print.md` + `/roster.md` every invoke |
| `search_room` | **Materialized** | `searchRoomText` → request log, this room |
| `work_in_flight` | **Materialized** | live runs + queue + `listOpenDestJobs` |
| `dest_job` | **Materialized** | `parent_id` column exists; `insertDestJob` never sets it |
| Here card | **Materialized** | `LINE_CAP` 300 · `WINDOW_TURNS` 14 · `WINDOW_CHAR_CAP` 2600 |
| `TRAVIS_SYSTEM` | **Materialized** | “Do not recap the last turns.” |
| Queue | **Materialized** | `queued_utterance` — not follow-up |
| Travis thread | **Map-only until this hang** | LangGraph `thread_id` = session |

```29:40:src/server/dest-with-context.ts
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

```48:54:src/lib/dest-with-context.ts
export function assembleDestWithContext(params: {
  ask: string;
  print: string;
}): string {
  const ask = params.ask.trim();
  if (!params.print.trim()) return ask;
  return `${ask}\n\n${params.print}`;
}
```

`insertDestJob` (`src/server/dest-job.ts` L66–101) writes `session_id`, `binding_id`, `payload.text`, `idempotency_key`. No `parentId`.

### Letta (MemGPT) — adjacent memory, not this cut

Identical “where are we after days” *product* if the tape were not the object. The tape is the object. Paid/hosted. Not dest. Not Cursor follow-up. **Refuse.**

---

## 5. Primitive per situation

| Situation | Primitive | Match | Gap (only) |
|-----------|-----------|--------|------------|
| **Walk-back** | LangGraph / Deep Agents checkpointer + `thread_id = voice_session.id`. Depth: dest print + `search_room` on `voice_turn`. | Identical for “same room, resume after a break.” Tape already is the object. | Phone face, Here clip, “Do not recap” unasked. Kit cannot sit people or dest Cursor. |
| **Route-plus** | Dest assemble (031) + dest leave + living resolve (033). “Add this” is the last `kind=user`. | Identical. Not a new letter. | Kit thread so he remembers the idea without a clipped Here. |
| **Interrupt** | Second dest leave to another living seat. Same `destWithContextFor` (that interrupt line + same print). | Adjacent / identical. Two Cursor objects, not one. | Graph must not replace the second `dest_job`. |
| **Modify in motion** | Travis think: later `invoke` on the **same** `thread_id`. Each living dest: Cursor follow-up (`resume` + `send`) on the bind that already has an open `dest_job`. `listOpenDestJobs` names “all of those.” | Identical per seat. Cursor `409` while a run is live. | Two seats ≠ one Cursor object. No Travis “modify-all” runner — the durable thread dests each; runtime pins follow-up to the open bind. |

Cost thought: hang two official packages we already almost have (Deep Agents + LangGraph + Neon). Letta / Temporal are the expensive cousins we do not open.

---

## 6. Stores / fields / contracts

### Add (hang — not a Travis mint)

| What | Contract |
|------|----------|
| `@langchain/langgraph-checkpoint-postgres` | Official `PostgresSaver`. `fromConnString(DATABASE_URL, { schema: "langgraph" })`. `setup()` once (kit tables in schema `langgraph`, not `travis`). |
| `createDeepAgent({ checkpointer })` | Shared saver singleton for the isolate. |
| `invoke` config | `{ configurable: { thread_id: params.sessionId } }` |

### Change (runtime only)

| What | Change |
|------|--------|
| `invokeDeepAgent` | Pass checkpointer + `thread_id`. Keep `StateBackend`, dest kit middleware, tools, `TRAVIS_SYSTEM`, `subagents: []`. Creating the compiled agent per send is legal **if** the saver and `thread_id` are the same. |
| `TRAVIS_SYSTEM` | One exception: when they ask where we are / what we discussed, answer from the thread + `/print.md` + `search_room`. Do not recap **unasked**. Do not unclip Here. |
| Dest when this session has an **open** `dest_job` for that living bind | Follow-up on **that bind**. `streamCursorReply` / dispatch with that `cursor_agent_id`. Do not `spinSeatedRole`. Do not pick a different idle. Do not `create_agent`. Dest body still `assembled` (ask + print). Gate still on `ask`. |
| Busy on that follow-up | `isAgentBusyError` / `409 agent_busy`: one existing race retry (`RACE_RETRY_DELAY_MS`); if still busy, **enqueue the follow-up text on that same bind** (Cursor’s queue option) or wait-then-send if the request can return (039 already hands off at `run_started`). Receipt names Cursor busy — not spin, not folder. |
| Idle on that follow-up | `send`. Do not enqueue. |

### Refuse

| What | Why |
|------|-----|
| `travis.thread` / memory table / Letta / Zep | Tape + kit checkpointer exist. |
| Remint `dest_job` / use `parent_id` as a product DAG | `listOpenDestJobs` is “all of those.” |
| Remint 031 / 032 / 033 | Stands. |
| `MemorySaver` on psi Type send | Walk-back after a day / new isolate is empty. |
| Travis orchestrator / Temporal | Founder: what exists. |
| Responses cousin | 032. |
| Hear / Skip buttons | 027. |

---

## 7. Runtime behavior

**Who writes**

- Checkpointer: official saver, after each Type `invoke`.
- Tape: existing `insertUserTurn` / `insertAgentPostTurn` (unchanged).
- Dest job: existing `insertDestJob` on a **new** leave only. Follow-up does not require a new row. If dispatch already inserts one, idempotency stands — do not invent a second key scheme.
- Cursor run: existing `upsertLiveRun` / `streamCursorReply`.

**Who reads**

- Walk-back: kit thread + `/print.md` (middleware still refreshes print/roster) + `search_room`.
- Modify: `listOpenDestJobs(sessionId)` (already on `work_in_flight`). Model dests each living seat; runtime, if an open job exists for that bind, pins follow-up.

**Triggers**

- Type send → same as 032, plus thread_id.
- Faceless: Cursor run finished → follow-up `send` can proceed (existing busy clear / harvest). Do not invent a Travis signal bus.

**New leave vs follow-up (no marker list)**

```
open job in this session for the resolved living bind
  → follow-up (same bc-)
else
  → 015 / 033 new leave (living resolve, ticket after job, role dest still never queues a *new* leave)
```

Do not add a phrase classifier. The open job is the staple.

---

## 8. Ports

| Port | Real vs stand-in |
|------|------------------|
| Deep Agents `createDeepAgent` (`deepagents/node`) | **Real** (032). Hang checkpointer. |
| LangGraph `thread_id` + PostgresSaver | **Hang.** Official. Schema `langgraph`. |
| `StateBackend` `/print.md` `/roster.md` | **Real** (031). Persists on the thread once checkpointer is hung. |
| Cursor `Agent.resume` + `send` | **Real** dest follow-up. Same as `POST /v1/agents/{id}/runs`. |
| Cursor `POST /v1/agents` | **Real** create (033). Rare. Not this path. |
| `destWithContextFor` | **Real** (031). |
| `search_room` / `work_in_flight` / `listOpenDestJobs` | **Real**. |
| Here clip | **Real** (011). Stays. |
| `queued_utterance` | **Real** queue. Follow-up-when-409 only. Not the idle modify path. |
| Letta / Temporal / `MemorySaver` (planted) | **Stand-in refused.** |
| Live / Voice | **Stand-in / parked.** Dest grain still in `runTravisTool`. |

API keys stay server-side (`CURSOR_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`).

---

## 9. Verify

Smoke on `https://travis-psi.vercel.app` — Log · Type — [`PM-PACKET-018-WHAT-EXISTS-TEST.md`](./PM-PACKET-018-WHAT-EXISTS-TEST.md). Pass from `src/` only is a miss.

| Step | Proves |
|------|--------|
| **A.1** Walk back. “Where are we? What was the last thing we discussed?” | Names the last real discussion. Not only “you said hey.” Not a blank card. Not `Travis error: Cannot use import statement outside a module`. |
| **B.1** Idea, then “Send that to Technical PM, and add this: …” | Dest leaves. Body is ask + print. No create. Not instruction-only. |
| **C.1** “By the way, send that to Engineer as well.” | Second dest, same kind of print. Not a new story. Not create. |
| **D.1** “Modification to all of those: …” while dests live or just left | Follow-up on the same Cursor people. Not create. Not a cold wrap. Busy = named Cursor rule, not a folder error. |
| After | No Hear it / Skip **buttons**. |

Human leftover on the test sheet (talk on a phone; two seats seated; a dest still running when D fires) is not Engineer’s miss.

---

## 10. Out of scope

- Remint 011–017 / 023–033 / 027 sit / 080 load hang.
- Voice / Hear-it buttons / Live kit hang.
- Letta, Zep, Temporal, Inngest, a Travis orchestrator.
- Minting `travis.thread` or designing checkpoint SQL.
- Using `parent_id` as a product.
- Unclipping Here. Widening dest print.
- Computer use / browser. Cross-room search.
- Cousin PR.

---

## 11. Engineer paste (no leftover analysis)

1. Install official `@langchain/langgraph-checkpoint-postgres` (and its `pg` peer if not already resolvable). Do not write a saver.
2. Singleton `PostgresSaver.fromConnString(process.env.DATABASE_URL, { schema: "langgraph" })`. Tiny own pool. `await setup()` once per isolate. Schema `langgraph`, not `travis`.
3. `invokeDeepAgent`: `createDeepAgent({ …existing, checkpointer })` then `agent.invoke({ messages, files }, { configurable: { thread_id: params.sessionId } })`. Keep 080 dynamic import / `deepagents/node`.
4. `TRAVIS_SYSTEM`: walk-back ask may answer from thread + print + `search_room`. Do not recap unasked. Here clip unchanged.
5. Dest: if `listOpenDestJobs(sessionId)` has an open row for the living bind you would dest, follow-up that bind (`dispatchToSeat` / `streamCursorReply`). No spin. No create. Idle → send. Busy → Cursor wait / race-retry / enqueue-on-that-bind; receipt names `agent_busy`. New leave (no open job) stays 015 / 031 / 033.
6. Do not remint dest assemble, dest-gate-on-ask, Cloud create, `dest_job`, or Type Responses.
7. Computer-use the 018 test sheet on psi. Log · Type.
