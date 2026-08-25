# Decision constitution — bottlenecks hide in catch-all buckets

**Parent doctrine:** [`../sme/DOCTRINE-sme-cto-implementation.md`](../sme/DOCTRINE-sme-cto-implementation.md) §8  
**Scope:** Om Coda operating constraint — portable across products, not Tower-only  
**Status:** Standing method

---

## Principle

Any category that looks like a decision but is really an un-examined deferral is where work and bottlenecks disappear.

> **"The CTO handles it"** and **"let the founder review it"** are the *same failure* at different layers.

The fix is identical: name the classes explicitly, and let no bucket be the place where un-adjudicated work goes to vanish.

---

## Origin

Two instances converged in the same Tower conversation:

1. **Capability vanishing into the CTO sink** — deliverability filed as "just wiring," never becoming a consideration ([doctrine §2](../sme/DOCTRINE-sme-cto-implementation.md)).
2. **Founder throughput becoming the company's bottleneck** — progress waiting on presence rather than on named decisions.

Both dissolve the same way — by enumerating decision/work classes ahead of time so the default is autonomous and only *named* classes interrupt a human.

---

## Mechanics

For every catch-all ("CTO handles it," "founder reviews it," "TBD later"), demand the split:

1. What specifically is in here?  
2. Which items need a **named owner / named gate** vs proceed on method?

**Working example — Register fail-closed markers:**

- `NEEDS VERIFICATION`
- `BLOCKED (counsel)`
- Persona / World seat changes need room sign-off

The pass proceeds autonomously and stops only at named gates.

**Applied to the founder:** path to *progress depending on decisions, not presence* — a small, pre-enumerated founder-only decision class; everything else method-adjudicated. Portable across every Om Coda product from inception.

---

## Suggested founder-only class (seed — product may refine)

Keep this list short; expand only with room sign-off:

- World / persona seat minting or retirement  
- Hard-stop / never-invent doctrine changes  
- Money-door / escrow release unit changes that alter the commercial bet  
- Geography / regulatory regime expansion that reopens SME seats  
- Explicit `BLOCKED (counsel)` adjudication

Everything else: method + specialist + builder columns.

---

## Cross-links

- [`../sme/DOCTRINE-sme-cto-implementation.md`](../sme/DOCTRINE-sme-cto-implementation.md) §2 (CTO sink), §9 (two columns)
- [`../sme/METHODOLOGY.md`](../sme/METHODOLOGY.md) — fail-closed SME gates
- [`../wiring/CTO-THINK-STACK.md`](../wiring/CTO-THINK-STACK.md) — technical column must not re-create the sink
