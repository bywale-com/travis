# Flows and shipping

**Goal:** When appearance alone can’t carry the product promise, document the **crossing of systems** as a flow, then ship that flow — not the whole product at once.

---

## 1. When a flow exists

A **flow** starts at the **flow anchor**: the last How node whose children are all **leaves**.

| Flow anchor holds | Role |
|-------------------|------|
| Question | What the flow must answer end-to-end |
| Clarity | User-visible scope in one sentence |
| Components | UI surfaces involved |
| Criteria | When / conditions |

Leaves under that anchor:

| Leaf field | Role |
|------------|------|
| Question | **Test case** — acceptance boundary in user language |
| Clarity | **Process assumption** — what we believe happens invisibly; the flow must prove it |

Do **not** stuff hops, wires, and payloads into every How node. Those belong on the flow map.

---

## 2. What a flow map is

A repo-native behavioral map (Register-style):

| Layer | Executes? |
|-------|-----------|
| Flow definitions (hops, wires, payloads, conditions) | No |
| Infrastructure / provider nodes on the canvas | No |
| Live handlers + server routes | Yes |

Flows document **what should happen**. Production requires **implementation + deploy + verification**.

---

## 3. Ship one flow at a time

Prefer:

1. One molecular outcome (or one epic slice)  
2. UI for the starting surface registered  
3. How down to a flow anchor  
4. Flow map + production checklist  
5. Implement and ship **that** flow  

Avoid boiling the ocean: full auth + full data model + full campaign engine before any one path works.

---

## 4. Evaluation mindset (Register Manager–style)

When judging a flow ready:

| Finding | Example |
|---------|---------|
| Map gap | Missing error path |
| Drift | UI advances when flow says “only on 200” |
| Impl gap | No transaction boundary where map requires it |
| Viz-only | Wire references a node not on the canvas |

Verdict should be **ready** or **not ready** with a concrete task list — not a hedged “yes but.”

---

## 5. Agent guidance

- Don’t invent services in How nodes above the leaf.  
- Don’t ship UI that pretends a flow is done if leaf assumptions are unproven.  
- When asked “is this production-ready?”, evaluate the **flow**, not the whole product brand.  

---

## Tower reference

- `docs/product/register-manager-prompt.md`  
- `docs/product/systems-register.md`  
- `src/app/register/flows/`
