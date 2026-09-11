# SYSTEMS-CHANGE-PACKET-036 — Circuit breaker (full-audit walks, Engineer triage, blocker hold)

**Number:** `036` — next systems packet is **037**. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#181](https://github.com/bywale-com/travis/pull/181)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-11  
**PM packet:** [`PM-PACKET-021-CIRCUIT-BREAKER.md`](./PM-PACKET-021-CIRCUIT-BREAKER.md)  
**Test:** [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md)  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — dumb runner, intelligent seat. Do not deploy into known wall-failures.  
**Prior (do not remint):** **020** runtime verify + `runtime-doors` · **035** stream architecture · Travis Postgres schema · Resend emerge mail (`send-emerge-letter.py`).  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** GitHub Actions + Vercel preview on the packet PR. Not the phone face.

021 replaces GitHub Actions bash-regex triage with: cumulative walk tape → Engineer reads every failure → plant fixes and/or a **blocker hold** → preview only after handoffs and blocker are clear.

---

## 1. Intent

The deployment gate is a **dumb sensor**. It runs the full cumulative walk suite, paints `runtime-doors` red when anything fails, and wakes the Engineer with the complete tape. It does **not** classify root cause. The **Engineer** triages each failing line into plant/code (Bucket A) or founder/platform ops (Bucket B). When Bucket B is non-empty, the Engineer fixes Bucket A in `src/`, writes a git-level **blocker** receipt, and commits **without** the preview green-light tag so Vercel does not rebuild into the same wall. GitHub Actions labels `blocker`, strips seat wakes, and emails the founder. Preview resumes only when handoff/hold labels and `blocker` are all gone — then an Action empty-commits the exact subject `Preview [vercel build]`. Production always builds. No Travis table mint for blockers.

---

## 2. Story

### Must

- **Full-audit walks.** `npm run test:runtime` runs every file in `src/runtime/walks/*.spec.ts` to completion (`--test-concurrency=1`; no `--test-bail`). The step tees the full tape to `$RUNNER_TEMP/walks.txt`. Any failure → `runtime-doors` paints red.
- **Dumb runner.** `.github/workflows/runtime-doors.yml` adds `fail-look` on red **only** when the open PR has **none** of: `wake-sa` · `wake-engineer` · `wake-pm-look` · `fail-look` · `blocker`. No bash regex classifying `Cannot use import` vs `hard limit` vs `isn't wired`. Every failure goes to the Engineer.
- **Engineer triage.** On `fail-look`, the Engineer reads the **complete** tape and sorts each item:
  - **Bucket A (plant / code):** syntax, ESM/CJS, route exceptions, broken response shapes, assertion misses in `src/`.
  - **Bucket B (founder ops / platform):** Cursor hard spend limit, missing `OPENAI_API_KEY` on preview, unreachable DB credentials, other external walls the code cannot clear.
- **Circuit breaker.** If **any** Bucket B item remains after Bucket A fixes: write `docs/register/BLOCKER-NNN-<slug>.md`, commit Bucket A fixes + blocker **without** subject `Preview [vercel build]`. Do **not** use `[skip ci]` — that silences GitHub Actions labeling too.
- **Blocker hold.** A push that lands `docs/register/BLOCKER-[0-9]+-*.md` (not `*-RESOLVED.md`) → label `blocker`, strip `fail-look` / `wake-sa` / `wake-engineer` / `wake-pm-look`, send blocker email when Resend secrets exist. No new seat labels while `blocker` is on the PR.
- **Preview opt-in.** `vercel.json` `ignoreCommand` → `.github/scripts/vercel-ignore.sh`. Preview builds **only** when the commit message **first line** is exactly `Preview [vercel build]`. Mentioning the tag in the body must not build. Production (`VERCEL_ENV=production`) always builds.
- **Green light.** When `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `blocker` are all off: `.github/scripts/preview-when-clear.sh` empty-commits that exact subject and pushes. Also runs on `pull_request` `unlabeled` when the removed label is `blocker`.
- **One seat label at a time.** `add_seat` strips the other seat labels before adding the wake.
- **Engineer prompt law.** `sa-complete-engineer.prompt.md` documents Bucket A/B triage and forbids seat commits from using the green-light subject.

### Must-not

- Mint `travis.blocker`, `travis.initiative` status, or `travis.motion` rows for this hold. Blocker is **git-level** only.
- Classify failures in GitHub Actions with grep/regex (Hotfix 088 path).
- Skip `fail-look` on unwired / hard-limit patterns in the runner. Red stays red; Engineer decides.
- Use `[skip ci]` or `[vercel skip]` as the hold mechanism.
- Use deploy hooks or substring `[vercel build]` anywhere except the exact green-light first line.
- Remove the `blocker` label on push (only the founder removes it; that `unlabeled` event is the release trigger).
- Green-light a seat commit. Engineer never uses subject `Preview [vercel build]`.
- Re-loop Vercel while Bucket B is still true (infinite doomed redeploy).

### Chain

```text
Seat work on PR (handoff labels may be on)
  → when labels clear → Action empty-commit Preview [vercel build]
  → Vercel preview deploy
  → repository_dispatch vercel.deployment.ready
  → runtime-doors: npm test + npm run test:runtime (full tape)
  → red + idle PR → fail-look
  → Engineer triage
       Bucket A only → fix src/, push without green-light → wake-pm-look path
       Any Bucket B → fix src/ + BLOCKER-NNN-*.md, push without green-light
  → push lands BLOCKER → blocker label + email + automations sleep
  → founder resolves ops + removes blocker label
  → blocker-release → preview-when-clear → Vercel builds fixed code
  → walks re-run → green when A fixed and B cleared
