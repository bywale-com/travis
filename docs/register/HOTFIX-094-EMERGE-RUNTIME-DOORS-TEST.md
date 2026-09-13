# Hotfix 094 — Test sheet

**Hotfix:** [`HOTFIX-094-EMERGE-RUNTIME-DOORS.md`](./HOTFIX-094-EMERGE-RUNTIME-DOORS.md)  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 094 — Wire emerge packet and label to runtime-doors pass`

## Smoke

1. `npm test` passes — asserts `circuit-breaker.test.ts` and `one-pr.test.ts` have updated hotfix index, next number `095`, and assert `runtime-doors.yml` contains emerge steps.
2. In GitHub Actions, when `runtime-doors` succeeds on a Vercel preview deployment:
   - PR is labeled `emerge`.
   - GitHub Issue for the test sheet is opened.
   - If Resend secrets and emerge email are configured, emerge email is delivered to founder.
3. If `runtime-doors` fails, it does NOT trigger emerge; it adds `fail-look` to re-wake the Engineer.
4. I saw: ________
