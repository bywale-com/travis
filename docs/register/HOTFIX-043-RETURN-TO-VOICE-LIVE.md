# Hotfix 043 — Coming back to Voice re-arms Live

## The smoke

Fresh session, Voice, say “Travis”. Live comes up, OpenAI voice, no conductor.
Switch to Talk or Type, switch back to Voice — and Live never returns. Saying
“Travis” again does nothing, because dest is already Travis.

## Why

036 removed a circular read from `armEar` and left the same read in place one
function over:

```ts
export function sameRoomEar(from: EarState, to: EarState): boolean {
  const a = whichEar(from);
  const b = whichEar(to);
  return a === b && a === "stt";
}
```

`whichEar` reports **the ear you have**, and it only returns `"live"` when Live
is already connected. Coming back from Talk with dest Travis and Live down, it
called the from-state `"stt"` and the to-state `"stt"` as well. Same ear, and
the recognizer was live from Talk, so `modeSwitchEarAction` returned `"keep"`.
`switchViewMode` then returns early and never calls `armEar`, so nothing ever
tries to connect. Live could not come up because Live was not up.

That is exactly why a fresh session works and a return trip does not: the fresh
path routes through the vocative handler into `armEar`, which 036 fixed. The
return path routes through `modeSwitchEarAction`, which it did not.

## The cut

`sameRoomEar` and the release check now use `wantedEar` — the ear each state
*wants*, independent of what is currently connected.

- dest Travis, Talk → Voice: wants `stt` then `live`. Different, so **arm**.
- dest Engineer, Talk ↔ Voice: wants `stt` both sides. Same, so **keep** — 023
  survives and Chrome is not made to hand back a recognizer it will not.
- dest Travis → Type: wants `none`, so **release**.

## Verify

- `npm test` — 171 pass, five new in `ear.test.ts`: the return trip arms, the
  outbound trip arms, Type still releases, dest Engineer still keeps its one
  recognizer in both directions, and Voice + dest Travis never reads as an STT
  room.
- On the phone: fresh session, Voice, say “Travis”. Switch to Talk, switch back
  to Voice. Live should come back on its own — fast answers, no “I’m done”.
