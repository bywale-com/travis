import { NextResponse } from "next/server";
import { describeServerError } from "@/lib/http";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 | 404,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Any throw inside a route must still leave the client with JSON. An empty
 * body reads as "Unexpected end of JSON input" on the phone, which hides the
 * actual cause.
 */
export async function jsonRoute(
  fn: () => Promise<Response>,
): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[travis] route failed:", err);
    return NextResponse.json(
      { error: describeServerError(err) },
      { status: 500 },
    );
  }
}
