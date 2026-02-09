-- ============================================
-- SEED DATA: COOP-EVENTOS
-- ============================================

DO $$
DECLARE
    v_nucleo_id uuid;
BEGIN
    -- Pegar o primeiro núcleo gestor escolar disponível
    SELECT id INTO v_nucleo_id FROM public.nucleo_gestor_escolar LIMIT 1;

    IF v_nucleo_id IS NOT NULL THEN
        INSERT INTO public.coop_eventos (nucleo_escolar_id, titulo, descricao, tipo_evento, data_planejada, local, status)
        VALUES 
        (v_nucleo_id, 'Feira de Trocas Sustentáveis', 'Evento para promover a economia circular na escola.', 'Social', CURRENT_DATE + INTERVAL '15 days', 'Pátio Central', 'Planejamento'),
        (v_nucleo_id, 'Gincana da Cooperação', 'Atividades esportivas focadas em trabalho em equipe.', 'Esportivo', CURRENT_DATE - INTERVAL '5 days', 'Ginásio Poliesportivo', 'Concluído'),
        (v_nucleo_id, 'Workshop de Educação Financeira', 'Palestra com gestores da cooperativa parceira.', 'Educacional', CURRENT_DATE + INTERVAL '30 days', 'Auditório', 'Aprovado');
    END IF;
END $$;
