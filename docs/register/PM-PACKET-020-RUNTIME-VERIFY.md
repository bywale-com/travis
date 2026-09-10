# Packet 020 — Runtime verification (cumulative doors on every deploy)

**Number:** `020` — next packet is `021`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect. **SA** ascribes as **036**.  
**When:** Named 2026-09-10. Recut same day: Checks, then cumulative simulation.  
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

> Isn't there something we can do … inside of Vercel … rather than have Cursor … triage with Vercel … We can write the tests, but if there's anything inside of Vercel to implement those tests on the deployment … and then … send us back a signal … so that Cursor doesn't have … to do it.

> Exactly how is it going to write the test? Because … every single time the deployment runs, it's going to run our tests. Why? Because … we don't know what if a deployment has broken things that existed in the past. So, really, the tests are … cumulative … We keep adding to the same tests, so that when a deployment … is deployed, those tests run. And it's a very different kind of test … I really want to see how … we're going to simulate some of these tests, because they're not, like. So, just go deeper.

> This is what Gemini and I are thinking. As the architect how should we put this into practice?

---

## What Engineer verifies today (inspect)

**No.** The spun Engineer does **not** runtime-verify Travis.

| What they do | What that is |
|--------------|----------------|
| `next build` | Compile. Not runtime. |
| `npm test` | Lib unit tests (`src/lib/*.test.ts`). Not the Voice doors. Not a preview. Already cumulative for **functions**. Silent for **the running app**. |
| “Manual smoke on the phone-first face” | Written. Almost never done by a cloud Engineer. |
| Architect look (Automation C) | After the plant. Often SSO wall. “Steps I could not do: Talk on a phone.” Pass-for-what-this-seat-could-do has emerged. |

There is no Playwright script in this repo. Playwright appears only as a transitive lockfile name. There is no PostHog. The only GitHub Action is the cheap seat-wake. Vercel previews exist. Deployment Checks are not hung. Nobody is required to hit the doors before “done.”

You are the runtime sensor. That is the void. Cursor sitting in Vercel MCP after every plant is the same void with extra steps.

---

## What runtime verification **is** (the contract)

Not “does he like Voice.” That is the human walk after emerge.

Runtime verification is: **the doors we have already locked, on a real running app, still do the thing, and this plant did not break yesterday’s doors.**

It is not one throwaway script for the pocket that just landed. It is one growing suite. Every deploy runs the whole suite. Engineer **adds** a case when a new door is planted, or when a lived miss gets a name. Engineer does not replace the old cases.

For Travis that means, on **this** deploy’s URL:

1. The preview is **up**.
2. The **whole** runtime suite hits the doors (HTTP, and the glass subtitle when Playwright is hung).
3. The answers were the locked ones (JSON, 200, Live connect wait, unwired stays unwired, flush does not full-think, wrap is finalize, Type is not HTML-as-JSON).
4. **This deploy’s Deployment Check is green** — that suite ran **on that URL** and painted the check.

Done is all four. Syntax is not done. `npm test` green is not done. A Cursor agent who opened Vercel MCP and read logs is not done. A look that could not open Voice is not done. A green check that only ran this pocket’s new case is not done.

---

## Three kinds of test (do not mix them)

Voice on a phone is not a function. It is also not a mystery. By the time Travis has to **do** something, the ear has already turned sound into text. Our doors take that text. The tests that can fail a deploy are the ones that post that text into those doors.

| Kind | Where | What it proves | When it runs |
|------|--------|----------------|--------------|
| **Lib** | `src/lib/*.test.ts` | Pure rules: `wantedEar`, `liveShouldPipeTravis` is false, conductor phrase, stream-intent. The connect **lie** once it is extracted from `Room.tsx`. | `npm test` on the Engineer’s plant, and again in the same Action that runs the runtime suite. Fast. No preview. |
| **Runtime doors** | `src/runtime/*.spec.ts` | The **running** preview: token, transcript, finalize, send. Status, content-type, JSON vs HTML, unwired vs wired. | **Every** Vercel deploy, whole folder. Cumulative. |
| **Glass** | `src/runtime/glass.spec.ts` (Playwright, if SA hangs it) | What `Room.tsx` writes on the subtitle after `armEar` — the phone-ear shirt vs “Travis isn’t wired.” No microphone. | Same Action, same URL. Cumulative. |

