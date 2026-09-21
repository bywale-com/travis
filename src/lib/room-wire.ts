/**
 * SCP-039 / PM-023 — room SSE lifetime on Hobby (maxDuration 60).
 * Rotate before the platform hard-kills the function so the client reconnects
 * with afterSeq instead of hanging until TCP times out.
 */

/** Vercel Hobby cap on `GET …/events`. */
export const ROOM_WIRE_MAX_DURATION_SEC = 60;

/** Server closes the stream cleanly before the hard limit. */
export const ROOM_WIRE_LIFETIME_MS = 54_000;

/** Client aborts the fetch slightly earlier so rotation never waits on a dead socket. */
export const ROOM_WIRE_CLIENT_ROTATE_MS = 52_000;
