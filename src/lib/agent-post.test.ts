import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAgentPost, parseInline, speakableAgentPost } from "./agent-post";

test("heading, list, inline code, paragraphs", () => {
  const blocks = parseAgentPost(
    [
      "## Bind path",
      "",
      "- quote the user turn",
      "- keep `via` on the session",
      "- do not mint a table",
      "",
      "That is the plant.",
      "Second sentence same para.",
    ].join("\n"),
  );
  assert.equal(blocks[0]?.type, "heading");
  assert.equal(blocks[1]?.type, "list");
  assert.equal(blocks[2]?.type, "paragraph");
  if (blocks[0]?.type === "heading") {
    assert.equal(blocks[0].inlines[0]?.type, "text");
    assert.equal(blocks[0].inlines[0] && "text" in blocks[0].inlines[0] ? blocks[0].inlines[0].text : "", "Bind path");
  }
  if (blocks[1]?.type === "list") {
    assert.equal(blocks[1].ordered, false);
    assert.equal(blocks[1].items.length, 3);
    const via = blocks[1].items[1].find((p) => p.type === "code");
    assert.equal(via && via.type === "code" ? via.text : "", "via");
  }
});

test("bold-only line is a heading, not a bar", () => {
  const blocks = parseAgentPost("**Bind path**\n\n- one");
  assert.equal(blocks[0]?.type, "heading");
  assert.equal(blocks[1]?.type, "list");
});

test("numbered list", () => {
  const blocks = parseAgentPost("1. alpha\n2. beta `x`");
  assert.equal(blocks[0]?.type, "list");
  if (blocks[0]?.type === "list") {
    assert.equal(blocks[0].ordered, true);
    assert.equal(blocks[0].items.length, 2);
  }
});

test("speakable strips hashes, ticks, and list marks", () => {
  const spoken = speakableAgentPost(
    "## Bind path\n\n- keep `via` on the session\n\n**Hold** it. *Quote.*\n\nDone.",
  );
  assert.equal(spoken.includes("#"), false);
  assert.equal(spoken.includes("`"), false);
  assert.equal(spoken.includes("*"), false);
  assert.equal(spoken.includes("- keep"), false);
  assert.match(spoken, /Bind path/);
  assert.match(spoken, /keep via on the session/);
  assert.match(spoken, /Hold it/);
  assert.match(spoken, /Quote/);
  assert.match(spoken, /Done/);
});

test("flat text stays one paragraph", () => {
  const blocks = parseAgentPost("just a line");
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0]?.type, "paragraph");
});

test("inline bold and italic drop the marks", () => {
  const bits = parseInline(`keep **hold** and *quote* next to \`via\``);
  assert.equal(bits.some((p) => p.type === "bold" && p.text === "hold"), true);
  assert.equal(bits.some((p) => p.type === "italic" && p.text === "quote"), true);
  assert.equal(bits.some((p) => p.type === "code" && p.text === "via"), true);
  assert.equal(
    bits.some((p) => p.type === "text" && p.text.includes("*")),
    false,
  );
});

test("http links stay text and split from punctuation", () => {
  const bits = parseInline("see https://travis.example/shot.png.");
  assert.equal(bits.some((p) => p.type === "link"), true);
  const link = bits.find((p) => p.type === "link");
  assert.equal(link && link.type === "link" ? link.href : "", "https://travis.example/shot.png");
  assert.equal(bits.some((p) => p.type === "text" && p.text === "."), true);
  const code = parseInline("keep `https://inside.example` as code");
  assert.equal(code.some((p) => p.type === "link"), false);
  assert.equal(code.some((p) => p.type === "code"), true);
});
