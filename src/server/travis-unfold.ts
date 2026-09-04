/**
 * 021 — unfold_repo. House /templates/work-repo → box /work/<name> → new GitHub repo.
 * Create from Vercel. Push from the box. Token is exec env — never teed onto disk.
 * Not a seat send. Not 042. Not a browser.
 */

import { BOX_NOT_WIRED } from "@/lib/travis-box";
import {
  UNFOLD_EMPTY,
  UNFOLD_NOT_WIRED,
  WORK_REPO_HOUSE,
  boxPathForHouseFile,
  formatUnfoldCollision,
  formatUnfoldOk,
  githubToken,
  parseUnfoldName,
  workTreeOnBox,
} from "@/lib/travis-unfold";
import { listOsFilesUnder } from "@/server/os-house";
import {
  BoxError,
  boxWired,
  execBoxRaw,
  proveBox,
  writeBox,
} from "@/server/travis-box";
import { shellSingleQuote } from "@/lib/travis-prove";

export class UnfoldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnfoldError";
  }
}

function parentDir(path: string): string {
  const i = path.lastIndexOf("/");
  return i <= 0 ? "/" : path.slice(0, i);
}

function pushEnv(token: string): Record<string, string> {
  return {
    PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    HOME: "/root",
    TRAVIS_GITHUB_TOKEN: token,
  };
}

async function createGithubRepo(
  token: string,
  name: string,
): Promise<{ htmlUrl: string; fullName: string }> {
  const res = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "travis",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ name, private: true }),
  });
  const raw = await res.text();
  if (res.status === 422) {
    throw new UnfoldError(formatUnfoldCollision());
  }
  if (!res.ok) {
    throw new UnfoldError(`GitHub refused the create (${res.status}).`);
  }
  let json: { html_url?: string; full_name?: string };
  try {
    json = JSON.parse(raw) as { html_url?: string; full_name?: string };
  } catch {
    throw new UnfoldError("GitHub create returned no repo.");
  }
  const htmlUrl = String(json.html_url ?? "").trim();
  const fullName = String(json.full_name ?? "").trim();
  if (!htmlUrl || !fullName) {
    throw new UnfoldError("GitHub create returned no repo.");
  }
  return { htmlUrl, fullName };
}

export async function unfoldRepo(nameRaw: unknown): Promise<string> {
  const parsed = parseUnfoldName(nameRaw);
  if (!parsed.ok) throw new UnfoldError(parsed.reason);

  const files = await listOsFilesUnder(WORK_REPO_HOUSE);
  if (!files.length) throw new UnfoldError(UNFOLD_EMPTY);

  const token = githubToken();
  if (!token) throw new UnfoldError(UNFOLD_NOT_WIRED);
  if (!boxWired()) throw new BoxError(BOX_NOT_WIRED, { noRetry: true });

  const tree = workTreeOnBox(parsed.name);
  await execBoxRaw({ cmd: `mkdir -p ${shellSingleQuote(tree)}` });
  for (const file of files) {
    const dest = boxPathForHouseFile(parsed.name, file.relative);
    const parent = parentDir(dest);
    if (parent !== "/") {
      await execBoxRaw({ cmd: `mkdir -p ${shellSingleQuote(parent)}` });
    }
    const wrote = await writeBox(dest, file.body || "\n");
    if (!wrote.startsWith("Wrote ")) {
      throw new UnfoldError(wrote);
    }
  }

  const quotedTree = shellSingleQuote(tree);
  const committed = await execBoxRaw({
    cmd: `git -C ${quotedTree} init && git -C ${quotedTree} config user.email travis@box && git -C ${quotedTree} config user.name Travis && git -C ${quotedTree} add -A && git -C ${quotedTree} commit -m Unfold`,
    timeoutMs: 30_000,
  });
  if (committed.exit !== 0) {
    throw new UnfoldError(
      `git commit failed. ${committed.stderr || committed.stdout}`.trim(),
    );
  }

  const created = await createGithubRepo(token, parsed.name);
  const remote = `https://github.com/${created.fullName}.git`;
  const quotedRemote = shellSingleQuote(remote);
  const env = pushEnv(token);
  const pushed = await execBoxRaw({
    cmd: `git -C ${quotedTree} remote add origin ${quotedRemote} && git -C ${quotedTree} -c http.extraHeader="Authorization: Bearer $TRAVIS_GITHUB_TOKEN" push -u origin HEAD`,
    env,
    timeoutMs: 60_000,
  });
  if (pushed.exit !== 0) {
    throw new UnfoldError(
      `git push failed. ${pushed.stderr || pushed.stdout} Same box. Do not mint a ticket.`.trim(),
    );
  }

  const lsRemote = `git -c http.extraHeader="Authorization: Bearer $TRAVIS_GITHUB_TOKEN" ls-remote ${quotedRemote}`;
  const proved = await proveBox(
    { do: lsRemote, check: lsRemote },
    { env, timeoutMs: 60_000 },
  );
  return formatUnfoldOk(created.htmlUrl, proved);
}
