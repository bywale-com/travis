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
- GitHub source links are commit-pinned where practical.
- Architecture analogies are identified as analogies; they are not presented
  as implementations of a different problem.

## Executive decision

The compact production posture is:

```text
Postgres remains product truth
    rooms · turns · memberships · jobs · queues · streams · initiatives
        ↓
LISTEN/NOTIFY remains an invalidation signal
        ↓
SSE replays from durable sequence cursors
        ↓
Cursor Cloud Agents remains specialist execution
        ↓
LangGraph PostgresSaver remains Travis-thread memory
```

Most constructs should remain thin, local implementations. The principal
production gap is **durable execution after dispatch**: detached work in a
serverless request does not have a process-lifetime guarantee. If that gap is
addressed, a Postgres-backed worker such as
[Graphile Worker](https://worker.graphile.org/docs) is the smallest coherent
addition. It reuses the existing database and avoids Redis or a Temporal
cluster.

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
| 7 | Dispatch and leave | Move post-file continuation to a Postgres worker. |
| 8 | `dest_job` | Keep as business truth; strengthen idempotency and attempts. |
| 9 | Per-agent queue | Keep Postgres FIFO; drain independently of SSE. |
| 10 | Stream | Keep durable meaningful events; compact low-value detail. |
| 11 | New/change/cancel/talk | Keep a conservative command state machine. |
| 12 | Room tape | Keep Postgres; harden cross-isolate ordering. |
| 13 | Room wire | Keep SSE + LISTEN/NOTIFY; fix subscription startup ordering. |
| 14 | Travis thread | Keep PostgresSaver; add retention and deploy-time setup. |
| 15 | Cursor thread | Keep vendor context but mirror durable product truth. |
| 16 | Artifacts | Keep metadata locally and bytes in Cursor for v1. |
| 17 | Backlog | Keep explicit promotion from conversation. |
| 18 | Requests | Keep Postgres search; add FTS only after measurement. |
| 19 | Hear/Skip | Keep per-turn acknowledgement. |
| 20 | One ear | Keep the local single-owner state machine. |
| 21 | Readback | Keep Realtime + browser TTS; no cloud TTS yet. |
| 22 | Pipe hygiene | Keep typed event allowlists and speech-time sanitization. |
| 23 | Doors | Keep local domain state; use existing Ant overlay primitives. |
| 24 | Themes | Keep typed custom tokens. |
| 25 | Surface registry | Keep the thin custom registry. |
| 26 | Look | Keep GitHub-backed defect capture. |

---

# 1. Persistent conversational workspace — Room

## Reference implementations

- Matrix Synapse:
  [`RoomCreationHandler.create_room()`](https://github.com/element-hq/synapse/blob/26a92c711161be9f9b8c69b33144ba7fe5b31063/synapse/handlers/room.py#L1046-L1330)
- Mattermost:
  [`Channel` durable model](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/public/model/channel.go#L85-L106)
- OpenHands:
  [`ConversationState.create()` and restore](https://github.com/OpenHands/software-agent-sdk/blob/6ae64079cfd30cfe2f01a060c59168a4d650d883/openhands-sdk/openhands/sdk/conversation/state.py#L429-L621)

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

## Mechanism — verified

LiveKit routes typed input and audio through one `AgentSession`. Its React hook
returns one combined state, audio track, and transcription projection.
`TranscriptSynchronizer` paces displayed transcript against actual playout and
can pause, resume, or truncate it when speech is interrupted.

LiveKit transport is not a durable product tape; persistence remains the
application's responsibility.

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

---

# 3. Explicit end-of-turn protocol — conductor phrases

## Reference implementations

- LiveKit:
  [`AgentSession.commit_user_turn()`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/agent_session.py#L1721-L1757)
- Pipecat:
  [`BaseUserTurnStopStrategy`](https://github.com/pipecat-ai/pipecat/blob/d9a6d55702d9e513e0f2d3a8a23a954b22425b60/src/pipecat/turns/user_stop/base_user_turn_stop_strategy.py#L43-L279)
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

Adopting a voice framework solely for this matcher would increase complexity
without improving the product guarantee.

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

## Mechanism — verified

OpenAI models roles as agents configured with instructions, tools, guardrails,
and handoffs. A handoff changes the active agent inside the same SDK run.
AutoGen maintains a participant set and validates deterministic or
model-selected speakers against it.

Neither mechanism supplies Travis's durable dispatch, business job state,
external Cursor identity, or per-agent crash recovery.

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

---

# 5. Dynamic role binding — seat and sit

## Reference implementations

- Kubernetes RBAC:
  [`RoleBinding`, `RoleRef`, and `Subject`](https://github.com/kubernetes/kubernetes/blob/98d0129cf21ce0871637ae36e67b5ff82d3db50d/pkg/apis/rbac/types.go)
- Kubernetes:
  [`ValidateRoleBindingUpdate()`](https://github.com/kubernetes/kubernetes/blob/98d0129cf21ce0871637ae36e67b5ff82d3db50d/pkg/apis/rbac/validation/validation.go#L127-L164)
- OpenAI Agents:
  [`handoff(..., { isEnabled })`](https://github.com/openai/openai-agents-js/blob/9687b544c8c873080e6ff7e7d294c0b353cd9ab6/packages/agents-core/src/handoff.ts#L319-L440)

## Mechanism — verified

Kubernetes is an architecture analogy, not an agent implementation. It
separates a stable role reference from replaceable subjects; role references
are immutable while subjects can change. OpenAI conditionally exposes
handoffs per run and permits resolving a different agent at invocation time,
but that availability is not durable role assignment.

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

---

# 6. Intent-based agent routing — dest

## Reference implementations

- AutoGen:
  [`selector_func`, `candidate_func`, and `select_speaker()`](https://github.com/microsoft/autogen/blob/004749e6b7102c8fd317b9b1499ce5807223c278/python/packages/autogen-agentchat/src/autogen_agentchat/teams/_group_chat/_selector_group_chat.py#L152-L210)
- Rasa:
  [`FallbackClassifier`](https://github.com/RasaHQ/rasa/blob/c4069568b4fe2adb5d5a1e55d17ce8cb9dda27fc/rasa/nlu/classifiers/fallback_classifier.py#L70-L130)
- OpenAI:
  [destination-specific handoff tools](https://openai.github.io/openai-agents-js/guides/handoffs/)

## Mechanism — verified

AutoGen permits deterministic selection before model selection and rejects
invalid participant names. Rasa falls back when intent confidence is low or
the top candidates are too close. OpenAI exposes each enabled destination as a
tool and lets the model choose one.

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

---

# 7. Asynchronous job dispatch — dispatch and leave

## Reference implementations

- Graphile Worker:
  [`makeAddJob()`](https://github.com/graphile/worker/blob/4cda192c5df254392a1dff350e5d73f7d2c18a85/src/helpers.ts#L21-L56)
- Graphile Worker:
  [`batchGetJobs()` using `FOR UPDATE SKIP LOCKED`](https://github.com/graphile/worker/blob/91c950f7370aa2629107df1aa6a44b9f5985a1bd/src/sql/getJobs.ts#L14-L166)
- Graphile Worker:
  [official guarantees](https://worker.graphile.org/docs)
- Temporal TypeScript:
  [`WorkflowClient.start()`](https://github.com/temporalio/sdk-typescript/blob/34a7913e9c9495c43bc63f445a845cc18a5cebd1/packages/client/src/workflow-client.ts)

## Mechanism — verified

Graphile enqueue is a Postgres write, so the request can return after commit.
Workers acquire due jobs with row locks and `SKIP LOCKED`, retry failures with
backoff, and provide **at-least-once**, not exactly-once, execution. Named
queues can serialize work. LISTEN/NOTIFY reduces pickup latency while the
database remains authoritative.

Temporal provides stronger durable workflow replay, timers, and external
updates, but requires a Temporal service, worker fleet, deterministic workflow
code, and another operational system.

## Options and trade-offs

| Approach | Guarantee | Operational cost |
|---|---|---|
| Detached serverless promise | Best effort | Lowest code; no lifetime guarantee |
| Graphile Worker | Durable at-least-once | One worker, existing Postgres |
| BullMQ | Durable queue | Redis plus workers |
| Temporal | Durable workflow history/replay | Highest infrastructure and concepts |

## Recommendation for Travis — inference

Adopt a small Postgres worker when recutting this seam. File `dest_job` and
enqueue a task carrying only `destJobId`, preferably in one transaction. The
worker performs/resumes Cursor dispatch idempotently.

Graphile Worker is the smallest mature fit because Travis already depends on
Postgres. Do not add Redis or Temporal at the current workflow complexity.

---

# 8. Durable work order — `dest_job`

## Reference implementations

- Graphile Worker:
  [tracking jobs in an application-owned schema](https://worker.graphile.org/docs/schema#tracking-jobs)
- Graphile Worker:
  [completed queue rows and job-key caveats](https://worker.graphile.org/docs/job-key#job-key-caveats)
- Temporal:
  [workflow event-history durability](https://docs.temporal.io/workflows)

## Mechanism — verified

Graphile's own queue rows are delivery machinery and successful rows may be
deleted. Its documentation recommends an application-owned shadow/business
record for progress and completed-job history. Temporal instead retains the
complete workflow event history and reconstructs state by replay.

This supports Travis's current separation:

```text
dest_job = product truth
queue task = delivery attempt
```

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Queue row only | Minimal duplication | Completion history disappears |
| Business job + queue task | Stable product semantics | Two related records |
| Temporal workflow | One durable execution/history abstraction | Disproportionate platform |

## Recommendation for Travis — inference

Keep `dest_job` authoritative and strengthen it:

- derive idempotency from a durable command/turn ID, not prompt text;
- validate lifecycle transitions;
- add attempt count and last error;
- represent `cancel_requested_at` separately from terminal cancellation;
- treat heartbeat as liveness evidence, not proof of useful execution;
- let worker tasks contain only the job ID.

---

# 9. Per-agent work queue

## Reference implementations

- Graphile Worker:
  [named queues](https://worker.graphile.org/docs/sql-add-job)
- Graphile Worker:
  [`batchGetJobs()` queue locks and ordering](https://github.com/graphile/worker/blob/91c950f7370aa2629107df1aa6a44b9f5985a1bd/src/sql/getJobs.ts#L43-L166)

## Mechanism — verified

Jobs sharing a Graphile queue name execute serially. Acquisition uses
`FOR UPDATE SKIP LOCKED` and chooses by priority then `run_at`; this is not an
unconditional strict FIFO guarantee. Graphile warns that very high-cardinality
queue names increase cleanup and performance burden.

## Options and trade-offs

| Queue shape | Advantage | Cost |
|---|---|---|
| One Postgres mailbox per binding | Preserves identity and ordering | Wait latency |
| Spin another agent | Low wait | More cost; weaker continuity |
| Redis/RabbitMQ | Mature broker mechanics | New datastore/operations |
| Drain from SSE request | No worker | Progress depends on a connected client |

## Recommendation for Travis — inference

Keep `queued_utterance` and enforce:

- database-assigned per-binding sequence;
- `UNIQUE(binding_id, seq)`;
- one active send per binding using a database lock/constraint;
- head drain triggered by worker completion/recovery, not by an open room wire.

If Graphile is added, binding ID is an acceptable named queue while binding
cardinality remains small.

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

## Mechanism — verified

BullMQ workers persist latest progress and publish lifecycle/progress events.
Consumers can resume from a Redis Stream event ID. The monitoring stream is
approximately trimmed and therefore best-effort; a sufficiently slow consumer
can miss old events.

Travis's persisted `stream_event` rows are stronger than a monitoring-only
event stream when completed episodes must remain inspectable.

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
- allocate sequence in the database;
- notify after commit;
- replay by sequence;
- compact or expire low-value process events;
- keep final specialist output on `voice_turn`.

No BullMQ/Redis adoption is justified.

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

## Mechanism — verified

Temporal distinguishes durable asynchronous Signals, validated/result-bearing
Updates, read-only Queries, cooperative cancellation, and forceful
termination. Duplicate Signals require application idempotency; Updates have
an update identity within their documented scope. Rasa demonstrates the other
important guarantee: ambiguous classification should fall back rather than
act.

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
| `change` | append a follow-up to the same job and binding |
| `cancel` | persist cancel request, call Cursor, reconcile terminal state |
| `talk` | no specialist side effect |

With several open jobs, require a unique seat/token target. Otherwise ask for
clarification or treat it as talk. Never silently choose the newest job.

---

# 12. Append-only conversation log — room tape

## Reference implementations

- EventStoreDB/Kurrent:
  [atomic append and expected revision](https://docs.kurrent.io/clients/tcp/dotnet/21.2/appending)
- Matrix Synapse:
  [`_persist_events_and_state_updates()`](https://github.com/element-hq/synapse/blob/26a92c711161be9f9b8c69b33144ba7fe5b31063/synapse/storage/databases/main/events.py#L309-L438)
- Mattermost:
  [`SqlPostStore.Save()`](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/channels/store/sqlstore/post_store.go#L186-L368)

## Mechanism — verified

EventStoreDB appends atomically and uses expected stream revision for
optimistic concurrency; stable event IDs make retries idempotent under the
documented append contract. Synapse allocates database stream ordering before
transactional persistence. Mattermost shows the pragmatic alternative:
timeline posts can be updated/deleted.

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

---

# 14. Durable orchestration memory — Travis thread

## Reference implementations

- LangGraph:
  [persistence concepts](https://docs.langchain.com/oss/python/langgraph/persistence)
- LangGraph:
  [`PostgresSaver`](https://github.com/langchain-ai/langgraph/blob/0870f5efcec9d486046ae8abce0735aa7d1f3b79/libs/checkpoint-postgres/langgraph/checkpoint/postgres/__init__.py#L45-L390)
- OpenHands:
  [conversation persistence](https://docs.openhands.dev/sdk/guides/convo-persistence)

## Mechanism — verified

LangGraph groups checkpoints by `thread_id`. Each checkpoint captures graph
state at a step, allowing state inspection, replay, fault recovery, and
human-in-the-loop continuation. `PostgresSaver` writes checkpoints and pending
writes transactionally; its schema must be installed with `setup()` before
normal use. OpenHands similarly separates a persisted conversation identity
from the process currently running it.

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

Add a measured retention/pruning policy. Do not add LangGraph Store until
Travis has a specified cross-room memory use.

---

# 15. Durable specialist continuity — Cursor thread

## Reference implementations

- Cursor:
  [TypeScript SDK](https://cursor.com/docs/sdk/typescript)
- Cursor SDK Bridge:
  [streaming and reconnection](https://github.com/cursor/sdk-bridge/blob/35b36b0c/docs/streaming.md)
- OpenHands:
  [conversation persistence](https://docs.openhands.dev/sdk/guides/convo-persistence)

## Mechanism — verified

Cursor's SDK creates persistent cloud agents, exposes agent identity and
status, supports follow-up prompts, and streams run-scoped events. The SDK
Bridge documentation demonstrates preserving the run identity and reconnecting
to its stream. OpenHands provides the same general production pattern:
conversation identity survives the process that initiated a run.

This is distinct from the Travis thread. Cursor owns specialist execution
context; Travis owns the product-visible room, routing, and audit trail.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| New agent for every turn | Isolation | Repeated context and lost continuity |
| Persistent agent + exact run IDs | Efficient follow-ups and precise observation | Must persist two vendor identities |
| Mirror all vendor events | Maximum diagnostics | Noise and vendor coupling |
| Mirror product-relevant results | Compact stable record | Less low-level forensic detail |

## Recommendation for Travis — inference

Persist the exact Cursor agent ID and run ID. Send follow-ups to the same
agent, but observe and harvest the exact run that accepted each prompt. Mirror
the prompt, short terminal outcome, assistant result, and artifact
relationships into Travis.

Treat Cursor context as execution continuity, never as the source of record.
Do not reconstruct ownership by searching for the newest run.

---

# 16. External run outputs — artifacts

## Reference implementations

- Cursor Cloud Agents:
  [artifact endpoint](https://cursor.com/docs/cloud-agent/api/endpoints#artifacts)
- Mattermost:
  [`FileInfoStore.GetForPost()` and related metadata queries](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/channels/store/sqlstore/file_info_store.go#L354-L430)
- Zulip:
  [message attachment relationships](https://github.com/zulip/zulip/blob/e45560dfcfc40c786c689b454ef6f4e7dc0f3eaf/zerver/models/messages.py#L794-L821)

## Mechanism — verified

Cursor exposes artifacts for an agent run through authenticated API
endpoints. Mattermost stores file metadata separately and queries it by post;
Zulip derives which uploads are used by a message. Both mature chat systems
model the relationship between a conversational record and a file rather than
embedding file bytes in the message.

## Options and trade-offs

| Ownership model | Advantage | Cost |
|---|---|---|
| Leave bytes in Cursor | No duplicate storage pipeline | Vendor retention and availability |
| Copy to owned object storage | Independent retention and URLs | Transfer, cleanup, access control |
| Put bytes in Postgres | One backup boundary | Database growth and poor serving path |
| Store only external URLs | Tiny | Expiring links and weak authorization |

## Recommendation for Travis — inference

For v1, keep only relationship metadata locally: room, turn, agent, run,
artifact identity, name, media type, and ordering. Proxy downloads through the
server and mint or retrieve URLs on demand; do not expose vendor credentials.

Leave bytes in Cursor until artifacts become specified durable business
records. At that point, copy finalized artifacts to owned object storage with
an explicit retention policy. Do not store file bytes in Postgres.

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

## Mechanism — verified

Mattermost Todo promotes a chosen post into a separately stored task with its
own state. Discourse Assign applies explicit assignment to an existing topic.
GitHub can convert a selected task-list item into an issue while preserving a
relationship to its source. In each case, ordinary conversation does not
silently become managed work.

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

---

# 18. Retrieval of prior asks — Requests

## Reference implementations

- Matrix Synapse:
  [room-scoped message search](https://github.com/element-hq/synapse/blob/26a92c711161be9f9b8c69b33144ba7fe5b31063/synapse/storage/databases/main/search.py#L431-L708)
- Zulip:
  [search narrow construction](https://github.com/zulip/zulip/blob/e45560dfcfc40c786c689b454ef6f4e7dc0f3eaf/zerver/lib/narrow.py#L673-L751)
- Mattermost:
  [post search API](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/channels/api4/post.go#L1029-L1095)

## Mechanism — verified

Synapse applies room visibility constraints before returning ranked message
matches and supports database-specific full-text paths. Zulip compiles search
terms into server-side query constraints. Mattermost authorizes the user,
parses search terms, and searches posts on the server. The common guarantee is
that search is scoped by access control before results leave the service.

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

---

# 19. Per-turn listening acknowledgement — Hear and Skip

## Reference implementations

- Matrix Synapse:
  [receipt persistence](https://github.com/element-hq/synapse/blob/26a92c711161be9f9b8c69b33144ba7fe5b31063/synapse/storage/databases/main/receipts.py#L1050-L1120)
- Zulip:
  [unread-message model](https://github.com/zulip/zulip/blob/e45560dfcfc40c786c689b454ef6f4e7dc0f3eaf/docs/subsystems/unread_messages.md#L1-L70)
- Mattermost:
  [channel membership and read-state queries](https://github.com/mattermost/mattermost/blob/f5227e664f4b37437c8b110912dbf1c71e07c812/server/channels/store/sqlstore/channel_store.go#L2875-L3050)

## Mechanism — verified

Synapse persists receipts and advances them without moving backward. Zulip
tracks unreadness with message-level sets because topic and mention semantics
cannot be represented by one channel cursor. Mattermost uses channel
membership read state and update timestamps. These are different answers to
the same choice: a compact high-water mark or exact per-message state.

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

## Mechanism — verified

LiveKit models playout as an interruptible handle and clears queued speech
when interrupted. Pipecat propagates interruption frames to stop output.
Browser media tracks release devices through `track.stop()`. Jitsi serializes
mute operations to prevent overlapping async transitions from leaving track
state inconsistent.

The reusable production pattern is explicit ownership plus cancellation of
stale asynchronous acquisition.

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

---

# 21. Spoken playback — readback

## Reference implementations

- LiveKit Agents:
  [`AudioOutput`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/io.py#L143-L329)
  and
  [`TranscriptSynchronizer`](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/transcription/synchronizer.py#L484-L755)
- Pipecat:
  [`TTSService`](https://github.com/pipecat-ai/pipecat/blob/d9a6d55702d9e513e0f2d3a8a23a954b22425b60/src/pipecat/services/tts_service.py#L116-L1660)

## Mechanism — verified

LiveKit's output handle tracks queued duration, played duration, interruption,
and completion; its transcript synchronizer aligns text publication with
actual playout. Pipecat serializes text into TTS frames, aggregates words and
timestamps, and handles interruption and completion signals. Both treat
speech as an ordered playout lifecycle, not a set of independent calls.

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

---

# 22. Speakable-content boundary — pipe hygiene

## Reference implementations

- LiveKit Agents:
  [transcription filters](https://github.com/livekit/agents/blob/01fb91f3e16407db6e2dbb4922014eeff8454b1c/livekit-agents/livekit/agents/voice/transcription/filters.py#L103-L210)
- Pipecat:
  [`MarkdownTextFilter`](https://github.com/pipecat-ai/pipecat/blob/d9a6d55702d9e513e0f2d3a8a23a954b22425b60/src/pipecat/utils/text/markdown_text_filter.py#L23-L158)

## Mechanism — verified

LiveKit filters transcription tokens and suppresses non-speech markers before
publication. Pipecat's stateful filter removes Markdown structures from TTS
text while preserving ordinary language across streaming chunks. Both derive
a presentation form from structured source content; they do not rewrite the
underlying conversational record.

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

## Mechanism — verified

Radix Dialog portals content, traps focus in modal mode, closes on Escape,
restores focus, and exposes controlled state. shadcn Sheet composes those
primitives into edge-mounted content. Ant Drawer provides portal rendering,
keyboard close, focus management, masks, and controlled open state.

These libraries solve overlay mechanics. They do not decide which product
object is selected or which door should be open.

## Options and trade-offs

| Model | Advantage | Cost |
|---|---|---|
| Product state + installed Ant overlays | Existing dependency; accessible mechanics | Small adapter/orchestration layer |
| Add Radix/shadcn | Strong composable primitives | Duplicate overlay stack |
| Hand-built fixed overlays | Total control | Focus, Escape, portal, and restoration bugs |
| Route every secondary view | Deep links | Heavy navigation for transient work |

## Recommendation for Travis — inference

Keep Travis-owned typed selection and door orchestration. Use the
already-installed Ant Drawer/Modal for portal, focus trap, Escape, and focus
restoration. Do not add Radix solely for doors.

Converge `door`, `artifactsOpen`, and `openStreamId` toward one typed selection
model so mutually exclusive surfaces cannot drift into contradictory states.

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

## Mechanism — verified

Primer defines semantic primitives, compiles source tokens to platform
outputs, and configures named light/dark themes. Ant applies seed, map, and
alias tokens through `ConfigProvider`, allowing component-level overrides.
Both centralize semantic color decisions rather than branching colors inside
feature components.

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

---

# 25. Runtime map of product regions — surface registry

## Reference implementations

- Storybook:
  [runtime instrumenter](https://github.com/storybookjs/storybook/blob/50f59cb5db5deadc56a6894e460e4c144dff3456/code/core/src/instrumenter/instrumenter.ts)
- Testing Library:
  [role-query implementation](https://github.com/testing-library/dom-testing-library/blob/47fe879f572e2cfb2ca1e40d1ebcdffdd34a79eb/src/queries/role.ts)

## Mechanism — verified

Storybook's instrumenter records runtime call metadata and preserves execution
context for inspection. Testing Library discovers the live DOM by semantic
role, accessible name, visibility, and state rather than consulting a static
component inventory. Neither is an exact surface registry, but both verify the
underlying pattern: instrument or query what actually rendered.

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

## Mechanism — verified

Sentry sends user feedback with optional contact details and associates it
with an event when an event ID is supplied. Its feedback integration can
include screenshots and replay context. PostHog's widget lifecycle mounts and
unmounts a survey surface while capturing submitted response data. GitLab's
Web IDE bootstrap demonstrates a thin handoff: serialize the selected project
context and let the destination system own the working session.

These references cover generic feedback and contextual handoff. Travis's
selected-turn evidence and repository workflow are product-specific.

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

---

## Consolidated implementation order

The research does not justify 26 new subsystems. It produces one immediate
infrastructure decision and a small set of correctness cuts:

1. Put post-dispatch continuation behind a Postgres-backed worker; Graphile
   Worker is the smallest mature candidate.
2. Strengthen `dest_job` idempotency, attempts, cancellation, and error
   semantics.
3. Serialize room sequence allocation in Postgres and enforce
   `UNIQUE(session_id, seq)`.
4. Establish `LISTEN`, commit it, and only then take the room snapshot.
5. Drain queued work independently of an open SSE response.
6. Make seat readiness explicit after the handoff protocol completes.
7. Move LangGraph checkpoint setup to deployment and define retention.
8. Keep the remaining constructs local until measurement demonstrates the
   specific scale, quality, or operability failure that a new dependency
   would remove.

That order protects the product's visible guarantees while adding only one
operational primitive, and that primitive reuses Postgres.
