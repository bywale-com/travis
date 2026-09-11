# Hotfix 083 — Status input in Vercel status Action

**Number:** `083` — next engineer hotfix is `084`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Vercel status action `vercel/repository-dispatch/actions/status@v1` does not accept `status` input (it computes status from job results automatically).  
**When:** 2026-09-10  
**PR title shape:** `Hotfix 083 — Status input in Vercel status Action`  
**Test:** [`HOTFIX-083-RUNTIME-DOORS-ACTION-STATUS-TEST.md`](./HOTFIX-083-RUNTIME-DOORS-ACTION-STATUS-TEST.md)

---

## Why

In run `34536568638`, `vercel/repository-dispatch/actions/status@v1` flagged:
`! Unexpected input(s) 'status', valid inputs are ['name', 'github_token']`
The action automatically determines the status of the job and sets the check; passing `status: ${{ job.status }}` is invalid.

Additionally, `src/lib/handoff-seat.test.ts` required `bc-26131d8d-741b-4566-89b3-df312e8e48e1` in the Paste block of `ENGINEER-HANDOFF.md`.

## Cut

1. Remove invalid `status` input from `vercel/repository-dispatch/actions/status@v1` step in `.github/workflows/runtime-doors.yml`.
2. Ensure `bc-26131d8d-741b-4566-89b3-df312e8e48e1` is referenced in `docs/register/ENGINEER-HANDOFF.md` paste section.

## Verify

`npm test` passes.
