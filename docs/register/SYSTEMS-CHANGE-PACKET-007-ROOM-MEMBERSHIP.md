# Systems change packet 007 — Room membership

**Number:** `007` — next systems packet is `008`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-03  
**Decision:** **Sign** Engineer SQL. **Amend** runtime (new rooms, dest, End). **Remap** H (this is not 003).  
**Founder lock (2026-09-02):** room membership lives in our schema — a relation between a room and an agent, carrying a role and a joined-at. Not Cursor metadata. Rooms are the primitive. Agents are unbounded. Effect parity, not surface parity.  
**Proposal (not law):** [`ENVELOPE-ROOM-MEMBERSHIP.md`](./ENVELOPE-ROOM-MEMBERSHIP.md) + [`PROPOSED-ROOM-MEMBERSHIP.sql`](./PROPOSED-ROOM-MEMBERSHIP.sql) on PR [#59](https://github.com/bywale-com/travis/pull/59).  
**Glass (read-only, do not mint from pictures):** [`ENVELOPE-ROOMS-AND-AGENTS.md`](./ENVELOPE-ROOMS-AND-AGENTS.md) · [`PLATES-2026-09-02.md`](./PLATES-2026-09-02.md) on PR [#57](https://github.com/bywale-com/travis/pull/57). This packet houses **title + membership + create / add / remove / End writes**. V4 create-agent is out.  
**Builds on:** `origin/main` schema + migrate (quoted below). SCP-002 room. Hotfix 014 IP resume.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

A room is `travis.voice_session.id`. Who is in it is `travis.room_membership` — room ↔ agent, role, joined-at, optional left-at. The glass roster and every send dest read that relation. They do not read “every active `agent_binding`.” Existing rooms keep today’s implicit cast via backfill. New rooms write only the members the create call names, plus Travis as facilitator.

---

## A–H (lock or strike)

| | Engineer ask | Decision |
|--|--|--|
| **A** | No second room table. Room = `voice_session.id`. Add `title text NOT NULL DEFAULT ''`. Empty legal. Backfill invents no names. | **SIGN** |
| **B** | Mint `room_membership` with the CHECKs and partial uniques in the proposed SQL. Leave+rejoin = new row. | **SIGN** — paste the SQL below as written |
| **C** | Travis = facilitator in every room he is in. Everyone else member. No host / owner / added_by / sort_order. | **SIGN**. Refuse removing the open facilitator. Travis cannot be removed while he is that facilitator. |
| **D** | Backfill: every **active** binding × every **existing** session. `joined_at = session.created_at`. `left_at = session.ended_at`. Travis → facilitator. Idempotent `NOT EXISTS` any membership row for that pair. | **SIGN the backfill SQL** (existing rows only). **AMEND runtime:** a **new** room does **not** cross-join everyone. Create writes **chosen members + Travis facilitator**. After plant, roster read is open memberships, not all bindings. |
| **E** | `seat_key` stays globally unique. New agents get a unique slug. Room-local aliases later. | **SIGN**. Create-agent columns (`model` / `repo` / `ref`) stay out. |
| **F** | Do not remint `seat_live_run`. Do not drop session `binding_id` / `default_binding_id` / `active_binding_id`. No model/repo/ref on binding. | **SIGN**. **Name follow-on:** two rooms cannot both run the same Engineer until `seat_live_run` PK changes. **AMEND dest:** `default_binding_id` and `active_binding_id` must be an **open member** of that session. Refuse send / queue / address / finalize dest to a binding that is not an open member. |
| **G** | Founder Leave ≠ End. End writes `ended_at` + `left_at` on every open membership. Founder is not an `agent_binding`; Leave does not write membership. | **SIGN the silence.** Do **not** mint founder presence / a Leave field this cut. Leave is glass-only until a later packet. End = close session + close all open memberships. |
| **H** | Next SA number is 003 unless remap. | **STRIKE / REMAP.** Do not reuse 003. **This packet is 007.** See remap in the SA log. |

**IP vs many rooms (not in A–H; lock here):** `client_ip` stays. Auto-resume = latest non-ended session for that IP (Hotfix 014). Do not mint `last_used_at`. A room index (V1) is the later control to pick another room. Two live rooms for one IP are legal after explicit create; `liveSessionForIp` still returns the newest.

---

## Stood-up truth (quote `origin/main`, not memory)

`travis.agent_binding` is global. `seat_key` unique. Four seed rows in `migrate.ts`: `pm`, `sa`, `engineer` (cloud ids hardcoded there), `travis` (empty Cursor id).

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

`travis.voice_session` is today’s room. **No title.** FKs: `binding_id`, `default_binding_id`, `active_binding_id` → `agent_binding`. Also `view_mode`, `log_submode`, `router_state`, `status`, `client_ip`, `travis_live_handle`, `created_at`, `ended_at`.

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

Roster today is every active binding, not a per-room list:

```48:56:src/app/api/session/route.ts
async function roomSeats() {
  const rows = await db
    .select({
      seatKey: agentBinding.seatKey,
      label: agentBinding.label,
    })
    .from(agentBinding)
    .where(eq(agentBinding.active, true));
  return sortRoomSeats(rows);
}
```

IP resume (Hotfix 014): `liveSessionForIp` = latest `status <> 'ended'` for `client_ip`, or stamp a single empty-IP live session.

`travis.seat_live_run` PK is `binding_id` — at most one live Cursor run per agent across all sessions.

`travis.queued_utterance` is already `(session_id, binding_id, seq)`.

SCP-002 minted session + bindings + turn kinds. One implicit room. It did **not** mint membership or title.

---

## Must / must-not

### Must

- Paste the SQL in this packet into `src/server/db/migrate.ts` and run migrate. Do not invent a second room table.
- Paste the Drizzle grain in this packet into `src/server/db/schema.ts`.
- After plant, every roster / `seats` payload reads **open** `room_membership` for that `session_id` (`left_at IS NULL`), joined to `agent_binding`.
- Every new `voice_session` insert writes memberships in the same request (same transaction if the driver allows). A session with zero open members is a bug.
- Create-room (explicit): insert the **chosen** bindings as `member` plus Travis as `facilitator`. Do not add the rest of the catalog.
- Phone `POST /api/session` with no create body: resume per 014; if it **creates**, stand-in cast = **all currently active bindings** (Travis included → facilitator). This stand-in exists so the phone face does not open an empty room before V2 is planted. It is not the law for explicit create.
- `default_binding_id` / `active_binding_id` / `binding_id` on create: first chosen **member** (not Travis) if any, else Travis. Stand-in create keeps today’s `getPmBinding()` when that PM row is an open member; otherwise first open member, else Travis.
- Send, queue, address, finalize, and Travis `send_to_seat` / `dispatch_to_seat`: dest binding must be an **open member**. If not, 400 and no Cursor run.
- Call-by-name / `@` dest that is not an open member: do not switch, do not send.
- End (`PATCH` `status=ended` and Travis `end_session`): set `status='ended'`, `ended_at=now()`, clear `travis_live_handle`, and set `left_at=now()` on every open membership for that session.
- Remove agent: `UPDATE left_at = now()` on the open row. Refuse if `role='facilitator'` (409). If the removed binding was `active` or `default`, repoint those FKs (and `binding_id`) to the first remaining open member, else Travis.
- Add agent: insert a new row (`member`, `joined_at=now()`, `left_at` null). If an open row for that pair exists, 409. Rejoin after leave = new row. Adding Travis to a room that has no open facilitator: insert Travis as `facilitator`. Do not add a second open facilitator.
- List rooms for the index: sessions stamped with this `client_ip` (include ended). Return `id`, `title`, `created_at`, `ended_at`, `status`, and open-member labels. Do not invent names for empty titles.
- Effect parity: create / add / remove / End are reachable by hand on HTTP. Travis already ends; add Travis create/add/remove **tools only if** those tools already exist or you add them in this plant — if Travis can do it, the HTTP port must do the same write. Do not add Travis-only writes.

### Must-not

- Mint `travis.room` beside `voice_session`.
- Mint founder presence, Leave field, `last_used_at`, `added_by`, `host`, `owner`, `sort_order`, `display_color`, cost, model / repo / ref.
- Remint or drop `seat_live_run`.
- Drop `binding_id` / `default_binding_id` / `active_binding_id`.
- Cross-join the catalog onto a **new** room (except the phone stand-in create above).
- Point dest at a binding that is not an open member (including leftover PM default when PM was not chosen).
- Write membership on founder Leave / navigate-away / refresh.
- Treat Cursor `metadata` as membership.
- Hard-code demo rooms or demo members in the SPA.
- Mint from plate scenery (Mission/Carbon, cost line, seat tints).
- Reuse packet number 003.
- Append PM or SA logs from the Engineer plant.

---

## Stores / fields / contracts

### Change — `voice_session`

| Field | Change | Notes |
|-------|--------|--------|
| `title` | **add** text NOT NULL DEFAULT `''` | Index name. Empty is legal. Backfill invents nothing. |

Keep: `binding_id`, `default_binding_id`, `active_binding_id`, `view_mode`, `log_submode`, `router_state`, `status`, `client_ip`, `travis_live_handle`, `created_at`, `ended_at`.

### Add — `travis.room_membership`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | |
| `session_id` | uuid fk → `voice_session` | the room |
| `binding_id` | uuid fk → `agent_binding` | the agent |
| `role` | text NOT NULL DEFAULT `member` | `member` \| `facilitator` |
| `joined_at` | timestamptz NOT NULL DEFAULT now() | |
| `left_at` | timestamptz nullable | null = in the room |

**Constraints (SQL, not optional):**

- `CHECK (role IN ('member', 'facilitator'))`
- `CHECK (left_at IS NULL OR left_at >= joined_at)`
- Unique open pair: `(session_id, binding_id) WHERE left_at IS NULL`
- Unique open facilitator: `(session_id) WHERE left_at IS NULL AND role = 'facilitator'`

### Unchanged

- `agent_binding.seat_key` unique. TypeScript `SeatKey` four-literal union may stay this cut; roster payload is `{ seatKey, label }` and must not drop unknown slugs.
- `seat_live_run` PK `binding_id`.
- `queued_utterance` grain. Rows for a removed member stay; do not drain/send them.
- Phrase conductor, turn kinds, Cursor resume/send port.

### Refuse (007)

- Parallel `room` table.
- Founder as a membership row.
- Presence / Leave store.
- `last_used_at`.
- Create-agent columns and `Agent.create` UI.
- Reminting `seat_live_run` so two rooms can run one Engineer (follow-on packet).
- Room-local display aliases.

---

## SQL — paste into `migrate.ts` (signed)

Idempotent. Safe to re-run. This is Engineer’s `PROPOSED-ROOM-MEMBERSHIP.sql` word-for-word. Do not rewrite.

```sql
ALTER TABLE travis.voice_session
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS travis.room_membership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES travis.voice_session(id),
  binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  CONSTRAINT room_membership_role_chk
    CHECK (role IN ('member', 'facilitator')),
  CONSTRAINT room_membership_left_after_join_chk
    CHECK (left_at IS NULL OR left_at >= joined_at)
);

-- One open seat per agent per room. Leave then rejoin = a new row.
CREATE UNIQUE INDEX IF NOT EXISTS room_membership_open_uniq
  ON travis.room_membership (session_id, binding_id)
  WHERE left_at IS NULL;

-- One open facilitator per room. Travis holds that role.
CREATE UNIQUE INDEX IF NOT EXISTS room_membership_one_open_facilitator
  ON travis.room_membership (session_id)
  WHERE left_at IS NULL AND role = 'facilitator';

CREATE INDEX IF NOT EXISTS room_membership_open_by_session
  ON travis.room_membership (session_id)
  WHERE left_at IS NULL;

CREATE INDEX IF NOT EXISTS room_membership_open_by_binding
  ON travis.room_membership (binding_id)
  WHERE left_at IS NULL;

-- Today's implicit law: every active binding is in every room.
-- Ended rooms close those memberships at session.ended_at.
-- One row per (session, binding) from this backfill — history after
-- this cut is new rows written by runtime, not by re-running migrate.
INSERT INTO travis.room_membership (
  session_id,
  binding_id,
  role,
  joined_at,
  left_at
)
SELECT
  s.id,
  b.id,
  CASE
    WHEN b.seat_key = 'travis' THEN 'facilitator'
    ELSE 'member'
  END,
  s.created_at,
  s.ended_at
FROM travis.voice_session s
CROSS JOIN travis.agent_binding b
WHERE b.active = true
  AND NOT EXISTS (
    SELECT 1
    FROM travis.room_membership m
    WHERE m.session_id = s.id
      AND m.binding_id = b.id
  );
```

Update the migrate console line so it names 007.

---

## Drizzle — paste into `schema.ts` (signed)

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

Partial unique indexes stay SQL-only.

---

## Runtime

### Roster read (replaces `roomSeats()`)

```text
open members =
  room_membership
  WHERE session_id = ? AND left_at IS NULL
  JOIN agent_binding ON binding_id

order: joined_at, then seat_key
unknown seat_key slugs appear (do not drop)
```

Session JSON: add `title`. `seats` = open members (`seatKey`, `label`). Every `roomSeats()` call site (`GET`/`POST` `/api/session`, `payloadFor`) uses the session id.

### Create room (explicit) — hand + any Travis tool that creates

```text
INSERT voice_session (
  title,                        -- may be ''
  client_ip,                    -- creating IP
  binding_id + default + active -- first chosen member else Travis
  view_mode=voice, router_state=normal, status=listening
)
INSERT room_membership Travis facilitator joined_at=now()
INSERT room_membership each chosen binding as member
  skip Travis if already inserted
  refuse unknown / inactive binding ids (400)
```

### Phone open-or-resume — `POST /api/session` (no create body)

```text
existing = liveSessionForIp(ip)     -- unchanged 014
if existing → resume, roster from membership
else INSERT session + memberships for every active agent_binding
     Travis row role=facilitator
     dest = getPmBinding() if that id is in the insert set, else first member, else Travis
```

### Add / remove

```text
POST   /api/sessions/:id/members   { bindingId }
         → INSERT member now / 409 if open pair exists / 404 if ended
DELETE /api/sessions/:id/members/:bindingId
         → left_at=now() / 409 if facilitator / 404 if no open row
         → repoint dest FKs if needed
```

Ended session: add/remove 400.

### End

```text
PATCH /api/session/:id { status: ended }
Travis end_session
  → status=ended, ended_at=now(), travis_live_handle=null
  → left_at=now() on every open membership for :id
```

### Leave (founder)

No write. No new route. Glass may go to the index. Session stays live. Memberships stay open.

### Dest

```text
openMember(sessionId, bindingId) OR refuse
active / default / binding_id always an open member after every write
remove-of-dest → repoint (see Must)
queue rows for a non-member: keep, do not send
```

### List (V1 read)

```text
GET /api/rooms
  WHERE client_ip = this IP
  ORDER BY created_at DESC
  each: id, title, status, created_at, ended_at, open member labels
```

Enter a listed room: existing `GET /api/session?id=`. Do not End other live rooms.

---

## Ports

| Port | 007 |
|------|-----|
| SQL + Drizzle | **Real** — paste above |
| Roster read | **Real** — open memberships |
| Phone POST open/resume | **Real** — 014 + stand-in create writes memberships |
| Explicit create + add + remove + list | **Real** HTTP (names above; Engineer may nest under `/api/session` if the paths stay one family — same writes) |
| End | **Real** — existing PATCH + `end_session`, plus membership close |
| Leave | **Named silence** — no store |
| Send / queue dest | **Real** — membership gate |
| `seat_live_run` two rooms one agent | **Named silence / follow-on** |
| Create agent / `Agent.create` | **Out** — next packet |
| Founder presence | **Named silence** |
| Auth | **Named silence** (IP stand-in stays) |

---

## Verify

1. Run migrate twice. No duplicate membership rows. Existing live sessions have one open row per active binding. Travis is the open facilitator. Ended sessions have `left_at = ended_at`. Titles are `''`.
2. Phone resume (014): same live session, `seats` match that session’s open memberships.
3. Phone create (no live session): new session; memberships = all active bindings; dest is an open member.
4. Explicit create with only SA + Travis: roster is those two; dest is SA, not PM. Send to PM → 400. Send to SA → run.
5. Add Engineer → open member appears. Remove Engineer → `left_at` set; dest if it was Engineer moves. Remove Travis → 409.
6. End → session `ended_at` set; every remaining open membership gets `left_at`. Next phone POST is a new room (014).
7. Leave / refresh without End → same live session, memberships still open.
8. Rejoin after remove → new membership row; old row kept.
9. No `travis.room` table. No founder row. No `CURSOR_API_KEY` on the client.

---

## Out of scope

- V4 create-agent (model / repo / ref, `Agent.create`, seat-mark derivation).
- Reminting `seat_live_run` for concurrent rooms on one binding.
- Founder Leave store / presence.
- Room-local aliases, sort order, cost.
- Mission/Carbon chrome, plate copy, tint kit.
- Triage / judgment.
- Changing 014 to something other than “latest live for this IP.”

---

## Engineer handoff

Paste the SQL into `migrate.ts`. Paste the Drizzle grain into `schema.ts`. Switch `roomSeats()` (and every seats payload) to open memberships. Write create / add / remove / End / dest using the runtime above. Do not run analysis. Do not append the SA or PM logs. Do not plant from the plates.
