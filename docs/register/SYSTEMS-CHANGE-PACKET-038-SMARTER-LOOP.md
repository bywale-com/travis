# SYSTEMS-CHANGE-PACKET-038 — Smarter loop (N-red escalate)

**Number:** `038` — next systems packet is **039**. Never reuse.  
**Status:** **Signed.** Plant on this PR ([#201](https://github.com/bywale-com/travis/pull/201)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-15 (founder go on PM-022).  
**PM packet:** [`PM-PACKET-022-SMARTER-LOOP.md`](./PM-PACKET-022-SMARTER-LOOP.md)  
**Test:** [`PM-PACKET-022-SMARTER-LOOP-TEST.md`](./PM-PACKET-022-SMARTER-LOOP-TEST.md)  
**Work order:** [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md)  
**Outside prompt (founder Save+Activate when ready):** [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md)  
**Prior (do not remint):** **037** Look File → `wake-engineer` · **020** doors · **086** fail-look · **092** `previewing` · **093** gated preview.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

036 stays the unsigned hole for PM-020. Do not steal **039**. Look File (021) is a different door — never `outside-look` from File.

---

## 1. Intent

After **N = 4** consecutive current-head `runtime-doors` reds on the **same open PR** (idle, not stale deploy SHA), `runtime-doors` fresh-adds **`outside-look`** instead of **`fail-look`**. That is the only Action wake of the outside agent. Reds **1–3** still fresh-add **`fail-look`** as today. Log · Look File remains **021** → **`wake-engineer`** — never `outside-look` from File.

Count lives on GitHub issue timeline `labeled` events. No Travis table.

---

## 2. Story

### Must

- Count source: `gh api repos/${GITHUB_REPOSITORY}/issues/${pr}/timeline --paginate`. Filter `event == "labeled"`. **Not** check-runs. **Not** workflow run history.
- Reset timestamp: newer of last `emerge` or `outside-look` **labeled** event on this PR; if neither exists, epoch (`1970-01-01T00:00:00Z`) — count all historical `fail-look` labels on the PR.
- On red: `fail_count` = `fail-look` labeled events after reset. This sitting is `fail_count + 1`. If `>= 4` → `outside-look`; else → `fail-look`.
- Stale-SHA reds: unchanged — workflow compares `client_payload.git.sha` to PR `headRefOid` **before** calling the count script. Mismatch → exit 0, no label. Stale deploys never increment.
- Hold labels unchanged: if `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `outside-look` / `blocker` / `previewing` on PR → no new label.
- Fresh-add = remove label then add (label-added trigger).
- Script: `.github/scripts/runtime-doors-red-label.sh` (override N via `RUNTIME_DOORS_ESCALATE_N` for tests only; production default **4**).
- Keep Live in `test:preflight` and `runtime-doors`.
- **`outside-look` hold name** from 021 recut is sufficient — no new hold surfaces. Engineer B and preview mutex already stop while `outside-look` is on.

### Must-not

- Mint a counter table or telemetry store.  
- Add `outside-look` from Look File (`look-github.ts`).  
- Remove `outside-look` from hold lists (021 planted the name).  
- Remint 037 / Look chrome / 020 walks.  
- Use check-runs or Actions run count as the N source.  
- Save+Activate the Cursor `outside-look` automation from Engineer (founder ops).

### Chain

```text
runtime-doors red (current-head, idle)
        ↓
stale SHA? → stop (no label)
        ↓
hold label on PR? → stop (no label)
        ↓
runtime-doors-red-label.sh → timeline count
        ↓
  fail_count + 1 < 4 → fresh-add fail-look → Engineer B
  fail_count + 1 >= 4 → fresh-add outside-look → outside agent (founder automation)
        ↓
outside sitting completes → remove outside-look
  plant done → nothing extra
  plant incomplete → fail-look for Engineer B
```

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Save+Activate Cursor `outside-look`** | Founder ops after plant. Action only creates the label. |
| **`fail-look` after complete outside plant** | Work order § labels — outside agent's job. |
| **`travis.red_count` table** | GitHub timeline is the store. |
| **Look File wake** | 021 → `wake-engineer`. Different door. |

---

## 3. Requirements (extraction)

From PM-022 founder lock + technical cut. Not a second invention.

1. N = **4** (Architect default). Override only in tests via env.
2. Count = issue timeline `labeled` events for `fail-look` after reset. Reset on `emerge` or `outside-look` labeled.
3. Stale SHA guard stays in workflow, not in the script — script only runs when deploy SHA matches PR head.
4. `outside-look` hold lists planted by 021 recut are enough — doors, green-light, and seat strip already include the name.
5. Look (021) and Smarter loop (022) are split agents: File never adds `outside-look`; doors never add `wake-engineer` from the N-count path.

---

## 4. Inventory — quoted stood-up (this PR)

### Count script (plant target)

```1:25:.github/scripts/runtime-doors-red-label.sh
#!/usr/bin/env bash
# PM-022 / SCP-038: on a current-head runtime-doors red, choose fail-look vs outside-look.
...
timeline=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${pr}/timeline" --paginate 2>/dev/null || echo "[]")
...
if [[ "$next" -ge "$N" ]]; then
  echo "outside-look"
else
  echo "fail-look"
fi
```

### Stale SHA + hold gate (before script)

```215:229:.github/workflows/runtime-doors.yml
          head_sha=$(gh pr view "$pr" --json headRefOid --jq .headRefOid)
          if [[ "$sha" != "$head_sha" ]]; then
            echo "Deploy $sha is stale; PR #$pr is now $head_sha. No fail-look."
            exit 0
          fi
          ...
          label=$(bash .github/scripts/runtime-doors-red-label.sh "$pr")
```

### `outside-look` holds — sufficient (021 name, no 022 add)

| Surface | Location |
|---------|----------|
| Red-label idle gate | `runtime-doors.yml` L222 |
| Green-light mutex | `.github/scripts/preview-when-clear.sh` L37 |
| Seat strip | `wake-packet-seats.yml` L131 |

Doors do **not** need a new hold surface for 022. The 021 recut already named `outside-look` in all three lists.

### Look File — must not add `outside-look`

037 recut: `look-github.ts` fresh-adds **`wake-engineer`**, never `outside-look`. Delayed arm from unarmed `<!-- travis-look -->` also uses `wake-engineer`. Smarter loop owns the only `outside-look` add path (doors red step).

---

## 5. Stores / fields / contracts

| Item | Layer | Action |
|------|-------|--------|
| **`travis.red_count` (or any counter table)** | Named silence | **Refuse.** Count is GitHub timeline. |
| **GitHub issue timeline `labeled` events** | External contract | **Use.** `fail-look`, `emerge`, `outside-look` label names. Paginated `gh api`. |
| **PR labels `fail-look` / `outside-look`** | External contract | **Write** via `gh pr edit` fresh-add. Actor = `WAKE_GITHUB_TOKEN`. |
| **`RUNTIME_DOORS_ESCALATE_N`** | Env (test only) | Optional override; default 4. Not a Travis store. |

---

## 6. Runtime behavior

| Who | When | What |
|-----|------|------|
| **`runtime-doors` workflow** | Red or cancelled, after walks | Resolve open PR for deploy SHA; stale/hold checks; call script; fresh-add chosen label. |
| **`runtime-doors-red-label.sh`** | Called by workflow only | Read timeline; emit `fail-look` or `outside-look` on stdout. |
| **Engineer B automation** | `fail-look` labeled | One sitting recut on same PR. Stops while `outside-look` on. |
| **Outside agent automation** | `outside-look` labeled | Diagnose / plant per work order. Founder must Save+Activate. |
| **Founder** | After outside plant | Save+Activate `outside-look` Cursor automation (silence). |

Triggers: label-added on PR (fresh-add). Not issue comments. Not check-run webhooks for count.

---

## 7. Ports

| Port | Real vs stand-in |
|------|------------------|
| **`gh api …/issues/{n}/timeline`** | Real — GitHub REST issue timeline. Paginate. |
| **`gh pr view` / `gh pr edit`** | Real — label fresh-add. |
| **`WAKE_GITHUB_TOKEN`** | Real — same PAT as seat labels. Unset → bot actor; B may not wake (existing 086 law). |
| **Cursor `outside-look` automation** | Stand-in until founder Save+Activates. Label creation is real; agent boot is founder ops. |

---

## 8. Verify

| Sensor | What |
|--------|------|
| **`src/lib/smarter-loop.test.ts`** | Script references timeline, N=4, both labels; workflow calls script; red step does not hard-code only `fail-look`. |
| **`npm run test:preflight`** | Unit + Live + doors wiring. |
| **Human** | [`PM-PACKET-022-SMARTER-LOOP-TEST.md`](./PM-PACKET-022-SMARTER-LOOP-TEST.md) — three reds → `fail-look`; fourth → `outside-look`; stale SHA skipped; Live in both sensors. |

Look door regressions are **021**, not this sheet.

---

## 9. Out of scope

- Look chrome, `POST /look`, GitHub seed (037).  
- Mint `travis.look` or any table.  
- Save+Activate outside automation.  
- Remint 020 walks, dest mail, stream-intent.  
- Cousin PR.  
- Append SA/PM logs from Engineer.

---

## 10. Engineer file plan

| File | Change |
|------|--------|
| `.github/scripts/runtime-doors-red-label.sh` | Timeline count → stdout label name |
| `.github/workflows/runtime-doors.yml` | Call script on red; fresh-add chosen label |
| `src/lib/smarter-loop.test.ts` | Greps script + workflow wiring |
| `PR-AUTOMATION-RULES.md` | 4th red → `outside-look` |
| `WORK-ORDER-OUTSIDE.md` | Park → live count |

Do not edit `outside-look.prompt.md` except cross-links. Do not append SA/PM logs from Engineer.
