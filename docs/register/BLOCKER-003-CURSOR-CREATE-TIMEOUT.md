# Blocker 003 — Cursor create hang (create-agent walk)

**When:** 2026-09-13  
**PR:** [#186](https://github.com/bywale-com/travis/pull/186)  
**Run:** [runtime-doors #34742700085](https://github.com/bywale-com/travis/actions/runs/34742700085)

## Cause

`runtime-doors` `create-agent` walk is the only beat that waits for `POST /v1/agents`. Cursor create did not return before the 45s abort. Dest walks on the same run were green (`type-dest`, `voice-stream-arch`) because 091 files `dest_job` before spin. Think walks were green. Engineer cannot make Cursor answer.

Same create door as [Blocker 002](./BLOCKER-002-CURSOR-HARD-LIMIT.md) (spend hard limit). The 095 abort now surfaces the hang as a timeout instead of a dest SSE error.

## Tape

```
create-agent: create_agent tool failed: Cursor create timed out after 45s.
tape:
#1 agent_post/travis speak=false Creating RtWalkmtzflb0c.
door kind=json status=400
```

`# tests 7` / `# pass 6` / `# fail 1` — only `create-agent` red.

## Action

1. Raise the Cursor spend hard limit so Background Agent has at least $2 remaining, and free or upgrade concurrent Cloud Agent slots: https://www.cursor.com/dashboard?tab=settings
2. Remove the `blocker` label after the house move.
3. Green-light can then re-preview this PR. Do not remint 095. Recut already raised the create wait to 90s and set `maxDuration` 120 on the create doors.

## URL

Preview from that run: `https://travis-paf0kww6i-wale-omotayos-projects.vercel.app`
