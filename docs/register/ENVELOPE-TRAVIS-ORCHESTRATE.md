# Envelope — Travis orchestrates; the turn is not the work (Engineer → PM)

**Kind:** Envelope. **Not a packet. Not a hotfix. Not plant law.**
**Seat:** Engineer. Founder locked: until Travis is the seat of work, **PM is out**. Engineer draws the glass. Founder signs. Then **SA**. Engineer does not mint stores from this file. Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
**When:** 2026-09-03. Same day as SCP-012. Lived Voice smoke in room `0e8875f8`.
**Plates:** [`PLATES-IN-MOTION.md`](./PLATES-IN-MOTION.md) — P1 Voice count · P2 is the In motion **view of Backlog**. Founder recut: **no second list.** Backlog views = All / In motion / Initiatives. Voice “N in motion” = Travis processes only.
**Ask:** Systems Analyst ascribes **two models in one pile** + the runner. Do not mint a second index. Do not mint from the PNG.

**Flag (unchanged):** Phase One 14:00 UTC 2026-08-25. Do not overwrite founder wording.

> I simply don’t wanna have to look at my phone. When it’s time to work on building, I open this app — not the Cursor app — and I can have a dialogue: talk, voice-send, hear the reply read back. Everything readable in the chat is read to me; images and such appear in the chat. It’s an interface between me and Cursor as it exists today.

**This envelope does not replace:**

| File | Altitude |
|------|----------|
| [`ENVELOPE-ROOMS-AND-AGENTS.md`](./ENVELOPE-ROOMS-AND-AGENTS.md) | Rooms as primitive. Effect parity. Largely planted. |
| [`ENVELOPE-TRAVIS-OS-TREE.md`](./ENVELOPE-TRAVIS-OS-TREE.md) | Travis as OS tree. House-now planted as SCP-012. Seated still open. POSIX later. |

Do not collapse those into this. This is the **work layer**: Travis accepts many jobs, they run to completion **outside the voice turn**, he stays in the conversation, and the founder can **see** that orchestra when they glance.

---

## How we got to this fork

Lived thread, in order. Not a generated flag.

### 1. House, then “what is a tool even”

SCP-012 gave Travis a house (`travis.os_node`: `/`, `/protocols`, `/templates`). Rows that look like folders. Not POSIX. Founder asked if that *is* a filesystem (yes, a house), whether UX differs from Unix (you never `ls`; he emits a JSON function call), and how tool calling works (ChatGPT / ElevenLabs shape: menu of name + schema → model emits JSON → **our** server runs → string goes back → he speaks).

He can create directories **only as parents of a file write**. Outside the house he **asks a seat**. That is okay until the ask *is* the work.

### 2. The founder felt the tools were brittle

Not a vibe. Room `0e8875f8`, 2026-09-03 ~20:22 UTC, Voice.

Founder: two backlog items have garbage titles; go **into** them, see what they are really about, **rename both**.

Travis: “I’ll peek into each, then rename them clearly.”

~80 seconds with **no turns**. Founder: “How is that coming along?” Travis: still in progress; re-fetch; then **one** quiet narration — “Renaming that initiative” (singular). Founder: “Did it complete?” Travis: titles still old; the calls did not land.

The rows are still `Tell me, like, how is the initiative,` and `By the way, I want you to just pass`.

Earlier the same day (17:59) he had claimed he could not rename the **room** — `rename_room` exists; Live had not picked it up, and the utterance stuttered.

### 3. Engineer named three stacked causes (symptoms)

1. **Voice tools fire after the sentence.** The plan is spoken first. A new utterance (“how is that coming?”) is a new turn. The plan was only in his head.
2. **A to-do is not a list he holds.** No stored checklist. Several function calls in one model response are run **one after another**. Live usually emits **one** call per turn. `send_to_seat` **blocks** until that seat finishes. `dispatch_to_seat` can start **different** seats and return.
3. **Rename needs an id that list/read never print.** `formatInitiativeList` / `formatInitiativeRead` omit the uuid. `rename_initiative` requires it. So the write had nothing honest to hold.

(3) is a hygiene hole on an existing tool. It is **not** this envelope’s plant. Do not let PM treat “print the id” as the orchestration product.

### 4. Founder: it is beyond the id — speak to the vision

Quoted, 2026-09-03:

- Maybe the architecture itself.
- Travis should orchestrate even **100 tasks at the same time**. How completion is **reported** is a **separate story** — another request, later.
- He should take those things **all the way to completion**, and **detail / document / specify / organize** them somewhere.
- Some of those tasks are **backlog items**. Some are **his own tool plans** — a sequence of two calls that must happen in order; when one completes, the next runs.
- **Travis is not stuck.** The founder keeps talking even while tasks are being orchestrated.
- On Voice they are **not looking at the phone** — same flag — but they want the **ability to see**, in **real time**, everything they have said that Travis is orchestrating.

