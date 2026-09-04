# Hotfix 071 — The addition hangs on the named ticket

**Number:** `071` — next engineer hotfix is `072`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived room `0e8875f8`, 20:38 UTC 2026-09-04).  
**When:** 2026-09-04  
**PR title shape:** `Hotfix 071 — the addition hangs on the named ticket`  
**Envelope:** [`ENVELOPE-TRAVIS-PASS-ON.md`](./ENVELOPE-TRAVIS-PASS-ON.md)

---

## Why

The founder asked to bundle **That’s fine.** plus the delete/complete addition and send it to SA.

Travis called the SA. The harness minted a **new** ticket from the last spoken line: **Yes, that's the exact one.** (`b0bca3aa`). **That’s fine.** was unchanged.

The send did not leave. No `user` turn to `sa`. No live run. No new person. No receipt. Role dest tried to spin; `Agent.create` throws and no row is written; the throw was not a receipt. Catalog SA sat idle with a Cursor id.

The founder still cannot see that SA received it — because they did not.

---

## Cut

- `send_to_seat` / `dispatch_to_seat` take optional `id`. That ticket gets the addition. Do not `insertOpen` from “yes that’s the one.”
- A throw on send/dispatch/spin is posted as the receipt.
- If spin fails, an idle catalog person of that role (same `seat_key`, has a Cursor id) can take the line. Receipt says they are not seated. Not a sit.

## Must-not

- Do not auto-sit catalog `pm` / `sa` / `engineer`.
- Do not send **That’s fine.** from this bind.
- Do not mint a table.
- Do not remint 015 / 069 / 070.

## Verify

`npm test`. Lived: dest Travis, “resend That’s fine. with the addition to SA.” One ticket. A receipt. A `user` turn to SA, or a named failure. Not a third title from the last spoken line.
