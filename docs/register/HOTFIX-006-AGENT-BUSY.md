# Hotfix 006 — Agent busy: retry send, do not post as Eng

**Number:** `006` — next engineer hotfix is `007`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived smoke: Travis log showed `[agent_busy]` as an Eng bubble).  
**When:** 2026-08-27  
**Pocket:** SCP-001 Cursor send port.  
**PR title shape:** `Hotfix 006 — retry agent_busy, don’t post it as Eng`

---

## Why (smoke)

Founder, from Travis, asked whether to **queue on the app side**. Screenshot: user turn (STT still doubling — that’s 005) then Eng bubble `Cursor send failed: [agent_busy] Agent already has an active run`.

**What that error is:** Cursor allows **one active run per durable agent**. Travis Engineer is bound to the same live Cloud Agent this Cursor chat is. `agent.send` refuses a second concurrent run.

**What it is not:** two Travis “I’m done”s racing in the SPA. Room already serializes finalize (`finalizingRef`). A client FIFO would sit until this Engineer run ends — minutes, not a turn.

## Cut

1. Cursor send port: on `agent_busy`, **retry** `resume` + `send` with short backoff (pipe: do not drop this utterance on a brief busy).
2. If still busy: persist **status** + client error line. **Do not** write a speakable `agent_post` (no Eng bubble, no Travis reading the SDK string).

## Must-not

- Do not mint a send-queue table (SA has not ascribed that store).
- Do not invent facilitator copy (“Engineer is still working”).
- Do not `Agent.create` a new agent to dodge busy.
- Do not append PM/SA logs.

## Specified but not this cut

- **Durable queue** until a long-lived Cloud Agent run finishes — needs an SA store + worker. Named; not invented here.
- Binding Travis Engineer to a **different idle** `bc-…` so this chat and Travis are not the same run (Hotfix 003 grain).

## Verify

1. Send while the bound agent is briefly busy → Travis waits, then the post lands (no Eng error bubble).
2. Send while the bound agent stays busy past retries → user turn in the log, footer error, **no** Eng bubble with `[agent_busy]`, Travis does not read the SDK string.
