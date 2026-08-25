# Visual system

**Goal:** Theme, iconography, type, and spacing stay consistent so UI is product-owned, not one-off CSS.

---

## 1. Tokens (color & chrome)

- One **Tokens** type; **light** and **dark** objects as the only palettes.  
- Components receive `t` (and `isDark` only when needed for rare mode-specific maps).  
- Standard surfaces: `t.bgPrimary`, `t.textPrimary`, `t.border`, `t.accent`, `t.hoverBg`, etc.  

**Don’t**

- Hardcode `#fff` / `#000` / grey rgb for theme-aware chrome  
- Branch `isDark ? … : …` for ordinary text/background/border  
- Add a color in one place without updating the type + both themes  

```tsx
// ✅
<div style={{ background: t.bgPrimary, color: t.textPrimary, border: `1px solid ${t.border}` }} />

// ❌
<div style={{ background: isDark ? "#000" : "#fff", color: "#666" }} />
```

---

## 2. Icons — two roles, don’t mix

| Role | Typical set | Use for |
|------|-------------|---------|
| **Chrome / registry** | Product icon registry (e.g. Notion-style masks) | Trees, nav, holon/surface icons |
| **Controls** | Stroke icon library (e.g. Lucide) | Chevrons, close, menus, theme toggle, checkboxes |

- Tint chrome icons via a **color** prop from tokens — don’t flatten semantic status colors to muted unless intentional.  
- Do **not** import raw icon SVGs all over the app; go through a registry map.  

---

## 3. Typography & list sizing

- Shared **font profile** and label styles for trees / sidebars / dense lists.  
- Directory/list rows: shared primary + meta styles and fixed meta column width where appropriate.  
- Don’t invent a new `fontSize` for “just this sidebar.”  

---

## 4. Spacing & layout scale

Document a small scale early (even if crude):

| Token idea | Use |
|------------|-----|
| Row height / indent | Trees, lists |
| Pane padding | Panels, forms |
| Gap | Stacks of controls |

Prefer named constants or layout helpers over magic numbers in every file. Match existing density when extending a product.

---

## 5. Composition (marketing / hero surfaces)

When building branded or first-viewport marketing UI (not in-app chrome):

- One composition, brand-first  
- Avoid generic AI-default looks (purple gradients, cream+serif terracotta clichés, etc.)  
- Cards only when interaction needs a container  

In-app products usually follow **shell patterns already in the repo** — preserve them.

### In-app chrome craft

For product UI (panels, tables, sidebars, toolbars), apply **parametric elimination** — constraints that kill placating chrome:

→ [`06-parametric-elimination.md`](./06-parametric-elimination.md)  
→ Exemplars / grading rubric: [`06-parametric-elimination-applied.md`](./06-parametric-elimination-applied.md)

One job per surface · border budget · quiet until invited · one loud action · don’t placate empty chrome.

### Overlay escape (menus / popovers)

Floating layers (⋮ menus, Filter popovers, select panels) must **portal** out of cards and panes that use `overflow: hidden|auto` for radius or scroll. Absolute children get clipped; `z-index` does not save them.

→ [`07-overlay-escape.md`](./07-overlay-escape.md)

---

## 6. New-product bootstrap

Minimum stubs:

1. `tokens.ts` (or CSS variables) — light/dark  
2. `icon-registry` — empty map + one wrapper component  
3. `treeTypography` / row style helpers — even if thin  

Then copy the Cursor rule templates from `cursor-rules/` and point paths at those stubs.

---

## Tower reference

- `.cursor/rules/tower-theme-tokens.mdc`  
- `.cursor/rules/tower-icons.mdc`  
- `src/app/components/tokens.ts`, `treeTypography.ts`, `directoryRowStyles.ts`
