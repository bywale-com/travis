# UI-first and How Analysis

**Audience:** Anyone authoring outcomes, How trees, or deciding when a flow starts.  
**Related:** [`00-rudiments.md`](./00-rudiments.md) · [`04-flows-and-shipping.md`](./04-flows-and-shipping.md)

---

## 1. The sequence

Build **UI-first**, then **systems-mapped**, then **implemented**.

```text
UI prototype (product truth — what appears)
    →  How Analysis (user-visible decomposition)
    →  Flow at flow anchor (crosses systems — not cosmetic)
    →  Leaf test cases + process assumptions
    →  Implement + ship one flow at a time
```

| Layer | Question | Executes? |
|-------|----------|-----------|
| Running app + live surface map | What does the user see and click? | Yes |
| How Analysis | *How* does the molecular outcome happen — user language first | No |
| Flow map | Hops and wires for a **flow anchor** | No (map only) |
| Live handlers + server | Runtime behavior | Yes |

---

## 2. Molecular outcome

Start with **one honest paragraph** — the core outcome from start to finish. Not a feature list. Not tech. Simple enough to read aloud to the user of the product.

Examples of shape (not product-specific):

> The system automatically detects eligible records and starts a campaign so someone books a meeting.

> A practitioner signs in and lands in their workspace.

That paragraph is the **root** of a How tree.

---

## 3. How Analysis — decomposition rules

### 3.1 First How mirrors the outcome

First child restates the outcome as *How does…?* The **answer** must **not** merely paraphrase — it must structure the next cut into answerable parts.

### 3.2 Cut the parent answer — preserve DNA

Descendant questions are formed by **cutting phrases from the parent answer**, not inventing new concepts.

**DNA rule:** Every child question must trace to a phrase in the parent answer. If you cannot point to the phrase, the question is wrong.

Process terms that never appeared upstream belong in the **leaf answer**, not smuggled into non-leaf questions.

### 3.3 Sibling order

Among siblings, left-to-right on the canvas = **clause order** in the parent answer.

### 3.4 C3 per node

| Field | Role |
|-------|------|
| **Question** | The How? — absent on outcome root |
| **Clarity** | The answer sentence (card display) |
| **Criteria** | **When** + **Conditions** |
| **Components** | UI surfaces; at leaves also runtime, stores, external |

---

## 4. Visibility (strict)

| Layer | Language |
|-------|----------|
| Outcome + every node **before** a true leaf | **User-visible only** (what they’d recognize in the product) |
| **True leaf only** | Process language allowed (stores, APIs, services) |

**Stop** and declare a leaf when the next How would **repeat the parent** or require **invisible language** too early.

Prefer pointing **Components** at registered UI surfaces over naming services until the leaf.

---

## 5. Flow crystallization

When children under a parent become **leaves**, that parent is the **flow anchor**:

- Flow answers the anchor’s question end-to-end  
- Leaves = **test cases** (questions) + **process assumptions** (answers)  
- Hops, wires, payloads belong in the flow — not deep inside every How node  

See [`04-flows-and-shipping.md`](./04-flows-and-shipping.md).

---

## 6. Checklist before adding a How node

1. DNA — exact phrase in parent answer?  
2. Visibility — user-visible until leaf?  
3. Leaf test — would next child repeat or go invisible? → stop  
4. Sibling order matches clause order?  
5. Components point at appearance first?  
6. If children are all leaves — does a flow exist (or need to) at this anchor?  

---

## Tower reference (optional depth)

Full worked Tower examples: `docs/product/ui-first-build-methodology.md`  
How trees in Tower: `src/app/register/howAnalysis/`
