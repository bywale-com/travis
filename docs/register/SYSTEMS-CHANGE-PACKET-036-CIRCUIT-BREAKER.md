# SYSTEMS-CHANGE-PACKET-036 — Circuit breaker: full-audit walks, triage, blocker hold

**Number:** `036` — next systems packet is **037**. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#179](https://github.com/bywale-com/travis/pull/179)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-11  
**PM packet:** [`PM-PACKET-021-CIRCUIT-BREAKER.md`](./PM-PACKET-021-CIRCUIT-BREAKER.md)  
**Test:** [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md)  
**FACE:** None — this cut is GitHub Actions, Vercel Deployment Checks, and register markdown. No new product chrome.  
**Prior (do not remint):** **086** runtime-is-the-app walks · **020** cumulative verify · emerge letter (`send-emerge-letter.py`) · `WAKE_GITHUB_TOKEN` label actor · `runtime-doors` Vercel hang · 023–035 product packets.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** PR labels + Vercel preview + GitHub Actions logs — not the phone face.

GitHub Actions is a **dumb runner**. The **Engineer is the triage brain**. Full tape always. No bash regex root-cause classification. Founder ops blockers get a hold (`blocker` label + house mail), not a silent red check or an infinite fail-look loop.

---

## 1. Intent

Replace brittle Action-side triage (bash regexes that either hid failures or caused doomed redeploy loops) with three contracts: (1) the walk runner always completes the cumulative suite and records the full tape; (2) `runtime-doors` paints red and fresh-adds `fail-look` on any failure unless the PR is on **blocker hold**; (3) when the Engineer finds **Bucket B** (founder ops / platform blockers), they fix **Bucket A** in `src/`, file `docs/register/BLOCKER-NNN-*.md`, and push with `[skip ci]` so Vercel does not rebuild into the same wall. A cheap Action labels `blocker`, silences seat automations, and emails the founder. Removing the `blocker` label releases the hold and triggers a fresh preview deploy so walks run against the unblocked environment with code fixes already on the branch. **No Travis table.** Hold state is git markdown + PR label + GitHub/Resend mail.

---

## 2. Story

### Must

- **Full-audit walks.** `npm run test:runtime` runs **every** file in `src/runtime/walks/*.spec.ts` to completion. No fail-fast / bail. The complete stdout/stderr tape is captured (already teed in `runtime-doors.yml`).
- **Dumb sensor.** `runtime-doors` runs `npm test` then `npm run test:runtime` against `RUNTIME_BASE_URL` from the Vercel `vercel.deployment.ready` payload. It paints the Deployment Check `runtime-doors` red on any failure. It does **not** classify failures with bash regexes.
- **fail-look on red.** When the walk step fails and an open PR exists for the deploy SHA, fresh-add label `fail-look` via `WAKE_GITHUB_TOKEN` (same actor law as today).
- **fail-look hold.** Do **not** add `fail-look` while the open PR has label `blocker`. Walks still run. Check still paints red. Engineer is not re-woken into a loop.
- **Engineer triage (two buckets).** On `fail-look`, Engineer reads the **complete** tape and sorts every failing item:
  - **Bucket A (plant / code):** import/syntax errors, route exceptions, broken response shapes, walk logic misses in `src/`.
  - **Bucket B (founder ops / platform):** Cursor hard spend limit ($2 Background Agent), missing `OPENAI_API_KEY` on preview (“Travis isn’t wired”), missing `DATABASE_URL` / other deploy secrets on Vercel, unwired third-party keys the walk names but the founder must set in Vercel/Cursor dashboards.
