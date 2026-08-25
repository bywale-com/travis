# PM packets — index

**Seat:** Product Manager.  
**Law:** Same as Om Coda Tower — PM packets live on **one reusable PR**. Do not open a new PR for every packet. Append the next numbered file on that branch / PR.

## Numbering

| Rule | Detail |
|------|--------|
| Format | `PM-PACKET-NNN-SLUG.md` (three-digit, zero-padded) |
| Next | Always `max(existing NNN) + 1`. **Never reuse** a number, even if a packet is abandoned. |
| On main | Index + FACE / plates / PLATE-READ may land on `main`. **Living packet bodies** stay on the PM packets PR until the founder merges. |

## Living PR

After the first packet PR is open, record it here and in [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **Current**:

- **PR:** [#1](https://github.com/bywale-com/travis/pull/1)  
- **Branch:** `pm/packets`  
- Fetch: `git fetch origin pull/1/head` then `git show FETCH_HEAD:docs/register/PM-PACKET-….md`

## Packets

| # | File | Pocket |
|---|------|--------|
| 001 | [`PM-PACKET-001-VOICE-SESSION.md`](./PM-PACKET-001-VOICE-SESSION.md) | Smartphone continuous voice session (v1 pipe) |
