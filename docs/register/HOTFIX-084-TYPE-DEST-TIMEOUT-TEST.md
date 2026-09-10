# Hotfix 084 — Test sheet

**Hotfix:** [`HOTFIX-084-TYPE-DEST-TIMEOUT.md`](./HOTFIX-084-TYPE-DEST-TIMEOUT.md)  
**When:** 2026-09-10  
**PR title shape:** `Hotfix 084 — Role dest resolution and handProtocol timeout on runtime walks`

## Smoke

1. `npm test` passes all unit tests.
2. In `runtime-doors.yml` workflow run against Vercel deployment preview:
   - `come-back.spec.ts` passes.
   - `type-send.spec.ts` passes.
   - `voice-wrap.spec.ts` passes.
   - `type-dest.spec.ts` passes and does not 504 timeout.
