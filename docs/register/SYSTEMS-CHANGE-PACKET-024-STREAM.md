# SYSTEMS-CHANGE-PACKET-024 — Stream

**Number:** `024` — next systems packet is `025`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#126](https://github.com/bywale-com/travis/pull/126)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-05  
**PM packet:** [`PM-PACKET-008-STREAM.md`](./PM-PACKET-008-STREAM.md)  
**FACE (look, do not mint from PNG):** [`PLATES-STREAM.md`](./PLATES-STREAM.md) ST1–ST3  
**Prior (do not remint):** 013 motion · 014 beats · 015 sit · 021 worker · 023 tape / card / `dest_job`  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**. Request line **04:58 UTC 2026-09-05** stands — not this cut.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## 1. Intent

A stream is one working episode for one binding in one room. Live grain (message beats, process that actually occurred, thought) is rows on that episode. The Log tape stays completed turns. When the episode ends, the same rows become the card above the completed `agent_post`. Not a copy. Not a Room. Not 023’s MotionCard receipt. Not italic-thought expand.

---

## 2. Story

### Must

- Live work is not a Log line. `voice_turn` on the thread is completed work the founder answers.
- Working seat mark (glow already planted) is the **door**. Click opens a **compartment** titled **Stream**. Idle seat is not a door.
- Top of Stream is always the **trigger** — the `voice_turn` that is why this episode exists — for the life of the stream.
- Below: live work in **actual order**. Message then process, or process first. Completely, at the grain that occurred.
- When done, the stream **leaves** the compartment and is the **card** on the Log **above** the completed message. Tap card = same `stream.id`.
- Same door / store / card for **Travis**.
- Process states are truthful. Not second-accurate. Not a lie.
- `file_plan` is a spine (ordered his-tools). “Look at this repo” + a URL is an **ask**. It almost always streams as process (box / `curl`), not a Look primitive.

### Must-not

- Remint or recut **023** (`dest_job`, card hang **B**, gate, thread truth kinds).
- Mint Look / Find / Term / Write / Hand as a closed store or as `stream_event.kind`.
- Plant initiative curate. Browser / browse-GitHub. Fake their terminal or GitHub diffs.
- Lock labeled **Term** chrome from ST2.
- Invent triage. A third Room. Collide ST plates with S1–S5.
- Chunked box stdout. `run_box` is a blob today — do not paint a PTY.
- Drop Cursor `tool_call` / `tool_use` and then invent process scenery.
- Mint the table in the SPA. Hard-code demo streams.
- SSE / LISTEN/NOTIFY bus (023 silence). Poll this packet.

### Chain

Door (live row) → persist events as they occur → close on dest `done` / Travis labor end → land completed beats on `voice_turn` (014 closer) → card hangs on `close_turn_id`. 023 MotionCard stays under `motion.founding_turn_id`. Two hangs. Do not merge.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Chunked box stdout** | Sprites `POST /exec` returns `{ exit, stdout, stderr }` after the command. Not a byte stream. One process start + one blob update is the grain. |
| **Find rename** | Founder offered Look → Find. Not locked. Do not mint the word. |
| **Initiative stamp on follow-on seats** | `turnsForInitiative` only sees stamped rows. Parked. |
| **Hear / Next / Skip** | PM-007. Still SA. |
| **Process-primitive recut** | Four names are an idea. Not a table. |
| **Live artifacts in Stream** | `turn_artifact` FK is `voice_turn`. Harvest at close onto landed beats (014). No `stream_artifact`. |
| **Faceless Travis labor** | No `kind=user` trigger → do not open a stream. |
| **Failed stream, no close post** | No Log card until `close_turn_id` is set. Row stays queryable. Do not invent a status bubble. |
| **Request line / grant / export** | 04:58. Not this pocket. |
| **022 `travis.port`** | Stands on #120. Do not remint. |

---

## 3. Requirements (extraction)

From the PM packet + founder lock + plates. Not a second invention.

1. **In this room → Stream.** Glow is the door. Compartment title is **Stream**. Not a Room. Not italic thought.
2. **Trigger pinned.** Same text as the founding user line. Staple with that `voice_turn`.
3. **Live order.** Message chunks and process events as they occur. Completely.
4. **Done → Log card.** Same contents. Card **above** the completed `agent_post`. Staple label: **Stream**.
5. **Applies to Travis.**

