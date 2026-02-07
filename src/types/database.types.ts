// ===========================================
// Database Types - Auto-generated from Supabase
// ===========================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type GradeLevel = '9EF' | '1EM' | '2EM' | '3EM'
export type ClassModality = 'trimestral' | 'semestral'
export type ClassStatus = 'active' | 'completed' | 'cancelled'
export type NucleusName = 'Entretenimento' | 'Logística' | 'Operacional' | 'Financeiro' | 'Comunicação' | 'Parcerias'
export type NucleusRole = 'coordenador' | 'membro'
export type EventPlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'executed'
export type AssessmentType =
    | 'cooperativismo'
    | 'participacao'
    | 'organizacao_nucleos'
    | 'planejamento_evento'
    | 'gestao_financeira'
export type KnowledgeCategory =
    | 'estrutura_programa'
    | 'papel_professor'
    | 'organizacao_nucleos'
    | 'assembleias'
    | 'planejamento_evento'
    | 'conducao_pedagogica'
    | 'cooperativismo_conceitos'
    | 'avaliacao'
export type UserType = 'teacher' | 'student' | 'manager'

// Voting System Types
export type ElectionStatus = 'configuracao' | 'inscricoes' | 'campanha' | 'votacao' | 'encerrada'
export type ConselhoType = 'administracao' | 'fiscal' | 'etica'
export type ResultadoType = 'eleito_efetivo' | 'eleito_suplente' | 'nao_eleito'
export type DocumentoTipo = 'ata_eleitoral' | 'resultado'

