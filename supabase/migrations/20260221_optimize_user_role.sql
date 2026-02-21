-- ===========================================
-- Performance Optimization: User Role Detection
-- ===========================================
-- 
-- This function consolidates 3 separate queries into 1 for determining user role.
-- Used by the auth-guard and middleware to quickly resolve user profiles.
-- 
-- IMPORTANT: Execute this in the Supabase SQL Editor
-- or via supabase db push if using local migrations.
--

-- Optimized function that checks all role tables in a single call
CREATE OR REPLACE FUNCTION get_user_profile_with_role(p_user_id UUID)
RETURNS TABLE(
    role TEXT, 
    profile_id UUID, 
    profile_name TEXT, 
    profile_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'gestor'::TEXT, g.id, g.name, g.email
    FROM gestors g WHERE g.user_id = p_user_id
    UNION ALL
    SELECT 'professor'::TEXT, t.id, t.name, t.email
    FROM teachers t WHERE t.user_id = p_user_id
    UNION ALL
    SELECT 'estudante'::TEXT, s.id, s.name, s.email
    FROM students s WHERE s.user_id = p_user_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Performance indexes for user lookups (if not already existing)
-- These dramatically improve the parallel queries in auth-guard.ts
CREATE INDEX IF NOT EXISTS idx_gestors_user_id ON gestors(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- Index for audit log lookups (used in dashboard overview)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Index for event plans status filtering (dashboard stat card)
CREATE INDEX IF NOT EXISTS idx_event_plans_status ON event_plans(status);
