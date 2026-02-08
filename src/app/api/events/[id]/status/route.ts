import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params
        const body = await request.json()
        const { status } = body

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const updates: any = {
            status,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id
        }

        const { error } = await (supabase as any)
            .from('event_plans')
            .update(updates)
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Error updating status:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
