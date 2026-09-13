# Hotfix 092 — One token: `previewing` mutex

**Number:** `092` — next engineer hotfix is `093`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 092 — One token: previewing mutex`  
**Test:** [`HOTFIX-092-PREVIEWING-MUTEX-TEST.md`](./HOTFIX-092-PREVIEWING-MUTEX-TEST.md)

## Why

Lived on [#183](https://github.com/bywale-com/travis/pull/183): Preview 4’s doors were still running when Preview 5 green-lit. Seat labels were doing three jobs (wake a Cloud Agent, block a preview, block the next fail-look). Action **stripped** them so Vercel could build, the PR looked idle, a second fail-look Engineer pushed, and Action treated that push as another green-light.

A recut that edited `HOTFIX-091-*.md` re-added `wake-engineer` for two seconds and booted a third agent. The fail-look prompt told the first Engineer to stay and recut on later GitHub events after the label came off.

## Cut

1. New lock **`previewing`**. Action sets it in the same job that pushes `Preview [vercel build]`. `runtime-doors` clears it when it paints that SHA (green or red).
2. `preview-when-clear` fires only if seats are off **and** `previewing` is off. HEAD already a Preview commit → stop. Job concurrency per branch so two green-lights cannot run at once.
3. `add_seat` is a no-op while `previewing` is on. No `fail-look`, no `wake-engineer`, no `wake-sa`.
4. Hotfix file wakes Engineer only when that `HOTFIX-NNN-*.md` is **added** in this push (`--diff-filter=A`), not when a recut edits it. Title still must start with `Hotfix`.
5. `runtime-doors` clears `previewing` first. Red → `fail-look` only if no seat, no `blocker`, and no `previewing`.
6. Engineer prompt: recut once, push, stop. Do not watch CI. Do not stay and recut because synchronize / Vercel events arrived. If `previewing` is on: stop. Do not push.

A PR is in exactly one of: `IDLE` → `SEAT` → `PREVIEWING` → `SEAT` / `IDLE` / `BLOCKER`.

Do not remint dest assemble, stream-intent, Deep Agents `/node`, or 035. Do not recut #180 / #181 / #183 in this cut.

## Human leftover

Automations stay **off** until this is on `main`. Then re-paste [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md) and turn B back on to live-watch the loop. Action creates the `previewing` label; no dashboard click required.
