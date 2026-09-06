# PM packet 013 — Lists show now

**Number:** `013` — next PM packet is `014`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **029**.  
**When:** Named 2026-09-06.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-013-LIST-LIVE-TEST.md`](./PM-PACKET-013-LIST-LIVE-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Builds on:** 023 poll · 010 / 013 backlog · Log turns GET.  
**Next SA:** **029**.

**Where:** this PR. Do not open a cousin. Do not remint 012 / 028.

---

## Founder lock

> Messages, backlogs, e.t.c, populate too slowly, sometimes don't even show. Until hard refresh We need these more reliable and faster. How?

---

## Why it is slow (looked)

The phone already polls. 023: 1–3s jitter. `streamPollMs`. **No second websocket this cut** (023 named SSE / LISTEN silence).

What the tick actually does (`Room.tsx`): GET queue, then GET **every** turn in the room (`/turns` selects the whole `voice_turn` tape + attachments + motion + streams). Travis’s room is long. A slow or failed GET is swallowed (`catch { /* next tick */ }`). You wait. Hard refresh is a clean GET.

Backlog is **not** on that tick. `loadBacklog` runs when you open the door. `status=all` then walks **every ticket** and loads that ticket’s turns (`listInitiatives`). Slow. On error it does `setBacklogRows([])` — the list **vanishes** until hard refresh.

An open ticket is one-shot `GET .../initiatives/:id`. New posts while you sit there do not arrive until you leave and come back, or hard refresh.

Rooms list is one-shot `loadRooms` on the index.

---

## How (this cut)

Keep the poll. Make it cover what he is looking at, and stop it from erasing a good list.

1. **Tick paints the open door.** Log: new turns. Backlog open: the list. Ticket open: that ticket. Rooms index: the room list. Same 1–3s jitter. Do not wait for hard refresh.
2. **A failed GET keeps the last good rows.** Never `setBacklogRows([])` / empty turns / empty rooms because one fetch died.
3. **Turns after the last `seq`.** Do not download the whole tape every tick. Merge the new rows. Full GET on enter-room and on hard refresh only.
4. **Backlog list is a list.** Titles, status, who is lit — not every ticket’s full messages on every paint. Opening a ticket still loads that thread.
5. **App comes back to the foreground** → one tick now, not after the next jitter.

SSE / LISTEN/NOTIFY stays 023 silence. If this poll is still too slow after the cheap list, that bus is the next cut — not this one.

---

## Must / must-not

- Lists he is looking at update without hard refresh.
- Failed fetch does not blank the glass.
- Do not remint 023 tables. Do not invent a websocket this packet.
- Do not remint 012 / 028.
- Do not put Hear it / Skip buttons back.

---

## SA 029

Ascribe, quote live rows:

1. Incremental `/turns?afterSeq=` (or equivalent) on the existing `voice_turn` tape. No new table.
2. Backlog list query that does not call `turnsForInitiative` per row.
3. Which doors ride the existing poll tick. Error keeps last good.
4. SSE / NOTIFY still silence.
