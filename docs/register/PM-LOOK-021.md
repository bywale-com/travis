# PM look — 021 Circuit breaker

**Packet:** PM-PACKET-021  
**Change packet:** SYSTEMS-CHANGE-PACKET-036  
**PR:** https://github.com/bywale-com/travis/pull/181  
**Preview:** none (desk is GitHub Actions + Vercel preview gate — no phone glass; Vercel check **Canceled by Ignored Build Step** while `wake-pm-look` is on — correct opt-in hold)  
**Verdict:** Pass

## Look

**Lock** ([`PM-PACKET-021-CIRCUIT-BREAKER.md`](./PM-PACKET-021-CIRCUIT-BREAKER.md) + [`SYSTEMS-CHANGE-PACKET-036-CIRCUIT-BREAKER.md`](./SYSTEMS-CHANGE-PACKET-036-CIRCUIT-BREAKER.md)):

- Full-audit walks: `npm run test:runtime` runs all specs to completion; no fail-fast; full tape to log; red check + idle-PR `fail-look`.
- Dumb runner: no bash regex classifying import vs hard limit; all handoff/hold labels skip fresh `fail-look`.
- Engineer triage Bucket A (plant) vs Bucket B (founder ops).
- Circuit breaker: Bucket B → `BLOCKER-NNN-*.md`, push without green-light subject; label `blocker`, strip seats, Resend mail; no `[skip ci]`.
- Preview opt-in: first line exactly `Preview [vercel build]`; production always builds; green-light only from Action when labels clear.

**Plant** (Engineer handoff — 036 on #181):

**Preview gate** — `vercel.json` hangs `vercel-ignore.sh`; preview skips unless first line is exactly `Preview [vercel build]`; production always builds:

```14:21:.github/scripts/vercel-ignore.sh
msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
first=$(printf '%s\n' "$msg" | awk 'NR==1 { sub(/\r$/, ""); print; exit }')
if [ "$first" = "Preview [vercel build]" ]; then
  echo "vercel-ignore: build (green light)"
  exit 1
fi
```

**Green light after clear** — `preview-when-clear.sh` waits on `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `blocker`:

```14:18:.github/scripts/preview-when-clear.sh
for hold in wake-sa wake-engineer wake-pm-look fail-look blocker; do
  if echo "$labels" | grep -qx "$hold"; then
    echo "Handoff/hold '$hold' still on #$pr. No green light."
    exit 0
  fi
done
```

**Dumb sensor** — `runtime-doors.yml` tees full tape, skips fresh `fail-look` during handoff/hold; no failure-classification grep:

```51:51:.github/workflows/runtime-doors.yml
          npm run test:runtime 2>&1 | tee "$RUNNER_TEMP/walks.txt"
```

```96:100:.github/workflows/runtime-doors.yml
          for hold in wake-sa wake-engineer wake-pm-look fail-look blocker; do
            if echo "$pr_labels" | grep -qx "$hold"; then
              echo "PR #$pr has $hold (handoff/hold). No fail-look."
              exit 0
            fi
          done
```

**Blocker hold + release** — `wake-packet-seats.yml`: blocker push labels `blocker`, strips seats, calls `send-blocker-letter.py`; `blocker-release` on `unlabeled blocker` runs `preview-when-clear.sh`. No deploy hook. No bot removal of `blocker`.

**Blocker mailer planted** — `.github/scripts/send-blocker-letter.py` parses Cause/Pocket, shapes `[BLOCKER] … blocked — …`, Resend POST with emerge secrets, exit 0 when secrets missing.

**Lib proof** — `src/lib/circuit-breaker.test.ts`: 10/10 green (ignore script, preview-when-clear labels, wake workflow shape, runtime-doors handoff skip, Engineer prompt law, mailer exists + subject dry-run).

**Engineer prompt** — Bucket A/B triage, no green-light subject on seat commits, no `[skip ci]` hold.

**Cumulative walks** — `package.json` `"test:runtime": "tsx --test --test-concurrency=1 src/runtime/walks/*.spec.ts"` (no `--test-bail`); five specs on branch.

**Handoff sync** — `src/lib/handoff-seat.test.ts` matches Current: **This bind is done** / `bc-7c4413e3-0e0a-4028-b018-a6fe9970e754`.

**Opened / queried:** PR checks on #181 — Vercel preview **Canceled by Ignored Build Step** (expected while handoff label on). Did not open production psi. No `DATABASE_URL` — no SQL row (none specified).

**Look angle:** Plant matches the 036 lock. Hotfix 088 bash-regex skip path is gone from `runtime-doors.yml`.

## Test

**Sheet:** [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md)

### 1. Full-Audit Walks (No Fail-Fast)

**I saw (static):** `test:runtime` uses `--test-concurrency=1` without `--test-bail`. Five walk specs exist (`come-back`, `type-dest`, `type-send`, `type-walk-back`, `voice-wrap`). `runtime-doors.yml` pipes full output to `$RUNNER_TEMP/walks.txt`. Could not run live walk suite against a preview deploy URL in this bind (no green-light deploy; preview canceled by ignore step).

### 2. Engineer Triage & Circuit Breaker Hold

**I saw (static):** Engineer prompt documents Bucket A/B and forbids green-light subject. Blocker push path in `wake-packet-seats.yml` labels `blocker`, strips seat wakes, invokes `send-blocker-letter.py`. Mailer dry-run in `circuit-breaker.test.ts` shapes subject correctly. Could not simulate a live `fail-look` tape with mixed code + platform failures, verify Vercel skip on non-green-light push, or confirm Resend delivery.

### 3. Circuit Breaker Release (Option A)

**I saw (static):** `blocker-release` job triggers on `unlabeled` `blocker` and calls `preview-when-clear.sh`. Could not remove a `blocker` label on a live PR or observe green-light empty commit + subsequent walk green.

### Lib verify

- `npx tsx --test src/lib/circuit-breaker.test.ts` — **10/10 pass**.
- `npm test` (full lib suite) — **482/482 pass** (handoff-seat test synced with Current handoff).

**Steps I could not do (human):**

- Founder remove `blocker` label after ops fix and watch green-light commit land.
- Confirm blocker email in founder inbox via Resend.
- Live cumulative walk on preview after merge to `main` (`repository_dispatch` runs workflow from main).
- Talk on a phone.

## Loop

**Pass — emerged.** Circuit breaker chain matches 036 lock; lib proof green; full `npm test` green after handoff-seat recut. Human may walk the same sheet on merge + preview deploy. Same PR. No cousin.
