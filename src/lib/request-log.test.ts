import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clampRequestLimit,
  filterRequests,
  formatRequestLine,
  formatRequestLog,
  formatStamp,
  isRequestTurn,
  parseRequestWhen,
  requestDestLabel,
  requestLogPointer,
  requestMatches,
  requestWindowStart,
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
  assert.match(requestLogPointer(12) ?? "", /when=today/);
});

test("today is midnight UTC; week is the last seven days", () => {
  const noon = Date.parse("2026-09-03T12:00:00Z");
  assert.equal(requestWindowStart("today", noon), Date.parse("2026-09-03T00:00:00Z"));
  assert.equal(requestWindowStart("week", noon), noon - 7 * 24 * 60 * 60 * 1000);
  assert.equal(requestWindowStart("all", noon), null);
  assert.equal(parseRequestWhen("today"), "today");
  assert.equal(parseRequestWhen("nope"), "all");
  assert.equal(clampRequestLimit(10), 10);
  assert.equal(clampRequestLimit(0), 1);
});

test("when=today and limit=last 10 are the grain the founder asked for", () => {
  const now = Date.parse("2026-09-03T12:00:00Z");
  const rows = [
    { seq: 3, seatKey: "pm", text: "today cost", createdAt: "2026-09-03T02:22:00Z" },
    { seq: 2, seatKey: "engineer", text: "yesterday barge", createdAt: "2026-09-02T22:00:00Z" },
    { seq: 1, seatKey: "sa", text: "last week images", createdAt: "2026-08-26T12:00:00Z" },
  ];
  const today = filterRequests(rows, { when: "today", nowMs: now });
  assert.deepEqual(today.map((r) => r.seq), [3]);
  const week = filterRequests(rows, { when: "week", nowMs: now });
  assert.deepEqual(week.map((r) => r.seq), [3, 2]);
  const lastOne = filterRequests(rows, { when: "week", limit: 1, nowMs: now });
  assert.deepEqual(lastOne.map((r) => r.seq), [3]);
  assert.match(
    formatRequestLog({ rows: today, total: 1, when: "today" }),
    /1 of 1 requests today/,
  );
  assert.match(
    formatRequestLog({ rows: [], total: 0, when: "week" }),
    /No requests in the last 7 days/,
  );
});
