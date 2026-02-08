-- ============================================
-- MIGRATION: Gestors table + user status fields
-- Date: 2026-02-07
-- ============================================

-- Table for gestor-specific data
CREATE TABLE IF NOT EXISTS gestors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  is_superadmin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_active to teachers if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teachers' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE teachers ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add is_active to students if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE students ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gestors_user_id ON gestors(user_id);
CREATE INDEX IF NOT EXISTS idx_gestors_email ON gestors(email);
CREATE INDEX IF NOT EXISTS idx_gestors_is_superadmin ON gestors(is_superadmin);

-- RLS Policies for gestors table
ALTER TABLE gestors ENABLE ROW LEVEL SECURITY;

-- Superadmins can do everything
CREATE POLICY "superadmins_full_access" ON gestors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gestors g 
      WHERE g.user_id = auth.uid() AND g.is_superadmin = true
    )
  );

-- Gestors can view their own record
CREATE POLICY "gestors_view_self" ON gestors
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_gestors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS gestors_updated_at ON gestors;
CREATE TRIGGER gestors_updated_at
  BEFORE UPDATE ON gestors
  FOR EACH ROW
  EXECUTE FUNCTION update_gestors_updated_at();
