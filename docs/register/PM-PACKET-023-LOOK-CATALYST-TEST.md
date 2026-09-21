# Test spec — 023 Look catalyst (park)

**Packet:** [`PM-PACKET-023-LOOK-CATALYST.md`](./PM-PACKET-023-LOOK-CATALYST.md)  
**Mode:** **Human walk** when founder triggers go. Until then: **no** preflight/runtime against psi for this packet.  
**Process:** [`STATELESS-PR.md`](./STATELESS-PR.md).

Fill **I saw** on this step before the next.

**Pass (after go, not while park):** On psi (phone face), reproduce or accept the founder’s saved specimen: Voice session can sustain “Hey Travis” → question → answer path; “What was I just asking you?” gets a coherent reply; `/events` does not leave the room deaf for 60s+ without recovery the founder accepts.  
**Miss while park:** Any label `wake-sa`, `wake-engineer`, `preview`, `previewing`, `fail-look`, `outside-look` on this PR from the packet file.  
**Miss while park:** `src/` or `ENGINEER-HANDOFF.md` on this PR.  
**Miss:** Treating 021 File → GitHub as proof this catalyst is fixed.

---

## A. Specimen on record

**Do:** Read the packet table for session `fdad2a1d-5f40-431c-bb6f-1db7d2a52f25` and log stamp **10:26 UTC**.

**Expect:** Catalyst is documented without claiming Look merge closed the mouth miss.

**I saw:**

---

## B. Human walk (founder go only)

**Do:** Phone on psi. Fresh or resumed room. Speak: “Hey Travis” → ask something memorable → wait for reply → ask “What was I just asking you?”

**Expect:** Travis answers the recall question with the right thread (or an honest “I don’t have it” — not silence through the end of the walk).

**I saw:**

---

## C. Wire health (optional engineering proof)

**Do:** While in B, watch network for `GET …/events` (SSE). Note disconnects vs `maxDuration` on the route.

**Expect:** No unexplained 60s hang that matches the saved logs without client recovery the product accepts.

**I saw:**

---

## D. Doors (after plant only)

**Do:** After SA + Engineer plant on a **go** PR, run `npm run test:preflight` and let `runtime-doors` on preview.

**Expect:** Live stays in sensors. This catalyst is **not** claimed closed by doors alone without B.

**I saw:**