Plate staples (shared labels — not scenery): **Stream** (compartment title = card title); trigger text (user line = pin = card line); working glow = door.

Do not build from the PNG: bezel/blur, loud Add, labeled Term, invented composer, teaching captions, fake clone percentages, a second Room.

---

## 4. Stood-up truth (quote, do not remint)

Log thread hides live posts in the **client**. The row is still `voice_turn`:

```1999:2016:src/components/Room.tsx
  const threadTurns = turns.filter((turn) => {
    if (turn.kind === "status") return /error/i.test(turn.text);
    if (
      turn.kind !== "user" &&
      turn.kind !== "agent_post" &&
      turn.kind !== "travis_prompt"
    ) {
      return false;
    }
    if (turn.kind !== "agent_post") return true;
    const live = streamingPosts[turn.seatKey ?? "_"];
    if (!live) return true;
    return !isOpenStreamingPost({
      turnId: turn.id,
      seatKey: turn.seatKey,
      streamingPostIds,
    });
  });
```

Door today is italic thought, not a compartment:

```191:192:src/components/plates/RosterDoor.tsx
                    type="button"
                    onClick={() => thought && onSeatMark?.(thought)}
```

Glow = thought streaming or `runningNow` (`Room.tsx` roster + thought-strip).

Cursor port **drops** dest process grain:

```272:272:src/server/cursor-port.ts
      if (e.type === "tool_call" || e.type === "tool_use") continue;
```

Yielded dest grain today: `status` · `thought_delta` · `post_delta` · `post_beat` · `run_started` · `busy` · `done` (`CursorStreamEvent` in `src/server/cursor-port.ts`).

Dest live writes `agent_thought` / `agent_post` on the tape (`absorbStreamingAgentPost` in `src/server/seat-pipe.ts`). 014 closer (`nextLiveTravisText` / `nextDestSeatText`) stands — use it when **landing** completed beats, not as the live store.

Box is one-shot:

```1:4:src/server/travis-box.ts
 * 020 / 021 — Travis's box. Fly Sprites HTTP. Pointer in env. No table.
 * prove_box is the harness loop. run_box stays one-shot.
```

```107:107:src/server/travis-box.ts
}): Promise<{ exit: number; stdout: string; stderr: string }> {
```

023 card is a **receipt** on `motion.founding_turn_id` (`listMotionCards`). PM: receipt, not stream. Keep it.

```195:215:src/server/db/schema.ts
export const destJob = travis.table("dest_job", {
  // binding_id, user_turn_id, payload, status, last_heartbeat_at
```

```105:118:src/server/db/schema.ts
export const seatLiveRun = travis.table("seat_live_run", {
  // PK binding_id — one live Cursor run per agent
```

`seatHasActiveRun` is false for Travis (`src/server/seat-pipe.ts`). His labor is motion + tools, not `seat_live_run`.

---

## 5. Stores / fields / contracts

### Add — mint `travis.stream` + `travis.stream_event`

Story bears it: live vs completed is one object; the card cannot drift; process order is not a MotionCard receipt and not `dest_job.payload`.

```sql
CREATE TABLE travis.stream (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES travis.voice_session(id),
  binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
  trigger_turn_id uuid NOT NULL REFERENCES travis.voice_turn(id),
  close_turn_id uuid REFERENCES travis.voice_turn(id),
  dest_job_id uuid REFERENCES travis.dest_job(id),
  motion_id uuid REFERENCES travis.motion(id),
  cursor_run_id text NOT NULL DEFAULT '',
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  CONSTRAINT stream_status_chk
    CHECK (status IN ('live', 'completed', 'failed'))
);

CREATE UNIQUE INDEX stream_live_one
  ON travis.stream (session_id, binding_id)
  WHERE status = 'live';

CREATE TABLE travis.stream_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES travis.stream(id),
  seq int NOT NULL,
  kind text NOT NULL,
  body text NOT NULL DEFAULT '',
  tool text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stream_event_kind_chk
    CHECK (kind IN ('message', 'process', 'thought')),
  CONSTRAINT stream_event_seq_uniq UNIQUE (stream_id, seq)
);
```

