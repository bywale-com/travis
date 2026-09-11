# SYSTEMS-CHANGE-PACKET-036 — Circuit breaker (full-audit walks, Engineer triage, blocker hold)

**Number:** `036` — next systems packet is **037**. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#180](https://github.com/bywale-com/travis/pull/180)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-11  
**PM packet:** [`PM-PACKET-021-CIRCUIT-BREAKER.md`](./PM-PACKET-021-CIRCUIT-BREAKER.md)  
**Test:** [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md)  
**FACE:** No new plates. This cut is GitHub Actions + Vercel preview gate + register markdown. Staples — **runtime-doors** (Deployment Check) · **fail-look** (Engineer wake) · **blocker** (founder hold) · **`[vercel build]`** (preview green light).  
**Prior (do not remint):** **020** runtime walks + `runtime-doors` check · **023–035** product pipe · [`AUTOMATION-PACKET-CHAIN.md`](./AUTOMATION-PACKET-CHAIN.md) label gate · emerge letter (`send-emerge-letter.py`).  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

021 replaces brittle bash-regex triage in GitHub Actions with a dumb sensor + Engineer brain. Preview is opt-in. Founder ops blockers halt redeploy until cleared.

---

## 1. Intent

The cumulative walk suite (`npm run test:runtime`) is a **dumb sensor**: it runs every walk to completion, paints the Vercel Deployment Check red on any miss, and records the full tape. GitHub Actions **must not** classify root cause (no log greps for “hard limit” vs “Cannot use import”). The **Engineer** reads the complete tape on `fail-look`, fixes Bucket A plant misses in `src/`, and files Bucket B founder-ops blockers as register markdown. While a PR is in handoff or hold, Actions must not re-wake seats or green-light preview. Preview builds only when an Action empty-commits a message containing **`[vercel build]`**; production always builds. Blocker state is a **git-level contract** (markdown file + PR label + Resend mail) — not a Travis table.

---

## 2. Story

### Must

- **Law 0 — Preview only after handoffs.** Default preview skip. Production always builds. Green light = commit message contains **`[vercel build]`** (case-sensitive substring). Seat commits (SA, Engineer plant, PM Look, fail-look recut, BLOCKER hold) **must not** carry that tag.
- **Handoff / hold labels** on the open PR: `wake-sa` · `wake-engineer` · `wake-pm-look` · `fail-look` · `blocker`. One seat label at a time (`add_seat` strips the other three seat labels). While **any** of these five is on the PR: `runtime-doors` paints red but **does not** fresh-add `fail-look`; `preview-when-clear` **does not** empty-commit the green light.
- **Law 1 — Full-audit walks.** `npm run test:runtime` runs **all** `src/runtime/walks/*.spec.ts` to completion (`--test-concurrency=1`). No fail-fast abort of the suite. Full output is teed to `$RUNNER_TEMP/walks.txt`. Any failure → check `runtime-doors` is failure.
- **Law 2 — Engineer triage.** On `fail-look`, Engineer reads the **complete** walk tape and sorts every failing item into exactly two buckets:
  - **Bucket A (plant / code miss):** syntax, ESM/CJS, route exceptions, broken response shapes, missed grain.
  - **Bucket B (founder ops / platform blocker):** Cursor hard spend limit, missing preview secrets (`OPENAI_API_KEY`, `DATABASE_URL`, …), unwired preview that needs founder env work — not fixable in `src/` alone.
- **Law 3 — Circuit breaker.** If Bucket B is non-empty: fix Bucket A in `src/` if any, write `docs/register/BLOCKER-NNN-*.md`, commit **without** `[vercel build]`, push, **stop**. Do not green-light preview. Action labels `blocker`, strips seat wakes, mails founder. Founder clears ops, removes `blocker` label; when no handoff/hold labels remain, Action empty-commits `Preview [vercel build]`.
- **Blocker file contract** (minimum prose the Engineer writes):

  ```text
  # BLOCKER-NNN — <short cause>

  **PR:** <github PR URL>
  **When:** <UTC stamp>
  **Cause:** <one sentence — what on the tape failed and why it is not a code miss>
  **Required action:** <exact founder step — never a secret value>
  **Resolve at:** <direct URL — dashboard, Vercel env, Cursor settings>
  **Tape excerpt:**
  <quoted lines from walks.txt>
  ```

  Filename: `docs/register/BLOCKER-NNN-<SLUG>.md`. Not `*-RESOLVED.md` (that suffix is ignored by the Action gate).

