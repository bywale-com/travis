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

There is no Playwright script in this repo. Playwright appears only as a transitive lockfile name. There is no PostHog. The only GitHub Action is the cheap seat-wake. Vercel previews exist. This seat can already read Vercel build logs and runtime errors. Nobody is required to do that before “done.”

You are the runtime sensor. That is the void.

---

## What runtime verification **is** (the contract)

Not “does he like Voice.” That is the human walk after emerge.

Runtime verification is: **this cut’s doors, on a real running app, did the thing the lock named, and the host did not 500 / HTML-as-JSON / lie.**

For Travis that means, for the pocket being planted:

1. The preview (or local server) is **up**.
2. A test the Engineer wrote **hit those doors** (HTTP and/or a headless browser).
3. The answers were the locked ones (JSON, 200, Live connect wait, unwired stays unwired, flush does not full-think, wrap is finalize).
4. Vercel (and PostHog **if** SA hangs it) show **no new uncaught exception** on those routes for that deploy.

Done is all four. Syntax is not done. `npm test` green is not done. A look that could not open Voice is not done.

---

## Gemini’s pieces — how they fit (not a pre-built Travis)

No box in that diagram is Travis. Each is one slice.

| Slice in the picture | What it actually does for the walk | What we already have | What we hang |
|----------------------|------------------------------------|----------------------|--------------|
| Agent writes the feature | Plant `src/` | Engineer | Unchanged |
| Agent writes the runtime test | Proves **this pocket’s doors** | Lib tests only. Packet `*-TEST.md` is a human sheet. | A runnable test next to the plant. Same PR. |
| Headless sandbox | Drive the running app without his thumbs | Vercel preview. No Playwright in-repo. | Playwright (or the same HTTP client) **against the preview URL**. Synthetic POSTs to `live/token`, `live/transcript`, `finalize`, `send`. **Not** a fake microphone first. |
| Vercel observability | Build fail, 500, runtime error on that deploy | Previews + logs. MCP can read them. | Engineer **must** read this deploy’s build + runtime errors before waking the look. |
| PostHog | Console, network, session replay while the headless run happens | **Nothing.** | SA’s first question: do Vercel errors + the test’s own asserts cover the contract? If yes, PostHog is named silence this cut. If no (need console/replay the test cannot see), hang PostHog as a **port**. Paid is allowed. Cost is a thought. Do not invent a Travis telemetry table. |
| Auto-patch loop | Agent reads the miss, plants again, re-runs | Fail look → Engineer | Same loop. The sensor is the test + Vercel, not the founder. |
| His preview click | Like the experience | Emerge letter | Stays. He is not the first person to find a 500. |

Do not put Travis or Cursor as a widget inside the phone while someone taps. Do not farm a phone. Do not inject a real mic in v1 of this cut.

---

## How we put it into practice (files, not code)

### 1. Definition of done (docs first)

| File | What goes in |
|------|----------------|
| `docs/BUILD-PROTOCOL.md` § Engineer | Done = plant + **this pocket’s** runtime test executed against a running app + Vercel (and PostHog if hung) quiet on those doors. `npm test` stays. It is not enough. |
| `docs/seats/ENGINEER.md` § Verify | Same contract. Quote the preview URL and the test command in `ENGINEER-HANDOFF.md`. If the preview has no OpenAI key, the test must assert **unwired**, not pretend Live is up. |
| `docs/register/house-now/protocols/engineer.md` | Must: runtime-verify the doors this cut touched. Must-not: wake look while the runtime test did not run. |
| `docs/seats/TECHNICAL-ARCHITECT.md` | Look is glass + “do I like it” **after** Engineer’s runtime test is green. Architect is not the runtime sensor. “Pass for what this seat could do” after only `src/` or SSO is **not** Pass. |
| `docs/BUILD-PROTOCOL.md` § Look | Recut: Voice stays a **human like**. Mechanism of Voice is Engineer’s test of the doors. Do not treat a login wall as emerge. |

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
| `package.json` | Script `test:runtime`. Engineer runs it. CI later if SA says the preview URL is available to Actions. |
| `.github/workflows/wake-packet-seats.yml` | Do **not** turn this Action into the sandbox. It stays the cheap label gate. A second workflow may run `test:runtime` when a preview URL exists — SA ascribes. |

