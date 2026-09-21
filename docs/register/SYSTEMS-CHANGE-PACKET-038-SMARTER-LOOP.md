# SYSTEMS-CHANGE-PACKET-038 — Smarter loop (N-red escalate)

**Number:** `038` — next systems packet is **039**. Never reuse. Do not reuse **036** (unsigned 020 hole).  
**Status:** **Signed.** Recut 2026-09-15 (count port + live path). Plant the recut on this PR ([#201](https://github.com/bywale-com/travis/pull/201)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** First sign 2026-09-15 21:58 UTC. Recut 2026-09-15 22:05 UTC (count port + live path).  
**PM packet:** [`PM-PACKET-022-SMARTER-LOOP.md`](./PM-PACKET-022-SMARTER-LOOP.md)  
**Test:** [`PM-PACKET-022-SMARTER-LOOP-TEST.md`](./PM-PACKET-022-SMARTER-LOOP-TEST.md)  
**Work order:** [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md)  
**Outside prompt (founder Save+Activate when ready):** [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md)  
**FACE:** none. 022 is not a desk plate. Look plates stay **021** ([`PLATES-LOOK.md`](./PLATES-LOOK.md) LK1–LK2). Do not remint chrome.  
**Staples (not scenery):** **`fail-look`** · **`outside-look`** · **`emerge`**. Shared by the PR, [`PR-AUTOMATION-RULES.md`](./PR-AUTOMATION-RULES.md), and the work order.  
**Prior (do not remint):** **037** Look File → `wake-engineer` · **020** doors walks · dest mail / stream-intent · **086** fail-look · **092** `previewing` · **093** gated preview.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## 1. Intent

After **N = 4** idle current-head `runtime-doors` reds on the **same open PR** (not a stale deploy SHA), the red step fresh-adds **`outside-look`** instead of **`fail-look`**. That is the only Action wake of the outside agent. Reds **1–3** still fresh-add **`fail-look`**. Count is GitHub Issue Timeline **`labeled`** events — not check-runs, not a Travis table. Log · Look File remains **021** → **`wake-engineer`**. `outside-look` already on is enough hold; doors need no extra hold names.

---

## 2. Story

### Must

- Count source: `GET /repos/{owner}/{repo}/issues/{pr}/timeline` (`Accept: application/vnd.github+json`, `per_page=100`, follow `Link` rel=next). Filter `event == "labeled"`. Fields: `created_at`, `label.name`.
- Reset timestamp: max `created_at` among timeline **`labeled`** events whose `label.name` is `emerge` or `outside-look`. If none: `1970-01-01T00:00:00Z`.
- `fail_count` = number of timeline **`labeled`** events with `label.name == "fail-look"` and `created_at > reset`. This sitting is `fail_count + 1`. If `>= 4` → stdout/add **`outside-look`**; else **`fail-look`**.
- Green must **fresh-add** `emerge` (remove then add) so a new `labeled` event exists. A no-op `--add-label` when `emerge` is already on does **not** reset.
- Stale-SHA reds: `client_payload.git.sha != headRefOid` → keep `previewing`, **do not** add `fail-look` or `outside-look`, **do not** consult the timeline for a label. Check-run may still be red; it does not increment.
- Hold list unchanged: if `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `outside-look` / `blocker` / `previewing` is on → no new red label. **`outside-look` already on is enough.** Do not add `emerge` to holds.
- Live count runs in the **`runtime-doors.yml` `run:` block** (repository_dispatch executes **this file from `main`**). Do not `bash` a script from the deploy-SHA checkout as the live path — in-flight PRs would miss the file and skip the label.
- Fresh-add the chosen label (`remove` then `add`) so the Cursor label-added trigger fires.
- Cancelled or timed-out doors: same red path (`if: failure() || cancelled()`).
- Keep Live in `test:preflight` and `runtime-doors`. Dest canary stays acknowledge-only.
- Token for the add stays **`WAKE_GITHUB_TOKEN`** (bot `GITHUB_TOKEN` does not wake Cursor). Timeline GET may use the same `GH_TOKEN`.

### Must-not

- Mint `travis.smarter_loop`, `travis.red_count`, or any telemetry table. N is an immutable wall (4), not a repo variable.
- Count `GET /repos/{owner}/{repo}/commits/{sha}/check-runs`, Actions workflow runs, or commit statuses.
- Use `GET /repos/{owner}/{repo}/issues/{pr}/events` as the count port (labeled exists there too; one contract: **timeline**).
- Count `unlabeled` events. Removing `fail-look` does not decrement.
- Add `outside-look` from Look File (`look-github.ts`), delayed Look arm, or `preview-when-clear.sh`.
- Remove `outside-look` from hold lists (037 planted the name).
- Remint 037 chrome / `POST /look` / dest mail / stream-intent / 020 walks.
- Save+Activate the `outside-look` Cursor automation (founder ops).
- Steal **039**. Reuse **036**.

### Chain

```text
vercel.deployment.ready → runtime-doors (workflow from main)
        ↓
checkout deploy SHA (walks / units)
        ↓
stale SHA? → keep previewing; stop (no label)
        ↓
clear previewing (current-head only)
        ↓
delayed Look arm (unarmed <!-- travis-look -->) → maybe wake-engineer
        ↓
job failed or cancelled? else emerge (fresh-add) and stop
        ↓
any hold on (incl. outside-look / wake-engineer / fail-look / previewing / …)? → stop
        ↓
timeline labeled events (paginate) → reset / fail_count+1
        ↓
>= 4 → fresh-add outside-look
<  4 → fresh-add fail-look
```

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| Travis counter table | GitHub timeline `labeled` is the store. |
| Repo/Actions variable for N | Immutable wall. Test-only env on a **unit helper** is not a product control. |
| Save+Activate Cursor `outside-look` | Founder ops after merge. Action only creates the label. |
| `fail-look` after a complete outside plant | Work order § labels — outside agent’s job. |
| New FACE / Look chrome | 022 is not a desk plate. LK1–LK2 stay 021. |
| Dest-to-Engineer rewrite | Canary line stays. |

---

## 3. Requirements (extraction)

From PM-022 founder lock + technical cut. Not a second invention.

1. After a certain number of **production** `runtime-doors` failures, wake the **outside** agent on the **failing PR** — not Engineer B, not Look File.
2. N = **4**. Reds 1–3 still `fail-look`.
3. Count is cheap GitHub timeline, not a Travis table.
4. Reset on green (`emerge` labeled) or an outside sitting (`outside-look` labeled).
5. Stale SHA never increments. Idle holds never increment.
6. Work order without tripping wires stays; dest canary stays; Live stays in both sensors.

---

## 4. Inventory — quoted stood-up (this PR)

### Count port (ascribe; plant on this branch is the miss)

GitHub REST [List timeline events for an issue](https://docs.github.com/en/rest/issues/timeline):

```
GET /repos/{owner}/{repo}/issues/{issue_number}/timeline
Accept: application/vnd.github+json
per_page: 100 (max). Default 30. Follow Link rel=next until absent.
```

[Issue event types — labeled](https://docs.github.com/en/rest/using-the-rest-api/issue-event-types#labeled): available on **both** issue-events and timeline. Properties used: `event`, `created_at`, `label.name`. **`unlabeled` does not decrement.**

`gh api --paginate` follows that `Link` header. **`gh api --paginate --jq '.[] | …'`** applies jq **per page**. Dumping concatenated page arrays into one `jq` reads only the first page (default 30) — undercount, and can miss a recent `emerge` if the timeline is older-first.

This branch’s helper still dumps pages then pipes to jq:

```9:18:.github/scripts/runtime-doors-red-label.sh
timeline=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${pr}/timeline" --paginate 2>/dev/null || echo "[]")
...
fail_count=$(echo "$timeline" | jq --arg reset "$reset_ts" '
  [.[] | select(.event == "labeled" and .label.name == "fail-look" and .created_at > $reset)] | length
')
```

And the live red step **calls that file on the deploy SHA**:

```229:230:.github/workflows/runtime-doors.yml
          label=$(bash .github/scripts/runtime-doors-red-label.sh "$pr")
          echo "Red #$pr is fail-look count+1 → label ${label} (N=${RUNTIME_DOORS_ESCALATE_N:-4})."
```

Workflow comment at file top: `repository_dispatch always runs THIS FILE FROM main` while checkout is the deploy SHA. After merge, an in-flight PR whose tree lacks the script would crash the red step (`set -euo pipefail`) and **add neither label**. Recut: live jq in the YAML `run:` block.

### Stale SHA never increments (stands)

```215:218:.github/workflows/runtime-doors.yml
          head_sha=$(gh pr view "$pr" --json headRefOid --jq .headRefOid)
          if [[ "$sha" != "$head_sha" ]]; then
            echo "Deploy $sha is stale; PR #$pr is now $head_sha. No fail-look."
            exit 0
```

This exit is **before** any timeline call / label create. A red check-run on a stale SHA does not write a `labeled` event.

### Holds — `outside-look` already on is enough (037 planted; keep)

```221:227:.github/workflows/runtime-doors.yml
          pr_labels=$(gh pr view "$pr" --json labels --jq '.labels[].name')
          for hold in wake-sa wake-engineer wake-pm-look fail-look blocker previewing outside-look; do
            if echo "$pr_labels" | grep -qx "$hold"; then
              echo "PR #$pr has $hold (handoff/hold). No fail-look."
              exit 0
```

Same names in `.github/scripts/preview-when-clear.sh` L37 and `wake-packet-seats.yml`. Do not add more. While `outside-look` is on, later reds skip — no second outside wake, no `fail-look` stealing the sitting.

Delayed Look arm still runs **before** the red label (`preview-mutex.test.ts` order). If it fresh-adds `wake-engineer`, the hold skip fires — 022 does not steal a Look seed.

### Look File must not add `outside-look` (037 recut; stands)

```12:13:src/server/look-github.ts
const LOOK_WAKE_LABEL = "wake-engineer";
```

```176:177:src/server/look-github.ts
  await removeLabel(token, owner, repo, n, LOOK_WAKE_LABEL);
  await addLabel(token, owner, repo, n, LOOK_WAKE_LABEL);
```

Do not recut Look this sitting.

### Emerge does not fresh-add (reset miss)

```342:343:.github/workflows/runtime-doors.yml
          gh label create emerge --color CCCCCC --description "Doors Pass — human test" 2>/dev/null || true
          gh pr edit "$pr" --add-label emerge && echo "Labeled #$pr emerge" || echo "Could not label emerge"
```

If `emerge` is already on, GitHub emits **no** new `labeled` event. Recut: `--remove-label emerge` then `--add-label emerge` on the success path (current-head only; stale already exited).

### Dest canary (do not remint)

```1:3:src/runtime/dest-canary.ts
export const DEST_CANARY =
  "Engineer, this is a Travis runtime canary. Acknowledge only. Do not edit files, commit, push, or update the handoff.";
```

---

## 5. Stores / fields / contracts

### Add

None in Travis SQL.

### Change

| What | How |
|------|-----|
| GitHub Issue Timeline (external contract) | **Read** `labeled` events on the open PR. Not a Travis table. |
| PR labels `fail-look` / `outside-look` | Fresh-add one per idle current-head red, chosen by count. |
| PR label `emerge` | Fresh-add on current-head green so reset is a real `labeled` event. |
| `.github/workflows/runtime-doors.yml` | Live count **in the red `run:` block**. Fresh-add emerge on success. Keep stale/hold/Look-arm order. Do not `bash` the deploy-SHA script as the live path. |
| `.github/scripts/runtime-doors-red-label.sh` | Optional unit helper with the **same** jq. Not the live path. If kept: `--paginate --jq '.[] \| …'`, never dump concatenated arrays. |
| `src/lib/smarter-loop.test.ts` | Prove query shape + emerge fresh-add + hermetic count (fake `gh`). |
| `PR-AUTOMATION-RULES.md` / `WORK-ORDER-OUTSIDE.md` Count section | Human table already names 4th → `outside-look`. Un-hold “022 — held”. |

### Refuse

| What | Why |
|------|-----|
| `travis.*` counter / telemetry | Timeline is the store. |
| Check-runs / Actions runs as count | Stale SHA reds would increment. |
| `/issues/{n}/events` as a second count | Same `labeled` type; one port: timeline. |
| `RUNTIME_DOORS_ESCALATE_N` as a GitHub Variable | Test-only on a helper, not house law. Live N = 4. |
| New hold names | `outside-look` on the existing list is enough. |
| `travis.look` / Look File → `outside-look` | 037. |
| New FACE | Not a desk plate. |

---

## 6. Runtime behavior

**Who writes**

| Writer | What |
|--------|------|
| `runtime-doors` red step (main’s YAML) | Fresh-add `fail-look` or `outside-look`. |
| `runtime-doors` success step | Fresh-add `emerge`. |
| Outside agent (work order) | Remove `outside-look` on push. Add `fail-look` only if plant incomplete. |
| Look File / delayed arm | **`wake-engineer` only.** Never `outside-look`. |

**Who reads**

| Reader | What |
|--------|------|
| Red step | Timeline `labeled` events + current PR labels (holds). |
| Cursor Automation `outside-look` | Label-added on the failing PR (founder Save+Activate). |
| Engineer B | `fail-look` / `wake-engineer` as today. Stops while `outside-look` is on (already in B’s prompt). |

**Triggers (exact live jq)**

One paginated fetch, then local filter. Do not dump raw `--paginate` JSON into a second `jq`.

```bash
labeled=$(gh api --paginate \
  "repos/${GITHUB_REPOSITORY}/issues/${pr}/timeline?per_page=100" \
  -H "Accept: application/vnd.github+json" \
  --jq '.[] | select(.event=="labeled") | [.created_at,.label.name] | @tsv' \
  2>/dev/null || true)

reset_ts=$(printf '%s\n' "$labeled" \
  | awk -F'\t' '$2=="emerge" || $2=="outside-look" {print $1}' \
  | sort | tail -n 1)
reset_ts="${reset_ts:-1970-01-01T00:00:00Z}"

fail_count=$(printf '%s\n' "$labeled" \
  | awk -F'\t' -v r="$reset_ts" '$2=="fail-look" && $1>r {n++} END {print n+0}')

next=$((fail_count + 1))
if [[ "$next" -ge 4 ]]; then
  label=outside-look
else
  label=fail-look
fi
```

ISO-8601 `created_at` strings compare lexicographically. `$1>r` excludes the reset event itself.

Then existing fresh-add:

```bash
gh pr edit "$pr" --remove-label "$label" || true
gh pr edit "$pr" --add-label "$label"
```

**Look arm vs 022:** keep delayed `wake-engineer` **before** this block. A Look seed on a red sitting is Engineer B, not the outside agent.

**After merge:** in-flight PRs without this branch’s script still escalate, because the jq lives in main’s workflow text.

---

## 7. Ports

| Port | Real vs stand-in |
|------|------------------|
| GitHub Issue Timeline `GET …/issues/{pr}/timeline` | **Real.** Count contract. |
| GitHub PR labels (`gh pr edit`) | **Real.** Wake + hold. |
| `WAKE_GITHUB_TOKEN` on Actions | **Real.** Label actor. Fallback bot will not wake Cursor — same as fail-look today. |
| Check-runs / Actions runs | **Real CI paint.** **Not** the count port. |
| `GET …/issues/{pr}/events` | **Real.** **Do not use.** |
| Cursor Automation Engineer B (`fail-look` / `wake-engineer`) | **Real.** Already Save+Activated. |
| Cursor Automation `outside-look` | **Stand-in until founder Save+Activate.** Action still creates the label. |
| `CURSOR_API_KEY` | Untouched. Server-side only. |
| Travis SQL | **Untouched.** No mint. |

---

## 8. Verify

**Units** (`src/lib/smarter-loop.test.ts`):

1. Live YAML red `run:` contains `issues/${pr}/timeline` (or the escaped equivalent), `--paginate`, `--jq '.[]`, and does **not** `bash .github/scripts/runtime-doors-red-label.sh` as the live path.
2. Success path fresh-adds `emerge` (`--remove-label emerge` then `--add-label emerge`).
3. Hermetic: fake `gh` returning two pages worth of TSV/`--jq` lines — 3 `fail-look` after reset → stdout `fail-look`; 3 `fail-look` → 4th is `outside-look`; an `emerge` after three `fail-look`s → next is `fail-look`.
4. Keep hold-list `outside-look` greps in `circuit-breaker.test.ts` / `preview-mutex.test.ts`. Keep Look File never-`outside-look` in `look-miss.test.ts`.

**Workflow wiring:** stale SHA still `exit 0` before the count. Holds still skip. Delayed Look arm still before the red label. `if: failure() \|\| cancelled()` still wraps the red step.

**Runtime walk:** none new. 022 is not a desk use. Do not add a walk that waits on GitHub labels.

**Preflight:** Live still in `test:preflight` and `runtime-doors`. Dest canary line unchanged.

**Human (sheet 022):** reds 1–3 `fail-look`; 4th current-head idle red `outside-look` not `fail-look`; stale SHA skipped; Live still in both sensors.

---

## 9. Out of scope

- Packet **021** Look chrome / File wake / `look/{n}` draft.
- Save+Activate `outside-look` (founder).
- Remint 020 walks, dest mail, stream-intent, 092/093 mutex.
- Hear / Skip / Next. Cousin PR. `PHASE-ONE-LOG` append. SQL migration.
- Product cap. Comment “ready” on GitHub.

---

## 10. File plan (Engineer)

| File | What goes in (not code) | Why a file |
|------|-------------------------|------------|
| `.github/workflows/runtime-doors.yml` | Live jq in the red `run:` block. Fresh-add `emerge` on green. Do not bash the deploy-SHA script as the live path. Keep stale / holds / Look-arm order. | repository_dispatch runs this file from main. |
| `.github/scripts/runtime-doors-red-label.sh` | Optional helper with the **same** jq for the hermetic unit. Or delete and drive the unit from a fixture next to the test. | First sensor. |
| `src/lib/smarter-loop.test.ts` | Query shape + emerge fresh-add + fake-`gh` count. | First sensor. |
| `docs/register/WORK-ORDER-OUTSIDE.md` | Un-hold § Count (022 is live). | Outside agent must not think every red is still `fail-look`. |
| `docs/register/ENGINEER-HANDOFF.md` | N=4; live path is YAML; Look File still `wake-engineer`; founder Save+Activates `outside-look` after merge. | Sheet Before. |

Do not edit `look-github.ts`, `outside-look.prompt.md` (except a one-line cross-link if the work-order section moves), dest canary, Look chrome, or SA/PM logs.

---

## 11. Numbering

| # | Meaning |
|---|---------|
| **036** | Named for PM-020. Never signed. **Do not reuse.** |
| **037** | Look File → `wake-engineer`. Planted. |
| **038** | This packet. Recut count port + live path. |
| **039** | Next. Do not steal. |
