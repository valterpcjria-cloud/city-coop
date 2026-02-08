-- =============================================
-- FIX: Adicionar 'EJA' às Séries Permitidas
-- =============================================

-- 1. Atualizar a restrição na tabela 'students'
ALTER TABLE students 
DROP CONSTRAINT students_grade_level_check;

ALTER TABLE students 
ADD CONSTRAINT students_grade_level_check 
CHECK (grade_level IN ('9EF', '1EM', '2EM', '3EM', 'EJA'));

-- 2. Atualizar a restrição na tabela 'classes' (se houver restrição lá também)
-- Verificando estrutura inicial, classes tem grade_level como TEXT sem check em alguns casos, 
-- mas vamos garantir que o sistema aceite.

COMMENT ON COLUMN students.grade_level IS 'Série do aluno (9EF, 1EM, 2EM, 3EM, EJA)';
