# Engineer seat handoff — 2026-09-21

**This bind is living.** Packet **023** on **[#202](https://github.com/bywale-com/travis/pull/202)**.

**Pickup (Technical Architect cut):** [`PM-PACKET-023-LOOK-CATALYST-ENGINEER-CUT.md`](./PM-PACKET-023-LOOK-CATALYST-ENGINEER-CUT.md) — read first.

**This sitting (Path A):** Reverted premature plant `97564b9`. `GET /api/session/:id/events` exports **`maxDuration = 60`** as a literal. `src/lib/room-wire.ts`, server `wire` rotate, and client 52s abort are gone. `src/` matches `main` except `handoff-seat.test.ts` (cut lock). Packet stays **`Wake:** hold**. Do **not** Path B until founder flips **Wake:** sa.

**`previewing`:** already off at pickup. Do not assume a later green-light is a go to plant 039.

**Trail:** git + #202. **One PR per initiative.** Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

---

## Where we stopped

Path A done. 023 remains park. Next Engineer plants Path B only after **Wake:** sa — literal `60` plus `ROOM_WIRE_LIFETIME_MS` / client rotate per the cut file plan. Human walk B on psi still closes the catalyst. Do not remint 039. Do not watch doors this sitting.
