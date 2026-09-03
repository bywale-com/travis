# Hotfix 055 — Existing rooms on the Gmail operator

**Number:** `055` — next engineer hotfix is `056`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: attribute existing rooms to `truthist00@gmail.com`).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 055 — rooms on the Gmail operator`

---

## Why (smoke)

Hotfix 053 backfilled every room onto the **oldest** `travis.operator` row. That row was `wale@apexintro.com`. The inbox the founder signs in with is `truthist00@gmail.com` — a later seed. Login as Gmail showed an empty index while 64 rooms sat on the other operator.

## Cut

1. One-time SQL (already run on the live Travis schema): all 64 `voice_session` rows now have `operator_id` = the Gmail operator. 48 still open.
2. Null-only backfill now prefers the first env-seeded email (`TRAVIS_OPERATOR_EMAIL` / `TEST_EMAIL_TO`), not `created_at`. Does not steal rooms that already have an owner.

## Must-not

- Do not mint a signup or a second identity store.
- Do not key rooms to IP.
- Do not append PM/SA logs.

## Verify

1. Enter via the Gmail magic link → room index lists the existing rooms.
2. Unknown / other allowlisted email does not receive those rooms.
3. A new room created while signed in as Gmail stays on that operator.
