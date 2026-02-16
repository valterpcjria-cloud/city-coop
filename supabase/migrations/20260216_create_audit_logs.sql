-- ===========================================
-- Audit Logging System
-- ===========================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Superadmins only)
CREATE POLICY "superadmins_read_audit_logs" ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.gestors
            WHERE user_id = auth.uid() AND is_superadmin = true
        )
    );

-- 4. Allow authenticated session to INSERT logs (via recordAuditLog helper)
CREATE POLICY "authenticated_insert_audit_logs" ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 5. No updates or deletes allowed (immutability)
CREATE POLICY "no_updates_on_audit_logs" ON public.audit_logs FOR UPDATE TO authenticated USING (false);
CREATE POLICY "no_deletes_on_audit_logs" ON public.audit_logs FOR DELETE TO authenticated USING (false);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

COMMENT ON TABLE public.audit_logs IS 'Centralized audit logging for sensitive actions across the platform.';
