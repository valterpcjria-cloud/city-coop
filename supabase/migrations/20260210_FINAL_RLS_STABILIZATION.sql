-- ========================================================
-- ESTABILIZAÇÃO DEFINITIVA DE RLS (CLEAN SLATE)
-- Objetivo: Remover TODA recursão e simplificar permissões
-- ========================================================

-- 1. Limpeza Dinâmica de TODAS as políticas nas tabelas core
DO $$ 
DECLARE 
    t TEXT;
    pol RECORD;
BEGIN 
    FOR t IN SELECT unnest(ARRAY[
        'gestors', 'teachers', 'students', 'classes', 
        'class_students', 'nuclei', 'nucleus_members', 
        'assemblies', 'event_plans', 'assessments', 'assessment_responses'
    ]) 
    LOOP 
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = t AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
        END LOOP;
    END LOOP;
END $$;

-- 2. RESET RLS (Garantir que está ligado)
ALTER TABLE public.gestors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nuclei ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nucleus_members ENABLE ROW LEVEL SECURITY;


-- 3. POLÍTICAS DE LEITURA (ESTÁVEIS E NÃO RECURSIVAS)
-- Permitimos que qualquer usuário autenticado veja dados básicos (nome, turma, etc.)
-- Dados realmente sensíveis (senhas) ficam no auth.users
CREATE POLICY "stable_read_gestors" ON public.gestors FOR SELECT TO authenticated USING (true);
CREATE POLICY "stable_read_teachers" ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "stable_read_students" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "stable_read_classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "stable_read_class_students" ON public.class_students FOR SELECT TO authenticated USING (true);
CREATE POLICY "stable_read_nuclei" ON public.nuclei FOR SELECT TO authenticated USING (true);
CREATE POLICY "stable_read_nucleus_members" ON public.nucleus_members FOR SELECT TO authenticated USING (true);


-- 4. POLÍTICAS DE GESTÃO (COM ESCRITA)

-- PROFILE SELF-EDIT (Gestores, Professores, Alunos podem editar seus perfis)
CREATE POLICY "gestors_self_update" ON public.gestors FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "teachers_self_update" ON public.teachers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "students_self_update" ON public.students FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- TEACHER MANAGEMENT (Professores gerenciam seus dados)
-- Simplificamos: Se o teacher_id ou a classe pertence ao professor, ele tem acesso total
CREATE POLICY "teachers_manage_own_classes" ON public.classes 
    FOR ALL TO authenticated 
    USING (teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid()))
    WITH CHECK (teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid()));

CREATE POLICY "teachers_manage_own_class_students" ON public.class_students 
    FOR ALL TO authenticated 
    USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())))
    WITH CHECK (class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())));

CREATE POLICY "teachers_manage_own_nuclei" ON public.nuclei 
    FOR ALL TO authenticated 
    USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())))
    WITH CHECK (class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())));

CREATE POLICY "teachers_manage_own_members" ON public.nucleus_members 
    FOR ALL TO authenticated 
    USING (nucleus_id IN (SELECT n.id FROM public.nuclei n JOIN public.classes c ON c.id = n.class_id WHERE c.teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())))
    WITH CHECK (nucleus_id IN (SELECT n.id FROM public.nuclei n JOIN public.classes c ON c.id = n.class_id WHERE c.teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())));


-- GESTOR MANAGEMENT (Gestores podem gerenciar tudo se 'is_active')
-- Usamos is_gestor_non_recursive() para evitar loop
CREATE OR REPLACE FUNCTION public.is_gestor_stable()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.gestors WHERE user_id = auth.uid() AND is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE POLICY "gestors_full_access_gestors" ON public.gestors FOR ALL TO authenticated USING (public.is_gestor_stable());
CREATE POLICY "gestors_full_access_teachers" ON public.teachers FOR ALL TO authenticated USING (public.is_gestor_stable());
CREATE POLICY "gestors_full_access_students" ON public.students FOR ALL TO authenticated USING (public.is_gestor_stable());
CREATE POLICY "gestors_full_access_classes" ON public.classes FOR ALL TO authenticated USING (public.is_gestor_stable());
CREATE POLICY "gestors_full_access_enrollments" ON public.class_students FOR ALL TO authenticated USING (public.is_gestor_stable());
CREATE POLICY "gestors_full_access_nuclei" ON public.nuclei FOR ALL TO authenticated USING (public.is_gestor_stable());
CREATE POLICY "gestors_full_access_members" ON public.nucleus_members FOR ALL TO authenticated USING (public.is_gestor_stable());


-- 5. Atualizar funções antigas para usar a versão estável
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS boolean AS $$
BEGIN
  RETURN public.is_gestor_stable();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
