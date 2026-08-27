import assert from "node:assert/strict";
import { test } from "node:test";
import { envMayWriteBinding } from "./seat-binding";

test("env fills an empty binding", () => {
  assert.equal(envMayWriteBinding("", "bc-abc"), true);
  assert.equal(envMayWriteBinding(null, "bc-abc"), true);
});

test("env does not clobber a live SQL binding", () => {
  assert.equal(
    envMayWriteBinding("bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea", "bc-dead"),
    false,
  );
});
