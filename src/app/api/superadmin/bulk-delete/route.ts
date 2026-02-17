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
        const { municipality, schoolIds, confirmMunicipality } = body

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

        // 3. Identify schools to be deleted
        let query = supabase
            .from('schools')
            .select('id, name')
            .eq('city', municipality)

        // If specific school IDs are provided, filter by them (still within the municipality)
        if (schoolIds && schoolIds.length > 0) {
            query = query.in('id', schoolIds)
        }

        const { data: schoolsData, error: schoolsError } = await query
        if (schoolsError) {
            console.error('[BULK_DELETE] Error fetching schools:', schoolsError)
            return NextResponse.json({ error: 'Erro ao buscar escolas para exclusão' }, { status: 500 })
        }

        if (!schoolsData || schoolsData.length === 0) {
            return NextResponse.json({ error: 'Nenhuma escola encontrada para os critérios fornecidos' }, { status: 404 })
        }

        const ids = schoolsData.map(s => s.id)
        const schoolNames = schoolsData.map(s => s.name)

        console.log(`[BULK_DELETE] Starting bulk deletion for ${ids.length} schools in ${municipality}`)

        // 4. Recursive deletion sequence
        // We perform deletions in an order that respects typical foreign key constraints

        // --- STEP A: IDENTIFY STUDENTS ---
        const { data: studentsData } = await supabase
            .from('students')
            .select('id')
            .in('school_id', ids)

        const studentIds = studentsData?.map(s => s.id) || []

        if (studentIds.length > 0) {
            console.log(`[BULK_DELETE] Deleting data for ${studentIds.length} students`)
            // Delete student-related records across all specialized tables
            await Promise.all([
                supabase.from('class_students').delete().in('student_id', studentIds),
                supabase.from('assessment_responses').delete().in('student_id', studentIds),
                supabase.from('student_test_results').delete().in('student_id', studentIds),
                supabase.from('student_scores').delete().in('student_id', studentIds),
                supabase.from('student_engagement').delete().in('student_id', studentIds),
                supabase.from('student_cooperative_profile').delete().in('student_id', studentIds),
                supabase.from('student_collaboration_scores').delete().in('student_id', studentIds),
                supabase.from('student_cooperative_connections').delete().in('student_id', studentIds),
                supabase.from('maturity_indicators').delete().in('student_id', studentIds),
                supabase.from('candidates').delete().in('student_id', studentIds),
                supabase.from('nucleo_escolar_members').delete().in('student_id', studentIds),
                supabase.from('nucleo_intercoop_members').delete().in('student_id', studentIds),
                supabase.from('nucleus_members').delete().in('student_id', studentIds)
            ])

            // Delete the student records themselves
            await supabase.from('students').delete().in('id', studentIds)
        }

        // --- STEP B: IDENTIFY CLASSES ---
        const { data: classesData } = await supabase
            .from('classes')
            .select('id')
            .in('school_id', ids)

        const classIds = classesData?.map(c => c.id) || []

        if (classIds.length > 0) {
            console.log(`[BULK_DELETE] Deleting data for ${classIds.length} classes`)
            // Delete class-related records
            await Promise.all([
                supabase.from('assessments').delete().in('class_id', classIds),
                supabase.from('assemblies').delete().in('class_id', classIds),
                supabase.from('elections').delete().in('class_id', classIds)
            ])

            // Delete the class records themselves
            await supabase.from('classes').delete().in('id', classIds)
        }

        // --- STEP C: OTHER RELATED DATA ---
        console.log('[BULK_DELETE] Deleting teachers, nuclei, and other related data')
        await Promise.all([
            supabase.from('teachers').delete().in('school_id', ids),
            supabase.from('nucleo_gestor_escolar').delete().in('school_id', ids),
            supabase.from('event_plans').delete().in('class_id', classIds) // Some event_plans might be linked to classes
        ])

        // --- STEP D: THE SCHOOLS THEMSELVES ---
        console.log(`[BULK_DELETE] Finalizing deletion of ${ids.length} schools`)
        const { error: finalError } = await supabase
            .from('schools')
            .delete()
            .in('id', ids)

        if (finalError) {
            console.error('[BULK_DELETE] Error in final school deletion:', finalError)
            throw finalError
        }

        // 5. record Audit log
        await recordAuditLog({
            userId: auth.user!.id,
            action: 'BULK_DELETE_SCHOOLS_STUDENTS',
            resource: 'multiple',
            resourceId: municipality,
            newData: {
                municipality,
                schoolIds: ids,
                schoolNames,
                studentsAffected: studentIds.length,
                classesAffected: classIds.length
            },
            ip: request.headers.get('x-forwarded-for') || 'unknown'
        })

        return NextResponse.json({
            success: true,
            message: 'Exclusão em massa realizada com sucesso',
            details: {
                schoolsDeleted: ids.length,
                studentsDeleted: studentIds.length,
                classesDeleted: classIds.length
            }
        })

    } catch (error: any) {
        console.error('[API_SUPERADMIN_BULK_DELETE] Fatal Error:', error.message)
        return NextResponse.json({
            error: 'Erro interno ao realizar exclusão em massa',
            details: error.message
        }, { status: 500 })
    }
}
