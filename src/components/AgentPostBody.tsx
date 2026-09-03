"use client";

import {
  parseAgentPost,
  type PostInline,
} from "@/lib/agent-post";
import type { Tokens } from "@/theme/tokens";
import type { CSSProperties, ReactNode } from "react";

function InlineRun({
  inlines,
  t,
}: {
  inlines: PostInline[];
  t: Tokens;
}) {
  return (
    <>
      {inlines.map((piece, i) =>
        piece.type === "code" ? (
          <code
            key={i}
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 13,
              background: t.hoverBg,
              color: t.textPrimary,
              borderRadius: 4,
              padding: "1px 5px",
            }}
          >
            {piece.text}
          </code>
        ) : piece.type === "link" ? (
          <a
            key={i}
            href={piece.href}
            target="_blank"
            rel="noreferrer"
            style={{ color: t.accent, wordBreak: "break-all" }}
          >
            {piece.text}
          </a>
        ) : (
          <span key={i}>{piece.text}</span>
        ),
      )}
    </>
  );
}

const blockGap: CSSProperties = { margin: 0 };

export function AgentPostBody({
  text,
  t,
}: {
  text: string;
  t: Tokens;
}): ReactNode {
  const blocks = parseAgentPost(text);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <p
              key={i}
              style={{
                ...blockGap,
                fontSize: 16,
                fontWeight: 650,
                lineHeight: 1.35,
                color: t.textPrimary,
              }}
            >
              <InlineRun inlines={block.inlines} t={t} />
            </p>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={i}
              style={{
                ...blockGap,
                paddingLeft: "1.2em",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                color: t.textPrimary,
              }}
            >
              {block.items.map((item, j) => (
                <li key={j} style={{ paddingLeft: 2 }}>
                  <InlineRun inlines={item} t={t} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={i} style={{ ...blockGap, color: t.textPrimary }}>
            <InlineRun inlines={block.inlines} t={t} />
          </p>
        );
      })}
    </div>
  );
}
