# Hotfix 033 — Saying Travis must not wipe the Talk draft

**Number:** `033` — next engineer hotfix is `034`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: uttering “travis” in Talk/Voice wiped the draft; Type was fine).  
**When:** 2026-09-01  
**PR title shape:** `Hotfix 033 — Travis vocative must not wipe the draft`

---

## Why

Talk STT treated any `parseCallByName` hit on Travis as vocative-off-Live and always `clearDraft()`. Type never uses that path, so the composer kept the body.

`isVocativeOnlyCall` also treated remainder === utterance as switch-only. Trailing vocative returns the full line as remainder, so “testing audio travis” looked like a bare vocative and the work died.

The word “travis” inside dest-Travis Talk was the same intercept.

## Cut

1. Vocative-only (`Travis` / `hey travis`) still switches dest and clears.
2. Work + Travis keeps the work in the draft (strip a trailing name).
3. Already dest Travis: do not intercept the word “travis”.
4. Intercept only on committed finals, not interim.

## Must-not

- Do not send a vocative-only “travis” as a turn.
- Do not change Type chips.
- Do not append PM/SA logs.

## Verify

`npm test`.

Talk: say a line, then `travis` as dest — the line stays, dest is Travis. Bare `hey travis` still clears. Type unchanged. Dest Travis Talk can say the word travis without wiping.
