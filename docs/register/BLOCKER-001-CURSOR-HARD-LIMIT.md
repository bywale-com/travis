# Blocker 001 — Cursor Background Agent hard limit

**PR:** [#177](https://github.com/bywale-com/travis/pull/177)  
**Pocket:** Packet 021 — Circuit breaker  
**When:** 2026-09-11  
**Status:** Open — founder action required  
**Hold:** deploy skipped via `[vercel skip]` until this is cleared

---

## What failed on the tape

Latest: `runtime-doors` run [34629445893](https://github.com/bywale-com/travis/actions/runs/34629445893) — full-audit walk suite on preview deploy (`b364100`). **4 pass, 1 fail.**

| Walk | Result |
|------|--------|
| `come-back` | pass |
| `type-dest` | **fail** — Dest error: You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. |
| `type-send` | pass |
| `type-walk-back` | pass |
| `voice-wrap` | pass |

Prior run [34621326711](https://github.com/bywale-com/travis/actions/runs/34621326711) also had ESM failures on think-walks — **Bucket A plant miss**, fixed on this branch (087 recut: runtime `require("deepagents/node")`). Only `type-dest` remains blocked on Cursor billing.

---

## Required founder action

1. Open [Cursor dashboard → Settings → Usage & limits](https://www.cursor.com/dashboard?tab=settings).
2. Ensure at least **$2** remains until your hard limit so Background Agent create succeeds on preview dest walks.
3. Remove the **`blocker`** label from PR #177 when done — that triggers a redeploy and re-runs `runtime-doors` against the unblocked environment.

---

## Why this is a blocker (not a code failure)

Engineer cannot recut Cursor billing. Rebuilding before the limit is cleared would re-fail `type-dest` and waste tokens in a loop. Packet 021 circuit breaker holds deploy until this is resolved.
