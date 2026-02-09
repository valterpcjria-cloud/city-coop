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

        const { data: elections, error } = await supabase
            .from('elections')
            .select(`
                id,
                status,
                voting_start,
                voting_end,
                class_id,
                classes(name, school_id, schools(name))
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Fetch candidate and vote counts
        const { data: candidatures } = await supabase.from('candidaturas').select('id, eleicao_id')
        const { data: votes } = await supabase.from('votos').select('id, eleicao_id')

        const candidateCount = new Map<string, number>()
        const voteCount = new Map<string, number>()

        candidatures?.forEach((c: any) => {
            candidateCount.set(c.eleicao_id, (candidateCount.get(c.eleicao_id) || 0) + 1)
        })
        votes?.forEach((v: any) => {
            voteCount.set(v.eleicao_id, (voteCount.get(v.eleicao_id) || 0) + 1)
        })

        const enriched = (elections || []).map((election: any) => ({
            id: election.id,
            status: election.status,
            voting_start: election.voting_start,
            voting_end: election.voting_end,
            class_name: election.classes?.name || null,
            school_name: election.classes?.schools?.name || null,
            total_candidates: candidateCount.get(election.id) || 0,
            total_votes: voteCount.get(election.id) || 0,
        }))

        return NextResponse.json({ success: true, elections: enriched })
    } catch (error: any) {
        console.error('[API_REPORTS_ELECTIONS] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
