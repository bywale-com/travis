# SYSTEMS-CHANGE-PACKET-038 — Smarter loop (N-red escalate)

**Number:** `038` — next systems packet is **039**. Never reuse.  
**Status:** **Signed.** Plant on this PR.  
**Seat:** Systems Analyst. Engineer pastes this.  
**When:** 2026-09-15 (founder go on PM-022).  
**PM packet:** [`PM-PACKET-022-SMARTER-LOOP.md`](./PM-PACKET-022-SMARTER-LOOP.md)  
**Test:** [`PM-PACKET-022-SMARTER-LOOP-TEST.md`](./PM-PACKET-022-SMARTER-LOOP-TEST.md)  
**Work order:** [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md)  
**Outside prompt (founder Save+Activate when ready):** [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md)  
**Prior (do not remint):** **037** Look File → `wake-engineer` · **020** doors · **086** fail-look · **092** `previewing` · **093** gated preview.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.

---

## 1. Intent

After **N = 4** consecutive current-head `runtime-doors` reds on the **same open PR** (idle, not stale deploy SHA), `runtime-doors` fresh-adds **`outside-look`** instead of **`fail-look`**. That is the only Action wake of the outside agent. Reds **1–3** still fresh-add **`fail-look`** as today. Log · Look File remains **021** → **`wake-engineer`** — never `outside-look` from File.

---

## 2. Must

- Count source: GitHub issue timeline `labeled` events on the PR (`gh api …/issues/{pr}/timeline`). No Travis table.
- Reset timestamp: newer of last `emerge` or `outside-look` **labeled** event; if neither, epoch (count all `fail-look` labels on the PR).
- On red: `fail_count` = `fail-look` labels after reset. This sitting is `fail_count + 1`. If `>= 4` → `outside-look`; else → `fail-look`.
- Stale-SHA reds: unchanged — no label (existing guard before this step).
- Hold labels unchanged: if `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `outside-look` / `blocker` / `previewing` on PR → no new label.
- Fresh-add = remove label then add (label-added trigger).
- Script: `.github/scripts/runtime-doors-red-label.sh` (override N via `RUNTIME_DOORS_ESCALATE_N` for tests only).
- Keep Live in `test:preflight` and `runtime-doors`.

## 3. Must-not

- Mint a counter table.  
- Add `outside-look` from Look File (`look-github.ts`).  
- Remove `outside-look` from hold lists (021 planted the name).  
- Remint 037 / Look chrome / 020 walks.

## 4. Silence

| Silence | Why |
|---------|-----|
| Save+Activate Cursor `outside-look` | Founder ops after plant. Action only creates the label. |
| `fail-look` after complete outside plant | Work order § labels — outside agent’s job. |

---

## 5. Engineer file plan

| File | Change |
|------|--------|
| `.github/scripts/runtime-doors-red-label.sh` | Timeline count → stdout label name |
| `.github/workflows/runtime-doors.yml` | Call script on red; fresh-add chosen label |
| `src/lib/smarter-loop.test.ts` | Greps script + workflow wiring |
| `PR-AUTOMATION-RULES.md` | 4th red → `outside-look` |
| `WORK-ORDER-OUTSIDE.md` | Park → live count |

Do not edit `outside-look.prompt.md` except cross-links. Do not append SA/PM logs from Engineer.
