# PM packet 013 — The room stays live

**Number:** `013` — next PM packet is `014`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **029**.  
**When:** Named 2026-09-06. Recut same day — poll-only was the wrong cut.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-013-LIST-LIVE-TEST.md`](./PM-PACKET-013-LIST-LIVE-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Builds on:** 023 tape · existing send SSE · `voice_turn.seq`.  
**Next SA:** **029**.

**Where:** [#144](https://github.com/bywale-com/travis/pull/144). Do not open a cousin. Do not remint 012 / 028.

---

## Founder lock

> Messages, backlogs, e.t.c, populate too slowly, sometimes don't even show. Until hard refresh We need these more reliable and faster. How?

> I don't know why I feel like this is just like, it's too, it's too provincial or local of a solution. Like, think about a big production company, like Cursor, or Claude. What are they using? How come they, you're not, you never lose, there's no loss, ever?

---

## What they use (alignment, not a brand copy)

Cursor, Claude, ChatGPT: the chat is a **durable tape**. The glass holds **one live wire** (they use SSE). A new line is an **event** on that wire. If the wire drops, the client says **the last id it has** and the server plays everything after that, then the wire stays open again.

Hard refresh works here because it re-reads the tape from zero. They never need that for a new message: reconnect is a small refresh **from the last seq**, and the wire is on so you are not waiting for a timer to guess.

Slack adds a websocket for presence at their scale. We already stream dest over SSE. We do not need a second socket product. We need the **room** to have that wire — not only the send you just fired.

023 called this bus “later.” This is that cut. A smarter poll is still guessing.

---

## Why we lose today

Send/finalize SSE dies when **that** request ends. After that, the phone **polls the whole tape** every 1–3s. Backlog and an open ticket are not even on that tick. A failed GET **empties** the list. Dest posts from another request never ride a wire. Miss a tick → blank or stale until hard refresh.

---

## Lock

1. **One room wire.** While he is in the room (Log or Voice), the phone holds an SSE to this session. A new turn, a backlog change, a ticket line, a stream card — an event on that wire. The glass applies it. No timer required to see it.
2. **Resume is the no-loss.** Connect with the last `seq` (and the last list stamp SA names). Server sends everything after that, then stays open. Reconnect does the same. That is why they do not lose.
3. **Never blank.** A dropped wire or a failed GET keeps the last good rows. Catch-up fills the gap. Do not `setBacklogRows([])` because one fetch died.
4. **List is a list.** Backlog titles/status/lit — not every ticket’s thread on every event. Open ticket still has its thread.
5. **Poll is fallback only** — if the wire is down, catch-up from last seq. Not the product.

Do not remint `voice_turn`. `seq` is the cursor. Do not remint 023 tables. Do not invent a websocket next to the SSE we already use.

---

## Must / must-not

- A landing shows without hard refresh and without waiting out a 1–3s guess.
- Reconnect does not lose lines that landed while the wire was down.
- Failed fetch does not wipe the glass.
- Do not remint 012 / 028. Do not put Hear it / Skip buttons back.
- Do not ship “smarter poll” as this packet.

---

## SA 029

Ascribe, quote live rows. 023 silence on the **room** bus is **open**.

1. Session SSE: who writes, when (insert turn / initiative / stream hang). `seq` resume. Last-Event-ID or `afterSeq`.
2. How dest-job / other-request writes reach this wire (LISTEN/NOTIFY or equivalent — not a new tape).
3. Backlog list payload that is not `turnsForInitiative` per row.
4. Poll = catch-up only. No new table.
