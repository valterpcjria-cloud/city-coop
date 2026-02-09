-- ============================================
-- NÚCLEO DE GESTÃO DE COOPERATIVAS
-- Módulo Integrado ao City Coop EAD
-- ============================================

-- ============================================
-- CICLOS E TESTES DO CITY COOP
-- ============================================

CREATE TABLE IF NOT EXISTS public.test_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ciclo int NOT NULL UNIQUE CHECK (numero_ciclo BETWEEN 1 AND 6),
  titulo text NOT NULL,
  descricao text,
  conteudo_pedagogico text,
  data_inicio date,
  data_fim date,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.test_cycles IS 'Ciclos de formação cooperativista (1-6)';

CREATE TABLE IF NOT EXISTS public.cycle_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.test_cycles(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  instrucoes text,
  tempo_limite_minutos int DEFAULT 30,
  num_questoes int DEFAULT 4,
  nota_aprovacao numeric DEFAULT 70 CHECK (nota_aprovacao BETWEEN 0 AND 100),
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.cycle_tests IS 'Testes de avaliação por ciclo';

CREATE TABLE IF NOT EXISTS public.test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.cycle_tests(id) ON DELETE CASCADE,
  questao_texto text NOT NULL,
  opcao_a text NOT NULL,
  opcao_b text NOT NULL,
  opcao_c text NOT NULL,
  opcao_d text NOT NULL,
  resposta_correta char(1) NOT NULL CHECK (resposta_correta IN ('A','B','C','D')),
  ordem int NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.test_questions IS 'Questões dos testes (múltipla escolha)';

CREATE TABLE IF NOT EXISTS public.student_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.cycle_tests(id) ON DELETE CASCADE,
  nota numeric CHECK (nota BETWEEN 0 AND 100),
  data_realizacao timestamp with time zone DEFAULT now(),
  tempo_gasto_minutos int,
  respostas jsonb NOT NULL DEFAULT '{}',
  UNIQUE(student_id, test_id)
);

COMMENT ON TABLE public.student_test_results IS 'Resultados dos testes por estudante (vincula com public.students)';

-- ============================================
-- ENGAJAMENTO E AVALIAÇÕES QUALITATIVAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES public.test_cycles(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id),
  frequencia_atividades numeric DEFAULT 0 CHECK (frequencia_atividades BETWEEN 0 AND 100),
  entregas_realizadas int DEFAULT 0,
  participacao_coletiva numeric DEFAULT 0 CHECK (participacao_coletiva BETWEEN 0 AND 5),
  observacoes text,
  avaliador_id uuid REFERENCES public.teachers(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, cycle_id)
);

CREATE TABLE IF NOT EXISTS public.student_collaboration_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES public.test_cycles(id) ON DELETE CASCADE,
  trabalho_equipe numeric DEFAULT 0 CHECK (trabalho_equipe BETWEEN 0 AND 100),
  lideranca numeric DEFAULT 0 CHECK (lideranca BETWEEN 0 AND 100),
  comunicacao numeric DEFAULT 0 CHECK (comunicacao BETWEEN 0 AND 100),
  resolucao_conflitos numeric DEFAULT 0 CHECK (resolucao_conflitos BETWEEN 0 AND 100),
  avaliador_id uuid REFERENCES public.teachers(id),
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, cycle_id)
);

CREATE TABLE IF NOT EXISTS public.student_cooperative_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  conhecimento_cooperativista numeric DEFAULT 0 CHECK (conhecimento_cooperativista BETWEEN 0 AND 100),
  capacidade_articulacao numeric DEFAULT 0 CHECK (capacidade_articulacao BETWEEN 0 AND 100),
  compromisso_coletivo numeric DEFAULT 0 CHECK (compromisso_coletivo BETWEEN 0 AND 100),
  protagonismo_etico numeric DEFAULT 0 CHECK (protagonismo_etico BETWEEN 0 AND 100),
  avaliador_id uuid REFERENCES public.teachers(id),
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id)
);

