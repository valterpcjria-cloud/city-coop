-- ============================================
-- PEDAGOGICAL CONTENT: TEST CYCLES 1-4
-- ============================================

-- Ensure cycles exist or update them
INSERT INTO public.test_cycles (numero_ciclo, titulo, descricao) VALUES 
(1, 'História, Origem e Sentido do Cooperativismo', 'O contexto histórico e a evolução do modelo cooperativo.'),
(2, 'Princípios e Valores Cooperativistas', 'As diretrizes universais do cooperativismo.'),
(3, 'Ramos do Cooperativismo e Aplicações', 'Os diferentes setores de atuação e impacto local.'),
(4, 'Legislação Cooperativista e Governança', 'Bases jurídicas e estrutura de poder.')
ON CONFLICT (numero_ciclo) DO UPDATE SET 
    titulo = EXCLUDED.titulo, 
    descricao = EXCLUDED.descricao;

-- Helper to insert tests and questions
DO $$
DECLARE
    v_cycle_id uuid;
    v_test_id uuid;
BEGIN
    -- CICLO 1
    SELECT id INTO v_cycle_id FROM public.test_cycles WHERE numero_ciclo = 1;
    INSERT INTO public.cycle_tests (cycle_id, titulo, num_questoes, tempo_limite_minutos)
    VALUES (v_cycle_id, 'Teste Ciclo 1: História e Sentido', 4, 30)
    RETURNING id INTO v_test_id;

    INSERT INTO public.test_questions (test_id, questao_texto, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, ordem) VALUES
    (v_test_id, 'O cooperativismo surge historicamente como resposta direta a qual contexto social?', 'Crescimento do comércio internacional', 'Avanços tecnológicos da Revolução Digital', 'Exploração do trabalho e desigualdade gerada pela Revolução Industrial', 'Expansão do sistema bancário', 'C', 1),
    (v_test_id, 'O que diferencia o cooperativismo, desde sua origem, de outros modelos econômicos?', 'A busca prioritária pelo lucro individual', 'A ausência de regras e organização formal', 'A centralidade das pessoas sobre o capital', 'A dependência do Estado para funcionar', 'C', 2),
    (v_test_id, 'O exemplo de Rochdale é considerado marco histórico porque:', 'Criou a primeira empresa privada moderna', 'Estabeleceu princípios que orientam cooperativas até hoje', 'Foi a maior cooperativa do mundo', 'Eliminou o uso de dinheiro nas trocas', 'B', 3),
    (v_test_id, 'Ao estudar a história do cooperativismo, o aluno deve compreender principalmente que:', 'O cooperativismo é um modelo alternativo temporário', 'Ele surgiu apenas para pequenos grupos', 'Ele responde a problemas sociais estruturais', 'Não se adapta ao mundo atual', 'C', 4);

    -- CICLO 2
    SELECT id INTO v_cycle_id FROM public.test_cycles WHERE numero_ciclo = 2;
    INSERT INTO public.cycle_tests (cycle_id, titulo, num_questoes, tempo_limite_minutos)
    VALUES (v_cycle_id, 'Teste Ciclo 2: Princípios e Valores', 4, 30)
    RETURNING id INTO v_test_id;

    INSERT INTO public.test_questions (test_id, questao_texto, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, ordem) VALUES
    (v_test_id, 'Os princípios cooperativistas existem principalmente para:', 'Padronizar cooperativas em todos os países', 'Garantir controle estatal', 'Orientar decisões e comportamentos coletivos', 'Substituir leis nacionais', 'C', 1),
    (v_test_id, 'Qual situação representa corretamente a aplicação do princípio da gestão democrática?', 'Decisão tomada apenas pelo gestor mais experiente', 'Votação em que cada cooperado tem direito a um voto', 'Decisão baseada no maior investimento financeiro', 'Escolha feita por maioria externa', 'B', 2),
    (v_test_id, 'O valor da “ajuda mútua” se manifesta quando:', 'Cada membro age individualmente', 'O grupo depende exclusivamente de recursos externos', 'Os cooperados se apoiam para alcançar objetivos comuns', 'Há competição interna', 'C', 3),
    (v_test_id, 'A principal diferença entre uma cooperativa e uma empresa tradicional está:', 'No tamanho da organização', 'Na forma jurídica apenas', 'Na lógica de poder e finalidade', 'No tipo de produto', 'C', 4);

    -- CICLO 3
    SELECT id INTO v_cycle_id FROM public.test_cycles WHERE numero_ciclo = 3;
    INSERT INTO public.cycle_tests (cycle_id, titulo, num_questoes, tempo_limite_minutos)
    VALUES (v_cycle_id, 'Teste Ciclo 3: Ramos e Aplicações', 4, 30)
    RETURNING id INTO v_test_id;

    INSERT INTO public.test_questions (test_id, questao_texto, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, ordem) VALUES
    (v_test_id, 'O estudo dos ramos do cooperativismo é importante porque:', 'Limita a atuação das cooperativas', 'Mostra onde o cooperativismo gera impacto real', 'Substitui o estudo da história', 'Elimina a necessidade de gestão', 'B', 1),
    (v_test_id, 'A cooperativa de trabalho se caracteriza principalmente por:', 'Empregar trabalhadores sem participação', 'Priorizar investidores externos', 'Organizar trabalhadores como donos do próprio trabalho', 'Atuar apenas no setor agrícola', 'C', 2),
    (v_test_id, 'Ao escolher o modelo de Coop-Eventos, a escola está:', 'Criando uma empresa comercial', 'Simulando uma prática cooperativista real', 'Apenas organizando um evento social', 'Fugindo do conteúdo pedagógico', 'B', 3),
    (v_test_id, 'O cooperativismo contribui para o desenvolvimento local porque:', 'Centraliza recursos fora da comunidade', 'Reduz a participação social', 'Mantém riqueza e decisões no território', 'Substitui políticas públicas', 'C', 4);

    -- CICLO 4 (Incompleto no prompt, mas adicionando a estrutura e a primeira questão)
    SELECT id INTO v_cycle_id FROM public.test_cycles WHERE numero_ciclo = 4;
    INSERT INTO public.cycle_tests (cycle_id, titulo, num_questoes, tempo_limite_minutos)
    VALUES (v_cycle_id, 'Teste Ciclo 4: Legislação e Governança', 1, 30)
    RETURNING id INTO v_test_id;

    INSERT INTO public.test_questions (test_id, questao_texto, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, ordem) VALUES
    (v_test_id, 'Segundo a legislação, uma cooperativa é:', 'Uma empresa comum com benefícios fiscais', 'Uma associação de pessoas com objetivos econômicos', 'Uma fundação sem fins lucrativos', 'Um órgão do governo', 'B', 1);

END $$;
