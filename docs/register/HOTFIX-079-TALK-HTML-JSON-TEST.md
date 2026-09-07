# Test spec — 079 Talk HTML as JSON

**Hotfix:** [`HOTFIX-079-TALK-HTML-JSON.md`](./HOTFIX-079-TALK-HTML-JSON.md)  
**Desk:** the live Travis app — `https://travis-psi.vercel.app`  
**Room:** Travis  
**Mode:** Voice once, Log · Talk (the screenshot), Log · Type once. Sending anything to Travis was the miss.

Fill **I saw** on this step before the next.

---

## A. Talk send does not show the parser line

### A.1 Send a short line

**Do:** Log. Talk. Listening. Say a short line that sends (conductor). Do not dest a seat.

**Expect:** In this order:

1. Your line is on the right, or Travis answers.
2. The orange banner does **not** say `Unexpected token '<'` or `is not valid JSON`.
3. If something failed, the banner names a status or a real error, not a JSON parse of `<!DOCTYPE`.

**I saw:**

---

## B. Type send

### B.1 Type a short line

**Do:** Log. Type. Send one short line to Travis.

**Expect:** Same as A: send works, or the banner is a named failure, not `Unexpected token '<'`.

**I saw:**

---

## C. Voice send

### C.1 One line on Voice

**Do:** Voice. Send a short line to Travis.

**Expect:** Same as A. Banner is not `Unexpected token '<'`.

**I saw:**

---

## After

No Hear it / Skip **buttons**.

**Steps I could not do (human):** Talk on a phone.
