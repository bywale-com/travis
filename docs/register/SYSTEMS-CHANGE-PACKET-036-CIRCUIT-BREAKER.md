# SYSTEMS-CHANGE-PACKET-036 — Circuit breaker: full-audit walks, triage, and blocker hold

**Number:** `036` — next systems packet is **037**. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#177](https://github.com/bywale-com/travis/pull/177)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-11  
**PM packet:** [`PM-PACKET-021-CIRCUIT-BREAKER.md`](./PM-PACKET-021-CIRCUIT-BREAKER.md)  
**Test:** [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md)  
**Prior (do not remint):** **020** runtime verify (`src/runtime/desk.ts`, `doors.ts`, `walks/*.spec.ts`, `npm run test:runtime`) · **035** stream architecture (`src/lib/stream-intent.ts`, `src/server/stream-dispatch.ts`) · **023–034** dest job, checkpointer, room wire, living seats.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** GitHub Actions, PR labels, and Vercel preview.

Hotfix 088 attempted to classify errors inside bash (`runtime-doors.yml`), silently swallowing founder ops failures or causing loops. This cut replaces bash classification with dumb runner recording, Engineer triage, and a git/PR circuit breaker.

---

## 1. Intent

GitHub Actions is a dumb sensor, not a triage engine. Fragile bash regexes attempting to classify errors inside `.github/workflows/runtime-doors.yml` are removed. The cumulative walk runner (`npm run test:runtime`) executes all specs to completion (no fail-fast), recording the complete outcome tape. On any failure, `runtime-doors` marks failure and applies `fail-look` to the PR using `WAKE_GITHUB_TOKEN`. The Engineer automation wakes, reads the complete tape, and partitions all failures into **Bucket A (Code / Plant Misses)** and **Bucket B (Founder Ops / Platform Blockers)**. If Bucket B is non-empty, the Engineer fixes Bucket A code in `src/`, records the external blocker in `docs/register/BLOCKER-NNN-*.md`, and commits with `[skip ci]` (or `[skip vercel]`) so Vercel does not build into a known wall. The push triggers a cheap notification Action that adds the `blocker` label, silences automated seat loops, and emails the founder via Resend. The circuit breaker is released when the founder resolves the external issue and removes the `blocker` label from the PR, which dispatches a redeployment.

---

## 2. Story

### Must

- **Full-Audit Walks (No Fail-Fast):** `npm run test:runtime` runs all specs sequentially to completion so that the full inventory of passes and failures is captured in a single run. No early abort on first failure.
- **Dumb Runner Sensor:** `.github/workflows/runtime-doors.yml` executes `npm test` and `npm run test:runtime`. It dumps the full log to `$RUNNER_TEMP/walks.txt`. If any walk fails, it paints the `runtime-doors` deployment check as failed and adds `fail-look` to the open PR for that deployment SHA via `WAKE_GITHUB_TOKEN`. No bash regex classification.
- **Intelligent Engineer Triage:** When woken by `fail-look`, the Engineer inspects the tape and classifies every failure:
  - **Bucket A (Code / Plant Miss):** Fix in `src/` (e.g. ESM/CJS interop, import syntax, unhandled route errors, broken assertions).
  - **Bucket B (Founder Ops / Platform Blocker):** Cursor $2 hard limit, missing `OPENAI_API_KEY` on preview, unreachable database credentials.
- **Circuit Breaker Hold:** If Bucket B is non-empty:
  1. Engineer writes `docs/register/BLOCKER-NNN-*.md` detailing the exact failure, required human action, and direct URL.
  2. Engineer commits code fixes along with the blocker file using `[skip ci]` in the commit message so Vercel does not build.
  3. Engineer pushes to the PR branch and halts.
- **Blocker Action & House Mail:** `.github/workflows/wake-packet-seats.yml`:
  - On push touching `docs/register/BLOCKER-*.md`: adds `blocker` label to the PR; strips `fail-look`, `wake-engineer`, and `wake-pm-look`; executes `.github/scripts/send-blocker-letter.py` using Resend (`EMERGE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`).
- **Circuit Breaker Release (Option A):** In `.github/workflows/wake-packet-seats.yml`, an event listening on `pull_request` types `[unlabeled]` checks if the removed label was `blocker`. If removed, it triggers a redeployment or re-runs verification against the unblocked environment.
- **Automation Prompt Alignment:** `packet-sa.prompt.md`, `sa-complete-engineer.prompt.md`, and `pm-look.prompt.md` must checkout the PR head branch first (`gh pr view --json headRefName`) before running the gate check so cloud agents do not evaluate against stale checkouts.

