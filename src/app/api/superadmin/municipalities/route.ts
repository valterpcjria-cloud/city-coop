import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateSuperadminAccess } from '@/lib/auth-guard'

/**
 * Specialized API for Superadmins to get schools grouped by municipality.
 */
export async function GET(request: NextRequest) {
    try {
        const auth = await validateSuperadminAccess()
        if (!auth.success) {
            return auth.response || NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const city = searchParams.get('city')
        const type = searchParams.get('type') || 'schools' // schools, students, teachers
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '25')
        const offset = (page - 1) * limit

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // If a specific city is requested, return paginated results for that city and type
        if (city) {
            let dataQuery: any

            if (type === 'students') {
                // To get students by city, we need to join with schools
                dataQuery = supabase
                    .from('students')
                    .select('id, name, school_id, schools!inner(name, city)', { count: 'exact' })
                    .eq('schools.city', city)
                    .order('name', { ascending: true })
            } else if (type === 'teachers') {
                // To get teachers by city, we need to join with schools
                dataQuery = supabase
                    .from('teachers')
                    .select('id, name, school_id, schools!inner(name, city)', { count: 'exact' })
                    .eq('schools.city', city)
                    .order('name', { ascending: true })
            } else {
                // Default: schools
                dataQuery = supabase
                    .from('schools')
                    .select('id, name, city', { count: 'exact' })
                    .eq('city', city)
                    .order('name', { ascending: true })
            }

            const { data: results, error, count } = await dataQuery.range(offset, offset + limit - 1)

            if (error) throw error

            return NextResponse.json({
                success: true,
                results: results || [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            })
        }

        // Otherwise return the list of unique municipalities
        const { data: schools, error } = await supabase
            .from('schools')
            .select('city')
            .order('city', { ascending: true })

        if (error) throw error

        // Get unique cities and filter out nulls
        const uniqueCities = Array.from(new Set(schools?.map(s => s.city).filter(Boolean)))

        return NextResponse.json({
            success: true,
            municipalities: uniqueCities
        })
    } catch (error: any) {
        console.error('[API_SUPERADMIN_MUNICIPALITIES] Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
