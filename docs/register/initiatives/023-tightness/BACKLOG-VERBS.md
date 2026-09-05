# Findings — backlog verbs (hung on 023)

**Initiative:** this pocket ([#123](https://github.com/bywale-com/travis/pull/123)). **Not a new ticket.**  
**Request:** the combined hand — look at every control the founder can touch, then the obvious verbs (delete / complete / …). That work leaves through Travis, or it does not leave. Founder completes inside Travis.  
**Seat:** Systems Analyst. Look only at the face + the store. Not a plant. Not packet **024** unless the founder seats a cut.

023 gate already says complete / delete / rename are **his**. This file names the pile.

---

## Stood up (quote, do not remint)

| Verb | Store | Founder glass | Travis | Seat |
|------|--------|---------------|--------|------|
| **Hold** (line → ticket) | `holdInitiative` · `source=hold` | Yes — Hold on a founder line | Pass-on harness stamps `via_travis` | No |
| **List / read** | `initiative` `open` \| `done` | Backlog index + ticket | `list_initiatives` / `read_initiative` | No |
| **Rename** | `renameInitiative` · PATCH `title` | **No control** (API exists) | `rename_initiative` when they ask | No |
| **Complete** | `markInitiativeDone` · PATCH `status=done` · `done_at` | **No control** (API exists) | `mark_initiative_done` | **No.** A seat post does not close it. |
| **Discard / delete** | **None.** Status cannot be anything but `open` \| `done`. | No | No | No |
| **Reopen** | **None.** `Already done` is 409. | No | No | No |

Here lists **open** titles only. `list_initiatives` default is open. A seat finishing a `dest_job` is a receipt, not ticket done (023).

---

## Who may write

| Who | Complete | Discard | Reopen | Rename | Hold |
|-----|----------|---------|--------|--------|------|
| **Founder** (operator, this room) | Yes | Yes | Yes | Yes | Yes |
| **Travis** (when they ask) | Yes | Yes | Yes | Yes | No — harness pass-on only |
| **Seated PM / SA / Engineer** | No | No | No | No | No |
| **Catalog / unseated slug** | No | No | No | No | No |

HTTP stays `requireOwnedSession`. Travis tools stay session-scoped. Dest seats never get these tools. Gate: mailing “complete/delete this ticket” to a role is **his** — refuse send.

---

## Capabilities (practical)

### 1. Complete — already a write, missing on the face

Founder taps **Done** on the ticket (quiet, one loud action). Same write as `mark_initiative_done`. Already done → say so, do not mint a cousin.

Travis does it when they ask (“close That’s fine.”). He does **not** close because a seat replied, a motion finished, or a prove succeeded.

### 2. Discard — accidental ticket (the hole)

**Done is the wrong verb.** Done means the pipe finished. An accidental Hold or a mistaken `via_travis` mint is not finished work.

**Rule**

- **Unused** (no dest `user` turn and no dest `agent_post` stamped on that id): **discard** — delete the row, **unstamp** `founding_turn_id` so the line is a request again. Not done. Not in Here.
- **Used** (any dest post or dest user line): refuse discard. “This ticket already has work. Mark it done, or keep it.” History does not vanish.

Who: founder + Travis when they ask. New tool `discard_initiative` + DELETE or PATCH that runs the same function. No `void` status this cut — two statuses stay `open` \| `done`. Unused delete is enough for “I didn’t mean to Hold that.”

### 3. Reopen — accidental Done (mirror)

Founder / Travis. `open`, `done_at` null. Ticket returns to Here. Seats do not reopen.

### 4. Rename — already a write, missing on the face

Founder can retitle on the ticket (or spoken). Travis only when they ask. Does not rewrite the founding line.

### 5. Hold stays the only promote

A request becomes a ticket by founder Hold or Travis pass-on. Travis does not invent elevation. He does not Hold from a tool. Direct-to-seat stays off the pile (already).

### 6. Do not add

| Temptation | Why not |
|------------|---------|
| Priority / stages / Lit as a store | Derived. 008 is `open` \| `done`. |
| Assignee field | `next` is derived from turns. |
| Merge / cousin tickets | 019: named ticket wins; do not mint a cousin. |
| Seat self-complete | “A seat finishing does not mark it done.” |
| Delete a request line | That is a `voice_turn`. Not this pile. |
| Archive vs done | Second “done.” Refuse. |
| Soft-delete table / `void` | Not needed if unused discard + used refuse. |

---

## Expected behavior

- Accidental Hold, unused → discard. Line is a request again. Here drops the title.
- Accidental complete → reopen. Here shows it again.
- Accidental ticket that already went to a seat → cannot discard. Complete when the work is actually finished, or leave it open.
- “Delete That’s fine.” after SA was sent → **used** → refuse discard. Founder completes when they are done with the ticket.
- Spoken “close it” / “that one is done” → Travis `mark_initiative_done` with the named id/title (070 glance).
- Spoken “I didn’t mean to add that” on an unused row → `discard_initiative`.
- Mailing SA or Engineer to complete or delete → dest gate **his**. He does it.

---

## Glass (if a later cut plants)

Ticket: quiet **Done** · **Discard** only when unused (or hidden when used) · retitle. One loud action per beat. Index stays the living pile — no equal action bars on every row.

Do not generate a verbs plate. Voice / Log / Backlog already exist.

---

## Plant (not this file)

023 plant order stays gate + card + `dest_job`. These verbs are **his** for that gate. A slim follow-on (hotfix or **024**) plants discard + reopen + Done on the ticket. Do not remint 008 statuses except the unused delete. Do not remint `travis.port` or `dest_job` from this note.
