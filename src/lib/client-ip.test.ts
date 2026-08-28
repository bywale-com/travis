import assert from "node:assert/strict";
import { test } from "node:test";
import { clientIpFromHeaders } from "../server/client-ip";

function hdr(map: Record<string, string>) {
  return {
    get(name: string) {
      return map[name.toLowerCase()] ?? null;
    },
  };
}

test("x-forwarded-for uses the first hop", () => {
  assert.equal(
    clientIpFromHeaders(
      hdr({ "x-forwarded-for": "203.0.113.10, 10.0.0.1" }),
    ),
    "203.0.113.10",
  );
});

test("x-real-ip is the fallback", () => {
  assert.equal(clientIpFromHeaders(hdr({ "x-real-ip": "198.51.100.2" })), "198.51.100.2");
});

test("mapped IPv4 is unwrapped", () => {
  assert.equal(
    clientIpFromHeaders(hdr({ "x-forwarded-for": "::ffff:192.0.2.8" })),
    "192.0.2.8",
  );
});

test("missing headers are empty — do not resume", () => {
  assert.equal(clientIpFromHeaders(hdr({})), "");
});
