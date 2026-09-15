# Walks — every use that is the app

Server-pipe walks. They POST session doors with prepared text. They prove the HTTP contract. They do **not** open the phone face, acquire a microphone, or prove which ear owns speech. Microphone / Voice / Talk / Type glass lives in `src/runtime/browser/`.

Seeded files run on every deploy (`npm run test:runtime` runs this layer, then the browser layer). A row with no file is a named hole, not a green. A walk names **one use** and that use’s **outcome**. Completeness is this list plus browser suites plus grain tests, not an oracle that tries to catch every error.

| Use on the phone | Walk | Pass | Fail |
|---|---|---|---|
| Type a line to Travis | `type-send.spec.ts` | Speakable Travis `agent_post`. | HTML. Mute. Unwired. `run error`. |
| Ask what we just said (walk-back) | `type-walk-back.spec.ts` | Two Type beats. A **second** Travis post. | Unwired. Mute. Second beat adds no post. Lived `?? · run error`. |
| Type work to a seat | `type-dest.spec.ts` | Dest line on tape. Queue shows a leave. | HTML. No leave. Not the Engineer essay. Not Travis wrap. |
| Voice: two lines, I’m done | `voice-wrap.spec.ts` | Both lines on tape. Wrap is a Travis post. | HTML. Unwired. Run error after wrap. |
| Voice dest while talking | `voice-stream-arch.spec.ts` | Transcript dest starts a leave. Queue is non-empty **before** I’m done. Wrap is a Travis mouth. Dest-seat Cursor miss is dest, not wrap. | Queue empty after transcript. Wrap with no mouth. Engineer essay. |
| Leave and come back | `come-back.spec.ts` | Same `session.id`. Line still there. That send also worked. | New blank sitting. Think miss on the first send. |
| Bind a Cursor chat into the room | `bind-agent.spec.ts` | `bind_agent` via live tool port: catalog row + room member, no `POST /v1/agents`, stream not left live. | Tool miss. No member. Stream stuck live. |

| Browser face (not this folder) | What it proves |
|---|---|
| `browser/type-mode.spec.ts` | Real composer. No `/send` before Send. Rendered turn + Travis mouth. |
| `browser/talk-mode.spec.ts` | SpeechRecognition double. No `/finalize` before I’m done. Then the gate. |
| `browser/voice-own.spec.ts` | Mocked Live. STT starts stay zero while connecting/connected. No Talk draft. |
| `browser/voice-live.spec.ts` | Real `/live/token` + WebRTC + fixture WAV. Dest leave before I’m done. Wrap. Usage printed. |

| Not seeded | Why |
|---|---|
| `unwired-glass.spec.ts` (Playwright subtitle **Travis isn’t wired**) | Specified in 020. The Voice canary fails if Live is unwired. A dedicated unwired-glass walk is still a named hole. |

Do not mint Backlog / plate walks from this file. A later packet adds a walk when it plants that use. A lived error path gets its own walk — it does not thicken every happy path.
