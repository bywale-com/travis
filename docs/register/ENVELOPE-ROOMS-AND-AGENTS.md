# Envelope — Rooms as primitive, seats as membership (Engineer → PM)

**Kind:** Envelope. **Not a packet. Not a hotfix. Not plant law.**
**Seat:** Engineer wrote this so the Product Manager can decide **which plates need printing**. Engineer does not plant faces from this file. Do **not** append PHASE-ONE-LOG.
**When:** 2026-09-02. Founder ↔ Engineer, after the harness pass (037–043).
**Ask:** Read the glass columns. Say which are covered by a printed plate, which need a new plate, and which are out of this pocket.

**Flag (unchanged):** Phase One 14:00 UTC 2026-08-25. Do not overwrite founder wording.

---

## Where we got to tonight

Travis stopped being a relay and became something you can supervise work through. Four things landed, all machine, none of them asked for new glass at the time:

- Tools tell the truth (037). A send reports that it blocked and for how long.
- Travis can **see the room** and **read a seat's reply** (038). Before this it had never received a single word any seat said.
- Travis can **dispatch and leave** (039) instead of freezing until a seat finishes.
- Safety is a written definition with tool classes and asserted coverage (040), Travis narrates its tool calls (041), and it is told it cannot see the repo (042).

The founder has now locked the next move: **room membership lives in our schema**, as a relation between a room and an agent carrying a role and a joined-at. SA cuts that field; Engineer does not mint it.

The consequence for the face is the part PM needs to rule on.

---

## The consequence: seats stop being three

Today every seat surface assumes a fixed cast — PM, SA, Engineer, plus Travis. `roomSeats` comes from `/api/bindings`, which is a global list, not a room's list.

Once membership is a relation and `Agent.create` is reachable, a room can contain **any number of agents with arbitrary labels**, and the cast can change *during* the room.

That is the plate question. Every one of these surfaces currently renders a fixed cast:

| Surface (registry id) | Today | With dynamic seats |
|---|---|---|
| `session-header` via-pill | One `activeLabel` | Same, but the label is now free text of unknown length |
| Composer `@` mention menu | Four fixed rows | N rows, arbitrary labels, may need scroll/search |
| `queue-glance` waiting chip | `2 waiting · Eng` short codes | Short codes are hardcoded per seat; a new agent has none |
| `queue-log` rows | Per-seat rows | Same shape, unbounded count |
| `thought-strip` circles | One circle per known seat | Unbounded circles on a phone-width strip |
| Thread bubbles / `SeatMark` | Per-seat tint | New agents have no assigned colour |

**None of that has a plate.** PM decides whether dynamic seats are in this pocket at all, or whether v1 of rooms keeps the fixed three and only the *membership store* changes underneath.

---

## Glass that shipped tonight with no plate

Printed without a plate because they were hotfixes off lived smoke. PM should say whether each is right or wants a plate.

| What | Where | Why it is new |
|---|---|---|
| **Narration lines** | Thread, as Travis bubbles | Travis now writes “Starting the SA on …” before each tool. New *kind* of content in the thread — an action receipt, not speech. Currently styled identically to Travis talking. |
| **Queue chips that actually appear** | `queue-glance`, `queue-log` | The chrome existed but the queue never tripped, so it has effectively never been seen in use. With dispatch (039) it will appear routinely. The plate was never validated against a real queue. |
| **Jump to latest** | Between thread and composer | New quiet control from 035. Appears only when scrolled up. No plate. |
| **“Travis Live is down — phone ear.”** | Voice subtitle | New copy from 036. Tells you which ear you are on. No plate. |

---

## Glass the next pass will ask for

Named so PM can rule them in or out. Engineer is not building any of these without a packet.

**1. Room identity and Enter / Leave.**
Moving off session-as-room means the room is a thing you enter and leave rather than open and end. Today End ends, and the next Open is a different room. There is no room name anywhere on the glass. Does a room have a name? Is there a Leave that is not End?

**2. An agent joining or leaving the room.**
If Travis can spin up a seat mid-conversation, something happens on the glass. A thread row? A change in the seat rail? Silent? This is bucket 3 territory — the control implies a moment we never discussed.

**3. Cost.**
`Agent.getUsage()` returns billed tokens **and dollar cost per run**. “What has this room cost” is now answerable. Whether that belongs on the face at all is a product call, not an engineering one. It could be spoken-only and never printed.

**4. The confirmation beat.**
040 makes irreversible actions refuse until confirmed — ending the room today, deleting an agent tomorrow. Right now that beat is spoken: Travis says what it will do and waits. Does it need glass, or is voice enough?

---

## What is deliberately not in this envelope

- No table mint. The membership relation is SA's to name.
- No triage or judgment. Travis still relays; it does not decide what to work on.
- No second room on the glass. One room until PM says otherwise.
- Custom tools on Cursor seats — the SDK is local-agent only for that today, so it is not offerable.

---

## Revision — the plate count is bigger than the first pass said

