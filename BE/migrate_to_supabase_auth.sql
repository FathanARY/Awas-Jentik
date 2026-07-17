-- Migration: MalariaWatch users table → v2 (Supabase Auth)
-- Run this in Supabase Dashboard → SQL Editor

-- 1. If old table has password_hash, drop it
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- 2. Add email column if not exists (for Supabase Auth lookup)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 3. Add index on email for fast auth lookups
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- 4. Update existing seed users with emails
UPDATE users SET email = 'admin@malariawatch.com' WHERE username = 'admin' AND email IS NULL;
UPDATE users SET email = 'user@malariawatch.com' WHERE username = 'user' AND email IS NULL;
