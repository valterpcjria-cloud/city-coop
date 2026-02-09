-- ============================================
-- FIX: MISSING RLS POLICIES FOR TEST QUESTIONS (CORRECTED)
-- ============================================

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing if any to avoid errors
DROP POLICY IF EXISTS "Anyone can read active test questions" ON public.test_questions;
DROP POLICY IF EXISTS "Gestors full access test questions" ON public.test_questions;

CREATE POLICY "Anyone can read active test questions" ON public.test_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cycle_tests ct
      JOIN public.test_cycles tc ON ct.cycle_id = tc.id
      WHERE ct.id = public.test_questions.test_id 
      AND (tc.ativo = true OR public.is_gestor())
    )
  );

CREATE POLICY "Gestors full access test questions" ON public.test_questions
  FOR ALL TO authenticated USING (public.is_gestor());
