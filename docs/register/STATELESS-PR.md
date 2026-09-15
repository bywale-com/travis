# Stateless PR — work that does not trip the house

**Seat:** any.  
**Canon:** this file. Find it from the repo [`README.md`](../../README.md), [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md), and [`PR-AUTOMATION-RULES.md`](./PR-AUTOMATION-RULES.md).  
**Lived:** [#197](https://github.com/bywale-com/travis/pull/197) (quiet merge, no seats, no preview). [#196](https://github.com/bywale-com/travis/pull/196) (notes cousin) is what we park against.

**Stateless** means this pull request is **agnostic of automations** until the founder triggers it. No seat wakes. No preview. No dest canary against psi. The PR may stay open so we do not forget. Merge is not required.

This is the same class of process as plates: [`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md). Generation and reading are two jobs. **Parking** and **Path A get-go** are two jobs. Do not mix them.

---

## How to stay stateless

### Do

1. Keep the PR **draft**.
2. If there is a packet, the Wake line is exactly:

   ```text
   **Wake:** hold
   ```

   or there is no Wake line. Never `**Wake:** sa`.
3. Optional human tell on the packet (Action does not grep this):

   ```text
   **Stateless:** park
   ```

4. Docs, plates, packet, test sheet, Phase One log, house process — yes.
5. Title is **not** `Hotfix NNN — …`.
6. Leave a park packet **open**. Merge only when the founder says this pocket belongs on `main` (house law like this file). Do not merge a park just to tidy.

### Don't

- Flip `**Wake:** sa`
- Push `SYSTEMS-CHANGE-PACKET-*.md`
- Push a brand-new `HOTFIX-NNN-*.md`
- Push `src/` or `docs/register/ENGINEER-HANDOFF.md` on a PR that already has a packet or a hotfix file (that is plant-finished → `previewing` → doors → dest to the living Engineer)
- Add labels: `wake-sa`, `wake-engineer`, `fail-look`, `preview`, `previewing`, `emerge`, `outside-look` (or `blocker` unless it is a real blocker)
- Run `npm run test:preflight` or `test:runtime` against production psi from this sitting
- Ask SA or Engineer to pick it up
- Mint a cousin because a second seat sat

### Quiet house cut (merge without a pocket)

When the founder wants a cut on `main` *now* and no seat: Type 3 regular PR. No new packet with `**Wake:** sa`. No new hotfix file. No `ENGINEER-HANDOFF.md`. `src/` only if this PR has **neither** a packet **nor** a hotfix file — then plant-finished does not green-light. Merge yourselves. Do not wait for doors.

### Leave the park

Founder says go. Architect removes `**Stateless:** park` and flips `**Wake:** sa`. That is Path A in [`BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md). Not this file.

---

## Seats

| Seat | While park |
|------|------------|
| **Technical Architect** | Spec only. Stamp the Phase One log. Do not plant. Do not merge the park packet. |
| **Systems Analyst** | Do not sign an SCP. |
| **Engineer** | Do not plant. Do not touch the handoff. Do not dest. |

---

## Specified and clear

Draft. Wake hold. No SCP. No hotfix file. No handoff. No plant-finished `src/` on a packet PR. No seat labels. Park stays open until the founder triggers.

## Specified but not clear (name; do not invent)

Missing founder go is not a license to Wake sa “so someone starts.” Missing a store is still SA — after go, not while park.
