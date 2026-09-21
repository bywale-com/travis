# Engineer cut — 023 Look catalyst (pickup after preview red)

**Seat:** Engineer on **[#202](https://github.com/bywale-com/travis/pull/202)** only.  
**Packet:** [`PM-PACKET-023-LOOK-CATALYST.md`](./PM-PACKET-023-LOOK-CATALYST.md) · test [`PM-PACKET-023-LOOK-CATALYST-TEST.md`](./PM-PACKET-023-LOOK-CATALYST-TEST.md)  
**SA:** [`SYSTEMS-CHANGE-PACKET-039-LOOK-CATALYST.md`](./SYSTEMS-CHANGE-PACKET-039-LOOK-CATALYST.md) — intent stands; **first plant was invalid** (see below).  
**Flag:** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.

Founder: **023 was not supposed to ship `src/` yet.** A premature plant landed in `97564b9`. Preview is **red** until fixed or reverted.

---

## 1. House ops (first)

1. **Remove `previewing`** on PR **#202** (mutex blocks seats / second green-light). Founder or token with label write:  
   `gh pr edit 202 --remove-label previewing`
2. Do **not** strip `wake-sa` unless SA re-holds the packet.
3. **Do not** watch doors. One recut, push, stop.

---

## 2. Why preview failed (locked)

**Deploy:** `dpl_CeM4vhNjpoyG24Cfewek9TnQfQ7n` · head `cfe1f68` (includes `Preview [vercel build]` on top of plant).

**Vercel / `next build` error:**

```text
Unknown identifier "ROOM_WIRE_MAX_DURATION_SEC" at "maxDuration"
route: /api/session/[id]/events/route
Invalid segment configuration export detected.
```

**Law:** App Router segment config (`maxDuration`, `runtime`, …) must be a **build-time literal**.  
`export const maxDuration = ROOM_WIRE_MAX_DURATION_SEC` (import from `room-wire.ts`) is **not** allowed.  
Keep **`export const maxDuration = 60`** on the route. Rotation timing stays in `src/lib/room-wire.ts` only.

Reference: [Next.js invalid-page-config](https://nextjs.org/docs/messages/invalid-page-config). Phase One log **2919** already locked Hobby **60**, not 800.

---

## 3. Two allowed paths (pick one)

### Path A — Revert premature plant (founder default until re-go)

1. `git revert 97564b9` on `#202` (drops `room-wire.ts`, `Room.tsx` rotate, route import).  
2. Leave **docs-only** handoff / park on the branch or match `main` for `src/`.  
3. Flip packet **`Wake:** hold`** until founder says go again.  
4. Preview may skip until next plant-finished push; no `src/` = no plant-finished green-light requirement for mutex test.

### Path B — Keep 039 plant (only after founder re-confirms go)

1. **Fix route:** `export const maxDuration = 60` (literal `60`, no import).  
2. Keep `ROOM_WIRE_LIFETIME_MS` / `ROOM_WIRE_CLIENT_ROTATE_MS` in `room-wire.ts`; server timer + client abort + `wire` rotate event as specced in **039**.  
3. `npm test` · `npm run test:preflight` · push.  
4. Plant-finished → `previewing` → doors; **then** remove `previewing` only after doors paint or blocker path per **092**.

Do **not** do Path B while packet is on **hold**.

---

## 4. File plan (Path B only)

| File | Rule |
|------|------|
| `src/app/api/session/[id]/events/route.ts` | `maxDuration = 60` literal; import `ROOM_WIRE_LIFETIME_MS` only for `setTimeout` rotate |
| `src/lib/room-wire.ts` | Constants only — not re-exported into `maxDuration` |
| `src/components/Room.tsx` | Client rotate abort + `wire` handler — unchanged intent |
| `src/lib/room-wire.test.ts` | Grep literal `maxDuration = 60` on route |

Do not remint **029** bus, **037** Look, **038** labels.

---

## 5. Proof

- Preview **green** `next build` on Vercel.  
- Human: [`PM-PACKET-023-LOOK-CATALYST-TEST.md`](./PM-PACKET-023-LOOK-CATALYST-TEST.md) **B** on psi after merge — doors do not replace B.

---

## 6. Must-not

- Cousin PR. Mint table. Change Live SDP. Save+Activate `outside-look`. Append PHASE-ONE / SA logs from Engineer.
