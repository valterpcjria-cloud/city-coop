-- ========================================================
-- Otimização: Identificação de Role em Chamada Única
-- ========================================================

CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
    v_id UUID;
    v_name TEXT;
BEGIN
    -- Verifica se é gestor
    SELECT 'gestor', id, name INTO v_role, v_id, v_name FROM gestors WHERE user_id = p_user_id AND is_active = true LIMIT 1;
    IF v_role IS NOT NULL THEN
        RETURN jsonb_build_object('role', v_role, 'id', v_id, 'name', v_name);
    END IF;

    -- Verifica se é professor
    SELECT 'teacher', id, name INTO v_role, v_id, v_name FROM teachers WHERE user_id = p_user_id AND is_active = true LIMIT 1;
    IF v_role IS NOT NULL THEN
        RETURN jsonb_build_object('role', v_role, 'id', v_id, 'name', v_name);
    END IF;

    -- Verifica se é estudante
    SELECT 'student', id, name INTO v_role, v_id, v_name FROM students WHERE user_id = p_user_id AND is_active = true LIMIT 1;
    IF v_role IS NOT NULL THEN
        RETURN jsonb_build_object('role', v_role, 'id', v_id, 'name', v_name);
    END IF;

    RETURN NULL;
END;
$$;
