# Backlog — what Travis is orchestrating

**Kind:** Plates. Engineer, founder-asked. Not a PM packet. Does not append the PM or SA logs.  
**When:** 2026-09-03  
**Plates:**  
- [`travis-b1-backlog-index-mission.png`](./plates/travis-b1-backlog-index-mission.png) — index  
- [`travis-b3-log-initiative-mission.png`](./plates/travis-b3-log-initiative-mission.png) — mark in the log  
- [`travis-b4-hold-initiative-mission.png`](./plates/travis-b4-hold-initiative-mission.png) — hold → Initiative  
- [`travis-b5-ticket-turns-mission.png`](./plates/travis-b5-ticket-turns-mission.png) — first ticket read (superseded by B6 / B7)  
- [`travis-b6-ticket-thread-mission.png`](./plates/travis-b6-ticket-thread-mission.png) — ticket · Messages  
- [`travis-b7-ticket-artifacts-mission.png`](./plates/travis-b7-ticket-artifacts-mission.png) — ticket · Artifacts  

B2 is superseded. **Not Requests.** Mission only.

**Store (signed):** SCP-008 `travis.initiative` + `initiative_id` on turns. Artifacts remain **001 silence** — B7 is glass, not a minted table.

---

## Founder wording

> I feel like there needs to be a tighter task pipeline. The requests panel just shows every single thing I’ve texted. I won’t call it requests. Backlog. Travis exists for work management. It should always feel like an initiative.

> Those messages already look like they’re coming from me. I need a symbol on the chat log itself — a circular icon — that this is a backlog entry. I should be able to hold a message I just sent and turn it into an initiative.

> Messages are an artifact and pretty much the thread. Threads for a particular initiative are grouped inside the backlog for that initiative. Inside a specific backlog entry not only do you have the relevant chats, segmented for that entry, with the artifacts listed in their order as they come. There should also be a modal for artifacts. Files and images. How do we select what should show in that chat log? We already have a reference system. The first message is the initiative, and the seats, when they respond, reference that. But we may be working on multiple initiatives at the same time. I don’t think it’s something the agent does. I think it’s our code harness that arranges these things.

---

## Law

| | |
|---|---|
| **In** | Founder → Travis → a seat. An initiative. One ticket. |
| **Out** | Founder → a seat directly. Personal. You are watching it. |
| **Harness, not the agent** | What belongs on a ticket is a **stamp** (`initiative_id`), written by our send / dispatch / Hold / drain path. The model does not pick the ticket. |
| **`reference_turn_id`** | Answers **one send**. Not enough when two pipes are live. |
| **`initiative_id`** | The pipe. Many sends. Founding line, each pass-on user row, each answering `agent_post`. Same id. |
| **Ticket Messages** | Query: stamped `kind=user` + `agent_post` on that id, seq order. Thoughts stay out. Artifacts hang on the turn that made them. |
| **Ticket Artifacts** | Same stamp, a second door. Files and images only, landing order. No chat. No upload CTA. |
| **Mark** | Hollow oxblood circle on `kind=user` where `initiative_id` is set. |
| **Hold** | Long-press an unmarked founder line → **Initiative**. Writes the row and feeds Travis. |

## How the harness traces (not a walk)

Two initiatives can be in flight. A reply that only “references the last message” will land on the wrong ticket.

So we do not walk the room. We **write the id at the moment Travis passes on**:

1. Founder → Travis (or Hold on an Out line) = founding turn.
2. `send_to_seat` / `dispatch_to_seat` accepted → stamp that initiative on the pass-on user row (the founder-looking dispatch line).
3. Seat `agent_post` copies the id from the user turn it answers (`reference_turn_id` still names the send).
4. A queued line carries the id; drain stamps the new user row the same way.

The ticket log is `WHERE initiative_id = this`. Concurrent work stays in its own row.

## Two doors on the ticket

**B6 Messages** — the segmented thread. Founding line with the mark. Each stamped seat post. Quiet file / image under the turn that produced it. Next is a muted word. Open in log is the door back to the whole room.

**B7 Artifacts** — the same facts, no bubbles. A list in landing order. Who made it is the seat word on the right.

008 already returns `attachments: []`. B7 does not mint a store. Artifact grain is still **SA**.

## Must-not

- Do not let the agent decide which ticket a post belongs to.
- Do not walk `reference_turn_id` as the only map.
- Do not recut Requests as Backlog.
- Do not mint an artifact / image table from B7.
- Do not plant B6 / B7 chrome until the founder locks the plates and SA ascribes attachments if they want more than an empty list.
