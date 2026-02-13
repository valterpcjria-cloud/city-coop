import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateGestorAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { validate, schoolSchema } from '@/lib/validators'

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

        const { schools } = await request.json()

        if (!schools || !Array.isArray(schools)) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const results = {
            success: 0,
            skipped: 0,
            errors: [] as string[]
        }

        // Process in batches or one by one for simplicity and detailed error reporting
        for (const schoolData of schools) {
            try {
                // Generate a unique internal code based on INEP if not provided
                if (!schoolData.code && schoolData.inep_code) {
                    schoolData.code = `INEP${schoolData.inep_code}`
                } else if (!schoolData.code) {
                    schoolData.code = `IMP${Math.random().toString(36).substring(2, 7).toUpperCase()}`
                }

                // Validation
                const validation = validate(schoolSchema, schoolData)
                if (!validation.success) {
                    results.errors.push(`Escola "${schoolData.name}": ${validation.errors?.join(', ')}`)
                    continue
                }

                const data = validation.data!

                // Check for duplicate INEP code
                if (data.inep_code) {
                    const { data: existing } = await supabase
                        .from('schools')
                        .select('id')
                        .eq('inep_code', data.inep_code)
                        .maybeSingle()

                    if (existing) {
                        results.skipped++
                        continue
                    }
                }

                // Insert
                const { error } = await supabase
                    .from('schools')
                    .insert({
                        name: data.name,
                        code: data.code,
                        inep_code: data.inep_code || null,
                        administrative_category: data.administrative_category || null,
                        education_stages: data.education_stages || [],
                        location_type: data.location_type || null,
                        director_name: data.director_name || null,
                        cep: data.cep || null,
                        city: data.city || null,
                        state: data.state || null,
                        neighborhood: data.neighborhood || null,
                        address: data.address || null,
                        address_number: data.address_number || null,
                        address_complement: data.address_complement || null,
                        phone: data.phone || null,
                        secondary_phone: data.secondary_phone || null,
                        email: data.email || null,
                        website: data.website || null
                    })

                if (error) throw error
                results.success++

            } catch (err: any) {
                console.error(`Error importing school ${schoolData.name}:`, err.message)
                results.errors.push(`Erro na escola "${schoolData.name}": ${err.message}`)
            }
        }

        return NextResponse.json({
            success: true,
            summary: results
        })

    } catch (error: any) {
        console.error('[API_SCHOOLS_IMPORT] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
