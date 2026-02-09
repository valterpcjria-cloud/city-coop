-- ============================================
-- SEED DATA: NÚCLEO DE GESTÃO DE COOPERATIVAS
-- ============================================

-- 1. Inserir Ciclos de Teste
INSERT INTO public.test_cycles (numero_ciclo, titulo, descricao, data_inicio, data_fim) 
VALUES 
(1, 'Introdução ao Cooperativismo', 'História, princípios e valores do cooperativismo universal.', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days'),
(2, 'Doutrina e Identidade', 'O que nos diferencia: a identidade cooperativa na prática.', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days'),
(3, 'Gestão e Governança', 'Como funcionam as assembleias, conselhos e a transparência.', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days');

-- 2. Inserir Testes para o Ciclo 1
DO $$
DECLARE
    v_cycle_id uuid;
    v_test_id uuid;
BEGIN
    SELECT id INTO v_cycle_id FROM public.test_cycles WHERE numero_ciclo = 1;

    INSERT INTO public.cycle_tests (cycle_id, titulo, instrucoes, num_questoes)
    VALUES (v_cycle_id, 'Avaliação de Introdução', 'Leia as questões com atenção. Pontuação mínima 7.0', 4)
    RETURNING id INTO v_test_id;

    -- Inserir Questões
    INSERT INTO public.test_questions (test_id, questao_texto, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, ordem)
    VALUES 
    (v_test_id, 'Qual é o primeiro princípio do cooperativismo?', 'Gestão Democrática', 'Adesão Voluntária e Livre', 'Interesse pela Comunidade', 'Autonomia e Independência', 'B', 1),
    (v_test_id, 'Onde surgiu a primeira cooperativa moderna?', 'Londres', 'Manchester (Rochdale)', 'Paris', 'Berlim', 'B', 2),
    (v_test_id, 'Qual é o valor cooperativo que foca na equidade?', 'Igualdade', 'Solidariedade', 'Ajuda Mútua', 'Equidade', 'D', 3),
    (v_test_id, 'Quantos são os princípios do cooperativismo?', '5', '6', '7', '8', 'C', 4);
END $$;

-- 3. Inserir Cooperativas de Exemplo
INSERT INTO public.cooperatives (razao_social, nome_fantasia, cnpj, ramo_cooperativista, cidade, estado, responsavel_nome, responsavel_email)
VALUES 
('Cooperativa de Crédito Central', 'Sicredi Central', '12.345.678/0001-90', 'Crédito', 'Curitiba', 'PR', 'João Silva', 'joao@sicredi.com.br'),
('Cooperativa Agroindustrial de Teste', 'Coamo Exemplo', '98.765.432/0001-10', 'Agropecuário', 'Campo Mourão', 'PR', 'Maria Souza', 'maria@coamo.com.br');

-- 4. Inserir Oportunidades
DO $$
DECLARE
    v_coop_id uuid;
BEGIN
    SELECT id INTO v_coop_id FROM public.cooperatives WHERE nome_fantasia = 'Sicredi Central';

    INSERT INTO public.cooperative_opportunities (cooperative_id, titulo, tipo, vagas_disponiveis, status)
    VALUES ('Bolsa Formação em Gestão Financeira', 'Sicredi Central', 'Bolsa Formação', 2, 'Aberta');
END $$;

-- 5. Simular Scores para um Estudante Ativo (Pegando o primeiro da lista)
DO $$
DECLARE
    v_student_id uuid;
BEGIN
    SELECT id INTO v_student_id FROM public.students WHERE is_active = true LIMIT 1;
    
    IF v_student_id IS NOT NULL THEN
        -- Simulando resultados
        INSERT INTO public.student_scores (student_id, conhecimento_score, engajamento_score, colaboracao_score, perfil_cooperativista_score)
        VALUES (v_student_id, 85, 90, 75, 80)
        ON CONFLICT (student_id) DO UPDATE SET
            conhecimento_score = 85,
            engajamento_score = 90,
            colaboracao_score = 75,
            perfil_cooperativista_score = 80;
    END IF;
END $$;
