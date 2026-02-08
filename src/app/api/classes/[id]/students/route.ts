import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: classId } = await params

        const { data, error } = await (supabase as any)
            .from('class_students')
            .select(`
                *,
                student:students(*)
            `)
            .eq('class_id', classId)

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params
        const body = await request.json()
        const { students } = body

        if (!students || !Array.isArray(students)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Usar Admin Client para bypassar RLS em verificações de perfil e permissões
        const adminSupabase = await createAdminClient()

        console.log('[API_CLASS_STUDENTS] Checking profile for:', { userId: user.id, email: user.email })

        // 1. Verificar se é Gestor ou Administrador
        const { data: gestor } = await (adminSupabase as any).from('gestors').select('id').eq('user_id', user.id).maybeSingle()
        const { data: manager } = await (adminSupabase as any).from('managers').select('id').eq('user_id', user.id).maybeSingle()

        const isGestor = !!gestor || !!manager
        console.log('[API_CLASS_STUDENTS] Is Gestor/Admin?', isGestor, { gestorId: gestor?.id, managerId: manager?.id })

        let turmaQuery = (adminSupabase as any).from('classes').select('id, school_id').eq('id', id)

        if (!isGestor) {
            // 2. Se não é gestor, deve ser o professor da turma
            const { data: teacher } = await (adminSupabase as any).from('teachers').select('id').eq('user_id', user.id).maybeSingle()

            if (!teacher) {
                console.error('[API_CLASS_STUDENTS] Profile not found for user', { userId: user.id, email: user.email })
                return NextResponse.json({ error: 'Perfil não encontrado no sistema' }, { status: 403 })
            }

            console.log('[API_CLASS_STUDENTS] Access as Teacher:', (teacher as any).id)
            turmaQuery = turmaQuery.eq('teacher_id', (teacher as any).id)
        }

        const { data: turma, error: turmaError } = await (turmaQuery.maybeSingle() as any)

        if (turmaError || !turma) {
            console.error('[API_CLASS_STUDENTS] Class not found or unauthorized:', {
                classId: id,
                userId: user.id,
                isGestor,
                error: turmaError?.message
            })
            return NextResponse.json({ error: 'Turma não encontrada ou acesso negado' }, { status: 404 })
        }

        console.log(`[API_CLASS_STUDENTS] Access GRANTED for class ${id}`)
        const results = []

        for (const studentData of students) {
            if (studentData.id) {
                // Garantir que o aluno tenha o school_id da turma se estiver nulo
                const { data: currentStudent } = await (adminSupabase as any)
                    .from('students')
                    .select('school_id')
                    .eq('id', studentData.id)
                    .maybeSingle()

                if (currentStudent && !currentStudent.school_id) {
                    console.log(`[API_CLASS_STUDENTS] Allocating school to student ${studentData.id}`)
                    await (adminSupabase as any)
                        .from('students')
                        .update({ school_id: turma.school_id })
                        .eq('id', studentData.id)
                }

                // Link existing student
                const { data, error } = await (adminSupabase as any)
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
                // Find or create student by email
                let { data: existingStudent } = await (adminSupabase as any)
                    .from('students')
                    .select('id, name, email, school_id')
                    .eq('email', studentData.email)
                    .maybeSingle()

                if (!existingStudent) {
                    const { data: newStudent, error: createError } = await (adminSupabase as any)
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
                } else if (!existingStudent.school_id) {
                    // Se o aluno existe mas não tem escola vinculada, vinculamos à escola da turma
                    console.log(`[API_CLASS_STUDENTS] Auto-allocating student ${existingStudent.id} to school ${turma.school_id}`)
                    await (adminSupabase as any)
                        .from('students')
                        .update({ school_id: turma.school_id })
                        .eq('id', existingStudent.id)
                }

                if (existingStudent) {
                    const { error: linkError } = await (adminSupabase as any)
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
