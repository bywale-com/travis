/**
 * Lived turn-taking: the Room accumulator + conductor gate driven by the
 * result shapes Web Speech actually emits. These reproduce the reported
 * "I'm done sends only sometimes" and the deaf-after-readback window.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  absorbFinalTranscript,
  carryDraftAcrossRestart,
  collapseSpeechStutter,
  keepSpeechDraft,
  mergeLiveTranscript,
} from "./absorb-text";
import {
  conductorGate,
  conductorOnEnd,
  matchConductorPhrase,
} from "./conductor";
import {
  STT_ONEND_MAX_WAIT_MS,
  STT_ONEND_RETRY_MS,
  sttOnEndAction,
  sttShouldKeepWaiting,
} from "./ear";

const PHRASES = [
  "I'm done with this message",
  "I'm done with this",
  "I'm done talking",
  "I'm done",
];

/** Mirrors Room.tsx: onresult accumulation, persistHeldDraft, onend gate. */
class Ear {
  heldDraft = "";
  lastHeard = "";
  committed = "";
  interim = "";
  finalizing = false;
  sends: string[] = [];

  result(finals: string[], interimText: string) {
    let sessionCommitted = "";
    for (const piece of finals) {
      sessionCommitted = absorbFinalTranscript(sessionCommitted, piece);
    }
    const interim = interimText;
    const sessionMerged = mergeLiveTranscript(sessionCommitted, interim);
    if (!sessionMerged.trim() && this.lastHeard.trim()) return;
    const committed = carryDraftAcrossRestart(this.heldDraft, sessionCommitted);
    const full = keepSpeechDraft(
      this.lastHeard,
      mergeLiveTranscript(committed, interim),
    );
    if (!full.trim()) return;
    this.committed = committed;
    this.interim = interim;
    this.lastHeard = full;
    this.heldDraft = keepSpeechDraft(this.heldDraft, committed);

    const gate = conductorGate({
      committed: this.committed,
      interim,
      full,
      phrases: PHRASES,
    });
    if (gate.send) this.finalize(gate.text);
  }

  private persist() {
    const merged = mergeLiveTranscript(
      carryDraftAcrossRestart(this.heldDraft, this.committed),
      this.interim,
    );
    const keep = keepSpeechDraft(this.lastHeard, merged);
    if (!keep.trim()) return;
    this.lastHeard = keep;
    this.heldDraft = keep;
    this.committed = keep;
    this.interim = "";
  }

  /** Chrome ended the session (silence, TTS, mode churn). */
  end() {
    this.persist();
    const settled = conductorOnEnd({
      text: this.lastHeard,
      phrases: PHRASES,
    });
    if (settled.send && !this.finalizing) this.finalize(settled.text);
  }

  /** Client posts the raw utterance; the finalize route strips the phrase. */
  private finalize(text: string) {
    if (this.finalizing) return;
    const server = matchConductorPhrase(
      collapseSpeechStutter(text),
      PHRASES,
    );
    assert.equal(server.matched, true, `server rejected: ${text}`);
    this.sends.push(server.cleanedText);
    this.clear();
  }

  clear() {
    this.heldDraft = "";
    this.lastHeard = "";
    this.committed = "";
    this.interim = "";
  }
}

test("phrase in a final result sends", () => {
  const e = new Ear();
  e.result(["engineer look at the log I'm done"], "");
  assert.deepEqual(e.sends, ["engineer look at the log"]);
  assert.equal(e.heldDraft, "");
});

test("phrase heard only as interim still sends when the session ends", () => {
  const e = new Ear();
  e.result(["engineer look at the log"], "");
  e.result(["engineer look at the log"], "I'm done");
  assert.deepEqual(e.sends, [], "held while interim can still grow");
  e.end();
  assert.deepEqual(e.sends, ["engineer look at the log"]);
  assert.equal(e.heldDraft, "", "draft must not keep the spent phrase");
});

test("an all-interim utterance sends on end", () => {
  const e = new Ear();
  e.result([], "engineer look at");
  e.result([], "engineer look at the log I'm");
  e.result([], "engineer look at the log I'm done");
  e.end();
  assert.deepEqual(e.sends, ["engineer look at the log"]);
});

test("phrase finalized alone after a silence restart sends once", () => {
  const e = new Ear();
  e.result(["engineer look at the log"], "");
  e.end();
  assert.deepEqual(e.sends, [], "no phrase yet — keep listening");
  e.result(["I'm done"], "");
  assert.deepEqual(e.sends, ["engineer look at the log"]);
});

test("two turns in a row both send", () => {
  const e = new Ear();
  e.result(["engineer look at the log I'm done"], "");
  e.result(["now check the queue I'm done"], "");
  assert.deepEqual(e.sends, [
    "engineer look at the log",
    "now check the queue",
  ]);
});

test("a spent phrase never lingers to block the next turn", () => {
  const e = new Ear();
  e.result(["engineer look at the log"], "I'm done");
  e.end();
  assert.equal(e.sends.length, 1);
  e.result(["now check the queue"], "I'm done");
  e.end();
  assert.deepEqual(e.sends, [
    "engineer look at the log",
    "now check the queue",
  ]);
});

test("speech that only mentions being done does not send", () => {
  const e = new Ear();
  e.result(["I'm done with the migration file and it needs review"], "");
  e.end();
  assert.deepEqual(e.sends, []);
});

test("ending with no phrase keeps the draft for the next breath", () => {
  const e = new Ear();
  e.result(["engineer look at the log"], "");
  e.end();
  assert.deepEqual(e.sends, []);
  assert.equal(e.heldDraft, "engineer look at the log");
});

test("a long readback never abandons the ear", () => {
  let waited = 0;
  let restarts = 0;
  let ttsBusy = true;
  // 30s read — longer than the old 24-try (9.6s) budget.
  for (let t = 0; t < 60_000; t += STT_ONEND_RETRY_MS) {
    if (t >= 30_000) ttsBusy = false;
    const action = sttOnEndAction({
      wanted: true,
      presence: ttsBusy ? "speaking" : "listening",
      ttsBusy,
      recLive: restarts > 0,
    });
    if (action === "wait") {
      waited += STT_ONEND_RETRY_MS;
      assert.equal(sttShouldKeepWaiting(waited), true, `gave up at ${waited}ms`);
      continue;
    }
    if (action === "restart") {
      restarts += 1;
      assert.ok(t >= 30_000, "must not restart while the mouth is busy");
      break;
    }
  }
  assert.equal(restarts, 1);
});

test("waiting is bounded so a dead session cannot spin forever", () => {
  assert.equal(sttShouldKeepWaiting(STT_ONEND_MAX_WAIT_MS), false);
});
