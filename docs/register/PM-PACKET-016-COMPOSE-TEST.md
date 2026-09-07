# Test spec — 016 Compose the send harness

**Packet:** [`PM-PACKET-016-COMPOSE.md`](./PM-PACKET-016-COMPOSE.md)  
**Desk:** `https://travis-psi.vercel.app`  
**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`)  
**Viewport:** phone, or 430×932.  
**Mode:** **Log** · **Type**. Do not start on Voice.

Fill **I saw** on this step before the next.

**Pass** = a Type send still answers, and the process around the model is the adopted kit (named in SCP-032), not a new Travis-designed engine. Dest still carries ask + print (015).  
**Pass from `src/` only is a miss.**

---

## Before

Open the live Travis app. Enter Travis. Log. Type.

Cheap sentence (exact):

```
ok
```

Dest sentence (exact — 015 / 907 wording):

```
every initiative and idea we've discussed in this chat, I would like to send that alongside prompting them as well, the technical PM, to list out every idea and initiative we've discussed that hasn't yet been implemented.
```

---

## A. A send still answers

### A.1 Type ok

**Do:** Type the cheap sentence. Send. Do not dest.

**Expect:** In this order:

1. Your `ok` is on the right.
2. Travis answers on the Log.
3. Stream (if you open it) shows the adopted kit’s process for this send — not a cousin six-step we authored as the main loop, and not a phrase-gate classifier.

**I saw:**

---

## B. Dest mail is still 015

### B.1 Send the alongside line

**Do:** Type the dest sentence. Send. Do not hard refresh.

**Expect:** In this order:

1. A dest to Technical PM leaves.
2. Dest body contains the ask and the print of this chat.
3. He does not create Technical PM.

**I saw:**

---

## After

Voice: no Hear it / Skip **buttons**.

**Steps I could not do (human):** Talk on a phone. Reading the vendor bill. Dest landing on a live Technical PM bind.
