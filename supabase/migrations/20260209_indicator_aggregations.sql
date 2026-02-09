-- ========================================================
-- Otimização: Cálculos de Indicadores no Banco de Dados
-- ========================================================

-- Função para calcular e atualizar indicadores de um estudante
CREATE OR REPLACE FUNCTION calculate_maturity_indicators(
    p_student_id UUID,
    p_class_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_results JSONB;
    v_updates RECORD;
BEGIN
    -- Calcula as médias por tipo de avaliação
    WITH type_averages AS (
        SELECT 
            a.type,
            AVG(r.score) as avg_score
        FROM assessment_responses r
        JOIN assessments a ON r.assessment_id = a.id
        WHERE r.student_id = p_student_id
          AND a.class_id = p_class_id
          AND r.score IS NOT NULL
        GROUP BY a.type
    ),
    mapped_averages AS (
        SELECT
            MAX(CASE WHEN type = 'cooperativismo' THEN avg_score END) as avg_coop,
            MAX(CASE WHEN type = 'participacao' THEN avg_score END) as avg_part,
            MAX(CASE WHEN type = 'organizacao_nucleos' THEN avg_score END) as avg_nucl,
            MAX(CASE WHEN type = 'gestao_financeira' THEN avg_score END) as avg_fina,
            MAX(CASE WHEN type = 'planejamento_evento' THEN avg_score END) as avg_plan
        FROM type_averages
    )
    SELECT * INTO v_updates FROM mapped_averages;

    -- Se não houver dados, retorna null
    IF v_updates.avg_coop IS NULL AND v_updates.avg_part IS NULL AND v_updates.avg_nucl IS NULL 
       AND v_updates.avg_fina IS NULL AND v_updates.avg_plan IS NULL THEN
        RETURN NULL;
    END IF;

    -- Upsert na tabela maturity_indicators
    INSERT INTO maturity_indicators (
        class_id,
        student_id,
        cooperativism_understanding,
        democratic_functioning,
        nuclei_organization,
        financial_management,
        event_planning,
        updated_at,
        calculated_at
    )
    VALUES (
        p_class_id,
        p_student_id,
        COALESCE(v_updates.avg_coop, 0),
        COALESCE(v_updates.avg_part, 0),
        COALESCE(v_updates.avg_nucl, 0),
        COALESCE(v_updates.avg_fina, 0),
        COALESCE(v_updates.avg_plan, 0),
        NOW(),
        NOW()
    )
    ON CONFLICT (class_id, student_id) 
    DO UPDATE SET
        cooperativism_understanding = EXCLUDED.cooperativism_understanding,
        democratic_functioning = EXCLUDED.democratic_functioning,
        nuclei_organization = EXCLUDED.nuclei_organization,
        financial_management = EXCLUDED.financial_management,
        event_planning = EXCLUDED.event_planning,
        updated_at = NOW(),
        calculated_at = NOW()
    RETURNING jsonb_build_object(
        'cooperativism_understanding', cooperativism_understanding,
        'democratic_functioning', democratic_functioning,
        'nuclei_organization', nuclei_organization,
        'financial_management', financial_management,
        'event_planning', event_planning
    ) INTO v_results;

    RETURN v_results;
END;
$$;

-- View para médias da turma (evita cálculos repetitivos no Node.js)
CREATE OR REPLACE VIEW v_class_average_indicators AS
SELECT 
    class_id,
    AVG(cooperativism_understanding) as cooperativismo,
    AVG(democratic_functioning) as participacao,
    AVG(nuclei_organization) as organizacao,
    AVG(financial_management) as financeiro,
    AVG(event_planning) as planejamento,
    COUNT(*) as student_count
FROM maturity_indicators
GROUP BY class_id;
