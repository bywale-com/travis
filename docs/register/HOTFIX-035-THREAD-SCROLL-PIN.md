# Hotfix 035 — The log holds still when you scroll up

## The complaint

You cannot read anything above the newest turn. Scroll up and the thread yanks
back to the bottom.

## Why

`Room` followed the newest turn unconditionally:

```ts
useEffect(() => {
  logEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [turns, draft, streamingPosts, liveStatus]);
```

Nothing asked where you were. Turns poll every 4s and `streamingPosts` changes
on every `post_delta`, so during a live Cursor run that effect fires constantly.
Scrolling up was unwinnable — the next delta dragged you back mid-sentence.

## The cut

Follow the newest turn **only while you are already at the bottom**.

- `src/lib/thread-scroll.ts` — `isPinnedToBottom` with a 48px tolerance, so
  sub-pixel rounding and iOS overscroll still count as reading the latest.
- `Room` tracks pinned state from the thread pane's own scroll events. Scroll up
  past the tolerance and the follow stops. Scroll back down and it resumes.
- Programmatic follow sets `scrollTop = scrollHeight` instead of a smooth
  `scrollIntoView`. Our jump always lands exactly at the bottom, so any scroll
  event reporting otherwise is unambiguously your thumb — no flag needed to tell
  our own animation apart from a real gesture. It also drops the smooth
  animation that was re-triggering on every streamed token.
- Switching into Log (or between Talk and Type) re-pins to the bottom.

## The way back

While unpinned, one quiet **Jump to latest** text button sits between the thread
and the composer. No badge, no unread count, no border — it is not there at all
until you scroll up.

## Surface registry

`SurfaceBoundary` now forwards `ref` and `onScroll`, so the `thread` surface keeps
its boundary instead of growing an untracked inner scroll div.

## Verify

- `npm test` — 135 pass, six of them new in `thread-scroll.test.ts` (bottom,
  within tolerance, scrolled up, overscroll, short thread, custom tolerance).
- On the phone: open Log during a live Engineer run, scroll up mid-stream. The
  log stays where you put it while posts keep landing. Tap **Jump to latest** or
  scroll back down and it follows again.
