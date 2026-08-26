# PM packet 001 — Voice session (smartphone continuous face, v1 pipe)

**Number:** `001` — next PM packet is `002`. Never reuse a number. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this.  
**When:** 2026-08-25 — plate liked enough to begin packet; not every grain frozen.  
**Plates:** [`plates/travis-voice-session-plate-v1.png`](./plates/travis-voice-session-plate-v1.png). FACE: [`VOICE-SESSION-FACE.md`](./VOICE-SESSION-FACE.md).  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC** founder wording — do not overwrite. Read: [`PLATE-READ.md`](./PLATE-READ.md).  
**Does not:** plant without founder handoff; mint tables from the picture; build triage judgment; build multi-seat auto-wake (PM→SA→Engineer chain); puppet Cursor desktop chat; ship API keys to the client.  
**Living home:** PM packets PR (reuse that PR; do not open a new PR per packet).

---

## Do not miss

This is a **smartphone web** face (`travis.app` shape). Primary device = phone browser.

**One open → keep talking / listen / keep talking.** The plate shows the **listening** state of an already-open session. The product replaces today’s Cursor phone path: mic → ≤~4 min or lose the turn → wait for full transcript → send → poll phone → read only → occasional image/plate in chat.

**Speech end / “when does the chat answer”** — founder named this as the core hard problem (end of speech without pressing a button; risk of cutting too early / losing context — unsure if real). **Engineer owns that grain** when cutting. This packet does **not** freeze a VAD / silence-timeout law. Do not pretend the plate solved it.

---

## Paste — engineer

```text
Read docs/register/PM-PACKET-001-VOICE-SESSION.md ALL THE WAY THROUGH. Then docs/register/PLATE-READ.md and docs/register/VOICE-SESSION-FACE.md. Plate: docs/register/plates/travis-voice-session-plate-v1.png.

You are Travis’s Engineer. Identity: docs/README.md § Engineer · AGENTS.md. You are not PM. You are not SA. Product face = smartphone web voice session. Do not overwrite PHASE-ONE-LOG 14:00. Do not mint tables. Do not hard-code demo people into the SPA. Do not ship CURSOR_API_KEY to the client. Do not puppet Cursor desktop.

Build the v1 dumb pipe face for this pocket only:
- Session after one open: header Travis + live seat chip (PM · live on the plate).
- Voice presence: listening state as on the plate; tap-once-to-pause is on the glass — implement as pause of listening, not as “press to end every utterance” law.
- Thread: user speech-as-text; assistant text; listen/play affordance while/after readback.
- Artifacts (images/plates) nest in the assistant turn in order.
- Quiet End session only. No keyboard. No mic-button farm. No dashboard.

Speech-end detection (when the pipe decides the user finished talking and may send / wait for reply) is YOUR grain. Founder: cannot rely on stop/press each turn; do not cut too early; context-loss risk unclear — prove with a real approach, do not invent product law in the UI copy.

Cursor seam: @cursor/sdk / Cloud Agents API only (durable agent + run + stream). Hygiene: do not TTS thinking/tool spam; speak assistant text + short terminal status.

Specified-and-clear: build. Specified-but-blocked on SA store/contract: name why; stop. Five buckets are in this packet.
```

## Paste — Systems Analyst

```text
You are Travis’s Systems Analyst. Identity: docs/README.md § Systems Analyst · docs/seats/SYSTEMS-ANALYST.md. Log: docs/register/SYSTEMS-ANALYST-LOG.md. Product flag PHASE-ONE-LOG 14:00 is read-only. Face pocket: docs/register/PM-PACKET-001-VOICE-SESSION.md + plate + VOICE-SESSION-FACE.md.

Do not mint tables from the picture. Do not freeze the nested “Overflow menu treatments” graphic as a Travis module — teaching scenery only.

Ascribe this pocket in systems language (stores / contracts / ports / silences):

A. Session: what must Travis hold locally (session id, seat, agent id, run id, ordered turns, artifact refs) vs what Cursor already holds? Silent if silent.

B. Speech path: STT port (browser vs server), partial vs final transcripts, how an utterance becomes a run.send — without freezing endpoint/VAD law (Engineer grain). Name musts and silences.

C. Reply path: run stream → assistant text for TTS + thread; how images/artifacts arrive (stream vs download-after-result). Quote Cursor API/SDK, not memory.

D. Local vs cloud runtime for phone-first continuity. Pick or name the silence for v1.

E. Auth: API key server-side only. What session auth (if any) does the phone need in v1? Silent if silent.

Stamp SYSTEMS-ANALYST-LOG. Cut a change packet only when inventory is enough that the Engineer has no analysis left.
```

