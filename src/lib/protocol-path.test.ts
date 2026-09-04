import assert from "node:assert/strict";
import test from "node:test";
import {
  destKind,
  formatSeatRosterLine,
  parseSitProtocol,
  SIT_PROTOCOL_FILES,
} from "./protocol-path";

test("pm sa engineer and full paths sit", () => {
  assert.deepEqual(parseSitProtocol("pm"), {
    ok: true,
    role: "pm",
    path: "/protocols/pm.md",
  });
  assert.deepEqual(parseSitProtocol("SA"), {
    ok: true,
    role: "sa",
    path: "/protocols/sa.md",
  });
  assert.deepEqual(parseSitProtocol("/protocols/sa.md"), {
    ok: true,
    role: "sa",
    path: "/protocols/sa.md",
  });
  assert.deepEqual(parseSitProtocol("engineer"), {
    ok: true,
    role: "engineer",
    path: "/protocols/engineer.md",
  });
  assert.deepEqual(SIT_PROTOCOL_FILES, [
    "/protocols/pm.md",
    "/protocols/sa.md",
    "/protocols/engineer.md",
  ]);
});

test("travis WHERE logging and junk are refused", () => {
  assert.match(parseSitProtocol("travis").reason ?? "", /facilitator/);
  assert.match(parseSitProtocol("/protocols/travis.md").reason ?? "", /facilitator/);
  assert.match(parseSitProtocol("/protocols/WHERE.md").reason ?? "", /not seat/);
  assert.match(parseSitProtocol("/protocols/logging.md").reason ?? "", /not seat/);
  assert.match(parseSitProtocol("/protocols/pm").reason ?? "", /only hangs/);
  assert.match(parseSitProtocol("").reason ?? "", /Need a protocol/);
});

test("who is person dest; role seat without who is role dest", () => {
  assert.equal(destKind({ seat: "pm" }), "role");
  assert.equal(destKind({ seat: "pm", who: "pat" }), "person");
  assert.equal(destKind({ who: "pat" }), "person");
  assert.equal(destKind({ seat: "pat" }), "none");
});

test("roster line names path or not seated and idle or busy", () => {
  assert.equal(
    formatSeatRosterLine({
      label: "Pat",
      seatKey: "pat",
      protocolPath: "",
      busy: false,
    }),
    "Pat (pat) — not seated — idle",
  );
  assert.equal(
    formatSeatRosterLine({
      label: "Pat",
      seatKey: "pat",
      protocolPath: "/protocols/pm.md",
      busy: true,
    }),
    "Pat (pat) — /protocols/pm.md — busy",
  );
});
