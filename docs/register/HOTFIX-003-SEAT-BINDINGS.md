# Hotfix 003 — Bind PM / SA / Engineer cloud agents

**Number:** `003` — next engineer hotfix is `004`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (operator asked to hang three existing cloud chats on the room seats).  
**When:** 2026-08-27  
**Pocket:** SCP-002 `agent_binding` rows already exist; SA and Engineer ids were empty.  
**PR title shape:** `Hotfix 003 — bind PM, SA, Engineer cloud agents`

---

## Why (smoke)

Founder spun three Cursor cloud chats and wants them in Travis as the three seats. Query of current agents (this environment):

| Seat | Chat title | `cursor_agent_id` |
|------|------------|-------------------|
| Engineer | Repository exploration (this chat) | `bc-94804572-3a2f-4075-b290-a95c73730bd3` |
| PM | Pm ID provision | `bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea` |
| SA | Sa id details | `bc-0a1fb1c1-bbea-4d31-a370-6917c235b9c8` |

These are **table data**, not SPA constants.

---

## Cut

1. Server env → `agent_binding.cursor_agent_id` for all three seats (`SEED_CURSOR_AGENT_ID_PM` / `_SA` / `_ENGINEER`; `SEED_CURSOR_AGENT_ID` still aliases PM).
2. `ensureSeatBindings()` on `npm run db:seed` and on **Open session**, so a Vercel deploy with env set writes the rows without a separate seed job.
3. Do not put `bc-…` literals in client or compiled UI source.

## Must-not

- Do not mint a Travis-as-Cursor-agent row.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
- Do not ship ids to the phone client.

## Verify

1. Set the three env vars on the server that holds `DATABASE_URL`.
2. Open session → PM binding’s `cursor_agent_id` is the Pm ID provision agent.
3. Speak `engineer … I'm done` → run targets this Engineer agent (not stand-in).
4. Speak `SA … I'm done` → run targets Sa id details.
5. SPA source still has no `bc-` literals.

## Out of scope

- Who Travis-the-reader is as a Cursor worker.
- Binding picker UI (still named silence).
