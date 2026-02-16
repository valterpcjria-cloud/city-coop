import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateGestorAccess, validateSuperadminAccess, validateProfessorAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { isValidCPF } from '@/lib/validators'

/**
 * ===========================================
 * Users Management API
 * ===========================================
 */

// GET - List all users (unified view)
export async function GET(request: NextRequest) {
    try {
        const auth = await validateGestorAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.GET)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Fetch all user types in parallel
        const [gestorsRes, teachersRes, studentsRes] = await Promise.all([
            supabase.from('gestors').select('*'),
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
                cpf: g.cpf,
                role: 'gestor' as const,
                school_id: null,
                school: null,
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
                cpf: t.cpf,
                role: 'professor' as const,
                school_id: t.school_id,
                school: t.schools ? { name: t.schools.name } : null,
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
                cpf: s.cpf,
                role: 'estudante' as const,
                school_id: s.school_id,
                school: s.schools ? { name: s.schools.name } : null,
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
        const auth = await validateProfessorAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const body = await request.json()
        const { name, email, phone, cpf, role, school_id, grade_level, is_superadmin, class_id } = body

        // If professor is creating, role must be "estudante"
        if (auth.role === 'professor' && role !== 'estudante') {
            return NextResponse.json({ error: 'Professores só podem cadastrar estudantes' }, { status: 403 })
        }

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

        // Validate CPF if provided
        if (cpf && !isValidCPF(cpf)) {
            return NextResponse.json(
                { error: 'CPF inválido' },
                { status: 400 }
            )
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // If professor, verify school_id matches their school
        if (auth.role === 'professor') {
            const { data: teacher } = await supabase
                .from('teachers')
                .select('school_id')
                .eq('user_id', auth.user?.id)
                .single()

            if (!teacher || teacher.school_id !== school_id) {
                return NextResponse.json({ error: 'Você só pode cadastrar alunos para sua própria escola' }, { status: 403 })
            }
        }

        // Create auth user with temporary password or CPF for students
        let userPassword = `City${Date.now().toString(36)}!`

        if (role === 'estudante' && cpf) {
            // Clean CPF for password (only numbers)
            const cleanCPF = cpf.replace(/[^\d]+/g, '')
            if (cleanCPF.length === 11) {
                userPassword = cleanCPF
            }
        }

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: userPassword,
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
                cpf,
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

        // Handle class allocation if student and class_id provided
        if (role === 'estudante' && class_id) {
            // Need the student UUID from the record we just created
            const { data: studentRecord } = await supabase.from('students').select('id').eq('user_id', userId).single()
            if (studentRecord) {
                await supabase.from('class_students').insert({
                    class_id,
                    student_id: studentRecord.id
                })
            }
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
        const auth = await validateProfessorAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const body = await request.json()
        const { id, role, name, phone, cpf, school_id, grade_level, is_active, is_superadmin } = body

        if (!id || !role) {
            return NextResponse.json({ error: 'ID e role são obrigatórios' }, { status: 400 })
        }

        // Validate CPF if provided
        if (cpf && !isValidCPF(cpf)) {
            return NextResponse.json(
                { error: 'CPF inválido' },
                { status: 400 }
            )
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        let updateError = null

        if (role === 'gestor') {
            const { error } = await supabase
                .from('gestors')
                .update({ name, phone, cpf, is_superadmin, is_active, updated_at: new Date().toISOString() })
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

// DELETE - Toggle status OR permanent Delete
export async function DELETE(request: NextRequest) {
    try {
        // PERMANENT DELETION and TOGGLE STATUS are Superadmin Only
        const auth = await validateSuperadminAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.DELETE)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const role = searchParams.get('role')
        const action = searchParams.get('action') || 'toggle' // 'toggle' or 'delete'

        if (!id || !role) {
            return NextResponse.json({ error: 'ID e role são obrigatórios' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const tableName = role === 'gestor' ? 'gestors' : role === 'professor' ? 'teachers' : 'students'

        // 1. Permanent Deletion
        if (action === 'delete') {
            // Get user_id first to delete from auth
            const { data: userRecord, error: fetchError } = await supabase
                .from(tableName)
                .select('user_id')
                .eq('id', id)
                .single()

            if (fetchError || !userRecord) throw new Error('Usuário não encontrado')

            // Handle Dependencies (Teacher only)
            if (role === 'professor') {
                console.log(`[API_USERS_DELETE] Nullifying references for teacher ${id}`)

                // Update assessments
                const { error: err1 } = await supabase
                    .from('assessments')
                    .update({ created_by: null })
                    .eq('created_by', id)

                // Update assemblies
                const { error: err2 } = await supabase
                    .from('assemblies')
                    .update({ created_by: null })
                    .eq('created_by', id)

                // Update event_plans
                const { error: err3 } = await supabase
                    .from('event_plans')
                    .update({ reviewed_by: null })
                    .eq('reviewed_by', id)

                if (err1 || err2 || err3) {
                    console.error('[API_USERS_DELETE] Error nullifying teacher references:', { err1, err2, err3 })
                    throw new Error('Erro ao limpar referências do professor. Tente desativar em vez de excluir.')
                }
            }

            // Delete from specific table
            const { error: dbError } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id)

            if (dbError) throw dbError

            // Delete from auth.users
            const { error: authError } = await supabase.auth.admin.deleteUser(userRecord.user_id)
            if (authError) {
                console.error('[API_USERS_DELETE] Auth delete error:', authError.message)
                // We don't throw here because DB record is already gone, but log it
            }

            return NextResponse.json({
                success: true,
                message: 'Usuário excluído permanentemente'
            })
        }

        // 2. Toggle Status (Desativar/Ativar)
        const { data: current, error: fetchError } = await supabase
            .from(tableName)
            .select('is_active')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        const { error } = await supabase
            .from(tableName)
            .update({ is_active: !current.is_active, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: current.is_active ? 'Usuário desativado' : 'Usuário ativado',
            is_active: !current.is_active
        })
    } catch (error: any) {
        console.error('[API_USERS_DELETE] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
