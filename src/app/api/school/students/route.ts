import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const classId = searchParams.get('excludeClassId')

        // 1. Tentar buscar school_id do professor logado (apenas para contexto, não filtra mais)
        const { data: teacher } = await (supabase
            .from('teachers') as any)
            .select('school_id')
            .eq('user_id', user.id)
            .maybeSingle()

        let schoolId = teacher?.school_id

        // 2. Fallback via turma
        if (!schoolId && classId) {
            const { data: turma } = await (supabase
                .from('classes') as any)
                .select('school_id')
                .eq('id', classId)
                .maybeSingle()
            schoolId = turma?.school_id
        }

        // Usamos o Admin Client para busca global para ignorar RLS que restringe visibilidade
        const adminSupabase = await createAdminClient()

        console.log('[API_SCHOOL_STUDENTS] Global search by user:', user.id)

        const { data: students, error: studentsError } = await adminSupabase
            .from('students')
            .select('id, name, email, grade_level, is_active, school_id')
            .order('name') as any

        if (studentsError) {
            console.error('[API_SCHOOL_STUDENTS] Select error:', studentsError)
            throw studentsError
        }

        let filteredStudents = students || []

        if (classId) {
            const { data: classStudents } = await adminSupabase
                .from('class_students')
                .select('student_id')
                .eq('class_id', classId) as any

            const existingIds = new Set((classStudents || []).map((cs: any) => cs.student_id))
            filteredStudents = students.filter((s: any) => !existingIds.has(s.id))
        }

        return NextResponse.json({ success: true, students: filteredStudents })

    } catch (error: any) {
        console.error('Error fetching global students:', error)
        return NextResponse.json({ error: error.message, success: false }, { status: 500 })
    }
}
