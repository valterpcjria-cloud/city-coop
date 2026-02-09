import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('nucleo_gestor_escolar')
            .select('id, nome, school_id')
            .eq('status', 'Ativo')
            .order('nome')

        if (error) throw error
        return NextResponse.json(data || [])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
