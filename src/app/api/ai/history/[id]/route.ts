import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { validateAuth } from '@/lib/auth-guard'
import { uuidSchema, getZodErrorResponse } from '@/lib/validators'
import { logger } from '@/lib/logger'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // 1. Validate ID
        const idValidation = uuidSchema.safeParse(id)
        if (!idValidation.success) {
            return NextResponse.json(getZodErrorResponse(idValidation.error), { status: 400 })
        }

        const auth = await validateAuth()
        if (!auth.success) return auth.response!

        const supabase = await createClient()
        const user = auth.user!

        const { data: conversation, error } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
            }
            logger.error('[API_AI_HISTORY_ID] GET Error', { ...error, conversationId: id })
            return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
        }

        return NextResponse.json(conversation)

    } catch (error: any) {
        logger.error('[API_AI_HISTORY_ID] Fatal error', { error })
        return NextResponse.json({ error: 'Erro inesperado no servidor' }, { status: 500 })
    }
}