| Field | Law |
|-------|-----|
| `binding_id` | Whose stream. Disposable seats. Includes Travis. |
| `trigger_turn_id` | Why it exists. A `kind=user` row. Pin + card line read this text. Not a copied title column. |
| `close_turn_id` | The completed `agent_post` the card sits **above**. Null while live. Null + `failed` and no post = no card. |
| `dest_job_id` | Nullable. Dest-seat episode. Do not remint `dest_job`. |
| `motion_id` | Nullable. First motion filed in this episode if any. Later motions **append events** to this same live row. Not one stream per motion. |
| `cursor_run_id` | Dest Cursor run if any. `seat_live_run` stays the live-run pointer. |
| `status` | `live` → compartment. `completed` \| `failed` → card when `close_turn_id` is set. |
| One live | Partial unique `(session_id, binding_id)` where `live`. Matches the door. Matches `seat_live_run` (one run). 013 no-cap on motions still stands — many steps, one stream. |
| `stream_event.seq` | Actual order. 1-based. |
| `kind=message` | Assistant / Travis text beats. Grow in place with 014 insert/update law. `insert` → new seq. |
| `kind=process` | Tool grain that **occurred**. `tool` = actual name (`run_box`, `write_os`, Cursor tool name). `body` = what the port actually returned (cmd + blob, or Cursor payload text). Empty `tool` forbidden on process. |
| `kind=thought` | Cursor `thinking` / Travis thought. In the stream. Not spoken. Not a Log `agent_thought` this packet. |
| `tool` | Empty on message / thought. |

No `title` column. The word **Stream** is the surface staple, not a row.

Ensure-once (`ensureStreamStore`, `CREATE TABLE IF NOT EXISTS`) + `migrate.ts` + Drizzle. Founder lands the table on this database.

### Change

| What | Law |
|------|-----|
| Dest live persist | While `stream.status=live`, `thought_delta` / `post_delta` / `post_beat` write **`stream_event`**, not `voice_turn`. Stop `insertTurn` `kind=agent_thought` for new work. |
| Dest close | On Cursor `done`: land completed message beats onto `voice_turn` with **014** (`nextDestSeatText` / quote chain). `close_turn_id` = last landed `agent_post`. `status=completed` or `failed`. Release `seat_live_run` as today. Mark `dest_job` terminal as 023. Harvest artifacts onto those landed beats (014). |
| Cursor port | **Do not `continue` on `tool_call` / `tool_use`.** Yield `{ type: "process", tool, body }` from fields the SDK event actually has (name / tool / text / result). Stringify leftover public fields. Do not invent progress bars. Add that variant to `CursorStreamEvent`. |
| Travis live text | Growing Live that is not yet a 023 founding / interrupt / take-back line → `stream_event` `message`. 023 speakable posts (`kind=agent_post`, `seatKey=travis`, never `user`) still land on the tape. If a live stream is open, also append or grow a `message` event with the same text (founding / take-back appear in the compartment). |
| Travis process | Tool start: append `process` (`tool` = name, `body` empty or args). Tool return: **update that row’s `body`** with the truthful result (`result_text`, box `{exit,stdout,stderr}`). Runner writes `motion_step` (023) **and** this event. Do not recut `motion_step`. |
| Glow / door | Glow iff a `live` stream exists for that `binding_id` (or dest `seat_live_run` until the first event lands — same open). Click working mark → open that live `stream.id`. Click idle → not a door. Italic `onSeatMark` expand is **not** the product of this packet. |
| Session poll | Grow the existing session/turns payload: live stream per binding + events in `seq`; completed streams keyed by `close_turn_id` for card paint. Same rows. Phone **1–3s jitter poll** (023). No new bus. |

### Refuse

- New `voice_turn.kind`. New MotionCard kind. Third labor table.
- `stream_event.kind` ∈ Look / Find / Term / Write / Hand.
- Remint `dest_job`, `motion`, `motion_step`, `seat_live_run`, `travis.port`.
- Box byte-stream contract.
- Browser tool. Their GitHub PTY.
- Stream as SPA memory.

---

## 6. Runtime

### Who writes

| Writer | When | What |
|--------|------|------|
| Dest pipe (`seat-pipe` / `cursor-port`) | `run_started` / dest_job dispatch | Open `stream` `live`. `trigger_turn_id` = `dest_job.user_turn_id` or the user turn on this send. `dest_job_id` set. `cursor_run_id` set when known. Refuse open if no user trigger. |
| Dest pipe | each yielded event | Append / grow `stream_event`. |
| Dest pipe | `done` | Close. Land beats. Card key. |
| Travis tools / motion runner | first his-tool or `file_plan` on a user turn, no live stream | Open `stream` `live`. `trigger_turn_id` = that user turn. `motion_id` if `file_plan`. |
| Travis tools / runner | each tool start / return | `process` events. |
| Travis Live / absorb | live stream open | `message` (and 023 speakable tape writes as above). |
| Travis close | no running tool / motion_step for this binding, after last process | `status=completed` (or `failed` if last process failed and nothing else is running). `close_turn_id` = latest Travis `agent_post` after the trigger (take-back if he spoke one; else the founding 023 post). |
| Queue drain | next dest_job after close | Opens the **next** stream. Does not mint a second `live` row (unique index). |

