/**
 * SCP-009 — kind and hang window. No bytes. No URL.
 */

export type ArtifactKind = "image" | "file";

const IMAGE_SUFFIX = /\.(png|jpe?g|gif|webp)$/i;

export function artifactKindFromPath(path: string): ArtifactKind {
  return IMAGE_SUFFIX.test(path.trim()) ? "image" : "file";
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

/** Hang files this run touched. Ticket not required. Missing times → skip. */
export function shouldHangArtifact(params: {
  startedAt?: Date | null;
  updatedAt?: Date | null;
}): boolean {
  if (!params.startedAt || !params.updatedAt) return false;
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
