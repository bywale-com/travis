# Systems change packet 012 — Travis OS house (protocols + templates)

**Number:** `012` — next systems packet is `013`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-03  
**Decision:** **Mint** `travis.os_node` — rows that look like folders. This is the house-now tree: protocols and templates, OS-scoped, no `session_id`. Do **not** rematerialize rooms or agents as nodes (those tables already are those folders). Do **not** orchestrate seated. Do **not** mint POSIX, object storage, a Travis git repo, or an integrations table.  
**Founder lock:** Travis is system-wide. One conceptual tree; cwd = room. Pointers, not copies. House now, POSIX later. Create ≠ role. Agents may produce the blobs; Travis (or the founder) files them into *his* tree. He still cannot see a work repo (042 stands).  
**Glass:** PM chat-ruled this pocket: **no new plate.** House is backend. Add-integration is a door on I1 or spoken (011 already). Cross-room look is spoken/later. Unfold is ahead. Create-agent stays name / model / repo. Seated glass is still open — not this packet.  
**Envelope:** [`ENVELOPE-TRAVIS-OS-TREE.md`](./ENVELOPE-TRAVIS-OS-TREE.md)  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

The three moments share one slug today. Create writes `agent_binding`. In-the-room writes `room_membership`. Seated writes **nothing** — and this packet still writes nothing for seated. What *does* have no home is the OS copy of seat law and repo templates. Those live as markdown in *this* work repo because this repo *is* Travis. The next empty repo will not have them. House-now gives Travis a place that is not a room and not a work repo. POSIX (he writes a template into *their* repo) is ahead.

---

## The eight envelope questions — locked

| # | Ask | Decision |
|---|-----|----------|
| 1 | Tree materialization | **Rows that look like folders.** Not a Travis git repo. Not object storage. POSIX-later may dump the same rows to a disk. |
| 2 | Protocol folder as a store | `travis.os_node`: identity = `id` + unique absolute `path`. Contents = `body` (text). Version = `updated_at` (no history table). Today’s `docs/seats/*.md` / `TRAVIS_SYSTEM` are **specimens**, not auto-seeded rows. |
| 3 | Seated link (agent → protocol) | **Refuse this cut.** Orchestration is open. Do not add `protocol_id` to `agent_binding` or `room_membership`. Do not overload `seat_key`. Do not overload `room_membership.role` (`member` \| `facilitator` only). |
| 4 | Templates vs protocols | **Same store.** A protocol is a file. A template is a directory of files. Convention dirs `/protocols/` and `/templates/` — not a second table. |
| 5 | Integration rows | **Refuse.** Install is env + SCP-011 `IntegrationStatus`. No `session_id` on a key. Do not mint `travis.integration`. |
| 6 | cwd | Unchanged: every Travis turn / tool already carries `sessionId`. House tools do **not** change dest. Opening `/protocols` does not leave the room. |
| 7 | Who writes house-now | **Founder HTTP + Travis tools.** Dest seats have no Travis tools (Cursor built-ins only). “Agents write into his tree” = a seat posts the text; Travis `write_os` files it (or the founder PUTs). No MCP this cut. 042 unchanged: he still cannot see *their* work repo. |
| 8 | `seat_key` remap | **No.** Slug for marks / routing until seated exists. |

---

## Stood-up truth (quote, not memory)

```117:131:src/server/db/schema.ts
export const roomMembership = travis.table("room_membership", {
  // …
  role: text("role").notNull().default("member"),
```

`MembershipRole = "member" | "facilitator"`. Not PM/SA/Engineer.

```14:24:src/server/db/schema.ts
export const agentBinding = travis.table("agent_binding", {
  seatKey: text("seat_key").notNull().unique(),
  label: text("label").notNull(),
  cursorAgentId: text("cursor_agent_id").notNull().default(""),
```

Create writes this. Prompt on create (still):

