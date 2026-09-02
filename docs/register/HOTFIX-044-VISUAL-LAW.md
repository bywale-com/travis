# Hotfix 044 — The plates' visual law, in code

First plant off the 13 printed plates. Tokens, wordmark, scale, unbounded seat
marks, and the two message kinds the plates drew that the app could not render.

## Mission and Carbon

`src/theme/tokens.ts` is retoned to the two characters. **Mission** — bone page,
carbon text, oxblood accent. **Carbon** — black page, bone text, orange accent.
Same `Tokens` type, same field names, so no component learns a new shape.

Four fields added because the plates need them and components must not invent
hex: `receiptText`, `selectedWash`, `seatTints`, `seatInk`.

`getTokens(isDark)` still switches; `light` and `dark` remain as aliases so
nothing had to be touched to land this.

## Geometry does not move

`src/theme/scale.ts` holds Display 32 · Title 22 · Body 16 · Meta 12 and the
4pt ladder. It takes **no mode**, which is the law expressed as a module: if a
number can differ between Mission and Carbon it does not belong here.

## Orbitron for the wordmark only

`--travis-logo` is Orbitron via `next/font`, with Eurostile Extended and
Michroma as fallbacks. It is used where the TRAVIS logo appears and nowhere
else — body copy stays on the geometric sans. The landing wordmark is now
`TRAVIS`, letterspaced, at Display 32.

## Seat marks are unbounded

`SeatMark` hardcoded three colours and a three-seat short-code table, so a
fourth agent rendered grey with a wrong label. `src/lib/seat-mark.ts` derives
both:

- `seatInitials` — `PM · SA · ENG · TRV` for the known cast, otherwise initials
  from the label. “Auth Engineer” → `AE`, “Nightly Regression Bot” → `NRB`,
  single words clipped to three, junk to `??`.
- `seatTintIndex` — a stable hash into `tokens.seatTints`, so an agent keeps its
  colour across rooms and reloads with nothing stored.
- `seatShortLabel` — the waiting chip now reads `3 waiting · Auth Eng` instead
  of coming out blank, and clips a long label rather than breaking the pill.

`SeatMark` also stopped hardcoding `#FFFCF8` for its ink and takes `t`.

## Two message kinds the plates drew

**Narration receipt.** 041 wrote narration as an ordinary Travis post, so it
looked exactly like Travis talking. `insertAgentPostTurn` now takes `speakable`,
narration is written `speakable: false`, and the thread renders those as a quiet
italic line with no bubble and no seat mark. No new column — `speakable` already
existed and already meant this.

**Run error.** Status turns were filtered out of the thread entirely, so a run
that errored left no trace on the glass. Errors now show as a centred quiet line
in `dangerQuiet`. Routine statuses stay hidden.

## Not in this plant

Room index, create a room, roster, create an agent. All four need the room ↔
agent membership relation, which the founder has specified in shape and SA has
not yet ascribed. Engineer does not mint it.

## Verify

- `npm test` — 196 pass, six new in `seat-mark.test.ts`.
- `npx tsc --noEmit` and `next lint` clean; `npm run build` compiles with the
  Orbitron fetch.
