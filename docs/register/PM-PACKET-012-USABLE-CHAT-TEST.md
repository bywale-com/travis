# Test spec — 012 Usable chat

**Packet:** [`PM-PACKET-012-USABLE-CHAT.md`](./PM-PACKET-012-USABLE-CHAT.md)  
**Desk:** `https://travis-psi.vercel.app`  
**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`)  
**Viewport:** phone, or 430×932.  
**Mode:** **Log** · **Type**. Do not start on Voice.

Fill **I saw** on **this step** before the next.

**Pass** = saw matches Expect, in that order. **Miss** = any line does not. **Pass from `src/` only is a miss.**

---

## Before you start

- Open **psi**. Enter room **Travis**. Switch to **Log**. Switch to **Type**.
- Find a left-side post from **Engineer** (or Technical PM if no Engineer post). Write who: ________
- Reply sentence (exact):

```
Stay on that line.
```

---

## A. You are in the chat

### A.1 Land in the Log

**Do:** Open psi. Enter Travis. Open Log. Type.

**Expect:** In this order:

1. You are in room Travis, not the rooms list.
2. Log is showing.
3. Type composer is showing (field + send).

**I saw:**

---

## B. Reply goes to that person

### B.1 Pick their message

**Do:** Tap the Engineer (or named) post from Before. Tap **Reply**.

**Expect:** In this order:

1. Composer is Type.
2. Something shows you are replying to that bubble (rail, quote, or hold).

**I saw:**

### B.2 Send the reply

**Do:** Type `Stay on that line.` Send. Do not `@`. Do not change via.

**Expect:** In this order:

1. Your message is on the right, hung on that bubble.
2. The run dests **that person** (their Stream / their name / their post) — not Travis-only, not the last via unless that via **is** that person.
3. If that bubble was already a reply, dest is still **that bubble’s author**.

**I saw:**

---

## C. A picture lands in the thread

### C.1 Image on a post

**Do:** Use a dest that prints an existing image in the Cursor turn (attachment or markdown image). Wait until the post is on the Log.

**Expect:** In this order:

1. The post is on the left.
2. The picture is **under that post** in the thread.
3. It is a picture, not a raw path.

**I saw:**

---

## D. Refresh stays

### D.1 Reload in the Log

**Do:** Scroll the thread. Reload.

**Expect:** In this order:

1. Same room.
2. Log. Type.
3. Not the rooms list.

**I saw:**

---

## After

If any **I saw** misses Expect, the packet is not done. Engineer keeps computer-using the Log. Do not write Pass from files.
