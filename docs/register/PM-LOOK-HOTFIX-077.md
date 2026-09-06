# PM look — HOTFIX-077 open desk

**Packet:** HOTFIX-077
**Change packet:** none (hotfix)
**PR:** https://github.com/bywale-com/travis/pull/135
**Preview:** none (this PR’s Vercel deploy Error — `dpl_999sZrNfdDEVNQ6FPyMvKBKA6UZW`)
**Verdict:** Fail

## Look

Lock ([`HOTFIX-077-OPEN-DESK.md`](./HOTFIX-077-OPEN-DESK.md)): no cookie is the preferred seeded operator when the desk is open. Open when `TRAVIS_OPEN_DESK` is `1` / `true` / `yes`, **or** when the flag is unset on Vercel production (psi). Closed when the flag is `0` / `false` / `off` / `no`. Preview and local stay 053 unless the flag is on. `/enter/:token` and the login door stay. A real cookie still wins. No second app. No plate-only host.

Plant (`c8e2389` on [#135](https://github.com/bywale-com/travis/pull/135)):

```89:101:src/lib/operator-auth.ts
/**
 * Open desk for plates / agents. Same rooms as the preferred operator.
 * On when TRAVIS_OPEN_DESK is 1/true/yes, or when unset on Vercel production
 * (psi). Off when the flag is 0/false/off/no. Cookie still wins.
 */
export function isOpenDesk(
  env: { TRAVIS_OPEN_DESK?: string; VERCEL_ENV?: string } = process.env,
): boolean {
  const v = env.TRAVIS_OPEN_DESK?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off" || v === "no") return false;
  if (v === "1" || v === "true" || v === "yes") return true;
  return env.VERCEL_ENV === "production";
}
```

`resolveOperator` still prefers a cookie, then `openDeskOperator`. `/` still paints `TravisApp` vs `LoginDoor` from that row. `/enter/:token` still sets `travis_op`. Grain test `open desk: explicit flag, else Vercel production only` — 9/9 pass under `tsx`. That grain matches the lock.

**It does not ship.** `next build` on this SHA:

`Type error: Type 'ProcessEnv' has no properties in common with type '{ TRAVIS_OPEN_DESK?: string | undefined; VERCEL_ENV?: string | undefined; }.'` at `src/lib/operator-auth.ts:95`.

Vercel Preview for `c8e2389` is Error. Alias `travis-git-cursor-hotfix-077-open-desk-35b2.vercel.app` is `DEPLOYMENT_NOT_FOUND`. GitHub merged #135; production psi is still the **old** desk (login door). I opened `https://travis-psi.vercel.app` phone-UA, no cookie: `login-door`, “Personal access by email — no password.” That is 053, not this cut. Do not treat psi as this plant.

This hotfix names no SQL row. `DATABASE_URL` is set here; I did not query a hang.

## Test

Walked [`HOTFIX-077-OPEN-DESK-TEST.md`](./HOTFIX-077-OPEN-DESK-TEST.md).

**URL I opened:** `https://travis-psi.vercel.app` (not this SHA). This PR has no preview host.
**Device:** this bind (no phone).

### 1. Grain
**I saw:** `isOpenDesk` + the test in `src/lib/operator-auth.test.ts`. Off unless explicit on, or `VERCEL_ENV === "production"`. Cookie still wins in `resolveOperator`. `npx tsx --test src/lib/operator-auth.test.ts` — 9 pass, 0 fail. `next build` still type-errors the default `process.env` argument.

### 2. Flag off
**I saw:** no preview for this PR. Local grain is off when flag and `VERCEL_ENV` are unset. Did not boot a local Next host. Psi is 053 login door because this SHA never reached production.

### 3. Flag on — desk
**I saw:** not this plant. Not Mode. Not rooms. Not Room Travis. Not Voice / Log.

### 4. Enter still works
**I saw:** `src/app/enter/[token]/route.ts` still sets `travis_op` and redirects `/`. I did not open a founder `/enter/…`.

**Steps I could not do (human):** Talk on a phone. Walk Mode → rooms → Room Travis → Voice / Log on a shipped 077 host. Founder’s `/enter/…`. Set `TRAVIS_OPEN_DESK=0` on production. Those are the human’s. I do not fail the look for them.

## Loop

Fail: Engineer must recut `isOpenDesk` so `next build` typechecks (`process.env` as the default). Same PR / same branch. No cousin. No new store. No new face. Do not remint 053 tables. After it builds, preview (flag unset) is the login door; psi (flag unset) is the open desk.
