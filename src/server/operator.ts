/**
 * Hotfix 053 — allowlisted operator + durable personal enter link.
 * Do not key rooms to IP. Do not mint a signup.
 */
import { randomBytes } from "node:crypto";
import { eq, isNull, sql } from "drizzle-orm";
import {
  OPERATOR_COOKIE,
  OPERATOR_COOKIE_MAX_AGE,
  isOperatorEmail,
  normalizeOperatorEmail,
  operatorLinkPath,
  seedOperatorEmails,
  tokenFromCookieHeader,
} from "@/lib/operator-auth";
import { db } from "@/server/db/client";
import { operator, voiceSession, type Operator } from "@/server/db/schema";
import { sendOperatorLinkMail } from "@/server/mail";
import { AuthError } from "@/server/api-error";

let operatorStoreReady = false;

export function newLoginToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function ensureOperatorStore(): Promise<void> {
  if (operatorStoreReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.operator (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      login_token text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    ALTER TABLE travis.voice_session
      ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES travis.operator(id)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS voice_session_operator_idx
      ON travis.voice_session (operator_id)
  `);
  await seedOperatorsFromEnv();
  await backfillRoomOwners();
  operatorStoreReady = true;
}

async function seedOperatorsFromEnv(): Promise<void> {
  const emails = seedOperatorEmails({
    TRAVIS_OPERATOR_EMAIL: process.env.TRAVIS_OPERATOR_EMAIL,
    TEST_EMAIL_TO: process.env.TEST_EMAIL_TO,
  });
  for (const email of emails) {
    const [existing] = await db
      .select({ id: operator.id })
      .from(operator)
      .where(eq(operator.email, email))
      .limit(1);
    if (existing) continue;
    await db.insert(operator).values({
      email,
      loginToken: newLoginToken(),
    });
  }
}

async function backfillRoomOwners(): Promise<void> {
  const [first] = await db
    .select({ id: operator.id })
    .from(operator)
    .orderBy(operator.createdAt)
    .limit(1);
  if (!first) return;
  await db
    .update(voiceSession)
    .set({ operatorId: first.id })
    .where(isNull(voiceSession.operatorId));
}

export async function operatorByEmail(raw: string): Promise<Operator | null> {
  await ensureOperatorStore();
  const email = normalizeOperatorEmail(raw);
  if (!isOperatorEmail(email)) return null;
  const [row] = await db
    .select()
    .from(operator)
    .where(eq(operator.email, email))
    .limit(1);
  return row ?? null;
}

export async function operatorByToken(token: string): Promise<Operator | null> {
  await ensureOperatorStore();
  const value = token.trim();
  if (!value) return null;
  const [row] = await db
    .select()
    .from(operator)
    .where(eq(operator.loginToken, value))
    .limit(1);
  return row ?? null;
}

export function operatorFromRequest(req: Request): string {
  return tokenFromCookieHeader(req.headers.get("cookie"));
}

export async function requireOperator(req: Request): Promise<Operator> {
  const token = operatorFromRequest(req);
  const row = token ? await operatorByToken(token) : null;
  if (!row) throw new AuthError("Sign in first", 401);
  return row;
}

export async function requireOwnedSession(
  req: Request,
  sessionId: string,
): Promise<{ operator: Operator; sessionId: string }> {
  const op = await requireOperator(req);
  const [row] = await db
    .select({ id: voiceSession.id })
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);
  if (!row) throw new AuthError("Session not found", 404);
  const [owned] = await db
    .select({ id: voiceSession.id })
    .from(voiceSession)
    .where(
      sql`${voiceSession.id} = ${sessionId} AND ${voiceSession.operatorId} = ${op.id}`,
    )
    .limit(1);
  if (!owned) throw new AuthError("Session not found", 404);
  return { operator: op, sessionId: row.id };
}

export function enterCookie(token: string): {
  name: string;
  value: string;
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    name: OPERATOR_COOKIE,
    value: token,
    httpOnly: true,
    secure:
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OPERATOR_COOKIE_MAX_AGE,
  };
}

export function publicOrigin(req: Request): string {
  const explicit = process.env.TRAVIS_APP_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host") ||
    "";
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  if (host) return `${proto}://${host}`;
  return new URL(req.url).origin;
}

export type OperatorLinkResult =
  | { outcome: "unknown_email" }
  | { outcome: "sent" }
  | { outcome: "send_failed"; reason: "missing_key" | "resend_error" };

function emailLogTag(raw: string): string {
  const email = normalizeOperatorEmail(raw);
  const at = email.indexOf("@");
  if (at < 1) return "invalid";
  return `***@${email.slice(at + 1)}`;
}

/** Same generic reply for unknown email. Never mints. */
export async function requestOperatorLink(
  req: Request,
  rawEmail: string,
): Promise<OperatorLinkResult> {
  const tag = emailLogTag(rawEmail);
  const row = await operatorByEmail(rawEmail);
  if (!row) {
    console.info("[travis] operator link: no match", { email: tag });
    return { outcome: "unknown_email" };
  }
  const url = `${publicOrigin(req)}${operatorLinkPath(row.loginToken)}`;
  const mail = await sendOperatorLinkMail({ to: row.email, url });
  if (!mail.ok) {
    console.error("[travis] operator link: send failed", {
      email: tag,
      reason: mail.reason,
    });
    return { outcome: "send_failed", reason: mail.reason };
  }
  console.info("[travis] operator link: sent", { email: tag });
  return { outcome: "sent" };
}
