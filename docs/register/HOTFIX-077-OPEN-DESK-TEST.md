# Test spec — 077 Open desk

**Hotfix:** [`HOTFIX-077-OPEN-DESK.md`](./HOTFIX-077-OPEN-DESK.md)

Fill **I saw** on this step before the next.

---

## Before you start

**URL (psi when the flag is on production):** `https://travis-psi.vercel.app`  
Private / incognito. No `travis_op` cookie.

---

### 1. Grain

**Do:** Read `isOpenDesk` in `src/lib/operator-auth.ts` and the test in `src/lib/operator-auth.test.ts`.

**Expect:** Off unless `TRAVIS_OPEN_DESK` is `1` / `true` / `yes`. Cookie still wins.

**I saw:**

---

### 2. Local / preview, flag unset

**Do:** Open `/` with no cookie on local or a preview (not psi).

**Expect:** Login door. “Personal access by email — no password.”

**I saw:**

---

### 3. psi — desk

**Do:** Open `https://travis-psi.vercel.app` in a private window. No email.

**Expect:** Not the login door. Character (Mode) then rooms. Room Travis opens. Voice orb + header. View log → Talk|Type + thread.

**I saw:**

---

### 4. Enter still works

**Do:** Open a known `/enter/:token` (founder).

**Expect:** Same desk. Cookie set. Flag did not eat the personal link.

**I saw:**