`npm test` already has dozens of lib cases. Those stay. They never saw the 079 HTML 500, because that 500 only exists when Next is serving the route. They never saw Live-down on the glass, because that string is set in `armEar` after `connectLive` returns false. That is why we need the other two kinds.

---

## How Engineer writes a test (the job, every plant)

There is no Travis widget that “generates tests.” Engineer writes them the same way they write the plant: in the same PR, in the files that already own that door.

1. Read the packet. It names the door that must stay true (for this cut: token, transcript, finalize, send, connect wait, unwired named).
2. Open `src/runtime/` and find the file named after **that door**, not after the packet number. `token.spec.ts`. `transcript.spec.ts`. `finalize.spec.ts`. `send.spec.ts`. A comment may say “019 — flush does not think” so we know why the case exists. The filename is the door.
3. **Add** a `test(…)` case. Do not delete last month’s cases. Do not mint `packet-020.spec.ts` that nobody will run in 021.
4. If the door is new, add a new file in that folder. Same helpers (`src/runtime/helpers.ts`): base URL, bypass header, open a **test** room, `assertNotHtml`, `readJsonOrFail`.
5. If the miss is inside `Room.tsx` and cannot be POSTed (in-flight connect returns false), extract the rule into `src/lib/live-connect.ts` and add a **lib** test. That is still cumulative. It is not a substitute for the HTTP suite.
6. Push. Vercel deploys. The Action runs **every** file in `src/runtime/` against that URL. The check is green or red for the whole pile.

That is how the suite stays cumulative. The next plant that only touches Backlog still runs Voice token. The next plant that only touches Voice still runs Type send. That is the point.

---

## How we simulate Voice (this is the different kind)

### What the phone actually does (inspect)

You speak. The ear is OpenAI Realtime (`startTravisLive` in `src/lib/travis-live-client.ts`) or, when Live is down, the phone’s Web Speech recognizer. Both of those jobs end the same way: **a string of text.** Then our app posts that string.

| Phone moment | What already exists in `src/` | What the runtime test does |
|--------------|-------------------------------|----------------------------|
| Open the room | `POST /api/session` — open or resume | Same POST. Hold the `session.id`. |
| Arm Live | `POST /api/session/:id/live/token` — first line of `startTravisLive` | Same POST. No WebRTC after that. |
| A spoken line while Live is up | Realtime flush → `POST /api/session/:id/live/transcript` `{ role: "user", text }` | Same POST with a frozen sentence. We never open a microphone. |
| “I’m done” | `POST /api/session/:id/finalize` `{ utterance }` | Same POST. The utterance already includes the done-phrase, the way the client sends it. |
| Type a line | `POST /api/session/:id/send` `{ text }` | Same POST. |

We do **not** simulate the microphone. We do **not** negotiate WebRTC with OpenAI. We do **not** inject `getUserMedia`. GitHub Actions has no mic, and a live Realtime call from CI would prove OpenAI’s ear, not our doors. The lived misses (079 HTML-as-JSON, 080 ESM, 019 think-on-flush, unwired overwritten by the phone-ear shirt) all sat **after** the text existed.

The simulation is: **be the client after the ear.** Post the bodies `travis-live-client.ts` and `Room.tsx` already post. Assert the answers those routes already return.

### Setup every run (shared helper)

`src/runtime/helpers.ts` — **new**.

- `BASE_URL` from the deploy (the Action receives the preview URL on `vercel.deployment.ready`).
- Header `x-vercel-protection-bypass` from `VERCEL_AUTOMATION_BYPASS_SECRET` so Vercel Authentication does not return the SSO HTML page. That SSO page is what the 018 / 019 looks hit. If the test parses it as JSON, it will lie.
- Open a room with `POST ${BASE_URL}/api/session`. Cookie / operator as SA ascribes (see grain below). **Must not** be the founder’s living tape. Preview and production share schema `travis`. Open desk on production resumes **his** room. A test operator whose email is **not** on the seed list gets its own rooms (`operatorRoomScope`). SA names that operator and the cookie secret. Do not mint a `travis.test_run` table.
- Helper `assertNotHtml(res)`: body must not start with `<!DOCTYPE` / `<html`. Status and `content-type` must be JSON or `text/event-stream`. This is 079, as a machine.

