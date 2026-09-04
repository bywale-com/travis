# PM packet 007 — Hear queue (seat posts do not barge the ear)

**Number:** `007` — next PM packet is `008`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Product Manager. **Engineer** plants the mediation cut. **SA** ascribes heard/ready + gist.  
**When:** Locked 2026-09-03 — founder: fix seat responses barging into Google Voice. Priority: mediation / queue. Seat outputs notify Travis and wait.  
**Photo:** none this lock. FACE: [`HEAR-QUEUE-SPEC.md`](./HEAR-QUEUE-SPEC.md). Do **not** recut C3/C4 (those are **your** 003 queue).  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC** — do not overwrite.  
**Revises:** 002 Mode A “read everything as it lands.” Travis is still the only voice; **when** he reads changes.  
**Not:** 003 send-queue · V6 running · 006 Voice swoosh (sibling; keep).

**Priority:** **First-order.** Ahead of Mission plates, cost door, output types, verified sight. Plant the **must-not barge** now. Do not wait on a new table if the first cut can be “never start seat TTS on insert.”

---

## Founder wording

Fix seat response barging into Google Voice. Prioritize a mediation/queueing model where seat outputs notify Travis and are queued, with rules for urgency, ordering, and user notifications. Coordinate with Engineer and SA on design and rollout.

---

## The law

Seat posts **notify** and **queue**. They do **not** start Google TTS (or any seat readback) over the conversation.

Travis **mediates**. One mouth. You invite the read (Hear / Next / name). Default read = **gist**; verbatim on request; full text always in the log.

---

## Two buckets

### 1. Specified and clear — Engineer cuts now

- On `agent_post` (or equivalent) **insert**: do not call `speechSynthesis` / Google TTS / seat readback.  
- **One mouth:** if Live is up, seat TTS does not run. If a rundown is playing, a new landing does not cut it.  
- **Ready chip:** `Eng ready` / `2 ready · Eng, SA`. Not the word `waiting` (003 owns that).  
- **Notify beat** only when the ear is **free** (see urgency). Copy: “Engineer finished.” Then silence. Not the post body.  
- **Hear-queue** order (below). Hear / Next / Skip.  
- Log still paints the post (005). Play-on-bubble starts rundown for **that** item only.

### 2. Specified but not clear until SA

- Persist “heard” / “ready” across refresh and a second tab, or session-local only?  
- Gist for rundown: reuse `summarizeSeatReply` or a speakable gist?  
- User-invited urgency (“tell me when Engineer is done”) — store vs ephemeral?  

Do not mint a table in the SPA. If SA says session-local is enough for v1, Engineer plants that and names the silence.

---

## Urgency (not Travis judgment)

Travis does **not** decide what matters. Only these ranks:

| Rank | What it is | Who set it | Effect |
|------|------------|------------|--------|
| **0 · Ear-busy** | You are speaking, Live is speaking, or a rundown is mid-sentence | The ear | **Hold** spoken notify. Chip still updates. Never barge. |
| **1 · Invited** | You already said “tell me when {seat} is done” (039 opt-in) | You | That seat’s ready item sorts **before** FIFO normals. Still no auto-read of the body. Notify beat when ear frees. |
| **2 · Normal** | Seat finished, you did not pre-invite | Default | FIFO by **ready-at**. Chip. Beat when ear free. |
| **3 · Status / error** | Quiet status / run error (027 kind) | The turn | Queued like normal. Chip may read `Eng error`. Still no body TTS on land. |

No “Engineer is more urgent than SA.” No model-scored priority.

When the ear **frees**: at most **one** coalesced beat for everything that waited — “Engineer and SA finished.” Not a stack of three “finished” lines.

---

## Ordering

1. **Invited** items, oldest `ready-at` first.  
2. **Normal** (and status/error), oldest `ready-at` first.  
3. Same seat, several posts: **oldest unheard** first.  
4. **Next** = head of that list.  
5. **Hear** / “read Engineer” = jump to that seat’s oldest unheard.  
6. **Skip** = drop from the hear-queue; turn stays in the log.

