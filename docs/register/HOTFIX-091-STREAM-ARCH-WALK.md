# Hotfix 091 — Stream architecture runtime walk

**Number:** `091` — next engineer hotfix is `092`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer.  
**When:** 2026-09-12  
**PR title shape:** `Hotfix 091 — Stream architecture runtime walk`  
**Test:** [`HOTFIX-091-STREAM-ARCH-WALK-TEST.md`](./HOTFIX-091-STREAM-ARCH-WALK-TEST.md)

## Why

035 is planted. Grain covers classify. The human sheet is A–E. The runtime suite had no walk of the packet’s job: a leave starts on the live flush, not on “I’m done.”

## Cut

1. `src/runtime/doors.ts` — `transcript` consumes dest SSE the same way `send` / `finalize` consume. A 504 is a miss, not a throw.
2. `src/runtime/walks/voice-stream-arch.spec.ts` — Voice doors, one sitting: dest-by-name on `/live/transcript`, `GET /queue` must already show a leave, **then** `/finalize` `I'm done`, Travis mouth. Do not wait for the Engineer essay. Do not grade the sentence.
3. Inventory row in `src/runtime/walks/README.md`. Suite glob already picks `*.spec.ts`.
4. Fail-look recut: live dest was still `sendOrEnqueueMany` (holds until Cursor done → Vercel 504). Same write-and-leave as Type (`dispatchToSeat`). Mouth still waits for finalize.
5. Fail-look recut: static `import from "deepagents/node"` still loaded ESM on Vercel (`Cannot use import statement outside a module`). `createRequire` hits `exports.require` → `dist/node.cjs`. Still the `/node` hang.

Do not remint `stream-intent`, dest assemble, or 035. Interrupt / change remain the human sheet.
