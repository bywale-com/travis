# Register-Augmented Build Methodology

**Status:** Augmentation of the Build Foundation Pack (does not replace it)  
**As of:** 2026-07-22  
**Provenance:** Crystallized on Tally Operator Core (Create → Evaluate v2 co-piloted dossier), intended to travel back into Tower and any product using this pack.  
**Audience:** You + any agent continuing a product (Tally, Tower, next).  

**Related (read first, then this):**

| Doc | Role |
|-----|------|
| [`00-rudiments.md`](./00-rudiments.md) | Baseline checklist every surface still obeys |
| [`01-ui-first-and-how.md`](./01-ui-first-and-how.md) | UI → How → flow → implement |
| [`02-surface-registry.md`](./02-surface-registry.md) | Named regions / live map |
| [`03-visual-system.md`](./03-visual-system.md) | Tokens, icons, type — **dark mode from day one** |
| [`04-flows-and-shipping.md`](./04-flows-and-shipping.md) | Flow anchors, ship one flow |
| Tower deep cut | `docs/product/ui-first-build-methodology.md` (worked example) |

---

## 0. Why this augmentation exists

The original pack got **truth, naming, theme, How DNA, and shipping** right.

What Tally forced into the open:

1. **Serious UI identity changes are not “prototype tweaks.”** Honoring a gray lo-fi strip as if it were product look burned a full plant. The strip is a *positional* prune tool — not the final surface language.
2. **Register needs generations.** When Evaluate went from “short verdict emulation” → “co-piloted dossier,” we needed **v1 kept, v2 current, why written down**, not overwrite.
3. **Block → strip → click-through → approve → plant** is the only progression that stays cheap and reversible for large adjustments.
4. **shadcn lands after prune**, on the future-home shell — not inside gray Register lo-fi.
5. **Dark mode + tokens are law from the first plant**, not a polish pass.

This doc is the hyper-detailed operating system for that progression. It **augments** the sequence in `01` / Tower’s methodology; it does not delete DNA, visibility, or flow-anchor rules.

---

## 1. Lineage: Tower ↔ pack ↔ Tally

```text
Tower (Apps/tower)
  └── worked example of UI-first + How + Register flows + Console/Holons
        │
        ▼
docs/build-foundation/   ← portable pack extracted from Tower practice
        │
        ├── copied into Tally
        │     └── Tally discovered: strips · versions · block-first ·
        │         click-through prune · approve gate · /prototype plant ·
        │         shadcn after prune · co-pilot surface patterns
        │
        └── THIS FILE travels back into Tower (and forward into new products)
```

| Idea | Tower binding (example) | Tally binding (example) |
|------|-------------------------|-------------------------|
| Surface boundary | `HolonBoundary` | same |
| Live map | Console / DocsPanel | same |
| How trees | `src/app/register/howAnalysis/` | same pattern under Operator Core |
| Visual law | `tokens.ts` + dark toggle | same; purple accent; **toggle on `/prototype` from day one** |
| Deep How/flow prose | `docs/product/ui-first-build-methodology.md` | pack `01` + `04` |
| **Strips + versions** | *(adopt via this aug)* | `wireframesRegistry.ts` + `/wireframes/...` + CHANGELOG |
| **Block-first click-through** | *(adopt)* | Register Click-through + `/prototype` shell |
| **Approve before plant** | *(adopt)* | Law for serious changes |

**Rule:** New products implement **ideas**, not paste paths. Tower remains the deepest How/flow exemplar; Tally remains the deepest **Register surface-generation** exemplar until Tower absorbs this aug.

---

## 2. The augmented sequence of truth

Original (still true):

```text
Running UI → How Analysis → Flow at flow anchor → Implement + ship
```

**Augmented (Register-complete):**

```text
1. Molecular outcome (one paragraph)
2. Outcomes tree / epic cut (user language)
3. How Analysis (DNA + visibility → flow anchors + leaves)
4. Name the BLOCK (sidebar-07 shape or product equivalent)
5. Lo-fi STRIPS for each choreography beat (positional, gray)
6. CLICK-THROUGH on that block (cheap prune; timers OK)
7. HUMAN APPROVE (prune identity + beats)
8. VERSION + CHANGELOG if this revises a prior strip
9. PLANT on future-home route (/prototype → later /)
     · Tokens + dark mode toggle from first plant
     · HolonBoundary on every meaningful region
     · shadcn primitives for interactive controls
10. When appearance isn’t enough → FLOW map at flow anchor → ship that flow
```

