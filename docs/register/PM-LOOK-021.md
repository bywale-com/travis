# PM look — 021 Circuit breaker

**Packet:** PM-PACKET-021
**Change packet:** SYSTEMS-CHANGE-PACKET-036
**PR:** https://github.com/bywale-com/travis/pull/179
**Preview:** none (CI / register — no glass)
**Verdict:** Fail

## Look

**Lock (PM-021 / SCP-036).** Full-audit walks — cumulative suite runs every spec to completion; no fail-fast; full tape teed. GitHub Actions is a dumb sensor: red walk fresh-adds `fail-look`; no bash regex triage. Engineer triages tape into Bucket A (plant/code in `src/`) vs Bucket B (founder ops). Bucket B → `BLOCKER-NNN-*.md` + skip-token push + stop; Action labels `blocker`, strips seat wakes, mails founder; founder removes `blocker` → deploy hook redeploy. No Travis table. FACE: none.

**Plant (Engineer handoff — SCP-036 on #179, commit `1e6f558`).** CI + register only; no `src/` product change.

**1. runtime-doors.yml — label-only blocker skip; no regex triage**

```58:98:.github/workflows/runtime-doors.yml
      - name: Fresh-add fail-look on the open PR
        if: failure()
        ...
          pr_labels=$(gh pr view "$pr" --json labels --jq '.labels[].name')
          if echo "$pr_labels" | grep -q '^blocker$'; then
            echo "PR #$pr has blocker active. No fail-look."
            exit 0
          fi
```

File-only `BLOCKER-*.md` skip removed (Hotfix 088 path dead). Walk step still tees full tape (`npm run test:runtime 2>&1 | tee`). No `grep -qE` failure classification.

**2. wake-packet-seats.yml — hold + release**

```106:133:.github/workflows/wake-packet-seats.yml
          # Blocker hold: this push lands BLOCKER-NNN-*.md (not *-RESOLVED).
          ...
            gh pr edit "$pr" --remove-label fail-look || true
            gh pr edit "$pr" --remove-label wake-engineer || true
            gh pr edit "$pr" --remove-label wake-pm-look || true
            ...
            python3 .github/scripts/send-blocker-letter.py "$blocker_file"
```

```280:296:.github/workflows/wake-packet-seats.yml
  blocker-release:
    if: github.event_name == 'pull_request' && github.event.action == 'unlabeled' && github.event.label.name == 'blocker'
    ...
          curl -fsS -X POST "$VERCEL_DEPLOY_HOOK_URL"
```

Path `docs/register/BLOCKER-*.md` added to push filter.

**3. send-blocker-letter.py** — Resend port; subject `[BLOCKER] {Cause}` from `**Cause:**` line.

**4. sa-complete-engineer.prompt.md** — fail-look path: Bucket A in `src/`; Bucket B → `BLOCKER-NNN-*.md` + `[vercel skip]` push; old “stop without commit” path removed.

**5. Full-audit law documented**

```3:3:src/runtime/walks/README.md
Seeded files run on every deploy (`npm run test:runtime`). **Full-audit law:** every spec in this folder runs to completion; do not add `--test-bail`.
```

`package.json` script has no `--test-bail`. Five walk specs on branch: `come-back`, `type-dest`, `type-send`, `type-walk-back`, `voice-wrap`.

**Verify floor miss.** SCP-036 §8: `npm test` still passes. On this branch: **471 pass / 1 fail** — `src/lib/handoff-seat.test.ts` “Engineer Current names where the last bind stopped”. `ENGINEER-HANDOFF.md` rewrite dropped prose the lib test locks (`bc-26131d8d-741b-4566-89b3-df312e8e48e1`, `034 what exists`, `033 lived redesign`, `032 compose the send harness`, `031 dest harness recut`, `081 Voice uses the Type hang`, `079 Talk HTML as JSON`, `029 The room stays live`, `026 Serve`, `Hotfix 062`, `next hotfix number`). Main is 472/472.

**Opened / queried:** No preview (no glass). Ran `npm test` and `npm run test:runtime` locally (no `RUNTIME_BASE_URL` — five suites listed, all skipped).

## Test

**Step 1 — Full-audit walks (partial).**
- Confirmed `test:runtime` uses `--test-concurrency=1` and no `--test-bail`.
- Confirmed five spec files; local run executed all five suites (skipped without URL — no early bail).
- Confirmed `runtime-doors.yml` tees full tape and paints check on failure.
- **I could not:** inject an early failing walk on a live preview deploy and confirm later specs still execute in CI tape (needs red deploy + log read on this PR).

**Step 2 — Engineer triage & circuit breaker hold.**
- **I could not:** simulate `fail-look` → Engineer Bucket B path → `[vercel skip]` push → `blocker` label → Resend mail (needs live `WAKE_GITHUB_TOKEN`, Resend secrets, and a real platform blocker on tape).

**Step 3 — Circuit breaker release.**
- **I could not:** founder clears ops, removes `blocker` label, deploy hook fires, walks green (founder hands + `VERCEL_DEPLOY_HOOK_URL`).

## Loop

**Fail.** Engineer recuts on same PR [#179](https://github.com/bywale-com/travis/pull/179): restore `ENGINEER-HANDOFF.md` grain so `handoff-seat.test.ts` passes (472/472) — the lib test is the verify floor for handoff rewrites. Circuit breaker CI files look planted; do not remint the six SCP paste items unless a gap appears after test is green. No cousin PR.
