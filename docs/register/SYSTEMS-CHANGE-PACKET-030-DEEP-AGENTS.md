# SYSTEMS-CHANGE-PACKET-030 — Deep Agents (dest-with-context)

**Number:** `030` — next systems packet is `031`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#147](https://github.com/bywale-com/travis/pull/147)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-07  
**PM packet:** [`PM-PACKET-014-DEEP-AGENTS.md`](./PM-PACKET-014-DEEP-AGENTS.md)  
**Test:** [`PM-PACKET-014-DEEP-AGENTS-TEST.md`](./PM-PACKET-014-DEEP-AGENTS-TEST.md)  
**FACE (look, do not mint from PNG):** [`PLATES-STREAM.md`](./PLATES-STREAM.md) ST1–ST3. No new plates. Staples — **Stream** (compartment = card) · **process** body is the print (the list) · dest line on the Log contains that list.  
**Prior (do not remint):** **023** `dest_job` · **024** `travis.stream` / `stream_event` · **025** hang · **026** `heard_at` · **027** stay / `reference_turn_id` · **028** usable chat · **029** room wire · **011–013** Here clip / motion / OS. **014** log-beats is a different packet — do not remint.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** `https://travis-psi.vercel.app` — room Travis. **Log · Type.** Voice parked.

LangChain Deep Agents is the Type harness. Dest-with-context is grain, not hope. Technical PM dest stays a Cursor run.

---

## 1. Intent

Travis’s Type loop is a system prompt plus a six-step OpenAI Responses tool cycle. Here clips his own last list to 300 characters. Dest `text` is whatever the model stuffed into `send_to_seat` / `dispatch_to_seat`. This morning that was the ask, not the print. This cut hangs **Deep Agents** (`createDeepAgent` from npm `deepagents`) on that Type loop so a process fires on every message, then forks. First fork: dest-with-context. Grain reads unclipped `voice_turn.text`, concatenates founder ask + print, and that string is `dispatchToSeat` `prompt` and `dest_job.payload.text`. Stream `process` body is that print. Here / Live clip unchanged. No new table. Dest seats stay Cursor. Not a subagent.

---

## 2. Story

### Must

- Every Log · Type message runs the Deep Agents harness, then a fork. Not `TRAVIS_SYSTEM` hoping.
- Dest-with-context: founder asked to send “that” / the printed chat / the list as context → dest body **contains the unclipped print** plus the ask. Instruction-only dest of that ask is a miss.
- Here stays clipped (`LINE_CAP` 300 · `WINDOW_TURNS` 14 · `WINDOW_CHAR_CAP` 2600). Dest assembly and the harness filesystem read unclipped tape.
- Dest to Technical PM / SA / Engineer is still `send_to_seat` / `dispatch_to_seat` → `dispatchToSeat` → Cursor. Same `dest_job`.
- Stream chrome is 008 (ST1–ST3). Kinds stay `message` | `process` | `thought`. Dest-with-context is a `process` whose **body is the print**. Receipt does not overwrite that body.
- Log · Type first. Phone chrome unchanged. No Hear it / Skip buttons.

### Must-not

- Remint `voice_turn` / `dest_job` / `heard_at` / `reference_turn_id` / `travis.stream` / `stream_event`. Fourth event kind. New table for the filesystem.
- Swap Technical PM (or SA / Engineer) dest for a Deep Agents `task` / subagent.
- Unclip Here to “fix” dest.
- Hang Deep Agents on Live / Realtime this cut.
- `FilesystemBackend` onto house (`os_node`) or the Sprite. Dump the tape onto disk. Mint `/protocols/technical-pm.md`.
- Leave default `execute` (shell) callable. Product caps. Cousin PR. Plant a second Travis (a second Type loop beside `generateTravisText`).
- Pass from `src/` only.

### Chain

