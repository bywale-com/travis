# SYSTEMS-CHANGE-PACKET-033 — Lived redesign (After new law)

**Number:** `033` — next systems packet is `034`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#159](https://github.com/bywale-com/travis/pull/159)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-07  
**PM packet:** [`PM-PACKET-017-LIVED-REDESIGN.md`](./PM-PACKET-017-LIVED-REDESIGN.md)  
**Test:** [`PM-PACKET-017-LIVED-REDESIGN-TEST.md`](./PM-PACKET-017-LIVED-REDESIGN-TEST.md)  
**FACE (look, do not mint from PNG):** [`PLATES-STREAM.md`](./PLATES-STREAM.md) ST1–ST3. No new plates. Staples — **Stream** (compartment = card) · **Log** · **Type**. Dest body on the Log is still **ask + print** (015 / 031).  
**Prior (do not remint):** **023** `dest_job` · **024** `travis.stream` / `stream_event` · **025** hang · **026** `heard_at` · **027** stay / `reference_turn_id` · **028** usable chat · **029** room wire · **030** Deep Agents hang · **031** dest assemble / `/print.md` / `/roster.md` · **032** kit-only Type send · **011–013** Here clip / motion / OS · **014** log-beats · **015** disposable seats · **007** membership · **080** `deepagents/node` + `serverExternalPackages` + `travisGenerateMiss`.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** `https://travis-psi.vercel.app` — room **After new law** `38f491eb-a881-4e1f-b9a6-2ac9b67a462c`, or a new room. **Log · Type.** Voice parked.

016 / 032 deleted the Responses cousin. Dest mail stays 031. This cut is the lived misses on that wire: dest-gate read the print, create mkdir’d a local SDK store, a refused dest minted a ticket, a new room hung a done Technical PM, and a later Type send threw ESM before dest assembled.

---

## 1. Intent

Five planted paths were touched wrong or not at all. Dest-gate classifies the founder’s last `kind=user` ask — not the assembled dest body. Create hangs Cursor’s Cloud Agents `POST /v1/agents` on the same `https://api.cursor.com` + `CURSOR_API_KEY` + Basic auth dest artifacts already use — not `@cursor/sdk` `Agent.create` and not a local `sdk-agent-store`. A ticket is stamped only after `insertDestJob` writes a row. Role dest `seat=pm` hangs and mails the living seated Technical PM (newest active seated bind of `/protocols/pm.md` with a `bc-` id, not catalog `pm`). Type send stays `invokeDeepAgent` only; dropping `Agent.create` off the create path is the first hang fix — if ESM remains, fix 080 without bringing Responses back. No new table. Do not remint 031 / 032 / `dest_job`.

---

## 2. Story

### Must

- Dest to Technical PM after the tape mentioned “create” still inserts a `dest_job` and leaves. Stream dest process may fail only if Cursor dest failed.
- `classifyDestPrompt` / `isHisWork` run on `destFork.ask` (last `kind=user`). Print stays in `assembled` / `payload.text`.
- A last ask that is create / sit / prove / unfold / authorize is still Travis’s — `hisWorkReceipt` stands on **that** ask.
- `create_agent` / V4 create returns a `bc-` id from `POST /v1/agents`, or names the Cursor hole. No `ENOENT` / `sdk-agent-store` / `mkdir`.
- `ticketForHand` / `ensureViaTravis` do not insert from a dest `handToDest` refused.
- Role dest `seat=pm` resolves to the living seated person. Do not dest `bc-25c5c6bf-006f-4252-9f25-49ab183835b2`. Do not spin a fourth PM when that living person exists.
- A later Type dest send reaches dest grain. Mouth if the kit throws is still `travisGenerateMiss`. No Responses cousin.
- Here stays clipped. Stream kinds stay `message` | `process` | `thought`. Dest leave `tool=dest_with_context` `body` = the print.
- Log · Type first. No Hear it / Skip buttons.

### Must-not

- Remint `dest_job` / `voice_turn` / `agent_binding` columns / `room_membership` / `travis.stream` / `stream_event`.
- Remint 031 assemble. Keep `destFork.ask` / `print` / `assembled`.
- Remint 032. Restore `generateTravisTextViaResponses`.
- Invent a second keyword list. Delete `HIS_WORK` as a substitute for “run it on the ask.”
- Keep `Agent.create` as the create path. Design a Travis agent store. Mint `sdk-agent-store` on the phone host.
- Hard-code `bc-b64bcdbb-…` or `bc-25c5c6bf-…` in `src/` or migrate / ensure-bindings.
- Remint 074 hang SQL. Re-run that file as-is (it still plants the done bind).
- Remint 015 sit paths. Mint `/protocols/technical-pm.md`. Mail catalog `pm`.
- Product cap. Cousin PR. Hear / Skip buttons.

