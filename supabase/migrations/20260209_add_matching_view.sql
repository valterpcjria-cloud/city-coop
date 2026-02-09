-- ============================================
-- MATCHING ENGINE VIEW
-- ============================================

CREATE OR REPLACE VIEW public.vw_matching_opportunities AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  s.grade_level,
  sc.score_total,
  c.id as coop_id,
  c.nome_fantasia as coop_name,
  o.id as opportunity_id,
  o.titulo as opportunity_title,
  o.tipo as tipo_oportunidade,
  -- Cálculo de distância aproximada (Haversine se tiver lat/long, ou simples aqui)
  -- Nota: Isso requer as colunas latitude/longitude nas tabelas students e cooperatives
  -- Por enquanto usamos uma lógica simples ou placeholder se as colunas não existirem em students
  0.0 as distancia_km 
FROM public.students s
JOIN public.student_scores sc ON sc.student_id = s.id
CROSS JOIN public.cooperatives c
JOIN public.cooperative_opportunities o ON o.cooperative_id = c.id
WHERE s.is_active = true 
  AND c.ativo = true 
  AND o.status = 'Aberta'
  AND sc.score_total >= 70; -- Somente quem tem score mínimo
