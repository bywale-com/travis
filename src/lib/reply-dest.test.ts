import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveTypedSend } from "./typed-dest";
import { authorDestKeyFromTurn, mergeReplyDestKeys } from "./reply-dest";

test("reply to an Engineer post dests Engineer", () => {
  const author = authorDestKeyFromTurn({
    kind: "agent_post",
    seatKey: "engineer",
  });
  assert.equal(author, "engineer");
  const decided = resolveTypedSend({
    chipSeatKeys: [],
    text: "Stay on that line.",
  });
  assert.deepEqual(mergeReplyDestKeys({ decided, authorKey: author }), [
    "engineer",
  ]);
});

test("reply to Engineer’s reply dests Engineer, not the first dest", () => {
  const author = authorDestKeyFromTurn({
    kind: "agent_post",
    seatKey: "engineer",
    // referenced row may itself point at a founder dest line — do not walk
  });
  assert.equal(author, "engineer");
  const decided = resolveTypedSend({
    chipSeatKeys: [],
    text: "Stay on that line.",
  });
  assert.deepEqual(mergeReplyDestKeys({ decided, authorKey: author }), [
    "engineer",
  ]);
  assert.equal(
    authorDestKeyFromTurn({ kind: "user", seatKey: "sa" }),
    null,
  );
});

test("reply to a user line does not dest from that row’s seat_key", () => {
  assert.equal(
    authorDestKeyFromTurn({ kind: "user", seatKey: "engineer" }),
    null,
  );
  const decided = resolveTypedSend({
    chipSeatKeys: [],
    text: "Stay on that line.",
  });
  assert.deepEqual(
    mergeReplyDestKeys({ decided, authorKey: null }),
    [],
  );
});

test("chips add dests and do not drop the author", () => {
  const decided = resolveTypedSend({
    chipSeatKeys: ["sa"],
    text: "Stay on that line.",
  });
  assert.deepEqual(
    mergeReplyDestKeys({ decided, authorKey: "engineer" }),
    ["engineer", "sa"],
  );
});

test("call-by-name adds; empty author seat_key is not a dest", () => {
  const decided = resolveTypedSend({
    chipSeatKeys: [],
    text: "hey sa stay on that line.",
  });
  assert.deepEqual(
    mergeReplyDestKeys({ decided, authorKey: "engineer" }),
    ["engineer", "sa"],
  );
  assert.equal(
    authorDestKeyFromTurn({ kind: "agent_post", seatKey: "  " }),
    null,
  );
});
