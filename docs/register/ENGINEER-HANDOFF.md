# Engineer seat handoff — 2026-09-11

**This bind is done.** Last prior bind: `bc-c3986494-c045-4b4c-8d86-dafc49fa918a` (Cursor Automation fail-look). Prior: `bc-749b9dd2-168c-4e3a-ae24-cfe8b8cff07d`. Do not start from a transcript.

**036 SA ascribe landed (this PR):** [`SYSTEMS-CHANGE-PACKET-036-CIRCUIT-BREAKER.md`](./SYSTEMS-CHANGE-PACKET-036-CIRCUIT-BREAKER.md) signed — git-level blocker contract (markdown + PR labels), no new DB tables. Plant from 021 recut already matches: dumb `runtime-doors`, full-audit walks, Engineer triage prompts, `BLOCKER-*.md` + `blocker` label hold, Resend mail, unlabel redeploy.

**021 fail-look recut (2026-09-11, automation wake):** Run [34630538050](https://github.com/bywale-com/travis/actions/runs/34630538050): 4/5 pass, `type-dest` Cursor hard limit — **Bucket B only.** Root cause of re-added `fail-look`: `repository_dispatch` runs `runtime-doors` from **main** (no blocker skip until #177 merges). Recut: `strip-fail-look-under-blocker` job on `fail-look` label add while `blocker` active; refreshed BLOCKER-001. Pushed `[vercel skip]`.

**021 fail-look recut (prior):** Runs 34621326711–34630079165 — Bucket A ESM fix (087), Bucket B Cursor hard limit. Blocker skip in `runtime-doors.yml` on #177; push-time strip in `wake-packet-seats`. See git log on #177.

**088 fail-look skip (superseded on #177):** 021 replaces bash-regex skip with Engineer triage + blocker hold. 088 remains on `main` until #177 merges.

**086 runtime is the app (merged):** Walks wait for the mouth. Red `runtime-doors` fresh-adds `fail-look`. Merged [#171](https://github.com/bywale-com/travis/pull/171).

**085 type-dest recut (merged):** Type send returns SSE and writes the user turn before role dest resolve. Merged [#170](https://github.com/bywale-com/travis/pull/170).

**Trail:** git + PRs. **One PR per initiative.** Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**021 / 036 circuit breaker planted on [#177](https://github.com/bywale-com/travis/pull/177).** Bucket A done (4/5 walks green; ESM fix confirmed). **Still blocked:** `type-dest` needs Cursor Background Agent hard limit ≥ $2. Do not remove `blocker` until limit is topped up. When cleared, remove `blocker` → `release-blocker` redeploys → all 5 walks should pass. `strip-fail-look-under-blocker` breaks the automation loop until #177 merges (main `runtime-doors` still lacks skip). Then Technical Architect look+test per [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md).

**035 stream architecture is planted on [#163](https://github.com/bywale-com/travis/pull/163).** Do not remint stream-intent / stream-dispatch.

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — next number **089** |
| Blocker | [`BLOCKER-001-CURSOR-HARD-LIMIT.md`](./BLOCKER-001-CURSOR-HARD-LIMIT.md) |
| SA packet | [`SYSTEMS-CHANGE-PACKET-036-CIRCUIT-BREAKER.md`](./SYSTEMS-CHANGE-PACKET-036-CIRCUIT-BREAKER.md) |
| One PR law | [`initiatives/README.md`](./initiatives/README.md) |
| Production | `https://travis-psi.vercel.app` |
| Last plant | **021 circuit breaker + 036 ascribe** · [#177](https://github.com/bywale-com/travis/pull/177) |

**Do not redo** 012–035, 081, 062–080, 087 ESM (on #177), or remint dest grain.

**034 what exists** · [#161](https://github.com/bywale-com/travis/pull/161). **033 lived redesign** · [#159](https://github.com/bywale-com/travis/pull/159). **032 compose the send harness** · [#157](https://github.com/bywale-com/travis/pull/157). **031 dest harness recut** · [#154](https://github.com/bywale-com/travis/pull/154). **081 Voice uses the Type hang**. **079 Talk HTML as JSON** · [#149](https://github.com/bywale-com/travis/pull/149). **029 The room stays live** · [#144](https://github.com/bywale-com/travis/pull/144). **026 Serve** · [#134](https://github.com/bywale-com/travis/pull/134). **076 dest closer** · [#130](https://github.com/bywale-com/travis/pull/130). **Hotfix 062** · [#98](https://github.com/bywale-com/travis/pull/98). **One PR per initiative.** **You are a NEW bind.** **next hotfix number** **089**.

---

## Next Engineer job

1. If `blocker` is still on #177: **stop**. Founder must clear Cursor hard limit and remove the label.
2. After redeploy green: Technical Architect look+test per [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md).

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
