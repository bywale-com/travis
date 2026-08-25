# Parametric elimination — design craft law

**Thesis:** Taste does not become a formula that *generates* an 8. It becomes **constraints that kill the 4**.

**Name:** Parametric elimination — checkable laws that remove placating chrome before polish.

**Metaphor (prospecting, not placating):** Every border, dashed CTA, always-on field stack, and equal-weight button is asking for attention — *do me a favor, look at me.* Design like prospecting: only pitch controls relevant to **this beat**. Everyone else waits behind a quiet door. No begging.

Companion visual law: [`03-visual-system.md`](./03-visual-system.md) (tokens, icons, type).  
Worked examples: [`06-parametric-elimination-applied.md`](./06-parametric-elimination-applied.md).

---

## 1. One job per surface

If you can name **two jobs** on the same surface, one of them goes behind a door (popover, sheet, expand-on-select, secondary tab).

| Placating | Prospecting |
|-----------|-------------|
| Filters + table + Add strip all pitching | Table owns the beat; Filter and Add are quiet doors |
| Every nav section gets equal bordered chrome | One index owns the work; placeholders stay muted |

---

## 2. Border budget

Borders are a **spend**, not a democracy.

- If removing a box / hairline / dashed frame does not hurt the job → **remove it**
- Prefer: one pane edge + selected indicator — not a card per row and a bar per section
- Dashed full-width “please click” strips are begging — replace with quiet text/icon actions

---

## 3. Quiet until invited

Secondary tools start as **text + icon** (or lean rows). They get a shell only after intent:

- Filter → popover / sheet  
- Detail prose → under selected row, or hover, not every row  
- Empty modules (Flows, Components stubs) → one muted line, not equal section chrome  

Always-visible = claiming the beat. On-demand = prospecting.

---

## 4. Action hierarchy

At most **one loud action** per beat (filled button, primary CTA). Everything else does not pitch at the same volume.

| Loud (earns it) | Quiet (door) |
|-----------------|--------------|
| Deploy, Create, primary confirm | Filter, Add (secondary), Clear, stubs |

---

## 5. Don’t placate empty chrome

- Placeholder sections must not compete with the living tree  
- Status labels: mute stubs; don’t badge “open” on every selectable row  
- Locked-but-visible is honest (e.g. filters locked while running); fake loading UIs that invent a second surface are not  

---

## 6. What this is / is not

| Is | Is not |
|----|--------|
| Elimination checklist before / during UI craft | A generator of “beautiful” UI |
| Raises a 4.5 → ~8 by hierarchy and restraint | A substitute for handmade judgment on the last mile |
| Works in lo-fi gray and production tokens alike | An excuse to skip tokens, registry, or approve gates |

---

## Agent checklist (before shipping chrome)

1. What is the **one job** of this surface?  
2. Which controls are **doors** vs the work?  
3. Can I remove a border without hurting the job?  
4. Is there more than one loud action? Kill or demote.  
5. Is any empty / secondary module wearing equal chrome? Quiet it.  

---

## Anti-patterns

- Always-on multi-column filter grids when a Filter door would do  
- Dashed full-width secondary CTAs  
- Stacked equal section bars (Outcomes / Flows / Components all 35px bordered)  
- Bordered card + full statement on every list row  
- Purple/accent rings on every selectable item instead of a quiet selected state  

---

## Agent handoff line (pasteable)

> Follow `docs/build-foundation/06-parametric-elimination.md`. One job per surface; border budget; quiet until invited; one loud action; don’t placate empty chrome. See applied exemplars in `06-parametric-elimination-applied.md`.
