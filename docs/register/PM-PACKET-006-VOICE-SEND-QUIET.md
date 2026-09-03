# PM packet 006 — Voice is quiet on send and queue

**Number:** `006` — next PM packet is `007`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Product Manager. **Engineer** plants. **SA:** no new store — 030/031 already forbade a sound table.  
**When:** Locked 2026-09-03 — founder: Voice must not play send/queue notification sounds. Talk/Type unchanged. First-order critical.  
**Photo:** none. Behavior. Do **not** recut C3/C4 or U2.  
**Builds on:** planted send/queue ear-feedback (Hotfix 030 / 031). Queue glass still 003.  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC** — do not overwrite.  
**Does not:** mute TTS / Live / readback; hide the queue chip; add a settings toggle this pocket; mint a sound table.

**Priority:** first-order critical. Plant now. Do not wait on Mission/Carbon plates or the rooms envelope.

---

## Founder wording

In Voice, suppress or disable notification sounds that play when a message is sent or queued. In Talk/Type keep existing behavior. Capture acceptance, edge cases, optional toggle. Confirm first-order critical.

---

## The law

**Voice is a listening room.** Send swoosh and queue cue are Talk/Type receipts. They do not play while the view is Voice.

Talk and Type keep 031: swoosh when a turn **sends**, two-note cue when it **queues**.

The queue **chip**, log rows, barge icons, and “Travis Live is down — phone ear.” stay. This packet is **sound only**.

---

## Acceptance

| # | Given | When | Then |
|---|--------|------|------|
| A1 | View is **Voice** | A turn **sends** (I’m done, dest Travis Live flush, or a later drain that fires the swoosh) | **No swoosh** |
| A2 | View is **Voice** | A turn **queues** | **No two-note cue** |
| A3 | View is **Talk** | Send / queue | Swoosh / cue as 031 |
| A4 | View is **Type** | Send / queue | Swoosh / cue as 031 |
| A5 | View is Voice | Send or queue | Chip, log, and barge chrome still update. No silent *product* — only silent *ear-feedback* |
| A6 | Phone silent-switch / ringer | Talk or Type send | Unchanged from 031 (still hear if the phone allows) |

**Decide the sound at play time**, not at tap time: if the view is Voice when `playSendSwoosh` / `playQueuedCue` would run, no-op. If they have already switched to Talk or Type, play.

---

## Edge cases

| Case | Law |
|------|-----|
| Send from Voice, SSE returns after they opened **Type** | Play (view is Type at play time) |
| Send from Type, SSE returns after they opened **Voice** | Silence |
| Queue while Voice; drain later still on Voice | Drain swoosh **silent** |
| Queue while Voice; drain after they opened Talk/Type | Drain swoosh **plays** |
| Dest Travis in Voice (Live flush) | Silent. Dest Travis in Talk/Type still swooshes (never queued — 030) |
| Voice → Talk → Voice between tap and SSE | Whatever the view is **when the shot would play** |
| Arm / silent looping bed (031 autoplay unlock) | Still arm on tap. Do not fire shots in Voice |
| End session / release player | Unchanged |
| Other Voice audio (Live, TTS, “I’m done” phrase, phone-ear copy) | Unchanged. This is not a mute-all |
| OS / browser / other-app notifications | Out of scope |

---

## UX — optional toggle

**Not this pocket.** Voice is quiet by law, not a preference.

A later door (settings: “Play send sounds in Voice”) is **out of scope**. Do not put a toggle on the Voice orb. Do not invent a sound store.

If they later want the cue in Voice, that is a new stamp — not a hidden default-on.

---

## Five buckets (PLATE-READ)

1. **Copy:** Voice: no send swoosh, no queue cue. Talk/Type: 031 unchanged. Visual queue unchanged.
2. **Do not build:** A mute toggle on Voice. A sound table. Muting Live/TTS. Recutting U2/C4 as if the chip went away.
3. **Implied:** Mode switch mid-flight uses current view. Drain uses current view. Arming still happens so Talk/Type can play after a Voice session.
4. **Completes:** Dest Travis Voice flush silent. Drain-while-Voice silent.
5. **Out of scope:** Optional Voice-sound toggle. Addressing 006-ask (late-name). Mission plates. ElevenLabs.

---

## Paste — Systems Analyst

```text
You are Travis’s Systems Analyst. Identity: docs/README.md § Systems Analyst · docs/seats/SYSTEMS-ANALYST.md. Log: docs/register/SYSTEMS-ANALYST-LOG.md. Product flag PHASE-ONE-LOG 14:00 is read-only.

Pocket: docs/register/PM-PACKET-006-VOICE-SEND-QUIET.md. Sound only. Hotfix 030/031 already forbade a sound table.

Ascribe nothing new unless a field already exists that Engineer would have to invent. Silence: no sound preference store this packet.

If the machine is already “client plays on SSE,” stamp that Engineer may cut. Do not mint a table.
```

## Paste — engineer

```text
Read docs/register/PM-PACKET-006-VOICE-SEND-QUIET.md ALL THE WAY THROUGH.

You are Travis’s Engineer. Identity: docs/README.md § Engineer · AGENTS.md. You are not PM. You are not SA. Do not overwrite PHASE-ONE-LOG 14:00. Do not append PM/SA logs. Do not mint a sound table.

First-order critical. Plant now. Do not wait for Mission plates.

Voice view: playSendSwoosh and playQueuedCue must no-op. Talk and Type: 031 unchanged. Decide at play time from the current view (Voice vs Talk/Type), including drain and dest-Travis Live flush. Keep resumeSendSounds arming. Do not mute Live, TTS, or the queue chip. No toggle on Voice.

Two buckets only. This pocket is specified and clear — cut it.
```

---

## Verify (manual)

1. Voice, dest Engineer working: I’m done a follow-up. **Hear nothing.** Chip still shows waiting.
2. Open Type, same seat still working: Send. **Hear the two-note cue.**
3. Type, seat free: Send. **Hear the swoosh.**
4. Voice, dest Travis, speak a turn that sends. **Hear nothing** (Live/TTS may still speak; no swoosh).
5. Queue in Voice, switch to Type, wait for drain. **Hear the swoosh** when it sends.
