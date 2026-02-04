-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABELA: schools
-- ============================================
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: teachers
-- ============================================
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  certifications JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: students
-- ============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  grade_level TEXT NOT NULL CHECK (grade_level IN ('9EF', '1EM', '2EM', '3EM')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: classes (turmas)
-- ============================================
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('trimestral', 'semestral')),
  grade_level TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: class_students (relação N:N)
-- ============================================
CREATE TABLE class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(class_id, student_id)
);

-- ============================================
-- TABELA: nuclei (6 tipos fixos)
-- ============================================
CREATE TABLE nuclei (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (name IN (
    'Entretenimento', 
    'Logística', 
    'Operacional', 
    'Financeiro', 
    'Comunicação', 
    'Parcerias'
  )),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, name)
);

-- ============================================
-- TABELA: nucleus_members (relação N:N)
-- ============================================
CREATE TABLE nucleus_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nucleus_id UUID REFERENCES nuclei(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('coordenador', 'membro')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- ============================================
-- TABELA: assemblies
-- ============================================
CREATE TABLE assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  agenda JSONB NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  minutes TEXT,
  decisions JSONB DEFAULT '[]',
  attendance JSONB DEFAULT '[]',
  created_by UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: event_plans
-- ============================================
CREATE TABLE event_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  budget JSONB NOT NULL,
  timeline JSONB NOT NULL,
  risk_analysis JSONB,
  nuclei_plans JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'executed')),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES teachers(id),
  ai_evaluation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: assessments (avaliações/testes)
-- ============================================
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'cooperativismo',
    'participacao',
    'organizacao_nucleos',
    'planejamento_evento',
    'gestao_financeira'
  )),
  questions JSONB NOT NULL,
  created_by UUID REFERENCES teachers(id),
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: assessment_responses
-- ============================================
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score NUMERIC(5,2),
  ai_feedback JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, student_id)
);

-- ============================================
-- TABELA: maturity_indicators (5 dimensões)
-- ============================================
CREATE TABLE maturity_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  
  cooperativism_understanding NUMERIC(5,2) DEFAULT 0 CHECK (cooperativism_understanding BETWEEN 0 AND 100),
  democratic_functioning NUMERIC(5,2) DEFAULT 0 CHECK (democratic_functioning BETWEEN 0 AND 100),
  nuclei_organization NUMERIC(5,2) DEFAULT 0 CHECK (nuclei_organization BETWEEN 0 AND 100),
  financial_management NUMERIC(5,2) DEFAULT 0 CHECK (financial_management BETWEEN 0 AND 100),
  event_planning NUMERIC(5,2) DEFAULT 0 CHECK (event_planning BETWEEN 0 AND 100),
  
  overall_score NUMERIC(5,2) GENERATED ALWAYS AS (
    (cooperativism_understanding + democratic_functioning + 
     nuclei_organization + financial_management + event_planning) / 5
  ) STORED,
  
  approved_for_event BOOLEAN DEFAULT FALSE,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(class_id, student_id)
);

-- ============================================
-- TABELA: ai_conversations
-- ============================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT CHECK (user_type IN ('teacher', 'student')),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: ai_researches (histórico)
-- ============================================
CREATE TABLE ai_researches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  category TEXT,
  results JSONB NOT NULL,
  sources JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: knowledge_base (para RAG)
-- ============================================
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'estrutura_programa',
    'papel_professor',
    'organizacao_nucleos',
    'assembleias',
    'planejamento_evento',
    'conducao_pedagogica',
    'cooperativismo_conceitos',
    'avaliacao'
  )),
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca vetorial
CREATE INDEX knowledge_base_embedding_idx ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE nuclei ENABLE ROW LEVEL SECURITY;
ALTER TABLE nucleus_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturity_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_researches ENABLE ROW LEVEL SECURITY;

-- Policies de Leitura Básica
CREATE POLICY "authenticated_view_schools" ON schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "teachers_view_self" ON teachers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "students_view_self" ON students FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Policies para PROFESSORES

-- Professores podem ver/gerenciar suas próprias turmas
CREATE POLICY "teachers_own_classes" ON classes
  FOR ALL
  TO authenticated
  USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  );

-- Professores podem ver alunos de suas turmas
CREATE POLICY "teachers_class_students" ON students
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT student_id FROM class_students WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id IN (
          SELECT id FROM teachers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Professores podem ver avaliações de suas turmas
CREATE POLICY "teachers_class_assessments" ON assessment_responses
  FOR SELECT
  TO authenticated
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id IN (
          SELECT id FROM teachers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Professores podem gerenciar avaliações, pautas, planos e núcleos de suas turmas
CREATE POLICY "teachers_manage_class_data" ON assessments
  FOR ALL TO authenticated USING (class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())));

CREATE POLICY "teachers_manage_class_nuclei" ON nuclei
  FOR ALL TO authenticated USING (class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())));

CREATE POLICY "teachers_manage_class_assemblies" ON assemblies
  FOR ALL TO authenticated USING (class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())));

CREATE POLICY "teachers_manage_class_event_plans" ON event_plans
  FOR ALL TO authenticated USING (class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())));

-- Policies para ESTUDANTES

-- Estudantes podem ver turmas em que estão matriculados
CREATE POLICY "students_enrolled_classes" ON classes
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT class_id FROM class_students WHERE student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
      )
    )
  );

-- Estudantes podem ver/criar suas próprias respostas de avaliação
CREATE POLICY "students_own_assessment_responses" ON assessment_responses
  FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- Estudantes podem ver seus próprios indicadores
CREATE POLICY "students_own_indicators" ON maturity_indicators
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- Estudantes podem ver dados de suas turmas
CREATE POLICY "students_view_class_assessments" ON assessments
  FOR SELECT TO authenticated USING (class_id IN (SELECT class_id FROM class_students WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())));

CREATE POLICY "students_view_class_nuclei" ON nuclei
  FOR SELECT TO authenticated USING (class_id IN (SELECT class_id FROM class_students WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())));

CREATE POLICY "students_view_class_assemblies" ON assemblies
  FOR SELECT TO authenticated USING (class_id IN (SELECT class_id FROM class_students WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())));

CREATE POLICY "students_view_class_event_plans" ON event_plans
  FOR SELECT TO authenticated USING (class_id IN (SELECT class_id FROM class_students WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())));

-- Policies para CONVERSAS IA

CREATE POLICY "users_own_ai_conversations" ON ai_conversations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_own_ai_researches" ON ai_researches
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assemblies_updated_at BEFORE UPDATE ON assemblies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_plans_updated_at BEFORE UPDATE ON event_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maturity_indicators_updated_at BEFORE UPDATE ON maturity_indicators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_school_id ON teachers(school_id);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);
CREATE INDEX idx_nuclei_class_id ON nuclei(class_id);
CREATE INDEX idx_nucleus_members_nucleus_id ON nucleus_members(nucleus_id);
CREATE INDEX idx_nucleus_members_student_id ON nucleus_members(student_id);
CREATE INDEX idx_assemblies_class_id ON assemblies(class_id);
CREATE INDEX idx_event_plans_class_id ON event_plans(class_id);
CREATE INDEX idx_event_plans_status ON event_plans(status);
CREATE INDEX idx_assessments_class_id ON assessments(class_id);
CREATE INDEX idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX idx_assessment_responses_student_id ON assessment_responses(student_id);
CREATE INDEX idx_maturity_indicators_class_id ON maturity_indicators(class_id);
CREATE INDEX idx_maturity_indicators_student_id ON maturity_indicators(student_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_researches_user_id ON ai_researches(user_id);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
