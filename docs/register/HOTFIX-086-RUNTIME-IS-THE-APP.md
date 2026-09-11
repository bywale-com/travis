# Hotfix 086 — Runtime verification is the app

**Number:** `086` — next engineer hotfix is `087`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer.  
**When:** 2026-09-11  
**PR title shape:** `Hotfix 086 — Runtime verification is the app`  
**Test:** [`HOTFIX-086-RUNTIME-IS-THE-APP-TEST.md`](./HOTFIX-086-RUNTIME-IS-THE-APP-TEST.md)

---

## Why

Lived on psi: Type dest Travis, “what was the last thing of substance we discussed in this chat?”, then “travis” twice. Glass: `?? · run error`. `runtime-doors` on that same `main` tip was green.

The walks cancelled the SSE after headers and asserted the user line only. A generate miss still passed. One cookie resumes one room, but the suite ran in parallel. `insertStatusTurn` wrote no `seatKey`, so the glass said `??`. The status text (the miss) was discarded.

First plant still treated named unwired as a pass and stacked Travis wrap on dest, so dest failed before the leave was scored and think-walks could go green without a mouth. Recut: think-walks require a post (unwired is red); dest scores the leave; fail dumps the tape.

Runtime verification exists so that screen never reaches the phone. If a use is the app, the walk **is** that use.

## Cut

1. `src/runtime/README.md` + `src/runtime/walks/README.md` — inventory: every seeded use, pass, fail; Playwright glass named as the SA 036 hole.
2. `src/runtime/app-worked.ts` — think-walks fail `/error/i`, fail named unwired, require a speakable Travis post. Dest walk is leave-started. Fail dumps tape + SSE.
3. `doors.ts` — `send` / `finalize` consume SSE until `done` or `error`. Do not cancel after headers.
4. `desk.ts` — `readTurns` keeps `kind` / `seatKey` / `speakable`. `openFreshRoom` = End + open so walks do not share a tape. Suite `--test-concurrency=1`.
5. Walks recut to wait for the completion signal. Seed `type-walk-back.spec.ts` (two Travis posts). Dest scores the leave, not Travis wrap.
6. `insertStatusTurn` stamps `seatKey`. Glass paints the miss text, not a mute `run error`.
7. Type send / finalize dest throw writes a Log-visible status (`Dest error: …`). Do not leave that miss on SSE only.

Do not remint dest assemble, stream-intent, Deep Agents `/node`, or 035. Do not plant Playwright until SA 036 ascribes the browser secrets. Recut `runtime-doors` on preview was 0/5: think-walks named unwired (`OPENAI_API_KEY` missing on that URL); dest named Cursor hard-limit throw, no leave. Do not thin the walks.
