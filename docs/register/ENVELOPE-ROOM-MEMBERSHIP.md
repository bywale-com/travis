# Envelope — room membership store (Engineer → SA)

**Kind:** Envelope. **Not a packet. Not a hotfix. Not planted.**
**Seat:** Engineer drafted the exact SQL the founder asked for. SA ascribes, then **signs / amends / refuses**. Engineer does not mint this table. Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG from this file.
**When:** 2026-09-02. Founder lock: *room membership lives in our schema.*
**SQL:** [`PROPOSED-ROOM-MEMBERSHIP.sql`](./PROPOSED-ROOM-MEMBERSHIP.sql) — not wired into `src/server/db/migrate.ts`.

---

## SA prompt — paste this into a Systems Analyst chat

```text
You are Travis’s Systems Analyst. Read docs/README.md “Systems Analyst — identity” and accept it. You are not the Product Manager. You are not the Engineer. Talk with the founder only. Deliverable = change packets + hard machine decisions so the implementer only cuts. Keep docs/register/SYSTEMS-ANALYST-LOG.md (append-only; only Current moves). Read Current at the top, then the newest stamp at the bottom. Product flag in PHASE-ONE-LOG is read-only. Quote stood-up truth from migrations/SQL and live ports, not memory. Do not mint tables from pictures. Founder speaks modules; you map to tables and run contracts. Detailed: docs/seats/SYSTEMS-ANALYST.md.

Founder lock (2026-09-02), job-law from me, not from Engineer or PM:

  Room membership lives in our schema — a relation between a room and
  an agent, carrying a role and a joined-at. Not Cursor metadata.

Rooms are now the primitive. Agents are unbounded. Anything Travis can
do, I must also be able to do by hand (effect parity, not surface parity).

Engineer drafted exact SQL. They have not run it. They have not added it
to migrate.ts. Your job: ascribe against stood-up truth, then sign,
amend, or refuse. If you sign, cut a change packet so Engineer only pastes.

Read, in this order:

1. This chat's seat identity (above).
2. docs/register/SYSTEMS-ANALYST-LOG.md — Current, then newest stamp.
3. src/server/db/schema.ts and src/server/db/migrate.ts — quote them.
4. docs/register/SYSTEMS-CHANGE-PACKET-002-ROOM.md — what 002 already minted.
5. docs/register/ENVELOPE-ROOM-MEMBERSHIP.md — Engineer's proposed grain.
6. docs/register/PROPOSED-ROOM-MEMBERSHIP.sql — the exact statements.
7. Glass (read-only, do not mint from pictures):
   docs/register/ENVELOPE-ROOMS-AND-AGENTS.md
   docs/register/PLATES-2026-09-02.md
   (those two live on the rooms-envelope branch if they are not on main)

Stood-up truth you must quote, not remember:

  travis.agent_binding is global. seat_key is UNIQUE. Four rows:
  pm, sa, engineer, travis.

  travis.voice_session is today's room. It has no title. It points at
  default_binding_id and active_binding_id. Open/resume is by client_ip
  (Hotfix 014). End sets ended_at.

  Seats on the glass come from every active agent_binding row, not from
  a per-room list. src/app/api/session/route.ts roomSeats() is the read.

  travis.seat_live_run is PRIMARY KEY (binding_id) — at most one live
  Cursor run per agent across all sessions.

  travis.queued_utterance is already session-scoped.

Engineer proposes, and asks you to lock or strike each line:

  A. Do not mint a second room table. The room is voice_session.id.
     Add voice_session.title text NOT NULL DEFAULT '' for the index.
     Empty title is legal. Backfill invents no names.

  B. Mint travis.room_membership:
       id            uuid pk
       session_id    fk → voice_session
       binding_id    fk → agent_binding
       role          text NOT NULL DEFAULT 'member'
                     CHECK (role IN ('member', 'facilitator'))
       joined_at     timestamptz NOT NULL DEFAULT now()
       left_at       timestamptz nullable
                     CHECK (left_at IS NULL OR left_at >= joined_at)
     Partial unique (session_id, binding_id) WHERE left_at IS NULL.
     Partial unique (session_id) WHERE left_at IS NULL AND role = 'facilitator'.
     Leave then rejoin = a new row.

  C. Travis is facilitator in every room he is in. Everyone else is member.
     Do not mint host / owner / added_by / sort_order.

  D. Backfill: every active binding × every existing session. joined_at =
     session.created_at. left_at = session.ended_at. That matches today's
     implicit "everyone is in every room."

  E. agent_binding.seat_key stays globally unique this cut. New agents
     get a unique slug. Room-local aliases are a later field if you want
     two "Engineers" in one room.

  F. Do not remint seat_live_run, do not drop session binding_id /
     default_binding_id / active_binding_id, do not add model / repo /
     ref on agent_binding (that is the create-agent packet).

  G. Founder Leave ≠ End. End writes session.ended_at and left_at on
     every open membership. Leave is the founder detaching from the
     glass — the founder is not an agent_binding row, so Leave does
     not write membership. Name that silence or mint a presence field.

  H. Packet number: official SA packets on disk are 001 and 002.
     Engineer branches named scp-003…006 were hotfixes, not your
     packets. Next unused SA number is 003 unless you remap.

If you sign: cut docs/register/SYSTEMS-CHANGE-PACKET-00X-ROOM-MEMBERSHIP.md
with Intent, Must / must-not, Stores (add / change / refuse), Runtime
(who writes, who reads, End / Leave / add / remove / create-room),
Ports, Verify, Out of scope. Stamp the SA log. Engineer then pastes the
SQL into migrate.ts and the Drizzle grain into schema.ts. Nothing else.

If you amend: rewrite the SQL in the packet. Engineer pastes yours, not this.

If you refuse: name the silence and what Story must be promoted first.
```

