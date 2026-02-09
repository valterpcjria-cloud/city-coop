-- ============================================
-- RLS POLICIES FOR COOP MGMT MODULE
-- ============================================

-- Function to check if user is a gestor
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.gestors WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teachers WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Test Cycles & Tests (Gestors Edit, Everyone Reads if Active)
CREATE POLICY "Anyone can read active cycles" ON public.test_cycles
  FOR SELECT USING (ativo = true OR public.is_gestor());

CREATE POLICY "Gestors full access cycles" ON public.test_cycles
  FOR ALL TO authenticated USING (public.is_gestor());

CREATE POLICY "Anyone can read active tests" ON public.cycle_tests
  FOR SELECT USING (ativo = true OR public.is_gestor());

CREATE POLICY "Gestors full access tests" ON public.cycle_tests
  FOR ALL TO authenticated USING (public.is_gestor());

-- 2. Student Test Results (Students see own, Gestors/Teachers see all)
CREATE POLICY "Students see own results" ON public.student_test_results
  FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert own results" ON public.student_test_results
  FOR INSERT WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Staff see all results" ON public.student_test_results
  FOR SELECT USING (public.is_gestor() OR public.is_teacher());

-- 3. Student Scores (Students see own, Gestors see all)
CREATE POLICY "Students see own score" ON public.student_scores
  FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Gestors see all scores" ON public.student_scores
  FOR SELECT USING (public.is_gestor());

-- 4. Cooperatives (Everyone Reads active, Gestors CRUD)
CREATE POLICY "Anyone read active cooperatives" ON public.cooperatives
  FOR SELECT USING (ativo = true OR public.is_gestor());

CREATE POLICY "Gestors CRUD cooperatives" ON public.cooperatives
  FOR ALL TO authenticated USING (public.is_gestor());

-- 5. Nucleo Gestor & Members
CREATE POLICY "Gestors CRUD nucleos" ON public.nucleo_gestor_escolar
  FOR ALL TO authenticated USING (public.is_gestor());

CREATE POLICY "Members see their nucleos" ON public.nucleo_gestor_escolar
  FOR SELECT USING (id IN (
    SELECT nucleo_id FROM public.nucleo_escolar_members 
    WHERE student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  ) OR public.is_gestor());

CREATE POLICY "Staff see all nucleo members" ON public.nucleo_escolar_members
  FOR SELECT USING (public.is_gestor() OR public.is_teacher());
