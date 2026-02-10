-- ============================================
-- FIX: RLS RECURSION IN class_students
-- ============================================

-- 1. Limpeza de políticas problemáticas
DROP POLICY IF EXISTS "teachers_manage_class_enrollments" ON public.class_students;
DROP POLICY IF EXISTS "students_view_class_enrollments" ON public.class_students;
DROP POLICY IF EXISTS "gestors_view_class_enrollments" ON public.class_students;
DROP POLICY IF EXISTS "authenticated_read_class_students" ON public.class_students;

-- 2. Novas políticas simplificadas e sem recursão

-- Permite leitura para usuários autenticados (Seguro, pois dados sensíveis estão na tabela 'students')
CREATE POLICY "read_class_students_stable" ON public.class_students
  FOR SELECT
  TO authenticated
  USING (true);

-- Permite que o professor gerencie apenas os alunos de suas turmas
CREATE POLICY "teachers_manage_own_class_students" ON public.class_students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = class_students.class_id
      AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = class_students.class_id
      AND t.user_id = auth.uid()
    )
  );

-- Permite que gestores gerenciem tudo
CREATE POLICY "gestors_manage_all_class_students" ON public.class_students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.gestors WHERE user_id = auth.uid())
  );
