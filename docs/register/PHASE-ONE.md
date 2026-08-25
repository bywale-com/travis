# Phase One — thesis

**Product:** Travis  
**Seat trail (PM):** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md)  
**Seat trail (SA):** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Seats:** [`../README.md`](../README.md)

---

## What Phase One is

Phase One is the stand-up of Travis as a **voice interface between the founder and Cursor as it exists today** — a dumb pipe first, judgment later.

We are **not** rewriting Cursor. We are **not** building a second IDE. We are **not** justifying a visual-first moat. We are collapsing access friction so the build loop stays live while hands and eyes are busy (phone-first; car/motion is the lived constraint that named the need).

---

## Product flag (founder wording)

Captured in the Phase One log. Do not replace with a generated list. Current pointer lives at the top of [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md).

Plain statement (opening):

> I simply don’t wanna have to look at my phone. When it’s time to work on building, I open this app — not the Cursor app — and I can have a dialogue: talk, voice-send, hear the reply read back. Everything readable in the chat is read to me; images and such appear in the chat. It’s an interface between me and Cursor as it exists today.

---

## Shape (agent alignment — not the flag)

| Layer | Job |
|-------|-----|
| **You** | Speak. Listen. Glance only when something is inherently visual. |
| **Travis** | STT → create/follow-up run → consume stream → TTS + chat (text + images in order). |
| **Cursor** | Durable agents / runs (SDK + Cloud Agents API). Execution surface. Buried. |

**v1 — pipe.** Surface everything readable. Hygiene filter: do not read thinking/tool spam aloud.  
**v2 — triage inside the pipe.** What to speak vs show, how compressed. Same object as the harness; not a second product.

**Visual pane.** Downstream of the pipe (and later of triage). Passive overflow for the un-speakable. Not the primary interface. Not a mounted-laptop substitute for voice.

---

## How we work (same Om Coda practices)

- Three seats: PM · SA · Engineer — do not swap jobs.  
- PM: Type A / Type B, module-by-module with perimeter, founder wording, Phase One log.  
- SA: Story → Requirements → stores/contracts, change packets, SA log.  
- Engineer: two buckets only; wire locked pockets; trail = git + PRs.  
- Method: [`../method/`](../method/). Build: [`../build-foundation/`](../build-foundation/).

---

## What Phase One is not

- Planting a full assistant personality before the pipe works  
- Puppeting Cursor’s desktop chat UI  
- Visual-first Fieldtop as the product center  
- Triage/judgment as day-one scope  
- A second Tower (immigration engagement system) — different product, same seats and method  
