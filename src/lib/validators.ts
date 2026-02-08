/**
 * ===========================================
 * Input Validators - Security Sanitization
 * ===========================================
 * 
 * Functions to validate and sanitize user inputs.
 * Prevents SQL injection, XSS, and other attacks.
 */

import { z } from 'zod'

// ========================================
// UUID Validation
// ========================================

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const uuidSchema = z.string().refine(
    (val) => uuidRegex.test(val),
    { message: 'ID inválido' }
)

export function isValidUUID(value: string): boolean {
    return uuidRegex.test(value)
}

export function validateUUID(value: unknown): string | null {
    const result = uuidSchema.safeParse(value)
    return result.success ? result.data : null
}

// ========================================
// String Sanitization
// ========================================

/**
 * Removes potentially dangerous characters from strings
 */
export function sanitizeString(value: string, maxLength = 1000): string {
    return value
        .slice(0, maxLength)
        .replace(/[<>]/g, '') // Remove HTML brackets
        .replace(/javascript:/gi, '') // Remove JS protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim()
}

/**
 * Sanitizes string for use in SQL (additional safety layer)
 */
export function sanitizeForSQL(value: string): string {
    return value
        .replace(/'/g, "''") // Escape single quotes
        .replace(/;/g, '') // Remove semicolons
        .replace(/--/g, '') // Remove SQL comments
        .replace(/\/\*/g, '') // Remove block comments
        .replace(/\*\//g, '')
}

// ========================================
// School Validators
// ========================================

export const schoolSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
    code: z.string().min(2, 'Código deve ter pelo menos 2 caracteres').max(20),
    inep_code: z.string().length(8, 'Código INEP deve ter 8 dígitos').regex(/^\d+$/).optional().nullable(),
    administrative_category: z.enum(['publica_municipal', 'publica_estadual', 'publica_federal', 'privada']).optional().nullable(),
    education_stages: z.array(z.string()).optional().default([]),
    location_type: z.enum(['urbana', 'rural']).optional().nullable(),
    director_name: z.string().max(200).optional().nullable(),
    cep: z.string().max(10).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(2).optional().nullable(),
    neighborhood: z.string().max(100).optional().nullable(),
    address: z.string().max(300).optional().nullable(),
    address_number: z.string().max(20).optional().nullable(),
    address_complement: z.string().max(200).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    secondary_phone: z.string().max(20).optional().nullable(),
    email: z.string().email('E-mail inválido').optional().nullable(),
    website: z.string().url('URL inválida').optional().nullable(),
})

export const schoolUpdateSchema = schoolSchema.extend({
    id: uuidSchema
})

// ========================================
// Teacher Validators
// ========================================

export const teacherSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
    email: z.string().email('E-mail inválido'),
    phone: z.string().max(20).optional().nullable(),
    school_id: uuidSchema,
})

// ========================================
// Student Validators
// ========================================

export const studentSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
    email: z.string().email('E-mail inválido').optional().nullable(),
    grade_level: z.enum(['9EF', '1EM', '2EM', '3EM', 'EJA']),
    school_id: uuidSchema,
})

// ========================================
// Class Validators
// ========================================

export const classSchema = z.object({
    name: z.string().min(3).max(100),
    code: z.string().min(2).max(20),
    modality: z.enum(['trimestral', 'semestral']),
    grade_level: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    school_id: uuidSchema,
    teacher_id: uuidSchema,
})

// ========================================
// CPF Validation (Checksum)
// ========================================

/**
 * Validates Brazilian CPF (checksum and format)
 */
export function isValidCPF(cpf: string): boolean {
    if (!cpf) return false

    // Remove formatting
    const cleanCPF = cpf.replace(/[^\d]+/g, '')

    if (cleanCPF.length !== 11) return false

    // Known invalid CPFs
    if (/^(\d)\1+$/.test(cleanCPF)) return false

    // Validate first digit
    let sum = 0
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    if (rev !== parseInt(cleanCPF.charAt(9))) return false

    // Validate second digit
    sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    if (rev !== parseInt(cleanCPF.charAt(10))) return false

    return true
}

export const cpfSchema = z.string().refine(
    (val) => !val || isValidCPF(val),
    { message: 'CPF inválido' }
)

// ========================================
// Pagination Validators
// ========================================

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(200).optional(),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
})

// ========================================
// Helper Functions
// ========================================

/**
 * Validates data against a schema and returns clean data or errors
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean
    data?: T
    errors?: string[]
} {
    const result = schema.safeParse(data)

    if (result.success) {
        return { success: true, data: result.data }
    }

    const errors = result.error.issues.map(e =>
        `${e.path.join('.')}: ${e.message}`
    )

    return { success: false, errors }
}

/**
 * Validates and sanitizes object keys (prevents prototype pollution)
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const dangerous = ['__proto__', 'constructor', 'prototype']

    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !dangerous.includes(key))
    ) as T
}
