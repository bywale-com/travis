# Hotfix 097 — Direct seat binding without mandatory protocol prompt

**Number:** `097` — next engineer hotfix is `098`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 097 — direct seat binding without mandatory protocol prompt`  
**Test:** [`HOTFIX-097-DIRECT-SEAT-BIND-TEST.md`](./HOTFIX-097-DIRECT-SEAT-BIND-TEST.md)  
**Builds on:** [`HOTFIX-096-BIND-NOT-CREATE.md`](./HOTFIX-096-BIND-NOT-CREATE.md)

---

## Why

When the founder binds an existing Cursor agent chat to a seat (e.g. `bc-…` to the Architect seat), the chat session is already established and already carries its own prompt and instructions.

In session `fdad2a1d-5f40-431c-bb6f-1db7d2a52f25`, binding `bc-6c937091-3703-4dd1-902a-ac3de85f66e4` to `Architect` ran into unnecessary complexity:
1. Travis assumed that binding to a seat required invoking `sit_agent` and sending a protocol file prompt over the wire (`WHERE.md` + `logging.md` + protocol).
2. `sit_agent` hardcoded a strict check rejecting any role other than `pm`, `sa`, or `engineer` (`"Sit only hangs pm, sa, or engineer."`).
3. Travis attempted to work around this by dynamically creating `/protocols/arch.md`, which still failed and left Travis stuck explaining why it couldn't seat the Architect.

Binding an existing chat should be simple: just attach the Cursor agent ID (`bc-…`) to the designated seat and add them to the room roster. No prompt or external protocol handoff should be necessary at the binding stage.

---

## Cut

1. **`src/server/travis-tools.ts` — `bind_agent` tool**:
   - Optional `seat_key` or `seat` parameter allowing direct assignment to a role or custom seat key (e.g., `seat_key: "architect"` or `seat_key: "pm"`).
   - If `protocol` is not provided, do **not** run `sitBinding` or dispatch any protocol prompt to the Cursor agent. The binding row is created/updated, added as an open room member, and marked ready immediately.
   - Clarify the tool description: binding an existing agent requires no prompt or protocol; it just maps the Cursor ID to the seat.

2. **`src/lib/protocol-path.ts` & `src/server/dest-resolve.ts`**:
   - Allow alias `"architect"` to map to the Technical Architect role (`pm` protocol `/protocols/pm.md` / `SIT_ROLE_LABEL.pm`).
   - If a seat is bound with an empty `protocol_path` (direct bind), role destination resolution should still allow routing to it as an open member of that seat rather than treating it as an error or attempting to force-sit it with an initial prompt.

3. **`src/server/create-agent.ts` — `bindAgentBinding`**:
   - Support updating/re-binding existing rows if a seat key is specified (e.g., binding the `bc-` ID directly to an existing seat).

---

## Must-not

- Do not mint new database tables.
- Do not make external HTTP calls or dispatch prompts to Cursor agents during a simple bind.
- Do not require `sit_agent` when a chat is already configured.
