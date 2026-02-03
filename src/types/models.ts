// ===========================================
// Model Types for City Coop Platform
// ===========================================

import {
    Teacher,
    Student,
    Class,
    Nucleus,
    Assessment,
    MaturityIndicators,
    NucleusName,
    AssessmentType
} from './database.types'

// Extended types with relations
export interface TeacherWithClasses extends Teacher {
    classes: Class[]
}

export interface StudentWithEnrollments extends Student {
    enrollments: {
        class: Class
        nucleus?: Nucleus
        role?: 'coordenador' | 'membro'
    }[]
}

export interface ClassWithDetails extends Class {
    teacher?: Teacher
    students: Student[]
    nuclei: NucleusWithMembers[]
    assessments: Assessment[]
}

export interface NucleusWithMembers extends Nucleus {
    members: {
        student: Student
        role: 'coordenador' | 'membro'
    }[]
}

// Assessment Question Types
export interface MultipleChoiceQuestion {
    id: string
    type: 'multiple_choice'
    text: string
    options: {
        id: string
        text: string
        isCorrect?: boolean
    }[]
    points: number
}

export interface OpenEndedQuestion {
    id: string
    type: 'open_ended'
    text: string
    rubric?: string
    points: number
}

export interface ScaleQuestion {
    id: string
    type: 'scale'
    text: string
    minValue: number
    maxValue: number
    minLabel: string
    maxLabel: string
    points: number
}

export interface CaseStudyQuestion {
    id: string
    type: 'case_study'
    scenario: string
    questions: {
        id: string
        text: string
        type: 'multiple_choice' | 'open_ended'
        options?: { id: string; text: string; isCorrect?: boolean }[]
    }[]
    points: number
}

export type AssessmentQuestion =
    | MultipleChoiceQuestion
    | OpenEndedQuestion
    | ScaleQuestion
    | CaseStudyQuestion

export interface AssessmentWithQuestions extends Omit<Assessment, 'questions'> {
    questions: AssessmentQuestion[]
}

// Maturity Indicators Calculation
export interface IndicatorInputs {
    // Cooperativism Understanding
    testResults: number // 0-100
    practicalApplication: number // 0-100
    assemblyParticipation: number // 0-100
    explainAbility: number // 0-100

    // Democratic Functioning
    assemblyAttendance: number // 0-100
    participationDiversity: number // 0-100
    decisionQuality: number // 0-100
    voteRespect: number // 0-100

    // Nuclei Organization
    roleClarity: number // 0-100
    deliveryCompliance: number // 0-100
    interNucleiComm: number // 0-100
    documentation: number // 0-100
    autonomousProblemSolving: number // 0-100

    // Financial Management
    budgetRealism: number // 0-100
    expenseControl: number // 0-100
    financialTransparency: number // 0-100
    adjustmentCapacity: number // 0-100
    accountability: number // 0-100

    // Event Planning
    planCompleteness: number // 0-100
    technicalViability: number // 0-100
    riskAnalysis: number // 0-100
    creativity: number // 0-100
    cooperativeAlignment: number // 0-100
}

export interface CalculatedIndicators {
    cooperativism_understanding: number
    democratic_functioning: number
    nuclei_organization: number
    financial_management: number
    event_planning: number
    overall_score: number
    approved_for_event: boolean
}

// AI Types
export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

export interface AIContext {
    classId?: string
    nucleusName?: NucleusName
    topic?: string
    userType: 'teacher' | 'student'
}

export interface ResearchResult {
    answer: string
    category: string
    query: string
    sources?: string[]
}

export interface EventPlanEvaluation {
    completeness: number
    financial_viability: number
    risk_management: number
    creativity: number
    cooperative_alignment: number
    overall_score: number
    feedback: string
    strengths: string[]
    improvements: string[]
    approval_recommendation: boolean
}

// Dashboard Statistics
export interface TeacherDashboardStats {
    totalClasses: number
    activeClasses: number
    totalStudents: number
    pendingAssessments: number
    averageMaturityScore: number
    classesApprovedForEvent: number
}

export interface StudentDashboardStats {
    enrolledClasses: number
    pendingAssessments: number
    completedAssessments: number
    maturityScore: number
    approvedForEvent: boolean
    nucleusName?: NucleusName
    nucleusRole?: 'coordenador' | 'membro'
}

// Nuclei Configuration
export const NUCLEI_CONFIG: Record<NucleusName, {
    description: string
    responsibilities: string[]
    icon: string
    color: string
}> = {
    'Entretenimento': {
        description: 'Planeja atividades e atrações do evento',
        responsibilities: [
            'Definir programação de atividades',
            'Organizar apresentações e shows',
            'Planejar dinâmicas interativas',
            'Coordenar artistas e convidados'
        ],
        icon: 'PartyPopper',
        color: '#F59E0B'
    },
    'Logística': {
        description: 'Organiza espaço, materiais e transporte',
        responsibilities: [
            'Mapear e organizar o espaço físico',
            'Gerenciar materiais e equipamentos',
            'Coordenar transporte e deslocamento',
            'Planejar montagem e desmontagem'
        ],
        icon: 'Truck',
        color: '#10B981'
    },
    'Operacional': {
        description: 'Coordena execução e cronograma',
        responsibilities: [
            'Elaborar cronograma detalhado',
            'Coordenar equipes durante evento',
            'Gerenciar imprevistos',
            'Garantir cumprimento do timing'
        ],
        icon: 'ClipboardList',
        color: '#3B82F6'
    },
    'Financeiro': {
        description: 'Gerencia orçamento e prestação de contas',
        responsibilities: [
            'Elaborar orçamento detalhado',
            'Controlar receitas e despesas',
            'Negociar com fornecedores',
            'Prestar contas à cooperativa'
        ],
        icon: 'DollarSign',
        color: '#EF4444'
    },
    'Comunicação': {
        description: 'Cuida da divulgação e relacionamento',
        responsibilities: [
            'Criar material de divulgação',
            'Gerenciar redes sociais',
            'Elaborar comunicados oficiais',
            'Documentar o evento (fotos, vídeos)'
        ],
        icon: 'Megaphone',
        color: '#8B5CF6'
    },
    'Parcerias': {
        description: 'Busca apoiadores e patrocinadores',
        responsibilities: [
            'Mapear potenciais parceiros',
            'Elaborar propostas de parceria',
            'Negociar patrocínios',
            'Manter relacionamento com apoiadores'
        ],
        icon: 'Handshake',
        color: '#EC4899'
    }
}

// Assessment Type Configuration
export const ASSESSMENT_TYPES_CONFIG: Record<AssessmentType, {
    title: string
    description: string
    icon: string
}> = {
    'cooperativismo': {
        title: 'Compreensão do Cooperativismo',
        description: 'Avalia o entendimento dos princípios, valores e práticas cooperativas',
        icon: 'Users'
    },
    'participacao': {
        title: 'Participação e Engajamento',
        description: 'Mede o nível de envolvimento e contribuição nas atividades',
        icon: 'UserCheck'
    },
    'organizacao_nucleos': {
        title: 'Organização dos Núcleos',
        description: 'Avalia a estruturação e funcionamento dos núcleos de trabalho',
        icon: 'Layers'
    },
    'planejamento_evento': {
        title: 'Planejamento do Evento',
        description: 'Analisa a qualidade do planejamento e viabilidade do evento',
        icon: 'Calendar'
    },
    'gestao_financeira': {
        title: 'Gestão Financeira',
        description: 'Mede competências de gestão orçamentária e financeira',
        icon: 'PiggyBank'
    }
}
