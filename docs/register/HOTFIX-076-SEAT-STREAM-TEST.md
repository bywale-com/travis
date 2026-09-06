# Test spec — 076 Seat Stream closer

**Hotfix:** [`HOTFIX-076-SEAT-STREAM.md`](./HOTFIX-076-SEAT-STREAM.md)  
**Generally:** a hotfix test is **scoped to that hotfix**.  
**No new plates.** Card must look the way Travis’s Stream card looks.

Fill **I saw** on this step before the next.

---

## Before you start

**Where.** Preview for this PR if dest plant is on it. Production psi if that is what you have.

**URL I opened:**

**Device:**

**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`) unless you cannot get there — write which room.

**Talk | Type:** **Type**.

---

# Grain — cloud agent can do

### G.1 Dest closer lands one post

**Do:** Quote `driveDestCursorEvents` after the plant. Run the dest-closer grain test.

**Expect:** N stream `message` events → one `agent_post`. `close_turn_id` is that row. No `for (const beat of beats)` over `messageBodies`. Same for `reapFinishedLiveRuns`.

**I saw:**

---

# Desk — Stream for a seat

### D.1 Idle Log

**Do:** Open the room. Log. Nobody dest-working.

**Expect:** No live seat chats painting in.

**I saw:**

### D.2 Dest a seat (human if Talk; Type if you can dest)

**Do:** Dest a seated person (Engineer, or `technical-pm` by who). Send a line that will produce more than one Cursor bubble / tool.

**Expect while they work:** Log does **not** grow their chats. In this room: their mark glows. Stream (tap the glow): trigger pinned; events in order. Same compartment as Travis.

**I saw:**

### D.3 Done

**Do:** Wait until they finish.

**Expect:** **One** finished seat bubble on the Log. A Stream **card** above that line — same chrome as a Travis card. Tap: trigger + the events from Stream. Not a pile of their chats. Not a new plate.

**I saw:**

### D.4 Travis unchanged

**Do:** Send Travis a short line that finishes.

**Expect:** Travis still gets one completed line and his card as 025 planted. This cut did not remint his close.

**I saw:**

**Steps I could not do (human):** SSO / Talk / dest on a phone / watch a long seat run in Stream.
