# Systems change packet 008 — Backlog (initiative → done)

**Number:** `008` — next systems packet is `009`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-03  
**Decision:** **Mint** `travis.initiative` + `initiative_id` on turns (and queued lines). **Keep** Requests as `kind=user`. **Silence** artifacts and heard.  
**Founder lock (2026-09-03):** Backlog is what the founder gives Travis to orchestrate — initiative to done. Requests is every typed line; that door stays. Direct-to-seat is personal. A seat reply lands on that ticket and ends their turn. Mark the chat line. Hold a sent line → write the ticket and feed Travis. Ticket = founding line + one canonical post per finished turn + quiet links/artifacts (attachments stay empty until a later packet).  
**Envelope (not law):** [`ENVELOPE-BACKLOG.md`](./ENVELOPE-BACKLOG.md) on PR [#71](https://github.com/bywale-com/travis/pull/71).  
**Glass (read-only, do not mint from pictures):** [`BACKLOG-FACE.md`](./BACKLOG-FACE.md) · B1 · B3 · B4 · B5. B2 superseded.  
**Builds on:** `origin/main` (`8ab1333` and later) — 007 membership planted. 048 request log. 051 New session-local.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

An initiative is a **row**. It is not every `kind=user` line. It is the pipe the founder handed Travis (or promoted by Hold) from first line to done. Seat posts already answer one send via `reference_turn_id`. A ticket is **many sends**, so that fk is not enough. Stamp `initiative_id` on the founding line, on each pass-on user row, and on the `agent_post` that answers it. Requests stays a query over `kind=user`. Done is a write on the initiative, not a score.

---

## A–N

| | Seam | Decision |
|--|--|--|
| **A** | Identity | **MINT** `travis.initiative`. One row per ticket. Founding line is `founding_turn_id` → `voice_turn`. Do not flag-only on `voice_turn` — `reference_turn_id` is per-send, not per-pipe. |
| **B** | In vs Out | **In** = Travis **passes on** (`send_to_seat` / `dispatch_to_seat`, started or queued). **Out** = founder dest is a Cursor seat — no row. Ticket = the initiative. Dispatch `kind=user` is a **leg**, not a second ticket. Via-Travis recovered by `source='via_travis'` + founding `seat_key='travis'`. |
| **C** | Requests vs Backlog | **Two doors, two queries.** Requests = 048 (`kind=user`). Backlog = `initiative` in this room. Do not recut Requests. |
| **D** | Whose turn | **Derive. Do not store a pipeline.** Usual Travis → PM → SA → Engineer is a default habit, not a CHECK. Next = dest of the latest stamped user row with no `agent_post` yet; else Travis if `status=open`; else none. Stage marks = seats that have a canonical post. A pass with almost nothing is still a post. |
| **E** | Reply lands | Keep `reference_turn_id` (per-send). **Also** copy `initiative_id` onto the `agent_post`. Thoughts never carry it (or ticket query ignores `agent_thought`). |
| **F** | Hold → Initiative | **One write + one feed.** `POST` mints `source='hold'` on that founder `kind=user` row (must not already be on a ticket). Then dest Travis, faceless prompt below. Same HTTP if Travis ever promotes — no Travis-only write. |
| **G** | Mark | **Derived.** Hollow circle on `kind=user` where `initiative_id IS NOT NULL` (founding line and dispatch-looking legs). No chrome-only bit. |
| **H** | Ticket query | Founding turn + latest `agent_post` per cursor `seat_key` on that id + derived Next. No comments table. No priority / due / assignee / score. |
| **I** | Artifacts | **NAMED SILENCE** (001 still). No url/image column. Attachments list is empty. Do not fake URLs. Later packet. |
| **J** | Done | `status='done'`, `done_at=now()`. Founder `PATCH`. Travis `mark_initiative_done` = same write. Last seat post does **not** auto-close. |
| **K** | Heard / New | **Later packet.** 051 stands. Do not mint heard. |
| **L** | Tools | **Mint** `list_initiatives`, `read_initiative`, `mark_initiative_done`. `search_room` unchanged. No promote tool — Hold is the door; pass-on already mints. |
| **M** | Scope | **This room.** `session_id` → `voice_session.id` (007). Cross-room backlog is a later Story. |
| **N** | Number | **008.** Do not reuse 003–007. |

---

## Stood-up truth (quote `origin/main`, not memory)

`voice_turn` has no initiative flag, no ticket fk, no artifact column:

```54:71:src/server/db/schema.ts
export const voiceTurn = travis.table("voice_turn", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  seq: integer("seq").notNull(),
  role: text("role").notNull(),
  kind: text("kind").notNull().default("user"),
  seatKey: text("seat_key"),
  referenceTurnId: uuid("reference_turn_id"),
  // …
});
```

Dispatch writes a **second** `kind=user` row. `seat_key` = dest. `text` = the prompt Travis sent:

```75:76:src/server/dispatch.ts
    if (event?.type === "run_started") {
      const userTurn = await insertUserTurn(sessionId, prompt, seatKey);
```

`insertUserTurn` is `kind=user` only. `absorbStreamingAgentPost` keys the reply on `reference_turn_id` = that user turn — one send, not the pipe.

Requests (048): `isRequestTurn` = `kind === "user"`. `search_room` reads that. **No** request / initiative / backlog / artifact / heard table.

`queued_utterance` = waiting lines. `seat_live_run` = one live Cursor run per binding. `room_membership` = room ↔ agent. Founder is not a membership row.

001: artifacts **named silence**. `src/` has no artifact write.

051: New is session-local. Heard table refused.

---

## Must / must-not

### Must

- Paste the SQL and Drizzle below. Run migrate. No backfill — old rooms start with an empty backlog.
- When Travis `send_to_seat` or `dispatch_to_seat` is accepted (started **or** queued): `ensureInitiative` (via_travis). Stamp `initiative_id` on the founding founder→Travis user row, on the pass-on user row when it is written, and on `queued_utterance` if the line waits.
- Founding turn lookup: latest `kind=user` `seat_key='travis'` in this session (the line Travis is answering). If none, founding_turn_id = the pass-on user row (or wait until insert). One initiative per `founding_turn_id` (UNIQUE).
- Copy `initiative_id` from the answered user turn onto `agent_post` in `absorbStreamingAgentPost` / `insertAgentPostTurn`.
- Drain of a queued line with `initiative_id` stamps the new user turn and later post.
- Hold: `POST /api/sessions/:id/initiatives` `{ foundingTurnId }`. Row must be `kind=user`, this session, `initiative_id` null. `source='hold'`. Then feed Travis (below). 409 if already on a ticket. 400 if ended room.
- Mark: any `kind=user` with `initiative_id`. Index and thread use the same predicate.
- List: `GET /api/sessions/:id/initiatives` — this room, default open. Payload: id, founding text, status, created_at, done_at, source, lit seat_keys (canonical posts), next (derived).
- Read: `GET /api/sessions/:id/initiatives/:initiativeId` — founding turn + canonical posts + next + `attachments: []`.
- Done: `PATCH` `{ status: "done" }`. Same write as the Travis tool.
- Effect parity: Hold, list, read, done are HTTP. Travis tools wrap the same writes/reads.
- Dest of a pass-on must still be an **open member** (007).

### Must-not

- Recut Requests as Backlog. Do not change `search_room` to filter tickets.
- Auto-ticket dest-seat personal talk.
- Auto-done when a seat posts.
- Store pipeline order, priority, due, assignee, score, progress.
- Mint comments / artifact / heard tables this cut.
- Fake attachment URLs.
- Backfill history into tickets.
- Chrome-only mark that the index cannot query.
- Triage / judgment. Done = pipe finished.
- Cross-room index.
- Append PM or SA logs from the plant.
- Plant B1–B5 scenery (Mission/Carbon, oxblood) as machine law — tokens already exist; the **staple** is the row.

---

## Stores

### Add — `travis.initiative`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | |
| `session_id` | uuid fk → `voice_session` | this room |
| `founding_turn_id` | uuid fk → `voice_turn` **UNIQUE** | the founder line that is the ticket |
| `source` | text NOT NULL | `via_travis` \| `hold` |
| `status` | text NOT NULL DEFAULT `open` | `open` \| `done` |
| `created_at` | timestamptz NOT NULL DEFAULT now() | |
| `done_at` | timestamptz nullable | set iff done |

**Constraints**

- `CHECK (source IN ('via_travis', 'hold'))`
- `CHECK (status IN ('open', 'done'))`
- `CHECK ((status = 'open' AND done_at IS NULL) OR (status = 'done' AND done_at IS NOT NULL))`
- UNIQUE (`founding_turn_id`)
- Index `(session_id)` WHERE `status = 'open'`

### Change — `voice_turn`

| Field | Change | Notes |
|-------|--------|--------|
| `initiative_id` | **add** uuid nullable fk → `initiative` | founding user, pass-on user, answering `agent_post` |

Index `(initiative_id)` WHERE NOT NULL.

### Change — `queued_utterance`

| Field | Change | Notes |
|-------|--------|--------|
| `initiative_id` | **add** uuid nullable fk → `initiative` | so drain stamps the same ticket |

### Refuse (008)

- Artifact / attachment table (001 silence).
- Heard / seen table (051).
- `next_seat_key` column (derive).
- Second comments table.
- Recutting `kind=user` into a request entity.
- Cross-session initiative.

---

## SQL — paste into `migrate.ts`

Idempotent. No backfill.

```sql
CREATE TABLE IF NOT EXISTS travis.initiative (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES travis.voice_session(id),
  founding_turn_id uuid NOT NULL REFERENCES travis.voice_turn(id),
  source text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  done_at timestamptz,
  CONSTRAINT initiative_source_chk
    CHECK (source IN ('via_travis', 'hold')),
  CONSTRAINT initiative_status_chk
    CHECK (status IN ('open', 'done')),
  CONSTRAINT initiative_done_at_chk
    CHECK (
      (status = 'open' AND done_at IS NULL)
      OR (status = 'done' AND done_at IS NOT NULL)
    ),
  CONSTRAINT initiative_founding_uniq UNIQUE (founding_turn_id)
);

CREATE INDEX IF NOT EXISTS initiative_open_by_session
  ON travis.initiative (session_id)
  WHERE status = 'open';

ALTER TABLE travis.voice_turn
  ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES travis.initiative(id);

CREATE INDEX IF NOT EXISTS voice_turn_initiative_idx
  ON travis.voice_turn (initiative_id)
  WHERE initiative_id IS NOT NULL;

ALTER TABLE travis.queued_utterance
  ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES travis.initiative(id);
```

Update the migrate console line so it names 008.

---

## Drizzle — paste into `schema.ts`

```ts
export const initiative = travis.table("initiative", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  foundingTurnId: uuid("founding_turn_id")
    .notNull()
    .unique()
    .references(() => voiceTurn.id),
  source: text("source").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

// on voiceTurn
initiativeId: uuid("initiative_id"),

// on queuedUtterance
initiativeId: uuid("initiative_id"),

export type Initiative = typeof initiative.$inferSelect;
export type InitiativeSource = "via_travis" | "hold";
export type InitiativeStatus = "open" | "done";
```

FK from `voice_turn.initiative_id` → `initiative.id` is SQL-only if Drizzle circular-import hurts; the migrate constraint is law.

---

## Runtime

### Derive Next

```text
legs = kind=user AND initiative_id = ? AND seat_key IN cursor seats
  ORDER BY seq
open_leg = last leg that has no agent_post with the same reference_turn_id
if open_leg → Next = that seat_key
else if status=open → Next = travis
else → none
```

Lit stage = distinct `seat_key` of `agent_post` with this `initiative_id` (cursor seats only).

### ensureInitiative (via_travis)

```text
founding = latest kind=user seat_key=travis in session
if founding.initiative_id → reuse that initiative
else if founding exists →
  INSERT initiative (session, founding.id, source=via_travis, status=open)
  UPDATE founding.initiative_id
else →
  INSERT after the pass-on user row exists; founding_turn_id = that row
stamp pass-on user turn + queued_utterance.initiative_id
```

Call from `send_to_seat` and `dispatch_to_seat` after the send/queue is accepted, before return. `pipeOneSend` / `dispatchToSeat` / `enqueueOnSeat` / drain all stamp.

Founder dest Engineer (Out) uses the same insertUserTurn path — **do not** call ensureInitiative there. Only the Travis tool wrappers (and drain of a line that already has `initiative_id`).

### Hold

```text
POST /api/sessions/:id/initiatives  { foundingTurnId }
  → INSERT source=hold; stamp founding turn
  → feed Travis, dest Travis, do not dispatch a seat:
     prompt = "The founder promoted this line to an initiative. Orchestrate it to done.\n\n"
            + founding.text
     Use the existing dest-Travis pipe (text or Live if Voice + dest Travis).
```

### Done

```text
PATCH /api/sessions/:id/initiatives/:initiativeId  { status: "done" }
mark_initiative_done
  → status=done, done_at=now()
  → 409 if already done; 404 wrong room
```

No reopen this cut.

### Mark / index / ticket

```text
mark ⇔ kind=user AND initiative_id IS NOT NULL
index ⇔ initiative WHERE session_id = this room
ticket ⇔ founding turn + canonical posts + next + attachments []
open-in-log ⇔ jump to founding turn id (existing thread jump)
```

---

## Ports / tools

| Port | 008 |
|------|-----|
| SQL + Drizzle | **Real** |
| Pass-on stamp | **Real** — Travis send/dispatch/queue/drain |
| Hold + list + read + done HTTP | **Real** |
| `list_initiatives` | `{ status?: open\|done\|all }` — this room |
| `read_initiative` | `{ id }` — founding + canonical posts + next |
| `mark_initiative_done` | `{ id }` — same as PATCH |
| `search_room` | **Unchanged** |
| Feed on Hold | **Real** dest-Travis pipe |
| Artifacts | **Named silence** |
| Heard | **Named silence** |
| Cross-room backlog | **Named silence** |

---

## Verify

1. Migrate twice. Empty `initiative` table. Requests door still lists every `kind=user`.
2. Dest Engineer, founder line, no Travis — no mark, no ticket.
3. Dest Travis, “send this to PM…” — Travis dispatch → one initiative, mark on the Travis line and on the dispatch-looking user row, index shows Next · PM (or whatever dest).
4. PM `agent_post` lands — ticket shows that post; Next becomes Travis (or the next dest Travis actually sent).
5. Hold an Out line → ticket + Travis is fed the founding text. 409 if you Hold it again.
6. Done from HTTP and from Travis tool — `done_at` set; index default hides it (list open).
7. `search_room` still returns Out lines and unmarked Travis chat.
8. No attachment URLs. Refresh still forgets New (051).
9. No `CURSOR_API_KEY` on the client.

---

## Out of scope

- Artifact / image store (001).
- Heard / R1 (051).
- Cost panel.
- Create-agent.
- Cross-room backlog.
- Reopen / delete ticket.
- Planting plate chrome as a second product.

---

## Engineer handoff

Paste SQL + Drizzle. Wire `ensureInitiative` only on Travis pass-on. Wire Hold / list / read / done. Derive Next. Leave Requests and `search_room` alone. Do not mint artifacts or heard. Do not append the SA or PM logs. Do not plant from the plates.
