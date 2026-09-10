# Hotfix 085 — Test sheet

**Hotfix:** [`HOTFIX-085-TYPE-DEST-RECUT.md`](./HOTFIX-085-TYPE-DEST-RECUT.md)  
**When:** 2026-09-10  
**PR title shape:** `Hotfix 085 — Recut type-dest: SSE before dest resolve, write-and-leave chips`

## Smoke

1. `npm test` passes all unit tests.
2. In `runtime-doors.yml` workflow run against Vercel deployment preview:
   - `come-back.spec.ts` passes.
   - `type-dest.spec.ts` passes (tested at ~5.3s).
   - `type-send.spec.ts` passes.
   - `voice-wrap.spec.ts` passes.
