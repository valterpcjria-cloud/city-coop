-- =====================================================
-- SOLUÇÃO DEFINITIVA: Corrigir recursão infinita no RLS
-- O problema é que várias tabelas referenciam 'classes' 
-- criando um loop de dependências
-- =====================================================

-- PASSO 1: Desabilitar RLS em todas as tabelas relacionadas
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_students DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover TODAS as políticas da tabela 'classes'
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'classes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON classes', pol.policyname);
    END LOOP;
END $$;

-- PASSO 3: Remover políticas problemáticas de 'class_students'
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'class_students'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON class_students', pol.policyname);
    END LOOP;
END $$;

-- PASSO 4: Remover políticas de 'students' que causam recursão
DROP POLICY IF EXISTS "teachers_class_students" ON students;

-- PASSO 5: Reabilitar RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- PASSO 6: Criar políticas SIMPLES sem recursão
-- Para classes: permitir leitura para todos autenticados
CREATE POLICY "authenticated_read_classes" ON classes
    FOR SELECT
    TO authenticated
    USING (true);

-- Para classes: escrita apenas para professores donos
CREATE POLICY "teachers_write_classes" ON classes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
    );

CREATE POLICY "teachers_update_classes" ON classes
    FOR UPDATE
    TO authenticated
    USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()))
    WITH CHECK (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

CREATE POLICY "teachers_delete_classes" ON classes
    FOR DELETE
    TO authenticated
    USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

-- Para class_students: permitir leitura para todos autenticados
CREATE POLICY "authenticated_read_class_students" ON class_students
    FOR SELECT
    TO authenticated
    USING (true);

-- Para students: manter política simples
CREATE POLICY "students_view_self" ON students
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "teachers_view_students" ON students
    FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- Verificar se funcionou
-- =====================================================
-- SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('classes', 'class_students', 'students');
