# Outcome so-that — the purpose lattice

**Thesis:** A capability without a **so that** is a feature list, not an outcome. Every Core outcome must state who benefits next — and that chain must close back into the lattice, not dangle into a new, invented entity.

**Name:** Outcome so-that — the closure law for Register outcomes.  
**Symptom:** A Core statement reads as a bare capability list (“I can create, evaluate, enrich…”) with no clause saying why it matters to anyone else. Or a so-that invents a party that isn't already an entity in the lattice.  
**Cure:** Append `— so that <next entity> can <next capability>`, and check the chain closes.

Companion: [`docs/register/OUTCOMES-TREE.md`](../register/OUTCOMES-TREE.md) — worked V1 so-that spine.

---

## 1. Every outcome needs capability + so-that

A Core outcome statement has two clauses:

1. **Capability** — “As a `<entity>`, I can `<verb, verb, verb>`…”
2. **So-that** — “…so that `<next entity>` can `<next capability>`.”

Non-Core (secondary) outcomes may skip the so-that when the benefit is local and obvious (e.g. “Access the platform”), but the **Core** outcome per entity always carries one.

---

## 2. Core outcomes must so-that to the next entity — or close the loop

The so-that clause names **who is already in the lattice** — the next entity in the funnel — and what they can now do because this capability exists.

```text
Operator core        → so that a client can join/fund it and a Worker can pick it up
Non-business core     → so that a Worker can begin and manage the campaign I funded
Business Client core  → so that a Worker can begin and manage the campaign
Worker core            → so that business clients are notified of progress   ← closes the loop
```

The last hop does not introduce a new party — it lands back on an entity **already named upstream** (Business Client). That's what makes it a lattice, not a chain that trails off into "the system" or "the database."

---

## 3. Closure test

Ask: **does the last so-that land on someone already in the lattice?**

- ✅ Worker's so-that → Business Client (already Entity 3). Closed.
- ❌ Worker's so-that → "the reporting dashboard updates." Dangling — a dashboard is not an entity with its own outcome statement.
- ❌ Operator's so-that → "the system logs the event." Process language, not a person/role benefit.

If the chain doesn't close, either the so-that is process language (push it down to a leaf, not the Core statement) or a real entity is missing from the lattice (add it, as Worker was added here).

---

## 4. How Analysis is also What, when DNA expands verbs in product context

The Core **capability** clause (create, evaluate, enrich…) is already the answer to "what does this entity do." When the How tree decomposes those verbs, each child question still traces back to a phrase in the parent (DNA) — but because the parent phrase is itself a **product verb** (e.g. "enrich"), the first How cut often *is* still describing **what** enrich means in this product (build a firm/TAM list), before any process language appears.

In other words: the outcome's capability list is the top of the How tree, and the so-that is what tells you *why that tree is worth climbing* — it is not a separate decoration bolted onto the end.

---

## Agent checklist

1. Does the Core outcome statement have a **so-that** clause?
2. Does the so-that name an entity **already in the lattice** (or a brand-new entity you are deliberately adding, with its own registry entry)?
3. Does the chain of so-thats, followed entity to entity, **close** back onto someone already named — not trail into infrastructure/process language?
4. If you added a new entity to close a loop (like Worker here), did you: add its `OutcomeEntityId`, place it in funnel order, give it a Core outcome with its own so-that, and update the funnel comment?
5. Did you leave How graph authorship to whoever owns it, if the task only asked you to wire the registry (`howGraphId` stub is enough)?

---

## Agent handoff line (pasteable)

> Follow `docs/build-foundation/08-outcome-so-that.md`. Every Core outcome statement needs a capability clause and a `— so that <next entity> can <next capability>` clause. The so-that must name an entity already in the lattice (or a new entity you're deliberately registering) and the full chain of so-thats must close back into the lattice, not dangle into process/infra language. See `docs/register/OUTCOMES-TREE.md` for the worked V1 so-that spine.