- **Blocker mail:** `.github/scripts/send-blocker-letter.py` using existing Resend secrets (`EMERGE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`). Subject: `[BLOCKER] <Pocket> blocked — <Cause>`. Body: cause, required action, URL, tape excerpt. Same cheap Action as emerge — no Cursor boot.
- **Do not use `[skip ci]`** on seat commits. It silences GitHub Actions (labeling) as well as Vercel.

### Must-not

- Bash / grep **classification** of walk log lines in `runtime-doors.yml` (no “if hard limit then skip fail-look”).
- Mint `travis.initiative`, `travis.motion`, or any **blocker table** in Postgres.
- Deploy-hook URL or Vercel API trigger from seat commits.
- Green-light tag on SA, Engineer, PM Look, or BLOCKER commits.
- Boot Cursor automations while `blocker` is on the PR.
- Treat emerge as the blocker path.
- Remint 020 walk grain, 023–035 product pipe, or the emerge mailer.

### Chain

```text
Seat work on PR (no [vercel build])
  → handoff labels cycle (wake-sa → wake-engineer → wake-pm-look)
  → when all five handoff/hold labels off
  → preview-when-clear empty-commit "Preview [vercel build]"
  → Vercel preview builds
  → vercel.deployment.ready → runtime-doors
  → npm test + full test:runtime → tee walks.txt → paint check
  → red + idle PR → fresh-add fail-look → Engineer
  → Bucket A only: fix src/, push (no green light) → wake-pm-look when src/ lands
  → any Bucket B: BLOCKER-NNN.md + fixes, push (no green light) → label blocker + mail
  → founder clears ops, removes blocker label
  → blocker-release → preview-when-clear → green-light empty commit → walks rerun
```

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Blocker row in Postgres** | Blocker is founder paste time, not product state. Git file + PR label + email is enough. `initiative` / `motion` are ticket/work — not deploy gates. |
| **GitHub issue floor for blocker** | PM packet names Resend mail only for this cut. Issue floor from emerge considering doc is not required here. |
| **Automated blocker clearance** | Founder removes `blocker` label manually after ops fix. No API to “detect $2 topped up.” |
| **fail-look while Engineer is already woken** | `fail-look` is itself a hold label. Red deploy during Engineer triage must not stack another wake. |
| **Blocker file on deploy commit without label** | Hold is **label `blocker`**, applied by Action when the file lands in **this push**. Do not re-add the old “blocker file on checkout → skip fail-look” gate — handoff/hold label list is the contract. |
| **Classification helpers in `src/`** | Triage stays in the Engineer automation prompt, not product code. |

---

## 3. Requirements (extraction)

From PM-021 founder lock + three architecture laws + BUILD-PROTOCOL “Dumb runner, intelligent seat.” Not a second invention.

1. Confirm blocker does **not** need a Travis store → **refuse mint**. Name git-level contract.
2. Name preview trigger: `vercel.json` `ignoreCommand` + `[vercel build]` substring on **this commit’s** message (`VERCEL_GIT_COMMIT_MESSAGE`). Production bypasses skip.
3. Name blocker **release** trigger: `pull_request` / `unlabeled` / label `blocker` → `preview-when-clear.sh` when no handoff/hold labels remain.
4. Name full-audit: existing `test:runtime` script; no workflow fail-fast.
5. Delete regex triage from Actions; all failures → Engineer when PR idle.

No plates to mint from. Staples above are the shared labels between PM packet and this cut.

---

## 4. Inventory — quoted stood-up

### Walk runner (full suite, sequential)

