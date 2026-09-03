# Systems change packet 010 — Backlog title + catalog query

**Number:** `010` — next systems packet is `011`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-03  
**Decision:** **Extend** `travis.initiative` with `title`. First write = **harness clip** of the founding line (not Travis, not you). Rename is a second write you (or Travis via the same HTTP) can make. **Grow** `list_initiatives` with `when` + `q`. `q` hits title, founding line, stamped Messages, and artifact filenames. Do not recut Requests. Do not remint 008/009.  
**Founder lock:** the index is a catalog. The founding line stays the founding line. Travis does not invent a ticket because a search missed.  
**Glass (read, then ascribe — do not mint scenery):** B1 index rows are short names (`Hear queue / New`, `Search grain`, `Output types`, `Voice send quiet`). B6 ticket header is the **same** name, not the founding sentence. Relative time (`2m`, `1h`, `today`, `yesterday`) is **presentation** of `created_at`. Footer: *Not the request log.*  
**Stood-up:** live DB now has empty `initiative` + `turn_artifact` (founder landed SQL). 009 harvest/proxy waits on PR [#77](https://github.com/bywale-com/travis/pull/77). `list_initiatives` clips founding text at **80** in `formatInitiativeList`. Rooms already have `voice_session.title` (typed, empty legal).  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

An initiative is already a row. The catalog cannot be “the first 80 characters of whatever opened the pipe.” B1/B6 show a **short title**, distinct from the founding line (B6 still shows that line in the thread). Title is a field so it can be renamed. The first value is a dumb clip so via-Travis and Hold (one loud word, no name form) still have a label. Travis does not author the index on mint. List grows `when` and `q` so “this week” and “the artifact one” are queries, not a second Requests door.

---

## Who names (the four options — locked)

| | Option | Decision |
|--|--|--|
| 1 | Founding line is the title. No column. | **STRIKE.** B1 is not a paragraph. Rename is impossible. |
| 2 | Harness writes a short clip from that line. | **SIGN for first write.** Same reflex as a room staying empty until typed — except here the clip is automatic so the index is never a blank row after pass-on. |
| 3 | Travis names it when he mints via_travis. | **STRIKE for mint.** The agent is the pipe, not the author of the catalog. |
| 4 | You name it (Hold / rename). Empty until then. | **SIGN rename.** **STRIKE empty-until-named** as the only path — via-Travis would leave B1 blank. Hold does **not** ask for a name (B4 is one word). |

Rename is `PATCH title`. “This week” is `created_at` + the same `today` / `week` / `all` grain as Requests. Find-by-words is **one `q`** on the same list — title, founding line, stamped Messages (`kind=user` + `agent_post` with that `initiative_id`), artifact `filename`. Thoughts stay out. Miss → empty list. **Do not mint a ticket from a miss.**

---

## Stood-up truth (quote, not memory)

```131:146:src/server/db/schema.ts
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
```

No `title`. Rooms already: `voice_session.title` DEFAULT `''`.

```457:466:src/server/initiative.ts
export function formatInitiativeList(items: InitiativeListItem[]): string {
  // …
    const clip =
      item.foundingText.replace(/\s+/g, " ").trim().slice(0, 80) || "(no text)";
```

`list_initiatives` params today: `status` only. `search_room` is 048 Requests.

---

## Must / must-not

### Must

- `ALTER` `travis.initiative` add `title text NOT NULL DEFAULT ''`. Same `ADD COLUMN IF NOT EXISTS` inside `ensureInitiativeStore` (052 lesson — founder lands tables; code must still not assume `db:push`).
- On `ensureInitiative` (via_travis) and Hold: set `title = clipInitiativeTitle(founding.text)` if the new row’s title is `''`. Do **not** overwrite a title that was already set.
- Clip law (put in `src/lib/initiative-title.ts`, test it): flatten whitespace; take the first sentence (`.?!` or newline); cap **40** characters; break on the last space before the cap if that space is after character 12; no trailing space. Empty founding → `''`.
- `PATCH /api/sessions/:id/initiatives/:initiativeId` already does `status=done`. Accept `{ title?: string }` too. Trim; apply the same 40-char clip to the submitted string (so a paragraph paste cannot blow the catalog). Empty string after trim **refuses** (400) — do not blank a name by accident. 404 wrong room.
- `list_initiatives` / `GET` list: add `when?: today|week|all` (reuse `parseRequestWhen` / `requestInWindow` on `created_at`, UTC) and `q?: string`. Default `when=all`, `status=open` unchanged.  
  **`q` (case-insensitive substring) matches if any of these hit:**  
  1. `initiative.title`  
  2. founding turn `text`  
  3. any stamped `voice_turn` on that id with `kind` in (`user`, `agent_post`) — the ticket Messages, including pass-on legs and seat posts  
  4. any `turn_artifact.filename` (and `path` basename) hung on those turns  
  If `turn_artifact` is not stood up yet (009 still merging), skip (4) — do not 500. Thoughts (`agent_thought`) never match. `status` / `travis_prompt` never match.
- List/read JSON and `formatInitiativeList` print **`title`**, not an 80-char founding dump. Founding line stays on `read_initiative.founding`.
- Travis tools: grow `list_initiatives` parameters (`when`, `q`). Add `rename_initiative` `{ id, title }` = the same PATCH. Do **not** have Travis set title inside pass-on.
- `search_room` unchanged.

### Must-not

- Let Travis invent a title on mint.
- Recut Requests as Backlog.
- Mint a ticket because `q` missed.
- Ask for a name on Hold.
- A second title store / “display_name” / slug.
- Remint initiative identity, artifacts, heard.
- Backfill invented names. Prod is zero rows. If a row exists with `title=''`, clip once at next list/read **or** one idempotent UPDATE from founding text — no model, no made-up words.
- Plant B1 copy as seed rows.

---

## Stores

### Change — `travis.initiative`

| Field | Change | Notes |
|-------|--------|--------|
| `title` | **add** text NOT NULL DEFAULT `''` | Catalog name. First write = harness clip. Rename = PATCH. |

Founding line remains `founding_turn_id` → `voice_turn.text`. Two facts.

### Refuse (010)

- Travis-authored mint title.
- Empty-until-named as the only path.
- `search_room` filter on initiatives.
- Timezone store (UTC, same as 048).

---

## SQL — paste into `migrate.ts` and `ensureInitiativeStore`

```sql
ALTER TABLE travis.initiative
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
```

Optional, idempotent, founding-only (no invented words):

```sql
UPDATE travis.initiative i
SET title = left(trim(regexp_replace(t.text, '\s+', ' ', 'g')), 40)
FROM travis.voice_turn t
WHERE i.founding_turn_id = t.id
  AND i.title = ''
  AND trim(t.text) <> '';
```

(Runtime clip is the law for new rows; this UPDATE is a one-shot for any empty title already sitting on prod. Prefer the TS clip function if you run a small backfill in `ensureInitiativeStore` instead — **one** clip implementation, not two.)

---

## Drizzle

```ts
// on initiative
title: text("title").notNull().default(""),
```

---

## Runtime

```text
ensureInitiative / Hold
  INSERT … title = clipInitiativeTitle(founding.text)

PATCH { title }
  title = clipInitiativeTitle(submitted)   -- 400 if empty
  do not touch founding_turn_id or status unless status also sent

PATCH { status: done }                    -- unchanged

GET / list_initiatives
  filter status, when(created_at UTC)
  q → title OR founding.text OR stamped user/agent_post text
      OR artifact filename on those turns
  miss → []  -- never INSERT

rename_initiative tool → same PATCH
```

Relative time on B1 (`2m`, `today`) is glass over `created_at`. Do not store it.

---

## Ports / tools

| Port | 010 |
|------|-----|
| `title` column + ensure-once | **Real** |
| Clip helper | **Real** — tested |
| List `when` + `q` | **Real** — title, Messages, artifact names |
| Rename HTTP + `rename_initiative` | **Real** — same write |
| Travis names on mint | **Refused** |
| `search_room` | **Unchanged** |
| Hold name field | **Refused** this cut |

---

## Verify

1. Via-Travis send → row has a ≤40-char title clipped from the founding line; founding text on read is the full sentence.
2. Hold an Out line → same clip; no extra prompt asking for a name.
3. PATCH title “Artifact door” → index and B6 header show that; founding line unchanged.
4. `list_initiatives` `when=week` hides older; `q=artifact` hits a renamed title **or** a post/filename that contains that word; `q` on a seat post (“heard is silence”) hits that ticket; `q` on `HEAR-QUEUE-SPEC` hits if that file is hung; `q=no-such` returns none and writes **zero** rows.
5. `search_room` still returns dest-seat personal lines that are not tickets.
6. Rename tool and PATCH produce the same row. Pass-on does not call the model to name.

---

## Out of scope

- 009 harvest/proxy (PR 77).
- Heard.
- Cross-room backlog.
- Asking Travis to invent work.

---

## Engineer handoff

Paste the column, the clip helper, list `when`/`q` (title + stamped Messages + artifact filenames), and rename. First title is harness. Travis does not name on mint. Requests stays Requests. Founder will land the `ALTER` on this database — still put `IF NOT EXISTS` in ensure-once. Do not append SA or PM logs.
