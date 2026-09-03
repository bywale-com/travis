/** SCP-012 — absolute OS paths. One helper. No leftover analysis. */

export const OS_PATH_MAX = 512;
export const OS_BODY_MAX = 200_000;
export const OS_SEGMENT = /^[A-Za-z0-9._-]+$/;
export const OS_RESERVED_ROOTS = ["rooms", "agents"] as const;

export type OsPathOk = {
  ok: true;
  path: string;
  name: string;
  segments: string[];
};

export type OsPathErr = {
  ok: false;
  reason: string;
};

export function parseOsPath(raw: unknown): OsPathOk | OsPathErr {
  if (typeof raw !== "string") {
    return { ok: false, reason: "Path must be an absolute string." };
  }
  const path = raw.trim();
  if (!path.startsWith("/")) {
    return { ok: false, reason: "Path must be absolute." };
  }
  if (path.length > OS_PATH_MAX) {
    return { ok: false, reason: "Path is too long." };
  }
  if (path.includes("//")) {
    return { ok: false, reason: "Path cannot contain empty segments." };
  }
  if (path !== "/" && path.endsWith("/")) {
    return { ok: false, reason: "Path cannot end with a slash." };
  }
  if (path === "/") {
    return { ok: true, path: "/", name: "", segments: [] };
  }
  const segments = path.slice(1).split("/");
  for (const seg of segments) {
    if (seg === "." || seg === "..") {
      return { ok: false, reason: "Path cannot contain . or .." };
    }
    if (!OS_SEGMENT.test(seg)) {
      return { ok: false, reason: "Path segments are letters, numbers, . _ -." };
    }
  }
  const root = segments[0];
  if (
    root &&
    (OS_RESERVED_ROOTS as readonly string[]).includes(root)
  ) {
    return { ok: false, reason: "Rooms and agents are not OS folders." };
  }
  return {
    ok: true,
    path,
    name: segments[segments.length - 1] ?? "",
    segments,
  };
}

export function parentOsPath(path: string): string | null {
  const parsed = parseOsPath(path);
  if (!parsed.ok) return null;
  if (parsed.path === "/") return null;
  if (parsed.segments.length === 1) return "/";
  return `/${parsed.segments.slice(0, -1).join("/")}`;
}

export function clipOsBody(raw: unknown): { ok: true; body: string } | OsPathErr {
  if (typeof raw !== "string") {
    return { ok: false, reason: "Body must be text." };
  }
  const body = raw.trim();
  if (!body) {
    return { ok: false, reason: "Body cannot be empty." };
  }
  if (body.length > OS_BODY_MAX) {
    return { ok: false, reason: "Body is too long." };
  }
  return { ok: true, body };
}
