# Packet 020 — Runtime verification (cumulative doors on every deploy)

**Number:** `020` — next packet is `021`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect. **SA** ascribes as **036**.  
**When:** Named 2026-09-10. Recut: Checks, cumulative, then E2E walks (sequential).  
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

> These tests are not unit tests. They're not static code analysis. … it's a use of the app. It's an actual use of the app, whether you're emulating the paths, doors, routes that the human will use, it's still a representative of the human performance … if it failed in the human experience … it should fail in that test as well. … All of it can be run at the same time. In my mental model, it can't … you have to send the thing and then wait for the response back and then do the next thing … And some things might even be tied to previous response to previous conversation. Like that's the whole purpose of the app. So it has to be tested in that way. So how is all that being orchestrated? … how are the tests determined?

> this is the obvious plan. How do [I] initiate to an E2E architecture? Walk me through the architecture you're thinking.

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

Runtime verification is: **a representative use of the running app, on this deploy, still honors the locked walk, and this plant did not break yesterday’s walks.**

It is not static analysis. It is not a throwaway unit test for the plant. It is end-to-end: one room, one actor, send, wait, next beat, wait — the same causality the phone has. The suite is cumulative: every deploy runs **every walk**. Engineer **adds** a walk, or a step on an existing walk. Engineer does not replace the old walks.

For Travis that means, on **this** deploy’s URL:

1. The preview is **up**.
2. The **whole** runtime suite walks the app (HTTP like the phone after the ear).
3. Each walk waited. Later beats saw the same session. The tape after a phrase includes that phrase. The answers were the locked ones (JSON, 200, unwired stays unwired, flush does not full-think, wrap is finalize, Type is not HTML-as-JSON).
4. **This deploy’s Deployment Check is green** — those walks ran **on that URL** and painted the check.

Done is all four. Syntax is not done. `npm test` green is not done. Four disconnected POSTs that each open a fresh room and never wait are not the Voice walk. A Cursor agent who opened Vercel MCP and read logs is not done. A look that could not open Voice is not done.

---

## Three kinds of test (do not mix them)

Voice on a phone is not a function. It is also not a mystery. By the time Travis has to **do** something, the ear has already turned sound into text. Our doors take that text. The E2E walk posts that text **in order**, in **one room**, and reads the tape before the next beat.

| Kind | Where | What it proves | When it runs |
|------|--------|----------------|--------------|
| **Lib** | `src/lib/*.test.ts` | Pure rules: `wantedEar`, `liveShouldPipeTravis` is false, conductor phrase, stream-intent. The connect **lie** once it is extracted from `Room.tsx`. | `npm test` on the Engineer’s plant, and again in the same Action. Fast. No preview. **Not** the human walk. |
| **E2E walks** | `src/runtime/walks/*.spec.ts` | A representative use of the **running** preview. One session. Send, wait, next. Door contracts are asserts **inside** the steps. | **Every** Vercel deploy, whole folder. Cumulative. |

`npm test` already has dozens of lib cases. Those stay. They never saw the 079 HTML 500, because that 500 only exists when Next is serving the route. They never saw Live-down on the glass, because that string is set in `armEar` after `connectLive` returns false. Isolated door files that each open a room and return are a **slice**. They are not the architecture we initiate. The architecture is the walk.

Gemini’s numbered `/tests/doors/01_token.test.ts` pile is the amateur shape if those files never share a session. We do not hang that. Door POSTs live as **functions** the walk calls. The walk is the test.

Gemini also inverted the glass. When `/live/token` returns `{ wired: false }`, the glass must say **Travis isn’t wired**. It must **not** say `Travis Live is down — phone ear. Say “I’m done”.` That shirt is the overwrite we are killing. Do not plant Gemini’s inverted assert.

---

## How the tests are determined (not an AI scenario engine)

Engineer does not invent walks from a diagram. Engineer does not mint a Travis “scenario graph” product.

A walk exists because **this seat named it**, the same way a packet names the human sheet.

| Who | What they name | What Engineer plants |
|-----|----------------|----------------------|
| Architect packet + `*-TEST.md` | The human use this packet is planting | One file under `src/runtime/walks/` that is that use, in order — or steps on an existing walk |
| **One-time retro fill (this packet, now)** | Already-lived uses that are not this packet’s agenda | The list below. Then we stop filling history. |
| Door contract | What a valid answer looks like when the walk hits that door | Helpers in `doors.ts`. Not a separate throwaway test that replaces the walk. |

