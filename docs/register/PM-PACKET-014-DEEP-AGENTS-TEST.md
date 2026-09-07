# Test spec — 014 Deep Agents (dest-with-context fork)

**Packet:** [`PM-PACKET-014-DEEP-AGENTS.md`](./PM-PACKET-014-DEEP-AGENTS.md)  
**Desk:** `https://travis-psi.vercel.app`  
**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`)  
**Viewport:** phone, or 430×932.  
**Mode:** **Log** · **Type**. Do not start on Voice.

Fill **I saw** on this step before the next.

**Pass** = dest prompt contains the list. **Instruction-only dest is a miss.** Pass from `src/` only is a miss.

---

## Before

Open psi. Enter Travis. Log. Type.

List sentence (exact):

```
List the open initiatives in this room, in order.
```

Dest sentence (exact):

```
Send that list as context to Technical PM, including what we just discussed here.
```

---

## A. The list is on the tape

### A.1 Ask for the list

**Do:** Type the list sentence. Send. Do not dest yet.

**Expect:** In this order:

1. Your line is on the right.
2. Travis lists room initiatives (Stream or a post). The list is on the Log.

**I saw:**

---

## B. Dest carries that list

### B.1 Send as context

**Do:** Type the dest sentence. Send. Do not hard refresh.

**Expect:** In this order:

1. A dest to Technical PM leaves.
2. The dest body on the Log **contains the list from A** (titles / the print), not only a wrap of “send that as context.”
3. You can read that list in the dest line without opening Cursor.

**I saw:**

---

## C. Stream shows that dest

### C.1 Open Stream

**Do:** After B, open Stream (glow / In this room / the Stream card). Do not hard refresh.

**Expect:** In this order:

1. Stream is the 008 desk (live pane or Log card). Not a new chrome.
2. A **process** row is dest-with-context. Its body includes the list from A — not only “include the printed chat” / `read_seat_reply`.

**I saw:**

---

## After

Voice: no Hear it / Skip **buttons**.

**Steps I could not do (human):** Talk on a phone. Dest landing on a live Technical PM bind.
