# Test spec — 022 Smarter loop

**Packet:** [`PM-PACKET-022-SMARTER-LOOP.md`](./PM-PACKET-022-SMARTER-LOOP.md)  
**Process:** [`STATELESS-PR.md`](./STATELESS-PR.md). **Park** on `main` until **Wake:** sa. Walk after plant — not while park.

**Pass (after go)** = (1) reds 1–3 still `fail-look`; (2) 4th current-head idle red adds `outside-look` not `fail-look`; (3) stale SHA still skipped; (4) Live still in both sensors.  
**Miss while park:** `src/` or `ENGINEER-HANDOFF.md` on a get-go PR before Wake sa.  
**Look door regressions are 021, not this sheet.**

---

## Before

Engineer handoff names N = 4 and that Look (021) was not reminted.

**I saw:**

---

## A. Three reds still Engineer

**Do:** Idle PR, current-head `runtime-doors` red three times, `previewing` cleared between.

**Expect:** `fail-look` each time. No `outside-look`.

**I saw:**

---

## B. Fourth red escalates

**Do:** A fourth current-head red, idle.

**Expect:** `outside-look` added. `fail-look` **not** added. Same PR.

**I saw:**

---

## C. Stale SHA skipped

**Do:** A `runtime-doors` run whose deploy SHA is not the PR head.

**Expect:** `previewing` kept. No `fail-look`. No `outside-look`.

**I saw:**

---

## After

**Steps I could not do (human):** SSO.
