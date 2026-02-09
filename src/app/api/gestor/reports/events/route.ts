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

        const { data: events, error } = await supabase
            .from('event_plans')
            .select(`
                id,
                title,
                status,
                budget,
                created_at,
                class_id,
                classes(name, school_id, schools(name))
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        const enriched = (events || []).map((event: any) => ({
            id: event.id,
            title: event.title,
            status: event.status,
            budget_total: event.budget?.total || null,
            created_at: event.created_at,
            class_name: event.classes?.name || null,
            school_name: event.classes?.schools?.name || null,
        }))

        return NextResponse.json({ success: true, events: enriched })
    } catch (error: any) {
        console.error('[API_REPORTS_EVENTS] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
