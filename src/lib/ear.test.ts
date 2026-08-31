import assert from "node:assert/strict";
import { test } from "node:test";
import { whichEar } from "./ear";

test("Talk always uses Web Speech, including dest Travis", () => {
  assert.equal(
    whichEar({
      viewMode: "log",
      logSubmode: "talk",
      destTravis: true,
      liveUp: false,
    }),
    "stt",
  );
  assert.equal(
    whichEar({
      viewMode: "log",
      logSubmode: "talk",
      destTravis: false,
      liveUp: false,
    }),
    "stt",
  );
});

test("Type leaves the room ear off — composer owns the mic", () => {
  assert.equal(
    whichEar({
      viewMode: "log",
      logSubmode: "type",
      destTravis: false,
      liveUp: false,
    }),
    "none",
  );
});

test("Voice dest Engineer is Web Speech", () => {
  assert.equal(
    whichEar({
      viewMode: "voice",
      logSubmode: "talk",
      destTravis: false,
      liveUp: false,
    }),
    "stt",
  );
});

test("Voice dest Travis uses Live only once Live is actually up", () => {
  assert.equal(
    whichEar({
      viewMode: "voice",
      logSubmode: "type",
      destTravis: true,
      liveUp: false,
    }),
    "stt",
  );
  assert.equal(
    whichEar({
      viewMode: "voice",
      logSubmode: "talk",
      destTravis: true,
      liveUp: true,
    }),
    "live",
  );
});
