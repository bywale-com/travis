# Hotfix 011 — Type send: clear now, paint now, don’t lock the box

**Number:** `011` — next engineer hotfix is `012`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived Type-mode smoke: line stays in the composer until the agent replies; lag before it hits the log; box locked so a second send cannot go).  
**When:** 2026-08-27  
**PR title shape:** `Hotfix 011 — composer send doesn’t wait on the run`

---

## Why (smoke)

Type send awaited the **whole Cursor stream** before clearing the field, and `busy` disabled the composer for that whole run. The user turn was inserted only after `agent.send` returned, so the log lagged.

That also blocked the 003 law: next line to a **free** seat should send now; same busy seat should queue.

## Cut

1. Clear the field (and chip) on submit. Restore only if the request fails.
2. Paint an optimistic user row in the log immediately; swap for the real turn on `matched`; drop it on `queued` / `retract`.
3. Do not hold `busy` / disable the composer for the run. Stream in the background.
4. Insert the user turn **before** the Cursor send so `matched` is not gated on `agent.send`. If that send then reports busy, retract the turn and enqueue.

## Must-not

- Do not mint tables.
- Do not change 003 barge/queue grain.
- Do not lock Type send behind done-phrase.
- Do not append PM/SA logs.

## Verify

1. Type send: field empty immediately; line in the log without waiting for the reply.
2. Same seat still running: second Type send queues (dashed row), composer free.
3. Other seat not running: second Type send goes now.
4. Voice Talk path unchanged.
