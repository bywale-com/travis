# Hotfix 054 — Magic link mail truth + logs

**Number:** `054` — next engineer hotfix is `055`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder saw “Check your email” but no mail arrived).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 054 — magic link mail`

---

## Why (smoke)

Hotfix 053 always returned `{ ok: true }` from `POST /api/operator/link` even when:

1. The email was **not** on `TRAVIS_OPERATOR_EMAIL` (silent no-op).
2. `RESEND_API_KEY` was missing on Vercel.
3. Resend rejected the send (unverified From domain, etc.).

The login door said “sent” in all three cases.

## Cut

1. Structured server logs: `[travis] operator link: no match | sent | send failed` with `***@domain` (no full address).
2. Resend success/failure logs include `from`, `toDomain`, and Resend id or error body.
3. When the email **is** allowlisted but mail fails → `503` + honest error to the client.
4. Unknown email still gets the same quiet `{ ok: true }` (no allowlist leak).
5. Login copy matches: “If that email is on the allowlist, check your inbox…”

## Production checklist (Vercel → travis-psi)

| Env | Required |
|-----|----------|
| `TRAVIS_OPERATOR_EMAIL` | Founder’s exact email (comma list ok) |
| `RESEND_API_KEY` | Same key Tower uses, if shared |
| `TRAVIS_FROM_EMAIL` or `MAIL_ROOT_DOMAIN` | Verified Resend domain (default `noreply@mail.try-tower.com`) |

After deploy, trigger a link request and read Vercel **Runtime Logs** for `[travis] operator`.

## Verify

1. Unknown email → `{ ok: true }`, log `no match`.
2. Allowlisted + Resend wired → mail arrives, log `sent`.
3. Allowlisted + missing key → `503`, log `send failed` / `RESEND_API_KEY missing`.
