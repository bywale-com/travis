# Hotfix 090 — No PM Look wake; Engineer owns lib verify

**Number:** `090` — next engineer hotfix is `091`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-11  
**PR title shape:** `Hotfix 090 — No PM Look wake; Engineer owns lib verify`  
**Test:** [`HOTFIX-090-NO-PM-LOOK-TEST.md`](./HOTFIX-090-NO-PM-LOOK-TEST.md)

## Why

PM Look was a second `npm test` with no extra context. Runtime verify already lives on Vercel after the green-light commit. Look kept failing `handoff-seat.test.ts` because Engineer rewrote `ENGINEER-HANDOFF.md` after testing, then fail-look recut the test. Founder turns off the PM automation. The cheap gate must stop adding `wake-pm-look`.

## Cut

1. `wake-packet-seats.yml` — on plant finished (src/ or handoff on a packet/hotfix PR), strip seat labels. Do **not** add `wake-pm-look`. `preview-when-clear` may then empty-commit the green-light subject.
2. Engineer prompt — rewrite `ENGINEER-HANDOFF.md`, then `npm test`. If `handoff-seat.test.ts` fails, restore the locked sentences in the handoff file. Do not edit that test to match a rewrite. `fail-look` is `runtime-doors` only.
3. `AUTOMATION-PACKET-CHAIN.md` — chain is SA → Engineer → green light → Vercel. No Look seat.
4. Preview ignore stays exact subject `Preview [vercel build]` (body mention must not build).

Human: pause/disable the PM Look Cursor automation. This repo will not add `wake-pm-look`.
