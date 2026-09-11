# Test spec — 021 Circuit breaker

**Packet:** [`PM-PACKET-021-CIRCUIT-BREAKER.md`](./PM-PACKET-021-CIRCUIT-BREAKER.md)  
**Desk:** GitHub Actions, PR labels, and Vercel preview.  
**Mode:** Architectural and automated lifecycle verification.

Fill **I saw** on each step.

---

## 1. Full-Audit Walks (No Fail-Fast)

**Do:** Simulate or run a walk suite where an early test (e.g. `type-dest`) encounters a failure while later tests (`type-send`, `voice-wrap`) are runnable.

**Expect:**
- All 5 (or cumulative N) tests in `src/runtime/walks/*.spec.ts` execute to completion.
- The full summary table/tape is dumped to the log.
- `runtime-doors` marks check red and records the complete tape.

**I saw:**

---

## 2. Engineer Triage & Circuit Breaker Hold

**Do:** Engineer receives `fail-look` on a walk tape containing both code errors and a platform blocker (e.g. Cursor $2 hard limit).

**Expect:**
- Engineer patches code in `src/`.
- Engineer writes `docs/register/BLOCKER-021-*.md` naming the exact limit and direct dashboard URL.
- Engineer commits **without** the preview green-light tag.
- Vercel does **not** initiate a deployment build.
- PR is labeled `blocker`. Seat wake labels are removed.
- Founder receives blocker email via Resend (`EMERGE_EMAIL`).

**I saw:**

---

## 3. Circuit Breaker Release (Option A)

**Do:**
1. Founder resolves the external blocker (adds spend / sets env var).
2. Founder removes the `blocker` label from the PR.

**Expect:**
- If no handoff labels remain, Action empty-commits the preview green-light tag.
- Vercel builds that commit only.
- Walks run against the unblocked environment.
- With code fixed and platform unblocked, `runtime-doors` paints green.

**I saw:**
