# PM look — 021 circuit breaker

**Packet:** PM-PACKET-021
**Change packet:** SYSTEMS-CHANGE-PACKET-036
**PR:** https://github.com/bywale-com/travis/pull/180
**Preview:** none (no glass — GitHub Actions + Vercel preview gate + register markdown)
**Verdict:** Fail

## Look

**Lock (PM-021 / SCP-036).** Dumb runner, intelligent seat. Preview is opt-in: `[vercel build]` on this commit’s message only; production always builds. Handoff/hold labels (`wake-sa` · `wake-engineer` · `wake-pm-look` · `fail-look` · `blocker`) block preview green-light and block fresh `fail-look` during triage. Full-audit walks: `npm run test:runtime` runs all specs sequentially; tee full tape; no bash log classification in Actions. Engineer triages Bucket A (plant) vs Bucket B (founder ops). Bucket B → `BLOCKER-NNN-*.md`, commit without green-light tag, Action labels `blocker`, strips seat wakes, mails via Resend. Founder removes `blocker` → `blocker-release` → empty-commit green light when clear. No blocker Postgres table. Do not use `[skip ci]` on seat commits. FACE: no new plates.

**Plant (`62389d50`, this PR).** Engineer handoff names **036 circuit breaker on #180**. The 021 infrastructure cut is planted and quotes clean against the lock.

Law 0 — preview gate:

```1:4:vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "sh .github/scripts/vercel-ignore.sh"
}
```

```8:19:.github/scripts/vercel-ignore.sh
set -u
if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "vercel-ignore: build (production)"
  exit 1
fi
msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
if echo "$msg" | grep -q '\[vercel build\]'; then
  echo "vercel-ignore: build (green light)"
  exit 1
fi
echo "vercel-ignore: skip (no [vercel build] on this commit)"
exit 0
```

Law 0 — green light after handoffs:

```14:29:.github/scripts/preview-when-clear.sh
for hold in wake-sa wake-engineer wake-pm-look fail-look blocker; do
  if echo "$labels" | grep -qx "$hold"; then
    echo "Handoff/hold '$hold' still on #$pr. No green light."
    exit 0
  fi
done
...
git commit --allow-empty -m "Preview [vercel build]"
```

Law 1 — full-audit sensor (no fail-fast in workflow; tee tape):

```42:51:.github/workflows/runtime-doors.yml
      - name: Sequential walks on this URL
        id: walks
        ...
          npm run test:runtime 2>&1 | tee "$RUNNER_TEMP/walks.txt"
```

Law 1 — no bash classification. Confirmed: `runtime-doors.yml` has no greps for `Cannot use import`, `hard limit`, or `isn.t wired`. Red → fresh-add `fail-look` only when PR has none of the five handoff/hold labels (lines 96–100).

Law 2 — Engineer triage prompt:

```26:30:docs/register/house-now/automations/sa-complete-engineer.prompt.md
- **Bucket A (plant / code):** fix in `src/`. Verify with `npm test`.
- **Bucket B (founder ops):** ... file `docs/register/BLOCKER-NNN-*.md` ...
- If **any Bucket B:** commit code fixes + blocker **without** the preview green-light tag.
```

Law 3 — blocker hold + mail (was missing at SA sign; now planted):

```125:154:.github/workflows/wake-packet-seats.yml
          # Blocker hold: this push lands BLOCKER-NNN-*.md (not *-RESOLVED).
          ...
              python3 .github/scripts/send-blocker-letter.py "$blocker_file"
```

`.github/scripts/send-blocker-letter.py` parses Cause / Required action / Resolve at / Tape excerpt; subject `[BLOCKER] …`; Resend to `EMERGE_EMAIL`. `AUTOMATION-PACKET-CHAIN.md` § Blocker updated to **planted**.

Contract tests — `src/lib/circuit-breaker.test.ts`: **10/10 pass** on this bind (ignore script, preview-when-clear label list, runtime-doors handoff skip, Engineer prompt law, blocker mailer wiring).

**Miss.** Engineer handoff claims `npm test` passes. Full suite on this bind: **481 pass / 1 fail**. `src/lib/handoff-seat.test.ts` — “Engineer Current names where the last bind stopped” — fails because `ENGINEER-HANDOFF.md` was rewritten for 021 without preserving the strings that test asserts (`This bind is done`, bind id `bc-26131d8d…`, numbered pocket trail, `You are a NEW bind`, etc.). Same test **passes on `main`**. This PR broke it. Bucket A plant miss; contradicts the handoff verify line.

**Glass.** SCP-036 names no new plates. I did not open production psi. No preview glass to judge for this cut.

## Test

Walked from [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md).

### 1. Full-Audit Walks (No Fail-Fast)
**I saw:** `package.json` runs `tsx --test --test-concurrency=1 src/runtime/walks/*.spec.ts`. `runtime-doors.yml` tees full output to `$RUNNER_TEMP/walks.txt` with no workflow fail-fast. I did not simulate an early walk fail against a live deploy URL from this seat (no `RUNTIME_BASE_URL` / operator cookie here). Plant shape matches expect.

### 2. Engineer Triage & Circuit Breaker Hold
**I saw:** Blocker workflow path, mailer script, and Engineer prompt match the sheet’s expect list on disk. I did not receive a live `fail-look` tape, file a `BLOCKER-021-*.md`, or observe Resend mail delivery from this seat.

### 3. Circuit Breaker Release (Option A)
**I saw:** `blocker-release` job and `preview-when-clear.sh` are wired in `wake-packet-seats.yml`. I did not remove a `blocker` label, trigger a green-light empty commit, or confirm walks green on an unblocked preview from this seat.

**Automated verify on this bind:**
- `npx tsx --test src/lib/circuit-breaker.test.ts` — 10/10 pass.
- `npm test` — 481/482 pass; **1 fail** (`handoff-seat.test.ts` as above).

**Steps I could not do (human):** Simulate a live walk tape with mixed Bucket A + B failures. Engineer triage on a real red `runtime-doors` deploy. Founder ops (Cursor spend, Vercel secrets). Remove `blocker` and confirm preview rebuild + green check. Talk on a phone. Those are the human’s. I do not fail the look for Talk or for §2–§3 live CI — but I **do** fail for the `npm test` miss the Engineer claimed was green.

## Loop

**Fail.** Engineer must recut on **same PR #180**:
1. Fix `src/lib/handoff-seat.test.ts` and/or `docs/register/ENGINEER-HANDOFF.md` so `npm test` is fully green again (update the test to the new living-handoff shape, or restore required pickup strings while keeping 021 Current).
2. Re-run `npm test` before pushing; do not claim pass while `handoff-seat` is red.

No cousin PR. No `[vercel build]` on the recut commit.
