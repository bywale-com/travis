import assert from "node:assert/strict";
import test from "node:test";
import {
  BOX_NOT_WIRED,
  boxSpriteName,
  boxToken,
  clipBoxText,
  formatBoxExec,
  parseBoxExecBody,
} from "./travis-box";

test("unwired receipt names the token and refuses a new ticket", () => {
  assert.match(BOX_NOT_WIRED, /SPRITES_TOKEN/);
  assert.match(BOX_NOT_WIRED, /not a new ticket/);
});

test("a failed exec stays on the same box", () => {
  const text = formatBoxExec({
    cmd: "false",
    exit: 1,
    stdout: "",
    stderr: "permission denied",
  });
  assert.match(text, /exit 1/);
  assert.match(text, /permission denied/);
  assert.match(text, /Same box/);
  assert.match(text, /do not mint a ticket/);
});

test("ok exec is the stdout", () => {
  assert.equal(
    formatBoxExec({ cmd: "echo hi", exit: 0, stdout: "hi\n", stderr: "" }),
    "hi",
  );
});

test("JSON exec body is the port shape", () => {
  const parsed = parseBoxExecBody(
    200,
    JSON.stringify({ stdout: "ok", stderr: "", exit_code: 0 }),
  );
  assert.equal(parsed.exit, 0);
  assert.equal(parsed.stdout, "ok");
});

test("plain 200 text is stdout", () => {
  const parsed = parseBoxExecBody(200, "hello\n");
  assert.equal(parsed.exit, 0);
  assert.equal(parsed.stdout, "hello\n");
});

test("sprite name defaults to travis; token reads SPRITES_TOKEN first", () => {
  assert.equal(boxSpriteName({}), "travis");
  assert.equal(boxSpriteName({ TRAVIS_SPRITE_NAME: "House" }), "house");
  assert.equal(boxToken({ SPRITES_TOKEN: "abc" }), "abc");
  assert.equal(boxToken({ FLY_API_TOKEN: "fly" }), "fly");
  assert.equal(boxToken({}), "");
});

test("long output clips", () => {
  const clipped = clipBoxText("x".repeat(5000), 20);
  assert.ok(clipped.length < 30);
  assert.match(clipped, /…/);
});
