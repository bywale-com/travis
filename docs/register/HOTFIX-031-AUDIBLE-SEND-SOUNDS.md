# Hotfix 031 — Hear the send swoosh and queue cue

**Number:** `031` — next engineer hotfix is `032`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: 030 planted send/queue sounds; founder does not hear them).  
**When:** 2026-09-01  
**PR title shape:** `Hotfix 031 — audible send swoosh and queue cue`

---

## Why

030 scheduled Web Audio oscillators **after** the SSE said sent/queued. That is not a tap. Phones mute it. The first cut was also a 220ms whisper — easy to miss even when it ran.

## Cut

1. Generated WAV on one `HTMLAudioElement`. Arm it on tap (Open, the room, Type Send). Keep a silent looping bed so a later SSE can still play.
2. Swoosh = louder descending chirp. Cue = two parked notes. Distinct, across Talk / Type / Voice.
3. End session releases the player.

## Must-not

- Do not mint a sound table.
- Do not append PM/SA logs.

## Verify

1. Open the room (tap). Type Send to a free seat → hear a whoosh. Type Send while Engineer is working → hear two notes.
2. Talk / Voice I’m done, same pair.
3. Dest Travis send → whoosh, never the two notes.
4. Phone silent-switch off; ringer volume up.
