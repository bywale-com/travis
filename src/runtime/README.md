# Runtime verification — this is the app

If a use is on the phone, a walk here is that use. The Deployment Check `runtime-doors` runs **every** walk on **this** deploy URL via that checkout’s `npm run test:runtime`. Green means the app worked. It does not mean the door returned headers.

**Two layers**

| Layer | What it proves | What it does not prove |
|---|---|---|
| Server-pipe (`walks/`) | Session HTTP doors: send, transcript, finalize, dest leave, tape, queue. | Microphone ownership. Voice Live. Talk/Type glass. A person opening the phone face. |
| Browser (`browser/`) | The rendered phone face at phone dimensions. Type stays local until Send. Talk stays local until the conductor gate. Voice + Travis has one ear (Live while connecting or connected). The real Voice canary uses fake-mic audio through WebRTC → OpenAI Realtime. | Endpoint injection is not a Voice test. |

**Law**

- One sitting, send, **wait for the completion signal**, read the tape, next beat.
- Think-walks: Travis spoke. Named unwired is **red** here. Unwired glass is its own walk.
- A generate miss / `kind=status` that says error **fails**. Do not grade whether the reply was clever.
- Dest to a Cursor seat: the **leave started**. Do not wait for that seat’s essay. Do not fail dest on Travis wrap.
- On fail: dump the tape and SSE events. That is the report.
- One test-operator cookie resumes one live room. The suite runs **sequentially**. Each walk starts a fresh sitting (`End` + open) except the come-back resume beat.
- Do not invent a Scenario Graph. Add a walk when the app gains a use. Named error-path walks when that miss is lived.
- `npm run test:runtime` prepares Playwright Chromium, runs server-pipe walks, then browser suites (one spec per spawn so the first miss exits), then one real Voice canary. A launch miss dumps URL / title / door / visible text and closes Chromium. `runtime-doors.yml` on `main` only invokes that script. Cancelled or a walks miss paints `runtime-doors` failure and `fail-look`; emerge is success only.

Inventory: [`walks/README.md`](./walks/README.md) · [`browser/`](./browser/).
