import assert from "node:assert/strict";
import test from "node:test";
import { formatSeatReplyLead, staleSeatReplyPrefix } from "./seat-reply";

test("a ticket with no seat post is silence on that ticket", () => {
  assert.equal(
    formatSeatReplyLead({
      label: "SA",
      initiativeId: "e6e01962-7c02-4b29-b28b-f507fa3e641f",
      hasPost: false,
      postOnTicket: false,
      sentAfterPost: false,
    }),
    "SA has not posted on this ticket.",
  );
});

test("a send after the last post is not yesterday's essay", () => {
  assert.match(
    formatSeatReplyLead({
      label: "SA",
      hasPost: true,
      postOnTicket: false,
      sentAfterPost: true,
    }) ?? "",
    /No reply since the last send/,
  );
});

test("an empty room stays empty", () => {
  assert.equal(
    formatSeatReplyLead({
      label: "Engineer",
      hasPost: false,
      postOnTicket: false,
      sentAfterPost: false,
    }),
    "Engineer has not replied in this room yet.",
  );
});

test("a room-wide last line is labeled not a ticket", () => {
  assert.match(
    staleSeatReplyPrefix("SA"),
    /not a ticket read/,
  );
});
