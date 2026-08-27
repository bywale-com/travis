# Hotfix 010 — Vocative / trailing call-by-name

**Number:** `010` — next engineer hotfix is `011`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived smoke after 009: `hey engineer` still posted to PM).  
**When:** 2026-08-27  
**PR title shape:** `Hotfix 010 — hey engineer routes to Engineer`

---

## Why (smoke)

Mode B quote rail was painting (009 worked). Header stayed `Room · via PM`. Turns:

1. `testing to see if everything works correctly now engine engineer` → PM
2. `what about you p.m. are you actively working as well done` → PM (this one *was* for PM)
3. `hey engineer` → PM, `Run finished (no assistant text)`

002 / 009 only switched on a **leading** seat name. Dest opens on PM. A vocative at the end or `hey engineer` never flipped `active_binding_id`.

## Cut

`parseCallByName` also matches:

- greeting vocative: `hey|hi|hello|ok|okay|yo` + seat
- trailing vocative: last token is a seat name, unless it is `the/a/an/our/your` + name (noun)

Bare `Engineer` is still switch-only (empty remainder). `hey engineer` keeps text so it **sends** to Engineer. Mid-sentence `the engineer talking` still does not switch.

## Must-not

- Do not mint tables.
- Do not append PM/SA logs.
- Do not treat every mention of “engineer” as a call.

## Verify

1. `hey engineer I'm done` → pills `Room · via Eng`; Engineer run, not PM.
2. `… now engineer I'm done` → Engineer.
3. `can I see the engineer talking I'm done` → stays on current seat.
4. Open default remains PM until a call.