### Case by case (first plant of this suite)

These cases are the starting pile. They stay forever. Later packets add more cases to the same files.

**1. `src/runtime/token.spec.ts`**

The phone’s first Live call is:

`POST /api/session/:id/live/token`

No body. Same as `startTravisLive`.

- If this deploy has no `OPENAI_API_KEY`: JSON `{ wired: false }`. Never a token. Never HTML. This is an unwired preview telling the truth.
- If the key is present: JSON `{ wired: true, token: … }` or `{ wired: false }` if mint failed. Still never HTML.
- `content-type` includes `json`. Status is 200 or a named JSON error, not a Next error page.

We do not then POST that token to `api.openai.com`. Wired true means “the door that mints an ephemeral secret answered.” It does not mean Realtime audio is up. That is named silence for v1 of this suite.

**2. `src/runtime/transcript.spec.ts`**

When you speak a line to Travis on Live, the client does **not** call finalize. It posts the phrase:

`POST /api/session/:id/live/transcript`  
`{ "role": "user", "text": "are you able to do that now?" }`

That is the 019 lock. `liveShouldPipeTravis` is always false. The route must **not** start `pipeTravisText`. It must not return `text/event-stream` for a line that is only to Travis. It returns JSON `{ ok: true, turn, here }` (or `dropped`, or `serveSpeak`).

Assert:

- Not HTML.
- `content-type` is JSON, not `text/event-stream`.
- Body has `ok: true` (or the locked drop/serve shape). It does not stream Travis think.

A dest **send** on that same route (call-by-name to a Cursor seat with a remainder) **does** return SSE today. That is a later case in the **same** file when we want to prove dest still leaves. First plant: Travis-only phrase. Do not remint dest assemble to make the test pretty.

**3. `src/runtime/finalize.spec.ts`**

“I’m done” is wrap, not the ear. The client posts:

`POST /api/session/:id/finalize`  
`{ "utterance": "One-line note on the tape. I'm done" }`

`jsonRoute` wraps this door. A throw before SSE must be JSON `{ error }`, not Next’s HTML 500. A good wrap returns `text/event-stream`.

Assert:

- Not HTML. Not `Unexpected token '<'` material.
- `content-type` is `text/event-stream` **or** `application/json` with `{ error }` / `{ matched: false }`.
- We do **not** wait for Deep Agents to finish a clever reply, and we do **not** assert what Travis said. We assert the door answered as a door. Full invoke on every deploy is a thought (time + cost). SA ascribes: headers + first bytes this cut, or wait the stream. Prefer headers + first bytes unless a lived miss was “SSE started then died.”

**4. `src/runtime/send.spec.ts`**

Type does not use a done-phrase. The composer posts:

`POST /api/session/:id/send`  
`{ "text": "One-line note on the tape." }`

Same pipe as voice wrap: `pipeTravisText` on SSE. Same HTML-as-JSON miss.

Assert: not HTML; SSE or JSON error. Do not assert the opinion in the reply.

**5. `src/runtime/glass.spec.ts` — Playwright, if SA hangs it**

The phone-ear shirt is **not** on any HTTP response. It is this, in `Room.tsx`:

```
const ok = await connectLive(sid);
if (!ok) setSubtitle("Travis Live is down — phone ear. Say “I’m done”.");
```

`connectLive` is false when the token door says unwired, when WebRTC dies, or when a connect is already in flight (the lie: `liveConnectingRef.current` → `return false`).

HTTP cannot see the subtitle. Playwright can, without a mic:

- Open the preview with the bypass header (and the test cookie).
- The room arms Live on enter. Token runs. Subtitle is in the DOM.
- Unwired deploy: subtitle is **Travis isn’t wired**. It is **not** the phone-ear shirt.
- We do not click Talk. We do not grant the microphone. We read the line.

The in-flight lie still cannot be seen that way (it is a race inside one page). That rule comes **out** of `connectLive` into `src/lib/live-connect.ts` and fails in `npm test`. Two tests, two jobs.

If SA names Playwright silence this cut, the glass case waits. The HTTP cases still plant. The shirt then stays a look risk until Playwright is hung. Name that.

### What we refuse to simulate

