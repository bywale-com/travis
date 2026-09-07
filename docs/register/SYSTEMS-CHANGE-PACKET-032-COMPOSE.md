# SYSTEMS-CHANGE-PACKET-032 — Compose the send harness (kit, not a cousin)

**Number:** `032` — next systems packet is `033`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#157](https://github.com/bywale-com/travis/pull/157)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-07  
**PM packet:** [`PM-PACKET-016-COMPOSE.md`](./PM-PACKET-016-COMPOSE.md)  
**Test:** [`PM-PACKET-016-COMPOSE-TEST.md`](./PM-PACKET-016-COMPOSE-TEST.md)  
**FACE (look, do not mint from PNG):** [`PLATES-STREAM.md`](./PLATES-STREAM.md) ST1–ST3. No new plates. Staples — **Stream** (compartment = card) · **Log** · **Type**. Dest body on the Log is still **ask + print** (015 / 031).  
**Prior (do not remint):** **023** `dest_job` · **024** `travis.stream` / `stream_event` · **025** hang · **026** `heard_at` · **027** stay / `reference_turn_id` · **028** usable chat · **029** room wire · **030** Deep Agents hang · **031** dest assemble / `/print.md` / `/roster.md` · **011–013** Here clip / motion / OS · **014** log-beats · **015** disposable seats · **080** `deepagents/node` + `serverExternalPackages` + `travisGenerateMiss`.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** `https://travis-psi.vercel.app` — room Travis. **Log · Type.** Voice parked.

030 hung Deep Agents. 031 locked dest mail. 080 hung `deepagents/node` so the kit answers, then restored a six-step Responses loop as a silent cousin. This cut deletes that cousin. Type send’s process around the model is the kit already on the wire.

---

## 1. Intent

Type send already calls `createDeepAgent`. That is the process: every send runs the kit, in kit order, forking by the tools and middleware the kit already owns. Travis still writes the hang the kit cannot do — tape, Here clip, Travis tools, dest assemble to Cursor. The leftover novel engine is `generateTravisTextViaResponses`: a six-step `/v1/responses` cycle we authored, reached by a silent `catch` around `invokeDeepAgent`. That cousin is the miss. Delete it. If the kit throws, the mouth is `travisGenerateMiss` (080). Do not invent a second harness. Do not remint dest mail. No new table.

---

## 2. Story

### Must

- After this cut, a Log · Type send’s model loop is Deep Agents (`createDeepAgent` from `deepagents/node`). Not a Travis-designed process engine beside it.
- Dest leave still assembles last `kind=user` + dest print (031). Instruction-only dest when tape exists is still a miss.
- Here stays clipped (`LINE_CAP` 300 · `WINDOW_TURNS` 14 · `WINDOW_CHAR_CAP` 2600).
- Stream chrome is 008 (ST1–ST3). Kinds stay `message` | `process` | `thought`. Dest leave `tool=dest_with_context` `body` = the print. Receipt does not overwrite that body.
- If `invokeDeepAgent` throws, the Log shows `travisGenerateMiss`. Do not swallow that throw into a second engine.
- 080 setup stays: dynamic import, `deepagents/node`, `serverExternalPackages`. That is hang, not a process.
- Log · Type first. Phone chrome unchanged. No Hear it / Skip buttons.

### Must-not

- Remint `voice_turn` / `dest_job` / `heard_at` / `reference_turn_id` / `travis.stream` / `stream_event`.
- Remint 014 / 015 / 030 / 031. Rewrite dest assemble. Keep `MARKERS` / `isDestWithContextAsk`.
- Keep `generateTravisTextViaResponses` as fallback, dead code, or “just in case.”
- Invent another classifier, another tool-step cap, another “how we would implement a harness.”
- Remint the Type loop onto OpenAI Agents SDK, Vercel AI SDK `maxSteps`, Mastra, or a raw LangGraph `createReactAgent`.
- Swap dest for Deep Agents `task` / subagent. Remint `dest_job`.
- Unclip Here. Product cap. Cousin PR.
- Plant Hear it / Skip buttons.
- Invent a LangGraph `streamEvents` → 008 adapter. Process rows stay the tools the kit already called.

