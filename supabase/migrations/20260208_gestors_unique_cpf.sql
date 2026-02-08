-- Migration: Unify CPF uniqueness across gestors, teachers and students
-- Date: 2026-02-08

-- 1. Add CPF column to gestors table
ALTER TABLE gestors ADD COLUMN IF NOT EXISTS cpf TEXT;
CREATE INDEX IF NOT EXISTS idx_gestors_cpf ON gestors(cpf);

-- 2. Create the unified uniqueness function
CREATE OR REPLACE FUNCTION check_cpf_uniqueness_global()
RETURNS TRIGGER AS $$
DECLARE
    found_name TEXT;
    found_type TEXT;
BEGIN
    -- Only check if CPF is not null and not empty
    IF NEW.cpf IS NOT NULL AND NEW.cpf != '' THEN
        
        -- Check in Gestors
        SELECT name, 'Gestor' INTO found_name, found_type FROM gestors 
        WHERE cpf = NEW.cpf AND (TG_TABLE_NAME != 'gestors' OR id != NEW.id) LIMIT 1;
        
        IF found_name IS NOT NULL THEN
            RAISE EXCEPTION 'CPF já cadastrado para o %: %', found_type, found_name;
        END IF;

        -- Check in Teachers
        SELECT name, 'Professor' INTO found_name, found_type FROM teachers 
        WHERE cpf = NEW.cpf AND (TG_TABLE_NAME != 'teachers' OR id != NEW.id) LIMIT 1;
        
        IF found_name IS NOT NULL THEN
            RAISE EXCEPTION 'CPF já cadastrado para o %: %', found_type, found_name;
        END IF;

        -- Check in Students
        SELECT name, 'Estudante' INTO found_name, found_type FROM students 
        WHERE cpf = NEW.cpf AND (TG_TABLE_NAME != 'students' OR id != NEW.id) LIMIT 1;
        
        IF found_name IS NOT NULL THEN
            RAISE EXCEPTION 'CPF já cadastrado para o %: %', found_type, found_name;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Apply triggers to all three tables
-- Gestors
DROP TRIGGER IF EXISTS check_cpf_global_gestors ON gestors;
CREATE TRIGGER check_cpf_global_gestors
    BEFORE INSERT OR UPDATE ON gestors
    FOR EACH ROW
    EXECUTE FUNCTION check_cpf_uniqueness_global();

-- Teachers
DROP TRIGGER IF EXISTS check_cpf_teachers ON teachers; -- Old trigger
DROP TRIGGER IF EXISTS check_cpf_global_teachers ON teachers;
CREATE TRIGGER check_cpf_global_teachers
    BEFORE INSERT OR UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION check_cpf_uniqueness_global();

-- Students
DROP TRIGGER IF EXISTS check_cpf_students ON students; -- Old trigger
DROP TRIGGER IF EXISTS check_cpf_global_students ON students;
CREATE TRIGGER check_cpf_global_students
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION check_cpf_uniqueness_global();
