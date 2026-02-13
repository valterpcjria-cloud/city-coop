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

            console.log(`[API_RESET_PASSWORD] Manual reset attempt for user_id: ${user_id}`)

            const { error } = await supabase.auth.admin.updateUserById(user_id, {
                password: password
            })

            if (error) {
                console.error(`[API_RESET_PASSWORD] Manual reset error for ${user_id}:`, error.message)
                throw error
            }

            console.log(`[API_RESET_PASSWORD] Manual reset success for user_id: ${user_id}`)

            return NextResponse.json({
                success: true,
                message: 'Senha alterada com sucesso'
            })
        } else {
            // Email-based password reset
            if (!email) {
                return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
            }

            console.log(`[API_RESET_PASSWORD] Email reset request for: ${email}`)

            // Use resetPasswordForEmail which actually sends the email
            // Note: This uses the client created with service role, so it should bypass rate limits or email provider restrictions if configured correctly in Supabase
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${request.nextUrl.origin}/reset-password`,
            })

            if (error) {
                console.error(`[API_RESET_PASSWORD] Email reset error for ${email}:`, error.message)
                throw error
            }

            console.log(`[API_RESET_PASSWORD] Email reset success for: ${email}`)

            return NextResponse.json({
                success: true,
                message: 'Link de recuperação enviado com sucesso para o email cadastrado'
            })
        }
    } catch (error: any) {
        console.error('[API_RESET_PASSWORD] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
