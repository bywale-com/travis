# Hotfix 036 — Saying “Travis” in Voice actually arms Live

## The smoke

New session. Voice mode. Said “Travis” — the dest chip flipped to Travis. Then
talked, and it did **not** send on its own. Had to say “I’m done,” and the reply
came back in the Google voice.

## Not the cause

Saying “I’m done” did not cause the Google voice. It is the other way around:
the ear was already Web Speech, which is *why* “I’m done” was required at all.
Live never came up.

## Why Live never came up

Two guards, both wrong, in the vocative-switch path.

**1. `armEar` read a stale dest.**

`sessionRef.current` is assigned during render (`sessionRef.current = session`).
The vocative handler called `setSession(...)` and then `armEarRef.current()`
on the same tick, before React re-rendered. So `armEar` read the *old*
`activeSeatKey` and computed `destTravis === false` — while the chip, which
reads state, already said Travis. Dest and ear disagreed.

With `destTravis` false, `armEar` skipped its `voice && destTravis` branch
entirely and fell through to `startRecognition()`.

**2. The “already listening” guard is circular.**

Even with the dest fixed, `armEar` bailed here:

```ts
if (want === "stt" && recognitionLiveRef.current && recognitionRef.current) return;
```

`want` comes from `whichEar`, which reports **the ear you have** — and it only
returns `"live"` when `liveUp` is already true. In Voice + dest Travis with Live
down it returns `"stt"`. The recognizer was live (you had just spoken the word
“travis” into it), so `armEar` returned immediately and nothing ever tried to
connect. Live could not come up because Live was not up.

That is why the working path was `finalizeUtterance`, which calls `connectLive`
directly and never consults `armEar`.

## The cut

- `src/lib/ear.ts` — `wantedEar()` reports the ear to **arm**, independent of
  whether Live is connected. `sttAlreadySatisfies()` treats a running recognizer
  as sufficient only when STT is what we wanted; in Voice + dest Travis it is a
  fallback to be replaced.
- `Room` syncs `sessionRef.current` alongside `setSession` in the vocative
  handler, matching how `viewModeRef` is already handled in `switchViewMode`.
- `armEar` uses `sttAlreadySatisfies` instead of the circular `whichEar` check.

## Honest fallback

When Live is genuinely down, `armEar` used to fall back to Web Speech in
silence, so Voice + dest Travis looked identical whether you were on OpenAI or
Google. It now says so: **“Travis Live is down — phone ear. Say ‘I’m done’.”**
Reporting the ear is hygiene, not triage.

## Verify

- `npm test` — 140 pass, five new in `ear.test.ts` covering: Voice + dest Travis
  wants Live even with the recognizer running; dest Engineer on a live
  recognizer is satisfied; a dead recognizer never satisfies; Type wants no ear;
  dest Travis in Talk wants STT.
- On the phone: fresh session, Voice, say “Travis”. The chip flips **and** the
  ear hands over to Live — no “I’m done,” answers come back fast in the OpenAI
  voice. If Live is down you get the subtitle instead of a silent downgrade.