```11:11:package.json
    "test:runtime": "tsx --test --test-concurrency=1 src/runtime/walks/*.spec.ts",
```

Five walks seeded: `type-send`, `type-walk-back`, `type-dest`, `voice-wrap`, `come-back` (`src/runtime/walks/README.md`). Node’s test runner reports all failures; `--test-concurrency=1` keeps one room cookie sequential.

### Deployment check (dumb sensor)

```42:51:.github/workflows/runtime-doors.yml
      - name: Sequential walks on this URL
        id: walks
        ...
          npm run test:runtime 2>&1 | tee "$RUNNER_TEMP/walks.txt"
```

Red check → `fail-look` **only when** PR has none of: `wake-sa`, `wake-engineer`, `wake-pm-look`, `fail-look`, `blocker` (branch draft on this PR).

### Preview gate (opt-in)

```1:4:vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "sh .github/scripts/vercel-ignore.sh"
}
```

```9:18:.github/scripts/vercel-ignore.sh
if [ "${VERCEL_ENV:-}" = "production" ]; then
  exit 1
fi
msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
if echo "$msg" | grep -q '\[vercel build\]'; then
  exit 1
fi
exit 0
```

Reads **only** `VERCEL_GIT_COMMIT_MESSAGE` — not `git log` ancestry.

### Green light after handoffs

```14:29:.github/scripts/preview-when-clear.sh
for hold in wake-sa wake-engineer wake-pm-look fail-look blocker; do
  ...
done
git commit --allow-empty -m "Preview [vercel build]"
```

Invoked from `wake-packet-seats.yml` jobs `preview-when-clear` (after label job) and `blocker-release` (`pull_request` / `unlabeled` / `blocker`).

### Blocker hold (Action, no LLM)

On **this push** diff matching `docs/register/BLOCKER-[0-9]+-*.md` (not `*-RESOLVED.md`):

- Label `blocker`
- Strip `fail-look`, `wake-sa`, `wake-engineer`, `wake-pm-look`
- Call `send-blocker-letter.py` when Resend secrets exist

If `blocker` already on PR → strip leftover seat labels; no new wakes (`wake-packet-seats.yml` L157–160).

### Engineer triage prompt (Bucket A / B)

```26:30:docs/register/house-now/automations/sa-complete-engineer.prompt.md
- **Bucket A (plant / code):** fix in `src/`. Verify with `npm test`.
- **Bucket B (founder ops):** ... file `docs/register/BLOCKER-NNN-*.md` ...
- If **any Bucket B:** commit code fixes + blocker **without** the preview green-light tag.
```

### Lib contract tests (branch draft)

`src/lib/circuit-breaker.test.ts` — asserts ignore script, preview-when-clear label list, runtime-doors handoff skip, Engineer prompt law. Runs under `npm test`.

---

## 5. Stores / fields / contracts

| Item | Layer | Decision |
|------|-------|----------|
| `travis.initiative` / `travis.motion` for blocker | map-only | **Refuse mint.** Blocker is not a ticket. |
| `docs/register/BLOCKER-NNN-*.md` | **Git contract** | **Add** shape above. Engineer (or SA blocked on key) writes. |
| PR label `blocker` | **GitHub contract** | **Add.** Action applies on blocker-file push. Founder removes to release. |
| PR labels `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` | GitHub (stood up) | **Keep.** One at a time. Part of handoff/hold set. |
| `[vercel build]` commit-message tag | **Vercel external contract** | **Add** as preview opt-in. |
| `vercel.json` `ignoreCommand` | Vercel | **Add** on this PR. |
| Resend mail for blocker | External (stood up for emerge) | **Reuse** same three GitHub secrets. |
| Walk tape file `$RUNNER_TEMP/walks.txt` | Ephemeral CI | **Keep.** Engineer reads from failed `runtime-doors` log / artifact. |

No SQL. No migration.

---

## 6. Runtime behavior

