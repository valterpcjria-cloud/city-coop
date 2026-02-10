-- ============================================
-- SOLUÇÃO DEFINITIVA: REMOVER RECURSÃO NO RLS
-- ============================================

-- 1. Tabela GESTORS (Onde o loop estava ocorrendo)
-- Vamos remover a política que consulta a própria tabela de forma recursiva
DROP POLICY IF EXISTS "superadmins_full_access" ON public.gestors;
DROP POLICY IF EXISTS "gestors_view_self" ON public.gestors;

-- Permitir que qualquer usuário autenticado veja a lista de gestores 
-- (Seguro, pois são apenas dados de perfil: nome, email, status)
CREATE POLICY "authenticated_read_gestors" ON public.gestors
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir que o próprio gestor ou um superadmin (via metadados se necessário) edite
-- Para simplificar e evitar recursão:
CREATE POLICY "gestors_edit_self" ON public.gestors
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- 2. Tabela CLASS_STUDENTS
-- Garantir que as políticas aqui não criem loops com 'gestors' ou 'teachers'
DROP POLICY IF EXISTS "teachers_manage_class_enrollments" ON public.class_students;
DROP POLICY IF EXISTS "students_view_class_enrollments" ON public.class_students;
DROP POLICY IF EXISTS "gestors_view_class_enrollments" ON public.class_students;
DROP POLICY IF EXISTS "read_class_students_stable" ON public.class_students;
DROP POLICY IF EXISTS "teachers_manage_own_class_students" ON public.class_students;
DROP POLICY IF EXISTS "gestors_manage_all_class_students" ON public.class_students;

-- Política de leitura simples: qualquer um autenticado pode ver quem está em qual turma
-- (Isso é necessário para o dashboard do professor e do gestor funcionar sem travas)
CREATE POLICY "allow_read_class_students" ON public.class_students
  FOR SELECT
  TO authenticated
  USING (true);

-- Política de escrita: apenas professores da turma ou gestores
CREATE POLICY "allow_manage_class_students" ON public.class_students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_students.class_id
      AND (
        c.teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
        OR 
        EXISTS (SELECT 1 FROM public.gestors WHERE user_id = auth.uid())
      )
    )
  );


-- 3. Otimizar funções de checagem (Bypass RLS)
-- Garantir que as funções não entrem em loop
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS boolean AS $$
BEGIN
  -- Usamos o esquema 'public' explicitamente e garantimos que a função 
  -- ignore o RLS da tabela gestors ao ser executada por uma Role com permissões
  RETURN EXISTS (
    SELECT 1 FROM public.gestors WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teachers WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
