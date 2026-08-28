/** Vercel-style client address. Empty string means do not key a session. */
export function clientIpFromHeaders(headers: {
  get(name: string): string | null;
}): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim() ?? "";
    return normalizeIp(first);
  }
  const real = headers.get("x-real-ip")?.trim() ?? "";
  return normalizeIp(real);
}

function normalizeIp(value: string): string {
  if (!value) return "";
  if (value.startsWith("::ffff:")) return value.slice(7);
  return value;
}
