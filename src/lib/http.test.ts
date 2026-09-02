import assert from "node:assert/strict";
import { test } from "node:test";
import { describeBadResponse, describeServerError, readJson } from "./http";

function res(body: string, status = 200, statusText = ""): Response {
  return new Response(body, { status, statusText });
}

test("a good body parses", async () => {
  const out = await readJson<{ session: null }>(res('{"session":null}'));
  assert.deepEqual(out, { session: null });
});

test("an empty 500 names the server, not the JSON parser", async () => {
  await assert.rejects(
    () => readJson(res("", 500)),
    (e: Error) => {
      assert.match(e.message, /Server error 500/);
      assert.doesNotMatch(e.message, /Unexpected end of JSON input/);
      return true;
    },
  );
});

test("an HTML error page is quoted back, not swallowed", async () => {
  await assert.rejects(
    () => readJson(res("<!DOCTYPE html><h1>Internal Server Error</h1>", 500)),
    (e: Error) => {
      assert.match(e.message, /did not return JSON \(500\)/);
      assert.match(e.message, /Internal Server Error/);
      return true;
    },
  );
});

test("a long body is trimmed so the banner stays readable", () => {
  const msg = describeBadResponse({ status: 502, body: "x".repeat(500) });
  assert.ok(msg.length < 220, `too long: ${msg.length}`);
  assert.match(msg, /…$/);
});

test("an empty 404 reads as empty, not as a server crash", () => {
  const msg = describeBadResponse({ status: 404, body: "" });
  assert.match(msg, /Empty response \(404\)/);
});

test("a missing env var says so plainly", () => {
  const msg = describeServerError(
    new Error("DATABASE_URL is not set on this deployment — add it in Vercel."),
  );
  assert.match(msg, /DATABASE_URL is not set/);
});

test("a drizzle query dump becomes a short database error", () => {
  const err = new Error(
    'Failed query: select "id", "seat_key", "label", "cursor_agent_id" from "travis"."agent_binding" where "seat_key" = $1 limit $2\nparams: pm,1',
  );
  (err as { cause?: unknown }).cause = new Error("connect ECONNREFUSED 127.0.0.1:5432");
  const msg = describeServerError(err);
  assert.match(msg, /^Database error — connect ECONNREFUSED/);
  assert.doesNotMatch(msg, /select "id"/, "no SQL on the phone banner");
  assert.ok(msg.length < 120);
});

test("a query dump with no cause still reads as a database error", () => {
  const msg = describeServerError(new Error("Failed query: select 1\nparams:"));
  assert.equal(msg, "Database error — the query did not complete.");
});

test("a long server error is trimmed", () => {
  const msg = describeServerError(new Error("y".repeat(600)));
  assert.ok(msg.length < 220);
  assert.match(msg, /…$/);
});
