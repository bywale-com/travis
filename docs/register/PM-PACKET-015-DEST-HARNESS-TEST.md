# Test spec — 015 Dest harness recut

**Packet:** [`PM-PACKET-015-DEST-HARNESS.md`](./PM-PACKET-015-DEST-HARNESS.md)  
**Desk:** `https://travis-psi.vercel.app`  
**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`)  
**Viewport:** phone, or 430×932.  
**Mode:** **Log** · **Type**. Do not start on Voice.

Fill **I saw** on this step before the next.

**Pass** = dest body contains the ask **and** the print, and he did not create Technical PM.  
**Instruction-only dest is a miss.** Creating Technical PM is a miss.  
**Pass from `src/` only is a miss.**  
Do **not** use the 014 dest sentence (it contains the old marker words). This sheet uses the 907 wording on purpose.

---

## Before

Open the live Travis app. Enter Travis. Log. Type.

There should already be chat on the tape (this room). If the Log is empty, Type one short line first so a print exists, then continue.

Dest sentence (exact — 907 wording):

```
every initiative and idea we've discussed in this chat, I would like to send that alongside prompting them as well, the technical PM, to list out every idea and initiative we've discussed that hasn't yet been implemented.
```

Cheap sentence (exact):

```
ok
```

---

## A. Dest carries this chat

### A.1 Send the alongside line

**Do:** Type the dest sentence. Send. Do not hard refresh.

**Expect:** In this order:

1. Your line is on the right.
2. A dest to Technical PM leaves.
3. The dest body on the Log **contains your ask and the print of this chat** (titles / turns you can read without opening Cursor), not only a wrap of “send that alongside.”
4. He does **not** say he is creating Technical PM. Stream / process is dest (`send_to_seat` / `dispatch_to_seat` / `dest_with_context`), not `create_agent`.

**I saw:**

---

## B. Stream shows that dest

### B.1 Open Stream

**Do:** After A, open Stream (glow / In this room / the Stream card). Do not hard refresh.

**Expect:** In this order:

1. Stream is the 008 desk (live pane or Log card). Not a new chrome.
2. A **process** row is the dest fork. Its body includes the print from A — not only “include the printed chat” / `read_seat_reply`.
3. You do not see a create-person process for Technical PM.

**I saw:**

---

## C. A cheap line does not dump the room

### C.1 Type ok

**Do:** Type the cheap sentence. Send. Do not dest. Do not hard refresh.

**Expect:** In this order:

1. Your `ok` is on the right.
2. Travis answers. No dest leaves.
3. Stream process for this send is **not** the whole room pasted as the think. The long print stays off that cheap call.

**I saw:**

---

## After

Voice: no Hear it / Skip **buttons**.

**Steps I could not do (human):** Talk on a phone. Dest landing on a live Technical PM bind.
