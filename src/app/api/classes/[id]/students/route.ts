import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        // Await params if needed in Next 15, though for now standard access
        const { id } = params
        const body = await request.json()
        const { students } = body

        if (!students || !Array.isArray(students)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Check if class belongs to teacher
        // We cast to any to avoid TypeScript inference issues with Supabase generated types
        const teacherResult = await supabase.from('teachers').select('id').eq('user_id', user.id).single()
        const teacherId = (teacherResult.data as any)?.id

        const turmaResult = await supabase
            .from('classes')
            .select('id, school_id')
            .eq('id', id)
            .eq('teacher_id', teacherId)
            .single()

        const turma = turmaResult.data as any

        if (!turma) return NextResponse.json({ error: 'Class not found or unauthorized' }, { status: 404 })

        const results = []

        for (const studentData of students) {
            if (studentData.id) {
                // Add existing student by ID
                const { data, error } = await supabase
                    .from('class_students')
                    .insert({
                        class_id: id,
                        student_id: studentData.id
                    } as any)
                    .select()

                if (error) {
                    results.push({ ...studentData, status: 'error', error: error.message })
                } else {
                    results.push({ ...studentData, status: 'success' })
                }
            } else if (studentData.email) {

                let { data: existingStudent } = await supabase
                    .from('students')
                    .select('id')
                    .eq('email', studentData.email)
                    .single()

                if (!existingStudent) {
                    // Create new unlinked student
                    const { data: newStudent, error: createError } = await supabase
                        .from('students')
                        .insert({
                            name: studentData.name,
                            email: studentData.email,
                            school_id: turma.school_id,
                            grade_level: studentData.grade_level || '1EM'
                        } as any)
                        .select()
                        .single()

                    if (createError) {
                        results.push({ ...studentData, status: 'error', error: createError.message })
                        continue
                    }
                    existingStudent = newStudent
                }

                if (existingStudent) {
                    const { error: linkError } = await supabase
                        .from('class_students')
                        .insert({
                            class_id: id,
                            student_id: (existingStudent as any).id
                        } as any)

                    if (linkError) {
                        results.push({ ...studentData, status: 'error', error: linkError.message })
                    } else {
                        results.push({ ...studentData, status: 'success' })
                    }
                }
            }
        }

        return NextResponse.json({ success: true, results })

    } catch (error: any) {
        console.error('Error adding students:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
