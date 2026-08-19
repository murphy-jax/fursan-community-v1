-- ============================================================
-- FURSAN COMMUNITY — database schema · first migration
-- PostgreSQL 15+ (Neon / Supabase compatible)
-- Run:  psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                 -- bcrypt, cost 10
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions (expires_at);

CREATE TYPE app_type   AS ENUM ('esports', 'ems', 'lspd');
CREATE TYPE app_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE recruit    AS ENUM ('open', 'closed', 'temp');

CREATE TABLE IF NOT EXISTS applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref         TEXT NOT NULL UNIQUE,            -- e.g. FUR-2026-123456
  type        app_type NOT NULL,
  program     TEXT,                            -- esports program title
  program_id  TEXT,                            -- maps to games.id / department id
  status      app_status NOT NULL DEFAULT 'pending',
  data        JSONB NOT NULL,                  -- sanitised applicant answers
  notes       TEXT NOT NULL DEFAULT '',        -- private staff notes
  discord_role_id   TEXT,
  discord_assigned_at TIMESTAMPTZ,
  discord_last_error  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_type   ON applications (type);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications (created_at DESC);

CREATE TABLE IF NOT EXISTS staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT NOT NULL,
  discord     TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL,
  department  TEXT NOT NULL DEFAULT 'Community',
  permissions TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS games (
  id          TEXT PRIMARY KEY,                -- fifa | efootball | valorant | cs
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status      recruit NOT NULL DEFAULT 'closed',
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS departments (
  id           TEXT PRIMARY KEY,               -- ems | lspd
  name         TEXT NOT NULL,
  tagline      TEXT NOT NULL DEFAULT '',
  intro        TEXT NOT NULL DEFAULT '',
  requirements JSONB NOT NULL DEFAULT '[]',    -- ["At least 16 years old", ...]
  ranks        JSONB NOT NULL DEFAULT '[]',    -- [{"title":"Recruit","desc":"..."}]
  status       recruit NOT NULL DEFAULT 'closed'
);

-- Single-row tables for global configuration (row id = 'default').
CREATE TABLE IF NOT EXISTS settings (
  id             TEXT PRIMARY KEY DEFAULT 'default',
  community_name TEXT NOT NULL DEFAULT 'FURSAN COMMUNITY',
  discord_invite TEXT NOT NULL DEFAULT '',
  member_count   INT NOT NULL DEFAULT 0,
  server_online  BOOLEAN NOT NULL DEFAULT TRUE,
  socials        JSONB NOT NULL DEFAULT '{}',
  footer_text    TEXT NOT NULL DEFAULT '',
  discord_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  discord_guild_id TEXT,
  discord_token_enc TEXT,                      -- AES-256-GCM sealed, server-side key
  discord_roles  JSONB NOT NULL DEFAULT '{}',  -- {fifa, efootball, valorant, cs, ems, lspd}
  content        JSONB NOT NULL DEFAULT '{}',  -- all editable website copy
  images         JSONB NOT NULL DEFAULT '{}'   -- storage object paths / URLs
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key        TEXT NOT NULL,                    -- e.g. login:admin, apply:esports:2451…
  ts         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key, ts)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ts ON rate_limits (ts);

-- ============================================================
-- Seed: programs & departments (password hash inserted by the
-- server bootstrap from environment variables — never hardcoded)
-- ============================================================
INSERT INTO games (id, title, status, sort_order) VALUES
  ('fifa',      'FIFA / EA FC',   'open',   1),
  ('efootball', 'eFootball',      'temp',   2),
  ('valorant',  'Valorant',       'open',   3),
  ('cs',        'Counter-Strike', 'closed', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments (id, name, tagline, status) VALUES
  ('ems',  'San Andreas EMS',              'Patient First. Always.',            'open'),
  ('lspd', 'Los Santos Police Department', 'Serve the story. Protect the city.', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
