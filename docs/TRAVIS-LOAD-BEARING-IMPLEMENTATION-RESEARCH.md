# Travis load-bearing implementation research

## Purpose

This document compares the 26 constructs in
[`TRAVIS-LOAD-BEARING-PRODUCT-ARCHITECTURE.md`](./TRAVIS-LOAD-BEARING-PRODUCT-ARCHITECTURE.md)
with established production implementations.

The decision criteria are:

1. **Compactness** — the smallest implementation that preserves the product
   guarantee.
2. **Cost-effectiveness** — avoid recurring services, model calls, and storage
   unless they remove a demonstrated failure.
3. **Minimal complexity** — minimize code, dependencies, datastores, workers,
   and operational failure boundaries without weakening correctness.

## Evidence method

- **Verified** means the behavior is documented by the upstream project or
  visible in the linked source.
- **Inference** means a Travis-specific conclusion drawn from that evidence.
- **Unresolved** means the upstream contract or Travis product requirement is
  insufficient to make a safe implementation decision. It is not permission
  to fill the gap with guessed behavior.
- GitHub source links are commit-pinned where practical.
- Architecture analogies are identified as analogies; they are not presented
  as implementations of a different problem.

## Executive decision

The compact production posture is:

```text
Postgres remains product truth
    rooms · turns · memberships · jobs · queues · streams · initiatives
        ↓
durable sequence replay is the realtime guarantee
    LISTEN/NOTIFY only when deployment connections support it
        ↓
SSE replays from durable sequence cursors
        ↓
Cursor Cloud Agents remains specialist execution
        ↓
LangGraph PostgresSaver remains Travis-thread memory
```

Most constructs should remain thin, local implementations. The principal
production gap is **durable execution after dispatch**: detached work in a
serverless request does not have a process-lifetime guarantee.

