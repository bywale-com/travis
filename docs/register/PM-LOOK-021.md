# PM look — 021 circuit breaker

**Packet:** PM-PACKET-021
**Change packet:** SYSTEMS-CHANGE-PACKET-036
**PR:** https://github.com/bywale-com/travis/pull/177
**Preview:** none (architectural — GitHub Actions / CI; no product glass)
**Verdict:** Pass

## Look

**Lock (PM-021 / SCP-036).** GitHub Actions is a dumb sensor, not a triage brain. `npm run test:runtime` runs all walk specs sequentially to completion — no fail-fast; full tape recorded. On any walk failure, `runtime-doors` paints red and fresh-adds `fail-look` via `WAKE_GITHUB_TOKEN`. No bash regex classifying `Cannot use import` vs `hard limit` (088 skip retired). Engineer is the triage brain: Bucket A (plant/code) fixed in `src/`; Bucket B (founder ops — Cursor $2 hard limit, missing preview secrets) → `docs/register/BLOCKER-NNN-*.md`, commit with deploy hold (`[skip ci]` or `[vercel skip]`), push stops. Blocker push labels PR `blocker`, strips `fail-look` / `wake-engineer` / `wake-pm-look`, mails founder via Resend. Founder removes `blocker` label → redeploy / re-run walks against unblocked environment. No new DB tables. Same PR. Automation prompts checkout PR head before gate diff.

**Plant (this PR, `d3c6757`).** Engineer handoff: 021 / 036 planted on #177; Bucket A ESM recut + Bucket B hold active.

088 bash skip removed — dumb doors always fail-look:

```59:66:.github/workflows/runtime-doors.yml
        run: |
          set -euo pipefail
          if [[ -n "${WAKE_GITHUB_TOKEN:-}" ]]; then
            export GH_TOKEN="$WAKE_GITHUB_TOKEN"
```

Full-audit runner unchanged — sequential, no early abort:

```11:11:package.json
    "test:runtime": "tsx --test --test-concurrency=1 src/runtime/walks/*.spec.ts",
```

Blocker gate + release switch:

```106:122:.github/workflows/wake-packet-seats.yml
          # Circuit breaker (021): blocker file → label, sleep automations, mail founder.
          if echo "$files" | grep -E '^docs/register/BLOCKER-[0-9]+-.+\.md$' | grep -q .; then
            ...
            gh pr edit "$pr" --remove-label fail-look || true
            gh pr edit "$pr" --remove-label wake-engineer || true
            gh pr edit "$pr" --remove-label wake-pm-look || true
            if gh pr edit "$pr" --add-label blocker; then
```

```268:288:.github/workflows/wake-packet-seats.yml
  release-blocker:
    if: github.event_name == 'pull_request' && github.event.action == 'unlabeled' && github.event.label.name == 'blocker'
    ...
          git commit --allow-empty -m "Circuit breaker release — redeploy after blocker cleared"
          git push origin "HEAD:${HEAD_REF}"
```

House mailer:

```25:29:.github/scripts/send-blocker-letter.py
    payload: dict = {
        "from": sender,
        "to": [to],
        "subject": f"[BLOCKER] {pocket} blocked — {cause}",
        "text": body,
```

Bucket A ESM recut (087): runtime `createRequire("deepagents/node")` — no static ESM import on Vercel:

```8:16:src/server/travis-deep-agent.ts
import { createRequire } from "node:module";

const requireDeepAgents = createRequire(import.meta.url);
...
function deepAgentsNode(): DeepAgentsNode {
  return requireDeepAgents("deepagents/node") as DeepAgentsNode;
```

Isolated walk operators — concurrent CI jobs do not share one pile:

```31:34:src/runtime/desk.ts
/** Isolated operator email — not on the seed list, so each walk owns its own pile. */
function walkOperatorToken(): string {
  return `runtime-${randomUUID()}@travis.internal`;
}
```

Bucket B filed:

```11:17:docs/register/BLOCKER-001-CURSOR-HARD-LIMIT.md
| Walk | Failure |
|------|---------|
| `type-dest` | Dest error: You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. |
...
Four think-walks ... `Cannot use import statement outside a module` — **Bucket A plant miss**. Fixed on this branch
```

Hold commits use `[vercel skip]` (GitHub Actions stay live; Vercel does not rebuild into the wall). Blocker register is the letter when Resend is absent; on this branch Resend returned 200.

**What I opened or queried.** No product preview — this cut is CI / labels / mail, not voice/chat glass. CI tape: `runtime-doors` run [34621326711](https://github.com/bywale-com/travis/actions/runs/34621326711) on deploy `4e335fe`. Blocker gate run [34622075977](https://github.com/bywale-com/travis/actions/runs/34622075977). PR #177 labels now include `blocker` (hold active).

## Test

Walked from [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md).

### 1. Full-Audit Walks (No Fail-Fast)

**I saw:** On run 34621326711, all five walk specs executed to completion despite early failures: `come-back`, `type-dest`, `type-send`, `type-walk-back`, `voice-wrap` — summary `# tests 5` · `# pass 0` · `# fail 5`. Log tee'd to `$RUNNER_TEMP/walks.txt`. `runtime-doors` painted failure. Fresh-add step labeled #177 `fail-look` (actor `bywale-com` / `WAKE_GITHUB_TOKEN`). No bash early-exit on founder-ops strings.

### 2. Engineer Triage & Circuit Breaker Hold

**I saw:** Engineer recut on `0a6398a`: Bucket A — `travis-deep-agent.ts` `createRequire`, isolated walk operators in `desk.ts`. Bucket B — [`BLOCKER-001-CURSOR-HARD-LIMIT.md`](./BLOCKER-001-CURSOR-HARD-LIMIT.md) names Cursor $2 hard limit and dashboard URL. Commits carry `[vercel skip]`; no Vercel deploy after hold. Retrigger run 34622075977: `Labeled #177 blocker (docs/register/BLOCKER-001-CURSOR-HARD-LIMIT.md).` · `Resend 200 {"id":"ffbae5e4-074d-4c2f-bbc8-9355f4112ad4"}`. PR labels: `blocker` present; `fail-look` stripped at gate. First gate run failed on force-push bad object; recovery push succeeded — not a plant miss.

### 3. Circuit Breaker Release (Option A)

**I saw:** `release-blocker` job is planted (empty commit on `blocker` unlabel). Founder has not cleared Cursor limit or removed `blocker` — no redeploy / green `runtime-doors` yet. Expected while hold is active.

**Steps I could not do (human):** Top up Cursor Background Agent hard limit ($2). Remove `blocker` label on #177. Confirm blocker email in founder inbox (Resend 200 from Actions; I did not open the mailbox). Confirm post-release `runtime-doors` green with ESM fix live on preview. Those are the founder's. I do not fail the look for them.

## Loop

Pass. Emerged for what a cloud agent can verify. Human must clear BLOCKER-001, remove `blocker`, then walk step 3 on the same sheet. Same PR #177. No cousin. No `fail-look`.
