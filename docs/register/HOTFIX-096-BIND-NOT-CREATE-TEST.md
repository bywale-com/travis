# Hotfix 096 — Test sheet

**Hotfix:** [`HOTFIX-096-BIND-NOT-CREATE.md`](./HOTFIX-096-BIND-NOT-CREATE.md)  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 096 — bind_agent + retire create provisioning walk`

## Smoke

1. `npm test` — `bind_agent` in tool policy / boundary counts.
2. `runtime-doors` includes `bind-agent` walk: tool ok, member on roster, no live Travis stream; **no** `POST /v1/agents` in this beat.
3. Lived: founder starts a Cursor cloud chat; Travis `bind_agent` with that `bc-…` and label; member appears without “Creating…” hang.
4. I saw: ________
