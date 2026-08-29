# Hotfix 017 — Read facilitator + Live mouth

**Number:** `017` — next engineer hotfix is `018`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: plant the parked read jobs from the Travis-agent envelope).  
**When:** 2026-08-29  
**PR title shape:** `Hotfix 017 — stop / say again / simplify + Live mouth`  
**Builds on:** SCP-006 plant ([PR #31](https://github.com/bywale-com/travis/pull/31)).

---

## Why

SCP-006 made Travis an addressee with tools. Seat posts still used `speechSynthesis`. Stop / say-again / simplify on **Engineer’s read** were parked: different job (Travis is the mouth, not dest). Live mouth for other seats was the same splice.

## Cut

1. Voice ear stays open during a seat read so `stop` / `wait` / `say that again` / `simplify` land without a done-phrase and do **not** send to Cursor.
2. Seat posts in Voice are spoken by Travis Live (text-in, audio-out) when `GEMINI_API_KEY` is set. Fallback: 013 `speechSynthesis`.
3. **Stop** cuts the read (Live playback + leftover TTS). Orb tap while speaking is stop.
4. **Say that again** replays the last spoken unit. No Cursor run.
5. **Simplify** rewrites the last seat post on the server (Gemini text). Original `agent_post` stays. New Travis `agent_post` (`seat_key=travis`, `reference_turn_id` = original) is what he speaks. No Engineer run.

## Must-not

- Do not mint tables.
- Do not send facilitator phrases through `streamCursorReply`.
- Do not replace the Engineer post in the log.
- Do not recut SCP-006 tools / dest / binding.
- Do not append PM/SA logs.

## Verify

1. Dest Engineer, a post starts reading → say **stop** → read cuts; dest still Engineer.
2. **Say that again** → last unit again. No new Cursor run.
3. **Simplify** → Travis line in the log, T mark, original Engineer post still there; he speaks the short version.
4. No Gemini key → read still works via browser TTS; simplify writes “Travis isn’t wired.”
5. `hey engineer` + I’m done still sends as today.
