# Hotfix 052 — Initiative store on first send

**Number:** `052` — next engineer hotfix is `053`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: Type dest Travis, “Hey”, room `0e8875f8` — insert into `voice_turn` named `initiative_id` and the live DB did not have it).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 052 — initiative store`

---

## Why

SCP-008 pasted the Drizzle column. Production deploy did not run `db:push`. Every send now lists `initiative_id`. Postgres refused. The phone showed the failed query.

## Cut

`ensureInitiativeStore` — isolate-once, same shape as 045 membership. Creates `travis.initiative` and adds `initiative_id` on `voice_turn` and `queued_utterance` (`IF NOT EXISTS`). Called from `insertTurn` (every send) and from Hold / list / read / done.

No backfill. Requests unchanged.

## Must-not

- Do not mint another table.
- Do not recut Requests.
- Do not append PM/SA logs.

## Verify

Type dest Travis, send a short line. It lands. No `initiative_id` banner. A second send does not re-run the DDL walk.
