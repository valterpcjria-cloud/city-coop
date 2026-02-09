import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkIsGestor } from '@/lib/coop-auth'

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
        console.error('API Error (cooperatives GET):', error.message)
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
            return NextResponse.json({ error: 'Only gestors can add cooperatives' }, { status: 403 })
        }

        const { data, error } = await (supabase as any)
            .from('cooperatives')
            .insert([
                {
                    ...body,
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        console.error('API Error (cooperatives POST):', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
