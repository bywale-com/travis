# Hotfix 042 — Travis says what it cannot do

## The smoke

Room `3c8be329`, 20:41. Founder: “got a new tune-up you do what can you do”.

Travis offered to review the final diff, check that mocks use OpenAI behaviour
rather than Gemini assumptions, confirm the test commands actually run in CI,
compare tokenization and structured output, and recommend a canary rollout with
monitoring and a rollback path.

It has nine tools. None of them can see a repository.

## Half of it was not a hallucination

Travis referenced the Gemini → OpenAI swap correctly. That room is from
2026-09-01 and its log holds the Engineer’s whole discussion of it, so 038’s
room window handed it that legitimately. Working as designed.

## Why the other half happened

038 gave Travis real engineering context for the first time — hotfixes, PRs,
CI, a provider swap — and `TRAVIS_SYSTEM` never said what it cannot do. More
material to reason about with no matching constraint produces confident
overreach. This is a direct and foreseeable consequence of 038, not a model
defect.

Note 040’s policy does not catch this class. That governs tool **calls**.
Overselling in prose is not a tool call, so no guard fires. The boundary has to
be stated, not enforced.

## The cut

`TRAVIS_SYSTEM` now names the boundary: no repository, no diff, no branch, no
test run, no CI, no way to check whether anything passed. If asked for a review
or a rollout plan, say plainly it cannot see it and offer to send it to a seat.
And the line that matters most: *reading about work in the room log is not the
same as being able to do it.*

## Verify

- `npm test` — 185 pass, three new in `travis-boundary.test.ts` asserting the
  boundary names each thing Travis cannot see, tells it to route repo work to a
  seat, and that no tool grants a view of the code.
