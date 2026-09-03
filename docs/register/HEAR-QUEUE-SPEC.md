# Hear queue + rundown — considering

**Status:** Considering. **Not a packet.**  
**Job:** Seat posts must not steal the ear. You choose what to hear next.  
**Flag:** 14:00 — hear the reply. 002 — seats post; Travis reads. This spec **changes when** Voice reads, not who speaks.  
**Does not mint a store.** SA ascribes “ready to hear” vs a new table. Client-unheard on existing turns may be enough.  
**Not 003.** 003 is **your** lines waiting on a busy seat. This is **their** replies waiting on your ear.  
**Not V6.** V6 is what’s **running**. This is what’s **finished and not yet heard**.  
**Log:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md)

---

## The problem (founder)

Seat responses route straight to Google TTS and **speak over** the conversation. No queue, no notification, no summarization.

Lived: dest Travis Live (OpenAI) is the conversation. Seat readback is browser TTS. Those two mouths collide.

---

## Law

1. **Travis is still the only voice** (002). Seats never address you. They post. Travis reads — **when you invite the read**.  
2. **Landing is quiet.** A finished seat does not start TTS. (Revises Mode A “read everything as it lands.”)  
3. **Notify, don’t barge.** One short beat or a quiet chip. Then wait.  
4. **Rundown default = gist.** Travis says the outcome in a few sentences. The **full post stays in the log**. “Read it” / “the full thing” = verbatim excerpt. This is the facilitator **read form**, not a Summarize button (labor is still not an effect on the glass).  
5. **You pick the next seat.** FIFO if you say “next.” Tap or call a name to jump. No Travis judgment of who matters.

039’s “speak-on-land is opt-in” stays: the **notification** is the default opt-in; the **read** is a second invite.

---

## Three objects

```
running   →  V6 / thought glow / “Eng · working”
ready     →  hear-queue  (“Eng ready”)
heard     →  leaves the hear-queue; stays in the log
```

A seat can be **running** and have an older post **ready**. Those are two rows.

---

## Notification (seat finishes)

**Voice**

- Do **not** start Google TTS.  
- If dest Travis / Live is up: Travis (Live mouth) says one beat: **“Engineer finished.”** Then silence.  
- If Live is down (phone ear): same beat on the conductor mouth, or chip-only if they are mid “I’m done.” Prefer chip-only rather than talking over their send.  
- Chip: `Eng ready` (or `2 ready · Eng, SA`). Quiet. Same family as `n waiting · Eng` — **different word.** Waiting = your line. Ready = their post.

**Log (Talk / Type)**

- Post appears as today (005).  
- Same chip in the header. No auto-play.  
- Optional play on **that** bubble (already implied on 001) — starts rundown for that seat only, does not drain the whole queue.

**Must-not:** two TTS engines at once. Seat readback **yields** to Live. 006 Voice send/queue quiet is unrelated and stays.

---

## Hear-queue (agent response queue)

Door / glance — not a new home.

**Voice:** the ready chip. Tap → sheet (portal + fixed) of ready seats, oldest first.

```
Ready                         Done

Eng    2 min ago     Hear
SA     just now      Hear
PM     8 min ago     Hear

Next = oldest (Eng)
```

One loud action: **Hear** on a row, or **Next**.

**Log:** same sheet from the chip. Posts are already in the thread — the sheet is only **what hasn’t been heard**.

**Skip** drops that item from the hear-queue; the post stays in the log.

**Empty:** chip gone. No empty-state theater.

Parity: you can open the sheet without asking Travis. You can also say “what’s ready” / “read Engineer” / “next.”

---

## Rundown mode

A **read**, not a destination. Starts when you Hear / Next / “rundown.”

