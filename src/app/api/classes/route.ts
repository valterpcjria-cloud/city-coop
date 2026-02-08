import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const adminAuth = await createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { name, code, grade_level, modality, start_date, end_date } = body

        // Find teacher using Admin Client to bypass any RLS issue during creation
        const { data: teacher, error: teacherError } = await (adminAuth
            .from('teachers') as any)
            .select('id, school_id')
            .eq('user_id', user.id)
            .single()

        if (teacherError || !teacher) {
            console.error('Teacher not found for user:', user.id, teacherError)
            return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 })
        }

        const { data, error } = await (adminAuth
            .from('classes') as any)
            .insert({
                name,
                code,
                grade_level,
                modality,
                start_date,
                end_date,
                teacher_id: teacher.id,
                school_id: teacher.school_id,
                status: 'active'
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, class: data })

    } catch (error: any) {
        console.error('Error in class creation API:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
