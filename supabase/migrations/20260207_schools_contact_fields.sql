-- ============================================
-- Migration: Add contact and address fields to schools
-- Date: 2026-02-07
-- ============================================

-- Add new columns to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index for CEP lookups
CREATE INDEX IF NOT EXISTS idx_schools_cep ON schools(cep);

-- Comment on columns
COMMENT ON COLUMN schools.cep IS 'Brazilian postal code (CEP) in format 99999-999';
COMMENT ON COLUMN schools.neighborhood IS 'Neighborhood/Bairro';
COMMENT ON COLUMN schools.address IS 'Street address with number';
COMMENT ON COLUMN schools.phone IS 'Contact phone number';
COMMENT ON COLUMN schools.email IS 'Institutional email address';
