# Hotfix 021 — Hold the draft across silence; re-arm the ear after mode switch

**Number:** `021` — next engineer hotfix is `022`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: speak, pause ~1s, the whole draft vanishes; Voice↔Talk still leaves capture dead until refresh).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 021 — hold STT draft + re-arm ear`

---

## Why

Two stacked bugs on the product face (not Travis-only):

1. **Silence wipe (009 again).** Web Speech `onend` / a new recognizer fires an **empty result list**. `onresult` wrote `""` over the draft. Persist then no-op’d because merged was empty. A one-second pause cleared everything already said.
2. **Mode-switch dead ear (020 incomplete).** Abort+start still left capture dead until refresh. Live was marked true before `onstart`; `aborted` left arming stuck so the watchdog skipped; Talk after dest-Travis Voice skipped start because Live had set `listeningWanted` false.

## Cut

1. `keepSpeechDraft`: an empty next keeps the last heard line. Empty `onresult` does not `setDraft("")`.
2. Persist falls back to `lastHeard`. Halt copies the field before abort.
3. `recognitionLive` only on `onstart`. `aborted` / `no-speech` clear live + arming and persist. Arm delay ~400ms with retries. Watchdog unsticks arming after 2.5s.
4. Entering Talk always sets listen-wanted and starts the ear (Voice dest Travis no longer leaves Talk deaf).

## Must-not

- Do not mint tables.
- Do not make Voice dest Travis a phrase conductor.
- Do not append PM/SA logs.

## Verify

1. Talk or Voice dest Engineer: speak a long line, pause 1s → draft still there; keep talking → it appends. I’m done still sends.
2. Same dest Travis Talk.
3. Talk while speaking → View voice → draft grows, ear still live. Clear / pause / Talk again **without refresh**.
4. Dest Travis Voice → Talk: ear works without refresh. Dest Travis Voice: still Live, no I’m done.
