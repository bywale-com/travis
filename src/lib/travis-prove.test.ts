import assert from "node:assert/strict";
import test from "node:test";
import {
  NEED_A_CHECK,
  NEED_A_DO,
  PROVE_MAX,
  confirmWriteOnBox,
  formatProveFailed,
  formatProveWorked,
  formatWriteBoxMissing,
  formatWriteBoxOk,
  parseProveArgs,
  runProveCycles,
  shellSingleQuote,
  type ProveExecResult,
} from "./travis-prove";

test("prove needs do plus a check", () => {
  const missing = parseProveArgs({ do: "true" });
  assert.deepEqual(missing, { ok: false, reason: NEED_A_CHECK });
  assert.deepEqual(parseProveArgs({}), { ok: false, reason: NEED_A_DO });
  const path = parseProveArgs({ do: "touch /tmp/a", path: "/tmp/a" });
  assert.equal(path.ok, true);
  if (path.ok) assert.match(path.spec.checkCmd, /test -e '\/tmp\/a'/);
  const url = parseProveArgs({ do: "true", url: "https://example.com" });
  assert.equal(url.ok, true);
  if (url.ok) assert.match(url.spec.checkCmd, /curl -fsS -o \/dev\/null 'https:\/\/example.com'/);
});

test("empty do is refused once — not a cycle", () => {
  assert.deepEqual(parseProveArgs({ do: "  ", path: "/tmp/a" }), {
    ok: false,
    reason: NEED_A_DO,
  });
});

test("worked receipt names the attempt", () => {
  assert.equal(formatProveWorked(1, "ok\n"), "Proved. attempt 1/3. ok");
  assert.equal(formatProveWorked(3, ""), "Proved. attempt 3/3.");
});

test("failed receipt names N, last, and refuses a ticket", () => {
  const text = formatProveFailed(3, "curl: 22");
  assert.match(text, /Failed after 3/);
  assert.match(text, /curl: 22/);
  assert.match(text, /Same box/);
  assert.match(text, /Do not mint a ticket/);
  assert.doesNotMatch(text, /insertOpen/);
});

test("prove cycle stops at first passing check", async () => {
  const calls: string[] = [];
  const text = await runProveCycles(
    { do: "touch /tmp/a", checkCmd: "test -e /tmp/a" },
    async (cmd) => {
      calls.push(cmd);
      return { ok: true, exit: 0, stdout: "ok", stderr: "" };
    },
  );
  assert.equal(text, "Proved. attempt 1/3. ok");
  assert.deepEqual(calls, ["touch /tmp/a", "test -e /tmp/a"]);
});

test("prove cycle retries to 3 then stops", async () => {
  let n = 0;
  const text = await runProveCycles(
    { do: "true", checkCmd: "false" },
    async () => {
      n += 1;
      return { ok: true, exit: 1, stdout: "", stderr: "nope" };
    },
  );
  assert.equal(n, PROVE_MAX * 2);
  assert.match(text, /Failed after 3/);
  assert.match(text, /nope/);
  assert.match(text, /Do not mint a ticket/);
});

test("prove does not retry unwired or auth", async () => {
  let n = 0;
  const unwired = await runProveCycles(
    { do: "true", checkCmd: "true" },
    async () => {
      n += 1;
      return { ok: false, noRetry: true, reason: "Box is not wired. Set SPRITES_TOKEN." };
    },
  );
  assert.equal(n, 1);
  assert.match(unwired, /SPRITES_TOKEN/);

  n = 0;
  const auth = await runProveCycles(
    { do: "true", checkCmd: "true" },
    async () => {
      n += 1;
      return { ok: false, noRetry: true, reason: "Box auth failed (401)." };
    },
  );
  assert.equal(n, 1);
  assert.match(auth, /401/);
});

test("write verify retries tee once then names a miss", async () => {
  let exists = false;
  let rewrites = 0;
  const miss = await confirmWriteOnBox({
    path: "/tmp/a",
    testExists: async () => exists,
    rewrite: async () => {
      rewrites += 1;
    },
  });
  assert.equal(miss, formatWriteBoxMissing("/tmp/a"));
  assert.equal(rewrites, 1);
  assert.doesNotMatch(miss, /^Wrote /);

  exists = true;
  const ok = await confirmWriteOnBox({
    path: "/tmp/a",
    testExists: async () => exists,
    rewrite: async () => {
      rewrites += 1;
    },
  });
  assert.equal(ok, formatWriteBoxOk("/tmp/a"));
  assert.equal(rewrites, 1);
});

test("shell quote keeps spaces inside single quotes", () => {
  assert.equal(shellSingleQuote("a b"), "'a b'");
  assert.equal(shellSingleQuote("it's"), `'it'\\''s'`);
});
