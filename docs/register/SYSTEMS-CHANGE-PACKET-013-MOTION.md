# Systems change packet 013 — In motion (Travis process + runner)

**Number:** `013` — next systems packet is `014`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-03  
**Decision:** **Two models, one Backlog pile.** Mint `travis.motion` + `travis.motion_step` for Travis’s own ordered tool sequences. Do **not** overload `initiative`. Do **not** mint a second index. Grow the existing Backlog door with `view=all|in_motion|initiatives`. Add a **dumb runner** that is not the voice turn. P1 count = open motions only.  
**Founder lock:** The turn is not the work. He stays available. A hundred can be executing — SA does **not** invent a product cap. In motion lives **in Backlog**. In motion = Travis processes (no one’s input; step *n* of *m*; it will complete). Initiatives = tickets (seats, circles, Next). Voice “N in motion” counts **only** processes. Gone when zero. Not in Voice → existing Backlog door.  
**Glass (read, then ascribe — do not mint scenery):** [`PLATES-IN-MOTION.md`](./PLATES-IN-MOTION.md) · P1 Voice quiet `N in motion` · P2 is the **In motion view** (same list geometry). Shell title stays **Backlog**; the view is the filter. Completes All / Initiatives — no extra PNG. The P2 PNG’s middle “Engineer · running” row is **initiative-shaped**; the recut says In motion does **not** show those. Follow the recut, not that row.  
**Envelope:** [`ENVELOPE-TRAVIS-ORCHESTRATE.md`](./ENVELOPE-TRAVIS-ORCHESTRATE.md)  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

Brittleness is not JSON tools. The chat turn is the orchestrator. His plan lives in one utterance; a barge is a new response; Live runs tools after `response.done` one-by-one; Talk/Type dies at six rounds. “Rename those two” never became a ticket and never became a plan. This cut files the plan **out of the conversation** and lets a runner advance it while they keep talking. Glance is a query, not a recap he invents.

---

## The eight envelope questions — locked

| # | Ask | Decision |
|---|-----|----------|
| 1 | New store or extend initiative? | **Sibling.** `motion` is not a ticket. `initiative` stays open/done, Next a seat. One list query unions both for `view=all`. Do not add `in_motion` as an initiative status. |
| 2 | What is a step? | One of **his** tools + frozen args. Order = `seq`. Not a seat send. Not “wait for a seat post.” |
| 3 | What wakes the next step? | **Same request, then next HTTP.** After `file_plan` and after every claimed step, the runner continues. Also `runMotionRunner(sessionId)` at live/tool, Talk/Type generate, send, queue drain. No cron. No daemon. No dedicated orchestrator server. |
| 4 | Barge / new utterance | Does **not** delete or pause a motion. The plan is rows. dest stays Travis. |
| 5 | Cap | **None.** Founder: do not care for caps; a hundred executing is fine. Do not refuse the 101st motion, the 21st step, or a third running step. `seat_live_run` is still one live Cursor run per binding — that is stood-up, not a ceiling this packet minted. A request may die (Vercel); leftover `pending` wakes on the next HTTP. That is physics, not a cap. |
| 6 | 040 | `file_plan` = **write**. `list_backlog` = **read**. Step execution is the runner, not a Travis tool class. |
| 7 | 042 | A motion cannot include a repo/diff/CI tool — those tools do not exist. Allowlist below. Stands. |
| 8 | `seat_key` / `role` | **No overload.** |

---

## Stood-up truth (quote, not memory)

```133:146:src/server/db/schema.ts
export const initiative = travis.table("initiative", {
  // source, status open|done, title, founding_turn_id, session_id
```

```598:608:src/server/initiative.ts
export function formatInitiativeList(items: InitiativeListItem[]): string {
  // status + title + lit + next — **no id**
```

`rename_initiative` requires `id`. Hygiene hole. Not the product — still fix it so he can file honest steps.

```110:110:src/server/travis-openai.ts
  for (let i = 0; i < 6; i++) {
```

