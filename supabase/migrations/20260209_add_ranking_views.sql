-- ============================================
-- VIEWS PARA RANKING DE CANDIDATOS
-- ============================================

CREATE OR REPLACE VIEW public.vw_candidatos_nucleo_escolar AS
SELECT 
  id as student_id,
  name as student_name,
  grade_level,
  school_id,
  school_name,
  score_total,
  CASE 
    WHEN score_total >= 80 THEN 'Apto'
    WHEN score_total >= 70 THEN 'Em Observação'
    ELSE 'Iniciante'
  END as status_candidatura
FROM public.vw_students_complete
WHERE score_total >= 60;

CREATE OR REPLACE VIEW public.vw_candidatos_nucleo_intercoop AS
SELECT 
  id as student_id,
  name as student_name,
  grade_level,
  school_id,
  school_name,
  score_total,
  CASE 
    WHEN score_total >= 90 THEN 'Apto'
    WHEN score_total >= 80 THEN 'Em Observação'
    ELSE 'Iniciante'
  END as status_candidatura
FROM public.vw_students_complete
WHERE score_total >= 70;
