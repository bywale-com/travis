# Hotfix 082 — Test sheet

**Hotfix:** [`HOTFIX-082-RUNTIME-DOORS-PERMISSIONS.md`](./HOTFIX-082-RUNTIME-DOORS-PERMISSIONS.md)  
**When:** 2026-09-10  
**PR title shape:** `Hotfix 082 — Runtime doors Action permissions and handoff test`

## Smoke

1. Run `npm test` locally. Confirm `src/lib/handoff-seat.test.ts` passes.
2. Push branch and observe `.github/workflows/runtime-doors.yml` on repository dispatch. Check `actions: read` allows `vercel/repository-dispatch/actions/status@v1` to query workflow jobs.
