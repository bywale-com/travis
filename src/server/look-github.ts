/**
 * SCP-037 — Look GitHub side-effect. WAKE_GITHUB_TOKEN only.
 * Issue + PR comment hold the seed. Fresh-add outside-look. No table.
 */

import { LOOK_SEED_MARKER } from "@/lib/look-miss";

export const LOOK_NOT_WIRED = "Look is not wired. Set WAKE_GITHUB_TOKEN.";

const HOLD_LABELS = ["previewing", "blocker"] as const;
const STRIP_ON_LOOK = [
  "wake-sa",
  "wake-engineer",
  "wake-pm-look",
  "fail-look",
] as const;
const API = "https://api.github.com";

export class LookGithubError extends Error {
  constructor(
    message: string,
    public status: number,
    public issueNumber?: number,
  ) {
    super(message);
    this.name = "LookGithubError";
  }
}

export type LookGithubOk = {
  pr: number;
  labeled: boolean;
  issue?: number;
};

export function wakeGithubToken(env: NodeJS.ProcessEnv = process.env): string {
  return env.WAKE_GITHUB_TOKEN?.trim() || "";
}

function lookRepo(env: NodeJS.ProcessEnv): { owner: string; repo: string } {
  return {
    owner: env.VERCEL_GIT_REPO_OWNER?.trim() || "bywale-com",
    repo: env.VERCEL_GIT_REPO_SLUG?.trim() || "travis",
  };
}

function previewPrId(env: NodeJS.ProcessEnv): number | null {
  const raw = env.VERCEL_GIT_PULL_REQUEST_ID?.trim() ?? "";
  if (!raw || raw === "0") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function commitSha(env: NodeJS.ProcessEnv): string {
  return env.VERCEL_GIT_COMMIT_SHA?.trim() || "";
}

type GhResult = { status: number; text: string; json: unknown };

async function gh(
  token: string,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<GhResult> {
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "travis",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = null;
    }
  }
  return { status: res.status, text, json };
}

function refused(status: number, extra?: string): LookGithubError {
  const base = `GitHub refused Look (${status}).`;
  return new LookGithubError(extra ? `${base} ${extra}` : base, status);
}

async function ensureOutsideLookLabel(
  token: string,
  owner: string,
  repo: string,
): Promise<void> {
  const created = await gh(token, `/repos/${owner}/${repo}/labels`, {
    method: "POST",
    body: {
      name: "outside-look",
      color: "CCCCCC",
      description: "Cursor: outside look (lived miss from Log)",
    },
  });
  if (created.status === 201 || created.status === 422) return;
  if (created.status >= 400) throw refused(created.status);
}

async function commentOn(
  token: string,
  owner: string,
  repo: string,
  n: number,
  seed: string,
): Promise<void> {
  const res = await gh(token, `/repos/${owner}/${repo}/issues/${n}/comments`, {
    method: "POST",
    body: { body: seed },
  });
  if (res.status >= 400) throw refused(res.status);
}

async function issueLabels(
  token: string,
  owner: string,
  repo: string,
  n: number,
): Promise<string[]> {
  const res = await gh(token, `/repos/${owner}/${repo}/issues/${n}/labels`);
  if (res.status >= 400) throw refused(res.status);
  if (!Array.isArray(res.json)) return [];
  return res.json
    .map((row) =>
      row && typeof row === "object"
        ? String((row as { name?: string }).name ?? "")
        : "",
    )
    .filter(Boolean);
}

async function removeLabel(
  token: string,
  owner: string,
  repo: string,
  n: number,
  name: string,
): Promise<void> {
  await gh(
    token,
    `/repos/${owner}/${repo}/issues/${n}/labels/${encodeURIComponent(name)}`,
    { method: "DELETE" },
  );
}

async function addLabel(
  token: string,
  owner: string,
  repo: string,
  n: number,
  name: string,
): Promise<void> {
  const res = await gh(token, `/repos/${owner}/${repo}/issues/${n}/labels`, {
    method: "POST",
    body: { labels: [name] },
  });
  if (res.status >= 400) throw refused(res.status);
}

async function freshAddOutsideLook(
  token: string,
  owner: string,
  repo: string,
  n: number,
): Promise<void> {
  await removeLabel(token, owner, repo, n, "outside-look");
  await addLabel(token, owner, repo, n, "outside-look");
  for (const lab of STRIP_ON_LOOK) {
    await removeLabel(token, owner, repo, n, lab);
  }
}

function shouldHold(labels: string[]): boolean {
  return HOLD_LABELS.some((lab) => labels.includes(lab));
}

async function labelIfIdle(
  token: string,
  owner: string,
  repo: string,
  n: number,
): Promise<boolean> {
  const labels = await issueLabels(token, owner, repo, n);
  if (shouldHold(labels)) return false;
  await freshAddOutsideLook(token, owner, repo, n);
  return true;
}

type PullRow = {
  number?: number;
  state?: string;
  head?: { sha?: string; ref?: string };
};

