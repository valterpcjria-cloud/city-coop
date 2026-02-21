import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { validateAuth } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

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

        const { data: conversation, error } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
            console.error('Error fetching chat history:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(conversation || null)

    } catch (error: any) {
        logger.error('[API_AI_HISTORY] GET Fatal error', error)
        return NextResponse.json({ error: 'Erro ao buscar histórico de conversas' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const auth = await validateAuth()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(req, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.DELETE)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = await createClient()
        const user = auth.user!

        const { error } = await supabase
            .from('ai_conversations')
            .delete()
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        logger.error('[API_AI_HISTORY] DELETE Fatal error', error)
        return NextResponse.json({ error: 'Erro ao limpar histórico' }, { status: 500 })
    }
}
