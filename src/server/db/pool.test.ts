import assert from "node:assert/strict";
import { test } from "node:test";
import { postgresPoolOptions } from "./pool";

test("one client, and it is allowed to go idle", () => {
  const opts = postgresPoolOptions();
  assert.equal(opts.max, 1);
  assert.equal(opts.prepare, false);
  assert.ok(opts.idle_timeout > 0);
  assert.ok(opts.max_lifetime > opts.idle_timeout);
});
