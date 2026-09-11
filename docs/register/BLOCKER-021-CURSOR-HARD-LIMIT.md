# Blocker 021 — Cursor hard limit

**Pocket:** [PR #181](https://github.com/bywale-com/travis/pull/181) · Packet 021 circuit breaker · preview `https://travis-aoz2swmvm-wale-omotayos-projects.vercel.app`

**Cause:** Runtime walks that dispatch to a Cursor seat (`type-dest`, `type-send`) fail because the Cloud Agents account has less than $2 remaining until the hard limit. Dest leave never starts; SSE returns the platform error instead of a seat job.

**Required action:**

1. Open [Cursor dashboard → Settings → Usage & billing](https://www.cursor.com/dashboard?tab=settings).
2. Increase the hard limit or add spend so at least **$2** remains available for Background Agent runs.
3. Remove the `blocker` label from PR #181 after the limit is cleared.
4. Action will green-light preview and re-run `runtime-doors`.

**URL:** https://www.cursor.com/dashboard?tab=settings

**Tape excerpt:**

```
type-dest: no dest leave on queue (sse error={"error":"You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings."})
#1 user/travis speak=true Engineer, inspect the runtime verification check.
#2 status/engineer speak=false Dest error: You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings.
door kind=sse status=200
sse events: message,error
```

CI run: https://github.com/bywale-com/travis/actions/runs/34658829523
