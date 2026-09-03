import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCallByName, parseDeadManResponse, seatKeyToShort } from "./router";

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

test("hey engineer is a vocative to Engineer and still sends", () => {
  const r = parseCallByName("hey engineer");
  assert.equal(r.seatKey, "engineer");
  assert.equal(r.remainder, "hey engineer");
});

test("hey engineer plus a prompt keeps the prompt", () => {
  const r = parseCallByName("hey engineer look at the stream");
  assert.equal(r.seatKey, "engineer");
  assert.equal(r.remainder, "look at the stream");
});

test("trailing vocative switches — lived smoke ending in engineer", () => {
  const r = parseCallByName(
    "testing to see if everything works correctly now engine engineer",
  );
  assert.equal(r.seatKey, "engineer");
  assert.equal(
    r.remainder,
    "testing to see if everything works correctly now engine engineer",
  );
});

test("trailing the engineer is a noun, not a call", () => {
  const r = parseCallByName("that's a job for the engineer");
  assert.equal(r.seatKey, null);
});

test("spoken p.m. at the end is PM", () => {
  const r = parseCallByName("this next bit is for you p.m.");
  assert.equal(r.seatKey, "pm");
});

test("dead-man no switches to default", () => {
  const r = parseDeadManResponse("No.");
  assert.equal(r.action, "default");
});

test("dead-man no SA switches seat", () => {
  const r = parseDeadManResponse("no, SA");
  assert.equal(r.action, "seat");
  assert.equal(r.seatKey, "sa");
});

test("dead-man ignores a real turn so it can still send", () => {
  const r = parseDeadManResponse("engineer look at the stream");
  assert.equal(r.action, "ignore");
});

test("seatKeyToShort matches plate chips", () => {
  assert.equal(seatKeyToShort("engineer"), "Eng");
  assert.equal(seatKeyToShort("pm"), "PM");
  assert.equal(seatKeyToShort("sa"), "SA");
  assert.equal(seatKeyToShort("travis"), "Travis");
  assert.equal(seatKeyToShort("auth-engineer", "Auth Engineer"), "Auth Engin…");
});

test("hey Travis is a vocative", () => {
  const r = parseCallByName("hey Travis");
  assert.equal(r.seatKey, "travis");
});

test("okay travis plus a prompt keeps the prompt", () => {
  const r = parseCallByName("okay travis what's queued");
  assert.equal(r.seatKey, "travis");
  assert.equal(r.remainder, "what's queued");
});

test("bare Travis is switch-only", () => {
  const r = parseCallByName("Travis");
  assert.equal(r.seatKey, "travis");
  assert.equal(r.remainder, "");
});