**Going forward:** a later packet **adds** a walk or a step when **it** plants. It does not open another retrospective. 019’s spoken stretch (walk-back, change, two leaves, then wrap) is 019’s add when that work is the plant — not this fill.

### This packet’s agenda (already the list)

1. **Voice wrap** — open a room, arm token, speak a line, wait, see it on the tape, speak a second line in the **same** room, wait, say you’re done.
2. **Type send** — open a sitting, Type one line, wait for the send door. Type has no “I’m done.”

Lived misses that are **steps on those walks**, not new files: never HTML (079); transcript to Travis is JSON `ok`, not a think-stream; the tape after a phrase includes that phrase.

### One-time retrospective fill (now — then never again)

Already on the phone. Already broke. Not the agenda above. Add these on this PR. After this, history is closed.

| Add | Why it is a use | What fails if the human would have failed |
|-----|-----------------|-------------------------------------------|
| **Step on Type send:** after send, `GET …/turns` — the typed line is on the tape | You Type and look at the Log | Send “worked” as a stream header but the line never landed |
| **Walk `come-back`:** open, put a line, open again, **same** `session.id`, the line is still there | You leave and return. Refresh stays put (027) | A second open minted a blank sitting and the first line was gone |
| **Walk `type-dest`:** Type a dest-to-seat line, wait, door is not HTML, the line is on the tape, `GET …/queue` shows a leave (or the tape has the dest receipt) | You send work to a seat. That is the product. | HTML banner; silent send; no leave started. Do **not** wait for the seat’s essay. Do **not** remint dest assemble. |

**Covered, do not mint a cousin walk**

- Talk listen uses the same finalize door as Voice wrap.
- A second read of the tape is already inside Voice wrap.
- Unwired subtitle paint is the lib rule (`liveMissSubtitle`). Not a walk unless we later want a robot to read the glass (see Playwright below).
- 019 one-spoken-stretch classify / change-a-leave / walk-back — **019 adds**, not this fill.
- Backlog chrome, Stream card placement, Hear, plates — like, or a later packet’s add.

**Playwright is not how tests are determined and not on this list.**

What it would add, precisely: the HTTP walk never loads `Room.tsx`, so it cannot see the subtitle string after `armEar`. A browser robot could open Voice on the preview and read that the glass says **Travis isn’t wired**, not the phone-ear shirt. It could also record a short video of **this packet’s** walk for the emerge letter. That is the entire benefit. The unwired **rule** already fails in `npm test`. You still look at the glass after the check is green. If we do not need a robot to read the subtitle or a video on the letter, Playwright adds nothing. Named silence.

---

## E2E architecture (initiate this)

This is not a Travis orchestrator. It is a small **desk client** plus **walks**. Hang `node:test`. The runner’s `await` **is** the clock. Do not invent a process engine.

```
Vercel preview URL
        │
        ▼
GitHub Action (vercel.deployment.ready)
        │
        ├── npm test                  lib only
        └── test:runtime
                │
                ├── walks/voice-wrap.spec.ts     room A  ── sequential
                ├── walks/type-send.spec.ts      room B  ── sequential
                ├── walks/come-back.spec.ts      room C  ── sequential  (retro)
                └── walks/type-dest.spec.ts      room D  ── sequential  (retro)
```

**Parallel across walks. Never parallel inside a walk.** Voice wrap and Type send may run at the same time because they are different `session.id`s. Inside Voice wrap, transcript two does not fire until transcript one has returned and the tape has been read. If the runner fails a step, it stops **that** walk and reports the step, the expected contract, and the body it got. Other walks still run (their own rooms).

### Layer 1 — Desk (`src/runtime/desk.ts`)

One actor. Holds what the phone’s `Room.tsx` holds for a sitting.

- `BASE_URL` from the deploy.
- Bypass header + test-operator cookie (not his tape).
- `openRoom()` → `POST /api/session` → keep `session.id`. Every later call uses **that** id.
- `turns(afterSeq?)` → `GET /api/session/:id/turns` — the same read the log uses after a send. This is how a later beat sees the previous conversation.

### Layer 2 — Doors (`src/runtime/doors.ts`)

