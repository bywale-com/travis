# 036 — Runtime verification (cumulative doors on every deploy)

**PR:** [#165](https://github.com/bywale-com/travis/pull/165) (merged).  
**PM:** [`../../PM-PACKET-020-RUNTIME-VERIFY.md`](../../PM-PACKET-020-RUNTIME-VERIFY.md)  
**Test Spec:** [`../../PM-PACKET-020-RUNTIME-VERIFY-TEST.md`](../../PM-PACKET-020-RUNTIME-VERIFY-TEST.md)

Desk (`src/runtime/desk.ts`), doors (`src/runtime/doors.ts`), and sequential E2E walks (`src/runtime/walks/*.spec.ts`) against the preview URL.
- Agenda walks: `voice-wrap.spec.ts`, `type-send.spec.ts`.
- One-time retro walks: `come-back.spec.ts`, `type-dest.spec.ts`.
- GitHub Action `.github/workflows/runtime-doors.yml` on `vercel.deployment.ready` runs `npm test` then `npm run test:runtime` and reports to Vercel as `runtime-doors`.
- `resolveOperator` in `src/server/operator.ts` supports test operator email (`test-runner@travis.internal`), creating/resolving an isolated operator scope to keep tests away from live user tape.
- In-flight Live connect waits instead of declaring Live down; unwired keeps its own line.

Planted and merged on PR #165.