Type send → `pipeTravisText` inserts `kind=user` → `generateTravisText` **is** `createDeepAgent().invoke` (not `/v1/responses`) → middleware every model call → dest-with-context fork → grain assembles unclipped print → `runTravisTool` `send_to_seat` / `dispatch_to_seat` → `insertDestJob` + `dispatchToSeat({ prompt: assembled })` → Cursor. Stream `process` `tool=dest_with_context` body = print. Log dest line = assembled.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Live / Realtime harness** | PM-014 lock 5. Voice parked. `mintLiveToken` / `/live/tool` stay. Dest grain in `runTravisTool` still rewrites if Live dests (no hole). The library hangs on Type only. |
| **LangGraph checkpoint table** | Per-invoke. Durable checkpointer is a later store. Do not mint. |
| **Deep Agents `task` / subagents as dest** | Dest is Cursor. Kit is not that wire. |
| **`execute` sandbox** | Box is `run_box`. Refuse the default shell tool. |
| **Cost / unclip Here** | Founder: cost later. Here clip stays. |
| **Hear / Next / Skip table** | 007 / 027. Buttons stay off. |
| **Chip dest without Travis** | Test is Travis dest after a list. Direct chip → `sendOrEnqueueMany` is not this fork. |
| **022 `travis.port`** | Stands on #120. Do not remint. |
| **Other forks** (answer-only, tools-only, …) | First fork is dest-with-context. Do not invent a catalog of forks. |

---

## 3. Requirements (extraction)

From PM-014 + founder 13:00 / 13:08 / 13:16 / 13:20. Not a second invention.

1. Harness on every Type message, then forks. Deep Agents (LangChain JS). Kit is not magic — we write the dest-with-context fork.
2. Dest `text` **is** the print plus the ask. Not “tell Technical PM to include the chat.”
3. Here clipped. Dest / filesystem unclipped.
4. Stream chrome stays. Process **content** is the harness. Dest-with-context body = the list.
5. No new table unless the filesystem needs a store — it does not. `payload.text` is the dest body today.

Plate staples (not scenery): **Stream** · process body = the **print** · dest Log line contains the list.

Do not build from scenery: ST2 labeled Term, bezel, Hear it / Skip buttons, a new phone face.

---

## 4. Quoted stood-up (not memory)

Type loop — OpenAI Responses, clipped Here in `input`, six tool steps, `runTravisTool`:

```93:158:src/server/travis-openai.ts
export async function generateTravisText(params: {
  sessionId: string;
  prompt: string;
}): Promise<string> {
  // ...
  const room = await roomContextFor(params.sessionId).catch(() => "");
  let body: Record<string, unknown> = {
    model: TRAVIS_TEXT_MODEL,
    instructions: TRAVIS_SYSTEM,
    input: room ? `${room}\n\n${params.prompt}` : params.prompt,
    tools,
    reasoning: { effort: "low" },
  };
  // for (let i = 0; i < 6; i++) { ... runTravisTool ... previous_response_id }
```

Leave is Type send → `pipeTravisText` (user turn first, then the loop):

