-- PostgreSQL schema for Foodaniell
-- Create DB manually if needed:
--   CREATE DATABASE foodaniell;
-- Then connect:
--   \c foodaniell

-- =========================
-- Helper trigger for updated_at
-- =========================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(250) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_image_url TEXT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  receive_emails BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_users_updated_at'
  ) THEN
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =========================
-- RECIPE TYPES
-- =========================
CREATE TABLE IF NOT EXISTS recipe_types (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- SUGGESTIONS
-- =========================
CREATE TABLE IF NOT EXISTS suggestions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(250) NOT NULL,
  email VARCHAR(250) NOT NULL,
  recipe_type_id BIGINT NOT NULL REFERENCES recipe_types(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_recipe_type
  ON suggestions (recipe_type_id);

-- =========================
-- BOOKS
-- =========================
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(250) NOT NULL,
  description TEXT NULL,
  buy_link TEXT NULL,
  price NUMERIC(10,2) NULL,
  image_url TEXT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_books_public
  ON books (is_public);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_books_updated_at'
  ) THEN
    CREATE TRIGGER trg_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =========================
-- RECIPES
-- =========================
CREATE TABLE IF NOT EXISTS recipes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(250) NOT NULL,
  time_text VARCHAR(80) NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  notes TEXT NULL,
  image_url TEXT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_recipes_public
  ON recipes (is_public);

-- =========================
-- RECIPE NUTRITION
-- =========================
CREATE TABLE IF NOT EXISTS recipe_nutrition (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  calories DECIMAL(8,2) NULL,
  proteins DECIMAL(8,2) NULL, -- gramos
  carbs DECIMAL(8,2) NULL,    -- gramos
  fats DECIMAL(8,2) NULL,     -- gramos
  fiber DECIMAL(8,2) NULL,    -- gramos
  sugar DECIMAL(8,2) NULL,    -- gramos
  sodium DECIMAL(8,2) NULL,   -- miligramos
  servings INT NULL,         -- número de porciones
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_recipe_id
  ON recipe_nutrition(recipe_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_recipe_nutrition_updated_at'
  ) THEN
    CREATE TRIGGER trg_recipe_nutrition_updated_at
    BEFORE UPDATE ON recipe_nutrition
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_recipes_updated_at'
  ) THEN
    CREATE TRIGGER trg_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =========================
-- RECIPE TRANSLATIONS
-- =========================
CREATE TABLE IF NOT EXISTS recipe_translations (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  lang VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  notes TEXT NULL,
  translated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_recipe_translations UNIQUE (recipe_id, lang)
);

CREATE INDEX IF NOT EXISTS idx_recipe_translations_lang
  ON recipe_translations (lang);

-- =========================
-- VIDEOS
-- =========================
CREATE TABLE IF NOT EXISTS videos (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(250) NOT NULL,
  url TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_videos_public
  ON videos (is_public);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_videos_updated_at'
  ) THEN
    CREATE TRIGGER trg_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =========================
-- FREE RESOURCES
-- =========================
CREATE TABLE IF NOT EXISTS resources (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(250) NOT NULL,
  description TEXT NULL,
  resource_type VARCHAR(20) NOT NULL DEFAULT 'pdf'
    CHECK (resource_type IN ('ebook', 'pdf', 'other')),
  file_url TEXT NULL,
  image_url TEXT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_resources_public
  ON resources (is_public);
CREATE INDEX IF NOT EXISTS idx_resources_type
  ON resources (resource_type);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_resources_updated_at'
  ) THEN
    CREATE TRIGGER trg_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =========================
-- CONTACTS
-- =========================
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(250) NOT NULL,
  email VARCHAR(250) NOT NULL,
  request_type VARCHAR(120) NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_email
  ON contacts (email);

-- =========================
-- ADMIN TASKS
-- =========================
CREATE TABLE IF NOT EXISTS admin_tasks (
  id BIGSERIAL PRIMARY KEY,
  text VARCHAR(500) NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_admin_tasks_updated_at'
  ) THEN
    CREATE TRIGGER trg_admin_tasks_updated_at
    BEFORE UPDATE ON admin_tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =========================
-- PASSWORD RESET TOKENS
-- =========================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user
  ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token
  ON password_reset_tokens (token_hash);