The first pass read “plates” as *what changes on the existing room face*. That was too small. Rooms as primitive adds a **whole level above the room** that has no glass at all today, and the founder’s parity law (below) turns several Travis-only effects into required controls.

Engineer’s read of the plates now justified. PM owns the actual count and naming.

| Candidate plate | Why it is its own plate |
|---|---|
| **Room index** | The list of rooms you can enter. There is no L1 today — the app opens straight into one room. New surface, new empty state, new ordering question (recent? active? named?). |
| **Create a room** | A room now has an identity that outlives a session. Naming it, and choosing who is in it at birth, is a form we have never drawn. |
| **Room roster** | Who is in this room, and add / remove. This is where the parity law lands hardest: if Travis can put an agent in a room, so must you. |
| **Create an agent** | Model, repo, starting ref. `Cursor.models.list()` and `Cursor.repositories.list()` make these real pickers, not free text. A form, and the one place the product spends money on purpose. |
| **Room face under N seats** | Revision, not a new plate, but real: via-pill, `@` menu, waiting-chip short codes, queue rows, thought-strip circles and per-seat tint all assume a cast of three. |
| **Cost** (optional) | `getUsage` returns dollars per run. Whether this is a surface, a line in the roster, or spoken-only is a product call. |

That is four or five new plates plus one substantial revision — not two.

---

## Founder law — nothing is Travis-only

Stated 2026-09-02. Engineer reads it as three rules, and it is an input to every plate above.

1. **Effect parity.** Any effect Travis can cause, the founder can cause by hand. Rationale is not symmetry for its own sake: Travis goes down, and an outage must not lock the founder out of their own room. It is also the only way to verify Travis — every fix tonight came from the founder reading the log and catching a claim that did not match.
2. **Not surface parity.** Reachable by hand does not mean on the main glass. Rare effects live behind a door. Twelve loud actions on a phone is the failure this law could accidentally cause.
3. **Labor is not an effect.** Travis condensing a 40k reply should not become a Summarize button. Parity there means the raw text is available, which it already is.

And the inverse category, which PM should rule on: **manual-only**. Deleting an agent is irreversible and costs money to undo. Engineer’s recommendation is Travis proposes, founder executes — at least until trust is earned.

Current parity gaps, for the record: `dispatch` (no manual “send without waiting”), `work_in_flight` (no consolidated view of what is running), and everything in the create/remove-agent family once it exists.

---

## The one-line ask

**How many plates, and is the room index in this pocket or the next one?** Engineer will not draw a face without them.

---

## Engineer read of PM's 13 (2026-09-02, after PLATE-AUDIT + MISSION-CARBON-MERGE)

PM's set is `K0 · K1 · K2 · K3 · V1–V6 · V1-C · V5-C · V7`. Four of those are the token pass, not the room paradigm; the paradigm is V1–V7 plus two Carbon twins. **It covers everything this envelope named, and adds V6 (work in flight) and V7 (Type with unbounded `@`) that Engineer missed.** Engineer's read: sufficient for the paradigm. Four additions and one disagreement follow.

**1. Seat identity for an agent that is not one of the three.** K0 locks seat marks as `PM · SA · ENG · TRV` and says they must read as unbounded, but not *how*. What is the mark for an agent labelled “Auth Engineer” — derived letters, assigned tint, both? This is the first thing that breaks with a fifth agent, and it is a kit question, not a screen question. Answer it on K0; do not leave it to whoever draws V5.

**2. Failure has no drawn state.** 040 made failure truthful: a refused duplicate send, a denied unknown tool, a run that errored, an agent that fails to create. “Not wired” is one of the five voice states, so that much is covered. A seat run error in the thread and a failed create are not. We spent this pass making the pipe stop lying; none of what it now says honestly has been drawn.

**3. Queue at depth with long labels.** V5 shows the queue, and 039 makes real queues routine for the first time. The waiting chip’s short codes are per-seat and hardcoded (`2 waiting · Eng`). A new agent has no short code. Same root as (1).

**4. Cost-so-far — Engineer disagrees with “out”.** PM ruled cost out: spoken, or a muted line on V4 while you create. That covers spend at the moment of spending. It does not answer *what has this room cost me*, and `Agent.getUsage()` returns dollars per run, so that read exists as soon as it is wired. Under the founder’s own law that is the shape of a future violation — if Travis can say it and the founder cannot see it, it is Travis-only. This need not be a plate; a muted line on the roster would do. But “out” is not stable.

**Barge a running seat — decide now, not later.** PM ruled “no second barge button” three times, answering about *queued* lines. Stopping an actively running seat is impossible for anyone today, Travis included, so it is not yet a parity break. It becomes one the moment `cancelCursorRun` is wired, which is close to free. Worth ruling before it is built rather than after.

**Two PM reversals not yet stated to the founder.** Both are in PM’s audit file, neither was posted: manual dispatch moved from “already covered by 003 barge” to a quiet *don’t wait* riding V6; and Leave/End moved from riding V1 to riding the V5 header, with **Leave = detach** and **End = a separate loud wipe if we keep wipe at all**. The second is a real product decision, not a placement detail.
