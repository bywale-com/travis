import assert from "node:assert/strict";
import test from "node:test";
import {
  WINDOW_CHAR_CAP,
  buildRoomContext,
  describeTurn,
  isContextWorthy,
  shouldSummarize,
  trimToCap,
} from "./room-context";

test("thoughts never enter the window", () => {
  assert.equal(
    isContextWorthy({ kind: "agent_thought", text: "musing at length" }),
    false,
  );
});

test("routine status is dropped but an error is kept", () => {
  assert.equal(isContextWorthy({ kind: "status", text: "finished" }), false);
  assert.equal(isContextWorthy({ kind: "status", text: "error" }), true);
});

test("a seat reply becomes a receipt, not the reply", () => {
  const body = "x".repeat(40_000);
  const line = describeTurn(
    { kind: "agent_post", seatKey: "engineer", text: body },
    "Engineer",
  );
  assert.match(line, /Engineer replied \(40000 chars\)/);
  assert.match(line, /full text is in the room log/);
  assert.equal(line.length < 320, true, "receipt stays a receipt");
});

test("Travis's own line is kept as speech, not a receipt", () => {
  assert.equal(
    describeTurn(
      { kind: "agent_post", seatKey: "travis", text: "Sent to SA." },
      "Travis",
    ),
    "You said: Sent to SA.",
  );
});

test("a line sent to a seat reads as an outgoing send", () => {
  assert.equal(
    describeTurn({ kind: "user", seatKey: "sa", text: "demomessages" }, "SA"),
    "You sent to SA: demomessages",
  );
});

test("trim drops the oldest, never the newest", () => {
  const kept = trimToCap(["aaaa", "bbbb", "cccc"], 10);
  assert.deepEqual(kept, ["bbbb", "cccc"]);
});

/**
 * Lived 18:25 — Travis said "I don't have the two tasks you're referring to"
 * while both sends sat seconds old in the log.
 */
test("the window carries the two tasks Travis claimed not to have", () => {
  const out = buildRoomContext({
    turns: [
      {
        kind: "user",
        seatKey: "travis",
        seatLabel: "Travis",
        text: "Send two parallel messages to sa- demomessages",
      },
      {
        kind: "user",
        seatKey: "sa",
        seatLabel: "SA",
        text: "demomessages",
      },
      {
        kind: "agent_post",
        seatKey: "sa",
        seatLabel: "SA",
        text: "Here. SA got it.",
      },
      {
        kind: "user",
        seatKey: "sa",
        seatLabel: "SA",
        text: "demomessages",
      },
    ],
    running: [{ seatLabel: "SA", elapsedMs: 16_000 }],
  });
  assert.match(out, /Send two parallel messages/);
  assert.match(out, /You sent to SA: demomessages/);
  assert.match(out, /Running right now: SA \(16s so far\)/);
});

test("a long room costs no more than a short one", () => {
  const turns = Array.from({ length: 400 }, (_, i) => ({
    kind: "agent_post",
    seatKey: "engineer",
    seatLabel: "Engineer",
    text: `reply number ${i} `.repeat(500),
  }));
  const out = buildRoomContext({ turns });
  assert.equal(
    out.length < WINDOW_CHAR_CAP + 400,
    true,
    `window ran to ${out.length} chars`,
  );
});

test("an empty room produces no window at all", () => {
  assert.equal(buildRoomContext({ turns: [] }), "");
});

test("only the latest Travis line stays in the window", () => {
  const out = buildRoomContext({
    turns: [
      {
        kind: "agent_post",
        seatKey: "travis",
        seatLabel: "Travis",
        text: "Usually it’s elevated when it stops being a one-off.",
      },
      {
        kind: "user",
        seatKey: "travis",
        seatLabel: "Travis",
        text: "How does something get into the backlog?",
      },
      {
        kind: "agent_post",
        seatKey: "travis",
        seatLabel: "Travis",
        text: "Hold a line, or I pass it to a seat.",
      },
    ],
  });
  assert.match(out, /Hold a line/);
  assert.equal(out.includes("Usually it’s elevated"), false);
});

test("a named room is announced in the window", () => {
  const out = buildRoomContext({
    turns: [
      { kind: "user", seatKey: "travis", seatLabel: "Travis", text: "hi" },
    ],
    roomTitle: "Gang's all here",
  });
  assert.match(out, /This room is titled Gang's all here/);
});

test("the request-log pointer is how Travis learns the organ exists", () => {
  const out = buildRoomContext({ turns: [], requestCount: 12 });
  assert.match(out, /12 requests in the request log/);
  assert.match(out, /search_room/);
});

test("running seats show even when nothing has been logged", () => {
  const out = buildRoomContext({
    turns: [],
    running: [{ seatLabel: "Engineer", elapsedMs: 95_000 }],
  });
  assert.match(out, /Running right now: Engineer \(95s so far\)/);
});

test("a long reply is condensed unless the text is insisted on", () => {
  assert.equal(shouldSummarize(40_000, "auto"), true);
  assert.equal(shouldSummarize(40_000, "full"), false);
  assert.equal(shouldSummarize(80, "auto"), false);
  assert.equal(shouldSummarize(80, "gist"), true);
});
