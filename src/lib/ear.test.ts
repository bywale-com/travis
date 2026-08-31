import assert from "node:assert/strict";
import { test } from "node:test";
import {
  modeSwitchEarAction,
  sameRoomEar,
  sttOnEndAction,
  whichEar,
  type EarState,
} from "./ear";

const engineerTalk: EarState = {
  viewMode: "log",
  logSubmode: "talk",
  destTravis: false,
  liveUp: false,
};

const engineerVoice: EarState = {
  viewMode: "voice",
  logSubmode: "talk",
  destTravis: false,
  liveUp: false,
};

const engineerType: EarState = {
  viewMode: "log",
  logSubmode: "type",
  destTravis: false,
  liveUp: false,
};

/**
 * Chrome Web Speech: abort() then start() on the same tick throws, and the
 * mic stays dead until a full reload. That is the lived Talk↔Voice failure.
 */
class FakeChromeSpeech {
  live = false;
  blocked = false;
  starts = 0;
  aborts = 0;

  start() {
    if (this.blocked || this.live) {
      throw new Error("SpeechRecognition: invalid state");
    }
    this.starts += 1;
    this.live = true;
  }

  abort() {
    this.aborts += 1;
    this.live = false;
    this.blocked = true;
  }

  /** Time passed / refresh — Chrome allows start again. */
  cooldown() {
    this.blocked = false;
  }
}

function applySwitch(rec: FakeChromeSpeech, from: EarState, to: EarState) {
  const action = modeSwitchEarAction({
    from,
    to,
    recLive: rec.live,
  });
  if (action === "keep") return;
  if (action === "release") {
    rec.abort();
    rec.cooldown();
    rec.live = false;
    return;
  }
  rec.abort();
  rec.start();
}

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
  assert.equal(whichEar(engineerTalk), "stt");
});

test("Type leaves the room ear off — composer owns the mic", () => {
  assert.equal(whichEar(engineerType), "none");
});

test("Voice dest Engineer is Web Speech", () => {
  assert.equal(whichEar(engineerVoice), "stt");
});

test("Voice dest Travis uses Live only once Live is actually up", () => {
  assert.equal(
    whichEar({
      viewMode: "voice",
      logSubmode: "talk",
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

test("Talk ↔ Voice dest Engineer is the same STT ear", () => {
  assert.equal(sameRoomEar(engineerTalk, engineerVoice), true);
  assert.equal(sameRoomEar(engineerVoice, engineerTalk), true);
  assert.equal(sameRoomEar(engineerTalk, engineerType), false);
  assert.equal(sameRoomEar(engineerVoice, engineerType), false);
});

test("lived dest Engineer: Talk → Voice → Talk keeps the recognizer live", () => {
  const rec = new FakeChromeSpeech();
  rec.start();
  assert.equal(rec.live, true);
  assert.equal(
    modeSwitchEarAction({
      from: engineerTalk,
      to: engineerVoice,
      recLive: rec.live,
    }),
    "keep",
  );
  applySwitch(rec, engineerTalk, engineerVoice);
  assert.equal(rec.live, true);
  assert.equal(rec.aborts, 0);
  assert.equal(
    modeSwitchEarAction({
      from: engineerVoice,
      to: engineerTalk,
      recLive: rec.live,
    }),
    "keep",
  );
  applySwitch(rec, engineerVoice, engineerTalk);
  assert.equal(rec.live, true);
  assert.equal(rec.aborts, 0);
});

test("abort on Talk → Voice is the Chrome trap: Talk cannot start again", () => {
  const rec = new FakeChromeSpeech();
  rec.start();
  rec.abort();
  assert.throws(() => rec.start());
  assert.equal(rec.live, false);
});

test("Type is a different ear — release room STT, composer can start after cooldown", () => {
  const rec = new FakeChromeSpeech();
  rec.start();
  assert.equal(
    modeSwitchEarAction({
      from: engineerTalk,
      to: engineerType,
      recLive: rec.live,
    }),
    "release",
  );
  applySwitch(rec, engineerTalk, engineerType);
  assert.equal(rec.live, false);
  const composer = new FakeChromeSpeech();
  composer.start();
  assert.equal(composer.live, true);
});

test("TTS onend must wait, not quit — then restart when the mouth is idle", () => {
  assert.equal(
    sttOnEndAction({
      wanted: true,
      presence: "speaking",
      ttsBusy: true,
      recLive: false,
    }),
    "wait",
  );
  assert.equal(
    sttOnEndAction({
      wanted: true,
      presence: "listening",
      ttsBusy: false,
      recLive: false,
    }),
    "restart",
  );
  assert.equal(
    sttOnEndAction({
      wanted: true,
      presence: "paused",
      ttsBusy: false,
      recLive: false,
    }),
    "stop",
  );
});

test("lived dest Engineer: Voice readback kills STT, wait, then Talk hears again", () => {
  const rec = new FakeChromeSpeech();
  rec.start();
  rec.abort();
  let ttsBusy = true;
  let presence: "listening" | "speaking" = "speaking";
  let action = sttOnEndAction({
    wanted: true,
    presence,
    ttsBusy,
    recLive: rec.live,
  });
  assert.equal(action, "wait");
  ttsBusy = false;
  presence = "listening";
  rec.cooldown();
  action = sttOnEndAction({
    wanted: true,
    presence,
    ttsBusy,
    recLive: rec.live,
  });
  assert.equal(action, "restart");
  rec.start();
  assert.equal(rec.live, true);
  applySwitch(rec, engineerVoice, engineerTalk);
  assert.equal(rec.live, true);
});

test("old TTS onend (quit while speaking) leaves Talk deaf", () => {
  const rec = new FakeChromeSpeech();
  rec.start();
  rec.abort();
  const quitWhileSpeaking = "stop";
  assert.equal(quitWhileSpeaking, "stop");
  assert.throws(() => rec.start());
  assert.equal(rec.live, false);
});