### Chain

Type send → `pipeTravisText` inserts `kind=user` → `invokeDeepAgent` → dest tool → `destWithContextFor` (ask + print) → `classifyDestPrompt(ask)` → living seated resolve → `insertDestJob` → `ticketForHand` (only now) → `dispatchToSeat` (`Agent.resume` + `send`, unchanged) → stream `dest_with_context` body = print.

Create → `createAgentBinding` → `POST https://api.cursor.com/v1/agents` → persist `agent.id` on `agent_binding`. No SDK create. No local store.

New room / role dest → living seated of `/protocols/pm.md` → `addMember` if missing → dest that bind. No spin if living exists.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Unseat / Cursor rebind table** | 023. Deactivate is not this cut’s SQL. Runtime skips catalog `pm` and older seated of the same path. |
| **Living-bind column / table** | Newest `created_at` among matching seated binds is the living person. PM-HANDOFF ids are verify glass, not `src/` constants. |
| **074 hang SQL rewrite** | Do not remint. Do not plant the living `bc-` into migrate. |
| **Dest send port remint** | Dest stays `Agent.resume` + `send`. Artifacts stay HTTP. Only **create** moves to HTTP. |
| **Deep Agents `task` / filesystem / Responses cousin** | 030 / 032. |
| **Hear / Next / Skip** | 007 / 027. Buttons stay off. |
| **Live / Realtime hang** | 030. Dest grain still runs if Live dests. |
| **022 `travis.port`** | Stands. |

---

## 3. Requirements (extraction)

From PM-017 founder lock + BUILD-PROTOCOL “Compose, don’t invent.” Not a second invention.

