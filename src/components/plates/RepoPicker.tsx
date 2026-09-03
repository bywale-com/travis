"use client";

import { useMemo, useState } from "react";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import type { RepoOption } from "@/server/create-agent";
import { quietLink } from "./shell";

export function RepoPicker({
  t,
  repos,
  recentUrl,
  onSelect,
  onClose,
}: {
  t: Tokens;
  repos: RepoOption[];
  recentUrl: string | null;
  onSelect: (repo: RepoOption) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");

  const org = repos[0]?.url.split("/")[1] ?? "";

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return repos;
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.url.toLowerCase().includes(term),
    );
  }, [repos, q]);

  const recent = recentUrl ? repos.find((r) => r.url === recentUrl) ?? null : null;
  const rest = filtered.filter((r) => r.url !== recentUrl);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `${t.bgPrimary}ee`,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "86dvh",
          background: t.bgElevated,
          borderRadius: "16px 16px 0 0",
          padding: "12px 20px 24px",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: t.border, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0, fontSize: TYPE.title }}>Repository</h2>
          {org ? (
            <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>{org}</span>
          ) : null}
        </div>
        <button type="button" onClick={onClose} style={{ ...quietLink(t), color: t.textMuted, fontSize: TYPE.meta, marginTop: 4 }}>
          Close
        </button>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search repos…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: 16,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            color: t.textPrimary,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: TYPE.body,
            fontFamily: "inherit",
            outline: "none",
          }}
        />

        {recent && !q ? (
          <>
            <p style={{ fontSize: TYPE.meta, letterSpacing: "0.08em", color: t.textMuted, margin: "20px 0 8px" }}>
              RECENTLY USED
            </p>
            <RepoRow repo={recent} t={t} onSelect={onSelect} />
          </>
        ) : null}

        <p style={{ fontSize: TYPE.meta, letterSpacing: "0.08em", color: t.textMuted, margin: "20px 0 8px" }}>
          {q ? "RESULTS" : "ALL REPOS"}
        </p>
        {rest.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: TYPE.meta }}>
            {repos.length === 0
              ? "No repos visible — check the Cursor connection."
              : "Nothing matches."}
          </p>
        ) : (
          rest.map((r) => <RepoRow key={r.url} repo={r} t={t} onSelect={onSelect} />)
        )}

        <p style={{ marginTop: 20, fontSize: TYPE.meta, color: t.textMuted }}>
          {repos.length} repos visible via GitHub{org ? ` · ${org}` : ""}
        </p>
      </div>
    </div>
  );
}

function RepoRow({ repo, t, onSelect }: { repo: RepoOption; t: Tokens; onSelect: (r: RepoOption) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(repo)}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        borderBottom: `1px solid ${t.border}`,
        background: "transparent",
        color: t.textPrimary,
        padding: "10px 0",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <span style={{ display: "block", fontSize: TYPE.body, fontWeight: 600 }}>
        {repo.name}
      </span>
      <span style={{ display: "block", fontSize: TYPE.meta, color: t.textMuted }}>
        {repo.url}
      </span>
    </button>
  );
}
