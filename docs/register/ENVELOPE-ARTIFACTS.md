# Envelope — Ticket artifacts (Engineer → SA)

**Kind:** Envelope. **Not a packet. Not a hotfix. Not planted.**  
**Seat:** Engineer drafted this so Systems Analyst can walk the machine and ascribe what to mint, extend, or name as silence. Engineer does **not** mint an artifact / attachment / image table from this file. Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG from this file.  
**When:** 2026-09-03. Founder: *Looks good cut it* — after locking ticket Messages + Artifacts on the glass.  
**Glass (read-only, do not mint from pictures):** [`BACKLOG-FACE.md`](./BACKLOG-FACE.md) · plates B6 · B7 (B5 superseded). Mission only.

008 already signed this pocket as **named silence**. This envelope re-opens **I** under founder lock. Do not remint `travis.initiative`.

---

## SA prompt — paste this into a Systems Analyst chat

```text
You are Travis’s Systems Analyst. Read docs/README.md “Systems Analyst — identity” and accept it. You are not the Product Manager. You are not the Engineer. Talk with the founder only. Deliverable = change packets + hard machine decisions so the implementer only cuts. Keep docs/register/SYSTEMS-ANALYST-LOG.md (append-only; only Current moves). Read Current at the top, then the newest stamp at the bottom. Product flag in PHASE-ONE-LOG is read-only. Quote stood-up truth from migrations/SQL and live ports, not memory. Do not mint tables from pictures. Founder speaks modules; you map to tables and run contracts. Detailed: docs/seats/SYSTEMS-ANALYST.md.

Founder lock (2026-09-03), job-law from me, not from Engineer or PM:

  Inside a backlog entry you have the relevant chats, segmented for
  that entry, with the artifacts listed in their order as they come.
  There should also be a modal for artifacts. Files and images.
  Messages are an artifact and pretty much the thread. How do we
  select what should show in that chat log? We already have a
  reference system. The first message is the initiative, and the
  seats, when they respond, reference that. But we may be working
  on multiple initiatives at the same time. I don’t think it’s
  something the agent does. I think it’s our code harness that
  arranges these things.

008 is planted. The ticket exists. initiative_id is the stamp.
read_initiative already returns attachments: [] — 008 I named that
silence (001 still). Do not remint the initiative staple. Do a
thorough pass on artifacts only. See what staple needs to be minted,
what already houses this, and what stays named silence. Cut an
envelope into a change packet so Engineer only pastes — or refuse
and name the Story that must be promoted first. Do not mint from
the plates.

Read, in this order:

1. This chat's seat identity (above).
2. docs/register/SYSTEMS-ANALYST-LOG.md — Current, then newest stamp.
3. src/server/db/schema.ts and src/server/db/migrate.ts — quote them.
4. docs/register/SYSTEMS-CHANGE-PACKET-001-VOICE-TURN.md
   — artifacts named silence; do not fake plate URLs.
5. SCP-008 (PR #72 / planted on main) — seam I: NAMED SILENCE.
   No url/image column. attachments: []. Later packet.
6. docs/register/HOTFIX-051-NEW-WAKE.md — Heard stays refused.
7. docs/register/BACKLOG-FACE.md — founder wording + two doors. Glass.
8. docs/register/ENVELOPE-ARTIFACTS.md — this walk. Seams A–N.
9. Write path, quote don't remember:
    src/server/cursor-port.ts  CursorStreamEvent + textFromAssistantMessage
                               + streamRunEvents (skips tool_call)
    src/server/seat-pipe.ts    absorbStreamingAgentPost / insertAgentPostTurn
    src/server/initiative.ts   readInitiative attachments: []
    src/server/travis-tools.ts read_initiative

Stood-up truth you must quote, not remember:

  travis.initiative exists. founding_turn_id UNIQUE. source
  via_travis|hold. status open|done. Room-scoped (voice_session.id).

  voice_turn.initiative_id and queued_utterance.initiative_id stamp
  the pipe. Harness writes the id. The agent does not pick the ticket.

  voice_turn has text, kind, seat_key, reference_turn_id,
  initiative_id. No url. No image. No mime. No blob.

  readInitiative returns attachments: [] — typed empty, hardcoded.
  formatInitiativeRead does not mention attachments.

  src/server/cursor-port.ts has no artifact / image / file handling.
  CursorStreamEvent is status | delta | thought_delta | post_delta |
  run_started | busy | done. done carries assistantText / thoughtText.
  textFromAssistantMessage keeps only content blocks with type=text.
  streamRunEvents skips tool_call / tool_use. Harvest is text only.

  absorbStreamingAgentPost / insertAgentPostTurn write text and copy
  initiative_id from the answered user turn. Nothing else lands.

  Official SA packets on disk: 001, 002, 007. 008 is planted in
  schema + src/server/initiative.ts (packet file may live on PR #72
  if it is not on main). Next unused official number is 009 unless
  you remap.

Ascribe each seam in ENVELOPE-ARTIFACTS.md (A–N). Mint, extend, or
name silence. Do not invent triage. Do not remint initiative. Do not
mint heard. Do not let the agent choose the ticket.

If you mint: cut docs/register/SYSTEMS-CHANGE-PACKET-009-….md
with Intent, Must / must-not, Stores (add / change / refuse), Runtime
(who writes, who reads, hang-on-turn, B6 vs B7 query, bytes vs
pointer, stream land), Ports / tools, Verify, Out of scope. Stamp
the SA log. Engineer then pastes. Nothing else.

If you amend the write path without a new table: say so in the packet.
Engineer pastes your runtime, not a guessed schema.

If you refuse: name the silence and what Story must be promoted first.
```