Engineer read, confirmed by the founder: **yes, write the envelope.** Nudge plates so PM is not confused. Do not lock plate names or counts.

---

## Founder locks this envelope is under

| # | Lock | Meaning |
|---|------|---------|
| O1 | **The turn is not the work.** | Talking to Travis must not be “cancel the orchestra.” |
| O2 | **He stays available.** | Voice / Talk stay live while jobs run. `send_to_seat` freezing the conversation is the old shape for a *batch*. |
| O3 | **Many jobs, few hands.** | “100 at once” is a hundred **organized** items, a few **in flight**. Not 100 Engineer shells. One Cursor seat still runs one job. |
| O4 | **Two kinds of work, one orchestra.** | Backlog / seat sends **and** his own ordered tool sequences (read, then rename). Both must be able to live outside the utterance. |
| O5 | **Organize now; report later.** | Detailing / documenting / specifying the work is in. A completion digest can be a later ask. Do not block the pocket on a report plate. |
| O6 | **Glance when I look.** | Voice-first. They should not *have* to watch. When they look, the orchestra is visible **now**, not a recap he invents. |
| O7 | **House and seats stay what they are.** | JSON tools. Cursor seats. OS house. No POSIX. No computer use. No Travis-as-shell. Outside the house he still **asks** a seat — unless the job is *his* tool sequence, which must not require a seat. |

---

## The architectural sentence

**Brittleness is not “we used JSON tools.”** ChatGPT and ElevenLabs use the same establishment. The failure is: **the chat turn is the orchestrator.**

The model’s context for one utterance holds the plan. Voice makes that fatal (speak the plan → tools after `response.done` → barge = new response). Talk/Type caps the loop at **six** tool rounds, then he is told he ran out of steps. There is no row that says “step 2 waits on step 1.” Nothing **wakes** when a seat finishes or a house write lands and fires the next step while the two of you are already elsewhere.

Where this is going: **he commits work out of the conversation.** A dumb runner that is not Voice advances it. He is free. You can talk. You can glance.

That is **one layer**, not a rebuild of the pipe.

---

## What is already stood up (quote, do not remember)

### He can already detach **seat** work

| Port | What it is | Limit |
|------|------------|--------|
| `dispatch_to_seat` (039) | Start a Cursor seat, return immediately | One live run per `agent_binding` (`seat_live_run`). Same seat queues. |
| `send_to_seat` | Block until that run finishes | This is what makes *him* stuck if he uses it for a batch. |
| `queued_utterance` | Waiting lines per seat in this room | Drain when the seat is idle. |
| `work_in_flight` | What is running + how long + what waits | Seats only. Not his house-tool plan. |
| V6 `InFlightDoor` | Plate: running, waiting, quiet “send next” | Same: seats. Manual dispatch parity. |

### He can already hold **tickets**

`travis.initiative` — open / done, title, founding line, Next derived. Elevation = Hold or via-Travis pass-on. A seat finishing does **not** mark done. Backlog index + ticket plates are planted (057).

This is **not** “read then rename these two titles.” That pair never became a ticket. It also never became a plan.

### He can already file **in the house**

`list_os` / `read_os` / `write_os` + `GET`/`PUT /api/os`. Sync, in-turn. No sequence. No wake.

### The voice tool path (why the room felt dead for 80s)

Live: `interpretRealtimeEvent` → on `response.done`, if there are `function_call`s, the phone `POST`s `/api/session/:id/live/tool` **one after another**, then `response.create`. `runTools` is fire-and-forget (`void`). A new founder utterance is a new model response. Tools on Live are the menu from **this** connect (`session.update`). Stale Live = missing tools (17:59 `rename_room`).

Talk/Type: `generateTravisText` loops at most **six** times.

### Hygiene (named, not this plant)

List/read initiative **omit id**. Rename **requires id**. Fixing that does not create an orchestra.

---

## The missing machine (name the gap; do not mint)

SA ascribes after PM. Engineer’s questions, not schema:

1. **A plan that is not a chat turn** — one accepted job with ordered steps (his tool, and/or a seat send). Survives “how is that coming?”
2. **A runner that is not Travis-talking** — when step 1 completes, step 2 runs, even if dest is still Travis and they are mid-sentence about something else.
3. **Concurrency law** — in flight vs waiting. Bounded by seats (and by how many of *his* tool steps you allow at once — house writes are cheap; `send_to_seat` is not). “100” is cardinality of the **list**, not of shells.
4. **Relation to `initiative`** — do not silently overload the backlog. Some orchestra items **are** tickets. Some are not (the two-rename sequence). SA says whether plan *is* initiative, *points at* initiative, or is a sibling. Engineer will not pick.
5. **Relation to the house** — a step may be `write_os`. That is not unfold-into-their-repo (still ahead).
6. **Who files the plan** — he does, from what they just said (“rename those two”). Founder parity: they can see it and, if PM wants, nudge/cancel by hand. Labor (he condenses the ask into steps) is **not** a “Build plan” button unless PM says the effect needs a hand control.

