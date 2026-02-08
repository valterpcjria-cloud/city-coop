-- =============================================
-- MIGRATION: Sync profile fields (phone and bio) across all user tables
-- Date: 2026-02-08
-- =============================================

-- 1. Update managers table (Add phone and bio)
ALTER TABLE managers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE managers ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Update gestors table (Add bio - phone already exists)
ALTER TABLE gestors ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Update teachers table (Add bio - phone already exists)
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS bio TEXT;

-- 4. Update students table (Add phone and bio)
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bio TEXT;