```

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **`travis.blocker` table** | Hold is PR label + markdown receipt + optional email. No query surface in the SPA. |
| **Auto-resolve blocker from env** | Founder removes the label after fixing ops. No bot that clears `blocker` when a secret appears. |
| **BLOCKER-*-RESOLVED.md as release** | `*-RESOLVED.md` is ignored by the hold trigger. Release is **unlabeled `blocker`**, not a second file. |
| **Fail-fast walks** | Cumulative suite law (020). Count all failures per deploy. |
| **Travis voice/TTS for blockers** | House mail via Resend. Not the product face. |
| **Vercel MCP as verify** | Engineer does not sit in MCP. The check + test sheet are the signal. |

---

## 3. Requirements (extraction)

From PM-021 founder lock + architecture plan. Not a second invention.

1. **Blocker store:** git-level contract only — refuse `travis.*` mint.
2. **Trigger contracts:** name exact GitHub + Vercel seams (below).
3. **Full-audit:** confirm runner already cumulative; forbid `--test-bail`.
4. **Engineer triage:** Bucket A/B in automation prompt; no Actions brain.
5. **Preview gate:** exact first-line subject; production always builds.
6. **Blocker mailer:** `.github/scripts/send-blocker-letter.py` — Engineer plants (workflow already calls it).

---

## 4. Inventory — quoted stood-up (this branch)

### Walk runner (cumulative — keep)

```11:11:package.json
    "test:runtime": "tsx --test --test-concurrency=1 src/runtime/walks/*.spec.ts",
```

Node’s test runner completes all specs unless `--test-bail` is added. Do not add bail.

Five walk specs stand: `come-back`, `type-dest`, `type-send`, `type-walk-back`, `voice-wrap`.

### runtime-doors (dumb sensor + idle fail-look)

```42:51:.github/workflows/runtime-doors.yml
      - name: Sequential walks on this URL
        id: walks
        ...
          npm run test:runtime 2>&1 | tee "$RUNNER_TEMP/walks.txt"
```

```95:101:.github/workflows/runtime-doors.yml
          for hold in wake-sa wake-engineer wake-pm-look fail-look blocker; do
            if echo "$pr_labels" | grep -qx "$hold"; then
              echo "PR #$pr has $hold (handoff/hold). No fail-look."
              exit 0
            fi
          done
```

No failure-classification grep in this file. **Must merge to `main`** — `repository_dispatch` runs the workflow **from main** (comment L7–10).

### Preview gate

```1:4:vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "sh .github/scripts/vercel-ignore.sh"
}
```

```14:21:.github/scripts/vercel-ignore.sh
msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
first=$(printf '%s\n' "$msg" | awk 'NR==1 { sub(/\r$/, ""); print; exit }')
if [ "$first" = "Preview [vercel build]" ]; then
  echo "vercel-ignore: build (green light)"
  exit 1
