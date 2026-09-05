# Systems Analyst — log

**Seat:** Systems Analyst (machine). Packets + hard decisions so the implementer only cuts. Identity: [`../README.md`](../README.md) § Systems Analyst · detailed [`../seats/SYSTEMS-ANALYST.md`](../seats/SYSTEMS-ANALYST.md). Instructions from the **founder** only. PM flags: [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) (read for the glass, not for job-law). Engineer always-on: repo-root `AGENTS.md`.

**Purpose:** Running log so a new Systems Analyst chat starts where the last one stopped. Stamps are **witnessing history** — not a second product flag.

**Current (read first, then the newest stamp at the bottom):** 2026-09-05 12:50 UTC — **SCP-024 signed.** Stream is a store. Live grain is not the Log tape. Same PR as PM-008 ([#126](https://github.com/bywale-com/travis/pull/126)). Next number is **025**.

**How we maintain this log** (same discipline as Phase One)

- Unless the founder says “mark this as a separate entry/doc,” SA work lands **here** — append-only, newest at bottom.
- **Do not edit a past stamp.** Corrections are a **new** stamp. The only line that moves in place is **Current** at the top.
- Do not overwrite product flags. Align the model to [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) Current pointer.
- Cadence floor while in session: **at least four times a day**; denser conversation → denser stamps.
- Notice inflection (Story/Requirements delta, table mint or refusal, map-vs-store split, founder correction) and **ask**.
- Stood-up truth is migrations / live ports / Cursor API — quote them, do not rely on memory.
- Durable founder expansions: stamp **with specific excerpts**, and park a register markdown so the detail is not only in the log.

---

## 2026-08-25 14:10 UTC — Log opened

**Why:** Founder spinning Travis with Om Coda three-seat practice. PM stays on Phase One; SA will own Story / Requirements / stores / Cursor contracts / ports.

**Assigned first question (answer in a later stamp, after the walk — when this seat is inhabited):** given the Travis flagship (voice interface to Cursor; speak; voice-send; hear readable replies; images in chat; dumb pipe v1), what must change or be stood up in the systems model?

Answer in systems language:

1. **Inventory** — Cursor agent/run/stream contracts + any Travis-local stores (none materialized yet). Separate: materialized · map-only · named silence.
2. **Fit** — each clause of the flagship: housed / partial / missing.
3. **Change** — Story musts, requirements, tables/contracts to mint or refuse; name silences.
4. **Perimeter** — session resume, artifacts, local vs cloud, auth key placement, TTS/STT ports.
5. Stamp an **inventory-delta** here — not a second product flag.

**Do not:** generate a substitute flag list; invent chat chrome; mint a messages table in this opening stamp; design desktop Cursor automation.

---

## 2026-08-26 18:26 UTC — Seat accepted (this chat)

**Why:** Founder seated Systems Analyst; agent browsed `docs/README.md` § SA, `docs/seats/SYSTEMS-ANALYST.md`, this log, PHASE-ONE-LOG (flag + glass through 20:05), PM packet 001 SA paste.

**Accepted:**

- Job-law from **founder** only. Not PM. Not Engineer.
- Own: Story → Requirements → stores/contracts/ports; three layers (materialized · map-only · named silence); change packets so Engineer only cuts.
- Read-only: PHASE-ONE-LOG 14:00 flag wording; PM face/plates as glass.
- Do not: mint tables from pictures; rewrite the flagship; ship secrets; puppet desktop Cursor; plant code.

**Still open (assigned; not answered in this stamp):**

1. Opening first question (14:10) — inventory / fit / change / perimeter for the Cursor seam vs flagship.
2. Packet **001** SA paste A–E — session local vs Cursor-held; speech path; reply/artifacts path (quote API); local vs cloud; auth. Stamp inventory-delta; cut `SYSTEMS-CHANGE-PACKET-001` only when Engineer has no analysis left.

**Ask:** proceed now with the Cursor-seam walk + 001 ascribe (quote SDK/Cloud Agents docs, not memory)?

---

## 2026-08-26 18:40 UTC — Bind existing agents + table-first (founder)

**Kind:** Story / inventory inflection. Founder job-law on agent identity + modularity. Quoted Cursor SDK + Cloud Agents API (not memory).

**Founder excerpts:**

> if this is the thing that is coordinating with… cursor agents… I want to know if it can communicate, if it can triage between cursor agents that are already… spun up, or it has to create a new agent each time… I don’t want the latter, I want the former.

> Making things modular… we don’t hard code systems. It’s like tables And systems, like data and systems, tables and systems… Think like system controls… tables, dumb runtime, and the systems like that we try ours through

**Contract (stood-up Cursor, not Travis store):**

| Op | Source | Meaning for Travis |
|----|--------|--------------------|
| `Agent.resume(agentId)` | SDK TS docs | Reattach to existing agent; `bc-` → cloud, else local |
| `POST /v1/agents/{id}/runs` | Cloud Agents API | Follow-up run on existing agent; uses current conversation + workspace |
| `Agent.list` / `GET /v1/agents` | SDK / API | Enumerate agents for the authenticated key |
| `Agent.create` / `POST /v1/agents` | SDK / API | Mint a **new** durable agent (initial run) — not the default utterance path |

SDK docs also: cloud agents started via SDK show under UI **Filter > Source > SDK** — shared Agents surface with source filters; create ≠ required each turn.

**Ascribe — former vs latter**

- **Wanted path (former) is the API’s design:** durable agent id → resume → `send` / create-run. Create-each-utterance is the wrong shape.
- **“Triage between agents”** here = **routing / binding** (which `agentId` receives the next run). That is Travis control + a row, not Cursor auto-picking, and **not** product triage judgment (v2 speak/show compression).
- **Hard honesty / named silence until founder confirms:** agents “already spun up” in **desktop Composer (local)** persist under local store (`agent-*`, needs bridge + cwd). Agents in **Cloud Agents** persist as `bc-*` and are listable/resumable from a phone-backed Travis server with `CURSOR_API_KEY`. Phone-first **cannot** resume a laptop-local agent without a local bridge or moving those conversations onto cloud agents. Docs claim the same agent model is scriptable across IDE/CLI/web — persistence still splits local vs cloud.

**Modularity (map-only — do not mint yet)**

Table-first applies: do **not** hardcode `PM → this agentId` in runtime.

| Layer | Status | Candidate |
|-------|--------|-----------|
| Cursor agent / run / stream | **External contract** (materialized by Cursor) | `agentId`, `runId`, SSE |
| Travis agent binding | **Map-only** | row: label (e.g. PM), `cursor_agent_id`, runtime cloud\|local, optional repo/name |
| Travis session | **Map-only** | points at current binding + ordered turns Travis needs for pane/TTS |
| Create-agent | **Rare control** | mints a new Cursor agent **and** a binding row — not the default speech path |
| Dumb runtime | **Map-only** | read binding → resume → send → stream → hygiene → TTS/pane |

No migration cut in this stamp. Story must before mint: *session holds a pointer to a binding; utterance becomes a run on that binding’s agent; switching seats/agents is changing the binding pointer (or selecting among rows), not creating an agent.*

**Ask (inflection):** the agents you want Travis to talk to — are they **Cloud Agents** (`bc-…`, Agents window / cursor.com) that you already have running, or **local Composer chats** in the desktop sidebar? That answer locks phone-first binding.

---

## 2026-08-26 18:45 UTC — Cloud lock + hands-free turn-taking options

**Kind:** Story perimeter lock + speech-path possibility space (not frozen law). Packet 001: speech-end remains **Engineer grain**; SA names ports/triggers/silences.

**Founder excerpts:**

> at least for V1, even probably V2, I’m really focused on cloud agents and not the local composer… cloud agents is certainly the mode of work. … in the future, it wouldn’t be bad to … make local composer work, but that’s not the priority right now.

> Turntaking still exists, but without me having to Use my fingers to indicate it’s their turn. … even when you’re doing speech to text, it is still turn taking, but you are the conductor… When you click, okay, stop and send, that’s basically saying your turn… I don’t have a problem with that function. I just can’t use my fingers.

**Locked**

- **Runtime for v1 (and likely v2):** Cursor **cloud** agents (`bc-…`). Local Composer = named future perimeter, not blocking.
- **Turn-taking stays.** The missing piece is a **hands-free conductor signal** that replaces screen stop/send — not “no turns” and not full-duplex chat-without-boundary unless Story later demands it.

**Separate two problems (do not conflate)**

1. **Utterance continuity** — never wipe a long turn (escape ~4‑min mic cliff). Streaming / chunked STT + accumulate until conductor fires.  
2. **Turn boundary** — when accumulated speech becomes `run.send` on the bound cloud agent.

Plate’s “tap once to pause” = **pause listening** control (still on glass for when fingers are free). It is **not** the required per-turn conductor.

**Possibility space (creative; none frozen as product law)**

| Pattern | Conductor | Pros | Risks / cost |
|---------|-----------|------|----------------|
| **A. Voice phrase** (“send”, “over”, “go”, wake-style) | Spoken cue | Matches “I am still the conductor”; clear intent; car-friendly | Need phrase set; false triggers; accents/noise |
| **B. Silence endpoint (VAD)** | Faceless trigger after quiet | Zero ritual | Cuts mid-thought; thinking pauses in motion; founder already named early-cut fear |
| **C. Hybrid** | Soft silence → armed; hard phrase **or** longer silence commits | Phrase for precision; silence as fallback when you forget | Tunable; more states in runtime |
| **D. Confirm beat** | After soft end, Travis asks “send?” → yes / keep talking | Safest against early cut | Extra round-trip; may annoy |
| **E. Hardware conductor** | Headset / car button / stem (not phone screen) | Still explicit conductor; hands on wheel | Device-dependent; not pure web alone |
| **F. Semantic / ML endpoint** | Model judges utterance complete | Can tolerate mid-sentence pauses better than dumb silence | Heavier port; opaque; still falible |

**Barge-in** (speak while Travis is reading → stop TTS, maybe queue follow-up) is a **neighbor** trigger — after reply path — not the same as user-turn-end. Name it; don’t block v1 pipe on it.

**Systems shape (map-only)**

- **Must:** continuous listen while session active (until pause/end); partial transcript accumulate; conductor event → finalize utterance → `resume` bound agent → `send` run.  
- **Must-not:** require screen press per turn; wipe long utterance; freeze a silence millisecond number in Story/UI copy before Engineer proves a path.  
- **Ports:** STT (browser Web Speech vs server streaming STT); optional VAD/endpoint port; optional phrase spotter; TTS; Cursor cloud run stream.  
- **Silence:** exact conductor mix (A–F) — **ask founder bias**; Engineer proves implementation inside that bias.

**Ask:** for v1, which conductor bias — **voice phrase (A)**, **silence (B)**, **hybrid (C)**, or **confirm beat (D)** as safety rail? Hardware (E) as optional add-on later?

---

## 2026-08-26 18:55 UTC — Packet strategy: two cuts; what SA outputs

**Kind:** Process + perimeter. Founder: enough for a pass? Weird thin UI? Split turn-taking systems vs automation?

**Founder excerpts:**

> do you have enough of a semblance to create a packet… or… do a pass on the existing packet? … What is the output from this pass? … anything else you need from me… most of this system is just built in like a go… Maybe the pass on this packet is… just enough of the systems to allow us to work on the turn-taking thing? And then maybe the next systems will be on the automation side

**Answer — what a pass outputs**

PM packet **001** stays face law (glass). SA does **not** rewrite it into a second flag. SA cut = a **systems change packet** the Engineer can implement with no leftover analysis:

`docs/register/SYSTEMS-CHANGE-PACKET-001-….md` (then 002…)

Minimum shape (seat law): Intent · Must/must-not · Stores/fields/contracts (add·change·refuse) · Runtime (who writes/reads/triggers) · Ports (real vs stand-in) · Verify · Out of scope.

**Why the face feels “not enough to test”**

Correct sensation. v1 product face is a **thin pane + controls** on a thick pipe. Smoke is mostly: open → listen → speak → conductor fires → transcript lands → (stub or stream) → readback. Not dashboard density. That is parametric elimination, not missing product.

**Recommendation — two systems packets (agree with founder instinct)**

| Packet | Job | Lets you test |
|--------|-----|----------------|
| **SCP-001** Speech session / turn-taking | Session after one open; STT accumulate (no 4‑min wipe); hands-free conductor → finalize utterance; pause/end session; thread shows user text. Cursor send = **stand-in or single seeded `bc-` binding** (not full triage UI). | Conductor + continuity without needing agent picker |
| **SCP-002** Cloud agent binding / routing | List/resume cloud agents; binding table rows; session points at binding; real `send` + stream → TTS hygiene + artifacts. Create-agent = rare control. | Talk to *your* existing PM (etc.) agents |

Do **not** stuff Automations / PM→SA→Engineer auto-chain into 001 or 002 — still parked next module (PHASE-ONE-LOG 19:44).

**Pass on PM-001:** read-only glass. SA ascribe fills A–E into SCP-001/002; no table mint from the plate picture.

**Still need from founder (blocking SCP-001 cut)**

1. **Conductor bias** for Story must: A phrase · B silence · C hybrid · D confirm — or “Engineer proves inside hybrid envelope.”  
2. Confirm **two-packet split** above (or insist one fat pipe packet).  
3. Optional: for 001 smoke, is **one seeded cloud agent id** (row/env) acceptable until 002 list/bind UI — yes/no?

**Not blocking:** local Composer; multi-seat auto-wake; triage judgment; full binding UX.

---

## 2026-08-26 19:00 UTC — Locks + SCP-001 cut; where `bc-` comes from

**Kind:** Founder answers + change packet. Inflection: no hard-coded data (table/seed only).

**Founder excerpts:**

> maybe a phrase like… I'm done with this message. I'm done, or I'm done with this

> For number two, yeah, I like your split

> we don't ever put data, we never hard code any data ever. If there's a need for data, then we need to find out what table or field it should needs to be in. … where do I get this … Cloud Agent ID from?

**Locked**

1. Conductor = **done-phrase** family (seeded in `turn_conductor_phrase`).  
2. Split = SCP-001 turn-taking · SCP-002 list/bind/resume.  
3. **No hard-coded data** in source. Agent id → `agent_binding.cursor_agent_id`. Phrases → `turn_conductor_phrase`.

**Where to get a cloud agent id (for seed data, when you want real send)**

1. Open an existing cloud agent at [cursor.com/agents](https://cursor.com/agents) (Cloud mode — not local Composer).  
2. URL shape from Cursor docs/API examples: `https://cursor.com/agents/bc-…` — the path segment **`bc-…`** is the id.  
3. Or with a user API key: `GET https://api.cursor.com/v1/agents` → each item’s `id` field (`bc-…`).  
4. Paste that value into the **`agent_binding`** row (SQL seed / insert) — never into SPA constants.

You do **not** need to paste an id into this chat for SCP-001 to start: Cursor port is **stand-in** until that field is non-empty. Provide the id whenever you want optional real-cloud smoke on 001, or wait for SCP-002.

**Cut:** [`SYSTEMS-CHANGE-PACKET-001-VOICE-TURN.md`](./SYSTEMS-CHANGE-PACKET-001-VOICE-TURN.md)

**Ask:** ready for Engineer handoff on 001, or revise phrase list / stores first?

---

## 2026-08-26 19:10 UTC — Seed agent id for `agent_binding`

**Kind:** Founder data for mint/seed. Not source hard-code.

**Founder:** use this agent id to start: `bc-da5db04b-db60-414e-b0c3-c8ed337d5d4`

**Ascribe:** lands only in **`agent_binding.cursor_agent_id`** seed (SCP-001 updated). Label `PM`, runtime `cloud`, active.

**Note:** last segment `c8ed337d5d4` is 11 hex chars; Cursor API examples use full UUID (12 in that group). If `Agent.resume` / `GET /v1/agents/{id}` fails, re-copy from the browser URL and patch the **row**.

**SCP-001:** stand-in no longer required for smoke when server has `CURSOR_API_KEY` and this seed loads. Still must-not put `bc-…` in SPA or compiled constants.

---

## 2026-08-26 19:12 UTC — Agent id correction

**Kind:** Founder correction (new stamp; do not edit 19:10).

**Founder:** good catch: `c8ed337d45d4`

**Correct seed:** `bc-da5db04b-db60-414e-b0c3-c8ed337d45d4`  
**Supersedes:** `…c8ed337d5d4` from 19:10.

SCP-001 seed field updated.

---

## 2026-09-03 00:21 UTC — SCP-007 room membership signed

**Kind:** Table mint + runtime lock. Founder job-law 2026-09-02. Engineer drafted SQL; they have not run it and have not added it to `migrate.ts`.

**Seat:** Systems Analyst. Talk with the founder only. Not PM. Not Engineer.

**Founder excerpts (lock):**

> Room membership lives in our schema — a relation between a room and an agent, carrying a role and a joined-at. Not Cursor metadata.

> Rooms are now the primitive. Agents are unbounded. Anything Travis can do, I must also be able to do by hand (effect parity, not surface parity).

**Quoted stood-up truth (`origin/main` HEAD `b2d127b`):**

- `travis.agent_binding` — global, unique `seat_key`. Four migrate rows: `pm`, `sa`, `engineer`, `travis`.
- `travis.voice_session` — today’s room. No `title`. Dest FKs: `binding_id`, `default_binding_id`, `active_binding_id`.
- Roster: `roomSeats()` in `src/app/api/session/route.ts` selects every `agent_binding` where `active = true`.
- Resume: `liveSessionForIp` — latest `status <> 'ended'` for `client_ip` (Hotfix 014).
- `travis.seat_live_run` PK = `binding_id` (one live Cursor run per agent, all sessions).
- `travis.queued_utterance` already `(session_id, binding_id, seq)`.
- SCP-002 minted session + bindings + turn kinds. Did not mint membership or title.
- Official packets on `main` disk: 001, 002 only.

**A–H:**

| | Decision |
|--|--|
| A | **SIGN** — no second room table; `voice_session.title` empty-legal |
| B | **SIGN** — `room_membership` SQL as drafted |
| C | **SIGN** — Travis facilitator; refuse remove of open facilitator |
| D | **SIGN backfill** for existing sessions. **AMEND** new rooms: chosen + Travis, not catalog cross-join. After plant, roster = open memberships |
| E | **SIGN** — `seat_key` globally unique; create-agent columns out |
| F | **SIGN** keep dest FKs and `seat_live_run`. **AMEND** dest must be an open member. Name follow-on: two rooms cannot both run one Engineer |
| G | **SIGN silence** — no founder presence / Leave field. End closes session + all open memberships. Leave writes nothing |
| H | **STRIKE / REMAP** — this packet is **007**, not 003 |

**Remap (packet number ≠ plant order on `main`):**

| # | What | On `main` disk? |
|--|--|--|
| 001 | Voice turn | yes |
| 002 | Room (modes, seats, dest FKs) | yes |
| 003 | Queue / barge | planted; packet file not on `main` |
| 004 | Talk / Type composer | planted; packet file not on `main` |
| 005 | Log format | planted; packet file not on `main` |
| 006 | Travis agent | planted; packet file not on `main` |
| 007 | Room membership | **this cut** |

**Glass:** read V1–V4 on the rooms-envelope branch. Do not mint from pictures. This packet houses title + membership + create / add / remove / End. V4 create-agent waits.

**Cut:** [`SYSTEMS-CHANGE-PACKET-007-ROOM-MEMBERSHIP.md`](./SYSTEMS-CHANGE-PACKET-007-ROOM-MEMBERSHIP.md)

**Handoff:** Engineer pastes the signed SQL + Drizzle, switches `roomSeats()`, writes the runtime in the packet. No leftover analysis.

---

## 2026-09-03 15:57 UTC — SCP-012 OS house (landed; stamp late to main)

**Kind:** Witness. Packet planted via Engineer PR #93. SA packet file is on `main`.

House-now = `travis.os_node` (rows that look like folders). `/`, `/protocols`, `/templates`. Writers = founder HTTP + Travis tools. Agent/room folders stay their tables. Seated / POSIX / integrations table refused.

**Packet:** [`SYSTEMS-CHANGE-PACKET-012-OS-HOUSE.md`](./SYSTEMS-CHANGE-PACKET-012-OS-HOUSE.md)

---

## 2026-09-03 20:53 UTC — SCP-013 In motion (landed; stamp late to main)

**Kind:** Witness. Packet planted via Engineer PR #97. Founder plates: [`PLATES-IN-MOTION.md`](./PLATES-IN-MOTION.md). PM parked this pass.

Two models, one Backlog pile. `travis.motion` + `motion_step`. Not an initiative status. Runner is not the voice turn. P1 counts Travis processes only.

**Packet:** [`SYSTEMS-CHANGE-PACKET-013-MOTION.md`](./SYSTEMS-CHANGE-PACKET-013-MOTION.md)

---

## 2026-09-03 21:00 UTC — SCP-013 founder correction (no caps)

**Kind:** Founder correction.

**Founder (preserved):** does not care for caps. “Two executing at once” is not the law. He was going to say **100 executing at once**. Do not invent a product ceiling.

Packet on `main` already has question 5 = **None**.

---

## 2026-09-03 23:06 UTC — Seat handoff

**Kind:** Seat law. Founder: update so this seat can be handed off.

**Done:** Accept + Handoff in [`../seats/SYSTEMS-ANALYST.md`](../seats/SYSTEMS-ANALYST.md). README SA paste + identity match. `AGENTS.md` points takeovers at § Handoff. Current no longer stuck on 007.

**Law written into the seat (was only in a chat):** plates as staples; PM may be parked; do not invent caps; job-law from the founder only.

**Successor starts:** README SA paste → § Handoff → this Current → newest stamp → 013 packet. Next number is **014**.

---

## 2026-09-04 16:54 UTC — SCP-014 Log beats + Voice create (Engineer leftover)

**Kind:** Engineer handoff pickup. [`PLATES-LOG-FACE.md`](./PLATES-LOG-FACE.md) + [`ENGINEER-HANDOFF.md`](./ENGINEER-HANDOFF.md). L1 / dest-seat hang / L3 are 064. Two leftovers named SA.

**Ascribed:**

1. **Beat closer** — dest-seat posts use `nextLiveTravisText` insert/update (059 law). Snapshot stays one row. New message inserts. `referenceTurnId`: beat 1 = user turn; later = previous `agent_post` of that seat. Artifacts hang on the **current** beat. Port must not re-glue at `conversation()`.
2. **`create_agent`** — same write as V4. `join` default true (membership `member` in this room). No role. No protocol. No cap.

**Refused:** `link` kind, seated, heard, reminting 064.

**Cut:** [`SYSTEMS-CHANGE-PACKET-014-LOG-BEATS.md`](./SYSTEMS-CHANGE-PACKET-014-LOG-BEATS.md)

**Handoff:** Engineer pastes absorb/insert, quote chain, harvest-on-current-beat, `create_agent`. Do not remint 064.

## 2026-09-04 18:03 UTC — SCP-015 disposable seats (Engineer envelope)

**Kind:** Envelope pickup. [`ENVELOPE-DISPOSABLE-SEATS.md`](./ENVELOPE-DISPOSABLE-SEATS.md) (PR #105). PM parked. House files are labor in `os_node`; `house-now/` is the git receipt.

**Ascribed:**

1. Seated = `agent_binding.protocol_path` (house path). Empty at create. Locked paths: `/protocols/pm.md` \| `sa.md` \| `engineer.md`. Not `seat_key`. Not membership `role`. Not Travis.
2. Idle = this room + that path + no `seat_live_run`. Oldest `joined_at`.
3. Role dest: never enqueue. Next idle or spin + sit. Person dest (`who`): queue stays.
4. Hand protocol = harness `read_os` WHERE + logging + protocol, then send to that binding. Create stub unchanged.
5. Log: work-repo files as locked. No repo → `/logs/<role>.md`. No `seat_log` table.
6. No remint 012–014. No migrate-seed. No cap. No role plate.

**Cut:** [`SYSTEMS-CHANGE-PACKET-015-DISPOSABLE-SEATS.md`](./SYSTEMS-CHANGE-PACKET-015-DISPOSABLE-SEATS.md)

**Handoff:** Engineer plants the column, `sit_agent`, role route, harness hand. Plant 014 first if `create_agent` is not on `main`. Founder lands ALTER.

---

## 2026-09-04 22:28 UTC — SCP-021 worker (Engineer envelope on #119)

**Kind:** Envelope pickup. [`ENVELOPE-TRAVIS-WORKER.md`](./ENVELOPE-TRAVIS-WORKER.md) (PR **#119**). Founder: priority **1–4**; five stays back. Engineer did not plant the loop. Packet on **this same PR**.

**Ascribed:**

1. **Prove** — `prove_box` (`do` + `check`|`path`|`url`). Same Sprite. Max 3 cycles. Stop and name failure. No prove table. `run_box` stays one-shot. `write_box` gets one `test -e` + one retry. Model calling `run_box` again is not a loop.
2. **Keep** — house (`os_node`) and box (Sprite disk) are **two**. Join is unfold copy only. Do not dump rows onto disk. No object storage. One Travis, one box, env pointer.
3. **Unfold** — `unfold_repo`. Source `/templates/work-repo` in the house. Empty = fail (no migrate-seed). Key `TRAVIS_GITHUB_TOKEN` (not `GITHUB_TOKEN`). Private repo. Token never written to the disk. 042 does not move.
4. **Hands** — box tools never Cursor send. No auto-sit. No computer use. `prove_box` on the motion allowlist; `unfold_repo` is not.
5. **Five** stays named silence.

**Cut:** [`SYSTEMS-CHANGE-PACKET-021-WORKER.md`](./SYSTEMS-CHANGE-PACKET-021-WORKER.md)

**Handoff:** Engineer plants prove on #119, then unfold (may be not-wired). Next packet number is **022**.

---

## 2026-09-05 04:25 UTC — SCP-023 tightness (Engineer draft on #123)

**Kind:** Envelope + draft pickup. [`ENVELOPE-TRAVIS-TIGHTNESS.md`](./ENVELOPE-TRAVIS-TIGHTNESS.md) · draft [`SYSTEMS-CHANGE-PACKET-023-TAPE.md`](./SYSTEMS-CHANGE-PACKET-023-TAPE.md). Packet on **this same PR**.

**Ascribed:**

1. Story — children in Cursor; tightness in our runner; dest is not mail. 021+022 without the gate do not finish it.
2. Gate in `send_to_seat` / `dispatch_to_seat`. His / theirs / nobody. Catalog fallback **dies**. Vacant / empty `protocol_path` = nobody. Blocking send dies.
3. Mint `travis.dest_job` (`binding_id`, payload, idempotency, heartbeat). `parent_id` nullable; no DAG. Take-back = Travis receipt, he stays dest.
4. Card hang **B** — `motion.founding_turn_id`. Auto one-step motion for in-turn nobody-work. No new kind. No third labor table.
5. Mutate-the-tape, unseat, SSE, create/sit-on-queue: **named silence**. Keep 013 refuse. Poll this packet.
6. 022 stands on #120. Plant after this gate is on `main`. Do not remint `travis.port`.

**Cut:** [`SYSTEMS-CHANGE-PACKET-023-TAPE.md`](./SYSTEMS-CHANGE-PACKET-023-TAPE.md) now **signed**.

**Handoff:** Engineer plants thread truth → card B → gate + dest_job on #123. Next packet number is **024**.

---

## 2026-09-05 10:19 UTC — Backlog verbs (combined request, hung on 023)

**Kind:** Findings. Combined hand: look at the face, then delete / complete / …. **Not a new ticket. Not 024.**

**Ascribed** on [`initiatives/023-tightness/BACKLOG-VERBS.md`](./initiatives/023-tightness/BACKLOG-VERBS.md):

1. Complete and rename are already writes. Missing on the ticket face. Founder + Travis (when asked). Seats never. Seat finish ≠ done.
2. Discard is the hole. Unused → delete row + unstamp founding (request again). Used → refuse; do not call it done. No `void` status.
3. Reopen is the mirror of accidental Done.
4. Hold stays the only promote. No priority, assignee, merge, archive.
5. Gate: mailing complete/delete is **his**.

**Handoff:** 023 plant order unchanged. A slim follow-on plants discard + reopen + Done on the ticket if the founder seats it.

---

## 2026-09-05 12:50 UTC — SCP-024 Stream (PM-008 on #126)

**Kind:** Packet ascribe. Automation woke this seat. PM-008 + ST1–ST3 on this PR. No SYSTEMS-CHANGE-PACKET for 008 was on the branch. 023 stays planted — not reminted.

**Seat:** Systems Analyst. Job-law from the founder (plates + PM-008 lock). Not PM. Not Engineer.

**Founder lock (from the packet, not rewritten):** Live work is not the Log. Door = working seat → compartment titled Stream. Trigger pinned. Live order, completely, at the grain that occurred. Done → same record is the card above the completed message. Applies to Travis. Four primitives are an idea, not a closed store. `file_plan` is a spine. “Look at this repo” + URL is an ask.

**Staples (not scenery):** **Stream** (compartment title = card title). Trigger text (user line = pin = card line). Glow = door.

**Quoted stood-up:**

- Log hides open `agent_post` in the client (`threadTurns` + `isOpenStreamingPost`). The row is still `voice_turn`.
- Door is italic `onSeatMark` (`RosterDoor.tsx`).
- Cursor port drops `tool_call` / `tool_use` (`cursor-port.ts` L272).
- Box `run_box` is one-shot `{ exit, stdout, stderr }` (`travis-box.ts`).
- 023 `dest_job` + MotionCard on `founding_turn_id` stand. Receipt, not stream.

**Ascribed:**

1. **Mint** `travis.stream` + `travis.stream_event`. Live vs completed is one object. Card cannot drift. Process order is not `motion_step` and not `dest_job.payload`.
2. **Trigger** = `trigger_turn_id` → `kind=user`. No user trigger → do not open (faceless silence).
3. **Events:** `message` (014 grow/insert) · `process` (actual tool name + actual body) · `thought` (in stream, not spoken, not a new Log `agent_thought`). Not Look/Find/Term/Write/Hand.
4. **Seam:** live writes events. Close lands 014 beats on `voice_turn`. `close_turn_id` = completed `agent_post`. Same `stream.id` is the card. 023 founding posts still hit the tape. MotionCard hang **B** stays under founding. Two hangs. Do not merge.
5. **One live** per `(session_id, binding_id)`. Dest queue waits. Extra Travis motions append. Cursor process: stop dropping tool events. Box: start + blob, not a PTY.
6. **Silences:** chunked box; Find rename; initiative follow-on stamp; Hear / Next / Skip; primitive table; live artifacts; faceless open; failed-without-close card; 04:58 request line; 022; SSE bus.

**Cut:** [`SYSTEMS-CHANGE-PACKET-024-STREAM.md`](./SYSTEMS-CHANGE-PACKET-024-STREAM.md)

**Handoff:** Engineer plants 024 on **this same PR**. Next packet number is **025**. Do not remint 023. Do not mint a cousin.
