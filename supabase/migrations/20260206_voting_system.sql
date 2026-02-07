-- =============================================
-- SISTEMA DE VOTAÇÃO DIGITAL - COOPERATIVA ESCOLAR
-- Migração: 20260206_voting_system.sql
-- Em conformidade com Lei 5.764/1971
-- =============================================

-- 1. TABELA DE ELEIÇÕES
CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'configuracao' CHECK (status IN ('configuracao', 'inscricoes', 'campanha', 'votacao', 'encerrada')),
  
  -- Cronograma
  data_inicio_inscricoes TIMESTAMPTZ,
  data_fim_inscricoes TIMESTAMPTZ,
  data_inicio_campanha TIMESTAMPTZ,
  data_fim_campanha TIMESTAMPTZ,
  data_inicio_votacao TIMESTAMPTZ,
  data_fim_votacao TIMESTAMPTZ,
  
  -- Configuração de vagas
  vagas_administracao INTEGER DEFAULT 3,
  vagas_fiscal_efetivos INTEGER DEFAULT 3,
  vagas_fiscal_suplentes INTEGER DEFAULT 3,
  vagas_etica INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE CANDIDATOS
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  conselho VARCHAR(20) NOT NULL CHECK (conselho IN ('administracao', 'fiscal', 'etica')),
  proposta TEXT NOT NULL,
  aprovado BOOLEAN DEFAULT TRUE,
  total_votos INTEGER DEFAULT 0,
  resultado VARCHAR(20) CHECK (resultado IN ('eleito_efetivo', 'eleito_suplente', 'nao_eleito', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Um aluno só pode ser candidato a UM conselho por eleição
  UNIQUE(election_id, student_id)
);

-- 3. CONTROLE DE VOTAÇÃO (Quem votou, mas NÃO em quem)
CREATE TABLE IF NOT EXISTS vote_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  votou_administracao BOOLEAN DEFAULT FALSE,
  votou_fiscal BOOLEAN DEFAULT FALSE,
  votou_etica BOOLEAN DEFAULT FALSE,
  timestamp_voto TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garante que cada aluno só vote uma vez por eleição
  UNIQUE(election_id, student_id)
);

-- 4. TABELA DE VOTOS (ANÔNIMA - SEM student_id!)
-- CRÍTICO: Esta tabela garante o sigilo do voto
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para contagem rápida de votos
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);

-- 5. DOCUMENTOS GERADOS (Atas, etc)
CREATE TABLE IF NOT EXISTS election_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  tipo VARCHAR(20) CHECK (tipo IN ('ata_eleitoral', 'resultado')),
  conteudo TEXT,
  url_pdf VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_elections_class ON elections(class_id);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_candidates_conselho ON candidates(conselho);
CREATE INDEX IF NOT EXISTS idx_vote_controls_election ON vote_controls(election_id);
CREATE INDEX IF NOT EXISTS idx_vote_controls_student ON vote_controls(student_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_documents ENABLE ROW LEVEL SECURITY;

-- Políticas para elections (todos podem ver, só professor pode modificar)
CREATE POLICY "Elections visible to authenticated users" ON elections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Elections manageable by teachers" ON elections
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = elections.class_id
      AND t.user_id = auth.uid()
    )
  );

-- Políticas para candidates
CREATE POLICY "Candidates visible to authenticated users" ON candidates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can create own candidacy" ON candidates
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = candidates.student_id 
      AND s.user_id = auth.uid()
    )
  );

-- Políticas para vote_controls
CREATE POLICY "Vote controls visible to own student" ON vote_controls
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = vote_controls.student_id 
      AND s.user_id = auth.uid()
    )
  );

-- Políticas para votes (anônimo - ninguém pode ver votos individuais)
-- Apenas contagem via API

-- Políticas para election_documents
CREATE POLICY "Documents visible after election ends" ON election_documents
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM elections e 
      WHERE e.id = election_documents.election_id 
      AND e.status = 'encerrada'
    )
  );

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_elections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS elections_updated_at ON elections;
CREATE TRIGGER elections_updated_at
  BEFORE UPDATE ON elections
  FOR EACH ROW
  EXECUTE FUNCTION update_elections_updated_at();

-- =============================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =============================================
COMMENT ON TABLE elections IS 'Eleições de conselhos cooperativistas';
COMMENT ON TABLE candidates IS 'Candidatos inscritos nas eleições';
COMMENT ON TABLE vote_controls IS 'Controle de quem votou (sem revelar em quem)';
COMMENT ON TABLE votes IS 'Votos anônimos - NÃO contém identificação do votante';
COMMENT ON TABLE election_documents IS 'Atas e documentos gerados';