### Chain

Type send → `/api/session/:id/send` → `pipeTravisText` inserts `kind=user` → `generateTravisText` **is** `invokeDeepAgent` (`createDeepAgent().invoke`) → kit middleware every think (`/print.md` + `/roster.md`) → Travis tools / dest grain (031) → `insertDestJob` + `dispatchToSeat` when dest leaves → `pipeTravisText` writes `agent_post`. Stream `process` rows are those kit tool calls. No Responses cousin.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Live / Realtime harness** | 030 / 031. Voice parked. `mintLiveToken` / `/live/tool` stay. Dest grain in `runTravisTool` still rewrites if Live dests. |
| **Kit-native filesystem tools on 008** | Deep Agents `ls` / `read_file` / … do not go through `runTravisTool`. Do not mint a `wrapToolCall` stream mapper this cut. Travis-tool process rows are the watch. |
| **LangGraph checkpoint table** | 030. Per-invoke. Do not mint. |
| **Deep Agents `task` / subagent dest** | Dest is Cursor. |
| **Deep Agents `execute`** | Box is `run_box`. Profile already excludes it. |
| **OpenAI Agents SDK / Vercel AI SDK / Mastra** | Other mature loops exist. 030 already chose Deep Agents. Remint is grind. |
| **Cost / token product** | Kit tokens > a six-step cousin. Founder: cost is a thought, not the gate. Here clip stays. |
| **Hear / Next / Skip table** | 007 / 027. Buttons stay off. |
| **Chip dest without Travis** | `sendOrEnqueueMany` is not this loop. |
| **022 `travis.port`** | Stands. Do not remint. |

---

## 3. Requirements (extraction)

From PM-016 + founder lock + BUILD-PROTOCOL “Compose, don’t invent.” Not a second invention.

1. Find first. The planted send path is already a kit plus a cousin. Adopt the kit. Delete the cousin.
2. Novel only if missing. Travis hang = tape pipe, Here clip, tools we own, dest assemble (015 / 031), 080 load hang. Not a process engine.
3. Start at Type send. Live / Voice: named silence (same as 030).
4. 015 dest mail stays. Do not remint `dest_job`. Do not remint 031 assemble.
5. Paid is allowed. Cost is a thought.
6. Stream is the 008 desk. Process you watch is the adopted loop (Deep Agents calling tools), not a mystery wrap that might be Responses instead.

Plate staples (not scenery): **Stream** · **Log** · **Type**. Dest line = **ask + print**.

Do not build from scenery: ST2 labeled Term, bezel, Hear it / Skip buttons, a new phone face.

---

## 4. Inventory — kit vs ours vs cousin (quoted)

### Kit (adopted primitive)

