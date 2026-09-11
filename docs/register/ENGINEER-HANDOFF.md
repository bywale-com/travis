# Engineer seat handoff — 2026-09-11

**This bind is living.** Last prior bind: wake-engineer on [#179](https://github.com/bywale-com/travis/pull/179) SCP-036. Do not start from a transcript.

**021 circuit breaker is planted on [#179](https://github.com/bywale-com/travis/pull/179).** Full-audit walks (no `--test-bail`). `runtime-doors` paints red and fresh-adds `fail-look` unless PR label `blocker` (file-only skip removed). Engineer triage: Bucket A in `src/`; Bucket B → `BLOCKER-NNN-*.md` + `[vercel skip]` push → Action labels `blocker`, strips seat wakes, mails founder. Founder removes `blocker` → deploy hook POST (when `VERCEL_DEPLOY_HOOK_URL` set). Hotfix 088 silent-red path superseded by this cut. Live proof: [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md) on a PR with hooks/secrets.

**088 fail-look skip (superseded by 036):** Was on [#174](https://github.com/bywale-com/travis/pull/174). Do not remint.

**086 runtime is the app (merged):** Walks wait for the mouth. Red `runtime-doors` fresh-adds `fail-look` (`WAKE_GITHUB_TOKEN`) so B recuts. Merged [#171](https://github.com/bywale-com/travis/pull/171).

**085 type-dest recut (merged):** Type send returns SSE and writes the user turn before role dest resolve; chip dests dispatch write-and-leave (`dispatchToSeat` with `enqueueIfBusy: false` on role dests); SSE headers include `X-Accel-Buffering: no`. Merged on [PR #170](https://github.com/bywale-com/travis/pull/170).

**084 role dest timeout (merged):** Role dest resolves all sit roles (`isSitProtocolRole`), sit handoff uses `dispatchToSeat` write-and-leave, SSE emits immediate ping comment. Merged on [PR #169](https://github.com/bywale-com/travis/pull/169).

**020 runtime verify (merged):** `src/lib/live-connect.ts` — in-flight connect **waits**; unwired keeps **Travis isn’t wired**; a real miss still gets the phone-ear shirt. Room hangs those rules. `npm test` covers the three lies. **Walks planted:** `src/runtime/desk.ts` + `doors.ts` + `walks/voice-wrap.spec.ts` + `type-send.spec.ts` + `come-back.spec.ts` + `type-dest.spec.ts`; `npm run test:runtime`; Action `.github/workflows/runtime-doors.yml` on `vercel.deployment.ready` paints check `runtime-doors`. Operator resolution accepts email (`test-runner@travis.internal`) with isolated room scope (`ownerId === viewerIds[0]`). Merged on [PR #165](https://github.com/bywale-com/travis/pull/165). Do not remint dest assemble / 031–035.

**Trail:** git + PRs. **One PR per initiative.** Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**036 circuit breaker planted on [#179](https://github.com/bywale-com/travis/pull/179).** Files: `runtime-doors.yml` (label-only blocker skip), `wake-packet-seats.yml` (BLOCKER hold + release), `send-blocker-letter.py`, `sa-complete-engineer.prompt.md` (Bucket A/B triage), runtime README full-audit lines. No `src/` change — CI + register only. Merge note: `runtime-doors.yml` runs from `main` on `repository_dispatch`; production CI behavior updates when this PR merges. Human 021 test sheet not run here (needs live hooks/secrets).

**035 stream architecture is planted on [#163](https://github.com/bywale-com/travis/pull/163).** Do not remint stream-intent / stream-dispatch.

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — **086** Runtime is the app. Next number **089**. |
| One PR law | [`initiatives/README.md`](./initiatives/README.md) |
| Production | `https://travis-psi.vercel.app` |
| Store | Shared Postgres schema `travis`. Cloud Agent `DATABASE_URL` is the live DB. |
| Face | Phone-first Voice / Log / Backlog. Smoke there. |
| Last plant | **SCP-036 circuit breaker** · [#179](https://github.com/bywale-com/travis/pull/179). Prior: **Hotfix 088** · [#174](https://github.com/bywale-com/travis/pull/174). **Hotfix 086** · [#171](https://github.com/bywale-com/travis/pull/171). |

**Do not redo** 012 / 013 / 014 / 015 / 023 / 024 / 025 / 026 / 027 / **029** / **030** / **031** / **032** / **033** / **034** / **035** / **036** / **081** / 062 / 064 / 065 / 077 / 078 / **079** / **080**. Do not remint the 074 SQL file. Do not remint the 075 hang. Do not remint the 076 dest closer. Do not remint the 027 cutoff. Do not remint the 029 index. Do not remint dest-with-context grain, the Deep Agents `/node` hang, Cloud HTTP create, the LangGraph `langgraph` checkpointer, or stream-intent / stream-dispatch. Do not mint a store. Do not append PM or SA logs. Do not remint Hotfix 088 silent-red skip — 036 replaces it.

---

## Next Engineer job

1. Accept the seat from the paste below. Fetch `main`. Read **this file**, then [`ENGINEER.md`](../seats/ENGINEER.md), then `AGENTS.md`.
2. If [#179](https://github.com/bywale-com/travis/pull/179) is not merged: wait for Technical PM look+test on 021 test sheet, or pick up `fail-look` on a red deploy.
3. **022** ports on [#120](https://github.com/bywale-com/travis/pull/120) stays signed, not planted. Do not remint `travis.port`.
4. When **you** stop: rewrite the **Current** lines at the top of this file. Then you may write **This bind is done**.

---

## Paste — new Engineer

```text
You are Travis’s Engineer (full-stack implementer). Read docs/README.md “Engineer — identity” and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

You are a NEW bind. Read docs/register/ENGINEER-HANDOFF.md first.

Then, in order:
1. docs/register/ENGINEER-HANDOFF.md — where we stopped, planted, leftover, locks.
2. Root README.md Implementation trail (newest first).
3. docs/seats/ENGINEER.md · AGENTS.md.
4. docs/register/initiatives/README.md — one PR per initiative.
5. Smoke on https://travis-psi.vercel.app — Voice / Log / Backlog.

Trail is git + PRs. One PR per initiative. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
