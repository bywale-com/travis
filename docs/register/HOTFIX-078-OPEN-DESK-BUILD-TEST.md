# Test spec — 078 Open desk build

**Hotfix:** [`HOTFIX-078-OPEN-DESK-BUILD.md`](./HOTFIX-078-OPEN-DESK-BUILD.md)

### 1. Build

**Do:** `npx next build`

**Expect:** Compiles. No `ProcessEnv` error on `isOpenDesk`.

**I saw:** Local build passed 2026-09-06.

### 2. psi

**Do:** Private window, `https://travis-psi.vercel.app`, no cookie.

**Expect:** Not the login door after this deploy.

**I saw:**
