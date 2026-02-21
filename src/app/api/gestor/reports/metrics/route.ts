import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateGestorAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { reportFilterSchema, getZodErrorResponse } from '@/lib/validators'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
    try {
        // Auth validation
        const auth = await validateGestorAccess()
        if (!auth.success) return auth.response!

        // Rate limiting
        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.GET)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { searchParams } = new URL(request.url)
        const filters = {
            startDate: searchParams.get('startDate'),
            endDate: searchParams.get('endDate'),
            schoolId: searchParams.get('schoolId'),
            classId: searchParams.get('classId'),
            groupBy: searchParams.get('groupBy') || 'day'
        }

        const filterValidation = reportFilterSchema.safeParse(filters)
        if (!filterValidation.success) {
            return NextResponse.json(getZodErrorResponse(filterValidation.error), { status: 400 })
        }

        // Fetch metrics via RPC for maximum scalability
        const [
            platformRes,
            studentsByGradeRes,
            classesByModalityRes,
            eventsByStatusRes,
        ] = await Promise.all([
            supabase.rpc('get_platform_metrics'),
            supabase.rpc('get_students_by_grade'),
            supabase.rpc('get_classes_by_modality'),
            supabase.rpc('get_events_by_status_formatted'),
        ])

        if (platformRes.error) throw platformRes.error
        if (studentsByGradeRes.error) throw studentsByGradeRes.error
        if (classesByModalityRes.error) throw classesByModalityRes.error
        if (eventsByStatusRes.error) throw eventsByStatusRes.error

        const p = platformRes.data

        return NextResponse.json({
            success: true,
            metrics: {
                totalSchools: p.total_schools,
                totalTeachers: p.total_teachers,
                totalStudents: p.total_students,
                totalClasses: p.total_classes,
                activeClasses: p.active_classes,
                completedClasses: p.completed_classes,
                approvedEvents: p.approved_events,
                pendingEvents: p.pending_events,
                rejectedEvents: p.rejected_events,
                studentsByGrade: studentsByGradeRes.data,
                eventsByStatus: eventsByStatusRes.data,
                classesByModality: classesByModalityRes.data,
            }
        })
    } catch (error: any) {
        logger.error('[API_REPORTS_METRICS] Fatal error', error)
        return NextResponse.json({ error: 'Erro ao gerar métricas do dashboard' }, { status: 500 })
    }
}
