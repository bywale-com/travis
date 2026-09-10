import assert from "node:assert/strict";
import test from "node:test";
import {
  LIVE_DOWN_SHIRT,
  UNWIRED_LINE,
  decideLiveConnect,
  liveMissSubtitle,
  waitForLiveConnect,
} from "./live-connect";

test("already up is already-up", () => {
  assert.equal(
    decideLiveConnect({ alreadyUp: true, connecting: false }),
    "already-up",
  );
});

test("in-flight is wait, not start", () => {
  assert.equal(
    decideLiveConnect({ alreadyUp: false, connecting: true }),
    "wait",
  );
});

test("neither up nor connecting is start", () => {
  assert.equal(
    decideLiveConnect({ alreadyUp: false, connecting: false }),
    "start",
  );
});

test("unwired keeps its own line, not the phone-ear shirt", () => {
  assert.equal(liveMissSubtitle("unwired"), UNWIRED_LINE);
  assert.notEqual(liveMissSubtitle("unwired"), LIVE_DOWN_SHIRT);
});

test("a real miss is the phone-ear shirt", () => {
  assert.equal(liveMissSubtitle("miss"), LIVE_DOWN_SHIRT);
});

test("waitForLiveConnect returns true when the in-flight connect finishes up", async () => {
  let connecting = true;
  let up = false;
  setTimeout(() => {
    connecting = false;
    up = true;
  }, 30);
  const ok = await waitForLiveConnect({
    isConnecting: () => connecting,
    isUp: () => up,
    pollMs: 10,
    timeoutMs: 1000,
  });
  assert.equal(ok, true);
});

test("waitForLiveConnect returns false when the in-flight connect finishes down", async () => {
  let connecting = true;
  setTimeout(() => {
    connecting = false;
  }, 30);
  const ok = await waitForLiveConnect({
    isConnecting: () => connecting,
    isUp: () => false,
    pollMs: 10,
    timeoutMs: 1000,
  });
  assert.equal(ok, false);
});
