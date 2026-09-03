import { NextResponse } from "next/server";
import { operatorByToken, enterCookie } from "@/server/operator";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const op = await operatorByToken(token).catch(() => null);
  if (!op) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const cookie = enterCookie(token);
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  return res;
}

