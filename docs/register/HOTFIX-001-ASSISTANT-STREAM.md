# Hotfix 001 — Assistant stream + running status

**Number:** `001` — next engineer hotfix is `002`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (originated from lived smoke — not PM packet, not SA change packet).  
**When:** 2026-08-26  
**Pocket:** Talk-to-PM voice pipe already planted by SCP-001.  
**PR title shape:** `Hotfix 001 — assistant stream + running status`

---

## Why (smoke)

Founder spoke to Travis → STT solid → Cursor run happened → Travis thread stayed **blank** until the end → reply text **did not match** what Cursor Agents UI showed for the same run.

Cause in the plant: finalize used `run.wait()` only and surfaced `result.result` once. No live bubble; final string can diverge from streamed assistant text.

---

## Cut

1. On conductor match: write **user** turn immediately; show it in the thread.
2. Emit quiet **running** status while the Cursor run is in flight (not blank).
3. **Stream** `assistant` text events into a growing assistant bubble (hygiene: skip thinking / tool spam).
4. Persist final assistant (+ short status) turns from the assembled assistant text; prefer stream/conversation assembly over lone `result.result` when stream produced text.
5. TTS stand-in still reads the final assistant text after the run completes.

## Must-not

- Do not mint new product modules (COO / room / Travis-as-agent).
- Do not invent triage judgment.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG for this cut.
- Do not hard-code demo turns or agent ids.

## Verify

1. Open session → speak → done phrase → **user bubble appears immediately**.
2. While PM runs: thread shows **running** (or equivalent quiet status), not empty glass.
3. Assistant bubble **grows** with readable text (or lands as one shot if stand-in).
4. Spoken/shown Travis reply is closer to Cursor’s readable assistant answer than pre-hotfix `result.result`-only.
5. Thinking/tool dumps are not read aloud.

## Out of scope

- Binding picker / list cloud agents (SCP-002).
- Showing thinking pane.
- Artifacts nest.
- Seat routing / Travis-as-COO.