| Step | Executes? | Cost | Failure mode if skipped |
|------|-----------|------|-------------------------|
| 1–3 | No (analysis) | Medium | Build the wrong product |
| 4–6 | Yes (Register lo-fi) | Low | Orphan panels; no nav ownership |
| 7 | Human | — | Plant disposable UI |
| 8 | Registry + docs | Low | Can’t see why we changed |
| 9 | Yes (product shell) | High | Wireframe look shipped as product |
| 10 | Map then yes | High | Cosmetic forever / fake complete |

**Critical distinction:**

| Artifact | Job |
|----------|-----|
| **Strip / click-through** | Positional prune — *what happens where* |
| **`/prototype` plant** | Product look + durable components — *what it is* |
| **How / flow** | Decomposition + systems proof — *why / how it connects* |

Never collapse strip look into plant look without an explicit approve that says “this *is* the product surface.”

---

## 3. Lenses (extended)

| Lens | Question | Primary home |
|------|----------|--------------|
| **Live surface map** | What is this region called? Where does it live? | Console / HolonBoundary |
| **How Analysis** | How does the molecular outcome happen (user language)? | Register How canvas |
| **Outcomes tree** | What epics / anchors exist; what’s in / out? | Outcomes panel + OUTCOMES-TREE docs |
| **Strips** | What screens sit on the block for this beat? | Register Strips (scrub `vN` · step **i** · Changelog) |
| **Click-through** | Does the choreography feel right in the shell? | Register Click-through |
| **Changelog** | What did this beat used to be, and why did we change? | Registry `why` + CHANGELOG-wireframes |
| **Flows** | What hops prove a flow anchor? | Register flows (when ready) |
| **Plant** | Does the durable product shell honor the approved strip *intent*? | `/prototype` → `/` |

Same product, different lenses. Order matters: **How before strip detail**; **strip+click-through before plant**; **flow when cosmetics can’t carry the promise**.

---

## 4. Outcomes tree

- One **molecular outcome** paragraph per epic root.
- Tree shows anchors (Create, Evaluate, Enrich, …) without pretending every leaf is implemented.
- Sales-led / role notes belong on the tree (who does what) so strips don’t invent actors.
- When a strip generation changes **product identity** (Evaluate v1→v2), update the outcomes/How copy so language matches the approved beat (e.g. “verdict summary” → “co-piloted dossier / clear”).

DNA still applies: don’t invent outcome language that never appeared in the parent answer.

---

## 5. How Analysis (unchanged core — placement clarified)

Still mandatory:

- First How mirrors outcome; answer structures the cut  
- **DNA:** child questions cut parent answer phrases  
- Sibling order = clause order  
- **Visibility:** user-visible until true leaf  
- **Flow anchor** = parent whose children are all leaves  
- Leaves = test cases (Q) + process assumptions (A)

**Augmentation:** How nodes can **map to strip ids** (`howNodeIds` on wireframe entries). Prefer **current** strip when both current + archived share the same How ids. How does not replace strips; strips do not replace How.

Process language still does **not** appear above the leaf. “Re-analyze,” “call notes,” “Clear” are **user-visible** Evaluate actions — valid above the leaf. “Model prompt / survivor CSV join” belongs at the leaf / flow.

---

## 6. Block-first (locked)

A flow always starts from a **block**, or from inside a strip that already lives on a block.

| Term | Meaning |
|------|---------|
| **Block** | Chrome you arrive into (sidebar + inset + header). Reference: shadcn **sidebar-07** shape. |
| **Strip** | Screen sequence *inside* that block for one choreography beat |
| **Click-through** | Same block shell; plant a flag; grow strips onto it |

**Flag rule:**

1. Name the starting block.  
2. Plant the click-through flag there.  
3. Inventory strips as screens on that shell.  
4. Next outcome maps onto the **same block** when possible.

Naked “Campaigns panel” without a block hides: *how did they get here?*

---

## 7. Strips (lo-fi wireframes)

### 7.1 What a strip is

- Gray, positional, **cheap**.  
- Served as static assets (e.g. `public/wireframes/.../*.svg`).  
- **Never** under an SPA route prefix that steals `<img>` requests (Tally: not under `/register/`).  
- No brand purple / final component chrome — if you’re picking product purple, you’ve left wireframe mode.

### 7.2 What a strip is not

- Not the durable product look.  
- Not a license to skip How.  
- Not something you overwrite when identity changes — you **version**.

### 7.3 Choreography tags

Strips carry when/where in the human journey (e.g. Disco / Off call / Demo). Stage bars on click-through may jump with dummy seed for QA — that tooling stays Register-only.

---

