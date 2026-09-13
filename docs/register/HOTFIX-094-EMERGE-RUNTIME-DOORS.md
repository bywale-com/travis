# Hotfix 094 — Wire emerge packet and label to runtime-doors pass

**Number:** `094` — next engineer hotfix is `095`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 094 — Wire emerge packet and label to runtime-doors pass`  
**Test:** [`HOTFIX-094-EMERGE-RUNTIME-DOORS-TEST.md`](./HOTFIX-094-EMERGE-RUNTIME-DOORS-TEST.md)

## Why

In Travis, the "emerge packet" is the house notification mechanism that signals to the human operator that all automated runtime checks and doors painted green and the branch is ready for human smoke testing.

Previously, the emerge labeling and email logic lived inside `.github/workflows/wake-packet-seats.yml` and was keyed off `docs/register/PM-LOOK-*.md` with `**Verdict:** Pass`. But in Hotfix 090, `wake-pm-look` was decommissioned, so that trigger could never fire. Meanwhile, the actual gate for green deployments—`.github/workflows/runtime-doors.yml` running on Vercel deployment ready—only cleared the `previewing` label on success, with zero emerge notification.

## Cut

1. **Move emerge packet delivery to `runtime-doors.yml` on `if: success()`:**
   - Detects open PR from `DEPLOY_SHA`.
   - Resolves whether it is a hotfix or packet PR and locates the test sheet (`HOTFIX-NNN-*-TEST.md` or `PM-PACKET-NNN-*-TEST.md`).
   - Labels the PR with `emerge`.
   - Creates a GitHub Issue with the sheet content if not already opened.
   - If `EMERGE_EMAIL`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` secrets are configured, sends the email letter with the test sheet attachment via `python3 .github/scripts/send-emerge-letter.py`.
2. **Clean up `wake-packet-seats.yml`:**
   - Removed dead `PM-LOOK` verdict loops and unused emerge email secrets.
3. **Update documentation & test suite:**
   - Updated `PR-AUTOMATION-RULES.md` and circuit-breaker / one-pr unit tests.
