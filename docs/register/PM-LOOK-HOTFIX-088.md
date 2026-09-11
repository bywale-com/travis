# PM look — 088 Do not fail-look founder ops

**Packet:** HOTFIX-088  
**Change packet:** none (hotfix)  
**PR:** https://github.com/bywale-com/travis/pull/174  
**Preview:** none (hang — no glass)  
**Verdict:** Pass

## Look

Lock ([`HOTFIX-088-FAIL-LOOK-OPS-SKIP.md`](./HOTFIX-088-FAIL-LOOK-OPS-SKIP.md)):

> Red `runtime-doors` fresh-adds `fail-look`. Dest Cursor hard limit and unwired are founder ops. Engineer cannot recut them. The loop kept booting B.
>
> 1. `runtime-doors.yml` tees the walk log. If the miss is unwired or Cursor hard limit and not a Travis generate miss, do not add `fail-look`.
> 2. B prompt: that miss → stop. Do not push.

Plant (Engineer handoff: **088 fail-look skip**, commit `d66f978`):

**1. Walk log tee + founder-ops skip**

```36:69:.github/workflows/runtime-doors.yml
      - name: Sequential walks on this URL
        id: walks
        ...
          set -o pipefail
          npm run test:runtime 2>&1 | tee "$RUNNER_TEMP/walks.txt"
      ...
          log="${WALK_LOG:-}"
          if [[ -f "$log" ]]; then
            if grep -qE "Cannot use import|did not speak|run error on tape: Travis" "$log"; then
              echo "Engineer miss on tape. fail-look."
            elif grep -qE "isn.t wired|hard limit" "$log"; then
              echo "Founder ops miss (unwired or Cursor hard limit). No fail-look."
              exit 0
            fi
          fi
```

Engineer miss is checked first (Travis generate / speak / run-error). Founder ops (`isn.t wired`, `hard limit`) exit before label. Other reds still reach `fail-look`.

**2. B prompt stop on founder ops**

```14:18:docs/register/house-now/automations/sa-complete-engineer.prompt.md
- Else → newest failed `runtime-doors` log for this PR.
  - Cursor **hard limit** / `$2` / **Travis isn’t wired** → **stop**. Founder ops. Do not commit. Do not push.
  - Else recut that miss. Do not stop for a missing PM-LOOK.
```

**Opened / queried.** No preview — hang only. `DATABASE_URL` unset. No SQL on this cut.

**Grep vs real tape shapes.** Simulated walk miss lines from `app-worked.ts` / `travis-miss.test.ts`:

| Miss line | Classification |
|-----------|----------------|
| `type-send: Travis isn't wired — think-walk is red …` | Founder ops → no `fail-look` |
| `type-send: run error on tape: Travis error: Cannot use import …` | Engineer miss → `fail-look` |
| `Dest error: … hard limit … $2 …` | Founder ops → no `fail-look` |
| `voice-wrap: Travis did not speak …` | Engineer miss → `fail-look` |

Plant matches both cuts.

## Test

Walked [`HOTFIX-088-FAIL-LOOK-OPS-SKIP-TEST.md`](./HOTFIX-088-FAIL-LOOK-OPS-SKIP-TEST.md).

### 1. Walks red only on Cursor hard limit / unwired: no new `fail-look`
**I saw:** Workflow `elif grep -qE "isn.t wired|hard limit"` exits 0 before the `gh pr edit --add-label fail-look` block. Simulated unwired and hard-limit miss lines classify as founder ops, not engineer miss.

### 2. Walks red on `Cannot use import` / Travis run error: `fail-look` still lands
**I saw:** Engineer-miss grep matches `run error on tape: Travis error: Cannot use import …` and `Travis did not speak …`. Those lines do not hit the founder-ops exit; the step continues to fresh-add `fail-look`.

### 3. I saw
**I saw:** ________ (human fills after merge + a live red doors run)

**Steps I could not do (human):** Trigger `runtime-doors` on a deploy that is actually red for unwired or hard limit and confirm no `fail-look` label lands. Trigger a red run for `Cannot use import` and confirm `fail-look` fresh-adds. Re-paste B on a founder-ops miss and confirm it stops without push. Live effect is on merge (`repository_dispatch` uses `main`). Those are the human's. I do not fail the look for them.

## Loop

Pass: emerged. Human may walk the same sheet after merge. Same PR. No cousin. No `fail-look`.
