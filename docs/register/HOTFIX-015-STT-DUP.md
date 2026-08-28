# Hotfix 015 — Fold long STT restarts

**Number:** `015` — next engineer hotfix is `016`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: the same long passage landed twice in one send, with a hitch like “exit again” between copies).  
**When:** 2026-08-28  
**PR title shape:** `Hotfix 015 — fold duplicated STT passages`

---

## Why (smoke)

Hotfix 013/014 planted sentence TTS + IP resume. Capture still used n-gram stutter (2–5 words) and a growing-concat fold from the start. Web Speech restart dumps the **whole passage** again after a few junk words. That is longer than 5 words and not a prefix of the remainder, so both copies survived into the send.

013 could also re-queue a leftover that was already spoken as sentences. Guard that.

## Cut

1. After existing stutter folds: if a 6+ word opening passage repeats within 8 junk words, keep the later copy.
2. Voice enqueue: skip (or suffix-only) when the speakable text was already queued.

## Must-not

- Do not mint tables.
- Do not change 013 sentence timing or 014 IP resume.
- Do not append PM/SA logs.

## Verify

1. Talk a long line, hitch, say it again → one copy in the log / send.
2. Voice still starts reading at the first sentence; does not read that sentence twice at `done`.
