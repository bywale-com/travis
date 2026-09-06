import assert from "node:assert/strict";
import test from "node:test";
import {
  gistEmptyFallback,
  offerBeat,
  offerContext,
  offerSeatWord,
  parseHearInvite,
} from "./offer";

test("seat word is Engineer / Technical PM / SA or the binding label", () => {
  assert.equal(offerSeatWord("engineer"), "Engineer");
  assert.equal(offerSeatWord("pm"), "Technical PM");
  assert.equal(offerSeatWord("sa"), "SA");
  assert.equal(offerSeatWord("other", "Pat"), "Pat");
  assert.equal(offerSeatWord("technical-pm", "Technical PM"), "Technical PM");
});

test("context is the title or that other thing", () => {
  assert.equal(offerContext("Serve plates"), "Serve plates");
  assert.equal(offerContext(""), "that other thing");
  assert.equal(offerContext(null), "that other thing");
});

test("one landing with a title", () => {
  assert.equal(
    offerBeat([{ seatKey: "engineer", title: "Serve plates" }]),
    "About Serve plates, this is what the Engineer has to say. Hear it?",
  );
});

test("one landing with no ticket", () => {
  assert.equal(
    offerBeat([{ seatKey: "sa" }]),
    "About that other thing, this is what the SA has to say. Hear it?",
  );
});

test("two seats coalesce into one Hear it", () => {
  assert.equal(
    offerBeat([
      { seatKey: "engineer", title: "Serve plates" },
      { seatKey: "sa", title: "Serve plates" },
    ]),
    "About Serve plates, this is what the Engineer and the SA have to say. Hear it?",
  );
});

test("Hear / Skip / verbatim are invites; chatter is not", () => {
  assert.equal(parseHearInvite("Hear it?"), "hear");
  assert.equal(parseHearInvite("next"), "hear");
  assert.equal(parseHearInvite("Skip."), "skip");
  assert.equal(parseHearInvite("read it"), "verbatim");
  assert.equal(parseHearInvite("What's on that ticket?"), null);
});

test("empty gist is the offer once, no closer", () => {
  assert.equal(
    gistEmptyFallback(
      "About Serve plates, this is what the Engineer has to say. Hear it?",
    ),
    "About Serve plates, this is what the Engineer has to say. Hear it?",
  );
  assert.equal(gistEmptyFallback(""), "Hear it?");
  assert.doesNotMatch(gistEmptyFallback("Hear it?"), /full text|do not read/i);
});