The first pass selected Graphile Worker. Deeper failure-mode research changes
that recommendation. Core Graphile Worker leaves abruptly interrupted jobs
locked for at least four hours, and that lease is not configurable without
[Worker Pro](https://worker.graphile.org/docs/pro/recovery). Travis already
models a much shorter work timeout. [pg-boss](https://pgboss.io/introduction)
uses the same Postgres, supports
[Drizzle transactions](https://pgboss.io/api/adapters), configurable
heartbeats and expiry, bounded retries, and retention. It is therefore the
smaller *complete* fit even though Graphile Worker's core queue is simpler.

Cursor's TypeScript SDK accepts an
[`idempotencyKey` on each send](https://cursor.com/docs/sdk/typescript), but
the cited SDK and bridge contracts do not document duplicate-send behavior,
retention, conflict handling, or return of an earlier run. It is therefore a
correlation input, not a verified external-effect fence. Once a send returns
its run ID, durable `ObserveRun` can recover a disconnected live stream. The
compact boundary is:

```text
one Postgres transaction
    dest_job + pg-boss job(destJobId)
        ↓
worker claims command
        ↓
Cursor agent.send(prompt, { idempotencyKey: commandId })
        ↓
persist exact run ID, or record send_unknown on an ambiguous failure
        ↓
observe a known run; reconcile an unknown send before retrying
```

pg-boss remains an at-least-once boundary. Travis must retain its own business
command identity and must not treat the vendor key as product truth. The
crash/timeout window after Cursor accepts a send but before Travis knows the
run ID remains an unresolved cross-system outcome until contract tests or a
vendor guarantee establish a safe reconciliation procedure.

Do not add, at current scale:

- a second multi-agent framework;
- Redis/BullMQ;
- Temporal;
- Elasticsearch/OpenSearch;
- a cloud TTS provider;
- a second feedback/defect system;
- Storybook instrumentation in production;
- a design-token compiler.

## Recommendation summary

| # | Construct | Decision |
|---|---|---|
| 1 | Room | Keep the relational room aggregate. |
| 2 | Voice and Log | Keep one durable tape; borrow playout-truth ideas from LiveKit. |
| 3 | Conductor | Keep deterministic terminal-phrase commit. |
| 4 | Role-based agents | Keep database roles; do not add another agent framework. |
| 5 | Seat and sit | Keep dynamic binding; add explicit readiness semantics. |
| 6 | Dest | Keep deterministic routing and conservative fallback. |
| 7 | Dispatch and leave | Use pg-boss; treat ambiguous Cursor sends as unknown, not safe retries. |
| 8 | `dest_job` | Keep as business truth and command identity; queue rows are delivery only. |
| 9 | Per-agent queue | Use pg-boss keyed strict FIFO; keep a mailbox only if it is product history. |
| 10 | Stream | Keep durable meaningful events; compact low-value detail. |
| 11 | New/change/cancel/talk | Keep a conservative command state machine. |
| 12 | Room tape | Keep Postgres; harden cross-isolate ordering. |
| 13 | Room wire | Keep replaying SSE; use LISTEN only with a viable direct connection. |
| 14 | Travis thread | Keep JS PostgresSaver; serialize by room with keyed FIFO and add retention. |
| 15 | Cursor thread | Persist exact run IDs; explicitly reconcile ambiguous sends. |
| 16 | Artifacts | Treat Cursor-only files as transient; copy durable turn attachments at finalization. |
| 17 | Backlog | Keep explicit promotion from conversation. |
| 18 | Requests | Keep Postgres search; add FTS only after measurement. |
| 19 | Hear/Skip | Keep per-turn acknowledgement. |
| 20 | One ear | Keep local arbitration; use Web Locks for cross-tab exclusion. |
| 21 | Readback | Keep Realtime + browser TTS; no cloud TTS yet. |
| 22 | Pipe hygiene | Keep typed event allowlists and speech-time sanitization. |
| 23 | Doors | Keep local domain state; use existing Ant overlay primitives. |
| 24 | Themes | Keep typed custom tokens. |
| 25 | Surface registry | Keep the thin custom registry. |
| 26 | Look | Keep GitHub handoff; mitigate duplicates and expose ambiguous outcomes. |

---

# 1. Persistent conversational workspace — Room

## Reference implementations

- Matrix Synapse:
  [`RoomCreationHandler.create_room()`](https://github.com/element-hq/synapse/blob/26a92c711161be9f9b8c69b33144ba7fe5b31063/synapse/handlers/room.py#L1046-L1330)
- Mattermost:
  [`Channel` durable model](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/public/model/channel.go#L85-L106)
- OpenHands:
  [`ConversationState.create()` and restore](https://github.com/OpenHands/software-agent-sdk/blob/6ae64079cfd30cfe2f01a060c59168a4d650d883/openhands-sdk/openhands/sdk/conversation/state.py#L429-L621)
- Matrix:
  [client transaction identifiers](https://spec.matrix.org/unstable/client-server-api/#transaction-identifiers)

## Mechanism — verified

Synapse creates a durable room identity and transactionally persists room
metadata plus initial state/membership events. Mattermost's channel model keeps
identity, deletion/lifecycle state, last-post activity, and message counts
independent of connected clients. OpenHands reopens conversation state from a
stable conversation ID and persisted state/event material.

The common production pattern is:

```text
stable workspace ID
  + durable membership/state
  + independently persisted timeline
  + reconnectable client projection
```

## Failure handling and integration boundary — verified

- Matrix transaction IDs make supported event-writing endpoints idempotent
  within a device and endpoint scope, returning the original result for a
  retransmission. The standard `createRoom` endpoint is `POST` and does not
  expose that transaction-ID contract.
- Synapse room creation performs multiple initial-state and membership steps;
  its handler is not evidence that an external client can blindly retry a
  timed-out room create.
- Mattermost keeps lifecycle and last activity on the channel independently
  of connected clients, so reconnect does not recreate the workspace.
- OpenHands restores by stable conversation identity; process identity is not
  conversation identity.

For Travis, room creation is local to one Postgres database. The compact
answer is stronger than the distributed Matrix case: create room, owner
membership, and initial state in one transaction, with a caller-generated
creation command ID under a unique constraint.

## Options and trade-offs

| Approach | Advantage | Cost |
|---|---|---|
| Relational aggregate | Simple ownership, joins, and projections | State spans tables |
| Serialized room snapshot | Easy whole-room restore | Weak concurrency and querying |
| Full event-sourced room | Strong replay and audit | Considerably more machinery |

## Recommendation for Travis — inference

Keep `voice_session.id` as the relational aggregate key. Preserve
transactional room-plus-membership creation and the Leave/End distinction.
Do not add a serialized Room document or a dedicated event-store product.
Travis already has the compact pattern used by mature messaging systems.

Use compare-and-set lifecycle changes (`open` → `ended`) so concurrent Leave,
End, or reconnect requests cannot reopen or double-close the room. Every
child read/write must scope by room membership in the server query, not only
by a client-supplied room ID.

**Unresolved:** room deletion, retention, and child-row redaction are product
policy. Do not infer cascade deletion from the aggregate metaphor.

---

# 2. Multimodal conversational interface — Voice and Log

## Reference implementations

- LiveKit Agents:
  [`RoomOptions`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/room_io/types.py#L110-L160)
  independently enables text/audio input and output.
- LiveKit Agents:
  [`TextInputEvent` and `_default_text_input_cb`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/room_io/types.py#L25-L54)
- LiveKit Components:
  [`useVoiceAssistant()`](https://github.com/livekit/components-js/blob/21c767b62a0b3a0078189720dba1e12d8781c54b/packages/react/src/hooks/useVoiceAssistant.ts#L19-L108)
- LiveKit:
  [`TranscriptSynchronizer`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/transcription/synchronizer.py#L484-L755)
- LiveKit:
  [synchronized transcription and interruption behavior](https://docs.livekit.io/agents/multimodality/text/)
- LiveKit:
  [false-interruption controls](https://livekit.com/blog/turn-detection-and-interruption-handling)

## Mechanism — verified

LiveKit routes typed input and audio through one `AgentSession`. Its React hook
returns one combined state, audio track, and transcription projection.
`TranscriptSynchronizer` paces displayed transcript against actual playout and
can pause, resume, or truncate it when speech is interrupted.

LiveKit transport is not a durable product tape; persistence remains the
application's responsibility.

## Failure handling and integration boundary — verified

- LiveKit truncates the synchronized transcript to the portion actually
  played when output is interrupted.
- A non-interrupted completion flushes the full transcript even if text
  forwarding lagged audio.
- False-interruption handling can wait for transcript evidence and resume
  paused speech instead of permanently truncating it after cough/noise.
- Text input, audio input, and playback completion can arrive in different
  orders, so the synchronizer retains explicit per-segment lifecycle.
- Typed text and audio are separate inputs into one session; transport does
  not make their durable application writes atomic.

## Options and trade-offs

| Approach | Advantage | Cost |
|---|---|---|
| One RTC session for text/audio | Strong modality synchronization | New RTC infrastructure and coupling |
| HTTP/SSE text + WebRTC audio | Fits Travis's durable app | App reconciles identity and interruption |
| Immediate transcript | Lowest latency | Can show text never actually heard |
| Playout-synchronized transcript | Truthful under interruption | More timing state |

## Recommendation for Travis — inference

Keep Voice and Log as projections over the Postgres tape. Do not move the
durable conversation into LiveKit.

Borrow two mechanisms:

1. all modalities enter one room-turn writer;
2. track a playout cursor so the product can distinguish generated text from
   text actually spoken.

Give each submitted utterance a client command ID before either Type or Talk
crosses the network. The server owns deduplication and canonical turn
creation. Interim STT and streaming assistant text remain provisional; only a
finalized turn enters the durable tape.

Do not adopt LiveKit only for transcript timing. Travis can retain the smaller
concepts: utterance identity, provisional text, playout position,
interruption, and terminal completion.

**Unresolved:** whether interrupted assistant text remains fully readable in
Log while only the played prefix is marked heard is a product choice.

---

# 3. Explicit end-of-turn protocol — conductor phrases

## Reference implementations

- LiveKit:
  [`AgentSession.commit_user_turn()`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/agent_session.py#L1721-L1757)
- Pipecat:
  [`BaseUserTurnStopStrategy`](https://github.com/pipecat-ai/pipecat/blob/d9a6d55702d9e513e0f2d3a8a23a954b22425b60/src/pipecat/turns/user_stop/base_user_turn_stop_strategy.py#L43-L279)
- Pipecat:
  [turn-stop strategy tests](https://github.com/pipecat-ai/pipecat/blob/06de5cb2/tests/test_user_turn_stop_strategy.py)
- Pipecat:
  [finalized-transcript reset after a later interim](https://github.com/pipecat-ai/pipecat/pull/5043)
- Hark:
  [`listen_end.py`](https://github.com/ultradyn/hark/blob/7e39499c59adbe6e412c24d67c015c9d7b278a0c/src/hark/listen_end.py#L37-L486)
  and
  [`RadioSession`](https://github.com/ultradyn/hark/blob/7e39499c59adbe6e412c24d67c015c9d7b278a0c/src/hark/answer_window/radio.py#L104-L441)

## Mechanism — verified

LiveKit exposes an explicit commit boundary that flushes STT, waits for a final
transcript, and triggers turn processing. Pipecat exposes a turn-stop strategy
that can inspect transcription frames and emit user-turn-stopped.

Hark implements the closest direct reference: normalized whole-text or
word-bounded terminal suffixes, distinct end/cancel phrases, terminal phrase
stripping, ambiguous-soft-phrase guards, and persisted finish/cancel
precedence.

No strategy can guarantee that an STT vendor transcribes the phrase correctly.

## Failure handling and integration boundary — verified

- Pipecat waits for both end-of-turn criteria and transcript availability.
  After VAD stops, it uses the STT provider's p99 latency as a safety deadline;
  a finalized transcript cancels that wait.
- Its tests cover late final transcripts, interim-only transcripts, no-VAD
  fallback, reset during active speech, and timeout completion.
- Pipecat clears a prior “finalized” flag when a later interim arrives. This
  prevents aggressive STT endpointing from splitting one utterance when
  speech resumes before VAD reported a stop.
- A timeout is a recovery boundary, not evidence that the conductor phrase
  was heard.
- Hark's whole-text/word-boundary matching avoids substring commits and gives
  finish/cancel a deterministic precedence.

## Options and trade-offs

| Boundary | Advantage | Failure |
|---|---|---|
| Terminal phrase | Explicit and pause-tolerant | Missed transcription can remain open |
| Phrase + idle fallback | Operational recovery | Idle may commit unfinished thought |
| VAD/semantic endpoint | Natural cadence | Removes operator-controlled boundary |
| Tap-to-send | Unambiguous | Violates hands-free goal |

## Recommendation for Travis — inference

Keep the deterministic end-anchored conductor:

- normalize only known STT variants;
- hold interim-only phrase matches through recognition end;
- strip only the terminal occurrence;
- verify again on the server;
- keep one primary phrase;
- if an idle recovery is added, label it separately from a phrase-confirmed
  commit.

Track an utterance generation across recognition restarts. A final callback
from an older generation cannot commit or append to the current draft. If a
new interim follows a final segment before the phrase boundary, clear the
“fully final” assumption just as Pipecat does.

Adopting a voice framework solely for this matcher would increase complexity
without improving the product guarantee.

**Unresolved:** the idle recovery duration and whether it sends, preserves a
draft, or asks for confirmation are product behavior. Do not inherit a voice
framework's default timeout.

---

# 4. Role-based multi-agent system

## Reference implementations

- OpenAI Agents SDK:
  [`Agent` configuration](https://github.com/openai/openai-agents-js/blob/9687b544c8c873080e6ff7e7d294c0b353cd9ab6/packages/agents-core/src/agent.ts#L316-L382)
  and
  [`Handoff`](https://github.com/openai/openai-agents-js/blob/9687b544c8c873080e6ff7e7d294c0b353cd9ab6/packages/agents-core/src/handoff.ts#L160-L440)
- OpenAI:
  [handoff guide](https://openai.github.io/openai-agents-js/guides/handoffs/)
- AutoGen:
  [`SelectorGroupChatManager.select_speaker()`](https://github.com/microsoft/autogen/blob/004749e6b7102c8fd317b9b1499ce5807223c278/python/packages/autogen-agentchat/src/autogen_agentchat/teams/_group_chat/_selector_group_chat.py#L152-L210)
- Cursor:
  [custom subagent definition limits and naming](https://cursor.com/docs/cloud-agent/api/endpoints)

## Mechanism — verified

OpenAI models roles as agents configured with instructions, tools, guardrails,
and handoffs. A handoff changes the active agent inside the same SDK run.
AutoGen maintains a participant set and validates deterministic or
model-selected speakers against it.

Neither mechanism supplies Travis's durable dispatch, business job state,
external Cursor identity, or per-agent crash recovery.

Cursor's API can define run-scoped custom subagents, but those definitions are
tools available *inside one Cursor run*. They do not replace Travis's
persistent product cast, room membership, or cross-run role binding.

## Failure handling and integration boundary — verified

- OpenAI handoffs expose only enabled destinations, validate the destination
  agent, and transfer control inside the current SDK run.
- AutoGen validates selected speakers against the participant set and can use
  deterministic selection before model selection.
- Cursor custom subagent names must be unique and cannot collide with built-in
  names; the API caps their count.
- None of these frameworks persists Travis's business assignment or repairs a
  half-completed protocol handoff.

## Options and trade-offs

| Approach | Advantage | Cost |
|---|---|---|
| OpenAI handoffs | Compact in-run role transfer | Synchronous/model-selected |
| AutoGen group chat | Rich speaker selection | Larger runtime and extra model calls |
| Database roles + external agents | Durable, explainable | Travis owns dispatch glue |

## Recommendation for Travis — inference

Keep:

```text
stable role → current binding → Cursor agent identity
```

Do not put Cursor dispatch behind another multi-agent framework. Borrow
handoff terminology and guardrails, but keep Postgres roles/membership as
authority.

Version role instructions/protocol references and record which version a
binding received. A framework-level agent object is configuration, not proof
that a durable specialist is ready.

**Unresolved:** whether a protocol update should invalidate, re-hand, or
grandfather an occupied seat needs an explicit product lifecycle rule.

---

# 5. Dynamic role binding — seat and sit

## Reference implementations

- Kubernetes RBAC:
  [`RoleBinding`, `RoleRef`, and `Subject`](https://github.com/kubernetes/kubernetes/blob/98d0129cf21ce0871637ae36e67b5ff82d3db50d/pkg/apis/rbac/types.go)
- Kubernetes:
  [`ValidateRoleBindingUpdate()`](https://github.com/kubernetes/kubernetes/blob/98d0129cf21ce0871637ae36e67b5ff82d3db50d/pkg/apis/rbac/validation/validation.go#L127-L164)
- OpenAI Agents:
  [`handoff(..., { isEnabled })`](https://github.com/openai/openai-agents-js/blob/9687b544c8c873080e6ff7e7d294c0b353cd9ab6/packages/agents-core/src/handoff.ts#L319-L440)
- Cursor:
  [idempotent agent creation and lifecycle](https://cursor.com/docs/cloud-agent/api/endpoints)

## Mechanism — verified

Kubernetes is an architecture analogy, not an agent implementation. It
separates a stable role reference from replaceable subjects; role references
are immutable while subjects can change. OpenAI conditionally exposes
handoffs per run and permits resolving a different agent at invocation time,
but that availability is not durable role assignment.

Cursor provides two existing primitives relevant to Sit: a caller can supply a
durable agent ID for an idempotent create flow, and archive/unarchive are
idempotent lifecycle operations. These remove the need to invent retry
semantics for vendor identity creation, but they do not mark Travis protocol
handoff complete.

## Failure handling and integration boundary — verified

- Stable role identity and replaceable subject identity are separate records
  in Kubernetes; changing a subject does not mutate the role definition.
- Cursor create can be retried with the same client identity. A conflict is a
  recovery signal, not permission to mint a cousin agent.
- Persisting a Cursor ID before protocol delivery can leave a valid but
  unready occupant.
- Protocol delivery can succeed remotely and time out locally. Record
  `send_unknown`; the stable handoff command/send key preserves correlation
  but does not make a blind retry safe.
- Concurrent Sit attempts need a version/compare-and-set on the seat binding,
  or a late attempt can overwrite the winner.

## Options and trade-offs

| Binding model | Advantage | Cost |
|---|---|---|
| Immutable role assignment record | Strong auditability | More transitions/rows |
| Mutable protocol path | Very small implementation | Partial assignment can look ready |
| Runtime-only selection | Minimal persistence | Lost on process failure |

## Recommendation for Travis — inference

Keep role identity stable and occupant identity replaceable, but make Sit an
explicit transition:

```text
resolve role
  → choose/create binding
  → persist assignment
  → hand protocol
  → mark ready
```

`protocol_path` assignment alone should not imply readiness. A small
`seat_status`/`ready_at` or versioned assignment record would close that
ambiguity without adding an agent framework.

Use explicit states such as preparing → handing → ready/failed, and allow
dispatch only from ready. If a timeout occurs after the run ID is known,
reconcile that exact run. If no run ID was returned, remain `send_unknown`
until a separately verified reconciliation procedure makes retry safe.

**Unresolved:** replacement policy—whether the old occupant remains routable
until the new one is ready—must be chosen at the product layer.

---

# 6. Intent-based agent routing — dest

## Reference implementations

- AutoGen:
  [`selector_func`, `candidate_func`, and `select_speaker()`](https://github.com/microsoft/autogen/blob/004749e6b7102c8fd317b9b1499ce5807223c278/python/packages/autogen-agentchat/src/autogen_agentchat/teams/_group_chat/_selector_group_chat.py#L152-L210)
- Rasa:
  [`FallbackClassifier`](https://github.com/RasaHQ/rasa/blob/c4069568b4fe2adb5d5a1e55d17ce8cb9dda27fc/rasa/nlu/classifiers/fallback_classifier.py#L70-L130)
- Rasa:
  [fallback and two-stage disambiguation](https://rasa.com/docs/rasa/fallback-handoff/)
- OpenAI:
  [destination-specific handoff tools](https://openai.github.io/openai-agents-js/guides/handoffs/)

## Mechanism — verified

AutoGen permits deterministic selection before model selection and rejects
invalid participant names. Rasa falls back when intent confidence is low or
the top candidates are too close. OpenAI exposes each enabled destination as a
tool and lets the model choose one.

Rasa's established failure policy is as important as its classifier. It emits
fallback when the top score is below a threshold *or* when the top two scores
are too close, then routes that fallback to clarification/rephrase rather
than executing the highest-scoring side effect.

## Failure handling and integration boundary — verified

- Candidate destinations are constrained before selection in AutoGen/OpenAI;
  a selector cannot legally invent a participant.
- Exact mention/reply routing has no confidence problem but still needs
  collision-free normalized aliases.
- Ambiguity must be detected before dispatch; “pick newest/closest” is not a
  recovery mechanism.
- Disabled, unready, or non-member seats are removed from candidates even if
  language matches.
- A fallback has no specialist side effect and may ask one bounded
  clarification question.

## Options and trade-offs

| Router | Advantage | Cost/risk |
|---|---|---|
| Exact mentions/reply target | Cheap, fast, explainable | Limited language coverage |
| Trained NLU | Confidence/fallback semantics | Training and calibration system |
| LLM/tool selection | Flexible language | Latency, cost, nondeterminism |

## Recommendation for Travis — inference

Use this precedence:

1. explicit Type destination or reply author;
2. exact spoken role/seat alias;
3. deterministic active-work command matching;
4. otherwise talk or clarification.

Do not add embeddings, Rasa, or an LLM router while the cast and intent set
remain small.

Represent routing as a pure decision result (`matched`, `ambiguous`,
`unavailable`, `talk`) before any write or Cursor call. Keep aliases in the
same role configuration that drives the UI label so the router and visible
cast cannot drift.

The pure decision is only a snapshot. When creating the durable command and
queue job, transactionally revalidate that the selected binding is still a
ready room member at the version the router observed. If it changed, reject
or reroute through the same deterministic rules; do not dispatch a stale
selection. This is the same validate-at-write boundary used by
[Kubernetes RBAC](https://github.com/kubernetes/kubernetes/blob/98d0129cf21ce0871637ae36e67b5ff82d3db50d/pkg/apis/rbac/validation/validation.go#L127-L164):
authorization-like membership constraints are checked against current state,
not trusted from an earlier read.

**Unresolved:** alias collisions across a person name and role name need a
founder-facing disambiguation rule; they must not be settled by list order.

---

# 7. Asynchronous job dispatch — dispatch and leave

## Reference implementations

- pg-boss:
  [at-least-once execution and transactional insertion](https://pgboss.io/introduction)
- pg-boss:
  [Drizzle transaction adapter and rollback behavior](https://pgboss.io/api/adapters)
- pg-boss:
  [retry, heartbeat, expiry, and retention controls](https://pgboss.io/api/jobs)
- Cursor:
  [`SendOptions.idempotencyKey`](https://cursor.com/docs/sdk/typescript)
- Graphile Worker:
  [`makeAddJob()`](https://github.com/graphile/worker/blob/4cda192c5df254392a1dff350e5d73f7d2c18a85/src/helpers.ts#L21-L56)
- Graphile Worker:
  [`batchGetJobs()` using `FOR UPDATE SKIP LOCKED`](https://github.com/graphile/worker/blob/91c950f7370aa2629107df1aa6a44b9f5985a1bd/src/sql/getJobs.ts#L14-L166)
- Graphile Worker:
  [abrupt-exit recovery](https://worker.graphile.org/docs/error-handling)
- Temporal TypeScript:
  [`WorkflowClient.start()`](https://github.com/temporalio/sdk-typescript/blob/34a7913e9c9495c43bc63f445a845cc18a5cebd1/packages/client/src/workflow-client.ts)

## Mechanism — verified

pg-boss and Graphile Worker both insert queue rows in Postgres and claim work
with `SKIP LOCKED`; both are at-least-once systems. pg-boss accepts a `db`
adapter on `send()`. Its official Drizzle adapter runs queue insertion on the
caller's transaction, so the business row and wake-up either both commit or
both roll back.

pg-boss retries failed jobs and separately exposes:

- `heartbeatSeconds` for dead-worker detection;
- `expireInSeconds` for an attempt that exceeds its useful lifetime;
- bounded retry/backoff;
- retention and deletion windows.

When a heartbeat or expiry declares an attempt stale, the old handler may
still be running after a network partition. pg-boss fences settlement by
attempt/retry count, but the external effect must still be idempotent or
reconciled. Cursor accepts a client-generated `idempotencyKey` per `send()`;
the cited public contracts do not specify what duplicate keys do.

Graphile Worker remains a valid smaller queue, but an ungraceful process death
leaves its core job locked for at least four hours. The scan interval is
configurable; the four-hour lease is not. A shorter heartbeat lease is a paid
Worker Pro capability.

Temporal provides stronger durable workflow replay, timers, and external
updates, but requires a Temporal service, worker fleet, deterministic workflow
code, and another operational system.

## Failure handling and integration boundary — verified

| Failure | Established handling |
|---|---|
| Request dies before commit | Transaction rolls back both `dest_job` and queue row. |
| Request dies after commit | pg-boss retains the task for another process. |
| Worker dies before Cursor send | Heartbeat/expiry retries the task. |
| Worker dies after Cursor accepted send but before run ID is stored | Mark/recover the command as `send_unknown`; reconcile before any retry. The send key alone is not a documented fence. |
| Live Cursor stream disconnects | The run continues; observe its durable stream rather than sending again. |
| Network partition creates two handlers | pg-boss fences queue settlement; it does not fence a Cursor side effect already made by a stale handler. |
| Cursor reports `agent_busy` | It is agent serialization, not a new job failure; defer the command. |

## Options and trade-offs

| Approach | Guarantee | Operational cost |
|---|---|---|
| Detached serverless promise | Best effort | Lowest code; no lifetime guarantee |
| Graphile Worker core | Durable at-least-once; four-hour crash lock | One worker, existing Postgres |
| pg-boss | Durable at-least-once; configurable liveness/expiry | One worker, existing Postgres; larger queue API |
| BullMQ | Durable queue | Redis plus workers |
| Temporal | Durable workflow history/replay | Highest infrastructure and concepts |

## Recommendation for Travis — inference

Use pg-boss when recutting this seam:

1. insert `dest_job` and `boss.send("dispatch-dest", { destJobId })` through
   the same Drizzle transaction;
2. pass the stable command/turn ID as Cursor's `idempotencyKey` for correlation
   and possible vendor deduplication, without assuming undocumented semantics;
3. persist the returned run ID before treating dispatch as established; if
   the outcome is ambiguous, persist `send_unknown` and reconcile;
4. once the run ID is known, observe that run rather than issue another logical
   send;
5. configure heartbeat, expiry, retries, and retention from the product's
   actual execution window.

Graphile Worker is no longer the recommendation because its free crash lease
is materially longer than Travis's current timeout. Do not add Redis or
Temporal.

**Unresolved:** Cursor documents the send-key field but not duplicate-key
behavior, retention, conflict handling, or retrieval of the original run.
Contract-test those semantics against the pinned SDK/API. Until a guarantee
exists, the accepted-send/before-run-ID crash window cannot be closed by
blind retry.

---

# 8. Durable work order — `dest_job`

## Reference implementations

- pg-boss:
  [job identity, retries, expiry, and retention](https://pgboss.io/api/jobs)
- Graphile Worker:
  [tracking jobs in an application-owned schema](https://worker.graphile.org/docs/schema#tracking-jobs)
- Graphile Worker:
  [completed queue rows and job-key caveats](https://worker.graphile.org/docs/job-key#job-key-caveats)
- Cursor SDK Bridge:
  [create and send idempotency fields](https://github.com/cursor/sdk-bridge/blob/35b36b0c/proto/sdk/v1/sdk_agent_service.proto)
- Temporal:
  [workflow event-history durability](https://docs.temporal.io/workflows)

## Mechanism — verified

pg-boss and Graphile queue rows are delivery machinery with configurable or
implicit cleanup. Graphile explicitly recommends an application-owned
business record when completed-job history is product state. Temporal instead
retains workflow event history and reconstructs state by replay.

This supports Travis's current separation:

```text
dest_job = product truth
queue task = delivery attempt
Cursor idempotency key = correlation hint; duplicate semantics unverified
```

Queue attempt count and `dest_job` state are related but not identical. A
queue attempt says how often delivery code ran. `dest_job` says whether the
user's command was accepted, dispatched to a particular Cursor run, completed,
cancelled, or failed.

## Failure handling and integration boundary — verified

- Queue rows can be retried or deleted without deleting business history.
- Cursor creation can use a client-supplied agent ID; re-POSTing it returns
  `409 agent_id_conflict` rather than creating another agent.
- Cursor sends accept a client idempotency key, but the cited contract does
  not define duplicate-key outcomes. Never reuse one across different logical
  commands.
- Cursor permits one active run per agent and returns `409 agent_busy` for a
  concurrent follow-up.
- Cancellation is cooperative: terminal cancellation must be reconciled from
  the exact run, not inferred from the request to cancel.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Queue row only | Minimal duplication | Completion history disappears |
| Business job + queue task | Stable product semantics | Two related records |
| Temporal workflow | One durable execution/history abstraction | Disproportionate platform |

## Recommendation for Travis — inference

Keep `dest_job` authoritative and strengthen it:

- use a durable command/turn ID, not prompt text, as business identity and
  the Cursor send correlation key;
- validate lifecycle transitions with compare-and-set updates so a late
  worker cannot overwrite a terminal state;
- store exact Cursor agent and run IDs once accepted, and represent an
  ambiguous pre-run-ID outcome explicitly as `send_unknown`;
- represent `cancel_requested_at` separately from terminal cancellation;
- treat heartbeat as liveness evidence, not proof of useful execution;
- let worker tasks contain only the job ID.

Do not copy pg-boss attempt counters and stack traces into product state by
default. Expose only the final delivery error and timestamps the product needs;
use pg-boss's retained rows/logs for delivery diagnostics.

**Unresolved:** whether cancellation and retry after `agent_busy` are visible
product states or delivery-only states must remain a product/SA decision.

---

# 9. Per-agent work queue

## Reference implementations

- Cursor:
  [one active run and `409 agent_busy`](https://cursor.com/docs/cloud-agent/api/endpoints)
- pg-boss:
  [`key_strict_fifo` queue policy](https://pgboss.io/api/queues)
- Graphile Worker:
  [named queues](https://worker.graphile.org/docs/sql-add-job)
- Graphile Worker:
  [`batchGetJobs()` queue locks and ordering](https://github.com/graphile/worker/blob/91c950f7370aa2629107df1aa6a44b9f5985a1bd/src/sql/getJobs.ts#L43-L166)

## Mechanism — verified

Jobs sharing a Graphile queue name execute serially, but high-cardinality
queue names require cleanup and degrade performance. Acquisition chooses by
priority and `run_at`, so named queues are not unconditional FIFO.

pg-boss's `key_strict_fifo` policy provides FIFO independently for each
`singletonKey` on one queue. The key is required. A key's successor remains
blocked while its head is active, retrying, or permanently failed, while jobs
under other keys continue. Priority cannot reorder jobs inside one key;
deferred or dependency-blocked jobs can be skipped according to the documented
policy. Cursor separately enforces one active run per persistent agent and
returns `agent_busy` for a concurrent send.

## Failure handling and integration boundary — verified

- A queue may deliver twice; every item needs its own stable command ID and
  Cursor send correlation key.
- Strict FIFO requires ordering only commands that are simultaneously ready
  for the same agent; global worker order is irrelevant.
- A permanently failed head blocks later jobs for that key. pg-boss recovery
  is to retry or delete that queue job. Deletion must follow an explicit
  business-state resolution; it must not silently skip user work.
- `agent_busy` must leave the utterance pending. Consuming it as a failed
  attempt can exhaust retries while the existing run is healthy.
- Completion of the exact active run is the wake-up signal for the next item;
  an open browser SSE response is not.

## Options and trade-offs

| Queue shape | Advantage | Cost |
|---|---|---|
| pg-boss `key_strict_fifo` by binding | Established keyed serialization on existing Postgres | Failed head blocks that key |
| Product mailbox + wake-up queue | Visible pending history independent of delivery | Two coordinated state models |
| Spin another agent | Low wait | More cost; weaker continuity |
| Redis/RabbitMQ | Mature broker mechanics | New datastore/operations |
| Drain from SSE request | No worker | Progress depends on a connected client |

## Recommendation for Travis — inference

Use one pg-boss queue configured as `key_strict_fifo`, with the binding or
Cursor agent ID as `singletonKey`. Give every logical command its own durable
ID and keep `agent_busy` as the vendor-side final guard. This removes custom
claim/drain/wake-up logic while allowing unrelated agents to run concurrently.

Keep `queued_utterance` only if pending utterances are independently visible,
editable, or retained product history. In that case it remains product truth
and queue jobs remain delivery attempts; do not recreate FIFO arbitration in
application code.

**Unresolved:** product behavior for a permanently failed head—block for
operator/user retry, or resolve the business command and delete its queue
job—must be chosen before enabling successors.

---

# 10. Job-progress view — Stream

## Reference implementations

- BullMQ:
  [`Job.updateProgress()`](https://github.com/taskforcesh/bullmq/blob/a5e710bf4d1bf689fe40a372b3f0ddbbaaab33cc/src/classes/job.ts#L553-L556)
- BullMQ:
  [`QueueEvents.consumeEvents()`](https://github.com/taskforcesh/bullmq/blob/a5e710bf4d1bf689fe40a372b3f0ddbbaaab33cc/src/classes/queue-events.ts#L371-L420)
- BullMQ:
  [events guide](https://docs.bullmq.io/guide/events)
- BullMQ:
  [best-effort delivery correction](https://github.com/taskforcesh/bullmq/commit/209181d3814a5fb9be9a30b3b2dfecb72eb51474)
- Cursor SDK Bridge:
  [durable run offsets and recovery](https://github.com/cursor/sdk-bridge/blob/35b36b0c/docs/streaming.md)

## Mechanism — verified

BullMQ workers persist latest progress and publish lifecycle/progress events.
Consumers can resume from a Redis Stream event ID. The monitoring stream is
approximately trimmed and therefore best-effort; a sufficiently slow consumer
can miss old events.

Travis's persisted `stream_event` rows are stronger than a monitoring-only
event stream when completed episodes must remain inspectable.

Cursor exposes the source-side recovery mechanism Travis should reuse.
`ObserveRun` replays durable events from the beginning or after an opaque,
exclusive, run-scoped offset. A dropped live `Send` stream does not cancel the
run. Live-send offsets must not be reused with `ObserveRun`; recovery begins
from the start or from an offset previously produced by `ObserveRun`.

## Failure handling and integration boundary — verified

- Keepalives carry no durable offset and must not advance a cursor.
- A normal run emits terminal result, then `done`, then closes. A transport
  error before that means “observation failed,” not “run failed.”
- Recovery replay can duplicate already-projected events. Consumers must
  upsert/dedupe by durable source identity.
- Cursor deltas and tool details can be non-durable. They belong in transient
  diagnostics unless a stable event identity exists.
- Compaction must never remove the final product post or the last terminal
  state needed to reconstruct the card.

## Options and trade-offs

| Progress model | Advantage | Cost |
|---|---|---|
| Latest progress value | Tiny | Cannot reconstruct work |
| Durable meaningful beats | Replayable and card-ready | More rows |
| Every token/delta | Maximum detail | Excess writes and noise |
| Broker monitoring stream | Easy live fanout | Retention is not business truth |

## Recommendation for Travis — inference

Keep `stream` plus ordered `stream_event`:

- persist meaningful message/process/status beats, not tokens;
- persist Cursor run ID and, where available, durable event identity/offset;
- allocate Travis projection sequence in the database;
- notify after commit;
- replay by sequence;
- compact or expire low-value process events;
- keep final specialist output on `voice_turn`.

No BullMQ/Redis adoption is justified.

**Unresolved:** the retention window for Cursor durable run events is not
documented in the cited bridge contract. Travis must not make indefinite
replay depend on it.

---

# 11. Conversational command routing — new, change, cancel, talk

## Reference implementations

- Temporal:
  [`defineSignal`, `defineUpdate`, `defineQuery`, and `setHandler`](https://github.com/temporalio/sdk-typescript/blob/34a7913e9c9495c43bc63f445a845cc18a5cebd1/packages/workflow/src/workflow.ts#L1426-L1590)
- Temporal:
  [Signals, Updates, and Queries](https://docs.temporal.io/encyclopedia/workflow-message-passing)
- Temporal:
  [`WorkflowHandle.cancel()`](https://github.com/temporalio/sdk-typescript/blob/34a7913e9c9495c43bc63f445a845cc18a5cebd1/packages/client/src/workflow-client.ts#L1849-L1864)
- Temporal:
  [cancellation versus termination](https://docs.temporal.io/encyclopedia/workflow/cancellation-and-termination)
- Rasa:
  [`FallbackClassifier`](https://github.com/RasaHQ/rasa/blob/c4069568b4fe2adb5d5a1e55d17ce8cb9dda27fc/rasa/nlu/classifiers/fallback_classifier.py#L70-L130)
- Cursor:
  [run creation, busy response, and cancellation](https://cursor.com/docs/cloud-agent/api/endpoints)
- Cursor:
  [steering a run in flight](https://cursor.com/docs/sdk/typescript#steering-a-run-in-flight)

## Mechanism — verified

Temporal distinguishes durable asynchronous Signals, validated/result-bearing
Updates, read-only Queries, cooperative cancellation, and forceful
termination. Duplicate Signals require application idempotency; Updates have
an update identity within their documented scope. Rasa demonstrates the other
important guarantee: ambiguous classification should fall back rather than
act.

Cursor adds two concrete command boundaries. A follow-up while another run is
active returns `agent_busy`, and cancel operates on a particular run. The SDK
stream still produces a terminal cancelled result after cancellation.
The SDK also exposes `run.steer(text)`, but its documented Cloud Agent outcome
is `revert_to_followup`; active steering is local-only. It therefore does not
provide Travis's Cloud runs with in-flight mutation.

## Failure handling and integration boundary — verified

- A repeated `new` or `change` command uses the original turn/command ID as
  the Cursor send correlation key.
- `change` arriving during an active Cloud run cannot be steered in flight.
  The documented `revert_to_followup` outcome means queue it for later, or use
  an explicitly chosen cancel-and-replace policy.
- `cancel` races with natural completion. Persist “cancel requested,” invoke
  cancel on the exact run, then accept whichever terminal state Cursor
  reports.
- A not-cancellable response can mean the run already ended. Re-read the run;
  do not convert it directly to failure.
- Ambiguous target resolution must have no specialist side effect.

## Options and trade-offs

| Command handling | Advantage | Cost/risk |
|---|---|---|
| Deterministic state machine | Cheap and testable | Limited language |
| Model classifier | Broad language | Wrong-job side effects |
| Temporal messages | Strong durable semantics | Whole workflow platform |

## Recommendation for Travis — inference

Use an explicit state machine:

| Intent | Durable action |
|---|---|
| `new` | idempotently create/recover a job, then enqueue dispatch |
| `change` | queue a follow-up, or apply an explicit cancel-and-replace policy |
| `cancel` | persist cancel request, call Cursor, reconcile terminal state |
| `talk` | no specialist side effect |

With several open jobs, require a unique seat/token target. Otherwise ask for
clarification or treat it as talk. Never silently choose the newest job.

Do not add Temporal merely to borrow its vocabulary. Cursor's one-active-run
rule, exact-run cancellation, and durable observation provide most execution
mechanics; Travis still owns intent resolution, queued changes,
ambiguous-send reconciliation, and business state.

**Unresolved:** whether spoken “change” means queue-follow-up or
cancel-and-replace is product behavior, not an infrastructure default.

---

# 12. Append-only conversation log — room tape

## Reference implementations

- EventStoreDB/Kurrent:
  [atomic append and expected revision](https://docs.kurrent.io/clients/tcp/dotnet/21.2/appending)
- Matrix Synapse:
  [`_persist_events_and_state_updates()`](https://github.com/element-hq/synapse/blob/26a92c711161be9f9b8c69b33144ba7fe5b31063/synapse/storage/databases/main/events.py#L309-L438)
- Mattermost:
  [`SqlPostStore.Save()`](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/channels/store/sqlstore/post_store.go#L186-L368)
- PostgreSQL:
  [`UPDATE ... RETURNING`](https://www.postgresql.org/docs/current/sql-update.html)

## Mechanism — verified

EventStoreDB appends atomically and uses expected stream revision for
optimistic concurrency; stable event IDs make retries idempotent under the
documented append contract. Synapse allocates database stream ordering before
transactional persistence. Mattermost shows the pragmatic alternative:
timeline posts can be updated/deleted.

The compact Postgres implementation is a per-room counter on the room row (or
a dedicated counter row). `UPDATE ... SET next_seq = next_seq + 1 ...
RETURNING next_seq` takes a row lock and assigns one position. Insert the turn
in the same transaction. A unique `(session_id, seq)` constraint is the last
line of defense, not the allocation algorithm.

## Failure handling and integration boundary — verified

- Concurrent writers serialize only on their room's counter row, not globally.
- Transaction rollback rolls back both counter increment and turn insert.
- A stable command/event ID plus a unique constraint returns the existing turn
  on request retry; pre-check-then-insert alone has a race.
- Database sequence order is acceptance order, not wall-clock or vendor-event
  order.
- Mutable streaming buffers should not consume or rewrite finalized
  append-only positions unless their provisional lifecycle is explicit.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Strict immutable event stream | Strong audit/replay | Correction/redaction projections |
| Mutable message rows | Simple streaming/edit behavior | Weaker audit guarantees |
| Process-local sequence lock | Tiny | No cross-isolate serialization |
| Database sequence/lock | Correct across writers | More transactional care |

## Recommendation for Travis — inference

Keep Postgres. Add a database guarantee:

- `UNIQUE(session_id, seq)`;
- allocate sequence under a room-row lock or transaction-scoped advisory lock;
- derive write idempotency from a stable event/command ID;
- keep finalized turns insert-only;
- store mutable stream buffers separately or explicitly mark them provisional.

Do not adopt EventStoreDB.

Prefer an atomic room-counter update over transaction-scoped advisory locks:
the counter is inspectable, naturally scoped, and cannot be silently skipped
by a writer that forgot to take the advisory lock.

**Unresolved:** redaction/correction policy for finalized posts is a product
retention decision. “Append-only” does not remove privacy obligations.

---

# 13. Realtime event subscription — room wire

## Reference implementations

- Cursor Cloud Agents:
  [resumable run SSE](https://cursor.com/docs/cloud-agent/api/endpoints)
- Mercure:
  [reconnection and history](https://mercure.rocks/docs/concepts/reconnection-and-history)
- PostgreSQL:
  [`NOTIFY` guarantees](https://www.postgresql.org/docs/current/sql-notify.html)
- PostgreSQL:
  [`LISTEN` setup race](https://www.postgresql.org/docs/current/sql-listen.html)
- PgBouncer:
  [feature compatibility by pooling mode](https://www.pgbouncer.org/features.html)

## Mechanism — verified

Cursor resumes a run stream from `Last-Event-ID`. Mercure assigns event IDs
and replays retained history. PostgreSQL delivers notifications after commit,
can coalesce identical notifications in one transaction, and provides no
durable replay.

PostgreSQL documents the safe startup order:

1. issue and commit `LISTEN`;
2. inspect current database state;
3. process later notifications.

Duplicates around the initial snapshot are expected and should be harmless.

LISTEN is session-scoped and disappears when the connection ends. PgBouncer's
official matrix marks LISTEN unsupported in transaction-pooling mode, although
NOTIFY remains supported. A listener therefore needs a dedicated direct or
session-pooled Postgres connection. After every reconnect it must repeat the
safe startup order.

NOTIFY is delivered only after commit, identical payloads in one transaction
may be folded, and the notification queue can be held open by a listener that
stays inside a long transaction. These are reasons to carry only an
invalidation hint—not product data—in the payload.

## Failure handling and integration boundary — verified

- Listener disconnect: reconnect, commit LISTEN, snapshot durable rows, then
  process hints.
- Notification loss or folding: replay rows after the last durable room
  sequence.
- Duplicate notification/snapshot overlap: dedupe turns by durable ID.
- Browser SSE disconnect: reconnect with last applied sequence; the server
  snapshot repairs any missed hint.
- Slow client: close/rotate the bounded SSE response; do not retain an
  unbounded in-memory event history.
- Database failover: assume the session and registrations are gone.

## Options and trade-offs

| Transport | Advantage | Cost |
|---|---|---|
| SSE + LISTEN/NOTIFY | Very compact; existing Postgres | One connection/listener; no replay in NOTIFY |
| Mercure | Managed fanout and history | New service |
| Redis pub/sub/streams | Scales fanout | New datastore and retention semantics |
| WebSockets | Bidirectional | More connection/protocol machinery |

## Recommendation for Travis — inference

Keep database truth, SSE, and room-sequence replay. Correct the current
catch-up-before-LISTEN race by subscribing and committing first, then reading
the catch-up snapshot. Continue deduping by durable identity and reconnecting
at the 60-second boundary.

Add fanout infrastructure only after measured Postgres connection pressure.

Do not run LISTEN over a transaction-pooled URL. If the deployment cannot
provide one direct/session connection per listener process, use the existing
database provider's realtime facility or periodic replay rather than writing a
fragile pseudo-LISTEN layer.

**Unresolved:** document which production URL bypasses transaction pooling and
how many dedicated listener connections the serverless deployment can hold.

---

# 14. Durable orchestration memory — Travis thread

## Reference implementations

- LangGraph:
  [persistence concepts](https://docs.langchain.com/oss/python/langgraph/persistence)
- LangGraph.js:
  [`PostgresSaver`](https://github.com/langchain-ai/langgraphjs/blob/86389fa3/libs/checkpoint-postgres/src/index.ts)
- LangGraph.js:
  [PostgresSaver integration tests](https://github.com/langchain-ai/langgraphjs/blob/86389fa3/libs/checkpoint-postgres/src/tests/checkpoints.int.test.ts)
- OpenHands:
  [conversation persistence](https://docs.openhands.dev/sdk/guides/convo-persistence)

## Mechanism — verified

LangGraph groups checkpoints by `thread_id` and optional namespace. Each
checkpoint captures graph state at a step, allowing inspection, replay,
fault recovery, and continuation. The JavaScript `PostgresSaver` used by
Travis stores checkpoints, channel blobs, and pending writes. Its integration
tests cover setup migrations, put/get/list, pending writes, parent
configuration, and `deleteThread`.

`setup()` installs and migrates saver-owned tables. `deleteThread(threadId)`
deletes that thread's checkpoints, writes, and blobs. The saver does not
provide exclusive ownership for two concurrent graph invocations using the
same thread; checkpoint persistence is not a room-level mutex.

## Failure handling and integration boundary — verified

- Process death after a checkpoint: the next invocation can load it.
- Pending node writes are keyed by thread/checkpoint/task/index and can be
  recovered with the checkpoint.
- Setup is a schema migration and should not race on request paths.
- Concurrent same-thread invocations can fork logical history even when every
  individual database write succeeds.
- Thread deletion is the established cleanup API; arbitrary table deletes
  bypass saver ownership.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Replay the visible room tape | One source of truth | Recomputes private graph state |
| LangGraph checkpoints in Postgres | Existing integration; recovery by thread | Checkpoint growth and schema lifecycle |
| LangGraph Store | Cross-thread memories | Another memory policy and namespace |
| In-memory graph state | Smallest code | Lost on restart |

## Recommendation for Travis — inference

Keep `PostgresSaver` and use the room ID as `thread_id`. Run `setup()` as a
deployment or migration step, not on each request. The room tape remains the
human-visible product record; graph checkpoints are execution memory, not an
alternate transcript.

Serialize LangGraph invocation with the pg-boss `key_strict_fifo` queue using
the room ID as `singletonKey`. This is an explicit exclusion mechanism, not a
property of `PostgresSaver`. A transactional room claim/CAS or database lock
is a valid alternative, but duplicates queue mechanics already needed for
specialist work. Add retention by invoking `deleteThread` when room policy
says the thread is gone; do not prune saver tables behind the library.

Do not add LangGraph Store until Travis has a specified cross-room memory use.

**Unresolved:** LangGraph.js documents whole-thread deletion, not a stable
age-based checkpoint compaction contract. Define room/thread retention before
inventing partial pruning.

---

# 15. Durable specialist continuity — Cursor thread

## Reference implementations

- Cursor:
  [TypeScript SDK](https://cursor.com/docs/sdk/typescript)
- Cursor SDK Bridge:
  [streaming and reconnection](https://github.com/cursor/sdk-bridge/blob/35b36b0c/docs/streaming.md)
- Cursor SDK Bridge:
  [agent/run/idempotency protocol](https://github.com/cursor/sdk-bridge/blob/35b36b0c/proto/sdk/v1/sdk_agent_service.proto)
- OpenHands:
  [conversation persistence](https://docs.openhands.dev/sdk/guides/convo-persistence)

## Mechanism — verified

Cursor's SDK creates and resumes persistent cloud agents, exposes agent and
run identity, supports follow-up prompts, and streams run-scoped events.
Creation and each send accept distinct idempotency keys. A cloud agent
persists conversation state server-side; `Agent.resume()` reattaches from a
new process.

The protocol's presence of an `idempotency_key` field is verified. Its
duplicate-key behavior is not: the cited sources do not promise suppression,
return of an existing run, conflict behavior, or a retention window.

`Send` is the live stream. `ObserveRun` replays durable events and then follows
the active run. Dropping the send stream does not cancel the run. Recovery uses
the exact run ID, an opaque run-scoped offset from `ObserveRun`, or replay from
the beginning. A successful terminal stream is result → done → close; a
transport error does not prove run failure.

This is distinct from the Travis thread. Cursor owns specialist execution
context; Travis owns the product-visible room, routing, and audit trail.

## Failure handling and integration boundary — verified

- Duplicate create: use creation key or client-supplied agent ID; recover the
  durable agent instead of creating another.
- Duplicate/ambiguous follow-up: retain the original command and send key, but
  do not resend until the original outcome has been reconciled; key reuse is
  not itself a documented deduplication guarantee.
- Concurrent follow-up: Cursor returns `agent_busy`; queue rather than invent
  another agent.
- Stream loss: observe the same run; never infer “no run” from a broken
  socket.
- Cancellation: request it on the exact run and wait for terminal status.
- Replay: dedupe durable events; do not use live-send offsets as
  `ObserveRun` offsets.
- SDK callbacks are awaited, so a slow persistence callback applies
  backpressure to the live stream.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| New agent for every turn | Isolation | Repeated context and lost continuity |
| Persistent agent + exact run IDs | Efficient follow-ups and precise observation | Must persist two vendor identities |
| Mirror all vendor events | Maximum diagnostics | Noise and vendor coupling |
| Mirror product-relevant results | Compact stable record | Less low-level forensic detail |

## Recommendation for Travis — inference

Persist the exact Cursor agent ID, command ID, send key, run ID, and latest
durable observe offset. Send follow-ups to the same agent with the command ID
as the correlation key. Once known, observe and harvest the exact run that
accepted each prompt. If the send fails ambiguously before returning a run ID,
record `send_unknown` and reconcile rather than claiming exact-run recovery.
Mirror the prompt, short terminal outcome, assistant result, and artifact
relationships into Travis.

Treat Cursor context as execution continuity, never as the source of record.
Do not reconstruct ownership by searching for the newest run.

Use the SDK's `Agent.resume`, `Run`, and `ObserveRun` exact-run recovery before
writing another adapter-level replay protocol. Continue passing the SDK's
idempotency field, but do not promote it into a stronger guarantee than its
contract states.

**Unresolved:** Cursor's API is public beta, and the cited docs do not specify
duplicate-key behavior or idempotency-key/durable-event retention windows.
Pin the SDK, contract-test duplicate send and replay, and treat a version
change as an integration migration.

---

# 16. External run outputs — artifacts

## Reference implementations

- Cursor Cloud Agents:
  [artifact endpoint](https://cursor.com/docs/cloud-agent/api/endpoints#artifacts)
- Cursor SDK Bridge:
  [streaming artifact download RPC](https://github.com/cursor/sdk-bridge/blob/35b36b0c/proto/sdk/v1/sdk_agent_service.proto)
- Mattermost:
  [`FileInfoStore.GetForPost()` and related metadata queries](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/channels/store/sqlstore/file_info_store.go#L354-L430)
- Zulip:
  [message attachment relationships](https://github.com/zulip/zulip/blob/e45560dfcfc40c786c689b454ef6f4e7dc0f3eaf/zerver/models/messages.py#L794-L821)

## Mechanism — verified

Cursor exposes agent/workspace artifacts through authenticated API endpoints.
Mattermost stores file metadata separately and queries it by post;
Zulip derives which uploads are used by a message. Both mature chat systems
model the relationship between a conversational record and a file rather than
embedding file bytes in the message.

Cursor's current v1 contract adds important boundaries:

- artifacts are **agent-scoped**, because one workspace persists across runs;
- list returns relative paths under `artifacts/`, size, and update time;
- download accepts only a listed relative path and returns a presigned URL
  that expires after 15 minutes;
- the SDK Bridge can stream artifact bytes through its authenticated RPC.

The API does not provide a run ID on each listed artifact. Timestamp filtering
is therefore a heuristic, not a provenance guarantee.

## Failure handling and integration boundary — verified

- Never persist or expose the presigned URL. Request a fresh URL after expiry
  and stream/proxy bytes through the authorized Travis route.
- Authorize room membership and the local artifact relationship *before*
  calling Cursor. A valid Cursor path alone grants no Travis-room ownership.
- Treat listing and download separately: a listed artifact can disappear or
  fail to download, and a failed list must not erase local relationships.
- The relative-path restriction blocks arbitrary workspace paths; retain the
  exact returned path rather than reconstructing one from a filename.
- Agent-scoped listing means the same path can be overwritten by a later run.
  A direct path mentioned by the exact run is stronger evidence than
  “modified after run start.”
- An uncopied path is safe to proxy only inside the originating run's
  collection window. Invalidate that transient relationship afterward; a
  later download may return different bytes at the same path.
- If Travis copies bytes later, write to a temporary object, verify size/hash,
  then commit owned metadata. Mattermost's resumable upload path similarly
  separates upload session progress from final `FileInfo`.

## Options and trade-offs

| Ownership model | Advantage | Cost |
|---|---|---|
| Transient Cursor-only bytes | No duplicate storage pipeline | No historical durability or immutable provenance |
| Copy to owned object storage | Independent retention and URLs | Transfer, cleanup, access control |
| Put bytes in Postgres | One backup boundary | Database growth and poor serving path |
| Store only external URLs | Tiny | Expiring links and weak authorization |

## Recommendation for Travis — inference

Classify each attachment explicitly. Cursor-only artifacts are transient:
keep relationship metadata locally and proxy downloads only during the
originating run's collection window, but do not promise historical Log
availability or immutable run provenance. For any file that must remain
attached to a historical turn, copy bytes to an immutable owned object key
during turn/run finalization and persist its hash, size, source run, and
ordering. Do not store file bytes in Postgres.

Prefer the SDK's authenticated `downloadArtifact()` byte stream when available
over manually exposing a presigned URL. Bound download size/time and content
type at the server route.

**Unresolved:** Cursor does not document artifact retention, immutable
versioning, checksums, or run-level provenance in the cited API. Any artifact
that becomes a legal/business record must be copied to owned storage at
finalization, not lazily assumed durable.

---

# 17. Deliberate work promotion — Backlog

## Reference implementations

- Mattermost Todo:
  [message-to-task commands](https://github.com/mattermost-community/mattermost-plugin-todo/blob/5ff2c431108649c243c99e56863ed5f9f9cd8970/server/plugin.go#L203-L286)
  and
  [task persistence](https://github.com/mattermost-community/mattermost-plugin-todo/blob/5ff2c431108649c243c99e56863ed5f9f9cd8970/server/store.go#L58-L205)
- Discourse Assign:
  [`Assigner`](https://github.com/discourse/discourse-assign/blob/5eab6bb40416e3959d6765fb63887234e233baf9/lib/assigner.rb)
- GitHub:
  [convert a task-list item into an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue)
- Mattermost:
  [pending-post duplicate creation tests](https://github.com/mattermost/mattermost/blob/c9a4092a/server/channels/app/post_test.go)

## Mechanism — verified

Mattermost Todo promotes a chosen post into a separately stored task with its
own state. Discourse Assign applies explicit assignment to an existing topic.
GitHub can convert a selected task-list item into an issue while preserving a
relationship to its source. In each case, ordinary conversation does not
silently become managed work.

Mattermost's broader post path demonstrates the retry mechanism missing from
the Todo plugin: a client-generated pending-post ID returns the previously
created post under duplicate and concurrent requests. The Todo plugin itself
does not establish a strong duplicate-promotion contract; a reported repeated
assignment path has produced a server error. The safe lesson is the stable
source/command identity, not the plugin's storage implementation.

## Failure handling and integration boundary — verified

- Promotion is a separate creation command and must be idempotent under double
  tap, response loss, and browser retry.
- Source relation and copied founding text serve different purposes. The
  relation navigates back; the snapshot preserves what founded the work if the
  conversation is later corrected or removed.
- Conversation continuation does not mutate task lifecycle.
- Duplicate promotion should return the existing backlog item, not create a
  sibling or report a uniqueness error.
- Status changes need validated transitions; an agent reply or source-message
  edit is not completion.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Explicit promotion | Clear intent and low noise | One deliberate action |
| Automatically classify every request | Less user action | False positives and model cost |
| Treat every request as backlog | Complete capture | Backlog becomes a transcript |
| Keep source and work as one row | Tiny schema | Conversation edits corrupt work identity |

## Recommendation for Travis — inference

Keep Hold/pass-on as explicit promotion. Preserve the source room/turn and a
frozen founding line, while giving the backlog item its own title, status,
ownership, and lifecycle. Never project every request automatically and never
infer Done merely because an agent replied.

Use the source turn ID (or explicit promotion command ID) under a unique
constraint and insert with conflict recovery. This is smaller and stronger
than fuzzy title/body duplicate detection.

**Unresolved:** whether one turn may intentionally found several initiatives
must be decided before choosing uniqueness scope. If yes, the command ID—not
source turn alone—is the unique key.

---

# 18. Retrieval of prior asks — Requests

## Reference implementations

- Matrix Synapse:
  [room-scoped message search](https://github.com/element-hq/synapse/blob/26a92c711161be9f9b8c69b33144ba7fe5b31063/synapse/storage/databases/main/search.py#L431-L708)
- Zulip:
  [search narrow construction](https://github.com/zulip/zulip/blob/e45560dfcfc40c786c689b454ef6f4e7dc0f3eaf/zerver/lib/narrow.py#L673-L751)
- Mattermost:
  [post search API](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/channels/api4/post.go#L1029-L1095)
- PostgreSQL:
  [generated `tsvector` columns and indexes](https://www.postgresql.org/docs/current/textsearch-tables.html)
- PostgreSQL:
  [`websearch_to_tsquery` and text-search operators](https://www.postgresql.org/docs/current/functions-textsearch.html)
- PostgreSQL:
  [preferred GIN indexes](https://www.postgresql.org/docs/current/textsearch-indexes.html)

## Mechanism — verified

Synapse applies room visibility constraints before returning ranked message
matches and supports database-specific full-text paths. Zulip compiles search
terms into server-side query constraints. Mattermost authorizes the user,
parses search terms, and searches posts on the server. The common guarantee is
that search is scoped by access control before results leave the service.

PostgreSQL already supplies the capability needed at the next scale step:

- `websearch_to_tsquery` accepts raw user text without `to_tsquery` syntax
  errors and supports phrases, `OR`, and exclusion;
- a stored generated `tsvector` keeps query and indexed expressions aligned;
- GIN is the preferred full-text index;
- `ts_rank`/`ts_rank_cd` rank candidates after the authorization predicate.

## Failure handling and integration boundary — verified

- Membership/ownership filtering belongs in the same SQL query before limit
  and pagination; filtering search results in application code can leak counts
  and under-fill pages.
- Text-search configuration is part of index semantics. Querying an `english`
  vector as `simple` (or vice versa) produces surprising misses and may miss
  the index.
- Full-text search is token/lexeme search, not substring search. Filenames,
  role aliases, hashes, and code identifiers may need `simple` configuration
  or a bounded `ILIKE`, not Elasticsearch.
- An empty/stop-word-only query can produce no searchable nodes; return an
  empty result rather than broadening to every row.
- Stable pagination needs a deterministic tie-breaker such as rank,
  timestamp/sequence, and ID.

## Options and trade-offs

| Search path | Advantage | Cost |
|---|---|---|
| Bounded SQL text match | Minimal code and infrastructure | Limited ranking at scale |
| PostgreSQL `tsvector` + GIN | Better ranking and scale | Index/write complexity |
| External search service | Rich search and large scale | Another datastore and sync path |
| Client-side filtering | Tiny server implementation | Leaks scope and misses unloaded history |

## Recommendation for Travis — inference

Keep canonical search server-side and room-scoped, with membership/ownership
checked first. Start with bounded text matching over the request-bearing rows.
Add a generated `tsvector` and GIN index only after query volume or latency
justifies it. Do not add Elasticsearch or OpenSearch.

When FTS is justified, use PostgreSQL's built-ins rather than a JavaScript
search library: one generated vector, one GIN index, one room-authorized query.
Measure whether `simple` or language stemming matches Travis's prompts before
locking the generated expression.

**Unresolved:** the expected search semantics—natural language, exact phrase,
code/path substring, or all three—must be named before selecting one index.

---

# 19. Per-turn listening acknowledgement — Hear and Skip

## Reference implementations

- Matrix Synapse:
  [receipt persistence](https://github.com/element-hq/synapse/blob/26a92c711161be9f9b8c69b33144ba7fe5b31063/synapse/storage/databases/main/receipts.py#L1050-L1120)
- Zulip:
  [unread-message model](https://github.com/zulip/zulip/blob/e45560dfcfc40c786c689b454ef6f4e7dc0f3eaf/docs/subsystems/unread_messages.md#L1-L70)
- Mattermost:
  [channel membership and read-state queries](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/channels/store/sqlstore/channel_store.go#L2875-L3050)
- Zulip:
  [ordered row locking for concurrent bulk flag updates](https://github.com/zulip/zulip/pull/22710)

## Mechanism — verified

Synapse persists receipts and advances them without moving backward. Zulip
tracks unreadness with message-level sets because topic and mention semantics
cannot be represented by one channel cursor. Mattermost uses channel
membership read state and update timestamps. These are different answers to
the same choice: a compact high-water mark or exact per-message state.

Zulip found a concrete bulk-update failure: overlapping mark-read operations
could deadlock. Its fix takes row locks in a consistent order. Its client also
batches very large updates and treats server truth after reload as corrective;
optimistic progress UI is not the receipt authority.

## Failure handling and integration boundary — verified

- Repeating “mark heard” is naturally idempotent; preserve the first timestamp
  unless the product explicitly needs last-heard time.
- Bulk acknowledgement must validate that every ID is an eligible turn in the
  current room/user scope.
- If rows are locked/read before update, acquire them in stable ID/sequence
  order to avoid deadlocks.
- Concurrent Hear/Skip on one turn needs a precedence rule only if those modes
  have different meaning. A timestamp alone cannot encode it.
- A room high-water mark cannot represent a deliberately skipped hole.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Room high-water cursor | Very compact | Cannot preserve holes or per-turn action |
| Per-turn timestamp | Exact and auditable | One field/update per turn |
| Separate receipt table | Multiple users and receipt types | Join and cleanup complexity |

## Recommendation for Travis — inference

Retain per-turn `heard_at`; Hear and Skip are direct actions on a particular
turn, so a room cursor loses product meaning. Make acknowledgement idempotent:
`UPDATE ... SET heard_at = now() WHERE heard_at IS NULL`, and bulk-ack in one
transaction.

If Hear versus Skip later changes product behavior, add an explicit mode.
Do not overload the timestamp with a distinction it cannot represent.

For Travis's current single-owner per-turn timestamp, one conditional update
is enough; no receipt library or lock table is needed. If multiple users gain
independent receipt state, move to a `(turn_id, user_id)` receipt relation
rather than adding columns per user.

**Unresolved:** current copy exposes two actions but one stored fact. Decide
whether Hear and Skip are synonyms for “acknowledged” or distinct durable
events.

---

# 20. Exclusive audio ownership — one ear

## Reference implementations

- LiveKit Agents:
  [session interruption](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/agent_session.py#L1648-L1667)
  and
  [`AudioOutput`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/io.py#L143-L329)
- Pipecat:
  [output interruption](https://github.com/pipecat-ai/pipecat/blob/d9a6d55702d9e513e0f2d3a8a23a954b22425b60/src/pipecat/transports/base_output.py#L609-L643)
- WebRTC samples:
  [stop and replace media tracks](https://github.com/webrtc/samples/blob/6e2c5a117aa860d66d874f7c0df0ef9a3e2cd74e/src/content/devices/input-output/js/main.js#L117-L145)
- Jitsi:
  [serialized local-track mute](https://github.com/jitsi/lib-jitsi-meet/blob/572f49c8eb8083da3dd8fa5358c38a2343c2d0bf/modules/RTC/JitsiLocalTrack.ts#L393-L540)
- Web platform:
  [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- Web platform:
  [`LockManager.request()`](https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request)
- Web platform:
  [`getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- Web platform:
  [`MediaStreamTrack.stop()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop)
  and
  [`ended` event](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/ended_event)
- Web platform:
  [`devicechange`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/devicechange_event)

## Mechanism — verified

LiveKit models playout as an interruptible handle and clears queued speech
when interrupted. Pipecat propagates interruption frames to stop output.
Browser media tracks release devices through `track.stop()`. Jitsi serializes
mute operations to prevent overlapping async transitions from leaving track
state inconsistent.

The reusable production pattern is explicit ownership plus cancellation of
stale asynchronous acquisition.

The browser already supplies the cross-tab portion. An exclusive Web Lock is
origin-scoped, queues competing tabs/workers, releases when its async callback
finishes, and supports conditional acquisition and aborting a *lock request*.
It does not arbitrate modes inside one tab.

The media boundary has sharper edges:

- `getUserMedia()` may remain pending indefinitely if the user ignores the
  permission prompt;
- the documented `MediaStreamConstraints` contract does not provide a
  portable cancellation handle for an already-started acquisition;
- `track.stop()` immediately sets `readyState = "ended"` but deliberately
  does **not** fire the `ended` event;
- `ended` does fire for revocation, device removal, or source loss;
- `devicechange` tells the app to re-enumerate devices, not that it may reuse
  a dead track.

## Failure handling and integration boundary — verified

- Use a generation token even with Web Locks. If a late acquisition resolves
  after ownership changed, stop all of its tracks immediately.
- Release every track explicitly during normal teardown; do not wait for
  `ended`.
- Listen for `ended` to recover from external loss and for `devicechange` to
  refresh choices.
- Hold the cross-tab Web Lock for the complete microphone-ownership lifetime,
  not only around `getUserMedia()`.
- Bound acquisition with a timeout/state transition. If permission remains
  pending, mark that generation abandoned and let the lock callback finish so
  the lock releases. If the abandoned `getUserMedia()` later resolves, the
  generation guard must immediately stop every returned track.
- If Web Locks is unsupported, report that cross-tab exclusion is unavailable
  and fall back only according to explicit product policy. Unsupported does
  not prove another tab owns the microphone.
- React cleanup must invalidate the generation and stop tracks, making
  StrictMode's setup/cleanup replay harmless.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Local ownership state machine | Fits one browser tab; no service | Must handle stale promises correctly |
| Audio framework arbitration | Rich interruption/barge-in | Large dependency and server path |
| Let each feature own media | Locally simple | Races, feedback, leaked tracks |

## Recommendation for Travis — inference

Keep the custom state machine:
`none | stt-starting | stt | live-starting | live`. Increment a generation
token on every transition; an acquisition resolving under an old token must
immediately stop every acquired track. Fully stop and release the prior owner
before starting the next.

Use half-duplex while browser TTS is speaking. Do not add LiveKit or Pipecat
solely for client-side arbitration.

Wrap the tab-local state machine in `navigator.locks.request("travis-mic")`
when supported. Keep the lock callback bounded even when the permission
prompt is ignored, and retain the generation guard for a late-resolving media
promise. This replaces custom BroadcastChannel leader election; it does not
replace the state machine.

**Unresolved:** whether two Travis tabs should queue for the microphone or
fail immediately is product behavior. Web Locks supports both queued and
`ifAvailable` modes.

---

# 21. Spoken playback — readback

## Reference implementations

- LiveKit Agents:
  [`AudioOutput`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/io.py#L143-L329)
  and
  [`TranscriptSynchronizer`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/transcription/synchronizer.py#L484-L755)
- Pipecat:
  [`TTSService`](https://github.com/pipecat-ai/pipecat/blob/d9a6d55702d9e513e0f2d3a8a23a954b22425b60/src/pipecat/services/tts_service.py#L116-L1660)
- Web platform:
  [`SpeechSynthesis`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis),
  [`voiceschanged`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event),
  and
  [`cancel()`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel)

## Mechanism — verified

LiveKit's output handle tracks queued duration, played duration, interruption,
and completion; its transcript synchronizer aligns text publication with
actual playout. Pipecat serializes text into TTS frames, aggregates words and
timestamps, and handles interruption and completion signals. Both treat
speech as an ordered playout lifecycle, not a set of independent calls.

The browser API already owns a global utterance queue. `speak()` appends,
`pending`/`speaking` expose coarse state, `cancel()` immediately stops the
current utterance and clears all queued utterances, and `voiceschanged`
signals that the initially empty or later-updated voice list should be read
again.

## Failure handling and integration boundary — verified

- Keep one application queue in front of the browser queue; otherwise unrelated
  components can interleave utterances.
- Call `cancel()` on mode switch, interruption, room exit, and unmount. Guard
  `onend`/`onerror` with a generation because callbacks from cancelled
  utterances can arrive after a replacement started.
- Resolve a preferred voice by stable attributes each time the voices list
  changes; do not assume `getVoices()` is populated at mount.
- Treat `onerror` as terminal for that chunk and release one-ear ownership.
- Use `speechSynthesis.speaking`/`pending` as diagnostics, not the sole
  application state; they do not identify which Travis turn is speaking.
- Realtime model audio and browser TTS must share the same output ownership so
  both cannot speak at once.

## Options and trade-offs

| Path | Advantage | Cost |
|---|---|---|
| Browser speech synthesis | No service bill or audio storage | Voice differs by browser/device |
| Realtime model audio | Natural low-latency dialogue | Session/model cost |
| Cloud TTS | Consistent voices and files | Provider, latency, storage, billing |

## Recommendation for Travis — inference

Keep Realtime audio for short Travis conversation beats and browser TTS for
explicit specialist Play replies and fallback. Use one serialized output
queue. Hold microphone ownership until `onend` or `onerror`, then wait for the
audio system to become idle before reacquiring input.

Persist the text and heard state, not generated audio. Add cloud TTS only if
measured browser inconsistency breaks the product experience.

The explicit Play action is also the safest browser activation boundary.
Automatic readback after a prior opt-in should be tested on the supported
phone browsers; browser activation policy and long-utterance behavior are not
fully guaranteed by the Web Speech specification.

**Unresolved:** define supported browsers and a maximum readback chunk size
from measured behavior before claiming uninterrupted long-form playback.

---

# 22. Speakable-content boundary — pipe hygiene

## Reference implementations

- LiveKit Agents:
  [transcription filters](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/transcription/filters.py#L103-L210)
- Pipecat:
  [`MarkdownTextFilter`](https://github.com/pipecat-ai/pipecat/blob/d9a6d55702d9e513e0f2d3a8a23a954b22425b60/src/pipecat/utils/text/markdown_text_filter.py#L23-L158)
- Pipecat:
  [Markdown filter tests](https://github.com/pipecat-ai/pipecat/blob/ac43a70d/tests/test_markdown_text_filter.py)
- LiveKit:
  [built-in streaming TTS transforms](https://docs.livekit.io/agents/multimodality/text/#text-transforms)
- LiveKit:
  [chunk-boundary transcription filter tests](https://github.com/livekit/agents/blob/de1a4ee9/tests/test_transcription_filter.py)

## Mechanism — verified

LiveKit filters transcription tokens and suppresses non-speech markers before
publication. Pipecat's stateful filter removes Markdown structures from TTS
text while preserving ordinary language across streaming chunks. Both derive
a presentation form from structured source content; they do not rewrite the
underlying conversational record.

Both projects make the filter stateful because Markdown delimiters and code
fences cross stream chunks. Pipecat tracks whether it is inside a code block
and resets that state on interruption. LiveKit tests its Markdown transform
with chunk sizes down to one character and applies Markdown/emoji transforms
before TTS by default.

Typed execution events remain a separate concern. A text sanitizer cannot
reliably infer whether “running npm test” is assistant prose, a tool event, or
quoted user content.

## Failure handling and integration boundary — verified

- Classify vendor events before concatenating text. Once event types are
  flattened, tool/thought provenance cannot be recovered safely.
- Unknown event types are retained as diagnostics and default non-speakable.
- Keep the canonical body unchanged; derive TTS text as a projection so
  filtering bugs never corrupt the tape.
- Carry filter state across deltas and reset it at turn end, interruption, or
  error. A stateless regex per delta mishandles split fences/emphasis.
- Bound buffered incomplete markup. A never-closed fence must not retain an
  unbounded stream.
- Sanitization should remove presentation syntax while preserving ordinary
  language; product rules—not Markdown parsing—decide whether code/tables are
  omitted or summarized.

## Options and trade-offs

| Boundary | Advantage | Cost |
|---|---|---|
| Vendor event-type allowlist | Deterministic and cheap | Adapter maintenance |
| Text cleanup after storage | Preserves truth and supports replay | Needs a small streaming parser |
| Model-based “should speak?” classifier | Flexible | Cost, delay, nondeterminism, hidden judgment |
| Speak every stream item | Minimal code | Reads tools, reasoning, and protocol noise |

## Recommendation for Travis — inference

Use two deterministic stages:

1. classify ingress by vendor event type into product post, terminal status,
   artifact, or diagnostic;
2. derive speakable text from the stored product post.

Unknown event types default to Stream/non-speakable. Never mutate the stored
body to suit TTS, and do not add model-based triage in v1.

Reuse a tested streaming transform if Travis's current sanitizer grows beyond
its small grammar. Do not import an entire voice pipeline: LiveKit's transform
contract or Pipecat's tests can be adapted as fixtures for a thin local
filter.

**Unresolved:** whether user-requested code should be read verbatim, skipped,
or announced (“code block”) is product speech policy, not a parser default.

---

# 23. Focused secondary surfaces — doors

## Reference implementations

- Radix:
  [Dialog behavior](https://www.radix-ui.com/primitives/docs/components/dialog)
  and
  [implementation](https://github.com/radix-ui/primitives/blob/1e3759dff0504268072fb94656b118fa6e531408/packages/react/dialog/src/dialog.tsx)
- shadcn/ui:
  [Sheet implementation](https://github.com/shadcn-ui/ui/blob/c257f688cf4de7ec10cc1be84cad29cd4631182c/apps/v4/registry/new-york-v4/ui/sheet.tsx)
- Ant Design:
  [Drawer](https://ant-design.antgroup.com/components/drawer)
- Ant Design:
  [Drawer focus, lifecycle, and container tests](https://github.com/ant-design/ant-design/blob/d0544db7/components/drawer/__tests__/Drawer.test.tsx)
  and
  [event tests](https://github.com/ant-design/ant-design/blob/d0544db7/components/drawer/__tests__/DrawerEvent.test.tsx)

## Mechanism — verified

Radix Dialog portals content, traps focus in modal mode, closes on Escape,
restores focus, and exposes controlled state. shadcn Sheet composes those
primitives into edge-mounted content. Ant Drawer provides portal rendering,
keyboard close, focus management, masks, and controlled open state.

These libraries solve overlay mechanics. They do not decide which product
object is selected or which door should be open.

Ant's current Drawer contract is more specific than “it handles focus”:

- Escape closes by default through `keyboard`;
- trigger focus restoration defaults on;
- focus trapping is configurable and the cited v6 tests show `trap: false`
  unless enabled;
- `destroyOnHidden` controls whether closed content retains local state;
- nested drawers push their parent by default unless `push={false}`;
- `getContainer={false}` renders in place and requires appropriate root
  positioning; the default body portal avoids clipping.

## Failure handling and integration boundary — verified

- Enable `focusable={{ trap: true, focusTriggerAfterClose: true }}` for a
  modal door; do not assume the installed default traps focus.
- Keep the opener mounted or supply deterministic fallback focus. Focus
  restoration cannot target a node removed while the door was open.
- Decide `destroyOnHidden` from state ownership. Persisted selection may
  survive unmount; drafts owned only by the door will not.
- Disable nested push when two overlays should not physically displace each
  other, or preferably prevent contradictory doors from opening together.
- Keep body portals for clipped panes. In-place rendering is an explicit
  layout decision, not a clipping fix.
- Escape, mask click, header close, route change, and browser Back must call
  one close transition so local selection cannot remain stale.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Product state + installed Ant overlays | Existing dependency; accessible mechanics | Small adapter/orchestration layer |
| Add Radix/shadcn | Strong composable primitives | Duplicate overlay stack |
| Hand-built fixed overlays | Total control | Focus, Escape, portal, and restoration bugs |
| Route every secondary view | Deep links | Heavy navigation for transient work |

## Recommendation for Travis — inference

Keep Travis-owned typed selection and door orchestration. Use the
already-installed Ant Drawer/Modal for portal, Escape, configurable focus
trap, and restoration. Set the accessibility options explicitly. Do not add
Radix solely for doors.

Converge `door`, `artifactsOpen`, and `openStreamId` toward one typed selection
model so mutually exclusive surfaces cannot drift into contradictory states.

Use route/query state only for doors that must survive reload or support Back
and deep links. Transient controls remain local. Do not route every popover.

**Unresolved:** identify which doors are modal, which are navigable, and which
must preserve drafts before standardizing one close/unmount policy.

---

# 24. Semantic visual contract — themes

## Reference implementations

- Primer:
  [design primitives](https://github.com/primer/primitives/),
  [token build](https://github.com/primer/primitives/blob/aa7acdc449ccc3de7dd7d6874a5b156ce912e119/scripts/buildTokens.ts),
  and
  [theme configuration](https://github.com/primer/primitives/blob/00ad9f156b4ceedb9fd7f18329632a26e1bdb932/scripts/themes.config.ts)
- Ant Design:
  [theme customization](https://ant.design/docs/react/customize-theme/)
- Ant Design:
  [`ConfigProvider` context limits](https://ant.design/components/config-provider/)
  and
  [`App` context boundary](https://ant.design/components/app/)
- React:
  [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)

## Mechanism — verified

Primer defines semantic primitives, compiles source tokens to platform
outputs, and configures named light/dark themes. Ant applies seed, map, and
alias tokens through `ConfigProvider`, allowing component-level overrides.
Both centralize semantic color decisions rather than branching colors inside
feature components.

Ant's documented integration boundary matters:

- `ConfigProvider` themes flow through descendant React context;
- static `Modal.xxx`, `message.xxx`, and `notification.xxx` create a separate
  React root and do not receive that context;
- hook APIs/context holders or `<App>` inside `ConfigProvider` preserve it;
- Ant CSS-variable mode propagates derived component tokens and avoids
  re-serializing styles on a theme switch.

The browser system theme is an external store. `matchMedia` change events plus
`useSyncExternalStore` provide a stable subscribe/snapshot contract and an
explicit server snapshot for hydration.

## Failure handling and integration boundary — verified

- Resolve one effective mode from explicit choice (`light`/`dark`) or
  `system`; only the latter subscribes to OS changes.
- Supply a deterministic server snapshot and initial HTML attribute to avoid
  hydration mismatch. A later client correction may still flash if server
  preference is unknown.
- Expose product tokens as CSS variables at the app root so body portals and
  non-React styles inherit the same values.
- Use Ant hook/App APIs rather than static overlay methods that escape theme
  context.
- Memoize the mapped Ant theme object; recreating it needlessly causes style
  work.
- Persist the user's *choice*, not merely the current resolved OS mode.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Typed TypeScript token objects | Small and checked with the app | React consumers need explicit access |
| CSS custom properties | Work across portals and plain CSS | Weaker compile-time field checking |
| Token compiler | Multi-platform outputs | Toolchain not justified for one client |
| Ant tokens as product vocabulary | Less adapter code | Product semantics coupled to library names |

## Recommendation for Travis — inference

Keep the custom typed `Tokens` contract and map Travis semantics into Ant,
not the reverse. Expose the same resolved values as CSS custom properties for
portals and non-React consumers. Do not add a token compiler at this scale.

If theme follows the operating system, subscribe to preference changes rather
than sampling only at provider initialization.

Ant v6 already uses CSS variables internally, but those names are library
implementation vocabulary. Keep Travis semantic variables as the stable
product contract and map them into Ant aliases/component tokens.

**Unresolved:** server-rendered system preference cannot be known reliably
without a cookie/client hint. Choose whether no-flash rendering justifies
persisting the resolved preference.

---

# 25. Runtime map of product regions — surface registry

## Reference implementations

- Storybook:
  [runtime instrumenter](https://github.com/storybookjs/storybook/blob/50f59cb5db5deadc56a6894e460e4c144dff3456/code/core/src/instrumenter/instrumenter.ts)
- Testing Library:
  [role-query implementation](https://github.com/testing-library/dom-testing-library/blob/47fe879f572e2cfb2ca1e40d1ebcdffdd34a79eb/src/queries/role.ts)
- React:
  [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)
  and
  [StrictMode cleanup checks](https://react.dev/reference/react/StrictMode)

## Mechanism — verified

Storybook's instrumenter records runtime call metadata and preserves execution
context for inspection. Testing Library discovers the live DOM by semantic
role, accessible name, visibility, and state rather than consulting a static
component inventory. Neither is an exact surface registry, but both verify the
underlying pattern: instrument or query what actually rendered.

React provides the store/subscription primitive this custom registry should
use. `useSyncExternalStore` requires a stable subscribe function, unsubscribe
cleanup, an immutable cached snapshot, and a server snapshot for SSR.
StrictMode deliberately runs setup/cleanup again in development, exposing
registries that increment on mount but fail to decrement on cleanup.

## Failure handling and integration boundary — verified

- Store registrations by mounted instance token, not only semantic ID.
  Pattern rows may intentionally share one semantic ID without overwriting
  each other.
- Registration returns an idempotent unregister function. StrictMode,
  conditional rendering, and error recovery must leave no ghosts.
- Cache immutable snapshots; creating a new tree on every `getSnapshot()` call
  violates the React contract and can loop.
- Use a deterministic empty/server snapshot during SSR and register only after
  mount.
- DOM highlighting queries `data-surface-id` and may match many pattern
  instances. ARIA roles remain for control semantics; they are not a complete
  product-region taxonomy.
- Duplicate semantic IDs are errors only when unrelated definitions disagree
  on label/parent/order—not when one pattern has several mounted instances.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Runtime boundary registration | Live, supports conditional/pattern surfaces | Mount/unmount bookkeeping |
| Closed static surface list | Easy to inspect | Drifts from rendered UI |
| ARIA tree only | Standards-based | Product regions do not always map to interactive roles |
| Storybook instrumentation | Rich dev ecosystem | Excess production dependency for this need |

## Recommendation for Travis — inference

Keep the custom boundary registry. Use ARIA roles and names for interactive
controls and `data-surface-id` for product regions. Make registrations
ephemeral and clean them up on unmount.

In development, warn or throw when unrelated mounted boundaries reuse an ID;
pattern rows should intentionally share one pattern identity. Do not ship
Storybook instrumentation to implement the live map.

Use `useSyncExternalStore` rather than a bespoke React subscription hook. The
registry data structure and product metadata remain small custom code because
neither Storybook nor Testing Library models Travis's functional region tree.

**Unresolved:** whether hidden/off-screen registered regions belong in the
live map needs one explicit visibility rule; mounted is not always visible.

---

# 26. Evidence-bearing defect handoff — Look

## Reference implementations

- Sentry:
  [React user feedback](https://docs.sentry.io/platforms/javascript/guides/react/user-feedback/)
  and
  [`sendFeedback`](https://github.com/getsentry/sentry-javascript/blob/5a0edad5342b15cacfc60e509c530e0f2bf99d7c/packages/feedback/src/core/sendFeedback.ts)
- PostHog:
  [feedback-widget lifecycle implementation](https://github.com/PostHog/posthog-js/pull/1877)
- GitLab:
  [minimal Web IDE handoff](https://gitlab.com/gitlab-org/gitlab/-/blob/master/app/assets/javascripts/ide/init_gitlab_web_ide.js)
- GitHub:
  [create-issue endpoint and errors](https://docs.github.com/en/rest/issues/issues#create-an-issue)
- GitHub:
  [rate-limit response handling](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- GitHub:
  [REST integration best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api)

## Mechanism — verified

Sentry sends user feedback with optional contact details and associates it
with an event when an event ID is supplied. Its feedback integration can
include screenshots and replay context. PostHog's widget lifecycle mounts and
unmounts a survey surface while capturing submitted response data. GitLab's
Web IDE bootstrap demonstrates a thin handoff: serialize the selected project
context and let the destination system own the working session.

These references cover generic feedback and contextual handoff. Travis's
selected-turn evidence and repository workflow are product-specific.

GitHub's create-issue endpoint has no documented idempotency key or
conditional-create contract. An ambiguous timeout can mean “created, response
lost”; blindly retrying can create a duplicate. It can also return `410` when
issues are disabled, `422` for validation or spam controls, and `403`/`429`
for rate limits. Labels, assignees, and other fields may be silently dropped
when the caller lacks permission.

## Failure handling and integration boundary — verified

- Serialize content-creating requests. GitHub recommends avoiding concurrent
  mutations and pausing between mutative requests.
- Honor `Retry-After`; if absent on a secondary limit, wait at least a minute,
  then use bounded exponential backoff. Continuing while limited can ban the
  integration.
- Persist a local submission command before POST and store the returned issue
  number/URL after `201`.
- Put a non-secret stable command marker in the generated body. After an
  ambiguous response, reconcile recent issues for that marker before retrying.
  GitHub does not document search/read-after-write consistency, so this
  reduces but cannot eliminate duplicates.
- Verify the response contains required labels/assignees instead of assuming
  the request applied them.
- Bound and redact evidence before leaving Travis. Never include API keys,
  hidden system prompts, raw environment, or expiring private artifact URLs.
- The issue API accepts Markdown references; it is not a general attachment
  upload API. Durable screenshots need an owned/repository-accessible URL.

## Options and trade-offs

| Destination | Advantage | Cost |
|---|---|---|
| GitHub issue/PR workflow | Existing engineering truth and labels | Requires disciplined context packaging |
| Sentry feedback | Runtime event/replay correlation | Another product and SDK |
| PostHog surveys | Product analytics integration | Poor fit for code-fix lifecycle |
| Internal defect database | Total control | Duplicates engineering workflow |

## Recommendation for Travis — inference

Keep Look as a custom GitHub-backed handoff. Package the selected turns plus
deployment, commit, PR, route/surface identity, and requested labels. Those
are stronger engineering evidence than generic free-form feedback.

Do not add Sentry or PostHog solely for Look. If Sentry is later adopted for
monitoring, attach its event/replay ID to the same GitHub seed. Defer screenshot
annotation until selected transcript and deployment evidence prove
insufficient.

The remaining custom code should only package Travis-specific evidence and
maintain the submission command/issue relationship. Authentication, issue
creation, labels, and retry headers come from GitHub's API/client.

Exactly-once issue creation is impossible across this API boundary: a process
can fail after GitHub creates the issue but before Travis records the `201`.
A durable local command, stable body marker, and reconciliation reduce
duplicates but cannot close that window because GitHub exposes no
idempotency/conditional-create contract. Ambiguous cases require duplicate
tolerance or manual reconciliation.

**Unresolved:** the current research does not establish a durable local Look
submission record or the product-visible handling for an ambiguous result.
That store/control requires SA ascription before implementation.

---

## Consolidated implementation order

The research does not justify 26 new subsystems. It produces one immediate
infrastructure decision and a small set of correctness cuts:

1. Put post-dispatch continuation behind pg-boss, using its Drizzle
   transaction adapter, heartbeat, expiry, retry, and retention rather than
   recreating those mechanisms.
2. Pass every durable command ID to Cursor as `SendOptions.idempotencyKey`,
   but treat its duplicate behavior as unverified; persist exact run IDs and
   represent pre-ID ambiguity as `send_unknown`.
3. Keep `dest_job` as business truth and apply lifecycle changes with
   compare-and-set semantics; queue attempts remain delivery diagnostics.
4. Serialize room sequence allocation in Postgres and enforce
   `UNIQUE(session_id, seq)`.
5. Guarantee realtime recovery through durable sequence replay. Use `LISTEN`
   only where a direct/session connection is viable; otherwise use provider
   realtime or polling as an invalidation hint.
6. Use pg-boss `key_strict_fifo` by binding for specialist work, independently
   of an open SSE response.
7. Serialize LangGraph writers with the same keyed FIFO using room ID, move
   saver setup to deployment, and define whole-thread retention.
8. Make seat readiness explicit after the protocol handoff is confirmed.
9. Use Web Locks for cross-tab microphone exclusion and keep the local
   generation/state machine for intra-tab ownership.
10. Use explicit Ant focus settings, React `useSyncExternalStore`, PostgreSQL
   FTS, and GitHub retry headers where those established APIs already solve
   the generic problem.
11. Keep the remaining constructs local until measurement demonstrates the
   specific scale, quality, or operability failure that a new dependency
   would remove.

That order protects the product's visible guarantees while adding only one
operational primitive, and that primitive reuses Postgres.

## What Travis still needs to build

The remaining custom work is product-specific coordination, not replacement
infrastructure:

| Travis-owned seam | Why an upstream library cannot own it |
|---|---|
| Room/turn/role/job identities and lifecycle | These are Travis product semantics. |
| Mapping one command ID through tape, job, queue, and Cursor send | Libraries each own only one side of the boundary. |
| The exact spoken conductor phrase and routing precedence | These are founder-facing interaction rules. |
| Projection of Cursor events into Log, Stream, artifacts, and speech | Cursor exposes execution events; Travis decides product meaning. |
| Per-room visibility, Hear/Skip meaning, Backlog promotion, and Look evidence | These are authorization and product-policy decisions. |
| Typed door selection, semantic tokens, and surface metadata | Ant/React provide mechanics, not Travis's information architecture. |

Everything else identified in this document should be reused:

- pg-boss for durable process lifetime, retries, leases, and queue retention;
- pg-boss `key_strict_fifo` for per-binding and per-room serialization;
- Cursor SDK/API for agent identity, send-key transport, one-active-run
  enforcement, cancellation, durable known-run replay, and artifact transport;
- LangGraph.js PostgresSaver for graph checkpoints and whole-thread cleanup;
- PostgreSQL transactions, uniqueness, FTS, and durable sequence replay;
- PostgreSQL LISTEN/NOTIFY only when deployment connection semantics support
  a session listener;
- Web Locks and Media/Web Speech APIs for browser resource primitives;
- Ant and React primitives for overlays, theme context, and external-store
  subscription;
- GitHub's API contract for defect destination behavior.

The unresolved items under each construct are decision gates. None should be
silently converted into custom code.
