# Test spec — 013 The room stays live

**Packet:** [`PM-PACKET-013-LIST-LIVE.md`](./PM-PACKET-013-LIST-LIVE.md)  
**Desk:** `https://travis-psi.vercel.app`  
**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`)  
**Viewport:** phone, or 430×932.  
**Mode:** **Log** · **Type** unless a step says Backlog.

Fill **I saw** on this step before the next.

**Pass** = saw matches Expect, in order. **Hard refresh to see a row is a miss.** Waiting out a poll guess to see a row is a miss.

---

## Before

Open psi. Enter Travis. Log. Type.

Dest sentence (exact):

```
One-line note on the tape.
```

---

## A. The wire, not the timer

### A.1 Send and see

**Do:** Type `One-line note on the tape.` Send. Do not refresh. Do not wait three seconds on purpose.

**Expect:** In this order:

1. Your line is on the right as soon as it is sent.
2. Their reply or Stream shows when it lands — not after a later refresh.

**I saw:**

---

## B. Reconnect does not lose

### B.1 Leave and come back to the same room

**Do:** After A, switch to Rooms, then enter Travis again. Do not hard-refresh the browser. Look at the Log.

**Expect:** In this order:

1. The lines from A are still there.
2. Nothing that landed is missing.

**I saw:**

---

## C. Backlog

### C.1 List

**Do:** Open Backlog. Keep it open. Do not hard refresh.

**Expect:** In this order:

1. Rows show. The list does not flash empty.
2. A new or changed ticket appears on this list without hard refresh.

**I saw:**

### C.2 Ticket

**Do:** Open one ticket. Messages. A line lands on that ticket. Stay. Do not hard refresh.

**Expect:** The new line is on **this** ticket.

**I saw:**

---

## After

If any **I saw** needed a hard refresh, the packet is not done.
