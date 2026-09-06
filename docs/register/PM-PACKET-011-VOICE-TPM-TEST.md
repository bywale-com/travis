# Test spec — 011 Voice New, Hear it, Technical PM

**Packet:** [`PM-PACKET-011-VOICE-TPM.md`](./PM-PACKET-011-VOICE-TPM.md)  
**Desk:** `https://travis-psi.vercel.app` — room Travis. Phone (or 430×932).  
**You do not need to remember the packet.** This sheet is the walk.

Fill **I saw** on this step before the next.

**Pass** = saw matches Expect. **Miss** = it does not.

---

## Before you start

- Room Travis already has tickets that Engineer, SA, and the old catalog PM have posted on. Do not dest yet.
- Dest sentence (use this): `Put a one-line note on this ticket.`
- Ticket: one **open** ticket you can name.

---

## 1. Voice is quiet when nothing new has landed

**Do:** Open Voice. Do not dest. Do not tap Hear it. Do not tap Skip. Look under the orb, under the listen line.

**Expect:** There is no chip that says `3 new · PM, Eng, SA`. There is no chip that says `3 new` and then names PM, Engineer, and SA in any order. There is no **Hear it**. There is no **Skip**.

**I saw:**

---

## 2. Dest Engineer on that ticket

**Do:** Dest Engineer. Send exactly: `Put a one-line note on this ticket.` Stay on Voice.

**Expect:** A receipt that it went. The dest is that ticket.

**I saw:**

---

## 3. One New, usable labels

**Do:** Wait until Engineer finishes. Stay on Voice. Look under the orb.

**Expect:** In this order, under the listen line:

1. A chip that names **this** landing — Engineer only. Not `3 new` for three seats.
2. A control whose visible label is exactly `Hear it`. Accent (the loud one). At least 44 pixels tall and 44 pixels wide.
3. A control whose visible label is exactly `Skip`. Muted. Same size as Hear it. Not missing. Not too faint to tap.

**I saw:**

---

## 4. Hear it — outcome only

**Do:** Tap **Hear it**. Listen to the end.

**Expect:** Travis speaks the outcome of that Engineer post. The last sentence is part of the outcome. He does not then say any of these: `do not read`, `don't read`, `the full text is in the Log`, `the rest is in the log`, `see the chat`.

**I saw:**

---

## 5. Skip is gone after Hear it

**Do:** Look under the orb again. Do not dest.

**Expect:** Hear it is gone. Skip is gone. The Engineer chip is gone.

**I saw:**

---

## 6. Technical PM, not catalog PM

**Do:** Open dest (Type chips or roster). Look at the names you can dest. Then dest “the PM” or the Technical PM person. Send: `Put a one-line note on this ticket.`

**Expect:** The dest list shows **Technical PM**. It does not show a separate dest named `PM` for catalog `pm`. The send goes to the Technical PM person (`technical-pm`), not catalog `pm`.

**I saw:**

---

## 7. Voice chip says Technical PM, not PM

**Do:** Wait until that person posts. Stay on Voice. Read the New chip.

**Expect:** The chip names Technical PM (or that person’s label). It does not say `PM` for catalog `pm`.

**I saw:**
