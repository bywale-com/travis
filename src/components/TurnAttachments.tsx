"use client";

import type { Tokens } from "@/theme/tokens";
import { TYPE } from "@/theme/scale";

export type TurnFile = {
  id: string;
  kind: "image" | "file";
  filename: string;
};

export function TurnAttachments({
  files,
  t,
}: {
  files: TurnFile[];
  t: Tokens;
}) {
  if (!files.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
      {files.map((file) => (
        <div key={file.id}>
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
      ))}
    </div>
  );
}