## 8. Versioning & changelog (law for serious changes)

### 8.1 Registry model (source of truth)

**Strip lineage** (one stage/role) carries `revisions[]`. Optional **step lineages** nest under a **strip revision** (`revision.steps`) — step versions belong to the strip version you are viewing.

| Field | Meaning |
|-------|---------|
| `roleId` / `stepId` | Stable lineage id |
| `revisions[].id` | Stable revision id (e.g. `evaluate-v3`, `enrich-v2-filter-prune-v2`) |
| `version` | Monotonic int for that lineage |
| `status` | `current` \| `archived` |
| `supersedes` | Prior revision `id`, if any |
| `why` | One–two sentences: why **this** revision exists |
| `changedAt` | ISO date |
| `src` | SVG path (strip; also optional on **step** revisions for panel preview swap) |
| `region` | Step only: hotspot % on the strip panel (`left` / `width` / optional `top` / `height`) |
| `surface` | Step only: `strip` \| `click-through` (living surface before full strip redraw) |
| `howNodeIds` | How nodes this strip/step illustrates |

**Keep prior wireframes 100%.** Archive; never delete for convenience.  
**Asset hygiene:** SVGs used as `<img>` must be valid XML (ASCII-safe punctuation; no bare `&`).

### 8.2 UI

Register **Strips** tab:

- One card per **lineage** (Create, Evaluate, Enrich, …)  
- **Strip version scrubber** (`v1` `v2` `v3`) on the card  
- **Versioned steps** show a boxed **i** on the matching strip panel; hover reveals **label + step scrubber**; selecting a step version **swaps that panel’s preview** via step `src`  
- Step names **honor strip panel labels** (e.g. Filter + prune)  
- **Changelog** modal — all strip + step revisions, newest first  

### 8.3 Markdown changelog (supplement)

Human-readable twin (e.g. `docs/register/CHANGELOG-wireframes.md`) mirrors registry `why` — not a replacement for registry fields.

### 8.4 When to bump a version

| Bump | When |
|------|------|
| **Strip** | Stage **identity** changes; a step is **added**; a step is **removed**; or most/all steps in the stage move |
| **Step** | A step is only **modified** (same beat, different presentation); strip SVG may stay |
| **Skip** | Typos, tiny positional nudges, no story change |

**Exemplar — Evaluate strip v2→v3 `why`:**

> Minimalist dossier: accordion like reference…

**Exemplar — Enrich v2 · Filter + prune step v1→v2 (strip stays v2):**

> Tower craft on click-through: quiet Filter + popover + chips; quiet Add firm — Enrich strip SVG unchanged.

---

## 9. Click-through

- Same **block** as the product will use.  
- Lo-fi primitives OK (gray buttons, fake sheets).  
- Timers / dummy data OK — positional truth over realism.  
- Heuristic: if a downstream requirement is cheap to show in gray, show it.  
- Click-through may trail **current** strips; when v2 is current, Evaluate beats must demonstrate v2 agency (notes, re-analyze, clear) — not v1’s short verdict card.

Click-through is **not** `/prototype`. Do not promote lo-fi to production UI.

---

## 10. Approve gate (human)

For **serious** changes (new beat identity, new co-pilot loop, layout law changes):

```text
wireframe (strip vN) → click-through → YOU prune/approve → then plant
```

Agents must **stop** and ask before planting durable product UI for that beat.

Small fixes inside an already-approved plant (bug, token miss, width) may patch `/prototype` directly — still prefer a strip note if the *story* of the beat changed.

---

## 11. Plant (`/prototype` → future `/`)

### 11.1 Future-home rule

Build durable Operator UI under a **future-home** route (Tally: `/prototype`). Later flip `/` to the same tree. Holons nest under a parent (e.g. `prototype`) so Console can group them.

### 11.2 Laws at first plant

| Law | Meaning |
|-----|---------|
| **Dark mode from day one** | Toggle + `t = isDark ? dark : light` + `html.dark` for shadcn portals |
| **Tokens** | Shell / Holons / DocsPanel use `t`; no hardcoded theme hex for chrome |
| **shadcn** | Buttons, sheets, dialogs, fields, accordion, tables — skill + CLI; semantic colors inside components |
| **HolonBoundary** | Every meaningful region |
| **Honor approved intent** | If strip said full-bleed dossier, don’t ship `max-w-xl` postcard |

### 11.3 Interaction shape → component (after approve)

