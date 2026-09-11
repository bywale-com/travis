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

Replace brittle Action-side triage (bash regexes that either hid failures or caused doomed redeploy loops) with four contracts: (1) the walk runner always completes the cumulative suite and records the full tape; (2) Vercel **preview** does not run while a handoff or hold is in process — default skip; the green-light tag on an empty commit is the only preview go; (3) `runtime-doors` paints red and fresh-adds `fail-look` on any failure unless the PR still has a handoff/hold label; (4) when the Engineer finds **Bucket B** (founder ops / platform blockers), they fix **Bucket A** in `src/`, file `docs/register/BLOCKER-NNN-*.md`, and push **without** the green-light tag. A cheap Action labels `blocker`, silences seat automations, and emails the founder. Removing the `blocker` label (when no seat wakes remain) empty-commits the green-light tag so walks run against the unblocked environment with code fixes already on the branch. **No Travis table.** Hold state is git markdown + PR label + GitHub/Resend mail.

---

## 2. Story

### Must

- **Full-audit walks.** `npm run test:runtime` runs **every** file in `src/runtime/walks/*.spec.ts` to completion. No fail-fast / bail. The complete stdout/stderr tape is captured (already teed in `runtime-doors.yml`).
- **Dumb sensor.** `runtime-doors` runs `npm test` then `npm run test:runtime` against `RUNTIME_BASE_URL` from the Vercel `vercel.deployment.ready` payload. It paints the Deployment Check `runtime-doors` red on any failure. It does **not** classify failures with bash regexes.
- **Preview after handoffs.** `vercel.json` `ignoreCommand` skips preview unless this commit’s message contains `[vercel build]`. Production always builds. Seat commits never carry that tag. Handoff/hold labels: `wake-sa` · `wake-engineer` · `wake-pm-look` · `fail-look` · `blocker`. When they are all off, Action empty-commits `Preview [vercel build]`.
- **fail-look on red.** When the walk step fails and an open PR exists for the deploy SHA, fresh-add label `fail-look` via `WAKE_GITHUB_TOKEN` (same actor law as today) **only if** the PR has none of those handoff/hold labels.
- **fail-look hold.** Do **not** add `fail-look` while the open PR has `wake-sa`, `wake-engineer`, `wake-pm-look`, `fail-look`, or `blocker`. Walks still run. Check still paints red. Engineer is not re-woken into a loop.
- **Engineer triage (two buckets).** On `fail-look`, Engineer reads the **complete** tape and sorts every failing item:
  - **Bucket A (plant / code):** import/syntax errors, route exceptions, broken response shapes, walk logic misses in `src/`.
  - **Bucket B (founder ops / platform):** Cursor hard spend limit ($2 Background Agent), missing `OPENAI_API_KEY` on preview (“Travis isn’t wired”), missing `DATABASE_URL` / other deploy secrets on Vercel, unwired third-party keys the walk names but the founder must set in Vercel/Cursor dashboards.
- **Circuit breaker.** If Bucket B is non-empty: Engineer fixes all Bucket A in `src/`, writes `docs/register/BLOCKER-NNN-*.md`, commits **without** the green-light tag, pushes, and **stops**. Do not green-light preview while Bucket B remains. Do not use `[skip ci]` — that silences GitHub Actions too.
- **Blocker letter.** When a push touches `docs/register/BLOCKER-[0-9]*-*.md` (not `*-RESOLVED.md`): label `blocker`, remove `fail-look` / `wake-engineer` / `wake-pm-look`, email founder via Resend (same secrets as emerge).
- **Release (Option A).** Founder clears the external blocker, removes label `blocker` from the PR. If no handoff labels remain, Action empty-commits the green-light tag. Walks run on the new deploy; code fixes from the hold push are already on the branch.
- **Engineer prompt.** `sa-complete-engineer.prompt.md` fail-look path must match this cut — file blocker, never put the green-light tag on a seat commit, not “stop without commit.”

### Must-not

- Bash / grep regex triage in GitHub Actions (`Cannot use import` vs `hard limit` vs `isn.t wired`). **Refuse.**
- Mint `travis.initiative`, `travis.motion`, or any DB row for deploy blockers.
- Boot a Cursor automation on label `blocker`.
- Treat emerge as the blocker path.
- Skip later walks when an early walk fails (fail-fast / `--test-bail`).
- Push a green-light commit while Bucket B is still open on the PR.
- Re-add `fail-look` while `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `blocker` is on the PR.
- Put the green-light tag on a seat/handoff commit.
- Classify root cause in the Action — that is Engineer job-law.
- Cousin PR. Remint 023–035 product packets.

### Chain

```text
Seat push (no green-light tag) → Vercel skip
  → Action may add exactly one of: wake-sa / wake-engineer / wake-pm-look / fail-look
    or blocker (BLOCKER file). Prior seat labels stripped.

Handoff labels and blocker all off
  → wake-packet-seats empty-commit Preview [vercel build]
  → Vercel preview → vercel.deployment.ready
  → runtime-doors: npm test + npm run test:runtime (full suite, tee tape)
  → green: check passes
  → red: check fails → fail-look (unless a handoff/hold label is on)

fail-look → Engineer automation
  → read full tape → Bucket A fixes in src/
  → Bucket B empty → push without green-light tag → wake-pm-look (if packet+SCP)
  → Bucket B non-empty → BLOCKER-NNN.md + push without green-light tag → stop