```23:58:src/server/travis-reply.ts
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

Here clip (Travis mouth). Dest must not use this path:

```23:31:src/lib/room-context.ts
/** Turns considered. Older than this never enters the window. */
export const WINDOW_TURNS = 14;
/** A user or Travis line longer than this is cut. */
export const LINE_CAP = 300;
/** Hard ceiling on the whole window. Oldest lines drop first. */
export const WINDOW_CHAR_CAP = 2600;
```

`describeTurn` clips Travis’s own post to `LINE_CAP` (`You said: …`). `roomContextFor` feeds `buildRoomContext`. `recentTurns` already selects full `voice_turn.text` — clip is format, not store.

Dest payload is `prompt` only. `payload.text` is that string:

```38:41:src/server/dispatch.ts
export async function dispatchToSeat(params: {
  sessionId: string;
  binding: AgentBinding;
  prompt: string;
```

```211:211:src/server/db/schema.ts
  payload: jsonb("payload").$type<{ text: string; done?: string }>().notNull(),
```

```94:94:src/server/dest-job.ts
      payload: { text: params.text.trim(), done: "" },
```

`send_to_seat` / `dispatch_to_seat` pass model `text` straight through (`travis-tools.ts` `handToDest` → `dispatchToSeat({ prompt: text })` and `insertDestJob({ text })`).

Stream process starts as `argsBody(args)`, then **finish overwrites with the tool receipt**:

```639:652:src/server/travis-tools.ts
  const processEv = opened
    ? await startStreamProcess({
        streamId: opened.id,
        tool: name,
        body: argsBody(args),
      }).catch(() => null)
    : null;

  const finish = async (result: ToolResult): Promise<ToolResult> => {
    if (processEv) {
      await finishStreamProcess({
        eventId: processEv.id,
        body: result.text,
      }).catch(() => {});
```

Kinds locked. Empty `tool` on process is forbidden. No fourth kind:

```12:13:src/lib/stream.ts
export const STREAM_EVENT_KINDS = ["message", "process", "thought"] as const;
```

```524:525:src/server/db/migrate.ts
      CONSTRAINT stream_event_kind_chk
        CHECK (kind IN ('message', 'process', 'thought')),
```

Live (not this hang): `mintLiveToken` + `/live/tool` → `runTravisTool`. `package.json` has **no** `deepagents` / `@langchain/*`.

**External contract (Deep Agents JS, quoted):** npm `deepagents` · `createDeepAgent` ([reference](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent)) returns a compiled LangGraph graph. `agent.invoke({ messages })`. Defaults include filesystem tools (`read_file` / `write_file` / …), `task` (subagents), and `execute`. `StateBackend` = in-memory files. `FilesystemBackend` = disk — **refuse**. Peers: `@langchain/core` `@langchain/langgraph` `langchain`. Model via `@langchain/openai` (or Responses-backed LangChain class if `TRAVIS_TEXT_MODEL` `gpt-5.6-luna` 404s Chat Completions). Key = existing `openaiKey()` / `OPENAI_API_KEY`. Server only.

---

## 5. Stores / fields / contracts

### Refuse (do not mint)

| Thing | Why |
|-------|-----|
| New table for harness filesystem | Tape already holds unclipped `voice_turn.text`. StateBackend is per-invoke. |
| `dest_job` columns | `payload.text` is the dest body. Write a longer string. |
| `travis.stream` / `stream_event` columns or kinds | `tool` is already a string. `dest_with_context` is a tool name, not a kind. |
| `voice_turn` / `heard_at` / `reference_turn_id` | Stand. |
| `/protocols/technical-pm.md` | 027. |
| LangGraph checkpoint table | Silence. |
| Second Travis / second Type loop | `generateTravisText` **becomes** the invoke. |

### Add (grain + port — not SQL)

| What | Where |
|------|--------|
| `isDestWithContextAsk(text)` | `src/lib/` — testable. |
| `unclippedPrint(turns)` + `assembleDestWithContext({ ask, print })` | `src/lib/` — testable. No `describeTurn` / `LINE_CAP` / `WINDOW_CHAR_CAP`. |
| npm `deepagents` + LangChain peers | Server bundle only. Not the phone client. |
| `createDeepAgent` hang | Inside `generateTravisText`. Same function signature. |

### Change (runtime only)

| What | Change |
|------|--------|
| `generateTravisText` | Replace `/v1/responses` loop with `createDeepAgent().invoke`. Tools = existing `TRAVIS_TOOL_DECLS` wrapped to `runTravisTool`. `systemPrompt` = `TRAVIS_SYSTEM`. Clipped `roomContextFor` may still ride the user message (mouth cost). Unclipped print lives in StateBackend `/print.md` **and** dest grain. `runMotionRunner` in `finally` stays. |
| Dest path in `runTravisTool` | Before `guardDuplicate` / `insertDestJob` / `dispatchToSeat`: if last session `kind=user` is dest-with-context **and** a Travis speakable `agent_post` exists, set `text` = assembled. |
| Stream process for that fork | `kind=process` · `tool=dest_with_context` · `body` = the print (enough to see the list). **Do not** `finishStreamProcess` overwrite with the dest receipt. Receipt stays the Log dest line / `dispatchReceipt`. Other tools keep today’s finish-with-result. |
| Default Deep Agents `task` | Stub or omit. Reply: dest seats use `send_to_seat` / `dispatch_to_seat`. |
| Default Deep Agents `execute` | Stub or omit. Reply: use `run_box`. |

### Keep

Here clip. `dispatchToSeat`. `dest_job.payload.text`. Stream kinds. 008 desk. 029 room wire. `TRAVIS_TEXT_MODEL` / `OPENAI_API_KEY` server-side. Cursor dest port.

---

## 6. Runtime behavior

### Who writes

| Writer | What |
|--------|------|
| Founder Type send | `voice_turn` `kind=user` (already, before the loop). |
| Dest-with-context grain | Rewrites dest `text` from tape + that user line. |
| `insertDestJob` | `payload.text` = assembled. |
| `dispatchToSeat` | Cursor run `prompt` = assembled. `insertUserTurn` dest line = assembled (already uses `prompt`). |
| `startStreamProcess` | Dest-with-context: `tool=dest_with_context`, `body=print`. |
| Deep Agents StateBackend | `/print.md` = same unclipped print, this invoke only. Discard after. |
| `pipeTravisText` | Final Travis mouth `agent_post` (unchanged leave). |

### Who reads

| Reader | What |
|--------|------|
| Grain | This session: last `kind=user` text; last Travis speakable `agent_post` (full); last `WINDOW_TURNS` worthy turns, **raw** `text`. |
| Cursor dest | Assembled `prompt`. |
| Stream pane / Log card | `process` body = print. |
| Here / next Type mouth | Still clipped `roomContextFor`. |

### Triggers

1. **Every Type message** — `createDeepAgent` invoke (middleware on every model call).
2. **Dest-with-context fork** — last user line matches `isDestWithContextAsk` **and** last Travis speakable `agent_post` is non-empty. Then assemble **always**. Model wrap is discarded. Founder line is the ask.
3. **Dest otherwise** — model `text` through as today.

### Classifier (lock — test these)

`isDestWithContextAsk` is true when the founder line, case-insensitive, has any of:

- `as context`
- `printed chat`
- `send that list`
- `including what we just`
- `including the one we just`

**True:** `Send that list as context to Technical PM, including what we just discussed here.` (014 test dest sentence.)  
**False:** `Tell Technical PM the ticket is named X.` (instruction-only; no print attach.)

Do not invent a second NLP product. Do not attach the tape to every dest.

### Assemble (lock)

```text
ask = last kind=user text (the dest sentence). Do not use the model's wrap.
print = last Travis speakable agent_post, full
       + other worthy turns in the last WINDOW_TURNS (same count as Here), raw text, no LINE_CAP
       (do not duplicate the Travis post)
prompt = ask + blank line + print
```

Labels on print lines: `Travis:` / `Founder:` / `{seatLabel}:` — not `describeTurn`. If there is no Travis speakable post, do not fork (dest as today).

`destIdempotencyKey` already slices 240 of `text`. Assembled text is a new key. Fine.

### Deep Agents hang (Type only)

```text
generateTravisText(sessionId, prompt)
  → tools = TRAVIS_TOOL_DECLS → runTravisTool({ sessionId, name, args })
  → createDeepAgent({
       model: TRAVIS_TEXT_MODEL via LangChain OpenAI (same OPENAI_API_KEY),
       systemPrompt: TRAVIS_SYSTEM,
       tools,
       backend: StateBackend (not FilesystemBackend),
       middleware: [dest-with-context middleware — classify every message; does not replace dest grain],
       subagents: [] 
     })
  → seed /print.md = unclipped print
  → invoke({ messages: [ clipped Here? + prompt ] })
  → return final assistant text
  → finally runMotionRunner
```

Middleware may classify and may write `/print.md`. **Dest payload does not depend on the model reading that file.** Grain in `runTravisTool` is the must.

If `ChatOpenAI` 404s `gpt-5.6-luna`, use the LangChain OpenAI **Responses** model class. Same id. Same key. Do not hard-code a different model.

Do not keep the six-step `/v1/responses` loop next to the graph. One Type loop.

### Live

Named silence for the library. `/live/token` + `/live/tool` unchanged. If Live calls `send_to_seat`, dest grain still runs (same `runTravisTool`). Do not plant Hear / Skip buttons.

---

## 7. Ports

| Port | This cut |
|------|----------|
| OpenAI Type (`OPENAI_API_KEY`, `TRAVIS_TEXT_MODEL`) | **Real.** Loop becomes Deep Agents invoke. Key stays server-side. |
| npm `deepagents` + LangChain peers | **Real, new.** Server only. |
| Cursor dest (`dispatchToSeat` / `streamCursorReply`) | **Real.** Prompt is the assembled string. Do not replace with `task`. |
| Deep Agents `StateBackend` | **Real, ephemeral.** `/print.md` this invoke. |
| Deep Agents `FilesystemBackend` | **Refuse.** |
| Deep Agents `task` / subagent dest | **Refuse.** |
| Deep Agents `execute` | **Refuse.** `run_box` stands. |
| Live Realtime | **Stand-in for this hang.** Unchanged. |
| Here clip | **Real, unchanged.** |

---

## 8. Verify

Smoke is [`PM-PACKET-014-DEEP-AGENTS-TEST.md`](./PM-PACKET-014-DEEP-AGENTS-TEST.md) on **psi** Log · Type. Pass from `src/` only is a miss.

**Pass**

1. A.1 — list sentence lands; Travis lists; list is on the Log.
2. B.1 — dest sentence dests Technical PM; dest body **contains that list** (titles / the print), not only a wrap of “send that as context.” Readable on the Log without opening Cursor.
3. C.1 — Stream is the 008 desk. A `process` row is dest-with-context (`tool=dest_with_context` or the dest tool with **body = the print**). Not only “include the printed chat” / `read_seat_reply`. Not the dest receipt as the only body.
4. Here still clips Travis mouth on the **next** Type turn (`LINE_CAP` stands).
5. No Hear it / Skip **buttons**.

**Grain tests (Engineer, `src/lib/*.test.ts`)**

- `isDestWithContextAsk` true/false on the two sentences above.
- `assembleDestWithContext` includes a 2086-character Travis post in `prompt`; `describeTurn` of that post would have been 300; assembled is not that clip.

**Fail**

- Dest `payload.text` / Cursor prompt is the wrap.
- Stream process body is the receipt or `read_seat_reply`.
- Technical PM is a Deep Agents subagent.
- Here unclipped.
- Live / Voice recut.

---

## 9. Out of scope

- Voice chrome, Live Deep Agents hang, Hear / Skip buttons.
- Unclipping Here. Cost work. Checkpoint table.
- Remint 011–013 / 023–029. Cousin PR.
- Other harness forks after dest-with-context.
- 022 plant. Computer use. Canvas.
- Travis-writes-PHASE-ONE-LOG.

---

## 10. Engineer cut order

1. Grain `isDestWithContextAsk` + `unclippedPrint` + `assembleDestWithContext` + tests.
2. Dest rewrite in `runTravisTool` **before** job/dispatch. Stream `dest_with_context` body = print; skip receipt overwrite.
3. `deepagents` on `generateTravisText`. StateBackend `/print.md`. Stub `task` and `execute`. Same `OPENAI_API_KEY`. Delete the Responses for-loop.
4. Psi walk of the 014 test sheet.

No leftover analysis. Same PR. Next SA number is **031**.