---

## What “100 at once” is not

- Not 100 parallel Engineer Cloud runs. `seat_live_run` is one per binding.
- Not 100 Live tool loops. Live is one conversation.
- Not a kanban product. Phone. One glance.
- Not Travis judging what is worth doing (v1 pipe; no triage). They **said** the work. He **accepted** it. Organization ≠ judgment.

---

## Glass — nudge, do not lock

Founder: *I am not saying specify exactly the plates. Nudge so PM is not confused.*

**The job of the glass (if any in this pocket):** when they look, they see **everything they have already said that he has accepted to orchestrate**, updating while they are still in Voice. Not a recap he invents. Not a tool-debug console. Not a second product.

**Do not confuse these existing surfaces with that job:**

| Existing | What it actually is | Why it is not enough alone |
|----------|---------------------|----------------------------|
| **V6 / In-flight** | Cursor seats running + waiting in **this** room | His two-step rename never appears here. |
| **Backlog** | Tickets (`initiative`) | The rename pair was not a ticket. A tool sequence is not `open`/`done` unless SA says so. |
| **Thread / narration** | One quiet line per loud write (“Renaming that initiative.”) | A receipt is not a list of accepted work. Eighty silent seconds were “peek” (`read_initiative` has no narration). |
| **Voice subtitle** | Glance while he speaks | Must not become a status board of 100 items. |
| **Request log** | Every founder/pass-on line | History of asks, not the orchestra’s now. |

**Nudge (PM may refuse any of these):**

1. **Prefer one glance over three new lists.** If you print, it is probably **one “in motion” face** that can show seat work *and* accepted plans — a growth of V6, or a sibling that V6 becomes the seat-slice of. Do not print “Plans” *and* keep V6 *and* keep Backlog as three equal bars. Parametric law: one job per surface; second job behind a door.
2. **Do not print a planner.** No swimlanes, no 100-row board, no “add step” chrome. They spoke the work in Voice. The list is for when they look.
3. **Do not print a tool debugger.** JSON names, call ids, and stack traces are not the product. If a step failed, the glance says it failed in human words (titles did not change).
4. **Voice stays the product face.** The orchestra must not take the orb. Working / in-flight as presence is already on K2. That is “he is busy,” not “here are the hundred.”
5. **Reporting completion is out of the first glass** unless you pull a sliver. Founder said that is a later ask. A row flipping to done on the glance is enough for “I looked.” A spoken digest is a request.
6. **Empty / one / many / just-finished while they talk** are completes of whatever you lock — not extra PNGs.
7. **Effect parity:** if he can accept a plan, they can see it. If he can drop a waiting seat line, they already can on V6. If cancel-a-plan is in, it needs a hand door, not Travis-only.
8. **Hygiene (id on list/read) is not a plate.** If you mention it, park it as Engineer/SA on the existing tools — do not let it eat the packet.

**Allowed outcome:** PM locks **no new plate** and says the glance is spoken (`work_in_flight` grown) plus backlog, and the **store + runner** still go to SA. That is coherent if the first plant is machine-only (like SCP-012 house). Say so explicitly if that is the pass — do not leave Engineer guessing whether the face is in.

---

## Implied if you lock a glance (bucket 3)

- An item they just spoke appears without opening a form.
- An item finishing while they are in Voice does not yank them out of Voice.
- Waiting vs running is readable at a glance (V6 already taught this for seats).
- “How is that coming?” can be answered from the store, not from vibe.

---

## What is deliberately not in this envelope

- No table mint. No `travis.plan` / `step` / `wake` named as if they existed.
- No plant. No runner process. No POSIX. No computer use. No dedicated “orchestrator server” as a requirement — SA may keep this on the same Vercel + Postgres wake (queue drain already is request-scoped).
- No seated-link. That stays the OS-tree open beat.
- No unfold-template-into-their-repo.
- No triage / judgment about which of the 100 is “worth” it.
- No second room on the glass.
- No Browse OS plate (012 refused it; still refused).
- Do not append PM or SA logs from this file.
- Do not treat “add id to list_initiatives” as the product. It is a sharpening of 010’s catalog, if someone cuts it.

---

## What SA will be asked after PM’s pass

When the founder seats SA on this envelope + PM’s plates/packets:

