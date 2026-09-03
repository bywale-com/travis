# Envelope — Backlog / initiative (Engineer → SA)

**Kind:** Envelope. **Not a packet. Not a hotfix. Not planted.**  
**Seat:** Engineer drafted this so Systems Analyst can walk the machine and ascribe what to mint, extend, or name as silence. Engineer does **not** mint a ticket / initiative / backlog table from this file. Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG from this file.  
**When:** 2026-09-03. Founder: *SA does a thorough pass — what staples need to be minted — and just create the envelope.*  
**Glass (read-only, do not mint from pictures):** [`BACKLOG-FACE.md`](./BACKLOG-FACE.md) · plates B1 · B3 · B4 · B5 under [`plates/`](./plates/). Founder locked the face read. B2 is superseded.

---

## SA prompt — paste this into a Systems Analyst chat

```text
You are Travis’s Systems Analyst. Read docs/README.md “Systems Analyst — identity” and accept it. You are not the Product Manager. You are not the Engineer. Talk with the founder only. Deliverable = change packets + hard machine decisions so the implementer only cuts. Keep docs/register/SYSTEMS-ANALYST-LOG.md (append-only; only Current moves). Read Current at the top, then the newest stamp at the bottom. Product flag in PHASE-ONE-LOG is read-only. Quote stood-up truth from migrations/SQL and live ports, not memory. Do not mint tables from pictures. Founder speaks modules; you map to tables and run contracts. Detailed: docs/seats/SYSTEMS-ANALYST.md.

Founder lock (2026-09-03), job-law from me, not from Engineer or PM:

  Backlog is what I give Travis to orchestrate — initiative to done.
  Requests is every line I typed. That door stays. Direct-to-seat is
  personal and is not the backlog. A seat reply lands on that ticket
  and ends their turn. I need a mark on the chat line itself. I can
  hold a line I sent and turn it into an initiative — that writes the
  ticket and feeds Travis. In the ticket I should see the founding
  line, canonical chat from each person who took a turn, and quiet
  links / artifacts.

Do a thorough pass. See what staples need to be minted, what already
houses this, and what stays named silence. Cut an envelope into a
change packet so Engineer only pastes — or refuse and name the Story
that must be promoted first. Do not mint from the plates.

Read, in this order:

1. This chat's seat identity (above).
2. docs/register/SYSTEMS-ANALYST-LOG.md — Current, then newest stamp.
3. src/server/db/schema.ts and src/server/db/migrate.ts — quote them.
4. docs/register/SYSTEMS-CHANGE-PACKET-001-VOICE-TURN.md
   — voice_turn; artifacts were named silence in 001.
5. docs/register/SYSTEMS-CHANGE-PACKET-002-ROOM.md
   — kind / seat_key / reference_turn_id.
6. docs/register/HOTFIX-048-REQUEST-LOG.md
   — Requests = kind=user. No new table. Door stays.
7. docs/register/HOTFIX-051-NEW-WAKE.md
   — New is session-local. Heard table was refused. SA for R1.
8. docs/register/BACKLOG-FACE.md — founder wording + law. Read-only glass.
9. docs/register/ENVELOPE-BACKLOG.md — this walk. Seams A–N.
10. Write path, quote don't remember:
    src/server/dispatch.ts insertUserTurn on dispatch
    src/server/seat-pipe.ts insertUserTurn / absorbStreamingAgentPost
    src/server/travis-tools.ts search_room
    src/lib/request-log.ts

Stood-up truth you must quote, not remember:

  travis.voice_turn already holds the room log. kind = user | agent_thought
  | agent_post | status | travis_prompt. User seat_key is dest. Agent
  posts set reference_turn_id to the user turn they answer.

  Travis dispatch writes a second kind=user row. seat_key = the dest
  seat. text = the prompt Travis sent. That is why those lines look
  like they came from the founder.

  Requests is a query over kind=user. There is no request / initiative
  / backlog / ticket / artifact / heard table.

  queued_utterance is waiting lines, not tickets.
  seat_live_run is one live Cursor run per binding.
  room_membership is room ↔ agent. The founder is not a row.

  Official SA packets on disk: 001, 002, 007. 003–006 remapped
  (planted; files not on main). Next unused official number is 008
  unless you remap.

Ascribe each seam in ENVELOPE-BACKLOG.md (A–N). Mint, extend, or name
silence. Do not invent triage judgment. Done is the pipe finished.

If you mint: cut docs/register/SYSTEMS-CHANGE-PACKET-008-….md
with Intent, Must / must-not, Stores (add / change / refuse), Runtime
(who writes, who reads, via-Travis vs hold, seat reply lands, whose
turn, done), Ports / tools, Verify, Out of scope. Stamp the SA log.
Engineer then pastes. Nothing else.

If you amend the write path without a new table: say so in the packet.
Engineer pastes your runtime, not a guessed schema.

If you refuse: name the silence and what Story must be promoted first.
```

