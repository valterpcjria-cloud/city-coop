import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkIsGestor } from '@/lib/coop-auth'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('coop_eventos')
            .select('*, nucleo:nucleo_gestor_escolar(nome)')
            .order('data_planejada', { ascending: false })

        if (error) throw error
        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('API Error (coop_eventos):', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const body = await request.json()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const isAuthorized = await checkIsGestor(supabase, user)
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Only gestors can create events' }, { status: 403 })
        }

        const { data, error } = await (supabase as any)
            .from('coop_eventos')
            .insert([{
                ...body,
                updated_at: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
