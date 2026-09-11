# Hotfix 088 — Do not fail-look founder ops

**Number:** `088` — next engineer hotfix is `089`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-11  
**PR title shape:** `Hotfix 088 — Do not fail-look founder ops`  
**Test:** [`HOTFIX-088-FAIL-LOOK-OPS-SKIP-TEST.md`](./HOTFIX-088-FAIL-LOOK-OPS-SKIP-TEST.md)

## Why

Red `runtime-doors` fresh-adds `fail-look`. Dest Cursor hard limit and unwired are founder ops. Engineer cannot recut them. The loop kept booting B.

## Cut

1. `runtime-doors.yml` tees the walk log. If the miss is unwired or Cursor hard limit and not a Travis generate miss, do not add `fail-look`.
2. B prompt: that miss → stop. Do not push.

Human re-pastes B. The Action skip is live on merge (`repository_dispatch` uses `main`).