- **Circuit breaker.** If Bucket B is non-empty: Engineer fixes all Bucket A in `src/`, writes `docs/register/BLOCKER-NNN-*.md`, commits with **`[skip ci]`** or **`[skip vercel]`** in the commit message, pushes, and **stops**. Do not push a commit that triggers Vercel while Bucket B remains.
- **Blocker letter.** When a push touches `docs/register/BLOCKER-[0-9]*-*.md` (not `*-RESOLVED.md`): label `blocker`, remove `fail-look` / `wake-engineer` / `wake-pm-look`, email founder via Resend (same secrets as emerge).
- **Release (Option A).** Founder clears the external blocker, removes label `blocker` from the PR. That removal triggers a fresh Vercel preview deployment (Deploy Hook). Walks run on the new deploy; code fixes from the hold push are already on the branch.
- **Engineer prompt.** `sa-complete-engineer.prompt.md` fail-look path must match this cut — file blocker + `[skip ci]`, not “stop without commit.”

### Must-not

- Bash / grep regex triage in GitHub Actions (`Cannot use import` vs `hard limit` vs `isn.t wired`). **Refuse.**
- Mint `travis.initiative`, `travis.motion`, or any DB row for deploy blockers.
- Boot a Cursor automation on label `blocker`.
- Treat emerge as the blocker path.
- Skip later walks when an early walk fails (fail-fast / `--test-bail`).
- Push without `[skip ci]` when Bucket B is still open on the PR.
- Re-add `fail-look` while `blocker` label is on the PR.
- Classify root cause in the Action — that is Engineer job-law.
- Cousin PR. Remint 023–035 product packets.

### Chain

```text
Push (no [skip ci]) → Vercel preview build → vercel.deployment.ready
  → runtime-doors: npm test + npm run test:runtime (full suite, tee tape)
  → green: check passes
  → red: check fails → fail-look (unless PR has label blocker)

fail-look → Engineer automation
  → read full tape → Bucket A fixes in src/
  → Bucket B empty → push normally → Vercel rebuilds
  → Bucket B non-empty → BLOCKER-NNN.md + [skip ci] push → stop

BLOCKER push → wake-packet-seats
  → label blocker, strip fail-look / wake-engineer / wake-pm-look
  → send-blocker-letter.py → EMERGE_EMAIL

Founder fixes ops → removes label blocker
  → wake-packet-seats release job → POST VERCEL_DEPLOY_HOOK_URL
  → new deploy → runtime-doors full suite on unblocked env
  → green OR red + fail-look (no blocker label)
```

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **`travis.initiative` / `travis.motion` for blockers** | Deploy hold is not product backlog. Git markdown + PR label + mail is enough. |
| **Blocker row in Postgres** | Modifiable hold state belongs in GitHub + register, not the voice desk DB. |
| **Cursor automation on `blocker`** | Cheap Action + email only. |
| **Action-side Bucket A/B regex** | Engineer reads the tape. |
| **Auto-clear `blocker` when walks go green** | Founder removes the label (Option A). |
| **Deleting `BLOCKER-*.md` on release** | File is audit trail; may stay on the branch. **Active hold = label only.** |
| **Product face / phone chrome** | This packet is CI + register + Engineer prompt. |

---

## 3. Requirements (extraction)

From PM-021 founder lock + architecture plan + BUILD-PROTOCOL “Dumb runner, intelligent seat.” Not a second invention.

1. Confirm full-audit behavior and document it in the npm script comment / walk README — do not rely on implicit Node defaults without refusing `--test-bail`.
2. Confirm blocker is **git-level** (markdown file shape + PR label `blocker`). Refuse DB mint.
3. Name exact Action triggers: BLOCKER push → hold + mail; `blocker` label removed → redeploy hook.
4. Name Vercel skip contract: `[skip ci]` / `[skip vercel]` in commit message suppresses preview build.
5. Recut Engineer fail-look prompt: Bucket B → BLOCKER file + `[skip ci]`, not stop-without-commit.
6. Amend `runtime-doors` fail-look skip: **PR label `blocker` only** — not BLOCKER file alone (file may remain as audit after release).

---

## 4. Inventory — quoted stood-up

### Walk runner (cumulative suite)