---

## Founder locks this envelope is under

Quoted, not restated as a generated list.

> I feel like there needs to be a tighter task pipeline. The requests panel just shows every single thing I’ve texted. I won’t call it requests. Backlog. Travis exists for work management. It should always feel like an initiative.

> It doesn’t have to track every single thing. It just has to track everything that I give to Travis, and Travis passes on. If I give it to the Engineer directly, I’m probably going to be watching that. Personal conversation between me and a seat doesn’t. Anytime I route it through Travis, Travis orchestrates. That pipeline from initiative all the way to done has to be tracked.

> Usually it flows from Travis to PM to SA to Engineer. The PM may not have much to say — they might just be packaging it up. Same with SA. When the PM finishes and responds in chat, it’s responding back to that specific ticket. That’s how Travis knows this person has completed their turn, and whose is next.

> Those messages already look like they’re coming from me. I need a symbol on the chat log itself — a circular icon — that this is a backlog entry. I should be able to hold a message I just sent and turn it into an initiative. That sends it to the backlog and feeds it to Travis to orchestrate. In the ticket I should see something — even canonical chat from each person, and maybe links and artifacts.

Founder then locked Engineer’s face read (2026-09-03): mark in the log; hold → Initiative; ticket = founding line + one canonical post per finished turn + quiet attachments; Next is a muted word. They asked SA to ascribe the staples.

---

## Stood-up truth (quoted)

`travis.voice_turn` is the log. No initiative flag. No ticket fk. No artifact column.