BLOCKER push → wake-packet-seats
  → label blocker, strip seat wakes
  → send-blocker-letter.py → EMERGE_EMAIL

Founder fixes ops → removes label blocker
  → wake-packet-seats release job → same empty-commit green light if seats are clear
  → new deploy → runtime-doors full suite on unblocked env
  → green OR red + fail-look (idle PR)
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
3. Name exact Action triggers: BLOCKER push → hold + mail; `blocker` label removed → green-light empty commit when seats are clear.
4. Name Vercel skip contract: preview skip unless commit message contains `[vercel build]`; production always builds. Seat commits never carry that tag.
5. Recut Engineer fail-look prompt: Bucket B → BLOCKER file + push without green-light tag, not stop-without-commit.
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
| **Secret `VERCEL_DEPLOY_HOOK_URL`** | **Refuse for this cut.** Preview go is the green-light empty commit. A hook would rebuild HEAD without the tag and the ignoreCommand would skip. |

### Change (workflows + prompt)

| What | Change |
|------|--------|
| **`.github/workflows/wake-packet-seats.yml`** | One seat label at a time. `blocker` already on → no new seat labels. Pass strips seat labels then `emerge`. After label job (and on `blocker` unlabeled): run `preview-when-clear.sh` — empty-commit green-light tag iff no handoff/hold labels. |
| **`.github/workflows/runtime-doors.yml`** | Skip fail-look while `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `blocker` is on. No bash regex classification. Full tape tee stays. |
| **`vercel.json` + `.github/scripts/vercel-ignore.sh`** | Preview skip unless `[vercel build]` in `VERCEL_GIT_COMMIT_MESSAGE`. Production always builds. No `git log` fallback. |
| **`.github/scripts/preview-when-clear.sh`** | Empty-commit green-light tag when labels are clear and HEAD is not already tagged. |
| **`docs/register/house-now/automations/sa-complete-engineer.prompt.md`** | fail-look path: triage tape → fix Bucket A → if Bucket B, write BLOCKER + push without green-light tag → stop. Never put that tag on a seat commit. |
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
| **Vercel** | Preview deployment | Git push | Commit message contains `[vercel build]` (preview). Production always. |
| **runtime-doors** | Check status; optional `fail-look` label | Deploy URL, walk tape, PR labels | `repository_dispatch` `vercel.deployment.ready` |
| **Engineer** | `src/` fixes; `BLOCKER-NNN-*.md`; never the green-light tag | Full walk log / tape | `fail-look` automation |
| **wake-packet-seats (push)** | Labels; Resend email; maybe empty green-light commit | This-push diff; PR labels | Push to PR branch |
| **wake-packet-seats (release)** | Empty green-light commit if seats clear | `pull_request` `unlabeled` = `blocker` | Founder removes `blocker` |
| **Founder** | Removes `blocker` label; sets Vercel/Cursor secrets | Blocker email | Manual |

**Hold semantics:** label `blocker` = automations sleep, fail-look suppressed, Vercel does not preview (no green-light tag). **Release semantics:** label removed and seats clear → empty-commit green-light tag → new build picks up env + code → full walk suite.

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
| Vercel `ignoreCommand` (`.github/scripts/vercel-ignore.sh`) | **Real** — preview opt-in. |
| Vercel Deploy Hook (`VERCEL_DEPLOY_HOOK_URL`) | **Refuse** — hook would rebuild untagged HEAD and skip. |
| Cursor Cloud / Vercel env dashboards | **External** — linked from BLOCKER `**Resolve at:**`. |
| Travis Postgres / voice desk | **Out of scope** — no read/write for blockers. |

---

## 8. Verify

Walk [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md). Mode: Actions + labels + Vercel preview — not phone smoke.

| Step | Proves |
|------|--------|
| **1. Full-audit** | Inject or use a suite where an early walk fails and later walks still run. Log shows all N spec files executed. Tape teed. Check red. |
| **2. Triage + hold** | Engineer (or scripted simulation) fixes code, adds `BLOCKER-021-*.md`, pushes **without** the green-light tag. No Vercel deploy for that commit. PR gets `blocker`. Seat wakes stripped. Blocker email received. |
| **3. Release** | Founder clears ops, removes `blocker` label. Action empty-commits the green-light tag when seats are clear. New walk run on preview. With A fixed and B cleared → check green. |

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

1. **runtime-doors.yml** — skip fail-look while `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `blocker` is on. No bash regex classification. Full tape tee stays.
2. **wake-packet-seats.yml** — one seat label at a time; `blocker` already on → no seat labels; Pass strips seats then emerge; `preview-when-clear` + unlabeled-blocker jobs empty-commit the green-light tag when labels are clear.
3. **send-blocker-letter.py** — clone emerge script shape; subject `[BLOCKER] …`; parse `**Cause:**` from the file.
4. **sa-complete-engineer.prompt.md** — Bucket A/B triage + BLOCKER; never put the green-light tag on a seat commit.
5. **vercel.json + vercel-ignore.sh** — preview skip unless `[vercel build]`; production always.
6. **package.json** or **walks/README.md** — one explicit line: all specs run; no `--test-bail`.
7. Do **not** mint DB tables. Do **not** add Action regex triage. Do **not** boot Cursor on `blocker`. Do **not** fire a deploy hook as the preview go.
8. Computer-use or manual walk of **021 test sheet** on a PR that exercises all three beats when hooks/secrets are available.
