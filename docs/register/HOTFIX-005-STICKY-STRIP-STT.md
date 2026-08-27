# Hotfix 005 — Sticky thought strip, STT after a turn, live-box dedupe

**Number:** `005` — next engineer hotfix is `006`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived smoke from Travis into this Engineer chat).  
**When:** 2026-08-27  
**Pocket:** SCP-002 room + Hotfix 004 plant.  
**PR title shape:** `Hotfix 005 — sticky thought strip, STT resume, live-box dedupe`

---

## What 004 actually shipped (so this cut is not a guess)

Hotfix 004 **merged** (`main` / PR #10): Mode A addressing hint, dead-man only in voice+listening at 3 minutes, short dead-man replies, **one** STT restart after TTS.

What 004 **did not** land on `main`: folding Android **growing concatenations** (that commit stayed on the 004 branch after the merge). So the live draft still doubled while talking.

004’s restart also called `startRecognition` from **both** the TTS `done` path **and** `finally`. The second call `stop()`s the engine that just started — Android then sits on “Listening…” with no mic until you tap the orb (pause) and tap again (resume).

---

## Routing — intentional, not a bug

SCP-002 / `parseCallByName`:

- Session **open** → active seat = **PM**.
- An utterance **starts with** `PM` | `SA` | `Systems Analyst` | `Engineer` | `Eng` → switch `active_binding_id`, strip the name, send the rest.
- **Later turns with no leading name stay on the current seat.** That is why a second Travis message that never said “engineer” still hit Engineer. Default-PM is only the **open** default, not every turn.
- Switch away: call another name, or dead-man **“No”** → PM, **“No, SA”** → SA.
- A name at the **end** (`can you hear me engineer`) does **not** switch.

Do not change this rule in this cut.

---

## Why (smoke)

Founder, from Travis:

1. After a send, still has to tap pause then resume to talk again.
2. While talking, the live draft **duplicates** the same sentence (not a stutter).
3. PM / SA / Eng circles above the fold **scroll away** with the log. The point of that fold is that they stay.

---

## Cut

1. Log chrome (header + thought circles + Back to voice) stays put; **only the thread scrolls**.
2. One scheduled STT restart after speech synthesis is idle; halt the mic without dropping “listen wanted”; do not restart during TTS; retry if `start()` dies.
3. Rebuild the live draft from the full result list; merge committed+interim without gluing a copy onto itself; fold growing concatenations (including short prefixes). Server also collapses before the Cursor send.

## Must-not

- Do not change the sticky-seat router.
- Do not mint a seat picker.
- Do not recut bubble markdown / text formatting (named below — not this glass).
- Do not append PM/SA logs.

## Verify

1. Mode B: scroll the thread — PM/SA/Eng circles stay on screen.
2. Speak a turn + I'm done + hear the reply → orb returns to Listening and the next utterance is captured **without** tapping pause.
3. Talk a long sentence in log view — the pale draft bubble does not grow copies of the same clause.

## Specified but not this cut

- **Bubble text formatting** (markdown, spacing). Founder named it; no locked FACE grain for how posts render. Do not invent a renderer.

## Out of scope

- Binding picker. Travis-as-Cursor-agent. Replacing the done-phrase conductor.
