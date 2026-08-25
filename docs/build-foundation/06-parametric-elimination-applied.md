# Parametric elimination — applied exemplars

Living record of where the craft law ([`06-parametric-elimination.md`](./06-parametric-elimination.md)) was applied. Use this to **grade** new work: same laws, same checkable moves.

**Source of craft instinct:** Tower in-app chrome (esp. automations — quiet attach menus, header action hierarchy).  
**Formalized applications below:** Tally Register (Operator Core).

---

## Rubric (quick grade)

| Score band | Means |
|------------|--------|
| ~3–4.5 | Placating: equal chrome, always-on secondary tools, bordered cards competing with the work |
| ~8 | Hierarchy + restraint; doors for secondary; one loud action; border budget spent once |
| 9–10 | Same laws + handmade timing/type/spacing judgment (not required to claim “applied”) |

When grading another agent’s UI: name the **job**, list **doors vs work**, count **loud actions**, count **unnecessary borders**.

---

## 1. Enrich · Filter + prune (firmographics)

| | |
|--|--|
| **Surface** | Register Click-through · Off call · Firmographics table |
| **Strip step** | Enrich v2 · Filter + prune (step version; strip stays v2) |
| **Prior (~4.5)** | Always-on filter field grid + dashed full-width Add firm strip |
| **After (~8)** | Quiet Filter + anchored popover + dismissible chips; quiet Add firm in header |
| **Living code** | `apps/tally/src/app/register/wireframes/loFi/FirmographicsTable.tsx` |
| **Versioning** | `wireframesRegistry.ts` · `docs/register/CHANGELOG-wireframes.md` |

### Laws used

| Law | Move |
|-----|------|
| One job | Table + Deploy own the beat |
| Quiet until invited | Filters behind Filter door |
| Border budget | Removed dashed Add strip and always-on filter frame |
| Action hierarchy | Deploy loud; Filter / Add quiet |
| Locked honesty | Filters visible but locked while `* Running` |

### Grade note

Lo-fi gray still. Jump is **elimination**, not polish.

---

## 2. Register left panel (Outcomes / Flows / Components)

| | |
|--|--|
| **Surface** | Register sidebar index |
| **Prior (~3.5–4)** | Four equal 35px bordered headers; bordered outcome cards with always-on full statements |
| **After (~8 aim)** | One Register header; quiet uppercase section labels; lean actor/outcome rows; statement under **selected** only; muted `stub` |
| **Living code** | `RegisterLeftPanel.tsx`, `OutcomesPanel.tsx` under `apps/tally/src/app/register/components/` |
| **Shell** | `RegisterPage.tsx` mounts `<RegisterLeftPanel />` |

### Laws used

| Law | Move |
|-----|------|
| One job | Outcomes is the work; Flows/Components wait |
| Border budget | Aside edge + Register header only — no section bars, no outcome cards |
| Quiet until invited | Statement only when outcome selected |
| Action hierarchy | Only graph outcomes pitch (click → canvas); stubs don’t |
| Don’t placate empty | Flows/Components = one muted line each |

### Grade note

Still Inter / light-only Register route — out of scope. Craft score is hierarchy, not dark mode.

---

## 3. Evaluate · Agency (disco dossier footer)

| | |
|--|--|
| **Surface** | Register Click-through · Disco · Dossier footer (+ pick-company lean row) |
| **Strip step** | Evaluate v3 · Agency (step version; strip stays v3) |
| **Prior (~4.5)** | Bordered Re-analyze ghost + Enrich as primary on disco; pink sparkles; dashed skeleton bars; selected company in a card; Create another as second bordered CTA |
| **After (~8)** | Quiet text Re-analyze; one loud **Clear** (gate → off-call Enrich); muted sparkles; lean selected company; Create another as text link; solid skeleton pulses |
| **Living code** | `apps/tally/src/app/register/wireframes/loFi/OperatorPrototypeApp.tsx` (`DossierView`, campaign pick) |
| **Versioning** | `wireframesRegistry.ts` · `docs/register/CHANGELOG-wireframes.md` |

### Laws used

| Law | Move |
|-----|------|
| One job | Dossier owns disco; Enrich waits off call |
| Action hierarchy | Clear loud; Re-analyze / Create another quiet |
| Border budget | Dropped selected-company card + dashed skeleton frames |
| Quiet until invited | Re-analyze as text+icon, not a second button shell |
| Don't placate empty | No accent pink sparkles begging on every open |

