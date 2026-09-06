"use client";

import { createPortal } from "react-dom";
import { ChromeIcon } from "@/theme/icons";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { quietLink } from "./shell";

export type ArtifactRow = {
  id: string;
  turnId: string;
  kind: "image" | "file";
  filename: string;
  seenAt?: string | Date | null;
};

export function ArtifactsDoor({
  t,
  artifacts,
  onClose,
  onOpen,
}: {
  t: Tokens;
  artifacts: ArtifactRow[];
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  const sheet = (
    <SurfaceBoundary
      id="artifacts-compartment"
      label="Artifacts"
      order={10}
      icon="artifacts"
      style={{
        position: "fixed",
        inset: 0,
        background: `${t.bgPrimary}ee`,
        zIndex: 42,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "86dvh",
          background: t.bgElevated,
          borderRadius: "16px 16px 0 0",
          padding: "16px 20px 24px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0, fontSize: TYPE.title }}>Artifacts</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ ...quietLink(t), color: t.textMuted, fontSize: TYPE.meta }}
          >
            Close
          </button>
        </div>
        {artifacts.length === 0 ? (
          <p
            style={{
              margin: "24px 0 0",
              color: t.textMuted,
              fontSize: TYPE.body,
            }}
          >
            None yet.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }}>
            {artifacts.map((row) => {
              const unseen = !row.seenAt;
              return (
                <li key={row.id}>
                  {row.kind === "file" ? (
                    <a
                      href={`/api/artifacts/${row.id}`}
                      onClick={() => onOpen(row.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 0",
                        borderBottom: `1px solid ${t.border}`,
                        color: unseen ? t.textPrimary : t.textMuted,
                        fontWeight: unseen ? 600 : 400,
                        textDecoration: "none",
                        fontSize: TYPE.body,
                      }}
                    >
                      <ChromeIcon slug="artifacts" color={t.textSecondary} size={18} />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.filename}
                      </span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpen(row.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        padding: "12px 0",
                        border: "none",
                        borderBottom: `1px solid ${t.border}`,
                        background: "none",
                        color: unseen ? t.textPrimary : t.textMuted,
                        fontWeight: unseen ? 600 : 400,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: TYPE.body,
                        textAlign: "left",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/artifacts/${row.id}`}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 6,
                          flexShrink: 0,
                          background: t.hoverBg,
                        }}
                      />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.filename}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SurfaceBoundary>
  );
  if (typeof document === "undefined") return sheet;
  return createPortal(sheet, document.body);
}

export function ArtifactFull({
  t,
  artifact,
  onClose,
}: {
  t: Tokens;
  artifact: ArtifactRow;
  onClose: () => void;
}) {
  const sheet = (
    <SurfaceBoundary
      id="artifact-full"
      label="Artifact"
      order={11}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 44,
        background: t.bgPrimary,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "16px 20px 0",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            ...quietLink(t),
            color: t.textMuted,
            fontSize: 22,
            lineHeight: 1,
            textDecoration: "none",
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          minHeight: 0,
        }}
      >
        {artifact.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/artifacts/${artifact.id}`}
            alt={artifact.filename}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ) : (
          <a
            href={`/api/artifacts/${artifact.id}`}
            style={{ ...quietLink(t), fontSize: TYPE.body }}
          >
            {artifact.filename}
          </a>
        )}
      </div>
    </SurfaceBoundary>
  );
  if (typeof document === "undefined") return sheet;
  return createPortal(sheet, document.body);
}

export function ArtifactsChromeButton({
  t,
  unseen,
  onOpen,
}: {
  t: Tokens;
  unseen: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={unseen ? `Artifacts, ${unseen} new` : "Artifacts"}
      style={{
        position: "relative",
        border: "none",
        background: "none",
        padding: 4,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <ChromeIcon slug="artifacts" color={t.textSecondary} size={22} />
      {unseen > 0 ? (
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -4,
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            borderRadius: 999,
            background: t.accent,
            color: t.bgPrimary,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: "16px",
            textAlign: "center",
          }}
        >
          {unseen}
        </span>
      ) : null}
    </button>
  );
}
