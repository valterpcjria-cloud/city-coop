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
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.GET)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Fetch schools with related counts
        const { data: schools, error } = await supabase
            .from('schools')
            .select('id, name, code, city, state')
            .order('name')

        if (error) throw error

        // For each school, get counts
        const enrichedSchools = await Promise.all(
            (schools || []).map(async (school) => {
                const [teachersRes, studentsRes, classesRes] = await Promise.all([
                    supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
                    supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
                    supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
                ])

                return {
                    ...school,
                    teacherCount: teachersRes.count || 0,
                    studentCount: studentsRes.count || 0,
                    classCount: classesRes.count || 0,
                }
            })
        )

        return NextResponse.json({ success: true, schools: enrichedSchools })
    } catch (error: any) {
        console.error('[API_REPORTS_SCHOOLS] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
