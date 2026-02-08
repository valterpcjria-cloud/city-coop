-- Migration: Add CPF column to teachers and students tables
-- Date: 2026-02-07
-- CPF must be unique across BOTH tables (a teacher and student cannot share the same CPF)

-- Add CPF column to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Add CPF column to students table  
ALTER TABLE students ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Create index for faster CPF lookups
CREATE INDEX IF NOT EXISTS idx_teachers_cpf ON teachers(cpf);
CREATE INDEX IF NOT EXISTS idx_students_cpf ON students(cpf);

-- Create function to validate CPF uniqueness across both tables
CREATE OR REPLACE FUNCTION check_cpf_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check if CPF is not null
    IF NEW.cpf IS NOT NULL THEN
        -- Check if CPF exists in teachers table (excluding current record if updating)
        IF TG_TABLE_NAME = 'teachers' THEN
            IF EXISTS (SELECT 1 FROM students WHERE cpf = NEW.cpf) THEN
                RAISE EXCEPTION 'CPF já cadastrado para um estudante';
            END IF;
            IF EXISTS (SELECT 1 FROM teachers WHERE cpf = NEW.cpf AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')) THEN
                RAISE EXCEPTION 'CPF já cadastrado para outro professor';
            END IF;
        END IF;
        
        -- Check if CPF exists in students table (excluding current record if updating)
        IF TG_TABLE_NAME = 'students' THEN
            IF EXISTS (SELECT 1 FROM teachers WHERE cpf = NEW.cpf) THEN
                RAISE EXCEPTION 'CPF já cadastrado para um professor';
            END IF;
            IF EXISTS (SELECT 1 FROM students WHERE cpf = NEW.cpf AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')) THEN
                RAISE EXCEPTION 'CPF já cadastrado para outro estudante';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on both tables
DROP TRIGGER IF EXISTS check_cpf_teachers ON teachers;
CREATE TRIGGER check_cpf_teachers
    BEFORE INSERT OR UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION check_cpf_uniqueness();

DROP TRIGGER IF EXISTS check_cpf_students ON students;
CREATE TRIGGER check_cpf_students
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION check_cpf_uniqueness();
