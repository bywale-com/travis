# Packet 023 — Look catalyst (lived Voice miss that named Look)

**Number:** `023` — PM packet for the **catalyst**, not a remint of SA [`SYSTEMS-CHANGE-PACKET-023-TAPE.md`](./SYSTEMS-CHANGE-PACKET-023-TAPE.md) (tape / 2026-09-03). Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Engineer (pickup). **SA** **039** intent; plant recut required.  
**When:** Named 2026-09-15.  
**Status:** Specified — **hold** (premature plant reverted or fixed per engineer cut).  
**Wake:** hold  
**Engineer cut:** [`PM-PACKET-023-LOOK-CATALYST-ENGINEER-CUT.md`](./PM-PACKET-023-LOOK-CATALYST-ENGINEER-CUT.md)  
**SCP:** [`SYSTEMS-CHANGE-PACKET-039-LOOK-CATALYST.md`](./SYSTEMS-CHANGE-PACKET-039-LOOK-CATALYST.md) (intent; first plant invalid)  
**Test spec:** [`PM-PACKET-023-LOOK-CATALYST-TEST.md`](./PM-PACKET-023-LOOK-CATALYST-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **10:26 UTC 2026-09-15** (catalyst) · **21:25 UTC** (park).  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md).  
**Sibling (held):** [`PM-PACKET-022`](./PM-PACKETS.md) Smarter loop / N-red → outside agent — **not** this packet.

**Where:** this PR ([#202](https://github.com/bywale-com/travis/pull/202)). Do not land on 021’s merged cut. Do not open a cousin.

---

## What this packet is

**Type B product miss** (pipe / Voice / session continuity) that **doors did not discover**. Founder had to notice and describe it. That pain is what led to **Look (021)** — automate *filing* a lived miss from Log. **This packet holds the miss itself** for a later SA ascribe + Engineer plant.

It is **not** Look chrome. It is **not** 098/099 browser-real runtime class alone (those helped discoverability in automation; they do not close this specimen). It is **not** 022 escalation.

---

## Founder lock (preserved)

> …this is kind of different from the other failures. The other failures are happening in a state that the agents can… discover. What happens here is like a broad failure. So I have to discover it and then create the ticket.

Full block: Phase One log **2026-09-15 10:26 UTC**.

---

## Lived specimen (hold until human walk)

| Field | Value |
|-------|--------|
| Session | `fdad2a1d-5f40-431c-bb6f-1db7d2a52f25` |
| Context | Hotfix **098/099** preview; founder asked to inspect the most recent conversation only |
| Tape | Repeated “Hey Travis”; agent-ID question; one delayed answer; “ID” heard as “idea”; fragment “Hey. I’m”; then “What was I just asking you?” with **no reply** |
| Logs (this sitting) | Live token / SDP / transcript **200**; **`/events` 60s timeout** |

**Inspect (not memory):**

- `src/app/api/session/[id]/events/route.ts` — `maxDuration = 60` on the SSE route.
- `src/components/Room.tsx` — reconnect loop on `/events` when the wire drops.

Human walk on psi remains open after any automation greens.

---

## Relationship to 021

| | **021 Look** | **023 catalyst** |
|---|-------------|------------------|
| Job | File a founder-discovered miss from Log → **`wake-engineer`** | Remember and eventually **fix** the miss class (mouth/session continuity) |
| Status on `main` | Merged ([#194](https://github.com/bywale-com/travis/pull/194)) | **Park** — this file |
| Wake | sa (was) | hold |

---

## Not locked until go

SA number for ascribe. Whether fix is events lifetime, reconnect, STT/TTS ordering, or a store field. Whether preflight/runtime can ever catch this without a lived Voice walk.

**Engineer:** follow the cut. Do not merge broken preview. Human walk on psi still closes the catalyst when plant is valid.