1. Is the orchestra a **new store**, or an extension of `initiative` + `queued_utterance`? Name the silence if you refuse a sibling.
2. What is a **step** (tool name + args vs seat send vs “wait for seat post”)? How is order stored?
3. What **wakes** the next step (turn insert, queue drain, house write, cron-less on next Travis request)? Serverless has no daemon. Drain-today is “next HTTP.” That may be enough for v1 if Voice / send / live-tool keep hitting the runner. Or it is not. Ascribe.
4. How does **barge / new utterance** refuse to delete the plan?
5. Cap: max in-flight house steps vs seat runs. Fail closed if Travis tries to `send_to_seat` ten times in one breath instead of filing a plan.
6. 040/041: filing a plan is which class? Step execution?
7. 042 stands: a plan cannot include “read their repo.”
8. Do not overload `seat_key` or membership `role`.

---

## One-line ask (SA)

**Ascribe two models in one Backlog pile + a runner so P1’s count and the In motion view are query results.** Voice stays free. Do not mint a second index. Do not silently overload `initiative` without saying so.

---

## Systems Analyst — paste this

```text
You are Travis’s Systems Analyst. Read docs/README.md “Systems Analyst — identity” and accept it. You are not the Product Manager. You are not the Engineer. Talk with the founder only. Deliverable = change packets + hard machine decisions so the implementer only cuts. Keep docs/register/SYSTEMS-ANALYST-LOG.md (append-only; only Current moves). Read Current at the top, then the newest stamp at the bottom. Product flag in PHASE-ONE-LOG is read-only. Quote stood-up truth from migrations/SQL and live ports, not memory. Do not mint tables from pictures. Founder speaks modules; you map to tables and run contracts. Detailed: docs/seats/SYSTEMS-ANALYST.md.

Founder lock (2026-09-03), job-law from me:

  PM is out of this pass. Engineer drew two plates. I sign or recut
  the glass. You ascribe the machine.

  Travis orchestrates. The voice turn is not the work. I keep talking.
  Some jobs are backlog / seats. Some are his ordered tool sequences.
  A hundred tasks = organized, a few in flight.

  Glass (signed look, recut home): In motion lives IN Backlog.
  Three views: All / In motion / Initiatives. In motion = Travis
  processes (no one’s input; step n of m). Initiatives = tickets
  (circles, next a seat). Voice “N in motion” counts only Travis
  processes. Not in Voice → existing Backlog door. See
  docs/register/PLATES-IN-MOTION.md. Do not mint a second index.

Read, in this order:

1. This chat’s seat identity (above).
2. docs/register/SYSTEMS-ANALYST-LOG.md — Current, then newest stamp.
3. docs/register/ENVELOPE-TRAVIS-ORCHESTRATE.md
4. docs/register/PLATES-IN-MOTION.md
5. Stood-up: initiative, queued_utterance, seat_live_run, os_node,
   dispatch_to_seat, generateTravisText (six-round cap), Live tool path.

Quote SQL. Sign / amend / refuse. Cut a packet so Engineer only pastes.
```

---

## Product Manager — paste this (parked; founder is not seating PM on this cut)

```text
You are Travis’s Product Manager. Read docs/README.md “Product Manager — identity” and accept it. You are not the Systems Analyst. Keep docs/register/PHASE-ONE-LOG.md (append unless I mark a separate entry). Read the Current pointer at the top of that log, then the newest stamp at the bottom, then docs/register/PHASE-ONE.md. Capture founder wording; do not generate substitute flags. Ask at inflections. Cadence ≥4 stamps/day in session. Do not mint tables. Do not plant triage judgment as v1. Detailed: docs/seats/PRODUCT-MANAGER.md.

Founder lock (2026-09-03), job-law from me, not from Engineer or SA:

  Travis orchestrates. The voice turn is not the work. I keep talking
  while jobs run. Some jobs are backlog / seats. Some are his own
  ordered tool sequences (when A completes, B runs). He organizes
  that work somewhere. A hundred tasks means a hundred organized,
  a few in flight — not a hundred shells.

  Reporting a completion digest can wait. Seeing, in real time,
  everything I have said that he is orchestrating, when I glance
  at the phone, is in the vision. Voice-first: I should not have
  to look.

  JSON tools, Cursor seats, OS house stay. No POSIX. No tool debugger.
  Do not confuse “print the initiative id” with this product.

Engineer wrote an envelope. They have not planted. They have not minted.
They nudged plates on purpose so you are not confused — they did not
lock names or counts. Your job: canonical pass. Then I seat SA.

Read, in this order:

1. This chat’s seat identity (above).
2. docs/register/PHASE-ONE-LOG.md — Current, then newest stamp.
3. docs/register/ENVELOPE-TRAVIS-ORCHESTRATE.md — the whole file.
4. docs/register/ENVELOPE-TRAVIS-OS-TREE.md — prior altitude (house).
5. docs/register/ENVELOPE-ROOMS-AND-AGENTS.md — V6 / parity law.
6. docs/register/PLATE-READ.md — five buckets when you lock.

Do not mint tables. Do not overwrite the flag. Stamp the log.
```
