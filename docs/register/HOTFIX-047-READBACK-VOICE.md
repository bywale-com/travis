# Hotfix 047 — Less-flat Google readback

**Number:** `047` — next engineer hotfix is `048`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: Google TTS readback sounds like a low-prosody female; explore a higher-prosody / more natural option).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 047 — readback voice`

---

## What is actually speaking

Seat/facilitator readback is **browser `speechSynthesis`**. On Chrome/Android that is Google’s compact engine. Dest Travis Live is still OpenAI `cedar` (034). This cut is the Google readback path only.

Web Speech cannot take SSML `<prosody>`. Rate, pitch, and which named voice the OS lists are the only levers. Studio / Neural2 / WaveNet live on **Google Cloud TTS**, which is a new server port + key. Not minted here.

## Cut

`pickReadbackVoice` ranks English voices: named male (034) first, then Natural/Enhanced/Network in the name, then `localService === false` (the network copy — less compact, less flat). `applyReadbackVoice` always sets `rate = 1.08`. Pitch stays 1 — dropping it on the default female fakes a tired man, it does not add contour.

## Feasible / not

| Option | Feasible now | Tradeoff |
|---|---|---|
| Prefer network / Enhanced over local compact | Yes | Needs the phone to *list* a second voice. Many Androids only list one. |
| Rate 1.08 | Yes | A little quicker. Too high sounds rushed. |
| Pitch down to “sound male” | No | Worse, not more natural. |
| Google Cloud Studio + SSML | Not this cut | Needs SA ascription + `GOOGLE_TTS` server key + cost + latency. Real prosody lives there. |
| Voice picker UI | No | 034 must-not. PM pocket. |

## Must-not

- Do not mint a voice store or a Cloud TTS port.
- Do not ship a voice picker.
- Do not append PM/SA logs.

## Verify

`npm test` covers male-still-wins, network-over-local, Enhanced-over-bare, rate lift. After deploy: if the phone lists a network or Enhanced English voice, readback should use it. If it only lists `Google US English`, you will still hear that woman, a notch faster.
