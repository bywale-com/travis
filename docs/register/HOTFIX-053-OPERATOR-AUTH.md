# Hotfix 053 — Operator email link, not IP

**Number:** `053` — next engineer hotfix is `054`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: IP as account is stupid; Tower-style allowlisted email; a personal login link; the login page only resends that same link).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 053 — operator email link`

---

## Why (smoke)

`GET /api/rooms` keys the index to `client_ip`. Phones hop. Forty-five live rooms have an empty IP. The desk says “No rooms yet” while the rooms sit in Postgres. 014 said IP was a stand-in. This cut retires it.

## Cut

1. `travis.operator` — email that already has an account. No signup. No password.
2. Durable `login_token` on that row. `/enter/:token` is the personal way in. Resend emails **the same** URL.
3. HttpOnly cookie after enter. `/` without the cookie is the login door (email → send link).
4. Rooms hang on `voice_session.operator_id`. List / create / enter / send require that operator. `client_ip` stays as telemetry only.
5. Existing rooms backfill onto the first seeded operator (single-operator v1).
6. Seed emails from `TRAVIS_OPERATOR_EMAIL` (comma list). Mail via Resend.

Tower on this Postgres uses `public.users` + `access_links` (consume / expire) and a consultant OTP. Travis does not reuse those tables. The face the founder locked is the durable personal URL, not a one-time code.

## Must-not

- Do not mint a user directory or signup.
- Do not key resume or the index to IP.
- Do not ship the login token, the IP, or `bc-…` to the SPA.
- Do not recut Requests / initiative / membership.
- Do not append PM/SA logs.

## Verify

1. Open Travis with no cookie → login door.
2. Unknown email → same quiet “if that email has an account…” — no new row.
3. Allowlisted email → mail arrives with `/enter/…`. Open it → room index. The same rooms survive a new IP.
4. Lose the mail, request again → **same** link.
5. `/api/rooms` without the cookie is 401.
