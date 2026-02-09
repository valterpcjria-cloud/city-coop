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

        const { data: dbSettings, error } = await supabase
            .from('system_settings')
            .select('*')
            .order('key')

        if (error) throw error

        // Default skeleton if DB is empty or missing specific keys
        const defaults = [
            {
                key: 'anthropic_api_key',
                value: process.env.ANTHROPIC_API_KEY ? `sk-ant-***${process.env.ANTHROPIC_API_KEY.slice(-4)}` : '',
                description: 'Chave de API da Anthropic (Claude)',
                updated_at: new Date().toISOString()
            },
            {
                key: 'openai_api_key',
                value: process.env.OPENAI_API_KEY ? `sk-***${process.env.OPENAI_API_KEY.slice(-4)}` : '',
                description: 'Chave de API da OpenAI (GPT-4)',
                updated_at: new Date().toISOString()
            }
        ]

        // Merge DB settings with defaults
        const mergedSettings = defaults.map(def => {
            const dbItem = dbSettings?.find(s => s.key === def.key)
            return dbItem ? { ...def, ...dbItem } : def
        })

        return NextResponse.json({ success: true, settings: mergedSettings })
    } catch (error: any) {
        console.error('[API_SETTINGS_GET] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        // Auth validation
        const auth = await validateGestorAccess()
        if (!auth.success) return auth.response!

        // Rate limiting
        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { settings } = await request.json()

        if (!Array.isArray(settings)) {
            return NextResponse.json({ error: 'Formato de configurações inválido' }, { status: 400 })
        }

        // Validate settings keys
        const allowedKeys = ['anthropic_api_key', 'openai_api_key', 'default_model', 'max_tokens']
        for (const item of settings) {
            if (!allowedKeys.includes(item.key)) {
                console.warn(`[API_SETTINGS_POST] Blocked invalid key: ${item.key}`)
                continue
            }

            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    key: item.key,
                    value: item.value,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
        }

        console.log(`[API_SETTINGS_POST] Settings updated by gestor ${auth.user?.id}`)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[API_SETTINGS_POST] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
