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
  isDuplicateSend,
  matchConductorPhrase,
  SEND_DEDUPE_MS,
} from "./conductor";
import { parseCallByName } from "./router";
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

test("a network result-list reset does not wipe an all-interim draft", () => {
  const e = new Ear();
  const said = "engineer look at this long thing I was saying";
  e.result([], said);
  assert.equal(e.lastHeard, said);
  // Chrome resets the result list to a leftover fragment, then errors.
  e.result(["saying"], "");
  assert.equal(e.lastHeard, said, "the fragment must not replace the draft");
  e.end();
  assert.equal(e.heldDraft, said);
  assert.deepEqual(e.sends, []);
});

test("after a network hitch the next breath appends, it does not start over", () => {
  const e = new Ear();
  e.result([], "engineer look at the log");
  e.result(["log"], "");
  e.end();
  e.result(["and also the queue"], "");
  assert.equal(
    e.lastHeard,
    "engineer look at the log and also the queue",
  );
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

/**
 * Hotfix 007/009: you may keep talking while a seat is working. The server
 * decides send-or-queue per seat. A client-side "already busy" guard silently
 * eats the turn instead, which is worse than either outcome.
 */
class Pipe {
  sending = false;
  lastText = "";
  lastAt = 0;
  openStreams = 0;
  posted: string[] = [];
  dropped: string[] = [];

  finalize(utterance: string, nowMs: number) {
    const text = utterance.trim();
    if (!text) return;
    if (this.sending) {
      this.dropped.push(text);
      return;
    }
    if (
      isDuplicateSend({
        text,
        lastText: this.lastText,
        lastAtMs: this.lastAt,
        nowMs,
      })
    ) {
      this.dropped.push(text);
      return;
    }
    this.sending = true;
    this.lastText = text;
    this.lastAt = nowMs;
    this.posted.push(text);
    // Response headers are back; the reply now streams in the background.
    this.sending = false;
    this.openStreams += 1;
  }

  closeStream() {
    this.openStreams = Math.max(0, this.openStreams - 1);
  }
}

test("a turn still reaches the server while an earlier reply is streaming", () => {
  const p = new Pipe();
  p.finalize("engineer look at the queue I'm done", 0);
  assert.equal(p.openStreams, 1, "first reply is still streaming");
  p.finalize("sa what is the store shape I'm done", 4000);
  assert.deepEqual(p.posted, [
    "engineer look at the queue I'm done",
    "sa what is the store shape I'm done",
  ]);
  assert.deepEqual(p.dropped, [], "nothing may be silently swallowed");
});

test("a repeat turn to the same busy seat still reaches the server to be queued", () => {
  const p = new Pipe();
  p.finalize("engineer look at the queue I'm done", 0);
  p.finalize("engineer also check the pm queue I'm done", 5000);
  assert.equal(p.posted.length, 2, "the server queues it — the client must not");
  assert.deepEqual(p.dropped, []);
});

test("the same words gated twice in a moment only send once", () => {
  const p = new Pipe();
  p.finalize("engineer look at the queue I'm done", 0);
  p.finalize("engineer look at the queue I'm done", 300);
  assert.equal(p.posted.length, 1);
  assert.equal(p.dropped.length, 1);
});

test("saying the same thing again later is a real turn, not a duplicate", () => {
  const p = new Pipe();
  p.finalize("engineer status I'm done", 0);
  p.finalize("engineer status I'm done", SEND_DEDUPE_MS + 1);
  assert.equal(p.posted.length, 2);
});

/**
 * When turns are swallowed the draft keeps growing, and the blob that finally
 * sends no longer starts with the seat name — so the router falls back to the
 * sticky addressee. That is how "send to Engineer" arrives at PM.
 */
test("a swallowed turn is why addressing drifts back to the sticky seat", () => {
  const clean = parseCallByName("engineer look at the queue");
  assert.equal(clean.seatKey, "engineer");

  const blob = parseCallByName(
    "okay so I'm done engineer can you check the queue now",
  );
  assert.equal(blob.seatKey, null, "leading word is not a seat — stays sticky");
});
