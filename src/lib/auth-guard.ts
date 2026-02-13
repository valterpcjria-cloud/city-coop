/**
 * ===========================================
 * Auth Guard - API Authentication & Authorization
 * ===========================================
 * 
 * Provides secure authentication validation for API routes.
 * Verifies JWT tokens and user roles before allowing access.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

export type UserRole = 'gestor' | 'professor' | 'estudante' | null

export interface AuthResult {
    success: boolean
    user: {
        id: string
        email: string
    } | null
    role: UserRole
    error?: string
    response?: NextResponse
}

/**
 * Creates an authenticated Supabase client from cookies
 */
async function createAuthClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore - called from Server Component
                    }
                },
            },
        }
    )
}

/**
 * Validates authentication and returns user info
 * Use this for general authentication checks
 */
export async function validateAuth(): Promise<AuthResult> {
    try {
        const supabase = await createAuthClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return {
                success: false,
                user: null,
                role: null,
                error: 'Não autenticado',
                response: NextResponse.json(
                    { error: 'Não autenticado. Faça login para continuar.' },
                    { status: 401 }
                )
            }
        }

        // Determine user role
        const { data: manager } = await supabase
            .from('gestors')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

        const { data: teacher } = await supabase
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', user.id)
            .single()

        let role: UserRole = null
        if (manager) role = 'gestor'
        else if (teacher) role = 'professor'
        else if (student) role = 'estudante'

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email || ''
            },
            role
        }
    } catch (error) {
        console.error('[AUTH_GUARD] Error:', error)
        return {
            success: false,
            user: null,
            role: null,
            error: 'Erro interno de autenticação',
            response: NextResponse.json(
                { error: 'Erro interno de autenticação' },
                { status: 500 }
            )
        }
    }
}

/**
 * Validates access for Gestor (Admin) routes
 * Returns 401 if not authenticated, 403 if not a gestor
 */
export async function validateGestorAccess(): Promise<AuthResult> {
    const auth = await validateAuth()

    if (!auth.success) {
        return auth
    }

    if (auth.role !== 'gestor') {
        console.warn(`[AUTH_GUARD] Unauthorized gestor access attempt by user ${auth.user?.id}`)
        return {
            success: false,
            user: auth.user,
            role: auth.role,
            error: 'Acesso negado. Apenas gestores podem acessar este recurso.',
            response: NextResponse.json(
                { error: 'Acesso negado. Apenas gestores podem acessar este recurso.' },
                { status: 403 }
            )
        }
    }

    return auth
}

/**
 * Validates access for Professor routes
 * Returns 401 if not authenticated, 403 if not a professor or gestor
 */
export async function validateProfessorAccess(): Promise<AuthResult> {
    const auth = await validateAuth()

    if (!auth.success) {
        return auth
    }

    if (auth.role !== 'professor' && auth.role !== 'gestor') {
        console.warn(`[AUTH_GUARD] Unauthorized professor access attempt by user ${auth.user?.id}`)
        return {
            success: false,
            user: auth.user,
            role: auth.role,
            error: 'Acesso negado. Apenas professores podem acessar este recurso.',
            response: NextResponse.json(
                { error: 'Acesso negado. Apenas professores podem acessar este recurso.' },
                { status: 403 }
            )
        }
    }

    return auth
}

/**
 * Validates access for Student routes
 * Returns 401 if not authenticated
 */
export async function validateStudentAccess(): Promise<AuthResult> {
    const auth = await validateAuth()

    if (!auth.success) {
        return auth
    }

    // Any authenticated user can access student resources
    // (their own data is filtered by RLS)
    return auth
}

/**
 * Required roles helper - validates that user has one of the specified roles
 */
export async function validateRoles(allowedRoles: UserRole[]): Promise<AuthResult> {
    const auth = await validateAuth()

    if (!auth.success) {
        return auth
    }

    if (!allowedRoles.includes(auth.role)) {
        console.warn(`[AUTH_GUARD] Role validation failed for user ${auth.user?.id}. Required: ${allowedRoles.join(', ')}, Got: ${auth.role}`)
        return {
            success: false,
            user: auth.user,
            role: auth.role,
            error: 'Acesso negado. Você não tem permissão para acessar este recurso.',
            response: NextResponse.json(
                { error: 'Acesso negado. Você não tem permissão para acessar este recurso.' },
                { status: 403 }
            )
        }
    }

    return auth
}

/**
 * Extended auth result for superadmin with additional info
 */
export interface SuperadminAuthResult extends AuthResult {
    isSuperadmin: boolean
}

/**
 * Validates access for Superadmin-only routes (like user management)
 * Returns 401 if not authenticated, 403 if not a superadmin
 */
export async function validateSuperadminAccess(): Promise<SuperadminAuthResult> {
    try {
        // Get auth token from cookies
        const supabase = await createAuthClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        console.log('[AUTH_GUARD] Auth check:', {
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
            authError: authError?.message
        })

        if (authError || !user) {
            return {
                success: false,
                user: null,
                role: null,
                isSuperadmin: false,
                error: 'Não autenticado',
                response: NextResponse.json(
                    { error: 'Não autenticado. Faça login para continuar.' },
                    { status: 401 }
                )
            }
        }

        // Use admin client to bypass RLS for superadmin check
        const { createClient } = await import('@supabase/supabase-js')
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        console.log('[AUTH_GUARD] Checking gestors table for user_id:', user.id)

        const { data: gestor, error } = await adminClient
            .from('gestors')
            .select('id, user_id, email, is_superadmin')
            .eq('user_id', user.id)
            .maybeSingle()

        console.log('[AUTH_GUARD] Gestor query result:', {
            gestor,
            error: error?.message,
            is_superadmin: gestor?.is_superadmin
        })

        // Check if we found a gestor record with superadmin=true
        if (error) {
            console.error('[AUTH_GUARD] DB error:', error.message)
            return {
                success: false,
                user: { id: user.id, email: user.email || '' },
                role: 'gestor',
                isSuperadmin: false,
                error: 'Erro ao verificar permissões.',
                response: NextResponse.json(
                    { error: 'Erro ao verificar permissões.' },
                    { status: 500 }
                )
            }
        }

        if (!gestor || !gestor.is_superadmin) {
            console.warn(`[AUTH_GUARD] Non-superadmin access attempt. User: ${user.id}, Gestor found: ${!!gestor}, is_superadmin: ${gestor?.is_superadmin}`)
            return {
                success: false,
                user: { id: user.id, email: user.email || '' },
                role: 'gestor',
                isSuperadmin: false,
                error: 'Acesso negado. Apenas superadministradores podem gerenciar usuários.',
                response: NextResponse.json(
                    { error: 'Acesso negado. Apenas superadministradores podem gerenciar usuários.' },
                    { status: 403 }
                )
            }
        }

        console.log('[AUTH_GUARD] Superadmin access GRANTED for:', user.email)

        return {
            success: true,
            user: { id: user.id, email: user.email || '' },
            role: 'gestor',
            isSuperadmin: true
        }
    } catch (error) {
        console.error('[AUTH_GUARD] Superadmin check error:', error)
        return {
            success: false,
            user: null,
            role: null,
            isSuperadmin: false,
            error: 'Erro ao verificar permissões de administrador.',
            response: NextResponse.json(
                { error: 'Erro ao verificar permissões de administrador.' },
                { status: 500 }
            )
        }
    }
}

