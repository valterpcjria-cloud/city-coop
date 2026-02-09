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

        const { data: classes, error } = await supabase
            .from('classes')
            .select(`
                id,
                name,
                modality,
                status,
                school_id,
                teacher_id,
                schools(name),
                teachers(name)
            `)
            .order('name')

        if (error) throw error

        // Fetch student counts per class
        const { data: classStudents } = await supabase
            .from('class_students')
            .select('class_id')

        const countMap = new Map<string, number>()
        classStudents?.forEach((cs: any) => {
            countMap.set(cs.class_id, (countMap.get(cs.class_id) || 0) + 1)
        })

        const enriched = (classes || []).map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            modality: cls.modality,
            status: cls.status,
            school_name: cls.schools?.name || null,
            teacher_name: cls.teachers?.name || null,
            student_count: countMap.get(cls.id) || 0,
        }))

        return NextResponse.json({ success: true, classes: enriched })
    } catch (error: any) {
        console.error('[API_REPORTS_CLASSES] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