```11:11:package.json
    "test:runtime": "tsx --test --test-concurrency=1 src/runtime/walks/*.spec.ts",
```

Five walk specs on `main`: `come-back`, `type-dest`, `type-send`, `type-walk-back`, `voice-wrap`. Suite is sequential (`--test-concurrency=1`). Node’s test runner does not bail by default; do not add `--test-bail`.

```7:14:src/runtime/README.md
- One sitting, send, **wait for the completion signal**, read the tape, next beat.
- ...
- The suite runs **sequentially**. Each walk starts a fresh sitting (`End` + open) except the come-back resume beat.
```

### runtime-doors (partial 021 on `main` — Engineer finishes)

```41:50:.github/workflows/runtime-doors.yml
      - name: Sequential walks on this URL
        id: walks
        env:
          RUNTIME_BASE_URL: ${{ github.event.client_payload.url }}
          ...
        run: |
          test -n "$RUNTIME_BASE_URL" || { echo "missing deploy URL"; exit 1; }
          set -o pipefail
          npm run test:runtime 2>&1 | tee "$RUNNER_TEMP/walks.txt"
```

```87:104:.github/workflows/runtime-doors.yml
          # Checkout is at DEPLOY_SHA — blocker file on this commit means hold is active.
          if compgen -G "docs/register/BLOCKER-[0-9]*-*.md" > /dev/null; then
            echo "Blocker file on deploy commit. No fail-look."
            exit 0
          fi
          ...
          if echo "$pr_labels" | grep -q '^blocker$'; then
            echo "PR #$pr has blocker active. No fail-look."
            exit 0
          fi
```

**Amend:** remove the **file-only** skip (lines 87–91). Keep **label `blocker`** skip only. A lingering `BLOCKER-*.md` audit file must not permanently suppress `fail-look` after the founder removes the label.

No bash failure-classification grep remains in `.github/workflows/` (Hotfix 088 regex path is dead).

### wake-packet-seats (blocker **not** planted)

Labels today: `wake-sa` · `wake-engineer` · `wake-pm-look` · `fail-look` · `emerge`. Paths include `PM-PACKET`, `SYSTEMS-CHANGE-PACKET`, `HOTFIX`, `src/`, etc. **No** `docs/register/BLOCKER-*.md` path. **No** `pull_request` / `unlabeled` release job. **No** `send-blocker-letter.py`.

### Emerge mailer (template for blocker mail)

```14:33:.github/scripts/send-emerge-letter.py
def main() -> int:
    ...
    payload: dict = {
        "from": sender,
        "to": [to],
        "subject": f"{nnn} emerged — walk this sheet",
        "text": body,
    }
```

Resend secrets (GitHub Actions): `EMERGE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

### Engineer automation prompt (contradicts 021 — recut)

```14:18:docs/register/house-now/automations/sa-complete-engineer.prompt.md
- Else → newest failed `runtime-doors` log for this PR.
  - Cursor **hard limit** / `$2` / **Travis isn’t wired** → **stop**. Founder ops. Do not commit. Do not push.
  - Else recut that miss. Do not stop for a missing PM-LOOK.
