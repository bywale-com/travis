import assert from "node:assert/strict";
import test from "node:test";
import {
  artifactContentType,
  artifactFilename,
  artifactKindFromPath,
  formatLandedFiles,
  parseCursorUpdatedAt,
  shouldHangArtifact,
} from "./artifact-kind";

test("png jpeg gif webp are images; everything else is a file", () => {
  assert.equal(artifactKindFromPath("artifacts/shot.png"), "image");
  assert.equal(artifactKindFromPath("artifacts/shot.JPG"), "image");
  assert.equal(artifactKindFromPath("artifacts/shot.jpeg"), "image");
  assert.equal(artifactKindFromPath("artifacts/shot.gif"), "image");
  assert.equal(artifactKindFromPath("artifacts/shot.webp"), "image");
  assert.equal(artifactKindFromPath("artifacts/notes.md"), "file");
  assert.equal(artifactKindFromPath("artifacts/data.zip"), "file");
  assert.equal(artifactKindFromPath("https://example.com/x.png"), "image");
});

test("filename is the basename", () => {
  assert.equal(artifactFilename("artifacts/shot.png"), "shot.png");
  assert.equal(artifactFilename("shot.png"), "shot.png");
});

test("content type follows the path", () => {
  assert.equal(artifactContentType("image", "artifacts/a.png"), "image/png");
  assert.equal(artifactContentType("image", "artifacts/a.jpeg"), "image/jpeg");
  assert.equal(artifactContentType("file", "artifacts/a.md"), "application/octet-stream");
});

test("out-of-ticket and missing window do not hang", () => {
  const started = new Date("2026-09-03T12:00:00Z");
  const late = new Date("2026-09-03T12:01:00Z");
  const early = new Date("2026-09-03T11:00:00Z");
  assert.equal(
    shouldHangArtifact({
      initiativeId: null,
      startedAt: started,
      updatedAt: late,
    }),
    false,
  );
  assert.equal(
    shouldHangArtifact({
      initiativeId: "t",
      startedAt: null,
      updatedAt: late,
    }),
    false,
  );
  assert.equal(
    shouldHangArtifact({
      initiativeId: "t",
      startedAt: started,
      updatedAt: null,
    }),
    false,
  );
  assert.equal(
    shouldHangArtifact({
      initiativeId: "t",
      startedAt: started,
      updatedAt: early,
    }),
    false,
  );
  assert.equal(
    shouldHangArtifact({
      initiativeId: "t",
      startedAt: started,
      updatedAt: late,
    }),
    true,
  );
  assert.equal(
    shouldHangArtifact({
      initiativeId: "t",
      startedAt: started,
      updatedAt: started,
    }),
    true,
  );
});

test("updatedAt parses ISO; junk is null", () => {
  const at = parseCursorUpdatedAt("2026-09-03T12:00:00.000Z");
  assert.ok(at);
  assert.equal(at.toISOString(), "2026-09-03T12:00:00.000Z");
  assert.equal(parseCursorUpdatedAt(""), null);
  assert.equal(parseCursorUpdatedAt("nope"), null);
});

test("read lists filenames; empty stays quiet", () => {
  assert.equal(formatLandedFiles([]), "");
  assert.equal(
    formatLandedFiles([{ filename: "shot.png" }, { filename: "notes.md" }]),
    "Files: shot.png, notes.md.",
  );
});
