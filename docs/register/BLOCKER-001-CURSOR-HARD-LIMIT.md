# Blocker 001 — Cursor hard limit

**When:** 2026-09-12  
**PR:** [#182](https://github.com/bywale-com/travis/pull/182)  
**CI:** [`34660503514`](https://github.com/bywale-com/travis/actions/runs/34660503514)

## Cause

`type-dest` runtime walk cannot start a dest leave. Cursor Cloud Agents API returns a hard-limit error before the leave assembles.

## Action

Increase the Cursor account hard limit so at least **$2** remains until the limit. Dashboard: https://www.cursor.com/dashboard?tab=settings

## Tape excerpt

```
#1 user/travis speak=true Engineer, inspect the runtime verification check.
#2 status/engineer speak=false Dest error: You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings.
door kind=sse status=200
sse events: message,error
sse error: {"error":"You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings."}
```

## Engineer note

Think-walks (`come-back`, `type-send`, `type-walk-back`, `voice-wrap`) failed on `Travis error: Cannot use import statement outside a module` — Bucket A. Recut: `travis-deep-agent.ts` loads `deepagents/node` via `createRequire` so Vercel hits `node.cjs`, not dynamic `import()`. Re-run `runtime-doors` after the hard limit is cleared.
