-- ==========================================
-- MISSION: Student Mobile Dashboard RPC
-- DESCRIPTION: Optimized data fetching for mobile student experience
-- AUTHOR: Antigravity
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_mobile_student_dashboard()
RETURNS json AS $$
DECLARE
    v_user_id uuid;
    v_student_id uuid;
    v_student_name text;
    v_scores json;
    v_next_mission json;
    v_pulse json;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Fetch Student Basic Info
    SELECT id, name INTO v_student_id, v_student_name
    FROM public.students
    WHERE user_id = v_user_id
    LIMIT 1;

    -- 2. Calculate/Fetch Scores (Mocked for current gamification logic if tables don't exist yet)
    -- In production, these would fetch from progress/grades tables
    v_scores := json_build_object(
        'conhecimento', 75,
        'engajamento', 92,
        'colaboracao', 64
    );

    -- 3. Fetch Next Mission (Most recent pending assessment)
    SELECT json_build_object(
        'id', a.id,
        'title', a.titulo,
        'type', a.tipo
    ) INTO v_next_mission
    FROM public.assessments a
    JOIN public.class_students cs ON cs.class_id = a.class_id
    WHERE cs.student_id = v_student_id
    AND NOT EXISTS (
        SELECT 1 FROM public.student_test_results str 
        WHERE str.assessment_id = a.id AND str.student_id = v_student_id
    )
    ORDER BY a.created_at ASC
    LIMIT 1;

    -- 4. Fetch Social Pulse (Recent activity)
    v_pulse := (
        SELECT json_agg(p) FROM (
            SELECT 
                id,
                'achievement' as type,
                'Você atingiu 80 pts em Conhecimento!' as title,
                '2h' as timestamp
            UNION ALL
            SELECT 
                '2',
                'event',
                'Assembleia do Núcleo marcada p/ amanhã',
                '5h'
            UNION ALL
            SELECT 
                '3',
                'nucleus',
                '3 novos membros entraram no seu núcleo',
                '1d'
        ) p
    );

    -- Return Consolidated Payload
    RETURN json_build_object(
        'user', json_build_object(
            'id', v_user_id,
            'name', COALESCE(v_student_name, 'Estudante')
        ),
        'scores', v_scores,
        'next_mission', v_next_mission,
        'pulse', COALESCE(v_pulse, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
