# Voice session — FACE (first plate)

**Product face:** smartphone web browser (`travis.app` shape)  
**Plate:** [`plates/travis-voice-session-plate-v1.png`](./plates/travis-voice-session-plate-v1.png)  
**Status:** Potential plate → **PM packet 001** ([`PM-PACKET-001-VOICE-SESSION.md`](./PM-PACKET-001-VOICE-SESSION.md) — lives on the reusable PM packets PR). Founder: image good enough to begin. Speech-end detection left to Engineer. Not every grain frozen.  
**Log:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) Current

---

## What this plate is trying to show

One continuous **PM · live** session after a single open: talk, listen, talk — with the chat thread as the quiet record, and plates/images landing **in-thread** when they can’t be spoken.

Primary device = **phone browser**. Not desktop Cursor. Not a Fieldtop dashboard.

---

## Plate read (five buckets)

| Bucket | Content |
|--------|---------|
| **Copy** | Brand **Travis** as the header hero. Seat chip `PM · live`. Center voice presence + status *Listening… tap once to pause*. User transcript bubble. Assistant text + small playing waveform. Inline plate/image artifact in the assistant turn. Quiet *End session* only. |
| **Do not build** | Safari chrome as product UI. Fake overflow-menu content inside the nested plate (that’s scenery for “artifact in chat”). Keyboard. Persistent mic button farm. Nav tabs. Stats. Second panes. |
| **Implied** | Session already open (one prior tap to enter). Listening is the default active state. Tap once pauses (turn-stop grain still open). Readback is audio *and* text. Visual overflow stays in the same scroll. |
| **Completes** | Founder’s “click once → keep talking / listen / keep talking” + “images and plates appear in the chat.” |
| **Out of scope** | Triage judgment. Multi-seat auto-wake (SA/Engineer chain). Turn-boundary law beyond what’s pictured. Auth. Agent picker beyond `PM · live` as a chip. |

---

## Regions (functional labels)

1. **Session header** — Travis + live seat  
2. **Voice presence** — listening / paused / speaking-back (this plate = listening)  
3. **Thread** — ordered turns; user speech-as-text; assistant text + listen affordance  
4. **Artifact nest** — plate/image inside an assistant turn  
5. **Session door** — End session (quiet)

---

## Open grain (do not invent on the plate)

- Exact turn-stop rules (silence timeout vs tap vs barge-in while Travis is reading)  
- Whether listening resumes automatically after readback  
- How long utterances can be (founder wants past Cursor’s ~4‑minute mic cliff)  
- Whether `PM · live` is picker or fixed for v1  

---

## Teaching copy vs nodes

The nested “Overflow menu treatments” graphic is **teaching scenery** for “a plate can appear in chat” — it is **not** a Travis product module to build.
