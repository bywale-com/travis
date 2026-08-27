import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCallByName, seatKeyToShort } from "./router";

test("call-by-name accepts punctuation separator", () => {
  const r = parseCallByName("Engineer — pull the brief");
  assert.equal(r.seatKey, "engineer");
  assert.equal(r.remainder, "pull the brief");
});

test("call-by-name accepts spoken name + space (no dash)", () => {
  const r = parseCallByName("engineer can I see the engineer talking");
  assert.equal(r.seatKey, "engineer");
  assert.equal(r.remainder, "can I see the engineer talking");
});

test("call-by-name accepts Eng alias", () => {
  const r = parseCallByName("Eng, look at the stream");
  assert.equal(r.seatKey, "engineer");
  assert.equal(r.remainder, "look at the stream");
});

test("call-by-name does not match Engineering as Engineer", () => {
  const r = parseCallByName("Engineering the pipe I'm done");
  assert.equal(r.seatKey, null);
});

test("call-by-name does not steal a mid-sentence seat word", () => {
  const r = parseCallByName("can I see the engineer talking");
  assert.equal(r.seatKey, null);
  assert.equal(r.remainder, "can I see the engineer talking");
});

test("bare seat name switches with empty remainder", () => {
  const r = parseCallByName("Engineer");
  assert.equal(r.seatKey, "engineer");
  assert.equal(r.remainder, "");
});

test("seatKeyToShort matches plate chips", () => {
  assert.equal(seatKeyToShort("engineer"), "Eng");
  assert.equal(seatKeyToShort("pm"), "PM");
  assert.equal(seatKeyToShort("sa"), "SA");
});