- A real microphone, a spoken fixture file, or `getUserMedia` in CI.
- A Realtime WebRTC session against OpenAI as the proof of **our** doors.
- Driving the Cursor desktop chat UI.
- Writing turns onto the founder’s living room. Test operator, own rooms.
- Asserting that Travis’s reply was good. That is like. Mechanism is the door.

---

## Gemini’s pieces — how they fit (not a pre-built Travis)

No box in that diagram is Travis. Each is one slice.

| Slice in the picture | What it actually does for the walk | What we already have | What we hang |
|----------------------|------------------------------------|----------------------|--------------|
| Agent writes the feature | Plant `src/` | Engineer | Unchanged |
| Agent writes the runtime test | **Adds** a case to the cumulative door suite | Lib tests only. Packet `*-TEST.md` is a human sheet. | Cases in `src/runtime/`. Same PR. Never a one-off packet file. |
| Headless sandbox | Drive the running app without his thumbs | Vercel preview. No Playwright in-repo. | Fetch against the preview URL for doors. Playwright only for the subtitle. **Not** a fake microphone. |
| Vercel observability | Build fail, 500, runtime error on that deploy | Previews + logs. MCP can read them. | **Not** the sensor. Logs are for a red check. The sensor is the Deployment Check. |
| PostHog | Console, network, session replay while the headless run happens | **Nothing.** | SA’s first question: do the door asserts cover the contract? If yes, PostHog is named silence this cut. If no (need console/replay the test cannot see), hang PostHog as a **port**. Paid is allowed. Cost is a thought. Do not invent a Travis telemetry table. |
| Auto-patch loop | Agent reads the miss, plants again, re-runs | Fail look → Engineer | Same loop. The sensor is the **check**, not the founder and not Cursor-in-Vercel. |
| His preview click | Like the experience | Emerge letter | Stays. He is not the first person to find a 500. |

Do not put Travis or Cursor as a widget inside the phone while someone taps. Do not farm a phone. Do not inject a real mic in v1 of this cut.

---

## How we put it into practice (files, not code)

### 1. Definition of done (docs first)

| File | What goes in |
|------|----------------|
| `docs/BUILD-PROTOCOL.md` § Engineer | Done = plant + **new cases added to the cumulative suite** + that **whole suite** ran on this deploy + the Deployment Check green. `npm test` stays. It is not enough. Cursor does not triage Vercel. |
| `docs/seats/ENGINEER.md` § Verify | Same contract. Add to `src/runtime/`, do not mint a packet-named spec. Quote the preview URL, the check name, and green/red. Unwired asserts unwired. |
| `docs/register/house-now/protocols/engineer.md` | Must: add to the suite; the check is the signal. Must-not: wake look while the check is not green; do not MCP-triage Vercel; do not drop old cases. |
| `docs/seats/TECHNICAL-ARCHITECT.md` | Look is glass + “do I like it” **after** the check is green. Architect is not the runtime sensor. |
| `docs/BUILD-PROTOCOL.md` § Look | Voice *like* stays human. Voice *doors* are the cumulative check. |

### 2. Mechanism tests (hang `npm test`)

| File | What goes in |
|------|----------------|
| `src/lib/live-connect.ts` — **new** (or extract) | The connect rules now trapped in `Room.tsx`: already up → true; in-flight → **wait**, do not return false; unwired is unwired; a real miss is a real miss. |
| `src/lib/live-connect.test.ts` — **new** | The three lies fail here: in-flight is not “Live down”; unwired is not the phone-ear shirt; a second arm does not start Web Speech. |
| `src/lib/ear.ts` / `live-harness.ts` / `conductor.ts` | Already tested. Keep. They are already cumulative. |
| `package.json` `test` | Include the new lib files. Still no browser. |

### 3. Runtime suite (cumulative, against the running app)

