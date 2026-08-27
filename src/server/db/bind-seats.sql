-- Bind current PM / SA / Engineer on travis.agent_binding.
-- Run on the same DATABASE_URL as travis-psi.vercel.app.

BEGIN;

UPDATE travis.agent_binding
SET
  label = 'PM',
  cursor_agent_id = 'bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea',
  runtime = 'cloud',
  active = true
WHERE seat_key = 'pm';

INSERT INTO travis.agent_binding (seat_key, label, cursor_agent_id, runtime, active)
SELECT 'pm', 'PM', 'bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea', 'cloud', true
WHERE NOT EXISTS (SELECT 1 FROM travis.agent_binding WHERE seat_key = 'pm');

UPDATE travis.agent_binding
SET
  label = 'SA',
  cursor_agent_id = 'bc-0a1fb1c1-bbea-4d31-a370-6917c235b9c8',
  runtime = 'cloud',
  active = true
WHERE seat_key = 'sa';

INSERT INTO travis.agent_binding (seat_key, label, cursor_agent_id, runtime, active)
SELECT 'sa', 'SA', 'bc-0a1fb1c1-bbea-4d31-a370-6917c235b9c8', 'cloud', true
WHERE NOT EXISTS (SELECT 1 FROM travis.agent_binding WHERE seat_key = 'sa');

UPDATE travis.agent_binding
SET
  label = 'Engineer',
  cursor_agent_id = 'bc-94804572-3a2f-4075-b290-a95c73730bd3',
  runtime = 'cloud',
  active = true
WHERE seat_key = 'engineer';

INSERT INTO travis.agent_binding (seat_key, label, cursor_agent_id, runtime, active)
SELECT 'engineer', 'Engineer', 'bc-94804572-3a2f-4075-b290-a95c73730bd3', 'cloud', true
WHERE NOT EXISTS (SELECT 1 FROM travis.agent_binding WHERE seat_key = 'engineer');

COMMIT;

SELECT seat_key, label, cursor_agent_id, active
FROM travis.agent_binding
WHERE seat_key IN ('pm', 'sa', 'engineer')
ORDER BY seat_key;
