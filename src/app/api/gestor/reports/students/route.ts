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

        // Fetch students with all related data
        const { data: students, error } = await supabase
            .from('students')
            .select(`
                id,
                name,
                email,
                grade_level,
                school_id,
                schools(name)
            `)
            .order('name')

        if (error) throw error

        // Fetch class enrollments
        const { data: enrollments } = await supabase
            .from('class_students')
            .select(`
                student_id,
                classes(id, name)
            `)

        // Fetch nucleus memberships
        const { data: nucleusMembers } = await supabase
            .from('nucleus_members')
            .select(`
                student_id,
                role,
                nuclei(name)
            `)

        // Build enrollment and nucleus maps
        const enrollmentMap = new Map<string, { class_id: string; class_name: string }>()
        enrollments?.forEach((e: any) => {
            if (e.classes) {
                enrollmentMap.set(e.student_id, {
                    class_id: e.classes.id,
                    class_name: e.classes.name
                })
            }
        })

        const nucleusMap = new Map<string, { nucleus_name: string; nucleus_role: string }>()
        nucleusMembers?.forEach((n: any) => {
            if (n.nuclei) {
                nucleusMap.set(n.student_id, {
                    nucleus_name: n.nuclei.name,
                    nucleus_role: n.role
                })
            }
        })

        // Enrich student data with cross-references
        const enrichedStudents = (students || []).map((student: any) => {
            const enrollment = enrollmentMap.get(student.id)
            const nucleus = nucleusMap.get(student.id)

            return {
                id: student.id,
                name: student.name,
                email: student.email,
                grade_level: student.grade_level,
                school_id: student.school_id,
                school_name: student.schools?.name || null,
                class_id: enrollment?.class_id || null,
                class_name: enrollment?.class_name || null,
                nucleus_name: nucleus?.nucleus_name || null,
                nucleus_role: nucleus?.nucleus_role || null,
            }
        })

        return NextResponse.json({ success: true, students: enrichedStudents })
    } catch (error: any) {
        console.error('[API_REPORTS_STUDENTS] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