-- ============================================
-- SCORES CONSOLIDADOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  conhecimento_score numeric DEFAULT 0 CHECK (conhecimento_score BETWEEN 0 AND 100),
  engajamento_score numeric DEFAULT 0 CHECK (engajamento_score BETWEEN 0 AND 100),
  colaboracao_score numeric DEFAULT 0 CHECK (colaboracao_score BETWEEN 0 AND 100),
  perfil_cooperativista_score numeric DEFAULT 0 CHECK (perfil_cooperativista_score BETWEEN 0 AND 100),
  score_total numeric GENERATED ALWAYS AS (
    (conhecimento_score * 0.4) + 
    (engajamento_score * 0.3) + 
    (colaboracao_score * 0.2) + 
    (perfil_cooperativista_score * 0.1)
  ) STORED,
  ultima_atualizacao timestamp with time zone DEFAULT now(),
  UNIQUE(student_id)
);

-- ============================================
-- NÚCLEO GESTOR ESCOLAR
-- ============================================

CREATE TABLE IF NOT EXISTS public.nucleo_gestor_escolar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id),
  nome text NOT NULL,
  descricao text,
  data_formacao date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Concluído', 'Inativo')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nucleo_escolar_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nucleo_id uuid NOT NULL REFERENCES public.nucleo_gestor_escolar(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  papel text DEFAULT 'Membro' CHECK (papel IN ('Coordenador Geral', 'Vice-Coordenador', 'Secretário', 'Tesoureiro', 'Membro')),
  data_ingresso date DEFAULT CURRENT_DATE,
  data_saida date,
  status text DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Licenciado')),
  criterios_selecao jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(nucleo_id, student_id)
);

-- ============================================
-- COOP-EVENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.coop_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nucleo_escolar_id uuid NOT NULL REFERENCES public.nucleo_gestor_escolar(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  tipo_evento text CHECK (tipo_evento IN ('Cultural', 'Esportivo', 'Educacional', 'Social', 'Ambiental', 'Outro')),
  data_planejada date,
  data_realizada date,
  local text,
  publico_estimado int,
  status text DEFAULT 'Planejamento' CHECK (status IN ('Planejamento', 'Aprovado', 'Em Execução', 'Concluído', 'Cancelado')),
  orcamento_previsto numeric,
  orcamento_realizado numeric,
  avaliacao_coletiva text,
  relatorio_final text,
  documentos jsonb DEFAULT '[]',
  fotos jsonb DEFAULT '[]',
  aprovado_por uuid REFERENCES public.teachers(id),
  data_aprovacao timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- COOPERATIVAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.cooperatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL,
  nome_fantasia text,
  cnpj text UNIQUE,
  ramo_cooperativista text CHECK (ramo_cooperativista IN (
    'Agropecuário', 'Consumo', 'Crédito', 'Educacional', 'Habitacional',
    'Infraestrutura', 'Mineral', 'Produção', 'Saúde', 'Trabalho', 
    'Transporte', 'Turismo e Lazer', 'Outro'
  )),
  endereco text,
  cidade text NOT NULL,
  estado text NOT NULL,
  cep text,
  latitude numeric,
  longitude numeric,
  responsavel_nome text NOT NULL,
  responsavel_email text NOT NULL,
  responsavel_telefone text,
  responsavel_cargo text,
  site text,
  descricao text,
  numero_cooperados int,
  ano_fundacao int,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cooperative_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id uuid NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL CHECK (tipo IN ('Vaga CLT', 'Estágio', 'Projeto Temporário', 'Voluntariado', 'Bolsa Formação', 'Cooperado')),
  requisitos text,
  competencias_desejadas text[] DEFAULT '{}',
  carga_horaria text,
  remuneracao_min numeric,
  remuneracao_max numeric,
  contrapartida text,
  vagas_disponiveis int DEFAULT 1,
  data_inicio date,
  data_fim date,
  status text DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Em Análise', 'Preenchida', 'Encerrada', 'Cancelada')),
  contato_email text,
  contato_telefone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- NÚCLEO GESTOR INTERCOOP
-- ============================================

CREATE TABLE IF NOT EXISTS public.nucleo_intercoop_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  data_ingresso date DEFAULT CURRENT_DATE,
  data_saida date,
  papel text NOT NULL CHECK (papel IN (
    'Coordenador de Projetos',
    'Multiplicador Regional',
    'Facilitador de Formação',
    'Articulador de Cooperativas',
    'Analista de Dados',
    'Comunicação e Marketing',
    'Membro'
  )),
  remunerado boolean DEFAULT false,
  tipo_vinculo text CHECK (tipo_vinculo IN ('Bolsa', 'CLT', 'PJ', 'Voluntário')),
  valor_bolsa numeric,
  carga_horaria_semanal int,
  projetos_atuacao text[] DEFAULT '{}',
  escolas_responsavel uuid[] DEFAULT '{}',
  cooperativas_vinculadas uuid[] DEFAULT '{}',
  status text DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Afastado', 'Desligado')),
  observacoes text,
  gestor_responsavel_id uuid REFERENCES public.gestors(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id)
);

