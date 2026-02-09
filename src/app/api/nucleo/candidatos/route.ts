import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const schoolId = searchParams.get('schoolId')
        const type = searchParams.get('type') // 'escolar' or 'intercoop'

        const supabase = await createClient()
        const viewName = type === 'intercoop' ? 'vw_candidatos_nucleo_intercoop' : 'vw_candidatos_nucleo_escolar'

        let query = supabase.from(viewName).select('*')

        if (schoolId) {
            query = query.eq('school_id', schoolId)
        }

        const { data, error } = await query.order('score_total', { ascending: false })

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