| Need | Prefer |
|------|--------|
| App chrome | Sidebar (sidebar-07 shape), owned product nav |
| Secondary task | Sheet |
| Modal choice | Dialog |
| Row actions | DropdownMenu |
| Dossier sections | Accordion |
| Firmographics | Table |
| Empty first-run | Empty |
| Forms | Field / FieldGroup / Input |

Lo-fi named the shape; shadcn supplies the durable primitive.

---

## 12. Where shadcn sits in the pipeline

```text
How / outcomes
  → block + gray strips + click-through   ← NO shadcn required
  → human approve
  → plant                                 ← shadcn + tokens + holons
  → flow map + implement backends         ← when needed
```

- **Do not** hand-roll Button/Dialog/Field when planting.  
- **Do not** shadcn-ize Register gray strips.  
- Init shadcn once per app; map CSS variables to brand; keep `.dark` in sync with product `dark` tokens.

---

## 13. Co-pilot / agency patterns (product pattern, not agent autonomy)

When a beat needs **Operator agency to clear** (Evaluate exemplar):

| Pattern | Meaning |
|---------|---------|
| Known pack first | Mostly retrieval of work already done |
| Honest unknowns | “Can’t be identified” — not blank chrome |
| Call notes | NL notes per section as first-class context |
| Update fact | Patch dossier (decide campaign-only vs write-back) |
| Re-analyze this / all | Explicit click; live rewrite; uses notes + facts |
| Clear | Operator gate — co-pilot, not autopilot |

Model calls may power **re-analyze**; the **loop** is Operator-led.

---

## 14. Anti-patterns (augmented list)

- Planting product UI from an unapproved strip identity  
- Overwriting strip assets instead of archiving + versioning  
- Treating click-through lo-fi as the product look  
- Shipping `/prototype` without dark toggle  
- Hardcoding `t = light`  
- Inventing How children without DNA  
- Process language above the leaf  
- Starting a naked panel with no block  
- shadcn inside gray wireframe mode  
- Fake “enrich list” when the beat is firmographics (or vice versa)  
- Asking an agent to “just update the prototype” for a large identity change  

---

## 15. Agent handoff lines (pasteable)

### Full Register-augmented build

> Follow `docs/build-foundation/00-rudiments.md` and `05-register-augmented-build.md`. For serious UI changes: strip → click-through → wait for human approve → then plant on future-home with tokens, dark mode, HolonBoundary, and shadcn. Version strips (`current`/`archived` + `why`). Do not overwrite prior wireframes. Do not collapse lo-fi look into product look without explicit approve.

### Plant only (after approve)

> Strip X vN is approved. Plant on `/prototype` honoring intent (full-bleed / dossier / etc.). Dark mode toggle from the start. Tokens for shell; shadcn for controls; register holons. Do not re-open strip identity unless asked.

### How only

> Decompose with DNA + visibility per `01-ui-first-and-how.md`. No process language above the leaf. Map components to registered surfaces / current strips when helpful.

---

## 16. Worked exemplar (Tally Evaluate)

| Generation | Intent |
|------------|--------|
| **v1 (archived)** | Pick known company → skeleton → short verdict summary (emulation) |
| **v2 (current)** | Full-bleed co-piloted dossier; unknowns; notes; re-analyze; Operator clears |

Progression used: new SVG → registry version fields → Strips scrub / step **i** / Changelog → click-through upgrade → **human approve** → (next) `/prototype` plant.

Enrich firmographics and width/search fixes follow the same law when they are identity-level.

---

## 17. Adopting this in Tower (checklist)

1. Copy or sync this file into Tower `docs/build-foundation/05-register-augmented-build.md`.  
2. Point `docs/product/ui-first-build-methodology.md` at this aug (§ sequence).  
3. Add strip registry + scrub / step **i** / Changelog when Tower Register grows screen strips.  
4. For the stuck epic: write a **bridge note** (outcomes → How anchors → missing strip/click-through → approve → plant → flow).  
5. Continue Tower conversation with the Tower agent using the bridge note + this file.

---

## 18. Part 2 placeholder — Tower stuck-point bridge

*(Filled after human states where Tower is stuck.)*

| Field | Content |
|-------|---------|
| Epic / outcome | _TBD_ |
| Symptom of stuck | _TBD_ |
| Likely missing lens | Outcomes / How / Strip / Approve / Plant / Flow |
| How this methodology unsticks it | _TBD_ |
| Next Register artifact | _TBD_ |
| Findings MD path | `docs/product/tower-methodology-bridge-findings.md` (create when ready) |

---

**End of augmentation.** Rudiments 1–6 on every interactive plant still apply. This file only adds the Register generation spine and the approve gate that keeps large changes progressive and reversible.