---

## Founder locks this envelope is under

Quoted, not restated as a generated list.

> Messages are an artifact and pretty much the thread. Threads for a particular initiative are grouped inside the backlog for that initiative. Inside a specific backlog entry not only do you have the relevant chats, segmented for that entry, with the artifacts listed in their order as they come. There should also be a modal for artifacts. Files and images.

> How do we select what should show in that chat log? We already have a reference system. The first message is the initiative, and the seats, when they respond, reference that. But we may be working on multiple initiatives at the same time. I don’t think it’s something the agent does. I think it’s our code harness that arranges these things.

Founder then locked Engineer’s face read: **B6 Messages** = stamped thread; artifacts hang on the turn that made them. **B7 Artifacts** = files and images only, landing order, no chat, no upload CTA. Then: *Looks good cut it.*

008 I (signed, not this file):

> Artifacts | **NAMED SILENCE** (001 still). No url/image column. Attachments list is empty. Do not fake URLs. Later packet.

---

## Stood-up truth (quoted)

`travis.initiative` is the ticket. `initiative_id` is the stamp. Artifacts are still empty.

```54:73:src/server/db/schema.ts
export const voiceTurn = travis.table("voice_turn", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => voiceSession.id),
  seq: integer("seq").notNull(),
  /** Legacy role — kept for 001 rows */
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
  /** SCP-008 — founding user, pass-on user, answering agent_post. FK is SQL. */
  initiativeId: uuid("initiative_id"),
});
```

```130:146:src/server/db/schema.ts
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

**008 read already returns the empty list:**

```362:400:src/server/initiative.ts
  next: ReturnType<typeof deriveNext>;
  attachments: [];
};
// ...
    next: nextOf(row, turns),
    attachments: [],
