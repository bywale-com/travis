# Surface registry

**Goal:** Every meaningful UI region has a stable identity so it can be named, highlighted, listed, and pointed at from How/flows.

Call the unit a **holon**, **region**, or **surface** — the idea is the same.

---

## 1. Three jobs of “registering”

| Job | Meaning |
|-----|---------|
| **Definition** | Stable `id`, functional `label`, `order`, optional icon |
| **Live wrap** | Real app UI wrapped so the live map can highlight it |
| **Inventory** | Same ids appear in a tree (and, later, on a systems/view canvas) |

Registering is **not** hand-drawing layouts on a map, copying business logic into a docs route, or maintaining a closed union of panel ids by hand.

---

## 2. Live surface map (Console-style)

Answers: *What is this region called?* and *Where does it live?*

- Hover/select in the tree → highlight matching UI  
- Eye / focus → reveal (switch tab, open panel) when wired  
- Tree updates from **runtime registration**, not a hand-edited panel list  

**Rule:** New feature UI that consultants/users will talk about gets a boundary. Prefer co-located `*Holons.ts`-style config that drives both labels and tree children.

### Pattern surfaces (repeating rows)

One id, many instances (list rows):

1. Register the **pattern** once (often `registerOnly` / off-screen aware).  
2. Live rows opt into highlight for that pattern id.  
3. Optional **slots** inside the row (name, status, actions) get their own sibling ids.

---

## 3. Systems / view map (Register-style)

Answers: how named surfaces assemble into **views** (scenes) on a zoomable canvas — still cosmetic until flows.

Typical five steps (adapt paths per product):

| Step | What |
|------|------|
| 1 | Holon / surface definition constants |
| 2 | Wrap live UI in the boundary component |
| 3 | Catalog entry so the tree exists when the app route isn’t mounted |
| 4 | View metadata (`views`, `parentId`, render key) |
| 5 | Cosmetic surface renderer for the canvas |

Target over time: fewer files — derive catalog/meta from definitions.

---

## 4. Do / Don’t

**Do**

- Functional labels (roles, not component filenames)  
- Children declared at the parent that owns structure  
- `parentId` when tree parent ≠ DOM parent  
- One boundary wrapper per documented region  

**Don’t**

- Static `panelsRegistry` / closed `DocsComponentId` unions as the long-term source of truth  
- Hand-maintain the live tree component by component  
- Duplicate ids across unrelated surfaces  

---

## 5. Relationship to How and flows

| Artifact | Points at |
|----------|-----------|
| How **Components** (pre-leaf) | Registered UI surfaces |
| Flow steps | Real handlers + services (ids may reference surfaces for context) |

If a How node can’t point at a surface, either the surface isn’t registered yet or you’ve slipped into process language too early.

---

## Tower reference

- Cursor rule: `.cursor/rules/tower-holon-registry.mdc`  
- Workflow: `docs/product/systems-register.md`  
- State: `docs/product/console-state.md`  
- Component: `HolonBoundary`
