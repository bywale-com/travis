/**
 * Travis schema migrate — SCP-001 base + SCP-002 room extensions.
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
    UPDATE travis.agent_binding
    SET seat_key = 'pm'
    WHERE seat_key IS NULL AND label ILIKE 'pm'
  `;

  console.log("travis schema + SCP-002 room extensions ready");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