| Step | Travis does |
|------|-------------|
| 1 | “Engineer.” (who) |
| 2 | **Gist** — outcome in ≤3 sentences (same grain as `summarizeSeatReply`: lead with outcome, no headings, no lists, no code). |
| 3 | Stop. Wait. |
| 4 | On **“read it” / “the full thing” / “excerpt”** — verbatim. Cap the spoken excerpt (SA: reuse `READ_CAP` / 1800). Rest is in the log. |
| 5 | On **“next”** — mark heard, rundown the next ready seat. |
| 6 | On **“stop” / “wait”** — facilitator of the read (14:56). Do not send a Cursor turn. |

**Default is gist.** You should not have to ask for a summary. You ask for **more**.

Log during rundown: that seat’s post is in view if they’re in Talk/Type; Voice stays on the orb + subtitle of the gist. **View log** still a button.

Images in that post: Wave 1 beat (“there’s an image”) after the gist, not in the middle of the sentences.

---

## Voice vs log (controls)

| Control | Voice | Log |
|---------|--------|-----|
| Ready chip | Yes | Yes |
| Auto TTS on land | **No** | No |
| Hear / Next | Chip sheet or voice | Chip sheet or play-on-bubble |
| Rundown gist | Travis speaks | Optional play = same gist, then you can read the full bubble |
| Verbatim | On request, spoken | Always visible in the bubble (005) |
| View log / Back to voice | Unchanged | Unchanged |
| Stop / wait / say again | Voice to Travis (14:56) | Stop on the playing bubble |
| 003 barge / your waiting lines | Unchanged | Unchanged |

**Talk** (no composer): same chip; Next/Hear by voice or tap. Type: same; play-on-bubble is the manual door.

Do not add a “Rundown” tab. Do not put Voice + Type on one plate.

---

## How you pick who to hear next

| Move | What happens |
|------|----------------|
| **Next** / “next” | Oldest **ready**, FIFO |
| **Hear** on a row | That seat, even if not oldest |
| “Read Engineer” / “Engineer” while queue is up | That seat’s rundown (addressing, not a new dest for Cursor) |
| Thought-strip / seat mark | Tap a **ready** mark = Hear that seat. Tap a **running** mark ≠ start a read |
| Skip | Remove from hear-queue |

No “priority seat.” No Travis-chosen order. FIFO or your finger/voice.

If two posts from the same seat are ready, Hear that seat reads **oldest unheard first**, then offers Next for the rest.

---

## Defaults

1. Land **quiet**. Notify (beat + chip). Do not read.  
2. Rundown **gist**, verbatim on request.  
3. Next = **oldest ready**.  
4. Live mouth does the notify beat; seat TTS never overlaps Live.  
5. Log always has the raw post.  
6. No Summarize **button**.  
7. No notify-all-rooms. This room only.

---

## Five buckets

1. **Copy:** Ready chip · notify beat · hear-queue sheet · Hear / Next / Skip · rundown gist · verbatim on request · stop/wait.  
2. **Do not build:** Auto TTS on land. Two mouths at once. Summarize button. Priority AI. New tab. Recut 003 as this queue.  
3. **Implied:** Chip count = unheard ready posts. Skip ≠ delete the turn. Mode switch preserves the hear-queue.  
4. **Completes:** “What’s ready” spoken list. Say-again repeats the **gist** (or the verbatim if that’s what was playing).  
5. **Out:** Simplify-as-judgment (v2). ElevenLabs plant. Notify-on-land as full read. Board.

---

## SA must ascribe (do not mint)

1. Is “heard” a field on the turn, or session-local? (Refresh / second tab: should the chip come back?)  
2. Gist: reuse `summarizeSeatReply` for the **ear**, or a separate speakable gist?  
3. Who may start TTS: only after Hear, never on `agent_post` insert.  
4. Collision: Live vs `speechSynthesis` — hard must-not, one mouth.  
5. Silence: streaming tokens while the seat is still running — not “ready.”

---

## Plate

If this locks: one Voice glance (ready chip + beat subtitle) and one sheet. Ride K2 / U2 family. Do not recut C3/C4 (those are **your** queue).

---

## Open

1. Notify beat (“Engineer finished.”) every time, or chip-only when Live is down?  
2. FIFO Next — yes?  
3. Lock after SA, or hold behind 006 / rooms?
