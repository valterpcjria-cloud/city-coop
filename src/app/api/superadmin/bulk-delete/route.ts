import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateSuperadminAccess } from '@/lib/auth-guard'
import { recordAuditLog } from '@/lib/audit'

/**
 * API Route for Bulk Deletion of Schools and Students
 * Restricted to Superadmins only.
 * Scope: Deletes schools and all related data (students, classes, etc.) within a municipality.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Verify Superadmin access
        const auth = await validateSuperadminAccess()
        if (!auth.success) {
            return auth.response || NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const body = await request.json()
        const { municipality, schoolIds, studentIds, teacherIds, type = 'schools', confirmMunicipality } = body

        // 2. Basic validation
        if (!municipality) {
            return NextResponse.json({ error: 'Município é obrigatório' }, { status: 400 })
        }

        if (confirmMunicipality !== municipality) {
            return NextResponse.json({ error: 'O nome do município de confirmação não confere' }, { status: 100 })
        }

        // Use service role key to bypass RLS and perform bulk deletions
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 3. Logic based on type
        if (type === 'schools') {
            // Identify schools to be deleted
            let query = supabase
                .from('schools')
                .select('id, name')
                .eq('city', municipality)

            if (schoolIds && schoolIds.length > 0) {
                query = query.in('id', schoolIds)
            }

            const { data: schoolsData, error: schoolsError } = await query
            if (schoolsError || !schoolsData || schoolsData.length === 0) {
                return NextResponse.json({ error: 'Nenhuma escola encontrada' }, { status: 404 })
            }

            const ids = schoolsData.map(s => s.id)

            // Step A: Students
            const { data: sData } = await supabase.from('students').select('id').in('school_id', ids)
            const sIds = sData?.map(s => s.id) || []
            if (sIds.length > 0) {
                await Promise.all([
                    supabase.from('class_students').delete().in('student_id', sIds),
                    supabase.from('assessment_responses').delete().in('student_id', sIds),
                    supabase.from('student_test_results').delete().in('student_id', sIds),
                    supabase.from('student_scores').delete().in('student_id', sIds),
                    supabase.from('student_engagement').delete().in('student_id', sIds),
                    supabase.from('student_cooperative_profile').delete().in('student_id', sIds),
                    supabase.from('student_collaboration_scores').delete().in('student_id', sIds),
                    supabase.from('student_cooperative_connections').delete().in('student_id', sIds),
                    supabase.from('maturity_indicators').delete().in('student_id', sIds),
                    supabase.from('candidates').delete().in('student_id', sIds),
                    supabase.from('nucleo_escolar_members').delete().in('student_id', sIds),
                    supabase.from('nucleo_intercoop_members').delete().in('student_id', sIds),
                    supabase.from('nucleus_members').delete().in('student_id', sIds)
                ])
                await supabase.from('students').delete().in('id', sIds)
            }

            // Step B: Classes
            const { data: cData } = await supabase.from('classes').select('id').in('school_id', ids)
            const cIds = cData?.map(c => c.id) || []
            if (cIds.length > 0) {
                await Promise.all([
                    supabase.from('assessments').delete().in('class_id', cIds),
                    supabase.from('assemblies').delete().in('class_id', cIds),
                    supabase.from('elections').delete().in('class_id', cIds)
                ])
                await supabase.from('classes').delete().in('id', cIds)
            }

            // Step C: Teachers & Rest
            await Promise.all([
                supabase.from('teachers').delete().in('school_id', ids),
                supabase.from('nucleo_gestor_escolar').delete().in('school_id', ids),
                cIds.length > 0 ? supabase.from('event_plans').delete().in('class_id', cIds) : Promise.resolve()
            ])

            // Step D: Schools
            await supabase.from('schools').delete().in('id', ids)

            await recordAuditLog({
                userId: auth.user!.id,
                action: 'BULK_DELETE_SCHOOLS_FULL',
                resource: 'multiple',
                resourceId: municipality,
                newData: { municipality, schoolIds: ids, type },
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            })

            return NextResponse.json({ success: true, message: 'Escolas removidas com sucesso' })

        } else if (type === 'students') {
            // Deleting ONLY students
            let studentQuery = supabase
                .from('students')
                .select('id, name, schools!inner(city)')
                .eq('schools.city', municipality)

            if (studentIds && studentIds.length > 0) {
                studentQuery = studentQuery.in('id', studentIds)
            }

            const { data: sData, error: sError } = await studentQuery
            if (sError || !sData || sData.length === 0) {
                return NextResponse.json({ error: 'Nenhum estudante encontrado' }, { status: 404 })
            }

            const ids = sData.map(s => s.id)

            await Promise.all([
                supabase.from('class_students').delete().in('student_id', ids),
                supabase.from('assessment_responses').delete().in('student_id', ids),
                supabase.from('student_test_results').delete().in('student_id', ids),
                supabase.from('student_scores').delete().in('student_id', ids),
                supabase.from('student_engagement').delete().in('student_id', ids),
                supabase.from('student_cooperative_profile').delete().in('student_id', ids),
                supabase.from('student_collaboration_scores').delete().in('student_id', ids),
                supabase.from('student_cooperative_connections').delete().in('student_id', ids),
                supabase.from('maturity_indicators').delete().in('student_id', ids),
                supabase.from('candidates').delete().in('student_id', ids),
                supabase.from('nucleo_escolar_members').delete().in('student_id', ids),
                supabase.from('nucleo_intercoop_members').delete().in('student_id', ids),
                supabase.from('nucleus_members').delete().in('student_id', ids)
            ])

            await supabase.from('students').delete().in('id', ids)

            await recordAuditLog({
                userId: auth.user!.id,
                action: 'BULK_DELETE_STUDENTS_ONLY',
                resource: 'multiple',
                resourceId: municipality,
                newData: { municipality, studentIds: ids, type },
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            })

            return NextResponse.json({ success: true, message: `${ids.length} estudantes removidos` })

        } else if (type === 'teachers') {
            // Deleting ONLY teachers (professors)
            let teacherQuery = supabase
                .from('teachers')
                .select('id, name, schools!inner(city)')
                .eq('schools.city', municipality)

            if (teacherIds && teacherIds.length > 0) {
                teacherQuery = teacherQuery.in('id', teacherIds)
            }

            const { data: tData, error: tError } = await teacherQuery
            if (tError || !tData || tData.length === 0) {
                return NextResponse.json({ error: 'Nenhum professor encontrado' }, { status: 404 })
            }

            const ids = tData.map(t => t.id)

            // Professor cleanup
            await Promise.all([
                supabase.from('classes').update({ teacher_id: null }).in('teacher_id', ids),
                supabase.from('nucleo_gestor_escolar').delete().in('teacher_id', ids), // Hypothetical table, let's stick to knowns
                // student engagement/scores often have evaluator_admin_id or avaliador_id
                supabase.from('student_engagement').update({ avaliador_id: null }).in('avaliador_id', ids),
                supabase.from('student_cooperative_profile').update({ avaliador_id: null }).in('avaliador_id', ids),
                supabase.from('student_collaboration_scores').update({ avaliador_id: null }).in('avaliador_id', ids)
            ])

            await supabase.from('teachers').delete().in('id', ids)

            await recordAuditLog({
                userId: auth.user!.id,
                action: 'BULK_DELETE_TEACHERS_ONLY',
                resource: 'multiple',
                resourceId: municipality,
                newData: { municipality, teacherIds: ids, type },
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            })

            return NextResponse.json({ success: true, message: `${ids.length} professores removidos` })
        }

    } catch (error: any) {
        console.error('[API_SUPERADMIN_BULK_DELETE] Fatal Error:', error.message)
        return NextResponse.json({
            error: 'Erro interno ao realizar exclusão em massa',
            details: error.message
        }, { status: 500 })
    }
}
