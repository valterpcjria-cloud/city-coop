import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { calculateStudentIndicators } from '@/lib/indicators'
import { validateProfessorAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { recordAuditLog } from '@/lib/audit'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await validateProfessorAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = await createClient()
        const { id: classId } = await params

        const { data: students } = await (supabase
            .from('class_students') as any)
            .select('student_id')
            .eq('class_id', classId)

        if (students) {
            for (const s of students) {
                await calculateStudentIndicators(s.student_id, classId)
            }
        }

        const response = NextResponse.json({ success: true, message: 'Indicators updated' })

        // Audit log
        await recordAuditLog({
            userId: auth.user!.id,
            action: 'RECALCULATE_CLASS_INDICATORS',
            resource: 'classes',
            resourceId: classId,
            ip: request.headers.get('x-forwarded-for') || 'unknown'
        })

        return response

    } catch (error: any) {
        console.error('Error recalculating:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