fi
```

### Blocker hold + release (wake-packet-seats)

Push path includes `docs/register/BLOCKER-*.md`. Blocker push → label `blocker`, strip seats, call `send-blocker-letter.py` when secrets set.

`blocker-release` job: `pull_request` `unlabeled` + label name `blocker` → `preview-when-clear.sh`.

`preview-when-clear` job: after `label` job on push, when handoffs clear → green-light empty commit.

### Engineer automation (triage law)

`docs/register/house-now/automations/sa-complete-engineer.prompt.md` — Bucket A/B, blocker file, no green-light tag, no `[skip ci]`.

### Lib proof (partial plant)

`src/lib/circuit-breaker.test.ts` — asserts ignore script, preview-when-clear labels, wake workflow shape, runtime-doors handoff skip, Engineer prompt law. Runs under `npm test`.

### Missing on branch (Engineer must plant)

`.github/scripts/send-blocker-letter.py` — referenced by `wake-packet-seats.yml` L149 but **not** on disk.

---

## 5. Stores / fields / contracts

### Refuse (Travis DB)

| What | Why |
|------|-----|
| `travis.blocker` or initiative/motion status for hold | Blocker is not queryable product state. SPA does not list blockers. |
| PR label stored in Postgres | GitHub is the label source of truth. |

### Add (git-level contracts only)

| Contract | Shape |
|----------|--------|
| **Blocker file** | Path: `docs/register/BLOCKER-NNN-<slug>.md`. `NNN` = next free register number (021 aligns with this packet; do not reuse). **Exclude** `*-RESOLVED.md` from hold trigger. |
| **Blocker body (minimum)** | `# Blocker NNN — <short title>` · **Cause** (one paragraph from tape) · **Required action** (numbered steps) · **URL** (direct dashboard / env page) · **Tape excerpt** (fenced log lines). Optional: **Pocket** (PR link / packet name). |
| **PR label `blocker`** | GitHub label. While present: no seat wakes; `runtime-doors` skips fresh `fail-look`; preview-when-clear skips. |
| **Green-light commit** | Empty commit; subject first line exactly `Preview [vercel build]`; pushed by Action only. |
| **Blocker email** | Resend via `send-blocker-letter.py`. Subject: `[BLOCKER] <Pocket> blocked — <Cause>`. Same secrets as emerge: `EMERGE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`. |

### Change (already on branch — Engineer completes mailer)

| What | Change |
|------|--------|
| `vercel.json` + ignore script | **Signed** — preview opt-in. |
| `preview-when-clear.sh` | **Signed** — handoff + blocker gate. |
| `wake-packet-seats.yml` | **Signed** — blocker push, one seat, preview-when-clear, blocker-release. |
| `runtime-doors.yml` | **Signed** — all handoff/hold labels skip fail-look. Merge to main. |
| `circuit-breaker.test.ts` | **Signed** — extend when mailer lands. |
| `send-blocker-letter.py` | **Plant** — see §11. |

No signed SQL.

---

## 6. Runtime behavior

### Who writes

| Actor | Writes |
|-------|--------|
| **GitHub Action `runtime-doors`** | Vercel check status; `fail-look` when red and PR idle. |
| **Engineer (`fail-look`)** | `src/` fixes; `docs/register/BLOCKER-NNN-*.md` when Bucket B non-empty. |
| **GitHub Action `wake-packet-seats`** | Seat labels; `blocker` on blocker push; green-light empty commit when clear. |
| **Founder** | Removes `blocker` label after ops fix. |

### Who reads

| Reader | Reads |
|--------|--------|
| **Engineer automation** | Full walk tape; classifies A vs B. |
| **`wake-packet-seats`** | This-push diff for `BLOCKER-*.md`, `SYSTEMS-CHANGE-PACKET-*.md`, etc.; PR labels for hold. |
| **`runtime-doors`** | PR labels before adding `fail-look`. |
| **`vercel-ignore.sh`** | `VERCEL_GIT_COMMIT_MESSAGE` first line + `VERCEL_ENV`. |
| **Founder (email)** | Blocker letter body. |

### Triggers (exact)

