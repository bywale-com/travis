# Hotfix 062 — Artifacts land in the log

**Number:** `062` — next engineer hotfix is `063`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: prioritize output types; route files and images back to the user side).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 062 — artifacts land in the log`

---

## Why

009 hung Cursor files on a stamped `agent_post`. 057 showed them on the ticket Artifacts door. The Log thread stayed text. Flagship: images appear in the chat. Lived: “those things don’t get routed back to us.”

## Cut

- `GET /api/session/:id/turns` includes hung attachments on each turn.
- Log renders them under the post: image inline, file as a quiet name. Same `/api/artifacts/:id` proxy.
- `http(s)` in an agent post is tappable. Still text. No link row.

Same `turn_artifact`. Same kinds: `image` | `file`. Out-of-ticket posts still get nothing (009).

## Must-not

- Do not mint `link` or a structured kind. SA named those silence.
- Do not hang files on a post with no ticket.
- Do not store bytes or the 15-minute URL.
- Do not Google-read a file. 051 stands.
- Do not append the PM or SA logs.

## Verify

`npm test`. A ticketed seat post that hung a png shows the image in Log, not only on the ticket. A markdown URL in the post is a link. A file name downloads through the proxy.