```82:82:src/server/create-agent.ts
        prompt: `You are ${label}. You sit in a Travis room.`,
```

No protocol store. `search_room` is this room only. `TRAVIS_SYSTEM` (042): no repository, no diff, no branch, no CI.

Conceptual folders that **already exist as tables** — do not clone them into `os_node`:

| Tree talk | Stood-up |
|-----------|----------|
| Agent folder | `agent_binding` |
| Room folder | `voice_session` + `voice_turn.session_id` |
| Protocol / template folder | **nothing — this cut** |

---

## Must / must-not

### Must

- `CREATE TABLE travis.os_node` (SQL below) in `migrate.ts` **and** `ensureOsStore` (`CREATE TABLE IF NOT EXISTS`). Founder lands the table on this database; code must still not assume `db:push`.
- Ensure-once also upserts three dirs if missing (empty, not content): `/`, `/protocols`, `/templates`.
- Path law (one helper, test it — `src/lib/os-path.ts`):
  - Absolute; starts with `/`.
  - No `..`. No `//`. No trailing slash except root.
  - Segments = `[A-Za-z0-9._-]+`.
  - Max path 512 chars. Max file `body` 200_000 chars (400k of protocol was named as labor, not a store limit — this cap is so a paste cannot blow the row).
- `list_os { path? }` — default `/`. Returns children `{ path, name, kind, updatedAt }`. 404 if path missing. Dirs only.
- `read_os { path }` — file body + path. 404 missing. 400 if the path is a dir (tell Travis to `list_os`).
- `write_os { path, body }` — file only. Creates missing parent dirs. Overwrite is allowed (same path). Trim; empty body after trim = 400. Returns `{ path }`. Classify **write** in `TOOL_POLICY`.
- HTTP effect parity (founder can cause what Travis can cause):
  - `GET /api/os?path=` → list if dir, read if file
  - `PUT /api/os` `{ path, body }` → same as `write_os`
- `TRAVIS_SYSTEM`: add that he **owns** this house (`list_os` / `read_os` / `write_os`). He still cannot see a work repo, diff, branch, test, or CI. Reading a protocol is not unfolding it into a repo. Do not list other rooms.
- Create-agent prompt **unchanged**. No role. No system message.

### Must-not

- A plate / Browse OS screen.
- `protocol_id` / seated link / role at create.
- Overload `seat_key` or `room_membership.role`.
- `os_node` rows for rooms or agents (copies).
- `session_id` on `os_node`.
- Auto-seed `docs/seats/*.md` or `TRAVIS_SYSTEM` as rows.
- Delete tool this cut (overwrite is enough).
- Binary / bytes in `body`.
- Git repo, S3, POSIX worker, computer use, dedicated server.
- `travis.integration` table.
- Cross-room `search_room` or `list_rooms` for Travis.
- MCP / dest-seat Travis tools.
- Change 042’s work-repo wall.

---

## Store — `travis.os_node`

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `parent_id` | uuid NULL FK self | Root `/` is null |
| `path` | text UNIQUE NOT NULL | Absolute. Law above. |
| `name` | text NOT NULL | Last segment; `/` → `''` |
| `kind` | text NOT NULL | `dir` \| `file` |
| `body` | text NOT NULL DEFAULT `''` | Files only; dirs stay `''` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Bump on write |
| `writer_binding_id` | uuid NULL FK `agent_binding` | Travis / a seat binding if a tool wrote; null = founder HTTP |

No `session_id`.

---

## SQL — paste into `migrate.ts` and `ensureOsStore`

```sql
CREATE TABLE IF NOT EXISTS travis.os_node (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES travis.os_node(id),
  path text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  writer_binding_id uuid REFERENCES travis.agent_binding(id),
  CONSTRAINT os_node_kind_chk CHECK (kind IN ('dir', 'file')),
  CONSTRAINT os_node_dir_body_chk CHECK (
    (kind = 'dir' AND body = '') OR kind = 'file'
  )
);

CREATE INDEX IF NOT EXISTS os_node_parent_idx
  ON travis.os_node (parent_id);
```

