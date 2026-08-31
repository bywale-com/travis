# Hotfix 025 — Revert the busy guard: a turn must reach the server while a seat is working

**Number:** `025` — next engineer hotfix is `026`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (regression I introduced in 024).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 025 — send during an in-flight run`

---

## Why

024 added one line to `finalizeUtterance`:

```ts
if (finalizingRef.current) return;
```

`finalizingRef` is not short-lived. It is cleared in the `finally` **after `consumeAgentStream` drains the whole reply**. So for the entire duration of any run, every done-phrase was dropped on the client: no send, no queue, no error. Speech kept accumulating into the draft with nowhere to go.

That broke the standing law from **007/009**: you may keep talking while a seat works, and the **server** decides send-or-queue per seat. The client is not allowed to make that call, and a silent swallow is worse than either outcome.

**The addressing complaint is the same bug.** Because turns were swallowed, the draft grew across several intended turns. The blob that eventually sent no longer *started* with "engineer", so `parseCallByName` found no leading seat and the router kept the sticky addressee — PM. Verified against the real router:

| utterance | routes to |
|---|---|
| `engineer look at the queue` | engineer |
| `okay so I'm done engineer can you check the queue now` | (none — stays sticky, i.e. PM) |

## Cut

1. Remove the stream-long guard.
2. `sendingRef` — true only from the gate decision until the POST returns. Stops the same words being gated twice (live gate + settle gate); does not outlive the request.
3. `isDuplicateSend` — suppress identical text re-sent within 2.5s. Different text always goes.

## Must-not

- Do not decide send-vs-queue on the client. That is per-seat server logic.
- Do not mint tables. Do not append PM/SA logs.

## Verify

`npm test` 103/103, `tsc` clean, `next build` clean, lint clean. **Mutation-tested**: restoring a "block while a stream is open" guard fails 3 tests.

Phone smoke is still the founder's — this environment has no mic.

1. Send to Engineer, and while Eng is still working send another to Engineer → it queues on Eng (not silence).
2. While Eng is working, send to SA → it goes straight through.
3. `engineer …` routes to Engineer, not PM.