-- ============================================
-- MATCHING E CONEXÕES
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_cooperative_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  cooperative_id uuid NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES public.cooperative_opportunities(id) ON DELETE SET NULL,
  status text DEFAULT 'Indicado' CHECK (status IN (
    'Indicado', 
    'Currículo Enviado', 
    'Em Processo Seletivo', 
    'Entrevista Agendada',
    'Aprovado',
    'Atuando', 
    'Concluído', 
    'Recusado',
    'Cancelado'
  )),
  data_indicacao date DEFAULT CURRENT_DATE,
  data_inicio_atuacao date,
  data_fim_atuacao date,
  indicado_por uuid REFERENCES public.gestors(id),
  avaliacao_cooperativa numeric CHECK (avaliacao_cooperativa BETWEEN 1 AND 5),
  feedback_cooperativa text,
  avaliacao_estudante numeric CHECK (avaliacao_estudante BETWEEN 1 AND 5),
  feedback_estudante text,
  observacoes text,
  documentos jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- CONFIGURAÇÕES DO SISTEMA
-- ============================================

CREATE TABLE IF NOT EXISTS public.score_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  peso_conhecimento numeric DEFAULT 0.4 CHECK (peso_conhecimento BETWEEN 0 AND 1),
  peso_engajamento numeric DEFAULT 0.3 CHECK (peso_engajamento BETWEEN 0 AND 1),
  peso_colaboracao numeric DEFAULT 0.2 CHECK (peso_colaboracao BETWEEN 0 AND 1),
  peso_perfil numeric DEFAULT 0.1 CHECK (peso_perfil BETWEEN 0 AND 1),
  nota_minima_nucleo_escolar numeric DEFAULT 70 CHECK (nota_minima_nucleo_escolar BETWEEN 0 AND 100),
  nota_minima_nucleo_intercoop numeric DEFAULT 80 CHECK (nota_minima_nucleo_intercoop BETWEEN 0 AND 100),
  raio_matching_km numeric DEFAULT 50,
  testes_minimos_nucleo int DEFAULT 5,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES public.gestors(id),
  CONSTRAINT peso_total_100 CHECK ((peso_conhecimento + peso_engajamento + peso_colaboracao + peso_perfil) = 1)
);

