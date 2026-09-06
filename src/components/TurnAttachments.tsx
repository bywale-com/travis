"use client";

import { useEffect, useRef } from "react";
import type { Tokens } from "@/theme/tokens";
import { TYPE } from "@/theme/scale";

export type TurnFile = {
  id: string;
  kind: "image" | "file";
  filename: string;
  seenAt?: string | Date | null;
};

export function TurnAttachments({
  files,
  t,
  onSeen,
}: {
  files: TurnFile[];
  t: Tokens;
  onSeen?: (id: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!onSeen || !rootRef.current) return;
    const nodes = rootRef.current.querySelectorAll<HTMLElement>("[data-artifact-id]");
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("data-artifact-id");
          if (!id || seen.has(id)) continue;
          seen.add(id);
          onSeen(id);
        }
      },
      { threshold: 0.55 },
    );
    for (const node of nodes) io.observe(node);
    return () => io.disconnect();
  }, [files, onSeen]);

  if (!files.length) return null;
  return (
    <div
      ref={rootRef}
      style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}
    >
      {files.map((file) => (
        <div key={file.id} data-artifact-id={file.id}>
          <a
            href={`/api/artifacts/${file.id}`}
            onClick={() => onSeen?.(file.id)}
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
              onClick={() => onSeen?.(file.id)}
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
