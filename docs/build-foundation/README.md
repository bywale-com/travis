# Build Foundation Pack

**Purpose:** Copy this folder into a new product so an agent has the **baseline rudiments** — visual law, surface registry, How Analysis, flows — before you describe the idea and where to start.

**Not:** An autonomous builder. You still bring the idea, the starting surface, and product truth. This pack makes sure those builds stay **referenceable** (named surfaces, themed UI, How trees, flows).

---

## How to start a new project

1. **Copy** this entire folder into the new repo (keep the name `docs/build-foundation/` or place under `docs/`).
2. **Copy** `cursor-rules/*.mdc` into `.cursor/rules/` — rename/adapt paths once the product has tokens and a surface-boundary component.
3. **Fill** `PROJECT-BRIEF.md` (from the template) with: product name, who the user is, core outcome in one paragraph, where you want to start (first UI surface).
4. **Hand the agent:**
   - `PROJECT-BRIEF.md`
   - this `README.md`
   - `00-rudiments.md`
5. Tell the agent: *Build only what the brief asks for next; follow the rudiments for every new surface.*

---

## Pack contents

| File | Job |
|------|-----|
| [`00-rudiments.md`](./00-rudiments.md) | **Instruction manual** — checklist for every new surface |
| [`01-ui-first-and-how.md`](./01-ui-first-and-how.md) | UI → How Analysis → flow → implement |
| [`02-surface-registry.md`](./02-surface-registry.md) | Named UI regions, live map, systems map |
| [`03-visual-system.md`](./03-visual-system.md) | Tokens, icons, type, spacing |
| [`04-flows-and-shipping.md`](./04-flows-and-shipping.md) | Flow anchors, leaves as tests, ship one flow |
| [`05-register-augmented-build.md`](./05-register-augmented-build.md) | **Augmentation** — blocks, strips, versions/changelog, click-through, approve gate, plant, shadcn placement (crystallised via Tally) |
| [`06-parametric-elimination.md`](./06-parametric-elimination.md) | **Craft law** — parametric elimination (prospecting chrome, not placating) |
| [`06-parametric-elimination-applied.md`](./06-parametric-elimination-applied.md) | Worked exemplars + rubric for grading peer/agent UI (Tally applications) |
| [`07-overlay-escape.md`](./07-overlay-escape.md) | **Craft law** — portal floating menus out of overflow clips |
| [`08-outcome-so-that.md`](./08-outcome-so-that.md) | **Craft law** — purpose lattice: capability + so-that, closure back into the lattice |
| [`PROJECT-BRIEF.template.md`](./PROJECT-BRIEF.template.md) | Fill once per product |
| [`cursor-rules/`](./cursor-rules/) | Always-on / scoped rule templates |

**Tower product bridge:** [`docs/product/register-augmented-build-bridge.md`](../product/register-augmented-build-bridge.md) — how to read this aug with Tower’s deep How/flow methodology; stuck-point findings land there.

---

## Three lenses (always)

| Lens | Question |
|------|----------|
| **Live surface map** (Console / docs mode) | What is this UI region called? Where does it live? |
| **How Analysis** | How does the molecular outcome happen (user language first)? |
| **Flows** | What hops/wires prove a flow anchor once appearance is not enough? |

Same product, different lenses. Rudiments keep them in the right order.

---

## Reference implementation

Tower (`Apps/tower`) is the worked example of this pack:

| Portable idea | Tower binding |
|---------------|---------------|
| Surface boundary | `HolonBoundary` + `*Holons.ts` |
| Live surface map | Console (`DocsPanel`) |
| Systems / view map | `/register` + composer |
| How trees | `src/app/register/howAnalysis/` |
| Visual law | `tokens.ts`, Notion + Lucide rules |
| Deep methodology | `docs/product/ui-first-build-methodology.md`, `systems-register.md` |

New products should implement the **ideas**, not paste Tower file paths unchanged.
