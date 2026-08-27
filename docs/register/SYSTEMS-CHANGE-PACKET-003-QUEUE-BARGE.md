# Systems change packet 003 — Per-seat queue + barge

**Number:** `003` — next systems packet is `004`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer cuts this; no leftover analysis on the queue/barge machine.  
**When:** 2026-08-27  
**Glass (read-only):** [`PM-PACKET-003-LOOK-QUEUE.md`](./PM-PACKET-003-LOOK-QUEUE.md) on living PR [#15](https://github.com/bywale-com/travis/pull/15) · [`PROTOTYPE-ANT-QUEUE-FACE.md`](./PROTOTYPE-ANT-QUEUE-FACE.md) + plates C1–C4. Fetch: `git fetch origin pull/15/head`.  
**Builds on:** SCP-002 room plant on `main` · Hotfix 006 (`agent_busy` retry; do not post SDK as Eng) · Hotfix 007 (single in-memory hold — **replaced** by this packet).  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

**Look/tokens:** not this packet. Engineer retokens from PM-003 without a theme store.

---

## Intent

When a conductor-finalized utterance would `send` to a seat whose Cursor agent already has an active run, **enqueue that utterance on that seat** instead of failing or retrying until 409. Waiting lines are **per addressee** (PM · SA · Engineer), durable for the session, visible in Mode A (chip) and Mode B (dashed rows) from the same store. **Force send** cancels that seat’s live Cursor run, then sends **that** queued line. **Delete** drops that line only. When a live run reaches a terminal status on its own, **auto-drain the head** of that seat’s queue (hands-free). Waiting is never an `agent_post`.

---

## Must / must-not

### Must

- One queue **per `agent_binding`** in the open `voice_session`. A line for Eng must not send to PM.
- Queue item = cleaned prompt (conductor phrase stripped, leading call-by-name stripped) + dest binding + order. Same text that would have gone to `agent.send`.
- **Do not** insert a `voice_turn` until the item actually sends. Queue pane ≠ log.
- Persist the live Cursor `runId` for a seat as soon as `agent.send` returns a `Run`, so a later HTTP barge can cancel without the original SSE handle.
- **Barge (force send):** cancel that seat’s live run, then send the tapped item (Mode B) or the **head** (Mode A chip).
- **Delete:** drop that item only. Remaining items on the same seat keep their order.
- **Faceless drain:** when that seat’s live run becomes terminal (`finished` / `error` / `cancelled`), if the queue is non-empty, send the **head**. No finger required.
- Mode switch preserves queues (same `session_id` rows).
- Empty seat → no chip, no `Queued · {seat}` block.
- Two seats may each have waiting lines at once.
- Barge the **queued line’s seat**, not whatever the pills show if they differ.
- `CURSOR_API_KEY` server-side only. Cloud `bc-…` only.

### Must-not

- Mint tables from C3/C4 scenery (campaign copy, checkmarks, play duration, teaching sentences).
- Put queued lines in `voice_turn` (`kind` stays 002 grain).
- One anonymous FIFO for the whole room.
- Post `[agent_busy]` / SDK errors as `agent_post`.
- Treat Hotfix 007 `pendingUtteranceRef` as the product store.
- Retry `agent_busy` as the **product** path (SDK: `isRetryable` is false). Short race retry only (below).
- Jump-the-line meaning “wait until the live run finishes” as force send — force send **cancels**, then sends.
- Third queue action, kebab, flush-all, cancel-all.
- Theme / token table.
- `Agent.create` per utterance.
- Desktop Cursor puppet.

---

## Fit vs what is stood up

Quoted from `src/server/db/schema.ts` + `migrate.ts` + `cursor-port.ts` + Hotfix 006/007 on `main`.

| Layer | Status | Notes |
|-------|--------|-------|
| `agent_binding` (three seats) | **Materialized** | Dest key for a queue. Ids are row data (`bind-seats.sql` / env). |
| `voice_session` / `voice_turn` | **Materialized** | Log + thought/post. **Refuse** adding `queued` as a turn kind. |
| Hotfix 007 `pendingUtteranceRef` | **Stand-in** | One in-memory hold, no chrome, not per-seat. **Replace.** |
| Hotfix 006 busy retry | **Port grain, wrong product path** | SDK: `AgentBusyError.isRetryable === false`. 003: enqueue or barge, don’t spin. |
| Live `runId` | **Missing** | `streamCursorReply` sees `result.id` on `done` only; nothing persisted for cancel. **Mint `seat_live_run`.** |
| Queue store | **Missing** | **Mint `queued_utterance`.** |
| Look tokens | **Not this packet** | Named silence here. |

---

## Stores / fields / contracts

### Add — `queued_utterance`

Waiting lines. Session-scoped. Delete the row when it sends or the user deletes it.

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | |
| `session_id` | uuid fk → `voice_session` | Mode switch keeps these rows |
| `binding_id` | uuid fk → `agent_binding` | Addressee. Parity: who was supposed to get it |
| `seat_key` | text | `pm` \| `sa` \| `engineer` — denormalized for chip/label; must match the binding’s `seat_key` at insert |
| `seq` | integer | Order **per (session_id, binding_id)**. Head = min seq still present |
| `text` | text | Cleaned prompt |
| `created_at` | timestamptz | |

**Head** of seat S = row with that `session_id` + `binding_id` and smallest `seq`.

Seed: **none** (empty queues). Do not seed dashed example copy from C3.

### Add — `seat_live_run`

At most one live Cursor run Travis knows about per binding (Cursor also enforces one active run per agent).

| Field | Type | Notes |
|-------|------|--------|
| `binding_id` | uuid pk fk → `agent_binding` | |
| `session_id` | uuid fk → `voice_session` | Travis session that started it, if any |
| `cursor_run_id` | text | Cursor `Run.id` |
| `user_turn_id` | uuid nullable fk → `voice_turn` | The `user` turn of a Travis-originated send; **null** if we only discovered a foreign busy run via `listRuns` |
| `started_at` | timestamptz | |

Clear the row when the run is terminal (including after barge cancel).

### Change — Cursor send port

On `agent.send` success: upsert `seat_live_run` **immediately** with `run.id` (do not wait for `done`).

On stream `done` / process end: delete `seat_live_run` for that binding, then **drain head** if any.

On `AgentBusyError` / `409 agent_busy`: **do not** retry as the product path. **Do not** write `agent_post`. Insert `queued_utterance` for this prompt + dest. If Travis has no `seat_live_run.cursor_run_id` yet, `Agent.listRuns(agentId, { runtime: "cloud", limit: 1 })` and if `items[0].status` is running/creating, persist that id so barge can cancel a run Travis did not start.

**Race-only retry:** if busy fires and `listRuns` returns **no** active run, one short retry of `send` is allowed. That is not the queue.

### Refuse (003)

- `queued` / `waiting` as `voice_turn.kind`.
- Room-global FIFO table.
- Durable worker process / outbox beyond: conductor insert, barge route, delete route, terminal drain on the existing SSE/finalize path.
- Storing C3 dashed CSS or icon names as fields.
- Theme store.

### External contract (Cursor) — quote, not memory

Sources: [SDK TypeScript](https://cursor.com/docs/sdk/typescript) · [Cloud Agents API endpoints](https://cursor.com/docs/cloud-agent/api/endpoints).

**One run per agent**

> Only one run can be active per agent. Calling this while another run is `CREATING` or `RUNNING` returns `409 agent_busy`. Wait for the existing run to terminate, or cancel it.

**Cancel is supported — not a named silence**

SDK `Run`:

```text
await run.cancel();
```

> Cancels the run. The status moves to `"cancelled"`, the live stream aborts, in-flight tool calls stop, and `run.wait()` resolves with `status: "cancelled"`. Partial output (assistant text written so far) stays on the Run object. Cancel is supported on running local and cloud runs and is a no-op if the run already finished.

Without a handle:

```text
Agent.cancelRun(runId: string, options?: GetRunOptions): Promise<void>
```

Cloud `GetRunOptions` requires `agentId`. REST:

```text
POST /v1/agents/{id}/runs/{runId}/cancel
```

> Cancellation is terminal — the run transitions to `CANCELLED` and cannot be resumed. To continue the conversation, create a new run on the same agent.

`409 run_not_cancellable` if already terminal — treat as success for barge and proceed to send.

**Busy is not retryable** (SDK errors table):

> `AgentBusyError` — Sending a follow-up while the same cloud agent already has a run in `CREATING` or `RUNNING`. Recommended: wait, cancel, or poll `Agent.listRuns()` before sending again. `isRetryable` is `false`.

v1 Travis is **cloud** (`bc-…`). Do not use `local.force` (local-only).

**Honesty (stood-up bindings):** seats are bound to the live PM / SA / Engineer cloud chats. Barge of that seat **cancels that agent’s active run**, which may be the Cursor chat itself, not only a Travis-originated send. That is the contract. Do not invent a second agent to dodge it.

---

## Runtime behavior

### Addressing (inherit SCP-002)

Conductor match → strip phrase → `parseCallByName` → maybe switch `active_binding_id` → dest = active binding. Queue key = **that dest**, not “whoever is live on Cursor.”

### Conductor send

```text
if seat_live_run exists for dest
   OR send throws AgentBusyError:
     insert queued_utterance (next seq for session+binding)
     persist live run id via listRuns if missing
     return queue snapshot (no user turn)
else:
     insert user turn → agent.send → upsert seat_live_run(run.id)
     stream thought/post as 002
     on terminal: clear seat_live_run → drain_head(dest)
```

### Force send (barge)

**Mode B row** = that `queued_utterance` id.  
**Mode A chip** = **head** of that chip’s `seat_key`.

```text
item = target queued_utterance
S = item.binding_id
if seat_live_run[S]:
  Agent.cancelRun(cursor_run_id, { runtime: "cloud", agentId })
  // 002 in-flight stream: treat as cancelled — collapse thought;
  // if partial assistant text exists, agent_post it (speakable);
  // status cancelled; never TTS the SDK string
  clear seat_live_run[S]
delete item from queue
insert user turn from item.text → send on S → upsert seat_live_run
```

If cancel 409 `run_not_cancellable`, still send the item (run already dead).

### Delete

```text
delete that queued_utterance row
do not cancel the live run
do not send later items
```

Mode A chip delete = drop **head** of that seat.

### Faceless drain

```text
on dest run terminal:
  clear seat_live_run
  head = min seq for that session+binding
  if head: send it (same as a fresh conductor send on an idle seat)
```

Drain sends **head only**, one at a time. Next head waits until this new run terminals (or is barged).

### Pane (extrude, no extra store)

GET queue for session, group by `seat_key`, order by `seq`.

| Home | Control / pane |
|------|----------------|
| Mode A | One quiet chip per seat with `count > 0`: `{n} waiting · {short label}`. Send = barge+send head. Delete = drop head. No bubbles. |
| Mode B | Per non-empty seat: `Queued · {short}` + dashed **user-right** rows (presentation). Each row: send = barge+send **that** id; delete = drop **that** id. |

Short labels already exist (`PM` / `SA` / `Eng`). Read from `agent_binding.label` / existing `seatKeyToShort` — do not hard-code new seat names.

Empty → omit chip and omit that seat’s `Queued ·` block.

---

## Ports

| Port | 003 requirement |
|------|-----------------|
| Cursor `send` + stream | **Real** (002 + Hotfix 001 path) |
| Cursor `cancel` / `Agent.cancelRun` | **Real** — barge |
| `Agent.listRuns` | **Real** — discover foreign busy run id |
| Queue + live-run stores | **Real** (this mint) |
| TTS | Unchanged 002; do not speak queue chrome or SDK errors |
| Look / Ant Tags | **Not this packet** |
| Binding picker | **Named silence** |

---

## Verify

1. Open session → Eng live run (send to Engineer) → speak another Eng turn + done phrase → **no** Eng error bubble; Mode A chip `1 waiting · Eng`; Mode B dashed row under `Queued · Eng`; log has only the first user turn until send.  
2. View log / Back to voice → same waiting row (same `id`).  
3. Second seat: `PM … I'm done` while Eng still running → **sends to PM now** (different agent); Eng queue unchanged.  
4. Two Eng waiting lines → Mode B two dashed rows, each with two icons; Mode A chip `2 waiting · Eng`.  
5. Mode B force send on the **second** row → Eng live run cancels; that text becomes the live send; first row stays queued.  
6. Mode A chip send → barges Eng, sends **head**.  
7. Delete one row → gone; live run continues; other rows keep order.  
8. Let Eng run finish with one waiting line and **no** tap → head auto-sends.  
9. Empty → chip and `Queued ·` gone.  
10. SPA/source: no `bc-…`, no C3 teaching sentences as demo rows.

---

## Out of scope

- Look / cream-terracotta retoken (Engineer from PM-003; no SA store).  
- Binding picker, Automations chain, triage, images/artifacts, local Composer.  
- Third queue icon, flush-all.  
- Changing 002 call-by-name / dead-man / sticky addressee.  
- Separate worker dyno.

---

## Engineer handoff note

Read **PM-PACKET-003** on PR #15 + this packet. Replace Hotfix 007 memory hold. Change Hotfix 006 busy handling to enqueue + `listRuns`, not retry-as-product. Do not append PM/SA logs. Do not mint extra tables.
