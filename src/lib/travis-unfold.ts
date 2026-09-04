/**
 * 021 — Unfold law. House templates → box → new GitHub repo.
 * Token is TRAVIS_GITHUB_TOKEN only. Not GITHUB_TOKEN. Not a table.
 */

export const UNFOLD_NOT_WIRED =
  "Unfold is not wired. Set TRAVIS_GITHUB_TOKEN.";

export const UNFOLD_EMPTY =
  "House template /templates/work-repo is empty. File it with write_os.";

export const WORK_REPO_HOUSE = "/templates/work-repo";

export const UNFOLD_REPO_MAX = 100;
export const UNFOLD_REPO_SLUG = /^[A-Za-z0-9._-]+$/;

export function githubToken(env: NodeJS.ProcessEnv = process.env): string {
  return env.TRAVIS_GITHUB_TOKEN?.trim() || "";
}

export function parseUnfoldName(
  raw: unknown,
): { ok: true; name: string } | { ok: false; reason: string } {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, reason: "Need a repo name." };
  }
  const name = raw.trim();
  if (name.length > UNFOLD_REPO_MAX) {
    return { ok: false, reason: "Repo name is too long." };
  }
  if (!UNFOLD_REPO_SLUG.test(name)) {
    return {
      ok: false,
      reason: "Repo name is letters, numbers, . _ -.",
    };
  }
  return { ok: true, name };
}

export function workTreeOnBox(name: string): string {
  return `/work/${name}`;
}

export function formatUnfoldOk(htmlUrl: string, proveText: string): string {
  const url = htmlUrl.trim();
  const prove = proveText.trim();
  return prove ? `Unfolded ${url}. ${prove}` : `Unfolded ${url}.`;
}

export function formatUnfoldCollision(): string {
  return "GitHub already has that name.";
}

export function boxPathForHouseFile(name: string, relative: string): string {
  return `${workTreeOnBox(name)}/${relative}`;
}
