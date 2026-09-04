# Hear queue + rundown — FACE (007 locked)

**Status:** **PM-PACKET-007 locked.** First-order. FACE for the packet.  
**Job:** Seat posts must not steal the ear. They notify Travis and wait. You choose what to hear next.  
**Packet:** [`PM-PACKET-007-HEAR-QUEUE.md`](./PM-PACKET-007-HEAR-QUEUE.md)  
**Flag:** 14:00 — hear the reply. 002 — seats post; Travis reads. **When** he reads is 007.  
**Does not mint a store.** SA ascribes heard/ready for R1.  
**Not 003.** Your lines waiting on a busy seat.  
**Not V6.** What’s still running.  
**Log:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md)

---

## The problem (founder)

Seat responses route straight to Google TTS and **speak over** the conversation. No queue, no notification, no summarization.

Lived: dest Travis Live (OpenAI) is the conversation. Seat readback is browser TTS. Those two mouths collide.

**Priority (founder):** fix the barge. Mediation / queue first. Seat outputs notify Travis and are queued. Rules for urgency, ordering, user notifications.

---

## Law

1. **Travis is still the only voice** (002). Seats post. Travis reads when you invite.  
2. **Landing is quiet.** Insert does not start TTS.  
3. **Notify, don’t barge.** Chip always. Spoken beat only when the ear is free.  
4. **Rundown default = gist.** Full post stays in the log. Verbatim on request. No Summarize button.  
5. **You pick next.** FIFO, or invited-urgency you set, or a name. No Travis judgment.

---

## Three objects

```
running   →  V6 / thought glow / “Eng · working”
ready     →  hear-queue  (“Eng ready”)
heard     →  leaves the hear-queue; stays in the log
```

---

## Urgency

| Rank | Set by | Effect |
|------|--------|--------|
| **0 Ear-busy** | You / Live / rundown talking | Hold spoken beat. Chip updates. Never barge. |
| **1 Invited** | You: “tell me when {seat} is done” | Sorts before FIFO. Still no body TTS on land. |
| **2 Normal** | Default | FIFO by ready-at. |
| **3 Status / error** | The turn | Like normal. Chip may say `Eng error`. |

No model-scored priority. When the ear frees: **one** coalesced beat (“Engineer and SA finished.”).

---

## Ordering

Invited (oldest) → normal/error (oldest) → same seat oldest unheard. **Next** = head. **Hear** / name = jump. **Skip** = drop from hear-queue only.

---

## Notifications

- **Chip** always when something is ready.  
- **Beat** when ear free: “{Seat} finished.” Live mouth if Live is up. Never Google-TTS the post.  
- **Log:** post as 005. No auto-play.  
- **Rundown:** after invite — gist, then wait.

---

## Hear-queue sheet

Portal + fixed. Ready rows, Hear / Next / Skip. Empty = chip gone.

---

## Rundown

Hear / Next / play-on-bubble → name the seat → gist (≤3 sentences) → wait → “read it” = verbatim cap → “next” / “stop.” Voice stays on the orb. View log remains a button.

---

## Voice vs log

Same chip. Voice: no auto TTS. Log: no auto-play; play-on-bubble = that item only. 003 `waiting` unchanged.

---

## Rollout

**R0** Engineer now — no barge, one mouth, chip, beat-when-free, FIFO memory.  
**R1** SA then Engineer — heard/ready, invited.  
**R2** sheet + gist.  
**R3** plates / second tab.

---

## Five buckets

1. **Copy:** Ready chip · beat-when-free · queue · Hear/Next/Skip · gist · verbatim on request.  
2. **Do not build:** Auto TTS on land. Two mouths. Summarize button. Priority AI. Recut C3/C4.  
3. **Implied:** Chip count = unheard ready. Skip ≠ delete. Mode switch keeps the queue.  
4. **Completes:** Coalesced beat. “What’s ready.” Say-again = last gist or verbatim.  
5. **Out:** v2 judgment. ElevenLabs. Board. Full read on land.
