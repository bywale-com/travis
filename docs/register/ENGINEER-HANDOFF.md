# Engineer seat handoff — 2026-09-21

**This bind is living.** Packet **023** on **[#202](https://github.com/bywale-com/travis/pull/202)**.

**Pickup (Technical Architect cut):** [`PM-PACKET-023-LOOK-CATALYST-ENGINEER-CUT.md`](./PM-PACKET-023-LOOK-CATALYST-ENGINEER-CUT.md) — read first.

**This sitting (`fail-look`):** `runtime-doors` [35592439396](https://github.com/bywale-com/travis/actions/runs/35592439396) red on `voice-live` — dest leave landed, then “I'm done. Engineer, …” user turns, no speakable Travis `agent_post`. Live dest SSE never handed the user line to Room, so Voice wrap never POSTed `/finalize` (SCP-035). Recut: dest SSE still calls `onUserText`; `liveWrapUtterance` POSTs `/finalize` with `I'm done`. Packet **023 / SCP 039** stays **`Wake:** hold** — do **not** Path B (room-wire rotate) until founder flips **Wake:** sa. `maxDuration = 60` stays a literal.

**`previewing`:** already off at pickup. Do not assume a later green-light is a go to plant 039.

**Trail:** git + #202. **One PR per initiative.** Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

---

## Where we stopped

Fail-look recut once. Next Engineer: if doors red again, GitHub adds `fail-look` after `previewing` clears — new sitting. Path B only after **Wake:** sa — literal `60` plus `ROOM_WIRE_LIFETIME_MS` / client rotate per the cut file plan. Human walk B on psi still closes the catalyst. Do not remint 039. Do not watch doors this sitting.
