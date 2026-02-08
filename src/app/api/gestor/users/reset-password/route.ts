import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateSuperadminAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'

/**
 * POST - Send password reset email
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await validateSuperadminAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Generate password reset link
        const { error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email
        })

        if (error) {
            console.error('[API_RESET_PASSWORD] Error:', error.message)
            throw error
        }

        return NextResponse.json({
            success: true,
            message: 'Link de recuperação enviado com sucesso'
        })
    } catch (error: any) {
        console.error('[API_RESET_PASSWORD] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