1. Gate on the last ask, or the regex goes away. Do not add markers. Print stays in the dest body.
2. Dest leaves. `dest_job` exists after dest to Technical PM. Gate lie and ESM throw are not Cursor dest failures.
3. Create is Cursor’s `POST /v1/agents` (docs: [Create An Agent](https://cursor.com/docs/cloud-agent/api/endpoints)). Same host and key dest artifacts already use. Blocker file only if that port is missing — it is not.
4. Ticket follows a real leave. `ensureViaTravis` is not the dest attempt.
5. New room talks to the living Technical PM. Sit already exists (015). Do not mint a fourth PM.
6. Type send stays kit-only (032). Fix the 080 hang so a later dest send does not throw `Cannot use import statement outside a module`.
7. Do not remint 031 / 032 / `dest_job`.

Plate staples (not scenery): **Stream** · **Log** · **Type**. Dest line = **ask + print**. Technical PM = seated person, not catalog `pm`.

Do not build from scenery: ST2 labeled Term, bezel, Hear it / Skip buttons, a new phone face.

---

## 4. Inventory — five misses (quoted)

### Dest-gate (touched improperly)

```17:35:src/lib/dest-gate.ts
const HIS_WORK =
  /\b(create|sit|prove|unfold|authorize)\b/i;
export function isHisWork(text: string): boolean {
  // ...
  if (HIS_WORK.test(t)) return true;
```

```449:459:src/server/travis-tools.ts
async function handToDest(params: {
  // ...
  const promptClass = classifyDestPrompt(text);
  if (promptClass?.class === "his") {
    return { ok: false, text: hisWorkReceipt() };
```

```691:696:src/server/travis-tools.ts
    const text = destFork
      ? destFork.assembled
      : String(args.text ?? "").trim();
```

`text` here is ask + print after 031. First try: dest ask had no create-word; print did. Gate refused. `dest_job` **0**.

`destWithContextFor` already splits them:

```29:40:src/server/dest-with-context.ts
  const lastUser = [...turns].reverse().find((t) => t.kind === "user");
  // ...
    ask: lastUser.text,
    print,
    assembled: assembleDestWithContext({ ask: lastUser.text, print }),
```

### Create (touched improperly)

```229:248:src/server/create-agent.ts
      const { Agent } = await import("@cursor/sdk");
      const created = await Agent.create({
        apiKey: key,
        name: label,
```

Lived: `ENOENT: no such file or directory, mkdir '…/sdk-agent-store/…'`. Same class as 907. No person created.

Dest artifacts already speak Cloud HTTP (do not remint dest send):

```50:71:src/server/cursor-port.ts
const CURSOR_API = "https://api.cursor.com";
function cursorBasicAuth(key: string): string {
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}
    const res = await fetch(`${CURSOR_API}/v1/agents/${encodeURIComponent(id)}/artifacts`, {
      headers: { Authorization: cursorBasicAuth(key) },
```

Official create ([docs](https://cursor.com/docs/cloud-agent/api/endpoints)): `POST /v1/agents`. `prompt.text` required. `name` optional (max 100). `model.id` optional. `repos` optional — “Omit both `repos` and `env` to start a no-repo agent.” Auth: Basic `-u YOUR_API_KEY:` (same as artifacts) or Bearer. Response returns durable `agent` (id `bc-…`) + initial `run`.

Dest leave stays `Agent.resume` + `send` (`cursor-port.ts` L392–399). Do not remint that.

### Ticket (touched before dest)

```705:724:src/server/travis-tools.ts
    const prior = await ticketForHand(sessionId, String(args.id ?? ""), text);
    return postHandReceipt(
      sessionId,
      await handToDest({ ..., initiativeId: prior?.id }),
    );
```

```255:264:src/server/initiative.ts
export async function ensureViaTravis(
  sessionId: string,
): Promise<Initiative | null> {
  // ...
  return insertOpen(sessionId, founding.id, "via_travis");
```

`ticketForHand` falls through to `ensureViaTravis` when no id / named / inherited ticket. First dest minted **`no worries I want you to pickle PM that`** with `dest_job` **0**.

Who-path already inserts the job before dispatch. Role-path dispatches **then** inserts (`travis-tools.ts` L516–539). Align role to who: insert, then ticket, then dispatch.

`fileDestJobInitiative` already stands (`dest-job.ts` L208–237). Use it after the ticket exists.

### New-room sit (touched improperly)

```198:239:src/server/room-membership.ts
async function activeBindings(): Promise<AgentBinding[]> {
  return db.select().from(agentBinding).where(eq(agentBinding.active, true));
}
// createStandInRoom inserts every active catalog row
```

```63:76:src/server/sit.ts
export async function findIdleSeated(
  sessionId: string,
  protocolPath: string,
): Promise<AgentBinding | null> {
  // open members of THIS room + protocol_path + no live run
  // oldest joined_at
```

```191:201:src/server/sit.ts
export async function resolveRoleDest(...) {
  const idle = await findIdleSeated(params.sessionId, parsed.path);
  if (idle) return idle;
  return spinSeatedRole({ sessionId: params.sessionId, role: parsed.role });
```

Tape: After new law hung `bc-25c5c6bf-…` (074 hang SQL — **done**). Living is `bc-b64bcdbb-a2dd-43ad-9904-6a69af55be8a` (PM-HANDOFF). Catalog `pm` is not this seat (`isCatalogPm` — `seat_key === "pm"`). 015 spin would mint a fourth PM.

`createExplicitRoom` hangs chosen `bindingIds` + Travis. Role dest still must resolve to living even if the chosen set included the done bind.

### Type send hang (touched improperly on retry dest)

```86:96:src/server/travis-openai.ts
    const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
    return await invokeDeepAgent({
      sessionId: params.sessionId,
      prompt: params.prompt,
      room,
    });
```

First try: kit ran (`create_agent` twice). Retry dest send: `Travis error: Cannot use import statement outside a module`. Dest never assembled. 032 already deleted the cousin. 080 hang (`deepagents/node` + `serverExternalPackages`) still threw on that later send.

---

## 5. Stores / fields / contracts

### Refuse (do not mint)

| Thing | Why |
|-------|-----|
| New table | Tape, dest, sit, create already stand. |
| `dest_job` columns | `payload.text` is the dest body (031). |
| `agent_binding` columns | `protocol_path` / `cursor_agent_id` / `active` / `created_at` stand. No living-bind column. |
| `room_membership` columns | Stand. |
| `/protocols/technical-pm.md` | 027. Sit path is `/protocols/pm.md`. |
| Responses Type cousin | 032. |
| Travis `sdk-agent-store` | The miss. |
| Hard-coded `bc-` in `src/` / migrate / ensure | 001 / 074 test law. |

### Change (runtime only — not SQL)

| What | Change |
|------|--------|
| `handToDest` classify input | `classifyDestPrompt(destFork?.ask ?? last user ask ?? text)`. Never classify `assembled`. `insertDestJob` / `dispatchToSeat` still get `assembled`. |
| `createAgentBinding` create port | **Delete** `Agent.create`. Call `POST ${CURSOR_API}/v1/agents` via the existing cursor-port host + `cursorBasicAuth`. Body: `{ name: label, prompt: { text: "You are ${label}. You sit in a Travis room." }, model?: { id }, repos?: [{ url, startingRef }] }`. Omit `repos` / `env` when none — official no-repo create. Persist `agent.id` only if it is `bc-…`. HTTP fail or missing `CURSOR_API_KEY` → throw the hole; **do not insert** a binding without a Cursor id. |
| `ticketForHand` | **After** `insertDestJob` returns a row. Not before `handToDest`. Refused his/nobody → no `ensureViaTravis`. Named / inherited stamp only on a real leave. Then `fileDestJobInitiative`. |
| Role `handToDest` order | Same as who: classify → resolve living → `insertDestJob` → ticket → `dispatchToSeat` → `markDestJob`. Do not dispatch before the job row. |
| `livingSeated(protocolPath)` | Newest `created_at` among `active` + that `protocol_path` + `cursor_agent_id` ~ `^bc-` + not `isCatalogPm(seat_key)`. |
| `resolveRoleDest` | Idle living seated **in this room** first. Else `addMember` the global `livingSeated` of that path (already sat — do not re-sit / re-hand unless `protocol_path` is empty). Dest that bind. **Spin only when `livingSeated` is null.** Never dest a prior bind of the same path when a newer living one exists. |
| `findIdleSeated` | Skip catalog `pm`. Skip empty / non-`bc-` ids. If several seated of the path, prefer the living (newest) bind, not the oldest done member. |
| `createStandInRoom` | Hang Travis + one `livingSeated` per `/protocols/pm.md` · `/protocols/sa.md` · `/protocols/engineer.md` when that person exists. **Not** every `active` catalog row. |
| `generateTravisText` | Stays `invokeDeepAgent` only (032). Create no longer imports `@cursor/sdk` `Agent.create`. If a later send still throws ESM, fix the 080 hang (`deepagents/node`, `serverExternalPackages`, dynamic import). **Do not** restore `generateTravisTextViaResponses`. |

### Keep

031 dest assemble. 032 kit-only send. `dest_job.payload.text`. `dispatchToSeat` / `streamCursorReply` resume+send. 015 sit paths and `sit_agent`. `hisWorkReceipt` / `nobodyReceipt`. `isCatalogPm`. Here clip. Stream 008 desk. `travisGenerateMiss`. `OPENAI_API_KEY` / `CURSOR_API_KEY` server-side. 074 SQL file as history — do not remint, do not re-run.

---

## 6. Runtime behavior

### Who writes

| Writer | What |
|--------|------|
| Founder Type send | `voice_turn` `kind=user` (already, before the loop). |
| `createDeepAgent().invoke` | Type process. Tool calls. Final assistant text. |
| Dest grain | `assembled` = ask + print (031). Unchanged. |
| `classifyDestPrompt` | Reads **ask only**. |
| `insertDestJob` | After classify + living resolve, before ticket and dispatch. |
| `ticketForHand` | After the job row. `fileDestJobInitiative` hangs the id on that job. |
| `dispatchToSeat` | Cursor resume+send. Prompt = assembled. |
| `createAgentBinding` | HTTP create → `agent_binding` with `bc-` id. |
| `resolveRoleDest` | `addMember` living seated if missing. Spin only if nobody living. |
| `pipeTravisText` | `agent_post`, or `travisGenerateMiss` if the kit throws. |

### Who reads

| Reader | What |
|--------|------|
| Dest-gate | Last `kind=user` ask. |
| Dest / Cursor | Assembled ask + print. |
| Role dest | `livingSeated('/protocols/pm.md')` (etc). |
| Stream pane | Dest `process` body = print. |
| Backlog | Tickets only from dests that inserted `dest_job`. |

### Triggers

1. **Dest leave** (`send_to_seat` / `dispatch_to_seat`) — assemble (031) → classify ask → living resolve → job → ticket → dispatch.
2. **Create** — HTTP `POST /v1/agents`. No SDK create.
3. **New stand-in room** — Travis + living seated roles. Not the full catalog.
4. **Kit throw** — `travisGenerateMiss`. Visible on the Log. Not a dest refuse. Not a ticket.

### Stream (lock)

Same 008 desk. Dest leave `tool=dest_with_context` `body` = print. Do not overwrite with the receipt. Fail the stream only when Cursor dest failed after a job row, or when the kit never reached dest (miss mouth — no fake dest process).

### Live

Named silence for the library hang. If Live dests, dest grain + this gate/ticket/living resolve still run. No Hear / Skip buttons.

---

## 7. Ports

| Port | This cut |
|------|----------|
| `POST https://api.cursor.com/v1/agents` | **Real. The create path.** Same `CURSOR_API` + Basic as artifacts. |
| `GET …/v1/agents/{id}/artifacts` | **Real. Unchanged.** |
| SDK `Agent.resume` + `send` | **Real. Dest send. Unchanged.** |
| SDK `Agent.create` | **Delete as create.** |
| npm `deepagents` `createDeepAgent` from `deepagents/node` | **Real. The Type process.** 032. Fix hang if ESM remains. |
| OpenAI Type (`ChatOpenAI` Responses inside the kit) | **Real.** Model port. Not a Travis step engine. |
| OpenAI `/v1/responses` six-step cousin | **Stay deleted.** |
| Deep Agents `FilesystemBackend` / `task` / `execute` | **Refuse.** |
| Live Realtime | **Stand-in for the hang.** |

No `BLOCKER-033-*.md`. The Cloud create port exists and is already authenticated on this host. A live HTTP 4xx from Cursor is a named hole on the Log, not a missing Travis table.

---

## 8. Verify

Smoke is [`PM-PACKET-017-LIVED-REDESIGN-TEST.md`](./PM-PACKET-017-LIVED-REDESIGN-TEST.md) on **psi** Log · Type. Pass from `src/` only is a miss.

**Pass**

1. A.1 — Create sentence. A `bc-` person exists and can sit, **or** Travis names a Cursor hole (not `ENOENT` / `sdk-agent-store` / `mkdir`).
2. B.1 — Dest sentence after that create talk. `dest_job` row exists. Dest body is ask + print. Not `That is mine — create, sit, prove…`. Not `Travis error: Cannot use import statement outside a module`.
3. C — A refused dest does not mint a backlog title from that sentence.
4. Role dest `seat=pm` in a new room reaches the living Technical PM (`bc-b64bcdbb-…` on psi today — verify glass, not a planted constant).
5. No Hear it / Skip **buttons**.
6. `generateTravisTextViaResponses` stays gone. `Agent.create` is gone from `createAgentBinding`.

**Grain / compile (Engineer)**

- `isHisWork` / `classifyDestPrompt("create a new PM")` still `{ class: "his" }`.
- Classify of a dest **ask** `Send this to Technical PM: I am sending this from the Travis app.` is not `his`, even when the assembled print contains “create another agent.”
- Refused dest does not call `ensureViaTravis`.
- `create-agent.ts` has no `Agent.create`.
- `resolveRoleDest` does not `spinSeatedRole` when `livingSeated` exists.

**Fail**

- Dest-gate still reads `assembled`.
- Create still mkdir’s `sdk-agent-store`.
- Ticket from a dest that never left.
- New room dests `bc-25c5c6bf-…` or spins a fourth PM.
- Dest send dies as ESM / Responses cousin returns.
- A new table. Hard-coded living `bc-` in `src/`.
- 031 / 032 remint.

---

## 9. Out of scope

- Voice chrome, Live Deep Agents hang, Hear / Skip buttons.
- Unclipping Here. Cost work. Checkpoint table.
- Remint 011–016 / 023–032. Cousin PR.
- Remint dest send onto raw `POST /v1/agents/{id}/runs`.
- Remint 074 hang SQL. Plant living `bc-` into migrate.
- Unseat table. Living-bind column.
- 022 plant. Computer use. Canvas.
- Chip dest without Travis.
- Travis-writes-PHASE-ONE-LOG.

---

## 10. Engineer cut order

1. **Gate.** `handToDest` classifies `destFork.ask` (or last `kind=user` when no destFork). Keep `HIS_WORK`. Do not add markers. Job + dispatch still use `assembled`.
2. **Create.** Add HTTP create on cursor-port (same `CURSOR_API` + Basic). `createAgentBinding` calls it. Delete `Agent.create`. No row without a `bc-` id. `create_agent` tool + V4 screen share that write.
3. **Ticket + job order.** Classify / resolve → `insertDestJob` → `ticketForHand` → `fileDestJobInitiative` → `dispatchToSeat`. Role path matches who path. Refuse → no ticket, no job.
4. **Living sit.** `livingSeated(path)`. `findIdleSeated` / `resolveRoleDest` use it. `addMember` if missing. Spin only when nobody living. `createStandInRoom` hangs Travis + living seated roles, not the catalog dump.
5. **Hang.** Confirm `generateTravisText` is still invoke-only. If a later dest send still throws ESM after create is HTTP, fix 080 (`deepagents/node` / externals). Do not restore Responses.
6. Psi walk of the 017 test sheet.

No leftover analysis. Same PR. Next SA number is **034**.
