# Initiatives — one PR, one folder

An **initiative** here is a pocket of work (014, 015, …). It is **not** a Backlog `travis.initiative` row.

**One GitHub pull request is the door.** Engineer usually opens it. Every seat that writes — SA, Engineer, a passer — commits on that branch. When the pocket is done, that PR merges or it closes. Nothing stays open as “maybe later.”

Hotfixes are their own initiative-shaped cuts. They already have [`../HOTFIX-NNN-*.md`](../HOTFIXES.md). They **get merged**. Do not park them.

## Roles of the same PR

These names are jobs, not extra pull requests.

| Name | When |
|------|------|
| **Envelope** | Someone is creating a pass-on for another seat. Lands as commits on the PR. |
| **Packet** | Spec the next seat can cut (PM face, or SA machine). Same PR. |
| **Pocket** | Engineer is planting, then merging. Same PR. |

## Folder

`docs/register/initiatives/<nnn>-<slug>/README.md`

A little context: what the pocket was, what changed, the PR. Point at the packet / envelope / plant. Do not recut the packet here.

| # | Folder | PR |
|---|--------|-----|
| 014 | [`014-log-beats/`](./014-log-beats/) | [#104](https://github.com/bywale-com/travis/pull/104) (landed via [#107](https://github.com/bywale-com/travis/pull/107)) |
| 015 | [`015-disposable-seats/`](./015-disposable-seats/) | [#107](https://github.com/bywale-com/travis/pull/107) |
| 016 | [`016-here/`](./016-here/) | [#112](https://github.com/bywale-com/travis/pull/112) |
| 017 | [`017-hand/`](./017-hand/) | [#114](https://github.com/bywale-com/travis/pull/114) |
| 018 | [`018-glance/`](./018-glance/) | [#115](https://github.com/bywale-com/travis/pull/115) |
| 019 | [`019-pass-on/`](./019-pass-on/) | [#116](https://github.com/bywale-com/travis/pull/116) |
| 020 | [`020-box/`](./020-box/) | this PR |

## Must-not

- A second PR because SA sat, or because an envelope exists.
- A folder that is a second SA log or a second packet.
- Leaving leftover drafts of a planted pocket open on purpose.

Next folder number follows the packet number. Do not reuse.