```

**Cursor port is text.** `CursorStreamEvent` has no file / image / url. `textFromAssistantMessage` keeps `type === "text"` only. `streamRunEvents` continues past `tool_call` / `tool_use`. Harvest / conversation walk assistant text. `src/` has no artifact write.

**Seat land is text.** `absorbStreamingAgentPost` takes `text: string`, copies `initiative_id` from the answered user turn, writes `kind=agent_post`. No second row. No url column to fill.

**001:**

> Artifacts: **named silence in 001** (columns later in 002 when stream/artifacts are real). Do not fake plate URLs in the SPA.

002 did not mint them. 008 I kept the silence.

**What does not exist**

| Candidate | Status |
|-----------|--------|
| artifact / attachment / image row | **absent** — 001 + 008 I named silence |
| url / mime / blob on `voice_turn` | **absent** |
| Cursor-port artifact event | **absent** — text only |
| B7 upload / founder add-file HTTP | **absent** — plate has no CTA |
| heard / seen | **absent** — 051; 008 K later packet |
| ticket-scoped artifact tool | **absent** — `read_initiative` returns `[]` |

---

## Seams SA must ascribe (A–N)

Not proposed SQL. Each line: **mint / extend / query / silence**, and why Story bears it.

### A. Identity

What *is* an artifact in the store? A new row? Columns on `voice_turn`? A pointer at a Cursor run file? 001 and 008 I refused a table. B7 is a second door on the same ticket, not a second ticket. Do not mint from the plate.

### B. Hang on the turn

Founder: listed in the order they come; hang on the turn that made them. Which turn — the `agent_post`, a child row, or a Cursor-side id we do not yet store? One artifact, many? Thoughts never carry them.

### C. Ticket query

`initiative_id` already stamps the pipe. Artifacts on a ticket = facts whose host turn has that id. Confirm, or name a second fk. Concurrent tickets must not share a landing. The agent does not pick.

### D. B7 derived list

Files and images only. Landing order. Seat word on the right. No chat. Same staple as B6’s quiet hang, two queries — or a dedicated index. Do not mint a second comments thread.

### E. Kinds

B7 is files and images. Earlier backlog wording also said quiet links. Is a link an artifact, a Messages hang, or silence? Name the kinds. Do not invent video / zip / “anything the model attached.”

### F. Where the bytes live

Cursor cloud vs Travis. Today we drop everything that is not `type=text`. Do we copy bytes into our store, persist a Cursor URL, or only metadata? Quote the live SDK walk, not a hoped-for nest. `CURSOR_API_KEY` stays server-side.

### G. Who writes

Stream land when a seat produces a file or image. B7 has **no upload CTA**. May the founder add by hand (effect parity), or is land-only the v1 write? Name the faceless trigger. Do not invent a composer paperclip.

### H. Out of ticket

Unstamped turns stay off B7. Dest-seat personal talk is Out (008). A file on an Out line is not a backlog artifact unless Hold (or a later write) stamps that turn.

### I. Tools vs `read_initiative`

Today `attachments: []`. Does `read_initiative` grow a real list? A separate tool? `search_room` stays Requests. Do not teach the model to choose the ticket.

### J. No fake URLs

001 / 008: do not fake plate URLs in the SPA. If the stream does not yet emit a real file, the list stays empty — do not plant scenery.

### K. Packet number

Next unused official SA number is **009** unless you remap. Do not reuse 003–008.

### L. Do not remint initiative

008 identity, stamp, Hold, derived Next, done-as-write all stand. This walk is artifacts (and only what the ticket must return so B6 can hang a file under a turn). Do not reopen whose-turn or Requests.

### M. Heard / New

051 refused a heard table. 008 K = later packet. Do not silently mint it here to make B7 nicer.

### N. Scope: this room

Initiatives are `voice_session.id` (007 / 008 M). Artifacts follow the ticket. Cross-room file index is a later Story.

---

## Refusals (Engineer will not invent these)

- An artifact / attachment / image / heard table from the plates.
- Reminting `travis.initiative` or recutting Requests as Backlog.
- Letting the agent decide which ticket a file belongs to.
- Fake attachment URLs in the SPA.
- A B7 upload control the plate does not have.
- A second comments thread beside `voice_turn`.
- Planting B6 / B7 chrome before the packet.
- Appending the SA or PM log.
- Fanning this walk to the SA agent. The founder seats SA.

---

## What SA must return

A change packet the Engineer can paste without leftover analysis, **or** a refusal that names the silence and the Story that must be promoted first. Sign-off is the packet plus a stamp, not a chat “lgtm.”