export interface Database {
    public: {
        Tables: {
            schools: {
                Row: {
                    id: string
                    name: string
                    code: string
                    city: string | null
                    state: string | null
                    country: string
                    settings: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    city?: string | null
                    state?: string | null
                    country?: string
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string
                    city?: string | null
                    state?: string | null
                    country?: string
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            teachers: {
                Row: {
                    id: string
                    user_id: string | null
                    school_id: string | null
                    name: string
                    email: string
                    phone: string | null
                    certifications: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    school_id?: string | null
                    name: string
                    email: string
                    phone?: string | null
                    certifications?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    school_id?: string | null
                    name?: string
                    email?: string
                    phone?: string | null
                    certifications?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            students: {
                Row: {
                    id: string
                    user_id: string | null
                    school_id: string | null
                    name: string
                    email: string | null
                    grade_level: GradeLevel
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    school_id?: string | null
                    name: string
                    email?: string | null
                    grade_level: GradeLevel
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    school_id?: string | null
                    name?: string
                    email?: string | null
                    grade_level?: GradeLevel
                    created_at?: string
                    updated_at?: string
                }
            }
            classes: {
                Row: {
                    id: string
                    school_id: string | null
                    teacher_id: string | null
                    code: string
                    name: string
                    modality: ClassModality
                    grade_level: string
                    start_date: string
                    end_date: string
                    status: ClassStatus
                    settings: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    school_id?: string | null
                    teacher_id?: string | null
                    code: string
                    name: string
                    modality: ClassModality
                    grade_level: string
                    start_date: string
                    end_date: string
                    status?: ClassStatus
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    school_id?: string | null
                    teacher_id?: string | null
                    code?: string
                    name?: string
                    modality?: ClassModality
                    grade_level?: string
                    start_date?: string
                    end_date?: string
                    status?: ClassStatus
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            class_students: {
                Row: {
                    id: string
                    class_id: string | null
                    student_id: string | null
                    joined_at: string
                    left_at: string | null
                }
                Insert: {
                    id?: string
                    class_id?: string | null
                    student_id?: string | null
                    joined_at?: string
                    left_at?: string | null
                }
                Update: {
                    id?: string
                    class_id?: string | null
                    student_id?: string | null
                    joined_at?: string
                    left_at?: string | null
                }
            }
            nuclei: {
                Row: {
                    id: string
                    class_id: string | null
                    name: NucleusName
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    class_id?: string | null
                    name: NucleusName
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string | null
                    name?: NucleusName
                    description?: string | null
                    created_at?: string
                }
            }
            nucleus_members: {
                Row: {
                    id: string
                    nucleus_id: string | null
                    student_id: string | null
                    role: NucleusRole | null
                    joined_at: string
                    left_at: string | null
                }
                Insert: {
                    id?: string
                    nucleus_id?: string | null
                    student_id?: string | null
                    role?: NucleusRole | null
                    joined_at?: string
                    left_at?: string | null
                }
                Update: {
                    id?: string
                    nucleus_id?: string | null
                    student_id?: string | null
                    role?: NucleusRole | null
                    joined_at?: string
                    left_at?: string | null
                }
            }
            assemblies: {
                Row: {
                    id: string
                    class_id: string | null
                    title: string
                    agenda: Json
                    date: string
                    minutes: string | null
                    decisions: Json
                    attendance: Json
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    class_id?: string | null
                    title: string
                    agenda: Json
                    date: string
                    minutes?: string | null
                    decisions?: Json
                    attendance?: Json
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string | null
                    title?: string
                    agenda?: Json
                    date?: string
                    minutes?: string | null
                    decisions?: Json
                    attendance?: Json
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            event_plans: {
                Row: {
                    id: string
                    class_id: string | null
                    title: string
                    description: string | null
                    event_date: string | null
                    budget: Json
                    timeline: Json
                    risk_analysis: Json | null
                    nuclei_plans: Json | null
                    status: EventPlanStatus
                    submitted_at: string | null
                    reviewed_at: string | null
                    reviewed_by: string | null
                    ai_evaluation: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    class_id?: string | null
                    title: string
                    description?: string | null
                    event_date?: string | null
                    budget: Json
                    timeline: Json
                    risk_analysis?: Json | null
                    nuclei_plans?: Json | null
                    status?: EventPlanStatus
                    submitted_at?: string | null
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    ai_evaluation?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string | null
                    title?: string
                    description?: string | null
                    event_date?: string | null
                    budget?: Json
                    timeline?: Json
                    risk_analysis?: Json | null
                    nuclei_plans?: Json | null
                    status?: EventPlanStatus
                    submitted_at?: string | null
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    ai_evaluation?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            assessments: {
                Row: {
                    id: string
                    class_id: string | null
                    title: string
                    type: AssessmentType
                    questions: Json
                    created_by: string | null
                    available_from: string | null
                    available_until: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    class_id?: string | null
                    title: string
                    type: AssessmentType
                    questions: Json
                    created_by?: string | null
                    available_from?: string | null
                    available_until?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string | null
                    title?: string
                    type?: AssessmentType
                    questions?: Json
                    created_by?: string | null
                    available_from?: string | null
                    available_until?: string | null
                    created_at?: string
                }
            }
            assessment_responses: {
                Row: {
                    id: string
                    assessment_id: string | null
                    student_id: string | null
                    answers: Json
                    score: number | null
                    ai_feedback: Json | null
                    completed_at: string
                }
                Insert: {
                    id?: string
                    assessment_id?: string | null
                    student_id?: string | null
                    answers: Json
                    score?: number | null
                    ai_feedback?: Json | null
                    completed_at?: string
                }
                Update: {
                    id?: string
                    assessment_id?: string | null
                    student_id?: string | null
                    answers?: Json
                    score?: number | null
                    ai_feedback?: Json | null
                    completed_at?: string
                }
            }
            maturity_indicators: {
                Row: {
                    id: string
                    class_id: string | null
                    student_id: string | null
                    cooperativism_understanding: number
                    democratic_functioning: number
                    nuclei_organization: number
                    financial_management: number
                    event_planning: number
                    overall_score: number
                    approved_for_event: boolean
                    calculated_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    class_id?: string | null
                    student_id?: string | null
                    cooperativism_understanding?: number
                    democratic_functioning?: number
                    nuclei_organization?: number
                    financial_management?: number
                    event_planning?: number
                    approved_for_event?: boolean
                    calculated_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string | null
                    student_id?: string | null
                    cooperativism_understanding?: number
                    democratic_functioning?: number
                    nuclei_organization?: number
                    financial_management?: number
                    event_planning?: number
                    approved_for_event?: boolean
                    calculated_at?: string
                    updated_at?: string
                }
            }
            ai_conversations: {
                Row: {
                    id: string
                    user_id: string | null
                    user_type: UserType | null
                    class_id: string | null
                    title: string | null
                    messages: Json
                    context: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    user_type?: UserType | null
                    class_id?: string | null
                    title?: string | null
                    messages?: Json
                    context?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    user_type?: UserType | null
                    class_id?: string | null
                    title?: string | null
                    messages?: Json
                    context?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            ai_researches: {
                Row: {
                    id: string
                    user_id: string | null
                    query: string
                    category: string | null
                    results: Json
                    sources: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    query: string
                    category?: string | null
                    results: Json
                    sources: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    query?: string
                    category?: string | null
                    results?: Json
                    sources?: Json
                    created_at?: string
                }
            }
            knowledge_base: {
                Row: {
                    id: string
                    content: string
                    category: KnowledgeCategory
                    metadata: Json
                    embedding: number[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    content: string
                    category: KnowledgeCategory
                    metadata?: Json
                    embedding?: number[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    content?: string
                    category?: KnowledgeCategory
                    metadata?: Json
                    embedding?: number[] | null
                    created_at?: string
                }
            }
            elections: {
                Row: {
                    id: string
                    class_id: string | null
                    status: ElectionStatus
                    data_inicio_inscricoes: string | null
                    data_fim_inscricoes: string | null
                    data_inicio_campanha: string | null
                    data_fim_campanha: string | null
                    data_inicio_votacao: string | null
                    data_fim_votacao: string | null
                    vagas_administracao: number
                    vagas_fiscal_efetivos: number
                    vagas_fiscal_suplentes: number
                    vagas_etica: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    class_id?: string | null
                    status?: ElectionStatus
                    data_inicio_inscricoes?: string | null
                    data_fim_inscricoes?: string | null
                    data_inicio_campanha?: string | null
                    data_fim_campanha?: string | null
                    data_inicio_votacao?: string | null
                    data_fim_votacao?: string | null
                    vagas_administracao?: number
                    vagas_fiscal_efetivos?: number
                    vagas_fiscal_suplentes?: number
                    vagas_etica?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string | null
                    status?: ElectionStatus
                    data_inicio_inscricoes?: string | null
                    data_fim_inscricoes?: string | null
                    data_inicio_campanha?: string | null
                    data_fim_campanha?: string | null
                    data_inicio_votacao?: string | null
                    data_fim_votacao?: string | null
                    vagas_administracao?: number
                    vagas_fiscal_efetivos?: number
                    vagas_fiscal_suplentes?: number
                    vagas_etica?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            candidates: {
                Row: {
                    id: string
                    election_id: string | null
                    student_id: string | null
                    conselho: ConselhoType
                    proposta: string
                    aprovado: boolean
                    total_votos: number
                    resultado: ResultadoType | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    election_id?: string | null
                    student_id?: string | null
                    conselho: ConselhoType
                    proposta: string
                    aprovado?: boolean
                    total_votos?: number
                    resultado?: ResultadoType | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    election_id?: string | null
                    student_id?: string | null
                    conselho?: ConselhoType
                    proposta?: string
                    aprovado?: boolean
                    total_votos?: number
                    resultado?: ResultadoType | null
                    created_at?: string
                }
            }
            vote_controls: {
                Row: {
                    id: string
                    election_id: string | null
                    student_id: string | null
                    votou_administracao: boolean
                    votou_fiscal: boolean
                    votou_etica: boolean
                    timestamp_voto: string
                }
                Insert: {
                    id?: string
                    election_id?: string | null
                    student_id?: string | null
                    votou_administracao?: boolean
                    votou_fiscal?: boolean
                    votou_etica?: boolean
                    timestamp_voto?: string
                }
                Update: {
                    id?: string
                    election_id?: string | null
                    student_id?: string | null
                    votou_administracao?: boolean
                    votou_fiscal?: boolean
                    votou_etica?: boolean
                    timestamp_voto?: string
                }
            }
            votes: {
                Row: {
                    id: string
                    candidate_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    candidate_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    candidate_id?: string | null
                    created_at?: string
                }
            }
            election_documents: {
                Row: {
                    id: string
                    election_id: string | null
                    tipo: DocumentoTipo | null
                    conteudo: string | null
                    url_pdf: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    election_id?: string | null
                    tipo?: DocumentoTipo | null
                    conteudo?: string | null
                    url_pdf?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    election_id?: string | null
                    tipo?: DocumentoTipo | null
                    conteudo?: string | null
                    url_pdf?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Convenience types
export type School = Database['public']['Tables']['schools']['Row']
export type Teacher = Database['public']['Tables']['teachers']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type ClassStudent = Database['public']['Tables']['class_students']['Row']
export type Nucleus = Database['public']['Tables']['nuclei']['Row']
export type NucleusMember = Database['public']['Tables']['nucleus_members']['Row']
export type Assembly = Database['public']['Tables']['assemblies']['Row']
export type EventPlan = Database['public']['Tables']['event_plans']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type AssessmentResponse = Database['public']['Tables']['assessment_responses']['Row']
export type MaturityIndicators = Database['public']['Tables']['maturity_indicators']['Row']
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row']
export type AIResearch = Database['public']['Tables']['ai_researches']['Row']
export type KnowledgeBase = Database['public']['Tables']['knowledge_base']['Row']

// Voting System Convenience Types
export type Election = Database['public']['Tables']['elections']['Row']
export type Candidate = Database['public']['Tables']['candidates']['Row']
export type VoteControl = Database['public']['Tables']['vote_controls']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type ElectionDocument = Database['public']['Tables']['election_documents']['Row']
