# Test spec — 081 Voice uses the Type hang

**Hotfix:** [`HOTFIX-081-VOICE-DEEP-AGENTS.md`](./HOTFIX-081-VOICE-DEEP-AGENTS.md)  
**Desk:** the live Travis app — `https://travis-psi.vercel.app`  
**Room:** Travis  
**Mode:** Voice (Live). Dest Travis.

Fill **I saw** on this step before the next.

**Pass** = a spoken line to Travis is answered by the same hang as Type (Log gets an `agent_post`). Realtime searching the room as the only think is a miss.

---

## A. Voice answers through the hang

### A.1 Speak one line to Travis

**Do:** Voice. Dest Travis. Say:

```
Hey, Travis. What was the last fuller discussion we had?
```

**Expect:** In this order:

1. Your line is on the right.
2. Travis answers on the left (`agent_post`).
3. Stream process for that think is the Type hang (Deep Agents tools), not Live `search_room` as the only lookup.

**I saw:**

---

## B. Type still answers

### B.1 Type one short line

**Do:** Log. Type. Send `ok`.

**Expect:** Travis answers. No dest. No Hear it / Skip **buttons**.

**I saw:**

---

## After

Voice stays Live after the answer. A dest to Technical PM is a later walk, not this sheet.

**Steps I could not do (human):** Talk on a phone if this desk has no mic.
