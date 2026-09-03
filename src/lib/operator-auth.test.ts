import assert from "node:assert/strict";
import { test } from "node:test";
import {
  OPERATOR_COOKIE,
  isOperatorEmail,
  normalizeOperatorEmail,
  operatorLinkPath,
  operatorLinkText,
  preferredOperator,
  seedOperatorEmails,
  tokenFromCookieHeader,
} from "./operator-auth";

test("email trims and lowercases", () => {
  assert.equal(normalizeOperatorEmail("  Wale@ApexIntro.com "), "wale@apexintro.com");
});

test("a real email passes; junk does not", () => {
  assert.equal(isOperatorEmail("truthist00@gmail.com"), true);
  assert.equal(isOperatorEmail("not-an-email"), false);
  assert.equal(isOperatorEmail(""), false);
  assert.equal(isOperatorEmail("a@b"), false);
});

test("seed reads a comma list and TEST_EMAIL_TO, no dupes", () => {
  assert.deepEqual(
    seedOperatorEmails({
      TRAVIS_OPERATOR_EMAIL: "Wale@Apex.com, other@apex.com",
      TEST_EMAIL_TO: "wale@apex.com\r",
    }),
    ["wale@apex.com", "other@apex.com"],
  );
});

test("backfill prefers the env-seeded inbox over the oldest row", () => {
  const oldest = { id: "a", email: "wale@apexintro.com" };
  const gmail = { id: "b", email: "truthist00@gmail.com" };
  assert.equal(
    preferredOperator([oldest, gmail], ["truthist00@gmail.com"])?.id,
    "b",
  );
  assert.equal(preferredOperator([oldest, gmail], [])?.id, "a");
});

test("the personal path is the enter URL", () => {
  assert.equal(operatorLinkPath("abc+def"), "/enter/abc%2Bdef");
});

test("mail copy names the same link, not a code", () => {
  const body = operatorLinkText("https://travis.example/enter/tok");
  assert.match(body, /personal Travis link/);
  assert.match(body, /https:\/\/travis\.example\/enter\/tok/);
  assert.doesNotMatch(body, /password|one-time code/i);
});

test("cookie header yields the token and ignores neighbors", () => {
  const header = `other=1; ${OPERATOR_COOKIE}=tok%2B1; theme=mission`;
  assert.equal(tokenFromCookieHeader(header), "tok+1");
  assert.equal(tokenFromCookieHeader(null), "");
});
