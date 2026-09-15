# Work order — Outside look (do not trip the wires)

**Seat:** the **outside** agent (`outside-look`). Not Engineer B. Not SA. Not Technical Architect occupying those seats.  
**Canon packet:** [`PM-PACKET-022-SMARTER-LOOP.md`](./PM-PACKET-022-SMARTER-LOOP.md) (N-red escalate — **held**).  
**Not this agent:** Log · Look File is packet **021**. That door wakes **Engineer B** (`wake-engineer`).  
**Prompt paste (022, when go):** [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md)  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Why this page exists:** agents were rediscovering trip-wires every sitting. This is the work order. Read it before touching `src/` or labels.

You diagnose like the 2026-09-15 lived session: tape + question + Vercel logs + named room. You may specify. You may plant **if** specified-and-clear. You always land on **one PR**. Then you stop.

---

## One entry

| Entry | Wake | Where you sit |
|-------|------|----------------|
| **Smarter loop (022)** — N consecutive current-head `runtime-doors` reds | **Held.** Action does not yet add `outside-look` instead of `fail-look`. | The failing PR. |

**Look (021)** is not your wake. Founder File sits Engineer B.

Do not dest Travis seats as the canary.

---

## Wires (do not trip)

Paid for on [#190](https://github.com/bywale-com/travis/pull/190) and [#193](https://github.com/bywale-com/travis/pull/193). Not optional.

### 1. One PR

Work lands on the PR the desk door targeted. `git checkout` that head. Commit. Push. **Do not** `gh pr create`. **Do not** mint a cousin because a second seat sat.

### 2. Non-mutating canary

Do not dest Engineer (or any seated agent) with a line that asks them to edit files, commit, push, or update the handoff.

On `main` the dest canary is acknowledge-only:

```1:3:src/runtime/dest-canary.ts
export const DEST_CANARY =
  "Engineer, this is a Travis runtime canary. Acknowledge only. Do not edit files, commit, push, or update the handoff.";
```

Keep that line. Do not “leave a note” in `ENGINEER-HANDOFF.md` from a canary.

### 3. Handoff notes are not a plant (leave the exception)

`.github/workflows/wake-packet-seats.yml` treats `src/` **or** `docs/register/ENGINEER-HANDOFF.md` as plant-finished and strips seats / green-lights preview. **That exception stays.** Do not recut the Action to ignore handoff-only. Do not write canary notes into the handoff. If you must rewrite the handoff, you are finishing a real plant — then `test:preflight` and stop, same as Engineer.

### 4. Stale deploy SHA

`runtime-doors` compares `client_payload.git.sha` to the PR `headRefOid`. If they differ: keep `previewing`, no `fail-look`, no `outside-look`, no emerge. Do not strip `previewing` to sneak a second green-light. Do not label from a stale check.

### 5. Recut once, then stop

Same law as Engineer B. One sitting. Push. **Stop.** Do not watch doors. Do not stay subscribed. Do not recut because a later synchronize, Vercel preview, or merge event arrived on this same run.

### 6. Preflight before push; Live stays in both sensors

When the script exists: `npm run test:preflight` before every push that touches `src/` or runtime walks. Keep Live in `test:preflight` **and** `runtime-doors`. Do not remove Voice Live to make a red go green.

### 7. Bucket A vs Bucket B

| Bucket | What | Do |
|--------|------|-----|
| **A** | Plant / code | Fix on this PR. Preflight. Push. |
| **B** | Founder ops (Cursor hard limit, unwired preview, missing secrets) | `docs/register/BLOCKER-NNN-*.md`. Do not green-light. Action labels `blocker`. |

If any Bucket B: commit code fixes + blocker without the preview subject. Stop.

### 8. Do not invent a store. Do not append PM/SA logs.

Missing store/field is **SA** — name it; stop. Do not mint `travis.look` (or any table) from this sitting. Do not append `PHASE-ONE-LOG.md` or `SYSTEMS-ANALYST-LOG.md`. Trail is git + the PR description.

### 9. `previewing` is the mutex

If `previewing` is on: **stop**. Vercel has the ball. Do not push. Do not add seats.

### 10. Do not puppet Cursor Desktop. Keys stay server-side.

Supported path only (`@cursor/sdk` / Cloud Agents API). Never ship `CURSOR_API_KEY` to the phone. Do not open Vercel auth to the world.

---

## Tools (this list, not a safari)

Use what you need. Do not add a Travis telemetry table to avoid using these.

| Tool | For |
|------|-----|
| GitHub PR / files / labels | The failing (or targeted) PR. `gh pr view`, diff, labels. |
| GitHub Actions logs | Newest **current-head** `runtime-doors` run. Ignore stale SHA runs. |
| Cursor cloud-agent list / transcripts | Recent Engineer B / outside sittings on **this** PR. Do not start from a random transcript as the handoff. |
| Vercel logs for **this** deploy URL | HTTP status, timeouts (the lived specimen was `/api/session/.../events` 60s). Not every project log. |
| Live Postgres **read** of the named room | `DATABASE_URL` runtime secret. Session id + turns. Do not echo the URL. Do not migrate. Do not UPDATE unless the plant requires it and SA already ascribed. |
| Magic-link / automation bypass | Only as already hung (`VERCEL_AUTOMATION_BYPASS_SECRET`, `TRAVIS_TEST_OPERATOR_COOKIE`). |
| Preview URL | The deployment that failed, or the session’s desk. Production psi if that is the file. |

Do not sit in Vercel MCP and call that done. Do not ask the founder to re-explain the tape if the session id is in the wake.

---

## Diagnose (the job)

Match the 15 Sep sitting:

1. Name the session id + founder note + selected turns (and the PR/deploy if the desk knew one).
2. Read the tape of the named room (Postgres and/or Log). Read Vercel logs for that URL around the miss.
3. Split **ear / mouth / continuity / dest / doors**. The specimen: Live token/SDP/transcript 200; `/events` timed out; founder asked “What was I just asking you?” with no reply. Ear mostly worked; mouth/continuity did not.
4. Bucket A vs B. Specified-and-clear vs not.

Then either plant, or write a hotfix/spec on **this** PR that Engineer can plant, or name the SA hole and stop.

---

## After this sitting (labels)

Remove `outside-look` when you push the outcome.

| Outcome | Label |
|---------|--------|
| Complete Bucket A plant (`src/` matches the miss) | Nothing extra. Existing plant-finished path strips seats and may green-light. **Do not** add `fail-look`. |
| Spec / partial plant remains | `fail-look` so Engineer B continues on **this** PR. |
| Bucket B | `BLOCKER-NNN` file; Action adds `blocker`. |
| Specified but not clear (missing store) | Name it on the PR. Do not mint. No `fail-look` that asks Engineer to invent a table. |

Never use the exact subject `Preview [vercel build]`.

**Update the PR description** in plain English (this PR’s cuts only). Canon: [`PR-AUTOMATION-RULES.md`](./PR-AUTOMATION-RULES.md) § 4.

---

## Count (022 — held)

N-red escalate is **packet 022**. Do not plant it from a Look sitting. Until 022 lands, every idle current-head red still `fail-look`s Engineer B.

---

## Must-not (short)

- Cousin PR. Watch-doors. Mutating canary. Handoff notes as a fake plant you intended. Strip `previewing`. Remove Live from sensors. Mint a table. Append PM/SA logs. Save+Activate automations. World-open Vercel login. Desktop Cursor puppet.
