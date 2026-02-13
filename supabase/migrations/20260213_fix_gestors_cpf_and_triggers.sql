-- Migration: Definitive fix for Gestors CPF and Global Uniqueness Triggers
-- Date: 2026-02-13
-- Description: Ensures gestors table has CPF column and all triggers are correctly linked to a global uniqueness checker.

-- 1. Ensure CPF column exists in gestors
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gestors' AND column_name = 'cpf'
    ) THEN
        ALTER TABLE gestors ADD COLUMN cpf TEXT;
        RAISE NOTICE 'Added cpf column to gestors table';
    END IF;
END $$;

-- 2. Ensure index exists
CREATE INDEX IF NOT EXISTS idx_gestors_cpf ON gestors(cpf);

-- 3. Re-create or update the global uniqueness function
CREATE OR REPLACE FUNCTION check_cpf_uniqueness_global()
RETURNS TRIGGER AS $$
DECLARE
    found_name TEXT;
    found_type TEXT;
    found_id UUID;
BEGIN
    -- Only check if CPF is not null and not empty
    IF NEW.cpf IS NOT NULL AND NEW.cpf != '' THEN
        
        -- Check in Gestors
        SELECT name, 'Gestor', id INTO found_name, found_type, found_id FROM gestors 
        WHERE cpf = NEW.cpf AND (TG_TABLE_NAME != 'gestors' OR id != NEW.id) LIMIT 1;
        
        IF found_name IS NOT NULL THEN
            RAISE EXCEPTION 'CPF [%] já cadastrado para o %: % (ID: %)', NEW.cpf, found_type, found_name, found_id;
        END IF;

        -- Check in Teachers
        SELECT name, 'Professor', id INTO found_name, found_type, found_id FROM teachers 
        WHERE cpf = NEW.cpf AND (TG_TABLE_NAME != 'teachers' OR id != NEW.id) LIMIT 1;
        
        IF found_name IS NOT NULL THEN
            RAISE EXCEPTION 'CPF [%] já cadastrado para o %: % (ID: %)', NEW.cpf, found_type, found_name, found_id;
        END IF;

        -- Check in Students
        SELECT name, 'Estudante', id INTO found_name, found_type, found_id FROM students 
        WHERE cpf = NEW.cpf AND (TG_TABLE_NAME != 'students' OR id != NEW.id) LIMIT 1;
        
        IF found_name IS NOT NULL THEN
            RAISE EXCEPTION 'CPF [%] já cadastrado para o %: % (ID: %)', NEW.cpf, found_type, found_name, found_id;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-apply triggers to ensure they are using the latest function
-- Gestors
DROP TRIGGER IF EXISTS check_cpf_global_gestors ON gestors;
CREATE TRIGGER check_cpf_global_gestors
    BEFORE INSERT OR UPDATE ON gestors
    FOR EACH ROW
    EXECUTE FUNCTION check_cpf_uniqueness_global();

-- Teachers
DROP TRIGGER IF EXISTS check_cpf_teachers ON teachers;
DROP TRIGGER IF EXISTS check_cpf_global_teachers ON teachers;
CREATE TRIGGER check_cpf_global_teachers
    BEFORE INSERT OR UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION check_cpf_uniqueness_global();

-- Students
DROP TRIGGER IF EXISTS check_cpf_students ON students;
DROP TRIGGER IF EXISTS check_cpf_global_students ON students;
CREATE TRIGGER check_cpf_global_students
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION check_cpf_uniqueness_global();

-- 5. Force PostgREST cache reload (Supabase specific)
NOTIFY pgrst, 'reload schema';
