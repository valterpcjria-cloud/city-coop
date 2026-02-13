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
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const { email, user_id, password } = await request.json()

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        if (password) {
            // Manual password reset
            if (!user_id) {
                return NextResponse.json({ error: 'ID do usuário é obrigatório para reset manual' }, { status: 400 })
            }

            const { error } = await supabase.auth.admin.updateUserById(user_id, {
                password: password
            })

            if (error) {
                console.error('[API_RESET_PASSWORD] Manual error:', error.message)
                throw error
            }

            return NextResponse.json({
                success: true,
                message: 'Senha alterada com sucesso'
            })
        } else {
            // Email-based password reset
            if (!email) {
                return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
            }

            // Generate password reset link
            const { error } = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email
            })

            if (error) {
                console.error('[API_RESET_PASSWORD] Email link error:', error.message)
                throw error
            }

            return NextResponse.json({
                success: true,
                message: 'Link de recuperação enviado com sucesso'
            })
        }
    } catch (error: any) {
        console.error('[API_RESET_PASSWORD] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
