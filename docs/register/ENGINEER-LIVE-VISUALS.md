# Engineer write-back — Live visual patterns

**Kind:** Engineer write-back to the founder packet (Gemini’s five patterns seeded onto live-state opportunities). **Not a plant. Not a packet.**  
**Seat:** Engineer.  
**When:** 2026-09-05.  
**One PR:** [#123](https://github.com/bywale-com/travis/pull/123) (tightness envelope).  
**Source packet:** founder paste (Gemini recommendations as-is). `ENVELOPE-TRAVIS-LIVE-STATE.md` is **not in this repo** — opportunities below are the five Gemini named, plus seat health.  
**Plates (look only):** [`PLATES-LIVE-VISUALS.md`](./PLATES-LIVE-VISUALS.md) · S1–S5. Mission, planted chrome. Not a plant.

Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Do not mint a table from this file. Do not plant a DAG, PTY stream, canvas, or heartbeat from this file.

**Flag (unchanged):** Phase One 14:00 UTC 2026-08-25.

---

## Stood-up truth (do not invent past this)

| Grain | What exists today |
|---|---|
| Phone liveness | **Poll.** `src/components/Room.tsx` `setInterval` on queue / turns. No SSE / WebSocket for room, jobs, or seats. |
| Seat “live” | `travis.seat_live_run` — one Cursor run per binding (`src/server/seat-pipe.ts`). A run id, not a ping. |
| Motion | `travis.motion` + `motion_step` — Travis **tool** sequence. A send / dispatch is **not** a motion step. |
| Box | HTTP POST one-shot (`src/server/travis-box.ts` → `api.sprites.dev` `/exec`). Sprites **has** WebSocket exec + `env` query. We do not stream stdout to the phone. |
| Backlog | List + views All / In motion / Initiatives (`BacklogIndex`, `BacklogTicket`). No board. No coordinates. |
| Thought / roster | Circles glow when `thoughtStatus === "streaming"` or working (`Room.tsx` + `SeatMark`). Not a heartbeat. |
| Here | Travis’s pushed environment (`src/lib/room-context.ts`). Dest, roster, motion count, open titles. Not a founder plate. |
| In-flight door | Founder glass: `src/components/plates/InFlightDoor.tsx`. Running / waiting seats, elapsed. |
| Job table | **Ascribed in Packet 023, not planted.** `job_id`, `assigned_seat`, `payload`, `idempotency_key`, `timeout_ms`, `status`, `created_at`, `last_heartbeat_at`. |
| Canvas layout | **Not ascribed.** No zone / x / y store. Do not mint. |
| Watch glass (PM) | Grow Here / `work_in_flight` / motion. **No new watch app.** A DAG graph or a Figma canvas is new components → generate a plate **only if PM prints**. |

Gemini’s latency rules (optimistic edges, <128-byte chunks, 60fps drag, 15s stale) are **correct product physics**. They are not planted. The missing piece on every pattern except backlog-list is a **push bus**. Today the phone guesses by polling.

---

## Sequence (dependencies, not a ranking)

This is the order things *can* be built. Founder names the plant cut.

```
021 box (planted, HTTP)     already on main
023 dest + job row          first — no new glass
022 ports                   after 023 gate (signed #120; not this)
────────────────────────────────────────
4  Seat health              job.last_heartbeat_at + seat_live_run
3b Backlog / in-motion      existing motion + optional job attach
1  DAG / step list          job.status_changed → grow in-flight first
2  Terminal / diff          Sprite WS + a door (not Voice)
3a Spatial canvas           last — refuse until SA ascribes a store
```

**023 before all five that need a job or a heartbeat.** Gate + job row is harness, not a visual. Without the row, a DAG is scenery and a badge is a lie.

**022 does not unlock any of the five.** Ports authorize Cursor / GitHub / Sprites / OpenAI / Resend. Unfold and Sprite already have env names. Streaming the box still needs Sprite WS wiring, not `travis.port`.

**021 is the box host, not the stream.** `run_box` / `prove_box` return a receipt when the HTTP exec finishes. Pattern 2 replaces that pipe, it does not ride the current POST.

---

## 1. Pipeline graph / DAG (orchestration & dispatch)

### What

Hook the **023 job row**, not `travis.motion`.

Motion is “which tools Travis called this wake.” Dispatch is “which job is on which seat, parent → child.” Gemini’s `(job_id, parent_id, state, timestamp)` needs **`parent_id`**, which Packet 023 did not list. SA must add `parent_id` (nullable) before a graph is honest. Until then the honest surface is a **flat list of jobs**, not a DAG.

Reuse:

- `travis.motion` / `motion_step` — stay the tool tape. Do not pretend a send is a step.
- `work_in_flight` (Travis tool) + Here (`src/lib/room-context.ts`) — first **truth**. Rows keyed by `job_id`, status from the row.
- Founder glass: `InFlightDoor` — pulse while `in_progress`. Do not add a graph here.
- Roster `SeatMark` / thought glow in `Room.tsx` — can take a job-count, not a graph.

New (only if PM prints a graph plate):

- Postgres: 023 job table + `parent_id` + emit `job.status_changed` (LISTEN/NOTIFY or a later SSE route).
- Client: optimistic **edge** on create (child appears the instant Travis inserts the row). **Fill** waits for the status write. No fade-in. Snap on terminal state.

Do **not** draw GitHub-Actions chrome on Voice. Labor is not an effect. Phone-first stays Log / Here / in-flight.

Latency Gemini named is right: optimistic connection, hard ack for color. Today we have neither event nor parent.

### When

**After 023 is planted and emitting status.** Not before Envelope 021/022.

Relative to the other four: **third to *look* like a graph**, **second to *show* as a list** (after seat health, or with it — same table). Canvas and terminal do not block this. This blocks a truthful “in flight” badge.

If we ship a node graph before the job table, we are planting Hub scenery.

### Where

| Layer | Path |
|---|---|
| Ascribed, not planted | Packet 023 job table (SA adds `parent_id` if DAG) |
| Motion (do not overload) | `src/lib/motion.ts`, `src/server/queue.ts` |
| First truth (Travis) | `src/lib/room-context.ts` Here; `work_in_flight` in `src/server/travis-tools.ts` |
| First glass (founder) | `src/components/plates/InFlightDoor.tsx` |
| Run truth today | `travis.seat_live_run`, `src/server/seat-pipe.ts` |
| Poll today | `src/components/Room.tsx` |
| Later push | new `/api/jobs/stream` or NOTIFY → SSE — **not ascribed**; name it, don’t mint |
| Graph plate | generate only if PM prints — do not grow I1 or invent a Watch tab |

---

## 2. Live streaming terminal & diff (the box)

### What

Replace the HTTP one-shot exec with Sprites’ **WebSocket exec**, then pipe chunks to a **door**, not the Voice thread.

Reuse:

- `src/server/travis-box.ts` — same Sprite id / token / `execCommand` env. Add a stream helper next to `spriteExec`.
- `run_box` / `read_box` / `write_box` / `prove_box` — keep as tools. Streaming is how **stdout arrives**, not a new verb on day one.
- Envelope 021 receipts — still the Log line when the command **ends**. Stream is the living body behind a door.

New:

- Server: Sprite WS (`wss://api.sprites.dev/v1/sprites/{name}/exec` + `?env=`), chunk flush on newline or ≤128 bytes.
- Client: terminal plate (generate — new components on a face). Auto-scroll lock; unbind on scroll-up. ANSI optional; first slice is plain text.
- Diff: only if a tool returns a patch stream. `write_box` today is one POST. Line-by-line red/green is **not** available until we stream a diff. Do not fake it from a completed `read_box`.

Backend Gemini named (PTY over WS) matches Sprite. We do not wrap a PTY ourselves. We do not tee the stream onto Cursor.

**Do not** dump raw stdout into chat. Pipe hygiene: Log gets the receipt; the door gets the bytes.

### When

**After 023** (so a hung prove is a job we can time out, not a silent HTTP). **After 021** (already true). **Not blocked by 022** (Sprites token already has an env name; 022 only makes authorize the glass).

Relative to the other four: **fourth.** Seat health and job-list can tell truth without bytes. A frozen-then-burst dump is worse than today’s receipt. Do not plant the door to make the box feel live while dest is still mail.

### Where

| Layer | Path |
|---|---|
| Exec today | `src/server/travis-box.ts` (`spriteExec`) |
| Client tools | `src/lib/travis-box.ts`, `src/lib/travis-prove.ts` |
| Tool decls | `src/server/travis-tools.ts` |
| Sprite WS | not in repo — vendor API, same host |
| Door | generate a plate; do **not** add an ANSI pane to `src/components/Room.tsx` Voice |
| Log | existing thread / Here — completion receipt only |

---

## 3. Optimistic spatial canvas & co-presence (backlog / motion, room / canvas)

Two different things Gemini glued. Split them.

### 3b. Linear-style optimistic list / kanban (backlog, in-motion)

#### What

Reuse the backlog we have. Optimistic **status / initiative** moves at pointer speed; revert + toast on failed PATCH. Presence badge = another seat’s `current_job_id` points at this ticket (needs 023 heartbeat).

No coordinates. Views stay All / In motion / Initiatives until PM prints columns. “Kanban” here means **optimistic row move**, not a board.

Reuse: backlog routes, `travis.motion` for “in motion,” ticket `open` \| `done`.

New: client optimistic cache on the existing mutation; optional `job_id` on the ticket **only if SA ascribes it**. Do not mint `board_item_moved`.

#### When

**Lowest glass after 023 if we attach jobs; can start earlier** for status-only optimistic UI (table already exists). Does not wait on 021/022. **Second** among the five for *feel*, because the list is already the face.

#### Where

| Layer | Path |
|---|---|
| Face | `src/components/plates/BacklogIndex.tsx`, `BacklogTicket.tsx`; door on `Room.tsx` |
| Motion | `travis.motion`, `src/lib/motion.ts`, `src/server/motion.ts` |
| Ticket store | existing initiative / backlog tables (do not add x/y) |
| Presence | 023 `current_job_id` / `last_heartbeat_at` once planted |

### 3a. Multiplayer spatial canvas (room / artifacts)

#### What

**Refuse until SA ascribes a store.** There is no canvas layout, no zone id, no `artifact_placed` event. Artifacts are `image` \| `file` on the thread. Rooms are conversation rooms, not a board.

Gemini’s Figma/Liveblocks physics are right **for a canvas product**. This product’s room is Voice / Log. Planting x/y here is minting a table from a picture.

If SA later ascribes `(artifact_id, room_id, zone_id | x, y)` and a delta stream, then: optimistic drag, revert on fail, presence badge from seat heartbeat. CRDT is not required for one founder + seats; atomic deltas are enough.

#### When

**Last. After 023, after 022, after the job list is true.** Maybe never in Phase One. Envelope live-state named the opportunity; SA has not cut the grain.

#### Where

| Layer | Path |
|---|---|
| Artifacts today | thread / artifact registry (`image` \| `file`) — no layout |
| Room | `src/components/Room.tsx` — conversation, not a canvas |
| Missing | SA packet for layout + `artifact_placed` / `board_item_moved` |

---

## 4. Real-time telemetry & status badges (agent seat health)

### What

Grow **existing** chrome. Do not add a Datadog tile.

Reuse:

- Thought / roster circles in `src/components/Room.tsx` (`SeatMark` in `QueueChrome.tsx`) — pulse from `last_heartbeat_at` age, not only `thoughtStatus`.
- Here (`room-context.ts`) + `InFlightDoor` — “2s ago” / stale wash when ping gap >15s.
- `travis.seat_live_run` — still the Cursor run. Heartbeat is the **023 job** `last_heartbeat_at` plus a seat-level ping if the seat is idle (no job).

New:

- Writer: seat-pipe or the supervisor watch loop updates `last_heartbeat_at` on the job (and a seat ping if SA ascribes `seat_id, last_ping_at, current_job_id` as its own row — 023 already has the job half).
- Reader: first slice can stay **poll** as long as the timestamp is true (Gemini: 1–3s jitter OK). Push (SSE/WS) later so we stop lying during the poll gap.
- Instant stale: client clock vs `last_heartbeat_at`; no animation delay.

Do not poll-invent a heartbeat. If the column is null, the badge stays quiet — not “healthy.”

### When

**First visual after 023.** Same table as the DAG’s source. Not blocked by 021/022. Terminal and canvas do not block this.

This is the cheapest honest live signal: dest watch already needs the heartbeat to take a job back.

### Where

| Layer | Path |
|---|---|
| Ascribed | 023 `last_heartbeat_at` on the job; optional seat ping table (SA) |
| Run today | `travis.seat_live_run`, `src/server/seat-pipe.ts` |
| Glass | `InFlightDoor.tsx`, `SeatMark` / thought glow in `Room.tsx`, Here in `room-context.ts` |
| Poll today | `src/components/Room.tsx` |
| Push later | same bus as `job.status_changed` — one connection, two event kinds |

---

## Mapping back to Gemini’s table

| Travis opportunity | Pattern | Our source (honest) | Effort (ours) | Plant? |
|---|---|---|---|---|
| Orchestration / dispatch | DAG → **list first**, graph only if PM prints | 023 job + `parent_id` (SA) | Medium after 023 | After 023 |
| Backlog / in-motion | Optimistic list (not a board) | Existing tickets + motion | Low | Can start; job attach after 023 |
| The box | Sprite WS stream behind a generated door | 021 HTTP today; WS new | Medium | After 023; door after list/health |
| Room / canvas | Spatial canvas | **Nothing ascribed** | High | Refuse until SA |
| Agent seat health | Heartbeat on existing chrome | 023 `last_heartbeat_at` + `seat_live_run` | Low after 023 | First visual |

---

## What this write-back does not do

- Does not plant 023, 022, a job table, SSE, Sprite WS, or a plate.
- Does not grow I1 into connectors (that is 022 glass, separate).
- Does not put a DAG or a terminal on Voice.
- Does not complete or send That’s fine.

Founder names the next plant. Engineer’s order if asked to cut: **023 gate + job row (no glass) → seat health on Here / thought strip → in-flight from job status → 022 ports → box stream door → canvas only after SA.**
