import assert from "node:assert/strict";
import { test } from "node:test";
import { playQueuedCue, playSendSwoosh, resumeSendSounds } from "./send-sounds";

test("send sounds no-op without a window AudioContext", () => {
  assert.equal(typeof playSendSwoosh, "function");
  assert.equal(typeof playQueuedCue, "function");
  resumeSendSounds();
  playSendSwoosh();
  playQueuedCue();
});
