# 029 — The room stays live

**PR:** [#144](https://github.com/bywale-com/travis/pull/144).  
**PM:** [`../../PM-PACKET-013-LIST-LIVE.md`](../../PM-PACKET-013-LIST-LIVE.md)  
**SA:** [`../../SYSTEMS-CHANGE-PACKET-029-LIST-LIVE.md`](../../SYSTEMS-CHANGE-PACKET-029-LIST-LIVE.md)

One session SSE while he is in the room. Connect resumes from last `seq`, then `LISTEN travis_room`. `insertTurn` and list/stream writes `NOTIFY`. Cheap backlog grain. Last good on drop. Poll is catch-up only while the wire is down. First 029 (smarter poll) is void. No websocket.

Planted on this PR. Do not remint 012 / 023 / 028. Do not mint a cousin.
