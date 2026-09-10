import assert from "node:assert/strict";
import test from "node:test";
import { assertNotHtml, contentKind, isHtmlBody } from "./not-html";

test("a Next error page is HTML", () => {
  assert.equal(isHtmlBody("<!DOCTYPE html><h1>Internal Server Error</h1>"), true);
});

test("JSON is not HTML", () => {
  assert.equal(isHtmlBody('{"wired":false}'), false);
});

test("assertNotHtml throws on a doctype", () => {
  assert.throws(
    () =>
      assertNotHtml({
        headers: new Headers({ "content-type": "text/html" }),
        bodyText: "<!DOCTYPE html><html>",
      }),
    /Door returned HTML/,
  );
});

test("contentKind names json and sse", () => {
  assert.equal(
    contentKind({
      headers: new Headers({ "content-type": "application/json" }),
    }),
    "json",
  );
  assert.equal(
    contentKind({
      headers: new Headers({
        "content-type": "text/event-stream; charset=utf-8",
      }),
    }),
    "sse",
  );
});
