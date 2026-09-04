# Hotfix 067 — House labor is not the Next build

**Number:** `067` — next engineer hotfix is `068`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (Vercel on `main` failed after 065/066).  
**When:** 2026-09-04  
**PR title shape:** `Hotfix 067 — house labor is not the Next build`

---

## Why

`next build` type-checks every `**/*.ts`. The house refile script `docs/register/house-now/file-house.ts` is labor, not the app. Its `.ts` import blew the production compile. 065 and 066 both failed Vercel the same way.

## Cut

- Exclude `docs` from `tsconfig.json`.
- Import `os-house` without a `.ts` suffix so `tsx` still files.

## Must-not

- Do not remint 012 / 015 house law.
- Do not auto-seed from migrate.
- Do not append PM or SA logs.

## Verify

`npx tsc --noEmit` does not see `file-house.ts`. `npm test`. Vercel on this PR / `main` compiles.
