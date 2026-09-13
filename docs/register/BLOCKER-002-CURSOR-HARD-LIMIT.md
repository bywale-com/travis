# Blocker 002 — Cursor Background Agent hard limit

**When:** 2026-09-13  
**PR:** [#183](https://github.com/bywale-com/travis/pull/183)  
**Run:** [runtime-doors #34736859541](https://github.com/bywale-com/travis/actions/runs/34736859541)

## Cause

`runtime-doors` dest walks cannot start a leave. Cursor Cloud create is at the spend hard limit (Background Agent needs at least $2 remaining). Engineer cannot recut this in `src/`.

Think walks on the same run were green (`come-back`, `type-send`, `type-walk-back`, `voice-wrap`). The 091 plant is not the miss.

## Tape

```
type-dest: no dest leave on queue (sse error={"error":"You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings."})
#1 user/travis speak=true Engineer, inspect the runtime verification check.
#2 status/engineer speak=false Dest error: You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings.
door kind=sse status=200
sse events: message,error
```

```
voice-stream-arch flush: transcript sse error: {"error":"You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings."}
#1 user/travis speak=true Engineer, put this on the notes: stream-arch cue.
door kind=sse status=200
sse events: message,error
```

## Action

1. Raise the Cursor spend hard limit so Background Agent has at least $2 remaining: https://www.cursor.com/dashboard?tab=settings
2. Remove the `blocker` label after the house move.
3. Green-light can then re-preview this PR. Do not remint 091.

## URL

Preview from that run: `https://travis-n0krspsv1-wale-omotayos-projects.vercel.app`