Functions, not tests. Same paths as `travis-live-client.ts` and `Room.tsx`. Each function: fetch, `assertNotHtml`, return JSON or the SSE response.

- `token(sessionId)`
- `transcript(sessionId, text)`
- `finalize(sessionId, utterance)`
- `send(sessionId, text)`

A walk calls these. A walk does not open four separate rooms to hit four doors.

### Layer 3 — A walk (the test)

`src/runtime/walks/voice-wrap.spec.ts` — **first plant**. Strict chronological. One `sessionId`.

```
openRoom()
        → wait → session.id exists
token(id)
        → wait → JSON, never HTML; wired true or false named
transcript(id, "are you able to do that now?")
        → wait → JSON ok, not event-stream think
turns(id)
        → wait → a user turn on the tape contains that sentence
transcript(id, "and also put this on the tape")
        → wait → JSON ok  (same room — previous conversation still here)
turns(id, afterSeq)
        → wait → second user turn exists; first turn still there
finalize(id, "I'm done")
        → wait → event-stream (or JSON error), never HTML
```

That is orchestration. There is no other clock. `await` on fetch, then `await` on turns. The second transcript is tied to the first because it is the same session, the same tape, the same LangGraph `thread_id = voice_session.id`. We do not grade Travis’s opinion on wrap. We grade: the door answered, the tape kept both lines.

`src/runtime/walks/type-send.spec.ts` — own `openRoom()`. Type a line. Wait for send. Never HTML. Retro step: the typed line is on the tape.

`src/runtime/walks/come-back.spec.ts` — retro. Open, write, open again, same id, line still there.

`src/runtime/walks/type-dest.spec.ts` — retro. Type a dest-to-seat line. Not HTML. Line on tape. Queue or tape shows a leave. Do not wait for the seat.

### How we initiate (order of plant, not a cousin PR)

1. SA ascribes: test operator secret, bypass secret, how far finalize waits (headers vs full stream). Playwright is silence.
2. Engineer plants `desk.ts` + `doors.ts` + `voice-wrap.spec.ts` on this PR. That **is** the E2E architecture standing up. One walk is enough to prove the runner waits.
3. Same PR: `type-send.spec.ts`.
4. Same PR: retro walks `come-back` + `type-dest`, and the Type-send tape step. No Playwright glass.
5. `package.json` script `test:runtime` runs `src/runtime/walks/*.spec.ts`.
6. `.github/workflows/runtime-doors.yml` on `vercel.deployment.ready`. Check paints.
7. Later packets only **add** walks or steps.

### What Gemini got right, and what we do not hang

Right: stateful sequential scenario; fail fast on a broken door; parallel only with different session ids; Vercel check is the signal.

Wrong / do not hang: a Scenario Tree generator inside Travis; `/tests/doors/01_…` as the tests; “wired false → phone-ear shirt”; Cursor as the everyday runner; a Travis orchestrator that reimplements `await`.

---

## How we simulate Voice (inside the walk)

You speak. The ear turns sound into text. Then the phone posts. The E2E actor posts **and waits**, then reads `GET …/turns` the way the glass refreshes the log.

| Phone moment | What already exists in `src/` | What the walk does |
|--------------|-------------------------------|--------------------|
| Open the room | `POST /api/session` | `desk.openRoom()`. Hold `session.id`. |
| Arm Live | `POST …/live/token` | `doors.token`. No WebRTC after that. |
| A spoken line | `POST …/live/transcript` | `doors.transcript`. Wait. Then `desk.turns`. |
| A second line | same door, same room | Same, `afterSeq`. This is previous-conversation. |
| “I’m done” | `POST …/finalize` | `doors.finalize`. Wait for SSE to start. |
| Type a line | `POST …/send` | Own walk, own room. |

We do **not** simulate the microphone. We do **not** negotiate WebRTC with OpenAI. The lived misses sat **after** the text existed.

Door contracts are asserts **on the wait**, not separate tests: token is JSON wired true/false, never HTML; transcript to Travis is JSON `ok`, not event-stream think; turns after a phrase include that phrase; a second phrase still sees the first; finalize/send is SSE or JSON error, never HTML. Do not wait for a clever Travis reply unless SA says the lived miss needs the stream.

The in-flight connect lie is still a lib extract. HTTP cannot see it.

### What we refuse to simulate