---

## Five buckets (PLATE-READ)

1. **Copy:** Smartphone web session shell. Brand **Travis** as header hero. Seat chip **PM · live**. Center **listening** voice presence + status line *Listening… tap once to pause*. Scrollable **thread**: user transcript bubble; assistant text bubble with small play/waveform affordance; **artifact nested in the assistant turn**. Quiet **End session** text control only.

2. **Do not build:** Safari/browser chrome as product UI. Nested “Overflow menu treatments” content (teaching scenery for “plate can appear in chat”). Keyboard. Persistent mic button cluster. Nav tabs / dashboard. Stats. Fake overflow-menu product module. Triage judgment UI. Multi-seat orchestration UI.

3. **Implied:** Session is already open (one prior tap to enter — cold-open / home is Completes if missing). Listening is the default active state of the open session. Tap-once-to-pause **pauses listening** (control on the glass must work). Play/waveform means readback is audible, not read-only. Thread scrolls; newer turns stack in order. End session ends the session.

4. **Completes:** Other voice-presence states for the same module without requiring extra PNGs to ship the pocket: at least **paused**, and **Travis speaking / readback** (may reuse presence + status copy). User turn appearing from speech (transcript). Assistant turn appearing from stream. Artifact appearing when the run produces one. **Speech-end → send/wait** behavior — Engineer grain; module unfinished if the pipe never answers, but **do not freeze a button-per-turn or a specific VAD number in this packet**. Escape from Cursor’s ~4‑minute mic cliff (longer utterances must not wipe the turn) — Engineer/STT path.

5. **Out of scope this build:** Fieldtop / mounted laptop as primary. Triage/compression layer (v2). PM-only speak with auto-wake SA/Engineer (parked next; Cursor Automations perimeter). Auth productization beyond what’s required to hold a key server-side. Agent seat picker beyond the chip as pictured. Desktop Cursor UI. Planting Hub-style scenery.

---

## Founder comments (preserve)

Do not generate a substitute flag. This is what was said, in this pocket:

- Primary device is a smartphone; this plate is for **web browser on smartphone**.
- Today in Cursor: open PM chat → mic → talk → **≤ ~4 minutes or lose everything** → stop → **wait for full transcription** → send → **keep checking** the phone → **read** (no listen-back) → occasionally image/plate in chat (PM often generates plates).
- Want: **click once** on the app and **keep talking**, and **listen**, and **keep talking** — figure turn-stops later.
- Idea (not law): “you can’t just stop / press a button” for end of speech; core problem is **how the chat knows when to answer** without doing it too early / risking loss of context — **unsure if context-loss is a real risk**; **keep that for the engineer**.
- This image is **basically good enough to begin a packet**.
- Multi-seat auto chain (speak only to PM; automate SA/Engineer) = **next**, related to Cursor Automations — not this pocket.
- Product flag (earlier): interface between me and Cursor; voice dialogue; readable read back; images in chat; open this app not Cursor.

---

## Do not

- Overwrite the 14:00 flag.
- Freeze nested plate scenery as a module.
- Freeze speech-end / VAD product law in UI copy.
- Build triage or multi-seat wake in this pocket.
- Mint tables from the PNG.
- Ship secrets to the phone.
- Puppet Cursor desktop.
- Treat browser chrome on the PNG as Travis UI.
