# Test spec — 011 Voice New, reply thread, stay

**Packet:** [`PM-PACKET-011-VOICE-TPM.md`](./PM-PACKET-011-VOICE-TPM.md)  
**Desk:** `https://travis-psi.vercel.app`  
**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`)  
**Viewport:** phone, or 430×932.  
**You do not need to remember the packet.** This sheet is the walk.

Fill **I saw** on **this step** before the next.

**Pass** = saw matches Expect, in that order. **Miss** = any line does not.

---

## Before you start

- Open psi. Enter room **Travis**. Start on **Voice**.
- This room already has tickets that Engineer, SA, and catalog PM have posted on. Do not dest yet.
- Pick one **open** ticket whose title you can say out loud. Write that title here: ________
- Dest sentence (use this exact string, do not invent):

```
Put a one-line note on this ticket.
```

- Reply sentence (use this exact string when the sheet says reply):

```
Yes, stay on that same line.
```

---

## A. Voice is quiet when nothing new has landed

### A.1 Open Voice

**Do:** On Voice, look under the orb, under the listen line. Do not dest. Do not speak Skip. Do not open Log yet.

**Expect:** In this order:

1. The listen line (Listening… or the idle line).
2. No chip whose text starts with `3 new`.
3. No chip that names `PM`, `Eng`, and `SA` together as New.
4. No button labeled `Hear`.
5. No button labeled `Hear it`.
6. No button labeled `Skip`.

**I saw:**

---

## B. Log look marks seen

### B.1 Open Log

**Do:** Tap **View log**. Stay on Log. Scroll so at least one old Engineer (or SA, or Technical PM) bubble is fully on screen for two seconds.

**Expect:** You are still in room Travis. You see the Log thread. You are not on the rooms list.

**I saw:**

---

### B.2 Back to Voice

**Do:** Return to Voice. Look under the orb again.

**Expect:** Still no `3 new · PM, Eng, SA`. Still no Hear / Hear it / Skip buttons. Those old bubbles you just sat on are not New.

**I saw:**

---

## C. A real landing registers as New

### C.1 Dest Engineer on that ticket

**Do:** Dest Engineer. Pass **that** ticket (from the ticket, or say the title). Send exactly:

```
Put a one-line note on this ticket.
```

**Expect:** A receipt that it went. The dest line belongs to that ticket, not a new cousin.

**I saw:**

---

### C.2 Wait on Voice

**Do:** Stay on Voice until Engineer finishes. Look under the orb.

**Expect:** In this order:

1. A New chip that names **Engineer** (or `Eng`) only — this landing.
2. The chip does **not** say `3 new` for three seats.
3. There is still **no** Hear / Hear it / Skip button.

**I saw:**

---

### C.3 Open Log and sit on that bubble

**Do:** Tap View log. Scroll until that Engineer bubble is fully on screen for two seconds. Read it.

**Expect:** That bubble is on the Log, in order. If a Stream ran for that dest, a card titled **Stream** sits **above** that completed Engineer bubble.

**I saw:**

---

### C.4 Voice after seeing it

**Do:** Return to Voice. Look under the orb.

**Expect:** The Engineer New chip is gone. Travis does not start reading that same Engineer post again. No Hear / Skip buttons.

**I saw:**

---

## D. His answer also marks seen

### D.1 Dest Engineer again

**Do:** Dest Engineer on the **same** ticket. Send exactly:

```
Put a one-line note on this ticket.
```

Stay on Voice until the seat posts.

**Expect:** New chip names Engineer only. No Hear / Skip buttons.

**I saw:**

---

### D.2 Answer in chat without opening that bubble as a long look

**Do:** Stay on Voice. Dest Travis. Send exactly:

```
Yes, stay on that same line.
```

Then look under the orb.

**Expect:** The Engineer New chip is gone. Travis does not read that Engineer post again as New.

**I saw:**

---

## E. Reply to a specific message

### E.1 Open the ticket

**Do:** Open that initiative. Open Messages.

**Expect:** You see, in order: the dest line(s) for this ticket, then the Engineer post(s) on this ticket. This is the same work as the Log, not an empty ticket.

**I saw:**

---

### E.2 Reply to the latest Engineer bubble

**Do:** On that Engineer bubble (Log or ticket), use the reply door. Dest Travis or Type. Send exactly:

```
Yes, stay on that same line.
```

**Expect:** Your new line is a **reply to that Engineer bubble**. It is on **this** ticket. It is not a new cousin initiative.

**I saw:**

---

### E.3 Ticket thread

**Do:** Open that initiative Messages again.

**Expect:** In order: dest line → Engineer post → your reply hanging on that Engineer post. The reply is not a floating new founding line.

**I saw:**

---

## F. Dest timeout still hangs the Stream card

### F.1 Dest Technical PM

**Do:** Dest **Technical PM** (not catalog `PM`). Pass the same ticket. Send exactly:

```
Put a one-line note on this ticket.
```

Stay on Voice. Watch the Stream.

**Expect:** Stream is live (glow / Stream compartment). The dest name is Technical PM. Catalog `PM` is not who you dest’d.

**I saw:**

---

### F.2 If the timed-out label appears

**Do:** If a Log line appears that says exactly `Technical PM timed out.` (or that person-label + ` timed out.`), write it. Stay in the room. Do not leave. Wait until a completed Technical PM bubble lands, or two minutes past the label.

**Expect:** If a completed Technical PM (or that person’s) bubble lands after the timeout line: a card titled **Stream** sits **above that completed bubble**. The card is not missing. The timeout line may stay. The card is not required to sit above the timeout line.

If no completed bubble ever lands, write that. Do not invent a card.

**I saw:**

---

## G. Refresh stays in the same place

### G.1 Mark the place

**Do:** On Log, scroll until a **specific** bubble is at the top of the screen. Write the first 8 words of that bubble here: ________  
Stay on Log. Talk or Type as it already is.

**Expect:** You are in room Travis, Log, that bubble on screen.

**I saw:**

---

### G.2 Pull to refresh

**Do:** Pull down to refresh (the same gesture that today kicks you to the rooms list), or reload the tab.

**Expect:** In this order:

1. You are **not** on the rooms list.
2. You are in room **Travis**.
3. You are on **Log** (not Voice).
4. Talk|Type is the same as before the refresh.
5. The same bubble (those first 8 words) is on screen — same place in the thread.

**I saw:**

---

## H. Technical PM, not catalog PM

### H.1 Dest list

**Do:** Open dest chips / roster.

**Expect:** A dest named **Technical PM**. No separate dest named `PM` for catalog `pm`.

**I saw:**

---

## I. Travis polishes the request

### I.1 Send a detailed line to Travis

**Do:** Dest Travis. Voice or Type. Send exactly:

```
Stay on packet 011. New is a landing after the cutoff. Do not plant Hear it or Skip buttons.
```

**Expect:** If Travis restates the request (receipt, dest text, or his next spoken/written line that is about what you asked): you can still hear/read those three points in your words, or a polish that keeps them. He does not replace the three sentences with one short paraphrase that drops “cutoff” or “Hear it or Skip buttons.”

**I saw:**

---

## J. Gist has no closer (spoken Hear only)

### J.1 Spoken Hear, if a New landing is up

**Do:** If a real New chip is showing, say exactly `Hear it`. Listen to the end.

**Expect:** Travis speaks the outcome. He does not then say `do not read`, `don't read`, `the full text is in the Log`, or `see the chat`.

If no New chip is showing, write `no New — skipped`.

**I saw:**
