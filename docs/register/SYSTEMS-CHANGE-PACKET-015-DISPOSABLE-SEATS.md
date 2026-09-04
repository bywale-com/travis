# Systems change packet 015 — Disposable seats (sit + busy→next)

**Number:** `015` — next systems packet is `016`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-04  
**Decision:** **Seated = a house path on the person.** Add `agent_binding.protocol_path`. Empty = created, not seated. Sit writes `/protocols/pm.md` | `/protocols/sa.md` | `/protocols/engineer.md`. **Reuse idle** of that path in this room. **Busy → next** (another idle, or spin + sit). Role-routed work does **not** enqueue. `queued_utterance` stays for **person** dest only (same-binding follow-up). Hand the protocol as a harness send after sit — do not grow the create stub.  
**Founder lock:** Seats are disposable. The role lives in protocol + log, not the `bc-` id. Create ≠ seated. Logging is the inheritance. Where is locked (envelope table + `/protocols/WHERE.md`). No product cap. Directory names are **locked** — do not rename to be nicer.  
**Glass:** none required. Spoken + house. No “pick a role” plate.  
**Envelope:** [`ENVELOPE-DISPOSABLE-SEATS.md`](./ENVELOPE-DISPOSABLE-SEATS.md) ([PR #105](https://github.com/bywale-com/travis/pull/105)). House labor: [`house-now/`](./house-now/) is a git receipt — runtime is `os_node`. Do not auto-seed from migrate.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

The third moment was open. The founder locked it. A Cursor agent is a short context. Throw it away. The next one reads the protocol and the log. Travis routes to a **role** (a house file), not to a forever-`pm` slug. If that person is mid-run, do not make the founder wait in `queued_utterance` — give it to the next seat of that role, or spin. Create is still a person. Sit is a second write.

---

## The six envelope asks — locked

| # | Ask | Decision |
|---|-----|----------|
| 1 | Seated write | **`agent_binding.protocol_path`** text NOT NULL DEFAULT `''`. Identity = house path. Not a new table. Not `room_membership.role` (`member` \| `facilitator` only). Not `seat_key` (slug / marks). Not at create. |
| 2 | Idle lookup | Open `room_membership` in **this** room + `protocol_path` = that file + **no** `seat_live_run` row. If several, pick `joined_at` asc (oldest seated idle). No cap. |
| 3 | Busy → next | Role dest never calls `enqueueOnSeat`. Next idle, else spin (`create_agent` + join + sit + hand). `queued_utterance` **remains** when dest is a **person** (`who` / a slug that is not a role route). |
| 4 | Hand the protocol | After sit, **harness** `read_os` `/protocols/WHERE.md` + `/protocols/logging.md` + the protocol file, and `send` that text to **that binding** (person dest, they are idle). Not `Agent.create` prompt. Not Travis paraphrasing. 042: Travis still cannot see their repo. |
| 5 | Logging port | Work-repo seats write the locked files (`PHASE-ONE-LOG.md`, SA log, git + `ENGINEER-HANDOFF.md`). **No `seat_log` table.** No work repo → house file `/logs/pm.md` \| `/logs/sa.md` \| `/logs/engineer.md` (same append-only law). Ensure dir `/logs`. Empty file is legal. |
| 6 | Do not remint | 012 / 013 / 014 / 064. Do not migrate-seed from `docs/seats/` or `house-now/`. Re-PUT is labor. |

---

## Stood-up truth (quote, not memory)

```14:24:src/server/db/schema.ts
export const agentBinding = travis.table("agent_binding", {
  seatKey: text("seat_key").notNull().unique(),
  label: text("label").notNull(),
  cursorAgentId: text("cursor_agent_id").notNull().default(""),
```

No protocol field. Create prompt still the stub.

```117:131:src/server/db/schema.ts
export const roomMembership = travis.table("room_membership", {
  role: text("role").notNull().default("member"),
```

`MembershipRole = "member" | "facilitator"`.

```745:753:src/server/seat-pipe.ts
  if (await seatHasActiveRun(params.binding)) {
    const queue = await enqueueOnSeat({
```

Busy → wait on **that** binding. D4 corrects this for **role** dest.

`send_to_seat` enum is `pm` | `sa` | `engineer` — today that is a slug, not a protocol.

House: `/`, `/protocols`, `/templates`. Children may already be filed (envelope labor). Do not assume; `read_os` 404 if missing.

014 `create_agent` ([PR #104](https://github.com/bywale-com/travis/pull/104)) — plant 014 first if not on `main`. This packet does not remint it.

---

## Must / must-not

### Must

- `ALTER` `travis.agent_binding` add `protocol_path text NOT NULL DEFAULT ''`. `ADD COLUMN IF NOT EXISTS` in `ensure` (same lesson as 010/052). Founder lands the ALTER on this database.
- **Sit paths (locked):** only these files, and only if they exist as `os_node` kind `file`:
  - `/protocols/pm.md`
  - `/protocols/sa.md`
  - `/protocols/engineer.md`  
  Refuse `/protocols/travis.md` (facilitator, not a Cursor seat). Refuse `WHERE.md` / `logging.md`. Refuse any other path this cut.
- **`sit_agent` tool** `{ who, protocol }`  
  - `who` = `seat_key` of an open member in this room (a person).  
  - `protocol` = `pm` \| `sa` \| `engineer` **or** the full house path.  
  - Writes `protocol_path`. Does not change `seat_key`. Does not change membership `role`.  
  - Then harness-hands the three house files (WHERE + logging + protocol) as one send to that binding.  
  - Empty `who` / unknown member / missing house file → 400.  
  - Re-sit (path already set) **overwrites** the path and re-hands. No cap.
- **HTTP effect parity:** `PATCH /api/sessions/:id/bindings/:bindingId` `{ protocol: "pm" }` — same sit + hand. Founder can sit without Travis.
- **Role route** (`send_to_seat` / `dispatch_to_seat` with `seat` = `pm`|`sa`|`engineer` and **no** `who`):
  1. Idle lookup on `/protocols/<seat>.md` in this room.  
  2. If found → send to **that binding** (person send — they are idle, so no queue).  
  3. If none idle but a busy one exists → **do not enqueue**. Spin: `create_agent` `{ label: role label ("PM"|"SA"|"Engineer"), join: true }` then `sit_agent`, then send the founder’s line to the **new** binding. Copy `repository`/`ref` from any seated peer of that path in this room if the create call has none (so the log has a desk). If no peer repo, still spin; their trail is `/logs/…`.  
  4. If nobody seated and nobody busy → same spin + sit + send.
- **Person dest:** add optional `who` (slug) on send/dispatch. That binding only. `sendOrEnqueue` **unchanged** — busy may queue. This is follow-up on a named person.
- **`list_seats`:** print `label`, `seat_key`, `protocol_path` (or “not seated”), idle/busy. Still no `bc-` ids.
- **040:** `sit_agent` = **write**. Role-route spin is the same write class as `create_agent` + send.
- **`TRAVIS_SYSTEM`:** seats are disposable. Route to an idle seated role. Busy → next, do not wait them in a queue. `sit_agent` hangs a person on a protocol. Create still has no role. You are not PM/SA/Engineer. 042 stands.
- **Ensure** `/logs` dir (empty). Files appear when a no-repo seat first stamps (they `write_os`) or founder PUTs. Do not seed log prose.

### Must-not

- Attach a protocol at `create_agent` / V4.  
- Overload `seat_key` as the role.  
- Put `pm` in `room_membership.role`.  
- Enqueue role-routed work on a busy binding.  
- Grow the create stub into a seat bible.  
- Mint `seat_log` / `protocol` / `os_node` clones of rooms or agents.  
- Auto-seed `house-now/` or `docs/seats/` from migrate.  
- Sit Travis the facilitator as a Cursor protocol.  
- A product cap on how many PMs.  
- Rename `/protocols/pm.md` etc.  
- POSIX unfold.  
- A role-picker plate.

---

## Store — change `travis.agent_binding`

| Field | Change | Notes |
|-------|--------|-------|
| `protocol_path` | **add** text NOT NULL DEFAULT `''` | `''` = not seated. Sit = one of the three locked paths. |

---

## SQL

```sql
ALTER TABLE travis.agent_binding
  ADD COLUMN IF NOT EXISTS protocol_path text NOT NULL DEFAULT '';

-- convention dir only; no file bodies
INSERT INTO travis.os_node (path, name, kind, parent_id)
SELECT '/logs', 'logs', 'dir', id
FROM travis.os_node WHERE path = '/'
ON CONFLICT (path) DO NOTHING;
```

---

## Drizzle

```ts
protocolPath: text("protocol_path").notNull().default(""),
```

---

## Runtime

```text
create_agent / V4
  protocol_path stays ''

sit_agent / PATCH protocol
  protocol_path = locked path
  harness send(WHERE + logging + protocol) → that binding

send_to_seat { seat: pm }
  idle member with protocol_path=/protocols/pm.md
    → send that person
  else
    → create_agent + sit_agent + send
  never enqueueOnSeat

send_to_seat { who: eng-2 }
  sendOrEnqueue that binding   -- queue legal
```

---

## Ports / tools

| Port | 015 |
|------|-----|
| `protocol_path` | **Mint** (column) |
| `sit_agent` + PATCH | **Real** |
| Role route idle / spin | **Real** |
| Role route enqueue | **Refused** |
| Person follow-up queue | **Unchanged** |
| Hand protocol (harness send) | **Real** |
| `/logs` house trail (no repo) | **Real** — file, not a table |
| Create stub | **Unchanged** |
| 012 house / 014 create / 013 motion | **Do not remint** |

---

## Verify

1. Create “Pat” via V4 or `create_agent` → `protocol_path=''`. Roster: not seated. Send `seat=pm` does **not** pick Pat.
2. `sit_agent who=pat protocol=pm` → path `/protocols/pm.md`. That binding receives one harness user line containing WHERE + logging + pm protocol. Cursor prompt at create is still the stub.
3. Pat idle. `send_to_seat seat=pm text=…` → goes to Pat. **Zero** `queued_utterance`.
4. Pat busy. Same send → **new** binding, seated pm, line goes there. Pat’s queue **unchanged**. No wait.
5. `send_to_seat who=pat` while Pat busy → **queued** on Pat (person dest).
6. PATCH protocol on a member = same as sit. 400 on `/protocols/travis.md` or a missing file.
7. Binding with no repo, seated SA, stamps → `write_os /logs/sa.md` (or founder PUT). No `seat_log` table.
8. `list_seats` shows seated path + idle/busy. No `bc-` id. No cap on a third PM.

---

## Out of scope

- POSIX unfold of `/templates/work-repo`.  
- Seated Travis.  
- Heard.  
- `link` kind.  
- Killing create / in-the-room.  
- Re-filing `house-now/` (labor; already asked).

---

## Engineer handoff

Column + sit + harness hand + role route (idle or spin, never enqueue) + `/logs` dir. Plant **014** first if `create_agent` is not on `main`. Do not attach a protocol at create. Do not auto-seed house files. Do not append SA or PM logs. Founder lands the ALTER.
