import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterRequests,
  formatRequestLine,
  formatRequestLog,
  formatStamp,
  isRequestTurn,
  requestDestLabel,
  requestLogPointer,
  requestMatches,
} from "./request-log";

test("only user turns are requests", () => {
  assert.equal(isRequestTurn("user"), true);
  assert.equal(isRequestTurn("agent_post"), false);
  assert.equal(isRequestTurn("status"), false);
});

test("dest labels stay short", () => {
  assert.equal(requestDestLabel("pm"), "PM");
  assert.equal(requestDestLabel("engineer"), "Engineer");
  assert.equal(requestDestLabel("travis"), "Travis");
  assert.equal(requestDestLabel("ae"), "ae");
});

test("search is case-insensitive and can pin a seat", () => {
  assert.equal(requestMatches("Google Text-to-Speech", "prosody"), false);
  assert.equal(requestMatches("low prosody female voice", "PROSODY"), true);
  assert.equal(requestMatches("cost panel", "", "pm", "pm"), true);
  assert.equal(requestMatches("cost panel", "", "pm", "sa"), false);
});

test("filter keeps newest-first order and the limit", () => {
  const rows = [
    { seq: 3, seatKey: "pm", text: "cost panel", createdAt: "2026-09-03T02:22:00Z" },
    { seq: 2, seatKey: "engineer", text: "barge TTS", createdAt: "2026-09-03T02:20:00Z" },
    { seq: 1, seatKey: "pm", text: "images and links", createdAt: "2026-09-03T02:18:00Z" },
  ];
  const cost = filterRequests(rows, { q: "cost" });
  assert.equal(cost.length, 1);
  assert.equal(cost[0].seq, 3);
  assert.equal(filterRequests(rows, { seat: "pm" }).length, 2);
  assert.equal(filterRequests(rows, { limit: 1 }).length, 1);
});

test("a line carries the UTC stamp and the dest", () => {
  const line = formatRequestLine({
    seq: 146,
    seatKey: "pm",
    text: "Founder describes a concurrency problem: seat responses route directly to Google TTS",
    createdAt: "2026-09-03T02:25:06.150Z",
  });
  assert.match(line, /\[2026-09-03 02:25 UTC\]/);
  assert.match(line, /→ PM:/);
  assert.match(line, /concurrency problem/);
});

test("empty and match-miss logs are honest", () => {
  assert.equal(formatRequestLog({ rows: [], total: 0 }), "No requests in this room yet.");
  assert.match(
    formatRequestLog({ rows: [], total: 0, q: "fieldtop" }),
    /No requests matching “fieldtop”/,
  );
});

test("a hit list names how many and keeps the stamp", () => {
  const rows = [
    {
      seq: 67,
      seatKey: "engineer",
      text: "improve the Google Text-to-Speech voice",
      createdAt: "2026-09-03T02:13:45.797Z",
    },
  ];
  const out = formatRequestLog({ rows, total: 12, q: "voice" });
  assert.match(out, /1 of 12 requests matching “voice”, newest first/);
  assert.match(out, /→ Engineer:/);
  assert.equal(formatStamp("2026-09-03T02:13:45.797Z"), "2026-09-03 02:13 UTC");
});

test("the pointer tells Travis the organ exists", () => {
  assert.equal(requestLogPointer(0), null);
  assert.match(requestLogPointer(1) ?? "", /1 request/);
  assert.match(requestLogPointer(12) ?? "", /12 requests/);
  assert.match(requestLogPointer(12) ?? "", /search_room/);
});
