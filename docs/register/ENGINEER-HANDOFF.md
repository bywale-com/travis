# Engineer seat handoff — 2026-09-11

**This bind is done.** Last bind: fail-look recut on Packet 021 / SCP-036 (#180). Do not start from a transcript. `handoff-seat.test.ts` now asserts the living-handoff shape instead of the old bind-chain strings the 021 rewrite dropped.

**036 circuit breaker is planted on [#180](https://github.com/bywale-com/travis/pull/180).** Preview is opt-in (`[vercel build]` on empty commit after handoffs clear). `runtime-doors` runs full walk suite, skips `fail-look` during handoff/hold labels, and does not regex-classify failures. Engineer triage (Bucket A plant / Bucket B founder ops) lives in the automation prompt. Blocker hold: `BLOCKER-NNN-*.md` → label `blocker` + `send-blocker-letter.py` (Resend). Founder removes `blocker` → `blocker-release` green-lights preview. `npm test` passes (482/482) including `circuit-breaker.test.ts` and `handoff-seat.test.ts`. No `[vercel build]` on this recut commit. Human look+test: [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md).

**088 fail-look skip (merged):** Red doors does not `fail-look` unwired or Cursor hard limit. Superseded by 036 Engineer triage + blocker hold. Merged [#174](https://github.com/bywale-com/travis/pull/174).

**086 runtime is the app (merged):** Walks wait for the mouth. Red `runtime-doors` fresh-adds `fail-look` when PR idle. Merged [#171](https://github.com/bywale-com/travis/pull/171).

**085 type-dest recut (merged):** Type send returns SSE and writes the user turn before role dest resolve; chip dests dispatch write-and-leave; SSE headers include `X-Accel-Buffering: no`. Merged on [PR #170](https://github.com/bywale-com/travis/pull/170).

**084 role dest timeout (merged):** Role dest resolves all sit roles (`isSitProtocolRole`), sit handoff uses `dispatchToSeat` write-and-leave, SSE emits immediate ping comment. Merged on [PR #169](https://github.com/bywale-com/travis/pull/169).

**020 runtime verify (merged):** `src/lib/live-connect.ts` — in-flight connect **waits**; unwired keeps **Travis isn't wired**; a real miss still gets the phone-ear shirt. Room hangs those rules. `npm test` covers the three lies. **Walks planted:** `src/runtime/desk.ts` + `doors.ts` + `walks/voice-wrap.spec.ts` + `type-send.spec.ts` + `come-back.spec.ts` + `type-dest.spec.ts`; `npm run test:runtime`; Action `.github/workflows/runtime-doors.yml` on `vercel.deployment.ready` paints check `runtime-doors`. Operator resolution accepts email (`test-runner@travis.internal`) with isolated room scope (`ownerId === viewerIds[0]`). Merged on [PR #165](https://github.com/bywale-com/travis/pull/165). Do not remint dest assemble / 031–035.

**Trail:** git + PRs. **One PR per initiative.** Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**036 circuit breaker recut on [#180](https://github.com/bywale-com/travis/pull/180).** PM look Fail: `handoff-seat.test.ts` red after handoff rewrite. Fixed by updating the test to assert the living-handoff contract (`This bind is living`, 036 current, 088/086 merged trail, next hotfix **089**, paste block) instead of the old bind-id chain. `npm test` 482/482 green. Await PM re-look. Do not remint 023–035 product pipe.

**035 stream architecture is planted on [#163](https://github.com/bywale-com/travis/pull/163).** Do not remint stream-intent / stream-dispatch.

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — **088** merged. Next number **089**. |
| One PR law | [`initiatives/README.md`](./initiatives/README.md) |
| Production | `https://travis-psi.vercel.app` |
| Store | Shared Postgres schema `travis`. Cloud Agent `DATABASE_URL` is the live DB. |
| Face | Phone-first Voice / Log / Backlog. Smoke there. |
| Last plant | **036 circuit breaker** · [#180](https://github.com/bywale-com/travis/pull/180). Prior: **Hotfix 088** · [#174](https://github.com/bywale-com/travis/pull/174). **086** · [#171](https://github.com/bywale-com/travis/pull/171). |

**Do not redo** 012–035 product pipe, 036 (once merged), 062, 064, 065, 077–088. Do not remint dest grain, Deep Agents hang, Cloud HTTP create, LangGraph checkpointer, or stream-intent / stream-dispatch. Do not send **That's fine.**

---

## Founder locks (keep)

- Preview builds only when commit message contains `[vercel build]`; production always builds (036).
- Handoff/hold labels: `wake-sa` · `wake-engineer` · `wake-pm-look` · `fail-look` · `blocker`. One seat at a time.
- Full-audit walks: `test:runtime` runs all specs; no fail-fast; Engineer triages tape on `fail-look`.
- Bucket B blocker: `BLOCKER-NNN-*.md` + no green-light tag → label `blocker` + Resend mail; founder clears ops and removes label.
- Do not use `[skip ci]` on seat commits — silences GitHub Actions too.
- Rooms list = last conversation first (061).
- One PR per initiative. Do not append PM or SA logs.

---

## Next Engineer job

1. If **fail-look** on an idle PR: read full walk tape; Bucket A → fix `src/`; any Bucket B → `BLOCKER-NNN-*.md` + push without `[vercel build]`.
2. Do not restart planted pockets. Do not remint 036 once merged.
3. When you stop: rewrite **Current** at the top of this file.

---

## Paste — new Engineer

```text
You are Travis's Engineer (full-stack implementer). Read docs/README.md "Engineer — identity" and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

Read docs/register/ENGINEER-HANDOFF.md first. Trail is git + PRs. One PR per initiative. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