```200:200:src/lib/travis-live-client.ts
        if (action.op === "tools") void runTools(action.calls);
```

`runTools` is fire-and-forget; calls POST `/live/tool` **one after another**, then `response.create`. A new utterance is a new model response.

`dispatch_to_seat` detaches **seat** work. `work_in_flight` / V6 = seats only. `queued_utterance` = waiting lines per seat. House tools are sync, in-turn, no sequence.

---

## Must / must-not

### Must

**Stores** — SQL below, `migrate.ts` + `ensureMotionStore` (`IF NOT EXISTS`). Founder lands the table on this database.

**`file_plan` tool** `{ title?: string, steps: [{ tool, args }] }`
- `title` empty → harness clip of the founding user line (same 40-char clip as 010). Refuse empty clip + empty title (400).
- `steps` length ≥ 1. No max.
- Each `tool` on the **motion allowlist** (below). Args frozen at insert (JSON text).
- Insert `motion` (`status=waiting`) + steps (`pending`, `seq` 1-based). Then `runMotionRunner(sessionId)` **in this request**.
- Return `{ id, title, stepCount }` so he can say it is filed — do not wait for all steps to finish before returning to the model (runner may still finish them in-process).

**Motion allowlist** (his tools only):

`list_seats`, `queue_snapshot`, `work_in_flight`, `read_seat_reply`, `search_room`, `list_initiatives`, `read_initiative`, `rename_initiative`, `mark_initiative_done`, `rename_room`, `list_os`, `read_os`, `write_os`, `list_backlog`

**Refuse as a step:** `send_to_seat`, `dispatch_to_seat`, `barge_or_drop`, `end_session`, `set_view`, `file_plan`. Seat work stays `initiative` + dispatch. A process has **no one’s input**.

**Runner** `runMotionRunner(sessionId)`
- Claim every next `pending` step that is legal to start: for each open motion, the lowest `seq` still `pending` (order inside a motion; not a count cap). `UPDATE … WHERE status='pending' RETURNING` so two wakes cannot double-fire the same step.
- Many motions → many current steps. Run them. No room-wide executing ceiling.
- Execute via `runTravisTool` with the frozen args. Store `result_text` (the tool’s `text`).
- Step ok → `done`. If that was the last step → `motion.status=done`, `done_at=now()`. Else next seq stays pending; motion `running` if a step is executing, else `waiting`.
- Step fail → step `failed`, motion `failed`. Do not start later seqs on that motion. Other motions keep going.
- Never throw out to Voice. Failures live on the row.
- Safe to call when there is nothing to do.
- If the isolate dies mid-batch, leftover `pending` stays. Next wake continues. Do not invent a max-in-flight to “be safe.”

**Wake** (every one of these calls the runner; do not invent a worker):

1. After `file_plan` insert  
2. End of `POST /api/session/:id/live/tool`  
3. End of `generateTravisText`  
4. After dest-Travis send / Live persist  
5. After `queued_utterance` drain  

**Backlog pile — one door, three views**

Grow the existing initiatives GET (or the Backlog client’s fetch — **one route**, do not add `/motions` as a second index):

`GET /api/sessions/:id/initiatives?view=all|in_motion|initiatives`

- Default `view=all` (today’s list + open motions).
- `in_motion` — motions with `status` in (`waiting`,`running`,`failed`). **Not** initiatives. Sort `updated_at` desc.
- `initiatives` — today’s ticket list unchanged (open default still applies via existing `status` param).
- `all` — union, discriminated `{ kind: "motion" | "initiative", … }`, sort by each row’s clock (`motion.updated_at` / `initiative.created_at`).

Motion JSON for the list:

```ts
{
  kind: "motion",
  id: string,
  title: string,
  status: "waiting" | "running" | "failed",
  stepN: number,      // last done+1 or the running seq
  stepM: number,      // total
  under: string,      // "Travis · " + short current-step verb (tool name, humanized)
}
```

