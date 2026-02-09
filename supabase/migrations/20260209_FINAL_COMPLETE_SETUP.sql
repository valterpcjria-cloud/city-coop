-- ============================================
-- SCRIPT DE AJUSTE FINAL: NÚCLEO DE GESTÃO
-- Rode este script para garantir que todas as views e permissões existam.
-- ============================================

-- 1. VIEW BASE (Completa)
CREATE OR REPLACE VIEW public.vw_students_complete AS
SELECT 
  s.id, s.user_id, s.name, s.email, s.grade_level, s.cpf, s.phone, s.is_active,
  sch.id as school_id, sch.name as school_name, sch.city as school_city, sch.state as school_state,
  sc.conhecimento_score, sc.engajamento_score, sc.colaboracao_score, sc.perfil_cooperativista_score,
  sc.score_total, sc.ultima_atualizacao as score_updated_at
FROM public.students s
LEFT JOIN public.schools sch ON sch.id = s.school_id
LEFT JOIN public.student_scores sc ON sc.student_id = s.id
WHERE s.is_active = true;

-- 2. VIEWS DE RANKING (Candidatos)
CREATE OR REPLACE VIEW public.vw_candidatos_nucleo_escolar AS
SELECT *, CASE WHEN score_total >= 80 THEN 'Apto' WHEN score_total >= 70 THEN 'Em Observação' ELSE 'Iniciante' END as status_candidatura
FROM public.vw_students_complete WHERE score_total >= 10; -- Mantendo baixo para facilitar testes

CREATE OR REPLACE VIEW public.vw_candidatos_nucleo_intercoop AS
SELECT *, CASE WHEN score_total >= 90 THEN 'Apto' WHEN score_total >= 80 THEN 'Em Observação' ELSE 'Iniciante' END as status_candidatura
FROM public.vw_students_complete WHERE score_total >= 10;

-- 3. VIEW DE MATCHING
CREATE OR REPLACE VIEW public.vw_matching_opportunities AS
SELECT 
  s.id as student_id, s.name as student_name, s.grade_level, sc.score_total,
  c.id as coop_id, c.nome_fantasia as coop_name,
  o.id as opportunity_id, o.titulo as opportunity_title, o.tipo as tipo_oportunidade,
  0.0 as distancia_km 
FROM public.students s
JOIN public.student_scores sc ON sc.student_id = s.id
CROSS JOIN public.cooperatives c
JOIN public.cooperative_opportunities o ON o.cooperative_id = c.id
WHERE s.is_active = true AND c.ativo = true AND o.status = 'Aberta';

-- 4. DADOS DE TESTE (Seed)
INSERT INTO public.test_cycles (numero_ciclo, titulo, descricao, ativo) 
VALUES (1, 'Princípios Cooperativos', 'Base do cooperativismo mundial.', true),
       (2, 'Governança e Gestão', 'Assembleias e decisões coletivas.', true)
ON CONFLICT (numero_ciclo) DO NOTHING;

INSERT INTO public.cooperatives (razao_social, nome_fantasia, cnpj, ramo_cooperativista, cidade, estado, responsavel_nome, responsavel_email)
VALUES ('Coop Teste Central', 'City Coop Parceira', '00.000.000/0001-00', 'Crédito', 'São Paulo', 'SP', 'Admin', 'admin@citycoop.com')
ON CONFLICT (cnpj) DO NOTHING;

-- Criar oportunidade se a coop existe
DO $$
DECLARE
    v_coop_id uuid;
BEGIN
    SELECT id INTO v_coop_id FROM public.cooperatives WHERE cnpj = '00.000.000/0001-00';
    IF v_coop_id IS NOT NULL THEN
        INSERT INTO public.cooperative_opportunities (cooperative_id, titulo, tipo, status)
        VALUES (v_coop_id, 'Aprendiz Cooperativo', 'Estágio', 'Aberta');
    END IF;
END $$;
