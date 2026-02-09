import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkIsGestor } from '@/lib/coop-auth'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data, error } = await (supabase as any)
            .from('test_cycles')
            .select('*, cycle_tests(*, test_questions(*))')
            .order('numero_ciclo', { ascending: true })

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const body = await request.json()

        // Check if user is gestor
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const isAuthorized = await checkIsGestor(supabase, user)
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Only gestors can create cycles' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('test_cycles')
            .insert(body)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
