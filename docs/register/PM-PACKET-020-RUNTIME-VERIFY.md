# Packet 020 — Runtime verification (Engineer owns the loop)

**Number:** `020` — next packet is `021`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect. **SA** ascribes as **036**.  
**When:** Named 2026-09-10.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-020-RUNTIME-VERIFY-TEST.md`](./PM-PACKET-020-RUNTIME-VERIFY-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Compose, don’t invent.  
**Meaning:** PHASE-ONE-LOG **01:25 UTC 2026-09-10** — Engineer builds from the inside. Tester ∈ Engineer. Automate the mechanism, including Voice doors.  
**Builds on:** 019 file plan. Do not remint stream-intent, dest mail, or the checkpointer.  
**Next SA:** **036**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–019 / 027–035.

---

## Founder lock

> Actually, it's not even that difficult. It's actually very simple. Runtime verification. Right now, doesn't the engineer do it? When we spin up the engineer to work on stuff, doesn't it do it? And what is it runtime verifying? That's the real question.

> You don't need Cursor or Travis running as an in-app widget inside the browser while you tap around. … Vercel and PostHog act as the unified Telemetry & Verification Harness. … The coding agent lives in a void. It writes code, assumes it works, and hands it to you—making you the manual runtime sensor.

> When the AI engineer builds a feature, its definition of "done" isn't writing the syntax. … I wrote the code. I wrote the headless test that simulates the user. I executed the test against the runtime. PostHog and Vercel reported 0 uncaught exceptions and 200 OK network calls.

> By the time you open the Vercel Preview link, you aren't testing to see if it works; you're just verifying that you like the experience.

> Does locking in this workflow—where the agent generates the runtime test and listens to PostHog/Vercel telemetry before handing off the build—give you the clear blueprint you were looking for?

> Isn't there something we can do … inside of Vercel … rather than have Cursor … triage with Vercel … We can write the tests, but if there's anything inside of Vercel to implement those tests on the deployment … and then … send us back a signal … so that Cursor doesn't have … to do it.

> This is what Gemini and I are thinking. As the architect how should we put this into practice?

---

## What Engineer verifies today (inspect)

**No.** The spun Engineer does **not** runtime-verify Travis.

| What they do | What that is |
|--------------|----------------|
| `next build` | Compile. Not runtime. |
| `npm test` | Lib unit tests (`src/lib/*.test.ts`). Not the Voice doors. Not a preview. |
| “Manual smoke on the phone-first face” | Written. Almost never done by a cloud Engineer. |
| Architect look (Automation C) | After the plant. Often SSO wall. “Steps I could not do: Talk on a phone.” Pass-for-what-this-seat-could-do has emerged. |

There is no Playwright script in this repo. Playwright appears only as a transitive lockfile name. There is no PostHog. The only GitHub Action is the cheap seat-wake. Vercel previews exist. Deployment Checks are not hung. Nobody is required to hit the doors before “done.”

You are the runtime sensor. That is the void. Cursor sitting in Vercel MCP after every plant is the same void with extra steps.

---

## What runtime verification **is** (the contract)

Not “does he like Voice.” That is the human walk after emerge.

Runtime verification is: **this cut’s doors, on a real running app, did the thing the lock named, and the host did not 500 / HTML-as-JSON / lie.**

For Travis that means, for the pocket being planted:

1. The preview (or local server) is **up**.
2. A test the Engineer wrote **hit those doors** (HTTP and/or a headless browser).
3. The answers were the locked ones (JSON, 200, Live connect wait, unwired stays unwired, flush does not full-think, wrap is finalize).
4. **This deploy’s Deployment Check is green** — our door test ran **on that URL** and painted the check. Vercel (and PostHog **if** SA hangs it) show **no new uncaught exception** on those routes.

Done is all four. Syntax is not done. `npm test` green is not done. A Cursor agent who opened Vercel MCP and read logs is not done. A look that could not open Voice is not done.

---

## Gemini’s pieces — how they fit (not a pre-built Travis)

No box in that diagram is Travis. Each is one slice.

| Slice in the picture | What it actually does for the walk | What we already have | What we hang |
|----------------------|------------------------------------|----------------------|--------------|
| Agent writes the feature | Plant `src/` | Engineer | Unchanged |
| Agent writes the runtime test | Proves **this pocket’s doors** | Lib tests only. Packet `*-TEST.md` is a human sheet. | A runnable test next to the plant. Same PR. |
| Headless sandbox | Drive the running app without his thumbs | Vercel preview. No Playwright in-repo. | Playwright (or the same HTTP client) **against the preview URL**. Synthetic POSTs to `live/token`, `live/transcript`, `finalize`, `send`. **Not** a fake microphone first. |
| Vercel observability | Build fail, 500, runtime error on that deploy | Previews + logs. MCP can read them. | **Not** the sensor. Logs are for a red check. The sensor is the Deployment Check. |
| PostHog | Console, network, session replay while the headless run happens | **Nothing.** | SA’s first question: do Vercel errors + the test’s own asserts cover the contract? If yes, PostHog is named silence this cut. If no (need console/replay the test cannot see), hang PostHog as a **port**. Paid is allowed. Cost is a thought. Do not invent a Travis telemetry table. |
| Auto-patch loop | Agent reads the miss, plants again, re-runs | Fail look → Engineer | Same loop. The sensor is the **check**, not the founder and not Cursor-in-Vercel. |
| His preview click | Like the experience | Emerge letter | Stays. He is not the first person to find a 500. |

Do not put Travis or Cursor as a widget inside the phone while someone taps. Do not farm a phone. Do not inject a real mic in v1 of this cut.

---

## How we put it into practice (files, not code)

### 1. Definition of done (docs first)

| File | What goes in |
|------|----------------|
| `docs/BUILD-PROTOCOL.md` § Engineer | Done = plant + **this pocket’s** runtime test executed **on the deploy** + the Deployment Check green. `npm test` stays. It is not enough. Cursor does not triage Vercel. |
| `docs/seats/ENGINEER.md` § Verify | Same contract. Quote the preview URL, the check name, and green/red in `ENGINEER-HANDOFF.md`. If the preview has no OpenAI key, the test must assert **unwired**, not pretend Live is up. |
| `docs/register/house-now/protocols/engineer.md` | Must: the Deployment Check is the signal. Must-not: wake look while the check is not green; do not MCP-triage Vercel. |
| `docs/seats/TECHNICAL-ARCHITECT.md` | Look is glass + “do I like it” **after** the check is green. Architect is not the runtime sensor. “Pass for what this seat could do” after only `src/` or SSO is **not** Pass. |
| `docs/BUILD-PROTOCOL.md` § Look | Recut: Voice stays a **human like**. Mechanism of Voice is the Deployment Check. Do not treat a login wall as emerge. |

### 2. Mechanism tests (hang `npm test`)

| File | What goes in |
|------|----------------|
| `src/lib/live-connect.ts` — **new** (or extract) | The connect rules now trapped in `Room.tsx`: already up → true; in-flight → **wait**, do not return false; unwired is unwired; a real miss is a real miss. |
| `src/lib/live-connect.test.ts` — **new** | The three lies fail here: in-flight is not “Live down”; unwired is not the phone-ear shirt; a second arm does not start Web Speech. |
| `src/lib/ear.ts` / `live-harness.ts` / `conductor.ts` | Already tested. Keep. |
| `package.json` `test` | Include the new files. Still no browser. |

### 3. Runtime test (headless against a running app)

| File | What goes in |
|------|----------------|
| `src/runtime/doors.spec.ts` — **new** (Playwright or a thin fetch runner — SA names the hang) | Against `PLAYWRIGHT_BASE_URL` (this PR’s preview, or local). **Doors, not scenery.** |
| | `POST …/live/token` — if key present: `wired: true` and a token; if not: `wired: false`, never a `<!DOCTYPE`. |
| | `POST …/send` with a one-line Type — JSON or SSE, never HTML-as-JSON. |
| | `POST …/live/transcript` — does not full-pipe Travis think (019). 2xx or the locked JSON. |
| | `POST …/finalize` with “I’m done” — wrap door, not the ear. |
| | Optional Playwright page: Voice + Travis, subtitle is **not** `Travis Live is down — phone ear. Say “I’m done”.` when wired. When unwired, subtitle is **Travis isn’t wired**, not the phone-ear shirt. |
| `package.json` | Script `test:runtime`. Engineer may run it locally while planting. **Done** is the same script on the deploy, painted as a check. |
| `.github/workflows/runtime-doors.yml` — **new** (name SA may keep or recut) | Official Vercel hang. Listens for `repository_dispatch` type **`vercel.deployment.ready`**. Runs `test:runtime` against that deployment URL. Reports with `vercel/repository-dispatch/actions/status@v1`. That paint **is** the signal. |
| `.github/workflows/wake-packet-seats.yml` | Do **not** turn this Action into the sandbox. It stays the cheap label gate. |

Mic injection is **named silence**. The transcript and finalize POSTs **are** the Voice mechanism.

### 4. The signal lives on the deploy (not in Cursor)

Vercel does **not** run Playwright as a first-party product inside the app host. Vercel **does** have the gate: **Deployment Checks**. Production alias waits until required checks pass. Preview can require them too.

Official hang (compose — do not invent a Travis widget):

1. We write the door tests (`test:runtime`).
2. Vercel builds the preview and fires `vercel.deployment.ready` (not the deprecated `deployment_status`).
3. GitHub Actions runs **our** tests **on that URL**.
4. The Action paints a check with `vercel/repository-dispatch/actions/status@v1`.
5. That check is the signal. Green → look may sit. Red → Engineer plants again on this PR. Cursor does not open Vercel MCP on every plant to “see if it worked.”

SSO killed the 018 / 019 looks. The hang for that is `VERCEL_AUTOMATION_BYPASS_SECRET` + `x-vercel-protection-bypass`, so the Action can hit a protected preview. SA ascribes the secret. Do not turn protection off for the world.

Marketplace (Checkly, Endform, Autonoma) can run Playwright and paint the same check. Paid. Cost is a thought. Hang official Checks + our tests first. Marketplace only if SA says Actions cannot see the preview.

`vercel curl` and runtime logs are a probe after a red check. They are not the suite. Vercel Agent is PR review / incidents. It is not the test runner.

| File | What goes in |
|------|----------------|
| Vercel project → Deployment Checks | Require the `runtime-doors` check (exact name SA ascribes). Production alias waits. Preview required if SA says so. |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Repo + Vercel project secret so the Action can open an SSO preview. |
| `docs/register/ENGINEER-HANDOFF.md` | For every plant: preview URL; deploy id; **check name + green/red**; `npm test`. If the check is pending, look does not sit. |
| PostHog | Only if SA ascribes the port. Project key server-side. Capture during `test:runtime`. Do not mint `travis.posthog`. Do not hang it “because the diagram had it.” |

### 5. The loop

```
Architect packet (face + doors to prove)
        → SA ascribes stores + ports (Playwright hang, PostHog or silence)
        → Engineer plants + writes this pocket’s runtime test
        → Vercel deploys → Action runs the test on that URL → check paints
        → Red check → plant again (same PR). Cursor wakes on red, not on every deploy.
        → Green check → handoff names the check
        → Architect look (glass / like)
        → You walk the phone because you like it, not because it 500s
```

Fail look still exists. It should become rare. It is not the first sensor.

---

## Face (plain)

You open the preview to see if you like it. You do not open it to discover Live is down.

We write the tests. Vercel’s check runs them on the deployment and paints green or red. Cursor is not the person who sits in Vercel and asks whether it worked.

---

## Lock

1. **Engineer owns the tests.** Tester ∈ Engineer. No Tester seat. No Travis-in-the-browser widget.
2. **Done = code + this pocket’s runtime test + that test ran on the deploy + the Deployment Check is green.** Lib `npm test` stays and is not enough.
3. **Voice somehow = the three doors + the connect contract.** Synthetic POST. Playwright on the subtitle only when wired/unwired is known. No mic farm.
4. **The signal is the Vercel Deployment Check, not Cursor.** We write the tests. Vercel fires when the deploy is ready. Actions (or a Marketplace check) run them on that URL and paint. Cursor wakes on **red**, not to triage every plant.
5. **PostHog is a port, not a given.** SA’s first line: what the door test + the check already see vs what they cannot. Hang or name silence. Paid is allowed.
6. **Architect look is not the runtime sensor.** Recut “Voice stays human” to “Voice *like* stays human; Voice *doors* are the check.”
7. **019 stays.** Transcript does not full-pipe. Connect wait. Unwired is unwired. This packet is how those facts get proven without you.
8. **Compose.** Hang official Deployment Checks + GitHub Actions. Hang Playwright as a runner if we need a browser. Hang fetch if HTTP is enough. Marketplace (Checkly / Endform) only if Actions cannot see the preview. Do not write a Travis orchestrator. Do not have Cursor MCP-walk Vercel instead of the check.

---

## Technical cut (Engineer after SA)

Quoted.

The lie (comes **out** of `connectLive`):

```1027:1028:src/components/Room.tsx
      if (liveRef.current) return true;
      if (liveConnectingRef.current) return false;
```

The overwrite (comes **out** of `armEar`):

```1811:1817:src/components/Room.tsx
      const ok = await connectLive(sid);
      if (ok) return;
      setSubtitle("Travis Live is down — phone ear. Say “I’m done”.");
    startRecognitionRef.current();
```

Lib tests do not include the doors:

```10:10:package.json
    "test": "tsx --test src/lib/*.test.ts src/server/db/*.test.ts",
```

**Grain.** SA ascribes: Playwright vs fetch-only for `test:runtime`; official Checks + Actions vs Marketplace; bypass secret for SSO previews; whether the check is required on preview as well as production; PostHog port or silence; no new Travis table. Engineer hangs those. Extract `live-connect`. Do not remint 031–035.

---

## Must / must-not

- Engineer may not wake look until the Deployment Check is green, or a named blocker (no preview URL, no key — and then the test asserts unwired).
- Do not invent PostHog because a diagram had it.
- Do not put Hear it / Skip buttons back.
- Do not remint dest assemble, dest-gate, checkpointer, stream-intent.
- Do not farm a phone or inject a real microphone in this cut.
- Do not turn the wake Action into a test runner.
- Do not have Cursor sit in Vercel MCP and call that runtime verification.
- Do not turn protection off for the world so a test can get in. Hang the bypass secret.

---

## SA 036

Ascribe. Quote the Room connect lie and `package.json` `test`. Compose.

1. Inventory: Deployment Checks + `vercel.deployment.ready` + Actions vs Marketplace (Checkly / Endform). Identical or adjacent. Cost as a thought. Compose: official Checks first.
2. Name the primitive for `test:runtime` (Playwright official, or fetch). Hang, do not write a Travis browser.
3. Hang `VERCEL_AUTOMATION_BYPASS_SECRET` so the Action can hit an SSO preview. Do not drop Vercel Authentication for everyone.
4. Name the check (suggested `runtime-doors`). Required on production. Preview required — yes or no, and why.
5. PostHog: hang as port, or named silence because the door test + the check are enough this cut.
6. Do not overload `wake-packet-seats.yml`. Second workflow only.
7. Do not remint 031–035 / `dest_job` / 019 classify.
