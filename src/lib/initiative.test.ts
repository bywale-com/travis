import assert from "node:assert/strict";
import test from "node:test";
import { canonicalPosts, deriveNext, litSeatKeys } from "./initiative";

test("next is the latest unanswered dest, not a stored pipeline", () => {
  const next = deriveNext({
    status: "open",
    legs: [
      { id: "u-pm", seq: 2, seatKey: "pm" },
      { id: "u-sa", seq: 5, seatKey: "sa" },
    ],
    posts: [{ referenceTurnId: "u-pm", seatKey: "pm" }],
  });
  assert.equal(next, "sa");
});

test("after every dest has a post, next is Travis while open", () => {
  const next = deriveNext({
    status: "open",
    legs: [{ id: "u-pm", seq: 2, seatKey: "pm" }],
    posts: [{ referenceTurnId: "u-pm", seatKey: "pm" }],
  });
  assert.equal(next, "travis");
});

test("done has no next", () => {
  assert.equal(
    deriveNext({
      status: "done",
      legs: [{ id: "u-pm", seq: 2, seatKey: "pm" }],
      posts: [],
    }),
    null,
  );
});

test("direct founder chat is not a dest leg", () => {
  const next = deriveNext({
    status: "open",
    legs: [{ id: "u-trv", seq: 1, seatKey: "travis" }],
    posts: [],
  });
  assert.equal(next, "travis");
});

test("lit seats are cursor posts only", () => {
  assert.deepEqual(
    litSeatKeys([
      { seatKey: "pm" },
      { seatKey: "travis" },
      { seatKey: "pm" },
      { seatKey: "engineer" },
    ]),
    ["pm", "engineer"],
  );
});

test("canonical post is the latest per seat", () => {
  const posts = canonicalPosts([
    { seatKey: "pm", seq: 3, referenceTurnId: "a" },
    { seatKey: "pm", seq: 8, referenceTurnId: "b" },
    { seatKey: "sa", seq: 5, referenceTurnId: "c" },
  ]);
  assert.equal(posts.length, 2);
  assert.equal(posts[0]?.seq, 5);
  assert.equal(posts[1]?.seq, 8);
  assert.equal(posts[1]?.referenceTurnId, "b");
});