---

## Founder locks this envelope is under

Quoted, not restated as a generated list.

> room membership lives in our schema

Envelope of the same night ([`ENVELOPE-ROOMS-AND-AGENTS.md`](./ENVELOPE-ROOMS-AND-AGENTS.md), rooms-envelope branch): *a relation between a room and an agent carrying a role and a joined-at.* Cursor `CloudAgentOptions.metadata` was the rejected home.

Parity law, same night: any effect Travis can cause, the founder can cause by hand. Labor is not an effect. Reachable by hand does not mean on the main glass.

Glass that already assumes this relation exists (do not mint from the pictures): room index, create a room, roster, create an agent — V1–V4 on [`PLATES-2026-09-02.md`](./PLATES-2026-09-02.md). Hotfix 044 planted marks and tokens only; it named this store as **SA has not ascribed**.

---

## Stood-up truth (quoted)

`travis.agent_binding` — global agent, unique `seat_key`:

```14:24:src/server/db/schema.ts
export const agentBinding = travis.table("agent_binding", {
  id: uuid("id").defaultRandom().primaryKey(),
  seatKey: text("seat_key").notNull().unique(),
  label: text("label").notNull(),
  cursorAgentId: text("cursor_agent_id").notNull().default(""),
  runtime: text("runtime").notNull().default("cloud"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

`travis.voice_session` — today's room. No title. No membership.

```26:51:src/server/db/schema.ts
export const voiceSession = travis.table("voice_session", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Legacy — mirrors active_binding_id after SCP-002 */
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  defaultBindingId: uuid("default_binding_id")
    .notNull()
    .references(() => agentBinding.id),
  activeBindingId: uuid("active_binding_id")
    .notNull()
    .references(() => agentBinding.id),
  // …
  endedAt: timestamp("ended_at", { withTimezone: true }),
});
```

Roster read today is every active binding, not a room's list — `roomSeats()` in `src/app/api/session/route.ts`.

`travis.seat_live_run.binding_id` is the primary key. One live Cursor run per agent, across all rooms. `queued_utterance` is already `(session_id, binding_id, seq)`.

---

## Proposed grain (sign, amend, or refuse)

### Add — `voice_session.title`

| Field | Type | Notes |
|-------|------|--------|
| `title` | text NOT NULL DEFAULT `''` | Room name for the index. Empty is legal. Backfill invents nothing. |

Refuse a parallel `travis.room` table. Two identities for one room is the failure. Rename later if Story demands the word `room` on the table; do not mint a twin now.

### Add — `travis.room_membership`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | |
| `session_id` | uuid fk → `voice_session` | the room |
| `binding_id` | uuid fk → `agent_binding` | the agent |
| `role` | text NOT NULL DEFAULT `member` | `member` \| `facilitator` |
| `joined_at` | timestamptz NOT NULL DEFAULT now() | |
| `left_at` | timestamptz nullable | null = in the room |

**Constraints**

- `CHECK (role IN ('member', 'facilitator'))`
- `CHECK (left_at IS NULL OR left_at >= joined_at)`
- Unique open pair: `(session_id, binding_id) WHERE left_at IS NULL`
- Unique open facilitator: `(session_id) WHERE left_at IS NULL AND role = 'facilitator'`

**Role law.** Travis is `facilitator`. Every other binding is `member`. Do not mint `host`, `owner`, `added_by`, or `sort_order` in this cut. Roster order can be `joined_at` or `seat_key` until Story asks for a stored order.

**Rejoin.** Leave writes `left_at`. Rejoin inserts a new row. History stays.

**Who is not a row.** The founder is not an `agent_binding`. Membership is room ↔ agent. Founder Leave does not write this table.

### Backfill

Every **active** `agent_binding` × every `voice_session`. `joined_at = created_at`. `left_at = ended_at`. Travis rows get `facilitator`. Matches the implicit law the app already runs: everyone is in every room.

Re-run safe: skip any `(session_id, binding_id)` that already has a membership row.

### Unchanged

- `agent_binding.seat_key` unique.
- `voice_session.binding_id` / `default_binding_id` / `active_binding_id`.
- `seat_live_run` primary key. Name it as a follow-on: two rooms cannot both run the same Engineer until that key changes. Do not silently remint it here.
- Create-agent columns (`model`, `repo`, `ref`) — next packet, not this one.

---

## Exact Drizzle to paste after sign (not applied)

```ts
// on voiceSession
title: text("title").notNull().default(""),

