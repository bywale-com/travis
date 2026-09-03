import assert from "node:assert/strict";
import test from "node:test";
import {
  catalogNeedleHits,
  clipInitiativeTitle,
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

test("path basename is the file name", () => {
  assert.equal(pathBasename("artifacts/HEAR-QUEUE-SPEC.md"), "HEAR-QUEUE-SPEC.md");
  assert.equal(pathBasename("shot.png"), "shot.png");
});
