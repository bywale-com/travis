/**
 * Travis schema migrate — SCP-001 base + SCP-002 room + SCP-003 queue.
 */
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS travis`;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.agent_binding (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      label text NOT NULL,
      cursor_agent_id text NOT NULL DEFAULT '',
      runtime text NOT NULL DEFAULT 'cloud',
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    ALTER TABLE travis.agent_binding
    ADD COLUMN IF NOT EXISTS seat_key text
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS agent_binding_seat_key_idx
    ON travis.agent_binding (seat_key)
    WHERE seat_key IS NOT NULL
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.voice_session (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
      status text NOT NULL DEFAULT 'listening',
      created_at timestamptz NOT NULL DEFAULT now(),
      ended_at timestamptz
    )
  `;

  await sql`
    ALTER TABLE travis.voice_session
    ADD COLUMN IF NOT EXISTS default_binding_id uuid REFERENCES travis.agent_binding(id)
  `;
  await sql`
    ALTER TABLE travis.voice_session
    ADD COLUMN IF NOT EXISTS active_binding_id uuid REFERENCES travis.agent_binding(id)
  `;
  await sql`
    ALTER TABLE travis.voice_session
    ADD COLUMN IF NOT EXISTS view_mode text NOT NULL DEFAULT 'voice'
  `;
  await sql`
    ALTER TABLE travis.voice_session
    ADD COLUMN IF NOT EXISTS router_state text NOT NULL DEFAULT 'normal'
  `;

  await sql`
    UPDATE travis.voice_session
    SET
      default_binding_id = COALESCE(default_binding_id, binding_id),
      active_binding_id = COALESCE(active_binding_id, binding_id)
    WHERE default_binding_id IS NULL OR active_binding_id IS NULL
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.voice_turn (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      seq integer NOT NULL,
      role text NOT NULL,
      text text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    ALTER TABLE travis.voice_turn ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'user'
  `;
  await sql`
    ALTER TABLE travis.voice_turn ADD COLUMN IF NOT EXISTS seat_key text
  `;
  await sql`
    ALTER TABLE travis.voice_turn ADD COLUMN IF NOT EXISTS reference_turn_id uuid
  `;
  await sql`
    ALTER TABLE travis.voice_turn ADD COLUMN IF NOT EXISTS speakable boolean NOT NULL DEFAULT true
  `;
  await sql`
    ALTER TABLE travis.voice_turn ADD COLUMN IF NOT EXISTS thought_status text
  `;

  await sql`
    UPDATE travis.voice_turn SET kind = role WHERE kind = 'user' AND role IN ('user','assistant','status')
  `;
  await sql`
    UPDATE travis.voice_turn SET kind = 'agent_post' WHERE role = 'assistant' AND kind = 'assistant'
  `;
  await sql`
    UPDATE travis.voice_turn SET kind = role WHERE kind NOT IN ('user','agent_thought','agent_post','status','travis_prompt')
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.turn_conductor_phrase (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      phrase text NOT NULL,
      active boolean NOT NULL DEFAULT true
    )
  `;

  await sql`
    INSERT INTO travis.turn_conductor_phrase (phrase, active)
    SELECT 'I''m done talking', true
    WHERE NOT EXISTS (
      SELECT 1 FROM travis.turn_conductor_phrase
      WHERE lower(phrase) = lower('I''m done talking')
    )
  `;

  await sql`
    UPDATE travis.agent_binding
    SET seat_key = 'pm'
    WHERE seat_key IS NULL AND label ILIKE 'pm'
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.queued_utterance (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
      seat_key text NOT NULL,
      seq integer NOT NULL,
      text text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (session_id, binding_id, seq)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.seat_live_run (
      binding_id uuid PRIMARY KEY REFERENCES travis.agent_binding(id),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      cursor_run_id text NOT NULL,
      user_turn_id uuid REFERENCES travis.voice_turn(id),
      started_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  // Re-lock the three named chats. Env fill is blanks-only; this is the
  // operator map (same ids as bind-seats.sql).
  await sql`
    UPDATE travis.agent_binding
    SET
      label = 'PM',
      cursor_agent_id = 'bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea',
      runtime = 'cloud',
      active = true
    WHERE seat_key = 'pm'
  `;
  await sql`
    INSERT INTO travis.agent_binding (seat_key, label, cursor_agent_id, runtime, active)
    SELECT 'pm', 'PM', 'bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea', 'cloud', true
    WHERE NOT EXISTS (SELECT 1 FROM travis.agent_binding WHERE seat_key = 'pm')
  `;
  await sql`
    UPDATE travis.agent_binding
    SET
      label = 'SA',
      cursor_agent_id = 'bc-0a1fb1c1-bbea-4d31-a370-6917c235b9c8',
      runtime = 'cloud',
      active = true
    WHERE seat_key = 'sa'
  `;
  await sql`
    INSERT INTO travis.agent_binding (seat_key, label, cursor_agent_id, runtime, active)
    SELECT 'sa', 'SA', 'bc-0a1fb1c1-bbea-4d31-a370-6917c235b9c8', 'cloud', true
    WHERE NOT EXISTS (SELECT 1 FROM travis.agent_binding WHERE seat_key = 'sa')
  `;
  await sql`
    UPDATE travis.agent_binding
    SET
      label = 'Engineer',
      cursor_agent_id = 'bc-94804572-3a2f-4075-b290-a95c73730bd3',
      runtime = 'cloud',
      active = true
    WHERE seat_key = 'engineer'
  `;
  await sql`
    INSERT INTO travis.agent_binding (seat_key, label, cursor_agent_id, runtime, active)
    SELECT 'engineer', 'Engineer', 'bc-94804572-3a2f-4075-b290-a95c73730bd3', 'cloud', true
    WHERE NOT EXISTS (SELECT 1 FROM travis.agent_binding WHERE seat_key = 'engineer')
  `;

  await sql`
    ALTER TABLE travis.voice_session
    ADD COLUMN IF NOT EXISTS log_submode text NOT NULL DEFAULT 'talk'
  `;

  await sql`
    ALTER TABLE travis.voice_session
    ADD COLUMN IF NOT EXISTS client_ip text NOT NULL DEFAULT ''
  `;

  await sql`
    ALTER TABLE travis.voice_session
    ADD COLUMN IF NOT EXISTS travis_live_handle text
  `;

  await sql`
    INSERT INTO travis.agent_binding (seat_key, label, cursor_agent_id, runtime, active)
    SELECT 'travis', 'Travis', '', 'cloud', true
    WHERE NOT EXISTS (SELECT 1 FROM travis.agent_binding WHERE seat_key = 'travis')
  `;

  console.log("travis schema + SCP-006 travis binding + live handle ready");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
