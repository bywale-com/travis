# Hotfix 072 — Deprecate PM bind; hang the new chat

**Number:** `072` — next engineer hotfix is `073`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Founder: deprecate the existing PM seat and create a new PM.  
**When:** 2026-09-04  
**PR title shape:** `Hotfix 072 — PM rebind`

---

## Why

`bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea` (Pm ID provision) handed off and is **deprecated**. A new durable PM chat exists. Migrate and `bind-seats.sql` still force-wrote the dead id on every deploy, so Travis would keep sending to this chat.

## New bind

| Seat | Chat | `cursor_agent_id` |
|------|------|-------------------|
| **PM (live)** | Product Manager | `bc-e36b1259-1dac-5d2b-9d51-342716f0f021` |
| PM (deprecated) | Pm ID provision | `bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea` |

URL: https://cursor.com/agents/bc-e36b1259-1dac-5d2b-9d51-342716f0f021

Table data, not SPA constants. Same pattern as 003 / 008.

## Cut

- `migrate.ts` operator map: `seat_key = pm` → new id.
- [`bind-seats.sql`](../../src/server/db/bind-seats.sql) — same. Drops leftover `seat_live_run` on the PM row so the next send is not queued on a dead run.
- [`PM-HANDOFF.md`](./PM-HANDOFF.md) — living bind is the new chat.

## Operator

1. Merge / deploy so migrate writes the row, **or** run `bind-seats.sql` on travis-psi Postgres.
2. Vercel `SEED_CURSOR_AGENT_ID_PM` = the new id (fill-blanks only; will not clobber a live row).
3. End session → Open session. Dest PM should resume the new chat.

## Must-not

- Do not put `bc-…` in client / compiled UI source.
- Do not append the PM or SA logs from this cut (new PM stamps their own accept).
- Do not mint a table.
- Do not keep migrate pointed at `bc-1ac0762e`.
