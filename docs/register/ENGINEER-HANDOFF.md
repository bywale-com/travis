# Engineer seat handoff — 2026-09-12

**This bind is done.** Last prior bind: `bc-f837bcfa-86f5-46d0-8f47-748f4d781a74` (091 fail-look recut); prior plant `bc-80927f96-ec7a-4ce0-9716-abfc5c7118a0`. Do not start from a transcript.

**091 stream-arch runtime walk (this PR):** `voice-stream-arch.spec.ts` dests on `/live/transcript` and requires the leave on `GET /queue` **before** `/finalize` I’m done. Transcript door consumes dest SSE. **Fail-look recut:** live transcript dest SSE no longer awaits `runMotionRunner` before headers — ping + `done` like send/finalize; `travis-deep-agent` uses `createRequire("deepagents/node")` so Vercel hits CJS not browser ESM. Next hotfix **092**. 021 live watches stay on [#181](https://github.com/bywale-com/travis/pull/181) / [#180](https://github.com/bywale-com/travis/pull/180) — do not recut them. Do not remint 035.

**090 no PM Look wake (merged [#182](https://github.com/bywale-com/travis/pull/182)):** Action no longer adds `wake-pm-look`. Preview green-lights when seats are clear. Engineer runs `npm test` after the handoff rewrite.

**086 runtime is the app (merged):** Walks wait for the mouth. Red `runtime-doors` fresh-adds `fail-look` (`WAKE_GITHUB_TOKEN`) so B recuts. Merged [#171](https://github.com/bywale-com/travis/pull/171).

**Trail:** git + PRs. **One PR per initiative.** Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**091 fail-look recut pushed on this PR.** CI `runtime-doors` must go green on the preview URL. If type-dest still fails on Cursor hard limit with no code hole, that is founder ops — Hotfix 088 already says do not `fail-look` that. Merge when green.

**091 stream-arch runtime walk is planted on this PR.** Voice dest-by-name on live transcript; queue must show the leave before I’m done; wrap is a Travis mouth. `transcript()` consumes dest SSE. Grain lock in `dest-leave.test.ts`. Do not remint `stream-intent` / `stream-dispatch`. Do not recut #181.

**080 Deep Agents must answer is planted on [#151](https://github.com/bywale-com/travis/pull/151).** Type hangs `createDeepAgent` from `deepagents/node` via CJS `createRequire`. 032 deleted the Responses cousin. Do not remint the `/node` hang.

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — **091** Stream-arch runtime walk. Next number **092**. |
| Last plant | **Hotfix 091 stream-arch runtime walk** · this PR · fail-look recut for transcript SSE + Deep Agents CJS |

**Do not redo** 012, 013, 014, 015, 023–035, 081, 062, 064, 065, 077–080. Do not remint dest-with-context grain, Cloud HTTP create, LangGraph checkpointer, or stream-intent / stream-dispatch.

---

## Next Engineer job

1. Accept the seat. Read **this file**, then [`ENGINEER.md`](../seats/ENGINEER.md), then `AGENTS.md`.
2. If `runtime-doors` is still red after this push: read the tape. ESM on generate should be gone. Transcript 504 should be gone. Cursor hard limit on dest is founder ops — do not blocker unless a new code hole appears.
3. Merge **091** when `runtime-doors` is green.

---

## Paste — new Engineer

```text
You are Travis’s Engineer (full-stack implementer). Read docs/README.md “Engineer — identity” and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

You are a NEW bind. Read docs/register/ENGINEER-HANDOFF.md first.

Then, in order:
1. docs/register/ENGINEER-HANDOFF.md — where we stopped, planted, leftover, locks.
2. Root README.md Implementation trail (newest first).
3. docs/seats/ENGINEER.md · AGENTS.md.
4. Smoke on https://travis-psi.vercel.app — Voice / Log / Backlog.

Trail is git + PRs. One PR per initiative. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
