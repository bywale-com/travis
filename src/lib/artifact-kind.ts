/**
 * SCP-009 — kind and hang window. No bytes. No URL.
 */

export type ArtifactKind = "image" | "file";

const IMAGE_SUFFIX = /\.(png|jpe?g|gif|webp)$/i;

export function artifactKindFromPath(path: string): ArtifactKind {
  return IMAGE_SUFFIX.test(path.trim()) ? "image" : "file";
}

export function isHttpArtifactPath(path: string): boolean {
  return /^https?:\/\//i.test(path.trim());
}

const MD_IMAGE =
  /!\[(?:[^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;

/** Markdown `![alt](src)` srcs — hang those on this post. */
export function markdownImageSrcs(text: string): string[] {
  const out: string[] = [];
  const re = new RegExp(MD_IMAGE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const src = m[1]?.trim() ?? "";
    if (src && !out.includes(src)) out.push(src);
  }
  return out;
}

export function stripMarkdownImages(text: string): string {
  return text
    .replace(
      /!\[(?:[^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g,
      "",
    )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Any IMAGE_SUFFIX path in a process body. No closed tool-name list. */
export function imagePathsFromProcessBody(body: string): string[] {
  const out: string[] = [];
  const re =
    /(?:https?:\/\/[^\s<>"'`\\]+|[^\s<>"'`\\]+)\.(?:png|jpe?g|gif|webp)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const raw = m[0].replace(/[),.;!?]+$/g, "");
    if (IMAGE_SUFFIX.test(raw) && !out.includes(raw)) out.push(raw);
  }
  return out;
}

export function artifactFilename(path: string): string {
  const trimmed = path.trim().replace(/\\/g, "/");
  const base = trimmed.split("/").filter(Boolean).pop() ?? "";
  return base || trimmed;
}

export function artifactContentType(kind: ArtifactKind, path: string): string {
  const name = artifactFilename(path).toLowerCase();
  if (kind === "image" || IMAGE_SUFFIX.test(name)) {
    if (name.endsWith(".png")) return "image/png";
    if (name.endsWith(".gif")) return "image/gif";
    if (name.endsWith(".webp")) return "image/webp";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  }
  return "application/octet-stream";
}

export function parseCursorUpdatedAt(raw: unknown): Date | null {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw !== "string" || !raw.trim()) return null;
  const at = new Date(raw);
  return Number.isNaN(at.getTime()) ? null : at;
}

/** Hang files this run touched. Missing startedAt → skip. Missing updatedAt → hang if the path is new. */
export function shouldHangArtifact(params: {
  startedAt?: Date | null;
  updatedAt?: Date | null;
  alreadyHung?: boolean;
}): boolean {
  if (params.alreadyHung) return false;
  if (!params.startedAt) return false;
  if (!params.updatedAt) return true;
  return params.updatedAt.getTime() >= params.startedAt.getTime();
}

export function formatLandedFiles(
  attachments: Array<{ filename: string }>,
): string {
  if (!attachments.length) return "";
  return `Files: ${attachments.map((a) => a.filename).join(", ")}.`;
}

export function dispositionFilename(filename: string): string {
  return filename.replace(/["\\\r\n]/g, "_").slice(0, 180) || "artifact";
}
