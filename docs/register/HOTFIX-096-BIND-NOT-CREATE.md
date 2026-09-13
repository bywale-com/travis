# Hotfix 096 — Bind existing Cursor agents (retire create walk)

**Number:** `096` — next engineer hotfix is `097`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 096 — bind_agent + retire create provisioning walk`  
**Test:** [`HOTFIX-096-BIND-NOT-CREATE-TEST.md`](./HOTFIX-096-BIND-NOT-CREATE-TEST.md)  
**Builds on:** [`HOTFIX-095-CREATE-AGENT-WALK.md`](./HOTFIX-095-CREATE-AGENT-WALK.md) (stream hygiene + create timeout stay; runtime walk no longer calls `POST /v1/agents`).

## Why

Founder workflow: Technical Architect seats are started in Cursor manually. Travis should **bind** existing `bc-…` ids into `agent_binding` and the room — not provision Cloud Agents on every dest or runtime door. The 095 `create-agent` walk red on Cursor create timeout / slot limits ([`BLOCKER-003`](./BLOCKER-003-CURSOR-CREATE-TIMEOUT.md)) — that is founder-ops noise, not a plant miss.

## Cut

1. **`bind_agent` tool** — `cursor_agent_id` + `label`; optional `protocol` + `join`. Inserts or reuses `agent_binding` via `bindAgentBinding` (no HTTP create).
2. **Retire `create-agent.spec.ts`** — replace with `bind-agent.spec.ts` (deterministic; no external Cursor provisioning).
3. **`create_agent`** — remains for rare provision; prefer `bind_agent` in Travis system copy over time. Spin-on-busy dest still uses create today — follow-up packet may route to next idle bound Architect.

## Must-not

- Do not remint 033 living-bind grain. Do not mint tables.
- Runtime doors must not depend on `POST /v1/agents` succeeding.
