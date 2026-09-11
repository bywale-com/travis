# Engineer seat handoff — 2026-09-11

**This bind is done.** Last bind: fail-look triage on Packet 021 / SCP-036 (#180). Do not start from a transcript.

**036 circuit breaker hold on [#180](https://github.com/bywale-com/travis/pull/180).** `runtime-doors` red: Bucket B Cursor hard limit on `type-dest`; Bucket A ESM on think-walks. Engineer recut `travis-deep-agent.ts` + `travis-checkpointer.ts` to `require()` CJS entrypoints at runtime (webpack `import()` on mixed packages was loading ESM `.js` on Vercel). Added `@langchain/langgraph-sdk`, `zod`, and `experimental.esmExternals: false` to `next.config.ts`. Filed [`BLOCKER-021-CURSOR-HARD-LIMIT.md`](./BLOCKER-021-CURSOR-HARD-LIMIT.md). Push used `[vercel skip]` — no preview rebuild until founder clears ops and removes `blocker`. `npm test` 482/482 green.

**088 fail-look skip (merged):** Superseded by 036 Engineer triage + blocker hold. Merged [#174](https://github.com/bywale-com/travis/pull/174).

**086 runtime is the app (merged):** Walks wait for the mouth. Merged [#171](https://github.com/bywale-com/travis/pull/171).

**Trail:** git + PRs. **One PR per initiative.** Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**036 circuit breaker blocker hold on [#180](https://github.com/bywale-com/travis/pull/180).** Action should label `blocker`, strip seat wakes, mail founder via Resend. Founder: raise Cursor hard limit ($2 headroom), remove `blocker` label → `blocker-release` green-lights preview → walks rerun. ESM recut is on this push; verify on next preview after hold clears.

| What | Where |
|------|--------|
| Blocker | [`BLOCKER-021-CURSOR-HARD-LIMIT.md`](./BLOCKER-021-CURSOR-HARD-LIMIT.md) |
| ESM recut | `src/server/travis-deep-agent.ts`, `src/server/travis-checkpointer.ts`, `next.config.ts` |
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — **088** merged. Next number **089**. |
| Production | `https://travis-psi.vercel.app` |

**Do not redo** 012–035 product pipe, 036 (once merged), 062, 064, 065, 077–088. Do not remint dest grain, Cloud HTTP create, LangGraph checkpointer grain, or stream-intent / stream-dispatch.

---

## Founder locks (keep)

- Preview builds only when commit message contains `[vercel build]`; production always builds (036).
- Handoff/hold labels: `wake-sa` · `wake-engineer` · `wake-pm-look` · `fail-look` · `blocker`. One seat at a time.
- Full-audit walks: `test:runtime` runs all specs; no fail-fast; Engineer triages tape on `fail-look`.
- Bucket B blocker: `BLOCKER-NNN-*.md` + no green-light tag → label `blocker` + Resend mail; founder clears ops and removes label.
- Do not use `[skip ci]` on seat commits — silences GitHub Actions too.

---

## Next Engineer job

1. If `blocker` still on #180: wait for founder to clear Cursor limit and remove label. Do not green-light preview.
2. After hold clears: confirm `runtime-doors` green on preview. If ESM persists, inspect walk tape — do not remint `/node` import path; fix require hang or name hole.
3. When you stop: rewrite **Current** at the top of this file.

---

## Paste — new Engineer

```text
You are Travis's Engineer (full-stack implementer). Read docs/README.md "Engineer — identity" and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

Read docs/register/ENGINEER-HANDOFF.md first. Trail is git + PRs. One PR per initiative. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
