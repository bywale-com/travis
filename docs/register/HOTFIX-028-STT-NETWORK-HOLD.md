# Hotfix 028 — Hold the draft across STT: Network

**Number:** `028` — next engineer hotfix is `029`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: STT: Network at the bottom of the log; everything already dictated vanishes; the ear comes back empty).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 028 — hold draft across STT network`

---

## Why

`STT: Network` is Chrome Web Speech failing to reach the speech servers. The ear dies and restarts quickly. That hitch is fine. The wipe is not.

021 already kept an **empty** result list from replacing the draft. A network failure often does the other thing: it **resets the result list to a leftover fragment** (the last word, or a short final) and then fires `onerror`. `keepSpeechDraft` took any non-empty next as the whole draft, so a long interim line became `saying`. Persist then saved the fragment. When the ear came back, you started over.

## Cut

1. `keepSpeechDraft` absorbs instead of replacing. Empty next still keeps prev. A short fragment that is a prefix/suffix of prev keeps prev. A true continuation still grows. A stutter-fold of the same line still folds.
2. Room `onstart` clears a stale `STT: …` banner once the ear is live again. The text never depended on that banner.

## Must-not

- Do not mint tables.
- Do not treat network as “don’t listen” — the ear still restarts.
- Do not append PM/SA logs.

## Verify

1. Talk (or Voice dest Engineer): speak a long line, stay all-interim. A `network` result-list reset must leave the draft on the glass. Keep talking → it appends. I’m done still sends.
2. Same dest Travis Talk.
3. `npm test` covers the fragment wipe and the append-after-hitch path.
