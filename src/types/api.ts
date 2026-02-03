// ===========================================
// API Types for City Coop Platform
// ===========================================

import {
    Class,
    Student,
    Assessment,
    MaturityIndicators,
    ClassModality,
    GradeLevel,
    AssessmentType,
    NucleusName
} from './database.types'
import { AssessmentQuestion, ChatMessage, EventPlanEvaluation, ResearchResult } from './models'

// Generic API Response
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// Auth
export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    name: string
    role: 'teacher' | 'student'
    schoolCode?: string
    gradeLevel?: GradeLevel
}

export interface AuthResponse {
    user: {
        id: string
        email: string
        name: string
        role: 'teacher' | 'student' | 'manager'
        profileId: string
    }
    session: {
        accessToken: string
        refreshToken: string
        expiresAt: number
    }
}

// Classes
export interface CreateClassRequest {
    name: string
    code: string
    modality: ClassModality
    gradeLevel: string
    startDate: string
    endDate: string
    schoolId?: string
}

export interface UpdateClassRequest {
    name?: string
    modality?: ClassModality
    startDate?: string
    endDate?: string
    status?: 'active' | 'completed' | 'cancelled'
}

export interface AddStudentsRequest {
    studentIds?: string[]
    students?: {
        name: string
        email: string
        gradeLevel: GradeLevel
    }[]
}

export interface OrganizeNucleiRequest {
    nuclei: {
        name: NucleusName
        members: {
            studentId: string
            role: 'coordenador' | 'membro'
        }[]
    }[]
}

// Assessments
export interface CreateAssessmentRequest {
    classId: string
    title: string
    type: AssessmentType
    questions: AssessmentQuestion[]
    availableFrom?: string
    availableUntil?: string
}

export interface SubmitAssessmentRequest {
    assessmentId: string
    answers: {
        questionId: string
        answer: string | string[] | number
    }[]
}

export interface AssessmentSubmissionResponse {
    score: number
    feedback?: string
    details: {
        questionId: string
        correct: boolean
        points: number
        feedback?: string
    }[]
}

// Indicators
export interface CalculateIndicatorsRequest {
    classId: string
    studentId: string
}

export interface IndicatorsResponse {
    indicators: MaturityIndicators
    breakdown: {
        dimension: string
        score: number
        components: {
            name: string
            value: number
            weight: number
        }[]
    }[]
}

// AI
export interface ChatRequest {
    messages: ChatMessage[]
    context?: {
        classId?: string
        nucleusName?: string
        topic?: string
    }
    userType: 'teacher' | 'student'
}

export interface ChatResponse {
    message: ChatMessage
    suggestedFollowups?: string[]
}

export interface ResearchRequest {
    query: string
    category?: string
}

export interface EvaluateEventPlanRequest {
    eventPlanId: string
}

export interface GenerateAgendaRequest {
    classId: string
    previousDecisions?: { topic: string; decision: string }[]
    upcomingMilestones?: { title: string; date: string }[]
}

export interface GenerateAgendaResponse {
    title: string
    topics: {
        order: number
        title: string
        description: string
        type: 'informativo' | 'deliberativo' | 'consultivo'
        estimatedTime: number
    }[]
    totalDuration: number
}

export interface GenerateMinutesRequest {
    assemblyId: string
    attendance: string[]
    discussions: { topic: string; summary: string }[]
    decisions: { topic: string; decision: string; votes?: { favor: number; against: number; abstention: number } }[]
}

// Analytics
export interface StudentAnalytics {
    studentId: string
    studentName: string
    enrolledClasses: number
    assessmentsTaken: number
    averageScore: number
    indicators: MaturityIndicators
    progressHistory: {
        date: string
        overallScore: number
    }[]
}

export interface ClassAnalytics {
    classId: string
    className: string
    studentCount: number
    averageMaturityScore: number
    approvedStudentsCount: number
    approvalRate: number
    indicatorAverages: {
        cooperativism: number
        democratic: number
        organization: number
        financial: number
        planning: number
    }
    assessmentCompletionRate: number
}

export interface SchoolAnalytics {
    schoolId: string
    schoolName: string
    totalClasses: number
    totalStudents: number
    totalTeachers: number
    averageMaturityScore: number
    topPerformingClasses: {
        classId: string
        className: string
        averageScore: number
    }[]
}