export const roomMembership = travis.table("room_membership", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  leftAt: timestamp("left_at", { withTimezone: true }),
});

export type RoomMembership = typeof roomMembership.$inferSelect;
export type MembershipRole = "member" | "facilitator";
```

Partial unique indexes stay SQL-only unless SA wants them expressed in Drizzle.

---

## Runtime this store implies (for the packet — not planted)

| Event | Write |
|-------|--------|
| Create room | `INSERT voice_session` with `title`; `INSERT` memberships for the chosen bindings; always `INSERT` Travis as `facilitator` |
| Add agent | `INSERT room_membership` (`member`, `joined_at = now()`, `left_at` null) |
| Remove agent | `UPDATE left_at = now()` on the open row. Refuse removing the open facilitator, or reassign first |
| End room | `voice_session.status = ended`, `ended_at = now()`, `left_at = now()` on every open membership |
| Leave (founder) | no membership write. Name presence / IP-resume vs room-index as a silence or a later field |
| Open / roster read | `room_membership` where `session_id = ? AND left_at IS NULL`, join `agent_binding` — **replaces** `roomSeats()` |

Create agent remains `INSERT agent_binding` (+ Cursor `Agent.create`). That row is not in a room until a membership is written. Two controls, two writes. Parity: both reachable by hand (V3 / V4).

---

## Refusals (Engineer will not invent these)

- A `room` table beside `voice_session`.
- Founder as a membership row.
- `added_by`, `sort_order`, `display_color` — seat tint is already a hash of `seat_key`.
- Dropping `seat_key` uniqueness.
- Reminting `seat_live_run`.
- Model / repo / ref on this cut.
- Wiring `roomSeats()` to the new table before the packet exists.
- Running the SQL.

---

## What SA must return

A change packet the Engineer can paste without leftover analysis, **or** a refusal that names the silence. Sign-off is the packet plus a stamp, not a chat “lgtm.”
