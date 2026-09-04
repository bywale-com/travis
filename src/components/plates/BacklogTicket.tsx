"use client";

import { useState } from "react";
import { FileText, Image } from "lucide-react";
import { AgentPostBody } from "@/components/AgentPostBody";
import { SeatMark } from "@/components/QueueChrome";
import { seatKeyToShort } from "@/lib/router";
import { backlogStageKeys, backlogWithLine } from "@/lib/backlog-face";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { plateShell, quietLink } from "./shell";

export type BacklogTicketPost = {
  id: string;
  seatKey: string | null;
  text: string;
};

export type BacklogTicketFile = {
  id: string;
  turnId: string;
  kind: "image" | "file";
  filename: string;
  seatKey: string | null;
};

export type BacklogTicketData = {
  id: string;
  title: string;
  status: string;
  founding: { id: string; text: string } | null;
  posts: BacklogTicketPost[];
  next: "travis" | "pm" | "sa" | "engineer" | null;
  attachments: BacklogTicketFile[];
};

type TicketDoor = "messages" | "artifacts";

function nextLabel(ticket: BacklogTicketData): string {
  const withLine = backlogWithLine(ticket.next, ticket.status);
  if (!withLine) return "";
  if (withLine.startsWith("With ")) return `Next · ${withLine.slice(5)}`;
  return withLine;
}

export function BacklogTicket({
  t,
  ticket,
  onBack,
  onOpenLog,
}: {
  t: Tokens;
  ticket: BacklogTicketData;
  onBack: () => void;
  onOpenLog: (turnId: string) => void;
}) {
  const [door, setDoor] = useState<TicketDoor>("messages");
  const title = ticket.title.trim() || ticket.founding?.text.trim() || "Untitled";
  const lit = ticket.posts
    .map((p) => p.seatKey)
    .filter((k): k is string => Boolean(k));
  const stage = backlogStageKeys(lit, ticket.next);
  const nextWord = nextLabel(ticket);

  return (
    <SurfaceBoundary
      id="backlog-ticket"
      label="Backlog ticket"
      order={9}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 43,
        background: t.bgPrimary,
      }}
    >
      <div style={{ ...plateShell(t), overflowY: "auto" }}>
        <header style={{ padding: "16px 20px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <button type="button" onClick={onBack} style={quietLink(t)}>
              ← Backlog
            </button>
            <span style={{ color: t.textMuted, fontSize: TYPE.meta }}>
              {nextWord}
            </span>
          </div>
          <h1
            style={{
              fontSize: TYPE.title,
              fontWeight: 700,
              margin: "16px 0 12px",
              textAlign: "center",
            }}
          >
            {title}
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {stage.map((key) => (
              <SeatMark
                key={key}
                seatKey={key}
                t={t}
                size={key === ticket.next ? 36 : 28}
                glow={key === ticket.next && ticket.status !== "done"}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 28,
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            {(["messages", "artifacts"] as const).map((id) => {
              const on = door === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDoor(id)}
                  style={{
                    border: "none",
                    background: "none",
                    padding: "8px 0",
                    cursor: "pointer",
                    color: on ? t.textPrimary : t.textMuted,
                    fontSize: TYPE.body,
                    fontWeight: on ? 700 : 500,
                    borderBottom: on
                      ? `2px solid ${t.textPrimary}`
                      : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  {id === "messages" ? "Messages" : "Artifacts"}
                </button>
              );
            })}
          </div>
        </header>

        {door === "messages" ? (
          <div
            style={{
              padding: "20px 20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {ticket.founding ? (
              <div
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "92%",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                }}
              >
                <span
                  aria-label="Initiative"
                  style={{
                    width: 16,
                    height: 16,
                    marginBottom: 6,
                    borderRadius: "50%",
                    border: `1.5px solid ${t.accent}`,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    background: t.userBubble,
                    color: t.textPrimary,
                    borderRadius: 16,
                    padding: "10px 14px",
                    fontSize: TYPE.body,
                  }}
                >
                  {ticket.founding.text}
                </div>
              </div>
            ) : null}

            {ticket.posts.map((post) => {
              const files = ticket.attachments.filter((a) => a.turnId === post.id);
              return (
                <div key={post.id} style={{ display: "flex", gap: 8, maxWidth: "92%" }}>
                  <SeatMark seatKey={post.seatKey || "pm"} t={t} size={28} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        background: t.assistantBubble,
                        color: t.textPrimary,
                        borderRadius: 16,
                        padding: "10px 14px",
                        fontSize: TYPE.body,
                        border: `1px solid ${t.border}`,
                      }}
                    >
                      <AgentPostBody text={post.text} t={t} />
                    </div>
                    {files.map((file) => (
                      <ArtifactQuiet key={file.id} t={t} file={file} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {ticket.attachments.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: t.textMuted,
                  fontStyle: "italic",
                  marginTop: 48,
                }}
              >
                None yet.
              </p>
            ) : (
              ticket.attachments.map((file) => (
                <a
                  key={file.id}
                  href={`/api/artifacts/${file.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    borderBottom: `1px solid ${t.border}`,
                    color: t.textPrimary,
                    textDecoration: "none",
                  }}
                >
                  {file.kind === "image" ? (
                    <Image size={18} color={t.textMuted} />
                  ) : (
                    <FileText size={18} color={t.textMuted} />
                  )}
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: TYPE.body,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {file.filename}
                  </span>
                  <span style={{ color: t.textMuted, fontSize: TYPE.meta }}>
                    {seatKeyToShort(file.seatKey)}
                  </span>
                </a>
              ))
            )}
          </div>
        )}

        <footer
          style={{
            marginTop: "auto",
            padding: "12px 20px 28px",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={() =>
              onOpenLog(ticket.founding?.id ?? ticket.posts[0]?.id ?? "")
            }
            style={{ ...quietLink(t), color: t.textMuted }}
          >
            Open in log
          </button>
        </footer>
      </div>
    </SurfaceBoundary>
  );
}

function ArtifactQuiet({
  t,
  file,
}: {
  t: Tokens;
  file: BacklogTicketFile;
}) {
  return (
    <div style={{ marginTop: 8 }}>
      <a
        href={`/api/artifacts/${file.id}`}
        style={{
          color: t.textSecondary,
          fontSize: TYPE.meta,
          textDecoration: "none",
        }}
      >
        {file.filename}
      </a>
      {file.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/artifacts/${file.id}`}
          alt={file.filename}
          style={{
            display: "block",
            marginTop: 8,
            maxWidth: "100%",
            borderRadius: 10,
          }}
        />
      ) : null}
    </div>
  );
}