LangChain **Deep Agents** — npm `deepagents` `1.13.3`, hung from `deepagents/node`. `createDeepAgent` ([reference](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent)) is “the main entry point… strong default runtime (filesystem, tasks, subagents, summarization).” Returns a compiled graph. `agent.invoke({ messages, files })`. Middleware: LangChain `createMiddleware` + `wrapModelCall` ([docs](https://docs.langchain.com/oss/javascript/deepagents/customization)). Model: `@langchain/openai` `ChatOpenAI` `useResponsesApi: true` — Responses as the **model port**, not a Travis step engine. Peers already in `package.json`: `@langchain/core` `@langchain/langgraph` `langchain`. Key = `OPENAI_API_KEY`. Server only.

Stood-up hang:

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

`registerHarnessProfile` already excludes `task` / `execute`. `StateBackend` `/print.md` + `/roster.md` (031). `wrapTravisTools` is LangChain `tool()` around `runTravisTool` — kit hang of tools we own.

080 load hang (keep — setup, not a process):

```5:10:src/server/travis-deep-agent.ts
import {
  createDeepAgent,
  registerHarnessProfile,
  StateBackend,
} from "deepagents/node";
```

```4:16:next.config.ts
  serverExternalPackages: [
    "@cursor/sdk",
    "deepagents",
    "deepagents/node",
    // ...
  ],
```

### Ours (stay — integration / locked grain)

| Piece | Job |
|-------|-----|
| `/api/session/:id/send` | Membership, chip dest, SSE. Not the model loop. |
| `pipeTravisText` | Insert `kind=user` → generate → insert `agent_post`. Tape. |
| `TRAVIS_SYSTEM` / `TRAVIS_TOOL_DECLS` / `runTravisTool` | Voice + tools we own. Not a step engine. |
| Dest grain (`destWithContextFor` / assemble) | 031. Ask + print on every dest leave. |
| Here clip (`roomContextFor`) | Mouth cost. Dest does not use this path. |
| Stream emit in `runTravisTool` | 024 / 031. Dest `body` = print. |
| `travisGenerateMiss` | 080 mouth if the kit throws. |

### Cousin (delete — reverse-engineered process)

Silent catch + six-step Responses loop we authored:

```94:184:src/server/travis-openai.ts
/** Pre-030 Type loop. Fallback when Deep Agents import/invoke throws. */
async function generateTravisTextViaResponses(params: {
  sessionId: string;
  prompt: string;
  room: string;
}): Promise<string> {
  // ...
  for (let i = 0; i < 6; i++) {
    const res = await openaiFetch("/v1/responses", body, {
      sessionId: params.sessionId,
    });
    // ... runTravisTool ... previous_response_id
  }
  return "I ran out of tool steps on that one, so I stopped there. …";
}

      const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
      return await invokeDeepAgent({ /* ... */ });
    } catch {
      return await generateTravisTextViaResponses({
```

That `catch` hides which engine ran. Stream then watches `runTravisTool` on **either** path. 080 said delete this loop as primary after the kit answers. The kit answers. This packet deletes the cousin.

### Other primitives (looked; refuse remint)

| Primitive | Why not this cut |
|-----------|------------------|
| OpenAI Agents SDK | Mature send loop. Would remint 030. |
| Vercel AI SDK `generateText` + `stopWhen` / steps | Same. |
| Mastra | Same. |
| LangGraph `createReactAgent` alone | Weaker than Deep Agents already hung. |

Cost thought: Deep Agents + OpenAI tokens is the live bill. The cousin was cheaper and novel. Not the gate.

---

## 5. Quoted stood-up (not memory)

Leave is Type send → `pipeTravisText` (user turn first):

```23:59:src/server/travis-reply.ts
  const userTurn =
    params.userTurn ??
    (await insertUserTurn(
      sessionId,
      prompt,
      "travis",
      undefined,
      params.referenceTurnId,
    ));
  // ...
    reply = (await generateTravisText({ sessionId, prompt })).trim();
```

Kit miss already has a mouth (keep):

```11:15:src/lib/travis-miss.ts
export function travisGenerateMiss(message: string): string {
  const msg = message.replace(/\s+/g, " ").trim() || "generate failed";
  if (isVisibleLogStatus(msg)) return `Travis: ${msg}`;
  return `Travis error: ${msg}`;
}
```

`pipeTravisText` already writes that on generate throw (`travis-reply.ts` L60–75).

Dest assemble (do not remint):

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

Dest stream (do not remint):

```640:660:src/server/travis-tools.ts
  const destLeave =
    name === "send_to_seat" || name === "dispatch_to_seat";
  const destFork = destLeave
    ? await destWithContextFor(sessionId).catch(() => null)
    : null;
  // startStreamProcess tool=dest_with_context body=print
  // finishStreamProcess skipped when destLeave
```

`dest_job.payload.text` is the dest body (`schema.ts` L211). `dispatchToSeat({ prompt })` stands.

Stream kinds locked:

```12:13:src/lib/stream.ts
export const STREAM_EVENT_KINDS = ["message", "process", "thought"] as const;
```

```524:525:src/server/db/migrate.ts
      CONSTRAINT stream_event_kind_chk
        CHECK (kind IN ('message', 'process', 'thought')),
```

Here clip (mouth). Dest must not use this path:

```25:31:src/lib/room-context.ts
export const WINDOW_TURNS = 14;
export const LINE_CAP = 300;
export const RECEIPT_QUOTE = 140;
export const WINDOW_CHAR_CAP = 2600;
```

Send route `maxDuration = 60` already (`send/route.ts` L37). Keep.

---

## 6. Stores / fields / contracts

### Refuse (do not mint)

| Thing | Why |
|-------|-----|
| New table | Tape, dest, stream already stand. Nothing missing. |
| `dest_job` columns | `payload.text` is the dest body (031). |
| `travis.stream` / `stream_event` columns or kinds | Stand. |
| `voice_turn` / `heard_at` / `reference_turn_id` | Stand. |
| LangGraph checkpoint table | 030 silence. |
| `/protocols/technical-pm.md` | 027. |
| Second Type loop / Responses cousin | This cut deletes it. |
| OpenAI Agents / Vercel AI SDK / Mastra hang | Remint 030. |

### Change (runtime only — not SQL)

| What | Change |
|------|--------|
| `generateTravisTextViaResponses` | **Delete.** The function, the six-step `for`, the “ran out of tool steps” mouth. |
| `generateTravisText` inner `catch` | **Delete.** Dynamic import + `invokeDeepAgent` stay. If they throw, throw. `finally` `runMotionRunner` stays. |
| Responses `openaiFetch` helper | Keep if `mintLiveToken` still uses it. Do not keep it for a Type cousin. |

### Keep

`invokeDeepAgent`. `createDeepAgent`. `StateBackend` `/print.md` + `/roster.md`. `destKitMiddleware` (files only; no print in the request). `wrapTravisTools`. `registerHarnessProfile` exclude `task` / `execute`. Dest grain 031. Here clip. `pipeTravisText`. `travisGenerateMiss`. `deepagents/node` + `serverExternalPackages`. `OPENAI_API_KEY` server-side. Cursor dest port. Stream 008 desk.

---

## 7. Runtime behavior

### Who writes

| Writer | What |
|--------|------|
| Founder Type send | `voice_turn` `kind=user` (already, before the loop). |
| `createDeepAgent().invoke` | The Type process. Tool calls. Final assistant text. |
| Dest grain | Rewrites dest `text` = ask + dest print on dest leave (031). |
| `insertDestJob` / `dispatchToSeat` | Cursor. Dest Log line = assembled. |
| `startStreamProcess` | Dest leave: `tool=dest_with_context`, `body=print`. Other Travis tools: name + args. |
| `pipeTravisText` | Final Travis mouth `agent_post`, or `travisGenerateMiss` status if the kit throws. |

### Who reads

| Reader | What |
|--------|------|
| Kit / `/print.md` | Dest print (`REQUEST_SCAN` worthy, raw). |
| Dest grain | Last `kind=user` + that print. |
| Cursor dest | Assembled `prompt`. |
| Stream pane / Log card | `process` body = print on dest. Other process = the Travis tool the kit called. |
| Here / next Type mouth | Still clipped `roomContextFor`. |

### Triggers

1. **Every Type message** — `invokeDeepAgent` only. No Responses cousin.
2. **Dest leave** — `send_to_seat` / `dispatch_to_seat`. Assemble always (031).
3. **Kit throw** — `pipeTravisText` writes `travisGenerateMiss`. Visible on the Log.
4. **Cheap think** — no dest tool. No dest process. Print stays in the file, not in the request.

### Stream (lock)

Same 008 desk. Process you watch = tools Deep Agents actually called through `wrapTravisTools` → `runTravisTool`. After the cousin is gone, that path is the only Type process. Do not add a second mapper from graph `stream` / `streamEvents`. Dest 031 emit unchanged.

### Live

Named silence for the library hang. `/live/token` + `/live/tool` unchanged. If Live calls `send_to_seat`, dest grain still runs. Do not plant Hear / Skip buttons.

---

## 8. Ports

| Port | This cut |
|------|----------|
| npm `deepagents` `createDeepAgent` / `StateBackend` / `wrapModelCall` | **Real. The Type process.** |
| OpenAI Type (`OPENAI_API_KEY`, `TRAVIS_TEXT_MODEL` via `ChatOpenAI` Responses) | **Real.** Model port inside the kit. Not a Travis step engine. |
| OpenAI `/v1/responses` six-step loop we authored | **Delete** as a Type process. |
| Cursor dest (`dispatchToSeat` / `streamCursorReply`) | **Real.** Prompt is the assembled string. |
| Deep Agents `FilesystemBackend` | **Refuse.** |
| Deep Agents `task` / subagent dest | **Refuse.** |
| Deep Agents `execute` | **Refuse.** `run_box` stands. |
| Live Realtime | **Stand-in for the hang.** Dest grain still runs. |
| Here clip | **Real, unchanged.** |

---

## 9. Verify

Smoke is [`PM-PACKET-016-COMPOSE-TEST.md`](./PM-PACKET-016-COMPOSE-TEST.md) on **psi** Log · Type. Pass from `src/` only is a miss.

**Pass**

1. A.1 — Type `ok`. Founder line on the right. Travis answers on the Log. Stream (if opened) is the 008 desk. Process for that send is the kit (no cousin six-step as the loop; no phrase-gate classifier). Cheap `ok` is not dest.
2. B.1 — 015 / 907 alongside line dests Technical PM. Dest body on the Log **contains the ask and the print**. He does **not** create Technical PM.
3. Here still clips Travis mouth on the **next** Type turn (`LINE_CAP` stands).
4. No Hear it / Skip **buttons**.
5. `generateTravisTextViaResponses` is gone. `generateTravisText` has no catch that starts a second engine.

**Grain / compile (Engineer)**

- Nothing new to mint. Existing dest assemble tests stay (031).
- A search of `src/` for `generateTravisTextViaResponses` / `ran out of tool steps` is empty.

**Fail**

- Type send still has a silent Responses cousin.
- Dest `payload.text` is the wrap, or the ask without the print when tape exists.
- Stream process body on dest is the receipt or `read_seat_reply`.
- Technical PM is created when already seated.
- Here unclipped.
- Live / Voice recut.
- A new table.

---

## 10. Out of scope

- Voice chrome, Live Deep Agents hang, Hear / Skip buttons.
- Unclipping Here. Cost work. Checkpoint table.
- Remint 011–015 / 023–031. Cousin PR.
- Other harness remints (Agents SDK, AI SDK, Mastra).
- 022 plant. Computer use. Canvas.
- Chip dest without Travis.
- Travis-writes-PHASE-ONE-LOG.
- Mapping kit `ls` / `read_file` onto 008.

---

## 11. Engineer cut order

1. Delete `generateTravisTextViaResponses` and the inner `catch` in `generateTravisText`. Dynamic import of `invokeDeepAgent` stays. `finally` `runMotionRunner` stays. Throw reaches `pipeTravisText` → `travisGenerateMiss`.
2. Do not touch dest grain, dest stream emit, `/print.md`, `/roster.md`, Here clip, or `dest_job`.
3. Confirm `src/` has no Responses Type cousin. Psi walk of the 016 test sheet (`ok`, then the 907 dest sentence).

No leftover analysis. Same PR. Next SA number is **033**.