```54:71:src/server/db/schema.ts
export const voiceTurn = travis.table("voice_turn", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  seq: integer("seq").notNull(),
  role: text("role").notNull(),
  kind: text("kind").notNull().default("user"),
  seatKey: text("seat_key"),
  referenceTurnId: uuid("reference_turn_id"),
  speakable: boolean("speakable").notNull().default(true),
  thoughtStatus: text("thought_status"),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

**Requests (048)** is that table, `kind = user`, this session. Travis `search_room` reads it. The Requests door stays. 048 must-not: do not mint a request / initiative / backlog table. That refusal was for the request-log pocket. This envelope re-opens the initiative question under founder lock — SA decides whether a new staple is now Story-bearing, or whether 048 still holds and the face is a query.

**Dispatch write (why the log looks like the founder):**

```75:76:src/server/dispatch.ts
    if (event?.type === "run_started") {
      const userTurn = await insertUserTurn(sessionId, prompt, seatKey);
```

`insertUserTurn` writes `kind=user`, `seat_key` = dest (PM / SA / Engineer), `text` = the prompt Travis sent. A later `agent_post` sets `reference_turn_id` to that user turn (`absorbStreamingAgentPost`). Founder → Travis is a *different* user row (`seat_key=travis`). The marked bubble on B3 is the dispatched-looking line, the founding line, or both — ascribe it.

**What does not exist**

| Candidate | Status |
|-----------|--------|
| initiative / ticket / backlog row | **absent** |
| artifact / attachment store | **absent** — 001 named silence; `src/` has no artifact write |
| heard / seen | **absent** — 051 session-local; SA named for R1 |
| ticket-scoped Travis tool | **absent** — `search_room` is Requests |

`queued_utterance` = waiting lines. `seat_live_run` = one Cursor run per binding. `room_membership` = room ↔ agent. None of these are the backlog.

---

## Seams SA must ascribe (A–N)

Not proposed SQL. Each line: **mint / extend / query / silence**, and why Story bears it.

### A. Identity

What *is* an initiative in the store? A new row? A flag or fk on a `voice_turn`? Both? 048 refused a table for “every line I typed.” This is a tighter set. Do not mint from B1.

### B. In vs Out

**In:** founder → Travis → a seat. **Out:** founder → a seat directly. Hold can promote an Out line to In.

Today dest is `voice_turn.seat_key` on the user row. Dispatch then writes a *second* user row to the dest. Which row is the ticket? Which row gets the mark? How is “via Travis” recovered after the fact?

### C. Requests vs Backlog

Requests stays. Every `kind=user`. Backlog is the orchestrated subset. Two doors, two queries — or one query and a mark. Do not recut Requests as Backlog.

### D. Pipeline / whose turn

Usual flow Travis → PM → SA → Engineer → done. A seat may pass with almost nothing; that is still a turn. Is whose-turn a stored pointer, derived from which seats have an `agent_post` on the ticket, or both? Is the usual order law, a default, or only glass?

### E. Seat reply lands on that ticket

Today `agent_post.reference_turn_id` → the user turn for that send. Travis is supposed to read “this person finished, who is next.” Is the existing fk enough once A is named, or does a post need a ticket id? Thought rows stay off the ticket.

### F. Hold → Initiative

Long-press a founder line. One loud word. Two writes: (1) the ticket exists, (2) Travis is fed to orchestrate. Name the write and the faceless trigger (what prompt Travis gets, which tool, dest stays Travis). Effect parity: the founder can cause the same effect by hand that Travis causes when they route through him.

### G. Mark in the log

Hollow oxblood circle on the founder bubble. Derived from the store. No chrome-only bit that the index cannot also see.

### H. Ticket interior (query)

Founding line. One canonical `agent_post` per seat that finished a turn. Quiet attachments under that post. Next is a muted word. Open in log jumps to the thread. Do not mint a second comments table unless Story demands one. Do not mint priority, due, assignee, score.

### I. Artifacts / links

001: artifacts were named silence. Still no store. B5 hangs a link and an image on the turn that made them. Output-types is a considering spec, not a packet. Mint, extend `voice_turn`, or name the silence again. Do not fake URLs in the SPA.

### J. Done

The pipe finished — not a score, not triage. What write closes the ticket? Who may write it (Travis, last seat, founder by hand)?

### K. Heard / New (R1)

051 refused a heard table. Refresh forgets New. Same pocket as backlog, or a later packet? Do not silently mint it here to make B5 nicer.

### L. Travis tools

`search_room` is Requests. Does Travis need a backlog / ticket read to orchestrate without the 14-turn window? Name the tool or name why `search_room` + room-state is enough.

### M. Scope: room or above

The Backlog door reads like one index. Turns live on `voice_session`. Are initiatives room-scoped (this room’s pipe) or a layer above rooms? Quote 007: the room is `voice_session.id`.

### N. Packet number

Next unused official SA number is **008** unless you remap. Do not reuse 003–007.

---

## Refusals (Engineer will not invent these)

- A ticket / initiative / backlog / artifact / heard table from the plates.
- Recutting Requests as Backlog.
- Tracking dest-seat personal talk as a ticket.
- Triage judgment, priority, due date, assignee picker, progress bar.
- A second comments thread beside `voice_turn`.
- Planting B1 / B3 / B4 / B5 before the packet.
- Appending the SA or PM log.
- Fanning this walk to the SA agent. The founder seats SA.

---

## What SA must return

A change packet the Engineer can paste without leftover analysis, **or** a refusal that names the silence and the Story that must be promoted first. Sign-off is the packet plus a stamp, not a chat “lgtm.”
