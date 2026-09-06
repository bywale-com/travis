-- Hang the living Technical PM bind as a new person in room Travis.
-- Do not touch catalog pm. Idempotent on cursor_agent_id.
-- Run on the same DATABASE_URL as travis-psi.vercel.app.

BEGIN;

-- Refresh an existing hang of this bind. Never write catalog pm.
UPDATE travis.agent_binding
SET
  label = 'Technical PM',
  protocol_path = '/protocols/pm.md',
  runtime = 'cloud',
  active = true
WHERE cursor_agent_id = 'bc-25c5c6bf-006f-4252-9f25-49ab183835b2'
  AND seat_key <> 'pm';

-- Insert only if this bind is not already hung on a non-pm row.
INSERT INTO travis.agent_binding (
  seat_key,
  label,
  cursor_agent_id,
  runtime,
  active,
  protocol_path
)
SELECT
  (
    SELECT slug
    FROM (
      SELECT 'technical-pm' AS slug
      UNION ALL
      SELECT 'technical-pm-' || n::text
      FROM generate_series(2, 99) AS n
    ) candidates
    WHERE NOT EXISTS (
      SELECT 1
      FROM travis.agent_binding b
      WHERE b.seat_key = candidates.slug
    )
    LIMIT 1
  ),
  'Technical PM',
  'bc-25c5c6bf-006f-4252-9f25-49ab183835b2',
  'cloud',
  true,
  '/protocols/pm.md'
WHERE NOT EXISTS (
  SELECT 1
  FROM travis.agent_binding
  WHERE cursor_agent_id = 'bc-25c5c6bf-006f-4252-9f25-49ab183835b2'
    AND seat_key <> 'pm'
);

-- Open member of room Travis. Role dest on catalog pm stays put.
INSERT INTO travis.room_membership (session_id, binding_id, role)
SELECT
  '0e8875f8-283b-4dae-bf54-76c82a05b6ef',
  b.id,
  'member'
FROM travis.agent_binding b
WHERE b.cursor_agent_id = 'bc-25c5c6bf-006f-4252-9f25-49ab183835b2'
  AND b.seat_key <> 'pm'
  AND NOT EXISTS (
    SELECT 1
    FROM travis.room_membership m
    WHERE m.session_id = '0e8875f8-283b-4dae-bf54-76c82a05b6ef'
      AND m.binding_id = b.id
      AND m.left_at IS NULL
  );

COMMIT;

SELECT
  b.seat_key,
  b.label,
  b.cursor_agent_id,
  b.protocol_path,
  b.runtime,
  b.active,
  m.role AS room_role,
  m.left_at IS NULL AS open_member
FROM travis.agent_binding b
LEFT JOIN travis.room_membership m
  ON m.binding_id = b.id
 AND m.session_id = '0e8875f8-283b-4dae-bf54-76c82a05b6ef'
 AND m.left_at IS NULL
WHERE b.cursor_agent_id = 'bc-25c5c6bf-006f-4252-9f25-49ab183835b2'
  AND b.seat_key <> 'pm';

SELECT seat_key, label, cursor_agent_id, protocol_path
FROM travis.agent_binding
WHERE seat_key = 'pm';
