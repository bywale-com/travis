# SYSTEMS-CHANGE-PACKET-039 — Look catalyst (room wire continuity)

**Number:** `039` — next systems packet is **040**. Never reuse.  
**Status:** **Signed** (intent). **First plant invalid** — `maxDuration` must stay literal `60` on the route. Engineer cut: [`PM-PACKET-023-LOOK-CATALYST-ENGINEER-CUT.md`](./PM-PACKET-023-LOOK-CATALYST-ENGINEER-CUT.md).  
**Seat:** Systems Analyst. Engineer pastes this.  
**When:** 2026-09-21 (founder go on PM-023).  
**PM packet:** [`PM-PACKET-023-LOOK-CATALYST.md`](./PM-PACKET-023-LOOK-CATALYST.md)  
**Test:** [`PM-PACKET-023-LOOK-CATALYST-TEST.md`](./PM-PACKET-023-LOOK-CATALYST-TEST.md)  
**Prior (do not remint):** **029** room wire · **037** Look File · **038** N-red labels.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.

---

## 1. Intent

Lived specimen: Voice session stayed up but **`/events` hit the 60s Hobby cap** and the phone could sit on a dead socket until timeout — tape / assistant replies could lag or never land. **029** already reconnects with `afterSeq`; **039** rotates the wire **before** the hard kill so reconnect is immediate and lossless.

---

## 2. Must

- Keep `maxDuration = 60` on `GET /api/session/:id/events`.
- Server: at **54s**, emit `wire` `{ action: "rotate", afterSeq }`, then close LISTEN cleanly.
- Client: abort the fetch at **52s** (or on `wire` rotate) → `AbortError` → immediate reconnect loop (no poll backoff).
- Shared constants in `src/lib/room-wire.ts`. Grain tests grep route + Room.

## 3. Must-not

- Mint a table. Remint Look. Change Live SDP path. Remove heartbeat.

## 4. Silence

| Silence | Why |
|---------|-----|
| **Pro plan / 800s wire** | Log rejected 800 on Hobby. Rotate, not longer function. |
| **Doors proof of recall** | Human walk on psi still required (packet test B). |