This room only. Mode switch preserves the queue.

---

## User notifications

| Channel | When | What |
|---------|------|------|
| **Chip** | Any ready item | Always. Quiet. |
| **Spoken beat** | Ear **free** + new ready (or held items flushing) | “{Seat} finished.” / coalesced. Live mouth if Live is up; else conductor. **Never** Google-TTS the post. |
| **Ear busy** | User or Live or rundown talking | Chip only. Beat later, once. |
| **Log** | Always | Post appears. No auto-play. |
| **Rundown** | After Hear / Next / play-on-bubble | Gist, then wait. Not a notification — a read you asked for. |

006: Voice still has no send/queue **swoosh**. Ready chip is not a swoosh.

---

## Rollout

| Step | Who | Cut |
|------|-----|-----|
| **R0** | Engineer **now** | Kill seat TTS on land. One mouth. Chip + beat-when-free. FIFO in memory. **This is the barge fix.** |
| **R1** | SA, then Engineer | Heard/ready ascription. Invited-urgency if a store is named. |
| **R2** | Engineer after R0 | Hear sheet + Next/Skip + rundown gist (may use existing summarize). |
| **R3** | Later | Second-tab sync, plates. |

R0 does not wait on R1. A refresh that forgets “heard” is a named silence, not a reason to keep barging.

---

## Acceptance (R0)

| # | Given | When | Then |
|---|--------|------|------|
| A1 | Voice, Live up, you talking to Travis | Engineer post lands | **No** Google TTS. Chip `Eng ready`. No beat until ear free |
| A2 | Ear becomes free, one item waited | — | One beat “Engineer finished.” Still no post body |
| A3 | Two seats landed while you spoke | Ear frees | One beat “Engineer and SA finished.” |
| A4 | You Hear / Next | — | Rundown gist (R2) or, if gist not in yet, **do not** dump the raw 40k on TTS in R0 — chip/sheet is enough until R2 |
| A5 | Talk / Type | Seat post lands | Log paints. No auto-play. Same chip |
| A6 | 003 waiting chip | Your line queued | Still `n waiting · Eng`. Distinct from `ready` |

R0 A4: if rundown is not planted yet, **silence + chip** beats barging a full Engineer post.

---

## Paste — Systems Analyst

```text
Read docs/register/PM-PACKET-007-HEAR-QUEUE.md and HEAR-QUEUE-SPEC.md. Founder: seat TTS barges Google Voice. 007 is locked, first-order.

Ascribe: (1) heard/ready — field vs session-local vs silence; (2) invited “tell me when {seat} is done”; (3) speakable gist vs summarizeSeatReply; (4) one-mouth must — Live vs speechSynthesis. Do not mint a table from the packet. Quote stood-up turns. Stamp SYSTEMS-ANALYST-LOG. Change packet when Engineer has no analysis left for R1.
```

## Paste — Engineer

```text
Read docs/register/PM-PACKET-007-HEAR-QUEUE.md ALL THE WAY THROUGH, then HEAR-QUEUE-SPEC.md.

You are Travis’s Engineer. Identity: docs/README.md § Engineer · AGENTS.md. Do not overwrite PHASE-ONE-LOG 14:00. Do not append PM/SA logs. Do not mint tables.

First-order. R0 now: seat agent_post must not start Google TTS / speechSynthesis. One mouth — yield to Live and to an in-progress rundown. Ready chip (not the 003 waiting word). Spoken “{seat} finished” only when the ear is free; coalesce if several waited. FIFO in memory. Do not recut C3/C4. 006 still: no Voice swoosh.

R2 (sheet + gist) after R0 is in. R1 waits on SA if you need a durable heard bit.

Two buckets only. Barge fix is specified and clear.
```

---

## Verify (R0 smoke)

1. Voice + Live: dispatch Engineer. Keep talking to Travis. When Eng posts: **conversation continues.** Chip shows ready. No overlap voice.  
2. Stop talking. Hear one short “Engineer finished.” Not the patch.  
3. Type: post appears; nothing speaks.  
4. Queue a line to a busy seat (003): `waiting` still means **your** line.
