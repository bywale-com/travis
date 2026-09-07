import assert from "node:assert/strict";
import test from "node:test";
import { REQUEST_SCAN } from "./request-log";
import { describeTurn, LINE_CAP, WINDOW_TURNS } from "./room-context";
import {
  assembleDestWithContext,
  formatRosterFact,
  unclippedPrint,
  type PrintTurn,
} from "./dest-with-context";

const ASK_907 =
  "every initiative and idea we've discussed in this chat, I would like to send that alongside prompting them as well, the technical PM, to list out every idea and initiative we've discussed that hasn't yet been implemented.";

function userTurn(text: string): PrintTurn {
  return { kind: "user", seatKey: "travis", text };
}

function travisPost(text: string): PrintTurn {
  return {
    kind: "agent_post",
    seatKey: "travis",
    seatLabel: "Travis",
    text,
    speakable: true,
  };
}

test("907 sentence plus a 2086-character Travis post stays in dest assemble", () => {
  const post = "x".repeat(2086);
  const clipped = describeTurn(
    { kind: "agent_post", seatKey: "travis", text: post },
    "Travis",
  );
  assert.ok(clipped.length <= "You said: ".length + LINE_CAP + 1);
  assert.equal(clipped.includes(post), false);

  const print = unclippedPrint([
    userTurn("List the open initiatives in this room, in order."),
    travisPost(post),
  ]);
  const prompt = assembleDestWithContext({ ask: ASK_907, print });
  assert.equal(prompt.includes(post), true);
  assert.notEqual(prompt, clipped);
  assert.equal(prompt.startsWith(`${ASK_907}\n\n`), true);
  assert.equal(prompt.includes(`Travis: ${post}`), true);
});

test("worthy turns older than WINDOW_TURNS inside REQUEST_SCAN stay in dest print", () => {
  const older = userTurn("older worthy turn inside REQUEST_SCAN");
  const rest: PrintTurn[] = [];
  for (let i = 0; i < WINDOW_TURNS; i++) {
    rest.push(userTurn(`later worthy ${i}`));
  }
  const look = [older, ...rest];
  assert.ok(look.length > WINDOW_TURNS);
  assert.ok(look.length <= REQUEST_SCAN);
  const print = unclippedPrint(look);
  assert.equal(print.includes("older worthy turn inside REQUEST_SCAN"), true);
  assert.equal(print.includes("later worthy 0"), true);
});

test("empty print assembles to the ask only", () => {
  assert.equal(
    assembleDestWithContext({ ask: ASK_907, print: "" }),
    ASK_907,
  );
  assert.equal(unclippedPrint([]), "");
});

test("dest print does not require a last Travis speakable post", () => {
  const print = unclippedPrint([
    userTurn("alongside this chat send it to technical PM"),
  ]);
  assert.equal(print, "Founder: alongside this chat send it to technical PM");
});

test("roster fact hangs named dest lines after the live roster", () => {
  const roster = "Technical PM (pm) — /protocols/pm.md — idle";
  const fact = formatRosterFact(roster);
  assert.equal(fact.startsWith(roster), true);
  assert.equal(fact.includes("seat=pm|sa|engineer"), true);
  assert.equal(fact.includes("Catalog pm is not this bind"), true);
  assert.equal(fact.includes("create_agent then sit_agent"), true);
});
