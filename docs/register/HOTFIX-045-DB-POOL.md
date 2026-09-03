# Hotfix 045 — One database client, then let it go idle

**Number:** `045` — next engineer hotfix is `046`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: every action, especially Create room, banners `EMAXCONNSESSION` / pool_size 15).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 045 — database pool`

---

## Why

Neon session-mode allows **15** clients. The app opened **five** per isolate and never set `idle_timeout`, so a frozen Vercel lambda kept its five forever. Three isolates filled the account. Create room then ran seven DDL statements on a store that was already stood up, and the phone could not get a slot.

This box had also left several `next` processes on the same `DATABASE_URL`. Those were killed so the live account could breathe before the deploy.

## Cut

1. `postgresPoolOptions()` — `max: 1`, `idle_timeout: 20`, `connect_timeout: 10`, `max_lifetime: 5m`. `prepare` stays off (Neon pooler).
2. `ensureMembershipStore` runs once per isolate after a clean pass. Create room is an insert, not another CREATE INDEX walk.
3. `.env.example` names the pooled Neon host.

## Must-not

- Do not mint tables. Do not append PM/SA logs.
- Do not print the connection string.

## Verify

`npm test`, `npx tsc --noEmit`. Create room on the phone after deploy — the 15-client banner must not be the default path.
