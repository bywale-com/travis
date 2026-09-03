/**
 * Travis schema migrate — SCP-001 base + SCP-002 room + SCP-003 queue + SCP-007 membership + SCP-008 backlog + SCP-009 artifacts + SCP-010 title + SCP-012 OS house + SCP-013 motion.
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

  await sql`
    ALTER TABLE travis.voice_session
      ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT ''
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS room_membership_open_uniq
      ON travis.room_membership (session_id, binding_id)
      WHERE left_at IS NULL
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS room_membership_one_open_facilitator
      ON travis.room_membership (session_id)
      WHERE left_at IS NULL AND role = 'facilitator'
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS room_membership_open_by_session
      ON travis.room_membership (session_id)
      WHERE left_at IS NULL
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS room_membership_open_by_binding
      ON travis.room_membership (binding_id)
      WHERE left_at IS NULL
  `;

  await sql`
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
      )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.initiative (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      founding_turn_id uuid NOT NULL REFERENCES travis.voice_turn(id),
      source text NOT NULL,
      status text NOT NULL DEFAULT 'open',
      created_at timestamptz NOT NULL DEFAULT now(),
      done_at timestamptz,
      CONSTRAINT initiative_source_chk
        CHECK (source IN ('via_travis', 'hold')),
      CONSTRAINT initiative_status_chk
        CHECK (status IN ('open', 'done')),
      CONSTRAINT initiative_done_at_chk
        CHECK (
          (status = 'open' AND done_at IS NULL)
          OR (status = 'done' AND done_at IS NOT NULL)
        ),
      CONSTRAINT initiative_founding_uniq UNIQUE (founding_turn_id)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS initiative_open_by_session
      ON travis.initiative (session_id)
      WHERE status = 'open'
  `;

  await sql`
    ALTER TABLE travis.voice_turn
      ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES travis.initiative(id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS voice_turn_initiative_idx
      ON travis.voice_turn (initiative_id)
      WHERE initiative_id IS NOT NULL
  `;

  await sql`
    ALTER TABLE travis.queued_utterance
      ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES travis.initiative(id)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.turn_artifact (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      turn_id uuid NOT NULL REFERENCES travis.voice_turn(id),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
      kind text NOT NULL,
      path text NOT NULL,
      filename text NOT NULL,
      size_bytes integer,
      cursor_updated_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT turn_artifact_kind_chk
        CHECK (kind IN ('image', 'file')),
      CONSTRAINT turn_artifact_turn_path_uniq UNIQUE (turn_id, path)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS turn_artifact_session_created_idx
      ON travis.turn_artifact (session_id, created_at)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS turn_artifact_turn_idx
      ON travis.turn_artifact (turn_id)
  `;

  await sql`
    ALTER TABLE travis.initiative
      ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT ''
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.os_node (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_id uuid REFERENCES travis.os_node(id),
      path text NOT NULL UNIQUE,
      name text NOT NULL,
      kind text NOT NULL,
      body text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      writer_binding_id uuid REFERENCES travis.agent_binding(id),
      CONSTRAINT os_node_kind_chk CHECK (kind IN ('dir', 'file')),
      CONSTRAINT os_node_dir_body_chk CHECK (
        (kind = 'dir' AND body = '') OR kind = 'file'
      )
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS os_node_parent_idx
      ON travis.os_node (parent_id)
  `;

  await sql`
    INSERT INTO travis.os_node (path, name, kind, parent_id)
    VALUES ('/', '', 'dir', NULL)
    ON CONFLICT (path) DO NOTHING
  `;
  await sql`
    INSERT INTO travis.os_node (path, name, kind, parent_id)
    SELECT '/protocols', 'protocols', 'dir', id
    FROM travis.os_node WHERE path = '/'
    ON CONFLICT (path) DO NOTHING
  `;
  await sql`
    INSERT INTO travis.os_node (path, name, kind, parent_id)
    SELECT '/templates', 'templates', 'dir', id
    FROM travis.os_node WHERE path = '/'
    ON CONFLICT (path) DO NOTHING
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.motion (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      title text NOT NULL,
      status text NOT NULL,
      founding_turn_id uuid REFERENCES travis.voice_turn(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      done_at timestamptz,
      CONSTRAINT motion_status_chk
        CHECK (status IN ('waiting', 'running', 'done', 'failed'))
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS motion_open_by_session
      ON travis.motion (session_id)
      WHERE status IN ('waiting', 'running', 'failed')
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS travis.motion_step (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      motion_id uuid NOT NULL REFERENCES travis.motion(id),
      seq int NOT NULL,
      tool text NOT NULL,
      args text NOT NULL,
      status text NOT NULL,
      result_text text NOT NULL DEFAULT '',
      started_at timestamptz,
      done_at timestamptz,
      CONSTRAINT motion_step_status_chk
        CHECK (status IN ('pending', 'running', 'done', 'failed')),
      CONSTRAINT motion_step_seq_uniq UNIQUE (motion_id, seq)
    )
  `;

  console.log("travis schema + SCP-009 artifacts + SCP-010 title + SCP-012 OS house + SCP-013 motion ready");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
