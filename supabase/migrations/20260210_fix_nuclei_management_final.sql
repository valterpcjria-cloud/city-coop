-- ============================================
-- SOLUÇÃO DEFINITIVA: GESTÃO DE NÚCLEOS
-- ============================================

-- 1. Limpeza de políticas de NUCLEI
DROP POLICY IF EXISTS "teachers_manage_class_nuclei" ON public.nuclei;
DROP POLICY IF EXISTS "students_view_class_nuclei" ON public.nuclei;

-- Permite leitura de núcleos para todos autenticados
CREATE POLICY "read_nuclei_stable" ON public.nuclei
  FOR SELECT TO authenticated USING (true);

-- Permite que o professor gerencie núcleos de suas turmas
CREATE POLICY "teachers_manage_nuclei_stable" ON public.nuclei
  FOR ALL TO authenticated
  USING (
    class_id IN (
      SELECT id FROM public.classes 
      WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    class_id IN (
      SELECT id FROM public.classes 
      WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    )
  );

-- Permite que gestores gerenciem núcleos
CREATE POLICY "gestors_manage_nuclei_stable" ON public.nuclei
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gestors WHERE user_id = auth.uid()));


-- 2. Limpeza de políticas de NUCLEUS_MEMBERS
DROP POLICY IF EXISTS "teachers_manage_nucleus_members" ON public.nucleus_members;
DROP POLICY IF EXISTS "students_view_nucleus_members" ON public.nucleus_members;
DROP POLICY IF EXISTS "gestors_view_nucleus_members" ON public.nucleus_members;

-- Permite leitura de membros para todos autenticados
CREATE POLICY "read_nucleus_members_stable" ON public.nucleus_members
  FOR SELECT TO authenticated USING (true);

-- Permite que o professor gerencie membros de núcleos de suas turmas
-- (Usamos o class_id via join com nuclei para evitar recursão e garantir segurança)
CREATE POLICY "teachers_manage_members_stable" ON public.nucleus_members
  FOR ALL TO authenticated
  USING (
    nucleus_id IN (
      SELECT n.id FROM public.nuclei n
      JOIN public.classes c ON c.id = n.class_id
      WHERE c.teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    nucleus_id IN (
      SELECT n.id FROM public.nuclei n
      JOIN public.classes c ON c.id = n.class_id
      WHERE c.teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    )
  );

-- Permite que gestores gerenciem membros
CREATE POLICY "gestors_manage_members_stable" ON public.nucleus_members
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gestors WHERE user_id = auth.uid()));