P1: `motionCount` = count of motions in (`waiting`,`running`) — **not failed, not done**. Zero → do not render the Voice link. Tap → open Backlog with `view=in_motion`.

**`list_backlog` tool** `{ view?: all|in_motion|initiatives }` — same query. He answers “how is that coming?” from the store.

**Hygiene (010 sharpening, same plant):** `formatInitiativeList` / `formatInitiativeRead` print `id` (short is fine — full uuid). Rename can be honest. This is not a plate.

**040:** add `file_plan` write, `list_backlog` read.

**TRAVIS_SYSTEM:** the turn is not the work. Several of his own tools in a row → `file_plan`, then stay with the founder. `send_to_seat` is one blocking hand, not a batch. Glance / “how is that coming?” → `list_backlog`. Do not invent progress.

### Must-not

- A second list, a Plans app, a planner, a tool debugger, a report digest plate.
- `initiative.status = in_motion` or a new ticket source for tool sequences.
- Seat send as a motion step.
- Delete the plan on barge.
- Cron / daemon / dedicated orchestrator.
- POSIX / computer use / seated link / Browse OS.
- V6 / `work_in_flight` grown into processes (seats stay seats).
- Three equal view bars. Quiet text filter (plate lock).
- Auto-seed demo motions.
- Mint from the P2 PNG’s Engineer row onto the In motion view.
- A product cap on open motions, steps per motion, or executing steps.

---

## Stores

### `travis.motion`

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `session_id` | uuid NOT NULL FK `voice_session` | cwd |
| `title` | text NOT NULL | Catalog line. Clip on file. |
| `status` | text NOT NULL | `waiting` \| `running` \| `done` \| `failed` |
| `founding_turn_id` | uuid NULL FK `voice_turn` | The user line he accepted, if known |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Bump on step claim/finish |
| `done_at` | timestamptz NULL | Set on done/failed |

### `travis.motion_step`

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `motion_id` | uuid NOT NULL FK `motion` | |
| `seq` | int NOT NULL | 1-based. Unique per motion |
| `tool` | text NOT NULL | Allowlist |
| `args` | text NOT NULL | JSON object |
| `status` | text NOT NULL | `pending` \| `running` \| `done` \| `failed` |
| `result_text` | text NOT NULL DEFAULT `''` | Tool receipt |
| `started_at` | timestamptz NULL | |
| `done_at` | timestamptz NULL | |

No `session_id` on the step (parent has it). No `initiative_id` (sibling, not a pointer, this cut).

---

## SQL — paste into `migrate.ts` and `ensureMotionStore`

```sql
CREATE TABLE IF NOT EXISTS travis.motion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES travis.voice_session(id),
  title text NOT NULL,
  status text NOT NULL,
  founding_turn_id uuid REFERENCES travis.voice_turn(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  done_at timestamptz,
  CONSTRAINT motion_status_chk
    CHECK (status IN ('waiting', 'running', 'done', 'failed'))
);

CREATE INDEX IF NOT EXISTS motion_open_by_session
  ON travis.motion (session_id)
  WHERE status IN ('waiting', 'running', 'failed');

CREATE TABLE IF NOT EXISTS travis.motion_step (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  motion_id uuid NOT NULL REFERENCES travis.motion(id),
  seq int NOT NULL,
  tool text NOT NULL,
  args text NOT NULL,
  status text NOT NULL,
  result_text text NOT NULL DEFAULT '',
  started_at timestamptz,
  done_at timestamptz,
  CONSTRAINT motion_step_status_chk
    CHECK (status IN ('pending', 'running', 'done', 'failed')),
  CONSTRAINT motion_step_seq_uniq UNIQUE (motion_id, seq)
);
```

---

## Drizzle

