# Overlay escape — menus must leave the clip

**Thesis:** `position: absolute` inside a card does **not** escape `overflow: hidden|auto|scroll` on any ancestor. Rounded shells and flex panes use overflow clip constantly — so in-tree menus get cut off.

**Name:** Overlay escape  
**Symptom:** ⋮ / Filter / “more” popover is truncated at the card or pane edge.  
**Cure:** Render the overlay in a **portal** (`createPortal(…, document.body)`) with **`position: fixed`**, anchored to the trigger’s `getBoundingClientRect()`.

Living helper (Register lo-fi): `apps/tally/src/app/register/wireframes/loFi/AnchoredPortal.tsx`  
Prior art: Strips “Why” popover in `RegisterWireframesPanel.tsx`.

---

## Why it keeps happening

| Intent | Typical code | Side effect |
|--------|--------------|-------------|
| Round a card | `borderRadius` + `overflow: "hidden"` | Clips anything that sticks out |
| Flex pane / scroll | `overflow: "auto"` / `"hidden"` on shell | Clips absolute children of descendants |
| Quiet menu | `position: "absolute"` under the ⋮ | Still a **descendant** → still clipped |

Raising `z-index` does **not** fix clipping. Overflow creates a containing block for paint; z-index only orders within / across stacking contexts.

---

## Law

1. **Menus, popovers, dropdowns that must leave a card/pane → portal + fixed.**  
2. **`overflow: hidden` on a shell is fine** for rounding / scroll — do not put escaping overlays as children of that clip tree.  
3. **`overflow: hidden` on the overlay panel itself is fine** (clip the menu’s own corners).  
4. Prefer a shared helper (`AnchoredPortal` or shadcn `Popover`/`DropdownMenu`, which portal by default) over one-off absolute menus.

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| `createPortal` to `document.body` | Absolute menu inside `overflow: hidden` card |
| Anchor with `getBoundingClientRect` + scroll/resize listeners | Assume `zIndex: 9999` escapes the clip |
| Click-outside + Escape on the portaled node | Grow the parent’s `minHeight` to “make room” for the menu |
| Use shadcn Popover/Dropdown when on the plant | Hand-roll absolute menus next to every ⋮ |

---

## Agent checklist

1. Is this control a **door** that opens a floating layer (menu, popover, select panel)?  
2. Does any ancestor use **overflow clip** (card radius, pane scroll, shell)? If yes → **portal**.  
3. Did I “fix” it by padding the card taller? Revert — that’s placating the clip, not escaping it.

---

## Agent handoff line (pasteable)

> Follow `docs/build-foundation/07-overlay-escape.md`. Floating menus/popovers portal to `document.body` with fixed positioning — never absolute children of `overflow: hidden|auto` cards or panes. Use `AnchoredPortal` (lo-fi) or shadcn Popover/DropdownMenu (plant).
