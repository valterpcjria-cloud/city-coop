import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkIsGestor } from '@/lib/coop-auth'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const isAuthorized = await checkIsGestor(supabase, user)
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Only gestors can delete cycles' }, { status: 403 })
        }

        const { error } = await supabase
            .from('test_cycles')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params
        const body = await request.json()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const isAuthorized = await checkIsGestor(supabase, user)
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Only gestors can modify cycles' }, { status: 403 })
        }

        const { data, error } = await (supabase as any)
            .from('test_cycles')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
