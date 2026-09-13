# Walks — every use that is the app

Seeded files run on every deploy (`npm run test:runtime`). A row with no file is a named hole, not a green. A walk names **one use** and that use’s **outcome**. Completeness is this list plus grain tests, not an oracle that tries to catch every error.

| Use on the phone | Walk | Pass | Fail |
|---|---|---|---|
| Type a line to Travis | `type-send.spec.ts` | Speakable Travis `agent_post`. | HTML. Mute. Unwired. `run error`. |
| Ask what we just said (walk-back) | `type-walk-back.spec.ts` | Two Type beats. A **second** Travis post. | Unwired. Mute. Second beat adds no post. Lived `?? · run error`. |
| Type work to a seat | `type-dest.spec.ts` | Dest line on tape. Queue shows a leave. | HTML. No leave. Not the Engineer essay. Not Travis wrap. |
| Voice: two lines, I’m done | `voice-wrap.spec.ts` | Both lines on tape. Wrap is a Travis post. | HTML. Unwired. Run error after wrap. |
| Voice dest while talking | `voice-stream-arch.spec.ts` | Transcript dest starts a leave. Queue is non-empty **before** I’m done. Wrap is a Travis mouth. | Queue empty after transcript. Wrap with no mouth. Engineer essay. |
| Leave and come back | `come-back.spec.ts` | Same `session.id`. Line still there. That send also worked. | New blank sitting. Think miss on the first send. |
| Create a person in the room | `create-agent.spec.ts` | `create_agent` via live tool port: Cursor HTTP create, binding row, room member, stream not left live. | Tool miss. No member. Stream stuck live. |

| Not seeded | Why |
|---|---|
| `unwired-glass.spec.ts` (Playwright subtitle **Travis isn’t wired**) | Specified in 020. SA 036 has not ascribed how the browser carries bypass + cookie. HTTP walks cannot see `Room.tsx`. |

Do not mint Backlog / plate walks from this file. A later packet adds a walk when it plants that use. A lived error path gets its own walk — it does not thicken every happy path.
