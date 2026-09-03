# Systems change packet 009 — Ticket artifacts (files and images)

**Number:** `009` — next systems packet is `010`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-03  
**Decision:** **Mint** `travis.turn_artifact` hung on a `voice_turn`. **Do not remint** `initiative`. **Silence** links-as-rows, founder upload, heard, and storing Cursor’s 15-minute URL.  
**Founder lock (2026-09-03):** Inside a backlog entry: relevant chats segmented for that entry; artifacts in the order they come; a modal for files and images. Selection is the harness stamp, not the agent. Multiple initiatives can be live at once.  
**Envelope (not law):** [`ENVELOPE-ARTIFACTS.md`](./ENVELOPE-ARTIFACTS.md) on PR [#75](https://github.com/bywale-com/travis/pull/75).  
**Glass (read-only, do not mint from pictures):** [`BACKLOG-FACE.md`](./BACKLOG-FACE.md) · B6 Messages · B7 Artifacts. B5 superseded.  
**Builds on:** `origin/main` (`9ec612c`) — 008 staple planted (Hotfix 052). 001 artifact silence. 051 heard refused.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

B6 is the stamped thread (already 008: `WHERE initiative_id = this`). B7 is the **same stamp**, files and images only. One post can make many files, so this is a **child row**, not a url column on `voice_turn`. Cursor’s stream is still text. Cursor’s **Artifacts API** is agent-scoped (`GET /v1/agents/{id}/artifacts`) and download URLs expire in **15 minutes**. We hang a **pointer** (agent + path) on the `agent_post` for this run, and Travis **proxies** bytes at read time. The list stays empty until a run actually updates `artifacts/`. No fake URLs.

---

## A–N

| | Seam | Decision |
|--|--|--|
| **A** | Identity | **MINT** `travis.turn_artifact`. Not columns on `voice_turn` (one turn, many files). Not a second ticket. |
| **B** | Hang on the turn | Hang on the **`agent_post`** that closed this send (`reference_turn_id` still names the send). Child rows, landing order `created_at`. Thoughts never carry them. |
| **C** | Ticket query | **Same `initiative_id`.** Artifact belongs to a turn; turn already has the stamp. No second fk. Agent does not pick. |
| **D** | B7 | **Same rows, second query:** files/images, `ORDER BY created_at`, seat from the host turn. No chat. No comments table. |
| **E** | Kinds | **`image` \| `file`.** Image = png/jpeg/gif/webp (path suffix). Else `file`. **Links stay silence** — a URL in post text is Messages, not a B7 row. No video/zip kind list. |
| **F** | Bytes | **Cursor keeps bytes.** We store `binding_id` + `path` (list API grain). **Do not** persist the presigned S3 URL. **Do not** `bytea` into Postgres. Phone reads Travis `/api/artifacts/:id`; server calls `GET /v1/agents/{id}/artifacts/download?path=` with `CURSOR_API_KEY` and streams. |
| **G** | Who writes | **Land-only.** Faceless: Cursor run `done` for a stamped `agent_post`. B7 has no upload CTA. Founder add-file = **named silence** this cut. Parity = founder can **open/download** what landed, same proxy. |
| **H** | Out | Host turn `initiative_id` IS NULL → **do not insert**. Hold later does not backfill old files. |
| **I** | Tools | **Grow** `read_initiative.attachments` (replace `[]`). No new tool. `search_room` unchanged. |
| **J** | No fake URLs | If list/diff is empty or the port fails, attachments stay `[]`. Do not plant plate scenery. |
| **K** | Number | **009.** Do not reuse 003–008. |
| **L** | Initiative | **008 stands.** Do not remint. |
| **M** | Heard | **051 / 008 K stands.** Do not mint. |
| **N** | Scope | Follow the ticket → this `voice_session`. No cross-room file index. |

---

## Stood-up truth (quote, not memory)

Initiative + stamp are planted (`origin/main`). `voice_turn` still has **no url / mime / blob**:

```54:73:src/server/db/schema.ts
export const voiceTurn = travis.table("voice_turn", {
  // …
  text: text("text").notNull(),
  initiativeId: uuid("initiative_id"),
});
```

`readInitiative` is hardcoded empty:

```362:400:src/server/initiative.ts
  attachments: [];
// …
    attachments: [],
```

Cursor port is **text**. `CursorStreamEvent` has no file. `textFromAssistantMessage` keeps `type === "text"` only. `streamRunEvents` **skips** `tool_call` / `tool_use`. Harvest / conversation walk assistant text. `absorbStreamingAgentPost` writes `text` and copies `initiative_id`.

**Live Cursor Artifacts API** (docs, not our port today):

- `GET /v1/agents/{id}/artifacts` — **agent-scoped** (workspace persists across runs). Item: `path` (relative, under `artifacts/`), `sizeBytes`, `updatedAt`.
- `GET /v1/agents/{id}/artifacts/download?path=` — **temporary 15-minute** URL. Key stays server-side.

Stream events (`status`, `assistant`, `thinking`, `tool_call`, `result`, …) do **not** emit a file nest. Prompt `images[]` is **input to** a run, not a ticket hang.

001: artifacts named silence; do not fake plate URLs. 002 did not mint them. 008 I kept the silence. This packet closes **I** only.

---

## Must / must-not

### Must

- Paste SQL + Drizzle. Run migrate. No backfill (empty B7 is legal).
- On Cursor run **terminal** for a seat send: if the `agent_post` has `initiative_id`, `listArtifacts(cursor_agent_id)`. Insert a row per item where `updatedAt >= seat_live_run.startedAt` (this run), `UNIQUE (turn_id, path)` so a re-harvest does not duplicate. Skip if `initiative_id` is null.
- Kind from path: `\.(png|jpe?g|gif|webp)$` → `image`, else `file`. Filename = basename of `path`.
- `read_initiative.attachments` = those rows for turns on this ticket, order `created_at`. Each item: `id`, `turnId`, `kind`, `filename`, `sizeBytes`, `createdAt`, `seatKey` (from host turn). **No Cursor URL.**
- B6 hang = group attachments by `turnId` under that post.
- B7 = the same array, no `text`.
- `GET /api/artifacts/:artifactId` — session must own the row’s `session_id`; proxy download; `Content-Type` from file kind/path; `Content-Disposition` filename. Never put `CURSOR_API_KEY` on the client. Never return the presigned URL as the product’s durable link.
- `formatInitiativeRead` lists filenames (so Travis can say what landed) without a new tool.
- If list/download throws: log, leave attachments as they are (empty or prior rows). Do not write fake paths.

### Must-not

- Remint `initiative` / change Requests / `search_room`.
- Url/image columns on `voice_turn`.
- Persist `expiresAt` S3 URLs as the store.
- Dump the whole `artifacts/` folder onto the first ticket (must filter by this run’s `startedAt`).
- Let the model choose the ticket.
- Founder upload / paperclip.
- `bytea` / Travis object bucket this cut.
- Hang on `agent_thought` or on the dispatch user row.
- Kind `link`. Kind `message` (Messages are turns, not this table).
- Heard table.
- Fake plate URLs in the SPA.
- Append PM or SA logs from the plant.

---

## Stores

### Add — `travis.turn_artifact`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | Travis id the phone uses to fetch |
| `turn_id` | uuid fk → `voice_turn` | host `agent_post` |
| `session_id` | uuid fk → `voice_session` | this room (query / auth) |
| `binding_id` | uuid fk → `agent_binding` | which Cursor agent to download from |
| `kind` | text NOT NULL | `image` \| `file` |
| `path` | text NOT NULL | Cursor list `path` (e.g. `artifacts/screenshot.png`) |
| `filename` | text NOT NULL | basename; display |
| `size_bytes` | integer nullable | from list |
| `cursor_updated_at` | timestamptz nullable | from list; run filter |
| `created_at` | timestamptz NOT NULL DEFAULT now() | landing order |

**Constraints**

- `CHECK (kind IN ('image', 'file'))`
- UNIQUE (`turn_id`, `path`)
- Index (`session_id`, `created_at`)
- Index (`turn_id`)

### Unchanged

- `travis.initiative` and `initiative_id` stamps (008 / 052).
- `voice_turn.text` / kinds.
- `seat_live_run.started_at` — **read** for the run window; do not remint the PK.

### Refuse (009)

- Artifact bytes in Postgres.
- Durable Cursor download URL.
- Founder upload table/port.
- Link rows.
- Heard.
- Cross-room file index.

---

## SQL — paste into `migrate.ts`

Idempotent. No backfill.

```sql
CREATE TABLE IF NOT EXISTS travis.turn_artifact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id uuid NOT NULL REFERENCES travis.voice_turn(id),
  session_id uuid NOT NULL REFERENCES travis.voice_session(id),
  binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
  kind text NOT NULL,
  path text NOT NULL,
  filename text NOT NULL,
  size_bytes integer,
  cursor_updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT turn_artifact_kind_chk
    CHECK (kind IN ('image', 'file')),
  CONSTRAINT turn_artifact_turn_path_uniq UNIQUE (turn_id, path)
);

CREATE INDEX IF NOT EXISTS turn_artifact_session_created_idx
  ON travis.turn_artifact (session_id, created_at);

CREATE INDEX IF NOT EXISTS turn_artifact_turn_idx
  ON travis.turn_artifact (turn_id);
```

Also add the same `CREATE` to `ensureInitiativeStore`’s isolate-once neighbor (or a sibling `ensureArtifactStore` called from harvest + read) so production does not wait on `db:push` — same lesson as Hotfix 052. Update the migrate console line to name 009.

---

## Drizzle — paste into `schema.ts`

```ts
export const turnArtifact = travis.table("turn_artifact", {
  id: uuid("id").defaultRandom().primaryKey(),
  turnId: uuid("turn_id")
    .notNull()
    .references(() => voiceTurn.id),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  bindingId: uuid("binding_id")
    .notNull()
    .references(() => agentBinding.id),
  kind: text("kind").notNull(),
  path: text("path").notNull(),
  filename: text("filename").notNull(),
  sizeBytes: integer("size_bytes"),
  cursorUpdatedAt: timestamp("cursor_updated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type TurnArtifact = typeof turnArtifact.$inferSelect;
export type ArtifactKind = "image" | "file";
```

---

## Runtime

### Harvest (faceless, after post exists)

```text
on Cursor run done / harvest (pipeOneSend, 032 harvester, drain):
  post = agent_post for this userTurn + seat
  if !post.initiative_id → return
  started = seat_live_run.startedAt for this binding (this send)
  items = GET /v1/agents/{cursor_agent_id}/artifacts
  for item in items:
    if item.updatedAt < started → skip          -- do not dump the workspace
    kind = image if path matches png|jpg|jpeg|gif|webp else file
    INSERT turn_artifact (post.id, session, binding, kind, path, basename, size, updatedAt)
      ON CONFLICT (turn_id, path) DO NOTHING
```

Wire list+download in `cursor-port.ts`. Do not parse `tool_call` this cut. Do not treat assistant `content` as files (live blocks are text).

### Reads

```text
B6: 008 turns query + attachments grouped by turn_id
B7: SELECT turn_artifact
      JOIN voice_turn ON turn_id
     WHERE voice_turn.initiative_id = ?
     ORDER BY turn_artifact.created_at
GET /api/artifacts/:id → proxy download
read_initiative.attachments = B7 payload (not [])
```

### Out / Hold

No harvest on unstamped posts. Hold does not copy historical `artifacts/` onto the new ticket.

---

## Ports / tools

| Port | 009 |
|------|-----|
| SQL + Drizzle + ensure-once DDL | **Real** |
| `GET /v1/agents/{id}/artifacts` | **Real** at run done |
| Download proxy | **Real** |
| `read_initiative` attachments | **Real** list (may be empty) |
| Stream file events | **Named silence** — not in the live stream contract we use |
| Founder upload | **Named silence** |
| Link rows | **Named silence** |
| Heard | **Named silence** |
| `search_room` | **Unchanged** |

---

## Verify

1. Migrate twice. Empty `turn_artifact`. `read_initiative` attachments `[]`.
2. Dest Engineer Out (no ticket) → run that writes `artifacts/` → **no** new rows.
3. Via Travis, Engineer run that updates `artifacts/foo.png` after `startedAt` → row hung on that `agent_post`; B6 shows it under the post; B7 lists it; kind `image`; `GET /api/artifacts/:id` returns bytes; phone payload has no `CURSOR_API_KEY` and no S3 URL.
4. Second harvest of the same run does not duplicate `(turn_id, path)`.
5. Two open tickets, two Engineer runs → each file hangs on **that** post’s ticket only (run window filter).
6. Old files in `artifacts/` with `updatedAt` before this run do **not** appear on the new ticket.
7. List API 404 / no key → empty list, no fake rows.
8. Requests door unchanged. New chip still session-local (051).

---

## Out of scope

- Reminting 008.
- Heard / R1.
- Cost panel.
- Create-agent.
- Copying the repo or diffs into Travis.
- Prompt-image **inputs** as ticket hangs.
- Planting B6/B7 chrome as a second product.

---

## Engineer handoff

Paste SQL + Drizzle + ensure-once. List artifacts at run done; hang diffs on the stamped `agent_post`; proxy download. Replace `attachments: []`. Do not remint initiative. Do not invent upload. Do not append SA or PM logs. Do not plant from the plates.
