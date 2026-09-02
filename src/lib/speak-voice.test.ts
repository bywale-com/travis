import assert from "node:assert/strict";
import { test } from "node:test";
import { pickMaleVoice } from "./speak-voice";

test("picks a named male English voice", () => {
  const picked = pickMaleVoice([
    { name: "Google US English", lang: "en-US" },
    { name: "Google UK English Male", lang: "en-GB" },
    { name: "Google UK English Female", lang: "en-GB" },
  ]);
  assert.equal(picked?.name, "Google UK English Male");
});

test("skips female-named voices", () => {
  const picked = pickMaleVoice([
    { name: "Samantha", lang: "en-US" },
    { name: "Microsoft David - English (United States)", lang: "en-US" },
  ]);
  assert.equal(picked?.name, "Microsoft David - English (United States)");
});

test("returns null when no male name is available", () => {
  assert.equal(
    pickMaleVoice([{ name: "Google US English", lang: "en-US" }]),
    null,
  );
});
