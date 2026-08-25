# Two-column synthesis

**Parent doctrine:** [`../sme/DOCTRINE-sme-cto-implementation.md`](../sme/DOCTRINE-sme-cto-implementation.md) §9  
**Layer:** Method / PM–CTO join  
**Job:** How practice (PM) and capability (CTO) columns meet without collapsing into one mushy backlog.

---

## The flow

```
Seed → World
        │
        ├──── machine: Systems Story → Systems Requirements ──→ CTO wires the machine
        │
        └──── faces: Personas & Function (controls + panes) ──→ bind extrusions to required states
        │
        ▼
   SME handoff  ──────────────┬───────────────────────────┐
        │                     │                           │
   (practice axis)      (capability axis)                 │
   Engagement Manager     Systems Analyst → CTO (tech EM) │
        │                     │                           │
   practice SMEs         capability SMEs                  │
        │                     │                           │
        ▼                     ▼                           │
   PM Functional Design   CTO Think Stack (facets)        │
   (surface intent)       Requirements → Can'ts → Furnish │
   — things with a face   — the machine (no face required)│
        │                     │                           │
        └────── reconcile cross-cuts (Handoff) ───────────┘
                              │
                              ▼
                     CT Plant → build
```

**Systems Analyst** owns the **machine track**: [`../register/SYSTEMS-STORY.md`](../register/SYSTEMS-STORY.md) → [`../register/SYSTEMS-REQUIREMENTS.md`](../register/SYSTEMS-REQUIREMENTS.md). Faces are parallel; they do not invent the machine.
---

## Two columns, one handoff

| Column | Owns | Typical artifacts |
|---|---|---|
| **Practice (PM)** | Things with a face | Surfaces, desks, flows, UX, operator truth |
| **Capability (CTO)** | Things without a face | Events, state, Wiring, Can’ts, Furnish |

They are **different lattices**. Synthesis is join by shared events / outcomes / [Handoff tags](../sme/HANDOFF-ROUTING.md) — not by forcing one roster into the other’s shape.

**The crossing.** Capability items that reveal a surface cross into the PM column for [view/initiation intent](../sme/SURFACE-INTENT.md); their mechanism stays in the CTO column for Wiring.

**Reordering.** Because capability is additive (doctrine §3), the CTO column can run **early / in parallel** — Wiring need not wait behind Furnish. Event/state tracing ([`../wiring/WIRING-METHOD.md`](../wiring/WIRING-METHOD.md)) keeps Wiring design-invariant.

---

## Three-layer shape (they mirror)

| Layer | Practice column | Technical column |
|---|---|---|
| Router | Engagement Manager | CTO (technical EM) |
| Specialists | practice SMEs | capability SMEs |
| Builder | PM functional design | Wiring (Think Stack) |

The old model collapsed the technical column into undifferentiated "CTO = identifies + does," which is why capability got lost (doctrine §2). Unfolding router → specialists → builder is the correction.

---

## Working rules

1. **Handoff first** — `pm` practice-led; `cto` tech-led; `both` needs an explicit join (shared node or outcome), not vibes.
2. **Don’t invent UI for CTO-only** — capability may complete with zero Register surface.
3. **Don’t invent Wiring fiction for PM-only** — practice UX without a named event/state path is theater until Wired.
4. **Capability adds** — technical truth can land without Design lock when design-invariant.
5. **Catch-alls** — when join fails, escalate via [`DECISION-CONSTITUTION.md`](./DECISION-CONSTITUTION.md); don’t silently pick a column.

**Tower product north star** (outside habitat: ad → phone → inbox) is what both columns eventually serve — not a substitute for either lattice.
