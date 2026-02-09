-- ============================================
-- INDICAÇÕES DE TESTES
-- ============================================

CREATE TABLE IF NOT EXISTS public.test_nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES public.test_cycles(id) ON DELETE CASCADE,
  nominated_by uuid NOT NULL REFERENCES public.gestors(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, cycle_id)
);

COMMENT ON TABLE public.test_nominations IS 'Indicações manuais de alunos para ciclos de formação (via ranking)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_nominations_student ON public.test_nominations(student_id);
CREATE INDEX IF NOT EXISTS idx_nominations_cycle ON public.test_nominations(cycle_id);

-- Habilitar RLS
ALTER TABLE public.test_nominations ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Gestores podem fazer tudo
CREATE POLICY "Gestors can manage all nominations"
  ON public.test_nominations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.gestors 
      WHERE user_id = auth.uid()
    )
  );

-- Alunos podem ler suas próprias indicações
CREATE POLICY "Students can read their own nominations"
  ON public.test_nominations
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students 
      WHERE user_id = auth.uid()
    )
  );
