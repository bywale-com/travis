# SYSTEMS-CHANGE-PACKET-029 — The room stays live

**Number:** `029` — next systems packet is `030`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#144](https://github.com/bywale-com/travis/pull/144)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-06. **Recut same day** — first 029 (smarter poll) is void. This file is the cut.  
**PM packet:** [`PM-PACKET-013-LIST-LIVE.md`](./PM-PACKET-013-LIST-LIVE.md)  
**Test:** [`PM-PACKET-013-LIST-LIVE-TEST.md`](./PM-PACKET-013-LIST-LIVE-TEST.md)  
**FACE (look, do not mint from PNG):** no new plates. Staples — ticket **title** (B1 and the open ticket) · **lit** / **next** · Log tape. [`HOTFIX-057-BACKLOG-PLATES.md`](./HOTFIX-057-BACKLOG-PLATES.md) B1 / B6.  
**Prior (do not remint):** **023** `dest_job` / tape · send SSE helpers · **010** `travis.initiative` · **013** motion · **024** `travis.stream` · **027** stay · **012** OS house · **028** reserved for PM-012 on [#142](https://github.com/bywale-com/travis/pull/142)  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

023 §8.3 named SSE / LISTEN silence for a later bus. **This is that cut.** The room bus is open. Do not remint 023 tables.

---

## 1. Intent

The tape is durable (`voice_turn.seq`). Send/finalize SSE dies when **that** request ends. After that the phone polls the whole tape and guesses. Dest posts from another request never ride a wire. This cut gives the **room** one SSE: catch-up from the last `seq`, then stay open. Other-request writes (`insertTurn`, dest absorb, initiative, stream hang) `NOTIFY` that session. The wire emits. Poll is catch-up only while the wire is down. No new tape. No websocket.

---

## 2. Story

### Must

- While he is in the room (Log or Voice), the phone holds one session SSE.
- A new turn, a backlog list change, a line on the open ticket, a stream card — an event on that wire. The glass applies it. No timer required to see it.
- Connect / reconnect with the last `seq` (and the last list stamp). Server plays everything after that, then stays open. That is why they do not lose.
- Dropped wire or failed GET keeps last good rows. Catch-up fills the gap.
- Backlog list is titles / status / lit / next — not every ticket’s thread.
- Dest-job / reap / other-request writes reach this wire (LISTEN/NOTIFY). Not a new tape.
- Poll = fallback only: catch-up from last `seq` while the wire is down. Not the product.

### Must-not

- Ship “smarter poll” as this packet (1–3s whole-tape tick as the way he sees a landing).
- Remint `voice_turn`. Remint 023 tables. Remint 012 / 028.
- Invent a websocket next to the SSE we already use.
- Put Hear it / Skip **buttons** back.
- `setBacklogRows([])` / `setTurns([])` because one fetch died or the body lacked the array.
- New table. Cousin PR. Caps.

### Chain

`insertTurn` / initiative write / stream hang → `NOTIFY travis_room` (payload = `session_id`) → room SSE LISTENs → emit `turn` / `backlog` / `ticket` / `stream` → glass merges.

Connect: `afterSeq` (or `Last-Event-ID`) → replay turns with `seq > afterSeq` → one cheap `backlog` snapshot → open ticket if asked → current stream cards → LISTEN.

Wire down → one catch-up GET (`afterSeq` + cheap list) → reopen the wire. Last good stays in between.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Websocket** | Slack-scale presence. We already stream dest over SSE. One room SSE. |
| **Rooms index on this wire** | Lock is in-room. Index is one-shot + last good on leave/enter. Not a second bus. |
| **`voice_turn` in-place mutate (except streaming thought)** | No `updated_at` on the tape. Resume is `seq > afterSeq` OR `thought_status = 'streaming'`. |
| **028 / usable Log** | PM-012 on #142. Do not remint here. |
| **Hear / Next / Skip as a table** | 007 / 027. Buttons stay off. |
| **022** | Stand. |
| **Cross-device cursor** | This phone’s last `seq`. Not a shared row. |

---

## 3. Requirements (extraction)

From PM-013 recut + founder 14:48 / 14:49. Not a second invention.

1. One room wire. Not a smarter poll.
2. Resume from last `seq` — no loss.
3. Never blank.
4. List is a list.
5. Poll = catch-up only.

Plate staples (not scenery): ticket **title** · **lit** / **next** · Log tape.

Do not build from scenery: “Untitled”, “Loading…”, L1 `Om`.

---

## 4. Stood-up truth (quote, do not remint)

### Send SSE dies with the request

```69:78:src/server/seat-pipe.ts
export function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
export function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
```

`POST /send` (`send/route.ts` L149–193): `ReadableStream` → `sseHeaders()` → `controller.close()` in `finally`. Same shape on finalize / drain / live transcript / hold. Auth is cookie (`operator.ts` `requireOwnedSession`).

### Tape + seq

`insertTurn` (`seat-pipe.ts` L134–155) is the write: `nextTurnSeq` + insert. Dest absorb, Travis post, dest-job closer (`dest-job.ts` L201–202) all go through it. `voice_turn.seq` is `integer notNull`. No `(session_id, seq)` index.

### Other-request writes never ride send SSE

Reap / timeout / a second dest run insert turns after the founder’s send stream has closed. Phone tick (`Room.tsx` L480–531) then GETs the **whole** `/turns` tape. `refreshTurns` does `setTurns(data.turns ?? [])`. `listInitiatives` N+1 `turnsForInitiative`. `loadBacklog` `catch { setBacklogRows([]); }`. Tick deps `session?.id`. `visibilitychange` only `resumeSendSounds`.

### Postgres port (Neon session-mode)

```7:19:src/server/db/pool.ts
 * Neon session-mode pool_size is 15. Each serverless isolate that opens
 * five idle-forever clients burns a third of the account. One client,
 * and it goes back when idle.
  prepare: false,
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 5,
```

Query client is drizzle/`postgres` max 1. **LISTEN cannot share that client** (it holds the connection). `NOTIFY` is a one-shot statement on the query client. `postgres` supports `LISTEN` on a **dedicated** client.

No `maxDuration` is set on any route today. Send SSE already holds for a dest run. The room wire is longer — set `maxDuration` on **this** route only. Client reconnects with `afterSeq` when the function ends. Do not mint a second host.

023 §8.3: “SSE / LISTEN/NOTIFY is named silence (later bus).” Opened here.

---

## 5. Stores / fields / contracts

### Add — no new table. No new `voice_turn` column.

| What | Law |
|------|-----|
| **`voice_turn_session_seq_idx`** | Index only. Resume `seq > afterSeq`. Signed SQL below. Isolate-once in `ensureInitiativeStore` **and** `migrate.ts`. |
| **`GET /api/session/:id/events`** | New route. Cookie `requireOwnedSession`. Same `sse` / `sseHeaders`. Query: `afterSeq` (int), optional `ticketId`. Header `Last-Event-ID` wins if both set (`Last-Event-ID` = last turn `seq` as decimal). |
| **`NOTIFY travis_room`** | Channel name locked. Payload = `session_id` (uuid text). Not a table. |

Signed SQL:

```sql
CREATE INDEX IF NOT EXISTS voice_turn_session_seq_idx
  ON travis.voice_turn (session_id, seq);
```

Do not remint `voice_turn`. Do not add `updated_at` on the tape. Do not mint a bus table.

### Change — runtime

| What | Law |
|------|-----|
| **`notifyRoom(sessionId)`** | `SELECT pg_notify('travis_room', session_id)` on the **query** client. Call after: `insertTurn` (every kind); initiative hold / rename / done; `closeStream` / `failLiveStreamWithoutCard` / `openStream`; motion status write that `listBacklog` would show. Dest-job closer already `insertTurn`s — that notify is enough. |
| **Room SSE — resume** | 1. Turns: `session_id = id AND (seq > afterSeq OR thought_status = 'streaming')`, `orderBy seq`. Each event: `id: <seq>` + `event: turn` + the turn grain + attachments for **that** id. 2. One `event: backlog` — cheap list snapshot (below). `listAt` = server `now()` ISO on that payload. 3. If `ticketId` present: one `event: ticket` (`readInitiative`). 4. One `event: stream` — current live + cards. 5. Then LISTEN (below). |
| **Room SSE — listen** | Dedicated `postgres` client (not drizzle max-1). `LISTEN travis_room`. On notify: if payload ≠ this `session_id`, ignore. Else emit catch-up: new turns after the last seq **this connection already sent**; cheap `backlog` if list grain changed; `ticket` if `ticketId` still open; `stream` if cards/live changed. On client abort: `UNLISTEN`, close the listen client. Comment heartbeat (`: ping`) every 15s so proxies do not idle-kill. |
| **`maxDuration`** | Export `800` (seconds) on this route only. When the function ends, client reconnects with last `seq`. Same cookie. |
| **While the wire is open** | This function may `inspectAndNudgeQueue` / reap / `timeOutStaleDestJobs` for **this session** on a server interval (existing functions). Dest absorb emits via `insertTurn` → NOTIFY → this same wire (or direct emit if the write is in-process). Phone does **not** need the product tape-tick for dest to land. |
| **Face — hold the wire** | In-room: `fetch` the events URL with cookies (not `EventSource` — auth is cookie on fetch today; stay consistent with send). Parse SSE like `consumeAgentStream`. Apply `turn` (merge by id, append new seq). Apply `backlog` (replace rows only if payload `items` is an array). Apply `ticket` if that ticket is still open. Apply `stream`. On error / close: keep last good; fallback catch-up; reopen with last `seq` + open `ticketId`. |
| **`GET /turns?afterSeq=`** | Same incremental select as resume. Attachments for returned ids. Cards/streams on the payload. Full GET when the query is absent. **Fallback only** (wire down, or enter-room if the wire is not up yet). |
| **`refreshTurns`** | Incremental merge when the face has turns. `!res.ok` / thrown / missing `turns` → keep last. Never `setTurns(data.turns ?? [])` on a bad body. Full GET on enter-room if no wire yet. |
| **`listInitiatives` (no `q`)** | One `initiative` select. **One** `voice_turn` select for those ids: `id, seq, kind, seat_key, reference_turn_id, text` where `kind IN ('user','agent_post')`. Group in memory. `litSeatKeys` / `nextOf` / founding text unchanged. **Do not** call `turnsForInitiative` per row. **Do not** call `artifactNamesForInitiative`. |
| **`listInitiatives` (with `q`)** | Same grain, then filter. One artifact-names query for candidate ids. Poll/fallback does not send `q`. |
| **List stamp** | Named `listAt` on each `backlog` event (ISO). Client keeps it. Reconnect does **not** require `afterListAt` — resume always sends one snapshot (list is small). Optional `afterListAt`: server may skip the snapshot if no initiative/motion row is newer; skip is an optimization, not the no-loss path. Do not mint `initiative.updated_at` this packet (rename-while-down is covered by the resume snapshot). |
| **Last good** | Turns / backlog / ticket / rooms: only replace when `ok` and the array (or ticket object) is present. `loadBacklog` must not `setBacklogRows([])` on catch. No `setBacklogLoading(true)` on a refresh when rows already exist. |
| **Poll / tick** | While the room wire is **open**: do not refetch the whole tape on `streamPollMs`. Queue drain moves onto the wire (above). While the wire is **down**: one catch-up (`/turns?afterSeq=` + cheap list + open ticket) then retry the wire. Foreground `visible`: reconnect the wire now (last `seq`), do not wait for jitter. Keep `resumeSendSounds`. |
| **Enter-room** | Full catch-up (turns + list if door open) then open the wire with that `seq`. 027 stay unchanged. |
| **Rooms index** | Not on this wire. `loadRooms` last-good only. |

### Refuse

- New table. Bus table. New `voice_turn` column.
- Websocket. Second socket product.
- Smarter poll as the product (keep 1–3s whole-tape tick as how a landing shows).
- Remint 012 / 023 / 024 / 027 / 028.
- Hear / Skip buttons.
- Cousin PR. Caps.

---

## 6. Runtime

### Who writes

| Writer | When | What |
|--------|------|------|
| `ensureInitiativeStore` / `migrate.ts` | 029 plant, once | `voice_turn_session_seq_idx`. |
| `insertTurn` | every tape insert | Row + `notifyRoom`. |
| Initiative hold / rename / done | list change | Row + `notifyRoom`. |
| Stream open / close / fail | hang | Stream row + `notifyRoom`. |
| Motion status | backlog in-motion | Row + `notifyRoom`. |
| Room SSE | in-room | LISTEN + emit. May reap this session. |
| Face | apply events | Last `seq`, last `listAt`. No tape write. |

### Who reads

| Reader | What |
|--------|------|
| Room SSE resume | `seq > afterSeq`, cheap list, optional ticket, streams. |
| Log / Voice | `turn` / `stream` events. |
| Backlog door | `backlog` event. |
| Open ticket | `ticket` event + `turn` with that `initiative_id`. |
| Fallback GET | Same grain, only while wire down. |

### Triggers (faceless)

- Tape insert on any request → NOTIFY → wire emits `turn`.
- List write → NOTIFY → `backlog`.
- Stream hang → NOTIFY → `stream`.
- Function `maxDuration` / proxy drop → client reconnects with last `seq`.
- `visibilityState === "visible"` → reopen wire now.
- Failed GET / dropped wire → last good stays.

---

## 7. Ports

| Port | This packet |
|------|-------------|
| `sse` / `sseHeaders` | Real. Reuse. Do not remint send/finalize. |
| `GET /api/session/:id/events` | **Real.** New. Room wire. |
| `pg_notify` / `LISTEN travis_room` | **Real.** Dedicated listen client. Query client only NOTIFYs. |
| Neon session-mode | Real. One listen client per open wire. Release on abort. Do not raise the query pool. |
| `GET /turns?afterSeq=` | Real. Fallback + resume select. |
| `GET /initiatives` cheap list | Real. |
| Send / drain SSE | Real. Request-scoped. Unchanged. |
| Phone `streamPollMs` tape tick | **Stand-in / fallback only** while the wire is down. |
| Websocket | **Refuse.** |
| 028 usable Log | **Other PR.** |

Keys stay server-side. Cookie auth on the events GET (same as `/turns`).

---

## 8. Verify

Walk [`PM-PACKET-013-LIST-LIVE-TEST.md`](./PM-PACKET-013-LIST-LIVE-TEST.md) on psi, phone, room Travis.

1. Log Type. Send `One-line note on the tape.` Do not refresh. Do not wait three seconds. Own line on the right as soon as sent. Reply or Stream when it lands — not after a later refresh.
2. Rooms, then enter Travis again. No hard-refresh. Lines from (1) still there. Nothing missing.
3. Backlog open. Rows, not a blank flash. A new or changed ticket appears without hard refresh.
4. Open ticket. A line lands. Stay. The line is on this ticket.
5. Hard refresh to see a row = miss. Waiting out a poll guess to see a row = miss.
6. Voice: no Hear / Skip buttons.

---

## 9. Out of scope

- Remint 023–027. Hang uniqueness. `link` kind.
- Websocket. Canvas. Rooms-index bus.
- PM-012 / SCP-028 usable Log (#142).
- Hear-queue table. Stay table.
- Planting `src/` from this seat.

---

## 10. Engineer (paste)

On **this PR** ([#144](https://github.com/bywale-com/travis/pull/144)), in this order:

1. Index `voice_turn_session_seq_idx` in `ensureInitiativeStore` + `migrate.ts`.
2. `notifyRoom(sessionId)` after `insertTurn`, initiative hold/rename/done, stream open/close/fail, motion status writes. `pg_notify('travis_room', session_id)` on the query client.
3. `GET /api/session/:id/events` — cookie auth, `afterSeq` / `Last-Event-ID`, optional `ticketId`. Resume turns + one cheap `backlog` + optional `ticket` + `stream`. Then dedicated LISTEN client. `maxDuration = 800`. Heartbeat comments. Abort closes the listen client.
4. While that SSE is open, this session may reap / nudge / timeout dest (existing functions). Those writes notify (or emit in-process).
5. Face: hold the wire in-room. Merge events. Last good on drop. Reconnect with last `seq`. Foreground → reconnect now. **Do not** keep the 1–3s whole-tape tick as the product while the wire is up. Fallback catch-up only while down (`/turns?afterSeq=` + cheap list).
6. `listInitiatives` without per-row `turnsForInitiative`. Recut tests that assume N+1.
7. Last good on backlog / turns / ticket. No loading flash on refresh. No Hear / Skip buttons.
8. Smoke the test sheet. Phone-first Log + Backlog. A landing must not wait out a poll guess.

Do not remint 012 / 023 / 028. Do not mint a cousin. Do not plant a websocket. Do not ship smarter poll as this packet.

Do not send **That’s fine.**
