import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateGestorAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { validate, schoolSchema, schoolUpdateSchema, isValidUUID } from '@/lib/validators'

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

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '25')
        const offset = (page - 1) * limit

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: schools, error, count } = await supabase
            .from('schools')
            .select('*', { count: 'exact' })
            .order('name', { ascending: true })
            .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
            success: true,
            schools,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        })
    } catch (error: any) {
        console.error('[API_SCHOOLS_GET] Error:', error.message)
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

        const body = await request.json()

        // Input validation
        const validation = validate(schoolSchema, body)
        if (!validation.success) {
            return NextResponse.json({ error: validation.errors?.join(', ') }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const data = validation.data!

        // Check if code already exists
        const { data: existing } = await supabase
            .from('schools')
            .select('id')
            .eq('code', data.code)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Já existe uma escola com este código' }, { status: 400 })
        }

        // Check if INEP code already exists (if provided)
        if (data.inep_code) {
            const { data: existingInep } = await supabase
                .from('schools')
                .select('id')
                .eq('inep_code', data.inep_code)
                .single()

            if (existingInep) {
                return NextResponse.json({ error: 'Já existe uma escola com este código INEP' }, { status: 400 })
            }
        }

        const { data: school, error } = await supabase
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
            .select()
            .single()

        if (error) throw error

        console.log(`[API_SCHOOLS_POST] School created by gestor ${auth.user?.id}: ${school.id}`)
        return NextResponse.json({ success: true, school })
    } catch (error: any) {
        console.error('[API_SCHOOLS_POST] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Auth validation
        const auth = await validateGestorAccess()
        if (!auth.success) return auth.response!

        // Rate limiting
        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.PUT)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const body = await request.json()

        // Input validation
        const validation = validate(schoolUpdateSchema, body)
        if (!validation.success) {
            return NextResponse.json({ error: validation.errors?.join(', ') }, { status: 400 })
        }

        const data = validation.data!

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Check if code already exists for another school
        const { data: existing } = await supabase
            .from('schools')
            .select('id')
            .eq('code', data.code)
            .neq('id', data.id)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Já existe outra escola com este código' }, { status: 400 })
        }

        // Check if INEP code already exists for another school
        if (data.inep_code) {
            const { data: existingInep } = await supabase
                .from('schools')
                .select('id')
                .eq('inep_code', data.inep_code)
                .neq('id', data.id)
                .single()

            if (existingInep) {
                return NextResponse.json({ error: 'Já existe outra escola com este código INEP' }, { status: 400 })
            }
        }

        const { data: school, error } = await supabase
            .from('schools')
            .update({
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
                website: data.website || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', data.id)
            .select()
            .single()

        if (error) throw error

        console.log(`[API_SCHOOLS_PUT] School updated by gestor ${auth.user?.id}: ${school.id}`)
        return NextResponse.json({ success: true, school })
    } catch (error: any) {
        console.error('[API_SCHOOLS_PUT] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Auth validation
        const auth = await validateGestorAccess()
        if (!auth.success) return auth.response!

        // Rate limiting
        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.DELETE)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id || !isValidUUID(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Check if school has teachers or students
        const { count: teacherCount } = await supabase
            .from('teachers')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', id)

        const { count: studentCount } = await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', id)

        if ((teacherCount || 0) > 0 || (studentCount || 0) > 0) {
            return NextResponse.json({
                error: `Não é possível excluir. Esta escola tem ${teacherCount || 0} professor(es) e ${studentCount || 0} aluno(s) vinculados.`
            }, { status: 400 })
        }

        const { error } = await supabase
            .from('schools')
            .delete()
            .eq('id', id)

        if (error) throw error

        console.log(`[API_SCHOOLS_DELETE] School deleted by gestor ${auth.user?.id}: ${id}`)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[API_SCHOOLS_DELETE] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