| File | What goes in |
|------|----------------|
| `src/runtime/helpers.ts` — **new** | Base URL, bypass header, test-operator cookie, `openRoom()`, `assertNotHtml()`, `readJsonOrFail()`. |
| `src/runtime/token.spec.ts` — **new** | Token door. Wired / unwired. Never HTML. |
| `src/runtime/transcript.spec.ts` — **new** | User phrase to Travis. JSON `ok`, not SSE think. |
| `src/runtime/finalize.spec.ts` — **new** | “I’m done” wrap. SSE or JSON error, never HTML. |
| `src/runtime/send.spec.ts` — **new** | Type one line. SSE or JSON error, never HTML. |
| `src/runtime/glass.spec.ts` — **new** (if Playwright hung) | Voice subtitle after arm. Unwired ≠ phone-ear shirt. No mic. |
| `package.json` | Script `test:runtime`. Engineer may run it locally while planting. **Done** is the Action running the **folder** on the deploy. |
| `.github/workflows/runtime-doors.yml` — **new** (name SA may keep or recut) | `repository_dispatch` type **`vercel.deployment.ready`**. `npm test` then `test:runtime` against that URL. Reports with `vercel/repository-dispatch/actions/status@v1`. That paint **is** the signal. |
| `.github/workflows/wake-packet-seats.yml` | Do **not** turn this Action into the sandbox. It stays the cheap label gate. |

Mic injection is **named silence**. The transcript and finalize POSTs **are** the Voice mechanism.

### 4. The signal lives on the deploy (not in Cursor)

Vercel does **not** run Playwright as a first-party product inside the app host. Vercel **does** have the gate: **Deployment Checks**. Production alias waits until required checks pass. Preview can require them too.

Official hang (compose — do not invent a Travis widget):

1. We write the door tests into `src/runtime/` and keep adding to them.
2. Vercel builds the preview and fires `vercel.deployment.ready` (not the deprecated `deployment_status`).
3. GitHub Actions runs **the whole suite** **on that URL**.
4. The Action paints a check with `vercel/repository-dispatch/actions/status@v1`.
5. That check is the signal. Green → look may sit. Red → Engineer plants again on this PR. Cursor does not open Vercel MCP on every plant to “see if it worked.”

SSO killed the 018 / 019 looks. The hang for that is `VERCEL_AUTOMATION_BYPASS_SECRET` + `x-vercel-protection-bypass`, so the Action can hit a protected preview. SA ascribes the secret. Do not turn protection off for the world.

Marketplace (Checkly, Endform, Autonoma) can run Playwright and paint the same check. Paid. Cost is a thought. Hang official Checks + our tests first. Marketplace only if SA says Actions cannot see the preview.

`vercel curl` and runtime logs are a probe after a red check. They are not the suite. Vercel Agent is PR review / incidents. It is not the test runner.

| File | What goes in |
|------|----------------|
| Vercel project → Deployment Checks | Require the `runtime-doors` check (exact name SA ascribes). Production alias waits. Preview required if SA says so. |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Repo + Vercel project secret so the Action can open an SSO preview. |
| Test operator cookie | Not the seed inbox. Own rooms. Must not resume the founder’s tape. SA names the secret. |
| `docs/register/ENGINEER-HANDOFF.md` | For every plant: preview URL; deploy id; **check name + green/red**; `npm test`; which cases were **added**. If the check is pending, look does not sit. |
| PostHog | Only if SA ascribes the port. Do not mint `travis.posthog`. Do not hang it “because the diagram had it.” |

### 5. The loop

```
Architect packet (face + doors to prove)
        → SA ascribes stores + ports (Playwright hang, test operator, PostHog or silence)
        → Engineer plants + adds cases to src/runtime/ (and lib extract if the lie is client)
        → Vercel deploys → Action runs the whole suite on that URL → check paints
        → Red check → plant again (same PR). Cursor wakes on red, not on every deploy.
        → Green check → handoff names the check
        → Architect look (glass / like)
        → You walk the phone because you like it, not because it 500s
```

Fail look still exists. It should become rare. It is not the first sensor.

---

## Face (plain)

You open the preview to see if you like it. You do not open it to discover Live is down.

We keep one pile of door tests and we only add to it. Every deploy runs that whole pile on the new URL. The tests are not a person talking into a mic. They are the same HTTP the phone already makes after the ear has turned speech into a sentence. Vercel’s check paints green or red. Cursor is not the person who sits in Vercel and asks whether it worked.

---

## Lock

