-- Schema for myapp_db (PostgreSQL)
-- Run this file once to initialize all tables in a fresh DB:
--   postgresql -U postgres -d myapp_db -f src/config/schema.sql

-- USERS TABLE
-- Stores all users: field_inspector, reviewing_officer, admin
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255)        NOT NULL,
  email      VARCHAR(255)        NOT NULL UNIQUE,
  password   VARCHAR(255)        NOT NULL,
  role       VARCHAR(50)         NOT NULL DEFAULT 'field_inspector',
  phone      VARCHAR(20),
  is_active  BOOLEAN             NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);


-- ------------------------------------------------------------
-- ENTRIES TABLE
-- Stores field inspection entries submitted by inspectors
-- Status flow: submitted → approved | draft (rejected)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entries (
  id               SERIAL PRIMARY KEY,
  inspector_id     INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name        VARCHAR(255)   NOT NULL,
  mobile_number    VARCHAR(20)    NOT NULL,
  address          TEXT           NOT NULL,
  description      TEXT,
  image            VARCHAR(500),
  status           VARCHAR(50)    NOT NULL DEFAULT 'submitted',
  rejection_reason TEXT,
  reviewed_by      INTEGER        REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMP,
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entries_inspector_id ON entries(inspector_id);
CREATE INDEX IF NOT EXISTS idx_entries_status       ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_reviewed_by  ON entries(reviewed_by);
