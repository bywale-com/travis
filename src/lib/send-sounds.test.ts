import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cueSamples,
  encodeWav,
  playQueuedCue,
  playSendSwoosh,
  releaseSendSounds,
  resumeSendSounds,
  sendSoundSurfaceFromView,
  shouldPlaySendSound,
  swooshSamples,
} from "./send-sounds";

test("send sounds no-op without window Audio", () => {
  resumeSendSounds();
  playSendSwoosh();
  playQueuedCue();
  releaseSendSounds();
});

test("swoosh WAV is a real descending burst, not silence", () => {
  const samples = swooshSamples(22050);
  assert.ok(samples.length > 22050 * 0.2);
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  assert.ok(peak > 0.3, `peak ${peak}`);
  const wav = new Uint8Array(encodeWav(samples, 22050));
  assert.equal(String.fromCharCode(wav[0], wav[1], wav[2], wav[3]), "RIFF");
  assert.equal(String.fromCharCode(wav[8], wav[9], wav[10], wav[11]), "WAVE");
});

test("Voice suppresses send and queue shots; Talk and Type do not", () => {
  assert.equal(shouldPlaySendSound("voice"), false);
  assert.equal(shouldPlaySendSound("talk"), true);
  assert.equal(shouldPlaySendSound("type"), true);
  assert.equal(sendSoundSurfaceFromView("voice", "type"), "voice");
  assert.equal(sendSoundSurfaceFromView("log", "talk"), "talk");
  assert.equal(sendSoundSurfaceFromView("log", "type"), "type");
  playSendSwoosh("voice");
  playQueuedCue("voice");
});

test("cue WAV is two notes, distinct from the swoosh length", () => {
  const cue = cueSamples(22050);
  const swoosh = swooshSamples(22050);
  assert.ok(cue.length < swoosh.length);
  let peak = 0;
  for (const s of cue) peak = Math.max(peak, Math.abs(s));
  assert.ok(peak > 0.3, `peak ${peak}`);
});
