-- =============================================
-- MIGRATION: Add avatar_url column to all user tables
-- Date: 2026-02-08
-- =============================================

-- 1. Add avatar_url to managers table
ALTER TABLE managers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add avatar_url to gestors table
ALTER TABLE gestors ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Add avatar_url to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 4. Add avatar_url to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 5. Create Storage Bucket for avatars (if not exists via extension or dashboard)
-- NOTE: In Supabase, bucket creation is usually done via Dashboard or Storage API.
-- The SQL below is a helper to ensure permissions if the bucket is created manually.

-- 6. Setup RLS for Storage (Bucket: avatars)
-- Note: Requires 'storage' schema access. These are common policies:
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );
*/