### Grade note

Lo-fi gray still. Jump is **elimination**, not polish.

---

## 4. Create · Campaigns + Campaign basics

| | |
|--|--|
| **Surface** | Register Click-through · Disco · Campaigns list + New campaign sheet |
| **Strip step** | Create v1 · Campaigns + Campaign basics (strip stays v1) |
| **Prior (~4)** | Skeleton bars on empty list; Name label + example placeholder; Cancel bordered ghost; campaign row as card |
| **After (~8)** | Honest empty; autofocus “Campaign name”; Cancel quiet text; Create loud; lean campaign row |
| **Living code** | `ListChrome`, basics sheet in `OperatorPrototypeApp.tsx`; `LoFiField` optional label |
| **Versioning** | `wireframesRegistry.ts` · `CHANGELOG-wireframes.md` |

### Laws used

| Law | Move |
|-----|------|
| Don't placate empty | Removed fake skeleton rows |
| One job / action hierarchy | Create loud; Cancel quiet |
| Quiet until invited | Header carries the job — no redundant Name label |
| Border budget | Lean campaign row; quiet ⋮ |

### Grade note

Lo-fi gray still. Jump is **elimination**, not polish.

---

## 5. Guest → Business Client continuum click-through

| | |
|--|--|
| **Surface** | Register Click-through · Guest Core **and** BC Core |
| **Prior (~4–5 on sit fit)** | Two apps; Guest dead-ended at “restart”; BC started as a stranger |
| **After** | One `PayerContinuumPrototypeApp` — fund → conversion receipt → BC life; shared vessel object |
| **Living code** | `apps/tally/src/app/register/wireframes/loFi/PayerContinuumPrototypeApp.tsx` |
| **Sit challenge** | `docs/register/persona-sits/guest-business-client.md` · `interpretation-to-clickthrough.md` |

### Laws + intercept

| Move | Why |
|------|-----|
| Intercept at **interpretation → CT** | Registry can keep two Core outcomes; CT must not placate that split |
| One job / continuum | Same person after fund |
| Shared vessel | Locked rules + escrow as one object across phases |
| Conversion receipt | Forced object #6 — first-class beat, not a dead end |

### Grade note

Sit-fit redesign more than chrome polish. Continuum is the product truth; two shells were registry placating.

---

## 6. Guest click-through craft (vessel as contract)

| | |
|--|--|
| **Surface** | Register Click-through · Guest beats (Invite → Walk → Fund → Receipt) |
| **Prior (~4)** | Bordered cards; “Locked campaign rules (shared object)” gray box on every screen; instructional captions; ghost bordered secondary CTAs |
| **After (~8)** | Sit §4 contract prose on Invite; Walk = fluency only + quiet rules line; Fund = hold amount hero; quiet Walk away; no card stack |
| **Living code** | `PayerContinuumPrototypeApp.tsx` (guest screens) · `LoFiButton` `quiet` |
| **Sit** | `persona-sits/guest-business-client.md` §2–5 |

### Laws used

| Law | Move |
|-----|------|
| One job | Invite = vessel; Walk = fluency; Fund = hold |
| Border budget | Dropped LoFiCard + repeating rules chrome |
| Quiet until invited | Rules on Walk as one line, not a second pitch |
| Action hierarchy | One loud CTA; Walk away / Back quiet text |
| Sit truth | Reads like escrow-lawyer simplicity, not a feature checklist |

---

## 7. How to add the next exemplar

When you apply the law again (or grade a peer agent):

1. Score before / after on the rubric.  
2. One table: surface, prior chrome, after chrome, file paths.  
3. Map each change to a numbered law from `06-parametric-elimination.md`.  
4. Append a section here — keep this file the living log.

---

## Related

- Strip / step versioning when craft lands as a step: [`05-register-augmented-build.md`](./05-register-augmented-build.md) §8 · [`CHANGELOG-wireframes.md`](../register/CHANGELOG-wireframes.md)  
- Cursor rule: `docs/build-foundation/cursor-rules/parametric-elimination.mdc` → copy into `.cursor/rules/`
- Persona sits / interpretation: [`../register/persona-sits/`](../register/persona-sits/)