### Who reads

| Reader | What |
|--------|------|
| Stream compartment | Live row + events `ORDER BY seq`. Pin `trigger_turn_id.text`. |
| Log card | `status IN ('completed','failed')` AND `close_turn_id` set. Paint **above** that turn. Title staple **Stream**. Line = trigger text. Tap = same id. |
| Glow / door | Exists `live` for binding. |
| TTS / hygiene | Speak landed `agent_post` only. Do not read `thought` or `process` aloud. |

### Triggers (faceless)

- Dest `run_started` / dispatch → open.
- Cursor `done` / dest_job terminal → close dest stream.
- Travis last tool/motion step done → close Travis stream.
- Interrupt / barge: new `kind=user` on the Log. Does **not** delete, pause, or retarget the open stream. 023: he answers; the card/stream stays. New trigger after **close**.

### One live per binding

Second dest_job while live waits in `queued_utterance` (already planted). Second Travis motion while live **appends** process events to the open stream. Do not open a second compartment.

---

## 7. Ports

| Port | This packet |
|------|-------------|
| Cursor cloud SSE | **Real.** Assistant / thinking / status / done already. **Change:** yield process from `tool_call` / `tool_use`. Stand-in send unchanged (one `message`, then `done`). |
| Box Sprites exec | **Real**, one-shot blob. Start event at POST; body update at return. No line stream. Unwired token = existing box receipt, still one process event. |
| Gemini Live | **Real** (planted). Live growing text → `stream_event` when a Travis stream is open. |
| Session SSE | May fan-out. **Not** the store. Store = these two tables. |
| Phone poll | **Real.** 1–3s. 023 bus silence stands. |

---

## 8. Verify

- Working Travis (or dest) mark glows → click opens compartment titled **Stream**. Trigger is the founder line. Idle mark does not open Stream.
- Dest: assistant text then a real Cursor tool (name + payload we received) appear in order. No fake `git clone` percents. No labeled Term required.
- Box: `run_box` shows one process that fills when the blob returns. No fake shell animation.
- Live growing dest/Travis text does **not** appear in `threadTurns` while `live`. After close, completed `agent_post` is on the Log; card sits **above** it; tap shows the same events (including thought / process).
- Travis path: founding 023 line may be on the tape while labor runs; Stream stays open; take-back or founding is `close_turn_id`; MotionCard still hangs under `founding_turn_id` if 023 filed one.
- Interrupt: new user bubble; open stream unchanged; unique live index holds.
- No live row → empty Stream is not a furniture pane.
- 023 gate / `dest_job` / catalog-fallback-dead still hold. 042 tests still pass. No browser. No cousin PR.

---

## 9. Out of scope

- Initiative curate. Hear / Next / Skip. Find rename. Primitive table.
- Chunked box. Computer use. Browser.
- Remint 023 / 021 / 022 / 014 closer.
- Request-line grant / export.
- Unseat. Mutate-the-tape. SSE bus.
- Planting `src/` from this seat.

---

## 10. Engineer (paste)

On **this PR** ([#126](https://github.com/bywale-com/travis/pull/126)), in this order:

1. `ensureStreamStore` + migrate + Drizzle for the SQL above. Founder lands the table.
2. Cursor port: yield process; stop dropping `tool_call` / `tool_use`.
3. Dest pipe: open on dispatch / `run_started`; live events → `stream_event`; close on `done`; land 014 beats; hang card on `close_turn_id`.
4. Travis tools / runner / Live: same store. Open on first his-tool / `file_plan` with a user trigger. Close when labor ends.
5. Face: In this room working mark → Stream compartment (not italic thought). Pin trigger. Live order from events. Done → card above completed line. Same for Travis. Glow from live row.
6. Grow session poll. Do not mint a second bus.

Do not remint 023. Do not plant initiative curate. Do not fake their terminal.

Do not send **That’s fine.**
