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

## The one-line ask

**Which of the four unplated shipped items need a plate, and is dynamic seat count in this pocket or the next one?** Everything else can wait for the packet.
