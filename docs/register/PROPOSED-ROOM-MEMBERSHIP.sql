-- PROPOSED. Not wired into migrate.ts. Do not run until SA signs.
--
-- Founder lock (2026-09-02): room membership lives in our schema —
-- a relation between a room and an agent, carrying a role and a joined-at.
-- Not Cursor CloudAgentOptions.metadata.
--
-- Room identity stays travis.voice_session.id. This file does not mint a
-- second room table. title is the room's name for the index (V1 / V2).
-- Empty title is legal. Backfill does not invent names.
--
-- agent_binding stays the global agent. Membership is who is in this room.
-- The same binding may sit in many rooms. seat_key uniqueness on
-- agent_binding is unchanged in this cut.
--
-- Idempotent. Safe to re-run after sign-off.

ALTER TABLE travis.voice_session
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS travis.room_membership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES travis.voice_session(id),
  binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  CONSTRAINT room_membership_role_chk
    CHECK (role IN ('member', 'facilitator')),
  CONSTRAINT room_membership_left_after_join_chk
    CHECK (left_at IS NULL OR left_at >= joined_at)
);

-- One open seat per agent per room. Leave then rejoin = a new row.
CREATE UNIQUE INDEX IF NOT EXISTS room_membership_open_uniq
  ON travis.room_membership (session_id, binding_id)
  WHERE left_at IS NULL;

-- One open facilitator per room. Travis holds that role.
CREATE UNIQUE INDEX IF NOT EXISTS room_membership_one_open_facilitator
  ON travis.room_membership (session_id)
  WHERE left_at IS NULL AND role = 'facilitator';

CREATE INDEX IF NOT EXISTS room_membership_open_by_session
  ON travis.room_membership (session_id)
  WHERE left_at IS NULL;

CREATE INDEX IF NOT EXISTS room_membership_open_by_binding
  ON travis.room_membership (binding_id)
  WHERE left_at IS NULL;

-- Today's implicit law: every active binding is in every room.
-- Ended rooms close those memberships at session.ended_at.
-- One row per (session, binding) from this backfill — history after
-- this cut is new rows written by runtime, not by re-running migrate.
INSERT INTO travis.room_membership (
  session_id,
  binding_id,
  role,
  joined_at,
  left_at
)
SELECT
  s.id,
  b.id,
  CASE
    WHEN b.seat_key = 'travis' THEN 'facilitator'
    ELSE 'member'
  END,
  s.created_at,
  s.ended_at
FROM travis.voice_session s
CROSS JOIN travis.agent_binding b
WHERE b.active = true
  AND NOT EXISTS (
    SELECT 1
    FROM travis.room_membership m
    WHERE m.session_id = s.id
      AND m.binding_id = b.id
  );
