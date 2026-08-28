# Hotfix 013 — Speak assistant sentences as they land

**Number:** `013` — next engineer hotfix is `014`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived voice smoke: log already shows the reply while Travis stays silent until stream `done`, then dumps the whole post).  
**When:** 2026-08-28  
**PR title shape:** `Hotfix 013 — speak as it lands; resume session by IP`

---

## Why (smoke)

Voice mode only called `speechSynthesis` on stream **done**. `post_delta` was already on the glass. Travis is the facilitator, not an agent — speakable assistant text should be heard when it exists.

Keep the in-house Web Speech port. Do not read thoughts.

## Cut

1. Buffer the growing assistant post. Queue a TTS utterance at each sentence (or blank-line) boundary.
2. Flush the leftover fragment on `done`. Intro once: `{label} says.`
3. Do not `cancel()` between sentences (that was the dump). Cancel still on End / Play reply / dead-man.
4. Log / Type stay quiet.

## Must-not

- Do not mint tables.
- Do not speak `agent_thought`.
- Do not switch to ElevenLabs in this cut.
- Do not append PM/SA logs.

## Verify

1. Voice: a multi-sentence reply starts reading at the first period, while the log is still growing.
2. Log mode: no auto-read.
3. Short reply with no period still reads on `done`.
