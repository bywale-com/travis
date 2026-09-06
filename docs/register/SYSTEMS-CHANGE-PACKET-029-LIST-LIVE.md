# SYSTEMS-CHANGE-PACKET-029 — Lists show now

**Number:** `029` — next systems packet is `030`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#144](https://github.com/bywale-com/travis/pull/144)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-06  
**PM packet:** [`PM-PACKET-013-LIST-LIVE.md`](./PM-PACKET-013-LIST-LIVE.md)  
**Test:** [`PM-PACKET-013-LIST-LIVE-TEST.md`](./PM-PACKET-013-LIST-LIVE-TEST.md)  
**FACE (look, do not mint from PNG):** no new plates. Staples on living glass — Backlog **title** (index row and open ticket share it) · **lit** seats / **next** · room **title** on the index ([`SELECT-ROOM-FACE.md`](./SELECT-ROOM-FACE.md) L1) · Log tape. [`HOTFIX-057-BACKLOG-PLATES.md`](./HOTFIX-057-BACKLOG-PLATES.md) B1 / B6.  
**Prior (do not remint):** **023** poll + SSE silence · **010** `travis.initiative` · **013** motion · **026** ticket read · **027** stay / heard · **012** OS house · **028** reserved for PM-012 on [#142](https://github.com/bywale-com/travis/pull/142)  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## 1. Intent

The phone already polls (023, 1–3s jitter). The tick downloads the whole `voice_turn` tape. Backlog is not on that tick; `listInitiatives` walks every ticket’s turns; a failed fetch **empties** the list. An open ticket and the rooms index are one-shot. This cut keeps the poll. Incremental tape after last `seq`. Backlog list is a list grain (title, status, lit, next) — one query, not N `turnsForInitiative`. The tick paints the **open door**. A failed GET keeps the last good rows. Foreground → one tick now. No new table. No websocket.

---

## 2. Story

### Must

- Lists he is looking at update without hard refresh: Log tape, Backlog index, open ticket, rooms index.
- Failed fetch does not blank the glass. Last good rows stay.
- Turns after the last `seq` on the tick. Merge. Full GET on enter-room and hard refresh only.
- Backlog list paint does not load every ticket’s messages.
- Opening a ticket still loads that thread. While that ticket is open, the tick refreshes **that** ticket.
- App returns to the foreground → one tick now, not after the next jitter.
- Same 1–3s `streamPollMs` jitter. Queue drain on the room tick stays.

### Must-not

- Remint 023 tables. Invent a websocket / SSE / LISTEN/NOTIFY this packet (023 silence stands).
- Remint 012 / 028. Remint `heard_at`, `reference_turn_id`, `travis.stream`, stay.
- New table. New `voice_turn` column. New initiative column for lit/next.
- Put Hear it / Skip **buttons** back (027).
- `setBacklogRows([])` / `setTurns([])` / `setRooms([])` because one fetch died or the body lacked the array.
- Invent product caps. Cousin PR.

### Chain

023 poll exists → tick covers the **open door** → incremental `voice_turn.seq` merge on the tape → cheap initiative list (title / status / lit / next) → ticket GET only while that ticket is open → rooms GET while on the index → failed GET keeps last good → visibility visible → tick now.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **SSE / LISTEN/NOTIFY** | 023. Poll this packet. If the cheap list is still slow after plant, that bus is the next cut. |
| **`voice_turn` in-place mutate (except streaming thought)** | No `updated_at`. Incremental is `seq > afterSeq`. Heard / stamp on an old row wait for enter-room / hard refresh. |
| **Cross-device list** | This phone’s last good. Not a shared cursor row. |
| **028 / usable Log** | PM-012 on #142. Do not remint here. |
| **Hear / Next / Skip as a table** | 007 / 027. Spoken invites stay. Buttons stay off. |
| **022** | Stand. |

---

## 3. Requirements (extraction)

From PM-013 + founder 14:48. Not a second invention.

1. Tick paints the open door. Do not wait for hard refresh.
2. Failed GET keeps last good rows.
3. Turns after last `seq`. Merge. Full GET on enter-room and hard refresh only.
4. Backlog list is titles, status, who is lit — not every thread.
5. Foreground → tick now.
6. No websocket this cut.

Plate staples (not scenery):

- Ticket **title** — same string on B1 and the open ticket.
- **Lit** seats and **next** (who is waiting).
- Room **title** on the index.
- Log tape rows (the messages).

Do not build from scenery: “Untitled”, “Loading…”, “Nothing Travis is orchestrating yet.”, L1 `Om` / “another codebase”.

---

## 4. Stood-up truth (quote, do not remint)

### Poll

```167:169:src/lib/stream.ts
/** Phone poll: 1–3s jitter. No new bus. */
export function streamPollMs(random = Math.random()): number {
  return 1000 + Math.floor(random * 2000);
```

Room tick (`Room.tsx` L480–531): GET queue, then `refreshTurns(sid)` (whole tape), then drain. `catch { /* next tick retries */ }`. No backlog. No ticket. No rooms. Effect deps `session?.id` — **rooms index never ticks**.

023: “Phone keeps 1–3s jitter poll. **SSE / LISTEN/NOTIFY is named silence**.”

### Turns GET — whole tape

```20:24:src/app/api/session/[id]/turns/route.ts
    const turns = await db
      .select()
      .from(voiceTurn)
      .where(eq(voiceTurn.sessionId, id))
      .orderBy(asc(voiceTurn.seq));
```

Also `attachmentsForTurns(id)` (every artifact in the session), `listMotionCards`, `listSessionStreams`.

`voice_turn.seq` is `integer notNull` (`schema.ts` L64). No `(session_id, seq)` index. `voice_turn_initiative_idx` exists (`initiative.ts` L81–83).

`refreshTurns` (`Room.tsx` L414–418):

```
const nextTurns = (data.turns ?? []) as Turn[];
setTurns(nextTurns);
```

No `res.ok` guard. A 5xx / empty body **blanks** the tape. Tick catch only covers thrown fetch.

Enter-room full GET: `attachSession` resume → `refreshTurns` (`Room.tsx` L1801, L1807). Hard refresh is that path (027 stay).

### Backlog — N+1 + wipe

`GET /api/session/:id/initiatives` → `listBacklog` → `listInitiatives` (`motion.ts` L410–423).

```673:708:src/server/initiative.ts
  const out: InitiativeListItem[] = [];
  for (const row of rows) {
    const turns = await turnsForInitiative(row.id);
    // founding, posts, litSeatKeys, nextOf, optional q over every text
  }
```

`turnsForInitiative` selects the ticket’s full `voice_turn` rows (`initiative.ts` L568–581). `q` also calls `artifactNamesForInitiative` per hit.

`loadBacklog` (`Room.tsx` L907–937): `status=all`, no `q`. `catch { setBacklogRows([]); }`. Missing `items` / `initiatives` → `setBacklogRows([])`. `setBacklogLoading(true)` on every call.

`openTicket` is one-shot `GET .../initiatives/:id`. Catch keeps last ticket. Not on the tick.

List grain already on the row (`InitiativeListItem`): `title`, `status`, `foundingText`, `litSeatKeys`, `next`, `createdAt`. Face paints title · next word · `SeatMark` for lit (`BacklogIndex.tsx` L290–356). `litSeatKeys` / `deriveNext` need post/leg **ids and seat keys**, not message bodies (`src/lib/initiative.ts`).

`listMotions` is already one `motion` select + `stepsForMotions` (`motion.ts` L388–401). Keep it.

### Rooms — one-shot

`loadRooms` (`Room.tsx` L1842–1847): GET `/api/rooms` → `listRoomsForOperator` (already cheap: sessions + members + lastAt). `setRooms(Array.isArray(data.rooms) ? data.rooms : [])` **then** throw if `!res.ok` — a failed body can empty the index. Mount only (`L2034–2048`). No poll.

### Foreground

```566:572:src/components/Room.tsx
    const onVis = () => {
      if (document.visibilityState === "visible") resumeSendSounds();
    };
    document.addEventListener("visibilitychange", onVis);
```

Sounds only. No tick.

---

## 5. Stores / fields / contracts

### Add — no new table. No new column.

| What | Law |
|------|-----|
| **`voice_turn_session_seq_idx`** | Index only. Signed SQL below. Isolate-once in `ensureInitiativeStore` **and** `migrate.ts`. Serves `afterSeq`. |

Signed SQL:

```sql
CREATE INDEX IF NOT EXISTS voice_turn_session_seq_idx
  ON travis.voice_turn (session_id, seq);
```

Do not remint `voice_turn`. Do not add `updated_at`. Do not mint a list-cursor table.

### Change — runtime (existing columns / contracts)

| What | Law |
|------|-----|
| **`GET /api/session/:id/turns`** | Optional `afterSeq` (integer). Absent / unparsable → full tape (today). Present → `session_id = id AND (seq > afterSeq OR thought_status = 'streaming')`, `orderBy seq`. Attachments: only for returned turn ids (do not rescan the whole session’s `turn_artifact` on the incremental path). Cards + streams: still return (small). |
| **`refreshTurns`** | If the face already has turns: `?afterSeq=` = max `seq` on the face. Merge by id (incoming replaces). Append new ids. Do not drop a row the delta omitted. Full GET (no query) on enter-room resume and on a real reload. `!res.ok` / thrown / missing `turns` array → **keep last**. Never `setTurns(data.turns ?? [])` on a bad body. |
| **`listInitiatives` (no `q`)** | One `initiative` select (today). **One** `voice_turn` select for those ids: `id, seq, kind, seat_key, reference_turn_id, text` where `kind IN ('user','agent_post')`. Group in memory. `litSeatKeys` / `nextOf` / founding text unchanged. **Do not** call `turnsForInitiative` per row. **Do not** call `artifactNamesForInitiative`. |
| **`listInitiatives` (with `q`)** | Same one-shot grain, then filter. One artifact-names query for the candidate ids (not per row). Spoken `list_initiatives` keeps `q`. Poll does not send `q`. |
| **`listBacklog`** | Still `listMotions` + this list. `in_motion` unchanged. |
| **Last good — backlog** | `loadBacklog`: only `setBacklogRows` when `res.ok` and `items` (or `initiatives`) is an array. `catch` / `!ok` / missing array → keep last. First paint with no last good may stay empty. Do not `setBacklogLoading(true)` on a poll refresh when rows already exist (no “Loading…” flash). |
| **Last good — rooms** | Only `setRooms` when `res.ok` and `rooms` is an array. `catch` / `!ok` / missing array → keep last. |
| **Tick — open door** | Same `streamPollMs` scheduler. Branch on what he is looking at: **Log / Voice (in room)** → queue (today) + incremental turns. **`door === "backlog"` and no ticket** → cheap list. **ticket open** → `GET .../initiatives/:id` (keep last on fail; already). **`plate === "index"`** → rooms list. Do not wait for `session?.id` to poll rooms. Do not refetch a closed door. |
| **Foreground** | Existing `visibilitychange`: when `visible`, run **one tick now** (same function as the scheduler). Keep `resumeSendSounds`. |

### Refuse

- New table. New `voice_turn` / `initiative` column. List-cursor / watermark store.
- Websocket, SSE bus, `LISTEN/NOTIFY`.
- Remint 012 / 023 / 026 / 027 / 028.
- Hear / Skip buttons.
- Caps. Cousin PR.

---

## 6. Runtime

### Who writes

| Writer | When | What |
|--------|------|------|
| `ensureInitiativeStore` / `migrate.ts` | 029 plant, once | `voice_turn_session_seq_idx`. |
| Existing pipe | dest / user / absorb | `voice_turn` inserts (`seq` grows). Unchanged. |
| Face tick | jitter / foreground | GET only. No tape write. |

### Who reads

| Reader | What |
|--------|------|
| Log / Voice | Incremental turns + cards/streams. Merge. |
| Backlog index | Cheap list grain. |
| Open ticket | `readInitiative` (full thread). |
| Rooms index | `listRoomsForOperator`. |

### Triggers (faceless)

- New `voice_turn` insert → next incremental tick paints it on Log.
- New / renamed / done initiative → next backlog tick paints the row.
- New dest line on the open ticket → next ticket GET paints Messages.
- New / renamed room → next index tick paints the row.
- `visibilityState === "visible"` → one tick now.
- Failed GET → last good stays. Next tick retries.

---

## 7. Ports

| Port | This packet |
|------|-------------|
| 023 `streamPollMs` | Real. Same jitter. |
| `GET /turns` | Real. Add `afterSeq`. |
| `GET /initiatives` | Real. Cheap list, no N+1. |
| `GET /initiatives/:id` | Real. Ride the tick while open. |
| `GET /api/rooms` | Real. Ride the tick on the index. |
| SSE / LISTEN | **Silence.** Do not plant. |
| 028 usable Log | **Other PR.** Do not remint. |

No new Cursor puppet. Keys stay server-side.

---

## 8. Verify

Walk [`PM-PACKET-013-LIST-LIVE-TEST.md`](./PM-PACKET-013-LIST-LIVE-TEST.md) on psi, phone, room Travis.

1. Log Type. Send `One-line note on the tape.` Do not refresh. Own line on the right, then reply or Stream, within one poll beat. Hard refresh to see it = miss.
2. Open Backlog. Rows, not a long blank. A new or changed ticket appears without hard refresh.
3. Open one ticket. Dest that ticket (or land a line). Do not leave. The new line shows.
4. Backlog with rows. Wait one poll. List does not flash empty.
5. Kill the initiatives GET (or 500). List stays. Rooms: same — a dead `/api/rooms` does not empty the index.
6. Background the tab, come back. One tick now (list/tape moves without waiting the next jitter).
7. Voice: no Hear / Skip buttons.

---

## 9. Out of scope

- Remint 023–027. Hang uniqueness. `link` kind.
- SSE / job bus. Canvas.
- PM-012 / SCP-028 usable Log (#142).
- Hear-queue table. Stay table.
- Planting `src/` from this seat.

---

## 10. Engineer (paste)

On **this PR** ([#144](https://github.com/bywale-com/travis/pull/144)), in this order:

1. Index `voice_turn_session_seq_idx` in `ensureInitiativeStore` + `migrate.ts`. Do not remint the table.
2. `GET /turns?afterSeq=`. Incremental select + attachments for those ids. Cards/streams stay on the payload. Full GET when the query is absent.
3. `refreshTurns`: incremental merge when the face has turns. Full GET on enter-room. Last good on fail. Never blank from `?? []`.
4. `listInitiatives` without per-row `turnsForInitiative`. One grain query. `q` uses the same grain + one artifact-names query. Recut tests that assume N+1.
5. Tick paints the open door: incremental turns in-room; cheap backlog when that door is open; ticket GET while a ticket is open; rooms list on the index (tick without `session.id`).
6. Last good on backlog and rooms. No loading flash on poll refresh. `visibilitychange` → one tick now.
7. Smoke the test sheet. Phone-first Log + Backlog. Do not put Hear / Skip buttons back.

Do not remint 012 / 023 / 028. Do not mint a cousin. Do not plant a websocket.

Do not send **That’s fine.**
