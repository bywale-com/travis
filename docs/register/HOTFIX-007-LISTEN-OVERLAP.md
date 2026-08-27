# Hotfix 007 — Listen during an in-flight run; hold the next done-phrase

**Number:** `007` — next engineer hotfix is `008`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived smoke: send to Engineer, start talking to PM, nothing lands).  
**When:** 2026-08-27  
**Pocket:** SCP-001 continuous listen.  
**PR title shape:** `Hotfix 007 — listen during run, hold next send`

---

## Why (smoke)

Founder: send a turn to Engineer, start talking again intending PM. Unclear whether Travis **wasn’t capturing** or **wasn’t sending**.

**Code:**

1. **Capture.** `finalizeUtterance` `abort()`s Web Speech and does not start it again until the Cursor **stream + TTS** finish. SCP-001 is continuous listen until pause/end. While Engineer is working, the mic is off.
2. **Send.** A second `I'm done` while `finalizingRef` is true is dropped. Even if the mic were on, the PM turn would not fire.

Sticky seat is separate: without a leading `PM`, a successful second send would still go to Engineer.

## Cut

1. After halt (needed so the previous `I'm done` is not still in the recognition result list), **restart STT** so the next utterance can accumulate while the run is live. Halt again only when Travis **speaks**.
2. If `I'm done` fires during an in-flight finalize, **hold** that utterance in memory and send it when the current stream/TTS ends. Not a durable queue table. Not delete/force chrome.

## Must-not

- Do not mint a send-queue table.
- Do not add force-send / delete-queued glass (PM has not locked that face).
- Do not interrupt the live Cursor run (cancel) unless PM/SA lock barge-in.
- Do not append PM/SA logs.

## Verify

1. Send to Engineer → while Eng is still running, speak `PM look at the log I'm done` → after the Engineer stream (and Mode A readback) finishes, that PM turn sends.
2. Log view: pale draft appears while Engineer is still working.
3. Pause still stops listen.