```

This is the old silent-red / infinite-loop failure mode. **Replace** with circuit-breaker triage (§2).

### Product tables (refuse for blockers)

`travis.initiative` and `travis.motion` exist for ticket/backlog work (`migrate.ts`). They track **product** motion, not CI deploy holds. Do not add a `blocker` status or column.

---

## 5. Stores / fields / contracts

### Add (git-level + GitHub — not a Travis mint)

| What | Contract |
|------|----------|
| **`docs/register/BLOCKER-NNN-<SLUG>.md`** | Register markdown on the PR branch. `NNN` = next unused blocker number (three digits). Independent of HOTFIX numbering. |
| **BLOCKER file shape (minimum lines)** | Engineer must write all of: `**Number:**` · `**PR:**` (URL) · `**Cause:**` (one line) · `**Required action:**` (what founder does — **never** secret values) · `**Resolve at:**` (direct URL) · `## Tape excerpt` (fenced log excerpt from the failed walk). |
| **PR label `blocker`** | Active hold switch. Created by Action on BLOCKER push. Removed by founder manually on unblock. |
| **`.github/scripts/send-blocker-letter.py`** | Same Resend port as emerge. Args: `BLOCKER_FILE`. Subject: `[BLOCKER] <Cause>` (Cause from `**Cause:**` line). Body: full markdown file. |
| **Secret `VERCEL_DEPLOY_HOOK_URL`** | Optional GitHub Actions secret. POST on `blocker` label removal to redeploy preview without a new commit. If unset, release job logs “set hook or redeploy manually” — do not fail the workflow. |

### Change (workflows + prompt)

| What | Change |
|------|--------|
| **`.github/workflows/wake-packet-seats.yml`** | Add path `docs/register/BLOCKER-*.md`. On push touching `BLOCKER-[0-9]*-*.md` (exclude `*-RESOLVED.md`): create label `blocker`, remove `fail-look` / `wake-engineer` / `wake-pm-look`, run `send-blocker-letter.py`. Do **not** add `wake-engineer`. Add job on `pull_request` `types: [unlabeled]`: when removed label is `blocker`, POST deploy hook (if secret set). |
| **`.github/workflows/runtime-doors.yml`** | Remove file-only fail-look skip. Keep label `blocker` skip only. Comment header already names 021 — leave. |
| **`docs/register/house-now/automations/sa-complete-engineer.prompt.md`** | fail-look path: triage tape → fix Bucket A → if Bucket B, write BLOCKER + `[skip ci]` push → stop. Remove “do not commit / do not push” for founder ops. |
| **`package.json` / `src/runtime/walks/README.md`** | One line each: full-audit law — all specs run; no `--test-bail`. |

### Refuse

| What | Why |
|------|-----|
| `travis.initiative` / `travis.motion` blocker row | Wrong grain. |
| Action bash regex triage | PM-021 founder lock. |
| Cursor boot on `blocker` | Cheap Action only. |
| Second PR | Same PR law. |
| Remint walk specs for this cut | Behavior is runner + CI; walks stand unless a spec itself bail-exits (none today). |

No signed SQL this packet.

---

## 6. Runtime behavior

| Actor | Writes | Reads | Trigger |
|-------|--------|-------|---------|
| **Vercel** | Preview deployment | Git push (honors `[skip ci]` / `[skip vercel]`) | Push without skip token |
| **runtime-doors** | Check status; optional `fail-look` label | Deploy URL, walk tape | `repository_dispatch` `vercel.deployment.ready` |
| **Engineer** | `src/` fixes; `BLOCKER-NNN-*.md`; commit message | Full walk log / tape | `fail-look` automation |
| **wake-packet-seats (push)** | Labels; Resend email | This-push diff for `BLOCKER-*.md` | Push to PR branch |
| **wake-packet-seats (release)** | Deploy hook POST | `pull_request` `unlabeled` = `blocker` | Founder removes `blocker` |
| **Founder** | Removes `blocker` label; sets Vercel/Cursor secrets | Blocker email | Manual |

**Hold semantics:** label `blocker` = automations sleep, fail-look suppressed, Vercel should not have built the hold commit (`[skip ci]`). **Release semantics:** label removed → deploy hook → new build picks up env + code → full walk suite.

**Bucket B examples (Engineer classifies — not Action regex):**

- Tape / log contains Cursor billing / hard limit / `$2` / Background Agent create denied.
- Status turn `Travis isn't wired` on a preview URL (missing `OPENAI_API_KEY` in Vercel env for that preview).
- Walk names missing operator cookie / bypass secret / `DATABASE_URL` on the deployment under test.
- Engineer handoff “`DATABASE_URL` unset on Cloud Agent environment” when the miss is founder runtime secret setup.

