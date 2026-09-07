# Test spec — 080 Deep Agents must answer

**Hotfix:** [`HOTFIX-080-DEEPAGENTS-ESM.md`](./HOTFIX-080-DEEPAGENTS-ESM.md)  
**Desk:** the live Travis app — `https://travis-psi.vercel.app`  
**Room:** Travis  
**Mode:** Log · Type (also Voice or Talk once if Type passes).

Fill **I saw** on this step before the next.

**Pass** = a real line to Travis gets a Travis `agent_post`. Mute status / empty Log after the user line is a miss.

---

## A. A real line is answered

### A.1 Type one question

**Do:** Log. Type. Send (exact lived miss, or any short question):

```
what was the last thing we just you know I asked you a couple chats ago to do something what how was that what was that
```

**Expect:** In this order:

1. Your line is on the right.
2. Travis answers on the left (`agent_post`). Not silence.
3. No Log that only shows your line. No orange `Unexpected token '<'`.

**I saw:**

---

## B. A second send still answers

### B.1 Send once more

**Do:** Type another short line. Send.

**Expect:** Second `agent_post`. Not `Cannot use import statement outside a module` as the only record.

**I saw:**

---

## After

No Hear it / Skip **buttons**.

**Steps I could not do (human):** Talk on a phone.
