import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('cooperatives')
            .select('*')
            .order('nome_fantasia', { ascending: true })

        if (error) throw error
        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('API Error (cooperatives):', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
