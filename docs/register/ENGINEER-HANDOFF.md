# Engineer seat handoff — 2026-09-11

**This bind is done.** Last bind: `bc-f2fe0215-5f44-4b79-8052-ab84c911bcca`. Do not start from a transcript.

**fail-look recut on [#181](https://github.com/bywale-com/travis/pull/181):** Bucket A — planted 087 mouth recut (`createRequire("deepagents/node")` in `travis-deep-agent.ts`) so Type/generate no longer throws ESM on Vercel. Bucket B — filed [`BLOCKER-021-CURSOR-HARD-LIMIT.md`](./BLOCKER-021-CURSOR-HARD-LIMIT.md) for Cursor hard limit ($2 remaining). Push used `[vercel skip]`; PR should carry `blocker` label until founder clears spend. Full `npm test` green (482/482). **Do not rebuild preview until `blocker` is removed** — founder must raise Cursor hard limit, unlabel `blocker`, then Action green-lights and walks re-run.

**036 circuit breaker is planted on [#181](https://github.com/bywale-com/travis/pull/181).** Full-audit walks (`npm run test:runtime`, no bail); dumb `runtime-doors` (all handoff/hold labels skip fresh `fail-look`); preview opt-in via exact subject `Preview [vercel build]` (`vercel.json` + `vercel-ignore.sh`); green-light empty commit via `preview-when-clear.sh` when labels clear; blocker hold on `BLOCKER-NNN-*.md` push (label + strip seats + Resend mail); `send-blocker-letter.py` planted; lib proof in `src/lib/circuit-breaker.test.ts`. Engineer prompt documents Bucket A/B triage. **Merge to `main`** so `repository_dispatch` runs handoff-aware `runtime-doors`. Human look+test: [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md). Do not remint Hotfix 088 bash-regex skip path.

**088 fail-look skip (superseded by 036 on #181):** Red doors does not `fail-look` unwired or Cursor hard limit. B prompt: stop, do not push. Next hotfix **089**. 087 mouth recut now on #181 (was #173).

**086 runtime is the app (merged):** Walks wait for the mouth. Red `runtime-doors` fresh-adds `fail-look` (`WAKE_GITHUB_TOKEN`) so B recuts. Merged [#171](https://github.com/bywale-com/travis/pull/171).

**085 type-dest recut (merged):** Type send returns SSE and writes the user turn before role dest resolve; chip dests dispatch write-and-leave (`dispatchToSeat` with `enqueueIfBusy: false` on role dests); SSE headers include `X-Accel-Buffering: no`. Merged on [PR #170](https://github.com/bywale-com/travis/pull/170).

**084 role dest timeout (merged):** Role dest resolves all sit roles (`isSitProtocolRole`), sit handoff uses `dispatchToSeat` write-and-leave, SSE emits immediate ping comment. Merged on [PR #169](https://github.com/bywale-com/travis/pull/169).

**020 runtime verify (merged):** `src/lib/live-connect.ts` — in-flight connect **waits**; unwired keeps **Travis isn't wired**; a real miss still gets the phone-ear shirt. Room hangs those rules. `npm test` covers the three lies. **Walks planted:** `src/runtime/desk.ts` + `doors.ts` + `walks/voice-wrap.spec.ts` + `type-send.spec.ts` + `come-back.spec.ts` + `type-dest.spec.ts`; `npm run test:runtime`; Action `.github/workflows/runtime-doors.yml` on `vercel.deployment.ready` paints check `runtime-doors`. Operator resolution accepts email (`test-runner@travis.internal`) with isolated room scope (`ownerId === viewerIds[0]`). Merged on [PR #165](https://github.com/bywale-com/travis/pull/165). Next hotfix number **089**. Do not remint dest assemble / 031–035.

**Trail:** git + PRs. **One PR per initiative.** Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**fail-look recut landed on [#181](https://github.com/bywale-com/travis/pull/181).** 087 ESM mouth fix in `travis-deep-agent.ts`. `BLOCKER-021-CURSOR-HARD-LIMIT.md` filed for Cursor spend. PR blocked until founder clears limit and removes `blocker` label. After release: Action green-lights preview, walks should pass think-walks (come-back, type-walk-back, voice-wrap, type-send) and still need Cursor spend for dest-walks (type-dest).

**036 circuit breaker planted on [#181](https://github.com/bywale-com/travis/pull/181).** Engineer planted `.github/scripts/send-blocker-letter.py` (Resend, same secrets as emerge; exit 0 when secrets missing). Extended `src/lib/circuit-breaker.test.ts` (mailer exists, workflow invokes it, subject shaping dry-run). Rest of chain already on branch: `vercel.json`, `vercel-ignore.sh`, `preview-when-clear.sh`, `wake-packet-seats.yml` blocker/preview jobs, `runtime-doors.yml` handoff skip, Engineer automation Bucket A/B law. **Awaiting founder unblock + merge to `main`**. Do not remint 020 walks, 035 stream, or Hotfix 088 regex path.

**035 stream architecture is planted on [#163](https://github.com/bywale-com/travis/pull/163).** Classify is `src/lib/stream-intent.ts` (new / change / cancel / talk). Do is `src/server/stream-dispatch.ts` — hangs dest assemble, 034 follow-up, `cancelCursorRun`, and `invokeDeepAgent({ mode: "update" })`. Mouth is last. Live `liveShouldPipeTravis` is always false; transcript dest-by-name still leaves, then dispatches the rest, never `pipeTravisText`. Type send writes the tape, files chip / call-by-name dests, dispatches remaining intents, then synthesizes. Finalize strips the done-phrase, backup-Do once if a leave never started, then synthesizes. `parent_id` unused. No new table. Glass: `destGlassName` / `SIT_ROLE_LABEL.pm` / `seatKeyToLabel("pm")` → **Technical Architect**. Spoken "Technical Architect" and "Technical PM" both route to `pm`. Path `/protocols/pm.md`. Grain tests + `next build` passed. Human look+test is [`PM-PACKET-019-STREAM-ARCH-TEST.md`](./PM-PACKET-019-STREAM-ARCH-TEST.md) on Log · Type after this lands on psi. Do not remint dest assemble, dest-gate-on-ask, Cloud create, `dest_job`, checkpointer, or 031–034.

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — **088** skip path superseded by 036. Next number **089**. |
| One PR law | [`initiatives/README.md`](./initiatives/README.md) |
| Production | `https://travis-psi.vercel.app` |
| Store | Shared Postgres schema `travis`. Cloud Agent `DATABASE_URL` is the live DB. |
| Face | Phone-first Voice / Log / Backlog. Smoke there. |
| Last plant | **087 ESM mouth + BLOCKER-021** · [PR #181](https://github.com/bywale-com/travis/pull/181). Prior: **SCP-036 circuit breaker** · [#181](https://github.com/bywale-com/travis/pull/181). |

**Do not redo** 012, 013, 014, 015, 016, 020 first slice, 021 worker, 023, 024, 025, 026, 027, **029**, **030**, **031**, **032**, **033**, **034**, **035**, **036 circuit breaker**, **081**, 062, 064, 065, 068, 069, 070, 071, 072, 073, 074 SQL, the 075 live hang, the 076 dest closer, the 027 cutoff write, the 029 index, **077 / 078** open desk, **079**, or **080**. Do not plant **022** except from the signed packet on #120. Do not remint dest-with-context grain. Do not remint the Deep Agents `/node` hang (087 is planted). Do not remint Cloud HTTP create. Do not remint the LangGraph `langgraph` checkpointer. Do not remint `stream-intent` / `stream-dispatch`. Do not send **That's fine.**

---

## Next Engineer job

1. Accept the seat from the paste below. Fetch `main`. Read **this file**, then [`ENGINEER.md`](../seats/ENGINEER.md), then `AGENTS.md`.
2. **If `blocker` still on #181:** wait for founder to raise Cursor hard limit and remove label. Do not push green-light.
3. **After `blocker` cleared:** Action should green-light preview; verify `runtime-doors` green on think-walks. Dest-walks need Cursor spend.
4. **036** merge to `main` when green. Walk [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md).
5. When **you** stop: rewrite the **Current** lines at the top of this file so the next bind does not start from a transcript.

---

## Paste — new Engineer

```text
You are Travis's Engineer (full-stack implementer). Read docs/README.md "Engineer — identity" and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

You are a NEW bind. The last Engineer was bc-f2fe0215-5f44-4b79-8052-ab84c911bcca (prior: bc-7c4413e3-0e0a-4028-b018-a6fe9970e754). They handed off. Read docs/register/ENGINEER-HANDOFF.md first.

Then, in order:
1. docs/register/ENGINEER-HANDOFF.md — where we stopped, planted, leftover, locks.
2. Root README.md Implementation trail (newest first).
3. docs/seats/ENGINEER.md · AGENTS.md.
4. docs/register/initiatives/README.md — one PR per initiative.
5. Smoke on https://travis-psi.vercel.app — Voice / Log / Backlog.

Trail is git + PRs. One PR per initiative. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
