# Test spec — 013 Lists show now

**Packet:** [`PM-PACKET-013-LIST-LIVE.md`](./PM-PACKET-013-LIST-LIVE.md)  
**Desk:** `https://travis-psi.vercel.app`  
**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`)  
**Viewport:** phone, or 430×932.  
**Mode:** **Log** · **Type** unless a step says Rooms or Backlog.

Fill **I saw** on this step before the next.

**Pass** = saw matches Expect, in order. **Hard refresh to see a row is a miss.**

---

## Before

Open psi. Enter Travis. Log. Type.

Dest sentence (exact):

```
One-line note on the tape.
```

---

## A. Log without hard refresh

### A.1 Send and see

**Do:** Type `One-line note on the tape.` Send. Do not refresh. Watch the thread up to five seconds.

**Expect:** In this order:

1. Your line is on the right.
2. Their reply or Stream shows without a hard refresh.

**I saw:**

---

## B. Backlog without hard refresh

### B.1 List stays, then updates

**Do:** Open Backlog. Wait until rows show. Keep it open.

**Expect:** In this order:

1. The list is rows, not a long blank.
2. A new or changed ticket appears on this list without hard refresh (or within one poll beat after it lands).

**I saw:**

### B.2 Ticket while open

**Do:** Open one ticket. Messages. Keep it open. Have a line land on that ticket (or dest that ticket). Do not leave. Do not hard refresh.

**Expect:** The new line shows on **this** ticket.

**I saw:**

---

## C. A blip does not wipe

### C.1 Still there

**Do:** On Backlog with rows showing, wait through at least one poll (three seconds). Do not refresh.

**Expect:** The list does not flash empty.

**I saw:**

---

## After

If any **I saw** needs a hard refresh to match Expect, the packet is not done.