Convention dirs (idempotent, no file bodies):

```sql
INSERT INTO travis.os_node (path, name, kind, parent_id)
VALUES ('/', '', 'dir', NULL)
ON CONFLICT (path) DO NOTHING;

INSERT INTO travis.os_node (path, name, kind, parent_id)
SELECT '/protocols', 'protocols', 'dir', id
FROM travis.os_node WHERE path = '/'
ON CONFLICT (path) DO NOTHING;

INSERT INTO travis.os_node (path, name, kind, parent_id)
SELECT '/templates', 'templates', 'dir', id
FROM travis.os_node WHERE path = '/'
ON CONFLICT (path) DO NOTHING;
```

---

## Drizzle

```ts
export const osNode = travis.table("os_node", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  path: text("path").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  body: text("body").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  writerBindingId: uuid("writer_binding_id").references(() => agentBinding.id),
});
```

---

## Runtime

```text
write_os / PUT
  validate path
  ensure parent dirs
  INSERT file or UPDATE body + updated_at + writer_binding_id
  never INSERT a room or agent path as a node

list_os / GET dir
  children of path, name asc

read_os / GET file
  body

cwd
  unchanged sessionId on the turn
```

`writer_binding_id`: dest Travis’s `agent_binding.id` when a Travis tool writes. Null on founder HTTP.

040: `list_os` + `read_os` → `read`. `write_os` → `write`. Coverage test will fail until those three lines exist — that is the plant.

---

## Ports / tools

| Port | 012 |
|------|-----|
| `travis.os_node` | **Mint** |
| `list_os` / `read_os` / `write_os` | **Real** |
| HTTP GET/PUT `/api/os` | **Real** — effect parity |
| Create-agent prompt | **Unchanged** |
| Seated link | **Refused** |
| Integrations table | **Refused** |
| Cross-room look | **Refused** |
| POSIX / unfold / Travis git / S3 | **Refused** |
| Dest-seat `write_os` / MCP | **Refused** |
| 042 work-repo wall | **Unchanged** |
| Browse OS plate | **Refused** |

---

## Verify

1. After ensure: three dir rows `/`, `/protocols`, `/templates`. Zero files.
2. `PUT` `/protocols/pm.md` with seat-accept text → one file row; `list_os /protocols` shows it; `read_os` returns the text. No `session_id` on the row.
3. Same write from dest Travis via `write_os` → `writer_binding_id` is Travis. Founder PUT → null.
4. `write_os` `../secret` or `rooms/<id>` as a *new tree of rooms* — refuse illegal path. Do not create `/rooms`.
5. Empty body → 400. Missing path → 404. `read_os` on a dir → 400.
6. `search_room` still this room only. Create agent still one-line prompt, no role.
7. `tool-policy` coverage includes the three new tools.
8. 042 tests still: no repo / diff / branch / CI. New assertion: `TRAVIS_SYSTEM` names the house tools and says reading a protocol is not unfolding a repo.

---

## Out of scope (named silence)

- **Seated** — specified (three moments stay separate) but **not clear**. Founder has not chosen the beat. PM did not lock glass vs spoken. Do not invent the link.
- Cross-room peek / Enter.
- Unfold a template into a work repo.
- Integration marketplace / table.
- Protocol version history.
- Delete / rename node (overwrite path is the write; a later packet can add `rm` as destructive + confirm).

---

## Engineer handoff

Mint the table, the path helper, ensure-once + convention dirs, three Travis tools, GET/PUT `/api/os`, 040 policy lines, 042 house sentence. Do not attach a protocol to an agent. Do not recut I4. Do not append SA or PM logs. Founder lands the `CREATE TABLE` on this database — still `IF NOT EXISTS` in ensure-once.
