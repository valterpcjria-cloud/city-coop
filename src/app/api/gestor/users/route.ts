import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateSuperadminAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'

/**
 * ===========================================
 * Users Management API - Superadmin Only
 * ===========================================
 */

// GET - List all users (unified view)
export async function GET(request: NextRequest) {
    try {
        const auth = await validateSuperadminAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.GET)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Fetch all user types in parallel
        const [gestorsRes, teachersRes, studentsRes] = await Promise.all([
            supabase.from('gestors').select('*, schools:school_id(name)').order('name'),
            supabase.from('teachers').select('*, schools:school_id(name)').order('name'),
            supabase.from('students').select('*, schools:school_id(name)').order('name')
        ])

        // Unify all users into a single list
        const users = [
            ...(gestorsRes.data || []).map((g: any) => ({
                id: g.id,
                user_id: g.user_id,
                name: g.name,
                email: g.email,
                phone: g.phone,
                role: 'gestor' as const,
                school_id: null,
                school_name: null,
                is_superadmin: g.is_superadmin,
                is_active: g.is_active ?? true,
                created_at: g.created_at
            })),
            ...(teachersRes.data || []).map((t: any) => ({
                id: t.id,
                user_id: t.user_id,
                name: t.name,
                email: t.email,
                phone: t.phone,
                role: 'professor' as const,
                school_id: t.school_id,
                school_name: t.schools?.name || null,
                is_superadmin: false,
                is_active: t.is_active ?? true,
                created_at: t.created_at
            })),
            ...(studentsRes.data || []).map((s: any) => ({
                id: s.id,
                user_id: s.user_id,
                name: s.name,
                email: s.email,
                phone: null,
                role: 'estudante' as const,
                school_id: s.school_id,
                school_name: s.schools?.name || null,
                is_superadmin: false,
                is_active: s.is_active ?? true,
                grade_level: s.grade_level,
                created_at: s.created_at
            }))
        ]

        // Sort by name
        users.sort((a, b) => a.name.localeCompare(b.name))

        return NextResponse.json({ success: true, users })
    } catch (error: any) {
        console.error('[API_USERS_GET] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Create new user
export async function POST(request: NextRequest) {
    try {
        const auth = await validateSuperadminAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const body = await request.json()
        const { name, email, phone, cpf, role, school_id, grade_level, is_superadmin } = body

        if (!name || !email || !role) {
            return NextResponse.json(
                { error: 'Nome, email e role são obrigatórios' },
                { status: 400 }
            )
        }

        if ((role === 'professor' || role === 'estudante') && !school_id) {
            return NextResponse.json(
                { error: 'Escola é obrigatória para professores e estudantes' },
                { status: 400 }
            )
        }

        if (role === 'estudante' && !grade_level) {
            return NextResponse.json(
                { error: 'Série é obrigatória para estudantes' },
                { status: 400 }
            )
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Create auth user with temporary password
        const tempPassword = `City${Date.now().toString(36)}!`
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { role, name }
        })

        if (authError) {
            console.error('[API_USERS_POST] Auth error:', authError.message)
            if (authError.message.includes('already registered')) {
                return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 400 })
            }
            throw authError
        }

        // Insert into role-specific table
        let insertError = null
        const userId = authUser.user.id

        if (role === 'gestor') {
            const { error } = await supabase.from('gestors').insert({
                user_id: userId,
                name,
                email,
                phone,
                is_superadmin: is_superadmin || false
            })
            insertError = error
        } else if (role === 'professor') {
            const { error } = await supabase.from('teachers').insert({
                user_id: userId,
                school_id,
                name,
                email,
                phone,
                cpf
            })
            insertError = error
        } else if (role === 'estudante') {
            const { error } = await supabase.from('students').insert({
                user_id: userId,
                school_id,
                name,
                email,
                grade_level,
                cpf
            })
            insertError = error
        }

        if (insertError) {
            // Rollback: delete auth user
            await supabase.auth.admin.deleteUser(userId)
            throw insertError
        }

        return NextResponse.json({
            success: true,
            message: 'Usuário criado com sucesso',
            user: { id: userId, name, email, role }
        })
    } catch (error: any) {
        console.error('[API_USERS_POST] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
    try {
        const auth = await validateSuperadminAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const body = await request.json()
        const { id, role, name, phone, cpf, school_id, grade_level, is_active, is_superadmin } = body

        if (!id || !role) {
            return NextResponse.json({ error: 'ID e role são obrigatórios' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        let updateError = null

        if (role === 'gestor') {
            const { error } = await supabase
                .from('gestors')
                .update({ name, phone, is_superadmin, is_active, updated_at: new Date().toISOString() })
                .eq('id', id)
            updateError = error
        } else if (role === 'professor') {
            const { error } = await supabase
                .from('teachers')
                .update({ name, phone, cpf, school_id, is_active, updated_at: new Date().toISOString() })
                .eq('id', id)
            updateError = error
        } else if (role === 'estudante') {
            const { error } = await supabase
                .from('students')
                .update({ name, cpf, school_id, grade_level, is_active, updated_at: new Date().toISOString() })
                .eq('id', id)
            updateError = error
        }

        if (updateError) throw updateError

        return NextResponse.json({ success: true, message: 'Usuário atualizado' })
    } catch (error: any) {
        console.error('[API_USERS_PUT] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE - Deactivate user (soft delete)
export async function DELETE(request: NextRequest) {
    try {
        const auth = await validateSuperadminAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.DELETE)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const role = searchParams.get('role')

        if (!id || !role) {
            return NextResponse.json({ error: 'ID e role são obrigatórios' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Soft delete: set is_active = false
        const tableName = role === 'gestor' ? 'gestors' : role === 'professor' ? 'teachers' : 'students'
        const { error } = await supabase
            .from(tableName)
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Usuário desativado' })
    } catch (error: any) {
        console.error('[API_USERS_DELETE] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
