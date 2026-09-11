# Hotfix 082 — Runtime doors Action permissions and handoff test

**Number:** `082` — next engineer hotfix is `083`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Lived CI run 34536189023 hit `Resource not accessible by integration` on painting the Vercel check, and `handoff-seat.test.ts` expects the handoff chain.  
**When:** 2026-09-10  
**PR title shape:** `Hotfix 082 — Runtime doors Action permissions and handoff test`  
**Test:** [`HOTFIX-082-RUNTIME-DOORS-PERMISSIONS-TEST.md`](./HOTFIX-082-RUNTIME-DOORS-PERMISSIONS-TEST.md)

---

## Why

In run `34536189023`, `vercel/repository-dispatch/actions/status@v1` in `.github/workflows/runtime-doors.yml` failed with `##[error]Resource not accessible by integration - https://docs.github.com/rest/actions/workflow-jobs#list-jobs-for-a-workflow-run` because the job permissions lacked `actions: read`. Additionally, `src/lib/handoff-seat.test.ts` verifies that `docs/register/ENGINEER-HANDOFF.md` preserves the preceding engineer bind history.

## Cut

1. Add `actions: read` to `permissions` in `.github/workflows/runtime-doors.yml`.
2. Update `docs/register/ENGINEER-HANDOFF.md` so the bind chain retains prior history for `handoff-seat.test.ts`.

## Must-not

- Do not disable the `runtime-doors` check.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

## Verify

`npm test` passes `src/lib/handoff-seat.test.ts`. GitHub Action runs cleanly.