-- Inserir configuração padrão se não existir
INSERT INTO public.score_config (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM public.score_config);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_test_results_student ON public.student_test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test ON public.student_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_engagement_student ON public.student_engagement(student_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_student ON public.student_collaboration_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_student ON public.student_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_nucleo_escolar_school ON public.nucleo_gestor_escolar(school_id);
CREATE INDEX IF NOT EXISTS idx_nucleo_members_student ON public.nucleo_escolar_members(student_id);
CREATE INDEX IF NOT EXISTS idx_coop_eventos_nucleo ON public.coop_eventos(nucleo_escolar_id);
CREATE INDEX IF NOT EXISTS idx_connections_student ON public.student_cooperative_connections(student_id);
CREATE INDEX IF NOT EXISTS idx_cooperatives_cidade ON public.cooperatives(cidade);
CREATE INDEX IF NOT EXISTS idx_opportunities_coop ON public.cooperative_opportunities(cooperative_id);

-- ============================================
-- TRIGGERS PARA CÁLCULO AUTOMÁTICO DE SCORES
-- ============================================

-- TRIGGER: Atualizar Score de Conhecimento
CREATE OR REPLACE FUNCTION update_conhecimento_score()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_scores (student_id, conhecimento_score)
  VALUES (
    NEW.student_id,
    (SELECT COALESCE(AVG(nota), 0) FROM public.student_test_results WHERE student_id = NEW.student_id)
  )
  ON CONFLICT (student_id) 
  DO UPDATE SET 
    conhecimento_score = (SELECT COALESCE(AVG(nota), 0) FROM public.student_test_results WHERE student_id = NEW.student_id),
    ultima_atualizacao = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conhecimento ON public.student_test_results;
CREATE TRIGGER trigger_update_conhecimento
AFTER INSERT OR UPDATE ON public.student_test_results
FOR EACH ROW
EXECUTE FUNCTION update_conhecimento_score();

-- TRIGGER: Atualizar Score de Engajamento
CREATE OR REPLACE FUNCTION update_engajamento_score()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_scores (student_id, engajamento_score)
  VALUES (
    NEW.student_id,
    (SELECT COALESCE(AVG(frequencia_atividades), 0) FROM public.student_engagement WHERE student_id = NEW.student_id)
  )
  ON CONFLICT (student_id)
  DO UPDATE SET
    engajamento_score = (SELECT COALESCE(AVG(frequencia_atividades), 0) FROM public.student_engagement WHERE student_id = NEW.student_id),
    ultima_atualizacao = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_engajamento ON public.student_engagement;
CREATE TRIGGER trigger_update_engajamento
AFTER INSERT OR UPDATE ON public.student_engagement
FOR EACH ROW
EXECUTE FUNCTION update_engajamento_score();

-- TRIGGER: Atualizar Score de Colaboração
CREATE OR REPLACE FUNCTION update_colaboracao_score()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_scores (student_id, colaboracao_score)
  VALUES (
    NEW.student_id,
    (SELECT COALESCE(AVG((trabalho_equipe + lideranca + comunicacao + resolucao_conflitos) / 4.0), 0) 
     FROM public.student_collaboration_scores 
     WHERE student_id = NEW.student_id)
  )
  ON CONFLICT (student_id)
  DO UPDATE SET
    colaboracao_score = (SELECT COALESCE(AVG((trabalho_equipe + lideranca + comunicacao + resolucao_conflitos) / 4.0), 0) 
                         FROM public.student_collaboration_scores 
                         WHERE student_id = NEW.student_id),
    ultima_atualizacao = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_colaboracao ON public.student_collaboration_scores;
CREATE TRIGGER trigger_update_colaboracao
AFTER INSERT OR UPDATE ON public.student_collaboration_scores
FOR EACH ROW
EXECUTE FUNCTION update_colaboracao_score();

-- TRIGGER: Atualizar Perfil Cooperativista
CREATE OR REPLACE FUNCTION update_perfil_cooperativista_score()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_scores (student_id, perfil_cooperativista_score)
  VALUES (
    NEW.student_id,
    (SELECT COALESCE(AVG((conhecimento_cooperativista + capacidade_articulacao + compromisso_coletivo + protagonismo_etico) / 4.0), 0) 
     FROM public.student_cooperative_profile 
     WHERE student_id = NEW.student_id)
  )
  ON CONFLICT (student_id)
  DO UPDATE SET
    perfil_cooperativista_score = (SELECT COALESCE(AVG((conhecimento_cooperativista + capacidade_articulacao + compromisso_coletivo + protagonismo_etico) / 4.0), 0) 
                                   FROM public.student_cooperative_profile 
                                   WHERE student_id = NEW.student_id),
    ultima_atualizacao = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_perfil ON public.student_cooperative_profile;
CREATE TRIGGER trigger_update_perfil
AFTER INSERT OR UPDATE ON public.student_cooperative_profile
FOR EACH ROW
EXECUTE FUNCTION update_perfil_cooperativista_score();

-- ============================================
-- VIEWS CONSOLIDADAS
-- ============================================

CREATE OR REPLACE VIEW public.vw_students_complete AS
SELECT 
  s.id,
  s.user_id,
  s.name,
  s.email,
  s.grade_level,
  s.cpf,
  s.phone,
  s.is_active,
  sch.id as school_id,
  sch.name as school_name,
  sch.city as school_city,
  sch.state as school_state,
  sc.conhecimento_score,
  sc.engajamento_score,
  sc.colaboracao_score,
  sc.perfil_cooperativista_score,
  sc.score_total,
  sc.ultima_atualizacao as score_updated_at
FROM public.students s
LEFT JOIN public.schools sch ON sch.id = s.school_id
LEFT JOIN public.student_scores sc ON sc.student_id = s.id
WHERE s.is_active = true;

-- Habilitar RLS
ALTER TABLE public.test_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_collaboration_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cooperative_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nucleo_gestor_escolar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nucleo_escolar_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coop_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperative_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nucleo_intercoop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cooperative_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_config ENABLE ROW LEVEL SECURITY;
