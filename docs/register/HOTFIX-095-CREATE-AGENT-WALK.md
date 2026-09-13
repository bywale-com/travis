# Hotfix 095 — create_agent timeout + runtime walk

**Number:** `095` — next engineer hotfix is `096`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 095 — create_agent timeout + runtime walk`  
**Test:** [`HOTFIX-095-CREATE-AGENT-WALK-TEST.md`](./HOTFIX-095-CREATE-AGENT-WALK-TEST.md)

## Why

Founder `create_agent` on a lived room filed a stream process for `create_agent` but never finished: no binding row, stream stuck `live`, mouth said “Creating H.” Cursor HTTP create had no timeout; `maybeCloseTravisStream` could leave the card open when the tool succeeded without a new speakable post after the trigger.

Runtime doors had no walk for Travis creating a person — only think/dest/voice beats — so red deploys never sensed this door.

## Cut

1. **`createCursorAgent` timeout** — `AbortSignal.timeout(CURSOR_CREATE_TIMEOUT_MS)` (45s) on `POST /v1/agents`; timeout surfaces as a clear error.
2. **`runTravisTool` stream hygiene** — after `maybeCloseTravisStream`, force-close any remaining live Travis stream for that binding (`completed` or `failed`).
3. **Runtime walk `create-agent.spec.ts`** — calls `POST /api/session/:id/live/tool` with `create_agent` (same server path as Deep Agents tools), asserts receipt, roster member, and no `streams.live`.
