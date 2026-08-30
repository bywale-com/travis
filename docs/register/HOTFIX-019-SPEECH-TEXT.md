# Hotfix 019 — Speech text fold + Live absorb

**Number:** `019` — next engineer hotfix is `020`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: speech text doubled / chopped after dest-Travis + 3.1 Live).  
**When:** 2026-08-30  
**PR title shape:** `Hotfix 019 — fold STT restarts and absorb Live speech`

---

## Why

Web Speech still dumps a long passage twice after a hitch. **015** cut that fold; it never landed on `main`. Dest-Travis Live persisted **every** transcription chunk as a new turn, so 3.1 Live partials made speech text choppy and unreliable.

## Cut

1. Land the 015 fold: 6+ word restart within 8 junk words → keep the later copy. N-gram window 12. Voice skip leftover already spoken.
2. Live: accumulate input/output with `absorbText`. Flush a user turn on silence / `turnComplete` (stutter-folded). Travis post **upserts** the last Travis `agent_post` — one growing line, not a row per chunk.

## Must-not

- Do not mint tables.
- Do not recut dest / tools / model pins.
- Do not append PM/SA logs.

## Verify

1. Talk a long line, hitch, say it again → one copy in the log / send.
2. Voice dest Travis: one user line per utterance; one growing Travis post, not a fragment per syllable.
3. Dest Engineer still sends as today.