Mic injection is **named silence**. The transcript and finalize POSTs **are** the Voice mechanism.

### 4. Telemetry (listen before handoff)

| File | What goes in |
|------|----------------|
| `docs/register/ENGINEER-HANDOFF.md` | For every plant: preview URL; `test` + `test:runtime` result; Vercel deploy id; “runtime errors on these routes: none / listed.” |
| Vercel | Already the sandbox. Engineer reads **this** deploy’s build log and runtime errors (CLI or the Vercel tools). Uncaught on `/api/session/*/live/*`, `/send`, `/finalize` is a fail. |
| PostHog | Only if SA ascribes the port. Project key server-side. Capture during `test:runtime`. Agent reads the last session’s exceptions. Do not mint `travis.posthog`. Do not hang it “because the diagram had it.” |

### 5. The loop

```
Architect packet (face + doors to prove)
        → SA ascribes stores + ports (Playwright hang, PostHog or silence)
        → Engineer plants + writes this pocket’s runtime test
        → Runs test against preview
        → Reads Vercel (and PostHog if hung)
        → Miss → plant again (same PR). No founder.
        → Green → handoff names the proof
        → Architect look (glass / like)
        → You walk the phone because you like it, not because it 500s
```

Fail look still exists. It should become rare. It is not the first sensor.

---

## Face (plain)

You open the preview to see if you like it. You do not open it to discover Live is down.

Engineer does not hand you a build that has not hit its own doors.

---

## Lock

1. **Engineer owns runtime verification.** Tester ∈ Engineer. No Tester seat. No Travis-in-the-browser widget.
2. **Done = code + this pocket’s runtime test + executed on a running app + host quiet.** Lib `npm test` stays and is not enough.
3. **Voice somehow = the three doors + the connect contract.** Synthetic POST. Playwright on the subtitle only when wired/unwired is known. No mic farm.
4. **Vercel is the sandbox we already have.** Read this deploy. Do not invent a second host.
5. **PostHog is a port, not a given.** SA’s first line: what Vercel + the test already see vs what they cannot. Hang or name silence. Paid is allowed.
6. **Architect look is not the runtime sensor.** Recut “Voice stays human” to “Voice *like* stays human; Voice *doors* are Engineer.”
7. **019 stays.** Transcript does not full-pipe. Connect wait. Unwired is unwired. This packet is how those facts get proven without you.
8. **Compose.** Hang Playwright as a test runner if we need a browser. Hang fetch if HTTP is enough. Do not write a Travis orchestrator that reimplements retry.

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

**Grain.** SA ascribes: Playwright vs fetch-only for `test:runtime`; PostHog port or silence; whether Actions can see the preview URL; no new Travis table. Engineer hangs those. Extract `live-connect`. Do not remint 031–035.

---

## Must / must-not

- Engineer may not wake look until the runtime test ran or a named blocker (no preview URL, no key — and then the test asserts unwired).
- Do not invent PostHog because a diagram had it.
- Do not put Hear it / Skip buttons back.
- Do not remint dest assemble, dest-gate, checkpointer, stream-intent.
- Do not farm a phone or inject a real microphone in this cut.
- Do not turn the wake Action into a test runner.

---

## SA 036

Ascribe. Quote the Room connect lie and `package.json` `test`. Compose.

1. Inventory: Vercel preview + logs vs PostHog vs Playwright. Identical or adjacent. Cost as a thought.
2. Name the primitive for `test:runtime` (Playwright official, or fetch). Hang, do not write a Travis browser.
3. PostHog: hang as port, or named silence because Vercel + asserts are enough this cut.
4. CI: second workflow or Engineer-only until preview URL is available. Do not overload wake-packet-seats.
5. Do not remint 031–035 / `dest_job` / 019 classify.