**Bucket A examples:** ESM `Cannot use import`, 500 on `/api/send`, walk assertion on dest leave / wrap / tape shape — fix in `src/`.

---

## 7. Ports

| Port | Status |
|------|--------|
| Vercel Deployment Checks + `vercel/repository-dispatch` | **Real** — already hung. |
| `npm test` + `npm run test:runtime` | **Real** — sensor. |
| GitHub PR labels via `WAKE_GITHUB_TOKEN` | **Real** — same as emerge chain. |
| Resend (`EMERGE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`) | **Real** — reuse for blocker mail. |
| Vercel Deploy Hook (`VERCEL_DEPLOY_HOOK_URL`) | **Stand-in until secret set** — release job POSTs when present; else log manual redeploy. |
| Cursor Cloud / Vercel env dashboards | **External** — linked from BLOCKER `**Resolve at:**`. |
| Travis Postgres / voice desk | **Out of scope** — no read/write for blockers. |

---

## 8. Verify

Walk [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md). Mode: Actions + labels + Vercel preview — not phone smoke.

| Step | Proves |
|------|--------|
| **1. Full-audit** | Inject or use a suite where an early walk fails and later walks still run. Log shows all N spec files executed. Tape teed. Check red. |
| **2. Triage + hold** | Engineer (or scripted simulation) fixes code, adds `BLOCKER-021-*.md`, pushes `[skip ci]`. No Vercel deploy for that commit. PR gets `blocker`. `fail-look` / `wake-engineer` stripped. Blocker email received. |
| **3. Release** | Founder clears ops, removes `blocker` label. Deploy hook fires (or manual redeploy documented). New walk run on preview. With A fixed and B cleared → check green. |

Lib floor before live simulation: `npm test` still passes. `npm run test:runtime` without `RUNTIME_BASE_URL` skips URL walks (existing `{ skip: !haveUrl }` law) — full-audit applies when URL is set.

**Merge note:** `runtime-doors.yml` runs from **`main`** on `repository_dispatch`. Blocker fail-look skip + full-audit law must reach `main` for production CI behavior.

---

## 9. Out of scope

- Remint 023–035 product packets or walk assertion semantics (086 stands).
- Mint Travis tables for blockers.
- Action-side regex triage (reintroducing Hotfix 088 failure mode).
- Cursor automation on `blocker`.
- Auto-removing `blocker` label.
- PM look / emerge path changes except shared Resend secrets.
- Phone face / runtime walk content changes unless a walk is genuinely broken (Bucket A).
- Cousin PR.

---

## 10. Engineer paste (no leftover analysis)

1. **runtime-doors.yml** — delete file-only BLOCKER fail-look skip (lines 87–91). Keep PR label `blocker` skip. No bash regex classification. Full tape tee stays.
2. **wake-packet-seats.yml** — add `docs/register/BLOCKER-*.md` to `paths`. On this-push BLOCKER file: label `blocker`; remove `fail-look`, `wake-engineer`, `wake-pm-look`; call `send-blocker-letter.py`. Add `pull_request` / `unlabeled` job: if removed label is `blocker`, `curl -X POST "$VERCEL_DEPLOY_HOOK_URL"` when secret set.
3. **send-blocker-letter.py** — clone emerge script shape; subject `[BLOCKER] …`; parse `**Cause:**` from the file.
4. **sa-complete-engineer.prompt.md** — replace fail-look “hard limit → stop without commit” with Bucket A/B triage + BLOCKER + `[skip ci]` (§2).
5. **package.json** or **walks/README.md** — one explicit line: all specs run; no `--test-bail`.
6. Do **not** mint DB tables. Do **not** add Action regex triage. Do **not** boot Cursor on `blocker`.
7. Computer-use or manual walk of **021 test sheet** on a PR that exercises all three beats when hooks/secrets are available.
