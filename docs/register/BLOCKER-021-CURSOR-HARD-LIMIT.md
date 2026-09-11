# BLOCKER-021 — Cursor hard limit

**PR:** https://github.com/bywale-com/travis/pull/180
**When:** 2026-09-11T22:35 UTC
**Cause:** `type-dest` walk failed because Cursor Background Agent requires at least $2 remaining until the hard limit — not a plant miss.
**Required action:** Increase Cursor spend or raise the hard limit so Background Agent runs have at least $2 headroom. Re-run walks after clearing.
**Resolve at:** https://www.cursor.com/dashboard?tab=settings
**Tape excerpt:**
```
type-dest: no dest leave on queue (sse error={"error":"You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings."})
#1 user/travis speak=true Engineer, inspect the runtime verification check.
#2 status/engineer speak=false Dest error: You need to increase your hard limit. Background Agent requires at least $2 remaining until your hard limit. Manage it at https://www.cursor.com/dashboard?tab=settings.
```

Also on this tape (Bucket A — recut on this push): think-walks failed `Travis error: Cannot use import statement outside a module` on generate. Engineer recut `travis-deep-agent.ts` and `travis-checkpointer.ts` to `require()` CJS entrypoints at runtime instead of webpack `import()` on mixed packages.
