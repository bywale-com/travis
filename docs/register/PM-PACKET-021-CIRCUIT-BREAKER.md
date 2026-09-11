# Packet 021 — Circuit breaker: full-audit walks, triage, and blocker hold

**Number:** `021` — next packet is `022`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect. **SA** ascribes as **036** (or **037** if 036 is closed by 020).  
**When:** Named 2026-09-11.  
**Status:** Specified.  
**Wake:** sa  
**Test spec:** [`PM-PACKET-021-CIRCUIT-BREAKER-TEST.md`](./PM-PACKET-021-CIRCUIT-BREAKER-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Dumb runner, intelligent seat. Do not deploy into known wall-failures.  
**Builds on:** 020 runtime verify (walks are cumulative). Replaces brittle bash-regex classification in `runtime-doors.yml` with Engineer triage and circuit-breaker hold.  
**Next SA:** **036** / **037**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin.

---

## Founder lock

> The concept is not to try to fix everything, it’s identify the cause and fix it if it needs a fix and do whatever else is necessary to bridge the gap... Why would we state a clear failure as not a failure? It’s obviously a failure, just not a code failure...

> How about do something that notifies the team of the issue and problem huh?

> Think about it: an engineer plants something, pushes, Vercel builds, it runs the walk. The walk is cumulative, and each packet itself, if it’s not a fix to one of the things already in the walk, should add a new walk...

> It’s not that on the 1st failure in the walk, it sends back immediately. Why would it be that? No. It needs to complete everything so it can count and get all the failures, and then send back in the loop for the engineer to build.

> And then the engineer is who is going to say: "Oh, okay, this failure is not a code failure, this is for the founder to deal with. Oh, this is definitely a plant error, let me fix that."

> And then before it even pushes back: it has these other things that need to be sorted out that are founder errors. Before it says, "Okay, Vercel, you're good to build again." Because if Vercel builds again before those are done, it's going to come back for sure as failures. A waste of time and tokens... Before the packet is even going ready to be built on Vercel after the engineer has built its own side of the equation, the founder must fix his side before the deployment is initiated again.

---

## What broke (the model failure)

The models attempted to make GitHub Actions the triage brain using brittle bash regexes:
```bash
if grep -qE "Cannot use import|did not speak..." "$log"; then ...
elif grep -qE "isn.t wired|hard limit" "$log"; then ...
```

This produced two catastrophic failures:
1. **Silent Red / Lost Notification:** In Hotfix 088, the Action skipped `fail-look` on Cursor hard limits and unwired status, but did nothing else. The check sat red silently without notifying the founder.
2. **Infinite Doomed Relooping:** When an agent was woken on a combined failure (code error + $2 Cursor limit), if the agent fixed its code and pushed, Vercel immediately built. The walk re-ran against the *same* $2 limit, failed again, and re-woke another agent into an infinite, expensive loop.

GitHub Actions is a **dumb runner**. It must not classify root causes.  
The **Engineer is the triage brain**. The Engineer reads the tape, fixes code, detects platform blockers, and halts redeployment until the blocker is cleared.

---

## The Three Architecture Laws

### Law 0: Preview only after handoffs
Vercel **preview** is opt-in. Default skip. Production always builds.

The green light is an Action empty commit whose **first line is exactly** `Preview [vercel build]`. A seat commit that *names* the tag in the body — including “No `[vercel build]`” — must not build. That substring match is how #180 leaked a preview during PM Look. Seat subjects must not be that line.

Handoff / hold in process = the PR has any of: `wake-sa` · `wake-engineer` · `wake-pm-look` · `fail-look` · `blocker`. One seat label at a time (adding a wake strips the others).

When those labels are gone, a cheap Action empty-commits that exact subject. Then Vercel may build. Then `runtime-doors` may `fail-look` — on an idle PR, so Engineer picks up a quiet desk.

Do **not** use `[skip ci]` as the skip. That silences GitHub Actions (labeling) as well as Vercel.

### Law 1: Full-Audit Walks (No Fail-Fast)
The cumulative walk runner (`npm run test:runtime`) runs **all** walk specs to completion.
- It does not abort on the first failing assertion.
- It produces the complete tape and outcome ledger for the entire suite.
- If any walk fails: the deployment check `runtime-doors` is marked failure, the full tape is recorded, and `fail-look` is added to the PR.

### Law 2: Engineer Triage
When woken by `fail-look`, the Engineer inspects the complete walk tape and categorizes every failing item into exactly two buckets:
1. **Bucket A (Plant / Code Miss):** Syntax errors, ESM/CJS import issues, unhandled route exceptions, broken response formats.
2. **Bucket B (Founder Ops / Platform Blocker):** Cursor hard limit ($2 needed for Background Agent create), missing `OPENAI_API_KEY` on Vercel preview, database credentials unreachable.

The Engineer fixes all Bucket A code misses in `src/` and verifies them locally with `npm test`.

### Law 3: The Circuit Breaker & Hold
If Bucket B has any items:
1. **Do not green-light preview.** The Engineer must **NOT** put `[vercel build]` on the commit. Default skip already holds Vercel.
2. **File the Blocker:** The Engineer writes `docs/register/BLOCKER-NNN-*.md` detailing:
   - Exactly what failed on the tape.
   - The exact action required by the founder.
   - Direct link to resolve (e.g. `https://www.cursor.com/dashboard?tab=settings` or Vercel Environment Variables).
3. **Push the hold:** Stage `src/` and the blocker file. Commit **without** the green-light tag (do not use `[skip ci]` — that silences GitHub Actions).
4. **House Blocker Letter:** GitHub Action detects the blocker file on push, labels the PR `blocker`, removes seat wakes, and sends an email via Resend to `EMERGE_EMAIL`.
5. **Circuit Breaker Release:**
   - The founder resolves the blocker (tops up the $2 limit, sets the secret).
   - The founder removes the `blocker` label from the PR.
   - If no handoff labels remain, Action empty-commits the green-light tag. Vercel builds the code already on the branch.

---

## File Responsibilities (Architecture Plan)

### 0. Preview gate
- `vercel.json` `ignoreCommand` + `.github/scripts/vercel-ignore.sh`: preview skip unless this commit’s message contains `[vercel build]`. Production always builds.
- `.github/scripts/preview-when-clear.sh`: empty-commit that tag when handoff/hold labels are gone.

### 1. Verification Runner (Dumb Sensor)
- `.github/workflows/runtime-doors.yml`:
  - Runs `npm test` and `npm run test:runtime`.
  - Captures full walk output to `$RUNNER_TEMP/walks.txt`.
  - If any walk failed: paints Vercel check `runtime-doors` as failure.
  - Adds `fail-look` using `WAKE_GITHUB_TOKEN` so Engineer is woken with the tape.
  - **No bash regexes** classifying `Cannot use import` vs `hard limit`. All failures go to the Engineer.

### 2. Blocker Gate & Notification
- `.github/workflows/wake-packet-seats.yml`:
  - When a push touches `docs/register/BLOCKER-*.md`:
    - Label `blocker` on the PR.
    - Remove `fail-look`, `wake-engineer`, and `wake-pm-look` so automations sleep.
    - Run `.github/scripts/send-blocker-letter.py` to notify the founder.
  - On `pull_request` event with action `unlabeled` and label `blocker`:
    - If no handoff labels remain, empty-commit the green-light tag (same as post-handoff).

### 3. Blocker Mailer
- `.github/scripts/send-blocker-letter.py`:
  - Python script using existing Resend secrets (`EMERGE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`).
  - Subject: `[BLOCKER] <Pocket> blocked — <Cause>`
  - Body: Cause, required human action, direct URL, error excerpt from tape.

### 4. Engineer Protocol & Automation Prompt
- `house-now/automations/sa-complete-engineer.prompt.md`:
  - Reads full tape.
  - If tape contains external ops blockers:
    - Writes `docs/register/BLOCKER-NNN-*.md`.
    - Commits code fixes **without** the green-light tag.
    - Halts without re-triggering Vercel.

---

## Instructions for Systems Analyst (SA-036 / SA-037)

The Systems Analyst must ascribe:
1. **Stores & Contracts:**
   - Confirm whether `blocker` requires a row in `travis.initiative` or `travis.motion`, or if it is purely a git-level contract (markdown file + PR label).
   - If git-level, name the silence explicitly.
2. **Trigger Contracts:**
   - Exact GitHub Action trigger contract for label `blocker` removal (resuming the deployment).
   - Vercel deployment trigger contract: preview only when a commit message contains the green-light tag; production always builds.
3. **Write Systems Change Packet:**
   - Deliver `SYSTEMS-CHANGE-PACKET-036-CIRCUIT-BREAKER.md` on this PR branch.
