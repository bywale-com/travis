# Hotfix 056 — Seeded inboxes share one room pile

**Number:** `056` — next engineer hotfix is `057`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder signed in and the index was empty; rooms already hung on `truthist00@gmail.com`).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 056 — seeded inboxes share rooms`

---

## Why (smoke)

055 moved all 64 rooms onto the Gmail operator. Production `/api/rooms` returns those 64 when the `travis_op` cookie is the Gmail token, and **0** when the cookie is `wale@apexintro.com` (the first seed). Phone still holding the Apex link looks like “rooms are not on the Gmail account.”

v1 is one person. Two allowlisted inboxes are not two desks.

## Cut

1. Seeded emails (`TRAVIS_OPERATOR_EMAIL` / `TEST_EMAIL_TO`) share one room scope.
2. List / resume / enter / create use that scope. New rooms hang on the preferred inbox (Gmail first).
3. A login that is not on the seed list stays on its own rooms.

## Verify

1. Enter via Gmail link → 64 rooms.
2. Enter via the other seeded inbox → same 64.
3. Unknown email still does not mint and does not see those rooms.