- A real microphone, a spoken fixture file, or `getUserMedia` in CI.
- A Realtime WebRTC session against OpenAI as the proof of **our** doors.
- Driving the Cursor desktop chat UI.
- Writing turns onto the founder’s living room.
- Asserting that Travis’s reply was good. That is like.
- Four parallel POSTs on one session.
- A Scenario Graph engine.

---

## Gemini’s pieces — how they fit (not a pre-built Travis)

No box in that diagram is Travis. Each is one slice.

| Slice in the picture | What it actually does for the walk | What we already have | What we hang |
|----------------------|------------------------------------|----------------------|--------------|
| Agent writes the feature | Plant `src/` | Engineer | Unchanged |
| Agent writes the runtime test | **Adds** a walk or a step on a walk | Lib tests only. Packet `*-TEST.md` is a human sheet. | `src/runtime/walks/`. Sequential. Same PR. Never a one-off packet file. Never `/tests/doors/01_`. |
| Headless sandbox | Drive the running app without his thumbs | Vercel preview. | Desk + doors + walks against the preview URL. **Not** a fake microphone. |
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
| `docs/BUILD-PROTOCOL.md` § Engineer | Done = plant + **walks added or extended** + the **whole walk suite** ran on this deploy + the Deployment Check green. `npm test` stays. It is not enough. Cursor does not triage Vercel. |
| `docs/seats/ENGINEER.md` § Verify | Same contract. Add to `src/runtime/walks/`, do not mint a packet-named spec. Sequential `await`. Quote the preview URL, the check name, and green/red. Unwired asserts unwired. |
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

### 3. Runtime suite (cumulative E2E walks)

| File | What goes in |
|------|----------------|
| `src/runtime/desk.ts` — **new** | Actor: base URL, bypass, test-operator cookie, `openRoom()`, `turns(afterSeq?)`, `assertNotHtml`. Holds `session.id`. |
| `src/runtime/doors.ts` — **new** | Functions: `token`, `transcript`, `finalize`, `send`. Not tests. |
| `src/runtime/walks/voice-wrap.spec.ts` — **new** | Sequential Voice use. Same room. Two phrases, then wrap. First plant. |
| `src/runtime/walks/type-send.spec.ts` — **new** | Own room. Type one line. Wait. Never HTML. Retro: line on the tape. |
| `src/runtime/walks/come-back.spec.ts` — **new** (retro) | Open, write, open again, same sitting. |
| `src/runtime/walks/type-dest.spec.ts` — **new** (retro) | Type dest-to-seat. Leave started. Not the seat’s essay. |
| `package.json` | Script `test:runtime` runs `src/runtime/walks/*.spec.ts`. |
| `.github/workflows/runtime-doors.yml` — **new** (name SA may keep or recut) | `repository_dispatch` type **`vercel.deployment.ready`**. `npm test` then `test:runtime` against that URL. Reports with `vercel/repository-dispatch/actions/status@v1`. |
| `.github/workflows/wake-packet-seats.yml` | Do **not** turn this Action into the sandbox. It stays the cheap label gate. |

Mic injection is **named silence**. The walk **is** the Voice mechanism.

### 4. The signal lives on the deploy (not in Cursor)

Vercel does **not** run Playwright as a first-party product inside the app host. Vercel **does** have the gate: **Deployment Checks**. Production alias waits until required checks pass. Preview can require them too.

Official hang (compose — do not invent a Travis widget):

1. We write sequential walks into `src/runtime/walks/` and keep adding to them.
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
| `docs/register/ENGINEER-HANDOFF.md` | For every plant: preview URL; deploy id; **check name + green/red**; `npm test`; which **walks** were added. If the check is pending or red, look does not sit. |
| Packet walk recording | Optional. Silence is the default. If we ever want a video, it is this packet’s walk only. |
| PostHog | Only if SA ascribes the port. Do not mint `travis.posthog`. Do not hang it “because the diagram had it.” |

### 5. The loop

```
Architect packet (face + doors to prove)
        → SA ascribes stores + ports (test operator, PostHog or silence)
        → Engineer plants + adds or extends a walk in src/runtime/walks/ (and lib extract if the lie is client)
        → Vercel deploys → GitHub Action runs lib tests + every walk on that URL → check paints
        → Any red (build, unit, or a walk) → Cursor Engineer keeps going. Same PR. Errors are the loop.
        → All green → look may sit
        → Fail look → Engineer again
        → Pass look → emerge: the sheet + a recording of **this packet’s walk only**
        → You walk the phone because you like it, not because it 500s
```

