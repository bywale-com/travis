import assert from "node:assert/strict";
import test from "node:test";
import {
  catalogNeedleHits,
  clipInitiativeTitle,
  namedTicketFromSpeech,
  pathBasename,
} from "./initiative-title";

test("empty founding is an empty title", () => {
  assert.equal(clipInitiativeTitle(""), "");
  assert.equal(clipInitiativeTitle("   \n\t  "), "");
});

test("a short first sentence is the title, period kept", () => {
  assert.equal(clipInitiativeTitle("Hear queue / New."), "Hear queue / New.");
  assert.equal(
    clipInitiativeTitle("Search grain. Then the rest of the paragraph."),
    "Search grain.",
  );
});

test("whitespace flattens before the sentence cut", () => {
  assert.equal(
    clipInitiativeTitle("  Output   types\nplease  "),
    "Output types please",
  );
});

test("a long sentence word-breaks before 40 if the space is after 12", () => {
  const raw =
    "Send this to the Engineer and get the artifact door planted.";
  const title = clipInitiativeTitle(raw);
  assert.ok(title.length <= 40, title);
  assert.ok(!title.endsWith(" "), title);
  assert.equal(title, "Send this to the Engineer and get the");
  assert.notEqual(title, raw);
});

test("a long token with no safe break is hard-capped", () => {
  const raw = "A".repeat(50);
  assert.equal(clipInitiativeTitle(raw), "A".repeat(40));
});

test("a space in the first 12 characters does not break there", () => {
  const raw = "Hi " + "x".repeat(50);
  const title = clipInitiativeTitle(raw);
  assert.equal(title.length, 40);
  assert.equal(title.startsWith("Hi "), true);
});

test("q hits any part; empty q matches all; miss matches none", () => {
  const parts = ["Artifact door", "founding line about silence", "HEAR-QUEUE-SPEC"];
  assert.equal(catalogNeedleHits("artifact", parts), true);
  assert.equal(catalogNeedleHits("HEAR-QUEUE", parts), true);
  assert.equal(catalogNeedleHits("no-such", parts), false);
  assert.equal(catalogNeedleHits("", parts), true);
  assert.equal(catalogNeedleHits("  ", parts), true);
});

test("SAE and essay mean SA and hit systems analyst in the founding", () => {
  const parts = [
    "That's fine.",
    "it's probably the systems analyst that should handle this",
  ];
  assert.equal(catalogNeedleHits("SAE", parts), true);
  assert.equal(catalogNeedleHits("the essay", parts), true);
  assert.equal(catalogNeedleHits("SA", parts), true);
});

test("path basename is the file name", () => {
  assert.equal(pathBasename("artifacts/HEAR-QUEUE-SPEC.md"), "HEAR-QUEUE-SPEC.md");
  assert.equal(pathBasename("shot.png"), "shot.png");
});

test("send text that names That’s fine. hangs on that ticket, not the last line", () => {
  const tickets = [
    { id: "fine", title: "That's fine." },
    { id: "yes", title: "Yes, that's the exact one." },
  ];
  assert.equal(
    namedTicketFromSpeech(tickets, [
      "Please take this initiative. Base request: 'That's fine.' Add delete.",
    ]),
    "fine",
  );
});

test("the last named title in Travis speech is the ticket", () => {
  const tickets = [
    { id: "ok", title: "Okay, great." },
    { id: "fine", title: "That's fine." },
  ];
  assert.equal(
    namedTicketFromSpeech(tickets, [
      "Okay, great. is older.",
      "Yes — That's fine. is the one.",
    ]),
    "fine",
  );
});

test("a short title does not steal the hang", () => {
  assert.equal(
    namedTicketFromSpeech([{ id: "sa", title: "SA" }], ["send this to SA"]),
    null,
  );
});

test("no named title means no hang", () => {
  assert.equal(
    namedTicketFromSpeech(
      [{ id: "fine", title: "That's fine." }],
      ["Yes, that's the exact one."],
    ),
    null,
  );
});
