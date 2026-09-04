import assert from "node:assert/strict";
import test from "node:test";
import {
  UNFOLD_EMPTY,
  UNFOLD_NOT_WIRED,
  WORK_REPO_HOUSE,
  boxPathForHouseFile,
  formatUnfoldCollision,
  formatUnfoldOk,
  githubToken,
  parseUnfoldName,
  workTreeOnBox,
} from "./travis-unfold";

test("unfold token is TRAVIS_GITHUB_TOKEN only", () => {
  assert.equal(githubToken({}), "");
  assert.equal(githubToken({ GITHUB_TOKEN: "wrong" }), "");
  assert.equal(githubToken({ TRAVIS_GITHUB_TOKEN: "ghp_ok" }), "ghp_ok");
  assert.match(UNFOLD_NOT_WIRED, /TRAVIS_GITHUB_TOKEN/);
});

test("empty house template is a named fail", () => {
  assert.match(UNFOLD_EMPTY, /\/templates\/work-repo/);
  assert.match(UNFOLD_EMPTY, /write_os/);
  assert.equal(WORK_REPO_HOUSE, "/templates/work-repo");
});

test("repo name is a slug", () => {
  assert.deepEqual(parseUnfoldName("seats-lab"), { ok: true, name: "seats-lab" });
  assert.equal(parseUnfoldName("").ok, false);
  assert.equal(parseUnfoldName("has space").ok, false);
  assert.equal(parseUnfoldName("a".repeat(101)).ok, false);
  assert.equal(parseUnfoldName("../etc").ok, false);
});

test("box tree is /work/<name>/<relative>", () => {
  assert.equal(workTreeOnBox("seats-lab"), "/work/seats-lab");
  assert.equal(
    boxPathForHouseFile("seats-lab", "docs/seats/README.md"),
    "/work/seats-lab/docs/seats/README.md",
  );
});

test("collision does not mint a cousin name", () => {
  assert.equal(formatUnfoldCollision(), "GitHub already has that name.");
});

test("unfold receipt includes the repo url and the prove line", () => {
  const text = formatUnfoldOk(
    "https://github.com/acme/seats-lab",
    "Proved. attempt 1/3.",
  );
  assert.match(text, /https:\/\/github.com\/acme\/seats-lab/);
  assert.match(text, /Proved\. attempt 1\/3/);
});
