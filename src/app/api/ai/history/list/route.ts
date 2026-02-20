import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { validateAuth } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const auth = await validateAuth()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(req, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.GET)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = await createClient()
        const user = auth.user!

        // Fetch all conversations for the user, only metadata for the list
        const { data: conversations, error } = await (supabase as any)
            .from('ai_conversations')
            .select('id, title, updated_at, user_type')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('Error listing chat history:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(conversations || [])

    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
