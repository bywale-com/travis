# Hotfix 095 — Test sheet

**Hotfix:** [`HOTFIX-095-CREATE-AGENT-WALK.md`](./HOTFIX-095-CREATE-AGENT-WALK.md)  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 095 — create_agent timeout + runtime walk`

## Smoke

1. `npm test` — `cursor-create-timeout.test.ts` and stream close assertions pass.
2. `runtime-doors` on a preview deploy includes `create-agent` walk: tool ok, member on roster, no live Travis stream after create.
3. Lived: ask Travis to create a named person; binding appears and stream card does not hang live.
4. I saw: ________