### Must-not

- Do not mint new database tables in `travis.*`. Blocker tracking is a git and PR contract (`docs/register/BLOCKER-NNN-*.md` + PR label `blocker`).
- Do not attempt to classify root causes in bash inside `runtime-doors.yml`.
- Do not push without `[skip ci]` when an external platform blocker is present.
- Do not open a second PR. All fixes, blocker files, and releases happen on this PR.

---

## 3. Stores, Fields, and Contracts

### Database Stores
**No new database tables or columns.**
- Silence explicitly named: The blocker state and circuit breaker are managed entirely via the version-controlled register (`docs/register/BLOCKER-NNN-*.md`) and GitHub PR labels (`blocker`, `fail-look`, `wake-engineer`, `wake-pm-look`). No rows in `travis.initiative` or `travis.motion` are minted for circuit breaking.

### Register Contracts

1. **`docs/register/BLOCKER-NNN-<SLUG>.md`**
   - Header:
     - `**Number:** NNN` (3-digit zero-padded, sequential)
     - `**Date:** YYYY-MM-DD`
     - `**PR:** #<number>`
     - `**Cause:** <short description, e.g. Cursor hard limit / $2 needed>`
     - `**Required Action:** <exact human step>`
     - `**Direct URL:** <link to dashboard/settings>`
   - Body:
     - Excerpt from the failed walk tape.
     - Confirmation of code fixes applied in `src/` under this hold.

2. **Commit Message Contract on Blocker:**
   - Must contain `[skip ci]` (or `[skip vercel]`) to ensure Vercel does not build until released.

3. **PR Label Contracts:**
   - `blocker`: Disables automated seat runs while the PR is in platform hold.
   - Removing `blocker`: Founder signal releasing the circuit breaker.

---

## 4. Runtime Behavior

1. **Deploy & Verification Run:**
   - Commit arrives on PR branch (without `[skip ci]`).
   - Vercel builds and issues `vercel.deployment.ready`.
   - `.github/workflows/runtime-doors.yml` executes `npm test` and `npm run test:runtime`.
   - All specs run sequentially to completion; output is saved to `$RUNNER_TEMP/walks.txt`.
   - If exit code != 0: check paints failure, `fail-look` label is applied to PR via `WAKE_GITHUB_TOKEN`.

2. **Engineer Triage Execution:**
   - Engineer boots on `fail-look`.
   - Engineer reads the full walk tape.
   - If failures include platform blockers (Bucket B):
     - Engineer fixes Bucket A issues in `src/`.
     - Engineer writes `docs/register/BLOCKER-NNN-*.md`.
     - Engineer commits with `git commit -m "... [skip ci]"`.
     - Engineer pushes to origin and stops.

3. **Blocker Notification Execution:**
   - GitHub Action detects `docs/register/BLOCKER-*.md` in push.
   - Removes `fail-look`, adds `blocker`.
   - Dispatches `.github/scripts/send-blocker-letter.py` via Resend to notify founder.

4. **Circuit Breaker Release:**
   - Founder resolves the external account/env blocker.
   - Founder removes `blocker` label on GitHub PR.
   - Workflow detects label removal and triggers a fresh deployment/run.

---

## 5. Ports

- **Resend Mailer:** `.github/scripts/send-blocker-letter.py` using `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `EMERGE_EMAIL`.
- **GitHub CLI / REST API:** `gh pr edit` for label mutations (`blocker`, `fail-look`).
- **Vercel Deployment Check:** Status check `runtime-doors` painted via `vercel/repository-dispatch/actions/status@v1`.

---

## 6. Verify

1. **Unit Tests:** `npm test` passes 100%.
2. **Runner Tape:** Walk suite runs all tests without early exit.
3. **Prompt Branching:** Automation prompts (`packet-sa`, `sa-complete-engineer`, `pm-look`) fetch PR head ref before running git diff.
4. **Blocker Flow:** Presence of `BLOCKER-*.md` labels PR `blocker` and strips `fail-look`.

---

## 7. Out of Scope

- Modifying runtime conversation stores (`voice_session`, `voice_turn`, `dest_job`).
- External webhook integrations outside GitHub Actions and Resend.
- Automatic credit card charging or programmatic Cursor account top-ups.