| Who | Writes | Reads | Trigger |
|-----|--------|-------|---------|
| **Vercel** | Preview deploy (when ignore step exits 1) | `VERCEL_GIT_COMMIT_MESSAGE`, `VERCEL_ENV` | Push with green-light commit |
| **`runtime-doors` Action** | Check status; optional `fail-look` label | Deploy URL, walk exit code, PR labels | `vercel.deployment.ready` |
| **`wake-packet-seats` Action** | Seat labels; `blocker`; green-light empty commit | This-push diff; PR labels | Push to PR branch; `unlabeled` `blocker` |
| **Engineer automation** | `src/` fixes; `BLOCKER-NNN.md` | Full walk tape on `fail-look` | Label `fail-look` or `wake-engineer` (SCP) |
| **Founder** | Removes `blocker` label after ops fix | Blocker email | Human |
| **SA** | This packet only | PM-021 | `wake-sa` |

Faceless: preview skip (default), handoff hold, blocker hold — no Travis UI control.

---

## 7. Ports

| Port | Real vs stand-in |
|------|------------------|
| Vercel Ignored Build Step | **Real** — `vercel-ignore.sh` |
| Vercel Deployment Check `runtime-doors` | **Real** — stood up 020 |
| GitHub PR labels + `gh` | **Real** — `WAKE_GITHUB_TOKEN` preferred |
| Resend email | **Real** when secrets set; label-only fallback |
| `send-blocker-letter.py` | **Must plant** — referenced by workflow; **missing on branch at SA sign** |
| Cursor / OpenAI / Neon on preview | **Live external** — Bucket B when missing |

---

## 8. Verify

1. **`npm test`** — `src/lib/circuit-breaker.test.ts` passes (preview gate + workflow shape + Engineer prompt).
2. **Full-audit** — force an early walk fail; confirm later walks still run and full summary appears in `walks.txt` (021 test §1).
3. **Idle red** — with no handoff/hold labels, failed `runtime-doors` fresh-adds `fail-look`.
4. **Handoff skip** — with `wake-engineer` or `fail-look` on PR, red deploy does **not** fresh-add `fail-look`.
5. **Bucket B hold** — Engineer push with `BLOCKER-021-*.md` without `[vercel build]` → label `blocker`, seat wakes stripped, email sent (021 test §2).
6. **Release** — founder removes `blocker`; no other handoff labels → empty commit `Preview [vercel build]` → preview builds (021 test §3).
7. **Production** — merge to main still builds regardless of commit message.

PM walk sheet: [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md).

---

## 9. Out of scope

- Product pipe changes (023–035). Do not remint.
- Minting blocker rows in Postgres.
- GitHub issue floor for blocker (emerge-only unless founder seats it later).
- Playwright `unwired-glass.spec.ts` (020 named silence — different problem).
- Automated detection of founder ops completion (spend topped up, secret propagated).
- Webhook / SSE room bus (023 silence).
- Changing emerge letter shape.
- **`[skip ci]`** as the skip mechanism.

---

## 10. Engineer plant list (this PR)

Branch already drafts much of the cut. **Finish** — do not remint working pieces.

| Artifact | State on branch | Action |
|----------|-----------------|--------|
| `vercel.json` + `vercel-ignore.sh` | Draft | **Keep** — verify against §8.1 |
| `preview-when-clear.sh` | Draft | **Keep** |
| `wake-packet-seats.yml` blocker + preview jobs | Draft | **Keep** — ensure paths include `BLOCKER-*.md` |
| `runtime-doors.yml` handoff/hold skip | Draft | **Keep** — no log greps |
| `sa-complete-engineer.prompt.md` triage | Draft | **Keep** |
| `circuit-breaker.test.ts` | Draft | **Keep** — extend if script shape shifts |
| `.github/scripts/send-blocker-letter.py` | **Missing** | **Plant** — mirror `send-emerge-letter.py`; parse blocker markdown for subject/body |
| `docs/register/AUTOMATION-PACKET-CHAIN.md` § Blocker | Still “considering” | **Update** blocker section to **planted** when mail works |

Commit and push on **this PR**. Do **not** put `[vercel build]` on the plant commit. After plant + handoffs clear, let Action green-light preview.
