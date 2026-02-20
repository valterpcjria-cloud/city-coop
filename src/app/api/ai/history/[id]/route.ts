import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { validateAuth } from '@/lib/auth-guard'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await validateAuth()
        if (!auth.success) return auth.response!

        // Ensure params.id is awaited if necessary in future Next versions, 
        // but here it's fine as standard dynamic route
        const conversationId = params.id

        const supabase = await createClient()
        const user = auth.user!

        const { data: conversation, error } = await (supabase as any)
            .from('ai_conversations')
            .select('*')
            .eq('id', conversationId)
            .eq('user_id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
            }
            console.error('Error fetching specific chat:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(conversation)

    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
