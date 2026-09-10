# Test spec — 020 Runtime verification

**Packet:** [`PM-PACKET-020-RUNTIME-VERIFY.md`](./PM-PACKET-020-RUNTIME-VERIFY.md)  
**Desk:** this PR’s preview, or the live Travis app if the preview has no key and the sheet says so.  
**Viewport:** phone, or 430×932.  
**Mode:** Engineer proof first. Your walk is “do I like it.”

Fill **I saw** on this step before the next.

**Pass** = this deploy’s Deployment Check (`runtime-doors`, or the name SA ascribes) is green because **every sequential walk** ran on that URL; you did not have to find a 500.  
**Pass from `src/` only is a miss.**  
**A Cursor agent who only read Vercel logs is a miss.**  
**Four disconnected door POSTs that never waited on one room are a miss.**  
**You being the first person to see “Live is down — phone ear” is a miss.** The glass walk in `test:runtime` had to fail first.

---

## Before

Open the **Engineer handoff** on this PR. It must name: preview URL, deploy id, **Deployment Check name + green**, `npm test`, and which **walks** were added or extended. The check is the proof the **whole** walk suite ran on that URL.

**I saw:**

---

## A. Unwired is named

### A.1 Preview without a key (if that is this desk)

**Do:** Voice. Dest Travis.

**Expect:** Glass says Travis isn’t wired. It does **not** say `Travis Live is down — phone ear. Say “I’m done”.`

**I saw:**

---

## B. Wired Live does not need “I’m done”

### B.1 Voice on a wired desk

**Do:** Live Travis app or a preview that has the OpenAI key. Voice. Dest Travis. Speak a short line. Do not say you’re done.

**Expect:** Live is the ear. You do not need “I’m done” to send. No phone-ear subtitle.

**I saw:**

---

## C. Type still works

### C.1 One line

**Do:** Log · Type. Send `One-line note on the tape.`

**Expect:** A Travis reply. No HTML-as-JSON banner.

**I saw:**

---

## After

You walked to see if you like it. The breaks were already the Engineer’s — including the subtitle. The letter’s recording is this packet’s walk, not the whole suite.

**Steps I could not do (human):** Talk on a phone. Paying Cursor. SSO.