| Event | Condition | Effect |
|-------|-----------|--------|
| `repository_dispatch` `vercel.deployment.ready` | Always on preview/prod deploy | Run lib + full walks; paint check. |
| Walk step failure | Open PR; no handoff/hold label | Fresh-add `fail-look`. |
| Walk step failure | Any of `wake-sa` … `blocker` on PR | Red check; **no** `fail-look`. |
| `push` (branch) | Diff includes `BLOCKER-[0-9]+-*.md` not `*-RESOLVED` | `blocker` label; strip seats; email if secrets. |
| `push` | `blocker` already on PR | Strip stray seat labels; no new wakes. |
| `push` | After label job; no handoff/hold | `preview-when-clear.sh` → maybe green-light commit. |
| `pull_request` `unlabeled` | Label removed = `blocker` | `blocker-release` → `preview-when-clear.sh`. |
| Vercel Ignored Build Step | Preview; first line ≠ green-light subject | Skip build (exit 0). |
| Vercel Ignored Build Step | Production | Always build (exit 1). |
| Vercel Ignored Build Step | Preview; first line = `Preview [vercel build]` | Build (exit 1). |

---

## 7. Ports

| Port | Real vs stand-in |
|------|------------------|
| Vercel Deployment Checks + `repository_dispatch` | **Real** (020). |
| `VERCEL_AUTOMATION_BYPASS_SECRET` + operator cookie | **Real** walk auth. |
| GitHub PR labels + `WAKE_GITHUB_TOKEN` | **Real** wake actor. |
| Resend (`send-emerge-letter.py` pattern) | **Real** secrets. |
| `send-blocker-letter.py` | **Missing — Engineer plants** before blocker email works. |
| Travis Postgres | **Unchanged.** No blocker rows. |
| Cursor Cloud Agents API | **Real** on dest host; hard limit = Bucket B, not a runner skip. |

---

## 8. Verify

Primary sheet: [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md).

| Step | Proves |
|------|--------|
| **1. Full-audit** | Early walk failure does not abort later specs. Full tape in Action log. Check red. |
| **2. Triage + hold** | Engineer fixes A; files `BLOCKER-021-*.md` for B; push without green-light; no Vercel preview build; `blocker` label; seat labels stripped; founder email (after mailer planted). |
| **3. Release** | Founder removes `blocker`; no handoff labels; Action pushes green-light commit; Vercel builds; walks green when A fixed and B cleared. |

Lib proof (before live cycle): `npm test` → `circuit-breaker.test.ts` green.

After planting `send-blocker-letter.py`: add one test that the workflow invokes it (static read of yml + script exists) or a dry-run unit test of subject/body shaping without calling Resend.

**Merge law:** `runtime-doors.yml` handoff skip must be on **`main`** before the next deploy can rely on it. This PR carries the file; merge completes the port.

---

## 9. Out of scope

- Remint 020 walk specs, 023–035 Travis tables, or runtime walk semantics.
- Bash regex triage in Actions (explicitly removed).
- `[skip ci]` / deploy hooks / substring green-light charms.
- Blocker rows in Postgres or blocker UI in the SPA.
- Auto-clearing `blocker` when secrets appear.
- Travis voice/TTS notification of blockers.
- Cousin PR.
- Inventing a second verification runner.

---

## 10. Engineer paste (no leftover analysis)

1. **Plant** `.github/scripts/send-blocker-letter.py`:
   - Args: path to `docs/register/BLOCKER-NNN-*.md`.
   - Parse **Cause** and pocket title from the markdown (first `#` heading + `**Cause**` section or first paragraph).
   - Resend POST same pattern as `send-emerge-letter.py`. Subject `[BLOCKER] <Pocket> blocked — <Cause>`. Text = full file body.
   - Missing Resend secrets → log and exit 0 (label hold still applies).
2. **Extend** `src/lib/circuit-breaker.test.ts` — script exists; workflow still references it; no `VERCEL_DEPLOY_HOOK_URL`.
3. **Do not remint** what is already on this branch: `vercel.json`, `vercel-ignore.sh`, `preview-when-clear.sh`, `wake-packet-seats.yml` blocker/preview jobs, `runtime-doors.yml` handoff skip, Engineer prompt Bucket A/B — unless a test proves a gap.
4. **On `fail-look`:** read full tape; fix Bucket A in `src/`; if any Bucket B remains, write `BLOCKER-NNN-*.md` with cause, action, URL, excerpt; commit **without** subject `Preview [vercel build]`; do not use `[skip ci]`.
5. **Merge this PR to `main`** so `repository_dispatch` runs the handoff-aware `runtime-doors` (comment in workflow).
6. Walk [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md) on the PR lifecycle. Fill **I saw**.