1. **Engineer owns the tests.** Tester ∈ Engineer. No Tester seat. No Travis-in-the-browser widget.
2. **The suite is cumulative.** Every deploy runs **all** runtime cases, not only the pocket that just landed. Engineer **adds** cases. Engineer does not mint a packet-named spec and move on.
3. **Done = code + new cases in the suite + the whole suite ran on the deploy + the Deployment Check is green.** Lib `npm test` stays and is not enough.
4. **Voice somehow = post the text the ear would have posted.** Token, transcript, finalize, send. No mic farm. No Realtime session as the proof. Playwright on the subtitle only. Connect wait is a lib extract.
5. **The signal is the Vercel Deployment Check, not Cursor.** Cursor wakes on **red**.
6. **Do not write on his tape.** Test operator, own rooms. Shared `travis` schema is why.
7. **PostHog is a port, not a given.** Hang or name silence.
8. **Architect look is not the runtime sensor.** Voice *like* stays human. Voice *doors* are the check.
9. **019 stays.** Transcript does not full-pipe. Connect wait. Unwired is unwired.
10. **Compose.** Hang official Deployment Checks + GitHub Actions + fetch. Hang Playwright for glass. Marketplace only if Actions cannot see the preview. Do not write a Travis orchestrator. Do not have Cursor MCP-walk Vercel instead of the check.

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

The Live client already posts the bodies we will post:

```30:32:src/lib/travis-live-client.ts
  const tokenRes = await fetch(`/api/session/${opts.sessionId}/live/token`, {
    method: "POST",
  });
```

```77:86:src/lib/travis-live-client.ts
    const res = await fetch(`/api/session/${opts.sessionId}/live/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          text,
          referenceTurnId: opts.getReferenceTurnId?.() ?? null,
        }),
    });
```

Lib tests do not include the doors:

```10:10:package.json
    "test": "tsx --test src/lib/*.test.ts src/server/db/*.test.ts",
```

Open desk on production resumes the preferred operator’s room. Preview `VERCEL_ENV` is not production, so `isOpenDesk()` is false unless `TRAVIS_OPEN_DESK` is on. Cookie still wins. Schema is shared.

**Grain.** SA ascribes: Playwright this cut or named silence; test-operator secret (not seed inbox); official Checks + Actions vs Marketplace; bypass secret; whether the check is required on preview as well as production; how far send/finalize wait (headers vs full stream); PostHog port or silence; no new Travis table. Engineer hangs those. Extract `live-connect`. Do not remint 031–035.

---

## Must / must-not

- Engineer may not wake look until the Deployment Check is green, or a named blocker (no preview URL, no key — and then the test asserts unwired).
- Engineer may not delete yesterday’s runtime cases to make this plant green.
- Do not invent PostHog because a diagram had it.
- Do not put Hear it / Skip buttons back.
- Do not remint dest assemble, dest-gate, checkpointer, stream-intent.
- Do not farm a phone or inject a real microphone in this cut.
- Do not turn the wake Action into a test runner.
- Do not have Cursor sit in Vercel MCP and call that runtime verification.
- Do not turn protection off for the world so a test can get in. Hang the bypass secret.
- Do not POST runtime tests as the open-desk production operator. That is his tape.

---

## SA 036

Ascribe. Quote the Room connect lie, `travis-live-client.ts` token + transcript POSTs, `package.json` `test`, and `isOpenDesk`. Compose.

1. Inventory: Deployment Checks + `vercel.deployment.ready` + Actions vs Marketplace (Checkly / Endform). Identical or adjacent. Cost as a thought. Compose: official Checks first.
2. Runtime primitive: **fetch** for token / transcript / finalize / send. Playwright **only** for the Voice subtitle, or named silence this cut.
3. Test operator: hang a login cookie for an email **not** on `TRAVIS_OPERATOR_EMAIL` / `TEST_EMAIL_TO`, so `operatorRoomScope` gives own rooms. Do not use open desk. Do not write on the founder’s tape. Do not mint a test table.
4. Hang `VERCEL_AUTOMATION_BYPASS_SECRET` so the Action can hit an SSO preview. Do not drop Vercel Authentication for everyone.
5. Name the check (suggested `runtime-doors`). Required on production. Preview required — yes or no, and why.
6. Send / finalize: headers + first bytes vs wait the Deep Agents stream. Cost and duration as a thought. Prefer the cheap door unless a lived miss needs the stream.
7. PostHog: hang as port, or named silence because the door test + the check are enough this cut.
8. Do not overload `wake-packet-seats.yml`. Second workflow only.
9. Do not remint 031–035 / `dest_job` / 019 classify.
