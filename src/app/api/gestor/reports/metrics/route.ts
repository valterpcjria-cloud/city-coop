import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateGestorAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'

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

        // Fetch counts in parallel
        const [
            schoolsRes,
            teachersRes,
            studentsRes,
            classesRes,
            eventsRes,
        ] = await Promise.all([
            supabase.from('schools').select('id', { count: 'exact', head: true }),
            supabase.from('teachers').select('id', { count: 'exact', head: true }),
            supabase.from('students').select('id, grade_level'),
            supabase.from('classes').select('id, status, modality'),
            supabase.from('event_plans').select('id, status'),
        ])

        // Calculate class stats
        const classes = classesRes.data || []
        const activeClasses = classes.filter(c => c.status === 'active').length
        const completedClasses = classes.filter(c => c.status === 'completed').length

        // Calculate event stats
        const events = eventsRes.data || []
        const approvedEvents = events.filter(e => e.status === 'approved').length
        const pendingEvents = events.filter(e => e.status === 'submitted' || e.status === 'draft').length
        const rejectedEvents = events.filter(e => e.status === 'rejected').length

        // Students by grade
        const students = studentsRes.data || []
        const gradeMap: Record<string, number> = {}
        students.forEach(s => {
            gradeMap[s.grade_level] = (gradeMap[s.grade_level] || 0) + 1
        })
        const studentsByGrade = Object.entries(gradeMap).map(([name, value]) => ({ name, value }))

        // Events by status
        const statusMap: Record<string, number> = {}
        events.forEach(e => {
            const label = e.status === 'approved' ? 'Aprovados' :
                e.status === 'rejected' ? 'Rejeitados' :
                    e.status === 'executed' ? 'Executados' : 'Pendentes'
            statusMap[label] = (statusMap[label] || 0) + 1
        })
        const eventsByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

        // Classes by modality
        const modalityMap: Record<string, number> = {}
        classes.forEach(c => {
            modalityMap[c.modality] = (modalityMap[c.modality] || 0) + 1
        })
        const classesByModality = Object.entries(modalityMap).map(([name, value]) => ({ name, value }))

        return NextResponse.json({
            success: true,
            metrics: {
                totalSchools: schoolsRes.count || 0,
                totalTeachers: teachersRes.count || 0,
                totalStudents: students.length,
                totalClasses: classes.length,
                activeClasses,
                completedClasses,
                approvedEvents,
                pendingEvents,
                rejectedEvents,
                studentsByGrade,
                eventsByStatus,
                classesByModality,
            }
        })
    } catch (error: any) {
        console.error('[API_REPORTS_METRICS] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
