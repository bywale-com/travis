import assert from "node:assert/strict";
import { test } from "node:test";
import {
  alignStreamedBeats,
  foldAssistantBeats,
  isOpenStreamingPost,
  nextDestSeatText,
  nextSeatBeat,
  postIsInRunChain,
} from "./beats";

test("three dest-seat messages stay three beats", () => {
  const beats = foldAssistantBeats([
    "First look at the log.",
    "Now the ticket door.",
    "Files hang on this beat.",
  ]);
  assert.deepEqual(beats, [
    "First look at the log.",
    "Now the ticket door.",
    "Files hang on this beat.",
  ]);
});

test("growing snapshots of one message stay one beat", () => {
  const beats = foldAssistantBeats([
    "Usually it’s elevated when it stops being",
    "Usually it’s elevated when it stops being a quick, one-off request",
  ]);
  assert.equal(beats.length, 1);
  assert.match(beats[0], /one-off request/);
});

test("conversation does not replay beats the stream already yielded", () => {
  const aligned = alignStreamedBeats(
    ["First look at the log.", "Now the ticket door.", "Files hang on this beat."],
    ["First look at the log.", "Now the ticket door.", "Files hang on this beat."],
  );
  assert.equal(aligned.beats.length, 3);
  assert.deepEqual(aligned.extra, []);
});

test("conversation can finish a partial first beat and add the rest", () => {
  const aligned = alignStreamedBeats(
    ["First look"],
    ["First look at the log.", "Now the ticket door.", "Files hang on this beat."],
  );
  assert.equal(aligned.beats.length, 3);
  assert.match(aligned.growLast ?? "", /at the log/);
  assert.equal(aligned.extra.length, 2);
});

test("conversation fallback does not re-glue three assistant steps", () => {
  const glued = foldAssistantBeats([
    "First look at the log.\n\nNow the ticket door.\n\nFiles hang on this beat.",
  ]);
  assert.equal(glued.length, 1);
  const split = foldAssistantBeats([
    "First look at the log.",
    "Now the ticket door.",
    "Files hang on this beat.",
  ]);
  assert.equal(split.length, 3);
});

test("token suffixes stay on the open beat; a new message inserts", () => {
  const grow = nextDestSeatText("Switch", "ing");
  assert.equal(grow.mode, "update");
  assert.equal(grow.text, "Switching");

  const snap = nextDestSeatText("Hi there.", "Hi there. More.");
  assert.equal(snap.mode, "update");
  assert.match(snap.text, /More/);

  const neu = nextDestSeatText("Hi there.", "Second thought.");
  assert.equal(neu.mode, "insert");
  assert.equal(neu.text, "Second thought.");
});

test("beat 1 quotes the user turn; later beats quote the last post", () => {
  const first = nextSeatBeat({
    current: null,
    incoming: "First look.",
    userTurnId: "user-1",
  });
  assert.equal(first.mode, "insert");
  assert.equal(first.referenceTurnId, "user-1");

  const grow = nextSeatBeat({
    current: { id: "eng-1", text: "First look." },
    incoming: "First look. At the log.",
    userTurnId: "user-1",
  });
  assert.equal(grow.mode, "update");

  const second = nextSeatBeat({
    current: { id: "eng-1", text: "First look. At the log." },
    incoming: "Now the ticket door.",
    userTurnId: "user-1",
  });
  assert.equal(second.mode, "insert");
  assert.equal(second.referenceTurnId, "eng-1");
});

test("only posts that quote back to this user turn are in the run", () => {
  const posts = new Map([
    ["eng-1", { id: "eng-1", referenceTurnId: "user-1" }],
    ["eng-2", { id: "eng-2", referenceTurnId: "eng-1" }],
    ["old", { id: "old", referenceTurnId: "user-0" }],
  ]);
  const parentOf = (id: string) => posts.get(id) ?? null;
  assert.equal(
    postIsInRunChain(posts.get("eng-2")!, "user-1", parentOf),
    true,
  );
  assert.equal(postIsInRunChain(posts.get("old")!, "user-1", parentOf), false);
});

test("the live overlay hides only the open beat", () => {
  assert.equal(
    isOpenStreamingPost({
      turnId: "eng-1",
      seatKey: "engineer",
      streamingPostIds: { engineer: "eng-2" },
    }),
    false,
  );
  assert.equal(
    isOpenStreamingPost({
      turnId: "eng-2",
      seatKey: "engineer",
      streamingPostIds: { engineer: "eng-2" },
    }),
    true,
  );
});
