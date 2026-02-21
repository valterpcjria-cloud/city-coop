-- Optimizações de Performance: Agregações via RPC
-- City Coop Platform

-- 1. Obter contagens globais e totais agrupados em uma única chamada
CREATE OR REPLACE FUNCTION get_platform_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_schools', (SELECT count(*) FROM schools),
    'total_teachers', (SELECT count(*) FROM teachers),
    'total_students', (SELECT count(*) FROM students),
    'total_classes', (SELECT count(*) FROM classes),
    'active_classes', (SELECT count(*) FROM classes WHERE status = 'active'),
    'completed_classes', (SELECT count(*) FROM classes WHERE status = 'completed'),
    'approved_events', (SELECT count(*) FROM event_plans WHERE status = 'approved'),
    'pending_events', (SELECT count(*) FROM event_plans WHERE status IN ('submitted', 'draft')),
    'rejected_events', (SELECT count(*) FROM event_plans WHERE status = 'rejected')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Alunos por ano/nível (Grade Level)
CREATE OR REPLACE FUNCTION get_students_by_grade()
RETURNS TABLE (name TEXT, value BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT grade_level as name, count(*) as value
  FROM students
  GROUP BY grade_level
  ORDER BY grade_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Turmas por modalidade
CREATE OR REPLACE FUNCTION get_classes_by_modality()
RETURNS TABLE (name TEXT, value BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT modality as name, count(*) as value
  FROM classes
  GROUP BY modality
  ORDER BY value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Eventos por Status (Formatado para o Gráfico)
CREATE OR REPLACE FUNCTION get_events_by_status_formatted()
RETURNS TABLE (name TEXT, value BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN status = 'approved' THEN 'Aprovados'
      WHEN status = 'rejected' THEN 'Rejeitados'
      WHEN status = 'executed' THEN 'Executados'
      ELSE 'Pendentes'
    END as name,
    count(*) as value
  FROM event_plans
  GROUP BY name
  ORDER BY value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