Fail look still exists. It should become rare. It is not the first sensor.

---

## Face (plain)

You open the preview to see if you like it. You do not open it to discover Live is down.

A walk is a use of the app: one room, send, wait, next beat. We keep those walks and only add to them. Every deploy runs every walk on the new URL. You do not get an emerge letter until build, unit tests, and every walk are green. The letter’s recording is only this packet’s walk — the thing this cut was solving — not a replay of the whole pile.

---

## Lock

1. **Engineer owns the tests.** Tester ∈ Engineer. No Tester seat. No Travis-in-the-browser widget.
2. **The suite is cumulative E2E walks.** Every deploy runs **all** walks, not only the pocket that just landed. Engineer **adds** a walk or a step. Engineer does not mint a packet-named spec. Engineer does not hit four doors in parallel on one session.
3. **Done = code + walks added or extended + the whole walk suite ran on the deploy + the Deployment Check is green.** Lib `npm test` stays and is not enough.
4. **Voice somehow = a sequential walk after the ear.** Token, transcript, tape, second line, finalize. No mic farm. No Realtime session as the proof. Connect wait is a lib extract. Playwright is silence unless we later want a robot to read the subtitle or a video on the letter.
5. **The signal is the Vercel Deployment Check, not Cursor.** Cursor wakes on **red**.
6. **Do not write on his tape.** Test operator, own rooms. Shared `travis` schema is why.
7. **PostHog is a port, not a given.** Hang or name silence.
8. **Architect look is not the runtime sensor.** Voice *like* stays human. Voice *walks* are the check.
9. **019 stays.** Transcript does not full-pipe. Connect wait. Unwired is unwired. Gemini’s “wired false → phone-ear shirt” is inverted. Do not plant it.
10. **Compose.** Hang official Deployment Checks + GitHub Actions + fetch `await`. Playwright is not required for the suite. Marketplace only if Actions cannot see the preview. Do not write a Travis orchestrator or a Scenario Graph engine. Do not have Cursor MCP-walk Vercel instead of the check.
11. **No emerge until all ends are green.** Build, `npm test`, and every E2E walk. Look Pass on a red check is not emerge.
12. **Emerge recording is this packet’s walk only.** Cumulative suite still ran. A video is optional (Playwright) and only this packet’s walk — not the whole pile. Silence is fine.

---

## Who runs the runtime test (brief)

Not Travis. Not Cursor as the everyday runner. Not the Architect look.

There are **two commands**. They are not the same thing.

| Command | What it is today | What it proves |
|---------|------------------|----------------|
| `npm test` | Already in `package.json`: `tsx --test src/lib/*.test.ts src/server/db/*.test.ts` | **Unit / lib only.** Functions. No preview. No Voice walk. 079’s HTML 500 cannot fail here. |
| `npm run test:runtime` | Planted. Runs `src/runtime/walks/*.spec.ts` | **The use of the app.** Hits this deploy’s URL. Send, wait, next beat. This is the runtime verification. |

The GitHub Action runs **both**, in order, after Vercel says the preview is up:

1. Engineer pushes the plant.
2. Vercel builds the preview. When that URL is actually up, Vercel fires `vercel.deployment.ready`.
3. **GitHub Actions** (workflow `runtime-doors.yml`, a GitHub-hosted runner, no model) checks out the commit.
4. It runs `npm test` — the lib pile. Fast. If this is red, stop. Engineer wakes. This is **not** the walk.
5. It runs `npm run test:runtime` **against that preview URL** (bypass header + test-operator cookie). This is the tester that uses the app. If a walk is red, stop. Engineer wakes.
6. Both green → it paints the Vercel Deployment Check green. Look may sit.
7. Look Pass + still green → emerge letter: the packet sheet + a recording of **this packet’s** walk.

Do not read “the Action runs npm test” as “npm test is the E2E.” `npm test` stays and is not the thing we were missing. `test:runtime` is.

Engineer may run both locally while planting. That is rehearsal. The gate is the Action on the deploy.

### Gemini’s `npm test` paragraph — aligned or not

The **walk** is aligned: a live preview URL, `await`, one room, next beat after the tape updates. That is `test:runtime`.