```ts
export const motion = travis.table("motion", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  title: text("title").notNull(),
  status: text("status").notNull(),
  foundingTurnId: uuid("founding_turn_id").references(() => voiceTurn.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

export const motionStep = travis.table("motion_step", {
  id: uuid("id").defaultRandom().primaryKey(),
  motionId: uuid("motion_id")
    .notNull()
    .references(() => motion.id),
  seq: integer("seq").notNull(),
  tool: text("tool").notNull(),
  args: text("args").notNull(),
  status: text("status").notNull(),
  resultText: text("result_text").notNull().default(""),
  startedAt: timestamp("started_at", { withTimezone: true }),
  doneAt: timestamp("done_at", { withTimezone: true }),
});
```

---

## Runtime

```text
file_plan
  INSERT motion waiting + steps pending
  runMotionRunner(sessionId)   -- same request
  return id to the model       -- conversation continues

runMotionRunner
  claim every motion's next pending seq
  run them (no executing ceiling)
  write result; advance or fail
  leftover pending if the request dies → next HTTP

barge / new Live response
  does not DELETE motion

GET backlog view=in_motion
  waiting|running|failed motions
  never initiative rows

P1
  count waiting+running
  0 → hide
```

Relative “3m” on an **initiative** row stays `created_at` presentation (048 grain). Motion rows use step meta, not age, on the In motion view (plate: `step 2 of 2` / `waiting`).

---

## Ports / tools

| Port | 013 |
|------|-----|
| `travis.motion` + `motion_step` | **Mint** |
| `file_plan` + runner | **Real** |
| Backlog `view` + P1 count | **Real** — one pile |
| `list_backlog` | **Real** |
| Initiative id on list/read | **Real** — hygiene |
| `initiative` as process | **Refused** |
| Seat send as a step | **Refused** |
| Second index / planner / digest plate | **Refused** |
| Cron / daemon | **Refused** |
| V6 = processes | **Refused** |
| Product caps (open / steps / executing) | **Refused** |
| 042 wall | **Unchanged** |

---

## Verify

1. Voice: “rename those two garbage titles.” He `file_plan`s two `rename_initiative` steps (ids from a prior `list_initiatives` step in the same plan). Reply returns while he is still Listening. Rows: one motion, `step 1 of 2` then `step 2 of 2`. Titles change. **Zero** new `initiative` rows.
2. Barge “how is that coming?” mid-run → plan still there. `list_backlog view=in_motion` matches the glance. He does not invent.
3. P1 shows `2 in motion` only when two motions are waiting/running. Failed does not add to the Voice count; it **does** appear in the In motion view. Zero waiting+running → link gone.
4. `view=in_motion` has no seat circles / no “next Engineer.” `view=initiatives` has no `step n of m`. `view=all` has both kinds.
5. `file_plan` with `send_to_seat` as a step → 400, no row. A hundred motions with a current step all run; the 101st file is accepted. No refuse-for-count.
6. `formatInitiativeList` includes id. `rename_initiative` with that id works without guessing.
7. Killing the Live connection does not DELETE motions. Next send/tool/drain advances leftover `pending` steps.
8. `tool-policy` coverage includes `file_plan` and `list_backlog`.

---

## Out of scope

- Completion digest / spoken report plate (O5).
- Cancel-a-plan hand door (see later if they want drop). Overwrite is not delete; a later `rm` can be destructive + confirm.
- Binding `$step1.id` templates — he files a `list_*` step then concrete writes, **or** he lists in-turn then files frozen rename args. No mini-language this cut.
- Seated, POSIX, integrations table, Browse OS.

---

## Engineer handoff

Mint the two tables, ensure-once, `file_plan`, runner + five wake sites, Backlog `view`, P1 count, `list_backlog`, 040 lines, 042/SYSTEM sentence, print initiative id. Plant P1/P2 from [`PLATES-IN-MOTION.md`](./PLATES-IN-MOTION.md): Voice link → Backlog `view=in_motion`. Do not put initiative rows on that view. **Do not plant a cap.** Founder lands `CREATE TABLE`. Do not append SA or PM logs.
