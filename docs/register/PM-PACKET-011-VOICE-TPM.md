# PM packet 011 — Voice New, Hear it, Technical PM

**Number:** `011` — next PM packet is `012`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **027**.  
**When:** Named 2026-09-06 — founder bundle.  
**Status:** Specified from planted grain + this walk.  
**Wake:** hold  
**Test spec:** [`PM-PACKET-011-VOICE-TPM-TEST.md`](./PM-PACKET-011-VOICE-TPM-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Builds on:** 007 / 010 / 026 Hear · 051 New · 073 / 075 Technical PM.  
**Next SA:** **027**.

**Where:** this PR. SA and Engineer commit here.

---

## Founder lock

> Stop ad-libbing in log summaries, especially ending with “do not read” style lines. In voice mode, don’t show “3 new” for PM/Engineer/SA when they’re just existing initiatives, and fix the hear/skip labels so they’re usable. Also: when we say PM, we mean Technical PM; the old PM should not be used or shown.

---

## Why one packet

One Voice beat. The chip, the two labels, the spoken gist, and the name of the PM are the same surface. Tests are one walk.

---

## Pocket 1 — Gist does not ad-lib

**Lived miss:** Hear speaks a summary that invents a closer — “do not read…”, “the rest is in the Log”, that family.

**Planted:** `summarizeSeatReply` (`src/server/travis-summarize.ts`) instructions are “Three sentences at most.” `serveHear` speaks that gist. Empty gist speaks `gistEmptyFallback` — the offer plus “The full text is in the Log.” (`src/lib/offer.ts`).

**Lock:** The spoken gist is the outcome only. It does not invent a closer. It does not tell him not to read. It does not point him at the Log unless he asked for verbatim and the clip is the honest hole.

Empty gist (no key / fail): speak the offer line once. Do not append a “full text / do not read” sentence. 010’s empty-gist closer is recut.

PM trail stamps follow the same law: state the lock. Do not end a summary with a “do not…” laundry list.

---

## Pocket 2 — New is a landing, not the three seats

**Lived miss:** Voice shows `3 new · PM, Eng, SA` (or that family) when those seats only have **existing** tickets / old posts.

**Planted:** `listUnheardReports` (`src/server/serve.ts`) is every speakable cursor `agent_post` with `heard_at` null. 026 added the column. It did not backfill. `newReportChip` (`src/lib/new-report.ts`) then prints `N new ·` plus unique seat shorts. `isCursorSeat` is `pm` \| `sa` \| `engineer` only (`src/lib/seats.ts`).

**Lock:** New is a **new landing** — a seat post that has not been Heard, Skipped, or sat in view on the Log **since it landed**. Old posts on existing initiatives are not New. Opening Voice on a room that already has PM / Engineer / SA tickets must not show `3 new` for those three names.

Do not remint `heard_at`. SA ascribes the cutoff (backfill vs another rule). Quote the live rows.

---

## Pocket 3 — Hear it / Skip are usable

**Lived miss:** The two Voice controls are not usable.

**Planted:** Under the orb, when the chip is on (`src/components/Room.tsx`): text **Hear** (accent) and **Skip** (muted). `TYPE.meta`. No min tap. Skip reads as dead.

**Lock:** The words are exactly **Hear it** and **Skip**. Hear it is the loud one (accent). Skip is quiet, not dead. Each control is at least **44×44** CSS pixels. They sit under the chip, in that order, left to right: Hear it, then Skip. They appear only when there is a real New landing (pocket 2).

---

## Pocket 4 — PM means Technical PM

**Lived miss:** Glass and dest still say **PM** for catalog `pm`. That person is not the product PM.

**Planted:** Catalog `pm` label is `"PM"` (`src/server/db/ensure-bindings.ts`). Short **PM** (`src/lib/seat-mark.ts`, `offerSeatWord`, dest chips). Sit protocol `/protocols/pm.md` is already Technical PM. Person dest `technical-pm` is the living bind. 075 leftover: dest `technical-pm`; do not mail catalog `pm`.

**Lock:** On the product face, the PM is **Technical PM**. Catalog `pm` is not dest, not a New name, not a roster chip labeled PM. Spoken / typed “PM” / “the PM” is the Technical PM person. Catalog `pm` is not shown.

Do not mint `/protocols/technical-pm.md`. Same protocol path. SA ascribes hide-vs-map. Do not remint sit roles.

---

## Must / must-not

- New = new landing. Not “these three seats exist.”
- Hear it / Skip only when New is real.
- Gist = outcome. No invented closer.
- Face says Technical PM. Catalog `pm` is not used and not shown.
- Do not remint 023–026. Do not remint `heard_at` / `seen_at`. Do not plant canvas.

---

## SA 027

Ascribe: (1) cutoff so old posts are not New; (2) gist instructions + empty-gist recut; (3) dest / glass map so “PM” is Technical PM and catalog `pm` is hidden; (4) whether `isCursorSeat` must take `technical-pm` or stay role-only. Quote live rows. Engineer plants after that.

---

## Verify

Walk [`PM-PACKET-011-VOICE-TPM-TEST.md`](./PM-PACKET-011-VOICE-TPM-TEST.md). Phone Voice first.
