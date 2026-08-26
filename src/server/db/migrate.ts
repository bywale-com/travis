/**
 * One-shot SQL mint for SCP-001 stores (non-interactive).
 * Prefer this over drizzle-kit push when sharing a crowded Postgres.
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
    CREATE TABLE IF NOT EXISTS travis.voice_session (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
      status text NOT NULL DEFAULT 'listening',
      created_at timestamptz NOT NULL DEFAULT now(),
      ended_at timestamptz
    )
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
    CREATE TABLE IF NOT EXISTS travis.turn_conductor_phrase (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      phrase text NOT NULL,
      active boolean NOT NULL DEFAULT true
    )
  `;

  console.log("travis schema + tables ready");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
