# 015 — Disposable seats (sit + busy→next)

**PR:** [#107](https://github.com/bywale-com/travis/pull/107)  
**Envelope:** [`../../ENVELOPE-DISPOSABLE-SEATS.md`](../../ENVELOPE-DISPOSABLE-SEATS.md)  
**Packet:** [`../../SYSTEMS-CHANGE-PACKET-015-DISPOSABLE-SEATS.md`](../../SYSTEMS-CHANGE-PACKET-015-DISPOSABLE-SEATS.md)

Seated = `agent_binding.protocol_path`. Empty at create. Sit hangs `/protocols/pm.md` \| `sa.md` \| `engineer.md` and hands WHERE + logging + that file. Role dest reuses the oldest idle seated of that path, or spins. Never enqueue. `who` may still queue. House `/logs` dir. No `seat_log` table.

Cousins that should have been this PR: envelope [#105](https://github.com/bywale-com/travis/pull/105), SA [#106](https://github.com/bywale-com/travis/pull/106).
