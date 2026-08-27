# Hotfix 004 — Addressing phrases, dead-man, STT after first turn

**Number:** `004` — next engineer hotfix is `005`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived smoke on the room).  
**When:** 2026-08-27  
**Pocket:** SCP-002 room + Hotfix 002 plant.  
**PR title shape:** `Hotfix 004 — addressing, dead-man, STT resume`

---

## Why (smoke)

Founder:

1. Did not know the **keyword** to speak with Engineer vs SA.
2. Travis kept asking **“Are you talking with me?”** with no sense of what fired it.
3. After the first send, STT died until pause/resume. Then **I'm done** cleared the draft and did not send.

Causes:

- Call-by-name is leading `PM` / `SA` / `Engineer` — not on the glass.
- Dead-man timer is 45s of no STT events, **including log view** (reading counts as silence). After it fires, the next `I'm done` is swallowed as a dead-man reply (`parseDeadManResponse` defaults everything to PM) and the client clears the buffer.
- Chrome kills Web Speech when TTS speaks. `onend` during finalize refuses to restart (`finalizingRef`). Pause/resume was the only `startRecognition()`.

---

## Cut

1. Quiet Mode A hint: start with **PM, SA, or Engineer**; end with **I'm done**.
2. Dead-man only in **voice + listening**, not log, not while busy/TTS. Interval **3 minutes** (Engineer grain).
3. Dead-man consumes only short **no** / **no, X** / **yes**. A real done-phrase turn falls through and **sends**.
4. After TTS / finalize, **restart STT**. `onend` restarts whenever listen is wanted.

## Must-not

- Do not mint a seat picker.
- Do not append PM/SA logs.
- Do not invent new conductor phrases.

## Verify

1. Open session → muted line shows PM / SA / Engineer + I'm done.
2. `Engineer look at the log I'm done` → pills via Eng; STT still live after the reply.
3. Switch to log, wait > 45s → **no** dead-man prompt.
4. Stay in voice, silent 3 minutes → one “Are you talking with me?”
5. After that, a full thought + I'm done **sends**, does not wipe without a turn.

## Out of scope

- Binding picker. Travis-as-Cursor-agent. Replacing the done-phrase conductor.
