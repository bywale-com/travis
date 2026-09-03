import assert from "node:assert/strict";
import { test } from "node:test";
import {
  READBACK_RATE,
  applyReadbackVoice,
  pickMaleVoice,
  pickReadbackVoice,
  scoreReadbackVoice,
} from "./speak-voice";

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

test("named male still beats a network female", () => {
  const picked = pickReadbackVoice([
    { name: "Google US English", lang: "en-US", localService: false },
    { name: "Google UK English Male", lang: "en-GB", localService: true },
  ]);
  assert.equal(picked?.name, "Google UK English Male");
});

test("network Google US English beats the compact local copy", () => {
  const picked = pickReadbackVoice([
    { name: "Google US English", lang: "en-US", localService: true },
    { name: "Google US English", lang: "en-US", localService: false },
  ]);
  assert.equal(picked?.localService, false);
});

test("Natural / Enhanced outranks a bare local default", () => {
  const picked = pickReadbackVoice([
    { name: "Google US English", lang: "en-US", localService: true },
    { name: "English (US) Enhanced", lang: "en-US", localService: true },
  ]);
  assert.equal(picked?.name, "English (US) Enhanced");
});

test("a network voice scores above a local compact of the same name", () => {
  assert.ok(
    scoreReadbackVoice({
      name: "Google US English",
      lang: "en-US",
      localService: false,
    }) >
      scoreReadbackVoice({
        name: "Google US English",
        lang: "en-US",
        localService: true,
      }),
  );
});

test("readback lifts rate even when no voice is assigned", () => {
  const u = { rate: 1 } as SpeechSynthesisUtterance;
  applyReadbackVoice(u);
  assert.equal(u.rate, READBACK_RATE);
});
