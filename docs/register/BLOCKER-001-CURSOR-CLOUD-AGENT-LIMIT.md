# Blocker 001 — Cursor Cloud Agents plan limit

**When:** 2026-09-12  
**PR:** [#183](https://github.com/bywale-com/travis/pull/183)  
**Run:** [runtime-doors #34699714537](https://github.com/bywale-com/travis/actions/runs/34699714537)

## Cause

`runtime-doors` sequential walks hit the Cursor Cloud Agents concurrent cap on dest leave. Engineer cannot recut this in `src/`.

## Tape

```
type-dest: no dest leave on queue (sse error={"error":"Upgrade to Ultra for more Cloud Agents: You've reached the limit for your current plan. Upgrade to Ultra to run more Cloud Agents simultaneously."})
#1 user/travis speak=true Engineer, inspect the runtime verification check.
#2 status/engineer speak=false Dest error: Upgrade to Ultra for more Cloud Agents: You've reached the limit for your current plan. Upgrade to Ultra to run more Cloud Agents simultaneously.
```

`voice-stream-arch` and `come-back` also red on the same run — likely the same cap and/or overlapping `runtime-doors` jobs sharing `TRAVIS_TEST_OPERATOR_COOKIE`.

## Action

1. Free or upgrade Cursor Cloud Agents capacity (Ultra or fewer simultaneous agents).
2. Re-run the Vercel Deployment Check on PR #183 when slots are clear.
3. Remove the `blocker` label after the check is green.

## URL

Preview deploy from that run: `https://travis-fxukyhh6m-wale-omotayos-projects.vercel.app` (from run `34699146400` tape; latest deploy is on PR checks).
