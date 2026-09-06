# Hotfix 078 — Open desk typecheck so psi can deploy

**Number:** `078` — next engineer hotfix is `079`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. 077 production deploy failed.  
**When:** 2026-09-06  
**PR title shape:** `Hotfix 078 — open desk build`  
**Test:** [`HOTFIX-078-OPEN-DESK-BUILD-TEST.md`](./HOTFIX-078-OPEN-DESK-BUILD-TEST.md)

---

## Why

077 `isOpenDesk(env = process.env)` failed `next build`: `ProcessEnv` has no properties in common with `{ TRAVIS_OPEN_DESK?; VERCEL_ENV? }`. psi stayed on the login door.

## Cut

Read `process.env.TRAVIS_OPEN_DESK` and `process.env.VERCEL_ENV` into a local object. Do not pass `process.env` as that typed default. Grain unchanged.

## Must-not

- Do not remint 053 / 077 law.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

## Verify

`npx next build` passes. psi no cookie → Mode / rooms, not the login door.
