# Hotfix 026 — Say what actually failed instead of "Unexpected end of JSON input"

**Number:** `026` — next engineer hotfix is `027`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: Open session shows `Failed to execute 'json' on 'Response': Unexpected end of JSON input`).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 026 — legible API errors`

---

## Why

That banner is the browser complaining about an **empty body**. It says nothing about the cause, and the cause could not reach the client at all:

1. `src/server/db/client.ts` threw **at module load** when `DATABASE_URL` was missing. A module-load throw happens before the handler runs, so no `try/catch` inside the route could ever catch it. Next answered with an empty 500.
2. No route had error handling, so any DB failure was an opaque 500 with no body.
3. Every client call site did `await res.json()` with no guard, turning any non-JSON response into the same useless message.

## Cut

1. **Connect lazily.** The DB builds on first query, not on import, so a missing env var throws *inside* the handler where it can be caught. Side effect: `next build` no longer needs `DATABASE_URL`.
2. **`jsonRoute`** wraps `/api/session` (GET + POST) and `/api/bindings`. Any throw returns `{ error }` as JSON and logs the full error server-side.
3. **`describeServerError`** turns a drizzle "Failed query: select …" dump into `Database error — connect ECONNREFUSED …`. No SQL on a phone banner.
4. **`readJson`** on the client reads the body first and reports the status and a snippet instead of a parser error. Boot resume no longer swallows the reason silently.

## Must-not

- Do not put SQL, params, or connection strings in a client-visible error.
- Do not mint tables. Do not append PM/SA logs.

## Verify

Run end-to-end against a real `next start`, not just unit tests:

| condition | before | after |
|---|---|---|
| no `DATABASE_URL` | empty 500 → "Unexpected end of JSON input" | `{"error":"DATABASE_URL is not set on this deployment — add it in the Vercel project environment."}` |
| DB unreachable | empty 500 | `{"error":"Database error — connect ECONNREFUSED 127.0.0.1:59999"}` |
| `next build` with no DB env | failed collecting page data | builds |

`npm test` 112/112, `tsc` clean, lint clean.

**This does not fix the session itself.** It makes the failure name its own cause. When the deploy shows the banner again it will say whether the env var is missing or the database is unreachable.
