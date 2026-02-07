import { createClient } from '@supabase/supabase-js' // Use direct client, not SSR
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        // Initialize pure Admin client (bypasses RLS)
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

        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        // 1. Fetch the user from Auth to get trusted metadata
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Extract trusted data from metadata
        const { name, role, schoolCode, gradeLevel } = user.user_metadata || {}

        // 3. Check if profile already exists to prevent duplicates
        if (role === 'manager') {
            const { data: existing } = await supabaseAdmin.from('managers').select('id').eq('user_id', userId).single()
            if (existing) return NextResponse.json({ success: true, message: 'Perfil de gestor já existe' })
        } else if (role === 'teacher') {
            const { data: existing } = await supabaseAdmin.from('teachers').select('id').eq('user_id', userId).single()
            if (existing) return NextResponse.json({ success: true, message: 'Perfil de professor já existe' })
        } else {
            const { data: existing } = await supabaseAdmin.from('students').select('id').eq('user_id', userId).single()
            if (existing) return NextResponse.json({ success: true, message: 'Perfil de estudante já existe' })
        }

        // 4. Create Profile
        if (role === 'manager') {
            const { error: profileError } = await supabaseAdmin
                .from('managers')
                .insert({
                    user_id: userId,
                    name: name || 'Gestor',
                    email: user.email
                })

            if (profileError) throw profileError

        } else if (role === 'teacher') {
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
                    name: name,
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
                    name: name,
                    email: user.email,
                    grade_level: gradeLevel,
                    school_id: schoolId
                })

            if (profileError) throw profileError
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('API Profile creation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