async function openPrForSha(
  token: string,
  owner: string,
  repo: string,
  sha: string,
): Promise<number | null> {
  if (!sha) return null;
  const res = await gh(token, `/repos/${owner}/${repo}/commits/${sha}/pulls`);
  if (res.status >= 400 || !Array.isArray(res.json)) return null;
  const open = (res.json as PullRow[]).filter((p) => p.state === "open");
  const match = open.find((p) => p.head?.sha === sha);
  const pick = match ?? open[0];
  const n = Number(pick?.number);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function openPrForHead(
  token: string,
  owner: string,
  repo: string,
  head: string,
): Promise<number | null> {
  const q = new URLSearchParams({
    head: `${owner}:${head}`,
    state: "open",
  });
  const res = await gh(token, `/repos/${owner}/${repo}/pulls?${q.toString()}`);
  if (res.status >= 400 || !Array.isArray(res.json)) return null;
  const n = Number((res.json as PullRow[])[0]?.number);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function createIssue(
  token: string,
  owner: string,
  repo: string,
  seed: string,
): Promise<{ number: number; htmlUrl: string }> {
  const res = await gh(token, `/repos/${owner}/${repo}/issues`, {
    method: "POST",
    body: { title: "Look — lived miss", body: seed },
  });
  const json = res.json as { number?: number; html_url?: string } | null;
  if (res.status >= 400 || !json?.number) {
    throw refused(res.status);
  }
  return {
    number: json.number,
    htmlUrl: String(json.html_url ?? "").trim(),
  };
}

async function refExists(
  token: string,
  owner: string,
  repo: string,
  issue: number,
): Promise<boolean> {
  const res = await gh(
    token,
    `/repos/${owner}/${repo}/git/matching-refs/heads/look/${issue}`,
  );
  return res.status === 200 && Array.isArray(res.json) && res.json.length > 0;
}

async function emptyCommitBranch(
  token: string,
  owner: string,
  repo: string,
  sha: string,
  issue: number,
): Promise<void> {
  const commit = await gh(token, `/repos/${owner}/${repo}/git/commits/${sha}`);
  const tree = (commit.json as { tree?: { sha?: string } } | null)?.tree?.sha;
  if (commit.status >= 400 || !tree) {
    throw refused(commit.status);
  }
  const made = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: {
      message: "Look — lived miss",
      tree,
      parents: [sha],
    },
  });
  const newSha = (made.json as { sha?: string } | null)?.sha;
  if (made.status >= 400 || !newSha) throw refused(made.status);
  const ref = await gh(token, `/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    body: {
      ref: `refs/heads/look/${issue}`,
      sha: newSha,
    },
  });
  if (ref.status === 422) return;
  if (ref.status >= 400) throw refused(ref.status);
}

async function createDraftPr(
  token: string,
  owner: string,
  repo: string,
  issue: number,
  seed: string,
): Promise<number> {
  const res = await gh(token, `/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    body: {
      title: "Look — lived miss",
      head: `look/${issue}`,
      base: "main",
      body: seed,
      draft: true,
    },
  });
  const n = Number((res.json as { number?: number } | null)?.number);
  if (res.status === 422) {
    const existing = await openPrForHead(token, owner, repo, `look/${issue}`);
    if (existing) return existing;
  }
  if (res.status >= 400 || !Number.isInteger(n) || n <= 0) {
    throw refused(res.status);
  }
  return n;
}

async function fileOnPr(
  token: string,
  owner: string,
  repo: string,
  pr: number,
  seed: string,
  issue?: number,
): Promise<LookGithubOk> {
  await commentOn(token, owner, repo, pr, seed);
  const labeled = await labelIfIdle(token, owner, repo, pr);
  return issue ? { pr, labeled, issue } : { pr, labeled };
}

export async function fileLookOnGithub(args: {
  seed: string;
  env?: NodeJS.ProcessEnv;
}): Promise<LookGithubOk> {
  const env = args.env ?? process.env;
  const token = wakeGithubToken(env);
  if (!token) throw new LookGithubError(LOOK_NOT_WIRED, 503);
  if (!args.seed.includes(LOOK_SEED_MARKER)) {
    throw new LookGithubError("GitHub refused Look (seed).", 500);
  }

  const { owner, repo } = lookRepo(env);
  await ensureOutsideLookLabel(token, owner, repo);

  const preview = previewPrId(env);
  if (preview) {
    return fileOnPr(token, owner, repo, preview, args.seed);
  }

  const sha = commitSha(env);
  const fromSha = await openPrForSha(token, owner, repo, sha);
  if (fromSha) {
    return fileOnPr(token, owner, repo, fromSha, args.seed);
  }

  let issue: { number: number; htmlUrl: string };
  try {
    issue = await createIssue(token, owner, repo, args.seed);
  } catch (err) {
    if (err instanceof LookGithubError) throw err;
    throw refused(500);
  }

  try {
    const existing = await openPrForHead(
      token,
      owner,
      repo,
      `look/${issue.number}`,
    );
    if (existing) {
      return fileOnPr(token, owner, repo, existing, args.seed, issue.number);
    }
    const branched = await refExists(token, owner, repo, issue.number);
    if (!branched) {
      if (!sha) {
        throw new LookGithubError(
          `GitHub refused Look (no SHA). ${issue.htmlUrl}`,
          503,
          issue.number,
        );
      }
      await emptyCommitBranch(token, owner, repo, sha, issue.number);
    }
    const pr = await createDraftPr(
      token,
      owner,
      repo,
      issue.number,
      args.seed,
    );
    return fileOnPr(token, owner, repo, pr, args.seed, issue.number);
  } catch (err) {
    if (err instanceof LookGithubError) {
      const msg = issue.htmlUrl
        ? `${err.message} ${issue.htmlUrl}`.trim()
        : err.message;
      throw new LookGithubError(msg, err.status, issue.number);
    }
    throw new LookGithubError(
      `GitHub refused Look (500). ${issue.htmlUrl}`,
      500,
      issue.number,
    );
  }
}
