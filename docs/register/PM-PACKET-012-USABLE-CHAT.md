# PM packet 012 — Usable chat

**Number:** `012` — next PM packet is `013`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **028**.  
**When:** Named 2026-09-06.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-012-USABLE-CHAT-TEST.md`](./PM-PACKET-012-USABLE-CHAT-TEST.md)  
**Story:** [`USABLE-CHAT.md`](./USABLE-CHAT.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Builds on:** 004 / 005 Log · 062 / 010 images · 011 / 027 reply staple.  
**Next SA:** **028**.

**Where:** [#142](https://github.com/bywale-com/travis/pull/142). #140 already merged (011 / 027). Do not remint that plant. Do not open a cousin of this cut.

Voice is parked this cut. Walk the **Log**.

---

## Founder lock

> The app is generally unusable. … I should almost never even need to invent or specify anything again. There’s so much direction … here’s how stupid this gap is. … we’ve added a reply ability to each chat … if you reply to a message that was … a reply to another message, it doesn’t automatically send back to the person.

> Forget the voice mode for now … the text side of the app is freaking unusable. … images don’t work, they don’t populate. … just prompt the engineer to just keep working on the app till it’s ready. Use computer use … till everything works cohesively. … it’s just a chat app.

> I don’t give a fuck what V1 is. I just care what the app is right now, and all the features that are on the app, and all the logs that we’ve already stated. … any agent should be able to go into the app and look at the app … and see how far away it is from that. … Spin-off subagents look at the app … write a cohesive narrative of clearly how it needs to work … and how it just doesn’t do that by testing the app.

---

## Why one packet

The Log is already a chat in the logs. It does not behave as one. Engineer stays on the desk — computer-use the Log — until the story in [`USABLE-CHAT.md`](./USABLE-CHAT.md) is what happens.

---

## Pocket 1 — Reply goes to that person

**Lived:** Reply is on the bubble. It quotes. It does not dest the author. A reply to a reply does not go back to that person.

**Planted (027):** `Reply` sets `pendingReferenceTurnId`. Send writes `reference_turn_id`. Dest is still chips / sticky `activeBindingId` (`send/route.ts`). `dest-resolve.ts` never reads the referenced turn’s `seat_key`.

**Lock:** Reply to a message dests **that message’s author**. Reply to a reply dests **that** author. Staple stays (`reference_turn_id`). Do not make him `@` again. Do not remint the column.

---

## Pocket 2 — The picture is in the chat

**Lived:** Agent printed an existing plate. Nothing in the Log.

**Planted (062 / 010):** `harvestTurnArtifacts` after dest, Cursor artifacts API only, needs `run_started`. `AgentPostBody` has no image. Markdown path is text.

**Lock:** If the picture is in the Cursor turn (attachment, tool image, or markdown image), it hangs on **that** Log post and paints inline. Same `turn_artifact`. Same `image` | `file`. Do not remint the table.

---

## Pocket 3 — Reply on a ticket stays on that ticket

**Lived (psi walk, 11:04):** Backlog → ticket → Messages → Reply. The ticket closes. You are on the room Log. You cannot answer in the thread you opened.

**Planted (027):** `BacklogTicket` `onReply` clears the ticket and the door, then Type in the room (`Room.tsx`).

**Lock:** Reply on a ticket message stays on **that ticket**. Same dest-the-author lock. The quote names who. Do not route him to the room Log to finish the send.

---

## Pocket 4 — The app he opens is the chat

**Lived:** He uses psi. 027 is on #140. Look 011 never got past SSO on the preview and still Passed.

**Lock:** Usable means **psi** (`https://travis-psi.vercel.app`), room Travis, Log. Preview-only Pass is not Pass. Look walks the sheet in the Log. Computer-use the Log. Do not Pass from `src/` alone.

---

## Must / must-not

- Log is the walk. Voice parked.
- Reply dests the author. Reply-to-reply dests that author.
- Ticket Reply stays on that ticket. The quote names who.
- Visible Cursor images hang on the post.
- Engineer computer-uses until [`PM-PACKET-012-USABLE-CHAT-TEST.md`](./PM-PACKET-012-USABLE-CHAT-TEST.md) matches.
- Do not remint 027 doors, `reference_turn_id`, `turn_artifact`, `heard_at`.
- Do not put Hear it / Skip buttons back.
- Do not open a cousin PR.

---

## SA 028

Ascribe, quote live rows:

1. Dest target from the referenced turn’s author (`seat_key` / binding). Reply-to-reply uses **that** turn’s author, not the first dest in the chain.
2. What counts as “visible in the Cursor turn” → `turn_artifact` on that `agent_post` (API artifact, tool image, markdown image).
3. Ticket Reply compose + send stay on that ticket (same `reference_turn_id`). Quote shows the author.
4. No new table. No remint of 062 / 027 columns.