These sentences are **not** our hang. Do not plant them.

| Gemini said | Inspect / lock |
|-------------|----------------|
| `npm test` is configured to run the sequential walks against the live URL | **No.** `package.json` `test` is already lib unit tests. We do not overwrite it. Walks are `npm run test:runtime`. `npm test` is a generic script **name**, yes — and in this repo that name is already taken. |
| Instead of isolated unit tests, the script launches the walk | **No.** We keep unit tests. The Action runs lib **then** walks. Two commands. |
| The script launches the exact walk file the Engineer wrote for **that packet** | **No.** Every deploy runs **every** walk. This packet’s walk is the **emerge recording**, not the only thing the Action runs. |
| Sample URLs: `GET ${PREVIEW_URL}/live/token`, `POST …/finalize` with `{ roomId }` | **No.** Real doors: `POST /api/session/:id/live/token`, `POST /api/session/:id/live/transcript` with `{ role: "user", text }`, `GET /api/session/:id/turns`, `POST /api/session/:id/finalize` with `{ utterance }`. Engineer hangs `doors.ts` on those, not Gemini’s paths. |

One sentence: traditional `npm test` in **this** repo tests functions on paper; `test:runtime` is the automated user on the live preview. Gemini merged those two names. We do not.

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

**Grain.** SA ascribes: test-operator secret (not seed inbox); official Checks + Actions vs Marketplace; bypass secret; whether the check is required on preview as well as production; how far send/finalize wait (headers vs full stream); PostHog port or silence; no new Travis table; runner is `node:test` + fetch. Playwright is silence. Engineer hangs those. Extract `live-connect`. Plant desk + doors + the agenda walks + the one-time retro list. Do not remint 031–035.

---

## Must / must-not

- Engineer may not wake look until the Deployment Check is green, or a named blocker (no preview URL, no key — and then the test asserts unwired).
- Engineer may not delete yesterday’s walks to make this plant green.
- Do not run four door POSTs in parallel on one session.
- Do not plant Gemini’s inverted glass (wired false → phone-ear shirt).
- Do not invent PostHog because a diagram had it.
- Do not put Hear it / Skip buttons back.
- Do not remint dest assemble, dest-gate, checkpointer, stream-intent.
- Do not farm a phone or inject a real microphone in this cut.
- Do not turn the wake Action into a test runner.
- Do not have Cursor sit in Vercel MCP and call that runtime verification.
- Do not turn protection off for the world so a test can get in. Hang the bypass secret.
- Do not POST runtime tests as the open-desk production operator. That is his tape.
- Do not label `emerge` while the Deployment Check is red or pending.
- Do not attach a recording of every walk. A video is optional and only this packet’s walk.

---

## SA 036

Ascribe. Quote the Room connect lie, `travis-live-client.ts` token + transcript POSTs, `package.json` `test`, and `isOpenDesk`. Compose.

1. Inventory: Deployment Checks + `vercel.deployment.ready` + Actions vs Marketplace (Checkly / Endform). Identical or adjacent. Cost as a thought. Compose: official Checks first.
2. Runtime primitive: **fetch + `await`**. Playwright is silence. Do not hang a Scenario Graph engine. Do not hang `/tests/doors/01_`.
3. Test operator: hang a login cookie for an email **not** on `TRAVIS_OPERATOR_EMAIL` / `TEST_EMAIL_TO`, so `operatorRoomScope` gives own rooms. Each walk `openRoom()`s its own session. Do not use open desk. Do not write on the founder’s tape. Do not mint a test table.
4. Hang `VERCEL_AUTOMATION_BYPASS_SECRET` so the Action can hit an SSO preview. Do not drop Vercel Authentication for everyone.
5. Name the check (suggested `runtime-doors`). Required on production. Preview required — yes or no, and why.
6. Send / finalize: headers + first bytes vs wait the Deep Agents stream. Cost and duration as a thought. Prefer the cheap door unless a lived miss needs the stream.
7. Packet-walk **recording**: optional. Default silence. If hung later, only this packet’s walk.
8. PostHog: hang as port, or named silence because the door test + the check are enough this cut.
9. Do not overload `wake-packet-seats.yml`. Second workflow only. Emerge Action must not fire on a red Deployment Check.
10. Do not remint 031–035 / `dest_job` / 019 classify.
