-- ============================================
-- Migration: Add INEP-style fields to schools
-- Date: 2026-02-07
-- Based on MEC/INEP school data model
-- ============================================

-- Categoria Administrativa (Pública Municipal, Pública Estadual, Pública Federal, Privada)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS administrative_category TEXT 
    CHECK (administrative_category IN ('publica_municipal', 'publica_estadual', 'publica_federal', 'privada'));

-- Etapas de Ensino oferecidas (array de etapas)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS education_stages TEXT[] DEFAULT '{}';

-- Código INEP oficial da escola (8 dígitos)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS inep_code TEXT;

-- Tipo de localização
ALTER TABLE schools ADD COLUMN IF NOT EXISTS location_type TEXT 
    CHECK (location_type IN ('urbana', 'rural'));

-- Dependência administrativa detalhada
ALTER TABLE schools ADD COLUMN IF NOT EXISTS dependency TEXT;

-- Situação de funcionamento
ALTER TABLE schools ADD COLUMN IF NOT EXISTS operation_status TEXT DEFAULT 'em_atividade'
    CHECK (operation_status IN ('em_atividade', 'paralisada', 'extinta'));

-- Contatos adicionais
ALTER TABLE schools ADD COLUMN IF NOT EXISTS director_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS secondary_phone TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS website TEXT;

-- Número do endereço (separado do logradouro)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS address_complement TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_schools_inep_code ON schools(inep_code);
CREATE INDEX IF NOT EXISTS idx_schools_administrative_category ON schools(administrative_category);
CREATE INDEX IF NOT EXISTS idx_schools_operation_status ON schools(operation_status);

-- Comentários
COMMENT ON COLUMN schools.administrative_category IS 'Categoria administrativa: publica_municipal, publica_estadual, publica_federal, privada';
COMMENT ON COLUMN schools.education_stages IS 'Etapas de ensino: creche, pre_escola, fundamental_anos_iniciais, fundamental_anos_finais, ensino_medio, eja, educacao_especial';
COMMENT ON COLUMN schools.inep_code IS 'Código INEP oficial (8 dígitos)';
COMMENT ON COLUMN schools.location_type IS 'Tipo de localização: urbana ou rural';
COMMENT ON COLUMN schools.operation_status IS 'Situação de funcionamento da escola';
