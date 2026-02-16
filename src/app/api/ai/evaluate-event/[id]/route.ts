import { createClient } from '@/lib/supabase/server'
import { evaluateEventPlan } from '@/lib/ai/anthropic'
import { NextResponse, NextRequest } from 'next/server'
import { validateProfessorAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { recordAuditLog } from '@/lib/audit'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await validateProfessorAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.AI)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = await createClient()
        const { id } = await params // Event Plan ID

        // Fetch Plan
        const { data: plan } = await (supabase as any)
            .from('event_plans')
            .select('*')
            .eq('id', id)
            .single()

        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

        // Generate AI Evaluation
        const feedback = await evaluateEventPlan(plan)

        // Save Feedback
        const { error } = await (supabase as any)
            .from('event_plans')
            .update({
                ai_evaluation: {
                    feedback,
                    evaluated_at: new Date().toISOString()
                }
            })
            .eq('id', id)

        if (error) throw error

        // Audit log
        await recordAuditLog({
            userId: auth.user!.id,
            action: 'AI_EVALUATE_EVENT',
            resource: 'event_plans',
            resourceId: id,
            ip: request.headers.get('x-forwarded-for') || 'unknown'
        })

        return NextResponse.json({ success: true, feedback })

    } catch (error: any) {
        console.error('Error in AI evaluation:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
