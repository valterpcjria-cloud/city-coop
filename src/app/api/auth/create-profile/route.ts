import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createProfileSchema, userProfileSchema, getZodErrorResponse } from '@/lib/validators'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Validate request body
        const bodyValidation = createProfileSchema.safeParse(body)
        if (!bodyValidation.success) {
            return NextResponse.json(getZodErrorResponse(bodyValidation.error), { status: 400 })
        }

        const { userId } = bodyValidation.data

        // Initialize Admin client (bypasses RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 2. Fetch the user from Auth to get trusted metadata
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

        if (userError || !user) {
            return NextResponse.json({ error: 'Usuário não encontrado ou erro de autenticação' }, { status: 404 })
        }

        // 3. Validate metadata from Auth
        const metaValidation = userProfileSchema.safeParse(user.user_metadata)
        if (!metaValidation.success) {
            // We don't block auth flow for some missing metadata if the user exists, 
            // but we log it and provide defaults.
            console.warn('User metadata validation failed for ID:', userId, metaValidation.error.format())
        }

        const { name, role, schoolCode, gradeLevel } = user.user_metadata || {}

        // 4. Check if profile already exists
        const isGestor = role === 'manager' || role === 'gestor' || role === 'superadmin'

        if (isGestor) {
            const { data: existing } = await supabaseAdmin.from('gestors').select('id').eq('user_id', userId).single()
            if (existing) return NextResponse.json({ success: true, message: 'Perfil de gestor já existe' })
        } else if (role === 'teacher' || role === 'professor') {
            const { data: existing } = await supabaseAdmin.from('teachers').select('id').eq('user_id', userId).single()
            if (existing) return NextResponse.json({ success: true, message: 'Perfil de professor já existe' })
        } else {
            const { data: existing } = await supabaseAdmin.from('students').select('id').eq('user_id', userId).single()
            if (existing) return NextResponse.json({ success: true, message: 'Perfil de estudante já existe' })
        }

        // 5. Create Profile
        if (isGestor) {
            const { error: profileError } = await supabaseAdmin
                .from('gestors')
                .insert({
                    user_id: userId,
                    name: name || 'Gestor',
                    email: user.email,
                    is_superadmin: role === 'superadmin'
                })

            if (profileError) throw profileError

        } else if (role === 'teacher' || role === 'professor') {
            let schoolId = null
            if (schoolCode) {
                const { data: school } = await supabaseAdmin
                    .from('schools')
                    .select('id')
                    .eq('code', schoolCode)
                    .single()
                if (school) schoolId = school.id
            }

            const { error: profileError } = await supabaseAdmin
                .from('teachers')
                .insert({
                    user_id: userId,
                    name: name || 'Professor',
                    email: user.email,
                    school_id: schoolId
                })

            if (profileError) throw profileError

        } else {
            // Student
            let schoolId = null
            if (schoolCode) {
                const { data: school } = await supabaseAdmin
                    .from('schools')
                    .select('id')
                    .eq('code', schoolCode)
                    .single()
                if (school) schoolId = school.id
            }

            const { error: profileError } = await supabaseAdmin
                .from('students')
                .insert({
                    user_id: userId,
                    name: name || 'Estudante',
                    email: user.email,
                    grade_level: gradeLevel,
                    school_id: schoolId
                })

            if (profileError) throw profileError
        }

        // 6. Proactive Revalidation
        revalidatePath('/gestor')
        revalidatePath('/professor')
        revalidatePath('/estudante')

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('API Profile creation error:', error)
        return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 })
    }
}
