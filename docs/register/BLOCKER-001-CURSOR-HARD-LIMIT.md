# Blocker 001 — Cursor hard limit on dest walks

**Number:** 001  
**PR:** https://github.com/bywale-com/travis/pull/179  
**Cause:** Cursor Background Agent hard limit — less than $2 remaining until hard limit.  
**Required action:** Raise the Cursor hard limit (or add spend headroom) so dest leaves can spin on the preview deploy. No secret values in this file — use the dashboard.  
**Resolve at:** https://www.cursor.com/dashboard?tab=settings

## Tape excerpt

From `runtime-doors` on PR #179 preview deploy (2026-09-11):

```
type-dest: no dest leave on queue (sse error={"error":"You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings."})
tape:
#1 user/travis speak=true Engineer, inspect the runtime verification check.
#2 status/engineer speak=false Dest error: You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings.
door kind=sse status=200
sse events: message,error
```

Other walks on the same deploy also failed with `Travis error: Cannot use import statement outside a module` — Bucket A fix landed in `src/server/deepagents-node.ts` on this branch. After the limit is raised, remove the `blocker` label to redeploy and re-run walks.
